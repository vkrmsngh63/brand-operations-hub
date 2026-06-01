import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyColumnOrder,
  moveColumnKey,
  withMissingKeysBefore,
} from './column-order.ts';

type Col = { key: string; label: string };
const getKey = (c: Col): string => c.key;

const COLS: Col[] = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' },
  { key: 'd', label: 'D' },
];

test('applyColumnOrder: empty/missing order returns registry order unchanged', () => {
  assert.deepEqual(applyColumnOrder(COLS, [], getKey).map(getKey), ['a', 'b', 'c', 'd']);
  assert.deepEqual(applyColumnOrder(COLS, null, getKey).map(getKey), ['a', 'b', 'c', 'd']);
  assert.deepEqual(
    applyColumnOrder(COLS, undefined, getKey).map(getKey),
    ['a', 'b', 'c', 'd']
  );
});

test('applyColumnOrder: reorders to the saved sequence', () => {
  assert.deepEqual(
    applyColumnOrder(COLS, ['c', 'a', 'd', 'b'], getKey).map(getKey),
    ['c', 'a', 'd', 'b']
  );
});

test('applyColumnOrder: columns not in the saved order are appended in registry order', () => {
  // Only 'c' and 'a' saved; 'b' and 'd' are unknown → appended in original order.
  assert.deepEqual(
    applyColumnOrder(COLS, ['c', 'a'], getKey).map(getKey),
    ['c', 'a', 'b', 'd']
  );
});

test('applyColumnOrder: unknown ids in the saved order are ignored', () => {
  assert.deepEqual(
    applyColumnOrder(COLS, ['zzz', 'b', 'nope', 'a'], getKey).map(getKey),
    ['b', 'a', 'c', 'd']
  );
});

test('applyColumnOrder: duplicate ids in the saved order use first occurrence', () => {
  assert.deepEqual(
    applyColumnOrder(COLS, ['b', 'b', 'a'], getKey).map(getKey),
    ['b', 'a', 'c', 'd']
  );
});

test('applyColumnOrder: does not mutate the input array', () => {
  const input = [...COLS];
  applyColumnOrder(input, ['d', 'c'], getKey);
  assert.deepEqual(input.map(getKey), ['a', 'b', 'c', 'd']);
});

test('moveColumnKey: moves a key to the target slot (forward)', () => {
  // move 'a' to where 'c' is → a is removed then inserted at c's index.
  assert.deepEqual(moveColumnKey(['a', 'b', 'c', 'd'], 'a', 'c'), ['b', 'c', 'a', 'd']);
});

test('moveColumnKey: moves a key to the target slot (backward)', () => {
  assert.deepEqual(moveColumnKey(['a', 'b', 'c', 'd'], 'd', 'b'), ['a', 'd', 'b', 'c']);
});

test('moveColumnKey: no-op when moving onto itself', () => {
  assert.deepEqual(moveColumnKey(['a', 'b', 'c'], 'b', 'b'), ['a', 'b', 'c']);
});

test('moveColumnKey: returns a copy when a key is missing', () => {
  assert.deepEqual(moveColumnKey(['a', 'b', 'c'], 'x', 'b'), ['a', 'b', 'c']);
  assert.deepEqual(moveColumnKey(['a', 'b', 'c'], 'a', 'y'), ['a', 'b', 'c']);
});

test('moveColumnKey: does not mutate the input array', () => {
  const input = ['a', 'b', 'c', 'd'];
  moveColumnKey(input, 'a', 'd');
  assert.deepEqual(input, ['a', 'b', 'c', 'd']);
});

// P-55 Phase 1 — withMissingKeysBefore (new-fixed-column reconciliation).
const REGISTRY = ['a', 'b', 'oca', 'd']; // 'oca' = the newly-introduced column

test('withMissingKeysBefore: empty saved order is returned as-is (registry default in play)', () => {
  assert.deepEqual(withMissingKeysBefore([], REGISTRY, 'd'), []);
  assert.deepEqual(withMissingKeysBefore(null, REGISTRY, 'd'), []);
  assert.deepEqual(withMissingKeysBefore(undefined, REGISTRY, 'd'), []);
});

test('withMissingKeysBefore: splices a missing key in just before beforeKey', () => {
  // Saved order predates 'oca'; it should land immediately left of 'd'.
  assert.deepEqual(
    withMissingKeysBefore(['a', 'b', 'd'], REGISTRY, 'd'),
    ['a', 'b', 'oca', 'd']
  );
});

test('withMissingKeysBefore: missing key lands left of beforeKey even with other keys (e.g. dynamic) present', () => {
  assert.deepEqual(
    withMissingKeysBefore(['a', 'b', 'dyn:text:foo', 'd'], REGISTRY, 'd'),
    ['a', 'b', 'dyn:text:foo', 'oca', 'd']
  );
});

test('withMissingKeysBefore: no missing keys returns a copy unchanged', () => {
  const saved = ['b', 'a', 'oca', 'd'];
  const out = withMissingKeysBefore(saved, REGISTRY, 'd');
  assert.deepEqual(out, ['b', 'a', 'oca', 'd']);
  assert.notEqual(out, saved); // copy, not the same reference
});

test('withMissingKeysBefore: appends missing keys when beforeKey is absent', () => {
  assert.deepEqual(
    withMissingKeysBefore(['a', 'b'], REGISTRY, 'd'),
    ['a', 'b', 'oca', 'd']
  );
});

test('withMissingKeysBefore: inserts multiple missing keys in registry relative order', () => {
  const reg = ['a', 'x', 'y', 'd'];
  assert.deepEqual(
    withMissingKeysBefore(['a', 'd'], reg, 'd'),
    ['a', 'x', 'y', 'd']
  );
});

test('withMissingKeysBefore: does not mutate the input array', () => {
  const input = ['a', 'b', 'd'];
  withMissingKeysBefore(input, REGISTRY, 'd');
  assert.deepEqual(input, ['a', 'b', 'd']);
});
