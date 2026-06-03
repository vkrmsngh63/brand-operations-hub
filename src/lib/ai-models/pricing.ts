// P-63 Phase 1 — platform-level AI-model pricing (the canonical home).
//
// MOVED here from `competition-scraping/review-analysis/pricing.ts` as part of
// the P-63 dependency inversion: the central ai-models registry is now the
// single source of pricing numbers + cost math for the WHOLE platform (W#1 +
// W#2). The old W#2 path is now a back-compat re-export shim, so every existing
// server caller + modal that imported pricing from there keeps working unchanged.
//
// All prices in USD per million tokens, cached from the Anthropic Models API
// as of 2026-06-02.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.
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
  // PLACEHOLDER PRICING (P-52, 2026-05-31-b): official Opus 4.8 per-MTok rates
  // were not available at rollout, so 4.8 is priced at the same Opus-tier rates
  // as 4.7/4.6 so cost estimates degrade gracefully. CONFIRM + replace with the
  // official numbers when the director supplies them (input / output /
  // cache-write-5m / cache-read per million tokens).
  'claude-opus-4-8': {
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheWrite5mPerMillion: 6.25,
    cacheReadPerMillion: 0.5,
  },
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
  // W#1 Keyword Clustering offers a wider menu than W#2's Opus-only list
  // (Sonnet 4.6 / Opus 4.5 / Haiku 4.5). Reconciled into this table in P-63
  // Phase 1 Deploy 3. The input/output rates mirror W#1's prior inline
  // AA_PRICING exactly (so its cost estimates are unchanged); W#1 reads only the
  // input/output rates, so the cache rates below — derived from the standard
  // prefix-cache contract (1.25× write / 0.1× read) — are informational today.
  'claude-sonnet-4-6': {
    inputPerMillion: 3,
    outputPerMillion: 15,
    cacheWrite5mPerMillion: 3.75,
    cacheReadPerMillion: 0.3,
  },
  'claude-opus-4-5': {
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheWrite5mPerMillion: 6.25,
    cacheReadPerMillion: 0.5,
  },
  'claude-haiku-4-5': {
    inputPerMillion: 1,
    outputPerMillion: 5,
    cacheWrite5mPerMillion: 1.25,
    cacheReadPerMillion: 0.1,
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
