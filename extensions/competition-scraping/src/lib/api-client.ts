// API client for PLOS endpoints. Adds Authorization: Bearer <JWT> on every
// request; surfaces structured errors. The smoke test in this first build
// session calls GET /api/projects to prove the auth round-trip works
// against vklf.com.
//
// Future build sessions extend this file with W#2-specific endpoints
// (POST .../urls, POST .../text, the two-phase image upload, etc.) using
// the shared types from src/lib/shared-types/competition-scraping.ts.

import { getAccessToken } from './auth';

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

// Smoke-test endpoint: lists projects accessible to the signed-in user.
// Returns the raw payload so the popup can show "Connected — N projects."
export async function listProjects(): Promise<unknown> {
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
  return res.json();
}
