// P-24 "Already saved" recognition icon for image elements. Mirror of
// already-saved-icon.ts but anchored to <img> tags rather than <a> tags.
//
// One icon per matched <img>. The icon is a small green ✓ overlay
// (`position: fixed`) pinned to the image's top-right corner via
// `getBoundingClientRect()` coordinates. Re-positioning on scroll/resize is
// the caller's responsibility (the orchestrator wires a throttled scroll
// listener).
//
// On removal (URL change, teardown, image no longer matches), the icon DOM
// node is removed and the <img> returns to its original presentation. Each
// icon carries a `data-plos-cs-image-icon-for` attribute recording which
// saved row id it represents — used by the orchestrator's reconciliation
// pass to find existing icons to update or detach.

const ATTR_ICON_FOR_IMAGE_ID = 'data-plos-cs-image-icon-for';
const ATTR_IMG_HAS_ICON = 'data-plos-cs-image-has-icon';
const ICON_CLASS = 'plos-cs-saved-image-icon';

export interface AttachedImageIcon {
  iconEl: HTMLElement;
  imgEl: HTMLImageElement;
  savedImageId: string;
  reposition(): void;
}

/**
 * Inserts an "already saved" overlay icon at the top-right of `img`, IF the
 * image does not already have one. Idempotent — calling twice for the same
 * (img, savedImageId) pair returns the existing icon's record.
 *
 * `savedImageId` is recorded on the icon element so the orchestrator can map
 * icons back to CapturedImage rows during cleanup.
 */
export function attachAlreadySavedImageIcon(
  img: HTMLImageElement,
  savedImageId: string,
): AttachedImageIcon | null {
  if (img.getAttribute(ATTR_IMG_HAS_ICON) === savedImageId) {
    const existing = document.querySelector<HTMLElement>(
      `.${ICON_CLASS}[${ATTR_ICON_FOR_IMAGE_ID}="${cssEscape(savedImageId)}"]`,
    );
    if (existing) {
      return { iconEl: existing, imgEl: img, savedImageId, reposition: () => reposition(existing, img) };
    }
  }

  // Skip images with no rendered geometry — re-checked on each scan, so
  // images that load lazily get picked up on a later rescan.
  const rect = img.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const icon = document.createElement('span');
  icon.className = ICON_CLASS;
  icon.setAttribute(ATTR_ICON_FOR_IMAGE_ID, savedImageId);
  icon.setAttribute(
    'aria-label',
    'This image is already saved in your project',
  );
  icon.title = 'Already saved to PLOS';
  icon.textContent = '✓';

  document.body.appendChild(icon);
  img.setAttribute(ATTR_IMG_HAS_ICON, savedImageId);
  reposition(icon, img);

  return {
    iconEl: icon,
    imgEl: img,
    savedImageId,
    reposition: () => reposition(icon, img),
  };
}

/**
 * Recomputes the icon's `top`/`left` based on the image's current bounding
 * rect. Called on scroll/resize and after each MutationObserver rescan.
 *
 * Exported for unit-testing — the orchestrator never calls this directly;
 * it goes through the AttachedImageIcon record's `reposition()`.
 */
export function reposition(icon: HTMLElement, img: HTMLImageElement): void {
  const rect = img.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    icon.style.display = 'none';
    return;
  }
  // Pin to the image's top-right corner, with a small overhang so the
  // checkmark sits visually OUTSIDE the image rather than covering content.
  // The 28×28 icon's center sits roughly on the corner.
  const top = Math.max(2, rect.top - 6);
  const left = Math.max(2, rect.right - 22);
  icon.style.top = `${top}px`;
  icon.style.left = `${left}px`;
  icon.style.display = 'inline-flex';
}

/**
 * Removes the icon for one saved row's id, if any. Used when a CapturedImage
 * row is no longer in the active recognition set (e.g., user deleted the row
 * via the PLOS-side UI in another tab and the orchestrator's next rescan
 * fetched a fresh list without it).
 */
export function detachAlreadySavedImageIcon(savedImageId: string): void {
  const icon = document.querySelector<HTMLElement>(
    `.${ICON_CLASS}[${ATTR_ICON_FOR_IMAGE_ID}="${cssEscape(savedImageId)}"]`,
  );
  if (icon) icon.remove();
  document
    .querySelectorAll<HTMLImageElement>(
      `img[${ATTR_IMG_HAS_ICON}="${cssEscape(savedImageId)}"]`,
    )
    .forEach((el) => el.removeAttribute(ATTR_IMG_HAS_ICON));
}

/**
 * Removes ALL plos-cs-saved-image-icon elements from the page. Called when
 * the orchestrator tears down (sign-out, project switch, page navigation).
 */
export function detachAllAlreadySavedImageIcons(): void {
  document.querySelectorAll(`.${ICON_CLASS}`).forEach((n) => n.remove());
  document
    .querySelectorAll(`[${ATTR_IMG_HAS_ICON}]`)
    .forEach((n) => n.removeAttribute(ATTR_IMG_HAS_ICON));
}

// CSS.escape is the standard way to escape an attribute selector value, but
// the lib.dom typings don't always surface it in node:test environments. We
// fall back to a conservative regex that strips characters that would
// otherwise need escaping in an attribute selector.
function cssEscape(value: string): string {
  if (typeof (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS?.escape === 'function') {
    return (globalThis as { CSS: { escape: (s: string) => string } }).CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}
