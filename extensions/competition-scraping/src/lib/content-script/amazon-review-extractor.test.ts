// Tests for the Amazon review extractor pure functions shipped under P-49
// Workstream 2 Session 1 (2026-05-26) per docs/REVIEWS_PHASE_2_DESIGN.md §C.2.
//
// Covers: URL detection + ASIN extraction + same-ASIN matching + per-field
// parsers (star rating / helpful count / review date). The DOM walker itself
// (extractReviewsFromDocument) is exercised against a hand-built DOM via
// linkedom/jsdom-free stubs — same approach the other content-script tests
// use to stay zero-dependency.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractAsinFromReviewUrl,
  extractReviewsFromDocument,
  findNextPageUrl,
  isAmazonReviewPage,
  parseAmazonReviewDate,
  parseHelpfulCount,
  parseStarRating,
  urlsMatchByAsin,
} from './amazon-review-extractor.ts';

describe('isAmazonReviewPage', () => {
  it('accepts the canonical product-reviews URL shape', () => {
    assert.equal(
      isAmazonReviewPage(
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...&filterByStar=critical',
      ),
      true,
    );
  });
  it('accepts the apex amazon.com host', () => {
    assert.equal(
      isAmazonReviewPage('https://amazon.com/product-reviews/B0ABCDEFGH/'),
      true,
    );
  });
  it('rejects product detail pages without /product-reviews/', () => {
    assert.equal(
      isAmazonReviewPage('https://www.amazon.com/dp/B0ABCDEFGH'),
      false,
    );
  });
  it('rejects non-amazon URLs', () => {
    assert.equal(
      isAmazonReviewPage('https://www.ebay.com/product-reviews/B0ABCDEFGH'),
      false,
    );
  });
});

describe('extractAsinFromReviewUrl', () => {
  it('extracts a 10-char ASIN from the canonical shape', () => {
    assert.equal(
      extractAsinFromReviewUrl(
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...',
      ),
      'B0ABCDEFGH',
    );
  });
  it('returns null when no ASIN segment is present', () => {
    assert.equal(extractAsinFromReviewUrl('https://www.amazon.com/'), null);
  });
});

describe('urlsMatchByAsin', () => {
  it('matches a review-page URL against a saved product-page URL with the same ASIN', () => {
    assert.equal(
      urlsMatchByAsin(
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...',
        'https://www.amazon.com/Some-Product-Name/dp/B0ABCDEFGH/ref=...',
      ),
      true,
    );
  });
  it('matches review-page URL against a saved review-page URL with the same ASIN', () => {
    assert.equal(
      urlsMatchByAsin(
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...',
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=other',
      ),
      true,
    );
  });
  it('rejects mismatched ASINs', () => {
    assert.equal(
      urlsMatchByAsin(
        'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...',
        'https://www.amazon.com/dp/B0XXXXXXXX',
      ),
      false,
    );
  });
});

describe('parseStarRating', () => {
  it('parses canonical "5.0 out of 5 stars" shape', () => {
    assert.equal(parseStarRating('5.0 out of 5 stars'), 5);
  });
  it('parses "4.0 out of 5 stars"', () => {
    assert.equal(parseStarRating('4.0 out of 5 stars'), 4);
  });
  it('parses "1.0 out of 5 stars"', () => {
    assert.equal(parseStarRating('1.0 out of 5 stars'), 1);
  });
  it('rounds half-stars up by Math.round semantics', () => {
    assert.equal(parseStarRating('4.5 out of 5 stars'), 5);
  });
  it('returns null on unparseable text', () => {
    assert.equal(parseStarRating(''), null);
    assert.equal(parseStarRating('great product'), null);
  });
  it('returns null on out-of-range values', () => {
    assert.equal(parseStarRating('7.0 out of 5 stars'), null);
    assert.equal(parseStarRating('0.0 out of 5 stars'), null);
  });
});

describe('parseHelpfulCount', () => {
  it('parses "42 people found this helpful"', () => {
    assert.equal(parseHelpfulCount('42 people found this helpful'), 42);
  });
  it('parses "One person found this helpful" as 1', () => {
    assert.equal(parseHelpfulCount('One person found this helpful'), 1);
  });
  it('parses comma-separated thousands', () => {
    assert.equal(parseHelpfulCount('1,234 people found this helpful'), 1234);
  });
  it('returns null on empty text', () => {
    assert.equal(parseHelpfulCount(''), null);
  });
  it('returns null on garbled text', () => {
    assert.equal(parseHelpfulCount('helpful'), null);
  });
});

describe('parseAmazonReviewDate', () => {
  it('parses the canonical "Reviewed in the United States on April 12, 2024" shape', () => {
    const iso = parseAmazonReviewDate(
      'Reviewed in the United States on April 12, 2024',
    );
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('parses other-country review dates', () => {
    const iso = parseAmazonReviewDate(
      'Reviewed in Canada on January 1, 2023',
    );
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2023-01-01');
  });
  it('returns null on unparseable text', () => {
    assert.equal(parseAmazonReviewDate('yesterday'), null);
    assert.equal(parseAmazonReviewDate(''), null);
  });
});

// ─── DOM walker tests — hand-built fake Document ───────────────────────

// Minimal element stub satisfying the small subset of NodeList/Element used
// by the walker (textContent, getAttribute, querySelector, querySelectorAll).
interface FakeEl {
  tagName: string;
  textContent: string | null;
  attributes: Record<string, string>;
  children: Map<string, FakeEl[]>;
  getAttribute(name: string): string | null;
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
    querySelector(sel) {
      const found = this.children.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel) {
      return this.children.get(sel) ?? [];
    },
  };
}

function fakeDoc(reviews: FakeEl[], nextPageLink: FakeEl | null): Document {
  const queryMap = new Map<string, FakeEl[]>([
    ['[data-hook="review"]', reviews],
  ]);
  if (nextPageLink) {
    queryMap.set('li.a-last:not(.a-disabled) a', [nextPageLink]);
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

describe('extractReviewsFromDocument', () => {
  it('walks well-formed review elements', () => {
    const review = el(
      'div',
      {
        '[data-hook="review-star-rating"] .a-icon-alt': el(
          'span',
          {},
          '5.0 out of 5 stars',
        ),
        '[data-hook="review-body"] span': el('span', {}, 'Loved it'),
        '[data-hook="review-body"]': el('span', {}, 'Loved it'),
        '[data-hook="review-title"]': el(
          'a',
          {
            span: [
              el('span', {}, '5.0 out of 5 stars'),
              el('span', {}, 'Best toy ever'),
            ],
          },
          'Best toy ever',
        ),
        '.a-profile-name': el('span', {}, 'Jane Doe'),
        '[data-hook="review-date"]': el(
          'span',
          {},
          'Reviewed in the United States on April 12, 2024',
        ),
        '[data-hook="helpful-vote-statement"]': el(
          'span',
          {},
          '42 people found this helpful',
        ),
      },
      null,
    );
    const doc = fakeDoc([review], null);
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    const r = rows[0]!;
    assert.equal(r.starRating, 5);
    assert.equal(r.body, 'Loved it');
    assert.equal(r.title, 'Best toy ever');
    assert.equal(r.reviewerName, 'Jane Doe');
    assert.equal(r.helpfulCount, 42);
    assert.ok(r.reviewDate?.startsWith('2024-04-12'));
  });

  it('skips review elements missing star rating', () => {
    const review = el('div', {
      '[data-hook="review-body"] span': el('span', {}, 'no star'),
    });
    const rows = extractReviewsFromDocument(fakeDoc([review], null));
    assert.equal(rows.length, 0);
  });

  it('skips review elements with empty body', () => {
    const review = el('div', {
      '[data-hook="review-star-rating"] .a-icon-alt': el(
        'span',
        {},
        '4.0 out of 5 stars',
      ),
      '[data-hook="review-body"] span': el('span', {}, ''),
    });
    const rows = extractReviewsFromDocument(fakeDoc([review], null));
    assert.equal(rows.length, 0);
  });

  it('returns empty array for documents without reviews', () => {
    const rows = extractReviewsFromDocument(fakeDoc([], null));
    assert.equal(rows.length, 0);
  });
});

describe('findNextPageUrl', () => {
  it('resolves the next-page href against the base URL', () => {
    const link = el(
      'a',
      {},
      'Next page',
      { href: '/product-reviews/B0ABCDEFGH/ref=...&pageNumber=2' },
    );
    const doc = fakeDoc([], link);
    const next = findNextPageUrl(
      doc,
      'https://www.amazon.com/product-reviews/B0ABCDEFGH/',
    );
    assert.equal(
      next,
      'https://www.amazon.com/product-reviews/B0ABCDEFGH/ref=...&pageNumber=2',
    );
  });

  it('returns null when no next-page link is present (last page)', () => {
    const doc = fakeDoc([], null);
    assert.equal(
      findNextPageUrl(doc, 'https://www.amazon.com/product-reviews/B0/'),
      null,
    );
  });
});
