// W#2 P-46 Workstream 3 — node:test cases for the per-user-per-project
// Competition Data table preferences handler. Mirrors url-text.test.ts +
// reviews-by-id.test.ts patterns.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractTablePreferencesPatch,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  makeUserTablePreferencesHandlers,
  toWireShape,
  type UserTablePreferencesHandlerDeps,
  type UserTablePreferencesRow,
  type VerifyProjectAuthFn,
} from './user-table-preferences.ts';
import type { RequestLike } from './shared.ts';

const FROZEN_DATE = new Date('2026-05-23T12:00:00Z');

function makeRow(
  overrides: Partial<UserTablePreferencesRow> = {}
): UserTablePreferencesRow {
  return {
    id: 'pref-1',
    userId: 'u-1',
    projectId: 'p-1',
    columnVisibility: {},
    columnWidths: {},
    fontSize: 14,
    rowOrder: [],
    lastUsedSortColumn: null,
    lastUsedSortDirection: null,
    categoryTableLayout: null,
    updatedAt: FROZEN_DATE,
    ...overrides,
  };
}

const authOk: VerifyProjectAuthFn = async () => ({
  userId: 'u-1',
  error: null,
});

const authForbidden: VerifyProjectAuthFn = async () => ({
  userId: null,
  error: { status: 403, body: { error: 'Access denied' } },
});

function makeFakePrisma(opts: {
  findUniqueResult?: UserTablePreferencesRow | null;
  upsertResult?: UserTablePreferencesRow;
  upsertThrows?: unknown;
  findUniqueThrows?: unknown;
} = {}) {
  const state = {
    findUniqueCalls: [] as Array<{ where: unknown }>,
    upsertCalls: [] as Array<{ where: unknown; create: unknown; update: unknown }>,
  };
  const prisma: UserTablePreferencesHandlerDeps['prisma'] = {
    userTablePreferences: {
      findUnique: async (args) => {
        state.findUniqueCalls.push(args);
        if (opts.findUniqueThrows) throw opts.findUniqueThrows;
        return opts.findUniqueResult ?? null;
      },
      upsert: async (args) => {
        state.upsertCalls.push(args);
        if (opts.upsertThrows) throw opts.upsertThrows;
        return opts.upsertResult ?? makeRow();
      },
    },
  };
  return { prisma, state };
}

function makeReq(body?: unknown): RequestLike {
  return {
    json: async () => {
      if (body === undefined) throw new Error('No body');
      return body;
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

function makeCtx(projectId = 'p-1') {
  return { params: Promise.resolve({ projectId }) };
}

const noopRecordFlake = (
  _op: string,
  _err: unknown,
  _ctx: object
): void => {};

const passThroughRetry = async <T>(fn: () => Promise<T>): Promise<T> => fn();

// ─── extractTablePreferencesPatch ──────────────────────────────────────

test('extract: empty object → ok with empty patch', () => {
  const result = extractTablePreferencesPatch({});
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.patch, {});
});

test('extract: non-object body → error', () => {
  for (const bad of [null, 'string', 42, true, []]) {
    const result = extractTablePreferencesPatch(bad);
    assert.equal(result.ok, false);
  }
});

test('extract: valid columnVisibility passes through', () => {
  const result = extractTablePreferencesPatch({
    columnVisibility: { url: true, productName: false },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch.columnVisibility, {
      url: true,
      productName: false,
    });
  }
});

test('extract: columnVisibility with non-boolean value → error', () => {
  const result = extractTablePreferencesPatch({
    columnVisibility: { url: 'yes' },
  });
  assert.equal(result.ok, false);
});

test('extract: columnVisibility as array → error', () => {
  const result = extractTablePreferencesPatch({
    columnVisibility: [],
  });
  assert.equal(result.ok, false);
});

test('extract: columnVisibility as null → error', () => {
  const result = extractTablePreferencesPatch({
    columnVisibility: null,
  });
  assert.equal(result.ok, false);
});

test('extract: valid columnWidths passes through', () => {
  const result = extractTablePreferencesPatch({
    columnWidths: { url: 200, productName: 320 },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch.columnWidths, {
      url: 200,
      productName: 320,
    });
  }
});

test('extract: columnWidths with non-integer → error', () => {
  const result = extractTablePreferencesPatch({
    columnWidths: { url: 200.5 },
  });
  assert.equal(result.ok, false);
});

test('extract: columnWidths with negative → error', () => {
  const result = extractTablePreferencesPatch({
    columnWidths: { url: -10 },
  });
  assert.equal(result.ok, false);
});

test('extract: fontSize within range', () => {
  for (const size of [FONT_SIZE_MIN, 14, FONT_SIZE_MAX]) {
    const result = extractTablePreferencesPatch({ fontSize: size });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.patch.fontSize, size);
  }
});

test('extract: fontSize out of range → error', () => {
  for (const bad of [FONT_SIZE_MIN - 1, FONT_SIZE_MAX + 1, 0, -5, 14.5]) {
    const result = extractTablePreferencesPatch({ fontSize: bad });
    assert.equal(result.ok, false);
  }
});

test('extract: rowOrder as array of strings', () => {
  const result = extractTablePreferencesPatch({
    rowOrder: ['url-1', 'url-2', 'url-3'],
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch.rowOrder, ['url-1', 'url-2', 'url-3']);
  }
});

test('extract: rowOrder with non-string entry → error', () => {
  const result = extractTablePreferencesPatch({
    rowOrder: ['url-1', 42],
  });
  assert.equal(result.ok, false);
});

test('extract: rowOrder as non-array → error', () => {
  const result = extractTablePreferencesPatch({ rowOrder: 'url-1' });
  assert.equal(result.ok, false);
});

test('extract: lastUsedSortColumn string or null', () => {
  for (const v of ['addedAt', null]) {
    const result = extractTablePreferencesPatch({ lastUsedSortColumn: v });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.patch.lastUsedSortColumn, v);
  }
});

test('extract: lastUsedSortColumn non-string non-null → error', () => {
  const result = extractTablePreferencesPatch({ lastUsedSortColumn: 42 });
  assert.equal(result.ok, false);
});

test('extract: lastUsedSortDirection asc/desc/null', () => {
  for (const v of ['asc', 'desc', null] as const) {
    const result = extractTablePreferencesPatch({ lastUsedSortDirection: v });
    assert.equal(result.ok, true);
  }
});

test('extract: lastUsedSortDirection invalid value → error', () => {
  for (const bad of ['ascending', 'DESC', '', 0]) {
    const result = extractTablePreferencesPatch({ lastUsedSortDirection: bad });
    assert.equal(result.ok, false);
  }
});

test('extract: unknown top-level keys silently ignored', () => {
  const result = extractTablePreferencesPatch({
    fontSize: 16,
    futureField: 'some-future-thing',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.patch.fontSize, 16);
    assert.equal(
      ('futureField' in result.patch as boolean),
      false
    );
  }
});

test('extract: full payload', () => {
  const result = extractTablePreferencesPatch({
    columnVisibility: { url: true },
    columnWidths: { url: 250 },
    fontSize: 16,
    rowOrder: ['url-1'],
    lastUsedSortColumn: 'addedAt',
    lastUsedSortDirection: 'desc',
  });
  assert.equal(result.ok, true);
});

// ─── categoryTableLayout (P-49 W5 interactive batch) ───────────────────

test('extract: categoryTableLayout valid object normalizes', () => {
  const result = extractTablePreferencesPatch({
    categoryTableLayout: {
      categoryOrder: ['Knives'],
      rowOrderByUrlId: ['u1', 'u2'],
      hiddenUrlIds: ['u3'],
      hiddenCategoryKeys: ['Old'],
    },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch.categoryTableLayout, {
      categoryOrder: ['Knives'],
      rowOrderByUrlId: ['u1', 'u2'],
      hiddenUrlIds: ['u3'],
      hiddenCategoryKeys: ['Old'],
    });
  }
});

test('extract: categoryTableLayout null clears the memory', () => {
  const result = extractTablePreferencesPatch({ categoryTableLayout: null });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.patch.categoryTableLayout, null);
});

test('extract: categoryTableLayout bad shape → error', () => {
  assert.equal(
    extractTablePreferencesPatch({ categoryTableLayout: 'nope' }).ok,
    false
  );
  assert.equal(
    extractTablePreferencesPatch({ categoryTableLayout: { categoryOrder: 'A' } }).ok,
    false
  );
  assert.equal(
    extractTablePreferencesPatch({ categoryTableLayout: { hiddenUrlIds: ['ok', 9] } }).ok,
    false
  );
});

// ─── toWireShape ──────────────────────────────────────────────────────

test('toWireShape: coerces JsonValue columns to typed shapes', () => {
  const row = makeRow({
    columnVisibility: { url: true, name: false },
    columnWidths: { url: 200 },
    rowOrder: ['url-1', 'url-2'],
    lastUsedSortDirection: 'desc',
  });
  const wire = toWireShape(row);
  assert.deepEqual(wire.columnVisibility, { url: true, name: false });
  assert.deepEqual(wire.columnWidths, { url: 200 });
  assert.deepEqual(wire.rowOrder, ['url-1', 'url-2']);
  assert.equal(wire.lastUsedSortDirection, 'desc');
  assert.equal(wire.updatedAt, FROZEN_DATE.toISOString());
});

test('toWireShape: categoryTableLayout null → null; object coerced', () => {
  assert.equal(toWireShape(makeRow({ categoryTableLayout: null })).categoryTableLayout, null);
  const wire = toWireShape(
    makeRow({
      categoryTableLayout: {
        categoryOrder: ['Knives'],
        rowOrderByUrlId: ['u1'],
        hiddenUrlIds: [],
        hiddenCategoryKeys: ['Old'],
      } as unknown as import('@prisma/client').Prisma.JsonValue,
    })
  );
  assert.deepEqual(wire.categoryTableLayout, {
    categoryOrder: ['Knives'],
    rowOrderByUrlId: ['u1'],
    hiddenUrlIds: [],
    hiddenCategoryKeys: ['Old'],
  });
});

test('toWireShape: bad JSON shapes in DB → defaults', () => {
  const row = makeRow({
    // Hand-edited DB might have garbage; toWireShape falls back to empty.
    columnVisibility: 'not-an-object' as unknown as Record<string, boolean>,
    columnWidths: ['arr', 'instead'] as unknown as Record<string, number>,
    rowOrder: 'not-an-array' as unknown as string[],
    lastUsedSortDirection: 'sideways',
  });
  const wire = toWireShape(row);
  assert.deepEqual(wire.columnVisibility, {});
  assert.deepEqual(wire.columnWidths, {});
  assert.deepEqual(wire.rowOrder, []);
  assert.equal(wire.lastUsedSortDirection, null);
});

test('toWireShape: filters non-boolean values from columnVisibility map', () => {
  const row = makeRow({
    columnVisibility: { good: true, bad: 1 as unknown as boolean } as Record<
      string,
      boolean
    >,
  });
  const wire = toWireShape(row);
  assert.deepEqual(wire.columnVisibility, { good: true });
});

// ─── GET handler ──────────────────────────────────────────────────────

test('GET: forbidden surfaces auth error', async () => {
  const { prisma } = makeFakePrisma();
  const { GET } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authForbidden,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 403);
});

test('GET: 404 when no prefs row exists', async () => {
  const { prisma } = makeFakePrisma({ findUniqueResult: null });
  const { GET } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 404);
});

test('GET: 200 with wire shape when row exists', async () => {
  const row = makeRow({ fontSize: 16, lastUsedSortColumn: 'addedAt' });
  const { prisma, state } = makeFakePrisma({ findUniqueResult: row });
  const { GET } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 200);
  assert.equal(
    (result.body as { fontSize: number }).fontSize,
    16
  );
  assert.equal(state.findUniqueCalls.length, 1);
  assert.deepEqual(state.findUniqueCalls[0].where, {
    userId_projectId: { userId: 'u-1', projectId: 'p-1' },
  });
});

test('GET: 500 when prisma throws', async () => {
  const { prisma } = makeFakePrisma({
    findUniqueThrows: new Error('db down'),
  });
  let flakeCalls = 0;
  const { GET } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: () => {
      flakeCalls++;
    },
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 500);
  assert.equal(flakeCalls, 1);
});

// ─── PUT handler ──────────────────────────────────────────────────────

test('PUT: forbidden surfaces auth error', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authForbidden,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({}), makeCtx());
  assert.equal(result.status, 403);
});

test('PUT: invalid JSON body → 400', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  // No body → req.json() throws
  const result = await PUT(makeReq(), makeCtx());
  assert.equal(result.status, 400);
});

test('PUT: invalid shape (fontSize out of range) → 400', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ fontSize: 99 }), makeCtx());
  assert.equal(result.status, 400);
});

test('PUT: valid partial patch → 200, upsert called with patched fields only in update', async () => {
  const upsertResult = makeRow({
    fontSize: 16,
    columnVisibility: { url: true },
  });
  const { prisma, state } = makeFakePrisma({ upsertResult });
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(
    makeReq({ fontSize: 16, columnVisibility: { url: true } }),
    makeCtx()
  );
  assert.equal(result.status, 200);
  assert.equal((result.body as { fontSize: number }).fontSize, 16);
  assert.equal(state.upsertCalls.length, 1);
  const call = state.upsertCalls[0];
  // Update only carries supplied fields
  assert.deepEqual(call.update, {
    fontSize: 16,
    columnVisibility: { url: true },
  });
  // Create populates required defaults for fields the patch didn't supply
  const create = call.create as Record<string, unknown>;
  assert.equal(create.userId, 'u-1');
  assert.equal(create.projectId, 'p-1');
  assert.deepEqual(create.columnWidths, {});
  assert.equal(create.fontSize, 16);
  assert.deepEqual(create.rowOrder, []);
});

test('PUT: empty patch → 200, upsert update is empty (no-op refresh)', async () => {
  const { prisma, state } = makeFakePrisma();
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({}), makeCtx());
  assert.equal(result.status, 200);
  assert.deepEqual(state.upsertCalls[0].update, {});
});

test('PUT: 500 when prisma upsert throws', async () => {
  const { prisma } = makeFakePrisma({
    upsertThrows: new Error('write fail'),
  });
  let flakeCalls = 0;
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: () => {
      flakeCalls++;
    },
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ fontSize: 14 }), makeCtx());
  assert.equal(result.status, 500);
  assert.equal(flakeCalls, 1);
});

test('PUT: lastUsedSortDirection null is preserved (clear sort)', async () => {
  const { prisma, state } = makeFakePrisma();
  const { PUT } = makeUserTablePreferencesHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(
    makeReq({
      lastUsedSortColumn: null,
      lastUsedSortDirection: null,
    }),
    makeCtx()
  );
  assert.equal(result.status, 200);
  assert.deepEqual(state.upsertCalls[0].update, {
    lastUsedSortColumn: null,
    lastUsedSortDirection: null,
  });
});
