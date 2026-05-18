// URL normalization for the "already saved" recognition checks.
//
// Per COMPETITION_SCRAPING_DESIGN.md §B 2026-05-07-g end-of-session addendum:
// before comparing a candidate URL against the saved CompetitorUrl list,
// strip `?` and everything after — i.e. drop the entire query string.
// Reason: tracking tokens (UTM params, click-IDs), session IDs, sort/filter
// params vary between browsing sessions and would cause false-negatives
// ("user has saved URL X but the search page shows X with a different
// query-string and the icon doesn't appear").
//
// IMPORTANT: this helper is comparison-time only. Saved CompetitorUrl.url
// rows keep their FULL URL as-typed (the §A.7 brief lets the user edit
// the URL during capture; storage is the canonical user-intent record).
// Storage is NEVER passed through this normalizer; only the recognition
// lookup path is.
//
// Fragment (`#…`) is NOT stripped today per the explicit director directive
// quoted verbatim in the §B entry: "the part of the url that includes the
// ? symbol and everything after that". Fragments are typically navigational
// anchors within the same page, not tracking-token noise; if a counter-
// example surfaces during waypoint #1 verification, this rule can be
// extended additively.

/**
 * Strips `?` and everything after from `url` for recognition comparison.
 * Preserves protocol, host, path, and fragment unchanged. Returns the
 * empty string when given non-string or empty input (defensive — content
 * scripts walking the DOM occasionally encounter `null` or `undefined`
 * `.href` attributes via attribute reflection).
 */
export function normalizeUrlForRecognition(url: unknown): string {
  if (typeof url !== 'string' || url.length === 0) return '';
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return url;
  return url.slice(0, queryStart);
}

/**
 * Returns true when `a` and `b` reference the same URL after normalization.
 * Convenience wrapper around `normalizeUrlForRecognition`. Comparison is
 * exact (case-sensitive) — competitor-platform URLs are case-significant
 * (Amazon ASINs, Etsy listing IDs, etc.).
 */
export function urlsMatchAfterNormalization(
  a: unknown,
  b: unknown,
): boolean {
  const na = normalizeUrlForRecognition(a);
  const nb = normalizeUrlForRecognition(b);
  if (na === '' || nb === '') return false;
  return na === nb;
}

/**
 * Builds a `Set<string>` of normalized URLs from a list of saved
 * CompetitorUrl rows. The content script's recognition cache calls this
 * once per page-load and uses the resulting Set for O(1) hover-time
 * lookups.
 *
 * Drops entries that don't have a string `.url` — defends against future
 * server-shape changes without crashing the content script.
 *
 * P-21 (2026-05-18-c): optional `canonicalize` parameter — when provided,
 * each row's URL is collapsed to its canonical product form (e.g. Amazon's
 * slug-variant `/Product-Name/dp/{ASIN}/ref=…` → `/dp/{ASIN}`) BEFORE
 * normalization. This makes the Set's contents symmetric with the orchestrator's
 * hover-time lookup path at `orchestrator.ts:307-309` and `:263` which already
 * canonicalize the LEFT side of the lookup. Without symmetric canonicalization,
 * a saved row stored as a slug-variant would fail to match a hover-time
 * canonical lookup (and vice versa). When `canonicalize` is omitted, OR when
 * it returns null for a given row's URL, the row's URL is used as-is —
 * preserves backward-compatible behavior for callers that don't have access
 * to a platform module + for non-product rows like search/listing page URLs.
 */
export function buildRecognitionSet(
  rows: ReadonlyArray<{ readonly url?: unknown }>,
  canonicalize?: (href: string) => string | null,
): Set<string> {
  const out = new Set<string>();
  for (const row of rows) {
    const rawUrl = row?.url;
    const canonicalRowUrl =
      typeof rawUrl === 'string' && canonicalize
        ? canonicalize(rawUrl) ?? rawUrl
        : rawUrl;
    const normalized = normalizeUrlForRecognition(canonicalRowUrl);
    if (normalized !== '') out.add(normalized);
  }
  return out;
}
