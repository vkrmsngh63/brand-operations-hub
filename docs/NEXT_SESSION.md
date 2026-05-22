# Next session

**Written:** 2026-05-22-d (`session_2026-05-22-d_p45-build-1a-screen-recording-engine-foundation` — end-of-session handoff after P-45 Build #1a **screen-recording engine FOUNDATION slice SHIPPED at code level on `workflow-2-competition-scraping`** via build commit `7e2eb2c`. Original "single Build #1" framing was split at session start via a Rule 14f scope-pacing forced-picker into **1a (foundation, this session)** + **1b (wiring + dev verify, next session)** per the most-thorough/reliable picker option. 1a shipped: (a) schema migration adding `SCREEN_RECORDING` to the `VideoSourceType` enum via `npx prisma db push` (Rule 9 director-Yes gate fired; live on Supabase since 14:09 UTC); (b) NEW `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (~280 LOC) — the recording state machine (`idle | starting | recording | stopping | stopped | failed | canceled`) wrapping `getDisplayMedia` + `MediaRecorder` + the MIME picker + the region validator + a full dependency-injection surface so the controller is unit-testable without a real screen; **29 NEW node:test cases** mirroring the §C.18 enumeration; (c) correctness updates to `isFinalizeVideoUploadRequest` validator + the finalize route's bytes-required gate + the list route's signed-URL minting gate so the schema-change-in-flight window is safe. Pre-end-of-session scoreboard all GREEN: root tsc clean / extension tsc clean / `npm run build` 57 routes (unchanged) / src/lib node:test 590/590 (+1) / extension `npm test` 524/524 (+29) / Playwright SKIPPED as deliberate non-deploy efficiency choice. Closes **(a.63) RECOMMENDED-NEXT (partial — Build #1a's foundation half shipped)**. Opens **(a.64) RECOMMENDED-NEXT = P-45 Build #1b (wiring slice — overlay fork + indicator overlay + thumbnail-extraction + smart-client recording-bytes-upload + messaging + api-bridge + background-menu-registration with locked label "Record video for PLOS" + orchestrator handler + form branch + styles CSS + dev-time happy-path walkthrough on Amazon) on `workflow-2-competition-scraping`** per natural-continuation pattern (the §4 Step 1c "no obvious next task" forced-picker did NOT fire — Build #1b is the obvious next slice already pre-named by the scope-pacing picker that fired mid-Phase-2). Schema-change-in-flight flag flipped to **YES** this session and stays YES until P-45 Build #2 deploys the new enum live on vklf.com.

---

## What we did this session (in plain terms)

We shipped the FOUNDATION half of the new screen-recording feature — the engine under the hood that does the actual recording — without yet wiring it up to the user-facing buttons. Think of it as building the engine of a car and bench-testing it before bolting it into the chassis.

Three things landed:

**(1) The database knows about screen recordings now.** We added a new value `SCREEN_RECORDING` to the database column that tracks how a video was captured. Until today, the column accepted only `EMBED` (for YouTube/Vimeo iframe-style videos the user pastes) and `DIRECT_BYTES` (for plain .mp4 videos the extension downloads in one shot). Now it accepts a third value for videos the user records off their screen. The database migration ran via `npx prisma db push` which is a Rule 9 "destructive operation" — Claude asked you "is it OK to push this schema change to Supabase?" via a picker, you said yes, and the push succeeded in about 1 second. The new enum value is now live on Supabase as of 14:09 UTC today.

**(2) The recording engine itself.** A new file at `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (about 280 lines) that knows how to drive the browser's built-in screen-recording API. It exposes a small set of buttons — `start()`, `stop()`, `cancel()`, `getState()` — and internally walks through 7 states (`idle | starting | recording | stopping | stopped | failed | canceled`). It picks the best video format the browser supports (webm + VP9 preferred, falls back if not available), validates that the user-drawn rectangle is at least a minimum size, and runs a countdown timer that auto-stops at the duration cap (2-3 min hard limit from the locked design). It's written with a "dependency injection" pattern so the unit tests can simulate the browser's screen-recording API without ever actually popping a screen-share dialog. We shipped 29 unit test cases that walk every state transition + every failure mode + every region-validation edge case. All 29 pass.

**(3) Three small correctness updates** to the existing code so it doesn't trip when it sees the new enum value. The shared-types validator that checks "is this incoming API payload a valid finalize-video-upload request?" was widened to accept `SCREEN_RECORDING` alongside the existing two. The API route that finalizes a video save was widened so it requires a video file (not just a URL) when the type is `SCREEN_RECORDING` — same rule as `DIRECT_BYTES`. The API route that lists saved videos was widened so it mints a signed URL for the recorded video file the same way it does for `DIRECT_BYTES`. These three changes are the "safety net" that keeps everything working while the rest of the wiring is still missing.

What we did NOT do: we did NOT touch the right-click menu, did NOT touch the form, did NOT touch the orchestrator, did NOT touch the overlay code, did NOT build a fresh extension zip, did NOT do any dev-time verification. All of that is the next session's job.

**Why the split into 1a (today) + 1b (next session)?** When we started, Build #1 was framed as a single session that would do all of it in one window — schema migration + engine + overlay + menu + form integration + dev verification. Mid-session, we hit a scope-pacing picker because the math didn't work: the session would have been 4-5 hours of careful work + a destructive operation on the database + a director-cooperation dev-verify step all chained together, with fatigue on any of those three multiplying risk. The "most-thorough/reliable" option was to split the build into two cleaner sessions. You picked the split. So today we shipped the engine; next session we ship the wiring + the dev-verify walkthrough.

We also locked the right-click menu label. The new menu entry that will trigger screen recording will read **"Record video for PLOS"** (verb-first phrasing). The alternative was "Add to PLOS — Record Video" (matching the existing "Add to PLOS — Captured Video" entry), but verb-first is more distinct from the existing entry, which reduces the chance you'll mis-click between the two paths at right-click time.

## What we'll do next session (in plain terms)

Next session is **P-45 Build #1b — the WIRING slice + dev-time happy-path verification on Amazon.**

Six new files + nine file edits per the §C.11 file-layout table. The plan, in implementation order:

**Phase 2 wiring code (the bulk of the session, ~2-3 hours of careful work):**

1. **`messaging.ts`** — add three new message types so the content script + background can talk about recording (start-record / record-bytes-ready / record-cancel).
2. **`api-bridge.ts`** — add two new helpers so the content script can ask the background to do Phase 1 (request upload) + Phase 3 (finalize upload).
3. **`background.ts`** — register the new right-click menu item with the locked label "Record video for PLOS"; add the dispatcher that routes the new message types; add the Phase 1 + Phase 3 handlers.
4. **`recording-bytes-upload.ts`** (NEW file) — the "smart-client" orchestrator that runs Phase 1 (gets a signed upload URL from the background) + Phase 2 (PUTs the recorded webm file directly to Supabase from the content script — no Chrome IPC in the critical path so the file can be up to 100 MB without hitting any size ceiling) + Phase 3 (calls finalize-upload via the background to save the row).
5. **`thumbnail-extraction.ts`** (NEW file) — grabs the first frame of the recording via a canvas to use as the saved thumbnail.
6. **`video-region-record-overlay.ts`** (NEW file — forked from `region-screenshot-overlay.ts`) — the click-and-drag rectangle drawing UX. Reuses about 50% of the existing P-17 region-screenshot overlay infrastructure (the click-and-drag drawing logic); replaces the canvas-screenshot sink with a screen-recording-region sink.
7. **`recording-indicator-overlay.ts`** (NEW file) + new CSS in `styles.ts` — the red dashed border around the recording region + the "REC" badge in the top-right + a floating Stop toolbar.
8. **`video-capture-form.ts`** — new `kind: 'screen-recording'` branch that opens the form with the recording attached after the user clicks stop.
9. **`orchestrator.ts`** — new `enter-video-region-record-mode` handler that the right-click menu dispatches.
10. **Canvas-crop region constraint extension** to `record-controller.ts` — the foundation shipped today doesn't yet apply the user-drawn rectangle as a region constraint on the recorded video. The wiring session adds this.

Each new file gets its own test file with node:test cases (~5-25 per file per the §C.18 enumeration in the design doc).

**Pre-deploy scoreboard** (all GREEN expected): root tsc clean / extension tsc clean / `npm run build` 57 routes (unchanged) / src/lib node:test 590/590 (unchanged unless new helpers extract pure logic worth testing) / extension `npm test` 524 + ~50-80 new (the 6 new wiring files' tests). Playwright stays unchanged unless Build #1b adds extension-context specs (likely not — those ship in Build #2 or #3 per the §A.13 Hybrid coverage approach).

**Dev-time happy-path verification on Amazon** (the second big chunk of the session, ~30-60 min):

- Sideload the dev-mode extension (no fresh zip needed — `npm run dev` mode in the extension dir builds a hot-reload sideload).
- Navigate to an Amazon product page with a hero video.
- Right-click on the page → see the new menu entry "Record video for PLOS" → click it.
- Draw a rectangle around the video.
- Click the play button on the Amazon player.
- Wait 5-10 seconds.
- Click the Stop button on the floating toolbar.
- Verify the form opens with the recording attached.
- Fill in metadata + click Save.
- Verify the row lands in Supabase with `sourceType='SCREEN_RECORDING'`.
- Open the URL detail page on vklf.com and verify the recording renders inline via `<video controls>` exactly like DIRECT_BYTES rows do.

**No deploy this session.** Deploy is Build #2's scope. The point of Build #1b is to confirm the foundation + wiring all hangs together end-to-end in dev mode before we ship to vklf.com.

**End-of-session doc-batch** closes (a.64); opens (a.65) = P-45 Build #2 (deploy session — `/deploy` orchestration: pre-deploy `/scoreboard` GREEN → Rule 9 director-Yes gate → ff-merge → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip → director real-Chrome cross-platform verification across Amazon + Ebay + Walmart + Etsy).

## What's still left on the total roadmap (in plain terms)

- **P-45 screen recording (in flight — Build #1a complete this session):** Build #1b next session (wiring + dev-time verify on Amazon). Build #2 deploys to vklf.com + director real-Chrome cross-platform walkthrough across 4 platforms. Build #3 polish if needed. Estimated 2-3 more sessions to full graduation. The schema-change-in-flight flag stays YES until Build #2 deploys.
- **P-46 W#2 Phase 2 — Competition Data page redesign + Comprehensive Competitor Analysis page + new Reviews capture + URL detail page restructure + vklf.com-side upload/edit/delete:** ~15-25 sessions across 5 workstreams. Deep design + 10 clarification questions DEFERRED to a dedicated W#2 Phase 2 design session AFTER P-45 ships. New `docs/COMPETITION_DATA_V2_DESIGN.md` to be created at that design session.
- **P-27 captured videos polish backlog:** Bugs #11 input dead + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk all DEFERRED + PARTIALLY OBSOLETED by P-45 (screen recording bypasses all 3 root cause classes). Will reassess closure status after P-45 Build #2's verification walkthrough — if P-45 covers the user-visible surface for these scenarios, the bugs may be closed without explicit fixes; if P-45 doesn't fully cover them, they ship as low-priority polish after P-45.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — still OPEN; sub-1-hour polish; should ship as the very next non-P-45 session.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reliable-now-not-intermittent (reproduced twice in Build #8). ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-45 Build #1b — screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

---

**For:** the next Claude Code session — P-45 Build #1b WIRING slice + dev-time happy-path verification on Amazon (estimated 3-5 hours of careful Phase 2 work + 30-60 min dev-time verification; if the session runs long, Build #1c may split off but further fragmentation has diminishing returns — better to ship 1b in one focused session). Per Rule 23 Change Impact Audit: **ADDITIVE for code** (6 new files + 9 file edits; no breaking signature changes to any existing exported function; the recordings table already accepts `SCREEN_RECORDING` rows since 1a shipped the schema delta + the API route gates). **Schema-change-in-flight flag stays YES** the entire session (Build #1b ships the code that uses the new enum value; the deploy that lands it live on vklf.com is Build #2's scope; the flag flips to NO when Build #2's deploy completes). **Rule 9 triggers planned: NONE this session** (no schema changes — already done in 1a; no `git push origin main` — deploy is Build #2's scope; no destructive ops planned). NO `git reset --hard` / `git push --force` / `git branch -D` planned.

---

## Status of today's session

**P-45 Build #1a SHIPPED at code level on `workflow-2-competition-scraping` — screen-recording engine FOUNDATION slice.** One-hundred-and-thirtieth Claude Code session — `session_2026-05-22-d_p45-build-1a-screen-recording-engine-foundation`. NINTH substantive session of the current P-27 + P-45 Build arc (Builds #2 + #3 + #4 + #5 + #6 + #7 + #8 + #9 + P-45 #1a all chained sequentially since 2026-05-21; #1a is the first FOUNDATION-only build in the arc — splits the original Build #1 framing into 1a + 1b per the scope-pacing picker).

**Session shape (no deploy mechanics this session):**

- Build commit `7e2eb2c` landed on `workflow-2-competition-scraping` (foundation slice).
- NO main push — deploy is Build #2's scope.
- NO ping-pong sync — main didn't move (stays at `a47a95f` from Build #8 deploy).
- NO Vercel redeploy — no code shipped to vklf.com.
- NO fresh extension zip — no orchestrator wiring landed yet, so a zip would surface a foundation-only bundle with no user-visible surface change vs. Build #8 deploy zip.
- ONE Rule 9 destructive-op gate fired (for `npx prisma db push` adding the `SCREEN_RECORDING` enum value to Supabase).
- ONE end-of-session push planned (doc-batch + the build commit together to `origin/workflow-2-competition-scraping`).

**Pre-end-of-session scoreboard (all GREEN — only src/lib + ext deltas):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged — no new API route; existing finalize + requestUpload routes accept SCREEN_RECORDING via the enum) / src/lib node:test **590/590 (+1 over Build #9's 589 — new `isVideoSourceType('SCREEN_RECORDING')` test + updated `VIDEO_SOURCE_TYPES` tuple deepEqual assertion at `src/lib/shared-types/competition-scraping.test.ts:177`)** / extension `npm test` **524/524 (+29 over Build #8's 495 — record-controller test file mirrors the §C.18 enumeration)** / **Playwright SKIPPED** as deliberate efficiency choice — non-deploy session; no Playwright specs added; will re-run at the P-45 Build #2 deploy session.

**Schema-change-in-flight flag flipped session start "No" → mid-session "YES"** at the moment of `prisma db push`; stays YES at session end until P-45 Build #2 deploys the new enum value live on vklf.com.

**§4 Step 1c forced-picker DID NOT FIRE** — next task is obvious + already pre-named in (a.64) by the mid-session Rule 14f scope-pacing picker (which was an intent-clarification picker, not the §4 Step 1c "no obvious next task" picker).

**ZERO new DEFERRED items at session end (Rule 26)** — 6 Phase 2 tasks closed as binding inputs to Build #1b (captured in this NEXT_SESSION.md, not as orphan TaskList items per Rule 26's intent).

**ZERO new CORRECTIONS_LOG §Entries this session** — all Phase 1 + Phase 2 work followed protocol cleanly (Rule 14f pickers fired at the correct moments; Rule 18 append-only honored; Rule 23 Change Impact Audit ran for code + schema both confirmed safe at audit time; Rule 9 destructive op gated correctly via picker; the `VIDEO_SOURCE_TYPES` deepEqual assertion test regression caught at first scoreboard pass and fixed within 2 minutes — normal test-update-with-schema-change, not a corrections-tier slip).

**EIGHTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-45 Build #1b's wiring slice + dev-time verify lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`. `main` stays at `a47a95f` from Build #8 deploy (unchanged from this session since no Rule 9 main-push fired). After this session's end-of-session doc-batch + Build #1a code commit `7e2eb2c` push lands, workflow-2 will be 2 commits ahead of main (Build #1a + this doc-batch); P-45 Build #1b's code commit + its end-of-session doc-batch will land on workflow-2 only; the next deploy session (P-45 Build #2) ff-merges everything to main together.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-45 Build #1b — screen-recording WIRING slice + dev-time happy-path verification on Amazon, on `workflow-2-competition-scraping`.** Closes **(a.64) RECOMMENDED-NEXT**. This is the second Build session of the P-45 sub-feature (the wiring half of what was originally framed as a single Build #1 session; 1a foundation already shipped this session via commit `7e2eb2c`).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-45 polish-backlog entry (with the 1a-complete annotation noting commit `7e2eb2c` + the 1a/1b split outcome + the schema-change-in-flight flag flipped to YES).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the BINDING implementation spec — 10 implementation-ready subsections; do NOT re-litigate per Rule 18 interview-cluster pattern; this is the spec Build #1b implements) + new §B 2026-05-22-d entry (the Build #1a mid-session decisions: scope-pacing picker outcome / menu label locked / §C.19 10 sub-decisions defaulted / save-flow smart-client architecture).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (no destructive op planned this session) + Rule 14f (forced-picker pattern — fires for any sub-decisions §C.11-§C.20 didn't cover at full resolution) + Rule 18 (append-only design doc + interview-cluster — §C is BINDING at this point; do NOT re-litigate) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit) + Rule 24 (prior-treatment search — already ran for P-45 overall; re-run for any specific sub-component as needed) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (the 1a-shipped foundation — read fully; Build #1b extends this with the canvas-crop region constraint).
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.test.ts` (the 29 1a-shipped tests — read fully to understand the DI surface + the state-machine contract).
- `extensions/competition-scraping/src/lib/content-script/region-screenshot-overlay.ts` (the fork source for `video-region-record-overlay.ts` — ~50% reusable per Rule 24 search outcome).
- `extensions/competition-scraping/src/entrypoints/background.ts` (the `CONTEXT_MENU_RECORD_VIDEO` registration site with the locked label **"Record video for PLOS"** + new dispatcher + Phase 1 + Phase 3 handlers).
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (new `enter-video-region-record-mode` handler adds here).
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (new `kind: 'screen-recording'` branch adds here for the post-record save flow).
- `extensions/competition-scraping/src/lib/content-script/messaging.ts` (new message types add here: start-record + record-bytes-ready + record-cancel).
- `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` (new background-request helpers add here: requestVideoUpload variant for SCREEN_RECORDING + finalizeVideoUpload variant).
- `extensions/competition-scraping/src/lib/content-script/styles.ts` (new CSS for the in-progress visual indicator + the floating Stop toolbar + the REC badge).
- `src/lib/shared-types/competition-scraping.ts` (the shared-types broadening already shipped in 1a — read to confirm the validator + the gate shape Build #1b consumes).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize/route.ts` (the bytes-required gate broadening shipped in 1a — read to confirm the SCREEN_RECORDING branch).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` (the list route signed-URL minting broadening shipped in 1a — read to confirm the SCREEN_RECORDING branch).

**Task shape (Build session #1b of P-45):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll ship in Phase 2 (6 new files + 9 file edits per the §C.11 file layout table; the locked menu label "Record video for PLOS"; the smart-client save-flow architecture per §C.16; the canvas-crop region constraint extension to record-controller.ts), the no-Rule-9-this-session shape (no schema changes — already done in 1a; no main push — deploy is Build #2), the dev-time happy-path verification step on Amazon (sideload the dev-build extension + walk the record → form → save → verify cycle).

2. **Phase 2 wiring code** — 6 new files + 9 file edits per §C.11. Order: `messaging.ts` new types → `api-bridge.ts` new helpers → `background.ts` menu registration + dispatcher + Phase 1/3 handlers → `recording-bytes-upload.ts` smart-client orchestrator → `thumbnail-extraction.ts` first-frame grabber → `video-region-record-overlay.ts` fork → `recording-indicator-overlay.ts` + CSS → `video-capture-form.ts` new `kind: 'screen-recording'` branch → `orchestrator.ts` new `enter-video-region-record-mode` handler → canvas-crop region constraint extension to `record-controller.ts`. Tests for each new file (~5-25 cases per the §C.18 enumeration).

3. **Pre-end-of-session scoreboard** (all GREEN expected): root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged — no new API route this session; the existing finalize + requestUpload routes accept SCREEN_RECORDING via the enum since 1a) / src/lib node:test **590/590** (unchanged unless new pure helpers extract into src/lib) / extension `npm test` **524 + ~50-80 new** (the 6 new wiring files' test cases per §C.18 enumeration) / Playwright **94/94** (unchanged — no new Playwright spec this session; that ships in Build #2 or #3 per the §A.13 Hybrid coverage approach).

4. **Dev-time happy-path verification on Amazon.** Sideload the dev-mode extension (`npm run dev` in `extensions/competition-scraping/` — no fresh zip needed; dev mode hot-reloads). Open an Amazon product page → right-click → "Record video for PLOS" → draw rectangle → click play on the Amazon player → wait 5-10 sec → click Stop on the floating toolbar → verify the form opens with the recording attached → fill metadata → Save → verify the row lands in Supabase with `sourceType='SCREEN_RECORDING'` → open the URL detail page on vklf.com → verify the recording renders inline via `<video controls>` exactly like DIRECT_BYTES rows.

5. **NO deploy this session** — deploy is Build #2's scope.

6. **End-of-session doc-batch** covers ROADMAP (P-45 polish-backlog entry annotated with "✅ Build #1b complete YYYY-MM-DD" + (a.64) flipped to closed + new (a.65) opened for P-45 Build #2 deploy) + CHAT_REGISTRY (header bump — 131st Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-45 Build #2 deploy) + CAPTURED_VIDEOS_DESIGN.md §B YYYY-MM-DD entry (the Build #1b mid-build judgment calls per Rule 18 append-only) + HANDOFF_PROTOCOL (header bump only — no new rules expected).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (Phase 2 implementation-detail choices §C.11-§C.20 didn't lock at full resolution), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (intent vs. permission distinction).

**Schema-change-in-flight flag:** stays **YES** the entire session (Build #1b ships the code that uses the new enum value; the deploy that lands it live on vklf.com is Build #2's scope; the flag flips to NO when Build #2's deploy completes).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for P-45 Build #1b** — the session runs entirely from Claude + the existing Supabase project + the workflow-2 branch.

**Standing optional offline step (NOT blocking P-45 Build #1b — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-45 Build #1b — can happen any time. Note: screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the implementation-ready deepening — the binding spec Build #1b implements; informational for understanding the implementation scope). ~10-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: NONE.** No schema changes (already done in 1a). No `git push origin main` (deploy is Build #2's scope). No `git reset --hard` / `git push --force` / `git branch -D` / `rm -rf` / SQL DELETE/DROP/TRUNCATE planned.

**Rule 9 triggers planned this session: NONE.** Build #1b is pure code + dev-time verification — no destructive operations.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-45 Build #1a as the FOUNDATION half of what was originally framed as a single Build #1 session. Mid-Phase-2, a Rule 14f scope-pacing forced-picker fired because the math didn't work — the session would have chained a Rule 9 destructive op + ~2-3 hours of dependent wiring code + a director-cooperation dev-verify step into a single window past Rule 13's 90-minute trigger. Director picked the split (1a foundation + 1b wiring) per the most-thorough/reliable picker option.

The shape of P-45 Build #1b's launch prompt reflects (a) the §C.11-§C.20 BINDING spec landed in this session's design deepening (Phase 1); do NOT re-litigate per Rule 18 interview-cluster pattern, (b) the locked menu label "Record video for PLOS" decided via Rule 14f at session start, (c) the smart-client save-flow architecture decided via Rule 14f at the save-flow picker (vs. base64-through-chrome.runtime.sendMessage which is size-bound around 64 MB), (d) the no-Rule-9-this-session shape (schema delta already shipped in 1a; deploy is Build #2's scope), (e) the dev-time happy-path verification step (sideload the dev-build extension + walk the record → form → save → verify cycle on Amazon).

The §C.11-§C.20 deepening is BINDING per Rule 18 — do NOT re-litigate at implementation time. Any sub-decisions §C.11-§C.20 didn't cover at full resolution get their own Rule 14f forced-picker during Phase 2 implementation; the 10 §C.19 sub-decisions Claude defaulted this session are reversible at any time during Build #1b or later if real-world use surfaces a different need.

**Alternate next-session candidates if director shifts priorities at session start (after Build #1a + before Build #1b):**

- **P-43 scoreboard absolute-paths polish (LOW-MEDIUM elevated by ongoing reproduction history).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if a quick win on operational tooling is preferred before the larger P-45 Build #1b session. Estimated <1 hour.
- **P-42 backup-memory-dir hook fix (HIGH severity).** Multi-reproduction history; STRONGLY RECOMMENDED before any future big session. Estimated ~1 session; LOW LOC; HIGH operational importance. Director may pick this to harden the operational substrate before P-45 ships further code.
- **P-44 wxt-zip + wxt-build parent-process hang fix.** Reproduced twice in Build #8 — reliable-now-not-intermittent. Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session.
- **Defer P-45 Build #1b + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 / non-P-45 W#2 pre-graduation polish item. Estimated 1-2 sessions. Not recommended — P-45 Build #1b is the natural continuation of today's foundation work; the wiring slice is best shipped while the design + foundation context is still fresh.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
