// Etsy per-platform review extractor shipped under P-49 Workstream 2 Etsy
// sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md §C.2 + §A.2
// priority order (Etsy third per-platform sub-cluster after Amazon + eBay).
//
// FF#1 (rewrite) — architecture pivot from URL-construction (Amazon + eBay
// Pattern) to live-DOM-driver (Session 1 Amazon-original "scrape current
// view" Pattern, re-applied to Etsy's deep-dive review overlay). Reason:
// Etsy's "View all reviews for this item" overlay loads via AJAX on the
// same listing URL — no separate URL exists for the overlay or for per-
// star filters or for pagination. The URL-construction approach shipped
// in the initial Session 1 build commit BUSTED in Phase 4 because the
// scraper fetched the bare listing URL which has only ~2-3 inline reviews
// visible, missing the overlay's per-page corpus of 8 reviews.
//
// Empirical evidence: director's 2026-05-31 paste of the overlay outerHTML
// (captured via DevTools Copy outerHTML after clicking "View all reviews
// for this item"). Selectors below are all empirically grounded in that
// paste, not speculation.
//
// Architecture (live-DOM driver):
//   1. Verify we're on a /listing/<ID> page.
//   2. Click the "View all reviews for this item" button on the listing
//      page (text-content-based finder since the page uses Etsy's wt-*
//      design system classes with no stable data-testid).
//   3. Wait for the overlay to mount via polling (max 5s).
//   4. For each star in starsToVisit (3, 2, 1 by default):
//      a. Click the histogram filter button `[data-rating-value="<N>"]`
//         inside `[data-reviews-histogram="true"]`. SKIP cleanly if
//         the button is disabled (aria-disabled="true" — happens when
//         the listing has 0 reviews of that rating; e.g., empirical
//         2-star case in director's HTML showed 0%).
//      b. Wait for the reviews container to swap content (poll until
//         the first review row's data-review-region ID changes from
//         the pre-click snapshot).
//      c. Loop pagination:
//         - Walk visible rows in `[data-review-region]` containers.
//         - Persist each via saveReview.
//         - If cap hit, break.
//         - Find Next page button in the pagination nav.
//         - If Next disabled or absent, break (last page).
//         - Click Next; wait for content swap; loop.
//
// Reuses W2 Amazon + eBay Patterns where applicable:
//   • FF#1 symmetric URL helpers (isEtsyListingPage + isEtsyScrapableUrl +
//     extractListingIdFromEtsyUrl + urlsMatchByListingId).
//   • Cross-star loop structure mirroring W2 Amazon + eBay sub-clusters.
//   • Shadow DOM trigger modal reuse with per-URL cap override (orchestrator
//     side; selectableStars=[1,2,3,4,5] + defaultSelectedStars=[3,2,1]).
//   • §A.15 anti-bot conservative random delays between clicks.
//
// Does NOT reuse the FF#4 URL-construction-based pagination Pattern from
// Amazon + eBay — that Pattern requires a separate URL per page, which
// Etsy doesn't expose. Instead drives the live overlay UI via clicks.

import {
  GENERIC_CAPTCHA_SELECTORS,
  detectCaptcha,
  randomPaginationDelay,
  type ScrapeProgress,
  type ScrapeProgressListener,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

const ETSY_URL_PREFIX = /^https?:\/\/(www\.)?etsy\.com\//;
const LISTING_PAGE_PATH = /\/listing\/(\d+)\b/;

const DEFAULT_CAP_PER_STAR = 200;
const OVERLAY_WAIT_TIMEOUT_MS = 8000;
const REVIEWS_SWAP_TIMEOUT_MS = 8000;
const POLL_INTERVAL_MS = 200;
const POST_SWAP_SETTLE_MS = 400;

// Etsy's per-star filter values per the director's verbatim 2026-05-25 spec.
// All 5 stars are selectable in the trigger modal (director can opt into
// 4-star + 5-star captures) but the DEFAULT selection is the negative +
// middling buckets only (3, 2, 1).
export const ETSY_STAR_FILTERS = [1, 2, 3, 4, 5] as const;
export type EtsyStarFilter = (typeof ETSY_STAR_FILTERS)[number];

/**
 * Director-supplied default star selection per the 2026-05-25 verbatim spec:
 * capture 3-star + 2-star + 1-star reviews by default. Director can override
 * via the trigger modal to include 4-star + 5-star reviews on a per-trigger
 * basis (per §A.4 per-trigger override).
 */
export const ETSY_DEFAULT_SELECTED_STARS: readonly number[] = [3, 2, 1];

/**
 * Returns true when the given numeric rating is one of the supported Etsy
 * star filters (1..5).
 */
export function isEtsyStarFilter(rating: number): rating is EtsyStarFilter {
  return (
    rating === 1 ||
    rating === 2 ||
    rating === 3 ||
    rating === 4 ||
    rating === 5
  );
}

// ─── URL detection helpers (FF#1 symmetric Pattern) ──────────────────────

/** Returns true when the given URL is a recognized Etsy listing page. */
export function isEtsyListingPage(url: string): boolean {
  return ETSY_URL_PREFIX.test(url) && LISTING_PAGE_PATH.test(url);
}

/**
 * Returns true when the given URL is any Etsy page the scrape can dispatch
 * from. For Etsy, reviews live on the listing page itself, so
 * `isEtsyScrapableUrl` reduces to `isEtsyListingPage`. Kept as a separate
 * function to preserve the FF#1 symmetric helper Pattern from the
 * 2026-05-28 Amazon deploy.
 */
export function isEtsyScrapableUrl(url: string): boolean {
  return isEtsyListingPage(url);
}

/**
 * Returns the listing_id from an Etsy listing URL (`/listing/<ID>`), or
 * null when the URL isn't a recognized listing shape.
 */
export function extractListingIdFromListingUrl(url: string): string | null {
  const match = url.match(LISTING_PAGE_PATH);
  return match ? (match[1] ?? null) : null;
}

/**
 * Returns the listing_id from any Etsy URL exposing one. For Etsy this is
 * just `extractListingIdFromListingUrl` (no secondary URL shape exists),
 * but the helper is kept for parity with Amazon's `extractAsinFromAmazonUrl`
 * + eBay's `extractItemIdFromEbayUrl` symmetric Pattern.
 */
export function extractListingIdFromEtsyUrl(url: string): string | null {
  return extractListingIdFromListingUrl(url);
}

/**
 * Returns true when the given Etsy URL matches the same listing_id as the
 * given saved CompetitorUrl's URL.
 */
export function urlsMatchByListingId(
  pageUrl: string,
  savedUrl: string,
): boolean {
  const pageId = extractListingIdFromEtsyUrl(pageUrl);
  if (!pageId) return false;
  const savedId = extractListingIdFromEtsyUrl(savedUrl);
  return savedId === pageId;
}

// ─── DOM walkers + DOM driver helpers (empirically grounded in director's
//     2026-05-31 paste of the overlay outerHTML) ──────────────────────────

export interface EtsyReviewRow {
  body: string;
  reviewerName: string | null;
  reviewDate: string | null;
  /**
   * Star rating parsed from the per-review `[role="img"][aria-label^="Rating:"]`
   * element. Null on parse failure; the orchestrator falls back to the
   * currently-walked filter's star value when persisting.
   */
  starRating: number | null;
  /**
   * Etsy's per-review transaction ID from the `data-review-region` attribute.
   * Used to detect content swap after histogram-filter click + pagination
   * Next click (the first review row's ID changes when AJAX reload completes).
   */
  reviewRegionId: string | null;
}

/**
 * Returns the deep-dive review overlay element when present in the document.
 * The overlay is the dialog mounted when director clicks "View all reviews
 * for this item" on the listing page. Returns null when the overlay isn't
 * currently mounted.
 *
 * Empirical: per director's 2026-05-31 HTML paste, the overlay is a
 * `<div aria-modal="true" role="dialog" class="deep-dive-sheet center-sheet
 * custom-width wt-sheet wt-sheet--position-bottom">`. The `aria-modal` +
 * `role` selector pair is the most stable identifier.
 */
export function findOverlayContainer(doc: ParentNode): Element | null {
  return (
    doc.querySelector('[aria-modal="true"][role="dialog"].deep-dive-sheet') ??
    doc.querySelector('.deep-dive-sheet') ??
    doc.querySelector('[aria-modal="true"][role="dialog"]')
  );
}

/**
 * Returns the reviews list container element within the overlay. Reviews
 * are children of this container; pagination + histogram filter live as
 * siblings outside it.
 *
 * Empirical: `<div data-deep-dive-reviews-container="true">` wraps the
 * `[data-review-region]` row list per director's HTML paste.
 */
export function findReviewsContainer(overlay: ParentNode): Element | null {
  return overlay.querySelector('[data-deep-dive-reviews-container="true"]');
}

/**
 * Returns the histogram filter button for the given star rating (1..5),
 * or null when no matching button exists. The button is clickable even
 * when "disabled" (aria-disabled="true") in markup; callers must check
 * `isHistogramButtonDisabled` before clicking to avoid wasted clicks.
 *
 * Empirical: the histogram wraps 5 `<button data-rating-value="N">`
 * elements inside `<div data-reviews-histogram="true">`. Each button
 * represents one star rating; the 2-star button in director's HTML
 * carried both `disabled=""` + `aria-disabled="true"` because the
 * listing has 0 2-star reviews.
 */
export function findHistogramButton(
  overlay: ParentNode,
  rating: EtsyStarFilter,
): Element | null {
  return overlay.querySelector(
    `[data-reviews-histogram="true"] button[data-rating-value="${String(rating)}"]`,
  );
}

/**
 * Returns true when a histogram filter button is in its disabled state.
 * Etsy marks histogram buttons as disabled when the listing has 0 reviews
 * of that rating (e.g., the 2-star bucket on a listing with no 2-star
 * reviews). Disabled clicks no-op + cause the AJAX reload to never fire,
 * so we must skip them rather than wait forever for a content swap.
 */
export function isHistogramButtonDisabled(button: Element): boolean {
  return (
    button.getAttribute('aria-disabled') === 'true' ||
    button.hasAttribute('disabled')
  );
}

/**
 * Returns the pagination Next button within the overlay, or null when the
 * pagination nav is absent (e.g., the filter has only 1 page of results).
 *
 * Empirical: pagination lives in `<nav aria-label="Pagination of reviews"
 * data-clg-id="WtPagination">`. The Next button is the LAST button in the
 * action-group and contains `<span class="wt-screen-reader-only">Next</span>`.
 * The Previous button contains the analogous "Previous" screen-reader span.
 * Both Next + Previous are disabled (`aria-disabled="true"` + `disabled=""`)
 * when at the corresponding boundary.
 */
export function findNextPageButton(overlay: ParentNode): Element | null {
  const nav = overlay.querySelector(
    'nav[aria-label="Pagination of reviews"], nav[data-clg-id="WtPagination"]',
  );
  if (!nav) return null;
  const buttons = Array.from(nav.querySelectorAll('button'));
  for (const btn of buttons) {
    const srOnly = btn.querySelector('.wt-screen-reader-only');
    const label = srOnly?.textContent?.trim() ?? '';
    if (label === 'Next') return btn;
  }
  return null;
}

/**
 * Returns true when the pagination Next button is in its disabled state
 * (we're on the last page; no further pagination available).
 */
export function isNextPageButtonDisabled(button: Element): boolean {
  return (
    button.getAttribute('aria-disabled') === 'true' ||
    button.hasAttribute('disabled')
  );
}

/**
 * Returns the "View all reviews for this item" button on the listing page,
 * or null when the button can't be located. Etsy doesn't expose a stable
 * data-testid for this button, so we fall back to text-content matching
 * across all `<button>` + `<a>` elements in the document.
 *
 * Defensive: trims + lowercases for case-insensitive comparison; matches
 * canonical phrasing first, then a more permissive "view all reviews" prefix.
 */
export function findViewAllReviewsButton(doc: ParentNode): Element | null {
  const CANONICAL = 'view all reviews for this item';
  const FALLBACK = 'view all reviews';
  const candidates = Array.from(doc.querySelectorAll('button, a'));

  // Pass 1: exact canonical text match
  for (const el of candidates) {
    const text = (el.textContent ?? '').trim().toLowerCase();
    if (text === CANONICAL) return el;
  }
  // Pass 2: starts-with canonical
  for (const el of candidates) {
    const text = (el.textContent ?? '').trim().toLowerCase();
    if (text.startsWith(CANONICAL)) return el;
  }
  // Pass 3: starts-with fallback prefix (covers regional variants like
  // "View all reviews (107)" or "View all 107 reviews")
  for (const el of candidates) {
    const text = (el.textContent ?? '').trim().toLowerCase();
    if (text.startsWith(FALLBACK)) return el;
  }
  return null;
}

/**
 * Extracts review rows from the overlay. Walks each `[data-review-region]`
 * direct/descendant inside the reviews container, extracting body + name +
 * date + star rating.
 *
 * Empirical: per director's HTML paste, each `<div data-review-region="<id>">`
 * wraps a single review. The body is `<div class="wt-text-body">`; the
 * reviewer name is a `<a href*="/people/">` link; the date is a sibling
 * `<span>` of that link with class `wt-text-body-small--tight`; the rating
 * is in `<div role="img" aria-label="Rating: N out of 5 stars">`.
 */
export function extractReviewsFromOverlay(overlay: ParentNode): EtsyReviewRow[] {
  const container = findReviewsContainer(overlay);
  if (!container) return [];
  const rowEls = Array.from(container.querySelectorAll('[data-review-region]'));
  const rows: EtsyReviewRow[] = [];
  for (const el of rowEls) {
    const body = extractReviewBody(el);
    if (!body) continue;
    const reviewerName = extractReviewerName(el);
    const reviewDate = extractReviewDate(el);
    const starRating = extractReviewStarRating(el);
    const reviewRegionId = el.getAttribute('data-review-region');
    rows.push({ body, reviewerName, reviewDate, starRating, reviewRegionId });
  }
  return rows;
}

/**
 * Extracts the review body text from a single review row element.
 *
 * Empirical: `<div class="wt-text-body">I think this is working, thank you!</div>`
 * is the innermost body wrapper per director's HTML paste. Falls back to
 * a couple of older Etsy class names + the generic .review-text in case
 * Etsy's classic-view markup is rendered.
 */
export function extractReviewBody(rowEl: Element): string {
  const SELECTORS: readonly string[] = [
    '.wt-text-body',
    '.shop-review-card__text',
    '.review-text',
  ];
  for (const sel of SELECTORS) {
    const bodyEl = rowEl.querySelector(sel);
    const text = bodyEl?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return '';
}

/**
 * Extracts the reviewer's display name from a single review row element.
 *
 * Empirical: `<a href="https://www.etsy.com/people/<handle>?ref=l_review"
 * class="wt-text-title-small wt-text-link-no-underline">Jenny</a>` per
 * director's HTML paste. The /people/ href is the most stable selector.
 */
export function extractReviewerName(rowEl: Element): string | null {
  const link = rowEl.querySelector('a[href*="/people/"]');
  const text = link?.textContent?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Extracts the review date from a single review row element.
 *
 * Empirical: the date is a `<span class="wt-bl-xs wt-text-body-small--tight
 * wt-sem-text-secondary">May 20, 2026</span>` rendered as a sibling of the
 * reviewer-name `<a>` in the same horizontal flex container. The most
 * stable selector path is the parent flex div followed by `span` siblings
 * of the link; we fall through to several class-name probes.
 *
 * Returns the parsed ISO timestamp when parseable; the raw rendered text
 * on parse failure; null when no date element is found.
 */
export function extractReviewDate(rowEl: Element): string | null {
  // Primary: the span that's a sibling of the /people/ reviewer-name link.
  const link = rowEl.querySelector('a[href*="/people/"]');
  if (link?.parentElement) {
    const siblings = Array.from(link.parentElement.children);
    for (const sib of siblings) {
      if (sib === link) continue;
      if (sib.tagName !== 'SPAN') continue;
      const text = sib.textContent?.trim() ?? '';
      if (text.length === 0) continue;
      const iso = parseEtsyReviewDate(text);
      if (iso) return iso;
      // Heuristic: bare text that looks like a date but doesn't parse
      // returns as-is so downstream UI shows something rather than blank.
      if (/\d{4}/.test(text) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(text)) {
        return text;
      }
    }
  }
  // Fallbacks for classic-view variants.
  const SELECTORS: readonly string[] = [
    '.wt-text-body-small--tight.wt-sem-text-secondary',
    '.shop-review-card__date',
    '.review-date',
    'time',
  ];
  for (const sel of SELECTORS) {
    const dateEl = rowEl.querySelector(sel);
    const dt = (dateEl as HTMLTimeElement | null)?.dateTime;
    if (dt) {
      const iso = parseEtsyReviewDate(dt);
      if (iso) return iso;
    }
    const text = dateEl?.textContent?.trim() ?? '';
    if (text.length === 0) continue;
    const iso = parseEtsyReviewDate(text);
    return iso ?? text;
  }
  return null;
}

/**
 * Extracts the per-review star rating (1-5 integer) from a single review
 * row element.
 *
 * Empirical: `<div role="img" aria-label="Rating: 5 out of 5 stars" ...>`
 * is the canonical rating element per director's HTML paste. The aria-label
 * pattern "Rating: <N> out of 5 stars" is consistent across all reviews.
 */
export function extractReviewStarRating(rowEl: Element): number | null {
  const ratingEl = rowEl.querySelector('[role="img"][aria-label^="Rating:"]');
  const label = ratingEl?.getAttribute('aria-label')?.trim() ?? '';
  if (label.length > 0) {
    const m = label.match(/Rating:\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const n = parseFloat(m[1] ?? '');
      if (Number.isFinite(n)) {
        const rounded = Math.round(n);
        if (rounded >= 1 && rounded <= 5) return rounded;
      }
    }
  }
  // Fallback: any aria-label with a "<N> stars" phrase (covers classic view).
  const ariaCandidates = Array.from(rowEl.querySelectorAll('[aria-label]'));
  for (const el of ariaCandidates) {
    const fallback = el.getAttribute('aria-label')?.trim() ?? '';
    const rating = parseEtsyStarRating(fallback);
    if (rating !== null) return rating;
  }
  return null;
}

/**
 * Parses an Etsy star-rating string. Common shapes:
 *   "Rating: 5 out of 5 stars" → 5 (canonical overlay shape)
 *   "5 out of 5 stars" → 5
 *   "4 stars" → 4
 *   "3.5 out of 5 stars" → 4 (rounded)
 */
export function parseEtsyStarRating(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  const m = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:out of \d+\s*)?stars?/i);
  if (!m) return null;
  const n = parseFloat(m[1] ?? '');
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

/**
 * Attempts to parse an Etsy review date string into an ISO 8601 timestamp.
 * Handles the "Reviewed Apr 12, 2024" prefix Etsy sometimes prepends.
 * Returns null on parse failure.
 */
export function parseEtsyReviewDate(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  const stripped = trimmed.replace(/^Reviewed\s+/i, '');
  const d = new Date(stripped);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ─── DIAGNOSTIC INSTRUMENTATION (FF#2 2026-05-31 — TEMPORARY) ────────────
//
// Yesterday's eBay FF#4 Pattern applied to Etsy after FF#1 BUSTED silently
// (scrape ended with 0 captures + no error message). This block instruments
// every step of runEtsyReviewScrape so director can capture empirical
// evidence in Chrome DevTools Console + download the overlay HTML at the
// moment of histogram click. FF#3 will use that evidence to ship the
// empirically-verified fix + remove this instrumentation.
//
// Per the diagnostic-instrumentation FF Pattern (CORRECTIONS_LOG §Entry
// 2026-05-30 sub-observation a), this code is INTENTIONALLY loud +
// noisy + has side effects (downloads). It is NOT production-quality.

const DIAGNOSTIC_PREFIX = '[PLOS ETSY DIAGNOSTIC]';

function diag(step: string, payload?: Record<string, unknown>): void {
  if (payload) {
    console.log(DIAGNOSTIC_PREFIX, step, payload);
  } else {
    console.log(DIAGNOSTIC_PREFIX, step);
  }
}

function describeEl(el: Element | null, maxChars = 600): string {
  if (!el) return '<null>';
  const html = (el as HTMLElement).outerHTML ?? '';
  if (html.length <= maxChars) return html;
  return html.slice(0, maxChars) + `...[truncated, total ${String(html.length)} chars]`;
}

function downloadHtml(filename: string, content: string): void {
  try {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    diag('HTML download fired', { filename, sizeChars: content.length });
  } catch (err) {
    diag('HTML download FAILED', { filename, err: String(err) });
  }
}

// ─── Scrape orchestration (live-DOM driver) ──────────────────────────────

export interface EtsyScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured reviews to. */
  competitorUrlId: string;
  /** Listing ID parsed from the trigger URL — informational + scope-label only. */
  listingId: string;
  /**
   * Per-star cap. The cross-star loop visits up to this many rows per
   * star filter before moving to the next. Defaults to 200 when
   * null/undefined.
   */
  capPerStar: number | null;
  /**
   * Optional explicit list of star filters to visit. When omitted, defaults
   * to ETSY_DEFAULT_SELECTED_STARS (3, 2, 1).
   */
  starsToVisit?: readonly EtsyStarFilter[];
  /** Human label for the indicator (e.g., "Etsy reviews — Product X"). */
  scopeLabel: string;
  /**
   * Background-proxy review-save call. Routes to the existing
   * /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
   * endpoint via the extension's BackgroundRequest pattern.
   */
  saveReview(input: EtsyScrapeSaveInput): Promise<void>;
}

export interface EtsyScrapeSaveInput {
  clientId: string;
  starRating: number;
  body: string;
  /** Always null for Etsy — no per-review title field per the director spec. */
  title: null;
  reviewerName: string | null;
  reviewDate: string | null;
  /** Always null for Etsy — no helpful-count signal exposed per the director spec. */
  helpfulCount: null;
  /** Always "etsy" for this module. */
  platform: 'etsy';
  /** Discriminator — always "extension-scrape" for Etsy per-reviewer rows. */
  source: 'extension-scrape';
}

export interface EtsyScrapeResult {
  inserted: number;
  insertedByStar: Partial<Record<EtsyStarFilter, number>>;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
  /**
   * Stars skipped because their histogram filter button was disabled
   * (the listing has 0 reviews of that rating; e.g., 2-star bucket on
   * a listing where no buyer left a 2-star review).
   */
  skippedStars?: EtsyStarFilter[];
}

/**
 * Drives an end-to-end Etsy review scrape against the trigger listing's
 * deep-dive review overlay. Opens the Shadow DOM progress indicator,
 * opens the overlay if not already open, walks each star filter
 * (per director's default 3 → 2 → 1) page-by-page (page 1..N up to
 * capPerStar) via click-driven UI navigation, and persists each row.
 *
 * Live-DOM driver — operates on `document` directly (no fetch+DOMParser
 * since Etsy's overlay loads via AJAX with no separate URL exposed).
 */
export async function runEtsyReviewScrape(
  ctx: EtsyScrapeContext,
  liveDoc: Document = document,
): Promise<EtsyScrapeResult> {
  const controller = new AbortController();
  const indicator = openScrapeProgressIndicator({
    scopeLabel: ctx.scopeLabel,
    onCancel: () => controller.abort(),
  });
  const onProgress: ScrapeProgressListener = (event) => indicator.update(event);

  const capPerStar =
    ctx.capPerStar && ctx.capPerStar > 0
      ? ctx.capPerStar
      : DEFAULT_CAP_PER_STAR;
  const starsToVisit =
    ctx.starsToVisit && ctx.starsToVisit.length > 0
      ? ctx.starsToVisit
      : (ETSY_DEFAULT_SELECTED_STARS.filter(isEtsyStarFilter) as readonly EtsyStarFilter[]);

  const insertedByStar: Partial<Record<EtsyStarFilter, number>> = {};
  const skippedStars: EtsyStarFilter[] = [];
  let totalInserted = 0;
  let runningAbort: EtsyScrapeResult['abortReason'];
  let runningAbortMessage: string | undefined;

  onProgress({ kind: 'starting' });

  // DIAGNOSTIC FF#2 — log entry-point context.
  diag('runEtsyReviewScrape ENTRY', {
    href: typeof window !== 'undefined' ? window.location.href : '<no window>',
    listingId: ctx.listingId,
    capPerStar,
    starsToVisit: [...starsToVisit],
    scopeLabel: ctx.scopeLabel,
  });

  try {
    // Step 1: Open the overlay if not already open.
    let overlay = findOverlayContainer(liveDoc);
    diag('findOverlayContainer (pre-trigger)', {
      foundAtEntry: overlay !== null,
      overlayHtml: describeEl(overlay, 400),
    });
    if (!overlay) {
      const trigger = findViewAllReviewsButton(liveDoc);
      diag('findViewAllReviewsButton', {
        found: trigger !== null,
        triggerHtml: describeEl(trigger, 400),
        triggerTextContent: trigger?.textContent?.trim() ?? null,
      });
      if (!trigger) {
        // DIAGNOSTIC: dump the listing page HTML so FF#3 can probe what
        // selectors should match the View-all-reviews trigger. Truncate
        // to <head> + first 100KB of <body> to keep download manageable.
        const fullHtml =
          typeof document !== 'undefined'
            ? document.documentElement.outerHTML
            : '<no document>';
        const trimmed =
          fullHtml.length > 200000
            ? fullHtml.slice(0, 200000) + '\n<!-- truncated at 200KB -->'
            : fullHtml;
        downloadHtml('plos-etsy-diag-listing-page.html', trimmed);
        diag('listing-page HTML dumped (View-all-reviews trigger not found)');
        const msg =
          "DIAGNOSTIC FF#2: Couldn't find the 'View all reviews for this item' button. Listing-page HTML was downloaded to your Downloads folder — upload it back so FF#3 can ship the right selector. Check Console for additional diagnostic output.";
        onProgress({
          kind: 'aborted',
          reason: 'error',
          totalRowsCaptured: 0,
          message: msg,
        });
        return {
          inserted: 0,
          insertedByStar,
          skippedStars,
          abortReason: 'error',
          abortMessage: msg,
        };
      }
      diag('clicking View-all-reviews button');
      clickElement(trigger);
      diag('waitForOverlay START', { timeoutMs: OVERLAY_WAIT_TIMEOUT_MS });
      try {
        overlay = await waitForOverlay(liveDoc, controller.signal);
        diag('waitForOverlay SUCCESS', {
          overlayClasses: (overlay as HTMLElement).className,
          overlayHtmlPreview: describeEl(overlay, 600),
        });
      } catch (waitErr) {
        diag('waitForOverlay FAILED', { err: String(waitErr) });
        // DIAGNOSTIC: dump full DOM so FF#3 can see what's actually there.
        const fullHtml =
          typeof document !== 'undefined'
            ? document.documentElement.outerHTML
            : '<no document>';
        const trimmed =
          fullHtml.length > 200000
            ? fullHtml.slice(0, 200000) + '\n<!-- truncated at 200KB -->'
            : fullHtml;
        downloadHtml('plos-etsy-diag-after-trigger-click.html', trimmed);
        throw waitErr;
      }
    }

    // DIAGNOSTIC: dump the overlay's outerHTML once we have it — gives FF#3
    // ground truth on the state director's scrape sees (which may differ
    // from director's manual DevTools paste due to in-page React state).
    if (overlay) {
      downloadHtml(
        'plos-etsy-diag-overlay-at-scrape-start.html',
        (overlay as HTMLElement).outerHTML,
      );
    }

    // Step 2: Cross-star loop driven by live histogram filter clicks.
    starLoop: for (const filter of starsToVisit) {
      if (controller.signal.aborted) {
        runningAbort = 'user-cancel';
        break;
      }
      // CAPTCHA defensive check before each filter; abort cleanly if
      // Etsy serves one mid-scrape.
      if (detectCaptcha([...GENERIC_CAPTCHA_SELECTORS, '#captcha', 'img[src*="captcha"]'])) {
        runningAbort = 'captcha';
        runningAbortMessage =
          'Captcha detected. Finish the captcha in the tab then re-run the scrape.';
        break;
      }
      onProgress({ kind: 'star-started', starRating: filter });
      diag(`star ${String(filter)} START`, { filter });

      const histogramBtn = findHistogramButton(overlay, filter);
      diag(`star ${String(filter)} findHistogramButton`, {
        found: histogramBtn !== null,
        histogramBtnHtml: describeEl(histogramBtn, 400),
        isDisabled: histogramBtn ? isHistogramButtonDisabled(histogramBtn) : null,
      });
      if (!histogramBtn) {
        // Histogram button missing entirely — atypical (Etsy renders all
        // 5 buttons even at 0%). Skip this star without error.
        diag(`star ${String(filter)} SKIP (no histogram button)`);
        skippedStars.push(filter);
        onProgress({
          kind: 'star-completed',
          starRating: filter,
          rowsForStar: 0,
          totalRowsCaptured: totalInserted,
        });
        continue;
      }
      if (isHistogramButtonDisabled(histogramBtn)) {
        // No reviews exist for this star (e.g., 2-star bucket at 0%).
        // SKIP cleanly — no click, no wait, no error.
        diag(`star ${String(filter)} SKIP (histogram button disabled)`);
        skippedStars.push(filter);
        onProgress({
          kind: 'star-completed',
          starRating: filter,
          rowsForStar: 0,
          totalRowsCaptured: totalInserted,
        });
        continue;
      }

      // Snapshot the current first-review ID so we can detect the AJAX
      // content swap that follows the click.
      const preClickFirstId = currentFirstReviewId(overlay);
      diag(`star ${String(filter)} pre-click snapshot`, { preClickFirstId });

      // §A.15 random delay BEFORE the click so the inter-click gap is
      // the noisy human-like duration, not the deterministic settle.
      try {
        await randomPaginationDelay({ abortSignal: controller.signal });
      } catch {
        runningAbort = 'user-cancel';
        break;
      }
      diag(`star ${String(filter)} clicking histogram button`);
      clickElement(histogramBtn);

      try {
        await waitForReviewsSwap(overlay, preClickFirstId, controller.signal);
        diag(`star ${String(filter)} waitForReviewsSwap SUCCESS`, {
          newFirstId: currentFirstReviewId(overlay),
        });
      } catch (err) {
        diag(`star ${String(filter)} waitForReviewsSwap FAILED`, {
          err: String(err),
          currentFirstId: currentFirstReviewId(overlay),
          overlayPreview: describeEl(overlay, 600),
        });
        if (controller.signal.aborted) {
          runningAbort = 'user-cancel';
          break;
        }
        const msg = err instanceof Error ? err.message : 'wait failed';
        runningAbort = 'error';
        runningAbortMessage = `Etsy ${String(filter)}★ filter content didn't load: ${msg}`;
        break;
      }

      // DIAGNOSTIC FF#2: dump overlay state after the first histogram click
      // so FF#3 has empirical evidence of how the AJAX response looks.
      // (One dump per scrape — only fires on the first non-skipped star.)
      if (Object.keys(insertedByStar).length === 0 && skippedStars.length === 0) {
        downloadHtml(
          `plos-etsy-diag-overlay-after-star-${String(filter)}-click.html`,
          (overlay as HTMLElement).outerHTML,
        );
      }

      // Pagination loop within this star.
      let pageIndex = 1;
      let rowsForThisStar = 0;
      let isFirstPageOfStar = true;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (controller.signal.aborted) {
          runningAbort = 'user-cancel';
          break starLoop;
        }
        onProgress({
          kind: 'page-loading',
          pageIndex,
          starContext: `${String(filter)}★`,
        });
        const rows = extractReviewsFromOverlay(overlay);
        diag(`star ${String(filter)} page ${String(pageIndex)} extractReviewsFromOverlay`, {
          rowCount: rows.length,
          reviewsContainerFound: findReviewsContainer(overlay) !== null,
          reviewsContainerHtml: describeEl(findReviewsContainer(overlay), 600),
          firstRowSummary: rows.length > 0 ? {
            reviewRegionId: rows[0]?.reviewRegionId,
            bodyPreview: rows[0]?.body?.slice(0, 80),
            reviewerName: rows[0]?.reviewerName,
            starRating: rows[0]?.starRating,
          } : null,
        });
        onProgress({
          kind: 'page-loaded',
          pageIndex,
          rowsOnPage: rows.length,
          totalRowsCaptured: totalInserted,
          starContext: `${String(filter)}★`,
        });

        for (const row of rows) {
          if (controller.signal.aborted) {
            runningAbort = 'user-cancel';
            break starLoop;
          }
          if (rowsForThisStar >= capPerStar) break;
          try {
            await ctx.saveReview({
              clientId: makeClientId(),
              starRating: row.starRating ?? filter,
              body: row.body,
              title: null,
              reviewerName: row.reviewerName,
              reviewDate: row.reviewDate,
              helpfulCount: null,
              platform: 'etsy',
              source: 'extension-scrape',
            });
            rowsForThisStar += 1;
            totalInserted += 1;
            onProgress({ kind: 'row-saved', totalRowsCaptured: totalInserted });
          } catch (err) {
            const status = errStatus(err);
            if (status === 429 || status === 503) {
              runningAbort = 'rate-limit';
            } else if (errName(err) === 'AbortError') {
              runningAbort = 'user-cancel';
            } else {
              runningAbort = 'error';
              runningAbortMessage =
                err instanceof Error ? err.message : 'save failed';
            }
            break starLoop;
          }
        }

        if (rowsForThisStar >= capPerStar) break;

        // Advance to next page within this star.
        const nextBtn = findNextPageButton(overlay);
        if (!nextBtn || isNextPageButtonDisabled(nextBtn)) break;

        const prePagFirstId = currentFirstReviewId(overlay);
        try {
          await randomPaginationDelay({ abortSignal: controller.signal });
        } catch {
          runningAbort = 'user-cancel';
          break starLoop;
        }
        clickElement(nextBtn);

        try {
          await waitForReviewsSwap(overlay, prePagFirstId, controller.signal);
        } catch (err) {
          if (controller.signal.aborted) {
            runningAbort = 'user-cancel';
            break starLoop;
          }
          // Pagination wait failed — likely end of pages or content didn't
          // update. Break the inner pagination loop + continue to next star.
          break;
        }
        pageIndex += 1;
        isFirstPageOfStar = false;
      }

      insertedByStar[filter] = rowsForThisStar;
      diag(`star ${String(filter)} COMPLETED`, {
        rowsForThisStar,
        totalInsertedSoFar: totalInserted,
      });
      onProgress({
        kind: 'star-completed',
        starRating: filter,
        rowsForStar: rowsForThisStar,
        totalRowsCaptured: totalInserted,
      });
    }

    diag('runEtsyReviewScrape EXIT', {
      totalInserted,
      insertedByStar,
      skippedStars,
      runningAbort,
      runningAbortMessage,
    });

    if (runningAbort === undefined) {
      onProgress({ kind: 'completed', totalRowsCaptured: totalInserted });
    } else {
      onProgress({
        kind: 'aborted',
        reason: runningAbort,
        totalRowsCaptured: totalInserted,
        message: runningAbortMessage,
      });
    }

    return {
      inserted: totalInserted,
      insertedByStar,
      skippedStars,
      abortReason: runningAbort,
      abortMessage: runningAbortMessage,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    indicator.update({
      kind: 'aborted',
      reason: 'error',
      totalRowsCaptured: totalInserted,
      message: msg,
    });
    return {
      inserted: totalInserted,
      insertedByStar,
      skippedStars,
      abortReason: 'error',
      abortMessage: msg,
    };
  }
}

// ─── Live-DOM driver helpers ─────────────────────────────────────────────

function clickElement(el: Element): void {
  // HTMLElement.click() is the most reliable way to fire a synthetic
  // click; works on both native + React-managed elements.
  (el as HTMLElement).click();
}

function currentFirstReviewId(overlay: ParentNode): string | null {
  const container = findReviewsContainer(overlay);
  if (!container) return null;
  const first = container.querySelector('[data-review-region]');
  return first?.getAttribute('data-review-region') ?? null;
}

/**
 * Polls for the overlay to mount in the document. Returns the overlay
 * element once present, or throws on timeout / abort.
 */
async function waitForOverlay(
  doc: ParentNode,
  abortSignal: AbortSignal,
): Promise<Element> {
  const startTs = Date.now();
  while (true) {
    if (abortSignal.aborted) {
      const err = new Error('aborted while waiting for overlay');
      err.name = 'AbortError';
      throw err;
    }
    const overlay = findOverlayContainer(doc);
    if (overlay) {
      // Brief settle to let the overlay's initial review rows mount.
      await sleep(POST_SWAP_SETTLE_MS);
      return overlay;
    }
    if (Date.now() - startTs > OVERLAY_WAIT_TIMEOUT_MS) {
      throw new Error('timed out waiting for review overlay to open');
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

/**
 * Polls the reviews container's first-row data-review-region attribute
 * until it changes from the pre-action snapshot. This is the canonical
 * signal that an AJAX content swap completed (per-star filter click,
 * pagination click).
 *
 * Special case: if the AJAX swap empties the container (e.g., 0 reviews
 * for the selected filter), we resolve when the container has been
 * observed in an "empty" state for a couple of poll cycles.
 */
async function waitForReviewsSwap(
  overlay: ParentNode,
  prevFirstId: string | null,
  abortSignal: AbortSignal,
): Promise<void> {
  const startTs = Date.now();
  let emptyTicks = 0;
  while (true) {
    if (abortSignal.aborted) {
      const err = new Error('aborted while waiting for reviews swap');
      err.name = 'AbortError';
      throw err;
    }
    const currentId = currentFirstReviewId(overlay);
    if (currentId !== null && currentId !== prevFirstId) {
      // Content swapped — settle then return.
      await sleep(POST_SWAP_SETTLE_MS);
      return;
    }
    if (currentId === null) {
      emptyTicks += 1;
      // 3 consecutive empty polls = container is genuinely empty post-click
      // (legitimate 0-results state). Settle + return.
      if (emptyTicks >= 3) {
        await sleep(POST_SWAP_SETTLE_MS);
        return;
      }
    }
    if (Date.now() - startTs > REVIEWS_SWAP_TIMEOUT_MS) {
      throw new Error('timed out waiting for reviews content swap');
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errStatus(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === 'number') return s;
  }
  return undefined;
}

function errName(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null) {
    const n = (err as { name?: unknown }).name;
    if (typeof n === 'string') return n;
  }
  return undefined;
}

function makeClientId(): string {
  return crypto.randomUUID();
}
