// Highlight-Terms sync orchestrator. Owns the choreography between the
// server (PLOS DB, authoritative) and the chrome.storage.local cache
// (per-installation mirror, used when offline + read by the content
// script's live-page highlighter).
//
// W#2 P-3 narrowed (2026-05-10). Replaces the prior
// chrome.storage.local-only flow so signing in from any device or
// Chrome profile preserves the configured terms.
//
// Read flow (loadHighlightTerms):
//   1. GET server. On success, mirror to chrome.storage.local + return
//      `{ source: 'server', terms }`.
//   2. If server returns terms = [] AND cache has terms → push cache to
//      server (one-time auto-migration), then mirror in cache (no-op),
//      return `{ source: 'migrated', terms: cache }`.
//   3. On server error (offline, 5xx, network) → return cached terms with
//      `{ source: 'cache-fallback', warning: human-readable message }`.
//   4. On 401 (token expired) → return cached terms with
//      `{ source: 'cache-fallback', warning: 'Sign in again to sync.' }`.
//
// Write flow (saveHighlightTerms):
//   1. PUT server. On success → mirror to chrome.storage.local + return
//      the canonical post-write list.
//   2. On server error → throw the underlying PlosApiError. Caller
//      surfaces it as inline UI; cache is NOT updated (so the next
//      successful sync brings server state back).
//
// The chrome.storage.local mirror keeps `chrome.storage.onChanged`
// listeners — notably the content script's live-page highlight-terms
// module — firing as before. The content script itself never talks to
// the server; it reads the cache mirror.
//
// Dependency-injection: the four I/O functions are injectable so unit
// tests can exercise the orchestration logic without mocking Supabase
// auth + fetch + chrome.storage.local globals. Production callers use
// the default deps (the real api-client + popup-state functions).

import {
  PlosApiError,
  listHighlightTerms,
  replaceHighlightTerms,
} from './api-client.ts';
import {
  getHighlightTerms as getCachedHighlightTerms,
  setHighlightTerms as setCachedHighlightTerms,
} from './popup-state.ts';
import type { HighlightTerm } from './highlight-terms.ts';

export type LoadSource = 'server' | 'migrated' | 'cache-fallback';

export interface LoadResult {
  terms: HighlightTerm[];
  source: LoadSource;
  /**
   * Human-readable warning shown to the user when source === 'cache-fallback'.
   * Empty string for source === 'server' or 'migrated'.
   */
  warning: string;
}

export interface HighlightTermsSyncDeps {
  listFromServer: (projectId: string) => Promise<HighlightTerm[]>;
  replaceOnServer: (
    projectId: string,
    terms: readonly HighlightTerm[],
  ) => Promise<HighlightTerm[]>;
  getCached: (projectId: string) => Promise<HighlightTerm[]>;
  setCached: (
    projectId: string,
    terms: readonly HighlightTerm[],
  ) => Promise<void>;
}

const defaultDeps: HighlightTermsSyncDeps = {
  listFromServer: listHighlightTerms,
  replaceOnServer: replaceHighlightTerms,
  getCached: getCachedHighlightTerms,
  setCached: setCachedHighlightTerms,
};

function offlineWarningFromError(err: unknown): string {
  if (err instanceof PlosApiError) {
    if (err.status === 401) {
      return 'Sign in again to sync your Highlight Terms across devices.';
    }
    if (err.status === 0) {
      return "Couldn't reach PLOS — showing your saved terms from this Chrome.";
    }
    return `Couldn't refresh terms from PLOS (${err.message}). Showing saved terms from this Chrome.`;
  }
  return "Couldn't refresh terms from PLOS. Showing saved terms from this Chrome.";
}

/**
 * Loads the user's Highlight Terms for the given Project.
 * Server is authoritative; cache is fallback.
 */
export async function loadHighlightTerms(
  projectId: string,
  deps: HighlightTermsSyncDeps = defaultDeps,
): Promise<LoadResult> {
  let serverTerms: HighlightTerm[];
  try {
    serverTerms = await deps.listFromServer(projectId);
  } catch (err) {
    const cached = await deps.getCached(projectId);
    return {
      terms: cached,
      source: 'cache-fallback',
      warning: offlineWarningFromError(err),
    };
  }

  // Server returned non-empty → server wins.
  if (serverTerms.length > 0) {
    await deps.setCached(projectId, serverTerms);
    return { terms: serverTerms, source: 'server', warning: '' };
  }

  // Server is empty. If cache has terms, this is the first authenticated
  // load after the P-3-narrowed deploy for a Project that already had
  // terms in chrome.storage.local — push them up so the user doesn't have
  // to re-enter. After this one-time migration the server is the
  // authority on subsequent loads.
  const cached = await deps.getCached(projectId);
  if (cached.length > 0) {
    try {
      const migrated = await deps.replaceOnServer(projectId, cached);
      await deps.setCached(projectId, migrated);
      return { terms: migrated, source: 'migrated', warning: '' };
    } catch (err) {
      // Migration failed — server is empty + cache has terms. Show the
      // cache; next successful load will retry the migration.
      return {
        terms: cached,
        source: 'cache-fallback',
        warning: offlineWarningFromError(err),
      };
    }
  }

  // Both empty — first-time setup; nothing to display.
  return { terms: [], source: 'server', warning: '' };
}

/**
 * Replaces the user's whole Highlight Terms list. Server first, then
 * mirror to cache. Throws on server failure; caller decides how to
 * surface the error (inline UI; do NOT mirror partial state into cache).
 */
export async function saveHighlightTerms(
  projectId: string,
  terms: readonly HighlightTerm[],
  deps: HighlightTermsSyncDeps = defaultDeps,
): Promise<HighlightTerm[]> {
  const canonical = await deps.replaceOnServer(projectId, terms);
  await deps.setCached(projectId, canonical);
  return canonical;
}
