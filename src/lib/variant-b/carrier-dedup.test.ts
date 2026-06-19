/**
 * Unit tests for Variant B carrier dedup (rulebook §6, spec §3 Step 2).
 *
 * Run with:
 *   node --test src/lib/variant-b/carrier-dedup.test.ts
 *
 * Uses Node's built-in `node:test` and `node:assert/strict`. No external test
 * framework. No DB. No AI. Mirrors operation-applier.test.ts conventions.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  carrierDedup,
  normalizeCarrierKey,
  lemmatizePlural,
  DEFAULT_IGNORABLE_STOPWORDS,
} from './carrier-dedup.ts';
import type { KeywordRow } from './types.ts';

// ============================================================
// Builders
// ============================================================

let _n = 0;
function kw(keyword: string, volume = 0): KeywordRow {
  _n += 1;
  return { id: `k-${_n}`, keyword, volume };
}

// ============================================================
// normalizeCarrierKey
// ============================================================

test('default ignorable set is exactly {for, the, a} (closed)', () => {
  assert.deepEqual([...DEFAULT_IGNORABLE_STOPWORDS], ['for', 'the', 'a']);
});

test('removes ONLY {for,the,a}; keeps prepositions and qualifiers', () => {
  // "in" (preposition) and "best"/"natural" (qualifiers) MUST survive.
  const key = normalizeCarrierKey('best natural remedies for the pain in knee', {
    ignorableStopwords: [...DEFAULT_IGNORABLE_STOPWORDS],
  });
  const tokens = key.split(' ');
  assert.ok(tokens.includes('in'), 'preposition "in" must be kept');
  assert.ok(tokens.includes('best'), 'qualifier "best" must be kept');
  assert.ok(tokens.includes('natural'), 'qualifier "natural" must be kept');
  assert.ok(!tokens.includes('for'), '"for" must be dropped');
  assert.ok(!tokens.includes('the'), '"the" must be dropped');
});

test('normalizes word order (sorted tokens) so phrasings collapse', () => {
  const a = normalizeCarrierKey('knee pain relief');
  const b = normalizeCarrierKey('relief knee pain');
  assert.equal(a, b);
});

test('strips the condition term', () => {
  const key = normalizeCarrierKey('bursitis knee pain', {
    conditionTerm: 'bursitis',
  });
  assert.ok(!key.split(' ').includes('bursitis'));
  assert.equal(key, ['knee', 'pain'].sort().join(' '));
});

test('strips a multi-word condition term', () => {
  const key = normalizeCarrierKey('prepatellar bursitis treatment', {
    conditionTerm: 'prepatellar bursitis',
  });
  assert.equal(key, 'treatment');
});

test('maps niche alias to canonical condition term, then strips it', () => {
  const cfg = {
    conditionTerm: 'prepatellar bursitis',
    aliases: { "housemaid's knee": 'prepatellar bursitis' },
  };
  // "housemaid's knee treatment" → alias→canonical → strip condition → "treatment"
  const aliased = normalizeCarrierKey("housemaid's knee treatment", cfg);
  const canonical = normalizeCarrierKey('prepatellar bursitis treatment', cfg);
  assert.equal(aliased, canonical);
  assert.equal(aliased, 'treatment');
});

test('condition-only / stopword-only phrases normalize to empty', () => {
  assert.equal(normalizeCarrierKey('the bursitis', { conditionTerm: 'bursitis' }), '');
  assert.equal(normalizeCarrierKey('for the a'), '');
  assert.equal(normalizeCarrierKey('   '), '');
});

// ============================================================
// lemmatizePlural
// ============================================================

test('plural lemmatization: conservative common rules', () => {
  assert.equal(lemmatizePlural('symptoms'), 'symptom');
  assert.equal(lemmatizePlural('remedies'), 'remedy');
  assert.equal(lemmatizePlural('boxes'), 'box');
  assert.equal(lemmatizePlural('abscess'), 'abscess'); // -ss untouched
  assert.equal(lemmatizePlural('ice'), 'ice'); // short word untouched
});

test('plurals collapse with their singular in the dedup key', () => {
  assert.equal(normalizeCarrierKey('knee symptoms'), normalizeCarrierKey('knee symptom'));
});

// ============================================================
// carrierDedup grouping
// ============================================================

test('groups word-order variants into one cluster and sums volume', () => {
  const clusters = carrierDedup([
    kw('knee pain relief', 100),
    kw('relief knee pain', 40),
    kw('pain relief knee', 10),
  ]);
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].members.length, 3);
  assert.equal(clusters[0].summedVolume, 150);
});

test('elects the highest-volume member as representative (ties → alpha)', () => {
  const clusters = carrierDedup([
    kw('relief knee pain', 40),
    kw('knee pain relief', 100),
  ]);
  assert.equal(clusters[0].representative, 'knee pain relief');
});

test('keeps genuinely distinct phrases apart', () => {
  const clusters = carrierDedup([
    kw('knee pain', 50),
    kw('knee pain in morning', 30), // "in"/"morning" survive → distinct
  ]);
  assert.equal(clusters.length, 2);
});

test('blank keyword → its own flagged singleton', () => {
  const clusters = carrierDedup([kw('', 0), kw('  ', 0), kw('knee pain', 5)]);
  const flagged = clusters.filter((c) => c.flagged);
  assert.equal(flagged.length, 2, 'each blank is a separate flagged singleton');
  for (const c of flagged) assert.equal(c.members.length, 1);
});

test('condition-only phrases group under one flagged cluster', () => {
  const clusters = carrierDedup(
    [kw('bursitis', 90), kw('the bursitis', 10), kw('bursitis knee', 5)],
    { conditionTerm: 'bursitis' },
  );
  const condOnly = clusters.find((c) => c.flagged && c.normalizedKey === '');
  assert.ok(condOnly, 'a flagged condition-only cluster exists');
  assert.equal(condOnly!.members.length, 2);
  assert.equal(condOnly!.summedVolume, 100);
});

test('output is deterministic: sorted by descending summedVolume', () => {
  const clusters = carrierDedup([
    kw('low volume topic', 5),
    kw('high volume topic', 500),
    kw('mid volume topic', 50),
  ]);
  const vols = clusters.map((c) => c.summedVolume);
  assert.deepEqual(vols, [...vols].sort((a, b) => b - a));
  assert.equal(clusters[0].id, 'cc-1'); // ids reflect final order
});

test('non-finite volume is treated as 0, never NaN', () => {
  const clusters = carrierDedup([
    { id: 'x', keyword: 'knee pain', volume: NaN as unknown as number },
  ]);
  assert.equal(clusters[0].summedVolume, 0);
});

test('empty input → empty output', () => {
  assert.deepEqual(carrierDedup([]), []);
});
