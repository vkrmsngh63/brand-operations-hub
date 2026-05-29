// W#2 P-49 Workstream 5 Session 3 FF#1 — node:test cases for the
// review-analysis PATCH handler (edit a stored Per-Competitor summary).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Prisma } from '@prisma/client';

import {
  makeReviewAnalysisUpdateHandlers,
  type Ctx,
  type RequestLike,
  type ReviewAnalysisRowForUpdate,
  type ReviewAnalysisUpdateHandlerDeps,
  type ReviewAnalysisUpdatePrismaLike,
  type ReviewAnalysisUpdateResponseBody,
  type VerifyAuthFn,
} from './review-analysis-update.ts';

// ─── Stubs ───────────────────────────────────────────────────────────

function makeRequest(body: unknown): RequestLike {
  return {
    json: async () => body,
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

function makeCtx(projectId: string, analysisId: string): Ctx {
  return { params: Promise.resolve({ projectId, analysisId }) };
}

function makeAuthOk(
  projectWorkflowId = 'pw-1',
  userId = 'user-1'
): VerifyAuthFn {
  return async () => ({ projectWorkflowId, userId, error: null });
}

function makePrisma(opts: {
  row?: ReviewAnalysisRowForUpdate | null;
  findUniqueThrows?: unknown;
  updateThrows?: unknown;
}): {
  prisma: ReviewAnalysisUpdatePrismaLike;
  state: {
    findUniqueCalls: number;
    updateCalls: Array<{ id: string; analysisJson: Prisma.InputJsonValue }>;
    reviewUpdateCalls: Array<{ id: string; analysis: Prisma.InputJsonValue }>;
  };
} {
  const state = {
    findUniqueCalls: 0,
    updateCalls: [] as Array<{ id: string; analysisJson: Prisma.InputJsonValue }>,
    reviewUpdateCalls: [] as Array<{ id: string; analysis: Prisma.InputJsonValue }>,
  };
  const prisma: ReviewAnalysisUpdatePrismaLike = {
    reviewAnalysis: {
      findUnique: async (args) => {
        state.findUniqueCalls++;
        if (opts.findUniqueThrows !== undefined) throw opts.findUniqueThrows;
        if (opts.row === null) return null;
        if (opts.row === undefined) {
          // Default row: PER_PRODUCT, scoped to pw-1
          return {
            id: args.where.id,
            level: 'PER_PRODUCT',
            urlId: 'url-1',
            projectId: 'proj-1',
            analysisJson: {
              summary: '## Product critiques\n- Original summary',
            } as Prisma.JsonValue,
            competitorUrl: { projectWorkflowId: 'pw-1' },
          };
        }
        return opts.row;
      },
      update: async (args) => {
        state.updateCalls.push({
          id: args.where.id,
          analysisJson: args.data.analysisJson,
        });
        if (opts.updateThrows !== undefined) throw opts.updateThrows;
        return {
          id: args.where.id,
          analysisJson: args.data.analysisJson as Prisma.JsonValue,
        };
      },
    },
    capturedReview: {
      update: async (args) => {
        state.reviewUpdateCalls.push({
          id: args.where.id,
          analysis: args.data.analysis,
        });
        return { id: args.where.id };
      },
    },
  };
  return { prisma, state };
}

function makeDeps(
  overrides: Partial<ReviewAnalysisUpdateHandlerDeps> = {}
): ReviewAnalysisUpdateHandlerDeps {
  const { prisma } = makePrisma({});
  return {
    prisma,
    verifyAuth: makeAuthOk(),
    recordFlake: () => {},
    withRetry: async <T,>(fn: () => Promise<T>) => fn(),
    ...overrides,
  };
}

// ─── Auth + validation ──────────────────────────────────────────────

test('PATCH 401 when auth fails', async () => {
  const deps = makeDeps({
    verifyAuth: async () => ({
      projectWorkflowId: null,
      userId: null,
      error: { status: 401, body: { error: 'no token' } },
    }),
  });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 401);
});

test('PATCH 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    {
      json: async () => {
        throw new Error('bad');
      },
      nextUrl: { searchParams: new URLSearchParams() },
    },
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Invalid JSON body/);
});

test('PATCH 400 when summary field is missing or not a string', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r1 = await PATCH(makeRequest({}), makeCtx('proj-1', 'an-1'));
  assert.equal(r1.status, 400);
  assert.match(JSON.stringify(r1.body), /summary must be a string/);
  const r2 = await PATCH(
    makeRequest({ summary: 42 }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r2.status, 400);
});

test('PATCH 400 when summary is empty or whitespace-only', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r1 = await PATCH(
    makeRequest({ summary: '' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r1.status, 400);
  assert.match(JSON.stringify(r1.body), /non-empty string/);
  const r2 = await PATCH(
    makeRequest({ summary: '   ' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r2.status, 400);
});

test('PATCH 400 when summary exceeds max length', async () => {
  const deps = makeDeps();
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'x'.repeat(50_001) }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /too long/);
});

// ─── Scope + not-found ──────────────────────────────────────────────

test('PATCH 404 when row does not exist', async () => {
  const { prisma } = makePrisma({ row: null });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-missing')
  );
  assert.equal(r.status, 404);
  assert.match(JSON.stringify(r.body), /not found/);
});

test('PATCH 404 when row belongs to a different project', async () => {
  const { prisma, state } = makePrisma({
    row: {
      id: 'an-1',
      level: 'PER_PRODUCT',
      urlId: 'url-other',
      projectId: 'proj-other',
      analysisJson: { summary: 'foreign' } as Prisma.JsonValue,
      // Different projectWorkflowId than the auth.
      competitorUrl: { projectWorkflowId: 'pw-OTHER' },
    },
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 404);
  assert.match(JSON.stringify(r.body), /not found in this project/);
  // No update should fire.
  assert.equal(state.updateCalls.length, 0);
});

// P-49 W5 Fix Session B (2026-05-30; D-11) — PER_REVIEW edits are now
// accepted (Q9 → same Edit-button pattern as the banner) and also sync the
// review's "Your Analysis" box (CapturedReview.analysis).
test('PATCH 200 on PER_REVIEW edit — updates row + writes back to CapturedReview.analysis (D-11)', async () => {
  const { prisma, state } = makePrisma({
    row: {
      id: 'an-1',
      level: 'PER_REVIEW',
      urlId: 'url-1',
      projectId: 'proj-1',
      analysisJson: {
        reviewId: 'rev-a',
        summary: 'A review-level summary',
      } as Prisma.JsonValue,
      competitorUrl: { projectWorkflowId: 'pw-1' },
    },
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: '- edited bullet' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 200);
  // ReviewAnalysis row updated with the new summary (reviewId preserved).
  assert.equal(state.updateCalls.length, 1);
  const writtenJson = state.updateCalls[0].analysisJson as {
    summary?: string;
    reviewId?: string;
  };
  assert.match(writtenJson.summary ?? '', /edited bullet/);
  assert.equal(writtenJson.reviewId, 'rev-a');
  // Write-back to CapturedReview.analysis (TipTap doc) targeting the reviewId.
  assert.equal(state.reviewUpdateCalls.length, 1);
  assert.equal(state.reviewUpdateCalls[0].id, 'rev-a');
  const doc = state.reviewUpdateCalls[0].analysis as { type?: string };
  assert.equal(doc.type, 'doc');
});

test('PATCH 400 when row level is an unsupported aggregation level (PER_CATEGORY)', async () => {
  const { prisma, state } = makePrisma({
    row: {
      id: 'an-1',
      level: 'PER_CATEGORY',
      urlId: 'url-1',
      projectId: 'proj-1',
      analysisJson: { summary: 'A category-level summary' } as Prisma.JsonValue,
      competitorUrl: { projectWorkflowId: 'pw-1' },
    },
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /Edit not supported for level=PER_CATEGORY/);
  assert.equal(state.updateCalls.length, 0);
  assert.equal(state.reviewUpdateCalls.length, 0);
});

// ─── Happy path ─────────────────────────────────────────────────────

test('PATCH 200 happy path — overwrites summary, returns updated row', async () => {
  const { prisma, state } = makePrisma({});
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: '## Product critiques\n- Director-edited summary' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as ReviewAnalysisUpdateResponseBody;
  assert.equal(body.id, 'an-1');
  assert.match(body.summary, /Director-edited summary/);
  assert.equal(state.updateCalls.length, 1);
  // Verify the persisted analysisJson preserved any non-summary fields.
  const writtenJson = state.updateCalls[0].analysisJson as {
    summary?: string;
  };
  assert.match(writtenJson.summary ?? '', /Director-edited summary/);
});

test('PATCH 200 trims surrounding whitespace from summary', async () => {
  const { prisma, state } = makePrisma({});
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: '   ## Product critiques\n- Trimmed   ' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 200);
  const writtenJson = state.updateCalls[0].analysisJson as { summary: string };
  // Leading/trailing whitespace stripped; interior preserved.
  assert.equal(writtenJson.summary.startsWith('## Product critiques'), true);
  assert.equal(writtenJson.summary.endsWith('Trimmed'), true);
});

test('PATCH 200 preserves non-summary fields in analysisJson', async () => {
  const { prisma, state } = makePrisma({
    row: {
      id: 'an-1',
      level: 'PER_PRODUCT',
      urlId: 'url-1',
      projectId: 'proj-1',
      analysisJson: {
        summary: 'old',
        // Some hypothetical future field that we want to preserve on edit.
        modelVersion: 'claude-opus-4-7',
      } as Prisma.JsonValue,
      competitorUrl: { projectWorkflowId: 'pw-1' },
    },
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  await PATCH(
    makeRequest({ summary: 'new' }),
    makeCtx('proj-1', 'an-1')
  );
  const writtenJson = state.updateCalls[0].analysisJson as Record<string, unknown>;
  assert.equal(writtenJson.summary, 'new');
  // Preserved alongside the edit.
  assert.equal(writtenJson.modelVersion, 'claude-opus-4-7');
});

test('PATCH 500 when Prisma update throws', async () => {
  const { prisma } = makePrisma({
    updateThrows: new Error('connection lost'),
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 500);
  assert.match(JSON.stringify(r.body), /Failed to persist edit/);
});

test('PATCH 500 when findUnique throws', async () => {
  const { prisma } = makePrisma({
    findUniqueThrows: new Error('connection lost'),
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ summary: 'edited' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 500);
  assert.match(JSON.stringify(r.body), /Failed to load/);
});

// ─── FU-1 (a.110) — structured categories edit/delete ──────────────────

test('PATCH 200 categories edit — persists trimmed categories + re-derived summary + manuallyEdited; never touches CapturedReviews', async () => {
  const { prisma, state } = makePrisma({}); // default row is PER_PRODUCT
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({
      categories: [
        {
          name: '  Product critiques  ',
          bullets: [{ text: '  No effect  ', reviewIds: ['id-a', 'id-b'] }],
        },
      ],
    }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 200);
  const body = r.body as ReviewAnalysisUpdateResponseBody;
  // Response echoes the server-normalized structured shape.
  assert.ok(body.categories);
  assert.equal(body.categories?.length, 1);
  assert.equal(body.categories?.[0].name, 'Product critiques');
  // Persisted analysisJson carries categories + re-derived flattened summary +
  // the manuallyEdited flag.
  assert.equal(state.updateCalls.length, 1);
  const writtenJson = state.updateCalls[0].analysisJson as {
    categories?: unknown[];
    summary?: string;
    manuallyEdited?: boolean;
  };
  assert.equal(writtenJson.categories?.length, 1);
  assert.equal(writtenJson.manuallyEdited, true);
  // Flattened summary matches the "## name / - bullet" shape the main table reads.
  assert.match(writtenJson.summary ?? '', /## Product critiques/);
  assert.match(writtenJson.summary ?? '', /- No effect/);
  // The captured reviews are NOT mutated by a structured edit.
  assert.equal(state.reviewUpdateCalls.length, 0);
});

test('PATCH 200 categories edit accepts an empty array (delete-all) → no-critiques summary', async () => {
  const { prisma, state } = makePrisma({});
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ categories: [] }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 200);
  const writtenJson = state.updateCalls[0].analysisJson as {
    categories?: unknown[];
    summary?: string;
  };
  assert.deepEqual(writtenJson.categories, []);
  assert.match(writtenJson.summary ?? '', /no critiques/);
});

test('PATCH 400 categories edit rejects a non-array categories value', async () => {
  const { prisma, state } = makePrisma({});
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({ categories: 'nope' }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /categories must be an array/);
  assert.equal(state.updateCalls.length, 0);
});

test('PATCH 400 categories edit rejected on a PER_REVIEW row', async () => {
  const { prisma, state } = makePrisma({
    row: {
      id: 'an-1',
      level: 'PER_REVIEW',
      urlId: 'url-1',
      projectId: 'proj-1',
      analysisJson: { reviewId: 'rev-a', summary: 'x' } as Prisma.JsonValue,
      competitorUrl: { projectWorkflowId: 'pw-1' },
    },
  });
  const deps = makeDeps({ prisma });
  const { PATCH } = makeReviewAnalysisUpdateHandlers(deps);
  const r = await PATCH(
    makeRequest({
      categories: [{ name: 'X', bullets: [{ text: 'y', reviewIds: [] }] }],
    }),
    makeCtx('proj-1', 'an-1')
  );
  assert.equal(r.status, 400);
  assert.match(JSON.stringify(r.body), /only supported for PER_PRODUCT/);
  assert.equal(state.updateCalls.length, 0);
});
