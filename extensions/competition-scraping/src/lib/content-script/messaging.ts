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
  CapturedImage,
  CapturedText,
  CompetitorUrl,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ListCompetitorUrlsResponse,
  Platform,
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

export type ContentScriptMessage =
  | OpenUrlAddFormMessage
  | OpenTextCaptureFormMessage
  | OpenImageCaptureFormMessage;

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

export type BackgroundRequest =
  | ListProjectsRequest
  | ListCompetitorUrlsRequest
  | CreateCompetitorUrlRequestMessage
  | CreateCapturedTextRequestMessage
  | ListVocabularyRequest
  | CreateVocabularyEntryRequestMessage
  | SubmitImageCaptureRequestMessage;

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
  return false;
}
