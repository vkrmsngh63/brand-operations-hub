// W#2 P-31 — shared types for the per-route DI handler factories.
//
// Each factory in this directory (urls.ts, url-text.ts, images-finalize.ts,
// images-fetch-by-url.ts) is loaded directly by
// `node --test --experimental-strip-types`, so the shared types here MUST
// NOT pull in `next/server` or anything Next-specific. The production
// route.ts shim files at `src/app/api/.../route.ts` adapt these to
// NextRequest/NextResponse and CORS.

// Minimal request shape every inner handler reads. Production passes a
// real NextRequest (which satisfies this interface); tests pass a plain
// literal object — no `next/server` import needed in tests.
export type RequestLike = {
  json(): Promise<unknown>;
  nextUrl: { searchParams: URLSearchParams };
};

// Normalized response shape returned by every inner handler. The route
// shim adapts this to `NextResponse.json(body, { status })` + CORS.
export type HandlerResult = { status: number; body: unknown };

// Auth-resolution result. Mirrors the convention in `src/lib/auth.ts`
// (error: null on success; populated on failure) but uses HandlerResult
// for the error shape so the inner handler stays Next-free.
export type VerifyAuthResult =
  | {
      projectWorkflowId: string;
      userId: string;
      error: null;
    }
  | {
      projectWorkflowId: null;
      userId: null;
      error: HandlerResult;
    };

export type VerifyAuthFn = (
  req: RequestLike,
  projectId: string,
  workflow: string
) => Promise<VerifyAuthResult>;
