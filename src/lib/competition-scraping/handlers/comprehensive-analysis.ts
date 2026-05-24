// W#2 P-46 Workstream 4 — DI seam for the per-Project Comprehensive
// Competitor Analysis rich-text doc. Mirrors user-table-preferences.ts /
// url-text.ts factory pattern; the inner handlers return `{ status, body }`
// and never touch `next/server` types.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §C.4.
//
// One row per Project (ComprehensiveCompetitorAnalysis.projectId is @unique).
// The TipTap document JSON is stored in the `contentJson` column. The
// `lastEditedBy` field carries the auth-derived userId so we know which
// admin last touched the doc; `lastEditedAt` is Prisma-managed via
// @updatedAt. The schema requires `lastEditedAt` explicitly on the create
// path of an upsert (Prisma's @updatedAt only auto-fires on .update()).

import type { Prisma } from '@prisma/client';

import type { ComprehensiveCompetitorAnalysis } from '../../shared-types/competition-scraping.ts';

import type { HandlerResult, RequestLike } from './shared.ts';

export type { HandlerResult, RequestLike } from './shared.ts';

export type Ctx = { params: Promise<{ projectId: string }> };

// Shape of the row Prisma returns from the comprehensiveCompetitorAnalysis
// delegate.
export type ComprehensiveAnalysisRow = {
  id: string;
  projectId: string;
  contentJson: Prisma.JsonValue;
  lastEditedBy: string;
  lastEditedAt: Date;
  createdAt: Date;
};

// Minimal Prisma surface the handler exercises.
export type ComprehensiveAnalysisPrismaLike = {
  comprehensiveCompetitorAnalysis: {
    findUnique(args: {
      where: { projectId: string };
    }): Promise<ComprehensiveAnalysisRow | null>;
    upsert(args: {
      where: { projectId: string };
      create: Prisma.ComprehensiveCompetitorAnalysisUncheckedCreateInput;
      update: Prisma.ComprehensiveCompetitorAnalysisUpdateInput;
    }): Promise<ComprehensiveAnalysisRow>;
  };
};

// Authn/authz seam. Mirrors verifyProjectAuth's contract — { userId } on
// success, { error: HandlerResult } on failure. Tests pass a stub.
export type VerifyProjectAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: HandlerResult };

export type VerifyProjectAuthFn = (
  req: RequestLike,
  projectId: string
) => Promise<VerifyProjectAuthResult>;

export type ComprehensiveAnalysisHandlerDeps = {
  prisma: ComprehensiveAnalysisPrismaLike;
  verifyProjectAuth: VerifyProjectAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

// Convert a Prisma row to the wire shape. The `contentJson` JSON column
// is typed as JsonValue at the Prisma layer; this coerces to the typed
// Record<string, unknown> shape the wire contract promises. Bad shapes
// in the DB (shouldn't happen since PUT validates strictly) fall back to
// the empty TipTap doc default so the client never sees a 500 just
// because someone hand-edited the DB.
export function toWireShape(
  row: ComprehensiveAnalysisRow
): ComprehensiveCompetitorAnalysis {
  return {
    id: row.id,
    projectId: row.projectId,
    contentJson: toContentJson(row.contentJson),
    lastEditedBy: row.lastEditedBy,
    lastEditedAt: row.lastEditedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function toContentJson(value: Prisma.JsonValue): Record<string, unknown> {
  if (isPlainObject(value)) return value;
  return {};
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

// Strict trust-boundary validation. The only client-writable field is
// `contentJson` — `lastEditedBy` + `lastEditedAt` are server-managed
// (auth.userId + Prisma @updatedAt). Returns the validated patch or an
// error string. Unknown keys at the top level are silently ignored
// (additive-future-safe).
export type ValidatedPatch = {
  contentJson: Record<string, unknown>;
};

export type ValidationResult =
  | { ok: true; patch: ValidatedPatch }
  | { ok: false; error: string };

export function extractComprehensiveAnalysisPatch(
  body: unknown
): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const b = body as Record<string, unknown>;
  if (!('contentJson' in b)) {
    return { ok: false, error: 'contentJson is required' };
  }
  const v = b.contentJson;
  if (!isPlainObject(v)) {
    return {
      ok: false,
      error: 'contentJson must be an object (TipTap document JSON)',
    };
  }
  return { ok: true, patch: { contentJson: v } };
}

// Factory returning the GET + PUT inner handlers. Production wires
// `verifyProjectAuth = (req, projectId) => verifyProjectAuth(req, projectId)`
// from src/lib/auth.ts; tests inject stubs.
export function makeComprehensiveAnalysisHandlers(
  deps: ComprehensiveAnalysisHandlerDeps
) {
  const { prisma, verifyProjectAuth, recordFlake, withRetry } = deps;

  // GET /api/projects/[projectId]/competition-scraping/comprehensive-analysis
  // 200 { row } when present; 404 when no doc saved yet (client falls back
  // to empty-state read view). 401/403 from auth as usual.
  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;

    try {
      const row = await withRetry(() =>
        prisma.comprehensiveCompetitorAnalysis.findUnique({
          where: { projectId },
        })
      );
      if (!row) {
        return {
          status: 404,
          body: { error: 'No analysis saved yet' },
        };
      }
      return { status: 200, body: toWireShape(row) };
    } catch (error) {
      recordFlake('GET comprehensive-analysis', error, { projectId });
      return {
        status: 500,
        body: { error: 'Failed to load comprehensive analysis' },
      };
    }
  }

  // PUT /api/projects/[projectId]/competition-scraping/comprehensive-analysis
  // Upsert semantics. Body is `{ contentJson: TipTap-doc }`; lastEditedBy
  // populated from auth.userId. First write creates the row; subsequent
  // writes update contentJson + lastEditedBy. lastEditedAt is Prisma-
  // managed via @updatedAt on update; passed explicitly on create.
  async function PUT(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    const result = extractComprehensiveAnalysisPatch(raw);
    if (!result.ok) {
      return { status: 400, body: { error: result.error } };
    }
    const { contentJson } = result.patch;

    const now = new Date();
    const create: Prisma.ComprehensiveCompetitorAnalysisUncheckedCreateInput = {
      projectId,
      contentJson: contentJson as Prisma.InputJsonValue,
      lastEditedBy: userId,
      lastEditedAt: now,
    };
    const update: Prisma.ComprehensiveCompetitorAnalysisUpdateInput = {
      contentJson: contentJson as Prisma.InputJsonValue,
      lastEditedBy: userId,
    };

    try {
      const row = await withRetry(() =>
        prisma.comprehensiveCompetitorAnalysis.upsert({
          where: { projectId },
          create,
          update,
        })
      );
      return { status: 200, body: toWireShape(row) };
    } catch (error) {
      recordFlake('PUT comprehensive-analysis', error, { projectId, userId });
      return {
        status: 500,
        body: { error: 'Failed to save comprehensive analysis' },
      };
    }
  }

  return { GET, PUT };
}
