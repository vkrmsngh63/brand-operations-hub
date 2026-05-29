// W#2 P-46 Workstream 2 Session 4 — DI seam for the captured-reviews-under-URL
// route (urls/[urlId]/reviews). Mirrors url-text.ts; inner handlers return
// `{ status, body }` and stay free of `next/server`.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.1b + §C.2.

import { Prisma } from '@prisma/client';

import {
  type CapturedReview,
  type CreateCapturedReviewRequest,
  type ListCapturedReviewsResponse,
} from '../../shared-types/competition-scraping.ts';

import { isValidAnalysisPayload } from '../../rich-text/tiptap-helpers.ts';

import type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
} from './shared.ts';

export type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
  VerifyAuthResult,
} from './shared.ts';

const WORKFLOW = 'competition-scraping';

export type Ctx = { params: Promise<{ projectId: string; urlId: string }> };

export type CapturedReviewRow = {
  id: string;
  clientId: string;
  competitorUrlId: string;
  starRating: number;
  title: string | null; // P-49 W5 Fix Session B (2026-05-30)
  body: string;
  reviewerName: string | null;
  reviewDate: Date | null;
  tags: Prisma.JsonValue;
  analysis: Prisma.JsonValue;
  source: string;
  // P-49 Workstream 2 (2026-05-26) — extension-scrape additive columns per §A.16.
  sortRank: number | null;
  // P-49 W5 Fix Session C (2026-05-29-c) — per-page review-row drag order.
  sortRankInReviewsTable: number | null;
  helpfulCount: number | null;
  platform: string | null;
  addedBy: string;
  addedAt: Date;
  updatedAt: Date;
};

// Minimal Prisma surface the handler exercises.
export type UrlReviewsPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
  capturedReview: {
    create(args: {
      data: Prisma.CapturedReviewUncheckedCreateInput;
    }): Promise<CapturedReviewRow>;
    findUnique(args: { where: object }): Promise<CapturedReviewRow | null>;
    findMany(args: {
      where: object;
      orderBy: object;
    }): Promise<CapturedReviewRow[]>;
  };
};

export type UrlReviewsHandlerDeps = {
  prisma: UrlReviewsPrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export function toWireShape(row: CapturedReviewRow | null): CapturedReview | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    starRating: row.starRating,
    title: row.title,
    body: row.body,
    reviewerName: row.reviewerName,
    reviewDate: row.reviewDate ? row.reviewDate.toISOString() : null,
    tags: (row.tags ?? []) as string[],
    analysis: (row.analysis ?? {}) as Record<string, unknown>,
    source: row.source,
    // P-49 Workstream 2 (2026-05-26) — extension-scrape fields per §A.16.
    sortRank: row.sortRank,
    // P-49 W5 Fix Session C (2026-05-29-c) — per-page review-row drag order.
    sortRankInReviewsTable: row.sortRankInReviewsTable,
    helpfulCount: row.helpfulCount,
    platform: row.platform,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function parseReviewDate(value: unknown): { ok: true; date: Date | null } | { ok: false } {
  if (value === null || value === undefined) return { ok: true, date: null };
  if (typeof value !== 'string') return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: true, date: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { ok: false };
  return { ok: true, date };
}

export function makeUrlReviewsHandlers(deps: UrlReviewsHandlerDeps) {
  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    try {
      const parent = await deps.withRetry(() =>
        deps.prisma.competitorUrl.findFirst({
          where: { id: urlId, projectWorkflowId },
          select: { id: true },
        })
      );
      if (!parent) {
        return { status: 404, body: { error: 'Competitor URL not found' } };
      }
      const rows = await deps.withRetry(() =>
        deps.prisma.capturedReview.findMany({
          where: { competitorUrlId: urlId },
          orderBy: [{ addedAt: 'asc' }],
        })
      );
      const wire = rows.map(
        (r) => toWireShape(r)!
      ) satisfies ListCapturedReviewsResponse;
      return { status: 200, body: wire };
    } catch (error) {
      deps.recordFlake(
        'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews',
        error,
        { projectWorkflowId }
      );
      console.error('GET competition-scraping reviews error:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch captured reviews' },
      };
    }
  }

  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId, userId } = auth;

    let body: Partial<CreateCapturedReviewRequest>;
    try {
      body = (await req.json()) as Partial<CreateCapturedReviewRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    const clientId =
      typeof body.clientId === 'string' ? body.clientId.trim() : '';
    if (!clientId) {
      return {
        status: 400,
        body: { error: 'clientId is required and must be a non-empty string' },
      };
    }
    if (
      typeof body.starRating !== 'number' ||
      !Number.isInteger(body.starRating) ||
      body.starRating < 1 ||
      body.starRating > 5
    ) {
      return {
        status: 400,
        body: { error: 'starRating is required and must be an integer in [1, 5]' },
      };
    }
    if (typeof body.body !== 'string' || body.body.trim().length === 0) {
      return {
        status: 400,
        body: { error: 'body is required and must be a non-empty string' },
      };
    }
    if (body.tags !== undefined && !isStringArray(body.tags)) {
      return {
        status: 400,
        body: { error: 'tags must be an array of strings' },
      };
    }
    if (
      body.reviewerName !== undefined &&
      body.reviewerName !== null &&
      typeof body.reviewerName !== 'string'
    ) {
      return {
        status: 400,
        body: { error: 'reviewerName must be a string or null' },
      };
    }
    const parsedReviewDate = parseReviewDate(body.reviewDate);
    if (!parsedReviewDate.ok) {
      return {
        status: 400,
        body: { error: 'reviewDate must be an ISO date string or null' },
      };
    }
    if (body.analysis !== undefined && !isValidAnalysisPayload(body.analysis)) {
      return {
        status: 400,
        body: { error: 'analysis must be a JSON object' },
      };
    }
    if (body.source !== undefined && typeof body.source !== 'string') {
      return {
        status: 400,
        body: { error: 'source must be a string' },
      };
    }
    const source = body.source ?? 'manual';

    // P-49 Workstream 2 (2026-05-26) — accept extension-scrape additive fields per §A.16.
    if (
      body.helpfulCount !== undefined &&
      (typeof body.helpfulCount !== 'number' || !Number.isInteger(body.helpfulCount) || body.helpfulCount < 0)
    ) {
      return {
        status: 400,
        body: { error: 'helpfulCount must be a non-negative integer' },
      };
    }
    if (body.platform !== undefined && typeof body.platform !== 'string') {
      return {
        status: 400,
        body: { error: 'platform must be a string' },
      };
    }

    const parent = await deps.withRetry(() =>
      deps.prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { id: true },
      })
    );
    if (!parent) {
      return { status: 404, body: { error: 'Competitor URL not found' } };
    }

    const reviewerName =
      typeof body.reviewerName === 'string' && body.reviewerName.trim()
        ? body.reviewerName.trim()
        : null;

    // P-49 W5 Fix Session B (2026-05-30) — review headline. Trim + collapse
    // empty to null so body-only reviews carry null (matches reviewerName).
    if (
      body.title !== undefined &&
      body.title !== null &&
      typeof body.title !== 'string'
    ) {
      return { status: 400, body: { error: 'title must be a string or null' } };
    }
    const title =
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim()
        : null;

    const createData: Prisma.CapturedReviewUncheckedCreateInput = {
      clientId,
      competitorUrlId: urlId,
      starRating: body.starRating,
      title,
      body: body.body,
      reviewerName,
      reviewDate: parsedReviewDate.date,
      tags: body.tags ?? [],
      analysis: (body.analysis ?? {}) as Prisma.InputJsonValue,
      source,
      // P-49 Workstream 2 (2026-05-26) — extension-scrape additive columns per §A.16.
      helpfulCount: body.helpfulCount ?? null,
      platform:
        typeof body.platform === 'string' && body.platform.trim()
          ? body.platform.trim()
          : null,
      addedBy: userId,
    };

    try {
      const created = await deps.withRetry(() =>
        deps.prisma.capturedReview.create({ data: createData })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return { status: 201, body: toWireShape(created) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        try {
          const existing = await deps.withRetry(() =>
            deps.prisma.capturedReview.findUnique({ where: { clientId } })
          );
          if (existing) {
            return { status: 200, body: toWireShape(existing) };
          }
        } catch (lookupError) {
          deps.recordFlake(
            'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews (idempotent-lookup)',
            lookupError,
            { retried: true, projectWorkflowId }
          );
        }
      }
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('POST competition-scraping reviews error:', error);
      return {
        status: 500,
        body: { error: 'Failed to create captured review' },
      };
    }
  }

  return { GET, POST };
}
