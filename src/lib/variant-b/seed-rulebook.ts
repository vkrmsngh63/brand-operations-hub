/**
 * Variant B ("AI 2") — universal-layer CLR seed (Step 1).
 *
 * Writes the code-encoded universal rulebook (`rulebook.ts`) into the DB as
 * `scope="universal"` `CLREntry` rows so the store has a queryable, versioned
 * record of the universal floor (the candidate-approval + future Lessons flows
 * read/extend the same store). The pure pipeline still gets the universal layer
 * from CODE via the assembler; these rows are the DB mirror, not a second source
 * of truth — `rulebook.ts` stays authoritative ("applier wins").
 *
 * IDEMPOTENT. Re-running inserts only rows whose (type, scope, natural-key) are
 * not already present at the current `RULEBOOK_VERSION`. There is no DB unique
 * constraint on CLREntry (by design — it is versioned/append-only), so
 * idempotency is enforced in app logic here, exactly the A-CLONE-IDEMP pattern.
 *
 * The row-BUILDER (`buildUniversalSeedRows`) is pure and `node --test`-covered;
 * `seedUniversalRulebook` is the thin DB adapter (insert-only the missing rows).
 */

import {
  DESCRIPTORS,
  ZONES,
  PLACEMENT_RULES,
  IGNORABLE_STOPWORDS,
  MERGE_POLICY,
  NATURAL_SEQUENCE_HINTS,
  RULEBOOK_VERSION,
} from './rulebook.ts';

/** CLREntry `type` values emitted by the universal seed. */
export type ClrType =
  | 'descriptor'
  | 'zone'
  | 'placement_rule'
  | 'ignorable_set'
  | 'merge_policy'
  | 'value_ladder';

/** Fixed natural key for the singleton universal rows. */
export const SINGLETON_KEY = 'default';

/** Discriminator stored on `value_ladder` payloads to separate the §10 ordering
 *  hints (universal) from the §4 niche specialization ladders (niche scope). */
export type ValueLadderKind = 'natural-sequence' | 'specialization';

/** The shape the seed hands the DB adapter (a `CLREntry` create-input minus DB
 *  defaults). `naturalKey` is NOT a DB column — it is the idempotency identity,
 *  recoverable from any stored row via `naturalKeyOf(type, payload)`. */
export interface SeedRow {
  type: ClrType;
  scope: 'universal';
  status: 'active';
  version: number;
  createdFrom: 'bootstrap';
  payload: Record<string, unknown>;
  /** identity for idempotency; derivable from `payload` via `naturalKeyOf`. */
  naturalKey: string;
}

/**
 * Recover a row's natural key from its (type, payload). Works for both freshly
 * built seed rows and rows read back from the DB, so the idempotency check can
 * compare a to-insert row against existing DB rows without a dedicated column.
 */
export function naturalKeyOf(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'descriptor':
    case 'zone':
      return String(payload.key ?? '');
    case 'placement_rule':
      return String(payload.id ?? '');
    case 'value_ladder':
      return String(payload.descriptorKey ?? '');
    case 'ignorable_set':
    case 'merge_policy':
      return SINGLETON_KEY;
    case 'value':
      // niche vocabulary values (seeded by the diagnostic, not here): an alias
      // is identified by its (lowercased) alias string; the project condition
      // term is a singleton. Distinct keys so they never collapse in dedup.
      if (payload.kind === 'condition-term') return 'condition-term';
      if (payload.kind === 'alias') return `alias:${String(payload.alias ?? '').toLowerCase()}`;
      return String(payload.key ?? payload.id ?? '');
    default:
      // Niche types (naming_convention, stage) seeded elsewhere; fall back to an
      // explicit key if present.
      return String(payload.key ?? payload.id ?? '');
  }
}

/**
 * Build the full set of universal `CLREntry` rows from the code rulebook. Pure —
 * no DB, no AI. Deterministic order (descriptors, zones, placement rules,
 * ignorable set, merge policy, natural-sequence ladders).
 */
export function buildUniversalSeedRows(): SeedRow[] {
  const v = RULEBOOK_VERSION;
  const base = { scope: 'universal', status: 'active', version: v, createdFrom: 'bootstrap' } as const;
  const rows: SeedRow[] = [];

  for (const d of DESCRIPTORS) {
    rows.push({ ...base, type: 'descriptor', payload: { ...d }, naturalKey: d.key });
  }
  for (const z of ZONES) {
    // zone payload carries its ordered stages + rank (rulebook §2/§3) — the
    // assembler reconstructs stage order from here; no separate `stage` rows.
    rows.push({ ...base, type: 'zone', payload: { ...z, stages: [...z.stages] }, naturalKey: z.key });
  }
  for (const r of PLACEMENT_RULES) {
    rows.push({ ...base, type: 'placement_rule', payload: { ...r }, naturalKey: r.id });
  }
  rows.push({
    ...base,
    type: 'ignorable_set',
    payload: { key: SINGLETON_KEY, stopwords: [...IGNORABLE_STOPWORDS] },
    naturalKey: SINGLETON_KEY,
  });
  rows.push({
    ...base,
    type: 'merge_policy',
    payload: { key: SINGLETON_KEY, policy: MERGE_POLICY },
    naturalKey: SINGLETON_KEY,
  });
  for (const h of NATURAL_SEQUENCE_HINTS) {
    rows.push({
      ...base,
      type: 'value_ladder',
      payload: { kind: 'natural-sequence' satisfies ValueLadderKind, descriptorKey: h.descriptorKey, sequence: [...h.sequence] },
      naturalKey: h.descriptorKey,
    });
  }

  return rows;
}

/** Minimal structural contract for the part of Prisma client this seed touches —
 *  lets the adapter be tested with a synthetic client and keeps this lib free of
 *  a hard `@prisma/client` import. */
export interface CLREntryStore {
  cLREntry: {
    findMany(args: { where: { scope: string } }): Promise<Array<{ type: string; payload: unknown; version: number }>>;
    createMany(args: { data: Array<Record<string, unknown>> }): Promise<{ count: number }>;
  };
}

export interface SeedResult {
  /** rows newly inserted this run. */
  inserted: number;
  /** rows skipped because an identical (type, natural-key, version) already existed. */
  skipped: number;
}

/**
 * Idempotently seed the universal rows. Reads existing `scope="universal"` rows,
 * computes each one's (type, naturalKey, version) identity, and inserts only the
 * built rows whose identity is absent. Insert-only — never updates or deletes
 * (CLREntry is append-only; a universal-layer change bumps RULEBOOK_VERSION and
 * re-seeds the new version alongside the old).
 */
export async function seedUniversalRulebook(prisma: CLREntryStore): Promise<SeedResult> {
  const built = buildUniversalSeedRows();
  const existing = await prisma.cLREntry.findMany({ where: { scope: 'universal' } });

  const present = new Set<string>();
  for (const row of existing) {
    const key = identity(row.type, row.payload as Record<string, unknown>, row.version);
    present.add(key);
  }

  const toInsert = built.filter((r) => !present.has(identity(r.type, r.payload, r.version)));

  if (toInsert.length > 0) {
    await prisma.cLREntry.createMany({
      data: toInsert.map((r) => ({
        type: r.type,
        payload: r.payload,
        scope: r.scope,
        status: r.status,
        version: r.version,
        createdFrom: r.createdFrom,
      })),
    });
  }

  return { inserted: toInsert.length, skipped: built.length - toInsert.length };
}

function identity(type: string, payload: Record<string, unknown>, version: number): string {
  return `${type}::${naturalKeyOf(type, payload)}::v${version}`;
}
