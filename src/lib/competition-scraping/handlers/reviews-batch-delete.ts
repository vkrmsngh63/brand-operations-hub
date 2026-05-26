// W#2 P-49 Workstream 4 Session 1 — DI seam for the captured-reviews
// batch-delete route (competition-scraping/reviews/batch-delete). POST.
//
// Accepts `{ reviewIds: string[] }`. Deletes only the reviews the auth'd
// project actually owns; silently skips IDs that resolve to a different
// project or to a missing row (mirrors per-row DELETE's idempotent
// "missing == 200" precedent). Returns `{ deleted: number }`.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.6 + §C.4.

import { Prisma } from '@prisma/client';

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

// Hard ceiling on a single batch — chosen large enough to cover "wipe a
// fully-scraped Amazon product corpus" (~1000 reviews from the 2026-05-28
// W2 Amazon deploy cross-star cap) with margin, but small enough that a
// runaway client can't issue a million-ID delete that holds Prisma open
// for minutes.
export const MAX_BATCH_DELETE = 2000;

export type Ctx = { params: Promise<{ projectId: string }> };

export type BatchDeleteRequest = {
  reviewIds: string[];
};

export type BatchDeleteResponse = {
  deleted: number;
};

export type ReviewsBatchDeletePrismaLike = {
  capturedReview: {
    findMany(args: {
      where: object;
      select: { id: true };
    }): Promise<Array<{ id: string }>>;
    deleteMany(args: { where: object }): Promise<{ count: number }>;
  };
};

export type ReviewsBatchDeleteHandlerDeps = {
  prisma: ReviewsBatchDeletePrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function makeReviewsBatchDeleteHandlers(
  deps: ReviewsBatchDeleteHandlerDeps
) {
  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    let body: Partial<BatchDeleteRequest>;
    try {
      body = (await req.json()) as Partial<BatchDeleteRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    if (!isStringArray(body.reviewIds)) {
      return {
        status: 400,
        body: { error: 'reviewIds must be an array of strings' },
      };
    }

    // Dedupe + drop empties. Treat empty array as a 200 no-op so a UI that
    // fires "delete N selected" with N=0 doesn't 400.
    const requested = Array.from(
      new Set(body.reviewIds.map((id) => id.trim()).filter((id) => id.length > 0))
    );
    if (requested.length === 0) {
      return { status: 200, body: { deleted: 0 } satisfies BatchDeleteResponse };
    }
    if (requested.length > MAX_BATCH_DELETE) {
      return {
        status: 400,
        body: {
          error: `Too many reviewIds — max ${MAX_BATCH_DELETE} per batch`,
        },
      };
    }

    try {
      // Filter to project-owned IDs before deleting. findMany returns the
      // intersection of (requested IDs) ∩ (rows whose parent CompetitorUrl
      // is in the auth'd project workflow). Any ID not in this set is
      // silently skipped — same idempotent posture as per-row DELETE.
      const owned = await deps.withRetry(() =>
        deps.prisma.capturedReview.findMany({
          where: {
            id: { in: requested },
            competitorUrl: { projectWorkflowId },
          },
          select: { id: true },
        })
      );
      const ownedIds = owned.map((r) => r.id);
      if (ownedIds.length === 0) {
        return {
          status: 200,
          body: { deleted: 0 } satisfies BatchDeleteResponse,
        };
      }
      const result = await deps.withRetry(() =>
        deps.prisma.capturedReview.deleteMany({
          where: { id: { in: ownedIds } },
        })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return {
        status: 200,
        body: { deleted: result.count } satisfies BatchDeleteResponse,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return {
          status: 200,
          body: { deleted: 0 } satisfies BatchDeleteResponse,
        };
      }
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/reviews/batch-delete',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('POST competition-scraping batch-delete error:', error);
      return {
        status: 500,
        body: { error: 'Failed to delete reviews' },
      };
    }
  }

  return { POST };
}
