// W#2 P-54 Phase 4 (2026-06-01) — node:test cases for the pure main-table
// "Sort By" grouping helper (group-by-platform/category/type re-bucketing,
// banner ordering, empty-bucket-last, label resolution, groupOrder coercion).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  GROUP_BY_MODES,
  isGroupByMode,
  groupKeyOf,
  groupLabelOf,
  isEmptyBucketKey,
  buildMainGroupedRows,
  reorderableGroupKeys,
  coerceGroupOrderMap,
  UNCATEGORIZED_LABEL,
  UNTYPED_LABEL,
  type MainGroupRowInput,
} from './main-table-grouping.ts';

// Tiny row factory — only the four fields the grouping reads.
function row(
  id: string,
  platform: string,
  competitionCategory: string | null | undefined,
  type: string | null | undefined
): MainGroupRowInput {
  return { id, platform, competitionCategory, type };
}

const PLATFORM_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  ebay: 'eBay',
  etsy: 'Etsy',
};

// ─── isGroupByMode / GROUP_BY_MODES ────────────────────────────────────

test('GROUP_BY_MODES lists none + the three groupings', () => {
  assert.deepEqual([...GROUP_BY_MODES], ['none', 'platform', 'category', 'type']);
});

test('isGroupByMode: accepts the four valid modes', () => {
  for (const m of ['none', 'platform', 'category', 'type']) {
    assert.equal(isGroupByMode(m), true);
  }
});

test('isGroupByMode: rejects anything else', () => {
  assert.equal(isGroupByMode('Platform'), false);
  assert.equal(isGroupByMode(''), false);
  assert.equal(isGroupByMode(null), false);
  assert.equal(isGroupByMode(undefined), false);
  assert.equal(isGroupByMode(42), false);
});

// ─── groupKeyOf ────────────────────────────────────────────────────────

test('groupKeyOf: reads the field matching the mode', () => {
  const r = row('1', 'amazon', 'Knives', 'Folding');
  assert.equal(groupKeyOf(r, 'platform'), 'amazon');
  assert.equal(groupKeyOf(r, 'category'), 'Knives');
  assert.equal(groupKeyOf(r, 'type'), 'Folding');
});

test('groupKeyOf: trims whitespace', () => {
  assert.equal(groupKeyOf(row('1', 'amazon', '  Knives  ', null), 'category'), 'Knives');
});

test('groupKeyOf: null / undefined / blank category|type → empty bucket key', () => {
  assert.equal(groupKeyOf(row('1', 'amazon', null, undefined), 'category'), '');
  assert.equal(groupKeyOf(row('2', 'amazon', '   ', ''), 'category'), '');
  assert.equal(groupKeyOf(row('3', 'amazon', 'X', null), 'type'), '');
  assert.equal(isEmptyBucketKey(groupKeyOf(row('4', 'amazon', '', ''), 'type')), true);
});

// ─── groupLabelOf ──────────────────────────────────────────────────────

test('groupLabelOf: platform key maps through the friendly-label map', () => {
  assert.equal(groupLabelOf('amazon', 'platform', PLATFORM_LABELS), 'Amazon');
  assert.equal(groupLabelOf('ebay', 'platform', PLATFORM_LABELS), 'eBay');
});

test('groupLabelOf: unknown platform falls back to the raw value', () => {
  assert.equal(groupLabelOf('mystery', 'platform', PLATFORM_LABELS), 'mystery');
  assert.equal(groupLabelOf('amazon', 'platform'), 'amazon'); // no map supplied
});

test('groupLabelOf: category / type keys are themselves', () => {
  assert.equal(groupLabelOf('Knives', 'category'), 'Knives');
  assert.equal(groupLabelOf('Folding', 'type'), 'Folding');
});

test('groupLabelOf: empty bucket reads (Untyped) for type, (Uncategorized) otherwise', () => {
  assert.equal(groupLabelOf('', 'type'), UNTYPED_LABEL);
  assert.equal(groupLabelOf('', 'category'), UNCATEGORIZED_LABEL);
  assert.equal(groupLabelOf('', 'platform'), UNCATEGORIZED_LABEL);
});

// ─── buildMainGroupedRows: bucketing + completeness ────────────────────

test('build: groups by platform; every row appears exactly once', () => {
  const rows = [
    row('a', 'amazon', 'K', 'F'),
    row('b', 'ebay', 'K', 'F'),
    row('c', 'amazon', 'K', 'F'),
  ];
  const groups = buildMainGroupedRows(rows, 'platform', {
    platformLabels: PLATFORM_LABELS,
  });
  // amazon + ebay, alphabetical by key (amazon < ebay).
  assert.deepEqual(groups.map((g) => g.key), ['amazon', 'ebay']);
  assert.deepEqual(groups.map((g) => g.label), ['Amazon', 'eBay']);
  assert.deepEqual(groups[0].rows.map((r) => r.id), ['a', 'c']);
  assert.deepEqual(groups[1].rows.map((r) => r.id), ['b']);
  const total = groups.reduce((n, g) => n + g.rows.length, 0);
  assert.equal(total, 3);
});

test('build: within-group order PRESERVES input (already-sorted) order', () => {
  // Input order c, a within the same category — must be kept (no re-sort).
  const rows = [
    row('c', 'amazon', 'K', null),
    row('a', 'ebay', 'K', null),
  ];
  const groups = buildMainGroupedRows(rows, 'category');
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].rows.map((r) => r.id), ['c', 'a']);
});

test('build: empty (uncategorized) bucket is forced LAST', () => {
  const rows = [
    row('a', 'amazon', null, null),
    row('b', 'amazon', 'Zebra', null),
    row('c', 'amazon', 'Apple', null),
  ];
  const groups = buildMainGroupedRows(rows, 'category');
  assert.deepEqual(groups.map((g) => g.key), ['Apple', 'Zebra', '']);
  assert.equal(groups[groups.length - 1].isEmptyBucket, true);
  assert.equal(groups[groups.length - 1].label, UNCATEGORIZED_LABEL);
});

test('build: type mode empty bucket reads (Untyped) and sorts last', () => {
  const rows = [
    row('a', 'amazon', null, ''),
    row('b', 'amazon', null, 'Folding'),
  ];
  const groups = buildMainGroupedRows(rows, 'type');
  assert.deepEqual(groups.map((g) => g.key), ['Folding', '']);
  assert.equal(groups[1].label, UNTYPED_LABEL);
});

// ─── buildMainGroupedRows: groupOrder (banner drag persistence) ────────

test('build: explicit groupOrder positions listed groups first, rest alpha tail', () => {
  const rows = [
    row('a', 'amazon', 'Apple', null),
    row('b', 'amazon', 'Mango', null),
    row('c', 'amazon', 'Zebra', null),
  ];
  // Saved order puts Zebra, then Mango first; Apple unlisted → alpha tail.
  const groups = buildMainGroupedRows(rows, 'category', {
    groupOrder: ['Zebra', 'Mango'],
  });
  assert.deepEqual(groups.map((g) => g.key), ['Zebra', 'Mango', 'Apple']);
});

test('build: groupOrder can never float the empty bucket off last', () => {
  const rows = [
    row('a', 'amazon', null, null),
    row('b', 'amazon', 'X', null),
  ];
  // Even a malicious groupOrder listing '' first cannot move the bucket.
  const groups = buildMainGroupedRows(rows, 'category', { groupOrder: ['', 'X'] });
  assert.deepEqual(groups.map((g) => g.key), ['X', '']);
});

test('build: empty input → no groups', () => {
  assert.deepEqual(buildMainGroupedRows([], 'platform'), []);
});

// ─── reorderableGroupKeys ──────────────────────────────────────────────

test('reorderableGroupKeys: excludes the empty bucket', () => {
  const rows = [
    row('a', 'amazon', 'X', null),
    row('b', 'amazon', null, null),
  ];
  const groups = buildMainGroupedRows(rows, 'category');
  assert.deepEqual(reorderableGroupKeys(groups), ['X']);
});

// ─── coerceGroupOrderMap ───────────────────────────────────────────────

test('coerce: non-object → empty map', () => {
  assert.deepEqual(coerceGroupOrderMap(null), {});
  assert.deepEqual(coerceGroupOrderMap('nope'), {});
  assert.deepEqual(coerceGroupOrderMap([1, 2]), {});
});

test('coerce: keeps the three known modes, drops unknown keys + non-arrays', () => {
  const out = coerceGroupOrderMap({
    platform: ['amazon', 'ebay'],
    category: ['K'],
    type: 'oops', // non-array → dropped
    bogus: ['x'], // unknown mode → dropped
  });
  assert.deepEqual(out, { platform: ['amazon', 'ebay'], category: ['K'] });
});

test('coerce: de-dupes + drops non-strings within a mode list', () => {
  const out = coerceGroupOrderMap({ platform: ['amazon', 'amazon', 5, 'ebay'] });
  assert.deepEqual(out, { platform: ['amazon', 'ebay'] });
});
