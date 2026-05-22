// Pure-logic helpers for the P-27 (2026-05-22) Module 2 video-capture path.
// Parallels captured-image-validation.ts shape — kept dependency-free so
// node:test exercises it without DOM or chrome.* surfaces.
//
// Three concerns:
//   1. Form-level validation — given a draft video-capture payload, return
//      a typed result the form uses to gate the Save button. Branches on
//      `sourceType` (DIRECT_BYTES / SCREEN_RECORDING / EMBED):
//        - DIRECT_BYTES + SCREEN_RECORDING — must have a valid MIME + a
//          non-zero byte count under the 100 MB cap. P-45 Build #1b
//          (2026-05-22) broadened the bytes-required path to include
//          SCREEN_RECORDING — recordings carry bytes just like fast-fetch
//          videos do (only EMBED skips the bytes path).
//        - EMBED — must have a URL matching one of the recognized
//          video-embed patterns (delegates to detectEmbedPlatform per
//          design doc §A.10).
//   2. clientId minting — shared default with captured-image via
//      crypto.randomUUID(); the form mints once per Save click and reuses
//      across retries so the server's idempotency path catches duplicates.
//   3. Tag normalization — dedupes + trims + preserves first-seen order
//      (mirror of captured-image's normalizeTagsForImage).

import {
  VIDEO_UPLOAD_MAX_BYTES,
  isAcceptedVideoMimeType,
  isVideoSourceType,
  type AcceptedVideoMimeType,
  type VideoSourceType,
} from '../../../../src/lib/shared-types/competition-scraping.ts';
import { detectEmbedPlatform } from '../../../../src/lib/competition-video-storage-helpers.ts';

/** Validation outcome for the video-capture form draft. */
export type CapturedVideoDraftValidation =
  | { ok: true; payload: CapturedVideoValidatedPayload }
  | { ok: false; reason: CapturedVideoValidationReason };

export type CapturedVideoValidationReason =
  | 'url-required'
  | 'source-type-invalid'
  | 'embed-url-required'
  | 'embed-url-unrecognized'
  | 'bytes-required'
  | 'video-mime-rejected'
  | 'video-too-large'
  | 'category-required';

/**
 * Resolved payload after a successful validation. The form passes this into
 * the api-bridge `submitVideoCapture` call which packages it into the
 * BackgroundRequest envelope.
 */
export interface CapturedVideoValidatedPayload {
  clientId: string;
  competitorUrlId: string;
  sourceType: VideoSourceType;
  /** Always present.
   *   - DIRECT_BYTES: the page-host URL the bytes came from.
   *   - EMBED: the YouTube / Vimeo / etc. URL that goes on the row. */
  originalSrcUrl: string;
  /** Echoed back to the server at finalize time. Direct-bytes only;
   *  populated by the form from the helper's mimeType hint OR resolved
   *  from the CDN's Content-Type by the background's fetchVideoBytes(). */
  mimeType: AcceptedVideoMimeType | null;
  videoCategory: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
  /** EMBED only — the detected platform short name (youtube / vimeo / etc).
   *  Used by the form for confirmation copy ("This looks like a YouTube
   *  embed."); the row stores `originalSrcUrl` only. Null when sourceType
   *  is DIRECT_BYTES. */
  embedPlatform: string | null;
}

/**
 * Draft shape the form gathers from the user before Save. The form passes
 * this into validateCapturedVideoDraft; on success the validator returns a
 * server-ready payload (clientId minted internally).
 *
 * DIRECT_BYTES branch: `fileSize` + `mimeType` are required.
 * EMBED branch:        `fileSize` is 0; `mimeType` is the empty string.
 *                      `originalSrcUrl` MUST match a recognized pattern.
 */
export interface CapturedVideoDraft {
  /** CompetitorUrl row id the captured video will attach to. Required. */
  competitorUrlId: string;
  /** Either 'DIRECT_BYTES' (right-click on a <video>) or 'EMBED' (right-
   *  click on a recognized iframe OR a popup paste form — Build #4). The
   *  Build #3 content-script form sets this from the helper's result. */
  sourceType: string;
  /** Always present. The form fills this from the helper's `src` field. */
  originalSrcUrl: string;
  /** Direct-bytes path: MIME the form expects (hint from <source type> OR
   *  the CDN's Content-Type after the background's fetchVideoBytes()).
   *  Embed path: pass empty string. */
  mimeType: string;
  /** Direct-bytes path: byte length of the video.
   *  Embed path: pass 0. */
  fileSize: number;
  /** Video-category vocab value. Required for both paths. */
  videoCategory: string;
  /** Free text describing what's in / about the video. Optional. */
  composition: string;
  /** Free text of text overlay / on-screen text in the video. Optional. */
  embeddedText: string;
  /** Tags chip-list — same normalization as captured-image tags. */
  tags: readonly string[];
}

export function validateCapturedVideoDraft(
  draft: CapturedVideoDraft,
  mintClientId: () => string = defaultMintClientId,
): CapturedVideoDraftValidation {
  if (!draft.competitorUrlId.trim()) {
    return { ok: false, reason: 'url-required' };
  }
  if (!isVideoSourceType(draft.sourceType)) {
    return { ok: false, reason: 'source-type-invalid' };
  }
  if (!draft.originalSrcUrl.trim()) {
    // Both paths require an originalSrcUrl. Embed surfaces a more specific
    // error below; direct-bytes surfaces this one because the URL came from
    // the helper and missing means the user right-clicked something we
    // couldn't resolve.
    return {
      ok: false,
      reason: draft.sourceType === 'EMBED' ? 'embed-url-required' : 'url-required',
    };
  }
  if (!draft.videoCategory.trim()) {
    return { ok: false, reason: 'category-required' };
  }

  let mimeType: AcceptedVideoMimeType | null = null;
  let embedPlatform: string | null = null;

  if (
    draft.sourceType === 'DIRECT_BYTES' ||
    draft.sourceType === 'SCREEN_RECORDING'
  ) {
    if (draft.fileSize <= 0) {
      return { ok: false, reason: 'bytes-required' };
    }
    if (draft.fileSize > VIDEO_UPLOAD_MAX_BYTES) {
      return { ok: false, reason: 'video-too-large' };
    }
    // mimeType validation: required + must be an accepted video MIME. The
    // form may pass an empty string when the page didn't surface a hint;
    // in that case we accept the empty string and let the background's
    // fetchVideoBytes() resolve the MIME from Content-Type (and re-validate
    // server-side). Wrong-but-non-empty MIME is rejected here so the user
    // gets a clean error before the upload starts.
    //
    // P-45 Build #1b: SCREEN_RECORDING follows the same MIME validation
    // path as DIRECT_BYTES — MediaRecorder always produces a MIME from
    // ACCEPTED_VIDEO_MIME_TYPES (after the codec-suffix is normalized off
    // in recording-bytes-upload.ts's normalizeBlobMime helper).
    if (draft.mimeType && !isAcceptedVideoMimeType(draft.mimeType)) {
      return { ok: false, reason: 'video-mime-rejected' };
    }
    mimeType = isAcceptedVideoMimeType(draft.mimeType) ? draft.mimeType : null;
  } else {
    // EMBED branch — URL must match a recognized embed pattern per §A.10.
    const detected = detectEmbedPlatform(draft.originalSrcUrl);
    if (!detected) {
      return { ok: false, reason: 'embed-url-unrecognized' };
    }
    embedPlatform = detected;
  }

  const payload: CapturedVideoValidatedPayload = {
    clientId: mintClientId(),
    competitorUrlId: draft.competitorUrlId,
    sourceType: draft.sourceType,
    originalSrcUrl: draft.originalSrcUrl.trim(),
    mimeType,
    videoCategory: draft.videoCategory.trim(),
    composition: draft.composition.trim() ? draft.composition.trim() : null,
    embeddedText: draft.embeddedText.trim() ? draft.embeddedText.trim() : null,
    tags: normalizeTagsForVideo(draft.tags),
    embedPlatform,
  };
  return { ok: true, payload };
}

/**
 * Dedupes + trims tags, drops empties, preserves first-seen order. Mirrors
 * captured-image-validation's normalizeTagsForImage so chip-list behavior
 * stays identical across forms.
 */
export function normalizeTagsForVideo(input: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Default clientId minter. Mirrors captured-image-validation's default.
 */
export function defaultMintClientId(): string {
  return crypto.randomUUID();
}
