import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  COMPETITION_SCRAPING_VIDEOS_BUCKET,
  finalizeVideoUpload,
} from '@/lib/competition-video-storage';
import {
  isFinalizeVideoUploadRequest,
  type CapturedVideo,
  type FinalizeVideoUploadRequest,
  type FinalizeVideoUploadResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — video upload phase 2 (finalize). Handles BOTH EMBED and
// DIRECT_BYTES branches per docs/CAPTURED_VIDEOS_DESIGN.md §A.9.
//
//   - EMBED: client passes sourceType='EMBED' + originalSrcUrl only; storage
//     paths omitted; row created with NULL storage fields. Skips storage-
//     existence verification (no bytes to verify).
//
//   - DIRECT_BYTES: client passes sourceType='DIRECT_BYTES' + capturedVideoId
//     (from Phase 1) + originalSrcUrl + videoStoragePath +
//     thumbnailStoragePath (optional — NULL when canvas frame-grab failed
//     per §A.12) + bytes metadata. Server verifies both storage objects
//     exist via finalizeVideoUpload helper before creating the row.
//
// Idempotency: a duplicate clientId returns the existing row with 200
// instead of erroring (mirrors image finalize behavior; supports the
// extension's WAL retry path). DB-layer @unique constraint on clientId
// raises P2002 on duplicate insert; the handler catches + re-fetches.

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
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
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

  let parsedBody: unknown;
  try {
    parsedBody = await req.json();
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  if (!isFinalizeVideoUploadRequest(parsedBody)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'Request body must include clientId + sourceType (EMBED|DIRECT_BYTES) + originalSrcUrl; DIRECT_BYTES additionally requires capturedVideoId + videoStoragePath',
        },
        { status: 400 }
      )
    );
  }
  const body = parsedBody as FinalizeVideoUploadRequest;

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

  // Idempotency check — return the existing row with 200 if the client is
  // retrying a finalize that already succeeded.
  const existing = await withRetry(() =>
    prisma.capturedVideo.findUnique({
      where: { clientId: body.clientId },
    })
  );
  if (existing) {
    if (existing.competitorUrlId !== urlId) {
      return withCors(
        req,
        NextResponse.json(
          {
            error:
              'clientId is already in use by a video on a different competitor URL',
          },
          { status: 409 }
        )
      );
    }
    return withCors(
      req,
      NextResponse.json<FinalizeVideoUploadResponse>(toWireShape(existing)!)
    );
  }

  // DIRECT_BYTES branch — verify storage objects before persisting the row.
  if (body.sourceType === 'DIRECT_BYTES') {
    try {
      const verified = await finalizeVideoUpload({
        videoStoragePath: body.videoStoragePath!,
        thumbnailStoragePath: body.thumbnailStoragePath ?? '',
      });
      if (!verified.videoPresent) {
        return withCors(
          req,
          NextResponse.json(
            {
              error:
                'Uploaded video file not found in storage — re-run requestUpload + PUT before finalizing',
            },
            { status: 409 }
          )
        );
      }
      // thumbnailPresent intentionally NOT enforced — per §A.12 the row
      // saves with NULL thumbnailStoragePath when the canvas frame-grab
      // failed; the renderer falls back to the generic ▶️ icon. If the
      // client passed a non-empty thumbnailStoragePath but the file isn't
      // there, the row still saves with the path but the renderer's
      // signed-URL mint will fail at render time (acceptable — the
      // thumbnail is non-load-bearing).
    } catch (error) {
      recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize (storage-verify)',
        error,
        { projectWorkflowId }
      );
      console.error(
        'POST competition-scraping video finalize storage-verify error:',
        error
      );
      return withCors(
        req,
        NextResponse.json(
          { error: 'Failed to verify uploaded video' },
          { status: 500 }
        )
      );
    }
  }

  const isDirectBytes = body.sourceType === 'DIRECT_BYTES';
  const data: Prisma.CapturedVideoUncheckedCreateInput = {
    clientId: body.clientId,
    competitorUrlId: urlId,
    projectId,
    sourceType: body.sourceType,
    originalSrcUrl: body.originalSrcUrl,
    storagePath: isDirectBytes ? (body.videoStoragePath ?? null) : null,
    storageBucket: isDirectBytes ? COMPETITION_SCRAPING_VIDEOS_BUCKET : null,
    fileSize: isDirectBytes && typeof body.fileSize === 'number' ? body.fileSize : null,
    mimeType: isDirectBytes && body.mimeType ? body.mimeType : null,
    durationSeconds:
      isDirectBytes && typeof body.durationSeconds === 'number'
        ? body.durationSeconds
        : null,
    width: isDirectBytes && typeof body.width === 'number' ? body.width : null,
    height:
      isDirectBytes && typeof body.height === 'number' ? body.height : null,
    thumbnailStoragePath:
      isDirectBytes && body.thumbnailStoragePath
        ? body.thumbnailStoragePath
        : null,
    videoCategory:
      typeof body.videoCategory === 'string' && body.videoCategory.trim()
        ? body.videoCategory.trim()
        : null,
    composition:
      typeof body.composition === 'string' && body.composition.trim()
        ? body.composition.trim()
        : null,
    embeddedText:
      typeof body.embeddedText === 'string' && body.embeddedText.trim()
        ? body.embeddedText.trim()
        : null,
    tags: Array.isArray(body.tags) ? body.tags : [],
    sortOrder:
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
        ? body.sortOrder
        : 0,
    source: body.source ?? 'extension',
    addedBy: userId,
  };

  try {
    const created = await withRetry(() =>
      prisma.capturedVideo.create({ data })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(
      req,
      NextResponse.json<FinalizeVideoUploadResponse>(toWireShape(created)!)
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Race — another request landed the row between findUnique and
      // create. Re-fetch and return idempotently.
      const racedRow = await withRetry(() =>
        prisma.capturedVideo.findUnique({
          where: { clientId: body.clientId },
        })
      );
      if (racedRow) {
        return withCors(
          req,
          NextResponse.json<FinalizeVideoUploadResponse>(
            toWireShape(racedRow)!
          )
        );
      }
    }
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize',
      error,
      { projectWorkflowId }
    );
    console.error('POST competition-scraping video finalize error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to finalize captured video' },
        { status: 500 }
      )
    );
  }
}
