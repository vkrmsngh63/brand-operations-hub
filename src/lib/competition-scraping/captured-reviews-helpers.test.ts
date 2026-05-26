// W#2 P-49 Workstream 4 Session 1 — node:test cases for the pure helpers
// powering the Captured Reviews section. Spec:
// docs/REVIEWS_PHASE_2_DESIGN.md §A.5 + §A.6 + §A.14.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { CapturedReview } from '../shared-types/competition-scraping.ts';
import {
  CUSTOMERS_SAY_SOURCE,
  compareReviews,
  computeStarCounts,
  filterByStarSelection,
  spliceVisibleReorderIntoFull,
  splitCustomersSay,
} from './captured-reviews-helpers.ts';

function makeReview(overrides: Partial<CapturedReview> = {}): CapturedReview {
  return {
    id: 'rev-1',
    clientId: 'client-1',
    competitorUrlId: 'url-1',
    starRating: 5,
    body: 'great product',
    reviewerName: null,
    reviewDate: null,
    tags: [],
    analysis: {},
    source: 'extension-scrape',
    sortRank: null,
    helpfulCount: null,
    platform: null,
    addedBy: 'u-1',
    addedAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-04-12T00:00:00.000Z',
    ...overrides,
  };
}

test('compareReviews: addedAt desc puts newer reviews first', () => {
  const older = makeReview({ id: 'a', addedAt: '2026-04-01T00:00:00.000Z' });
  const newer = makeReview({ id: 'b', addedAt: '2026-05-01T00:00:00.000Z' });
  assert.ok(compareReviews(newer, older, 'addedAt', 'desc') < 0);
  assert.ok(compareReviews(older, newer, 'addedAt', 'desc') > 0);
});

test('compareReviews: addedAt asc puts older reviews first', () => {
  const older = makeReview({ id: 'a', addedAt: '2026-04-01T00:00:00.000Z' });
  const newer = makeReview({ id: 'b', addedAt: '2026-05-01T00:00:00.000Z' });
  assert.ok(compareReviews(older, newer, 'addedAt', 'asc') < 0);
});

test('compareReviews: starRating asc puts 1-star before 5-star', () => {
  const oneStar = makeReview({ id: 'a', starRating: 1 });
  const fiveStar = makeReview({ id: 'b', starRating: 5 });
  assert.ok(compareReviews(oneStar, fiveStar, 'starRating', 'asc') < 0);
});

test('compareReviews: starRating desc puts 5-star before 1-star', () => {
  const oneStar = makeReview({ id: 'a', starRating: 1 });
  const fiveStar = makeReview({ id: 'b', starRating: 5 });
  assert.ok(compareReviews(fiveStar, oneStar, 'starRating', 'desc') < 0);
});

test('compareReviews: manual sorts by sortRank ascending', () => {
  const ranked0 = makeReview({ id: 'a', sortRank: 0 });
  const ranked5 = makeReview({ id: 'b', sortRank: 5 });
  assert.ok(compareReviews(ranked0, ranked5, 'manual', 'asc') < 0);
  // sortDir is ignored in manual mode — always ascending
  assert.ok(compareReviews(ranked0, ranked5, 'manual', 'desc') < 0);
});

test('compareReviews: manual sorts null sortRank rows last', () => {
  const ranked = makeReview({ id: 'a', sortRank: 10 });
  const unranked = makeReview({ id: 'b', sortRank: null });
  assert.ok(compareReviews(ranked, unranked, 'manual', 'asc') < 0);
  assert.ok(compareReviews(unranked, ranked, 'manual', 'asc') > 0);
});

test('compareReviews: manual breaks ties by addedAt asc when both null', () => {
  const older = makeReview({
    id: 'a',
    sortRank: null,
    addedAt: '2026-04-01T00:00:00.000Z',
  });
  const newer = makeReview({
    id: 'b',
    sortRank: null,
    addedAt: '2026-05-01T00:00:00.000Z',
  });
  assert.ok(compareReviews(older, newer, 'manual', 'asc') < 0);
});

test('compareReviews: manual breaks tied sortRanks by addedAt asc', () => {
  const a = makeReview({
    id: 'a',
    sortRank: 3,
    addedAt: '2026-04-01T00:00:00.000Z',
  });
  const b = makeReview({
    id: 'b',
    sortRank: 3,
    addedAt: '2026-05-01T00:00:00.000Z',
  });
  assert.ok(compareReviews(a, b, 'manual', 'asc') < 0);
});

test('splitCustomersSay: empty input returns empty buckets', () => {
  const { customersSay, main } = splitCustomersSay([]);
  assert.deepEqual(customersSay, []);
  assert.deepEqual(main, []);
});

test('splitCustomersSay: separates Customers-say rows from main list', () => {
  const main1 = makeReview({ id: 'm1', source: 'extension-scrape' });
  const cs = makeReview({ id: 'cs', source: CUSTOMERS_SAY_SOURCE });
  const main2 = makeReview({ id: 'm2', source: 'manual' });
  const { customersSay, main } = splitCustomersSay([main1, cs, main2]);
  assert.deepEqual(
    customersSay.map((r) => r.id),
    ['cs']
  );
  assert.deepEqual(
    main.map((r) => r.id),
    ['m1', 'm2']
  );
});

test('splitCustomersSay: preserves input order within each bucket', () => {
  const a = makeReview({ id: 'a', source: 'extension-scrape' });
  const cs1 = makeReview({ id: 'cs1', source: CUSTOMERS_SAY_SOURCE });
  const b = makeReview({ id: 'b', source: 'manual' });
  const cs2 = makeReview({ id: 'cs2', source: CUSTOMERS_SAY_SOURCE });
  const { customersSay, main } = splitCustomersSay([a, cs1, b, cs2]);
  assert.deepEqual(
    main.map((r) => r.id),
    ['a', 'b']
  );
  assert.deepEqual(
    customersSay.map((r) => r.id),
    ['cs1', 'cs2']
  );
});

test('computeStarCounts: empty list returns all-zero counts', () => {
  const counts = computeStarCounts([]);
  assert.deepEqual(counts, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
});

test('computeStarCounts: tallies per-star occurrences', () => {
  const counts = computeStarCounts([
    makeReview({ id: 'a', starRating: 5 }),
    makeReview({ id: 'b', starRating: 5 }),
    makeReview({ id: 'c', starRating: 1 }),
    makeReview({ id: 'd', starRating: 3 }),
    makeReview({ id: 'e', starRating: 3 }),
  ]);
  assert.deepEqual(counts, { 1: 1, 2: 0, 3: 2, 4: 0, 5: 2 });
});

test('computeStarCounts: silently drops out-of-range starRating values', () => {
  const counts = computeStarCounts([
    makeReview({ id: 'a', starRating: 5 }),
    // Defensive: schema enforces 1..5 at write time but the helper is
    // resilient to bad data. starRating=0 + starRating=10 just don't count.
    makeReview({ id: 'b', starRating: 0 as unknown as 1 }),
    makeReview({ id: 'c', starRating: 10 as unknown as 5 }),
  ]);
  assert.deepEqual(counts, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 });
});

test('filterByStarSelection: empty selection returns the input unchanged', () => {
  const list = [
    makeReview({ id: 'a', starRating: 1 }),
    makeReview({ id: 'b', starRating: 5 }),
  ];
  assert.equal(filterByStarSelection(list, new Set()), list);
});

test('filterByStarSelection: single-star selection keeps only matching rows', () => {
  const list = [
    makeReview({ id: 'a', starRating: 1 }),
    makeReview({ id: 'b', starRating: 5 }),
    makeReview({ id: 'c', starRating: 1 }),
  ];
  const result = filterByStarSelection(list, new Set([1]));
  assert.deepEqual(
    result.map((r) => r.id),
    ['a', 'c']
  );
});

test('filterByStarSelection: multi-star selection ORs across stars', () => {
  const list = [
    makeReview({ id: 'a', starRating: 1 }),
    makeReview({ id: 'b', starRating: 3 }),
    makeReview({ id: 'c', starRating: 5 }),
  ];
  const result = filterByStarSelection(list, new Set([1, 5]));
  assert.deepEqual(
    result.map((r) => r.id),
    ['a', 'c']
  );
});

test('spliceVisibleReorderIntoFull: appends non-visible IDs at the end in source order', () => {
  const full = [
    makeReview({ id: 'a' }),
    makeReview({ id: 'b' }),
    makeReview({ id: 'c' }),
    makeReview({ id: 'd' }),
  ];
  // Visible-after-drag = [c, a] (e.g., filtered to 5-star + reordered)
  const result = spliceVisibleReorderIntoFull(['c', 'a'], full);
  assert.deepEqual(result, ['c', 'a', 'b', 'd']);
});

test('spliceVisibleReorderIntoFull: returns the visible list as-is when all rows visible', () => {
  const full = [makeReview({ id: 'a' }), makeReview({ id: 'b' })];
  const result = spliceVisibleReorderIntoFull(['b', 'a'], full);
  assert.deepEqual(result, ['b', 'a']);
});

test('spliceVisibleReorderIntoFull: empty visible returns the full list in original order', () => {
  const full = [makeReview({ id: 'a' }), makeReview({ id: 'b' })];
  const result = spliceVisibleReorderIntoFull([], full);
  assert.deepEqual(result, ['a', 'b']);
});
