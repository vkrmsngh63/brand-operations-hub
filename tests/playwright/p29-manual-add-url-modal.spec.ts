// W#2 P-29 Slice #1 — manual-add URL modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   UrlAddModal.tsx. Real production component rendered inside the
//   P-30 stub-page rig (tests/playwright/mounts/p29-url-modal.mount.tsx
//   + pages/p29-url-modal.html). Each test intercepts the modal's
//   POST .../urls call via page.route() to capture the body shape and
//   shape the response. authFetch's Supabase auth gate is satisfied by
//   the bundle-time alias to fake-supabase.ts (returns stub-test-token).
//
// What this file covers (UI-mechanical regression):
//   1. Button renders in the toolbar.
//   2. Click opens the modal.
//   3. Empty URL submit shows inline validation error.
//   4. Submit with required fields posts source:'manual' + selected
//      platform + url (incl. Independent Website regression).
//   5. Modal stays open + shows error on 4xx response.
//   6. Escape / backdrop / Cancel / X all close the modal.
//
// What's covered elsewhere — see the prior version of this header for
// the full out-of-scope list (route-handler DI tests, type-guard
// regression in src/lib/shared-types, director manual smoke on vklf.com).

import { test, expect, type Request, type Route } from '@playwright/test';

const PAGE_URL = '/p29-url-modal';
const POST_URL_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls(?:\?|$)/;

const fakeUrlRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'fake-url-id',
  projectId: 'test-project-id',
  platform: 'independent-website',
  url: 'https://www.example.com/product/abc',
  source: 'manual',
  createdAt: new Date('2026-05-15T00:00:00Z').toISOString(),
  ...overrides,
});

test.describe('W#2 P-29 Slice #1 — manual-add URL modal (UI mechanical)', () => {
  test('"+ Manually add URL" button renders in toolbar', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await expect(page.getByTestId('manual-add-url-button')).toBeVisible();
  });

  test('Clicking the button opens the modal', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-url-button').click();
    await expect(page.getByRole('dialog', { name: /manually add competitor url/i })).toBeVisible();
    // URL input is autofocused on open.
    await expect(page.getByLabel('URL', { exact: true })).toBeFocused();
  });

  test('Empty URL submit shows inline validation error', async ({ page }) => {
    let postCount = 0;
    await page.route(POST_URL_PATTERN, (route: Route) => {
      postCount += 1;
      void route.fulfill({ status: 201, body: JSON.stringify(fakeUrlRow()) });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-url-button').click();
    // Bypass the native HTML5 `required` block + the disabled button by
    // submitting the form via JS (mirrors the keyboard "Enter" path).
    await page.evaluate(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await expect(page.getByRole('alert')).toHaveText(/URL is required/i);
    await expect(page.getByRole('dialog', { name: /manually add competitor url/i })).toBeVisible();
    expect(postCount).toBe(0);
  });

  test('Submit with required fields posts source=manual + selected platform', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route(POST_URL_PATTERN, async (route: Route, request: Request) => {
      capturedBody = request.postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(
          fakeUrlRow({
            platform: 'independent-website',
            url: 'https://www.example.com/product/abc',
          }),
        ),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-url-button').click();

    await page.getByLabel('URL', { exact: true }).fill('https://www.example.com/product/abc');
    await page.getByLabel('Platform').selectOption('independent-website');
    await page.getByRole('button', { name: 'Save URL' }).click();

    // Modal closes on success.
    await expect(page.getByRole('dialog', { name: /manually add competitor url/i })).not.toBeVisible();

    expect(capturedBody).toMatchObject({
      source: 'manual',
      platform: 'independent-website',
      url: 'https://www.example.com/product/abc',
    });

    // onSuccess fired and the wrapper recorded the row.
    const lastRow = await page.evaluate(() => window.__test.getLastRow());
    expect(lastRow).not.toBeNull();
    expect(await page.evaluate(() => window.__test.getSuccessCount())).toBe(1);
  });

  test('Modal stays open + shows error on 4xx response', async ({ page }) => {
    await page.route(POST_URL_PATTERN, (route: Route) => {
      void route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'platform is required and must be one of the supported values' }),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-url-button').click();
    await page.getByLabel('URL', { exact: true }).fill('https://www.example.com');
    await page.getByRole('button', { name: 'Save URL' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      /platform is required and must be one of the supported values/i,
    );
    await expect(page.getByRole('dialog', { name: /manually add competitor url/i })).toBeVisible();
  });

  test('Escape / backdrop / Cancel / X all close the modal', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);

    const dialog = page.getByRole('dialog', { name: /manually add competitor url/i });

    // (a) Escape key
    await page.getByTestId('manual-add-url-button').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // (b) Cancel button
    await page.getByTestId('manual-add-url-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // (c) X (Close) button
    await page.getByTestId('manual-add-url-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // (d) Backdrop click — mousedown on the role="presentation" wrapper
    // whose target equals currentTarget closes the modal.
    await page.getByTestId('manual-add-url-button').click();
    await expect(dialog).toBeVisible();
    await page.locator('div[role="presentation"]').dispatchEvent('mousedown');
    await expect(dialog).not.toBeVisible();
  });
});
