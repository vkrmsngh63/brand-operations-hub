import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeUrlsHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/urls';

// W#2 API — competitor URLs (collection routes).
//
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
// Sibling file [urlId]/route.ts handles per-row PATCH + DELETE.
//
// Per P-31 (2026-05-15-h) the handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/urls.ts` (loadable directly by
// `node --test --experimental-strip-types`); this file is the thin
// production shim that wires real deps + adapts the inner handlers' shape
// to NextRequest/NextResponse and CORS.

// Adapter: real verifyProjectWorkflowAuth returns its 401 NextResponse on
// failure. The inner handler expects the normalized HandlerResult shape,
// so we read the body off the NextResponse before delegating.
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

const inner = makeUrlsHandlers({
  prisma,
  verifyAuth: productionVerifyAuth,
  markWorkflowActive: async (projectId, workflow) => {
    await markWorkflowActive(projectId, workflow);
  },
  recordFlake,
  withRetry,
});

// OPTIONS — CORS preflight. Extension hits this before POST/etc.
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
