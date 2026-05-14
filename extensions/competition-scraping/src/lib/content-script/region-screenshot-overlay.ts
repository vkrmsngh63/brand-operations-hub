// Module 2 region-screenshot — content-script overlay (session 6 2026-05-13).
//
// Renders a full-viewport transparent overlay with a crosshair cursor, captures
// the user's drag-rectangle, then:
//   1. Requests `chrome.tabs.captureVisibleTab` via the background (MV3 makes
//      this a background-only API; we route through the BackgroundRequest
//      `capture-visible-tab` envelope).
//   2. Decodes the returned base64 PNG into a hidden <img>.
//   3. Crops to the user's rectangle via canvas.drawImage at device-pixel
//      resolution (preserves retina sharpness; see region-screenshot.ts
//      computeCropParams).
//   4. Exports the cropped canvas via canvas.toDataURL('image/png') and hands
//      the resulting data URL to the existing image-capture-form with
//      sourceType: 'region-screenshot'.
//
// UX per COMPETITION_SCRAPING_STACK_DECISIONS.md §4 + §A.7:
//   - Crosshair cursor while overlay is armed.
//   - Always-visible banner at top of overlay with the §4 hint copy (the
//     director-approved choice 2026-05-13 was "always-on banner, not only
//     when rect hits edge").
//   - Drag rectangle drawn with a thin white border + black inset/outset
//     shadow (visible against any host-page color).
//   - "Dim outside" via four side panels that follow the rect's bounds.
//   - Cancel via Escape (matches text-capture / url-add / image-capture forms).
//   - Single capture per arming — after a successful capture, the overlay
//     closes; user re-clicks the popup button for another region.

import { requestVisibleTabCapture } from './api-bridge.ts';
import {
  clampRectToViewport,
  computeCropParams,
  isRectTooSmall,
  rectFromDrag,
  type Point,
  type Rect,
} from '../region-screenshot.ts';

const OVERLAY_CLASS = 'plos-cs-region-screenshot-overlay';
const BANNER_CLASS = 'plos-cs-region-screenshot-banner';
const RECT_CLASS = 'plos-cs-region-screenshot-rect';
const DIM_CLASS = 'plos-cs-region-screenshot-dim';
const PROCESSING_CLASS = 'plos-cs-region-screenshot-processing';

const BANNER_COPY =
  'Drag a rectangle around the module — release to capture, or press Esc to cancel. ' +
  'If the module is taller than your screen, scroll to fit it first; for very tall ' +
  'modules, capture in two halves.';

export interface RegionScreenshotOverlay {
  /** Removes the overlay from the DOM and detaches all listeners. Idempotent. */
  destroy(): void;
}

export interface OpenRegionScreenshotOverlayProps {
  /**
   * Invoked when the user releases the mouse on a valid (non-degenerate)
   * rectangle and the cropped image is ready. The handler typically opens
   * the image-capture-form with sourceType='region-screenshot'.
   *
   * The caller is responsible for tearing down the overlay (via the returned
   * RegionScreenshotOverlay.destroy()) once the form is open or saved. The
   * overlay does NOT auto-destroy on capture — the orchestrator owns the
   * lifecycle so error paths can keep the overlay open for retry.
   *
   * If you prefer auto-destroy, the orchestrator can call destroy() inside
   * the handler. The capturedDataUrl is a `data:image/png;base64,...` URL
   * the image-capture-form treats identically to a CDN srcUrl.
   */
  onCaptured(capturedDataUrl: string): void;
  /**
   * Invoked when the user cancels (Escape) or the gesture produces an
   * unusable rect (degenerate, too small, or entirely outside viewport).
   * Receives a short reason code so the orchestrator can decide whether to
   * surface a friendly hint or just silently re-arm. Currently the
   * orchestrator destroys the overlay on cancel regardless of reason.
   */
  onCancel(reason: 'escape' | 'rect-too-small' | 'rect-outside-viewport'): void;
  /**
   * Invoked when the capture pipeline (captureVisibleTab → decode → crop →
   * toDataURL) throws. The orchestrator surfaces a friendly inline error
   * and destroys the overlay; the user re-arms via the popup button.
   */
  onError(message: string): void;
}

let activeOverlay: RegionScreenshotOverlay | null = null;

/**
 * Arms the region-screenshot overlay on the current viewport. If another
 * overlay is already active, it's torn down first.
 */
export function openRegionScreenshotOverlay(
  props: OpenRegionScreenshotOverlayProps,
): RegionScreenshotOverlay {
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

  // Four dim panels — initially the top panel covers the whole viewport;
  // the other three are zero-sized. While the user drags, all four update
  // to wrap the rectangle.
  const dimTop = document.createElement('div');
  const dimRight = document.createElement('div');
  const dimBottom = document.createElement('div');
  const dimLeft = document.createElement('div');
  [dimTop, dimRight, dimBottom, dimLeft].forEach((el) => {
    el.className = DIM_CLASS;
    overlayEl.appendChild(el);
  });
  // Pre-drag: top panel covers viewport.
  Object.assign(dimTop.style, {
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
  });

  // Rectangle — hidden until the user starts dragging.
  const rectEl = document.createElement('div');
  rectEl.className = RECT_CLASS;
  rectEl.style.display = 'none';
  overlayEl.appendChild(rectEl);

  document.body.appendChild(overlayEl);

  // ── Drag state ────────────────────────────────────────────────────────
  let dragStart: Point | null = null;
  let dragging = false;

  function paintRect(rect: Rect): void {
    rectEl.style.display = 'block';
    rectEl.style.left = `${rect.x}px`;
    rectEl.style.top = `${rect.y}px`;
    rectEl.style.width = `${rect.width}px`;
    rectEl.style.height = `${rect.height}px`;
    // Update the four dim panels to wrap the rect.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    Object.assign(dimTop.style, {
      top: '0',
      left: '0',
      width: `${vw}px`,
      height: `${rect.y}px`,
    });
    Object.assign(dimRight.style, {
      top: `${rect.y}px`,
      left: `${rect.x + rect.width}px`,
      width: `${vw - rect.x - rect.width}px`,
      height: `${rect.height}px`,
    });
    Object.assign(dimBottom.style, {
      top: `${rect.y + rect.height}px`,
      left: '0',
      width: `${vw}px`,
      height: `${vh - rect.y - rect.height}px`,
    });
    Object.assign(dimLeft.style, {
      top: `${rect.y}px`,
      left: '0',
      width: `${rect.x}px`,
      height: `${rect.height}px`,
    });
  }

  function handleMouseDown(event: MouseEvent): void {
    // Only respond to the primary button; ignore right-click + middle-click
    // so the user's existing context menus stay functional.
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

  async function handleMouseUp(event: MouseEvent): Promise<void> {
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

    // Swap to processing state — hide the rect + dim panels; show centered
    // spinner copy. captureVisibleTab + decode + crop is usually <500ms but
    // can spike on large viewports.
    rectEl.style.display = 'none';
    [dimTop, dimRight, dimBottom, dimLeft].forEach((el) => {
      el.style.display = 'none';
    });
    const processing = document.createElement('div');
    processing.className = PROCESSING_CLASS;
    processing.textContent = 'Capturing region…';
    overlayEl.appendChild(processing);

    try {
      const capturedDataUrl = await captureAndCrop(clamped);
      props.onCaptured(capturedDataUrl);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not capture this region (unknown error).';
      props.onError(message);
    }
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
  // (e.g., search bars) don't intercept the cancel.
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

  const overlay: RegionScreenshotOverlay = { destroy };
  activeOverlay = overlay;
  return overlay;
}

/**
 * The capture pipeline: ask background for the visible-tab PNG, decode into
 * an Image, draw a cropped slice into a canvas, export as a base64 PNG
 * data URL. Throws on any phase failure with a human-readable message.
 */
async function captureAndCrop(rect: Rect): Promise<string> {
  const captured = await requestVisibleTabCapture();
  // Background returns a `data:image/png;base64,...` URL of the visible
  // viewport at device-pixel resolution. We decode it into a hidden Image
  // and draw to a canvas to crop.
  const img = await loadImage(captured.dataUrl);

  const dpr = window.devicePixelRatio || 1;
  const crop = computeCropParams(rect, dpr);
  const canvas = document.createElement('canvas');
  canvas.width = crop.destWidth;
  canvas.height = crop.destHeight;
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    throw new Error('Could not create a 2D drawing context to crop the region.');
  }
  ctx.drawImage(
    img,
    crop.sourceX,
    crop.sourceY,
    crop.sourceWidth,
    crop.sourceHeight,
    0,
    0,
    crop.destWidth,
    crop.destHeight,
  );
  // PNG output — lossless; the captured PNG was lossless to begin with so
  // re-encode as JPEG would only introduce artifacts. File size is
  // bounded by the 5 MB cap enforced in fetchImageBytes during Save.
  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error('Could not decode the captured viewport image.'));
    img.src = src;
  });
}
