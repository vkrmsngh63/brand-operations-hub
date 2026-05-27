import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeReviewAnalysisUpdateHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/review-analysis-update';

// W#2 P-49 Workstream 5 Session 3 FF#1 — PATCH endpoint for editing a
// stored ReviewAnalysis row's summary (director's Phase 4 redirect).
//
// Route: PATCH /api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]
//
// Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/review-analysis-update.ts`
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const inner = makeReviewAnalysisUpdateHandlers({
    prisma,
    verifyAuth: productionVerifyAuth,
    recordFlake,
    withRetry,
  });

  const result = await inner.PATCH(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
