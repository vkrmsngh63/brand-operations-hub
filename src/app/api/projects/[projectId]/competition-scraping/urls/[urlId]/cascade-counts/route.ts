import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeCascadeCountsHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/cascade-counts';

// W#2 P-28 — cascade-counts route for the URL-delete confirm dialog.
// Returns the count of captured-text + captured-image rows attached to
// a competitor URL so the disclosure dialog can render
// "This will also delete N captured texts and M captured images."
// Handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/cascade-counts.ts`.

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

const inner = makeCascadeCountsHandlers({
  prisma,
  verifyAuth: productionVerifyAuth,
  recordFlake,
  withRetry,
});

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const result = await inner.GET(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
