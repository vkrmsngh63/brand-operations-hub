import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { requestVideoUploadUrl } from '@/lib/competition-video-storage';
import {
  isRequestVideoUploadRequest,
  VIDEO_UPLOAD_MAX_BYTES,
  type RequestVideoUploadRequest,
  type RequestVideoUploadResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — video upload phase 1 (requestUpload). DIRECT_BYTES path only.
// EMBED rows have no bytes to upload and skip this phase entirely, calling
// finalize directly with sourceType='EMBED' + originalSrcUrl.
//
// Spec: docs/CAPTURED_VIDEOS_DESIGN.md §A.9 (two-phase + two-URL pattern;
// the Phase-1 response carries TWO signed URLs — one for the video bytes,
// one for the thumbnail JPEG produced by the extension's canvas frame-grab
// per §A.12) + §A.11 (server-side size enforcement is layer 2 of the
// two-layer client + server pattern).
//
// Mirrors the image sibling at .../urls/[urlId]/images/requestUpload/route.ts
// with the two-URL adaptation. No DB write happens here; the CapturedVideo
// row is created at :finalize.

const WORKFLOW = 'competition-scraping';

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
  const { projectWorkflowId } = auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  if (!isRequestVideoUploadRequest(body)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'Request body must include clientId (non-empty string), mimeType (one of video/mp4, video/webm, video/quicktime), and fileSize (positive number)',
        },
        { status: 400 }
      )
    );
  }
  const { mimeType, fileSize } = body as RequestVideoUploadRequest;

  if (fileSize > VIDEO_UPLOAD_MAX_BYTES) {
    return withCors(
      req,
      NextResponse.json(
        {
          error: `fileSize exceeds the ${VIDEO_UPLOAD_MAX_BYTES} byte (100 MB) cap per docs/CAPTURED_VIDEOS_DESIGN.md §A.10 — try the YouTube/Vimeo embed path instead, or upload to YouTube/Vimeo and paste the share URL`,
        },
        { status: 413 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2 workflow
  // before issuing signed URLs. Without this, a forged urlId in the path
  // could lead the server to mint upload URLs into the wrong project's
  // storage scope.
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

  // Generate a fresh capturedVideoId per call. As with the image sibling we
  // deliberately do NOT dedupe by clientId here — the row doesn't exist yet
  // (created at :finalize) so there's nothing to dedupe against, and orphan
  // storage files from retries are cleaned up by the daily janitor (or by
  // a future video-specific janitor sweep).
  const capturedVideoId = randomUUID();

  try {
    const signed = await requestVideoUploadUrl({
      projectId,
      competitorUrlId: urlId,
      capturedVideoId,
      mimeType,
    });
    const response: RequestVideoUploadResponse = {
      capturedVideoId,
      videoUploadUrl: signed.videoUploadUrl,
      videoStoragePath: signed.videoStoragePath,
      videoToken: signed.videoToken,
      thumbnailUploadUrl: signed.thumbnailUploadUrl,
      thumbnailStoragePath: signed.thumbnailStoragePath,
      thumbnailToken: signed.thumbnailToken,
      expiresAt: signed.expiresAt,
    };
    return withCors(req, NextResponse.json(response, { status: 200 }));
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/requestUpload',
      error,
      { projectWorkflowId }
    );
    console.error('POST competition-scraping video requestUpload error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create signed upload URLs' },
        { status: 500 }
      )
    );
  }
}
