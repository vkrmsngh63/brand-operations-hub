// W#2 P-49 Workstream 5 Session 3 FF#1 — PATCH endpoint for editing a
// stored ReviewAnalysis row's summary text per director's Phase 4
// redirect ("User should be able to edit the Review Summary").
//
// Route: PATCH /api/projects/[projectId]/competition-scraping/review-analysis/[analysisId]
// Body:  { summary: string }
//
// Scope guard: the row must (a) exist, (b) belong to this project via
// the related CompetitorUrl, AND (c) be level=PER_PRODUCT (per-review
// edits aren't enabled in this session; can be widened later by
// allowing PER_REVIEW + matching the existing analysisJson shape).
//
// The edit overwrites analysisJson.summary in place. No new row is
// created, no audit-trail rows are added (the schema has runByUserId
// for creator but no lastEditedBy column; adding one would be a
// schema change deferred until director asks for audit). Subsequent
// cache-lookups for the same (urlId, reviewIds-set, modelVersion,
// prompt-version) will return the edited summary, since the
// reviewsHash + level + urlId WHERE clause hits the SAME row whose
// analysisJson now carries the edited text.

import type { Prisma } from '@prisma/client';

import { summaryStringToTipTapDoc } from '../../rich-text/tiptap-helpers.ts';
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

export type Ctx = {
  params: Promise<{ projectId: string; analysisId: string }>;
};

export type ReviewAnalysisRowForUpdate = {
  id: string;
  level: 'PER_REVIEW' | 'PER_PRODUCT' | 'PER_CATEGORY' | 'PER_TYPE' | 'PER_PROJECT';
  urlId: string | null;
  projectId: string | null;
  analysisJson: Prisma.JsonValue;
  competitorUrl: { projectWorkflowId: string } | null;
};

export type ReviewAnalysisUpdatePrismaLike = {
  reviewAnalysis: {
    findUnique(args: {
      where: { id: string };
      select: {
        id: true;
        level: true;
        urlId: true;
        projectId: true;
        analysisJson: true;
        competitorUrl: { select: { projectWorkflowId: true } };
      };
    }): Promise<ReviewAnalysisRowForUpdate | null>;
    update(args: {
      where: { id: string };
      data: { analysisJson: Prisma.InputJsonValue };
      select: { id: true; analysisJson: true };
    }): Promise<{ id: string; analysisJson: Prisma.JsonValue }>;
  };
  // P-49 W5 Fix Session B (2026-05-30; D-11) — editing a PER_REVIEW summary
  // also syncs the review's "Your Analysis" box (CapturedReview.analysis) so
  // the table cell + URL-detail box stay a single source of truth (Q6 → A).
  capturedReview: {
    update(args: {
      where: { id: string };
      data: { analysis: Prisma.InputJsonValue };
    }): Promise<{ id: string }>;
  };
};

export type ReviewAnalysisUpdateHandlerDeps = {
  prisma: ReviewAnalysisUpdatePrismaLike;
  verifyAuth: VerifyAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export interface ReviewAnalysisUpdateResponseBody {
  id: string;
  summary: string;
}

// Caller is expected to send a non-empty trimmed string. Trim whitespace
// + reject empty so the UI can't accidentally null out the summary cell.
const MAX_SUMMARY_LENGTH = 50_000;

export function makeReviewAnalysisUpdateHandlers(
  deps: ReviewAnalysisUpdateHandlerDeps
) {
  const { prisma, verifyAuth, recordFlake, withRetry } = deps;

  async function PATCH(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, analysisId } = await ctx.params;
    const auth = await verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    const trimmedAnalysisId = analysisId.trim();
    if (!trimmedAnalysisId) {
      return { status: 400, body: { error: 'analysisId is required' } };
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    if (!rawBody || typeof rawBody !== 'object') {
      return { status: 400, body: { error: 'Body must be a JSON object' } };
    }
    const body = rawBody as { summary?: unknown };
    if (typeof body.summary !== 'string') {
      return {
        status: 400,
        body: { error: 'summary must be a string' },
      };
    }
    const summary = body.summary.trim();
    if (!summary) {
      return {
        status: 400,
        body: { error: 'summary must be a non-empty string' },
      };
    }
    if (summary.length > MAX_SUMMARY_LENGTH) {
      return {
        status: 400,
        body: {
          error: `summary too long; max ${MAX_SUMMARY_LENGTH} characters`,
        },
      };
    }

    let row: ReviewAnalysisRowForUpdate | null;
    try {
      row = await withRetry(() =>
        prisma.reviewAnalysis.findUnique({
          where: { id: trimmedAnalysisId },
          select: {
            id: true,
            level: true,
            urlId: true,
            projectId: true,
            analysisJson: true,
            competitorUrl: { select: { projectWorkflowId: true } },
          },
        })
      );
    } catch (error) {
      recordFlake('PATCH review-analysis-update load', error, {
        projectId,
        analysisId: trimmedAnalysisId,
      });
      return {
        status: 500,
        body: { error: 'Failed to load analysis row' },
      };
    }

    if (!row) {
      return { status: 404, body: { error: 'Analysis row not found' } };
    }

    // Scope guard — the row must belong to this project via the related
    // CompetitorUrl's projectWorkflowId. PER_PRODUCT + PER_REVIEW rows
    // both have a urlId; the join through CompetitorUrl gives us the
    // projectWorkflowId for the auth comparison.
    if (
      !row.competitorUrl ||
      row.competitorUrl.projectWorkflowId !== projectWorkflowId
    ) {
      return {
        status: 404,
        body: { error: 'Analysis row not found in this project' },
      };
    }

    // PATCH support: level=PER_PRODUCT (Per-Competitor banner; Session 3) +
    // level=PER_REVIEW (per-review summary cells; P-49 W5 Fix Session B
    // 2026-05-30, D-11 + Q9 → same Edit-button pattern as the banner row).
    // Other aggregation levels (PER_CATEGORY / PER_TYPE / PER_PROJECT) have
    // no Edit surface yet — reject with a clear message rather than silently
    // editing something the UI doesn't support.
    if (row.level !== 'PER_PRODUCT' && row.level !== 'PER_REVIEW') {
      return {
        status: 400,
        body: {
          error: `Edit not supported for level=${row.level}; only PER_PRODUCT (per-competitor) and PER_REVIEW rows are editable in this version.`,
        },
      };
    }

    // Merge the new summary into the existing analysisJson shape. Per-
    // Product analysisJson currently carries { summary }; if future
    // sessions add fields, preserve them by spreading the existing
    // object instead of overwriting.
    const existingJson =
      row.analysisJson && typeof row.analysisJson === 'object' && !Array.isArray(row.analysisJson)
        ? (row.analysisJson as Record<string, Prisma.JsonValue>)
        : {};
    const nextAnalysisJson: Prisma.InputJsonValue = {
      ...existingJson,
      summary,
    } as Prisma.InputJsonValue;

    let updated: { id: string; analysisJson: Prisma.JsonValue };
    try {
      updated = await withRetry(() =>
        prisma.reviewAnalysis.update({
          where: { id: trimmedAnalysisId },
          data: { analysisJson: nextAnalysisJson },
          select: { id: true, analysisJson: true },
        })
      );
    } catch (error) {
      recordFlake('PATCH review-analysis-update persist', error, {
        projectId,
        analysisId: trimmedAnalysisId,
      });
      return {
        status: 500,
        body: { error: 'Failed to persist edit' },
      };
    }

    // P-49 W5 Fix Session B (2026-05-30; D-11) — when a PER_REVIEW summary is
    // edited, sync the review's "Your Analysis" box (CapturedReview.analysis)
    // so the table cell + URL-detail box don't diverge (single source of
    // truth per Q6 → A). reviewId lives on the PER_REVIEW analysisJson.
    // Soft-fail: the ReviewAnalysis edit already persisted + returns to the
    // client regardless; a divergent box is recoverable on the next AI run.
    if (row.level === 'PER_REVIEW') {
      const reviewId =
        existingJson &&
        typeof (existingJson as { reviewId?: unknown }).reviewId === 'string'
          ? (existingJson as { reviewId: string }).reviewId
          : null;
      if (reviewId) {
        try {
          await withRetry(() =>
            prisma.capturedReview.update({
              where: { id: reviewId },
              data: {
                analysis: summaryStringToTipTapDoc(
                  summary
                ) as Prisma.InputJsonValue,
              },
            })
          );
        } catch (error) {
          recordFlake('PATCH review-analysis-update per-review writeback', error, {
            projectId,
            analysisId: trimmedAnalysisId,
            reviewId,
          });
        }
      }
    }

    const updatedSummary =
      updated.analysisJson &&
      typeof updated.analysisJson === 'object' &&
      !Array.isArray(updated.analysisJson) &&
      typeof (updated.analysisJson as { summary?: unknown }).summary === 'string'
        ? (updated.analysisJson as { summary: string }).summary
        : summary;

    const responseBody: ReviewAnalysisUpdateResponseBody = {
      id: updated.id,
      summary: updatedSummary,
    };
    return { status: 200, body: responseBody };
  }

  return { PATCH };
}
