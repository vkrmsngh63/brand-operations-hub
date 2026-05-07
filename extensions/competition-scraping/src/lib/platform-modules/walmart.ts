// Walmart product-detail-page detection module.
//
// Per COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #2:
//   Walmart: `/ip/{slug}/{id}` only.
//
// Walmart product URLs come in two forms:
//   /ip/Title-Slug-Here/12345678
//   /ip/12345678                  — slug-less (less common; older URLs)
//
// The numeric ID is the canonical identifier. Title slug is volatile (Walmart
// occasionally rewrites slugs without changing the ID); canonical form drops
// the slug.

import type { PlatformModule } from './types.ts';

// /ip/                        — Walmart's product route.
// (?:[^/?#]+/)?               — optional title slug.
// (\d+)                       — capture numeric ID.
// (?=/|$|\?|#)                — path boundary.
const IP_RE = /\/ip\/(?:[^/?#]+\/)?(\d+)(?=\/|$|\?|#)/;

export const walmart: PlatformModule = {
  platform: 'walmart',
  hostnames: ['walmart.com'],

  matchesProduct(href: string): boolean {
    if (typeof href !== 'string' || href.length === 0) return false;
    return IP_RE.test(href);
  },

  canonicalProductUrl(href: string): string | null {
    if (typeof href !== 'string' || href.length === 0) return null;
    const m = href.match(IP_RE);
    if (!m) return null;
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}/ip/${m[1]}`;
  },
};
