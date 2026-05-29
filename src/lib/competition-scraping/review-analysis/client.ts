// W#2 P-49 Workstream 5 — Anthropic SDK client seam for the AI review
// analysis system. The production path returns a singleton Anthropic
// client constructed from ANTHROPIC_API_KEY. Tests inject the
// AnthropicClientLike interface directly so no env var is required.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.7 (Opus 4.7 default + 4.6 selectable).

import type Anthropic from '@anthropic-ai/sdk';

// Model registry moved to the SDK-free ./models.ts module (so client
// components can import the list without bundling the Anthropic SDK).
// Re-exported here for back-compat: server callers that already import the
// model constants from `client.ts` keep working unchanged.
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.
export {
  DEFAULT_MODEL_VERSION,
  SUPPORTED_MODEL_VERSIONS,
  isSupportedModelVersion,
} from './models.ts';
export type { SupportedModelVersion } from './models.ts';

// Minimal surface the handler + token-counter exercise. Production wires
// a real `Anthropic` instance; tests pass a stub. Keeping the shape
// narrow lets us swap SDK versions without retyping every call-site.
export type AnthropicClientLike = {
  messages: Pick<Anthropic['messages'], 'create' | 'countTokens'>;
};

let cachedClient: Anthropic | null = null;

// Lazy singleton — only constructed in production paths where
// ANTHROPIC_API_KEY is set. Tests should NOT call this; they should
// inject AnthropicClientLike directly.
export async function getAnthropicClient(): Promise<Anthropic> {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY not set — review analysis cannot run without an API key'
    );
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}
