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
  UpdateCapturedTextRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured text (per-row PATCH + DELETE).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.

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
    source: row.source as CapturedText['source'],
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

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; textId: string }>;
  }
) {
  const { projectId, textId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: UpdateCapturedTextRequest;
  try {
    body = (await req.json()) as UpdateCapturedTextRequest;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const owned = await withRetry(() =>
    prisma.capturedText.findFirst({
      where: {
        id: textId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Captured text not found' },
        { status: 404 }
      )
    );
  }

  const data: Prisma.CapturedTextUncheckedUpdateInput = {};

  if (body.text !== undefined) {
    if (typeof body.text !== 'string') {
      return withCors(
        req,
        NextResponse.json(
          { error: 'text must be a string' },
          { status: 400 }
        )
      );
    }
    data.text = body.text;
  }
  if (body.contentCategory !== undefined) {
    data.contentCategory =
      typeof body.contentCategory === 'string' && body.contentCategory.trim()
        ? body.contentCategory.trim()
        : null;
  }
  if (body.tags !== undefined) {
    if (!isStringArray(body.tags)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'tags must be an array of strings' },
          { status: 400 }
        )
      );
    }
    data.tags = body.tags;
  }
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'sortOrder must be a number' },
          { status: 400 }
        )
      );
    }
    data.sortOrder = body.sortOrder;
  }

  try {
    const updated = await withRetry(() =>
      prisma.capturedText.update({
        where: { id: textId },
        data,
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json(toWireShape(updated)));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Captured text not found' },
          { status: 404 }
        )
      );
    }
    recordFlake(
      'PATCH /api/projects/[projectId]/competition-scraping/text/[textId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('PATCH competition-scraping text error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to update captured text' },
        { status: 500 }
      )
    );
  }
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; textId: string }>;
  }
) {
  const { projectId, textId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const owned = await withRetry(() =>
    prisma.capturedText.findFirst({
      where: {
        id: textId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    return withCors(req, NextResponse.json({ success: true }));
  }

  try {
    await withRetry(() =>
      prisma.capturedText.delete({
        where: { id: textId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json({ success: true }));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withCors(req, NextResponse.json({ success: true }));
    }
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/text/[textId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('DELETE competition-scraping text error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to delete captured text' },
        { status: 500 }
      )
    );
  }
}
