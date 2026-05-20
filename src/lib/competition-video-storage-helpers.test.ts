/**
 * Unit tests for the W#2 competition-video-storage pure helpers (P-27 Build #1).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/competition-video-storage-helpers.test.ts
 *
 * Same node:test + node:assert/strict pattern as competition-storage-helpers.test.ts.
 * Helpers are pure (no Supabase / Next imports), so the file loads without
 * resolving any path-aliased modules.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  videoExtensionFromMimeType,
  composeVideoStoragePath,
  composeVideoThumbnailStoragePath,
  isAcceptedVideoMime,
  validateVideoSize,
  detectEmbedPlatform,
} from './competition-video-storage-helpers.ts';
import {
  ACCEPTED_VIDEO_MIME_TYPES,
  VIDEO_UPLOAD_MAX_BYTES,
} from './shared-types/competition-scraping.ts';

/* ── videoExtensionFromMimeType ─────────────────────────────────────── */

test('videoExtensionFromMimeType: video/mp4 → mp4', () => {
  assert.equal(videoExtensionFromMimeType('video/mp4'), 'mp4');
});

test('videoExtensionFromMimeType: video/webm → webm', () => {
  assert.equal(videoExtensionFromMimeType('video/webm'), 'webm');
});

test('videoExtensionFromMimeType: video/quicktime → mov', () => {
  assert.equal(videoExtensionFromMimeType('video/quicktime'), 'mov');
});

test('videoExtensionFromMimeType: exhaustive over ACCEPTED_VIDEO_MIME_TYPES', () => {
  for (const mime of ACCEPTED_VIDEO_MIME_TYPES) {
    const ext = videoExtensionFromMimeType(mime);
    assert.equal(typeof ext, 'string');
    assert.notEqual(ext.length, 0);
  }
});

/* ── composeVideoStoragePath ─────────────────────────────────────────── */

test('composeVideoStoragePath: builds {projectId}/{urlId}/{videoId}.{ext}', () => {
  const path = composeVideoStoragePath({
    projectId: 'proj-1',
    competitorUrlId: 'url-2',
    capturedVideoId: 'vid-3',
    mimeType: 'video/mp4',
  });
  assert.equal(path, 'proj-1/url-2/vid-3.mp4');
});

test('composeVideoStoragePath: webm gets .webm extension', () => {
  const path = composeVideoStoragePath({
    projectId: 'p',
    competitorUrlId: 'u',
    capturedVideoId: 'v',
    mimeType: 'video/webm',
  });
  assert.equal(path, 'p/u/v.webm');
});

test('composeVideoStoragePath: quicktime gets .mov extension', () => {
  const path = composeVideoStoragePath({
    projectId: 'p',
    competitorUrlId: 'u',
    capturedVideoId: 'v',
    mimeType: 'video/quicktime',
  });
  assert.equal(path, 'p/u/v.mov');
});

/* ── composeVideoThumbnailStoragePath ───────────────────────────────── */

test('composeVideoThumbnailStoragePath: builds {projectId}/{urlId}/{videoId}.thumb.jpg', () => {
  const path = composeVideoThumbnailStoragePath({
    projectId: 'p1',
    competitorUrlId: 'u2',
    capturedVideoId: 'v3',
  });
  assert.equal(path, 'p1/u2/v3.thumb.jpg');
});

test('composeVideoThumbnailStoragePath: same folder as video path', () => {
  // The .thumb.jpg suffix means the thumbnail sits in the same per-(project,
  // url) folder as the video itself — admin reset walks one folder, gets both.
  const videoPath = composeVideoStoragePath({
    projectId: 'p',
    competitorUrlId: 'u',
    capturedVideoId: 'v',
    mimeType: 'video/mp4',
  });
  const thumbPath = composeVideoThumbnailStoragePath({
    projectId: 'p',
    competitorUrlId: 'u',
    capturedVideoId: 'v',
  });
  const videoFolder = videoPath.slice(0, videoPath.lastIndexOf('/'));
  const thumbFolder = thumbPath.slice(0, thumbPath.lastIndexOf('/'));
  assert.equal(thumbFolder, videoFolder);
});

/* ── isAcceptedVideoMime ────────────────────────────────────────────── */

test('isAcceptedVideoMime: accepts every type in ACCEPTED_VIDEO_MIME_TYPES', () => {
  for (const mime of ACCEPTED_VIDEO_MIME_TYPES) {
    assert.equal(isAcceptedVideoMime(mime), true, `expected ${mime} to be accepted`);
  }
});

test('isAcceptedVideoMime: rejects video/avi', () => {
  assert.equal(isAcceptedVideoMime('video/avi'), false);
});

test('isAcceptedVideoMime: rejects image/png (wrong family)', () => {
  assert.equal(isAcceptedVideoMime('image/png'), false);
});

test('isAcceptedVideoMime: rejects empty string', () => {
  assert.equal(isAcceptedVideoMime(''), false);
});

test('isAcceptedVideoMime: rejects non-string inputs', () => {
  assert.equal(isAcceptedVideoMime(null), false);
  assert.equal(isAcceptedVideoMime(undefined), false);
  assert.equal(isAcceptedVideoMime(42), false);
  assert.equal(isAcceptedVideoMime({}), false);
});

/* ── validateVideoSize ──────────────────────────────────────────────── */

test('validateVideoSize: accepts 1 byte', () => {
  assert.deepEqual(validateVideoSize(1), { ok: true });
});

test('validateVideoSize: accepts exactly the cap', () => {
  assert.deepEqual(validateVideoSize(VIDEO_UPLOAD_MAX_BYTES), { ok: true });
});

test('validateVideoSize: rejects cap + 1', () => {
  const result = validateVideoSize(VIDEO_UPLOAD_MAX_BYTES + 1);
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.match(result.error, /100 MB cap/);
    assert.match(result.error, /embed/);
  }
});

test('validateVideoSize: rejects negative', () => {
  const result = validateVideoSize(-1);
  assert.equal(result.ok, false);
  if (result.ok === false) {
    assert.match(result.error, /Invalid file size/);
  }
});

test('validateVideoSize: rejects NaN', () => {
  const result = validateVideoSize(Number.NaN);
  assert.equal(result.ok, false);
});

test('validateVideoSize: rejects Infinity', () => {
  const result = validateVideoSize(Number.POSITIVE_INFINITY);
  assert.equal(result.ok, false);
});

test('validateVideoSize: accepts 0 (empty file — Phase-1 doesn’t guard against zero-byte; that’s a different layer)', () => {
  // We accept 0 here because the validator is a size-cap check, not a
  // content-quality check. A separate guard at the route or upload layer
  // can reject zero-byte uploads if needed.
  assert.deepEqual(validateVideoSize(0), { ok: true });
});

/* ── detectEmbedPlatform ────────────────────────────────────────────── */

test('detectEmbedPlatform: YouTube watch URL', () => {
  assert.equal(
    detectEmbedPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'youtube'
  );
});

test('detectEmbedPlatform: YouTube watch URL without www', () => {
  assert.equal(
    detectEmbedPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ'),
    'youtube'
  );
});

test('detectEmbedPlatform: youtu.be short URL', () => {
  assert.equal(detectEmbedPlatform('https://youtu.be/dQw4w9WgXcQ'), 'youtube');
});

test('detectEmbedPlatform: YouTube embed URL', () => {
  assert.equal(
    detectEmbedPlatform('https://www.youtube.com/embed/dQw4w9WgXcQ'),
    'youtube'
  );
});

test('detectEmbedPlatform: Vimeo', () => {
  assert.equal(detectEmbedPlatform('https://vimeo.com/123456789'), 'vimeo');
});

test('detectEmbedPlatform: Vimeo player', () => {
  assert.equal(
    detectEmbedPlatform('https://player.vimeo.com/video/123456789'),
    'vimeo'
  );
});

test('detectEmbedPlatform: Wistia medias URL', () => {
  assert.equal(
    detectEmbedPlatform('https://acme.wistia.com/medias/abc123def'),
    'wistia'
  );
});

test('detectEmbedPlatform: Wistia fast iframe', () => {
  assert.equal(
    detectEmbedPlatform('https://fast.wistia.net/embed/iframe/abc123def'),
    'wistia'
  );
});

test('detectEmbedPlatform: Brightcove', () => {
  assert.equal(
    detectEmbedPlatform(
      'https://players.brightcove.net/12345/default_default/index.html?videoId=987654321'
    ),
    'brightcove'
  );
});

test('detectEmbedPlatform: Dailymotion full', () => {
  assert.equal(
    detectEmbedPlatform('https://www.dailymotion.com/video/x7abc12'),
    'dailymotion'
  );
});

test('detectEmbedPlatform: dai.ly short', () => {
  assert.equal(detectEmbedPlatform('https://dai.ly/x7abc12'), 'dailymotion');
});

test('detectEmbedPlatform: Loom share', () => {
  assert.equal(
    detectEmbedPlatform('https://www.loom.com/share/abc123def456'),
    'loom'
  );
});

test('detectEmbedPlatform: returns null on http vimeo (still accepted — http allowed)', () => {
  // The regex accepts both http and https. This is intentional — some
  // embeds in legacy CMSes serve http. Renders fine inside iframes anyway.
  assert.equal(detectEmbedPlatform('http://vimeo.com/123456789'), 'vimeo');
});

test('detectEmbedPlatform: returns null for empty string', () => {
  assert.equal(detectEmbedPlatform(''), null);
});

test('detectEmbedPlatform: returns null for whitespace', () => {
  assert.equal(detectEmbedPlatform('   '), null);
});

test('detectEmbedPlatform: returns null for non-string', () => {
  assert.equal(detectEmbedPlatform(null as unknown as string), null);
  assert.equal(detectEmbedPlatform(undefined as unknown as string), null);
  assert.equal(detectEmbedPlatform(42 as unknown as string), null);
});

test('detectEmbedPlatform: returns null for plain product URL (not a video host)', () => {
  assert.equal(
    detectEmbedPlatform('https://www.amazon.com/dp/B0CTTF514L'),
    null
  );
});

test('detectEmbedPlatform: returns null for YouTube ID that is wrong length (10 chars)', () => {
  assert.equal(
    detectEmbedPlatform('https://youtu.be/dQw4w9WgXc'), // 10 chars, not 11
    null
  );
});

test('detectEmbedPlatform: trims surrounding whitespace before matching', () => {
  assert.equal(
    detectEmbedPlatform('  https://youtu.be/dQw4w9WgXcQ  '),
    'youtube'
  );
});

test('detectEmbedPlatform: matches YouTube watch URL with extra query params before v=', () => {
  assert.equal(
    detectEmbedPlatform(
      'https://www.youtube.com/watch?feature=youtu.be&v=dQw4w9WgXcQ'
    ),
    'youtube'
  );
});
