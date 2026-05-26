// Tests for the pure helpers in scrape-trigger-modal.ts shipped under P-49
// Workstream 2 Session 2 (2026-05-27). The modal itself uses DOM APIs that
// the node:test runtime doesn't ship without jsdom; the pure helper
// `clampCap` is the trust-boundary normalizer that all of the modal's user
// input flows through, and it's straightforward to unit test in isolation.
//
// The interactive open/cancel/start flow is covered by future Playwright
// extension-context spec per Rule 27; not by node:test here.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { clampCap } from './scrape-trigger-modal.ts';

describe('clampCap', () => {
  it('returns the integer value when within MIN..MAX', () => {
    assert.equal(clampCap(200), 200);
    assert.equal(clampCap(1), 1);
    assert.equal(clampCap(5000), 5000);
    assert.equal(clampCap(42), 42);
  });

  it('clamps values below MIN_CAP to MIN_CAP', () => {
    assert.equal(clampCap(0), 1);
    assert.equal(clampCap(-50), 1);
  });

  it('clamps values above MAX_CAP to MAX_CAP', () => {
    assert.equal(clampCap(5001), 5000);
    assert.equal(clampCap(999999), 5000);
  });

  it('floors decimal values to the integer part before clamping', () => {
    assert.equal(clampCap(199.7), 199);
    assert.equal(clampCap(200.4), 200);
    assert.equal(clampCap(0.5), 1); // floor → 0, then clamped up to MIN_CAP
  });

  it('returns the default-equivalent (200) for non-finite values', () => {
    assert.equal(clampCap(NaN), 200);
    assert.equal(clampCap(Infinity), 200);
    assert.equal(clampCap(-Infinity), 200);
  });
});
