// Content-script orchestrator.
//
// Entry point called by entrypoints/content.ts on every page load on the
// 4 supported platforms (amazon.com / ebay.com / etsy.com / walmart.com).
// Coordinates everything described in COMPETITION_SCRAPING_DESIGN.md §B
// 2026-05-07-g end-of-session addendum:
//
//   1. Reads selectedProjectId + selectedPlatform from popup-state.
//   2. Picks the per-platform module from the registry; bails if user
//      hasn't completed setup OR is on the wrong site for their picked
//      platform OR picked a platform deferred to a future session
//      (google-shopping / google-ads / independent-website).
//   3. Fetches the saved CompetitorUrl list for (project, platform) and
//      builds a recognition Set<normalizedUrl>.
//   4. Scans the DOM for product-link anchors; attaches hover handlers
//      that show the floating "+ Add" button; renders the "already saved"
//      icon for any link whose canonical URL is in the cache.
//   5. If location.href (canonicalized + normalized) is in the cache,
//      shows the detail-page "already saved" overlay banner.
//   6. Sets up a MutationObserver to handle SPA navigation + infinite
//      scroll on Etsy + Walmart; rescans on each batch of mutations.
//   7. Listens for chrome.runtime.onMessage from the background's
//      right-click context-menu fallback; opens the URL-add form on demand.

import { listProjects, listCompetitorUrls } from './api-bridge.ts';
import {
  getSelectedPlatform,
  getSelectedProjectId,
} from '../popup-state.ts';
import {
  getModuleByHostname,
  getModuleByPlatform,
} from '../platform-modules/registry.ts';
import type { PlatformModule } from '../platform-modules/types.ts';
import {
  buildRecognitionSet,
  normalizeUrlForRecognition,
} from '../url-normalization.ts';
import { ensureStylesInjected } from './styles.ts';
import { createFloatingAddButton } from './floating-add-button.ts';
import {
  attachAlreadySavedIcon,
  detachAllAlreadySavedIcons,
} from './already-saved-icon.ts';
import { showAlreadySavedOverlay } from './already-saved-overlay.ts';
import { openUrlAddForm } from './url-add-form.ts';
import { isContentScriptMessage } from './messaging.ts';
import { startLiveHighlighting } from './highlight-terms.ts';
import type { LiveHighlightController } from './highlight-terms.ts';

const ATTR_LINK_HANDLED = 'data-plos-cs-handled';
const RESCAN_DEBOUNCE_MS = 250;

/**
 * Marker put on the document body when the orchestrator has run on this
 * page. Prevents double-init in cases where the content script gets
 * loaded twice (rare but possible during dev-mode hot reload + hash-
 * navigation pages where some browsers re-fire the script).
 */
const BODY_MARKER = 'data-plos-cs-active';

export async function runOrchestrator(): Promise<() => void> {
  if (document.body.getAttribute(BODY_MARKER) === '1') {
    return () => {
      // Already running — return a no-op cleanup so the caller's
      // onInvalidated hook still has a function to call.
    };
  }
  document.body.setAttribute(BODY_MARKER, '1');

  // Resolve the user's setup state in parallel — both calls are
  // cheap chrome.storage.local reads.
  const [projectIdRaw, platformRaw] = await Promise.all([
    getSelectedProjectId(),
    getSelectedPlatform(),
  ]);
  if (!projectIdRaw || !platformRaw) {
    cleanupBodyMarker();
    return () => undefined;
  }
  // Re-bind so closures below see the narrowed non-null type.
  const projectId: string = projectIdRaw;
  const platform: string = platformRaw;

  const platformModuleResolved = getModuleByPlatform(platform);
  if (!platformModuleResolved) {
    // User picked a platform that doesn't have a module yet (e.g.,
    // google-shopping deferred to a future session). Don't run.
    cleanupBodyMarker();
    return () => undefined;
  }
  // Re-bind to a non-nullable typed const so closures below see the
  // narrowed type instead of widening back to `PlatformModule | null`.
  const platformModule: PlatformModule = platformModuleResolved;

  // Verify we're on a hostname this module covers — if user picked
  // amazon but is currently on etsy.com, the orchestrator no-ops.
  const pageModule = getModuleByHostname(location.hostname);
  if (pageModule?.platform !== platformModule.platform) {
    cleanupBodyMarker();
    return () => undefined;
  }

  // Fetch the recognition cache. If the API call fails we still let
  // the +Add affordance work — just without the "already saved" hints
  // — so a transient PLOS outage doesn't break URL capture.
  let recognitionSet: Set<string> = new Set();
  try {
    const rows = await listCompetitorUrls(projectId, platform as never);
    recognitionSet = buildRecognitionSet(rows);
  } catch (err) {
    console.warn('[PLOS] could not load saved URLs for recognition', err);
  }

  // Project name lookup for the overlay banner — best effort.
  let projectName: string | null = null;
  try {
    const projects = await listProjects();
    projectName = projects.find((p) => p.id === projectId)?.name ?? null;
  } catch {
    // ignore — overlay falls back to no project name
  }

  ensureStylesInjected();

  // Live-page Highlight Terms (P-5 fix 2026-05-08-d). Boots in parallel
  // with the rest of the orchestrator init; the initial highlight pass
  // runs via requestIdleCallback so the page can finish painting first.
  // Failure (e.g., chrome.storage missing in non-extension runtime) leaves
  // the rest of the orchestrator working — highlights are a nice-to-have.
  let highlighter: LiveHighlightController | null = null;
  try {
    highlighter = await startLiveHighlighting(projectId);
  } catch (err) {
    console.warn('[PLOS] could not start live highlight terms', err);
  }

  const floatingButton = createFloatingAddButton({
    onClick(href, triggerRect) {
      handleAddRequest(href, triggerRect);
    },
  });

  function handleAddRequest(
    href: string,
    triggerRect: DOMRect | null,
  ): void {
    const canonical = platformModule.canonicalProductUrl(href) ?? href;
    floatingButton.hide();
    openUrlAddForm({
      initialUrl: canonical,
      projectId,
      projectName,
      platform: platformModule.platform,
      triggerRect,
      onSaved(row) {
        const normalized = normalizeUrlForRecognition(row.url);
        if (normalized) recognitionSet.add(normalized);
        // Re-scan so the just-saved link's "+ Add" button gets paired
        // with the new "already saved" icon. The existing per-link
        // handlers stay attached; the icon insertion is idempotent.
        scanLinks();
      },
      onClose() {
        // No state to roll back; orchestrator just continues.
      },
    });
  }

  function scanLinks(): void {
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');

    // Dedupe pass: a single product card on Amazon (and likely other
    // platforms) may have 4+ anchor tags pointing to the same product
    // (image link, title link, review-anchor link, price-area link).
    // The "already saved" icon should appear ONCE per saved product, not
    // on every link instance — otherwise a saved product visually clutters
    // the card with multiple checkmarks. Scope: discover URLs that already
    // have an icon attached anywhere in the DOM (from this scan or any
    // previous scan), then skip those during the per-link iteration below.
    const iconUrlSet = new Set<string>();
    document
      .querySelectorAll<HTMLAnchorElement>('a[data-plos-cs-has-icon="1"]')
      .forEach((el) => {
        const canonical = platformModule.canonicalProductUrl(el.href);
        const normalized = normalizeUrlForRecognition(canonical ?? el.href);
        if (normalized) iconUrlSet.add(normalized);
      });

    for (const link of anchors) {
      const href = link.href;
      if (!platformModule.matchesProduct(href)) continue;

      const canonical = platformModule.canonicalProductUrl(href);
      const normalized = normalizeUrlForRecognition(canonical ?? href);

      // Already-saved icon: render at MOST one per unique normalized URL
      // (per the dedupe rationale above). First matching link wins — this
      // is typically the image link on Amazon (which appears earliest in
      // DOM order), giving a visual cue at the top-left of the card.
      if (
        normalized &&
        recognitionSet.has(normalized) &&
        !iconUrlSet.has(normalized)
      ) {
        attachAlreadySavedIcon(link, normalized);
        iconUrlSet.add(normalized);
      }

      // Hover handler: only attach once per link.
      if (link.getAttribute(ATTR_LINK_HANDLED) === '1') continue;
      link.setAttribute(ATTR_LINK_HANDLED, '1');

      link.addEventListener('mouseenter', () => {
        floatingButton.showFor(link, href);
      });
      link.addEventListener('mouseleave', () => {
        floatingButton.hide();
      });
    }
  }

  function maybeShowDetailOverlay(): void {
    const canonical =
      platformModule.canonicalProductUrl(location.href) ??
      location.href;
    const normalized = normalizeUrlForRecognition(canonical);
    if (!normalized) return;
    if (!recognitionSet.has(normalized)) return;
    showAlreadySavedOverlay(projectName);
  }

  // Initial scan + detail-page overlay check.
  scanLinks();
  maybeShowDetailOverlay();

  // Watch for DOM changes (Amazon/Ebay/Etsy/Walmart all use SPA-style
  // routing or infinite-scroll for search results). Debounce rescans
  // so we don't re-walk the whole DOM on every micro-mutation.
  let rescanTimer: ReturnType<typeof setTimeout> | null = null;
  const observer = new MutationObserver(() => {
    if (rescanTimer !== null) return; // already pending
    rescanTimer = setTimeout(() => {
      rescanTimer = null;
      scanLinks();
      // P-5 fix 2026-05-08-d: re-apply highlight terms on each mutation
      // batch so newly-rendered SPA content / infinite-scroll tiles get
      // their highlights too. The highlighter does its own remove-then-
      // reapply pass — idempotent.
      if (highlighter !== null) {
        void highlighter.refresh();
      }
    }, RESCAN_DEBOUNCE_MS);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Watch for SPA URL changes via popstate + a manual pushState shim.
  // The detail-page overlay should re-evaluate when the URL changes
  // even without a full page reload.
  const onLocationChange = (): void => {
    maybeShowDetailOverlay();
    if (highlighter !== null) {
      void highlighter.refresh();
    }
  };
  window.addEventListener('popstate', onLocationChange);

  // Listen for context-menu fallback messages from the background.
  const onMessage = (
    msg: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (resp?: unknown) => void,
  ): void => {
    if (!isContentScriptMessage(msg)) return;
    if (msg.kind === 'open-url-add-form') {
      // Right-click context-menu fallback — no trigger rect (the click
      // happened on the host page link, not on the floating "+" button).
      // Form falls back to centered layout.
      handleAddRequest(msg.href, null);
      sendResponse({ ok: true });
    }
  };
  chrome.runtime.onMessage.addListener(onMessage);

  return function cleanup(): void {
    observer.disconnect();
    window.removeEventListener('popstate', onLocationChange);
    chrome.runtime.onMessage.removeListener(onMessage);
    floatingButton.destroy();
    detachAllAlreadySavedIcons();
    if (highlighter !== null) {
      highlighter.destroy();
      highlighter = null;
    }
    cleanupBodyMarker();
  };
}

function cleanupBodyMarker(): void {
  document.body.removeAttribute(BODY_MARKER);
}
