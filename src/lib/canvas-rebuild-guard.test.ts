/**
 * Unit tests for the G1 payload-sanity guard.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/canvas-rebuild-guard.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files in this folder.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateRebuildPayload,
  G1_SHRINK_THRESHOLD,
} from './canvas-rebuild-guard.ts';

/* ── Pass-through cases (G1 doesn't fire) ─────────────────────────── */

test('G1: delete-only payload (nodesProvided=false) → not blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 0,
    currentNodeCount: 100,
    hasExplicitDeletes: true,
    nodesProvided: false,
  });
  assert.equal(d.blocked, false);
});

test('G1: explicit deletes present → not blocked even on 95% shrink', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 5,
    currentNodeCount: 100,
    hasExplicitDeletes: true,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

test('G1: empty current canvas → not blocked (nothing to shrink from)', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 0,
    currentNodeCount: 0,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

test('G1: small canvas growth (10 → 12, 20% growth) → not blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 12,
    currentNodeCount: 10,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

test('G1: same-size canvas (no change) → not blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 100,
    currentNodeCount: 100,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

test('G1: 40% shrink (100 → 60) → not blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 60,
    currentNodeCount: 100,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

test('G1: exactly 50% shrink (100 → 50) → not blocked (threshold is strictly >50%)', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 50,
    currentNodeCount: 100,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, false);
});

/* ── Block cases (the bug signature) ─────────────────────────────── */

test('G1: 51% shrink (100 → 49) → blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 49,
    currentNodeCount: 100,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, true);
  assert.match(d.reason!, /49.+100|100.+49/);
});

test('G1: 95% shrink (284 → 12 — the 2026-04-28 batch-70 signature) → blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 12,
    currentNodeCount: 284,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, true);
  assert.match(d.reason!, /canvas-blanking/);
  assert.match(d.reason!, /deleteNodeIds/);
});

test('G1: 98% shrink (584 → 11 — the 2026-04-28 batch-134 signature) → blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 11,
    currentNodeCount: 584,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, true);
  assert.match(d.reason!, />50% drop/);
});

test('G1: full wipe (100 → 0, no explicit deletes) → blocked', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 0,
    currentNodeCount: 100,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, true);
});

test('G1: rejection message names the canvas-blanking bug for traceability', () => {
  const d = evaluateRebuildPayload({
    newNodeCount: 12,
    currentNodeCount: 284,
    hasExplicitDeletes: false,
    nodesProvided: true,
  });
  assert.equal(d.blocked, true);
  assert.match(d.reason!, /DEFENSE_IN_DEPTH_AUDIT_DESIGN/);
});

test('G1: threshold constant is exposed and equals 0.5 (the locked 50% decision)', () => {
  assert.equal(G1_SHRINK_THRESHOLD, 0.5);
});
