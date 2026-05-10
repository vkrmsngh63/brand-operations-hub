/**
 * Unit tests for the authFetch wrapper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/authFetch.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * tests in this folder. The wrapper takes its supabase client + fetch
 * implementation as deps so tests can substitute in fakes; production
 * binds against the real singletons (see authFetch.ts bottom).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeAuthFetch } from './authFetch.ts';

/* ── helpers ────────────────────────────────────────────────────── */

interface FakeSupabaseOpts {
  initialAccessToken: string | null;
  refresh: 'success' | 'fail';
  refreshedAccessToken?: string;
}

function makeFakeSupabase(opts: FakeSupabaseOpts) {
  let refreshCalls = 0;
  const supabase = {
    auth: {
      getSession: async () => ({
        data: {
          session: opts.initialAccessToken
            ? { access_token: opts.initialAccessToken }
            : null,
        },
        error: null,
      }),
      refreshSession: async () => {
        refreshCalls++;
        if (opts.refresh === 'success') {
          return {
            data: {
              session: { access_token: opts.refreshedAccessToken ?? 'refreshed-token' },
            },
            error: null,
          };
        }
        return { data: { session: null }, error: { message: 'refresh failed' } };
      },
    },
  } as unknown as Parameters<typeof makeAuthFetch>[0]['supabase'];
  return { supabase, refreshCallCount: () => refreshCalls };
}

interface FakeResponseSpec {
  status: number;
  body?: string;
}

function makeFakeFetch(responses: FakeResponseSpec[]) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  let i = 0;
  const fetchFn = async (url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    const spec = responses[i++] ?? { status: 200, body: '{}' };
    return new Response(spec.body ?? '{}', { status: spec.status });
  };
  return { fetchFn, calls };
}

function getAuthHeader(call: { init?: RequestInit }): string | null {
  const h = call.init?.headers;
  if (!h) return null;
  if (h instanceof Headers) return h.get('Authorization');
  if (Array.isArray(h)) {
    for (const [k, v] of h) {
      if (k.toLowerCase() === 'authorization') return v;
    }
    return null;
  }
  const rec = h as Record<string, string>;
  return rec['Authorization'] ?? rec['authorization'] ?? null;
}

/* ── 1. happy path: 200 response → returns 200; no refresh ────────── */

test('200 response → returns 200; refreshSession never called', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'fail', // shouldn't matter — refresh isn't reached
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 200 }]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const res = await af('/api/projects');

  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(refreshCallCount(), 0);
  assert.equal(getAuthHeader(calls[0]), 'Bearer old-tok');
});

/* ── 2. 401 → refresh succeeds → retry returns 200 → final 200 ────── */

test('401 then refresh succeeds → retry returns 200 → final 200', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'success',
    refreshedAccessToken: 'new-tok',
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 200 }]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const res = await af('/api/projects');

  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(refreshCallCount(), 1);
  assert.equal(getAuthHeader(calls[0]), 'Bearer old-tok');
  assert.equal(getAuthHeader(calls[1]), 'Bearer new-tok');
});

/* ── 3. 401 → refresh succeeds → retry also 401 → final 401 ──────── */

test('401, refresh succeeds, retry also 401 → final 401 (no infinite loop)', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'success',
    refreshedAccessToken: 'new-tok',
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 401 }]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const res = await af('/api/projects');

  assert.equal(res.status, 401);
  assert.equal(calls.length, 2);
  assert.equal(refreshCallCount(), 1); // exactly one refresh, not retried
});

/* ── 4. 401 → refresh fails → final 401 (failure-path option (a)) ─── */

test('401 then refresh fails → returns the original 401 (caller sees existing error)', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'fail',
  });
  const { fetchFn, calls } = makeFakeFetch([
    { status: 401, body: '{"error":"Invalid or expired token"}' },
  ]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const res = await af('/api/projects');

  assert.equal(res.status, 401);
  assert.equal(calls.length, 1); // refresh failed, no retry attempted
  assert.equal(refreshCallCount(), 1);
  const body = await res.text();
  assert.equal(body, '{"error":"Invalid or expired token"}');
});

/* ── 5. 500 response → returns 500; no refresh attempt ───────────── */

test('500 response → returns 500; refreshSession never called', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'success',
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 500 }]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const res = await af('/api/projects');

  assert.equal(res.status, 500);
  assert.equal(calls.length, 1);
  assert.equal(refreshCallCount(), 0);
});

/* ── 6. No session at all → throws "Not authenticated" (existing) ─── */

test('No session → throws "Not authenticated — no active session"', async () => {
  const { supabase, refreshCallCount } = makeFakeSupabase({
    initialAccessToken: null,
    refresh: 'success',
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 200 }]);

  const af = makeAuthFetch({ supabase, fetchFn });

  await assert.rejects(
    () => af('/api/projects'),
    /Not authenticated — no active session/,
  );
  assert.equal(calls.length, 0);
  assert.equal(refreshCallCount(), 0);
});

/* ── 7. POST request body + headers preserved across retry ────────── */

test('POST: body + caller-supplied headers preserved across refresh retry', async () => {
  const { supabase } = makeFakeSupabase({
    initialAccessToken: 'old-tok',
    refresh: 'success',
    refreshedAccessToken: 'new-tok',
  });
  const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 200 }]);

  const af = makeAuthFetch({ supabase, fetchFn });
  const payload = JSON.stringify({ name: 'Test Project' });
  const res = await af('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client': 'plos-web' },
    body: payload,
  });

  assert.equal(res.status, 200);
  assert.equal(calls.length, 2);

  // Method preserved
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(calls[1].init?.method, 'POST');

  // Body preserved on retry
  assert.equal(calls[0].init?.body, payload);
  assert.equal(calls[1].init?.body, payload);

  // Caller-supplied headers preserved on retry; Authorization rewritten
  for (const c of calls) {
    const headers = c.init?.headers as Headers;
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.equal(headers.get('X-Client'), 'plos-web');
  }
  assert.equal(getAuthHeader(calls[0]), 'Bearer old-tok');
  assert.equal(getAuthHeader(calls[1]), 'Bearer new-tok');
});
