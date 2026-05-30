// W#2 P-49 W5 Fix Session D (2026-05-31) — node:test coverage for the
// 3-column traceability table helpers (parse + row-build + title/body merge).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseTraceabilityAnalysis,
  validateCategoriesInput,
  buildTraceabilityRows,
  mergeReviewTitleBody,
  editCategoryName,
  editBulletText,
  deleteCategory,
  deleteBullets,
  deleteSourceReview,
  selectBulletedAnalysisRow,
  type TraceabilityAnalysis,
  type TraceabilityReview,
  type PerProductAnalysisRow,
} from './reviews-traceability.ts';

// Shared fixture for the FU-1 mutation tests — two categories, three bullets.
function sampleAnalysis(): TraceabilityAnalysis {
  return {
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
  };
}

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

test('buildTraceabilityRows tags each row with its category + bullet index', () => {
  const rows = buildTraceabilityRows(sampleAnalysis(), new Map());
  assert.deepEqual(
    rows.map((r) => [r.categoryIndex, r.bulletIndex]),
    [
      [0, 0],
      [0, 1],
      [1, 0],
    ]
  );
});

// ─── FU-1 / Q11 — validateCategoriesInput (server PATCH validator) ─────────

test('validateCategoriesInput returns null only for non-array input', () => {
  assert.equal(validateCategoriesInput(null), null);
  assert.equal(validateCategoriesInput(undefined), null);
  assert.equal(validateCategoriesInput('x'), null);
  assert.equal(validateCategoriesInput({}), null);
});

test('validateCategoriesInput tolerates an empty array (legal delete-all)', () => {
  assert.deepEqual(validateCategoriesInput([]), []);
  // An array of only-malformed entries normalizes to empty, NOT null.
  assert.deepEqual(
    validateCategoriesInput([{ name: '   ', bullets: [] }, { bogus: true }]),
    []
  );
});

test('validateCategoriesInput normalizes + filters defensively', () => {
  const out = validateCategoriesInput([
    {
      name: '  Kept  ',
      bullets: [
        { text: '  trimmed  ', reviewIds: ['id-a', 5, '', 'id-b'] },
        { text: '   ', reviewIds: ['x'] }, // blank text dropped
      ],
    },
    { name: 'Empty after filtering', bullets: [{ text: '  ', reviewIds: [] }] }, // 0 valid bullets → dropped
  ]);
  assert.ok(out);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, 'Kept');
  assert.equal(out[0].bullets.length, 1);
  assert.equal(out[0].bullets[0].text, 'trimmed');
  assert.deepEqual(out[0].bullets[0].reviewIds, ['id-a', 'id-b']);
});

// ─── FU-1 / Q11 — edit mutations ───────────────────────────────────────────

test('editCategoryName renames the targeted category; blank name is a no-op', () => {
  const a = sampleAnalysis();
  const renamed = editCategoryName(a, 1, '  Safety / reliability  ');
  assert.equal(renamed.categories[1].name, 'Safety / reliability');
  assert.equal(renamed.categories[0].name, 'Product critiques'); // untouched
  // Original is not mutated.
  assert.equal(a.categories[1].name, 'Safety concerns');
  // Blank rename is ignored.
  assert.equal(editCategoryName(a, 0, '   '), a);
});

test('editBulletText edits the targeted complaint; blank text is a no-op', () => {
  const a = sampleAnalysis();
  const edited = editBulletText(a, 0, 1, '  Bruising unchanged  ');
  assert.equal(edited.categories[0].bullets[1].text, 'Bruising unchanged');
  assert.equal(edited.categories[0].bullets[0].text, 'No effect'); // untouched
  // reviewIds preserved.
  assert.deepEqual(edited.categories[0].bullets[1].reviewIds, ['id-c']);
  assert.equal(editBulletText(a, 0, 0, '  '), a);
});

// ─── FU-1 / Q11 — delete mutations ─────────────────────────────────────────

test('deleteCategory removes the whole category group', () => {
  const out = deleteCategory(sampleAnalysis(), 0);
  assert.equal(out.categories.length, 1);
  assert.equal(out.categories[0].name, 'Safety concerns');
});

test('deleteBullets removes a single complaint row', () => {
  const out = deleteBullets(sampleAnalysis(), [
    { categoryIndex: 0, bulletIndex: 0 },
  ]);
  assert.equal(out.categories[0].bullets.length, 1);
  assert.equal(out.categories[0].bullets[0].text, 'No bruise reduction');
  assert.equal(out.categories.length, 2); // category 0 still has a bullet
});

test('deleteBullets supports bulk + drops a category left with zero bullets', () => {
  // Delete both bullets of category 0 + the lone bullet of category 1.
  const out = deleteBullets(sampleAnalysis(), [
    { categoryIndex: 0, bulletIndex: 0 },
    { categoryIndex: 0, bulletIndex: 1 },
    { categoryIndex: 1, bulletIndex: 0 },
  ]);
  assert.equal(out.categories.length, 0); // every category emptied → dropped
});

test('deleteBullets dropping all but one keeps the surviving category', () => {
  const out = deleteBullets(sampleAnalysis(), [
    { categoryIndex: 0, bulletIndex: 0 },
    { categoryIndex: 0, bulletIndex: 1 },
  ]);
  assert.equal(out.categories.length, 1);
  assert.equal(out.categories[0].name, 'Safety concerns');
});

test('deleteSourceReview detaches one review but keeps the complaint', () => {
  const out = deleteSourceReview(sampleAnalysis(), 0, 0, 'id-a');
  assert.deepEqual(out.categories[0].bullets[0].reviewIds, ['id-b']);
  // The complaint itself survives even if its last source is removed.
  const emptied = deleteSourceReview(out, 0, 0, 'id-b');
  assert.deepEqual(emptied.categories[0].bullets[0].reviewIds, []);
  assert.equal(emptied.categories[0].bullets.length, 2);
});

// ─── selectBulletedAnalysisRow (the non-bulleted-shadowing fix) ────────────

const STRUCTURED = { categories: [{ name: 'C', bullets: [{ text: 'b', reviewIds: ['r1'] }] }] };
const PROSE = { flow: 'per-competitor-nonbulleted', summary: 'prose…' };

function rows(...defs: Array<Partial<PerProductAnalysisRow>>): PerProductAnalysisRow[] {
  return defs.map((d, i) => ({
    id: d.id ?? `row-${i}`,
    level: d.level ?? 'PER_PRODUCT',
    urlId: d.urlId ?? 'u1',
    analysisJson: d.analysisJson ?? STRUCTURED,
  }));
}

test('selectBulletedAnalysisRow returns null when there are no rows', () => {
  assert.equal(selectBulletedAnalysisRow([], 'u1'), null);
});

test('selectBulletedAnalysisRow picks the bulleted row for the URL', () => {
  const picked = selectBulletedAnalysisRow(rows({ id: 'bulleted', analysisJson: STRUCTURED }), 'u1');
  assert.equal(picked?.id, 'bulleted');
  assert.deepEqual(picked?.analysisJson, STRUCTURED);
});

test('selectBulletedAnalysisRow skips the non-bulleted prose row even when it ran last', () => {
  // Ascending runAt order: bulleted first, prose most-recent. The prose row
  // must NOT win — that was the bug that blanked the table.
  const picked = selectBulletedAnalysisRow(
    rows(
      { id: 'bulleted', analysisJson: STRUCTURED },
      { id: 'prose', analysisJson: PROSE }
    ),
    'u1'
  );
  assert.equal(picked?.id, 'bulleted');
});

test('selectBulletedAnalysisRow returns the LATEST bulleted row when several exist', () => {
  const picked = selectBulletedAnalysisRow(
    rows(
      { id: 'old', analysisJson: STRUCTURED },
      { id: 'new', analysisJson: STRUCTURED }
    ),
    'u1'
  );
  assert.equal(picked?.id, 'new');
});

test('selectBulletedAnalysisRow ignores other URLs and non-PER_PRODUCT rows', () => {
  const picked = selectBulletedAnalysisRow(
    rows(
      { id: 'other-url', urlId: 'u2', analysisJson: STRUCTURED },
      { id: 'per-review', level: 'PER_REVIEW', analysisJson: STRUCTURED },
      { id: 'mine', analysisJson: STRUCTURED }
    ),
    'u1'
  );
  assert.equal(picked?.id, 'mine');
});

test('selectBulletedAnalysisRow returns null when the only row for the URL is prose', () => {
  // No bulleted row exists yet → nothing feeds the table (it stays hidden),
  // rather than falling back to the prose row.
  const picked = selectBulletedAnalysisRow(rows({ id: 'prose', analysisJson: PROSE }), 'u1');
  assert.equal(picked, null);
});

test('selectBulletedAnalysisRow keeps a legacy flat-summary bulleted row (no flow field)', () => {
  // Pre-v4 bulleted rows stored { summary } with no flow marker; they are NOT
  // the non-bulleted prose row, so they remain eligible (legacy-text fallback).
  const legacy = { summary: 'flat bullet text' };
  const picked = selectBulletedAnalysisRow(rows({ id: 'legacy', analysisJson: legacy }), 'u1');
  assert.equal(picked?.id, 'legacy');
});
