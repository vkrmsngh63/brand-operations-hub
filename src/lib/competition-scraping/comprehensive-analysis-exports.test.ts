import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMainTableExportMatrix,
  buildReviewsAnalysisExportMatrix,
  buildPrimerDynamicColumnLabels,
  buildExportFilename,
  buildExportZipFilename,
  type ExportFixedColumn,
  type MainExportUrl,
  type ReviewsAnalysisExportData,
} from './comprehensive-analysis-exports.ts';

const PLATFORM_LABELS: Record<string, string> = {
  amazon: 'Amazon',
  ebay: 'Ebay',
};

// A trimmed fixed-column list (subset of TABLE_COLUMN_DEFS) sufficient to
// exercise the value mapping + dynamic-column splice point.
const FIXED: ExportFixedColumn[] = [
  { id: 'platform', label: 'Platform' },
  { id: 'productName', label: 'Product Name' },
  { id: 'isSponsoredAd', label: 'Sponsored' },
  { id: 'numProductReviews', label: '# Reviews' },
  { id: 'overallCompetitorAnalysis', label: 'Overall Competitor Analysis' },
  { id: 'addedAt', label: 'Added On' },
];

function doc(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

function baseUrl(over: Partial<MainExportUrl> = {}): MainExportUrl {
  return {
    id: 'u1',
    platform: 'amazon',
    competitionCategory: null,
    type: null,
    productName: 'Widget',
    brandName: null,
    description1: null,
    description2: null,
    price: null,
    resultsPageRank: null,
    productStarRating: null,
    numProductReviews: 12,
    sellerStarRating: null,
    numSellerReviews: null,
    competitionScore: null,
    isSponsoredAd: false,
    url: 'https://example.com/p',
    scrapingStatus: 'COMPLETE',
    overallCompetitorAnalysis: doc('Strong brand presence'),
    addedAt: '2026-06-01T10:30:00.000Z',
    captures: { text: [], image: [], video: [] },
    ...over,
  };
}

test('main export: header is the fixed labels when no captures present', () => {
  const { matrix } = buildMainTableExportMatrix(FIXED, [baseUrl()], PLATFORM_LABELS);
  assert.deepEqual(matrix[0], [
    'Platform',
    'Product Name',
    'Sponsored',
    '# Reviews',
    'Overall Competitor Analysis',
    'Added On',
  ]);
});

test('main export: fixed cell values (platform label, Yes/No, number, tiptap, date slice)', () => {
  const { matrix } = buildMainTableExportMatrix(
    FIXED,
    [baseUrl({ isSponsoredAd: true })],
    PLATFORM_LABELS
  );
  assert.deepEqual(matrix[1], [
    'Amazon', // platform label, not the raw 'amazon'
    'Widget',
    'Yes', // isSponsoredAd true
    '12', // number → string
    'Strong brand presence', // tiptap → plain text
    '2026-06-01', // addedAt sliced to date
  ]);
});

test('main export: one row per competitor', () => {
  const { matrix } = buildMainTableExportMatrix(
    FIXED,
    [baseUrl(), baseUrl({ productName: 'Gadget' })],
    PLATFORM_LABELS
  );
  assert.equal(matrix.length, 3); // header + 2 rows
  assert.equal(matrix[2][1], 'Gadget');
});

test('primer dynamic labels: empty when no captures; value+analysis pair per category otherwise', () => {
  assert.deepEqual(buildPrimerDynamicColumnLabels([baseUrl()]), []);
  const url = baseUrl({
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'Holds up well',
          analysis: doc('Good'),
          sortOrder: 0,
        },
      ],
      image: [],
      video: [],
    },
  });
  // One text category → its value label then its analysis label, in order, and
  // it matches the labels the main export emits for the same column-pair.
  assert.deepEqual(buildPrimerDynamicColumnLabels([url]), [
    'Content Category: Durability',
    'Durability Analysis',
  ]);
});

test('main export: dynamic category pair columns splice in before Overall Competitor Analysis', () => {
  const url = baseUrl({
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'Holds up well',
          analysis: doc('Good'),
          sortOrder: 0,
        },
      ],
      image: [],
      video: [],
    },
  });
  const { matrix } = buildMainTableExportMatrix(FIXED, [url], PLATFORM_LABELS);
  const header = matrix[0];
  // Pair (value + analysis) sits immediately before Overall Competitor Analysis.
  const ocaIdx = header.indexOf('Overall Competitor Analysis');
  assert.equal(header[ocaIdx - 2], 'Content Category: Durability');
  assert.equal(header[ocaIdx - 1], 'Durability Analysis');
  // Cell values land in those columns.
  assert.equal(matrix[1][ocaIdx - 2], 'Holds up well');
  assert.equal(matrix[1][ocaIdx - 1], 'Good');
});

test('main export: multiple items in a category EXPAND into real rows (one item per row), fixed cells repeat', () => {
  const url = baseUrl({
    productName: 'Widget',
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'Holds up',
          analysis: doc('AnA'),
          sortOrder: 0,
        },
        {
          id: 't2',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'Breaks fast',
          analysis: doc('AnB'),
          sortOrder: 1,
        },
      ],
      image: [],
      video: [],
    },
  });
  const { matrix } = buildMainTableExportMatrix(FIXED, [url], PLATFORM_LABELS);
  // 2 items → 2 data rows (+ header).
  assert.equal(matrix.length, 3);
  const header = matrix[0];
  const valIdx = header.indexOf('Content Category: Durability');
  const nameIdx = header.indexOf('Product Name');
  // Each row carries its own item, in order.
  assert.equal(matrix[1][valIdx], 'Holds up');
  assert.equal(matrix[1][valIdx + 1], 'AnA');
  assert.equal(matrix[2][valIdx], 'Breaks fast');
  assert.equal(matrix[2][valIdx + 1], 'AnB');
  // Fixed cell (product name) repeats on BOTH rows.
  assert.equal(matrix[1][nameIdx], 'Widget');
  assert.equal(matrix[2][nameIdx], 'Widget');
});

test('main export: span = longest category list; shorter categories blank past their end', () => {
  const url = baseUrl({
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'D1',
          analysis: {},
          sortOrder: 0,
        },
        {
          id: 't2',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'D2',
          analysis: {},
          sortOrder: 1,
        },
        {
          id: 't3',
          competitorUrlId: 'u1',
          category: 'Comfort',
          body: 'C1',
          analysis: {},
          sortOrder: 2,
        },
      ],
      image: [],
      video: [],
    },
  });
  const { matrix } = buildMainTableExportMatrix(FIXED, [url], PLATFORM_LABELS);
  // span = max(2 Durability, 1 Comfort) = 2 → 2 rows.
  assert.equal(matrix.length, 3);
  const header = matrix[0];
  const durIdx = header.indexOf('Content Category: Durability');
  const comfIdx = header.indexOf('Content Category: Comfort');
  assert.equal(matrix[1][durIdx], 'D1');
  assert.equal(matrix[2][durIdx], 'D2');
  assert.equal(matrix[1][comfIdx], 'C1');
  assert.equal(matrix[2][comfIdx], ''); // Comfort has no 2nd item → blank
});

test('main export: wrappedColumnIndexes covers OCA + every dynamic column', () => {
  const url = baseUrl({
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: 'Durability',
          body: 'x',
          analysis: {},
          sortOrder: 0,
        },
      ],
      image: [],
      video: [],
    },
  });
  const { matrix, wrappedColumnIndexes } = buildMainTableExportMatrix(
    FIXED,
    [url],
    PLATFORM_LABELS
  );
  const header = matrix[0];
  // Expect: the dynamic value, dynamic analysis, and OCA columns are wrapped.
  for (const label of [
    'Content Category: Durability',
    'Durability Analysis',
    'Overall Competitor Analysis',
  ]) {
    assert.ok(
      wrappedColumnIndexes.includes(header.indexOf(label)),
      `${label} should be wrapped`
    );
  }
});

test('main export: blank category items are excluded from the dynamic columns', () => {
  const url = baseUrl({
    captures: {
      text: [
        {
          id: 't1',
          competitorUrlId: 'u1',
          category: '   ',
          body: 'no category',
          analysis: {},
          sortOrder: 0,
        },
      ],
      image: [],
      video: [],
    },
  });
  const { matrix } = buildMainTableExportMatrix(FIXED, [url], PLATFORM_LABELS);
  // No dynamic columns added → header is just the fixed labels.
  assert.equal(matrix[0].length, FIXED.length);
});

// ─── Competition Reviews Analysis export (Phase 2b-i) ──────────────────────

function reviewsData(
  over: Partial<ReviewsAnalysisExportData> = {}
): ReviewsAnalysisExportData {
  return {
    urls: [
      {
        id: 'u1',
        platform: 'amazon',
        competitionCategory: 'Cat A',
        type: 'Type X',
        productName: 'Widget',
        resultsPageRank: 3,
        competitionScore: 70,
        url: 'https://example.com/p',
      },
    ],
    reviewsByUrlId: {},
    perReviewSummaryByReviewId: {},
    compBulletedByUrlId: {},
    compNonBulletedByUrlId: {},
    ...over,
  };
}

test('reviews export: header matches the table columns + the expand-panel fields', () => {
  const { matrix } = buildReviewsAnalysisExportMatrix(reviewsData(), PLATFORM_LABELS);
  assert.deepEqual(matrix[0], [
    'Platform',
    'Category',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Reviews Summary',
    'Stars',
    'Review',
    'Reviewer',
    'Date',
    'Review Summary',
    'Comprehensive (bulleted)',
    'Comprehensive (non-bulleted)',
  ]);
});

test('reviews export: a competitor with no reviews still gets one row (blank review cols)', () => {
  const { matrix } = buildReviewsAnalysisExportMatrix(
    reviewsData({ compBulletedByUrlId: { u1: 'BULLETS' } }),
    PLATFORM_LABELS
  );
  assert.equal(matrix.length, 2); // header + 1 row
  assert.equal(matrix[1][0], 'Amazon'); // platform label
  assert.equal(matrix[1][7], ''); // Reviews Summary count blank (no reviews)
  assert.equal(matrix[1][8], ''); // Stars blank
  assert.equal(matrix[1][9], ''); // Review blank
  assert.equal(matrix[1][13], 'BULLETS'); // comp bulleted present
});

test('reviews export: reviews EXPAND into rows; per-competitor fields + count + AI summaries repeat', () => {
  const data = reviewsData({
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: 'Great', body: 'Loved it', reviewerName: 'Ann', reviewDate: '2026-05-01T00:00:00.000Z' },
        { id: 'r2', starRating: 2, title: null, body: 'Broke fast', reviewerName: null, reviewDate: null },
      ],
    },
    perReviewSummaryByReviewId: { r1: 'positive' }, // only r1 summarized → "1 of 2"
    compBulletedByUrlId: { u1: 'BULLETS' },
    compNonBulletedByUrlId: { u1: 'PROSE' },
  });
  const { matrix } = buildReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  assert.equal(matrix.length, 3); // header + 2 review rows
  // "Reviews Summary" count (col 7) repeats on every row of the competitor.
  assert.equal(matrix[1][7], '1 of 2 summarized');
  assert.equal(matrix[2][7], '1 of 2 summarized');
  // Row 1 (review r1): Stars(8) Review(9) Reviewer(10) Date(11) Summary(12)
  assert.equal(matrix[1][8], '5');
  assert.equal(matrix[1][9], 'Great. Loved it'); // mergeTitleAndBody adds the period
  assert.equal(matrix[1][10], 'Ann');
  assert.equal(matrix[1][11], '2026-05-01'); // date sliced to YYYY-MM-DD
  assert.equal(matrix[1][12], 'positive');
  // Row 2 (review r2 — no title → body alone; null reviewer/date → blank)
  assert.equal(matrix[2][8], '2');
  assert.equal(matrix[2][9], 'Broke fast');
  assert.equal(matrix[2][10], '');
  assert.equal(matrix[2][11], '');
  assert.equal(matrix[2][12], ''); // r2 not summarized → blank per-review summary
  // Per-competitor AI summaries repeat on BOTH rows (bulleted=13, non-bulleted=14).
  assert.equal(matrix[1][13], 'BULLETS');
  assert.equal(matrix[2][13], 'BULLETS');
  assert.equal(matrix[1][14], 'PROSE');
  assert.equal(matrix[2][14], 'PROSE');
  // Product name repeats.
  assert.equal(matrix[1][3], 'Widget');
  assert.equal(matrix[2][3], 'Widget');
});

// ─── "Without individual reviews" flat variant (2026-06-02-b) ──────────────

test('reviews export (without individual reviews): header drops every per-review column', () => {
  const { matrix, wrappedColumnIndexes } = buildReviewsAnalysisExportMatrix(
    reviewsData(),
    PLATFORM_LABELS,
    { withoutIndividualReviews: true }
  );
  assert.deepEqual(matrix[0], [
    'Platform',
    'Category',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Comprehensive (bulleted)',
    'Comprehensive (non-bulleted)',
  ]);
  // Comprehensive bulleted (7) + non-bulleted (8) wrap.
  assert.deepEqual(wrappedColumnIndexes, [7, 8]);
});

test('reviews export (without individual reviews): one row per competitor — reviews do NOT expand', () => {
  const data = reviewsData({
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: 'Great', body: 'Loved it', reviewerName: 'Ann', reviewDate: null },
        { id: 'r2', starRating: 2, title: null, body: 'Broke', reviewerName: null, reviewDate: null },
      ],
    },
    compBulletedByUrlId: { u1: 'BULLETS' },
    compNonBulletedByUrlId: { u1: 'PROSE' },
  });
  const { matrix } = buildReviewsAnalysisExportMatrix(data, PLATFORM_LABELS, {
    withoutIndividualReviews: true,
  });
  assert.equal(matrix.length, 2); // header + 1 competitor row (2 reviews collapsed)
  assert.equal(matrix[1][0], 'Amazon');
  assert.equal(matrix[1][3], 'Widget');
  assert.equal(matrix[1][7], 'BULLETS');
  assert.equal(matrix[1][8], 'PROSE');
});

// ─── Reviews Analysis By Category / By Type exports (Phase 2b-ii) ──────────

import {
  buildCategoryReviewsAnalysisExportMatrix,
  buildTypeReviewsAnalysisExportMatrix,
  clampToExcelCellLimit,
  EXCEL_MAX_CELL_LENGTH,
  type GroupedReviewsAnalysisExportData,
} from './comprehensive-analysis-exports.ts';
import type { CategorySourceReviewMeta } from './reviews-traceability.ts';

function groupedUrl(
  id: string,
  over: Partial<GroupedReviewsAnalysisExportData['urls'][number]> = {}
): GroupedReviewsAnalysisExportData['urls'][number] {
  return {
    id,
    platform: 'amazon',
    competitionCategory: 'Grills',
    type: 'Gas',
    productName: `Product ${id}`,
    resultsPageRank: null,
    competitionScore: null,
    url: `https://example.com/${id}`,
    ...over,
  };
}

function groupedData(
  over: Partial<GroupedReviewsAnalysisExportData> = {}
): GroupedReviewsAnalysisExportData {
  return {
    urls: [groupedUrl('u1')],
    reviewsByUrlId: {},
    perReviewSummaryByReviewId: {},
    compBulletedByUrlId: {},
    compNonBulletedByUrlId: {},
    groupBulletedByKey: {},
    groupNonBulletedByKey: {},
    reviewMetaById: new Map<string, CategorySourceReviewMeta>(),
    ...over,
  };
}

test('grouped export (category): header matches the on-screen By-Category table columns/order', () => {
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData(),
    PLATFORM_LABELS
  );
  assert.deepEqual(matrix[0], [
    'Category',
    'Platform',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Stars',
    'Reviews Summary',
    'Competitor Comprehensive (bulleted)',
    'Competitor Comprehensive (non-bulleted)',
    'Category Comprehensive (bulleted)',
    'Source Reviews',
    'Category Comprehensive (non-bulleted)',
  ]);
});

test('grouped export (type): header matches the By-Type table — Type↔Category swap + type wording', () => {
  const { matrix } = buildTypeReviewsAnalysisExportMatrix(groupedData(), PLATFORM_LABELS);
  assert.equal(matrix[0][0], 'Type'); // grouping column first
  assert.equal(matrix[0][2], 'Category'); // plain category at position 3
  assert.equal(matrix[0][11], 'Type Comprehensive (bulleted)');
  assert.equal(matrix[0][12], 'Source Reviews');
  assert.equal(matrix[0][13], 'Type Comprehensive (non-bulleted)');
});

test('grouped export: a competitor with no reviews + no category summary → one competitor row', () => {
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData({ compBulletedByUrlId: { u1: 'COMP-BULLETS' } }),
    PLATFORM_LABELS
  );
  assert.equal(matrix.length, 2); // header + 1 competitor row (no summary rows)
  assert.equal(matrix[1][0], 'Grills'); // category value
  assert.equal(matrix[1][1], 'Amazon'); // platform label
  assert.equal(matrix[1][7], ''); // Stars blank
  assert.equal(matrix[1][8], ''); // Reviews Summary blank
  assert.equal(matrix[1][9], 'COMP-BULLETS'); // Competitor Comprehensive (bulleted)
  assert.equal(matrix[1][12], ''); // Source Reviews blank on competitor rows
});

test('grouped export: summary rows come first, then competitor review rows expand', () => {
  const data = groupedData({
    urls: [
      groupedUrl('u1', { productName: 'Weber X' }),
      groupedUrl('u2', { productName: 'Acme Q' }),
    ],
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: 'Great heat', body: 'Sears well', reviewerName: null, reviewDate: null },
        { id: 'r2', starRating: 2, title: null, body: 'Lid broke', reviewerName: null, reviewDate: null },
      ],
      u2: [{ id: 'r3', starRating: 4, title: null, body: 'Solid build', reviewerName: null, reviewDate: null }],
    },
    perReviewSummaryByReviewId: { r1: 'praises heat', r2: 'lid complaint', r3: 'sturdy' },
    compBulletedByUrlId: { u1: 'WEBER-BULLETS', u2: 'ACME-BULLETS' },
    // bulleted summary text present but no per-complaint categories → one banner row
    groupBulletedByKey: { Grills: { summary: 'CATEGORY-BULLETS', categories: [] } },
    groupNonBulletedByKey: { Grills: 'CATEGORY-PROSE' },
  });
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  // header + 1 banner/summary row + 2 (u1) + 1 (u2) competitor review rows
  assert.equal(matrix.length, 5);
  // Row 1 = the category summary row (banner): bulleted + non-bulleted filled,
  // competitor cells blank.
  assert.equal(matrix[1][0], 'Grills');
  assert.equal(matrix[1][11], 'CATEGORY-BULLETS'); // Category Comprehensive (bulleted)
  assert.equal(matrix[1][13], 'CATEGORY-PROSE'); // Category Comprehensive (non-bulleted)
  assert.equal(matrix[1][7], ''); // Stars blank on summary row
  // Rows 2-4 = competitor review rows: Stars + Reviews Summary per review;
  // Competitor Comprehensive (bulleted) at col 9; category-level cells blank.
  assert.equal(matrix[2][7], '5');
  assert.equal(matrix[2][8], 'praises heat'); // Reviews Summary (per-review)
  assert.equal(matrix[3][7], '2');
  assert.equal(matrix[2][9], 'WEBER-BULLETS');
  assert.equal(matrix[3][9], 'WEBER-BULLETS');
  assert.equal(matrix[4][9], 'ACME-BULLETS');
  for (let r = 2; r <= 4; r++) {
    assert.equal(matrix[r][11], ''); // category-level cells blank on competitor rows
    assert.equal(matrix[r][12], '');
    assert.equal(matrix[r][13], '');
  }
});

test('grouped export: groups sort alphabetically; uncategorized bucket last; all rows kept', () => {
  const data = groupedData({
    urls: [
      groupedUrl('u1', { competitionCategory: 'Smokers' }),
      groupedUrl('u2', { competitionCategory: null }), // uncategorized
      groupedUrl('u3', { competitionCategory: 'Grills' }),
    ],
  });
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  // header + 3 competitor rows (no summaries → no banner rows)
  assert.equal(matrix.length, 4);
  assert.equal(matrix[1][0], 'Grills'); // alphabetical first
  assert.equal(matrix[2][0], 'Smokers');
  assert.equal(matrix[3][0], ''); // uncategorized value is empty, pinned last
});

test('grouped export: each source review behind a complaint is its OWN summary row in Source Reviews', () => {
  const reviewMetaById = new Map<string, CategorySourceReviewMeta>([
    ['r1', { starRating: 2, title: 'Lid', body: 'broke', productName: 'Weber X', urlId: 'u1' }],
    ['r9', { starRating: 1, title: null, body: 'flimsy lid', productName: 'Acme Q', urlId: 'u2' }],
  ]);
  const data = groupedData({
    urls: [groupedUrl('u1', { productName: 'Weber X' }), groupedUrl('u2', { productName: 'Acme Q' })],
    reviewMetaById,
    groupBulletedByKey: {
      Grills: {
        summary: 'CATEGORY-BULLETS',
        categories: [
          { name: 'Build quality', bullets: [{ text: 'Flimsy lid', reviewIds: ['r1', 'r9'] }] },
        ],
      },
    },
  });
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  // header + 2 summary rows (one per source review) + 2 competitor rows
  assert.equal(matrix.length, 5);
  // Summary rows come first. Source Reviews column = "<complaint> — <product> ★<stars>: <text>".
  assert.equal(matrix[1][0], 'Grills'); // grouping column carried on banner rows
  assert.equal(matrix[1][11], 'CATEGORY-BULLETS'); // bulleted summary repeats down
  assert.match(matrix[1][12], /Flimsy lid — Weber X ★2: Lid\. broke/);
  assert.match(matrix[2][12], /Flimsy lid — Acme Q ★1: flimsy lid/);
  // Summary rows leave the competitor columns blank.
  assert.equal(matrix[1][1], ''); // Platform blank
  assert.equal(matrix[1][7], ''); // Stars blank
  // Competitor rows (3-4) leave Source Reviews blank.
  assert.equal(matrix[3][12], '');
  assert.equal(matrix[4][12], '');
});

test('grouped export: wrapped column indexes cover the long-text columns', () => {
  const { wrappedColumnIndexes } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData(),
    PLATFORM_LABELS
  );
  // Reviews Summary(8), Competitor bulleted(9), Competitor non-bulleted(10),
  // Category bulleted(11), Source Reviews(12), Category non-bulleted(13).
  assert.deepEqual(wrappedColumnIndexes, [8, 9, 10, 11, 12, 13]);
});

// ─── "Without individual reviews" grouped variants (2026-06-02-b) ──────────

test('grouped export (category, without individual reviews): drops Stars / Reviews Summary / Source Reviews', () => {
  const { matrix, wrappedColumnIndexes } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData(),
    PLATFORM_LABELS,
    { withoutIndividualReviews: true }
  );
  assert.deepEqual(matrix[0], [
    'Category',
    'Platform',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Competitor Comprehensive (bulleted)',
    'Competitor Comprehensive (non-bulleted)',
    'Category Comprehensive (bulleted)',
    'Category Comprehensive (non-bulleted)',
  ]);
  // Wrapped: competitor bulleted(7), competitor non-bulleted(8), category
  // bulleted(9), category non-bulleted(10) — Source Reviews is gone.
  assert.deepEqual(wrappedColumnIndexes, [7, 8, 9, 10]);
});

test('grouped export (type, without individual reviews): Type↔Category swap preserved; review cols dropped', () => {
  const { matrix } = buildTypeReviewsAnalysisExportMatrix(groupedData(), PLATFORM_LABELS, {
    withoutIndividualReviews: true,
  });
  assert.equal(matrix[0][0], 'Type');
  assert.equal(matrix[0][2], 'Category');
  assert.ok(!matrix[0].includes('Stars'));
  assert.ok(!matrix[0].includes('Reviews Summary'));
  assert.ok(!matrix[0].includes('Source Reviews'));
  assert.equal(matrix[0][9], 'Type Comprehensive (bulleted)');
  assert.equal(matrix[0][10], 'Type Comprehensive (non-bulleted)');
});

test('grouped export (without individual reviews): one banner row per group (summaries only) + one row per competitor', () => {
  const data = groupedData({
    urls: [
      groupedUrl('u1', { productName: 'Weber X' }),
      groupedUrl('u2', { productName: 'Acme Q' }),
    ],
    // Two reviews on u1 + per-complaint source reviews would normally expand —
    // here they must NOT, because the trimmed file has no per-review/source cols.
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: null, body: 'Sears well', reviewerName: null, reviewDate: null },
        { id: 'r2', starRating: 2, title: null, body: 'Lid broke', reviewerName: null, reviewDate: null },
      ],
    },
    compBulletedByUrlId: { u1: 'WEBER-BULLETS', u2: 'ACME-BULLETS' },
    groupBulletedByKey: {
      Grills: {
        summary: 'CATEGORY-BULLETS',
        categories: [{ name: 'Build', bullets: [{ text: 'Flimsy lid', reviewIds: ['r2'] }] }],
      },
    },
    groupNonBulletedByKey: { Grills: 'CATEGORY-PROSE' },
  });
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS, {
    withoutIndividualReviews: true,
  });
  // header + 1 banner row + 1 row each for u1 + u2 (reviews collapsed)
  assert.equal(matrix.length, 4);
  // Banner row: category summaries present, competitor columns blank.
  assert.equal(matrix[1][0], 'Grills');
  assert.equal(matrix[1][9], 'CATEGORY-BULLETS'); // Category Comprehensive (bulleted)
  assert.equal(matrix[1][10], 'CATEGORY-PROSE'); // Category Comprehensive (non-bulleted)
  assert.equal(matrix[1][3], ''); // Product Name blank on banner row
  // Competitor rows: identity + competitor summaries; category cells blank.
  assert.equal(matrix[2][3], 'Weber X');
  assert.equal(matrix[2][7], 'WEBER-BULLETS'); // Competitor Comprehensive (bulleted)
  assert.equal(matrix[3][3], 'Acme Q');
  assert.equal(matrix[3][7], 'ACME-BULLETS');
  assert.equal(matrix[2][9], ''); // category-level cells blank on competitor rows
  assert.equal(matrix[3][9], '');
});

test('clampToExcelCellLimit: short strings pass through; oversized are clamped to the limit', () => {
  assert.equal(clampToExcelCellLimit(''), '');
  assert.equal(clampToExcelCellLimit('hello'), 'hello');
  const atLimit = 'a'.repeat(EXCEL_MAX_CELL_LENGTH);
  assert.equal(clampToExcelCellLimit(atLimit), atLimit); // exactly at limit untouched
  const over = 'b'.repeat(EXCEL_MAX_CELL_LENGTH + 5000);
  const clamped = clampToExcelCellLimit(over);
  assert.equal(clamped.length, EXCEL_MAX_CELL_LENGTH); // never exceeds the limit
  assert.match(clamped, /truncated/);
});

test('buildExportFilename / buildExportZipFilename: slug + date', () => {
  assert.equal(
    buildExportFilename('competition-content-overview', 'My Project!', '2026-06-02'),
    'competition-content-overview-my-project-2026-06-02.xlsx'
  );
  assert.equal(
    buildExportZipFilename('My Project!', '2026-06-02'),
    'comprehensive-competitive-analysis-files-my-project-2026-06-02.zip'
  );
});
