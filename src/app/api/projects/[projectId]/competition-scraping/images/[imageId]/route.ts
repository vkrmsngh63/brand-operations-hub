import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { deleteImage } from '@/lib/competition-storage';
import type {
  CapturedImage,
  UpdateCapturedImageRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured images (per-row PATCH + DELETE).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
//
// PATCH allows editing the user-provided metadata (imageCategory,
// composition, embeddedText, tags, sortOrder). The capture-shape fields
// (clientId, sourceType, storagePath, storageBucket, fileSize, mimeType,
// width, height) are immutable after :finalize — re-uploading is the way
// to change them.
//
// DELETE removes the DB row AND the storage file. Storage failure does
// NOT abort DB delete — orphan storage files get swept by the daily
// janitor (session-3) so the user-facing delete is reliable even if
// Supabase Storage is briefly unavailable.

const WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.capturedImage.findUnique>>
): CapturedImage | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    imageCategory: row.imageCategory,
    storagePath: row.storagePath,
    storageBucket: row.storageBucket,
    composition: row.composition,
    embeddedText: row.embeddedText,
    tags: (row.tags ?? []) as string[],
    sourceType: row.sourceType as CapturedImage['sourceType'],
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
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

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; imageId: string }>;
  }
) {
  const { projectId, imageId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: UpdateCapturedImageRequest;
  try {
    body = (await req.json()) as UpdateCapturedImageRequest;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const owned = await withRetry(() =>
    prisma.capturedImage.findFirst({
      where: {
        id: imageId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Captured image not found' },
        { status: 404 }
      )
    );
  }

  const data: Prisma.CapturedImageUncheckedUpdateInput = {};

  if (body.imageCategory !== undefined) {
    data.imageCategory =
      typeof body.imageCategory === 'string' && body.imageCategory.trim()
        ? body.imageCategory.trim()
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
      prisma.capturedImage.update({
        where: { id: imageId },
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
          { error: 'Captured image not found' },
          { status: 404 }
        )
      );
    }
    recordFlake(
      'PATCH /api/projects/[projectId]/competition-scraping/images/[imageId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('PATCH competition-scraping image error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to update captured image' },
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
    params: Promise<{ projectId: string; imageId: string }>;
  }
) {
  const { projectId, imageId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  // Look up the row for the storagePath so we can delete the storage file
  // alongside the DB row. Use findFirst with the relation filter for the
  // ownership check.
  const row = await withRetry(() =>
    prisma.capturedImage.findFirst({
      where: {
        id: imageId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true, storagePath: true },
    })
  );
  if (!row) {
    return withCors(req, NextResponse.json({ success: true }));
  }

  try {
    await withRetry(() =>
      prisma.capturedImage.delete({
        where: { id: imageId },
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
        'DELETE /api/projects/[projectId]/competition-scraping/images/[imageId] (db)',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('DELETE competition-scraping image (db) error:', error);
      return withCors(
        req,
        NextResponse.json(
          { error: 'Failed to delete captured image' },
          { status: 500 }
        )
      );
    }
  }

  // Best-effort storage cleanup. The DB row is gone — if storage delete
  // fails, the file becomes an orphan that the daily janitor sweeps. We
  // don't surface storage errors as request failures because the user's
  // intent was met (the row is deleted; the image no longer surfaces in
  // the UI).
  try {
    await deleteImage(row.storagePath);
  } catch (error) {
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/images/[imageId] (storage)',
      error,
      { projectWorkflowId }
    );
    console.error(
      'DELETE competition-scraping image storage cleanup failed (orphan will be swept by janitor; storagePath=' +
        row.storagePath +
        '):',
      error
    );
  }

  await markWorkflowActive(projectId, WORKFLOW);
  return withCors(req, NextResponse.json({ success: true }));
}
