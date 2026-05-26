// API bridge for content scripts. Wraps `chrome.runtime.sendMessage` so
// content scripts can call PLOS API endpoints without triggering CORS
// preflight failures.
//
// The content script runs in the host page's origin (amazon.com, ebay.com,
// etsy.com, walmart.com). vklf.com's CORS allowlist only accepts
// `chrome-extension://*` — any direct fetch from a content script to
// vklf.com fails preflight with `TypeError: Failed to fetch`.
//
// This bridge sends typed messages to the background service worker; the
// background runs in the extension origin (chrome-extension://<id>) and
// performs the actual fetch via api-client.ts. Errors from the background
// are returned as a structured envelope and re-thrown here as PlosApiError
// so call sites that already catch PlosApiError (notably the URL-add
// overlay form's Save handler) keep working unchanged.
//
// Public surface mirrors api-client.ts's listProjects /
// listCompetitorUrls / createCompetitorUrl — call sites only need to swap
// the import path from '../api-client.ts' to './api-bridge.ts'.

import { PlosApiError } from '../errors.ts';
import type { ExtensionProject } from '../api-client.ts';
import type {
  AcceptedImageMimeType,
  AcceptedVideoMimeType,
  CapturedImage,
  CapturedImageWithUrls,
  CapturedReview,
  CapturedText,
  CapturedVideo,
  CapturedVideoWithUrls,
  CompetitorUrl,
  CreateCapturedReviewRequest,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ImageSourceType,
  ListCompetitorUrlsResponse,
  Platform,
  RequestVideoUploadResponse,
  VocabularyEntry,
  VocabularyType,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import type {
  BackgroundRequest,
  BackgroundResponse,
} from './messaging.ts';

// Re-export PlosApiError so call sites that catch it can import from this
// module instead of reaching back into api-client.ts. Keeps content-script
// imports tidy.
export { PlosApiError } from '../errors.ts';

async function send<T>(req: BackgroundRequest): Promise<T> {
  let resp: unknown;
  try {
    resp = await chrome.runtime.sendMessage(req);
  } catch (err) {
    // chrome.runtime.sendMessage rejects when the background isn't listening
    // (extension reload between content-script load and message send;
    // service-worker eviction race). Map to PlosApiError so call sites'
    // existing catch path triggers.
    const msg =
      err instanceof Error ? err.message : 'Background did not respond';
    throw new PlosApiError(0, `Extension background unavailable — ${msg}`);
  }
  if (
    typeof resp !== 'object' ||
    resp === null ||
    !('ok' in (resp as Record<string, unknown>))
  ) {
    throw new PlosApiError(0, 'Malformed response from background');
  }
  const envelope = resp as BackgroundResponse<T>;
  if (envelope.ok) return envelope.data;
  throw new PlosApiError(envelope.error.status, envelope.error.message);
}

/**
 * Lists the Projects accessible to the signed-in user. Routed through the
 * background so the fetch originates from the extension origin.
 */
export async function listProjects(): Promise<ExtensionProject[]> {
  return send<ExtensionProject[]>({ kind: 'list-projects' });
}

/**
 * Lists CompetitorUrl rows for the given Project, optionally filtered by
 * platform. Routed through the background.
 */
export async function listCompetitorUrls(
  projectId: string,
  platform: Platform | null,
): Promise<ListCompetitorUrlsResponse> {
  return send<ListCompetitorUrlsResponse>({
    kind: 'list-competitor-urls',
    projectId,
    platform,
  });
}

/**
 * P-24 saved-image indicator — lists the CapturedImage rows for one
 * CompetitorUrl. Routed through the background per the same CORS reasoning
 * as listCompetitorUrls.
 */
export async function listCapturedImages(
  projectId: string,
  urlId: string,
): Promise<CapturedImageWithUrls[]> {
  return send<CapturedImageWithUrls[]>({
    kind: 'list-captured-images',
    projectId,
    urlId,
  });
}

/**
 * P-27 Build #4 saved-video indicator — lists the CapturedVideo rows for
 * one CompetitorUrl. Routed through the background per the same CORS
 * reasoning as listCapturedImages. The orchestrator's saved-video scan
 * matches each row's `originalSrcUrl` against on-page `<video>.currentSrc`
 * and recognized `<iframe>.src` to attach the green-checkmark indicator.
 */
export async function listCapturedVideos(
  projectId: string,
  urlId: string,
): Promise<CapturedVideoWithUrls[]> {
  return send<CapturedVideoWithUrls[]>({
    kind: 'list-captured-videos',
    projectId,
    urlId,
  });
}

/**
 * P-25 saved-text haze — lists the CapturedText rows for one CompetitorUrl.
 * Routed through the background per the same CORS reasoning as
 * listCompetitorUrls. The orchestrator filters rows with a non-null
 * selector and re-locates each one's Range against the live DOM.
 */
export async function listCapturedTexts(
  projectId: string,
  urlId: string,
): Promise<CapturedText[]> {
  return send<CapturedText[]>({
    kind: 'list-captured-texts',
    projectId,
    urlId,
  });
}

/**
 * Creates a new CompetitorUrl. Idempotent server-side per §11.2. Routed
 * through the background.
 */
export async function createCompetitorUrl(
  projectId: string,
  body: CreateCompetitorUrlRequest,
): Promise<CompetitorUrl> {
  return send<CompetitorUrl>({
    kind: 'create-competitor-url',
    projectId,
    body,
  });
}

/**
 * Creates a CapturedText row attached to a CompetitorUrl. Routed through
 * the background per the same CORS reasoning as createCompetitorUrl.
 * Idempotent server-side on clientId.
 */
export async function createCapturedText(
  projectId: string,
  urlId: string,
  body: CreateCapturedTextRequest,
): Promise<CapturedText> {
  return send<CapturedText>({
    kind: 'create-captured-text',
    projectId,
    urlId,
    body,
  });
}

/**
 * P-49 Workstream 2 Session 1 (2026-05-26) — per-review insert routed through
 * the background-proxy. Used by the per-platform review extractor modules
 * (amazon-review-extractor.ts; future eBay / Etsy / Walmart). Idempotent on
 * clientId server-side per the captured-* convention.
 */
export async function createCapturedReview(
  projectId: string,
  urlId: string,
  body: CreateCapturedReviewRequest,
): Promise<CapturedReview> {
  return send<CapturedReview>({
    kind: 'create-captured-review',
    projectId,
    urlId,
    body,
  });
}

/**
 * Lists vocabulary entries (e.g., content-category) for the given Project.
 * Routed through the background.
 */
export async function listVocabularyEntries(
  projectId: string,
  vocabularyType: VocabularyType,
): Promise<VocabularyEntry[]> {
  return send<VocabularyEntry[]>({
    kind: 'list-vocabulary',
    projectId,
    vocabularyType,
  });
}

/**
 * Adds a new vocabulary entry (or returns the existing row on dedup hit per
 * §11.1 server-side upsert semantics). Routed through the background.
 */
export async function createVocabularyEntry(
  projectId: string,
  body: CreateVocabularyEntryRequest,
): Promise<VocabularyEntry> {
  return send<VocabularyEntry>({
    kind: 'create-vocabulary-entry',
    projectId,
    body,
  });
}

/**
 * End-to-end image capture submit. The background fetches the image bytes
 * from `srcUrl`, runs Phase 1 (requestUpload) + Phase 2 (signed-URL PUT) +
 * Phase 3 (finalize), and returns the finalized CapturedImage row. The
 * content-script form treats this as a single atomic save — the form
 * disables its Save button while the message is in flight and surfaces
 * a single error on any failure (matches the captured-text Save path
 * shape so users see consistent form behavior across both gestures).
 *
 * See messaging.ts SubmitImageCaptureRequestMessage for the wire shape and
 * STACK_DECISIONS.md §3 for why the bytes flow through the background
 * rather than the content script.
 */
export async function submitImageCapture(args: {
  projectId: string;
  urlId: string;
  srcUrl: string;
  request: {
    clientId: string;
    mimeType: AcceptedImageMimeType;
    sourceType: ImageSourceType;
    imageCategory?: string;
  };
  finalize: {
    imageCategory?: string;
    composition?: string;
    embeddedText?: string;
    tags?: string[];
  };
}): Promise<CapturedImage> {
  return send<CapturedImage>({
    kind: 'submit-image-capture',
    projectId: args.projectId,
    urlId: args.urlId,
    srcUrl: args.srcUrl,
    request: args.request,
    finalize: args.finalize,
  });
}

/**
 * P-27 Build #3 (2026-05-22) — end-to-end video capture submit. Two-branch
 * payload: DIRECT_BYTES carries the page-host video URL + the canvas
 * frame-grab thumbnail data URL + metadata; EMBED carries only the
 * embed URL + metadata. The background runs the corresponding pipeline
 * (fetch + 3-phase upload, OR straight-to-finalize) and returns the
 * finalized CapturedVideo row. The form treats this as a single atomic
 * Save — disables the button while in flight, surfaces a single error on
 * any failure.
 */
export async function submitVideoCapture(
  args:
    | {
        projectId: string;
        urlId: string;
        sourceType: 'DIRECT_BYTES';
        srcUrl: string;
        thumbnailDataUrl: string | null;
        mimeTypeHint: AcceptedVideoMimeType | null;
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
        projectId: string;
        urlId: string;
        sourceType: 'EMBED';
        originalSrcUrl: string;
        clientId: string;
        videoCategory: string;
        composition: string | null;
        embeddedText: string | null;
        tags: string[];
      },
): Promise<CapturedVideo> {
  if (args.sourceType === 'DIRECT_BYTES') {
    return send<CapturedVideo>({
      kind: 'submit-video-capture',
      projectId: args.projectId,
      urlId: args.urlId,
      sourceType: 'DIRECT_BYTES',
      srcUrl: args.srcUrl,
      thumbnailDataUrl: args.thumbnailDataUrl,
      mimeTypeHint: args.mimeTypeHint,
      clientId: args.clientId,
      videoCategory: args.videoCategory,
      composition: args.composition,
      embeddedText: args.embeddedText,
      tags: args.tags,
      durationSeconds: args.durationSeconds,
      width: args.width,
      height: args.height,
    });
  }
  return send<CapturedVideo>({
    kind: 'submit-video-capture',
    projectId: args.projectId,
    urlId: args.urlId,
    sourceType: 'EMBED',
    originalSrcUrl: args.originalSrcUrl,
    clientId: args.clientId,
    videoCategory: args.videoCategory,
    composition: args.composition,
    embeddedText: args.embeddedText,
    tags: args.tags,
  });
}

/**
 * Session 6 (2026-05-13) — Module 2 region-screenshot helper. Routes a
 * `capture-visible-tab` request through the background; returns the
 * base64 PNG data URL of the active tab's viewport. The overlay then
 * decodes + crops via canvas before opening the image-capture-form.
 *
 * Background-side handler at
 * `extensions/competition-scraping/src/entrypoints/background.ts`
 * (`handleCaptureVisibleTab`) calls chrome.tabs.captureVisibleTab and
 * surfaces permission errors via the standard BackgroundResponse error
 * envelope (re-thrown here as PlosApiError).
 */
export async function requestVisibleTabCapture(): Promise<{ dataUrl: string }> {
  return send<{ dataUrl: string }>({
    kind: 'capture-visible-tab',
    format: 'png',
  });
}

/**
 * P-45 Build #1b (2026-05-22) — Phase 1 of the smart-client SCREEN_RECORDING
 * save path. Routes the existing requestVideoUpload call through the
 * background so the fetch originates from extension origin (vklf.com's
 * CORS allowlist excludes content-script origins). Returns the two signed
 * URLs (video + thumbnail) the content-script then PUTs directly to from
 * its host-page origin (Supabase signed URLs allow any-origin uploads).
 * See messaging.ts SubmitVideoScreenRecordingRequestUploadRequest + §C.16.
 */
export async function submitVideoScreenRecordingRequestUpload(args: {
  projectId: string;
  urlId: string;
  clientId: string;
  mimeType: AcceptedVideoMimeType;
  fileSize: number;
}): Promise<RequestVideoUploadResponse> {
  return send<RequestVideoUploadResponse>({
    kind: 'submit-video-screen-recording-request-upload',
    projectId: args.projectId,
    urlId: args.urlId,
    clientId: args.clientId,
    mimeType: args.mimeType,
    fileSize: args.fileSize,
  });
}

/**
 * P-45 Build #1b (2026-05-22) — Phase 3 of the smart-client SCREEN_RECORDING
 * save path. Routes the existing finalizeVideoUpload call through the
 * background with sourceType='SCREEN_RECORDING' baked in. The background
 * sets sourceType + maps thumbnailStoragePath omission to NULL per §A.12.
 * Returns the finalized CapturedVideo row.
 */
export async function submitVideoScreenRecordingFinalize(args: {
  projectId: string;
  urlId: string;
  clientId: string;
  capturedVideoId: string;
  videoStoragePath: string;
  thumbnailStoragePath?: string;
  mimeType: AcceptedVideoMimeType;
  fileSize: number;
  durationSeconds: number;
  width: number;
  height: number;
  originalSrcUrl: string;
  videoCategory: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
}): Promise<CapturedVideo> {
  return send<CapturedVideo>({
    kind: 'submit-video-screen-recording-finalize',
    ...args,
  });
}
