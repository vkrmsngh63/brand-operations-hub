/**
 * Tests for §5 funnel placement: first-matching rule wins (priority order),
 * secondary affinity, phrase cues, and the never-guess needs-placement queue
 * with best-effort misfit typing.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/placement.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { placeTopics } from './placement.ts';
import { assembleRulebook } from './rulebook-assembly.ts';
import type { Topic } from './conservative-merge.ts';
import type { DescriptorProfile } from './types.ts';

const RB = assembleRulebook([], {}); // the real universal floor (R1..R11, etc.)

let seq = 0;
function mk(profile: Partial<DescriptorProfile>, opts: { keywords?: string[]; title?: string } = {}): Topic {
  const id = `t${seq++}`;
  return {
    id,
    fingerprint: id,
    title: opts.title ?? id,
    canonicalProfile: { summary: 's', ...profile },
    specificityMarkers: [],
    boundary: { belongs: [], excludes: [] },
    memberInstances: [],
    primaryKeywords: opts.keywords ?? [],
    volumeFull: 100,
  };
}

function outFor(res: { topics: Topic[] }, id: string): Topic {
  return res.topics.find((t) => t.id === id)!;
}

// ---- rule matches ----

test('a descriptor rule places the topic into its zone + stage', () => {
  const t = mk({ primary_action: 'learn-usage/dosage' });
  const res = placeTopics([t], RB);
  const placed = outFor(res, t.id);
  assert.equal(placed.zone, 'post-purchase');
  assert.equal(placed.stage, 'usage/dosage');
  assert.equal(res.stats.byRule['R10'], 1);
  assert.equal(res.needsPlacement.length, 0);
});

test('R11 sets a secondary "also-relevant-in" affinity alongside the primary zone', () => {
  const t = mk({ concern_driver: 'how-long-to-heal' });
  const res = placeTopics([t], RB);
  const placed = outFor(res, t.id);
  assert.equal(placed.zone, 'problem-exploration');
  assert.equal(placed.stage, 'recovery-expectation');
  assert.deepEqual(placed.secondaryAffinity, { zone: 'post-purchase', stage: 'recovery-timeline' });
});

test('a phrase cue ("best") routes a comparison to Evaluation via R7', () => {
  const t = mk({}, { keywords: ['best knee brace'] });
  const res = placeTopics([t], RB);
  const placed = outFor(res, t.id);
  assert.equal(placed.zone, 'evaluation');
  assert.equal(placed.stage, 'option-vs-option');
});

test('first match wins by priority: an explicit usage cue outranks a "best" comparison cue', () => {
  const t = mk({ primary_action: 'learn-usage/dosage' }, { keywords: ['best dosage guide'] });
  const res = placeTopics([t], RB);
  // R10 (priority 10) beats R7 (priority 40) → Post-Purchase, not Evaluation.
  assert.equal(outFor(res, t.id).zone, 'post-purchase');
});

// ---- never guess: needs-placement queue + misfit typing ----

test('no rule match never guesses a zone; it queues with a misfit type', () => {
  const ruleGap = mk({ subject_type: 'symptom' }); // clear subject, but no rule covers it alone
  const noZone = mk({ subject_type: 'definition' }); // intentionally-unplaced subject
  const ambiguous = mk({ body_location: 'knee' }); // no subject + no action signal

  const res = placeTopics([ruleGap, noZone, ambiguous], RB);

  for (const t of [ruleGap, noZone, ambiguous]) {
    const o = outFor(res, t.id);
    assert.equal(o.zone, null, 'unmatched topics are never given a guessed zone');
    assert.equal(o.stage, null);
  }
  const byId = new Map(res.needsPlacement.map((q) => [q.topicId, q.misfitType]));
  assert.equal(byId.get(ruleGap.id), 'rule-gap');
  assert.equal(byId.get(noZone.id), 'no-zone-fits');
  assert.equal(byId.get(ambiguous.id), 'too-ambiguous');
  assert.equal(res.stats.unplaced, 3);
  assert.equal(res.stats.placed, 0);
});

test('stats summarize placed vs queued across a mixed batch', () => {
  const res = placeTopics(
    [mk({ primary_action: 'learn-usage/dosage' }), mk({ subject_type: 'symptom' })],
    RB,
  );
  assert.equal(res.stats.total, 2);
  assert.equal(res.stats.placed, 1);
  assert.equal(res.stats.unplaced, 1);
  assert.equal(res.stats.byMisfit['rule-gap'], 1);
});
