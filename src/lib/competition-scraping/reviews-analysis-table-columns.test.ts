// W#2 P-49 W5 Fix Session A (2026-05-29) — pinning tests for the Reviews
// Analysis Table column registry + helpers. The Pattern is "positive
// tests pin the spec shape + computed cell display; negative tests
// assert unrelated surfaces / surfaces that ship in later Fix Sessions
// don't accidentally light up in Fix Session A". Mirrors the test-stub
// level-discriminator filtering Pattern from W5 Session 3
// (CORRECTIONS_LOG §Entry 2026-05-27-c).

import { test } from 'node:test';
import { strict as assert } from 'node:assert';

import {
  REVIEWS_TABLE_COLUMNS,
  EXPAND_TOGGLE_WIDTH,
  ACTIONS_COL_WIDTH,
  MIN_REVIEWS_COLUMN_WIDTH,
  MAX_REVIEWS_COLUMN_WIDTH,
  isReviewsColumnVisible,
  resolveReviewsColumnWidth,
  computeReviewsSummaryCount,
} from './reviews-analysis-table-columns.ts';

// ─── REVIEWS_TABLE_COLUMNS shape ────────────────────────────────────

test('REVIEWS_TABLE_COLUMNS — exactly 10 columns per verbatim spec', () => {
  assert.equal(REVIEWS_TABLE_COLUMNS.length, 10);
});

test('REVIEWS_TABLE_COLUMNS — column order matches spec verbatim left-to-right', () => {
  const ids = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  assert.deepEqual(ids, [
    'platform',
    'competitionCategory',
    'type',
    'productName',
    'resultsPageRank',
    'competitionScore',
    'url',
    'reviewsSummaryCount',
    'compBulleted',
    'compNonBulleted',
  ]);
});

test('REVIEWS_TABLE_COLUMNS — labels match spec text', () => {
  const labels = REVIEWS_TABLE_COLUMNS.map((c) => c.label);
  assert.deepEqual(labels, [
    'Platform',
    'Category',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Reviews Summary',
    'Comprehensive (bulleted)',
    'Comprehensive (non-bulleted)',
  ]);
});

test('REVIEWS_TABLE_COLUMNS — every entry has non-empty id, label, positive numeric defaultWidth', () => {
  for (const col of REVIEWS_TABLE_COLUMNS) {
    assert.equal(typeof col.id, 'string');
    assert.ok(col.id.length > 0, `column id should be non-empty (got "${col.id}")`);
    assert.equal(typeof col.label, 'string');
    assert.ok(col.label.length > 0, `column label should be non-empty (got "${col.label}")`);
    assert.equal(typeof col.defaultWidth, 'number');
    assert.ok(
      col.defaultWidth >= MIN_REVIEWS_COLUMN_WIDTH &&
        col.defaultWidth <= MAX_REVIEWS_COLUMN_WIDTH,
      `defaultWidth ${col.defaultWidth} for "${col.id}" should be in [${MIN_REVIEWS_COLUMN_WIDTH}, ${MAX_REVIEWS_COLUMN_WIDTH}]`
    );
  }
});

test('REVIEWS_TABLE_COLUMNS — column ids are unique (no accidental dupes)', () => {
  const ids = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('Auxiliary widths — expand + actions are positive numeric pixels', () => {
  assert.equal(typeof EXPAND_TOGGLE_WIDTH, 'number');
  assert.ok(EXPAND_TOGGLE_WIDTH > 0);
  assert.equal(typeof ACTIONS_COL_WIDTH, 'number');
  assert.ok(ACTIONS_COL_WIDTH > 0);
});

// ─── isReviewsColumnVisible ─────────────────────────────────────────

test('isReviewsColumnVisible — missing key defaults to visible', () => {
  assert.equal(isReviewsColumnVisible({}, 'platform'), true);
  assert.equal(isReviewsColumnVisible({}, 'unknownColumn'), true);
});

test('isReviewsColumnVisible — explicit false hides', () => {
  assert.equal(isReviewsColumnVisible({ platform: false }, 'platform'), false);
});

test('isReviewsColumnVisible — explicit true shows', () => {
  assert.equal(isReviewsColumnVisible({ platform: true }, 'platform'), true);
});

test('isReviewsColumnVisible — other keys do not affect the lookup', () => {
  const map = { platform: false, type: true };
  assert.equal(isReviewsColumnVisible(map, 'competitionCategory'), true);
  assert.equal(isReviewsColumnVisible(map, 'platform'), false);
});

// ─── resolveReviewsColumnWidth ──────────────────────────────────────

test('resolveReviewsColumnWidth — empty override map → returns column defaultWidth', () => {
  const col = REVIEWS_TABLE_COLUMNS[0];
  assert.equal(resolveReviewsColumnWidth({}, col), col.defaultWidth);
});

test('resolveReviewsColumnWidth — positive override → returns override', () => {
  const col = REVIEWS_TABLE_COLUMNS[0];
  assert.equal(resolveReviewsColumnWidth({ [col.id]: 200 }, col), 200);
});

test('resolveReviewsColumnWidth — zero / negative override → falls back to default', () => {
  // Defensive: clamped at the drag-handle site to MIN/MAX so this
  // branch shouldn't fire in practice, but the helper is conservative.
  const col = REVIEWS_TABLE_COLUMNS[0];
  assert.equal(resolveReviewsColumnWidth({ [col.id]: 0 }, col), col.defaultWidth);
  assert.equal(resolveReviewsColumnWidth({ [col.id]: -10 }, col), col.defaultWidth);
});

test('resolveReviewsColumnWidth — non-numeric override → falls back to default', () => {
  const col = REVIEWS_TABLE_COLUMNS[0];
  // The handler validates inputs at the trust boundary; an
  // unexpectedly stringified value coming back from a stale JSON
  // payload should fall through to the default rather than crash.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widths = { [col.id]: '200' as any };
  assert.equal(resolveReviewsColumnWidth(widths, col), col.defaultWidth);
});

// ─── computeReviewsSummaryCount (Q10 → A plain text) ────────────────

test('computeReviewsSummaryCount — null total → not-loaded discriminator', () => {
  assert.deepEqual(computeReviewsSummaryCount(null, null), {
    kind: 'not-loaded',
  });
  assert.deepEqual(computeReviewsSummaryCount(0, null), {
    kind: 'not-loaded',
  });
});

test('computeReviewsSummaryCount — 0 total → no-reviews discriminator', () => {
  assert.deepEqual(computeReviewsSummaryCount(0, 0), {
    kind: 'no-reviews',
  });
  // null summarized + 0 total still resolves to no-reviews (the
  // summarized count is meaningless when there are no reviews).
  assert.deepEqual(computeReviewsSummaryCount(null, 0), {
    kind: 'no-reviews',
  });
});

test('computeReviewsSummaryCount — populated → plain text "N of M summarized"', () => {
  assert.deepEqual(computeReviewsSummaryCount(3, 12), {
    kind: 'populated',
    text: '3 of 12 summarized',
  });
  assert.deepEqual(computeReviewsSummaryCount(0, 5), {
    kind: 'populated',
    text: '0 of 5 summarized',
  });
  // null summarized + non-zero total → 0 of M (defensive fallback).
  assert.deepEqual(computeReviewsSummaryCount(null, 5), {
    kind: 'populated',
    text: '0 of 5 summarized',
  });
});

test('computeReviewsSummaryCount — fully summarized → N === M', () => {
  assert.deepEqual(computeReviewsSummaryCount(10, 10), {
    kind: 'populated',
    text: '10 of 10 summarized',
  });
});

// ─── Negative tests — Fix Session A scope guards ────────────────────

test('Fix Session A scope guard — no "stars" / "starRating" column id on URL row registry', () => {
  // Stars are a per-REVIEW row concept, not a URL-row column. A "stars"
  // entry creeping into REVIEWS_TABLE_COLUMNS would signal misread of
  // the Category-page spec (which DOES include a stars column).
  const ids = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  assert.equal(ids.includes('stars'), false);
  assert.equal(ids.includes('starRating'), false);
});

test('Fix Session A scope guard — no "category-bulleted" / "type-bulleted" column ids', () => {
  // Category-level + Type-level AI cells ship in the separate Category
  // + Type pages (after Fix Session C). Their column ids should never
  // appear on the Reviews Analysis Table page registry.
  const ids = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  for (const forbidden of [
    'categoryCompBulleted',
    'categoryCompNonBulleted',
    'typeCompBulleted',
    'typeCompNonBulleted',
  ]) {
    assert.equal(
      ids.includes(forbidden),
      false,
      `${forbidden} belongs on the Category/Type page registries, not this one`
    );
  }
});
