// W#2 P-49 W5 Fix Session D (2026-05-31) — node:test coverage for the
// 3-column traceability table helpers (parse + row-build + title/body merge).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTraceabilityAnalysis,
  buildTraceabilityRows,
  mergeReviewTitleBody,
  type TraceabilityReview,
} from './reviews-traceability.ts';

test('parseTraceabilityAnalysis accepts a well-formed structured row', () => {
  const parsed = parseTraceabilityAnalysis({
    summary: '## Product critiques\n- x', // legacy field tolerated alongside
    categories: [
      {
        name: 'Product critiques',
        bullets: [
          { text: 'No effect on pain', reviewIds: ['id-a', 'id-b'] },
          { text: 'No bruise reduction', reviewIds: ['id-c'] },
        ],
      },
    ],
  });
  assert.ok(parsed);
  assert.equal(parsed.categories.length, 1);
  assert.equal(parsed.categories[0].bullets.length, 2);
  assert.deepEqual(parsed.categories[0].bullets[0].reviewIds, ['id-a', 'id-b']);
});

test('parseTraceabilityAnalysis returns null for the legacy { summary } shape', () => {
  assert.equal(
    parseTraceabilityAnalysis({ summary: '## Themes\n- legacy bullet' }),
    null
  );
});

test('parseTraceabilityAnalysis returns null for empty / malformed input', () => {
  assert.equal(parseTraceabilityAnalysis(null), null);
  assert.equal(parseTraceabilityAnalysis('nope'), null);
  assert.equal(parseTraceabilityAnalysis({}), null);
  assert.equal(parseTraceabilityAnalysis({ categories: [] }), null); // no usable categories
  assert.equal(parseTraceabilityAnalysis({ categories: 'x' }), null);
});

test('parseTraceabilityAnalysis drops malformed categories/bullets defensively', () => {
  const parsed = parseTraceabilityAnalysis({
    categories: [
      { name: '   ', bullets: [{ text: 'x', reviewIds: [] }] }, // blank name dropped
      { name: 'Good', bullets: 'nope' }, // bullets not array dropped
      {
        name: 'Real',
        bullets: [
          { text: '  ', reviewIds: ['id-a'] }, // blank text dropped
          { text: 'Kept', reviewIds: ['id-a', 5, '', 'id-b'] }, // non-string ids filtered
        ],
      },
    ],
  });
  assert.ok(parsed);
  assert.equal(parsed.categories.length, 1);
  assert.equal(parsed.categories[0].name, 'Real');
  assert.equal(parsed.categories[0].bullets.length, 1);
  assert.deepEqual(parsed.categories[0].bullets[0].reviewIds, ['id-a', 'id-b']);
});

test('mergeReviewTitleBody mirrors the "title. body" rule', () => {
  assert.equal(mergeReviewTitleBody('Great', 'Loved it'), 'Great. Loved it');
  assert.equal(mergeReviewTitleBody('Bad!', 'Broke fast'), 'Bad! Broke fast');
  assert.equal(mergeReviewTitleBody(null, 'Body only'), 'Body only');
  assert.equal(mergeReviewTitleBody('Title only', null), 'Title only');
  assert.equal(mergeReviewTitleBody('  ', '  '), '');
});

test('buildTraceabilityRows merges category cells (rowspan) + resolves reviews', () => {
  const reviewsById = new Map<string, TraceabilityReview>([
    ['id-a', { starRating: 1, title: 'No good', body: 'Did nothing' }],
    ['id-b', { starRating: 2, title: null, body: 'Useless' }],
    ['id-c', { starRating: 1, title: null, body: 'Still bruised' }],
  ]);
  const rows = buildTraceabilityRows(
    {
      categories: [
        {
          name: 'Product critiques',
          bullets: [
            { text: 'No effect', reviewIds: ['id-a', 'id-b'] },
            { text: 'No bruise reduction', reviewIds: ['id-c'] },
          ],
        },
        {
          name: 'Safety concerns',
          bullets: [{ text: 'No warning label', reviewIds: ['id-a'] }],
        },
      ],
    },
    reviewsById
  );
  assert.equal(rows.length, 3);
  // First bullet of category 1 carries the rowspan'd category cell.
  assert.equal(rows[0].categoryName, 'Product critiques');
  assert.equal(rows[0].categoryRowSpan, 2);
  assert.equal(rows[0].sources.length, 2);
  assert.equal(rows[0].sources[0].text, 'No good. Did nothing');
  assert.equal(rows[0].sources[0].starRating, 1);
  // Second bullet omits the category cell (covered by rowspan above).
  assert.equal(rows[1].categoryName, null);
  assert.equal(rows[1].categoryRowSpan, 0);
  // New category restarts the rowspan.
  assert.equal(rows[2].categoryName, 'Safety concerns');
  assert.equal(rows[2].categoryRowSpan, 1);
});

test('buildTraceabilityRows renders a placeholder for deleted reviews', () => {
  const rows = buildTraceabilityRows(
    {
      categories: [
        {
          name: 'X',
          bullets: [{ text: 'cites a gone review', reviewIds: ['ghost'] }],
        },
      ],
    },
    new Map()
  );
  assert.equal(rows[0].sources.length, 1);
  assert.equal(rows[0].sources[0].missing, true);
  assert.equal(rows[0].sources[0].starRating, null);
  assert.match(rows[0].sources[0].text, /no longer available/);
});
