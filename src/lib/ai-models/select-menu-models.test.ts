// P-63 Phase 2c — node:test for selectMenuModels (the live-picker filter) and its
// equivalence to the seed-based getModelsForMenu for today's data.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAiModelRegistry,
  getModelsForMenu,
  selectMenuModels,
} from './registry.ts';
import type { AiModelRecord } from './types.ts';

test('selectMenuModels matches getModelsForMenu for the in-code seed (both menus)', () => {
  const seed = getAiModelRegistry();
  for (const menu of ['review-analysis', 'keyword-clustering'] as const) {
    assert.deepEqual(
      selectMenuModels(seed, menu).map((m) => m.id),
      getModelsForMenu(menu).map((m) => m.id)
    );
  }
});

test('selectMenuModels excludes disabled and integration-pending models', () => {
  const base = getAiModelRegistry()[0];
  const list: AiModelRecord[] = [
    base,
    { ...base, id: 'x:disabled', enabled: false },
    {
      ...base,
      id: 'openai:pending',
      provider: 'openai',
      runnableStatus: 'integration-pending',
    },
  ];
  const out = selectMenuModels(list, 'review-analysis');
  assert.ok(out.some((m) => m.id === base.id));
  assert.ok(!out.some((m) => m.id === 'x:disabled'));
  assert.ok(!out.some((m) => m.id === 'openai:pending'));
});

test('selectMenuModels respects the menu tag and preserves order', () => {
  const seed = getAiModelRegistry();
  const w2 = selectMenuModels(seed, 'review-analysis');
  // W#2 is Opus-only — every result must be tagged review-analysis.
  assert.ok(w2.every((m) => m.menus.includes('review-analysis')));
  // Order preserved relative to the input list.
  const inputOrder = seed.filter((m) => w2.some((x) => x.id === m.id)).map((m) => m.id);
  assert.deepEqual(w2.map((m) => m.id), inputOrder);
});
