// W#2 P-49 W5 Category page Session 1 scaffold (2026-05-30) — node:test
// cases for the pure category-table column-registry helpers.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORY_TABLE_COLUMNS,
  CATEGORY_TABLE_PREF_PREFIX,
  isCategoryColumnVisible,
  resolveCategoryColumnWidth,
  getCategoryColumnDef,
  type CategoryTableColumnDef,
} from './category-table-columns.ts';

// ─── registry shape ─────────────────────────────────────────────────

test('CATEGORY_TABLE_COLUMNS has the 13 spec columns in verbatim order', () => {
  assert.equal(CATEGORY_TABLE_COLUMNS.length, 13);
  assert.deepEqual(
    CATEGORY_TABLE_COLUMNS.map((c) => c.id),
    [
      'competitionCategory',
      'platform',
      'type',
      'productName',
      'resultsPageRank',
      'competitionScore',
      'url',
      'stars',
      'reviewsSummary',
      'compBulleted',
      'compNonBulleted',
      'catBulleted',
      'catNonBulleted',
    ]
  );
});

test('Category is the leftmost column (the grouping column)', () => {
  assert.equal(CATEGORY_TABLE_COLUMNS[0].id, 'competitionCategory');
  assert.equal(CATEGORY_TABLE_COLUMNS[0].label, 'Category');
});

test('Stars + Reviews Summary are read-only; spec editable columns are editable', () => {
  const editableIds = CATEGORY_TABLE_COLUMNS.filter((c) => c.editable).map((c) => c.id);
  // Spec §3 editable set: 1,2,3,4,5,6,7,10,11,12,13 (Stars=8 + Reviews Summary=9 read-only).
  assert.deepEqual(editableIds, [
    'competitionCategory',
    'platform',
    'type',
    'productName',
    'resultsPageRank',
    'competitionScore',
    'url',
    'compBulleted',
    'compNonBulleted',
    'catBulleted',
    'catNonBulleted',
  ]);
  assert.equal(getCategoryColumnDef('stars')?.editable, false);
  assert.equal(getCategoryColumnDef('reviewsSummary')?.editable, false);
});

test('only the two Category-level columns carry the categoryLevel flag', () => {
  const catLevel = CATEGORY_TABLE_COLUMNS.filter((c) => c.categoryLevel).map((c) => c.id);
  assert.deepEqual(catLevel, ['catBulleted', 'catNonBulleted']);
});

test('pref prefix is distinct from the sibling reviewsTable prefix', () => {
  assert.equal(CATEGORY_TABLE_PREF_PREFIX, 'categoryTable:');
  assert.notEqual(CATEGORY_TABLE_PREF_PREFIX, 'reviewsTable:');
});

// ─── isCategoryColumnVisible ────────────────────────────────────────

test('isCategoryColumnVisible: missing key defaults to visible', () => {
  assert.equal(isCategoryColumnVisible({}, 'platform'), true);
});

test('isCategoryColumnVisible: explicit false hides the column', () => {
  assert.equal(isCategoryColumnVisible({ platform: false }, 'platform'), false);
});

test('isCategoryColumnVisible: explicit true shows the column', () => {
  assert.equal(isCategoryColumnVisible({ platform: true }, 'platform'), true);
});

// ─── resolveCategoryColumnWidth ─────────────────────────────────────

const col = (id: string, defaultWidth: number): CategoryTableColumnDef => ({
  id,
  label: id,
  defaultWidth,
  editable: true,
});

test('resolveCategoryColumnWidth: override wins when positive', () => {
  assert.equal(resolveCategoryColumnWidth({ url: 320 }, col('url', 260)), 320);
});

test('resolveCategoryColumnWidth: falls back to defaultWidth when no/zero/negative override', () => {
  assert.equal(resolveCategoryColumnWidth({}, col('url', 260)), 260);
  assert.equal(resolveCategoryColumnWidth({ url: 0 }, col('url', 260)), 260);
  assert.equal(resolveCategoryColumnWidth({ url: -5 }, col('url', 260)), 260);
});

// ─── getCategoryColumnDef ───────────────────────────────────────────

test('getCategoryColumnDef: returns the def for a known id', () => {
  assert.equal(getCategoryColumnDef('url')?.label, 'URL');
});

test('getCategoryColumnDef: returns undefined for an unknown id', () => {
  assert.equal(getCategoryColumnDef('nope'), undefined);
});
