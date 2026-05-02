/**
 * Unit tests for the post-rebuild canvas refresh retry helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/post-rebuild-fetch-retry.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files in this folder. Sleep is mocked so tests run instantly with
 * no real backoff delay.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  runRefreshWithRetry,
  isPostRebuildFetchFailedError,
} from './post-rebuild-fetch-retry.ts';

/* ── isPostRebuildFetchFailedError ─────────────────────────────── */

test('isPostRebuildFetchFailedError: error with flag → true', () => {
  const e = Object.assign(new Error('x'), { _postRebuildFetchFailed: true });
  assert.equal(isPostRebuildFetchFailedError(e), true);
});

test('isPostRebuildFetchFailedError: plain Error → false', () => {
  assert.equal(isPostRebuildFetchFailedError(new Error('x')), false);
});

test('isPostRebuildFetchFailedError: non-true flag value → false', () => {
  const e = Object.assign(new Error('x'), { _postRebuildFetchFailed: 'yes' });
  assert.equal(isPostRebuildFetchFailedError(e), false);
});

test('isPostRebuildFetchFailedError: non-object → false', () => {
  assert.equal(isPostRebuildFetchFailedError('error string'), false);
  assert.equal(isPostRebuildFetchFailedError(null), false);
  assert.equal(isPostRebuildFetchFailedError(undefined), false);
  assert.equal(isPostRebuildFetchFailedError(42), false);
});

/* ── happy path: succeeds on attempt 1 ─────────────────────────── */

test('refresh succeeds on attempt 1 → resolves; sleep never called', async () => {
  let calls = 0;
  let sleepCalls = 0;
  const sleep = async () => {
    sleepCalls++;
  };
  await runRefreshWithRetry(
    async () => {
      calls++;
    },
    { sleep },
  );
  assert.equal(calls, 1);
  assert.equal(sleepCalls, 0);
});

/* ── retry path: succeeds on attempt 2 after one failure ──────── */

test('refresh fails attempt 1, succeeds attempt 2 → resolves; sleep called once with 2000ms', async () => {
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

  await runRefreshWithRetry(
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

test('refresh fails attempts 1+2, succeeds attempt 3 → resolves; sleep called [2000, 5000]', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  await runRefreshWithRetry(
    async () => {
      calls++;
      if (calls < 3) throw new Error('flake-' + calls);
    },
    { sleep },
  );

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [2000, 5000]);
});

/* ── exhaust path: all 3 attempts fail → throws annotated ──────── */

test('refresh fails all 3 attempts → throws with _noRetry + _postRebuildFetchFailed', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const sleep = async (ms: number) => {
    sleeps.push(ms);
  };

  let thrown: unknown = null;
  try {
    await runRefreshWithRetry(
      async () => {
        calls++;
        throw new Error('persistent-flake');
      },
      { sleep },
    );
    assert.fail('expected throw');
  } catch (e) {
    thrown = e;
  }

  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [2000, 5000]);
  assert.ok(thrown instanceof Error);
  assert.equal(isPostRebuildFetchFailedError(thrown), true);
  assert.equal(
    (thrown as Error & { _noRetry: boolean })._noRetry,
    true,
  );
  // Message must be self-explanatory for the director (not a developer).
  const msg = (thrown as Error).message;
  assert.match(msg, /SUCCEEDED/);
  assert.match(msg, /Refresh the browser tab/);
  assert.match(msg, /Resume/);
  assert.match(msg, /persistent-flake/);
});

/* ── exhaust path: callback fires for attempts 1 + 2, NOT for the
       final failure (the throw carries the final error) ──────────── */

test('onAttemptFailed: called after attempts 1 + 2, NOT after the final failure', async () => {
  const calledFor: number[] = [];
  const sleep = async () => {};

  try {
    await runRefreshWithRetry(
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
    await runRefreshWithRetry(
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
    await runRefreshWithRetry(
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
    await runRefreshWithRetry(
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
    await runRefreshWithRetry(
      async () => {
        throw 'raw-string-error';
      },
      { sleep },
    );
  } catch (e) {
    thrown = e;
  }

  assert.ok(thrown instanceof Error);
  assert.match((thrown as Error).message, /raw-string-error/);
});
