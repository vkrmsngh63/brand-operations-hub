// P-63 Phase 0 — node:test cases for the platform-level AI-model registry.
// Pins the seed shape + the accessors + the runnable/enabled gates so the
// registry can't silently drift. See docs/AI_MODEL_REGISTRY.md + ROADMAP P-63.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAiModelRegistry,
  getEnabledModels,
  getRunnableModels,
  getModelById,
  getModelByModelId,
  isModelRunnable,
  getDefaultModelId,
  DEFAULT_MODEL_ID,
} from './registry.ts';
import {
  SUPPORTED_MODEL_VERSIONS,
  DEFAULT_MODEL_VERSION,
} from '../competition-scraping/review-analysis/models.ts';
import { MODEL_PRICING } from '../competition-scraping/review-analysis/pricing.ts';

test('seed registry mirrors the existing W#2 model list (no duplication / no drift)', () => {
  const reg = getAiModelRegistry();
  assert.equal(reg.length, SUPPORTED_MODEL_VERSIONS.length);
  for (const v of SUPPORTED_MODEL_VERSIONS) {
    const rec = getModelByModelId(v);
    assert.ok(rec, `${v} should be present in the registry`);
    assert.equal(rec.provider, 'anthropic');
    assert.equal(rec.id, `anthropic:${v}`);
  }
});

test('every record has a valid, complete shape', () => {
  for (const m of getAiModelRegistry()) {
    assert.ok(m.id.length > 0);
    assert.ok(m.modelId.length > 0);
    assert.ok(m.displayLabel.length > 0);
    assert.ok(m.providerLabel.length > 0);
    assert.ok(m.thinkingOptions.length >= 1, `${m.id} must offer >=1 thinking option`);
    assert.ok(m.pricing && typeof m.pricing.inputPerMillion === 'number');
    assert.equal(typeof m.enabled, 'boolean');
    assert.ok(m.runnableStatus === 'runnable' || m.runnableStatus === 'integration-pending');
  }
});

test('registry ids are unique', () => {
  const ids = getAiModelRegistry().map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('pricing on each record is the SAME object/numbers as the W#2 pricing table', () => {
  for (const m of getAiModelRegistry()) {
    assert.deepEqual(m.pricing, MODEL_PRICING[m.modelId]);
  }
});

test('getDefaultModelId / DEFAULT_MODEL_ID mirror the W#2 default (Opus 4.7)', () => {
  assert.equal(DEFAULT_MODEL_ID, `anthropic:${DEFAULT_MODEL_VERSION}`);
  assert.equal(getDefaultModelId(), DEFAULT_MODEL_ID);
  assert.ok(getModelById(getDefaultModelId()), 'default must resolve to a real record');
});

test('getEnabledModels returns only enabled records', () => {
  for (const m of getEnabledModels()) {
    assert.equal(m.enabled, true);
  }
});

test('getRunnableModels returns only enabled AND runnable records', () => {
  for (const m of getRunnableModels()) {
    assert.equal(m.enabled, true);
    assert.equal(m.runnableStatus, 'runnable');
  }
  // All three seed models are runnable today.
  assert.equal(getRunnableModels().length, SUPPORTED_MODEL_VERSIONS.length);
});

test('isModelRunnable gates on both enabled + runnable + existence', () => {
  assert.equal(isModelRunnable('anthropic:claude-opus-4-8'), true);
  assert.equal(isModelRunnable('does-not-exist'), false);
});

test('getModelById returns undefined for an unknown id', () => {
  assert.equal(getModelById('openai:gpt-4'), undefined);
});
