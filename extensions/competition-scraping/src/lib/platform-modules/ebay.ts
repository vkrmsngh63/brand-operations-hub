// Ebay product-detail-page detection module.
//
// Per COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #2:
//   Ebay: `/itm/{listing-id}` only.
//
// Listing IDs are 9-13 digit numbers. URL forms encountered in the wild:
//   /itm/123456789012                  — bare listing ID (deep links + most search results)
//   /itm/Some-Title-Slug/123456789012  — slug-prefixed (less common; older URLs)
//
// Canonical URL form: `{protocol}//{host}/itm/{listing-id}` — strips the
// optional title slug so two URL forms for the same listing collapse.

import type { PlatformModule } from './types.ts';

// /itm/                       — Ebay's listing route.
// (?:[^/?#]+/)?               — optional title slug (non-slash chars + /).
// (\d{8,})                    — 8+ digit listing ID. Capture the ID.
// (?=/|$|\?|#)                — path boundary.
const ITM_RE = /\/itm\/(?:[^/?#]+\/)?(\d{8,})(?=\/|$|\?|#)/;

export const ebay: PlatformModule = {
  platform: 'ebay',
  hostnames: ['ebay.com'],

  matchesProduct(href: string): boolean {
    if (typeof href !== 'string' || href.length === 0) return false;
    return ITM_RE.test(href);
  },

  canonicalProductUrl(href: string): string | null {
    if (typeof href !== 'string' || href.length === 0) return null;
    const m = href.match(ITM_RE);
    if (!m) return null;
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}/itm/${m[1]}`;
  },
};
