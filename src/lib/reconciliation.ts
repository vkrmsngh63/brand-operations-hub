/**
 * Pure helper for the P3-F7 status reconciliation pass that runs at the end of
 * every Auto-Analyze batch. Heals any keyword whose `sortingStatus` drifted
 * from its actual canvas presence:
 *
 *   on-canvas + (Unsorted | Reshuffled)  →  AI-Sorted    (heal)
 *   off-canvas + AI-Sorted               →  Reshuffled   (punish)
 *   archived (any status)                →  skip         (handled by /removed-keywords)
 *
 * Why this exists as a separate module:
 *   1. Lets the logic be unit-tested with `node:test` without importing React
 *      (same path-alias rationale as `canvas-fetch-parser.ts`).
 *   2. Forces a single source of truth for the reconciliation contract so the
 *      pure logic can never accidentally read closure-frozen props instead of
 *      always-fresh refs (the 2026-04-28 closure-staleness bug — see
 *      ROADMAP.md §"🚨 Reconciliation-Pass Closure-Staleness Bug").
 *
 *   The line-153 invariant in `AutoAnalyze.tsx` says "runLoop-reachable code
 *   must read nodes/allKeywords/sisterLinks via *Ref.current, not raw props."
 *   The historical regression at line 830 was a `for (const kw of
 *   allKeywords)` that violated the invariant. Now that the diffing logic
 *   lives here, the only way to USE this function is to pass a keyword list
 *   in explicitly — there's no enclosing closure to capture stale state from.
 *   That's the structural fix: the pure function can't be wrong in the same
 *   way the inline loop was.
 */

export interface KeywordReconcileInput {
  id: string;
  sortingStatus: string;
}

export interface ReconcileUpdate {
  id: string;
  sortingStatus: 'AI-Sorted' | 'Reshuffled';
}

export interface ReconcileSummary {
  updates: ReconcileUpdate[];
  flippedToAiSorted: number;
  flippedToReshuffled: number;
}

/**
 * Compute the reconciliation diff for a single batch.
 *
 * @param keywords      Every keyword in scope (the project's full keyword
 *                      list as of NOW — pass `keywordsRef.current`, not the
 *                      closure-frozen `allKeywords` prop).
 * @param placedSet     Set of keyword IDs that the just-applied batch
 *                      placed on the canvas.
 * @param archivedSet   Set of keyword IDs the just-applied batch archived
 *                      (skip these — `/removed-keywords` owns their state).
 *
 * Returns the list of {id, sortingStatus} update operations the caller should
 * persist via `onBatchUpdateKeywords` (or fire against the live DB via the
 * "Reconcile Now" admin path).
 */
export function computeReconciliationUpdates(
  keywords: ReadonlyArray<KeywordReconcileInput>,
  placedSet: ReadonlySet<string>,
  archivedSet: ReadonlySet<string>,
): ReconcileSummary {
  const updates: ReconcileUpdate[] = [];
  let flippedToAiSorted = 0;
  let flippedToReshuffled = 0;

  for (const kw of keywords) {
    if (archivedSet.has(kw.id)) continue;
    const onCanvas = placedSet.has(kw.id);

    if (onCanvas && (kw.sortingStatus === 'Unsorted' || kw.sortingStatus === 'Reshuffled')) {
      updates.push({ id: kw.id, sortingStatus: 'AI-Sorted' });
      flippedToAiSorted++;
    } else if (!onCanvas && kw.sortingStatus === 'AI-Sorted') {
      updates.push({ id: kw.id, sortingStatus: 'Reshuffled' });
      flippedToReshuffled++;
    }
  }

  return { updates, flippedToAiSorted, flippedToReshuffled };
}
