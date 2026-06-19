/**
 * Tests for Step 5 conservative merge (identical-profile folding + strict
 * containment → nest candidates; never all-pairs; merge policy from the rulebook).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/conservative-merge.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  conservativeMerge,
  candidateTopic,
  type Topic,
} from './conservative-merge.ts';
import { labelIntent } from './topic-labeling.ts';
import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { DescriptorProfile, IntentInstance } from './types.ts';

// ---- fixtures ----

function rb(mergePolicy: string = 'exact-profile-match'): AssembledRulebook {
  // conservativeMerge only reads `mergePolicy`; labelIntent ignores the rulebook.
  return { mergePolicy } as unknown as AssembledRulebook;
}

let seq = 0;
function intent(profile: DescriptorProfile, over: Partial<IntentInstance> = {}): IntentInstance {
  const id = over.id ?? `i${seq++}`;
  return {
    id,
    carrierId: over.carrierId ?? 'c1',
    sourceKeyword: over.sourceKeyword ?? `kw-${id}`,
    profile,
    searchVolume: over.searchVolume ?? 100,
    multiplicity: over.multiplicity ?? 1,
  };
}

function cand(profile: DescriptorProfile, over: Partial<IntentInstance> = {}): Topic {
  const i = intent(profile, over);
  return candidateTopic(i, labelIntent(i));
}

function p(over: Partial<DescriptorProfile> = {}): DescriptorProfile {
  return { summary: 's', ...over };
}

// ---- merge: identical profiles ----

test('identical canonical profiles merge into one topic with combined members', () => {
  const a = cand(p({ subject_type: 'symptom' }), { sourceKeyword: 'knee pain', searchVolume: 300 });
  const b = cand(p({ subject_type: 'symptom' }), { sourceKeyword: 'sore knee', searchVolume: 200 });
  const { topics, stats } = conservativeMerge([a, b], rb());

  assert.equal(topics.length, 1);
  assert.equal(topics[0].memberInstances.length, 2);
  assert.equal(topics[0].volumeFull, 500);
  assert.deepEqual(topics[0].primaryKeywords, ['knee pain', 'sore knee']);
  assert.equal(stats.mergedGroups, 1);
  assert.equal(stats.outputTopics, 1);
  assert.equal(stats.inputInstances, 2);
});

test('a differing free-text summary still merges (summary is not part of the profile)', () => {
  const a = cand(p({ subject_type: 'symptom', summary: 'one' }));
  const b = cand(p({ subject_type: 'symptom', summary: 'completely different' }));
  const { topics } = conservativeMerge([a, b], rb());
  assert.equal(topics.length, 1);
  assert.equal(topics[0].memberInstances.length, 2);
});

test('different profiles do NOT merge', () => {
  const a = cand(p({ subject_type: 'symptom' }));
  const b = cand(p({ subject_type: 'cause/trigger' }));
  const { topics, stats } = conservativeMerge([a, b], rb());
  assert.equal(topics.length, 2);
  assert.equal(stats.mergedGroups, 0);
});

test('merged topic id is derived from the fingerprint (idempotent across runs)', () => {
  const a = cand(p({ subject_type: 'symptom' }));
  const r1 = conservativeMerge([a], rb());
  const r2 = conservativeMerge([a], rb());
  assert.equal(r1.topics[0].id, 't:subject_type=symptom');
  assert.equal(r1.topics[0].id, r2.topics[0].id);
});

test('duplicate source keywords are de-duplicated in primaryKeywords; volume still sums', () => {
  const a = cand(p({ subject_type: 'symptom' }), { sourceKeyword: 'knee pain', searchVolume: 100 });
  const b = cand(p({ subject_type: 'symptom' }), { sourceKeyword: 'knee pain', searchVolume: 50 });
  const { topics } = conservativeMerge([a, b], rb());
  assert.deepEqual(topics[0].primaryKeywords, ['knee pain']);
  assert.equal(topics[0].volumeFull, 150);
});

// ---- containment → nest candidate, never merge ----

test('strict containment yields a nest candidate (general = parent, specific = child), never a merge', () => {
  const general = cand(p({ subject_type: 'symptom' }));
  const specific = cand(p({ subject_type: 'symptom', body_location: 'knee' }));
  const { topics, nestCandidates } = conservativeMerge([general, specific], rb());

  assert.equal(topics.length, 2, 'containment never collapses two topics');
  assert.equal(nestCandidates.length, 1);
  assert.equal(nestCandidates[0].parentId, 't:subject_type=symptom');
  assert.equal(nestCandidates[0].childId, 't:subject_type=symptom;body_location=knee');
});

test('equal-size profiles that differ in value are neither merged nor nested', () => {
  const a = cand(p({ severity: 'mild' }));
  const b = cand(p({ severity: 'severe' }));
  const { topics, nestCandidates } = conservativeMerge([a, b], rb());
  assert.equal(topics.length, 2);
  assert.equal(nestCandidates.length, 0);
});

test('a multi-level containment chain emits every direct strict-containment edge', () => {
  const general = cand(p({ subject_type: 'symptom' }));
  const mid = cand(p({ subject_type: 'symptom', body_location: 'knee' }));
  const specific = cand(p({ subject_type: 'symptom', body_location: 'knee', severity: 'mild' }));
  const { nestCandidates } = conservativeMerge([general, mid, specific], rb());

  const edges = nestCandidates.map((e) => `${e.parentId} -> ${e.childId}`);
  assert.equal(edges.length, 3);
  assert.ok(edges.includes('t:subject_type=symptom -> t:subject_type=symptom;body_location=knee'));
  assert.ok(edges.includes('t:subject_type=symptom -> t:subject_type=symptom;body_location=knee;severity=mild'));
  assert.ok(edges.includes('t:subject_type=symptom;body_location=knee -> t:subject_type=symptom;body_location=knee;severity=mild'));
});

test('topics sharing no axis token produce no nest candidate (the non-all-pairs neighborhood)', () => {
  const a = cand(p({ subject_type: 'symptom' }));
  const b = cand(p({ primary_action: 'find-cause' }));
  const { nestCandidates } = conservativeMerge([a, b], rb());
  assert.equal(nestCandidates.length, 0);
});

test('an unspecified (zero-axis) topic is never a nest parent', () => {
  const empty = cand(p()); // no descriptor axes → fingerprint "unspecified"
  const some = cand(p({ subject_type: 'symptom' }));
  const { topics, nestCandidates } = conservativeMerge([empty, some], rb());
  assert.equal(topics.length, 2);
  assert.equal(nestCandidates.length, 0);
});

// ---- merge policy comes from the assembled rulebook ----

test('merge policy is echoed from the rulebook; an unrecognized policy falls back to exact match', () => {
  const a = cand(p({ subject_type: 'symptom' }));
  const b = cand(p({ subject_type: 'symptom' }));
  const c = cand(p({ subject_type: 'cause/trigger' }));

  const exact = conservativeMerge([a, b, c], rb('exact-profile-match'));
  assert.equal(exact.stats.mergePolicy, 'exact-profile-match');
  assert.equal(exact.stats.policyFallback, false);

  const loose = conservativeMerge([a, b, c], rb('some-future-loose-policy'));
  assert.equal(loose.stats.mergePolicy, 'some-future-loose-policy');
  assert.equal(loose.stats.policyFallback, true);
  // never merges looser than the exact floor: a+b merge, c stays separate.
  assert.equal(loose.topics.length, 2);
});

// ---- determinism + self-purification ----

test('output topics are sorted by descending volume then fingerprint', () => {
  const low = cand(p({ subject_type: 'cause/trigger' }), { searchVolume: 10 });
  const high = cand(p({ subject_type: 'symptom' }), { searchVolume: 9000 });
  const { topics } = conservativeMerge([low, high], rb());
  assert.equal(topics[0].fingerprint, 'subject_type=symptom');
  assert.equal(topics[1].fingerprint, 'subject_type=cause/trigger');
});

test('a member is re-bucketed by its own profile even if the source topic claims a wrong fingerprint', () => {
  const i = intent(p({ subject_type: 'symptom' }));
  const built = candidateTopic(i, labelIntent(i));
  const corrupted: Topic = { ...built, id: 'stale', fingerprint: 'WRONG' };

  const { topics } = conservativeMerge([corrupted], rb());
  assert.equal(topics.length, 1);
  assert.equal(topics[0].fingerprint, 'subject_type=symptom');
  assert.equal(topics[0].id, 't:subject_type=symptom');
  assert.ok(topics[0].title.length > 0, 'label is recomputed when the source label is invalid');
});

test('candidateTopic builds a single-member topic carrying the label fields', () => {
  const i = intent(p({ subject_type: 'symptom', body_location: 'knee' }), { sourceKeyword: 'knee pain', searchVolume: 42 });
  const t = candidateTopic(i, labelIntent(i));
  assert.equal(t.memberInstances.length, 1);
  assert.equal(t.volumeFull, 42);
  assert.deepEqual(t.primaryKeywords, ['knee pain']);
  assert.equal(t.fingerprint, 'subject_type=symptom;body_location=knee');
  assert.ok(t.title.length > 0);
});

test('empty input yields an empty, well-formed result', () => {
  const { topics, nestCandidates, stats } = conservativeMerge([], rb());
  assert.deepEqual(topics, []);
  assert.deepEqual(nestCandidates, []);
  assert.equal(stats.inputInstances, 0);
  assert.equal(stats.outputTopics, 0);
});
