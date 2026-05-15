/**
 * Tests for the W#2 shared-types type guards.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/shared-types/competition-scraping.test.ts
 *
 * Scope: pure type-guard functions exported alongside the wire types.
 * The route handlers + the extension both depend on these guards to reject
 * misshapen payloads at the trust boundary — a regression here would let
 * an arbitrary string land in DB columns the rest of the code reads as
 * a closed vocabulary.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  isPlatform,
  isSource,
  isVocabularyType,
  isImageSourceType,
  isAcceptedImageMimeType,
  PLATFORMS,
  SOURCES,
} from './competition-scraping.ts';

test('isSource — P-29 Slice #1 — accepts both vocabulary values', () => {
  assert.equal(isSource('extension'), true);
  assert.equal(isSource('manual'), true);
});

test('isSource — rejects everything outside the closed vocabulary', () => {
  // Common slip shapes: capitalization, typos, neighboring concepts.
  assert.equal(isSource('Extension'), false);
  assert.equal(isSource('MANUAL'), false);
  assert.equal(isSource('chrome-extension'), false);
  assert.equal(isSource('web'), false);
  assert.equal(isSource(''), false);
  assert.equal(isSource(' extension'), false);
});

test('isSource — rejects non-string values', () => {
  assert.equal(isSource(null), false);
  assert.equal(isSource(undefined), false);
  assert.equal(isSource(0), false);
  assert.equal(isSource(true), false);
  assert.equal(isSource({}), false);
  assert.equal(isSource(['extension']), false);
});

test('SOURCES — vocabulary contains exactly the two values, in stable order', () => {
  assert.deepEqual([...SOURCES], ['extension', 'manual']);
});

test('isPlatform — P-29 Q2-reframing — independent-website is supported', () => {
  // Code-truth check captured 2026-05-15 in COMPETITION_SCRAPING_DESIGN §B —
  // the yesterday-captured P-29 Q2 framing claimed `independent-website`
  // needed a schema-add, but it has been a supported PLATFORMS value end-
  // to-end. This test makes the support load-bearing.
  assert.equal(isPlatform('independent-website'), true);
});

test('isPlatform — accepts all 7 documented platform values', () => {
  for (const p of PLATFORMS) {
    assert.equal(isPlatform(p), true, `${p} should pass isPlatform`);
  }
});

test('isPlatform — rejects nearby misshapen values', () => {
  assert.equal(isPlatform('amazon.com'), false);
  assert.equal(isPlatform('Amazon'), false);
  assert.equal(isPlatform('Independent Website'), false);
  assert.equal(isPlatform('independent_website'), false);
  assert.equal(isPlatform(''), false);
  assert.equal(isPlatform(null), false);
});

test('isVocabularyType — accepts all 7 documented vocabulary types', () => {
  const expected = [
    'competition-category',
    'product-name',
    'brand-name',
    'content-category',
    'image-category',
    'custom-field-name-product',
    'custom-field-name-size',
  ];
  for (const v of expected) {
    assert.equal(isVocabularyType(v), true, `${v} should pass isVocabularyType`);
  }
  assert.equal(isVocabularyType('not-a-real-vocab'), false);
  assert.equal(isVocabularyType(null), false);
});

test('isImageSourceType — distinct from Source (different vocabulary)', () => {
  // Catch a slip class — Slice #1 added Source ('extension' | 'manual')
  // and CapturedImage already had sourceType ('regular' | 'region-screenshot').
  // The two are unrelated despite the naming overlap; a reader assuming they
  // mix would corrupt the audit trail.
  assert.equal(isImageSourceType('regular'), true);
  assert.equal(isImageSourceType('region-screenshot'), true);
  assert.equal(isImageSourceType('extension'), false);
  assert.equal(isImageSourceType('manual'), false);
});

test('isAcceptedImageMimeType — accepts the 3 stack-decided MIME types', () => {
  assert.equal(isAcceptedImageMimeType('image/jpeg'), true);
  assert.equal(isAcceptedImageMimeType('image/png'), true);
  assert.equal(isAcceptedImageMimeType('image/webp'), true);
  // SVG is rejected on XSS grounds per §3 — verify regression coverage.
  assert.equal(isAcceptedImageMimeType('image/svg+xml'), false);
  assert.equal(isAcceptedImageMimeType('image/heic'), false);
  assert.equal(isAcceptedImageMimeType('text/html'), false);
});
