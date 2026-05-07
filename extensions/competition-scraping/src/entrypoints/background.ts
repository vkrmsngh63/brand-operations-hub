// Background service worker for the Competition Scraping extension.
//
// Phase 1 scope as of session 3:
//   - Importing the supabase module keeps the auto-refresh-token loop alive
//     while Chrome considers the service worker "active."
//   - Registers a right-click context menu item per
//     COMPETITION_SCRAPING_STACK_DECISIONS.md §5 implementation guardrail #6:
//     "Add to PLOS — Competition Scraping" is always available on link
//     right-click as a redundant secondary path to the floating "+ Add"
//     button. Click sends an `open-url-add-form` message to the active
//     tab's content script.
//
// Future build sessions add: WAL replay on startup, periodic reconciliation
// poller, navigator.onLine handlers.

import { supabase } from '../lib/supabase';
import type { ContentScriptMessage } from '../lib/content-script/messaging';

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
});
