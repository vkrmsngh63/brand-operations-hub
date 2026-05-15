// W#2 P-29 Slice #1 — manual-add URL modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   UrlAddModal.tsx + UrlTable.tsx wire-in (the "+ Manually add URL" button)
// API target: POST /api/projects/[projectId]/competition-scraping/urls with
//   `source: 'manual'` body field.
//
// Verification approach picked 2026-05-15 per Rule 27 (forced-picker for
// Slice #1 verification approach): Hybrid — Playwright covers mechanical
// regression-prone parts; director manual walkthrough covers visual-
// judgment + real-independent-website end-to-end smoke.
//
// SCOPE OF THIS FILE — what's tested here vs. covered elsewhere:
//
//   ✅ Tested here (when the stub-page rig lands):
//     - "+ Manually add URL" button renders in the UrlTable toolbar.
//     - Clicking the button opens the modal.
//     - Empty URL submit shows the inline validation error.
//     - Filling required fields + submit serializes the POST body with
//       `source: 'manual'` and the platform's selected value (incl.
//       `independent-website` for Q2-reframing regression coverage).
//     - Modal closes on a 201/200 response; modal stays open + shows error
//       on a 4xx/5xx response.
//     - Escape key + backdrop click + Cancel button + X button all close
//       the modal (only when not submitting).
//
//   ⏸ Tracked as DEFERRED — needs the React-bundle stub-page rig that
//      this spec file will reuse:
//      - All test cases in this file are currently `test.skip()` because
//        the bundling rig (esbuild ES module of React + ReactDOM +
//        UrlAddModal + stubbed authFetch + mount script + static
//        test-page.html) does not yet exist. Building it once unblocks
//        Slice #1+#2+#3 modal coverage.
//      - Tracked at: docs/ROADMAP.md W#2 polish backlog (P-30 — built in
//        the end-of-session doc batch).
//
//   ⏸ Tracked as DEFERRED — needs route-handler DI refactor:
//      - API-layer regression of `source` field persistence + auth gate
//        (unauthenticated submit → 401) + validation (400 for invalid
//        source value, missing url, missing platform). Today the POST
//        handler in src/app/api/.../urls/route.ts wires Prisma + auth
//        + workflow-status side-effects inline; testing in isolation
//        needs either a DI seam OR Next.js boot in playwright.config.
//        Tracked at: docs/ROADMAP.md W#2 polish backlog (P-31 — built
//        in the end-of-session doc batch).
//
//   ✅ Covered today by other means:
//     - `isSource` type-guard regression — covered by
//       src/lib/shared-types/competition-scraping.test.ts (node:test).
//     - End-to-end smoke (real auth + real DB + real independent-website
//       URL appearing in the table) — director manual walkthrough on
//       vklf.com post-deploy.
//     - TypeScript compile catches any future shape drift between modal
//       form payload and CreateCompetitorUrlRequest.
//
// Why this file exists today even with everything skipped: making the
// regression intent visible in the repo NOW means a future bundle-rig
// session has a known target (this file's skipped tests are the spec).
// Without this file the future work has only memory + handoff docs to
// pull from.

import { test } from '@playwright/test';

test.describe('W#2 P-29 Slice #1 — manual-add URL modal (UI mechanical)', () => {
  test.skip(true, 'P-30 — React-bundle stub-page rig not yet built; see file header for DEFERRED tracking.');

  test('"+ Manually add URL" button renders in UrlTable toolbar', async () => {
    // Stub-page test (deferred):
    //   1. Goto /p29-manual-add-url-modal.test.html (stub page mounting
    //      UrlTable with a static row set + UrlAddModal).
    //   2. Assert button [data-testid="manual-add-url-button"] is visible.
  });

  test('Clicking the button opens the modal', async () => {
    // Stub-page test (deferred):
    //   1. Goto stub page.
    //   2. Click [data-testid="manual-add-url-button"].
    //   3. Assert [role="dialog"][aria-labelledby="url-add-modal-title"]
    //      becomes visible.
  });

  test('Empty URL submit shows inline validation error', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Click Save URL without entering a URL.
    //   3. Assert [role="alert"] becomes visible with text matching
    //      /URL is required/.
    //   4. Assert the modal stays open.
  });

  test('Submit with required fields posts source=manual + selected platform', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Fill URL = "https://www.example.com/product/abc"; Platform =
    //      "Independent Website".
    //   3. Intercept fetch to .../competition-scraping/urls with a route
    //      handler that captures the request body + fulfills with 201 +
    //      a fake CompetitorUrl response (source: 'manual',
    //      platform: 'independent-website').
    //   4. Click Save URL.
    //   5. Assert captured body.source === 'manual' AND
    //      body.platform === 'independent-website' AND
    //      body.url === 'https://www.example.com/product/abc'.
    //   6. Assert modal closes after success.
  });

  test('Modal stays open + shows error on 4xx response', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Fill required fields.
    //   3. Intercept fetch to .../urls with route handler that fulfills
    //      400 + {"error": "platform is required and must be one of the supported values"}.
    //   4. Click Save URL.
    //   5. Assert [role="alert"] shows the server's error message.
    //   6. Assert modal stays open.
  });

  test('Escape key + backdrop click + Cancel + X button all close the modal', async () => {
    // Stub-page test (deferred): exercise each dismiss path in turn,
    // re-opening the modal between cases. Confirm the modal closes only
    // when not in the submitting state (submit-in-flight should ignore
    // dismiss attempts to avoid orphan POSTs).
  });
});
