// P-27 (2026-05-22) — element-walk helper for the captured-videos
// right-click context-menu gesture. Parallel to find-underlying-image.ts,
// but the search has THREE outcomes instead of one because video capture
// supports two source kinds per CAPTURED_VIDEOS_DESIGN.md §A.7:
//
//   1. Direct  — an inline <video> element on the page; the extension
//      uploads its bytes (sourceType='DIRECT_BYTES') + a canvas frame-grab
//      thumbnail.
//   2. Embed   — an <iframe> whose hostname matches one of the recognized
//      video-embed platforms (YouTube / Vimeo / Wistia / Brightcove /
//      Dailymotion / Loom) per §A.6. The extension stores the iframe's
//      `src` URL only (sourceType='EMBED'); no bytes, no thumbnail (the
//      platform's own thumbnail URL is computed at render time).
//   3. None    — the right-click target is neither, and neither sits under
//      a reachable ancestor within the bounded walk depth.
//
// The walk mirrors find-underlying-image.ts's pattern (climb up `target`'s
// ancestors up to MAX_ANCESTOR_DEPTH, scanning each level's descendants).
// Priority at every level: direct wins over embed when both are reachable
// at the SAME depth — direct gives us actual video bytes, the most
// authoritative capture. Closer matches win over farther matches (smallest
// ancestor-up distance), same dedupe rationale as the image helper.
//
// Embed-hostname pattern recognition delegates to detectEmbedPlatform from
// src/lib/competition-video-storage-helpers.ts — Build #1 already encodes
// the 6-platform allowlist + 13 URL-pattern regexes there. Single source of
// truth; the helper composes rather than re-encoding.
//
// Build #8 (2026-05-23) — stacked-elements fallback. The ancestor-only
// walk misses videos rendered into a SIBLING DOM subtree under a different
// stacking context — common on Amazon's hover-preview overlay where the
// transient preview <video> is injected into an absolutely-positioned
// container that does NOT live in the click target's ancestor chain.
// document.elementsFromPoint(x, y) returns ALL elements stacked at a
// screen-space point (in z-order, top first), including overlays AND the
// elements they cover. After the primary ancestor walk returns 'none' we
// run the same per-element walk against each stacked element (skipping the
// first one — that's the original target we already walked). First match
// wins, so we still prefer the topmost element. Covers Bug #9 + #14a from
// Build #7 director real-Chrome verification.

import { detectEmbedPlatform } from '../../../../../src/lib/competition-video-storage-helpers.ts';

/**
 * Maximum depth of ancestors to walk up from the right-click target.
 * 10 matches find-underlying-image.ts — generous enough for overlay-
 * wrapped videos (most platforms nest video wrappers 3-5 deep) without
 * scanning the whole page on every right-click.
 */
const MAX_ANCESTOR_DEPTH = 10;

export type FindUnderlyingVideoResult =
  | {
      kind: 'direct';
      /** The <video>'s currentSrc (or src fallback). The background's
       * fetchVideoBytes() loads this. */
      src: string;
      /** The <video><source type="..."> attribute, when present. Used as a
       * hint by the form's pre-flight check; the authoritative MIME is the
       * Content-Type the CDN serves. Null when the <video> has no <source>
       * children OR the children omit `type`. */
      mimeType: string | null;
      /** The actual <video> DOM node, used by the form's canvas frame-grab
       * to produce a thumbnail JPEG (canvas.drawImage requires the live
       * element, not just a URL). Always populated for direct results. */
      element: HTMLVideoElement;
    }
  | {
      kind: 'embed';
      /** The embed platform's short name as returned by detectEmbedPlatform
       * (e.g. 'youtube', 'vimeo', 'wistia', 'brightcove', 'dailymotion',
       * 'loom'). The form stores `originalSrcUrl` with this URL + records
       * sourceType='EMBED'. */
      platform: string;
      /** The iframe's `src` attribute as-is — the form stores this in
       * `originalSrcUrl` for the CapturedVideo row. */
      src: string;
    }
  | {
      kind: 'none';
    };

/**
 * Walks up from `target` (up to MAX_ANCESTOR_DEPTH) looking for either an
 * inline <video> OR a recognized video-embed <iframe>. Returns a normalized
 * result the form consumes directly. See top-of-file comment for priority
 * rules + design rationale.
 *
 * Behavior on null target: returns `{kind:'none'}` (mirrors the image
 * helper's null-target handling).
 *
 * Behavior on a direct <video> target: returns kind='direct' immediately at
 * depth 0.
 *
 * Behavior on a direct <iframe> target: depends on src — if the iframe's
 * src matches an embed pattern, returns kind='embed'; otherwise the helper
 * continues climbing in case a recognized embed lives elsewhere in the
 * ancestor scan (rare in practice but harmless).
 *
 * Build #8 stacked-elements fallback (2026-05-23): when the ancestor-only
 * walk returns 'none' AND the caller supplied click coordinates, run the
 * same walk against every element returned by
 * `document.elementsFromPoint(clickX, clickY)` (skipping the first — that
 * IS the original target). This catches videos rendered into a sibling
 * subtree under a different stacking context (Amazon's transient hover-
 * preview overlay being the load-bearing motivating case). The
 * `getStackedElements` injection point exists for unit-test access; in
 * production it defaults to `document.elementsFromPoint`.
 */
export interface FindUnderlyingVideoEmbedOptions {
  /** Viewport-space click coordinates from the contextmenu event. When
   * present, enables the stacked-elements fallback after the ancestor walk
   * returns 'none'. */
  clickX?: number;
  clickY?: number;
  /** Injection seam — production passes `document.elementsFromPoint`. Tests
   * pass a stub. Returns the stacked elements at (x, y) in z-order, top
   * first; the same shape as the DOM API. */
  getStackedElements?: (x: number, y: number) => readonly Element[];
}

export function findUnderlyingVideoEmbed(
  target: Element | null,
  options?: FindUnderlyingVideoEmbedOptions,
): FindUnderlyingVideoResult {
  if (!target) return { kind: 'none' };

  const primary = walkFromElement(target);
  if (primary.kind !== 'none') return primary;

  // Stacked-elements fallback. The ancestor walk missed; try every element
  // that the cursor was over at right-click time. document.elementsFromPoint
  // returns them in z-order (top first) so we still prefer the topmost
  // match — first walkable result wins.
  const clickX = options?.clickX;
  const clickY = options?.clickY;
  if (typeof clickX !== 'number' || typeof clickY !== 'number') {
    return { kind: 'none' };
  }
  const getStacked =
    options?.getStackedElements ?? defaultGetStackedElements;
  const stacked = getStacked(clickX, clickY);
  for (const el of stacked) {
    if (el === target) continue; // already walked
    const result = walkFromElement(el);
    if (result.kind !== 'none') return result;
  }

  return { kind: 'none' };
}

/**
 * Single-start-point walk. Climbs `start` to MAX_ANCESTOR_DEPTH, scanning
 * each ancestor's direct + descendant video/iframe contents.
 */
function walkFromElement(start: Element): FindUnderlyingVideoResult {
  let cursor: Element | null = start;
  let depth = 0;

  while (cursor && depth <= MAX_ANCESTOR_DEPTH) {
    // (a) Direct <video>: cursor itself OR a descendant. Direct wins over
    // embed at the same level — we'd rather upload bytes than store a URL.
    if (isUsableVideoElement(cursor)) {
      const direct = readDirectFromVideo(cursor as HTMLVideoElement);
      if (direct) return direct;
    }
    const descendantVideo = cursor.querySelector('video');
    if (descendantVideo && isUsableVideoElement(descendantVideo)) {
      const direct = readDirectFromVideo(descendantVideo);
      if (direct) return direct;
    }

    // (b) Embed iframe: cursor itself OR a descendant. Only counts when the
    // src matches one of the recognized video-embed patterns.
    if (isIframeElement(cursor)) {
      const embed = readEmbedFromIframe(cursor as HTMLIFrameElement);
      if (embed) return embed;
    }
    const descendantIframes = cursor.querySelectorAll('iframe');
    for (const iframe of Array.from(descendantIframes)) {
      const embed = readEmbedFromIframe(iframe as HTMLIFrameElement);
      if (embed) return embed;
    }

    cursor = cursor.parentElement;
    depth += 1;
  }

  return { kind: 'none' };
}

function defaultGetStackedElements(
  x: number,
  y: number,
): readonly Element[] {
  if (typeof document === 'undefined' || !document.elementsFromPoint) {
    return [];
  }
  return Array.from(document.elementsFromPoint(x, y));
}

function isUsableVideoElement(el: Element): boolean {
  if (el.tagName !== 'VIDEO') return false;
  const v = el as HTMLVideoElement;
  if (v.currentSrc || v.src) return true;
  // Build #8 (2026-05-23): also accept a <video> whose URL lives only on a
  // <source> child. Common pattern for native HTML5 players that haven't
  // started loading yet (currentSrc unpopulated) but have a static
  // <source src="..."> declared in the markup — Ebay's product-listing
  // video player follows this shape on cold right-click before autoplay.
  // Without this branch the helper returns 'none' on those videos, which
  // is the Bug #13 silent-fail symptom.
  for (const sourceEl of Array.from(v.querySelectorAll('source'))) {
    const sourceSrc = (sourceEl as HTMLSourceElement).getAttribute('src');
    if (sourceSrc && sourceSrc.trim().length > 0) return true;
  }
  return false;
}

function isIframeElement(el: Element): boolean {
  return el.tagName === 'IFRAME';
}

function readDirectFromVideo(
  video: HTMLVideoElement,
): FindUnderlyingVideoResult | null {
  let src = video.currentSrc || video.src || '';
  if (!src) {
    // Build #8 fallback (2026-05-23): pick the first <source src="..."> when
    // the <video> itself has neither currentSrc nor src yet. Pairs with the
    // isUsableVideoElement loosening above; both branches must move together
    // or this returns null and the form receives an empty src.
    for (const sourceEl of Array.from(video.querySelectorAll('source'))) {
      const sourceSrc = (sourceEl as HTMLSourceElement).getAttribute('src');
      if (sourceSrc && sourceSrc.trim().length > 0) {
        src = sourceSrc.trim();
        break;
      }
    }
  }
  if (!src) return null;
  // <video><source type="video/mp4" src="..."></video> — the first matching
  // <source>'s `type` attribute is the hint we surface to the form. Browsers
  // pick which <source> to use; we just preview the first non-empty type.
  let mimeType: string | null = null;
  const sources = video.querySelectorAll('source');
  for (const sourceEl of Array.from(sources)) {
    const type = (sourceEl as HTMLSourceElement).getAttribute('type');
    if (type && type.trim()) {
      mimeType = type.trim().toLowerCase();
      break;
    }
  }
  return {
    kind: 'direct',
    src,
    mimeType,
    element: video,
  };
}

function readEmbedFromIframe(
  iframe: HTMLIFrameElement,
): FindUnderlyingVideoResult | null {
  const src = iframe.src || '';
  if (!src) return null;
  const platform = detectEmbedPlatform(src);
  if (!platform) return null;
  return {
    kind: 'embed',
    platform,
    src,
  };
}
