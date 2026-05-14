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
  finalizeImageUpload,
  listCompetitorUrls,
  listProjects,
  listVocabularyEntries,
  putImageBytesToSignedUrl,
  requestImageUpload,
} from '../lib/api-client';
import {
  isBackgroundRequest,
  type BackgroundRequest,
  type BackgroundResponse,
  type CaptureVisibleTabRequest,
  type ContentScriptMessage,
  type SubmitImageCaptureRequestMessage,
} from '../lib/content-script/messaging';
import type { CapturedImage } from '../../../../src/lib/shared-types/competition-scraping';

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

export default defineBackground(() => {
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
  });
  return row;
}

function errorToEnvelope(err: unknown): {
  status: number;
  message: string;
} {
  if (err instanceof PlosApiError) {
    return { status: err.status, message: err.message };
  }
  const message =
    err instanceof Error ? err.message : 'Unknown error in background';
  return { status: 0, message };
}
