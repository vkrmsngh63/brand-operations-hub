// W#2 review-analysis model menu — BACK-COMPAT RE-EXPORT SHIM (P-63 Phase 1).
//
// The canonical declarations MOVED to the platform-level central registry at
// `src/lib/ai-models/models.ts` as part of the P-63 dependency inversion. This
// file now simply re-exports them so every existing importer of this path (the
// 6 W#2 modals, client.ts, the run-batch validator, models.test.ts) keeps
// working unchanged. Do NOT add new declarations here — edit the canonical
// `ai-models/models.ts` instead.
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.

export {
  DEFAULT_MODEL_VERSION,
  SUPPORTED_MODEL_VERSIONS,
  isSupportedModelVersion,
} from '../../ai-models/models.ts';
export type { SupportedModelVersion } from '../../ai-models/models.ts';
