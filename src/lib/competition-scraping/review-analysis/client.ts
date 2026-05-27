// W#2 P-49 Workstream 5 — Anthropic SDK client seam for the AI review
// analysis system. The production path returns a singleton Anthropic
// client constructed from ANTHROPIC_API_KEY. Tests inject the
// AnthropicClientLike interface directly so no env var is required.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.7 (Opus 4.7 default + 4.6 selectable).

import type Anthropic from '@anthropic-ai/sdk';

// Default model selection per §A.7 — Opus 4.7 is the current flagship.
// Opus 4.6 is the selectable alternative (the W2 model-version dropdown
// will surface both per §A.7 cascade impact).
export const DEFAULT_MODEL_VERSION = 'claude-opus-4-7';
export const SUPPORTED_MODEL_VERSIONS = [
  'claude-opus-4-7',
  'claude-opus-4-6',
] as const;
export type SupportedModelVersion = (typeof SUPPORTED_MODEL_VERSIONS)[number];

export function isSupportedModelVersion(
  v: string
): v is SupportedModelVersion {
  return (SUPPORTED_MODEL_VERSIONS as readonly string[]).includes(v);
}

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
