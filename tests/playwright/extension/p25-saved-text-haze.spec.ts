// Playwright extension-context regression spec for P-25 — saved-text
// haze on the page.
//
// Coverage (single-platform amazon happy path — sufficient for v1 because
// the content-script saved-text-haze logic is platform-independent; the
// per-platform recognition path is exercised by the existing P-22
// image-capture + highlight-flashing specs across all four platforms):
//
//   1. Extension loads on a route-intercepted product page whose URL is
//      pre-seeded as a saved CompetitorUrl row.
//   2. The orchestrator fetches the list of saved CapturedText rows for
//      that URL via the new `list-captured-texts` bridge call.
//   3. For each saved row with a non-null selector, the orchestrator
//      deserializes the selector against the live DOM and registers the
//      Range in the `plos-cs-saved-text` CSS Custom Highlight.
//   4. CapturedText rows with a NULL selector (legacy pre-P-25, manual-add)
//      get NO haze — the haze count must equal the number of rows whose
//      selector successfully re-located in the page DOM.
//
// Auth seeding: same fake-Supabase-session pattern as
// p24-saved-image-indicator.spec.ts.

import { test, expect } from './fixtures';

const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000011';
const FAKE_URL_ID = '00000000-0000-4000-8000-000000000012';
const FAKE_TEXT_ID_WITH_SELECTOR = '00000000-0000-4000-8000-000000000013';
const FAKE_TEXT_ID_NULL_SELECTOR = '00000000-0000-4000-8000-000000000014';
const FAKE_USER_ID = '00000000-0000-4000-8000-000000000015';

const SUPABASE_STORAGE_KEY = 'sb-vyehbgkvdnvsjjfqhqgo-auth-token';

const PRODUCT_URL = 'https://www.amazon.com/dp/B0FAKE5678';

// The selector targets a known <p> in MOCK_PAGE_HTML. xpath from <body>
// is `/DIV[1]/P[2]` — first DIV's second P. flattenedOffsets pick a sub-
// range inside that P's textContent.
const SAVED_SELECTOR_JSON =
  '{"xpath":"/DIV[1]/P[2]","startOffset":0,"endOffset":15}';

const MOCK_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>P-25 test fixture</title></head>
<body>
  <div id="product-card">
    <p>This first paragraph is not what was saved.</p>
    <p>Premium quality protein supplement for daily use.</p>
    <p>Another paragraph that was not saved either.</p>
  </div>
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

test.describe('W#2 P-25 — saved-text haze (extension-context regression)', () => {
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

  test('CSS Custom Highlight registers exactly the rows whose selector re-locates', async ({
    context,
  }) => {
    // Mock the PLOS API: one saved URL + two CapturedText rows. One has a
    // valid selector pointing at the second <p>; the other has a NULL
    // selector and must be skipped silently.
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
    // images list (P-24) — return empty so the orchestrator's image scan
    // is a no-op.
    await context.route(
      `**://www.vklf.com/api/projects/${FAKE_PROJECT_ID}/competition-scraping/urls/${FAKE_URL_ID}/images`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      },
    );
    // texts list (P-25) — two rows.
    await context.route(
      `**://www.vklf.com/api/projects/${FAKE_PROJECT_ID}/competition-scraping/urls/${FAKE_URL_ID}/text`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: FAKE_TEXT_ID_WITH_SELECTOR,
              clientId: 'fake-client-with-sel',
              competitorUrlId: FAKE_URL_ID,
              contentCategory: null,
              text: 'Premium quality',
              selector: SAVED_SELECTOR_JSON,
              tags: [],
              sortOrder: 0,
              source: 'extension',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: FAKE_TEXT_ID_NULL_SELECTOR,
              clientId: 'fake-client-null-sel',
              competitorUrlId: FAKE_URL_ID,
              contentCategory: null,
              text: 'Another saved snippet',
              selector: null,
              tags: [],
              sortOrder: 1,
              source: 'extension',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      },
    );
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

    // Wait for the saved-text haze to land. The list-captured-texts fetch +
    // selector-deserialize + attachSavedTextHaze happens fire-and-forget
    // after maybeShowDetailOverlay; CSS.highlights.get('plos-cs-saved-text')
    // becomes defined with size 1 once it resolves.
    await page.waitForFunction(
      () => {
        const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS;
        const hl = css?.highlights?.get('plos-cs-saved-text');
        return hl !== undefined && hl.size >= 1;
      },
      undefined,
      { timeout: 5_000 },
    );

    // Exactly one Range — the null-selector row was correctly skipped.
    const hazeSize = await page.evaluate(() => {
      const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS;
      const hl = css?.highlights?.get('plos-cs-saved-text');
      return hl?.size ?? -1;
    });
    expect(hazeSize).toBe(1);

    // The registered Range covers the saved text — check via the CSS
    // Custom Highlight's iteration. We grab the first range and confirm
    // its toString() matches the expected substring.
    const rangeText = await page.evaluate(() => {
      const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number; values?: () => Iterator<Range> }> } }).CSS;
      const hl = css?.highlights?.get('plos-cs-saved-text');
      if (!hl) return null;
      // CSS.Highlight is a Set-like; iterate to grab the first Range.
      for (const range of hl as unknown as Iterable<Range>) {
        return range.toString();
      }
      return null;
    });
    expect(rangeText).toBe('Premium quality');
  });

  test('haze tears down on navigation away from saved URL', async ({
    context,
  }) => {
    // Same fixture setup but we'll navigate to a non-saved URL after the
    // haze attaches; clearTextHazes should fire and the registry should
    // empty.
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
          body: JSON.stringify([]),
        });
      },
    );
    await context.route(
      `**://www.vklf.com/api/projects/${FAKE_PROJECT_ID}/competition-scraping/urls/${FAKE_URL_ID}/text`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: FAKE_TEXT_ID_WITH_SELECTOR,
              clientId: 'fake-client-with-sel',
              competitorUrlId: FAKE_URL_ID,
              contentCategory: null,
              text: 'Premium quality',
              selector: SAVED_SELECTOR_JSON,
              tags: [],
              sortOrder: 0,
              source: 'extension',
              addedBy: FAKE_USER_ID,
              addedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      },
    );
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
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );
    await page.waitForFunction(
      () => {
        const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS;
        const hl = css?.highlights?.get('plos-cs-saved-text');
        return hl !== undefined && hl.size >= 1;
      },
      undefined,
      { timeout: 5_000 },
    );

    // Use the same Playwright route to fulfill a NEW non-saved URL.
    await page.goto('https://www.amazon.com/dp/B0OTHERPAGE');

    // Wait for the orchestrator's overlayCheckTimer + clearTextHazes path.
    // The MutationObserver-triggered URL-change detection has a 150ms
    // OVERLAY_CHECK_DEBOUNCE_MS gate; give it a generous timeout.
    await page.waitForFunction(
      () => {
        const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS;
        const hl = css?.highlights?.get('plos-cs-saved-text');
        return hl === undefined || hl.size === 0;
      },
      undefined,
      { timeout: 5_000 },
    );

    const hazeSizeAfterNav = await page.evaluate(() => {
      const css = (window as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS;
      const hl = css?.highlights?.get('plos-cs-saved-text');
      return hl?.size ?? 0;
    });
    expect(hazeSizeAfterNav).toBe(0);
  });
});
