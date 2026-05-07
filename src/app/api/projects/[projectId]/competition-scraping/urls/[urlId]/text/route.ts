import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import type {
  CapturedText,
  CreateCapturedTextRequest,
  ListCapturedTextsResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured text (collection routes).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
// Sibling file ../../text/[textId]/route.ts handles per-row PATCH + DELETE.
//
// Idempotency: POST is idempotent on clientId (the extension's WAL key
// per §8.3.1). A duplicate-clientId attempt returns the existing row
// with 200 instead of erroring. Matches §11.2 extension-idempotency
// intent and the urls collection POST pattern.

const WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.capturedText.findUnique>>
): CapturedText | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    contentCategory: row.contentCategory,
    text: row.text,
    tags: (row.tags ?? []) as string[],
    sortOrder: row.sortOrder,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/text
// Lists every CapturedText attached to the URL. Verifies the parent URL
// belongs to this Project's W#2 workflow before reading; forged urlIds get
// 404 the same as the POST handler.
//
// Ordering: (sortOrder ASC, addedAt ASC) — stable across reloads so the
// detail-page table doesn't reshuffle on refresh.
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; urlId: string }>;
  }
) {
  const { projectId, urlId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  try {
    const parent = await withRetry(() =>
      prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { id: true },
      })
    );
    if (!parent) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Competitor URL not found' },
          { status: 404 }
        )
      );
    }
    const rows = await withRetry(() =>
      prisma.capturedText.findMany({
        where: { competitorUrlId: urlId },
        orderBy: [{ sortOrder: 'asc' }, { addedAt: 'asc' }],
      })
    );
    const wire = rows.map((r) => toWireShape(r)!) satisfies ListCapturedTextsResponse;
    return withCors(req, NextResponse.json(wire));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/text',
      error,
      { projectWorkflowId }
    );
    console.error('GET competition-scraping text error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch captured text' },
        { status: 500 }
      )
    );
  }
}

// POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text
// Body: CreateCapturedTextRequest. Required: clientId, text. Idempotent
// on clientId.
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; urlId: string }>;
  }
) {
  const { projectId, urlId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId, userId } = auth;

  let body: Partial<CreateCapturedTextRequest>;
  try {
    body = (await req.json()) as Partial<CreateCapturedTextRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const clientId =
    typeof body.clientId === 'string' ? body.clientId.trim() : '';
  if (!clientId) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'clientId is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }
  // text is meaningful when present but may be empty after trim — we
  // accept empty-string text in case the user wants to capture a "blank"
  // marker row. Reject only undefined / non-string.
  if (typeof body.text !== 'string') {
    return withCors(
      req,
      NextResponse.json(
        { error: 'text is required and must be a string' },
        { status: 400 }
      )
    );
  }
  const text = body.text;

  if (body.tags !== undefined && !isStringArray(body.tags)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'tags must be an array of strings' },
        { status: 400 }
      )
    );
  }
  if (body.sortOrder !== undefined && typeof body.sortOrder !== 'number') {
    return withCors(
      req,
      NextResponse.json(
        { error: 'sortOrder must be a number' },
        { status: 400 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2 workflow
  // before creating the text. Same defense as the sizes POST handler.
  const parent = await withRetry(() =>
    prisma.competitorUrl.findFirst({
      where: { id: urlId, projectWorkflowId },
      select: { id: true },
    })
  );
  if (!parent) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Competitor URL not found' },
        { status: 404 }
      )
    );
  }

  const contentCategory =
    typeof body.contentCategory === 'string' && body.contentCategory.trim()
      ? body.contentCategory.trim()
      : null;

  const createData: Prisma.CapturedTextUncheckedCreateInput = {
    clientId,
    competitorUrlId: urlId,
    contentCategory,
    text,
    tags: body.tags ?? [],
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
    addedBy: userId,
  };

  try {
    const created = await withRetry(() =>
      prisma.capturedText.create({ data: createData })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(
      req,
      NextResponse.json(toWireShape(created), { status: 201 })
    );
  } catch (error) {
    // P2002 — clientId already exists (extension retry). Look up the
    // existing row and return it. The existing row may have a different
    // competitorUrlId if the caller is buggy — but the schema-level
    // unique constraint is only on clientId, not (urlId, clientId), so
    // we trust the original row's parent.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      try {
        const existing = await withRetry(() =>
          prisma.capturedText.findUnique({
            where: { clientId },
          })
        );
        if (existing) {
          return withCors(
            req,
            NextResponse.json(toWireShape(existing), { status: 200 })
          );
        }
      } catch (lookupError) {
        recordFlake(
          'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text (idempotent-lookup)',
          lookupError,
          { retried: true, projectWorkflowId }
        );
      }
    }
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('POST competition-scraping text error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create captured text' },
        { status: 500 }
      )
    );
  }
}
