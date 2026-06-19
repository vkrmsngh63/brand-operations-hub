/**
 * Variant B ("AI 2") — Step 6: hierarchy build (nest + shells + ordering).
 *
 * Pure + deterministic. No AI, no DB, no React. Takes the tight topics from
 * Step 5 (+ the nest candidates) and builds a connected tree:
 *   - NEST each topic under its nearest specialization parent (parentId);
 *   - generate demand-aware grouping SHELLS by climbing the assembled rulebook's
 *     value-ladders (a defined grouping level per rung), one ladder at a time —
 *     never the cross-product of axes (the explosion guard);
 *   - seat each topic's PRIMARY keywords and propagate them up to every
 *     specialization ancestor as SECONDARY (inheritedKeywords);
 *   - order each parent's children (siblingOrder) by descending volume then title;
 *   - assign depth and mark structural parents on the spine (isSpine).
 *
 * Nesting is ladder-aware: A specializes B iff A covers every one of B's axes
 * with B's value OR a ladder-descendant of it, AND A is strictly more specific
 * (an extra axis, or a deeper ladder value somewhere). At the universal floor the
 * rulebook ships NO value-ladders, so this reduces exactly to Step 5's
 * exact-subset containment and generates zero shells.
 *
 * Vertical ordering (`funnelVerticalRank`) is intentionally NOT set here — it is
 * the STUB pending the journey-ordering discussion (spec §3 Step 6 / Step 7). It
 * is computed later in ordering.ts once specced; this lib leaves it untouched.
 *
 * "Never feed the whole tree to anything": parent discovery runs over a
 * shared-token neighborhood (an inverted index over each topic's axis tokens
 * expanded with their ladder ancestors), never all-pairs.
 */

import type { AssembledRulebook, ValueLadder } from './rulebook-assembly.ts';
import type { DescriptorProfile } from './types.ts';
import type { NestCandidate, Topic } from './conservative-merge.ts';
import { computeFingerprint } from './topic-labeling.ts';

export interface HierarchyStats {
  inputTopics: number;
  shellsCreated: number;
  outputTopics: number;
  rootCount: number;
  maxDepth: number;
  spineCount: number;
  /** edges discovered (specialization relationships across the full set). */
  specializationEdges: number;
}

export interface HierarchyResult {
  /** tight topics + generated shells, each with tree fields populated. */
  topics: Topic[];
  /** ids of the root topics, in sibling order. */
  rootIds: string[];
  stats: HierarchyStats;
}

// ============================================================
// Ladder helpers
// ============================================================

interface LadderInfo {
  /** ordered general → specific. */
  ladder: string[];
  /** value → index (0 = most general). */
  index: Map<string, number>;
}

function buildLadderMap(rb: AssembledRulebook): Map<string, LadderInfo> {
  const m = new Map<string, LadderInfo>();
  for (const vl of rb.valueLadders ?? ([] as ValueLadder[])) {
    const ladder = vl.ladder.map((v) => v.toLowerCase());
    const index = new Map<string, number>();
    ladder.forEach((v, i) => index.set(v, i));
    m.set(vl.descriptorKey, { ladder, index });
  }
  return m;
}

/** Profile axis keys (laddered or not) in the rulebook's declared order, minus meta. */
function profileKeys(rb: AssembledRulebook): string[] {
  return rb.descriptors.filter((d) => d.group !== 'meta').map((d) => d.key);
}

/** Meaningful (present, non-empty) axes of a profile in declared order. */
function axesOf(profile: DescriptorProfile, keys: string[]): Array<{ key: string; value: string }> {
  const out: Array<{ key: string; value: string }> = [];
  for (const key of keys) {
    const v = (profile as unknown as Record<string, unknown>)[key];
    if (typeof v === 'string' && v) out.push({ key, value: v });
  }
  return out;
}

// ============================================================
// Specialization (ladder-aware nesting predicate)
// ============================================================

/**
 * True iff `child` is a STRICT specialization of `parent`: child carries every
 * one of parent's axes with parent's value OR a ladder-descendant of it, and is
 * strictly more specific somewhere (an extra axis, or a deeper ladder value).
 */
function specializes(
  child: DescriptorProfile,
  parent: DescriptorProfile,
  keys: string[],
  ladders: Map<string, LadderInfo>,
): boolean {
  const pAxes = axesOf(parent, keys);
  const cAxes = axesOf(child, keys);
  let deeper = false;

  for (const { key, value: pv } of pAxes) {
    const cv = (child as unknown as Record<string, unknown>)[key];
    if (typeof cv !== 'string' || !cv) return false; // child missing a parent axis
    if (cv === pv) continue;
    // values differ → only valid if laddered and cv is a strict descendant of pv
    const li = ladders.get(key);
    if (!li) return false;
    const pi = li.index.get(pv);
    const ci = li.index.get(cv);
    if (pi === undefined || ci === undefined || ci <= pi) return false;
    deeper = true;
  }

  if (cAxes.length > pAxes.length) deeper = true;
  return deeper;
}

/** Specificity score for nearest-parent selection: more axes + deeper ladder = more specific. */
function specificity(profile: DescriptorProfile, keys: string[], ladders: Map<string, LadderInfo>): number {
  let score = 0;
  for (const { key, value } of axesOf(profile, keys)) {
    score += 100; // each present axis
    const li = ladders.get(key);
    if (li) {
      const i = li.index.get(value);
      if (i !== undefined) score += i; // deeper ladder rung = more specific
    }
  }
  return score;
}

// ============================================================
// Shell generation (demand-aware, one ladder at a time)
// ============================================================

/**
 * Generate grouping shells by climbing each laddered axis independently (a rung
 * is a defined CLR grouping level). One axis at a time — never the cross-product
 * — so there is no combinatorial blowup. Shells that collide with an existing
 * topic (a real keyword already maps to that profile) are skipped. Empty shells
 * (no primary keyword) are allowed.
 */
function generateShells(
  topics: Topic[],
  keys: string[],
  ladders: Map<string, LadderInfo>,
): Topic[] {
  if (ladders.size === 0) return [];
  const existing = new Set(topics.map((t) => t.fingerprint));
  const shells = new Map<string, Topic>();

  for (const t of topics) {
    for (const { key, value } of axesOf(t.canonicalProfile, keys)) {
      const li = ladders.get(key);
      if (!li) continue;
      const idx = li.index.get(value);
      if (idx === undefined || idx === 0) continue; // unknown or already most-general
      for (let j = 0; j < idx; j++) {
        const shellProfile: DescriptorProfile = { ...t.canonicalProfile, [key]: li.ladder[j] };
        const fp = computeFingerprint(shellProfile);
        if (existing.has(fp) || shells.has(fp)) continue;
        shells.set(fp, makeShell(fp, shellProfile, key, li.ladder[j]));
      }
    }
  }
  return [...shells.values()];
}

function makeShell(fingerprint: string, profile: DescriptorProfile, axisKey: string, axisValue: string): Topic {
  return {
    id: `t:${fingerprint}`,
    fingerprint,
    title: `${axisValue} (group)`,
    canonicalProfile: profile,
    specificityMarkers: [],
    boundary: { belongs: [`${axisKey}=${axisValue}`], excludes: [] },
    memberInstances: [],
    primaryKeywords: [],
    volumeFull: 0,
    isShell: true,
  };
}

// ============================================================
// Neighborhood (avoid all-pairs)
// ============================================================

/** A topic's axis tokens, each expanded with the ladder ancestors of its value,
 *  so a parent's exact token always appears in its child's expanded set. */
function expandedTokens(profile: DescriptorProfile, keys: string[], ladders: Map<string, LadderInfo>): string[] {
  const toks: string[] = [];
  for (const { key, value } of axesOf(profile, keys)) {
    toks.push(`${key}=${value}`);
    const li = ladders.get(key);
    const idx = li?.index.get(value);
    if (li && idx !== undefined) for (let j = 0; j < idx; j++) toks.push(`${key}=${li.ladder[j]}`);
  }
  return toks;
}

// ============================================================
// Core
// ============================================================

/**
 * Step 6. Build the connected tree from tight topics + nest candidates. Pure and
 * deterministic. The passed `nestCandidates` (Step 5's exact-subset edges) are
 * honored and unioned with the ladder-aware edges discovered here.
 */
export function buildHierarchy(
  topics: Topic[],
  nestCandidates: NestCandidate[],
  rb: AssembledRulebook,
): HierarchyResult {
  const keys = profileKeys(rb);
  const ladders = buildLadderMap(rb);

  // 1) shells + working set
  const shells = generateShells(topics, keys, ladders);
  const all: Topic[] = [...topics.map(cloneTopic), ...shells];
  const byId = new Map(all.map((t) => [t.id, t]));
  const indexOfId = new Map(all.map((t, i) => [t.id, i]));

  // 2) specialization edges over a shared-token neighborhood (never all-pairs),
  //    unioned with the Step-5 candidates the caller passed in.
  const tokenIndex = new Map<string, number[]>();
  all.forEach((t, i) => {
    for (const tok of expandedTokens(t.canonicalProfile, keys, ladders)) {
      const list = tokenIndex.get(tok);
      if (list) list.push(i);
      else tokenIndex.set(tok, [i]);
    }
  });

  // parentsOf[childId] = set of all specialization-parent ids (the containment poset).
  const parentsOf = new Map<string, Set<string>>();
  all.forEach((t) => parentsOf.set(t.id, new Set()));

  const addEdge = (parentId: string, childId: string) => {
    if (parentId === childId) return;
    parentsOf.get(childId)?.add(parentId);
  };

  // seed from the caller's Step-5 candidates (already neighborhood-restricted).
  for (const e of nestCandidates) {
    if (byId.has(e.parentId) && byId.has(e.childId)) addEdge(e.parentId, e.childId);
  }

  // discover the full poset (covers shells + ladder relationships).
  all.forEach((child, ci) => {
    const childToks = expandedTokens(child.canonicalProfile, keys, ladders);
    if (childToks.length === 0) return;
    const neighbors = new Set<number>();
    for (const tok of childToks) for (const j of tokenIndex.get(tok) ?? []) if (j !== ci) neighbors.add(j);
    for (const pj of neighbors) {
      const parent = all[pj];
      if (specializes(child.canonicalProfile, parent.canonicalProfile, keys, ladders)) {
        addEdge(parent.id, child.id);
      }
    }
  });

  let edgeCount = 0;
  for (const s of parentsOf.values()) edgeCount += s.size;

  // 3) nearest tree parent = most specific specialization parent.
  for (const t of all) {
    const parents = [...(parentsOf.get(t.id) ?? [])].map((id) => byId.get(id)!).filter(Boolean);
    if (parents.length === 0) {
      t.parentId = null;
      continue;
    }
    parents.sort((a, b) => {
      const da = specificity(a.canonicalProfile, keys, ladders);
      const db = specificity(b.canonicalProfile, keys, ladders);
      if (da !== db) return db - da; // most specific first
      if (a.volumeFull !== b.volumeFull) return b.volumeFull - a.volumeFull;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    t.parentId = parents[0].id;
  }

  // 4) children + sibling order (descending volume, then alphabetical title).
  const childrenOf = new Map<string, Topic[]>();
  all.forEach((t) => childrenOf.set(t.id, []));
  const roots: Topic[] = [];
  for (const t of all) {
    if (t.parentId && childrenOf.has(t.parentId)) childrenOf.get(t.parentId)!.push(t);
    else roots.push(t);
  }
  const bySibling = (a: Topic, b: Topic) => {
    if (a.volumeFull !== b.volumeFull) return b.volumeFull - a.volumeFull;
    const ta = a.title.toLowerCase();
    const tb = b.title.toLowerCase();
    if (ta !== tb) return ta < tb ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  };
  for (const [pid, kids] of childrenOf) {
    kids.sort(bySibling);
    byId.get(pid)!.children = kids.map((k) => k.id);
    kids.forEach((k, i) => (k.siblingOrder = i));
  }
  roots.sort(bySibling);
  roots.forEach((r, i) => (r.siblingOrder = i));

  // 5) depth (BFS from roots) + spine marking.
  let maxDepth = 0;
  const queue: Array<{ id: string; depth: number }> = roots.map((r) => ({ id: r.id, depth: 0 }));
  const visited = new Set<string>();
  while (queue.length) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const t = byId.get(id)!;
    t.depth = depth;
    if (depth > maxDepth) maxDepth = depth;
    for (const cid of t.children ?? []) queue.push({ id: cid, depth: depth + 1 });
  }
  let spineCount = 0;
  for (const t of all) {
    t.isSpine = (t.children?.length ?? 0) > 0;
    if (t.isSpine) spineCount++;
  }

  // 6) secondary propagation: each topic inherits the PRIMARY keywords of every
  //    topic that specializes it (its whole containment-descendant set).
  const descendantsViaPoset = invertParents(parentsOf); // parentId → all descendant ids
  for (const t of all) {
    const inherited = new Set<string>();
    for (const descId of descendantsViaPoset.get(t.id) ?? []) {
      for (const kw of byId.get(descId)?.primaryKeywords ?? []) inherited.add(kw);
    }
    t.inheritedKeywords = [...inherited].sort();
  }

  return {
    topics: all,
    rootIds: roots.map((r) => r.id),
    stats: {
      inputTopics: topics.length,
      shellsCreated: shells.length,
      outputTopics: all.length,
      rootCount: roots.length,
      maxDepth,
      spineCount,
      specializationEdges: edgeCount,
    },
  };
}

// ============================================================
// Helpers
// ============================================================

function cloneTopic(t: Topic): Topic {
  return { ...t, memberInstances: [...t.memberInstances], primaryKeywords: [...t.primaryKeywords] };
}

/** parentId → set of every descendant id (transitive closure of the poset). */
function invertParents(parentsOf: Map<string, Set<string>>): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const id of parentsOf.keys()) out.set(id, new Set());
  // parentsOf already holds the FULL poset (Step 5 emits transitive edges and we
  // re-derive them), so a single inversion gives every descendant.
  for (const [childId, parents] of parentsOf) {
    for (const pid of parents) out.get(pid)?.add(childId);
  }
  return out;
}
