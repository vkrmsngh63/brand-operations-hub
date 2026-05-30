// W#2 P-49 W5 Category page "interactive batch" (2026-05-30) — node:test
// cases for the pure category-table layout-memory helpers (parse / validate /
// two-level drag re-rank / hide-with-restore).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY_CATEGORY_TABLE_LAYOUT,
  coerceCategoryTableLayout,
  readCategoryTableLayout,
  validateCategoryTableLayout,
  applyCategoryDrag,
  applyCompetitorDrag,
  toggleHidden,
  toHiddenSets,
} from './category-table-layout.ts';

// ─── coerceCategoryTableLayout / readCategoryTableLayout ───────────────

test('coerce: null / undefined → null (never customized)', () => {
  assert.equal(coerceCategoryTableLayout(null), null);
  assert.equal(coerceCategoryTableLayout(undefined), null);
});

test('coerce: non-object (array, string, number) → null', () => {
  assert.equal(coerceCategoryTableLayout([1, 2, 3]), null);
  assert.equal(coerceCategoryTableLayout('nope'), null);
  assert.equal(coerceCategoryTableLayout(42), null);
});

test('coerce: well-formed object passes through', () => {
  const layout = {
    categoryOrder: ['Straps', 'Buckles'],
    rowOrderByUrlId: ['u1', 'u2'],
    hiddenUrlIds: ['u3'],
    hiddenCategoryKeys: ['Discontinued'],
  };
  assert.deepEqual(coerceCategoryTableLayout(layout), layout);
});

test('coerce: drops non-string entries + de-dupes, defaults missing fields', () => {
  const result = coerceCategoryTableLayout({
    categoryOrder: ['A', 2, 'A', null, 'B'],
    rowOrderByUrlId: 'not-an-array',
    // hiddenUrlIds + hiddenCategoryKeys missing entirely
  });
  assert.deepEqual(result, {
    categoryOrder: ['A', 'B'],
    rowOrderByUrlId: [],
    hiddenUrlIds: [],
    hiddenCategoryKeys: [],
  });
});

test('read: null input → the EMPTY layout (concrete object for the client)', () => {
  assert.deepEqual(readCategoryTableLayout(null), EMPTY_CATEGORY_TABLE_LAYOUT);
  assert.deepEqual(
    readCategoryTableLayout({ categoryOrder: ['X'] }),
    { categoryOrder: ['X'], rowOrderByUrlId: [], hiddenUrlIds: [], hiddenCategoryKeys: [] }
  );
});

// ─── validateCategoryTableLayout (PUT trust boundary) ──────────────────

test('validate: null is accepted (clears the memory)', () => {
  const r = validateCategoryTableLayout(null);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value, null);
});

test('validate: valid object normalizes + defaults missing fields', () => {
  const r = validateCategoryTableLayout({ categoryOrder: ['A', 'B'] });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.value, {
      categoryOrder: ['A', 'B'],
      rowOrderByUrlId: [],
      hiddenUrlIds: [],
      hiddenCategoryKeys: [],
    });
  }
});

test('validate: rejects non-object / non-null', () => {
  assert.equal(validateCategoryTableLayout('x').ok, false);
  assert.equal(validateCategoryTableLayout(5).ok, false);
  assert.equal(validateCategoryTableLayout([]).ok, false);
});

test('validate: rejects a non-array field', () => {
  const r = validateCategoryTableLayout({ categoryOrder: 'A' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /categoryOrder must be an array/);
});

test('validate: rejects a non-string array entry', () => {
  const r = validateCategoryTableLayout({ hiddenUrlIds: ['ok', 7] });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /hiddenUrlIds must be an array of strings/);
});

// ─── applyCategoryDrag ──────────────────────────────────────────────────

test('category drag: move a category up, full order returned', () => {
  // displayed = the visible category order; drag "C" onto "A"
  const next = applyCategoryDrag(['A', 'B', 'C'], ['A', 'B', 'C'], 'C', 'A');
  assert.deepEqual(next, ['C', 'A', 'B']);
});

test('category drag: hidden category preserved at the tail', () => {
  // "Hidden" is in the prior order but NOT displayed → stays at the tail.
  const next = applyCategoryDrag(
    ['A', 'B', 'C', 'Hidden'],
    ['A', 'B', 'C'],
    'A',
    'C'
  );
  assert.deepEqual(next, ['B', 'C', 'A', 'Hidden']);
});

test('category drag: same key is a no-op (prior order copy)', () => {
  const prior = ['A', 'B'];
  const next = applyCategoryDrag(prior, ['A', 'B'], 'A', 'A');
  assert.deepEqual(next, prior);
  assert.notEqual(next, prior); // a fresh copy, not the same ref
});

test('category drag: unknown key → prior order unchanged', () => {
  const next = applyCategoryDrag(['A', 'B'], ['A', 'B'], 'Z', 'A');
  assert.deepEqual(next, ['A', 'B']);
});

// ─── applyCompetitorDrag ────────────────────────────────────────────────

test('competitor drag: reorder within the flat displayed id list', () => {
  const next = applyCompetitorDrag(
    ['u1', 'u2', 'u3'],
    ['u1', 'u2', 'u3'],
    'u3',
    'u1'
  );
  assert.deepEqual(next, ['u3', 'u1', 'u2']);
});

test('competitor drag: filtered-out ids preserved at the tail', () => {
  const next = applyCompetitorDrag(
    ['u1', 'u2', 'u3', 'uHidden'],
    ['u1', 'u2', 'u3'],
    'u1',
    'u2'
  );
  assert.deepEqual(next, ['u2', 'u1', 'u3', 'uHidden']);
});

// ─── toggleHidden / toHiddenSets ────────────────────────────────────────

test('toggleHidden: hide adds (idempotent), restore removes', () => {
  assert.deepEqual(toggleHidden([], 'u1', true), ['u1']);
  assert.deepEqual(toggleHidden(['u1'], 'u1', true), ['u1']); // no dup
  assert.deepEqual(toggleHidden(['u1', 'u2'], 'u1', false), ['u2']);
  assert.deepEqual(toggleHidden(['u2'], 'u1', false), ['u2']); // absent → no-op
});

test('toHiddenSets: builds fast-lookup sets from the layout', () => {
  const sets = toHiddenSets({
    categoryOrder: [],
    rowOrderByUrlId: [],
    hiddenUrlIds: ['u1', 'u2'],
    hiddenCategoryKeys: ['Old'],
  });
  assert.equal(sets.hiddenUrlIds.has('u1'), true);
  assert.equal(sets.hiddenUrlIds.has('u9'), false);
  assert.equal(sets.hiddenCategoryKeys.has('Old'), true);
});
