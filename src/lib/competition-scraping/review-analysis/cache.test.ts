// W#2 P-49 Workstream 5 — node:test cases for the reviewsHash cache.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildHashCanonical, computeReviewsHash, isFresh } from './cache.ts';

test('buildHashCanonical sorts review IDs and appends modelVersion', () => {
  const canonical = buildHashCanonical(
    [{ id: 'c' }, { id: 'a' }, { id: 'b' }],
    'claude-opus-4-7'
  );
  assert.equal(canonical, 'a,b,c|claude-opus-4-7');
});

test('buildHashCanonical is stable across input ordering', () => {
  const a = buildHashCanonical(
    [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }],
    'claude-opus-4-7'
  );
  const b = buildHashCanonical(
    [{ id: 'r3' }, { id: 'r1' }, { id: 'r2' }],
    'claude-opus-4-7'
  );
  assert.equal(a, b);
});

test('buildHashCanonical throws on missing modelVersion', () => {
  assert.throws(
    () => buildHashCanonical([{ id: 'a' }], ''),
    /modelVersion is required/
  );
});

test('buildHashCanonical rejects duplicate review IDs', () => {
  assert.throws(
    () => buildHashCanonical([{ id: 'a' }, { id: 'a' }], 'claude-opus-4-7'),
    /Duplicate review id/
  );
});

test('computeReviewsHash returns a 64-char hex SHA-256', () => {
  const hash = computeReviewsHash([{ id: 'a' }], 'claude-opus-4-7');
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test('computeReviewsHash differs for different models on the same reviews', () => {
  const reviews = [{ id: 'a' }, { id: 'b' }];
  const h7 = computeReviewsHash(reviews, 'claude-opus-4-7');
  const h6 = computeReviewsHash(reviews, 'claude-opus-4-6');
  assert.notEqual(h7, h6);
});

test('computeReviewsHash differs when the review set changes', () => {
  const h1 = computeReviewsHash(
    [{ id: 'a' }, { id: 'b' }],
    'claude-opus-4-7'
  );
  const h2 = computeReviewsHash(
    [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    'claude-opus-4-7'
  );
  assert.notEqual(h1, h2);
});

test('computeReviewsHash handles empty review set', () => {
  // Empty array + modelVersion is still a valid input (analysis with no
  // reviews would produce a trivial summary; hash is deterministic).
  const hash = computeReviewsHash([], 'claude-opus-4-7');
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test('isFresh returns true when hashes match', () => {
  assert.equal(isFresh('abc', 'abc'), true);
});

test('isFresh returns false when hashes differ or cache is null', () => {
  assert.equal(isFresh('abc', 'def'), false);
  assert.equal(isFresh(null, 'abc'), false);
  assert.equal(isFresh(undefined, 'abc'), false);
  assert.equal(isFresh('', 'abc'), false);
});
