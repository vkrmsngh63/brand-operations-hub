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

// ─── Janitor orphan classification ─────────────────────────────────────
// The daily janitor cron at /api/cron/competition-scraping-janitor walks
// the whole storage bucket, cross-references each file against the
// CapturedImage rows, and deletes orphans. The actual SDK calls live in
// competition-storage.ts; this is the pure logic that decides which
// listed files are orphans.
//
// Per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3:
//   "delete any storage file with no matching DB row" — with a 24h grace
//   period for in-flight uploads (the :finalize call may still be on its
//   way; deleting the file before then would race the extension).

export interface StorageImageEntry {
  storagePath: string;
  // ISO timestamp from Supabase Storage's FileObject.created_at; null on
  // entries where the SDK can't determine creation time (e.g., legacy
  // files predating the metadata feature). Null entries are skipped.
  createdAt: string | null;
}

// Default grace window — 24 hours per §3. The two-phase image upload
// flow (requestUpload → direct PUT → finalize) usually completes in
// seconds; 24h is a generous slack covering long offline-queue drains
// or extension restarts mid-upload.
export const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

// Returns the subset of `entries` that should be deleted as orphans.
// `knownDbPaths` is the set of storagePaths that CapturedImage rows
// reference. `nowMs` and `graceMs` are injected for testability — the
// production caller passes Date.now() + ORPHAN_GRACE_MS.
//
// Classification:
//   - storagePath in knownDbPaths               → keep (has DB row)
//   - createdAt is null / unparseable           → keep (defensive)
//   - createdAt + graceMs >= nowMs              → keep (in grace window)
//   - else                                      → delete (orphan)
//
// The grace check is intentionally `>=` so a file created exactly graceMs
// ago is still considered in-grace; the orphan threshold is strictly
// older than graceMs.
export function findOrphans(
  entries: ReadonlyArray<StorageImageEntry>,
  knownDbPaths: ReadonlySet<string>,
  nowMs: number,
  graceMs: number = ORPHAN_GRACE_MS
): string[] {
  const orphans: string[] = [];
  for (const entry of entries) {
    if (knownDbPaths.has(entry.storagePath)) continue;
    if (!entry.createdAt) continue;
    const created = Date.parse(entry.createdAt);
    if (Number.isNaN(created)) continue;
    if (created + graceMs >= nowMs) continue;
    orphans.push(entry.storagePath);
  }
  return orphans;
}
