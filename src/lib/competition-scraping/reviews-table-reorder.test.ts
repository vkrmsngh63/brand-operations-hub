// W#2 P-49 Workstream 5 Fix Session C "Deploy 2" (2026-05-29-c) — node:test
// cases for the pure drag-to-reorder helpers on the Competitor Reviews
// Analysis Table page.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  orderByRowOrder,
  sortReviewsByTableRank,
  arrayMoveIds,
  mergeRowOrder,
  buildReviewOrderings,
  type RankedReview,
} from './reviews-table-reorder.ts';

// ─── orderByRowOrder ────────────────────────────────────────────────

test('orderByRowOrder: empty rowOrder returns rows in original order', () => {
  const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(orderByRowOrder(rows, []).map((r) => r.id), ['a', 'b', 'c']);
});

test('orderByRowOrder: applies the saved order', () => {
  const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(
    orderByRowOrder(rows, ['c', 'a', 'b']).map((r) => r.id),
    ['c', 'a', 'b']
  );
});

test('orderByRowOrder: ids absent from rowOrder are appended in original order', () => {
  const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  // Only b + d are ranked; a + c keep their original relative order after.
  assert.deepEqual(
    orderByRowOrder(rows, ['d', 'b']).map((r) => r.id),
    ['d', 'b', 'a', 'c']
  );
});

test('orderByRowOrder: rowOrder ids not present in rows are ignored', () => {
  const rows = [{ id: 'a' }, { id: 'b' }];
  assert.deepEqual(
    orderByRowOrder(rows, ['z', 'b', 'a']).map((r) => r.id),
    ['b', 'a']
  );
});

test('orderByRowOrder: does not mutate the input array', () => {
  const rows = [{ id: 'a' }, { id: 'b' }];
  const copy = [...rows];
  orderByRowOrder(rows, ['b', 'a']);
  assert.deepEqual(rows, copy);
});

// ─── sortReviewsByTableRank ─────────────────────────────────────────

function review(
  id: string,
  rank: number | null,
  addedAt = '2026-01-01T00:00:00.000Z'
): RankedReview {
  return { id, sortRankInReviewsTable: rank, addedAt };
}

test('sortReviewsByTableRank: all-null preserves incoming (server) order', () => {
  const reviews = [review('a', null), review('b', null), review('c', null)];
  assert.deepEqual(
    sortReviewsByTableRank(reviews).map((r) => r.id),
    ['a', 'b', 'c']
  );
});

test('sortReviewsByTableRank: ranked rows sort ascending by rank', () => {
  const reviews = [review('a', 2), review('b', 0), review('c', 1)];
  assert.deepEqual(
    sortReviewsByTableRank(reviews).map((r) => r.id),
    ['b', 'c', 'a']
  );
});

test('sortReviewsByTableRank: ranked rows come before unranked, which keep order', () => {
  const reviews = [
    review('a', null),
    review('b', 1),
    review('c', null),
    review('d', 0),
  ];
  assert.deepEqual(
    sortReviewsByTableRank(reviews).map((r) => r.id),
    ['d', 'b', 'a', 'c']
  );
});

test('sortReviewsByTableRank: equal ranks fall back to original order (stable)', () => {
  const reviews = [review('a', 5), review('b', 5)];
  assert.deepEqual(
    sortReviewsByTableRank(reviews).map((r) => r.id),
    ['a', 'b']
  );
});

// ─── arrayMoveIds ───────────────────────────────────────────────────

test('arrayMoveIds: moves an item down', () => {
  assert.deepEqual(arrayMoveIds(['a', 'b', 'c'], 0, 2), ['b', 'c', 'a']);
});

test('arrayMoveIds: moves an item up', () => {
  assert.deepEqual(arrayMoveIds(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b']);
});

test('arrayMoveIds: out-of-range index returns an unchanged copy', () => {
  const ids = ['a', 'b'];
  const out = arrayMoveIds(ids, 5, 0);
  assert.deepEqual(out, ['a', 'b']);
  assert.notEqual(out, ids); // copy, not the same reference
});

// ─── mergeRowOrder ──────────────────────────────────────────────────

test('mergeRowOrder: filtered-out ids are preserved at the tail in prior order', () => {
  // Displayed set is a platform-filtered subset (a, c reordered to c, a);
  // b + d were filtered out and must survive in their prior order.
  const next = mergeRowOrder(['c', 'a'], ['a', 'b', 'c', 'd']);
  assert.deepEqual(next, ['c', 'a', 'b', 'd']);
});

test('mergeRowOrder: with no prior order returns the displayed order', () => {
  assert.deepEqual(mergeRowOrder(['b', 'a'], []), ['b', 'a']);
});

test('mergeRowOrder: displayed ids already in prior order are not duplicated', () => {
  const next = mergeRowOrder(['a', 'b'], ['a', 'b']);
  assert.deepEqual(next, ['a', 'b']);
});

// ─── buildReviewOrderings ───────────────────────────────────────────

test('buildReviewOrderings: assigns index-based ranks in order', () => {
  assert.deepEqual(buildReviewOrderings(['r2', 'r0', 'r1']), [
    { reviewId: 'r2', sortRank: 0 },
    { reviewId: 'r0', sortRank: 1 },
    { reviewId: 'r1', sortRank: 2 },
  ]);
});

test('buildReviewOrderings: empty list yields empty payload', () => {
  assert.deepEqual(buildReviewOrderings([]), []);
});
