/**
 * Tests for the provenance index: by-keyword placement entries (+ sibling
 * neighbors), by-topic primary/inherited keywords, deduped total volume, and
 * per-topic reach (primary + inherited).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/provenance.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildProvenance } from './provenance.ts';
import type { Topic } from './conservative-merge.ts';
import type { IntentInstance } from './types.ts';

let seq = 0;
function member(keyword: string, vol: number): IntentInstance {
  return {
    id: `i${seq++}`,
    carrierId: 'c',
    sourceKeyword: keyword,
    profile: { summary: 's' },
    searchVolume: vol,
    multiplicity: 1,
  };
}

function topic(over: Partial<Topic> & { id: string }): Topic {
  return {
    fingerprint: over.id,
    title: over.id,
    canonicalProfile: { summary: 's' },
    specificityMarkers: [],
    boundary: { belongs: [], excludes: [] },
    memberInstances: [],
    primaryKeywords: [],
    volumeFull: 0,
    ...over,
  };
}

function tree(): Topic[] {
  const A = topic({ id: 'A', parentId: 'P', siblingOrder: 0, memberInstances: [member('a', 100)], primaryKeywords: ['a'], volumeFull: 100, zone: 'awareness', stage: 'general-noticing', funnelVerticalRank: 1.01 });
  const B = topic({ id: 'B', parentId: 'P', siblingOrder: 1, memberInstances: [member('b', 200)], primaryKeywords: ['b'], volumeFull: 200 });
  const P = topic({ id: 'P', parentId: null, siblingOrder: 0, isShell: true, inheritedKeywords: ['a', 'b'] });
  return [P, A, B];
}

test('byKeyword records each primary keyword placement with sibling neighbors', () => {
  const idx = buildProvenance(tree());
  const a = idx.byKeyword['a'];
  assert.equal(a.length, 1);
  assert.equal(a[0].topicId, 'A');
  assert.equal(a[0].zone, 'awareness');
  assert.equal(a[0].stage, 'general-noticing');
  assert.equal(a[0].verticalRank, 1.01);
  assert.equal(a[0].neighborUp, null, 'A is first sibling');
  assert.equal(a[0].neighborDown, 'B', 'B is A’s next sibling');
  assert.equal(idx.byKeyword['b'][0].neighborUp, 'A');
});

test('byTopic exposes primary and inherited keywords', () => {
  const idx = buildProvenance(tree());
  assert.deepEqual(idx.byTopic['A'].primaryKeywords, ['a']);
  assert.deepEqual(idx.byTopic['A'].inheritedKeywords, []);
  assert.deepEqual(idx.byTopic['P'].primaryKeywords, []);
  assert.deepEqual(idx.byTopic['P'].inheritedKeywords, ['a', 'b']);
});

test('per-topic reach credits the full volume of every feeding keyword (primary + inherited)', () => {
  const idx = buildProvenance(tree());
  assert.equal(idx.volumeFullByTopic['A'], 100);
  assert.equal(idx.volumeFullByTopic['B'], 200);
  assert.equal(idx.volumeFullByTopic['P'], 300, 'shell reach = inherited a + b');
});

test('nicheDedupTotalVolume counts each keyword once even when it feeds multiple topics', () => {
  const t = tree();
  // a second topic whose member is ALSO keyword "a" (same full volume).
  t.push(topic({ id: 'C', parentId: null, siblingOrder: 1, memberInstances: [member('a', 100)], primaryKeywords: ['a'], volumeFull: 100 }));
  const idx = buildProvenance(t);
  assert.equal(idx.byKeyword['a'].length, 2, 'a appears in two topics');
  assert.equal(idx.nicheDedupTotalVolume, 300, 'a(100) counted once + b(200)');
});

test('empty input yields an empty, well-formed index', () => {
  const idx = buildProvenance([]);
  assert.deepEqual(idx.byKeyword, {});
  assert.deepEqual(idx.byTopic, {});
  assert.equal(idx.nicheDedupTotalVolume, 0);
});
