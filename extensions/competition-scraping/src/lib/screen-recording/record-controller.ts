// Screen-recording controller — P-45 Build #1a (2026-05-22).
//
// State machine for getDisplayMedia + MediaRecorder-driven screen capture.
// Per CAPTURED_VIDEOS_DESIGN.md §C.12 the controller owns the lifecycle
// from start to stopped-or-cancelled and emits a final webm Blob to the
// orchestrator's onStopped callback.
//
// Dependencies (getDisplayMedia, MediaRecorder, timers, perf clock) are
// injected via the RecordControllerDeps surface so the state machine, MIME
// picker, region validator, and timer book-keeping are all unit-testable
// with node:test (no JSDOM, no Chrome runtime).
//
// SCOPE (1a vs. 1b per the §C.20 ship checklist split locked this session):
//   1a (THIS file) — recording engine + state machine + MIME selection +
//   region validation. Records the full picked tab (no canvas-crop yet).
//   The `region` input is validated + carried through to onStopped so the
//   downstream save flow can persist width/height metadata.
//
//   1b — canvas-crop region constraint (drawImage rAF loop +
//   canvas.captureStream merge with audio track) lands here as an internal
//   extension; the public interface stays the same so the orchestrator
//   wiring landed in 1b doesn't need to change again.

import ysFixWebmDuration from 'fix-webm-duration';

import type { Rect } from '../region-screenshot.ts';

// ─── Constants ─────────────────────────────────────────────────────────

/** Preference-ordered list of webm codec strings tried at MediaRecorder
 *  construction time. vp9 is the canonical default (matches Chrome's
 *  native screen-recording UX); vp8 fallback covers older Chromium
 *  variants; plain webm is the last-resort always-supported choice. */
export const RECORDING_MIMETYPE_PREFERENCES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
] as const;

/** Target bitrate for the video track. At 720p × 30fps this lands between
 *  visual-quality acceptable and file-size manageable; a 3-min recording
 *  at this bitrate caps near 56 MB worst-case (under the §A.10 100 MB
 *  Supabase bucket cap). */
export const VIDEO_BITS_PER_SECOND_DEFAULT = 2_500_000;

/** Hard cap on recording duration. The auto-stop timer fires here. */
export const MAX_DURATION_SECONDS_DEFAULT = 180;

/** Minimum dimension (pixels) for a valid recording region. Below this the
 *  encoder rejects or the visual output is useless. Mirrors the
 *  region-screenshot module's MIN_REGION_DIMENSION_PX. */
export const MIN_REGION_DIMENSION_PX = 8;

/** Interval (ms) between MediaRecorder dataavailable events. Chunks
 *  accumulate until stop(); the smaller the interval, the less data lost
 *  if MediaRecorder dies mid-recording. 1000 ms balances overhead vs.
 *  data safety. */
export const DATAAVAILABLE_INTERVAL_MS = 1000;

// ─── Types ─────────────────────────────────────────────────────────────

export type RecordControllerState =
  | 'idle'
  | 'asking-tab'
  | 'recording'
  | 'stopped'
  | 'canceled';

export type RecordControllerCancelReason =
  | 'user-cancel'
  | 'tab-closed'
  | 'dialog-dismissed'
  | 'recorder-error';

export interface RecordControllerStoppedResult {
  /** The final encoded recording, ready to upload as-is to a Supabase
   *  signed URL. MIME matches the picked mimeType (typically
   *  'video/webm;codecs=vp9,opus'). */
  blob: Blob;
  mimeType: string;
  /** Wall-clock duration from start() to stop(), in seconds. May differ
   *  slightly from the encoded duration if MediaRecorder buffered the
   *  final chunk; the difference is negligible (<100 ms typical). */
  durationSeconds: number;
  /** The validated + normalized region the recording was scoped to.
   *  width + height feed the persisted CapturedVideo metadata. */
  region: Rect;
}

export interface RecordControllerStartOpts {
  /** The user-drawn rectangle in viewport coordinates. Validated +
   *  normalized at start() (rounded to even dimensions, sub-MIN rejected). */
  region: Rect;
  /** Hard auto-stop cap (seconds). Defaults to MAX_DURATION_SECONDS_DEFAULT. */
  maxDurationSeconds?: number;
  /** Fires once per second during recording with the elapsed seconds count.
   *  Drives the countdown UI in recording-indicator-overlay.ts (1b). */
  onTick?(elapsedSeconds: number): void;
  /** Fires once when MediaRecorder transitions to recording. The orchestrator
   *  uses this to swap the region-overlay → indicator-overlay UI. */
  onStarted?(): void;
  /** Fires when stop() finishes flushing — emits the final Blob + metadata. */
  onStopped(result: RecordControllerStoppedResult): void;
  /** Fires when cancel() completes OR getDisplayMedia rejects OR MediaRecorder
   *  errors out. Detail carries the underlying error message when present. */
  onCanceled?(reason: RecordControllerCancelReason, detail?: string): void;
}

export interface RecordController {
  start(opts: RecordControllerStartOpts): Promise<void>;
  stop(): void;
  cancel(): void;
  getState(): RecordControllerState;
}

// ─── Dependency-injection surface ───────────────────────────────────────

/** Cropped MediaStream + a teardown handle (the rAF loop + hidden video +
 *  canvas need explicit cleanup on stop/cancel; otherwise the rAF keeps
 *  running after the recording is finalized). */
export interface CroppedStream {
  stream: MediaStream;
  teardown(): void;
}

/** The browser APIs the controller depends on. Production wires these to
 *  navigator.mediaDevices, MediaRecorder, performance.now(), window.setTimeout,
 *  etc. Tests pass fakes.
 *
 *  `cropStreamToRegion` is OPTIONAL per P-45 Build #1b: the canvas-crop
 *  pipeline (rAF + drawImage + canvas.captureStream) needs a real DOM
 *  context. Production provides the canvas-based implementation; tests
 *  that don't pass it get the raw stream back (no crop). This keeps the
 *  1a state-machine tests working unchanged after 1b adds the pipeline. */
export interface RecordControllerDeps {
  getDisplayMedia(constraints: {
    video: boolean;
    audio: boolean;
  }): Promise<MediaStream>;
  createMediaRecorder(
    stream: MediaStream,
    options: MediaRecorderOptions,
  ): MediaRecorder;
  isTypeSupported(mimeType: string): boolean;
  now(): number;
  setTimeout(handler: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  setInterval(handler: () => void, ms: number): unknown;
  clearInterval(handle: unknown): void;
  /** Wraps the raw screen-capture MediaStream in a canvas-crop pipeline
   *  that reduces the recorded surface to `region`. When undefined, the
   *  raw stream is recorded (no crop) — used by 1a state-machine tests
   *  + by integration scenarios where the user picks a region matching
   *  the picked tab. */
  cropStreamToRegion?(stream: MediaStream, region: Rect): CroppedStream;
  /** Patches the EBML Segment Info Duration tag into the final webm Blob
   *  produced by MediaRecorder. Required because Chrome's MediaRecorder
   *  writes the EBML header at recording-START before duration is known
   *  and never patches it after `stop()`, leaving `format.duration: NOPTS`
   *  in the output — which makes the HTML5 video player see
   *  `videoElement.duration === Infinity` on load and breaks its
   *  pre-buffer-planning math, causing reactive chunk-fetching that
   *  surfaces as playback stutter on vklf.com. P-48 Session 2 (2026-05-25)
   *  diagnosed via `ffprobe` + EBML deep-probe across 3 production
   *  SCREEN_RECORDING webm files. Production wires this to
   *  `fix-webm-duration` from yusitnikov (canonical ~3 KB MIT library;
   *  no transitive deps). Optional so that pre-Session-2 unit tests
   *  pass unchanged (when omitted, the raw unpatched blob is emitted). */
  fixWebmDuration?(blob: Blob, durationMs: number): Promise<Blob>;
}

export function createProductionDeps(): RecordControllerDeps {
  return {
    getDisplayMedia(constraints) {
      // selfBrowserSurface: 'include' makes the requesting tab visible in
      // Chrome's "Choose what to share" Tab picker. The browser default is
      // 'exclude' — without this flag the user CANNOT pick the current tab
      // for recording and has to pick a Window or Entire Screen instead.
      // P-45 Build #2 Phase 1 director-verified bug 2026-05-23.
      const fullConstraints: DisplayMediaStreamOptions = {
        ...(constraints as DisplayMediaStreamOptions),
        selfBrowserSurface: 'include',
      } as DisplayMediaStreamOptions;
      return navigator.mediaDevices.getDisplayMedia(fullConstraints);
    },
    createMediaRecorder(stream, options) {
      return new MediaRecorder(stream, options);
    },
    isTypeSupported(mimeType) {
      return (
        typeof MediaRecorder !== 'undefined' &&
        MediaRecorder.isTypeSupported(mimeType)
      );
    },
    now() {
      return performance.now();
    },
    setTimeout(handler, ms) {
      return globalThis.setTimeout(handler, ms);
    },
    clearTimeout(handle) {
      globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>);
    },
    setInterval(handler, ms) {
      return globalThis.setInterval(handler, ms);
    },
    clearInterval(handle) {
      globalThis.clearInterval(handle as ReturnType<typeof setInterval>);
    },
    cropStreamToRegion: productionCropStreamToRegion,
    fixWebmDuration(blob, durationMs) {
      return ysFixWebmDuration(blob, durationMs);
    },
  };
}

/** Production canvas-crop pipeline. Per CAPTURED_VIDEOS_DESIGN.md §C.12
 *  step 3-5: hidden <video> plays the raw screen-capture stream; an rAF
 *  loop draws the region slice onto a canvas; canvas.captureStream(30)
 *  gives a region-cropped MediaStream; we merge in any audio tracks from
 *  the original stream so the recording still has sound.
 *
 *  Teardown stops the rAF loop + removes the hidden video element. The
 *  caller's teardownStream() handles the underlying MediaStream tracks
 *  separately (both the raw stream + the cropped canvas-captureStream's
 *  video track). */
function productionCropStreamToRegion(
  sourceStream: MediaStream,
  region: Rect,
): CroppedStream {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = sourceStream;
  // Detached from the document — no need to render; canvas reads frames
  // straight from the video element regardless.
  void video.play().catch(() => {
    // Defensive — autoplay policy shouldn't fire on muted video, but if
    // it does the rAF loop will just paint stale frames until the user
    // gestures (which they did to invoke this in the first place).
  });

  const canvas = document.createElement('canvas');
  canvas.width = region.width;
  canvas.height = region.height;
  const ctx = canvas.getContext('2d');

  let rafHandle = 0;
  function paintFrame(): void {
    if (ctx !== null && video.readyState >= 2) {
      ctx.drawImage(
        video,
        region.x,
        region.y,
        region.width,
        region.height,
        0,
        0,
        region.width,
        region.height,
      );
    }
    rafHandle = requestAnimationFrame(paintFrame);
  }
  rafHandle = requestAnimationFrame(paintFrame);

  // canvas.captureStream(fps) produces a video-only MediaStream. Merge in
  // the original stream's audio tracks so the recording has sound.
  const croppedStream = canvas.captureStream(30);
  for (const audioTrack of sourceStream.getAudioTracks()) {
    croppedStream.addTrack(audioTrack);
  }

  return {
    stream: croppedStream,
    teardown() {
      if (rafHandle !== 0) {
        cancelAnimationFrame(rafHandle);
        rafHandle = 0;
      }
      try {
        video.pause();
      } catch {
        // Defensive.
      }
      video.srcObject = null;
    },
  };
}

// ─── Pure helpers ───────────────────────────────────────────────────────

/** Validates a user-drawn region. Rejects sub-MIN dimensions; rounds odd
 *  width/height up to the next even pixel (vp9 + canvas.captureStream
 *  require even dimensions or the encoder errors). */
export function validateAndNormalizeRegion(region: Rect): Rect {
  if (
    region.width < MIN_REGION_DIMENSION_PX ||
    region.height < MIN_REGION_DIMENSION_PX
  ) {
    throw new Error(
      `Region too small: ${String(region.width)}x${String(
        region.height,
      )}; minimum is ${String(MIN_REGION_DIMENSION_PX)}px on each side.`,
    );
  }
  return {
    x: Math.round(region.x),
    y: Math.round(region.y),
    width: region.width % 2 === 0 ? region.width : region.width + 1,
    height: region.height % 2 === 0 ? region.height : region.height + 1,
  };
}

/** Picks the most-preferred MediaRecorder mimeType supported by this
 *  browser. Always returns SOMETHING — Chrome supports plain 'video/webm'
 *  as a guaranteed fallback. */
export function pickRecordingMimeType(
  isTypeSupported: (mimeType: string) => boolean,
): string {
  for (const candidate of RECORDING_MIMETYPE_PREFERENCES) {
    if (isTypeSupported(candidate)) return candidate;
  }
  return 'video/webm';
}

// ─── Controller factory ─────────────────────────────────────────────────

export function createRecordController(
  deps: RecordControllerDeps = createProductionDeps(),
): RecordController {
  let state: RecordControllerState = 'idle';
  let stream: MediaStream | null = null;
  /** The cropped stream wrapper (when canvas-crop is active). Distinct
   *  from `stream` so teardown can stop the rAF loop + the original
   *  screen-capture tracks independently. */
  let cropped: CroppedStream | null = null;
  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let mimeType = '';
  let normalizedRegion: Rect = { x: 0, y: 0, width: 0, height: 0 };
  let startTimestamp = 0;
  let maxDurationTimer: unknown = null;
  let tickInterval: unknown = null;
  let activeOpts: RecordControllerStartOpts | null = null;
  /** Guard against double-stop and stop-after-cancel emitting twice. */
  let stoppedEmitted = false;

  function teardownStream(): void {
    // Tear down the cropped pipeline FIRST so its rAF loop stops before
    // we kill the underlying video tracks (avoids one wasted frame).
    if (cropped !== null) {
      try {
        cropped.teardown();
      } catch {
        // Defensive.
      }
      cropped = null;
    }
    if (stream !== null) {
      try {
        for (const track of stream.getTracks()) track.stop();
      } catch {
        // Defensive — tracks may already be stopped; ignore.
      }
      stream = null;
    }
  }

  function clearTimers(): void {
    if (maxDurationTimer !== null) {
      deps.clearTimeout(maxDurationTimer);
      maxDurationTimer = null;
    }
    if (tickInterval !== null) {
      deps.clearInterval(tickInterval);
      tickInterval = null;
    }
  }

  async function emitStoppedOnce(): Promise<void> {
    if (stoppedEmitted) return;
    stoppedEmitted = true;
    const durationSeconds = (deps.now() - startTimestamp) / 1000;
    const rawBlob = new Blob(chunks, { type: mimeType });
    state = 'stopped';
    teardownStream();
    clearTimers();

    // Patch the EBML Segment Info Duration tag into the webm container
    // header via fix-webm-duration (when wired). On error, fall through
    // to emitting the unpatched blob so a library failure doesn't lose
    // the recording — the user can still play back (with the original
    // stutter) and re-record if needed.
    let finalBlob = rawBlob;
    if (deps.fixWebmDuration) {
      try {
        finalBlob = await deps.fixWebmDuration(rawBlob, durationSeconds * 1000);
      } catch {
        finalBlob = rawBlob;
      }
    }

    activeOpts?.onStopped({
      blob: finalBlob,
      mimeType,
      durationSeconds,
      region: normalizedRegion,
    });
  }

  function cancelWith(
    reason: RecordControllerCancelReason,
    detail?: string,
  ): void {
    // Idempotent — cancel-after-cancel or cancel-after-stop no-ops.
    if (state === 'canceled' || state === 'stopped') return;
    state = 'canceled';
    clearTimers();
    if (recorder !== null && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // Defensive — recorder.stop() may throw on already-stopped recorders.
      }
    }
    teardownStream();
    activeOpts?.onCanceled?.(reason, detail);
  }

  async function start(opts: RecordControllerStartOpts): Promise<void> {
    if (state !== 'idle') {
      throw new Error(
        `Cannot start: controller is already in state '${state}'.`,
      );
    }
    normalizedRegion = validateAndNormalizeRegion(opts.region);
    activeOpts = opts;
    chunks = [];
    stoppedEmitted = false;

    state = 'asking-tab';
    let mediaStream: MediaStream;
    try {
      mediaStream = await deps.getDisplayMedia({ video: true, audio: true });
    } catch (err) {
      state = 'canceled';
      const message =
        err instanceof Error ? err.message : 'getDisplayMedia rejected';
      opts.onCanceled?.('dialog-dismissed', message);
      return;
    }
    // Cancel-during-await guard: if cancel() fired between asking-tab and
    // the dialog resolving, the controller is already in 'canceled' state.
    // Tear down the freshly-acquired stream so Chrome's "Sharing" indicator
    // doesn't linger + bail without setting up MediaRecorder.
    if ((state as RecordControllerState) !== 'asking-tab') {
      try {
        for (const track of mediaStream.getTracks()) track.stop();
      } catch {
        // Defensive.
      }
      return;
    }
    stream = mediaStream;

    // P-45 Build #1b — apply the canvas-crop region constraint. When
    // deps.cropStreamToRegion is provided (production), we feed
    // MediaRecorder the region-cropped stream so the recorded video is
    // limited to the user's drawn rectangle. When omitted (1a tests +
    // simple integration), the raw screen-capture stream is recorded as
    // shipped in 1a — the region metadata still threads through to
    // onStopped for the row's width/height fields.
    let streamToRecord: MediaStream = mediaStream;
    if (deps.cropStreamToRegion) {
      try {
        cropped = deps.cropStreamToRegion(mediaStream, normalizedRegion);
        streamToRecord = cropped.stream;
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : 'canvas-crop pipeline failed';
        cancelWith('recorder-error', detail);
        return;
      }
    }

    mimeType = pickRecordingMimeType(deps.isTypeSupported);
    try {
      recorder = deps.createMediaRecorder(streamToRecord, {
        mimeType,
        videoBitsPerSecond: VIDEO_BITS_PER_SECOND_DEFAULT,
      });
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : 'MediaRecorder construction failed';
      cancelWith('recorder-error', detail);
      return;
    }

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = (event: Event) => {
      const detail =
        (event as unknown as { error?: { message?: string } }).error?.message ??
        'MediaRecorder error';
      cancelWith('recorder-error', detail);
    };
    recorder.onstop = () => {
      // Only emit if we got here via stop() (clean stop path). If cancel()
      // fired, state === 'canceled' and we skip — cancel already cleaned up.
      if (state === 'recording') emitStoppedOnce();
    };

    startTimestamp = deps.now();
    recorder.start(DATAAVAILABLE_INTERVAL_MS);
    state = 'recording';

    const maxDur = opts.maxDurationSeconds ?? MAX_DURATION_SECONDS_DEFAULT;
    maxDurationTimer = deps.setTimeout(() => {
      stop();
    }, maxDur * 1000);

    if (opts.onTick) {
      let elapsedSec = 0;
      const onTickFn = opts.onTick;
      tickInterval = deps.setInterval(() => {
        elapsedSec += 1;
        onTickFn(elapsedSec);
      }, 1000);
    }

    opts.onStarted?.();
  }

  function stop(): void {
    if (state !== 'recording') return;
    clearTimers();
    if (recorder !== null && recorder.state !== 'inactive') {
      // Triggers recorder.onstop → emitStoppedOnce.
      recorder.stop();
    } else {
      // Recorder gone or already inactive — emit synchronously.
      emitStoppedOnce();
    }
  }

  function cancel(): void {
    cancelWith('user-cancel');
  }

  function getState(): RecordControllerState {
    return state;
  }

  return { start, stop, cancel, getState };
}
