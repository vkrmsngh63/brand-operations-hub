/**
 * W#1 Auto-Analyze cost forecasting (polish item M-2).
 *
 * Pure, framework-free helpers powering the in-run cost projection + the two
 * low-credit protections wired into AutoAnalyze.tsx:
 *   - projectRunCost       — sliding-window "estimated total / remaining" forecast.
 *   - classifyAnthropicError — flags out-of-credit / billing errors that must
 *                              NOT be naively retried. Anthropic exposes no
 *                              balance endpoint, so this reactive classifier is
 *                              the only way to detect a drained balance.
 *   - evaluateSpendCap     — ok / warn / over status for the optional spend cap.
 *
 * Kept out of the component so it can be node:test-covered. See
 * docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md M-2.
 */

/** Mean of a numeric list; 0 for an empty list. */
export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (const n of nums) sum += n;
  return sum / nums.length;
}

/** Average of the last `window` entries (all of them if fewer exist). */
export function trailingMean(nums: number[], window: number): number {
  if (nums.length === 0) return 0;
  const w = window > 0 ? window : nums.length;
  return mean(nums.slice(-w));
}

export interface RunCostProjectionInput {
  /** USD spent so far (batches + consolidations). */
  spent: number;
  /** Per-batch USD costs of completed regular batches, in order. */
  batchCosts: number[];
  /** Regular batches not yet processed. */
  batchesRemaining: number;
  /** Per-pass USD costs of completed consolidation passes, in order. */
  consolidationCosts: number[];
  /** Estimated consolidation passes still to fire. */
  consolidationsRemaining: number;
  /** Pre-run per-batch estimate, used until real batch data exists. */
  fallbackBatchCost: number;
  /** Pre-run per-consolidation estimate, used until real data exists. */
  fallbackConsolidationCost: number;
  /** Sliding-window size for the trailing averages. Default 10. */
  window?: number;
}

export interface RunCostProjection {
  /** Trailing-average regular-batch cost driving the forecast. */
  avgBatchCost: number;
  /** Trailing-average consolidation-pass cost driving the forecast. */
  avgConsolidationCost: number;
  /** Estimated USD still to spend across remaining batches + consolidations. */
  estRemaining: number;
  /** Estimated final USD total (spent + estRemaining). */
  estTotal: number;
  /** True once real batch data (not the fallback) drives the average. */
  hasActuals: boolean;
}

/**
 * Sliding-window run-cost forecast. Uses the trailing average of recent
 * batch / consolidation costs (the director's proposed estimator) and falls
 * back to the pre-run per-unit estimates until real data lands.
 */
export function projectRunCost(input: RunCostProjectionInput): RunCostProjection {
  const window = input.window ?? 10;
  const batchesRemaining = Math.max(0, input.batchesRemaining);
  const consolidationsRemaining = Math.max(0, input.consolidationsRemaining);

  const avgBatchCost = input.batchCosts.length > 0
    ? trailingMean(input.batchCosts, window)
    : Math.max(0, input.fallbackBatchCost);
  const avgConsolidationCost = input.consolidationCosts.length > 0
    ? trailingMean(input.consolidationCosts, window)
    : Math.max(0, input.fallbackConsolidationCost);

  const estRemaining =
    avgBatchCost * batchesRemaining + avgConsolidationCost * consolidationsRemaining;
  const estTotal = Math.max(0, input.spent) + estRemaining;

  return {
    avgBatchCost,
    avgConsolidationCost,
    estRemaining,
    estTotal,
    hasActuals: input.batchCosts.length > 0,
  };
}

export type AnthropicErrorClass = 'credit' | 'other';

/**
 * Classify an Anthropic API error message. Returns 'credit' for an out-of-
 * credit / billing error (HTTP 400 invalid_request: "Your credit balance is
 * too low to access the Anthropic API…"), which is NOT transient and must
 * not be retried. Everything else is 'other' (eligible for normal retry).
 *
 * Matched conservatively to avoid false positives on unrelated errors.
 */
export function classifyAnthropicError(message: string): AnthropicErrorClass {
  const m = (message || '').toLowerCase();
  if (
    m.includes('credit balance is too low') ||
    m.includes('credit balance too low') ||
    (m.includes('credit') && m.includes('too low')) ||
    m.includes('insufficient credit') ||
    m.includes('insufficient_quota') ||
    m.includes('billing_error')
  ) {
    return 'credit';
  }
  return 'other';
}

export type SpendCapStatus = 'ok' | 'warn' | 'over';

/**
 * Evaluate the optional spend cap. `cap <= 0` disables it ('ok').
 *  - 'over'  once `spent` reaches the cap (the run pauses).
 *  - 'warn'  when spent is within `warnFraction` of the cap, or the projected
 *            total would exceed it.
 */
export function evaluateSpendCap(
  spent: number,
  estTotal: number,
  cap: number,
  warnFraction = 0.8,
): SpendCapStatus {
  if (!(cap > 0)) return 'ok';
  if (spent >= cap) return 'over';
  if (spent >= cap * warnFraction || estTotal >= cap) return 'warn';
  return 'ok';
}
