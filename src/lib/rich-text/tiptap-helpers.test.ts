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
