# Next session

**Written:** 2026-05-21-d (`session_2026-05-21-d_p27-build-5-url-detail-page-renderer` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #5 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `467af4c` landed 7 MODIFIED files: `src/lib/shared-types/competition-scraping.ts` (new `CapturedVideoWithUrls` interface paralleling existing `CapturedImageWithUrls`; `ListCapturedVideosResponse` upgraded from `CapturedVideo[]` to `CapturedVideoWithUrls[]`) + `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` (extended to mint per-row signed URLs at list time via `getVideoSignedUrl` + `getVideoThumbnailUrl`) + `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (new `videosSlot` + new `CapturedVideosGallery` + `CapturedVideoCard` components ~150 LOC) + 4 extension type-tightening edits (`api-client.ts` + `content-script/api-bridge.ts` + `content-script/messaging.ts` + `content-script/orchestrator.ts` — `CapturedVideo[]` → `CapturedVideoWithUrls[]` to match the new wire contract end-to-end). Total +251 / -21 LOC. Closes (a.58) RECOMMENDED-NEXT (partial — Build #5 lands the URL detail page renderer + signed-URL list endpoint per design doc §A.2 row #6 remainder; the canonical Playwright extension-context spec + deploy + director real-Chrome verification remain for Builds #6-#8). Opens **(a.59) RECOMMENDED-NEXT = P-27 implementation #6 (Build session — single-platform amazon Playwright extension-context spec covering the right-click capture happy path + embed path + popup paste path per design doc §A.2 row #7 + §A.13 Hybrid test-coverage approach) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table row #7 (sequential-build pattern per Rule 18; no §4 Step 1c forced-picker needed).

---

## What we did this session (in plain terms)

Build #5 added the missing piece that lets the director SEE saved competitor videos on the URL detail page on vklf.com. A new "Captured Videos" section now appears on each competitor URL detail page (the same page that already shows captured text + captured images), showing each saved video inline:

- **YouTube / Vimeo / etc. embeds** render as the platform's own player (with native thumbnail + play button).
- **Direct uploaded MP4 files** render as HTML5 video players with a click-to-play thumbnail (the browser shows the saved thumbnail JPEG first; clicking it starts playback with standard transport controls).

Behind the scenes, the existing list endpoint now mints two short-lived signed Supabase Storage URLs per direct-bytes row (one for the video bytes, one for the thumbnail JPEG); embed rows pass through unchanged because they play directly from the original URL.

**No deploy this session.** Build #5 stays on the feature branch. The renderer is ready for the next two Build sessions to add automated testing (Build #6) + then ship to vklf.com (Build #7). After that, Build #8 is the director's hands-on real-Chrome verification walkthrough on the live site.

No fresh extension zip this session — the extension code only changed in return-type annotations (no behavior change), so the existing Build #4 zip is still functionally equivalent.

## What we'll do next session (in plain terms)

Next session is **Build #6** — automated browser tests that verify the full right-click capture flow end-to-end. On a fake Amazon-style product page with a video on it, the tests will right-click the video, fill out the capture form, hit Save, and verify the saved row lands in the database — all without the director clicking anything. Three test files will ship:

1. **video-capture.spec.ts** — happy path: right-click a `<video>` element → form opens → fill all fields → Save → upload pipeline fires (request signed URL → PUT video bytes → PUT thumbnail → finalize) → form closes.
2. **video-capture-embed.spec.ts** — embed path: right-click an iframe (YouTube embed) → form opens with the embed URL pre-filled → no bytes upload (embeds don't upload) → Save → only the finalize step fires.
3. **video-paste-popup.spec.ts** — popup paste path: open popup → paste a YouTube URL → form fields render → Save → finalize fires.

Plus a new Amazon-style fixture page with an inline `<video>` element + an iframe embed for the tests to run against.

Once these tests pass reliably, **Build #7 deploys everything from Builds #1–#5 to vklf.com** (the director will SEE the new captured-videos section on the live site after this deploy), and **Build #8 is the director's hands-on real-Chrome verification walkthrough** on the live site.

## What's still left on the total roadmap (in plain terms)

- **P-27 captured videos (current focus):** Builds #1–#5 done. Build #6 (Playwright tests for the right-click capture flow) next session. Then Build #7 (deploy to vklf.com) + Build #8 (director's real-Chrome verification) before P-27 is fully shipped.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works; ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; ~1 session.
- **P-43 scoreboard absolute-paths polish** — reinforced AGAIN this session (CWD-drift slip in Check 4 caught + corrected; reproduction count keeps climbing). Sub-1-hour polish; should ship sooner.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — sixth P-27 Build session (Session #6 of estimated ~8 build sessions per the design doc §A.2 implementation arc table). Single-platform amazon Playwright extension-context spec covering the right-click capture happy path + embed path + popup paste path per §A.2 row #7 + §A.13 Hybrid test-coverage approach. Per Rule 23 Change Impact Audit: Additive (safe) — new test files + new fixture only; no code changes to extension or backend; the tests exercise the existing Build #1-#5 shipped surface against a new Amazon-style fixture page. **Schema-change-in-flight flag stays "No"** — Build #6 is pure test code; no `prisma db push`; no Prisma schema edit; no shared-types schema changes.

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #5 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-fifth Claude Code session — FOURTH substantive session of 2026-05-21 (first was `session_2026-05-21_p27-build-2-api-routes-shared-types`, second was `session_2026-05-21-b_p27-build-3-extension-content-script-form`, third was `session_2026-05-21-c_p27-build-4-popup-paste-saved-video-indicator`). Build commit `467af4c` landed locally + will push via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB schema is unchanged from Build #1 (Build #5 is pure code; the only data-shape change is a new additive `CapturedVideoWithUrls` shared-type interface). The vklf.com URL detail page now has a "Captured Videos" section paralleling the existing "Captured Images" gallery; embed rows render as `<iframe>` (native YouTube/Vimeo thumbnail + play affordance); direct-bytes rows render as `<video controls poster={thumbnailUrl}>` (HTML5 player + saved thumbnail poster + native click-to-play affordance).

**7 MODIFIED files in this Build:**

- MODIFIED `src/lib/shared-types/competition-scraping.ts` — new `CapturedVideoWithUrls` interface (extends `CapturedVideo` with `videoUrl: string | null` + `thumbnailUrl: string | null`); `ListCapturedVideosResponse` upgraded from `CapturedVideo[]` to `CapturedVideoWithUrls[]`. Mirrors `CapturedImageWithUrls` + `ListCapturedImagesResponse` at line 513 exactly.
- MODIFIED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` — extended to mint per-row signed URLs at list time via `getVideoSignedUrl` + `getVideoThumbnailUrl`. DIRECT_BYTES rows get both URLs; EMBED rows + DIRECT_BYTES rows with NULL `thumbnailStoragePath` get null per §A.12 fallback.
- MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — new `videosSlot` state + new `CapturedVideosGallery` + `CapturedVideoCard` components (~150 LOC). Inline `<iframe>` for EMBED rows + inline `<video controls poster={thumbnailUrl}>` for DIRECT_BYTES rows + empty-state copy + section header with count.
- MODIFIED `extensions/competition-scraping/src/lib/api-client.ts` — `listCapturedVideos` return type tightened from `Promise<CapturedVideo[]>` to `Promise<CapturedVideoWithUrls[]>` to match the new wire contract end-to-end.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — same return-type tightening on the content-script wrapper.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/messaging.ts` — `ListCapturedVideosResponseEnvelope` generic tightened from `CapturedVideo[]` to `CapturedVideoWithUrls[]`.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — `capturedVideosByUrlId` Map value type + scan loop's `rowsBySrc` Map value type tightened to `CapturedVideoWithUrls`. Runtime behavior unchanged — the saved-video indicator scan reads only `originalSrcUrl`, so the additional signed-URL fields are extra payload it ignores.

Total +251 / -21 LOC.

**3 mid-build judgment calls captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21-d (per Rule 18 append-only):**

1. **API shape — corrected at drift-check time.** The launch prompt framed the new "list captured videos WITH signed URLs" endpoint as a Rule 14f forced-picker between (A) `?withUrls=1` query param vs. (B) sibling `.../videos/withUrls/` route. Drift check caught that the actual image sibling chose NEITHER — `src/app/api/.../images/route.ts` (line 109) simply returns `CapturedImageWithUrls[]` from the existing GET endpoint; `ListCapturedImagesResponse = CapturedImageWithUrls[]` at `src/lib/shared-types/competition-scraping.ts:513`. The truest "mirror exactly" option is to upgrade the existing GET .../videos route's response shape from `CapturedVideo[]` to `CapturedVideoWithUrls[]` directly — no param, no sibling route. Director gave go-ahead after the drift-check correction; per Rule 14f Default-to-recommendation exception, the picker was skipped and Claude proceeded with the corrected recommendation. Build #2's §B 2026-05-21 entry already anticipated this: *"the list endpoint can grow `WithUrls` variant later when needed."* Reversible.
2. **Renderer scope — minimal-viable URL detail page section.** Build #5 ships the renderer ONLY — no manual-add modal, no per-row delete dialog, no inline metadata editor. Those mirror later-slice extensions on the image gallery and can ship as polish items if the real-Chrome verification at Build #8 surfaces the need. Click-to-play is native via HTML5 `<video controls>` + `<iframe>` (no custom overlay component needed). Reversible.
3. **Extension-side type-tightening — match the new wire contract end-to-end.** Runtime behavior unchanged (the indicator scan reads only `originalSrcUrl`), but per Rule 3 ("code is the ultimate source of truth"), the most honest type signature matches the wire shape end-to-end.

**ZERO DEFERRED items open at end-of-session.**

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry** captured:

- **CWD-drift slip during /scoreboard Check 4 — caught + re-ran with absolute paths; reinforces P-43 (reproduction #3).** Check 4 (`node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`) used a relative `src/lib` path WITHOUT an explicit `cd` back to root, inherited the prior bash call's cwd in the extension subdir, and re-ran the EXTENSION test suite (482 tests reported — duplicate of Check 3's 482). Caught from the duplicated count + re-ran Check 1 + Check 4 with absolute paths. Re-run reported the correct src/lib count of 589/589. Reproduction #3 in ~2 weeks; reinforces the P-43 ROADMAP item — the canonical `/scoreboard` template + every Bash pattern that depends on a specific CWD should use absolute paths.

**Pre-end-of-session scoreboard (all GREEN — ZERO deltas):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged) / src/lib node:test **589/589** (unchanged) / extension `npm test` **482/482** (unchanged) / Playwright **91/91** (unchanged). Zero scoreboard movement because Build #5 ships a renderer (straight JSX with no extracted pure helpers worth testing) + an API route response-shape upgrade (a Supabase mock harness for handler-level node:test arrives at a later Build session per §A.13).

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe).

**THIRD end-of-session run under the Rule 30 + §4 Step 4b template** (first was the 2026-05-21-b Build #3 session; second was the 2026-05-21-c Build #4 session). The plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #6 does NOT ship to main — only the Playwright specs + fixture land on the feature branch; the full P-27 Build arc ships via Build #7 deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #5 commit `467af4c` + the 2026-05-21-c Build #4 doc-batch `705aca2` + 2026-05-21-c Build #4 commit `ea32fa5` + 2026-05-21-b Build #3 doc-batch + 2026-05-21 Build #2 + Build #2 doc-batch lineage; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch). Workflow-2 is TEN COMMITS AHEAD of main (Build #1 + Build #1 doc-batch + Build #1 addendum + Build #2 + Build #2 doc-batch + Build #3 + Build #3 doc-batch + Build #4 + Build #4 doc-batch + Build #5 + this session's doc-batch). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #6 — Build session (single-platform amazon Playwright extension-context spec covering the right-click capture happy path + embed path + popup paste path per design doc §A.2 row #7 + §A.13 Hybrid test-coverage approach) on `workflow-2-competition-scraping`.** Closes **(a.59) RECOMMENDED-NEXT** (partial close — Build #6 lands the Playwright extension-context specs + fixture only; subsequent Build sessions add deploy + director real-Chrome verification per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table rows #8-#9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list (verify each file path via `ls` / `find` BEFORE reading; the 2026-05-21-c session caught two mis-paraphrased sibling-reference-shape paths in the launch prompt, so this list explicitly notes canonical paths):**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-21-d with "✅ Build #5 complete 2026-05-21-d").
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (§A.2 implementation arc table row #7 — the canonical source for Build #6's task shape; §A.13 Hybrid test-coverage approach — the binding test-strategy spec; §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + §B 2026-05-21-c + **§B 2026-05-21-d entries — the mid-build judgment calls from Builds #1-#5 that constrain Build #6's test-shape choices**).
- **The reference shape Build #6 will mirror — existing Playwright extension-context specs.** Verify canonical paths via `find tests/playwright/extension -name "*.spec.ts" | head -10` BEFORE assuming any specific path. Likely paths to verify: `tests/playwright/extension/image-capture.spec.ts` (the canonical "right-click → form opens → fill → Save → DB row lands" pattern for image capture; ~4 platforms × happy path) + `tests/playwright/extension/region-screenshot.spec.ts` (sibling extension-context spec) + `tests/playwright/extension/highlight-flashing.spec.ts` (sibling). The 4-platform iteration pattern at `image-capture.spec.ts:124` (`for (const pl of PLATFORMS)`) is NOT needed for Build #6 — design doc §A.13 specifies single-platform amazon for v1; cross-platform extension to ebay + etsy + walmart is a future polish item (mirroring the P-22 staging that landed cross-platform coverage as a separate polish item after P-23/P-24/P-25 each shipped single-platform first).
- **The fixtures Build #6 will reference / extend.** Verify canonical paths via `find tests/playwright/extension/fixtures -name "*.html" 2>/dev/null` OR `find tests/playwright -name "*amazon*"` BEFORE assuming any specific path. Likely paths: `tests/playwright/extension/amazon-product-page.html` (existing fixture for image-capture spec) — Build #6 needs a NEW `tests/playwright/extension/amazon-video-product-page.html` fixture with an inline `<video>` element + an iframe embed (YouTube/Vimeo URL); could also extend the existing fixture to add the video elements.
- **The extension code Build #6 will exercise** — Build #3's `video-capture-form.ts` + `find-underlying-video-embed.ts` + `captured-video-validation.ts` + Build #4's `CapturedVideoPasteForm.tsx` + `already-saved-video-icon.ts` + Build #2's API routes + Build #5's upgraded list endpoint shape. Build #6 is exercising the shipped surface; the test specs DO NOT modify extension or backend code.
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #6 has NO Rule 8 triggers, but verify on each tool call) + Rule 23 (Change Impact Audit — classify Build #6 as Additive (safe) BEFORE coding) + Rule 27 (Playwright Hybrid test-coverage methodology — the canonical spec shape Build #6 follows) + Rule 30 (Session bookends; plain-language summaries at start + end) + §4 Step 4b extended template (3 mandatory plain-terms sections at the TOP of the handoff).

**Task shape (Build session #6):**

1. **Pre-flight audit per Rule 8 + Rule 23.** Build #6 is pure test code — no `prisma db push`, no destructive ops, no extension source change, no backend code change. Classify per Rule 23: ADDITIVE (safe) — new test files + new fixture only; no existing data affected; no downstream-consumer breakage risk. Surface the Rule 23 audit to director via AskUserQuestion only if a non-additive change is discovered mid-build; otherwise proceed.

2. **Per Rule 30 — plain-terms session-start summary.** Before any heavy reads or coding, produce the "What this session will do (in plain terms)" summary so director can confirm the session shape. Cover: what we'll build (automated tests that verify the right-click capture flow on a fake Amazon-style page), what we won't build (deploy is Build #7; director real-Chrome walkthrough is Build #8), what the user will see at session-end (a passing Playwright suite covering the new specs; no user-visible change), what the next session will pick up.

3. **Three new Playwright spec files + one new fixture.** Files (all NEW):
   - `tests/playwright/extension/video-capture.spec.ts` — amazon happy path: right-click `<video>` element → form opens → fill all fields → Save → Phase-1 `requestVideoUploadUrl` mock fires → Phase-2 PUT to mocked Supabase fires with video bytes → Phase-3 `finalizeVideoUpload` fires → form closes.
   - `tests/playwright/extension/video-capture-embed.spec.ts` — amazon embed path: right-click iframe → form opens with `originalSrcUrl` pre-filled → no bytes upload path → Save → only `finalizeVideoUpload` fires (no Phase-1 / Phase-2).
   - `tests/playwright/extension/video-paste-popup.spec.ts` — popup paste form: open popup → paste YouTube URL → form fields render → Save → `finalizeVideoUpload` fires.
   - `tests/playwright/extension/amazon-video-product-page.html` — new Amazon-style product page fixture with inline `<video src="..." controls>` + an `<iframe>` embed (YouTube URL).

4. **Mock the Supabase + PLOS API endpoints per existing spec pattern.** The image-capture spec at `tests/playwright/extension/image-capture.spec.ts` is the canonical reference — copy its `page.route(...)` mock pattern for the 3 phases (requestUpload + PUT bytes + finalize) and adapt for video. The `finalizeVideoUpload` mock should return a successful CapturedVideo row that matches the wire shape from Build #2's `FinalizeVideoUploadResponse` interface.

5. **Single-platform amazon for v1 per design doc §A.13.** No cross-platform iteration (no ebay + etsy + walmart). Cross-platform extension is a future polish item mirroring the P-22 staging that landed cross-platform coverage as a separate polish item after P-23/P-24/P-25 each shipped single-platform first.

6. **Test coverage scoreboard targets.** Expect Playwright total to grow by approximately +3 cases (was 91; expect ~94). The 3 new specs may decompose into more cases internally (each `test('...', ...)` block counts as one case); director can confirm exact count at session-end via `npm run test:e2e:all` summary.

7. **Per the 2026-05-21-b + 2026-05-21-c + 2026-05-21-d CORRECTIONS_LOG §Entries:** ALWAYS use absolute paths for `cd` commands that need a specific CWD — avoid the parent-shell-cwd-drift slip + the relative-path-in-parallel-Bash slip + the find-without-cd-back slip. The recurring CWD-leak class has bitten 3 times in 2 weeks.

8. **Scoreboard:** verify `cd /workspaces/brand-operations-hub && npx tsc --noEmit` clean + `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` clean (**absolute paths per all recent CORRECTIONS_LOG entries**) + `npm run build` clean (expect **57 routes** unchanged — Build #6 doesn't add API routes; it adds Playwright specs) + src/lib node:test passes (expect **589/589** unchanged — Build #6 doesn't add src/lib tests) + extension `npm test` passes (expect **482/482** unchanged — Build #6 doesn't change extension source) + **Playwright suite passes (expect ~94 specs vs. current 91)** with the 3 new video specs reporting GREEN. **NO fresh extension zip needed** this session — no extension source change.

9. **Build commit on workflow-2** (no main push this session — Build #6 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #6 complete: Playwright specs") + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a slip occurs) + NEXT_SESSION (rewritten for Build #7 = deploy session) + CAPTURED_VIDEOS_DESIGN §B 2026-05-22 entry (capturing any mid-build judgment calls — likely test-fixture-shape decisions + mock-endpoint shape decisions).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., fixture shape — extend existing amazon-product-page.html vs. create new amazon-video-product-page.html; mock endpoint return-shape variants; which specific YouTube URL to use in fixtures), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #6 is pure test code — no `prisma db push`, no schema edit; no shared-types schema changes; no extension source change; no backend code change).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #6** — Build #6 is pure test code (Playwright specs + fixture). No new buckets, no schema changes, no dashboard work needed before the session starts.

**Optional sideload-and-try step for director (carry-over from Build #4):** the fresh extension zip `plos-extension-2026-05-21-c-w2-p27-build-4.zip` at repo root still represents the current extension surface (Build #5 only changed return-type annotations — no behavior change). Director can sideload + try the right-click capture flow on a real YouTube/Vimeo URL + revisit a competitor page where saved videos exist to see the green ✓ badges. Findings can shape Build #6's spec priorities. Safe to skip — Build #6 doesn't depend on the sideload.

**STILL-OPEN optional offline step (NOT blocking Build #6 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #6 — can happen any time.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 (implementation arc table — Build #6 covers row #7) + §A.13 (test-coverage approach — Hybrid per Rule 27) + §B 2026-05-21-d entry (the 3 mid-build judgment calls Build #5 made that constrain Build #6's spec-shape choices). ~3-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**NO Rule 8 (destructive operation) triggers planned** this session — Build #6 is pure test code; no `prisma db push`, no `git push origin main`, no destructive ops.

**NO Rule 9 (main deploy) triggers planned** this session — Build #6 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at Build #7 per design doc §A.2 row #8.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (verified at end of this session — 14 files in source dir; the P-42 backup hook is still gappy but no new memory writes this session so the mirror state is unchanged). Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #5 (URL detail page renderer + signed-URL list endpoint) per the design doc §A.2 implementation arc table row #6 remainder. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #6 (single-platform amazon Playwright extension-context spec) follows Build #5 directly per row #7. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #6's launch prompt is shaped around (a) mirroring the existing `image-capture.spec.ts` extension-context spec pattern (right-click → form → fill → Save → DB row mock assert), (b) covering the THREE distinct capture paths (right-click `<video>`, right-click `<iframe>`, popup paste form) in THREE separate spec files for clear failure surfaces, (c) shipping ONE new Amazon-style fixture page with both `<video>` and `<iframe>` elements for the right-click specs to target, and (d) staying single-platform amazon per §A.13 design pick (cross-platform extension is a future polish item if real-world use surfaces per-platform divergence — mirrors P-22's staging).

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) + the Builds #1-#5 mid-build judgment calls (in design doc §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + §B 2026-05-21-c + §B 2026-05-21-d) are all binding inputs to Build #6; do NOT re-litigate. The shipped Build #1-#5 surface (schema + bucket + helpers + API routes + extension UI + URL detail page renderer + signed-URL list endpoint) is the test target; Build #6 exercises this surface, it does NOT modify it.

**Reinforcement from this session's CWD-drift slip (CORRECTIONS_LOG §Entry):** the recurring CWD-leak class has bitten 3 times in ~2 weeks across the P-27 Build arc. Future sessions should use absolute paths for ALL Bash patterns that depend on a specific CWD — not just `cd` commands but also `find` paths + `node --test ...` argument paths. The P-43 polish should ship sooner rather than later; absent that, every session manually maintains discipline. Build #6's `npm run test:e2e:all` is the canonical scoreboard command that runs from repo root; verify cwd via `pwd` BEFORE running it.

**Alternate next-session candidates if director shifts priorities at session start (after Build #5 lands + before Build #6):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before any future big session if not already shipped; ROADMAP P-42).** Multi-reproduction history confirms the Layer-1 (Mechanical) gap is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths + extend the polish to ALL Bash patterns in any skill or session that depend on a specific CWD (LOW-MEDIUM elevated by reproduction #3 captured this session; ROADMAP P-43).** Sub-1-hour polish; the reproduction count keeps climbing (#3 today; the P-43 entry now lists 3 reproductions). The fix is so cheap and the recurrence so frequent that shipping P-43 before Build #6 might save discipline overhead during Build #6's scoreboard run.
- **P-44 `wxt build`/`wxt zip` parent-process hang investigation (LOW severity but operationally annoying; ROADMAP P-44).** Multi-session-recurring; reproduction count keeps climbing. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause.
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session). **Per `feedback_handoff_carryovers_to_roadmap.md` (2026-05-20-c standing rule):** this DEFERRED carry-over should also land in ROADMAP at next opportunity.

Check `ROADMAP.md` for the canonical state.
