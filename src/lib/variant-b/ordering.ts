/**
 * Variant B ("AI 2") — §10 ordering (vertical & horizontal). Pure + deterministic.
 *
 * Two independent, no-per-topic-AI sorts (rulebook v0.2 §10, the finalized
 * authority that supersedes the spec's "vertical order STUB"):
 *
 *   - HORIZONTAL (`siblingOrder`): siblings at one level order by a NATURAL-
 *     SEQUENCE hint when one applies to the group's varying axis (e.g. severity
 *     mild→severe, approach conservative→aggressive) — the sequence beats
 *     volume. Elsewhere, by descending volume (then title, then id). AI ordering
 *     is only a fallback for a group explicitly flagged ambiguous (not done here).
 *
 *   - VERTICAL (`funnelVerticalRank`): journey-driven, NEVER volume-driven —
 *     zone rank then stage rank. Requires zone/stage, so it is applied AFTER
 *     placement.ts (Step 7); topics still unplaced keep `funnelVerticalRank=null`.
 *
 * Both read their config from the ASSEMBLED rulebook parameter (naturalSequence
 * hints, zone/stage ranks) — never from the code constants directly.
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { Topic } from './conservative-merge.ts';
import { rbVerticalRank } from './rulebook-assembly.ts';
import type { NaturalSequenceHint } from './rulebook.ts';

const NOT_IN_SEQUENCE = Number.MAX_SAFE_INTEGER;

// ============================================================
// Horizontal — sibling order
// ============================================================

/** Descending volume, then alphabetical title, then id (the default §10 rule). */
function byVolumeTitle(a: Topic, b: Topic): number {
  if (a.volumeFull !== b.volumeFull) return b.volumeFull - a.volumeFull;
  const ta = a.title.toLowerCase();
  const tb = b.title.toLowerCase();
  if (ta !== tb) return ta < tb ? -1 : 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function valueOnAxis(t: Topic, axis: string): string | undefined {
  const v = (t.canonicalProfile as unknown as Record<string, unknown>)[axis];
  return typeof v === 'string' && v ? v : undefined;
}

/**
 * Pick the natural-sequence hint that governs a sibling group: the first hint
 * (in rulebook order) for which at least two siblings carry an in-sequence value
 * on its axis. Returns null when no hint applies → order by volume.
 */
function pickHint(siblings: Topic[], rb: AssembledRulebook): NaturalSequenceHint | null {
  for (const hint of rb.naturalSequenceHints ?? []) {
    let inSeq = 0;
    for (const s of siblings) {
      const v = valueOnAxis(s, hint.descriptorKey);
      if (v !== undefined && hint.sequence.indexOf(v) >= 0) inSeq++;
      if (inSeq >= 2) return hint;
    }
  }
  return null;
}

function seqRank(t: Topic, hint: NaturalSequenceHint): number {
  const v = valueOnAxis(t, hint.descriptorKey);
  if (v === undefined) return NOT_IN_SEQUENCE;
  const i = hint.sequence.indexOf(v);
  return i >= 0 ? i : NOT_IN_SEQUENCE;
}

/** Order one sibling group per §10. */
function orderGroup(siblings: Topic[], rb: AssembledRulebook): Topic[] {
  const hint = pickHint(siblings, rb);
  const sorted = [...siblings];
  if (hint) {
    sorted.sort((a, b) => {
      const ra = seqRank(a, hint);
      const rb_ = seqRank(b, hint);
      if (ra !== rb_) return ra - rb_; // sequence wins; out-of-sequence sink to the end
      return byVolumeTitle(a, b); // ties (or both out-of-sequence) → volume
    });
  } else {
    sorted.sort(byVolumeTitle);
  }
  return sorted;
}

/**
 * Re-order every sibling group in the tree per §10 and re-stamp `children` +
 * `siblingOrder`. Pure: returns a new topic array (inputs untouched). Groups are
 * derived from `parentId` so the result is independent of any prior ordering.
 */
export function orderSiblings(topics: Topic[], rb: AssembledRulebook): Topic[] {
  const out = topics.map((t) => ({ ...t }));
  const byId = new Map(out.map((t) => [t.id, t]));

  const groups = new Map<string, Topic[]>(); // parentId ("" = root) → siblings
  for (const t of out) {
    const key = t.parentId ?? '';
    const g = groups.get(key);
    if (g) g.push(t);
    else groups.set(key, [t]);
  }

  for (const [parentId, siblings] of groups) {
    const ordered = orderGroup(siblings, rb);
    ordered.forEach((t, i) => (t.siblingOrder = i));
    if (parentId !== '') {
      const parent = byId.get(parentId);
      if (parent) parent.children = ordered.map((t) => t.id);
    }
  }
  return out;
}

// ============================================================
// Vertical — funnel rank (applied after placement)
// ============================================================

/**
 * Stamp `funnelVerticalRank` = zone rank → stage rank (§10) on every topic that
 * already has a zone assigned. Journey-driven, never volume-driven. Topics still
 * in the needs-placement queue (no zone) keep `funnelVerticalRank=null`. Pure.
 */
export function applyVerticalRanks(topics: Topic[], rb: AssembledRulebook): Topic[] {
  return topics.map((t) => {
    if (!t.zone) return { ...t, funnelVerticalRank: null };
    return { ...t, funnelVerticalRank: rbVerticalRank(rb, t.zone, t.stage ?? null) };
  });
}
