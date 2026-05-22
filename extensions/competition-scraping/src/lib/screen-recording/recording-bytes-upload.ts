// Smart-client SCREEN_RECORDING upload orchestrator — P-45 Build #1b
// (2026-05-22).
//
// Per CAPTURED_VIDEOS_DESIGN.md §C.16, recording bytes can hit Supabase
// via THREE possible architectures:
//
//   (1) Smart-client (this file): content-script orchestrates Phase 1 + 3
//       via the background (vklf.com CORS allowlist is chrome-extension://*
//       only) and PUTs Phase 2 video bytes directly to the returned signed
//       URL from the content-script's host-page origin. Supabase signed
//       URLs return Access-Control-Allow-Origin: * so any origin's PUT
//       succeeds. No size ceiling — fetch handles 1 GB the same as 1 KB.
//
//   (2) Base64-through-message: content-script base64-encodes the Blob +
//       sends via chrome.runtime.sendMessage to background → background
//       PUTs to Supabase. Practical size ceiling around 64 MB on
//       chrome.runtime.sendMessage in MV3; base64 adds ~33% overhead.
//
//   (3) Content-script-relay-bytes: content-script gets the signed URL
//       from background, then sends the Blob to background which PUTs.
//       Same size ceiling problem.
//
// (1) was picked. The recorded webm caps near 56 MB at 720p × vp9 × 3 min;
// fast-fetch DIRECT_BYTES already uses the same pattern.

import { PlosApiError } from '../errors.ts';
import {
  submitVideoScreenRecordingFinalize,
  submitVideoScreenRecordingRequestUpload,
} from '../content-script/api-bridge.ts';
import type {
  AcceptedVideoMimeType,
  CapturedVideo,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';

export interface UploadScreenRecordingInput {
  projectId: string;
  urlId: string;
  /** The webm Blob from MediaRecorder. The fetch() PUT body — bytes
   *  stream through; no buffering through chrome.runtime IPC. */
  blob: Blob;
  /** First-frame JPEG from thumbnail-extraction.ts. NULL when extraction
   *  failed — finalize then stores NULL thumbnailStoragePath per §A.12 and
   *  the renderer falls back to the browser's native <video> play icon. */
  thumbnailBlob: Blob | null;
  /** Page URL where the user invoked screen recording. Stored as the row's
   *  originalSrcUrl per §C.16 (recordings have no fetchable URL; page URL
   *  is the closest semantic equivalent). */
  pageUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  videoCategory: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
}

/**
 * Normalizes MediaRecorder's full MIME (e.g. 'video/webm;codecs=vp9,opus')
 * down to the bare base type the server's strict-tuple validator accepts.
 *
 * MediaRecorder produces a Content-Type with codec params (mandatory for
 * the browser's own playback negotiation). The shared-types validator
 * isAcceptedVideoMimeType does a strict includes() over ACCEPTED_VIDEO_MIME_TYPES
 * which lists base types only ('video/mp4', 'video/webm', 'video/quicktime').
 * Stripping codec params keeps the validator strict + lets the actual PUT
 * preserve the codec via the Content-Type header (browsers + Supabase
 * pass-through any string).
 */
export function normalizeBlobMime(rawMime: string): AcceptedVideoMimeType {
  const base = (rawMime.split(';')[0] ?? '').trim().toLowerCase();
  if (base === 'video/mp4' || base === 'video/webm' || base === 'video/quicktime') {
    return base;
  }
  // Defensive fallback — MediaRecorder always picks from
  // RECORDING_MIMETYPE_PREFERENCES, so any unknown MIME here means
  // something has changed in the pipeline. Default to 'video/webm' since
  // that's what the encoder fallback chain ends at.
  return 'video/webm';
}

/**
 * Runs Phase 1 (signed-URL mint via background) + Phase 2 (direct PUT to
 * Supabase) + Phase 3 (finalize via background). Returns the finalized
 * CapturedVideo row.
 *
 * Phase 2 PUT errors throw to the caller — the form catches them and
 * shows a save-failure message. Thumbnail PUT failures are swallowed
 * (degraded to NULL thumbnail per §A.12) since the video is the
 * load-bearing data.
 */
export async function uploadScreenRecording(
  input: UploadScreenRecordingInput,
): Promise<CapturedVideo> {
  const clientId = crypto.randomUUID();
  const mimeType = normalizeBlobMime(input.blob.type || 'video/webm');
  const fileSize = input.blob.size;

  // Phase 1 — proxied through background.
  const phase1 = await submitVideoScreenRecordingRequestUpload({
    projectId: input.projectId,
    urlId: input.urlId,
    clientId,
    mimeType,
    fileSize,
  });

  // Phase 2a — direct PUT of the video bytes from content-script origin.
  // Send the normalized base MIME ('video/webm') as Content-Type, NOT the
  // Blob's full MIME with codec params ('video/webm;codecs=vp9,opus').
  // Supabase Storage validates Content-Type against the bucket's
  // allowedMimeTypes list (['video/mp4', 'video/webm', 'video/quicktime'])
  // via strict-equal; the codec-laden full MIME doesn't match any entry and
  // the PUT 400s. The encoded codec is still preserved in the bytes
  // themselves; browsers + servers infer it from container metadata.
  const videoPutResp = await fetch(phase1.videoUploadUrl, {
    method: 'PUT',
    body: input.blob,
    headers: { 'Content-Type': mimeType },
  });
  if (!videoPutResp.ok) {
    throw new PlosApiError(
      videoPutResp.status,
      `Failed to upload recording bytes (HTTP ${String(videoPutResp.status)}).`,
    );
  }

  // Phase 2b — direct PUT of the thumbnail JPEG (best-effort).
  let thumbnailUploaded = false;
  if (input.thumbnailBlob) {
    try {
      const thumbResp = await fetch(phase1.thumbnailUploadUrl, {
        method: 'PUT',
        body: input.thumbnailBlob,
        headers: { 'Content-Type': 'image/jpeg' },
      });
      if (thumbResp.ok) {
        thumbnailUploaded = true;
      }
    } catch {
      // §A.12 NULL-thumbnail fallback — never blocks the save.
    }
  }

  // Phase 3 — proxied through background. Omits thumbnailStoragePath when
  // the thumbnail wasn't uploaded so the row stores NULL per §A.12.
  return submitVideoScreenRecordingFinalize({
    projectId: input.projectId,
    urlId: input.urlId,
    clientId,
    capturedVideoId: phase1.capturedVideoId,
    videoStoragePath: phase1.videoStoragePath,
    ...(thumbnailUploaded
      ? { thumbnailStoragePath: phase1.thumbnailStoragePath }
      : {}),
    mimeType,
    fileSize,
    durationSeconds: input.durationSeconds,
    width: input.width,
    height: input.height,
    originalSrcUrl: input.pageUrl,
    videoCategory: input.videoCategory,
    composition: input.composition,
    embeddedText: input.embeddedText,
    tags: input.tags,
  });
}
