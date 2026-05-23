// Unit tests for the TipTap rich-text helpers introduced by P-46 Workstream 2.
//
// Run with:
//   node --test --experimental-strip-types src/lib/rich-text/tiptap-helpers.test.ts
//
// Same `node:test` + `node:assert/strict` pattern as the other pure-helper
// tests in src/lib/. Helpers are deliberately free of @tiptap/* imports so
// this file loads in plain Node without resolving any browser-only modules.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EMPTY_TIPTAP_DOC,
  isEmptyTipTapDoc,
  normalizeTipTapInput,
  isValidAnalysisPayload,
  isValidOverallAnalysesBag,
} from './tiptap-helpers.ts';

/* ── isEmptyTipTapDoc ──────────────────────────────────────────────── */

test('isEmptyTipTapDoc: schema-default empty object {} → true', () => {
  assert.equal(isEmptyTipTapDoc({}), true);
});

test('isEmptyTipTapDoc: null → true', () => {
  assert.equal(isEmptyTipTapDoc(null), true);
});

test('isEmptyTipTapDoc: undefined → true', () => {
  assert.equal(isEmptyTipTapDoc(undefined), true);
});

test('isEmptyTipTapDoc: doc with one empty paragraph → true', () => {
  assert.equal(
    isEmptyTipTapDoc({ type: 'doc', content: [{ type: 'paragraph' }] }),
    true
  );
});

test('isEmptyTipTapDoc: doc with one paragraph holding text → false', () => {
  assert.equal(
    isEmptyTipTapDoc({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'hello' }],
        },
      ],
    }),
    false
  );
});

test('isEmptyTipTapDoc: doc with two paragraphs → false', () => {
  assert.equal(
    isEmptyTipTapDoc({
      type: 'doc',
      content: [{ type: 'paragraph' }, { type: 'paragraph' }],
    }),
    false
  );
});

test('isEmptyTipTapDoc: non-object primitive → false', () => {
  assert.equal(isEmptyTipTapDoc('hello'), false);
  assert.equal(isEmptyTipTapDoc(42), false);
  assert.equal(isEmptyTipTapDoc(true), false);
});

/* ── normalizeTipTapInput ──────────────────────────────────────────── */

test('normalizeTipTapInput: {} → EMPTY_TIPTAP_DOC', () => {
  const result = normalizeTipTapInput({});
  assert.deepEqual(result, EMPTY_TIPTAP_DOC);
});

test('normalizeTipTapInput: null → EMPTY_TIPTAP_DOC', () => {
  const result = normalizeTipTapInput(null);
  assert.deepEqual(result, EMPTY_TIPTAP_DOC);
});

test('normalizeTipTapInput: valid doc → unchanged', () => {
  const input = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'hello' }],
      },
    ],
  };
  const result = normalizeTipTapInput(input);
  // Same reference (no defensive clone — the editor mutates internally).
  assert.equal(result, input);
});

test('normalizeTipTapInput: malformed (not a doc) → EMPTY_TIPTAP_DOC', () => {
  const result = normalizeTipTapInput({ type: 'paragraph', content: [] });
  assert.deepEqual(result, EMPTY_TIPTAP_DOC);
});

test('normalizeTipTapInput: array input → EMPTY_TIPTAP_DOC', () => {
  const result = normalizeTipTapInput([1, 2, 3]);
  assert.deepEqual(result, EMPTY_TIPTAP_DOC);
});

/* ── isValidAnalysisPayload (route trust-boundary guard) ───────────── */

test('isValidAnalysisPayload: empty object → true', () => {
  assert.equal(isValidAnalysisPayload({}), true);
});

test('isValidAnalysisPayload: valid doc object → true', () => {
  assert.equal(
    isValidAnalysisPayload({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    }),
    true
  );
});

test('isValidAnalysisPayload: null → false', () => {
  assert.equal(isValidAnalysisPayload(null), false);
});

test('isValidAnalysisPayload: undefined → false', () => {
  assert.equal(isValidAnalysisPayload(undefined), false);
});

test('isValidAnalysisPayload: array → false', () => {
  assert.equal(isValidAnalysisPayload([{ type: 'paragraph' }]), false);
});

test('isValidAnalysisPayload: string → false', () => {
  assert.equal(isValidAnalysisPayload('hello'), false);
});

test('isValidAnalysisPayload: number → false', () => {
  assert.equal(isValidAnalysisPayload(42), false);
});

test('isValidAnalysisPayload: boolean → false', () => {
  assert.equal(isValidAnalysisPayload(true), false);
});

/* ── isValidAnalysisPayload — extended edge cases (Session 2 2026-05-25) ──
   The two new PATCH routes (images/[imageId] + videos/[videoId]) share the
   same trust-boundary guard as Session 1's text/[textId] route. These cases
   pin down the guard's exact contract at the boundary so a regression here
   would surface as a clear test failure rather than a misshapen JSON column
   write that the renderer would later choke on. */

test('isValidAnalysisPayload: nested object (object holding object) → true', () => {
  // TipTap doc JSON nests {type, content: [...]} arbitrarily deep — the
  // guard's job is shape-level not deep-validity, so any plain object passes.
  assert.equal(
    isValidAnalysisPayload({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'hello', marks: [{ type: 'bold' }] }],
        },
      ],
    }),
    true
  );
});

test('isValidAnalysisPayload: plain object with arbitrary keys → true', () => {
  // The guard is intentionally NOT a TipTap schema validator — opaque JSON
  // is fine since the editor itself validates at render time. A future
  // schema change that adds keys must not break the trust-boundary check.
  assert.equal(
    isValidAnalysisPayload({ foo: 'bar', baz: 42, qux: { nested: true } }),
    true
  );
});

test('isValidAnalysisPayload: function → false', () => {
  // typeof function !== 'object' — functions are not serializable to JSON
  // and would crash the Prisma Json column writer. The guard rejects.
  assert.equal(
    isValidAnalysisPayload(() => 'oops'),
    false
  );
});

test('isValidAnalysisPayload: Object.create(null) (no prototype) → true', () => {
  // Plain bag without Object.prototype — still a non-array non-null object;
  // JSON.stringify handles it identically. The guard accepts.
  const bag = Object.create(null) as Record<string, unknown>;
  bag.type = 'doc';
  bag.content = [];
  assert.equal(isValidAnalysisPayload(bag), true);
});

test('isValidAnalysisPayload: TipTap doc with empty content array → true', () => {
  // {type:'doc', content:[]} is a legal TipTap shape distinct from the
  // canonical EMPTY_TIPTAP_DOC (which has one empty paragraph). Both pass
  // the trust-boundary guard since both are non-array objects.
  assert.equal(isValidAnalysisPayload({ type: 'doc', content: [] }), true);
});

test('isValidAnalysisPayload: bigint → false', () => {
  // BigInt is a primitive (typeof === 'bigint'), and JSON.stringify throws
  // on bigint values — rejecting at the boundary keeps the failure mode
  // predictable (400 from the route, not a 500 mid-write).
  assert.equal(isValidAnalysisPayload(BigInt(123)), false);
});

/* ── isValidOverallAnalysesBag ─────────────────────────────────────── */
// Trust-boundary guard for the urls/[urlId] PATCH route's `overallAnalyses`
// field. Strict shape: rejects non-objects / null / arrays; accepts only
// the four known categories (text / image / video / reviews) as keys;
// each value must pass isValidAnalysisPayload.

test('isValidOverallAnalysesBag: empty bag {} → true', () => {
  // The wire shape declares every category optional, so an empty bag is a
  // legal initial state (and the schema default for the column).
  assert.equal(isValidOverallAnalysesBag({}), true);
});

test('isValidOverallAnalysesBag: bag with one known category + valid doc → true', () => {
  assert.equal(
    isValidOverallAnalysesBag({
      text: { type: 'doc', content: [{ type: 'paragraph' }] },
    }),
    true
  );
});

test('isValidOverallAnalysesBag: bag with all four categories → true', () => {
  const doc = { type: 'doc', content: [] };
  assert.equal(
    isValidOverallAnalysesBag({
      text: doc,
      image: doc,
      video: doc,
      reviews: doc,
    }),
    true
  );
});

test('isValidOverallAnalysesBag: null → false', () => {
  assert.equal(isValidOverallAnalysesBag(null), false);
});

test('isValidOverallAnalysesBag: array → false', () => {
  // Arrays are typeof 'object' but reject explicitly to catch a wire
  // shape that flips from object to array (e.g., a client passing a list
  // of docs instead of a keyed bag).
  assert.equal(isValidOverallAnalysesBag([]), false);
});

test('isValidOverallAnalysesBag: primitive → false', () => {
  assert.equal(isValidOverallAnalysesBag('text'), false);
  assert.equal(isValidOverallAnalysesBag(42), false);
  assert.equal(isValidOverallAnalysesBag(true), false);
});

test('isValidOverallAnalysesBag: bag with unknown key → false', () => {
  // Strict shape: catches typos like `txet` instead of `text` at the
  // trust boundary so the misnamed key doesn't silently survive the
  // route's merge step + sit forever in the Json column.
  assert.equal(
    isValidOverallAnalysesBag({
      txet: { type: 'doc', content: [] },
    }),
    false
  );
});

test('isValidOverallAnalysesBag: bag with known key + null value → false', () => {
  // Each category value must itself pass isValidAnalysisPayload — null is
  // rejected there, so it's rejected here too. Prevents accidentally
  // wiping a category by sending `null` instead of an empty doc.
  assert.equal(
    isValidOverallAnalysesBag({ text: null }),
    false
  );
});

test('isValidOverallAnalysesBag: bag with known key + array value → false', () => {
  assert.equal(
    isValidOverallAnalysesBag({ text: [] }),
    false
  );
});

test('isValidOverallAnalysesBag: bag with known key + primitive value → false', () => {
  assert.equal(
    isValidOverallAnalysesBag({ text: 'just a string' }),
    false
  );
});
