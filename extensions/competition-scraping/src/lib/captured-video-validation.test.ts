// Unit tests for captured-video-validation.ts — P-27 (2026-05-22)
// form-level validator that gates the video-capture form's Save button.
//
// Same fixture-free style as captured-image-validation.test.ts: the
// validator is pure (no DOM, no chrome.*, no fetch). A deterministic
// mintClientId is injected so payload.clientId is predictable in assertions.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTagsForVideo,
  validateCapturedVideoDraft,
  type CapturedVideoDraft,
} from './captured-video-validation.ts';

const FIXED_CLIENT_ID = 'test-client-id-1234';
const mintFixed = (): string => FIXED_CLIENT_ID;

function baseDirectDraft(): CapturedVideoDraft {
  return {
    competitorUrlId: 'url-1',
    sourceType: 'DIRECT_BYTES',
    originalSrcUrl: 'https://m.media-amazon.com/video/demo.mp4',
    mimeType: 'video/mp4',
    fileSize: 5 * 1024 * 1024,
    videoCategory: 'product-demo',
    composition: '',
    embeddedText: '',
    tags: [],
  };
}

function baseEmbedDraft(): CapturedVideoDraft {
  return {
    competitorUrlId: 'url-1',
    sourceType: 'EMBED',
    originalSrcUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mimeType: '',
    fileSize: 0,
    videoCategory: 'product-demo',
    composition: '',
    embeddedText: '',
    tags: [],
  };
}

describe('validateCapturedVideoDraft — DIRECT_BYTES branch', () => {
  it('accepts a valid mp4 draft and returns a server-ready payload', () => {
    const r = validateCapturedVideoDraft(baseDirectDraft(), mintFixed);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.payload.clientId, FIXED_CLIENT_ID);
    assert.equal(r.payload.competitorUrlId, 'url-1');
    assert.equal(r.payload.sourceType, 'DIRECT_BYTES');
    assert.equal(
      r.payload.originalSrcUrl,
      'https://m.media-amazon.com/video/demo.mp4',
    );
    assert.equal(r.payload.mimeType, 'video/mp4');
    assert.equal(r.payload.videoCategory, 'product-demo');
    assert.equal(r.payload.composition, null);
    assert.equal(r.payload.embeddedText, null);
    assert.deepEqual(r.payload.tags, []);
    assert.equal(r.payload.embedPlatform, null);
  });

  it('rejects when competitorUrlId is empty', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), competitorUrlId: '' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'url-required');
  });

  it('rejects when competitorUrlId is whitespace-only', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), competitorUrlId: '   ' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'url-required');
  });

  it('rejects when sourceType is not a known video source type', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), sourceType: 'BOGUS' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'source-type-invalid');
  });

  it('rejects when fileSize is 0 (no bytes to upload)', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), fileSize: 0 },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'bytes-required');
  });

  it('rejects when fileSize exceeds the 100 MB cap', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), fileSize: 101 * 1024 * 1024 },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'video-too-large');
  });

  it('accepts fileSize exactly at the 100 MB cap', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), fileSize: 100 * 1024 * 1024 },
      mintFixed,
    );
    assert.equal(r.ok, true);
  });

  it('rejects when mimeType is provided but not in the accepted set', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), mimeType: 'video/x-msvideo' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'video-mime-rejected');
  });

  it('accepts an empty mimeType (background resolves from Content-Type)', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), mimeType: '' },
      mintFixed,
    );
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.payload.mimeType, null);
  });

  it('accepts video/webm and video/quicktime in addition to mp4', () => {
    const webm = validateCapturedVideoDraft(
      { ...baseDirectDraft(), mimeType: 'video/webm' },
      mintFixed,
    );
    assert.equal(webm.ok, true);
    const mov = validateCapturedVideoDraft(
      { ...baseDirectDraft(), mimeType: 'video/quicktime' },
      mintFixed,
    );
    assert.equal(mov.ok, true);
  });

  it('rejects when videoCategory is empty', () => {
    const r = validateCapturedVideoDraft(
      { ...baseDirectDraft(), videoCategory: '' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'category-required');
  });

  it('trims videoCategory + composition + embeddedText in the payload', () => {
    const r = validateCapturedVideoDraft(
      {
        ...baseDirectDraft(),
        videoCategory: '  product-demo  ',
        composition: '  shows the product in use  ',
        embeddedText: '  Free Shipping  ',
      },
      mintFixed,
    );
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.payload.videoCategory, 'product-demo');
    assert.equal(r.payload.composition, 'shows the product in use');
    assert.equal(r.payload.embeddedText, 'Free Shipping');
  });
});

describe('validateCapturedVideoDraft — EMBED branch', () => {
  it('accepts a YouTube watch URL and returns embedPlatform=youtube', () => {
    const r = validateCapturedVideoDraft(baseEmbedDraft(), mintFixed);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.payload.sourceType, 'EMBED');
    assert.equal(r.payload.embedPlatform, 'youtube');
    assert.equal(r.payload.mimeType, null);
  });

  it('accepts a Vimeo player URL and returns embedPlatform=vimeo', () => {
    const r = validateCapturedVideoDraft(
      {
        ...baseEmbedDraft(),
        originalSrcUrl: 'https://player.vimeo.com/video/12345678',
      },
      mintFixed,
    );
    if (!r.ok) assert.fail();
    assert.equal(r.payload.embedPlatform, 'vimeo');
  });

  it('rejects when originalSrcUrl is empty', () => {
    const r = validateCapturedVideoDraft(
      { ...baseEmbedDraft(), originalSrcUrl: '' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'embed-url-required');
  });

  it('rejects when originalSrcUrl does not match any known embed pattern', () => {
    const r = validateCapturedVideoDraft(
      { ...baseEmbedDraft(), originalSrcUrl: 'https://example.com/video' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'embed-url-unrecognized');
  });

  it('rejects when videoCategory is empty (same gate as DIRECT_BYTES)', () => {
    const r = validateCapturedVideoDraft(
      { ...baseEmbedDraft(), videoCategory: '' },
      mintFixed,
    );
    if (r.ok) assert.fail();
    assert.equal(r.reason, 'category-required');
  });

  it('passes the embed URL through to payload.originalSrcUrl trimmed', () => {
    const r = validateCapturedVideoDraft(
      {
        ...baseEmbedDraft(),
        originalSrcUrl: '  https://youtu.be/dQw4w9WgXcQ  ',
      },
      mintFixed,
    );
    if (!r.ok) assert.fail();
    assert.equal(r.payload.originalSrcUrl, 'https://youtu.be/dQw4w9WgXcQ');
  });
});

describe('normalizeTagsForVideo', () => {
  it('trims + dedupes case-insensitively + preserves first-seen order', () => {
    const out = normalizeTagsForVideo([
      '  alpha  ',
      'Beta',
      'ALPHA',
      '',
      'gamma',
      'BETA',
    ]);
    assert.deepEqual(out, ['alpha', 'Beta', 'gamma']);
  });

  it('drops non-string + empty + whitespace-only entries', () => {
    const out = normalizeTagsForVideo([
      'real',
      '',
      '   ',
      // @ts-expect-error — defensive coverage of typed-as-string-but-isn't
      null,
      // @ts-expect-error
      undefined,
      // @ts-expect-error
      42,
    ]);
    assert.deepEqual(out, ['real']);
  });

  it('returns an empty array for an empty input', () => {
    assert.deepEqual(normalizeTagsForVideo([]), []);
  });
});
