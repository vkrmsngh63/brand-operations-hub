// Playwright extension-context regression test for the P-14 highlight-flashing
// bug class.
//
// Coverage (W#2 polish session #13, 2026-05-12 — hardens the harness shipped
// in session #12):
//
//   Per platform (amazon / ebay / etsy / walmart, route-intercepted):
//     A. SMOKE — extension loads, content script attaches on a route-intercepted
//        product URL, initial highlight pass produces <mark> elements.
//        Passes on current code.
//     B. P-14 REGRESSION (count) — observes <mark> element churn over a 2.0s
//        window after initial paint settles. Tightened from session #12 (1.5s
//        window after 500ms settle) → 2.0s window after 800ms settle gives
//        ~8 MO cycles of headroom for the bug to manifest. Currently expected
//        to FAIL because the orchestrator's MutationObserver self-feedback loop
//        keeps the highlight refresh cycle running every ~250ms
//        (RESCAN_DEBOUNCE_MS). Marked with `test.fail` so the suite stays
//        green; the annotation MUST be removed when P-14 ships.
//     C. P-14 REGRESSION (identity) — tags each initial mark with a
//        data-test-id attribute, then checks after the window that every
//        tagged mark is STILL in the DOM. Catches the case where churn count
//        stays low but marks are nonetheless destroyed-and-recreated (e.g.,
//        a future partial-fix that reduces but doesn't eliminate the loop).
//        Also `test.fail`-annotated.
//     D. SELECTION-STABILITY — user-visible second symptom of P-14: a text
//        selection drawn over a highlighted region collapses every ~250ms
//        because the underlying <mark> nodes get destroyed and recreated.
//        Test asserts the selection still contains the original text after
//        a 1.0s observation window. `test.fail`-annotated.
//
//   Single platform (amazon, sufficient because SPA-navigation path is
//   platform-independent in the orchestrator — see comment on
//   `lastObservedUrl` at orchestrator.ts:284):
//     E. P-10 SPA-NAVIGATION REGRESSION — exercises the
//        history.pushState detection path that P-10 (2026-05-10) added.
//        The P-14 fix will mute the MutationObserver around highlight
//        refresh; we must protect P-10's MO-based URL-change detection
//        from regressing in the process. Pushes a new URL + injects new
//        DOM content; asserts new content gets highlights applied. NOT
//        `test.fail`-annotated — passes on current code; must continue
//        passing after the P-14 fix lands.
//
// Why route interception (instead of a custom test domain): the content
// script is gated by `manifest.content_scripts[].matches`
// (`https://*.amazon.com/*` etc.); to exercise it without re-building the
// extension, we navigate to fake product URLs on real listed domains and
// let Playwright fulfill the request with the local mock HTML. The
// orchestrator's `getModuleByHostname` (registry.ts) also requires the
// hostname-vs-`selectedPlatform` cross-check to pass, so each platform's
// beforeEach seeds the matching `selectedPlatform` in chrome.storage.

import { test, expect } from './fixtures';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

// Resolved relative to process.cwd() (the repo root, where Playwright is
// launched). Avoids `import.meta.url`, which forces ESM compilation —
// Playwright 1.60's default loader compiles .ts files to CJS. (Lesson
// from session #12's CORRECTIONS_LOG 2026-05-12-c entry.)
const MOCK_HTML_PATH = path.resolve(
  process.cwd(),
  'tests/playwright/extension/product-page.html',
);

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

// Observation-window constants. RESCAN_DEBOUNCE_MS in orchestrator.ts is
// 250ms; a 2.0s window covers ~8 MO cycles. Pre-fix observed mutation count
// in 2.0s on the mock page is in the tens (every cycle strips + re-adds
// ~6-9 marks); the assertion of exactly 0 is the right tightness — any
// non-zero is a regression of the bug class.
const SETTLE_MS = 800;
const OBSERVE_MS = 2_000;

// Selection-stability: 1.0s gives ~4 MO cycles, plenty for the bug to
// collapse the selection if marks are being destroyed.
const SELECTION_OBSERVE_MS = 1_000;

interface PlatformCase {
  /** chrome.storage `selectedPlatform` value. */
  platform: string;
  /** Host portion of the URL the test navigates to. */
  host: string;
  /** Path that matches the platform module's `matchesProduct` regex. */
  productPath: string;
  /** Glob used in `context.route(...)` to intercept the platform's host. */
  routeGlob: string;
}

const PLATFORMS: readonly PlatformCase[] = [
  {
    platform: 'amazon',
    host: 'www.amazon.com',
    // /dp/{ASIN} — Amazon's product route.
    productPath: '/dp/B0FAKE1234',
    routeGlob: '**://*.amazon.com/**',
  },
  {
    platform: 'ebay',
    host: 'www.ebay.com',
    // /itm/{8+digit listing ID} — Ebay's product route.
    productPath: '/itm/123456789012',
    routeGlob: '**://*.ebay.com/**',
  },
  {
    platform: 'etsy',
    host: 'www.etsy.com',
    // /listing/{id}/{title-slug} — Etsy's product route.
    productPath: '/listing/123456789/some-cat-scratching-post',
    routeGlob: '**://*.etsy.com/**',
  },
  {
    platform: 'walmart',
    host: 'www.walmart.com',
    // /ip/{slug}/{id} — Walmart's product route.
    productPath: '/ip/Cat-Scratching-Post/12345678',
    routeGlob: '**://*.walmart.com/**',
  },
];

function urlFor(pl: PlatformCase): string {
  return `https://${pl.host}${pl.productPath}`;
}

// Parametrized per-platform suite. Each platform gets its own describe block
// with platform-specific route interception + selectedPlatform seeding.
for (const pl of PLATFORMS) {
  test.describe(`P-14 highlight-flashing harness — platform=${pl.platform}`, () => {
    test.beforeEach(async ({ context, serviceWorker }) => {
      // Seed chrome.storage.local with the popup-state keys the orchestrator
      // reads at attach time. Done via SW.evaluate because chrome.storage is
      // only available in extension contexts (SW or extension page) — not
      // from the Playwright test process.
      await serviceWorker.evaluate(
        async ([projectId, terms, platform]) => {
          // popup-state.ts key shapes:
          //   selectedProjectId           — string
          //   selectedPlatform            — Platform string
          //   highlightTerms:<projectId>  — HighlightTerm[]
          await chrome.storage.local.set({
            selectedProjectId: projectId,
            selectedPlatform: platform,
            [`highlightTerms:${projectId}`]: terms,
          });
        },
        [FAKE_PROJECT_ID, HIGHLIGHT_TERMS, pl.platform] as const,
      );

      // Route fulfillment: every navigation to this platform's host gets the
      // local mock HTML. Content-Type matters — content scripts only attach
      // to documents whose MIME is HTML.
      const html = await readFile(MOCK_HTML_PATH, 'utf8');
      await context.route(pl.routeGlob, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'text/html; charset=utf-8',
          body: html,
        });
      });
    });

    test(`SMOKE — extension loads + initial highlights apply on ${pl.host}`, async ({
      context,
    }) => {
      const page = await context.newPage();
      await page.goto(urlFor(pl));

      // Orchestrator's attach signal: data-plos-cs-active=1 on document.body.
      await page.waitForFunction(
        () => document.body.getAttribute('data-plos-cs-active') === '1',
        undefined,
        { timeout: 10_000 },
      );

      // Initial highlight pass — requestIdleCallback-scheduled.
      await page.waitForFunction(
        () =>
          document.querySelectorAll('mark.plos-cs-highlight').length > 0,
        undefined,
        { timeout: 5_000 },
      );

      const markCount = await page.evaluate(
        () => document.querySelectorAll('mark.plos-cs-highlight').length,
      );

      expect(
        markCount,
        `Initial highlight pass on ${pl.host} should produce at least 3 marks (cat / scratch / post all appear multiple times in mock page)`,
      ).toBeGreaterThan(2);
    });

    test(`P-14 REGRESSION (count) — <mark>s STABLE for ${OBSERVE_MS}ms on ${pl.host} (FAILING pre-fix)`, async ({
      context,
    }) => {
      // EXPECTED FAILURE today: orchestrator's MutationObserver self-feedback
      // loop strips + re-applies marks every ~250ms (RESCAN_DEBOUNCE_MS).
      // When P-14 ships (muteMutationObserver plumbed through highlight-terms
      // refresh), this test will start passing — at which point the
      // test.fail() annotation MUST be removed. Playwright reports a
      // test.fail-marked test that PASSES as a failure, which is the
      // intended signal to flip it.
      test.fail(
        true,
        `P-14 bug present (platform=${pl.platform}); remove this annotation when fix ships.`,
      );

      const page = await context.newPage();
      await page.goto(urlFor(pl));

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

      // Let the initial paint fully settle. SETTLE_MS gives the initial
      // requestIdleCallback-scheduled pass plus any follow-up MO tick from
      // its own mutations time to complete.
      await page.waitForTimeout(SETTLE_MS);

      // Observe mark element addition/removal over the OBSERVE_MS window.
      // Post-fix expectation: count === 0 (MO muted around refresh).
      // Pre-fix reality: tens, as the loop ticks every 250ms × ~6-9 marks
      // re-created per cycle. ANY non-zero value is a regression.
      const mutationCount = await page.evaluate(
        async (windowMs) =>
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
            }, windowMs);
          }),
        OBSERVE_MS,
      );

      expect(
        mutationCount,
        `After initial highlight paint settles, <mark> elements should not be re-created continuously on ${pl.host}. Continuous churn indicates the P-14 MutationObserver self-feedback loop is active.`,
      ).toBe(0);
    });

    test(`P-14 REGRESSION (identity) — tagged marks survive ${OBSERVE_MS}ms on ${pl.host} (FAILING pre-fix)`, async ({
      context,
    }) => {
      // Identity-stability check complements the count-stability check.
      // A future partial fix could reduce the churn count without
      // eliminating the loop entirely (e.g., debounce extended from 250ms
      // to 1500ms — count drops but marks still get destroyed). This test
      // catches that case by tagging every initial mark with a unique
      // attribute, then checking after the window that every tagged
      // element is still present in the DOM. Pre-fix: tagged elements
      // disappear within one cycle because the highlighter strips ALL
      // marks before re-applying.
      test.fail(
        true,
        `P-14 bug destroys tagged marks (platform=${pl.platform}); remove when fix ships.`,
      );

      const page = await context.newPage();
      await page.goto(urlFor(pl));

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
      await page.waitForTimeout(SETTLE_MS);

      // Tag every initial mark with a unique identity attribute.
      const taggedCount = await page.evaluate(() => {
        const marks = document.querySelectorAll('mark.plos-cs-highlight');
        marks.forEach((m, i) => {
          m.setAttribute('data-plos-test-id', String(i));
        });
        return marks.length;
      });
      expect(
        taggedCount,
        `Expected initial highlight pass on ${pl.host} to produce marks for identity-tracking`,
      ).toBeGreaterThan(0);

      await page.waitForTimeout(OBSERVE_MS);

      // After the observation window, count how many of the originally
      // tagged marks survived. Pre-fix: 0 survive (loop stripped them).
      // Post-fix: all survive (MO muted; no churn).
      const survivedCount = await page.evaluate(
        () =>
          document.querySelectorAll(
            'mark.plos-cs-highlight[data-plos-test-id]',
          ).length,
      );

      expect(
        survivedCount,
        `Tagged marks should still exist after ${OBSERVE_MS}ms on ${pl.host}. Destruction of tagged marks indicates the P-14 strip-and-reapply loop is active.`,
      ).toBe(taggedCount);
    });

    test(`SELECTION-STABILITY — selection over highlights survives ${SELECTION_OBSERVE_MS}ms on ${pl.host} (FAILING pre-fix)`, async ({
      context,
    }) => {
      // User-visible second symptom of P-14: drawing a text selection over
      // a highlighted region collapses every ~250ms because the underlying
      // <mark> nodes are destroyed and recreated by the loop. The
      // collapsed selection is what blocks S4-B (highlight-and-add gesture)
      // verification per VERIFICATION_BACKLOG 2026-05-12 entry.
      test.fail(
        true,
        `P-14 selection-destruction symptom present (platform=${pl.platform}); remove when fix ships.`,
      );

      const page = await context.newPage();
      await page.goto(urlFor(pl));

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
      await page.waitForTimeout(SETTLE_MS);

      // Create a selection that spans the first highlighted mark's text
      // content. The test asserts the selection's serialized text remains
      // non-empty after the observation window — i.e., the mark and its
      // text nodes were not destroyed under the selection.
      const initialSelectionText = await page.evaluate(() => {
        const mark = document.querySelector('mark.plos-cs-highlight');
        if (!mark) return '';
        const range = document.createRange();
        range.selectNodeContents(mark);
        const sel = window.getSelection();
        if (!sel) return '';
        sel.removeAllRanges();
        sel.addRange(range);
        return sel.toString();
      });
      expect(
        initialSelectionText,
        `Expected to be able to select the first highlight on ${pl.host}`,
      ).not.toBe('');

      await page.waitForTimeout(SELECTION_OBSERVE_MS);

      const finalSelectionText = await page.evaluate(
        () => window.getSelection()?.toString() ?? '',
      );

      expect(
        finalSelectionText,
        `Selection over highlighted text should survive ${SELECTION_OBSERVE_MS}ms on ${pl.host}. Empty final selection indicates the P-14 mark-destruction loop collapsed it.`,
      ).toBe(initialSelectionText);
    });
  });
}

// P-10 SPA-navigation regression. Single platform (Amazon) is sufficient
// because the SPA-detection path (orchestrator.ts:297-318: MutationObserver
// callback checking `location.href !== lastObservedUrl`) is fully
// platform-independent — it lives in shared orchestrator code, not in any
// per-platform module. The P-14 fix will mute this MutationObserver
// around highlight-terms refresh; this test guards against that mute
// silently disabling the P-10 detection.
test.describe('P-10 SPA-navigation regression — must continue working post-P-14-fix', () => {
  test.beforeEach(async ({ context, serviceWorker }) => {
    await serviceWorker.evaluate(
      async ([projectId, terms]) => {
        await chrome.storage.local.set({
          selectedProjectId: projectId,
          selectedPlatform: 'amazon',
          [`highlightTerms:${projectId}`]: terms,
        });
      },
      [FAKE_PROJECT_ID, HIGHLIGHT_TERMS] as const,
    );
    const html = await readFile(MOCK_HTML_PATH, 'utf8');
    await context.route('**://*.amazon.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: html,
      });
    });
  });

  test('history.pushState + DOM injection → orchestrator detects URL change and applies highlights to new content (PASSES pre-fix; must continue post-fix)', async ({
    context,
  }) => {
    const page = await context.newPage();
    await page.goto('https://www.amazon.com/dp/B0FAKE1234');

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

    // Simulate SPA navigation the way Walmart's React Router does it:
    // history.pushState + new DOM content. The orchestrator's MO sees
    // the DOM mutation, compares location.href to lastObservedUrl,
    // detects the change, and re-runs highlight refresh on the new
    // content. Section is tagged with #spa-injected so the assertion
    // scopes to net-new content rather than any pre-existing mark.
    await page.evaluate(() => {
      history.pushState({}, '', '/dp/B0FAKE5555');
      const newSection = document.createElement('div');
      newSection.id = 'spa-injected';
      newSection.innerHTML =
        '<p>Another cat scratching post tile rendered after SPA navigation. The cat-themed text here should pick up highlights.</p>';
      document.body.appendChild(newSection);
    });

    // Upper bound for orchestrator to apply highlights to the injected
    // content: RESCAN_DEBOUNCE_MS (250) + OVERLAY_CHECK_DEBOUNCE_MS (150)
    // + requestIdleCallback latency. 5s timeout is generous.
    await page.waitForFunction(
      () =>
        document.querySelectorAll(
          '#spa-injected mark.plos-cs-highlight',
        ).length > 0,
      undefined,
      { timeout: 5_000 },
    );

    const newMarkCount = await page.evaluate(
      () =>
        document.querySelectorAll(
          '#spa-injected mark.plos-cs-highlight',
        ).length,
    );

    expect(
      newMarkCount,
      'SPA-injected content should receive highlight marks via orchestrator MO + URL-change detection path',
    ).toBeGreaterThan(0);
  });
});
