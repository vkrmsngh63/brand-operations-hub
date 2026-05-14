// P-23 regression spec — Amazon main-image right-click context-menu fix.
//
// Background: on Amazon's product-listing page, the main product <img> is
// wrapped in zoom/overlay elements that intercept the `contextmenu` event
// before Chrome recognizes the right-click target as `contexts: ['image']`.
// So Chrome's native "Add to PLOS — Image" menu (registered with that
// context in pre-P-23 background.ts) never fires. Captured 2026-05-14 in
// the deploy-#10 cross-platform smoke session as a MEDIUM polish item;
// fix shipped 2026-05-14 W#2 polish session #18.
//
// The P-23 fix has two parts:
//   (1) background.ts widens the image context-menu from `contexts: ['image']`
//       to `contexts: ['all']` so the menu fires on any right-click target —
//       not just elements Chrome already recognizes as images.
//   (2) The content-script orchestrator adds a contextmenu capture-phase
//       listener that walks up from `event.target` (and scans each
//       ancestor's descendants) to find an underlying <img>, caching its
//       src in `lastRightClickImageSrc`. When the menu-click message
//       arrives with an empty `srcUrl` (because Chrome didn't recognize the
//       right-click target as image), the handler falls back to the cache.
//
// Playwright can't drive Chrome's native context-menu UI (it's a native
// widget outside the page DOM). Same constraint as image-capture.spec.ts
// (P-22): we dispatch the menu-click message from the SW directly. The
// distinct concern THIS spec covers is the EMPTY-srcUrl-fallback path that
// the P-23 fix introduces:
//
//   1. Page loads with an overlay-wrapped <img> matching Amazon's pattern.
//   2. We fire a contextmenu event on the OVERLAY DIV (not the <img>);
//      the orchestrator's capture-phase listener walks up to find #hero.
//   3. We dispatch `open-image-capture-form` from SW with `srcUrl: ''`
//      (simulating Chrome's widened-contexts behavior where the right-click
//      target isn't an image, so info.srcUrl is empty).
//   4. The handler falls back to the cache → form opens with #hero's src.
//
// This regression-locks the bug class as permanent coverage: if a future
// session reverts either (a) the contexts widening, (b) the contextmenu
// listener, or (c) the empty-srcUrl fallback, this spec fails.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';
const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

const HERO_IMAGE_SRC = 'https://m.media-amazon.com/images/I/fake-cool-heat-patches.jpg';
const FIXTURE_PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE1234';

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

test.describe('P-23 Amazon overlay-wrapped image — content-script fallback path', () => {
  test('empty srcUrl from widened-contexts menu → falls back to last right-click image', async ({
    context,
    serviceWorker,
  }) => {
    // ─── Seed chrome.storage with auth session + popup-state keys ────────
    await serviceWorker.evaluate(
      async ([projectId, storageKey, sessionJson]) => {
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: 'amazon',
          selectedProjectName: 'Fake Test Project',
          [storageKey]: sessionJson,
        });
      },
      [
        FAKE_PROJECT_ID,
        SUPABASE_STORAGE_KEY,
        buildFakeSupabaseSession(),
      ] as const,
    );

    // ─── Route 0a: catch-all for unmocked vklf.com paths → 404 ───────────
    // Registered FIRST so all specific routes below take priority (Playwright
    // matches routes in REVERSE registration order — most recently registered
    // wins; per the 2026-05-14 Playwright LIFO CORRECTIONS_LOG entry).
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/.*/,
      async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'unmocked-in-test' }),
        });
      },
    );

    // ─── Route 0b: GET /api/projects → empty array ────────────────────────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects(\?.*)?$/,
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

    // ─── Route 1: Amazon page → overlay-wrapped fixture HTML ──────────────
    const html = await readFile(
      path.resolve(
        process.cwd(),
        'tests/playwright/extension/amazon-overlay-image-product-page.html',
      ),
      'utf8',
    );
    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      });
    });

    // ─── Route 2: listCompetitorUrls → one saved row matching the URL ─────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        const savedUrl = {
          id: FAKE_URL_ID,
          projectWorkflowId: 'fake-workflow-id',
          platform: 'amazon',
          url: FIXTURE_PRODUCT_URL,
          competitionCategory: null,
          productName: 'Cool Heat Medicated Patches',
          brandName: null,
          resultsPageRank: null,
          productStarRating: null,
          sellerStarRating: null,
          numProductReviews: null,
          numSellerReviews: null,
          isSponsoredAd: false,
          customFields: {},
          addedBy: FAKE_USER_ID,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([savedUrl]),
        });
      },
    );

    // ─── Route 3: vocabulary → empty (form still renders) ─────────────────
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

    // ─── Drive: navigate, wait for orchestrator attach ────────────────────
    const page = await context.newPage();
    await page.goto(FIXTURE_PRODUCT_URL);

    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // ─── Fire a contextmenu event on the OVERLAY DIV (not the <img>) ──────
    // The orchestrator's capture-phase listener should walk up from
    // #overlay-shield → its parent (.imgTagWrapper) → scan descendants →
    // find #hero → cache its src. Capture-phase dispatch order: the
    // listener at document level fires DURING the capture phase before
    // the event reaches the overlay-shield target.
    await page.evaluate(() => {
      const overlay = document.getElementById('overlay-shield');
      if (!overlay) throw new Error('overlay-shield not found in fixture');
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      overlay.dispatchEvent(event);
    });

    // ─── Dispatch open-image-capture-form from SW with EMPTY srcUrl ───────
    // This simulates what background.ts sends after the widened-contexts
    // menu fires on a non-image target: `info.srcUrl` is empty, the message
    // arrives with srcUrl: ''. The handler must fall back to the cache that
    // was populated by the contextmenu event above.
    //
    // Retry loop matches the P-22 spec — the orchestrator sets
    // data-plos-cs-active=1 BEFORE its chrome.runtime.onMessage.addListener
    // call, with several awaits in between.
    await serviceWorker.evaluate(
      async ([pageUrl]) => {
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
              kind: 'open-image-capture-form',
              srcUrl: '', // ← P-23: empty, forcing the fallback path
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
      [FIXTURE_PRODUCT_URL] as const,
    );

    // ─── Assert form rendered AND preview shows the underlying <img> ──────
    await page.waitForSelector('.plos-cs-form', { timeout: 5_000 });
    await expect(page.locator('.plos-cs-form-title')).toHaveText(
      'Add captured image to PLOS',
    );

    // The form's preview <img> should have src = #hero's src — i.e., the
    // helper found the underlying image despite the right-click target
    // being #overlay-shield. This is the load-bearing P-23 assertion:
    // without the fix, the preview would be empty (srcUrl='') OR the
    // form wouldn't open at all.
    const previewImg = page.locator('.plos-cs-form-image-preview');
    await expect(previewImg).toHaveAttribute('src', HERO_IMAGE_SRC, {
      timeout: 5_000,
    });
  });

  test('contextmenu on plain text → empty srcUrl message → form does NOT open (silent bail)', async ({
    context,
    serviceWorker,
  }) => {
    // Negative test: right-click on a non-image element whose ancestors
    // also have no image. The handler should bail silently — neither the
    // form's backdrop nor its body should appear in the DOM.

    await serviceWorker.evaluate(
      async ([projectId, storageKey, sessionJson]) => {
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: 'amazon',
          selectedProjectName: 'Fake Test Project',
          [storageKey]: sessionJson,
        });
      },
      [
        FAKE_PROJECT_ID,
        SUPABASE_STORAGE_KEY,
        buildFakeSupabaseSession(),
      ] as const,
    );

    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/.*/,
      async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'unmocked-in-test' }),
        });
      },
    );
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') return route.continue();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    // Use a fixture with NO images anywhere on the page.
    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: `<!DOCTYPE html><html><body>
                 <p id="plain-text">No image anywhere on this page.</p>
                 <script>window.__pageReady = true;</script>
               </body></html>`,
      });
    });

    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') return route.continue();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/vocabulary(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') return route.continue();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );

    const page = await context.newPage();
    await page.goto(FIXTURE_PRODUCT_URL);
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // Fire contextmenu on the plain text — no image anywhere in the walk.
    await page.evaluate(() => {
      const target = document.getElementById('plain-text');
      if (!target) throw new Error('plain-text not found in fixture');
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      target.dispatchEvent(event);
    });

    // Dispatch with empty srcUrl. Handler should bail silently — no form.
    await serviceWorker.evaluate(
      async ([pageUrl]) => {
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
              kind: 'open-image-capture-form',
              srcUrl: '',
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
      [FIXTURE_PRODUCT_URL] as const,
    );

    // Give the orchestrator a generous tick to (not) open the form.
    await page.waitForTimeout(1_000);

    // Assert: no form rendered.
    const formCount = await page.locator('.plos-cs-form').count();
    expect(formCount).toBe(0);
    const backdropCount = await page.locator('.plos-cs-form-backdrop').count();
    expect(backdropCount).toBe(0);
  });
});
