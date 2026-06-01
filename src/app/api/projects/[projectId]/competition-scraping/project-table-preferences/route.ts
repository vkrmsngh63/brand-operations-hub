import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeProjectTablePreferencesHandlers,
  type Ctx,
  type VerifyProjectAuthFn,
} from '@/lib/competition-scraping/handlers/project-table-preferences';

// W#2 P-54 Phase 3 (2026-06-01) — SHARED per-Project layout for the main
// /competition-scraping Competitor URLs table (column order + show/hide +
// widths + competitor row order + font size). Keyed by projectId; seeded from
// the requesting user's UserTablePreferences on first read so a pre-existing
// layout is preserved. Auth verifies the user can access the project.

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

const handlers = makeProjectTablePreferencesHandlers({
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
