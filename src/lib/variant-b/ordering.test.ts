/**
 * Tests for §10 ordering: natural-sequence-aware sibling order (sequence beats
 * volume) and zone→stage vertical rank.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/ordering.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { orderSiblings, applyVerticalRanks } from './ordering.ts';
import type { Topic } from './conservative-merge.ts';
import type { DescriptorProfile } from './types.ts';
import type { AssembledRulebook } from './rulebook-assembly.ts';
import { DESCRIPTORS, ZONES, NATURAL_SEQUENCE_HINTS } from './rulebook.ts';

function rb(): AssembledRulebook {
  return {
    descriptors: DESCRIPTORS,
    zones: ZONES,
    naturalSequenceHints: NATURAL_SEQUENCE_HINTS,
  } as unknown as AssembledRulebook;
}

let seq = 0;
function mk(profile: Partial<DescriptorProfile>, vol: number, parentId: string | null, id?: string): Topic {
  const tid = id ?? `t${seq++}`;
  return {
    id: tid,
    fingerprint: tid,
    title: tid,
    canonicalProfile: { summary: 's', ...profile },
    specificityMarkers: [],
    boundary: { belongs: [], excludes: [] },
    memberInstances: [],
    primaryKeywords: [],
    volumeFull: vol,
    parentId,
  };
}

function orderedChildIds(topics: Topic[], parentId: string): string[] {
  return topics.find((t) => t.id === parentId)!.children!;
}

// ---- horizontal: natural sequence beats volume ----

test('severity siblings order mild→severe regardless of volume', () => {
  const parent = mk({}, 0, null, 'P');
  const mild = mk({ severity: 'mild' }, 50, 'P', 'mild');
  const moderate = mk({ severity: 'moderate' }, 900, 'P', 'moderate');
  const severe = mk({ severity: 'severe' }, 10, 'P', 'severe');

  const out = orderSiblings([parent, severe, moderate, mild], rb());
  assert.deepEqual(orderedChildIds(out, 'P'), ['mild', 'moderate', 'severe']);
  assert.equal(out.find((t) => t.id === 'mild')!.siblingOrder, 0);
  assert.equal(out.find((t) => t.id === 'severe')!.siblingOrder, 2);
});

test('approach siblings order conservative→aggressive (sequence), not by volume', () => {
  const parent = mk({}, 0, null, 'P');
  const surgical = mk({ approach: 'surgical' }, 1000, 'P', 'surgical');
  const natural = mk({ approach: 'natural' }, 5, 'P', 'natural');
  const behavioral = mk({ approach: 'behavioral' }, 1, 'P', 'behavioral');

  const out = orderSiblings([parent, surgical, natural, behavioral], rb());
  assert.deepEqual(orderedChildIds(out, 'P'), ['behavioral', 'natural', 'surgical']);
});

test('a group with no applicable hint falls back to descending volume', () => {
  const parent = mk({}, 0, null, 'P');
  const knee = mk({ body_location: 'knee' }, 100, 'P', 'knee');
  const ankle = mk({ body_location: 'ankle' }, 500, 'P', 'ankle');

  const out = orderSiblings([parent, knee, ankle], rb());
  assert.deepEqual(orderedChildIds(out, 'P'), ['ankle', 'knee']);
});

test('siblings without the sequenced axis sink below the sequenced ones', () => {
  const parent = mk({}, 0, null, 'P');
  const mild = mk({ severity: 'mild' }, 10, 'P', 'mild');
  const severe = mk({ severity: 'severe' }, 10, 'P', 'severe');
  const other = mk({ body_location: 'knee' }, 9999, 'P', 'other'); // huge volume, no severity

  const out = orderSiblings([parent, other, severe, mild], rb());
  assert.deepEqual(orderedChildIds(out, 'P'), ['mild', 'severe', 'other']);
});

test('root-level topics are ordered too; ordering is independent of input order', () => {
  const a = mk({ body_location: 'a' }, 100, null, 'a');
  const b = mk({ body_location: 'b' }, 300, null, 'b');
  const out1 = orderSiblings([a, b], rb());
  const out2 = orderSiblings([b, a], rb());
  assert.equal(out1.find((t) => t.id === 'b')!.siblingOrder, 0);
  assert.equal(out2.find((t) => t.id === 'b')!.siblingOrder, 0);
});

// ---- vertical: zone → stage rank ----

test('funnelVerticalRank = zone rank then stage rank; unplaced topics stay null', () => {
  const placed = { ...mk({}, 0, null, 'x'), zone: 'cause-diagnosis', stage: 'differential' };
  const early = { ...mk({}, 0, null, 'y'), zone: 'awareness', stage: 'general-noticing' };
  const unplaced = mk({}, 0, null, 'z');

  const out = applyVerticalRanks([placed, early, unplaced], rb());
  // cause-diagnosis rank 3, 'differential' is the 3rd stage → 3 + 3/100
  assert.equal(out.find((t) => t.id === 'x')!.funnelVerticalRank, 3.03);
  // awareness rank 1, 'general-noticing' is the 1st stage → 1 + 1/100
  assert.equal(out.find((t) => t.id === 'y')!.funnelVerticalRank, 1.01);
  assert.equal(out.find((t) => t.id === 'z')!.funnelVerticalRank, null);
});

test('a placed topic with an unknown/missing stage ranks at the front of its zone', () => {
  const noStage = { ...mk({}, 0, null, 'x'), zone: 'solution-research', stage: null };
  const out = applyVerticalRanks([noStage], rb());
  assert.equal(out[0].funnelVerticalRank, 4); // zone rank 4, stage rank 0
});
