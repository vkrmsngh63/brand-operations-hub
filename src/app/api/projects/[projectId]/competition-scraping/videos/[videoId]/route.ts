import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { deleteVideo } from '@/lib/competition-video-storage';
import { isValidAnalysisPayload } from '@/lib/rich-text/tiptap-helpers';
import type {
  CapturedVideo,
  UpdateCapturedVideoRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured videos (per-row PATCH + DELETE).
// Spec: docs/CAPTURED_VIDEOS_DESIGN.md §A.7 + A.9.
// Sibling parallel: src/app/api/projects/[projectId]/competition-scraping/
//   images/[imageId]/route.ts
//
// Lives at the SIBLING competition-scraping/videos/[videoId] path, NOT
// nested under urls/[urlId]/videos/ — mirrors the canonical image sibling
// pattern + the text + sizes per-row routes.
//
// PATCH allows editing user-provided metadata (videoCategory, composition,
// embeddedText, tags, sortOrder). The capture-shape fields (clientId,
// sourceType, originalSrcUrl, storage paths, bytes metadata) are immutable
// after :finalize — re-capture is the way to change them.
//
// DELETE removes the DB row AND the storage files (video bytes + thumbnail
// JPEG when present). Storage failure does NOT abort DB delete — orphan
// storage files get swept by the daily janitor so the user-facing delete is
// reliable even if Supabase Storage is briefly unavailable. EMBED rows have
// no storage cleanup (storage paths are NULL).

const WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.capturedVideo.findUnique>>
): CapturedVideo | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    projectId: row.projectId,
    sourceType: row.sourceType as CapturedVideo['sourceType'],
    originalSrcUrl: row.originalSrcUrl,
    storagePath: row.storagePath,
    storageBucket: row.storageBucket,
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    durationSeconds: row.durationSeconds,
    width: row.width,
    height: row.height,
    thumbnailStoragePath: row.thumbnailStoragePath,
    videoCategory: row.videoCategory,
    composition: row.composition,
    embeddedText: row.embeddedText,
    tags: (row.tags ?? []) as string[],
    sortOrder: row.sortOrder,
    source: row.source as CapturedVideo['source'],
    analysis: (row.analysis ?? {}) as Record<string, unknown>,
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
    params: Promise<{ projectId: string; videoId: string }>;
  }
) {
  const { projectId, videoId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: UpdateCapturedVideoRequest;
  try {
    body = (await req.json()) as UpdateCapturedVideoRequest;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const owned = await withRetry(() =>
    prisma.capturedVideo.findFirst({
      where: {
        id: videoId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Captured video not found' },
        { status: 404 }
      )
    );
  }

  const data: Prisma.CapturedVideoUncheckedUpdateInput = {};

  if (body.videoCategory !== undefined) {
    data.videoCategory =
      typeof body.videoCategory === 'string' && body.videoCategory.trim()
        ? body.videoCategory.trim()
        : null;
  }
  if (body.composition !== undefined) {
    if (typeof body.composition !== 'string' && body.composition !== null) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'composition must be a string or null' },
          { status: 400 }
        )
      );
    }
    data.composition =
      typeof body.composition === 'string' && body.composition.trim()
        ? body.composition.trim()
        : null;
  }
  if (body.embeddedText !== undefined) {
    if (typeof body.embeddedText !== 'string' && body.embeddedText !== null) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'embeddedText must be a string or null' },
          { status: 400 }
        )
      );
    }
    data.embeddedText =
      typeof body.embeddedText === 'string' && body.embeddedText.trim()
        ? body.embeddedText.trim()
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
    if (
      typeof body.sortOrder !== 'number' ||
      !Number.isFinite(body.sortOrder)
    ) {
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
  // P-46 Workstream 2 (2026-05-25 Session 2) — per-item Analysis TipTap doc JSON.
  // Same trust-boundary guard pattern as text/[textId] + images/[imageId].
  if (body.analysis !== undefined) {
    if (!isValidAnalysisPayload(body.analysis)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'analysis must be a JSON object' },
          { status: 400 }
        )
      );
    }
    data.analysis = body.analysis as Prisma.InputJsonValue;
  }

  try {
    const updated = await withRetry(() =>
      prisma.capturedVideo.update({
        where: { id: videoId },
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
          { error: 'Captured video not found' },
          { status: 404 }
        )
      );
    }
    recordFlake(
      'PATCH /api/projects/[projectId]/competition-scraping/videos/[videoId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('PATCH competition-scraping video error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to update captured video' },
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
    params: Promise<{ projectId: string; videoId: string }>;
  }
) {
  const { projectId, videoId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  // Look up the row for the storage paths so we can delete the storage
  // objects alongside the DB row. EMBED rows have NULL storage paths and
  // the helper no-ops for them.
  const row = await withRetry(() =>
    prisma.capturedVideo.findFirst({
      where: {
        id: videoId,
        competitorUrl: { projectWorkflowId },
      },
      select: {
        id: true,
        storagePath: true,
        thumbnailStoragePath: true,
      },
    })
  );
  if (!row) {
    return withCors(req, NextResponse.json({ success: true }));
  }

  try {
    await withRetry(() =>
      prisma.capturedVideo.delete({
        where: { id: videoId },
      })
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // Already deleted between findFirst and delete — fall through to
      // best-effort storage cleanup, then success.
    } else {
      recordFlake(
        'DELETE /api/projects/[projectId]/competition-scraping/videos/[videoId] (db)',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('DELETE competition-scraping video (db) error:', error);
      return withCors(
        req,
        NextResponse.json(
          { error: 'Failed to delete captured video' },
          { status: 500 }
        )
      );
    }
  }

  // Best-effort storage cleanup. The DB row is gone — if storage delete
  // fails, the files become orphans that the daily janitor will sweep. We
  // don't surface storage errors as request failures because the user's
  // intent was met (the row is deleted; the video no longer surfaces in
  // the UI). EMBED rows have NULL storage paths and the helper no-ops.
  try {
    await deleteVideo({
      videoStoragePath: row.storagePath,
      thumbnailStoragePath: row.thumbnailStoragePath,
    });
  } catch (error) {
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/videos/[videoId] (storage)',
      error,
      { projectWorkflowId }
    );
    console.error(
      'DELETE competition-scraping video storage cleanup failed (orphans will be swept by janitor; storagePath=' +
        (row.storagePath ?? '<null>') +
        '):',
      error
    );
  }

  await markWorkflowActive(projectId, WORKFLOW);
  return withCors(req, NextResponse.json({ success: true }));
}
