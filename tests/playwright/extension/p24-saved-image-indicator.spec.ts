// Playwright extension-context regression spec for P-24 — saved-image
// indicator on the page.
//
// Coverage (single-platform amazon happy path — sufficient for v1 because
// the content-script image-scan logic is platform-independent; the per-
// platform recognition path is exercised by the existing P-22 image-capture
// + highlight-flashing specs across all four platforms):
//
//   1. Extension loads on a route-intercepted product page whose URL is
//      pre-seeded as a saved CompetitorUrl row.
//   2. The orchestrator fetches the list of saved CapturedImage rows for
//      that URL via the new `list-captured-images` bridge call.
//   3. For each saved row with a non-null originalSrcUrl, the orchestrator
//      scans the page's <img> elements; when an `<img>.currentSrc` or
//      `<img>.src` matches, a green ✓ icon appears at the image's top-right.
//   4. Images that don't match any saved row get NO icon.
//
// Auth seeding: same fake-Supabase-session pattern as image-capture.spec.ts.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_IMAGE_ID = '00000000-0000-4000-8000-000000000003';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

const PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE1234';
const SAVED_IMG_SRC =
  'https://m.media-amazon.com/images/I/fake-cool-heat-patches.jpg';
const NON_MATCHING_IMG_SRC =
  'https://m.media-amazon.com/images/I/fake-other-product.jpg';

const MOCK_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>P-24 test fixture</title></head>
<body>
  <h1>P-24 saved-image indicator harness</h1>
  <img id="saved" src="${SAVED_IMG_SRC}" width="200" height="200" alt="saved image fixture">
  <img id="unsaved" src="${NON_MATCHING_IMG_SRC}" width="200" height="200" alt="unsaved image fixture">
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

test.describe('W#2 P-24 — saved-image indicator (extension-context regression)', () => {
  test.beforeEach(async ({ context, serviceWorker }) => {
    // Seed chrome.storage with the popup-state keys the orchestrator reads
    // at attach time + the fake supabase session so authedFetch passes the
    // auth gate.
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

    // Page fulfillment.
    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_PAGE_HTML,
      });
    });
  });

  test('saved-image green ✓ overlay appears on matching <img>, NOT on non-matching <img>', async ({
    context,
  }) => {
    // Mock the PLOS API: one saved URL + one saved CapturedImage whose
    // originalSrcUrl matches the saved <img>'s src.
    await context.route(
      '**://www.vklf.com/api/projects/**/competition-scraping/urls?**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: FAKE_URL_ID,
              projectWorkflowId: 'fake-pw',
              platform: 'amazon',
              url: PRODUCT_URL,
              productName: null,
              source: 'extension',
              isSponsoredAd: false,
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      },
    );
    await context.route(
      `**://www.vklf.com/api/projects/${FAKE_PROJECT_ID}/competition-scraping/urls/${FAKE_URL_ID}/images`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: FAKE_IMAGE_ID,
              clientId: 'fake-client-1',
              competitorUrlId: FAKE_URL_ID,
              imageCategory: null,
              storagePath: 'fake/path/img.jpg',
              storageBucket: 'competition-scraping',
              originalSrcUrl: SAVED_IMG_SRC,
              composition: null,
              embeddedText: null,
              tags: [],
              sourceType: 'regular',
              fileSize: 1024,
              mimeType: 'image/jpeg',
              width: 200,
              height: 200,
              sortOrder: 0,
              source: 'extension',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              thumbnailUrl: 'https://example.com/thumb.jpg',
              fullSizeUrl: 'https://example.com/full.jpg',
            },
          ]),
        });
      },
    );
    // /api/projects (project-name lookup is best-effort) — return empty.
    await context.route(
      '**://www.vklf.com/api/projects',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: FAKE_PROJECT_ID, name: 'Test Project' },
          ]),
        });
      },
    );

    const page = await context.newPage();
    await page.goto(PRODUCT_URL);

    // Orchestrator attached.
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // P-24 icon appears (waits for the list-captured-images API call to
    // settle + scanImages to fire).
    await page.waitForSelector('.plos-cs-saved-image-icon', { timeout: 5_000 });

    // Exactly one icon — only the saved image matches.
    const iconCount = await page.evaluate(
      () => document.querySelectorAll('.plos-cs-saved-image-icon').length,
    );
    expect(iconCount).toBe(1);

    // Icon carries the matching savedImageId attribute.
    const iconAttr = await page.evaluate(
      () =>
        document
          .querySelector('.plos-cs-saved-image-icon')
          ?.getAttribute('data-plos-cs-image-icon-for') ?? null,
    );
    expect(iconAttr).toBe(FAKE_IMAGE_ID);

    // The saved <img> has the recognition flag; the unsaved <img> does not.
    const savedImgHasFlag = await page.evaluate(
      () =>
        document
          .getElementById('saved')
          ?.getAttribute('data-plos-cs-image-has-icon') ?? null,
    );
    expect(savedImgHasFlag).toBe(FAKE_IMAGE_ID);

    const unsavedImgHasFlag = await page.evaluate(
      () =>
        document
          .getElementById('unsaved')
          ?.getAttribute('data-plos-cs-image-has-icon') ?? null,
    );
    expect(unsavedImgHasFlag).toBe(null);
  });
});

// Suppress unused-import warning when readFile / path aren't reached by the
// trimmed scope above. Kept available for future slices that load fixture
// files from disk in the same shape as image-capture.spec.ts.
void readFile;
void path;
