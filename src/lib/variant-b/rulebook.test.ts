/**
 * Structural-invariant tests for the universal-layer rulebook (rulebook-v0.2).
 *
 * Run with:
 *   node --test src/lib/variant-b/rulebook.test.ts
 *
 * These don't re-assert the rulebook prose; they pin the structural guarantees the
 * pipeline relies on (unique keys, monotonic ranks, evaluable placement rules) plus
 * the data-level guarantees of the reviewer-round-2 placement fixes. Full
 * placement-BEHAVIOR cases (e.g. "diverticulitis vs colon cancer" → differential,
 * "Tylenol vs Advil" → option-vs-option, ambiguous → needs-placement) are deferred
 * to placement.test.ts when placement.ts is built (Step 2).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DESCRIPTORS,
  ZONES,
  PLACEMENT_RULES,
  NATURAL_SEQUENCE_HINTS,
  type PlacementRule,
  type PlacementCondition,
  verticalRank,
  genericStageForZone,
  placementRulesByPriority,
  getDescriptor,
  RULEBOOK_VERSION,
} from './rulebook.ts';

// ============================================================
// Helpers
// ============================================================

function byId(id: string): PlacementRule {
  const r = PLACEMENT_RULES.find((x) => x.id === id);
  assert.ok(r, `placement rule ${id} must exist`);
  return r!;
}

/** Flatten a rule's conditions (both `all` and every `any` group). */
function conds(r: PlacementRule): PlacementCondition[] {
  return [...(r.all ?? []), ...((r.any ?? []).flat())];
}

function hasCue(r: PlacementRule, token: string): boolean {
  return conds(r).some(
    (c) => c.op === 'cue' && (Array.isArray(c.value) ? c.value.includes(token) : c.value === token),
  );
}

// ============================================================
// Version + descriptors
// ============================================================

test('rulebook version is 2 (v0.2)', () => {
  assert.equal(RULEBOOK_VERSION, 2);
});

test('descriptor keys are unique and the reserved summary exists', () => {
  const keys = DESCRIPTORS.map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length, 'descriptor keys must be unique');
  const summary = getDescriptor('summary');
  assert.ok(summary, 'reserved summary descriptor present');
  assert.equal(summary!.group, 'meta');
  assert.equal(summary!.valueMenu, 'open');
});

test('D-meta D1–D4 are NOT descriptor menu entries (they live on the object)', () => {
  // search volume / clarity / confidence / multiplicity must not be descriptors.
  for (const k of ['search_volume', 'clarity', 'confidence', 'multiplicity']) {
    assert.equal(getDescriptor(k), undefined, `${k} must not be a descriptor`);
  }
  // summary is the only meta descriptor.
  const meta = DESCRIPTORS.filter((d) => d.group === 'meta').map((d) => d.key);
  assert.deepEqual(meta, ['summary']);
});

test('fixed-menu descriptors have non-empty controlled vocab with unique values', () => {
  for (const d of DESCRIPTORS) {
    if (Array.isArray(d.valueMenu)) {
      assert.ok(d.valueMenu.length > 0, `${d.key} menu non-empty`);
      assert.equal(new Set(d.valueMenu).size, d.valueMenu.length, `${d.key} values unique`);
    }
  }
});

// ============================================================
// Zones / stages / verticalRank
// ============================================================

test('zones cover ranks 1..7 contiguously and in order', () => {
  const ranks = ZONES.map((z) => z.rank);
  assert.deepEqual(ranks, [1, 2, 3, 4, 5, 6, 7]);
  const keys = ZONES.map((z) => z.key);
  assert.equal(new Set(keys).size, keys.length, 'zone keys unique');
  for (const z of ZONES) assert.ok(z.stages.length > 0, `${z.key} has stages`);
});

test('verticalRank is strictly monotonic down the funnel', () => {
  const ranks: number[] = [];
  for (const z of ZONES) {
    for (const s of z.stages) {
      const r = verticalRank(z.key, s);
      assert.ok(r !== null);
      ranks.push(r!);
    }
  }
  for (let i = 1; i < ranks.length; i++) {
    assert.ok(ranks[i] > ranks[i - 1], `rank must increase at index ${i}`);
  }
});

test('verticalRank: earlier zone always outranks a later zone (journey, not volume)', () => {
  const awareness = verticalRank('awareness', 'general-noticing')!;
  const purchase = verticalRank('decision-purchase', 'where-to-buy')!;
  assert.ok(awareness < purchase);
});

test('verticalRank: null/unknown stage sorts to the FRONT of its zone (parent/spine shells)', () => {
  const front = verticalRank('cause-diagnosis', null)!;
  const firstStage = verticalRank('cause-diagnosis', 'cause-understanding')!;
  assert.ok(front < firstStage, 'null-stage parent heads its zone');
  // but still strictly below the previous zone's deepest stage
  const prevZoneDeep = verticalRank('problem-exploration', 'recovery-expectation')!;
  assert.ok(front > prevZoneDeep, 'still inside its own zone band');
});

test('verticalRank returns null for an unknown zone', () => {
  assert.equal(verticalRank('nope', 'x'), null);
});

test('genericStageForZone returns the first stage of the zone', () => {
  assert.equal(genericStageForZone('problem-exploration'), 'symptom-identification');
  assert.equal(genericStageForZone('nope'), null);
});

// ============================================================
// Placement — structural invariants
// ============================================================

test('placement rule ids are unique and priorities are strictly ordered', () => {
  const ids = PLACEMENT_RULES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, 'rule ids unique');
  const sorted = placementRulesByPriority();
  const prios = sorted.map((r) => r.priority);
  assert.equal(new Set(prios).size, prios.length, 'priorities unique');
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(sorted[i].priority > sorted[i - 1].priority, 'priorities strictly increase');
  }
});

test('precedence ordering: R10/R9 before R7 before R6 (rulebook §5)', () => {
  const order = placementRulesByPriority().map((r) => r.id);
  assert.ok(order.indexOf('R10') < order.indexOf('R7'));
  assert.ok(order.indexOf('R9') < order.indexOf('R7'));
  assert.ok(order.indexOf('R7') < order.indexOf('R6'));
});

test('every placement rule names a real zone and a stage within it, with conditions', () => {
  for (const r of PLACEMENT_RULES) {
    const z = ZONES.find((zz) => zz.key === r.zone);
    assert.ok(z, `${r.id} zone "${r.zone}" exists`);
    assert.ok(z!.stages.includes(r.stage), `${r.id} stage "${r.stage}" in zone "${r.zone}"`);
    if (r.secondaryAffinity) {
      const sz = ZONES.find((zz) => zz.key === r.secondaryAffinity!.zone);
      assert.ok(sz && sz.stages.includes(r.secondaryAffinity!.stage), `${r.id} affinity valid`);
    }
    assert.ok(r.all || r.any, `${r.id} has conditions`);
  }
});

test('R11 carries the Q-RB-A secondary affinity to Post-Purchase', () => {
  const r11 = byId('R11');
  assert.deepEqual(r11.secondaryAffinity, { zone: 'post-purchase', stage: 'recovery-timeline' });
});

// ============================================================
// Placement — reviewer-round-2 fixes (data-level)
// ============================================================

test('NO placement rule keys on a bare vs/or/which cue (descriptor-driven only)', () => {
  for (const r of PLACEMENT_RULES) {
    for (const banned of ['vs', 'or', 'which']) {
      assert.ok(!hasCue(r, banned), `${r.id} must not use the bare "${banned}" cue`);
    }
  }
});

test('R7 fires on product/treatment-comparison signals (not tokens)', () => {
  const r7 = byId('R7');
  assert.equal(r7.zone, 'evaluation');
  assert.equal(r7.stage, 'option-vs-option');
  const cs = conds(r7);
  // subject_type ∈ {comparison, product}
  const st = cs.find((c) => c.descriptorKey === 'subject_type' && c.op === 'in');
  assert.ok(st, 'R7 has subject_type IN condition');
  const stVals = st!.value as string[];
  assert.ok(stVals.includes('comparison') && stVals.includes('product'), 'covers comparison + product');
  // compare-options
  assert.ok(cs.some((c) => c.descriptorKey === 'primary_action' && c.value === 'compare-options'));
  // product-aware
  assert.ok(cs.some((c) => c.descriptorKey === 'awareness_level' && c.value === 'product-aware'));
  // best / top cue (and ONLY those two)
  const cue = cs.find((c) => c.op === 'cue');
  assert.ok(cue, 'R7 keeps a best/top cue');
  assert.deepEqual(cue!.value, ['best', 'top']);
});

test('R3 fires on condition/diagnosis signals (get-diagnosis / diagnosis-test)', () => {
  const r3 = byId('R3');
  assert.equal(r3.zone, 'cause-diagnosis');
  assert.equal(r3.stage, 'differential');
  const cs = conds(r3);
  assert.ok(cs.some((c) => c.descriptorKey === 'primary_action' && c.value === 'get-diagnosis'));
  assert.ok(cs.some((c) => c.descriptorKey === 'subject_type' && c.value === 'diagnosis/test'));
  // and it must NOT depend on a phrase cue
  assert.ok(!cs.some((c) => c.op === 'cue'), 'R3 is descriptor-only, no phrase cue');
});

test('R9C maps subject_type=cost → Decision & Purchase / price', () => {
  const r = byId('R9C');
  assert.equal(r.zone, 'decision-purchase');
  assert.equal(r.stage, 'price');
  assert.ok(conds(r).some((c) => c.descriptorKey === 'subject_type' && c.value === 'cost'));
});

test('R9 maps buy/transactional → Decision & Purchase / where-to-buy (not price)', () => {
  const r = byId('R9');
  assert.equal(r.zone, 'decision-purchase');
  assert.equal(r.stage, 'where-to-buy');
  const cs = conds(r);
  assert.ok(cs.some((c) => c.descriptorKey === 'primary_action' && c.value === 'find-where-to-buy'));
  assert.ok(cs.some((c) => c.descriptorKey === 'commercial_orientation' && c.value === 'transactional'));
  // cost is handled by R9C, not here
  assert.ok(!cs.some((c) => c.value === 'cost'));
});

test('R10S maps check-safety/side-effects → Post-Purchase / side-effects/safety', () => {
  const r = byId('R10S');
  assert.equal(r.zone, 'post-purchase');
  assert.equal(r.stage, 'side-effects/safety');
  assert.ok(conds(r).some((c) => c.descriptorKey === 'primary_action' && c.value === 'check-safety/side-effects'));
});

test('R10 maps learn-usage/dosage → Post-Purchase / usage/dosage (split from safety)', () => {
  const r = byId('R10');
  assert.equal(r.zone, 'post-purchase');
  assert.equal(r.stage, 'usage/dosage');
  const cs = conds(r);
  assert.ok(cs.some((c) => c.descriptorKey === 'primary_action' && c.value === 'learn-usage/dosage'));
  assert.ok(!cs.some((c) => c.value === 'check-safety/side-effects'), 'safety handled by R10S');
});

// ============================================================
// Natural-sequence hints
// ============================================================

test('natural-sequence hints reference real descriptors with non-empty sequences', () => {
  for (const h of NATURAL_SEQUENCE_HINTS) {
    assert.ok(getDescriptor(h.descriptorKey), `${h.descriptorKey} is a descriptor`);
    assert.ok(h.sequence.length > 1);
    assert.equal(new Set(h.sequence).size, h.sequence.length, 'sequence values unique');
  }
});
