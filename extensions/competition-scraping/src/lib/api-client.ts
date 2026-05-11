// API client for PLOS endpoints. Adds Authorization: Bearer <JWT> on every
// request; surfaces structured errors.
//
// Future build sessions extend this file with W#2-specific endpoints
// (POST .../text, the two-phase image upload, etc.) using the shared types
// from src/lib/shared-types/competition-scraping.ts.

import { getAccessToken } from './auth.ts';
import { PlosApiError } from './errors.ts';
import type {
  CapturedText,
  CompetitorUrl,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ExtensionStateDto,
  GetExtensionStateResponse,
  ListCompetitorUrlsResponse,
  ListHighlightTermsResponse,
  ListVocabularyEntriesResponse,
  Platform,
  ReplaceExtensionStateRequest,
  ReplaceExtensionStateResponse,
  ReplaceHighlightTermsRequest,
  ReplaceHighlightTermsResponse,
  VocabularyEntry,
  VocabularyType,
} from '../../../../src/lib/shared-types/competition-scraping.ts';
import type { HighlightTerm } from './highlight-terms.ts';

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

/**
 * Converts native `fetch()` transport-layer failures into a structured
 * `PlosApiError`. Native `fetch()` throws `TypeError("Failed to fetch")`
 * when the network is unreachable (offline, DNS failure, CORS preflight
 * failure, refused connection). Without this conversion, the raw TypeError
 * propagates uncaught through callers like `listProjects()` and surfaces
 * as a stack-trace-flavored message in popup UI.
 *
 * P-2 polish 2026-05-10: returns `PlosApiError(0, ...)` so downstream code
 * paths get a consistent error shape (status 0 reserved for "no HTTP
 * response received"). Non-TypeError errors are re-thrown unchanged so
 * AbortError + unknown shapes still propagate as their original type.
 *
 * Exported for unit testing in isolation — avoids the alternative of
 * mocking global `fetch` to exercise this single conversion.
 */
export function mapFetchTransportError(err: unknown): PlosApiError {
  if (err instanceof TypeError) {
    return new PlosApiError(0, 'Network unreachable — check your connection.');
  }
  throw err;
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
  try {
    return await fetch(`${PLOS_API_BASE_URL}${path}`, { ...init, headers });
  } catch (err) {
    throw mapFetchTransportError(err);
  }
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
 * Lists the user's Highlight Terms for the given Project, ordered as the
 * user arranged them. P-3 narrowed (2026-05-10) — server-side persistence
 * so signing in from any device / Chrome profile preserves the list.
 *
 * Wire shape mirrors HighlightTerm so the popup's existing term-management
 * code keeps working — the swap from chrome.storage.local to server is
 * structurally invisible at this seam.
 */
export async function listHighlightTerms(
  projectId: string,
): Promise<HighlightTerm[]> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/extension-state/highlight-terms`,
  );
  const body = await readJsonOrThrow<ListHighlightTermsResponse>(res);
  if (!Array.isArray(body.terms)) {
    throw new PlosApiError(500, 'Unexpected response shape from highlight-terms');
  }
  // Defensive shape check — drop any entry that doesn't look like
  // HighlightTerm. The route validates on write; this guards against an
  // older client encountering newer wire shapes.
  return body.terms.filter(
    (t): t is HighlightTerm =>
      typeof t === 'object' &&
      t !== null &&
      typeof (t as HighlightTerm).term === 'string' &&
      typeof (t as HighlightTerm).color === 'string',
  );
}

/**
 * Replaces the user's whole Highlight Terms list for the given Project.
 * Server semantics: deleteMany prior rows + createMany new rows inside one
 * $transaction. Idempotent — same body produces same end state.
 *
 * Returns the server's canonical view of the post-write list. Callers
 * should treat the response as authoritative (use it to update the local
 * cache mirror).
 */
export async function replaceHighlightTerms(
  projectId: string,
  terms: readonly HighlightTerm[],
): Promise<HighlightTerm[]> {
  const reqBody: ReplaceHighlightTermsRequest = {
    terms: terms.map((t) => ({ term: t.term, color: t.color })),
  };
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/extension-state/highlight-terms`,
    {
      method: 'PUT',
      body: JSON.stringify(reqBody),
    },
  );
  const body = await readJsonOrThrow<ReplaceHighlightTermsResponse>(res);
  if (!Array.isArray(body.terms)) {
    throw new PlosApiError(500, 'Unexpected response shape from highlight-terms');
  }
  return body.terms.filter(
    (t): t is HighlightTerm =>
      typeof t === 'object' &&
      t !== null &&
      typeof (t as HighlightTerm).term === 'string' &&
      typeof (t as HighlightTerm).color === 'string',
  );
}

/**
 * Reads the user's W#2 Chrome extension state from PLOS DB. P-3 broader
 * scope (2026-05-10-e) — server-side persistence so signing in from any
 * device / Chrome profile preserves the user's last-picked Project +
 * Platform. Both fields nullable (null = "not yet set" or stale-pointer
 * cleared by the server's GET path).
 */
export async function getExtensionState(): Promise<ExtensionStateDto> {
  const res = await authedFetch('/api/extension-state');
  const body = await readJsonOrThrow<GetExtensionStateResponse>(res);
  if (
    typeof body !== 'object' ||
    body === null ||
    (body.selectedProjectId !== null &&
      typeof body.selectedProjectId !== 'string') ||
    (body.selectedPlatform !== null &&
      typeof body.selectedPlatform !== 'string')
  ) {
    throw new PlosApiError(500, 'Unexpected response shape from extension-state');
  }
  return {
    selectedProjectId: body.selectedProjectId,
    selectedPlatform: body.selectedPlatform,
  };
}

/**
 * Replaces the user's W#2 Chrome extension state. PUT-replace semantics:
 * both fields explicit (null = clear). Server enforces a refined
 * "switching project clears platform" invariant: platform is forced to
 * null when (a) the request sets projectId to null, or (b) the request
 * transitions between two non-null different projects. The migration
 * case (prior projectId null + cache has both) does NOT trigger the
 * clear — the pair is preserved. Callers should treat the response as
 * authoritative (use it to update the local cache mirror).
 */
export async function replaceExtensionState(
  state: ExtensionStateDto,
): Promise<ExtensionStateDto> {
  const reqBody: ReplaceExtensionStateRequest = {
    selectedProjectId: state.selectedProjectId,
    selectedPlatform: state.selectedPlatform,
  };
  const res = await authedFetch('/api/extension-state', {
    method: 'PUT',
    body: JSON.stringify(reqBody),
  });
  const body = await readJsonOrThrow<ReplaceExtensionStateResponse>(res);
  if (
    typeof body !== 'object' ||
    body === null ||
    (body.selectedProjectId !== null &&
      typeof body.selectedProjectId !== 'string') ||
    (body.selectedPlatform !== null &&
      typeof body.selectedPlatform !== 'string')
  ) {
    throw new PlosApiError(500, 'Unexpected response shape from extension-state');
  }
  return {
    selectedProjectId: body.selectedProjectId,
    selectedPlatform: body.selectedPlatform,
  };
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

/**
 * Creates a CapturedText row attached to a CompetitorUrl. Session 4
 * (Module 2 text-capture path) — POSTs to the existing route shipped in
 * API-routes session 2 (2026-05-07). Idempotent server-side on `clientId`:
 * a duplicate clientId returns the existing row with status 200 instead of
 * 201. Either status maps to success here.
 */
export async function createCapturedText(
  projectId: string,
  urlId: string,
  body: CreateCapturedTextRequest,
): Promise<CapturedText> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/competition-scraping/urls/${encodeURIComponent(urlId)}/text`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJsonOrThrow<CapturedText>(res);
}

/**
 * Lists project-scoped vocabulary entries for one vocabulary type. Used by
 * the text-capture form (content-category picker) and future image-capture
 * form (image-category picker). The server returns entries oldest-first,
 * matching the "history of what's been used" reading.
 */
export async function listVocabularyEntries(
  projectId: string,
  vocabularyType: VocabularyType,
): Promise<VocabularyEntry[]> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/vocabulary?type=${encodeURIComponent(vocabularyType)}`,
  );
  const data = await readJsonOrThrow<ListVocabularyEntriesResponse>(res);
  if (!Array.isArray(data)) {
    throw new PlosApiError(500, 'Unexpected response shape from vocabulary');
  }
  return data;
}

/**
 * Adds a new vocabulary entry (or returns the existing row on dedup hit per
 * the server's §11.1 upsert semantics). Used by the text-capture form's
 * "+ Add new" affordance on the content-category picker, and the popup
 * paste flow's category picker.
 */
export async function createVocabularyEntry(
  projectId: string,
  body: CreateVocabularyEntryRequest,
): Promise<VocabularyEntry> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/vocabulary`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJsonOrThrow<VocabularyEntry>(res);
}
