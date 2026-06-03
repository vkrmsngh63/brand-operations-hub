// P-63 Phase 0 — platform-level AI-model registry: the provider-adapter seam.
//
// This is the boundary between the data-driven PRESENTATION layer (the registry)
// and the code INTEGRATION layer. A model is only runnable if its provider has a
// shipped adapter here. Adding a new model from an already-adapted provider is
// pure registry config; adding a model from a NEW provider needs a new adapter
// (a guided build from that provider's API docs) before it can flip to runnable.
//
// PURELY ADDITIVE in Phase 0: this seam is defined + unit-tested but NOT yet
// wired into the live call sites (the 12 `messages.create` calls in
// review-analysis-run-batch.ts + W#1 AutoAnalyze). Phase 1 routes those calls
// through the adapter with no behavior change for Anthropic.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.

import type { AiProviderId, ThinkingOptionId } from './types.ts';

// Anthropic's extended-thinking request param, mirroring the shape W#1
// AutoAnalyze already sends today (`{type:'enabled', budget_tokens}` /
// `{type:'adaptive'}` / omitted). `undefined` => no thinking block in the request.
export type AnthropicThinkingParam =
  | undefined
  | { type: 'adaptive' }
  | { type: 'enabled'; budget_tokens: number };

// Each provider implements this. Phase 0 ships only the Anthropic adapter; the
// interface is the contract a future OpenAI / Google adapter must satisfy.
export interface AiProviderAdapter {
  provider: AiProviderId;
  // Translate a registry ThinkingOption into the provider's request param shape.
  // Returning `undefined` means "no thinking block" for that option/provider.
  mapThinkingOption(opt: ThinkingOptionId, budgetTokens?: number): unknown;
}

const DEFAULT_THINKING_BUDGET = 12000;

export const anthropicAdapter: AiProviderAdapter = {
  provider: 'anthropic',
  mapThinkingOption(
    opt: ThinkingOptionId,
    budgetTokens: number = DEFAULT_THINKING_BUDGET
  ): AnthropicThinkingParam {
    switch (opt) {
      case 'extended':
        // Anthropic enforces a 1024-token floor on the thinking budget.
        return { type: 'enabled', budget_tokens: Math.max(1024, budgetTokens) };
      case 'auto':
        return { type: 'adaptive' };
      case 'fast':
      case 'none':
      default:
        return undefined;
    }
  },
};

// The shipped adapters, keyed by provider. A provider absent from this map has
// no integration yet → its models must stay 'integration-pending'.
export const PROVIDER_ADAPTERS: Partial<Record<AiProviderId, AiProviderAdapter>> = {
  anthropic: anthropicAdapter,
};

export function getAdapter(provider: AiProviderId): AiProviderAdapter | undefined {
  return PROVIDER_ADAPTERS[provider];
}

// Whether a provider has a shipped adapter (i.e. its models CAN be runnable).
// The registry's runnableStatus must never be 'runnable' for a provider that
// returns false here — provider-adapter.test.ts asserts that invariant.
export function isProviderIntegrated(provider: AiProviderId): boolean {
  return getAdapter(provider) !== undefined;
}
