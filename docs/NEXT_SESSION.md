# Next session

**Written:** 2026-05-21-c (`session_2026-05-21-c_p27-build-4-popup-paste-saved-video-indicator` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #4 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `ea32fa5` landed 3 NEW extension files (`CapturedVideoPasteForm.tsx` ~350 LOC popup React paste form mirroring `CapturedTextPasteForm.tsx` exactly + `already-saved-video-icon.ts` ~150 LOC green-checkmark overlay helper mirroring `already-saved-image-icon.ts` and handling BOTH `<video>` and `<iframe>` targets via tagged union + `already-saved-video-icon.test.ts` 13 node:test cases) + 8 MODIFIED extension files (`api-client.ts` new `listCapturedVideos` helper / `api-bridge.ts` new wrapper / `messaging.ts` new BackgroundRequest extension / `background.ts` new dispatcher / `orchestrator.ts` new scan + reposition + cleanup wired into URL-change paths + MutationObserver + onScrollOrResize + teardown / `styles.ts` new `.plos-cs-saved-video-icon` class / `popup/App.tsx` wires form into SetupScreen / `popup/style.css` new section styles). Total +1161 / -3 LOC. Closes (a.57) RECOMMENDED-NEXT (partial — Build #4 lands popup paste form + saved-video indicator overlay per design doc §A.2 rows #5+#6's first half; the OTHER half of row #6 — URL detail page renderer — remains for Build #5). Opens **(a.58) RECOMMENDED-NEXT = P-27 implementation #5 (Build session — URL detail page renderer for captured videos — inline `<iframe>` for embeds + inline `<video>` for direct MP4 + click-to-play overlay on thumbnails + signed-URL minting for the bytes branch via the new `ListCapturedVideosWithUrls` shape) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table row #6 remainder (sequential-build pattern per Rule 18; no §4 Step 1c forced-picker needed).

---

## What we did this session (in plain terms)

In plain terms: this session built the **two final pieces of the capture flow** for competitor videos. The Chrome extension popup now has a new "Paste captured video" section — paste a YouTube/Vimeo/etc. URL, pick the saved competitor URL + a video category (with the same inline "+ Add new" affordance you already use for text + images), hit Save, done. Mirrors the existing text-paste form you already use, so there's no new mental model.

Second piece: when you revisit a competitor page where you've already saved a video (either a direct video file or a YouTube embed), a small green ✓ checkmark badge now appears in the top-right corner of that video — so you know at a glance "yes, I already grabbed this one." Same visual treatment as the saved-image checkmarks you see today. The badge handles BOTH cases:

- If it's a direct video file (an `<video>` element on the page), the badge anchors to the video element itself.
- If it's a YouTube/Vimeo embed (an `<iframe>`), the badge anchors to the iframe.

One helper, both cases.

We added 13 small tests + verified everything via the full scoreboard. No deploy. Nothing on vklf.com changed. Fresh extension zip `plos-extension-2026-05-21-c-w2-p27-build-4.zip` is at the repo root waiting for you to sideload + try.

## What we'll do next session (in plain terms)

Next session is **Build #5** — the URL detail page renderer for saved videos. Right now if you click into a competitor URL detail page on vklf.com, you can see your saved text snippets + saved images, but you can't yet see your saved VIDEOS in that detail view. Build #5 adds an inline video player to that detail page:

- For direct-bytes videos (uploaded MP4 files), an inline `<video>` element that plays the file straight from PLOS storage.
- For YouTube/Vimeo embeds, an inline `<iframe>` that plays the embedded video.
- Thumbnails are click-to-play (the saved thumbnail image displays first; clicking it starts playback).
- For the direct-bytes case, the API has to mint signed Supabase Storage URLs at list time so the page can fetch the bytes — this is a new `ListCapturedVideosWithUrls` shape that extends the GET .../videos route that already exists.

This will be the first time the saved videos surface on the vklf.com side at all. After that comes Build #6 (the automated Playwright test on Amazon to verify the full right-click capture flow end-to-end), then Build #7 (the actual deploy to vklf.com), then Build #8 (your real-Chrome verification walkthrough).

## What's still left on the total roadmap (in plain terms)

- **P-27 captured videos (current focus):** Builds #1-#4 done. Build #5 (URL detail page renderer) next session. Then Builds #6 + #7 + #8 (Playwright test + deploy + real-Chrome verification) before P-27 is fully shipped.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works; ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; ~1 session.
- **P-43 scoreboard template polish** — convert relative paths to absolute (sub-1-hour polish; reinforced again this session via the npm run zip P-44 hang workaround).
- **P-44 wxt zip parent-process hang** — reinforced AGAIN this session (reproduction #N+1); annoying but not blocking; ~1 session for diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — fifth P-27 Build session (Session #5 of estimated ~6-8 build sessions per the design doc §A.2 implementation arc table). URL detail page renderer for captured videos: inline `<iframe>` for EMBED rows + inline `<video>` for DIRECT_BYTES rows + click-to-play overlay on thumbnails + signed-URL minting for the bytes branch via a new `ListCapturedVideosWithUrls` shape (mirrors `CapturedImageWithUrls` slice a.2 staging pattern from the image sibling per design doc §B 2026-05-21 entry's reasoning). Per Rule 23 Change Impact Audit: Additive (safe) — new optional renderer surface on the URL detail page + extended-shape variant of an existing API route (new `?withUrls=1` query param OR new sibling route at `.../videos/withUrls` — design decision arrives at session start via Rule 14f forced-picker); no existing data affected; no downstream-consumer breakage risk. **Schema-change-in-flight flag stays "No"** — Build #5 is pure code; no new tables / enums / columns; the only data-shape change is a new `ListCapturedVideosWithUrls` interface in `src/lib/shared-types/competition-scraping.ts` (paralleling existing `CapturedImageWithUrls`) which is purely additive.

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #4 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-fourth Claude Code session — THIRD substantive session of 2026-05-21 (first was `session_2026-05-21_p27-build-2-api-routes-shared-types`, second was `session_2026-05-21-b_p27-build-3-extension-content-script-form`). Build commit `ea32fa5` landed locally + will push via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB schema is unchanged from Build #1 (Build #4 is pure extension code). The user-visible popup now has a "Paste captured video" section between the text-paste form and the RegionScreenshotModeButton; revisiting a competitor page where saved videos exist shows a green ✓ badge on each saved-video element (either `<video>` or `<iframe>`).

**3 NEW extension files shipped + 8 MODIFIED extension files:**

- NEW `extensions/competition-scraping/src/entrypoints/popup/components/CapturedVideoPasteForm.tsx` (~350 LOC) — popup React paste form mirroring `CapturedTextPasteForm.tsx` exactly; EMBED branch only (pasted URLs are never DIRECT_BYTES); reuses Build #3's `captured-video-validation.ts` EMBED branch for validation; calls Build #2's `finalizeVideoUpload` API helper directly (no `requestUpload` or `putVideo` PUTs since EMBED rows have no uploaded bytes); wired into popup `SetupScreen` between text-paste form and RegionScreenshotModeButton; uses the same inline "+ Add new" vocab affordance pattern as the sibling form.
- NEW `extensions/competition-scraping/src/lib/content-script/already-saved-video-icon.ts` (~150 LOC) — green-checkmark overlay helper mirroring `already-saved-image-icon.ts` shape; handles BOTH `<video>` (DIRECT_BYTES rows) AND `<iframe>` (EMBED rows) targets via `SavedVideoTargetElement = HTMLVideoElement | HTMLIFrameElement` tagged union; same 28×28 green ✓ badge with white border + drop shadow as saved-image icon; positions to top-right of the target element's bounding rect; cleans up on URL change + teardown.
- NEW `extensions/competition-scraping/src/lib/content-script/already-saved-video-icon.test.ts` — 13 node:test cases mirroring the saved-image-icon test pattern (covers BOTH `<video>` and `<iframe>` target branches + positioning math + idempotent attach + cleanup).
- MODIFIED `extensions/competition-scraping/src/lib/api-client.ts` — new `listCapturedVideos(projectId, urlId): Promise<CapturedVideo[]>` paralleling the existing `listCapturedImages` helper.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — new `listCapturedVideos` wrapper routing through background.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/messaging.ts` — new `ListCapturedVideosRequest` + `ListCapturedVideosResponseEnvelope` + BackgroundRequest union extension + `isBackgroundRequest` type-guard branch.
- MODIFIED `extensions/competition-scraping/src/entrypoints/background.ts` — new `list-captured-videos` dispatcher.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — new `capturedVideosByUrlId` + `attachedVideoIcons` state; new `maybePopulateVideoCache` + `scanVideos` + `repositionVideoIcons` + `clearVideoIndicators` functions; wired into URL-change paths, MutationObserver rescan, onScrollOrResize reposition, and teardown cleanup. Scans match saved `CapturedVideo.originalSrcUrl` against `<video>.currentSrc` / `<video>.src` AND `<iframe>.src` in two passes; first match per saved id wins.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/styles.ts` — `.plos-cs-saved-video-icon` shares saved-image-icon visual treatment.
- MODIFIED `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — wires CapturedVideoPasteForm into SetupScreen between text-paste form and RegionScreenshotModeButton.
- MODIFIED `extensions/competition-scraping/src/entrypoints/popup/style.css` — `.captured-video-paste` section styles mirroring `.captured-text-paste`.

**3 mid-build judgment calls captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21-c (per Rule 18 append-only):**

1. **Single-form-mirrors-saved-text-shape decision** — `CapturedVideoPasteForm.tsx` mirrors `CapturedTextPasteForm.tsx` exactly (same field order + Save flow + inline-add UX); reuses `captured-video-validation.ts` EMBED branch. Sibling consistency wins on maintainability + downstream sessions reading the new form's shape don't have to context-switch between text vs. video conventions.
2. **Saved-video-icon-anchors-to-both-element-types decision** — `already-saved-video-icon.ts` handles BOTH `<video>` AND `<iframe>` targets via `SavedVideoTargetElement = HTMLVideoElement | HTMLIFrameElement` tagged union; same icon class + visual treatment as saved-image-icon. One helper for both branches matches §A.7 single-table-per-media-type principle.
3. **URL-equality-match-for-v1 decision** — saved-video scan uses exact string match of saved row's `originalSrcUrl` against `<video>.currentSrc` / `<video>.src` / `<iframe>.src`. On the same competitor page, the iframe.src is the same string the user right-clicked at capture time; if real-world use surfaces normalization mismatches (e.g., YouTube query-param drift), a future polish item adds a canonicalizer. Reversible.

**ZERO DEFERRED items open at end-of-session.**

**TWO NEW INFORMATIONAL CORRECTIONS_LOG §Entries** captured:

- **(i) P-44 reproduction #N+1** — `npm run zip` (= `wxt zip`) parent-process hang surfaced again at end-of-Build-#4. The `.output/competition-scraping-extension-0.1.0-chrome.zip` was actually written (196,849 bytes, visible via `ls -la` with fresh 15:48 timestamp), but the parent `npm run zip` shell process never exited. Workaround: `cp` the zip directly from `.output/` to repo root with the canonical filename; called TaskStop on the hung background task. Reinforces the P-44 ROADMAP item — multi-session-recurring; reproduction count keeps climbing.
- **(ii) Rule 3 code-truth catch at session start** — the launch prompt named TWO sibling reference shapes that don't exist at the named paths: `CapturedUrlPasteForm.tsx` (does NOT exist — only `CapturedTextPasteForm.tsx`) and `saved-image-indicator.ts` (actual file is `already-saved-image-icon.ts`). Both caught at session start via `wc -l` + `find` grep. No coding impact — Claude switched to the actual filenames immediately. Reinforces Rule 3 ("code is the ultimate source of truth"); future NEXT_SESSION authors should verify file paths via `ls` / `find` when listing reference shapes.

**Pre-end-of-session scoreboard (all GREEN):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged baseline; Build #4 is extension-only — no new API routes) / src/lib node:test **589/589** (unchanged) / extension `npm test` **482/482** (+13 over Build #3's 469 = saved-video-icon test cases) / Playwright **91/91** (unchanged).

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe).

**SECOND end-of-session run under the new Rule 30 + §4 Step 4b template** (first was the prior 2026-05-21-b Build #3 session). The plain-terms sections above continue the live test of the new template.

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #5 does NOT ship to main — only the URL detail page renderer lands on the feature branch; the full P-27 Build arc ships via a future deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #4 commit `ea32fa5` + the 2026-05-21-b Build #3 doc-batch `b2cc081` + 2026-05-21 Build #2 + Build #2 doc-batch lineage; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch). Workflow-2 is EIGHT COMMITS AHEAD of main (Build #1 + Build #1 doc-batch + Build #1 addendum + Build #2 + Build #2 doc-batch + Build #3 + Build #3 doc-batch + Build #4 + this session's doc-batch). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #5 — Build session (URL detail page renderer for captured videos — inline `<iframe>` for EMBED rows + inline `<video>` for DIRECT_BYTES rows + click-to-play overlay on thumbnails + signed-URL minting for the bytes branch via the new `ListCapturedVideosWithUrls` shape per design doc §A.2 row #6 remainder) on `workflow-2-competition-scraping`.** Closes **(a.58) RECOMMENDED-NEXT** (partial close — Build #5 lands the URL detail page renderer only; subsequent Build sessions add Playwright spec + deploy + verify per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table rows #7-#9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list (verify each file path via `ls` / `find` BEFORE reading; the 2026-05-21-c session caught two mis-paraphrased sibling-reference-shape paths in the launch prompt, so this list explicitly notes canonical paths):**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-21-c with "✅ Build #4 complete 2026-05-21-c").
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (§A.2 implementation arc table row #6 remainder — the canonical source for Build #5's task shape; §A.7 CapturedVideo schema spec; §A.9 bucket configuration + thumbnail extraction; §A.11 size-cap enforcement; §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + **§B 2026-05-21-c entries — the mid-build judgment calls from Builds #1-#4 that constrain Build #5's renderer-shape + API-shape choices**).
- **The reference shape Build #5 will mirror** — the existing CapturedImageWithUrls renderer pattern. Verify the canonical path via `find src/app -name "*captured-image*" -o -name "*CapturedImage*"` or `grep -rn "CapturedImageWithUrls" src/` BEFORE assuming any specific path — the prior session caught launch-prompt path-paraphrase drift; do not repeat. Likely paths to verify: `src/app/projects/[projectId]/competition-scraping/urls/[urlId]/page.tsx` (or the equivalent renderer file) + the existing `CapturedImageWithUrls` shape in `src/lib/shared-types/competition-scraping.ts` (parallel shape; the new `CapturedVideoWithUrls` mirrors this).
- **The API route Build #5 will extend** — `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` (shipped in Build #2 as GET .../videos returning bare `CapturedVideo[]`; Build #5 either adds a `?withUrls=1` query param OR ships a sibling `.../videos/withUrls/route.ts` per Rule 14f forced-picker at session start). The image-sibling staging pattern lives at `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/` — read that to see how the image sibling shipped the WithUrls extension when its gallery UI shipped (per §B 2026-05-21 entry's reasoning).
- **The Build #2 shared-types Build #5 will extend** — `src/lib/shared-types/competition-scraping.ts` (CapturedVideo + ListCapturedVideosResponse already defined in Build #2; new `CapturedVideoWithUrls` + `ListCapturedVideosWithUrlsResponse` interfaces mirror the image sibling).
- **The Build #1 storage helper Build #5 will reuse** — `src/lib/competition-video-storage.ts` (the `getSignedUrl` helper for minting Supabase Storage signed URLs at list time; same shape as the image sibling).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #5 has NO Rule 8 triggers, but verify on each tool call) + Rule 23 (Change Impact Audit — classify Build #5 as Additive (safe) BEFORE coding) + Rule 30 (Session bookends; plain-language summaries at start + end) + §4 Step 4b extended template (3 mandatory plain-terms sections at the TOP of the handoff).

**Task shape (Build session #5):**

1. **Pre-flight audit per Rule 8 + Rule 23.** Build #5 is pure server-side + UI code — no `prisma db push`, no destructive ops. Classify per Rule 23: ADDITIVE (safe) — new optional renderer + new optional API route variant + new optional shared-type interface; no existing data affected; no downstream-consumer breakage risk. Surface the Rule 23 audit to director via AskUserQuestion only if a non-additive change is discovered mid-build; otherwise proceed.

2. **Per Rule 30 — plain-terms session-start summary.** Before any heavy reads or coding, produce the "What this session will do (in plain terms)" summary so director can confirm the session shape. Cover: what we'll build (URL detail page now shows saved videos inline with playback), what we won't build (Playwright spec arrives at Build #6; deploy at Build #7; real-Chrome verification at Build #8), what the user will see at session-end (sideload-able zip + a vklf.com URL detail page renderer ready to deploy), what the next session will pick up.

3. **Rule 14f forced-picker at session start — API shape decision.** The new "list captured videos WITH signed URLs" endpoint can ship as either (A) a `?withUrls=1` query param on the existing GET .../videos route (one route, two response shapes branching on the query param) vs. (B) a sibling route at `.../videos/withUrls/` (two distinct routes, two distinct shapes; matches the image sibling's existing pattern more directly). Verify the image sibling's actual shape before firing the picker (run `find src/app -path "*images*" -name "*withUrls*"` or grep for `withUrls` in the image API routes to see which pattern the image sibling chose). Pick recommendation default per `feedback_default_to_recommendation.md`.

4. **New `CapturedVideoWithUrls` + `ListCapturedVideosWithUrlsResponse` shared-types interfaces** in `src/lib/shared-types/competition-scraping.ts` (parallel to existing `CapturedImageWithUrls` shape). Includes pre-minted signed URLs for `storagePath` (video bytes) + `thumbnailStoragePath` (thumbnail image) for DIRECT_BYTES rows; EMBED rows have no signed URLs (the `originalSrcUrl` is the playable URL directly).

5. **New API route or extended route per the forced-picker outcome from step 3.** Mints signed Supabase Storage URLs at list time via the Build #1 helper. Signed-URL TTL: match the image sibling's existing TTL (likely 1 hour; verify at session start). Defensive null handling for EMBED rows (no signed URLs needed) + for DIRECT_BYTES rows with NULL `thumbnailStoragePath` (the §A.12 fallback case from Build #3).

6. **New renderer surface on the URL detail page.** Inline `<iframe>` for EMBED rows (uses `originalSrcUrl` directly — that's the YouTube/Vimeo/etc. embed URL). Inline `<video controls>` for DIRECT_BYTES rows (uses the signed `storagePath` URL minted by the new API route). Click-to-play overlay on thumbnails — the thumbnail image displays first; clicking it starts playback. Empty-state when no saved videos for the URL.

7. **Test coverage (Rule 27 Hybrid).** Add node:test cases for any new pure-function helpers (e.g., a signed-URL-mapper helper if extracted). The renderer + the API route handler depend on Next.js + Supabase + React + DOM; Playwright extension-context coverage arrives at Build #6 per design doc §A.13. **Per the 2026-05-21-b + 2026-05-21-c CORRECTIONS_LOG §Entries:** ALWAYS use absolute paths for `cd` commands that need a specific CWD — avoid the parent-shell-cwd-drift slip.

8. **Scoreboard:** verify `npx tsc --noEmit` clean + `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` clean (**absolute path per the 2026-05-20-c + 2026-05-21 + 2026-05-21-b + 2026-05-21-c CORRECTIONS_LOG §Entries**) + `npm run build` clean (expect either **57 routes** unchanged OR **58 routes** if a sibling route variant was chosen in step 3) + src/lib node:test passes (expect **~589-595/589-595** depending on how many helper test cases added) + extension `npm test` passes (expect **482/482** unchanged — Build #5 is server-side + UI, not extension code; if a stale-test rebaseline is needed, surface it). **Fresh extension zip** NOT required this session (no extension source change) — confirm at session-end with a `git diff extensions/competition-scraping/` check.

9. **Build commit on workflow-2** (no main push this session — Build #5 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #5 complete: URL detail page renderer") + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a slip occurs) + NEXT_SESSION (rewritten for Build #6) + CAPTURED_VIDEOS_DESIGN §B 2026-05-22 entry (capturing any mid-build judgment calls including the API-shape forced-picker outcome).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., signed-URL TTL choice; thumbnail-fallback rendering for NULL thumbnailStoragePath rows; renderer placement within the URL detail page layout), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #5 is pure code — no `prisma db push`, no schema edit; the only data-shape change is a new additive shared-type interface).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #5** — Build #5 is pure server-side + UI code (URL detail page renderer + API route variant). No new buckets, no schema changes, no dashboard work needed before the session starts.

**Optional sideload-and-try step for director:** the fresh extension zip `plos-extension-2026-05-21-c-w2-p27-build-4.zip` at repo root contains the Build #4 popup paste form + saved-video indicator overlay. Director can sideload + try the new "Paste captured video" popup section on a real YouTube/Vimeo URL + revisit a competitor page where saved videos exist to see the green ✓ badges. Findings can shape Build #5's renderer priorities. Safe to skip — Build #5 doesn't depend on the sideload.

**STILL-OPEN optional offline step (NOT blocking Build #5 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from 2026-05-21-b handoff):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #5 — can happen any time.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 (implementation arc table — Build #5 covers row #6 remainder) + §B 2026-05-21-c entry (the 3 mid-build judgment calls Build #4 made that constrain Build #5's renderer-shape + API-shape choices). ~3-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**NO Rule 8 (destructive operation) triggers planned** this session — Build #5 is pure server-side + UI code; no `prisma db push`, no `git push origin main`, no destructive ops.

**NO Rule 9 (main deploy) triggers planned** this session — Build #5 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at a future Build session per design doc §A.2 row #8.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (verified at end of this session). Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #4 (popup paste form + saved-video indicator overlay) per the design doc §A.2 implementation arc table rows #5+#6 first half. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #5 (URL detail page renderer) follows Build #4 directly per row #6 remainder. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #5's launch prompt is shaped around (a) mirroring the existing `CapturedImageWithUrls` renderer pattern on vklf.com's URL detail page (likely at `src/app/projects/[projectId]/competition-scraping/urls/[urlId]/page.tsx` — verify path via `find` BEFORE reading), (b) extending the GET .../videos route shipped in Build #2 to mint signed URLs at list time (either via a `?withUrls=1` query param OR via a sibling `.../videos/withUrls/` route — forced-picker at session start), (c) reusing the Build #1 storage helper for signed-URL minting, and (d) leaning on the new `listCapturedVideos` api-client helper shipped in Build #4 (extended to a `listCapturedVideosWithUrls` variant).

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) + the 2026-05-20-c Build #1 mid-build refinements (in design doc §B 2026-05-20-c) + the 2026-05-21 Build #2 mid-build judgment calls (in design doc §B 2026-05-21) + the 2026-05-21-b Build #3 mid-build judgment calls (in design doc §B 2026-05-21-b) + the 2026-05-21-c Build #4 mid-build judgment calls (in design doc §B 2026-05-21-c) are all binding inputs to Build #5; do NOT re-litigate. The shipped popup paste form + saved-video indicator overlay + API routes + shared-types + helpers from prior Builds are also binding inputs; Build #5's renderer should reuse all existing infrastructure cleanly.

**Reinforcement from this session's Rule 3 code-truth catch:** future NEXT_SESSION authors (including this very document) should verify file paths via `ls` / `find` when listing reference shapes. Loose paraphrase of file names from memory has produced multiple slip-class incidents (this session caught `CapturedUrlPasteForm.tsx` and `saved-image-indicator.ts` as non-existent paraphrases). The "Pre-build read list" section above explicitly notes when canonical paths need verification before reading — please do that verification.

**Alternate next-session candidates if director shifts priorities at session start (after Build #4 lands + before Build #5):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before any future big session if not already shipped; ROADMAP P-42).** Multi-reproduction history confirms the Layer-1 (Mechanical) gap is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths + extend the polish to ALL Bash patterns in any skill or session that depend on a specific CWD (LOW-MEDIUM elevated by reproductions; ROADMAP P-43).** Sub-1-hour polish; the 2026-05-21-c CORRECTIONS_LOG entry (i) reinforces the case via the P-44 workaround which requires absolute-path discipline to execute cleanly.
- **P-44 `wxt build`/`wxt zip` parent-process hang investigation (LOW severity but operationally annoying; ROADMAP P-44).** Reproduction #N+1 captured this session. Multi-session-recurring. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause.
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session). **Per `feedback_handoff_carryovers_to_roadmap.md` (2026-05-20-c standing rule):** this DEFERRED carry-over should also land in ROADMAP at next opportunity.

Check `ROADMAP.md` for the canonical state.
