// Background service worker for the Competition Scraping extension.
//
// Phase 1 scope as of session 3 (extended 2026-05-08-c):
//   - Importing the supabase module keeps the auto-refresh-token loop alive
//     while Chrome considers the service worker "active."
//   - Registers a right-click context menu item per
//     COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #6:
//     "Add to PLOS — Competition Scraping" is always available on link
//     right-click as a redundant secondary path to the floating "+ Add"
//     button. Click sends an `open-url-add-form` message to the active
//     tab's content script.
//   - Listens for BackgroundRequest messages from content scripts and
//     proxies them to the PLOS API. Content scripts cannot reach vklf.com
//     directly because their fetches originate from the host page's
//     origin (amazon.com, etc.) which is NOT in vklf.com's CORS allowlist
//     (`chrome-extension://*` only). The background runs in the extension
//     origin, so its fetch passes preflight. Discovered + fixed during
//     Waypoint #1 attempt #3 — see verification backlog attempt log.
//
// Future build sessions add: WAL replay on startup, periodic reconciliation
// poller, navigator.onLine handlers.

import { supabase } from '../lib/supabase';
import {
  PlosApiError,
  createCompetitorUrl,
  listCompetitorUrls,
  listProjects,
} from '../lib/api-client';
import {
  isBackgroundRequest,
  type BackgroundRequest,
  type BackgroundResponse,
  type ContentScriptMessage,
} from '../lib/content-script/messaging';

void supabase;

const CONTEXT_MENU_ID = 'plos-add-to-competition-scraping';
const CONTEXT_MENU_TITLE = 'Add to PLOS — Competition Scraping';

export default defineBackground(() => {
  // Register the context-menu entry once, on install / update. Chrome's
  // contextMenus API errors if the same id is created twice; remove-then-
  // create makes this idempotent across reloads.
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: CONTEXT_MENU_TITLE,
        contexts: ['link'],
      });
    });
  });

  // On context-menu click, forward the link's URL to the active tab's
  // content script so it can open the URL-add overlay form.
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== CONTEXT_MENU_ID) return;
    const href = info.linkUrl;
    const tabId = tab?.id;
    if (typeof href !== 'string' || typeof tabId !== 'number') return;
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
