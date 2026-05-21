// Typed message protocol between background service worker and content
// scripts.
//
// TWO directions:
//   - Background → Content (one-way push): ContentScriptMessage.
//     - `open-url-add-form` (session 3): right-click context-menu fallback
//       for URL capture per §5 guardrail #6. Carries the right-clicked link.
//     - `open-text-capture-form` (session 4): right-click context-menu on a
//       text selection per §A.7 Module 2 highlight-and-add gesture. Carries
//       the selected text + the page URL (so the form can suggest matching
//       a saved CompetitorUrl).
//     - `open-image-capture-form` (session 5): right-click context-menu on an
//       image per §A.7 Module 2 regular-image gesture. Carries the image's
//       srcUrl + the page URL so the form can preview the image and
//       pre-select the matching saved CompetitorUrl.
//     - `enter-region-screenshot-mode` (session 6 2026-05-13): popup-side
//       "Region-screenshot mode" button per §A.7 Module 2 region-screenshot
//       gesture. Carries the page URL so the content-script overlay can
//       open the existing image-capture-form pre-selecting the matching
//       saved CompetitorUrl after the user finishes their drag-rectangle.
//   - Content → Background (request/response): BackgroundRequest +
//     BackgroundResponse envelope. Added 2026-05-08-c — content scripts
//     cannot reach vklf.com directly because their fetch originates from
//     the host page's origin (amazon.com / ebay.com / etc.), which is NOT
//     in vklf.com's CORS allowlist (chrome-extension://* only). The
//     background runs in the extension origin, so its fetch passes the
//     preflight. Content scripts route their PLOS API calls through this
//     proxy. See docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//     Waypoint #1 attempt #3 row for the discovery context.

import type {
  AcceptedImageMimeType,
  AcceptedVideoMimeType,
  CapturedImage,
  CapturedImageWithUrls,
  CapturedText,
  CapturedVideo,
  CompetitorUrl,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ListCompetitorUrlsResponse,
  Platform,
  VideoSourceType,
  VocabularyEntry,
  VocabularyType,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import type { ExtensionProject } from '../api-client.ts';

// ─── Background → Content (one-way push) ─────────────────────────────────

export interface OpenUrlAddFormMessage {
  kind: 'open-url-add-form';
  href: string;
}

export interface OpenTextCaptureFormMessage {
  kind: 'open-text-capture-form';
  /** Text the user had selected when they invoked the context menu. May be
   * empty (e.g., context-menu fired without an active selection — Chrome
   * still routes the click). The form handles empty selectedText by
   * showing an empty editable textarea + an inline hint. */
  selectedText: string;
  /** Page URL where the right-click happened. The form uses this to
   * suggest a pre-selection of the saved CompetitorUrl (the form's
   * URL picker pre-selects the first saved URL whose canonical form
   * matches this page URL). */
  pageUrl: string;
}

/**
 * P-27 Build #3 (2026-05-22) — right-click on a <video> OR an embed iframe
 * opens the video-capture form. Mirrors OpenImageCaptureFormMessage shape,
 * with the same emptiness-allowed contract on srcUrl: Chrome's
 * `info.srcUrl` is empty when the right-click target isn't a media element
 * Chrome recognizes (recall the P-23 Amazon-overlay lesson). The
 * orchestrator's contextmenu capture-phase listener tracks the right-click
 * target separately + calls findUnderlyingVideoEmbed to recover the actual
 * <video> or embed iframe, so the open-handler can fall back to that
 * snapshot when srcUrl is empty.
 */
export interface OpenVideoCaptureFormMessage {
  kind: 'open-video-capture-form';
  /** Chrome's `info.srcUrl` for the right-click target. Often empty for
   * embed iframes (Chrome doesn't recognize them as media); the
   * orchestrator falls back to the helper's snapshot in that case. */
  srcUrl: string;
  /** Page URL where the right-click happened. Used to pre-select the
   * matching saved CompetitorUrl in the form's picker. */
  pageUrl: string;
}

export interface OpenImageCaptureFormMessage {
  kind: 'open-image-capture-form';
  /** The image's source URL as Chrome reported via `info.srcUrl` on the
   * context-menu click. Used both to preview the image in the form and to
   * fetch the bytes for upload (the background performs the fetch — see
   * `submit-image-capture` below).
   *
   * May be `data:` for inline images that the host page constructed
   * client-side; the upload path handles both `http(s):` and `data:` srcs.
   */
  srcUrl: string;
  /** Page URL where the right-click happened. Used for pre-selecting the
   * saved CompetitorUrl in the form's picker (same shape as the text
   * capture's `pageUrl`). */
  pageUrl: string;
}

/**
 * Session 6 (2026-05-13) — popup-initiated region-screenshot mode. The popup
 * sends this message to the active tab's content script when the user clicks
 * "Region-screenshot mode." The content-script orchestrator arms the overlay
 * (transparent layer + crosshair cursor + drag-rectangle) per the §A.7
 * Module 2 A+ Content Module flow. The selectedText / srcUrl fields the text
 * and image messages carry are not relevant here — region-screenshot derives
 * its image bytes from `chrome.tabs.captureVisibleTab` (background-only API)
 * + canvas crop, not from a pre-existing DOM element.
 */
export interface EnterRegionScreenshotModeMessage {
  kind: 'enter-region-screenshot-mode';
  /** Page URL where the user invoked the region-screenshot button. Used for
   * pre-selecting the saved CompetitorUrl in the form's picker after the
   * user finishes their drag-rectangle (same pre-selection shape as
   * open-image-capture-form's pageUrl). */
  pageUrl: string;
}

export type ContentScriptMessage =
  | OpenUrlAddFormMessage
  | OpenTextCaptureFormMessage
  | OpenImageCaptureFormMessage
  | OpenVideoCaptureFormMessage
  | EnterRegionScreenshotModeMessage;

export function isContentScriptMessage(
  value: unknown,
): value is ContentScriptMessage {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as {
    kind?: unknown;
    href?: unknown;
    selectedText?: unknown;
    pageUrl?: unknown;
    srcUrl?: unknown;
  };
  if (msg.kind === 'open-url-add-form') {
    return typeof msg.href === 'string';
  }
  if (msg.kind === 'open-text-capture-form') {
    return (
      typeof msg.selectedText === 'string' && typeof msg.pageUrl === 'string'
    );
  }
  if (msg.kind === 'open-image-capture-form') {
    return typeof msg.srcUrl === 'string' && typeof msg.pageUrl === 'string';
  }
  if (msg.kind === 'open-video-capture-form') {
    return typeof msg.srcUrl === 'string' && typeof msg.pageUrl === 'string';
  }
  if (msg.kind === 'enter-region-screenshot-mode') {
    return typeof msg.pageUrl === 'string';
  }
  return false;
}

// ─── Content → Background (request/response) ─────────────────────────────

export interface ListProjectsRequest {
  kind: 'list-projects';
}

export interface ListCompetitorUrlsRequest {
  kind: 'list-competitor-urls';
  projectId: string;
  platform: Platform | null;
}

/**
 * P-24 saved-image indicator — content script asks the background to list
 * the CapturedImage rows for one CompetitorUrl. Background routes through
 * the extension-origin authedFetch (avoids host-page CORS).
 */
export interface ListCapturedImagesRequest {
  kind: 'list-captured-images';
  projectId: string;
  urlId: string;
}

/**
 * P-25 saved-text haze — content script asks the background to list the
 * CapturedText rows for one CompetitorUrl. Same CORS-avoidance reasoning
 * as ListCapturedImagesRequest.
 */
export interface ListCapturedTextsRequest {
  kind: 'list-captured-texts';
  projectId: string;
  urlId: string;
}

/**
 * P-27 Build #4 saved-video indicator — content script asks the background
 * to list the CapturedVideo rows for one CompetitorUrl. Same CORS-avoidance
 * reasoning as ListCapturedImagesRequest.
 */
export interface ListCapturedVideosRequest {
  kind: 'list-captured-videos';
  projectId: string;
  urlId: string;
}

export interface CreateCompetitorUrlRequestMessage {
  kind: 'create-competitor-url';
  projectId: string;
  body: CreateCompetitorUrlRequest;
}

export interface CreateCapturedTextRequestMessage {
  kind: 'create-captured-text';
  projectId: string;
  urlId: string;
  body: CreateCapturedTextRequest;
}

export interface ListVocabularyRequest {
  kind: 'list-vocabulary';
  projectId: string;
  vocabularyType: VocabularyType;
}

export interface CreateVocabularyEntryRequestMessage {
  kind: 'create-vocabulary-entry';
  projectId: string;
  body: CreateVocabularyEntryRequest;
}

/**
 * Session 5 — end-to-end image-capture submit. Content script hands off
 * everything the background needs to fetch the bytes (the image's srcUrl)
 * and run the §3 two-phase upload (requestUpload → PUT → finalize). The
 * background returns the finalized CapturedImage row on success.
 *
 * Why end-to-end in the background instead of split across phases (see
 * STACK_DECISIONS.md §3): the background fetches the image bytes from
 * extension origin (covered by the per-platform image-CDN host_permissions
 * declared in wxt.config.ts). Doing the PUT from the content script would
 * succeed only when the host-page's CDN response carries permissive CORS
 * headers — Amazon/Etsy CDNs typically do NOT. Doing it in the background
 * avoids the per-platform CORS gamble.
 */
export interface SubmitImageCaptureRequestMessage {
  kind: 'submit-image-capture';
  projectId: string;
  urlId: string;
  /** The image's source URL the user right-clicked. The background fetches
   * the bytes from this URL using extension-origin fetch. */
  srcUrl: string;
  /** Phase-1 request payload (MIME, size, sourceType, clientId,
   * imageCategory). `fileSize` is the byte length the background measured
   * after fetching the bytes — content script doesn't see the bytes. */
  request: {
    clientId: string;
    mimeType: AcceptedImageMimeType;
    sourceType: 'regular' | 'region-screenshot';
    imageCategory?: string;
  };
  /** Phase-3 finalize body's user-provided fields. clientId / mimeType /
   * sourceType / fileSize are echoed from phase 1 by the background. */
  finalize: {
    imageCategory?: string;
    composition?: string;
    embeddedText?: string;
    tags?: string[];
  };
}

/**
 * P-27 Build #3 (2026-05-22) — end-to-end video-capture submit.
 *
 * Two branches mirror the on-wire CapturedVideo sourceType discriminator:
 *
 *   - DIRECT_BYTES: content script hands the background everything it
 *     needs to (a) fetch the video bytes from `srcUrl` (extension origin
 *     fetch, like images), (b) Phase 1 `requestVideoUpload` to mint TWO
 *     signed URLs (video + thumbnail per design doc §A.9), (c) PUT the
 *     bytes + the canvas-grabbed thumbnail JPEG to those URLs, (d) Phase 3
 *     `finalizeVideoUpload` with the user's metadata. The thumbnail data
 *     URL is produced by the content-script's canvas frame-grab BEFORE
 *     this message fires — the background only has a service-worker
 *     context, no DOM, no canvas, so the JPEG has to come from the form
 *     side. NULL thumbnail (per §A.12 fallback) is allowed — pass
 *     `thumbnailDataUrl: null`; finalize stores NULL thumbnailStoragePath
 *     and the renderer falls back to a generic icon.
 *
 *   - EMBED: content script passes ONLY the embed URL + user metadata; no
 *     fetch, no upload, no Phase 1, no thumbnail. The background skips
 *     straight to Phase 3 finalize with sourceType='EMBED'.
 *
 * Idempotency: the content-script form mints clientId once per Save click;
 * the background reuses it across all phases. Phase 3 finalize dedupes on
 * clientId so retries are safe per design doc §A.2 table notes.
 */
export type SubmitVideoCaptureRequestMessage =
  | {
      kind: 'submit-video-capture';
      projectId: string;
      urlId: string;
      sourceType: 'DIRECT_BYTES';
      /** Page-host URL the bytes came from. Background fetches this via
       * extension-origin fetch (host_permissions in wxt.config.ts). */
      srcUrl: string;
      /** Canvas frame-grab thumbnail produced by the form, as a base64
       * data URL (e.g. `data:image/jpeg;base64,/9j/...`). The background
       * decodes + PUTs it to the thumbnail signed URL alongside the video
       * bytes. Null when the frame-grab failed (§A.12 fallback). */
      thumbnailDataUrl: string | null;
      /** Direct-bytes pre-flight hint from the helper's <source type>
       * attribute. The background uses Content-Type when available + falls
       * back to this hint when the CDN doesn't set Content-Type. Optional —
       * the background's fetchVideoBytes() resolves authoritatively. */
      mimeTypeHint: AcceptedVideoMimeType | null;
      /** Phase-1 + Phase-3 metadata the form gathered. */
      clientId: string;
      videoCategory: string;
      composition: string | null;
      embeddedText: string | null;
      tags: string[];
      durationSeconds: number | null;
      width: number | null;
      height: number | null;
    }
  | {
      kind: 'submit-video-capture';
      projectId: string;
      urlId: string;
      sourceType: 'EMBED';
      /** The YouTube / Vimeo / etc. URL going on the row's originalSrcUrl.
       * Server validates with detectEmbedPlatform server-side; the form
       * also validated client-side via the same helper. */
      originalSrcUrl: string;
      clientId: string;
      videoCategory: string;
      composition: string | null;
      embeddedText: string | null;
      tags: string[];
    };

/**
 * Session 6 (2026-05-13) — content-script asks the background to capture
 * the visible viewport as a base64 PNG. `chrome.tabs.captureVisibleTab` is
 * a background-only API in Manifest V3 (content scripts cannot call it
 * directly), so the region-screenshot overlay routes through the background
 * via this request. Background responds with a base64 data URL the overlay
 * then decodes + crops via canvas to produce the cropped image Blob.
 */
export interface CaptureVisibleTabRequest {
  kind: 'capture-visible-tab';
  /** Output format. PNG is the canonical choice — lossless, predictable
   * size for typical viewport screenshots, matches the data URL shape the
   * canvas crop produces on its toDataURL call. JPEG support reserved
   * for a future quality-vs-size tradeoff if needed. */
  format: 'png';
}

export type BackgroundRequest =
  | ListProjectsRequest
  | ListCompetitorUrlsRequest
  | ListCapturedImagesRequest
  | ListCapturedTextsRequest
  | ListCapturedVideosRequest
  | CreateCompetitorUrlRequestMessage
  | CreateCapturedTextRequestMessage
  | ListVocabularyRequest
  | CreateVocabularyEntryRequestMessage
  | SubmitImageCaptureRequestMessage
  | SubmitVideoCaptureRequestMessage
  | CaptureVisibleTabRequest;

// Response envelope. Encodes both success + structured error so the
// content-script wrapper can re-throw PlosApiError with the right status
// and message — preserving the existing api-client.ts error contract that
// callers (notably url-add-form's setError) already handle.
export type BackgroundResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { status: number; message: string } };

export type ListProjectsResponseEnvelope = BackgroundResponse<
  ExtensionProject[]
>;
export type ListCompetitorUrlsResponseEnvelope = BackgroundResponse<
  ListCompetitorUrlsResponse
>;
export type ListCapturedImagesResponseEnvelope = BackgroundResponse<
  CapturedImageWithUrls[]
>;
export type ListCapturedTextsResponseEnvelope = BackgroundResponse<
  CapturedText[]
>;
export type ListCapturedVideosResponseEnvelope = BackgroundResponse<
  CapturedVideo[]
>;
export type CreateCompetitorUrlResponseEnvelope = BackgroundResponse<
  CompetitorUrl
>;
export type CreateCapturedTextResponseEnvelope = BackgroundResponse<
  CapturedText
>;
export type ListVocabularyResponseEnvelope = BackgroundResponse<
  VocabularyEntry[]
>;
export type CreateVocabularyEntryResponseEnvelope = BackgroundResponse<
  VocabularyEntry
>;

export type SubmitImageCaptureResponseEnvelope = BackgroundResponse<
  CapturedImage
>;

export type SubmitVideoCaptureResponseEnvelope = BackgroundResponse<
  CapturedVideo
>;

/**
 * Session 6 (2026-05-13) — background returns the captured viewport image
 * as a base64 data URL (e.g. `data:image/png;base64,iVBORw...`). The overlay
 * decodes it via parseDataUrl + draws onto a hidden canvas to crop the
 * user's rectangle.
 */
export type CaptureVisibleTabResponseEnvelope = BackgroundResponse<{
  dataUrl: string;
}>;

export function isBackgroundRequest(
  value: unknown,
): value is BackgroundRequest {
  if (typeof value !== 'object' || value === null) return false;
  const msg = value as {
    kind?: unknown;
    projectId?: unknown;
    urlId?: unknown;
    body?: unknown;
    platform?: unknown;
    vocabularyType?: unknown;
  };
  if (msg.kind === 'list-projects') return true;
  if (msg.kind === 'list-competitor-urls') {
    return typeof msg.projectId === 'string';
  }
  if (msg.kind === 'list-captured-images') {
    return typeof msg.projectId === 'string' && typeof msg.urlId === 'string';
  }
  if (msg.kind === 'list-captured-texts') {
    return typeof msg.projectId === 'string' && typeof msg.urlId === 'string';
  }
  if (msg.kind === 'list-captured-videos') {
    return typeof msg.projectId === 'string' && typeof msg.urlId === 'string';
  }
  if (msg.kind === 'create-competitor-url') {
    return (
      typeof msg.projectId === 'string' &&
      typeof msg.body === 'object' &&
      msg.body !== null
    );
  }
  if (msg.kind === 'create-captured-text') {
    return (
      typeof msg.projectId === 'string' &&
      typeof msg.urlId === 'string' &&
      typeof msg.body === 'object' &&
      msg.body !== null
    );
  }
  if (msg.kind === 'list-vocabulary') {
    return (
      typeof msg.projectId === 'string' &&
      typeof msg.vocabularyType === 'string'
    );
  }
  if (msg.kind === 'create-vocabulary-entry') {
    return (
      typeof msg.projectId === 'string' &&
      typeof msg.body === 'object' &&
      msg.body !== null
    );
  }
  if (msg.kind === 'submit-image-capture') {
    const m = msg as {
      projectId?: unknown;
      urlId?: unknown;
      srcUrl?: unknown;
      request?: unknown;
      finalize?: unknown;
    };
    return (
      typeof m.projectId === 'string' &&
      typeof m.urlId === 'string' &&
      typeof m.srcUrl === 'string' &&
      typeof m.request === 'object' &&
      m.request !== null &&
      typeof m.finalize === 'object' &&
      m.finalize !== null
    );
  }
  if (msg.kind === 'submit-video-capture') {
    const m = msg as {
      projectId?: unknown;
      urlId?: unknown;
      sourceType?: unknown;
      srcUrl?: unknown;
      originalSrcUrl?: unknown;
      clientId?: unknown;
      videoCategory?: unknown;
    };
    if (
      typeof m.projectId !== 'string' ||
      typeof m.urlId !== 'string' ||
      typeof m.clientId !== 'string' ||
      typeof m.videoCategory !== 'string'
    ) {
      return false;
    }
    if (m.sourceType === 'DIRECT_BYTES') {
      return typeof m.srcUrl === 'string';
    }
    if (m.sourceType === 'EMBED') {
      return typeof m.originalSrcUrl === 'string';
    }
    return false;
  }
  if (msg.kind === 'capture-visible-tab') {
    const m = msg as { format?: unknown };
    return m.format === 'png';
  }
  return false;
}
