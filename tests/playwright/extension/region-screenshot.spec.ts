// Playwright extension-context regression spec for the W#2 Module 2
// region-screenshot gesture (shipped 2026-05-13 session 6 on
// `workflow-2-competition-scraping`).
//
// Captured at session-6 ship time as the deliverable for the (a.22-a)
// ROADMAP entry — completes Module 2 image-capture's regression coverage
// alongside `image-capture.spec.ts` (P-22 slices 1 + 2).
//
// What this test covers end-to-end (per platform):
//   1. Extension loads on a route-intercepted product page for that platform.
//   2. Service worker dispatches `enter-region-screenshot-mode` to the
//      content script (the natural trigger is the popup-side "Region-screenshot
//      mode" button, which Playwright cannot drive directly — Chrome's
//      browser-action popup is a separate document outside the page's
//      driving context. We dispatch the same ContentScriptMessage from
//      the SW; this exercises everything DOWNSTREAM of the popup click,
//      which is where the overlay, drag-rectangle, capture, crop, and form
//      logic lives.)
//   3. Overlay renders with the dim panels + crosshair container + always-
//      visible banner copy.
//   4. Synthetic mouse-down + mouse-move + mouse-up gestures simulate the
//      user dragging a rectangle on the viewport.
//   5. `chrome.tabs.captureVisibleTab` runs (real Chrome API in this
//      extension context — host_permissions for the 4 supported platforms
//      satisfy the permission gate).
//   6. Canvas crop produces a `data:image/png;base64,...` URL.
//   7. Image-capture-form opens with sourceType='region-screenshot' and
//      that data URL as srcUrl.
//   8. Saved-URL picker pre-selects the seeded saved row (P-15 path).
//   9. User fills the form (category, composition, embedded text, 2 tags).
//  10. Background fires Phase 1 (`requestImageUpload`) with sourceType
//      'region-screenshot' and mimeType 'image/png'.
//  11. Background fires Phase 2 PUT to the signed Supabase URL with
//      Content-Type 'image/png'.
//  12. Background fires Phase 3 (`finalizeImageUpload`) with the full
//      metadata payload echoing sourceType='region-screenshot'.
//  13. Form closes on success.
//
// What this test does NOT cover (separate concerns, deferred to follow-up
// specs or manual verification):
//   - Permission-prompt re-approval after reinstall (cross-physical-browser).
//   - DPR variations beyond the Playwright default (1).
//   - Edge-touched rectangle clamping with negative-space start coords.
//   - Escape-key cancel path (the orchestrator silently destroys; covered
//     by the unit test of region-screenshot.ts isRectTooSmall + the
//     overlay's keydown listener trivially routes to props.onCancel).
//
// Cross-platform shape mirrors image-capture.spec.ts P-22 slice 2: a
// PLATFORMS array + for-loop parametrization across amazon / ebay / etsy /
// walmart. The 4 platforms only differ in (a) the selectedPlatform storage
// value, (b) the product URL the spec navigates to, and (c) the fixture
// HTML the page-route fulfills with. No image-CDN route is needed — the
// cropped image is a data: URL fetched in-process by fetchImageBytes.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_IMAGE_ID = '00000000-0000-4000-8000-000000000003';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';
const FAKE_SUPABASE_UPLOAD_URL =
  'https://vyehbgkvdnvsjjfqhqgo.supabase.co/storage/v1/object/sign/captured-images/fake-path?token=fake-signed-token';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

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

interface PlatformCase {
  /** chrome.storage `selectedPlatform` value (matches the orchestrator's
   *  hostname-vs-selectedPlatform cross-check). */
  platform: 'amazon' | 'ebay' | 'etsy' | 'walmart';
  /** Full product URL the spec navigates to. Must match the platform module's
   *  `matchesProduct` regex. The Route 3 seeded saved row sets `url` to this
   *  value so the form's pickInitialUrl pre-select path matches. */
  productUrl: string;
  /** Glob used in `context.route(...)` to intercept the platform's host and
   *  fulfill with the fixture HTML. */
  pageRouteGlob: string;
  /** Path to the per-platform fixture HTML file (relative to repo root).
   *  Reuses the same fixtures as image-capture.spec.ts — the page just needs
   *  some pixels to capture; the image-element-presence the regular-image
   *  test relies on isn't needed here (we don't right-click an image). */
  fixturePath: string;
}

const PLATFORMS: readonly PlatformCase[] = [
  {
    platform: 'amazon',
    productUrl: 'https://www.amazon.com/dp/B0FAKE1234',
    pageRouteGlob: '**://*.amazon.com/**',
    fixturePath: 'tests/playwright/extension/amazon-image-product-page.html',
  },
  {
    platform: 'ebay',
    productUrl: 'https://www.ebay.com/itm/123456789012',
    pageRouteGlob: '**://*.ebay.com/**',
    fixturePath: 'tests/playwright/extension/ebay-image-product-page.html',
  },
  {
    platform: 'etsy',
    productUrl:
      'https://www.etsy.com/listing/123456789/cool-heat-medicated-patches',
    pageRouteGlob: '**://*.etsy.com/**',
    fixturePath: 'tests/playwright/extension/etsy-image-product-page.html',
  },
  {
    platform: 'walmart',
    productUrl: 'https://www.walmart.com/ip/Cool-Heat-Medicated-Patches/12345',
    pageRouteGlob: '**://*.walmart.com/**',
    fixturePath: 'tests/playwright/extension/walmart-image-product-page.html',
  },
];

for (const pl of PLATFORMS) {
  test.describe(`region-screenshot happy path — platform=${pl.platform}`, () => {
    test('arm overlay → drag rectangle → captureVisibleTab → crop → form → Save → 3-phase upload completes', async ({
      context,
      serviceWorker,
    }) => {
      // ─── Seed chrome.storage with auth session + popup-state keys ──────
      // Also stub chrome.tabs.captureVisibleTab — Chrome only grants the
      // `activeTab` permission to the extension when the user "invokes" it
      // (toolbar icon click that opens the popup; right-click context menu
      // pick; or keyboard shortcut). Playwright's synthetic SW dispatch
      // doesn't go through any of those gestures, so captureVisibleTab
      // rejects with the activeTab/<all_urls> permission error even when
      // `activeTab` is in the manifest. We stub the API with a 1x1 PNG so
      // the spec tests everything DOWNSTREAM of the chrome.* boundary;
      // the real captureVisibleTab path is covered by manual cross-platform
      // verification in COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md.
      await serviceWorker.evaluate(
        async ([projectId, platform, storageKey, sessionJson]) => {
          await chrome.storage.local.set({
            selectedProjectId: projectId,
            selectedPlatform: platform,
            selectedProjectName: 'Fake Test Project',
            [storageKey]: sessionJson,
          });
          // Smallest valid PNG (1×1 transparent). The cropped canvas
          // re-encode at content-script level produces a different PNG;
          // we only need the source bytes to decode cleanly into an Image.
          const ONE_BY_ONE_PNG =
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
          (chrome.tabs as unknown as { captureVisibleTab: unknown }).captureVisibleTab =
            (_a: unknown, _b: unknown) => Promise.resolve(ONE_BY_ONE_PNG);
        },
        [
          FAKE_PROJECT_ID,
          pl.platform,
          SUPABASE_STORAGE_KEY,
          buildFakeSupabaseSession(),
        ] as const,
      );

      // ─── Capture API request bodies for end-of-test asserts ────────────
      let phase1Body: Record<string, unknown> | null = null;
      let phase2Method: string | null = null;
      let phase2ContentType: string | null = null;
      let phase2BodySize: number | null = null;
      let phase3Body: Record<string, unknown> | null = null;

      // Catch-all for unmocked vklf.com paths.
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

      // GET /api/projects → empty array (orchestrator init).
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

      // Platform product page → fixture HTML.
      const html = await readFile(
        path.resolve(process.cwd(), pl.fixturePath),
        'utf8',
      );
      await context.route(pl.pageRouteGlob, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/html; charset=utf-8',
          body: html,
        });
      });

      // GET listCompetitorUrls → seeded saved URL.
      await context.route(
        /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls(\?.*)?$/,
        async (route, request) => {
          if (request.method() !== 'GET') return route.continue();
          const savedUrl = {
            id: FAKE_URL_ID,
            projectWorkflowId: 'fake-workflow-id',
            platform: pl.platform,
            url: pl.productUrl,
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

      // GET vocabulary?type=image-category → 2 entries.
      await context.route(
        /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/vocabulary(\?.*)?$/,
        async (route, request) => {
          if (request.method() !== 'GET') return route.continue();
          const entries = [
            {
              id: 'vocab-1',
              projectId: FAKE_PROJECT_ID,
              vocabularyType: 'image-category',
              value: 'a+ content',
              addedByWorkflow: 'competition-scraping',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
            },
            {
              id: 'vocab-2',
              projectId: FAKE_PROJECT_ID,
              vocabularyType: 'image-category',
              value: 'feature module',
              addedByWorkflow: 'competition-scraping',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
            },
          ];
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(entries),
          });
        },
      );

      // POST requestUpload (Phase 1) → fake signed URL.
      await context.route(
        /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images\/requestUpload$/,
        async (route, request) => {
          if (request.method() !== 'POST') return route.continue();
          const raw = request.postData();
          phase1Body = raw
            ? (JSON.parse(raw) as Record<string, unknown>)
            : null;
          const response = {
            uploadUrl: FAKE_SUPABASE_UPLOAD_URL,
            capturedImageId: FAKE_IMAGE_ID,
            storagePath: `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_IMAGE_ID}.png`,
            expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        },
      );

      // PUT to fake Supabase signed URL (Phase 2) → 200.
      await context.route(
        /https:\/\/vyehbgkvdnvsjjfqhqgo\.supabase\.co\/storage\/.*/,
        async (route, request) => {
          phase2Method = request.method();
          phase2ContentType = request.headers()['content-type'] ?? null;
          const raw = request.postDataBuffer();
          phase2BodySize = raw ? raw.length : null;
          await route.fulfill({ status: 200, body: '' });
        },
      );

      // POST finalize (Phase 3) → CapturedImage row.
      await context.route(
        /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images\/finalize$/,
        async (route, request) => {
          if (request.method() !== 'POST') return route.continue();
          const raw = request.postData();
          phase3Body = raw
            ? (JSON.parse(raw) as Record<string, unknown>)
            : null;
          const row = {
            id: FAKE_IMAGE_ID,
            clientId: (phase3Body?.clientId as string) ?? 'unknown',
            competitorUrlId: FAKE_URL_ID,
            imageCategory: (phase3Body?.imageCategory as string) ?? null,
            storagePath: `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_IMAGE_ID}.png`,
            storageBucket: 'captured-images',
            composition: (phase3Body?.composition as string) ?? null,
            embeddedText: (phase3Body?.embeddedText as string) ?? null,
            tags: (phase3Body?.tags as string[]) ?? [],
            sourceType: 'region-screenshot',
            fileSize: phase2BodySize ?? 0,
            mimeType: 'image/png',
            width: null,
            height: null,
            sortOrder: 0,
            addedBy: FAKE_USER_ID,
            addedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(row),
          });
        },
      );

      // ─── Drive: navigate, wait for content script, arm overlay ─────────
      const page = await context.newPage();
      await page.goto(pl.productUrl);

      // Orchestrator's attach signal.
      await page.waitForFunction(
        () => document.body.getAttribute('data-plos-cs-active') === '1',
        undefined,
        { timeout: 10_000 },
      );

      // Dispatch enter-region-screenshot-mode via the SW → tab message
      // channel. This is what the popup-side "Region-screenshot mode" button
      // sends; Playwright can't click extension popup buttons directly so
      // we dispatch the same message shape here. Retry loop matches
      // image-capture.spec.ts pattern (orchestrator may not yet have its
      // onMessage listener attached at the moment data-plos-cs-active flips).
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
                kind: 'enter-region-screenshot-mode',
                pageUrl,
              });
              return;
            } catch (err) {
              lastErr = err;
              await new Promise((r) => setTimeout(r, 200));
            }
          }
          throw new Error(
            `sendMessage retry exhausted: ${String(lastErr)}`,
          );
        },
        [pl.productUrl] as const,
      );

      // ─── Assert overlay rendered ───────────────────────────────────────
      await page.waitForSelector('.plos-cs-region-screenshot-overlay', {
        timeout: 5_000,
      });
      await expect(
        page.locator('.plos-cs-region-screenshot-banner'),
      ).toBeVisible();

      // ─── Simulate the drag-rectangle gesture ──────────────────────────
      // Drag from (200, 200) to (500, 500) — a 300x300 region well within
      // the default 1280x720 Playwright viewport. The overlay listens for
      // mousedown/mousemove/mouseup on its own element which covers the
      // viewport, so page.mouse coordinates land on the overlay.
      await page.mouse.move(200, 200);
      await page.mouse.down();
      await page.mouse.move(350, 350, { steps: 5 });
      await page.mouse.move(500, 500, { steps: 5 });
      await page.mouse.up();

      // ─── Assert image-capture-form opened ──────────────────────────────
      // captureVisibleTab + decode + crop is usually <500ms; allow 5s for
      // CI variability. The form's backdrop appears once the cropped data
      // URL is ready.
      await page.waitForSelector('.plos-cs-form', { timeout: 10_000 });
      await expect(page.locator('.plos-cs-form-title')).toHaveText(
        'Add captured image to PLOS',
      );

      // URL picker populates + we select the seeded saved row explicitly.
      const urlSelect = page.locator('#plos-cs-image-url');
      await expect(urlSelect).toBeEnabled({ timeout: 5_000 });
      await urlSelect.selectOption(FAKE_URL_ID);

      // Image-category picker populates with mocked entries + "+ Add new..."
      const categorySelect = page.locator('#plos-cs-image-category');
      await expect(categorySelect).toBeEnabled({ timeout: 5_000 });
      const categoryOptions = await categorySelect
        .locator('option')
        .allTextContents();
      expect(categoryOptions).toContain('a+ content');
      expect(categoryOptions).toContain('feature module');
      expect(categoryOptions).toContain('+ Add new…');

      // Save button enabled.
      const saveBtn = page.locator('.plos-cs-form-button-primary');
      await expect(saveBtn).toBeEnabled({ timeout: 5_000 });

      // ─── Fill the form ─────────────────────────────────────────────────
      await categorySelect.selectOption('a+ content');
      await page
        .locator('#plos-cs-image-composition')
        .fill('A+ Content module — product image with overlaid feature text');
      await page
        .locator('#plos-cs-image-embedded-text')
        .fill('Now with extra strength');
      await page.locator('#plos-cs-image-tags-input').fill('a-plus');
      await page.locator('#plos-cs-image-tags-input').press('Enter');
      await page.locator('#plos-cs-image-tags-input').fill('module');
      await page.locator('#plos-cs-image-tags-input').press('Enter');

      await expect(page.locator('.plos-cs-chip')).toHaveCount(2);

      // ─── Click Save → wait for form to close ───────────────────────────
      await saveBtn.click();
      await page.waitForFunction(
        () => document.querySelector('.plos-cs-form-backdrop') === null,
        undefined,
        { timeout: 10_000 },
      );

      // ─── Assert all 3 phases fired with sourceType='region-screenshot' ─
      expect(
        phase1Body,
        `Phase 1 requestUpload was not called on ${pl.platform}`,
      ).not.toBeNull();
      expect(phase1Body).toMatchObject({
        mimeType: 'image/png',
        sourceType: 'region-screenshot',
        imageCategory: 'a+ content',
      });
      expect(typeof phase1Body!.clientId).toBe('string');
      // Cropped PNG bytes > 0; exact byte count depends on viewport
      // content but a non-empty PNG is the invariant.
      expect(
        typeof phase1Body!.fileSize === 'number' &&
          (phase1Body!.fileSize as number) > 0,
      ).toBe(true);

      expect(
        phase2Method,
        `Phase 2 PUT was not fired on ${pl.platform}`,
      ).toBe('PUT');
      expect(phase2ContentType).toBe('image/png');
      expect(phase2BodySize !== null && phase2BodySize > 0).toBe(true);

      expect(
        phase3Body,
        `Phase 3 finalize was not called on ${pl.platform}`,
      ).not.toBeNull();
      expect(phase3Body).toMatchObject({
        capturedImageId: FAKE_IMAGE_ID,
        mimeType: 'image/png',
        sourceType: 'region-screenshot',
        imageCategory: 'a+ content',
        composition: 'A+ Content module — product image with overlaid feature text',
        embeddedText: 'Now with extra strength',
        tags: ['a-plus', 'module'],
      });
      expect(phase3Body!.clientId).toBe(phase1Body!.clientId);
    });
  });
}
