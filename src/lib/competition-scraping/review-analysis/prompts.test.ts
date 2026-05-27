// W#2 P-49 Workstream 5 — node:test cases for v1 prompts.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { BatchableReview } from './batch-sizer.ts';
import {
  PER_PRODUCT_SYSTEM_PROMPT,
  buildPerProductBatchUserMessage,
  buildSecondSweepUserMessage,
} from './prompts.ts';

function makeReview(
  id: string,
  overrides: Partial<BatchableReview> = {}
): BatchableReview {
  return {
    id,
    body: 'Great product, works as expected.',
    reviewerName: 'Jane Doe',
    starRating: 5,
    reviewDate: new Date('2026-01-15T00:00:00Z'),
    ...overrides,
  };
}

test('PER_PRODUCT_SYSTEM_PROMPT is non-empty and stable', () => {
  // Tripwire — any whitespace edit invalidates the prompt cache for every
  // in-flight summary. If this fails, intentionally bump the cache.
  assert.ok(PER_PRODUCT_SYSTEM_PROMPT.length > 500);
  assert.match(PER_PRODUCT_SYSTEM_PROMPT, /TipTap document shape/);
  assert.match(PER_PRODUCT_SYSTEM_PROMPT, /Common praise/);
  assert.match(PER_PRODUCT_SYSTEM_PROMPT, /Common complaints/);
});

test('buildPerProductBatchUserMessage emits header + per-review body', () => {
  const msg = buildPerProductBatchUserMessage({
    productName: 'Acme Widget',
    platform: 'amazon',
    batchNumber: 2,
    totalBatches: 5,
    reviews: [makeReview('r1'), makeReview('r2')],
  });
  assert.match(msg, /Product: Acme Widget/);
  assert.match(msg, /Platform: amazon/);
  assert.match(msg, /Batch 2 of 5, 2 reviews/);
  assert.match(msg, /Review 1/);
  assert.match(msg, /Review 2/);
  assert.match(msg, /5\/5 stars, Jane Doe, 2026-01-15/);
});

test('buildPerProductBatchUserMessage handles missing metadata', () => {
  const msg = buildPerProductBatchUserMessage({
    productName: 'X',
    platform: 'walmart',
    batchNumber: 1,
    totalBatches: 1,
    reviews: [
      makeReview('r1', {
        reviewerName: null,
        starRating: null,
        reviewDate: null,
      }),
    ],
  });
  // No parenthesized metadata line when all three are null.
  assert.match(msg, /Review 1:\nGreat product/);
  assert.doesNotMatch(msg, /\(.*Jane.*\)/);
});

test('buildSecondSweepUserMessage includes per-batch summary count + JSON', () => {
  const msg = buildSecondSweepUserMessage({
    productName: 'Acme',
    platform: 'amazon',
    totalReviewsAnalyzed: 487,
    batchSummariesJson: [
      { type: 'doc', content: [{ type: 'paragraph' }] },
      { type: 'doc', content: [{ type: 'heading' }] },
    ],
  });
  assert.match(msg, /Total reviews analyzed across batches: 487/);
  assert.match(msg, /Number of per-batch summaries: 2/);
  assert.match(msg, /--- Batch 1 summary ---/);
  assert.match(msg, /--- Batch 2 summary ---/);
  assert.match(msg, /Return ONLY the merged JSON object/);
});

test('buildSecondSweepUserMessage handles a single-batch case', () => {
  const msg = buildSecondSweepUserMessage({
    productName: 'X',
    platform: 'etsy',
    totalReviewsAnalyzed: 10,
    batchSummariesJson: [{ type: 'doc', content: [] }],
  });
  assert.match(msg, /Number of per-batch summaries: 1/);
  assert.match(msg, /--- Batch 1 summary ---/);
});
