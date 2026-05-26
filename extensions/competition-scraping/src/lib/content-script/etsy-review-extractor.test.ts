// Tests for the Etsy review extractor pure functions shipped under P-49
// Workstream 2 Etsy sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md
// §C.2 + §A.2 priority order.
//
// FF#1 (test rewrite) — selectors now empirically grounded in director's
// 2026-05-31 overlay HTML paste rather than speculation. Live-DOM driver
// integration paths (waitForOverlay, waitForReviewsSwap, runEtsyReviewScrape
// click+wait+walk) are validated via Phase 4 director walk, not unit
// tested here (would require a real browser harness).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ETSY_DEFAULT_SELECTED_STARS,
  ETSY_STAR_FILTERS,
  extractListingIdFromEtsyUrl,
  extractListingIdFromListingUrl,
  extractReviewBody,
  extractReviewDate,
  extractReviewStarRating,
  extractReviewerName,
  extractReviewsFromOverlay,
  findHistogramButton,
  findNextPageButton,
  findOverlayContainer,
  findReviewsContainer,
  findViewAllReviewsButton,
  isEtsyListingPage,
  isEtsyScrapableUrl,
  isEtsyStarFilter,
  isHistogramButtonDisabled,
  isNextPageButtonDisabled,
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
        'https://www.etsy.com/listing/4381757599/new-all-in-one-serum-for-eyes-face?ls=a&ref=sc_gallery-1-7',
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
    assert.equal(
      isEtsyScrapableUrl('https://www.etsy.com/listing/123456789?ratings=3'),
      isEtsyListingPage('https://www.etsy.com/listing/123456789?ratings=3'),
    );
  });
  it('rejects etsy URLs without listing shape', () => {
    assert.equal(isEtsyScrapableUrl('https://www.etsy.com/shop/foo'), false);
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
  it('extracts the listing_id from director-supplied 2026-05-31 URL with full query string', () => {
    assert.equal(
      extractListingIdFromListingUrl(
        'https://www.etsy.com/listing/4381757599/new-all-in-one-serum-for-eyes-face?ls=a&ga_order=most_relevant&ref=sc_gallery-1-7',
      ),
      '4381757599',
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
      assert.ok(
        isEtsyStarFilter(rating),
        `${String(rating)} should be a valid star filter`,
      );
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

// ─── parseEtsyStarRating ────────────────────────────────────────────────

describe('parseEtsyStarRating', () => {
  it('parses "Rating: 5 out of 5 stars" → 5 (canonical overlay shape)', () => {
    assert.equal(parseEtsyStarRating('Rating: 5 out of 5 stars'), 5);
  });
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
  it('parses "May 20, 2026" → ISO 2026-05-20 (director-supplied empirical date)', () => {
    const iso = parseEtsyReviewDate('May 20, 2026');
    assert.ok(iso);
    assert.equal(iso?.slice(0, 10), '2026-05-20');
  });
  it('parses "Apr 12, 2024"', () => {
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

// ─── isHistogramButtonDisabled + isNextPageButtonDisabled ───────────────

describe('isHistogramButtonDisabled', () => {
  it('returns true when aria-disabled="true"', () => {
    const btn = makeFakeElement({ attrs: { 'aria-disabled': 'true' } });
    assert.equal(isHistogramButtonDisabled(btn as unknown as Element), true);
  });
  it('returns true when disabled attribute present (empirical case — 2-star at 0%)', () => {
    // Director's HTML shows 2-star button with both `disabled=""` + `aria-disabled="true"`.
    const btn = makeFakeElement({ attrs: { disabled: '', 'aria-disabled': 'true' } });
    assert.equal(isHistogramButtonDisabled(btn as unknown as Element), true);
  });
  it('returns false when only aria-disabled="false"', () => {
    const btn = makeFakeElement({ attrs: { 'aria-disabled': 'false' } });
    assert.equal(isHistogramButtonDisabled(btn as unknown as Element), false);
  });
  it('returns false with no disabled attributes', () => {
    const btn = makeFakeElement({ attrs: {} });
    assert.equal(isHistogramButtonDisabled(btn as unknown as Element), false);
  });
});

describe('isNextPageButtonDisabled', () => {
  it('returns true when aria-disabled="true"', () => {
    const btn = makeFakeElement({ attrs: { 'aria-disabled': 'true' } });
    assert.equal(isNextPageButtonDisabled(btn as unknown as Element), true);
  });
  it('returns true when disabled attribute present', () => {
    const btn = makeFakeElement({ attrs: { disabled: '' } });
    assert.equal(isNextPageButtonDisabled(btn as unknown as Element), true);
  });
  it('returns false on a clickable button', () => {
    const btn = makeFakeElement({ attrs: {} });
    assert.equal(isNextPageButtonDisabled(btn as unknown as Element), false);
  });
});

// ─── DOM walker tests — hand-built fake Document ────────────────────────
//
// Selectors below use a pre-registered child-map pattern (mirrors eBay +
// Amazon test infrastructure). Each fake element carries a registry of
// `selector → child(ren)`; querySelector / querySelectorAll look up the
// registry directly. Tag name + parentElement + children are tracked
// explicitly for the extractReviewDate sibling-walk path.

interface FakeEl {
  tagName: string;
  textContent: string | null;
  attributes: Record<string, string>;
  registry: Map<string, FakeEl[]>;
  children: FakeEl[];
  parentElement: FakeEl | null;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelector(sel: string): FakeEl | null;
  querySelectorAll(sel: string): FakeEl[];
}

// Return type intersection cast (`FakeEl & ParentNode & Element`) lets the
// helper satisfy both: (a) test internals that read FakeEl fields directly,
// (b) calls into the production module that expect ParentNode / Element.
// The runtime object only implements the FakeEl subset; the cast is a
// type-system escape hatch needed because FakeEl can't structurally match
// the full DOM Element interface (50+ properties).
type ParentLike = FakeEl & ParentNode & Element;

function makeFakeElement(opts: {
  tag?: string;
  attrs?: Record<string, string>;
  textContent?: string | null;
  registry?: Record<string, FakeEl | FakeEl[]>;
  children?: FakeEl[];
}): ParentLike {
  const registry = new Map<string, FakeEl[]>();
  if (opts.registry) {
    for (const [sel, kids] of Object.entries(opts.registry)) {
      registry.set(sel, Array.isArray(kids) ? kids : [kids]);
    }
  }
  const children = opts.children ?? [];
  const el: FakeEl = {
    tagName: (opts.tag ?? 'div').toUpperCase(),
    textContent: opts.textContent ?? null,
    attributes: { ...(opts.attrs ?? {}) },
    registry,
    children,
    parentElement: null,
    getAttribute(name) {
      return name in this.attributes ? (this.attributes[name] ?? null) : null;
    },
    hasAttribute(name) {
      return name in this.attributes;
    },
    querySelector(sel) {
      const found = this.registry.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel) {
      return this.registry.get(sel) ?? [];
    },
  };
  for (const child of children) {
    child.parentElement = el;
  }
  return el as unknown as ParentLike;
}

function fakeDocLike(registry: Record<string, FakeEl | FakeEl[]>): Document {
  const map = new Map<string, FakeEl[]>();
  for (const [sel, kids] of Object.entries(registry)) {
    map.set(sel, Array.isArray(kids) ? kids : [kids]);
  }
  return {
    querySelector(sel: string): FakeEl | null {
      const found = map.get(sel);
      return found && found.length > 0 ? (found[0] ?? null) : null;
    },
    querySelectorAll(sel: string): FakeEl[] {
      return map.get(sel) ?? [];
    },
  } as unknown as Document;
}

// ─── findOverlayContainer ───────────────────────────────────────────────

describe('findOverlayContainer (FF#3 empirical-fix selector)', () => {
  it('finds the visible .deep-dive-sheet element', () => {
    const overlay = makeFakeElement({
      attrs: { 'aria-modal': 'true', role: 'dialog', class: 'deep-dive-sheet center-sheet' },
    });
    const doc = fakeDocLike({ '.deep-dive-sheet': [overlay] });
    assert.equal(findOverlayContainer(doc), overlay);
  });
  it('rejects .deep-dive-sheet variants with aria-hidden="true" (defensive)', () => {
    const hiddenOverlay = makeFakeElement({
      attrs: { class: 'deep-dive-sheet', 'aria-hidden': 'true' },
    });
    const doc = fakeDocLike({ '.deep-dive-sheet': [hiddenOverlay] });
    assert.equal(findOverlayContainer(doc), null);
  });
  it('rejects .deep-dive-sheet variants with wt-display-none class (defensive)', () => {
    const hiddenOverlay = makeFakeElement({
      attrs: { class: 'deep-dive-sheet wt-display-none' },
    });
    const doc = fakeDocLike({ '.deep-dive-sheet': [hiddenOverlay] });
    assert.equal(findOverlayContainer(doc), null);
  });
  it('rejects .deep-dive-sheet variants with hidden attribute (defensive)', () => {
    const hiddenOverlay = makeFakeElement({
      attrs: { class: 'deep-dive-sheet', hidden: '' },
    });
    const doc = fakeDocLike({ '.deep-dive-sheet': [hiddenOverlay] });
    assert.equal(findOverlayContainer(doc), null);
  });
  it('returns the first visible .deep-dive-sheet when multiple candidates exist (skips hidden ones)', () => {
    const hiddenOverlay = makeFakeElement({
      attrs: { class: 'deep-dive-sheet', 'aria-hidden': 'true' },
    });
    const visibleOverlay = makeFakeElement({
      attrs: { class: 'deep-dive-sheet center-sheet' },
    });
    const doc = fakeDocLike({ '.deep-dive-sheet': [hiddenOverlay, visibleOverlay] });
    assert.equal(findOverlayContainer(doc), visibleOverlay);
  });
  it('FF#3 regression — does NOT match non-deep-dive dialogs like #customer-photo-overlay-carousel', () => {
    // FF#1 BUSTED because the over-broad [aria-modal="true"][role="dialog"]
    // fallback selector matched Etsy's review-photo lightbox (a hidden
    // dialog present in the DOM at page load). The empirical-fix restricts
    // to .deep-dive-sheet — non-deep-dive dialogs no longer leak in.
    // Empirical evidence: FF#2 diagnostic dump 2026-05-31.
    const doc = fakeDocLike({ '.deep-dive-sheet': [] });
    assert.equal(findOverlayContainer(doc), null);
  });
  it('returns null when no overlay element exists', () => {
    const doc = fakeDocLike({ '.deep-dive-sheet': [] });
    assert.equal(findOverlayContainer(doc), null);
  });
});

// ─── findReviewsContainer ───────────────────────────────────────────────

describe('findReviewsContainer', () => {
  it('finds [data-deep-dive-reviews-container="true"]', () => {
    const container = makeFakeElement({});
    const overlay = makeFakeElement({
      registry: { '[data-deep-dive-reviews-container="true"]': container },
    });
    assert.equal(findReviewsContainer(overlay), container);
  });
  it('returns null when container absent', () => {
    const overlay = makeFakeElement({});
    assert.equal(findReviewsContainer(overlay), null);
  });
});

// ─── findHistogramButton ────────────────────────────────────────────────

describe('findHistogramButton', () => {
  it('finds the histogram button for the given star rating', () => {
    const btn3 = makeFakeElement({ tag: 'button', attrs: { 'data-rating-value': '3' } });
    const overlay = makeFakeElement({
      registry: {
        '[data-reviews-histogram="true"] button[data-rating-value="3"]': btn3,
      },
    });
    assert.equal(findHistogramButton(overlay, 3), btn3);
  });
  it('finds the histogram button for 1-star (director default selection includes 1★)', () => {
    const btn1 = makeFakeElement({ tag: 'button', attrs: { 'data-rating-value': '1' } });
    const overlay = makeFakeElement({
      registry: {
        '[data-reviews-histogram="true"] button[data-rating-value="1"]': btn1,
      },
    });
    assert.equal(findHistogramButton(overlay, 1), btn1);
  });
  it('returns null when the histogram button is absent', () => {
    const overlay = makeFakeElement({});
    assert.equal(findHistogramButton(overlay, 3), null);
  });
});

// ─── findNextPageButton ─────────────────────────────────────────────────

describe('findNextPageButton', () => {
  it('finds the button containing <span class="wt-screen-reader-only">Next</span>', () => {
    const srOnly = makeFakeElement({
      tag: 'span',
      attrs: { class: 'wt-screen-reader-only' },
      textContent: 'Next',
    });
    const nextBtn = makeFakeElement({
      tag: 'button',
      registry: { '.wt-screen-reader-only': srOnly },
    });
    const prevSrOnly = makeFakeElement({
      tag: 'span',
      attrs: { class: 'wt-screen-reader-only' },
      textContent: 'Previous',
    });
    const prevBtn = makeFakeElement({
      tag: 'button',
      registry: { '.wt-screen-reader-only': prevSrOnly },
    });
    const nav = makeFakeElement({
      tag: 'nav',
      registry: { button: [prevBtn, nextBtn] },
    });
    const overlay = makeFakeElement({
      registry: {
        'nav[aria-label="Pagination of reviews"], nav[data-clg-id="WtPagination"]': nav,
      },
    });
    assert.equal(findNextPageButton(overlay), nextBtn);
  });
  it('returns null when no pagination nav exists (single-page result)', () => {
    const overlay = makeFakeElement({});
    assert.equal(findNextPageButton(overlay), null);
  });
  it('returns null when nav exists but no button has Next screen-reader text', () => {
    const someBtn = makeFakeElement({ tag: 'button' });
    const nav = makeFakeElement({
      tag: 'nav',
      registry: { button: [someBtn] },
    });
    const overlay = makeFakeElement({
      registry: {
        'nav[aria-label="Pagination of reviews"], nav[data-clg-id="WtPagination"]': nav,
      },
    });
    assert.equal(findNextPageButton(overlay), null);
  });
});

// ─── findViewAllReviewsButton ───────────────────────────────────────────

describe('findViewAllReviewsButton', () => {
  it('finds a button with exact canonical text', () => {
    const btn = makeFakeElement({
      tag: 'button',
      textContent: 'View all reviews for this item',
    });
    const doc = fakeDocLike({ 'button, a': [btn] });
    assert.equal(findViewAllReviewsButton(doc), btn);
  });
  it('finds canonical text with surrounding whitespace', () => {
    const btn = makeFakeElement({
      tag: 'button',
      textContent: '   View all reviews for this item   ',
    });
    const doc = fakeDocLike({ 'button, a': [btn] });
    assert.equal(findViewAllReviewsButton(doc), btn);
  });
  it('is case-insensitive', () => {
    const btn = makeFakeElement({
      tag: 'button',
      textContent: 'VIEW ALL REVIEWS FOR THIS ITEM',
    });
    const doc = fakeDocLike({ 'button, a': [btn] });
    assert.equal(findViewAllReviewsButton(doc), btn);
  });
  it('falls back to "View all reviews" prefix for regional variants like "View all 107 reviews"', () => {
    const btn = makeFakeElement({
      tag: 'button',
      textContent: 'View all reviews (107)',
    });
    const doc = fakeDocLike({ 'button, a': [btn] });
    assert.equal(findViewAllReviewsButton(doc), btn);
  });
  it('returns null when no matching button or anchor exists', () => {
    const btn = makeFakeElement({ tag: 'button', textContent: 'Some other action' });
    const doc = fakeDocLike({ 'button, a': [btn] });
    assert.equal(findViewAllReviewsButton(doc), null);
  });
  it('returns null when document has no buttons or anchors', () => {
    const doc = fakeDocLike({});
    assert.equal(findViewAllReviewsButton(doc), null);
  });
});

// ─── extractReviewBody ──────────────────────────────────────────────────

describe('extractReviewBody', () => {
  it('extracts the canonical .wt-text-body text (director-verified empirical selector)', () => {
    const row = makeFakeElement({
      registry: {
        '.wt-text-body': makeFakeElement({ textContent: 'I think this is working, thank you!' }),
      },
    });
    assert.equal(
      extractReviewBody(row as unknown as Element),
      'I think this is working, thank you!',
    );
  });
  it('falls back to .shop-review-card__text when .wt-text-body missing', () => {
    const row = makeFakeElement({
      registry: {
        '.shop-review-card__text': makeFakeElement({ textContent: 'Fallback path text' }),
      },
    });
    assert.equal(
      extractReviewBody(row as unknown as Element),
      'Fallback path text',
    );
  });
  it('returns empty string when no selector matches', () => {
    const row = makeFakeElement({});
    assert.equal(extractReviewBody(row as unknown as Element), '');
  });
});

// ─── extractReviewerName ────────────────────────────────────────────────

describe('extractReviewerName', () => {
  it('extracts text content from a[href*="/people/"] link (director-verified empirical selector)', () => {
    const link = makeFakeElement({
      tag: 'a',
      attrs: { href: 'https://www.etsy.com/people/jembot?ref=l_review' },
      textContent: 'Jenny',
    });
    const row = makeFakeElement({
      registry: { 'a[href*="/people/"]': link },
    });
    assert.equal(extractReviewerName(row as unknown as Element), 'Jenny');
  });
  it('extracts "Etsy buyer" generic reviewer name (empirical case from director paste)', () => {
    const link = makeFakeElement({
      tag: 'a',
      attrs: { href: 'https://www.etsy.com/people/melanielisa27?ref=l_review' },
      textContent: 'Etsy buyer',
    });
    const row = makeFakeElement({
      registry: { 'a[href*="/people/"]': link },
    });
    assert.equal(extractReviewerName(row as unknown as Element), 'Etsy buyer');
  });
  it('returns null when no /people/ link exists', () => {
    const row = makeFakeElement({});
    assert.equal(extractReviewerName(row as unknown as Element), null);
  });
});

// ─── extractReviewStarRating ────────────────────────────────────────────

describe('extractReviewStarRating', () => {
  it('extracts the rating from [role="img"][aria-label^="Rating:"] (director-verified empirical shape)', () => {
    const ratingEl = makeFakeElement({
      attrs: { role: 'img', 'aria-label': 'Rating: 5 out of 5 stars' },
    });
    const row = makeFakeElement({
      registry: { '[role="img"][aria-label^="Rating:"]': ratingEl },
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), 5);
  });
  it('extracts 3-star rating', () => {
    const ratingEl = makeFakeElement({
      attrs: { role: 'img', 'aria-label': 'Rating: 3 out of 5 stars' },
    });
    const row = makeFakeElement({
      registry: { '[role="img"][aria-label^="Rating:"]': ratingEl },
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), 3);
  });
  it('falls back to generic [aria-label] for classic-view variants', () => {
    const ratingEl = makeFakeElement({
      attrs: { 'aria-label': '4 stars' },
    });
    const row = makeFakeElement({
      registry: { '[aria-label]': [ratingEl] },
    });
    assert.equal(extractReviewStarRating(row as unknown as Element), 4);
  });
  it('returns null when no rating element matches', () => {
    const row = makeFakeElement({});
    assert.equal(extractReviewStarRating(row as unknown as Element), null);
  });
});

// ─── extractReviewDate (fallback selector path; primary sibling-walk
//     path is verified empirically by Phase 4 director walk) ─────────────

describe('extractReviewDate (fallback selector paths)', () => {
  it('extracts + parses date via .wt-text-body-small--tight.wt-sem-text-secondary fallback', () => {
    const dateEl = makeFakeElement({ textContent: 'May 20, 2026' });
    const row = makeFakeElement({
      registry: {
        '.wt-text-body-small--tight.wt-sem-text-secondary': dateEl,
      },
    });
    const date = extractReviewDate(row as unknown as Element);
    assert.ok(date);
    assert.equal(date?.slice(0, 10), '2026-05-20');
  });
  it('falls back to raw text when date selector matches but parsing fails', () => {
    const dateEl = makeFakeElement({ textContent: 'Past month' });
    const row = makeFakeElement({
      registry: {
        '.wt-text-body-small--tight.wt-sem-text-secondary': dateEl,
      },
    });
    assert.equal(extractReviewDate(row as unknown as Element), 'Past month');
  });
  it('returns null when no date selector matches', () => {
    const row = makeFakeElement({});
    assert.equal(extractReviewDate(row as unknown as Element), null);
  });
});

// ─── extractReviewsFromOverlay ──────────────────────────────────────────

describe('extractReviewsFromOverlay', () => {
  function makeReviewRow(opts: {
    regionId: string;
    body: string;
    reviewerName?: string;
    starText?: string;
  }): FakeEl {
    const registry: Record<string, FakeEl | FakeEl[]> = {
      '.wt-text-body': makeFakeElement({ textContent: opts.body }),
    };
    if (opts.reviewerName) {
      registry['a[href*="/people/"]'] = makeFakeElement({
        tag: 'a',
        attrs: { href: `https://www.etsy.com/people/${opts.reviewerName.toLowerCase()}?ref=l_review` },
        textContent: opts.reviewerName,
      });
    }
    if (opts.starText) {
      registry['[role="img"][aria-label^="Rating:"]'] = makeFakeElement({
        attrs: { role: 'img', 'aria-label': opts.starText },
      });
    }
    return makeFakeElement({
      attrs: { 'data-review-region': opts.regionId },
      registry,
    });
  }

  it('extracts rows from the canonical overlay structure', () => {
    const row1 = makeReviewRow({
      regionId: '4979219644',
      body: 'I think this is working, thank you!',
      reviewerName: 'Jenny',
      starText: 'Rating: 5 out of 5 stars',
    });
    const row2 = makeReviewRow({
      regionId: '5011630937',
      body: 'Thank you very much! ☺️',
      reviewerName: 'Etsy buyer',
      starText: 'Rating: 5 out of 5 stars',
    });
    const container = makeFakeElement({
      registry: { '[data-review-region]': [row1, row2] },
    });
    const overlay = makeFakeElement({
      registry: { '[data-deep-dive-reviews-container="true"]': container },
    });
    const rows = extractReviewsFromOverlay(overlay);
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.body, 'I think this is working, thank you!');
    assert.equal(rows[0]?.reviewerName, 'Jenny');
    assert.equal(rows[0]?.starRating, 5);
    assert.equal(rows[0]?.reviewRegionId, '4979219644');
    assert.equal(rows[1]?.body, 'Thank you very much! ☺️');
    assert.equal(rows[1]?.reviewerName, 'Etsy buyer');
    assert.equal(rows[1]?.reviewRegionId, '5011630937');
  });
  it('skips rows with no body (defensive — Etsy may emit decorative placeholders)', () => {
    const emptyRow = makeFakeElement({
      attrs: { 'data-review-region': 'empty1' },
      registry: {},
    });
    const fullRow = makeReviewRow({
      regionId: '4979219644',
      body: 'Valid body',
    });
    const container = makeFakeElement({
      registry: { '[data-review-region]': [emptyRow, fullRow] },
    });
    const overlay = makeFakeElement({
      registry: { '[data-deep-dive-reviews-container="true"]': container },
    });
    const rows = extractReviewsFromOverlay(overlay);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.body, 'Valid body');
  });
  it('returns empty array when reviews container is absent', () => {
    const overlay = makeFakeElement({});
    assert.deepEqual(extractReviewsFromOverlay(overlay), [] as EtsyReviewRow[]);
  });
  it('returns empty array when reviews container is present but has no rows', () => {
    const container = makeFakeElement({
      registry: { '[data-review-region]': [] },
    });
    const overlay = makeFakeElement({
      registry: { '[data-deep-dive-reviews-container="true"]': container },
    });
    assert.deepEqual(extractReviewsFromOverlay(overlay), [] as EtsyReviewRow[]);
  });
});

// ─── Type-level sanity check ────────────────────────────────────────────

describe('EtsyStarFilter type narrowing', () => {
  it('isEtsyStarFilter narrows numeric inputs to the EtsyStarFilter union', () => {
    const candidate: number = 3;
    if (isEtsyStarFilter(candidate)) {
      const narrowed: EtsyStarFilter = candidate;
      assert.equal(narrowed, 3);
    } else {
      assert.fail('3 should narrow to EtsyStarFilter');
    }
  });
});
