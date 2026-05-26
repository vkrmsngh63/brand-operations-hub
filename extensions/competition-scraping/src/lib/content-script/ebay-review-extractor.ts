// eBay per-platform review extractor shipped under P-49 Workstream 2 eBay
// sub-cluster Session 1 (2026-05-30) per docs/REVIEWS_PHASE_2_DESIGN.md §C.2
// + §A.2 priority order.
//
// Architecture mirrors amazon-review-extractor.ts with two eBay-specific
// adaptations per the director-supplied 2026-05-25 verbatim spec preserved
// in the P-49 ROADMAP entry:
//
//   1. eBay feedback (received as seller) has no per-star granularity — only
//      Positive / Neutral / Negative ratings. Director chose to capture
//      Neutral + Negative only (Positive feedback on eBay is overwhelmingly
//      canned "good seller" comments — low competitive-intel signal). Mapping
//      is mechanical: Neutral → 3-star, Negative → 1-star.
//
//   2. The feedback URL takes BOTH an item_id AND a seller username:
//        https://www.ebay.com/fdbk/mweb_profile?fdbkType=FeedbackReceivedAsSeller
//                                              &item_id=<ID>&username=<SELLER>
//                                              &overall_rating_item=NEUTRAL
//      Director saves the LISTING URL (/itm/<ID>) which exposes the item_id
//      but NOT the seller. The orchestrator fetches the listing page on
//      demand to resolve seller via extractSellerFromListingDocument().
//
// Reuses the W2 Amazon Patterns from the 2026-05-28 deploy session:
//   • FF#1 symmetric helpers (isEbayItemPage + isEbayFeedbackPage +
//     isEbayScrapableUrl + extractItemIdFromXxxUrl trio + urlsMatchByItemId)
//   • FF#4 URL-construction-based pagination (buildEbayFeedbackUrl drives the
//     pagination loop; `_pgn=N` URL parameter incremented directly rather
//     than scraping next-page links which evolve)
//   • Session 2 cross-filter loop structure (NEUTRAL → NEGATIVE in sequence;
//     anti-bot abort on captcha + rate-limit per §A.15)
//   • Shadow DOM trigger modal with per-URL cap override (reused as-is;
//     selectableStars=[1, 3] passed at orchestration time)

import {
  paginate,
  type ScrapeProgressListener,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

// FF#4 2026-05-30 — TEMPORARY DIAGNOSTIC INSTRUMENTATION (remove in FF#5
// after director uploads the dumped HTML files + I write proper selectors
// based on actual eBay DOM evidence). 3 speculative FFs (FF#1+#2 bundled,
// FF#3 standalone) burned through without empirical access; per the
// 2026-05-25 P-48 Session 2 antipattern Pattern + director's explicit
// 2026-05-30 picker outcome, stop guessing + gather empirical evidence.
//
// What this instrumentation does:
//   1. After each eBay fetch (listing page in orchestrator.ts AND feedback
//      page 1 here), save the response HTML to director's Downloads folder
//      via a programmatic <a download> click. Files named
//      `plos-debug-ebay-<scope>-<key>.html`.
//   2. Console.log a structured row-count breakdown per selector probe,
//      to surface which selectors match against the real DOM + how many.
// Director re-runs scrape → uploads HTML files from Downloads → I write
// FF#5 with proper selectors + (likely) a different fetch strategy.
export function downloadHtmlForDiagnostic(
  filename: string,
  html: string,
): void {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore — best-effort cleanup
      }
    }, 1000);
  } catch (err) {
    console.error('[PLOS DEBUG] HTML download failed:', err);
  }
}

const EBAY_URL_PREFIX = /^https?:\/\/(www\.)?ebay\.com\//;
const ITEM_PAGE_PATH = /\/itm\/(\d+)\b/;
const FEEDBACK_PAGE_PATH = /\/fdbk\/mweb_profile\b/;

const DEFAULT_CAP_PER_FILTER = 200;

// eBay's feedback page accepts these 2 filter values for the
// overall_rating_item query parameter. Per director's verbatim 2026-05-25
// spec preserved in the P-49 ROADMAP entry: capture Neutral + Negative only;
// Positive feedback is excluded by design (eBay's positive feedback is
// overwhelmingly canned "good seller" — low competitive-intel value).
export const EBAY_FEEDBACK_FILTERS = ['NEUTRAL', 'NEGATIVE'] as const;
export type EbayFeedbackFilter = (typeof EBAY_FEEDBACK_FILTERS)[number];

/**
 * Returns the synthetic star rating for an eBay feedback filter. Per
 * director's verbatim 2026-05-25 spec: Neutral → 3-star + Negative → 1-star
 * (eBay doesn't have per-star granular feedback; the star mapping makes
 * eBay rows interoperable with the Amazon star-bucketed UI surfaces in W4).
 */
export function starRatingForFeedbackFilter(filter: EbayFeedbackFilter): number {
  return filter === 'NEUTRAL' ? 3 : 1;
}

/**
 * Inverse of starRatingForFeedbackFilter — returns the EbayFeedbackFilter for
 * an integer star rating (3 → NEUTRAL, 1 → NEGATIVE), or null for ratings
 * outside the supported eBay mapping. Used by the orchestrator to translate
 * the trigger modal's selectedStars: number[] into the cross-filter loop's
 * filtersToVisit per the Amazon FF#2 Pattern.
 */
export function feedbackFilterForStarRating(
  rating: number,
): EbayFeedbackFilter | null {
  if (rating === 3) return 'NEUTRAL';
  if (rating === 1) return 'NEGATIVE';
  return null;
}

/**
 * Returns the canonical eBay seller-feedback URL for the given item_id +
 * seller username + filter + page number, narrowed to "This Item" view via
 * the full `_item`-suffixed parameter set eBay's UI uses when the "This
 * Item" tab is active.
 *
 * Param shape per the director-supplied 2026-05-30 working URL captured at
 * Phase 4 verification:
 *   fdbkType=FeedbackReceivedAsSeller
 *   item_id=<id>
 *   username=<seller>
 *   q=<itemId>
 *   filter=feedback_page:RECEIVED_AS_SELLER
 *   page_id_item=<page>          ← pagination cursor (NOT _pgn)
 *   overall_rating_item=<filter>  ← rating filter (NEUTRAL | NEGATIVE)
 *   sort_item=RELEVANCEV2
 *   filter_image_item=false
 *   filter_video_item=false
 *   filter_automated_feedback_item=true  ← drops eBay-generated automated rows
 *   filter_topic_item=
 *
 * Fix-forward history:
 *   FF#2 2026-05-30 — added q + filter params; insufficient on its own
 *     because pagination was still using legacy `_pgn=N` which falls out
 *     of "This Item" view.
 *   FF#3 2026-05-30 — full `_item`-suffixed param adoption. Director's
 *     screenshot confirmed "This Item" tab is the default when these
 *     params are present; without them eBay falls back to All Items.
 */
export function buildEbayFeedbackUrl(
  itemId: string,
  seller: string,
  filter: EbayFeedbackFilter,
  pageNumber = 1,
): string {
  const params = new URLSearchParams({
    fdbkType: 'FeedbackReceivedAsSeller',
    item_id: itemId,
    username: seller,
    q: itemId,
    filter: 'feedback_page:RECEIVED_AS_SELLER',
    // FF#3 2026-05-30 — `_item`-suffixed param set keeps the URL in
    // "This Item" view across pagination + rating filters. eBay's UI
    // emits all of these when director clicks the "This Item" tab +
    // the rating filter chips; without them the server-rendered HTML
    // falls back to the All Items default.
    page_id_item: String(pageNumber),
    overall_rating_item: filter,
    sort_item: 'RELEVANCEV2',
    filter_image_item: 'false',
    filter_video_item: 'false',
    filter_automated_feedback_item: 'true',
    filter_topic_item: '',
  });
  return `https://www.ebay.com/fdbk/mweb_profile?${params.toString()}`;
}

/**
 * Returns the canonical eBay item listing page URL for the given item_id.
 * The listing page is where extractSellerFromListingDocument() resolves the
 * seller username when the orchestrator dispatches from /itm/<ID> rather
 * than /fdbk/.
 */
export function buildEbayListingUrl(itemId: string): string {
  return `https://www.ebay.com/itm/${itemId}`;
}

/** Returns true when the given URL is a recognized eBay item listing page. */
export function isEbayItemPage(url: string): boolean {
  return EBAY_URL_PREFIX.test(url) && ITEM_PAGE_PATH.test(url);
}

/** Returns true when the given URL is a recognized eBay seller-feedback page. */
export function isEbayFeedbackPage(url: string): boolean {
  return EBAY_URL_PREFIX.test(url) && FEEDBACK_PAGE_PATH.test(url);
}

/**
 * Returns true when the given URL is any eBay page the scrape can dispatch
 * from — either the item listing page (`/itm/<ID>`) OR the seller-feedback
 * page (`/fdbk/mweb_profile?...`). Mirrors the Amazon FF#1 symmetric helper
 * Pattern from the 2026-05-28 deploy session.
 */
export function isEbayScrapableUrl(url: string): boolean {
  return isEbayItemPage(url) || isEbayFeedbackPage(url);
}

/**
 * Returns the item_id from an eBay item listing URL (`/itm/<ID>`), or null
 * when the URL isn't a recognized listing shape.
 */
export function extractItemIdFromItemUrl(url: string): string | null {
  const match = url.match(ITEM_PAGE_PATH);
  return match ? (match[1] ?? null) : null;
}

/**
 * Returns the item_id from an eBay feedback URL (`/fdbk/mweb_profile?...&item_id=<ID>`),
 * or null when the URL isn't a recognized feedback shape or the item_id
 * parameter is missing.
 */
export function extractItemIdFromFeedbackUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!FEEDBACK_PAGE_PATH.test(u.pathname)) return null;
    const id = u.searchParams.get('item_id');
    return id && /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/**
 * Returns the item_id from any eBay URL exposing one — tries the listing
 * shape first, then the feedback shape. Returns null when neither matches.
 */
export function extractItemIdFromEbayUrl(url: string): string | null {
  return extractItemIdFromItemUrl(url) ?? extractItemIdFromFeedbackUrl(url);
}

/**
 * Returns the seller username from an eBay feedback URL's `username` query
 * parameter, or null when missing or the URL isn't a recognized feedback
 * shape. Used when the orchestrator dispatches from a feedback URL directly
 * (skips the listing-page fetch).
 */
export function extractSellerFromFeedbackUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!FEEDBACK_PAGE_PATH.test(u.pathname)) return null;
    const user = u.searchParams.get('username');
    return user && user.length > 0 ? user : null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the given eBay URL matches the same item_id as the
 * given saved CompetitorUrl's URL. Both URLs may be in either /itm/ or
 * /fdbk/ shape; the match is item_id-based and shape-agnostic. Mirrors the
 * Amazon urlsMatchByAsin Pattern (FF#1 2026-05-28).
 */
export function urlsMatchByItemId(pageUrl: string, savedUrl: string): boolean {
  const pageId = extractItemIdFromEbayUrl(pageUrl);
  if (!pageId) return false;
  const savedId = extractItemIdFromEbayUrl(savedUrl);
  return savedId === pageId;
}

// ─── DOM walkers (operate on any Document — current page OR fetched HTML) ─

export interface EbayFeedbackRow {
  body: string;
  reviewerName: string | null;
  reviewDate: string | null;
}

/**
 * Extracts feedback rows from a parsed eBay seller-feedback page Document.
 * Selectors per the director-supplied 2026-05-25 spec preserved in the P-49
 * ROADMAP entry — body-only capture (no helpful-count, no star — the star
 * comes from the filter being walked).
 *
 * Defensive: rows missing a body are skipped. eBay's feedback DOM evolves;
 * the extractor probes a small set of selector fallbacks for each field.
 */
export function extractFeedbackFromDocument(doc: Document): EbayFeedbackRow[] {
  const ROW_SELECTORS: readonly string[] = [
    '.fdbk-container__details',
    'li.feedback-list-table-row',
    '[data-test-id*="feedback-item"]',
  ];
  let rowEls: Element[] = [];
  for (const sel of ROW_SELECTORS) {
    rowEls = Array.from(doc.querySelectorAll(sel));
    if (rowEls.length > 0) break;
  }

  const rows: EbayFeedbackRow[] = [];
  for (const el of rowEls) {
    const body = extractFeedbackBody(el);
    if (!body) continue;
    const reviewerName = extractFeedbackUser(el);
    const reviewDate = extractFeedbackDate(el);
    rows.push({ body, reviewerName, reviewDate });
  }
  return rows;
}

/**
 * Extracts the comment text from a single feedback row element. Tries the
 * canonical selector first, then a small set of fallbacks. Returns the
 * trimmed text, or empty string when no selector matches.
 */
export function extractFeedbackBody(rowEl: Element): string {
  const SELECTORS: readonly string[] = [
    '.fdbk-container__details__comment',
    '.feedback-comment-text',
    '[data-test-id*="feedback-comment"]',
  ];
  for (const sel of SELECTORS) {
    const bodyEl = rowEl.querySelector(sel);
    const text = bodyEl?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return '';
}

/**
 * Extracts the buyer (reviewer) username from a single feedback row element.
 * eBay anonymizes most usernames as e.g. "b***r"; we preserve whatever's
 * rendered. Returns null when no selector matches.
 */
export function extractFeedbackUser(rowEl: Element): string | null {
  const SELECTORS: readonly string[] = [
    '.fdbk-container__details__user',
    '.feedback-user',
    '[data-test-id*="feedback-user"]',
  ];
  for (const sel of SELECTORS) {
    const userEl = rowEl.querySelector(sel);
    const text = userEl?.textContent?.trim() ?? '';
    if (text.length > 0) return text;
  }
  return null;
}

/**
 * Extracts the feedback date as ISO 8601 (YYYY-MM-DD…) from a single
 * feedback row. eBay renders dates in a few shapes — "Past month", "Apr 12,
 * 2024", "Apr-12-24". Returns the raw rendered text when parseable as a
 * Date; otherwise the raw text itself; otherwise null. The downstream UI
 * displays this as a date string so a string fallback is acceptable.
 */
export function extractFeedbackDate(rowEl: Element): string | null {
  const SELECTORS: readonly string[] = [
    '.fdbk-container__details__date',
    '.feedback-date',
    '[data-test-id*="feedback-date"]',
  ];
  for (const sel of SELECTORS) {
    const dateEl = rowEl.querySelector(sel);
    const text = dateEl?.textContent?.trim() ?? '';
    if (text.length === 0) continue;
    const iso = parseEbayFeedbackDate(text);
    return iso ?? text;
  }
  return null;
}

/**
 * Attempts to parse an eBay feedback date string into an ISO 8601 timestamp.
 * Returns null on parse failure — caller falls back to the raw rendered
 * text per extractFeedbackDate's contract.
 */
export function parseEbayFeedbackDate(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  // Relative dates like "Past month" / "Past 6 months" — eBay doesn't expose
  // an absolute timestamp for these. Caller falls back to the raw text.
  if (/^past\s/i.test(trimmed)) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// ─── Seller extraction (listing-page DOM) ────────────────────────────────

/**
 * Extracts the seller username from a parsed eBay item listing page
 * Document. eBay listing pages expose the seller via a link to
 * `https://www.ebay.com/usr/<username>` — we probe the seller card area
 * first, then fall back to any /usr/ link in the document.
 *
 * Returns the username, or null when no /usr/ link is found.
 *
 * Used by the orchestrator when the trigger fires from a /itm/<ID> page
 * (the saved CompetitorUrl shape per A.2). The orchestrator fetches the
 * listing page via fetch() + DOMParser and passes the resulting Document
 * here — same fetch+DOMParser Pattern as the Amazon Customers-say capture.
 */
export function extractSellerFromListingDocument(doc: Document): string | null {
  const SCOPED_SELECTORS: readonly string[] = [
    '[data-testid="x-sellercard-atf"] a[href*="/usr/"]',
    '.x-sellercard-atf__info a[href*="/usr/"]',
    '.ux-textspans a[href*="/usr/"]',
  ];
  for (const sel of SCOPED_SELECTORS) {
    const link = doc.querySelector(sel);
    const seller = sellerFromUsrHref(link);
    if (seller) return seller;
  }
  // Fall back to any /usr/ link in the document.
  const anyLinks = Array.from(doc.querySelectorAll('a[href*="/usr/"]'));
  for (const link of anyLinks) {
    const seller = sellerFromUsrHref(link);
    if (seller) return seller;
  }
  return null;
}

function sellerFromUsrHref(link: Element | null): string | null {
  if (!link) return null;
  const href = link.getAttribute('href');
  if (!href) return null;
  const match = href.match(/\/usr\/([^/?#]+)/);
  if (!match) return null;
  const raw = match[1];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// ─── Scrape orchestration ────────────────────────────────────────────────

export interface EbayScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured feedback to. */
  competitorUrlId: string;
  /** Item ID parsed from the trigger URL — keyed for the cross-filter loop. */
  itemId: string;
  /**
   * Seller username — required to build the feedback URL. Resolved by the
   * orchestrator either from the trigger URL's `username` param (when on a
   * /fdbk/ page) or via fetching the /itm/<ID> listing page and running
   * extractSellerFromListingDocument().
   */
  seller: string;
  /**
   * Per-filter cap. The cross-filter loop visits up to this many rows per
   * filter (NEUTRAL + NEGATIVE) before moving to the next. Defaults to 200
   * when null/undefined. Director can override the per-URL default at
   * trigger time via the trigger modal (per §A.4 of REVIEWS_PHASE_2_DESIGN.md).
   */
  capPerFilter: number | null;
  /**
   * Optional explicit list of feedback filters to visit. When omitted,
   * defaults to both filters in canonical order (NEUTRAL → NEGATIVE).
   * Exposed for test isolation + trigger-modal-driven scope tightening
   * ("just scrape negatives this run").
   */
  filtersToVisit?: readonly EbayFeedbackFilter[];
  /** Human label for the indicator (e.g., "eBay feedback — Product X"). */
  scopeLabel: string;
  /**
   * Background-proxy review-save call. Implementations route the call to the
   * existing /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
   * endpoint via the extension's BackgroundRequest pattern (content-scripts
   * can't reach vklf.com directly due to CORS).
   */
  saveReview(input: EbayScrapeSaveInput): Promise<void>;
}

export interface EbayScrapeSaveInput {
  clientId: string;
  /** Mapped from filter — 3 for NEUTRAL, 1 for NEGATIVE. */
  starRating: number;
  body: string;
  /** Always null for eBay — feedback rows don't carry titles. */
  title: null;
  reviewerName: string | null;
  reviewDate: string | null;
  /** Always null for eBay — no helpful-count signal exposed by eBay. */
  helpfulCount: null;
  /** Always "ebay" for this module; passed for the denormalized column. */
  platform: 'ebay';
  /** Discriminator — always "extension-scrape" for eBay per-reviewer rows. */
  source: 'extension-scrape';
}

export interface EbayScrapeResult {
  inserted: number;
  insertedByFilter: Partial<Record<EbayFeedbackFilter, number>>;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
}

/**
 * Drives an end-to-end eBay seller-feedback scrape against the trigger item's
 * item_id + seller. Opens the Shadow DOM progress indicator, walks each
 * filter (NEUTRAL → NEGATIVE by default) page-by-page (page 1..N up to
 * capPerFilter), and persists each row via saveReview with the synthetic
 * starRating from the filter mapping.
 *
 * Mirrors runAmazonReviewScrape's cross-filter loop structure (Session 2
 * 2026-05-27 Pattern) but at 2 filters instead of 5 and without the helpful-
 * count sort step (eBay doesn't expose helpful-count).
 */
export async function runEbayReviewScrape(
  ctx: EbayScrapeContext,
): Promise<EbayScrapeResult> {
  const controller = new AbortController();
  const indicator = openScrapeProgressIndicator({
    scopeLabel: ctx.scopeLabel,
    onCancel: () => controller.abort(),
  });
  const onProgress: ScrapeProgressListener = (event) => indicator.update(event);

  const capPerFilter =
    ctx.capPerFilter && ctx.capPerFilter > 0
      ? ctx.capPerFilter
      : DEFAULT_CAP_PER_FILTER;
  const filtersToVisit =
    ctx.filtersToVisit && ctx.filtersToVisit.length > 0
      ? ctx.filtersToVisit
      : EBAY_FEEDBACK_FILTERS;

  const insertedByFilter: Partial<Record<EbayFeedbackFilter, number>> = {};
  let totalInserted = 0;
  let runningAbort: EbayScrapeResult['abortReason'];
  let runningAbortMessage: string | undefined;

  try {
    filterLoop: for (const filter of filtersToVisit) {
      if (controller.signal.aborted) {
        runningAbort = 'user-cancel';
        break;
      }
      const starRating = starRatingForFeedbackFilter(filter);
      onProgress({ kind: 'star-started', starRating });
      const perFilterResult = await scrapeOneFilter({
        ctx,
        filter,
        capPerFilter,
        controller,
        onProgress,
        startingRowOffset: totalInserted,
      });
      insertedByFilter[filter] = perFilterResult.inserted;
      totalInserted += perFilterResult.inserted;
      onProgress({
        kind: 'star-completed',
        starRating,
        rowsForStar: perFilterResult.inserted,
        totalRowsCaptured: totalInserted,
      });
      if (perFilterResult.abortReason !== undefined) {
        runningAbort = perFilterResult.abortReason;
        runningAbortMessage = perFilterResult.abortMessage;
        // Per §A.15 anti-escalation: captcha + rate-limit + user-cancel +
        // error all abort the whole scrape. Don't continue to the next
        // filter — that'd compound the bot signal.
        break filterLoop;
      }
    }

    if (runningAbort === undefined) {
      onProgress({ kind: 'completed', totalRowsCaptured: totalInserted });
    }

    return {
      inserted: totalInserted,
      insertedByFilter,
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
      insertedByFilter,
      abortReason: 'error',
      abortMessage: err instanceof Error ? err.message : 'Unexpected error',
    };
  }
}

interface ScrapeOneFilterOptions {
  ctx: EbayScrapeContext;
  filter: EbayFeedbackFilter;
  capPerFilter: number;
  controller: AbortController;
  onProgress: ScrapeProgressListener;
  /**
   * Running total of rows captured by previous filters in this same scrape.
   * The progress indicator surfaces cumulative counts so director sees a
   * single growing number rather than per-filter counts that reset.
   */
  startingRowOffset: number;
}

interface ScrapeOneFilterResult {
  inserted: number;
  abortReason?: EbayScrapeResult['abortReason'];
  abortMessage?: string;
}

/**
 * Walks the per-filter eBay feedback URL page-by-page via fetch() +
 * DOMParser, persisting each row in document order (no helpful-count sort
 * — eBay doesn't expose helpful-count). Stop signal = fetched page renders
 * 0 feedback rows (FF#4 Pattern from the 2026-05-28 Amazon deploy).
 */
async function scrapeOneFilter(
  opts: ScrapeOneFilterOptions,
): Promise<ScrapeOneFilterResult> {
  const {
    ctx,
    filter,
    capPerFilter,
    controller,
    onProgress,
    startingRowOffset,
  } = opts;
  const starRating = starRatingForFeedbackFilter(filter);

  let currentDoc: Document | null = null;
  let currentPageNumber = 1;
  let isFirstPage = true;

  // Cumulative-totals wrapper — page-loaded + row-saved events surface
  // session-wide totals across the cross-filter scrape, not per-filter.
  // Filter context lets the indicator render "3★ — page 2…" rather than
  // bare "page 2".
  const filterContext = `${String(starRating)}★`;
  const wrappedOnProgress: ScrapeProgressListener = (event) => {
    if (event.kind === 'page-loaded') {
      onProgress({
        ...event,
        starContext: filterContext,
        totalRowsCaptured: startingRowOffset + event.totalRowsCaptured,
      });
    } else if (event.kind === 'row-saved') {
      onProgress({
        ...event,
        totalRowsCaptured: startingRowOffset + event.totalRowsCaptured,
      });
    } else if (event.kind === 'page-loading') {
      onProgress({ ...event, starContext: filterContext });
    } else if (event.kind === 'aborted' || event.kind === 'completed') {
      // Per-filter completed + aborted suppressed — the parent emits them
      // once the cross-filter loop reaches its own conclusion.
      // No-op.
    } else {
      onProgress(event);
    }
  };

  const result = await paginate<EbayFeedbackRow>({
    onProgress: wrappedOnProgress,
    abortSignal: controller.signal,
    // eBay-specific captcha selectors — eBay serves a "Please verify you're
    // a person" page with a #captcha-image div or hCaptcha widget. The
    // generic CAPTCHA selectors merged in by paginate() catch hCaptcha;
    // we add eBay's own affordances here.
    captchaSelectors: [
      '#captcha-image',
      'form[action*="ebay.com/sec/captcha"]',
      'img[src*="captcha"]',
    ],
    capRows: capPerFilter,
    extractCurrentPageRows: () => {
      if (!currentDoc) return [];
      return extractFeedbackFromDocument(currentDoc);
    },
    advanceToNextPage: async () => {
      // FF#4 Pattern: build pagination URL directly via buildEbayFeedbackUrl.
      // `_pgn` is a stable eBay parameter; works regardless of whether eBay
      // currently renders numbered links, "Show more" buttons, or AJAX
      // load-more affordances. Stop signal = the just-fetched page returns
      // 0 feedback rows.
      let nextPageNumber: number;
      if (isFirstPage) {
        nextPageNumber = 1;
        isFirstPage = false;
      } else {
        nextPageNumber = currentPageNumber + 1;
      }
      const nextUrl = buildEbayFeedbackUrl(
        ctx.itemId,
        ctx.seller,
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
          `eBay per-filter fetch returned ${String(resp.status)} for ${filter}`,
        ) as Error & { status: number };
        err.status = resp.status;
        throw err;
      }
      const html = await resp.text();
      const parser = new DOMParser();
      currentDoc = parser.parseFromString(html, 'text/html');
      currentPageNumber = nextPageNumber;
      // FF#4 diagnostic — dump page 1 HTML + log selector match counts so
      // I can analyze the actual eBay DOM in FF#5.
      if (nextPageNumber === 1) {
        downloadHtmlForDiagnostic(
          `plos-debug-ebay-feedback-${filter}-page1.html`,
          html,
        );
        const probe = (sel: string): number => {
          try {
            return currentDoc?.querySelectorAll(sel).length ?? 0;
          } catch {
            return -1;
          }
        };
        console.log('[PLOS DEBUG] eBay feedback page 1', {
          filter,
          url: nextUrl,
          httpStatus: resp.status,
          htmlLength: html.length,
          rowsBy_fdbkContainerDetails: probe('.fdbk-container__details'),
          rowsBy_feedbackListTableRow: probe('li.feedback-list-table-row'),
          rowsBy_dataTestIdFeedbackItem: probe(
            '[data-test-id*="feedback-item"]',
          ),
          // Probe modern eBay UI candidate selectors based on the 2026-05-30
          // screenshot (Verified-purchase badge per row + star icon per row).
          rowsBy_dataTestIdContainsFeedback: probe('[data-testid*="feedback"]'),
          rowsBy_articleRole: probe('[role="article"]'),
          rowsBy_listItem: probe('li'),
          // "This Item" tab counter (the screenshot showed "This item (117)").
          thisItemTabPresent: probe('button[aria-selected="true"]'),
          allItemsTabPresent: probe('button[aria-selected="false"]'),
          // First 800 chars to spot-check what eBay's server returned.
          htmlSampleFirst800: html.substring(0, 800),
        });
      }
      const rowsOnPage = extractFeedbackFromDocument(currentDoc).length;
      if (rowsOnPage === 0) return false;
      return true;
    },
    saveRow: async (row) => {
      // Save immediately — eBay doesn't have helpful-count so there's no
      // per-filter buffer + sort step (unlike Amazon's per-star sort by
      // helpful-count before save).
      try {
        await ctx.saveReview({
          clientId: makeClientId(),
          starRating,
          body: row.body,
          title: null,
          reviewerName: row.reviewerName,
          reviewDate: row.reviewDate,
          helpfulCount: null,
          platform: 'ebay',
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
