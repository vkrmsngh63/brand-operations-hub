// Tests for extension-state-sync.ts — the orchestrator that owns the
// PLOS-server-vs-chrome.storage.local-cache dance for `selectedProjectId`
// and `selectedPlatform`. We exercise:
//   - server returns non-empty → server wins; cache mirrored
//   - server empty + cache empty → both empty; cache rewritten as empty
//   - server empty + cache non-empty → one-time auto-migration
//   - server error (5xx) → cache fallback + warning
//   - 401 → cache fallback + sign-in warning
//   - migration failure → cache stays + warning; cache untouched
//   - save success → server canonical → cache mirror
//   - save failure → throw; cache untouched
//   - server's project-clear-platform invariant: response shows null
//     platform when projectId changed; mirror reflects server view
//
// Approach: dependency-inject fake API + cache via the optional `deps`
// parameter. No need to mock Supabase auth, fetch, or
// chrome.storage.local globals — we test the orchestration logic in
// isolation.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadExtensionState,
  saveExtensionState,
  type ExtensionStateSyncDeps,
} from './extension-state-sync.ts';
import { PlosApiError } from './errors.ts';
import type { ExtensionStateDto } from '../../../../src/lib/shared-types/competition-scraping.ts';

const PROJECT_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PROJECT_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const EMPTY: ExtensionStateDto = {
  selectedProjectId: null,
  selectedPlatform: null,
};

interface FakeState {
  serverState: ExtensionStateDto;
  cacheState: ExtensionStateDto;
  // Toggleable failure modes.
  serverGetError: Error | null;
  serverPutError: Error | null;
  // Call recording.
  calls: {
    load: number;
    save: number;
    getCached: number;
    setCached: number;
  };
  lastSaveArg: ExtensionStateDto | null;
  // Whether the fake server enforces the "switching project clears platform"
  // invariant on its save path. Default: yes (matches production behavior).
  enforceClearInvariant: boolean;
}

let state: FakeState;

function clone(s: ExtensionStateDto): ExtensionStateDto {
  return {
    selectedProjectId: s.selectedProjectId,
    selectedPlatform: s.selectedPlatform,
  };
}

function makeDeps(): ExtensionStateSyncDeps {
  return {
    loadFromServer: async () => {
      state.calls.load += 1;
      if (state.serverGetError) throw state.serverGetError;
      return clone(state.serverState);
    },
    saveToServer: async (incoming) => {
      state.calls.save += 1;
      state.lastSaveArg = clone(incoming);
      if (state.serverPutError) throw state.serverPutError;
      // Apply the server's refined "switching project clears platform"
      // invariant. Mirrors src/app/api/extension-state/route.ts:
      //   - incoming.projectId is null → force platform null
      //   - prior.projectId non-null AND differs from incoming → force null
      //   - else trust the request
      const projectId = incoming.selectedProjectId;
      let platform = incoming.selectedPlatform;
      if (state.enforceClearInvariant) {
        if (projectId === null) {
          platform = null;
        } else if (
          state.serverState.selectedProjectId !== null &&
          state.serverState.selectedProjectId !== projectId
        ) {
          platform = null;
        }
      }
      state.serverState = { selectedProjectId: projectId, selectedPlatform: platform };
      return clone(state.serverState);
    },
    getCached: async () => {
      state.calls.getCached += 1;
      return clone(state.cacheState);
    },
    setCached: async (incoming) => {
      state.calls.setCached += 1;
      state.cacheState = clone(incoming);
    },
  };
}

beforeEach(() => {
  state = {
    serverState: clone(EMPTY),
    cacheState: clone(EMPTY),
    serverGetError: null,
    serverPutError: null,
    calls: { load: 0, save: 0, getCached: 0, setCached: 0 },
    lastSaveArg: null,
    enforceClearInvariant: true,
  };
});

// ─── loadExtensionState ─────────────────────────────────────────────────

describe('loadExtensionState', () => {
  it('server returns non-empty: server wins; cache mirrored', async () => {
    state.serverState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    // Stale cache that should be overwritten.
    state.cacheState = {
      selectedProjectId: PROJECT_B,
      selectedPlatform: 'ebay',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'server');
    assert.equal(result.warning, '');
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    assert.equal(state.calls.load, 1);
    assert.equal(state.calls.setCached, 1);
    assert.equal(state.calls.save, 0);
    // Cache reflects server, not the original stale value.
    assert.deepEqual(state.cacheState, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
  });

  it('server returns one-non-null field: still counts as server-wins', async () => {
    state.serverState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: null,
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'server');
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: null,
    });
    assert.equal(state.calls.save, 0); // no migration attempt
  });

  it('server empty + cache empty: returns empty; cache rewritten as empty', async () => {
    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'server');
    assert.equal(result.warning, '');
    assert.deepEqual(result.state, EMPTY);
    assert.equal(state.calls.save, 0); // no migration
    // Cache is rewritten with the empty server view (defensive).
    assert.equal(state.calls.setCached, 1);
    assert.deepEqual(state.cacheState, EMPTY);
  });

  it('server empty + cache non-empty: one-time auto-migration', async () => {
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'migrated');
    assert.equal(result.warning, '');
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    assert.equal(state.calls.save, 1); // migration save fired
    assert.deepEqual(state.lastSaveArg, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    // Server now has the migrated state.
    assert.deepEqual(state.serverState, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    // Cache mirrored with the canonical post-write state.
    assert.deepEqual(state.cacheState, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
  });

  it('server unreachable (status 0): cache fallback + offline warning', async () => {
    state.serverGetError = new PlosApiError(
      0,
      'Network unreachable — check your connection.',
    );
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'walmart',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Couldn't reach PLOS/);
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'walmart',
    });
    assert.equal(state.calls.setCached, 0); // cache untouched
  });

  it('server 401: cache fallback + sign-in warning', async () => {
    state.serverGetError = new PlosApiError(401, 'Token expired');
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'ebay',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Sign in again/);
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'ebay',
    });
  });

  it('server 5xx: cache fallback with generic warning', async () => {
    state.serverGetError = new PlosApiError(500, 'Internal server error');
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'etsy',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Couldn't refresh setup picks/);
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'etsy',
    });
  });

  it('migration failure: cache fallback; cache untouched', async () => {
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    state.serverPutError = new PlosApiError(0, 'Network unreachable');

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Couldn't reach PLOS/);
    // Cache stays at its original value — migration didn't succeed.
    assert.deepEqual(result.state, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    assert.equal(state.calls.save, 1); // migration was attempted
    // Cache should NOT have been overwritten by a successful mirror.
    assert.deepEqual(state.cacheState, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
  });

  it('non-PlosApiError unknown failure: generic warning', async () => {
    state.serverGetError = new Error('mystery');
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };

    const result = await loadExtensionState(makeDeps());

    assert.equal(result.source, 'cache-fallback');
    assert.match(result.warning, /Couldn't refresh setup picks/);
  });
});

// ─── saveExtensionState ─────────────────────────────────────────────────

describe('saveExtensionState', () => {
  it('save success: server canonical → cache mirror', async () => {
    state.serverState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    state.cacheState = clone(state.serverState);

    const next: ExtensionStateDto = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'ebay',
    };
    const result = await saveExtensionState(next, makeDeps());

    assert.deepEqual(result, next);
    assert.equal(state.calls.save, 1);
    assert.equal(state.calls.setCached, 1);
    assert.deepEqual(state.cacheState, next);
  });

  it('save with project change: server clears platform; mirror reflects null', async () => {
    state.serverState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    state.cacheState = clone(state.serverState);

    // Caller asks to change project + KEEP a platform value. Server
    // enforces the "switching project clears platform" invariant.
    const result = await saveExtensionState(
      {
        selectedProjectId: PROJECT_B,
        selectedPlatform: 'amazon',
      },
      makeDeps(),
    );

    assert.deepEqual(result, {
      selectedProjectId: PROJECT_B,
      selectedPlatform: null,
    });
    // Cache mirrors the canonical post-invariant view.
    assert.deepEqual(state.cacheState, {
      selectedProjectId: PROJECT_B,
      selectedPlatform: null,
    });
  });

  it('save failure: throws; cache untouched', async () => {
    state.cacheState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    state.serverPutError = new PlosApiError(0, 'Network unreachable');

    await assert.rejects(
      saveExtensionState(
        { selectedProjectId: PROJECT_A, selectedPlatform: 'ebay' },
        makeDeps(),
      ),
      /Network unreachable/,
    );
    // Cache stays at its prior value — server save failed.
    assert.deepEqual(state.cacheState, {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    });
    assert.equal(state.calls.setCached, 0);
  });

  it('save with both fields cleared: server records nulls; mirror clears', async () => {
    state.serverState = {
      selectedProjectId: PROJECT_A,
      selectedPlatform: 'amazon',
    };
    state.cacheState = clone(state.serverState);

    const result = await saveExtensionState(EMPTY, makeDeps());

    assert.deepEqual(result, EMPTY);
    assert.deepEqual(state.cacheState, EMPTY);
  });
});
