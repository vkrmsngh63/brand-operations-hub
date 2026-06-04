import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUDIT_EVENT_TYPES,
  isKnownAuditEventType,
  aiOperationEvent,
  aiBatchEvents,
  manualEvent,
} from './audit-payload.ts';
import type { Operation } from './operation-applier.ts';

/* ── vocabulary ────────────────────────────────────────────────── */
test('AUDIT_EVENT_TYPES — covers all 13 AI ops + 3 manual-only', () => {
  // 13 operation-applier op types + CREATE/DELETE/RESTORE_KEYWORD.
  assert.equal(AUDIT_EVENT_TYPES.length, 16);
  for (const t of [
    'ADD_TOPIC',
    'SPLIT_TOPIC',
    'MERGE_TOPICS',
    'MOVE_KEYWORD',
    'ADD_SISTER_LINK',
    'CREATE_KEYWORD',
    'DELETE_KEYWORD',
    'RESTORE_KEYWORD',
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
