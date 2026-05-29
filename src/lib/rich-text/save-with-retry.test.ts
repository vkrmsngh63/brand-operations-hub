// W#2 P-49 W5 Fix Session D FF1 (2026-05-29) — node:test coverage for the
// rich-text autosave retry helper.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  saveWithRetry,
  isRetriableStatus,
  computeRetryDelayMs,
  type SaveResponseLike,
} from './save-with-retry.ts';

function res(status: number, body: unknown = {}): SaveResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

const noSleep = async () => {};

test('isRetriableStatus — 5xx retriable, 4xx + 2xx not', () => {
  assert.equal(isRetriableStatus(500), true);
  assert.equal(isRetriableStatus(502), true);
  assert.equal(isRetriableStatus(503), true);
  assert.equal(isRetriableStatus(400), false);
  assert.equal(isRetriableStatus(404), false);
  assert.equal(isRetriableStatus(409), false);
  assert.equal(isRetriableStatus(200), false);
});

test('computeRetryDelayMs — exponential backoff', () => {
  assert.equal(computeRetryDelayMs(0), 500);
  assert.equal(computeRetryDelayMs(1), 1000);
  assert.equal(computeRetryDelayMs(2), 2000);
  assert.equal(computeRetryDelayMs(0, 250), 250);
});

test('saveWithRetry — succeeds first try, no retries', async () => {
  let calls = 0;
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      return res(200);
    },
    sleep: noSleep,
  });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.attempts, 1);
  assert.equal(calls, 1);
});

test('saveWithRetry — transient 500 then success (self-heals, no error surfaced)', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      return calls < 3 ? res(500, { error: 'Failed to resolve project workflow' }) : res(200);
    },
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  });
  assert.equal(outcome.ok, true);
  assert.equal(outcome.attempts, 3);
  assert.equal(calls, 3);
  // Backed off twice before the successful third attempt.
  assert.deepEqual(sleeps, [500, 1000]);
});

test('saveWithRetry — network throw is retried', async () => {
  let calls = 0;
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      if (calls === 1) throw new Error('network down');
      return res(200);
    },
    sleep: noSleep,
  });
  assert.equal(outcome.ok, true);
  assert.equal(calls, 2);
});

test('saveWithRetry — gives up after maxAttempts, returns last detail', async () => {
  let calls = 0;
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      return res(500, { error: 'Failed to resolve project workflow' });
    },
    sleep: noSleep,
  });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.cancelled, false);
  assert.equal(outcome.attempts, 4);
  assert.equal(calls, 4);
  assert.equal(outcome.status, 500);
  assert.equal(outcome.detail, 'Failed to resolve project workflow');
});

test('saveWithRetry — 4xx surfaces immediately without retry', async () => {
  let calls = 0;
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      return res(400, { error: 'Bad analysis payload' });
    },
    sleep: noSleep,
  });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.attempts, 1);
  assert.equal(calls, 1);
  assert.equal(outcome.detail, 'Bad analysis payload');
});

test('saveWithRetry — cancellation (newer save) aborts the retry loop', async () => {
  let calls = 0;
  let cancelled = false;
  const outcome = await saveWithRetry({
    doFetch: async () => {
      calls++;
      // After the first failed attempt, a newer edit supersedes us.
      cancelled = true;
      return res(500);
    },
    isCancelled: () => cancelled,
    sleep: noSleep,
  });
  assert.equal(outcome.cancelled, true);
  assert.equal(outcome.ok, false);
  // Only the first attempt ran; the cancel check before attempt 2 short-circuits.
  assert.equal(calls, 1);
});

test('saveWithRetry — falls back to HTTP <status> when no error field', async () => {
  const outcome = await saveWithRetry({
    doFetch: async () => res(503, 'plain text not json'),
    maxAttempts: 1,
    sleep: noSleep,
  });
  assert.equal(outcome.ok, false);
  assert.equal(outcome.detail, 'HTTP 503');
});
