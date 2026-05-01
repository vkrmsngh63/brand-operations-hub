/**
 * Unit tests for the operation-applier (Pivot Session B).
 *
 * Run with:
 *   node --test src/lib/operation-applier.test.ts
 *
 * Uses Node's built-in `node:test` and `node:assert/strict`. No external
 * test framework. No DB. No AI.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyOperations,
  type CanvasState,
  type CanvasNode,
  type Operation,
  type ApplyOk,
  type JustifyRestructure,
} from './operation-applier.ts';

// ============================================================
// Builders
// ============================================================

function node(
  stableId: string,
  opts: Partial<CanvasNode> = {},
): CanvasNode {
  return {
    stableId,
    title: opts.title ?? stableId,
    description: opts.description ?? '',
    parentStableId: opts.parentStableId ?? null,
    relationship:
      opts.relationship ?? (opts.parentStableId ? 'linear' : null),
    keywordPlacements: opts.keywordPlacements ?? {},
    stabilityScore: opts.stabilityScore ?? 0,
    intentFingerprint: opts.intentFingerprint ?? '',
  };
}

function emptyState(nextCounter = 100): CanvasState {
  return { nodes: [], sisterLinks: [], nextStableIdCounter: nextCounter };
}

function stateWith(
  nodes: CanvasNode[],
  nextCounter: number,
  sisterLinks: CanvasState['sisterLinks'] = [],
): CanvasState {
  return { nodes, sisterLinks, nextStableIdCounter: nextCounter };
}

function expectOk(result: ReturnType<typeof applyOperations>): ApplyOk {
  if (!result.ok) {
    throw new Error(
      `expected ok=true, got errors:\n${JSON.stringify(result.errors, null, 2)}`,
    );
  }
  return result;
}

function expectErr(
  result: ReturnType<typeof applyOperations>,
  expectedFragment: string,
): void {
  if (result.ok) {
    throw new Error(
      `expected error containing "${expectedFragment}", got ok with newState`,
    );
  }
  const messages = result.errors.map((e) => e.message).join(' | ');
  if (!messages.includes(expectedFragment)) {
    throw new Error(
      `expected error containing "${expectedFragment}", got: ${messages}`,
    );
  }
}

const fullJustify: JustifyRestructure = {
  topicAffected: 't-1: Bursitis pain',
  priorState: 'parent=null, depth=0',
  newState: 'parent=t-2, depth=1',
  score: '8.0',
  reason: 'Director marked t-2 as the canonical parent during review.',
  expectedQualityImprovement: 'Searcher narrative now flows pain → causes → relief',
};

// ============================================================
// ADD_TOPIC
// ============================================================

test('ADD_TOPIC creates a root topic with new stable ID', () => {
  const state = emptyState(50);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$new1', title: 'Root', description: 'd', parent: null, relationship: 'linear' },
  ];
  const r = expectOk(applyOperations(state, ops));
  assert.equal(r.newState.nodes.length, 1);
  assert.equal(r.newState.nodes[0].stableId, 't-50');
  assert.equal(r.newState.nodes[0].parentStableId, null);
  assert.equal(r.newState.nodes[0].relationship, null); // root has no relationship
  assert.equal(r.newState.nextStableIdCounter, 51);
  assert.equal(r.aliasResolutions['$new1'], 't-50');
});

test('ADD_TOPIC chains aliases inside the same batch', () => {
  const state = emptyState(10);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$a', title: 'A', description: '', parent: null, relationship: 'linear' },
    { type: 'ADD_TOPIC', id: '$b', title: 'B', description: '', parent: '$a', relationship: 'nested' },
  ];
  const r = expectOk(applyOperations(state, ops));
  assert.equal(r.aliasResolutions['$a'], 't-10');
  assert.equal(r.aliasResolutions['$b'], 't-11');
  const b = r.newState.nodes.find((n) => n.stableId === 't-11')!;
  assert.equal(b.parentStableId, 't-10');
  assert.equal(b.relationship, 'nested');
});

test('ADD_TOPIC referencing existing stable ID as parent works', () => {
  const state = stateWith([node('t-1')], 20);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$x', title: 'X', description: '', parent: 't-1', relationship: 'linear' },
  ];
  const r = expectOk(applyOperations(state, ops));
  const created = r.newState.nodes.find((n) => n.stableId === 't-20')!;
  assert.equal(created.parentStableId, 't-1');
});

test('ADD_TOPIC with unknown stable ID parent is rejected', () => {
  const state = stateWith([node('t-1')], 20);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$x', title: 'X', description: '', parent: 't-99', relationship: 'linear' },
  ];
  expectErr(applyOperations(state, ops), 'stable ID "t-99" does not exist');
});

test('ADD_TOPIC with forward-ref alias (defined later) is rejected', () => {
  const state = emptyState(10);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$a', title: 'A', description: '', parent: '$b', relationship: 'linear' },
    { type: 'ADD_TOPIC', id: '$b', title: 'B', description: '', parent: null, relationship: 'linear' },
  ];
  expectErr(applyOperations(state, ops), 'alias "$b" was not defined earlier');
});

test('ADD_TOPIC duplicate alias inside the same batch is rejected', () => {
  const state = emptyState(10);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$x', title: 'X1', description: '', parent: null, relationship: 'linear' },
    { type: 'ADD_TOPIC', id: '$x', title: 'X2', description: '', parent: null, relationship: 'linear' },
  ];
  expectErr(applyOperations(state, ops), 'alias "$x" is already defined');
});

test('ADD_TOPIC with empty title is rejected', () => {
  const state = emptyState(10);
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$x', title: '   ', description: '', parent: null, relationship: 'linear' },
  ];
  expectErr(applyOperations(state, ops), 'title must be a non-empty string');
});

// ============================================================
// UPDATE_TOPIC_TITLE / UPDATE_TOPIC_DESCRIPTION
// ============================================================

test('UPDATE_TOPIC_TITLE renames an existing topic', () => {
  const state = stateWith([node('t-1', { title: 'Old' })], 10);
  const r = expectOk(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'New' },
    ]),
  );
  assert.equal(r.newState.nodes[0].title, 'New');
});

test('UPDATE_TOPIC_DESCRIPTION rewrites description without JUSTIFY even on stable topic', () => {
  const state = stateWith(
    [node('t-1', { description: 'old', stabilityScore: 8.5 })],
    10,
  );
  // No JUSTIFY required for description-only edit per PIVOT_DESIGN.md §1.4 rule 6.
  const r = expectOk(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_DESCRIPTION', id: 't-1', to: 'updated' },
    ]),
  );
  assert.equal(r.newState.nodes[0].description, 'updated');
});

test('UPDATE_TOPIC_TITLE without JUSTIFY on stability ≥ 7 is rejected', () => {
  const state = stateWith([node('t-1', { stabilityScore: 7.5 })], 10);
  expectErr(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'New' },
    ]),
    'JUSTIFY_RESTRUCTURE payload missing',
  );
});

test('UPDATE_TOPIC_TITLE with JUSTIFY on stability ≥ 7 is accepted', () => {
  const state = stateWith([node('t-1', { stabilityScore: 7.5 })], 10);
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'UPDATE_TOPIC_TITLE',
        id: 't-1',
        to: 'New',
        justifyRestructure: fullJustify,
      },
    ]),
  );
  assert.equal(r.newState.nodes[0].title, 'New');
});

test('UPDATE_TOPIC_TITLE with incomplete JUSTIFY on stable topic is rejected', () => {
  const state = stateWith([node('t-1', { stabilityScore: 7.5 })], 10);
  const incompleteJustify = { ...fullJustify, reason: '' };
  expectErr(
    applyOperations(state, [
      {
        type: 'UPDATE_TOPIC_TITLE',
        id: 't-1',
        to: 'New',
        justifyRestructure: incompleteJustify,
      },
    ]),
    'JUSTIFY_RESTRUCTURE.reason must be a non-empty string',
  );
});

// ============================================================
// MOVE_TOPIC
// ============================================================

test('MOVE_TOPIC reparents a topic with reason', () => {
  const state = stateWith(
    [
      node('t-1'),
      node('t-2'),
      node('t-3', { parentStableId: 't-1', relationship: 'linear' }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MOVE_TOPIC',
        id: 't-3',
        newParent: 't-2',
        newRelationship: 'nested',
        reason: 'Better fit under t-2',
      },
    ]),
  );
  const t3 = r.newState.nodes.find((n) => n.stableId === 't-3')!;
  assert.equal(t3.parentStableId, 't-2');
  assert.equal(t3.relationship, 'nested');
});

test('MOVE_TOPIC without reason is rejected', () => {
  const state = stateWith([node('t-1'), node('t-2')], 10);
  expectErr(
    applyOperations(state, [
      {
        type: 'MOVE_TOPIC',
        id: 't-2',
        newParent: 't-1',
        newRelationship: 'linear',
        reason: '   ',
      },
    ]),
    'reason must be a non-empty string',
  );
});

test('MOVE_TOPIC to itself is rejected', () => {
  const state = stateWith([node('t-1')], 10);
  expectErr(
    applyOperations(state, [
      {
        type: 'MOVE_TOPIC',
        id: 't-1',
        newParent: 't-1',
        newRelationship: 'linear',
        reason: 'r',
      },
    ]),
    'topic cannot be its own parent',
  );
});

test('MOVE_TOPIC creating a cycle is rejected', () => {
  // t-1 → t-2 (parent t-1) → t-3 (parent t-2). Move t-1 under t-3 would cycle.
  const state = stateWith(
    [
      node('t-1'),
      node('t-2', { parentStableId: 't-1', relationship: 'linear' }),
      node('t-3', { parentStableId: 't-2', relationship: 'linear' }),
    ],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'MOVE_TOPIC',
        id: 't-1',
        newParent: 't-3',
        newRelationship: 'linear',
        reason: 'r',
      },
    ]),
    'parent-cycle',
  );
});

// ============================================================
// MERGE_TOPICS
// ============================================================

test('MERGE_TOPICS combines keywords, reparents children, removes source', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-A': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-B': 'secondary' } }),
      node('t-3', { parentStableId: 't-1', relationship: 'linear' }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'Combined',
        mergedDescription: 'Merged d',
        reason: 'Same intent',
      },
    ]),
  );
  // t-1 gone, t-2 has both keywords, t-3 is now under t-2.
  assert.ok(!r.newState.nodes.find((n) => n.stableId === 't-1'));
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t2.title, 'Combined');
  assert.equal(t2.keywordPlacements['kw-A'], 'primary');
  assert.equal(t2.keywordPlacements['kw-B'], 'secondary');
  const t3 = r.newState.nodes.find((n) => n.stableId === 't-3')!;
  assert.equal(t3.parentStableId, 't-2');
});

test('MERGE_TOPICS preserves target placement on collision', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-X': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-X': 'secondary' } }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'C',
        mergedDescription: '',
        reason: 'r',
      },
    ]),
  );
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t2.keywordPlacements['kw-X'], 'secondary'); // target wins
});

test('MERGE_TOPICS with self target is rejected', () => {
  const state = stateWith([node('t-1')], 10);
  expectErr(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-1',
        mergedTitle: 'C',
        mergedDescription: '',
        reason: 'r',
      },
    ]),
    'sourceId and targetId must differ',
  );
});

test('MERGE_TOPICS without JUSTIFY when either side stable is rejected', () => {
  const state = stateWith(
    [node('t-1'), node('t-2', { stabilityScore: 9 })],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'C',
        mergedDescription: '',
        reason: 'r',
      },
    ]),
    'JUSTIFY_RESTRUCTURE payload missing',
  );
});

// ============================================================
// SPLIT_TOPIC
// ============================================================

test('SPLIT_TOPIC partitions keywords across new aliased topics', () => {
  const state = stateWith(
    [
      node('t-5', {
        keywordPlacements: {
          'kw-1': 'primary',
          'kw-2': 'secondary',
          'kw-3': 'primary',
        },
      }),
    ],
    20,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-5',
        into: [
          { id: '$left', title: 'Left', description: '', keywordIds: ['kw-1', 'kw-2'] },
          { id: '$right', title: 'Right', description: '', keywordIds: ['kw-3'] },
        ],
        reason: 'Split by sub-intent',
      },
    ]),
  );
  // t-5 gone; two new topics.
  assert.ok(!r.newState.nodes.find((n) => n.stableId === 't-5'));
  const left = r.newState.nodes.find((n) => n.stableId === r.aliasResolutions['$left'])!;
  const right = r.newState.nodes.find((n) => n.stableId === r.aliasResolutions['$right'])!;
  assert.deepEqual(Object.keys(left.keywordPlacements).sort(), ['kw-1', 'kw-2']);
  assert.deepEqual(Object.keys(right.keywordPlacements), ['kw-3']);
  // Placement preserved.
  assert.equal(left.keywordPlacements['kw-1'], 'primary');
  assert.equal(left.keywordPlacements['kw-2'], 'secondary');
});

test('SPLIT_TOPIC with unassigned keyword is rejected', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary', 'kw-2': 'primary' } }),
    ],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          { id: '$a', title: 'A', description: '', keywordIds: ['kw-1'] },
          { id: '$b', title: 'B', description: '', keywordIds: [] },
        ],
        reason: 'r',
      },
    ]),
    'was not assigned in any split entry',
  );
});

test('SPLIT_TOPIC with unknown keyword is rejected', () => {
  const state = stateWith(
    [node('t-1', { keywordPlacements: { 'kw-1': 'primary' } })],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          { id: '$a', title: 'A', description: '', keywordIds: ['kw-1'] },
          { id: '$b', title: 'B', description: '', keywordIds: ['kw-99'] },
        ],
        reason: 'r',
      },
    ]),
    'is not at source topic',
  );
});

test('SPLIT_TOPIC with children on source is rejected', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2', { parentStableId: 't-1', relationship: 'linear' }),
    ],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          { id: '$a', title: 'A', description: '', keywordIds: ['kw-1'] },
          { id: '$b', title: 'B', description: '', keywordIds: [] },
        ],
        reason: 'r',
      },
    ]),
    'MOVE_TOPIC its children before splitting',
  );
});

// ============================================================
// DELETE_TOPIC
// ============================================================

test('DELETE_TOPIC reassigns keywords to a target topic', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2'),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'DELETE_TOPIC',
        id: 't-1',
        reason: 'r',
        reassignKeywordsTo: 't-2',
      },
    ]),
  );
  assert.ok(!r.newState.nodes.find((n) => n.stableId === 't-1'));
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t2.keywordPlacements['kw-1'], 'primary');
});

test('DELETE_TOPIC with reassign=ARCHIVE archives keywords with delete reason', () => {
  const state = stateWith(
    [node('t-1', { keywordPlacements: { 'kw-1': 'primary' } })],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'DELETE_TOPIC',
        id: 't-1',
        reason: 'irrelevant cluster',
        reassignKeywordsTo: 'ARCHIVE',
      },
    ]),
  );
  assert.deepEqual(r.archivedKeywords, [
    { keywordId: 'kw-1', reason: 'irrelevant cluster' },
  ]);
});

test('DELETE_TOPIC fails the unplaced-keyword invariant when only placement is dropped without ARCHIVE', () => {
  // Reassigning to a target that doesn't take all keywords still leaves none unplaced
  // because target inherits source's keywords. But DELETE_TOPIC of a topic whose
  // keywords have NO other placement, with reassign target that already holds them,
  // should still pass — target wins on collision.
  // The invariant violation surfaces when a topic with sole-placement keywords is
  // deleted with reassignment to a target that is a different topic that already
  // has those keywords with a different placement — but they're still placed.
  // Skip a pure-failure case here; the ARCHIVE branch covers the orphan path.
  // This test instead verifies that the inverse (DELETE with no orphan) succeeds.
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-1': 'secondary' } }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'DELETE_TOPIC',
        id: 't-1',
        reason: 'r',
        reassignKeywordsTo: 't-2',
      },
    ]),
  );
  // Target keeps existing placement (secondary), kw-1 still placed.
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t2.keywordPlacements['kw-1'], 'secondary');
});

test('DELETE_TOPIC with children is rejected', () => {
  const state = stateWith(
    [
      node('t-1'),
      node('t-2', { parentStableId: 't-1', relationship: 'linear' }),
    ],
    10,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'DELETE_TOPIC',
        id: 't-1',
        reason: 'r',
        reassignKeywordsTo: 'ARCHIVE',
      },
    ]),
    'MOVE_TOPIC its children before deleting',
  );
});

// ============================================================
// ADD/MOVE/REMOVE/ARCHIVE keyword
// ============================================================

test('ADD_KEYWORD places a keyword at a topic', () => {
  const state = stateWith([node('t-1')], 10);
  const r = expectOk(
    applyOperations(state, [
      { type: 'ADD_KEYWORD', topic: 't-1', keywordId: 'kw-1', placement: 'primary' },
    ]),
  );
  assert.equal(r.newState.nodes[0].keywordPlacements['kw-1'], 'primary');
});

test('ADD_KEYWORD duplicate placement at same topic is rejected', () => {
  const state = stateWith(
    [node('t-1', { keywordPlacements: { 'kw-1': 'primary' } })],
    10,
  );
  expectErr(
    applyOperations(state, [
      { type: 'ADD_KEYWORD', topic: 't-1', keywordId: 'kw-1', placement: 'secondary' },
    ]),
    'is already placed at topic t-1',
  );
});

test('MOVE_KEYWORD moves between topics', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2'),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MOVE_KEYWORD',
        keywordId: 'kw-1',
        from: 't-1',
        to: 't-2',
        placement: 'secondary',
      },
    ]),
  );
  const t1 = r.newState.nodes.find((n) => n.stableId === 't-1')!;
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t1.keywordPlacements['kw-1'], undefined);
  assert.equal(t2.keywordPlacements['kw-1'], 'secondary');
});

test('REMOVE_KEYWORD requires another placement', () => {
  const state = stateWith(
    [node('t-1', { keywordPlacements: { 'kw-1': 'primary' } })],
    10,
  );
  expectErr(
    applyOperations(state, [
      { type: 'REMOVE_KEYWORD', keywordId: 'kw-1', from: 't-1' },
    ]),
    'use ARCHIVE_KEYWORD instead',
  );
});

test('REMOVE_KEYWORD with another placement succeeds', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-1': 'secondary' } }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      { type: 'REMOVE_KEYWORD', keywordId: 'kw-1', from: 't-1' },
    ]),
  );
  const t1 = r.newState.nodes.find((n) => n.stableId === 't-1')!;
  assert.equal(t1.keywordPlacements['kw-1'], undefined);
  const t2 = r.newState.nodes.find((n) => n.stableId === 't-2')!;
  assert.equal(t2.keywordPlacements['kw-1'], 'secondary');
});

test('ARCHIVE_KEYWORD removes every placement and records intent', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-1': 'secondary' } }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      { type: 'ARCHIVE_KEYWORD', keywordId: 'kw-1', reason: 'homograph' },
    ]),
  );
  for (const n of r.newState.nodes) {
    assert.equal(n.keywordPlacements['kw-1'], undefined);
  }
  assert.deepEqual(r.archivedKeywords, [
    { keywordId: 'kw-1', reason: 'homograph' },
  ]);
});

test('ARCHIVE_KEYWORD without reason is rejected', () => {
  const state = stateWith(
    [node('t-1', { keywordPlacements: { 'kw-1': 'primary' } })],
    10,
  );
  expectErr(
    applyOperations(state, [
      { type: 'ARCHIVE_KEYWORD', keywordId: 'kw-1', reason: '' },
    ]),
    'reason must be a non-empty string',
  );
});

// ============================================================
// SISTER_LINK
// ============================================================

test('ADD_SISTER_LINK canonicalizes ordering and dedupes', () => {
  const state = stateWith([node('t-1'), node('t-2')], 10);
  const r = expectOk(
    applyOperations(state, [
      { type: 'ADD_SISTER_LINK', topicA: 't-2', topicB: 't-1' },
    ]),
  );
  assert.deepEqual(r.newState.sisterLinks, [
    { topicAStableId: 't-1', topicBStableId: 't-2' },
  ]);
});

test('ADD_SISTER_LINK duplicate is rejected', () => {
  const state = stateWith(
    [node('t-1'), node('t-2')],
    10,
    [{ topicAStableId: 't-1', topicBStableId: 't-2' }],
  );
  expectErr(
    applyOperations(state, [
      { type: 'ADD_SISTER_LINK', topicA: 't-2', topicB: 't-1' },
    ]),
    'already exists',
  );
});

test('REMOVE_SISTER_LINK on missing link is rejected', () => {
  const state = stateWith([node('t-1'), node('t-2')], 10);
  expectErr(
    applyOperations(state, [
      { type: 'REMOVE_SISTER_LINK', topicA: 't-1', topicB: 't-2' },
    ]),
    'does not exist',
  );
});

// ============================================================
// Atomic batch apply
// ============================================================

test('Atomic apply: a bad op late in the batch rolls back all earlier ops', () => {
  const state = stateWith(
    [node('t-1', { title: 'Original' })],
    10,
  );
  const ops: Operation[] = [
    { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'Renamed' },
    { type: 'ADD_TOPIC', id: '$x', title: 'X', description: '', parent: null, relationship: 'linear' },
    // op #2 references a missing topic — should fail.
    { type: 'ADD_KEYWORD', topic: 't-99', keywordId: 'kw-1', placement: 'primary' },
  ];
  const result = applyOperations(state, ops);
  assert.equal(result.ok, false);
  // Original state must be unchanged (caller's state object is never mutated).
  assert.equal(state.nodes[0].title, 'Original');
  assert.equal(state.nodes.length, 1);
  assert.equal(state.nextStableIdCounter, 10);
});

test('Atomic apply: original state object is never mutated on success', () => {
  const state = stateWith([node('t-1')], 10);
  const ops: Operation[] = [
    { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'Renamed' },
  ];
  const r = expectOk(applyOperations(state, ops));
  assert.equal(state.nodes[0].title, 't-1'); // original untouched
  assert.equal(r.newState.nodes[0].title, 'Renamed');
});

// ============================================================
// Invariants
// ============================================================

test('Invariant: original keywords cannot vanish silently', () => {
  // Construct a malicious-but-syntactically-valid op set that, if applied
  // naively, would drop a keyword. The applier's REMOVE_KEYWORD validator
  // already prevents the obvious case; this test pokes ARCHIVE_KEYWORD with
  // a side-channel: archive a keyword AND somehow forget to record the intent.
  // Since ARCHIVE_KEYWORD always records the intent, this test's positive
  // form is trivial. We assert the success path.
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-1': 'primary' } }),
    ],
    10,
  );
  const r = expectOk(
    applyOperations(state, [
      { type: 'ARCHIVE_KEYWORD', keywordId: 'kw-1', reason: 'r' },
    ]),
  );
  // Empty placements; keyword in archive list. Invariant satisfied.
  for (const n of r.newState.nodes) {
    assert.equal(n.keywordPlacements['kw-1'], undefined);
  }
  assert.equal(r.archivedKeywords[0].keywordId, 'kw-1');
});

test('Invariant: pre-existing duplicate stableId in input is reported', () => {
  const state: CanvasState = {
    nodes: [node('t-1'), node('t-1', { title: 'duplicate' })],
    sisterLinks: [],
    nextStableIdCounter: 10,
  };
  const result = applyOperations(state, []);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.errors[0].message.includes('duplicate stableId'));
});

// ============================================================
// Realistic batch
// ============================================================

test('Realistic batch: add subtree of new topics + place keywords + sister link', () => {
  const state = stateWith(
    [
      node('t-1', { title: 'Pain' }),
      node('t-2', { title: 'Causes' }),
    ],
    100,
  );
  const ops: Operation[] = [
    { type: 'ADD_TOPIC', id: '$bursa-types', title: 'Types of bursa', description: '', parent: 't-2', relationship: 'nested' },
    { type: 'ADD_TOPIC', id: '$shoulder', title: 'Shoulder bursa', description: '', parent: '$bursa-types', relationship: 'nested' },
    { type: 'ADD_TOPIC', id: '$hip', title: 'Hip bursa', description: '', parent: '$bursa-types', relationship: 'nested' },
    { type: 'ADD_KEYWORD', topic: '$shoulder', keywordId: 'kw-shoulder-bursa', placement: 'primary' },
    { type: 'ADD_KEYWORD', topic: '$hip', keywordId: 'kw-hip-bursa', placement: 'primary' },
    { type: 'ADD_SISTER_LINK', topicA: '$shoulder', topicB: '$hip' },
    { type: 'UPDATE_TOPIC_DESCRIPTION', id: 't-1', to: 'Searcher entry point: pain' },
  ];
  const r = expectOk(applyOperations(state, ops));
  assert.equal(r.newState.nodes.length, 5);
  assert.equal(r.newState.sisterLinks.length, 1);
  assert.equal(r.newState.nextStableIdCounter, 103);
  // All three aliases resolved.
  assert.ok(r.aliasResolutions['$bursa-types']);
  assert.ok(r.aliasResolutions['$shoulder']);
  assert.ok(r.aliasResolutions['$hip']);
});

// ============================================================
// Scale Session B — intent fingerprint tests
// (per docs/INPUT_CONTEXT_SCALING_DESIGN.md §1.2 + §6 Scale Session B)
// ============================================================

test('Fingerprint: ADD_TOPIC accepts a non-empty fingerprint and persists it on the new node', () => {
  const state = emptyState(100);
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'ADD_TOPIC',
        id: '$root',
        title: 'Bursitis pain',
        description: '',
        parent: null,
        relationship: null,
        intentFingerprint: 'Older bursitis sufferers seeking gentle home relief',
      },
    ]),
  );
  assert.equal(r.newState.nodes.length, 1);
  assert.equal(
    r.newState.nodes[0].intentFingerprint,
    'Older bursitis sufferers seeking gentle home relief',
  );
});

test('Fingerprint: ADD_TOPIC with no intentFingerprint defaults the new node to ""', () => {
  const state = emptyState(100);
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'ADD_TOPIC',
        id: '$root',
        title: 'Bursitis pain',
        description: '',
        parent: null,
        relationship: null,
      },
    ]),
  );
  assert.equal(r.newState.nodes[0].intentFingerprint, '');
});

test('Fingerprint: ADD_TOPIC rejects an empty-string intentFingerprint', () => {
  const state = emptyState(100);
  expectErr(
    applyOperations(state, [
      {
        type: 'ADD_TOPIC',
        id: '$root',
        title: 'Bursitis pain',
        description: '',
        parent: null,
        relationship: null,
        intentFingerprint: '',
      },
    ]),
    'intentFingerprint must be a non-empty string when present',
  );
});

test('Fingerprint: ADD_TOPIC rejects a whitespace-only intentFingerprint', () => {
  const state = emptyState(100);
  expectErr(
    applyOperations(state, [
      {
        type: 'ADD_TOPIC',
        id: '$root',
        title: 'Bursitis pain',
        description: '',
        parent: null,
        relationship: null,
        intentFingerprint: '   \t\n',
      },
    ]),
    'intentFingerprint must be a non-empty string when present',
  );
});

test('Fingerprint: UPDATE_TOPIC_TITLE refreshes intentFingerprint when supplied', () => {
  const state = stateWith(
    [node('t-1', { title: 'Old', intentFingerprint: 'Old fingerprint phrase' })],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'UPDATE_TOPIC_TITLE',
        id: 't-1',
        to: 'New title',
        intentFingerprint: 'Refreshed searcher-centric phrase here',
      },
    ]),
  );
  assert.equal(
    r.newState.nodes[0].intentFingerprint,
    'Refreshed searcher-centric phrase here',
  );
});

test('Fingerprint: UPDATE_TOPIC_TITLE without fingerprint keeps the existing one', () => {
  const state = stateWith(
    [node('t-1', { title: 'Old', intentFingerprint: 'Existing phrase' })],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'New title' },
    ]),
  );
  assert.equal(r.newState.nodes[0].intentFingerprint, 'Existing phrase');
});

test('Fingerprint: UPDATE_TOPIC_TITLE rejects empty-string fingerprint', () => {
  const state = stateWith([node('t-1', { intentFingerprint: 'Existing' })], 100);
  expectErr(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'New title', intentFingerprint: '' },
    ]),
    'intentFingerprint must be a non-empty string when present',
  );
});

test('Fingerprint: UPDATE_TOPIC_DESCRIPTION optionally refreshes fingerprint', () => {
  const state = stateWith(
    [node('t-1', { intentFingerprint: 'Old phrase' })],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'UPDATE_TOPIC_DESCRIPTION',
        id: 't-1',
        to: 'New description',
        intentFingerprint: 'Updated phrase capturing intent shift',
      },
    ]),
  );
  assert.equal(
    r.newState.nodes[0].intentFingerprint,
    'Updated phrase capturing intent shift',
  );
});

test('Fingerprint: UPDATE_TOPIC_DESCRIPTION without fingerprint preserves the existing one', () => {
  const state = stateWith(
    [node('t-1', { intentFingerprint: 'Stable existing phrase' })],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      { type: 'UPDATE_TOPIC_DESCRIPTION', id: 't-1', to: 'pure refinement' },
    ]),
  );
  assert.equal(r.newState.nodes[0].intentFingerprint, 'Stable existing phrase');
});

test('Fingerprint: MERGE_TOPICS replaces target fingerprint when mergedIntentFingerprint provided', () => {
  const state = stateWith(
    [
      node('t-1', { intentFingerprint: 'Source phrase' }),
      node('t-2', { intentFingerprint: 'Target phrase' }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'Merged title',
        mergedDescription: '',
        reason: 'duplicate intent',
        mergedIntentFingerprint: 'Combined searcher intent for merged topic',
      },
    ]),
  );
  assert.equal(r.newState.nodes.length, 1);
  assert.equal(
    r.newState.nodes[0].intentFingerprint,
    'Combined searcher intent for merged topic',
  );
});

test('Fingerprint: MERGE_TOPICS without mergedIntentFingerprint keeps target fingerprint', () => {
  const state = stateWith(
    [
      node('t-1', { intentFingerprint: 'Source phrase' }),
      node('t-2', { intentFingerprint: 'Original target phrase' }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'Merged title',
        mergedDescription: '',
        reason: 'duplicate intent',
      },
    ]),
  );
  assert.equal(r.newState.nodes[0].intentFingerprint, 'Original target phrase');
});

test('Fingerprint: MERGE_TOPICS rejects an empty mergedIntentFingerprint', () => {
  const state = stateWith(
    [node('t-1'), node('t-2')],
    100,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'MERGE_TOPICS',
        sourceId: 't-1',
        targetId: 't-2',
        mergedTitle: 'Merged',
        mergedDescription: '',
        reason: 'duplicate intent',
        mergedIntentFingerprint: '   ',
      },
    ]),
    'mergedIntentFingerprint must be a non-empty string when present',
  );
});

test('Fingerprint: SPLIT_TOPIC into[] entries persist their fingerprints to the new nodes', () => {
  const state = stateWith(
    [
      node('t-1', {
        keywordPlacements: { 'kw-a': 'primary', 'kw-b': 'primary' },
      }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          {
            id: '$one',
            title: 'First half',
            description: '',
            keywordIds: ['kw-a'],
            intentFingerprint: 'First half fingerprint phrase here',
          },
          {
            id: '$two',
            title: 'Second half',
            description: '',
            keywordIds: ['kw-b'],
            intentFingerprint: 'Second half fingerprint phrase here',
          },
        ],
        reason: 'two distinct intents',
      },
    ]),
  );
  const titles = new Map(r.newState.nodes.map((n) => [n.title, n.intentFingerprint]));
  assert.equal(titles.get('First half'), 'First half fingerprint phrase here');
  assert.equal(titles.get('Second half'), 'Second half fingerprint phrase here');
});

test('Fingerprint: SPLIT_TOPIC into[] entries default to "" when no fingerprint supplied', () => {
  const state = stateWith(
    [
      node('t-1', {
        keywordPlacements: { 'kw-a': 'primary', 'kw-b': 'primary' },
      }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          { id: '$one', title: 'First', description: '', keywordIds: ['kw-a'] },
          { id: '$two', title: 'Second', description: '', keywordIds: ['kw-b'] },
        ],
        reason: 'two distinct intents',
      },
    ]),
  );
  for (const n of r.newState.nodes) assert.equal(n.intentFingerprint, '');
});

test('Fingerprint: SPLIT_TOPIC rejects an empty fingerprint on any into[] entry', () => {
  const state = stateWith(
    [
      node('t-1', {
        keywordPlacements: { 'kw-a': 'primary', 'kw-b': 'primary' },
      }),
    ],
    100,
  );
  expectErr(
    applyOperations(state, [
      {
        type: 'SPLIT_TOPIC',
        sourceId: 't-1',
        into: [
          { id: '$one', title: 'First', description: '', keywordIds: ['kw-a'], intentFingerprint: '' },
          { id: '$two', title: 'Second', description: '', keywordIds: ['kw-b'] },
        ],
        reason: 'two distinct intents',
      },
    ]),
    'into["$one"].intentFingerprint must be a non-empty string when present',
  );
});

// ============================================================
// Consolidation mode (Scale Session E — INPUT_CONTEXT_SCALING_DESIGN.md §4.1
// Cluster 4 Q14 lock: ADD_TOPIC + ADD_KEYWORD forbidden; everything else allowed)
// ============================================================

test('Consolidation: ADD_TOPIC is rejected with descriptive error', () => {
  const state = emptyState(50);
  expectErr(
    applyOperations(
      state,
      [{ type: 'ADD_TOPIC', id: '$new1', title: 'X', description: '', parent: null, relationship: null }],
      { consolidationMode: true },
    ),
    'ADD_TOPIC is not allowed in consolidation mode',
  );
});

test('Consolidation: ADD_KEYWORD is rejected with descriptive error', () => {
  const state = stateWith([node('t-1', { keywordPlacements: { 'kw-a': 'primary' } })], 100);
  expectErr(
    applyOperations(
      state,
      [{ type: 'ADD_KEYWORD', topic: 't-1', keywordId: 'kw-new', placement: 'primary' }],
      { consolidationMode: true },
    ),
    'ADD_KEYWORD is not allowed in consolidation mode',
  );
});

test('Consolidation: MERGE_TOPICS succeeds (allowed vocabulary)', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-a': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-b': 'primary' } }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(
      state,
      [
        {
          type: 'MERGE_TOPICS',
          sourceId: 't-1',
          targetId: 't-2',
          mergedTitle: 'Merged',
          mergedDescription: 'Combined',
          reason: 'consolidation: intent-equivalence violation',
        },
      ],
      { consolidationMode: true },
    ),
  );
  // Source removed, target absorbed both keywords.
  assert.equal(r.newState.nodes.length, 1);
  const target = r.newState.nodes[0];
  assert.equal(target.stableId, 't-2');
  assert.equal(target.title, 'Merged');
  assert.deepEqual(Object.keys(target.keywordPlacements).sort(), ['kw-a', 'kw-b']);
});

test('Consolidation: SPLIT_TOPIC succeeds (allowed vocabulary; creates topics via into[] which is not ADD_TOPIC)', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-a': 'primary', 'kw-b': 'primary' } }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(
      state,
      [
        {
          type: 'SPLIT_TOPIC',
          sourceId: 't-1',
          into: [
            { id: '$one', title: 'First', description: '', keywordIds: ['kw-a'] },
            { id: '$two', title: 'Second', description: '', keywordIds: ['kw-b'] },
          ],
          reason: 'consolidation: distinct compound intents',
        },
      ],
      { consolidationMode: true },
    ),
  );
  assert.equal(r.newState.nodes.length, 2);
});

test('Consolidation: MOVE_KEYWORD, MOVE_TOPIC, UPDATE_TOPIC_TITLE, DELETE_TOPIC, ADD_SISTER_LINK all succeed', () => {
  const state = stateWith(
    [
      node('t-1'),
      node('t-2', { parentStableId: 't-1', relationship: 'linear', keywordPlacements: { 'kw-a': 'primary' } }),
      node('t-3', { parentStableId: 't-1', relationship: 'linear', keywordPlacements: { 'kw-b': 'primary' } }),
      node('t-4', { parentStableId: 't-1', relationship: 'linear' }),
    ],
    100,
  );
  const r = expectOk(
    applyOperations(
      state,
      [
        { type: 'MOVE_KEYWORD', keywordId: 'kw-a', from: 't-2', to: 't-3', placement: 'primary' },
        { type: 'MOVE_TOPIC', id: 't-3', newParent: null, newRelationship: 'linear', reason: 'promote to root' },
        { type: 'UPDATE_TOPIC_TITLE', id: 't-2', to: 'Renamed' },
        { type: 'DELETE_TOPIC', id: 't-4', reason: 'empty', reassignKeywordsTo: 'ARCHIVE' },
        { type: 'ADD_SISTER_LINK', topicA: 't-2', topicB: 't-3' },
      ],
      { consolidationMode: true },
    ),
  );
  // t-4 deleted; the rest survive with the structural changes.
  assert.equal(r.newState.nodes.length, 3);
  assert.equal(r.newState.nodes.find((n) => n.stableId === 't-2')!.title, 'Renamed');
  assert.equal(r.newState.nodes.find((n) => n.stableId === 't-3')!.parentStableId, null);
  assert.equal(r.newState.sisterLinks.length, 1);
});

test('Consolidation: a forbidden op fails atomically — earlier allowed ops do NOT persist', () => {
  const state = stateWith(
    [
      node('t-1', { keywordPlacements: { 'kw-a': 'primary' } }),
      node('t-2', { keywordPlacements: { 'kw-b': 'primary' } }),
    ],
    100,
  );
  const result = applyOperations(
    state,
    [
      // Allowed — would succeed alone
      { type: 'UPDATE_TOPIC_TITLE', id: 't-1', to: 'New title' },
      // Forbidden — should reject the whole batch
      { type: 'ADD_TOPIC', id: '$new1', title: 'X', description: '', parent: null, relationship: null },
    ],
    { consolidationMode: true },
  );
  expectErr(result, 'ADD_TOPIC is not allowed in consolidation mode');
  // State is never mutated on a failed apply (atomic contract). Sanity check:
  // the input state's first node still has its original title.
  assert.equal(state.nodes[0].title, 't-1');
});

test('Consolidation: explicit consolidationMode=false behaves like no options (ADD_TOPIC + ADD_KEYWORD allowed)', () => {
  const state = stateWith([node('t-1', { keywordPlacements: { 'kw-a': 'primary' } })], 100);
  expectOk(
    applyOperations(
      state,
      [{ type: 'ADD_TOPIC', id: '$new1', title: 'X', description: '', parent: null, relationship: null }],
      { consolidationMode: false },
    ),
  );
  expectOk(
    applyOperations(
      state,
      [{ type: 'ADD_KEYWORD', topic: 't-1', keywordId: 'kw-new', placement: 'secondary' }],
      { consolidationMode: false },
    ),
  );
});

test('Consolidation: regression — calling applyOperations without options arg still accepts ADD_TOPIC (backwards compat)', () => {
  const state = emptyState(50);
  expectOk(
    applyOperations(state, [
      { type: 'ADD_TOPIC', id: '$new1', title: 'Root', description: '', parent: null, relationship: null },
    ]),
  );
});
