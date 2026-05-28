import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeReviewAnalysisListHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/review-analysis-list';

// W#2 P-49 W5 Fix Session A FF2 (2026-05-29) — GET endpoint listing
// PER_REVIEW + PER_PRODUCT ReviewAnalysis rows for the Reviews Analysis
// Table page hydrate-on-refresh. Closes D-8 (persistence-on-refresh
// bug). Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/review-analysis-list.ts`
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

export async function GET(req: NextRequest, ctx: Ctx) {
  const inner = makeReviewAnalysisListHandlers({
    prisma,
    verifyAuth: productionVerifyAuth,
    recordFlake,
    withRetry,
  });

  const result = await inner.GET(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
