// Tests for highlight-terms-sync.ts — the orchestrator that owns the
// PLOS-server-vs-chrome.storage.local-cache dance. We exercise:
//   - server returns non-empty → server wins; cache mirrored
//   - server empty + cache empty → both empty
//   - server empty + cache non-empty → one-time auto-migration
//   - server error (5xx) → cache fallback + warning
//   - 401 → cache fallback + sign-in warning
//   - migration failure → cache stays + warning; cache untouched
//   - save success → server canonical → cache mirror
//   - save failure → throw; cache untouched
//
// Approach: dependency-inject fake API + cache via the optional `deps`
// parameter. No need to mock Supabase auth, fetch, or
// chrome.storage.local globals — we test the orchestration logic in
// isolation.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadHighlightTerms,
  saveHighlightTerms,
  type HighlightTermsSyncDeps,
} from './highlight-terms-sync.ts';
import { PlosApiError } from './errors.ts';
import type { HighlightTerm } from './highlight-terms.ts';

const PROJECT_ID = '11111111-1111-1111-1111-111111111111';

const TERM_A: HighlightTerm = { term: 'alpha', color: '#ff0000' };
const TERM_B: HighlightTerm = { term: 'beta', color: '#00ff00' };

interface FakeState {
  serverTerms: HighlightTerm[];
  cacheTerms: HighlightTerm[];
  // Toggleable failure modes.
  serverGetError: Error | null;
  serverPutError: Error | null;
  // Call recording.
  calls: {
    list: number;
    replace: number;
    getCached: number;
    setCached: number;
  };
  lastReplaceArg: HighlightTerm[] | null;
}

let state: FakeState;

function makeDeps(): HighlightTermsSyncDeps {
  return {
    listFromServer: async () => {
      state.calls.list += 1;
      if (state.serverGetError) throw state.serverGetError;
      return state.serverTerms.slice();
    },
    replaceOnServer: async (_pid, terms) => {
      state.calls.replace += 1;
      state.lastReplaceArg = terms.slice();
      if (state.serverPutError) throw state.serverPutError;
      // Server stores + returns canonical.
      state.serverTerms = terms.map((t) => ({ term: t.term, color: t.color }));
      return state.serverTerms.slice();
    },
    getCached: async () => {
      state.calls.getCached += 1;
      return state.cacheTerms.slice();
    },
    setCached: async (_pid, terms) => {
      state.calls.setCached += 1;
      state.cacheTerms = terms.map((t) => ({
        term: t.term,
        color: t.color,
      }));
    },
  };
}

beforeEach(() => {
  state = {
    serverTerms: [],
    cacheTerms: [],
    serverGetError: null,
    serverPutError: null,
    calls: { list: 0, replace: 0, getCached: 0, setCached: 0 },
    lastReplaceArg: null,
  };
});

// ─── loadHighlightTerms ─────────────────────────────────────────────────

describe('loadHighlightTerms', () => {
  it('server returns non-empty: server wins; cache mirrored', async () => {
    state.serverTerms = [TERM_A, TERM_B];
    state.cacheTerms = [TERM_A]; // stale cache

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'server');
    assert.equal(result.warning, '');
    assert.deepEqual(result.terms, [TERM_A, TERM_B]);
    assert.deepEqual(state.cacheTerms, [TERM_A, TERM_B]);
    assert.equal(state.calls.list, 1);
    assert.equal(state.calls.replace, 0);
    assert.equal(state.calls.setCached, 1);
  });

  it('server empty + cache empty: both empty; no migration', async () => {
    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'server');
    assert.equal(result.warning, '');
    assert.deepEqual(result.terms, []);
    assert.deepEqual(state.cacheTerms, []);
    assert.equal(state.calls.list, 1);
    assert.equal(state.calls.replace, 0);
  });

  it('server empty + cache non-empty: one-time auto-migration via replace', async () => {
    state.cacheTerms = [TERM_A, TERM_B];

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'migrated');
    assert.equal(result.warning, '');
    assert.deepEqual(result.terms, [TERM_A, TERM_B]);
    assert.deepEqual(state.serverTerms, [TERM_A, TERM_B]);
    assert.deepEqual(state.cacheTerms, [TERM_A, TERM_B]);
    assert.equal(state.calls.list, 1);
    assert.equal(state.calls.replace, 1);
    assert.deepEqual(state.lastReplaceArg, [TERM_A, TERM_B]);
  });

  it('server error (5xx): cache fallback + warning', async () => {
    state.serverGetError = new PlosApiError(500, 'Database is on fire');
    state.cacheTerms = [TERM_A];

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Database is on fire|saved terms/i);
    assert.deepEqual(result.terms, [TERM_A]);
    assert.deepEqual(state.cacheTerms, [TERM_A]);
    assert.equal(state.calls.list, 1);
    assert.equal(state.calls.replace, 0);
    assert.equal(state.calls.setCached, 0);
  });

  it('401 from server: cache fallback + sign-in warning', async () => {
    state.serverGetError = new PlosApiError(401, 'Invalid or expired token');
    state.cacheTerms = [TERM_A];

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Sign in again/);
    assert.deepEqual(result.terms, [TERM_A]);
  });

  it('network error (status 0): cache fallback + offline warning', async () => {
    state.serverGetError = new PlosApiError(0, 'Background unavailable');
    state.cacheTerms = [TERM_A];

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /reach PLOS|saved terms/i);
  });

  it('non-PlosApiError thrown: cache fallback + generic warning', async () => {
    state.serverGetError = new TypeError('Failed to fetch');
    state.cacheTerms = [TERM_A];

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /saved terms/i);
  });

  it('migration failure: cache stays + warning; cache untouched', async () => {
    state.cacheTerms = [TERM_A];
    state.serverPutError = new PlosApiError(500, 'PUT failed');

    const result = await loadHighlightTerms(PROJECT_ID, makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /PUT failed|saved terms/i);
    assert.deepEqual(result.terms, [TERM_A]);
    // Cache must NOT be wiped by failed migration.
    assert.deepEqual(state.cacheTerms, [TERM_A]);
    // Server stays empty.
    assert.deepEqual(state.serverTerms, []);
  });

  it('cache mirror is a structural copy, not a shared reference', async () => {
    state.serverTerms = [TERM_A, TERM_B];
    state.cacheTerms = [];

    await loadHighlightTerms(PROJECT_ID, makeDeps());

    // After load, server terms and cache terms should be equal but
    // structurally independent. Mutating one through the recorded
    // arrays should not bleed into the other.
    assert.deepEqual(state.cacheTerms, state.serverTerms);
    assert.notEqual(state.cacheTerms, state.serverTerms);
    const cachedFirst = state.cacheTerms[0];
    const serverFirst = state.serverTerms[0];
    assert.ok(cachedFirst);
    assert.ok(serverFirst);
    assert.notEqual(cachedFirst, serverFirst);
  });
});

// ─── saveHighlightTerms ─────────────────────────────────────────────────

describe('saveHighlightTerms', () => {
  it('PUT success: returns server canonical; mirrors cache', async () => {
    const result = await saveHighlightTerms(
      PROJECT_ID,
      [TERM_A, TERM_B],
      makeDeps(),
    );

    assert.deepEqual(result, [TERM_A, TERM_B]);
    assert.deepEqual(state.serverTerms, [TERM_A, TERM_B]);
    assert.deepEqual(state.cacheTerms, [TERM_A, TERM_B]);
    assert.equal(state.calls.replace, 1);
    assert.equal(state.calls.setCached, 1);
  });

  it('PUT failure: throws; cache untouched', async () => {
    state.cacheTerms = [TERM_A];
    state.serverPutError = new PlosApiError(500, 'oops');

    await assert.rejects(
      () => saveHighlightTerms(PROJECT_ID, [TERM_A, TERM_B], makeDeps()),
      /oops/,
    );
    // Cache stays at the prior state.
    assert.deepEqual(state.cacheTerms, [TERM_A]);
    // setCached was never called.
    assert.equal(state.calls.setCached, 0);
  });

  it('empty list save: PUT with empty array; cache mirrors empty', async () => {
    state.cacheTerms = [TERM_A];
    state.serverTerms = [TERM_A];

    const result = await saveHighlightTerms(PROJECT_ID, [], makeDeps());

    assert.deepEqual(result, []);
    assert.deepEqual(state.cacheTerms, []);
    assert.deepEqual(state.serverTerms, []);
    assert.deepEqual(state.lastReplaceArg, []);
  });

  it('throws original PlosApiError (not wrapped)', async () => {
    const original = new PlosApiError(503, 'Service unavailable');
    state.serverPutError = original;

    await assert.rejects(
      async () => saveHighlightTerms(PROJECT_ID, [TERM_A], makeDeps()),
      (err: unknown) => {
        assert.ok(err instanceof PlosApiError);
        assert.equal((err as PlosApiError).status, 503);
        return true;
      },
    );
  });
});
