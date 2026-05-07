# COMPETITION SCRAPING — VISUAL-VERIFICATION BACKLOG

**Group:** B (tool-specific; loaded when W#2 work is in scope).
**Workflow:** W#2 Competition Scraping & Deep Analysis.
**Branch:** `workflow-2-competition-scraping`.
**Created:** 2026-05-07 in `session_2026-05-07_w2-plos-side-viewer-detail-page-slice` (Claude Code).
**Last updated:** 2026-05-07 (Slice (a.2) — image gallery + viewer modal — section appended in `session_2026-05-07-b_w2-plos-side-viewer-image-expand`).

---

## Why this doc exists

W#2 PLOS-side slices ship UI faster than the data needed to populate it. The Chrome extension (slice (c) on the W#2 ROADMAP next-session list) is the canonical data-entry path; until it lands, every PLOS-side viewer slice is structurally untestable against real captured data because there is no manual-URL-add affordance on the PLOS side yet (deliberately deferred per the director's 2026-05-07 call — the alternative seed paths were declared not worth the friction vs. just waiting).

Rather than hold each slice's commit on a verification step that can't run, the director chose 2026-05-07: **defer all visual verification of W#2 PLOS-side UI until the extension build provides a data path; maintain a per-slice running tally of pending visual checks here; walk through each slice's checks together when the extension is up.**

This doc is the running tally.

---

## Format

Each slice that ships PLOS UI but defers visual verification appends one section here. Each section is append-only at slice-shipped time. When a slice's verifications all complete (post-extension-build walkthrough), the section's heading flips from "PENDING" to "✅ DONE YYYY-MM-DD" with a one-line note on outcome — the body stays unchanged for historical reference.

```
## Slice (a.x) — <one-line slice description> — PENDING <date shipped>
- [ ] Step 1: <click-by-click test>
- [ ] Step 2: <…>
...
- Notes: any edge cases to watch for; any seed-data prerequisites once extension exists
```

---

## Slice (a.1) — `/url/[urlId]` detail page (chrome + sizes + captured-text rows + image-count placeholder) — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Click-row navigation change.** From the workflow root page (`/projects/<projectId>/competition-scraping`), click any row in the URL table. Expected: navigates IN-APP to `/projects/<projectId>/competition-scraping/url/<urlId>` instead of opening the competitor's website in a new tab.
- [ ] **Step 2 — Topbar.** Detail page renders the standard `<WorkflowTopbar>`: "Competition Scraping & Deep Analysis" title with the 🔍 icon + back-to-Project link.
- [ ] **Step 3 — Sub-breadcrumb.** "Competition Scraping › [Platform Name] › [shortened URL]". First segment links back to the URL list (no platform filter); second segment links back to the URL list scoped to that platform (URL bar shows `?platform=<name>`); third segment is the current URL, not a link.
- [ ] **Step 4 — URL metadata card.** URL text in blue + "Open original URL ↗" button (preserves the prior open-in-new-tab affordance). Read-only grid of fields: Platform, Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank, Added On, Last Updated. Empty fields show a gray italic "—". If `customFields` is non-empty, sub-grid at the bottom.
- [ ] **Step 5 — Sizes / Options sub-section.** Read-only table with Size/Option, Price, Shipping Cost, Added On. Empty state: "No sizes captured for this URL yet." Loading state: "Loading sizes…". Error state: red.
- [ ] **Step 6 — Captured Text sub-section.** Sortable table with Content Category, Text (wraps), Tags, Added On. Header includes `(N)` count. Default sort: Added On descending. Sort works on all columns except Tags. Empty state names the extension's gestures.
- [ ] **Step 7 — Image-count placeholder.** "N images captured for this URL — full-size viewer ships in slice (a.2)" or "No images captured for this URL yet." or red error message when the read fails. Image rendering itself is slice (a.2).
- [ ] **Step 8 — Stale URL ID (404).** Edit URL bar to a urlId that doesn't exist. Expected: "Couldn't load this URL — Competitor URL not found." Sub-sections do NOT render (page short-circuits on URL-row 404).
- [ ] **Step 9 — Forged URL ID (403-ish).** Edit URL bar to a urlId that belongs to a different Project. Expected: same 404 path because `verifyProjectWorkflowAuth` + projectWorkflowId scoping returns 404 (not the row's data) for cross-Project access attempts.
- [ ] **Step 10 — Refresh.** Hard-refresh (Ctrl+Shift+R) the detail page. Re-fetches all four reads cleanly.
- [ ] **Step 11 — Back button preserves URL list state.** From detail page, click breadcrumb's "[Platform Name]" link. URL list lands with that platform pre-selected in the sidebar (URL bar shows `?platform=<name>`).
- [ ] **Step 12 — Section independence.** If one of the sub-fetches errors but URL row + others succeed, the failing section shows its own red error message in-place; the rest of the page renders normally.

**Seed-data prerequisites** (before walking through these tests):

- At least one CompetitorUrl row owned by the verifying user, with non-empty Product Name + Brand Name + Category + ratings + customFields so Step 4 exercises non-null cells.
- At least one CompetitorUrl that's "minimum-fields-only" (just URL + platform; everything else null) so Step 4's "—" rendering is exercised too.
- At least 2 CompetitorSize rows under one URL so Step 5's table-with-rows path is exercised.
- At least 1 CompetitorUrl with zero sizes so Step 5's empty state is exercised.
- At least 3 CapturedText rows (different categories, with and without tags) under one URL so Step 6's sort + tag display is exercised.
- At least 1 CapturedImage row (any category) under one URL so Step 7's "N images captured" path is exercised + at least one URL with zero images for the empty path.

**API-side already verified (no extension needed):**

- The four GET read paths returning 200 with sane JSON, and 404 for stale + cross-Project urlIds, can be confirmed via `curl` with a Bearer JWT or DevTools console fetch even before extension data lands. Today's TypeScript build + lint already exercise the type contracts. A separate quick-check session could exercise the 404 + 200-with-empty paths via curl-with-known-Project before the full visual walkthrough.

---

## Slice (a.2) — image gallery + full-size viewer modal — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.2) replaces slice (a.1)'s image-COUNT placeholder with: (1) a thumbnail grid (200×200 contain-fit thumbnails fetched via Supabase on-the-fly transform signed URLs) and (2) a click-to-open full-size viewer modal with metadata sidebar + arrow-key prev/next + Esc/backdrop/✕-close. Server-side, the existing `GET .../urls/[urlId]/images` list route now mints both thumbnail + full-size signed URLs (1-hour TTL each) and embeds them in the response so the client renders in a single round-trip.

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Thumbnail grid renders.** From `/projects/<projectId>/competition-scraping/url/<urlId>` with at least 4 captured images, the Captured Images section shows a grid of 200×200 thumbnails with the running `(N)` count in the section heading. Contain-fit so non-square images don't get cropped.
- [ ] **Step 2 — Region-screenshot badge.** Any image whose `sourceType === "region-screenshot"` shows a small "screenshot" badge in the bottom-right corner of its thumbnail.
- [ ] **Step 3 — Click-to-open modal.** Click any thumbnail. Expected: dark backdrop overlay opens with the full-size image on the left and a metadata sidebar on the right (Category, Source, Dimensions, Added on, Composition, Embedded text, Tags). Background scroll is locked while the modal is open.
- [ ] **Step 4 — Modal close paths.** Modal closes cleanly via (a) ✕ button top-right, (b) clicking the dark backdrop outside the modal frame, (c) pressing Esc. Background scroll unlocks on every close path.
- [ ] **Step 5 — Arrow-key navigation.** With the modal open and the URL having ≥ 2 images, press ArrowRight repeatedly: each press advances to the next image; press ArrowLeft to go back. The image counter (e.g. `3 / 12`) updates correctly. Wrap-around works (last image's "next" goes to first; first image's "prev" goes to last).
- [ ] **Step 6 — Single-image case.** With a URL that has exactly 1 image, the modal opens but shows no prev/next chevrons and no `1 / 1` counter (or shows it minimally). Arrow keys are no-ops.
- [ ] **Step 7 — Metadata sidebar — populated.** With an image whose composition + embeddedText + tags are all set, the sidebar renders all of them. Multi-line composition or embedded text wraps correctly within the 320px sidebar width.
- [ ] **Step 8 — Metadata sidebar — null fields.** With an image whose composition + embeddedText + tags are empty, the sidebar shows italic gray "—" for each. Source-type still shows ("Regular image" or "Region screenshot"). Added-on always shows.
- [ ] **Step 9 — Broken thumbnail fallback.** Force a thumbnail to fail (DevTools → Network → block the signed-URL request). Expected: that thumbnail's tile shows "Image failed to load" red text rather than a broken-image icon. Other thumbnails in the grid render normally.
- [ ] **Step 10 — Broken full-size in modal.** Force the modal's full-size image to fail (DevTools → Network → block when modal opens). Expected: "Image failed to load. The signed link may have expired — refresh this page to mint a new one." red message in the modal's left pane. Sidebar still renders normally.
- [ ] **Step 11 — Empty / loading / error states on the gallery section.** Confirm: empty case ("No images captured for this URL yet…"); loading case ("Loading captured images…" while the GET is in flight); error case (red message body) when the GET 500s or 404s. These mirror the slice (a.1) image-count placeholder behavior.
- [ ] **Step 12 — Signed-URL TTL boundary (manual).** Wait > 1 hour after page load with the page still mounted, then click a thumbnail. The full-size image fails to load (Step 10's path). Acceptable behavior: refresh to re-mint; explicit refresh-recovery message tells the user what to do.
- [ ] **Step 13 — Cross-Project signed URL (smoke).** Confirm via DevTools that the signed URLs returned from the list belong to the bucket-prefixed `competition-scraping/{projectId}/...` path; a second user without access to this Project would not be able to load these images server-side (the JWT belongs to this user, not the URL — this is a signed-URL property test, not a cross-project leak test).
- [ ] **Step 14 — Lint + build + tests parity (already confirmed at commit time).** 16e/40w; build clean at 49 routes; 393/393 src/lib tests pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 4 `CapturedImage` rows under one URL covering a mix of jpeg + png + webp MIMEs and at least one with `sourceType: "region-screenshot"` (Step 2 + Step 3 + Step 5).
- At least 1 image with **all** sidebar fields populated (composition + embeddedText + tags) and at least 1 image with **none** populated (Step 7 + Step 8).
- At least 1 URL with exactly 1 captured image (Step 6).
- At least 1 URL with 0 captured images (Step 11 empty state — already covered in slice (a.1) prerequisites).
- A non-square image (e.g., 1920×600 banner) so Step 1's contain-fit can be visually distinguished from cover-fit.

**API-side confirmation already exercised at commit time:**

- TypeScript types for `CapturedImageWithUrls` + `ListCapturedImagesResponse` updated (additive on the wire — bare `CapturedImage` unchanged for PATCH / finalize / etc.).
- The list endpoint mints thumbnail + full-size URLs server-side via the existing `competition-storage.ts` helper (`getThumbnailUrl` / `getFullSizeUrl`); routes' `withRetry` + `recordFlake` + CORS preserved.
- Build clean at 49 routes (zero new); `tsc` clean; lint at exact 16e/40w baseline parity with slice (a.1); 393/393 src/lib tests pass.

---
END OF DOCUMENT
