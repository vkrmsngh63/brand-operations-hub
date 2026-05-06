import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  COMPETITION_SCRAPING_BUCKET,
  verifyUploadedFile,
} from '@/lib/competition-storage';
import { composeStoragePath } from '@/lib/competition-storage-helpers';
import {
  isAcceptedImageMimeType,
  isImageSourceType,
  type CapturedImage,
  type FinalizeImageUploadRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — image upload phase 2 (finalize).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3 + §11.1.
//
// Slash-based path (see requestUpload for the rationale).
//
// Phase 2: extension finished PUTting bytes to the signed URL. Server
// verifies the file actually exists in storage, then creates the
// CapturedImage DB row pointing at it. Idempotent on clientId — a
// retry with the same clientId returns the existing row with 200.

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

  let body: Partial<FinalizeImageUploadRequest>;
  try {
    body = (await req.json()) as Partial<FinalizeImageUploadRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const clientId =
    typeof body.clientId === 'string' ? body.clientId.trim() : '';
  const capturedImageId =
    typeof body.capturedImageId === 'string'
      ? body.capturedImageId.trim()
      : '';
  if (!clientId) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'clientId is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }
  if (!capturedImageId) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'capturedImageId is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }
  if (!isAcceptedImageMimeType(body.mimeType)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'mimeType is required and must be one of image/jpeg, image/png, image/webp',
        },
        { status: 400 }
      )
    );
  }
  if (!isImageSourceType(body.sourceType)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'sourceType is required and must be either "regular" or "region-screenshot"',
        },
        { status: 400 }
      )
    );
  }
  if (
    body.fileSize !== undefined &&
    (typeof body.fileSize !== 'number' || !Number.isFinite(body.fileSize))
  ) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'fileSize must be a number when provided' },
        { status: 400 }
      )
    );
  }
  if (body.tags !== undefined && !isStringArray(body.tags)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'tags must be an array of strings' },
        { status: 400 }
      )
    );
  }
  if (
    body.width !== undefined &&
    (typeof body.width !== 'number' || !Number.isFinite(body.width))
  ) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'width must be a number when provided' },
        { status: 400 }
      )
    );
  }
  if (
    body.height !== undefined &&
    (typeof body.height !== 'number' || !Number.isFinite(body.height))
  ) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'height must be a number when provided' },
        { status: 400 }
      )
    );
  }
  if (
    body.sortOrder !== undefined &&
    (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder))
  ) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'sortOrder must be a number when provided' },
        { status: 400 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2 workflow.
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

  // Re-derive storagePath from path params + body fields. Server is the
  // single source of truth on path layout — extension just echoes its
  // mimeType + capturedImageId knowledge so the server can re-derive.
  const storagePath = composeStoragePath({
    projectId,
    competitorUrlId: urlId,
    capturedImageId,
    mimeType: body.mimeType,
  });

  // Verify the file actually exists in storage before creating a DB row
  // that references it. Without this, a buggy or malicious client could
  // create rows pointing at missing files, which would surface as broken
  // thumbnails forever.
  let fileExists = false;
  try {
    fileExists = await verifyUploadedFile(storagePath);
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize (verify)',
      error,
      { projectWorkflowId }
    );
    console.error('Storage verification error:', error);
    // Fall through to fileExists=false → 400.
  }
  if (!fileExists) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'No uploaded file found at the expected storagePath. Re-request the upload URL and retry the upload before finalizing.',
        },
        { status: 400 }
      )
    );
  }

  const createData: Prisma.CapturedImageUncheckedCreateInput = {
    clientId,
    competitorUrlId: urlId,
    imageCategory:
      typeof body.imageCategory === 'string' && body.imageCategory.trim()
        ? body.imageCategory.trim()
        : null,
    storagePath,
    storageBucket: COMPETITION_SCRAPING_BUCKET,
    composition:
      typeof body.composition === 'string' && body.composition.trim()
        ? body.composition.trim()
        : null,
    embeddedText:
      typeof body.embeddedText === 'string' && body.embeddedText.trim()
        ? body.embeddedText.trim()
        : null,
    tags: body.tags ?? [],
    sourceType: body.sourceType,
    fileSize: typeof body.fileSize === 'number' ? body.fileSize : null,
    mimeType: body.mimeType,
    width: typeof body.width === 'number' ? body.width : null,
    height: typeof body.height === 'number' ? body.height : null,
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
    addedBy: userId,
  };

  try {
    const created = await withRetry(() =>
      prisma.capturedImage.create({ data: createData })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(
      req,
      NextResponse.json(toWireShape(created), { status: 201 })
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // clientId already exists — extension WAL retry. Return the
      // existing row.
      try {
        const existing = await withRetry(() =>
          prisma.capturedImage.findUnique({
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
          'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize (idempotent-lookup)',
          lookupError,
          { retried: true, projectWorkflowId }
        );
      }
    }
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('POST competition-scraping image finalize error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to finalize captured image' },
        { status: 500 }
      )
    );
  }
}
