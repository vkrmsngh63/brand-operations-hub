// W#2 P-28 — DI seam for the cascade-counts read route under a
// competitor URL. Powers the URL-delete confirm dialog's disclosure
// ("This will also delete N captured texts and M captured images.")
// on both the URL list page and the URL detail page. Mirrors the
// urls.ts / url-text.ts factory shape — inner handler returns
// `{ status, body }` and never touches `next/server` types.

import {
  type HandlerResult,
  type RequestLike,
  type VerifyAuthFn,
} from './shared.ts';

export type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
  VerifyAuthResult,
} from './shared.ts';

const WORKFLOW = 'competition-scraping';

export type Ctx = {
  params: Promise<{ projectId: string; urlId: string }>;
};

// Minimal Prisma surface the handler exercises. Tests construct a fake
// that implements only these three methods.
export type CascadeCountsPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
  capturedText: {
    count(args: { where: object }): Promise<number>;
  };
  capturedImage: {
    count(args: { where: object }): Promise<number>;
  };
};

export type CascadeCountsHandlerDeps = {
  prisma: CascadeCountsPrismaLike;
  verifyAuth: VerifyAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export type CascadeCountsResponse = {
  texts: number;
  images: number;
};

export function makeCascadeCountsHandlers(deps: CascadeCountsHandlerDeps) {
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
      // Parallel counts — both fire against the same indexed
      // (competitorUrlId) column and complete in well under 10ms even
      // on the worst-case ~300-images-per-URL ceiling from §3.
      const [texts, images] = await Promise.all([
        deps.withRetry(() =>
          deps.prisma.capturedText.count({
            where: { competitorUrlId: urlId },
          })
        ),
        deps.withRetry(() =>
          deps.prisma.capturedImage.count({
            where: { competitorUrlId: urlId },
          })
        ),
      ]);
      const body: CascadeCountsResponse = { texts, images };
      return { status: 200, body };
    } catch (error) {
      deps.recordFlake(
        'GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/cascade-counts',
        error,
        { projectWorkflowId }
      );
      console.error('GET competition-scraping cascade-counts error:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch cascade counts' },
      };
    }
  }

  return { GET };
}
