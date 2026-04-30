/**
 * Unit tests for the V3 wiring layer.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/auto-analyze-v3.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyOperations,
  batchesSinceTouch,
  buildCanvasStateForApplier,
  buildOperationsInputTsv,
  computeBatchRelevantSubtree,
  createTouchTracker,
  decideTier,
  deserializeTouchTracker,
  formatTier1KeywordSummary,
  materializeRebuildPayload,
  parseOperationsJsonl,
  recordTouchesFromOps,
  serializeTouchTracker,
  stemTokens,
  TIER_HEADERS,
  type CanvasNodeRow,
  type KeywordLite,
  type SisterLinkRow,
  type TierContext,
} from './auto-analyze-v3.ts';

// ============================================================
// Builders
// ============================================================

/** Deterministic uuid generator for tests: returns "uuid-1", "uuid-2", … */
function makeUuid() {
  let n = 0;
  return () => `uuid-${++n}`;
}

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
  id: string,
  title: string,
  opts: Partial<CanvasNodeRow> = {},
): CanvasNodeRow {
  return {
    ...rowDefaults(),
    id,
    title,
    stableId: opts.stableId ?? `t-${id.replace(/^node-/, '')}`,
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
  const n = row('node-1', 'Root');
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
  const a = row('node-a', 'A', { stableId: 't-3' });
  const b = row('node-b', 'B', { stableId: 't-1' });
  const c = row('node-c', 'C', { stableId: 't-2' });
  const tsv = buildOperationsInputTsv([a, b, c], [], []);
  const titles = tsv
    .split('\n')
    .slice(1)
    .map(l => l.split('\t')[1]);
  assert.deepEqual(titles, ['B', 'C', 'A']);
});

test('TSV serializer: parent stableId resolved from string parentId', () => {
  const root = row('node-root', 'Root', { stableId: 't-1' });
  const child = row('node-child', 'Child', {
    stableId: 't-2',
    parentId: 'node-root',
    relationshipType: 'nested',
  });
  const tsv = buildOperationsInputTsv([root, child], [], []);
  const childRow = tsv.split('\n')[2].split('\t');
  assert.equal(childRow[3], 't-1');
  assert.equal(childRow[4], 'nested');
});

test('TSV serializer: stability score formatted to 1 decimal', () => {
  const n = row('node-1', 'Stable', { stabilityScore: 7.5 });
  const tsv = buildOperationsInputTsv([n], [], []);
  const dataRow = tsv.split('\n')[1].split('\t');
  assert.equal(dataRow[6], '7.5');
});

test('TSV serializer: Keywords column uses <uuid>|<text> [p|s] format', () => {
  const n = row('node-1', 'Topic', {
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
  const a = row('node-a', 'A', { stableId: 't-1' });
  const b = row('node-b', 'B', { stableId: 't-2' });
  const c = row('node-c', 'C', { stableId: 't-3' });
  const sl: SisterLinkRow[] = [
    { id: 's1', nodeA: 'node-a', nodeB: 'node-c' },
    { id: 's2', nodeA: 'node-a', nodeB: 'node-b' },
  ];
  const tsv = buildOperationsInputTsv([a, b, c], sl, []);
  const aRow = tsv.split('\n')[1].split('\t');
  assert.equal(aRow[7], 't-2, t-3');
});

test('TSV serializer: tabs and newlines in title/description are sanitized', () => {
  const n = row('node-1', 'Title\twith\ttabs', {
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

test('Parser: ADD_TOPIC root with relationship=null parses to null (not rejected)', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"R","description":"d","parent":null,"relationship":null}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.equal(r.errors.length, 0);
  const op = r.operations[0];
  if (op.type === 'ADD_TOPIC') assert.equal(op.relationship, null);
});

test('Parser: ADD_TOPIC root with relationship omitted parses to null', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"R","description":"d","parent":null}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.equal(r.errors.length, 0);
  const op = r.operations[0];
  if (op.type === 'ADD_TOPIC') assert.equal(op.relationship, null);
});

test('E2E regression: empty canvas + ADD_TOPIC root with null relationship applies cleanly', () => {
  // Test 1 regression (2026-04-25): root topic ADD_TOPIC with null/missing
  // relationship was rejected atomically. Per PIVOT_DESIGN §1.1 + V3 prompt,
  // relationship is "ignored for root" — root topics get relationship nulled
  // at apply time regardless of what was emitted.
  const state = buildCanvasStateForApplier([], [], 1);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"What is bursitis?","description":"d","parent":null,"relationship":null}
{"op":"ADD_TOPIC","id":"$child","title":"Hip bursitis","description":"d","parent":"$root","relationship":"nested"}
{"op":"ADD_KEYWORD","topic":"$child","keyword_id":"kw-1","placement":"primary"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok, 'apply should succeed for root with null relationship');
  if (!result.ok) return;
  const root = result.newState.nodes.find(n => n.title === 'What is bursitis?')!;
  assert.equal(root.parentStableId, null);
  assert.equal(root.relationship, null);
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

test('Builder: string parentId resolved to parent stableId', () => {
  const root = row('node-root', 'Root', { stableId: 't-1' });
  const child = row('node-child', 'Child', {
    stableId: 't-2',
    parentId: 'node-root',
    relationshipType: 'nested',
  });
  const state = buildCanvasStateForApplier([root, child], [], 3);
  const childApplier = state.nodes.find(n => n.stableId === 't-2')!;
  assert.equal(childApplier.parentStableId, 't-1');
  assert.equal(childApplier.relationship, 'nested');
});

test('Builder: kwPlacements p/s expanded to primary/secondary', () => {
  const n = row('node-1', 'T', {
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
  const a = row('node-a', 'A', { stableId: 't-1' });
  const b = row('node-b', 'B', { stableId: 't-2' });
  const sl: SisterLinkRow[] = [{ id: 's', nodeA: 'node-b', nodeB: 'node-a' }];
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
    uuid: makeUuid(),
  });
  assert.equal(payload.nodes.length, 1);
  const n = payload.nodes[0];
  assert.equal(typeof n.id, 'string');
  assert.equal(n.id, 'uuid-1');
  assert.equal(n.parentId, null);
  assert.equal(n.title, 'What is bursitis?');
  assert.equal(n.stableId, 't-1');
  assert.deepEqual(n.linkedKwIds, ['kw-uuid-1']);
  assert.deepEqual(n.kwPlacements, { 'kw-uuid-1': 'p' });
  // Pathway should be assigned (it's a root) — fresh UUID.
  assert.equal(n.pathwayId, 'uuid-2');
  assert.equal(payload.pathways.length, 1);
  assert.equal(payload.pathways[0].id, 'uuid-2');
  // After issuing t-1 the counter advances to 2.
  assert.equal(payload.canvasState.nextStableIdN, 2);
});

test('E2E: existing canvas — adding a child preserves parent\'s id and pathway', () => {
  const root = row('parent-uuid', 'Root', {
    stableId: 't-7',
    pathwayId: 'pw-existing',
  });
  const state = buildCanvasStateForApplier([root], [], 8);
  const ops = parseOperationsJsonl(`=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$child","title":"Child","description":"","parent":"t-7","relationship":"nested"}
=== END OPERATIONS ===`).operations;
  const result = applyOperations(state, ops);
  assert.ok(result.ok);
  if (!result.ok) return;

  const payload = materializeRebuildPayload({
    originalNodes: [root],
    originalSisterLinks: [],
    originalPathwayIds: ['pw-existing'],
    applierNewState: result.newState,
    uuid: makeUuid(),
  });
  assert.equal(payload.nodes.length, 2);
  const child = payload.nodes.find(n => n.title === 'Child')!;
  assert.equal(child.id, 'uuid-1');
  assert.equal(child.parentId, 'parent-uuid');
  assert.equal(child.pathwayId, 'pw-existing'); // inherited from root
  assert.equal(payload.pathways.length, 0); // no new pathways
  assert.equal(payload.canvasState.nextStableIdN, 9);
  assert.equal(payload.deleteNodeIds.length, 0);
});

test('E2E: DELETE_TOPIC ARCHIVE returns archived keyword id', () => {
  const root = row('root-uuid', 'Root', { stableId: 't-1' });
  const dead = row('dead-uuid', 'Dead', {
    stableId: 't-2',
    parentId: 'root-uuid',
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
    uuid: makeUuid(),
  });
  assert.deepEqual(payload.deleteNodeIds, ['dead-uuid']);
  assert.equal(payload.nodes.length, 1);
  assert.equal(payload.nodes[0].id, 'root-uuid');
});

test('E2E: ADD_SISTER_LINK appears in payload.sisterLinks (new only)', () => {
  const a = row('a-uuid', 'A', { stableId: 't-1' });
  const b = row('b-uuid', 'B', { stableId: 't-2' });
  const c = row('c-uuid', 'C', { stableId: 't-3' });
  const existingSl: SisterLinkRow[] = [
    { id: 's-old', nodeA: 'a-uuid', nodeB: 'b-uuid' },
  ];
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
    uuid: makeUuid(),
  });
  assert.equal(payload.sisterLinks.length, 1);
  assert.equal(payload.sisterLinks[0].nodeA, 'a-uuid');
  assert.equal(payload.sisterLinks[0].nodeB, 'c-uuid');
  assert.equal(payload.deleteSisterLinkIds.length, 0);
});

test('E2E: REMOVE_SISTER_LINK queues the original link id for deletion', () => {
  const a = row('a-uuid', 'A', { stableId: 't-1' });
  const b = row('b-uuid', 'B', { stableId: 't-2' });
  const existingSl: SisterLinkRow[] = [
    { id: 's-doomed', nodeA: 'a-uuid', nodeB: 'b-uuid' },
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
    uuid: makeUuid(),
  });
  assert.deepEqual(payload.deleteSisterLinkIds, ['s-doomed']);
  assert.equal(payload.sisterLinks.length, 0);
});

// ============================================================
// Scale Session B — intent fingerprint parser translation
// (per docs/INPUT_CONTEXT_SCALING_DESIGN.md §6 Scale Session B)
// ============================================================

test('Parser: ADD_TOPIC translates intent_fingerprint → intentFingerprint', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"R","description":"d","parent":null,"relationship":null,"intent_fingerprint":"Older bursitis sufferers seeking gentle home relief"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  assert.equal(r.errors.length, 0);
  const op = r.operations[0];
  if (op.type === 'ADD_TOPIC') {
    assert.equal(
      op.intentFingerprint,
      'Older bursitis sufferers seeking gentle home relief',
    );
  } else {
    throw new Error('expected ADD_TOPIC');
  }
});

test('Parser: ADD_TOPIC without intent_fingerprint produces undefined', () => {
  const raw = `=== OPERATIONS ===
{"op":"ADD_TOPIC","id":"$root","title":"R","description":"d","parent":null,"relationship":null}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'ADD_TOPIC') {
    assert.equal(op.intentFingerprint, undefined);
  }
});

test('Parser: UPDATE_TOPIC_TITLE translates intent_fingerprint', () => {
  const raw = `=== OPERATIONS ===
{"op":"UPDATE_TOPIC_TITLE","id":"t-1","to":"New title","intent_fingerprint":"Refreshed phrase here"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'UPDATE_TOPIC_TITLE') {
    assert.equal(op.intentFingerprint, 'Refreshed phrase here');
  }
});

test('Parser: UPDATE_TOPIC_DESCRIPTION translates intent_fingerprint', () => {
  const raw = `=== OPERATIONS ===
{"op":"UPDATE_TOPIC_DESCRIPTION","id":"t-1","to":"new desc","intent_fingerprint":"Description-driven phrase"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'UPDATE_TOPIC_DESCRIPTION') {
    assert.equal(op.intentFingerprint, 'Description-driven phrase');
  }
});

test('Parser: MERGE_TOPICS translates merged_intent_fingerprint → mergedIntentFingerprint', () => {
  const raw = `=== OPERATIONS ===
{"op":"MERGE_TOPICS","source_id":"t-1","target_id":"t-2","merged_title":"M","merged_description":"d","reason":"dup","merged_intent_fingerprint":"Combined searcher intent for merged topic"}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'MERGE_TOPICS') {
    assert.equal(
      op.mergedIntentFingerprint,
      'Combined searcher intent for merged topic',
    );
  }
});

test('Parser: SPLIT_TOPIC translates intent_fingerprint per into[] entry', () => {
  const raw = `=== OPERATIONS ===
{"op":"SPLIT_TOPIC","source_id":"t-1","reason":"two intents","into":[{"id":"$one","title":"First","description":"","keyword_ids":["kw-a"],"intent_fingerprint":"First half phrase"},{"id":"$two","title":"Second","description":"","keyword_ids":["kw-b"],"intent_fingerprint":"Second half phrase"}]}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'SPLIT_TOPIC') {
    assert.equal(op.into[0].intentFingerprint, 'First half phrase');
    assert.equal(op.into[1].intentFingerprint, 'Second half phrase');
  }
});

test('Parser: SPLIT_TOPIC without intent_fingerprint per entry yields undefined', () => {
  const raw = `=== OPERATIONS ===
{"op":"SPLIT_TOPIC","source_id":"t-1","reason":"two intents","into":[{"id":"$one","title":"First","description":"","keyword_ids":["kw-a"]},{"id":"$two","title":"Second","description":"","keyword_ids":["kw-b"]}]}
=== END OPERATIONS ===`;
  const r = parseOperationsJsonl(raw);
  const op = r.operations[0];
  if (op.type === 'SPLIT_TOPIC') {
    assert.equal(op.into[0].intentFingerprint, undefined);
    assert.equal(op.into[1].intentFingerprint, undefined);
  }
});

// ============================================================
// Scale Session C — Tiered Canvas Serialization
// (per docs/INPUT_CONTEXT_SCALING_DESIGN.md §1–§4 + §6 Scale Session C)
// ============================================================

// ---- Stemmer / tokenizer (Cluster 3 Q12 mechanism) -------------------------

test('stemTokens: lowercase + split on non-alphanumeric', () => {
  const stems = stemTokens('Hip-Bursitis Treatment, Older-Adults!');
  assert.ok(stems.has('hip'));
  assert.ok(stems.has('older'));
  assert.ok(stems.has('adult'));
  assert.ok(!stems.has(''));
});

test('stemTokens: drops stopwords and short tokens', () => {
  const stems = stemTokens('the of in pain on at');
  // All stopwords; short tokens (<3 chars) also dropped.
  assert.equal(stems.size, 1);
  assert.ok(stems.has('pain'));
});

test('stemTokens: -ing strip + doubled-consonant collapse', () => {
  const a = stemTokens('running');
  const b = stemTokens('run');
  // "running" → strip -ing → "runn" → collapse doubled n → "run"
  assert.ok(a.has('run'));
  assert.ok(b.has('run'));
});

test('stemTokens: -s strip but preserves -ss / -is / -us / -as', () => {
  // "topics" → "topic"; "bursitis" stays (-is preserved); "kiss" stays (-ss).
  const stems = stemTokens('topics bursitis kiss bus atlas');
  assert.ok(stems.has('topic'));
  assert.ok(stems.has('bursitis'));
  assert.ok(stems.has('kiss'));
  assert.ok(stems.has('bus'));
  assert.ok(stems.has('atlas'));
});

test('stemTokens: -ed / -ly / -es stripped', () => {
  const stems = stemTokens('inflamed slowly bushes');
  assert.ok(stems.has('inflam'));
  assert.ok(stems.has('slow'));
  assert.ok(stems.has('bush'));
});

// ---- computeBatchRelevantSubtree (Cluster 3 locks) -------------------------

test('computeBatchRelevantSubtree: empty batch → empty subtree', () => {
  const n = row('node-1', 'Hip Bursitis', { stableId: 't-1' });
  const sub = computeBatchRelevantSubtree({
    batchKeywords: [],
    nodes: [n],
    keywords: [],
  });
  assert.equal(sub.size, 0);
});

test('computeBatchRelevantSubtree: single match promotes one-hop neighborhood', () => {
  // Hierarchy: t-1 (root) → t-2 (target of match) → t-4 (child); t-3 sibling
  // of t-2 under t-1; t-5 unrelated under another root t-99.
  const root = row('uuid-root', 'Bursitis Overview', { stableId: 't-1' });
  const target = row('uuid-target', 'Hip Bursitis', {
    stableId: 't-2',
    parentId: 'uuid-root',
    relationshipType: 'nested',
    intentFingerprint: 'older adults seeking hip pain relief',
  });
  const sibling = row('uuid-sib', 'Knee Bursitis', {
    stableId: 't-3',
    parentId: 'uuid-root',
    relationshipType: 'nested',
    intentFingerprint: 'knee pain in younger athletes',
  });
  const child = row('uuid-child', 'Hip Bursitis Exercises', {
    stableId: 't-4',
    parentId: 'uuid-target',
    relationshipType: 'nested',
    intentFingerprint: 'gentle home exercises for hip joint pain',
  });
  const farRoot = row('uuid-far', 'Shoulder Pain', { stableId: 't-99' });
  const far = row('uuid-far-child', 'Shoulder Bursitis Surgery', {
    stableId: 't-100',
    parentId: 'uuid-far',
    relationshipType: 'nested',
    intentFingerprint: 'shoulder bursitis surgery options',
  });

  const sub = computeBatchRelevantSubtree({
    batchKeywords: [kw('new-1', 'older adults hip bursitis pain')],
    nodes: [root, target, sibling, child, farRoot, far],
    keywords: [],
  });

  // Target itself + parent + sibling + child all promoted to Tier 0.
  assert.ok(sub.has('t-2'), 'target');
  assert.ok(sub.has('t-1'), 'parent');
  assert.ok(sub.has('t-3'), 'sibling');
  assert.ok(sub.has('t-4'), 'child');
  // Far branch untouched.
  assert.ok(!sub.has('t-99'));
  assert.ok(!sub.has('t-100'));
});

test('computeBatchRelevantSubtree: multi-match union across topics', () => {
  const a = row('uuid-a', 'Hip Bursitis', {
    stableId: 't-1',
    intentFingerprint: 'hip joint pain in older adults',
  });
  const b = row('uuid-b', 'Knee Bursitis', {
    stableId: 't-2',
    intentFingerprint: 'knee joint inflammation in athletes',
  });
  const sub = computeBatchRelevantSubtree({
    batchKeywords: [
      kw('new-1', 'hip pain older adults'),
      kw('new-2', 'knee inflammation in athletes'),
    ],
    nodes: [a, b],
    keywords: [],
  });
  assert.ok(sub.has('t-1'));
  assert.ok(sub.has('t-2'));
});

test('computeBatchRelevantSubtree: ≥2-stem threshold filters single-stem matches', () => {
  // A topic that shares only one stem with a single batch keyword does NOT
  // qualify. Threshold per Cluster 3 Q12 lock: minimum 2 stems.
  const weak = row('uuid-weak', 'Pain', {
    stableId: 't-7',
    intentFingerprint: 'pain in joints',
  });
  const sub = computeBatchRelevantSubtree({
    batchKeywords: [kw('new-1', 'completely unrelated keyword pain')],
    nodes: [weak],
    keywords: [],
  });
  // Only "pain" stem matches; single overlap is below the ≥2 threshold.
  assert.ok(!sub.has('t-7'));
});

// ---- decideTier (Cluster 2 truth table) ------------------------------------

test('decideTier: in-batch-relevant subtree → Tier 0 (regardless of stability/recency)', () => {
  const tier = decideTier({
    stabilityScore: 9.5,
    batchesSinceTouch: 100,
    isInBatchRelevantSubtree: true,
    recencyWindow: 5,
  });
  assert.equal(tier, 0);
});

test('decideTier: low stability (<7.0) → Tier 0', () => {
  const tier = decideTier({
    stabilityScore: 6.5,
    batchesSinceTouch: 100,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(tier, 0);
});

test('decideTier: recent touch (within window N) → Tier 0', () => {
  const tier = decideTier({
    stabilityScore: 8.0,
    batchesSinceTouch: 3,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(tier, 0);
});

test('decideTier: recency window is configurable', () => {
  // touched 7 batches ago: with N=5 it's outside the window; with N=10 it's inside.
  const t1 = decideTier({
    stabilityScore: 8.0,
    batchesSinceTouch: 7,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(t1, 1, 'outside N=5 → Tier 1');
  const t2 = decideTier({
    stabilityScore: 8.0,
    batchesSinceTouch: 7,
    isInBatchRelevantSubtree: false,
    recencyWindow: 10,
  });
  assert.equal(t2, 0, 'inside N=10 → Tier 0');
});

test('decideTier: high stability + never touched + not in subtree → Tier 2', () => {
  const tier = decideTier({
    stabilityScore: 9.0,
    batchesSinceTouch: null,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(tier, 2);
});

test('decideTier: high stability + just outside window N → Tier 1 (not deeply stale)', () => {
  // touched 6 batches ago, N=5, deep-stale threshold=10. Outside N but inside
  // deep-stale window → Tier 1.
  const tier = decideTier({
    stabilityScore: 8.0,
    batchesSinceTouch: 6,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(tier, 1);
});

test('decideTier: high stability + deeply stale (>10) → Tier 2', () => {
  const tier = decideTier({
    stabilityScore: 8.0,
    batchesSinceTouch: 11,
    isInBatchRelevantSubtree: false,
    recencyWindow: 5,
  });
  assert.equal(tier, 2);
});

test('decideTier: high stability + recent + in subtree → Tier 0 (subtree wins ties)', () => {
  const tier = decideTier({
    stabilityScore: 9.5,
    batchesSinceTouch: 0,
    isInBatchRelevantSubtree: true,
    recencyWindow: 5,
  });
  assert.equal(tier, 0);
});

// ---- Touch tracker ---------------------------------------------------------

test('TouchTracker: UPDATE_TOPIC_TITLE stamps the topic at currentBatchNum', () => {
  const t = createTouchTracker();
  recordTouchesFromOps(
    t,
    [
      {
        type: 'UPDATE_TOPIC_TITLE',
        id: 't-5',
        to: 'New title',
      },
    ],
    7,
    {},
  );
  assert.equal(t.get('t-5'), 7);
});

test('TouchTracker: ADD_TOPIC alias resolved through aliasResolutions', () => {
  const t = createTouchTracker();
  recordTouchesFromOps(
    t,
    [
      {
        type: 'ADD_TOPIC',
        id: '$new1',
        title: 'New',
        description: '',
        parent: null,
        relationship: null,
      },
    ],
    3,
    { $new1: 't-99' },
  );
  assert.equal(t.get('t-99'), 3);
  // Alias not stamped directly.
  assert.equal(t.get('$new1'), undefined);
});

test('TouchTracker: keyword + sister-link ops stamp endpoint topics', () => {
  const t = createTouchTracker();
  recordTouchesFromOps(
    t,
    [
      { type: 'ADD_KEYWORD', topic: 't-1', keywordId: 'k1', placement: 'primary' },
      { type: 'MOVE_KEYWORD', from: 't-2', to: 't-3', keywordId: 'k1', placement: 'primary' },
      { type: 'ADD_SISTER_LINK', topicA: 't-4', topicB: 't-5' },
    ],
    9,
    {},
  );
  assert.equal(t.get('t-1'), 9);
  assert.equal(t.get('t-2'), 9);
  assert.equal(t.get('t-3'), 9);
  assert.equal(t.get('t-4'), 9);
  assert.equal(t.get('t-5'), 9);
});

test('batchesSinceTouch: null for never-touched, arithmetic for touched', () => {
  const t = createTouchTracker();
  t.set('t-1', 5);
  assert.equal(batchesSinceTouch(t, 't-1', 5), 0);
  assert.equal(batchesSinceTouch(t, 't-1', 8), 3);
  assert.equal(batchesSinceTouch(t, 't-99', 8), null);
});

test('TouchTracker: serialize → deserialize round-trip preserves entries', () => {
  const t = createTouchTracker();
  t.set('t-1', 5);
  t.set('t-2', 12);
  const serialized = serializeTouchTracker(t);
  // JSON-safe shape.
  assert.deepEqual(serialized, { 't-1': 5, 't-2': 12 });
  const round = deserializeTouchTracker(JSON.parse(JSON.stringify(serialized)));
  assert.equal(round.get('t-1'), 5);
  assert.equal(round.get('t-2'), 12);
  // null/undefined input yields a fresh empty tracker.
  assert.equal(deserializeTouchTracker(null).size, 0);
  assert.equal(deserializeTouchTracker(undefined).size, 0);
});

// ---- Tier 1 / Tier 2 row formatters ----------------------------------------

test('formatTier1KeywordSummary: counts placements + picks top-volume keyword', () => {
  const n = row('node-1', 'Topic', {
    stableId: 't-1',
    linkedKwIds: ['k1', 'k2', 'k3'],
    kwPlacements: { k1: 'p', k2: 'p', k3: 's' },
  });
  const keywords: KeywordLite[] = [
    { id: 'k1', keyword: 'low-volume kw', volume: 100 },
    { id: 'k2', keyword: 'highest volume kw', volume: 1200 },
    { id: 'k3', keyword: 'mid-volume kw', volume: 500 },
  ];
  const summary = formatTier1KeywordSummary(n, keywords);
  assert.equal(
    summary,
    '3 keywords (2p + 1s), top volume kw: "highest volume kw" (1200)',
  );
});

test('formatTier1KeywordSummary: empty topic emits "0 keywords" without top-vol suffix', () => {
  const n = row('node-1', 'Empty Bridge', { stableId: 't-1' });
  const summary = formatTier1KeywordSummary(n, []);
  assert.equal(summary, '0 keywords');
});

test('formatTier1KeywordSummary: tiebreaker is alphabetical when volumes match', () => {
  const n = row('node-1', 'Topic', {
    stableId: 't-1',
    linkedKwIds: ['k1', 'k2'],
    kwPlacements: { k1: 'p', k2: 'p' },
  });
  const keywords: KeywordLite[] = [
    { id: 'k1', keyword: 'zebra cure', volume: 500 },
    { id: 'k2', keyword: 'alpha cure', volume: 500 },
  ];
  const summary = formatTier1KeywordSummary(n, keywords);
  assert.match(summary, /top volume kw: "alpha cure" \(500\)$/);
});

test('Tier headers: Tier 1 has 6 cols, Tier 2 has 3 cols', () => {
  assert.equal(TIER_HEADERS.tier1.split('\t').length, 6);
  assert.equal(TIER_HEADERS.tier2.split('\t').length, 3);
});

// ---- Integration: buildOperationsInputTsv with serializationMode -----------

test('buildOperationsInputTsv: serializationMode="full" is byte-identical to no-arg call', () => {
  const root = row('uuid-root', 'Root', {
    stableId: 't-1',
    intentFingerprint: 'a fingerprint',
  });
  const child = row('uuid-child', 'Child', {
    stableId: 't-2',
    parentId: 'uuid-root',
    relationshipType: 'nested',
    intentFingerprint: 'another fingerprint',
    linkedKwIds: ['k1'],
    kwPlacements: { k1: 'p' },
    stabilityScore: 8.5,
  });
  const sl: SisterLinkRow[] = [];
  const keywords: KeywordLite[] = [{ id: 'k1', keyword: 'hip pain', volume: 1000 }];

  const a = buildOperationsInputTsv([root, child], sl, keywords);
  const b = buildOperationsInputTsv([root, child], sl, keywords, {
    serializationMode: 'full',
  });
  assert.equal(a, b, 'no-arg vs explicit "full" must be byte-identical');
});

test('buildOperationsInputTsv: serializationMode="tiered" emits correct multi-section output', () => {
  // Mix: t-1 root low stability → Tier 0; t-2 high-stability + recently touched → Tier 0
  // (recent touch wins); t-3 high-stability + never touched → Tier 2; t-4 high-stability
  // + 6 batches ago (outside N=5 but inside deep-stale) → Tier 1.
  const t1 = row('uuid-1', 'Hip', { stableId: 't-1', stabilityScore: 5.0, intentFingerprint: 'hip pain in older adults' });
  const t2 = row('uuid-2', 'Knee', { stableId: 't-2', stabilityScore: 8.0, intentFingerprint: 'knee pain in athletes' });
  const t3 = row('uuid-3', 'Shoulder', { stableId: 't-3', stabilityScore: 8.5, intentFingerprint: 'shoulder pain in workers' });
  const t4 = row('uuid-4', 'Elbow', { stableId: 't-4', stabilityScore: 8.0, intentFingerprint: 'elbow pain in lifters' });

  const tracker = createTouchTracker();
  // t-2 touched in the previous batch (currentBatchNum=10, so batchesSinceTouch=1).
  tracker.set('t-2', 9);
  // t-4 touched 6 batches ago.
  tracker.set('t-4', 4);

  const ctx: TierContext = {
    batchKeywords: [], // no batch-relevance — pure recency + stability test
    touchTracker: tracker,
    currentBatchNum: 10,
    recencyWindow: 5,
  };

  const tsv = buildOperationsInputTsv([t1, t2, t3, t4], [], [], {
    serializationMode: 'tiered',
    tierContext: ctx,
  });

  assert.match(tsv, /=== TIER 0 ===/);
  assert.match(tsv, /=== TIER 1 ===/);
  assert.match(tsv, /=== TIER 2 ===/);

  // Tier 0 contains t-1 (low stability) and t-2 (recent touch).
  const tier0Section = tsv.split('=== TIER 1 ===')[0];
  assert.match(tier0Section, /\bt-1\b/);
  assert.match(tier0Section, /\bt-2\b/);
  assert.ok(!/\bt-3\b/.test(tier0Section));
  assert.ok(!/\bt-4\b/.test(tier0Section));

  // Tier 1 contains t-4 (settled but not deep-stale).
  const tier1Section = tsv.split('=== TIER 1 ===')[1].split('=== TIER 2 ===')[0];
  assert.match(tier1Section, /\bt-4\b/);
  assert.ok(!/\bt-3\b/.test(tier1Section));

  // Tier 2 contains t-3 (deep-stale, never touched).
  const tier2Section = tsv.split('=== TIER 2 ===')[1];
  assert.match(tier2Section, /\bt-3\b/);
});

test('buildOperationsInputTsv: tiered mode pins fingerprint-less topics to Tier 0', () => {
  // Even with high stability + never touched + no batch relevance — a topic
  // with empty intentFingerprint cannot be safely demoted (Tier 1's load-bearing
  // signal is missing). Per INPUT_CONTEXT_SCALING_DESIGN.md §4.2 last paragraph.
  const stable = row('uuid-stable', 'Settled Topic', {
    stableId: 't-1',
    stabilityScore: 9.0,
    intentFingerprint: '', // empty
  });
  const ctx: TierContext = {
    batchKeywords: [],
    touchTracker: createTouchTracker(),
    currentBatchNum: 100,
    recencyWindow: 5,
  };
  const tsv = buildOperationsInputTsv([stable], [], [], {
    serializationMode: 'tiered',
    tierContext: ctx,
  });
  assert.match(tsv, /=== TIER 0 ===/);
  assert.ok(!tsv.includes('=== TIER 1 ==='), 'no Tier 1 section');
  assert.ok(!tsv.includes('=== TIER 2 ==='), 'no Tier 2 section');
});

test('buildOperationsInputTsv: tiered mode throws when tierContext is missing', () => {
  assert.throws(
    () => buildOperationsInputTsv([], [], [], { serializationMode: 'tiered' }),
    /requires tierContext/,
  );
});
