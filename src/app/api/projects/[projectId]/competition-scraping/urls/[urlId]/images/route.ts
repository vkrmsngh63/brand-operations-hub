import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { getFullSizeUrl, getThumbnailUrl } from '@/lib/competition-storage';
import type {
  CapturedImage,
  CapturedImageWithUrls,
  ListCapturedImagesResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured images (collection list route).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1 + §3.
// Sibling files: ../requestUpload + ../finalize handle the two-phase
// upload; ../../../images/[imageId]/route.ts handles per-row PATCH + DELETE.
//
// This route serves the per-URL detail page's image gallery (slice a.2 +
// onward). It returns each row's metadata + a 1-hour-TTL thumbnail signed
// URL (200×200 contain) + a 1-hour-TTL full-size signed URL minted via
// the competition-storage helper. Embedding both URLs in the list payload
// keeps the client-side render to a single round-trip; the modal's
// prev/next navigation is in-memory.

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
    // Mint thumbnail + full-size signed URLs in parallel per row. Supabase
    // signs locally where it can and round-trips for the storage-hosted
    // transform path; for ~30-image URLs (the typical case) total latency
    // is negligible. Worst-case ~300 images per URL is bounded by the
    // 5 MB-per-image cap from §3 and Phase 1 admin throughput; if perf
    // becomes a concern at scale, the next step is pagination on the
    // gallery, not lazy URL minting (which adds modal-open latency for
    // marginal gain).
    const wire: CapturedImageWithUrls[] = await Promise.all(
      rows.map(async (r) => {
        const base = toWireShape(r)!;
        const [thumbnailUrl, fullSizeUrl] = await Promise.all([
          getThumbnailUrl(base.storagePath),
          getFullSizeUrl(base.storagePath),
        ]);
        return { ...base, thumbnailUrl, fullSizeUrl };
      })
    );
    return withCors(
      req,
      NextResponse.json(wire satisfies ListCapturedImagesResponse)
    );
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
