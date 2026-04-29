/**
 * Unit tests for the G2 retry-on-transient helper.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/prisma-retry.test.ts
 *
 * Same `node:test` + `node:assert/strict` pattern as the other pure-helper
 * test files in this folder. Sleep is mocked so tests run instantly with
 * no real backoff delay.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  withRetry,
  isTransientPrismaError,
} from './prisma-retry.ts';

function fakeError(code: string) {
  // Match the relevant shape of Prisma's PrismaClientKnownRequestError
  // without importing the Prisma client.
  return Object.assign(new Error('fake ' + code), { code });
}

/* ── isTransientPrismaError ───────────────────────────────────────── */

test('isTransient: P1001 (cant reach DB) → true', () => {
  assert.equal(isTransientPrismaError(fakeError('P1001')), true);
});

test('isTransient: P1002 (timeout) → true', () => {
  assert.equal(isTransientPrismaError(fakeError('P1002')), true);
});

test('isTransient: P1008 (ops timed out) → true', () => {
  assert.equal(isTransientPrismaError(fakeError('P1008')), true);
});

test('isTransient: P2034 (write conflict / deadlock) → true', () => {
  assert.equal(isTransientPrismaError(fakeError('P2034')), true);
});

test('isTransient: P2002 (unique constraint violation) → false (a hard error)', () => {
  assert.equal(isTransientPrismaError(fakeError('P2002')), false);
});

test('isTransient: P2025 (record not found) → false', () => {
  assert.equal(isTransientPrismaError(fakeError('P2025')), false);
});

test('isTransient: plain Error (no code) → false', () => {
  assert.equal(isTransientPrismaError(new Error('boom')), false);
});

test('isTransient: null → false', () => {
  assert.equal(isTransientPrismaError(null), false);
});

test('isTransient: string-thrown → false', () => {
  assert.equal(isTransientPrismaError('something went wrong'), false);
});

/* ── withRetry behavior ──────────────────────────────────────────── */

test('withRetry: success on first attempt → returns immediately, no sleep', async () => {
  const sleeps: number[] = [];
  const result = await withRetry(async () => 'ok', {
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  });
  assert.equal(result, 'ok');
  assert.deepEqual(sleeps, []);
});

test('withRetry: hard error → throws immediately on attempt 1, no retries', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw fakeError('P2002'); // hard, not transient
      },
      {
        sleep: async (ms) => {
          sleeps.push(ms);
        },
      },
    ),
    /P2002/,
  );
  assert.equal(calls, 1);
  assert.deepEqual(sleeps, []);
});

test('withRetry: transient then success on attempt 2 → returns success', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const result = await withRetry(
    async () => {
      calls++;
      if (calls === 1) throw fakeError('P1001');
      return 'recovered';
    },
    {
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    },
  );
  assert.equal(result, 'recovered');
  assert.equal(calls, 2);
  assert.deepEqual(sleeps, [100]);
});

test('withRetry: transient then transient then success on attempt 3 → returns success', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  const result = await withRetry(
    async () => {
      calls++;
      if (calls < 3) throw fakeError('P1002');
      return 'finally';
    },
    {
      sleep: async (ms) => {
        sleeps.push(ms);
      },
    },
  );
  assert.equal(result, 'finally');
  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [100, 500]); // backoff 100ms then 500ms
});

test('withRetry: persistent transient → throws after maxAttempts (default 3)', async () => {
  let calls = 0;
  const sleeps: number[] = [];
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw fakeError('P1008');
      },
      {
        sleep: async (ms) => {
          sleeps.push(ms);
        },
      },
    ),
    /P1008/,
  );
  assert.equal(calls, 3);
  assert.deepEqual(sleeps, [100, 500]); // 2 sleeps for 3 attempts
});

test('withRetry: maxAttempts=1 → no retries even on transient', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw fakeError('P1001');
      },
      { maxAttempts: 1, sleep: async () => {} },
    ),
    /P1001/,
  );
  assert.equal(calls, 1);
});

test('withRetry: custom isTransient predicate is honored', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        throw new Error('treat-me-as-transient');
      },
      {
        isTransient: (e) =>
          e instanceof Error && e.message === 'treat-me-as-transient',
        sleep: async () => {},
      },
    ),
    /treat-me-as-transient/,
  );
  assert.equal(calls, 3); // retried as if transient
});

test('withRetry: hard error after a transient → stops retrying immediately', async () => {
  let calls = 0;
  await assert.rejects(
    withRetry(
      async () => {
        calls++;
        if (calls === 1) throw fakeError('P1001');
        throw fakeError('P2002'); // hard on retry
      },
      { sleep: async () => {} },
    ),
    /P2002/,
  );
  assert.equal(calls, 2); // retried once on transient, then hard error stops it
});
