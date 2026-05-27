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
 * Extracts review rows from a parsed Walmart reviews-page Document.
 *
 * FF#3 (2026-06-01) — empirically-grounded selectors from director's
 * 2026-06-01 Phase 4 HTML dumps (plos-walmart-diag-803154651-{1,2,3}star-page1.html).
 * The FF#1-shipped selectors `[data-testid="reviews-section"]` etc. all
 * returned 0 in the SELECTOR PROBE; the empirical evidence shows Walmart
 * uses entirely different data-testid names:
 *
 *   • Per-review row anchor: `[data-testid="enhanced-review-content"]`
 *     (10 instances per page, 1:1 with reviews; contains the body <p>)
 *   • Per-review card root: `bodyEl.closest('.overflow-visible')` — the
 *     review card has the class signature `overflow-visible b--none ...`
 *     unique to review cards on the reviews page.
 *   • Star rating: `<span class="ld_Ec">N out of 5 stars review</span>`
 *     — Walmart's screen-reader-only span. Always present (10/10 reviews).
 *   • Title: `<h3>` within the card. Only ~40% of reviews have titles —
 *     6/10 reviews on the 3-star page were body-only. Null when missing.
 *   • Body: `<p>` inside `enhanced-review-content`. The CSS `-webkit-line-clamp:3`
 *     is truncation-only; the FULL text is in the DOM. The "View more"
 *     expander is purely CSS — no AJAX call.
 *   • Reviewer name: `aria-label` value on the reviewer block
 *     `<div class="flex flex-column " aria-label="<Name>">`. The names
 *     are the aria-label value itself, not textContent. Skip aria-labels
 *     on buttons + those containing "review"/"purchase"/"rating"/etc.
 *   • Date: first `.f7.gray` element inside the card. Formatted plain text
 *     like "Oct 16, 2025".
 *
 * Per the 2026-05-31 W2 Etsy FF#3 Pattern: single canonical-class
 * selectors, NO progressively-broader fallbacks. If Walmart renames a
 * canonical attribute in the future, the scraper fails fast in Phase 4
 * + the diagnostic-instrumentation FF Pattern picks up.
 *
 * Defensive: rows missing a star rating OR a body are skipped silently
 * (some Walmart reviews are star-rating-only with no comment body).
 */
export function extractReviewsFromDocument(
  doc: Document,
): WalmartReviewRow[] {
  // Anchor on the per-review body container (canonical, 1:1 with reviews).
  const bodyEls = Array.from(
    doc.querySelectorAll('[data-testid="enhanced-review-content"]'),
  );

  const rows: WalmartReviewRow[] = [];
  for (const bodyEl of bodyEls) {
    // Walk up to the review card root via `.closest('.overflow-visible')`.
    // The review card has the canonical class `overflow-visible b--none ...`;
    // closest('.overflow-visible') returns the nearest ancestor div with
    // that class, which is the card boundary. Skip rows whose ancestor
    // chain doesn't include a card (defensive — shouldn't happen on the
    // real reviews page but might in pre-hydration / decorative variants).
    const card = bodyEl.closest('.overflow-visible');
    if (!card) continue;

    const starRating = extractWalmartReviewStarRating(card);
    if (starRating === null) continue;

    const body = extractWalmartReviewBody(bodyEl);
    if (!body) continue;

    const title = extractWalmartReviewTitle(card);
    const reviewerName = extractWalmartReviewerName(card);
    const reviewDate = extractWalmartReviewDate(card);

    rows.push({ starRating, body, title, reviewerName, reviewDate });
  }
  return rows;
}

/**
 * Extracts the star rating from a single Walmart review card. Walmart
 * renders a screen-reader-only span with the canonical text "N out of 5
 * stars review" — always present even when the visible stars are SVG-only.
 * FF#3 (2026-06-01) — empirical from director's HTML dump.
 *
 * Returns null on parse failure — the caller skips rows missing a star rating.
 */
export function extractWalmartReviewStarRating(cardEl: Element): number | null {
  const starsEl = cardEl.querySelector('.ld_Ec');
  if (!starsEl) return null;
  const text = starsEl.textContent ?? '';
  return parseWalmartStarRating(text);
}

/**
 * Extracts the review title from a single Walmart review card. Walmart
 * renders the title as an `<h3>` element within the right-column content
 * area. Returns null when no title is present — many Walmart reviews are
 * body-only (no title), and that's expected.
 * FF#3 (2026-06-01) — empirical from director's HTML dump.
 */
export function extractWalmartReviewTitle(cardEl: Element): string | null {
  const titleEl = cardEl.querySelector('h3');
  const text = titleEl?.textContent?.trim() ?? '';
  return text.length > 0 ? text : null;
}

/**
 * Extracts the review body from a Walmart `enhanced-review-content` body
 * element. The body text lives in a `<p>` child inside the container; the
 * CSS `-webkit-line-clamp:3` is truncation-only — the full text is in the
 * DOM and textContent gives the full body even on long reviews.
 * FF#3 (2026-06-01) — empirical from director's HTML dump.
 *
 * Returns empty string when no body `<p>` is found — the caller skips
 * such rows (star-rating-only reviews with no comment).
 */
export function extractWalmartReviewBody(bodyEl: Element): string {
  const p = bodyEl.querySelector('p');
  return p?.textContent?.trim() ?? '';
}

/**
 * Extracts the reviewer display name from a single Walmart review card.
 * Walmart renders the reviewer name as an `aria-label` value on the
 * reviewer block `<div class="flex flex-column " aria-label="<Name>">`.
 * The name is in the ATTRIBUTE, not textContent. Examples from director's
 * 2026-06-01 HTML dump: "Mimiofboys", "Stacia", "alexandra", "anonymous",
 * "Walmart customer, Top Reviewer", "Pay", "A, Top Reviewer", etc.
 * FF#3 (2026-06-01) — empirical from director's HTML dump.
 *
 * Selection strategy: scan all `[aria-label]` elements within the card;
 * skip buttons + skip aria-labels that contain reserved keywords (review,
 * purchase, rating, upvote, downvote — those are interaction-related, not
 * reviewer names). The first remaining aria-label is the reviewer name.
 *
 * Returns null when no reviewer name can be found.
 */
export function extractWalmartReviewerName(cardEl: Element): string | null {
  // Word-boundary regex — matches "review" / "purchase" etc. as whole words,
  // NOT as substrings of other words. Critical: "Walmart customer, Top Reviewer"
  // is a real director-observed reviewer name (the "Top Reviewer" badge gets
  // appended); the prior substring regex `/review/i` falsely filtered it
  // because "Reviewer" contains "Review" as a substring. The `\b` anchors
  // require the keyword to be a complete word (so "Review" matches alone but
  // "Reviewer" does NOT).
  const RESERVED_KEYWORDS = /\b(review|purchase|rating|upvote|downvote)\b/i;
  const candidates = Array.from(cardEl.querySelectorAll('[aria-label]'));
  for (const el of candidates) {
    const tagName = el.tagName.toLowerCase();
    if (tagName === 'button') continue;
    const label = el.getAttribute('aria-label') ?? '';
    if (!label) continue;
    if (RESERVED_KEYWORDS.test(label)) continue;
    return label;
  }
  return null;
}

/**
 * Extracts the review date from a single Walmart review card. Walmart
 * renders the date as plain text inside a `.f7.gray` div in the left meta
 * column. Format examples from director's 2026-06-01 HTML dump: "Oct 16, 2025".
 * FF#3 (2026-06-01) — empirical from director's HTML dump.
 *
 * Returns the parsed ISO 8601 string when the date is parseable;
 * otherwise the raw rendered text; null when no date element is found.
 */
export function extractWalmartReviewDate(cardEl: Element): string | null {
  const dateEl = cardEl.querySelector('.f7.gray');
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
