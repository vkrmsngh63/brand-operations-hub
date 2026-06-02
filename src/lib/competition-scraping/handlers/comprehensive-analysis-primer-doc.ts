// W#2 P-55 Phase 3 part 3 (2026-06-02-d) — DI seam for the director's SAVED
// edit of the teaching primer. Mirrors comprehensive-analysis.ts: the inner
// handlers return `{ status, body }` and never touch `next/server`.
//
// Storage: the SAME per-Project row as the Comprehensive Analysis doc
// (ComprehensiveCompetitorAnalysis.projectId @unique), in the additive nullable
// `primerJson` column. This handler owns ONLY that column — the analysis-doc
// handler owns `contentJson`. They upsert the same row without clobbering each
// other (each sets only its own field on update).
//
//   GET  → 200 { primerJson: <TipTap doc> | null }. null = no saved override
//          (no row yet, or the override was reset) → the page uses the
//          auto-generated primer.
//   PUT  → upsert { primerJson: <TipTap doc> | null }. null clears the override
//          ("Reset to default"). lastEditedBy = auth.userId.

// Value import: `Prisma.DbNull` is needed at runtime to clear a nullable Json
// column (plain `null` is rejected by Prisma). Importing the client module does
// NOT open a DB connection, so it's safe under `node --test`.
import { Prisma } from '@prisma/client';

import type { HandlerResult, RequestLike } from './shared.ts';

export type { HandlerResult, RequestLike } from './shared.ts';

export type Ctx = { params: Promise<{ projectId: string }> };

// Only the columns this handler touches (+ the ones an upsert create needs).
export type PrimerDocRow = {
  primerJson: Prisma.JsonValue | null;
};

export type PrimerDocPrismaLike = {
  comprehensiveCompetitorAnalysis: {
    findUnique(args: {
      where: { projectId: string };
      select: { primerJson: true };
    }): Promise<PrimerDocRow | null>;
    upsert(args: {
      where: { projectId: string };
      create: Prisma.ComprehensiveCompetitorAnalysisUncheckedCreateInput;
      update: Prisma.ComprehensiveCompetitorAnalysisUpdateInput;
      select: { primerJson: true };
    }): Promise<PrimerDocRow>;
  };
};

export type VerifyProjectAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: HandlerResult };

export type VerifyProjectAuthFn = (
  req: RequestLike,
  projectId: string
) => Promise<VerifyProjectAuthResult>;

export type PrimerDocHandlerDeps = {
  prisma: PrimerDocPrismaLike;
  verifyProjectAuth: VerifyProjectAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// The saved primer column → wire value: a TipTap doc object, or null when
// unset / shaped wrong (defensive: a hand-edited DB never 500s the client).
export function toPrimerWire(
  row: PrimerDocRow | null
): { primerJson: Record<string, unknown> | null } {
  if (!row || row.primerJson == null) return { primerJson: null };
  return { primerJson: isPlainObject(row.primerJson) ? row.primerJson : null };
}

// Validate the PUT body. The only writable field is `primerJson`, which must
// be a TipTap doc object OR null (null = reset the override to default).
export type PrimerPatch = { primerJson: Record<string, unknown> | null };

export type PrimerValidation =
  | { ok: true; patch: PrimerPatch }
  | { ok: false; error: string };

export function extractPrimerDocPatch(body: unknown): PrimerValidation {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  if (!('primerJson' in body)) {
    return { ok: false, error: 'primerJson is required' };
  }
  const v = body.primerJson;
  if (v === null) return { ok: true, patch: { primerJson: null } };
  if (!isPlainObject(v)) {
    return {
      ok: false,
      error: 'primerJson must be an object (TipTap document JSON) or null',
    };
  }
  return { ok: true, patch: { primerJson: v } };
}

export function makeComprehensiveAnalysisPrimerDocHandlers(
  deps: PrimerDocHandlerDeps
) {
  const { prisma, verifyProjectAuth, recordFlake, withRetry } = deps;

  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;
    try {
      const row = await withRetry(() =>
        prisma.comprehensiveCompetitorAnalysis.findUnique({
          where: { projectId },
          select: { primerJson: true },
        })
      );
      return { status: 200, body: toPrimerWire(row) };
    } catch (error) {
      recordFlake('GET comprehensive-analysis-primer', error, { projectId });
      return { status: 500, body: { error: 'Failed to load the saved primer' } };
    }
  }

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
    const result = extractPrimerDocPatch(raw);
    if (!result.ok) return { status: 400, body: { error: result.error } };
    const { primerJson } = result.patch;

    const now = new Date();
    // contentJson omitted → schema @default("{}") seeds it on create; the
    // analysis-doc handler owns it thereafter.
    const create: Prisma.ComprehensiveCompetitorAnalysisUncheckedCreateInput = {
      projectId,
      primerJson:
        primerJson === null
          ? Prisma.DbNull
          : (primerJson as Prisma.InputJsonValue),
      lastEditedBy: userId,
      lastEditedAt: now,
    };
    const update: Prisma.ComprehensiveCompetitorAnalysisUpdateInput = {
      primerJson:
        primerJson === null
          ? Prisma.DbNull
          : (primerJson as Prisma.InputJsonValue),
      lastEditedBy: userId,
    };

    try {
      const row = await withRetry(() =>
        prisma.comprehensiveCompetitorAnalysis.upsert({
          where: { projectId },
          create,
          update,
          select: { primerJson: true },
        })
      );
      return { status: 200, body: toPrimerWire(row) };
    } catch (error) {
      recordFlake('PUT comprehensive-analysis-primer', error, {
        projectId,
        userId,
      });
      return { status: 500, body: { error: 'Failed to save the primer' } };
    }
  }

  return { GET, PUT };
}
