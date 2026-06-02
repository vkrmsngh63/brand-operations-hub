import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPrimer,
  renderPrimerToPlainText,
  renderPrimerToTipTapDoc,
  type PrimerMainColumn,
} from './comprehensive-analysis-primer.ts';

// The real main-table registry ids+labels (TABLE_COLUMN_DEFS) — passed in
// because url-table-columns.ts (src/app) isn't node:test-reachable.
const MAIN_COLUMNS: PrimerMainColumn[] = [
  { id: 'platform', label: 'Platform' },
  { id: 'competitionCategory', label: 'Category' },
  { id: 'type', label: 'Type' },
  { id: 'isSponsoredAd', label: 'Sponsored' },
  { id: 'productName', label: 'Product Name' },
  { id: 'brandName', label: 'Brand Name' },
  { id: 'description1', label: 'Description 1' },
  { id: 'description2', label: 'Description 2' },
  { id: 'resultsPageRank', label: 'Results Rank' },
  { id: 'price', label: 'Price' },
  { id: 'productStarRating', label: 'Product Stars' },
  { id: 'numProductReviews', label: '# Reviews' },
  { id: 'sellerStarRating', label: 'Seller Stars' },
  { id: 'numSellerReviews', label: 'Seller Reviews' },
  { id: 'competitionScore', label: 'Competition Score' },
  { id: 'url', label: 'URL' },
  { id: 'scrapingStatus', label: 'Status' },
  { id: 'overallCompetitorAnalysis', label: 'Overall Competitor Analysis' },
  { id: 'addedAt', label: 'Added On' },
];

test('primer: has the four spreadsheet sections in order', () => {
  const primer = buildPrimer({ mainColumns: MAIN_COLUMNS });
  assert.deepEqual(
    primer.sections.map((s) => s.heading),
    [
      'Competition Content Overview',
      'Competition Reviews Analysis',
      'Reviews Analysis By Competitor Category',
      'Reviews Analysis By Competitor Type',
    ]
  );
  assert.ok(primer.intro.length >= 1);
  assert.ok(primer.howToRead.length >= 1);
});

test('primer: every column in every section has a non-empty description', () => {
  const primer = buildPrimer({ mainColumns: MAIN_COLUMNS });
  for (const section of primer.sections) {
    assert.ok(section.columns.length > 0, `${section.heading} has columns`);
    for (const col of section.columns) {
      assert.ok(col.name.trim().length > 0, `${section.heading}: a column has a name`);
      assert.ok(
        col.description.trim().length > 0,
        `${section.heading} › ${col.name} has a description`
      );
    }
  }
});

test('primer: main-table section covers all fixed columns + appended dynamic columns', () => {
  const dyn = ['Features (Text)', 'Features Analysis'];
  const primer = buildPrimer({ mainColumns: MAIN_COLUMNS, mainDynamicColumnLabels: dyn });
  const main = primer.sections[0];
  assert.equal(main.columns.length, MAIN_COLUMNS.length + dyn.length);
  assert.equal(main.columns.at(-2)?.name, 'Features (Text)');
  assert.equal(main.columns.at(-1)?.name, 'Features Analysis');
});

test('primer: By-Type section uses type wording + Type↔Category column swap', () => {
  const primer = buildPrimer({ mainColumns: MAIN_COLUMNS });
  const type = primer.sections[3];
  assert.equal(type.columns[0].name, 'Type');
  assert.equal(type.columns[2].name, 'Category');
  // the type-wide bulleted column mentions "type"
  const typeBulleted = type.columns.find((c) => c.name === 'Type Comprehensive (bulleted)');
  assert.ok(typeBulleted && /type/i.test(typeBulleted.description));
});

test('primer: plain-text render includes the title, the how-to-read note, and a column line', () => {
  const text = renderPrimerToPlainText(buildPrimer({ mainColumns: MAIN_COLUMNS }));
  assert.match(text, /Competitive Analysis Primer/);
  assert.match(text, /HOW TO READ THESE SPREADSHEETS/);
  assert.match(text, /Source Reviews:/);
});

test('primer: explains the "without individual reviews" summary-only variants of all three reviews files', () => {
  const text = renderPrimerToPlainText(buildPrimer({ mainColumns: MAIN_COLUMNS }));
  // The intro names the summary-only set.
  assert.match(text, /without individual reviews/);
  // Each of the three reviews files names its trimmed companion.
  assert.match(text, /Competition Reviews Analysis without individual reviews/);
  assert.match(text, /Reviews Analysis By Competitor Category without individual reviews/);
  assert.match(text, /Reviews Analysis By Competitor Type without individual reviews/);
});

test('primer: TipTap render is a doc whose first node is the title heading', () => {
  const doc = renderPrimerToTipTapDoc(buildPrimer({ mainColumns: MAIN_COLUMNS })) as {
    type: string;
    content: Array<{ type: string; attrs?: { level?: number }; content?: unknown[] }>;
  };
  assert.equal(doc.type, 'doc');
  const first = doc.content[0];
  assert.equal(first.type, 'heading');
  assert.equal(first.attrs?.level, 1);
  // one bulletList per spreadsheet section (4)
  const bulletLists = doc.content.filter((n) => n.type === 'bulletList');
  assert.equal(bulletLists.length, 4);
  // every heading is within the editor's enabled levels (1-3)
  for (const n of doc.content) {
    if (n.type === 'heading') {
      const lvl = n.attrs?.level ?? 0;
      assert.ok(lvl >= 1 && lvl <= 3, `heading level ${lvl} in range`);
    }
  }
});

test('primer: each column bullet leads with a bold name run, then the description', () => {
  const doc = renderPrimerToTipTapDoc(buildPrimer({ mainColumns: MAIN_COLUMNS })) as {
    content: Array<{
      type: string;
      content?: Array<{
        type: string;
        content?: Array<{ content?: Array<{ marks?: Array<{ type: string }>; text?: string }> }>;
      }>;
    }>;
  };
  const firstList = doc.content.find((n) => n.type === 'bulletList');
  assert.ok(firstList, 'a bullet list exists');
  const firstItem = firstList!.content?.[0];
  const para = firstItem?.content?.[0];
  const runs = para?.content ?? [];
  assert.equal(runs[0]?.marks?.[0]?.type, 'bold');
  assert.ok((runs[0]?.text ?? '').includes(':'), 'bold run carries the "Name: " label');
  assert.ok((runs[1]?.text ?? '').length > 0, 'a plain-text description run follows');
});
