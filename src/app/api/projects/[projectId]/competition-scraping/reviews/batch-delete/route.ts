import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeReviewsBatchDeleteHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/reviews-batch-delete';

// W#2 P-49 Workstream 4 Session 1 — batch-delete API route (POST).
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.6 + §C.4.
//
// Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/reviews-batch-delete.ts`
// (loadable directly by `node --test`); this file is the thin
// production shim.

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

const inner = makeReviewsBatchDeleteHandlers({
  prisma,
  verifyAuth: productionVerifyAuth,
  markWorkflowActive: async (projectId, workflow) => {
    await markWorkflowActive(projectId, workflow);
  },
  recordFlake,
  withRetry,
});

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const result = await inner.POST(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
