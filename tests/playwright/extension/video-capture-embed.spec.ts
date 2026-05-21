// Playwright extension-context regression spec for the P-27 Build #6
// captured-videos right-click-on-iframe path (EMBED branch).
//
// Mirrors video-capture.spec.ts in drive shape but with the EMBED branch's
// distinct wire flow:
//
//   - Right-click an <iframe> whose src matches a recognized video-embed
//     platform (YouTube/Vimeo/Wistia/etc. per CAPTURED_VIDEOS_DESIGN.md
//     §A.6). The orchestrator's findUnderlyingVideoEmbed returns
//     `kind: 'embed'` with the platform name + iframe src.
//   - The form's "Source-kind banner" reads
//     "Recognized as Youtube — will save the embed link only."
//   - On Save: Phase 1 (`requestVideoUpload`) is SKIPPED entirely (no
//     bytes to upload). Phase 2a/2b PUTs are SKIPPED (no signed URLs
//     were minted). Only Phase 3 (`finalizeVideoUpload`) fires, with
//     sourceType='EMBED' + originalSrcUrl = the iframe.src.
//   - The video CDN is never hit (no bytes to fetch).
//
// Single-platform amazon — the embed gesture works the same way on any
// host page, since the iframe's src is what matters, not the page host.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_VIDEO_ID = '00000000-0000-4000-8000-000000000003';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

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

const PLATFORM = 'amazon' as const;
const PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE1234';
const PAGE_ROUTE_GLOB = '**://*.amazon.com/**';
const FIXTURE_PATH = 'tests/playwright/extension/amazon-video-product-page.html';

test.describe('P-27 Build #6 video-capture embed path — platform=amazon', () => {
  test('right-click <iframe> (YouTube) → form opens with embed source → Save → only Phase-3 finalize fires (no Phase-1/Phase-2)', async ({
    context,
    serviceWorker,
  }) => {
    // ─── Seed chrome.storage ─────────────────────────────────────────────
    await serviceWorker.evaluate(
      async ([projectId, platform, storageKey, sessionJson]) => {
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: platform,
          selectedProjectName: 'Fake Test Project',
          [storageKey]: sessionJson,
        });
      },
      [
        FAKE_PROJECT_ID,
        PLATFORM,
        SUPABASE_STORAGE_KEY,
        buildFakeSupabaseSession(),
      ] as const,
    );

    // ─── Tracking flags for end-of-test asserts ──────────────────────────
    let phase1Fired = false;
    let phase2Fired = false;
    let phase3Body: Record<string, unknown> | null = null;

    // ─── Route 0a: catch-all unmocked vklf.com → 404 ─────────────────────
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

    // ─── Route 0b: GET /api/projects → empty ─────────────────────────────
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

    // ─── Route 1: amazon product page → mock HTML ────────────────────────
    const html = await readFile(
      path.resolve(process.cwd(), FIXTURE_PATH),
      'utf8',
    );
    await context.route(PAGE_ROUTE_GLOB, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      });
    });

    // ─── Route 2: YouTube embed origin → 204 (don't load real player) ────
    // The fixture's iframe src points at youtube.com/embed/...; we don't
    // need the real player to load (the orchestrator only reads
    // iframe.src). Fulfill with 204 No Content to keep the page light.
    await context.route(
      /https:\/\/(www\.)?youtube\.com\/embed\/.*/,
      async (route) => {
        await route.fulfill({ status: 204, body: '' });
      },
    );

    // ─── Route 3: GET listCompetitorUrls → seeded saved URL ──────────────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        const savedUrl = {
          id: FAKE_URL_ID,
          projectWorkflowId: 'fake-workflow-id',
          platform: PLATFORM,
          url: PRODUCT_URL,
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

    // ─── Route 4: GET vocabulary?type=video-category → 1 entry ───────────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/vocabulary(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        const entries = [
          {
            id: 'vocab-1',
            projectId: FAKE_PROJECT_ID,
            vocabularyType: 'video-category',
            value: 'product demo',
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

    // ─── Route 5: POST videos/requestUpload — MUST NOT FIRE on EMBED ─────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/videos\/requestUpload$/,
      async (route, request) => {
        if (request.method() !== 'POST') {
          return route.continue();
        }
        phase1Fired = true;
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'requestUpload should not fire for EMBED rows',
          }),
        });
      },
    );

    // ─── Route 6: PUT to Supabase storage — MUST NOT FIRE on EMBED ───────
    await context.route(
      /https:\/\/vyehbgkvdnvsjjfqhqgo\.supabase\.co\/storage\/.*/,
      async (route) => {
        phase2Fired = true;
        await route.fulfill({ status: 500, body: '' });
      },
    );

    // ─── Route 7: POST videos/finalize → CapturedVideo row (EMBED) ───────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/videos\/finalize$/,
      async (route, request) => {
        if (request.method() !== 'POST') {
          return route.continue();
        }
        const raw = request.postData();
        phase3Body = raw
          ? (JSON.parse(raw) as Record<string, unknown>)
          : null;
        const row = {
          id: FAKE_VIDEO_ID,
          clientId: (phase3Body?.clientId as string) ?? 'unknown',
          competitorUrlId: FAKE_URL_ID,
          projectId: FAKE_PROJECT_ID,
          sourceType: 'EMBED',
          originalSrcUrl:
            (phase3Body?.originalSrcUrl as string) ?? YOUTUBE_EMBED_URL,
          storagePath: null,
          storageBucket: null,
          fileSize: null,
          mimeType: null,
          durationSeconds: null,
          width: null,
          height: null,
          thumbnailStoragePath: null,
          videoCategory: (phase3Body?.videoCategory as string) ?? null,
          composition: (phase3Body?.composition as string) ?? null,
          embeddedText: (phase3Body?.embeddedText as string) ?? null,
          tags: (phase3Body?.tags as string[]) ?? [],
          sortOrder: 0,
          source: 'extension',
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

    // ─── Drive: navigate, wait for content script ────────────────────────
    const page = await context.newPage();
    await page.goto(PRODUCT_URL);
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );
    await page.waitForSelector('#youtube-embed', { timeout: 5_000 });

    // Right-click on the iframe → orchestrator's capture-phase listener
    // sees event.target = <iframe id="youtube-embed">, walks
    // findUnderlyingVideoEmbed which matches the YouTube hostname pattern,
    // returns kind='embed' with src=YOUTUBE_EMBED_URL + platform='youtube'.
    await page.dispatchEvent('#youtube-embed', 'contextmenu');

    // Dispatch open-video-capture-form via SW → tab. Same retry loop as
    // image spec.
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
              kind: 'open-video-capture-form',
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
      [PRODUCT_URL] as const,
    );

    // ─── Assert form rendered with EMBED-branch source banner ────────────
    await page.waitForSelector('.plos-cs-form', { timeout: 5_000 });
    await expect(page.locator('.plos-cs-form-title')).toHaveText(
      'Add captured video to PLOS',
    );
    // The form's source-kind banner reads "Recognized as Youtube — will
    // save the embed link only." (per video-capture-form.ts:182-184 —
    // first letter is upper-cased from the platform name 'youtube').
    await expect(page.locator('.plos-cs-form-status').first()).toContainText(
      'Recognized as Youtube',
    );

    // Fill the form.
    const urlSelect = page.locator('#plos-cs-video-url');
    await expect(urlSelect).toBeEnabled({ timeout: 5_000 });
    await urlSelect.selectOption(FAKE_URL_ID);

    const categorySelect = page.locator('#plos-cs-video-category');
    await expect(categorySelect).toBeEnabled({ timeout: 5_000 });
    await categorySelect.selectOption('product demo');

    await page
      .locator('#plos-cs-video-composition')
      .fill('Brand-channel YouTube demo');

    const saveBtn = page.locator('.plos-cs-form-button-primary');
    await expect(saveBtn).toBeEnabled({ timeout: 5_000 });
    await saveBtn.click();

    await page.waitForFunction(
      () => document.querySelector('.plos-cs-form-backdrop') === null,
      undefined,
      { timeout: 10_000 },
    );

    // ─── Assert Phase 1 + Phase 2 did NOT fire ───────────────────────────
    expect(
      phase1Fired,
      'EMBED branch should NOT fire Phase 1 requestUpload',
    ).toBe(false);
    expect(
      phase2Fired,
      'EMBED branch should NOT fire Phase 2 Supabase PUT',
    ).toBe(false);

    // ─── Assert Phase 3 fired with EMBED shape ───────────────────────────
    expect(
      phase3Body,
      'Phase 3 finalizeVideoUpload was not called',
    ).not.toBeNull();
    expect(phase3Body).toMatchObject({
      sourceType: 'EMBED',
      originalSrcUrl: YOUTUBE_EMBED_URL,
      videoCategory: 'product demo',
      composition: 'Brand-channel YouTube demo',
    });
    expect(typeof phase3Body!.clientId).toBe('string');
    // EMBED rows have no Phase-1, so capturedVideoId is server-minted at
    // finalize time. The wire shape MUST NOT carry capturedVideoId on the
    // EMBED branch (per FinalizeVideoUploadRequest comment block —
    // capturedVideoId is the Phase-1 echo, omitted for EMBED).
    expect(phase3Body).not.toHaveProperty('capturedVideoId');
    expect(phase3Body).not.toHaveProperty('videoStoragePath');
    expect(phase3Body).not.toHaveProperty('thumbnailStoragePath');
  });
});
