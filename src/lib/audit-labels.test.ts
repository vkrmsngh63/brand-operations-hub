import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  eventTypeLabel,
  changeTypeOptions,
  sourceLabel,
  affectedItem,
  filterAuditEvents,
  groupAuditEvents,
  type AuditEventRow,
} from './audit-labels.ts';
import { AUDIT_EVENT_TYPES } from './audit-payload.ts';

/* ── eventTypeLabel ────────────────────────────────────────────── */

test('eventTypeLabel — every vocabulary type maps to a plain, non-token label', () => {
  for (const t of AUDIT_EVENT_TYPES) {
    const label = eventTypeLabel(t);
    assert.ok(label.length > 0, `${t} has a label`);
    // A plain label never contains the raw token style (UPPER_SNAKE).
    assert.ok(!/[A-Z]{2,}_/.test(label), `${t} → "${label}" is not a raw token`);
  }
});

test('eventTypeLabel — known examples are human-readable', () => {
  assert.equal(eventTypeLabel('UPDATE_TOPIC_TITLE'), 'Renamed topic');
  assert.equal(eventTypeLabel('MOVE_TOPIC'), 'Moved topic');
  assert.equal(eventTypeLabel('REMOVE_KEYWORD'), 'Removed keyword');
  assert.equal(eventTypeLabel('UPDATE_KEYWORD'), 'Edited keyword');
});

test('eventTypeLabel — unknown type falls back to title-case', () => {
  assert.equal(eventTypeLabel('FOO_BAR'), 'Foo bar');
  assert.equal(eventTypeLabel(''), '');
});

test('changeTypeOptions — one option per vocabulary type, all labelled', () => {
  const opts = changeTypeOptions();
  assert.equal(opts.length, AUDIT_EVENT_TYPES.length);
  for (const o of opts) {
    assert.ok(o.value.length > 0);
    assert.ok(o.label.length > 0);
  }
});

/* ── sourceLabel ───────────────────────────────────────────────── */

test('sourceLabel — ai → AI, manual → You, else dash', () => {
  assert.equal(sourceLabel('ai'), 'AI');
  assert.equal(sourceLabel('manual'), 'You');
  assert.equal(sourceLabel(undefined), '—');
  assert.equal(sourceLabel(null), '—');
  assert.equal(sourceLabel('weird'), '—');
});

/* ── affectedItem ──────────────────────────────────────────────── */

test('affectedItem — manual rename uses the new title from after', () => {
  assert.equal(
    affectedItem({ source: 'manual', action: 'UPDATE_TOPIC_TITLE', after: 'Running shoes', detail: { topicId: 't-3' } }),
    'Running shoes'
  );
});

test('affectedItem — AI op uses op.title/name/keyword', () => {
  assert.equal(
    affectedItem({ source: 'ai', action: 'ADD_TOPIC', op: { type: 'ADD_TOPIC', title: 'Trail shoes' } as never }),
    'Trail shoes'
  );
});

test('affectedItem — falls back to a detail id when no name', () => {
  assert.equal(
    affectedItem({ source: 'manual', action: 'MOVE_TOPIC', after: 'parent-1', detail: { topicId: 't-9' } }),
    'parent-1'
  );
  assert.equal(
    affectedItem({ source: 'manual', action: 'DELETE_KEYWORD', detail: { keywordId: 'k-2' } }),
    'k-2'
  );
});

test('affectedItem — empty/garbage payloads return empty string', () => {
  assert.equal(affectedItem(null), '');
  assert.equal(affectedItem(undefined), '');
  assert.equal(affectedItem({ source: 'manual', action: 'DELETE_TOPIC' }), '');
});

/* ── filterAuditEvents ─────────────────────────────────────────── */

const ROWS: AuditEventRow[] = [
  { id: '1', eventType: 'UPDATE_TOPIC_TITLE', timestamp: '2026-06-04T03:00:00Z', payload: { source: 'manual', action: 'UPDATE_TOPIC_TITLE', after: 'A' } },
  { id: '2', eventType: 'ADD_TOPIC', timestamp: '2026-06-04T02:00:00Z', payload: { source: 'ai', action: 'ADD_TOPIC', batchId: 'b1' } },
  { id: '3', eventType: 'MOVE_TOPIC', timestamp: '2026-06-04T01:30:00Z', payload: { source: 'ai', action: 'MOVE_TOPIC', batchId: 'b1' } },
  { id: '4', eventType: 'UPDATE_TOPIC_TITLE', timestamp: '2026-06-04T01:00:00Z', payload: { source: 'ai', action: 'UPDATE_TOPIC_TITLE', batchId: 'b1' } },
];

test('filterAuditEvents — default returns everything', () => {
  assert.equal(filterAuditEvents(ROWS).length, 4);
  assert.equal(filterAuditEvents(ROWS, {}).length, 4);
});

test('filterAuditEvents — by source', () => {
  assert.deepEqual(filterAuditEvents(ROWS, { source: 'manual' }).map((e) => e.id), ['1']);
  assert.deepEqual(filterAuditEvents(ROWS, { source: 'ai' }).map((e) => e.id), ['2', '3', '4']);
});

test('filterAuditEvents — by change type', () => {
  assert.deepEqual(
    filterAuditEvents(ROWS, { eventType: 'UPDATE_TOPIC_TITLE' }).map((e) => e.id),
    ['1', '4']
  );
});

test('filterAuditEvents — source + change type combined', () => {
  assert.deepEqual(
    filterAuditEvents(ROWS, { source: 'ai', eventType: 'UPDATE_TOPIC_TITLE' }).map((e) => e.id),
    ['4']
  );
});

/* ── groupAuditEvents ──────────────────────────────────────────── */

test('groupAuditEvents — AI run collapses into one bundle, manual stays single', () => {
  const groups = groupAuditEvents(ROWS);
  assert.equal(groups.length, 2);
  // newest-first: the manual edit (row 1) comes first, then the AI run bundle.
  assert.equal(groups[0].isBatch, false);
  assert.equal(groups[0].source, 'manual');
  assert.deepEqual(groups[0].events.map((e) => e.id), ['1']);

  assert.equal(groups[1].isBatch, true);
  assert.equal(groups[1].batchId, 'b1');
  assert.equal(groups[1].source, 'ai');
  assert.deepEqual(groups[1].events.map((e) => e.id), ['2', '3', '4']);
  // representative timestamp = the newest event in the run (row 2).
  assert.equal(groups[1].timestamp, '2026-06-04T02:00:00Z');
});

test('groupAuditEvents — AI event with no batchId is its own group', () => {
  const rows: AuditEventRow[] = [
    { id: 'x', eventType: 'ADD_TOPIC', timestamp: '2026-06-04T05:00:00Z', payload: { source: 'ai', action: 'ADD_TOPIC' } },
  ];
  const groups = groupAuditEvents(rows);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].isBatch, false);
  assert.equal(groups[0].key, 'evt:x');
});

test('groupAuditEvents — empty input → empty output', () => {
  assert.deepEqual(groupAuditEvents([]), []);
});
