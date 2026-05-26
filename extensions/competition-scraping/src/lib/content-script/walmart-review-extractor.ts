// Walmart per-platform review extractor shipped under P-49 Workstream 2
// Walmart sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md §C.2 + §A.2
// priority order (Walmart fourth + FINAL per-platform sub-cluster after
// Amazon 2026-05-28 + eBay 2026-05-30 + Etsy 2026-05-31).
//
// Architecture (URL-construction Pattern, mirroring Amazon + eBay; NOT
// live-DOM driver like Etsy):
//   • Triggered when director right-clicks on a Walmart listing or reviews
//     page and picks the "Scrape reviews for this URL" context-menu entry.
//   • Walks each star filter (5..1 by default) page-by-page via fetch() +
//     DOMParser against the canonical /reviews/product/<ID>?ratings=N&page=M
//     URL contract per the director-verbatim 2026-05-25 spec preserved in
//     the P-49 ROADMAP entry.
//   • Honors §A.15 conservative defaults via scrape-pagination.ts: 1-3s
//     random delays between page fetches, captcha detection, rate-limit
//     detection, cancellable via the Shadow DOM progress indicator.
//   • Persists each captured review via the background-proxy with
//     platform='walmart' + source='extension-scrape'.
//
// Walmart-specific adaptations vs. Amazon + eBay:
//   • Numeric star filters (1..5) like Etsy, but URL-construction-based
//     pagination like Amazon + eBay (Walmart exposes a stable
//     `?ratings=N&page=M` URL contract).
//   • Capture star + title + full-expanded body; no helpful-count signal
//     (Walmart doesn't expose one). "View more" CSS truncation only — the
//     full body is in the server-rendered HTML.
//   • Default selected stars = [5, 4, 3, 2, 1] (all per launch prompt /
//     §A.2 director-verbatim spec for Walmart).
//
// Patterns applied from the start (per 2026-05-31 W2 Etsy FF#3 lessons):
//   • Over-broad fallback selectors should be DELETED, not added — each
//     find* helper uses a single canonical-class selector + hidden-state
//     filter, not multiple progressively-broader fallbacks.
//   • AJAX-vs-URL-construction architecture confirmed: Walmart's URL
//     contract is URL-construction-friendly per the §A.2 director-verbatim
//     spec; no live-DOM driver needed.
//
// Patterns reused from W2 Amazon + eBay:
//   • FF#1 symmetric URL helpers (isWalmartListingPage + isWalmartReviewsPage
//     + isWalmartScrapableUrl + extractProductIdFromXxxUrl trio +
//     urlsMatchByProductId).
//   • FF#4 URL-construction-based pagination (buildWalmartReviewUrl drives
//     the loop; `page=N` parameter incremented directly rather than scraping
//     next-page links).
//   • Cross-star loop structure mirroring W2 Amazon (5 stars; per-star cap).
//   • Shadow DOM trigger modal with per-URL cap override (orchestrator side).

import {
  paginate,
  type ScrapeProgressListener,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

const WALMART_URL_PREFIX = /^https?:\/\/(www\.)?walmart\.com\//;
// FF#1 (2026-06-01) — empirically-grounded regex loosening. Walmart serves
// BOTH listing shapes canonically:
//   • `/ip/<id>`            (slugless — saved URL on vklf.com may have this shape)
//   • `/ip/<slug>/<id>`     (slug + id — actual product page after Walmart's URL rewrite)
// Director's 2026-06-01 Phase 4 paste confirmed: saved URL "/ip/803154651"
// + page URL "/ip/PanOxyl-Foaming-Acne-Wash-10-Benzoyl-Peroxide-Maximum-Strength-5-5-oz/803154651?...".
// The original `/\/ip\/[^/?#]+\/(\d+)\b/` regex required the slug segment, so the
// slugless saved URL parsed to null + urlsMatchByProductId returned false.
// Fix: make the slug segment optional via `(?:[^/?#]+\/)?`. Single canonical
// regex, no progressively-broader fallbacks added (per the 2026-05-31 Etsy
// FF#3 Pattern).
const LISTING_PAGE_PATH = /\/ip\/(?:[^/?#]+\/)?(\d+)\b/;
const REVIEWS_PAGE_PATH = /\/reviews\/product\/(\d+)\b/;

const DEFAULT_CAP_PER_STAR = 200;

// Walmart's per-star filter values per the director's verbatim 2026-05-25
// spec preserved in the P-49 ROADMAP entry. All 5 stars are selectable in
// the trigger modal; the DEFAULT selection captures all 5 (Walmart provides
// clean per-star filters so capturing all of them is the most-comprehensive
// default — director can opt out of any star via the modal).
export const WALMART_STAR_FILTERS = [1, 2, 3, 4, 5] as const;
export type WalmartStarFilter = (typeof WALMART_STAR_FILTERS)[number];

/**
 * Director-supplied default star selection per the 2026-05-25 verbatim spec:
 * capture all 5 stars by default (5, 4, 3, 2, 1 in descending order).
 * Walmart's per-star URL contract is the cleanest of the 4 platforms so
 * capturing all stars is the natural default; director can deselect any
 * stars via the trigger modal on a per-trigger basis (per §A.4 per-trigger
 * override).
 */
export const WALMART_DEFAULT_SELECTED_STARS: readonly number[] = [5, 4, 3, 2, 1];

/**
 * Returns true when the given numeric rating is one of the supported Walmart
 * star filters (1..5).
 */
export function isWalmartStarFilter(rating: number): rating is WalmartStarFilter {
  return (
    rating === 1 ||
    rating === 2 ||
    rating === 3 ||
    rating === 4 ||
    rating === 5
  );
}

// ─── URL detection helpers (FF#1 symmetric Pattern) ──────────────────────

/** Returns true when the given URL is a recognized Walmart listing page (`/ip/<slug>/<ID>`). */
export function isWalmartListingPage(url: string): boolean {
  return WALMART_URL_PREFIX.test(url) && LISTING_PAGE_PATH.test(url);
}

/** Returns true when the given URL is a recognized Walmart reviews page (`/reviews/product/<ID>`). */
export function isWalmartReviewsPage(url: string): boolean {
  return WALMART_URL_PREFIX.test(url) && REVIEWS_PAGE_PATH.test(url);
}

/**
 * Returns true when the given URL is any Walmart page the scrape can dispatch
 * from — either the listing page (`/ip/<slug>/<ID>`) OR the reviews page
 * (`/reviews/product/<ID>`). Mirrors the Amazon FF#1 symmetric helper Pattern
 * from the 2026-05-28 deploy.
 */
export function isWalmartScrapableUrl(url: string): boolean {
  return isWalmartListingPage(url) || isWalmartReviewsPage(url);
}

/**
 * Returns the product_id from a Walmart listing URL (`/ip/<slug>/<ID>`), or
 * null when the URL isn't a recognized listing shape.
 */
export function extractProductIdFromListingUrl(url: string): string | null {
  const match = url.match(LISTING_PAGE_PATH);
  return match ? (match[1] ?? null) : null;
}

/**
 * Returns the product_id from a Walmart reviews URL (`/reviews/product/<ID>`),
 * or null when the URL isn't a recognized reviews shape.
 */
export function extractProductIdFromReviewsUrl(url: string): string | null {
  const match = url.match(REVIEWS_PAGE_PATH);
  return match ? (match[1] ?? null) : null;
}

/**
 * Returns the product_id from any Walmart URL exposing one — tries the
 * listing shape first, then the reviews shape. Returns null when neither
 * matches. Mirrors Amazon's extractAsinFromAmazonUrl + eBay's
 * extractItemIdFromEbayUrl symmetric Pattern.
 */
export function extractProductIdFromWalmartUrl(url: string): string | null {
  return (
    extractProductIdFromListingUrl(url) ?? extractProductIdFromReviewsUrl(url)
  );
}

/**
 * Returns true when the given Walmart URL matches the same product_id as the
 * given saved CompetitorUrl's URL. Both URLs may be in either /ip/ or
 * /reviews/product/ shape; the match is product_id-based and shape-agnostic.
 * Mirrors the Amazon urlsMatchByAsin + eBay urlsMatchByItemId Pattern.
 */
export function urlsMatchByProductId(
  pageUrl: string,
  savedUrl: string,
): boolean {
  const pageId = extractProductIdFromWalmartUrl(pageUrl);
  if (!pageId) return false;
  const savedId = extractProductIdFromWalmartUrl(savedUrl);
  return savedId === pageId;
}

// ─── URL builders ────────────────────────────────────────────────────────

/**
 * Returns the canonical Walmart reviews-page URL for the given product_id +
 * star filter + page number. Format per the director-supplied 2026-05-25
 * spec preserved in the P-49 ROADMAP entry:
 *   `https://www.walmart.com/reviews/product/<ID>?ratings=<N>&page=<M>`.
 *
 * Walmart paginates reviews at 10/page per the director-verbatim spec.
 * Multi-star filtering is supported by repeated `&ratings=M` params, but
 * this builder targets one star at a time (the cross-star loop visits each
 * filter sequentially per the W2 Amazon Pattern).
 */
export function buildWalmartReviewUrl(
  productId: string,
  starFilter: WalmartStarFilter,
  pageNumber = 1,
): string {
  const params = new URLSearchParams({
    ratings: String(starFilter),
    page: String(pageNumber),
  });
  return `https://www.walmart.com/reviews/product/${productId}?${params.toString()}`;
}

// ─── DOM walkers (operate on any Document — current page OR fetched HTML) ─

export interface WalmartReviewRow {
  starRating: number;
  body: string;
  title: string | null;
  reviewerName: string | null;
  reviewDate: string | null; // ISO date string when parseable; raw text otherwise
}

/**
 * Parses a Walmart star-rating signal text into an integer rating (1..5).
 * Walmart typically renders the star value via an aria-label like
 * "4 out of 5 stars" on a container element. Returns null on parse failure.
 *
 * Handles common variants:
 *   "5 out of 5 stars" → 5
 *   "4.0 out of 5 stars" → 4 (rounded)
 *   "Rated 3 out of 5 Stars" → 3
 *   "" or unparseable → null
 */
export function parseWalmartStarRating(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*out\s+of\s+5/i);
  if (!m) return null;
  const n = parseFloat(m[1] ?? '');
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

/**
 * Parses a Walmart review-date text into an ISO 8601 timestamp. Walmart
 * renders dates in shapes like "April 12, 2024" or "4/12/2024". Returns
 * null on parse failure; caller falls back to the raw rendered text.
 */
export function parseWalmartReviewDate(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Returns the reviews list container element within the given parsed
 * document, or null when no canonical container can be found.
 *
 * Per the 2026-05-31 W2 Etsy FF#3 Pattern: single canonical-class selector
 * + hidden-state filter, NO progressively-broader fallbacks. If the
 * canonical container is renamed by Walmart in a future UI update, the
 * scraper fails fast + Phase 4 surfaces it — the diagnostic-instrumentation
 * FF Pattern picks up.
 *
 * `[data-testid="reviews-list"]` is the canonical Walmart reviews container
 * as of the 2026-05 timeframe. The hidden-state filter defends against any
 * variant where Walmart might pre-render a hidden duplicate list (e.g., a
 * skeleton placeholder shown during AJAX hydration).
 */
export function findWalmartReviewsContainer(
  doc: ParentNode,
): Element | null {
  const candidates = Array.from(
    doc.querySelectorAll('[data-testid="reviews-list"]'),
  );
  for (const el of candidates) {
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (el.hasAttribute('hidden')) continue;
    return el;
  }
  return null;
}

/**
 * Extracts review rows from a parsed Walmart reviews-page Document.
 *
 * Selector strategy per the 2026-05-31 W2 Etsy FF#3 Pattern: single
 * canonical-class row selector + per-row hidden-state filter. No
 * progressively-broader fallbacks.
 *
 * Defensive: rows missing a star rating OR a body are skipped silently
 * (Walmart occasionally emits decorative placeholders / "no reviews"
 * empty-state markup that doesn't match the review shape).
 */
export function extractReviewsFromDocument(
  doc: Document,
): WalmartReviewRow[] {
  // Scope to the canonical reviews-list container when present; otherwise
  // fall through to whole-document scope (Walmart's pre-hydration HTML
  // sometimes renders reviews directly under <main> without the wrapper).
  const scope: ParentNode = findWalmartReviewsContainer(doc) ?? doc;

  // Canonical Walmart review row marker. `[data-testid="reviews-section"]`
  // is the row-level data-testid pattern used by Walmart's review cards.
  // Hidden-state filter applied per-row to reject any hydration-phase
  // skeleton variants.
  const rowEls = Array.from(
    scope.querySelectorAll('[data-testid="reviews-section"]'),
  ).filter((el) => {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.hasAttribute('hidden')) return false;
    return true;
  });

  const rows: WalmartReviewRow[] = [];
  for (const el of rowEls) {
    const starRating = extractWalmartReviewStarRating(el);
    if (starRating === null) continue;

    const body = extractWalmartReviewBody(el);
    if (!body) continue;

    const title = extractWalmartReviewTitle(el);
    const reviewerName = extractWalmartReviewerName(el);
    const reviewDate = extractWalmartReviewDate(el);

    rows.push({ starRating, body, title, reviewerName, reviewDate });
  }
  return rows;
}

/**
 * Extracts the star rating from a single Walmart review row element. Walmart
 * renders the star count as an aria-label on a stars-container element
 * (e.g., `<span aria-label="4 out of 5 stars">`). Returns null on parse
 * failure — the caller skips rows missing a star rating.
 */
export function extractWalmartReviewStarRating(rowEl: Element): number | null {
  const starsEl = rowEl.querySelector('[aria-label*="out of 5"]');
  if (!starsEl) return null;
  const label = starsEl.getAttribute('aria-label') ?? '';
  return parseWalmartStarRating(label);
}

/**
 * Extracts the review title from a single Walmart review row element.
 * Walmart renders the title under `[data-testid="review-title"]`. Returns
 * null when the title is missing (Walmart reviews don't always have a
 * title — body-only reviews are common).
 */
export function extractWalmartReviewTitle(rowEl: Element): string | null {
  const titleEl = rowEl.querySelector('[data-testid="review-title"]');
  const text = titleEl?.textContent?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Extracts the review body from a single Walmart review row element. Walmart
 * renders the body text under `[data-testid="review-body"]`. The full body
 * is in the server-rendered HTML — Walmart's "View more" expander is CSS
 * truncation only (no AJAX call for hidden text), so reading textContent
 * gives the full body even on long reviews.
 *
 * Returns empty string when no body element is found — the caller skips
 * such rows.
 */
export function extractWalmartReviewBody(rowEl: Element): string {
  const bodyEl = rowEl.querySelector('[data-testid="review-body"]');
  return bodyEl?.textContent?.trim() ?? '';
}

/**
 * Extracts the reviewer name from a single Walmart review row element.
 * Walmart renders the reviewer display name under
 * `[data-testid="review-reviewer"]`. Returns null when the name element
 * is missing (Walmart anonymizes some accounts).
 */
export function extractWalmartReviewerName(rowEl: Element): string | null {
  const nameEl = rowEl.querySelector('[data-testid="review-reviewer"]');
  const text = nameEl?.textContent?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Extracts the review date from a single Walmart review row element.
 * Walmart renders the date under `[data-testid="review-date"]`. Returns
 * the parsed ISO 8601 string when the date is parseable; otherwise the raw
 * rendered text; null when no date element is found.
 */
export function extractWalmartReviewDate(rowEl: Element): string | null {
  const dateEl = rowEl.querySelector('[data-testid="review-date"]');
  const text = dateEl?.textContent?.trim() ?? '';
  if (text.length === 0) return null;
  const iso = parseWalmartReviewDate(text);
  return iso ?? text;
}

// ─── Scrape orchestration ────────────────────────────────────────────────

export interface WalmartScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured reviews to. */
  competitorUrlId: string;
  /** Product ID parsed from the trigger URL — keyed for the cross-star loop. */
  productId: string;
  /**
   * Per-star cap. The cross-star loop visits up to this many reviews per
   * star rating before moving to the next. Defaults to 200 when null/undefined.
   * Director can override the per-URL default at trigger time via the trigger
   * modal (per §A.4 of REVIEWS_PHASE_2_DESIGN.md).
   */
  capPerStar: number | null;
  /**
   * Optional explicit list of star filters to visit. When omitted, defaults
   * to all 5 stars in descending order (5, 4, 3, 2, 1) per the §A.2
   * director-verbatim spec for Walmart. Exposed for test isolation +
   * trigger-modal-driven scope tightening.
   */
  starsToVisit?: readonly WalmartStarFilter[];
  /** Human label for the indicator (e.g., "Walmart reviews — Product X"). */
  scopeLabel: string;
  /**
   * Background-proxy review-save call. Implementations route the call to the
   * existing /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
   * endpoint via the extension's BackgroundRequest pattern (content-scripts
   * can't reach vklf.com directly due to CORS).
   */
  saveReview(input: WalmartScrapeSaveInput): Promise<void>;
}

export interface WalmartScrapeSaveInput {
  clientId: string;
  starRating: number;
  body: string;
  title: string | null;
  reviewerName: string | null;
  reviewDate: string | null;
  /** Always null for Walmart — no helpful-count signal exposed by Walmart. */
  helpfulCount: null;
  /** Always "walmart" for this module; passed for the denormalized column. */
  platform: 'walmart';
  /** Discriminator — always "extension-scrape" for Walmart per-reviewer rows. */
  source: 'extension-scrape';
}

export interface WalmartScrapeResult {
  inserted: number;
  insertedByStar: Partial<Record<WalmartStarFilter, number>>;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
}

/**
 * Drives an end-to-end Walmart reviews scrape against the trigger product's
 * product_id. Opens the Shadow DOM progress indicator, walks each star
 * filter (5..1 by default) page-by-page (page 1..N up to capPerStar), and
 * persists each row via saveReview.
 *
 * Mirrors runAmazonReviewScrape's cross-star loop structure (the canonical
 * 5-filter Pattern from Session 2 2026-05-27) but at 0 helpful-count sort
 * (Walmart doesn't expose helpful-count) + no Customers-say block (Walmart's
 * AI-summary widget is not in scope for Session 1).
 */
export async function runWalmartReviewScrape(
  ctx: WalmartScrapeContext,
): Promise<WalmartScrapeResult> {
  const controller = new AbortController();
  const indicator = openScrapeProgressIndicator({
    scopeLabel: ctx.scopeLabel,
    onCancel: () => controller.abort(),
  });
  const onProgress: ScrapeProgressListener = (event) => indicator.update(event);

  const capPerStar =
    ctx.capPerStar && ctx.capPerStar > 0 ? ctx.capPerStar : DEFAULT_CAP_PER_STAR;
  const starsToVisit =
    ctx.starsToVisit && ctx.starsToVisit.length > 0
      ? ctx.starsToVisit
      : ([5, 4, 3, 2, 1] as readonly WalmartStarFilter[]);

  const insertedByStar: Partial<Record<WalmartStarFilter, number>> = {};
  let totalInserted = 0;
  let runningAbort: WalmartScrapeResult['abortReason'];
  let runningAbortMessage: string | undefined;

  try {
    starLoop: for (const starFilter of starsToVisit) {
      if (controller.signal.aborted) {
        runningAbort = 'user-cancel';
        break;
      }
      onProgress({ kind: 'star-started', starRating: starFilter });
      const perStarResult = await scrapeOneStar({
        ctx,
        starFilter,
        capPerStar,
        controller,
        onProgress,
        startingRowOffset: totalInserted,
      });
      insertedByStar[starFilter] = perStarResult.inserted;
      totalInserted += perStarResult.inserted;
      onProgress({
        kind: 'star-completed',
        starRating: starFilter,
        rowsForStar: perStarResult.inserted,
        totalRowsCaptured: totalInserted,
      });
      if (perStarResult.abortReason !== undefined) {
        runningAbort = perStarResult.abortReason;
        runningAbortMessage = perStarResult.abortMessage;
        // Per §A.15 anti-escalation: captcha + rate-limit + user-cancel +
        // error all abort the whole scrape. Don't continue to the next
        // star — that'd compound the bot signal.
        break starLoop;
      }
    }

    if (runningAbort === undefined) {
      onProgress({ kind: 'completed', totalRowsCaptured: totalInserted });
    }

    return {
      inserted: totalInserted,
      insertedByStar,
      abortReason: runningAbort,
      abortMessage: runningAbortMessage,
    };
  } catch (err) {
    indicator.update({
      kind: 'aborted',
      reason: 'error',
      totalRowsCaptured: totalInserted,
      message: err instanceof Error ? err.message : 'Unexpected error',
    });
    return {
      inserted: totalInserted,
      insertedByStar,
      abortReason: 'error',
      abortMessage: err instanceof Error ? err.message : 'Unexpected error',
    };
  }
}

interface ScrapeOneStarOptions {
  ctx: WalmartScrapeContext;
  starFilter: WalmartStarFilter;
  capPerStar: number;
  controller: AbortController;
  onProgress: ScrapeProgressListener;
  /**
   * Running total of rows captured by previous stars in this same scrape.
   * The progress indicator surfaces cumulative counts so director sees a
   * single growing number rather than per-star counts that reset.
   */
  startingRowOffset: number;
}

interface ScrapeOneStarResult {
  inserted: number;
  abortReason?: WalmartScrapeResult['abortReason'];
  abortMessage?: string;
}

/**
 * Walks the per-star Walmart reviews URL page-by-page via fetch() +
 * DOMParser, persisting each row in document order (no helpful-count sort —
 * Walmart doesn't expose helpful-count). Stop signal = fetched page renders
 * 0 review rows (FF#4 Pattern from the 2026-05-28 Amazon deploy).
 */
async function scrapeOneStar(
  opts: ScrapeOneStarOptions,
): Promise<ScrapeOneStarResult> {
  const {
    ctx,
    starFilter,
    capPerStar,
    controller,
    onProgress,
    startingRowOffset,
  } = opts;

  let currentDoc: Document | null = null;
  let currentPageNumber = 1;
  let isFirstPage = true;

  // Cumulative-totals wrapper — page-loaded + row-saved events surface
  // session-wide totals across the cross-star scrape, not per-star.
  // Star context lets the indicator render "5★ — page 2…" rather than
  // bare "page 2".
  const starContext = `${String(starFilter)}★`;
  const wrappedOnProgress: ScrapeProgressListener = (event) => {
    if (event.kind === 'page-loaded') {
      onProgress({
        ...event,
        starContext,
        totalRowsCaptured: startingRowOffset + event.totalRowsCaptured,
      });
    } else if (event.kind === 'row-saved') {
      onProgress({
        ...event,
        totalRowsCaptured: startingRowOffset + event.totalRowsCaptured,
      });
    } else if (event.kind === 'page-loading') {
      onProgress({ ...event, starContext });
    } else if (event.kind === 'aborted' || event.kind === 'completed') {
      // Per-star completed + aborted suppressed — the parent emits them
      // once the cross-star loop reaches its own conclusion.
      // No-op.
    } else {
      onProgress(event);
    }
  };

  const result = await paginate<WalmartReviewRow>({
    onProgress: wrappedOnProgress,
    abortSignal: controller.signal,
    // Walmart's anti-bot serves a "PerimeterX" interstitial with a
    // `#px-captcha` element when it suspects automation. The generic
    // CAPTCHA selectors merged in by paginate() catch reCAPTCHA + hCaptcha;
    // we add Walmart's own affordances here.
    captchaSelectors: [
      '#px-captcha',
      'div[id*="px-captcha"]',
      'iframe[src*="perimeterx"]',
    ],
    capRows: capPerStar,
    extractCurrentPageRows: () => {
      if (!currentDoc) return [];
      return extractReviewsFromDocument(currentDoc);
    },
    advanceToNextPage: async () => {
      // FF#4 Pattern: build pagination URL directly via buildWalmartReviewUrl.
      // The `?page=N` URL parameter is stable per the director-verbatim spec.
      // Stop signal = the just-fetched page returns 0 review rows.
      let nextPageNumber: number;
      if (isFirstPage) {
        nextPageNumber = 1;
        isFirstPage = false;
      } else {
        nextPageNumber = currentPageNumber + 1;
      }
      const nextUrl = buildWalmartReviewUrl(
        ctx.productId,
        starFilter,
        nextPageNumber,
      );
      const resp = await fetch(nextUrl, {
        credentials: 'include',
        headers: { Accept: 'text/html' },
        signal: controller.signal,
      });
      if (!resp.ok) {
        const err = new Error(
          `Walmart per-star fetch returned ${String(resp.status)} for ${String(starFilter)}★`,
        ) as Error & { status: number };
        err.status = resp.status;
        throw err;
      }
      const html = await resp.text();
      const parser = new DOMParser();
      currentDoc = parser.parseFromString(html, 'text/html');
      currentPageNumber = nextPageNumber;
      const rowsOnPage = extractReviewsFromDocument(currentDoc).length;
      if (rowsOnPage === 0) return false;
      return true;
    },
    saveRow: async (row) => {
      // Save immediately — Walmart doesn't have helpful-count so there's no
      // per-star buffer + sort step (unlike Amazon's per-star sort by
      // helpful-count before save). Per-row star comes from the row itself
      // (parsed from the aria-label) so cross-filter rows that leak in due
      // to a Walmart UI quirk would still carry their own star.
      try {
        await ctx.saveReview({
          clientId: makeClientId(),
          starRating: row.starRating,
          body: row.body,
          title: row.title,
          reviewerName: row.reviewerName,
          reviewDate: row.reviewDate,
          helpfulCount: null,
          platform: 'walmart',
          source: 'extension-scrape',
        });
      } catch (err) {
        // Rethrow — paginate()'s saveRow error-classification catches
        // rate-limit (429/503) + AbortError and propagates them as the
        // PaginateResult.abortReason. Other errors surface as 'error'.
        throw err;
      }
    },
  });

  return {
    inserted: result.totalRowsCaptured,
    abortReason: result.abortReason,
    abortMessage: result.abortMessage,
  };
}

function makeClientId(): string {
  // crypto.randomUUID is widely available in Chrome 92+. The extension's
  // minimum-Chrome is later than that per the manifest v3 baseline.
  return crypto.randomUUID();
}
