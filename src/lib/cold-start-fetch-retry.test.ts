/**
 * Unit tests for the cold-start mount-time fetch retry helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/cold-start-fetch-retry.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files in this folder. Sleep is mocked so tests run instantly with
 * no real backoff delay.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { runColdStartFetchWithRetry } from './cold-start-fetch-retry.ts';

/* ── happy path: succeeds on attempt 1 ─────────────────────────── */

test('fetch succeeds on attempt 1 → resolves; sleep never called', async () => {
  let calls = 0;
  let sleepCalls = 0;
  const sleep = async () => {
    sleepCalls++;
  };
  await runColdStartFetchWithRetry(
    async () => {
      calls++;
    },
    { sleep },
  );
  assert.equal(calls, 1);
  assert.equal(sleepCalls, 0);
});

/* ── retry path: succeeds on attempt 2 after one failure ──────── */

test('fetch fails attempt 1, succeeds attempt 2 → resolves; sleep called once with 2000ms', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };
  const callbacks: Array<{
    attempt: number;
    max: number;
    next: number;
    msg: string;
  }> = [];

  await runColdStartFetchWithRetry(
    async () => {
      calls++;
      if (calls === 1) throw new Error('flake');
    },
    {
      sleep,
      onAttemptFailed: (attempt, max, next, e) => {
        callbacks.push({
          attempt,
          max,
          next,
          msg: e instanceof Error ? e.message : String(e),
        });
      },
    },
  );

  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [2000]);
  assert.equal(callbacks.length, 1);
  assert.equal(callbacks[0].attempt, 1);
  assert.equal(callbacks[0].max, 3);
  assert.equal(callbacks[0].next, 2000);
  assert.equal(callbacks[0].msg, 'flake');
});

/* ── retry path: succeeds on attempt 3 after two failures ─────── */

test('fetch fails attempts 1+2, succeeds attempt 3 → resolves; sleep called [2000, 5000]', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  await runColdStartFetchWithRetry(
    async () => {
      calls++;
      if (calls < 3) throw new Error('flake-' + calls);
    },
    { sleep },
  );

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [2000, 5000]);
});

/* ── exhaust path: all 3 attempts fail → throws plain Error ──── */

test('fetch fails all 3 attempts → throws plain Error with label + click-to-retry message', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  let thrown: unknown = null;
  try {
    await runColdStartFetchWithRetry(
      async () => {
        calls++;
        throw new Error('persistent-flake');
      },
      { sleep, label: 'canvas' },
    );
    assert.fail('expected throw');
  } catch (e) {
    thrown = e;
  }

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [2000, 5000]);
  assert.ok(thrown instanceof Error);
  // Cold-start exhaust should NOT carry post-rebuild annotations — that's
  // a deliberate semantic separation from sibling helper.
  assert.equal(
    (thrown as Error & { _postRebuildFetchFailed?: boolean })
      ._postRebuildFetchFailed,
    undefined,
  );
  assert.equal(
    (thrown as Error & { _noRetry?: boolean })._noRetry,
    undefined,
  );
  // Message must surface the label + the click-to-retry hook for the UI.
  const msg = (thrown as Error).message;
  assert.match(msg, /canvas/);
  assert.match(msg, /Click here to retry/);
  assert.match(msg, /persistent-flake/);
  assert.match(msg, /3 attempts/);
});

/* ── exhaust path with no label → falls back to "data" ──────── */

test('fetch fails all attempts with no label → message uses "data" fallback', async () => {
  const sleep = async () => {};

  let thrown: unknown = null;
  try {
    await runColdStartFetchWithRetry(
      async () => {
        throw new Error('flake');
      },
      { sleep },
    );
  } catch (e) {
    thrown = e;
  }

  assert.ok(thrown instanceof Error);
  assert.match((thrown as Error).message, /Could not load data/);
});

/* ── exhaust path: callback fires for attempts 1 + 2, NOT for the
       final failure (the throw carries the final error) ──────────── */

test('onAttemptFailed: called after attempts 1 + 2, NOT after the final failure', async () => {
  const calledFor: number[] = [];
  const sleep = async () => {};

  try {
    await runColdStartFetchWithRetry(
      async () => {
        throw new Error('flake');
      },
      {
        sleep,
        onAttemptFailed: (attempt) => {
          calledFor.push(attempt);
        },
      },
    );
  } catch {
    /* expected */
  }

  // 3 attempts total; callback fires after attempts 1 and 2 (because
  // those will be retried); NOT after attempt 3 (final failure → throw).
  assert.deepEqual(calledFor, [1, 2]);
});

/* ── custom maxAttempts ────────────────────────────────────────── */

test('custom maxAttempts=2 → at most 2 calls + 1 sleep', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  try {
    await runColdStartFetchWithRetry(
      async () => {
        calls++;
        throw new Error('flake');
      },
      { sleep, maxAttempts: 2 },
    );
  } catch {
    /* expected */
  }

  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [2000]);
});

/* ── custom backoffs ───────────────────────────────────────────── */

test('custom backoffsMs=[100, 200] → those exact values are used', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  try {
    await runColdStartFetchWithRetry(
      async () => {
        calls++;
        throw new Error('flake');
      },
      { sleep, backoffsMs: [100, 200] },
    );
  } catch {
    /* expected */
  }

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [100, 200]);
});

/* ── short backoffs array reuses the last value ────────────────── */

test('backoffsMs shorter than maxAttempts-1 → last value reused', async () => {
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  try {
    await runColdStartFetchWithRetry(
      async () => {
        throw new Error('flake');
      },
      { sleep, maxAttempts: 4, backoffsMs: [100] },
    );
  } catch {
    /* expected */
  }

  // attempts: 1, 2, 3, 4 → 3 sleeps between them; only one value in
  // the backoffs array so it's reused for every gap.
  assert.deepEqual(sleeps, [100, 100, 100]);
});

/* ── non-Error thrown values are stringified safely ────────────── */

test('non-Error thrown value (string) → underlying message stringified into wrapped error', async () => {
  const sleep = async () => {};

  let thrown: unknown = null;
  try {
    await runColdStartFetchWithRetry(
      async () => {
        throw 'raw-string-error';
      },
      { sleep, label: 'keywords' },
    );
  } catch (e) {
    thrown = e;
  }

  assert.ok(thrown instanceof Error);
  assert.match((thrown as Error).message, /raw-string-error/);
  assert.match((thrown as Error).message, /keywords/);
});

/* ── label flows into the success-path message? No — only on throw ─ */

test('label is irrelevant on success path; no error thrown means no message rendered', async () => {
  await runColdStartFetchWithRetry(
    async () => {
      /* succeeds */
    },
    { label: 'whatever', sleep: async () => {} },
  );
  // No assertion needed — the test passes if no throw happens. The
  // label is a thrown-error concern only.
});
