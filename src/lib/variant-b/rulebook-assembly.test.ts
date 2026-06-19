/**
 * Tests for the rulebook assembler (the runtime read-path / UNION).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/rulebook-assembly.test.ts
 *
 * The pure `assembleRulebook` is exercised with synthetic CLR rows: the universal
 * floor with zero rows, niche extension, niche override + re-sort, status/scope
 * filtering, latest-version-wins, ladder/alias parsing, and the assembled
 * helpers (verticalRank honoring niche stages, carrier-dedup config).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DESCRIPTORS,
  ZONES,
  PLACEMENT_RULES,
  IGNORABLE_STOPWORDS,
  NATURAL_SEQUENCE_HINTS,
  RULEBOOK_VERSION,
} from './rulebook.ts';
import {
  assembleRulebook,
  loadAssembledRulebook,
  rbGetZone,
  rbVerticalRank,
  rbGenericStageForZone,
  rbPlacementRulesByPriority,
  rbCarrierDedupConfig,
  type ClrRow,
  type ClrReadStore,
} from './rulebook-assembly.ts';

function row(partial: Partial<ClrRow> & Pick<ClrRow, 'type' | 'payload'>): ClrRow {
  return { scope: 'universal', status: 'active', version: RULEBOOK_VERSION, ...partial };
}

test('zero DB rows ⇒ the universal code floor verbatim', () => {
  const rb = assembleRulebook([]);
  assert.equal(rb.descriptors.length, DESCRIPTORS.length);
  assert.equal(rb.zones.length, ZONES.length);
  assert.equal(rb.placementRules.length, PLACEMENT_RULES.length);
  assert.deepEqual(rb.ignorableStopwords, [...IGNORABLE_STOPWORDS]);
  assert.equal(rb.naturalSequenceHints.length, NATURAL_SEQUENCE_HINTS.length);
  assert.equal(rb.valueLadders.length, 0);
  assert.deepEqual(rb.aliases, {});
  assert.equal(rb.nicheSlug, null);
  assert.equal(rb.clrVersion, RULEBOOK_VERSION);
});

test('placement rules come out sorted ascending by priority', () => {
  const rb = assembleRulebook([]);
  for (let i = 1; i < rb.placementRules.length; i++) {
    assert.ok(rb.placementRules[i].priority >= rb.placementRules[i - 1].priority);
  }
});

test('niche rows are ignored when the project has no niche slug', () => {
  const rows = [row({ type: 'zone', scope: 'niche:knee', payload: { key: 'aftercare', name: 'Aftercare', rank: 8, stages: ['follow-up'] } })];
  const rb = assembleRulebook(rows, { nicheSlug: null });
  assert.equal(rb.zones.length, ZONES.length, 'niche zone must not leak in without a matching slug');
});

test('niche zone extends the zone set when the slug matches', () => {
  const rows = [row({ type: 'zone', scope: 'niche:knee', payload: { key: 'aftercare', name: 'Aftercare', rank: 8, stages: ['follow-up'] } })];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rb.zones.length, ZONES.length + 1);
  assert.ok(rbGetZone(rb, 'aftercare'));
});

test('niche placement rule overrides a universal rule by id and re-sorts', () => {
  // R6 universal priority is 110; override it to priority 5 (should sort to front)
  const rows = [
    row({
      type: 'placement_rule',
      scope: 'niche:knee',
      payload: { id: 'R6', priority: 5, zone: 'solution-research', stage: 'treatment-discovery', all: [] },
    }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rb.placementRules.length, PLACEMENT_RULES.length, 'override replaces, not adds');
  assert.equal(rb.placementRules[0].id, 'R6');
  assert.equal(rb.placementRules[0].priority, 5);
});

test('candidate + retired rows are excluded; approved-candidate is included', () => {
  const base = { type: 'zone' as const, scope: 'niche:knee', payload: { key: 'zc', name: 'Z', rank: 9, stages: [] } };
  const candidate = assembleRulebook([row({ ...base, status: 'candidate' })], { nicheSlug: 'knee' });
  assert.equal(rbGetZone(candidate, 'zc'), undefined);

  const retired = assembleRulebook([row({ ...base, status: 'retired' })], { nicheSlug: 'knee' });
  assert.equal(rbGetZone(retired, 'zc'), undefined);

  const approved = assembleRulebook([row({ ...base, status: 'approved-candidate' })], { nicheSlug: 'knee' });
  assert.ok(rbGetZone(approved, 'zc'));
});

test('latest version wins for a repeated natural key', () => {
  const rows = [
    row({ type: 'zone', scope: 'niche:knee', version: 1, payload: { key: 'zz', name: 'Old', rank: 9, stages: [] } }),
    row({ type: 'zone', scope: 'niche:knee', version: 3, payload: { key: 'zz', name: 'New', rank: 9, stages: [] } }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rbGetZone(rb, 'zz')!.name, 'New');
  assert.equal(rb.clrVersion, 3, 'clrVersion lifts to the max included version');
});

test('niche overrides universal on the same natural key (universal applied first)', () => {
  // override the universal "awareness" zone's name via a niche row
  const rows = [row({ type: 'zone', scope: 'niche:knee', payload: { key: 'awareness', name: 'Niche Awareness', rank: 1, stages: ['general-noticing'] } })];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rbGetZone(rb, 'awareness')!.name, 'Niche Awareness');
});

test('value_ladder specialization → valueLadders; natural-sequence → naturalSequenceHints', () => {
  const rows = [
    row({ type: 'value_ladder', scope: 'niche:knee', payload: { kind: 'specialization', descriptorKey: 'named_entity', ladder: ['nsaid', 'ibuprofen'] } }),
    row({ type: 'value_ladder', scope: 'niche:knee', payload: { kind: 'natural-sequence', descriptorKey: 'severity', sequence: ['x', 'y'] } }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rb.valueLadders.length, 1);
  assert.deepEqual(rb.valueLadders[0].ladder, ['nsaid', 'ibuprofen']);
  // overrides the universal severity hint
  assert.deepEqual(rb.naturalSequenceHints.find((h) => h.descriptorKey === 'severity')!.sequence, ['x', 'y']);
});

test('value/alias rows populate the alias map (lowercased); condition-term sets conditionTerm', () => {
  const rows = [
    row({ type: 'value', scope: 'niche:knee', payload: { kind: 'alias', alias: "Housemaid's Knee", canonical: 'prepatellar bursitis' } }),
    row({ type: 'value', scope: 'niche:knee', payload: { kind: 'condition-term', term: 'bursitis' } }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.equal(rb.aliases["housemaid's knee"], 'prepatellar bursitis');
  assert.equal(rb.conditionTerm, 'bursitis');
});

test('ignorable_set + merge_policy niche rows override the universal defaults', () => {
  const rows = [
    row({ type: 'ignorable_set', scope: 'niche:knee', payload: { key: 'default', stopwords: ['for', 'the', 'a', 'with'] } }),
    row({ type: 'merge_policy', scope: 'niche:knee', payload: { key: 'default', policy: 'custom-policy' } }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  assert.deepEqual(rb.ignorableStopwords, ['for', 'the', 'a', 'with']);
  assert.equal(rb.mergePolicy, 'custom-policy');
});

test('rbVerticalRank honors a niche-added stage order', () => {
  const rows = [row({ type: 'zone', scope: 'niche:knee', payload: { key: 'awareness', name: 'Awareness', rank: 1, stages: ['general-noticing', 'second-stage'] } })];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  // second-stage is index 1 → stageRank 2 → 1 + 0.02
  assert.equal(rbVerticalRank(rb, 'awareness', 'second-stage'), 1.02);
  // unknown stage → front of zone
  assert.equal(rbVerticalRank(rb, 'awareness', 'nope'), 1.0);
  assert.equal(rbVerticalRank(rb, 'no-such-zone', null), null);
});

test('rbGenericStageForZone returns the first stage of the assembled zone', () => {
  const rb = assembleRulebook([]);
  assert.equal(rbGenericStageForZone(rb, 'problem-exploration'), 'symptom-identification');
  assert.equal(rbGenericStageForZone(rb, 'no-such-zone'), null);
});

test('rbPlacementRulesByPriority returns a sorted copy', () => {
  const rb = assembleRulebook([]);
  const sorted = rbPlacementRulesByPriority(rb);
  assert.notEqual(sorted, rb.placementRules); // copy
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].priority >= sorted[i - 1].priority);
});

test('rbCarrierDedupConfig reflects assembled stopwords + aliases + condition term', () => {
  const rows = [
    row({ type: 'value', scope: 'niche:knee', payload: { kind: 'alias', alias: 'X', canonical: 'Y' } }),
    row({ type: 'value', scope: 'niche:knee', payload: { kind: 'condition-term', term: 'bursitis' } }),
  ];
  const rb = assembleRulebook(rows, { nicheSlug: 'knee' });
  const cfg = rbCarrierDedupConfig(rb);
  assert.equal(cfg.conditionTerm, 'bursitis');
  assert.deepEqual(cfg.ignorableStopwords, [...IGNORABLE_STOPWORDS]);
  assert.equal(cfg.aliases!['x'], 'Y');
  // explicit override wins
  assert.equal(rbCarrierDedupConfig(rb, 'override').conditionTerm, 'override');
});

test('loadAssembledRulebook scopes the query and returns an assembled object', async () => {
  let captured: { scope: { in: string[] }; status: { in: string[] } } | null = null;
  const store: ClrReadStore = {
    cLREntry: {
      async findMany({ where }) {
        captured = where;
        return [];
      },
    },
  };
  const rb = await loadAssembledRulebook(store, { nicheSlug: 'knee' });
  assert.deepEqual(captured!.scope.in, ['universal', 'niche:knee']);
  assert.ok(captured!.status.in.includes('active'));
  assert.ok(captured!.status.in.includes('approved-candidate'));
  assert.equal(rb.zones.length, ZONES.length);

  // no niche slug ⇒ universal-only scope
  await loadAssembledRulebook(store, { nicheSlug: null });
  assert.deepEqual(captured!.scope.in, ['universal']);
});
