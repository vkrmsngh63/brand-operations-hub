// Storage helper wrapper for W#2 Competition Scraping captured videos
// (P-27 Build #1). Sibling of src/lib/competition-storage.ts; same shape +
// conventions so future Supabase → S3 swaps replace these two files only.
//
// Bucket `competition-scraping-videos` (private; signed-URL access) is
// created via scripts/create-competition-scraping-videos-bucket.mjs at
// project setup time; this file assumes the bucket exists.
//
// Per docs/CAPTURED_VIDEOS_DESIGN.md §A.9, two upload paths exist:
//
//   - DIRECT_BYTES (sourceType=DIRECT_BYTES): two-phase signed-URL upload
//     for the video itself + a parallel signed-URL upload for the
//     extracted-thumbnail JPEG. requestVideoUploadUrl returns BOTH URLs
//     in one round-trip; the extension PUTs each, then calls finalize.
//
//   - EMBED (sourceType=EMBED): no Supabase upload. originalSrcUrl on the
//     row holds the YouTube/Vimeo/etc. URL. Thumbnail URL computed at
//     render time from the platform's standard pattern (YouTube img.youtube
//     pattern / Vimeo oEmbed / etc.).
//
// Path structure: `{projectId}/{competitorUrlId}/{capturedVideoId}.{ext}`
// for the video bytes, `.thumb.jpg` suffix for the thumbnail. Per-Project
// folder so admin reset can wipe a Project's videos via a list+remove
// cycle without affecting other Projects' videos.

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type { AcceptedVideoMimeType } from '@/lib/shared-types/competition-scraping';
import {
  composeVideoStoragePath,
  composeVideoThumbnailStoragePath,
} from '@/lib/competition-video-storage-helpers';

export const COMPETITION_SCRAPING_VIDEOS_BUCKET = 'competition-scraping-videos';

// Re-exports — route handlers import from this single module rather than
// reaching into the helpers file directly.
export {
  composeVideoStoragePath,
  composeVideoThumbnailStoragePath,
  isAcceptedVideoMime,
  validateVideoSize,
  videoExtensionFromMimeType,
  detectEmbedPlatform,
} from '@/lib/competition-video-storage-helpers';

// SDK-default upload-token TTL on createSignedUploadUrl — matches the image
// helper's UPLOAD_URL_TTL_SECONDS. Echoed back to the client so the
// extension knows when its uploadUrl would expire.
export const VIDEO_UPLOAD_URL_TTL_SECONDS = 7200; // 2 hours; SDK default

// Read-side TTL — applied when generating signed URLs for video playback
// or thumbnail rendering in the PLOS web UI. 1 hour mirrors §3 image
// pattern.
export const VIDEO_VIEW_URL_TTL_SECONDS = 3600; // 1 hour

// List + remove batch sizes — same as the image helper.
const LIST_BATCH_SIZE = 1000;
const REMOVE_BATCH_SIZE = 1000;

// ─── Storage operations (require Supabase admin client) ─────────────────

function bucket(client?: SupabaseClient) {
  return (client ?? getSupabaseAdmin()).storage.from(
    COMPETITION_SCRAPING_VIDEOS_BUCKET
  );
}

// requestVideoUploadUrl — Phase 1 of the two-phase upload for the
// DIRECT_BYTES path per §A.9. Generates the storage paths + TWO signed
// upload URLs (one for the video bytes, one for the thumbnail JPEG). No
// DB write happens here; the CapturedVideo row is created at the
// :finalize call.
//
// The thumbnail signed URL is returned even if the caller doesn't end up
// uploading a thumbnail — if the canvas frame-grab fails per §A.12, the
// extension simply skips the thumbnail PUT and finalize stores
// thumbnailStoragePath=NULL.
export async function requestVideoUploadUrl(args: {
  projectId: string;
  competitorUrlId: string;
  capturedVideoId: string;
  mimeType: AcceptedVideoMimeType;
}): Promise<{
  videoUploadUrl: string;
  videoStoragePath: string;
  videoToken: string;
  thumbnailUploadUrl: string;
  thumbnailStoragePath: string;
  thumbnailToken: string;
  expiresAt: string;
}> {
  const videoPath = composeVideoStoragePath(args);
  const thumbPath = composeVideoThumbnailStoragePath(args);
  const b = bucket();

  const videoSigned = await b.createSignedUploadUrl(videoPath);
  if (videoSigned.error || !videoSigned.data) {
    throw new Error(
      `Failed to create signed video upload URL for ${videoPath}: ${
        videoSigned.error?.message ?? 'unknown error'
      }`
    );
  }
  const thumbSigned = await b.createSignedUploadUrl(thumbPath);
  if (thumbSigned.error || !thumbSigned.data) {
    throw new Error(
      `Failed to create signed thumbnail upload URL for ${thumbPath}: ${
        thumbSigned.error?.message ?? 'unknown error'
      }`
    );
  }

  const expiresAt = new Date(
    Date.now() + VIDEO_UPLOAD_URL_TTL_SECONDS * 1000
  ).toISOString();

  return {
    videoUploadUrl: videoSigned.data.signedUrl,
    videoStoragePath: videoSigned.data.path,
    videoToken: videoSigned.data.token,
    thumbnailUploadUrl: thumbSigned.data.signedUrl,
    thumbnailStoragePath: thumbSigned.data.path,
    thumbnailToken: thumbSigned.data.token,
    expiresAt,
  };
}

// finalizeVideoUpload — server-side check that the extension actually
// uploaded the video bytes (and optionally the thumbnail) before the
// CapturedVideo row is created. Returns flags the caller uses to populate
// the row's storagePath / thumbnailStoragePath columns (NULL when the
// corresponding object isn't present).
//
// Idempotent on the storage side — checking existence twice is harmless.
// The CapturedVideo row creation itself is idempotent via the clientId
// unique constraint at the DB layer (route handler's responsibility).
export async function finalizeVideoUpload(args: {
  videoStoragePath: string;
  thumbnailStoragePath: string;
}): Promise<{
  videoPresent: boolean;
  thumbnailPresent: boolean;
}> {
  const [videoPresent, thumbnailPresent] = await Promise.all([
    storageObjectExists(args.videoStoragePath),
    storageObjectExists(args.thumbnailStoragePath),
  ]);
  return { videoPresent, thumbnailPresent };
}

// getVideoSignedUrl — full-resolution playback URL for the URL detail page
// inline `<video>` element + the saved-video indicator overlay click-to-play
// flow.
export async function getVideoSignedUrl(
  storagePath: string,
  expiresInSeconds: number = VIDEO_VIEW_URL_TTL_SECONDS
): Promise<string> {
  const { data, error } = await bucket().createSignedUrl(
    storagePath,
    expiresInSeconds
  );
  if (error || !data) {
    throw new Error(
      `Failed to create video signed URL for ${storagePath}: ${
        error?.message ?? 'unknown error'
      }`
    );
  }
  return data.signedUrl;
}

// getVideoThumbnailUrl — signed URL for the thumbnail JPEG. Returns null
// if the row has no thumbnailStoragePath (sourceType=EMBED or extraction
// failure per §A.12). Callers fall back to the platform's standard
// thumbnail URL (YouTube img.youtube / Vimeo oEmbed / etc.) or the
// generic ▶️ placeholder.
export async function getVideoThumbnailUrl(
  thumbnailStoragePath: string | null,
  expiresInSeconds: number = VIDEO_VIEW_URL_TTL_SECONDS
): Promise<string | null> {
  if (!thumbnailStoragePath) return null;
  const { data, error } = await bucket().createSignedUrl(
    thumbnailStoragePath,
    expiresInSeconds
  );
  if (error || !data) {
    throw new Error(
      `Failed to create thumbnail signed URL for ${thumbnailStoragePath}: ${
        error?.message ?? 'unknown error'
      }`
    );
  }
  return data.signedUrl;
}

// deleteVideo — single-row remove. Deletes BOTH the video bytes and the
// thumbnail (if present). Idempotent — missing files are no-ops.
export async function deleteVideo(args: {
  videoStoragePath: string | null;
  thumbnailStoragePath: string | null;
}): Promise<void> {
  const paths = [args.videoStoragePath, args.thumbnailStoragePath].filter(
    (p): p is string => typeof p === 'string' && p.length > 0
  );
  if (paths.length === 0) return;
  const { error } = await bucket().remove(paths);
  if (error) {
    throw new Error(`Failed to delete video objects: ${error.message}`);
  }
}

// wipeProjectVideos — admin reset path: walk the project's folder + remove
// every file in batches. Mirrors src/lib/competition-storage.ts
// wipeProjectImages — Supabase storage list is shallow so we walk one
// folder level at a time, then bulk-remove.
export async function wipeProjectVideos(projectId: string): Promise<{
  deletedCount: number;
}> {
  const subfolders = await listAllEntries(`${projectId}`);
  const allPaths: string[] = [];
  for (const sub of subfolders) {
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
        `Failed to wipe videos for project ${projectId} at offset ${i}: ${error.message}`
      );
    }
    deletedCount += data?.length ?? chunk.length;
  }
  return { deletedCount };
}

// ─── Internal helpers ───────────────────────────────────────────────────

interface ListedEntry {
  name: string;
  id: string | null;
  created_at: string | null;
}

async function listAllEntries(folder: string): Promise<ListedEntry[]> {
  const out: ListedEntry[] = [];
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

async function storageObjectExists(storagePath: string): Promise<boolean> {
  const lastSlash = storagePath.lastIndexOf('/');
  if (lastSlash < 0) return false;
  const folder = storagePath.slice(0, lastSlash);
  const filename = storagePath.slice(lastSlash + 1);
  const { data, error } = await bucket().list(folder, {
    limit: 1,
    search: filename,
  });
  if (error || !data) return false;
  return data.some((entry) => entry.name === filename);
}
