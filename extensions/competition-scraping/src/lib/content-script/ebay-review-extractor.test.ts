// Tests for the eBay review extractor pure functions shipped under P-49
// Workstream 2 eBay sub-cluster Session 1 (2026-05-30) per
// docs/REVIEWS_PHASE_2_DESIGN.md §C.2 + §A.2 priority order.
//
// Mirrors amazon-review-extractor.test.ts patterns: URL detection + item_id
// extraction + same-item_id matching + per-field extractors + seller
// extraction + filter mapping. Same zero-dependency fake-DOM pattern.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  EBAY_FEEDBACK_FILTERS,
  buildEbayFeedbackUrl,
  buildEbayListingUrl,
  extractFeedbackBody,
  extractFeedbackFromDocument,
  extractFeedbackUser,
  extractItemIdFromEbayUrl,
  extractItemIdFromFeedbackUrl,
  extractItemIdFromItemUrl,
  extractSellerFromFeedbackUrl,
  extractSellerFromListingDocument,
  feedbackFilterForStarRating,
  isEbayFeedbackPage,
  isEbayItemPage,
  isEbayScrapableUrl,
  parseEbayFeedbackDate,
  starRatingForFeedbackFilter,
  urlsMatchByItemId,
  type EbayFeedbackFilter,
} from './ebay-review-extractor.ts';

// ─── URL detection helpers (FF#1 symmetric Pattern) ──────────────────────

describe('isEbayItemPage', () => {
  it('accepts the canonical /itm/<numeric-id> shape', () => {
    assert.equal(
      isEbayItemPage('https://www.ebay.com/itm/123456789012'),
      true,
    );
  });
  it('accepts /itm/<id> with trailing slash + query', () => {
    assert.equal(
      isEbayItemPage(
        'https://www.ebay.com/itm/123456789012?hash=abc&_trkparms=...',
      ),
      true,
    );
  });
  it('accepts the apex ebay.com host', () => {
    assert.equal(isEbayItemPage('https://ebay.com/itm/123456789012'), true);
  });
  it('rejects feedback pages (those go through isEbayFeedbackPage)', () => {
    assert.equal(
      isEbayFeedbackPage(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123',
      ),
      true,
    );
    assert.equal(
      isEbayItemPage(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123',
      ),
      false,
    );
  });
  it('rejects non-ebay URLs', () => {
    assert.equal(
      isEbayItemPage('https://www.amazon.com/itm/123456789012'),
      false,
    );
  });
  it('rejects ebay URLs without /itm/ segments', () => {
    assert.equal(isEbayItemPage('https://www.ebay.com/usr/seller-name'), false);
  });
});

describe('isEbayFeedbackPage', () => {
  it('accepts the canonical feedback shape', () => {
    assert.equal(
      isEbayFeedbackPage(
        'https://www.ebay.com/fdbk/mweb_profile?fdbkType=FeedbackReceivedAsSeller&item_id=123&username=seller&overall_rating_item=NEUTRAL',
      ),
      true,
    );
  });
  it('rejects /itm/ listing pages', () => {
    assert.equal(
      isEbayFeedbackPage('https://www.ebay.com/itm/123456789012'),
      false,
    );
  });
  it('rejects non-ebay URLs', () => {
    assert.equal(
      isEbayFeedbackPage('https://www.amazon.com/fdbk/mweb_profile'),
      false,
    );
  });
});

describe('isEbayScrapableUrl (FF#1 symmetric helper)', () => {
  it('accepts /itm/<id> listing pages', () => {
    assert.equal(
      isEbayScrapableUrl('https://www.ebay.com/itm/123456789012'),
      true,
    );
  });
  it('accepts /fdbk/mweb_profile?... feedback pages', () => {
    assert.equal(
      isEbayScrapableUrl(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123&username=seller',
      ),
      true,
    );
  });
  it('rejects ebay URLs without either shape', () => {
    assert.equal(
      isEbayScrapableUrl('https://www.ebay.com/usr/seller-name'),
      false,
    );
    assert.equal(isEbayScrapableUrl('https://www.ebay.com/'), false);
  });
  it('rejects non-ebay URLs', () => {
    assert.equal(
      isEbayScrapableUrl('https://www.amazon.com/itm/123456789012'),
      false,
    );
  });
});

// ─── item_id extraction (symmetric trio) ────────────────────────────────

describe('extractItemIdFromItemUrl', () => {
  it('extracts the numeric item_id from /itm/<id>', () => {
    assert.equal(
      extractItemIdFromItemUrl('https://www.ebay.com/itm/123456789012'),
      '123456789012',
    );
  });
  it('extracts the item_id from /itm/<id> with trailing path/query', () => {
    assert.equal(
      extractItemIdFromItemUrl(
        'https://www.ebay.com/itm/123456789012?hash=abc',
      ),
      '123456789012',
    );
  });
  it('returns null when no /itm/ segment is present', () => {
    assert.equal(
      extractItemIdFromItemUrl('https://www.ebay.com/usr/seller-name'),
      null,
    );
  });
});

describe('extractItemIdFromFeedbackUrl', () => {
  it('extracts item_id from a canonical feedback URL', () => {
    assert.equal(
      extractItemIdFromFeedbackUrl(
        'https://www.ebay.com/fdbk/mweb_profile?fdbkType=FeedbackReceivedAsSeller&item_id=123456789012&username=seller&overall_rating_item=NEUTRAL',
      ),
      '123456789012',
    );
  });
  it('returns null when item_id is absent', () => {
    assert.equal(
      extractItemIdFromFeedbackUrl(
        'https://www.ebay.com/fdbk/mweb_profile?username=seller',
      ),
      null,
    );
  });
  it('returns null when item_id is not numeric', () => {
    assert.equal(
      extractItemIdFromFeedbackUrl(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=ABC',
      ),
      null,
    );
  });
  it('returns null on non-feedback URLs', () => {
    assert.equal(
      extractItemIdFromFeedbackUrl(
        'https://www.ebay.com/itm/123456789012',
      ),
      null,
    );
  });
});

describe('extractItemIdFromEbayUrl', () => {
  it('extracts item_id from /itm/<id> (listing shape preferred)', () => {
    assert.equal(
      extractItemIdFromEbayUrl('https://www.ebay.com/itm/123456789012'),
      '123456789012',
    );
  });
  it('extracts item_id from /fdbk/...?item_id=<id> (feedback fallback)', () => {
    assert.equal(
      extractItemIdFromEbayUrl(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123456789012&username=seller',
      ),
      '123456789012',
    );
  });
  it('returns null on eBay URLs without either shape', () => {
    assert.equal(
      extractItemIdFromEbayUrl('https://www.ebay.com/usr/seller-name'),
      null,
    );
  });
});

describe('extractSellerFromFeedbackUrl', () => {
  it('extracts username from a canonical feedback URL', () => {
    assert.equal(
      extractSellerFromFeedbackUrl(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123&username=cool-seller&overall_rating_item=NEUTRAL',
      ),
      'cool-seller',
    );
  });
  it('returns null when username is absent', () => {
    assert.equal(
      extractSellerFromFeedbackUrl(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123',
      ),
      null,
    );
  });
  it('returns null on non-feedback URLs', () => {
    assert.equal(
      extractSellerFromFeedbackUrl(
        'https://www.ebay.com/itm/123456789012',
      ),
      null,
    );
  });
});

describe('urlsMatchByItemId', () => {
  it('matches /itm/<id> against saved /itm/<id> with same item_id', () => {
    assert.equal(
      urlsMatchByItemId(
        'https://www.ebay.com/itm/123456789012',
        'https://www.ebay.com/itm/123456789012?hash=abc',
      ),
      true,
    );
  });
  it('matches /fdbk/...?item_id=<id> against saved /itm/<id> with same item_id', () => {
    assert.equal(
      urlsMatchByItemId(
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123456789012&username=seller',
        'https://www.ebay.com/itm/123456789012',
      ),
      true,
    );
  });
  it('matches /itm/<id> against saved /fdbk/...?item_id=<id> with same item_id', () => {
    assert.equal(
      urlsMatchByItemId(
        'https://www.ebay.com/itm/123456789012',
        'https://www.ebay.com/fdbk/mweb_profile?item_id=123456789012&username=seller',
      ),
      true,
    );
  });
  it('rejects mismatched item_ids', () => {
    assert.equal(
      urlsMatchByItemId(
        'https://www.ebay.com/itm/123456789012',
        'https://www.ebay.com/itm/999999999999',
      ),
      false,
    );
  });
  it('rejects when the page URL has no extractable item_id', () => {
    assert.equal(
      urlsMatchByItemId(
        'https://www.ebay.com/usr/seller-name',
        'https://www.ebay.com/itm/123456789012',
      ),
      false,
    );
  });
});

// ─── Filter mapping ─────────────────────────────────────────────────────

describe('EBAY_FEEDBACK_FILTERS + starRatingForFeedbackFilter', () => {
  it('lists exactly two feedback filters (Neutral + Negative; Positive excluded per director spec)', () => {
    assert.equal(EBAY_FEEDBACK_FILTERS.length, 2);
    assert.deepEqual([...EBAY_FEEDBACK_FILTERS], ['NEUTRAL', 'NEGATIVE']);
  });
  it('maps NEUTRAL to 3-star (director verbatim spec)', () => {
    assert.equal(starRatingForFeedbackFilter('NEUTRAL'), 3);
  });
  it('maps NEGATIVE to 1-star (director verbatim spec)', () => {
    assert.equal(starRatingForFeedbackFilter('NEGATIVE'), 1);
  });
});

describe('feedbackFilterForStarRating', () => {
  it('maps 3 to NEUTRAL (inverse of starRatingForFeedbackFilter)', () => {
    assert.equal(feedbackFilterForStarRating(3), 'NEUTRAL');
  });
  it('maps 1 to NEGATIVE (inverse of starRatingForFeedbackFilter)', () => {
    assert.equal(feedbackFilterForStarRating(1), 'NEGATIVE');
  });
  it('returns null for ratings outside the eBay mapping (2, 4, 5)', () => {
    assert.equal(feedbackFilterForStarRating(2), null);
    assert.equal(feedbackFilterForStarRating(4), null);
    assert.equal(feedbackFilterForStarRating(5), null);
  });
  it('returns null for ratings outside 1-5 range', () => {
    assert.equal(feedbackFilterForStarRating(0), null);
    assert.equal(feedbackFilterForStarRating(6), null);
    assert.equal(feedbackFilterForStarRating(-1), null);
  });
  it('round-trips with starRatingForFeedbackFilter for both canonical filters', () => {
    for (const filter of EBAY_FEEDBACK_FILTERS) {
      const rating = starRatingForFeedbackFilter(filter);
      assert.equal(feedbackFilterForStarRating(rating), filter);
    }
  });
});

// ─── URL construction (FF#4 Pattern) ────────────────────────────────────

describe('buildEbayFeedbackUrl', () => {
  it('produces the canonical feedback URL with all required params', () => {
    const url = buildEbayFeedbackUrl(
      '123456789012',
      'cool-seller',
      'NEUTRAL',
    );
    assert.ok(url.startsWith('https://www.ebay.com/fdbk/mweb_profile?'));
    const params = new URL(url).searchParams;
    assert.equal(params.get('fdbkType'), 'FeedbackReceivedAsSeller');
    assert.equal(params.get('item_id'), '123456789012');
    assert.equal(params.get('username'), 'cool-seller');
    assert.equal(params.get('overall_rating_item'), 'NEUTRAL');
  });
  it('FF#3 2026-05-30: paginates via page_id_item=N (not legacy _pgn)', () => {
    // Director's screenshot + working URLs confirmed the "This Item" view
    // paginates via page_id_item; _pgn fell back to All Items default.
    const url = buildEbayFeedbackUrl(
      '123456789012',
      'cool-seller',
      'NEGATIVE',
      4,
    );
    const params = new URL(url).searchParams;
    assert.equal(params.get('page_id_item'), '4');
    assert.equal(params.get('_pgn'), null); // legacy param explicitly absent
    assert.equal(params.get('overall_rating_item'), 'NEGATIVE');
  });
  it('URL-encodes seller usernames with reserved characters', () => {
    const url = buildEbayFeedbackUrl(
      '123456789012',
      'cool seller&foo',
      'NEUTRAL',
    );
    const params = new URL(url).searchParams;
    assert.equal(params.get('username'), 'cool seller&foo');
  });
  it('FF#2 2026-05-30: includes q=<itemId> search query for "This Item" filter', () => {
    const url = buildEbayFeedbackUrl(
      '355823393241',
      'hot.girls',
      'NEUTRAL',
    );
    const params = new URL(url).searchParams;
    assert.equal(params.get('q'), '355823393241');
  });
  it('FF#2 2026-05-30: includes filter=feedback_page:RECEIVED_AS_SELLER scope param', () => {
    const url = buildEbayFeedbackUrl(
      '355823393241',
      'hot.girls',
      'NEGATIVE',
    );
    const params = new URL(url).searchParams;
    assert.equal(
      params.get('filter'),
      'feedback_page:RECEIVED_AS_SELLER',
    );
  });
  it('FF#3 2026-05-30: emits the full _item-suffixed param set', () => {
    // Director's 2026-05-30 working URLs all carry this exact param set;
    // without it eBay falls out of "This Item" view to the All Items default.
    const url = buildEbayFeedbackUrl(
      '355823393241',
      'hot.girls',
      'NEUTRAL',
    );
    const params = new URL(url).searchParams;
    assert.equal(params.get('sort_item'), 'RELEVANCEV2');
    assert.equal(params.get('filter_image_item'), 'false');
    assert.equal(params.get('filter_video_item'), 'false');
    assert.equal(params.get('filter_automated_feedback_item'), 'true');
    assert.equal(params.get('filter_topic_item'), '');
  });
  it('FF#3 2026-05-30: q always equals item_id across pagination', () => {
    // The search query stays the same across pagination; only page_id_item changes.
    for (const page of [1, 2, 5, 10]) {
      const url = buildEbayFeedbackUrl(
        '355823393241',
        'hot.girls',
        'NEUTRAL',
        page,
      );
      const params = new URL(url).searchParams;
      assert.equal(params.get('q'), '355823393241');
      assert.equal(params.get('page_id_item'), String(page));
    }
  });
});

describe('buildEbayListingUrl', () => {
  it('produces the canonical /itm/<id> shape', () => {
    assert.equal(
      buildEbayListingUrl('123456789012'),
      'https://www.ebay.com/itm/123456789012',
    );
  });
});

// ─── parseEbayFeedbackDate ──────────────────────────────────────────────

describe('parseEbayFeedbackDate', () => {
  it('parses "Apr 12, 2024" style absolute dates', () => {
    const iso = parseEbayFeedbackDate('Apr 12, 2024');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2024-04-12');
  });
  it('returns null for empty text', () => {
    assert.equal(parseEbayFeedbackDate(''), null);
    assert.equal(parseEbayFeedbackDate('   '), null);
  });
  it('returns null for relative dates like "Past month" (eBay exposes no absolute timestamp)', () => {
    assert.equal(parseEbayFeedbackDate('Past month'), null);
    assert.equal(parseEbayFeedbackDate('Past 6 months'), null);
  });
  it('returns null for garbled text', () => {
    assert.equal(parseEbayFeedbackDate('not a date'), null);
  });
});

// ─── DOM walker tests — hand-built fake Document ────────────────────────

// Minimal element stub satisfying the small subset of Element used by the
// walker. Mirrors amazon-review-extractor.test.ts's pattern (Element is too
// large to fully implement — cast via `as unknown as Element` at the call
// site).
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

function fakeFeedbackDoc(rows: FakeEl[]): Document {
  const queryMap = new Map<string, FakeEl[]>([
    ['.fdbk-container__details', rows],
  ]);
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

describe('extractFeedbackBody', () => {
  it('extracts the canonical .fdbk-container__details__comment text', () => {
    const row = el({
      '.fdbk-container__details__comment': el({}, 'Great seller, fast shipping!'),
    });
    assert.equal(
      extractFeedbackBody(row as unknown as Element),
      'Great seller, fast shipping!',
    );
  });
  it('falls back to .feedback-comment-text', () => {
    const row = el({
      '.feedback-comment-text': el({}, 'Decent product.'),
    });
    assert.equal(
      extractFeedbackBody(row as unknown as Element),
      'Decent product.',
    );
  });
  it('trims surrounding whitespace', () => {
    const row = el({
      '.fdbk-container__details__comment': el({}, '   Loved it.   '),
    });
    assert.equal(extractFeedbackBody(row as unknown as Element), 'Loved it.');
  });
  it('returns empty string when no selector matches', () => {
    const row = el({});
    assert.equal(extractFeedbackBody(row as unknown as Element), '');
  });
});

describe('extractFeedbackUser', () => {
  it('extracts the .fdbk-container__details__user text', () => {
    const row = el({
      '.fdbk-container__details__user': el({}, 'b***r'),
    });
    assert.equal(extractFeedbackUser(row as unknown as Element), 'b***r');
  });
  it('returns null when no selector matches', () => {
    const row = el({});
    assert.equal(extractFeedbackUser(row as unknown as Element), null);
  });
});

describe('extractFeedbackFromDocument', () => {
  it('walks well-formed feedback rows', () => {
    const row = el({
      '.fdbk-container__details__comment': el({}, 'Excellent transaction'),
      '.fdbk-container__details__user': el({}, 'buyer123'),
      '.fdbk-container__details__date': el({}, 'Apr 12, 2024'),
    });
    const doc = fakeFeedbackDoc([row]);
    const rows = extractFeedbackFromDocument(doc);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.body, 'Excellent transaction');
    assert.equal(rows[0]?.reviewerName, 'buyer123');
    assert.ok(rows[0]?.reviewDate?.startsWith('2024-04-12'));
  });

  it('skips rows missing a body', () => {
    const row = el({
      '.fdbk-container__details__user': el({}, 'buyer123'),
    });
    const rows = extractFeedbackFromDocument(fakeFeedbackDoc([row]));
    assert.equal(rows.length, 0);
  });

  it('falls back to the raw date text when not parseable as a timestamp', () => {
    const row = el({
      '.fdbk-container__details__comment': el({}, 'Late shipping.'),
      '.fdbk-container__details__date': el({}, 'Past month'),
    });
    const rows = extractFeedbackFromDocument(fakeFeedbackDoc([row]));
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.reviewDate, 'Past month');
  });

  it('returns empty array for documents without feedback rows', () => {
    const rows = extractFeedbackFromDocument(fakeFeedbackDoc([]));
    assert.equal(rows.length, 0);
  });
});

// ─── Seller extraction from listing-page DOM ────────────────────────────

function fakeListingDoc(usrLinks: Array<{ href: string; sel?: string }>): Document {
  const scopedMap = new Map<string, FakeEl[]>();
  const allLinks: FakeEl[] = [];
  for (const { href, sel } of usrLinks) {
    const link = el({}, null, { href });
    allLinks.push(link);
    if (sel) {
      const existing = scopedMap.get(sel) ?? [];
      existing.push(link);
      scopedMap.set(sel, existing);
    }
  }
  scopedMap.set('a[href*="/usr/"]', allLinks);

  return {
    querySelector(sel: string): FakeEl | null {
      const found = scopedMap.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel: string): FakeEl[] {
      return scopedMap.get(sel) ?? [];
    },
  } as unknown as Document;
}

describe('extractSellerFromListingDocument', () => {
  it('extracts seller from a scoped [data-testid="x-sellercard-atf"] link', () => {
    const doc = fakeListingDoc([
      {
        href: 'https://www.ebay.com/usr/cool-seller',
        sel: '[data-testid="x-sellercard-atf"] a[href*="/usr/"]',
      },
    ]);
    assert.equal(extractSellerFromListingDocument(doc), 'cool-seller');
  });

  it('falls back to .x-sellercard-atf__info scope', () => {
    const doc = fakeListingDoc([
      {
        href: 'https://www.ebay.com/usr/fallback-seller',
        sel: '.x-sellercard-atf__info a[href*="/usr/"]',
      },
    ]);
    assert.equal(extractSellerFromListingDocument(doc), 'fallback-seller');
  });

  it('falls back to any /usr/ link when no scoped selector matches', () => {
    const doc = fakeListingDoc([
      { href: 'https://www.ebay.com/usr/any-seller' },
    ]);
    assert.equal(extractSellerFromListingDocument(doc), 'any-seller');
  });

  it('URL-decodes percent-encoded usernames in /usr/ href', () => {
    const doc = fakeListingDoc([
      { href: 'https://www.ebay.com/usr/cool%20seller' },
    ]);
    assert.equal(extractSellerFromListingDocument(doc), 'cool seller');
  });

  it('returns null when no /usr/ link is present', () => {
    const doc = fakeListingDoc([]);
    assert.equal(extractSellerFromListingDocument(doc), null);
  });

  it('returns null when /usr/ href is malformed (no username segment)', () => {
    const doc = fakeListingDoc([{ href: 'https://www.ebay.com/usr/' }]);
    assert.equal(extractSellerFromListingDocument(doc), null);
  });
});

describe('EbayFeedbackFilter typing (compile-time sanity)', () => {
  it('EBAY_FEEDBACK_FILTERS values are all assignable to EbayFeedbackFilter', () => {
    const allFilters: EbayFeedbackFilter[] = [...EBAY_FEEDBACK_FILTERS];
    assert.equal(allFilters.length, EBAY_FEEDBACK_FILTERS.length);
  });
});
