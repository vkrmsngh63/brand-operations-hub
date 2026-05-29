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
  reviewRefLabel,
  validatePerCompetitorStructuredOutput,
  resolveReviewRefs,
  flattenCategoriesToSummaryString,
  type PerCompetitorStructuredAnalysis,
  PER_COMPETITOR_NONBULLETED_PROMPT_VERSION,
  PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT,
  buildPerCompetitorNonBulletedUserMessage,
  normalizeNonBulletedProse,
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
// Per-Competitor Comprehensive (bulleted) — W5 Session 3 (free-text v3),
// redesigned to STRUCTURED output in Fix Session D v4 (2026-05-31).

test('PER_COMPETITOR_BULLETED_PROMPT_VERSION is set to v4 (Fix Session D structured redesign)', () => {
  // Tripwire — when bumping prompt version (e.g., after a Phase 4
  // redirect), update this test + the version history comment in
  // prompts.ts. v4 (2026-05-31): structured categories → bullets →
  // reviewRefs output powering the 3-column traceability table per
  // director's 2026-05-30 §1 addendum.
  assert.equal(PER_COMPETITOR_BULLETED_PROMPT_VERSION, 'v4');
});

test('PER_COMPETITOR_BULLETED_SYSTEM_PROMPT v4 carries structured-output + critique-only + theme-emergent directives', () => {
  assert.ok(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT.length > 500);
  // v4 structured shape — categories / bullets / reviewRefs:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /"categories"/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /"reviewRefs"/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /R1.*R2.*R3/);
  // The critical attribution directive (the heart of the traceability feature):
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /List the labels of ALL reviews that support/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /reviewRefs must never be empty/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Never invent a label/);
  // v3-carried theme examples (now without the "##" markdown prefix):
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Product critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Fulfillment \/ shipping critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Company \/ seller critiques/);
  // Theme-emergent directive carries from v3:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /INVENT a new theme name/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /DO NOT limit critiques to those three categories/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Pricing \/ value critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Safety \/ reliability concerns/);
  // Critique-only directive carries:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Focus EXCLUSIVELY on critiques/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /positive signals of any kind/i);
  // Volume cues + length target + tone + output rules carry:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Multiple reviewers/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /5-15/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Third-person neutral/);
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Return ONLY the JSON object/);
  // Empty-corpus path now returns { "categories": [] }:
  assert.match(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /"categories": \[\]/);
});

test('PER_COMPETITOR_BULLETED_SYSTEM_PROMPT v4 dropped the v3 free-text "summary" string shape', () => {
  // Defends against accidental revert to the v3 free-text single-string
  // output (which had no review traceability).
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /"summary": "<theme-grouped/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /Echo each review's reviewId/);
  assert.doesNotMatch(PER_COMPETITOR_BULLETED_SYSTEM_PROMPT, /summaries\[\]/);
});

test('buildPerCompetitorBulletedUserMessage emits header + R-labeled reviews for citation', () => {
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
  assert.match(msg, /record in "reviewRefs" the labels/);
  // R-labels replace the old "Review N" headers so the model cites by label:
  assert.match(msg, /--- R1 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /--- R2 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /--- R3 \(5\/5 stars, Jane Doe, 2026-01-15\) ---/);
  assert.match(msg, /Loved the build quality/);
  assert.match(msg, /Strap broke within 3 months/);
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
  assert.match(msg, /--- R1 ---\nGreat product/);
  assert.doesNotMatch(msg, /\(.*Jane.*\)/);
});

test('reviewRefLabel is 1-based (index 0 → R1)', () => {
  assert.equal(reviewRefLabel(0), 'R1');
  assert.equal(reviewRefLabel(4), 'R5');
});

test('validatePerCompetitorStructuredOutput accepts a well-formed structured shape', () => {
  const ok = validatePerCompetitorStructuredOutput({
    categories: [
      {
        name: 'Product critiques',
        bullets: [
          { text: 'No noticeable effect on pain', reviewRefs: ['R1', 'R2'] },
          { text: 'No reduction in bruising', reviewRefs: ['R3'] },
        ],
      },
      {
        name: 'Safety / reliability concerns',
        bullets: [{ text: 'No thyroid-med warning', reviewRefs: ['R4'] }],
      },
    ],
  });
  assert.ok(ok);
  assert.equal(ok.categories.length, 2);
  assert.equal(ok.categories[0].name, 'Product critiques');
  assert.equal(ok.categories[0].bullets.length, 2);
  assert.deepEqual(ok.categories[0].bullets[0].reviewRefs, ['R1', 'R2']);
});

test('validatePerCompetitorStructuredOutput accepts empty categories (no critiques surfaced)', () => {
  const ok = validatePerCompetitorStructuredOutput({ categories: [] });
  assert.ok(ok);
  assert.equal(ok.categories.length, 0);
});

test('validatePerCompetitorStructuredOutput trims blanks + drops empty categories', () => {
  const ok = validatePerCompetitorStructuredOutput({
    categories: [
      {
        name: '  Product critiques  ',
        bullets: [
          { text: '  Real complaint  ', reviewRefs: ['R1'] },
          { text: '   ', reviewRefs: ['R2'] }, // blank bullet dropped
        ],
      },
      { name: 'All-blank category', bullets: [{ text: '', reviewRefs: [] }] }, // whole category dropped
    ],
  });
  assert.ok(ok);
  assert.equal(ok.categories.length, 1);
  assert.equal(ok.categories[0].name, 'Product critiques');
  assert.equal(ok.categories[0].bullets.length, 1);
  assert.equal(ok.categories[0].bullets[0].text, 'Real complaint');
});

test('validatePerCompetitorStructuredOutput rejects malformed shapes', () => {
  assert.equal(validatePerCompetitorStructuredOutput(null), null);
  assert.equal(validatePerCompetitorStructuredOutput('nope'), null);
  assert.equal(validatePerCompetitorStructuredOutput([]), null);
  assert.equal(validatePerCompetitorStructuredOutput({}), null); // no categories
  assert.equal(validatePerCompetitorStructuredOutput({ categories: 'x' }), null);
  // Category missing name.
  assert.equal(
    validatePerCompetitorStructuredOutput({ categories: [{ bullets: [] }] }),
    null
  );
  // Bullets not an array.
  assert.equal(
    validatePerCompetitorStructuredOutput({
      categories: [{ name: 'X', bullets: 'nope' }],
    }),
    null
  );
  // Bullet text not a string.
  assert.equal(
    validatePerCompetitorStructuredOutput({
      categories: [{ name: 'X', bullets: [{ text: 42, reviewRefs: [] }] }],
    }),
    null
  );
  // Old v3 free-text shape rejected (defends against stale dispatch).
  assert.equal(
    validatePerCompetitorStructuredOutput({ summary: '## Product\n- x' }),
    null
  );
});

test('resolveReviewRefs maps R-labels to ids by position, dedups, drops invalid/out-of-range', () => {
  const ids = ['id-a', 'id-b', 'id-c'];
  assert.deepEqual(resolveReviewRefs(['R1', 'R3'], ids), ['id-a', 'id-c']);
  // Dedup preserves first-seen order.
  assert.deepEqual(resolveReviewRefs(['R2', 'R2', 'R1'], ids), ['id-b', 'id-a']);
  // Out-of-range + malformed labels dropped silently.
  assert.deepEqual(resolveReviewRefs(['R4', 'R0', 'banana', 'R2'], ids), ['id-b']);
  // Whitespace + case tolerated.
  assert.deepEqual(resolveReviewRefs([' r1 ', 'R 2'], ids), ['id-a', 'id-b']);
  // Empty input → empty output.
  assert.deepEqual(resolveReviewRefs([], ids), []);
});

test('flattenCategoriesToSummaryString reproduces the legacy "## heading / - bullet" string', () => {
  const analysis: PerCompetitorStructuredAnalysis = {
    categories: [
      {
        name: 'Product critiques',
        bullets: [
          { text: 'No noticeable effect', reviewIds: ['id-a'] },
          { text: 'No bruise reduction', reviewIds: ['id-b'] },
        ],
      },
      {
        name: 'Safety / reliability concerns',
        bullets: [{ text: 'No thyroid warning', reviewIds: ['id-c'] }],
      },
    ],
  };
  const str = flattenCategoriesToSummaryString(analysis);
  assert.equal(
    str,
    '## Product critiques\n- No noticeable effect\n- No bruise reduction\n\n' +
      '## Safety / reliability concerns\n- No thyroid warning'
  );
});

test('flattenCategoriesToSummaryString emits the no-critiques sentinel for empty analysis', () => {
  assert.equal(
    flattenCategoriesToSummaryString({ categories: [] }),
    '- (no critiques surfaced across the corpus)'
  );
});

// ── Per-Competitor NON-bulleted (prose) — P-49 W5 Fix Session C ──────

test('PER_COMPETITOR_NONBULLETED_PROMPT_VERSION is v1', () => {
  assert.equal(PER_COMPETITOR_NONBULLETED_PROMPT_VERSION, 'v1');
});

test('PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT is non-empty + carries prose + theme + no-citations directives', () => {
  const p = PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT;
  assert.ok(p.length > 200);
  assert.match(p, /prose/i);
  assert.match(p, /theme/i);
  // moderate length guidance + no formal citations (design lock)
  assert.match(p, /2-4 short paragraphs/i);
  assert.match(p, /do not add formal citations/i);
  // critique-only + third-person voice carried over from the bulleted flow
  assert.match(p, /critique-only/i);
  assert.match(p, /third-person/i);
});

test('buildPerCompetitorNonBulletedUserMessage embeds product, platform, and the bulleted source', () => {
  const msg = buildPerCompetitorNonBulletedUserMessage({
    productName: 'Acme Widget Pro',
    platform: 'amazon',
    bulletedSummary:
      '## Product critiques\n- Strap breaks within months\n- Flimsy casing',
  });
  assert.match(msg, /Product: Acme Widget Pro/);
  assert.match(msg, /Platform: amazon/);
  assert.match(msg, /BULLETED CRITIQUE SUMMARY/);
  assert.match(msg, /Strap breaks within months/);
  // the bulleted source is trimmed into the message body
  assert.match(msg, /Flimsy casing/);
});

test('normalizeNonBulletedProse trims + strips a wrapping fence', () => {
  assert.equal(
    normalizeNonBulletedProse('```\nProduct shortcomings\nThe strap breaks.\n```'),
    'Product shortcomings\nThe strap breaks.'
  );
  assert.equal(
    normalizeNonBulletedProse('```text\nClean prose here.\n```'),
    'Clean prose here.'
  );
});

test('normalizeNonBulletedProse drops a leading "Here is" preamble line', () => {
  assert.equal(
    normalizeNonBulletedProse(
      "Here is the prose critique:\n\nProduct shortcomings\nThe casing is flimsy."
    ),
    'Product shortcomings\nThe casing is flimsy.'
  );
});

test('normalizeNonBulletedProse collapses 3+ blank lines to one blank line', () => {
  assert.equal(
    normalizeNonBulletedProse('Para one.\n\n\n\nPara two.'),
    'Para one.\n\nPara two.'
  );
});

test('normalizeNonBulletedProse returns empty string for whitespace-only input', () => {
  assert.equal(normalizeNonBulletedProse('   \n\n  '), '');
  assert.equal(normalizeNonBulletedProse(''), '');
});
