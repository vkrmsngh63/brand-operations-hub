// W#2 P-49 Workstream 4 Session 1 — node:test cases for the captured-reviews
// batch-delete POST handler. Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.6 + §C.4.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  MAX_BATCH_DELETE,
  makeReviewsBatchDeleteHandlers,
  type Ctx,
  type RequestLike,
  type ReviewsBatchDeleteHandlerDeps,
  type VerifyAuthFn,
} from './reviews-batch-delete.ts';

function makeFakePrisma(opts: {
  ownedIds?: string[];
  deleteImpl?: (args: { where: object }) => Promise<{ count: number }>;
} = {}): {
  prisma: ReviewsBatchDeleteHandlerDeps['prisma'];
  state: {
    findManyCalls: Array<{ where: object; select: { id: true } }>;
    deleteManyCalls: Array<{ where: object }>;
  };
} {
  const state = {
    findManyCalls: [] as Array<{ where: object; select: { id: true } }>,
    deleteManyCalls: [] as Array<{ where: object }>,
  };
  const ownedIds = opts.ownedIds ?? [];
  const deleteImpl =
    opts.deleteImpl ?? (async () => ({ count: ownedIds.length }));
  const prisma: ReviewsBatchDeleteHandlerDeps['prisma'] = {
    capturedReview: {
      findMany: async (args) => {
        state.findManyCalls.push(args);
        return ownedIds.map((id) => ({ id }));
      },
      deleteMany: async (args) => {
        state.deleteManyCalls.push(args);
        return deleteImpl(args);
      },
    },
  };
  return { prisma, state };
}

const okVerifyAuth: VerifyAuthFn = async () => ({
  projectWorkflowId: 'pw-1',
  userId: 'u-1',
  error: null,
});

function makeReq(body: unknown): RequestLike {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

const ctx: Ctx = { params: Promise.resolve({ projectId: 'proj-1' }) };

function makeDeps(
  prisma: ReviewsBatchDeleteHandlerDeps['prisma'],
  overrides: Partial<ReviewsBatchDeleteHandlerDeps> = {}
): ReviewsBatchDeleteHandlerDeps {
  return {
    prisma,
    verifyAuth: overrides.verifyAuth ?? okVerifyAuth,
    markWorkflowActive: overrides.markWorkflowActive ?? (async () => {}),
    recordFlake: overrides.recordFlake ?? (() => {}),
    withRetry: overrides.withRetry ?? (async (fn) => fn()),
  };
}

test('reviews-batch-delete: rejects when auth fails', async () => {
  const { prisma, state } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(
    makeDeps(prisma, {
      verifyAuth: async () => ({
        projectWorkflowId: null,
        userId: null,
        error: { status: 401, body: { error: 'unauthorized' } },
      }),
    })
  );
  const result = await handlers.POST(makeReq({ reviewIds: ['a'] }), ctx);
  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { error: 'unauthorized' });
  assert.equal(state.findManyCalls.length, 0);
  assert.equal(state.deleteManyCalls.length, 0);
});

test('reviews-batch-delete: rejects invalid JSON body', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const req: RequestLike = {
    json: async () => {
      throw new Error('parse fail');
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
  const result = await handlers.POST(req, ctx);
  assert.equal(result.status, 400);
  assert.deepEqual(result.body, { error: 'Invalid JSON body' });
});

test('reviews-batch-delete: rejects reviewIds that is not an array', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(makeReq({ reviewIds: 'not-an-array' }), ctx);
  assert.equal(result.status, 400);
  assert.deepEqual(result.body, {
    error: 'reviewIds must be an array of strings',
  });
});

test('reviews-batch-delete: rejects array containing non-string entries', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['a', 42, 'b'] }),
    ctx
  );
  assert.equal(result.status, 400);
});

test('reviews-batch-delete: empty array returns 200 with deleted=0 (no-op)', async () => {
  const { prisma, state } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(makeReq({ reviewIds: [] }), ctx);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 0 });
  assert.equal(state.findManyCalls.length, 0);
  assert.equal(state.deleteManyCalls.length, 0);
});

test('reviews-batch-delete: array of empty strings after trim returns deleted=0', async () => {
  const { prisma, state } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['  ', '', '   '] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 0 });
  assert.equal(state.findManyCalls.length, 0);
});

test('reviews-batch-delete: dedupes repeated IDs before passing to prisma', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a', 'b'] });
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['a', 'a', 'b', 'a'] }),
    ctx
  );
  assert.equal(result.status, 200);
  const findManyWhere = state.findManyCalls[0].where as {
    id: { in: string[] };
  };
  assert.deepEqual([...findManyWhere.id.in].sort(), ['a', 'b']);
});

test('reviews-batch-delete: rejects oversized batch', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const oversized = Array.from(
    { length: MAX_BATCH_DELETE + 1 },
    (_, i) => `id-${i}`
  );
  const result = await handlers.POST(makeReq({ reviewIds: oversized }), ctx);
  assert.equal(result.status, 400);
  assert.match(
    (result.body as { error: string }).error,
    /Too many reviewIds/
  );
});

test('reviews-batch-delete: ownership filter scopes by project workflow', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a', 'c'] });
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['a', 'b', 'c'] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 2 });
  const where = state.findManyCalls[0].where as {
    competitorUrl: { projectWorkflowId: string };
  };
  assert.equal(where.competitorUrl.projectWorkflowId, 'pw-1');
});

test('reviews-batch-delete: zero owned IDs returns 200 deleted=0 without calling deleteMany', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: [] });
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['some-foreign-id'] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 0 });
  assert.equal(state.deleteManyCalls.length, 0);
});

test('reviews-batch-delete: happy path returns 200 with count from prisma', async () => {
  const { prisma, state } = makeFakePrisma({
    ownedIds: ['a', 'b', 'c'],
    deleteImpl: async () => ({ count: 3 }),
  });
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(
    makeReq({ reviewIds: ['a', 'b', 'c'] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 3 });
  assert.equal(state.deleteManyCalls.length, 1);
  const where = state.deleteManyCalls[0].where as { id: { in: string[] } };
  assert.deepEqual([...where.id.in].sort(), ['a', 'b', 'c']);
});

test('reviews-batch-delete: P2025 (row vanished mid-delete) returns 200 deleted=0', async () => {
  const { prisma } = makeFakePrisma({
    ownedIds: ['a'],
    deleteImpl: async () => {
      throw new Prisma.PrismaClientKnownRequestError(
        'gone',
        { code: 'P2025', clientVersion: 'test' }
      );
    },
  });
  const handlers = makeReviewsBatchDeleteHandlers(makeDeps(prisma));
  const result = await handlers.POST(makeReq({ reviewIds: ['a'] }), ctx);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { deleted: 0 });
});

test('reviews-batch-delete: unknown prisma error returns 500 + records flake', async () => {
  const { prisma } = makeFakePrisma({
    ownedIds: ['a'],
    deleteImpl: async () => {
      throw new Error('connection reset');
    },
  });
  const recordedFlakes: Array<{ op: string; ctx: object }> = [];
  const handlers = makeReviewsBatchDeleteHandlers(
    makeDeps(prisma, {
      recordFlake: (op, _err, ctx) => {
        recordedFlakes.push({ op, ctx });
      },
    })
  );
  // Silence console.error noise during the negative test.
  const origErr = console.error;
  console.error = () => {};
  try {
    const result = await handlers.POST(makeReq({ reviewIds: ['a'] }), ctx);
    assert.equal(result.status, 500);
    assert.deepEqual(result.body, { error: 'Failed to delete reviews' });
    assert.equal(recordedFlakes.length, 1);
    assert.match(recordedFlakes[0].op, /batch-delete/);
  } finally {
    console.error = origErr;
  }
});

test('reviews-batch-delete: markWorkflowActive fires on successful delete', async () => {
  const { prisma } = makeFakePrisma({ ownedIds: ['a'] });
  const markCalls: Array<{ projectId: string; workflow: string }> = [];
  const handlers = makeReviewsBatchDeleteHandlers(
    makeDeps(prisma, {
      markWorkflowActive: async (projectId, workflow) => {
        markCalls.push({ projectId, workflow });
      },
    })
  );
  const result = await handlers.POST(makeReq({ reviewIds: ['a'] }), ctx);
  assert.equal(result.status, 200);
  assert.equal(markCalls.length, 1);
  assert.equal(markCalls[0].projectId, 'proj-1');
  assert.equal(markCalls[0].workflow, 'competition-scraping');
});

test('reviews-batch-delete: markWorkflowActive does NOT fire when zero owned IDs', async () => {
  const { prisma } = makeFakePrisma({ ownedIds: [] });
  const markCalls: Array<{ projectId: string; workflow: string }> = [];
  const handlers = makeReviewsBatchDeleteHandlers(
    makeDeps(prisma, {
      markWorkflowActive: async (projectId, workflow) => {
        markCalls.push({ projectId, workflow });
      },
    })
  );
  await handlers.POST(makeReq({ reviewIds: ['foreign-id'] }), ctx);
  assert.equal(markCalls.length, 0);
});
