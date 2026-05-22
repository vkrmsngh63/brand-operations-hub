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
  isAcceptedVideoMimeType,
  isVideoSourceType,
  isRequestVideoUploadRequest,
  isFinalizeVideoUploadRequest,
  PLATFORMS,
  SOURCES,
  VIDEO_SOURCE_TYPES,
  ACCEPTED_VIDEO_MIME_TYPES,
  VIDEO_UPLOAD_MAX_BYTES,
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

test('isVocabularyType — accepts all 8 documented vocabulary types', () => {
  // `video-category` added 2026-05-20-c in P-27 Build #1 alongside the
  // CapturedVideo schema. The list mirrors VOCABULARY_TYPES in
  // competition-scraping.ts; if a new type is added, both should change.
  const expected = [
    'competition-category',
    'product-name',
    'brand-name',
    'content-category',
    'image-category',
    'video-category',
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

// ─── P-27 Build #2 — video type-guard coverage ──────────────────────────

test('isAcceptedVideoMimeType — accepts the 3 design-doc-§A.9 MIME types', () => {
  assert.equal(isAcceptedVideoMimeType('video/mp4'), true);
  assert.equal(isAcceptedVideoMimeType('video/webm'), true);
  assert.equal(isAcceptedVideoMimeType('video/quicktime'), true);
});

test('isAcceptedVideoMimeType — rejects non-accepted video MIME types', () => {
  // video/x-msvideo (AVI) + video/ogg + video/x-matroska (MKV) are common
  // shapes the extension might encounter on the wild web; design doc §A.9
  // explicitly limited v1 to mp4/webm/quicktime.
  assert.equal(isAcceptedVideoMimeType('video/x-msvideo'), false);
  assert.equal(isAcceptedVideoMimeType('video/ogg'), false);
  assert.equal(isAcceptedVideoMimeType('video/x-matroska'), false);
  assert.equal(isAcceptedVideoMimeType('video/mpeg'), false);
  // Adjacent-vocabulary rejections — would corrupt the bucket allowlist.
  assert.equal(isAcceptedVideoMimeType('image/jpeg'), false);
  assert.equal(isAcceptedVideoMimeType(''), false);
  assert.equal(isAcceptedVideoMimeType(null), false);
});

test('ACCEPTED_VIDEO_MIME_TYPES — vocabulary contains exactly the 3 values, in stable order', () => {
  assert.deepEqual(
    [...ACCEPTED_VIDEO_MIME_TYPES],
    ['video/mp4', 'video/webm', 'video/quicktime']
  );
});

test('isVideoSourceType — accepts EMBED + DIRECT_BYTES', () => {
  assert.equal(isVideoSourceType('EMBED'), true);
  assert.equal(isVideoSourceType('DIRECT_BYTES'), true);
});

test('isVideoSourceType — rejects everything outside the closed vocabulary', () => {
  // Lowercase variants are a common slip class — the Prisma enum is
  // SCREAMING_SNAKE; serializing to lowercase would still feel correct
  // to a careless reader. Make it load-bearing.
  assert.equal(isVideoSourceType('embed'), false);
  assert.equal(isVideoSourceType('direct_bytes'), false);
  assert.equal(isVideoSourceType('direct-bytes'), false);
  assert.equal(isVideoSourceType('Embed'), false);
  // Distinct from CapturedImage.sourceType vocabulary — verify regression.
  assert.equal(isVideoSourceType('regular'), false);
  assert.equal(isVideoSourceType('region-screenshot'), false);
  assert.equal(isVideoSourceType(''), false);
  assert.equal(isVideoSourceType(null), false);
});

test('VIDEO_SOURCE_TYPES — vocabulary matches the Prisma enum order', () => {
  // SCREEN_RECORDING added 2026-05-22 for P-45 — third bytes-bearing variant
  // alongside DIRECT_BYTES; bytes flow through the same Phase 2 upload path.
  assert.deepEqual(
    [...VIDEO_SOURCE_TYPES],
    ['EMBED', 'DIRECT_BYTES', 'SCREEN_RECORDING']
  );
});

test('isVideoSourceType — accepts SCREEN_RECORDING (P-45)', () => {
  assert.equal(isVideoSourceType('SCREEN_RECORDING'), true);
});

test('VIDEO_UPLOAD_MAX_BYTES — 100 MB per design doc §A.10', () => {
  assert.equal(VIDEO_UPLOAD_MAX_BYTES, 100 * 1024 * 1024);
});

test('isRequestVideoUploadRequest — accepts a well-formed Phase-1 body', () => {
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'abc-123',
      mimeType: 'video/mp4',
      fileSize: 12345,
    }),
    true
  );
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'xyz',
      mimeType: 'video/webm',
      fileSize: 100 * 1024 * 1024, // exactly the cap — handler checks > cap
    }),
    true
  );
});

test('isRequestVideoUploadRequest — rejects misshapen Phase-1 bodies', () => {
  // Missing clientId
  assert.equal(
    isRequestVideoUploadRequest({ mimeType: 'video/mp4', fileSize: 1 }),
    false
  );
  // Empty / whitespace clientId
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: '',
      mimeType: 'video/mp4',
      fileSize: 1,
    }),
    false
  );
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: '   ',
      mimeType: 'video/mp4',
      fileSize: 1,
    }),
    false
  );
  // Rejected MIME
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'a',
      mimeType: 'video/ogg',
      fileSize: 1,
    }),
    false
  );
  // Non-positive fileSize
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'a',
      mimeType: 'video/mp4',
      fileSize: 0,
    }),
    false
  );
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'a',
      mimeType: 'video/mp4',
      fileSize: -1,
    }),
    false
  );
  // Non-finite fileSize (NaN / Infinity)
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'a',
      mimeType: 'video/mp4',
      fileSize: Number.NaN,
    }),
    false
  );
  assert.equal(
    isRequestVideoUploadRequest({
      clientId: 'a',
      mimeType: 'video/mp4',
      fileSize: Number.POSITIVE_INFINITY,
    }),
    false
  );
  // Non-object inputs
  assert.equal(isRequestVideoUploadRequest(null), false);
  assert.equal(isRequestVideoUploadRequest(undefined), false);
  assert.equal(isRequestVideoUploadRequest('not an object'), false);
  assert.equal(isRequestVideoUploadRequest(42), false);
});

test('isFinalizeVideoUploadRequest — accepts a well-formed EMBED body', () => {
  // EMBED rows skip Phase 1 — no capturedVideoId / storage paths.
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'embed-1',
      sourceType: 'EMBED',
      originalSrcUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }),
    true
  );
  // With optional metadata.
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'embed-2',
      sourceType: 'EMBED',
      originalSrcUrl: 'https://vimeo.com/123456',
      videoCategory: 'product-demo',
      composition: 'a demo of the product',
      tags: ['demo', 'launch'],
      source: 'manual',
    }),
    true
  );
});

test('isFinalizeVideoUploadRequest — accepts a well-formed DIRECT_BYTES body', () => {
  // DIRECT_BYTES requires capturedVideoId + videoStoragePath; thumbnail is
  // optional (NULL when canvas frame-grab failed per §A.12).
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'db-1',
      sourceType: 'DIRECT_BYTES',
      originalSrcUrl: 'https://www.amazon.com/product/B0123',
      capturedVideoId: 'uuid-here',
      videoStoragePath: 'proj1/url1/video1.mp4',
      thumbnailStoragePath: 'proj1/url1/video1.thumb.jpg',
      mimeType: 'video/mp4',
      fileSize: 12345,
      durationSeconds: 42.5,
      width: 1920,
      height: 1080,
    }),
    true
  );
  // Without thumbnailStoragePath (canvas frame-grab failure path).
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'db-2',
      sourceType: 'DIRECT_BYTES',
      originalSrcUrl: 'https://www.amazon.com/p/B0124',
      capturedVideoId: 'uuid-2',
      videoStoragePath: 'proj1/url1/video2.mp4',
    }),
    true
  );
});

test('isFinalizeVideoUploadRequest — rejects misshapen bodies', () => {
  // Missing clientId
  assert.equal(
    isFinalizeVideoUploadRequest({
      sourceType: 'EMBED',
      originalSrcUrl: 'https://youtu.be/abc',
    }),
    false
  );
  // Empty originalSrcUrl
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'a',
      sourceType: 'EMBED',
      originalSrcUrl: '',
    }),
    false
  );
  // Bad sourceType
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'a',
      sourceType: 'embed', // lowercase — bad
      originalSrcUrl: 'https://x',
    }),
    false
  );
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'a',
      sourceType: 'OTHER',
      originalSrcUrl: 'https://x',
    }),
    false
  );
  // DIRECT_BYTES missing capturedVideoId
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'a',
      sourceType: 'DIRECT_BYTES',
      originalSrcUrl: 'https://x',
      videoStoragePath: 'p/u/v.mp4',
    }),
    false
  );
  // DIRECT_BYTES missing videoStoragePath
  assert.equal(
    isFinalizeVideoUploadRequest({
      clientId: 'a',
      sourceType: 'DIRECT_BYTES',
      originalSrcUrl: 'https://x',
      capturedVideoId: 'uuid',
    }),
    false
  );
  // Non-object inputs
  assert.equal(isFinalizeVideoUploadRequest(null), false);
  assert.equal(isFinalizeVideoUploadRequest(undefined), false);
  assert.equal(isFinalizeVideoUploadRequest('embed'), false);
});
