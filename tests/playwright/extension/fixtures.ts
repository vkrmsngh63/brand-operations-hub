// Playwright test fixtures for the competition-scraping Chrome extension.
//
// Loads the freshly-built extension at extensions/competition-scraping/.output/chrome-mv3/
// into a real Chromium browser using chromium.launchPersistentContext + --load-extension,
// and exposes:
//
//   - context:           the persistent BrowserContext with the extension installed
//   - serviceWorker:     a handle to the extension's MV3 service worker (background.ts)
//                        for chrome.storage.local seeding via SW.evaluate
//   - extensionId:       the dynamic chrome-extension://<id>/ id Chromium assigns at load
//
// Headless mode: uses Chromium's "new headless" mode via channel: 'chromium' (Playwright
// 1.60+) — this is the mode that supports loading unpacked extensions without a display.
// On a Codespace without a real display, this is the only supported path.

import { test as base, chromium, type BrowserContext, type Worker } from '@playwright/test';
import * as path from 'node:path';

// Resolved at module load relative to process.cwd(). Playwright always
// runs from the repo root (where playwright.config.ts lives), so this
// path is stable. Using process.cwd() avoids the need for `import.meta.url`
// which forces ESM compilation and conflicts with Playwright 1.60's
// default CJS loader for .ts files.
const extensionDist = path.resolve(
  process.cwd(),
  'extensions/competition-scraping/.output/chrome-mv3',
);

export interface ExtensionFixtures {
  context: BrowserContext;
  serviceWorker: Worker;
  extensionId: string;
}

export const test = base.extend<ExtensionFixtures>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${extensionDist}`,
        `--load-extension=${extensionDist}`,
      ],
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    // Service worker may already be alive when the context lands; otherwise
    // wait for it to register. Either way we get a stable handle.
    let [sw] = context.serviceWorkers();
    if (!sw) {
      sw = await context.waitForEvent('serviceworker');
    }
    await use(sw);
  },

  extensionId: async ({ serviceWorker }, use) => {
    // Service worker URL shape: chrome-extension://<id>/background.js
    const url = serviceWorker.url();
    const match = /^chrome-extension:\/\/([a-z]+)\//.exec(url);
    if (!match) {
      throw new Error(`Unable to extract extension id from SW url: ${url}`);
    }
    await use(match[1]!);
  },
});

export { expect } from '@playwright/test';
