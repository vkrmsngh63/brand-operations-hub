import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeReviewsByIdHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/reviews-by-id';

// W#2 API — captured reviews (per-row PATCH + DELETE).
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.1b + §C.2.
//
// Path note: the per-record path lives at the shallow shape matching the
// text/[textId] / images/[imageId] / videos/[videoId] precedent rather than
// the nested urls/[urlId]/reviews/[reviewId] shape Workstream 1 originally
// scaffolded — review IDs are globally unique so the deeper path adds no
// security and the shallower path keeps the per-record DELETE/PATCH surface
// uniform across all four capture types.
//
// Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/reviews-by-id.ts` (loadable
// directly by `node --test`); this file is the thin production shim.

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

const inner = makeReviewsByIdHandlers({
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

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const result = await inner.PATCH(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const result = await inner.DELETE(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
