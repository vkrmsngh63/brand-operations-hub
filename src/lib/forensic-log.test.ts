/**
 * Unit tests for the forensic NDJSON ring buffer.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/forensic-log.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files in this folder.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ForensicLog,
  FORENSIC_DEFAULT_MAX_RECORDS,
  buildForensicDownload,
  type ForensicRecord,
} from './forensic-log.ts';

function makeRecord(overrides: Partial<ForensicRecord> = {}): ForensicRecord {
  return {
    ts: '2026-04-29T12:00:00.000Z',
    session_id: 'sess-abc',
    project_id: 'proj-xyz',
    batch_num: 1,
    phase: 'pre_api_call',
    ...overrides,
  };
}

/* ── Construction ─────────────────────────────────────────────────── */

test('ForensicLog: default capacity is 1000', () => {
  const log = new ForensicLog();
  assert.equal(log.capacity(), FORENSIC_DEFAULT_MAX_RECORDS);
  assert.equal(log.capacity(), 1000);
});

test('ForensicLog: custom capacity respected', () => {
  const log = new ForensicLog(50);
  assert.equal(log.capacity(), 50);
});

test('ForensicLog: zero/negative capacity throws', () => {
  assert.throws(() => new ForensicLog(0));
  assert.throws(() => new ForensicLog(-5));
});

test('ForensicLog: empty buffer count is 0, getAll is [], toNdjson is empty string', () => {
  const log = new ForensicLog();
  assert.equal(log.count(), 0);
  assert.deepEqual(log.getAll(), []);
  assert.equal(log.toNdjson(), '');
});

/* ── Emit + retrieve ──────────────────────────────────────────────── */

test('ForensicLog: emit increments count', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  log.emit(makeRecord({ batch_num: 2 }));
  log.emit(makeRecord({ batch_num: 3 }));
  assert.equal(log.count(), 3);
});

test('ForensicLog: getAll returns records in insertion order', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1, phase: 'pre_api_call' }));
  log.emit(makeRecord({ batch_num: 1, phase: 'post_api_call' }));
  log.emit(makeRecord({ batch_num: 2, phase: 'pre_api_call' }));
  const all = log.getAll();
  assert.equal(all.length, 3);
  assert.equal(all[0].batch_num, 1);
  assert.equal(all[0].phase, 'pre_api_call');
  assert.equal(all[1].phase, 'post_api_call');
  assert.equal(all[2].batch_num, 2);
});

test('ForensicLog: getAll returns a defensive copy — mutating the array does not change the buffer', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  const all = log.getAll();
  all.pop();
  assert.equal(log.count(), 1, 'internal buffer must not be affected by external mutation');
});

/* ── FIFO eviction at capacity ────────────────────────────────────── */

test('ForensicLog: evicts oldest record when capacity exceeded (capacity=3)', () => {
  const log = new ForensicLog(3);
  log.emit(makeRecord({ batch_num: 1 }));
  log.emit(makeRecord({ batch_num: 2 }));
  log.emit(makeRecord({ batch_num: 3 }));
  log.emit(makeRecord({ batch_num: 4 })); // evicts batch_num: 1
  const all = log.getAll();
  assert.equal(log.count(), 3);
  assert.equal(all[0].batch_num, 2, 'oldest record (batch 1) should be evicted');
  assert.equal(all[1].batch_num, 3);
  assert.equal(all[2].batch_num, 4);
});

test('ForensicLog: count never exceeds capacity even under heavy emit', () => {
  const log = new ForensicLog(10);
  for (let i = 0; i < 100; i++) {
    log.emit(makeRecord({ batch_num: i }));
  }
  assert.equal(log.count(), 10);
  const all = log.getAll();
  // After 100 emits with capacity 10, only batches 90-99 survive.
  assert.equal(all[0].batch_num, 90);
  assert.equal(all[9].batch_num, 99);
});

test('ForensicLog: capacity=1 (degenerate but valid) keeps only the most recent record', () => {
  const log = new ForensicLog(1);
  log.emit(makeRecord({ batch_num: 1 }));
  log.emit(makeRecord({ batch_num: 2 }));
  log.emit(makeRecord({ batch_num: 3 }));
  assert.equal(log.count(), 1);
  assert.equal(log.getAll()[0].batch_num, 3);
});

/* ── NDJSON serialization ─────────────────────────────────────────── */

test('ForensicLog: toNdjson produces one JSON record per line, separated by \\n', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1, phase: 'pre_api_call' }));
  log.emit(makeRecord({ batch_num: 1, phase: 'post_api_call', tsv_input_tokens: 12345 }));
  const ndjson = log.toNdjson();
  const lines = ndjson.split('\n');
  assert.equal(lines.length, 2);
  const r1 = JSON.parse(lines[0]);
  const r2 = JSON.parse(lines[1]);
  assert.equal(r1.batch_num, 1);
  assert.equal(r1.phase, 'pre_api_call');
  assert.equal(r2.phase, 'post_api_call');
  assert.equal(r2.tsv_input_tokens, 12345);
});

test('ForensicLog: toNdjson preserves nested reconciliation field', () => {
  const log = new ForensicLog();
  log.emit(
    makeRecord({
      phase: 'post_apply',
      reconciliation: { to_ai_sorted: 8, to_reshuffled: 0 },
    }),
  );
  const parsed = JSON.parse(log.toNdjson());
  assert.deepEqual(parsed.reconciliation, { to_ai_sorted: 8, to_reshuffled: 0 });
});

test('ForensicLog: toNdjson preserves errors array', () => {
  const log = new ForensicLog();
  log.emit(
    makeRecord({
      phase: 'post_apply',
      errors: ['Canvas rebuild failed: HTTP 500'],
    }),
  );
  const parsed = JSON.parse(log.toNdjson());
  assert.deepEqual(parsed.errors, ['Canvas rebuild failed: HTTP 500']);
});

test('ForensicLog: optional fields omitted from JSON when undefined', () => {
  const log = new ForensicLog();
  // Only required fields set.
  log.emit({
    ts: '2026-04-29T12:00:00.000Z',
    session_id: 'sess-1',
    project_id: 'proj-1',
    batch_num: 1,
    phase: 'pre_api_call',
  });
  const parsed = JSON.parse(log.toNdjson());
  assert.ok(!('canvas_node_count' in parsed), 'undefined fields should not serialize');
  assert.ok(!('reconciliation' in parsed));
  assert.equal(parsed.batch_num, 1);
});

/* ── clear() ──────────────────────────────────────────────────────── */

test('ForensicLog: clear() empties the buffer', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  log.emit(makeRecord({ batch_num: 2 }));
  assert.equal(log.count(), 2);
  log.clear();
  assert.equal(log.count(), 0);
  assert.equal(log.toNdjson(), '');
});

test('ForensicLog: clear() then emit works normally', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  log.clear();
  log.emit(makeRecord({ batch_num: 99 }));
  assert.equal(log.count(), 1);
  assert.equal(log.getAll()[0].batch_num, 99);
});

/* ── buildForensicDownload helper ─────────────────────────────────── */

test('buildForensicDownload: returns ndjson content + reasonable filename + mime type', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  const dl = buildForensicDownload(log, 'abcdef0123456789');
  assert.equal(dl.mimeType, 'application/x-ndjson');
  assert.ok(dl.filename.startsWith('aa-forensic-abcdef01-'), 'filename should embed first 8 chars of session id');
  assert.ok(dl.filename.endsWith('.ndjson'));
  assert.ok(dl.content.length > 0);
});

test('buildForensicDownload: empty buffer produces empty content but still a valid filename', () => {
  const log = new ForensicLog();
  const dl = buildForensicDownload(log, 'sess-empty');
  assert.equal(dl.content, '');
  assert.ok(dl.filename.endsWith('.ndjson'));
});

test('buildForensicDownload: empty session id produces "no-session" placeholder in filename', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  const dl = buildForensicDownload(log, '');
  assert.ok(dl.filename.includes('no-session'));
});

test('buildForensicDownload: filename has no colons (safe for filesystems that ban them)', () => {
  const log = new ForensicLog();
  log.emit(makeRecord({ batch_num: 1 }));
  const dl = buildForensicDownload(log, 'sess-123');
  assert.ok(!dl.filename.includes(':'), 'colons must be replaced for Windows/macOS compatibility');
});
