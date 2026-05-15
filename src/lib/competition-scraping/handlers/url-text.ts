// W#2 P-31 — DI seam for the captured-text-under-URL route
// (urls/[urlId]/text). Mirrors the urls.ts factory pattern. The inner
// handlers return `{ status, body }` and never touch `next/server` types.

import { Prisma } from '@prisma/client';

import {
  isSource,
  type CapturedText,
  type CreateCapturedTextRequest,
  type ListCapturedTextsResponse,
} from '../../shared-types/competition-scraping.ts';

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

export type CapturedTextRow = {
  id: string;
  clientId: string;
  competitorUrlId: string;
  contentCategory: string | null;
  text: string;
  // Prisma returns JSON columns as JsonValue; toWireShape coerces to string[].
  tags: Prisma.JsonValue;
  sortOrder: number;
  source: string;
  addedBy: string;
  addedAt: Date;
  updatedAt: Date;
};

// Minimal Prisma surface the handler exercises.
export type UrlTextPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
  capturedText: {
    create(args: {
      data: Prisma.CapturedTextUncheckedCreateInput;
    }): Promise<CapturedTextRow>;
    findUnique(args: { where: object }): Promise<CapturedTextRow | null>;
    findMany(args: { where: object; orderBy: object }): Promise<CapturedTextRow[]>;
  };
};

export type UrlTextHandlerDeps = {
  prisma: UrlTextPrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export function toWireShape(row: CapturedTextRow | null): CapturedText | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    contentCategory: row.contentCategory,
    text: row.text,
    tags: (row.tags ?? []) as string[],
    sortOrder: row.sortOrder,
    source: row.source as CapturedText['source'],
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function makeUrlTextHandlers(deps: UrlTextHandlerDeps) {
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
        deps.prisma.capturedText.findMany({
          where: { competitorUrlId: urlId },
          orderBy: [{ sortOrder: 'asc' }, { addedAt: 'asc' }],
        })
      );
      const wire = rows.map(
        (r) => toWireShape(r)!
      ) satisfies ListCapturedTextsResponse;
      return { status: 200, body: wire };
    } catch (error) {
      deps.recordFlake(
        'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/text',
        error,
        { projectWorkflowId }
      );
      console.error('GET competition-scraping text error:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch captured text' },
      };
    }
  }

  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId, userId } = auth;

    let body: Partial<CreateCapturedTextRequest>;
    try {
      body = (await req.json()) as Partial<CreateCapturedTextRequest>;
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
    if (typeof body.text !== 'string') {
      return {
        status: 400,
        body: { error: 'text is required and must be a string' },
      };
    }
    const text = body.text;

    if (body.tags !== undefined && !isStringArray(body.tags)) {
      return {
        status: 400,
        body: { error: 'tags must be an array of strings' },
      };
    }
    if (body.sortOrder !== undefined && typeof body.sortOrder !== 'number') {
      return {
        status: 400,
        body: { error: 'sortOrder must be a number' },
      };
    }
    if (body.source !== undefined && !isSource(body.source)) {
      return {
        status: 400,
        body: { error: 'source must be one of: extension, manual' },
      };
    }
    const source = body.source ?? 'extension';

    const parent = await deps.withRetry(() =>
      deps.prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { id: true },
      })
    );
    if (!parent) {
      return { status: 404, body: { error: 'Competitor URL not found' } };
    }

    const contentCategory =
      typeof body.contentCategory === 'string' && body.contentCategory.trim()
        ? body.contentCategory.trim()
        : null;

    const createData: Prisma.CapturedTextUncheckedCreateInput = {
      clientId,
      competitorUrlId: urlId,
      contentCategory,
      text,
      tags: body.tags ?? [],
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      source,
      addedBy: userId,
    };

    try {
      const created = await deps.withRetry(() =>
        deps.prisma.capturedText.create({ data: createData })
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
            deps.prisma.capturedText.findUnique({ where: { clientId } })
          );
          if (existing) {
            return { status: 200, body: toWireShape(existing) };
          }
        } catch (lookupError) {
          deps.recordFlake(
            'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text (idempotent-lookup)',
            lookupError,
            { retried: true, projectWorkflowId }
          );
        }
      }
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error('POST competition-scraping text error:', error);
      return {
        status: 500,
        body: { error: 'Failed to create captured text' },
      };
    }
  }

  return { GET, POST };
}
