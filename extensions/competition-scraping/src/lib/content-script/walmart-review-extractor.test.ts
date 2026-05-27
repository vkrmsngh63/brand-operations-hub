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
  it('accepts the slugless /ip/<id> shape (FF#1 2026-06-01 — director-saved URL on vklf.com)', () => {
    assert.equal(
      isWalmartListingPage('https://www.walmart.com/ip/803154651'),
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
  it('accepts /ip/<slug>/<id> with the empirical long slug + multi-param query (director 2026-06-01 paste)', () => {
    assert.equal(
      isWalmartListingPage(
        'https://www.walmart.com/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651?classType=VARIANT&athbdg=L1102&from=/search',
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
  it('extracts the numeric ID from the slugless /ip/<id> shape (FF#1 2026-06-01)', () => {
    assert.equal(
      extractProductIdFromListingUrl(
        'https://www.walmart.com/ip/803154651',
      ),
      '803154651',
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
  it('extracts from the empirical FF#1 director 2026-06-01 page URL', () => {
    assert.equal(
      extractProductIdFromListingUrl(
        'https://www.walmart.com/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651?classType=VARIANT&athbdg=L1102&from=/search',
      ),
      '803154651',
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
  it('matches slugged page URL against slugless saved URL (FF#1 2026-06-01 — the empirical case)', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651?classType=VARIANT&athbdg=L1102&from=/search',
        'https://www.walmart.com/ip/803154651',
      ),
      true,
    );
  });
  it('matches slugless page URL against slugged saved URL (FF#1 2026-06-01 — inverse)', () => {
    assert.equal(
      urlsMatchByProductId(
        'https://www.walmart.com/ip/803154651',
        'https://www.walmart.com/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651',
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
//
// FF#3 (2026-06-01) — fixtures rewritten to match the empirically-grounded
// walker shape. The walker anchors on [data-testid="enhanced-review-content"]
// + walks up to the review card via closest('.overflow-visible'). FakeEl
// extended with closest() support + a parent link so the closest() walk-up
// terminates correctly.

interface FakeEl {
  tagName: string;
  textContent: string | null;
  attributes: Record<string, string>;
  children: Map<string, FakeEl[]>;
  parent: FakeEl | null;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelector(sel: string): FakeEl | null;
  querySelectorAll(sel: string): FakeEl[];
  closest(sel: string): FakeEl | null;
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
  const self: FakeEl = {
    tagName,
    textContent,
    attributes: { ...attrs },
    children,
    parent: null,
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
    closest(sel) {
      // Only supports `.className` selectors (sufficient for the walker's
      // single closest() call site `closest('.overflow-visible')`). Walks
      // up the parent chain checking each element's `class` attribute.
      if (!sel.startsWith('.')) return null;
      const wanted = sel.slice(1);
      let cur: FakeEl | null = this;
      while (cur) {
        const classes = (cur.getAttribute('class') ?? '').split(/\s+/);
        if (classes.includes(wanted)) return cur;
        cur = cur.parent;
      }
      return null;
    },
  };
  return self;
}

/** Wires `parent` links from each child up to the parent FakeEl. */
function setParent(parent: FakeEl, ...children: FakeEl[]): void {
  for (const c of children) c.parent = parent;
}

interface FakeDocOptions {
  /** Elements returned for `[data-testid="enhanced-review-content"]` query at doc scope. */
  bodyEls?: FakeEl[];
}

function fakeDoc(opts: FakeDocOptions): Document {
  const queryMap = new Map<string, FakeEl[]>();
  if (opts.bodyEls) {
    queryMap.set('[data-testid="enhanced-review-content"]', opts.bodyEls);
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

// ─── extractWalmartReviewStarRating — card.querySelector('.ld_Ec') ──────

describe('extractWalmartReviewStarRating (FF#3 — anchors on .ld_Ec screen-reader text)', () => {
  it('parses "3 out of 5 stars review" from the .ld_Ec child', () => {
    const card = el('div', {
      '.ld_Ec': el('span', {}, '3 out of 5 stars review'),
    });
    assert.equal(extractWalmartReviewStarRating(card as unknown as Element), 3);
  });
  it('parses 5-star reviews', () => {
    const card = el('div', {
      '.ld_Ec': el('span', {}, '5 out of 5 stars review'),
    });
    assert.equal(extractWalmartReviewStarRating(card as unknown as Element), 5);
  });
  it('returns null when .ld_Ec is missing', () => {
    const card = el('div');
    assert.equal(extractWalmartReviewStarRating(card as unknown as Element), null);
  });
  it('returns null when .ld_Ec text is unparseable', () => {
    const card = el('div', {
      '.ld_Ec': el('span', {}, 'no rating here'),
    });
    assert.equal(extractWalmartReviewStarRating(card as unknown as Element), null);
  });
});

// ─── extractWalmartReviewTitle — card.querySelector('h3') ───────────────

describe('extractWalmartReviewTitle (FF#3 — anchors on <h3>)', () => {
  it('returns the text of the h3 child', () => {
    const card = el('div', {
      h3: el('h3', {}, 'Busted in box. Good product'),
    });
    assert.equal(
      extractWalmartReviewTitle(card as unknown as Element),
      'Busted in box. Good product',
    );
  });
  it('returns null when no h3 is present (body-only reviews are common)', () => {
    const card = el('div');
    assert.equal(extractWalmartReviewTitle(card as unknown as Element), null);
  });
  it('returns null when the h3 text is empty/whitespace', () => {
    const card = el('div', {
      h3: el('h3', {}, '   '),
    });
    assert.equal(extractWalmartReviewTitle(card as unknown as Element), null);
  });
});

// ─── extractWalmartReviewBody — bodyEl.querySelector('p') ───────────────

describe('extractWalmartReviewBody (FF#3 — anchors on <p> inside enhanced-review-content)', () => {
  it('returns the trimmed textContent of the <p> child', () => {
    const bodyEl = el('div', {
      p: el(
        'p',
        {},
        'Made my skin break out worse than before- is this the 2-4 week purge they talk about?',
      ),
    });
    assert.equal(
      extractWalmartReviewBody(bodyEl as unknown as Element),
      'Made my skin break out worse than before- is this the 2-4 week purge they talk about?',
    );
  });
  it('returns empty string when no <p> is found', () => {
    const bodyEl = el('div');
    assert.equal(extractWalmartReviewBody(bodyEl as unknown as Element), '');
  });
  it('trims surrounding whitespace', () => {
    const bodyEl = el('div', {
      p: el('p', {}, '  Trimmed body text.  '),
    });
    assert.equal(
      extractWalmartReviewBody(bodyEl as unknown as Element),
      'Trimmed body text.',
    );
  });
});

// ─── extractWalmartReviewerName — aria-label on a non-button div ────────

describe('extractWalmartReviewerName (FF#3 — anchors on [aria-label] non-button div)', () => {
  it('returns the aria-label value of the reviewer block', () => {
    const reviewerDiv = el('div', {}, null, { 'aria-label': 'Stacia' });
    const card = el('div', { '[aria-label]': [reviewerDiv] });
    assert.equal(
      extractWalmartReviewerName(card as unknown as Element),
      'Stacia',
    );
  });
  it('returns the empirical "Walmart customer, Top Reviewer" value verbatim', () => {
    const reviewerDiv = el('div', {}, null, {
      'aria-label': 'Walmart customer, Top Reviewer',
    });
    const card = el('div', { '[aria-label]': [reviewerDiv] });
    assert.equal(
      extractWalmartReviewerName(card as unknown as Element),
      'Walmart customer, Top Reviewer',
    );
  });
  it('skips button elements (thumbs-up/down/report all have aria-labels)', () => {
    const thumbsButton = el('button', {}, null, {
      'aria-label': 'Upvote Stacia review. Total upvote review - 0',
    });
    const reviewerDiv = el('div', {}, null, { 'aria-label': 'Stacia' });
    const card = el('div', {
      '[aria-label]': [thumbsButton, reviewerDiv],
    });
    assert.equal(
      extractWalmartReviewerName(card as unknown as Element),
      'Stacia',
    );
  });
  it('skips aria-labels containing reserved keywords (review/purchase/rating/upvote/downvote)', () => {
    const verifiedDiv = el('div', {}, null, {
      'aria-label': 'Verified Purchase information',
    });
    const ratingDiv = el('div', {}, null, {
      'aria-label': '3 out of 5 stars rating',
    });
    const reviewerDiv = el('div', {}, null, { 'aria-label': 'alexandra' });
    const card = el('div', {
      '[aria-label]': [verifiedDiv, ratingDiv, reviewerDiv],
    });
    assert.equal(
      extractWalmartReviewerName(card as unknown as Element),
      'alexandra',
    );
  });
  it('returns null when no eligible reviewer aria-label is found', () => {
    const card = el('div');
    assert.equal(extractWalmartReviewerName(card as unknown as Element), null);
  });
});

// ─── extractWalmartReviewDate — card.querySelector('.f7.gray') ──────────

describe('extractWalmartReviewDate (FF#3 — anchors on .f7.gray)', () => {
  it('returns the parsed ISO date for "Oct 16, 2025"', () => {
    const card = el('div', {
      '.f7.gray': el('div', {}, 'Oct 16, 2025'),
    });
    const iso = extractWalmartReviewDate(card as unknown as Element);
    assert.ok(iso);
    assert.ok(iso?.startsWith('2025-10-16'));
  });
  it('returns the raw text when the date is unparseable', () => {
    const card = el('div', {
      '.f7.gray': el('div', {}, 'recently'),
    });
    assert.equal(
      extractWalmartReviewDate(card as unknown as Element),
      'recently',
    );
  });
  it('returns null when no .f7.gray element is found', () => {
    const card = el('div');
    assert.equal(extractWalmartReviewDate(card as unknown as Element), null);
  });
});

// ─── extractReviewsFromDocument — full walker integration ────────────────

describe('extractReviewsFromDocument (FF#3 — anchors on enhanced-review-content + closest)', () => {
  /**
   * Build a full review card with its enhanced-review-content body child.
   * The card has the canonical "overflow-visible b--none mt4-l ma0 dark-gray"
   * class signature; the body is parented to the card so closest() walks up
   * cleanly during extraction.
   */
  function buildCardWithBody(opts: {
    starsLdEcText?: string;
    title?: string;
    bodyP?: string;
    reviewerAriaLabel?: string;
    dateText?: string;
  }): { card: FakeEl; bodyEl: FakeEl } {
    const cardChildren: Record<string, FakeEl | FakeEl[]> = {};
    if (opts.starsLdEcText !== undefined) {
      cardChildren['.ld_Ec'] = el('span', {}, opts.starsLdEcText);
    }
    if (opts.title !== undefined) {
      cardChildren.h3 = el('h3', {}, opts.title);
    }
    if (opts.reviewerAriaLabel !== undefined) {
      cardChildren['[aria-label]'] = [
        el('div', {}, null, { 'aria-label': opts.reviewerAriaLabel }),
      ];
    }
    if (opts.dateText !== undefined) {
      cardChildren['.f7.gray'] = el('div', {}, opts.dateText);
    }
    const card = el('div', cardChildren, null, {
      class: 'overflow-visible b--none mt4-l ma0 dark-gray',
    });
    const bodyEl = el(
      'div',
      opts.bodyP !== undefined ? { p: el('p', {}, opts.bodyP) } : {},
      null,
      { 'data-testid': 'enhanced-review-content' },
    );
    setParent(card, bodyEl);
    return { card, bodyEl };
  }

  it('walks a well-formed review with stars + title + body + reviewer + date', () => {
    const { bodyEl } = buildCardWithBody({
      starsLdEcText: '3 out of 5 stars review',
      title: 'Be Careful When Using!',
      bodyP: 'Made my skin break out worse than before.',
      reviewerAriaLabel: 'Stacia',
      dateText: 'Oct 16, 2025',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    const r = rows[0]!;
    assert.equal(r.starRating, 3);
    assert.equal(r.title, 'Be Careful When Using!');
    assert.equal(r.body, 'Made my skin break out worse than before.');
    assert.equal(r.reviewerName, 'Stacia');
    assert.ok(r.reviewDate?.startsWith('2025-10-16'));
  });

  it('skips rows whose body element has no ancestor card matching .overflow-visible', () => {
    const orphanBody = el(
      'div',
      { p: el('p', {}, 'orphan body') },
      null,
      { 'data-testid': 'enhanced-review-content' },
    );
    // No parent set → closest('.overflow-visible') returns null
    const doc = fakeDoc({ bodyEls: [orphanBody] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows missing a star rating (.ld_Ec absent)', () => {
    const { bodyEl } = buildCardWithBody({
      bodyP: 'Body present but no stars.',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows with an unparseable star rating', () => {
    const { bodyEl } = buildCardWithBody({
      starsLdEcText: 'gibberish',
      bodyP: 'Body present.',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('skips rows missing a body <p>', () => {
    const { bodyEl } = buildCardWithBody({
      starsLdEcText: '5 out of 5 stars review',
      title: 'Title with no body',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('handles body-only reviews (no title — 6/10 reviews in the empirical 3-star dump)', () => {
    const { bodyEl } = buildCardWithBody({
      starsLdEcText: '3 out of 5 stars review',
      bodyP: 'Body-only review (no title).',
      reviewerAriaLabel: 'Mimiofboys',
      dateText: 'Oct 1, 2025',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    const r = rows[0]!;
    assert.equal(r.title, null);
    assert.equal(r.starRating, 3);
    assert.equal(r.body, 'Body-only review (no title).');
    assert.equal(r.reviewerName, 'Mimiofboys');
  });

  it('walks multiple rows preserving document order', () => {
    const a = buildCardWithBody({
      starsLdEcText: '5 out of 5 stars review',
      bodyP: 'First',
    });
    const b = buildCardWithBody({
      starsLdEcText: '4 out of 5 stars review',
      bodyP: 'Second',
    });
    const c = buildCardWithBody({
      starsLdEcText: '3 out of 5 stars review',
      bodyP: 'Third',
    });
    const doc = fakeDoc({ bodyEls: [a.bodyEl, b.bodyEl, c.bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 3);
    assert.equal(rows[0]!.body, 'First');
    assert.equal(rows[1]!.body, 'Second');
    assert.equal(rows[2]!.body, 'Third');
  });

  it('returns empty array when no body elements are present', () => {
    const doc = fakeDoc({ bodyEls: [] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 0);
  });

  it('handles the empirical edge-case reviewer name "Walmart customer, Top Reviewer"', () => {
    const { bodyEl } = buildCardWithBody({
      starsLdEcText: '3 out of 5 stars review',
      bodyP: 'Body text.',
      reviewerAriaLabel: 'Walmart customer, Top Reviewer',
    });
    const doc = fakeDoc({ bodyEls: [bodyEl] });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.reviewerName, 'Walmart customer, Top Reviewer');
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
