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
