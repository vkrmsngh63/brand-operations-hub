// W#2 P-49 Workstream 5 — single source of truth for the review-analysis
// model menu. This module is intentionally SDK-FREE (no `@anthropic-ai/sdk`
// import) so the client-side summarize modals can import the supported-model
// list directly without pulling the Anthropic SDK into the browser bundle.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32
// (central model-selection registry + methodology). Any change to the
// supported-model list here must keep the registry doc + pricing.ts in sync.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.7 (Opus-only policy; Opus 4.7 default
// + 4.6 selectable; Opus 4.8 added 2026-05-31-b per ROADMAP P-52).

// Default model selection per §A.7 — Opus 4.7 remains the W#2 default. Opus 4.8
// is offered as the newest selectable option (default unchanged per P-52 picker).
export const DEFAULT_MODEL_VERSION = 'claude-opus-4-7';

// Newest first. Opus-only by §A.7 policy.
export const SUPPORTED_MODEL_VERSIONS = [
  'claude-opus-4-8',
  'claude-opus-4-7',
  'claude-opus-4-6',
] as const;

export type SupportedModelVersion = (typeof SUPPORTED_MODEL_VERSIONS)[number];

export function isSupportedModelVersion(
  v: string
): v is SupportedModelVersion {
  return (SUPPORTED_MODEL_VERSIONS as readonly string[]).includes(v);
}
