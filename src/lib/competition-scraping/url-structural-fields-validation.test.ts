// node:test cases for extractUrlStructuralFieldsPatch — the trust-boundary
// helper for the 5 new URL-level structural fields added in P-46 Workstream
// 2 Session 5 (2026-05-23-b) per docs/COMPETITION_DATA_V2_DESIGN.md §C.2.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractUrlStructuralFieldsPatch } from './url-structural-fields-validation.ts';

test('empty body — no structural keys → empty patch', () => {
  const result = extractUrlStructuralFieldsPatch({});
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('null body → empty patch (defensive)', () => {
  const result = extractUrlStructuralFieldsPatch(null);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('non-object body → empty patch (defensive)', () => {
  const result = extractUrlStructuralFieldsPatch('not-an-object');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {});
  }
});

test('type — non-empty string trimmed and forwarded', () => {
  const result = extractUrlStructuralFieldsPatch({ type: '  Widget  ' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: 'Widget' });
  }
});

test('type — empty string after trim coerces to null', () => {
  const result = extractUrlStructuralFieldsPatch({ type: '   ' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: null });
  }
});

test('type — empty string coerces to null', () => {
  const result = extractUrlStructuralFieldsPatch({ type: '' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: null });
  }
});

test('type — non-string value coerces to null (no 400)', () => {
  const result = extractUrlStructuralFieldsPatch({ type: 42 });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: null });
  }
});

test('type — explicit null clears the column', () => {
  const result = extractUrlStructuralFieldsPatch({ type: null });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: null });
  }
});

test('description1 — multiline text trimmed and forwarded', () => {
  const result = extractUrlStructuralFieldsPatch({
    description1: '  Line one\nLine two  ',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { description1: 'Line one\nLine two' });
  }
});

test('description2 — independent of description1; both can be set', () => {
  const result = extractUrlStructuralFieldsPatch({
    description1: 'first',
    description2: 'second',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {
      description1: 'first',
      description2: 'second',
    });
  }
});

test('price — free-text shape preserved (per §A.11)', () => {
  // §A.11 keeps price as free-text since real values look like
  // "$24.99" / "From $24" / "Free w/ Prime". No Decimal coercion in v1.
  const result = extractUrlStructuralFieldsPatch({ price: '$24.99' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { price: '$24.99' });
  }
});

test('price — non-numeric free-text preserved', () => {
  const result = extractUrlStructuralFieldsPatch({ price: 'Free w/ Prime' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { price: 'Free w/ Prime' });
  }
});

test('scrapingStatus — INCOMPLETE accepted', () => {
  const result = extractUrlStructuralFieldsPatch({
    scrapingStatus: 'INCOMPLETE',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { scrapingStatus: 'INCOMPLETE' });
  }
});

test('scrapingStatus — COMPLETE accepted', () => {
  const result = extractUrlStructuralFieldsPatch({
    scrapingStatus: 'COMPLETE',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { scrapingStatus: 'COMPLETE' });
  }
});

test('scrapingStatus — unknown value 400-rejected', () => {
  const result = extractUrlStructuralFieldsPatch({
    scrapingStatus: 'DONE',
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /INCOMPLETE.*COMPLETE/);
  }
});

test('scrapingStatus — lowercase rejected (enum is case-sensitive)', () => {
  const result = extractUrlStructuralFieldsPatch({
    scrapingStatus: 'incomplete',
  });
  assert.equal(result.ok, false);
});

test('scrapingStatus — null rejected (no clear-back-to-default semantics)', () => {
  const result = extractUrlStructuralFieldsPatch({ scrapingStatus: null });
  assert.equal(result.ok, false);
});

test('scrapingStatus — non-string rejected', () => {
  const result = extractUrlStructuralFieldsPatch({ scrapingStatus: 1 });
  assert.equal(result.ok, false);
});

test('all 5 fields set in one patch', () => {
  const result = extractUrlStructuralFieldsPatch({
    type: 'Widget',
    description1: 'Primary description',
    description2: 'Secondary description',
    price: '$24.99',
    scrapingStatus: 'COMPLETE',
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, {
      type: 'Widget',
      description1: 'Primary description',
      description2: 'Secondary description',
      price: '$24.99',
      scrapingStatus: 'COMPLETE',
    });
  }
});

test('unknown keys are ignored — only the 5 structural fields are read', () => {
  // Sibling PATCH fields (productName / brandName / overallCompetitorAnalysis
  // / etc.) are handled elsewhere in the route. The helper must NOT leak
  // them into the returned patch — otherwise the route's spread would
  // double-apply them.
  const result = extractUrlStructuralFieldsPatch({
    type: 'A',
    productName: 'B',
    overallCompetitorAnalysis: { foo: 'bar' },
    nonsenseField: { whatever: true },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.patch, { type: 'A' });
  }
});

test('omitted vs. explicit-null — omitted leaves field untouched, null clears', () => {
  // Discriminating "omit the key" from "set the key to null" matters at
  // the route level because the Prisma update only touches fields present
  // on `data`. Omitted keys never reach the patch (the column stays
  // unchanged); explicit-null sends NULL (the column is cleared).
  const omittedResult = extractUrlStructuralFieldsPatch({
    description1: 'kept',
  });
  assert.equal(omittedResult.ok, true);
  if (omittedResult.ok) {
    assert.ok(!('description2' in omittedResult.patch));
    assert.equal(omittedResult.patch.description1, 'kept');
  }

  const explicitNullResult = extractUrlStructuralFieldsPatch({
    description1: 'kept',
    description2: null,
  });
  assert.equal(explicitNullResult.ok, true);
  if (explicitNullResult.ok) {
    assert.ok('description2' in explicitNullResult.patch);
    assert.equal(explicitNullResult.patch.description2, null);
  }
});

test('scrapingStatus short-circuit returns BEFORE any other field is applied', () => {
  // An invalid scrapingStatus aborts the whole patch — the route returns
  // 400 and applies nothing. Validates that the error result doesn't
  // accidentally leak partial structural field changes.
  const result = extractUrlStructuralFieldsPatch({
    type: 'attempted',
    scrapingStatus: 'INVALID_ENUM',
  });
  assert.equal(result.ok, false);
});
