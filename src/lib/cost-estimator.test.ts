import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mean,
  trailingMean,
  projectRunCost,
  classifyAnthropicError,
  evaluateSpendCap,
} from './cost-estimator.ts';

/* ── mean ──────────────────────────────────────────────────────── */
test('mean — empty list is 0', () => {
  assert.equal(mean([]), 0);
});
test('mean — averages values', () => {
  assert.equal(mean([1, 2, 3, 4]), 2.5);
});

/* ── trailingMean ──────────────────────────────────────────────── */
test('trailingMean — empty list is 0', () => {
  assert.equal(trailingMean([], 10), 0);
});
test('trailingMean — uses only the last `window` entries', () => {
  // last 3 of [1..6] = 4,5,6 → 5
  assert.equal(trailingMean([1, 2, 3, 4, 5, 6], 3), 5);
});
test('trailingMean — fewer entries than window averages all', () => {
  assert.equal(trailingMean([2, 4], 10), 3);
});
test('trailingMean — non-positive window falls back to all entries', () => {
  assert.equal(trailingMean([2, 4, 6], 0), 4);
});

/* ── projectRunCost ────────────────────────────────────────────── */
test('projectRunCost — uses fallback per-unit costs before any data', () => {
  const p = projectRunCost({
    spent: 0,
    batchCosts: [],
    batchesRemaining: 40,
    consolidationCosts: [],
    consolidationsRemaining: 4,
    fallbackBatchCost: 0.5,
    fallbackConsolidationCost: 1.5,
  });
  assert.equal(p.hasActuals, false);
  assert.equal(p.avgBatchCost, 0.5);
  assert.equal(p.avgConsolidationCost, 1.5);
  // 40 * 0.5 + 4 * 1.5 = 26
  assert.equal(p.estRemaining, 26);
  assert.equal(p.estTotal, 26);
});

test('projectRunCost — switches to trailing actuals once batches complete', () => {
  const p = projectRunCost({
    spent: 6,
    batchCosts: [0.6, 0.6, 0.6], // avg 0.6
    batchesRemaining: 10,
    consolidationCosts: [],
    consolidationsRemaining: 0,
    fallbackBatchCost: 0.5, // should be ignored — actuals exist
    fallbackConsolidationCost: 1.5,
  });
  assert.equal(p.hasActuals, true);
  assert.equal(p.avgBatchCost, 0.6);
  assert.equal(p.estRemaining, 6); // 10 * 0.6
  assert.equal(p.estTotal, 12); // spent 6 + 6
});

test('projectRunCost — only the last `window` batches drive the average', () => {
  const batchCosts = [10, 10, 10, 10, 10, 10, 10, 10, 1, 1]; // last 10 incl. all; window 2 → last 2 = 1
  const p = projectRunCost({
    spent: 0,
    batchCosts,
    batchesRemaining: 5,
    consolidationCosts: [],
    consolidationsRemaining: 0,
    fallbackBatchCost: 99,
    fallbackConsolidationCost: 0,
    window: 2,
  });
  assert.equal(p.avgBatchCost, 1);
  assert.equal(p.estRemaining, 5);
});

test('projectRunCost — folds remaining consolidations into the forecast', () => {
  const p = projectRunCost({
    spent: 5,
    batchCosts: [0.5, 0.5],
    batchesRemaining: 10,
    consolidationCosts: [2, 4], // avg 3
    consolidationsRemaining: 2,
    fallbackBatchCost: 0,
    fallbackConsolidationCost: 0,
  });
  // 10 * 0.5 + 2 * 3 = 11
  assert.equal(p.estRemaining, 11);
  assert.equal(p.estTotal, 16);
});

test('projectRunCost — negative remaining counts clamp to 0', () => {
  const p = projectRunCost({
    spent: 20,
    batchCosts: [0.5],
    batchesRemaining: -3,
    consolidationCosts: [],
    consolidationsRemaining: -1,
    fallbackBatchCost: 0.5,
    fallbackConsolidationCost: 1,
  });
  assert.equal(p.estRemaining, 0);
  assert.equal(p.estTotal, 20);
});

/* ── classifyAnthropicError ────────────────────────────────────── */
test('classifyAnthropicError — canonical Anthropic low-credit message', () => {
  const msg =
    'HTTP 400: Your credit balance is too low to access the Anthropic API. ' +
    'Please go to Plans & Billing to upgrade or purchase credits.';
  assert.equal(classifyAnthropicError(msg), 'credit');
});
test('classifyAnthropicError — case-insensitive + insufficient variants', () => {
  assert.equal(classifyAnthropicError('Insufficient credit'), 'credit');
  assert.equal(classifyAnthropicError('insufficient_quota'), 'credit');
  assert.equal(classifyAnthropicError('Your CREDIT balance is TOO LOW'), 'credit');
});
test('classifyAnthropicError — transient/other errors are not credit', () => {
  assert.equal(classifyAnthropicError('HTTP 529: overloaded_error'), 'other');
  assert.equal(classifyAnthropicError('HTTP 429: rate_limit_error'), 'other');
  assert.equal(classifyAnthropicError('network timeout'), 'other');
  assert.equal(classifyAnthropicError(''), 'other');
});

/* ── evaluateSpendCap ──────────────────────────────────────────── */
test('evaluateSpendCap — no cap (<=0) is always ok', () => {
  assert.equal(evaluateSpendCap(100, 200, 0), 'ok');
  assert.equal(evaluateSpendCap(100, 200, -5), 'ok');
});
test('evaluateSpendCap — under threshold is ok', () => {
  assert.equal(evaluateSpendCap(5, 12, 20), 'ok'); // 5 < 16 and est 12 < 20
});
test('evaluateSpendCap — within warn fraction of cap warns', () => {
  assert.equal(evaluateSpendCap(17, 18, 20), 'warn'); // 17 >= 16
});
test('evaluateSpendCap — projected total over cap warns even when spent is low', () => {
  assert.equal(evaluateSpendCap(5, 25, 20), 'warn'); // estTotal 25 >= 20
});
test('evaluateSpendCap — spent at/over cap is over', () => {
  assert.equal(evaluateSpendCap(20, 20, 20), 'over');
  assert.equal(evaluateSpendCap(21, 21, 20), 'over');
});
