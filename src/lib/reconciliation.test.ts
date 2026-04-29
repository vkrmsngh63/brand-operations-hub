/**
 * Unit tests for the P3-F7 status reconciliation pure helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/reconciliation.test.ts
 *
 * Uses Node's built-in `node:test` and `node:assert/strict`. No external
 * test framework. No DB. No React.
 *
 * The helper is the structural defense for Bug 2 (closure-staleness). The
 * tests cover every branch of the reconciliation truth table AND a
 * fresh-vs-stale contrast test that verifies the helper has no hidden
 * snapshot — its output reflects whatever keyword list it's called with.
 * That property is what makes it impossible to reintroduce the
 * 2026-04-28 closure-staleness regression at line 830.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeReconciliationUpdates,
  type KeywordReconcileInput,
} from './reconciliation.ts';

const kw = (id: string, sortingStatus: string): KeywordReconcileInput => ({ id, sortingStatus });

/* ── Empty / no-op cases ─────────────────────────────────────────────── */

test('reconciliation: empty keyword list → empty updates', () => {
  const r = computeReconciliationUpdates([], new Set(), new Set());
  assert.equal(r.updates.length, 0);
  assert.equal(r.flippedToAiSorted, 0);
  assert.equal(r.flippedToReshuffled, 0);
});

test('reconciliation: everything already correct → no-op', () => {
  const r = computeReconciliationUpdates(
    [
      kw('a', 'AI-Sorted'),
      kw('b', 'AI-Sorted'),
      kw('c', 'Unsorted'),  // off-canvas, Unsorted — leave alone
      kw('d', 'Reshuffled'),  // off-canvas, Reshuffled — leave alone
    ],
    new Set(['a', 'b']),
    new Set(),
  );
  assert.equal(r.updates.length, 0);
  assert.equal(r.flippedToAiSorted, 0);
  assert.equal(r.flippedToReshuffled, 0);
});

/* ── Healing branch: on-canvas + Unsorted/Reshuffled → AI-Sorted ───── */

test('reconciliation: on-canvas + Unsorted → AI-Sorted', () => {
  const r = computeReconciliationUpdates(
    [kw('a', 'Unsorted')],
    new Set(['a']),
    new Set(),
  );
  assert.deepEqual(r.updates, [{ id: 'a', sortingStatus: 'AI-Sorted' }]);
  assert.equal(r.flippedToAiSorted, 1);
  assert.equal(r.flippedToReshuffled, 0);
});

test('reconciliation: on-canvas + Reshuffled → AI-Sorted (the 2026-04-28 healing case)', () => {
  const r = computeReconciliationUpdates(
    [kw('a', 'Reshuffled')],
    new Set(['a']),
    new Set(),
  );
  assert.deepEqual(r.updates, [{ id: 'a', sortingStatus: 'AI-Sorted' }]);
  assert.equal(r.flippedToAiSorted, 1);
  assert.equal(r.flippedToReshuffled, 0);
});

/* ── Punishment branch: off-canvas + AI-Sorted → Reshuffled ────────── */

test('reconciliation: off-canvas + AI-Sorted → Reshuffled', () => {
  const r = computeReconciliationUpdates(
    [kw('a', 'AI-Sorted')],
    new Set(),
    new Set(),
  );
  assert.deepEqual(r.updates, [{ id: 'a', sortingStatus: 'Reshuffled' }]);
  assert.equal(r.flippedToAiSorted, 0);
  assert.equal(r.flippedToReshuffled, 1);
});

/* ── Archived skip ──────────────────────────────────────────────────── */

test('reconciliation: archived keyword is skipped regardless of canvas presence/status', () => {
  const r = computeReconciliationUpdates(
    [
      kw('a', 'AI-Sorted'),  // archived AND off-canvas → would normally flip, but archived skip
      kw('b', 'Reshuffled'), // archived AND on-canvas → would normally heal, but archived skip
    ],
    new Set(['b']),
    new Set(['a', 'b']),
  );
  assert.equal(r.updates.length, 0);
  assert.equal(r.flippedToAiSorted, 0);
  assert.equal(r.flippedToReshuffled, 0);
});

/* ── Mixed batch ─────────────────────────────────────────────────────── */

test('reconciliation: mixed batch covering all four cells of the truth table', () => {
  const r = computeReconciliationUpdates(
    [
      kw('on-canvas-already-sorted', 'AI-Sorted'),     // no-op (on-canvas + AI-Sorted)
      kw('on-canvas-needs-heal', 'Reshuffled'),         // heal → AI-Sorted
      kw('off-canvas-stale-sorted', 'AI-Sorted'),       // punish → Reshuffled
      kw('off-canvas-already-reshuffled', 'Reshuffled'), // no-op (off-canvas + Reshuffled is fine)
      kw('archived-anything', 'AI-Sorted'),             // archived skip
    ],
    new Set(['on-canvas-already-sorted', 'on-canvas-needs-heal']),
    new Set(['archived-anything']),
  );
  assert.equal(r.updates.length, 2);
  assert.deepEqual(
    r.updates.find(u => u.id === 'on-canvas-needs-heal'),
    { id: 'on-canvas-needs-heal', sortingStatus: 'AI-Sorted' },
  );
  assert.deepEqual(
    r.updates.find(u => u.id === 'off-canvas-stale-sorted'),
    { id: 'off-canvas-stale-sorted', sortingStatus: 'Reshuffled' },
  );
  assert.equal(r.flippedToAiSorted, 1);
  assert.equal(r.flippedToReshuffled, 1);
});

/* ── The 2026-04-28 regression scenario ────────────────────────────── */
/**
 * Empirical reproduction of the closure-staleness bug from the live Bursitis
 * canvas. At run start, 84 keywords were AI-Sorted. After batch 70's blanking,
 * each of the 84 hit `!onCanvas && status === 'AI-Sorted'` → flipped to
 * Reshuffled. The bug: in batches 71-133, those 84 keywords were ACTUALLY
 * back on canvas (refresh succeeded), but the closure-frozen `allKeywords`
 * still showed them as AI-Sorted (not Reshuffled), so the heal branch
 * `onCanvas && status === 'Reshuffled'` never fired and they stayed
 * Reshuffled forever in the DB.
 *
 * With the pure helper + the function-entry shadow that resolves
 * `allKeywords` to `keywordsRef.current`, the helper now sees the FRESH
 * status (Reshuffled), the heal branch fires, and the keywords flip back
 * to AI-Sorted. This test proves the structural fix at the helper level.
 */

test('reconciliation: 2026-04-28 stale-vs-fresh contrast — fresh input heals the stuck-Reshuffled keywords', () => {
  // The 84 keywords as they appeared in the closure-frozen `allKeywords`
  // (status = 'AI-Sorted' — pre-blanking snapshot, what the buggy code saw).
  const stale = Array.from({ length: 84 }, (_, i) => kw(`kw-${i}`, 'AI-Sorted'));
  // The same 84 keywords as they appear in `keywordsRef.current` (status =
  // 'Reshuffled' — post-blanking actual state, what the fixed code sees).
  const fresh = Array.from({ length: 84 }, (_, i) => kw(`kw-${i}`, 'Reshuffled'));
  // After a healthy batch's refresh, all 84 are back on canvas.
  const placedSet = new Set(stale.map(k => k.id));

  // Stale view: helper sees AI-Sorted + on-canvas → no-op (the silent bug).
  const staleResult = computeReconciliationUpdates(stale, placedSet, new Set());
  assert.equal(staleResult.updates.length, 0);

  // Fresh view: helper sees Reshuffled + on-canvas → heals all 84.
  const freshResult = computeReconciliationUpdates(fresh, placedSet, new Set());
  assert.equal(freshResult.updates.length, 84);
  assert.equal(freshResult.flippedToAiSorted, 84);
  assert.equal(freshResult.flippedToReshuffled, 0);
  assert.ok(freshResult.updates.every(u => u.sortingStatus === 'AI-Sorted'));
});

/* ── Hidden-snapshot regression test ────────────────────────────────── */
/**
 * The most important property of `computeReconciliationUpdates`: it has no
 * hidden state. Calling it twice with the same args yields the same result;
 * calling it with different args yields different results. There's nothing
 * for a closure to capture — that's the structural fix. This test pins
 * that property explicitly so any future refactor that introduces a hidden
 * memoisation / cache will fail loudly here.
 */

test('reconciliation: pure function — same args twice → same result, different args → different result', () => {
  const a = computeReconciliationUpdates(
    [kw('x', 'AI-Sorted')],
    new Set(),
    new Set(),
  );
  const b = computeReconciliationUpdates(
    [kw('x', 'AI-Sorted')],
    new Set(),
    new Set(),
  );
  assert.deepEqual(a, b);

  const c = computeReconciliationUpdates(
    [kw('x', 'Reshuffled')], // status differs
    new Set(['x']),           // placement differs
    new Set(),
  );
  assert.notDeepEqual(a, c);
});

/* ── Defensive: unknown status strings ─────────────────────────────── */

test('reconciliation: unknown status string falls through (no flip in either direction)', () => {
  // Defends against future status-vocabulary additions: anything that isn't
  // exactly Unsorted/Reshuffled/AI-Sorted is left alone rather than
  // miscategorised.
  const r = computeReconciliationUpdates(
    [kw('a', 'Pending'), kw('b', 'Approved'), kw('c', 'Whatever')],
    new Set(['a', 'b']),
    new Set(),
  );
  assert.equal(r.updates.length, 0);
});
