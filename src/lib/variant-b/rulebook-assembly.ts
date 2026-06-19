/**
 * Variant B ("AI 2") — rulebook assembler: THE RUNTIME READ PATH (Step 1).
 *
 * Locked resolution #1: every pure pipeline lib and every prompt-builder receives
 * an `AssembledRulebook` — the UNION of
 *   (a) the universal code layer (`rulebook.ts`), the authoritative floor, and
 *   (b) DB `CLREntry` rows whose `scope ∈ {"universal", "niche:<slug>"}` and
 *       `status ∈ {"active", "approved-candidate"}`,
 * pinned to one `clrVersion`. The libs never import niche-aware constants
 * directly, so DB niche aliases reach carrier-dedup, value-ladders reach
 * hierarchy/shells, and niche/approved placement edge-rules reach placement.
 *
 * Niche/approved entries EXTEND the universal set; where they supersede a natural
 * key (a descriptor, zone, placement rule, ladder, the merge policy, the
 * ignorable set) the later layer wins and placement rules are re-sorted by
 * priority. Universal DB rows are applied before niche rows so niche wins ties.
 *
 * `assembleRulebook` is a PURE function (synthetic rows in → assembled object
 * out) and is `node --test`-covered. `loadAssembledRulebook` is the thin DB
 * adapter that reads the scoped rows and calls the pure core.
 */

import {
  DESCRIPTORS,
  ZONES,
  PLACEMENT_RULES,
  IGNORABLE_STOPWORDS,
  MERGE_POLICY,
  NATURAL_SEQUENCE_HINTS,
  UNPLACED_UNIVERSAL_SUBJECT_TYPES,
  RULEBOOK_VERSION,
  type DescriptorDef,
  type ZoneDef,
  type PlacementRule,
  type NaturalSequenceHint,
} from './rulebook.ts';
import type { CarrierDedupConfig } from './types.ts';
import { naturalKeyOf } from './seed-rulebook.ts';

/** §4 niche specialization ladder (general → specific) for a laddered descriptor. */
export interface ValueLadder {
  descriptorKey: string;
  /** ordered values, general/broad → specific/narrow. */
  ladder: string[];
}

/** The effective rulebook handed to every pure lib + prompt-builder. Pure data;
 *  the `rb*` helper functions below operate on it (so the helpers honor niche
 *  zones/descriptors, not the code constants). */
export interface AssembledRulebook {
  /** version this assembly is pinned to (max version among included layers). */
  clrVersion: number;
  /** active niche slug, or null when the project has none (universal only). */
  nicheSlug: string | null;
  descriptors: DescriptorDef[];
  zones: ZoneDef[];
  /** sorted ascending by priority (evaluation order for placement). */
  placementRules: PlacementRule[];
  ignorableStopwords: string[];
  mergePolicy: string;
  naturalSequenceHints: NaturalSequenceHint[];
  /** §4 niche specialization ladders (empty at the universal floor). */
  valueLadders: ValueLadder[];
  /** §6 niche alias → canonical condition term (empty at the universal floor). */
  aliases: Record<string, string>;
  /** the project's condition/niche term to strip in carrier-dedup, if known. */
  conditionTerm?: string;
  /** universal-layer subject types that intentionally fall to needs-placement. */
  unplacedUniversalSubjectTypes: string[];
}

/** Minimal shape of a `CLREntry` row the assembler consumes (DB or synthetic). */
export interface ClrRow {
  id?: string;
  type: string;
  payload: Record<string, unknown>;
  scope: string;
  status: string;
  version: number;
  supersedesId?: string | null;
}

export interface AssembleOpts {
  /** the active project's niche slug; null/undefined ⇒ universal layer only. */
  nicheSlug?: string | null;
  /** fallback condition term (a DB `value/condition-term` row overrides this). */
  conditionTerm?: string;
}

const INCLUDED_STATUSES = new Set(['active', 'approved-candidate']);

/**
 * Build the effective `AssembledRulebook` from the universal code floor plus the
 * given DB rows. Pure: deterministic, no DB, no AI.
 */
export function assembleRulebook(rows: ClrRow[], opts: AssembleOpts = {}): AssembledRulebook {
  const nicheSlug = opts.nicheSlug ?? null;
  const nicheScope = nicheSlug ? `niche:${nicheSlug}` : null;

  // --- base: the universal CODE floor (authoritative) ---
  const descriptors = new Map<string, DescriptorDef>(DESCRIPTORS.map((d) => [d.key, { ...d }]));
  const zones = new Map<string, ZoneDef>(ZONES.map((z) => [z.key, { ...z, stages: [...z.stages] }]));
  const placement = new Map<string, PlacementRule>(PLACEMENT_RULES.map((r) => [r.id, { ...r }]));
  const naturalSeq = new Map<string, NaturalSequenceHint>(
    NATURAL_SEQUENCE_HINTS.map((h) => [h.descriptorKey, { descriptorKey: h.descriptorKey, sequence: [...h.sequence] }]),
  );
  const valueLadders = new Map<string, ValueLadder>();
  const aliases: Record<string, string> = {};
  let ignorableStopwords = [...IGNORABLE_STOPWORDS];
  let mergePolicy: string = MERGE_POLICY;
  let conditionTerm = opts.conditionTerm;
  let clrVersion = RULEBOOK_VERSION;

  // --- select + order DB rows: scope filter, status filter, latest-version-wins,
  //     universal applied before niche so niche overrides on ties ---
  const scoped = rows.filter(
    (r) => INCLUDED_STATUSES.has(r.status) && (r.scope === 'universal' || (nicheScope !== null && r.scope === nicheScope)),
  );
  const latest = latestVersionPerKey(scoped);
  latest.sort(scopeThenVersion(nicheScope));

  for (const row of latest) {
    if (row.version > clrVersion) clrVersion = row.version;
    applyRow(row, { descriptors, zones, placement, naturalSeq, valueLadders, aliases, setStopwords, setMergePolicy, setConditionTerm });
  }

  function setStopwords(v: string[]) { ignorableStopwords = v; }
  function setMergePolicy(v: string) { mergePolicy = v; }
  function setConditionTerm(v: string) { conditionTerm = v; }

  return {
    clrVersion,
    nicheSlug,
    descriptors: [...descriptors.values()],
    zones: [...zones.values()],
    placementRules: [...placement.values()].sort((a, b) => a.priority - b.priority),
    ignorableStopwords,
    mergePolicy,
    naturalSequenceHints: [...naturalSeq.values()],
    valueLadders: [...valueLadders.values()],
    aliases,
    conditionTerm,
    unplacedUniversalSubjectTypes: [...UNPLACED_UNIVERSAL_SUBJECT_TYPES],
  };
}

/** For each (scope, type, naturalKey) keep only the highest-version row. */
function latestVersionPerKey(rows: ClrRow[]): ClrRow[] {
  const best = new Map<string, ClrRow>();
  for (const r of rows) {
    const k = `${r.scope}::${r.type}::${naturalKeyOf(r.type, r.payload)}`;
    const prev = best.get(k);
    if (!prev || r.version > prev.version) best.set(k, r);
  }
  return [...best.values()];
}

/** universal rows first (so niche overrides), then by ascending version. */
function scopeThenVersion(nicheScope: string | null) {
  return (a: ClrRow, b: ClrRow): number => {
    const ra = a.scope === 'universal' ? 0 : 1;
    const rb = b.scope === 'universal' ? 0 : 1;
    if (ra !== rb) return ra - rb;
    return a.version - b.version;
  };
}

interface ApplyTarget {
  descriptors: Map<string, DescriptorDef>;
  zones: Map<string, ZoneDef>;
  placement: Map<string, PlacementRule>;
  naturalSeq: Map<string, NaturalSequenceHint>;
  valueLadders: Map<string, ValueLadder>;
  aliases: Record<string, string>;
  setStopwords: (v: string[]) => void;
  setMergePolicy: (v: string) => void;
  setConditionTerm: (v: string) => void;
}

function applyRow(row: ClrRow, t: ApplyTarget): void {
  const p = row.payload ?? {};
  switch (row.type) {
    case 'descriptor':
      if (typeof p.key === 'string') t.descriptors.set(p.key, p as unknown as DescriptorDef);
      return;
    case 'zone':
      if (typeof p.key === 'string') t.zones.set(p.key, { ...(p as unknown as ZoneDef), stages: [...((p.stages as string[]) ?? [])] });
      return;
    case 'placement_rule':
      if (typeof p.id === 'string') t.placement.set(p.id, p as unknown as PlacementRule);
      return;
    case 'ignorable_set':
      if (Array.isArray(p.stopwords)) t.setStopwords((p.stopwords as string[]).map(String));
      return;
    case 'merge_policy':
      if (typeof p.policy === 'string') t.setMergePolicy(p.policy);
      return;
    case 'value_ladder': {
      const descriptorKey = typeof p.descriptorKey === 'string' ? p.descriptorKey : '';
      if (!descriptorKey) return;
      if (p.kind === 'specialization' && Array.isArray(p.ladder)) {
        t.valueLadders.set(descriptorKey, { descriptorKey, ladder: (p.ladder as string[]).map(String) });
      } else if (Array.isArray(p.sequence)) {
        // default / 'natural-sequence' kind
        t.naturalSeq.set(descriptorKey, { descriptorKey, sequence: (p.sequence as string[]).map(String) });
      }
      return;
    }
    case 'value':
      // niche vocabulary values: alias mapping or the project condition term
      if (p.kind === 'alias' && typeof p.alias === 'string' && typeof p.canonical === 'string') {
        t.aliases[(p.alias as string).toLowerCase()] = p.canonical as string;
      } else if (p.kind === 'condition-term' && typeof p.term === 'string') {
        t.setConditionTerm(p.term as string);
      }
      return;
    default:
      // naming_convention / stage / unknown — no-op at this layer (reserved for
      // later libs that consume them directly off the assembled rows).
      return;
  }
}

// ============================================================
// Helpers — operate on the ASSEMBLED data (honor niche zones/descriptors)
// ============================================================

export function rbGetZone(rb: AssembledRulebook, zoneKey: string): ZoneDef | undefined {
  return rb.zones.find((z) => z.key === zoneKey);
}

export function rbGetDescriptor(rb: AssembledRulebook, key: string): DescriptorDef | undefined {
  return rb.descriptors.find((d) => d.key === key);
}

/** Generic fallback stage per zone (misfit taxonomy #3). */
export function rbGenericStageForZone(rb: AssembledRulebook, zoneKey: string): string | null {
  const z = rbGetZone(rb, zoneKey);
  return z && z.stages.length > 0 ? z.stages[0] : null;
}

/** rulebook §10: verticalRank = zone rank then stage rank, over ASSEMBLED zones. */
export function rbVerticalRank(rb: AssembledRulebook, zoneKey: string, stageKey: string | null): number | null {
  const z = rbGetZone(rb, zoneKey);
  if (!z) return null;
  const sIdx = stageKey ? z.stages.indexOf(stageKey) : -1;
  const stageRank = sIdx >= 0 ? sIdx + 1 : 0; // unknown/null → front of zone
  return z.rank + stageRank / 100;
}

/** Placement rules in evaluation order (already sorted; returns a copy). */
export function rbPlacementRulesByPriority(rb: AssembledRulebook): PlacementRule[] {
  return [...rb.placementRules].sort((a, b) => a.priority - b.priority);
}

/** Carrier-dedup config (rulebook §6) drawn from the assembled rulebook. */
export function rbCarrierDedupConfig(rb: AssembledRulebook, conditionTermOverride?: string): CarrierDedupConfig {
  return {
    conditionTerm: conditionTermOverride ?? rb.conditionTerm,
    ignorableStopwords: rb.ignorableStopwords,
    aliases: rb.aliases,
  };
}

// ============================================================
// Thin DB adapter
// ============================================================

/** Minimal shape of the part of Prisma the loader reads. */
export interface ClrReadStore {
  cLREntry: {
    findMany(args: { where: { scope: { in: string[] }; status: { in: string[] } } }): Promise<ClrRow[]>;
  };
}

/**
 * Load + assemble the effective rulebook for a project. Reads only the universal
 * + this project's niche rows in the included statuses, then delegates to the
 * pure `assembleRulebook`.
 */
export async function loadAssembledRulebook(
  prisma: ClrReadStore,
  project: { nicheSlug?: string | null },
  opts: { conditionTerm?: string } = {},
): Promise<AssembledRulebook> {
  const nicheSlug = project.nicheSlug ?? null;
  const scopes = nicheSlug ? ['universal', `niche:${nicheSlug}`] : ['universal'];
  const rows = await prisma.cLREntry.findMany({
    where: { scope: { in: scopes }, status: { in: [...INCLUDED_STATUSES] } },
  });
  return assembleRulebook(rows, { nicheSlug, conditionTerm: opts.conditionTerm });
}
