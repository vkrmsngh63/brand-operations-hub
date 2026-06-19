/**
 * Variant B — Universal-layer rulebook, encoded from `rulebook-v0.2.md`.
 *
 * This is the niche-agnostic CLR (Central Reference) as typed code constants. It
 * is the universal DEFAULT layer with TWO consumers:
 *   1. The DB seed (Step 1): each constant below becomes a `scope="universal"`
 *      `CLREntry` row. The seed is idempotent and keyed off these natural keys.
 *   2. The assembler (`rulebook-assembly.ts`, Step 1): it UNIONs this universal
 *      layer with the DB's active + approved-candidate `niche:<slug>` entries
 *      into the effective `AssembledRulebook`. The pure pipeline libs and the
 *      prompt-builders receive that assembled object as a PARAMETER — they do
 *      NOT import these constants directly for niche-aware logic, so DB niche
 *      aliases/ladders/placement edge-rules reach the pipeline at runtime
 *      ("applier wins", HANDOFF_PROTOCOL Rule 3).
 *
 * Niche layers (entities, ladders, aliases, niche placement rules) are produced
 * by the automated diagnostic (§9) and stored as `scope="niche:<slug>"` rows —
 * NOT here. This file is the universal floor only. Editable; bump RULEBOOK_VERSION
 * when the universal layer changes.
 *
 * Pure data + helpers. No DB, no AI, no React.
 */

export const RULEBOOK_VERSION = 2; // rulebook-v0.2

// ============================================================
// §1 Descriptor schema (notes filled per possible intent)
//
// NOTE: the rulebook's D-meta items D1 Search Volume, D2 Clarity, D3 Confidence,
// and D4 Multiplicity are NOT descriptor menu entries — they are fields on the
// IntentInstance/Topic object (see types.ts) and persist in CanvasNode.variantBMeta.
// Volume drives sibling ordering (§10); multiplicity is the per-keyword intent
// count from enumeration. Only the reserved free-text `summary` lives here as a
// meta descriptor (always present, always filled).
// ============================================================

export type DescriptorGroup = 'subject' | 'situation' | 'action' | 'meta';

export interface DescriptorDef {
  /** stable machine key, e.g. "subject_type" (spec §1.2). */
  key: string;
  name: string;
  group: DescriptorGroup;
  /** controlled vocabulary, or 'open' for normalized free text. */
  valueMenu: string[] | 'open';
  /** has a general→specific ladder authored per niche (rulebook §4). */
  laddered: boolean;
}

export const DESCRIPTORS: readonly DescriptorDef[] = [
  // A — Subject
  {
    key: 'subject_type',
    name: 'Subject Type',
    group: 'subject',
    laddered: false,
    valueMenu: [
      'definition', 'symptom', 'cause/trigger', 'risk-factor', 'diagnosis/test',
      'prognosis', 'treatment', 'product', 'comparison', 'cost', 'provider',
      'usage/administration', 'safety/side-effects', 'lifestyle/self-care',
      'comorbidity', 'anatomy', 'prevalence',
    ],
  },
  { key: 'named_entity', name: 'Named Entity', group: 'subject', laddered: true, valueMenu: 'open' },
  { key: 'body_location', name: 'Body Location', group: 'subject', laddered: true, valueMenu: 'open' },
  {
    key: 'approach', name: 'Approach', group: 'subject', laddered: false,
    valueMenu: ['natural', 'dietary/supplement', 'pharmacological', 'device', 'surgical', 'physical/exercise', 'behavioral'],
  },
  // B — Situation
  { key: 'onset_duration', name: 'Onset/Duration', group: 'situation', laddered: false, valueMenu: ['acute', 'chronic', 'recurrent', 'post-event'] },
  { key: 'severity', name: 'Severity', group: 'situation', laddered: false, valueMenu: ['mild', 'moderate', 'severe', 'persistent', 'emergency-flag'] },
  { key: 'demographic_context', name: 'Demographic/Context', group: 'situation', laddered: false, valueMenu: 'open' },
  { key: 'trigger_context', name: 'Trigger/Context', group: 'situation', laddered: false, valueMenu: 'open' },
  {
    key: 'awareness_level', name: 'Awareness Level', group: 'situation', laddered: false,
    valueMenu: ['unaware', 'problem-aware', 'solution-aware', 'product-aware', 'most-aware'],
  },
  // C — Action/Relationship
  {
    key: 'primary_action', name: 'Primary Action', group: 'action', laddered: false,
    valueMenu: [
      'define/learn', 'identify-symptom', 'find-cause', 'assess-risk', 'get-diagnosis',
      'learn-prognosis', 'find-treatment', 'compare-options', 'evaluate-specific-product',
      'find-where-to-buy', 'learn-usage/dosage', 'check-safety/side-effects',
      'seek-reassurance', 'find-support', 'manage/cope',
    ],
  },
  {
    key: 'concern_driver', name: 'Concern/Driver', group: 'action', laddered: false,
    valueMenu: [
      'is-it-serious', 'is-it-normal', 'will-it-last', 'how-long-to-heal', 'will-it-recur',
      'is-it-curable', 'will-it-work', 'is-it-safe', 'how-much-cost', 'how-fast', 'why-me',
    ],
  },
  { key: 'commercial_orientation', name: 'Commercial Orientation', group: 'action', laddered: false, valueMenu: ['informational', 'commercial-investigation', 'transactional'] },
  // D — Meta (only the reserved free-text summary; D1–D4 live on the object — see header note)
  { key: 'summary', name: 'Summary', group: 'meta', laddered: false, valueMenu: 'open' },
] as const;

// ============================================================
// §2 Zones (macro vertical order) + §3 Stages (meso vertical order)
// ============================================================

export interface ZoneDef {
  key: string;
  name: string;
  /** 1-based macro journey rank (rulebook §2). */
  rank: number;
  /** ordered stage keys within this zone (rulebook §3 = stage rank). */
  stages: string[];
}

export const ZONES: readonly ZoneDef[] = [
  { key: 'awareness', name: 'Awareness', rank: 1, stages: ['general-noticing'] },
  {
    key: 'problem-exploration', name: 'Problem Exploration', rank: 2,
    stages: ['symptom-identification', 'seriousness', 'normalization', 'by-location/variants', 'recovery-expectation'],
  },
  {
    key: 'cause-diagnosis', name: 'Cause & Diagnosis', rank: 3,
    stages: ['cause-understanding', 'risk/causation', 'differential', 'test/validation'],
  },
  {
    key: 'solution-research', name: 'Solution Research', rank: 4,
    stages: ['treatment-discovery', 'mechanism', 'modality-comparison'],
  },
  {
    key: 'evaluation', name: 'Evaluation', rank: 5,
    stages: ['option-vs-option', 'specific-product-assessment', 'efficacy/reviews'],
  },
  {
    key: 'decision-purchase', name: 'Decision & Purchase', rank: 6,
    stages: ['brand-choice', 'price', 'where-to-buy'],
  },
  {
    key: 'post-purchase', name: 'Post-Purchase', rank: 7,
    stages: ['usage/dosage', 'side-effects/safety', 'recovery-timeline', 'recurrence-prevention'],
  },
] as const;

/** Generic fallback stage per zone for misfit taxonomy #3 (zone clear, no stage). */
export function genericStageForZone(zoneKey: string): string | null {
  const z = ZONES.find((zz) => zz.key === zoneKey);
  return z ? z.stages[0] : null;
}

/** rulebook §10: verticalRank = zone rank then stage rank, as one sortable float. */
export function verticalRank(zoneKey: string, stageKey: string | null): number | null {
  const z = ZONES.find((zz) => zz.key === zoneKey);
  if (!z) return null;
  const sIdx = stageKey ? z.stages.indexOf(stageKey) : -1;
  // unknown/null stage sorts to the FRONT of the zone — correct for zone-level
  // parent/spine shells, which should head their zone. Genuine misfit #3 topics
  // (zone known, no stage) are assigned the generic stage in placement.ts, so
  // only true parents ride this null-stage path.
  const stageRank = sIdx >= 0 ? sIdx + 1 : 0;
  return z.rank + stageRank / 100;
}

// ============================================================
// §5 Placement rules (intent profile → zone/stage; first match wins)
// ============================================================

export type PlacementOp = 'eq' | 'in' | 'cue';

export interface PlacementCondition {
  /** descriptor key, or 'phrase' for a literal cue match against the title/keyword. */
  descriptorKey: string;
  op: PlacementOp;
  value: string | string[];
}

export interface PlacementRule {
  id: string; // R1..R11 (+ split variants R9C, R10S)
  /** ascending priority — lower evaluated first; first match assigns zone+stage. */
  priority: number;
  /** AND of conditions; a rule with `any` matches if ANY of its groups match. */
  all?: PlacementCondition[];
  any?: PlacementCondition[][];
  zone: string;
  stage: string;
  /** secondary "also-relevant-in" affinity (rulebook §5 R11, misfit #2). */
  secondaryAffinity?: { zone: string; stage: string };
  note?: string;
}

/**
 * Placement rules from rulebook §5. Priority encodes the §5 precedence:
 * explicit usage/safety + purchase cues (R10/R10S, R9/R9C) > product-comparison
 * (R7, incl. best/top) > generic treatment (R6); otherwise Action (C1) > Subject (A1).
 *
 * Bare "vs"/"or"/"which" is intentionally NOT a placement cue (it shadowed the
 * descriptor rules and mis-routed condition differentials). Disambiguation is
 * descriptor-driven: enumeration labels condition-vs-condition as
 * subject_type=diagnosis/test (→ R3) and product/treatment comparison as
 * subject_type=comparison (→ R7). An ambiguous comparison whose descriptors
 * don't disambiguate matches neither rule → needs-placement queue (no default).
 */
export const PLACEMENT_RULES: readonly PlacementRule[] = [
  // --- Post-Purchase usage/safety (split by stage; highest precedence) ---
  { id: 'R10', priority: 10, zone: 'post-purchase', stage: 'usage/dosage',
    all: [{ descriptorKey: 'primary_action', op: 'eq', value: 'learn-usage/dosage' }],
    note: 'usage/dosage → Post-Purchase (usage/dosage stage), regardless of entity' },
  { id: 'R10S', priority: 12, zone: 'post-purchase', stage: 'side-effects/safety',
    all: [{ descriptorKey: 'primary_action', op: 'eq', value: 'check-safety/side-effects' }],
    note: 'safety/side-effects → Post-Purchase (side-effects/safety stage), regardless of entity' },
  // --- Decision & Purchase (split where-to-buy vs price) ---
  { id: 'R9', priority: 20, zone: 'decision-purchase', stage: 'where-to-buy',
    any: [
      [{ descriptorKey: 'primary_action', op: 'eq', value: 'find-where-to-buy' }],
      [{ descriptorKey: 'commercial_orientation', op: 'eq', value: 'transactional' }],
    ] },
  { id: 'R9C', priority: 22, zone: 'decision-purchase', stage: 'price',
    all: [{ descriptorKey: 'subject_type', op: 'eq', value: 'cost' }],
    note: 'cost → Decision & Purchase (price stage)' },
  // --- Evaluation: product/treatment comparison ONLY (descriptor-driven, no bare 'vs') ---
  { id: 'R8', priority: 30, zone: 'evaluation', stage: 'specific-product-assessment',
    all: [{ descriptorKey: 'primary_action', op: 'eq', value: 'evaluate-specific-product' }] },
  { id: 'R7', priority: 40, zone: 'evaluation', stage: 'option-vs-option',
    any: [
      [{ descriptorKey: 'primary_action', op: 'eq', value: 'compare-options' }],
      [{ descriptorKey: 'subject_type', op: 'in', value: ['comparison', 'product'] }],
      [{ descriptorKey: 'awareness_level', op: 'eq', value: 'product-aware' }],
      [{ descriptorKey: 'phrase', op: 'cue', value: ['best', 'top'] }],
    ],
    note: 'product/treatment comparison. Bare "vs"/"or"/"which" is NOT a cue here — condition-vs-condition is labeled diagnosis/test at enumeration (→ R3); ambiguous → needs-placement' },
  // --- Cause & Diagnosis: condition/diagnosis signals (descriptor-driven) ---
  { id: 'R3', priority: 50, zone: 'cause-diagnosis', stage: 'differential',
    any: [
      [{ descriptorKey: 'primary_action', op: 'eq', value: 'get-diagnosis' }],
      [{ descriptorKey: 'subject_type', op: 'eq', value: 'diagnosis/test' }],
    ],
    note: 'differential / condition-vs-related-condition. Enumeration labels condition-vs-condition queries subject_type=diagnosis/test so they land here, not Evaluation' },
  { id: 'R2', priority: 60, zone: 'cause-diagnosis', stage: 'cause-understanding',
    any: [
      [{ descriptorKey: 'primary_action', op: 'eq', value: 'find-cause' }],
      [{ descriptorKey: 'subject_type', op: 'eq', value: 'cause/trigger' }],
    ] },
  { id: 'R4', priority: 70, zone: 'cause-diagnosis', stage: 'risk/causation',
    any: [
      [{ descriptorKey: 'subject_type', op: 'eq', value: 'risk-factor' }],
      [
        { descriptorKey: 'primary_action', op: 'eq', value: 'assess-risk' },
        { descriptorKey: 'concern_driver', op: 'in', value: ['is-it-serious', 'will-it-recur'] },
      ],
    ] },
  { id: 'R5', priority: 80, zone: 'problem-exploration', stage: 'normalization',
    any: [
      [{ descriptorKey: 'primary_action', op: 'eq', value: 'seek-reassurance' }],
      [
        { descriptorKey: 'subject_type', op: 'eq', value: 'symptom' },
        { descriptorKey: 'concern_driver', op: 'in', value: ['is-it-normal', 'is-it-serious'] },
      ],
    ] },
  { id: 'R1', priority: 90, zone: 'problem-exploration', stage: 'symptom-identification',
    all: [
      { descriptorKey: 'subject_type', op: 'eq', value: 'symptom' },
      { descriptorKey: 'primary_action', op: 'in', value: ['identify-symptom', 'define/learn'] },
    ] },
  { id: 'R11', priority: 100, zone: 'problem-exploration', stage: 'recovery-expectation',
    all: [{ descriptorKey: 'concern_driver', op: 'in', value: ['how-long-to-heal', 'will-it-recur'] }],
    secondaryAffinity: { zone: 'post-purchase', stage: 'recovery-timeline' },
    note: 'resolves Q-RB-A: surfaces early to build trust; cross-referenced to Post-Purchase' },
  { id: 'R6', priority: 110, zone: 'solution-research', stage: 'treatment-discovery',
    all: [{ descriptorKey: 'primary_action', op: 'eq', value: 'find-treatment' }],
    note: 'generic treatment, no comparison cue (lowest priority of the action rules)' },
] as const;

/**
 * Known universal-layer placement GAPS (intended). These subject types have no
 * universal rule and fall to the needs-placement queue (misfit taxonomy #1,
 * rule-gap) until a niche/lessons rule adds coverage:
 *   definition, prognosis, provider, lifestyle/self-care, comorbidity, anatomy,
 *   prevalence.
 * The `awareness` zone (general-noticing) is likewise reached via niche rules.
 */
export const UNPLACED_UNIVERSAL_SUBJECT_TYPES: readonly string[] = [
  'definition', 'prognosis', 'provider', 'lifestyle/self-care',
  'comorbidity', 'anatomy', 'prevalence',
] as const;

// ============================================================
// §6 Ignorable set, §8 merge policy, §10 natural-sequence hints
// ============================================================

/** rulebook §6: closed default ignorable stopwords. */
export const IGNORABLE_STOPWORDS: readonly string[] = ['for', 'the', 'a'];

/** rulebook §8: merge only on identical normalized profiles. */
export const MERGE_POLICY = 'exact-profile-match' as const;

/**
 * rulebook §10: ordered natural-sequence hints. When a sibling group matches a
 * hint's axis, siblings order by this sequence (sequence beats volume); else by
 * descending volume. Niche layers may add more (merged in via the assembler).
 */
export interface NaturalSequenceHint {
  /** descriptor axis the sequence applies to. */
  descriptorKey: string;
  /** ordered values, general/lightest → specific/heaviest. */
  sequence: string[];
}

export const NATURAL_SEQUENCE_HINTS: readonly NaturalSequenceHint[] = [
  // treatment options: conservative → aggressive
  { descriptorKey: 'approach', sequence: ['behavioral', 'physical/exercise', 'natural', 'dietary/supplement', 'device', 'pharmacological', 'surgical'] },
  // severity: mild → severe
  { descriptorKey: 'severity', sequence: ['mild', 'moderate', 'severe', 'persistent', 'emergency-flag'] },
] as const;

// ============================================================
// Lookups + invariants
// ============================================================

export function getZone(zoneKey: string): ZoneDef | undefined {
  return ZONES.find((z) => z.key === zoneKey);
}

export function getDescriptor(key: string): DescriptorDef | undefined {
  return DESCRIPTORS.find((d) => d.key === key);
}

/** Placement rules sorted by ascending priority (evaluation order). */
export function placementRulesByPriority(): PlacementRule[] {
  return [...PLACEMENT_RULES].sort((a, b) => a.priority - b.priority);
}
