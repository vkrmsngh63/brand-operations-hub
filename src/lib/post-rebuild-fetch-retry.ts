/**
 * Post-rebuild canvas refresh retry helper — pure module.
 *
 * Why this exists as a separate module:
 *   1. Lets the retry + annotate-on-exhaust logic be unit-tested with
 *      `node:test` without importing React or the canvas hook. Same
 *      sleep-injection pattern as `prisma-retry.ts`.
 *   2. Single source of truth for the partial-apply state recovery
 *      contract. The error annotations (`_noRetry`, `_postRebuildFetchFailed`)
 *      that runLoop's outer catch reads to make its retry-vs-pause decision
 *      live here so the policy is one place rather than scattered.
 *
 * Why this matters — partial-apply state recovery:
 *   The Auto-Analyze apply pipeline does:
 *     (1) `applyOperations` in memory,
 *     (2) POST `/canvas/rebuild` (atomic; canonical on success),
 *     (3) `await onRefreshCanvas() + onRefreshKeywords()` to resync UI.
 *
 *   If step (3) fails after step (2) succeeded, the SERVER state is
 *   post-apply (correct) but the CLIENT state is pre-apply (because
 *   `useCanvas.fetchCanvas` preserves prior state on failure — the
 *   2026-04-28 canvas-blanking hardening).
 *
 *   The default runLoop behavior on a thrown error is "retry the whole
 *   batch with 5s backoff." That would feed the model the STALE
 *   pre-apply client snapshot on attempt 2; ops returned for that
 *   stale view can collide with attempt-1's already-applied state in
 *   two ways:
 *
 *     - Visible (caught): cyclic stableId references. Applier rejects.
 *       The 2026-05-02-c profiling pass observed exactly this at
 *       Batch 15 attempt 2 (cycle on `t-1`).
 *
 *     - Silent (NOT caught): the rebuild route's
 *       `prisma.canvasNode.upsert` keys on `(projectWorkflowId,
 *       stableId)`. If attempt 2 allocates the same `t-N` for a
 *       different topic (because the client's `nextStableIdN` is stale),
 *       the server upsert silently overwrites attempt-1's content with
 *       attempt-2's. No guard catches it.
 *
 *   Both modes are eliminated by retrying just the refresh — not the
 *   whole batch. This helper does that with backoff, then on persistent
 *   failure throws an error annotated with both `_noRetry: true`
 *   (so runLoop doesn't fall into its standard retry path) and
 *   `_postRebuildFetchFailed: true` (so runLoop's catch knows to mark
 *   the batch as complete-on-server, advance, save the checkpoint, and
 *   pause for a manual browser refresh + Resume).
 *
 *   See also:
 *     - `BROWSER_FREEZE_FIX_DESIGN.md` §9.5.1 (Hypothesis A)
 *     - `ROADMAP.md` "NEW HIGH-severity REGRESSION 2026-05-02-c" entry
 *     - `src/hooks/useCanvas.ts` (the hardened error contract)
 *
 * Backoff (locked):
 *   - Attempt 1: immediate
 *   - Sleep 2000ms, attempt 2
 *   - Sleep 5000ms, attempt 3
 *   - Total worst-case extra latency before pausing the run: ~7s.
 */

export interface PostRebuildFetchRetryOptions {
  /** Default 3. Number of attempts BEFORE throwing the annotated error. */
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
   * retried. Used by the AutoAnalyze caller to surface a warn-level
   * activity-log line. Not invoked after the FINAL failure — that
   * surfaces as the thrown error.
   */
  onAttemptFailed?: (
    attempt: number,
    maxAttempts: number,
    nextBackoffMs: number,
    error: unknown,
  ) => void;
}

export interface PostRebuildFetchFailedError extends Error {
  _noRetry: true;
  _postRebuildFetchFailed: true;
}

const DEFAULT_BACKOFFS_MS = [2000, 5000];
const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isPostRebuildFetchFailedError(
  e: unknown,
): e is PostRebuildFetchFailedError {
  if (typeof e !== 'object' || e === null) return false;
  const flag = (e as { _postRebuildFetchFailed?: unknown })._postRebuildFetchFailed;
  return flag === true;
}

/**
 * Run `refresh` with up to `maxAttempts` attempts and configured
 * backoff between attempts. Returns void on the first successful
 * attempt; throws an annotated `PostRebuildFetchFailedError` when all
 * attempts have failed.
 *
 * The thrown error carries:
 *   - `_noRetry: true` — runLoop will NOT enter its standard
 *     5s-then-retry-batch path.
 *   - `_postRebuildFetchFailed: true` — runLoop's catch reads this to
 *     mark the batch complete (server state is canonical), advance the
 *     cursor, save the checkpoint, and pause with a clear message.
 *   - A user-readable message describing the recovery action (refresh
 *     browser + Resume).
 */
export async function runRefreshWithRetry(
  refresh: () => Promise<void>,
  options: PostRebuildFetchRetryOptions = {},
): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffsMs = options.backoffsMs ?? DEFAULT_BACKOFFS_MS;
  const sleep = options.sleep ?? defaultSleep;
  const onAttemptFailed = options.onAttemptFailed;

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await refresh();
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
  const wrapped = new Error(
    'Canvas rebuild SUCCEEDED but UI refresh failed after ' +
      maxAttempts +
      ' attempts. The batch IS applied on the server (canonical). ' +
      'Refresh the browser tab and click Resume to continue; the run ' +
      'will pick up at the next batch against fresh server state. ' +
      '(Underlying error: ' +
      underlying +
      ')',
  ) as PostRebuildFetchFailedError;
  wrapped._noRetry = true;
  wrapped._postRebuildFetchFailed = true;
  throw wrapped;
}
