// "Already saved" recognition icon per COMPETITION_SCRAPING_DESIGN.md §B
// 2026-05-07-g end-of-session addendum item 1.
//
// Rendered to the LEFT of every competitor product link whose normalized
// URL matches a saved CompetitorUrl for the current Project. Visually
// distinct from the floating "+ Add" button (different color — green vs
// blue; different glyph — checkmark vs +) so the two affordances don't
// get confused.
//
// Each icon attaches to the link's parent so it's positioned inline with
// the link's text (display: inline-flex). On removal (e.g., URL deleted
// from PLOS), the icon DOM element is removed and the link returns to
// its original presentation.
//
// We attach a `data-plos-cs-icon-for` attribute on the icon AND on the
// linked anchor so the orchestrator can find + clean up icons during
// rescans without leaking duplicates.

const ATTR_ICON_ANCHOR = 'data-plos-cs-icon-for';
const ATTR_LINK_HAS_ICON = 'data-plos-cs-has-icon';

/**
 * Inserts an "already saved" icon as a sibling immediately BEFORE `link`,
 * IF one is not already attached. Idempotent — calling twice is a no-op.
 *
 * `canonicalUrl` is recorded on the icon element so the orchestrator can
 * map icons back to URLs during cleanup.
 */
export function attachAlreadySavedIcon(
  link: HTMLElement,
  canonicalUrl: string,
): void {
  if (link.getAttribute(ATTR_LINK_HAS_ICON) === '1') return;
  if (!link.parentNode) return;

  const icon = document.createElement('span');
  icon.className = 'plos-cs-saved-icon';
  icon.setAttribute(ATTR_ICON_ANCHOR, canonicalUrl);
  icon.setAttribute('aria-label', 'This URL is already saved in your project');
  icon.title = 'Already in your project';
  icon.textContent = '✓';

  link.parentNode.insertBefore(icon, link);
  link.setAttribute(ATTR_LINK_HAS_ICON, '1');
}

/**
 * Removes the "already saved" icon attached for the given link, if any.
 * Used when a URL is deleted from PLOS (deferred to a future session that
 * adds the delete affordance) or when the orchestrator re-scans and the
 * link no longer matches any saved CompetitorUrl.
 */
export function detachAlreadySavedIcon(link: HTMLElement): void {
  if (link.getAttribute(ATTR_LINK_HAS_ICON) !== '1') return;
  const prev = link.previousElementSibling;
  if (
    prev &&
    prev.classList.contains('plos-cs-saved-icon') &&
    prev.hasAttribute(ATTR_ICON_ANCHOR)
  ) {
    prev.remove();
  }
  link.removeAttribute(ATTR_LINK_HAS_ICON);
}

/**
 * Removes ALL plos-cs-saved-icon elements from the page. Called when the
 * orchestrator tears down (e.g., user signs out or switches projects).
 */
export function detachAllAlreadySavedIcons(): void {
  document.querySelectorAll('.plos-cs-saved-icon').forEach((n) => n.remove());
  document
    .querySelectorAll(`[${ATTR_LINK_HAS_ICON}="1"]`)
    .forEach((n) => n.removeAttribute(ATTR_LINK_HAS_ICON));
}
