// W#2 P-46 Workstream 2 Session 4 — node:test cases for the captured-reviews-
// under-URL collection handlers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  makeUrlReviewsHandlers,
  type CapturedReviewRow,
  type Ctx,
  type RequestLike,
  type UrlReviewsHandlerDeps,
  type VerifyAuthFn,
} from './url-reviews.ts';

const FROZEN_DATE = new Date('2026-05-28T12:00:00Z');
const FROZEN_REVIEW_DATE = new Date('2026-04-12T00:00:00Z');

function makeRow(overrides: Partial<CapturedReviewRow> = {}): CapturedReviewRow {
  return {
    id: 'rev-1',
    clientId: 'client-1',
    competitorUrlId: 'url-1',
    starRating: 5,
    title: null,
    body: 'great product',
    reviewerName: null,
    reviewDate: null,
    tags: [],
    analysis: {},
    source: 'manual',
    // P-49 Workstream 2 (2026-05-26) — extension-scrape additive columns per §A.16.
    sortRank: null,
    helpfulCount: null,
    platform: null,
    addedBy: 'u-1',
    addedAt: FROZEN_DATE,
    updatedAt: FROZEN_DATE,
    ...overrides,
  };
}

function makeFakePrisma(opts: {
  parent?: { id: string } | null;
  createImpl?: (
    args: { data: Prisma.CapturedReviewUncheckedCreateInput }
  ) => Promise<CapturedReviewRow>;
  findUniqueResult?: CapturedReviewRow | null;
  findManyResult?: CapturedReviewRow[];
} = {}): { prisma: UrlReviewsHandlerDeps['prisma']; state: {
  createCalls: Array<{ data: Prisma.CapturedReviewUncheckedCreateInput }>;
  findUniqueCalls: Array<{ where: object }>;
  findManyCalls: Array<{ where: object; orderBy: object }>;
  findFirstCalls: Array<{ where: object; select?: object }>;
} } {
  const state = {
    createCalls: [] as Array<{ data: Prisma.CapturedReviewUncheckedCreateInput }>,
    findUniqueCalls: [] as Array<{ where: object }>,
    findManyCalls: [] as Array<{ where: object; orderBy: object }>,
    findFirstCalls: [] as Array<{ where: object; select?: object }>,
  };
  const createImpl =
    opts.createImpl ??
    (async ({ data }: { data: Prisma.CapturedReviewUncheckedCreateInput }) =>
      makeRow({
        id: 'rev-' + (state.createCalls.length + 1),
        clientId: data.clientId,
        competitorUrlId: data.competitorUrlId,
        starRating: data.starRating as number,
        title: (data.title as string | null | undefined) ?? null,
        body: data.body as string,
        reviewerName: (data.reviewerName as string | null | undefined) ?? null,
        reviewDate: (data.reviewDate as Date | null | undefined) ?? null,
        tags: (data.tags as Prisma.JsonValue) ?? [],
        analysis: (data.analysis as Prisma.JsonValue) ?? {},
        source: (data.source as string) ?? 'manual',
        addedBy: data.addedBy,
      }));
  const prisma: UrlReviewsHandlerDeps['prisma'] = {
    competitorUrl: {
      findFirst: async (args) => {
        state.findFirstCalls.push(args);
        return opts.parent === undefined ? { id: 'url-1' } : opts.parent;
      },
    },
    capturedReview: {
      create: async (args) => {
        state.createCalls.push(args);
        return createImpl(args);
      },
      findUnique: async (args) => {
        state.findUniqueCalls.push(args);
        return opts.findUniqueResult ?? null;
      },
      findMany: async (args) => {
        state.findManyCalls.push(args);
        return opts.findManyResult ?? [];
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

function makeReq(opts: { body?: unknown; jsonThrows?: boolean } = {}): RequestLike {
  return {
    json: async () => {
      if (opts.jsonThrows) throw new SyntaxError('bad json');
      return opts.body ?? {};
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

const ctx: Ctx = {
  params: Promise.resolve({ projectId: 'proj-1', urlId: 'url-1' }),
};

function makeDeps(
  overrides: Partial<UrlReviewsHandlerDeps> = {}
): UrlReviewsHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
  markActiveCalls: string[];
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const markActiveCalls: string[] = [];
  const { prisma } = makeFakePrisma();
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async (projectId, workflow) => {
      markActiveCalls.push(`${projectId}|${workflow}`);
    },
    recordFlake: (op, err, c) => {
      recordFlakeCalls.push({ op, err, ctx: c });
    },
    withRetry: (fn) => fn(),
    ...overrides,
  };
  return Object.assign(deps, { recordFlakeCalls, markActiveCalls });
}

// ─── POST tests ─────────────────────────────────────────────────────────

test('POST 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 5, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 401);
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'Invalid JSON body' });
});

test('POST 400 when clientId is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(makeReq({ body: { starRating: 5, body: 'great' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /clientId/i);
});

test('POST 400 when starRating is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1', body: 'great' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /starRating/i);
});

test('POST 400 when starRating is out of range', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 6, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /starRating/i);
});

test('POST 400 when starRating is not an integer', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 4.5, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 400);
});

test('POST 400 when body is empty string', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 5, body: '   ' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /body/i);
});

test('POST 400 when tags is not a string array', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: { clientId: 'c1', starRating: 5, body: 'great', tags: [1, 2] },
    }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /tags/i);
});

test('POST 400 when reviewDate is unparseable', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: {
        clientId: 'c1',
        starRating: 5,
        body: 'great',
        reviewDate: 'not-a-date',
      },
    }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /reviewDate/i);
});

test('POST 400 when analysis is null (must be JSON object)', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: { clientId: 'c1', starRating: 5, body: 'great', analysis: null },
    }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /analysis/i);
});

test('POST 404 when parent URL is not found', async () => {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const { prisma } = makeFakePrisma({ parent: null });
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: (op, err, c) => recordFlakeCalls.push({ op, err, ctx: c }),
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 5, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 404);
});

test('POST 201 happy path — default source manual', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: {
        clientId: 'c1',
        starRating: 4,
        body: 'good product',
        reviewerName: 'Jane Doe',
        reviewDate: FROZEN_REVIEW_DATE.toISOString(),
        tags: ['shipping', 'quality'],
      },
    }),
    ctx
  );
  assert.equal(r.status, 201);
  const wire = r.body as { starRating: number; source: string; reviewerName: string | null; reviewDate: string | null; tags: string[] };
  assert.equal(wire.starRating, 4);
  assert.equal(wire.source, 'manual');
  assert.equal(wire.reviewerName, 'Jane Doe');
  assert.equal(wire.reviewDate, FROZEN_REVIEW_DATE.toISOString());
  assert.deepEqual(wire.tags, ['shipping', 'quality']);
  assert.equal(state.createCalls.length, 1);
  assert.equal(state.createCalls[0].data.source, 'manual');
});

// P-49 W5 Fix Session B (2026-05-30; Q3) — review title pass-through.
test('POST 201 persists title when provided + trims it; returns it on the wire', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: {
        clientId: 'c1',
        starRating: 4,
        title: '  Great headline  ',
        body: 'good product',
      },
    }),
    ctx
  );
  assert.equal(r.status, 201);
  assert.equal(state.createCalls[0].data.title, 'Great headline');
  const wire = r.body as { title: string | null };
  assert.equal(wire.title, 'Great headline');
});

test('POST 201 stores title as null when omitted or blank', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r1 = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 4, body: 'b' } }),
    ctx
  );
  assert.equal(r1.status, 201);
  assert.equal(state.createCalls[0].data.title, null);
  const r2 = await POST(
    makeReq({ body: { clientId: 'c2', starRating: 4, title: '   ', body: 'b' } }),
    ctx
  );
  assert.equal(r2.status, 201);
  assert.equal(state.createCalls[1].data.title, null);
});

test('POST 400 when title is a non-string non-null value', async () => {
  const { prisma } = makeFakePrisma();
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({
      body: { clientId: 'c1', starRating: 4, body: 'b', title: 123 },
    }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /title must be a string or null/);
});

test('POST 200 idempotent on P2002 — returns existing row by clientId', async () => {
  const existing = makeRow({ id: 'rev-existing', clientId: 'c1' });
  const { prisma } = makeFakePrisma({
    createImpl: async () => {
      throw new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: 'test',
      });
    },
    findUniqueResult: existing,
  });
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 5, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 200);
  assert.equal((r.body as { id: string }).id, 'rev-existing');
});

test('POST 500 on unhandled Prisma error', async () => {
  const recordFlakeCalls: Array<{ op: string }> = [];
  const { prisma } = makeFakePrisma({
    createImpl: async () => {
      throw new Error('db down');
    },
  });
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: (op) => recordFlakeCalls.push({ op }),
    withRetry: (fn) => fn(),
  };
  const { POST } = makeUrlReviewsHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', starRating: 5, body: 'great' } }),
    ctx
  );
  assert.equal(r.status, 500);
  assert.equal(recordFlakeCalls.length, 1);
});

// ─── GET tests ──────────────────────────────────────────────────────────

test('GET 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { GET } = makeUrlReviewsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 401);
});

test('GET 404 when parent URL is not found', async () => {
  const { prisma } = makeFakePrisma({ parent: null });
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { GET } = makeUrlReviewsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 404);
});

test('GET 200 returns rows ordered by addedAt', async () => {
  const rows = [
    makeRow({ id: 'rev-1', clientId: 'c1', starRating: 5 }),
    makeRow({ id: 'rev-2', clientId: 'c2', starRating: 3, reviewerName: 'Bob', reviewDate: FROZEN_REVIEW_DATE }),
  ];
  const { prisma, state } = makeFakePrisma({ findManyResult: rows });
  const deps: UrlReviewsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { GET } = makeUrlReviewsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  const wire = r.body as Array<{ id: string; reviewDate: string | null }>;
  assert.equal(wire.length, 2);
  assert.equal(wire[0].id, 'rev-1');
  assert.equal(wire[1].reviewDate, FROZEN_REVIEW_DATE.toISOString());
  // orderBy contract — must include addedAt asc.
  assert.deepEqual(state.findManyCalls[0].orderBy, [{ addedAt: 'asc' }]);
});
