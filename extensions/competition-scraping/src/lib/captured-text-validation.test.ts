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
});
