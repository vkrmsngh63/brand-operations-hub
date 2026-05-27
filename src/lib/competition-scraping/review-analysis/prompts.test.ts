// W#2 P-49 Workstream 5 — node:test cases for v1 Per-Review Summarize
// prompt builders + output validator + reviewId-mismatch detector.
// Session 3 adds Per-Competitor Comprehensive (bulleted) coverage.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { BatchableReview } from './batch-sizer.ts';
import {
  PER_REVIEW_SUMMARIZE_PROMPT_VERSION,
  PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
  buildPerReviewBatchUserMessage,
  validatePerReviewBatchOutput,
  findReviewIdMismatch,
  PER_COMPETITOR_BULLETED_PROMPT_VERSION,
  PER_COMPETITOR_BULLETED_SYSTEM_PROMPT,
  buildPerCompetitorBulletedUserMessage,
  validatePerCompetitorBulletedOutput,
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

// ────────────────────────────────────────────────────────────────────
// Per-Competitor Comprehensive (bulleted) — W5 Session 3.

test('PER_COMPETITOR_BULLETED_PROMPT_VERSION is set to v2 (post-Phase-4-redirect)', () => {
  // Tripwire — when bumping prompt version (e.g., after a Phase 4
  // redirect), update this test + the version history comment in
  // prompts.ts. v1 retired same day after director's Phase 4 redirect:
  // "focus to remain on the critiques of the company, product,
  // fulfillment claims, etc." Same versioning Pattern as W5 Session 2 FF#3.
  assert.equal(PER_COMPETITOR_BULLETED_PROMPT_VERSION, 'v2');
});

test('PER_COMPETITOR_BULLETED_SYSTEM_PROMPT v2 carries critique-only directives + 4 critique-category headings', () => {
  assert.ok(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT.length > 500);
  // v2 critique-category headings (replaces v1's positive/negative/
  // use-cases/notable structure):
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Product critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Fulfillment critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Company \/ seller critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Other notable critiques/);
  // Critique-only directive (explicit positives exclusion):
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Focus EXCLUSIVELY on critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Positive signals of any kind/);
  // Empty-themes-omit directive carries from v1:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Empty themes OMIT their heading/);
  // Bulleted-critical inherits from Per-Review v2:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /critical/i);
  // Volume cues + new length target (5-12, tightened from v1's 8-15):
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Multiple reviewers/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /5-12/);
  // Tone + output rules carried from v1:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Third-person neutral/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Return ONLY the JSON object/);
  // No-critiques fallback bullet:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /no critiques surfaced across the corpus/);
});

test('PER_COMPETITOR_BULLETED_SYSTEM_PROMPT v2 does NOT carry deprecated v1 headings (positives + use cases)', () => {
  // Defends against accidental partial revert to v1 structure during
  // future iterations. v1 had "## Positive signals" + "## Use cases"
  // + "## Negative signals" + "## Notable individual signals"; v2
  // replaces those entirely with critique-category headings.
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Positive signals/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Use cases/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Negative signals/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /## Notable individual signals/);
  // v1's length target (8-15) replaced by v2's 5-12:
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /8-15 bullets/);
});

test('PER_COMPETITOR_BULLETED_SYSTEM_PROMPT does NOT carry Per-Review-specific directives', () => {
  // Defends against accidental copy-paste leakage from Per-Review v2:
  // per-competitor output is ONE aggregated summary string, not an
  // array of per-review summaries, so phrases like "Echo each
  // review's reviewId" must NOT appear.
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Echo each review's reviewId/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /summaries\[\]/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /one entry per input review/);
});

test('buildPerCompetitorBulletedUserMessage emits header + raw review bodies', () => {
  const msg = buildPerCompetitorBulletedUserMessage({
    productName: 'Acme Widget Pro',
    platform: 'amazon',
    reviews: [
      makeReview('rev-r1', { body: 'Loved the build quality, worth every penny.' }),
      makeReview('rev-r2', { body: 'Strap broke within 3 months. Disappointed.' }),
      makeReview('rev-r3', { body: 'Use it daily for hiking. Holds up well.' }),
    ],
  });
  assert.match(msg, /Product: Acme Widget Pro/);
  assert.match(msg, /Platform: amazon/);
  assert.match(msg, /Reviews in corpus: 3/);
  assert.match(msg, /Aggregate the critical signals across all reviews/);
  assert.match(msg, /--- Review 1 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /--- Review 2 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /Loved the build quality/);
  assert.match(msg, /Strap broke within 3 months/);
  assert.match(msg, /Use it daily for hiking/);
});

test('buildPerCompetitorBulletedUserMessage does NOT echo reviewIds (one-aggregated-summary shape)', () => {
  // Per-Competitor output is ONE summary per call, so reviewIds don't
  // need to be echoed back — model just reads the bodies. This defends
  // against accidental copy-paste from the Per-Review builder.
  const msg = buildPerCompetitorBulletedUserMessage({
    productName: 'X',
    platform: 'walmart',
    reviews: [makeReview('rev-r1')],
  });
  assert.doesNotMatch(msg, /reviewId: rev-r1/);
  assert.doesNotMatch(msg, /Echo each reviewId/);
});

test('buildPerCompetitorBulletedUserMessage handles missing metadata cleanly', () => {
  const msg = buildPerCompetitorBulletedUserMessage({
    productName: 'X',
    platform: 'etsy',
    reviews: [
      makeReview('rev-r1', {
        reviewerName: null,
        starRating: null,
        reviewDate: null,
      }),
    ],
  });
  assert.match(msg, /--- Review 1 ---\nGreat product/);
  assert.doesNotMatch(msg, /\(.*Jane.*\)/);
});

test('validatePerCompetitorBulletedOutput accepts well-formed shape', () => {
  const ok = validatePerCompetitorBulletedOutput({
    summary: '## Positive signals\n- Reviewers praise battery life\n- Build quality holds up\n\n## Negative signals\n- Strap breaks within 3 months',
  });
  assert.ok(ok);
  assert.match(ok.summary, /## Positive signals/);
  assert.match(ok.summary, /Strap breaks/);
});

test('validatePerCompetitorBulletedOutput rejects malformed shapes', () => {
  assert.equal(validatePerCompetitorBulletedOutput(null), null);
  assert.equal(validatePerCompetitorBulletedOutput('not-an-object'), null);
  assert.equal(validatePerCompetitorBulletedOutput([]), null);
  // Missing summary field.
  assert.equal(validatePerCompetitorBulletedOutput({}), null);
  // summary is not a string.
  assert.equal(validatePerCompetitorBulletedOutput({ summary: 42 }), null);
  assert.equal(validatePerCompetitorBulletedOutput({ summary: null }), null);
  // Empty / whitespace-only summary.
  assert.equal(validatePerCompetitorBulletedOutput({ summary: '' }), null);
  assert.equal(validatePerCompetitorBulletedOutput({ summary: '   ' }), null);
  // Per-Review shape rejected (defends against handler dispatching to
  // the wrong validator).
  assert.equal(
    validatePerCompetitorBulletedOutput({
      summaries: [{ reviewId: 'r', summary: 'x' }],
    }),
    null
  );
});
