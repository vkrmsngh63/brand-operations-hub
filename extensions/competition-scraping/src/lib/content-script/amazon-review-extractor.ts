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
// Session 1 scope: scrape from director's current filter view (whatever
// filterByStar / pageNumber director is on). The cross-star loop (visit each
// of 5 filterByStar values + scrape up to cap per star) is deferred to W2
// Amazon Session 2 since it requires either (a) tab navigation that breaks
// the running content-script or (b) iframe-based virtual navigation which
// is its own design call. For Session 1, "200 reviews total from the current
// view" is the cap.

import {
  AMAZON_CAPTCHA_SELECTORS,
  paginate,
  type ScrapeProgress,
} from './scrape-pagination.ts';
import { openScrapeProgressIndicator } from './scrape-progress-indicator.ts';

const AMAZON_URL_PREFIX = /^https?:\/\/(www\.)?amazon\.com\//;
const REVIEW_PAGE_PATH = /\/product-reviews\/([A-Z0-9]{10})\b/;

const DEFAULT_CAP = 200;

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

// ─── Scrape orchestration ────────────────────────────────────────────────

export interface AmazonScrapeContext {
  /** Project we're scraping into. */
  projectId: string;
  /** Parent CompetitorUrl id to attach captured reviews to. */
  competitorUrlId: string;
  /** Per-URL cap (defaults to 200 when null). */
  cap: number | null;
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
}

export interface AmazonScrapeResult {
  inserted: number;
  abortReason?: 'captcha' | 'rate-limit' | 'user-cancel' | 'error';
  abortMessage?: string;
}

/**
 * Drives an end-to-end Amazon reviews scrape from the current page. Opens the
 * Shadow DOM progress indicator, walks the current page, then paginates via
 * fetch() + DOMParser until the cap is hit OR pagination is exhausted OR the
 * director cancels.
 *
 * The current page's URL must already match the Amazon product-reviews shape
 * (callers check via isAmazonReviewPage). Behaviour on non-review pages is
 * undefined.
 */
export async function runAmazonReviewScrape(
  ctx: AmazonScrapeContext,
): Promise<AmazonScrapeResult> {
  const controller = new AbortController();
  const indicator = openScrapeProgressIndicator({
    scopeLabel: ctx.scopeLabel,
    onCancel: () => controller.abort(),
  });
  const onProgress = (event: ScrapeProgress) => indicator.update(event);

  // Track which page-URL we're walking. Page 1 is the current document; pages
  // 2+ are fetched.
  let currentDoc: Document = document;
  let currentPageUrl = window.location.href;

  const cap = ctx.cap && ctx.cap > 0 ? ctx.cap : DEFAULT_CAP;

  try {
    const result = await paginate<AmazonReviewRow>({
      onProgress,
      abortSignal: controller.signal,
      captchaSelectors: [...AMAZON_CAPTCHA_SELECTORS],
      capRows: cap,
      extractCurrentPageRows: () => extractReviewsFromDocument(currentDoc),
      advanceToNextPage: async () => {
        const nextUrl = findNextPageUrl(currentDoc, currentPageUrl);
        if (!nextUrl) return false;
        const resp = await fetch(nextUrl, {
          credentials: 'include',
          headers: { Accept: 'text/html' },
          signal: controller.signal,
        });
        if (!resp.ok) {
          const err = new Error(`Amazon next-page fetch returned ${String(resp.status)}`) as Error & {
            status: number;
          };
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
        await ctx.saveReview({
          clientId: makeClientId(),
          starRating: row.starRating,
          body: row.body,
          title: row.title,
          reviewerName: row.reviewerName,
          reviewDate: row.reviewDate,
          helpfulCount: row.helpfulCount,
          platform: 'amazon',
        });
      },
    });
    return {
      inserted: result.totalRowsCaptured,
      abortReason: result.abortReason,
      abortMessage: result.abortMessage,
    };
  } catch (err) {
    indicator.update({
      kind: 'aborted',
      reason: 'error',
      totalRowsCaptured: 0,
      message: err instanceof Error ? err.message : 'Unexpected error',
    });
    return {
      inserted: 0,
      abortReason: 'error',
      abortMessage: err instanceof Error ? err.message : 'Unexpected error',
    };
  }
}

function makeClientId(): string {
  // crypto.randomUUID is widely available in Chrome 92+. The extension's
  // minimum-Chrome is later than that per the manifest v3 baseline.
  return crypto.randomUUID();
}
