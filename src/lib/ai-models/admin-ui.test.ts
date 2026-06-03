// P-63 Phase 2b — node:test cases for the /ai-models admin-screen pure helpers.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  canProceedFromStep,
  draftToCreateBody,
  emptyDraft,
  integrationPendingInstruction,
  parsePricing,
  providerIsIntegrated,
  WIZARD_STEP_COUNT,
  type ModelDraft,
} from './admin-ui.ts';

function filledDraft(overrides: Partial<ModelDraft> = {}): ModelDraft {
  return {
    provider: 'anthropic',
    modelId: 'claude-opus-4-9',
    displayLabel: 'Claude Opus 4.9',
    thinkingOptions: ['none', 'auto'],
    menus: ['review-analysis'],
    pricing: {
      inputPerMillion: '5',
      outputPerMillion: '25',
      cacheWrite5mPerMillion: '6.25',
      cacheReadPerMillion: '0.5',
    },
    ...overrides,
  };
}

test('emptyDraft starts with no company and a 4-step wizard', () => {
  assert.equal(emptyDraft().provider, '');
  assert.equal(WIZARD_STEP_COUNT, 4);
});

test('providerIsIntegrated reflects the shipped adapters', () => {
  assert.equal(providerIsIntegrated('anthropic'), true);
  assert.equal(providerIsIntegrated('openai'), false);
  assert.equal(providerIsIntegrated('google'), false);
});

test('canProceedFromStep gates each step on its required fields', () => {
  const d = filledDraft();
  assert.equal(canProceedFromStep(1, { ...d, provider: '' }), false);
  assert.equal(canProceedFromStep(1, d), true);
  assert.equal(canProceedFromStep(2, { ...d, modelId: '  ' }), false);
  assert.equal(canProceedFromStep(2, d), true);
  assert.equal(canProceedFromStep(3, { ...d, thinkingOptions: [] }), false);
  assert.equal(canProceedFromStep(3, { ...d, menus: [] }), false);
  assert.equal(canProceedFromStep(3, d), true);
  assert.equal(
    canProceedFromStep(4, {
      ...d,
      pricing: { ...d.pricing, inputPerMillion: '' },
    }),
    false
  );
  assert.equal(canProceedFromStep(4, d), true);
});

test('parsePricing requires all four non-negative numbers', () => {
  assert.equal(parsePricing(filledDraft().pricing).ok, true);
  assert.equal(
    parsePricing({ ...filledDraft().pricing, outputPerMillion: 'abc' }).ok,
    false
  );
  assert.equal(
    parsePricing({ ...filledDraft().pricing, cacheReadPerMillion: '-1' }).ok,
    false
  );
  assert.equal(
    parsePricing({ ...filledDraft().pricing, inputPerMillion: '' }).ok,
    false
  );
});

test('draftToCreateBody builds a valid body and defaults the label to the model id', () => {
  const r = draftToCreateBody(filledDraft({ displayLabel: '   ' }));
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.body.provider, 'anthropic');
    assert.equal(r.body.providerLabel, 'Anthropic');
    assert.equal(r.body.displayLabel, 'claude-opus-4-9');
    assert.equal(r.body.pricing.outputPerMillion, 25);
    assert.deepEqual(r.body.thinkingOptions, ['none', 'auto']);
  }
});

test('draftToCreateBody rejects incomplete drafts with a friendly error', () => {
  assert.equal(draftToCreateBody(filledDraft({ provider: '' })).ok, false);
  assert.equal(draftToCreateBody(filledDraft({ modelId: '' })).ok, false);
  assert.equal(draftToCreateBody(filledDraft({ menus: [] })).ok, false);
});

test('integrationPendingInstruction names the company and quotes the primer pointer', () => {
  const text = integrationPendingInstruction('OpenAI');
  assert.match(text, /OpenAI/);
  assert.match(text, /AI_MODEL_REGISTRY_PRIMER\.md/);
  assert.match(text, /integration pending/i);
  assert.match(text, /P-63 Phase 3/);
});
