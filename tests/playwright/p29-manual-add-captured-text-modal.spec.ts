// W#2 P-29 Slice #2 — manual-add captured-text modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   CapturedTextAddModal.tsx. Real production component rendered inside
//   the P-30 stub-page rig (tests/playwright/mounts/p29-text-modal.mount.tsx
//   + pages/p29-text-modal.html). Each test intercepts the modal's POST
//   .../urls/[urlId]/text call via page.route() to capture body shape +
//   shape the response. The wrapper component owns a captured-text list
//   that mirrors UrlDetailContent.handleTextAdded — including the
//   clientId-dedup path the last test exercises.
//
// What this file covers:
//   1. Button renders in section header.
//   2. Click opens the modal + autofocuses Text textarea.
//   3. Empty Text submit shows inline validation error + no POST.
//   4. Submit with required field posts source:'manual' + UUID4 clientId
//      + text; modal closes; new row prepended to the list.
//   5. Submit with optional fields serializes contentCategory + parsed
//      tags (comma-split + whitespace-trim + empty-drop).
//   6. Modal stays open + shows error on 4xx response.
//   7. Escape / backdrop / Cancel / X all close the modal.
//   8. clientId-dedup: duplicate-create 200 response replaces existing
//      row in place rather than prepending a second copy.

import { test, expect, type Request, type Route } from '@playwright/test';

const PAGE_URL = '/p29-text-modal';
const POST_TEXT_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/text(?:\?|$)/;
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const fakeTextRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'fake-text-id',
  urlId: 'test-url-id',
  clientId: 'fake-client-id',
  text: 'fake text',
  source: 'manual',
  contentCategory: null,
  tags: [],
  createdAt: new Date('2026-05-15T00:00:00Z').toISOString(),
  ...overrides,
});

test.describe('W#2 P-29 Slice #2 — manual-add captured-text modal (UI mechanical)', () => {
  test('"+ Manually add captured text" button renders in section header', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await expect(page.getByTestId('manual-add-captured-text-button')).toBeVisible();
  });

  test('Clicking the button opens the modal + autofocuses Text', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-text-button').click();
    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).toBeVisible();
    await expect(page.getByLabel('Text', { exact: true })).toBeFocused();
  });

  test('Empty Text submit shows inline validation error', async ({ page }) => {
    let postCount = 0;
    await page.route(POST_TEXT_PATTERN, (route: Route) => {
      postCount += 1;
      void route.fulfill({ status: 201, body: JSON.stringify(fakeTextRow()) });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-text-button').click();

    // Bypass disabled-button + required-textarea by dispatching submit.
    await page.evaluate(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    await expect(page.getByRole('alert')).toHaveText(/Text is required/i);
    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).toBeVisible();
    expect(postCount).toBe(0);
  });

  test('Submit with required field posts source=manual + clientId + text', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route(POST_TEXT_PATTERN, async (route: Route, request: Request) => {
      capturedBody = request.postDataJSON();
      const body = capturedBody as { clientId: string; text: string };
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(
          fakeTextRow({ clientId: body.clientId, text: body.text }),
        ),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-text-button').click();

    const sample = 'This is a benchmark headline I captured manually.';
    await page.getByLabel('Text', { exact: true }).fill(sample);
    await page.getByRole('button', { name: 'Save captured text' }).click();

    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).not.toBeVisible();

    expect(capturedBody).toMatchObject({
      source: 'manual',
      text: sample,
    });
    const body = capturedBody as { clientId: string } | null;
    expect(body?.clientId).toMatch(UUID_V4_REGEX);

    // List prepended with the new row.
    const rowText = await page.getByTestId('captured-text-row').first().textContent();
    expect(rowText).toContain(sample);
    expect(await page.evaluate(() => window.__testText.getSuccessCount())).toBe(1);
  });

  test('Submit with optional fields serializes contentCategory + parsed tags', async ({ page }) => {
    let capturedBody: Record<string, unknown> | null = null;
    await page.route(POST_TEXT_PATTERN, async (route: Route, request: Request) => {
      capturedBody = request.postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(fakeTextRow({ text: 'Bullet copy' })),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-text-button').click();

    await page.getByLabel('Text', { exact: true }).fill('Bullet copy');
    // Content Category is the VocabularyPicker; its input doesn't have a
    // distinct aria-label but the wrapping <label> text matches.
    await page.locator('label:has-text("Content Category") input').fill('bullet');
    await page.getByLabel('Tags').fill('headline, bullet, review-quote, ');
    await page.getByRole('button', { name: 'Save captured text' }).click();

    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).not.toBeVisible();

    expect(capturedBody).toMatchObject({
      contentCategory: 'bullet',
      tags: ['headline', 'bullet', 'review-quote'],
    });
  });

  test('Modal stays open + shows error on 4xx response', async ({ page }) => {
    await page.route(POST_TEXT_PATTERN, (route: Route) => {
      void route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'source must be one of: extension, manual' }),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-text-button').click();
    await page.getByLabel('Text', { exact: true }).fill('Test text');
    await page.getByRole('button', { name: 'Save captured text' }).click();

    await expect(page.getByRole('alert')).toHaveText(/source must be one of: extension, manual/i);
    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).toBeVisible();
  });

  test('Escape / backdrop / Cancel / X all close the modal', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    const dialog = page.getByRole('dialog', { name: /manually add captured text/i });

    // Escape
    await page.getByTestId('manual-add-captured-text-button').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Cancel
    await page.getByTestId('manual-add-captured-text-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // X
    await page.getByTestId('manual-add-captured-text-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // Backdrop
    await page.getByTestId('manual-add-captured-text-button').click();
    await expect(dialog).toBeVisible();
    await page.locator('div[role="presentation"]').dispatchEvent('mousedown');
    await expect(dialog).not.toBeVisible();
  });

  test('clientId-dedup — duplicate-create 200 response replaces existing row in-place', async ({ page }) => {
    const FIXED_CLIENT_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

    // Seed the wrapper with a row sharing the fixed clientId.
    await page.addInitScript((cid) => {
      window.__testTextParams = {
        seedRows: [
          {
            id: 'seeded-row-id',
            urlId: 'test-url-id',
            clientId: cid,
            text: 'OLD seeded value',
            source: 'manual',
            contentCategory: null,
            tags: [],
            createdAt: '2026-05-14T00:00:00Z',
          },
        ],
      } as Window['__testTextParams'];
      // Pin crypto.randomUUID() so the modal submits with the fixed clientId.
      const orig = window.crypto.randomUUID.bind(window.crypto);
      window.crypto.randomUUID = (() => cid) as typeof orig;
    }, FIXED_CLIENT_ID);

    await page.route(POST_TEXT_PATTERN, async (route: Route) => {
      // Server returns the existing row (idempotent duplicate-create path).
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          fakeTextRow({
            id: 'seeded-row-id',
            clientId: FIXED_CLIENT_ID,
            text: 'NEW submitted value',
          }),
        ),
      });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    // Pre-check: list shows one row with the seeded text.
    await expect(page.getByTestId('captured-text-row')).toHaveCount(1);

    await page.getByTestId('manual-add-captured-text-button').click();
    await page.getByLabel('Text', { exact: true }).fill('NEW submitted value');
    await page.getByRole('button', { name: 'Save captured text' }).click();

    await expect(page.getByRole('dialog', { name: /manually add captured text/i })).not.toBeVisible();

    // Still exactly one row, in-place replaced with the new text.
    const rows = page.getByTestId('captured-text-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('NEW submitted value');
    await expect(rows.first()).toHaveAttribute('data-client-id', FIXED_CLIENT_ID);
  });
});
