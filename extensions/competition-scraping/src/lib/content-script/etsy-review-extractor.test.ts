// Tests for the Etsy review extractor pure functions shipped under P-49
// Workstream 2 Etsy sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md
// §C.2 + §A.2 priority order (Etsy third per-platform sub-cluster after
// Amazon + eBay).
//
// Mirrors ebay-review-extractor.test.ts + amazon-review-extractor.test.ts
// patterns: URL detection + listing_id extraction + same-id matching +
// per-field extractors + star-rating parsing + date parsing + JSON data-
// island extraction (NEW Pattern from yesterday's eBay FF#5 applied from
// the start). Same zero-dependency fake-DOM pattern.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ETSY_DEFAULT_SELECTED_STARS,
  ETSY_STAR_FILTERS,
  buildEtsyListingUrl,
  buildEtsyReviewUrl,
  extractListingIdFromEtsyUrl,
  extractListingIdFromListingUrl,
  extractReviewBody,
  extractReviewDate,
  extractReviewStarRating,
  extractReviewerName,
  extractReviewsFromDocument,
  extractShopNameFromListingDocument,
  extractShopNameFromListingHtml,
  isEtsyListingPage,
  isEtsyScrapableUrl,
  isEtsyStarFilter,
  parseEtsyReviewDate,
  parseEtsyStarRating,
  urlsMatchByListingId,
  type EtsyReviewRow,
  type EtsyStarFilter,
} from './etsy-review-extractor.ts';

// ─── URL detection helpers (FF#1 symmetric Pattern) ──────────────────────

describe('isEtsyListingPage', () => {
  it('accepts the canonical /listing/<numeric-id> shape', () => {
    assert.equal(
      isEtsyListingPage('https://www.etsy.com/listing/123456789'),
      true,
    );
  });
  it('accepts /listing/<id>/<slug>', () => {
    assert.equal(
      isEtsyListingPage(
        'https://www.etsy.com/listing/123456789/handmade-leather-wallet',
      ),
      true,
    );
  });
  it('accepts /listing/<id> with query parameters', () => {
    assert.equal(
      isEtsyListingPage(
        'https://www.etsy.com/listing/123456789?ratings=3&page=2',
      ),
      true,
    );
  });
  it('accepts the apex etsy.com host', () => {
    assert.equal(
      isEtsyListingPage('https://etsy.com/listing/123456789'),
      true,
    );
  });
  it('rejects non-etsy URLs', () => {
    assert.equal(
      isEtsyListingPage('https://www.amazon.com/listing/123456789'),
      false,
    );
  });
  it('rejects etsy URLs without /listing/ segments', () => {
    assert.equal(isEtsyListingPage('https://www.etsy.com/shop/foo'), false);
  });
  it('rejects /listing/ with non-numeric IDs', () => {
    assert.equal(
      isEtsyListingPage('https://www.etsy.com/listing/abc-not-numeric'),
      false,
    );
  });
});

describe('isEtsyScrapableUrl (FF#1 symmetric helper)', () => {
  it('accepts /listing/<id> pages (Etsy reviews live on the listing page)', () => {
    assert.equal(
      isEtsyScrapableUrl('https://www.etsy.com/listing/123456789'),
      true,
    );
  });
  it('reduces to isEtsyListingPage (no separate review URL shape)', () => {
    // For Etsy isEtsyScrapableUrl === isEtsyListingPage; the helper is kept
    // for API parity with Amazon + eBay symmetric helpers.
    assert.equal(
      isEtsyScrapableUrl('https://www.etsy.com/listing/123456789?ratings=3'),
      isEtsyListingPage('https://www.etsy.com/listing/123456789?ratings=3'),
    );
  });
  it('rejects etsy URLs without listing shape', () => {
    assert.equal(
      isEtsyScrapableUrl('https://www.etsy.com/shop/foo'),
      false,
    );
    assert.equal(isEtsyScrapableUrl('https://www.etsy.com/'), false);
  });
  it('rejects non-etsy URLs', () => {
    assert.equal(
      isEtsyScrapableUrl('https://www.amazon.com/listing/123456789'),
      false,
    );
  });
});

// ─── listing_id extraction (symmetric trio) ─────────────────────────────

describe('extractListingIdFromListingUrl', () => {
  it('extracts the numeric listing_id from /listing/<id>', () => {
    assert.equal(
      extractListingIdFromListingUrl('https://www.etsy.com/listing/123456789'),
      '123456789',
    );
  });
  it('extracts the listing_id from /listing/<id>/<slug>', () => {
    assert.equal(
      extractListingIdFromListingUrl(
        'https://www.etsy.com/listing/123456789/handmade-leather-wallet',
      ),
      '123456789',
    );
  });
  it('extracts the listing_id from /listing/<id>?...', () => {
    assert.equal(
      extractListingIdFromListingUrl(
        'https://www.etsy.com/listing/123456789?ratings=3&page=2',
      ),
      '123456789',
    );
  });
  it('returns null when no /listing/ segment is present', () => {
    assert.equal(
      extractListingIdFromListingUrl('https://www.etsy.com/shop/foo'),
      null,
    );
  });
  it('returns null when /listing/ segment is non-numeric', () => {
    assert.equal(
      extractListingIdFromListingUrl('https://www.etsy.com/listing/not-numeric'),
      null,
    );
  });
});

describe('extractListingIdFromEtsyUrl', () => {
  it('extracts listing_id from /listing/<id> (same as listing URL extractor)', () => {
    assert.equal(
      extractListingIdFromEtsyUrl('https://www.etsy.com/listing/123456789'),
      '123456789',
    );
  });
  it('returns null on URLs without a listing shape', () => {
    assert.equal(
      extractListingIdFromEtsyUrl('https://www.etsy.com/shop/foo'),
      null,
    );
  });
});

describe('urlsMatchByListingId', () => {
  it('matches /listing/<id> against saved /listing/<id> with same listing_id', () => {
    assert.equal(
      urlsMatchByListingId(
        'https://www.etsy.com/listing/123456789',
        'https://www.etsy.com/listing/123456789/handmade-leather-wallet',
      ),
      true,
    );
  });
  it('matches when slugs differ but listing_ids match', () => {
    assert.equal(
      urlsMatchByListingId(
        'https://www.etsy.com/listing/123456789/slug-one',
        'https://www.etsy.com/listing/123456789/different-slug',
      ),
      true,
    );
  });
  it('rejects mismatched listing_ids', () => {
    assert.equal(
      urlsMatchByListingId(
        'https://www.etsy.com/listing/123456789',
        'https://www.etsy.com/listing/999999999',
      ),
      false,
    );
  });
  it('rejects when the page URL has no extractable listing_id', () => {
    assert.equal(
      urlsMatchByListingId(
        'https://www.etsy.com/shop/foo',
        'https://www.etsy.com/listing/123456789',
      ),
      false,
    );
  });
});

// ─── Star filter constants + helper ─────────────────────────────────────

describe('ETSY_STAR_FILTERS + ETSY_DEFAULT_SELECTED_STARS', () => {
  it('lists all 5 star filters (1..5) — director can opt into 4+5 per-trigger', () => {
    assert.equal(ETSY_STAR_FILTERS.length, 5);
    assert.deepEqual([...ETSY_STAR_FILTERS], [1, 2, 3, 4, 5]);
  });
  it('defaults to 3+2+1 stars per the director-verbatim 2026-05-25 spec', () => {
    assert.deepEqual([...ETSY_DEFAULT_SELECTED_STARS], [3, 2, 1]);
  });
  it('default stars subset all valid star filters', () => {
    for (const rating of ETSY_DEFAULT_SELECTED_STARS) {
      assert.ok(isEtsyStarFilter(rating), `${String(rating)} should be a valid star filter`);
    }
  });
});

describe('isEtsyStarFilter', () => {
  it('accepts ratings 1, 2, 3, 4, 5', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      assert.equal(isEtsyStarFilter(rating), true);
    }
  });
  it('rejects ratings outside 1..5', () => {
    assert.equal(isEtsyStarFilter(0), false);
    assert.equal(isEtsyStarFilter(6), false);
    assert.equal(isEtsyStarFilter(-1), false);
    assert.equal(isEtsyStarFilter(1.5), false);
  });
});

// ─── URL construction (FF#4 Pattern) ────────────────────────────────────

describe('buildEtsyListingUrl', () => {
  it('produces the canonical /listing/<id> shape', () => {
    assert.equal(
      buildEtsyListingUrl('123456789'),
      'https://www.etsy.com/listing/123456789',
    );
  });
});

describe('buildEtsyReviewUrl', () => {
  it('produces a /listing/<id>?ratings=<N>&page=<N> URL', () => {
    const url = buildEtsyReviewUrl('123456789', 3);
    assert.ok(url.startsWith('https://www.etsy.com/listing/123456789?'));
    const params = new URL(url).searchParams;
    assert.equal(params.get('ratings'), '3');
    assert.equal(params.get('page'), '1');
  });
  it('defaults page number to 1', () => {
    const url = buildEtsyReviewUrl('123456789', 3);
    assert.equal(new URL(url).searchParams.get('page'), '1');
  });
  it('FF#4 Pattern: paginates via page=<N> URL parameter', () => {
    const url = buildEtsyReviewUrl('123456789', 3, 5);
    assert.equal(new URL(url).searchParams.get('page'), '5');
  });
  it('produces distinct URLs per star filter for the same listing', () => {
    const url1 = buildEtsyReviewUrl('123456789', 1, 1);
    const url3 = buildEtsyReviewUrl('123456789', 3, 1);
    assert.notEqual(url1, url3);
    assert.equal(new URL(url1).searchParams.get('ratings'), '1');
    assert.equal(new URL(url3).searchParams.get('ratings'), '3');
  });
  it('preserves the listing_id across pagination', () => {
    for (const page of [1, 2, 5, 10]) {
      const url = buildEtsyReviewUrl('123456789', 2, page);
      const m = url.match(/\/listing\/(\d+)/);
      assert.equal(m?.[1], '123456789');
      assert.equal(new URL(url).searchParams.get('page'), String(page));
    }
  });
});

// ─── parseEtsyStarRating ────────────────────────────────────────────────

describe('parseEtsyStarRating', () => {
  it('parses "5 out of 5 stars" → 5', () => {
    assert.equal(parseEtsyStarRating('5 out of 5 stars'), 5);
  });
  it('parses "4 stars" → 4', () => {
    assert.equal(parseEtsyStarRating('4 stars'), 4);
  });
  it('parses "1 star" (singular) → 1', () => {
    assert.equal(parseEtsyStarRating('1 star'), 1);
  });
  it('rounds "3.5 out of 5 stars" → 4', () => {
    assert.equal(parseEtsyStarRating('3.5 out of 5 stars'), 4);
  });
  it('returns null for empty text', () => {
    assert.equal(parseEtsyStarRating(''), null);
    assert.equal(parseEtsyStarRating('   '), null);
  });
  it('returns null for text without a star-rating phrase', () => {
    assert.equal(parseEtsyStarRating('just some text'), null);
  });
  it('returns null for ratings outside 1..5 range', () => {
    assert.equal(parseEtsyStarRating('0 stars'), null);
    assert.equal(parseEtsyStarRating('10 stars'), null);
  });
});

// ─── parseEtsyReviewDate ────────────────────────────────────────────────

describe('parseEtsyReviewDate', () => {
  it('parses "Apr 12, 2024" → ISO 2024-04-12', () => {
    const iso = parseEtsyReviewDate('Apr 12, 2024');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('parses "Reviewed Apr 12, 2024" by stripping the prefix', () => {
    const iso = parseEtsyReviewDate('Reviewed Apr 12, 2024');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('parses ISO datetime strings directly', () => {
    const iso = parseEtsyReviewDate('2024-04-12T00:00:00Z');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('returns null for empty text', () => {
    assert.equal(parseEtsyReviewDate(''), null);
    assert.equal(parseEtsyReviewDate('   '), null);
  });
  it('returns null for garbled text', () => {
    assert.equal(parseEtsyReviewDate('not a date'), null);
  });
});

// ─── DOM walker tests — hand-built fake Document ────────────────────────

// Minimal element stub satisfying the small subset of Element used by the
// walker. Mirrors ebay-review-extractor.test.ts + amazon-review-extractor.test.ts
// patterns (Element is too large to fully implement — cast via
// `as unknown as Element` at the call site).
interface FakeEl {
  textContent: string | null;
  attributes: Record<string, string>;
  children: Map<string, FakeEl[]>;
  getAttribute(name: string): string | null;
  querySelector(sel: string): FakeEl | null;
  querySelectorAll(sel: string): FakeEl[];
}

function el(
  childMap: Record<string, FakeEl | FakeEl[]> = {},
  textContent: string | null = null,
  attrs: Record<string, string> = {},
): FakeEl {
  const children = new Map<string, FakeEl[]>();
  for (const [sel, kids] of Object.entries(childMap)) {
    children.set(sel, Array.isArray(kids) ? kids : [kids]);
  }
  return {
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

function fakeListingDoc(
  rows: FakeEl[],
  opts: { rowSelector?: string; withVisibleTabpanel?: boolean } = {},
): Document {
  const rowSelector = opts.rowSelector ?? '[data-testid="review-item"]';
  const queryMap = new Map<string, FakeEl[]>([[rowSelector, rows]]);

  // When withVisibleTabpanel is true, the document exposes a visible
  // tabpanel element; the walker should scope inside it. The fake
  // tabpanel proxies its querySelectorAll back to the rows map.
  let tabpanel: FakeEl | null = null;
  if (opts.withVisibleTabpanel) {
    tabpanel = {
      textContent: null,
      attributes: {},
      children: new Map([[rowSelector, rows]]),
      getAttribute() {
        return null;
      },
      querySelector(_sel) {
        return null;
      },
      querySelectorAll(sel) {
        return sel === rowSelector ? rows : [];
      },
    };
  }

  return {
    querySelector(sel: string): FakeEl | null {
      if (sel === '[role=tabpanel]:not([hidden])') return tabpanel;
      const found = queryMap.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel: string): FakeEl[] {
      return queryMap.get(sel) ?? [];
    },
  } as unknown as Document;
}

describe('extractReviewBody', () => {
  it('extracts the canonical [data-testid="review-text"] text', () => {
    const row = el({
      '[data-testid="review-text"]': el({}, 'Beautiful product, great shop!'),
    });
    assert.equal(
      extractReviewBody(row as unknown as Element),
      'Beautiful product, great shop!',
    );
  });
  it('falls back to .shop-review-card__text when data-testid missing', () => {
    const row = el({
      '.shop-review-card__text': el({}, 'Fallback path text'),
    });
    assert.equal(
      extractReviewBody(row as unknown as Element),
      'Fallback path text',
    );
  });
  it('returns empty string when no selector matches', () => {
    const row = el({});
    assert.equal(extractReviewBody(row as unknown as Element), '');
  });
});

describe('extractReviewerName', () => {
  it('extracts the canonical [data-testid="review-reviewer-name"] text', () => {
    const row = el({
      '[data-testid="review-reviewer-name"]': el({}, 'CoolBuyer42'),
    });
    assert.equal(
      extractReviewerName(row as unknown as Element),
      'CoolBuyer42',
    );
  });
  it('falls back to a[href*="/people/"] anchor text', () => {
    const row = el({
      'a[href*="/people/"]': el({}, 'AnchorBuyer'),
    });
    assert.equal(
      extractReviewerName(row as unknown as Element),
      'AnchorBuyer',
    );
  });
  it('returns null when no selector matches', () => {
    const row = el({});
    assert.equal(extractReviewerName(row as unknown as Element), null);
  });
});

describe('extractReviewDate', () => {
  it('extracts the canonical [data-testid="review-date"] text + parses as ISO', () => {
    const row = el({
      '[data-testid="review-date"]': el({}, 'Apr 12, 2024'),
    });
    const date = extractReviewDate(row as unknown as Element);
    assert.ok(date);
    assert.equal(date?.slice(0, 10), '2024-04-12');
  });
  it('falls back to the raw text when parsing fails', () => {
    const row = el({
      '[data-testid="review-date"]': el({}, 'Past month'),
    });
    assert.equal(
      extractReviewDate(row as unknown as Element),
      'Past month',
    );
  });
  it('returns null when no date selector matches', () => {
    const row = el({});
    assert.equal(extractReviewDate(row as unknown as Element), null);
  });
});

describe('extractReviewStarRating', () => {
  it('extracts the rating from an aria-label containing "N out of 5 stars"', () => {
    const row = el({
      '[aria-label]': el({}, null, { 'aria-label': '5 out of 5 stars' }),
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), 5);
  });
  it('extracts the rating from an aria-label containing "N stars"', () => {
    const row = el({
      '[aria-label]': el({}, null, { 'aria-label': '3 stars' }),
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), 3);
  });
  it('returns null when no aria-label matches', () => {
    const row = el({});
    assert.equal(extractReviewStarRating(row as unknown as Element), null);
  });
  it('returns null when aria-label has no star-rating phrase', () => {
    const row = el({
      '[aria-label]': el({}, null, { 'aria-label': 'just some text' }),
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), null);
  });
});

describe('extractReviewsFromDocument', () => {
  it('extracts rows from a basic listing document', () => {
    const row = el({
      '[data-testid="review-text"]': el({}, 'Great product!'),
      '[data-testid="review-reviewer-name"]': el({}, 'Reviewer One'),
      '[data-testid="review-date"]': el({}, 'Apr 12, 2024'),
    });
    const doc = fakeListingDoc([row]);
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.body, 'Great product!');
    assert.equal(rows[0]?.reviewerName, 'Reviewer One');
    assert.ok(rows[0]?.reviewDate);
  });
  it('skips rows with no body (defensive — Etsy occasionally emits empty placeholders)', () => {
    const emptyRow = el({});
    const fullRow = el({
      '[data-testid="review-text"]': el({}, 'Valid body'),
    });
    const doc = fakeListingDoc([emptyRow, fullRow]);
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.body, 'Valid body');
  });
  it('NEW Pattern (eBay FF#5 2026-05-30) — scopes walker to visible tabpanel when one exists', () => {
    // When a visible tabpanel is present, the walker scopes INSIDE it
    // rather than scanning the whole document — preventing the eBay-style
    // capture-from-hidden-tabpanel bug from happening to Etsy too.
    const row = el({
      '[data-testid="review-text"]': el({}, 'In active tabpanel'),
    });
    const doc = fakeListingDoc([row], { withVisibleTabpanel: true });
    const rows = extractReviewsFromDocument(doc);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.body, 'In active tabpanel');
  });
  it('returns empty array when no rows are present', () => {
    const doc = fakeListingDoc([]);
    assert.deepEqual(extractReviewsFromDocument(doc), [] as EtsyReviewRow[]);
  });
});

// ─── JSON data-island shop name extraction (NEW Pattern from FF#5 2026-05-30) ─

describe('extractShopNameFromListingHtml (NEW JSON data-island Pattern)', () => {
  it('extracts shop name from "shop_name":"<value>" JSON pattern', () => {
    const html = '<html><body><script>{"shop_name":"CoolShop","other":"ignored"}</script></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), 'CoolShop');
  });
  it('extracts shop name from "shopName":"<value>" camelCase JSON pattern', () => {
    const html = '<html><body><script>{"shopName":"CamelShop"}</script></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), 'CamelShop');
  });
  it('extracts shop name from nested "shop":{"name":"<value>"} pattern', () => {
    const html = '<html><body><script>{"shop":{"name":"NestedShop","id":123}}</script></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), 'NestedShop');
  });
  it('decodes \\uXXXX escapes in extracted shop names', () => {
    // & is the JSON escape for &
    const html = '<html><body><script>{"shop_name":"Hello\\u0026World"}</script></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), 'Hello&World');
  });
  it('returns null when no JSON shop-name pattern is present', () => {
    const html = '<html><body><p>just regular markup</p></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), null);
  });
  it('returns null when shop name value is empty', () => {
    const html = '<html><body><script>{"shop_name":""}</script></body></html>';
    assert.equal(extractShopNameFromListingHtml(html), null);
  });
});

describe('extractShopNameFromListingDocument (classic-view fallback)', () => {
  it('extracts shop name from data-shop-name attribute', () => {
    const doc = {
      querySelector(sel: string) {
        if (sel === '[data-shop-name]') {
          return {
            getAttribute(name: string) {
              return name === 'data-shop-name' ? 'AttrShop' : null;
            },
            textContent: null,
          };
        }
        return null;
      },
    } as unknown as Document;
    assert.equal(extractShopNameFromListingDocument(doc), 'AttrShop');
  });
  it('falls back to .shop2-name-and-icon a text', () => {
    const doc = {
      querySelector(sel: string) {
        if (sel === '[data-shop-name]') return null;
        if (sel === '.shop2-name-and-icon a') {
          return {
            getAttribute() {
              return null;
            },
            textContent: 'LinkShop',
          };
        }
        return null;
      },
    } as unknown as Document;
    assert.equal(extractShopNameFromListingDocument(doc), 'LinkShop');
  });
  it('returns null when no selector matches', () => {
    const doc = {
      querySelector() {
        return null;
      },
    } as unknown as Document;
    assert.equal(extractShopNameFromListingDocument(doc), null);
  });
});

// ─── Type-level sanity check (compile-time only — no runtime assertions) ─

describe('EtsyStarFilter type narrowing', () => {
  it('isEtsyStarFilter narrows numeric inputs to the EtsyStarFilter union', () => {
    const candidate: number = 3;
    if (isEtsyStarFilter(candidate)) {
      // Inside the type guard, `candidate` is narrowed to EtsyStarFilter.
      const narrowed: EtsyStarFilter = candidate;
      assert.equal(narrowed, 3);
    } else {
      assert.fail('3 should narrow to EtsyStarFilter');
    }
  });
});
