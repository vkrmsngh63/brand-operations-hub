// Storage helper wrapper for W#2 Competition Scraping captured images.
//
// Per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3 + PLATFORM_REQUIREMENTS.md
// §10.4 portability requirement, every Supabase Storage SDK call lives in
// this single helper file. Future swap to S3 (or another provider) only
// replaces this file — the API routes and the rest of the codebase
// reference the helper's interface, not Supabase's SDK directly.
//
// The bucket itself (`competition-scraping`, private) is created once via
// the Supabase dashboard at deploy time per §3 + this session's setup
// walkthrough. This file assumes the bucket exists.
//
// Path structure: `{projectId}/{competitorUrlId}/{capturedImageId}.{ext}`
// — per-Project folder so admin reset can wipe a Project's images via a
// list+remove cycle without affecting other Projects' images.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { AcceptedImageMimeType } from '@/lib/shared-types/competition-scraping';
import {
  composeStoragePath,
  splitStoragePath,
} from '@/lib/competition-storage-helpers';

export const COMPETITION_SCRAPING_BUCKET = 'competition-scraping';

// Re-exports — route handlers import from this single module rather than
// reaching into the helpers file directly.
export {
  composeStoragePath,
  extensionFromMimeType,
  isAcceptedMime,
  splitStoragePath,
} from '@/lib/competition-storage-helpers';

// Supabase's createSignedUploadUrl uses the server-default upload-token TTL
// (~2 hours on the current SDK version — there is no expiresIn option on
// createSignedUploadUrl in @supabase/storage-js^2.101). The §3 spec said
// "5-minute TTL" but the SDK does not expose that knob; the practical
// security posture is unchanged because the URL is single-use (the upload
// invalidates the token) and the extension uses it within seconds. We
// echo the SDK's default to the client so the extension knows when its
// uploadUrl would expire.
export const UPLOAD_URL_TTL_SECONDS = 7200; // 2 hours; SDK default

// Read-side TTL — applied when generating signed URLs for thumbnails or
// full-size views in the PLOS web UI. 1 hour per §3.
export const VIEW_URL_TTL_SECONDS = 3600; // 1 hour

// Thumbnail render dimensions — applied via Supabase's on-the-fly image
// transformation. Matches what the multi-table viewer shows in the URL
// detail page per §3.
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 200;

// Recursive list batch size — Supabase storage list endpoint defaults to
// 100 and accepts up to 1000. We use 1000 to minimize round-trips for
// admin reset on Projects with many captures (~300 typical, ~1000 worst
// case per §A pathway projection).
const LIST_BATCH_SIZE = 1000;

// Same-batch remove cap — Supabase remove(paths[]) accepts arbitrary
// length but a single round-trip with hundreds of paths is faster than
// individual calls. We cap at 1000 to match the list batch.
const REMOVE_BATCH_SIZE = 1000;

// ─── Storage operations (require Supabase admin client) ─────────────────

// Returns the bucket-scoped storage helper. Lazy-loads the admin client
// per src/lib/supabase-server.ts pattern; throws at first call if the
// service-role env vars aren't set (matches existing helper behavior).
function bucket(client?: SupabaseClient) {
  return (client ?? getSupabaseAdmin()).storage.from(COMPETITION_SCRAPING_BUCKET);
}

// requestUploadUrl — phase 1 of the two-phase upload (§3).
// Generates the storage path + signed upload URL. No DB write happens
// here; the CapturedImage row is created at the :finalize call.
//
// Returns the URL the extension PUTs the image bytes to, the storage
// path the row will eventually reference, and an ISO timestamp for when
// the URL expires (extension uses this to decide whether to re-request
// before retrying an upload).
export async function requestUploadUrl(args: {
  projectId: string;
  competitorUrlId: string;
  capturedImageId: string;
  mimeType: AcceptedImageMimeType;
}): Promise<{
  uploadUrl: string;
  storagePath: string;
  expiresAt: string;
  token: string;
}> {
  const storagePath = composeStoragePath(args);
  const { data, error } = await bucket().createSignedUploadUrl(storagePath);
  if (error || !data) {
    throw new Error(
      `Failed to create signed upload URL for ${storagePath}: ${error?.message ?? 'unknown error'}`
    );
  }
  const expiresAt = new Date(Date.now() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString();
  return {
    uploadUrl: data.signedUrl,
    storagePath: data.path,
    token: data.token,
    expiresAt,
  };
}

// verifyUploadedFile — server-side check that the extension actually
// uploaded bytes to the signed URL before the client called :finalize.
// Without this, a buggy or compromised client could create DB rows that
// reference missing files, which would surface as broken thumbnails
// later. List the immediate parent folder filtered by filename; presence
// of a matching FileObject confirms the upload landed.
export async function verifyUploadedFile(storagePath: string): Promise<boolean> {
  const split = splitStoragePath(storagePath);
  if (!split) return false;
  const { data, error } = await bucket().list(split.folder, {
    limit: 1,
    search: split.filename,
  });
  if (error || !data) return false;
  return data.some((entry) => entry.name === split.filename);
}

// getThumbnailUrl — small signed URL for the multi-table viewer. The
// transform option triggers Supabase's on-the-fly resize (Pro tier);
// the server stores only the original.
export async function getThumbnailUrl(storagePath: string): Promise<string> {
  const { data, error } = await bucket().createSignedUrl(
    storagePath,
    VIEW_URL_TTL_SECONDS,
    {
      transform: {
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        resize: 'contain',
      },
    }
  );
  if (error || !data) {
    throw new Error(
      `Failed to create thumbnail signed URL for ${storagePath}: ${error?.message ?? 'unknown error'}`
    );
  }
  return data.signedUrl;
}

// getFullSizeUrl — full-resolution signed URL for the URL detail page.
export async function getFullSizeUrl(storagePath: string): Promise<string> {
  const { data, error } = await bucket().createSignedUrl(
    storagePath,
    VIEW_URL_TTL_SECONDS
  );
  if (error || !data) {
    throw new Error(
      `Failed to create full-size signed URL for ${storagePath}: ${error?.message ?? 'unknown error'}`
    );
  }
  return data.signedUrl;
}

// deleteImage — single-file remove. Used by the per-row DELETE handler
// when admin removes one captured image from the PLOS web UI. Idempotent:
// if the file doesn't exist (already deleted, never uploaded), this is
// a no-op. Storage errors propagate to the caller.
export async function deleteImage(storagePath: string): Promise<void> {
  const { error } = await bucket().remove([storagePath]);
  if (error) {
    throw new Error(
      `Failed to delete ${storagePath}: ${error.message}`
    );
  }
}

// wipeProjectImages — admin reset path: walk the project's folder + remove
// every file in batches. Per §9.3, admin reset of W#2 data deletes all
// storage files in `competition-scraping/{projectId}/`. Used by both the
// admin reset endpoint (session-3) and the daily janitor cron (session-3)
// when a Project is cascade-deleted at the DB level.
//
// The Supabase storage list endpoint is shallow (one folder level at a
// time), so we walk the structure manually: list the project folder to
// get competitorUrlId subfolders, then list each subfolder to get the
// image files, then remove all paths in a single round-trip per chunk.
export async function wipeProjectImages(projectId: string): Promise<{
  deletedCount: number;
}> {
  const subfolders = await listAllEntries(`${projectId}`);
  const allPaths: string[] = [];
  for (const sub of subfolders) {
    // Skip stray non-folder entries at the top level (shouldn't happen
    // given the path convention, but defense-in-depth — bail if the
    // entry has no id, which is how Supabase signals folder vs file
    // ambiguity at the storage layer).
    if (!sub.name) continue;
    const files = await listAllEntries(`${projectId}/${sub.name}`);
    for (const file of files) {
      if (!file.name) continue;
      allPaths.push(`${projectId}/${sub.name}/${file.name}`);
    }
  }
  if (allPaths.length === 0) {
    return { deletedCount: 0 };
  }
  let deletedCount = 0;
  for (let i = 0; i < allPaths.length; i += REMOVE_BATCH_SIZE) {
    const chunk = allPaths.slice(i, i + REMOVE_BATCH_SIZE);
    const { data, error } = await bucket().remove(chunk);
    if (error) {
      throw new Error(
        `Failed to wipe images for project ${projectId} at offset ${i}: ${error.message}`
      );
    }
    deletedCount += data?.length ?? chunk.length;
  }
  return { deletedCount };
}

// listAllEntries — paginated wrapper around Supabase's list endpoint.
// Walks the folder one batch at a time until exhausted. Local helper
// only — not exported.
async function listAllEntries(folder: string): Promise<{ name: string }[]> {
  const out: { name: string }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await bucket().list(folder, {
      limit: LIST_BATCH_SIZE,
      offset,
    });
    if (error) {
      throw new Error(`Failed to list ${folder}: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < LIST_BATCH_SIZE) break;
    offset += data.length;
  }
  return out;
}
