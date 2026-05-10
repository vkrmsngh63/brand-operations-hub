// Extension-state sync orchestrator. Owns the choreography between the
// server (PLOS DB, authoritative) and the chrome.storage.local cache
// (per-installation mirror, used when offline + read by the content
// script's orchestrator on every page load).
//
// W#2 P-3 (broader scope), 2026-05-10-e. Replaces the prior
// chrome.storage.local-only flow for `selectedProjectId` and
// `selectedPlatform` so signing in from any device or Chrome profile
// preserves the user's setup picks.
//
// Read flow (loadExtensionState):
//   1. GET server. On success, mirror to chrome.storage.local + return
//      `{ state, source: 'server', warning: '' }`.
//   2. If server returns both fields null AND cache has values, push the
//      cache up (one-time auto-migration), then mirror the canonical
//      response, return `{ state, source: 'migrated', warning: '' }`.
//   3. On server error (offline, 5xx, network) → return cached state with
//      `{ source: 'cache-fallback', warning: human-readable message }`.
//   4. On 401 (token expired) → return cached state with
//      `{ source: 'cache-fallback', warning: 'Sign in again to sync.' }`.
//
// Write flow (saveExtensionState):
//   1. PUT server. On success → mirror canonical post-invariant state to
//      chrome.storage.local + return the canonical state.
//   2. On server error → throw the underlying PlosApiError. Caller
//      surfaces it as inline UI; cache is NOT updated (so the next
//      successful sync brings server state back).
//
// Note: the server applies the "switching project clears platform"
// invariant on PUT. The response may show selectedPlatform = null when
// the request transitioned between two non-null projects, OR when the
// request set projectId = null. This module always mirrors the server's
// canonical view, so the cache stays consistent with the server. The
// invariant does NOT trigger on the migration case (server empty +
// cache has values), since there's no "switch" — prior projectId is
// null, so the cached pair is preserved.
//
// Dependency-injection: the four I/O functions are injectable so unit
// tests can exercise the orchestration logic without mocking Supabase
// auth + fetch + chrome.storage.local globals. Production callers use
// the default deps (the real api-client + popup-state functions).

import {
  PlosApiError,
  getExtensionState,
  replaceExtensionState,
} from './api-client.ts';
import {
  getExtensionStateCache,
  setExtensionStateCache,
} from './popup-state.ts';
import type { ExtensionStateDto } from '../../../../src/lib/shared-types/competition-scraping.ts';

export type LoadSource = 'server' | 'migrated' | 'cache-fallback';

export interface LoadResult {
  state: ExtensionStateDto;
  source: LoadSource;
  /**
   * Human-readable warning shown to the user when source === 'cache-fallback'.
   * Empty string for source === 'server' or 'migrated'.
   */
  warning: string;
}

export interface ExtensionStateSyncDeps {
  loadFromServer: () => Promise<ExtensionStateDto>;
  saveToServer: (state: ExtensionStateDto) => Promise<ExtensionStateDto>;
  getCached: () => Promise<ExtensionStateDto>;
  setCached: (state: ExtensionStateDto) => Promise<void>;
}

const defaultDeps: ExtensionStateSyncDeps = {
  loadFromServer: getExtensionState,
  saveToServer: replaceExtensionState,
  getCached: getExtensionStateCache,
  setCached: setExtensionStateCache,
};

function offlineWarningFromError(err: unknown): string {
  if (err instanceof PlosApiError) {
    if (err.status === 401) {
      return 'Sign in again to sync your setup picks across devices.';
    }
    if (err.status === 0) {
      return "Couldn't reach PLOS — showing your setup picks from this Chrome.";
    }
    return `Couldn't refresh setup picks from PLOS (${err.message}). Showing picks from this Chrome.`;
  }
  return "Couldn't refresh setup picks from PLOS. Showing picks from this Chrome.";
}

function isEmpty(state: ExtensionStateDto): boolean {
  return state.selectedProjectId === null && state.selectedPlatform === null;
}

/**
 * Loads the user's W#2 extension state.
 * Server is authoritative; cache is fallback.
 */
export async function loadExtensionState(
  deps: ExtensionStateSyncDeps = defaultDeps,
): Promise<LoadResult> {
  let serverState: ExtensionStateDto;
  try {
    serverState = await deps.loadFromServer();
  } catch (err) {
    const cached = await deps.getCached();
    return {
      state: cached,
      source: 'cache-fallback',
      warning: offlineWarningFromError(err),
    };
  }

  // Server returned at least one non-null field → server wins.
  if (!isEmpty(serverState)) {
    await deps.setCached(serverState);
    return { state: serverState, source: 'server', warning: '' };
  }

  // Server is empty. If cache has values, this is the first authenticated
  // load after the P-3-broader deploy for a user who already had picks in
  // chrome.storage.local — push them up so the user doesn't have to
  // re-pick. After this one-time migration the server is the authority on
  // subsequent loads.
  const cached = await deps.getCached();
  if (!isEmpty(cached)) {
    try {
      const migrated = await deps.saveToServer(cached);
      await deps.setCached(migrated);
      return { state: migrated, source: 'migrated', warning: '' };
    } catch (err) {
      // Migration failed — server is empty + cache has values. Show the
      // cache; next successful load will retry the migration.
      return {
        state: cached,
        source: 'cache-fallback',
        warning: offlineWarningFromError(err),
      };
    }
  }

  // Both empty — first-time setup; nothing to display. Make sure the
  // cache reflects the empty server view so a stale cache doesn't linger.
  await deps.setCached(serverState);
  return { state: serverState, source: 'server', warning: '' };
}

/**
 * Replaces the user's W#2 extension state. Server first, then mirror to
 * cache. Throws on server failure; caller decides how to surface the
 * error (inline UI; do NOT mirror partial state into cache).
 *
 * Returns the server's canonical view of the post-write state. The
 * server's "switching project clears platform" invariant may have
 * cleared selectedPlatform even when the request asked to keep it, so
 * callers should treat the response as authoritative.
 */
export async function saveExtensionState(
  state: ExtensionStateDto,
  deps: ExtensionStateSyncDeps = defaultDeps,
): Promise<ExtensionStateDto> {
  const canonical = await deps.saveToServer(state);
  await deps.setCached(canonical);
  return canonical;
}
