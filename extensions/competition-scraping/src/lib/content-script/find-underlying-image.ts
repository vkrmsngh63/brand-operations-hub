// P-23 (2026-05-14) — element-walk helper for the Amazon main-image
// right-click context-menu fix.
//
// Background: on Amazon's product-listing page, the main product <img> is
// wrapped in zoom/overlay elements that intercept the `contextmenu` event
// before Chrome recognizes the right-click target as matching
// `contexts: ['image']`. So Chrome's native "Add to PLOS — Image" menu
// (registered with that context in background.ts) never fires. Affects only
// Amazon — Walmart/eBay/Etsy use direct <img> tags without zoom overlays.
//
// The P-23 fix widens background.ts's contexts from `['image']` to `['all']`
// so the menu ALWAYS fires, then falls back to a content-script-side image
// lookup when Chrome doesn't populate `info.srcUrl` (because the right-click
// target wasn't an <img>). This file is that lookup.
//
// findUnderlyingImage walks up from the right-click target (up to a bounded
// depth) and scans each ancestor's immediate descendants for an <img>
// element. Returns the first image's src OR null if none is found within
// the bound. Bounded depth protects against pathological DOM trees and
// keeps the cost per right-click negligible.

/**
 * Maximum depth of ancestors to walk up from the right-click target.
 *
 * Amazon's zoom/overlay nesting on the product-listing page measured at
 * ~3-5 levels during the deploy-#10 cross-platform smoke session
 * (`<div class="imgTagWrapper"><div class="a-fixed-left-grid"><img></div></div>`
 * shape, possibly with one more overlay div). 10 covers that with margin
 * without scanning the whole page on every right-click.
 */
const MAX_ANCESTOR_DEPTH = 10;

/**
 * Walks up from `target` (up to MAX_ANCESTOR_DEPTH) and finds the first
 * `<img>` element either AT each level (target itself or an ancestor) OR
 * among each ancestor's immediate-descendant tree. Returns the `<img>`'s
 * resolved `src` URL, or `null` if no usable image is found.
 *
 * The "immediate-descendant tree" scan is what unlocks the Amazon pattern:
 * the right-clicked overlay div is typically a SIBLING of the underlying
 * <img>, not an ancestor — so walking only up from `target` misses it.
 * Scanning each ancestor's descendants finds the sibling.
 *
 * Returns the FIRST image found in the walk, prioritizing closeness to the
 * right-click target (smallest ancestor-up distance wins). Behavior on a
 * direct `<img>` target: returns target.src immediately.
 */
export function findUnderlyingImage(target: Element | null): string | null {
  if (!target) return null;

  let cursor: Element | null = target;
  let depth = 0;

  while (cursor && depth <= MAX_ANCESTOR_DEPTH) {
    // (a) Is the cursor itself an <img>?
    if (isUsableImageElement(cursor)) {
      return readImageSrc(cursor as HTMLImageElement);
    }

    // (b) Does cursor contain an <img> as a descendant? querySelector returns
    // the first <img> in document order within cursor's subtree — typically
    // the visually-largest one when the overlay/wrapper has a single image.
    const descendantImg = cursor.querySelector('img');
    if (descendantImg && isUsableImageElement(descendantImg)) {
      const src = readImageSrc(descendantImg);
      if (src) return src;
    }

    cursor = cursor.parentElement;
    depth += 1;
  }

  return null;
}

/**
 * Whether `el` is an `<img>` with a non-empty `src`. The src attribute may
 * resolve via `srcset` at runtime — `el.currentSrc` gives the browser-
 * picked URL; `el.src` gives the attribute resolution. Prefer currentSrc
 * when available so the captured image matches what the user sees.
 */
function isUsableImageElement(el: Element): boolean {
  if (el.tagName !== 'IMG') return false;
  const img = el as HTMLImageElement;
  return Boolean(img.currentSrc || img.src);
}

/**
 * Returns the browser's actually-picked URL for `img` (currentSrc, which
 * respects srcset + viewport-dependent variants). Falls back to `src` for
 * cases where currentSrc hasn't been computed yet (image not yet rendered).
 */
function readImageSrc(img: HTMLImageElement): string | null {
  const src = img.currentSrc || img.src;
  return src || null;
}
