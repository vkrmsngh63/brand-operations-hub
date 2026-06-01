// W#2 P-49 W5 Type page Sessions 4-5 (2026-06-01) — node:test
// cases for the pure type-grouping helpers on the "Reviews Analysis By
// Competitor Category Table".

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildTypeGroupedRows,
  buildTypeGroups,
  foldIntoTypeGroups,
  normalizeTypeKey,
  isUntypedKey,
  typeKeyToLabel,
  UNTYPED_LABEL,
  type TypeGroupRowInput,
} from './type-table-grouping.ts';

type Row = TypeGroupRowInput & { name?: string };

const u = (id: string, type: string | null | undefined, name?: string): Row => ({
  id,
  type,
  name,
});

// ─── normalizeTypeKey ───────────────────────────────────────────

test('normalizeTypeKey: real value is trimmed', () => {
  assert.equal(normalizeTypeKey('  Knives  '), 'Knives');
});

test('normalizeTypeKey: null / undefined / blank → untyped sentinel', () => {
  assert.ok(isUntypedKey(normalizeTypeKey(null)));
  assert.ok(isUntypedKey(normalizeTypeKey(undefined)));
  assert.ok(isUntypedKey(normalizeTypeKey('')));
  assert.ok(isUntypedKey(normalizeTypeKey('   ')));
});

test('normalizeTypeKey: real value is NOT the untyped sentinel', () => {
  assert.ok(!isUntypedKey(normalizeTypeKey('Knives')));
});

// ─── typeKeyToLabel ─────────────────────────────────────────────

test('typeKeyToLabel: untyped key maps to the human label', () => {
  assert.equal(typeKeyToLabel(normalizeTypeKey(null)), UNTYPED_LABEL);
});

test('typeKeyToLabel: real key maps to itself', () => {
  assert.equal(typeKeyToLabel('Knives'), 'Knives');
});

// ─── buildTypeGroupedRows: basic grouping ───────────────────────

test('buildTypeGroupedRows: empty input → empty output', () => {
  assert.deepEqual(buildTypeGroupedRows([]), []);
});

test('buildTypeGroupedRows: clusters rows by type, first row carries label', () => {
  const rows = buildTypeGroupedRows([
    u('1', 'Knives'),
    u('2', 'Pans'),
    u('3', 'Knives'),
    u('4', 'Pans'),
  ]);
  // Alphabetical: Knives before Pans. Within group: input order.
  assert.deepEqual(
    rows.map((r) => ({ id: r.url.id, label: r.typeLabel, first: r.isFirstInGroup })),
    [
      { id: '1', label: 'Knives', first: true },
      { id: '3', label: '', first: false },
      { id: '2', label: 'Pans', first: true },
      { id: '4', label: '', first: false },
    ]
  );
});

test('buildTypeGroupedRows: no row is dropped — every input appears exactly once', () => {
  const input = [u('1', 'A'), u('2', 'B'), u('3', null), u('4', 'A'), u('5', 'B')];
  const rows = buildTypeGroupedRows(input);
  assert.equal(rows.length, input.length);
  const ids = rows.map((r) => r.url.id).sort();
  assert.deepEqual(ids, ['1', '2', '3', '4', '5']);
});

test('buildTypeGroupedRows: groupSize + indexInGroup are stamped correctly', () => {
  const rows = buildTypeGroupedRows([
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

// ─── buildTypeGroupedRows: alphabetical group ordering ──────────

test('buildTypeGroupedRows: groups sort alphabetically (case-insensitive)', () => {
  const rows = buildTypeGroupedRows([
    u('1', 'pans'),
    u('2', 'Apples'),
    u('3', 'knives'),
  ]);
  assert.deepEqual(
    rows.filter((r) => r.isFirstInGroup).map((r) => r.typeLabel),
    ['Apples', 'knives', 'pans']
  );
});

// ─── buildTypeGroupedRows: untyped always last ────────────

test('buildTypeGroupedRows: (Untyped) group always sorts last', () => {
  const rows = buildTypeGroupedRows([
    u('1', null),
    u('2', 'Zebras'),
    u('3', ''),
    u('4', 'Apples'),
  ]);
  const groupLabels = rows.filter((r) => r.isFirstInGroup).map((r) => r.typeLabel);
  assert.deepEqual(groupLabels, ['Apples', 'Zebras', UNTYPED_LABEL]);
  // The two untyped rows cluster at the end + carry the isUntyped flag.
  const uncat = rows.filter((r) => r.isUntyped).map((r) => r.url.id);
  assert.deepEqual(uncat, ['1', '3']);
});

test('buildTypeGroupedRows: untyped first row carries the label, rest blank', () => {
  const rows = buildTypeGroupedRows([u('1', null), u('2', undefined)]);
  assert.deepEqual(
    rows.map((r) => r.typeLabel),
    [UNTYPED_LABEL, '']
  );
});

// ─── buildTypeGroupedRows: explicit type ordering (Session 3) ─

test('buildTypeGroupedRows: explicit typeOrder overrides alphabetical', () => {
  const rows = buildTypeGroupedRows(
    [u('1', 'Apples'), u('2', 'Zebras'), u('3', 'Mangos')],
    { typeOrder: ['Zebras', 'Apples', 'Mangos'] }
  );
  assert.deepEqual(
    rows.map((r) => r.typeLabel),
    ['Zebras', 'Apples', 'Mangos']
  );
});

test('buildTypeGroupedRows: typeOrder cannot drag untyped off the bottom', () => {
  const rows = buildTypeGroupedRows(
    [u('1', 'Apples'), u('2', null)],
    // even if the caller lists the untyped sentinel ('') first, it stays last
    { typeOrder: ['', 'Apples'] }
  );
  assert.deepEqual(
    rows.filter((r) => r.isFirstInGroup).map((r) => r.typeLabel),
    ['Apples', UNTYPED_LABEL]
  );
});

test('buildTypeGroupedRows: keys absent from typeOrder fall to the alphabetical tail', () => {
  const rows = buildTypeGroupedRows(
    [u('1', 'Apples'), u('2', 'Zebras'), u('3', 'Mangos')],
    { typeOrder: ['Zebras'] }
  );
  // Zebras pinned first; Apples + Mangos follow alphabetically.
  assert.deepEqual(
    rows.map((r) => r.typeLabel),
    ['Zebras', 'Apples', 'Mangos']
  );
});

// ─── buildTypeGroupedRows: explicit within-group ordering ───────

test('buildTypeGroupedRows: rowOrderByUrlId reorders rows within a group', () => {
  const rows = buildTypeGroupedRows(
    [u('1', 'Knives'), u('2', 'Knives'), u('3', 'Knives')],
    { rowOrderByUrlId: ['3', '1', '2'] }
  );
  assert.deepEqual(rows.map((r) => r.url.id), ['3', '1', '2']);
  // The new first row carries the label.
  assert.equal(rows[0].typeLabel, 'Knives');
  assert.equal(rows[1].typeLabel, '');
});

test('buildTypeGroupedRows: rowOrderByUrlId leaves unranked rows in input order after ranked ones', () => {
  const rows = buildTypeGroupedRows(
    [u('1', 'Knives'), u('2', 'Knives'), u('3', 'Knives'), u('4', 'Knives')],
    { rowOrderByUrlId: ['4', '2'] }
  );
  assert.deepEqual(rows.map((r) => r.url.id), ['4', '2', '1', '3']);
});

// ─── foldIntoTypeGroups / buildTypeGroups (interactive batch) ──

test('foldIntoTypeGroups: groups consecutive same-type rows into blocks', () => {
  const flat = buildTypeGroupedRows([
    u('1', 'Knives'),
    u('2', 'Forks'),
    u('3', 'Knives'),
    u('4', null),
  ]);
  const groups = foldIntoTypeGroups(flat);
  // Alpha order: Forks, Knives, then (Untyped) last.
  assert.deepEqual(groups.map((g) => g.label), ['Forks', 'Knives', UNTYPED_LABEL]);
  assert.deepEqual(groups.map((g) => g.rows.length), [1, 2, 1]);
  assert.equal(groups[2].isUntyped, true);
});

test('buildTypeGroups: applies typeOrder + rowOrderByUrlId then folds', () => {
  const groups = buildTypeGroups(
    [u('1', 'Knives'), u('2', 'Forks'), u('3', 'Knives')],
    { typeOrder: ['Knives', 'Forks'], rowOrderByUrlId: ['3', '1'] }
  );
  assert.deepEqual(groups.map((g) => g.key), ['Knives', 'Forks']);
  // Knives block respects rowOrderByUrlId (3 before 1).
  assert.deepEqual(groups[0].rows.map((r) => r.url.id), ['3', '1']);
});

test('buildTypeGroups: untyped block is always forced last', () => {
  const groups = buildTypeGroups(
    [u('1', null), u('2', 'Knives')],
    { typeOrder: ['', 'Knives'] } // even if memory lists untyped first
  );
  assert.deepEqual(groups.map((g) => g.label), ['Knives', UNTYPED_LABEL]);
});

test('foldIntoTypeGroups: empty input → empty list', () => {
  assert.deepEqual(foldIntoTypeGroups([]), []);
});
