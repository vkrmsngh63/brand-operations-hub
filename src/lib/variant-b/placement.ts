/**
 * Variant B ("AI 2") — §5 funnel placement (intent profile → zone/stage).
 * Pure + deterministic. No AI, no DB, no React.
 *
 * Evaluates the ASSEMBLED rulebook's placement rules in ascending priority;
 * the FIRST matching rule assigns the topic's zone + stage (and a secondary
 * "also-relevant-in" affinity when the rule sets one, e.g. R11). Priority order
 * already encodes the §5 precedence (usage/safety + purchase > comparison >
 * generic treatment; otherwise Action > Subject).
 *
 * NEVER guess (director decision 2026-06-19-c, matching rulebook §5): a topic
 * that matches no rule is NOT given a best-guess zone — it is routed to the
 * needs-placement queue, tagged with a best-effort misfit TYPE (a resolution
 * hint only; it never drives a placement). The misfit taxonomy:
 *   - rule-gap      : intent is clear but no rule covered it → add a rule.
 *   - straddle      : fits two zones (only arises if a rule declares it; here a
 *                     rule MATCH with secondaryAffinity handles it, so this is
 *                     reserved for future use).
 *   - no-stage      : zone clear, no stage fits (reserved — rules assign zone+
 *                     stage atomically, so this does not arise from rule eval).
 *   - no-zone-fits  : subject is one the universal layer intentionally leaves
 *                     unplaced (out-of-scope / adjacent holding area).
 *   - too-ambiguous : too little signal to place — route to re-review.
 *
 * Conditions read off `topic.canonicalProfile`; `phrase`/`cue` conditions match
 * literal cues against the topic's searcher text (title + primary keywords +
 * member source keywords).
 */

import type { AssembledRulebook } from './rulebook-assembly.ts';
import type { PlacementCondition, PlacementRule } from './rulebook.ts';
import type { DescriptorProfile } from './types.ts';
import type { Topic } from './conservative-merge.ts';

export type MisfitType = 'rule-gap' | 'straddle' | 'no-stage' | 'no-zone-fits' | 'too-ambiguous';

export interface PlacementOutcome {
  topicId: string;
  placed: boolean;
  zone: string | null;
  stage: string | null;
  secondaryAffinity?: { zone: string; stage: string };
  /** the rule that placed it (when placed). */
  matchedRuleId?: string;
  /** resolution hint (when queued); never used to guess a placement. */
  misfitType?: MisfitType;
}

export interface PlacementStats {
  total: number;
  placed: number;
  unplaced: number;
  byRule: Record<string, number>;
  byMisfit: Record<string, number>;
}

export interface PlacementResult {
  /** topics with zone/stage (+ secondaryAffinity) set; unplaced ones get null. */
  topics: Topic[];
  /** the needs-placement queue (operator-/Lessons-resolved). */
  needsPlacement: PlacementOutcome[];
  stats: PlacementStats;
}

// ============================================================
// Condition evaluation
// ============================================================

function asArray(v: string | string[]): string[] {
  return Array.isArray(v) ? v : [v];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word cue match for single tokens; substring for multi-word cues. */
function textHasCue(text: string, cue: string): boolean {
  const c = cue.toLowerCase();
  if (c.includes(' ')) return text.includes(c);
  return new RegExp(`\\b${escapeRegExp(c)}\\b`).test(text);
}

function conditionPasses(cond: PlacementCondition, profile: DescriptorProfile, text: string): boolean {
  if (cond.descriptorKey === 'phrase') {
    if (cond.op !== 'cue') return false;
    return asArray(cond.value).some((cue) => textHasCue(text, cue));
  }
  const v = (profile as unknown as Record<string, unknown>)[cond.descriptorKey];
  if (typeof v !== 'string' || !v) return false;
  switch (cond.op) {
    case 'eq':
      return v === cond.value;
    case 'in':
      return asArray(cond.value).includes(v);
    case 'cue':
      return asArray(cond.value).some((cue) => textHasCue(v, cue));
    default:
      return false;
  }
}

function ruleMatches(rule: PlacementRule, profile: DescriptorProfile, text: string): boolean {
  const hasAll = !!rule.all && rule.all.length > 0;
  const hasAny = !!rule.any && rule.any.length > 0;
  if (!hasAll && !hasAny) return false; // a rule with no conditions never matches (no guessing)
  if (hasAll && !rule.all!.every((c) => conditionPasses(c, profile, text))) return false;
  if (hasAny && !rule.any!.some((group) => group.every((c) => conditionPasses(c, profile, text)))) return false;
  return true;
}

// ============================================================
// Misfit classification (a hint only — never drives a placement)
// ============================================================

function searcherText(topic: Topic): string {
  const parts = [topic.title, ...topic.primaryKeywords, ...topic.memberInstances.map((m) => m.sourceKeyword)];
  return parts.join(' ').toLowerCase();
}

function classifyMisfit(topic: Topic, rb: AssembledRulebook): MisfitType {
  const subject = topic.canonicalProfile.subject_type;
  if (subject && (rb.unplacedUniversalSubjectTypes ?? []).includes(subject)) return 'no-zone-fits';
  const hasAction = !!topic.canonicalProfile.primary_action;
  const hasSubject = !!subject;
  if (!hasAction && !hasSubject) return 'too-ambiguous';
  return 'rule-gap';
}

// ============================================================
// Core
// ============================================================

/**
 * Place every topic against the assembled rulebook. Pure: returns a new topic
 * array (inputs untouched) plus the needs-placement queue and stats.
 */
export function placeTopics(topics: Topic[], rb: AssembledRulebook): PlacementResult {
  const rules = [...(rb.placementRules ?? [])].sort((a, b) => a.priority - b.priority);

  const out: Topic[] = [];
  const needsPlacement: PlacementOutcome[] = [];
  const byRule: Record<string, number> = {};
  const byMisfit: Record<string, number> = {};
  let placed = 0;

  for (const topic of topics) {
    const text = searcherText(topic);
    const profile = topic.canonicalProfile;

    const match = rules.find((r) => ruleMatches(r, profile, text));
    if (match) {
      placed++;
      byRule[match.id] = (byRule[match.id] ?? 0) + 1;
      out.push({
        ...topic,
        zone: match.zone,
        stage: match.stage,
        secondaryAffinity: match.secondaryAffinity ?? null,
      });
    } else {
      const misfitType = classifyMisfit(topic, rb);
      byMisfit[misfitType] = (byMisfit[misfitType] ?? 0) + 1;
      out.push({ ...topic, zone: null, stage: null, secondaryAffinity: null });
      needsPlacement.push({ topicId: topic.id, placed: false, zone: null, stage: null, misfitType });
    }
  }

  return {
    topics: out,
    needsPlacement,
    stats: {
      total: topics.length,
      placed,
      unplaced: needsPlacement.length,
      byRule,
      byMisfit,
    },
  };
}
