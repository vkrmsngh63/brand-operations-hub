import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORY_VOCABULARY_TYPES,
  isCategoryVocabularyType,
  categoryFieldMapping,
  categoryDeletionMessage,
} from './category-vocabulary.ts';

test('isCategoryVocabularyType: true for the three category types only', () => {
  for (const t of CATEGORY_VOCABULARY_TYPES) {
    assert.equal(isCategoryVocabularyType(t), true);
  }
  for (const t of [
    'competition-category',
    'product-name',
    'brand-name',
    'custom-field-name-product',
    'custom-field-name-size',
  ]) {
    assert.equal(isCategoryVocabularyType(t), false);
  }
});

test('isCategoryVocabularyType: false for non-strings / junk', () => {
  assert.equal(isCategoryVocabularyType(null), false);
  assert.equal(isCategoryVocabularyType(undefined), false);
  assert.equal(isCategoryVocabularyType(42), false);
  assert.equal(isCategoryVocabularyType(''), false);
  assert.equal(isCategoryVocabularyType('content-categories'), false);
});

test('categoryFieldMapping: content-category → CapturedText.contentCategory, no storage', () => {
  const m = categoryFieldMapping('content-category');
  assert.ok(m);
  assert.equal(m.model, 'capturedText');
  assert.equal(m.column, 'contentCategory');
  assert.equal(m.hasStorage, false);
  assert.equal(m.noun, 'captured text');
  assert.equal(m.pluralNoun, 'captured texts');
});

test('categoryFieldMapping: image-category → CapturedImage.imageCategory, has storage', () => {
  const m = categoryFieldMapping('image-category');
  assert.ok(m);
  assert.equal(m.model, 'capturedImage');
  assert.equal(m.column, 'imageCategory');
  assert.equal(m.hasStorage, true);
});

test('categoryFieldMapping: video-category → CapturedVideo.videoCategory, has storage', () => {
  const m = categoryFieldMapping('video-category');
  assert.ok(m);
  assert.equal(m.model, 'capturedVideo');
  assert.equal(m.column, 'videoCategory');
  assert.equal(m.hasStorage, true);
});

test('categoryFieldMapping: null for non-category / unknown types', () => {
  assert.equal(categoryFieldMapping('product-name'), null);
  assert.equal(categoryFieldMapping('competition-category'), null);
  assert.equal(categoryFieldMapping(null), null);
  assert.equal(categoryFieldMapping(undefined), null);
  assert.equal(categoryFieldMapping('nonsense'), null);
});

test('categoryDeletionMessage: count > 0 is explicit, project-wide, permanent', () => {
  const m = categoryFieldMapping('image-category')!;
  const msg = categoryDeletionMessage(m, 'Lifestyle', 3);
  assert.match(msg, /“Lifestyle”/);
  assert.match(msg, /3 captured images/);
  assert.match(msg, /entire project/);
  assert.match(msg, /cannot be undone/);
});

test('categoryDeletionMessage: singular noun for count === 1', () => {
  const m = categoryFieldMapping('video-category')!;
  const msg = categoryDeletionMessage(m, 'Demo', 1);
  assert.match(msg, /1 captured video\b/);
  assert.doesNotMatch(msg, /1 captured videos/);
});

test('categoryDeletionMessage: count === 0 uses the softer no-items phrasing', () => {
  const m = categoryFieldMapping('content-category')!;
  const msg = categoryDeletionMessage(m, 'Unused', 0);
  assert.match(msg, /No captured texts are tagged/);
  assert.match(msg, /“Unused”/);
  assert.match(msg, /cannot be undone/);
});

test('categoryDeletionMessage: blank value falls back to "this category"', () => {
  const m = categoryFieldMapping('content-category')!;
  const msg = categoryDeletionMessage(m, '   ', 2);
  assert.match(msg, /this category/);
  assert.doesNotMatch(msg, /“”/);
});
