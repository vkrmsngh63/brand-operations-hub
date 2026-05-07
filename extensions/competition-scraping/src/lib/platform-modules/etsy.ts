// Etsy product-detail-page detection module.
//
// Per COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #2:
//   Etsy: `/listing/{id}` only.
//
// Listing IDs are 8-10 digit numbers. URL forms:
//   /listing/123456789                       — bare ID
//   /listing/123456789/title-slug-here       — slug-suffixed (common)
//   /listing/123456789/title-slug-here?...   — with query string
//
// Etsy is internationalized via subpath on the same host (etsy.com/dk-en/...);
// the listing path appears AFTER any locale prefix, so the regex doesn't
// anchor on `^/`. The canonical URL form preserves the locale prefix when
// present so saved URLs reflect the user's actual browsing context.

import type { PlatformModule } from './types.ts';

// /listing/  — Etsy's listing route.
// (\d+)      — capture the listing ID (any digits).
// (?=/|$|\?|#)
const LISTING_RE = /\/listing\/(\d+)(?=\/|$|\?|#)/;

export const etsy: PlatformModule = {
  platform: 'etsy',
  hostnames: ['etsy.com'],

  matchesProduct(href: string): boolean {
    if (typeof href !== 'string' || href.length === 0) return false;
    return LISTING_RE.test(href);
  },

  canonicalProductUrl(href: string): string | null {
    if (typeof href !== 'string' || href.length === 0) return null;
    const m = href.match(LISTING_RE);
    if (!m) return null;
    let parsed: URL;
    try {
      parsed = new URL(href);
    } catch {
      return null;
    }
    // Etsy's title-slug suffix is informational; strip it for canonical form.
    // Locale prefix (if any) sits BEFORE /listing/ — preserve it by
    // truncating at the listing-ID boundary while keeping the leading path.
    const idx = parsed.pathname.indexOf('/listing/');
    if (idx === -1) return null;
    const canonicalPath = `${parsed.pathname.slice(0, idx)}/listing/${m[1]}`;
    return `${parsed.protocol}//${parsed.host}${canonicalPath}`;
  },
};
