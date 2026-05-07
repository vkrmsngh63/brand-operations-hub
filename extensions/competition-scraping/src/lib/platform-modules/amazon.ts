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

import type { PlatformModule } from './types.ts';

// (?:dp|gp/product) — both URL forms map to the same ASIN.
// ([A-Z0-9]{10})    — capture the 10-char ASIN.
// (?=/|$|\?|#)      — followed by a path boundary; prevents false-match on
//                    11+ char runs (Amazon ASINs are exactly 10 chars).
const ASIN_RE = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|$|\?|#)/;

export const amazon: PlatformModule = {
  platform: 'amazon',
  hostnames: ['amazon.com'],

  matchesProduct(href: string): boolean {
    if (typeof href !== 'string' || href.length === 0) return false;
    return ASIN_RE.test(href);
  },

  canonicalProductUrl(href: string): string | null {
    if (typeof href !== 'string' || href.length === 0) return null;
    const m = href.match(ASIN_RE);
    if (!m) return null;
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}/dp/${m[1]}`;
  },
};
