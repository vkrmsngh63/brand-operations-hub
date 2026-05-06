import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { requestUploadUrl } from '@/lib/competition-storage';
import {
  isAcceptedImageMimeType,
  isImageSourceType,
  IMAGE_UPLOAD_MAX_BYTES,
  type RequestImageUploadRequest,
  type RequestImageUploadResponse,
} from '@/lib/shared-types/competition-scraping';
import { composeStoragePath } from '@/lib/competition-storage-helpers';

// W#2 API — image upload phase 1 (requestUpload).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3 + §11.1.
//
// Slash-based path (was `images:requestUpload` in the original §11.1 spec
// — pivoted to slash-based during W#2 API-routes session-2 build for
// Next.js convention alignment; spec doc batch-update at end of session).
//
// Phase 1 of two-phase upload: server validates MIME + file size,
// generates a UUID for the captured image, composes the storage path,
// requests a signed Supabase Storage URL, and returns the URL + IDs the
// extension needs to PUT bytes directly. NO DB write happens here — the
// CapturedImage row is created in :finalize. If the extension retries
// requestUpload (network blip on response), the server generates a fresh
// capturedImageId; the prior signed URL's file becomes an orphan that
// the daily janitor (session-3) cleans up if no row references it.

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

  let body: Partial<RequestImageUploadRequest>;
  try {
    body = (await req.json()) as Partial<RequestImageUploadRequest>;
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
    typeof body.fileSize !== 'number' ||
    !Number.isFinite(body.fileSize) ||
    body.fileSize <= 0
  ) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'fileSize is required and must be a positive number' },
        { status: 400 }
      )
    );
  }
  if (body.fileSize > IMAGE_UPLOAD_MAX_BYTES) {
    return withCors(
      req,
      NextResponse.json(
        {
          error: `fileSize exceeds the ${IMAGE_UPLOAD_MAX_BYTES} byte (5 MB) cap per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3`,
        },
        { status: 413 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2 workflow
  // before issuing the signed URL. Without this, a forged urlId in the
  // path could lead the server to mint upload URLs into the wrong
  // project's storage scope.
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

  // Generate a fresh capturedImageId per call. We deliberately do NOT
  // dedupe by clientId here — the row doesn't exist yet (created at
  // :finalize) so there's nothing to dedupe against, and orphan storage
  // files from retries are cleaned up by the daily janitor.
  const capturedImageId = randomUUID();
  const storagePath = composeStoragePath({
    projectId,
    competitorUrlId: urlId,
    capturedImageId,
    mimeType: body.mimeType,
  });

  try {
    const { uploadUrl, expiresAt } = await requestUploadUrl({
      projectId,
      competitorUrlId: urlId,
      capturedImageId,
      mimeType: body.mimeType,
    });
    const response: RequestImageUploadResponse = {
      uploadUrl,
      capturedImageId,
      storagePath,
      expiresAt,
    };
    return withCors(req, NextResponse.json(response, { status: 200 }));
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/requestUpload',
      error,
      { projectWorkflowId }
    );
    console.error('POST competition-scraping image requestUpload error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create signed upload URL' },
        { status: 500 }
      )
    );
  }
}
