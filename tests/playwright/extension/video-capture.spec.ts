// Playwright extension-context regression spec for the P-27 Build #6
// captured-videos right-click-on-<video> happy path (DIRECT_BYTES branch).
//
// Mirrors image-capture.spec.ts in structure + drive pattern, with two
// structural differences specific to video:
//
//   1. The orchestrator's `open-video-capture-form` handler ONLY consumes
//      `lastRightClickVideoResult` (populated by the capture-phase
//      contextmenu listener on the page). There is NO `msg.srcUrl` fallback
//      analogous to the image flow. So the spec MUST dispatch a real
//      contextmenu event on the <video> element BEFORE telling the SW to
//      send the open-video-capture-form message — that populates the
//      orchestrator's snapshot the open handler then reads.
//
//   2. Phase 1 (`requestVideoUpload`) returns TWO signed URLs per
//      CAPTURED_VIDEOS_DESIGN.md §A.9 — one for video bytes, one for the
//      thumbnail JPEG. The spec mocks both Supabase PUT endpoints. Per the
//      §A.12 fallback ("save never fails because of thumbnail issues"),
//      the canvas frame-grab may return NULL in the headless test
//      environment (the <video> element may not reach readyState >= 2
//      against mocked bytes), in which case Phase 2b is skipped and
//      finalize omits thumbnailStoragePath. Both paths are correct; the
//      spec asserts the load-bearing Phase 1 + Phase 2 video bytes + Phase
//      3 with sourceType='DIRECT_BYTES'.
//
// Single-platform amazon per design doc §A.13 Hybrid test-coverage
// approach. Cross-platform extension to ebay + etsy + walmart is deferred
// to a future P-22-style follow-up.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_VIDEO_ID = '00000000-0000-4000-8000-000000000003';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';
const FAKE_VIDEO_UPLOAD_URL =
  'https://vyehbgkvdnvsjjfqhqgo.supabase.co/storage/v1/object/sign/competition-scraping-videos/fake-video?token=fake-video-token';
const FAKE_THUMBNAIL_UPLOAD_URL =
  'https://vyehbgkvdnvsjjfqhqgo.supabase.co/storage/v1/object/sign/competition-scraping-videos/fake-thumbnail?token=fake-thumb-token';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

// Tiny placeholder MP4-shaped buffer. The bytes don't need to decode as
// real MP4 — the spec route-intercepts the CDN to fulfill the GET, and
// the background's fetchVideoBytes() reads Content-Type to resolve MIME.
// The Supabase PUT route also doesn't validate body shape.
const FAKE_MP4_BYTES = Buffer.from(
  'MOCK_MP4_BYTES_FOR_PLAYWRIGHT_TESTING_xxxxxxxxxx',
  'utf8',
);

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
const VIDEO_CDN_ROUTE_GLOB = '**://*.media-amazon.com/**';

test.describe('P-27 Build #6 video-capture happy path — platform=amazon', () => {
  test('right-click <video> → form renders → fill → Save → Phase-1 + Phase-2 (video bytes) + Phase-3 fire; form closes', async ({
    context,
    serviceWorker,
  }) => {
    // ─── Seed chrome.storage with auth session + popup-state keys ────────
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

    // ─── Closures to capture API request bodies for end-of-test asserts ──
    let phase1Body: Record<string, unknown> | null = null;
    let phase2VideoMethod: string | null = null;
    let phase2VideoContentType: string | null = null;
    let phase2VideoBodySize: number | null = null;
    let phase2ThumbnailFired = false;
    let phase2ThumbnailMethod: string | null = null;
    let phase2ThumbnailContentType: string | null = null;
    let phase3Body: Record<string, unknown> | null = null;

    // ─── Route 0a: catch-all for unmocked vklf.com paths → 404 ───────────
    // Registered FIRST so specific routes below take priority (Playwright
    // matches routes in REVERSE registration order). Mirrors image-capture
    // spec.
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

    // ─── Route 0b: GET /api/projects → empty array (orchestrator init) ───
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

    // ─── Route 2: amazon video CDN → fake MP4 bytes ──────────────────────
    // Both the <video> element's metadata-load AND the background's
    // fetchVideoBytes() PHASE-0 GET hit this route. The latter reads
    // Content-Type to resolve MIME → drives Phase 1's mimeType.
    await context.route(VIDEO_CDN_ROUTE_GLOB, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'video/mp4',
        body: FAKE_MP4_BYTES,
      });
    });

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

    // ─── Route 4: GET vocabulary?type=video-category → 2 entries ─────────
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
          {
            id: 'vocab-2',
            projectId: FAKE_PROJECT_ID,
            vocabularyType: 'video-category',
            value: 'customer review',
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

    // ─── Route 5: POST videos/requestUpload (Phase 1) → 2 signed URLs ────
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/videos\/requestUpload$/,
      async (route, request) => {
        if (request.method() !== 'POST') {
          return route.continue();
        }
        const raw = request.postData();
        phase1Body = raw
          ? (JSON.parse(raw) as Record<string, unknown>)
          : null;
        const response = {
          capturedVideoId: FAKE_VIDEO_ID,
          videoUploadUrl: FAKE_VIDEO_UPLOAD_URL,
          videoStoragePath: `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_VIDEO_ID}.mp4`,
          videoToken: 'fake-video-token',
          thumbnailUploadUrl: FAKE_THUMBNAIL_UPLOAD_URL,
          thumbnailStoragePath: `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_VIDEO_ID}.jpg`,
          thumbnailToken: 'fake-thumb-token',
          expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
        };
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response),
        });
      },
    );

    // ─── Route 6a: PUT to fake Supabase video signed URL (Phase 2a) → 200
    await context.route(
      /https:\/\/vyehbgkvdnvsjjfqhqgo\.supabase\.co\/storage\/.*fake-video.*/,
      async (route, request) => {
        phase2VideoMethod = request.method();
        phase2VideoContentType = request.headers()['content-type'] ?? null;
        const raw = request.postDataBuffer();
        phase2VideoBodySize = raw ? raw.length : null;
        await route.fulfill({ status: 200, body: '' });
      },
    );

    // ─── Route 6b: PUT to fake Supabase thumbnail signed URL (Phase 2b) ──
    // May or may not fire depending on whether the headless canvas frame-
    // grab succeeded (§A.12 NULL-thumbnail fallback). Tracked as
    // informational; not strictly asserted.
    await context.route(
      /https:\/\/vyehbgkvdnvsjjfqhqgo\.supabase\.co\/storage\/.*fake-thumbnail.*/,
      async (route, request) => {
        phase2ThumbnailFired = true;
        phase2ThumbnailMethod = request.method();
        phase2ThumbnailContentType = request.headers()['content-type'] ?? null;
        await route.fulfill({ status: 200, body: '' });
      },
    );

    // ─── Route 7: POST videos/finalize (Phase 3) → CapturedVideo row ─────
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
          sourceType: 'DIRECT_BYTES',
          originalSrcUrl:
            (phase3Body?.originalSrcUrl as string) ??
            'https://m.media-amazon.com/videos/fake-product-demo.mp4',
          storagePath: `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_VIDEO_ID}.mp4`,
          storageBucket: 'competition-scraping-videos',
          fileSize: FAKE_MP4_BYTES.length,
          mimeType: 'video/mp4',
          durationSeconds: null,
          width: null,
          height: null,
          thumbnailStoragePath:
            (phase3Body?.thumbnailStoragePath as string | undefined) ?? null,
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

    // ─── Drive: navigate, wait for content script, contextmenu, open form ─
    const page = await context.newPage();
    await page.goto(PRODUCT_URL);

    // Orchestrator's attach signal: data-plos-cs-active=1 on document.body.
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // Wait for the <video> to be in the DOM. The orchestrator's contextmenu
    // listener is attached at capture phase on `document`; for
    // findUnderlyingVideoEmbed to find the element we just need it in the
    // DOM (no need to wait for media load — readDirectFromVideo reads
    // video.src directly per find-underlying-video-embed.ts:140).
    await page.waitForSelector('#hero-video', { timeout: 5_000 });

    // Dispatch contextmenu on the <video> — this fires the orchestrator's
    // capture-phase `onContextMenu` listener, which calls
    // findUnderlyingVideoEmbed(event.target) and stores the result in
    // `lastRightClickVideoResult`. The next open-video-capture-form
    // message consumes that snapshot.
    await page.dispatchEvent('#hero-video', 'contextmenu');

    // Now dispatch open-video-capture-form via the SW → tab message
    // channel — mirrors what background.ts:222 sends when the user picks
    // "Add to PLOS — Captured Video" from the contextMenu. Retry loop
    // mirrors image spec (orchestrator's chrome.runtime.onMessage listener
    // attaches AFTER several awaits sit between data-plos-cs-active=1 and
    // listener registration).
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

    // ─── Assert form rendered with expected fields ───────────────────────
    await page.waitForSelector('.plos-cs-form', { timeout: 5_000 });
    await expect(page.locator('.plos-cs-form-title')).toHaveText(
      'Add captured video to PLOS',
    );

    // Saved-URL picker populates with the mocked saved row.
    const urlSelect = page.locator('#plos-cs-video-url');
    await expect(urlSelect).toBeEnabled({ timeout: 5_000 });
    const urlOptionValues = await urlSelect
      .locator('option')
      .evaluateAll((opts) =>
        (opts as HTMLOptionElement[]).map((o) => o.value),
      );
    expect(urlOptionValues).toContain(FAKE_URL_ID);
    await urlSelect.selectOption(FAKE_URL_ID);

    // Video-category picker populates with the 2 mocked entries +
    // "+ Add new..." sentinel.
    const categorySelect = page.locator('#plos-cs-video-category');
    await expect(categorySelect).toBeEnabled({ timeout: 5_000 });
    const categoryOptions = await categorySelect
      .locator('option')
      .allTextContents();
    expect(categoryOptions).toContain('product demo');
    expect(categoryOptions).toContain('customer review');
    expect(categoryOptions).toContain('+ Add new…');

    // Save button enabled (both lists loaded).
    const saveBtn = page.locator('.plos-cs-form-button-primary');
    await expect(saveBtn).toBeEnabled({ timeout: 5_000 });

    // ─── Fill the form ───────────────────────────────────────────────────
    await categorySelect.selectOption('product demo');
    await page
      .locator('#plos-cs-video-composition')
      .fill('30-second product demo showing wireless setup');
    await page
      .locator('#plos-cs-video-embedded-text')
      .fill('Equate Cool Heat — Extra Strength');
    await page.locator('#plos-cs-video-tags-input').fill('equate');
    await page.locator('#plos-cs-video-tags-input').press('Enter');
    await page.locator('#plos-cs-video-tags-input').fill('demo');
    await page.locator('#plos-cs-video-tags-input').press('Enter');

    await expect(page.locator('.plos-cs-chip')).toHaveCount(2);

    // ─── Click Save → wait for form to close ─────────────────────────────
    await saveBtn.click();
    await page.waitForFunction(
      () => document.querySelector('.plos-cs-form-backdrop') === null,
      undefined,
      { timeout: 10_000 },
    );

    // ─── Assert Phase 1 fired with the right shape ───────────────────────
    expect(phase1Body, 'Phase 1 requestVideoUpload was not called').not.toBeNull();
    expect(phase1Body).toMatchObject({
      mimeType: 'video/mp4',
      fileSize: FAKE_MP4_BYTES.length,
    });
    expect(typeof phase1Body!.clientId).toBe('string');

    // ─── Assert Phase 2a (video bytes PUT) fired with the right shape ────
    expect(
      phase2VideoMethod,
      'Phase 2 video-bytes PUT was not fired',
    ).toBe('PUT');
    expect(phase2VideoContentType).toBe('video/mp4');
    expect(phase2VideoBodySize).toBe(FAKE_MP4_BYTES.length);

    // ─── Assert Phase 2b (thumbnail PUT) — informational only ────────────
    // The canvas frame-grab may not succeed in the headless test
    // environment (video element may not reach readyState >= 2 against
    // mocked bytes). §A.12 NULL-thumbnail fallback is acceptable; the
    // spec doesn't strictly require thumbnail upload. If it DID fire,
    // verify the Content-Type was image/jpeg.
    if (phase2ThumbnailFired) {
      expect(phase2ThumbnailMethod).toBe('PUT');
      expect(phase2ThumbnailContentType).toBe('image/jpeg');
    }

    // ─── Assert Phase 3 (finalize) fired with the right DIRECT_BYTES shape
    expect(
      phase3Body,
      'Phase 3 finalizeVideoUpload was not called',
    ).not.toBeNull();
    expect(phase3Body).toMatchObject({
      sourceType: 'DIRECT_BYTES',
      capturedVideoId: FAKE_VIDEO_ID,
      mimeType: 'video/mp4',
      fileSize: FAKE_MP4_BYTES.length,
      videoCategory: 'product demo',
      composition: '30-second product demo showing wireless setup',
      embeddedText: 'Equate Cool Heat — Extra Strength',
      tags: ['equate', 'demo'],
    });
    expect(phase3Body!.clientId).toBe(phase1Body!.clientId);
    expect(phase3Body!.videoStoragePath).toBe(
      `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_VIDEO_ID}.mp4`,
    );
    // §A.12: when the thumbnail PUT didn't fire, finalize MUST omit
    // thumbnailStoragePath (server then stores NULL); when it did fire,
    // the path is present.
    if (phase2ThumbnailFired) {
      expect(phase3Body!.thumbnailStoragePath).toBe(
        `${FAKE_PROJECT_ID}/${FAKE_URL_ID}/${FAKE_VIDEO_ID}.jpg`,
      );
    } else {
      expect(phase3Body).not.toHaveProperty('thumbnailStoragePath');
    }
  });
});
