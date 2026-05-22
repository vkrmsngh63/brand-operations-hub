// Module 2 region-record overlay — content-script (P-45 Build #1b 2026-05-22).
//
// Forked from region-screenshot-overlay.ts per CAPTURED_VIDEOS_DESIGN.md
// §C.13. ~80% of the file is reused verbatim — overlay element creation,
// banner, dim panels, drag-rectangle drawing, Esc cancel listener. The
// differences:
//
//   - banner copy: announces RECORDING semantics + 3-min cap.
//   - on valid mouseup: invokes `onRegionPicked(rect)` (the orchestrator
//     then hands the rect to RecordController.start()) INSTEAD OF the
//     screenshot pipeline's captureAndCrop. No spinner — the overlay
//     destroys itself immediately on valid mouseup; the indicator-overlay
//     takes over the visual surface.
//   - no `onCaptured` / `onError` callbacks — the overlay does NOT own the
//     recording pipeline. Cancel reasons mirror the screenshot overlay so
//     orchestrator code paths stay parallel.
//
// Pure rect math (rectFromDrag, clampRectToViewport, isRectTooSmall) is
// shared with the screenshot overlay via region-screenshot.ts; the same
// tests in region-screenshot.test.ts cover that surface.

import {
  clampRectToViewport,
  isRectTooSmall,
  rectFromDrag,
  type Point,
  type Rect,
} from '../region-screenshot.ts';

const OVERLAY_CLASS = 'plos-cs-video-region-record-overlay';
const BANNER_CLASS = 'plos-cs-video-region-record-banner';
const RECT_CLASS = 'plos-cs-video-region-record-rect';
const DIM_CLASS = 'plos-cs-video-region-record-dim';

export const BANNER_COPY =
  'Drag a rectangle around the area to record — release to start recording. ' +
  'Audio + video; up to about 3 minutes per clip.';

export type VideoRegionRecordCancelReason =
  | 'escape'
  | 'rect-too-small'
  | 'rect-outside-viewport';

export interface VideoRegionRecordOverlay {
  /** Removes the overlay from the DOM and detaches all listeners.
   *  Idempotent — calling destroy() after the overlay has already been
   *  torn down is a no-op. */
  destroy(): void;
}

export interface OpenVideoRegionRecordOverlayProps {
  /**
   * Invoked when the user releases the mouse on a valid (non-degenerate)
   * rectangle. The handler typically destroys the overlay + creates the
   * RecordController + opens the recording-indicator-overlay.
   *
   * The caller is responsible for calling destroy() on the returned
   * overlay handle once it has taken over the visual surface. The overlay
   * does NOT auto-destroy on region-picked — the orchestrator owns the
   * lifecycle so error paths can keep the overlay open for retry.
   */
  onRegionPicked(rect: Rect): void;
  /**
   * Invoked when the user cancels (Escape) or the gesture produces an
   * unusable rect (degenerate, too small, or entirely outside viewport).
   * The orchestrator typically destroys the overlay on any cancel reason.
   */
  onCancel(reason: VideoRegionRecordCancelReason): void;
}

let activeOverlay: VideoRegionRecordOverlay | null = null;

/**
 * Arms the region-record overlay on the current viewport. If another
 * overlay is already active, it's torn down first (mirrors the
 * region-screenshot-overlay singleton pattern).
 */
export function openVideoRegionRecordOverlay(
  props: OpenVideoRegionRecordOverlayProps,
): VideoRegionRecordOverlay {
  if (activeOverlay !== null) {
    activeOverlay.destroy();
    activeOverlay = null;
  }

  const overlayEl = document.createElement('div');
  overlayEl.className = OVERLAY_CLASS;
  overlayEl.setAttribute('role', 'presentation');

  const banner = document.createElement('div');
  banner.className = BANNER_CLASS;
  banner.appendChild(document.createTextNode(BANNER_COPY + ' Cancel with '));
  const kbd = document.createElement('kbd');
  kbd.textContent = 'Esc';
  banner.appendChild(kbd);
  banner.appendChild(document.createTextNode('.'));
  overlayEl.appendChild(banner);

  // Four dim panels — initially the top panel covers the viewport; the
  // other three are zero-sized. While the user drags, all four update to
  // wrap the rectangle (visually "dim outside the rect").
  const dimTop = document.createElement('div');
  const dimRight = document.createElement('div');
  const dimBottom = document.createElement('div');
  const dimLeft = document.createElement('div');
  [dimTop, dimRight, dimBottom, dimLeft].forEach((el) => {
    el.className = DIM_CLASS;
    overlayEl.appendChild(el);
  });
  Object.assign(dimTop.style, {
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
  });

  const rectEl = document.createElement('div');
  rectEl.className = RECT_CLASS;
  rectEl.style.display = 'none';
  overlayEl.appendChild(rectEl);

  document.body.appendChild(overlayEl);

  let dragStart: Point | null = null;
  let dragging = false;

  function paintRect(rect: Rect): void {
    rectEl.style.display = 'block';
    rectEl.style.left = `${String(rect.x)}px`;
    rectEl.style.top = `${String(rect.y)}px`;
    rectEl.style.width = `${String(rect.width)}px`;
    rectEl.style.height = `${String(rect.height)}px`;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    Object.assign(dimTop.style, {
      top: '0',
      left: '0',
      width: `${String(vw)}px`,
      height: `${String(rect.y)}px`,
    });
    Object.assign(dimRight.style, {
      top: `${String(rect.y)}px`,
      left: `${String(rect.x + rect.width)}px`,
      width: `${String(vw - rect.x - rect.width)}px`,
      height: `${String(rect.height)}px`,
    });
    Object.assign(dimBottom.style, {
      top: `${String(rect.y + rect.height)}px`,
      left: '0',
      width: `${String(vw)}px`,
      height: `${String(vh - rect.y - rect.height)}px`,
    });
    Object.assign(dimLeft.style, {
      top: `${String(rect.y)}px`,
      left: '0',
      width: `${String(rect.x)}px`,
      height: `${String(rect.height)}px`,
    });
  }

  function handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;
    event.preventDefault();
    dragStart = { x: event.clientX, y: event.clientY };
    dragging = true;
  }

  function handleMouseMove(event: MouseEvent): void {
    if (!dragging || dragStart === null) return;
    event.preventDefault();
    const rect = rectFromDrag(dragStart, {
      x: event.clientX,
      y: event.clientY,
    });
    paintRect(rect);
  }

  function handleMouseUp(event: MouseEvent): void {
    if (!dragging || dragStart === null) return;
    event.preventDefault();
    dragging = false;
    const rawRect = rectFromDrag(dragStart, {
      x: event.clientX,
      y: event.clientY,
    });
    dragStart = null;

    const clamped = clampRectToViewport(rawRect, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    if (clamped === null) {
      props.onCancel('rect-outside-viewport');
      return;
    }
    if (isRectTooSmall(clamped)) {
      props.onCancel('rect-too-small');
      return;
    }
    // Valid rect — hand off to orchestrator immediately. NO processing
    // spinner per §C.13 (the indicator-overlay takes over the visual
    // surface within ms when MediaRecorder enters the recording state).
    props.onRegionPicked(clamped);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      props.onCancel('escape');
    }
  }

  overlayEl.addEventListener('mousedown', handleMouseDown);
  overlayEl.addEventListener('mousemove', handleMouseMove);
  overlayEl.addEventListener('mouseup', handleMouseUp);
  // Capture-phase keydown on window so the host page's own Esc handlers
  // (e.g., search bars, modal close-on-Esc) don't intercept the cancel.
  window.addEventListener('keydown', handleKeyDown, true);

  function destroy(): void {
    overlayEl.removeEventListener('mousedown', handleMouseDown);
    overlayEl.removeEventListener('mousemove', handleMouseMove);
    overlayEl.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('keydown', handleKeyDown, true);
    overlayEl.remove();
    if (activeOverlay === overlay) {
      activeOverlay = null;
    }
  }

  const overlay: VideoRegionRecordOverlay = { destroy };
  activeOverlay = overlay;
  return overlay;
}
