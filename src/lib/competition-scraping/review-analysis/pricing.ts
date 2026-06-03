// W#2 review-analysis pricing — BACK-COMPAT RE-EXPORT SHIM (P-63 Phase 1).
//
// The canonical pricing table + cost-math MOVED to the platform-level central
// registry at `src/lib/ai-models/pricing.ts` as part of the P-63 dependency
// inversion. This file now simply re-exports them so every existing importer of
// this path (the run-batch handler, token-counter, pricing.test.ts) keeps
// working unchanged. Do NOT add new declarations here — edit the canonical
// `ai-models/pricing.ts` instead.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.

export {
  MODEL_PRICING,
  getPricingForModel,
  calculateCostUsd,
  estimateCostUsd,
  toCostUsdMicros,
} from '../../ai-models/pricing.ts';
export type { TokenUsage, ModelPricing } from '../../ai-models/pricing.ts';
