// API client for PLOS endpoints. Adds Authorization: Bearer <JWT> on every
// request; surfaces structured errors.
//
// Future build sessions extend this file with W#2-specific endpoints
// (POST .../text, the two-phase image upload, etc.) using the shared types
// from src/lib/shared-types/competition-scraping.ts.

import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as productionSupabase } from './supabase.ts';
import { PlosApiError } from './errors.ts';
import type {
  AcceptedImageMimeType,
  CapturedImage,
  CapturedText,
  CompetitorUrl,
  CreateCapturedTextRequest,
  CreateCompetitorUrlRequest,
  CreateVocabularyEntryRequest,
  ExtensionStateDto,
  FinalizeImageUploadRequest,
  FinalizeImageUploadResponse,
  GetExtensionStateResponse,
  ListCompetitorUrlsResponse,
  ListHighlightTermsResponse,
  ListVocabularyEntriesResponse,
  Platform,
  ReplaceExtensionStateRequest,
  ReplaceExtensionStateResponse,
  ReplaceHighlightTermsRequest,
  ReplaceHighlightTermsResponse,
  RequestImageUploadRequest,
  RequestImageUploadResponse,
  VocabularyEntry,
  VocabularyType,
} from '../../../../src/lib/shared-types/competition-scraping.ts';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  isAcceptedImageMimeType,
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

// ── authedFetch ────────────────────────────────────────────────
// Adds Authorization: Bearer <JWT> on every request; on 401 attempts
// a single silent refresh of the Supabase session via refreshSession()
// and retries once with the new access token. If the refresh ALSO fails
// (refresh token expired ~1 week away, network offline, server-side
// revocation) the original 401 Response is returned to the caller —
// preserving the existing PlosApiError(401) error path the popup UI
// renders today. P-12 mirrors P-1's makeAuthFetch in src/lib/authFetch.ts;
// the extension's API client previously had no 401-retry, so transient
// 401s surfaced as broken-popup state until popup re-open.
//
// The 401-retry covers the common case where the access token has
// expired (1-hour TTL) but the refresh token is still valid (~1-week
// TTL). With autoRefreshToken: true on the Supabase client (see
// supabase.ts), the client refreshes in the background — but the
// explicit refresh on 401 closes the window between token expiry and
// the next background refresh tick.

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export interface AuthedFetchDeps {
  supabase: Pick<SupabaseClient, 'auth'>;
  fetchFn: FetchFn;
}

export function makeAuthedFetch(deps: AuthedFetchDeps) {
  return async function authedFetchImpl(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const { data: { session } } = await deps.supabase.auth.getSession();
    const initialToken = session?.access_token;

    if (!initialToken) {
      throw new PlosApiError(401, 'Not signed in');
    }

    const buildHeaders = (token: string) => {
      const h = new Headers(init.headers);
      h.set('Authorization', `Bearer ${token}`);
      if (init.body && !h.has('Content-Type')) {
        h.set('Content-Type', 'application/json');
      }
      return h;
    };

    let firstResponse: Response;
    try {
      firstResponse = await deps.fetchFn(`${PLOS_API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(initialToken),
      });
    } catch (err) {
      throw mapFetchTransportError(err);
    }

    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    // Access token rejected — try a silent refresh + one retry.
    const refreshResult = await deps.supabase.auth.refreshSession();
    const newToken = refreshResult?.data?.session?.access_token;

    if (refreshResult?.error || !newToken) {
      return firstResponse;
    }

    try {
      return await deps.fetchFn(`${PLOS_API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(newToken),
      });
    } catch (err) {
      throw mapFetchTransportError(err);
    }
  };
}

// Production export. Wrap fetch in an arrow so the browser invokes it
// with its window receiver — passing `fetch` bare would detach it and
// surface "Illegal invocation" on the first call. Same regression P-17
// captured for the web side's authFetch.ts production wiring (commit
// 08f10e5 hotfix 2026-05-12). The Supabase client singleton from
// supabase.ts already wires the chrome.storage.local adapter so token
// persistence + autoRefreshToken work correctly in the extension runtime.
const authedFetch: ReturnType<typeof makeAuthedFetch> = (path, init) =>
  makeAuthedFetch({
    supabase: productionSupabase,
    fetchFn: (u, i) => fetch(u, i),
  })(path, init);

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

// ─── Image upload — Module 2 two-phase flow (session 5, 2026-05-12-i) ────
//
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3 + §11.1. Three calls
// per save: requestImageUpload (Phase 1) → putImageBytesToSignedUrl (Phase
// 2, direct to Supabase Storage) → finalizeImageUpload (Phase 3, server
// creates the CapturedImage row).
//
// All three are invoked end-to-end inside the background service worker
// (see entrypoints/background.ts → handleSubmitImageCapture) — fetching
// the image bytes happens in extension origin so cross-origin image CDNs
// are covered by wxt.config.ts host_permissions; PUT to Supabase Storage
// from extension origin sidesteps the host-page CORS preflight that would
// block the same PUT from a content-script origin.

/**
 * Phase 1 — POST metadata to PLOS, get back a 5-minute signed Supabase
 * Storage URL the extension PUTs the bytes to in Phase 2.
 *
 * Idempotency: server generates a fresh `capturedImageId` per call (the
 * DB row doesn't exist yet — it's created in Phase 3). Retries on transport
 * failure yield a new signed URL pointing at a fresh storage path; orphan
 * objects from failed retries are cleaned by the daily janitor.
 */
export async function requestImageUpload(
  projectId: string,
  urlId: string,
  body: RequestImageUploadRequest,
): Promise<RequestImageUploadResponse> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/competition-scraping/urls/${encodeURIComponent(urlId)}/images/requestUpload`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJsonOrThrow<RequestImageUploadResponse>(res);
}

/**
 * Phase 2 — direct PUT of the image bytes to the signed Supabase Storage
 * URL returned by Phase 1. Bytes never pass through Vercel (bypasses the
 * 4.5 MB body cap + 5-min function timeout — STACK_DECISIONS §3).
 *
 * The signed URL embeds auth + the storage path; no Authorization header
 * is needed. `Content-Type` must match the MIME the server pre-recorded
 * at Phase 1 (Supabase Storage rejects MIME mismatches as 415).
 *
 * Throws PlosApiError on any non-2xx response or transport failure so the
 * caller (background) can surface a consistent error shape to the form.
 *
 * Optional `fetchFn` is the injection seam node:test exercises in
 * api-client.test.ts; production callers omit it (uses global fetch).
 */
export async function putImageBytesToSignedUrl(
  uploadUrl: string,
  bytes: ArrayBuffer | Blob,
  mimeType: AcceptedImageMimeType,
  fetchFn: FetchFn = (u, i) => fetch(u, i),
): Promise<void> {
  let res: Response;
  try {
    res = await fetchFn(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: bytes,
    });
  } catch (err) {
    throw mapFetchTransportError(err);
  }
  if (!res.ok) {
    let message = `Supabase Storage PUT failed: HTTP ${res.status}`;
    try {
      // Supabase returns text/plain or XML on PUT errors; surface the body
      // verbatim so the daily logs are debuggable.
      const text = await res.text();
      if (text) message = `${message} — ${text.slice(0, 200)}`;
    } catch {
      // ignore — fall back to status-only message
    }
    throw new PlosApiError(res.status, message);
  }
}

/**
 * Phase 3 — POST finalize to PLOS; server creates the CapturedImage row
 * referencing the uploaded file. Idempotent server-side on `clientId`:
 * a duplicate clientId returns the existing row with 200 instead of 201.
 *
 * The mimeType / sourceType / fileSize fields are echoed back to the
 * server from Phase 1 so the server can re-derive the storage path
 * without keeping intermediate state between calls (per STACK_DECISIONS
 * §11.1 finalize body reshape note 2026-05-07).
 */
export async function finalizeImageUpload(
  projectId: string,
  urlId: string,
  body: FinalizeImageUploadRequest,
): Promise<FinalizeImageUploadResponse> {
  const res = await authedFetch(
    `/api/projects/${encodeURIComponent(projectId)}/competition-scraping/urls/${encodeURIComponent(urlId)}/images/finalize`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
  return readJsonOrThrow<CapturedImage>(res);
}

export interface FetchedImageBytes {
  bytes: ArrayBuffer;
  mimeType: AcceptedImageMimeType;
  fileSize: number;
}

/**
 * Fetches the bytes of a host-page image given its srcUrl. Called from
 * the background service worker (extension origin) so cross-origin image
 * CDNs covered by wxt.config.ts host_permissions are reachable.
 *
 * Returns the bytes alongside the resolved MIME type — preference order:
 *   1. The response's `Content-Type` header (verified against the
 *      three-MIME allow list per STACK_DECISIONS §3).
 *   2. The src URL's extension as a last resort for CDNs that don't set
 *      Content-Type (uncommon for image CDNs, but defensive).
 *
 * Rejects with PlosApiError when:
 *   - the URL is unreachable (TypeError → status 0)
 *   - the response is non-2xx (status echoed)
 *   - the MIME isn't one of the three accepted types (PlosApiError(415))
 *   - the bytes exceed IMAGE_UPLOAD_MAX_BYTES (PlosApiError(413)) — saves
 *     a round-trip to the server which would reject at requestUpload
 *
 * The MIME-and-size pre-check here is defense-in-depth; the server route
 * enforces both at Phase 1 regardless of what the extension claims.
 *
 * Optional `fetchFn` is the injection seam for node:test.
 */
export async function fetchImageBytes(
  srcUrl: string,
  fetchFn: FetchFn = (u, i) => fetch(u, i),
): Promise<FetchedImageBytes> {
  let res: Response;
  try {
    res = await fetchFn(srcUrl, { method: 'GET' });
  } catch (err) {
    throw mapFetchTransportError(err);
  }
  if (!res.ok) {
    throw new PlosApiError(
      res.status,
      `Could not fetch the image (HTTP ${res.status}). The image's CDN may not be authorized for this extension yet.`,
    );
  }
  const headerType = (res.headers.get('content-type') ?? '')
    .toLowerCase()
    .split(';')[0]
    ?.trim();
  let mimeType: string | null = isAcceptedImageMimeType(headerType)
    ? headerType
    : null;
  if (!mimeType) {
    // Fallback: derive from URL extension.
    const lower = srcUrl.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg'))
      mimeType = 'image/jpeg';
    else if (lower.endsWith('.png')) mimeType = 'image/png';
    else if (lower.endsWith('.webp')) mimeType = 'image/webp';
  }
  if (!mimeType || !isAcceptedImageMimeType(mimeType)) {
    throw new PlosApiError(
      415,
      `Unsupported image type. PLOS accepts ${ACCEPTED_IMAGE_MIME_TYPES.join(', ')}.`,
    );
  }
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > IMAGE_UPLOAD_MAX_BYTES) {
    throw new PlosApiError(
      413,
      `Image is ${bytes.byteLength} bytes — exceeds the 5 MB cap.`,
    );
  }
  return { bytes, mimeType, fileSize: bytes.byteLength };
}
