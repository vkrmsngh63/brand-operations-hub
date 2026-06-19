/**
 * Tests for Step 3 run engine (the PURE orchestration core of the run-loop).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/run-engine.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { assembleRulebook } from './rulebook-assembly.ts';
import { carrierDedup } from './carrier-dedup.ts';
import type { CarrierCluster, IntentInstance, KeywordRow } from './types.ts';
import {
  buildCarrierBatches,
  carrierToCandidates,
  foldIntentsToTree,
  computeFunnelStats,
  DEFAULT_BATCH_SIZE,
} from './run-engine.ts';

const RB = assembleRulebook([]); // universal floor

function carrier(over: Partial<CarrierCluster> = {}): CarrierCluster {
  return {
    id: 'c1',
    representative: 'knee swelling',
    members: [{ keyword: 'knee swelling', volume: 1200 }],
    summedVolume: 1200,
    normalizedKey: 'knee swelling',
    ...over,
  };
}

const RAW_TWO_INTENTS = JSON.stringify({
  intents: [
    { profile: { subject_type: 'symptom', primary_action: 'identify-symptom', summary: 'is this swelling normal' }, clarity: 0.9, confidence: 0.8 },
    { profile: { subject_type: 'cause/trigger', primary_action: 'find-cause', summary: 'why is my knee swollen' }, clarity: 0.7, confidence: 0.7 },
  ],
});

// ---- carrierToCandidates ----

test('carrierToCandidates parses a valid response into intents + candidate topics', () => {
  const res = carrierToCandidates(RAW_TWO_INTENTS, carrier(), RB);
  assert.ok(res.ok);
  assert.equal(res.intents.length, 2);
  assert.equal(res.candidates.length, 2, 'one candidate topic per intent');
  assert.equal(res.flags.length, 0);
  // each candidate is a single-member tight-topic candidate
  assert.equal(res.candidates[0].memberInstances.length, 1);
  assert.ok(res.candidates[0].id.length > 0);
});

test('carrierToCandidates surfaces parse failure as ok=false with a flag, no candidates', () => {
  const res = carrierToCandidates('not json at all', carrier(), RB);
  assert.equal(res.ok, false);
  assert.equal(res.intents.length, 0);
  assert.equal(res.candidates.length, 0);
  assert.equal(res.flags[0].kind, 'invalid-json');
});

test('carrierToCandidates keeps over-enumerated/odd-vocab intents (never auto-deletes)', () => {
  const raw = JSON.stringify({ intents: [{ profile: { subject_type: 'made-up-value', summary: 'x' } }] });
  const res = carrierToCandidates(raw, carrier(), RB);
  assert.ok(res.ok);
  assert.equal(res.candidates.length, 1, 'candidate retained despite bad vocab');
  assert.ok(res.flags.some((f) => f.kind === 'out-of-vocab-value'));
});

// ---- buildCarrierBatches ----

test('buildCarrierBatches splits into fixed-size batches with a final remainder', () => {
  const carriers = Array.from({ length: 7 }, (_, i) => carrier({ id: 'c' + i, representative: 'kw ' + i }));
  const batches = buildCarrierBatches(carriers, 3);
  assert.equal(batches.length, 3);
  assert.deepEqual(batches.map((b) => b.length), [3, 3, 1]);
});

test('buildCarrierBatches: empty input → no batches; bad size → default size', () => {
  assert.deepEqual(buildCarrierBatches([], 5), []);
  const carriers = Array.from({ length: DEFAULT_BATCH_SIZE + 1 }, (_, i) => carrier({ id: 'c' + i }));
  const batches = buildCarrierBatches(carriers, 0);
  assert.equal(batches.length, 2, 'size<=0 falls back to DEFAULT_BATCH_SIZE');
  assert.equal(batches[0].length, DEFAULT_BATCH_SIZE);
});

// ---- foldIntentsToTree ----

/** Gather intents from several carriers' fake enumeration responses. */
function gatherIntents(): IntentInstance[] {
  const intents: IntentInstance[] = [];
  intents.push(...carrierToCandidates(RAW_TWO_INTENTS, carrier({ id: 'c1', representative: 'knee swelling' }), RB).intents);
  intents.push(
    ...carrierToCandidates(
      JSON.stringify({ intents: [{ profile: { subject_type: 'treatment', primary_action: 'find-treatment', summary: 'how to treat knee swelling' } }] }),
      carrier({ id: 'c2', representative: 'knee swelling treatment', members: [{ keyword: 'knee swelling treatment', volume: 800 }], summedVolume: 800, normalizedKey: 'knee swelling treatment' }),
      RB,
    ).intents,
  );
  intents.push(
    ...carrierToCandidates(
      JSON.stringify({ intents: [{ profile: { subject_type: 'symptom', primary_action: 'identify-symptom', summary: 'is this swelling normal' } }] }),
      carrier({ id: 'c3', representative: 'swollen knee', members: [{ keyword: 'swollen knee', volume: 500 }], summedVolume: 500, normalizedKey: 'swollen knee' }),
      RB,
    ).intents,
  );
  return intents;
}

test('foldIntentsToTree assembles a tree and a consistent stats summary', () => {
  const funnel = foldIntentsToTree(gatherIntents(), RB);
  assert.ok(funnel.topics.length > 0, 'produces at least one topic');
  assert.equal(funnel.stats.topicCount, funnel.topics.length, 'stats.topicCount tracks the tree');
  assert.equal(funnel.rootIds.length, funnel.stats.rootCount);
  // placed + queued accounting is coherent
  assert.equal(funnel.stats.unplacedCount, funnel.needsPlacement.length);
  assert.ok(funnel.stats.placedCount <= funnel.topics.length);
  assert.ok(funnel.stats.totalReachVolume > 0);
  assert.ok(funnel.provenance.byTopic);
});

test('foldIntentsToTree is deterministic (same intents → same topic ids)', () => {
  const a = foldIntentsToTree(gatherIntents(), RB);
  const b = foldIntentsToTree(gatherIntents(), RB);
  assert.deepEqual(a.topics.map((t) => t.id), b.topics.map((t) => t.id));
  assert.deepEqual(a.stats, b.stats);
});

test('foldIntentsToTree folds identical-profile intents across carriers into one topic', () => {
  // c1 and c3 both emit the "symptom / identify-symptom / is this swelling normal"
  // profile → that profile must collapse to a single tight topic with ≥2 members.
  const funnel = foldIntentsToTree(gatherIntents(), RB);
  const symptomTopics = funnel.topics.filter((t) =>
    t.memberInstances.some((m) => m.profile.summary === 'is this swelling normal'),
  );
  assert.equal(symptomTopics.length, 1, 'identical profiles merge to one topic');
  assert.ok(symptomTopics[0].memberInstances.length >= 2, 'topic carries both source intents');
});

test('foldIntentsToTree with runSweep:false skips the mechanical sweep flags', () => {
  const funnel = foldIntentsToTree(gatherIntents(), RB, { runSweep: false });
  assert.equal(funnel.needsReview.length, 0, 'no sweep ⇒ no sweep flags');
  assert.ok(funnel.topics.length > 0);
});

test('foldIntentsToTree on an empty intent set yields an empty, coherent funnel', () => {
  const funnel = foldIntentsToTree([], RB);
  assert.equal(funnel.topics.length, 0);
  assert.equal(funnel.stats.topicCount, 0);
  assert.equal(funnel.rootIds.length, 0);
  assert.equal(funnel.stats.totalReachVolume, 0);
});

// ---- end-to-end: keywords → dedup → enumerate → fold ----

test('end-to-end: raw keywords dedup into carriers and fold into a funnel', () => {
  const rows: KeywordRow[] = [
    { id: 'k1', keyword: 'knee swelling', volume: 1200 },
    { id: 'k2', keyword: 'knee swellings', volume: 300 }, // plural → same carrier
    { id: 'k3', keyword: 'knee swelling treatment', volume: 800 },
  ];
  const carriers = carrierDedup(rows);
  assert.ok(carriers.length >= 1);
  const intents: IntentInstance[] = [];
  for (const c of carriers) {
    const raw = JSON.stringify({ intents: [{ profile: { subject_type: 'symptom', primary_action: 'identify-symptom', summary: 'about ' + c.representative } }] });
    intents.push(...carrierToCandidates(raw, c, RB).intents);
  }
  const funnel = foldIntentsToTree(intents, RB);
  assert.ok(funnel.topics.length > 0);
  assert.equal(funnel.stats.topicCount, funnel.topics.length);
});

// ---- computeFunnelStats directly ----

test('computeFunnelStats counts multi-topic keywords from provenance', () => {
  const funnel = foldIntentsToTree(gatherIntents(), RB);
  const recomputed = computeFunnelStats(funnel.topics, funnel.needsPlacement, funnel.provenance);
  assert.deepEqual(recomputed, funnel.stats, 'stats are a pure function of the tree + provenance');
  assert.ok(recomputed.multiTopicKeywordCount >= 0);
});
