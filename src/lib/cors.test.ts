/**
 * Unit tests for the CORS helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/cors.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files. The helper is testable in isolation because corsHeaders /
 * isAllowedOrigin only inspect the origin string. The withCors / preflight
 * factories that touch NextRequest / NextResponse are exercised at compile
 * time via tsc + at runtime via the actual route handlers.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedOrigin, corsHeaders } from './cors.ts';

/* ── isAllowedOrigin ────────────────────────────────────────────────── */

test('isAllowedOrigin: chrome-extension://abc → true', () => {
  assert.equal(isAllowedOrigin('chrome-extension://abcdefg'), true);
});

test('isAllowedOrigin: chrome-extension:// (empty id) → true (permissive)', () => {
  // §11.2 says allow `chrome-extension://*`; we don't validate the ID
  // shape here. The JWT is the security boundary.
  assert.equal(isAllowedOrigin('chrome-extension://'), true);
});

test('isAllowedOrigin: https://vklf.com → false (web app uses same-origin)', () => {
  assert.equal(isAllowedOrigin('https://vklf.com'), false);
});

test('isAllowedOrigin: http://localhost:3000 → false', () => {
  assert.equal(isAllowedOrigin('http://localhost:3000'), false);
});

test('isAllowedOrigin: null → false', () => {
  assert.equal(isAllowedOrigin(null), false);
});

test('isAllowedOrigin: empty string → false', () => {
  assert.equal(isAllowedOrigin(''), false);
});

test('isAllowedOrigin: chrome-extension prefix without :// → false', () => {
  assert.equal(isAllowedOrigin('chrome-extensionXYZ'), false);
});

/* ── corsHeaders ──────────────────────────────────────────────────────── */

test('corsHeaders: chrome-extension origin → full header set', () => {
  const headers = corsHeaders('chrome-extension://abc');
  assert.equal(headers['Access-Control-Allow-Origin'], 'chrome-extension://abc');
  assert.equal(
    headers['Access-Control-Allow-Methods'],
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  assert.equal(
    headers['Access-Control-Allow-Headers'],
    'Content-Type, Authorization'
  );
  assert.equal(headers['Access-Control-Max-Age'], '86400');
  assert.equal(headers['Vary'], 'Origin');
});

test('corsHeaders: web origin → empty object (no CORS for same-origin)', () => {
  const headers = corsHeaders('https://vklf.com');
  assert.deepEqual(headers, {});
});

test('corsHeaders: null origin → empty object', () => {
  const headers = corsHeaders(null);
  assert.deepEqual(headers, {});
});

test('corsHeaders: echoes the requesting extension origin verbatim', () => {
  // Each extension installation has a different ID; we echo whichever one
  // requested rather than wildcarding (since `Authorization` requires a
  // specific origin, not `*`).
  const headers = corsHeaders('chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(
    headers['Access-Control-Allow-Origin'],
    'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  );
});
