// W#2 P-49 W5 Type page Sessions 4-5 (2026-06-01) — node:test cases for the
// pure type-table column-registry helpers. Mirror of the category test with
// the Type ↔ Category column SWAP (Type at position 1, Category at position 3).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  TYPE_TABLE_COLUMNS,
  TYPE_TABLE_PREF_PREFIX,
  isTypeColumnVisible,
  resolveTypeColumnWidth,
  getTypeColumnDef,
  type TypeTableColumnDef,
} from './type-table-columns.ts';

// ─── registry shape ─────────────────────────────────────────────────

test('TYPE_TABLE_COLUMNS has the 13 spec columns + Source Reviews in verbatim order (Type/Category SWAP)', () => {
  assert.equal(TYPE_TABLE_COLUMNS.length, 14);
  assert.deepEqual(
    TYPE_TABLE_COLUMNS.map((c) => c.id),
    [
      'type',
      'platform',
      'competitionCategory',
      'productName',
      'resultsPageRank',
      'competitionScore',
      'url',
      'stars',
      'reviewsSummary',
      'compBulleted',
      'compNonBulleted',
      'typeBulleted',
      'typeSourceReviews',
      'typeNonBulleted',
    ]
  );
});

test('Type is the leftmost column (the grouping column); Category is at position 3', () => {
  assert.equal(TYPE_TABLE_COLUMNS[0].id, 'type');
  assert.equal(TYPE_TABLE_COLUMNS[0].label, 'Type');
  assert.equal(TYPE_TABLE_COLUMNS[2].id, 'competitionCategory');
  assert.equal(TYPE_TABLE_COLUMNS[2].label, 'Category');
});

test('Stars + Reviews Summary + Source Reviews are read-only; spec editable columns are editable', () => {
  const editableIds = TYPE_TABLE_COLUMNS.filter((c) => c.editable).map((c) => c.id);
  assert.deepEqual(editableIds, [
    'type',
    'platform',
    'competitionCategory',
    'productName',
    'resultsPageRank',
    'competitionScore',
    'url',
    'compBulleted',
    'compNonBulleted',
    'typeBulleted',
    'typeNonBulleted',
  ]);
  assert.equal(getTypeColumnDef('stars')?.editable, false);
  assert.equal(getTypeColumnDef('reviewsSummary')?.editable, false);
  assert.equal(getTypeColumnDef('typeSourceReviews')?.editable, false);
});

test('the three Type-level columns carry the typeLevel flag', () => {
  const typeLevel = TYPE_TABLE_COLUMNS.filter((c) => c.typeLevel).map((c) => c.id);
  assert.deepEqual(typeLevel, ['typeBulleted', 'typeSourceReviews', 'typeNonBulleted']);
});

test('pref prefix is distinct from the sibling categoryTable + reviewsTable prefixes', () => {
  assert.equal(TYPE_TABLE_PREF_PREFIX, 'typeTable:');
  assert.notEqual(TYPE_TABLE_PREF_PREFIX, 'categoryTable:');
  assert.notEqual(TYPE_TABLE_PREF_PREFIX, 'reviewsTable:');
});

// ─── isTypeColumnVisible ────────────────────────────────────────────

test('isTypeColumnVisible: missing key defaults to visible', () => {
  assert.equal(isTypeColumnVisible({}, 'platform'), true);
});

test('isTypeColumnVisible: explicit false hides the column', () => {
  assert.equal(isTypeColumnVisible({ platform: false }, 'platform'), false);
});

test('isTypeColumnVisible: explicit true shows the column', () => {
  assert.equal(isTypeColumnVisible({ platform: true }, 'platform'), true);
});

// ─── resolveTypeColumnWidth ─────────────────────────────────────────

const col = (id: string, defaultWidth: number): TypeTableColumnDef => ({
  id,
  label: id,
  defaultWidth,
  editable: true,
});

test('resolveTypeColumnWidth: override wins when positive', () => {
  assert.equal(resolveTypeColumnWidth({ url: 320 }, col('url', 260)), 320);
});

test('resolveTypeColumnWidth: falls back to defaultWidth when no/zero/negative override', () => {
  assert.equal(resolveTypeColumnWidth({}, col('url', 260)), 260);
  assert.equal(resolveTypeColumnWidth({ url: 0 }, col('url', 260)), 260);
  assert.equal(resolveTypeColumnWidth({ url: -5 }, col('url', 260)), 260);
});

// ─── getTypeColumnDef ───────────────────────────────────────────────

test('getTypeColumnDef: returns the def for a known id', () => {
  assert.equal(getTypeColumnDef('url')?.label, 'URL');
});

test('getTypeColumnDef: returns undefined for an unknown id', () => {
  assert.equal(getTypeColumnDef('nope'), undefined);
});
