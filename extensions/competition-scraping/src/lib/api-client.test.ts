// Unit tests for api-client.ts pure helpers. P-2 polish 2026-05-10:
// covers `mapFetchTransportError` — the small helper that converts native
// `fetch()` transport-layer failures (TypeError 'Failed to fetch') into a
// structured `PlosApiError(0, ...)` with a friendly user-facing message.
//
// P-12 polish 2026-05-13: extends with `makeAuthedFetch` coverage — the
// factory shape mirrors P-1's makeAuthFetch in src/lib/authFetch.ts.
// Tests inject fake supabase + fetchFn so the silent-refresh + 401-retry
// path can be exercised without a real Supabase backend or network.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchImageBytes,
  makeAuthedFetch,
  mapFetchTransportError,
  putImageBytesToSignedUrl,
} from './api-client.ts';
import { PlosApiError } from './errors.ts';
import { IMAGE_UPLOAD_MAX_BYTES } from '../../../../src/lib/shared-types/competition-scraping.ts';

describe('mapFetchTransportError', () => {
  it('converts TypeError → PlosApiError(0, "Network unreachable...")', () => {
    const input = new TypeError('Failed to fetch');
    let caught: unknown = null;
    try {
      mapFetchTransportError(input);
    } catch (err) {
      caught = err;
    }
    // mapFetchTransportError RETURNS the PlosApiError for TypeErrors;
    // it only throws for non-TypeError input. The TypeError path is the
    // happy path of the function — verify the returned shape directly.
    const result = mapFetchTransportError(input);
    assert.ok(result instanceof PlosApiError);
    assert.equal(result.status, 0);
    assert.match(result.message, /network unreachable/i);
    // Belt-and-suspenders: confirm the input call above didn't throw
    // (it shouldn't — TypeError is the conversion path, not the rethrow path).
    assert.equal(caught, null);
  });

  it('handles cross-realm TypeError equivalents (any TypeError subclass)', () => {
    // TypeError itself — no subclass needed; native fetch always throws
    // plain TypeError. This test verifies the `instanceof` check works
    // even when the message body varies (different browsers may produce
    // 'Failed to fetch' vs 'NetworkError when attempting...').
    const variants = [
      new TypeError('Failed to fetch'),
      new TypeError('NetworkError when attempting to fetch resource'),
      new TypeError(''),
    ];
    for (const v of variants) {
      const result = mapFetchTransportError(v);
      assert.ok(result instanceof PlosApiError);
      assert.equal(result.status, 0);
    }
  });

  it('re-throws non-TypeError errors unchanged', () => {
    const original = new Error('something else went wrong');
    let caught: unknown = null;
    try {
      mapFetchTransportError(original);
    } catch (err) {
      caught = err;
    }
    assert.equal(caught, original);
  });

  it('re-throws AbortError unchanged', () => {
    // AbortController-aborted fetches throw a DOMException with name
    // 'AbortError'. We must NOT convert these to PlosApiError(0, ...) —
    // upstream callers may rely on identifying aborts to suppress error UI.
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    let caught: unknown = null;
    try {
      mapFetchTransportError(abortError);
    } catch (err) {
      caught = err;
    }
    assert.equal(caught, abortError);
    assert.ok(caught instanceof DOMException);
    assert.equal((caught as DOMException).name, 'AbortError');
  });

  it('re-throws PlosApiError unchanged (idempotent on already-mapped errors)', () => {
    // Defensive: if upstream code accidentally double-wraps, the inner
    // PlosApiError should pass through (it's not a TypeError).
    const inner = new PlosApiError(500, 'server error');
    let caught: unknown = null;
    try {
      mapFetchTransportError(inner);
    } catch (err) {
      caught = err;
    }
    assert.equal(caught, inner);
  });

  it('re-throws non-Error values unchanged (defensive)', () => {
    // JavaScript permits throwing any value; verify we don't crash on
    // primitives or null.
    const cases: unknown[] = ['a string', 42, null, undefined, { kind: 'odd' }];
    for (const c of cases) {
      let caught: unknown = '__unset__';
      try {
        mapFetchTransportError(c);
      } catch (err) {
        caught = err;
      }
      assert.equal(caught, c);
    }
  });
});

/* ── P-12: makeAuthedFetch silent-refresh + 401-retry tests ────────── */

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
              session: {
                access_token: opts.refreshedAccessToken ?? 'refreshed-token',
              },
            },
            error: null,
          };
        }
        return { data: { session: null }, error: { message: 'refresh failed' } };
      },
    },
  } as unknown as Parameters<typeof makeAuthedFetch>[0]['supabase'];
  return { supabase, refreshCallCount: () => refreshCalls };
}

interface FakeResponseSpec {
  status: number;
  body?: string;
  throwTypeError?: boolean;
}

function makeFakeFetch(responses: FakeResponseSpec[]) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  let i = 0;
  const fetchFn = async (url: string, init?: RequestInit): Promise<Response> => {
    calls.push({ url, init });
    const spec = responses[i++] ?? { status: 200, body: '{}' };
    if (spec.throwTypeError) {
      throw new TypeError('Failed to fetch');
    }
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

describe('makeAuthedFetch (P-12 silent-refresh + 401-retry)', () => {
  it('200 response → returns 200; refreshSession never called', async () => {
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'fail', // shouldn't matter — refresh isn't reached
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 200 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const res = await af('/api/projects');

    assert.equal(res.status, 200);
    assert.equal(calls.length, 1);
    assert.equal(refreshCallCount(), 0);
    assert.equal(getAuthHeader(calls[0]!), 'Bearer old-tok');
  });

  it('401 then refresh succeeds → retry returns 200 → final 200', async () => {
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
      refreshedAccessToken: 'new-tok',
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 200 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const res = await af('/api/projects');

    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);
    assert.equal(refreshCallCount(), 1);
    assert.equal(getAuthHeader(calls[0]!), 'Bearer old-tok');
    assert.equal(getAuthHeader(calls[1]!), 'Bearer new-tok');
  });

  it('401, refresh succeeds, retry also 401 → final 401 (no infinite loop)', async () => {
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
      refreshedAccessToken: 'new-tok',
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 401 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const res = await af('/api/projects');

    assert.equal(res.status, 401);
    assert.equal(calls.length, 2);
    assert.equal(refreshCallCount(), 1); // exactly one refresh, not retried
  });

  it('401 then refresh fails → returns the original 401 (caller sees existing error)', async () => {
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'fail',
    });
    const { fetchFn, calls } = makeFakeFetch([
      { status: 401, body: '{"error":"Invalid or expired token"}' },
    ]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const res = await af('/api/projects');

    assert.equal(res.status, 401);
    assert.equal(calls.length, 1); // refresh failed, no retry attempted
    assert.equal(refreshCallCount(), 1);
    const body = await res.text();
    assert.equal(body, '{"error":"Invalid or expired token"}');
  });

  it('500 response → returns 500; refreshSession never called', async () => {
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 500 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const res = await af('/api/projects');

    assert.equal(res.status, 500);
    assert.equal(calls.length, 1);
    assert.equal(refreshCallCount(), 0);
  });

  it('No session → throws PlosApiError(401, "Not signed in")', async () => {
    // Extension differs from web's makeAuthFetch (which throws plain Error) —
    // existing 76 popup call sites already handle PlosApiError; the no-session
    // pre-fetch check preserves that contract.
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: null,
      refresh: 'success',
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 200 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });

    let caught: unknown = null;
    try {
      await af('/api/projects');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 401);
    assert.match((caught as PlosApiError).message, /not signed in/i);
    assert.equal(calls.length, 0);
    assert.equal(refreshCallCount(), 0);
  });

  it('POST: body + caller-supplied headers preserved across refresh retry', async () => {
    const { supabase } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
      refreshedAccessToken: 'new-tok',
    });
    const { fetchFn, calls } = makeFakeFetch([{ status: 401 }, { status: 200 }]);

    const af = makeAuthedFetch({ supabase, fetchFn });
    const payload = JSON.stringify({ name: 'Test Project' });
    const res = await af('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Client': 'plos-ext' },
      body: payload,
    });

    assert.equal(res.status, 200);
    assert.equal(calls.length, 2);

    // Method preserved
    assert.equal(calls[0]!.init?.method, 'POST');
    assert.equal(calls[1]!.init?.method, 'POST');

    // Body preserved on retry
    assert.equal(calls[0]!.init?.body, payload);
    assert.equal(calls[1]!.init?.body, payload);

    // Caller-supplied headers preserved on retry; Authorization rewritten
    for (const c of calls) {
      const headers = c.init?.headers as Headers;
      assert.equal(headers.get('Content-Type'), 'application/json');
      assert.equal(headers.get('X-Client'), 'plos-ext');
    }
    assert.equal(getAuthHeader(calls[0]!), 'Bearer old-tok');
    assert.equal(getAuthHeader(calls[1]!), 'Bearer new-tok');
  });

  it('TypeError on first attempt → throws PlosApiError(0, "Network unreachable")', async () => {
    // P-2's mapFetchTransportError wrapping must survive the P-12 refactor.
    // Without this test, a future edit could drop the try/catch around the
    // first fetch call and the popup would surface "Failed to fetch" instead
    // of "Network unreachable — check your connection.".
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
    });
    const { fetchFn } = makeFakeFetch([{ status: 0, throwTypeError: true }]);

    const af = makeAuthedFetch({ supabase, fetchFn });

    let caught: unknown = null;
    try {
      await af('/api/projects');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 0);
    assert.match((caught as PlosApiError).message, /network unreachable/i);
    // Refresh wasn't reached — the TypeError fired before status-check.
    assert.equal(refreshCallCount(), 0);
  });

  it('TypeError on retry (after successful refresh) → throws PlosApiError(0)', async () => {
    // Retry path must also wrap with mapFetchTransportError. Failure mode
    // without this: refresh succeeds, retry hits a network-down event, the
    // raw TypeError propagates uncaught.
    const { supabase, refreshCallCount } = makeFakeSupabase({
      initialAccessToken: 'old-tok',
      refresh: 'success',
      refreshedAccessToken: 'new-tok',
    });
    const { fetchFn, calls } = makeFakeFetch([
      { status: 401 },
      { status: 0, throwTypeError: true },
    ]);

    const af = makeAuthedFetch({ supabase, fetchFn });

    let caught: unknown = null;
    try {
      await af('/api/projects');
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 0);
    assert.match((caught as PlosApiError).message, /network unreachable/i);
    assert.equal(calls.length, 2);
    assert.equal(refreshCallCount(), 1);
  });
});

/* ── Session 5: image upload pure-helper tests ──────────────────────── */

function makeImageResponse(opts: {
  status?: number;
  body?: ArrayBuffer;
  contentType?: string;
  throwTypeError?: boolean;
}): (url: string, init?: RequestInit) => Promise<Response> {
  return async () => {
    if (opts.throwTypeError) {
      throw new TypeError('Failed to fetch');
    }
    const headers = new Headers();
    if (opts.contentType) headers.set('Content-Type', opts.contentType);
    return new Response(opts.body ?? new ArrayBuffer(0), {
      status: opts.status ?? 200,
      headers,
    });
  };
}

describe('fetchImageBytes (session 5)', () => {
  it('200 + image/jpeg Content-Type → returns bytes + resolved mimeType + fileSize', async () => {
    const body = new ArrayBuffer(1024);
    const fetchFn = makeImageResponse({
      status: 200,
      body,
      contentType: 'image/jpeg',
    });
    const result = await fetchImageBytes(
      'https://m.media-amazon.com/images/I/abc.jpg',
      fetchFn,
    );
    assert.equal(result.mimeType, 'image/jpeg');
    assert.equal(result.fileSize, 1024);
    assert.equal(result.bytes.byteLength, 1024);
  });

  it('200 + Content-Type missing → falls back to extension-based MIME (image/png)', async () => {
    const fetchFn = makeImageResponse({
      status: 200,
      body: new ArrayBuffer(512),
      contentType: undefined,
    });
    const result = await fetchImageBytes(
      'https://i.ebayimg.com/thumbs/images/g/abc/s-l500.png',
      fetchFn,
    );
    assert.equal(result.mimeType, 'image/png');
    assert.equal(result.fileSize, 512);
  });

  it('200 + Content-Type missing + non-image extension → 415 PlosApiError', async () => {
    const fetchFn = makeImageResponse({
      status: 200,
      body: new ArrayBuffer(100),
      contentType: undefined,
    });
    let caught: unknown = null;
    try {
      await fetchImageBytes(
        'https://i.ebayimg.com/thumbs/images/g/abc/s-l500.gif',
        fetchFn,
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 415);
  });

  it('200 + image/svg+xml Content-Type → 415 PlosApiError (XSS rejection)', async () => {
    const fetchFn = makeImageResponse({
      status: 200,
      body: new ArrayBuffer(100),
      contentType: 'image/svg+xml',
    });
    let caught: unknown = null;
    try {
      await fetchImageBytes('https://example.com/icon.svg', fetchFn);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 415);
  });

  it('404 → PlosApiError with status echoed', async () => {
    const fetchFn = makeImageResponse({ status: 404 });
    let caught: unknown = null;
    try {
      await fetchImageBytes('https://example.com/missing.jpg', fetchFn);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 404);
    assert.match((caught as PlosApiError).message, /CDN may not be authorized/);
  });

  it('TypeError → PlosApiError(0) — CDN unreachable / host_permissions missing', async () => {
    const fetchFn = makeImageResponse({ throwTypeError: true });
    let caught: unknown = null;
    try {
      await fetchImageBytes('https://unknown-cdn.example/x.jpg', fetchFn);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 0);
  });

  it('bytes exceeding 5 MB cap → PlosApiError(413)', async () => {
    const fetchFn = makeImageResponse({
      status: 200,
      body: new ArrayBuffer(IMAGE_UPLOAD_MAX_BYTES + 1),
      contentType: 'image/jpeg',
    });
    let caught: unknown = null;
    try {
      await fetchImageBytes('https://example.com/huge.jpg', fetchFn);
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 413);
  });

  it('Content-Type with charset suffix → strips to bare MIME', async () => {
    // Some CDNs (Etsy historically) send `image/jpeg; charset=binary`.
    const fetchFn = makeImageResponse({
      status: 200,
      body: new ArrayBuffer(100),
      contentType: 'image/jpeg; charset=binary',
    });
    const result = await fetchImageBytes('https://example.com/x.jpg', fetchFn);
    assert.equal(result.mimeType, 'image/jpeg');
  });
});

describe('putImageBytesToSignedUrl (session 5)', () => {
  it('200 response → resolves cleanly', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetchFn = async (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({ url, init });
      return new Response(null, { status: 200 });
    };
    await putImageBytesToSignedUrl(
      'https://x.supabase.co/upload/signed',
      new ArrayBuffer(100),
      'image/jpeg',
      fetchFn,
    );
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.init?.method, 'PUT');
    const h = calls[0]!.init?.headers as Record<string, string>;
    assert.equal(h['Content-Type'], 'image/jpeg');
  });

  it('non-2xx response → PlosApiError with body excerpt', async () => {
    const fetchFn = async (): Promise<Response> =>
      new Response('Object too large', { status: 413 });
    let caught: unknown = null;
    try {
      await putImageBytesToSignedUrl(
        'https://x.supabase.co/upload/signed',
        new ArrayBuffer(100),
        'image/jpeg',
        fetchFn,
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 413);
    assert.match((caught as PlosApiError).message, /Object too large/);
  });

  it('TypeError during fetch → PlosApiError(0)', async () => {
    const fetchFn = async (): Promise<Response> => {
      throw new TypeError('Failed to fetch');
    };
    let caught: unknown = null;
    try {
      await putImageBytesToSignedUrl(
        'https://x.supabase.co/upload/signed',
        new ArrayBuffer(100),
        'image/jpeg',
        fetchFn,
      );
    } catch (err) {
      caught = err;
    }
    assert.ok(caught instanceof PlosApiError);
    assert.equal((caught as PlosApiError).status, 0);
  });
});
