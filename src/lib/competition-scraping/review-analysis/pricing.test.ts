// W#2 P-49 Workstream 5 — node:test cases for pricing math.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MODEL_PRICING,
  calculateCostUsd,
  estimateCostUsd,
  getPricingForModel,
  toCostUsdMicros,
} from './pricing.ts';

test('getPricingForModel returns the pricing for a known model', () => {
  const p = getPricingForModel('claude-opus-4-7');
  assert.equal(p.inputPerMillion, 5);
  assert.equal(p.outputPerMillion, 25);
});

test('getPricingForModel throws on unknown model', () => {
  assert.throws(
    () => getPricingForModel('claude-fake-99'),
    /Unknown modelVersion/
  );
});

test('MODEL_PRICING covers both supported Opus models', () => {
  assert.ok(MODEL_PRICING['claude-opus-4-7']);
  assert.ok(MODEL_PRICING['claude-opus-4-6']);
});

test('calculateCostUsd sums input + output + cache write + cache read', () => {
  // 1M input @ $5 + 100K output @ $25 + 200K cache-write @ $6.25 + 500K cache-read @ $0.5
  // = 5.00 + 2.50 + 1.25 + 0.25 = 9.00
  const cost = calculateCostUsd('claude-opus-4-7', {
    inputTokens: 1_000_000,
    outputTokens: 100_000,
    cacheCreationInputTokens: 200_000,
    cacheReadInputTokens: 500_000,
  });
  assert.ok(Math.abs(cost - 9.0) < 1e-9, `expected ~9.00, got ${cost}`);
});

test('calculateCostUsd is zero for an empty usage breakdown', () => {
  const cost = calculateCostUsd('claude-opus-4-7', {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  });
  assert.equal(cost, 0);
});

test('estimateCostUsd treats input + output as if no cache hits', () => {
  // 200K input @ $5 + 8K output @ $25 = 1.00 + 0.20 = 1.20
  const cost = estimateCostUsd('claude-opus-4-7', 200_000, 8_000);
  assert.ok(Math.abs(cost - 1.2) < 1e-9, `expected 1.20, got ${cost}`);
});

test('toCostUsdMicros converts dollars to integer microdollars', () => {
  assert.equal(toCostUsdMicros(1), 1_000_000);
  assert.equal(toCostUsdMicros(0.0001), 100);
  // half-away-from-zero rounding
  assert.equal(toCostUsdMicros(0.0000005), 1);
});

test('toCostUsdMicros throws on negative or non-finite input', () => {
  assert.throws(() => toCostUsdMicros(-1), /Invalid USD/);
  assert.throws(() => toCostUsdMicros(Number.NaN), /Invalid USD/);
  assert.throws(() => toCostUsdMicros(Number.POSITIVE_INFINITY), /Invalid USD/);
});
