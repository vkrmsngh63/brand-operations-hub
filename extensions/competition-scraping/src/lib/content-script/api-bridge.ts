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
  CapturedImage,
  CapturedText,
  CompetitorUrl,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ImageSourceType,
  ListCompetitorUrlsResponse,
  Platform,
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
