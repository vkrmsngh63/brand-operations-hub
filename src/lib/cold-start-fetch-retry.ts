/**
 * Cold-start mount-time fetch retry helper — pure module.
 *
 * Why this exists as a separate module from `post-rebuild-fetch-retry.ts`:
 *   The two modules share retry MECHANICS (3 attempts, 2s + 5s backoffs,
 *   sleep injection, onAttemptFailed callback) but differ in SEMANTICS:
 *
 *   - `post-rebuild-fetch-retry`: covers the partial-apply state recovery
 *     case — server state IS canonical, client state is stale, throw an
 *     annotated error so runLoop's catch can mark the batch complete +
 *     pause for refresh-and-Resume.
 *
 *   - `cold-start-fetch-retry` (this module): covers the page-mount case
 *     where four browser-side fetches (canvas state, canvas nodes,
 *     keywords, removed-keywords) all need to succeed against a flaky
 *     pgbouncer connection pool. There is no canonical-on-server /
 *     refresh-and-Resume story — there's just "the data isn't loaded
 *     yet." On exhaust, throw a plain Error so the UI can swap the
 *     "Retrying load…" indicator for an explicit "click here to retry"
 *     button.
 *
 *   No shared annotations, no shared catch-branch contract. Two clear
 *   modules read more cleanly than one over-generalized one.
 *
 * Why this matters — cold-start render layer:
 *   `useCanvas.fetchCanvas` (the 2026-04-28 G2 hardening) preserves prior
 *   client state on any fetch failure. That contract is correct for the
 *   mid-run case (a transient flake shouldn't blank an already-populated
 *   canvas) but wrong for cold start (prior state is empty; "preserve
 *   prior" means "stay empty" with no user-visible signal that anything
 *   went wrong).
 *
 *   With four parallel mount-time fetches at ~25% per-endpoint flake
 *   rate, P(all four succeed) ≈ 0.75⁴ ≈ 0.32 → ~68% of cold starts
 *   will have at least one flake. Director observed this live during
 *   the 2026-05-02-e Bursitis Test 2 run as "needs 3+ hard refreshes."
 *
 *   This helper closes the gap by retrying each mount-time fetch in
 *   place + surfacing a "Retrying load…" indicator on first failure +
 *   exposing a "click here to retry" UI on exhaust. Combined with the
 *   2026-05-02-d post-rebuild fetch retry helper, the recovery flow
 *   that helper assumes (refresh + Resume) is now actually usable.
 *
 *   See also:
 *     - `ROADMAP.md` "NEW HIGH — Cold-start hard-refresh: canvas (and
 *       sometimes keyword table) renders empty" entry (2026-05-02-d/-e).
 *     - `src/lib/post-rebuild-fetch-retry.ts` — sibling module covering
 *       the apply-pipeline path; same mechanics, different error contract.
 *     - `src/hooks/useCanvas.ts` — the preserve-prior + throw contract
 *       this helper wraps at mount-time call sites.
 *     - `src/hooks/useKeywords.ts` — corresponding keyword fetch path.
 *
 * Backoff (locked):
 *   - Attempt 1: immediate
 *   - Sleep 2000ms, attempt 2
 *   - Sleep 5000ms, attempt 3
 *   - Total worst-case extra latency before showing "click to retry": ~7s.
 */

export interface ColdStartFetchRetryOptions {
  /** Default 3. Number of attempts BEFORE throwing. */
  maxAttempts?: number;
  /**
   * Default `[2000, 5000]`. Backoffs[i] is the sleep BETWEEN attempt i+1
   * and attempt i+2 (1-indexed). Length should be at least
   * `maxAttempts - 1`; if shorter, the last value is reused.
   */
  backoffsMs?: number[];
  /** Override for tests; default uses `setTimeout`. */
  sleep?: (ms: number) => Promise<void>;
  /**
   * Optional callback invoked after each failed attempt that will be
   * retried. Used by the KeywordWorkspace caller to flip the centralized
   * retry-state to "Retrying load…" for the relevant fetch label. NOT
   * invoked after the FINAL failure — that surfaces as the thrown error.
   */
  onAttemptFailed?: (
    attempt: number,
    maxAttempts: number,
    nextBackoffMs: number,
    error: unknown,
  ) => void;
  /**
   * Human-readable label for the thing being fetched (e.g., "canvas",
   * "keywords"). Embedded in the thrown error message so the UI can
   * display "Could not load canvas — click to retry" without separate
   * lookup logic.
   */
  label?: string;
}

const DEFAULT_BACKOFFS_MS = [2000, 5000];
const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Run `fetch` with up to `maxAttempts` attempts and configured backoff
 * between attempts. Returns void on the first successful attempt; throws
 * a plain Error with a "click here to retry" message when all attempts
 * have failed.
 *
 * The thrown error's message includes the `label` (when provided) and
 * the underlying error string, so a banner can render it directly.
 */
export async function runColdStartFetchWithRetry(
  fetch: () => Promise<void>,
  options: ColdStartFetchRetryOptions = {},
): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffsMs = options.backoffsMs ?? DEFAULT_BACKOFFS_MS;
  const sleep = options.sleep ?? defaultSleep;
  const onAttemptFailed = options.onAttemptFailed;
  const label = options.label;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await fetch();
      return;
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts) {
        const nextBackoff =
          backoffsMs[attempt - 1] ??
          backoffsMs[backoffsMs.length - 1] ??
          5000;
        if (onAttemptFailed) {
          onAttemptFailed(attempt, maxAttempts, nextBackoff, e);
        }
        await sleep(nextBackoff);
      }
    }
  }

  const underlying =
    lastError instanceof Error ? lastError.message : String(lastError);
  const subject = label ? label : 'data';
  throw new Error(
    'Could not load ' +
      subject +
      ' after ' +
      maxAttempts +
      ' attempts. Click here to retry. (Underlying error: ' +
      underlying +
      ')',
  );
}
