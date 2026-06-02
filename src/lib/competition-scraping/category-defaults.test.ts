import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCategoryPickerOptions,
  isDefaultCategory,
} from './category-defaults.ts';

test('buildCategoryPickerOptions: defaults pinned, others keep vocab order', () => {
  const vocab = ['Product Features', 'Materials', 'Warranty', 'Sizing'];
  const defaults = ['Materials', 'Product Features'];
  const out = buildCategoryPickerOptions(vocab, defaults);
  // defaults in the order the server gave them
  assert.deepEqual(out.defaults, ['Materials', 'Product Features']);
  // others = vocab minus defaults, in vocab order
  assert.deepEqual(out.others, ['Warranty', 'Sizing']);
});

test('buildCategoryPickerOptions: no defaults → everything is "others"', () => {
  const vocab = ['A', 'B', 'C'];
  const out = buildCategoryPickerOptions(vocab, []);
  assert.deepEqual(out.defaults, []);
  assert.deepEqual(out.others, ['A', 'B', 'C']);
});

test('buildCategoryPickerOptions: a default missing from vocab still shows', () => {
  // "Old" was pinned as a default but its VocabularyEntry was later deleted.
  const vocab = ['New'];
  const defaults = ['Old', 'New'];
  const out = buildCategoryPickerOptions(vocab, defaults);
  assert.deepEqual(out.defaults, ['Old', 'New']);
  assert.deepEqual(out.others, []); // 'New' is a default, so not duplicated
});

test('buildCategoryPickerOptions: de-duplicates within each group', () => {
  const vocab = ['A', 'A', 'B', 'B'];
  const defaults = ['B', 'B'];
  const out = buildCategoryPickerOptions(vocab, defaults);
  assert.deepEqual(out.defaults, ['B']);
  assert.deepEqual(out.others, ['A']);
});

test('buildCategoryPickerOptions: empty everything', () => {
  const out = buildCategoryPickerOptions([], []);
  assert.deepEqual(out.defaults, []);
  assert.deepEqual(out.others, []);
});

test('isDefaultCategory: true when present, false when absent or empty', () => {
  assert.equal(isDefaultCategory(['A', 'B'], 'B'), true);
  assert.equal(isDefaultCategory(['A', 'B'], 'C'), false);
  assert.equal(isDefaultCategory([], 'A'), false);
  assert.equal(isDefaultCategory(['A'], ''), false);
});
