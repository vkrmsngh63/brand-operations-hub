// W#2 P-49 Workstream 4 Session 1 — node:test cases for the captured-reviews
// reorder PUT handler. Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.5 + §C.4.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  MAX_REORDER_BATCH,
  makeReviewsReorderHandlers,
  type Ctx,
  type RequestLike,
  type ReviewsReorderHandlerDeps,
  type VerifyAuthFn,
} from './reviews-reorder.ts';

function makeFakePrisma(opts: {
  parent?: { id: string } | null;
  ownedIds?: string[];
  updateImpl?: (args: {
    where: object;
    data: Prisma.CapturedReviewUncheckedUpdateInput;
  }) => Promise<{ id: string }>;
} = {}): {
  prisma: ReviewsReorderHandlerDeps['prisma'];
  state: {
    parentLookups: Array<{ where: object; select?: object }>;
    findManyCalls: Array<{ where: object; select: { id: true } }>;
    updateCalls: Array<{
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }>;
  };
} {
  const state = {
    parentLookups: [] as Array<{ where: object; select?: object }>,
    findManyCalls: [] as Array<{ where: object; select: { id: true } }>,
    updateCalls: [] as Array<{
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }>,
  };
  const parent = opts.parent === undefined ? { id: 'url-1' } : opts.parent;
  const ownedIds = opts.ownedIds ?? [];
  const updateImpl =
    opts.updateImpl ??
    (async ({ where }: {
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }) => {
      const w = where as { id: string };
      return { id: w.id };
    });
  const prisma: ReviewsReorderHandlerDeps['prisma'] = {
    competitorUrl: {
      findFirst: async (args) => {
        state.parentLookups.push(args);
        return parent;
      },
    },
    capturedReview: {
      findMany: async (args) => {
        state.findManyCalls.push(args);
        return ownedIds.map((id) => ({ id }));
      },
      update: async (args) => {
        state.updateCalls.push(args);
        return updateImpl(args);
      },
    },
    // The transaction wrapper just runs the closure inline — fine for unit
    // tests where we aren't exercising real Prisma transaction semantics.
    $transaction: async (fn) => fn(),
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

const ctx: Ctx = {
  params: Promise.resolve({ projectId: 'proj-1', urlId: 'url-1' }),
};

function makeDeps(
  prisma: ReviewsReorderHandlerDeps['prisma'],
  overrides: Partial<ReviewsReorderHandlerDeps> = {}
): ReviewsReorderHandlerDeps {
  return {
    prisma,
    verifyAuth: overrides.verifyAuth ?? okVerifyAuth,
    markWorkflowActive: overrides.markWorkflowActive ?? (async () => {}),
    recordFlake: overrides.recordFlake ?? (() => {}),
    withRetry: overrides.withRetry ?? (async (fn) => fn()),
  };
}

test('reviews-reorder: rejects when auth fails', async () => {
  const { prisma, state } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(
    makeDeps(prisma, {
      verifyAuth: async () => ({
        projectWorkflowId: null,
        userId: null,
        error: { status: 401, body: { error: 'unauthorized' } },
      }),
    })
  );
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 401);
  assert.equal(state.parentLookups.length, 0);
  assert.equal(state.updateCalls.length, 0);
});

test('reviews-reorder: rejects invalid JSON body', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const req: RequestLike = {
    json: async () => {
      throw new Error('parse fail');
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
  const result = await handlers.PUT(req, ctx);
  assert.equal(result.status, 400);
  assert.deepEqual(result.body, { error: 'Invalid JSON body' });
});

test('reviews-reorder: rejects when orderings is not an array', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: 'not-an-array' }),
    ctx
  );
  assert.equal(result.status, 400);
});

test('reviews-reorder: rejects entry missing reviewId', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ sortRank: 1 }] }),
    ctx
  );
  assert.equal(result.status, 400);
});

test('reviews-reorder: rejects entry with non-integer sortRank', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({
      orderings: [{ reviewId: 'a', sortRank: 1.5 }],
    }),
    ctx
  );
  assert.equal(result.status, 400);
});

test('reviews-reorder: rejects entry with empty reviewId', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: '   ', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 400);
});

test('reviews-reorder: empty orderings returns 200 updated=0 (no-op)', async () => {
  const { prisma, state } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(makeReq({ orderings: [] }), ctx);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 0 });
  assert.equal(state.parentLookups.length, 0);
  assert.equal(state.updateCalls.length, 0);
});

test('reviews-reorder: rejects oversized batch', async () => {
  const { prisma } = makeFakePrisma();
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const oversized = Array.from(
    { length: MAX_REORDER_BATCH + 1 },
    (_, i) => ({ reviewId: `id-${i}`, sortRank: i })
  );
  const result = await handlers.PUT(makeReq({ orderings: oversized }), ctx);
  assert.equal(result.status, 400);
});

test('reviews-reorder: returns 404 when parent URL is not in project workflow', async () => {
  const { prisma, state } = makeFakePrisma({ parent: null });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { error: 'Competitor URL not found' });
  assert.equal(state.updateCalls.length, 0);
});

test('reviews-reorder: ownership scoping confines updates to URL + project', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a', 'c'] });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({
      orderings: [
        { reviewId: 'a', sortRank: 0 },
        { reviewId: 'b-foreign', sortRank: 1 },
        { reviewId: 'c', sortRank: 2 },
      ],
    }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 2 });
  const updatedIds = state.updateCalls.map(
    (c) => (c.where as { id: string }).id
  );
  assert.deepEqual(updatedIds.sort(), ['a', 'c']);
});

test('reviews-reorder: dedupes by reviewId; last entry wins for the persisted sortRank', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a'] });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({
      orderings: [
        { reviewId: 'a', sortRank: 1 },
        { reviewId: 'a', sortRank: 5 },
        { reviewId: 'a', sortRank: 9 },
      ],
    }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 1 });
  assert.equal(state.updateCalls.length, 1);
  const data = state.updateCalls[0].data as { sortRank: number };
  assert.equal(data.sortRank, 9);
});

test('reviews-reorder: zero owned IDs returns 200 updated=0 without any updates', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: [] });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 0 });
  assert.equal(state.updateCalls.length, 0);
});

test('reviews-reorder: happy path applies all sortRanks', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a', 'b', 'c'] });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({
      orderings: [
        { reviewId: 'a', sortRank: 0 },
        { reviewId: 'b', sortRank: 1 },
        { reviewId: 'c', sortRank: 2 },
      ],
    }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 3 });
  // Build a reviewId → sortRank map from the persisted updates for stable
  // assertion regardless of internal iteration order.
  const written: Record<string, number> = {};
  for (const call of state.updateCalls) {
    const id = (call.where as { id: string }).id;
    const rank = (call.data as { sortRank: number }).sortRank;
    written[id] = rank;
  }
  assert.deepEqual(written, { a: 0, b: 1, c: 2 });
});

test('reviews-reorder: accepts negative sortRank values', async () => {
  const { prisma, state } = makeFakePrisma({ ownedIds: ['a'] });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: -1000 }] }),
    ctx
  );
  assert.equal(result.status, 200);
  const data = state.updateCalls[0].data as { sortRank: number };
  assert.equal(data.sortRank, -1000);
});

test('reviews-reorder: P2025 inside transaction returns 200 updated=0', async () => {
  const { prisma } = makeFakePrisma({
    ownedIds: ['a'],
    updateImpl: async () => {
      throw new Prisma.PrismaClientKnownRequestError('gone', {
        code: 'P2025',
        clientVersion: 'test',
      });
    },
  });
  const handlers = makeReviewsReorderHandlers(makeDeps(prisma));
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { updated: 0 });
});

test('reviews-reorder: unknown prisma error returns 500 + records flake', async () => {
  const { prisma } = makeFakePrisma({
    ownedIds: ['a'],
    updateImpl: async () => {
      throw new Error('connection reset');
    },
  });
  const recordedFlakes: Array<{ op: string; ctx: object }> = [];
  const handlers = makeReviewsReorderHandlers(
    makeDeps(prisma, {
      recordFlake: (op, _err, ctx) => {
        recordedFlakes.push({ op, ctx });
      },
    })
  );
  const origErr = console.error;
  console.error = () => {};
  try {
    const result = await handlers.PUT(
      makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
      ctx
    );
    assert.equal(result.status, 500);
    assert.deepEqual(result.body, { error: 'Failed to reorder reviews' });
    assert.equal(recordedFlakes.length, 1);
    assert.match(recordedFlakes[0].op, /reviews\/reorder/);
  } finally {
    console.error = origErr;
  }
});

test('reviews-reorder: markWorkflowActive fires on successful reorder', async () => {
  const { prisma } = makeFakePrisma({ ownedIds: ['a'] });
  const markCalls: Array<{ projectId: string; workflow: string }> = [];
  const handlers = makeReviewsReorderHandlers(
    makeDeps(prisma, {
      markWorkflowActive: async (projectId, workflow) => {
        markCalls.push({ projectId, workflow });
      },
    })
  );
  const result = await handlers.PUT(
    makeReq({ orderings: [{ reviewId: 'a', sortRank: 0 }] }),
    ctx
  );
  assert.equal(result.status, 200);
  assert.equal(markCalls.length, 1);
  assert.equal(markCalls[0].projectId, 'proj-1');
  assert.equal(markCalls[0].workflow, 'competition-scraping');
});
