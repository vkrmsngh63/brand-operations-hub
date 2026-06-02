import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeComprehensiveAnalysisPrimerDocHandlers,
  type Ctx,
  type VerifyProjectAuthFn,
} from '@/lib/competition-scraping/handlers/comprehensive-analysis-primer-doc';

// W#2 P-55 Phase 3 part 3 — the director's SAVED edit of the teaching primer.
// Stored in the additive `primerJson` column of the per-Project
// ComprehensiveCompetitorAnalysis row (this handler owns only that column).
// GET → { primerJson | null }; PUT → upsert { primerJson | null }.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

const verifyProjectAuthAdapter: VerifyProjectAuthFn = async (_req, projectId) => {
  const auth = await verifyProjectAuth(_req as NextRequest, projectId);
  if (auth.error) {
    try {
      const body = await auth.error.json();
      return { userId: null, error: { status: auth.error.status, body } };
    } catch {
      return {
        userId: null,
        error: { status: auth.error.status, body: { error: 'Auth failed' } },
      };
    }
  }
  return { userId: auth.userId, error: null };
};

const handlers = makeComprehensiveAnalysisPrimerDocHandlers({
  prisma,
  verifyProjectAuth: verifyProjectAuthAdapter,
  recordFlake,
  withRetry,
});

export async function GET(req: NextRequest, ctx: Ctx) {
  const result = await handlers.GET(req, ctx);
  return withCors(req, NextResponse.json(result.body, { status: result.status }));
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const result = await handlers.PUT(req, ctx);
  return withCors(req, NextResponse.json(result.body, { status: result.status }));
}
