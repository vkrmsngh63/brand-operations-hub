// Playwright extension-context regression spec for the P-27 Build #6
// captured-videos popup paste path (EMBED branch via the popup UI).
//
// Distinct from the other two Build #6 specs (which drive the content-
// script in-page form on a competitor product page): this spec drives the
// extension popup at `chrome-extension://<extensionId>/popup.html`.
//
// Wire flow on Save:
//   - The popup paste form is EMBED-ONLY (pasted URLs are never
//     DIRECT_BYTES per CapturedVideoPasteForm.tsx). So Phase 1 + Phase 2
//     never fire; only Phase 3 (`finalizeVideoUpload`) fires with
//     sourceType='EMBED' + originalSrcUrl = the pasted URL.
//   - The popup also fetches the user's Project + Platform setup state via
//     `/api/extension-state`; the spec mocks it to pre-pick the seed
//     project + amazon platform so the CapturedVideoPasteForm renders
//     immediately (gated by the SetupScreen's `showActiveSession`).

import { test, expect } from './fixtures';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000002';
const FAKE_VIDEO_ID = '00000000-0000-4000-8000-000000000003';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000004';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';
const YOUTUBE_PASTE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const PLATFORM = 'amazon' as const;
const SAVED_PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE1234';

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

test.describe('P-27 Build #6 video-paste popup path', () => {
  test('open popup → paste YouTube URL → form fields render → Save → only Phase-3 finalize fires (EMBED branch)', async ({
    context,
    serviceWorker,
    extensionId,
  }) => {
    // ─── Seed chrome.storage with auth session ───────────────────────────
    // The popup's App.tsx checks supabase.auth.getSession() on mount and
    // routes to SignInScreen vs. SetupScreen. We seed a fake session so
    // the popup lands directly on SetupScreen.
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

    // ─── Route 1: GET /api/extension-state → pre-picked project + platform
    // The popup's loadExtensionState hits this first to hydrate the
    // SetupScreen's project + platform pickers. Returning the seed values
    // makes the SetupScreen skip the "pick a project" prompt and render
    // the paste forms directly.
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/extension-state$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            selectedProjectId: FAKE_PROJECT_ID,
            selectedPlatform: PLATFORM,
          }),
        });
      },
    );

    // ─── Route 2: GET /api/projects → list with the seed project ─────────
    // The ProjectPicker reads this to populate its dropdown; the
    // pre-picked project must be in the list to render as selected.
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects(\?.*)?$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: FAKE_PROJECT_ID,
              name: 'Fake Test Project',
            },
          ]),
        });
      },
    );

    // ─── Route 3: GET highlight-terms → empty (popup loads them on mount)
    await context.route(
      /https:\/\/(www\.)?vklf\.com\/api\/projects\/[^/]+\/extension-state\/highlight-terms$/,
      async (route, request) => {
        if (request.method() !== 'GET') {
          return route.continue();
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terms: [] }),
        });
      },
    );

    // ─── Route 4: GET listCompetitorUrls → seeded saved URL ──────────────
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
          url: SAVED_PRODUCT_URL,
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

    // ─── Route 5: GET vocabulary?type=video-category → 1 entry ───────────
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

    // ─── Route 6: POST videos/requestUpload — MUST NOT FIRE on popup path
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
            error: 'requestUpload should not fire on popup paste path',
          }),
        });
      },
    );

    // ─── Route 7: PUT Supabase storage — MUST NOT FIRE on popup path ─────
    await context.route(
      /https:\/\/vyehbgkvdnvsjjfqhqgo\.supabase\.co\/storage\/.*/,
      async (route) => {
        phase2Fired = true;
        await route.fulfill({ status: 500, body: '' });
      },
    );

    // ─── Route 8: POST videos/finalize → CapturedVideo row (EMBED) ───────
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
            (phase3Body?.originalSrcUrl as string) ?? YOUTUBE_PASTE_URL,
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

    // ─── Drive: open the popup ───────────────────────────────────────────
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);

    // Wait for the CapturedVideoPasteForm to render (it lives inside the
    // SetupScreen → only renders when projectId + platform are both
    // hydrated). The form's heading "Paste captured video" is the
    // distinguishing landmark.
    await popup.waitForSelector('section.captured-video-paste h2', {
      timeout: 10_000,
    });
    await expect(
      popup.locator('section.captured-video-paste h2'),
    ).toHaveText('Paste captured video');

    // ─── Fill the form ───────────────────────────────────────────────────
    await popup.locator('#video-paste-url').fill(YOUTUBE_PASTE_URL);

    const attachSelect = popup.locator('#video-paste-attach-url');
    await expect(attachSelect).toBeEnabled({ timeout: 5_000 });
    const attachOptions = await attachSelect
      .locator('option')
      .evaluateAll((opts) =>
        (opts as HTMLOptionElement[]).map((o) => o.value),
      );
    expect(attachOptions).toContain(FAKE_URL_ID);
    await attachSelect.selectOption(FAKE_URL_ID);

    const categorySelect = popup.locator('#video-paste-category');
    await expect(categorySelect).toBeEnabled({ timeout: 5_000 });
    await categorySelect.selectOption('product demo');

    await popup
      .locator('#video-paste-composition')
      .fill('YouTube product demo from the brand channel');

    // ─── Click Save → wait for success banner ────────────────────────────
    // CapturedVideoPasteForm.tsx surfaces a success status with text
    // "Captured." after the finalize call resolves. We wait on that text
    // rather than form-close (the popup paste form stays mounted on
    // success — only the form fields reset).
    await popup
      .locator('section.captured-video-paste button[type="submit"]')
      .click();

    await expect(
      popup.locator('section.captured-video-paste [role="status"]'),
    ).toContainText('Captured.', { timeout: 10_000 });

    // ─── Assert Phase 1 + Phase 2 did NOT fire ───────────────────────────
    expect(
      phase1Fired,
      'popup paste path should NOT fire Phase 1 requestUpload (EMBED only)',
    ).toBe(false);
    expect(
      phase2Fired,
      'popup paste path should NOT fire Phase 2 Supabase PUT (EMBED only)',
    ).toBe(false);

    // ─── Assert Phase 3 fired with EMBED shape ───────────────────────────
    expect(
      phase3Body,
      'Phase 3 finalizeVideoUpload was not called',
    ).not.toBeNull();
    expect(phase3Body).toMatchObject({
      sourceType: 'EMBED',
      originalSrcUrl: YOUTUBE_PASTE_URL,
      videoCategory: 'product demo',
      composition: 'YouTube product demo from the brand channel',
    });
    expect(typeof phase3Body!.clientId).toBe('string');
    expect(phase3Body).not.toHaveProperty('capturedVideoId');
    expect(phase3Body).not.toHaveProperty('videoStoragePath');
    expect(phase3Body).not.toHaveProperty('thumbnailStoragePath');
  });
});
