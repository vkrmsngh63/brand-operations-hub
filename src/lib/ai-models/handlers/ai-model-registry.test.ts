// P-63 Phase 2a — node:test cases for the DB-backed AI-model registry handler.
// Run by `node --test --experimental-strip-types`. Spec:
// docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md §7 (Phase 2).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSeedCreateData,
  makeAiModelRegistryHandlers,
  resolveReorder,
  toWireShape,
  validateCreateBody,
  validateReorderBody,
  validateUpdateBody,
  type AiModelEntryCreateData,
  type AiModelRegistryPrismaLike,
  type AiModelRegistryRow,
  type RequestLike,
  type VerifyAuthFn,
} from './ai-model-registry.ts';
import { getAiModelRegistry } from '../registry.ts';

// --- helpers -----------------------------------------------------------------

function rowFrom(
  data: AiModelEntryCreateData,
  overrides: Partial<AiModelRegistryRow> = {}
): AiModelRegistryRow {
  return {
    id: data.id,
    provider: data.provider,
    providerLabel: data.providerLabel,
    modelId: data.modelId,
    displayLabel: data.displayLabel,
    thinkingOptions: data.thinkingOptions,
    menus: data.menus,
    pricing: data.pricing,
    enabled: data.enabled,
    runnableStatus: data.runnableStatus,
    sortOrder: data.sortOrder,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

type FakeState = {
  rows: AiModelRegistryRow[];
  createManyCalls: AiModelEntryCreateData[][];
};

function makeFakePrisma(seedRows: AiModelRegistryRow[] = []): {
  prisma: AiModelRegistryPrismaLike;
  state: FakeState;
} {
  const state: FakeState = {
    rows: [...seedRows],
    createManyCalls: [],
  };
  const prisma: AiModelRegistryPrismaLike = {
    aiModelRegistryEntry: {
      count: async () => state.rows.length,
      findMany: async () =>
        [...state.rows].sort((a, b) => a.sortOrder - b.sortOrder),
      findUnique: async ({ where }) =>
        state.rows.find((r) => r.id === where.id) ?? null,
      createMany: async ({ data }) => {
        state.createManyCalls.push(data);
        for (const d of data) {
          if (!state.rows.some((r) => r.id === d.id)) state.rows.push(rowFrom(d));
        }
        return { count: data.length };
      },
      create: async ({ data }) => {
        const row = rowFrom(data);
        state.rows.push(row);
        return row;
      },
      update: async ({ where, data }) => {
        const row = state.rows.find((r) => r.id === where.id);
        if (!row) throw new Error('not found');
        Object.assign(row, data);
        return row;
      },
      delete: async ({ where }) => {
        const i = state.rows.findIndex((r) => r.id === where.id);
        if (i < 0) throw new Error('not found');
        const [row] = state.rows.splice(i, 1);
        return row;
      },
    },
  };
  return { prisma, state };
}

const okAuth: VerifyAuthFn = async () => ({ userId: 'u-1', error: null });
const denyAuth: VerifyAuthFn = async () => ({
  userId: null,
  error: { status: 401, body: { error: 'no' } },
});

function makeReq(body?: unknown): RequestLike {
  return { json: async () => body };
}

function deps(prisma: AiModelRegistryPrismaLike, verifyAuth: VerifyAuthFn = okAuth) {
  return {
    prisma,
    verifyAuth,
    recordFlake: () => {},
    withRetry: <T>(fn: () => Promise<T>) => fn(),
  };
}

const goodModel = {
  provider: 'anthropic',
  providerLabel: 'Anthropic',
  modelId: 'claude-test-1',
  displayLabel: 'Claude Test 1',
  thinkingOptions: ['none', 'auto'],
  menus: ['review-analysis'],
  pricing: {
    inputPerMillion: 5,
    outputPerMillion: 25,
    cacheWrite5mPerMillion: 6.25,
    cacheReadPerMillion: 0.5,
  },
};

// --- toWireShape -------------------------------------------------------------

test('toWireShape coerces JSON columns and passes valid records through', () => {
  const row = rowFrom({
    ...goodModel,
    id: 'anthropic:claude-test-1',
    runnableStatus: 'runnable',
    enabled: true,
    sortOrder: 0,
  } as AiModelEntryCreateData);
  const rec = toWireShape(row);
  assert.equal(rec.id, 'anthropic:claude-test-1');
  assert.equal(rec.provider, 'anthropic');
  assert.deepEqual(rec.thinkingOptions, ['none', 'auto']);
  assert.deepEqual(rec.menus, ['review-analysis']);
  assert.equal(rec.pricing.inputPerMillion, 5);
  assert.equal(rec.runnableStatus, 'runnable');
});

test('toWireShape clamps runnable to integration-pending for a non-integrated provider', () => {
  const row = rowFrom({
    ...goodModel,
    provider: 'openai',
    providerLabel: 'OpenAI',
    id: 'openai:gpt-test',
    modelId: 'gpt-test',
    runnableStatus: 'runnable', // dishonest — openai has no adapter
    enabled: true,
    sortOrder: 0,
  } as unknown as AiModelEntryCreateData);
  const rec = toWireShape(row);
  assert.equal(rec.runnableStatus, 'integration-pending');
});

test('toWireShape drops unknown enum values in JSON arrays', () => {
  const row = rowFrom({
    ...goodModel,
    id: 'anthropic:claude-test-1',
    runnableStatus: 'runnable',
    enabled: true,
    sortOrder: 0,
  } as AiModelEntryCreateData, {
    thinkingOptions: ['auto', 'bogus', 42],
    menus: ['review-analysis', 'nope'],
  });
  const rec = toWireShape(row);
  assert.deepEqual(rec.thinkingOptions, ['auto']);
  assert.deepEqual(rec.menus, ['review-analysis']);
});

// --- buildSeedCreateData -----------------------------------------------------

test('buildSeedCreateData mirrors the in-code registry in order with sortOrder', () => {
  const seed = buildSeedCreateData();
  const reg = getAiModelRegistry();
  assert.equal(seed.length, reg.length);
  seed.forEach((s, i) => {
    assert.equal(s.id, reg[i].id);
    assert.equal(s.sortOrder, i);
  });
});

// --- validateCreateBody ------------------------------------------------------

test('validateCreateBody derives a provider-namespaced id and accepts a good body', () => {
  const r = validateCreateBody(goodModel);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.id, 'anthropic:claude-test-1');
    assert.equal(r.data.runnableStatus, 'runnable'); // anthropic IS integrated
  }
});

test('validateCreateBody clamps a new non-integrated provider model to integration-pending', () => {
  const r = validateCreateBody({
    ...goodModel,
    provider: 'google',
    providerLabel: 'Google',
    modelId: 'gemini-test',
    runnableStatus: 'runnable',
  });
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.data.runnableStatus, 'integration-pending');
});

test('validateCreateBody rejects bad provider / pricing / empty menus / empty thinking', () => {
  assert.equal(validateCreateBody({ ...goodModel, provider: 'x' }).ok, false);
  assert.equal(validateCreateBody({ ...goodModel, menus: [] }).ok, false);
  assert.equal(
    validateCreateBody({ ...goodModel, thinkingOptions: [] }).ok,
    false
  );
  assert.equal(
    validateCreateBody({
      ...goodModel,
      pricing: { ...goodModel.pricing, inputPerMillion: -1 },
    }).ok,
    false
  );
  assert.equal(validateCreateBody({ ...goodModel, modelId: '   ' }).ok, false);
  assert.equal(validateCreateBody('nope').ok, false);
});

// --- validateUpdateBody ------------------------------------------------------

test('validateUpdateBody rejects attempts to change identity', () => {
  assert.equal(validateUpdateBody({ provider: 'openai' }, 'anthropic').ok, false);
  assert.equal(validateUpdateBody({ modelId: 'x' }, 'anthropic').ok, false);
  assert.equal(validateUpdateBody({ id: 'x' }, 'anthropic').ok, false);
});

test('validateUpdateBody accepts a partial patch and clamps runnable by existing provider', () => {
  const r = validateUpdateBody(
    { displayLabel: 'New Label', runnableStatus: 'runnable' },
    'google' // not integrated
  );
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.displayLabel, 'New Label');
    assert.equal(r.data.runnableStatus, 'integration-pending');
  }
});

// --- GET (seed-on-read) ------------------------------------------------------

test('GET seeds an empty table from the in-code registry, then returns it', async () => {
  const { prisma, state } = makeFakePrisma([]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.GET(makeReq());
  assert.equal(res.status, 200);
  assert.equal(state.createManyCalls.length, 1);
  const body = res.body as { models: unknown[] };
  assert.equal(body.models.length, getAiModelRegistry().length);
});

test('GET does NOT re-seed a non-empty table', async () => {
  const existing = rowFrom(buildSeedCreateData()[0]);
  const { prisma, state } = makeFakePrisma([existing]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.GET(makeReq());
  assert.equal(res.status, 200);
  assert.equal(state.createManyCalls.length, 0);
});

test('GET returns the auth error when unauthenticated', async () => {
  const { prisma } = makeFakePrisma([]);
  const h = makeAiModelRegistryHandlers(deps(prisma, denyAuth));
  const res = await h.GET(makeReq());
  assert.equal(res.status, 401);
});

// --- POST --------------------------------------------------------------------

test('POST creates a new model (201) and appends sortOrder', async () => {
  const seedRows = buildSeedCreateData().map((d) => rowFrom(d));
  const { prisma, state } = makeFakePrisma(seedRows);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.POST(makeReq(goodModel));
  assert.equal(res.status, 201);
  const created = state.rows.find((r) => r.id === 'anthropic:claude-test-1');
  assert.ok(created);
  assert.equal(created?.sortOrder, seedRows.length);
});

test('POST rejects a duplicate id with 409', async () => {
  const validated = validateCreateBody(goodModel);
  assert.ok(validated.ok);
  const dup = rowFrom({ ...validated.data, sortOrder: 0 });
  const { prisma } = makeFakePrisma([dup]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.POST(makeReq(goodModel));
  assert.equal(res.status, 409);
});

test('POST rejects an invalid body with 400', async () => {
  const { prisma } = makeFakePrisma([]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.POST(makeReq({ ...goodModel, provider: 'bad' }));
  assert.equal(res.status, 400);
});

// --- PUT ---------------------------------------------------------------------

test('PUT edits an existing model (200)', async () => {
  const row = rowFrom(buildSeedCreateData()[0]);
  const { prisma, state } = makeFakePrisma([row]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.PUT(makeReq({ displayLabel: 'Renamed' }), {
    params: Promise.resolve({ id: row.id }),
  });
  assert.equal(res.status, 200);
  assert.equal(state.rows[0].displayLabel, 'Renamed');
});

test('PUT returns 404 for an unknown id', async () => {
  const { prisma } = makeFakePrisma([]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.PUT(makeReq({ displayLabel: 'x' }), {
    params: Promise.resolve({ id: 'anthropic:missing' }),
  });
  assert.equal(res.status, 404);
});

test('PUT returns 400 when trying to change identity', async () => {
  const row = rowFrom(buildSeedCreateData()[0]);
  const { prisma } = makeFakePrisma([row]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.PUT(makeReq({ modelId: 'other' }), {
    params: Promise.resolve({ id: row.id }),
  });
  assert.equal(res.status, 400);
});

// --- DELETE ------------------------------------------------------------------

test('DELETE removes an existing model (200)', async () => {
  const row = rowFrom(buildSeedCreateData()[0]);
  const { prisma, state } = makeFakePrisma([row]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.DELETE(makeReq(), {
    params: Promise.resolve({ id: row.id }),
  });
  assert.equal(res.status, 200);
  assert.equal(state.rows.length, 0);
});

test('DELETE returns 404 for an unknown id', async () => {
  const { prisma } = makeFakePrisma([]);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.DELETE(makeReq(), {
    params: Promise.resolve({ id: 'anthropic:missing' }),
  });
  assert.equal(res.status, 404);
});

// --- Reorder (P-64) ----------------------------------------------------------

test('validateReorderBody accepts an id array and rejects bad shapes', () => {
  assert.ok(validateReorderBody({ orderedIds: ['a', 'b'] }).ok);
  assert.equal(validateReorderBody({ orderedIds: [] }).ok, false);
  assert.equal(validateReorderBody({ orderedIds: 'x' }).ok, false);
  assert.equal(validateReorderBody({ orderedIds: ['a', 'a'] }).ok, false);
  assert.equal(validateReorderBody({ orderedIds: ['a', 2] }).ok, false);
  assert.equal(validateReorderBody({}).ok, false);
});

test('resolveReorder keeps requested order then appends omitted existing ids', () => {
  // Full reorder.
  assert.deepEqual(resolveReorder(['c', 'a', 'b'], ['a', 'b', 'c']), ['c', 'a', 'b']);
  // Partial request → omitted ids keep their relative order, appended at the end.
  assert.deepEqual(resolveReorder(['c'], ['a', 'b', 'c']), ['c', 'a', 'b']);
  // Unknown requested ids are dropped.
  assert.deepEqual(resolveReorder(['z', 'b'], ['a', 'b', 'c']), ['b', 'a', 'c']);
});

test('REORDER writes sortOrder by position and returns the new order', async () => {
  const seedRows = buildSeedCreateData().map((d) => rowFrom(d));
  const originalIds = seedRows.map((r) => r.id);
  const reversed = [...originalIds].reverse();
  const { prisma, state } = makeFakePrisma(seedRows);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.REORDER(makeReq({ orderedIds: reversed }));
  assert.equal(res.status, 200);
  const body = res.body as { models: { id: string }[] };
  assert.deepEqual(body.models.map((m) => m.id), reversed);
  // sortOrder persisted as 0..n-1 in the new order.
  for (let i = 0; i < reversed.length; i++) {
    const row = state.rows.find((r) => r.id === reversed[i]);
    assert.equal(row?.sortOrder, i);
  }
});

test('REORDER tolerates a partial id list without dropping models', async () => {
  const seedRows = buildSeedCreateData().map((d) => rowFrom(d));
  const last = seedRows[seedRows.length - 1].id;
  const { prisma } = makeFakePrisma(seedRows);
  const h = makeAiModelRegistryHandlers(deps(prisma));
  const res = await h.REORDER(makeReq({ orderedIds: [last] }));
  assert.equal(res.status, 200);
  const body = res.body as { models: { id: string }[] };
  assert.equal(body.models[0].id, last); // moved to top
  assert.equal(body.models.length, seedRows.length); // none lost
});

test('REORDER returns 400 on a bad body and 401 when unauthenticated', async () => {
  const { prisma } = makeFakePrisma(buildSeedCreateData().map((d) => rowFrom(d)));
  const h = makeAiModelRegistryHandlers(deps(prisma));
  assert.equal((await h.REORDER(makeReq({ orderedIds: [] }))).status, 400);
  const denied = makeAiModelRegistryHandlers(deps(prisma, denyAuth));
  assert.equal((await denied.REORDER(makeReq({ orderedIds: ['x'] }))).status, 401);
});
