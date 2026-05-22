// Unit tests for record-controller.ts — P-45 Build #1a (2026-05-22).
//
// Coverage strategy per CAPTURED_VIDEOS_DESIGN.md §C.18: the controller's
// state machine + timer book-keeping + MIME picker + region validator are
// all unit-testable because the browser APIs (getDisplayMedia, MediaRecorder,
// performance.now, timers) are injected via RecordControllerDeps. Tests
// pass fakes; no JSDOM, no Chrome runtime.
//
// The 1a scope omits canvas-crop pipeline tests (canvas-crop ships in 1b).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createRecordController,
  MAX_DURATION_SECONDS_DEFAULT,
  MIN_REGION_DIMENSION_PX,
  pickRecordingMimeType,
  RECORDING_MIMETYPE_PREFERENCES,
  validateAndNormalizeRegion,
  type RecordControllerCancelReason,
  type RecordControllerDeps,
  type RecordControllerStoppedResult,
} from './record-controller.ts';

// ─── Fakes ─────────────────────────────────────────────────────────────

interface FakeTrack {
  kind: string;
  stopped: boolean;
  stop(): void;
}

function makeFakeStream(): MediaStream {
  const tracks: FakeTrack[] = [
    {
      kind: 'video',
      stopped: false,
      stop() {
        this.stopped = true;
      },
    },
    {
      kind: 'audio',
      stopped: false,
      stop() {
        this.stopped = true;
      },
    },
  ];
  return {
    getTracks: () => tracks,
  } as unknown as MediaStream;
}

interface FakeMediaRecorder extends MediaRecorder {
  // Test helpers — invoke from inside tests to simulate browser events.
  simulateData(blob: Blob): void;
  simulateStop(): void;
  simulateError(message: string): void;
  startCalledWith: number[];
  stopCallCount: number;
}

function makeFakeMediaRecorder(): FakeMediaRecorder {
  let internalState: 'inactive' | 'recording' | 'paused' = 'inactive';
  const startCalledWith: number[] = [];
  let stopCallCount = 0;
  // Build as a plain object first then cast — Partial<MediaRecorder> trips
  // TS strict-mode method-this checks because optional members don't satisfy
  // the real MediaRecorder's `this:` parameter constraints.
  const rec = {
    start(timeslice?: number) {
      if (typeof timeslice === 'number') startCalledWith.push(timeslice);
      internalState = 'recording';
    },
    stop() {
      stopCallCount += 1;
      internalState = 'inactive';
    },
    get state() {
      return internalState;
    },
    get startCalledWith() {
      return startCalledWith;
    },
    get stopCallCount() {
      return stopCallCount;
    },
    ondataavailable: null as ((e: BlobEvent) => void) | null,
    onstop: null as ((e: Event) => void) | null,
    onerror: null as ((e: Event) => void) | null,
    simulateData(blob: Blob) {
      this.ondataavailable?.({ data: blob } as BlobEvent);
    },
    simulateStop() {
      internalState = 'inactive';
      this.onstop?.(new Event('stop'));
    },
    simulateError(message: string) {
      this.onerror?.({ error: { message } } as unknown as Event);
    },
  };
  return rec as unknown as FakeMediaRecorder;
}

interface FakeClock {
  now: number;
  setTimeoutHandlers: Array<{ handler: () => void; ms: number; handle: number }>;
  setIntervalHandlers: Array<{ handler: () => void; ms: number; handle: number }>;
  /** Advances the clock by `ms` and fires any timers whose deadline arrived.
   *  Intervals fire repeatedly. */
  advance(ms: number): void;
}

function makeFakeClock(): FakeClock {
  let handleSeq = 1;
  const setTimeoutHandlers: FakeClock['setTimeoutHandlers'] = [];
  const setIntervalHandlers: FakeClock['setIntervalHandlers'] = [];
  const clock: FakeClock = {
    now: 0,
    setTimeoutHandlers,
    setIntervalHandlers,
    advance(ms) {
      clock.now += ms;
      // Fire all setTimeouts whose deadline arrived. Iterate over a copy
      // so handlers can register new timers without disturbing the loop.
      const due = setTimeoutHandlers.filter((t) => t.ms <= ms);
      for (const t of due) {
        const idx = setTimeoutHandlers.indexOf(t);
        if (idx >= 0) setTimeoutHandlers.splice(idx, 1);
        t.handler();
      }
      // Decrement remaining setTimeout deadlines.
      for (const t of setTimeoutHandlers) t.ms -= ms;
      // Fire intervals — once per full interval-ms within the advance window.
      for (const i of setIntervalHandlers) {
        const fires = Math.floor(ms / i.ms);
        for (let k = 0; k < fires; k++) i.handler();
      }
    },
  };
  return clock;
}

function makeDeps(opts: {
  clock: FakeClock;
  fakeStream?: MediaStream;
  fakeRecorder?: FakeMediaRecorder;
  getDisplayMediaError?: Error;
  isTypeSupported?: (m: string) => boolean;
  createMediaRecorderThrows?: Error;
}): RecordControllerDeps {
  const { clock } = opts;
  return {
    getDisplayMedia: async () => {
      if (opts.getDisplayMediaError) throw opts.getDisplayMediaError;
      return opts.fakeStream ?? makeFakeStream();
    },
    createMediaRecorder: () => {
      if (opts.createMediaRecorderThrows) throw opts.createMediaRecorderThrows;
      return opts.fakeRecorder ?? makeFakeMediaRecorder();
    },
    isTypeSupported: opts.isTypeSupported ?? (() => true),
    now: () => clock.now,
    setTimeout: (handler, ms) => {
      const handle = Math.random();
      clock.setTimeoutHandlers.push({ handler, ms, handle });
      return handle;
    },
    clearTimeout: (handle) => {
      const idx = clock.setTimeoutHandlers.findIndex((t) => t.handle === handle);
      if (idx >= 0) clock.setTimeoutHandlers.splice(idx, 1);
    },
    setInterval: (handler, ms) => {
      const handle = Math.random();
      clock.setIntervalHandlers.push({ handler, ms, handle });
      return handle;
    },
    clearInterval: (handle) => {
      const idx = clock.setIntervalHandlers.findIndex(
        (t) => t.handle === handle,
      );
      if (idx >= 0) clock.setIntervalHandlers.splice(idx, 1);
    },
  };
}

const VALID_REGION = { x: 100, y: 200, width: 400, height: 300 };

// ─── Pure helpers — pickRecordingMimeType ──────────────────────────────

test('pickRecordingMimeType — picks vp9+opus when all supported', () => {
  const result = pickRecordingMimeType(() => true);
  assert.equal(result, RECORDING_MIMETYPE_PREFERENCES[0]);
});

test('pickRecordingMimeType — falls back to vp8 when vp9 unsupported', () => {
  const result = pickRecordingMimeType(
    (m) => !m.includes('vp9'),
  );
  assert.equal(result, RECORDING_MIMETYPE_PREFERENCES[1]);
});

test('pickRecordingMimeType — falls back to plain webm when both vp9 + vp8 unsupported', () => {
  const result = pickRecordingMimeType(
    (m) => m === 'video/webm',
  );
  assert.equal(result, 'video/webm');
});

test('pickRecordingMimeType — last-resort returns video/webm even when isTypeSupported always false', () => {
  const result = pickRecordingMimeType(() => false);
  assert.equal(result, 'video/webm');
});

// ─── Pure helpers — validateAndNormalizeRegion ─────────────────────────

test('validateAndNormalizeRegion — passes valid even-dimension region through', () => {
  const result = validateAndNormalizeRegion(VALID_REGION);
  assert.deepEqual(result, VALID_REGION);
});

test('validateAndNormalizeRegion — rounds odd width up to next even pixel', () => {
  const result = validateAndNormalizeRegion({
    x: 0,
    y: 0,
    width: 401,
    height: 300,
  });
  assert.equal(result.width, 402);
});

test('validateAndNormalizeRegion — rounds odd height up to next even pixel', () => {
  const result = validateAndNormalizeRegion({
    x: 0,
    y: 0,
    width: 400,
    height: 301,
  });
  assert.equal(result.height, 302);
});

test('validateAndNormalizeRegion — rounds fractional x/y to integer', () => {
  const result = validateAndNormalizeRegion({
    x: 100.4,
    y: 200.6,
    width: 400,
    height: 300,
  });
  assert.equal(result.x, 100);
  assert.equal(result.y, 201);
});

test('validateAndNormalizeRegion — rejects width below MIN_REGION_DIMENSION_PX', () => {
  assert.throws(
    () =>
      validateAndNormalizeRegion({
        x: 0,
        y: 0,
        width: MIN_REGION_DIMENSION_PX - 1,
        height: 300,
      }),
    /too small/i,
  );
});

test('validateAndNormalizeRegion — rejects height below MIN_REGION_DIMENSION_PX', () => {
  assert.throws(
    () =>
      validateAndNormalizeRegion({
        x: 0,
        y: 0,
        width: 400,
        height: MIN_REGION_DIMENSION_PX - 1,
      }),
    /too small/i,
  );
});

// ─── Controller — start happy path ─────────────────────────────────────

test('start — happy path transitions idle → asking-tab → recording', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  assert.equal(ctrl.getState(), 'idle');

  let startedFired = false;
  const startPromise = ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onStarted() {
      startedFired = true;
    },
  });
  await startPromise;

  assert.equal(ctrl.getState(), 'recording');
  assert.equal(startedFired, true);
  assert.deepEqual(fakeRecorder.startCalledWith, [1000]);
});

test('start — registers auto-stop timer for maxDurationSeconds', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  await ctrl.start({
    region: VALID_REGION,
    maxDurationSeconds: 60,
    onStopped() {},
  });
  // The auto-stop timer is registered at 60_000 ms.
  assert.equal(clock.setTimeoutHandlers.length, 1);
  assert.equal(clock.setTimeoutHandlers[0]?.ms, 60_000);
});

test('start — uses MAX_DURATION_SECONDS_DEFAULT when maxDurationSeconds omitted', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  assert.equal(
    clock.setTimeoutHandlers[0]?.ms,
    MAX_DURATION_SECONDS_DEFAULT * 1000,
  );
});

test('start — registers onTick interval when callback provided', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  const tickValues: number[] = [];
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onTick(elapsed) {
      tickValues.push(elapsed);
    },
  });
  assert.equal(clock.setIntervalHandlers.length, 1);
  assert.equal(clock.setIntervalHandlers[0]?.ms, 1000);

  clock.advance(3000);
  assert.deepEqual(tickValues, [1, 2, 3]);
});

test('start — does NOT register tick interval when onTick omitted', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  assert.equal(clock.setIntervalHandlers.length, 0);
});

test('start — second start() throws', async () => {
  const clock = makeFakeClock();
  const deps = makeDeps({ clock });
  const ctrl = createRecordController(deps);

  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  await assert.rejects(
    ctrl.start({ region: VALID_REGION, onStopped() {} }),
    /already in state/i,
  );
});

// ─── Controller — start error paths ────────────────────────────────────

test('start — getDisplayMedia rejection emits onCanceled(dialog-dismissed)', async () => {
  const clock = makeFakeClock();
  const deps = makeDeps({
    clock,
    getDisplayMediaError: new Error('Permission denied by user'),
  });
  const ctrl = createRecordController(deps);

  let cancelReason: RecordControllerCancelReason | null = null;
  let cancelDetail: string | undefined;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {
      throw new Error('onStopped should not fire on dialog-dismiss');
    },
    onCanceled(reason, detail) {
      cancelReason = reason;
      cancelDetail = detail;
    },
  });
  assert.equal(ctrl.getState(), 'canceled');
  assert.equal(cancelReason, 'dialog-dismissed');
  assert.match(cancelDetail ?? '', /permission denied/i);
});

test('start — MediaRecorder construction throw cancels with recorder-error', async () => {
  const clock = makeFakeClock();
  const deps = makeDeps({
    clock,
    createMediaRecorderThrows: new Error('unsupported codec'),
  });
  const ctrl = createRecordController(deps);

  let reason: RecordControllerCancelReason | null = null;
  let detail: string | undefined;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onCanceled(r, d) {
      reason = r;
      detail = d;
    },
  });
  assert.equal(ctrl.getState(), 'canceled');
  assert.equal(reason, 'recorder-error');
  assert.match(detail ?? '', /unsupported codec/i);
});

test('start — region too small throws (rejects via throw, not onCanceled)', async () => {
  const clock = makeFakeClock();
  const deps = makeDeps({ clock });
  const ctrl = createRecordController(deps);

  await assert.rejects(
    ctrl.start({
      region: { x: 0, y: 0, width: 4, height: 300 },
      onStopped() {},
    }),
    /too small/i,
  );
  assert.equal(ctrl.getState(), 'idle');
});

// ─── Controller — stop happy path ──────────────────────────────────────

test('stop — emits onStopped with assembled Blob + metadata', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let stoppedResult: RecordControllerStoppedResult | null = null;
  await ctrl.start({
    region: VALID_REGION,
    onStopped(result) {
      stoppedResult = result;
    },
  });

  // Simulate a few dataavailable events.
  fakeRecorder.simulateData(new Blob(['chunk-1'], { type: 'video/webm' }));
  fakeRecorder.simulateData(new Blob(['chunk-2'], { type: 'video/webm' }));

  // Advance the clock so durationSeconds is computable.
  clock.advance(12_000);
  ctrl.stop();
  // Recorder.stop() in production fires onstop async; our fake exposes
  // simulateStop() which the controller's onstop callback handles.
  fakeRecorder.simulateStop();

  assert.equal(ctrl.getState(), 'stopped');
  assert.ok(stoppedResult);
  const r: RecordControllerStoppedResult = stoppedResult!;
  assert.ok(r.blob instanceof Blob);
  assert.equal(r.blob.type, RECORDING_MIMETYPE_PREFERENCES[0]);
  assert.equal(r.durationSeconds, 12);
  assert.deepEqual(r.region, VALID_REGION);
});

test('stop — is idempotent (second call no-ops)', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let stoppedCount = 0;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {
      stoppedCount += 1;
    },
  });

  ctrl.stop();
  fakeRecorder.simulateStop();
  ctrl.stop(); // should no-op
  fakeRecorder.simulateStop(); // also no-op because state is now 'stopped'

  assert.equal(stoppedCount, 1);
});

test('stop — clears auto-stop and tick timers', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onTick() {},
  });
  assert.equal(clock.setTimeoutHandlers.length, 1);
  assert.equal(clock.setIntervalHandlers.length, 1);

  ctrl.stop();
  fakeRecorder.simulateStop();

  assert.equal(clock.setTimeoutHandlers.length, 0);
  assert.equal(clock.setIntervalHandlers.length, 0);
});

test('stop — stops all MediaStream tracks', async () => {
  const clock = makeFakeClock();
  const fakeStream = makeFakeStream();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeStream, fakeRecorder });
  const ctrl = createRecordController(deps);

  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  ctrl.stop();
  fakeRecorder.simulateStop();

  for (const track of fakeStream.getTracks() as unknown as FakeTrack[]) {
    assert.equal(track.stopped, true);
  }
});

// ─── Controller — cancel paths ─────────────────────────────────────────

test('cancel — user cancel transitions recording → canceled and emits onCanceled', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let cancelReason: RecordControllerCancelReason | null = null;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {
      throw new Error('onStopped should not fire on user-cancel');
    },
    onCanceled(reason) {
      cancelReason = reason;
    },
  });

  ctrl.cancel();
  assert.equal(ctrl.getState(), 'canceled');
  assert.equal(cancelReason, 'user-cancel');
});

test('cancel — is idempotent (second call no-ops)', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let cancelCount = 0;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onCanceled() {
      cancelCount += 1;
    },
  });

  ctrl.cancel();
  ctrl.cancel();
  assert.equal(cancelCount, 1);
});

test('cancel — after stop no-ops (no double-emit)', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let stoppedCount = 0;
  let cancelCount = 0;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {
      stoppedCount += 1;
    },
    onCanceled() {
      cancelCount += 1;
    },
  });

  ctrl.stop();
  fakeRecorder.simulateStop();
  ctrl.cancel(); // no-op
  assert.equal(stoppedCount, 1);
  assert.equal(cancelCount, 0);
});

test('cancel — MediaRecorder error event triggers cancelWith(recorder-error)', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let reason: RecordControllerCancelReason | null = null;
  let detail: string | undefined;
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onCanceled(r, d) {
      reason = r;
      detail = d;
    },
  });

  fakeRecorder.simulateError('encoder ran out of memory');
  assert.equal(ctrl.getState(), 'canceled');
  assert.equal(reason, 'recorder-error');
  assert.match(detail ?? '', /encoder ran out of memory/i);
});

// ─── Controller — auto-stop timer ──────────────────────────────────────

test('auto-stop — fires when maxDurationSeconds elapses', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  let stoppedFired = false;
  await ctrl.start({
    region: VALID_REGION,
    maxDurationSeconds: 10,
    onStopped() {
      stoppedFired = true;
    },
  });

  // Advance past the 10s cap; fake clock fires the setTimeout handler.
  clock.advance(10_000);
  // Auto-stop calls stop() which calls recorder.stop() — our fake doesn't
  // fire onstop automatically; the controller's stop() falls through to
  // the emitStoppedOnce synchronous emit when recorder.state === 'inactive'.
  // Since the fake's stop() flips state to 'inactive', we need to
  // simulate the onstop event.
  fakeRecorder.simulateStop();
  assert.equal(stoppedFired, true);
  assert.equal(ctrl.getState(), 'stopped');
});

// ─── Controller — getState ─────────────────────────────────────────────

test('getState — returns idle before start, recording after, stopped after stop', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const deps = makeDeps({ clock, fakeRecorder });
  const ctrl = createRecordController(deps);

  assert.equal(ctrl.getState(), 'idle');
  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  assert.equal(ctrl.getState(), 'recording');
  ctrl.stop();
  fakeRecorder.simulateStop();
  assert.equal(ctrl.getState(), 'stopped');
});

// ─── Controller — canvas-crop region constraint (P-45 Build #1b) ───────

test('canvas-crop — cropStreamToRegion is called with the normalized region', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const baseDeps = makeDeps({ clock, fakeRecorder });
  const cropCalls: Array<{
    stream: MediaStream;
    region: { width: number; height: number };
  }> = [];
  const croppedTeardown = { fired: false };
  const deps = {
    ...baseDeps,
    cropStreamToRegion(stream: MediaStream, region: { width: number; height: number }) {
      cropCalls.push({ stream, region });
      // Return a sentinel cropped stream — the FakeMediaRecorder doesn't
      // inspect it; we just need the controller to flow through to record().
      return {
        stream: makeFakeStream(),
        teardown() {
          croppedTeardown.fired = true;
        },
      };
    },
  };
  const ctrl = createRecordController(deps);
  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  assert.equal(cropCalls.length, 1);
  assert.equal(cropCalls[0]!.region.width, VALID_REGION.width);
  assert.equal(cropCalls[0]!.region.height, VALID_REGION.height);
});

test('canvas-crop — teardown fires on stop()', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const baseDeps = makeDeps({ clock, fakeRecorder });
  let teardownFired = false;
  const deps = {
    ...baseDeps,
    cropStreamToRegion() {
      return {
        stream: makeFakeStream(),
        teardown() {
          teardownFired = true;
        },
      };
    },
  };
  const ctrl = createRecordController(deps);
  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  ctrl.stop();
  fakeRecorder.simulateStop();
  assert.equal(teardownFired, true);
});

test('canvas-crop — teardown fires on cancel()', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const baseDeps = makeDeps({ clock, fakeRecorder });
  let teardownFired = false;
  const deps = {
    ...baseDeps,
    cropStreamToRegion() {
      return {
        stream: makeFakeStream(),
        teardown() {
          teardownFired = true;
        },
      };
    },
  };
  const ctrl = createRecordController(deps);
  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  ctrl.cancel();
  assert.equal(teardownFired, true);
});

test('canvas-crop — cropStreamToRegion throws → onCanceled("recorder-error")', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const baseDeps = makeDeps({ clock, fakeRecorder });
  let cancelReason: RecordControllerCancelReason | null = null;
  const deps = {
    ...baseDeps,
    cropStreamToRegion() {
      throw new Error('test-crop-failure');
    },
  };
  const ctrl = createRecordController(deps);
  await ctrl.start({
    region: VALID_REGION,
    onStopped() {},
    onCanceled(reason) {
      cancelReason = reason;
    },
  });
  assert.equal(cancelReason, 'recorder-error');
  assert.equal(ctrl.getState(), 'canceled');
});

test('canvas-crop — when cropStreamToRegion is absent, MediaRecorder gets the raw stream', async () => {
  const clock = makeFakeClock();
  const fakeRecorder = makeFakeMediaRecorder();
  const fakeStream = makeFakeStream();
  let recorderStreamReceived: MediaStream | null = null;
  const baseDeps = makeDeps({ clock, fakeRecorder, fakeStream });
  const deps = {
    ...baseDeps,
    createMediaRecorder(stream: MediaStream) {
      recorderStreamReceived = stream;
      return fakeRecorder;
    },
    // cropStreamToRegion intentionally absent
  };
  const ctrl = createRecordController(deps);
  await ctrl.start({ region: VALID_REGION, onStopped() {} });
  assert.strictEqual(recorderStreamReceived, fakeStream);
});
