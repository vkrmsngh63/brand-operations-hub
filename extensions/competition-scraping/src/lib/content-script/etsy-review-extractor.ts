// Etsy per-platform review extractor shipped under P-49 Workstream 2 Etsy
// sub-cluster Session 1 per docs/REVIEWS_PHASE_2_DESIGN.md §C.2 + §A.2
// priority order (Etsy third per-platform sub-cluster after Amazon + eBay).
//
// Architecture mirrors amazon-review-extractor.ts + ebay-review-extractor.ts
// with three Etsy-specific adaptations per the director-supplied 2026-05-25
// verbatim spec preserved in the P-49 ROADMAP entry:
//
//   1. Reviews are on the listing page itself (`/listing/<ID>/...`) + a
//      "View all reviews for this item" overlay with per-star percentage
//      filter affordances at top-right (hover to see %, click to filter).
//      ~8 reviews/page in the overlay paginated.
//
//   2. Capture review body only — Etsy doesn't expose a helpful-count
//      signal or per-review title field per the director spec.
//
//   3. Default capture: 3-star + 2-star + 1-star reviews (negative +
//      middling only) at 200/star user-adjustable. Etsy's positive 4-star +
//      5-star reviews can be opted into via the trigger modal but aren't on
//      the default capture path — competitively informative reviews skew
//      toward the negative + middling buckets.
//
// Reuses W2 Amazon + eBay Patterns from the 2026-05-28 + 2026-05-30 deploys:
//   • FF#1 symmetric URL helpers (isEtsyListingPage + isEtsyScrapableUrl +
//     extractListingIdFromEtsyUrl + urlsMatchByListingId).
//   • FF#4 URL-construction-based pagination (buildEtsyReviewUrl drives the
//     pagination loop via `?ratings=<N>&page=<N>` query parameters rather
//     than scraping next-page links which evolve with the UI).
//   • Cross-filter loop structure mirroring the W2 Amazon 5-star loop +
//     W2 eBay 2-filter loop (3 → 2 → 1 stars by default; anti-bot abort
//     on captcha + rate-limit per §A.15).
//   • Shadow DOM trigger modal with per-URL cap override (reused as-is;
//     selectableStars=[1,2,3,4,5] + defaultSelectedStars=[3,2,1] passed
//     at orchestration time per the director-verbatim default).
//   • NEW JSON data-island extraction Pattern from yesterday's eBay FF#5
//     applied from the start for any seller/shop metadata that Etsy's
//     React UI may render via component state rather than `<a href>`
//     links — extractShopNameFromListingHtml below.
//   • NEW Tabpanel-scoped DOM walking Pattern from yesterday's eBay FF#5
//     applied from the start — if Etsy's review overlay uses tabbed UI
//     with hidden inactive tabs, the walker scope falls through to the
//     active panel before whole-doc fallback.

import {
  paginate,
  type ScrapeProgressListener,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

const ETSY_URL_PREFIX = /^https?:\/\/(www\.)?etsy\.com\//;
const LISTING_PAGE_PATH = /\/listing\/(\d+)\b/;

const DEFAULT_CAP_PER_STAR = 200;

// Etsy's per-star filter values per the director's verbatim 2026-05-25 spec.
// All 5 stars are selectable in the trigger modal (director can opt into
// 4-star + 5-star captures) but the DEFAULT selection is the negative +
// middling buckets only (3, 2, 1). The cross-filter loop visits in
// descending order so that director sees the most-recently-filtered most
// competitively-informative reviews land first.
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

/**
 * Returns the canonical Etsy listing page URL for the given listing_id.
 * The listing page is where extractShopNameFromListingHtml resolves the
 * shop name + where review rows render inline before the overlay opens.
 */
export function buildEtsyListingUrl(listingId: string): string {
  return `https://www.etsy.com/listing/${listingId}`;
}

/**
 * Returns the canonical Etsy review URL for the given listing_id + star
 * filter + page number. Per the director-supplied 2026-05-25 spec, the
 * "View all reviews for this item" overlay paginates at ~8 reviews/page
 * with per-star percentage filter affordances at top-right. The URL
 * parameter contract is built on `?ratings=<N>` (the per-star filter) +
 * `?page=<N>` (the pagination cursor) — both attached to the listing URL.
 *
 * Per FF#4 Pattern from the 2026-05-28 Amazon deploy: prefer URL-construction
 * pagination over DOM-link-scraping when the URL parameter contract is
 * stable. Stop signal = the fetched page renders 0 review rows (caught
 * inside `advanceToNextPage` in `runEtsyReviewScrape`).
 *
 * If Phase 4 verification reveals the URL params need adjustment (e.g.,
 * Etsy expects `rating=<N>` singular or `&page_offset=<N>`), this is the
 * canonical fix point — adjust the param shape + re-deploy following the
 * eBay FF#3 precedent.
 */
export function buildEtsyReviewUrl(
  listingId: string,
  starFilter: EtsyStarFilter,
  pageNumber = 1,
): string {
  const params = new URLSearchParams({
    ratings: String(starFilter),
    page: String(pageNumber),
  });
  return `https://www.etsy.com/listing/${listingId}?${params.toString()}`;
}

/** Returns true when the given URL is a recognized Etsy listing page. */
export function isEtsyListingPage(url: string): boolean {
  return ETSY_URL_PREFIX.test(url) && LISTING_PAGE_PATH.test(url);
}

/**
 * Returns true when the given URL is any Etsy page the scrape can dispatch
 * from. For Etsy reviews live on the listing page itself (no separate
 * review URL shape like Amazon's `/product-reviews/<ASIN>/` or eBay's
 * `/fdbk/mweb_profile?...`), so `isEtsyScrapableUrl` reduces to
 * `isEtsyListingPage`. Kept as a separate function to preserve the FF#1
 * symmetric helper Pattern from the 2026-05-28 Amazon deploy — the
 * orchestrator dispatch chain uses `isXxxScrapableUrl` per platform.
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
 * given saved CompetitorUrl's URL. Mirrors `urlsMatchByAsin` + `urlsMatchByItemId`
 * Patterns from Amazon + eBay (FF#1 symmetric helper from 2026-05-28).
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

// ─── DOM walkers (operate on any Document — current page OR fetched HTML) ─

export interface EtsyReviewRow {
  body: string;
  reviewerName: string | null;
  reviewDate: string | null;
  /**
   * Star rating parsed from the per-review aria-label when present. May be
   * null on parse failure; the orchestrator falls back to the currently-
   * walked filter's star value when persisting the row.
   */
  starRating: number | null;
}

/**
 * Extracts review rows from a parsed Etsy listing-page Document.
 *
 * Per the director-supplied 2026-05-25 spec: "Reviews for this item" section
 * on the listing page + "View all reviews for this item" overlay. The
 * overlay paginates at ~8 reviews/page. Capture review body only (Etsy
 * doesn't expose helpful-count or title fields).
 *
 * Apply NEW Pattern from yesterday's eBay FF#5 — Tabpanel-scoped DOM walking:
 * if Etsy's overlay uses tabbed UI with hidden inactive tabs (per the
 * Generalization noted in CORRECTIONS_LOG §Entry 2026-05-30 sub-observation b),
 * scope the walker to `[role=tabpanel]:not([hidden])` to avoid capturing
 * rows from inactive panels. Falls through to whole-doc scope as a
 * classic-view safety net.
 *
 * Row selector candidates (each tried in order; first non-empty match wins):
 *   1. `[data-testid="review-item"]` — modern Etsy data-testid (most stable).
 *   2. `[data-region="review"]` — Etsy's data-region marker for review wrappers.
 *   3. `.shop-review-card` — list-shop-review-cards container shape.
 *   4. `.review-listing-item` — legacy / classic-view fallback.
 */
export function extractReviewsFromDocument(doc: Document): EtsyReviewRow[] {
  // NEW Pattern (eBay FF#5 2026-05-30) — scope to the visible tabpanel if
  // one exists; falls through to whole-doc scope as classic-view fallback.
  const scope: ParentNode =
    doc.querySelector('[role=tabpanel]:not([hidden])') ?? doc;

  const ROW_SELECTORS: readonly string[] = [
    '[data-testid="review-item"]',
    '[data-region="review"]',
    '.shop-review-card',
    '.review-listing-item',
  ];
  let rowEls: Element[] = [];
  for (const sel of ROW_SELECTORS) {
    rowEls = Array.from(scope.querySelectorAll(sel));
    if (rowEls.length > 0) break;
  }

  const rows: EtsyReviewRow[] = [];
  for (const el of rowEls) {
    const body = extractReviewBody(el);
    if (!body) continue;
    const reviewerName = extractReviewerName(el);
    const reviewDate = extractReviewDate(el);
    const starRating = extractReviewStarRating(el);
    rows.push({ body, reviewerName, reviewDate, starRating });
  }
  return rows;
}

/**
 * Extracts the review body text from a single Etsy review element. Tries
 * the canonical data-testid first, then a small set of class-name + tag
 * fallbacks. Returns the trimmed text, or empty string when no selector
 * matches.
 */
export function extractReviewBody(rowEl: Element): string {
  const SELECTORS: readonly string[] = [
    '[data-testid="review-text"]',
    '[data-region="review-text"]',
    '.shop-review-card__text',
    '.review-text',
    'p.shop2-review-text',
  ];
  for (const sel of SELECTORS) {
    const bodyEl = rowEl.querySelector(sel);
    const text = bodyEl?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return '';
}

/**
 * Extracts the reviewer's display name from a single Etsy review element.
 * Etsy renders usernames as plain text (no anonymization like eBay's
 * "b***r" pattern). Returns null when no selector matches.
 */
export function extractReviewerName(rowEl: Element): string | null {
  const SELECTORS: readonly string[] = [
    '[data-testid="review-reviewer-name"]',
    '[data-region="reviewer-name"]',
    '.shop-review-card__reviewer',
    '.review-reviewer-name',
    'a[href*="/people/"]',
  ];
  for (const sel of SELECTORS) {
    const userEl = rowEl.querySelector(sel);
    const text = userEl?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return null;
}

/**
 * Extracts the review date from a single Etsy review element. Etsy renders
 * dates in a few shapes — "Apr 12, 2024", "Reviewed Apr 12, 2024", and
 * canonical `<time datetime="...">` markup. Returns the parsed ISO
 * timestamp when parseable; the raw rendered text on parse failure; null
 * when no date element is found. The downstream UI accepts both shapes.
 */
export function extractReviewDate(rowEl: Element): string | null {
  const SELECTORS: readonly string[] = [
    '[data-testid="review-date"]',
    '[data-region="review-date"]',
    '.shop-review-card__date',
    '.review-date',
    'time',
  ];
  for (const sel of SELECTORS) {
    const dateEl = rowEl.querySelector(sel);
    // <time datetime="..."> is the most-reliable extraction shape — prefer
    // the datetime attribute over the textContent when both are present.
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
 * Extracts the per-review star rating (1-5 integer) from a single Etsy
 * review element. Etsy renders ratings as a row of star icons with an
 * aria-label carrying "<N> out of 5 stars" or "<N> stars" on the
 * container. Returns null on parse failure — the orchestrator falls back
 * to the currently-walked filter's star value when persisting the row.
 */
export function extractReviewStarRating(rowEl: Element): number | null {
  const ariaCandidates = Array.from(rowEl.querySelectorAll('[aria-label]'));
  for (const el of ariaCandidates) {
    const label = el.getAttribute('aria-label')?.trim() ?? '';
    const rating = parseEtsyStarRating(label);
    if (rating !== null) return rating;
  }
  return null;
}

/**
 * Parses an Etsy star-rating aria-label string. Common shapes:
 *   "5 out of 5 stars" → 5
 *   "4 stars" → 4
 *   "3.5 out of 5 stars" → 4 (Math.round)
 * Returns null on parse failure (e.g., aria-label that doesn't contain a
 * star-rating phrase, or that resolves to a number outside 1..5).
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
 * Handles the "Reviewed Apr 12, 2024" prefix Etsy sometimes prepends in
 * its rendered text. Returns null on parse failure — caller falls back to
 * the raw rendered text per `extractReviewDate`'s contract.
 */
export function parseEtsyReviewDate(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  // Strip the leading "Reviewed" prefix Etsy sometimes prepends.
  const stripped = trimmed.replace(/^Reviewed\s+/i, '');
  const d = new Date(stripped);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ─── Listing metadata (JSON data-island Pattern from FF#5 2026-05-30) ────

/**
 * Extracts the seller shop name from an Etsy listing page's raw HTML.
 *
 * Applies the NEW JSON data-island extraction Pattern from yesterday's eBay
 * FF#5 (2026-05-30) — modern site listing pages frequently embed seller +
 * listing metadata in JSON blobs (Etsy in particular embeds extensive
 * shop + listing data in its Apollo / Redux blobs). Regex extraction
 * against raw HTML is more robust than DOM-link probing when the visible
 * UI renders the same data via React components rather than `<a href>`
 * links.
 *
 * Tries several plausible JSON keys for the shop name. Falls back to null
 * when none match — the DOM-based fallback path can still surface the
 * shop name via `extractShopNameFromListingDocument`.
 *
 * NOTE: this is currently informational — the W2 Etsy Session 1 dispatch
 * doesn't require the shop name to drive the scrape (Etsy reviews live on
 * the listing page, no separate seller-feedback URL like eBay's). Kept
 * here for future polish + parity with the eBay precedent.
 */
export function extractShopNameFromListingHtml(html: string): string | null {
  // Common JSON keys for the Etsy shop name across the embedded data islands.
  const PATTERNS: readonly RegExp[] = [
    /"shop_name":"([^"]+)"/,
    /"shopName":"([^"]+)"/,
    /"shop":\s*\{[^}]*?"name":"([^"]+)"/,
  ];
  for (const re of PATTERNS) {
    const m = html.match(re);
    if (m) {
      const raw = m[1];
      if (raw && raw.length > 0) {
        return raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
          String.fromCharCode(parseInt(code, 16)),
        );
      }
    }
  }
  return null;
}

/**
 * Legacy DOM-based shop name extraction — preserved as a fallback for
 * regional / classic-view listing pages that may not carry the JSON data
 * island. Probes for the shop-name link or data attribute in the seller-
 * card area.
 */
export function extractShopNameFromListingDocument(
  doc: Document,
): string | null {
  // data-shop-name attribute — direct attribute lookup.
  const dataEl = doc.querySelector('[data-shop-name]');
  const dataAttr = dataEl?.getAttribute('data-shop-name');
  if (dataAttr && dataAttr.length > 0) return dataAttr;

  // Text-content selectors — shop-name link or label in the seller card.
  const TEXT_SELECTORS: readonly string[] = [
    '.shop2-name-and-icon a',
    '.shop-name',
    'a[href*="/shop/"]',
  ];
  for (const sel of TEXT_SELECTORS) {
    const el = doc.querySelector(sel);
    const text = el?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return null;
}

// ─── Scrape orchestration ────────────────────────────────────────────────

export interface EtsyScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured reviews to. */
  competitorUrlId: string;
  /** Listing ID parsed from the trigger URL — keyed for the cross-star loop. */
  listingId: string;
  /**
   * Per-star cap. The cross-star loop visits up to this many rows per
   * star filter before moving to the next. Defaults to 200 when
   * null/undefined. Director can override the per-URL default at trigger
   * time via the trigger modal (per §A.4 of REVIEWS_PHASE_2_DESIGN.md).
   */
  capPerStar: number | null;
  /**
   * Optional explicit list of star filters to visit. When omitted, defaults
   * to ETSY_DEFAULT_SELECTED_STARS (the director-verbatim 3+2+1 default).
   * Exposed for test isolation + trigger-modal-driven scope tightening
   * (e.g., "just scrape 1-star reviews this run").
   */
  starsToVisit?: readonly EtsyStarFilter[];
  /** Human label for the indicator (e.g., "Etsy reviews — Product X"). */
  scopeLabel: string;
  /**
   * Background-proxy review-save call. Implementations route the call to
   * the existing /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
   * endpoint via the extension's BackgroundRequest pattern (content-scripts
   * can't reach vklf.com directly due to CORS).
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
  /** Always "etsy" for this module; passed for the denormalized column. */
  platform: 'etsy';
  /** Discriminator — always "extension-scrape" for Etsy per-reviewer rows. */
  source: 'extension-scrape';
}

export interface EtsyScrapeResult {
  inserted: number;
  insertedByStar: Partial<Record<EtsyStarFilter, number>>;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
}

/**
 * Drives an end-to-end Etsy review scrape against the trigger listing's
 * listing_id. Opens the Shadow DOM progress indicator, walks each star
 * filter (per director's default 3 → 2 → 1) page-by-page (page 1..N up
 * to capPerStar), and persists each row via saveReview with the synthetic
 * starRating from the filter mapping (or the per-review aria-label-parsed
 * rating when available).
 *
 * Mirrors `runEbayReviewScrape`'s cross-filter loop structure (Session 2
 * 2026-05-27 Pattern) and `runAmazonReviewScrape`'s 5-star loop structure
 * (Session 2 2026-05-27). No helpful-count buffer/sort step (Etsy doesn't
 * expose helpful-count) — rows save immediately in document order.
 */
export async function runEtsyReviewScrape(
  ctx: EtsyScrapeContext,
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
  let totalInserted = 0;
  let runningAbort: EtsyScrapeResult['abortReason'];
  let runningAbortMessage: string | undefined;

  try {
    starLoop: for (const filter of starsToVisit) {
      if (controller.signal.aborted) {
        runningAbort = 'user-cancel';
        break;
      }
      onProgress({ kind: 'star-started', starRating: filter });
      const perStarResult = await scrapeOneStar({
        ctx,
        filter,
        capPerStar,
        controller,
        onProgress,
        startingRowOffset: totalInserted,
      });
      insertedByStar[filter] = perStarResult.inserted;
      totalInserted += perStarResult.inserted;
      onProgress({
        kind: 'star-completed',
        starRating: filter,
        rowsForStar: perStarResult.inserted,
        totalRowsCaptured: totalInserted,
      });
      if (perStarResult.abortReason !== undefined) {
        runningAbort = perStarResult.abortReason;
        runningAbortMessage = perStarResult.abortMessage;
        // Per §A.15 anti-escalation: captcha + rate-limit + user-cancel +
        // error all abort the whole scrape. Don't continue to the next
        // filter — that'd compound the bot signal.
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
  ctx: EtsyScrapeContext;
  filter: EtsyStarFilter;
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
  abortReason?: EtsyScrapeResult['abortReason'];
  abortMessage?: string;
}

/**
 * Walks the per-star Etsy review URL page-by-page via fetch() + DOMParser,
 * persisting each row in document order (no helpful-count sort — Etsy
 * doesn't expose helpful-count). Stop signal = fetched page renders 0
 * review rows (FF#4 Pattern from the 2026-05-28 Amazon deploy).
 */
async function scrapeOneStar(
  opts: ScrapeOneStarOptions,
): Promise<ScrapeOneStarResult> {
  const {
    ctx,
    filter,
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
  // Filter context lets the indicator render "3★ — page 2…" rather than
  // bare "page 2".
  const starContext = `${String(filter)}★`;
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
      // once the cross-star loop reaches its own conclusion. No-op.
    } else {
      onProgress(event);
    }
  };

  const result = await paginate<EtsyReviewRow>({
    onProgress: wrappedOnProgress,
    abortSignal: controller.signal,
    // Etsy-specific captcha selectors — Etsy occasionally serves an
    // hCaptcha challenge inline. The generic CAPTCHA selectors merged
    // in by paginate() catch hCaptcha; we add Etsy's own affordances
    // here defensively.
    captchaSelectors: [
      'form[action*="captcha"]',
      'img[src*="captcha"]',
      '#captcha',
    ],
    capRows: capPerStar,
    extractCurrentPageRows: () => {
      if (!currentDoc) return [];
      return extractReviewsFromDocument(currentDoc);
    },
    advanceToNextPage: async () => {
      // FF#4 Pattern: build pagination URL directly via buildEtsyReviewUrl.
      // `?ratings=<N>&page=<N>` is the constructed URL contract; works
      // regardless of whether Etsy currently renders numbered links,
      // "Show more" buttons, or AJAX load-more affordances. Stop signal =
      // the just-fetched page returns 0 review rows.
      let nextPageNumber: number;
      if (isFirstPage) {
        nextPageNumber = 1;
        isFirstPage = false;
      } else {
        nextPageNumber = currentPageNumber + 1;
      }
      const nextUrl = buildEtsyReviewUrl(
        ctx.listingId,
        filter,
        nextPageNumber,
      );
      const resp = await fetch(nextUrl, {
        credentials: 'include',
        headers: { Accept: 'text/html' },
        signal: controller.signal,
      });
      if (!resp.ok) {
        const err = new Error(
          `Etsy per-star fetch returned ${String(resp.status)} for ${String(filter)}★`,
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
      // Save immediately — Etsy doesn't have helpful-count so there's no
      // per-star buffer + sort step (unlike Amazon's per-star sort by
      // helpful-count before save).
      await ctx.saveReview({
        clientId: makeClientId(),
        // Prefer the per-review aria-label parsed rating when available
        // (defends against any star-filter URL leakage where Etsy
        // returns rows from adjacent star buckets); fall back to the
        // walked-filter value.
        starRating: row.starRating ?? filter,
        body: row.body,
        title: null,
        reviewerName: row.reviewerName,
        reviewDate: row.reviewDate,
        helpfulCount: null,
        platform: 'etsy',
        source: 'extension-scrape',
      });
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
