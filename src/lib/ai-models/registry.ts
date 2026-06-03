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
} from './models.ts';
import { MODEL_PRICING } from './pricing.ts';
import type { AiModelRecord, AiPickerMenuId } from './types.ts';

// Human labels for the currently-wired Anthropic models. Kept here (not in the
// raw model-string list) so the picker can show friendly names. These MUST match
// the labels W#1's AutoAnalyze picker showed before P-63 Phase 1 Deploy 3, so
// migrating that picker to the registry is visibly identical.
const ANTHROPIC_LABELS: Record<string, string> = {
  'claude-opus-4-8': 'Claude Opus 4.8',
  'claude-opus-4-7': 'Claude Opus 4.7',
  'claude-opus-4-6': 'Claude Opus 4.6',
  'claude-sonnet-4-6': 'Claude Sonnet 4.6',
  'claude-opus-4-5': 'Claude Opus 4.5',
  'claude-haiku-4-5': 'Claude Haiku 4.5',
};

// W#1's three thinking modes (Adaptive / Enabled / Disabled) map onto the
// registry's ThinkingOptionId set as auto / extended / none. Every Anthropic
// model in the keyword-clustering menu offers all three. (W#2's review-analysis
// modals render no thinking control, so they ignore this field.)
const ANTHROPIC_THINKING_OPTIONS = ['none', 'auto', 'extended'] as const;

// The wider-menu models W#1 (keyword-clustering) offers on TOP of the shared
// Opus trio — Sonnet 4.6 / Opus 4.5 / Haiku 4.5. NOT offered in W#2's Opus-only
// review-analysis menu, so they're tagged for 'keyword-clustering' only.
const KEYWORD_CLUSTERING_ONLY_MODEL_IDS = [
  'claude-sonnet-4-6',
  'claude-opus-4-5',
  'claude-haiku-4-5',
] as const;

// Seed — the three currently-runnable Anthropic Opus models, derived from the
// W#2 source-of-truth (models.ts list + pricing.ts numbers) so there is no
// duplication of either the model list or the pricing numbers. Every entry is
// `runnable` because the Anthropic adapter is shipped.
//
// Helper — one runnable Anthropic record from a raw model id + its menus.
function anthropicModel(
  modelId: string,
  menus: AiPickerMenuId[]
): AiModelRecord {
  return {
    id: `anthropic:${modelId}`,
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    modelId,
    displayLabel: ANTHROPIC_LABELS[modelId] ?? modelId,
    thinkingOptions: [...ANTHROPIC_THINKING_OPTIONS],
    menus,
    pricing: MODEL_PRICING[modelId],
    enabled: true,
    runnableStatus: 'runnable',
  };
}

// The three Opus models are offered in BOTH platform menus — W#2's review-
// analysis picker AND W#1's keyword-clustering picker both list Opus 4.8/4.7/4.6
// — so each is tagged for both menus. The three wider-menu models follow, tagged
// for keyword-clustering only. Registry order = the on-screen order of W#1's
// picker (Opus 4.8 → 4.7 → 4.6 → Sonnet 4.6 → Opus 4.5 → Haiku 4.5); W#2's
// menu filter preserves the Opus subset in the same order.
const SEED_REGISTRY: AiModelRecord[] = [
  ...SUPPORTED_MODEL_VERSIONS.map((modelId) =>
    anthropicModel(modelId, ['review-analysis', 'keyword-clustering'])
  ),
  ...KEYWORD_CLUSTERING_ONLY_MODEL_IDS.map((modelId) =>
    anthropicModel(modelId, ['keyword-clustering'])
  ),
];

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

// The enabled models a given platform picker should render, in registry order.
// Every model-selection surface calls this with its own menu id, so adding a
// model to (or removing it from) a menu is a registry data change that
// propagates to that picker automatically — no picker code edit.
export function getModelsForMenu(menu: AiPickerMenuId): AiModelRecord[] {
  return getEnabledModels().filter((m) => m.menus.includes(menu));
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
