/**
 * Unit tests for the canvas-fetch parser.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/canvas-fetch-parser.test.ts
 *
 * Uses Node's built-in `node:test` and `node:assert/strict`. No external
 * test framework. No DB. No React.
 *
 * The parser is the structural defense for Bug 1 (canvas-blanking). The
 * tests exercise the contract: success only when both responses are HTTP-ok
 * AND the bodies match the expected shapes; every other case must fail
 * loudly so the caller can preserve prior client state instead of silently
 * zeroing.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseCanvasFetchResponses,
  type RawResponse,
} from './canvas-fetch-parser.ts';

const ok = (body: unknown): RawResponse => ({ ok: true, status: 200, body });
const okErr = (status: number, body: unknown = null): RawResponse => ({ ok: false, status, body });
const validNode = { id: 'n-1', stableId: 't-1' };
const validState = { id: 's-1', nextStableIdN: 5, viewX: 0, viewY: 0, zoom: 1 };
const okStateBody = { canvasState: validState, pathways: [], sisterLinks: [] };

/* ── Happy paths ─────────────────────────────────────────────────────── */

test('parser: both responses ok with valid bodies → ok result with nodes/state/pathways/sisterLinks', () => {
  const result = parseCanvasFetchResponses(ok([validNode]), ok(okStateBody));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.nodes, [validNode]);
  assert.deepEqual(result.canvasState, validState);
  assert.deepEqual(result.pathways, []);
  assert.deepEqual(result.sisterLinks, []);
});

test('parser: empty nodes array IS valid (legitimate empty canvas)', () => {
  const result = parseCanvasFetchResponses(ok([]), ok(okStateBody));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.nodes.length, 0);
});

test('parser: state with null canvasState is fine (project never saved viewport)', () => {
  const result = parseCanvasFetchResponses(ok([]), ok({ canvasState: null, pathways: [], sisterLinks: [] }));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.canvasState, null);
});

test('parser: state with missing pathways/sisterLinks normalises to []', () => {
  const result = parseCanvasFetchResponses(ok([]), ok({ canvasState: validState }));
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.pathways, []);
  assert.deepEqual(result.sisterLinks, []);
});

/* ── Bug-1 trigger cases — every one of these must fail loudly ──────── */

test('parser: nodes HTTP 500 (the 2026-04-28 canvas-blanking trigger) → not ok', () => {
  const result = parseCanvasFetchResponses(
    okErr(500),
    ok(okStateBody),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes fetch HTTP 500/);
});

test('parser: nodes HTTP 401 → not ok', () => {
  const result = parseCanvasFetchResponses(okErr(401), ok(okStateBody));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes fetch HTTP 401/);
});

test('parser: state HTTP 500 → not ok', () => {
  const result = parseCanvasFetchResponses(ok([validNode]), okErr(500));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /state fetch HTTP 500/);
});

test('parser: both fail → not ok with nodes-fail surfaced first', () => {
  const result = parseCanvasFetchResponses(okErr(503), okErr(500));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes fetch HTTP 503/);
});

test('parser: nodes ok but body is the error-shape JSON (the exact 2026-04-28 trigger pattern) → not ok', () => {
  // This is the smoking-gun shape from `/api/projects/.../canvas/nodes` GET
  // when Prisma errors: response.ok is true at the HTTP layer would NOT happen
  // for a 500 (response.ok is false), but if some upstream proxy ever turned
  // a 500 into a 200 with this body, the parser still rejects it here.
  const result = parseCanvasFetchResponses(
    ok({ error: 'Failed to fetch nodes' }),
    ok(okStateBody),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes body is not an array/);
});

test('parser: nodes body is null (parse failure simulated by caller) → not ok', () => {
  const result = parseCanvasFetchResponses(ok(null), ok(okStateBody));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes body is not an array/);
});

test('parser: nodes body is undefined → not ok', () => {
  const result = parseCanvasFetchResponses(ok(undefined), ok(okStateBody));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes body is not an array/);
});

test('parser: nodes body is a string → not ok', () => {
  const result = parseCanvasFetchResponses(ok('oops'), ok(okStateBody));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /nodes body is not an array/);
});

test('parser: state body is null → not ok', () => {
  const result = parseCanvasFetchResponses(ok([validNode]), ok(null));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /state body is not an object/);
});

test('parser: state body is an array → not ok (state must be plain object)', () => {
  const result = parseCanvasFetchResponses(ok([validNode]), ok([1, 2, 3]));
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /state body is not an object/);
});

/* ── Mixed-success regression cases ─────────────────────────────────── */

test('parser: ok nodes + ok-state-with-non-object pathways → still ok with [] fallback (defensive)', () => {
  // Server should never send this, but if it does, we don't crash —
  // pathways stays empty rather than causing a downstream type error.
  const result = parseCanvasFetchResponses(
    ok([validNode]),
    ok({ canvasState: validState, pathways: 'oops', sisterLinks: null }),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.pathways, []);
  assert.deepEqual(result.sisterLinks, []);
});

test('parser: canvasState is a string in a successful response → normalised to null', () => {
  const result = parseCanvasFetchResponses(
    ok([validNode]),
    ok({ canvasState: 'oops', pathways: [], sisterLinks: [] }),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.canvasState, null);
});
