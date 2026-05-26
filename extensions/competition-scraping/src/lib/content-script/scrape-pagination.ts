// Shared pagination + anti-bot helper for the per-platform review extraction
// modules shipped under P-49 Workstream 2 (2026-05-26).
//
// Per docs/REVIEWS_PHASE_2_DESIGN.md §A.15 ("Conservative everywhere"), every
// platform module:
//   • Sleeps a random 1-3 seconds between pagination clicks (per-click random,
//     not fixed — fixed intervals are themselves a bot signal).
//   • Polls the DOM for captcha markers after each load; aborts cleanly if one
//     appears so director can resolve it manually (silent retry past a captcha
//     is the single strongest bot escalation signal).
//   • Watches for rate-limit responses (HTTP 429) routed back from the
//     background-proxy and aborts cleanly with a clear UI notification.
//   • Honors an AbortSignal so the Cancel button on the Shadow DOM progress
//     indicator can stop the scrape on demand.
//   • Emits a structured ScrapeProgress event stream so the Shadow DOM
//     progress indicator can render "Scraping page N of M — X reviews
//     captured" without coupling to the platform module's internals.

export type ScrapeAbortReason =
  | 'captcha'
  | 'rate-limit'
  | 'user-cancel'
  | 'error';

export type ScrapeProgress =
  | { kind: 'starting' }
  | { kind: 'page-loading'; pageIndex: number }
  | {
      kind: 'page-loaded';
      pageIndex: number;
      rowsOnPage: number;
      totalRowsCaptured: number;
    }
  | { kind: 'row-saved'; totalRowsCaptured: number }
  | { kind: 'completed'; totalRowsCaptured: number }
  | {
      kind: 'aborted';
      reason: ScrapeAbortReason;
      totalRowsCaptured: number;
      message?: string;
    };

export type ScrapeProgressListener = (event: ScrapeProgress) => void;

// ─── Random pagination delay ─────────────────────────────────────────────

export interface PaginationDelayOptions {
  /** Lower bound in ms (inclusive). Defaults to 1000. */
  minMs?: number;
  /** Upper bound in ms (exclusive-ish — uses Math.random()). Defaults to 3000. */
  maxMs?: number;
  /** Aborts the sleep when fired; rejects with an AbortError-shaped object. */
  abortSignal?: AbortSignal;
}

/**
 * Sleeps a random duration in [minMs, maxMs). Default 1000-3000ms per §A.15.
 * Honors the abort signal — if fired mid-sleep, rejects so the caller can
 * surface the user-cancel path. Per-call randomness defends against the
 * fixed-interval bot signal.
 */
export async function randomPaginationDelay(
  opts: PaginationDelayOptions = {}
): Promise<void> {
  const minMs = opts.minMs ?? 1000;
  const maxMs = opts.maxMs ?? 3000;
  const delay = minMs + Math.random() * Math.max(0, maxMs - minMs);
  return new Promise((resolve, reject) => {
    if (opts.abortSignal?.aborted) {
      reject(makeAbortError('aborted before sleep'));
      return;
    }
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, delay);
    const onAbort = () => {
      cleanup();
      clearTimeout(timer);
      reject(makeAbortError('aborted during sleep'));
    };
    const cleanup = () => {
      opts.abortSignal?.removeEventListener('abort', onAbort);
    };
    opts.abortSignal?.addEventListener('abort', onAbort, { once: true });
  });
}

function makeAbortError(message: string): Error {
  const err = new Error(message);
  err.name = 'AbortError';
  return err;
}

export function isAbortError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'name' in err &&
    (err as { name: unknown }).name === 'AbortError'
  );
}

// ─── Captcha + rate-limit detection ──────────────────────────────────────

/**
 * Default Amazon captcha selectors. Amazon serves its captcha page at
 * /errors/validateCaptcha with a #captchacharacters input. Per-platform
 * modules pass their own selector list to detectCaptcha().
 */
export const AMAZON_CAPTCHA_SELECTORS: readonly string[] = [
  '#captchacharacters',
  'form[action*="validateCaptcha"]',
  'img[src*="captcha"]',
];

/**
 * Generic CAPTCHA iframe markers — reCAPTCHA + hCaptcha widget signals that
 * surface across platforms.
 */
export const GENERIC_CAPTCHA_SELECTORS: readonly string[] = [
  'iframe[src*="recaptcha"]',
  'iframe[src*="hcaptcha"]',
  '.g-recaptcha',
  '.h-captcha',
];

/**
 * Returns true when any selector in the list matches an element in the
 * current document. Per §A.15, callers abort the scrape on a true return.
 */
export function detectCaptcha(selectors: readonly string[]): boolean {
  for (const sel of selectors) {
    try {
      if (document.querySelector(sel)) return true;
    } catch {
      // Invalid selector — skip (defensive; shouldn't happen with literals).
    }
  }
  return false;
}

/**
 * Treats common rate-limit signals as a stop condition. Per §A.15, callers
 * abort on a true return. HTTP 429 is the canonical signal; some platforms
 * also serve a 503 with a Retry-After header during throttling.
 */
export function isRateLimitStatus(status: number): boolean {
  return status === 429 || status === 503;
}

// ─── Paginate generic loop ────────────────────────────────────────────────

export interface PaginateOptions<TRow> {
  /** Fires before each page step + after each row inserted. */
  onProgress: ScrapeProgressListener;
  /** Cancellation signal — fires on user-cancel (e.g., progress-indicator Cancel button). */
  abortSignal: AbortSignal;
  /**
   * Returns the rows visible on the current page. Called once per pagination
   * step; should NOT advance pagination — paginateStep handles that.
   */
  extractCurrentPageRows(): TRow[];
  /**
   * Advances to the next page (clicks "Next" link, navigates by URL, etc.).
   * Returns true if a next page exists; false if pagination is exhausted.
   * Implementations should wait for the new content to be in the DOM before
   * returning; the helper does not poll the DOM separately.
   */
  advanceToNextPage(currentPageIndex: number): Promise<boolean>;
  /**
   * Persists one row to the database. Throws to abort. May return early —
   * the helper does not require any specific return value.
   */
  saveRow(row: TRow): Promise<void>;
  /**
   * Platform-specific captcha selectors. Combined with GENERIC_CAPTCHA_SELECTORS
   * inside paginate; callers should NOT pre-merge.
   */
  captchaSelectors: readonly string[];
  /**
   * Maximum total rows to capture across all pages. Loop stops when this
   * many have been saved OR pagination is exhausted, whichever comes first.
   */
  capRows: number;
  /**
   * Delay range between pagination steps. Defaults to 1000-3000ms per §A.15.
   */
  delayMinMs?: number;
  delayMaxMs?: number;
}

export interface PaginateResult {
  totalRowsCaptured: number;
  /** Set when the loop ended early due to an abort. Undefined on natural completion. */
  abortReason?: ScrapeAbortReason;
  abortMessage?: string;
}

/**
 * Generic per-platform pagination loop honoring all of §A.15's defensive
 * defaults. Each platform module composes this with its own DOM walker +
 * pagination-advancement primitive. The helper handles:
 *   • Random 1-3s sleeps between pagination steps
 *   • Captcha check after each page settles
 *   • Rate-limit propagation from saveRow throws (signaled via err.name)
 *   • User-cancel via AbortSignal
 *   • Progress event emission so the Shadow DOM indicator can render
 *
 * Returns a result describing how the loop ended.
 */
export async function paginate<TRow>(
  opts: PaginateOptions<TRow>
): Promise<PaginateResult> {
  const allCaptchaSelectors = [
    ...opts.captchaSelectors,
    ...GENERIC_CAPTCHA_SELECTORS,
  ];
  opts.onProgress({ kind: 'starting' });

  let totalRowsCaptured = 0;
  let pageIndex = 0;

  // Treat the page we entered on as page 1 (no advance needed for it).
  while (true) {
    if (opts.abortSignal.aborted) {
      const result: PaginateResult = {
        totalRowsCaptured,
        abortReason: 'user-cancel',
      };
      opts.onProgress({
        kind: 'aborted',
        reason: 'user-cancel',
        totalRowsCaptured,
      });
      return result;
    }

    opts.onProgress({ kind: 'page-loading', pageIndex });

    // Captcha check before walking the page. Anything Amazon (or the
    // generic CAPTCHA widgets) will surface here.
    if (detectCaptcha(allCaptchaSelectors)) {
      opts.onProgress({
        kind: 'aborted',
        reason: 'captcha',
        totalRowsCaptured,
        message:
          'Captcha detected. Finish the captcha in the tab then re-run the scrape.',
      });
      return {
        totalRowsCaptured,
        abortReason: 'captcha',
        abortMessage: 'captcha detected',
      };
    }

    const rows = opts.extractCurrentPageRows();
    opts.onProgress({
      kind: 'page-loaded',
      pageIndex,
      rowsOnPage: rows.length,
      totalRowsCaptured,
    });

    for (const row of rows) {
      if (opts.abortSignal.aborted) {
        opts.onProgress({
          kind: 'aborted',
          reason: 'user-cancel',
          totalRowsCaptured,
        });
        return { totalRowsCaptured, abortReason: 'user-cancel' };
      }
      if (totalRowsCaptured >= opts.capRows) break;

      try {
        await opts.saveRow(row);
      } catch (err) {
        // Surface rate-limit specially so the indicator can show the right
        // message. Other errors abort with the generic 'error' reason.
        const reason = classifyRowSaveError(err);
        opts.onProgress({
          kind: 'aborted',
          reason,
          totalRowsCaptured,
          message: errorMessage(err) ?? 'Save failed.',
        });
        return {
          totalRowsCaptured,
          abortReason: reason,
          abortMessage: errorMessage(err),
        };
      }
      totalRowsCaptured += 1;
      opts.onProgress({ kind: 'row-saved', totalRowsCaptured });
    }

    if (totalRowsCaptured >= opts.capRows) break;

    // Random pagination delay BEFORE the advance attempt so the inter-click
    // gap is the noisy human-like duration, not the deterministic "load +
    // walk" duration.
    try {
      await randomPaginationDelay({
        minMs: opts.delayMinMs,
        maxMs: opts.delayMaxMs,
        abortSignal: opts.abortSignal,
      });
    } catch (err) {
      if (isAbortError(err)) {
        opts.onProgress({
          kind: 'aborted',
          reason: 'user-cancel',
          totalRowsCaptured,
        });
        return { totalRowsCaptured, abortReason: 'user-cancel' };
      }
      throw err;
    }

    let hasNext: boolean;
    try {
      hasNext = await opts.advanceToNextPage(pageIndex);
    } catch (err) {
      if (isAbortError(err)) {
        opts.onProgress({
          kind: 'aborted',
          reason: 'user-cancel',
          totalRowsCaptured,
        });
        return { totalRowsCaptured, abortReason: 'user-cancel' };
      }
      opts.onProgress({
        kind: 'aborted',
        reason: 'error',
        totalRowsCaptured,
        message: errorMessage(err) ?? 'Pagination failed.',
      });
      return {
        totalRowsCaptured,
        abortReason: 'error',
        abortMessage: errorMessage(err),
      };
    }
    if (!hasNext) break;
    pageIndex += 1;
  }

  opts.onProgress({ kind: 'completed', totalRowsCaptured });
  return { totalRowsCaptured };
}

function classifyRowSaveError(err: unknown): ScrapeAbortReason {
  if (typeof err === 'object' && err !== null) {
    const e = err as { status?: unknown; name?: unknown };
    if (typeof e.status === 'number' && isRateLimitStatus(e.status)) {
      return 'rate-limit';
    }
    if (e.name === 'AbortError') return 'user-cancel';
  }
  return 'error';
}

function errorMessage(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return undefined;
}
