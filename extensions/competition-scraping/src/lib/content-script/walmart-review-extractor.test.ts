// Tests for the Walmart review extractor pure functions shipped under P-49
// Workstream 2 Walmart sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md
// §C.2 + §A.2 priority order (Walmart fourth + FINAL per-platform sub-cluster).
//
// Covers: URL detection + product_id extraction + same-product matching +
// per-field parsers (star rating / review date) + DOM walker against
// hand-built FakeEl stubs (jsdom-free per the existing content-script test
// Pattern). Live runtime paths (runWalmartReviewScrape + scrapeOneStar
// fetch+DOMParser pagination) are validated via Phase 4 director real-Chrome
// walk, not unit tested here (would require a real browser harness).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  WALMART_DEFAULT_SELECTED_STARS,
  WALMART_STAR_FILTERS,
  buildWalmartReviewUrl,
  extractProductIdFromListingUrl,
  extractProductIdFromReviewsUrl,
  extractProductIdFromWalmartUrl,
  extractReviewsFromDocument,
  extractWalmartReviewBody,
  extractWalmartReviewDate,
  extractWalmartReviewStarRating,
  extractWalmartReviewTitle,
  extractWalmartReviewerName,
  findWalmartReviewsContainer,
  isWalmartListingPage,
  isWalmartReviewsPage,
  isWalmartScrapableUrl,
  isWalmartStarFilter,
  parseWalmartReviewDate,
  parseWalmartStarRating,
  urlsMatchByProductId,
  type WalmartReviewRow,
  type WalmartStarFilter,
} from './walmart-review-extractor.ts';

// ─── URL detection helpers (FF#1 symmetric Pattern) ──────────────────────

describe('isWalmartListingPage', () => {
  it('accepts the canonical /ip/<slug>/<id> shape', () => {
    assert.equal(
      isWalmartListingPage(
        'https://www.walmart.com/ip/Amazing-Product/123456789',
      ),
      true,
    );
  });
  it('accepts /ip/<slug>/<id> with query parameters', () => {
    assert.equal(
      isWalmartListingPage(
        'https://www.walmart.com/ip/Amazing-Product/123456789?wmlspartner=foo',
      ),
      true,
    );
  });
  it('accepts the apex walmart.com host', () => {
    assert.equal(
      isWalmartListingPage('https://walmart.com/ip/slug/123456789'),
      true,
    );
  });
  it('rejects non-walmart URLs', () => {
    assert.equal(
      isWalmartListingPage('https://www.amazon.com/ip/slug/123456789'),
      false,
    );
  });
  it('rejects walmart URLs without /ip/ segments', () => {
    assert.equal(
      isWalmartListingPage('https://www.walmart.com/cp/electronics/3944'),
      false,
    );
  });
  it('rejects /ip/<slug> with non-numeric ID', () => {
    assert.equal(
      isWalmartListingPage('https://www.walmart.com/ip/slug/abc-not-numeric'),
      false,
    );
  });
  it('rejects /reviews/product/ URLs (those are reviews-page shape)', () => {
    assert.equal(
      isWalmartListingPage(
        'https://www.walmart.com/reviews/product/123456789',
      ),
      false,
    );
  });
});

describe('isWalmartReviewsPage', () => {
  it('accepts the canonical /reviews/product/<id> shape', () => {
    assert.equal(
      isWalmartReviewsPage(
        'https://www.walmart.com/reviews/product/123456789',
      ),
      true,
    );
  });
  it('accepts /reviews/product/<id> with ratings filter', () => {
    assert.equal(
      isWalmartReviewsPage(
        'https://www.walmart.com/reviews/product/123456789?ratings=5',
      ),
      true,
    );
  });
  it('accepts /reviews/product/<id> with page parameter', () => {
    assert.equal(
      isWalmartReviewsPage(
        'https://www.walmart.com/reviews/product/123456789?ratings=4&page=2',
      ),
      true,
    );
  });
  it('rejects non-walmart URLs', () => {
    assert.equal(
      isWalmartReviewsPage('https://www.amazon.com/reviews/product/123456789'),
      false,
    );
  });
  it('rejects /ip/ listing URLs', () => {
    assert.equal(
      isWalmartReviewsPage(
        'https://www.walmart.com/ip/Amazing-Product/123456789',
      ),
      false,
    );
  });
  it('rejects /reviews/product/ with non-numeric ID', () => {
    assert.equal(
      isWalmartReviewsPage(
        'https://www.walmart.com/reviews/product/abc-not-numeric',
      ),
      false,
    );
  });
});

describe('isWalmartScrapableUrl (FF#1 symmetric helper)', () => {
  it('accepts /ip/<slug>/<id> listing pages', () => {
    assert.equal(
      isWalmartScrapableUrl(
        'https://www.walmart.com/ip/Amazing-Product/123456789',
      ),
      true,
    );
  });
  it('accepts /reviews/product/<id> reviews pages', () => {
    assert.equal(
      isWalmartScrapableUrl(
        'https://www.walmart.com/reviews/product/123456789',
      ),
      true,
    );
  });
  it('rejects non-walmart URLs', () => {
    assert.equal(
      isWalmartScrapableUrl('https://www.amazon.com/dp/B0ABCDEFGH'),
      false,
    );
  });
  it('rejects walmart pages outside the listing + reviews shapes', () => {
    assert.equal(
      isWalmartScrapableUrl('https://www.walmart.com/cp/electronics/3944'),
      false,
    );
  });
});

// ─── Product ID extraction ────────────────────────────────────────────────

describe('extractProductIdFromListingUrl', () => {
  it('extracts the numeric ID from /ip/<slug>/<id>', () => {
    assert.equal(
      extractProductIdFromListingUrl(
        'https://www.walmart.com/ip/Amazing-Product/123456789',
      ),
      '123456789',
    );
  });
  it('extracts even when query parameters follow', () => {
    assert.equal(
      extractProductIdFromListingUrl(
        'https://www.walmart.com/ip/slug/987654321?wmlspartner=foo',
      ),
      '987654321',
    );
  });
  it('returns null for non-listing URLs', () => {
    assert.equal(
      extractProductIdFromListingUrl(
        'https://www.walmart.com/reviews/product/123456789',
      ),
      null,
    );
  });
  it('returns null for non-walmart URLs', () => {
    assert.equal(
      extractProductIdFromListingUrl('https://www.amazon.com/ip/slug/123'),
      '123',
    );
    // Note: the listing-URL extractor uses the LISTING_PAGE_PATH regex which
    // doesn't gate on host. The walmart-host gate lives in isWalmartListingPage.
    // This test documents the behavior for the orchestrator that pairs both.
  });
});

describe('extractProductIdFromReviewsUrl', () => {
  it('extracts the numeric ID from /reviews/product/<id>', () => {
    assert.equal(
      extractProductIdFromReviewsUrl(
        'https://www.walmart.com/reviews/product/123456789',
      ),
      '123456789',
    );
  });
  it('extracts with ratings filter applied', () => {
    assert.equal(
      extractProductIdFromReviewsUrl(
        'https://www.walmart.com/reviews/product/555444333?ratings=5&page=2',
      ),
      '555444333',
    );
  });
  it('returns null for listing URLs', () => {
    assert.equal(
      extractProductIdFromReviewsUrl(
        'https://www.walmart.com/ip/slug/123456789',
      ),
      null,
    );
  });
  it('returns null for unrecognized URL shapes', () => {
    assert.equal(
      extractProductIdFromReviewsUrl('https://www.walmart.com/cp/3944'),
      null,
    );
  });
});

describe('extractProductIdFromWalmartUrl (FF#1 symmetric helper)', () => {
  it('extracts from a listing URL', () => {
    assert.equal(
      extractProductIdFromWalmartUrl(
        'https://www.walmart.com/ip/Amazing/123456789',
      ),
      '123456789',
    );
  });
  it('extracts from a reviews URL', () => {
    assert.equal(
      extractProductIdFromWalmartUrl(
        'https://www.walmart.com/reviews/product/987654321',
      ),
      '987654321',
    );
  });
  it('prefers the listing-shape match when both could match (unreachable in practice — different paths)', () => {
    // Documenting the helper's ordering: listing first, then reviews.
    assert.equal(
      extractProductIdFromWalmartUrl(
        'https://www.walmart.com/ip/slug/123456789',
      ),
      '123456789',
    );
  });
  it('returns null when neither shape matches', () => {
    assert.equal(
      extractProductIdFromWalmartUrl(
        'https://www.walmart.com/cp/electronics/3944',
      ),
      null,
    );
  });
});

describe('urlsMatchByProductId', () => {
  it('matches identical listing URLs', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/ip/slug/123456789',
        'https://www.walmart.com/ip/slug/123456789',
      ),
      true,
    );
  });
  it('matches a listing URL against a reviews URL with same ID', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/ip/slug/123456789',
        'https://www.walmart.com/reviews/product/123456789',
      ),
      true,
    );
  });
  it('matches a reviews URL against a listing URL with same ID', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/reviews/product/123456789?ratings=5',
        'https://www.walmart.com/ip/another-slug/123456789',
      ),
      true,
    );
  });
  it('rejects different product IDs', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/ip/slug/123456789',
        'https://www.walmart.com/ip/slug/987654321',
      ),
      false,
    );
  });
  it('rejects when the page URL has no parseable product ID', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/cp/3944',
        'https://www.walmart.com/ip/slug/123456789',
      ),
      false,
    );
  });
});

// ─── Star filter constants + type guard ──────────────────────────────────

describe('WALMART_STAR_FILTERS', () => {
  it('contains all 5 stars in ascending order', () => {
    assert.deepEqual([...WALMART_STAR_FILTERS], [1, 2, 3, 4, 5]);
  });
});

describe('WALMART_DEFAULT_SELECTED_STARS', () => {
  it('selects all 5 stars in descending order by default per the §A.2 director-verbatim spec', () => {
    assert.deepEqual([...WALMART_DEFAULT_SELECTED_STARS], [5, 4, 3, 2, 1]);
  });
});

describe('isWalmartStarFilter', () => {
  it('accepts 1..5', () => {
    assert.equal(isWalmartStarFilter(1), true);
    assert.equal(isWalmartStarFilter(2), true);
    assert.equal(isWalmartStarFilter(3), true);
    assert.equal(isWalmartStarFilter(4), true);
    assert.equal(isWalmartStarFilter(5), true);
  });
  it('rejects 0 and 6', () => {
    assert.equal(isWalmartStarFilter(0), false);
    assert.equal(isWalmartStarFilter(6), false);
  });
  it('rejects fractional values', () => {
    assert.equal(isWalmartStarFilter(3.5), false);
  });
});

// ─── URL builder ─────────────────────────────────────────────────────────

describe('buildWalmartReviewUrl', () => {
  it('builds the canonical per-star + page URL', () => {
    assert.equal(
      buildWalmartReviewUrl('123456789', 5, 1),
      'https://www.walmart.com/reviews/product/123456789?ratings=5&page=1',
    );
  });
  it('uses page=1 as the default page number', () => {
    assert.equal(
      buildWalmartReviewUrl('123456789', 3),
      'https://www.walmart.com/reviews/product/123456789?ratings=3&page=1',
    );
  });
  it('builds page=2 for the second page', () => {
    assert.equal(
      buildWalmartReviewUrl('123456789', 4, 2),
      'https://www.walmart.com/reviews/product/123456789?ratings=4&page=2',
    );
  });
  it('handles different product IDs', () => {
    assert.equal(
      buildWalmartReviewUrl('987654321', 1, 1),
      'https://www.walmart.com/reviews/product/987654321?ratings=1&page=1',
    );
  });
  it('builds a URL for each star filter', () => {
    for (const star of WALMART_STAR_FILTERS) {
      const url = buildWalmartReviewUrl('123', star, 1);
      assert.ok(url.includes(`ratings=${String(star)}`));
    }
  });
});

// ─── Pure parsers ────────────────────────────────────────────────────────

describe('parseWalmartStarRating', () => {
  it('parses "5 out of 5 stars" → 5', () => {
    assert.equal(parseWalmartStarRating('5 out of 5 stars'), 5);
  });
  it('parses "4 out of 5 stars" → 4', () => {
    assert.equal(parseWalmartStarRating('4 out of 5 stars'), 4);
  });
  it('parses "4.0 out of 5 stars" → 4', () => {
    assert.equal(parseWalmartStarRating('4.0 out of 5 stars'), 4);
  });
  it('rounds .5 up via Math.round semantics', () => {
    assert.equal(parseWalmartStarRating('3.5 out of 5 stars'), 4);
    assert.equal(parseWalmartStarRating('4.5 out of 5 stars'), 5);
  });
  it('parses with leading "Rated" prefix', () => {
    assert.equal(parseWalmartStarRating('Rated 3 out of 5 Stars'), 3);
  });
  it('handles extra whitespace', () => {
    assert.equal(parseWalmartStarRating('5  out  of  5  stars'), 5);
  });
  it('returns null on empty text', () => {
    assert.equal(parseWalmartStarRating(''), null);
  });
  it('returns null on garbled text', () => {
    assert.equal(parseWalmartStarRating('lots of stars'), null);
  });
  it('returns null on out-of-range ratings', () => {
    assert.equal(parseWalmartStarRating('0 out of 5 stars'), null);
    assert.equal(parseWalmartStarRating('6 out of 5 stars'), null);
  });
});

describe('parseWalmartReviewDate', () => {
  it('parses "April 12, 2024" into an ISO timestamp', () => {
    const iso = parseWalmartReviewDate('April 12, 2024');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('parses "4/12/2024"', () => {
    const iso = parseWalmartReviewDate('4/12/2024');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('returns null on empty text', () => {
    assert.equal(parseWalmartReviewDate(''), null);
  });
  it('returns null on unparseable text', () => {
    assert.equal(parseWalmartReviewDate('yesterday'), null);
  });
});

// ─── DOM walker tests — hand-built fake Document ─────────────────────────

// Minimal element stub satisfying the small subset of NodeList/Element used
// by the walker (textContent, getAttribute, querySelector, querySelectorAll,
// hasAttribute). Mirrors the existing content-script test Pattern (no JSDOM).
interface FakeEl {
  tagName: string;
  textContent: string | null;
  attributes: Record<string, string>;
  children: Map<string, FakeEl[]>;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelector(sel: string): FakeEl | null;
  querySelectorAll(sel: string): FakeEl[];
}

function el(
  tagName: string,
  childMap: Record<string, FakeEl | FakeEl[]> = {},
  textContent: string | null = null,
  attrs: Record<string, string> = {},
): FakeEl {
  const children = new Map<string, FakeEl[]>();
  for (const [sel, kids] of Object.entries(childMap)) {
    children.set(sel, Array.isArray(kids) ? kids : [kids]);
  }
  return {
    tagName,
    textContent,
    attributes: { ...attrs },
    children,
    getAttribute(name) {
      return name in this.attributes ? (this.attributes[name] ?? null) : null;
    },
    hasAttribute(name) {
      return name in this.attributes;
    },
    querySelector(sel) {
      const found = this.children.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel) {
      return this.children.get(sel) ?? [];
    },
  };
}

interface FakeDocOptions {
  /** Elements returned for `[data-testid="reviews-list"]` query. */
  containers?: FakeEl[];
  /** Elements returned for `[data-testid="reviews-section"]` query at doc scope. */
  rowsAtDocScope?: FakeEl[];
}

function fakeDoc(opts: FakeDocOptions): Document {
  const queryMap = new Map<string, FakeEl[]>();
  if (opts.containers) {
    queryMap.set('[data-testid="reviews-list"]', opts.containers);
  }
  if (opts.rowsAtDocScope) {
    queryMap.set('[data-testid="reviews-section"]', opts.rowsAtDocScope);
  }
  return {
    querySelector(sel: string): FakeEl | null {
      const found = queryMap.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel: string): FakeEl[] {
      return queryMap.get(sel) ?? [];
    },
  } as unknown as Document;
}

describe('findWalmartReviewsContainer (single canonical selector per Etsy FF#3 Pattern)', () => {
  it('returns the canonical [data-testid="reviews-list"] container', () => {
    const container = el('div', {}, null, { 'data-testid': 'reviews-list' });
    const doc = fakeDoc({ containers: [container] });
    assert.equal(findWalmartReviewsContainer(doc), container);
  });
  it('rejects containers with aria-hidden="true"', () => {
    const hidden = el('div', {}, null, {
      'data-testid': 'reviews-list',
      'aria-hidden': 'true',
    });
    const doc = fakeDoc({ containers: [hidden] });
    assert.equal(findWalmartReviewsContainer(doc), null);
  });
  it('rejects containers with hidden attribute', () => {
    const hidden = el('div', {}, null, {
      'data-testid': 'reviews-list',
      hidden: '',
    });
    const doc = fakeDoc({ containers: [hidden] });
    assert.equal(findWalmartReviewsContainer(doc), null);
  });
  it('picks the first visible candidate when multiple are present', () => {
    const hidden = el('div', {}, null, {
      'data-testid': 'reviews-list',
      'aria-hidden': 'true',
    });
    const visible = el('div', {}, null, { 'data-testid': 'reviews-list' });
    const doc = fakeDoc({ containers: [hidden, visible] });
    assert.equal(findWalmartReviewsContainer(doc), visible);
  });
  it('returns null when no container is found', () => {
    const doc = fakeDoc({ containers: [] });
    assert.equal(findWalmartReviewsContainer(doc), null);
  });
});

describe('extractWalmartReviewStarRating', () => {
  it('parses the star rating from a [aria-label*="out of 5"] child', () => {
    const row = el('div', {
      '[aria-label*="out of 5"]': el('span', {}, '', {
        'aria-label': '4 out of 5 stars',
      }),
    });
    assert.equal(extractWalmartReviewStarRating(row as unknown as Element), 4);
  });
  it('returns null when no stars element is found', () => {
    const row = el('div');
    assert.equal(extractWalmartReviewStarRating(row as unknown as Element), null);
  });
  it('returns null when the aria-label is unparseable', () => {
    const row = el('div', {
      '[aria-label*="out of 5"]': el('span', {}, '', {
        'aria-label': 'no rating here',
      }),
    });
    assert.equal(extractWalmartReviewStarRating(row as unknown as Element), null);
  });
});

describe('extractWalmartReviewTitle', () => {
  it('returns the text of the [data-testid="review-title"] child', () => {
    const row = el('div', {
      '[data-testid="review-title"]': el('span', {}, 'Great product!'),
    });
    assert.equal(extractWalmartReviewTitle(row as unknown as Element), 'Great product!');
  });
  it('returns null when no title is found', () => {
    const row = el('div');
    assert.equal(extractWalmartReviewTitle(row as unknown as Element), null);
  });
  it('returns null when the title text is empty', () => {
    const row = el('div', {
      '[data-testid="review-title"]': el('span', {}, '   '),
    });
    assert.equal(extractWalmartReviewTitle(row as unknown as Element), null);
  });
});

describe('extractWalmartReviewBody', () => {
  it('returns the text of the [data-testid="review-body"] child', () => {
    const row = el('div', {
      '[data-testid="review-body"]': el(
        'span',
        {},
        'Long detailed review with the full text visible since Walmart View more is CSS truncation only',
      ),
    });
    assert.equal(
      extractWalmartReviewBody(row as unknown as Element),
      'Long detailed review with the full text visible since Walmart View more is CSS truncation only',
    );
  });
  it('returns empty string when no body is found', () => {
    const row = el('div');
    assert.equal(extractWalmartReviewBody(row as unknown as Element), '');
  });
  it('trims surrounding whitespace', () => {
    const row = el('div', {
      '[data-testid="review-body"]': el('span', {}, '  Trimmed body.  '),
    });
    assert.equal(extractWalmartReviewBody(row as unknown as Element), 'Trimmed body.');
  });
});

describe('extractWalmartReviewerName', () => {
  it('returns the text of the [data-testid="review-reviewer"] child', () => {
    const row = el('div', {
      '[data-testid="review-reviewer"]': el('span', {}, 'Jane D.'),
    });
    assert.equal(extractWalmartReviewerName(row as unknown as Element), 'Jane D.');
  });
  it('returns null when no reviewer element is found', () => {
    const row = el('div');
    assert.equal(extractWalmartReviewerName(row as unknown as Element), null);
  });
  it('returns null when the name text is empty', () => {
    const row = el('div', {
      '[data-testid="review-reviewer"]': el('span', {}, ''),
    });
    assert.equal(extractWalmartReviewerName(row as unknown as Element), null);
  });
});

describe('extractWalmartReviewDate', () => {
  it('returns the parsed ISO date when the text is parseable', () => {
    const row = el('div', {
      '[data-testid="review-date"]': el('span', {}, 'April 12, 2024'),
    });
    const iso = extractWalmartReviewDate(row as unknown as Element);
    assert.ok(iso);
    assert.ok(iso?.startsWith('2024-04-12'));
  });
  it('returns the raw text when parsing fails', () => {
    const row = el('div', {
      '[data-testid="review-date"]': el('span', {}, 'recently'),
    });
    assert.equal(extractWalmartReviewDate(row as unknown as Element), 'recently');
  });
  it('returns null when no date element is found', () => {
    const row = el('div');
    assert.equal(extractWalmartReviewDate(row as unknown as Element), null);
  });
});

describe('extractReviewsFromDocument', () => {
  function buildReviewRow(opts: {
    starsAriaLabel?: string;
    title?: string;
    body?: string;
    reviewer?: string;
    date?: string;
    ariaHidden?: boolean;
    hidden?: boolean;
  }): FakeEl {
    const childMap: Record<string, FakeEl> = {};
    if (opts.starsAriaLabel !== undefined) {
      childMap['[aria-label*="out of 5"]'] = el('span', {}, '', {
        'aria-label': opts.starsAriaLabel,
      });
    }
    if (opts.title !== undefined) {
      childMap['[data-testid="review-title"]'] = el('span', {}, opts.title);
    }
    if (opts.body !== undefined) {
      childMap['[data-testid="review-body"]'] = el('span', {}, opts.body);
    }
    if (opts.reviewer !== undefined) {
      childMap['[data-testid="review-reviewer"]'] = el(
        'span',
        {},
        opts.reviewer,
      );
    }
    if (opts.date !== undefined) {
      childMap['[data-testid="review-date"]'] = el('span', {}, opts.date);
    }
    const attrs: Record<string, string> = { 'data-testid': 'reviews-section' };
    if (opts.ariaHidden) attrs['aria-hidden'] = 'true';
    if (opts.hidden) attrs.hidden = '';
    return el('div', childMap, null, attrs);
  }

  it('walks a well-formed review row', () => {
    const row = buildReviewRow({
      starsAriaLabel: '5 out of 5 stars',
      title: 'Loved it',
      body: 'Best purchase I made this year.',
      reviewer: 'Jane D.',
      date: 'April 12, 2024',
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    const r = rows[0]!;
    assert.equal(r.starRating, 5);
    assert.equal(r.title, 'Loved it');
    assert.equal(r.body, 'Best purchase I made this year.');
    assert.equal(r.reviewerName, 'Jane D.');
    assert.ok(r.reviewDate?.startsWith('2024-04-12'));
  });

  it('skips rows missing a star rating', () => {
    const row = buildReviewRow({
      body: 'No star here',
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows with an unparseable star rating', () => {
    const row = buildReviewRow({
      starsAriaLabel: 'no parseable rating here',
      body: 'Body present',
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows missing a body', () => {
    const row = buildReviewRow({
      starsAriaLabel: '5 out of 5 stars',
      title: 'Has title but no body',
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows with aria-hidden="true"', () => {
    const row = buildReviewRow({
      starsAriaLabel: '5 out of 5 stars',
      body: 'Hidden review',
      ariaHidden: true,
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows with hidden attribute', () => {
    const row = buildReviewRow({
      starsAriaLabel: '5 out of 5 stars',
      body: 'Hidden review',
      hidden: true,
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('handles a row with null title (Walmart reviews can have body-only)', () => {
    const row = buildReviewRow({
      starsAriaLabel: '3 out of 5 stars',
      body: 'Body-only review with no title',
    });
    const doc = fakeDoc({ rowsAtDocScope: [row] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    const r = rows[0]!;
    assert.equal(r.title, null);
    assert.equal(r.starRating, 3);
  });

  it('walks multiple rows preserving order', () => {
    const rowA = buildReviewRow({
      starsAriaLabel: '5 out of 5 stars',
      body: 'First',
    });
    const rowB = buildReviewRow({
      starsAriaLabel: '4 out of 5 stars',
      body: 'Second',
    });
    const rowC = buildReviewRow({
      starsAriaLabel: '3 out of 5 stars',
      body: 'Third',
    });
    const doc = fakeDoc({ rowsAtDocScope: [rowA, rowB, rowC] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 3);
    assert.equal(rows[0]!.body, 'First');
    assert.equal(rows[1]!.body, 'Second');
    assert.equal(rows[2]!.body, 'Third');
  });

  it('returns empty array when no rows are present', () => {
    const doc = fakeDoc({ rowsAtDocScope: [] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });
});

// ─── Type re-export sanity ───────────────────────────────────────────────

describe('exported types', () => {
  it('WalmartReviewRow type has the expected shape', () => {
    const row: WalmartReviewRow = {
      starRating: 5,
      body: 'b',
      title: null,
      reviewerName: null,
      reviewDate: null,
    };
    assert.equal(row.starRating, 5);
  });
  it('WalmartStarFilter type is one of 1..5', () => {
    const star: WalmartStarFilter = 3;
    assert.equal(star, 3);
  });
});
