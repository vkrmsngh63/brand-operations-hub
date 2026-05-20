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
// rendering path end-to-end across all 4 platforms (amazon/ebay/etsy/walmart)
// via the PLATFORMS array + for-loop pattern shared with image-capture.spec.ts
// and highlight-flashing.spec.ts. Per the P-22 cross-platform extension
// (2026-05-20-w2-deploy-29), defensive regression coverage for any future
// per-platform divergence in the saved-URL picker flow. The helper output is
// identical across sites; per-platform variation here exercises route-glob
// matching + `selectedPlatform` propagation through the orchestrator attach
// path.

import { test, expect } from './fixtures';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000031';
const FAKE_URL_ID_WITH_NAME = '00000000-0000-4000-8000-000000000032';
const FAKE_URL_ID_NO_NAME = '00000000-0000-4000-8000-000000000033';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000034';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

const SAVED_PRODUCT_NAME = 'Acme Widget Pro 2026';

interface PlatformCase {
  platform: 'amazon' | 'ebay' | 'etsy' | 'walmart';
  productUrl: string;
  savedUrlWithName: string;
  savedUrlNoName: string;
  pageRouteGlob: string;
}

const PLATFORMS: readonly PlatformCase[] = [
  {
    platform: 'amazon',
    productUrl: 'https://www.amazon.com/dp/B0FAKE9876',
    savedUrlWithName: 'https://www.amazon.com/dp/B0FAKE9876',
    savedUrlNoName: 'https://www.amazon.com/dp/B0FAKE5555',
    pageRouteGlob: '**://*.amazon.com/**',
  },
  {
    platform: 'ebay',
    productUrl: 'https://www.ebay.com/itm/123456709876',
    savedUrlWithName: 'https://www.ebay.com/itm/123456709876',
    savedUrlNoName: 'https://www.ebay.com/itm/123456705555',
    pageRouteGlob: '**://*.ebay.com/**',
  },
  {
    platform: 'etsy',
    productUrl: 'https://www.etsy.com/listing/909876009/sample-product',
    savedUrlWithName: 'https://www.etsy.com/listing/909876009/sample-product',
    savedUrlNoName: 'https://www.etsy.com/listing/905555009/another-product',
    pageRouteGlob: '**://*.etsy.com/**',
  },
  {
    platform: 'walmart',
    productUrl: 'https://www.walmart.com/ip/Sample-Product/909876',
    savedUrlWithName: 'https://www.walmart.com/ip/Sample-Product/909876',
    savedUrlNoName: 'https://www.walmart.com/ip/Other-Product/905555',
    pageRouteGlob: '**://*.walmart.com/**',
  },
];

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

for (const pl of PLATFORMS) {
  test.describe(`W#2 P-23 — saved-URL dropdown side-by-side label — platform=${pl.platform}`, () => {
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
        [FAKE_PROJECT_ID, pl.platform, SUPABASE_STORAGE_KEY, session] as const,
      );

      await context.route(pl.pageRouteGlob, async (route) => {
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
              platform: pl.platform,
              url: pl.savedUrlWithName,
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
              platform: pl.platform,
              url: pl.savedUrlNoName,
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
      await page.goto(pl.productUrl);

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
        ['Some captured text the user might right-click on.', pl.productUrl] as const,
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
        `${SAVED_PRODUCT_NAME} — ${pl.savedUrlWithName}`,
      );

      // Pre-P-23 contract preserved: URL-only when productName is absent
      // (URL is short enough that no truncation fires).
      expect(noNameOpt?.text).toBe(pl.savedUrlNoName);
    });
  });
}
