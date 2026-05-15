// W#2 P-31 — node:test cases for the urls collection handlers.
//
// Run with:
//   node --test --experimental-strip-types \
//     src/lib/competition-scraping/handlers/urls.test.ts
//
// Coverage: 200/201 happy paths, 200 P2002 idempotency lookup, 400 every
// validation branch (platform / url / source / JSON shape), 401 auth gate,
// 500 prisma failure, GET filter validation.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  makeUrlsHandlers,
  type CompetitorUrlRow,
  type Ctx,
  type RequestLike,
  type UrlsHandlerDeps,
  type VerifyAuthFn,
} from './urls.ts';

// ─── Fixtures ────────────────────────────────────────────────────────────

const FROZEN_DATE = new Date('2026-05-15T12:00:00Z');

function makeRow(overrides: Partial<CompetitorUrlRow> = {}): CompetitorUrlRow {
  return {
    id: 'url-1',
    projectWorkflowId: 'pw-1',
    platform: 'amazon',
    url: 'https://www.amazon.com/dp/B000TEST',
    competitionCategory: null,
    productName: null,
    brandName: null,
    resultsPageRank: null,
    productStarRating: null,
    sellerStarRating: null,
    numProductReviews: null,
    numSellerReviews: null,
    isSponsoredAd: false,
    customFields: {},
    source: 'extension',
    addedBy: 'u-1',
    addedAt: FROZEN_DATE,
    updatedAt: FROZEN_DATE,
    ...overrides,
  };
}

type FakePrismaState = {
  create: { calls: Array<{ data: Prisma.CompetitorUrlUncheckedCreateInput }> };
  findUnique: { calls: Array<{ where: object }>; result: CompetitorUrlRow | null };
  findMany: { calls: Array<{ where: object; orderBy: object }>; result: CompetitorUrlRow[] };
  createImpl: (
    args: { data: Prisma.CompetitorUrlUncheckedCreateInput }
  ) => Promise<CompetitorUrlRow>;
};

function makeFakePrisma(opts: {
  createRow?: (data: Prisma.CompetitorUrlUncheckedCreateInput) => CompetitorUrlRow;
  createImpl?: FakePrismaState['createImpl'];
  findUniqueResult?: CompetitorUrlRow | null;
  findManyResult?: CompetitorUrlRow[];
} = {}) {
  const state: FakePrismaState = {
    create: { calls: [] },
    findUnique: { calls: [], result: opts.findUniqueResult ?? null },
    findMany: { calls: [], result: opts.findManyResult ?? [] },
    createImpl:
      opts.createImpl ??
      (async ({ data }) =>
        opts.createRow
          ? opts.createRow(data)
          : makeRow({
              id: 'url-' + (state.create.calls.length + 1),
              projectWorkflowId: data.projectWorkflowId,
              platform: data.platform,
              url: data.url,
              source: (data.source as string) ?? 'extension',
              addedBy: data.addedBy,
              isSponsoredAd: data.isSponsoredAd === true,
              customFields:
                data.customFields === Prisma.JsonNull
                  ? {}
                  : (data.customFields as Prisma.JsonValue),
            })),
  };
  const prisma: UrlsHandlerDeps['prisma'] = {
    competitorUrl: {
      create: async (args) => {
        state.create.calls.push(args);
        return state.createImpl(args);
      },
      findUnique: async (args) => {
        state.findUnique.calls.push(args);
        return state.findUnique.result;
      },
      findMany: async (args) => {
        state.findMany.calls.push(args);
        return state.findMany.result;
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
  error: {
    status: 401,
    body: { error: 'Missing or invalid Authorization header' },
  },
});

function makeReq(opts: { body?: unknown; query?: Record<string, string>; jsonThrows?: boolean } = {}): RequestLike {
  return {
    json: async () => {
      if (opts.jsonThrows) throw new SyntaxError('Unexpected token');
      return opts.body ?? {};
    },
    nextUrl: { searchParams: new URLSearchParams(opts.query) },
  };
}

const ctx: Ctx = { params: Promise.resolve({ projectId: 'proj-1' }) };

function makeDeps(
  overrides: Partial<UrlsHandlerDeps> = {}
): UrlsHandlerDeps & { recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>; markWorkflowActiveCalls: string[] } {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const markWorkflowActiveCalls: string[] = [];
  const { prisma } = makeFakePrisma();
  const deps: UrlsHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async (projectId, workflow) => {
      markWorkflowActiveCalls.push(`${projectId}|${workflow}`);
    },
    recordFlake: (op, err, c) => {
      recordFlakeCalls.push({ op, err, ctx: c });
    },
    withRetry: (fn) => fn(),
    ...overrides,
  };
  return Object.assign(deps, { recordFlakeCalls, markWorkflowActiveCalls });
}

// ─── POST tests ──────────────────────────────────────────────────────────

test('POST 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ body: { platform: 'amazon', url: 'https://x.com' } }), ctx);
  assert.equal(r.status, 401);
  assert.deepEqual(r.body, { error: 'Missing or invalid Authorization header' });
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'Invalid JSON body' });
});

test('POST 400 when platform is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ body: { url: 'https://x.com' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /platform/i);
});

test('POST 400 when platform is invalid value', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ body: { platform: 'bogus', url: 'https://x.com' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /platform/i);
});

test('POST 400 when url is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ body: { platform: 'amazon' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /url is required/i);
});

test('POST 400 when url is empty after trim', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(makeReq({ body: { platform: 'amazon', url: '   ' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /url is required/i);
});

test('POST 400 when source is invalid value', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(
    makeReq({ body: { platform: 'amazon', url: 'https://x.com', source: 'bogus' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /source/i);
});

test('POST 201 happy path — no source field (schema default applies)', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(
    makeReq({ body: { platform: 'amazon', url: 'https://www.amazon.com/dp/B0' } }),
    ctx
  );
  assert.equal(r.status, 201);
  const body = r.body as { id: string; source: string; platform: string; url: string };
  assert.equal(body.platform, 'amazon');
  assert.equal(body.url, 'https://www.amazon.com/dp/B0');
  // No source on create payload → DB default 'extension' would apply; the
  // fake row returns 'extension' as its default.
  assert.equal(body.source, 'extension');
  // markWorkflowActive should fire on successful create.
  assert.deepEqual(deps.markWorkflowActiveCalls, ['proj-1|competition-scraping']);
});

test('POST 201 happy path — explicit source: manual is persisted', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(
    makeReq({
      body: { platform: 'amazon', url: 'https://www.amazon.com/dp/B1', source: 'manual' },
    }),
    ctx
  );
  assert.equal(r.status, 201);
  const body = r.body as { source: string };
  assert.equal(body.source, 'manual');
});

test('POST 201 trims metadata strings and accepts isSponsoredAd boolean', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlsHandlers(deps);
  // Spy on the create call to assert the payload shape.
  const seen: Array<Prisma.CompetitorUrlUncheckedCreateInput> = [];
  deps.prisma.competitorUrl.create = async ({ data }) => {
    seen.push(data);
    return makeRow({
      id: 'url-trim',
      projectWorkflowId: data.projectWorkflowId,
      platform: data.platform,
      url: data.url,
      productName: (data.productName as string) ?? null,
      brandName: (data.brandName as string) ?? null,
      competitionCategory: (data.competitionCategory as string) ?? null,
      isSponsoredAd: data.isSponsoredAd === true,
      addedBy: data.addedBy,
    });
  };
  const r = await POST(
    makeReq({
      body: {
        platform: 'amazon',
        url: 'https://x.com',
        productName: '  Acme Widget  ',
        brandName: ' Acme ',
        competitionCategory: '  cat-a  ',
        isSponsoredAd: true,
      },
    }),
    ctx
  );
  assert.equal(r.status, 201);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].productName, 'Acme Widget');
  assert.equal(seen[0].brandName, 'Acme');
  assert.equal(seen[0].competitionCategory, 'cat-a');
  assert.equal(seen[0].isSponsoredAd, true);
});

test('POST 200 idempotent on P2002 — returns existing row', async () => {
  const existing = makeRow({ id: 'url-existing', source: 'extension' });
  const { prisma, state } = makeFakePrisma({ findUniqueResult: existing });
  prisma.competitorUrl.create = async () => {
    // Simulate Prisma unique-constraint violation on (workflow, platform, url).
    throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(
    makeReq({ body: { platform: 'amazon', url: 'https://x.com' } }),
    ctx
  );
  assert.equal(r.status, 200);
  const body = r.body as { id: string };
  assert.equal(body.id, 'url-existing');
  assert.equal(state.findUnique.calls.length, 1);
  // The compound key shape is preserved.
  const where = state.findUnique.calls[0].where as {
    projectWorkflowId_platform_url: { projectWorkflowId: string; platform: string; url: string };
  };
  assert.deepEqual(where.projectWorkflowId_platform_url, {
    projectWorkflowId: 'pw-1',
    platform: 'amazon',
    url: 'https://x.com',
  });
});

test('POST 500 on unhandled Prisma error → recordFlake fires', async () => {
  const { prisma } = makeFakePrisma();
  prisma.competitorUrl.create = async () => {
    throw new Error('boom');
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeUrlsHandlers(deps);
  const r = await POST(
    makeReq({ body: { platform: 'amazon', url: 'https://x.com' } }),
    ctx
  );
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { error: 'Failed to create competitor URL' });
  assert.equal(deps.recordFlakeCalls.length, 1);
  assert.match(deps.recordFlakeCalls[0].op, /POST/);
});

// ─── GET tests ───────────────────────────────────────────────────────────

test('GET 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { GET } = makeUrlsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 401);
});

test('GET 200 — no platform filter returns all rows', async () => {
  const rows = [
    makeRow({ id: 'a', platform: 'amazon', url: 'https://a.com' }),
    makeRow({ id: 'b', platform: 'walmart', url: 'https://b.com' }),
  ];
  const { prisma, state } = makeFakePrisma({ findManyResult: rows });
  const deps = makeDeps({ prisma });
  const { GET } = makeUrlsHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  const body = r.body as Array<{ id: string }>;
  assert.equal(body.length, 2);
  assert.equal(body[0].id, 'a');
  assert.equal(body[1].id, 'b');
  // No platform key in the where clause when filter absent.
  const where = state.findMany.calls[0].where as { platform?: string };
  assert.equal(where.platform, undefined);
});

test('GET 200 with platform filter narrows the where clause', async () => {
  const { prisma, state } = makeFakePrisma({ findManyResult: [] });
  const deps = makeDeps({ prisma });
  const { GET } = makeUrlsHandlers(deps);
  const r = await GET(makeReq({ query: { platform: 'amazon' } }), ctx);
  assert.equal(r.status, 200);
  const where = state.findMany.calls[0].where as { platform: string };
  assert.equal(where.platform, 'amazon');
});

test('GET 400 on invalid platform filter', async () => {
  const deps = makeDeps();
  const { GET } = makeUrlsHandlers(deps);
  const r = await GET(makeReq({ query: { platform: 'bogus' } }), ctx);
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'Invalid platform' });
});
