// Recording-indicator overlay — content-script (P-45 Build #1b 2026-05-22).
//
// Per CAPTURED_VIDEOS_DESIGN.md §C.15 the indicator renders TWO synchronized
// UI elements during a screen recording:
//
//   1. Region indicator — thin red dashed border absolutely positioned at
//      the user's drawn rectangle. `pointer-events: none` so the user can
//      still interact with the page (click play on the embedded video,
//      scroll, etc.).
//   2. Floating toolbar — pinned to viewport top-center. Contains:
//      - REC ● badge (the dot pulses via CSS keyframe in styles.ts)
//      - Live countdown ("0:08 / 3:00")
//      - Stop button (primary; red)
//      - Cancel button (secondary; text-only gray)
//
// Lifecycle:
//   open → renders both elements in PREPARING state (gray border, no REC,
//          no countdown — covers the ~1-2 sec while Chrome's "Choose what
//          to share" dialog is up + MediaRecorder is buffering its first
//          dataavailable event).
//   setRecording() → border switches to red dashed; REC badge appears;
//                    countdown starts at 0:00.
//   setElapsed(s) → updates the countdown text. Caller (record-controller's
//                   onTick) fires this once per second.
//   destroy() → removes both DOM elements + clears any state.

import type { Rect } from '../region-screenshot.ts';

const REGION_CLASS = 'plos-cs-recording-indicator-region';
const REGION_PREPARING_CLASS = 'plos-cs-recording-indicator-region--preparing';
const REGION_RECORDING_CLASS = 'plos-cs-recording-indicator-region--recording';
const TOOLBAR_CLASS = 'plos-cs-recording-indicator-toolbar';
const BADGE_CLASS = 'plos-cs-recording-indicator-badge';
const BADGE_PREPARING_CLASS = 'plos-cs-recording-indicator-badge--preparing';
const COUNTDOWN_CLASS = 'plos-cs-recording-indicator-countdown';
const STOP_BUTTON_CLASS = 'plos-cs-recording-indicator-stop';
const CANCEL_BUTTON_CLASS = 'plos-cs-recording-indicator-cancel';

const DEFAULT_MAX_DURATION_SECONDS = 180;

export interface RecordingIndicatorOverlay {
  setRecording(): void;
  setElapsed(elapsedSeconds: number): void;
  destroy(): void;
}

export interface OpenRecordingIndicatorOverlayProps {
  region: Rect;
  onStopClicked(): void;
  onCancelClicked(): void;
  maxDurationSeconds?: number;
}

/** Formats elapsed seconds as M:SS for the countdown display. */
export function formatElapsed(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const min = Math.floor(clamped / 60);
  const sec = clamped % 60;
  const padded = sec < 10 ? `0${String(sec)}` : String(sec);
  return `${String(min)}:${padded}`;
}

let activeIndicator: RecordingIndicatorOverlay | null = null;

export function openRecordingIndicatorOverlay(
  props: OpenRecordingIndicatorOverlayProps,
): RecordingIndicatorOverlay {
  if (activeIndicator !== null) {
    activeIndicator.destroy();
    activeIndicator = null;
  }

  const maxSec = props.maxDurationSeconds ?? DEFAULT_MAX_DURATION_SECONDS;
  const maxText = formatElapsed(maxSec);

  // Region indicator — positioned absolutely at the user's rect.
  const regionEl = document.createElement('div');
  regionEl.className = `${REGION_CLASS} ${REGION_PREPARING_CLASS}`;
  Object.assign(regionEl.style, {
    left: `${String(props.region.x)}px`,
    top: `${String(props.region.y)}px`,
    width: `${String(props.region.width)}px`,
    height: `${String(props.region.height)}px`,
  });
  document.body.appendChild(regionEl);

  // Toolbar — pinned to viewport top-center.
  const toolbarEl = document.createElement('div');
  toolbarEl.className = TOOLBAR_CLASS;

  const badgeEl = document.createElement('span');
  badgeEl.className = `${BADGE_CLASS} ${BADGE_PREPARING_CLASS}`;
  badgeEl.textContent = 'PREPARING…';
  toolbarEl.appendChild(badgeEl);

  const countdownEl = document.createElement('span');
  countdownEl.className = COUNTDOWN_CLASS;
  countdownEl.textContent = `0:00 / ${maxText}`;
  toolbarEl.appendChild(countdownEl);

  const stopBtn = document.createElement('button');
  stopBtn.className = STOP_BUTTON_CLASS;
  stopBtn.type = 'button';
  stopBtn.textContent = 'Stop';
  stopBtn.addEventListener('click', () => {
    props.onStopClicked();
  });
  toolbarEl.appendChild(stopBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = CANCEL_BUTTON_CLASS;
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    props.onCancelClicked();
  });
  toolbarEl.appendChild(cancelBtn);

  document.body.appendChild(toolbarEl);

  let destroyed = false;

  function setRecording(): void {
    if (destroyed) return;
    regionEl.className = `${REGION_CLASS} ${REGION_RECORDING_CLASS}`;
    badgeEl.className = BADGE_CLASS;
    badgeEl.textContent = 'REC ●';
  }

  function setElapsed(elapsedSeconds: number): void {
    if (destroyed) return;
    countdownEl.textContent = `${formatElapsed(elapsedSeconds)} / ${maxText}`;
  }

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    regionEl.remove();
    toolbarEl.remove();
    if (activeIndicator === indicator) {
      activeIndicator = null;
    }
  }

  const indicator: RecordingIndicatorOverlay = {
    setRecording,
    setElapsed,
    destroy,
  };
  activeIndicator = indicator;
  return indicator;
}
