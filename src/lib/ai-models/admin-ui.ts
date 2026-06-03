// P-63 Phase 2b (2026-06-03) — pure helpers for the /ai-models self-serve admin
// screen. Kept SDK-free + DOM-free so the page stays thin and these are unit-
// tested by `node --test --experimental-strip-types` (admin-ui.test.ts).
//
// The page (src/app/ai-models/page.tsx) owns React state + fetch; everything that
// can be a pure function (labels, the add-a-model wizard validation, the
// integration-pending instruction text) lives here.

import type {
  AiPickerMenuId,
  AiProviderId,
  ThinkingOptionId,
} from './types.ts';
import { isProviderIntegrated } from './provider-adapter.ts';

// The companies the add-a-model wizard offers in step 1. Order = display order.
export const PROVIDER_OPTIONS: { id: AiProviderId; label: string }[] = [
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Google' },
];

export const THINKING_LABELS: Record<ThinkingOptionId, string> = {
  none: 'None (standard call)',
  fast: 'Fast',
  auto: 'Auto',
  extended: 'Extended thinking',
};

export const MENU_LABELS: Record<AiPickerMenuId, string> = {
  'review-analysis': 'W#2 — Competition review analysis',
  'keyword-clustering': 'W#1 — Keyword clustering',
};

export const ALL_THINKING_OPTIONS: ThinkingOptionId[] = [
  'none',
  'fast',
  'auto',
  'extended',
];
export const ALL_MENUS: AiPickerMenuId[] = ['review-analysis', 'keyword-clustering'];

// Whether a company already has a shipped integration (so its models can run).
export function providerIsIntegrated(provider: AiProviderId): boolean {
  return isProviderIntegrated(provider);
}

// --- The add-a-model wizard draft -------------------------------------------

// Pricing held as strings while typing; parsed to numbers on save.
export type PricingDraft = {
  inputPerMillion: string;
  outputPerMillion: string;
  cacheWrite5mPerMillion: string;
  cacheReadPerMillion: string;
};

export type ModelDraft = {
  provider: AiProviderId | '';
  modelId: string;
  displayLabel: string;
  thinkingOptions: ThinkingOptionId[];
  menus: AiPickerMenuId[];
  pricing: PricingDraft;
};

export function emptyDraft(): ModelDraft {
  return {
    provider: '',
    modelId: '',
    displayLabel: '',
    thinkingOptions: ['none'],
    menus: ['review-analysis'],
    pricing: {
      inputPerMillion: '',
      outputPerMillion: '',
      cacheWrite5mPerMillion: '',
      cacheReadPerMillion: '',
    },
  };
}

// The 4 wizard steps (display titles). Step indices are 1-based in the UI.
export const WIZARD_STEPS = [
  'Company',
  'Model',
  'Where it appears + thinking',
  'Pricing',
] as const;

export const WIZARD_STEP_COUNT = WIZARD_STEPS.length;

// Whether the wizard's "Next" (or "Save" on the last step) should be enabled for
// the given step. Mirrors the server validation so the UI can't submit a body the
// API would reject.
export function canProceedFromStep(step: number, d: ModelDraft): boolean {
  switch (step) {
    case 1:
      return d.provider !== '';
    case 2:
      return d.modelId.trim().length > 0;
    case 3:
      return d.thinkingOptions.length > 0 && d.menus.length > 0;
    case 4:
      return parsePricing(d.pricing).ok;
    default:
      return false;
  }
}

// --- Draft → API body -------------------------------------------------------

export type NewModelBody = {
  provider: AiProviderId;
  providerLabel: string;
  modelId: string;
  displayLabel: string;
  thinkingOptions: ThinkingOptionId[];
  menus: AiPickerMenuId[];
  pricing: {
    inputPerMillion: number;
    outputPerMillion: number;
    cacheWrite5mPerMillion: number;
    cacheReadPerMillion: number;
  };
};

export type DraftToBodyResult =
  | { ok: true; body: NewModelBody }
  | { ok: false; error: string };

// Convert a completed draft into the POST /api/ai-models body. displayLabel
// falls back to the raw modelId when left blank.
export function draftToCreateBody(d: ModelDraft): DraftToBodyResult {
  if (d.provider === '') return { ok: false, error: 'Pick a company first.' };
  const modelId = d.modelId.trim();
  if (modelId.length === 0) {
    return { ok: false, error: 'Enter the model id.' };
  }
  if (d.thinkingOptions.length === 0) {
    return { ok: false, error: 'Pick at least one thinking option.' };
  }
  if (d.menus.length === 0) {
    return { ok: false, error: 'Pick at least one place for it to appear.' };
  }
  const pricing = parsePricing(d.pricing);
  if (!pricing.ok) return { ok: false, error: pricing.error };

  const providerLabel =
    PROVIDER_OPTIONS.find((p) => p.id === d.provider)?.label ?? d.provider;
  const displayLabel = d.displayLabel.trim() || modelId;

  return {
    ok: true,
    body: {
      provider: d.provider,
      providerLabel,
      modelId,
      displayLabel,
      thinkingOptions: d.thinkingOptions,
      menus: d.menus,
      pricing: pricing.value,
    },
  };
}

type ParsePricingResult =
  | { ok: true; value: NewModelBody['pricing'] }
  | { ok: false; error: string };

const PRICING_FIELD_LABELS: Record<keyof PricingDraft, string> = {
  inputPerMillion: 'Input',
  outputPerMillion: 'Output',
  cacheWrite5mPerMillion: 'Cache write',
  cacheReadPerMillion: 'Cache read',
};

export function parsePricing(p: PricingDraft): ParsePricingResult {
  const out = {} as NewModelBody['pricing'];
  for (const key of Object.keys(PRICING_FIELD_LABELS) as (keyof PricingDraft)[]) {
    const raw = p[key].trim();
    if (raw === '') {
      return {
        ok: false,
        error: `${PRICING_FIELD_LABELS[key]} price is required.`,
      };
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      return {
        ok: false,
        error: `${PRICING_FIELD_LABELS[key]} price must be a number ≥ 0.`,
      };
    }
    out[key] = n;
  }
  return { ok: true, value: out };
}

// --- The integration-pending popover (design decision D2) -------------------

// The exact instruction the director pastes back to Claude to get a model from a
// not-yet-integrated company LIVE. Quotes the canonical one-line pointer from
// docs/AI_MODEL_REGISTRY_PRIMER.md so the popover and the primer never drift.
export function integrationPendingInstruction(providerLabel: string): string {
  return (
    `“${providerLabel}” isn’t connected yet, so this model is saved as ` +
    `“integration pending” — it shows up disabled in every dropdown and is ` +
    `never actually run, so it can’t silently fail.\n\n` +
    `To make it live, paste this to Claude Code (and attach ${providerLabel}’s ` +
    `API/SDK docs):\n\n` +
    `“Read docs/AI_MODEL_REGISTRY_PRIMER.md, then build the ${providerLabel} ` +
    `provider integration (P-63 Phase 3) and flip its models to runnable. ` +
    `${providerLabel}’s API docs are attached.”`
  );
}
