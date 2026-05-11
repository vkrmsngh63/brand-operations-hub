import { defineConfig } from '@playwright/test';

// Single Playwright suite for the P-17 authFetch real-browser regression test.
// See tests/playwright/authFetch-regression.spec.ts.

export default defineConfig({
  testDir: './tests/playwright',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:7891',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
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
