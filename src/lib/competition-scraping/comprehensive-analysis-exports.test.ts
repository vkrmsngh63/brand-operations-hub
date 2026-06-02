import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMainTableExportMatrix,
  buildExportFilename,
  buildExportZipFilename,
  type ExportFixedColumn,
  type MainExportUrl,
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
