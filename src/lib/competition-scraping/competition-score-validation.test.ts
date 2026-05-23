// node:test cases for extractCompetitionScorePatch — the trust-boundary
// helper for the competitionScore field added in P-46 Workstream 3 Session 2
// per docs/COMPETITION_DATA_V2_DESIGN.md §A.7.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractCompetitionScorePatch } from './competition-score-validation.ts';

test('empty body — no competitionScore key → empty patch', () => {
  const result = extractCompetitionScorePatch({});
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('null body → empty patch (defensive)', () => {
  const result = extractCompetitionScorePatch(null);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('non-object body → empty patch (defensive)', () => {
  const result = extractCompetitionScorePatch('not-an-object');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('competitionScore — explicit null clears the column', () => {
  const result = extractCompetitionScorePatch({ competitionScore: null });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { competitionScore: null });
  }
});

test('competitionScore — integer in range (1) forwarded', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 1 });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { competitionScore: 1 });
  }
});

test('competitionScore — integer in range (50) forwarded', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 50 });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { competitionScore: 50 });
  }
});

test('competitionScore — integer in range (100) forwarded', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 100 });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { competitionScore: 100 });
  }
});

test('competitionScore — 0 rejected (below min)', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 0 });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /between 1 and 100/);
  }
});

test('competitionScore — 101 rejected (above max)', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 101 });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /between 1 and 100/);
  }
});

test('competitionScore — negative rejected', () => {
  const result = extractCompetitionScorePatch({ competitionScore: -5 });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /between 1 and 100/);
  }
});

test('competitionScore — decimal rejected (must be integer)', () => {
  const result = extractCompetitionScorePatch({ competitionScore: 50.5 });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /whole number/);
  }
});

test('competitionScore — string rejected', () => {
  const result = extractCompetitionScorePatch({ competitionScore: '50' });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('competitionScore — NaN rejected', () => {
  const result = extractCompetitionScorePatch({ competitionScore: Number.NaN });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('competitionScore — Infinity rejected', () => {
  const result = extractCompetitionScorePatch({
    competitionScore: Number.POSITIVE_INFINITY,
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('competitionScore — boolean rejected', () => {
  const result = extractCompetitionScorePatch({ competitionScore: true });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('competitionScore — array rejected', () => {
  const result = extractCompetitionScorePatch({ competitionScore: [50] });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('competitionScore — explicit undefined treated like absent key', () => {
  // `'competitionScore' in {competitionScore: undefined}` is true, so this
  // hits the `value === null` path? Actually undefined !== null, so it goes
  // through the typeof check. undefined is not 'number', so this errors.
  // This documents the explicit-undefined behavior — callers should omit
  // the key rather than pass undefined.
  const result = extractCompetitionScorePatch({ competitionScore: undefined });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /integer between 1 and 100/);
  }
});

test('unknown keys alongside competitionScore are ignored', () => {
  const result = extractCompetitionScorePatch({
    competitionScore: 75,
    productName: 'X',
    description1: 'Y',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    // Only the competitionScore key surfaces; the helper doesn't touch other
    // fields (the route's allowlist handles those via sibling helpers).
    assert.deepEqual(result.patch, { competitionScore: 75 });
  }
});
