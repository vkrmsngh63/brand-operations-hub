// W#2 P-29 Slice #3 — manual-add captured-image modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   CapturedImageAddModal.tsx. Real production component rendered inside
//   the P-30 stub-page rig (tests/playwright/mounts/p29-image-modal.mount.tsx
//   + pages/p29-image-modal.html). Three input modalities exercised:
//   drag-drop, clipboard paste, URL fetch. Submit converges through
//   either a 3-phase pipeline (requestUpload → signed-URL PUT → finalize)
//   for local bytes or a 1-phase finalize-only pipeline for URL fetch.
//
// Coverage:
//   1.  Button renders in section header.
//   2.  Click opens modal (dropzone + URL input visible).
//   3.  Submit-disabled when no image loaded.
//   4.  Drag-drop valid JPEG populates preview.
//   5.  Drag-drop oversize image shows inline error.
//   6.  Drag-drop non-image file shows inline error.
//   7.  Multi-file drop loads first + shows warning.
//   8.  Paste-from-clipboard loads image.
//   9.  URL fetch — 200 populates preview.
//   10. URL fetch — 403 SSRF block shows inline error.
//   11. URL fetch — client-side reject of bare-domain input.
//   12. Submit (drag-drop path) posts requestUpload + PUT + finalize.
//   13. Submit (URL path) skips Phase 1+2 + only posts finalize.
//   14. refreshImages fires after successful save.
//   15. Modal stays open + shows error on finalize 4xx.
//   16. Escape + backdrop + Cancel + X dismiss.
//   17. "Replace…" clears loaded image + returns to idle.

import { test, expect, type Request, type Route } from '@playwright/test';

const PAGE_URL = '/p29-image-modal';
const REQUEST_UPLOAD_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images\/requestUpload(?:\?|$)/;
const FINALIZE_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images\/finalize(?:\?|$)/;
const FETCH_BY_URL_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images\/fetch-by-url(?:\?|$)/;
const IMAGES_LIST_PATTERN = /\/api\/projects\/[^/]+\/competition-scraping\/urls\/[^/]+\/images(?:\?|$)/;
const SIGNED_PUT_URL = 'http://127.0.0.1:7891/__fake-signed-put-url';

const FAKE_CAPTURED_IMAGE_ID = 'fake-captured-img-id';
const FAKE_STORAGE_PATH = 'fake/storage/path.jpg';

const fakeImageRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'fake-image-row-id',
  urlId: 'test-url-id',
  clientId: 'fake-image-client-id',
  capturedImageId: FAKE_CAPTURED_IMAGE_ID,
  storagePath: FAKE_STORAGE_PATH,
  mimeType: 'image/jpeg',
  fileSize: 1024,
  source: 'manual',
  sourceType: 'regular',
  imageCategory: null,
  composition: null,
  embeddedText: null,
  tags: [],
  createdAt: new Date('2026-05-15T00:00:00Z').toISOString(),
  ...overrides,
});

// Build a DataTransfer containing one or more synthetic files of the
// given (mimeType, size, filename) shape. Returns a JSHandle the caller
// passes to dispatchEvent.
async function makeDataTransfer(
  page: import('@playwright/test').Page,
  files: { name: string; mimeType: string; size: number }[],
) {
  return page.evaluateHandle((fileSpecs) => {
    const dt = new DataTransfer();
    for (const spec of fileSpecs) {
      const buf = new Uint8Array(spec.size);
      const file = new File([buf], spec.name, { type: spec.mimeType });
      dt.items.add(file);
    }
    return dt;
  }, files);
}

test.describe('W#2 P-29 Slice #3 — manual-add captured-image modal (UI mechanical)', () => {
  test('"+ Manually add captured image" button renders in section header', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await expect(page.getByTestId('manual-add-captured-image-button')).toBeVisible();
  });

  test('Clicking the button opens the modal (dropzone + URL input visible)', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(page.getByRole('dialog', { name: /manually add captured image/i })).toBeVisible();
    await expect(page.getByTestId('image-drop-zone')).toBeVisible();
    await expect(page.getByLabel('Image URL')).toBeVisible();
    await expect(page.getByTestId('fetch-by-url-button')).toBeVisible();
  });

  test('Submit-disabled when no image is loaded', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(page.getByTestId('captured-image-add-modal-submit')).toBeDisabled();

    // Adding optional metadata should not enable submit.
    await page.getByLabel('Composition').fill('hero-shot');
    await expect(page.getByTestId('captured-image-add-modal-submit')).toBeDisabled();
  });

  test('Drag-drop a valid JPEG populates the preview', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'product.jpg', mimeType: 'image/jpeg', size: 8 * 1024 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });

    // Dropzone disappears, preview <img> appears.
    await expect(page.getByTestId('image-drop-zone')).toHaveCount(0);
    const preview = page.locator('img[alt="product.jpg"]');
    await expect(preview).toBeVisible();
    const src = await preview.getAttribute('src');
    expect(src).toMatch(/^blob:/);
    await expect(page.locator('img[alt="product.jpg"]').locator('..').locator('..')).toContainText('image/jpeg');
    await expect(page.locator('img[alt="product.jpg"]').locator('..').locator('..')).toContainText('product.jpg');
  });

  test('Drag-drop an oversize image shows inline error', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'huge.jpg', mimeType: 'image/jpeg', size: 6 * 1024 * 1024 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });

    await expect(page.getByRole('alert')).toContainText(/exceeds the 5 MB cap/i);
    // No preview — modal stays in idle state.
    await expect(page.getByTestId('image-drop-zone')).toBeVisible();
  });

  test('Drag-drop a non-image file shows inline error', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'notes.txt', mimeType: 'text/plain', size: 64 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });

    await expect(page.getByRole('alert')).toContainText(/isn't supported/i);
    await expect(page.getByTestId('image-drop-zone')).toBeVisible();
  });

  test('Multi-file drop loads the first + shows warning', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'first.png', mimeType: 'image/png', size: 4 * 1024 },
      { name: 'second.jpg', mimeType: 'image/jpeg', size: 4 * 1024 },
      { name: 'third.webp', mimeType: 'image/webp', size: 4 * 1024 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });

    await expect(page.getByRole('status')).toContainText(/3 files dropped — only the first will be used/i);
    await expect(page.locator('img[alt="first.png"]')).toBeVisible();
  });

  test('Paste-from-clipboard event loads image', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    // Dispatch a paste event on document with a synthetic clipboardData
    // carrying a single image/png file. The modal's listener reads items
    // off clipboardData and calls tryLoadFile.
    await page.evaluate(() => {
      const buf = new Uint8Array(2 * 1024);
      const file = new File([buf], 'pasted.png', { type: 'image/png' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const ev = new ClipboardEvent('paste', {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(ev);
    });

    // Pasted files don't carry a filename in the modal's preview alt text
    // (the modal omits filename for paste path), so assert via the
    // generic alt and mime metadata.
    await expect(page.locator('img[alt="Captured image preview"]')).toBeVisible();
  });

  test('URL fetch — successful 200 populates preview', async ({ page }) => {
    const previewUrl = 'http://127.0.0.1:7891/__fake-preview.png';
    await page.route(FETCH_BY_URL_PATTERN, (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          capturedImageId: FAKE_CAPTURED_IMAGE_ID,
          storagePath: FAKE_STORAGE_PATH,
          mimeType: 'image/png',
          fileSize: 2048,
          previewUrl,
        }),
      }),
    );
    // The preview <img> will try to GET the previewUrl; stub it with a 1x1 PNG.
    await page.route(previewUrl, (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(
          '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c63000100000005000100' +
            '5d0bf8270000000049454e44ae426082',
          'hex',
        ),
      }),
    );

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await page.getByLabel('Image URL').fill('https://example.com/img.png');
    await page.getByTestId('fetch-by-url-button').click();

    const img = page.locator('img[alt="Captured image preview"]');
    await expect(img).toBeVisible();
    expect(await img.getAttribute('src')).toBe(previewUrl);
    await expect(page.getByText(/fetched from URL/i)).toBeVisible();
  });

  test('URL fetch — 403 SSRF block shows inline error', async ({ page }) => {
    const sslMessage = 'That URL points to a private/internal address and is not allowed.';
    await page.route(FETCH_BY_URL_PATTERN, (route: Route) =>
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: sslMessage, reason: 'private-v4' }),
      }),
    );

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await page.getByLabel('Image URL').fill('https://10.0.0.1/image.png');
    await page.getByTestId('fetch-by-url-button').click();

    await expect(page.getByRole('alert')).toContainText(sslMessage);
    await expect(page.locator('img[alt="Captured image preview"]')).toHaveCount(0);
  });

  test('URL fetch — client-side reject of bare-domain input', async ({ page }) => {
    let postCount = 0;
    await page.route(FETCH_BY_URL_PATTERN, (route: Route) => {
      postCount += 1;
      void route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await page.getByLabel('Image URL').fill('example.com/img.png');
    await page.getByTestId('fetch-by-url-button').click();

    await expect(page.getByRole('alert')).toContainText(/must start with http:\/\/ or https:\/\//i);
    expect(postCount).toBe(0);
  });

  test('Submit (drag-drop path) posts requestUpload + PUT + finalize', async ({ page }) => {
    const capturedRequestUploadBody: Record<string, unknown>[] = [];
    const capturedFinalizeBody: Record<string, unknown>[] = [];
    let putCalled = 0;
    let putBodyLength = 0;

    await page.route(REQUEST_UPLOAD_PATTERN, async (route: Route, request: Request) => {
      capturedRequestUploadBody.push(request.postDataJSON());
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: SIGNED_PUT_URL,
          capturedImageId: FAKE_CAPTURED_IMAGE_ID,
          storagePath: FAKE_STORAGE_PATH,
        }),
      });
    });
    await page.route(SIGNED_PUT_URL, async (route: Route, request: Request) => {
      putCalled += 1;
      const body = request.postDataBuffer();
      putBodyLength = body ? body.length : 0;
      await route.fulfill({ status: 200, body: 'ok' });
    });
    await page.route(FINALIZE_PATTERN, async (route: Route, request: Request) => {
      capturedFinalizeBody.push(request.postDataJSON());
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(fakeImageRow({ source: 'manual', sourceType: 'regular' })),
      });
    });
    await page.route(IMAGES_LIST_PATTERN, (route: Route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const fileSize = 16 * 1024;
    const dt = await makeDataTransfer(page, [
      { name: 'phone.png', mimeType: 'image/png', size: fileSize },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });
    await expect(page.locator('img[alt="phone.png"]')).toBeVisible();

    await page.getByTestId('captured-image-add-modal-submit').click();

    await expect(page.getByRole('dialog', { name: /manually add captured image/i })).not.toBeVisible();

    // Phase 1 body shape.
    expect(capturedRequestUploadBody).toHaveLength(1);
    expect(capturedRequestUploadBody[0]).toMatchObject({
      mimeType: 'image/png',
      fileSize,
      sourceType: 'regular',
    });
    expect(typeof (capturedRequestUploadBody[0] as { clientId: unknown }).clientId).toBe('string');

    // Phase 2 PUT to signed URL with bytes.
    expect(putCalled).toBe(1);
    expect(putBodyLength).toBe(fileSize);

    // Phase 3 finalize body shape.
    expect(capturedFinalizeBody).toHaveLength(1);
    expect(capturedFinalizeBody[0]).toMatchObject({
      capturedImageId: FAKE_CAPTURED_IMAGE_ID,
      mimeType: 'image/png',
      fileSize,
      sourceType: 'regular',
      source: 'manual',
    });
    // ClientId must match across phases 1 + 3 (idempotency).
    expect((capturedFinalizeBody[0] as { clientId: string }).clientId).toBe(
      (capturedRequestUploadBody[0] as { clientId: string }).clientId,
    );
  });

  test('Submit (URL path) skips Phase 1+2 and only posts finalize', async ({ page }) => {
    let requestUploadCalls = 0;
    let putCalls = 0;
    let finalizeBody: Record<string, unknown> | null = null;

    await page.route(REQUEST_UPLOAD_PATTERN, (route: Route) => {
      requestUploadCalls += 1;
      void route.fulfill({ status: 500, body: 'should not be called' });
    });
    await page.route(SIGNED_PUT_URL, (route: Route) => {
      putCalls += 1;
      void route.fulfill({ status: 500, body: 'should not be called' });
    });

    const previewUrl = 'http://127.0.0.1:7891/__fake-preview-2.png';
    await page.route(FETCH_BY_URL_PATTERN, (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          capturedImageId: 'cap-uuid-X',
          storagePath: FAKE_STORAGE_PATH,
          mimeType: 'image/jpeg',
          fileSize: 3072,
          previewUrl,
        }),
      }),
    );
    await page.route(previewUrl, (route: Route) =>
      route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.alloc(10) }),
    );
    await page.route(FINALIZE_PATTERN, async (route: Route, request: Request) => {
      finalizeBody = request.postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(fakeImageRow({ capturedImageId: 'cap-uuid-X', source: 'manual' })),
      });
    });
    await page.route(IMAGES_LIST_PATTERN, (route: Route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();
    await page.getByLabel('Image URL').fill('https://example.com/competitor.jpg');
    await page.getByTestId('fetch-by-url-button').click();
    await expect(page.locator('img[alt="Captured image preview"]')).toBeVisible();

    await page.getByTestId('captured-image-add-modal-submit').click();
    await expect(page.getByRole('dialog', { name: /manually add captured image/i })).not.toBeVisible();

    expect(requestUploadCalls).toBe(0);
    expect(putCalls).toBe(0);
    expect(finalizeBody).toMatchObject({
      capturedImageId: 'cap-uuid-X',
      source: 'manual',
    });
  });

  test('refreshImages fires after successful save', async ({ page }) => {
    const callOrder: string[] = [];
    await page.route(REQUEST_UPLOAD_PATTERN, async (route: Route) => {
      callOrder.push('requestUpload');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: SIGNED_PUT_URL,
          capturedImageId: FAKE_CAPTURED_IMAGE_ID,
          storagePath: FAKE_STORAGE_PATH,
        }),
      });
    });
    await page.route(SIGNED_PUT_URL, async (route: Route) => {
      callOrder.push('PUT');
      await route.fulfill({ status: 200, body: 'ok' });
    });
    await page.route(FINALIZE_PATTERN, async (route: Route) => {
      callOrder.push('finalize');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(fakeImageRow({ source: 'manual' })),
      });
    });
    await page.route(IMAGES_LIST_PATTERN, async (route: Route) => {
      callOrder.push('list');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'r.png', mimeType: 'image/png', size: 4096 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });
    await page.getByTestId('captured-image-add-modal-submit').click();

    await expect.poll(() => callOrder.indexOf('list')).toBeGreaterThan(callOrder.indexOf('finalize'));
    expect(callOrder.indexOf('finalize')).toBeGreaterThan(-1);
  });

  test('Modal stays open + shows error on finalize 4xx', async ({ page }) => {
    await page.route(REQUEST_UPLOAD_PATTERN, (route: Route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          uploadUrl: SIGNED_PUT_URL,
          capturedImageId: FAKE_CAPTURED_IMAGE_ID,
          storagePath: FAKE_STORAGE_PATH,
        }),
      }),
    );
    await page.route(SIGNED_PUT_URL, (route: Route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.route(FINALIZE_PATTERN, (route: Route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'source must be one of: extension, manual' }),
      }),
    );

    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    const dt = await makeDataTransfer(page, [
      { name: 'x.png', mimeType: 'image/png', size: 1024 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt });
    await page.getByTestId('captured-image-add-modal-submit').click();

    await expect(page.getByRole('alert')).toContainText(/source must be one of: extension, manual/i);
    await expect(page.getByRole('dialog', { name: /manually add captured image/i })).toBeVisible();
  });

  test('Escape / backdrop / Cancel / X all close the modal', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    const dialog = page.getByRole('dialog', { name: /manually add captured image/i });

    // Escape
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Cancel
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // X
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // Backdrop
    await page.getByTestId('manual-add-captured-image-button').click();
    await expect(dialog).toBeVisible();
    await page.locator('div[role="presentation"]').dispatchEvent('mousedown');
    await expect(dialog).not.toBeVisible();
  });

  test('"Replace…" button clears loaded image + returns to idle', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.getByTestId('manual-add-captured-image-button').click();

    // Load first image via drag-drop.
    const dt1 = await makeDataTransfer(page, [
      { name: 'one.jpg', mimeType: 'image/jpeg', size: 1024 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt1 });
    await expect(page.locator('img[alt="one.jpg"]')).toBeVisible();

    // Click Replace… → returns to idle.
    await page.getByRole('button', { name: 'Replace…' }).click();
    await expect(page.getByTestId('image-drop-zone')).toBeVisible();
    await expect(page.getByLabel('Image URL')).toBeVisible();
    await expect(page.locator('img[alt="one.jpg"]')).toHaveCount(0);

    // Load a second image — fresh preview should appear.
    const dt2 = await makeDataTransfer(page, [
      { name: 'two.webp', mimeType: 'image/webp', size: 2048 },
    ]);
    await page.getByTestId('image-drop-zone').dispatchEvent('drop', { dataTransfer: dt2 });
    await expect(page.locator('img[alt="two.webp"]')).toBeVisible();
  });
});
