// W#2 P-49 Workstream 5 — per-model pricing for cost estimation +
// post-run cost accounting. All prices in USD per million tokens, cached
// from the Anthropic Models API as of 2026-06-02.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.7 (cost guards + estimated
// cost per analysis level).
//
// Cache pricing follows Anthropic's prefix-cache contract:
//   - 5-minute TTL writes cost 1.25× base input price
//   - cache hits cost ~0.1× base input price
//
// We don't bill output cache; output tokens always cost their base rate.

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
};

export type ModelPricing = {
  // USD per million tokens at the listed type.
  inputPerMillion: number;
  outputPerMillion: number;
  cacheWrite5mPerMillion: number;
  cacheReadPerMillion: number;
};

// Source of truth for cost math. Update when Anthropic ships a new model
// or changes pricing. Keep numeric literals — no env-var indirection so
// tests can audit the constants directly.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-opus-4-7': {
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheWrite5mPerMillion: 6.25,
    cacheReadPerMillion: 0.5,
  },
  'claude-opus-4-6': {
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheWrite5mPerMillion: 6.25,
    cacheReadPerMillion: 0.5,
  },
};

export function getPricingForModel(modelVersion: string): ModelPricing {
  const p = MODEL_PRICING[modelVersion];
  if (!p) {
    throw new Error(
      `Unknown modelVersion for pricing: ${modelVersion}. ` +
        `Known: ${Object.keys(MODEL_PRICING).join(', ')}`
    );
  }
  return p;
}

// Compute USD cost from a token-usage breakdown. Returns a plain Number
// in dollars; callers that need to persist to the DB convert to microdollars
// via toCostUsdMicros below.
export function calculateCostUsd(
  modelVersion: string,
  usage: TokenUsage
): number {
  const p = getPricingForModel(modelVersion);
  const inputCost = (usage.inputTokens * p.inputPerMillion) / 1_000_000;
  const outputCost = (usage.outputTokens * p.outputPerMillion) / 1_000_000;
  const cacheWriteCost =
    (usage.cacheCreationInputTokens * p.cacheWrite5mPerMillion) / 1_000_000;
  const cacheReadCost =
    (usage.cacheReadInputTokens * p.cacheReadPerMillion) / 1_000_000;
  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

// For pre-flight cost estimation we only have an estimated input-token
// count + an estimated output budget. No cache hits yet (first run), so
// estimate is conservative.
export function estimateCostUsd(
  modelVersion: string,
  estimatedInputTokens: number,
  estimatedOutputTokens: number
): number {
  return calculateCostUsd(modelVersion, {
    inputTokens: estimatedInputTokens,
    outputTokens: estimatedOutputTokens,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  });
}

// Convert a USD dollar amount to integer microdollars for ReviewAnalysis.costUsdMicros.
// Rounds half away from zero so two equal-sized halves don't both round down to 0.
export function toCostUsdMicros(usd: number): number {
  if (!Number.isFinite(usd) || usd < 0) {
    throw new Error(`Invalid USD amount for microdollar conversion: ${usd}`);
  }
  return Math.round(usd * 1_000_000);
}
