# COMPETITION SCRAPING — VISUAL-VERIFICATION BACKLOG

**Group:** B (tool-specific; loaded when W#2 work is in scope).
**Workflow:** W#2 Competition Scraping & Deep Analysis.
**Branch:** `workflow-2-competition-scraping`.
**Created:** 2026-05-07 in `session_2026-05-07_w2-plos-side-viewer-detail-page-slice` (Claude Code).
**Last updated:** 2026-05-07-i (Waypoint #1 verification ATTEMPTED — PARTIAL outcome — DEPLOY-GAP BLOCKER FOUND. Director worked through extension-session-1 Steps 1-8 in `session_2026-05-07-i_w2-waypoint-1-verification-pass-1`. Steps 1-7 ✅ (download zip / unzip / open chrome://extensions / Developer Mode ON / Load unpacked / Pin / Open popup pre-sign-in screen). Step 8 PARTIAL — sign-in via Supabase ✅, but the post-sign-in project-list path returned **"Couldn't load your projects: Failed to fetch"**. Root cause diagnosed: the OPTIONS handler + `withCors` wrap on `src/app/api/projects/route.ts` exists on `workflow-2-competition-scraping` (commit `5b4a3e8`) but NOT on `origin/main` (last touched 2026-05-03 by `58fe5e6` flake-rate instrumentation, unrelated). vklf.com runs `main` and lacks the CORS handler, so the extension's preflight fails. Same gap blocks all extension API calls: ~24 W#2 API routes (URL save/edit/delete, image upload, vocabulary, reset, janitor) + the schema migration for 7 W#2 tables are also W#2-branch-only and not yet on `main`. Director chose via Rule 14f to **end this session and dedicate next session to the W#2 → main deploy** rather than cherry-pick or cowboy-merge mid-verification. Waypoint #1 verification will resume in a fresh session AFTER the deploy session lands cleanly. Steps 9-18 of session-1 + all of sessions 2-3 untouched today; flag stays PENDING until the resumed verification.)
**Previously updated:** 2026-05-07-h (Extension build — session 3 — section appended in `session_2026-05-07-h_w2-extension-build-session-3` after director's standing directive to defer all manual testing. Session 3 shipped Module 1 URL-capture content script for 4 shopping platforms.)
**Previously updated:** 2026-05-07-g (Extension build — session 2 — section appended in `session_2026-05-07-g_w2-extension-build-session-2` after director's standing directive to defer all manual testing to the verification waypoints below. Session 2 shipped the popup project-picker + platform-picker + Highlight-Terms color-palette UI per `COMPETITION_SCRAPING_STACK_DECISIONS.md §6` + `COMPETITION_SCRAPING_DESIGN.md §A.7` Module 1 setup flow; tests appended below land in Waypoint #1's coverage.)
**Previously updated:** 2026-05-07-f (Extension build — session 1 — section appended in `session_2026-05-07-f_w2-extension-build-session-1` after director's directive to defer all manual testing. **End-of-session refinement:** the "ONE post-coding verification session" plan was split into THREE verification waypoints — see "Verification waypoints" section below).

---

## Why this doc exists

W#2 PLOS-side slices ship UI faster than the data needed to populate it. The Chrome extension (slice (c) on the W#2 ROADMAP next-session list) is the canonical data-entry path; until it lands, every PLOS-side viewer slice is structurally untestable against real captured data because there is no manual-URL-add affordance on the PLOS side yet (deliberately deferred per the director's 2026-05-07 call — the alternative seed paths were declared not worth the friction vs. just waiting).

Rather than hold each slice's commit on a verification step that can't run, the director chose 2026-05-07: **defer all visual verification of W#2 PLOS-side UI until the extension build provides a data path; maintain a per-slice running tally of pending visual checks here; walk through each slice's checks together when the extension is up.**

This doc is the running tally.

---

## 🚨 Waypoint #1 attempt log (NEW 2026-05-07-i)

| Attempt | Date | Outcome | Step coverage | Blocker | Disposition |
|---|---|---|---|---|---|
| #1 | 2026-05-07-i | PARTIAL | Session-1 Steps 1-7 ✅; Step 8 PARTIAL (sign-in OK, project-list blocked); Steps 9-18 + sessions 2-3 not exercised | **DEPLOY GAP** — OPTIONS/withCors handler on `src/app/api/projects/route.ts` exists on `workflow-2-competition-scraping` (commit `5b4a3e8` 2026-05-07) but NOT on `origin/main` (last touched 2026-05-03 by unrelated `58fe5e6`). Same gap blocks all extension API calls — schema for 7 W#2 tables + ~24 W#2 API routes also W#2-branch-only. | Director chose via Rule 14f to end session here and dedicate next session to W#2 → main deploy as its own focused effort (proper schema-state verification on prod, full merge, push, watch redeploy, visual-verify W#1 stays healthy). Waypoint #1 resumes in a fresh session AFTER deploy lands. |

**Cross-references for the deploy-gap finding:** `ROADMAP.md` Active Tools W#2 row Next Session list (NEW top item: W#2 → main full deploy session); `CORRECTIONS_LOG.md` 2026-05-07-i entry (procedural lesson — verification waypoint can't fire when prerequisite deployment hasn't landed; future build sessions should explicitly note "this slice's verification needs main-deploy of [X commits] before it can fire" as a deferred-item per Rule 14e).

---

## Verification waypoints (set 2026-05-07-f)

The original directive was "defer all manual testing to ONE post-coding verification session." End-of-session 2026-05-07-f, the director refined this to **THREE verification waypoints split across the remaining build sessions**, both to keep each walkthrough at a manageable size and to shorten the find-a-problem-deep-in-the-stack feedback loop.

| Waypoint | Fires after | Cumulative coverage | Approx. test count |
|---|---|---|---|
| **#1** | Extension session 3 (Module 1 URL-capture lands) | Slice (a.1)–(a.4) + slice (b) Detailed User Guide + extension sessions 1–3 (install / auth / popup pickers / URL capture). Simplest end-to-end loop: install → sign in → pick Project + platform → capture a competitor URL → see it on the PLOS viewer. | ~50–80 |
| **#2** | Extension session 5 (image upload lands) | Adds extension session 4 (text + image capture flows) + extension session 5 (two-phase signed-URL image upload). Full data-capture surface exists. | ~70–80 incremental; ~120–150 cumulative |
| **#3** | Extension session 7 (distribution polish lands; all coding done) | Adds extension session 6 (WAL + failed-write queue + tab-close guard + sync indicator + periodic reconciler) + extension session 7 (distribution polish). | ~50 incremental; ~150–200 cumulative |

**Waypoint discipline:** when a waypoint runs, every section heading covered by that waypoint flips from `PENDING <date>` to `✅ DONE <date>` with a one-line outcome note (the body stays unchanged for historical reference per the format below). Subsequent waypoints only walk through sections still in `PENDING` state plus any new sections appended since the prior waypoint.

**Per-waypoint session structure:**

1. Director runs through every `PENDING` step in the relevant sections. Each step is checked off in the file as it passes (or annotated with a failure note if it doesn't).
2. Failures get either: (a) immediate fix this session if small, or (b) a new `DEFERRED:` task per Rule 26 with destination doc + section named.
3. End-of-session: heading flipped to ✅ DONE; backlog committed.

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

## Slice (a.3) — inline editing of URL fields (vocabulary picker for category/product/brand; numeric inputs for ratings; key/value editor for custom fields) — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.3) replaces the slice-(a.1) read-only metadata grid in the URL detail page with per-field inline editing. Each editable field shows a small pencil ✎ next to its label; clicking the pencil swaps that one field into edit mode; ✓ saves (or Enter), ✕ cancels (or Esc). One PATCH per save; optimistic update via the server's authoritative response; rollback on error with an inline red message under the field. Three fields use a typeahead vocabulary picker (Competition Category, Product Name, Brand Name), backed by `GET /api/projects/[projectId]/vocabulary?type=...` for suggestions and `POST /api/projects/[projectId]/vocabulary` for "+ Create '<typed value>'". Five fields use numeric inputs (Product Stars + Seller Stars 0.0–5.0 step 0.1, # Product Reviews + # Seller Reviews integer ≥ 0, Results Page Rank integer ≥ 1). Custom fields render as a key/value list with per-row pencil ✎ + ✕ delete, plus an "+ Add custom field" button. Platform / Added On / Last Updated stay read-only (re-targeting platform is rare + needs its own confirm-dialog dance, deliberately deferred).

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Pencil affordance + entry into edit mode.** Hover any of the 8 editable fields (Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank). The label row shows a small `✎`. Click the pencil — the field swaps to an input; the read-only value disappears; ✓ + ✕ buttons appear inline.
- [ ] **Step 2 — Cancel paths.** Click ✕ — the field reverts to read mode showing the original value, untouched on the server. With the field in edit mode, press Esc — same behavior. With the field in edit mode, click outside the field — the field stays in edit mode (no implicit cancel-on-blur — the user has to commit or cancel explicitly).
- [ ] **Step 3 — Plain-number save (Product Stars).** Click pencil on Product Stars; type `4.3`; press Enter. Field returns to read mode showing "4.3". Refresh the page → still "4.3". Server PATCH log shows `{ productStarRating: 4.3 }` only (single-field PATCH).
- [ ] **Step 4 — Number range validation.** Click pencil on Product Stars; type `7`; press Enter. Inline red message reads "Must be ≤ 5." Field stays in edit mode; the value is NOT saved. Same path with `-1` reads "Must be ≥ 0." Same path with `abc` reads "Enter a number…, or leave empty."
- [ ] **Step 5 — Integer enforcement.** Click pencil on # Product Reviews; type `3.5`; press Enter. The integer parser drops the decimal; saved value = 3 (or, depending on the input element's number-only handling, the input itself rejects the decimal). Confirm by re-opening the edit field — it shows `3`.
- [ ] **Step 6 — Clear-to-null.** Click pencil on any rating field that already has a value; clear the input to empty; press Enter. Field returns to read mode showing italic gray "—" (the null state). Refresh → still "—". PATCH log shows `{ <field>: null }`.
- [ ] **Step 7 — Vocabulary picker — first open with empty vocabulary.** First-ever click on Brand Name's pencil for a Project that has never added any brands. The popover opens showing "No suggestions yet — start typing to add one." Type "Acme"; the popover updates to show a single row at the bottom: `+ Create "Acme"`. Click that row. Server log shows `POST /vocabulary { vocabularyType: "brand-name", value: "Acme" }` (201) followed by `PATCH .../urls/[urlId] { brandName: "Acme" }` (200). Field returns to read mode showing "Acme".
- [ ] **Step 8 — Vocabulary picker — existing entries.** Click pencil on Brand Name (now that "Acme" exists). The popover lists "Acme" as an existing suggestion. Type "ac" — list filters to "Acme" only. Click "Acme" — field saves "Acme" via PATCH; no extra POST to /vocabulary (the existing entry was reused).
- [ ] **Step 9 — Vocabulary picker — duplicate creation is idempotent.** Click pencil on Brand Name on a different URL row. Type "Acme" exactly. Popover shows "Acme" as exact match (NO "+ Create" row). Click "Acme" — field saves "Acme" via PATCH only. Now type "ACME" (different case). Popover shows "Acme" filtered (case-insensitive match) AND "+ Create 'ACME'" because the case-different version is technically not in the list. Pick "+ Create" — server returns 200 (existing row, the unique constraint is on exact case); local list updates with the canonical case. Field saves.
- [ ] **Step 10 — Vocabulary picker — outside-click closes popover.** Open the picker; click anywhere outside the popover. Popover closes; field stays in edit mode showing whatever was last typed; ✓ / ✕ buttons still work to commit or cancel.
- [ ] **Step 11 — Vocabulary picker cross-Project isolation.** Open the picker on URL detail page for Project A's URL. Confirm the suggestion list contains only Project A's vocabulary entries. Switch to Project B's URL detail page (different projectId in the URL). Open the picker for the same field — confirm the suggestion list contains only Project B's vocabulary entries (no leakage; vocabularies are project-scoped per `PLATFORM_REQUIREMENTS.md §8.4`).
- [ ] **Step 12 — Custom fields — empty state.** With a URL whose customFields is `{}`, the Custom fields section reads "Custom fields  (none yet)" with an "+ Add custom field" button.
- [ ] **Step 13 — Custom fields — add.** Click "+ Add custom field". Two inputs appear: name + value. Type `material` + `cotton blend`; press Enter. Row appears in the grid: `material: cotton blend`. Refresh — still there. PATCH log shows `{ customFields: { material: "cotton blend" } }`.
- [ ] **Step 14 — Custom fields — edit.** Hover the `material` row; click ✎. Inputs appear pre-filled with `material` + `cotton blend`. Change value to `100% cotton`; press Enter. Row updates. PATCH log shows `{ customFields: { material: "100% cotton" } }`.
- [ ] **Step 15 — Custom fields — rename preserves order.** With customFields = `{ a: "1", b: "2", c: "3" }`, edit the `b` row's name to `B`. Confirm the resulting grid is `a, B, c` (rename keeps position) — NOT `a, c, B` (which would be the spread-and-add behavior).
- [ ] **Step 16 — Custom fields — duplicate name rejected.** With customFields = `{ a: "1", b: "2" }`, edit `a`'s name to `b`. Inline red message reads "A field named 'b' already exists." Field stays in edit mode; nothing saved.
- [ ] **Step 17 — Custom fields — delete.** Click the `✕` next to `material`. Row disappears; PATCH log shows `{ customFields: { ... without material ... } }`. Refresh — still gone.
- [ ] **Step 18 — Optimistic update + rollback on PATCH 500.** DevTools → Network → block `PATCH .../urls/[urlId]`. Edit Product Stars to `4.5`; press Enter. Inline red message under the field: "Save failed (HTTP …)." Field stays in edit mode; the server-side row is unchanged. Cancel the edit — the read-mode value reverts to the prior server value cleanly.
- [ ] **Step 19 — 404 path (URL deleted in another tab).** In Tab A, open the URL detail page. In Tab B, delete that URL via the API. Back in Tab A, edit a field and save. Inline red message: "This URL no longer exists." Field stays in edit mode; the user can navigate back to the URL list via the breadcrumb.
- [ ] **Step 20 — Concurrent edits across tabs.** In Tab A, edit Brand Name to "Acme". In Tab B (open before Tab A's save), the page still shows the prior value. Tab B's hard-refresh re-fetches and shows "Acme". (No live-sync claim — slice (a.3) is single-tab; live-sync is a future polish.)
- [ ] **Step 21 — Keyboard-only flow.** Tab into a field's pencil; press Enter to enter edit mode (the pencil is a button, so Enter activates it). Type a value; press Enter again to save. Tab to the next field's pencil. Confirm the entire edit flow works without a mouse.
- [ ] **Step 22 — Read-only fields still read-only.** Platform / Added On / Last Updated have NO pencil and NO inline edit affordance. Confirm visually + by trying to click their label area (no edit-mode swap should occur).
- [ ] **Step 23 — Lint + build + tests parity.** At commit time: `npx tsc --noEmit` clean; `npm run build` clean (49 routes — same as slice (a.2)); `npx eslint src` reports 13 errors / 39 warnings (zero NEW issues from slice (a.3) files; baseline drifted from slice (a.2)'s 16e/40w during the 2026-05-06 main merge — the 13 errors all live in `think-tank/page.tsx`, `keyword-clustering/components/TVTTable.tsx`, etc., outside the W#2 surface); `node --test --experimental-strip-types 'src/lib/**/*.test.ts'` reports 393/393 pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 1 CompetitorUrl row owned by the verifying user, all editable fields populated (covers Step 1 hover + Step 2 cancel paths + Step 3 + Step 6 clear-to-null + Step 22 read-only-fields-stay-read-only).
- At least 1 CompetitorUrl row with all editable fields = null (covers the "—"-to-real-value path in Step 6 + the empty-customFields path in Step 12).
- At least 1 CompetitorUrl with non-empty customFields covering ≥ 3 entries with varied value types (covers Step 14 edit + Step 15 rename-preserves-order + Step 16 duplicate-name reject).
- A second Project (Project B) with at least one CompetitorUrl on it AND at least one VocabularyEntry of type `brand-name` distinct from any in Project A (covers Step 11 cross-Project isolation).
- DevTools network-request blocking enabled to exercise the failure paths in Step 18 + Step 19 + the broken-image fallback already covered in slice (a.2)'s backlog.

**API-side confirmation already exercised at commit time:**

- `PATCH .../urls/[urlId]` already supports every field in the slice's scope (route written in API-routes session-1, 2026-05-07). The shared `UpdateCompetitorUrlRequest` type was extended additively to allow `null` on the nullable fields so the inline-edit UI can clear back to "—" without a cast — no runtime change to the route handler (it was already accepting non-string / non-number → null).
- `GET /vocabulary?type=...` + `POST /vocabulary` (idempotent on `(projectId, vocabularyType, value)`) live since API-routes session-1.
- TypeScript types compile (`npx tsc --noEmit` clean). Build clean at 49 routes (zero new — slice (a.3) added no API routes). 393/393 src/lib tests pass.

---

## Slice (a.4) — per-column filter dropdowns on the URL list table — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.4) adds per-column filter controls to the URL list table at `/projects/<projectId>/competition-scraping`. Each filterable column header gets a small funnel icon next to the column label. Clicking the label still toggles sort (existing slice-(a.1) behavior); clicking the funnel opens a popover for that column's filter. The funnel turns blue with a small dot when a filter is active on that column. A "Clear all filters (N active)" button appears in the toolbar when ≥ 1 column filter is active. All filter state — plus the platform sidebar selection AND the search-box query — serialize into the URL query so refresh, browser back/forward, and copy-paste deep-links all preserve the user's exact view.

Filter shapes per column:
- **Product Name / Brand Name / Category** — multi-select checkbox dropdowns. Options are the distinct non-null values present in the current platform-scoped row set (NOT narrowed by other filters). A `(blank)` pseudo-row at the top filters for null/empty rows. Search-within-list input appears when the option count is > 6. "Apply" + "Clear" footer buttons.
- **Product Stars / # Reviews** — min / max number inputs side-by-side. Empty either side = unbounded on that side. Rows with null values fail when any bound is set (a numeric filter implies "rows that have a number"). Apply on Enter or via "Apply" button. Range validation: Min ≤ Max; non-numeric input rejected.
- **Added On** — from / to date inputs (YYYY-MM-DD). Empty either side = unbounded. From ≤ To validation.

URL-query convention:
- `?platform=<name>` — existing
- `?q=<text>` — NEW: free-text search box value, debounced 250ms write so each keystroke doesn't trigger a routing flush
- `?productName=A&productName=B` — repeated keys for multi-select; `__blank__` token for the blank pseudo-value
- `?brandName=...` / `?category=...` — same convention
- `?starsMin=4&starsMax=5` / `?reviewsMin=100&reviewsMax=10000` — numeric ranges
- `?addedFrom=2026-04-01&addedTo=2026-05-01` — date range

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Funnel icon affordance.** From the workflow root page (`/projects/<projectId>/competition-scraping`), confirm each of the 6 filterable column headers (Product Name, Brand Name, Category, Product Stars, # Reviews, Added On) has a small funnel icon to the right of the column label. The URL column has NO funnel (covered by the search box). Hovering the funnel highlights it; clicking the column LABEL (not the funnel) still toggles sort.
- [ ] **Step 2 — Multi-select popover open + outside-click close.** Click the Brand Name funnel. A popover opens below the header showing a list of all distinct brand names captured for the current platform scope (case-insensitive sorted). Click anywhere outside the popover. Popover closes; no filter applied (since user didn't click Apply).
- [ ] **Step 3 — Multi-select Apply.** Open Brand Name popover; check 2 brand boxes; click Apply. Popover closes; the table re-renders with only those 2 brands' rows; Brand Name's funnel turns blue with a small dot; toolbar shows "Clear all filters (1 active)" button. URL updates to include `?brandName=Foo&brandName=Bar` (or with `__blank__` for blank entries).
- [ ] **Step 4 — Multi-select Clear.** With Brand Name filter active, open Brand Name popover; click Clear. Popover closes; filter clears; funnel returns to gray; toolbar's "Clear all filters" button disappears. URL drops the `brandName` keys.
- [ ] **Step 5 — Multi-select with `(blank)` row.** Confirm `(blank)` pseudo-row appears at the top of the list ONLY when at least one platform-scoped row has null/empty Brand Name. Selecting `(blank)` and applying filters in rows with null/empty Brand Name. URL stores it as `?brandName=__blank__`.
- [ ] **Step 6 — Multi-select with empty option list.** On a Project that has no Brand Name values populated AND no null-Brand-Name rows in scope, opening the Brand Name popover shows the empty hint ("No brand names captured yet."). Apply does nothing meaningful (no rows match — but the test confirms the empty case doesn't crash).
- [ ] **Step 7 — Multi-select search-within-list.** With ≥ 7 options in the Product Name list, confirm the search input appears at the top of the popover. Typing "ac" filters the visible options to those containing "ac" (case-insensitive). The blank pseudo-row stays visible regardless of search (or is filtered consistently — confirm the chosen behavior).
- [ ] **Step 8 — Multi-select option set is platform-scoped, NOT search-narrowed.** Type "Acme" in the global search box. Then open Brand Name popover. Confirm the option list still includes ALL brands in the platform scope, NOT just brands matching "Acme". This prevents a "shrinking options" footgun.
- [ ] **Step 9 — Numeric range Apply + range validation.** Open Product Stars popover. Type Min=`4`, Max=`5`. Press Enter. Popover closes; rows with Product Stars in [4, 5] remain. URL gets `?starsMin=4&starsMax=5`. Open the popover again; type Min=`5`, Max=`4`. Press Apply. Inline red error: "Min must be ≤ Max." Filter doesn't change.
- [ ] **Step 10 — Numeric range — null exclusion when bound set.** Add a Min=`4` filter on Product Stars. Confirm rows with Product Stars = null DO NOT appear (numeric filter excludes nulls when any bound is set). Clear the filter; null rows reappear.
- [ ] **Step 11 — Numeric range invalid input.** Open Product Stars popover. Type Min=`abc`. Press Apply. Inline red error: "Enter a valid number, or leave empty." Filter doesn't change.
- [ ] **Step 12 — Numeric range integer enforcement on # Reviews.** The # Reviews input has `step={1}`. Browser-native `<input type="number">` rounds `3.5` per its number-input semantics (browser-dependent — confirm visually). The applied filter is whatever number ends up in the input on Apply.
- [ ] **Step 13 — Date range Apply.** Open Added On popover. Click the From date picker; pick `2026-04-01`. Tab to To; pick `2026-05-01`. Press Apply. Rows with addedAt within that date range remain. URL gets `?addedFrom=2026-04-01&addedTo=2026-05-01`.
- [ ] **Step 14 — Date range one-sided.** Open Added On popover; pick From=`2026-05-01`, leave To empty. Apply. Rows with addedAt ≥ 2026-05-01 remain. Same with To set + From empty.
- [ ] **Step 15 — Date range From > To validation.** Type From=`2026-05-15`, To=`2026-04-01`. Press Apply. Inline red error: "From must be ≤ To." Filter doesn't change.
- [ ] **Step 16 — Multiple filters AND-combine.** Active: Brand Name = "Acme"; Product Stars Min = 4; Added On From = 2026-04-01. Confirm only rows matching ALL three remain (intersection, not union). Toolbar shows "Clear all filters (3 active)".
- [ ] **Step 17 — Filter alongside free-text search.** With Brand Name filter active, type "widget" in the search box. Confirm rows must match BOTH the brand filter AND the search blob (URL + Product Name + Brand Name contains "widget"). Both filters AND-combine.
- [ ] **Step 18 — Clear all filters button.** With ≥ 1 column filter active, click "Clear all filters (N active)" in the toolbar. All column filters clear; the search box value is NOT cleared (separate widget); platform sidebar selection is NOT cleared (separate widget). URL drops all filter keys; keeps `?platform=` and `?q=`.
- [ ] **Step 19 — URL state survives refresh.** With a complex filter set active (e.g., Brand Name = "Acme,Zenith", Stars Min = 4, Added From = 2026-04-01), confirm the URL bar shows all the filter keys. Hard-refresh (Ctrl+Shift+R). The page reloads with the same filter set active and the same rows visible.
- [ ] **Step 20 — Browser back/forward preserves filter state.** From a filtered view, click a row to navigate to the URL detail page. Click browser Back. The URL list re-renders with the same filter set active. Click browser Forward. Detail page re-renders.
- [ ] **Step 21 — Deep-link copy/paste.** Copy the current URL (including all filter query params) from the browser bar. Open a new tab; paste; press Enter. The same filter set is active and the same rows are visible.
- [ ] **Step 22 — Search-box debounce + URL persistence.** Type quickly in the search box. The table filters rows immediately (the input is mirrored locally). Pause for ~300ms. The URL bar updates to include `?q=<text>`. Refresh. The search box is pre-populated with the same text.
- [ ] **Step 23 — Browser back/forward with search box.** Type something in search; pause for the URL to update; type more; pause again. Click Back twice. Search box value reverts step-by-step. The local input mirror re-syncs from the URL via the `urlSearch` effect.
- [ ] **Step 24 — "Showing N of M" reflects column filters.** With 30 platform-scoped rows, no filters: `Showing 30 of 30`. Add a Brand filter that matches 12 rows: `Showing 12 of 30`. Add a search query that further narrows to 5: `Showing 5 of 30`. M stays at the platform-scoped total throughout.
- [ ] **Step 25 — Filter rules everything out.** With 30 rows in scope, set a Brand Name filter on a value that doesn't exist (e.g., type a custom brand into the multi-select… actually, multi-select only offers existing values, so set conflicting filters: Stars Min = 5.0, Stars Max = 4.0). Confirm "No URLs match this filter." empty-state appears. Search box stays visible.
- [ ] **Step 26 — Sort still works alongside filters.** With column filters active, click the Product Name LABEL (not the funnel). Sort toggles asc/desc. Filter set stays unchanged. Clicking the funnel + sort label both work independently.
- [ ] **Step 27 — Active-filter visual cue accuracy.** With Brand Name filter set: Brand Name funnel is blue with dot. Other 5 funnels are gray with no dot. Add Product Stars filter: 2 funnels blue, 4 gray. Toolbar shows "Clear all filters (2 active)".
- [ ] **Step 28 — Esc closes popover.** Open any column's popover. Press Esc. Popover closes; no filter applied (similar to outside-click).
- [ ] **Step 29 — Cross-platform navigation preserves filter via URL.** With column filters active for amazon, click "Etsy" in the platform sidebar. URL updates `?platform=etsy` BUT all the other filter keys remain. Confirm the table's multi-select option lists update to Etsy's distinct values; numeric/date filters stay applied as-is. (Per the chosen behavior — filter state is global across platform switches; if a user explicitly wants to clear filters when switching platforms, they use the Clear-all button.)
- [ ] **Step 30 — Lint + build + tests parity.** At commit time: `npx tsc --noEmit` clean; `npm run build` clean (49 routes — same as slice (a.3); zero new); `npx eslint src` reports project-wide 13e/39w at exact baseline parity with slice (a.3) AND `npx eslint` on JUST the slice (a.4) files (`ColumnFilters.tsx`, `UrlTable.tsx`, `CompetitionScrapingViewer.tsx`) reports clean (zero errors, zero warnings); `node --test --experimental-strip-types 'src/lib/**/*.test.ts'` reports 393/393 pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 30 CompetitorUrl rows under one platform with varied values across all 6 filterable fields (covers Step 16 multi-filter AND, Step 24 "Showing N of M", Step 25 empty-after-filter, Step 27 multi-funnel visual cue).
- Brand Name and Product Name diversity: at least 5 distinct brands AND ≥ 7 distinct product names (covers Step 7 search-within-list which only renders when option count > 6).
- At least 1 row with null Brand Name + at least 1 row with null Product Stars (covers Step 5 `(blank)` pseudo-row + Step 10 null exclusion when bound set).
- Two distinct platforms each with their own URL set (covers Step 29 cross-platform navigation preserves filter while option lists swap).
- Date range across ≥ 1 month so Step 13 + Step 14 + Step 15 exercise meaningful date pickers.

**API-side confirmation already exercised at commit time:**

- **No API surface changes this slice.** Pure UI work atop the existing `GET /api/projects/[projectId]/competition-scraping/urls` endpoint shipped in API-routes session-1. Build clean at 49 routes (zero new). `tsc` + lint + tests all at exact baseline parity.

---

## Extension build — session 1 — WXT init + auth shell + GET /api/projects CORS — PENDING 2026-05-07 (PARTIALLY ATTEMPTED 2026-05-07-i — see Waypoint #1 attempt log at top of doc)

Shipped commit: `5b4a3e8` on `workflow-2-competition-scraping`.

**Waypoint #1 attempt 2026-05-07-i partial outcome (in `session_2026-05-07-i_w2-waypoint-1-verification-pass-1`):**

- ✅ Step 1 download zip / ✅ Step 2 unzip (Windows 11; manifest.json at top level) / ✅ Step 3 chrome://extensions / ✅ Step 4 Developer Mode / ✅ Step 5 Load unpacked (no red errors; Name + Version 0.1.0 confirmed) / ✅ Step 6 Pin to toolbar / ✅ Step 7 Popup pre-sign-in screen (heading + tagline + email/password fields + disabled Sign-in button + gray help text — all four confirmed).
- 🟡 Step 8 PARTIAL — sign-in via Supabase ✅; signed-in screen flipped ✅; "Signed in as <email>" gray box ✅; **but the post-sign-in project-list path returned "Couldn't load your projects: Failed to fetch"** — diagnosis: deploy gap (CORS handler on `src/app/api/projects/route.ts` not on `origin/main`; vklf.com runs main).
- Steps 9-18 NOT EXERCISED today. Step 8's persistence subcheck (close + reopen popup → still signed in) NOT EXERCISED today.
- Steps 10-12 (Verify connection happy / token failure / network failure) **OBSOLETED by session 2** — that button no longer exists; the project-list load is now the auth round-trip proof. Future verification should mark these three steps as "obsoleted — superseded by S2-2" rather than pending.

Section flag stays PENDING until the resumed verification (after W#2 → main deploy session lands).

This is the **first** of the 5–7 W#2 Chrome extension build sessions. Session-1 ships the WXT scaffold + the auth shell (`signInWithPassword`, JWT + refresh-token storage in `chrome.storage.local`, sign-out) + a "Verify connection" smoke-test button that calls `GET https://vklf.com/api/projects` with a Bearer header. The cross-workflow change to `src/app/api/projects/route.ts` adds the OPTIONS preflight handler + `withCors` wrap so the extension's `Authorization: Bearer` request gets through CORS.

**Prerequisites for these tests** (no PLOS-side seed data needed — this session's flows are install + auth, NOT capture):

- A local Chrome browser on your computer (any recent version).
- Your PLOS email + password (the same credentials you use to sign in at https://vklf.com).
- Codespaces session running on the `workflow-2-competition-scraping` branch with the build artifacts present at `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip` (re-run `cd extensions/competition-scraping && npm run zip` if missing — re-running is idempotent and produces the same artifact).

Walked-through tests:

- [ ] **Step 1 — Download the extension zip from Codespaces to your local computer.** In your VS Code window's Explorer panel (left sidebar), navigate to `extensions/competition-scraping/.output/`. Right-click `competition-scraping-extension-0.1.0-chrome.zip` → **Download…**. The browser saves it to your local Downloads folder. *If `.output` is hidden by VS Code's exclude filter:* press `Ctrl+P` (or `Cmd+P` on Mac), type `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip`, hit Enter — that opens it; then File → Save As to save locally.

- [ ] **Step 2 — Unzip on your local computer.** *Mac:* double-click the zip in Downloads (auto-extracts into a folder of the same name). *Windows:* right-click → Extract All… → click Extract. Open the extracted folder and **confirm `manifest.json` is directly inside**. If `manifest.json` is one level deeper, use the inner folder for Step 5.

- [ ] **Step 3 — Open Chrome's extensions page.** In your local Chrome's address bar, paste `chrome://extensions` and press Enter. You land on Chrome's extensions management page.

- [ ] **Step 4 — Toggle Developer Mode ON.** In the top-right corner of `chrome://extensions`, click the **"Developer mode"** toggle so it turns blue. Three new buttons appear in the top-left: **Load unpacked**, **Pack extension**, **Update**.

- [ ] **Step 5 — Click "Load unpacked" and pick the unzipped folder.** Click **Load unpacked** in the top-left. Navigate to your Downloads folder → select the unzipped folder from Step 2 (the one containing `manifest.json` directly) → click **Select** (or **Open** / **Choose**). A new tile appears with **Name: PLOS Competition Scraping**, **Version: 0.1.0**, **Description: Capture competitor URLs, text, and images for the PLOS Competition Scraping & Deep Analysis workflow.** Confirm there is **no red error text** under the tile. (If there is, copy the exact error verbatim and report back — it points at a manifest validation issue.)

- [ ] **Step 6 — Pin the extension to your toolbar.** Click the puzzle-piece icon in Chrome's top-right (Extensions menu). Find "PLOS Competition Scraping" in the list → click the pin icon next to it. The extension now appears as a small icon in your toolbar.

- [ ] **Step 7 — Click the extension icon to open the popup.** A 360px-wide popup opens. Confirm it shows: heading "PLOS Competition Scraping", tagline "Workflow #2 — capture URLs, text, images.", a sign-in form with **PLOS email** + **Password** fields, and a "Sign in" button (disabled while either field is empty). Below the form, gray text reads "Use the same email and password you use at vklf.com."

- [ ] **Step 8 — Sign in with valid credentials.** Type your real PLOS email + password → click **Sign in**. While the call is in flight, the button text changes to "Signing in…" and is disabled. On success: the popup flips to the signed-in screen showing "Signed in as **\<your email\>**" in a gray box, a blue "Verify connection" button, a divider, and a white "Sign out" button. **Persistence subcheck:** keep the popup open; close it (click outside / press Esc); reopen by clicking the toolbar icon — should still be signed in (no re-login needed).

- [ ] **Step 9 — Sign in with invalid credentials.** Sign out first if needed, then try with a wrong password. Expected: the form shows a red error box with the Supabase error message (typically "Invalid login credentials"). The button re-enables. Form state preserved (email field keeps its value; password field stays as typed but you can re-edit).

- [ ] **Step 10 — Click "Verify connection" — happy path.** Signed in, click **Verify connection**. Button text changes to "Checking…" while the fetch is in flight. Expected outcome: a **green "notice" box** appears reading **"Connected — N projects visible on vklf.com."** (singular `1 project` if only one). N matches the number of Projects you can see on vklf.com's `/projects` page. **Open DevTools → Network** to inspect the request:
  - The OPTIONS preflight to `https://vklf.com/api/projects` returns `204 No Content` with `Access-Control-Allow-Origin: chrome-extension://<your-extension-id>` + `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS` + `Access-Control-Allow-Headers: Content-Type, Authorization`.
  - The GET to `https://vklf.com/api/projects` returns `200 OK` with a JSON array of project objects + the same Access-Control-Allow-Origin header echoed back.
  - The Authorization header value starts with `Bearer eyJ…` (a JWT).

- [ ] **Step 11 — Click "Verify connection" — failure path on expired/invalid token.** With DevTools → Application → Storage → IndexedDB / Extension Storage → manually corrupt the stored access_token (or sign in, wait for the refresh-token TTL to elapse — impractical for routine testing; the corruption-DevTools path is faster). Click **Verify connection**. Expected: a **red error box** reading "PLOS API error (401): Unauthorized" (or near-equivalent). The popup remains on the signed-in screen so you can retry or sign out cleanly.

- [ ] **Step 12 — Click "Verify connection" — network unreachable path.** Disconnect from the internet (Wi-Fi off OR DevTools → Network → set Throttling to "Offline"). Click **Verify connection**. Expected: red error box reading "Network error: Failed to fetch" (or near-equivalent). The popup remains usable. Reconnect → click again → green-box success.

- [ ] **Step 13 — Sign-out path.** Click **Sign out**. The popup flips back to the sign-in form within ~200ms. Reopen the popup (close + click icon again) — sign-in form is still showing (sign-out cleared the session, not just the in-memory state). DevTools → Application → Storage → check `chrome.storage.local` — the `sb-*-auth-token` key is gone (or set to a sign-out marker).

- [ ] **Step 14 — Token persistence across browser restart.** Sign in via Step 8. Close the entire Chrome window (not just the popup). Reopen Chrome. Click the extension icon. Expected: still signed-in (the JWT + refresh token survived in `chrome.storage.local`). Click "Verify connection" — green box again.

- [ ] **Step 15 — Token persistence across extension reload.** Sign in via Step 8. On `chrome://extensions`, click the **Reload** circular-arrow button under the PLOS Competition Scraping tile. Click the extension icon. Expected: still signed-in. (Reload re-instantiates the service worker + popup but `chrome.storage.local` survives.)

- [ ] **Step 16 — Manifest sanity check.** On `chrome://extensions`, click **Details** under the PLOS Competition Scraping tile. Confirm:
  - **Site access:** "Allow access to specific sites" is the default for MV3 host_permissions. Click "Site access" → confirm `https://vklf.com/*` and `https://*.supabase.co/*` are listed and **on**. (If they're listed as "off," the host_permissions never took effect and the network calls would have CORS-blocked at the manifest level rather than via the server's Access-Control headers.)
  - **Permissions:** "Storage" is listed.
  - **Inspect views:** the "service worker" link is clickable (opens DevTools for the background.ts).

- [ ] **Step 17 — DevTools inspect of service worker.** From `chrome://extensions` → Details → Inspect views: **service worker** → DevTools opens. Console should show no red errors (Supabase client may log `Auth state change` info-level lines on sign-in / sign-out — those are fine; only RED-stack-trace errors are concerns). Network tab — note any unexpected outgoing requests; should be quiet during idle.

- [ ] **Step 18 — Build artifact integrity.** From the extension folder in Codespaces: `cd extensions/competition-scraping && npm run build` should produce `.output/chrome-mv3/` containing `manifest.json` + `background.js` + `popup.html` + `assets/popup-*.css` + `chunks/popup-*.js`. `npm run zip` should produce a `.output/competition-scraping-extension-0.1.0-chrome.zip` of around ~600 KB. Both commands should be **deterministic** — re-running produces a zip with the same logical contents (file-list + sizes; hashes may differ due to bundler timestamps).

**API-side confirmation already exercised at commit time:**

- `npm run build` (root PLOS app) clean — 49 routes including the modified `/api/projects` route now serving an OPTIONS handler.
- `npx tsc --noEmit` clean (root + extension separately).
- `node --test --experimental-strip-types $(find src -name '*.test.ts')` reports **393/393 pass** — exact baseline parity. The CORS edits to `/api/projects` did not break any existing tests.
- `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (the 13 errors all live in pre-existing files outside the W#2 surface and outside `extensions/`).
- Extension build via WXT 0.20.25 → manifest validates, popup bundle is React 19 + Supabase JS, total unpacked size ~600 KB.

**Remaining cross-cutting concerns to revisit at the post-coding verification session:**

- **Extension ID is volatile during dev mode.** Every `Load unpacked` instance gets a different chrome-extension://\<id\> origin. The CORS allowlist (`chrome-extension://*` per `src/lib/cors.ts`) is intentionally permissive to absorb this; once the Chrome Web Store (Phase 2 distribution per `STACK_DECISIONS §13.2`) issues a stable production ID, we may tighten the allowlist to that specific ID. NOT a today concern; flagging for the future tightening review.
- **Refresh-token TTL behavior.** Supabase JS handles auto-refresh internally; we haven't observed it in real time yet. Real verification requires letting the access token expire (default ~1 hour) without using the extension, then exercising it — a long-running session test deferred to the verification walkthrough.
- **Multi-account behavior.** If you sign out and sign in as a different PLOS account, the project count from `Verify connection` should change to that account's project list. Add a manual check at the verification walkthrough.

---

## Extension build — session 2 — popup project-picker + platform-picker + Highlight-Terms color-palette UI — PENDING 2026-05-07-g

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

**What changed in session 2.** The popup's signed-in screen was rewritten from session 1's "Verify connection" smoke-test placeholder into the real Module 1 setup screen per `COMPETITION_SCRAPING_DESIGN.md §A.7` and `COMPETITION_SCRAPING_STACK_DECISIONS.md §6`. The setup screen has three pieces:

- A **Project picker** (dropdown) that fetches the user's Projects via the same `GET /api/projects` call session 1 used for the smoke test. Selection persists in `chrome.storage.local` so the popup remembers across opens.
- A **Platform picker** (dropdown) with the seven platforms per `STACK_DECISIONS §A.7`: Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, Independent Website. Persists in `chrome.storage.local`.
- A **Highlight Terms manager** — a textarea where the user types one or more terms (separated by commas or newlines); on blur the terms appear as colored chips with a small color swatch button + × remove. Clicking a term's swatch opens the 4×5 grid of 20 colors per `STACK_DECISIONS §6`; clicking a color closes the popover and re-paints that term. First five terms get default colors banana → royal blue → mint → crimson → peach; subsequent terms continue the rotation through the rest of the palette. List persists in `chrome.storage.local` keyed per Project.

When both project and platform are selected, a small "Capturing for **\<Platform Label\>**" banner appears at the top of the signed-in screen so the active session is always visible. Switching to a different project clears the platform selection (you're starting a new context); the per-Project Highlight Terms list is untouched.

**Walked-through tests** (extension session 2 expands the install/sign-in baseline established by session 1 — these tests assume Steps 1–8 of session 1 are already passing):

- [ ] **Step S2-1 — Signed-in screen flips to the setup screen.** From session 1's "Step 8 — Sign in with valid credentials" landing point, instead of the prior smoke-test screen showing "Verify connection" + "Sign out", you should now see: the "Signed in as **\<your email\>**" line, a **Project** dropdown, and (after picking a project) a **Platform** dropdown + **Highlight Terms** field. The "Verify connection" button is gone (its job is now folded into the project picker — successfully loading the project list IS the auth round-trip proof).

- [ ] **Step S2-2 — Project list loads with the right projects.** While the project list is loading, a "Loading your projects…" muted line should appear briefly. Once loaded, the dropdown lists all Projects you can see at vklf.com/projects, sorted with the most recently active at the top. Empty state — sign in as a brand-new user with no Projects yet — should show a "No projects yet. Create one at vklf.com/projects" line with the link clickable.

- [ ] **Step S2-3 — Project list error handling.** With DevTools → Network → set throttling to "Offline" BEFORE opening the popup, then sign in (or reopen). The project list should show a red error box reading "Couldn't load your projects: …" with the underlying network error. Reconnect → close + reopen popup → list loads cleanly.

- [ ] **Step S2-4 — Pick a project.** From the dropdown, pick a Project. The Platform dropdown + Highlight Terms field should appear immediately. Close the popup, reopen it — the same Project should still be selected (project ID was persisted in `chrome.storage.local`).

- [ ] **Step S2-5 — Project picker default value.** Before picking anything, the dropdown should read "Pick a project…" as the default placeholder. The first option in the user-visible list should match the first project in the API response (most recent activity).

- [ ] **Step S2-6 — Platform picker shows all 7 options.** Open the Platform dropdown. Confirm the labels (in this order): Amazon.com / Ebay.com / Etsy.com / Walmart.com / Google Shopping / Google Ads / Independent Website. Default is "Pick a platform…".

- [ ] **Step S2-7 — Platform picker explanatory text.** Below the dropdown, confirm the muted help line reads (paraphrased): "We need this even on Amazon/Ebay/Etsy/Walmart so we can tell apart URLs found via Google Shopping, Google Ads, and independent websites." This is the rationale per `COMPETITION_SCRAPING_DESIGN.md §A.7`.

- [ ] **Step S2-8 — Pick a platform; active-session banner appears.** Pick a platform. A small green "Capturing for **\<Platform Label\>**" banner should appear at the top of the popup (above the project picker). Close + reopen the popup — banner still there with the same platform.

- [ ] **Step S2-9 — Switching projects clears the platform.** With both project and platform picked, switch the Project dropdown to a different Project. The Platform dropdown should reset to "Pick a platform…" and the active-session banner should disappear. (Director can re-pick the platform freshly for the new context.)

- [ ] **Step S2-10 — Highlight Terms — empty state.** With a project picked but no terms yet, the Highlight Terms area should show the textarea + a muted line reading "You haven't added any highlight terms yet."

- [ ] **Step S2-11 — Add a single term.** Type `red light therapy` into the textarea. Click outside the textarea (or Tab away). Expected: the textarea clears; a chip appears reading "red light therapy" on a banana-yellow background with black text; a small banana-yellow swatch button + a × button sit next to it.

- [ ] **Step S2-12 — Add multiple terms in one shot, comma-separated.** Type `infrared, near-infrared, photobiomodulation` then click outside. Expected: three new chips appear (in addition to any existing ones), with the next default colors in the rotation. If the existing list had 1 term (the banana-yellow one from Step S2-11), the new colors should be royal blue (chip-2 white text), mint green (chip-3 black text), and crimson (chip-4 white text).

- [ ] **Step S2-13 — Add multiple terms in one shot, newline-separated.** Add a second batch with the textarea. Type two terms on two lines (press Enter between them) → click outside. Expected: both terms become chips with the next two colors in the rotation.

- [ ] **Step S2-14 — Dedup ignores case.** Type `Red Light Therapy` (with different casing from Step S2-11) → click outside. Expected: NO new chip appears; the existing "red light therapy" chip is preserved unchanged.

- [ ] **Step S2-15 — Auto-flip text color.** Inspect every chip in the list. Light-background chips (banana, mint, peach, etc.) should have **black** text; dark-background chips (royal blue, crimson, navy, etc.) should have **white** text. Both should be plainly readable. (4.5:1 WCAG AA contrast.)

- [ ] **Step S2-16 — Open color picker for one term.** Click the small color-swatch button next to (say) the "red light therapy" chip. Expected: a small popover appears below/beside the chip containing a 4×5 grid of 20 colors (rows 1-2 light, rows 3-4 dark). The currently-selected color (banana yellow) should have a thin border highlight inside the popover. Each swatch should show its color name when you hover (e.g., "Banana yellow").

- [ ] **Step S2-17 — Pick a different color.** Click any other color in the popover (e.g., Slate, the bottom-right dark swatch). Expected: the popover closes; the chip's background changes to slate-blue with white text; the small swatch button matches.

- [ ] **Step S2-18 — Close the picker without picking.** Reopen the picker (click the swatch button); press Esc. Picker closes; chip color unchanged. Reopen → click anywhere outside the picker (e.g., on the project picker label). Picker closes; chip color unchanged.

- [ ] **Step S2-19 — Remove a single term.** Click the × button next to a chip. The chip disappears. Other chips are unchanged. The remaining-chip-count line (if visible) decrements.

- [ ] **Step S2-20 — Clear all.** With 3+ terms present, click the "Clear all highlight terms" link. Expected: all chips disappear; the empty-state line returns.

- [ ] **Step S2-21 — Highlight Terms persist across popup close/reopen.** Add 3 terms, picking custom colors for one of them. Close the popup. Reopen by clicking the toolbar icon. Expected: same 3 terms appear in the same order with the same colors (including the custom one). Then close + Chrome restart → reopen → terms still there.

- [ ] **Step S2-22 — Highlight Terms are per-Project.** Project A has 3 terms; switch to Project B in the project picker — Highlight Terms list should be empty (or show whatever Project B's own list is, if you'd added terms there in a prior session). Switch back to Project A — your 3 terms reappear unchanged.

- [ ] **Step S2-23 — Long term wraps inside the chip.** Add a deliberately long term (e.g., `extra-large bottle for after-workout recovery`). Confirm the chip's text wraps (rather than the popup growing horizontally). The × and swatch buttons stay on the right.

- [ ] **Step S2-24 — Empty / whitespace-only input is dropped silently.** Type whitespace + commas (`,  ,  ,`) → click outside. No new chips; textarea clears; existing list unchanged. Same with empty newlines (just press Enter a few times, then click outside).

- [ ] **Step S2-25 — Sign-out wipes the in-memory state.** With pickers populated + terms in the list, click **Sign out**. Popup flips to the sign-in form. Sign back in. The pickers should hydrate to the same values from `chrome.storage.local` (sign-out only clears the auth token, not the user's own setup state). If you want a clean slate, the future "reset extension state" path will provide that — out of scope today.

- [ ] **Step S2-26 — DevTools → Application → Storage → Local Storage check.** Open the extension's service-worker DevTools (chrome://extensions → Details → Inspect views: service worker). In Application → Storage, the extension's `chrome.storage.local` should show keys: `selectedProjectId`, `selectedPlatform`, and `highlightTerms:<projectId>` (one per Project you've added terms for). The Supabase auth-token key (`sb-*-auth-token`) should also be present.

- [ ] **Step S2-27 — No console errors during normal flow.** Open service-worker DevTools → Console. Walk through Steps S2-1 through S2-21. Console should show only Supabase info-level messages (auth state changes); no red errors.

- [ ] **Step S2-28 — Build artifact integrity.** From Codespaces: `cd extensions/competition-scraping && npm run compile && npm test && npm run build`. All three should be clean. `npm test` should report 42/42 tests pass (the new color-palette + highlight-terms unit suites). `npm run build` should produce `.output/chrome-mv3/` with a similar size to session 1 (~600 KB unpacked) — slight growth is expected from the new components.

**Seed-data prerequisites:**

- Sign in to Chrome with the same Google account you'll always use for the verification walkthrough (so chrome.storage.local persists across sessions consistently).
- At least 2 Projects on the test PLOS account so Step S2-22 (per-Project terms) is exercisable; ideally one is brand-new with no W#2 activity yet.
- (Optional) A test PLOS account with zero Projects so the empty-state of Step S2-2 is exercisable.

**API-side already verified at commit time:**

- Extension `npm run compile` (tsc --noEmit) clean — zero errors.
- Extension `npm test` reports **42/42 pass** across two new unit-test files (color-palette + highlight-terms — pure logic only; no chrome.storage.local mocks).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` produced with manifest.json + popup.html + background.js + popup chunks + popup css. `npm run zip` produces the chrome zip artifact.
- Root `npx tsc --noEmit` clean (extensions/ excluded).
- Root `npm run build` clean — 49 routes (same as session 1 baseline; session 2 added zero new API routes).
- Root tests pass at exact baseline parity — **393/393 src/lib pass**.
- Root `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (same 13 pre-existing-file errors as session 1).
- Extension lint (`npx eslint extensions/competition-scraping/src`) clean — zero errors, zero warnings on the session-2 files.

---

## Extension build — session 3 — Module 1 URL-capture content script (4 platforms: Amazon, Ebay, Etsy, Walmart) + URL-recognition features + URL-add overlay form — PENDING 2026-05-07-h

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

**What changed in session 3.** Adds the **content-script** layer of the extension — code that runs ON competitor product pages (Amazon / Ebay / Etsy / Walmart) and adds the floating "+ Add" button on link hover, the URL-add overlay form, and the two URL-recognition behaviors per `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum. Per-platform DOM-pattern modules per `STACK_DECISIONS §15 Q7`. URL-normalization helper strips `?` and everything after for comparison-time matching per the §B addendum item 3. 4 platforms shipped today; Google Shopping / Google Ads / Independent Websites deferred to a future build session.

**Manifest expansion to flag at install time:** `host_permissions` adds `https://*.amazon.com/*`, `https://*.ebay.com/*`, `https://*.etsy.com/*`, `https://*.walmart.com/*` and `permissions` adds `contextMenus`. Chrome will require you to **re-approve permissions** when you click "Reload" on the unpacked extension at `chrome://extensions`. This is the standard MV3 install flow when host-permission scope expands.

**Walked-through tests** (extension session 3 expands the install/sign-in/popup baseline established by sessions 1 + 2 — these tests assume Steps 1–17 of session 1 and Steps S2-1 through S2-26 of session 2 are already passing):

- [ ] **Step S3-1 — Reload the unpacked extension after pulling session 3 code.** From `chrome://extensions`, click the circular **Reload** button on the PLOS Competition Scraping tile. Chrome may show a permissions-changed warning — click to **approve the new host permissions** (the 4 shopping sites). Confirm the tile shows no red error text.
- [ ] **Step S3-2 — Confirm Site access lists the 4 shopping sites.** Click **Details** on the tile → scroll to **Site access** → **On specific sites**. Confirm: `https://vklf.com/*`, `https://*.supabase.co/*`, `https://*.amazon.com/*`, `https://*.ebay.com/*`, `https://*.etsy.com/*`, `https://*.walmart.com/*` — all 6 listed and toggled **on**.
- [ ] **Step S3-3 — Confirm Permissions lists Storage + ContextMenus.** Same Details page → **Permissions** section. Both `Storage` and `Read your browsing history` (Chrome's user-facing label for `contextMenus`) are listed.
- [ ] **Step S3-4 — Sign in + pick Project + pick `Amazon.com` platform in the popup.** Establishes the baseline state the content script reads.
- [ ] **Step S3-5 — Open `https://www.amazon.com/` in a new tab.** Page loads normally. Open DevTools → **Console** tab → confirm no red errors from the content script. (You may see Amazon's own log lines and unrelated warnings — only red lines whose source file path includes `competition-scraping-extension` or `chrome-extension://` are extension errors worth flagging.)
- [ ] **Step S3-6 — Search Amazon for `red light therapy`.** Click on the search box, type the query, press Enter. The search-results page loads showing product tiles.
- [ ] **Step S3-7 — Hover over a product link.** Move your cursor over any product title or product image link. Wait ~300ms. A small **circular "+" button** appears at the upper-right corner of the link's bounding box, with a small **× dismiss** button just to the right of it. The button is blue with white "+" text; the × is red.
- [ ] **Step S3-8 — Move cursor away from the link.** Cursor leaves the link's bounding box. The "+ Add" button disappears immediately.
- [ ] **Step S3-9 — Click the floating "+" button.** Hover over a link, wait for the button, click the "+". Expected: a **modal overlay** opens with a dimmed backdrop. The form shows: title "Add competitor URL", a context block listing your Project name + "Platform: Amazon.com", a pre-filled URL field (the product URL in canonical form — `https://www.amazon.com/dp/<ASIN>` — without the `?ref=...&keywords=...` query that was on the search-results link), three optional free-text fields (Competition Category, Product Name, Brand Name), and Save + Cancel buttons.
- [ ] **Step S3-10 — Save without filling optional fields.** Click **Save**. Expected: button text changes to "Saving…"; ~1 second later the modal closes; the search-results page is visible again. Open the PLOS web app at `/projects/<your-project-id>/competition-scraping` in another tab → the URL appears in the URL list. The Platform column shows `amazon`.
- [ ] **Step S3-11 — Verify "already saved" icon appears on the same product link.** Back on the Amazon search results tab, **hard-refresh** (Ctrl+Shift+R). Wait for the page + content script to settle. The previously-saved product link should now show a small **green "✓" circle** to the LEFT of the link, in addition to the "+ Add" button on hover.
- [ ] **Step S3-12 — Save WITH optional fields filled.** Hover a different product link, click "+", in the form fill: Competition Category = `device`, Product Name = `Red Light Therapy Pro`, Brand Name = `Acme`. Click Save. The PLOS-side URL detail page (drill into the saved row) should show those three fields populated.
- [ ] **Step S3-13 — Cancel button closes the form without saving.** Hover, click "+", in the form click **Cancel**. Form closes. PLOS-side: no new URL row appears.
- [ ] **Step S3-14 — Esc closes the form without saving.** Hover, click "+", press the **Esc** key. Form closes. PLOS-side: no new URL row.
- [ ] **Step S3-15 — Backdrop click closes the form without saving.** Hover, click "+", click the dimmed area outside the form. Form closes. PLOS-side: no new URL row.
- [ ] **Step S3-16 — Save failure shows inline error.** Open DevTools → Network → enable Throttling = "Offline". Hover, click "+", click Save. Inline red message reads "Save failed: …" (specific text depends on failure mode — common shape is "Failed to fetch" or "PlosApiError"). Form stays open with the user's typed values preserved. Restore Network → Save again → success.
- [ ] **Step S3-17 — Per-session × dismiss hides the button for the rest of the page-load.** Hover any link until the "+" appears. Click the small **×** button (NOT the "+"). The "+" + × disappear. Hover OTHER links on the page — no "+" appears. Hard-refresh the page (Ctrl+Shift+R). Hover restored — "+" appears again. (Per-session means the dismiss is page-load scoped, not permanent.)
- [ ] **Step S3-18 — Right-click context menu fallback.** Right-click any product link on the search-results page. The browser's context menu opens with an entry **"Add to PLOS — Competition Scraping"**. Click it. The URL-add overlay form opens with the right-clicked link's URL pre-filled. Save → new URL appears on PLOS-side.
- [ ] **Step S3-19 — Detail-page "already saved" overlay appears when navigating to a saved URL.** Click directly on a URL you previously saved (Step S3-10's product link). The Amazon product detail page loads. Within ~1 second, a small **green floating banner** appears in the **top-right corner** of the page reading **"✓ This URL is already in your project · <Your Project Name>"**. The banner has a small × close button.
- [ ] **Step S3-20 — Detail-page overlay auto-dismisses after 5 seconds.** Wait without interacting. The banner disappears on its own after ~5 seconds.
- [ ] **Step S3-21 — Detail-page overlay × close works.** Refresh the page (overlay reappears). Click the **×**. Banner disappears immediately.
- [ ] **Step S3-22 — Overlay does NOT appear for unsaved URLs.** Click on a different product link (one you have NOT saved). Detail page loads. Banner does NOT appear.
- [ ] **Step S3-23 — `?`-stripping URL-normalization works for tracking-token-laden URLs.** Pick a saved product URL. Construct a URL with extra tracking params: e.g., `<saved-url>?utm_source=email&fb_click_id=ABC123`. Paste into a new tab and press Enter. Page loads. The detail-page overlay should still appear (because `?` and everything after gets stripped at recognition time). This validates the §B 2026-05-07-g item 3 spec.
- [ ] **Step S3-24 — `+ Add` button does NOT appear on non-product links.** Search results pages have many non-product links: Amazon's logo, the cart icon, navigation, "Today's Deals", etc. Hover over any of those — the "+" button does NOT appear. Only links whose URL matches `/dp/{ASIN}` or `/gp/product/{ASIN}` get the button.
- [ ] **Step S3-25 — Hover delay is ~300ms (not instant; not laggy).** Move cursor to a product link and hold steady. The "+" appears after a brief pause. Move cursor between links in quick succession (don't dwell on any) — the "+" should NOT flicker into view as you pass over (because each link's hover-in is debounced 300ms before showing).
- [ ] **Step S3-26 — Repeat Steps S3-5 through S3-19 on `https://www.ebay.com/`.** Pick `Ebay.com` in the popup, search Ebay for any product, exercise the same flows. Product-link detection: links with `/itm/{listing-id}` (8+ digit numeric IDs) get the "+ Add" button; non-listing links don't.
- [ ] **Step S3-27 — Repeat Steps S3-5 through S3-19 on `https://www.etsy.com/`.** Pick `Etsy.com` in the popup. Product-link detection: `/listing/{numeric-id}` matches; shop pages, search, etc. don't.
- [ ] **Step S3-28 — Repeat Steps S3-5 through S3-19 on `https://www.walmart.com/`.** Pick `Walmart.com` in the popup. Product-link detection: `/ip/{slug}/{numeric-id}` AND `/ip/{numeric-id}` both match; category and search pages don't.
- [ ] **Step S3-29 — Cross-platform mismatch — extension no-ops.** In the popup, pick `Amazon.com` as the platform. In the browser, navigate to `https://www.ebay.com/`. The content script should NOT inject buttons on Ebay (because the user's selected platform is Amazon — content script confirms hostname matches selected platform before running). DevTools → Elements → confirm no `plos-cs-*` elements in the body.
- [ ] **Step S3-30 — Switching platform in popup mid-session.** While on Amazon search-results with "+ Add" buttons visible, open the popup and change platform from `Amazon.com` to `Ebay.com`. The Amazon tab's existing buttons stay until refresh (per-tab content-script lifetime). Refresh the Amazon tab — buttons disappear (because selected platform no longer matches Amazon). Navigate to Ebay → buttons appear there.
- [ ] **Step S3-31 — SPA navigation re-scans links (Etsy infinite scroll).** On Etsy search results, scroll down to load more results. New product tiles appear. Confirm the "+ Add" buttons + "already saved" icons appear on the newly-loaded tiles too (within ~250ms after the new tiles render — the orchestrator's MutationObserver debounces re-scans).
- [ ] **Step S3-32 — Recognition cache survives the URL save.** Save a fresh URL via Step S3-9. Without refreshing, scroll back up to see the same product link in the search-results list. The "already saved" icon should now be present on it (the orchestrator re-scans after a successful save).
- [ ] **Step S3-33 — No `+ Add` button when popup not configured.** Sign out from the popup. Reload Amazon. No "+ Add" buttons appear (content script reads `selectedProjectId` from popup-state; if missing, no-op). Sign back in + re-pick project + platform → buttons appear on next page load.
- [ ] **Step S3-34 — Service worker DevTools shows no errors.** From `chrome://extensions` → Details → Inspect views: **service worker**. Console tab. Walk through Steps S3-5 through S3-19 in another tab. No red errors in the service worker console (the content-script log noise lives in the page's DevTools console, not the service-worker console).
- [ ] **Step S3-35 — chrome.storage.local check via service-worker DevTools.** Service-worker DevTools → Application → Storage → Extension Storage → Local. Confirm keys: `selectedProjectId`, `selectedPlatform`, `highlightTerms:<projectId>` (one per Project), and Supabase `sb-*-auth-token` are all present and have plausible values. No new keys from session 3 — the recognition cache lives in memory only.
- [ ] **Step S3-36 — Build artifact integrity.** From Codespaces: `cd extensions/competition-scraping && npm run compile && npm test && npm run build`. All three clean. `npm test` reports 246/246 pass (146 helper-tests; the prior 42 popup-tests were renumbered when url-normalization + 5 platform-module test files joined them). `npm run build` produces `.output/chrome-mv3/` with new `content-scripts/` directory containing the bundled content script for the 4 platforms. Bundle size grows from ~603 KB to ~1 MB (content-script chunk + new platform-module chunks).

**Seed-data prerequisites** (in addition to sessions 1 + 2 prereqs):

- A test Project on PLOS with at least 1 saved CompetitorUrl on each of Amazon, Ebay, Etsy, Walmart so the "already saved" icon + detail-page overlay paths are exercised on each platform. (Steps S3-11 onward populate the Project organically as you save URLs through the flow — but a few pre-seeded entries help cover the cross-platform iteration faster.)

**API-side already verified at commit time:**

- Extension `npm run compile` clean — zero errors.
- Extension `npm test` reports **246/246 pass** (146 helper-tests across 5 new test files: url-normalization + amazon + ebay + etsy + walmart + registry; carries the prior 42 popup-tests forward + a `+`-handler corrections from old runs cleaned up at session 3 baseline).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` produced with the new `content-scripts/` chunk in addition to the prior popup + background. `.output/competition-scraping-extension-0.1.0-chrome.zip` produced.
- Extension `npx eslint extensions/competition-scraping/src` clean — zero errors, zero warnings on session-3 files.
- Root `npx tsc --noEmit` clean (extensions/ excluded — root tsconfig has been excluding it since session 1).
- Root `npm run build` clean — same 49 routes; zero new PLOS-side files this session.
- Root tests **393/393 pass** — exact baseline parity (no root files modified this session).
- Root `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (no PLOS-side changes).

**Lands in waypoint #1 coverage** per the verification-waypoint plan at the top of this doc — Waypoint #1 fires immediately after this session and walks through:
- Slice (a.1) detail page (12 steps) + slice (a.2) image gallery (14 steps) + slice (a.3) inline editing (23 steps) + slice (a.4) column filters (30 steps) + slice (b) Detailed User Guide
- Extension session 1 install/auth (18 steps)
- Extension session 2 popup pickers (28 steps)
- Extension session 3 URL-capture (36 steps — this section)
- **~150–160 steps total at Waypoint #1** (originally estimated 50–80; the actual surface area is larger because slices (a.2), (a.3), (a.4) each shipped 14–30 walked-through steps. Director may want to sub-split Waypoint #1 into two passes if the single walkthrough proves too long; flagged here for the verification session itself to evaluate.)

---
END OF DOCUMENT

