// Playwright extension-context regression test for the P-14 highlight-flashing
// bug class.
//
// Today's session (W#2 polish session #12, 2026-05-12) ships the harness only.
// Two tests live here:
//
//   1. SMOKE — extension loads, content script attaches on a route-intercepted
//      Amazon product URL, initial highlight pass produces <mark> elements.
//      Passes on current code (the P-14 bug is present but doesn't break
//      mechanics).
//
//   2. P-14 REGRESSION — observes <mark> element churn over a 1.5-second
//      window after initial paint settles. Currently expected to FAIL because
//      the orchestrator's MutationObserver self-feedback loop keeps the
//      highlight refresh cycle running every ~250ms. Marked with `test.fail`
//      so the suite stays green; the annotation MUST be removed when P-14
//      ships (otherwise the now-passing test will fail the test.fail
//      expectation, which is the intended signal).
//
// Why route interception of amazon.com instead of a custom test domain:
// the content script is gated by `manifest.content_scripts[].matches`
// (`https://*.amazon.com/*` etc.); to exercise it without re-building the
// extension, we navigate to a fake product URL on a real listed domain
// and let Playwright fulfill the request with the local mock HTML.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

// Resolved relative to process.cwd() (the repo root, where Playwright is
// launched). Avoids `import.meta.url`, which forces ESM compilation —
// Playwright 1.60's default loader compiles .ts files to CJS.
const MOCK_HTML_PATH = path.resolve(
  process.cwd(),
  'tests/playwright/extension/product-page.html',
);

// Faked-ASIN URL on a host the manifest covers. Route interception serves
// the local mock HTML; no real network call to Amazon ever happens.
const FAKE_AMAZON_URL = 'https://www.amazon.com/dp/B0FAKE1234';

// Fake project id used as a chrome.storage key. The orchestrator's API
// calls to fetch the saved CompetitorUrl list + project name will fail
// (no real PLOS backend reachable), but the orchestrator handles those
// gracefully and proceeds with highlighting.
const FAKE_PROJECT_ID = '00000000-0000-4000-8000-000000000001';

const HIGHLIGHT_TERMS = [
  { term: 'cat', color: '#fde047' },
  { term: 'scratch', color: '#86efac' },
  { term: 'post', color: '#93c5fd' },
];

test.describe('P-14 highlight-flashing harness — Playwright extension-context', () => {
  test.beforeEach(async ({ context, serviceWorker }) => {
    // Seed chrome.storage.local with the popup-state keys the orchestrator
    // reads at attach time. Done via SW.evaluate because chrome.storage is
    // only available in extension contexts (SW or extension page) — not
    // from the Playwright test process.
    await serviceWorker.evaluate(
      async ([projectId, terms]) => {
        // popup-state.ts key shapes:
        //   selectedProjectId           — string
        //   selectedPlatform            — Platform string
        //   highlightTerms:<projectId>  — HighlightTerm[]
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: 'amazon',
          [`highlightTerms:${projectId}`]: terms,
        });
      },
      [FAKE_PROJECT_ID, HIGHLIGHT_TERMS] as const,
    );

    // Route fulfillment: every navigation to *.amazon.com gets the local
    // mock HTML. Content-Type matters — content scripts only attach to
    // documents whose MIME is HTML.
    const html = await readFile(MOCK_HTML_PATH, 'utf8');
    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      });
    });
  });

  test('SMOKE — extension loads and applies initial highlights on a route-intercepted Amazon product page', async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto(FAKE_AMAZON_URL);

    // Wait for the orchestrator to set its body marker — the unambiguous
    // "content script attached and ran" signal.
    await page.waitForFunction(
      () =>
        document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );

    // Wait for the initial highlight pass to produce at least one mark.
    // requestIdleCallback-scheduled, so the first marks appear shortly
    // after content-script attach.
    await page.waitForFunction(
      () =>
        document.querySelectorAll('mark.plos-cs-highlight').length > 0,
      undefined,
      { timeout: 5_000 },
    );

    const markCount = await page.evaluate(
      () =>
        document.querySelectorAll('mark.plos-cs-highlight').length,
    );

    expect(
      markCount,
      'Initial highlight pass should produce at least 3 marks (cat / scratch / post all appear multiple times in mock page)',
    ).toBeGreaterThan(2);
  });

  test('P-14 REGRESSION — <mark> elements should be STABLE for 1.5s after initial paint (currently FAILING — P-14 bug present)', async ({
    context,
  }) => {
    // EXPECTED FAILURE today: orchestrator's MutationObserver self-feedback
    // loop strips + re-applies marks every ~250ms. When P-14 ships
    // (muteMutationObserver plumbed through highlight-terms.refresh), this
    // test will start passing — at which point the test.fail() annotation
    // below MUST be removed. Playwright reports a test.fail-marked test
    // that PASSES as a failure, which is the intended signal to flip it.
    test.fail(
      true,
      'P-14 bug is present in current code; remove this annotation when the fix ships.',
    );

    const page = await context.newPage();
    await page.goto(FAKE_AMAZON_URL);

    // Wait for the harness signals (same as smoke).
    await page.waitForFunction(
      () => document.body.getAttribute('data-plos-cs-active') === '1',
      undefined,
      { timeout: 10_000 },
    );
    await page.waitForFunction(
      () => document.querySelectorAll('mark.plos-cs-highlight').length > 0,
      undefined,
      { timeout: 5_000 },
    );

    // Let the initial paint fully settle. The initial highlight pass runs
    // via requestIdleCallback after content-script attach; we give it 500ms
    // of headroom before starting the observation window.
    await page.waitForTimeout(500);

    // Observe mark element addition/removal over a 1.5-second window.
    // In post-fix code, the count of mutation events targeting <mark>
    // children should be 0 (MO is muted around refresh, so its own
    // mutations don't trigger another refresh). In current buggy code,
    // the MO callback fires every ~250ms with strip+reapply churn.
    const mutationCount = await page.evaluate(
      async () =>
        new Promise<number>((resolve) => {
          let count = 0;
          const obs = new MutationObserver((records) => {
            for (const r of records) {
              for (const n of Array.from(r.addedNodes)) {
                if (
                  n.nodeType === Node.ELEMENT_NODE &&
                  (n as Element).tagName === 'MARK' &&
                  (n as Element).classList.contains('plos-cs-highlight')
                ) {
                  count++;
                }
              }
              for (const n of Array.from(r.removedNodes)) {
                if (
                  n.nodeType === Node.ELEMENT_NODE &&
                  (n as Element).tagName === 'MARK' &&
                  (n as Element).classList.contains('plos-cs-highlight')
                ) {
                  count++;
                }
              }
            }
          });
          obs.observe(document.body, {
            childList: true,
            subtree: true,
          });
          setTimeout(() => {
            obs.disconnect();
            resolve(count);
          }, 1500);
        }),
    );

    // Post-fix expectation: zero mark additions/removals after initial paint.
    // Pre-fix reality: dozens, as the loop ticks every 250ms.
    expect(
      mutationCount,
      'After initial highlight paint settles, <mark> elements should not be re-created continuously. Continuous churn indicates the P-14 MutationObserver self-feedback loop is active.',
    ).toBe(0);
  });
});
