// API client for PLOS endpoints. Adds Authorization: Bearer <JWT> on every
// request; surfaces structured errors.
//
// Future build sessions extend this file with W#2-specific endpoints
// (POST .../text, the two-phase image upload, etc.) using the shared types
// from src/lib/shared-types/competition-scraping.ts.

import { getAccessToken } from './auth.ts';
import { PlosApiError } from './errors.ts';
import type {
  CompetitorUrl,
  CreateCompetitorUrlRequest,
  ListCompetitorUrlsResponse,
  Platform,
} from '../../../../src/lib/shared-types/competition-scraping.ts';

// Canonical domain: vklf.com (apex) 308-redirects to www.vklf.com at the
// Vercel edge before the route handler runs. CORS preflight responses on
// edge redirects don't carry the Access-Control-* headers, so the browser
// blocks the chain. Using the canonical hostname directly avoids the
// redirect and lets the OPTIONS handler in /api/projects respond as designed.
const PLOS_API_BASE_URL = 'https://www.vklf.com';

// Re-export error types from errors.ts so existing call sites that import
// from api-client.ts keep working. Standalone errors.ts exists so modules
// that only need the error class (api-bridge.ts) don't transitively pull
// in auth.ts → supabase under node:test.
export type { ApiError } from './errors.ts';
export { PlosApiError } from './errors.ts';

// The slice of /api/projects's GET response the extension actually consumes.
// The PLOS server returns more (workflow rows, _count, etc.); we declare only
// what the popup uses so the rest can evolve server-side without breaking
// the extension type-checks.
export interface ExtensionProject {
  id: string;
  name: string;
  description: string | null;
  lastActivityAt: string;
}

async function authedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new PlosApiError(401, 'Not signed in');
  }
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(`${PLOS_API_BASE_URL}${path}`, { ...init, headers });
}

/**
 * Lists the Projects accessible to the signed-in user.
 *
 * Server returns the array sorted most-recent-activity-first; the popup
 * preserves that order in the picker.
 */
export async function listProjects(): Promise<ExtensionProject[]> {
  const res = await authedFetch('/api/projects');
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.error === 'string') message = body.error;
    } catch {
      // ignore JSON parse errors — fall back to HTTP status
    }
    throw new PlosApiError(res.status, message);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new PlosApiError(500, 'Unexpected response shape from /api/projects');
  }
  return data
    .filter(
      (p): p is ExtensionProject =>
        typeof p === 'object' &&
        p !== null &&
        typeof (p as ExtensionProject).id === 'string' &&
        typeof (p as ExtensionProject).name === 'string',
    )
    .map((p) => ({
      id: p.id,
      name: p.name,
      description:
        typeof p.description === 'string' ? p.description : null,
      lastActivityAt:
        typeof p.lastActivityAt === 'string' ? p.lastActivityAt : '',
    }));
}

/**
 * Reads + parses a JSON body, surfacing a PlosApiError on non-2xx response.
 * Shared between the GET-list and POST-create paths below.
 */
async function readJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body?.error === 'string') message = body.error;
    } catch {
      // ignore JSON parse errors — fall back to HTTP status
    }
    throw new PlosApiError(res.status, message);
  }
  return (await res.json()) as T;
}

/**
 * Lists CompetitorUrl rows for the given Project, optionally filtered by
 * platform. The content-script orchestrator calls this once per page-load
 * (when the user is on a platform that matches their popup-state) to build
 * the recognition cache for the "already saved" icon + detail-page overlay.
 *
 * Server returns the array in any order; the orchestrator's recognition
 * cache uses a `Set<normalizedUrl>` for O(1) lookups so order doesn't matter.
 */
export async function listCompetitorUrls(
  projectId: string,
  platform: Platform | null,
): Promise<ListCompetitorUrlsResponse> {
  const query = platform ? `?platform=${encodeURIComponent(platform)}` : '';
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/competition-scraping/urls${query}`,
  );
  const data = await readJsonOrThrow<unknown>(res);
  if (!Array.isArray(data)) {
    throw new PlosApiError(
      500,
      'Unexpected response shape from competition-scraping/urls',
    );
  }
  // Server-side type contract is the source of truth (CompetitorUrl in
  // shared-types). We pass the array through unchanged — the orchestrator
  // only reads `.url` for the recognition Set, so a future additive
  // server-side change won't break our parsing.
  return data as ListCompetitorUrlsResponse;
}

/**
 * Creates a new CompetitorUrl for the given Project. Idempotent server-side
 * per §11.2 — if a row already exists for (projectWorkflowId, platform, url)
 * the server returns the existing row with status 200 (vs 201 for the
 * fresh-create path). Either status maps to success here.
 *
 * Surfaces PlosApiError on 4xx/5xx; caller (UrlAddOverlayForm) maps the
 * error to an inline red message under the form.
 */
export async function createCompetitorUrl(
  projectId: string,
  body: CreateCompetitorUrlRequest,
): Promise<CompetitorUrl> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/competition-scraping/urls`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJsonOrThrow<CompetitorUrl>(res);
}
