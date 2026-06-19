/**
 * Variant B ("AI 2") — shared pipeline types.
 *
 * These are the in-memory shapes the intent→funnel pipeline passes between its
 * pure stages (carrier dedup → intent enumeration → labeling → conservative
 * merge → hierarchy/shells → ordering → placement → reorganization sweeps).
 *
 * IMPORTANT (addendum §1.4 / §9, M9): `CarrierCluster`, `IntentInstance` and the
 * provenance index are PIPELINE-INTERNAL browser state — they are NOT DB tables.
 * The finished `Topic` tree is materialized onto existing `CanvasNode` rows
 * (title→title, nesting→parentId, primary/secondary→kwPlacements, fingerprint→
 * intentFingerprint, plus the nullable zone/stage/verticalRank/siblingOrder/
 * isSpine/variantBMeta columns) via POST /api/projects/[id]/canvas/rebuild.
 *
 * Naming follows the in-repo convention (camelCase), not the spec's snake_case
 * (see operation-applier.ts: parentStableId, keywordPlacements, …).
 */

// ============================================================
// Input
// ============================================================

/** One row of the input spreadsheet (Column A = keyword, Column B = volume). */
export interface KeywordRow {
  id: string;
  keyword: string;
  volume: number;
}

// ============================================================
// Step 2 — Carrier dedup (rulebook §6, spec §3 Step 2)
// ============================================================

export interface CarrierMember {
  keyword: string;
  volume: number;
}

/**
 * A group of word-for-word-equivalent phrases folded into one carrier.
 * (spec §1.5 `CarrierCluster`)
 */
export interface CarrierCluster {
  id: string;
  /** Highest-volume member, used as the analysis representative. */
  representative: string;
  members: CarrierMember[];
  /** Sum of all member volumes (reach of the carrier). */
  summedVolume: number;
  /** The shared normalized key all members collapsed to (audit aid). */
  normalizedKey: string;
  /**
   * True when the cluster is degenerate and needs operator attention:
   * a blank input keyword, or a phrase that reduced to only the condition
   * term / stopwords. (spec §3 Step 2 "Errors": blank → flagged singleton.)
   */
  flagged?: boolean;
}

/** Tunables for carrier-dedup normalization, sourced from the CLR rulebook. */
export interface CarrierDedupConfig {
  /**
   * The project's condition/niche term to strip before keying
   * (rulebook §6). e.g. "bursitis". Multi-word terms are matched as a phrase.
   */
  conditionTerm?: string;
  /**
   * Closed ignorable stopword set. DEFAULT = {"for","the","a"} ONLY.
   * Never include prepositions (in/on/from/with/after) or qualifiers
   * (all/best/top/natural/home) — rulebook §6 / spec §3 Step 2.
   */
  ignorableStopwords?: string[];
  /**
   * Niche alias → canonical condition term (rulebook §6), e.g.
   * { "housemaid's knee": "prepatellar bursitis" }. Applied as a
   * phrase-level replacement before tokenization.
   */
  aliases?: Record<string, string>;
}

// ============================================================
// Step 3 — Intent enumeration (rulebook §1, spec §3 Step 3)
// ============================================================

/**
 * A filled descriptor profile for ONE intent (rulebook §1). Keys are descriptor
 * keys (see DESCRIPTORS in rulebook.ts); values come from each descriptor's
 * controlled vocabulary or are normalized free text for `valueMenu:'open'`.
 *
 * `summary` is the one reserved free-text meta descriptor — always present.
 * The other D-meta items (D1 search volume, D2 clarity, D3 confidence, D4
 * multiplicity) are NOT descriptors — they live on `IntentInstance` below
 * (rulebook §1 note / plan §8 P4) and persist in `CanvasNode.variantBMeta`.
 */
export interface DescriptorProfile {
  subject_type?: string;
  named_entity?: string;
  body_location?: string;
  approach?: string;
  onset_duration?: string;
  severity?: string;
  demographic_context?: string;
  trigger_context?: string;
  awareness_level?: string;
  primary_action?: string;
  concern_driver?: string;
  commercial_orientation?: string;
  /** reserved meta descriptor — always filled (rulebook §1). */
  summary: string;
}

/**
 * One enumerated intent behind a carrier cluster (spec §1.5). Pipeline-internal
 * browser state — NOT a DB table. High-recall enumeration: a single keyword may
 * fan out to several IntentInstances (multiplicity); over-enumeration is kept and
 * pruned downstream, never auto-deleted (plan locked-resolution #2).
 */
export interface IntentInstance {
  id: string;
  /** the carrier cluster this intent was enumerated from. */
  carrierId: string;
  /** the carrier's representative keyword (provenance/debug). */
  sourceKeyword: string;
  profile: DescriptorProfile;
  /** D1 — reachable volume attributed to this intent (full carrier reach; a
   *  keyword in N intents contributes its volume to each — `volume_full`). */
  searchVolume: number;
  /** D2 — how clearly the keyword expressed this intent (0..1), if scored. */
  clarity?: number;
  /** D3 — model confidence in this enumeration (0..1), if scored. */
  confidence?: number;
  /** D4 — multiplicity: how many intents this keyword fanned out to. */
  multiplicity: number;
}
