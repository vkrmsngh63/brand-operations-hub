// Pure-logic helpers for the Module 2 region-screenshot path (session 6
// 2026-05-13). Sibling of captured-image-validation.ts — kept dependency-free
// so node:test exercises it without DOM, canvas, Blob, or chrome.* surfaces.
//
// The actual canvas/Image/captureVisibleTab work lives in
// content-script/region-screenshot-overlay.ts. This file owns the math:
//   1. Normalize a user-drawn drag (mousedown → mouseup, any direction) into
//      a positive-width-height Rect.
//   2. Clamp the rect to viewport bounds — users can drag past the edge
//      while the mouse leaves the window; we clip rather than reject.
//   3. Detect when the rect touches a viewport edge — used by the
//      orchestrator to decide whether to attach an "edge-touched" flag in
//      the §B audit trail (the always-visible banner per STACK_DECISIONS §4
//      is rendered unconditionally by the overlay).
//   4. Guard against too-small rects (accidental clicks without drag).
//   5. Compute drawImage source/dest params given the rect in CSS pixels +
//      devicePixelRatio (the captured PNG is at device resolution).
//   6. Parse a data:image/...;base64,... URL into a { mimeType, bytes }
//      pair — the overlay then wraps as `new Blob([bytes], { type })` to
//      feed the existing image-capture-form pipeline.

/**
 * Minimum rectangle dimension below which we treat the gesture as an
 * accidental click rather than a deliberate region selection. Chosen low
 * enough that users dragging a few pixels still get a capture, high enough
 * that a single click (0×0 rect) is filtered out cleanly. 8 px matches the
 * smallest legitimate region a user might want to capture (e.g., a tiny
 * badge); below that, the resulting image is unusable.
 */
export const MIN_REGION_DIMENSION_PX = 8;

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  /** CSS pixels from viewport left edge. */
  x: number;
  /** CSS pixels from viewport top edge. */
  y: number;
  /** CSS pixels. */
  width: number;
  /** CSS pixels. */
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

/**
 * Source/dest params for canvas.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh).
 * Source coords are device pixels (captureVisibleTab returns image at device
 * resolution). Destination is the cropped output canvas; we preserve device
 * resolution so retina captures stay sharp when displayed back in PLOS at
 * the user's perceived CSS-pixel dimensions.
 */
export interface CropParams {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
  destWidth: number;
  destHeight: number;
}

/**
 * Parsed data-URL components — what the overlay needs to wrap as a Blob
 * for the existing image-capture-form upload path.
 */
export interface ParsedDataUrl {
  mimeType: string;
  bytes: Uint8Array;
}

/**
 * Normalize a drag (start, end) into a positive-width-height rect. Users can
 * drag in any of 4 directions; we always produce a rect with positive width
 * and height by min/max-ing the coordinates.
 */
export function rectFromDrag(start: Point, end: Point): Rect {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { x, y, width, height };
}

/**
 * Clip a rect to viewport bounds. Returns null if the resulting rect is
 * degenerate (zero or negative area), which signals to the orchestrator
 * that the user's drag was entirely outside the viewport — refuse to
 * capture.
 */
export function clampRectToViewport(
  rect: Rect,
  viewport: Viewport,
): Rect | null {
  const x = Math.max(0, Math.min(rect.x, viewport.width));
  const y = Math.max(0, Math.min(rect.y, viewport.height));
  const right = Math.max(0, Math.min(rect.x + rect.width, viewport.width));
  const bottom = Math.max(0, Math.min(rect.y + rect.height, viewport.height));
  const width = right - x;
  const height = bottom - y;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

/**
 * Whether the rect's bounding box touches any of the four viewport edges
 * within `threshold` CSS pixels. Default threshold matches the "edge-touched"
 * informational signal — most browsers report rounded coordinates so a
 * pixel of slack avoids false negatives. Used by the orchestrator's audit
 * payload; the always-visible UX hint banner is rendered unconditionally
 * per STACK_DECISIONS §4 (decided 2026-05-13 session-6 mid-build).
 */
export function rectTouchesViewportEdge(
  rect: Rect,
  viewport: Viewport,
  threshold = 1,
): boolean {
  return (
    rect.x <= threshold ||
    rect.y <= threshold ||
    rect.x + rect.width >= viewport.width - threshold ||
    rect.y + rect.height >= viewport.height - threshold
  );
}

/**
 * Whether either dimension is below MIN_REGION_DIMENSION_PX. The orchestrator
 * uses this to filter accidental clicks (0×0 or near-zero rects from a
 * mousedown+mouseup at nearly the same coordinate) before invoking
 * captureVisibleTab — saves a background round-trip on a doomed capture.
 */
export function isRectTooSmall(rect: Rect): boolean {
  return (
    rect.width < MIN_REGION_DIMENSION_PX || rect.height < MIN_REGION_DIMENSION_PX
  );
}

/**
 * Map a CSS-pixel rect into drawImage source/dest params for the device-pixel
 * captured image. deviceScaleFactor is window.devicePixelRatio — captureVisibleTab
 * returns the image at the renderer's frame-buffer resolution, which on retina
 * displays is 2× the CSS pixels. Preserving device resolution in the cropped
 * output keeps the image sharp when displayed in PLOS at the user's perceived
 * size.
 *
 * NOTE: callers are expected to pass an already-clamped, non-degenerate rect
 * (use clampRectToViewport first). The math here trusts inputs are positive.
 */
export function computeCropParams(
  rect: Rect,
  deviceScaleFactor: number,
): CropParams {
  const scale = deviceScaleFactor > 0 ? deviceScaleFactor : 1;
  const sourceX = Math.round(rect.x * scale);
  const sourceY = Math.round(rect.y * scale);
  const sourceWidth = Math.round(rect.width * scale);
  const sourceHeight = Math.round(rect.height * scale);
  return {
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destWidth: sourceWidth,
    destHeight: sourceHeight,
  };
}

/**
 * Parse a data:image/<subtype>;base64,<payload> URL into its MIME type and
 * decoded bytes. Throws Error if the URL is malformed or not base64-encoded.
 * The overlay calls `new Blob([bytes], { type: mimeType })` on the result
 * to package the cropped output for the image-capture-form pipeline.
 *
 * Limited to base64 encoding — the captureVisibleTab + canvas.toDataURL
 * pipeline always produces base64. URL-encoded data URLs (percent-escaped
 * payload) are out of scope for this helper and would throw.
 */
export function parseDataUrl(dataUrl: string): ParsedDataUrl {
  const match = /^data:([^;,]+);base64,(.*)$/i.exec(dataUrl);
  if (!match || match[1] === undefined || match[2] === undefined) {
    throw new Error(
      'parseDataUrl: input is not a base64-encoded data URL of shape "data:<mime>;base64,<payload>"',
    );
  }
  const mimeType = match[1].trim().toLowerCase();
  const base64 = match[2];
  const bytes = decodeBase64(base64);
  return { mimeType, bytes };
}

/**
 * Decode a standard base64 string into bytes. Uses atob() when available
 * (browser content-script context) and falls back to Buffer.from() under
 * node:test. Throws if both are unavailable.
 */
function decodeBase64(base64: string): Uint8Array {
  const trimmed = base64.replace(/\s+/g, '');
  // Browser path — content script + popup + service worker.
  const atobFn = (globalThis as { atob?: (s: string) => string }).atob;
  if (typeof atobFn === 'function') {
    const binary = atobFn(trimmed);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }
  // Node path — tests under node --test --experimental-strip-types.
  const bufferFn = (globalThis as { Buffer?: { from: (s: string, enc: string) => Uint8Array } }).Buffer;
  if (bufferFn && typeof bufferFn.from === 'function') {
    const buf = bufferFn.from(trimmed, 'base64');
    return new Uint8Array(buf);
  }
  throw new Error('parseDataUrl: no base64 decoder available (atob or Buffer)');
}
