// P-63 Phase 0 — platform-level AI-model registry: shared types.
//
// This is the NEW single-source-of-truth home for AI model metadata across the
// whole platform (W#1 keyword-clustering + W#2 competition-scraping + the future
// admin "add a model" wizard). Phase 0 is PURELY ADDITIVE — these types + the
// registry/adapter modules sit ALONGSIDE the existing W#2
// `competition-scraping/review-analysis/{models,pricing}.ts` without modifying
// them, so no existing model picker or AI task can break. Phase 1 repoints every
// consumer here and inverts the (currently temporary) dependency direction.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.
// See docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md.

// Pricing math + token-usage shape live in the sibling ai-models/pricing.ts —
// the canonical home as of P-63 Phase 1 (the old W#2 path is now a back-compat
// re-export shim). Exactly ONE source of pricing numbers + cost math, no drift.
export type { ModelPricing, TokenUsage } from './pricing.ts';

// The AI companies the platform can represent. A provider only becomes RUNNABLE
// once a provider adapter ships for it (see provider-adapter.ts); until then a
// model from that provider is recorded as 'integration-pending'.
export type AiProviderId = 'anthropic' | 'openai' | 'google';

// The "thinking" modes the platform can OFFER for a model. Which subset a given
// model actually exposes is per-record (AiModelRecord.thinkingOptions). 'none'
// means a plain inference call with no extended-thinking request.
export type ThinkingOptionId = 'none' | 'fast' | 'auto' | 'extended';

// 'runnable'             — a provider adapter is shipped; the model can run real
//                          tasks and may be selected for a run.
// 'integration-pending'  — recorded in the registry (company + model + pricing)
//                          but NOT yet wired to a provider adapter. Pickers MUST
//                          render it disabled and never dispatch a run to it.
//                          This status is the safety gate that keeps the
//                          add-a-model flow issue-free (no silent-failure trap).
export type RunnableStatus = 'runnable' | 'integration-pending';

import type { ModelPricing } from './pricing.ts';

// One model as it appears throughout the platform. This is the unit the admin
// "add a model" wizard creates (company → model → thinking options → pricing)
// and the unit every picker renders.
export type AiModelRecord = {
  // Stable registry id, namespaced by provider, e.g. 'anthropic:claude-opus-4-8'.
  // Distinct from `modelId` so two providers could expose the same raw model
  // string without colliding.
  id: string;
  provider: AiProviderId;
  // Human-readable company name shown in the wizard's step 1, e.g. 'Anthropic'.
  providerLabel: string;
  // The raw model string passed to the provider's API, e.g. 'claude-opus-4-8'.
  modelId: string;
  // Human label shown in pickers, e.g. 'Claude Opus 4.8'.
  displayLabel: string;
  // The thinking modes offered for THIS model (always >= 1 entry; use ['none']
  // when the model offers no extended thinking).
  thinkingOptions: ThinkingOptionId[];
  pricing: ModelPricing;
  // Whether the model is shown in pickers at all (a soft enable/disable that is
  // independent of runnableStatus — a runnable model can still be hidden).
  enabled: boolean;
  runnableStatus: RunnableStatus;
};
