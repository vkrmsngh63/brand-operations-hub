// Amazon product-detail-page detection module.
//
// Per COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #2:
//   Amazon: `/dp/{ASIN}` and `/gp/product/{ASIN}` only.
//
// ASIN format: 10-character alphanumeric (uppercase letters + digits). The
// regex anchors on path boundaries (`/`, end-of-string, `?`, `#`) so it
// doesn't false-match a 10-char run of letters that happens to follow `/dp/`
// in some unrelated path.
//
// Canonical URL form: `{protocol}//{host}/dp/{ASIN}` — strips Amazon's
// volatile `/ref=sr_1_3` (search-result-position) and other path noise.
// Same product reached from search vs. category vs. deep-link all collapse
// to the same canonical URL.
//
// SSPA sponsored-ads handling (P-4 fix 2026-05-08-d): Amazon's sponsored-ad
// links route through `https://www.amazon.com/sspa/click?...&url=<URL-
// encoded path with /dp/{ASIN}>`. Without special handling these would
// have NO "+ Add" button because their pathname is `/sspa/click`, not
// `/dp/...`. Both matchesProduct and canonicalProductUrl peek inside the
// `url=` query param when pathname is `/sspa/click` and re-run ASIN_RE.

import type { PlatformModule } from './types.ts';

// (?:dp|gp/product) — both URL forms map to the same ASIN.
// ([A-Z0-9]{10})    — capture the 10-char ASIN.
// (?=/|$|\?|#)      — followed by a path boundary; prevents false-match on
//                    11+ char runs (Amazon ASINs are exactly 10 chars).
const ASIN_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|$|\?|#)/;

const SSPA_PATHNAME = '/sspa/click';

/**
 * If `href` is an Amazon sponsored-ad SSPA-redirect URL
 * (`/sspa/click?...&url=<encoded path>`), returns the decoded inner URL
 * with the original protocol + host applied. Returns null otherwise.
 *
 * `URL.searchParams.get` auto-decodes once, so the returned `url=` value
 * is path-form like `/Title/dp/{ASIN}/ref=...` — we prepend
 * `${protocol}//${host}` so the result is a full URL on which ASIN_RE
 * can run identically to the direct-link case.
 */
function decodeSspaInner(href: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }
  if (parsed.pathname !== SSPA_PATHNAME) return null;
  const inner = parsed.searchParams.get('url');
  if (!inner || inner.length === 0) return null;
  return `${parsed.protocol}//${parsed.host}${inner}`;
}

export const amazon: PlatformModule = {
  platform: 'amazon',
  hostnames: ['amazon.com'],

  matchesProduct(href: string): boolean {
    if (typeof href !== 'string' || href.length === 0) return false;
    if (ASIN_RE.test(href)) return true;
    const inner = decodeSspaInner(href);
    if (inner !== null && ASIN_RE.test(inner)) return true;
    return false;
  },

  canonicalProductUrl(href: string): string | null {
    if (typeof href !== 'string' || href.length === 0) return null;
    // Direct /dp/ or /gp/product/ path.
    const direct = href.match(ASIN_RE);
    if (direct) {
      let parsed: URL;
      try {
        parsed = new URL(href);
      } catch {
        return null;
      }
      return `${parsed.protocol}//${parsed.host}/dp/${direct[1]}`;
    }
    // SSPA sponsored-ad redirect path.
    const inner = decodeSspaInner(href);
    if (inner !== null) {
      const m = inner.match(ASIN_RE);
      if (m) {
        let innerParsed: URL;
        try {
          innerParsed = new URL(inner);
        } catch {
          return null;
        }
        return `${innerParsed.protocol}//${innerParsed.host}/dp/${m[1]}`;
      }
    }
    return null;
  },
};
