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
  ACTIONS_COL_KEY,
  MIN_REVIEWS_COLUMN_WIDTH,
  MAX_REVIEWS_COLUMN_WIDTH,
  isReviewsColumnVisible,
  resolveActionsColumnWidth,
  resolveReviewsColumnWidth,
  computeReviewsSummaryCount,
  computeReviewsSummaryCellAffordance,
  computeBannerCellAffordance,
  mergeTitleAndBody,
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

// ─── resolveActionsColumnWidth (FF2 — last-column resize) ───────────

test('resolveActionsColumnWidth — empty override map → returns ACTIONS_COL_WIDTH default', () => {
  assert.equal(resolveActionsColumnWidth({}), ACTIONS_COL_WIDTH);
});

test('resolveActionsColumnWidth — positive override under __actions__ key → returns override', () => {
  assert.equal(resolveActionsColumnWidth({ [ACTIONS_COL_KEY]: 200 }), 200);
});

test('resolveActionsColumnWidth — zero/negative override → falls back to default', () => {
  assert.equal(resolveActionsColumnWidth({ [ACTIONS_COL_KEY]: 0 }), ACTIONS_COL_WIDTH);
  assert.equal(resolveActionsColumnWidth({ [ACTIONS_COL_KEY]: -50 }), ACTIONS_COL_WIDTH);
});

test('resolveActionsColumnWidth — unrelated keys do not affect the lookup', () => {
  // Only __actions__ key controls the Actions column width. Sibling
  // column keys (e.g., the URLs page's 'platform') should NOT leak in.
  assert.equal(
    resolveActionsColumnWidth({ platform: 999, productName: 999 }),
    ACTIONS_COL_WIDTH
  );
});

test('ACTIONS_COL_KEY — uses double-underscore namespace to avoid collision with the 10 column ids', () => {
  // The key shouldn't match any spec column id (would cause persistence
  // logic to read the wrong width when both are present).
  const specIds = REVIEWS_TABLE_COLUMNS.map((c) => c.id);
  assert.equal(specIds.includes(ACTIONS_COL_KEY), false);
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

// ─── computeReviewsSummaryCellAffordance (FF4 click-state cycling) ──

test('computeReviewsSummaryCellAffordance — null total → "click to load" + clickable', () => {
  const result = computeReviewsSummaryCellAffordance(null, null, false);
  assert.equal(result.kind, 'not-loaded');
  assert.match(result.text, /click to load/);
  assert.equal(result.clickable, true);
});

test('computeReviewsSummaryCellAffordance — 0 reviews → "no reviews" + non-clickable', () => {
  const result = computeReviewsSummaryCellAffordance(0, 0, false);
  assert.equal(result.kind, 'no-reviews');
  assert.equal(result.text, 'no reviews');
  assert.equal(result.clickable, false);
});

test('computeReviewsSummaryCellAffordance — populated + collapsed → "click to expand"', () => {
  const result = computeReviewsSummaryCellAffordance(3, 12, false);
  assert.equal(result.kind, 'collapsed');
  assert.match(result.text, /3 of 12 summarized/);
  assert.match(result.text, /click to expand/);
  assert.equal(result.clickable, true);
});

test('computeReviewsSummaryCellAffordance — populated + expanded → "click to collapse"', () => {
  const result = computeReviewsSummaryCellAffordance(3, 12, true);
  assert.equal(result.kind, 'expanded');
  assert.match(result.text, /3 of 12 summarized/);
  assert.match(result.text, /click to collapse/);
  assert.equal(result.clickable, true);
});

test('computeReviewsSummaryCellAffordance — null summarized falls back to 0 in display', () => {
  const result = computeReviewsSummaryCellAffordance(null, 5, false);
  assert.match(result.text, /^0 of 5/);
});

// ─── computeBannerCellAffordance (FF4 click-state cycling) ───────────

test('computeBannerCellAffordance — no summary → em-dash + non-clickable', () => {
  const result = computeBannerCellAffordance(false, false);
  assert.equal(result.kind, 'no-summary');
  assert.equal(result.text, '—');
  assert.equal(result.clickable, false);
});

test('computeBannerCellAffordance — summary exists + collapsed → "click to expand"', () => {
  const result = computeBannerCellAffordance(true, false);
  assert.equal(result.kind, 'collapsed');
  assert.match(result.text, /click to expand/);
  assert.equal(result.clickable, true);
});

test('computeBannerCellAffordance — summary exists + expanded → "click to collapse"', () => {
  const result = computeBannerCellAffordance(true, true);
  assert.equal(result.kind, 'expanded');
  assert.match(result.text, /click to collapse/);
  assert.equal(result.clickable, true);
});

test('computeBannerCellAffordance — expanded state ignored when no summary exists', () => {
  // Edge case: if somehow `expanded` is true but `hasSummary` is false,
  // the no-summary branch wins. Defensive — caller shouldn't reach this
  // state but the helper is conservative.
  const result = computeBannerCellAffordance(false, true);
  assert.equal(result.kind, 'no-summary');
  assert.equal(result.clickable, false);
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

// ─── mergeTitleAndBody (P-49 W5 Fix Session B, 2026-05-30; Q3 → A) ──────

test('mergeTitleAndBody — title + body, period inserted when title lacks one', () => {
  assert.equal(
    mergeTitleAndBody('Great product', 'Held up for years.'),
    'Great product. Held up for years.'
  );
});

test('mergeTitleAndBody — title already ends with punctuation → no double period', () => {
  assert.equal(
    mergeTitleAndBody('Broke fast!', 'Returned it.'),
    'Broke fast! Returned it.'
  );
  assert.equal(
    mergeTitleAndBody('Why?', 'No idea.'),
    'Why? No idea.'
  );
  assert.equal(
    mergeTitleAndBody('Done.', 'Final.'),
    'Done. Final.'
  );
});

test('mergeTitleAndBody — null/empty title → body alone (legacy + body-only reviews)', () => {
  assert.equal(mergeTitleAndBody(null, 'Just a body.'), 'Just a body.');
  assert.equal(mergeTitleAndBody(undefined, 'Just a body.'), 'Just a body.');
  assert.equal(mergeTitleAndBody('   ', 'Just a body.'), 'Just a body.');
});

test('mergeTitleAndBody — empty body → title alone (defensive)', () => {
  assert.equal(mergeTitleAndBody('Only title', ''), 'Only title');
  assert.equal(mergeTitleAndBody('Only title', null), 'Only title');
});

test('mergeTitleAndBody — both empty → empty string', () => {
  assert.equal(mergeTitleAndBody(null, null), '');
  assert.equal(mergeTitleAndBody('', ''), '');
});

test('mergeTitleAndBody — trims surrounding whitespace on both parts', () => {
  assert.equal(
    mergeTitleAndBody('  Title  ', '  Body.  '),
    'Title. Body.'
  );
});
