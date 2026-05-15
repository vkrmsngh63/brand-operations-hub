import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeUrlTextHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/url-text';

// W#2 API — captured text (collection routes for the URL-detail page).
//
// Per P-31 (2026-05-15-h) the handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/url-text.ts` (loadable directly
// by `node --test`); this file is the thin production shim.

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

const inner = makeUrlTextHandlers({
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

export async function GET(req: NextRequest, ctx: Ctx) {
  const result = await inner.GET(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const result = await inner.POST(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
