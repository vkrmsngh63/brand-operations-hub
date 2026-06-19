/**
 * Variant B ("AI 2") — Step 5: tight-topic formation (conservative merge).
 *
 * Pure + deterministic. No AI, no DB, no React. Takes the candidate topics from
 * Step 4 (one per enumerated intent) and folds together ONLY those whose
 * canonical descriptor profiles are IDENTICAL. Anything short of identical is
 * kept separate; where one profile strictly contains another it is emitted as a
 * NEST candidate (the general topic is the parent, the specific one the child)
 * for Step 6 to seat — never merged away here.
 *
 * Non-negotiables this lib honors (plan §6 / spec §3 Step 5 / addendum §1.6):
 *   - Merge IFF canonical profiles are identical (the conservative floor). We
 *     never merge on mere containment or similarity.
 *   - Containment ⇒ nest candidate, never a merge.
 *   - Candidate generation is cheap: bucket by fingerprint for merges, and use a
 *     shared-axis (normalized-token-overlap) neighborhood for nest detection.
 *     NEVER all-pairs, and NEVER vector embeddings.
 *   - The merge policy is read from the ASSEMBLED rulebook parameter
 *     (`rb.mergePolicy`), not from a hard-coded constant — so a niche layer can
 *     supersede it later. The only policy that ever LOOSENS exact-match merging
 *     is one we explicitly implement; anything unrecognized falls back to the
 *     conservative exact-profile-match floor (we never merge looser than specced).
 *
 * Determinism: members are recomputed-fingerprinted from their own profile and
 * re-bucketed on that, so the function is idempotent and self-purifying — a
 * member whose profile disagrees with its source topic's claimed fingerprint is
 * automatically routed to the bucket its profile actually belongs to (the spec's
 * "split on any divergence" purity check, achieved by construction).
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { DescriptorProfile, IntentInstance } from './types.ts';
import type { SpecificityMarker, TopicLabel } from './topic-labeling.ts';
import { computeFingerprint, labelIntent } from './topic-labeling.ts';

// ============================================================
// Types (the Topic tree shape, produced here and consumed by Step 6+)
// ============================================================

/**
 * A topic in the funnel tree. Step 4 emits one candidate Topic per intent
 * (single `memberInstances`); Step 5 folds identical-profile candidates into
 * tight topics with ≥1 member. The structural fields (parentId, children,
 * siblingOrder, depth, isSpine, zone, stage, verticalRank, inheritedKeywords)
 * are populated by later steps and are intentionally optional here.
 */
export interface Topic {
  /** stable id; merged topics use `t:<fingerprint>` so re-runs are idempotent. */
  id: string;
  /** deterministic canonical signature (the merge-bucket key). */
  fingerprint: string;
  /** searcher-centric neutral title. */
  title: string;
  /** normalized profile shared by every member (the merge equality basis). */
  canonicalProfile: DescriptorProfile;
  specificityMarkers: SpecificityMarker[];
  boundary: { belongs: string[]; excludes: string[] };
  /** PRIMARY sources of this topic; ≥1, sorted by descending volume then id. */
  memberInstances: IntentInstance[];
  /** unique representative keywords of the members (PRIMARY keywords). */
  primaryKeywords: string[];
  /** reach: sum of the members' full volume (`volume_full`). Per-topic only;
   *  niche-deduped totals are computed later in provenance.ts. */
  volumeFull: number;

  // --- tree-structure fields, populated by hierarchy.ts (Step 6). Optional here
  //     because Step 4/5 emit a flat candidate set with no tree yet. ---
  /** the seated tree parent (nearest containment/specialization parent), or null at a root. */
  parentId?: string | null;
  /** ordered child ids (by siblingOrder). */
  children?: string[];
  /** position among siblings (0-based). */
  siblingOrder?: number;
  /** distance from the tree root (0 = root). */
  depth?: number;
  /** true for structural grouping/parent nodes (the funnel spine). */
  isSpine?: boolean;
  /** true for generated grouping shells (a ladder-rung level; may be empty). */
  isShell?: boolean;
  /** SECONDARY keywords: primaries of every topic that specializes this one. */
  inheritedKeywords?: string[];

  // --- funnel placement, populated by placement.ts (Step 7) + ordering.ts (§10). ---
  /** assigned funnel zone key, or null when unplaced (needs-placement queue). */
  zone?: string | null;
  /** assigned stage key within the zone, or null. */
  stage?: string | null;
  /** journey order: zone rank then stage rank (§10). null until placed. */
  funnelVerticalRank?: number | null;
  /** §5 R11 "also-relevant-in" cross-reference, when the matched rule sets one. */
  secondaryAffinity?: { zone: string; stage: string } | null;
}

/**
 * A pairwise strict-containment edge for Step 6 to seat. `parentId` is the more
 * GENERAL topic (its profile axes are a strict subset of the child's);
 * `childId` is the more SPECIFIC topic. Step 5 emits every direct containment
 * edge found in a shared-axis neighborhood; Step 6 resolves the actual tree
 * (nearest parent, transitive reduction).
 */
export interface NestCandidate {
  parentId: string;
  childId: string;
}

export interface MergeStats {
  /** total candidate member instances seen (after exploding multi-member input). */
  inputInstances: number;
  /** tight topics produced. */
  outputTopics: number;
  /** buckets that folded more than one member (actual merges performed). */
  mergedGroups: number;
  /** nest-candidate edges emitted. */
  nestCandidates: number;
  /** the merge policy actually applied (echoed from the assembled rulebook). */
  mergePolicy: string;
  /** true when `rb.mergePolicy` was not a recognized policy and we fell back to
   *  the conservative exact-profile-match floor. */
  policyFallback: boolean;
}

export interface MergeResult {
  topics: Topic[];
  nestCandidates: NestCandidate[];
  stats: MergeStats;
}

// ============================================================
// Candidate-topic builder (Step 4 → Step 5 input)
// ============================================================

/**
 * Build a single-member candidate Topic from an enumerated intent + its Step-4
 * label. This is the normal Step-5 input shape; downstream and tests use it to
 * assemble the candidate array.
 */
export function candidateTopic(instance: IntentInstance, label: TopicLabel): Topic {
  return {
    id: instance.id,
    fingerprint: label.fingerprint,
    title: label.title,
    canonicalProfile: label.canonicalProfile,
    specificityMarkers: label.specificityMarkers,
    boundary: label.boundary,
    memberInstances: [instance],
    primaryKeywords: uniqueStable([instance.sourceKeyword]),
    volumeFull: instance.searchVolume,
  };
}

// ============================================================
// Merge policy
// ============================================================

/** The only universally-shipped policy (rulebook §8 default). */
const EXACT_MATCH = 'exact-profile-match';

/**
 * Resolve the merge behavior from the assembled rulebook. Today only
 * exact-profile-match is implemented — and it is also the conservative floor —
 * so any unrecognized policy string falls back to it rather than merging looser
 * than specced. (When a genuinely looser policy is implemented, branch here.)
 */
function resolveMergePolicy(rb: AssembledRulebook): { policy: string; fallback: boolean } {
  const policy = rb.mergePolicy || EXACT_MATCH;
  return { policy, fallback: policy !== EXACT_MATCH };
}

// ============================================================
// Core
// ============================================================

/** One member carried through merging with the label of the candidate it came from. */
interface CarriedMember {
  instance: IntentInstance;
  bucketKey: string;
  /** the source candidate's label, valid for this member iff its fingerprint matches the bucket. */
  sourceLabel: TopicLabel | null;
}

/**
 * Step 5. Fold identical-profile candidate topics into tight topics and emit
 * nest candidates for strict containment. Pure: deterministic output for a given
 * (candidates, rulebook). Output topics are sorted by descending volume then
 * fingerprint; nest candidates by (parentId, childId).
 */
export function conservativeMerge(candidates: Topic[], rb: AssembledRulebook): MergeResult {
  const { policy, fallback } = resolveMergePolicy(rb);

  // 1) Explode to members and bucket each by the fingerprint of its OWN profile
  //    (self-purifying: a member is always routed to the bucket its profile
  //    actually belongs to, regardless of its source topic's claimed fingerprint).
  const buckets = new Map<string, CarriedMember[]>();
  let inputInstances = 0;
  for (const cand of candidates) {
    for (const instance of cand.memberInstances) {
      inputInstances++;
      const bucketKey = computeFingerprint(instance.profile);
      const sourceLabel = cand.fingerprint === bucketKey ? labelOf(cand) : null;
      const list = buckets.get(bucketKey);
      if (list) list.push({ instance, bucketKey, sourceLabel });
      else buckets.set(bucketKey, [{ instance, bucketKey, sourceLabel }]);
    }
  }

  // 2) Build one tight topic per bucket.
  let mergedGroups = 0;
  const topics: Topic[] = [];
  for (const [bucketKey, members] of buckets) {
    if (members.length > 1) mergedGroups++;
    topics.push(buildMergedTopic(bucketKey, members, rb));
  }

  // 3) Nest candidates via a shared-axis neighborhood over the merged topics
  //    (never all-pairs).
  const nestCandidates = detectNestCandidates(topics);

  // 4) Deterministic ordering.
  topics.sort(byVolumeThenFingerprint);
  nestCandidates.sort(byNestEdge);

  return {
    topics,
    nestCandidates,
    stats: {
      inputInstances,
      outputTopics: topics.length,
      mergedGroups,
      nestCandidates: nestCandidates.length,
      mergePolicy: policy,
      policyFallback: fallback,
    },
  };
}

/** Reconstruct the source candidate's label fields into a TopicLabel. */
function labelOf(cand: Topic): TopicLabel {
  return {
    fingerprint: cand.fingerprint,
    title: cand.title,
    canonicalProfile: cand.canonicalProfile,
    specificityMarkers: cand.specificityMarkers,
    boundary: cand.boundary,
  };
}

function buildMergedTopic(bucketKey: string, members: CarriedMember[], rb: AssembledRulebook): Topic {
  // sort members by descending volume, then id, for stable representative + output.
  const sorted = [...members].sort((a, b) => {
    const dv = b.instance.searchVolume - a.instance.searchVolume;
    if (dv !== 0) return dv;
    return a.instance.id < b.instance.id ? -1 : a.instance.id > b.instance.id ? 1 : 0;
  });

  // representative label: the highest-volume member whose source label is valid
  // for this bucket; otherwise recompute deterministically from the profile.
  const repWithLabel = sorted.find((m) => m.sourceLabel !== null);
  const label: TopicLabel = repWithLabel?.sourceLabel ?? labelIntent(sorted[0].instance, rb);

  const instances = sorted.map((m) => m.instance);
  const volumeFull = instances.reduce((sum, i) => sum + (i.searchVolume || 0), 0);
  const primaryKeywords = uniqueStable(instances.map((i) => i.sourceKeyword));

  return {
    id: `t:${bucketKey}`,
    fingerprint: bucketKey,
    title: label.title,
    canonicalProfile: label.canonicalProfile,
    specificityMarkers: label.specificityMarkers,
    boundary: label.boundary,
    memberInstances: instances,
    primaryKeywords,
    volumeFull,
  };
}

/**
 * Strict-containment edges over the merged topics. A topic's axis set is the set
 * of `key=value` tokens in its fingerprint. Parent ⊊ child: every parent token
 * is in the child and the child has strictly more tokens. We only ever compare
 * topics that share at least one axis token (a shared-axis neighborhood built
 * from an inverted index) — two topics with no shared token can't be in a
 * containment relationship anyway, so this loses nothing and avoids all-pairs.
 *
 * A topic with zero axes (`unspecified` fingerprint) is never a nest parent — it
 * would otherwise "contain" everything, which is meaningless.
 */
function detectNestCandidates(topics: Topic[]): NestCandidate[] {
  const axes = topics.map((t) => axisTokens(t.fingerprint));

  // inverted index: axis token → list of topic indices that carry it.
  const index = new Map<string, number[]>();
  for (let i = 0; i < topics.length; i++) {
    for (const tok of axes[i]) {
      const list = index.get(tok);
      if (list) list.push(i);
      else index.set(tok, [i]);
    }
  }

  const seen = new Set<string>();
  const edges: NestCandidate[] = [];
  for (let child = 0; child < topics.length; child++) {
    const childAxes = axes[child];
    if (childAxes.size === 0) continue; // nothing can be strictly contained in it via a shared token

    // neighborhood: every topic that shares at least one axis token with the child.
    const neighbors = new Set<number>();
    for (const tok of childAxes) {
      for (const j of index.get(tok) ?? []) if (j !== child) neighbors.add(j);
    }

    for (const parent of neighbors) {
      const parentAxes = axes[parent];
      if (parentAxes.size === 0) continue; // unspecified is never a parent
      if (parentAxes.size >= childAxes.size) continue; // need strict subset (fewer axes)
      if (!isSubset(parentAxes, childAxes)) continue;

      const key = `${topics[parent].id} ${topics[child].id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ parentId: topics[parent].id, childId: topics[child].id });
    }
  }
  return edges;
}

// ============================================================
// Small helpers
// ============================================================

/** The `key=value` axis tokens of a fingerprint (empty for `unspecified`). */
function axisTokens(fingerprint: string): Set<string> {
  if (!fingerprint || fingerprint === 'unspecified') return new Set();
  return new Set(fingerprint.split(';'));
}

function isSubset(small: Set<string>, big: Set<string>): boolean {
  for (const v of small) if (!big.has(v)) return false;
  return true;
}

/** Dedup preserving first-seen order; drops empties. */
function uniqueStable(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function byVolumeThenFingerprint(a: Topic, b: Topic): number {
  const dv = b.volumeFull - a.volumeFull;
  if (dv !== 0) return dv;
  return a.fingerprint < b.fingerprint ? -1 : a.fingerprint > b.fingerprint ? 1 : 0;
}

function byNestEdge(a: NestCandidate, b: NestCandidate): number {
  if (a.parentId !== b.parentId) return a.parentId < b.parentId ? -1 : 1;
  if (a.childId !== b.childId) return a.childId < b.childId ? -1 : 1;
  return 0;
}
