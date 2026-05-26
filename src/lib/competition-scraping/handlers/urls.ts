// W#2 P-31 — DI seam for the competitor-URLs collection route.
//
// The factory `makeUrlsHandlers(deps)` returns inner GET/POST handlers
// that operate against the dep-injected request/prisma/auth/etc. The inner
// handlers return a normalized `{ status, body }` shape and never touch
// `next/server` types so the file can be loaded directly by
// `node --test --experimental-strip-types`. The production wiring lives
// in the sibling route.ts file, which adapts these handlers to
// NextRequest/NextResponse and CORS.

import { Prisma } from '@prisma/client';

import {
  isPlatform,
  isSource,
  type CompetitorUrl,
  type CreateCompetitorUrlRequest,
  type OverallAnalyses,
  type ScrapingStatus,
} from '../../shared-types/competition-scraping.ts';

const WORKFLOW = 'competition-scraping';

// ─── Test-friendly request + result types ───────────────────────────────

export type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
  VerifyAuthResult,
} from './shared.ts';

import type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
} from './shared.ts';

export type Ctx = { params: Promise<{ projectId: string }> };

// The row shape Prisma's `competitorUrl.findUnique` / `findMany` return.
// Repeated locally rather than re-exported from `@prisma/client` to keep
// the fake-prisma shape obvious for test authors.
export type CompetitorUrlRow = {
  id: string;
  projectWorkflowId: string;
  platform: string;
  url: string;
  competitionCategory: string | null;
  productName: string | null;
  brandName: string | null;
  resultsPageRank: number | null;
  productStarRating: number | null;
  sellerStarRating: number | null;
  numProductReviews: number | null;
  numSellerReviews: number | null;
  isSponsoredAd: boolean;
  customFields: Prisma.JsonValue;
  source: string;
  // P-46 Workstream 1 (2026-05-24) — new schema columns per
  // docs/COMPETITION_DATA_V2_DESIGN.md §A.11. All nullable or defaulted at
  // the schema layer so existing rows carry these on read after the
  // migration without backfill.
  type: string | null;
  description1: string | null;
  description2: string | null;
  price: string | null;
  competitionScore: number | null;
  scrapingStatus: string;
  overallCompetitorAnalysis: Prisma.JsonValue;
  overallAnalyses: Prisma.JsonValue;
  // P-49 Workstream 2 (2026-05-26) — per-URL review scrape cap per §A.4 + §A.16.
  reviewScrapeCap: number | null;
  addedBy: string;
  addedAt: Date;
  updatedAt: Date;
};

// Minimal Prisma surface the handler exercises. Tests construct a fake
// that implements only these three methods.
export type UrlsPrismaLike = {
  competitorUrl: {
    create(args: {
      data: Prisma.CompetitorUrlUncheckedCreateInput;
    }): Promise<CompetitorUrlRow>;
    findUnique(args: { where: object }): Promise<CompetitorUrlRow | null>;
    findMany(args: { where: object; orderBy: object }): Promise<CompetitorUrlRow[]>;
  };
};

export type UrlsHandlerDeps = {
  prisma: UrlsPrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

// ─── Pure helpers ────────────────────────────────────────────────────────

export function toWireShape(row: CompetitorUrlRow | null): CompetitorUrl | null {
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

// ─── Factory ─────────────────────────────────────────────────────────────

export function makeUrlsHandlers(deps: UrlsHandlerDeps) {
  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    const platformParam = req.nextUrl.searchParams.get('platform');
    if (platformParam !== null && !isPlatform(platformParam)) {
      return { status: 400, body: { error: 'Invalid platform' } };
    }

    try {
      const rows = await deps.withRetry(() =>
        deps.prisma.competitorUrl.findMany({
          where: {
            projectWorkflowId,
            ...(platformParam ? { platform: platformParam } : {}),
          },
          orderBy: [{ platform: 'asc' }, { addedAt: 'asc' }],
        })
      );
      const wire = rows.map((r) => toWireShape(r)!) satisfies CompetitorUrl[];
      return { status: 200, body: wire };
    } catch (error) {
      deps.recordFlake(
        'GET /api/projects/[projectId]/competition-scraping/urls',
        error,
        { projectWorkflowId }
      );
      console.error('GET competition-scraping urls error:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch competitor URLs' },
      };
    }
  }

  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId, userId } = auth;

    let body: Partial<CreateCompetitorUrlRequest>;
    try {
      body = (await req.json()) as Partial<CreateCompetitorUrlRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    if (!isPlatform(body.platform)) {
      return {
        status: 400,
        body: {
          error: 'platform is required and must be one of the supported values',
        },
      };
    }
    const url = typeof body.url === 'string' ? body.url.trim() : '';
    if (!url) {
      return {
        status: 400,
        body: { error: 'url is required and must be a non-empty string' },
      };
    }
    // P-29 Slice #1 — `source` is optional; if present, must be a valid
    // Source value. Absent → schema default 'extension' applies (preserves
    // the Chrome extension's existing POST traffic semantics).
    if (body.source !== undefined && !isSource(body.source)) {
      return {
        status: 400,
        body: {
          error: 'source must be "extension" or "manual" when provided',
        },
      };
    }
    const platform = body.platform;

    const createData: Prisma.CompetitorUrlUncheckedCreateInput = {
      projectWorkflowId,
      platform,
      url,
      competitionCategory:
        typeof body.competitionCategory === 'string' &&
        body.competitionCategory.trim()
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
        typeof body.productStarRating === 'number'
          ? body.productStarRating
          : null,
      sellerStarRating:
        typeof body.sellerStarRating === 'number' ? body.sellerStarRating : null,
      numProductReviews:
        typeof body.numProductReviews === 'number'
          ? body.numProductReviews
          : null,
      numSellerReviews:
        typeof body.numSellerReviews === 'number' ? body.numSellerReviews : null,
      ...(typeof body.isSponsoredAd === 'boolean'
        ? { isSponsoredAd: body.isSponsoredAd }
        : {}),
      customFields:
        body.customFields && typeof body.customFields === 'object'
          ? (body.customFields as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      ...(body.source !== undefined ? { source: body.source } : {}),
      // P-46 Workstream 5 (2026-05-24) — 4 new structural fields the
      // extension URL save form now collects up front. Whitespace-only
      // normalizes to null matching productName / brandName pattern above.
      type:
        typeof body.type === 'string' && body.type.trim()
          ? body.type.trim()
          : null,
      description1:
        typeof body.description1 === 'string' && body.description1.trim()
          ? body.description1.trim()
          : null,
      description2:
        typeof body.description2 === 'string' && body.description2.trim()
          ? body.description2.trim()
          : null,
      price:
        typeof body.price === 'string' && body.price.trim()
          ? body.price.trim()
          : null,
      addedBy: userId,
    };

    try {
      const created = await deps.withRetry(() =>
        deps.prisma.competitorUrl.create({ data: createData })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return { status: 201, body: toWireShape(created) };
    } catch (error) {
      // P2002 unique-constraint violation → return existing row with 200.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        try {
          const existing = await deps.withRetry(() =>
            deps.prisma.competitorUrl.findUnique({
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
            return { status: 200, body: toWireShape(existing) };
          }
        } catch (lookupError) {
          deps.recordFlake(
            'POST /api/projects/[projectId]/competition-scraping/urls (idempotent-lookup)',
            lookupError,
            { retried: true, projectWorkflowId }
          );
        }
      }
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('POST competition-scraping urls error:', error);
      return {
        status: 500,
        body: { error: 'Failed to create competitor URL' },
      };
    }
  }

  return { GET, POST };
}
