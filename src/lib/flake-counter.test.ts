/**
 * Unit tests for the flake-rate telemetry helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/flake-counter.test.ts
 *
 * Same pattern as `prisma-retry.test.ts` and `cold-start-fetch-retry.test.ts`
 * (pure module + injectable side effect — `console.error` for `recordFlake`).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  formatFlakeLine,
  recordFlake,
  extractPrismaCode,
  isTransientCode,
} from './flake-counter.ts';

function fakePrismaError(code: string, message = 'fake error'): Error {
  return Object.assign(new Error(message), { code });
}

/* ── extractPrismaCode ────────────────────────────────────────────── */

test('extractPrismaCode: P1001 → "P1001"', () => {
  assert.equal(extractPrismaCode(fakePrismaError('P1001')), 'P1001');
});

test('extractPrismaCode: plain Error (no code) → "unknown"', () => {
  assert.equal(extractPrismaCode(new Error('boom')), 'unknown');
});

test('extractPrismaCode: null → "unknown"', () => {
  assert.equal(extractPrismaCode(null), 'unknown');
});

test('extractPrismaCode: string-thrown → "unknown"', () => {
  assert.equal(extractPrismaCode('something went wrong'), 'unknown');
});

test('extractPrismaCode: object with non-string code → "unknown"', () => {
  assert.equal(extractPrismaCode({ code: 123 }), 'unknown');
});

test('extractPrismaCode: object with empty-string code → "unknown"', () => {
  assert.equal(extractPrismaCode({ code: '' }), 'unknown');
});

/* ── isTransientCode ──────────────────────────────────────────────── */

test('isTransientCode: P1001 (cant reach DB) → true', () => {
  assert.equal(isTransientCode('P1001'), true);
});

test('isTransientCode: P1002 (DB timeout) → true', () => {
  assert.equal(isTransientCode('P1002'), true);
});

test('isTransientCode: P1008 (ops timed out) → true', () => {
  assert.equal(isTransientCode('P1008'), true);
});

test('isTransientCode: P2034 (write conflict) → true', () => {
  assert.equal(isTransientCode('P2034'), true);
});

test('isTransientCode: P2002 (unique constraint) → false', () => {
  assert.equal(isTransientCode('P2002'), false);
});

test('isTransientCode: P2025 (record not found) → false', () => {
  assert.equal(isTransientCode('P2025'), false);
});

test('isTransientCode: "unknown" → false', () => {
  assert.equal(isTransientCode('unknown'), false);
});

/* ── formatFlakeLine ──────────────────────────────────────────────── */

test('formatFlakeLine: minimal Prisma error, no ctx', () => {
  const line = formatFlakeLine(
    'GET /api/projects/[projectId]/canvas',
    fakePrismaError('P1001', 'cant reach pool'),
  );
  assert.equal(
    line,
    '[FLAKE] endpoint=GET /api/projects/[projectId]/canvas code=P1001 retried=false msg="cant reach pool"',
  );
});

test('formatFlakeLine: retried=true rendered correctly', () => {
  const line = formatFlakeLine(
    'GET /api/projects/[projectId]/canvas/nodes',
    fakePrismaError('P1002', 'timeout'),
    { retried: true },
  );
  assert.match(line, /retried=true/);
});

test('formatFlakeLine: canvasSize emitted when provided', () => {
  const line = formatFlakeLine(
    'POST /api/projects/[projectId]/canvas/rebuild',
    fakePrismaError('P2034', 'deadlock'),
    { canvasSize: 120 },
  );
  assert.match(line, /canvasSize=120/);
});

test('formatFlakeLine: projectWorkflowId emitted when provided', () => {
  const line = formatFlakeLine(
    'GET /api/projects/[projectId]/keywords',
    fakePrismaError('P1008', 'ops timed out'),
    { projectWorkflowId: 'pw-abc-123' },
  );
  assert.match(line, /projectWorkflowId=pw-abc-123/);
});

test('formatFlakeLine: all extras together', () => {
  const line = formatFlakeLine(
    'POST /api/projects/[projectId]/canvas/rebuild',
    fakePrismaError('P2034', 'serialization failure'),
    { retried: true, canvasSize: 200, projectWorkflowId: 'pw-xyz' },
  );
  assert.equal(
    line,
    '[FLAKE] endpoint=POST /api/projects/[projectId]/canvas/rebuild code=P2034 retried=true canvasSize=200 projectWorkflowId=pw-xyz msg="serialization failure"',
  );
});

test('formatFlakeLine: plain Error (no code) → code=unknown', () => {
  const line = formatFlakeLine('GET /api/admin-notes', new Error('something else'));
  assert.match(line, /code=unknown/);
  assert.match(line, /msg="something else"/);
});

test('formatFlakeLine: null error → empty msg', () => {
  const line = formatFlakeLine('PATCH /api/projects/[projectId]', null);
  assert.match(line, /code=unknown/);
  assert.match(line, /msg=""/);
});

test('formatFlakeLine: undefined error → empty msg', () => {
  const line = formatFlakeLine('PATCH /api/projects/[projectId]', undefined);
  assert.match(line, /msg=""/);
});

test('formatFlakeLine: string-thrown → preserved', () => {
  const line = formatFlakeLine('GET /api/projects', 'pool exhausted');
  assert.match(line, /code=unknown/);
  assert.match(line, /msg="pool exhausted"/);
});

test('formatFlakeLine: multiline message → whitespace collapsed', () => {
  const line = formatFlakeLine(
    'POST /api/projects/[projectId]/canvas/nodes',
    fakePrismaError('P2002', 'line one\n  line two\n\nline three'),
  );
  assert.match(line, /msg="line one line two line three"/);
});

test('formatFlakeLine: very long message → truncated to 200 chars', () => {
  const longMsg = 'x'.repeat(500);
  const line = formatFlakeLine(
    'POST /api/projects/[projectId]/keywords',
    fakePrismaError('P1001', longMsg),
  );
  const match = line.match(/msg="(.*)"/);
  assert.ok(match, 'expected msg field present');
  assert.equal(match![1].length, 200);
});

test('formatFlakeLine: canvasSize=0 still emitted (not falsy-skipped)', () => {
  const line = formatFlakeLine(
    'GET /api/projects/[projectId]/canvas/nodes',
    fakePrismaError('P1001'),
    { canvasSize: 0 },
  );
  assert.match(line, /canvasSize=0/);
});

test('formatFlakeLine: explicit retried=false serialized correctly', () => {
  const line = formatFlakeLine(
    'GET /api/admin-notes',
    fakePrismaError('P1002'),
    { retried: false },
  );
  assert.match(line, /retried=false/);
});

/* ── recordFlake side-effect ──────────────────────────────────────── */

test('recordFlake: emits formatted line via console.error', () => {
  const captured: string[] = [];
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    captured.push(args.map(String).join(' '));
  };
  try {
    recordFlake(
      'GET /api/projects/[projectId]/canvas',
      fakePrismaError('P1001', 'flake under test'),
      { retried: true, canvasSize: 50 },
    );
  } finally {
    console.error = origError;
  }
  assert.equal(captured.length, 1);
  assert.equal(
    captured[0],
    '[FLAKE] endpoint=GET /api/projects/[projectId]/canvas code=P1001 retried=true canvasSize=50 msg="flake under test"',
  );
});

test('recordFlake: works with no ctx', () => {
  const captured: string[] = [];
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    captured.push(args.map(String).join(' '));
  };
  try {
    recordFlake('GET /api/projects', new Error('boom'));
  } finally {
    console.error = origError;
  }
  assert.equal(captured.length, 1);
  assert.match(captured[0], /\[FLAKE\] endpoint=GET \/api\/projects/);
  assert.match(captured[0], /code=unknown retried=false msg="boom"/);
});
