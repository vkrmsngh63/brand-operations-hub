import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  getVideoSignedUrl,
  getVideoThumbnailUrl,
} from '@/lib/competition-video-storage';
import type {
  CapturedVideo,
  CapturedVideoWithUrls,
  ListCapturedVideosResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — captured videos (collection list route).
// Spec: docs/CAPTURED_VIDEOS_DESIGN.md §A.9 + A.2 implementation arc table.
// Sibling files: ../videos/requestUpload + ../videos/finalize handle the
// two-phase upload for DIRECT_BYTES; ../../../videos/[videoId]/route.ts
// handles per-row PATCH + DELETE (mirrors the image sibling at
// .../competition-scraping/images/[imageId]/route.ts, NOT nested under
// urls/[urlId]/).
//
// Build #5 (this revision) extends the wire shape from bare
// `CapturedVideo[]` to `CapturedVideoWithUrls[]`, minting per-row signed
// URLs for the URL detail page renderer (mirrors the image sibling's slice
// (a.2) extension). DIRECT_BYTES rows get a 1-hour-TTL signed URL for the
// video bytes + (when thumbnailStoragePath is non-null) a 1-hour-TTL
// signed URL for the canvas frame-grab JPEG. EMBED rows pass through with
// both URLs null — the renderer plays them via `<iframe src=originalSrcUrl>`
// using the platform's own player.

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

// GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/videos
// Lists every CapturedVideo attached to the URL. Verifies the parent URL
// belongs to this Project's W#2 workflow before reading; forged urlIds get
// 404 the same as the sibling /text + /images + /sizes routes.
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
  const { projectId: _projectId, urlId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, _projectId, WORKFLOW);
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
      prisma.capturedVideo.findMany({
        where: { competitorUrlId: urlId },
        orderBy: [{ sortOrder: 'asc' }, { addedAt: 'asc' }],
      })
    );
    // Mint per-row signed URLs in parallel. DIRECT_BYTES rows mint a video
    // URL + (when thumbnailStoragePath is non-null per §A.12) a thumbnail
    // URL; EMBED rows skip both (no Supabase upload exists for embeds —
    // the renderer plays them via <iframe src=originalSrcUrl>). At
    // typical-page volume (~5-10 saved videos per URL) total latency is
    // negligible; the 100 MB cap from §A.10 bounds worst-case row count.
    const wire: CapturedVideoWithUrls[] = await Promise.all(
      rows.map(async (r) => {
        const base = toWireShape(r)!;
        if (base.sourceType !== 'DIRECT_BYTES' || !base.storagePath) {
          return { ...base, videoUrl: null, thumbnailUrl: null };
        }
        const [videoUrl, thumbnailUrl] = await Promise.all([
          getVideoSignedUrl(base.storagePath),
          getVideoThumbnailUrl(base.thumbnailStoragePath),
        ]);
        return { ...base, videoUrl, thumbnailUrl };
      })
    );
    return withCors(
      req,
      NextResponse.json(wire satisfies ListCapturedVideosResponse)
    );
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/videos',
      error,
      { projectWorkflowId }
    );
    console.error('GET competition-scraping videos error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch captured videos' },
        { status: 500 }
      )
    );
  }
}
