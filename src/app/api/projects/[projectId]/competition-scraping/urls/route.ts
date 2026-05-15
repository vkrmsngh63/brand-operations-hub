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
  isSource,
  type CompetitorUrl,
  type CreateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — competitor URLs (collection routes).
//
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
// Sibling file [urlId]/route.ts handles per-row PATCH + DELETE.
//
// Cross-cutting items per §11.2:
//   - verifyProjectWorkflowAuth — same auth chain as W#1.
//   - withRetry on every Prisma call — 2026-05-04-b/05 platform-wide
//     pattern.
//   - markWorkflowActive after every mutation — bumps W#2's status to
//     "active" on first POST.
//   - recordFlake on every catch — observability.
//   - CORS preflight via OPTIONS — extension callers from
//     chrome-extension://* allowed; web callers same-origin.
//   - POST is idempotent on the (projectWorkflowId, platform, url) unique
//     constraint: a duplicate-create attempt returns the existing row with
//     200 instead of erroring. Matches the §11.2 "extension idempotency"
//     intent without requiring a clientId on the URL row (the schema
//     doesn't carry one — clientId only exists on text/image rows).

const WORKFLOW = 'competition-scraping';

// Helper: serialize Prisma's CompetitorUrl row to the wire shape declared
// in shared-types. Decimal/Date fields are absent on this model;
// customFields is JSON which Prisma returns as JsonValue.
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

// OPTIONS — CORS preflight. Extension hits this before POST/etc.
export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/urls?platform=...
// Lists competitor URLs for the Project's W#2 workflow. Optional platform
// filter narrows by source platform.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);

  const platformParam = req.nextUrl.searchParams.get('platform');
  if (platformParam !== null && !isPlatform(platformParam)) {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    );
  }

  try {
    const rows = await withRetry(() =>
      prisma.competitorUrl.findMany({
        where: {
          projectWorkflowId: auth.projectWorkflowId,
          ...(platformParam ? { platform: platformParam } : {}),
        },
        orderBy: [{ platform: 'asc' }, { addedAt: 'asc' }],
      })
    );
    const wire = rows.map((r) => toWireShape(r)!) satisfies CompetitorUrl[];
    return withCors(req, NextResponse.json(wire));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/urls',
      error,
      { projectWorkflowId: auth.projectWorkflowId }
    );
    console.error('GET competition-scraping urls error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch competitor URLs' },
        { status: 500 }
      )
    );
  }
}

// POST /api/projects/[projectId]/competition-scraping/urls
// Body: CreateCompetitorUrlRequest. Required: platform, url. Optional:
// the rest of the metadata fields. Idempotent on (workflow, platform, url).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId, userId } = auth;

  let body: Partial<CreateCompetitorUrlRequest>;
  try {
    body = (await req.json()) as Partial<CreateCompetitorUrlRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  if (!isPlatform(body.platform)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'platform is required and must be one of the supported values' },
        { status: 400 }
      )
    );
  }
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'url is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }
  // P-29 Slice #1 — `source` is optional; if present, must be a valid Source
  // value. If absent, the schema-level @default("extension") applies, which
  // preserves the Chrome extension's existing POST traffic semantics.
  if (body.source !== undefined && !isSource(body.source)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'source must be "extension" or "manual" when provided' },
        { status: 400 }
      )
    );
  }
  const platform = body.platform;

  // Build the create payload. Trim string fields. Pass undefined through
  // for unset numeric fields so Prisma's optional defaults apply.
  const createData: Prisma.CompetitorUrlUncheckedCreateInput = {
    projectWorkflowId,
    platform,
    url,
    competitionCategory:
      typeof body.competitionCategory === 'string' && body.competitionCategory.trim()
        ? body.competitionCategory.trim()
        : null,
    productName:
      typeof body.productName === 'string' && body.productName.trim()
        ? body.productName.trim()
        : null,
    brandName:
      typeof body.brandName === 'string' && body.brandName.trim()
        ? body.brandName.trim()
        : null,
    resultsPageRank:
      typeof body.resultsPageRank === 'number' ? body.resultsPageRank : null,
    productStarRating:
      typeof body.productStarRating === 'number' ? body.productStarRating : null,
    sellerStarRating:
      typeof body.sellerStarRating === 'number' ? body.sellerStarRating : null,
    numProductReviews:
      typeof body.numProductReviews === 'number' ? body.numProductReviews : null,
    numSellerReviews:
      typeof body.numSellerReviews === 'number' ? body.numSellerReviews : null,
    // P-6 — accept boolean from extension; omit (so schema default false applies) otherwise.
    ...(typeof body.isSponsoredAd === 'boolean'
      ? { isSponsoredAd: body.isSponsoredAd }
      : {}),
    customFields:
      body.customFields && typeof body.customFields === 'object'
        ? (body.customFields as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    // P-29 Slice #1 — accept Source value when present; omit so schema
    // default 'extension' applies otherwise. Misshapen `source` values are
    // rejected with 400 BEFORE reaching create — see validation above.
    ...(body.source !== undefined ? { source: body.source } : {}),
    addedBy: userId,
  };

  try {
    const created = await withRetry(() =>
      prisma.competitorUrl.create({ data: createData })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(
      req,
      NextResponse.json(toWireShape(created), { status: 201 })
    );
  } catch (error) {
    // P2002 unique-constraint violation → return existing row with 200.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      try {
        const existing = await withRetry(() =>
          prisma.competitorUrl.findUnique({
            where: {
              projectWorkflowId_platform_url: {
                projectWorkflowId,
                platform,
                url,
              },
            },
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
          'POST /api/projects/[projectId]/competition-scraping/urls (idempotent-lookup)',
          lookupError,
          { retried: true, projectWorkflowId }
        );
      }
    }
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('POST competition-scraping urls error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create competitor URL' },
        { status: 500 }
      )
    );
  }
}
