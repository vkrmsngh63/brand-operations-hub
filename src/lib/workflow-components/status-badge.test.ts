/**
 * Unit tests for the StatusBadge state→palette mapping.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/workflow-components/status-badge.test.ts
 *
 * Same pattern as src/lib/flake-counter.test.ts — pure-logic tests against
 * the exported mapping table; rendering is validated by tsc + build + lint.
 *
 * The mapping table is the source of truth for what users see when each
 * status is rendered. Tests pin the labels because changing them would
 * change user-visible copy across every workflow at once.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  STATUS_BADGE_PALETTE,
  STATUS_BADGE_LOADING_LABEL,
} from './status-badge-palette.ts';

/* ── Phase 1 states ──────────────────────────────────────────────── */

test('inactive state — gray "Not started"', () => {
  const p = STATUS_BADGE_PALETTE.inactive;
  assert.equal(p.label, 'Not started');
  assert.match(p.color, /^#/);
  assert.match(p.bg, /^rgba\(/);
});

test('active state — yellow "In progress" per design doc §3.3', () => {
  const p = STATUS_BADGE_PALETTE.active;
  assert.equal(p.label, 'In progress');
});

test('completed state — green "Completed"', () => {
  const p = STATUS_BADGE_PALETTE.completed;
  assert.equal(p.label, 'Completed');
});

/* ── Phase 2 states (wired from day one; only seen at Phase 2 turn-on) ── */

test('submitted-for-review — blue "Awaiting review"', () => {
  const p = STATUS_BADGE_PALETTE['submitted-for-review'];
  assert.equal(p.label, 'Awaiting review');
});

test('revision-requested — orange "Revisions requested"', () => {
  const p = STATUS_BADGE_PALETTE['revision-requested'];
  assert.equal(p.label, 'Revisions requested');
});

/* ── Loading placeholder ────────────────────────────────────────── */

test('loading placeholder uses "Loading…" label', () => {
  assert.equal(STATUS_BADGE_LOADING_LABEL, 'Loading…');
});

/* ── Coverage check — every WorkflowStatus value has a palette entry ── */

test('every documented status has a palette entry', () => {
  // The five entries below match the WorkflowStatus union in types.ts. If
  // a new state is added to the union but missed in the palette, tsc
  // catches it via the Record<WorkflowStatus, ...> type — this test
  // additionally pins the count so a state added without a label fails
  // here too.
  const expectedStates = [
    'inactive',
    'active',
    'completed',
    'submitted-for-review',
    'revision-requested',
  ];
  const actualStates = Object.keys(STATUS_BADGE_PALETTE).sort();
  assert.deepEqual(actualStates, expectedStates.sort());
});
