/**
 * Variant B ("AI 2") — §11 reorganization sweeps (periodic self-correction).
 * Pure + deterministic. No AI, no DB, no React.
 *
 * As topics accumulate, independent sweeps run at a regular CADENCE (config knob
 * `variantB.reorgCadence`, default ≈ one batch-wave) PLUS a guaranteed final full
 * sweep at the end of assembly (locked resolution #3).
 *
 * The cardinal §11 constraint: a sweep operates on the CONDENSED SKELETON
 * (titles + zone/stage tags + volumes + parent links — see `condenseSkeleton`)
 * and on small LOCAL SLICES (one parent's children at a time — `sliceByParent`).
 * It MUST NOT re-feed the entire raw tree into a single prompt — that is the one
 * non-negotiable that separates this from Variant A's whole-canvas pass.
 *
 * This lib implements the MECHANICAL, deterministic checks: prune dead shells
 * (re-parenting their children), re-rank siblings as volumes shift, and FLAG the
 * judgment calls (oversized / tiny / orphaned) to a needs-review queue rather
 * than guessing. Split/merge/re-nest decisions that need judgment are surfaced as
 * flags for the AI/operator pass, never silently applied.
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { Topic } from './conservative-merge.ts';
import { orderSiblings } from './ordering.ts';

export interface ReorgOptions {
  /** `variantB.reorgCadence`: sweep every N processed items. Default 75 (a wave). */
  cadence?: number;
  /** member-instance count above which a topic is flagged oversized (split candidate). */
  oversizedMemberCount?: number;
  /** volume at/below which a non-shell leaf is flagged tiny. Default 0. */
  tinyVolume?: number;
}

const DEFAULTS = { cadence: 75, oversizedMemberCount: 40, tinyVolume: 0 };

/** The small per-sweep representation — never the raw members/profiles. */
export interface SkeletonNode {
  id: string;
  title: string;
  zone: string | null;
  stage: string | null;
  volumeFull: number;
  parentId: string | null;
  isShell: boolean;
  isSpine: boolean;
  depth: number | null;
  memberCount: number;
}

export type ReorgFlagType = 'oversized' | 'tiny' | 'orphaned';

export interface ReorgFlag {
  type: ReorgFlagType;
  topicId: string;
  detail: string;
}

export interface SweepReport {
  prunedShellIds: string[];
  reRankedParentIds: string[];
  flags: ReorgFlag[];
}

export interface SweepResult {
  topics: Topic[];
  report: SweepReport;
}

// ============================================================
// Cadence
// ============================================================

/**
 * The processed-item counts at which a sweep should run: every `cadence` items,
 * plus a guaranteed final sweep at `totalItems` (always included, even if it does
 * not fall on a cadence boundary). Returns [] only for an empty assembly.
 */
export function planSweeps(totalItems: number, opts: ReorgOptions = {}): number[] {
  const cadence = Math.max(1, opts.cadence ?? DEFAULTS.cadence);
  if (totalItems <= 0) return [];
  const points: number[] = [];
  for (let n = cadence; n < totalItems; n += cadence) points.push(n);
  points.push(totalItems); // guaranteed final full sweep
  return points;
}

// ============================================================
// Condensation + slicing (the flat-payload guarantees)
// ============================================================

/** Condense the tree to the small skeleton a sweep reasons over. */
export function condenseSkeleton(topics: Topic[]): SkeletonNode[] {
  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    zone: t.zone ?? null,
    stage: t.stage ?? null,
    volumeFull: t.volumeFull,
    parentId: t.parentId ?? null,
    isShell: t.isShell ?? false,
    isSpine: t.isSpine ?? false,
    depth: t.depth ?? null,
    memberCount: t.memberInstances.length,
  }));
}

/** One slice per parent (its direct children) — the local unit a sweep works on. */
export function sliceByParent(topics: Topic[]): Map<string, Topic[]> {
  const slices = new Map<string, Topic[]>();
  for (const t of topics) {
    const key = t.parentId ?? '';
    const s = slices.get(key);
    if (s) s.push(t);
    else slices.set(key, [t]);
  }
  return slices;
}

// ============================================================
// Mechanical sweep
// ============================================================

function hasContent(t: Topic): boolean {
  return t.memberInstances.length > 0 || t.primaryKeywords.length > 0;
}

/**
 * Run one mechanical sweep over the tree. Pure: returns a new topic array.
 * Deterministic fixes applied: dead-shell pruning (children re-parented to the
 * shell's parent) and sibling re-ranking. Judgment calls are flagged, not applied.
 */
export function runMechanicalSweep(topics: Topic[], rb: AssembledRulebook, opts: ReorgOptions = {}): SweepResult {
  const oversized = opts.oversizedMemberCount ?? DEFAULTS.oversizedMemberCount;
  const tiny = opts.tinyVolume ?? DEFAULTS.tinyVolume;

  let work = topics.map((t) => ({ ...t }));
  const ids = new Set(work.map((t) => t.id));

  // children index for descendant checks.
  const childrenOf = new Map<string, Topic[]>();
  for (const t of work) {
    if (t.parentId && ids.has(t.parentId)) (childrenOf.get(t.parentId) ?? setGet(childrenOf, t.parentId)).push(t);
  }

  // 1) prune dead shells: a shell with no content anywhere beneath it.
  const prunedShellIds: string[] = [];
  const subtreeHasContent = (t: Topic): boolean => {
    if (hasContent(t)) return true;
    for (const c of childrenOf.get(t.id) ?? []) if (subtreeHasContent(c)) return true;
    return false;
  };
  const pruned = new Set<string>();
  for (const t of work) {
    if ((t.isShell ?? false) && !subtreeHasContent(t)) {
      pruned.add(t.id);
      prunedShellIds.push(t.id);
    }
  }
  if (pruned.size > 0) {
    // re-parent the children of pruned shells up to the shell's parent.
    const parentOf = new Map(work.map((t) => [t.id, t.parentId ?? null]));
    const liftedParent = (id: string | null): string | null => {
      let p = id;
      while (p && pruned.has(p)) p = parentOf.get(p) ?? null;
      return p ?? null;
    };
    work = work
      .filter((t) => !pruned.has(t.id))
      .map((t) => ({ ...t, parentId: liftedParent(t.parentId ?? null) }));
  }

  // 2) flag judgment calls (never auto-split/merge/relocate).
  const flags: ReorgFlag[] = [];
  const liveIds = new Set(work.map((t) => t.id));
  const liveChildren = new Map<string, number>();
  for (const t of work) if (t.parentId && liveIds.has(t.parentId)) liveChildren.set(t.parentId, (liveChildren.get(t.parentId) ?? 0) + 1);

  for (const t of work) {
    if (t.memberInstances.length > oversized) {
      flags.push({ type: 'oversized', topicId: t.id, detail: `${t.memberInstances.length} members > ${oversized}` });
    }
    const isLeaf = (liveChildren.get(t.id) ?? 0) === 0;
    if (isLeaf && !(t.isShell ?? false) && t.volumeFull <= tiny) {
      flags.push({ type: 'tiny', topicId: t.id, detail: `leaf volume ${t.volumeFull} ≤ ${tiny}` });
    }
    if (t.parentId && !liveIds.has(t.parentId)) {
      flags.push({ type: 'orphaned', topicId: t.id, detail: `missing parent ${t.parentId}` });
    }
  }

  // 3) re-rank siblings as volumes/structure shifted (mechanical, per-group).
  const before = new Map(work.map((t) => [t.id, t.siblingOrder]));
  work = orderSiblings(work, rb);
  const reRankedParentIds: string[] = [];
  const seen = new Set<string>();
  for (const t of work) {
    if (t.siblingOrder !== before.get(t.id)) {
      const key = t.parentId ?? '';
      if (!seen.has(key)) {
        seen.add(key);
        reRankedParentIds.push(key);
      }
    }
  }

  return { topics: work, report: { prunedShellIds, reRankedParentIds, flags } };
}

function setGet(m: Map<string, Topic[]>, k: string): Topic[] {
  const v: Topic[] = [];
  m.set(k, v);
  return v;
}
