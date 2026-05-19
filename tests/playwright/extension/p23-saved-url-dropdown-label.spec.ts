// Playwright extension-context regression spec for P-23 — saved-URL
// dropdown side-by-side label (productName + url visible together).
//
// Coverage:
//   1. Extension loads on a route-intercepted product page whose URL is
//      pre-seeded as a saved CompetitorUrl row alongside a SECOND saved
//      row with no productName.
//   2. The right-click open-text-capture-form message dispatches the
//      content-script overlay form.
//   3. The form's saved-URL <select> renders BOTH rows with the new
//      side-by-side label shape from `buildSavedUrlOptionLabel`:
//        • the row with productName renders as `${productName} — ${url}`
//          (em-dash separator) — pre-P-23 this collapsed the URL away
//          whenever productName was set.
//        • the row without productName renders as URL-only — unchanged
//          from pre-P-23 behavior.
//
// Sibling site coverage: `image-capture-form.ts` and the popup
// `CapturedTextPasteForm.tsx` share the same label helper; pure-function
// node:tests at `extensions/competition-scraping/src/lib/saved-url-option-label.test.ts`
// cover the helper directly. This spec covers the content-script <select>
// rendering path end-to-end on a single site (text-capture-form) — that's
// sufficient because the helper output is identical across sites.

import { test, expect } from './fixtures';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000031';
const FAKE_URL_ID_WITH_NAME = '00000000-0000-4000-8000-000000000032';
const FAKE_URL_ID_NO_NAME = '00000000-0000-4000-8000-000000000033';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000034';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

const PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE9876';

const SAVED_URL_WITH_NAME = 'https://www.amazon.com/dp/B0FAKE9876';
const SAVED_PRODUCT_NAME = 'Acme Widget Pro 2026';
const SAVED_URL_NO_NAME = 'https://www.amazon.com/dp/B0FAKE5555';

const MOCK_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>P-23 test fixture</title></head>
<body>
  <p id="capture-target">Some captured text the user might right-click on.</p>
  <script>window.__pageReady = true;</script>
</body>
</html>`;

function buildFakeSupabaseSession(): string {
  const expiresAtSec = Math.floor(Date.now() / 1000) + 3600;
  return JSON.stringify({
    access_token: 'fake-jwt-access-token',
    refresh_token: 'fake-refresh-token',
    expires_at: expiresAtSec,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: FAKE_USER_ID,
      aud: 'authenticated',
      email: 'fake@example.com',
      role: 'authenticated',
    },
  });
}

test.describe('W#2 P-23 — saved-URL dropdown side-by-side label (extension-context regression)', () => {
  test.beforeEach(async ({ context, serviceWorker }) => {
    const session = buildFakeSupabaseSession();
    await serviceWorker.evaluate(
      async ([projectId, platform, storageKey, sessionPayload]) => {
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: platform,
          [storageKey]: sessionPayload,
        });
      },
      [FAKE_PROJECT_ID, 'amazon', SUPABASE_STORAGE_KEY, session] as const,
    );

    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_PAGE_HTML,
      });
    });
  });

  test('saved-URL <select> shows productName — url side-by-side; URL-only when productName absent', async ({
    context,
    serviceWorker,
  }) => {
    // GET listCompetitorUrls → two saved URLs (one with productName, one without).
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        const rows = [
          {
            id: FAKE_URL_ID_WITH_NAME,
            projectWorkflowId: 'fake-pw',
            platform: 'amazon',
            url: SAVED_URL_WITH_NAME,
            competitionCategory: null,
            productName: SAVED_PRODUCT_NAME,
            brandName: null,
            resultsPageRank: null,
            productStarRating: null,
            sellerStarRating: null,
            numProductReviews: null,
            numSellerReviews: null,
            isSponsoredAd: false,
            customFields: {},
            source: 'extension',
            addedBy: FAKE_USER_ID,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: FAKE_URL_ID_NO_NAME,
            projectWorkflowId: 'fake-pw',
            platform: 'amazon',
            url: SAVED_URL_NO_NAME,
            competitionCategory: null,
            productName: null,
            brandName: null,
            resultsPageRank: null,
            productStarRating: null,
            sellerStarRating: null,
            numProductReviews: null,
            numSellerReviews: null,
            isSponsoredAd: false,
            customFields: {},
            source: 'extension',
            addedBy: FAKE_USER_ID,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(rows),
        });
      },
    );

    // GET vocabulary → empty (the form still renders without categories).
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/vocabulary(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    // /api/projects best-effort lookup — return one entry.
    await context.route('**://www.vklf.com/api/projects', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: FAKE_PROJECT_ID, name: 'Test Project' }]),
      });
    });

    const page = await context.newPage();
    await page.goto(PRODUCT_URL);

    // Orchestrator attached.
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // Dispatch open-text-capture-form via SW → tab; retry while the
    // orchestrator's message listener is still installing (same race
    // window as image-capture.spec.ts).
    await serviceWorker.evaluate(
      async ([selectedText, pageUrl]) => {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const tabId = tabs[0]?.id;
        if (typeof tabId !== 'number') {
          throw new Error('No active tab found for sendMessage');
        }
        const deadline = Date.now() + 10_000;
        let lastErr: unknown = null;
        while (Date.now() < deadline) {
          try {
            await chrome.tabs.sendMessage(tabId, {
              kind: 'open-text-capture-form',
              selectedText,
              pageUrl,
            });
            return;
          } catch (err) {
            lastErr = err;
            await new Promise((r) => setTimeout(r, 200));
          }
        }
        throw new Error(`sendMessage retry exhausted: ${String(lastErr)}`);
      },
      ['Some captured text the user might right-click on.', PRODUCT_URL] as const,
    );

    // Form rendered.
    await page.waitForSelector('.plos-cs-form', { timeout: 5_000 });

    // URL <select> populated with our two seeded rows. The form's id is
    // `plos-cs-text-url` (mirror of image form's `plos-cs-image-url`).
    const urlSelect = page.locator('#plos-cs-text-url');
    await expect(urlSelect).toBeEnabled({ timeout: 5_000 });

    // Collect option (value, textContent) tuples.
    const optionData = await urlSelect
      .locator('option')
      .evaluateAll((opts) =>
        (opts as HTMLOptionElement[]).map((o) => ({
          value: o.value,
          text: o.textContent ?? '',
        })),
      );

    // Both seeded rows present (plus the leading "Pick a saved URL…" placeholder).
    const withNameOpt = optionData.find((o) => o.value === FAKE_URL_ID_WITH_NAME);
    const noNameOpt = optionData.find((o) => o.value === FAKE_URL_ID_NO_NAME);
    expect(withNameOpt, 'option for saved URL with productName').toBeTruthy();
    expect(noNameOpt, 'option for saved URL without productName').toBeTruthy();

    // P-23 contract: side-by-side label when productName is present.
    expect(withNameOpt?.text).toBe(
      `${SAVED_PRODUCT_NAME} — ${SAVED_URL_WITH_NAME}`,
    );

    // Pre-P-23 contract preserved: URL-only when productName is absent
    // (URL is short enough that no truncation fires).
    expect(noNameOpt?.text).toBe(SAVED_URL_NO_NAME);
  });
});
