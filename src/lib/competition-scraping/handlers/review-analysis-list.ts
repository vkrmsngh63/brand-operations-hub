// W#2 P-49 W5 Fix Session A FF2 (2026-05-29) — GET endpoint listing
// ReviewAnalysis rows for the Reviews Analysis Table page hydrate-on-
// refresh. Closes D-8 (persistence-on-refresh bug) which was originally
// scoped to Fix Session B; director pushed it forward into FF2.
//
// Route: GET /api/projects/[projectId]/competition-scraping/review-analysis
// Returns: { items: ReviewAnalysisListEntry[] }
//
// Scope: PER_REVIEW + PER_PRODUCT rows only (the two levels rendered
// on the Reviews Analysis Table page). PER_CATEGORY / PER_TYPE /
// PER_PROJECT ship on different pages and have their own loaders.
//
// Mirrors the review-analysis-update handler's DI-seam factory pattern
// + auth shape. Handler logic lives here; the production route shim
// wires Prisma + verifyProjectWorkflowAuth + flake + retry.

import type { Prisma } from '@prisma/client';

import type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
} from './shared.ts';

export type { HandlerResult, RequestLike, VerifyAuthFn } from './shared.ts';

const WORKFLOW = 'competition-scraping';

export type Ctx = { params: Promise<{ projectId: string }> };

// Wire entry for one stored ReviewAnalysis row. urlId + analysisJson
// carry everything the Reviews Analysis Table page needs to hydrate
// the summaryByReviewId + competitorSummaryByUrlId maps:
//   - PER_REVIEW : urlId + analysisJson.reviewId + analysisJson.summary
//   - PER_PRODUCT: urlId + id (analysisId for the Edit affordance)
//                  + analysisJson.summary
// We keep analysisJson typed as Prisma.JsonValue at the boundary; the
// client extracts the fields it needs defensively.
// Level union widened to all 5 levels so Prisma's findMany return type
// (which doesn't narrow via WHERE clauses) flows through cleanly. The
// runtime WHERE clause restricts to PER_REVIEW + PER_PRODUCT; the
// client checks the level discriminator when hydrating state.
export interface ReviewAnalysisListEntry {
  id: string;
  level: 'PER_REVIEW' | 'PER_PRODUCT' | 'PER_CATEGORY' | 'PER_TYPE' | 'PER_PROJECT';
  urlId: string | null;
  // P-49 W5 Category page Session 2 — the category label for PER_CATEGORY rows
  // (null for PER_REVIEW/PER_PRODUCT). The Category page maps category summaries
  // back to their banner by this key.
  typeFilter: string | null;
  analysisJson: Prisma.JsonValue;
}

export interface ReviewAnalysisListResponseBody {
  items: ReviewAnalysisListEntry[];
}

export type ReviewAnalysisListPrismaLike = {
  reviewAnalysis: {
    findMany(args: {
      where: {
        projectId: string;
        level: { in: ReviewAnalysisListEntry['level'][] };
      };
      select: {
        id: true;
        level: true;
        urlId: true;
        typeFilter: true;
        analysisJson: true;
      };
      orderBy: { runAt: 'asc' };
    }): Promise<ReviewAnalysisListEntry[]>;
  };
};

export type ReviewAnalysisListHandlerDeps = {
  prisma: ReviewAnalysisListPrismaLike;
  verifyAuth: VerifyAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export function makeReviewAnalysisListHandlers(
  deps: ReviewAnalysisListHandlerDeps
) {
  const { prisma, verifyAuth, recordFlake, withRetry } = deps;

  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;

    try {
      const items = await withRetry(() =>
        prisma.reviewAnalysis.findMany({
          where: {
            projectId,
            level: { in: ['PER_REVIEW', 'PER_PRODUCT', 'PER_CATEGORY'] },
          },
          select: {
            id: true,
            level: true,
            urlId: true,
            typeFilter: true,
            analysisJson: true,
          },
          // Stable ordering so consecutive GETs return the same shape;
          // ascending runAt means earliest summaries come first which
          // keeps cache hydrate deterministic for tests.
          orderBy: { runAt: 'asc' },
        })
      );
      const body: ReviewAnalysisListResponseBody = { items };
      return { status: 200, body };
    } catch (error) {
      recordFlake('GET review-analysis list', error, { projectId });
      return {
        status: 500,
        body: { error: 'Failed to load stored review summaries' },
      };
    }
  }

  return { GET };
}
