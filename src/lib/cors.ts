// CORS pure helpers — applied to W#2 API routes that the Chrome extension
// calls. Pure logic only (no Next.js imports) so this module is unit-testable
// in isolation via node:test. The Next-aware response factories live in
// cors-response.ts.
//
// Per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.2, routes used by
// the extension need an OPTIONS preflight handler that allows the
// `chrome-extension://*` origin. Same-origin web-app calls don't need
// CORS and won't trigger preflight.
//
// Why a permissive `chrome-extension://*` allowlist is acceptable: every
// route still runs `verifyAuth` / `verifyProjectAuth` /
// `verifyProjectWorkflowAuth` against a Supabase JWT in the
// `Authorization: Bearer <token>` header. The CORS check is a browser-side
// guard against XHR forgery, not the auth boundary; it's safe to allow
// any chrome-extension origin so long as the JWT verification stands.
// Locking down to a specific extension ID would require knowing the
// production Web Store ID at PLOS-build time, which we don't have until
// Phase 2 distribution per §13.2.

const ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization';
const PREFLIGHT_MAX_AGE = '86400'; // 24 hours

export function isAllowedOrigin(origin: string | null): boolean {
  return !!origin && origin.startsWith('chrome-extension://');
}

// Returns the headers object to merge into a response when the origin is
// an allowed extension. Returns an empty object for same-origin / unknown
// origins (browser treats as same-origin; no CORS headers needed).
export function corsHeaders(origin: string | null): Record<string, string> {
  if (!isAllowedOrigin(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin as string,
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    'Access-Control-Max-Age': PREFLIGHT_MAX_AGE,
    Vary: 'Origin',
  };
}
