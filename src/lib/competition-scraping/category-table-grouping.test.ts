// W#2 P-49 W5 Category page Session 1 scaffold (2026-05-30) — node:test
// cases for the pure category-grouping helpers on the "Reviews Analysis By
// Competitor Category Table".

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCategoryGroupedRows,
  normalizeCategoryKey,
  isUncategorizedKey,
  categoryKeyToLabel,
  UNCATEGORIZED_LABEL,
  type CategoryGroupRowInput,
} from './category-table-grouping.ts';

type Row = CategoryGroupRowInput & { name?: string };

const u = (id: string, competitionCategory: string | null | undefined, name?: string): Row => ({
  id,
  competitionCategory,
  name,
});

// ─── normalizeCategoryKey ───────────────────────────────────────────

test('normalizeCategoryKey: real value is trimmed', () => {
  assert.equal(normalizeCategoryKey('  Knives  '), 'Knives');
});

test('normalizeCategoryKey: null / undefined / blank → uncategorized sentinel', () => {
  assert.ok(isUncategorizedKey(normalizeCategoryKey(null)));
  assert.ok(isUncategorizedKey(normalizeCategoryKey(undefined)));
  assert.ok(isUncategorizedKey(normalizeCategoryKey('')));
  assert.ok(isUncategorizedKey(normalizeCategoryKey('   ')));
});

test('normalizeCategoryKey: real value is NOT the uncategorized sentinel', () => {
  assert.ok(!isUncategorizedKey(normalizeCategoryKey('Knives')));
});

// ─── categoryKeyToLabel ─────────────────────────────────────────────

test('categoryKeyToLabel: uncategorized key maps to the human label', () => {
  assert.equal(categoryKeyToLabel(normalizeCategoryKey(null)), UNCATEGORIZED_LABEL);
});

test('categoryKeyToLabel: real key maps to itself', () => {
  assert.equal(categoryKeyToLabel('Knives'), 'Knives');
});

// ─── buildCategoryGroupedRows: basic grouping ───────────────────────

test('buildCategoryGroupedRows: empty input → empty output', () => {
  assert.deepEqual(buildCategoryGroupedRows([]), []);
});

test('buildCategoryGroupedRows: clusters rows by category, first row carries label', () => {
  const rows = buildCategoryGroupedRows([
    u('1', 'Knives'),
    u('2', 'Pans'),
    u('3', 'Knives'),
    u('4', 'Pans'),
  ]);
  // Alphabetical: Knives before Pans. Within group: input order.
  assert.deepEqual(
    rows.map((r) => ({ id: r.url.id, label: r.categoryLabel, first: r.isFirstInGroup })),
    [
      { id: '1', label: 'Knives', first: true },
      { id: '3', label: '', first: false },
      { id: '2', label: 'Pans', first: true },
      { id: '4', label: '', first: false },
    ]
  );
});

test('buildCategoryGroupedRows: no row is dropped — every input appears exactly once', () => {
  const input = [u('1', 'A'), u('2', 'B'), u('3', null), u('4', 'A'), u('5', 'B')];
  const rows = buildCategoryGroupedRows(input);
  assert.equal(rows.length, input.length);
  const ids = rows.map((r) => r.url.id).sort();
  assert.deepEqual(ids, ['1', '2', '3', '4', '5']);
});

test('buildCategoryGroupedRows: groupSize + indexInGroup are stamped correctly', () => {
  const rows = buildCategoryGroupedRows([
    u('1', 'Knives'),
    u('2', 'Knives'),
    u('3', 'Knives'),
  ]);
  assert.deepEqual(
    rows.map((r) => ({ size: r.groupSize, idx: r.indexInGroup })),
    [
      { size: 3, idx: 0 },
      { size: 3, idx: 1 },
      { size: 3, idx: 2 },
    ]
  );
});

// ─── buildCategoryGroupedRows: alphabetical group ordering ──────────

test('buildCategoryGroupedRows: groups sort alphabetically (case-insensitive)', () => {
  const rows = buildCategoryGroupedRows([
    u('1', 'pans'),
    u('2', 'Apples'),
    u('3', 'knives'),
  ]);
  assert.deepEqual(
    rows.filter((r) => r.isFirstInGroup).map((r) => r.categoryLabel),
    ['Apples', 'knives', 'pans']
  );
});

// ─── buildCategoryGroupedRows: uncategorized always last ────────────

test('buildCategoryGroupedRows: (Uncategorized) group always sorts last', () => {
  const rows = buildCategoryGroupedRows([
    u('1', null),
    u('2', 'Zebras'),
    u('3', ''),
    u('4', 'Apples'),
  ]);
  const groupLabels = rows.filter((r) => r.isFirstInGroup).map((r) => r.categoryLabel);
  assert.deepEqual(groupLabels, ['Apples', 'Zebras', UNCATEGORIZED_LABEL]);
  // The two uncategorized rows cluster at the end + carry the isUncategorized flag.
  const uncat = rows.filter((r) => r.isUncategorized).map((r) => r.url.id);
  assert.deepEqual(uncat, ['1', '3']);
});

test('buildCategoryGroupedRows: uncategorized first row carries the label, rest blank', () => {
  const rows = buildCategoryGroupedRows([u('1', null), u('2', undefined)]);
  assert.deepEqual(
    rows.map((r) => r.categoryLabel),
    [UNCATEGORIZED_LABEL, '']
  );
});

// ─── buildCategoryGroupedRows: explicit category ordering (Session 3) ─

test('buildCategoryGroupedRows: explicit categoryOrder overrides alphabetical', () => {
  const rows = buildCategoryGroupedRows(
    [u('1', 'Apples'), u('2', 'Zebras'), u('3', 'Mangos')],
    { categoryOrder: ['Zebras', 'Apples', 'Mangos'] }
  );
  assert.deepEqual(
    rows.map((r) => r.categoryLabel),
    ['Zebras', 'Apples', 'Mangos']
  );
});

test('buildCategoryGroupedRows: categoryOrder cannot drag uncategorized off the bottom', () => {
  const rows = buildCategoryGroupedRows(
    [u('1', 'Apples'), u('2', null)],
    // even if the caller lists the uncategorized sentinel ('') first, it stays last
    { categoryOrder: ['', 'Apples'] }
  );
  assert.deepEqual(
    rows.filter((r) => r.isFirstInGroup).map((r) => r.categoryLabel),
    ['Apples', UNCATEGORIZED_LABEL]
  );
});

test('buildCategoryGroupedRows: keys absent from categoryOrder fall to the alphabetical tail', () => {
  const rows = buildCategoryGroupedRows(
    [u('1', 'Apples'), u('2', 'Zebras'), u('3', 'Mangos')],
    { categoryOrder: ['Zebras'] }
  );
  // Zebras pinned first; Apples + Mangos follow alphabetically.
  assert.deepEqual(
    rows.map((r) => r.categoryLabel),
    ['Zebras', 'Apples', 'Mangos']
  );
});

// ─── buildCategoryGroupedRows: explicit within-group ordering ───────

test('buildCategoryGroupedRows: rowOrderByUrlId reorders rows within a group', () => {
  const rows = buildCategoryGroupedRows(
    [u('1', 'Knives'), u('2', 'Knives'), u('3', 'Knives')],
    { rowOrderByUrlId: ['3', '1', '2'] }
  );
  assert.deepEqual(rows.map((r) => r.url.id), ['3', '1', '2']);
  // The new first row carries the label.
  assert.equal(rows[0].categoryLabel, 'Knives');
  assert.equal(rows[1].categoryLabel, '');
});

test('buildCategoryGroupedRows: rowOrderByUrlId leaves unranked rows in input order after ranked ones', () => {
  const rows = buildCategoryGroupedRows(
    [u('1', 'Knives'), u('2', 'Knives'), u('3', 'Knives'), u('4', 'Knives')],
    { rowOrderByUrlId: ['4', '2'] }
  );
  assert.deepEqual(rows.map((r) => r.url.id), ['4', '2', '1', '3']);
});
