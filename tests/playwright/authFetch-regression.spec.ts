// P-17 — Real-browser regression test for src/lib/authFetch.ts production export.
//
// Backstory: commit 08f10e5 (2026-05-12) fixed an "Illegal invocation"
// bug shipped by P-1 (2026-05-10). The production wiring passed `fetch`
// bare as the `fetchFn` dependency to makeAuthFetch:
//
//     fetchFn: fetch              // <-- buggy: detaches receiver
//
// Real browsers refuse this and throw
//   TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation
// on every call. The fix wraps fetch in an arrow that preserves the
// window receiver:
//
//     fetchFn: (u, i) => fetch(u, i)   // <-- fixed
//
// The 7 unit tests in src/lib/authFetch.test.ts inject a fake fetchFn
// and so don't exercise the production wiring line; Node's fetch is
// more lenient than browser fetch and wouldn't catch this even with
// an integration test in Node. This Playwright suite is the regression
// belt: it loads the real production-export wiring into a real
// Chromium browser and checks that no Illegal invocation throws.

import { test, expect } from '@playwright/test';

test.describe('authFetch production export — real-browser regression (P-17)', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.get('/__calls/reset');
    await page.goto('/test-page.html');
    await page.waitForFunction(() => (window as unknown as { __pageReady?: boolean }).__pageReady === true);
  });

  test('200 path: production wiring does not throw Illegal invocation', async ({ page }) => {
    await page.evaluate(() => {
      (window as unknown as { __fakeSupabaseState: unknown }).__fakeSupabaseState = {
        initialToken: 'tok-200',
        refreshResult: 'success',
        refreshedToken: 'should-not-be-used',
        refreshCalls: 0,
      };
    });

    const result = await page.evaluate(async () => {
      type Runner = (url: string, opts?: RequestInit) => Promise<unknown>;
      const run = (window as unknown as { __runAuthFetch: Runner }).__runAuthFetch;
      return await run('/stub-api/ok');
    });

    expect(
      (result as { threwIllegalInvocation: boolean }).threwIllegalInvocation,
      'Production export must not throw Illegal invocation in a real browser — see commit 08f10e5',
    ).toBe(false);
    expect((result as { ok: boolean }).ok).toBe(true);
    expect((result as { status: number }).status).toBe(200);

    const callsRes = await page.request.get('/__calls');
    const calls = (await callsRes.json()) as Array<{ path: string; auth: string }>;
    const relevant = calls.filter((c) => c.path === '/stub-api/ok');
    expect(relevant.length).toBe(1);
    expect(relevant[0]!.auth).toBe('Bearer tok-200');
  });

  test('401 → refresh → retry path also exercises production wiring without throwing', async ({ page }) => {
    await page.evaluate(() => {
      (window as unknown as { __fakeSupabaseState: unknown }).__fakeSupabaseState = {
        initialToken: 'tok-old',
        refreshResult: 'success',
        refreshedToken: 'tok-new',
        refreshCalls: 0,
      };
    });

    const result = await page.evaluate(async () => {
      type Runner = (url: string, opts?: RequestInit) => Promise<unknown>;
      const run = (window as unknown as { __runAuthFetch: Runner }).__runAuthFetch;
      return await run('/stub-api/needs-refresh');
    });

    expect((result as { threwIllegalInvocation: boolean }).threwIllegalInvocation).toBe(false);
    expect((result as { ok: boolean }).ok).toBe(true);
    expect((result as { status: number }).status).toBe(200);

    const callsRes = await page.request.get('/__calls');
    const calls = (await callsRes.json()) as Array<{ path: string; auth: string }>;
    const relevant = calls.filter((c) => c.path === '/stub-api/needs-refresh');
    expect(relevant.length).toBe(2);
    expect(relevant[0]!.auth).toBe('Bearer tok-old');
    expect(relevant[1]!.auth).toBe('Bearer tok-new');

    const refreshCalls = await page.evaluate(() => {
      return (window as unknown as { __fakeSupabaseState: { refreshCalls: number } }).__fakeSupabaseState.refreshCalls;
    });
    expect(refreshCalls).toBe(1);
  });
});
