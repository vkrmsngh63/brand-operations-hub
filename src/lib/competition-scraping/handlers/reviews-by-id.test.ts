// W#2 P-46 Workstream 2 Session 4 — node:test cases for the captured-reviews
// per-row PATCH + DELETE handlers.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  makeReviewsByIdHandlers,
  type CapturedReviewRow,
  type Ctx,
  type RequestLike,
  type ReviewsByIdHandlerDeps,
  type VerifyAuthFn,
} from './reviews-by-id.ts';

const FROZEN_DATE = new Date('2026-05-28T12:00:00Z');
const FROZEN_REVIEW_DATE = new Date('2026-04-12T00:00:00Z');

function makeRow(overrides: Partial<CapturedReviewRow> = {}): CapturedReviewRow {
  return {
    id: 'rev-1',
    clientId: 'client-1',
    competitorUrlId: 'url-1',
    starRating: 5,
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
  owned?: { id: string } | null;
  updateImpl?: (
    args: { where: object; data: Prisma.CapturedReviewUncheckedUpdateInput }
  ) => Promise<CapturedReviewRow>;
  deleteImpl?: (args: { where: object }) => Promise<{ id: string }>;
} = {}): { prisma: ReviewsByIdHandlerDeps['prisma']; state: {
  updateCalls: Array<{ where: object; data: Prisma.CapturedReviewUncheckedUpdateInput }>;
  deleteCalls: Array<{ where: object }>;
  findFirstCalls: Array<{ where: object; select?: object }>;
} } {
  const state = {
    updateCalls: [] as Array<{ where: object; data: Prisma.CapturedReviewUncheckedUpdateInput }>,
    deleteCalls: [] as Array<{ where: object }>,
    findFirstCalls: [] as Array<{ where: object; select?: object }>,
  };
  const updateImpl =
    opts.updateImpl ??
    (async ({ where, data }: {
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }) => {
      const updated = makeRow();
      if (typeof data.starRating === 'number') updated.starRating = data.starRating;
      if (typeof data.body === 'string') updated.body = data.body;
      if (data.reviewerName === null || typeof data.reviewerName === 'string') {
        updated.reviewerName = data.reviewerName as string | null;
      }
      if (data.reviewDate !== undefined) {
        updated.reviewDate = data.reviewDate as Date | null;
      }
      if (data.tags !== undefined) {
        updated.tags = data.tags as Prisma.JsonValue;
      }
      if (data.analysis !== undefined) {
        updated.analysis = data.analysis as Prisma.JsonValue;
      }
      return updated;
    });
  const deleteImpl =
    opts.deleteImpl ?? (async () => ({ id: 'rev-1' }));
  const prisma: ReviewsByIdHandlerDeps['prisma'] = {
    capturedReview: {
      findFirst: async (args) => {
        state.findFirstCalls.push(args);
        return opts.owned === undefined ? { id: 'rev-1' } : opts.owned;
      },
      update: async (args) => {
        state.updateCalls.push(args);
        return updateImpl(args);
      },
      delete: async (args) => {
        state.deleteCalls.push(args);
        return deleteImpl(args);
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
  params: Promise.resolve({ projectId: 'proj-1', reviewId: 'rev-1' }),
};

function makeDeps(
  overrides: Partial<ReviewsByIdHandlerDeps> = {}
): ReviewsByIdHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
  markActiveCalls: string[];
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const markActiveCalls: string[] = [];
  const { prisma } = makeFakePrisma();
  const deps: ReviewsByIdHandlerDeps = {
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

// ─── PATCH tests ────────────────────────────────────────────────────────

test('PATCH 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { starRating: 4 } }), ctx);
  assert.equal(r.status, 401);
});

test('PATCH 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
});

test('PATCH 404 when row is not found / not owned', async () => {
  const { prisma } = makeFakePrisma({ owned: null });
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { starRating: 4 } }), ctx);
  assert.equal(r.status, 404);
});

test('PATCH 400 when starRating is out of range', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { starRating: 0 } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /starRating/i);
});

test('PATCH 400 when body is empty string', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { body: '' } }), ctx);
  assert.equal(r.status, 400);
});

test('PATCH 400 when analysis is not a JSON object', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { analysis: [] } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /analysis/i);
});

test('PATCH 400 when tags is not a string array', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { tags: 'shipping' } }), ctx);
  assert.equal(r.status, 400);
});

test('PATCH 400 when reviewDate is unparseable', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { reviewDate: 'not-a-date' } }), ctx);
  assert.equal(r.status, 400);
});

test('PATCH 200 happy path — updates allowlisted fields', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(
    makeReq({
      body: {
        starRating: 3,
        body: 'updated body',
        reviewerName: 'Jane',
        reviewDate: FROZEN_REVIEW_DATE.toISOString(),
        tags: ['fit'],
        analysis: { type: 'doc', content: [] },
      },
    }),
    ctx
  );
  assert.equal(r.status, 200);
  const wire = r.body as { starRating: number; body: string; reviewerName: string | null };
  assert.equal(wire.starRating, 3);
  assert.equal(wire.body, 'updated body');
  assert.equal(wire.reviewerName, 'Jane');
  assert.equal(state.updateCalls.length, 1);
  const updateData = state.updateCalls[0].data as Record<string, unknown>;
  assert.equal(updateData.starRating, 3);
  assert.deepEqual(updateData.tags, ['fit']);
});

test('PATCH 200 when only analysis is updated (trust-boundary happy path)', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(
    makeReq({ body: { analysis: { type: 'doc', content: [] } } }),
    ctx
  );
  assert.equal(r.status, 200);
  const updateData = state.updateCalls[0].data as Record<string, unknown>;
  assert.deepEqual(updateData.analysis, { type: 'doc', content: [] });
});

test('PATCH 404 on Prisma P2025 (row deleted between findFirst and update)', async () => {
  const { prisma } = makeFakePrisma({
    updateImpl: async () => {
      throw new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
    },
  });
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { PATCH } = makeReviewsByIdHandlers(deps);
  const r = await PATCH(makeReq({ body: { starRating: 4 } }), ctx);
  assert.equal(r.status, 404);
});

// ─── DELETE tests ───────────────────────────────────────────────────────

test('DELETE 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { DELETE } = makeReviewsByIdHandlers(deps);
  const r = await DELETE(makeReq(), ctx);
  assert.equal(r.status, 401);
});

test('DELETE 200 idempotent when row is not found / not owned', async () => {
  const { prisma } = makeFakePrisma({ owned: null });
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { DELETE } = makeReviewsByIdHandlers(deps);
  const r = await DELETE(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true });
});

test('DELETE 200 happy path', async () => {
  const { prisma, state } = makeFakePrisma();
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { DELETE } = makeReviewsByIdHandlers(deps);
  const r = await DELETE(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true });
  assert.equal(state.deleteCalls.length, 1);
});

test('DELETE 200 idempotent on Prisma P2025 (already deleted)', async () => {
  const { prisma } = makeFakePrisma({
    deleteImpl: async () => {
      throw new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: 'test',
      });
    },
  });
  const deps: ReviewsByIdHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async () => {},
    recordFlake: () => {},
    withRetry: (fn) => fn(),
  };
  const { DELETE } = makeReviewsByIdHandlers(deps);
  const r = await DELETE(makeReq(), ctx);
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true });
});
