/**
 * Unit tests for the V3 wiring layer (Pivot Session D).
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/auto-analyze-v3.test.ts
 *
 * Covers serializer (TSV shape, sort order, multi-placement, sister links),
 * JSONL parser (snake_case → camelCase translation, error reporting), and
 * the materializer (integer-id assignment, pathway propagation, sister-link
 * + node + pathway diffing).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyOperations,
  buildCanvasStateForApplier,
  buildOperationsInputTsv,
  materializeRebuildPayload,
  parseOperationsJsonl,
  type CanvasNodeRow,
  type KeywordLite,
  type SisterLinkRow,
} from './auto-analyze-v3.ts';

// ============================================================
// Builders
// ============================================================

function rowDefaults(): Omit<
  CanvasNodeRow,
  'id' | 'title' | 'stableId' | 'parentId' | 'pathwayId' | 'relationshipType'
> {
  return {
    description: '',
    x: 0,
    y: 0,
    w: 220,
    h: 160,
    baseY: 0,
    linkedKwIds: [],
    kwPlacements: {},
    collapsedLinear: false,
    collapsedNested: false,
    narrativeBridge: '',
    altTitles: [],
    userMinH: null,
    connCP: null,
    connOutOff: null,
    connInOff: null,
    sortOrder: 0,
    stabilityScore: 0,
  };
}

function row(
  id: number,
  title: string,
  opts: Partial<CanvasNodeRow> = {},
): CanvasNodeRow {
  return {
    ...rowDefaults(),
    id,
    title,
    stableId: opts.stableId ?? `t-${id}`,
    parentId: opts.parentId ?? null,
    pathwayId: opts.pathwayId ?? null,
    relationshipType: opts.relationshipType ?? '',
    ...opts,
  };
}

function kw(id: string, keyword: string): KeywordLite {
  return { id, keyword };
}

// ============================================================
// 1. Serializer
// ============================================================

test('TSV serializer: empty canvas returns header only', () => {
  const tsv = buildOperationsInputTsv([], [], []);
  assert.equal(tsv.split('\n').length, 1);
  assert.match(tsv, /^Stable ID\tTitle\tDescription\t/);
  assert.match(tsv, /\tStability Score\tSister Nodes\tKeywords$/);
});

test('TSV serializer: 9 columns in exact order', () => {
  const n = row(1, 'Root');
  const tsv = buildOperationsInputTsv([n], [], []);
  const cols = tsv.split('\n')[0].split('\t');
  assert.deepEqual(cols, [
    'Stable ID',
    'Title',
    'Description',
    'Parent Stable ID',
    'Relationship',
    'Conversion Path',
    'Stability Score',
    'Sister Nodes',
    'Keywords',
  ]);
});

test('TSV serializer: rows sorted by stableId integer suffix', () => {
  const a = row(1, 'A', { stableId: 't-3' });
  const b = row(2, 'B', { stableId: 't-1' });
  const c = row(3, 'C', { stableId: 't-2' });
  const tsv = buildOperationsInputTsv([a, b, c], [], []);
  const titles = tsv
    .split('\n')
    .slice(1)
    .map(l => l.split('\t')[1]);
  assert.deepEqual(titles, ['B', 'C', 'A']);
});

test('TSV serializer: parent stableId resolved from integer parentId', () => {
  const root = row(1, 'Root');
  const child = row(2, 'Child', {
    parentId: 1,
    relationshipType: 'nested',
  });
  const tsv = buildOperationsInputTsv([root, child], [], []);
  const childRow = tsv.split('\n')[2].split('\t');
  assert.equal(childRow[3], 't-1');
  assert.equal(childRow[4], 'nested');
});

test('TSV serializer: stability score formatted to 1 decimal', () => {
  const n = row(1, 'Stable', { stabilityScore: 7.5 });
  const tsv = buildOperationsInputTsv([n], [], []);
  const dataRow = tsv.split('\n')[1].split('\t');
  assert.equal(dataRow[6], '7.5');
});

test('TSV serializer: Keywords column uses <uuid>|<text> [p|s] format', () => {
  const n = row(1, 'Topic', {
    linkedKwIds: ['uuid-1', 'uuid-2'],
    kwPlacements: { 'uuid-1': 'p', 'uuid-2': 's' },
  });
  const tsv = buildOperationsInputTsv(
    [n],
    [],
    [kw('uuid-1', 'female bursitis'), kw('uuid-2', 'older women joint pain')],
  );
  const dataRow = tsv.split('\n')[1].split('\t');
  assert.equal(
    dataRow[8],
    'uuid-1|female bursitis [p], uuid-2|older women joint pain [s]',
  );
});

test('TSV serializer: sister nodes listed by stableId, sorted, comma-separated', () => {
  const a = row(1, 'A', { stableId: 't-1' });
  const b = row(2, 'B', { stableId: 't-2' });
  const c = row(3, 'C', { stableId: 't-3' });
  const sl: SisterLinkRow[] = [
    { id: 's1', nodeA: 1, nodeB: 3 },
    { id: 's2', nodeA: 1, nodeB: 2 },
  ];
  const tsv = buildOperationsInputTsv([a, b, c], sl, []);
  const aRow = tsv.split('\n')[1].split('\t');
  assert.equal(aRow[7], 't-2, t-3');
});

test('TSV serializer: tabs and newlines in title/description are sanitized', () => {
  const n = row(1, 'Title\twith\ttabs', {
    description: 'desc\nwith\nnewlines',
  });
  const tsv = buildOperationsInputTsv([n], [], []);
  const dataRow = tsv.split('\n')[1].split('\t');
  assert.equal(dataRow[1], 'Title with tabs');
  assert.equal(dataRow[2], 'desc with newlines');
});

// ============================================================
// 2. JSONL parser
// ============================================================

test('Parser: missing start delimiter is reported', () => {
  const r = parseOperationsJsonl('no operations block here');
  assert.equal(r.operations.length, 0);
  assert.match(r.errors[0], /Missing "=== OPERATIONS ===" delimiter/);
});

test('Parser: missing end delimiter is reported', () => {
  const r = parseOperationsJsonl('=== OPERATIONS ===\n{}');
  assert.match(r.errors[0], /Missing "=== END OPERATIONS ===" delimiter/);
});

test('Parser: empty operations block yields zero operations and zero errors', () => {
  const r = parseOperationsJsonl(
    '=== OPERATIONS ===\n=== END OPERATIONS ===',
  );
  assert.equal(r.operations.length, 0);
  assert.equal(r.errors.length, 0);
});

test('Parser: ADD_TOPIC translated', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$new1","title":"T","description":"d","parent":"t-1","relationship":"nested"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.equal(r.errors.length, 0);
  assert.equal(r.operations.length, 1);
  const op = r.operations[0];
  assert.equal(op.type, 'ADD_TOPIC');
  if (op.type === 'ADD_TOPIC') {
    assert.equal(op.id, '$new1');
    assert.equal(op.parent, 't-1');
    assert.equal(op.relationship, 'nested');
  }
});

test('Parser: ADD_TOPIC parent=null is preserved', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"R","description":"d","parent":null,"relationship":"linear"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'ADD_TOPIC') assert.equal(op.parent, null);
});

test('Parser: snake_case keys translated to camelCase (MOVE_TOPIC)', () => {
  const raw = `=== OPERATIONS ===
{"op":"MOVE_TOPIC","id":"t-5","new_parent":"t-2","new_relationship":"nested","reason":"better fit"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  assert.equal(op.type, 'MOVE_TOPIC');
  if (op.type === 'MOVE_TOPIC') {
    assert.equal(op.newParent, 't-2');
    assert.equal(op.newRelationship, 'nested');
    assert.equal(op.reason, 'better fit');
  }
});

test('Parser: justify_restructure object translated', () => {
  const raw = `=== OPERATIONS ===
{"op":"UPDATE_TOPIC_TITLE","id":"t-9","to":"New","justify_restructure":{"topic_affected":"x","prior_state":"a","new_state":"b","score":"7.5","reason":"r","expected_quality_improvement":"e"}}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'UPDATE_TOPIC_TITLE') {
    assert.ok(op.justifyRestructure);
    assert.equal(op.justifyRestructure!.topicAffected, 'x');
    assert.equal(op.justifyRestructure!.expectedQualityImprovement, 'e');
  }
});

test('Parser: SPLIT_TOPIC.into.keyword_ids translated', () => {
  const raw = `=== OPERATIONS ===
{"op":"SPLIT_TOPIC","source_id":"t-3","into":[{"id":"$a","title":"A","description":"","keyword_ids":["k1","k2"]},{"id":"$b","title":"B","description":"","keyword_ids":["k3"]}],"reason":"divergent"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'SPLIT_TOPIC') {
    assert.equal(op.into.length, 2);
    assert.deepEqual(op.into[0].keywordIds, ['k1', 'k2']);
  }
});

test('Parser: DELETE_TOPIC reassign_keywords_to=ARCHIVE', () => {
  const raw = `=== OPERATIONS ===
{"op":"DELETE_TOPIC","id":"t-5","reason":"dead","reassign_keywords_to":"ARCHIVE"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'DELETE_TOPIC') {
    assert.equal(op.reassignKeywordsTo, 'ARCHIVE');
  }
});

test('Parser: malformed JSON line reported, valid lines still parsed', () => {
  const raw = `=== OPERATIONS ===
{not valid json
{"op":"ADD_KEYWORD","topic":"t-1","keyword_id":"k1","placement":"primary"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /Line 1.*not valid JSON/);
  assert.equal(r.operations.length, 1);
  assert.equal(r.operations[0].type, 'ADD_KEYWORD');
});

test('Parser: unknown op reported', () => {
  const raw = `=== OPERATIONS ===
{"op":"DELETE_THE_WORLD"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.match(r.errors[0], /unknown op "DELETE_THE_WORLD"/);
});

// ============================================================
// 3. CanvasState builder
// ============================================================

test('Builder: integer parentId resolved to parent stableId', () => {
  const root = row(1, 'Root', { stableId: 't-1' });
  const child = row(2, 'Child', {
    stableId: 't-2',
    parentId: 1,
    relationshipType: 'nested',
  });
  const state = buildCanvasStateForApplier([root, child], [], 3);
  const childApplier = state.nodes.find(n => n.stableId === 't-2')!;
  assert.equal(childApplier.parentStableId, 't-1');
  assert.equal(childApplier.relationship, 'nested');
});

test('Builder: kwPlacements p/s expanded to primary/secondary', () => {
  const n = row(1, 'T', {
    stableId: 't-1',
    linkedKwIds: ['k1', 'k2'],
    kwPlacements: { k1: 'p', k2: 's' },
  });
  const state = buildCanvasStateForApplier([n], [], 2);
  assert.equal(state.nodes[0].keywordPlacements.k1, 'primary');
  assert.equal(state.nodes[0].keywordPlacements.k2, 'secondary');
});

test('Builder: nextStableIdCounter passes through', () => {
  const state = buildCanvasStateForApplier([], [], 42);
  assert.equal(state.nextStableIdCounter, 42);
});

test('Builder: sister links canonicalized (a < b)', () => {
  const a = row(1, 'A', { stableId: 't-1' });
  const b = row(2, 'B', { stableId: 't-2' });
  const sl: SisterLinkRow[] = [{ id: 's', nodeA: 2, nodeB: 1 }];
  const state = buildCanvasStateForApplier([a, b], sl, 3);
  assert.equal(state.sisterLinks[0].topicAStableId, 't-1');
  assert.equal(state.sisterLinks[0].topicBStableId, 't-2');
});

// ============================================================
// 4. End-to-end: serializer → applier → materializer → rebuild payload
// ============================================================

test('E2E: ADD_TOPIC + ADD_KEYWORD on empty canvas produces correct rebuild payload', () => {
  const state = buildCanvasStateForApplier([], [], 1);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"What is bursitis?","description":"d","parent":null,"relationship":"linear"}
{"op":"ADD_KEYWORD","topic":"$root","keyword_id":"kw-uuid-1","placement":"primary"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok, 'apply should succeed');
  if (!result.ok) return;

  const payload = materializeRebuildPayload({
    originalNodes: [],
    originalSisterLinks: [],
    originalPathwayIds: [],
    applierNewState: result.newState,
    nextPathwayId: 1,
  });
  assert.equal(payload.nodes.length, 1);
  const n = payload.nodes[0];
  // Issued stableId was t-1; integer id should be 1.
  assert.equal(n.id, 1);
  assert.equal(n.parentId, null);
  assert.equal(n.title, 'What is bursitis?');
  assert.deepEqual(n.linkedKwIds, ['kw-uuid-1']);
  assert.deepEqual(n.kwPlacements, { 'kw-uuid-1': 'p' });
  // Pathway should be assigned (it's a root).
  assert.equal(n.pathwayId, 1);
  assert.equal(payload.pathways.length, 1);
  assert.equal(payload.pathways[0].id, 1);
  assert.equal(payload.canvasState.nextNodeId, 2);
});

test('E2E: existing canvas — adding a child preserves parent\'s integer id and pathway', () => {
  const root = row(7, 'Root', { stableId: 't-7', pathwayId: 99 });
  const state = buildCanvasStateForApplier([root], [], 8);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$child","title":"Child","description":"","parent":"t-7","relationship":"nested"}
=== OPERATIONS END
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok);
  if (!result.ok) return;

  const payload = materializeRebuildPayload({
    originalNodes: [root],
    originalSisterLinks: [],
    originalPathwayIds: [99],
    applierNewState: result.newState,
    nextPathwayId: 100,
  });
  // 2 nodes total in result.
  assert.equal(payload.nodes.length, 2);
  const child = payload.nodes.find(n => n.title === 'Child')!;
  assert.equal(child.id, 8);
  assert.equal(child.parentId, 7);
  assert.equal(child.pathwayId, 99); // inherited from root
  assert.equal(payload.pathways.length, 0); // no new pathways
  assert.equal(payload.canvasState.nextNodeId, 9);
  assert.equal(payload.deleteNodeIds.length, 0);
});

test('E2E: DELETE_TOPIC ARCHIVE returns archived keyword id', () => {
  const root = row(1, 'Root', { stableId: 't-1' });
  const dead = row(2, 'Dead', {
    stableId: 't-2',
    parentId: 1,
    relationshipType: 'linear',
    linkedKwIds: ['lonely-kw'],
    kwPlacements: { 'lonely-kw': 'p' },
  });
  const state = buildCanvasStateForApplier([root, dead], [], 3);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"DELETE_TOPIC","id":"t-2","reason":"obsolete","reassign_keywords_to":"ARCHIVE"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.equal(result.archivedKeywords.length, 1);
  assert.equal(result.archivedKeywords[0].keywordId, 'lonely-kw');

  const payload = materializeRebuildPayload({
    originalNodes: [root, dead],
    originalSisterLinks: [],
    originalPathwayIds: [],
    applierNewState: result.newState,
    nextPathwayId: 1,
  });
  assert.deepEqual(payload.deleteNodeIds, [2]);
  assert.equal(payload.nodes.length, 1);
  assert.equal(payload.nodes[0].id, 1);
});

test('E2E: ADD_SISTER_LINK appears in payload.sisterLinks (new only)', () => {
  const a = row(1, 'A', { stableId: 't-1' });
  const b = row(2, 'B', { stableId: 't-2' });
  const c = row(3, 'C', { stableId: 't-3' });
  const existingSl: SisterLinkRow[] = [{ id: 's-old', nodeA: 1, nodeB: 2 }];
  const state = buildCanvasStateForApplier([a, b, c], existingSl, 4);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"ADD_SISTER_LINK","topic_a":"t-1","topic_b":"t-3"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok);
  if (!result.ok) return;

  const payload = materializeRebuildPayload({
    originalNodes: [a, b, c],
    originalSisterLinks: existingSl,
    originalPathwayIds: [],
    applierNewState: result.newState,
    nextPathwayId: 1,
  });
  assert.equal(payload.sisterLinks.length, 1);
  assert.equal(payload.sisterLinks[0].nodeA, 1);
  assert.equal(payload.sisterLinks[0].nodeB, 3);
  assert.equal(payload.deleteSisterLinkIds.length, 0); // old one preserved
});

test('E2E: REMOVE_SISTER_LINK queues the original link id for deletion', () => {
  const a = row(1, 'A', { stableId: 't-1' });
  const b = row(2, 'B', { stableId: 't-2' });
  const existingSl: SisterLinkRow[] = [
    { id: 's-doomed', nodeA: 1, nodeB: 2 },
  ];
  const state = buildCanvasStateForApplier([a, b], existingSl, 3);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"REMOVE_SISTER_LINK","topic_a":"t-1","topic_b":"t-2"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok);
  if (!result.ok) return;

  const payload = materializeRebuildPayload({
    originalNodes: [a, b],
    originalSisterLinks: existingSl,
    originalPathwayIds: [],
    applierNewState: result.newState,
    nextPathwayId: 1,
  });
  assert.deepEqual(payload.deleteSisterLinkIds, ['s-doomed']);
  assert.equal(payload.sisterLinks.length, 0);
});
