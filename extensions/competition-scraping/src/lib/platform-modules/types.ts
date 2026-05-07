// Per-platform DOM-pattern module contract.
//
// Per COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrails
// (per-platform DOM-pattern modules) and §15 Q7 (build session per platform):
// each platform declares its own product-detail-page pattern + canonical-URL
// extractor here. The content-script orchestrator (entrypoints/content.ts)
// looks up the module via the registry and uses it for:
//
//   1. Detection — which links on the page count as competitor product links?
//   2. Canonicalization — given a matching link.href, what's the canonical URL
//      to pre-fill into the URL-add overlay form (and to compare against
//      saved CompetitorUrl rows for the "already saved" recognition)?
//   3. Hostname routing — does the current page's hostname belong to this
//      platform? (Used to decide whether to run this module's detection at all.)
//
// Modules must be PURE: no DOM access, no chrome.* access, no fetch. That keeps
// each module testable via node:test without a browser environment.

export interface PlatformModule {
  /**
   * Platform value matching CompetitorUrl.platform — same string used by the
   * popup's selectedPlatform, the API's platform query param, and the
   * shared-types Platform union (`amazon` | `ebay` | `etsy` | `walmart` | ...).
   */
  readonly platform: string;

  /**
   * Hostnames where this module's detection should run. Suffix-matched: an
   * entry like `'amazon.com'` matches `www.amazon.com`, `smile.amazon.com`,
   * `amazon.com` exactly, etc. International TLDs (amazon.co.uk, amazon.de)
   * are NOT covered today — they'd require a separate host_permissions entry
   * AND a separate module instance (additive change in a future session).
   */
  readonly hostnames: readonly string[];

  /**
   * Returns true when `href` is a product-detail-page URL on this platform.
   * Cheap; called once per anchor in the page DOM (and again on each
   * MutationObserver callback for SPA pages with infinite scroll).
   */
  matchesProduct(href: string): boolean;

  /**
   * Returns the canonical product URL form for `href`, or null when `href`
   * is not a product-detail link on this platform. Canonical form preserves
   * protocol + host (so amazon.com vs amazon.co.uk stay distinct in storage)
   * but strips known volatile path-suffixes (Amazon's `/ref=sr_1_3`, Walmart's
   * optional title slug) so two browsing sessions of the same product produce
   * the same canonical URL.
   *
   * Used for:
   *   - Pre-filling the URL-add overlay form when the user clicks +Add.
   *   - Comparison against the recognition cache (after the comparison-time
   *     `normalizeUrlForRecognition` strips `?...` per §B 2026-05-07-g).
   */
  canonicalProductUrl(href: string): string | null;
}
