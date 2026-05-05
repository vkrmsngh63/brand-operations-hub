/**
 * Unit tests for the projectNameMatches helper used by ResetConfirmDialog.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/workflow-components/reset-confirm-dialog.test.ts
 *
 * The match logic is what gates the destructive reset action; tests pin
 * the strict-match semantics so a future refactor doesn't accidentally
 * loosen them (e.g., trim whitespace, ignore case).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { projectNameMatches } from './reset-confirm-helpers.ts';

test('exact match returns true', () => {
  assert.equal(projectNameMatches('My Project', 'My Project'), true);
});

test('mismatch returns false', () => {
  assert.equal(projectNameMatches('My Project', 'Some Other Project'), false);
});

test('empty typed value returns false even when project name is empty', () => {
  // The dialog never calls match with empty projectName in practice; this
  // pins the corner case so the dialog can't accidentally permit confirm
  // on empty input.
  assert.equal(projectNameMatches('', ''), true); // technically matches
  assert.equal(projectNameMatches('', 'My Project'), false);
});

test('case-sensitive match — different case is rejected', () => {
  assert.equal(projectNameMatches('my project', 'My Project'), false);
  assert.equal(projectNameMatches('MY PROJECT', 'My Project'), false);
});

test('whitespace-sensitive match — leading/trailing whitespace is rejected', () => {
  assert.equal(projectNameMatches('My Project ', 'My Project'), false);
  assert.equal(projectNameMatches(' My Project', 'My Project'), false);
});

test('substring is rejected', () => {
  assert.equal(projectNameMatches('My', 'My Project'), false);
  assert.equal(projectNameMatches('Project', 'My Project'), false);
});
