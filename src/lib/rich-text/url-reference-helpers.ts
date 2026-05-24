// W#2 P-46 Workstream 4 Session 2 (2026-05-25) — pure helpers for the
// internal-hyperlink TipTap extension on the per-Project Comprehensive
// Competitor Analysis page.
//
// Design source: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §A.5 + §C.4
// Session 2.
//
// Shorthand storage shape: the editor doc stores `<a href="#url/<urlId>">`
// marks (the existing Link mark from W2 S1; href is the shorthand). At
// click time the extension resolves the shorthand to a same-tab Next.js
// route navigation `/projects/<projectId>/competition-scraping/url/<urlId>`.
// The shorthand is what's persisted; the full path is never written to
// storage. This way the doc travels intact across Projects (though in v1
// every doc is per-Project so the projectId is implicit).
//
// Kept free of @tiptap/* and React imports so the helpers stay testable
// via `node:test` without pulling in browser-only ProseMirror deps.

// The shorthand syntax recognized by the UrlReferenceExtension. Stored as
// the href value on Link marks in the TipTap doc JSON; resolves at click
// time to a Next.js route navigation.
export const URL_REFERENCE_HREF_PREFIX = '#url/';

// Matches what Prisma generates: a uuid v4 produced by `@default(uuid())`
// on CompetitorUrl.id. Tolerant — we don't strictly validate uuid v4
// shape; any non-empty alphanumeric+dash slug after `#url/` counts so
// downstream renames of the id format (cuid, ulid, slug) don't break
// stored docs silently.
const URL_ID_VALID_CHARS = /^[A-Za-z0-9_-]+$/;

/**
 * Returns the urlId from a `#url/<urlId>` shorthand href, or null when the
 * input is not a recognized shorthand.
 *
 * Tolerates null/undefined/non-string inputs (returns null). Rejects empty
 * urlId (`#url/`), urlIds containing slashes or other path separators
 * (`#url/abc/def`), and inputs missing the prefix.
 */
export function extractUrlIdFromHref(href: unknown): string | null {
  if (typeof href !== 'string') return null;
  if (!href.startsWith(URL_REFERENCE_HREF_PREFIX)) return null;
  const rest = href.slice(URL_REFERENCE_HREF_PREFIX.length);
  if (rest.length === 0) return null;
  if (!URL_ID_VALID_CHARS.test(rest)) return null;
  return rest;
}

/**
 * Builds the full Next.js route path for a CompetitorUrl detail page given
 * a projectId + urlId. Both arguments are trusted strings (callers must
 * validate). Used by the editor's click-interceptor when resolving the
 * shorthand at click time.
 */
export function buildInternalUrlPath(
  projectId: string,
  urlId: string
): string {
  return `/projects/${projectId}/competition-scraping/url/${urlId}`;
}

/**
 * Builds the shorthand href stored on a Link mark in the editor doc.
 * Inverse of extractUrlIdFromHref. Used by the LinkToUrlPicker when
 * inserting a new internal-hyperlink mark.
 */
export function buildInternalUrlHref(urlId: string): string {
  return `${URL_REFERENCE_HREF_PREFIX}${urlId}`;
}

// Subset of CompetitorUrl shape the picker uses for filtering + display.
// Kept narrow so the filter helper doesn't depend on the full wire-type
// module (which has Prisma transitive deps).
export interface UrlPickerEntry {
  id: string;
  url: string;
  productName: string | null;
  brandName: string | null;
}

/**
 * Filter a list of UrlPickerEntry rows by a free-text query. Case-
 * insensitive substring match across `productName`, `brandName`, and
 * `url`. Empty / whitespace-only query returns the full list unchanged.
 * Ordering preserved from the input (callers sort upstream if needed).
 */
export function filterUrlsByQuery(
  urls: readonly UrlPickerEntry[],
  query: string
): UrlPickerEntry[] {
  const trimmed = typeof query === 'string' ? query.trim().toLowerCase() : '';
  if (trimmed.length === 0) return urls.slice();
  return urls.filter((u) => {
    if (u.productName && u.productName.toLowerCase().includes(trimmed)) return true;
    if (u.brandName && u.brandName.toLowerCase().includes(trimmed)) return true;
    if (u.url && u.url.toLowerCase().includes(trimmed)) return true;
    return false;
  });
}

/**
 * Default display label for a picked URL row when the picker inserts it
 * as link text. Prefers productName, then brandName, then the URL itself.
 * Trimmed; never returns an empty string for a row with any of the three
 * fields populated.
 */
export function defaultLinkLabelForUrl(entry: UrlPickerEntry): string {
  const candidates = [entry.productName, entry.brandName, entry.url];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const t = c.trim();
      if (t.length > 0) return t;
    }
  }
  return entry.url ?? '';
}
