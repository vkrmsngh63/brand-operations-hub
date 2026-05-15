// W#2 P-29 Slice #3 — manual-add captured-image modal regression spec.
//
// Spec target: src/app/projects/[projectId]/competition-scraping/components/
//   CapturedImageAddModal.tsx + UrlDetailContent.tsx wire-in (the
//   "+ Manually add captured image" button + refreshImages refetch).
// API targets:
//   - POST .../urls/[urlId]/images/requestUpload (Phase 1, drag-drop +
//     paste paths)
//   - PUT signed Supabase URL (Phase 2, drag-drop + paste paths)
//   - POST .../urls/[urlId]/images/fetch-by-url (Phase 0, URL-of-image
//     path — server-side SSRF-guarded fetch + storage upload)
//   - POST .../urls/[urlId]/images/finalize with `source: 'manual'` on
//     all three paths.
//
// Verification approach picked 2026-05-15 per Rule 27 (forced-picker for
// the P-29 family): Hybrid — Playwright covers mechanical regression-
// prone parts; director manual walkthrough covers visual-judgment +
// real-independent-website end-to-end smoke. Slice #3 reuses the same
// Hybrid pick (no fresh picker needed — same component class as Slices
// #1 + #2).
//
// SCOPE OF THIS FILE — what's tested here vs. covered elsewhere:
//
//   ✅ Tested here (when the stub-page rig lands):
//     - "+ Manually add captured image" button renders at the right end
//       of the Captured Images section's h2 row.
//     - Clicking the button opens the modal.
//     - Submit-disabled when no image is loaded.
//     - Drag-drop modality: dragover toggles dropzone highlight; drop a
//       valid JPEG/PNG/WebP populates the loaded-image state + preview.
//     - Drag-drop modality: drop an oversize image (>5 MB) shows the
//       inline error + leaves loaded state empty.
//     - Drag-drop modality: drop a non-image file shows the inline error.
//     - Drag-drop modality: multi-file drop loads the first + shows the
//       inline warning that the rest were dropped.
//     - Paste modality: a paste event with a clipboard image item loads
//       it into the modal (preview appears).
//     - URL modality: typing a URL + clicking Fetch image POSTs
//       imageUrl to fetch-by-url; on 200 the preview thumbnail appears
//       from the response's previewUrl.
//     - URL modality: 403 with reason='private-v4' (SSRF block) shows the
//       inline error.
//     - URL modality: URL without http://https:// shows client-side
//       inline error before any POST.
//     - Submit (drag-drop path): Phase 1 requestUpload POST has shape
//       { clientId: uuid4, mimeType, fileSize, sourceType: 'regular' };
//       Phase 2 PUT to signed URL with bytes; Phase 3 finalize POST has
//       shape { clientId, capturedImageId, mimeType, sourceType,
//       fileSize, source: 'manual' }.
//     - Submit (URL path): skips Phase 1 + 2; only Phase 3 finalize POST
//       with the capturedImageId from fetch-by-url response.
//     - Modal closes on success.
//     - refreshImages fires after successful save (intercept the GET
//       .../images list call).
//     - Escape + backdrop + Cancel + X dismiss the modal (only when not
//       submitting / not fetching).
//     - "Replace…" button on the loaded preview clears the image and
//       returns the modal to idle state.
//
//   ⏸ Tracked as DEFERRED — needs P-30 React-bundle stub-page rig:
//     - All test cases in this file are currently `test.skip()` because
//       the bundling rig (esbuild ES module of React + ReactDOM +
//       CapturedImageAddModal + VocabularyPicker + the gallery wrapper +
//       stubbed authFetch + clipboard/drag-drop mocks + mount script +
//       static test-page.html) does not yet exist. P-30 will extend its
//       single rig to cover Slice #1 + Slice #2 + Slice #3 specs.
//     - Tracked at: docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//       P-30 polish-backlog entry (added 2026-05-15-b).
//
//   ⏸ Tracked as DEFERRED — needs route-handler DI refactor:
//     - API-layer regression of the new fetch-by-url route's SSRF guard
//       behavior at the route level (auth gate, parent-URL check, body
//       validation, SSRF rejection HTTP codes, content-type check,
//       size-cap check). The pure SSRF-guard logic IS covered today by
//       src/lib/ssrf-guard.test.ts (37 node:test cases). The
//       route-handler integration coverage waits for P-31's DI refactor
//       (pattern extends from urls/route.ts to the new fetch-by-url +
//       finalize routes).
//     - Tracked at: docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md
//       P-31 polish-backlog entry.
//
//   ✅ Covered today by other means:
//     - SSRF guardrail correctness — src/lib/ssrf-guard.test.ts (37
//       node:test cases; private/loopback/link-local/cgnat/multicast/
//       reserved/IPv6/IPv4-mapped/NAT64/metadata-hostname/scheme + DNS
//       rebind catch).
//     - `isSource` type-guard regression — already covered by
//       src/lib/shared-types/competition-scraping.test.ts (the same
//       guard the finalize route's source validation branch calls).
//     - End-to-end smoke (real auth + real DB + a manually-added
//       captured-image row appearing in the URL-detail page's gallery
//       across all three modalities) — director manual walkthrough on
//       vklf.com in the next W#2 → main deploy session.
//     - TypeScript compile catches any future shape drift between modal
//       form payload and FinalizeImageUploadRequest /
//       FetchImageByUrlResponse / RequestImageUploadRequest /
//       RequestImageUploadResponse.
//
// Why this file exists today even with everything skipped: making the
// regression intent visible in the repo NOW means the future P-30 rig
// session has a known target (this file's skipped tests are the spec).
// Without this file the future work has only memory + handoff docs to
// pull from.

import { test } from '@playwright/test';

test.describe('W#2 P-29 Slice #3 — manual-add captured-image modal (UI mechanical)', () => {
  test.skip(true, 'P-30 — React-bundle stub-page rig not yet built; see file header for DEFERRED tracking.');

  test('"+ Manually add captured image" button renders in section header', async () => {
    // Stub-page test (deferred):
    //   1. Goto /p29-manual-add-captured-image-modal.test.html (stub
    //      page mounting the CapturedImagesGallery wrapper with a
    //      static image row set + CapturedImageAddModal).
    //   2. Assert button [data-testid="manual-add-captured-image-button"]
    //      is visible and is rendered to the right of the "Captured
    //      Images" h2 in the section header row.
  });

  test('Clicking the button opens the modal', async () => {
    // Stub-page test (deferred):
    //   1. Goto stub page.
    //   2. Click [data-testid="manual-add-captured-image-button"].
    //   3. Assert [role="dialog"][aria-labelledby=
    //      "captured-image-add-modal-title"] becomes visible.
    //   4. Assert the drop zone [data-testid="image-drop-zone"] is
    //      visible (idle state — no image loaded).
    //   5. Assert the URL input field is visible alongside the Fetch
    //      image button.
  });

  test('Submit-disabled when no image is loaded', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Assert [data-testid="captured-image-add-modal-submit"] has
    //      `disabled` attribute true.
    //   3. Fill optional metadata fields only (no image).
    //   4. Assert submit STILL disabled.
  });

  test('Drag-drop a valid JPEG populates the preview', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Use page.dispatchEvent or page.locator().setInputFiles via
    //      the hidden file input to simulate a drop of a 100x100 JPEG.
    //   3. Assert dropzone disappears, preview <img> appears with
    //      src matching object-url (blob:).
    //   4. Assert mime + size text shows "image/jpeg · 8 KB"
    //      (approximate).
  });

  test('Drag-drop an oversize image shows inline error', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Drop a 6 MB JPEG.
    //   3. Assert [role="alert"] shows the >5 MB error.
    //   4. Assert preview area does NOT appear (loaded state empty).
  });

  test('Drag-drop a non-image file shows inline error', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Drop a text file (.txt) named "notes.txt".
    //   3. Assert [role="alert"] shows the "type not supported" error.
  });

  test('Multi-file drop loads first + shows warning', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Drop a DataTransfer with 3 image files.
    //   3. Assert [role="status"] warning that 2 files were dropped.
    //   4. Assert preview shows the first file's name.
  });

  test('Paste-from-clipboard event loads image', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Dispatch a `paste` event whose clipboardData.items contains
    //      a single image/png file blob.
    //   3. Assert preview appears with the pasted image.
  });

  test('URL fetch — successful 200 populates preview', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Type a URL into the URL input.
    //   3. Intercept POST .../fetch-by-url and fulfill 200 with a fake
    //      FetchImageByUrlResponse including a valid previewUrl
    //      pointing at a 1x1 test PNG.
    //   4. Click Fetch image (or press Enter in the URL input).
    //   5. Assert preview <img> appears with src === the previewUrl.
    //   6. Assert metadata text shows "image/png · <size> · fetched
    //      from URL".
  });

  test('URL fetch — 403 SSRF block shows inline error', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Type a URL.
    //   3. Intercept POST .../fetch-by-url and fulfill 403 with
    //      { error: '<the user-facing message>', reason: 'private-v4' }.
    //   4. Click Fetch image.
    //   5. Assert [role="alert"] shows the server's user-facing message.
    //   6. Assert preview does NOT appear.
  });

  test('URL fetch — client-side reject of bare-domain input', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Type "example.com/img.png" (no scheme).
    //   3. Click Fetch image.
    //   4. Assert [role="alert"] shows the http:// / https:// hint.
    //   5. Assert NO POST was issued to fetch-by-url (interception
    //      count = 0).
  });

  test('Submit (drag-drop path) posts requestUpload + PUT + finalize', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Drop a 100x100 PNG.
    //   3. Intercept POST .../requestUpload — capture body; fulfill
    //      with a fake RequestImageUploadResponse.
    //   4. Intercept PUT to the fake uploadUrl — capture body; fulfill
    //      with 200.
    //   5. Intercept POST .../finalize — capture body; fulfill with
    //      201 + a fake CapturedImage row (source: 'manual').
    //   6. Click Save captured image.
    //   7. Assert requestUpload body shape: {clientId: uuid4,
    //      mimeType: 'image/png', fileSize: N, sourceType: 'regular'}.
    //   8. Assert PUT body is the bytes (length matches fileSize).
    //   9. Assert finalize body shape: {clientId (same uuid),
    //      capturedImageId (from phase1 response), mimeType, sourceType:
    //      'regular', fileSize, source: 'manual'}.
    //  10. Assert modal closes after the 201.
  });

  test('Submit (URL path) skips Phase 1+2 and only posts finalize', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal.
    //   2. Type URL + click Fetch image; fulfill fetch-by-url 200 with
    //      capturedImageId='cap-uuid-X'.
    //   3. Intercept POST .../finalize — capture body; fulfill 201.
    //   4. Click Save captured image.
    //   5. Assert NO requestUpload + NO signed-URL PUT were issued.
    //   6. Assert finalize body.capturedImageId === 'cap-uuid-X' AND
    //      body.source === 'manual'.
  });

  test('refreshImages fires after successful save', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal; drop an image; submit; assert success.
    //   2. Assert GET .../images was called AFTER the finalize 201
    //      (interception ordering check). This is the parent
    //      UrlDetailContent.refreshImages call — the gallery should
    //      update with the fresh list (signed URLs minted server-side).
  });

  test('Modal stays open + shows error on finalize 4xx', async () => {
    // Stub-page test (deferred):
    //   1. Open the modal; drop image; intercept finalize → 400
    //      { error: 'source must be one of: extension, manual' }.
    //   2. Click Save captured image.
    //   3. Assert [role="alert"] shows the server message.
    //   4. Assert modal stays open.
  });

  test('Escape + backdrop + Cancel + X all close the modal', async () => {
    // Stub-page test (deferred): exercise each dismiss path; only
    // active when not submitting / not fetching-by-url. Re-open the
    // modal between paths.
  });

  test('"Replace…" button clears loaded image + returns to idle', async () => {
    // Stub-page test (deferred):
    //   1. Open modal; drop image; assert preview visible.
    //   2. Click Replace… button.
    //   3. Assert preview gone; dropzone + URL input visible again.
    //   4. Drop a different image; assert new preview appears.
  });
});
