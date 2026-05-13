// Tests for the image-capture validation helpers (session 5). Mirrors the
// captured-text-validation tests' shape so the read-across is fast for
// future maintainers.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeTagsForImage,
  validateCapturedImageDraft,
  type CapturedImageDraft,
} from './captured-image-validation.ts';
import { IMAGE_UPLOAD_MAX_BYTES } from '../../../../src/lib/shared-types/competition-scraping.ts';

function makeDraft(over: Partial<CapturedImageDraft> = {}): CapturedImageDraft {
  return {
    competitorUrlId: 'url-1',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    sourceType: 'regular',
    imageCategory: 'Amazon Hero Shot',
    composition: '',
    embeddedText: '',
    tags: [],
    ...over,
  };
}

const STABLE_CLIENT_ID = '11111111-2222-3333-4444-555555555555';
const mintStable = () => STABLE_CLIENT_ID;

test('validateCapturedImageDraft — happy path returns server-ready payload', () => {
  const draft = makeDraft({
    composition: '  A pair of headphones on a white background.  ',
    embeddedText: '  Premium Sound  ',
    tags: ['Hero', 'hero', '', '  spotlight  '],
  });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.clientId, STABLE_CLIENT_ID);
    assert.equal(result.payload.competitorUrlId, 'url-1');
    assert.equal(result.payload.mimeType, 'image/jpeg');
    assert.equal(result.payload.sourceType, 'regular');
    assert.equal(result.payload.imageCategory, 'Amazon Hero Shot');
    assert.equal(
      result.payload.composition,
      'A pair of headphones on a white background.',
    );
    assert.equal(result.payload.embeddedText, 'Premium Sound');
    assert.deepEqual(result.payload.tags, ['Hero', 'spotlight']);
  }
});

test('validateCapturedImageDraft — empty composition/embeddedText collapse to null', () => {
  const draft = makeDraft({ composition: '   ', embeddedText: '' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.composition, null);
    assert.equal(result.payload.embeddedText, null);
  }
});

test('validateCapturedImageDraft — missing url returns url-required', () => {
  const draft = makeDraft({ competitorUrlId: '   ' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'url-required' });
});

test('validateCapturedImageDraft — missing image (no MIME + zero bytes) returns image-required', () => {
  const draft = makeDraft({ mimeType: '', fileSize: 0 });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'image-required' });
});

test('validateCapturedImageDraft — rejected MIME returns image-mime-rejected', () => {
  const draft = makeDraft({ mimeType: 'image/svg+xml' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'image-mime-rejected' });
});

test('validateCapturedImageDraft — bytes exceeding the 5 MB cap returns image-too-large', () => {
  const draft = makeDraft({ fileSize: IMAGE_UPLOAD_MAX_BYTES + 1 });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'image-too-large' });
});

test('validateCapturedImageDraft — exactly 5 MB at the cap is allowed', () => {
  const draft = makeDraft({ fileSize: IMAGE_UPLOAD_MAX_BYTES });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.equal(result.ok, true);
});

test('validateCapturedImageDraft — unknown sourceType returns source-type-invalid', () => {
  const draft = makeDraft({ sourceType: 'auto-crawl' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'source-type-invalid' });
});

test('validateCapturedImageDraft — missing imageCategory returns category-required', () => {
  const draft = makeDraft({ imageCategory: '   ' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.deepEqual(result, { ok: false, reason: 'category-required' });
});

test('validateCapturedImageDraft — region-screenshot sourceType accepted', () => {
  const draft = makeDraft({ sourceType: 'region-screenshot' });
  const result = validateCapturedImageDraft(draft, mintStable);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.payload.sourceType, 'region-screenshot');
  }
});

test('normalizeTagsForImage — trim + dedup case-insensitive + preserve first-seen casing', () => {
  assert.deepEqual(
    normalizeTagsForImage(['Hero', 'HERO', 'hero', 'spotlight', '  spotlight  ']),
    ['Hero', 'spotlight'],
  );
});

test('normalizeTagsForImage — drops empties + non-strings', () => {
  assert.deepEqual(
    normalizeTagsForImage([
      'keep',
      '   ',
      '',
      // @ts-expect-error — defensively handled at runtime
      null,
      // @ts-expect-error — defensively handled at runtime
      42,
      'kept',
    ]),
    ['keep', 'kept'],
  );
});
