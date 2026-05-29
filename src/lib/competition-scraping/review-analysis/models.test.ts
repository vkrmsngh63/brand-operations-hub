// W#2 P-49 Workstream 5 — node:test cases for the central model registry
// (models.ts). Pins the supported-model list + validator behavior so the
// registry can't silently drift. See docs/AI_MODEL_REGISTRY.md + ROADMAP P-52.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_MODEL_VERSION,
  SUPPORTED_MODEL_VERSIONS,
  isSupportedModelVersion,
} from './models.ts';

test('SUPPORTED_MODEL_VERSIONS contains the three Opus options including 4.8', () => {
  assert.ok(SUPPORTED_MODEL_VERSIONS.includes('claude-opus-4-8'));
  assert.ok(SUPPORTED_MODEL_VERSIONS.includes('claude-opus-4-7'));
  assert.ok(SUPPORTED_MODEL_VERSIONS.includes('claude-opus-4-6'));
  assert.equal(SUPPORTED_MODEL_VERSIONS.length, 3);
});

test('SUPPORTED_MODEL_VERSIONS is Opus-only per §A.7 policy', () => {
  for (const m of SUPPORTED_MODEL_VERSIONS) {
    assert.ok(m.startsWith('claude-opus-'), `${m} should be an Opus model`);
  }
});

test('DEFAULT_MODEL_VERSION stays Opus 4.7 (Opus 4.8 added as option only, not default)', () => {
  assert.equal(DEFAULT_MODEL_VERSION, 'claude-opus-4-7');
  assert.ok(SUPPORTED_MODEL_VERSIONS.includes(DEFAULT_MODEL_VERSION));
});

test('isSupportedModelVersion accepts every listed model', () => {
  for (const m of SUPPORTED_MODEL_VERSIONS) {
    assert.equal(isSupportedModelVersion(m), true);
  }
});

test('isSupportedModelVersion rejects unknown / unrelated model strings', () => {
  assert.equal(isSupportedModelVersion('claude-sonnet-4-6'), false);
  assert.equal(isSupportedModelVersion('claude-haiku-4-5'), false);
  assert.equal(isSupportedModelVersion('claude-opus-4-9'), false);
  assert.equal(isSupportedModelVersion('gpt-4'), false);
  assert.equal(isSupportedModelVersion(''), false);
});
