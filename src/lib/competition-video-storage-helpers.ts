// Pure helpers for the W#2 competition-scraping video-storage path layout.
// Kept in a standalone module (no Supabase imports, no Next imports, no
// `@/` path aliases) so node:test can load the file directly — same shape
// as src/lib/competition-storage-helpers.ts.
//
// The runtime Supabase Storage operations live in
// src/lib/competition-video-storage.ts and import these helpers.

import {
  ACCEPTED_VIDEO_MIME_TYPES,
  VIDEO_UPLOAD_MAX_BYTES,
  type AcceptedVideoMimeType,
} from './shared-types/competition-scraping.ts';

// Maps an accepted video MIME type to the file extension used in the
// storage path. Kept exhaustive — the unit test asserts every MIME maps.
export function videoExtensionFromMimeType(
  mimeType: AcceptedVideoMimeType
): string {
  switch (mimeType) {
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
      return 'mov';
  }
}

// Composes the storage path for a single captured video. Format:
// `{projectId}/{competitorUrlId}/{capturedVideoId}.{ext}` — same per-Project
// folder layout as competition-storage-helpers.ts so admin-reset can wipe a
// Project's videos via a single list+remove cycle.
export function composeVideoStoragePath(args: {
  projectId: string;
  competitorUrlId: string;
  capturedVideoId: string;
  mimeType: AcceptedVideoMimeType;
}): string {
  const { projectId, competitorUrlId, capturedVideoId, mimeType } = args;
  return `${projectId}/${competitorUrlId}/${capturedVideoId}.${videoExtensionFromMimeType(mimeType)}`;
}

// Composes the storage path for the thumbnail JPEG that goes with a
// direct-bytes video. Same folder as the video, suffixed with `.thumb.jpg`
// so the two files sort together in storage browsers.
export function composeVideoThumbnailStoragePath(args: {
  projectId: string;
  competitorUrlId: string;
  capturedVideoId: string;
}): string {
  const { projectId, competitorUrlId, capturedVideoId } = args;
  return `${projectId}/${competitorUrlId}/${capturedVideoId}.thumb.jpg`;
}

// Re-export of the MIME guard for ergonomic single-import use in route
// handlers. Identical behavior to
// shared-types/competition-scraping.ts → isAcceptedVideoMimeType.
export function isAcceptedVideoMime(
  value: unknown
): value is AcceptedVideoMimeType {
  return (
    typeof value === 'string' &&
    (ACCEPTED_VIDEO_MIME_TYPES as readonly string[]).includes(value)
  );
}

// Pure size-cap check used by the Phase-1 requestVideoUploadUrl route + the
// extension's client-side pre-upload guard per design doc §A.11. Returns
// `null` when the size is acceptable; otherwise an error string suitable
// for the wire (response body or inline form error).
export function validateVideoSize(
  sizeBytes: number
): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(sizeBytes) || sizeBytes < 0) {
    return { ok: false, error: 'Invalid file size' };
  }
  if (sizeBytes > VIDEO_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      error: `Video exceeds ${Math.floor(VIDEO_UPLOAD_MAX_BYTES / (1024 * 1024))} MB cap — try the YouTube/Vimeo embed path instead, or upload directly to YouTube/Vimeo and paste the share URL`,
    };
  }
  return { ok: true };
}

// ─── Embed URL pattern validation (P-27 §A.10) ──────────────────────────
// Lightweight regex-only check used at the popup paste form + embed-walk
// form save path. Does NOT fetch the URL — per §A.10 the trade-off is that
// a typo'd-but-syntactically-valid video ID saves successfully and reveals
// as broken later in the URL detail page renderer. Future polish:
// server-side oEmbed verification if save-time-broken-URL incidents
// accumulate.
const VIDEO_EMBED_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
  // YouTube watch / share / embed variants
  { name: 'youtube', pattern: /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^#]*&)?v=[a-zA-Z0-9_-]{11}/ },
  { name: 'youtube', pattern: /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}/ },
  { name: 'youtube', pattern: /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/ },

  // Vimeo
  { name: 'vimeo', pattern: /^https?:\/\/(?:www\.)?vimeo\.com\/[0-9]+/ },
  { name: 'vimeo', pattern: /^https?:\/\/player\.vimeo\.com\/video\/[0-9]+/ },

  // Wistia
  { name: 'wistia', pattern: /^https?:\/\/[a-zA-Z0-9_-]+\.wistia\.com\/medias\/[a-zA-Z0-9]+/ },
  { name: 'wistia', pattern: /^https?:\/\/fast\.wistia\.net\/embed\/iframe\/[a-zA-Z0-9]+/ },

  // Brightcove
  { name: 'brightcove', pattern: /^https?:\/\/players\.brightcove\.net\/[^/]+\/[^/]+\/index\.html\?videoId=[0-9]+/ },

  // Dailymotion
  { name: 'dailymotion', pattern: /^https?:\/\/(?:www\.)?dailymotion\.com\/video\/[a-zA-Z0-9]+/ },
  { name: 'dailymotion', pattern: /^https?:\/\/dai\.ly\/[a-zA-Z0-9]+/ },

  // Loom
  { name: 'loom', pattern: /^https?:\/\/(?:www\.)?loom\.com\/share\/[a-zA-Z0-9]+/ },
];

// Validates an embed URL against the §A.6 hostname allowlist + per-platform
// path patterns. Returns the matched platform name on success; null on no
// match. The platform name is for downstream rendering decisions (which
// thumbnail URL pattern to use, which oEmbed endpoint, etc.) — not stored
// directly on the row (the row stores sourceType=EMBED + originalSrcUrl).
export function detectEmbedPlatform(url: string): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;
  for (const { name, pattern } of VIDEO_EMBED_PATTERNS) {
    if (pattern.test(trimmed)) return name;
  }
  return null;
}
