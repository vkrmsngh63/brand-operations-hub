/**
 * Tests for §11 reorganization sweeps: cadence schedule (+ guaranteed final),
 * condensed-skeleton/slicing payload guarantees, dead-shell pruning with
 * re-parenting, sibling re-ranking, and judgment-call flagging.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/reorg-sweeps.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  planSweeps,
  condenseSkeleton,
  sliceByParent,
  runMechanicalSweep,
} from './reorg-sweeps.ts';
import type { Topic } from './conservative-merge.ts';
import type { IntentInstance } from './types.ts';
import type { AssembledRulebook } from './rulebook-assembly.ts';

const RB = { naturalSequenceHints: [] } as unknown as AssembledRulebook;

let seq = 0;
function member(): IntentInstance {
  return { id: `i${seq++}`, carrierId: 'c', sourceKeyword: `kw${seq}`, profile: { summary: 's' }, searchVolume: 10, multiplicity: 1 };
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

// ---- cadence ----

test('planSweeps fires every cadence and always ends with a final full sweep', () => {
  assert.deepEqual(planSweeps(200, { cadence: 75 }), [75, 150, 200]);
  assert.deepEqual(planSweeps(150, { cadence: 75 }), [75, 150]); // final coincides with a boundary
  assert.deepEqual(planSweeps(50, { cadence: 75 }), [50]); // small run still gets one final sweep
  assert.deepEqual(planSweeps(0, { cadence: 75 }), []);
});

// ---- payload guarantees ----

test('condenseSkeleton drops members/profiles, keeping only the small skeleton', () => {
  const t = topic({ id: 'A', zone: 'awareness', stage: 'general-noticing', volumeFull: 99, memberInstances: [member(), member()] });
  const [node] = condenseSkeleton([t]);
  assert.equal(node.memberCount, 2);
  assert.equal(node.volumeFull, 99);
  assert.equal(node.zone, 'awareness');
  assert.equal((node as unknown as Record<string, unknown>).memberInstances, undefined, 'no raw members in the skeleton');
});

test('sliceByParent groups each parents direct children into a local slice', () => {
  const slices = sliceByParent([
    topic({ id: 'P', parentId: null }),
    topic({ id: 'A', parentId: 'P' }),
    topic({ id: 'B', parentId: 'P' }),
  ]);
  assert.deepEqual(slices.get('P')!.map((t) => t.id), ['A', 'B']);
  assert.deepEqual(slices.get('')!.map((t) => t.id), ['P']);
});

// ---- mechanical sweep ----

test('a content-bearing shell is retained; a truly dead shell is pruned', () => {
  const live = topic({ id: 'LiveShell', isShell: true, parentId: null });
  const leaf = topic({ id: 'L', parentId: 'LiveShell', memberInstances: [member()], primaryKeywords: ['kw'], volumeFull: 10 });
  const dead = topic({ id: 'DeadShell', isShell: true, parentId: null });

  const res = runMechanicalSweep([live, leaf, dead], RB);
  const ids = res.topics.map((t) => t.id);
  assert.ok(ids.includes('LiveShell'), 'shell with content beneath is kept');
  assert.ok(!ids.includes('DeadShell'), 'empty shell is pruned');
  assert.deepEqual(res.report.prunedShellIds, ['DeadShell']);
});

test('pruning a dead shell re-parents its surviving children up to the shells parent', () => {
  const g = topic({ id: 'G', parentId: null, memberInstances: [member()], primaryKeywords: ['g'], volumeFull: 10 });
  const deadShell = topic({ id: 'S', parentId: 'G', isShell: true }); // no content beneath (X is contentless)
  const x = topic({ id: 'X', parentId: 'S' }); // contentless non-shell → survives, gets re-parented

  const res = runMechanicalSweep([g, deadShell, x], RB);
  const ids = res.topics.map((t) => t.id);
  assert.ok(!ids.includes('S'));
  assert.equal(res.topics.find((t) => t.id === 'X')!.parentId, 'G', 'X lifted to the dead shells parent');
});

test('sibling re-ranking is reported when relative volumes no longer match the order', () => {
  const p = topic({ id: 'P', parentId: null, siblingOrder: 0 });
  const a = topic({ id: 'A', parentId: 'P', volumeFull: 100, siblingOrder: 0 }); // stale: lower volume but first
  const b = topic({ id: 'B', parentId: 'P', volumeFull: 500, siblingOrder: 1 });

  const res = runMechanicalSweep([p, a, b], RB);
  assert.ok(res.report.reRankedParentIds.includes('P'));
  assert.equal(res.topics.find((t) => t.id === 'B')!.siblingOrder, 0, 'higher-volume sibling moves first');
});

test('judgment calls are flagged, not auto-applied (oversized / tiny / orphaned)', () => {
  const oversized = topic({ id: 'Big', parentId: null, memberInstances: [member(), member(), member()], volumeFull: 30 });
  const tiny = topic({ id: 'Tiny', parentId: null, volumeFull: 0 });
  const orphan = topic({ id: 'Orphan', parentId: 'ghost', volumeFull: 5 });

  const res = runMechanicalSweep([oversized, tiny, orphan], RB, { oversizedMemberCount: 2 });
  const byType = new Map(res.report.flags.map((f) => [f.topicId, f.type]));
  assert.equal(byType.get('Big'), 'oversized');
  assert.equal(byType.get('Tiny'), 'tiny');
  assert.equal(byType.get('Orphan'), 'orphaned');
  // nothing was split/merged/relocated: all three topics still present.
  assert.equal(res.topics.length, 3);
});
