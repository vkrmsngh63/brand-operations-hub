// W#2 P-29 Slice #2 — manual-add captured-text modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   CapturedTextAddModal.tsx + UrlDetailContent.tsx wire-in (the
//   "+ Manually add captured text" button + clientId-dedup callback).
// API target: POST /api/projects/[projectId]/competition-scraping/urls/
//   [urlId]/text with `source: 'manual'` body field.
//
// Verification approach picked 2026-05-15 per Rule 27 (forced-picker for
// the P-29 family): Hybrid — Playwright covers mechanical regression-
// prone parts; director manual walkthrough covers visual-judgment +
// real-independent-website end-to-end smoke. Slice #2 reuses the same
// Hybrid pick (no fresh picker needed — same component class as Slice #1).
//
// SCOPE OF THIS FILE — what's tested here vs. covered elsewhere:
//
//   ✅ Tested here (when the stub-page rig lands):
//     - "+ Manually add captured text" button renders at the right end of
//       the Captured Text section's h2 row.
//     - Clicking the button opens the modal.
//     - Empty Text submit shows the inline validation error.
//     - Filling required field + submit serializes the POST body with
//       `source: 'manual'` AND a `clientId` matching UUIDv4 shape AND
//       (when set) `contentCategory` AND (when set) `tags` parsed from
//       comma-separated input.
//     - Modal closes on a 201/200 response; the new row appears in the
//       captured-text table (via the parent's handleTextAdded prepend).
//     - Modal stays open + shows error on a 4xx/5xx response.
//     - Escape key + backdrop click + Cancel button + X button all close
//       the modal (only when not submitting).
//     - clientId-dedup — a duplicate POST returning 200 with the same
//       clientId replaces the existing row in-place rather than
//       prepending a second copy.
//
//   ⏸ Tracked as DEFERRED — needs the React-bundle stub-page rig that
//      this spec file will reuse (the same P-30 work that unblocks
//      Slice #1's spec also unblocks Slice #2):
//      - All test cases in this file are currently `test.skip()` because
//        the bundling rig (esbuild ES module of React + ReactDOM +
//        CapturedTextAddModal + the relevant section wrapper + stubbed
//        authFetch + mount script + static test-page.html) does not yet
//        exist. P-30 will add a second bundle entrypoint + test-page +
//        wire this spec file to its stub page.
//      - Tracked at: docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//        P-30 polish-backlog entry (added 2026-05-15-b).
//
//   ⏸ Tracked as DEFERRED — needs route-handler DI refactor:
//      - API-layer regression of `source` field persistence + auth gate
//        (unauthenticated submit → 401) + validation (400 for invalid
//        source value, missing text, malformed tags). Slice #1 already
//        captured this as P-31 for `urls/route.ts`; P-31's pattern
//        extends to `urls/[urlId]/text/route.ts` (the route this slice
//        touched) per the P-31 entry's "reuse for sibling routes" note.
//      - Tracked at: docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//        P-31 polish-backlog entry.
//
//   ✅ Covered today by other means:
//     - `isSource` type-guard regression — still covered by
//       src/lib/shared-types/competition-scraping.test.ts (the same
//       guard the new text-POST validation branch calls).
//     - End-to-end smoke (real auth + real DB + a manually-added
//       captured-text row appearing in the URL-detail page's table) —
//       director manual walkthrough on vklf.com post-deploy.
//     - TypeScript compile catches any future shape drift between modal
//       form payload and CreateCapturedTextRequest.
//
// Why this file exists today even with everything skipped: making the
// regression intent visible in the repo NOW means the future P-30 rig
// session has a known target (this file's skipped tests are the spec).
// Without this file the future work has only memory + handoff docs to
// pull from.

import { test } from '@playwright/test';

test.describe('W#2 P-29 Slice #2 — manual-add captured-text modal (UI mechanical)', () => {
  test.skip(true, 'P-30 — React-bundle stub-page rig not yet built; see file header for DEFERRED tracking.');

  test('"+ Manually add captured text" button renders in section header', async () => {
    // Stub-page test (deferred):
    //   1. Goto /p29-manual-add-captured-text-modal.test.html (stub page
    //      mounting the CapturedTextSubsection wrapper with a static
    //      captured-text row set + CapturedTextAddModal).
    //   2. Assert button [data-testid="manual-add-captured-text-button"]
    //      is visible and is rendered to the right of the "Captured Text"
    //      h2 in the section header row.
  });

  test('Clicking the button opens the modal', async () => {
    // Stub-page test (deferred):
    //   1. Goto stub page.
    //   2. Click [data-testid="manual-add-captured-text-button"].
    //   3. Assert [role="dialog"][aria-labelledby=
    //      "captured-text-add-modal-title"] becomes visible.
    //   4. Assert the Text textarea has focus (autofocus on open).
  });

  test('Empty Text submit shows inline validation error', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Click Save captured text without entering any text.
    //   3. Assert [role="alert"] becomes visible with text matching
    //      /Text is required/.
    //   4. Assert the modal stays open.
    //   5. Assert no POST was issued (interception count = 0).
  });

  test('Submit with required field posts source=manual + clientId + text', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Fill Text = "This is a benchmark headline I captured manually."
    //   3. Intercept fetch to .../urls/[urlId]/text with a route handler
    //      that captures the request body + fulfills with 201 + a fake
    //      CapturedText response (source: 'manual').
    //   4. Click Save captured text.
    //   5. Assert captured body.source === 'manual' AND
    //      body.text === 'This is a benchmark headline I captured manually.'
    //      AND body.clientId matches /^[0-9a-f-]{36}$/i (UUIDv4 shape).
    //   6. Assert modal closes after success.
    //   7. Assert the captured-text table has a new row whose text matches
    //      the submitted value (prepend path via handleTextAdded).
  });

  test('Submit with optional fields serializes contentCategory + parsed tags', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Fill Text = "Bullet copy", Content Category = "bullet",
    //      Tags = "headline, bullet, review-quote".
    //   3. Intercept POST; capture body.
    //   4. Submit.
    //   5. Assert body.contentCategory === 'bullet' AND
    //      body.tags is exactly ['headline', 'bullet', 'review-quote']
    //      (whitespace trimmed, empty entries dropped).
  });

  test('Modal stays open + shows error on 4xx response', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Fill required field.
    //   3. Intercept POST with route handler that fulfills 400 +
    //      {"error": "source must be one of: extension, manual"}.
    //   4. Click Save captured text.
    //   5. Assert [role="alert"] shows the server's error message.
    //   6. Assert modal stays open.
  });

  test('Escape key + backdrop click + Cancel + X button all close the modal', async () => {
    // Stub-page test (deferred): exercise each dismiss path in turn,
    // re-opening the modal between cases. Confirm the modal closes only
    // when not in the submitting state (submit-in-flight should ignore
    // dismiss attempts to avoid orphan POSTs).
  });

  test('clientId-dedup — duplicate-create 200 response replaces existing row in-place', async () => {
    // Stub-page test (deferred):
    //   1. Seed the stub page with a captured-text row whose clientId =
    //      'fixed-uuid-for-test'.
    //   2. Stub crypto.randomUUID() to return 'fixed-uuid-for-test' so the
    //      modal's submit uses the same clientId.
    //   3. Open the modal; fill required field.
    //   4. Intercept POST; fulfill with 200 + the existing row's shape
    //      (per the route's idempotent path).
    //   5. Submit.
    //   6. Assert the table still has exactly one row with clientId =
    //      'fixed-uuid-for-test' (no double-listing). handleTextAdded's
    //      clientId-dedup is load-bearing here.
  });
});
