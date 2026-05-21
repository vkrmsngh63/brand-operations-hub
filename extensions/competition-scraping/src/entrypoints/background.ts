// Background service worker for the Competition Scraping extension.
//
// Phase 1 scope as of session 5 (extended 2026-05-12-i):
//   - Importing the supabase module keeps the auto-refresh-token loop alive
//     while Chrome considers the service worker "active."
//   - Registers THREE right-click context menu items:
//     1. "Add to PLOS — Competition Scraping" on link right-click per
//        COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail
//        #6 — always available as a redundant secondary path to the floating
//        "+ Add" button. Click sends an `open-url-add-form` message to the
//        active tab's content script. Shipped session 3 (2026-05-07-h).
//     2. "Add to PLOS — Captured Text" on text selection per §A.7 Module 2
//        highlight-and-add gesture. Director-picked Option A (right-click
//        context-menu only) at session 4 start 2026-05-11. Click sends an
//        `open-text-capture-form` message with the selected text + page URL.
//     3. "Add to PLOS — Image" on image right-click per §A.7 Module 2
//        regular-image gesture. Director-picked Option A (regular-image-first
//        scope) at session 5 start 2026-05-12-i. Click sends an
//        `open-image-capture-form` message with the image's srcUrl + page URL.
//   - Listens for BackgroundRequest messages from content scripts and
//     proxies them to the PLOS API. Content scripts cannot reach vklf.com
//     directly because their fetches originate from the host page's
//     origin (amazon.com, etc.) which is NOT in vklf.com's CORS allowlist
//     (`chrome-extension://*` only). The background runs in the extension
//     origin, so its fetch passes preflight. Discovered + fixed during
//     Waypoint #1 attempt #3 — see verification backlog attempt log.
//   - Handles end-to-end `submit-image-capture` requests: fetches the image
//     bytes from extension origin (covered by per-platform image-CDN
//     host_permissions declared in wxt.config.ts), runs the two-phase
//     signed-URL upload, and returns the finalized CapturedImage row.
//   - Session 6 (2026-05-13) — handles `capture-visible-tab` requests from
//     the region-screenshot overlay. The chrome.tabs.captureVisibleTab API
//     is background-only in MV3; content scripts route through this proxy.
//     The overlay then decodes the returned data URL + crops via canvas
//     before feeding the cropped Blob into the same `submit-image-capture`
//     pipeline session 5 built (sourceType: 'region-screenshot').
//
// Future build sessions add: WAL replay on startup, periodic reconciliation
// poller, navigator.onLine handlers.

import { supabase } from '../lib/supabase';
import {
  PlosApiError,
  createCapturedText,
  createCompetitorUrl,
  createVocabularyEntry,
  fetchImageBytes,
  fetchVideoBytes,
  finalizeImageUpload,
  finalizeVideoUpload,
  listCapturedImages,
  listCapturedTexts,
  listCompetitorUrls,
  listProjects,
  listVocabularyEntries,
  putImageBytesToSignedUrl,
  putVideoBytesToSignedUrl,
  putVideoThumbnailToSignedUrl,
  requestImageUpload,
  requestVideoUpload,
} from '../lib/api-client';
import {
  isBackgroundRequest,
  type BackgroundRequest,
  type BackgroundResponse,
  type CaptureVisibleTabRequest,
  type ContentScriptMessage,
  type SubmitImageCaptureRequestMessage,
  type SubmitVideoCaptureRequestMessage,
} from '../lib/content-script/messaging';
import { logGlobalError } from '../lib/sw-error-logging';
import type {
  CapturedImage,
  CapturedVideo,
} from '../../../../src/lib/shared-types/competition-scraping';

void supabase;

const CONTEXT_MENU_URL_ID = 'plos-add-to-competition-scraping';
const CONTEXT_MENU_URL_TITLE = 'Add to PLOS — Competition Scraping';

// Session 4 (2026-05-11) — text-capture context menu. Fires on text
// selection; "Add to PLOS — Captured Text" routes the selected text + the
// page URL to the content-script's text-capture form.
const CONTEXT_MENU_TEXT_ID = 'plos-add-captured-text';
const CONTEXT_MENU_TEXT_TITLE = 'Add to PLOS — Captured Text';

// Session 5 (2026-05-12-i) — image-capture context menu. Fires on image
// right-click; "Add to PLOS — Image" routes the image's srcUrl + the page
// URL to the content-script's image-capture form.
const CONTEXT_MENU_IMAGE_ID = 'plos-add-captured-image';
const CONTEXT_MENU_IMAGE_TITLE = 'Add to PLOS — Image';

// P-27 Build #3 (2026-05-22) — video-capture context menu. Fires on right-
// click anywhere on a page; the content-script orchestrator's contextmenu
// capture-phase listener walks the DOM via findUnderlyingVideoEmbed to
// resolve either a direct <video> element or a recognized embed iframe.
// Routes the result to the content-script's video-capture form. Uses
// `contexts: ['all']` mirroring the P-23 image-capture lesson — Chrome's
// `info.srcUrl` is populated only when the right-click target is itself a
// <video> (recall: page wrappers + overlays often intercept the contextmenu
// event before Chrome recognizes the target as media). The orchestrator's
// snapshot covers the wrapper-and-overlay cases.
const CONTEXT_MENU_VIDEO_ID = 'plos-add-captured-video';
const CONTEXT_MENU_VIDEO_TITLE = 'Add to PLOS — Captured Video';

export default defineBackground(() => {
  // P-16 (W#2 polish, 2026-05-19): SW global error handlers. Attach BEFORE
  // any other listener so they're live for the SW's full lifecycle —
  // including the Supabase auto-refresh-token loop which begins as soon as
  // the supabase module is imported (top of file). MV3 SWs treat unhandled
  // promise rejections more strictly than persistent backgrounds; the
  // suspected laptop-2 crash from P3B-9 came from such a rejection during
  // a WiFi-off period. These listeners do NOT preventDefault / re-throw —
  // they just leave a structured diagnostic trace in SW DevTools so the
  // next crash (if any) surfaces a real stack instead of the degenerate
  // ":0 (anonymous function)" Chrome shows when nothing caught the error.
  self.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent).reason;
    logGlobalError(reason, 'sw-unhandledrejection');
  });
  self.addEventListener('error', (event) => {
    const ev = event as ErrorEvent;
    logGlobalError(ev.error ?? ev.message, 'sw-error');
  });

  // Register the context-menu entries once, on install / update. Chrome's
  // contextMenus API errors if the same id is created twice; remove-then-
  // create makes this idempotent across reloads.
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: CONTEXT_MENU_URL_ID,
        title: CONTEXT_MENU_URL_TITLE,
        contexts: ['link'],
      });
      chrome.contextMenus.create({
        id: CONTEXT_MENU_TEXT_ID,
        title: CONTEXT_MENU_TEXT_TITLE,
        contexts: ['selection'],
      });
      chrome.contextMenus.create({
        id: CONTEXT_MENU_IMAGE_ID,
        title: CONTEXT_MENU_IMAGE_TITLE,
        // P-23 fix 2026-05-14: widen from `['image']` to `['all']` so the
        // menu fires on Amazon's overlay-wrapped main product image (the
        // overlay's contextmenu interception prevents Chrome from
        // recognizing the right-click target as `contexts: ['image']`).
        // When the menu fires on a non-image target, `info.srcUrl` is
        // empty; the content-script orchestrator's contextmenu-capture
        // listener tracks the last right-click target and falls back to
        // its underlying-image lookup so the form still opens with the
        // correct image. See orchestrator.ts `lastRightClickImageSrc` +
        // `find-underlying-image.ts` for the fallback path.
        contexts: ['all'],
      });
      chrome.contextMenus.create({
        id: CONTEXT_MENU_VIDEO_ID,
        title: CONTEXT_MENU_VIDEO_TITLE,
        // P-27 Build #3 (2026-05-22): same `contexts: ['all']` pattern as
        // the image entry. The content-script orchestrator's contextmenu
        // capture-phase listener resolves direct <video> + recognized
        // embed iframes via findUnderlyingVideoEmbed; this menu is the
        // user-visible entry-point.
        contexts: ['all'],
      });
    });
  });

  // On context-menu click, dispatch to the appropriate content-script
  // message kind. URL capture → `open-url-add-form` with the link href.
  // Text capture → `open-text-capture-form` with the selection text + page URL.
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const tabId = tab?.id;
    if (typeof tabId !== 'number') return;

    if (info.menuItemId === CONTEXT_MENU_URL_ID) {
      const href = info.linkUrl;
      if (typeof href !== 'string') return;
      const message: ContentScriptMessage = {
        kind: 'open-url-add-form',
        href,
      };
      // sendMessage may reject if the content script isn't injected on the
      // current page (e.g., right-click on a non-supported domain). Swallow
      // the error — the menu entry showing on those pages is a Chrome UX
      // tradeoff we can address later by scoping `documentUrlPatterns`.
      chrome.tabs.sendMessage(tabId, message).catch(() => {
        /* content script not present on this page; no-op */
      });
      return;
    }

    if (info.menuItemId === CONTEXT_MENU_TEXT_ID) {
      const selectedText =
        typeof info.selectionText === 'string' ? info.selectionText : '';
      const pageUrl =
        typeof info.pageUrl === 'string' ? info.pageUrl : tab?.url ?? '';
      const message: ContentScriptMessage = {
        kind: 'open-text-capture-form',
        selectedText,
        pageUrl,
      };
      chrome.tabs.sendMessage(tabId, message).catch(() => {
        /* content script not present on this page; no-op */
      });
      return;
    }

    if (info.menuItemId === CONTEXT_MENU_VIDEO_ID) {
      // P-27 Build #3 (2026-05-22): video-capture gesture. Chrome populates
      // `info.srcUrl` ONLY when the right-click target is recognized media
      // (typically a direct <video> element). For embed iframes + overlay-
      // wrapped videos, srcUrl is empty; the content-script orchestrator
      // falls back to its findUnderlyingVideoEmbed snapshot from the
      // contextmenu capture-phase listener.
      const srcUrl = typeof info.srcUrl === 'string' ? info.srcUrl : '';
      const pageUrl =
        typeof info.pageUrl === 'string' ? info.pageUrl : tab?.url ?? '';
      const message: ContentScriptMessage = {
        kind: 'open-video-capture-form',
        srcUrl,
        pageUrl,
      };
      chrome.tabs.sendMessage(tabId, message).catch(() => {
        /* content script not present on this page; no-op */
      });
      return;
    }

    if (info.menuItemId === CONTEXT_MENU_IMAGE_ID) {
      // Session 5 — regular-image gesture. When the right-click target is
      // an <img>, Chrome populates `info.srcUrl` with its resolved URL
      // (handles relative srcs against the page's base URL; resolves
      // `srcset` to whichever variant the browser picked).
      //
      // P-23 fix 2026-05-14: the menu's `contexts` is now `['all']` (widened
      // from `['image']`), so it ALSO fires on non-image right-click
      // targets — notably Amazon's overlay-wrapped main product image,
      // where Chrome doesn't recognize the right-click target as an image
      // and leaves `info.srcUrl` empty. We pass the empty string through to
      // the content-script's open-image-capture-form handler, which falls
      // back to its `lastRightClickImageSrc` cache populated by its
      // contextmenu-capture listener. If both Chrome's info.srcUrl AND the
      // content-script's cache are empty, the handler bails silently — the
      // user right-clicked something that wasn't an image and isn't near an
      // image in the DOM tree.
      const srcUrl = typeof info.srcUrl === 'string' ? info.srcUrl : '';
      const pageUrl =
        typeof info.pageUrl === 'string' ? info.pageUrl : tab?.url ?? '';
      const message: ContentScriptMessage = {
        kind: 'open-image-capture-form',
        srcUrl,
        pageUrl,
      };
      chrome.tabs.sendMessage(tabId, message).catch(() => {
        /* content script not present on this page; no-op */
      });
    }
  });

  // Proxy PLOS API calls coming from content scripts. Content scripts run
  // in the host page's origin and cannot reach vklf.com directly (CORS
  // allowlist is `chrome-extension://*` only). The background performs
  // the fetch from the extension origin and returns a typed envelope.
  chrome.runtime.onMessage.addListener((rawMsg, _sender, sendResponse) => {
    if (!isBackgroundRequest(rawMsg)) {
      return false; // not for us; another listener may handle
    }
    const req = rawMsg satisfies BackgroundRequest;
    handleBackgroundRequest(req)
      .then((data) => {
        const ok: BackgroundResponse<unknown> = { ok: true, data };
        sendResponse(ok);
      })
      .catch((err) => {
        const fail: BackgroundResponse<unknown> = {
          ok: false,
          error: errorToEnvelope(err),
        };
        sendResponse(fail);
      });
    // Return true so Chrome keeps the message channel open until
    // sendResponse fires asynchronously.
    return true;
  });
});

async function handleBackgroundRequest(
  req: BackgroundRequest,
): Promise<unknown> {
  if (req.kind === 'list-projects') {
    return listProjects();
  }
  if (req.kind === 'list-competitor-urls') {
    return listCompetitorUrls(req.projectId, req.platform);
  }
  if (req.kind === 'list-captured-images') {
    return listCapturedImages(req.projectId, req.urlId);
  }
  if (req.kind === 'list-captured-texts') {
    return listCapturedTexts(req.projectId, req.urlId);
  }
  if (req.kind === 'create-competitor-url') {
    return createCompetitorUrl(req.projectId, req.body);
  }
  if (req.kind === 'create-captured-text') {
    return createCapturedText(req.projectId, req.urlId, req.body);
  }
  if (req.kind === 'list-vocabulary') {
    return listVocabularyEntries(req.projectId, req.vocabularyType);
  }
  if (req.kind === 'create-vocabulary-entry') {
    return createVocabularyEntry(req.projectId, req.body);
  }
  if (req.kind === 'submit-image-capture') {
    return handleSubmitImageCapture(req);
  }
  if (req.kind === 'submit-video-capture') {
    return handleSubmitVideoCapture(req);
  }
  if (req.kind === 'capture-visible-tab') {
    return handleCaptureVisibleTab(req);
  }
  // Exhaustiveness check — TypeScript narrows req to never here.
  const exhaustive: never = req;
  void exhaustive;
  throw new PlosApiError(0, 'Unknown background request kind');
}

/**
 * Session 6 (2026-05-13) — Module 2 region-screenshot path. Content script
 * cannot call `chrome.tabs.captureVisibleTab` directly (background-only API
 * in MV3); the region-screenshot overlay requests this via the
 * `capture-visible-tab` message. Returns a base64 data URL of the active
 * tab's visible viewport at device-pixel resolution.
 *
 * Permission requirement: captureVisibleTab needs `activeTab`, `<all_urls>`,
 * OR a host permission that matches the active tab's URL. Our wxt.config.ts
 * host_permissions list each supported platform explicitly (amazon, ebay,
 * etsy, walmart), so capture works on those sites. On a non-supported
 * domain the API rejects with a permission error which we surface to the
 * overlay via the standard BackgroundResponse error envelope.
 */
async function handleCaptureVisibleTab(
  req: CaptureVisibleTabRequest,
): Promise<{ dataUrl: string }> {
  void req; // format is currently fixed to 'png'; reserved for future expansion
  // Omit windowId — defaults to the current window's active tab, which is
  // the tab the content-script is running in (and asking us to capture).
  const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    throw new PlosApiError(0, 'captureVisibleTab returned an unexpected value');
  }
  return { dataUrl };
}

/**
 * Session 5 (2026-05-12-i) — end-to-end image-capture handler. Runs the
 * Module 2 regular-image two-phase upload flow per STACK_DECISIONS.md §3:
 *
 *   1. Fetch the image bytes from the host-page's srcUrl. Cross-origin
 *      image CDNs are reachable from the extension origin because their
 *      hostname patterns are declared in wxt.config.ts host_permissions
 *      (the per-platform set: m.media-amazon.com, *.ebayimg.com, etc.).
 *      A PlosApiError(0|status) from the fetch surfaces to the form with
 *      a CDN-not-authorized hint when the platform's CDN isn't covered.
 *   2. Phase 1 — POST `images/requestUpload` with the resolved MIME +
 *      byte length + sourceType. Server returns a 5-minute signed Supabase
 *      Storage URL and the pre-allocated capturedImageId.
 *   3. Phase 2 — direct PUT the bytes to Supabase Storage. Bytes never
 *      pass through Vercel.
 *   4. Phase 3 — POST `images/finalize` with the user's metadata. Server
 *      creates the CapturedImage row and returns it.
 *
 * Idempotency: the content-script form mints a clientId once per Save
 * click and reuses it across any retries. Phase 1 doesn't dedupe (no row
 * yet — server allocates a fresh storage path per call); Phase 3 dedupes
 * on clientId (duplicate clientId returns the existing row with 200).
 * Orphans from failed Phase 2 retries are cleaned by the daily janitor.
 */
async function handleSubmitImageCapture(
  req: SubmitImageCaptureRequestMessage,
): Promise<CapturedImage> {
  // Phase 0 — fetch bytes from extension origin.
  const fetched = await fetchImageBytes(req.srcUrl);

  // Phase 1 — request signed upload URL. The MIME we send to the server
  // is the one we resolved from the CDN response, NOT what the content
  // script believed (the script can't see the bytes; it relies on the
  // background's content-type sniff).
  const phase1 = await requestImageUpload(req.projectId, req.urlId, {
    clientId: req.request.clientId,
    mimeType: fetched.mimeType,
    fileSize: fetched.fileSize,
    sourceType: req.request.sourceType,
    imageCategory: req.request.imageCategory,
  });

  // Phase 2 — direct PUT to Supabase.
  await putImageBytesToSignedUrl(
    phase1.uploadUrl,
    fetched.bytes,
    fetched.mimeType,
  );

  // Phase 3 — finalize and create the CapturedImage row.
  //
  // P-24: persist the host-page <img>.src on regular captures so the
  // content-script saved-image indicator can match. Skip on region-screenshot
  // captures (srcUrl is a base64 data URL — never matches anything on a
  // live page, and storing megabytes of base64 in DB is wasteful).
  const originalSrcUrl =
    req.request.sourceType === 'regular' && !req.srcUrl.startsWith('data:')
      ? req.srcUrl
      : undefined;
  const row = await finalizeImageUpload(req.projectId, req.urlId, {
    clientId: req.request.clientId,
    capturedImageId: phase1.capturedImageId,
    mimeType: fetched.mimeType,
    sourceType: req.request.sourceType,
    fileSize: fetched.fileSize,
    imageCategory: req.finalize.imageCategory,
    composition: req.finalize.composition,
    embeddedText: req.finalize.embeddedText,
    tags: req.finalize.tags,
    ...(originalSrcUrl !== undefined ? { originalSrcUrl } : {}),
  });
  return row;
}

/**
 * P-27 Build #3 (2026-05-22) — end-to-end video capture handler. Two
 * branches mirror the on-wire CapturedVideo sourceType discriminator per
 * CAPTURED_VIDEOS_DESIGN.md §A.7 + §A.9 + §A.11:
 *
 *   EMBED branch:
 *     - Skip Phase 1 (no bytes to upload). Skip Phase 2.
 *     - Phase 3 — finalize with sourceType='EMBED' + originalSrcUrl.
 *
 *   DIRECT_BYTES branch:
 *     - Phase 0 — fetch the video bytes from the host-page srcUrl using
 *       extension-origin fetch (covered by wxt.config.ts host_permissions).
 *     - Phase 0b — decode the canvas-grabbed thumbnail data URL into a
 *       Blob. If thumbnailDataUrl is null (frame-grab failed per §A.12),
 *       skip the thumbnail PUT + omit thumbnailStoragePath from finalize so
 *       the row stores NULL and the renderer falls back to a generic icon.
 *     - Phase 1 — `requestVideoUpload` mints TWO signed URLs (video +
 *       thumbnail) per §A.9.
 *     - Phase 2 — direct PUT of the video bytes to the video signed URL,
 *       and (when present) the thumbnail bytes to the thumbnail signed
 *       URL. Bytes bypass Vercel.
 *     - Phase 3 — `finalizeVideoUpload` with sourceType='DIRECT_BYTES' +
 *       capturedVideoId + videoStoragePath + optional thumbnailStoragePath
 *       + bytes metadata + user metadata.
 *
 * Idempotency: clientId is reused across all phases. Phase 3 dedupes on
 * clientId server-side so retries hit the same row.
 */
async function handleSubmitVideoCapture(
  req: SubmitVideoCaptureRequestMessage,
): Promise<CapturedVideo> {
  if (req.sourceType === 'EMBED') {
    return finalizeVideoUpload(req.projectId, req.urlId, {
      clientId: req.clientId,
      sourceType: 'EMBED',
      originalSrcUrl: req.originalSrcUrl,
      videoCategory: req.videoCategory,
      ...(req.composition !== null ? { composition: req.composition } : {}),
      ...(req.embeddedText !== null ? { embeddedText: req.embeddedText } : {}),
      tags: req.tags,
    });
  }

  // DIRECT_BYTES branch.
  // Phase 0 — fetch the video bytes; the MIME is resolved from Content-Type
  // (the form's mimeTypeHint is a fallback for CDNs that don't set it, but
  // fetchVideoBytes prefers Content-Type when valid).
  const fetched = await fetchVideoBytes(req.srcUrl);

  // Phase 0b — decode the thumbnail data URL into a Blob (when present).
  // `data:image/jpeg;base64,...` → ArrayBuffer. fetch() handles the parsing
  // natively, which works in the service-worker context.
  let thumbnailBlob: ArrayBuffer | null = null;
  if (req.thumbnailDataUrl) {
    try {
      const r = await fetch(req.thumbnailDataUrl);
      thumbnailBlob = await r.arrayBuffer();
    } catch {
      // Defensive — the data URL was produced client-side, so this
      // shouldn't fail in practice. Treat as a NULL-thumbnail fallback
      // per §A.12 rather than failing the whole save.
      thumbnailBlob = null;
    }
  }

  // Phase 1 — mint signed URLs.
  const phase1 = await requestVideoUpload(req.projectId, req.urlId, {
    clientId: req.clientId,
    mimeType: fetched.mimeType,
    fileSize: fetched.fileSize,
  });

  // Phase 2 — direct PUT of the bytes. Run video + thumbnail in parallel;
  // a thumbnail PUT failure is treated as a NULL-thumbnail fallback per
  // §A.12 (the video bytes are the load-bearing data; degraded thumbnail
  // is acceptable). A video-bytes PUT failure throws — that's the real
  // save failure and should surface to the form.
  const videoPut = putVideoBytesToSignedUrl(
    phase1.videoUploadUrl,
    fetched.bytes,
    fetched.mimeType,
  );
  let thumbnailUploaded = false;
  if (thumbnailBlob) {
    try {
      await putVideoThumbnailToSignedUrl(
        phase1.thumbnailUploadUrl,
        thumbnailBlob,
      );
      thumbnailUploaded = true;
    } catch (err) {
      // Log + fall through with NULL thumbnail per §A.12.
      logGlobalError(err, 'sw-handled-error');
    }
  }
  await videoPut;

  // Phase 3 — finalize. Include thumbnailStoragePath only when we actually
  // PUT the thumbnail; the server stores NULL when omitted.
  return finalizeVideoUpload(req.projectId, req.urlId, {
    clientId: req.clientId,
    sourceType: 'DIRECT_BYTES',
    originalSrcUrl: req.srcUrl,
    capturedVideoId: phase1.capturedVideoId,
    videoStoragePath: phase1.videoStoragePath,
    ...(thumbnailUploaded
      ? { thumbnailStoragePath: phase1.thumbnailStoragePath }
      : {}),
    mimeType: fetched.mimeType,
    fileSize: fetched.fileSize,
    ...(req.durationSeconds !== null
      ? { durationSeconds: req.durationSeconds }
      : {}),
    ...(req.width !== null ? { width: req.width } : {}),
    ...(req.height !== null ? { height: req.height } : {}),
    videoCategory: req.videoCategory,
    ...(req.composition !== null ? { composition: req.composition } : {}),
    ...(req.embeddedText !== null ? { embeddedText: req.embeddedText } : {}),
    tags: req.tags,
  });
}

function errorToEnvelope(err: unknown): {
  status: number;
  message: string;
} {
  // P-16: even handled errors leave a structured SW DevTools trace, so
  // when the popup-side sees an `ok: false` response the SW console
  // already shows the matching server-side context. This is independent of
  // the global-rejection listener above — that one only fires for failures
  // nothing else caught; this one fires for every background request that
  // surfaces an error to the caller.
  logGlobalError(err, 'sw-handled-error');
  if (err instanceof PlosApiError) {
    return { status: err.status, message: err.message };
  }
  const message =
    err instanceof Error ? err.message : 'Unknown error in background';
  return { status: 0, message };
}
