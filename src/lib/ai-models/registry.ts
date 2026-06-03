// P-63 Phase 0 — platform-level AI-model registry: the data + accessors.
//
// PURELY ADDITIVE: nothing imports this module yet. Phase 1 repoints the 6 W#2
// modals + W#1 AutoAnalyze here so every picker loads its options from this one
// place. Phase 2 swaps the in-code seed below for a DB-backed source WITHOUT
// changing any consumer — consumers only ever call the accessors, never touch
// storage. (See docs/polish-item-specs/P-63-*.md §3 storage seam.)
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.

import {
  DEFAULT_MODEL_VERSION,
  SUPPORTED_MODEL_VERSIONS,
} from '../competition-scraping/review-analysis/models.ts';
import { MODEL_PRICING } from '../competition-scraping/review-analysis/pricing.ts';
import type { AiModelRecord } from './types.ts';

// Human labels for the currently-wired Anthropic models. Kept here (not in the
// raw model-string list) so the picker can show friendly names.
const ANTHROPIC_LABELS: Record<string, string> = {
  'claude-opus-4-8': 'Claude Opus 4.8',
  'claude-opus-4-7': 'Claude Opus 4.7',
  'claude-opus-4-6': 'Claude Opus 4.6',
};

// Phase 0 seed — the three currently-runnable Anthropic models, derived from the
// EXISTING W#2 source-of-truth (models.ts list + pricing.ts numbers) so there is
// no duplication of either the model list or the pricing numbers. Every entry is
// `runnable` because the Anthropic adapter is shipped. The W#2 modals offer no
// thinking options today, so thinkingOptions is ['none'] here; W#1's extended-
// thinking surface is reconciled in Phase 1.
const SEED_REGISTRY: AiModelRecord[] = SUPPORTED_MODEL_VERSIONS.map(
  (modelId): AiModelRecord => ({
    id: `anthropic:${modelId}`,
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    modelId,
    displayLabel: ANTHROPIC_LABELS[modelId] ?? modelId,
    thinkingOptions: ['none'],
    pricing: MODEL_PRICING[modelId],
    enabled: true,
    runnableStatus: 'runnable',
  })
);

// The registry id of the platform default, mirroring the existing W#2 default
// (Opus 4.7). Consumers that want the default model resolve it via
// getDefaultModelId() so the default lives in exactly one place.
export const DEFAULT_MODEL_ID = `anthropic:${DEFAULT_MODEL_VERSION}`;

// --- Accessors (the storage seam) -------------------------------------------
// Today these read the in-code SEED_REGISTRY. Phase 2 changes ONLY these bodies
// to read from the DB; every consumer keeps working unchanged.

export function getAiModelRegistry(): AiModelRecord[] {
  return SEED_REGISTRY;
}

// Models a picker should show (enabled), in registry order.
export function getEnabledModels(): AiModelRecord[] {
  return getAiModelRegistry().filter((m) => m.enabled);
}

// Models that can actually be dispatched to a run (enabled AND runnable).
export function getRunnableModels(): AiModelRecord[] {
  return getAiModelRegistry().filter(
    (m) => m.enabled && m.runnableStatus === 'runnable'
  );
}

export function getModelById(id: string): AiModelRecord | undefined {
  return getAiModelRegistry().find((m) => m.id === id);
}

// Look up by the raw provider model string (e.g. 'claude-opus-4-8'). Returns the
// first match; ids are provider-namespaced so the same modelId under two
// providers would need getModelById to disambiguate.
export function getModelByModelId(modelId: string): AiModelRecord | undefined {
  return getAiModelRegistry().find((m) => m.modelId === modelId);
}

export function isModelRunnable(id: string): boolean {
  const m = getModelById(id);
  return !!m && m.enabled && m.runnableStatus === 'runnable';
}

export function getDefaultModelId(): string {
  return DEFAULT_MODEL_ID;
}
