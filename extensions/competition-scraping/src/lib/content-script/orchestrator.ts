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
// P-10 fix 2026-05-10: debounce window for the detail-overlay banner
// check after a detected URL change. Walmart's React Router can pushState
// several times in quick succession during a single navigation; only the
// final URL should trigger a banner check.
const OVERLAY_CHECK_DEBOUNCE_MS = 150;

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
    // P-6 + P-4 synergy: detection runs on the ORIGINAL href (pre-
    // canonicalization), since canonicalProductUrl strips the SSPA wrapper.
    // Optional method on the platform module — absent on platforms without
    // sponsored-ad detection (today: only Amazon implements).
    const sponsoredDetected =
      platformModule.detectsAsSponsored?.(href) ?? false;
    floatingButton.hide();
    openUrlAddForm({
      initialUrl: canonical,
      projectId,
      projectName,
      platform: platformModule.platform,
      triggerRect,
      defaultIsSponsoredAd: sponsoredDetected,
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

  // P-10 fix 2026-05-10: dedupe banner-fire by location.href. Tracks the
  // LAST URL we considered (not the last URL we showed for) so the
  // navigate-away-and-back case correctly re-fires the banner:
  //   A(saved) → set lastOverlayUrl='A', show
  //   B(unsaved) → set lastOverlayUrl='B', no show (recognition miss)
  //   A again  → set lastOverlayUrl='A', show
  // Without dedupe, Walmart's React routing can fire several URL-change
  // events for the same destination during a single navigation, causing
  // the banner to flicker on/off.
  let lastOverlayUrl: string | null = null;

  function maybeShowDetailOverlay(): void {
    if (lastOverlayUrl === location.href) return;
    lastOverlayUrl = location.href;
    const canonical =
      platformModule.canonicalProductUrl(location.href) ??
      location.href;
    const normalized = normalizeUrlForRecognition(canonical);
    if (!normalized) return;
    if (!recognitionSet.has(normalized)) return;
    showAlreadySavedOverlay(projectName);
  }

  // P-10 fix 2026-05-10: debounce overlay checks across rapid-fire
  // location changes. A cancellable timer ensures only the final URL
  // gets a banner check after a burst of pushState calls.
  let overlayCheckTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleDetailOverlayCheck(): void {
    if (overlayCheckTimer !== null) clearTimeout(overlayCheckTimer);
    overlayCheckTimer = setTimeout(() => {
      overlayCheckTimer = null;
      maybeShowDetailOverlay();
      if (highlighter !== null) {
        void highlighter.refresh();
      }
    }, OVERLAY_CHECK_DEBOUNCE_MS);
  }

  // P-10 fix 2026-05-10: track URL across MutationObserver ticks so we
  // can detect SPA navigation that doesn't fire popstate. Chrome content
  // scripts run in an isolated world with their own `window.history`, so
  // patching pushState in the content-script context does NOT intercept
  // host-page React Router calls (Walmart, etc.). The MutationObserver
  // is our reliable cross-context signal: SPA navigation always causes
  // immediate DOM mutation, and the URL change is observable from the
  // shared DOM/location.
  let lastObservedUrl: string = location.href;

  // Initial scan + initial detail-page overlay check (debounced by
  // OVERLAY_CHECK_DEBOUNCE_MS so the URL has time to stabilize after
  // content-script load — relevant on platforms whose routing re-writes
  // the URL right after the initial render).
  scanLinks();
  scheduleDetailOverlayCheck();

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
      // P-10 fix 2026-05-10: detect SPA URL change since last tick.
      // Walmart's React routing uses history.pushState() which doesn't
      // fire popstate; this is our cross-context-safe detection.
      if (location.href !== lastObservedUrl) {
        lastObservedUrl = location.href;
        scheduleDetailOverlayCheck();
      }
    }, RESCAN_DEBOUNCE_MS);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Watch for SPA URL changes via popstate (back/forward navigation —
  // fires reliably in content-script context). pushState/replaceState
  // are caught via the MutationObserver-based detection above instead
  // (see comment on lastObservedUrl).
  const onLocationChange = (): void => {
    if (location.href !== lastObservedUrl) {
      lastObservedUrl = location.href;
    }
    scheduleDetailOverlayCheck();
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
    // P-10 fix 2026-05-10: clear pending overlay check + rescan timers
    // so they don't fire after teardown.
    if (overlayCheckTimer !== null) {
      clearTimeout(overlayCheckTimer);
      overlayCheckTimer = null;
    }
    if (rescanTimer !== null) {
      clearTimeout(rescanTimer);
      rescanTimer = null;
    }
    cleanupBodyMarker();
  };
}

function cleanupBodyMarker(): void {
  document.body.removeAttribute(BODY_MARKER);
}
