import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeReviewAnalysisRunBatchHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/review-analysis-run-batch';
import { getAnthropicClient } from '@/lib/competition-scraping/review-analysis/client';

// W#2 P-49 Workstream 5 Session 2 — per-batch AI review analysis (POST).
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27 (Reviews Phase 3
// design lock — browser-first execution + per-batch server endpoint).
//
// Replaces the W5 Session 1 per-product two-sweep handler. Of the 7
// flows locked in §B 2026-05-27, Session 2 ships only the
// 'per-review-summarize' flow; the other 6 reject with 400 until their
// prompt builders land in Sessions 3+.
//
// Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts`
// (loadable by `node --test`); this file is the thin production shim.

const productionVerifyAuth: VerifyAuthFn = async (req, projectId, workflow) => {
  const result = await verifyProjectWorkflowAuth(
    req as NextRequest,
    projectId,
    workflow
  );
  if (result.error) {
    const body = await result.error
      .clone()
      .json()
      .catch(() => ({ error: 'Authentication failed' }));
    return {
      projectWorkflowId: null,
      userId: null,
      error: { status: result.error.status, body },
    };
  }
  return {
    projectWorkflowId: result.projectWorkflowId,
    userId: result.userId,
    error: null,
  };
};

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  // Anthropic client is constructed lazily at first request so the
  // route module can be imported in environments without
  // ANTHROPIC_API_KEY set (e.g. type-check, tests). Errors at
  // construction surface as 500 — they only happen when the env var
  // is missing.
  let anthropicClient;
  try {
    anthropicClient = await getAnthropicClient();
  } catch (error) {
    console.error(
      '[review-analysis-run-batch] Anthropic client init failed:',
      error
    );
    return withCors(
      req,
      NextResponse.json(
        { error: 'AI service unavailable — server misconfigured' },
        { status: 500 }
      )
    );
  }

  const inner = makeReviewAnalysisRunBatchHandlers({
    prisma,
    verifyAuth: productionVerifyAuth,
    anthropicClient,
    recordFlake,
    withRetry,
  });

  const result = await inner.POST(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
