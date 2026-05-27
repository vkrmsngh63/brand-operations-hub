// W#2 P-49 Workstream 5 — pre-flight token counting via the Anthropic
// Messages countTokens API.
//
// Used by:
//   - batch-sizer.ts — size each batch to fit a target token budget
//   - cost-cap.ts caller (review-analysis-run handler) — estimate cost
//     before any Claude call so we can refuse early if over cap
//
// Why the SDK and not a local tokenizer: tiktoken/char/4 heuristics are
// off by 10-30% for non-English text, code, or markdown — enough to blow
// through an 80%-context-fill target without warning. The countTokens
// endpoint is the same tokenizer the model uses; it's free; and one
// round-trip per batch is cheap relative to a full Claude call.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.8 (token-counter helper).

import type { AnthropicClientLike } from './client.ts';

// Match the Messages.countTokens request shape (subset we exercise).
export type CountTokensMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type CountTokensSystem =
  | string
  | ReadonlyArray<{ type: 'text'; text: string }>;

export type CountTokensInput = {
  client: AnthropicClientLike;
  model: string;
  system?: CountTokensSystem;
  messages: ReadonlyArray<CountTokensMessage>;
};

// Wraps client.messages.countTokens with our narrow interface so the
// batch-sizer doesn't need to import SDK types. Returns inputTokens
// only — outputTokens are unknown until the response streams.
export async function countMessageTokens({
  client,
  model,
  system,
  messages,
}: CountTokensInput): Promise<number> {
  const result = await client.messages.countTokens({
    model,
    system: system as Parameters<
      AnthropicClientLike['messages']['countTokens']
    >[0]['system'],
    messages: messages as Parameters<
      AnthropicClientLike['messages']['countTokens']
    >[0]['messages'],
  });
  return result.input_tokens;
}

// Local rough-cut estimate for hot loops where one countTokens call per
// candidate review is too slow. Charactes-per-token heuristic calibrated
// against Claude tokenization on mixed English review text (~3.6 chars
// per token); use ONLY for early-exit heuristics, never for final
// budgeting decisions — confirm the resulting batch with a real
// countMessageTokens call before sending.
export function approximateTokensFromString(s: string): number {
  // round up — overestimate is safer than under for budgeting.
  return Math.ceil(s.length / 3.6);
}
