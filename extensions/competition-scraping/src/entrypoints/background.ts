// Background service worker for the Competition Scraping extension.
//
// Phase 1 scope as of session 4 (extended 2026-05-11):
//   - Importing the supabase module keeps the auto-refresh-token loop alive
//     while Chrome considers the service worker "active."
//   - Registers TWO right-click context menu items:
//     1. "Add to PLOS — Competition Scraping" on link right-click per
//        COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail
//        #6 — always available as a redundant secondary path to the floating
//        "+ Add" button. Click sends an `open-url-add-form` message to the
//        active tab's content script. Shipped session 3 (2026-05-07-h).
//     2. "Add to PLOS — Captured Text" on text selection per §A.7 Module 2
//        highlight-and-add gesture. Director-picked Option A (right-click
//        context-menu only) at session 4 start 2026-05-11. Click sends an
//        `open-text-capture-form` message with the selected text + page URL.
//   - Listens for BackgroundRequest messages from content scripts and
//     proxies them to the PLOS API. Content scripts cannot reach vklf.com
//     directly because their fetches originate from the host page's
//     origin (amazon.com, etc.) which is NOT in vklf.com's CORS allowlist
//     (`chrome-extension://*` only). The background runs in the extension
//     origin, so its fetch passes preflight. Discovered + fixed during
//     Waypoint #1 attempt #3 — see verification backlog attempt log.
//
// Future build sessions add: image-capture context menu, WAL replay on
// startup, periodic reconciliation poller, navigator.onLine handlers.

import { supabase } from '../lib/supabase';
import {
  PlosApiError,
  createCapturedText,
  createCompetitorUrl,
  createVocabularyEntry,
  listCompetitorUrls,
  listProjects,
  listVocabularyEntries,
} from '../lib/api-client';
import {
  isBackgroundRequest,
  type BackgroundRequest,
  type BackgroundResponse,
  type ContentScriptMessage,
} from '../lib/content-script/messaging';

void supabase;

const CONTEXT_MENU_URL_ID = 'plos-add-to-competition-scraping';
const CONTEXT_MENU_URL_TITLE = 'Add to PLOS — Competition Scraping';

// Session 4 (2026-05-11) — text-capture context menu. Fires on text
// selection; "Add to PLOS — Captured Text" routes the selected text + the
// page URL to the content-script's text-capture form.
const CONTEXT_MENU_TEXT_ID = 'plos-add-captured-text';
const CONTEXT_MENU_TEXT_TITLE = 'Add to PLOS — Captured Text';

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
  // Exhaustiveness check — TypeScript narrows req to never here.
  const exhaustive: never = req;
  void exhaustive;
  throw new PlosApiError(0, 'Unknown background request kind');
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
