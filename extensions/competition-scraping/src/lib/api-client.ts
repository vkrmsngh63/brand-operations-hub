// API client for PLOS endpoints. Adds Authorization: Bearer <JWT> on every
// request; surfaces structured errors.
//
// Future build sessions extend this file with W#2-specific endpoints
// (POST .../urls, POST .../text, the two-phase image upload, etc.) using
// the shared types from src/lib/shared-types/competition-scraping.ts.

import { getAccessToken } from './auth.ts';

const PLOS_API_BASE_URL = 'https://vklf.com';

export interface ApiError {
  status: number;
  message: string;
}

export class PlosApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'PlosApiError';
  }
}

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
