// Unit tests for api-client.ts pure helpers. P-2 polish 2026-05-10:
// covers `mapFetchTransportError` — the small helper that converts native
// `fetch()` transport-layer failures (TypeError 'Failed to fetch') into a
// structured `PlosApiError(0, ...)` with a friendly user-facing message.
//
// We exercise the helper in isolation rather than mocking global `fetch`
// + auth chain. The wrapping inside `authedFetch` is a one-liner; this
// test covers the load-bearing conversion logic.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapFetchTransportError } from './api-client.ts';
import { PlosApiError } from './errors.ts';

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
