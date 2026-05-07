import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import type {
  CapturedImage,
  ListCapturedImagesResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured images (collection list route).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
// Sibling files: ../requestUpload + ../finalize handle the two-phase
// upload; ../../../images/[imageId]/route.ts handles per-row PATCH + DELETE.
//
// This route exists to support the per-URL detail page (slice a.1) and
// future image-viewer (slice a.2). It returns metadata + storagePath only;
// signed-URL minting for the actual image bytes is the viewer slice's
// concern.

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

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/images
// Lists every CapturedImage attached to the URL. Verifies the parent URL
// belongs to this Project's W#2 workflow before reading; forged urlIds get
// 404 the same as the sibling /text + /sizes routes.
//
// Ordering: (sortOrder ASC, addedAt ASC) — stable across reloads.
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
      prisma.capturedImage.findMany({
        where: { competitorUrlId: urlId },
        orderBy: [{ sortOrder: 'asc' }, { addedAt: 'asc' }],
      })
    );
    const wire = rows.map((r) => toWireShape(r)!) satisfies ListCapturedImagesResponse;
    return withCors(req, NextResponse.json(wire));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/images',
      error,
      { projectWorkflowId }
    );
    console.error('GET competition-scraping images error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch captured images' },
        { status: 500 }
      )
    );
  }
}
