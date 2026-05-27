// W#2 P-49 Workstream 5 Session 1 — node:test cases for the per-product
// review analysis handler. Exercises the DI seam end-to-end with stub
// Prisma + stub Anthropic client; does NOT call the real Anthropic API.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Prisma } from '@prisma/client';
import type Anthropic from '@anthropic-ai/sdk';

import type { AnthropicClientLike } from '../review-analysis/client.ts';
import { computeReviewsHash } from '../review-analysis/cache.ts';

import {
  extractJsonFromModelText,
  makeReviewAnalysisRunHandlers,
  type CapturedReviewForAnalysisRow,
  type CompetitorUrlForAnalysisRow,
  type Ctx,
  type RequestLike,
  type ReviewAnalysisRow,
  type ReviewAnalysisRunHandlerDeps,
  type ReviewAnalysisRunPrismaLike,
  type VerifyAuthFn,
} from './review-analysis-run.ts';

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

const VALID_TIPTAP_DOC = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Common praise' }],
    },
  ],
};

function makeResponse(
  jsonText: string,
  usage: Partial<Anthropic.Usage> = {}
): Anthropic.Message {
  // SDK Message type has more required fields than the handler reads;
  // we cast through unknown so the stub only carries what's actually
  // consumed (content + usage + stop_reason).
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
  createSequence?: Array<Anthropic.Message | (() => never)>;
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
  let createCallIndex = 0;
  const client: AnthropicClientLike = {
    messages: {
      countTokens: (async () => {
        state.countTokensCalls++;
        if (opts.countTokensThrows !== undefined) throw opts.countTokensThrows;
        return { input_tokens: opts.countTokensResult ?? 1500 };
      }) as unknown as AnthropicClientLike['messages']['countTokens'],
      create: (async (input: unknown) => {
        state.createCalls.push(input);
        const next = opts.createSequence?.[createCallIndex++];
        if (typeof next === 'function') return next();
        if (next) return next;
        throw new Error(
          `messages.create called more times than the stub sequence supplied (call #${createCallIndex})`
        );
      }) as unknown as AnthropicClientLike['messages']['create'],
    },
  };
  return { client, state };
}

function makePrisma(opts: {
  url?: CompetitorUrlForAnalysisRow | null;
  reviews?: CapturedReviewForAnalysisRow[];
  cachedAnalysis?: ReviewAnalysisRow | null;
  monthSpentMicros?: number | null;
  createResult?: ReviewAnalysisRow;
  createThrows?: unknown;
}): {
  prisma: ReviewAnalysisRunPrismaLike;
  state: {
    createCalls: Array<{ data: Prisma.ReviewAnalysisUncheckedCreateInput }>;
    aggregateCalls: number;
    findFirstCachedCalls: Array<unknown>;
  };
} {
  const state = {
    createCalls: [] as Array<{
      data: Prisma.ReviewAnalysisUncheckedCreateInput;
    }>,
    aggregateCalls: 0,
    findFirstCachedCalls: [] as Array<unknown>,
  };
  const prisma: ReviewAnalysisRunPrismaLike = {
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
      aggregate: async () => {
        state.aggregateCalls++;
        return {
          _sum: {
            costUsdMicros: opts.monthSpentMicros ?? 0,
          },
        };
      },
      findFirst: async (args) => {
        state.findFirstCachedCalls.push(args);
        return opts.cachedAnalysis ?? null;
      },
      create: async (args) => {
        state.createCalls.push(args);
        if (opts.createThrows !== undefined) throw opts.createThrows;
        return (
          opts.createResult ?? {
            id: 'analysis-1',
            level: 'PER_PRODUCT',
            urlId: 'url-1',
            projectId: 'proj-1',
            typeFilter: null,
            analysisJson: args.data.analysisJson as Prisma.JsonValue,
            reviewsHash: args.data.reviewsHash,
            modelVersion: args.data.modelVersion,
            runAt: new Date('2026-06-02T12:00:00Z'),
            runByUserId: args.data.runByUserId ?? null,
            costUsdMicros: args.data.costUsdMicros ?? null,
          }
        );
      },
    },
  };
  return { prisma, state };
}

function makeDeps(
  overrides: Partial<ReviewAnalysisRunHandlerDeps> = {}
): ReviewAnalysisRunHandlerDeps {
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
): CapturedReviewForAnalysisRow {
  return {
    id,
    starRating: 5,
    body: 'x'.repeat(bodyChars),
    reviewerName: 'Stub',
    reviewDate: new Date('2026-01-15T00:00:00Z'),
  };
}

// ─── extractJsonFromModelText unit tests ────────────────────────────

test('extractJsonFromModelText parses a bare JSON object', () => {
  const result = extractJsonFromModelText('{"type":"doc","content":[]}');
  assert.deepEqual(result, { type: 'doc', content: [] });
});

test('extractJsonFromModelText strips ```json ... ``` fences', () => {
  const result = extractJsonFromModelText(
    '```json\n{"type":"doc","content":[]}\n```'
  );
  assert.deepEqual(result, { type: 'doc', content: [] });
});

test('extractJsonFromModelText strips ``` ... ``` fences without language tag', () => {
  const result = extractJsonFromModelText(
    '```\n{"type":"doc","content":[]}\n```'
  );
  assert.deepEqual(result, { type: 'doc', content: [] });
});

test('extractJsonFromModelText trims preamble before the outermost { ... }', () => {
  const result = extractJsonFromModelText(
    'Here is the analysis: {"type":"doc","content":[]} — let me know.'
  );
  assert.deepEqual(result, { type: 'doc', content: [] });
});

test('extractJsonFromModelText throws when no JSON object found', () => {
  assert.throws(
    () => extractJsonFromModelText('no json here at all'),
    /did not contain a JSON object/
  );
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
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 401);
});

test('POST 400 when body is not JSON', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    { json: async () => { throw new Error('bad'); }, nextUrl: { searchParams: new URLSearchParams() } },
    makeCtx('proj-1')
  );
  assert.equal(result.status, 400);
  assert.match(JSON.stringify(result.body), /Invalid JSON body/);
});

test('POST 400 when body is not an object', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(makeRequest('not an object'), makeCtx('proj-1'));
  assert.equal(result.status, 400);
});

test('POST 400 when urlId is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(makeRequest({}), makeCtx('proj-1'));
  assert.equal(result.status, 400);
  assert.match(JSON.stringify(result.body), /urlId is required/);
});

test('POST 400 when modelVersion is unsupported', async () => {
  const deps = makeDeps();
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1', modelVersion: 'gpt-99' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 400);
  assert.match(JSON.stringify(result.body), /modelVersion must be/);
});

// ─── Lookups ────────────────────────────────────────────────────────

test('POST 404 when URL not found', async () => {
  const { prisma } = makePrisma({ url: null });
  const deps = makeDeps({ prisma });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'missing' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 404);
});

test('POST 400 when there are no reviews to analyze', async () => {
  const { prisma } = makePrisma({ reviews: [] });
  const deps = makeDeps({ prisma });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 400);
  assert.match(JSON.stringify(result.body), /No reviews/);
});

// ─── Cache hit ──────────────────────────────────────────────────────

test('POST returns cached analysis when reviewsHash matches', async () => {
  const reviews = [sampleReview('r1'), sampleReview('r2')];
  const hash = computeReviewsHash(reviews, 'claude-opus-4-7');
  const cachedAnalysis: ReviewAnalysisRow = {
    id: 'cached-1',
    level: 'PER_PRODUCT',
    urlId: 'url-1',
    projectId: 'proj-1',
    typeFilter: null,
    analysisJson: VALID_TIPTAP_DOC as Prisma.JsonValue,
    reviewsHash: hash,
    modelVersion: 'claude-opus-4-7',
    runAt: new Date('2026-06-01T00:00:00Z'),
    runByUserId: 'user-prior',
    costUsdMicros: 50_000,
  };
  const { prisma } = makePrisma({ reviews, cachedAnalysis });
  // Anthropic client should NEVER be called when cache hits.
  const { client, state: aiState } = makeAnthropicClient({});
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 200);
  const body = result.body as { cached: boolean; analysis: { id: string } };
  assert.equal(body.cached, true);
  assert.equal(body.analysis.id, 'cached-1');
  assert.equal(aiState.countTokensCalls, 0);
  assert.equal(aiState.createCalls.length, 0);
});

// ─── Cost cap ───────────────────────────────────────────────────────

test('POST 402 when estimated cost would exceed per-month cap', async () => {
  const reviews = [sampleReview('r1')];
  // Pretend $48 already spent this month — $48 + estimate > $50
  const { prisma } = makePrisma({
    reviews,
    monthSpentMicros: 48 * 1_000_000,
  });
  // Big countTokens result so estimate > $2
  const { client } = makeAnthropicClient({ countTokensResult: 1_000_000 });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 402);
  const body = result.body as { reason: string };
  assert.equal(body.reason, 'per_month_exceeded');
});

// ─── Happy path: single batch, no second sweep ─────────────────────

test('POST 201 single-batch path persists ReviewAnalysis row and returns wire shape', async () => {
  const reviews = [sampleReview('r1'), sampleReview('r2')];
  const { prisma, state: prismaState } = makePrisma({ reviews });
  const { client, state: aiState } = makeAnthropicClient({
    countTokensResult: 500,
    createSequence: [makeResponse(JSON.stringify(VALID_TIPTAP_DOC))],
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 201, JSON.stringify(result.body));
  const body = result.body as {
    cached: boolean;
    analysis: { id: string; level: string };
    usage: { batchCount: number; actualCostUsd: number };
  };
  assert.equal(body.cached, false);
  assert.equal(body.analysis.level, 'PER_PRODUCT');
  assert.equal(body.usage.batchCount, 1);
  // No second-sweep call.
  assert.equal(aiState.createCalls.length, 1);
  assert.equal(prismaState.createCalls.length, 1);
  // Persist payload uses the parsed JSON.
  assert.equal(
    prismaState.createCalls[0].data.modelVersion,
    'claude-opus-4-7'
  );
  assert.equal(prismaState.createCalls[0].data.urlId, 'url-1');
  assert.equal(prismaState.createCalls[0].data.projectId, 'proj-1');
});

// ─── Multi-batch happy path with second sweep ──────────────────────

test('POST 201 multi-batch path runs second sweep when batches > 1', async () => {
  // Construct two reviews large enough to land in separate batches.
  const reviews = [
    sampleReview('r1', 300_000), // ~83K tokens — exceeds 80K target → own batch (oversized)
    sampleReview('r2', 300_000),
  ];
  const { prisma } = makePrisma({ reviews });
  const { client, state: aiState } = makeAnthropicClient({
    countTokensResult: 5_000,
    // 2 first-sweep calls + 1 second-sweep call = 3 messages.create calls.
    createSequence: [
      makeResponse(JSON.stringify(VALID_TIPTAP_DOC)),
      makeResponse(JSON.stringify(VALID_TIPTAP_DOC)),
      makeResponse(JSON.stringify(VALID_TIPTAP_DOC)),
    ],
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 201, JSON.stringify(result.body));
  const body = result.body as {
    usage: { batchCount: number; oversizedReviewIds: string[] };
  };
  assert.ok(body.usage.batchCount >= 2);
  // Both oversized reviews surfaced.
  assert.equal(body.usage.oversizedReviewIds.length, 2);
  assert.equal(aiState.createCalls.length, body.usage.batchCount + 1);
});

// ─── Invalid model output ──────────────────────────────────────────

test('POST 502 when AI returns non-JSON text', async () => {
  const reviews = [sampleReview('r1')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    countTokensResult: 500,
    createSequence: [makeResponse('I cannot generate valid JSON for you.')],
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 502);
});

// NOTE: isValidAnalysisPayload (in tiptap-helpers.ts) is intentionally
// lenient — it accepts any non-null non-array object so the route stays
// schema-version-agnostic. Strict TipTap structural validation is the
// editor's job at render time. So we don't test "malformed TipTap
// structure passes JSON parse but fails validator" — there's no such
// gap with the v1 validator.

test('POST 502 when AI call itself throws', async () => {
  const reviews = [sampleReview('r1')];
  const { prisma } = makePrisma({ reviews });
  const { client } = makeAnthropicClient({
    countTokensResult: 500,
    createSequence: [
      () => {
        throw new Error('upstream 500');
      },
    ],
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 502);
});

// ─── Persist failure ───────────────────────────────────────────────

test('POST 500 when Prisma persist throws', async () => {
  const reviews = [sampleReview('r1')];
  const { prisma } = makePrisma({
    reviews,
    createThrows: new Error('DB outage'),
  });
  const { client } = makeAnthropicClient({
    countTokensResult: 500,
    createSequence: [makeResponse(JSON.stringify(VALID_TIPTAP_DOC))],
  });
  const deps = makeDeps({ prisma, anthropicClient: client });
  const { POST } = makeReviewAnalysisRunHandlers(deps);
  const result = await POST(
    makeRequest({ urlId: 'url-1' }),
    makeCtx('proj-1')
  );
  assert.equal(result.status, 500);
});
