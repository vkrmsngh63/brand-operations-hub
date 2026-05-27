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

    // Session 3 ships PATCH support for level=PER_PRODUCT only (the
    // Per-Competitor banner is the only surface with an Edit button
    // today). Per-Review row edits land later if director asks; for
    // now reject with a clear message instead of silently editing
    // something the UI doesn't yet support.
    if (row.level !== 'PER_PRODUCT') {
      return {
        status: 400,
        body: {
          error: `Edit not supported for level=${row.level}; only PER_PRODUCT (per-competitor) rows are editable in this version.`,
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
