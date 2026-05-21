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

import {
  listProjects,
  listCompetitorUrls,
  listCapturedImages,
  listCapturedTexts,
  listCapturedVideos,
} from './api-bridge.ts';
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
import {
  attachAlreadySavedImageIcon,
  detachAllAlreadySavedImageIcons,
  type AttachedImageIcon,
} from './already-saved-image-icon.ts';
import {
  attachAlreadySavedVideoIcon,
  detachAllAlreadySavedVideoIcons,
  type AttachedVideoIcon,
} from './already-saved-video-icon.ts';
import {
  attachSavedTextHaze,
  detachAllSavedTextHazes,
  detachSavedTextHaze,
} from './saved-text-highlight.ts';
import {
  decodeSelector,
  deserializeSelectorToRange,
  encodeSelector,
  serializeRangeToSelector,
} from '../captured-text-selector.ts';
import type {
  CapturedImageWithUrls,
  CapturedText,
  CapturedVideoWithUrls,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { showAlreadySavedOverlay } from './already-saved-overlay.ts';
import { openUrlAddForm } from './url-add-form.ts';
import { openTextCaptureForm } from './text-capture-form.ts';
import { openImageCaptureForm } from './image-capture-form.ts';
import { openVideoCaptureForm } from './video-capture-form.ts';
import { openRegionScreenshotOverlay } from './region-screenshot-overlay.ts';
import { findUnderlyingImage } from './find-underlying-image.ts';
import {
  findUnderlyingVideoEmbed,
  type FindUnderlyingVideoResult,
} from './find-underlying-video-embed.ts';
import { showCaptureFailureToast } from './capture-failure-toast.ts';
import { isContentScriptMessage } from './messaging.ts';
import type { Platform } from '../../../../../src/lib/shared-types/competition-scraping.ts';
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

  // P-23 fix 2026-05-14: attach the contextmenu capture-phase listener at
  // the top of runOrchestrator — BEFORE any awaits — so the underlying-
  // image cache is wired by the time the BODY_MARKER signal is observable.
  // Right-clicks before this point in init can't be intercepted (orchestrator
  // hasn't run yet); right-clicks during the rest of init reliably populate
  // the cache. Cache is closed over by the open-image-capture-form handler
  // attached later in this function. See find-underlying-image.ts for the
  // walk semantics + cache-on-every-right-click rationale.
  //
  // P-25 (2026-05-19-f): the same listener also snapshots the user's
  // current text-selection Range as a serialized selector. The Range is
  // lost across the message round-trip to background and back (Chrome's
  // `info.selectionText` strips it to a string), so we have to capture it
  // synchronously here BEFORE the menu opens. The serialized selector is
  // persisted server-side on save so later visits can re-render the haze.
  let lastRightClickImageSrc: string | null = null;
  let lastRightClickSelectorJson: string | null = null;
  // P-27 Build #3 (2026-05-22) — same snapshot pattern for video. The
  // findUnderlyingVideoEmbed helper returns BOTH the URL info AND the
  // <video> element reference (for direct kinds; the form's canvas frame-
  // grab needs the live element). The result is consumed on the next
  // `open-video-capture-form` message → reset after each consumption so a
  // later right-click without a media target doesn't inherit a stale
  // snapshot.
  let lastRightClickVideoResult: FindUnderlyingVideoResult | null = null;
  const onContextMenu = (event: MouseEvent): void => {
    const target = event.target instanceof Element ? event.target : null;
    lastRightClickImageSrc = findUnderlyingImage(target);
    // Build #8 (2026-05-23): pass viewport coordinates so the walker can
    // run its stacked-elements fallback when the original target's
    // ancestor chain misses a video in a sibling subtree (Amazon hover-
    // preview overlay; Bug #9 + #14a).
    lastRightClickVideoResult = findUnderlyingVideoEmbed(target, {
      clickX: event.clientX,
      clickY: event.clientY,
    });
    // Snapshot the active selection range. Wrapped in try/catch because
    // pages with shadow DOM or detached selections can throw on
    // getRangeAt — we silently treat that as "no selector available."
    lastRightClickSelectorJson = null;
    try {
      const sel = window.getSelection();
      if (
        sel !== null &&
        !sel.isCollapsed &&
        sel.rangeCount > 0 &&
        document.body !== null
      ) {
        const range = sel.getRangeAt(0);
        const parsed = serializeRangeToSelector(range, document.body);
        if (parsed !== null) lastRightClickSelectorJson = encodeSelector(parsed);
      }
    } catch {
      // Defensive: silent fail — the form still works without a selector,
      // it just doesn't get the on-page haze on later visits.
    }
  };
  document.addEventListener('contextmenu', onContextMenu, { capture: true });
  function detachContextMenuListener(): void {
    document.removeEventListener('contextmenu', onContextMenu, {
      capture: true,
    });
  }

  // Resolve the user's setup state in parallel — both calls are
  // cheap chrome.storage.local reads.
  const [projectIdRaw, platformRaw] = await Promise.all([
    getSelectedProjectId(),
    getSelectedPlatform(),
  ]);
  if (!projectIdRaw || !platformRaw) {
    detachContextMenuListener();
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
    detachContextMenuListener();
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
    detachContextMenuListener();
    cleanupBodyMarker();
    return () => undefined;
  }

  // Fetch the recognition cache. If the API call fails we still let
  // the +Add affordance work — just without the "already saved" hints
  // — so a transient PLOS outage doesn't break URL capture.
  let recognitionSet: Set<string> = new Set();
  // P-24: normalized-URL → urlId map, built alongside the recognitionSet so
  // maybeShowDetailOverlay can fetch the saved CapturedImage list for the
  // current page when it matches a saved row.
  const urlIdByNormalized = new Map<string, string>();
  try {
    const rows = await listCompetitorUrls(projectId, platform as never);
    // P-21 (2026-05-18-c): symmetric canonicalize. Pass the active platform
    // module's canonicalProductUrl so each saved row's URL is collapsed to its
    // canonical product form BEFORE normalization. Without this, a row saved
    // as a slug-variant (e.g. user pasted `/Product-Name/dp/{ASIN}/ref=…`
    // into the URL-add form) would fail to match the hover-time + overlay
    // lookups below, which already canonicalize the LEFT side.
    recognitionSet = buildRecognitionSet(rows, (href) =>
      platformModule.canonicalProductUrl(href),
    );
    // Populate the urlId map with the same canonicalize-then-normalize chain.
    for (const row of rows) {
      if (typeof row.url !== 'string' || typeof row.id !== 'string') continue;
      const canonical =
        platformModule.canonicalProductUrl(row.url) ?? row.url;
      const normalized = normalizeUrlForRecognition(canonical);
      if (normalized !== '') urlIdByNormalized.set(normalized, row.id);
    }
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

  // P-14 fix 2026-05-12-e: forward-declare the orchestrator's
  // MutationObserver so the highlight-terms refresh can disconnect +
  // reconnect it around each pass. The applicator's strip-and-reapply of
  // <mark> elements would otherwise feed back into this MO and trigger an
  // immediate re-refresh — the self-feedback loop that produced the
  // highlight flashing + text-selection collapse described in the P-14
  // polish entry. The closure binds late: `observer` is still null when
  // muteMutationObserver is first invoked from the highlighter's
  // requestIdleCallback-scheduled initial pass (the orchestrator hasn't
  // constructed the real observer yet at that point); disconnect/observe
  // safely no-op via optional chaining in that window.
  let observer: MutationObserver | null = null;
  async function muteMutationObserver<T>(
    work: () => Promise<T>,
  ): Promise<T> {
    observer?.disconnect();
    try {
      return await work();
    } finally {
      // takeRecords() drains any records that snuck through before the
      // disconnect landed; observe() restarts observation with no backlog
      // so the highlight refresh's own mutations don't enqueue a tick.
      observer?.takeRecords();
      observer?.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Live-page Highlight Terms (P-5 fix 2026-05-08-d). Boots in parallel
  // with the rest of the orchestrator init; the initial highlight pass
  // runs via requestIdleCallback so the page can finish painting first.
  // Failure (e.g., chrome.storage missing in non-extension runtime) leaves
  // the rest of the orchestrator working — highlights are a nice-to-have.
  let highlighter: LiveHighlightController | null = null;
  try {
    highlighter = await startLiveHighlighting(projectId, {
      muteMutationObserver,
    });
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
        // P-21 (2026-05-18-c): symmetric canonicalize. Apply canonicalProductUrl
        // to the newly-saved row's URL before normalizing + adding to the Set,
        // matching the init-time buildRecognitionSet path above. Without this,
        // a row saved as a slug-variant would land in the Set in non-canonical
        // form and miss subsequent hover-time canonical lookups.
        const canonical =
          platformModule.canonicalProductUrl(row.url) ?? row.url;
        const normalized = normalizeUrlForRecognition(canonical);
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

  // ─── P-24 saved-image indicator state ────────────────────────────────
  //
  // Cached saved-CapturedImage list per (project, urlId). One fetch per
  // (urlId) per page-load is enough — the indicator is a recognition cue,
  // not a real-time mirror. If the user saves a new image while on the
  // page, the orchestrator's `handleAddRequest` flow doesn't currently
  // refresh the image cache (acceptable — director will see the indicator
  // on the next page reload). Future polish could push a cache-invalidation
  // hook from image-capture-form's onSaved into orchestrator.
  const capturedImagesByUrlId = new Map<string, CapturedImageWithUrls[]>();
  let currentUrlIdForImages: string | null = null;
  const attachedImageIcons = new Map<string, AttachedImageIcon>();

  // ─── P-25 saved-text haze state ──────────────────────────────────────
  //
  // Cached saved-CapturedText list per (project, urlId). Same one-fetch-
  // per-page-load model as P-24's image cache — the haze is a recognition
  // cue, not a real-time mirror. Rows with a non-null selector get
  // re-located in the live DOM via deserializeSelectorToRange + registered
  // with the CSS Custom Highlight API. Rows with null selector (legacy
  // pre-P-25 captures, manual-add rows) are skipped silently.
  const capturedTextsByUrlId = new Map<string, CapturedText[]>();
  // Set of CapturedText ids currently attached for the active URL — used
  // to detach hazes whose row is no longer in the latest fetch (e.g.,
  // user deleted via PLOS-side UI between rescans).
  const attachedTextIds = new Set<string>();

  async function maybePopulateImageCache(urlId: string): Promise<void> {
    if (capturedImagesByUrlId.has(urlId)) return;
    try {
      const rows = await listCapturedImages(projectId, urlId);
      capturedImagesByUrlId.set(urlId, rows);
    } catch (err) {
      console.warn(
        '[PLOS] could not load saved images for recognition',
        err,
      );
      // Negative-cache the failure so we don't refetch on every rescan.
      capturedImagesByUrlId.set(urlId, []);
    }
  }

  function scanImages(): void {
    if (currentUrlIdForImages === null) return;
    const saved = capturedImagesByUrlId.get(currentUrlIdForImages);
    if (!saved || saved.length === 0) return;

    // Index saved rows by their originalSrcUrl for O(1) lookup. Rows with a
    // null originalSrcUrl (legacy captures, region-screenshot captures) are
    // skipped — they have no host-page-image anchor to attach to.
    const rowsBySrc = new Map<string, CapturedImageWithUrls>();
    for (const row of saved) {
      if (row.originalSrcUrl) rowsBySrc.set(row.originalSrcUrl, row);
    }
    if (rowsBySrc.size === 0) return;

    // Walk <img> elements; first match per saved id wins (host pages
    // sometimes render the same image multiple times — only one indicator
    // per saved row is wanted, mirroring the URL-icon dedupe rationale).
    const activeIds = new Set<string>();
    const imgs = document.querySelectorAll<HTMLImageElement>('img');
    for (const img of imgs) {
      const match =
        rowsBySrc.get(img.currentSrc) ?? rowsBySrc.get(img.src) ?? null;
      if (!match) continue;
      if (activeIds.has(match.id)) continue; // already indicator-attached this rescan

      const existing = attachedImageIcons.get(match.id);
      if (existing && existing.imgEl === img) {
        // Same img element still matched — just refresh position.
        existing.reposition();
      } else {
        if (existing) {
          existing.iconEl.remove();
          attachedImageIcons.delete(match.id);
        }
        const icon = attachAlreadySavedImageIcon(img, match.id);
        if (icon) attachedImageIcons.set(match.id, icon);
      }
      activeIds.add(match.id);
    }

    // Detach icons whose img no longer matches (page changed, image
    // unmounted by SPA, lazy-load swap, etc.).
    for (const [id, icon] of Array.from(attachedImageIcons.entries())) {
      if (!activeIds.has(id)) {
        icon.iconEl.remove();
        attachedImageIcons.delete(id);
      }
    }
  }

  function repositionImageIcons(): void {
    for (const icon of attachedImageIcons.values()) {
      icon.reposition();
    }
  }

  function clearImageIndicators(): void {
    detachAllAlreadySavedImageIcons();
    attachedImageIcons.clear();
    currentUrlIdForImages = null;
  }

  // ── P-27 Build #4: saved-video indicator scan ──────────────────────────
  //
  // Mirrors the saved-image-icon scan loop. Two element types match a
  // saved CapturedVideo row:
  //   - DIRECT_BYTES rows match a host-page <video> element whose
  //     currentSrc (or src fallback) equals the row's originalSrcUrl.
  //   - EMBED rows match a recognized <iframe> whose src equals the row's
  //     originalSrcUrl. The iframe is recognized at right-click time via
  //     detectEmbedPlatform; the same hostname allowlist applies at
  //     scan time, but the scan only needs URL equality — the
  //     content-script-already saw the iframe at capture time, so the
  //     iframe.src that matches the saved row is the same value.
  // For v1 we match exact strings (the iframe src at scan time on the same
  // page is the same string the user right-clicked at capture time). If
  // real-world use surfaces normalization mismatches, a future polish
  // item adds a canonicalizer.
  const capturedVideosByUrlId = new Map<string, CapturedVideoWithUrls[]>();
  const attachedVideoIcons = new Map<string, AttachedVideoIcon>();

  async function maybePopulateVideoCache(urlId: string): Promise<void> {
    if (capturedVideosByUrlId.has(urlId)) return;
    try {
      const rows = await listCapturedVideos(projectId, urlId);
      capturedVideosByUrlId.set(urlId, rows);
    } catch (err) {
      console.warn(
        '[PLOS] could not load saved videos for recognition',
        err,
      );
      // Negative-cache the failure so we don't refetch on every rescan.
      capturedVideosByUrlId.set(urlId, []);
    }
  }

  function scanVideos(): void {
    if (currentUrlIdForImages === null) return;
    const saved = capturedVideosByUrlId.get(currentUrlIdForImages);
    if (!saved || saved.length === 0) return;

    const rowsBySrc = new Map<string, CapturedVideoWithUrls>();
    for (const row of saved) {
      if (row.originalSrcUrl) rowsBySrc.set(row.originalSrcUrl, row);
    }
    if (rowsBySrc.size === 0) return;

    const activeIds = new Set<string>();

    // <video> elements — match against currentSrc first, then src fallback.
    const videos = document.querySelectorAll<HTMLVideoElement>('video');
    for (const video of videos) {
      const match =
        rowsBySrc.get(video.currentSrc) ?? rowsBySrc.get(video.src) ?? null;
      if (!match) continue;
      if (activeIds.has(match.id)) continue;
      const existing = attachedVideoIcons.get(match.id);
      if (existing && existing.targetEl === video) {
        existing.reposition();
      } else {
        if (existing) {
          existing.iconEl.remove();
          attachedVideoIcons.delete(match.id);
        }
        const icon = attachAlreadySavedVideoIcon(video, match.id);
        if (icon) attachedVideoIcons.set(match.id, icon);
      }
      activeIds.add(match.id);
    }

    // <iframe> elements — match against src only (no currentSrc on iframes).
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
    for (const iframe of iframes) {
      const match = rowsBySrc.get(iframe.src) ?? null;
      if (!match) continue;
      if (activeIds.has(match.id)) continue;
      const existing = attachedVideoIcons.get(match.id);
      if (existing && existing.targetEl === iframe) {
        existing.reposition();
      } else {
        if (existing) {
          existing.iconEl.remove();
          attachedVideoIcons.delete(match.id);
        }
        const icon = attachAlreadySavedVideoIcon(iframe, match.id);
        if (icon) attachedVideoIcons.set(match.id, icon);
      }
      activeIds.add(match.id);
    }

    // Detach icons whose target no longer matches.
    for (const [id, icon] of Array.from(attachedVideoIcons.entries())) {
      if (!activeIds.has(id)) {
        icon.iconEl.remove();
        attachedVideoIcons.delete(id);
      }
    }
  }

  function repositionVideoIcons(): void {
    for (const icon of attachedVideoIcons.values()) {
      icon.reposition();
    }
  }

  function clearVideoIndicators(): void {
    detachAllAlreadySavedVideoIcons();
    attachedVideoIcons.clear();
  }

  async function maybePopulateTextCache(urlId: string): Promise<void> {
    if (capturedTextsByUrlId.has(urlId)) return;
    try {
      const rows = await listCapturedTexts(projectId, urlId);
      capturedTextsByUrlId.set(urlId, rows);
    } catch (err) {
      console.warn(
        '[PLOS] could not load saved texts for haze',
        err,
      );
      // Negative-cache the failure so we don't refetch on every rescan.
      capturedTextsByUrlId.set(urlId, []);
    }
  }

  function scanTextHazes(urlId: string): void {
    const saved = capturedTextsByUrlId.get(urlId);
    if (!saved || saved.length === 0) return;

    const desiredIds = new Set<string>();
    for (const row of saved) {
      if (row.selector === null) continue;
      const parsed = decodeSelector(row.selector);
      if (parsed === null) continue;
      // document.body is the SelectorElement root the serializer used at
      // capture time. Best-effort: silent skip if the Range can't be
      // re-located in the current DOM (page restructured, anchor missing).
      const range = deserializeSelectorToRange(parsed, document.body);
      if (range === null) continue;
      attachSavedTextHaze(range, row.id);
      desiredIds.add(row.id);
    }

    // Detach hazes whose row no longer exists in the latest fetch OR whose
    // Range could no longer be re-located. The desiredIds set is the
    // ground truth for what SHOULD be attached.
    for (const id of Array.from(attachedTextIds)) {
      if (!desiredIds.has(id)) {
        detachSavedTextHaze(id);
        attachedTextIds.delete(id);
      }
    }
    for (const id of desiredIds) attachedTextIds.add(id);
  }

  function clearTextHazes(): void {
    detachAllSavedTextHazes();
    attachedTextIds.clear();
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
    if (!normalized) {
      // Navigated to a URL we can't even parse — drop image + video indicators.
      if (attachedImageIcons.size > 0) clearImageIndicators();
      if (attachedVideoIcons.size > 0) clearVideoIndicators();
      return;
    }
    if (!recognitionSet.has(normalized)) {
      // Navigated off any saved URL — drop indicators + text hazes.
      if (attachedImageIcons.size > 0) clearImageIndicators();
      if (attachedVideoIcons.size > 0) clearVideoIndicators();
      if (attachedTextIds.size > 0) clearTextHazes();
      return;
    }
    // P-19 fix 2026-05-18-d: pass the same muteMutationObserver wrapper
    // used for the highlighter (P-14). Overlay teardown (auto-dismiss at
    // 5s OR close-button click) removes the banner from the DOM; without
    // the mute, that removal triggers this orchestrator's MutationObserver
    // → debounced highlighter.refresh() → strip-and-reapply <mark>
    // elements → collapse the user's active text selection on the page.
    showAlreadySavedOverlay(projectName, { muteMutationObserver });

    // P-24: fetch saved CapturedImage rows for this URL and scan <img>
    // elements. Fire-and-forget — if the API call is slow, the indicators
    // appear when the response lands; the rest of the orchestrator keeps
    // working in the meantime.
    const urlId = urlIdByNormalized.get(normalized) ?? null;
    if (urlId === null) {
      if (attachedImageIcons.size > 0) clearImageIndicators();
      if (attachedVideoIcons.size > 0) clearVideoIndicators();
      if (attachedTextIds.size > 0) clearTextHazes();
      return;
    }
    if (currentUrlIdForImages !== urlId) {
      // URL changed (or first time on a saved page) — clear stale icons +
      // hazes from any previous saved URL before fetching the new list.
      detachAllAlreadySavedImageIcons();
      attachedImageIcons.clear();
      detachAllAlreadySavedVideoIcons();
      attachedVideoIcons.clear();
      clearTextHazes();
      currentUrlIdForImages = urlId;
    }
    void maybePopulateImageCache(urlId).then(() => {
      // Re-check we're still on the same urlId — fast SPA navigation can
      // change `currentUrlIdForImages` while the fetch was in flight.
      if (currentUrlIdForImages === urlId) scanImages();
    });
    // P-27 Build #4: fetch saved CapturedVideo rows in parallel with images.
    void maybePopulateVideoCache(urlId).then(() => {
      if (currentUrlIdForImages === urlId) scanVideos();
    });
    // P-25: fetch saved CapturedText rows in parallel with images. Same
    // fire-and-forget pattern; haze appears when the response lands.
    void maybePopulateTextCache(urlId).then(() => {
      if (currentUrlIdForImages === urlId) scanTextHazes(urlId);
    });
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
  //
  // P-14 fix 2026-05-12-e: assign to the forward-declared `observer` so
  // muteMutationObserver can disconnect+reconnect the same instance during
  // each highlight refresh pass. The variable is the SAME one declared as
  // `let observer: MutationObserver | null = null;` above — do not
  // re-declare with const here or the closure will read a stale null.
  let rescanTimer: ReturnType<typeof setTimeout> | null = null;
  observer = new MutationObserver(() => {
    if (rescanTimer !== null) return; // already pending
    rescanTimer = setTimeout(() => {
      rescanTimer = null;
      scanLinks();
      // P-24: re-scan <img> elements so newly-rendered images (lazy-load,
      // SPA tile mounts, infinite scroll) get the indicator if they match.
      // No-op when not on a saved page.
      scanImages();
      // P-27 Build #4: re-scan <video> + <iframe> elements with the same
      // lazy-load + SPA-tile-mount reasoning. No-op when not on a saved page.
      scanVideos();
      // P-25: re-scan text hazes for the active saved URL. Lazy-loaded
      // content (infinite scroll, SPA tile mounts) may now contain a
      // previously-saved text snippet that wasn't in the DOM on first
      // scan; rescan re-attempts the deserialize+attach for each row.
      if (currentUrlIdForImages !== null) scanTextHazes(currentUrlIdForImages);
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

  // P-24: reposition image indicators on scroll/resize. Listeners are
  // passive + capture-phase so they reach us across nested scroll containers
  // (some platforms have scrollable inner panels that don't bubble scroll
  // up to window). No throttling — `reposition` reads bounding rects and
  // updates two style props per icon; cost is O(attachedImageIcons.size)
  // which is bounded by the saved-image count for the current URL.
  const onScrollOrResize = (): void => {
    repositionImageIcons();
    repositionVideoIcons();
  };
  window.addEventListener('scroll', onScrollOrResize, {
    passive: true,
    capture: true,
  });
  window.addEventListener('resize', onScrollOrResize, { passive: true });

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
      return;
    }
    if (msg.kind === 'open-text-capture-form') {
      // Module 2 highlight-and-add gesture (session 4, 2026-05-11).
      // The form fetches its own saved URLs + content-category vocab via
      // the api-bridge; orchestrator just hands off the props.
      //
      // P-25 (2026-05-19-f): pass the selector snapshotted by the
      // contextmenu capture-phase listener above. Reset to null right
      // after handing off so a later right-click without a selection
      // doesn't inherit a stale selector from this one.
      const selectorJsonForThisSave = lastRightClickSelectorJson;
      lastRightClickSelectorJson = null;
      openTextCaptureForm({
        initialText: msg.selectedText,
        pageUrl: msg.pageUrl,
        projectId,
        projectName,
        platform: platformModule.platform as Platform,
        selectorJson: selectorJsonForThisSave,
        onSaved() {
          // Captured text doesn't affect the recognition Set (it's
          // attached to a CompetitorUrl, not creating one). The
          // PLOS-side detail page reflects the new row on next load.
        },
        onClose() {
          // No orchestrator-side state to roll back.
        },
      });
      sendResponse({ ok: true });
      return;
    }
    if (msg.kind === 'open-image-capture-form') {
      // Module 2 regular-image gesture (session 5, 2026-05-12-i).
      // The form drives the end-to-end two-phase upload through the
      // background's submit-image-capture handler; orchestrator just hands
      // off the props.
      //
      // P-23 fix 2026-05-14: when `msg.srcUrl` is empty, fall back to the
      // image src discovered at the last right-click target. Empty msg.srcUrl
      // happens on Amazon's overlay-wrapped main image — Chrome's
      // contextMenus widened-to-'all' menu fires but `info.srcUrl` is empty
      // because Chrome didn't recognize the right-click target as an image.
      // If both msg.srcUrl AND the cache are empty, the user right-clicked
      // something that's not an image; bail silently (matches the old
      // background-side `if (!srcUrl) return;` guard).
      const srcUrl = msg.srcUrl || lastRightClickImageSrc || '';
      if (!srcUrl) {
        sendResponse({ ok: false, reason: 'no-image-found' });
        return;
      }
      openImageCaptureForm({
        srcUrl,
        pageUrl: msg.pageUrl,
        projectId,
        projectName,
        platform: platformModule.platform as Platform,
        onSaved() {
          // Captured image doesn't affect the recognition Set (attached to
          // a CompetitorUrl, doesn't create one). The PLOS-side detail
          // page reflects the new row on next load.
        },
        onClose() {
          // No orchestrator-side state to roll back.
        },
      });
      sendResponse({ ok: true });
      return;
    }
    if (msg.kind === 'open-video-capture-form') {
      // P-27 Build #3 (2026-05-22) — video-capture gesture. The orchestrator's
      // contextmenu capture-phase listener already ran findUnderlyingVideoEmbed
      // against the right-click target and stored the result in
      // lastRightClickVideoResult. Consume + reset so a later right-click
      // without a media target doesn't inherit a stale snapshot. If both
      // Chrome's info.srcUrl AND the snapshot are empty/none, bail silently
      // (matches the image flow's no-image-found bail).
      const snapshot = lastRightClickVideoResult;
      lastRightClickVideoResult = null;
      const result: FindUnderlyingVideoResult =
        snapshot ?? { kind: 'none' };
      if (result.kind === 'none') {
        // Build #8 (2026-05-23): surface the silent-bail case to the user.
        // Bug #9 + #13 + #14a from Build #7's verification all manifested as
        // "nothing happens" — no form, no toast, no error. The toast tells
        // the user the gesture WAS received but couldn't resolve a target,
        // and points them at the corrective action.
        showCaptureFailureToast(
          "Couldn't find a video to capture at that spot. Try right-clicking directly on the video player.",
        );
        sendResponse({ ok: false, reason: 'no-video-found' });
        return;
      }
      // Build the tagged-union props per the helper's result kind. Both
      // branches share `platform` (the W#2 site platform); the embed branch
      // additionally carries `embedPlatform` (the video-host name like
      // 'youtube'). Two explicit branches keep TypeScript's discriminated-
      // union narrowing happy without an `as` cast.
      if (result.kind === 'direct') {
        openVideoCaptureForm({
          kind: 'direct',
          src: result.src,
          mimeTypeHint: result.mimeType,
          element: result.element,
          pageUrl: msg.pageUrl,
          projectId,
          projectName,
          platform: platformModule.platform as Platform,
          onSaved() {
            // Captured video doesn't affect the recognition Set (attached
            // to a CompetitorUrl, doesn't create one). The PLOS-side detail
            // page reflects the new row on next load. Saved-video
            // indicator overlay arrives at a later Build session per
            // design doc §A.2.
          },
          onClose() {
            // No orchestrator-side state to roll back.
          },
        });
      } else {
        openVideoCaptureForm({
          kind: 'embed',
          src: result.src,
          embedPlatform: result.platform,
          pageUrl: msg.pageUrl,
          projectId,
          projectName,
          platform: platformModule.platform as Platform,
          onSaved() {
            // Same no-op as direct branch.
          },
          onClose() {
            // No orchestrator-side state to roll back.
          },
        });
      }
      sendResponse({ ok: true });
      return;
    }
    if (msg.kind === 'enter-region-screenshot-mode') {
      // Module 2 region-screenshot gesture (session 6, 2026-05-13).
      // The popup-side button sent us here. Arm the overlay; on a valid
      // capture, open the image-capture-form with the cropped data URL
      // and sourceType='region-screenshot' (the form's existing two-phase
      // upload flow handles both gestures uniformly because fetchImageBytes
      // accepts both `http(s):` and `data:` srcs — see session 5 §B note).
      const pageUrl = msg.pageUrl;
      const overlay = openRegionScreenshotOverlay({
        onCaptured(capturedDataUrl) {
          // Tear down the overlay before opening the form so the form's
          // backdrop doesn't fight with the overlay's z-index.
          overlay.destroy();
          openImageCaptureForm({
            srcUrl: capturedDataUrl,
            pageUrl,
            projectId,
            projectName,
            platform: platformModule.platform as Platform,
            sourceType: 'region-screenshot',
            onSaved() {
              // Same as regular-image — no recognition-Set side effects.
            },
            onClose() {
              // No orchestrator-side state to roll back.
            },
          });
        },
        onCancel(_reason) {
          // Silent close on Escape / too-small / outside-viewport. The user
          // re-arms via the popup button if they want to retry.
          overlay.destroy();
        },
        onError(_message) {
          // Capture pipeline error. Destroy the overlay; the user can re-arm
          // from the popup. A more elaborate "error toast" UX is a polish
          // item — for now the popup-side error inline (when the user
          // re-clicks and the message-send returns an error envelope)
          // provides the recovery affordance.
          overlay.destroy();
        },
      });
      sendResponse({ ok: true });
    }
  };
  chrome.runtime.onMessage.addListener(onMessage);

  return function cleanup(): void {
    observer?.disconnect();
    observer = null;
    window.removeEventListener('popstate', onLocationChange);
    window.removeEventListener('scroll', onScrollOrResize, {
      capture: true,
    } as EventListenerOptions);
    window.removeEventListener('resize', onScrollOrResize);
    detachContextMenuListener();
    chrome.runtime.onMessage.removeListener(onMessage);
    floatingButton.destroy();
    detachAllAlreadySavedIcons();
    // P-24: tear down all image indicators + drop cache.
    clearImageIndicators();
    capturedImagesByUrlId.clear();
    // P-27 Build #4: tear down all video indicators + drop cache.
    clearVideoIndicators();
    capturedVideosByUrlId.clear();
    // P-25: tear down all text hazes + drop cache.
    clearTextHazes();
    capturedTextsByUrlId.clear();
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
