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
