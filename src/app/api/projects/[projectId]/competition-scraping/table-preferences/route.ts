import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  makeUserTablePreferencesHandlers,
  type Ctx,
  type VerifyProjectAuthFn,
} from '@/lib/competition-scraping/handlers/user-table-preferences';

// W#2 P-46 Workstream 3 — per-user-per-project Competition Data table UI
// preferences. Auth-derived userId; project ownership verified.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.3 + §C.3.
// Path-convention refactor 2026-05-23-d: moved from W1's
// /api/users/[userId]/table-preferences/[projectId] to match the rest of
// W#2's auth-derived-userId convention. The Prisma row is keyed by
// (userId, projectId) compound unique; only the URL surface changed.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Adapt verifyProjectAuth's NextResponse error shape to the HandlerResult
// shape the DI seam expects. On the success path forward only the userId.
const verifyProjectAuthAdapter: VerifyProjectAuthFn = async (_req, projectId) => {
  const auth = await verifyProjectAuth(_req as NextRequest, projectId);
  if (auth.error) {
    // verifyProjectAuth returns a NextResponse on error; rebuild the
    // HandlerResult by reading the status + body. We can read .json() on a
    // NextResponse safely.
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

const handlers = makeUserTablePreferencesHandlers({
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
