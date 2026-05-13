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
//
// Future build sessions add: region-screenshot mode (Module 2 gesture 2
// — captureVisibleTab + canvas crop; deferred to session 6 per the session
// 5 scope split), WAL replay on startup, periodic reconciliation poller,
// navigator.onLine handlers.

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
        contexts: ['image'],
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
      // Session 5 — regular-image gesture. Chrome populates `info.srcUrl`
      // with the image's resolved URL (handles relative srcs against the
      // page's base URL). Image with `srcset` resolves to the URL the
      // browser picked for the current viewport, which is fine — the user
      // sees that resolution in the page.
      const srcUrl = typeof info.srcUrl === 'string' ? info.srcUrl : '';
      const pageUrl =
        typeof info.pageUrl === 'string' ? info.pageUrl : tab?.url ?? '';
      if (!srcUrl) {
        // Degenerate click — no image URL. Bail silently; Chrome's UI
        // already gave the user the menu entry so re-clicking is the
        // straightforward recovery.
        return;
      }
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
  // Exhaustiveness check — TypeScript narrows req to never here.
  const exhaustive: never = req;
  void exhaustive;
  throw new PlosApiError(0, 'Unknown background request kind');
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
