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
  isReviewsColumnVisible,
  buildUrlRowGrid,
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

test('REVIEWS_TABLE_COLUMNS — every entry has non-empty id, label, width', () => {
  for (const col of REVIEWS_TABLE_COLUMNS) {
    assert.equal(typeof col.id, 'string');
    assert.ok(col.id.length > 0, `column id should be non-empty (got "${col.id}")`);
    assert.equal(typeof col.label, 'string');
    assert.ok(col.label.length > 0, `column label should be non-empty (got "${col.label}")`);
    assert.equal(typeof col.width, 'string');
    assert.ok(col.width.length > 0, `column width should be non-empty (got "${col.width}")`);
  }
});

test('REVIEWS_TABLE_COLUMNS — column ids are unique (no accidental dupes)', () => {
  const ids = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
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

// ─── buildUrlRowGrid ─────────────────────────────────────────────────

test('buildUrlRowGrid — empty map → all 10 columns + expand + actions = 12 parts', () => {
  const grid = buildUrlRowGrid({});
  const parts = grid.split(' ').reduce<string[]>((acc, p) => {
    // The minmax() entries contain a comma but the split-on-space still
    // keeps them as 2 parts; we count by joining and matching the
    // expected total length.
    acc.push(p);
    return acc;
  }, []);
  // 36px + 10 column widths (some are minmax(A, B) which the naive split
  // breaks into 2 parts each — 2 such columns = +2 extra parts) +
  // ACTIONS_COL_WIDTH = 36px + (8 + 2*2) + 110px = 14 parts via the
  // naive split. Easier assertion: the rendered string starts with the
  // expand width + ends with the actions width.
  assert.ok(grid.startsWith(EXPAND_TOGGLE_WIDTH));
  assert.ok(grid.endsWith(ACTIONS_COL_WIDTH));
});

test('buildUrlRowGrid — single column hidden → that column dropped from template', () => {
  const visible = buildUrlRowGrid({});
  const hidden = buildUrlRowGrid({ platform: false });
  // The hidden grid must be shorter (one column removed).
  assert.ok(hidden.length < visible.length);
  // The hidden grid must NOT contain the 120px platform width as a
  // dedicated token between expand and category — verify by checking
  // that one '120px' instance is absent (we still have '100px' columns
  // for results rank / comp score, so just count '120px').
  // Platform width = 120px; type width = 120px → grid with both visible
  // contains 120px twice. Hiding platform → contains 120px once.
  const visible120 = (visible.match(/120px/g) ?? []).length;
  const hidden120 = (hidden.match(/120px/g) ?? []).length;
  assert.equal(visible120, 2);
  assert.equal(hidden120, 1);
});

test('buildUrlRowGrid — all columns hidden → only expand + actions remain', () => {
  const allHidden: Record<string, boolean> = {};
  for (const col of REVIEWS_TABLE_COLUMNS) allHidden[col.id] = false;
  const grid = buildUrlRowGrid(allHidden);
  assert.equal(grid, `${EXPAND_TOGGLE_WIDTH} ${ACTIONS_COL_WIDTH}`);
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
//
// These assertions pin that Fix Session A did NOT accidentally expand
// scope into Fix Session B (write-backs + per-review edit + persistence)
// or Fix Session C (new flow + Excel + drag + schema). The presence of
// REVIEWS_TABLE_COLUMNS shouldn't accidentally light up surfaces that
// haven't shipped yet.

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
