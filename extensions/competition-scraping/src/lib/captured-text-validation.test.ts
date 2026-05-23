// Tests for the pure-logic helpers used by the Module 2 text-capture
// path (session 4, 2026-05-11).
//
// Run via the workspace's existing `npm test` invocation:
//   npx node --test --experimental-strip-types src/lib/captured-text-validation.test.ts

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTags,
  pickInitialUrl,
  validateCapturedTextDraft,
} from './captured-text-validation.ts';
import type { CompetitorUrl } from '../../../../src/lib/shared-types/competition-scraping.ts';

const ROW_A: CompetitorUrl = {
  id: 'urlid-a',
  projectWorkflowId: 'pw-1',
  platform: 'amazon',
  url: 'https://www.amazon.com/dp/B0DWJTLNYT',
  competitionCategory: null,
  productName: null,
  brandName: null,
  resultsPageRank: null,
  productStarRating: null,
  sellerStarRating: null,
  numProductReviews: null,
  numSellerReviews: null,
  isSponsoredAd: false,
  customFields: {},
  // 2026-05-15-d Slice #2.5 follow-up: source field was added by Slice #1
  // 2026-05-15-b but this test fixture missed the update because the
  // session's verification scoreboard only ran root-level tsc, not the
  // extension's own tsc. Logged in CORRECTIONS_LOG 2026-05-15-d.
  source: 'extension',
  // P-46 Workstream 1 (2026-05-24) — new wire fields per
  // docs/COMPETITION_DATA_V2_DESIGN.md §A.11. Defaults match the
  // post-migration database state (all nullable / defaulted).
  type: null,
  description1: null,
  description2: null,
  price: null,
  competitionScore: null,
  scrapingStatus: 'INCOMPLETE',
  overallCompetitorAnalysis: {},
  overallAnalyses: {},
  addedBy: 'user-1',
  addedAt: '2026-05-11T00:00:00.000Z',
  updatedAt: '2026-05-11T00:00:00.000Z',
};

const ROW_B: CompetitorUrl = {
  ...ROW_A,
  id: 'urlid-b',
  url: 'https://www.amazon.com/dp/B0716F3NFG',
};

describe('normalizeTags', () => {
  it('drops empty + whitespace-only entries', () => {
    assert.deepEqual(normalizeTags(['', '  ', 'wellness']), ['wellness']);
  });

  it('trims surrounding whitespace', () => {
    assert.deepEqual(normalizeTags(['  wellness  ']), ['wellness']);
  });

  it('preserves first-seen casing on case-insensitive dedupe', () => {
    assert.deepEqual(normalizeTags(['Wellness', 'wellness', 'WELLNESS']), [
      'Wellness',
    ]);
  });

  it('preserves insertion order', () => {
    assert.deepEqual(normalizeTags(['c', 'a', 'b', 'a']), ['c', 'a', 'b']);
  });

  it('ignores non-string entries defensively', () => {
    // Cast as any to simulate a runtime value that escaped the type system.
    const out = normalizeTags(['ok', 5 as unknown as string, null as unknown as string, 'good']);
    assert.deepEqual(out, ['ok', 'good']);
  });

  it('returns empty array for empty input', () => {
    assert.deepEqual(normalizeTags([]), []);
  });
});

describe('validateCapturedTextDraft', () => {
  const validDraft = {
    competitorUrlId: 'urlid-a',
    text: 'The bursitis cushion ships in 5 days.',
    contentCategory: 'shipping-claim',
    tags: ['wellness', 'shipping'],
  } as const;

  const fixedUuid = (): string => 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  it('builds the wire payload on a fully-valid draft', () => {
    const result = validateCapturedTextDraft(validDraft, fixedUuid);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.payload.clientId, 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    assert.equal(result.payload.text, validDraft.text);
    assert.equal(result.payload.contentCategory, 'shipping-claim');
    assert.deepEqual(result.payload.tags, ['wellness', 'shipping']);
  });

  it('rejects missing CompetitorUrl', () => {
    const result = validateCapturedTextDraft(
      { ...validDraft, competitorUrlId: '   ' },
      fixedUuid,
    );
    assert.deepEqual(result, { ok: false, reason: 'url-required' });
  });

  it('rejects empty text after trim (form-level rule)', () => {
    const result = validateCapturedTextDraft(
      { ...validDraft, text: '   \n  ' },
      fixedUuid,
    );
    assert.deepEqual(result, { ok: false, reason: 'text-required' });
  });

  it('rejects empty content-category after trim', () => {
    const result = validateCapturedTextDraft(
      { ...validDraft, contentCategory: '   ' },
      fixedUuid,
    );
    assert.deepEqual(result, { ok: false, reason: 'category-required' });
  });

  it('preserves text body verbatim (no trim)', () => {
    // The server allows whitespace-internal text; only the form's empty
    // check trims. The wire payload preserves the original text so the
    // PLOS-side detail-page row keeps the user's formatting.
    const result = validateCapturedTextDraft(
      { ...validDraft, text: '  multi-line\nwith leading spaces  ' },
      fixedUuid,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.payload.text, '  multi-line\nwith leading spaces  ');
  });

  it('trims the content category before sending', () => {
    const result = validateCapturedTextDraft(
      { ...validDraft, contentCategory: '  shipping-claim  ' },
      fixedUuid,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.payload.contentCategory, 'shipping-claim');
  });

  it('normalizes tags before sending (dedupe + trim)', () => {
    const result = validateCapturedTextDraft(
      { ...validDraft, tags: ['wellness', 'WELLNESS', '  shipping  ', ''] },
      fixedUuid,
    );
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.payload.tags, ['wellness', 'shipping']);
  });
});

describe('pickInitialUrl', () => {
  it('returns null for empty rows list', () => {
    assert.equal(pickInitialUrl('https://www.amazon.com/dp/B0DWJTLNYT', []), null);
  });

  it('returns null when no row matches', () => {
    assert.equal(
      pickInitialUrl('https://www.amazon.com/dp/UNRELATED', [ROW_A, ROW_B]),
      null,
    );
  });

  it('returns the row whose normalized URL matches the page URL', () => {
    const picked = pickInitialUrl(
      'https://www.amazon.com/dp/B0716F3NFG',
      [ROW_A, ROW_B],
    );
    assert.equal(picked?.id, 'urlid-b');
  });

  it('matches across query-string noise (tracking params)', () => {
    const picked = pickInitialUrl(
      'https://www.amazon.com/dp/B0DWJTLNYT?ref=sr_1_3&tag=foo',
      [ROW_A, ROW_B],
    );
    assert.equal(picked?.id, 'urlid-a');
  });

  it('returns null for empty page URL', () => {
    assert.equal(pickInitialUrl('', [ROW_A, ROW_B]), null);
  });

  it('returns null for non-string page URL (defensive)', () => {
    // Cast to bypass type system — content scripts can encounter unexpected
    // shapes via location.href reflection on weird pages.
    assert.equal(
      pickInitialUrl(undefined as unknown as string, [ROW_A, ROW_B]),
      null,
    );
  });

  // P-15 fix 2026-05-12 — regression coverage. The pickInitialUrl
  // normalization step strips `?…` (query) but NOT path-level noise like
  // Amazon's `/Product-Name-Slug/dp/{ASIN}/ref=sr_1_3`. Without the
  // optional `canonicalize` step, a slug-variant pageUrl would fail to
  // pre-select its saved-as-`/dp/{ASIN}` row. The optional 3rd argument
  // (passed by text-capture-form.ts:459 as the active platform module's
  // `canonicalProductUrl` extractor) collapses the slug-variant to its
  // canonical form before normalization.
  describe('pickInitialUrl — canonicalize step (P-15)', () => {
    // Stand-in for amazon.canonicalProductUrl — extracts ASIN from /dp/{ASIN}
    // or /gp/product/{ASIN} regardless of any path-prefix slugs or trailing
    // /ref=… segments, returning the canonical `https://www.amazon.com/dp/{ASIN}`.
    const fakeAmazonCanonical = (href: string): string | null => {
      const m = href.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|$|\?|#)/);
      if (!m) return null;
      try {
        const u = new URL(href);
        return `${u.protocol}//${u.host}/dp/${m[1]}`;
      } catch {
        return null;
      }
    };

    it('matches a slug-variant pageUrl to its canonical saved row via canonicalize', () => {
      // ROW_A is saved as the canonical form `https://www.amazon.com/dp/B0DWJTLNYT`.
      // Page URL has the slug prefix + /ref= suffix as Amazon serves them
      // from search-results clicks.
      const slugVariantPageUrl =
        'https://www.amazon.com/Product-Name-Slug/dp/B0DWJTLNYT/ref=sr_1_3';

      // Without canonicalize: the slug-variant fails to match (the P-15 bug).
      assert.equal(
        pickInitialUrl(slugVariantPageUrl, [ROW_A, ROW_B]),
        null,
      );

      // With canonicalize: the slug-variant collapses to /dp/B0DWJTLNYT,
      // matching ROW_A.
      const picked = pickInitialUrl(
        slugVariantPageUrl,
        [ROW_A, ROW_B],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-a');
    });

    it('falls back to the original pageUrl when canonicalize returns null', () => {
      // Non-product page (e.g. search results page) — canonicalize returns
      // null because the URL doesn't match the /dp/{ASIN} pattern. The
      // function should still attempt a match using the original pageUrl
      // (which won't match anything, but should not crash).
      const searchPageUrl = 'https://www.amazon.com/s?k=cat+scratcher';
      assert.equal(
        pickInitialUrl(searchPageUrl, [ROW_A, ROW_B], fakeAmazonCanonical),
        null,
      );
    });

    it('still strips query-string noise when canonicalize is provided', () => {
      // canonicalize may itself strip query (the real platform extractors do),
      // and then `normalizeUrlForRecognition` strips any remaining `?…` from
      // the saved row's url. Composition should produce a clean match.
      const pageUrlWithQuery =
        'https://www.amazon.com/dp/B0DWJTLNYT/ref=sr_1_3?tag=foo&utm_source=bar';
      const picked = pickInitialUrl(
        pageUrlWithQuery,
        [ROW_A, ROW_B],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-a');
    });

    it('is backward-compatible — omitting canonicalize preserves legacy behavior', () => {
      // The pre-P-15 callers (e.g. any future paste-flow context where no
      // platform module is in scope) should keep working exactly as before.
      // Direct /dp/{ASIN} pageUrl still matches via the normalization step
      // alone — the canonicalize parameter is strictly additive.
      const directPageUrl = 'https://www.amazon.com/dp/B0716F3NFG';
      const picked = pickInitialUrl(directPageUrl, [ROW_A, ROW_B]);
      assert.equal(picked?.id, 'urlid-b');
    });

    it('handles a canonicalize fn that always returns null (platform absent)', () => {
      // Simulates `getModuleByPlatform(props.platform)` returning null for
      // an unregistered platform value (e.g. `google-shopping` deferred to a
      // future session). In text-capture-form.ts:459 the call site passes
      // `undefined` for canonicalize when the registry lookup misses, but a
      // defensive caller could also pass a no-op fn. Either way, the
      // function falls back to the raw pageUrl.
      const directPageUrl = 'https://www.amazon.com/dp/B0DWJTLNYT';
      const alwaysNull = () => null;
      const picked = pickInitialUrl(
        directPageUrl,
        [ROW_A, ROW_B],
        alwaysNull,
      );
      assert.equal(picked?.id, 'urlid-a');
    });
  });

  // P-21 fix 2026-05-18-c — symmetric canonicalize regression coverage.
  // The P-15 fix (2026-05-12) only canonicalized the LEFT side (pageUrl)
  // before comparing. If the saved row's URL was itself stored as a slug-
  // variant (e.g. a user pasted `/Product-Name/dp/{ASIN}/ref=…` into the
  // URL-add form), the comparison still string-failed because the RIGHT
  // side (row.url) wasn't canonicalized. P-21 applies canonicalProductUrl
  // symmetrically to both sides. These tests confirm the fix.
  describe('pickInitialUrl — symmetric canonicalize on RIGHT side (P-21)', () => {
    // Same stand-in as the P-15 block above.
    const fakeAmazonCanonical = (href: string): string | null => {
      const m = href.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?=\/|$|\?|#)/);
      if (!m) return null;
      try {
        const u = new URL(href);
        return `${u.protocol}//${u.host}/dp/${m[1]}`;
      } catch {
        return null;
      }
    };

    // A row saved as a slug-variant (user pasted from a search-result click).
    const ROW_SLUG_VARIANT: CompetitorUrl = {
      ...ROW_A,
      id: 'urlid-slug-variant',
      url: 'https://www.amazon.com/Some-Product-Name/dp/B0CTTF514L/ref=sr_1_3',
    };

    // A row saved with the legacy `/gp/product/{ASIN}` shape.
    const ROW_GP_PRODUCT: CompetitorUrl = {
      ...ROW_A,
      id: 'urlid-gp-product',
      url: 'https://www.amazon.com/gp/product/B07XJ8C8F5',
    };

    // A row saved with a trailing slash after the ASIN.
    const ROW_TRAILING_SLASH: CompetitorUrl = {
      ...ROW_A,
      id: 'urlid-trailing-slash',
      url: 'https://www.amazon.com/dp/B0716F3NFG/',
    };

    it('matches a canonical pageUrl against a slug-variant saved row (the P-21 bug)', () => {
      // Before P-21: this returned null because row.url was iterated raw
      // and `/Some-Product-Name/dp/B0CTTF514L/ref=sr_1_3` !== `/dp/B0CTTF514L`.
      const picked = pickInitialUrl(
        'https://www.amazon.com/dp/B0CTTF514L',
        [ROW_A, ROW_SLUG_VARIANT],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-slug-variant');
    });

    it('matches a slug-variant pageUrl against a slug-variant saved row (both sides canonicalized)', () => {
      // Different slug + different ref — only matches because both sides
      // collapse to /dp/{ASIN}. Pre-P-21 this would have been a double miss.
      const picked = pickInitialUrl(
        'https://www.amazon.com/Different-Slug/dp/B0CTTF514L/ref=sr_1_99',
        [ROW_A, ROW_SLUG_VARIANT],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-slug-variant');
    });

    it('matches a /dp/{ASIN} pageUrl against a /gp/product/{ASIN} saved row', () => {
      // canonicalProductUrl folds both `/dp/{ASIN}` and `/gp/product/{ASIN}`
      // into the same `/dp/{ASIN}` form. The RIGHT-side canonicalization is
      // what makes the gp/product row reachable.
      const picked = pickInitialUrl(
        'https://www.amazon.com/dp/B07XJ8C8F5',
        [ROW_A, ROW_GP_PRODUCT],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-gp-product');
    });

    it('matches a /dp/{ASIN} pageUrl against a /dp/{ASIN}/ trailing-slash saved row', () => {
      // canonicalProductUrl strips the trailing slash via the URL parser.
      // RIGHT-side canonicalization is what lets the trailing-slash row match.
      const picked = pickInitialUrl(
        'https://www.amazon.com/dp/B0716F3NFG',
        [ROW_A, ROW_TRAILING_SLASH],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-trailing-slash');
    });

    it('idempotent on already-canonical rows (P-21 is additive, not breaking)', () => {
      // ROW_A is canonical (`/dp/B0DWJTLNYT`); ROW_B is canonical (`/dp/B0716F3NFG`).
      // Canonicalizing canonical → canonical is a no-op, so pre-P-21 behavior
      // is preserved for all-canonical fixtures.
      assert.equal(
        pickInitialUrl(
          'https://www.amazon.com/dp/B0DWJTLNYT',
          [ROW_A, ROW_B],
          fakeAmazonCanonical,
        )?.id,
        'urlid-a',
      );
      assert.equal(
        pickInitialUrl(
          'https://www.amazon.com/dp/B0716F3NFG',
          [ROW_A, ROW_B],
          fakeAmazonCanonical,
        )?.id,
        'urlid-b',
      );
    });

    it('falls back to raw row.url when canonicalize returns null for that row', () => {
      // A row whose URL doesn't match the /dp/{ASIN} pattern (e.g. a saved
      // search-results page URL). canonicalize returns null → row.url is
      // used raw. The pageUrl can still match if it's also a non-product URL.
      const ROW_SEARCH: CompetitorUrl = {
        ...ROW_A,
        id: 'urlid-search',
        url: 'https://www.amazon.com/s?k=cat+scratcher',
      };
      // The query-string gets stripped by normalizeUrlForRecognition.
      const picked = pickInitialUrl(
        'https://www.amazon.com/s?k=different+terms',
        [ROW_A, ROW_SEARCH],
        fakeAmazonCanonical,
      );
      assert.equal(picked?.id, 'urlid-search');
    });
  });
});
