import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_EVENT_TYPES,
  isKnownAuditEventType,
  aiOperationEvent,
  aiBatchEvents,
  manualEvent,
  topicUpdateEvents,
  keywordUpdateEvents,
} from './audit-payload.ts';
import type { Operation } from './operation-applier.ts';

/* ── vocabulary ────────────────────────────────────────────────── */
test('AUDIT_EVENT_TYPES — covers all 13 AI ops + 6 manual-only', () => {
  // 13 operation-applier op types + CREATE/DELETE/RESTORE/UPDATE_KEYWORD +
  // ADD/REMOVE_PATHWAY (slice 2).
  assert.equal(AUDIT_EVENT_TYPES.length, 19);
  for (const t of [
    'ADD_TOPIC',
    'SPLIT_TOPIC',
    'MERGE_TOPICS',
    'MOVE_KEYWORD',
    'ADD_SISTER_LINK',
    'CREATE_KEYWORD',
    'DELETE_KEYWORD',
    'RESTORE_KEYWORD',
    'UPDATE_KEYWORD',
    'ADD_PATHWAY',
    'REMOVE_PATHWAY',
  ]) {
    assert.ok(AUDIT_EVENT_TYPES.includes(t as never), `missing ${t}`);
  }
});

test('isKnownAuditEventType — accepts known, rejects unknown', () => {
  assert.equal(isKnownAuditEventType('SPLIT_TOPIC'), true);
  assert.equal(isKnownAuditEventType('RESTORE_KEYWORD'), true);
  assert.equal(isKnownAuditEventType('PAN_CANVAS'), false);
  assert.equal(isKnownAuditEventType(''), false);
});

/* ── AI events ─────────────────────────────────────────────────── */
const addOp: Operation = {
  type: 'ADD_TOPIC',
  id: '$new1',
  title: 'Hip bursitis',
  description: 'd',
  parent: 't-1',
  relationship: 'nested',
};
const moveKwOp: Operation = {
  type: 'MOVE_KEYWORD',
  keywordId: 'kw-9',
  from: 't-1',
  to: 't-2',
  placement: 'primary',
};

test('aiOperationEvent — maps op.type to eventType and wraps the op', () => {
  const e = aiOperationEvent(addOp, { batchId: 'b1' }, 0);
  assert.equal(e.eventType, 'ADD_TOPIC');
  assert.equal(e.payload.source, 'ai');
  assert.equal(e.payload.action, 'ADD_TOPIC');
  assert.deepEqual(e.payload.op, addOp);
  assert.equal(e.payload.batchId, 'b1');
  assert.equal(e.payload.seq, 0);
});

test('aiOperationEvent — includes aliasResolutions only when non-empty', () => {
  const withAlias = aiOperationEvent(
    addOp,
    { batchId: 'b1', aliasResolutions: { $new1: 't-7' } },
    2
  );
  assert.deepEqual(withAlias.payload.detail, {
    aliasResolutions: { $new1: 't-7' },
  });

  const noAlias = aiOperationEvent(addOp, { batchId: 'b1', aliasResolutions: {} }, 0);
  assert.equal(noAlias.payload.detail, undefined);
});

test('aiBatchEvents — one event per op, seq increments, shared batchId', () => {
  const events = aiBatchEvents([addOp, moveKwOp], { batchId: 'batch-42' });
  assert.equal(events.length, 2);
  assert.equal(events[0].eventType, 'ADD_TOPIC');
  assert.equal(events[1].eventType, 'MOVE_KEYWORD');
  assert.equal(events[0].payload.seq, 0);
  assert.equal(events[1].payload.seq, 1);
  assert.equal(events[0].payload.batchId, 'batch-42');
  assert.equal(events[1].payload.batchId, 'batch-42');
});

test('aiBatchEvents — empty op list yields no events', () => {
  assert.deepEqual(aiBatchEvents([], { batchId: 'b' }), []);
});

/* ── manual events ─────────────────────────────────────────────── */
test('manualEvent — shapes a rename with before/after', () => {
  const e = manualEvent({
    eventType: 'UPDATE_TOPIC_TITLE',
    before: { title: 'Old' },
    after: { title: 'New' },
    detail: { stableId: 't-3' },
  });
  assert.equal(e.eventType, 'UPDATE_TOPIC_TITLE');
  assert.equal(e.payload.source, 'manual');
  assert.deepEqual(e.payload.before, { title: 'Old' });
  assert.deepEqual(e.payload.after, { title: 'New' });
  assert.deepEqual(e.payload.detail, { stableId: 't-3' });
});

test('manualEvent — omits before/after/detail when not supplied', () => {
  const e = manualEvent({ eventType: 'DELETE_KEYWORD' });
  assert.equal(e.payload.source, 'manual');
  assert.equal('before' in e.payload, false);
  assert.equal('after' in e.payload, false);
  assert.equal('detail' in e.payload, false);
});

test('manualEvent — drops an empty detail object', () => {
  const e = manualEvent({ eventType: 'RESTORE_KEYWORD', detail: {} });
  assert.equal('detail' in e.payload, false);
});

test('manualEvent — throws on an unknown eventType', () => {
  assert.throws(
    () => manualEvent({ eventType: 'NOPE' as never }),
    /unknown eventType "NOPE"/
  );
});

/* ── topicUpdateEvents (manual node PATCH diff) ─────────────────── */
test('topicUpdateEvents — pure layout patch (drag) yields no events', () => {
  assert.deepEqual(topicUpdateEvents({ id: 'n1', x: 10, y: 20 }), []);
  assert.deepEqual(topicUpdateEvents({ id: 'n1', w: 1, h: 2, x: 3, y: 4 }), []);
});

test('topicUpdateEvents — rename records UPDATE_TOPIC_TITLE (after-only)', () => {
  const events = topicUpdateEvents({ id: 'n1', title: 'New name' });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'UPDATE_TOPIC_TITLE');
  assert.equal(events[0].payload.source, 'manual');
  assert.equal(events[0].payload.after, 'New name');
  assert.deepEqual(events[0].payload.detail, { topicId: 'n1' });
});

test('topicUpdateEvents — description edit records UPDATE_TOPIC_DESCRIPTION', () => {
  const events = topicUpdateEvents({ id: 'n1', description: 'desc' });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'UPDATE_TOPIC_DESCRIPTION');
  assert.equal(events[0].payload.after, 'desc');
});

test('topicUpdateEvents — reparent records ONE MOVE_TOPIC (reparent)', () => {
  const events = topicUpdateEvents({
    id: 'n1',
    parentId: 't-2',
    relationshipType: 'nested',
    x: 5,
    y: 6,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'MOVE_TOPIC');
  assert.equal(events[0].payload.after, 't-2');
  assert.deepEqual(events[0].payload.detail, {
    topicId: 'n1',
    kind: 'reparent',
    relationshipType: 'nested',
  });
});

test('topicUpdateEvents — detach (parentId:null) records MOVE_TOPIC with after null', () => {
  const events = topicUpdateEvents({ id: 'n1', parentId: null, relationshipType: '' });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'MOVE_TOPIC');
  assert.equal(events[0].payload.after, null);
  assert.equal(events[0].payload.detail?.kind, 'reparent');
});

test('topicUpdateEvents — reorder (sortOrder, no parent) records MOVE_TOPIC (reorder)', () => {
  const events = topicUpdateEvents({ id: 'n1', sortOrder: 3 });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'MOVE_TOPIC');
  assert.equal(events[0].payload.after, 3);
  assert.deepEqual(events[0].payload.detail, { topicId: 'n1', kind: 'reorder' });
});

test('topicUpdateEvents — reparent+sortOrder folds into ONE reparent event', () => {
  const events = topicUpdateEvents({ id: 'n1', parentId: 't-2', sortOrder: 9 });
  assert.equal(events.length, 1);
  assert.equal(events[0].payload.detail?.kind, 'reparent');
  assert.equal(events[0].payload.detail?.sortOrder, 9);
});

test('topicUpdateEvents — linkedKwIds change records MOVE_KEYWORD', () => {
  const events = topicUpdateEvents({ id: 'n1', linkedKwIds: ['k1', 'k2'] });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'MOVE_KEYWORD');
  assert.deepEqual(events[0].payload.after, ['k1', 'k2']);
  assert.deepEqual(events[0].payload.detail, { topicId: 'n1', via: 'topic-link' });
});

test('topicUpdateEvents — relationshipType-only / altTitles-only are not audited', () => {
  assert.deepEqual(topicUpdateEvents({ id: 'n1', relationshipType: 'nested' }), []);
  assert.deepEqual(topicUpdateEvents({ id: 'n1', altTitles: ['a'] }), []);
});

test('topicUpdateEvents — multi-field patch records each change', () => {
  const events = topicUpdateEvents({ id: 'n1', title: 'T', description: 'D' });
  assert.equal(events.length, 2);
  assert.deepEqual(
    events.map(e => e.eventType),
    ['UPDATE_TOPIC_TITLE', 'UPDATE_TOPIC_DESCRIPTION']
  );
});

/* ── keywordUpdateEvents (manual keyword PATCH diff) ────────────── */
test('keywordUpdateEvents — content edit records one UPDATE_KEYWORD', () => {
  const events = keywordUpdateEvents({ id: 'k1', volume: 100, tags: 'x' });
  assert.equal(events.length, 1);
  assert.equal(events[0].eventType, 'UPDATE_KEYWORD');
  assert.equal(events[0].payload.source, 'manual');
  assert.deepEqual(events[0].payload.after, { volume: 100, tags: 'x' });
  assert.deepEqual(events[0].payload.detail, { keywordId: 'k1' });
});

test('keywordUpdateEvents — reorder (sortOrder) is recorded', () => {
  const events = keywordUpdateEvents({ id: 'k1', sortOrder: 5 });
  assert.equal(events.length, 1);
  assert.deepEqual(events[0].payload.after, { sortOrder: 5 });
});

test('keywordUpdateEvents — layout/metadata-only patch yields no events', () => {
  assert.deepEqual(keywordUpdateEvents({ id: 'k1', canvasLoc: { x: 1 } }), []);
  assert.deepEqual(keywordUpdateEvents({ id: 'k1', topicApproved: {} }), []);
  assert.deepEqual(keywordUpdateEvents({ id: 'k1' }), []);
});
