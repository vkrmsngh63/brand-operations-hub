// W#2 P-46 Workstream 4 — node:test cases for the per-Project
// Comprehensive Competitor Analysis handler. Mirrors
// user-table-preferences.test.ts pattern.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  extractComprehensiveAnalysisPatch,
  makeComprehensiveAnalysisHandlers,
  toWireShape,
  type ComprehensiveAnalysisHandlerDeps,
  type ComprehensiveAnalysisRow,
  type VerifyProjectAuthFn,
} from './comprehensive-analysis.ts';
import type { RequestLike } from './shared.ts';

const FROZEN_LAST_EDITED = new Date('2026-05-25T12:00:00Z');
const FROZEN_CREATED = new Date('2026-05-24T08:00:00Z');

function makeRow(
  overrides: Partial<ComprehensiveAnalysisRow> = {}
): ComprehensiveAnalysisRow {
  return {
    id: 'cca-1',
    projectId: 'p-1',
    contentJson: {},
    lastEditedBy: 'u-1',
    lastEditedAt: FROZEN_LAST_EDITED,
    createdAt: FROZEN_CREATED,
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
  findUniqueResult?: ComprehensiveAnalysisRow | null;
  upsertResult?: ComprehensiveAnalysisRow;
  upsertThrows?: unknown;
  findUniqueThrows?: unknown;
} = {}) {
  const state = {
    findUniqueCalls: [] as Array<{ where: unknown }>,
    upsertCalls: [] as Array<{
      where: unknown;
      create: unknown;
      update: unknown;
    }>,
  };
  const prisma: ComprehensiveAnalysisHandlerDeps['prisma'] = {
    comprehensiveCompetitorAnalysis: {
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

// ─── extractComprehensiveAnalysisPatch ───────────────────────────────

test('extract: non-object body → error', () => {
  for (const bad of [null, 'string', 42, true, []]) {
    const result = extractComprehensiveAnalysisPatch(bad);
    assert.equal(result.ok, false);
  }
});

test('extract: missing contentJson → error', () => {
  const result = extractComprehensiveAnalysisPatch({});
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /contentJson is required/);
  }
});

test('extract: contentJson as non-object → error', () => {
  for (const bad of [null, 'string', 42, true, []]) {
    const result = extractComprehensiveAnalysisPatch({ contentJson: bad });
    assert.equal(result.ok, false);
  }
});

test('extract: valid contentJson passes through', () => {
  const doc = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hi' }] }],
  };
  const result = extractComprehensiveAnalysisPatch({ contentJson: doc });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.patch.contentJson, doc);
});

test('extract: empty contentJson object accepted (initial empty doc)', () => {
  const result = extractComprehensiveAnalysisPatch({ contentJson: {} });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.patch.contentJson, {});
});

test('extract: unknown top-level keys silently ignored', () => {
  const result = extractComprehensiveAnalysisPatch({
    contentJson: {},
    futureField: 'someday',
  });
  assert.equal(result.ok, true);
});

// ─── toWireShape ────────────────────────────────────────────────────

test('toWireShape: typical row converts cleanly', () => {
  const doc = { type: 'doc', content: [] };
  const row = makeRow({ contentJson: doc });
  const wire = toWireShape(row);
  assert.equal(wire.id, 'cca-1');
  assert.equal(wire.projectId, 'p-1');
  assert.deepEqual(wire.contentJson, doc);
  assert.equal(wire.lastEditedBy, 'u-1');
  assert.equal(wire.lastEditedAt, FROZEN_LAST_EDITED.toISOString());
  assert.equal(wire.createdAt, FROZEN_CREATED.toISOString());
});

test('toWireShape: bad-shape contentJson in DB → empty object fallback', () => {
  const badValues: unknown[] = ['not-an-object', 42, null, [], true];
  for (const bad of badValues) {
    const row = makeRow({
      contentJson: bad as ComprehensiveAnalysisRow['contentJson'],
    });
    const wire = toWireShape(row);
    assert.deepEqual(wire.contentJson, {});
  }
});

// ─── GET handler ─────────────────────────────────────────────────────

test('GET: forbidden surfaces auth error', async () => {
  const { prisma } = makeFakePrisma();
  const { GET } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authForbidden,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 403);
});

test('GET: 404 when no row exists', async () => {
  const { prisma, state } = makeFakePrisma({ findUniqueResult: null });
  const { GET } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 404);
  assert.equal(state.findUniqueCalls.length, 1);
  assert.deepEqual(state.findUniqueCalls[0].where, { projectId: 'p-1' });
});

test('GET: 200 with wire shape when row exists', async () => {
  const doc = { type: 'doc', content: [{ type: 'paragraph' }] };
  const row = makeRow({ contentJson: doc, lastEditedBy: 'u-99' });
  const { prisma } = makeFakePrisma({ findUniqueResult: row });
  const { GET } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await GET(makeReq(), makeCtx());
  assert.equal(result.status, 200);
  const body = result.body as { contentJson: unknown; lastEditedBy: string };
  assert.deepEqual(body.contentJson, doc);
  assert.equal(body.lastEditedBy, 'u-99');
});

test('GET: 500 when prisma throws', async () => {
  const { prisma } = makeFakePrisma({
    findUniqueThrows: new Error('db down'),
  });
  let flakeCalls = 0;
  const { GET } = makeComprehensiveAnalysisHandlers({
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

// ─── PUT handler ─────────────────────────────────────────────────────

test('PUT: forbidden surfaces auth error', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authForbidden,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ contentJson: {} }), makeCtx());
  assert.equal(result.status, 403);
});

test('PUT: invalid JSON body → 400', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq(), makeCtx());
  assert.equal(result.status, 400);
});

test('PUT: missing contentJson → 400', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({}), makeCtx());
  assert.equal(result.status, 400);
});

test('PUT: non-object contentJson → 400', async () => {
  const { prisma } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ contentJson: 'plain text' }), makeCtx());
  assert.equal(result.status, 400);
});

test('PUT: valid contentJson → 200, upsert called with auth-derived lastEditedBy', async () => {
  const doc = { type: 'doc', content: [] };
  const upsertResult = makeRow({ contentJson: doc, lastEditedBy: 'u-1' });
  const { prisma, state } = makeFakePrisma({ upsertResult });
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ contentJson: doc }), makeCtx());
  assert.equal(result.status, 200);
  assert.equal(state.upsertCalls.length, 1);
  const call = state.upsertCalls[0];
  assert.deepEqual(call.where, { projectId: 'p-1' });
  // Update carries contentJson + lastEditedBy
  const update = call.update as Record<string, unknown>;
  assert.deepEqual(update.contentJson, doc);
  assert.equal(update.lastEditedBy, 'u-1');
  // Create populates same fields + projectId + lastEditedAt
  const create = call.create as Record<string, unknown>;
  assert.equal(create.projectId, 'p-1');
  assert.deepEqual(create.contentJson, doc);
  assert.equal(create.lastEditedBy, 'u-1');
  assert.ok(create.lastEditedAt instanceof Date);
});

test('PUT: 500 when prisma upsert throws', async () => {
  const { prisma } = makeFakePrisma({
    upsertThrows: new Error('write fail'),
  });
  let flakeCalls = 0;
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: () => {
      flakeCalls++;
    },
    withRetry: passThroughRetry,
  });
  const result = await PUT(
    makeReq({ contentJson: { type: 'doc' } }),
    makeCtx()
  );
  assert.equal(result.status, 500);
  assert.equal(flakeCalls, 1);
});

test('PUT: contentJson is forwarded verbatim (no shape mutation)', async () => {
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'My analysis' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Some ' },
          { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
          { type: 'text', text: ' text.' },
        ],
      },
    ],
  };
  const { prisma, state } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  const result = await PUT(makeReq({ contentJson: doc }), makeCtx());
  assert.equal(result.status, 200);
  const create = state.upsertCalls[0].create as Record<string, unknown>;
  assert.deepEqual(create.contentJson, doc);
});

test('GET + PUT: projectId from URL is honored (not from body)', async () => {
  const doc = { type: 'doc' };
  const { prisma, state } = makeFakePrisma();
  const { PUT } = makeComprehensiveAnalysisHandlers({
    prisma,
    verifyProjectAuth: authOk,
    recordFlake: noopRecordFlake,
    withRetry: passThroughRetry,
  });
  // Even if the body somehow tried to carry projectId, the URL value wins.
  await PUT(
    makeReq({ contentJson: doc, projectId: 'evil-attempt' }),
    makeCtx('p-real')
  );
  const create = state.upsertCalls[0].create as Record<string, unknown>;
  assert.equal(create.projectId, 'p-real');
});
