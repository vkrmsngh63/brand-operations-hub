// W#2 P-49 W5 Type page Sessions 4-5 (2026-06-01) — node:test
// cases for the pure type-table layout-memory helpers (parse / validate /
// two-level drag re-rank / hide-with-restore).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY_TYPE_TABLE_LAYOUT,
  coerceTypeTableLayout,
  readTypeTableLayout,
  validateTypeTableLayout,
  applyTypeDrag,
  applyCompetitorDrag,
  toggleHidden,
  toHiddenSets,
} from './type-table-layout.ts';

// ─── coerceTypeTableLayout / readTypeTableLayout ───────────────

test('coerce: null / undefined → null (never customized)', () => {
  assert.equal(coerceTypeTableLayout(null), null);
  assert.equal(coerceTypeTableLayout(undefined), null);
});

test('coerce: non-object (array, string, number) → null', () => {
  assert.equal(coerceTypeTableLayout([1, 2, 3]), null);
  assert.equal(coerceTypeTableLayout('nope'), null);
  assert.equal(coerceTypeTableLayout(42), null);
});

test('coerce: well-formed object passes through', () => {
  const layout = {
    typeOrder: ['Straps', 'Buckles'],
    rowOrderByUrlId: ['u1', 'u2'],
    hiddenUrlIds: ['u3'],
    hiddenTypeKeys: ['Discontinued'],
  };
  assert.deepEqual(coerceTypeTableLayout(layout), layout);
});

test('coerce: drops non-string entries + de-dupes, defaults missing fields', () => {
  const result = coerceTypeTableLayout({
    typeOrder: ['A', 2, 'A', null, 'B'],
    rowOrderByUrlId: 'not-an-array',
    // hiddenUrlIds + hiddenTypeKeys missing entirely
  });
  assert.deepEqual(result, {
    typeOrder: ['A', 'B'],
    rowOrderByUrlId: [],
    hiddenUrlIds: [],
    hiddenTypeKeys: [],
  });
});

test('read: null input → the EMPTY layout (concrete object for the client)', () => {
  assert.deepEqual(readTypeTableLayout(null), EMPTY_TYPE_TABLE_LAYOUT);
  assert.deepEqual(
    readTypeTableLayout({ typeOrder: ['X'] }),
    { typeOrder: ['X'], rowOrderByUrlId: [], hiddenUrlIds: [], hiddenTypeKeys: [] }
  );
});

// ─── validateTypeTableLayout (PUT trust boundary) ──────────────────

test('validate: null is accepted (clears the memory)', () => {
  const r = validateTypeTableLayout(null);
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value, null);
});

test('validate: valid object normalizes + defaults missing fields', () => {
  const r = validateTypeTableLayout({ typeOrder: ['A', 'B'] });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.value, {
      typeOrder: ['A', 'B'],
      rowOrderByUrlId: [],
      hiddenUrlIds: [],
      hiddenTypeKeys: [],
    });
  }
});

test('validate: rejects non-object / non-null', () => {
  assert.equal(validateTypeTableLayout('x').ok, false);
  assert.equal(validateTypeTableLayout(5).ok, false);
  assert.equal(validateTypeTableLayout([]).ok, false);
});

test('validate: rejects a non-array field', () => {
  const r = validateTypeTableLayout({ typeOrder: 'A' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /typeOrder must be an array/);
});

test('validate: rejects a non-string array entry', () => {
  const r = validateTypeTableLayout({ hiddenUrlIds: ['ok', 7] });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /hiddenUrlIds must be an array of strings/);
});

// ─── applyTypeDrag ──────────────────────────────────────────────────

test('type drag: move a type up, full order returned', () => {
  // displayed = the visible type order; drag "C" onto "A"
  const next = applyTypeDrag(['A', 'B', 'C'], ['A', 'B', 'C'], 'C', 'A');
  assert.deepEqual(next, ['C', 'A', 'B']);
});

test('type drag: hidden type preserved at the tail', () => {
  // "Hidden" is in the prior order but NOT displayed → stays at the tail.
  const next = applyTypeDrag(
    ['A', 'B', 'C', 'Hidden'],
    ['A', 'B', 'C'],
    'A',
    'C'
  );
  assert.deepEqual(next, ['B', 'C', 'A', 'Hidden']);
});

test('type drag: same key is a no-op (prior order copy)', () => {
  const prior = ['A', 'B'];
  const next = applyTypeDrag(prior, ['A', 'B'], 'A', 'A');
  assert.deepEqual(next, prior);
  assert.notEqual(next, prior); // a fresh copy, not the same ref
});

test('type drag: unknown key → prior order unchanged', () => {
  const next = applyTypeDrag(['A', 'B'], ['A', 'B'], 'Z', 'A');
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
    typeOrder: [],
    rowOrderByUrlId: [],
    hiddenUrlIds: ['u1', 'u2'],
    hiddenTypeKeys: ['Old'],
  });
  assert.equal(sets.hiddenUrlIds.has('u1'), true);
  assert.equal(sets.hiddenUrlIds.has('u9'), false);
  assert.equal(sets.hiddenTypeKeys.has('Old'), true);
});
