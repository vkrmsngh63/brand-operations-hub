/**
 * Variant B ("AI 2") — Step 3: the run engine (PURE orchestration core).
 *
 * This is the deterministic, framework-free heart of the client run-loop. It
 * does NOT touch React, the network, localStorage, or the clock — those live in
 * the overlay component (`components/variant-b/VariantBAutoAnalyze.tsx`), which
 * injects the AI calls and drives this engine. Keeping the pipeline wiring pure
 * lets it be `node --test`-covered like the rest of the Variant B engine.
 *
 * Two responsibilities:
 *   1. `carrierToCandidates` — parse ONE carrier's intent-enumeration response
 *      (the only AI step) into candidate topics. The per-call payload is FLAT by
 *      construction: the prompt only ever carries one carrier + the rulebook
 *      descriptor menu — never the accumulating tree (plan §6 non-negotiable #5).
 *   2. `foldIntentsToTree` — fold the accumulated intents into the funnel tree by
 *      running the pure pipeline in order: conservative-merge → hierarchy →
 *      order(horizontal) → placement → order(vertical) → reorg-sweep → provenance.
 *      Deterministic over the full intent set, so the component can re-fold after
 *      every batch (a cheap, local, AI-free pass) and the result converges.
 *
 * The reorg-sweep cadence is honored by the component via `planSweeps`; the
 * final guaranteed sweep is the default here (`runSweep: true`).
 */

import type { CarrierCluster, IntentInstance } from './types.ts';
import type { AssembledRulebook } from './rulebook-assembly.ts';
import {
  parseIntentEnumeration,
  type IntentFlag,
} from './intent-enumeration.ts';
import { labelIntent } from './topic-labeling.ts';
import {
  candidateTopic,
  conservativeMerge,
  type Topic,
} from './conservative-merge.ts';
import { buildHierarchy } from './hierarchy.ts';
import { orderSiblings, applyVerticalRanks } from './ordering.ts';
import { placeTopics, type PlacementOutcome } from './placement.ts';
import { buildProvenance, type ProvenanceIndex } from './provenance.ts';
import {
  planSweeps,
  runMechanicalSweep,
  type ReorgFlag,
  type ReorgOptions,
} from './reorg-sweeps.ts';

export { planSweeps };
export type { Topic, PlacementOutcome, ReorgFlag };

// ============================================================
// Step 3a — one carrier's enumeration response → candidate topics
// ============================================================

export interface CarrierCandidates {
  /** the enumerated intents parsed from the model response. */
  intents: IntentInstance[];
  /** single-member candidate topics (one per intent), ready for the fold. */
  candidates: Topic[];
  /** validator signals (under-enumeration, fabrication, bad JSON). Never auto-
   *  deletes — these surface for review per locked resolution #2. */
  flags: IntentFlag[];
  /** false when the response could not be parsed into a valid intent set. */
  ok: boolean;
}

/**
 * Parse one carrier's raw intent-enumeration response into candidate topics.
 * Pure: the AI call itself is made by the component and its text passed in here.
 */
export function carrierToCandidates(
  raw: string,
  carrier: CarrierCluster,
  rb: AssembledRulebook,
): CarrierCandidates {
  const parsed = parseIntentEnumeration(raw, carrier, rb);
  const candidates = parsed.intents.map((intent) =>
    candidateTopic(intent, labelIntent(intent, rb)),
  );
  return {
    intents: parsed.intents,
    candidates,
    flags: parsed.flags,
    ok: parsed.ok,
  };
}

// ============================================================
// Step 3b — accumulated intents → the funnel tree
// ============================================================

export interface FunnelStats {
  /** total tight topics in the tree (incl. generated shells). */
  topicCount: number;
  /** topics that are demand-aware grouping shells. */
  shellCount: number;
  /** root-level topics. */
  rootCount: number;
  /** deepest nesting level reached (0 = a lone root). */
  maxDepth: number;
  /** topics with a resolved zone/stage. */
  placedCount: number;
  /** topics routed to the needs-placement queue (never guessed — D-MISFIT). */
  unplacedCount: number;
  /** how many topics sit in each funnel zone (placed topics only). */
  topicsPerZone: Record<string, number>;
  /** keywords that legitimately appear in more than one topic. */
  multiTopicKeywordCount: number;
  /** Σ per-topic reach volume (double-counts keywords shared across topics). */
  totalReachVolume: number;
  /** niche-deduped total demand volume (each keyword counted once). */
  dedupVolume: number;
}

export interface AssembledFunnel {
  /** the complete funnel tree (flat list; structure via parentId/children). */
  topics: Topic[];
  /** ids of the root-level topics, in order. */
  rootIds: string[];
  /** placement misfits queued for operator review (D-MISFIT). */
  needsPlacement: PlacementOutcome[];
  /** reorg-sweep judgment-call flags queued for operator review. */
  needsReview: ReorgFlag[];
  /** keyword/topic traceability index. */
  provenance: ProvenanceIndex;
  /** headline metrics for the activity panel + the A/B comparison view (Step 6). */
  stats: FunnelStats;
}

export interface FoldOptions {
  /** run the mechanical reorg sweep at the end of this fold. Default true (the
   *  guaranteed final sweep). The component passes false on non-cadence batches. */
  runSweep?: boolean;
  /** reorg-sweep tuning forwarded to runMechanicalSweep. */
  reorg?: ReorgOptions;
}

/**
 * Fold the accumulated enumerated intents into the funnel tree. Deterministic
 * and AI-free; safe to call after every batch and again at the end.
 */
export function foldIntentsToTree(
  intents: IntentInstance[],
  rb: AssembledRulebook,
  opts: FoldOptions = {},
): AssembledFunnel {
  const runSweep = opts.runSweep !== false;

  // Step 4/5: label each intent and fold identical profiles into tight topics.
  const candidates = intents.map((intent) =>
    candidateTopic(intent, labelIntent(intent, rb)),
  );
  const merged = conservativeMerge(candidates, rb);

  // Step 6: seat the tight topics in the tree (+ demand-aware shells).
  const hier = buildHierarchy(merged.topics, merged.nestCandidates, rb);

  // §10 horizontal order (siblings), then placement, then §10 vertical order.
  let topics = orderSiblings(hier.topics, rb);
  const placed = placeTopics(topics, rb);
  topics = applyVerticalRanks(placed.topics, rb);

  // §11 mechanical reorg sweep (prune dead shells, re-rank, flag judgment calls).
  let needsReview: ReorgFlag[] = [];
  if (runSweep) {
    const swept = runMechanicalSweep(topics, rb, opts.reorg ?? {});
    topics = swept.topics;
    needsReview = swept.report.flags;
  }

  const provenance = buildProvenance(topics);
  const rootIds = topics
    .filter((t) => t.parentId == null)
    .map((t) => t.id);

  return {
    topics,
    rootIds,
    needsPlacement: placed.needsPlacement,
    needsReview,
    provenance,
    stats: computeFunnelStats(topics, placed.needsPlacement, provenance),
  };
}

/** Headline metrics for the activity panel and the Step-6 A/B comparison view. */
export function computeFunnelStats(
  topics: Topic[],
  needsPlacement: PlacementOutcome[],
  provenance: ProvenanceIndex,
): FunnelStats {
  let shellCount = 0;
  let rootCount = 0;
  let maxDepth = 0;
  let placedCount = 0;
  let totalReachVolume = 0;
  const topicsPerZone: Record<string, number> = {};

  for (const t of topics) {
    if (t.isShell) shellCount += 1;
    if (t.parentId == null) rootCount += 1;
    if (typeof t.depth === 'number' && t.depth > maxDepth) maxDepth = t.depth;
    totalReachVolume += t.volumeFull || 0;
    if (t.zone) {
      placedCount += 1;
      topicsPerZone[t.zone] = (topicsPerZone[t.zone] ?? 0) + 1;
    }
  }

  let multiTopicKeywordCount = 0;
  for (const entries of Object.values(provenance.byKeyword)) {
    const distinctTopics = new Set(entries.map((e) => e.topicId));
    if (distinctTopics.size > 1) multiTopicKeywordCount += 1;
  }

  return {
    topicCount: topics.length,
    shellCount,
    rootCount,
    maxDepth,
    placedCount,
    unplacedCount: needsPlacement.length,
    topicsPerZone,
    multiTopicKeywordCount,
    totalReachVolume,
    dedupVolume: provenance.nicheDedupTotalVolume,
  };
}

// ============================================================
// Carrier batching (progress + checkpoint granularity)
// ============================================================

export const DEFAULT_BATCH_SIZE = 12;
export const DEFAULT_CONCURRENCY = 6;

/**
 * Split the deduped carrier clusters into fixed-size batches. The batch is the
 * unit of progress, checkpointing, and the sweep cadence — NOT a unit that grows
 * the AI payload (each carrier is still enumerated by its own flat call).
 */
export function buildCarrierBatches(
  carriers: CarrierCluster[],
  batchSize: number = DEFAULT_BATCH_SIZE,
): CarrierCluster[][] {
  const size = batchSize > 0 ? Math.floor(batchSize) : DEFAULT_BATCH_SIZE;
  const batches: CarrierCluster[][] = [];
  for (let i = 0; i < carriers.length; i += size) {
    batches.push(carriers.slice(i, i + size));
  }
  return batches;
}
