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
