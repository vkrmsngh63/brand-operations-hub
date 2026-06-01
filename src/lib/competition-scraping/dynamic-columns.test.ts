import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  CAPTURED_KINDS,
  KIND_GROUP_VIS_KEY,
  dynValueKey,
  dynAnalysisKey,
  parseDynKey,
  isDynValueKey,
  dynValueLabel,
  dynAnalysisLabel,
  normalizeCategory,
  collectCategories,
  buildDynamicColumnPairs,
  withDynamicKeysInOrder,
  orderedColumnBoxEntries,
  itemsForCategory,
  subRowSpan,
  type CapturedKind,
  type DynCapturedItem,
} from './dynamic-columns.ts';

// ─── Key encoding ──────────────────────────────────────────────────────────

test('dynValueKey / dynAnalysisKey: stable formats per kind', () => {
  assert.equal(dynValueKey('text', 'Acme'), 'content-cat:Acme');
  assert.equal(dynAnalysisKey('text', 'Acme'), 'content-cat:Acme:analysis');
  assert.equal(dynValueKey('image', 'Hero'), 'image-cat:Hero');
  assert.equal(dynAnalysisKey('image', 'Hero'), 'image-cat:Hero:analysis');
  assert.equal(dynValueKey('video', 'Promo'), 'video-cat:Promo');
  assert.equal(dynAnalysisKey('video', 'Promo'), 'video-cat:Promo:analysis');
});

test('parseDynKey: round-trips value + analysis keys', () => {
  assert.deepEqual(parseDynKey('content-cat:Acme'), {
    kind: 'text',
    category: 'Acme',
    role: 'value',
  });
  assert.deepEqual(parseDynKey('content-cat:Acme:analysis'), {
    kind: 'text',
    category: 'Acme',
    role: 'analysis',
  });
  assert.deepEqual(parseDynKey('image-cat:Hero'), {
    kind: 'image',
    category: 'Hero',
    role: 'value',
  });
  assert.deepEqual(parseDynKey('video-cat:Promo:analysis'), {
    kind: 'video',
    category: 'Promo',
    role: 'analysis',
  });
});

test('parseDynKey: returns null for static / malformed keys', () => {
  assert.equal(parseDynKey('addedAt'), null);
  assert.equal(parseDynKey('platform'), null);
  assert.equal(parseDynKey('competitionCategory'), null);
  assert.equal(parseDynKey('unknown-prefix:Foo'), null);
  // Too many segments / wrong suffix word.
  assert.equal(parseDynKey('content-cat:Foo:notanalysis'), null);
  assert.equal(parseDynKey('content-cat:a:b:c'), null);
});

test('key encoding: free-text categories with delimiters round-trip safely', () => {
  for (const kind of CAPTURED_KINDS) {
    for (const cat of ['A B', 'colon:inside', 'slash/here', 'Acme™', '100%', 'a:analysis']) {
      const vk = dynValueKey(kind, cat);
      const ak = dynAnalysisKey(kind, cat);
      // No literal ':' leaks from the encoded category, so the split parse is safe.
      assert.deepEqual(parseDynKey(vk), { kind, category: cat, role: 'value' });
      assert.deepEqual(parseDynKey(ak), { kind, category: cat, role: 'analysis' });
      assert.equal(isDynValueKey(vk), true);
      assert.equal(isDynValueKey(ak), false);
    }
  }
});

test('isDynValueKey: only true for value keys', () => {
  assert.equal(isDynValueKey('content-cat:Acme'), true);
  assert.equal(isDynValueKey('content-cat:Acme:analysis'), false);
  assert.equal(isDynValueKey('addedAt'), false);
});

// ─── Labels ──────────────────────────────────────────────────────────────

test('dynValueLabel / dynAnalysisLabel: director header formats', () => {
  assert.equal(dynValueLabel('text', 'Acme'), 'Content Category: Acme');
  assert.equal(dynValueLabel('image', 'Acme'), 'Image Category Embedded Text: Acme');
  assert.equal(dynValueLabel('video', 'Acme'), 'Video Category Embedded Text: Acme');
  assert.equal(dynAnalysisLabel('text', 'Acme'), 'Acme Analysis');
  assert.equal(dynAnalysisLabel('image', 'Acme'), 'Acme Analysis');
});

test('KIND_GROUP_VIS_KEY: the three Columns-box group ids', () => {
  assert.equal(KIND_GROUP_VIS_KEY.text, 'contentCategories');
  assert.equal(KIND_GROUP_VIS_KEY.image, 'imageCategories');
  assert.equal(KIND_GROUP_VIS_KEY.video, 'videoCategories');
});

// ─── Category collection ───────────────────────────────────────────────────

function item(
  id: string,
  category: string | null,
  extra: Partial<DynCapturedItem> = {}
): DynCapturedItem {
  return {
    id,
    competitorUrlId: extra.competitorUrlId ?? 'u1',
    category,
    body: extra.body ?? null,
    analysis: extra.analysis ?? {},
    sortOrder: extra.sortOrder ?? 0,
  };
}

test('normalizeCategory: trims; blank/null ⇒ null', () => {
  assert.equal(normalizeCategory('  Acme '), 'Acme');
  assert.equal(normalizeCategory(''), null);
  assert.equal(normalizeCategory('   '), null);
  assert.equal(normalizeCategory(null), null);
  assert.equal(normalizeCategory(undefined), null);
});

test('collectCategories: first-appearance order, deduped, blanks excluded', () => {
  const items = [
    item('1', 'Beta'),
    item('2', null),
    item('3', 'Alpha'),
    item('4', 'Beta'),
    item('5', '  '),
    item('6', ' Alpha '),
  ];
  assert.deepEqual(collectCategories(items), ['Beta', 'Alpha']);
});

test('collectCategories: empty input ⇒ empty', () => {
  assert.deepEqual(collectCategories([]), []);
});

// ─── Column-pair building ──────────────────────────────────────────────────

test('buildDynamicColumnPairs: ordered text → image → video, value+analysis per category', () => {
  const pairs = buildDynamicColumnPairs({
    text: ['Acme'],
    image: ['Hero'],
    video: [],
  });
  assert.equal(pairs.length, 2);
  assert.deepEqual(
    pairs.map((p) => p.valueKey),
    ['content-cat:Acme', 'image-cat:Hero']
  );
  assert.deepEqual(
    pairs.map((p) => p.analysisKey),
    ['content-cat:Acme:analysis', 'image-cat:Hero:analysis']
  );
  assert.equal(pairs[0].valueLabel, 'Content Category: Acme');
  assert.equal(pairs[1].valueLabel, 'Image Category Embedded Text: Hero');
});

// ─── Saved-order merge (Q-F) ───────────────────────────────────────────────

test('withDynamicKeysInOrder: empty saved order ⇒ [] (registry default applies)', () => {
  assert.deepEqual(
    withDynamicKeysInOrder([], ['content-cat:Acme']),
    []
  );
});

test('withDynamicKeysInOrder: new key inserted immediately before Added On', () => {
  const saved = ['platform', 'url', 'addedAt'];
  assert.deepEqual(
    withDynamicKeysInOrder(saved, ['content-cat:Acme']),
    ['platform', 'url', 'content-cat:Acme', 'addedAt']
  );
});

test('withDynamicKeysInOrder: keeps custom order of existing keys, appends only new', () => {
  // Acme already dragged to the front; Hero is brand-new → slots before addedAt.
  const saved = ['content-cat:Acme', 'platform', 'url', 'addedAt'];
  assert.deepEqual(
    withDynamicKeysInOrder(saved, ['content-cat:Acme', 'image-cat:Hero']),
    ['content-cat:Acme', 'platform', 'url', 'image-cat:Hero', 'addedAt']
  );
});

test('withDynamicKeysInOrder: no Added On in saved order ⇒ append at end', () => {
  const saved = ['platform', 'url'];
  assert.deepEqual(
    withDynamicKeysInOrder(saved, ['content-cat:Acme']),
    ['platform', 'url', 'content-cat:Acme']
  );
});

test('withDynamicKeysInOrder: all keys already present ⇒ unchanged copy', () => {
  const saved = ['platform', 'content-cat:Acme', 'addedAt'];
  const out = withDynamicKeysInOrder(saved, ['content-cat:Acme']);
  assert.deepEqual(out, saved);
  assert.notEqual(out, saved); // copy, not the same reference
});

test('withDynamicKeysInOrder: multiple new keys preserve their build order', () => {
  const saved = ['platform', 'addedAt'];
  assert.deepEqual(
    withDynamicKeysInOrder(saved, ['content-cat:A', 'image-cat:B', 'video-cat:C']),
    ['platform', 'content-cat:A', 'image-cat:B', 'video-cat:C', 'addedAt']
  );
});

// ─── Per-row stacked sub-rows (D3) ─────────────────────────────────────────

test('itemsForCategory: filters to one category, preserves order', () => {
  const items = [
    item('1', 'Acme', { sortOrder: 0, body: 'first' }),
    item('2', 'Other', { sortOrder: 1 }),
    item('3', 'Acme', { sortOrder: 2, body: 'second' }),
  ];
  const acme = itemsForCategory(items, 'text', 'Acme');
  assert.deepEqual(acme.map((i) => i.id), ['1', '3']);
  assert.deepEqual(acme.map((i) => i.body), ['first', 'second']);
});

test('itemsForCategory: normalizes the category match', () => {
  const items = [item('1', ' Acme '), item('2', 'Acme')];
  assert.equal(itemsForCategory(items, 'text', 'Acme').length, 2);
});

test('subRowSpan: longest visible list wins, min 1', () => {
  assert.equal(subRowSpan([]), 1);
  assert.equal(subRowSpan([[], []]), 1);
  assert.equal(subRowSpan([[1], [1, 2, 3], [1, 2]]), 3);
  assert.equal(subRowSpan([['a']]), 1);
});

// ─── Negative invariant: dynamic keys never collide with static column ids ──

test('static column ids are never mistaken for dynamic keys', () => {
  const staticIds = [
    'platform',
    'competitionCategory',
    'type',
    'isSponsoredAd',
    'productName',
    'brandName',
    'description1',
    'description2',
    'resultsPageRank',
    'price',
    'productStarRating',
    'numProductReviews',
    'sellerStarRating',
    'numSellerReviews',
    'competitionScore',
    'url',
    'scrapingStatus',
    'addedAt',
  ];
  for (const id of staticIds) {
    assert.equal(parseDynKey(id), null, `${id} must not parse as a dynamic key`);
    assert.equal(isDynValueKey(id), false);
  }
});

// ─── orderedColumnBoxEntries (P-55 Phase 1) ────────────────────────────────

const FIXED = ['platform', 'productName', 'overallCompetitorAnalysis', 'addedAt'];
const NO_GROUPS: Record<CapturedKind, boolean> = {
  text: false,
  image: false,
  video: false,
};

test('orderedColumnBoxEntries: no groups present → fixed entries in arranged order', () => {
  const out = orderedColumnBoxEntries(FIXED, FIXED, NO_GROUPS);
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'productName' },
    { type: 'fixed', id: 'overallCompetitorAnalysis' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

test('orderedColumnBoxEntries: group checkbox interleaves at its kind first dyn column (left of Added On)', () => {
  // Arranged order has the dynamic content columns spliced before OCA/Added On.
  const arranged = [
    'platform',
    'productName',
    dynValueKey('text', 'Acme'),
    dynAnalysisKey('text', 'Acme'),
    'overallCompetitorAnalysis',
    'addedAt',
  ];
  const out = orderedColumnBoxEntries(arranged, FIXED, {
    text: true,
    image: false,
    video: false,
  });
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'productName' },
    { type: 'group', kind: 'text' }, // sits where its column is — BEFORE Added On
    { type: 'fixed', id: 'overallCompetitorAnalysis' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

test('orderedColumnBoxEntries: a kind emits ONE group entry even with many columns + the analysis pair', () => {
  const arranged = [
    'platform',
    dynValueKey('text', 'Acme'),
    dynAnalysisKey('text', 'Acme'),
    dynValueKey('text', 'Beta'),
    dynAnalysisKey('text', 'Beta'),
    'addedAt',
  ];
  const out = orderedColumnBoxEntries(arranged, FIXED, {
    text: true,
    image: false,
    video: false,
  });
  assert.deepEqual(
    out.filter((e) => e.type === 'group'),
    [{ type: 'group', kind: 'text' }]
  );
});

test('orderedColumnBoxEntries: present kind with NO column in the order is inserted before the OCA anchor', () => {
  // A brand-new category not yet in the saved order.
  const out = orderedColumnBoxEntries(FIXED, FIXED, {
    text: true,
    image: false,
    video: false,
  });
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'productName' },
    { type: 'group', kind: 'text' }, // before Overall Competitor Analysis
    { type: 'fixed', id: 'overallCompetitorAnalysis' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

test('orderedColumnBoxEntries: trailing groups fall back to before Added On when no OCA column', () => {
  const fixedNoOca = ['platform', 'productName', 'addedAt'];
  const out = orderedColumnBoxEntries(fixedNoOca, fixedNoOca, {
    text: true,
    image: false,
    video: false,
  });
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'productName' },
    { type: 'group', kind: 'text' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

test('orderedColumnBoxEntries: only present kinds get a group entry; order follows CAPTURED_KINDS for trailing', () => {
  const out = orderedColumnBoxEntries(FIXED, FIXED, {
    text: true,
    image: false,
    video: true,
  });
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'productName' },
    { type: 'group', kind: 'text' },
    { type: 'group', kind: 'video' },
    { type: 'fixed', id: 'overallCompetitorAnalysis' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

test('orderedColumnBoxEntries: unknown / non-registry keys in the order are skipped', () => {
  const arranged = ['platform', 'someGhostKey', 'addedAt'];
  const out = orderedColumnBoxEntries(arranged, FIXED, NO_GROUPS);
  assert.deepEqual(out, [
    { type: 'fixed', id: 'platform' },
    { type: 'fixed', id: 'addedAt' },
  ]);
});

void (CAPTURED_KINDS satisfies readonly CapturedKind[]);
