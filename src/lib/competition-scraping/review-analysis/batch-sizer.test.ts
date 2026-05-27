// W#2 P-49 Workstream 5 — node:test cases for adaptive batching.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_TARGET_TOKENS_PER_BATCH,
  adaptiveBatch,
  type BatchableReview,
} from './batch-sizer.ts';

function makeReview(id: string, bodyChars: number): BatchableReview {
  return {
    id,
    body: 'x'.repeat(bodyChars),
    reviewerName: 'Reviewer',
    starRating: 5,
    reviewDate: new Date('2026-01-01'),
  };
}

test('adaptiveBatch returns no batches for empty input', () => {
  const result = adaptiveBatch({ reviews: [] });
  assert.deepEqual(result.batches, []);
  assert.deepEqual(result.oversizedReviewIds, []);
});

test('adaptiveBatch puts all reviews in one batch when under budget', () => {
  // 10 small reviews — all fit in one batch under DEFAULT_TARGET.
  const reviews = Array.from({ length: 10 }, (_, i) =>
    makeReview(`r${i}`, 200)
  );
  const result = adaptiveBatch({ reviews });
  assert.equal(result.batches.length, 1);
  assert.equal(result.batches[0].length, 10);
  assert.deepEqual(result.oversizedReviewIds, []);
});

test('adaptiveBatch splits across batches when total exceeds budget', () => {
  // 50 reviews × ~25K-char bodies = ~350K chars ≈ ~100K tokens > 80K target
  // → expect at least 2 batches.
  const reviews = Array.from({ length: 50 }, (_, i) =>
    makeReview(`r${i}`, 25_000)
  );
  const result = adaptiveBatch({ reviews });
  assert.ok(
    result.batches.length >= 2,
    `expected ≥2 batches, got ${result.batches.length}`
  );
  // No review lost in batching.
  const totalAcrossBatches = result.batches.reduce(
    (n, b) => n + b.length,
    0
  );
  assert.equal(totalAcrossBatches, 50);
});

test('adaptiveBatch isolates an oversized review into its own batch', () => {
  // One ~800K-char review (~220K tokens) exceeds the 80K target alone.
  // Surrounding small reviews should still fit in their own batches.
  const reviews = [
    makeReview('small-1', 100),
    makeReview('huge', 800_000),
    makeReview('small-2', 100),
  ];
  const result = adaptiveBatch({ reviews });
  assert.deepEqual(result.oversizedReviewIds, ['huge']);
  // Expect: [small-1] flushed, [huge] alone, [small-2] alone OR
  //         [small-1], [huge], [small-2] depending on flush order.
  // Either way 'huge' is alone and oversized.
  const hugeBatch = result.batches.find((b) =>
    b.some((r) => r.id === 'huge')
  );
  assert.ok(hugeBatch);
  assert.equal(hugeBatch!.length, 1);
});

test('adaptiveBatch preserves review order within and across batches', () => {
  const reviews = Array.from({ length: 20 }, (_, i) =>
    makeReview(`r${i}`, 20_000)
  );
  const result = adaptiveBatch({ reviews });
  // Flatten and verify ordering is preserved.
  const flat = result.batches.flat().map((r) => r.id);
  const expected = reviews.map((r) => r.id);
  assert.deepEqual(flat, expected);
});

test('adaptiveBatch honors custom targetTokensPerBatch', () => {
  // Tiny budget — should force one review per batch (almost).
  const reviews = Array.from({ length: 5 }, (_, i) =>
    makeReview(`r${i}`, 5_000) // ~1400 tokens each
  );
  const result = adaptiveBatch({
    reviews,
    targetTokensPerBatch: 2_000,
    scaffoldingTokens: 100,
  });
  // Each ~1400-token review barely fits in a 1900-token payload budget,
  // so expect close to one-per-batch.
  assert.ok(result.batches.length >= 4);
});

test('adaptiveBatch validates target and scaffolding ranges', () => {
  assert.throws(
    () => adaptiveBatch({ reviews: [], targetTokensPerBatch: 0 }),
    /targetTokensPerBatch must be > 0/
  );
  assert.throws(
    () =>
      adaptiveBatch({
        reviews: [],
        targetTokensPerBatch: 100,
        scaffoldingTokens: 100,
      }),
    /scaffoldingTokens must be in/
  );
  assert.throws(
    () => adaptiveBatch({ reviews: [], scaffoldingTokens: -1 }),
    /scaffoldingTokens must be in/
  );
});

test('DEFAULT_TARGET_TOKENS_PER_BATCH is sane (between 10K and 200K)', () => {
  // Tripwire: if a future tuning session moves this constant aggressively,
  // the test forces a reviewer to revisit the prompt-cache math.
  assert.ok(DEFAULT_TARGET_TOKENS_PER_BATCH >= 10_000);
  assert.ok(DEFAULT_TARGET_TOKENS_PER_BATCH <= 200_000);
});
