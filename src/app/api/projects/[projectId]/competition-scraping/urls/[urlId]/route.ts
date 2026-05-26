import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  isValidAnalysisPayload,
  isValidOverallAnalysesBag,
} from '@/lib/rich-text/tiptap-helpers';
import { extractUrlStructuralFieldsPatch } from '@/lib/competition-scraping/url-structural-fields-validation';
import { extractCompetitionScorePatch } from '@/lib/competition-scraping/competition-score-validation';
import {
  isPlatform,
  type CompetitorUrl,
  type OverallAnalyses,
  type ReadCompetitorUrlResponse,
  type ScrapingStatus,
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
    // P-46 Workstream 1 (2026-05-24) — Phase 2 wire fields per §A.11.
    type: row.type,
    description1: row.description1,
    description2: row.description2,
    price: row.price,
    competitionScore: row.competitionScore,
    scrapingStatus: row.scrapingStatus as ScrapingStatus,
    overallCompetitorAnalysis: (row.overallCompetitorAnalysis ?? {}) as Record<
      string,
      unknown
    >,
    overallAnalyses: (row.overallAnalyses ?? {}) as OverallAnalyses,
    // P-49 Workstream 2 (2026-05-26) — per-URL review scrape cap per §A.4 + §A.16.
    reviewScrapeCap: row.reviewScrapeCap,
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
  // P-46 Workstream 2 Session 5 (2026-05-23-b) — URL-level structural
  // fields per §C.2 + §A.11. Delegated to the extracted trust-boundary
  // helper so node:test can exercise the per-field normalization (trim-or-
  // null for the 4 free-text fields; strict enum-acceptance for the 5th)
  // without spinning up Next.js / Prisma. See
  // src/lib/competition-scraping/url-structural-fields-validation.ts.
  const structuralResult = extractUrlStructuralFieldsPatch(body);
  if (!structuralResult.ok) {
    return withCors(
      req,
      NextResponse.json({ error: structuralResult.error }, { status: 400 })
    );
  }
  Object.assign(data, structuralResult.patch);
  // P-46 Workstream 3 Session 2 (2026-05-23-e) — competitionScore allowlist
  // per §A.7 (integer 1-100, nullable). Extracted helper exhaustively tested
  // via node:test so this route stays thin; same Pattern as Session 5's
  // url-structural-fields helper.
  const scoreResult = extractCompetitionScorePatch(body);
  if (!scoreResult.ok) {
    return withCors(
      req,
      NextResponse.json({ error: scoreResult.error }, { status: 400 })
    );
  }
  Object.assign(data, scoreResult.patch);
  // P-46 Workstream 2 Session 3 (2026-05-27) — URL-level Overall Competitor
  // Analysis TipTap doc JSON. Same trust-boundary shape as the per-item
  // Analysis fields on text/[textId] + images/[imageId] + videos/[videoId]:
  // isValidAnalysisPayload rejects null / arrays / primitives so the Json
  // column only ever sees a plain object the TipTap renderer can later
  // consume.
  if (body.overallCompetitorAnalysis !== undefined) {
    if (!isValidAnalysisPayload(body.overallCompetitorAnalysis)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'overallCompetitorAnalysis must be a JSON object' },
          { status: 400 }
        )
      );
    }
    data.overallCompetitorAnalysis =
      body.overallCompetitorAnalysis as Prisma.InputJsonValue;
  }
  // Per-category Overall Analysis bag (text / image / video / reviews). The
  // client may PATCH only a subset of categories (e.g., editing the per-
  // category Analysis box for Captured Text emits `{ overallAnalyses: { text
  // : <doc> } }`); the route MERGES the incoming partial bag onto the
  // existing row's bag so saving one category doesn't wipe the others. The
  // merge needs the current row's value, so it happens before the update().
  let mergedOverallAnalyses: OverallAnalyses | undefined;
  if (body.overallAnalyses !== undefined) {
    if (!isValidOverallAnalysesBag(body.overallAnalyses)) {
      return withCors(
        req,
        NextResponse.json(
          {
            error:
              'overallAnalyses must be a JSON object whose keys are text / image / video / reviews and whose values are JSON objects',
          },
          { status: 400 }
        )
      );
    }
    const existingRow = await withRetry(() =>
      prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { overallAnalyses: true },
      })
    );
    if (!existingRow) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Competitor URL not found' },
          { status: 404 }
        )
      );
    }
    const existingBag =
      existingRow.overallAnalyses && typeof existingRow.overallAnalyses === 'object'
        ? (existingRow.overallAnalyses as OverallAnalyses)
        : ({} as OverallAnalyses);
    mergedOverallAnalyses = { ...existingBag, ...body.overallAnalyses };
    data.overallAnalyses = mergedOverallAnalyses as Prisma.InputJsonValue;
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
