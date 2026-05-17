// W#2 P-28 — node:test cases for the cascade-counts handler.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  makeCascadeCountsHandlers,
  type CascadeCountsHandlerDeps,
  type CascadeCountsPrismaLike,
  type CascadeCountsResponse,
  type Ctx,
  type RequestLike,
  type VerifyAuthFn,
} from './cascade-counts.ts';

function makeFakePrisma(opts: {
  parent?: { id: string } | null;
  textCount?: number;
  imageCount?: number;
  textCountThrows?: unknown;
  imageCountThrows?: unknown;
  findFirstThrows?: unknown;
} = {}): {
  prisma: CascadeCountsPrismaLike;
  state: {
    findFirstCalls: Array<{ where: object; select?: object }>;
    textCountCalls: Array<{ where: object }>;
    imageCountCalls: Array<{ where: object }>;
  };
} {
  const state = {
    findFirstCalls: [] as Array<{ where: object; select?: object }>,
    textCountCalls: [] as Array<{ where: object }>,
    imageCountCalls: [] as Array<{ where: object }>,
  };
  const prisma: CascadeCountsPrismaLike = {
    competitorUrl: {
      findFirst: async (args) => {
        state.findFirstCalls.push(args);
        if (opts.findFirstThrows !== undefined) throw opts.findFirstThrows;
        return opts.parent === undefined ? { id: 'url-1' } : opts.parent;
      },
    },
    capturedText: {
      count: async (args) => {
        state.textCountCalls.push(args);
        if (opts.textCountThrows !== undefined) throw opts.textCountThrows;
        return opts.textCount ?? 0;
      },
    },
    capturedImage: {
      count: async (args) => {
        state.imageCountCalls.push(args);
        if (opts.imageCountThrows !== undefined) throw opts.imageCountThrows;
        return opts.imageCount ?? 0;
      },
    },
  };
  return { prisma, state };
}

const authOk: VerifyAuthFn = async () => ({
  projectWorkflowId: 'pw-1',
  userId: 'u-1',
  error: null,
});

const auth401: VerifyAuthFn = async () => ({
  projectWorkflowId: null,
  userId: null,
  error: { status: 401, body: { error: 'Unauthorized' } },
});

function makeReq(): RequestLike {
  return {
    json: async () => ({}),
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

const ctx: Ctx = {
  params: Promise.resolve({ projectId: 'proj-1', urlId: 'url-1' }),
};

function makeDeps(
  overrides: Partial<CascadeCountsHandlerDeps> = {}
): CascadeCountsHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const { prisma } = makeFakePrisma();
  const deps: CascadeCountsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    recordFlake: (op, err, c) => {
      recordFlakeCalls.push({ op, err, ctx: c });
    },
    withRetry: (fn) => fn(),
    ...overrides,
  };
  return Object.assign(deps, { recordFlakeCalls });
}

// ─── 401 / auth gate ─────────────────────────────────────────────────────

test('GET 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 401);
  assert.deepEqual(r.body, { error: 'Unauthorized' });
});

test('GET 401 short-circuits before touching prisma', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps = makeDeps({ verifyAuth: auth401, prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  assert.equal(state.findFirstCalls.length, 0);
  assert.equal(state.textCountCalls.length, 0);
  assert.equal(state.imageCountCalls.length, 0);
});

// ─── 404 / missing parent URL ────────────────────────────────────────────

test('GET 404 when the URL does not exist for this projectWorkflow', async () => {
  const { prisma } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 404);
  assert.deepEqual(r.body, { error: 'Competitor URL not found' });
});

test('GET 404 does not run the count queries', async () => {
  const { prisma, state } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  assert.equal(state.findFirstCalls.length, 1);
  assert.equal(state.textCountCalls.length, 0);
  assert.equal(state.imageCountCalls.length, 0);
});

test('GET 404 ownership filter — findFirst is scoped by projectWorkflowId', async () => {
  const { prisma, state } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  const call = state.findFirstCalls[0];
  assert.deepEqual(call.where, { id: 'url-1', projectWorkflowId: 'pw-1' });
  assert.deepEqual(call.select, { id: true });
});

// ─── 200 / happy paths ───────────────────────────────────────────────────

test('GET 200 returns { texts: 0, images: 0 } when URL has no children', async () => {
  const { prisma } = makeFakePrisma({ textCount: 0, imageCount: 0 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { texts: 0, images: 0 });
});

test('GET 200 returns positive counts', async () => {
  const { prisma } = makeFakePrisma({ textCount: 7, imageCount: 12 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { texts: 7, images: 12 });
});

test('GET 200 returns texts-only counts', async () => {
  const { prisma } = makeFakePrisma({ textCount: 5, imageCount: 0 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { texts: 5, images: 0 });
});

test('GET 200 returns images-only counts', async () => {
  const { prisma } = makeFakePrisma({ textCount: 0, imageCount: 3 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { texts: 0, images: 3 });
});

test('GET 200 body shape — both fields present and numeric', async () => {
  const { prisma } = makeFakePrisma({ textCount: 2, imageCount: 4 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  const body = r.body as CascadeCountsResponse;
  assert.equal(typeof body.texts, 'number');
  assert.equal(typeof body.images, 'number');
  assert.equal(Object.keys(body).length, 2);
});

// ─── Count-query filtering ──────────────────────────────────────────────

test('GET — both count queries filter by competitorUrlId', async () => {
  const { prisma, state } = makeFakePrisma({ textCount: 1, imageCount: 1 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  assert.equal(state.textCountCalls.length, 1);
  assert.equal(state.imageCountCalls.length, 1);
  assert.deepEqual(state.textCountCalls[0].where, { competitorUrlId: 'url-1' });
  assert.deepEqual(state.imageCountCalls[0].where, { competitorUrlId: 'url-1' });
});

test('GET — counts run in parallel via Promise.all (both methods invoked)', async () => {
  const { prisma, state } = makeFakePrisma({ textCount: 1, imageCount: 2 });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  // Both counts invoked exactly once each.
  assert.equal(state.textCountCalls.length, 1);
  assert.equal(state.imageCountCalls.length, 1);
});

// ─── 500 / database flake paths ──────────────────────────────────────────

test('GET 500 when findFirst throws', async () => {
  const { prisma } = makeFakePrisma({ findFirstThrows: new Error('db down') });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { error: 'Failed to fetch cascade counts' });
});

test('GET 500 records flake when findFirst throws', async () => {
  const { prisma } = makeFakePrisma({ findFirstThrows: new Error('db down') });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  assert.equal(deps.recordFlakeCalls.length, 1);
  assert.match(deps.recordFlakeCalls[0].op, /cascade-counts/);
});

test('GET 500 when capturedText.count throws', async () => {
  const { prisma } = makeFakePrisma({ textCountThrows: new Error('count failed') });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 500);
});

test('GET 500 when capturedImage.count throws', async () => {
  const { prisma } = makeFakePrisma({
    imageCountThrows: new Error('count failed'),
  });
  const deps = makeDeps({ prisma });
  const { GET } = makeCascadeCountsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 500);
});

// ─── withRetry passthrough ───────────────────────────────────────────────

test('GET — every Prisma call goes through withRetry', async () => {
  let retryCalls = 0;
  const { prisma } = makeFakePrisma({ textCount: 1, imageCount: 2 });
  const deps = makeDeps({
    prisma,
    withRetry: (fn) => {
      retryCalls += 1;
      return fn();
    },
  });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  // findFirst + capturedText.count + capturedImage.count = 3.
  assert.equal(retryCalls, 3);
});

// ─── Project-scope isolation ─────────────────────────────────────────────

test('GET — second project cannot read first project counts (projectWorkflowId in findFirst)', async () => {
  const { prisma, state } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma, verifyAuth: async () => ({
    projectWorkflowId: 'pw-OTHER',
    userId: 'u-other',
    error: null,
  }) });
  const { GET } = makeCascadeCountsHandlers(deps);
  await GET(makeReq(), ctx);
  // findFirst's where filter must include the caller's projectWorkflowId,
  // so a forged urlId from a different project returns 404.
  const call = state.findFirstCalls[0];
  assert.equal(
    (call.where as { projectWorkflowId: string }).projectWorkflowId,
    'pw-OTHER'
  );
});
