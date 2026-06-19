/**
 * Tests for Step 6 hierarchy build (containment nesting, nearest parent,
 * secondary propagation, sibling order, spine, depth) + ladder-aware shells.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/hierarchy.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildHierarchy } from './hierarchy.ts';
import { conservativeMerge, candidateTopic, type Topic } from './conservative-merge.ts';
import { labelIntent } from './topic-labeling.ts';
import { DESCRIPTORS } from './rulebook.ts';
import type { AssembledRulebook, ValueLadder } from './rulebook-assembly.ts';
import type { DescriptorProfile, IntentInstance } from './types.ts';

// ---- fixtures ----

function rb(valueLadders: ValueLadder[] = []): AssembledRulebook {
  // buildHierarchy reads only `descriptors` + `valueLadders`.
  return { descriptors: DESCRIPTORS, valueLadders, mergePolicy: 'exact-profile-match' } as unknown as AssembledRulebook;
}

let seq = 0;
function intent(profile: DescriptorProfile, over: Partial<IntentInstance> = {}): IntentInstance {
  const id = over.id ?? `i${seq++}`;
  return {
    id,
    carrierId: 'c1',
    sourceKeyword: over.sourceKeyword ?? `kw-${id}`,
    profile,
    searchVolume: over.searchVolume ?? 100,
    multiplicity: 1,
  };
}

function c(profile: DescriptorProfile, sourceKeyword: string, vol: number): Topic {
  const i = intent(profile, { sourceKeyword, searchVolume: vol });
  return candidateTopic(i, labelIntent(i));
}

function p(over: Partial<DescriptorProfile> = {}): DescriptorProfile {
  return { summary: 's', ...over };
}

function run(cands: Topic[], ladders: ValueLadder[] = []) {
  const r = rb(ladders);
  const merged = conservativeMerge(cands, r);
  return buildHierarchy(merged.topics, merged.nestCandidates, r);
}

function byFp(res: { topics: Topic[] }, fp: string): Topic {
  const t = res.topics.find((x) => x.fingerprint === fp);
  assert.ok(t, `expected a topic with fingerprint ${fp}`);
  return t!;
}

// ---- universal floor: containment nesting ----

test('a strict-containment chain nests each topic under its NEAREST parent', () => {
  const general = c(p({ subject_type: 'symptom' }), 'symptom', 100);
  const mid = c(p({ subject_type: 'symptom', body_location: 'knee' }), 'knee symptom', 200);
  const specific = c(p({ subject_type: 'symptom', body_location: 'knee', severity: 'mild' }), 'mild knee symptom', 300);

  const res = run([general, mid, specific]);
  const g = byFp(res, 'subject_type=symptom');
  const m = byFp(res, 'subject_type=symptom;body_location=knee');
  const s = byFp(res, 'subject_type=symptom;body_location=knee;severity=mild');

  assert.equal(g.parentId, null, 'general is a root');
  assert.equal(m.parentId, g.id, 'mid nests under general');
  assert.equal(s.parentId, m.id, 'specific nests under mid, NOT directly under general');
  assert.equal(g.depth, 0);
  assert.equal(m.depth, 1);
  assert.equal(s.depth, 2);
  assert.equal(res.stats.maxDepth, 2);
  assert.deepEqual(res.rootIds, [g.id]);
});

test('secondary propagation: every ancestor inherits all its descendants primary keywords', () => {
  const general = c(p({ subject_type: 'symptom' }), 'symptom', 100);
  const mid = c(p({ subject_type: 'symptom', body_location: 'knee' }), 'knee symptom', 200);
  const specific = c(p({ subject_type: 'symptom', body_location: 'knee', severity: 'mild' }), 'mild knee symptom', 300);

  const res = run([general, mid, specific]);
  const g = byFp(res, 'subject_type=symptom');
  const m = byFp(res, 'subject_type=symptom;body_location=knee');
  const s = byFp(res, 'subject_type=symptom;body_location=knee;severity=mild');

  assert.deepEqual(g.inheritedKeywords, ['knee symptom', 'mild knee symptom'].sort());
  assert.deepEqual(m.inheritedKeywords, ['mild knee symptom']);
  assert.deepEqual(s.inheritedKeywords, []);
});

test('siblings are ordered by descending volume; parents are spine, leaves are not', () => {
  const general = c(p({ subject_type: 'symptom' }), 'symptom', 100);
  const childA = c(p({ subject_type: 'symptom', body_location: 'knee' }), 'knee', 200);
  const childB = c(p({ subject_type: 'symptom', demographic_context: 'women' }), 'women', 800);

  const res = run([general, childA, childB]);
  const g = byFp(res, 'subject_type=symptom');
  const a = byFp(res, 'subject_type=symptom;body_location=knee');
  const b = byFp(res, 'subject_type=symptom;demographic_context=women');

  assert.equal(a.parentId, g.id);
  assert.equal(b.parentId, g.id);
  // higher-volume sibling (women, 800) comes first
  assert.deepEqual(g.children, [b.id, a.id]);
  assert.equal(b.siblingOrder, 0);
  assert.equal(a.siblingOrder, 1);
  assert.equal(g.isSpine, true, 'a parent is on the spine');
  assert.equal(a.isSpine, false, 'a leaf is not on the spine');
});

test('unrelated topics are both roots; no shells at the universal floor', () => {
  const x = c(p({ subject_type: 'symptom' }), 'symptom', 100);
  const y = c(p({ primary_action: 'find-cause' }), 'cause', 100);
  const res = run([x, y]);
  assert.equal(res.stats.rootCount, 2);
  assert.equal(res.stats.shellsCreated, 0);
});

// ---- ladder-aware shells + nesting ----

const LOC_LADDER: ValueLadder = { descriptorKey: 'body_location', ladder: ['musculoskeletal', 'leg', 'knee'] };

test('climbing a value-ladder generates grouping shells and the specific topic nests under the nearest rung', () => {
  const knee = c(p({ subject_type: 'symptom', body_location: 'knee' }), 'knee pain', 500);
  const res = run([knee], [LOC_LADDER]);

  // shells for the two broader rungs (leg, musculoskeletal); knee keeps its own topic.
  assert.equal(res.stats.shellsCreated, 2);
  const leg = byFp(res, 'subject_type=symptom;body_location=leg');
  const musc = byFp(res, 'subject_type=symptom;body_location=musculoskeletal');
  const k = byFp(res, 'subject_type=symptom;body_location=knee');

  assert.equal(leg.isShell, true);
  assert.equal(leg.primaryKeywords.length, 0, 'a shell can be empty');
  assert.equal(k.parentId, leg.id, 'knee nests under the nearest rung (leg), not musculoskeletal');
  assert.equal(leg.parentId, musc.id, 'leg nests under musculoskeletal');
  assert.equal(musc.parentId, null);
  // the real keyword propagates up the ladder to both shell ancestors.
  assert.deepEqual(leg.inheritedKeywords, ['knee pain']);
  assert.deepEqual(musc.inheritedKeywords, ['knee pain']);
});

test('shells climb each laddered axis INDEPENDENTLY — no cross-product explosion', () => {
  const ENT_LADDER: ValueLadder = { descriptorKey: 'named_entity', ladder: ['drug', 'nsaid', 'ibuprofen'] };
  const t = c(p({ body_location: 'knee', named_entity: 'ibuprofen' }), 'ibuprofen for knee', 400);
  const res = run([t], [LOC_LADDER, ENT_LADDER]);

  // 2 rungs per axis × 2 axes = 4 single-axis shells; the 4 cross-combinations are NOT created.
  assert.equal(res.stats.shellsCreated, 4);
  // spot-check: a cross-combination shell must NOT exist.
  const cross = res.topics.find(
    (x) => x.canonicalProfile.body_location === 'leg' && x.canonicalProfile.named_entity === 'nsaid',
  );
  assert.equal(cross, undefined, 'no cross-axis combination shell');
});

test('an existing topic that matches a would-be shell profile is not duplicated', () => {
  const knee = c(p({ subject_type: 'symptom', body_location: 'knee' }), 'knee pain', 500);
  const legReal = c(p({ subject_type: 'symptom', body_location: 'leg' }), 'leg pain', 700); // demand already exists
  const res = run([knee, legReal], [LOC_LADDER]);

  const legs = res.topics.filter((x) => x.fingerprint === 'subject_type=symptom;body_location=leg');
  assert.equal(legs.length, 1, 'no duplicate shell for a profile a real keyword already maps to');
  assert.equal(legs[0].isShell ?? false, false, 'the real topic, not a shell');
  assert.equal(byFp(res, 'subject_type=symptom;body_location=knee').parentId, legs[0].id);
});
