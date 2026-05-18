// P-39 sticky URL pre-selection — pure helpers for the popup's
// "Attach to which saved URL?" dropdown.
//
// Storage write/read is wired in `popup-state.ts` (the canonical
// chrome.storage.local I/O wrapper for popup state). This module is the
// pure decision logic — testable in node:test without mocking chrome.storage.

export interface UrlForStickyPreselect {
  id: string;
}

/**
 * Decides which URL id should be pre-selected in the popup's URL dropdown,
 * given the current `urls` list and an optional `storedPref` (the user's
 * last-selected URL id for this Project + Platform, from chrome.storage.local).
 *
 * Fall-back ladder:
 *   1. If `storedPref` matches an existing url's id → return that id.
 *   2. P-38: if exactly 1 saved URL exists → return its id.
 *   3. Otherwise → return '' (placeholder).
 *
 * Edge cases handled:
 *   - storedPref undefined or '' → treated as no preference.
 *   - storedPref points to a deleted URL → fall back to rule 2/3.
 *   - empty urls list → '' (the popup wouldn't render the dropdown anyway,
 *     but defensive return).
 */
export function getStickyPreselectedUrlId(
  urls: UrlForStickyPreselect[],
  storedPref: string | undefined,
): string {
  if (storedPref) {
    const matched = urls.find((u) => u.id === storedPref);
    if (matched) return matched.id;
  }
  const onlyUrl = urls[0];
  if (urls.length === 1 && onlyUrl) {
    return onlyUrl.id;
  }
  return '';
}

/**
 * Builds the chrome.storage.local key for a (projectId, platform) tuple.
 * Scoped per-combo so different Project + Platform pairs don't
 * cross-contaminate each other's sticky preference.
 */
export function makeStickyUrlPreselectKey(
  projectId: string,
  platform: string,
): string {
  return `plos-cs-popup-url-pref-${projectId}-${platform}`;
}
