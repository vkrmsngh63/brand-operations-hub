// W#2 P-49 Workstream 5 — adaptive batch sizing for the two-sweep
// per-product AI analysis per §A.8.
//
// Design intent (§A.8): "a token-counter helper measures each batch as
// it's built; reviews are added until the batch reaches the threshold;
// the batch is sent; the next batch begins."
//
// §A.8 references "~80% of Opus's 200,000-token context window" — that
// figure was locked at the 2026-05-25-b design session when Opus 4.5 was
// the latest. Opus 4.6/4.7 ship a 1M-token context window. We honor the
// design *intent* (size batches to keep headroom + minimize call count)
// but cap the per-batch target at TARGET_INPUT_TOKENS_PER_BATCH (default
// 80,000) — keeps response latency manageable, gives prompt caching room
// to amortize the system prompt, and avoids worst-case rate-limit eats.
// Configurable via parameter so future tuning sessions can raise it.
//
// Algorithm:
//   1. For each review, approximate its token weight via the char/3.6
//      heuristic. This is the hot-loop estimate.
//   2. When adding a review would push the running tally over target,
//      flush the current batch and start a new one.
//   3. If a single review alone exceeds target (rare — would need to
//      be a multi-MB review body), place it in its own batch + warn.
//
// We do NOT call countMessageTokens per-review in the hot loop — that
// would add N round-trips. Instead the caller is expected to validate
// the *final* batch via countMessageTokens before sending. The
// approximate-then-verify pattern keeps batching O(N) without I/O.

import { approximateTokensFromString } from './token-counter.ts';

export type BatchableReview = {
  id: string;
  body: string;
  // Optional metadata that will appear in the prompt (per-review weight
  // includes reviewer name + star + date when present).
  reviewerName?: string | null;
  starRating?: number | null;
  reviewDate?: Date | null;
};

export type AdaptiveBatchInput = {
  reviews: ReadonlyArray<BatchableReview>;
  // Per-batch budget in tokens for the REVIEW PAYLOAD ONLY (excludes
  // system prompt + user message scaffolding). The caller should set
  // this to (target - reservedForSystemPrompt - reservedForOutput).
  targetTokensPerBatch?: number;
  // Approximate token weight of the per-batch prompt scaffolding
  // (the "Reviews for product X, batch Y of Z:" lines etc.). Subtracted
  // from each batch's available payload budget so we don't overshoot.
  scaffoldingTokens?: number;
};

export type BatchResult = {
  batches: BatchableReview[][];
  // True when a review exceeded the per-batch budget on its own (forced
  // into a single-review batch). Caller may log a warning + the row IDs.
  oversizedReviewIds: string[];
};

export const DEFAULT_TARGET_TOKENS_PER_BATCH = 80_000;
export const DEFAULT_SCAFFOLDING_TOKENS = 500;

// Token weight per review = approximate body length + a small fixed
// overhead for the per-review header line. Caller's prompt scaffolding
// gets subtracted from the budget once per batch.
function approximateReviewTokens(review: BatchableReview): number {
  const headerBytes =
    // "Review N (5/5 stars, ReviewerName, 2026-01-15):\n" ~ 60 chars typical
    60 + (review.reviewerName?.length ?? 0);
  return (
    approximateTokensFromString(review.body) +
    approximateTokensFromString(' '.repeat(headerBytes))
  );
}

export function adaptiveBatch({
  reviews,
  targetTokensPerBatch = DEFAULT_TARGET_TOKENS_PER_BATCH,
  scaffoldingTokens = DEFAULT_SCAFFOLDING_TOKENS,
}: AdaptiveBatchInput): BatchResult {
  if (targetTokensPerBatch <= 0) {
    throw new Error(
      `targetTokensPerBatch must be > 0, got ${targetTokensPerBatch}`
    );
  }
  if (scaffoldingTokens < 0 || scaffoldingTokens >= targetTokensPerBatch) {
    throw new Error(
      `scaffoldingTokens must be in [0, targetTokensPerBatch), got ${scaffoldingTokens}`
    );
  }

  const payloadBudget = targetTokensPerBatch - scaffoldingTokens;
  const batches: BatchableReview[][] = [];
  const oversizedReviewIds: string[] = [];

  let current: BatchableReview[] = [];
  let currentTokens = 0;

  for (const review of reviews) {
    const weight = approximateReviewTokens(review);

    if (weight > payloadBudget) {
      // Flush current batch if non-empty so the oversized review
      // doesn't trail the previous batch's reviews.
      if (current.length > 0) {
        batches.push(current);
        current = [];
        currentTokens = 0;
      }
      // Single-review batch — overrun is unavoidable here; caller
      // decides whether to truncate the review body or skip the row.
      batches.push([review]);
      oversizedReviewIds.push(review.id);
      continue;
    }

    if (currentTokens + weight > payloadBudget) {
      // Adding this review would overflow — flush current batch first.
      batches.push(current);
      current = [];
      currentTokens = 0;
    }

    current.push(review);
    currentTokens += weight;
  }

  if (current.length > 0) {
    batches.push(current);
  }

  return { batches, oversizedReviewIds };
}
