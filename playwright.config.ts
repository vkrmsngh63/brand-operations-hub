import { defineConfig } from '@playwright/test';

// Two Playwright suites coexist in this repo:
//
//   1. The P-17 authFetch real-browser regression test (2026-05-14) —
//      lives in `tests/playwright/*.spec.ts` at the top level. Runs
//      headless against a tiny webServer-served bundled-page stub.
//      See tests/playwright/authFetch-regression.spec.ts.
//
//   2. The P-14 highlight-flashing harness (this session, 2026-05-12) —
//      lives in `tests/playwright/extension/*.spec.ts`. Uses
//      chromium.launchPersistentContext + --load-extension to exercise
//      the real built Chrome extension. The fixtures file in that
//      directory provides the persistent context; this config does NOT
//      need any browser-level wiring for the extension project.

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  projects: [
    {
      name: 'chromium',
      testDir: './tests/playwright',
      testMatch: '*.spec.ts',
      // Exclude the extension subdir — its specs use launchPersistentContext
      // via their own fixtures.ts and have nothing to do with the chromium
      // project's plain browser fixture.
      testIgnore: 'extension/**',
      use: {
        baseURL: 'http://127.0.0.1:7891',
        browserName: 'chromium',
        headless: true,
      },
    },
    {
      name: 'extension',
      testDir: './tests/playwright/extension',
      testMatch: '*.spec.ts',
      // No `use` block — the fixtures.ts file in this directory creates
      // its own persistent context (launchPersistentContext does not
      // honor `use.headless` or other browser-level config options).
    },
  ],
  webServer: {
    command: 'node tests/playwright/test-server.mjs',
    url: 'http://127.0.0.1:7891/__health',
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
