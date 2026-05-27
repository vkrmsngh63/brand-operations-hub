import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  EXECUTION_MODE_DIRECT,
  EXECUTION_MODE_HELP,
  EXECUTION_MODE_LABELS,
  EXECUTION_MODE_SERVER,
  EXECUTION_MODES,
  isExecutionMode,
  type ExecutionMode,
} from './execution-mode.ts';

test('EXECUTION_MODES contains both values in order', () => {
  assert.deepEqual([...EXECUTION_MODES], ['direct', 'server']);
});

test('EXECUTION_MODE_LABELS covers every ExecutionMode value', () => {
  for (const mode of EXECUTION_MODES) {
    assert.equal(typeof EXECUTION_MODE_LABELS[mode], 'string');
    assert.ok(
      EXECUTION_MODE_LABELS[mode].length > 0,
      `label for ${mode} should be non-empty`,
    );
  }
});

test('EXECUTION_MODE_LABELS match W#1 AutoAnalyze.tsx verbatim', () => {
  // W#1's AutoAnalyze.tsx <option> text — drift here means W#1 + W#2 dropdowns diverge.
  assert.equal(EXECUTION_MODE_LABELS.direct, 'Direct (browser → Anthropic)');
  assert.equal(EXECUTION_MODE_LABELS.server, 'Server proxy (browser → Vercel → Anthropic)');
});

test('EXECUTION_MODE_HELP mentions both modes + the Vercel timeout caveat', () => {
  assert.match(EXECUTION_MODE_HELP, /Direct/);
  assert.match(EXECUTION_MODE_HELP, /Server proxy/);
  assert.match(EXECUTION_MODE_HELP, /Vercel/);
});

test('isExecutionMode accepts both valid values', () => {
  assert.equal(isExecutionMode(EXECUTION_MODE_DIRECT), true);
  assert.equal(isExecutionMode(EXECUTION_MODE_SERVER), true);
});

test('isExecutionMode rejects invalid input', () => {
  const cases: unknown[] = ['', 'browser', 'aws', null, undefined, 0, {}, []];
  for (const c of cases) {
    assert.equal(isExecutionMode(c), false, `should reject ${JSON.stringify(c)}`);
  }
});

test('isExecutionMode narrows type at compile time', () => {
  const raw: unknown = 'direct';
  if (isExecutionMode(raw)) {
    const _typed: ExecutionMode = raw;
    assert.equal(_typed, 'direct');
  }
});
