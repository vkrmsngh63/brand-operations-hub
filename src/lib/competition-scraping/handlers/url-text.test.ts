// W#2 P-31 — node:test cases for the captured-text-under-URL handlers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  makeUrlTextHandlers,
  type CapturedTextRow,
  type Ctx,
  type RequestLike,
  type UrlTextHandlerDeps,
  type VerifyAuthFn,
} from './url-text.ts';

const FROZEN_DATE = new Date('2026-05-15T12:00:00Z');

function makeRow(overrides: Partial<CapturedTextRow> = {}): CapturedTextRow {
  return {
    id: 'txt-1',
    clientId: 'client-1',
    competitorUrlId: 'url-1',
    contentCategory: null,
    text: 'sample text',
    tags: [],
    sortOrder: 0,
    source: 'extension',
    addedBy: 'u-1',
    addedAt: FROZEN_DATE,
    updatedAt: FROZEN_DATE,
    ...overrides,
  };
}

function makeFakePrisma(opts: {
  parent?: { id: string } | null;
  createImpl?: (
    args: { data: Prisma.CapturedTextUncheckedCreateInput }
  ) => Promise<CapturedTextRow>;
  findUniqueResult?: CapturedTextRow | null;
  findManyResult?: CapturedTextRow[];
} = {}): { prisma: UrlTextHandlerDeps['prisma']; state: {
  createCalls: Array<{ data: Prisma.CapturedTextUncheckedCreateInput }>;
  findUniqueCalls: Array<{ where: object }>;
  findManyCalls: Array<{ where: object; orderBy: object }>;
  findFirstCalls: Array<{ where: object; select?: object }>;
} } {
  const state = {
    createCalls: [] as Array<{ data: Prisma.CapturedTextUncheckedCreateInput }>,
    findUniqueCalls: [] as Array<{ where: object }>,
    findManyCalls: [] as Array<{ where: object; orderBy: object }>,
    findFirstCalls: [] as Array<{ where: object; select?: object }>,
  };
  const createImpl =
    opts.createImpl ??
    (async ({ data }: { data: Prisma.CapturedTextUncheckedCreateInput }) =>
      makeRow({
        id: 'txt-' + (state.createCalls.length + 1),
        clientId: data.clientId,
        competitorUrlId: data.competitorUrlId,
        text: data.text,
        tags: (data.tags as string[]) ?? [],
        sortOrder: (data.sortOrder as number) ?? 0,
        source: (data.source as string) ?? 'extension',
        contentCategory: (data.contentCategory as string) ?? null,
        addedBy: data.addedBy,
      }));
  const prisma: UrlTextHandlerDeps['prisma'] = {
    competitorUrl: {
      findFirst: async (args) => {
        state.findFirstCalls.push(args);
        return opts.parent === undefined ? { id: 'url-1' } : opts.parent;
      },
    },
    capturedText: {
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
  overrides: Partial<UrlTextHandlerDeps> = {}
): UrlTextHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
  markActiveCalls: string[];
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const markActiveCalls: string[] = [];
  const { prisma } = makeFakePrisma();
  const deps: UrlTextHandlerDeps = {
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
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1', text: 't' } }), ctx);
  assert.equal(r.status, 401);
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'Invalid JSON body' });
});

test('POST 400 when clientId is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { text: 'hi' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /clientId/i);
});

test('POST 400 when text is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /text/i);
});

test('POST 400 when tags is not a string array', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', text: 't', tags: [1, 2, 3] } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /tags/i);
});

test('POST 400 when sortOrder is non-numeric', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', text: 't', sortOrder: 'big' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /sortOrder/i);
});

test('POST 400 when source value is invalid', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', text: 't', source: 'bogus' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /source/i);
});

test('POST 404 when parent URL is not found', async () => {
  const { prisma } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1', text: 't' } }), ctx);
  assert.equal(r.status, 404);
  assert.match((r.body as { error: string }).error, /not found/i);
});

test('POST 201 happy path — default source extension', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', text: 'hello world' } }),
    ctx
  );
  assert.equal(r.status, 201);
  const body = r.body as { source: string; text: string };
  assert.equal(body.source, 'extension');
  assert.equal(body.text, 'hello world');
  assert.deepEqual(deps.markActiveCalls, ['proj-1|competition-scraping']);
});

test('POST 201 with source: manual is persisted', async () => {
  const deps = makeDeps();
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(
    makeReq({ body: { clientId: 'c1', text: 't', source: 'manual' } }),
    ctx
  );
  assert.equal(r.status, 201);
  assert.equal((r.body as { source: string }).source, 'manual');
});

test('POST 200 idempotent on P2002 — returns existing row by clientId', async () => {
  const existing = makeRow({ id: 'txt-existing', clientId: 'c1' });
  const { prisma } = makeFakePrisma({ findUniqueResult: existing });
  prisma.capturedText.create = async () => {
    throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1', text: 't' } }), ctx);
  assert.equal(r.status, 200);
  assert.equal((r.body as { id: string }).id, 'txt-existing');
});

test('POST 500 on unhandled Prisma error', async () => {
  const { prisma } = makeFakePrisma();
  prisma.capturedText.create = async () => {
    throw new Error('database fell over');
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeUrlTextHandlers(deps);
  const r = await POST(makeReq({ body: { clientId: 'c1', text: 't' } }), ctx);
  assert.equal(r.status, 500);
  assert.equal(deps.recordFlakeCalls.length, 1);
});

// ─── GET tests ──────────────────────────────────────────────────────────

test('GET 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { GET } = makeUrlTextHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 401);
});

test('GET 404 when parent URL is not found', async () => {
  const { prisma } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { GET } = makeUrlTextHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 404);
});

test('GET 200 returns rows for the URL', async () => {
  const rows = [
    makeRow({ id: 'a', text: 'first', sortOrder: 0 }),
    makeRow({ id: 'b', text: 'second', sortOrder: 1 }),
  ];
  const { prisma, state } = makeFakePrisma({ findManyResult: rows });
  const deps = makeDeps({ prisma });
  const { GET } = makeUrlTextHandlers(deps);
  const r = await GET(makeReq(), ctx);
  assert.equal(r.status, 200);
  const body = r.body as Array<{ id: string }>;
  assert.equal(body.length, 2);
  assert.equal(body[0].id, 'a');
  assert.equal(body[1].id, 'b');
  const where = state.findManyCalls[0].where as { competitorUrlId: string };
  assert.equal(where.competitorUrlId, 'url-1');
});
