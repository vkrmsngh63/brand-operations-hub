// node:test coverage for the per-category aggregation helpers (the
// provenance chain that powers the Source Reviews column).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  collectCategoryInputBullets,
  buildCategoryStructuredAnalysis,
  canonicalizeCategoryInputBullets,
  type CategoryCompetitorAnalysis,
} from './category-analysis-aggregation.ts';
import type { PerCategoryModelOutput } from './review-analysis/prompts.ts';

// A competitor's stored per-competitor analysisJson (bulleted structured shape).
function competitor(
  urlId: string,
  productName: string,
  categories: Array<{ name: string; bullets: Array<{ text: string; reviewIds: string[] }> }>
): CategoryCompetitorAnalysis {
  return { urlId, productName, analysisJson: { summary: 'flat', categories } };
}

test('collectCategoryInputBullets flattens competitors into continuous B-labels', () => {
  const { inputBullets, bulletsByLabel } = collectCategoryInputBullets([
    competitor('u1', 'BrandA', [
      { name: 'Product critiques', bullets: [{ text: 'Strap breaks', reviewIds: ['r1', 'r2'] }] },
    ]),
    competitor('u2', 'BrandB', [
      { name: 'Product critiques', bullets: [{ text: 'Strap snapped', reviewIds: ['r3'] }] },
      { name: 'Docs', bullets: [{ text: 'No manual', reviewIds: ['r4'] }] },
    ]),
  ]);
  assert.equal(inputBullets.length, 3);
  // Labels are continuous across competitors (do NOT reset per competitor).
  assert.deepEqual(inputBullets.map((b) => b.label), ['B1', 'B2', 'B3']);
  assert.equal(inputBullets[0].productName, 'BrandA');
  assert.equal(inputBullets[1].productName, 'BrandB');
  assert.equal(inputBullets[1].theme, 'Product critiques');
  assert.equal(inputBullets[2].theme, 'Docs');
  assert.deepEqual(bulletsByLabel.get('B1')!.reviewIds, ['r1', 'r2']);
  assert.deepEqual(bulletsByLabel.get('B3')!.reviewIds, ['r4']);
});

test('collectCategoryInputBullets skips competitors with no usable structured analysis', () => {
  const { inputBullets } = collectCategoryInputBullets([
    { urlId: 'u1', productName: 'Legacy', analysisJson: { summary: 'free text only' } }, // no categories
    { urlId: 'u2', productName: 'None', analysisJson: null }, // never run
    competitor('u3', 'Good', [
      { name: 'T', bullets: [{ text: 'real', reviewIds: ['r1'] }] },
    ]),
  ]);
  assert.equal(inputBullets.length, 1);
  assert.equal(inputBullets[0].productName, 'Good');
  assert.equal(inputBullets[0].label, 'B1'); // labeling starts at the first usable bullet
});

test('buildCategoryStructuredAnalysis unions cited bullets reviewIds into each category bullet', () => {
  const { bulletsByLabel } = collectCategoryInputBullets([
    competitor('u1', 'BrandA', [
      { name: 'Product critiques', bullets: [{ text: 'Strap breaks', reviewIds: ['r1', 'r2'] }] },
    ]),
    competitor('u2', 'BrandB', [
      { name: 'Product critiques', bullets: [{ text: 'Strap snapped', reviewIds: ['r2', 'r3'] }] },
    ]),
  ]);
  const modelOutput: PerCategoryModelOutput = {
    categories: [
      {
        name: 'Product critiques',
        bullets: [
          { text: 'Strap durability is a category-wide weakness', bulletRefs: ['B1', 'B2'] },
        ],
      },
    ],
  };
  const structured = buildCategoryStructuredAnalysis(modelOutput, bulletsByLabel);
  // Union of B1 (r1,r2) + B2 (r2,r3) = r1,r2,r3 (r2 deduped, order preserved).
  assert.deepEqual(structured.categories[0].bullets[0].reviewIds, ['r1', 'r2', 'r3']);
  assert.equal(
    structured.categories[0].bullets[0].text,
    'Strap durability is a category-wide weakness'
  );
});

test('buildCategoryStructuredAnalysis keeps a bullet whose refs all dangle (empty source list)', () => {
  const bulletsByLabel = new Map();
  const structured = buildCategoryStructuredAnalysis(
    { categories: [{ name: 'T', bullets: [{ text: 'kept', bulletRefs: ['B9'] }] }] },
    bulletsByLabel
  );
  assert.equal(structured.categories[0].bullets[0].text, 'kept');
  assert.deepEqual(structured.categories[0].bullets[0].reviewIds, []);
});

test('canonicalizeCategoryInputBullets is order-stable on reviewIds + ignores label/product/theme', () => {
  const a = collectCategoryInputBullets([
    competitor('u1', 'BrandA', [
      { name: 'X', bullets: [{ text: 'same', reviewIds: ['r2', 'r1'] }] },
    ]),
  ]).inputBullets;
  const b = collectCategoryInputBullets([
    competitor('u9', 'DifferentName', [
      { name: 'DifferentTheme', bullets: [{ text: 'same', reviewIds: ['r1', 'r2'] }] },
    ]),
  ]).inputBullets;
  // Same text + same review set (different order, product, theme) → same key.
  assert.equal(canonicalizeCategoryInputBullets(a), canonicalizeCategoryInputBullets(b));
});
