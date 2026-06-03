// P-63 Phase 0 — node:test cases for the provider-adapter seam.
// Pins the Anthropic thinking-option mapping (mirrors W#1 AutoAnalyze's current
// request shape) + the integration invariant that keeps the registry issue-free.
// See docs/AI_MODEL_REGISTRY.md + ROADMAP P-63.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  anthropicAdapter,
  getAdapter,
  isProviderIntegrated,
} from './provider-adapter.ts';
import { getAiModelRegistry } from './registry.ts';

test('anthropic adapter maps "extended" to an enabled thinking block with a budget floor', () => {
  assert.deepEqual(anthropicAdapter.mapThinkingOption('extended', 12000), {
    type: 'enabled',
    budget_tokens: 12000,
  });
  // 1024-token floor is enforced.
  assert.deepEqual(anthropicAdapter.mapThinkingOption('extended', 100), {
    type: 'enabled',
    budget_tokens: 1024,
  });
});

test('anthropic adapter maps "auto" to adaptive thinking', () => {
  assert.deepEqual(anthropicAdapter.mapThinkingOption('auto'), { type: 'adaptive' });
});

test('anthropic adapter maps "none"/"fast" to no thinking block', () => {
  assert.equal(anthropicAdapter.mapThinkingOption('none'), undefined);
  assert.equal(anthropicAdapter.mapThinkingOption('fast'), undefined);
});

test('getAdapter resolves anthropic and is undefined for un-integrated providers', () => {
  assert.equal(getAdapter('anthropic'), anthropicAdapter);
  assert.equal(getAdapter('openai'), undefined);
  assert.equal(getAdapter('google'), undefined);
});

test('isProviderIntegrated reflects only shipped adapters', () => {
  assert.equal(isProviderIntegrated('anthropic'), true);
  assert.equal(isProviderIntegrated('openai'), false);
  assert.equal(isProviderIntegrated('google'), false);
});

// The core issue-free invariant: no model may claim runnable status unless its
// provider actually has a shipped adapter. This is what prevents the
// "add Gemini → it appears in pickers → runs silently fail" trap.
test('INVARIANT: every runnable registry model has an integrated provider', () => {
  for (const m of getAiModelRegistry()) {
    if (m.runnableStatus === 'runnable') {
      assert.equal(
        isProviderIntegrated(m.provider),
        true,
        `${m.id} is marked runnable but its provider ${m.provider} has no adapter`
      );
    }
  }
});
