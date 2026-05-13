// Pure-logic helpers for the Module 2 image-capture path (session 5
// 2026-05-12-i). Mirrors captured-text-validation.ts shape so the form
// reads the same way as the text-capture form one session earlier; kept
// dependency-free so node:test exercises it without DOM or chrome.* surfaces.
//
// Three concerns:
//   1. Form-level validation — given a draft image-capture payload, return
//      a typed result the form uses to gate the Save button.
//   2. clientId minting — shared default with captured-text via
//      crypto.randomUUID(); the form mints once per Save click so retries
//      land on the server's idempotency path per STACK_DECISIONS §9.2.
//   3. Pre-flight MIME + size checks — confirm the picked file is one of
//      the three accepted MIME types per STACK_DECISIONS §3 and that the
//      byte length fits inside the IMAGE_UPLOAD_MAX_BYTES cap.
//
// URL pre-selection (pickInitialUrl) is reused from captured-text-validation
// rather than duplicated — the function is domain-neutral (matches a page
// URL against saved CompetitorUrl rows via the platform module's
// canonicalize step plus normalizeUrlForRecognition).

import {
  IMAGE_UPLOAD_MAX_BYTES,
  isAcceptedImageMimeType,
  isImageSourceType,
  type AcceptedImageMimeType,
  type ImageSourceType,
} from '../../../../src/lib/shared-types/competition-scraping.ts';

/** Validation outcome for the image-capture form draft. */
export type CapturedImageDraftValidation =
  | { ok: true; payload: CapturedImageValidatedPayload }
  | { ok: false; reason: CapturedImageValidationReason };

export type CapturedImageValidationReason =
  | 'url-required'
  | 'image-required'
  | 'image-mime-rejected'
  | 'image-too-large'
  | 'category-required'
  | 'source-type-invalid';

/**
 * Resolved payload after a successful validation. The form passes this into
 * the api-bridge `submitImageCapture` call which packages it into the
 * BackgroundRequest envelope.
 */
export interface CapturedImageValidatedPayload {
  clientId: string;
  competitorUrlId: string;
  mimeType: AcceptedImageMimeType;
  sourceType: ImageSourceType;
  imageCategory: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
}

/**
 * Draft shape the form gathers from the user before Save. The form passes
 * this into validateCapturedImageDraft; on success the validator returns a
 * server-ready payload (clientId minted internally) + the file blob for
 * the upload phase.
 */
export interface CapturedImageDraft {
  /** CompetitorUrl row id the captured image will attach to. Required. */
  competitorUrlId: string;
  /** The MIME type reported by the host page (Chrome's
   * `info.srcUrl`-derived blob `.type`, OR the canvas-export `toBlob`'s
   * type for the future region-screenshot path). Must be one of
   * ACCEPTED_IMAGE_MIME_TYPES. Required. */
  mimeType: string;
  /** Byte length of the image. Required — server enforces same cap at
   * requestUpload; we mirror the cap here so the form surfaces a friendly
   * error without a server round-trip. */
  fileSize: number;
  /** Either 'regular' (right-click → "Add to PLOS — Image") or
   * 'region-screenshot' (future session 6 — the captureVisibleTab + canvas
   * crop path). Required so the server-side row records which gesture
   * produced the image. */
  sourceType: string;
  /** Image-category vocab value. Required — same categorization principle
   * as captured text (§A.7 framing). */
  imageCategory: string;
  /** Free text describing what's IN the image. Optional per §A.15 brief
   * (user populates manually today; future AI vision model auto-fills). */
  composition: string;
  /** Free text of text that appears INSIDE the image (overlay, watermark).
   * Optional per §A.15 — same future-AI-fill story as composition. */
  embeddedText: string;
  /** Tags chip-list — same normalization as captured-text tags. */
  tags: readonly string[];
}

/**
 * Validates a draft captured-image payload and returns a server-ready
 * request object on success. The clientId is generated here via
 * `crypto.randomUUID()` — caller doesn't have to remember to mint one.
 * Per §9.2 the clientId must be stable across retries, so the form should
 * call this ONCE per Save click and reuse the resulting payload across
 * retries. The `mintClientId` optional parameter exists for tests + future
 * WAL replay.
 */
export function validateCapturedImageDraft(
  draft: CapturedImageDraft,
  mintClientId: () => string = defaultMintClientId,
): CapturedImageDraftValidation {
  if (!draft.competitorUrlId.trim()) {
    return { ok: false, reason: 'url-required' };
  }
  if (!isAcceptedImageMimeType(draft.mimeType)) {
    // No bytes OR wrong MIME — distinguish for the form's error copy.
    if (!draft.mimeType || draft.fileSize <= 0) {
      return { ok: false, reason: 'image-required' };
    }
    return { ok: false, reason: 'image-mime-rejected' };
  }
  if (draft.fileSize <= 0) {
    return { ok: false, reason: 'image-required' };
  }
  if (draft.fileSize > IMAGE_UPLOAD_MAX_BYTES) {
    return { ok: false, reason: 'image-too-large' };
  }
  if (!isImageSourceType(draft.sourceType)) {
    return { ok: false, reason: 'source-type-invalid' };
  }
  if (!draft.imageCategory.trim()) {
    return { ok: false, reason: 'category-required' };
  }

  const payload: CapturedImageValidatedPayload = {
    clientId: mintClientId(),
    competitorUrlId: draft.competitorUrlId,
    mimeType: draft.mimeType,
    sourceType: draft.sourceType,
    imageCategory: draft.imageCategory.trim(),
    composition: draft.composition.trim() ? draft.composition.trim() : null,
    embeddedText: draft.embeddedText.trim() ? draft.embeddedText.trim() : null,
    tags: normalizeTagsForImage(draft.tags),
  };
  return { ok: true, payload };
}

/**
 * Dedupes + trims tags, drops empties, preserves first-seen order. Mirrors
 * captured-text-validation's normalizeTags so the chip-list behavior is
 * identical across forms.
 */
export function normalizeTagsForImage(input: readonly string[]): string[] {
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
 * Default clientId minter. See captured-text-validation.ts defaultMintClientId
 * for the runtime-availability story (content script / SW / popup / node).
 */
export function defaultMintClientId(): string {
  return crypto.randomUUID();
}
