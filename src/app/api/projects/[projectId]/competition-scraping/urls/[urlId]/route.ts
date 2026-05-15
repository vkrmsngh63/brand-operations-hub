import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  isPlatform,
  type CompetitorUrl,
  type ReadCompetitorUrlResponse,
  type UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — competitor URLs (per-row routes).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.

const WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.competitorUrl.findUnique>>
): CompetitorUrl | null {
  if (!row) return null;
  return {
    id: row.id,
    projectWorkflowId: row.projectWorkflowId,
    platform: row.platform as CompetitorUrl['platform'],
    url: row.url,
    competitionCategory: row.competitionCategory,
    productName: row.productName,
    brandName: row.brandName,
    resultsPageRank: row.resultsPageRank,
    productStarRating: row.productStarRating,
    sellerStarRating: row.sellerStarRating,
    numProductReviews: row.numProductReviews,
    numSellerReviews: row.numSellerReviews,
    isSponsoredAd: row.isSponsoredAd,
    customFields: (row.customFields ?? {}) as Record<string, unknown>,
    source: row.source as CompetitorUrl['source'],
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/urls/[urlId]
// Single-row read for the per-URL detail page. The page also fetches the
// URL's children (text/sizes/images) via sibling collection routes; this
// route returns only the parent row so 404 on a stale link surfaces in one
// place rather than four.
//
// Auth + scoping: verifyProjectWorkflowAuth confirms the caller can see
// this Project's W#2 workflow; the where clause adds projectWorkflowId so
// a forged urlId from another project returns 404 (not the row's data).
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
    const row = await withRetry(() =>
      prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
      })
    );
    if (!row) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Competitor URL not found' },
          { status: 404 }
        )
      );
    }
    const wire = toWireShape(row) satisfies ReadCompetitorUrlResponse | null;
    return withCors(req, NextResponse.json(wire));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]',
      error,
      { projectWorkflowId }
    );
    console.error('GET competition-scraping url error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch competitor URL' },
        { status: 500 }
      )
    );
  }
}

// PATCH /api/projects/[projectId]/competition-scraping/urls/[urlId]
// Partial update — any subset of CreateCompetitorUrlRequest's fields.
// platform + url can also be re-targeted (rare; supported for completeness).
export async function PATCH(
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

  let body: UpdateCompetitorUrlRequest;
  try {
    body = (await req.json()) as UpdateCompetitorUrlRequest;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  // Build the update payload only from explicitly-present keys. The pattern
  // mirrors W#1's keywords/[keywordId]/route.ts so unset fields don't get
  // wiped to null.
  const data: Prisma.CompetitorUrlUncheckedUpdateInput = {};

  if (body.platform !== undefined) {
    if (!isPlatform(body.platform)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'platform must be one of the supported values' },
          { status: 400 }
        )
      );
    }
    data.platform = body.platform;
  }
  if (body.url !== undefined) {
    const trimmed = typeof body.url === 'string' ? body.url.trim() : '';
    if (!trimmed) {
      return withCors(
        req,
        NextResponse.json({ error: 'url must be a non-empty string' }, { status: 400 })
      );
    }
    data.url = trimmed;
  }
  if (body.competitionCategory !== undefined) {
    data.competitionCategory =
      typeof body.competitionCategory === 'string' && body.competitionCategory.trim()
        ? body.competitionCategory.trim()
        : null;
  }
  if (body.productName !== undefined) {
    data.productName =
      typeof body.productName === 'string' && body.productName.trim()
        ? body.productName.trim()
        : null;
  }
  if (body.brandName !== undefined) {
    data.brandName =
      typeof body.brandName === 'string' && body.brandName.trim()
        ? body.brandName.trim()
        : null;
  }
  if (body.resultsPageRank !== undefined) {
    data.resultsPageRank =
      typeof body.resultsPageRank === 'number' ? body.resultsPageRank : null;
  }
  if (body.productStarRating !== undefined) {
    data.productStarRating =
      typeof body.productStarRating === 'number' ? body.productStarRating : null;
  }
  if (body.sellerStarRating !== undefined) {
    data.sellerStarRating =
      typeof body.sellerStarRating === 'number' ? body.sellerStarRating : null;
  }
  if (body.numProductReviews !== undefined) {
    data.numProductReviews =
      typeof body.numProductReviews === 'number' ? body.numProductReviews : null;
  }
  if (body.numSellerReviews !== undefined) {
    data.numSellerReviews =
      typeof body.numSellerReviews === 'number' ? body.numSellerReviews : null;
  }
  // P-6 — boolean flag. Only accept actual booleans; ignore other types so a
  // misshapen payload doesn't silently flip the flag.
  if (typeof body.isSponsoredAd === 'boolean') {
    data.isSponsoredAd = body.isSponsoredAd;
  }
  if (body.customFields !== undefined) {
    data.customFields =
      body.customFields && typeof body.customFields === 'object'
        ? (body.customFields as Prisma.InputJsonValue)
        : Prisma.JsonNull;
  }

  try {
    const updated = await withRetry(() =>
      prisma.competitorUrl.update({
        where: { id: urlId, projectWorkflowId },
        data,
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json(toWireShape(updated)));
  } catch (error) {
    // P2025 — record not found. Surface as 404 so callers distinguish
    // "not yours / never existed" from a transient 500.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Competitor URL not found' },
          { status: 404 }
        )
      );
    }
    // P2002 — unique-constraint violation, e.g., a re-targeting PATCH that
    // collides with an existing row on (workflow, platform, url). Surface
    // as 409 so the caller can decide what to do.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return withCors(
        req,
        NextResponse.json(
          {
            error:
              'Another competitor URL already exists for that platform + url combination',
          },
          { status: 409 }
        )
      );
    }
    recordFlake(
      'PATCH /api/projects/[projectId]/competition-scraping/urls/[urlId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('PATCH competition-scraping url error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to update competitor URL' },
        { status: 500 }
      )
    );
  }
}

// DELETE /api/projects/[projectId]/competition-scraping/urls/[urlId]
// Cascades to CompetitorSize / CapturedText / CapturedImage rows via the
// Prisma onDelete: Cascade in schema.prisma. Storage objects for any
// captured images are NOT deleted here — that's the janitor cron's job per
// §3 (orphans get swept daily).
export async function DELETE(
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
    await withRetry(() =>
      prisma.competitorUrl.delete({
        where: { id: urlId, projectWorkflowId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json({ success: true }));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // Already deleted — treat as success for idempotency.
      return withCors(req, NextResponse.json({ success: true }));
    }
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/urls/[urlId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('DELETE competition-scraping url error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to delete competitor URL' },
        { status: 500 }
      )
    );
  }
}
