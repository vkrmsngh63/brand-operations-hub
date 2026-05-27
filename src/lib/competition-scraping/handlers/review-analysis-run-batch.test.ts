// W#2 P-49 Workstream 5 Session 2 — node:test cases for the per-batch
// review-analysis handler. Exercises the DI seam end-to-end with stub
// Prisma + stub Anthropic client; never calls the real Anthropic API.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Prisma } from '@prisma/client';
import type Anthropic from '@anthropic-ai/sdk';

import type { AnthropicClientLike } from '../review-analysis/client.ts';
import { computeReviewsHash } from '../review-analysis/cache.ts';

import {
  SUPPORTED_FLOWS,
  SHIPPED_FLOWS,
  extractJsonFromModelText,
  indexSummariesByReviewId,
  isReviewAnalysisFlow,
  makeReviewAnalysisRunBatchHandlers,
  type CapturedReviewForBatchRow,
  type CompetitorUrlForBatchRow,
  type Ctx,
  type PerReviewBatchResponseBody,
  type RequestLike,
  type ReviewAnalysisCachedRow,
  type ReviewAnalysisRunBatchHandlerDeps,
  type ReviewAnalysisRunBatchPrismaLike,
  type VerifyAuthFn,
} from './review-analysis-run-batch.ts';

// ─── Stubs ───────────────────────────────────────────────────────────

function makeRequest(body: unknown): RequestLike {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

function makeCtx(projectId: string): Ctx {
  return { params: Promise.resolve({ projectId }) };
}

function makeAuthOk(
  projectWorkflowId = 'pw-1',
  userId = 'user-1'
): VerifyAuthFn {
  return async () => ({ projectWorkflowId, userId, error: null });
}

function makeAnthropicMessage(
  jsonText: string,
  usage: Partial<Anthropic.Usage> = {}
): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-4-7',
    content: [{ type: 'text', text: jsonText, citations: [] }],
    stop_reason: 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: 1000,
      output_tokens: 500,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      ...usage,
    },
  } as unknown as Anthropic.Message;
}

function makeAnthropicClient(opts: {
  countTokensResult?: number;
  createResult?: Anthropic.Message;
  createThrows?: unknown;
  countTokensThrows?: unknown;
}): {
  client: AnthropicClientLike;
  state: {
    countTokensCalls: number;
    createCalls: Array<unknown>;
  };
} {
  const state = {
    countTokensCalls: 0,
    createCalls: [] as Array<unknown>,
  };
  const client: AnthropicClientLike = {
    messages: {
      countTokens: (async () => {
        state.countTokensCalls++;
        if (opts.countTokensThrows !== undefined) throw opts.countTokensThrows;
        return { input_tokens: opts.countTokensResult ?? 1500 };
      }) as unknown as AnthropicClientLike['messages']['countTokens'],
      create: (async (input: unknown) => {
        state.createCalls.push(input);
        if (opts.createThrows !== undefined) throw opts.createThrows;
        return opts.createResult ?? makeAnthropicMessage('{"summaries":[]}');
      }) as unknown as AnthropicClientLike['messages']['create'],
    },
  };
  return { client, state };
}

function makePrisma(opts: {
  url?: CompetitorUrlForBatchRow | null;
  reviews?: CapturedReviewForBatchRow[];
  cachedRows?: ReviewAnalysisCachedRow[];
  cachedFindManyThrows?: unknown;
  createThrows?: unknown;
}): {
  prisma: ReviewAnalysisRunBatchPrismaLike;
  state: {
    createCalls: Array<{ data: Prisma.ReviewAnalysisUncheckedCreateInput }>;
    cacheFindManyCalls: number;
  };
} {
  const state = {
    createCalls: [] as Array<{
      data: Prisma.ReviewAnalysisUncheckedCreateInput;
    }>,
    cacheFindManyCalls: 0,
  };
  const prisma: ReviewAnalysisRunBatchPrismaLike = {
    competitorUrl: {
      findFirst: async () =>
        opts.url === undefined
          ? {
              id: 'url-1',
              projectWorkflowId: 'pw-1',
              platform: 'amazon',
              productName: 'Stub Product',
            }
          : opts.url,
    },
    capturedReview: {
      findMany: async () => opts.reviews ?? [],
    },
    reviewAnalysis: {
      findMany: async () => {
        state.cacheFindManyCalls++;
        if (opts.cachedFindManyThrows !== undefined) {
          throw opts.cachedFindManyThrows;
        }
        return opts.cachedRows ?? [];
      },
      create: async (args) => {
        state.createCalls.push(args);
        if (opts.createThrows !== undefined) throw opts.createThrows;
        return { id: 'analysis-' + state.createCalls.length };
      },
    },
  };
  return { prisma, state };
}

function makeDeps(
  overrides: Partial<ReviewAnalysisRunBatchHandlerDeps> = {}
): ReviewAnalysisRunBatchHandlerDeps {
  const { prisma } = makePrisma({});
  const { client } = makeAnthropicClient({});
  return {
    prisma,
    verifyAuth: makeAuthOk(),
    anthropicClient: client,
    recordFlake: () => {},
    withRetry: async <T,>(fn: () => Promise<T>) => fn(),
    ...overrides,
  };
}

function sampleReview(
  id: string,
  bodyChars = 100
): CapturedReviewForBatchRow {
  return {
    id,
    competitorUrlId: 'url-1',
    starRating: 5,
    body: 'x'.repeat(bodyChars),
    reviewerName: 'Stub',
    reviewDate: new Date('2026-01-15T00:00:00Z'),
  };
}

// ─── Flow registry tests ────────────────────────────────────────────

test('SUPPORTED_FLOWS contains all 7 flows from §B 2026-05-27', () => {
  assert.equal(SUPPORTED_FLOWS.length, 7);
  assert.ok(SUPPORTED_FLOWS.includes('per-review-summarize'));
  assert.ok(SUPPORTED_FLOWS.includes('per-competitor-bulleted'));
  assert.ok(SUPPORTED_FLOWS.includes('per-competitor-nonbulleted'));
  assert.ok(SUPPORTED_FLOWS.includes('per-category-bulleted'));
  assert.ok(SUPPORTED_FLOWS.includes('per-category-nonbulleted'));
  assert.ok(SUPPORTED_FLOWS.includes('per-type-bulleted'));
  assert.ok(SUPPORTED_FLOWS.includes('per-type-nonbulleted'));
});

test('SHIPPED_FLOWS in Session 2 contains only per-review-summarize', () => {
  assert.equal(SHIPPED_FLOWS.size, 1);
  assert.ok(SHIPPED_FLOWS.has('per-review-summarize'));
});

test('isReviewAnalysisFlow narrows known values', () => {
  assert.equal(isReviewAnalysisFlow('per-review-summarize'), true);
  assert.equal(isReviewAnalysisFlow('per-type-bulleted'), true);
  assert.equal(isReviewAnalysisFlow('nonsense'), false);
  assert.equal(isReviewAnalysisFlow(null), false);
  assert.equal(isReviewAnalysisFlow(undefined), false);
  assert.equal(isReviewAnalysisFlow(42), false);
});

// ─── extractJsonFromModelText tests ─────────────────────────────────

test('extractJsonFromModelText parses bare JSON', () => {
  assert.deepEqual(
    extractJsonFromModelText('{"summaries":[]}'),
    { summaries: [] }
  );
});

test('extractJsonFromModelText strips ```json fences', () => {
  assert.deepEqual(
    extractJsonFromModelText('```json\n{"summaries":[]}\n```'),
    { summaries: [] }
  );
});

test('extractJsonFromModelText throws on no-JSON input', () => {
  assert.throws(
    () => extractJsonFromModelText('no json'),
    /did not contain a JSON object/
  );
});

// ─── indexSummariesByReviewId helper ────────────────────────────────

test('indexSummariesByReviewId builds reviewId → summary map', () => {
  const map = indexSummariesByReviewId([
    { reviewId: 'rev-a', summary: 'A' },
    { reviewId: 'rev-b', summary: 'B' },
  ]);
  assert.deepEqual(map, { 'rev-a': 'A', 'rev-b': 'B' });
});

// ─── Auth + validation ──────────────────────────────────────────────

test('POST 401 when auth fails', async () => {
  const deps = makeDeps({
    verifyAuth: async () => ({
      projectWorkflowId: null,
      userId: null,
      error: { status: 401, body: { error: 'no token' } },
    }),
  });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(makeRequest({}), makeCtx('proj-1'));
  assert.equal(r.status, 401);
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    {
      json: async () => {
        throw new Error('bad');
      },
      nextUrl: { searchParams: new URLSearchParams() },
    },
    makeCtx('proj-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Invalid JSON body/);
});

test('POST 400 when flow is missing or unknown', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r1 = await POST(
    makeRequest({ urlId: 'url-1', reviewIds: ['r1'] }),
    makeCtx('proj-1')
  );
  assert.equal(r1.status, 400);
  assert.match(JSON.stringify(r1.body), /flow must be one of/);

  const r2 = await POST(
    makeRequest({ flow: 'invented', urlId: 'url-1', reviewIds: ['r1'] }),
    makeCtx('proj-1')
  );
  assert.equal(r2.status, 400);
});

test('POST 400 when flow is recognized but not yet shipped', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-category-bulleted',
      urlId: 'url-1',
      reviewIds: ['r1'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /not yet shipped/);
});

test('POST 400 when urlId is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({ flow: 'per-review-summarize', reviewIds: ['r1'] }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /urlId is required/);
});

test('POST 400 when reviewIds is missing or empty', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r1 = await POST(
    makeRequest({ flow: 'per-review-summarize', urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(r1.status, 400);

  const r2 = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: [],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r2.status, 400);
});

test('POST 400 when reviewIds contains duplicates', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['r1', 'r1', 'r2'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /duplicate/);
});

test('POST 400 when modelVersion is unsupported', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['r1'],
      modelVersion: 'gpt-9',
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /modelVersion must be one of/);
});

// ─── URL + review scoping ───────────────────────────────────────────

test('POST 404 when CompetitorUrl is not found in scope', async () => {
  const { prisma } = makePrisma({ url: null });
  const { client } = makeAnthropicClient({});
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['r1'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 404);
  assert.match(JSON.stringify(r.body), /Competitor URL not found/);
});

test('POST 404 when some reviewIds are missing under the URL', async () => {
  const { prisma } = makePrisma({
    reviews: [sampleReview('r1')], // only r1 exists; client asked for r1 + r2
  });
  const { client } = makeAnthropicClient({});
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['r1', 'r2'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 404);
  assert.match(JSON.stringify(r.body), /Some reviewIds not found/);
});

// ─── Happy path — fresh batch (no cache hits) ───────────────────────

test('POST 200 on a fresh batch — one AI call, N persisted rows, summaries returned', async () => {
  const reviews = [sampleReview('rev-a'), sampleReview('rev-b')];
  const { prisma, state: prismaState } = makePrisma({ reviews });
  const modelResponse = makeAnthropicMessage(
    JSON.stringify({
      summaries: [
        { reviewId: 'rev-a', summary: 'A is positive about durability.' },
        { reviewId: 'rev-b', summary: 'B complains about sizing.' },
      ],
    })
  );
  const { client, state: clientState } = makeAnthropicClient({
    createResult: modelResponse,
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a', 'rev-b'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as PerReviewBatchResponseBody;
  assert.equal(body.flow, 'per-review-summarize');
  assert.equal(body.summaries.length, 2);
  assert.equal(body.summaries[0].source, 'fresh');
  assert.equal(body.summaries[0].summary, 'A is positive about durability.');
  assert.equal(body.summaries[1].source, 'fresh');
  assert.equal(body.summaries[1].summary, 'B complains about sizing.');
  assert.equal(body.freshCount, 2);
  assert.equal(body.cachedCount, 0);

  // Exactly one Anthropic create call.
  assert.equal(clientState.createCalls.length, 1);
  // Two persisted rows.
  assert.equal(prismaState.createCalls.length, 2);
  // First row's analysisJson holds reviewId + summary.
  const firstWrite = prismaState.createCalls[0].data.analysisJson as {
    reviewId: string;
    summary: string;
  };
  assert.equal(firstWrite.reviewId, 'rev-a');
});

// ─── Cache-hit path — no AI call needed ─────────────────────────────

test('POST 200 fully from cache — no AI call, no DB writes', async () => {
  const reviews = [sampleReview('rev-a')];
  const cachedHash = computeReviewsHash([{ id: 'rev-a' }], 'claude-opus-4-7');
  const { prisma, state: prismaState } = makePrisma({
    reviews,
    cachedRows: [
      {
        id: 'analysis-cached',
        reviewsHash: cachedHash,
        analysisJson: {
          reviewId: 'rev-a',
          summary: 'Previously generated summary for A.',
        } as Prisma.JsonValue,
        modelVersion: 'claude-opus-4-7',
      },
    ],
  });
  const { client, state: clientState } = makeAnthropicClient({});
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as PerReviewBatchResponseBody;
  assert.equal(body.summaries.length, 1);
  assert.equal(body.summaries[0].source, 'cache');
  assert.equal(
    body.summaries[0].summary,
    'Previously generated summary for A.'
  );
  assert.equal(body.cachedCount, 1);
  assert.equal(body.freshCount, 0);
  // No AI calls.
  assert.equal(clientState.createCalls.length, 0);
  // No new DB writes.
  assert.equal(prismaState.createCalls.length, 0);
});

// ─── Mixed cache + fresh ────────────────────────────────────────────

test('POST 200 with partial cache — one fresh AI call, only fresh rows persisted', async () => {
  const reviews = [sampleReview('rev-a'), sampleReview('rev-b')];
  const cachedHashB = computeReviewsHash([{ id: 'rev-b' }], 'claude-opus-4-7');
  const { prisma, state: prismaState } = makePrisma({
    reviews,
    cachedRows: [
      {
        id: 'analysis-cached-b',
        reviewsHash: cachedHashB,
        analysisJson: {
          reviewId: 'rev-b',
          summary: 'B previously summarized.',
        } as Prisma.JsonValue,
        modelVersion: 'claude-opus-4-7',
      },
    ],
  });
  const { client, state: clientState } = makeAnthropicClient({
    createResult: makeAnthropicMessage(
      JSON.stringify({
        summaries: [{ reviewId: 'rev-a', summary: 'Fresh summary for A.' }],
      })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a', 'rev-b'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as PerReviewBatchResponseBody;
  // Output preserves input order: rev-a fresh, rev-b cached.
  assert.equal(body.summaries[0].reviewId, 'rev-a');
  assert.equal(body.summaries[0].source, 'fresh');
  assert.equal(body.summaries[0].summary, 'Fresh summary for A.');
  assert.equal(body.summaries[1].reviewId, 'rev-b');
  assert.equal(body.summaries[1].source, 'cache');
  assert.equal(body.summaries[1].summary, 'B previously summarized.');
  // One AI call for one uncached review.
  assert.equal(clientState.createCalls.length, 1);
  // Only one new DB write (rev-a only).
  assert.equal(prismaState.createCalls.length, 1);
});

// ─── AI failure modes ───────────────────────────────────────────────

test('POST 502 when AI returns malformed JSON', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    createResult: makeAnthropicMessage('not json at all'),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 502);
  assert.match(JSON.stringify(r.body), /malformed JSON/);
});

test('POST 502 when AI returns schema-invalid JSON', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    createResult: makeAnthropicMessage(
      JSON.stringify({ wrong: 'shape' })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 502);
  assert.match(JSON.stringify(r.body), /per-review batch schema/);
});

test('POST 502 when AI hallucinates extra reviewIds', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma, state: prismaState } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    createResult: makeAnthropicMessage(
      JSON.stringify({
        summaries: [
          { reviewId: 'rev-a', summary: 'A' },
          { reviewId: 'rev-hallucinated', summary: 'X' },
        ],
      })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 502);
  assert.match(JSON.stringify(r.body), /alignment failed/);
  // Critical: NOTHING was persisted on alignment failure.
  assert.equal(prismaState.createCalls.length, 0);
});

test('POST 502 when AI call itself throws', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    createThrows: new Error('upstream 503'),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 502);
  assert.match(JSON.stringify(r.body), /AI call failed/);
});

// ─── countTokens non-fatal failure ──────────────────────────────────

test('POST 200 even when countTokens throws — input-side estimate falls back to 0', async () => {
  // countTokens failure is non-fatal — the handler proceeds with
  // estimatedInputTokens=0; only the output-side portion of the cost
  // estimate survives (covers the AI call's output budget).
  const reviews = [sampleReview('rev-a')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    countTokensThrows: new Error('network'),
    createResult: makeAnthropicMessage(
      JSON.stringify({
        summaries: [{ reviewId: 'rev-a', summary: 'A' }],
      })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  const r = await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as PerReviewBatchResponseBody;
  // Output-side estimate for 1 uncached review (~100 output tokens) at
  // claude-opus-4-7 output rate ($25 / 1M tokens) = $0.0025. Input
  // side fell back to 0 because countTokens threw.
  assert.equal(body.usage.estimatedCostUsd, 0.0025);
});

// ─── modelVersion routing ───────────────────────────────────────────

test('POST uses default modelVersion when none provided', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma, state: prismaState } = makePrisma({ reviews });
  const { client, state: clientState } = makeAnthropicClient({
    createResult: makeAnthropicMessage(
      JSON.stringify({
        summaries: [{ reviewId: 'rev-a', summary: 'A' }],
      })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
    }),
    makeCtx('proj-1')
  );
  // The create call carried model = default (claude-opus-4-7).
  const createInput = clientState.createCalls[0] as { model: string };
  assert.equal(createInput.model, 'claude-opus-4-7');
  // Persisted row records the same model.
  const persisted = prismaState.createCalls[0].data;
  assert.equal(persisted.modelVersion, 'claude-opus-4-7');
});

test('POST honors modelVersion override', async () => {
  const reviews = [sampleReview('rev-a')];
  const { prisma } = makePrisma({ reviews });
  const { client, state: clientState } = makeAnthropicClient({
    createResult: makeAnthropicMessage(
      JSON.stringify({
        summaries: [{ reviewId: 'rev-a', summary: 'A' }],
      })
    ),
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunBatchHandlers(deps);
  await POST(
    makeRequest({
      flow: 'per-review-summarize',
      urlId: 'url-1',
      reviewIds: ['rev-a'],
      modelVersion: 'claude-opus-4-6',
    }),
    makeCtx('proj-1')
  );
  const createInput = clientState.createCalls[0] as { model: string };
  assert.equal(createInput.model, 'claude-opus-4-6');
});
