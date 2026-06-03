// P-63 Phase 1 — platform-level review-analysis model menu (the canonical home).
//
// MOVED here from `competition-scraping/review-analysis/models.ts` as part of
// the P-63 dependency inversion: the central ai-models registry now owns this
// list. The old W#2 path is now a back-compat re-export shim, so the 6 W#2
// modals + the run-batch validator that import these constants keep working
// unchanged.
//
// This module is intentionally SDK-FREE (no `@anthropic-ai/sdk` import) so the
// client-side summarize modals can import the supported-model list directly
// without pulling the Anthropic SDK into the browser bundle.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.
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
