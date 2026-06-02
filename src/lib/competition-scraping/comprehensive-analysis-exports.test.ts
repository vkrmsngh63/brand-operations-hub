import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMainTableExportMatrix,
  buildReviewsAnalysisExportMatrix,
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

test('reviews export: header shape', () => {
  const { matrix } = buildReviewsAnalysisExportMatrix(reviewsData(), PLATFORM_LABELS);
  assert.deepEqual(matrix[0], [
    'Platform',
    'Category',
    'Type',
    'Product Name',
    'Results Rank',
    'Comp. Score',
    'URL',
    'Stars',
    'Review',
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
  assert.equal(matrix[1][7], ''); // Stars blank
  assert.equal(matrix[1][8], ''); // Review blank
  assert.equal(matrix[1][10], 'BULLETS'); // comp bulleted present
});

test('reviews export: reviews EXPAND into rows; per-competitor fields + AI summaries repeat', () => {
  const data = reviewsData({
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: 'Great', body: 'Loved it' },
        { id: 'r2', starRating: 2, title: null, body: 'Broke fast' },
      ],
    },
    perReviewSummaryByReviewId: { r1: 'positive', r2: 'durability issue' },
    compBulletedByUrlId: { u1: 'BULLETS' },
    compNonBulletedByUrlId: { u1: 'PROSE' },
  });
  const { matrix } = buildReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  assert.equal(matrix.length, 3); // header + 2 review rows
  // Row 1 (review r1)
  assert.equal(matrix[1][7], '5');
  assert.equal(matrix[1][8], 'Great. Loved it'); // mergeTitleAndBody adds the period
  assert.equal(matrix[1][9], 'positive');
  // Row 2 (review r2 — no title → body alone)
  assert.equal(matrix[2][7], '2');
  assert.equal(matrix[2][8], 'Broke fast');
  assert.equal(matrix[2][9], 'durability issue');
  // Per-competitor AI summaries repeat on BOTH rows.
  assert.equal(matrix[1][10], 'BULLETS');
  assert.equal(matrix[2][10], 'BULLETS');
  assert.equal(matrix[1][11], 'PROSE');
  assert.equal(matrix[2][11], 'PROSE');
  // Product name repeats.
  assert.equal(matrix[1][3], 'Widget');
  assert.equal(matrix[2][3], 'Widget');
});

// ─── Reviews Analysis By Category / By Type exports (Phase 2b-ii) ──────────

import {
  buildCategoryReviewsAnalysisExportMatrix,
  buildTypeReviewsAnalysisExportMatrix,
  formatSourceReviewsCell,
  type GroupedReviewsAnalysisExportData,
} from './comprehensive-analysis-exports.ts';
import type {
  CategorySourceReviewMeta,
  CategorySourceTheme,
} from './reviews-traceability.ts';

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

test('grouped export (category): header order with Source Reviews + Review columns', () => {
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
    'Review',
    'Reviews Summary',
    'Competitor Comprehensive (bulleted)',
    'Competitor Comprehensive (non-bulleted)',
    'Category Comprehensive (bulleted)',
    'Source Reviews',
    'Category Comprehensive (non-bulleted)',
  ]);
});

test('grouped export (type): Type↔Category column swap + type-worded group labels', () => {
  const { matrix } = buildTypeReviewsAnalysisExportMatrix(groupedData(), PLATFORM_LABELS);
  assert.equal(matrix[0][0], 'Type'); // grouping column first
  assert.equal(matrix[0][2], 'Category'); // plain category at position 3
  assert.equal(matrix[0][12], 'Type Comprehensive (bulleted)');
  assert.equal(matrix[0][14], 'Type Comprehensive (non-bulleted)');
});

test('grouped export: a competitor with no reviews still gets one row (blank review cols)', () => {
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData({ compBulletedByUrlId: { u1: 'COMP-BULLETS' } }),
    PLATFORM_LABELS
  );
  assert.equal(matrix.length, 2); // header + 1 row
  assert.equal(matrix[1][0], 'Grills'); // category value
  assert.equal(matrix[1][1], 'Amazon'); // platform label
  assert.equal(matrix[1][7], ''); // Stars blank
  assert.equal(matrix[1][8], ''); // Review blank
  assert.equal(matrix[1][10], 'COMP-BULLETS'); // competitor bulleted present
});

test('grouped export: two-level expansion — reviews expand; competitor + group fields repeat down', () => {
  const data = groupedData({
    urls: [
      groupedUrl('u1', { productName: 'Weber X' }),
      groupedUrl('u2', { productName: 'Acme Q' }),
    ],
    reviewsByUrlId: {
      u1: [
        { id: 'r1', starRating: 5, title: 'Great heat', body: 'Sears well' },
        { id: 'r2', starRating: 2, title: null, body: 'Lid broke' },
      ],
      u2: [{ id: 'r3', starRating: 4, title: null, body: 'Solid build' }],
    },
    perReviewSummaryByReviewId: { r1: 'praises heat', r2: 'lid complaint', r3: 'sturdy' },
    compBulletedByUrlId: { u1: 'WEBER-BULLETS', u2: 'ACME-BULLETS' },
    groupBulletedByKey: { Grills: { summary: 'CATEGORY-BULLETS', categories: [] } },
    groupNonBulletedByKey: { Grills: 'CATEGORY-PROSE' },
  });
  const { matrix } = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  // header + 2 (u1) + 1 (u2) review rows
  assert.equal(matrix.length, 4);
  // u1 review rows
  assert.equal(matrix[1][8], 'Great heat. Sears well');
  assert.equal(matrix[1][9], 'praises heat');
  assert.equal(matrix[2][8], 'Lid broke');
  // competitor bulleted repeats on both u1 rows, differs for u2
  assert.equal(matrix[1][10], 'WEBER-BULLETS');
  assert.equal(matrix[2][10], 'WEBER-BULLETS');
  assert.equal(matrix[3][10], 'ACME-BULLETS');
  // group-level summaries repeat on EVERY row in the Grills group
  for (let r = 1; r <= 3; r++) {
    assert.equal(matrix[r][12], 'CATEGORY-BULLETS');
    assert.equal(matrix[r][14], 'CATEGORY-PROSE');
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
  // header + 3 rows (one per competitor, no reviews → one row each)
  assert.equal(matrix.length, 4);
  assert.equal(matrix[1][0], 'Grills'); // alphabetical first
  assert.equal(matrix[2][0], 'Smokers');
  assert.equal(matrix[3][0], ''); // uncategorized value is empty, pinned last
});

test('grouped export: Source Reviews cell resolves bullets → in-group reviews across competitors', () => {
  const reviewMetaById = new Map<string, CategorySourceReviewMeta>([
    ['r1', { starRating: 2, title: 'Lid', body: 'broke', productName: 'Weber X', urlId: 'u1' }],
    ['r9', { starRating: 1, title: null, body: 'flimsy lid', productName: 'Acme Q', urlId: 'u2' }],
  ]);
  const data = groupedData({
    urls: [groupedUrl('u1'), groupedUrl('u2', { productName: 'Acme Q' })],
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
  const sourceCell = matrix[1][13]; // Source Reviews column
  assert.match(sourceCell, /Build quality/);
  assert.match(sourceCell, /Flimsy lid/);
  assert.match(sourceCell, /Weber X/);
  assert.match(sourceCell, /Acme Q/);
  // repeats identically on every row in the group
  assert.equal(matrix[2][13], sourceCell);
});

test('formatSourceReviewsCell: empty themes → empty string; formats theme/bullet/sources', () => {
  assert.equal(formatSourceReviewsCell([]), '');
  const themes: CategorySourceTheme[] = [
    {
      name: 'Durability',
      bullets: [
        {
          text: 'Cracks early',
          sources: [
            { reviewId: 'r1', urlId: 'u1', productName: 'Weber X', starRating: 2, text: 'Cracked', missing: false },
          ],
        },
      ],
    },
  ];
  const out = formatSourceReviewsCell(themes);
  assert.match(out, /Durability/);
  assert.match(out, /• Cracks early/);
  assert.match(out, /– Weber X · 2★ Cracked/);
});

test('grouped export: wrapped column indexes cover the long-text columns', () => {
  const { wrappedColumnIndexes } = buildCategoryReviewsAnalysisExportMatrix(
    groupedData(),
    PLATFORM_LABELS
  );
  // Review(8), Reviews Summary(9), Comp bulleted(10), Comp non-bulleted(11),
  // Category bulleted(12), Source Reviews(13), Category non-bulleted(14).
  assert.deepEqual(wrappedColumnIndexes, [8, 9, 10, 11, 12, 13, 14]);
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
