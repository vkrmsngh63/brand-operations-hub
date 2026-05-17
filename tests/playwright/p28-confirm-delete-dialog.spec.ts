// W#2 P-28 — ConfirmDeleteDialog isolated regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   ConfirmDeleteDialog.tsx. Real production component rendered inside the
//   P-30-style stub-page rig (tests/playwright/mounts/
//   p28-confirm-delete-dialog.mount.tsx + pages/
//   p28-confirm-delete-dialog.html). The dialog has no fetch of its own,
//   so no page.route() interception is needed; each test drives the
//   dialog's variant + counts state + onConfirm shape via the
//   window.__test hooks exposed by the mount wrapper.
//
// What this file covers (UI-mechanical regression):
//   1. Plain variant — title + message render; no disclosure block.
//   2. Cascade variant — loading state shows "Loading cascade counts…".
//   3. Cascade variant — ready state shows the N texts + M images line.
//   4. Cascade variant — 0/0 counts → softer "URL has no captured…" line.
//   5. Cascade variant — error state shows the error message.
//   6. Confirm calls onConfirm exactly once + closes on success.
//   7. Confirm shows inline error when onConfirm rejects + stays open.
//   8. Escape / Cancel / X / backdrop all dismiss the dialog.
//   9. Cancel + close paths disabled while submit is in flight.
//  10. Reopen after a confirm-throw error resets the error state.

import { test, expect } from '@playwright/test';

const PAGE_URL = '/p28-confirm-delete-dialog';

test.describe('W#2 P-28 — ConfirmDeleteDialog (UI mechanical)', () => {
  test('plain variant renders title + message + no disclosure', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() => window.__test.setVariant({ kind: 'plain' }));
    await page.getByTestId('open-dialog-button').click();
    const dialog = page.getByTestId('confirm-delete-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Delete this thing?')).toBeVisible();
    await expect(dialog.getByText('This cannot be undone.')).toBeVisible();
    // No cascade-counts surfaces.
    await expect(page.getByTestId('cascade-counts-loading')).toHaveCount(0);
    await expect(page.getByTestId('cascade-counts-ready')).toHaveCount(0);
    await expect(page.getByTestId('cascade-counts-error')).toHaveCount(0);
  });

  test('cascade variant — loading state renders the spinner line', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setVariant({
        kind: 'cascade',
        counts: null,
        countsError: null,
      }),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('cascade-counts-loading')).toBeVisible();
    await expect(page.getByTestId('cascade-counts-loading')).toHaveText(
      /Loading cascade counts/i,
    );
  });

  test('cascade variant — ready state renders the N texts + M images line', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setVariant({
        kind: 'cascade',
        counts: { texts: 5, images: 3 },
        countsError: null,
      }),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('cascade-counts-ready')).toBeVisible();
    await expect(page.getByTestId('cascade-counts-ready')).toHaveText(
      /This will also delete 5 captured texts and 3 captured images\./,
    );
  });

  test('cascade variant — 1 text + 1 image uses singular form', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setVariant({
        kind: 'cascade',
        counts: { texts: 1, images: 1 },
        countsError: null,
      }),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('cascade-counts-ready')).toHaveText(
      /This will also delete 1 captured text and 1 captured image\./,
    );
  });

  test('cascade variant — 0/0 counts use softer phrasing', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setVariant({
        kind: 'cascade',
        counts: { texts: 0, images: 0 },
        countsError: null,
      }),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('cascade-counts-ready')).toHaveText(
      /This URL has no captured texts or captured images attached\./,
    );
  });

  test('cascade variant — error state renders the error message', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setVariant({
        kind: 'cascade',
        counts: null,
        countsError: 'HTTP 500',
      }),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('cascade-counts-error')).toBeVisible();
    await expect(page.getByTestId('cascade-counts-error')).toHaveText(
      /Could not load cascade counts: HTTP 500/i,
    );
  });

  test('Confirm calls onConfirm once + closes on success', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setOnConfirmShape('success'),
    );
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('confirm-delete-dialog')).toBeVisible();
    await page.getByTestId('confirm-delete-confirm').click();
    await expect(page.getByTestId('confirm-delete-dialog')).not.toBeVisible();
    const count = await page.evaluate(() => window.__test.getConfirmCount());
    expect(count).toBe(1);
  });

  test('Confirm shows inline error when onConfirm rejects + dialog stays open', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setOnConfirmShape({ error: 'Server said no' }),
    );
    await page.getByTestId('open-dialog-button').click();
    await page.getByTestId('confirm-delete-confirm').click();
    await expect(page.getByRole('alert')).toHaveText(/Server said no/i);
    await expect(page.getByTestId('confirm-delete-dialog')).toBeVisible();
    // Confirm + Cancel are both re-enabled so the user can retry / dismiss.
    await expect(page.getByTestId('confirm-delete-confirm')).toBeEnabled();
    await expect(page.getByTestId('confirm-delete-cancel')).toBeEnabled();
  });

  test('Escape / Cancel / X / backdrop all close the dialog', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);

    const dialog = page.getByTestId('confirm-delete-dialog');

    // (a) Escape key.
    await page.getByTestId('open-dialog-button').click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // (b) Cancel button.
    await page.getByTestId('open-dialog-button').click();
    await expect(dialog).toBeVisible();
    await page.getByTestId('confirm-delete-cancel').click();
    await expect(dialog).not.toBeVisible();

    // (c) X (Close) button.
    await page.getByTestId('open-dialog-button').click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).not.toBeVisible();

    // (d) Backdrop click — mousedown on the role="presentation" wrapper
    // whose target equals currentTarget closes the modal.
    await page.getByTestId('open-dialog-button').click();
    await expect(dialog).toBeVisible();
    await page.locator('div[role="presentation"]').dispatchEvent('mousedown');
    await expect(dialog).not.toBeVisible();
  });

  test('Cancel + X + Escape disabled while submit is in flight', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setOnConfirmShape('never-resolve'),
    );
    await page.getByTestId('open-dialog-button').click();
    await page.getByTestId('confirm-delete-confirm').click();

    // Submitting state: confirm shows "Deleting…" + both buttons disabled.
    await expect(page.getByTestId('confirm-delete-confirm')).toHaveText(/Deleting/i);
    await expect(page.getByTestId('confirm-delete-confirm')).toBeDisabled();
    await expect(page.getByTestId('confirm-delete-cancel')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Close' })).toBeDisabled();

    // Escape is ignored while submitting.
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('confirm-delete-dialog')).toBeVisible();
  });

  test('Reopening after a confirm-throw resets the error state', async ({
    page,
  }) => {
    await page.goto(PAGE_URL);
    await page.waitForFunction(() => window.__pageReady === true);
    await page.evaluate(() =>
      window.__test.setOnConfirmShape({ error: 'First failure' }),
    );
    await page.getByTestId('open-dialog-button').click();
    await page.getByTestId('confirm-delete-confirm').click();
    await expect(page.getByRole('alert')).toHaveText(/First failure/i);
    await page.getByTestId('confirm-delete-cancel').click();
    await expect(page.getByTestId('confirm-delete-dialog')).not.toBeVisible();

    // Reopen → error should be cleared.
    await page.getByTestId('open-dialog-button').click();
    await expect(page.getByTestId('confirm-delete-dialog')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
