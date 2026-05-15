import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  getFullSizeUrl,
  uploadBytesAsServer,
} from '@/lib/competition-storage';
import { composeStoragePath } from '@/lib/competition-storage-helpers';
import { safeFetch } from '@/lib/ssrf-guard';
import {
  makeImagesFetchByUrlHandlers,
  type Ctx,
  type VerifyAuthFn,
} from '@/lib/competition-scraping/handlers/images-fetch-by-url';

// W#2 P-29 Slice #3 — SSRF-guarded fetch-by-URL image-upload endpoint.
//
// Per P-31 (2026-05-15-h) the handler logic + DI seam live in
// `src/lib/competition-scraping/handlers/images-fetch-by-url.ts`; this
// file is the thin production shim. The pure-function SSRF classification
// + safe-fetch logic in `src/lib/ssrf-guard.ts` is covered by 37 separate
// node:test cases in `src/lib/ssrf-guard.test.ts`; this shim's handler
// tests cover the route-level wiring (status-code mapping + body shaping).

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

const inner = makeImagesFetchByUrlHandlers({
  prisma,
  verifyAuth: productionVerifyAuth,
  recordFlake,
  withRetry,
  safeFetch,
  uploadBytesAsServer,
  getFullSizeUrl,
  composeStoragePath,
  generateCapturedImageId: randomUUID,
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
