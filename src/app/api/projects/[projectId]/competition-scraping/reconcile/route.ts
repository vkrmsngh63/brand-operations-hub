import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  isPlatform,
  type ReconcileResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — periodic reconciliation endpoint.
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §8.3.2 + §11.1.
//
// Extension calls this every 5 minutes per the §8.3.2 sync-failure
// safety net. Compares the returned counts + lastModified against the
// extension's local cache; full re-fetch if divergent. Required
// `?platform=` query parameter scopes the response to one platform —
// the extension is always working in a single (project, platform)
// scope at a time per the §A.2 sub-scope assignment model.

const WORKFLOW = 'competition-scraping';

// Epoch fallback for lastModified when no rows exist yet for the scope.
// Returning null would force the extension to special-case "no data"; an
// explicit epoch lets the extension treat lastModified as a monotone
// timestamp for its own change-detection logic.
const EPOCH_ISO = new Date(0).toISOString();

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const platformParam = req.nextUrl.searchParams.get('platform');
  if (!isPlatform(platformParam)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'platform query parameter is required and must be one of the supported values',
        },
        { status: 400 }
      )
    );
  }
  const platform = platformParam;

  try {
    // Three parallel aggregates — Promise.all gives us urls, texts,
    // images counts + max(updatedAt) in one round-trip's worth of wall
    // clock. The relation filter on text + images uses the parent
    // CompetitorUrl's (projectWorkflowId, platform) constraint so the
    // platform scope is tight even though those tables don't carry
    // platform directly.
    const [urls, texts, images] = await Promise.all([
      withRetry(() =>
        prisma.competitorUrl.aggregate({
          where: { projectWorkflowId, platform },
          _count: { _all: true },
          _max: { updatedAt: true },
        })
      ),
      withRetry(() =>
        prisma.capturedText.aggregate({
          where: {
            competitorUrl: { projectWorkflowId, platform },
          },
          _count: { _all: true },
          _max: { updatedAt: true },
        })
      ),
      withRetry(() =>
        prisma.capturedImage.aggregate({
          where: {
            competitorUrl: { projectWorkflowId, platform },
          },
          _count: { _all: true },
          _max: { updatedAt: true },
        })
      ),
    ]);

    const maxTimestamps = [
      urls._max.updatedAt,
      texts._max.updatedAt,
      images._max.updatedAt,
    ]
      .filter((d): d is Date => d instanceof Date)
      .map((d) => d.getTime());

    const lastModified =
      maxTimestamps.length > 0
        ? new Date(Math.max(...maxTimestamps)).toISOString()
        : EPOCH_ISO;

    const response: ReconcileResponse = {
      platform,
      urlCount: urls._count._all,
      textCount: texts._count._all,
      imageCount: images._count._all,
      lastModified,
    };
    return withCors(req, NextResponse.json(response));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/reconcile',
      error,
      { projectWorkflowId }
    );
    console.error(
      'GET competition-scraping reconcile error (platform=' + platform + '):',
      error
    );
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to reconcile competition-scraping counts' },
        { status: 500 }
      )
    );
  }
}
