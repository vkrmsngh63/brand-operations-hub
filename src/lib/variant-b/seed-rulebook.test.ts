/**
 * Tests for the universal-layer CLR seed.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/variant-b/seed-rulebook.test.ts
 *
 * Covers the pure row-builder (completeness + identity) and the idempotency of
 * the DB adapter against a synthetic in-memory store.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DESCRIPTORS,
  ZONES,
  PLACEMENT_RULES,
  NATURAL_SEQUENCE_HINTS,
  RULEBOOK_VERSION,
} from './rulebook.ts';
import {
  buildUniversalSeedRows,
  naturalKeyOf,
  seedUniversalRulebook,
  SINGLETON_KEY,
  type CLREntryStore,
} from './seed-rulebook.ts';

// ---- synthetic in-memory CLREntry store ----
function makeStore(seed: Array<{ type: string; payload: Record<string, unknown>; version: number }> = []): {
  store: CLREntryStore;
  rows: Array<Record<string, unknown>>;
} {
  const rows: Array<Record<string, unknown>> = seed.map((r) => ({ ...r, scope: 'universal', status: 'active' }));
  const store: CLREntryStore = {
    cLREntry: {
      async findMany({ where }) {
        return rows
          .filter((r) => r.scope === where.scope)
          .map((r) => ({ type: r.type as string, payload: r.payload, version: r.version as number }));
      },
      async createMany({ data }) {
        for (const d of data) rows.push({ ...d });
        return { count: data.length };
      },
    },
  };
  return { store, rows };
}

test('builds a row for every descriptor, zone, placement rule + 2 singletons + ladders', () => {
  const rows = buildUniversalSeedRows();
  const expected =
    DESCRIPTORS.length + ZONES.length + PLACEMENT_RULES.length + 2 /* ignorable+merge */ + NATURAL_SEQUENCE_HINTS.length;
  assert.equal(rows.length, expected);

  const byType = (t: string) => rows.filter((r) => r.type === t);
  assert.equal(byType('descriptor').length, DESCRIPTORS.length);
  assert.equal(byType('zone').length, ZONES.length);
  assert.equal(byType('placement_rule').length, PLACEMENT_RULES.length);
  assert.equal(byType('ignorable_set').length, 1);
  assert.equal(byType('merge_policy').length, 1);
  assert.equal(byType('value_ladder').length, NATURAL_SEQUENCE_HINTS.length);
});

test('every row is scope=universal, status=active, version=RULEBOOK_VERSION, createdFrom=bootstrap', () => {
  for (const r of buildUniversalSeedRows()) {
    assert.equal(r.scope, 'universal');
    assert.equal(r.status, 'active');
    assert.equal(r.version, RULEBOOK_VERSION);
    assert.equal(r.createdFrom, 'bootstrap');
  }
});

test('naturalKeyOf round-trips each built row to its declared naturalKey', () => {
  for (const r of buildUniversalSeedRows()) {
    assert.equal(naturalKeyOf(r.type, r.payload), r.naturalKey, `naturalKey mismatch for ${r.type}`);
  }
});

test('natural keys are unique within each type', () => {
  const rows = buildUniversalSeedRows();
  const seen = new Set<string>();
  for (const r of rows) {
    const id = `${r.type}::${r.naturalKey}`;
    assert.ok(!seen.has(id), `duplicate natural key ${id}`);
    seen.add(id);
  }
});

test('singleton rows use the fixed SINGLETON_KEY', () => {
  const rows = buildUniversalSeedRows();
  assert.equal(rows.find((r) => r.type === 'ignorable_set')!.naturalKey, SINGLETON_KEY);
  assert.equal(rows.find((r) => r.type === 'merge_policy')!.naturalKey, SINGLETON_KEY);
});

test('value_ladder rows carry the natural-sequence discriminator + sequence', () => {
  const ladder = buildUniversalSeedRows().find((r) => r.type === 'value_ladder')!;
  assert.equal(ladder.payload.kind, 'natural-sequence');
  assert.ok(Array.isArray(ladder.payload.sequence));
});

test('seed into an empty store inserts everything once', async () => {
  const { store, rows } = makeStore();
  const result = await seedUniversalRulebook(store);
  assert.equal(result.skipped, 0);
  assert.equal(result.inserted, buildUniversalSeedRows().length);
  assert.equal(rows.length, buildUniversalSeedRows().length);
});

test('seed is idempotent — a second run inserts nothing', async () => {
  const { store, rows } = makeStore();
  await seedUniversalRulebook(store);
  const countAfterFirst = rows.length;
  const second = await seedUniversalRulebook(store);
  assert.equal(second.inserted, 0);
  assert.equal(second.skipped, buildUniversalSeedRows().length);
  assert.equal(rows.length, countAfterFirst, 'no duplicate rows on re-run');
});

test('seed inserts only the missing rows when the store is partially populated', async () => {
  // pre-seed with just the descriptor rows at the current version
  const descriptorRows = buildUniversalSeedRows()
    .filter((r) => r.type === 'descriptor')
    .map((r) => ({ type: r.type, payload: r.payload, version: r.version }));
  const { store } = makeStore(descriptorRows);
  const result = await seedUniversalRulebook(store);
  assert.equal(result.skipped, DESCRIPTORS.length);
  assert.equal(result.inserted, buildUniversalSeedRows().length - DESCRIPTORS.length);
});
