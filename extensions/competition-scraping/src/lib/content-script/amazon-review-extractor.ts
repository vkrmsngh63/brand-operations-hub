// Amazon per-platform review extractor shipped under P-49 Workstream 2 Session 1
// (2026-05-26) per docs/REVIEWS_PHASE_2_DESIGN.md §C.2 + §A.2.
//
// Architecture (per §A.1 + §A.3 + §A.15):
//   • Triggered when director right-clicks on an Amazon product-reviews page
//     and picks the "Scrape reviews for this URL" context-menu entry.
//   • Walks the current page's review DOM, then paginates via fetch() +
//     DOMParser to subsequent page URLs in the SAME tab (rather than clicking
//     the "Next page" link, which would navigate Chrome away from the page
//     and kill the content-script mid-scrape).
//   • Honors §A.15 conservative defaults via scrape-pagination.ts: 1-3s
//     random delays between page fetches, captcha detection, rate-limit
//     detection, cancellable via the Shadow DOM progress indicator's Cancel
//     button.
//   • Persists each captured review via the background-proxy (background.ts's
//     `submit-captured-review` request kind) → POST to the existing
//     /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
//     endpoint with the new optional `helpfulCount` + `platform` fields.
//   • clientId per row uses crypto.randomUUID() for idempotency on retry.
//
// Session 2 (2026-05-27) extends Session 1 with the cross-star navigation
// loop: visit each of the 5 filterByStar URLs (one_star..five_star) in
// sequence + scrape up to cap per star + sort by helpfulCount desc within
// each star + capture the `Customers say` AI-summary block from the
// /dp/<ASIN> listing page as a special row. Pagination per star reuses the
// Session 1 fetch+DOMParser Pattern; the outer cross-star loop is a thin
// wrapper around paginate() per star.

import {
  AMAZON_CAPTCHA_SELECTORS,
  paginate,
  type ScrapeProgress,
  type ScrapeProgressListener,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

const AMAZON_URL_PREFIX = /^https?:\/\/(www\.)?amazon\.com\//;
const REVIEW_PAGE_PATH = /\/product-reviews\/([A-Z0-9]{10})\b/;

const DEFAULT_CAP_PER_STAR = 200;

// Amazon's review-page URL accepts these 5 filterByStar values, one per
// star rating. Each filter view caps at ~1000 reviews per Amazon's own
// pagination depth. Director-supplied per-platform spec preserved in the
// P-49 ROADMAP entry + locked in §A.2 of REVIEWS_PHASE_2_DESIGN.md.
export const AMAZON_STAR_FILTERS = [
  'one_star',
  'two_star',
  'three_star',
  'four_star',
  'five_star',
] as const;
export type AmazonStarFilter = (typeof AMAZON_STAR_FILTERS)[number];

/** Returns the star rating (1-5) for a given Amazon filterByStar value. */
export function starRatingForFilter(filter: AmazonStarFilter): number {
  switch (filter) {
    case 'one_star':
      return 1;
    case 'two_star':
      return 2;
    case 'three_star':
      return 3;
    case 'four_star':
      return 4;
    case 'five_star':
      return 5;
  }
}

/**
 * Returns the canonical Amazon per-star review page URL for the given ASIN +
 * filter + page number. Format per the director-supplied 2026-05-25 spec
 * preserved in the P-49 ROADMAP entry: `/product-reviews/<ASIN>/?filterByStar=<filter>&pageNumber=<page>`.
 *
 * Uses the .com TLD by default since extension is registered for amazon.com
 * only in the manifest v3 host_permissions; other regional TLDs ship at later
 * polish if needed.
 */
export function buildAmazonStarFilterUrl(
  asin: string,
  filter: AmazonStarFilter,
  page = 1,
): string {
  return `https://www.amazon.com/product-reviews/${asin}/?filterByStar=${filter}&pageNumber=${String(
    page,
  )}`;
}

/**
 * Returns the canonical Amazon product listing page URL for the given ASIN.
 * The listing page (rather than the per-star review page) is where the
 * `Customers say` AI-summary block renders.
 */
export function buildAmazonProductListingUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}/`;
}

/** Returns true when the given URL is a recognized Amazon product-reviews page. */
export function isAmazonReviewPage(url: string): boolean {
  return AMAZON_URL_PREFIX.test(url) && REVIEW_PAGE_PATH.test(url);
}

/**
 * Returns the ASIN from an Amazon product-reviews URL, or null if the URL
 * isn't a recognized review-page shape. Stable shape per the P-49 ROADMAP
 * entry's director-supplied per-platform spec.
 */
export function extractAsinFromReviewUrl(url: string): string | null {
  const match = url.match(REVIEW_PAGE_PATH);
  return match ? (match[1] ?? null) : null;
}

/**
 * Returns true when the given Amazon URL matches the same ASIN as the
 * given CompetitorUrl's saved URL — used to find the parent CompetitorUrl
 * for the scrape. Defensive: both must parse to the same ASIN.
 */
export function urlsMatchByAsin(reviewPageUrl: string, savedUrl: string): boolean {
  // Saved URLs may be either product pages (/dp/<ASIN>) or review pages
  // (/product-reviews/<ASIN>); accept both shapes for the match.
  const reviewAsin = extractAsinFromReviewUrl(reviewPageUrl);
  if (!reviewAsin) return false;
  const dpMatch = savedUrl.match(/\/dp\/([A-Z0-9]{10})\b/);
  const savedReviewMatch = savedUrl.match(/\/product-reviews\/([A-Z0-9]{10})\b/);
  const savedAsin = dpMatch?.[1] ?? savedReviewMatch?.[1] ?? null;
  return savedAsin === reviewAsin;
}

// ─── DOM walkers (operate on any Document — current page OR fetched HTML) ─

export interface AmazonReviewRow {
  starRating: number;
  body: string;
  title: string | null;
  reviewerName: string | null;
  reviewDate: string | null; // ISO date string when parseable
  helpfulCount: number | null;
}

/**
 * "5.0 out of 5 stars" → 5. "4.0 out of 5 stars" → 4. Rounds .5 up by
 * Math.round semantics (4.5 → 5, 3.5 → 4). Returns null on parse failure.
 */
export function parseStarRating(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s+out\s+of/i);
  if (!m) return null;
  const n = parseFloat(m[1] ?? '');
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

/**
 * "42 people found this helpful" → 42. "One person found this helpful" → 1.
 * "1,234 people found this helpful" → 1234. Returns null on parse failure
 * (e.g., empty text — Amazon omits the element when count is 0).
 */
export function parseHelpfulCount(text: string): number | null {
  const trimmed = text.trim();
  if (/^one person/i.test(trimmed)) return 1;
  const m = trimmed.match(/^(\d[\d,]*)\s+(?:people|person)/i);
  if (!m) return null;
  const n = parseInt((m[1] ?? '').replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * "Reviewed in the United States on April 12, 2024" → "2024-04-12T00:00:00.000Z".
 * Returns null on parse failure.
 */
export function parseAmazonReviewDate(text: string): string | null {
  const m = text.match(/on\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
  if (!m) return null;
  const d = new Date(m[1] ?? '');
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * Extracts review rows from a parsed Amazon reviews-page Document.
 * Selector shapes per the director-supplied 2026-05-25 spec preserved in the
 * P-49 ROADMAP entry. Defensive: rows missing a star rating OR a body are
 * skipped silently (Amazon occasionally emits decorative placeholders + a
 * partially-rendered top review block in the listing-page strain that
 * doesn't match the review-page strain).
 */
export function extractReviewsFromDocument(doc: Document): AmazonReviewRow[] {
  const reviewEls = Array.from(doc.querySelectorAll('[data-hook="review"]'));
  const rows: AmazonReviewRow[] = [];
  for (const el of reviewEls) {
    const starText =
      el.querySelector('[data-hook="review-star-rating"] .a-icon-alt')?.textContent?.trim() ??
      el.querySelector('[data-hook="cmps-review-star-rating"] .a-icon-alt')?.textContent?.trim() ??
      '';
    const starRating = parseStarRating(starText);
    if (starRating === null) continue;

    const bodyEl =
      el.querySelector('[data-hook="review-body"] span') ??
      el.querySelector('[data-hook="review-body"]');
    const body = bodyEl?.textContent?.trim() ?? '';
    if (!body) continue;

    const titleEl = el.querySelector('[data-hook="review-title"]');
    // Amazon's title element wraps "<span>N.0 out of 5 stars</span> <span>Actual title</span>"
    // when the star rating is rendered inline; the last span typically holds
    // the author-written title. Fall back to the full textContent on shape change.
    let title: string | null = null;
    if (titleEl) {
      const innerSpans = Array.from(titleEl.querySelectorAll('span'));
      const lastMeaningful = innerSpans.find(
        (s) =>
          (s.textContent ?? '').trim().length > 0 &&
          !/out of \d+ stars/i.test(s.textContent ?? ''),
      );
      title = lastMeaningful?.textContent?.trim() ?? titleEl.textContent?.trim() ?? null;
      if (title && title.length === 0) title = null;
    }

    const reviewerName = el.querySelector('.a-profile-name')?.textContent?.trim() || null;

    const dateText = el.querySelector('[data-hook="review-date"]')?.textContent?.trim() ?? '';
    const reviewDate = dateText ? parseAmazonReviewDate(dateText) : null;

    const helpfulText =
      el.querySelector('[data-hook="helpful-vote-statement"]')?.textContent?.trim() ?? '';
    const helpfulCount = helpfulText ? parseHelpfulCount(helpfulText) : null;

    rows.push({ starRating, body, title, reviewerName, reviewDate, helpfulCount });
  }
  return rows;
}

/**
 * Returns the next-page URL from a parsed Amazon reviews-page Document, or
 * null when on the last page (Amazon renders <li class="a-last a-disabled">
 * without an inner <a> on the final page).
 */
export function findNextPageUrl(doc: Document, basePageUrl: string): string | null {
  const link = doc.querySelector('li.a-last:not(.a-disabled) a') as HTMLAnchorElement | null;
  if (!link) return null;
  const href = link.getAttribute('href');
  if (!href) return null;
  try {
    return new URL(href, basePageUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Returns a copy of the rows sorted by helpfulCount desc. Rows with null
 * helpfulCount sort after rows with any non-null count. Equal counts preserve
 * input order (stable sort per the Array.prototype.sort spec).
 *
 * Per §A.2 of REVIEWS_PHASE_2_DESIGN.md: applied per-star within Workstream 2
 * so the database's insertion order (and the future sortRank column) reflects
 * helpful-count-desc per star before write.
 */
export function sortByHelpfulCountDesc(
  rows: readonly AmazonReviewRow[],
): AmazonReviewRow[] {
  // Use a sentinel of -1 so null sorts AFTER any non-negative count. Amazon
  // never reports negative helpful-counts; the null path covers reviews that
  // simply have no helpful-vote-statement block yet.
  return [...rows].sort((a, b) => {
    const ha = a.helpfulCount ?? -1;
    const hb = b.helpfulCount ?? -1;
    return hb - ha;
  });
}

// ─── Customers-say AI-summary block (listing page only) ──────────────────

/**
 * Extracts Amazon's `Customers say` AI-summary block text from a parsed
 * /dp/<ASIN> product listing page Document. Amazon renders this block under
 * `[data-hook="cr-insights-widget"]` (the canonical selector as of session
 * knowledge cutoff; Amazon evolves these selectors so the extractor
 * tolerates a small set of fallbacks).
 *
 * Returns the trimmed text content, or null when the block is missing
 * (Amazon hides the block on products with too few reviews to summarize).
 */
export function extractCustomersSayFromListing(doc: Document): string | null {
  const SELECTORS: readonly string[] = [
    '[data-hook="cr-insights-widget"]',
    '#cr-summarization-attributes',
    '[data-hook="cr-product-insights-block"]',
    '#cr-summary-content',
  ];
  for (const selector of SELECTORS) {
    const el = doc.querySelector(selector);
    if (!el) continue;
    const text = el.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return null;
}

// ─── Scrape orchestration ────────────────────────────────────────────────

export interface AmazonScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured reviews to. */
  competitorUrlId: string;
  /** ASIN parsed from the trigger URL — keyed for cross-star + listing URLs. */
  asin: string;
  /**
   * Per-star cap. The cross-star loop visits up to this many reviews per
   * star rating before moving to the next. Defaults to 200 when null/undefined.
   * Director can override the per-URL default at trigger time via the trigger
   * modal (per §A.4 of REVIEWS_PHASE_2_DESIGN.md).
   */
  capPerStar: number | null;
  /**
   * Optional explicit list of star filters to visit. When omitted, defaults
   * to all 5 star filters in ascending order (one_star → five_star).
   * Exposed for test isolation + future scope tightening (e.g., "scrape only
   * the negative reviews").
   */
  starsToVisit?: readonly AmazonStarFilter[];
  /** Human label for the indicator (e.g., "Amazon reviews — Product X"). */
  scopeLabel: string;
  /**
   * Background-proxy review-save call. Implementations route the call to the
   * existing /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
   * endpoint via the extension's BackgroundRequest pattern (content-scripts
   * can't reach vklf.com directly due to CORS).
   */
  saveReview(input: AmazonScrapeSaveInput): Promise<void>;
}

export interface AmazonScrapeSaveInput {
  clientId: string;
  starRating: number;
  body: string;
  title: string | null;
  reviewerName: string | null;
  reviewDate: string | null;
  helpfulCount: number | null;
  /** Always "amazon" for this module; passed for the denormalized column. */
  platform: 'amazon';
  /**
   * Discriminator marking the row's origin. "extension-scrape" for per-
   * reviewer rows; "extension-scrape:customers-say" for the AI-summary block
   * captured from the /dp/<ASIN> listing page per §A.4 + the Session 2
   * Rule 14f outcome (reuse source column with new value over adding a new
   * `kind` enum; additive, no schema change).
   */
  source: 'extension-scrape' | 'extension-scrape:customers-say';
}

export interface AmazonScrapeResult {
  inserted: number;
  insertedByStar: Partial<Record<AmazonStarFilter, number>>;
  customersSayInserted: boolean;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
}

/**
 * Drives an end-to-end Amazon reviews scrape against the trigger product's
 * ASIN. Opens the Shadow DOM progress indicator, walks each star filter view
 * page-by-page (page 1..N up to capPerStar), helpful-count-sorts each star's
 * captured rows in memory before writing them via saveReview, then fetches
 * the /dp/<ASIN> listing page and persists the `Customers say` block as a
 * dedicated row marked source="extension-scrape:customers-say".
 *
 * Session 1's "scrape current view" mode is no longer exposed at this entry
 * point; the cross-star loop is now the canonical scrape shape per §C.2
 * Session 2 spec.
 */
export async function runAmazonReviewScrape(
  ctx: AmazonScrapeContext,
): Promise<AmazonScrapeResult> {
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
      : AMAZON_STAR_FILTERS;

  const insertedByStar: Partial<Record<AmazonStarFilter, number>> = {};
  let totalInserted = 0;
  let runningAbort: AmazonScrapeResult['abortReason'];
  let runningAbortMessage: string | undefined;
  let customersSayInserted = false;

  try {
    starLoop: for (const filter of starsToVisit) {
      if (controller.signal.aborted) {
        runningAbort = 'user-cancel';
        break;
      }
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
      if (perStarResult.abortReason !== undefined) {
        runningAbort = perStarResult.abortReason;
        runningAbortMessage = perStarResult.abortMessage;
        // Captcha + rate-limit abort the whole scrape (anti-escalation per
        // §A.15); user-cancel + error do too. Don't continue to the next
        // star — that'd compound the bot signal.
        break starLoop;
      }
    }

    // Customers-say capture — only when the per-star loop completed cleanly.
    // Aborts above skip this so we don't keep poking Amazon while
    // captcha/rate-limit is in effect.
    if (runningAbort === undefined && !controller.signal.aborted) {
      try {
        customersSayInserted = await scrapeCustomersSayBlock({
          ctx,
          controller,
          totalInsertedSoFar: totalInserted,
          onProgress,
        });
        if (customersSayInserted) totalInserted += 1;
      } catch (err) {
        // Customers-say failure is informational, not fatal. The per-star
        // captures already landed; the listing-page block is a bonus. Log
        // + continue.
        console.warn('[PLOS] Customers-say block capture failed:', err);
      }
    }

    if (runningAbort === undefined) {
      onProgress({ kind: 'completed', totalRowsCaptured: totalInserted });
    }

    return {
      inserted: totalInserted,
      insertedByStar,
      customersSayInserted,
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
      customersSayInserted,
      abortReason: 'error',
      abortMessage: err instanceof Error ? err.message : 'Unexpected error',
    };
  }
}

interface ScrapeOneStarOptions {
  ctx: AmazonScrapeContext;
  filter: AmazonStarFilter;
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
  abortReason?: AmazonScrapeResult['abortReason'];
  abortMessage?: string;
}

/**
 * Walks the per-star Amazon reviews page-by-page, buffering rows in memory
 * for the star, sorting by helpfulCount desc once paginate() finishes (or
 * the cap is hit), then writing the sorted rows via saveReview in helpful-
 * count-desc order so the DB's insertion order reflects the W4 sortRank
 * preference per §A.5.
 *
 * Pages 1..N are all fetched via fetch+DOMParser per the Session 1 Pattern;
 * no reliance on the live document — the cross-star loop is driven entirely
 * off the trigger ASIN. This keeps the content-script alive across N stars
 * × M pages without any live-tab navigation.
 */
async function scrapeOneStar(
  opts: ScrapeOneStarOptions,
): Promise<ScrapeOneStarResult> {
  const { ctx, filter, capPerStar, controller, onProgress, startingRowOffset } =
    opts;
  const starRating = starRatingForFilter(filter);

  let currentDoc: Document | null = null;
  let currentPageUrl = buildAmazonStarFilterUrl(ctx.asin, filter, 1);
  let isFirstPage = true;

  const buffer: AmazonReviewRow[] = [];

  // Wrap the parent onProgress so 'page-loaded' + 'row-saved' events report
  // cumulative totals across the whole cross-star scrape, not per-star.
  const wrappedOnProgress: ScrapeProgressListener = (event) => {
    if (event.kind === 'page-loaded' || event.kind === 'row-saved') {
      onProgress({
        ...event,
        totalRowsCaptured: startingRowOffset + event.totalRowsCaptured,
      });
    } else if (event.kind === 'aborted' || event.kind === 'completed') {
      // Suppress per-star 'completed' + 'aborted' — the parent emits them
      // once the cross-star loop reaches its own conclusion.
      // No-op.
    } else {
      onProgress(event);
    }
  };

  const result = await paginate<AmazonReviewRow>({
    onProgress: wrappedOnProgress,
    abortSignal: controller.signal,
    captchaSelectors: [...AMAZON_CAPTCHA_SELECTORS],
    capRows: capPerStar,
    extractCurrentPageRows: () => {
      if (!currentDoc) return [];
      return extractReviewsFromDocument(currentDoc);
    },
    advanceToNextPage: async () => {
      // Page 1 fetches the per-star page directly; subsequent pages follow
      // the rendered Next link from the just-fetched doc. Returning true on
      // page 1 means paginate() will call extractCurrentPageRows again,
      // which will see the freshly populated currentDoc.
      let nextUrl: string;
      if (isFirstPage) {
        nextUrl = currentPageUrl;
        isFirstPage = false;
      } else {
        if (!currentDoc) return false;
        const next = findNextPageUrl(currentDoc, currentPageUrl);
        if (!next) return false;
        nextUrl = next;
      }
      const resp = await fetch(nextUrl, {
        credentials: 'include',
        headers: { Accept: 'text/html' },
        signal: controller.signal,
      });
      if (!resp.ok) {
        const err = new Error(
          `Amazon per-star fetch returned ${String(resp.status)} for ${filter}`,
        ) as Error & { status: number };
        err.status = resp.status;
        throw err;
      }
      const html = await resp.text();
      const parser = new DOMParser();
      currentDoc = parser.parseFromString(html, 'text/html');
      currentPageUrl = nextUrl;
      return true;
    },
    saveRow: async (row) => {
      // Buffer rather than save — sort comes after the full per-star walk so
      // the in-DB order reflects helpful-count-desc within star per §A.5.
      buffer.push(row);
    },
  });

  // Sort the per-star buffer by helpfulCount desc, then persist sequentially.
  // If the loop aborted mid-buffer (e.g., captcha caught on page 3), still
  // persist whatever we already buffered so partial progress isn't lost.
  const sorted = sortByHelpfulCountDesc(buffer);
  let saved = 0;
  for (const row of sorted) {
    if (controller.signal.aborted) break;
    try {
      await ctx.saveReview({
        clientId: makeClientId(),
        starRating: row.starRating || starRating,
        body: row.body,
        title: row.title,
        reviewerName: row.reviewerName,
        reviewDate: row.reviewDate,
        helpfulCount: row.helpfulCount,
        platform: 'amazon',
        source: 'extension-scrape',
      });
      saved += 1;
    } catch (err) {
      // A save failure mid-buffer aborts the rest of this star. The total
      // count + abort reason propagate up to the cross-star caller.
      const reason = classifySaveError(err);
      return {
        inserted: saved,
        abortReason: reason,
        abortMessage: err instanceof Error ? err.message : undefined,
      };
    }
  }

  return {
    inserted: saved,
    abortReason: result.abortReason,
    abortMessage: result.abortMessage,
  };
}

interface ScrapeCustomersSayOptions {
  ctx: AmazonScrapeContext;
  controller: AbortController;
  totalInsertedSoFar: number;
  onProgress: ScrapeProgressListener;
}

/**
 * Fetches the product listing page /dp/<ASIN> and extracts the `Customers
 * say` AI-summary block. Persists as a dedicated CapturedReview row with
 * source="extension-scrape:customers-say" + starRating=5 (Rule 14f outcome:
 * Amazon's Customers-say block is overwhelmingly the AI's positive-tilt
 * summary of all reviews; the 5-star sentinel is the least-misleading fit
 * given the starRating-must-be-1-to-5 wire constraint, and W4 surfaces will
 * filter on source to render it specially).
 *
 * Returns true when the block was found + saved; false when the block was
 * missing from the listing page (Amazon hides it for low-review products).
 * Throws on fetch/network errors; the caller treats those as informational.
 */
async function scrapeCustomersSayBlock(
  opts: ScrapeCustomersSayOptions,
): Promise<boolean> {
  const { ctx, controller, totalInsertedSoFar, onProgress } = opts;
  const listingUrl = buildAmazonProductListingUrl(ctx.asin);
  onProgress({
    kind: 'page-loading',
    pageIndex: 9999, // signals "listing page" rather than per-star pagination
  });
  const resp = await fetch(listingUrl, {
    credentials: 'include',
    headers: { Accept: 'text/html' },
    signal: controller.signal,
  });
  if (!resp.ok) {
    return false;
  }
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = extractCustomersSayFromListing(doc);
  if (!text) return false;
  await ctx.saveReview({
    clientId: makeClientId(),
    // 5-star sentinel per the Session 2 Rule 14f outcome — Amazon's Customers-
    // say block is overall positive sentiment AI-summary; W4 filters on
    // source to render this specially rather than as a 5-star user review.
    starRating: 5,
    body: text,
    title: 'Customers say',
    reviewerName: null,
    reviewDate: null,
    helpfulCount: null,
    platform: 'amazon',
    source: 'extension-scrape:customers-say',
  });
  onProgress({
    kind: 'row-saved',
    totalRowsCaptured: totalInsertedSoFar + 1,
  });
  return true;
}

function classifySaveError(err: unknown): AmazonScrapeResult['abortReason'] {
  if (typeof err === 'object' && err !== null) {
    const e = err as { status?: unknown; name?: unknown };
    if (typeof e.status === 'number' && (e.status === 429 || e.status === 503)) {
      return 'rate-limit';
    }
    if (e.name === 'AbortError') return 'user-cancel';
  }
  return 'error';
}

function makeClientId(): string {
  // crypto.randomUUID is widely available in Chrome 92+. The extension's
  // minimum-Chrome is later than that per the manifest v3 baseline.
  return crypto.randomUUID();
}
