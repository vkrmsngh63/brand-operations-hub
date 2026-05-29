// W#2 P-46 Workstream 2 Session 4 — DI seam for the captured-reviews per-row
// route (competition-scraping/reviews/[reviewId]). PATCH + DELETE.
//
// Per-row routes for the other capture types (text/[textId], images/[imageId],
// videos/[videoId]) ship as direct-shape route files without a DI seam. This
// session sets the precedent of extracting per-record handlers too — the
// `analysis`-field trust boundary + the per-field allowlist warrant unit
// coverage at the handler layer rather than relying on integration tests.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.1b + §C.2.

import { Prisma } from '@prisma/client';

import {
  type CapturedReview,
  type UpdateCapturedReviewRequest,
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

export type Ctx = { params: Promise<{ projectId: string; reviewId: string }> };

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

// Minimal Prisma surface the handler exercises. The ownership lookup uses
// findFirst with a relation filter on competitorUrl.projectWorkflowId — the
// same shape text/[textId] and images/[imageId] PATCH/DELETE use.
export type ReviewsByIdPrismaLike = {
  capturedReview: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
    update(args: {
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }): Promise<CapturedReviewRow>;
    delete(args: { where: object }): Promise<{ id: string }>;
  };
};

export type ReviewsByIdHandlerDeps = {
  prisma: ReviewsByIdPrismaLike;
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
  if (value === null) return { ok: true, date: null };
  if (typeof value !== 'string') return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: true, date: null };
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return { ok: false };
  return { ok: true, date };
}

export function makeReviewsByIdHandlers(deps: ReviewsByIdHandlerDeps) {
  async function PATCH(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, reviewId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    let body: UpdateCapturedReviewRequest;
    try {
      body = (await req.json()) as UpdateCapturedReviewRequest;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    const owned = await deps.withRetry(() =>
      deps.prisma.capturedReview.findFirst({
        where: {
          id: reviewId,
          competitorUrl: { projectWorkflowId },
        },
        select: { id: true },
      })
    );
    if (!owned) {
      return { status: 404, body: { error: 'Captured review not found' } };
    }

    const data: Prisma.CapturedReviewUncheckedUpdateInput = {};

    if (body.starRating !== undefined) {
      if (
        typeof body.starRating !== 'number' ||
        !Number.isInteger(body.starRating) ||
        body.starRating < 1 ||
        body.starRating > 5
      ) {
        return {
          status: 400,
          body: { error: 'starRating must be an integer in [1, 5]' },
        };
      }
      data.starRating = body.starRating;
    }
    if (body.body !== undefined) {
      if (typeof body.body !== 'string' || body.body.trim().length === 0) {
        return {
          status: 400,
          body: { error: 'body must be a non-empty string' },
        };
      }
      data.body = body.body;
    }
    // P-49 W5 Fix Session B (2026-05-30) — review headline edit. Trim +
    // collapse empty to null so clearing the field stores null (body-only).
    if (body.title !== undefined) {
      if (body.title !== null && typeof body.title !== 'string') {
        return {
          status: 400,
          body: { error: 'title must be a string or null' },
        };
      }
      data.title =
        typeof body.title === 'string' && body.title.trim()
          ? body.title.trim()
          : null;
    }
    if (body.reviewerName !== undefined) {
      if (
        body.reviewerName !== null &&
        typeof body.reviewerName !== 'string'
      ) {
        return {
          status: 400,
          body: { error: 'reviewerName must be a string or null' },
        };
      }
      data.reviewerName =
        typeof body.reviewerName === 'string' && body.reviewerName.trim()
          ? body.reviewerName.trim()
          : null;
    }
    if (body.reviewDate !== undefined) {
      const parsed = parseReviewDate(body.reviewDate);
      if (!parsed.ok) {
        return {
          status: 400,
          body: { error: 'reviewDate must be an ISO date string or null' },
        };
      }
      data.reviewDate = parsed.date;
    }
    if (body.tags !== undefined) {
      if (!isStringArray(body.tags)) {
        return {
          status: 400,
          body: { error: 'tags must be an array of strings' },
        };
      }
      data.tags = body.tags;
    }
    // P-46 Workstream 2 Session 4 (2026-05-28) — per-item Analysis TipTap doc
    // JSON. Same trust-boundary guard pattern as text/[textId] /
    // images/[imageId] / videos/[videoId]: rejects null / arrays / primitives
    // before the Json column write so the renderer never sees a misshapen
    // payload.
    if (body.analysis !== undefined) {
      if (!isValidAnalysisPayload(body.analysis)) {
        return {
          status: 400,
          body: { error: 'analysis must be a JSON object' },
        };
      }
      data.analysis = body.analysis as Prisma.InputJsonValue;
    }

    try {
      const updated = await deps.withRetry(() =>
        deps.prisma.capturedReview.update({
          where: { id: reviewId },
          data,
        })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return { status: 200, body: toWireShape(updated) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return { status: 404, body: { error: 'Captured review not found' } };
      }
      deps.recordFlake(
        'PATCH /api/projects/[projectId]/competition-scraping/reviews/[reviewId]',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('PATCH competition-scraping reviews error:', error);
      return {
        status: 500,
        body: { error: 'Failed to update captured review' },
      };
    }
  }

  async function DELETE(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, reviewId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    const owned = await deps.withRetry(() =>
      deps.prisma.capturedReview.findFirst({
        where: {
          id: reviewId,
          competitorUrl: { projectWorkflowId },
        },
        select: { id: true },
      })
    );
    if (!owned) {
      return { status: 200, body: { success: true } };
    }

    try {
      await deps.withRetry(() =>
        deps.prisma.capturedReview.delete({
          where: { id: reviewId },
        })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return { status: 200, body: { success: true } };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return { status: 200, body: { success: true } };
      }
      deps.recordFlake(
        'DELETE /api/projects/[projectId]/competition-scraping/reviews/[reviewId]',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('DELETE competition-scraping reviews error:', error);
      return {
        status: 500,
        body: { error: 'Failed to delete captured review' },
      };
    }
  }

  return { PATCH, DELETE };
}
