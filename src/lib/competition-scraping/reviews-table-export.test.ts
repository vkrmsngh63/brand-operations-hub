// W#2 P-49 W5 Fix Session C (2026-05-29) — node:test cases for the
// Reviews Analysis Table Excel-export pure helpers (D-7).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  reviewsExportCellValue,
  buildReviewsExportMatrix,
  buildReviewsExportFilename,
  slugifyForFilename,
  WRAPPED_EXPORT_COLUMN_IDS,
  type ReviewsExportRowInput,
} from './reviews-table-export.ts';
import {
  REVIEWS_TABLE_COLUMNS,
  type ReviewsTableColumnDef,
} from './reviews-analysis-table-columns.ts';

function makeRow(overrides: Partial<ReviewsExportRowInput> = {}): ReviewsExportRowInput {
  return {
    platform: 'amazon',
    competitionCategory: 'Supplements',
    type: 'Capsule',
    productName: 'Acme Widget Pro',
    resultsPageRank: 3,
    competitionScore: 87,
    url: 'https://example.com/p/1',
    reviewsSummaryText: '4 of 10 summarized',
    compBulleted: '## Product critiques\n- Strap breaks',
    compNonBulleted: 'The strap breaks within months.',
    ...overrides,
  };
}

test('reviewsExportCellValue resolves each known column to its string', () => {
  const row = makeRow();
  assert.equal(reviewsExportCellValue('platform', row), 'amazon');
  assert.equal(reviewsExportCellValue('competitionCategory', row), 'Supplements');
  assert.equal(reviewsExportCellValue('type', row), 'Capsule');
  assert.equal(reviewsExportCellValue('productName', row), 'Acme Widget Pro');
  assert.equal(reviewsExportCellValue('resultsPageRank', row), '3');
  assert.equal(reviewsExportCellValue('competitionScore', row), '87');
  assert.equal(reviewsExportCellValue('url', row), 'https://example.com/p/1');
  assert.equal(reviewsExportCellValue('reviewsSummaryCount', row), '4 of 10 summarized');
  assert.equal(reviewsExportCellValue('compBulleted', row), '## Product critiques\n- Strap breaks');
  assert.equal(reviewsExportCellValue('compNonBulleted', row), 'The strap breaks within months.');
});

test('reviewsExportCellValue renders null numbers as empty strings', () => {
  const row = makeRow({ resultsPageRank: null, competitionScore: null });
  assert.equal(reviewsExportCellValue('resultsPageRank', row), '');
  assert.equal(reviewsExportCellValue('competitionScore', row), '');
});

test('reviewsExportCellValue returns "" for unknown column ids (resilient)', () => {
  assert.equal(reviewsExportCellValue('totallyUnknown', makeRow()), '');
});

test('buildReviewsExportMatrix emits header + one row per input, only visible columns in order', () => {
  // Simulate hiding everything except platform + the two AI columns.
  const visible: ReviewsTableColumnDef[] = REVIEWS_TABLE_COLUMNS.filter((c) =>
    ['platform', 'compBulleted', 'compNonBulleted'].includes(c.id)
  );
  const rows = [makeRow(), makeRow({ platform: 'walmart', productName: 'Other' })];
  const matrix = buildReviewsExportMatrix(visible, rows);

  // header row uses the column labels in registry order
  assert.deepEqual(matrix[0], [
    'Platform',
    'Comprehensive (bulleted)',
    'Comprehensive (non-bulleted)',
  ]);
  assert.equal(matrix.length, 3); // header + 2 rows
  assert.equal(matrix[1][0], 'amazon');
  assert.equal(matrix[2][0], 'walmart');
  // every data row has exactly one cell per visible column
  assert.equal(matrix[1].length, 3);
});

test('buildReviewsExportMatrix preserves the on-screen left-to-right column order', () => {
  const visible = [...REVIEWS_TABLE_COLUMNS];
  const matrix = buildReviewsExportMatrix(visible, [makeRow()]);
  assert.deepEqual(
    matrix[0],
    REVIEWS_TABLE_COLUMNS.map((c) => c.label)
  );
});

test('buildReviewsExportMatrix with no rows yields header only', () => {
  const visible = [...REVIEWS_TABLE_COLUMNS];
  const matrix = buildReviewsExportMatrix(visible, []);
  assert.equal(matrix.length, 1);
});

test('WRAPPED_EXPORT_COLUMN_IDS covers the long AI/summary columns', () => {
  assert.ok(WRAPPED_EXPORT_COLUMN_IDS.has('compBulleted'));
  assert.ok(WRAPPED_EXPORT_COLUMN_IDS.has('compNonBulleted'));
  assert.ok(WRAPPED_EXPORT_COLUMN_IDS.has('reviewsSummaryCount'));
  assert.ok(!WRAPPED_EXPORT_COLUMN_IDS.has('platform'));
});

test('slugifyForFilename lowercases + hyphenates + trims', () => {
  assert.equal(slugifyForFilename('My Cool Project!!'), 'my-cool-project');
  assert.equal(slugifyForFilename('  Spaces  Here  '), 'spaces-here');
  assert.equal(slugifyForFilename('already-slug'), 'already-slug');
});

test('slugifyForFilename falls back to "project" for empty/garbage input', () => {
  assert.equal(slugifyForFilename(''), 'project');
  assert.equal(slugifyForFilename('   '), 'project');
  assert.equal(slugifyForFilename('!!!'), 'project');
});

test('buildReviewsExportFilename composes the canonical name (Q7 → A)', () => {
  assert.equal(
    buildReviewsExportFilename('My Project', '2026-05-29'),
    'competitor-reviews-analysis-my-project-2026-05-29.xlsx'
  );
});
