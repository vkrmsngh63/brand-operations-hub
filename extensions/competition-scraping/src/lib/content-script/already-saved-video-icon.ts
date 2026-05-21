// P-27 Build #4 "Already saved" recognition icon for video elements. Mirror
// of already-saved-image-icon.ts but anchored to <video> AND <iframe> tags
// (the two element types that can be the source of a CapturedVideo per the
// design doc §A.7 sourceType discriminator: <video> → DIRECT_BYTES,
// recognized <iframe> → EMBED).
//
// One icon per matched element. The icon is a small green ✓ overlay
// (`position: fixed`) pinned to the element's top-right corner via
// `getBoundingClientRect()` coordinates. Re-positioning on scroll/resize is
// the caller's responsibility (the orchestrator wires the same throttled
// scroll listener that already covers the saved-image icons).
//
// On removal (URL change, teardown, element no longer matches), the icon
// DOM node is removed and the element returns to its original presentation.
// Each icon carries a `data-plos-cs-video-icon-for` attribute recording
// which saved row id it represents — used by the orchestrator's
// reconciliation pass to find existing icons to update or detach.

const ATTR_ICON_FOR_VIDEO_ID = 'data-plos-cs-video-icon-for';
const ATTR_VIDEO_HAS_ICON = 'data-plos-cs-video-has-icon';
const ICON_CLASS = 'plos-cs-saved-video-icon';

export type SavedVideoTargetElement = HTMLVideoElement | HTMLIFrameElement;

export interface AttachedVideoIcon {
  iconEl: HTMLElement;
  targetEl: SavedVideoTargetElement;
  savedVideoId: string;
  reposition(): void;
}

/**
 * Inserts an "already saved" overlay icon at the top-right of `target`, IF
 * the target does not already have one. Idempotent — calling twice for the
 * same (target, savedVideoId) pair returns the existing icon's record.
 *
 * `savedVideoId` is recorded on the icon element so the orchestrator can
 * map icons back to CapturedVideo rows during cleanup.
 */
export function attachAlreadySavedVideoIcon(
  target: SavedVideoTargetElement,
  savedVideoId: string,
): AttachedVideoIcon | null {
  if (target.getAttribute(ATTR_VIDEO_HAS_ICON) === savedVideoId) {
    const existing = document.querySelector<HTMLElement>(
      `.${ICON_CLASS}[${ATTR_ICON_FOR_VIDEO_ID}="${cssEscape(savedVideoId)}"]`,
    );
    if (existing) {
      return {
        iconEl: existing,
        targetEl: target,
        savedVideoId,
        reposition: () => reposition(existing, target),
      };
    }
  }

  // Skip elements with no rendered geometry — re-checked on each scan, so
  // videos that load lazily get picked up on a later rescan.
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  const icon = document.createElement('span');
  icon.className = ICON_CLASS;
  icon.setAttribute(ATTR_ICON_FOR_VIDEO_ID, savedVideoId);
  icon.setAttribute(
    'aria-label',
    'This video is already saved in your project',
  );
  icon.title = 'Already saved to PLOS';
  icon.textContent = '✓';

  document.body.appendChild(icon);
  target.setAttribute(ATTR_VIDEO_HAS_ICON, savedVideoId);
  reposition(icon, target);

  return {
    iconEl: icon,
    targetEl: target,
    savedVideoId,
    reposition: () => reposition(icon, target),
  };
}

/**
 * Recomputes the icon's `top`/`left` based on the target's current bounding
 * rect. Called on scroll/resize and after each MutationObserver rescan.
 *
 * Exported for unit-testing — the orchestrator never calls this directly;
 * it goes through the AttachedVideoIcon record's `reposition()`.
 */
export function reposition(
  icon: HTMLElement,
  target: SavedVideoTargetElement,
): void {
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    icon.style.display = 'none';
    return;
  }
  // Pin to the element's top-right corner, with a small overhang so the
  // checkmark sits visually OUTSIDE the element rather than covering content.
  // Mirrors the image-icon's positioning math.
  const top = Math.max(2, rect.top - 6);
  const left = Math.max(2, rect.right - 22);
  icon.style.top = `${top}px`;
  icon.style.left = `${left}px`;
  icon.style.display = 'inline-flex';
}

/**
 * Removes the icon for one saved row's id, if any. Used when a CapturedVideo
 * row is no longer in the active recognition set (e.g., user deleted the row
 * via the PLOS-side UI in another tab and the orchestrator's next rescan
 * fetched a fresh list without it).
 */
export function detachAlreadySavedVideoIcon(savedVideoId: string): void {
  const icon = document.querySelector<HTMLElement>(
    `.${ICON_CLASS}[${ATTR_ICON_FOR_VIDEO_ID}="${cssEscape(savedVideoId)}"]`,
  );
  if (icon) icon.remove();
  document
    .querySelectorAll<SavedVideoTargetElement>(
      `[${ATTR_VIDEO_HAS_ICON}="${cssEscape(savedVideoId)}"]`,
    )
    .forEach((el) => el.removeAttribute(ATTR_VIDEO_HAS_ICON));
}

/**
 * Removes ALL plos-cs-saved-video-icon elements from the page. Called when
 * the orchestrator tears down (sign-out, project switch, page navigation).
 */
export function detachAllAlreadySavedVideoIcons(): void {
  document.querySelectorAll(`.${ICON_CLASS}`).forEach((n) => n.remove());
  document
    .querySelectorAll(`[${ATTR_VIDEO_HAS_ICON}]`)
    .forEach((n) => n.removeAttribute(ATTR_VIDEO_HAS_ICON));
}

// CSS.escape is the standard way to escape an attribute selector value, but
// the lib.dom typings don't always surface it in node:test environments. We
// fall back to a conservative regex that strips characters that would
// otherwise need escaping in an attribute selector.
function cssEscape(value: string): string {
  if (
    typeof (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS
      ?.escape === 'function'
  ) {
    return (
      globalThis as { CSS: { escape: (s: string) => string } }
    ).CSS.escape(value);
  }
  return value.replace(/["\\]/g, '\\$&');
}
