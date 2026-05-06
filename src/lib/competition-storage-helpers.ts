// Pure helpers for the W#2 competition-scraping storage path layout.
// Kept in a standalone module (no Supabase imports, no Next imports, no
// `@/` path aliases) so node:test can load the file directly without the
// path-resolution friction documented in CORRECTIONS_LOG 2026-05-07
// (cors split).
//
// The runtime Supabase Storage operations (createSignedUrl, list, remove
// etc.) live in src/lib/competition-storage.ts and import these helpers.

import {
  ACCEPTED_IMAGE_MIME_TYPES,
  type AcceptedImageMimeType,
} from './shared-types/competition-scraping.ts';

// Maps an accepted MIME type to the file extension used in the storage
// path. Keep in sync with ACCEPTED_IMAGE_MIME_TYPES — the unit test
// asserts exhaustiveness.
export function extensionFromMimeType(mimeType: AcceptedImageMimeType): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
  }
}

// Composes the storage path for a single captured image. Format:
// `{projectId}/{competitorUrlId}/{capturedImageId}.{ext}`.
//
// The capturedImageId is generated server-side at requestUpload time (a
// UUID v4) and threaded through to the finalize call so the row's
// storagePath matches what was actually uploaded.
export function composeStoragePath(args: {
  projectId: string;
  competitorUrlId: string;
  capturedImageId: string;
  mimeType: AcceptedImageMimeType;
}): string {
  const { projectId, competitorUrlId, capturedImageId, mimeType } = args;
  return `${projectId}/${competitorUrlId}/${capturedImageId}.${extensionFromMimeType(mimeType)}`;
}

// Splits a storage path into its (folder, filename) parts. Used by the
// upload-verification list call — Supabase's list endpoint takes a folder
// prefix + a filename search. Returns null if the path has no folder
// separator (defensive — every legitimate path has at least two slashes).
export function splitStoragePath(
  storagePath: string
): { folder: string; filename: string } | null {
  const lastSlash = storagePath.lastIndexOf('/');
  if (lastSlash < 0) return null;
  return {
    folder: storagePath.slice(0, lastSlash),
    filename: storagePath.slice(lastSlash + 1),
  };
}

// Re-export of the MIME-type guard for ergonomic single-import use in
// route handlers. Identical behavior to
// shared-types/competition-scraping.ts → isAcceptedImageMimeType.
export function isAcceptedMime(value: unknown): value is AcceptedImageMimeType {
  return (
    typeof value === 'string' &&
    (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(value)
  );
}
