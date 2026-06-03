// P-63 Phase 2d — node:test for the server-side registry read helper.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getRunnableModelIdsForMenu } from './server-registry.ts';
import { buildSeedCreateData } from './handlers/ai-model-registry.ts';
import type { AiModelRegistryRow } from './handlers/ai-model-registry.ts';

function rowsFromSeed(): AiModelRegistryRow[] {
  return buildSeedCreateData().map((d) => ({
    ...d,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }));
}

function fakePrisma(rows: AiModelRegistryRow[]) {
  return {
    aiModelRegistryEntry: {
      findMany: async () => [...rows].sort((a, b) => a.sortOrder - b.sortOrder),
    },
  };
}

test('getRunnableModelIdsForMenu returns the seeded review-analysis Opus ids', async () => {
  const ids = await getRunnableModelIdsForMenu(fakePrisma(rowsFromSeed()), 'review-analysis');
  assert.deepEqual(ids, ['claude-opus-4-8', 'claude-opus-4-7', 'claude-opus-4-6']);
});

test('getRunnableModelIdsForMenu includes a self-serve-added runnable W#2 model', async () => {
  const rows = rowsFromSeed();
  rows.push({
    id: 'anthropic:claude-opus-5-0',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    modelId: 'claude-opus-5-0',
    displayLabel: 'Claude Opus 5.0',
    thinkingOptions: ['none'],
    menus: ['review-analysis'],
    pricing: { inputPerMillion: 5, outputPerMillion: 25, cacheWrite5mPerMillion: 6.25, cacheReadPerMillion: 0.5 },
    enabled: true,
    runnableStatus: 'runnable',
    sortOrder: 99,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });
  const ids = await getRunnableModelIdsForMenu(fakePrisma(rows), 'review-analysis');
  assert.ok(ids.includes('claude-opus-5-0'));
});

test('getRunnableModelIdsForMenu excludes integration-pending + disabled + wrong-menu', async () => {
  const rows = rowsFromSeed();
  rows.push({
    id: 'openai:gpt-x', provider: 'openai', providerLabel: 'OpenAI', modelId: 'gpt-x',
    displayLabel: 'GPT X', thinkingOptions: ['none'], menus: ['review-analysis'],
    pricing: { inputPerMillion: 1, outputPerMillion: 1, cacheWrite5mPerMillion: 1, cacheReadPerMillion: 1 },
    enabled: true, runnableStatus: 'integration-pending', sortOrder: 98,
    createdAt: new Date(0), updatedAt: new Date(0),
  });
  const ids = await getRunnableModelIdsForMenu(fakePrisma(rows), 'review-analysis');
  assert.ok(!ids.includes('gpt-x'));
  // Sonnet (keyword-clustering only) must not appear in the review-analysis menu.
  assert.ok(!ids.includes('claude-sonnet-4-6'));
});

test('getRunnableModelIdsForMenu returns [] for an empty (unseeded) table', async () => {
  const ids = await getRunnableModelIdsForMenu(fakePrisma([]), 'review-analysis');
  assert.deepEqual(ids, []);
});
