// W#2 P-49 Workstream 5 — node:test cases for v1 Per-Review Summarize
// prompt builders + output validator + reviewId-mismatch detector.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { BatchableReview } from './batch-sizer.ts';
import {
  PER_REVIEW_SUMMARIZE_PROMPT_VERSION,
  PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
  buildPerReviewBatchUserMessage,
  validatePerReviewBatchOutput,
  findReviewIdMismatch,
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

test('PER_REVIEW_SUMMARIZE_PROMPT_VERSION is set to v2 (post-Phase-4-redirect)', () => {
  // Tripwire — when bumping prompt version, update this test + the
  // version history comment in prompts.ts.
  assert.equal(PER_REVIEW_SUMMARIZE_PROMPT_VERSION, 'v2');
});

test('PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT v2 is non-empty + carries bulleted-list + critical-only directives', () => {
  // Tripwire — any whitespace edit invalidates the prompt prefix cache
  // for in-flight runs. Content edits MUST also bump
  // PER_REVIEW_SUMMARIZE_PROMPT_VERSION so the per-review DB cache key
  // changes + stale v1 summaries don't get served.
  assert.ok(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT.length > 500);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /bulleted list/);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /critical/i);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /LEAVE OUT non-critical filler/);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /Third-person neutral/);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /Echo each review's reviewId/);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /Return ONLY the JSON object/);
  assert.match(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /no critical signal/);
});

test('PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT v2 does NOT carry deprecated v1 directives', () => {
  // Defends against accidental partial revert to v1 style during
  // future iterations. v1 said "1-2 sentences" + "No bullets" + "Plain
  // prose" — all explicitly contradicted by v2.
  assert.doesNotMatch(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /1-2 sentences/);
  assert.doesNotMatch(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /No bullets/);
  assert.doesNotMatch(PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT, /Plain prose/);
});

test('buildPerReviewBatchUserMessage emits header + per-review body with reviewId echo', () => {
  const msg = buildPerReviewBatchUserMessage({
    productName: 'Acme Widget',
    platform: 'amazon',
    batchNumber: 2,
    totalBatches: 5,
    reviews: [makeReview('rev-r1'), makeReview('rev-r2')],
  });
  assert.match(msg, /Product: Acme Widget/);
  assert.match(msg, /Platform: amazon/);
  assert.match(msg, /Batch 2 of 5, 2 reviews/);
  assert.match(msg, /Summarize each review below\. Echo each reviewId verbatim/);
  assert.match(msg, /--- Review 1 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /--- Review 2 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /reviewId: rev-r1/);
  assert.match(msg, /reviewId: rev-r2/);
});

test('buildPerReviewBatchUserMessage handles missing metadata cleanly', () => {
  const msg = buildPerReviewBatchUserMessage({
    productName: 'X',
    platform: 'walmart',
    batchNumber: 1,
    totalBatches: 1,
    reviews: [
      makeReview('rev-r1', {
        reviewerName: null,
        starRating: null,
        reviewDate: null,
      }),
    ],
  });
  // No parenthesized metadata line when all three are null.
  assert.match(msg, /--- Review 1 ---\nreviewId: rev-r1\nGreat product/);
  assert.doesNotMatch(msg, /\(.*Jane.*\)/);
});

test('validatePerReviewBatchOutput accepts well-formed shape', () => {
  const ok = validatePerReviewBatchOutput({
    summaries: [
      { reviewId: 'rev-r1', summary: 'Reviewer praised the build quality.' },
      { reviewId: 'rev-r2', summary: 'Reviewer complained about sizing.' },
    ],
  });
  assert.ok(ok);
  assert.equal(ok.summaries.length, 2);
  assert.equal(ok.summaries[0].reviewId, 'rev-r1');
});

test('validatePerReviewBatchOutput rejects malformed shapes', () => {
  assert.equal(validatePerReviewBatchOutput(null), null);
  assert.equal(validatePerReviewBatchOutput('not-an-object'), null);
  assert.equal(validatePerReviewBatchOutput({ summaries: 'not-an-array' }), null);
  assert.equal(validatePerReviewBatchOutput({ wrong: [] }), null);
  // Entry without reviewId.
  assert.equal(
    validatePerReviewBatchOutput({ summaries: [{ summary: 'x' }] }),
    null
  );
  // Empty reviewId.
  assert.equal(
    validatePerReviewBatchOutput({
      summaries: [{ reviewId: '', summary: 'x' }],
    }),
    null
  );
  // Entry with non-string summary.
  assert.equal(
    validatePerReviewBatchOutput({
      summaries: [{ reviewId: 'r', summary: 42 }],
    }),
    null
  );
});

test('validatePerReviewBatchOutput accepts empty summaries array (no-op batch)', () => {
  const ok = validatePerReviewBatchOutput({ summaries: [] });
  assert.ok(ok);
  assert.equal(ok.summaries.length, 0);
});

test('findReviewIdMismatch returns null when output aligns with input', () => {
  const result = findReviewIdMismatch(
    ['rev-a', 'rev-b', 'rev-c'],
    {
      summaries: [
        { reviewId: 'rev-a', summary: 'A' },
        { reviewId: 'rev-b', summary: 'B' },
        { reviewId: 'rev-c', summary: 'C' },
      ],
    }
  );
  assert.equal(result, null);
});

test('findReviewIdMismatch detects missing reviews', () => {
  const result = findReviewIdMismatch(
    ['rev-a', 'rev-b', 'rev-c'],
    { summaries: [{ reviewId: 'rev-a', summary: 'A' }] }
  );
  assert.ok(result);
  assert.deepEqual(result.missing, ['rev-b', 'rev-c']);
  assert.deepEqual(result.extra, []);
  assert.deepEqual(result.duplicated, []);
});

test('findReviewIdMismatch detects invented reviewIds', () => {
  const result = findReviewIdMismatch(
    ['rev-a'],
    {
      summaries: [
        { reviewId: 'rev-a', summary: 'A' },
        { reviewId: 'rev-hallucinated', summary: 'X' },
      ],
    }
  );
  assert.ok(result);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.extra, ['rev-hallucinated']);
  assert.deepEqual(result.duplicated, []);
});

test('findReviewIdMismatch detects duplicate reviewIds in output', () => {
  const result = findReviewIdMismatch(
    ['rev-a', 'rev-b'],
    {
      summaries: [
        { reviewId: 'rev-a', summary: 'A' },
        { reviewId: 'rev-a', summary: 'A-again' },
        { reviewId: 'rev-b', summary: 'B' },
      ],
    }
  );
  assert.ok(result);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.extra, []);
  assert.deepEqual(result.duplicated, ['rev-a']);
});

test('findReviewIdMismatch surfaces all three failure modes together', () => {
  const result = findReviewIdMismatch(
    ['rev-a', 'rev-b', 'rev-c'],
    {
      summaries: [
        { reviewId: 'rev-a', summary: 'A' },
        { reviewId: 'rev-a', summary: 'A-again' },
        { reviewId: 'rev-d', summary: 'D' },
      ],
    }
  );
  assert.ok(result);
  assert.deepEqual(result.missing, ['rev-b', 'rev-c']);
  assert.deepEqual(result.extra, ['rev-d']);
  assert.deepEqual(result.duplicated, ['rev-a']);
});
