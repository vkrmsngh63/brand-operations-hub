// W#2 P-49 Workstream 4 Session 1 — DI seam for the captured-reviews
// reorder route (competition-scraping/urls/[urlId]/reviews/reorder). PUT.
//
// Accepts `{ orderings: Array<{ reviewId: string, sortRank: number }> }`.
// Persists `sortRank` for each requested review, scoped to the parent
// CompetitorUrl's project workflow. Reviews that resolve to a different
// project or to a missing row are silently skipped. Returns
// `{ updated: number }`.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.5 + §C.4. Storage column
// `CapturedReview.sortRank Int?` shipped in P-49 W2 Session 1 + reached
// production via the 2026-05-28 Amazon DEPLOY.

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

// Hard ceiling per batch — chosen at the same per-product cap (~1000
// reviews from the 2026-05-28 W2 Amazon deploy cross-star cap) with
// margin. A reorder of a fully-scraped product will be at most this big.
export const MAX_REORDER_BATCH = 2000;

export type Ctx = { params: Promise<{ projectId: string; urlId: string }> };

export type ReorderEntry = {
  reviewId: string;
  sortRank: number;
};

// P-49 W5 Fix Session C "Deploy 2" (2026-05-29-c) — which order column the
// payload targets. Default 'sortRank' keeps the URL-detail-page reorder
// (Workstream 4) working unchanged; the Competitor Reviews Analysis Table
// page sends 'sortRankInReviewsTable' so its per-page order never overwrites
// the URL-detail order.
export const REORDER_FIELDS = ['sortRank', 'sortRankInReviewsTable'] as const;
export type ReorderField = (typeof REORDER_FIELDS)[number];

export type ReorderRequest = {
  orderings: ReorderEntry[];
  field?: ReorderField;
};

export type ReorderResponse = {
  updated: number;
};

export type ReviewsReorderPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
  capturedReview: {
    findMany(args: {
      where: object;
      select: { id: true };
    }): Promise<Array<{ id: string }>>;
    update(args: {
      where: object;
      data: Prisma.CapturedReviewUncheckedUpdateInput;
    }): Promise<{ id: string }>;
  };
  $transaction: <T>(fn: () => Promise<T>) => Promise<T>;
};

export type ReviewsReorderHandlerDeps = {
  prisma: ReviewsReorderPrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

function isReorderEntry(value: unknown): value is ReorderEntry {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.reviewId === 'string' &&
    v.reviewId.trim().length > 0 &&
    typeof v.sortRank === 'number' &&
    Number.isFinite(v.sortRank) &&
    Number.isInteger(v.sortRank)
  );
}

function isReorderEntryArray(value: unknown): value is ReorderEntry[] {
  return Array.isArray(value) && value.every(isReorderEntry);
}

export function makeReviewsReorderHandlers(deps: ReviewsReorderHandlerDeps) {
  async function PUT(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    let body: Partial<ReorderRequest>;
    try {
      body = (await req.json()) as Partial<ReorderRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    if (!isReorderEntryArray(body.orderings)) {
      return {
        status: 400,
        body: {
          error:
            'orderings must be an array of { reviewId: string, sortRank: integer }',
        },
      };
    }
    // Default to the URL-detail-page order column for back-compat; the
    // analysis table page opts into its own per-page column explicitly.
    const field: ReorderField = body.field ?? 'sortRank';
    if (!REORDER_FIELDS.includes(field)) {
      return {
        status: 400,
        body: {
          error: `field must be one of: ${REORDER_FIELDS.join(', ')}`,
        },
      };
    }
    if (body.orderings.length === 0) {
      return { status: 200, body: { updated: 0 } satisfies ReorderResponse };
    }
    if (body.orderings.length > MAX_REORDER_BATCH) {
      return {
        status: 400,
        body: {
          error: `Too many orderings — max ${MAX_REORDER_BATCH} per batch`,
        },
      };
    }

    // Confirm the URL belongs to the auth'd project workflow before any
    // write. Mirrors the url-reviews.ts parent-ownership check; prevents a
    // cross-project reviewer ID forging into a different URL's reorder.
    const parent = await deps.withRetry(() =>
      deps.prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { id: true },
      })
    );
    if (!parent) {
      return { status: 404, body: { error: 'Competitor URL not found' } };
    }

    // Dedupe by reviewId — if the same ID appears twice with different
    // sortRanks, the last entry wins (mirrors the React useState
    // last-write-wins debounce; the UI's debounced flush only ever sends
    // the latest order anyway, but the server defends defensively).
    const lastById = new Map<string, number>();
    for (const entry of body.orderings) {
      lastById.set(entry.reviewId, entry.sortRank);
    }
    const requestedIds = Array.from(lastById.keys());

    try {
      // Filter to reviews under THIS url AND the auth'd project workflow.
      // Cross-URL reorder attempts (a reviewId from a different product
      // smuggled into this URL's reorder payload) are silently dropped.
      const owned = await deps.withRetry(() =>
        deps.prisma.capturedReview.findMany({
          where: {
            id: { in: requestedIds },
            competitorUrlId: urlId,
            competitorUrl: { projectWorkflowId },
          },
          select: { id: true },
        })
      );
      const ownedIds = owned.map((r) => r.id);
      if (ownedIds.length === 0) {
        return { status: 200, body: { updated: 0 } satisfies ReorderResponse };
      }

      // Apply updates inside a transaction so a partial failure rolls back
      // (avoids the "half the list reordered, half didn't" UX failure).
      let updatedCount = 0;
      await deps.prisma.$transaction(async () => {
        for (const id of ownedIds) {
          const rank = lastById.get(id);
          if (rank === undefined) continue;
          await deps.prisma.capturedReview.update({
            where: { id },
            data:
              field === 'sortRankInReviewsTable'
                ? { sortRankInReviewsTable: rank }
                : { sortRank: rank },
          });
          updatedCount += 1;
        }
      });
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return {
        status: 200,
        body: { updated: updatedCount } satisfies ReorderResponse,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return { status: 200, body: { updated: 0 } satisfies ReorderResponse };
      }
      deps.recordFlake(
        'PUT /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/reorder',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('PUT competition-scraping reviews-reorder error:', error);
      return {
        status: 500,
        body: { error: 'Failed to reorder reviews' },
      };
    }
  }

  return { PUT };
}
