import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeComprehensiveAnalysisHandlers,
  type Ctx,
  type VerifyProjectAuthFn,
} from '@/lib/competition-scraping/handlers/comprehensive-analysis';

// W#2 P-46 Workstream 4 — per-Project Comprehensive Competitor Analysis
// rich-text doc. Auth-derived userId is stamped onto lastEditedBy on every
// upsert; project ownership verified via verifyProjectAuth.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §C.4.
// 2026-05-24 — replaces Workstream 1's 501 stub at this same path.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Adapt verifyProjectAuth's NextResponse error shape to the HandlerResult
// shape the DI seam expects. On success forward only the userId.
const verifyProjectAuthAdapter: VerifyProjectAuthFn = async (
  _req,
  projectId
) => {
  const auth = await verifyProjectAuth(_req as NextRequest, projectId);
  if (auth.error) {
    try {
      const body = await auth.error.json();
      return {
        userId: null,
        error: { status: auth.error.status, body },
      };
    } catch {
      return {
        userId: null,
        error: { status: auth.error.status, body: { error: 'Auth failed' } },
      };
    }
  }
  return { userId: auth.userId, error: null };
};

const handlers = makeComprehensiveAnalysisHandlers({
  prisma,
  verifyProjectAuth: verifyProjectAuthAdapter,
  recordFlake,
  withRetry,
});

export async function GET(req: NextRequest, ctx: Ctx) {
  const result = await handlers.GET(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const result = await handlers.PUT(req, ctx);
  return withCors(
    req,
    NextResponse.json(result.body, { status: result.status })
  );
}
