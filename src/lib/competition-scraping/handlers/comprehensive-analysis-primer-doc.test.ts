// W#2 P-55 Phase 3 part 3 — node:test cases for the saved-primer handler.
// Mirrors comprehensive-analysis.test.ts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  extractPrimerDocPatch,
  makeComprehensiveAnalysisPrimerDocHandlers,
  toPrimerWire,
  type PrimerDocHandlerDeps,
  type PrimerDocRow,
  type VerifyProjectAuthFn,
} from './comprehensive-analysis-primer-doc.ts';
import type { RequestLike } from './shared.ts';

const authOk: VerifyProjectAuthFn = async () => ({ userId: 'u-1', error: null });
const authForbidden: VerifyProjectAuthFn = async () => ({
  userId: null,
  error: { status: 403, body: { error: 'Access denied' } },
});

function makeFakePrisma(
  opts: {
    findUniqueResult?: PrimerDocRow | null;
    upsertResult?: PrimerDocRow;
    upsertThrows?: unknown;
    findUniqueThrows?: unknown;
  } = {}
) {
  const state = {
    findUniqueCalls: [] as Array<{ where: unknown; select: unknown }>,
    upsertCalls: [] as Array<{ where: unknown; create: any; update: any }>,
  };
  const prisma: PrimerDocHandlerDeps['prisma'] = {
    comprehensiveCompetitorAnalysis: {
      findUnique: async (args) => {
        state.findUniqueCalls.push(args);
        if (opts.findUniqueThrows) throw opts.findUniqueThrows;
        return opts.findUniqueResult ?? null;
      },
      upsert: async (args) => {
        state.upsertCalls.push(args);
        if (opts.upsertThrows) throw opts.upsertThrows;
        return opts.upsertResult ?? { primerJson: null };
      },
    },
  };
  return { prisma, state };
}

function deps(
  over: Partial<PrimerDocHandlerDeps> & { prisma: PrimerDocHandlerDeps['prisma'] }
): PrimerDocHandlerDeps {
  return {
    verifyProjectAuth: authOk,
    recordFlake: () => {},
    withRetry: (fn) => fn(),
    ...over,
  };
}

const ctx = { params: Promise.resolve({ projectId: 'p-1' }) };
function req(body?: unknown): RequestLike {
  return {
    json: async () => {
      if (body === undefined) throw new Error('no body');
      return body;
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

const DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

// ─── toPrimerWire ──────────────────────────────────────────────────────────
test('toPrimerWire: null row / null column → { primerJson: null }', () => {
  assert.deepEqual(toPrimerWire(null), { primerJson: null });
  assert.deepEqual(toPrimerWire({ primerJson: null }), { primerJson: null });
});

test('toPrimerWire: object passes through; non-object coerces to null', () => {
  assert.deepEqual(toPrimerWire({ primerJson: DOC }), { primerJson: DOC });
  assert.deepEqual(toPrimerWire({ primerJson: 'oops' as never }), {
    primerJson: null,
  });
});

// ─── extractPrimerDocPatch ───────────────────────────────────────────────────
test('extractPrimerDocPatch: requires the primerJson key', () => {
  assert.equal(extractPrimerDocPatch({}).ok, false);
  assert.equal(extractPrimerDocPatch('nope').ok, false);
});

test('extractPrimerDocPatch: object doc and explicit null both valid', () => {
  const a = extractPrimerDocPatch({ primerJson: DOC });
  assert.equal(a.ok, true);
  assert.deepEqual(a.ok && a.patch, { primerJson: DOC });
  const b = extractPrimerDocPatch({ primerJson: null });
  assert.equal(b.ok, true);
  assert.deepEqual(b.ok && b.patch, { primerJson: null });
});

test('extractPrimerDocPatch: a non-object, non-null primerJson is rejected', () => {
  assert.equal(extractPrimerDocPatch({ primerJson: 5 }).ok, false);
  assert.equal(extractPrimerDocPatch({ primerJson: [1] }).ok, false);
});

// ─── GET ─────────────────────────────────────────────────────────────────────
test('GET: 200 with the saved primer when present', async () => {
  const { prisma } = makeFakePrisma({ findUniqueResult: { primerJson: DOC } });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.GET(req(), ctx);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { primerJson: DOC });
});

test('GET: 200 { primerJson: null } when no row exists yet', async () => {
  const { prisma } = makeFakePrisma({ findUniqueResult: null });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.GET(req(), ctx);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { primerJson: null });
});

test('GET: auth failure short-circuits', async () => {
  const { prisma, state } = makeFakePrisma();
  const h = makeComprehensiveAnalysisPrimerDocHandlers(
    deps({ prisma, verifyProjectAuth: authForbidden })
  );
  const res = await h.GET(req(), ctx);
  assert.equal(res.status, 403);
  assert.equal(state.findUniqueCalls.length, 0);
});

test('GET: 500 on DB error', async () => {
  const { prisma } = makeFakePrisma({ findUniqueThrows: new Error('boom') });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.GET(req(), ctx);
  assert.equal(res.status, 500);
});

// ─── PUT ─────────────────────────────────────────────────────────────────────
test('PUT: saves a primer doc; lastEditedBy = auth userId; sets it on both create + update', async () => {
  const { prisma, state } = makeFakePrisma({ upsertResult: { primerJson: DOC } });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.PUT(req({ primerJson: DOC }), ctx);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { primerJson: DOC });
  const call = state.upsertCalls[0];
  assert.deepEqual(call.create.primerJson, DOC);
  assert.deepEqual(call.update.primerJson, DOC);
  assert.equal(call.create.lastEditedBy, 'u-1');
  assert.equal(call.update.lastEditedBy, 'u-1');
});

test('PUT: primerJson null clears the override via Prisma.DbNull', async () => {
  const { prisma, state } = makeFakePrisma({ upsertResult: { primerJson: null } });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.PUT(req({ primerJson: null }), ctx);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { primerJson: null });
  assert.equal(state.upsertCalls[0].create.primerJson, Prisma.DbNull);
  assert.equal(state.upsertCalls[0].update.primerJson, Prisma.DbNull);
});

test('PUT: invalid body → 400, no upsert', async () => {
  const { prisma, state } = makeFakePrisma();
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.PUT(req({ wrong: 1 }), ctx);
  assert.equal(res.status, 400);
  assert.equal(state.upsertCalls.length, 0);
});

test('PUT: auth failure short-circuits before reading the body', async () => {
  const { prisma, state } = makeFakePrisma();
  const h = makeComprehensiveAnalysisPrimerDocHandlers(
    deps({ prisma, verifyProjectAuth: authForbidden })
  );
  const res = await h.PUT(req({ primerJson: DOC }), ctx);
  assert.equal(res.status, 403);
  assert.equal(state.upsertCalls.length, 0);
});

test('PUT: 500 on DB error', async () => {
  const { prisma } = makeFakePrisma({ upsertThrows: new Error('boom') });
  const h = makeComprehensiveAnalysisPrimerDocHandlers(deps({ prisma }));
  const res = await h.PUT(req({ primerJson: DOC }), ctx);
  assert.equal(res.status, 500);
});
