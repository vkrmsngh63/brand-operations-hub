# Next session

**Written:** 2026-05-22-e (`session_2026-05-22-e_p45-build-1b-screen-recording-wiring-slice` — end-of-session handoff after P-45 Build #1b **screen-recording WIRING slice SHIPPED at code level on `workflow-2-competition-scraping`** via build commit `80713ff` (16 files changed, +2418/-15). Build #1b is the wiring half of what was split out of the original "single Build #1" framing on 2026-05-22-d — 1a foundation shipped via `7e2eb2c` (schema migration + record-controller engine + 29 tests + validator/route broadening); Build #1b shipped (a) 3 NEW screen-recording helpers — `recording-bytes-upload.ts` (~150 LOC smart-client Phase 1+2+3 orchestrator + `normalizeBlobMime` helper stripping MediaRecorder codec params), `thumbnail-extraction.ts` (`extractFirstFrameThumbnail` via hidden HTMLVideoElement + canvas + `toBlob('image/jpeg', 0.85)`; NEVER throws — returns null on any failure per §A.12), canvas-crop region constraint extension to `record-controller.ts` (optional `cropStreamToRegion` DI dep preserving 1a backward-compatibility); (b) 2 NEW content-script overlays — `video-region-record-overlay.ts` (forked from `region-screenshot-overlay.ts` per §C.13) + `recording-indicator-overlay.ts` (per §C.15 with red dashed border + REC ● pulsing badge + M:SS countdown + Stop + Cancel toolbar + PREPARING state); (c) 9 file edits wiring foundation → user-visible surface (`messaging.ts` new types + `api-bridge.ts` new helpers + `background.ts` `CONTEXT_MENU_RECORD_VIDEO` with locked label **"Record video for PLOS"** + `orchestrator.ts` new `enter-video-region-record-mode` handler + `video-capture-form.ts` new `kind:'screen-recording'` branch with `<video controls>` preview from Blob createObjectURL + `styles.ts` new CSS + `captured-video-validation.ts` bytes-required gate broadened symmetrically + `record-controller.ts` extended with optional canvas-crop DI dep + `record-controller.test.ts` +5 canvas-crop cases) + 3 NEW test files (thumbnail-extraction.test.ts 8 cases + video-region-record-overlay.test.ts 8 cases + recording-indicator-overlay.test.ts 12 cases). Total +34 extension tests (524 → 558). Pre-end-of-session scoreboard all GREEN: root tsc clean / extension tsc clean / `npm run build` 57 routes (unchanged) / src/lib node:test 590/590 (unchanged) / extension `npm test` 558/558 (+34) / Playwright SKIPPED as deliberate non-deploy efficiency choice. Closes **(a.64) RECOMMENDED-NEXT (partial — Build #1b's wiring half shipped at code level; dev-time happy-path verify on Amazon DEFERRED to Build #2 per director directive late-session)**. Opens **(a.65) RECOMMENDED-NEXT = P-45 Build #2 (DEPLOY session — 4-phase shape: Phase 1 dev-time happy-path verify on Amazon (deferred from this session) → Phase 2 `/scoreboard` GREEN check → Phase 3 `/deploy` orchestration with Rule 9 director-Yes gate + ff-merge `workflow-2-competition-scraping` → `main` + push origin/main + Vercel auto-redeploy + ping-pong sync + fresh extension zip → Phase 4 director real-Chrome cross-platform verify across Amazon + Ebay + Walmart + Etsy) on `workflow-2-competition-scraping`** (natural-continuation pattern; the §4 Step 1c "no obvious next task" forced-picker did NOT fire — Build #2 is the obvious deploy continuation implied by the §C.20 ship checklist + the verify-deferral handling per the 1a precedent for cross-session binding inputs). Schema-change-in-flight flag **stays YES** the entire session and continues to stay YES until Build #2 deploys the new SCREEN_RECORDING enum value live on vklf.com.

---

## What we did this session (in plain terms)

We shipped the WIRING half of the new screen-recording feature — all the user-visible plumbing that connects the recording engine (shipped in the previous session) to the right-click menu, the on-screen overlays, the form, and the save flow. The engine had been built and bench-tested last session; this session bolted it into the chassis.

Three groups of files landed:

**(1) Five brand-new files that didn't exist before.** Two are deep-plumbing helpers (`recording-bytes-upload.ts` is the "smart-client" save flow that uploads the recorded video straight from the page to Supabase without round-tripping through Chrome's message bus — that's how it can handle files up to 100 MB; `thumbnail-extraction.ts` grabs the first frame of the recording for use as the thumbnail). Two are the visible overlays the user sees during recording: a click-and-drag rectangle drawer (forked from the existing region-screenshot overlay — about half the code was reused) and the recording indicator (a thin red dashed border around the recording region + a floating toolbar at the top with a pulsing "REC ●" badge + a M:SS countdown + Stop and Cancel buttons). Plus a `recording-indicator-overlay.test.ts` test file with 12 test cases.

**(2) Nine existing files extended.** The new right-click menu entry **"Record video for PLOS"** is now registered in the extension's background script. The orchestrator wires up the new "enter video-region-record-mode" flow that the right-click triggers. The video-capture form now has a brand-new branch that opens with a recorded video attached (instead of a downloaded video or an iframe-embed URL). The shared CSS got a pulsing keyframe for the REC badge. The messaging + api-bridge layers got new message types so the content-script and the background can talk to each other about recordings. The bytes-required validator was widened so it accepts recording rows the same way it accepts directly-downloaded video rows. And the recording engine itself (which was 280 lines last session) got an extension that applies the user-drawn rectangle as a region constraint on the recorded video — that part was deferred from last session because it needed the rest of the wiring to make sense.

**(3) Three new test files with 28 new test cases** (8 + 8 + 12) plus 5 more cases appended to the recording engine's test file. The extension test count grew from 524 to 558 — +34 tests, all green. The strict-mode TypeScript check caught a few unsafe array accesses in the new test files + one production line (recording-bytes-upload.ts line 72); those got fixed in about 5 minutes with non-null assertions in the tests + a `?? ''` fallback in production code.

What we did NOT do: we did NOT deploy anything to vklf.com (deploy is the next session's job), we did NOT do the dev-time happy-path verification on Amazon. The dev-time verify was supposed to be the closing step of this session per the original ship checklist — but late-session you said *"please defer all testing for later and continue with whatever is next on the roadmap"*, so we deferred that step into the next session as its first task. This is fine because the next session is the deploy session anyway, and verifying before deploying is the natural sequence.

We hit ZERO protocol slips this session — all the deepening work last session paid off: the implementation-detail decisions were already locked in §C.11-§C.20 of the design doc, so this session was straight implementation against a binding spec with no re-litigation.

## What we'll do next session (in plain terms)

Next session is **P-45 Build #2 — the deploy session.** Four phases:

**Phase 1 — dev-time happy-path verify on Amazon (~30-60 min cooperative).** Sideload the dev-mode extension (`npm run dev` in `extensions/competition-scraping/` builds a hot-reload sideload — no fresh packaged zip needed for the verify; the zip comes during deploy in Phase 3). Open an Amazon product page with a hero video. Right-click on the page → see the new menu entry "Record video for PLOS" → click it → see the rectangle-draw overlay → draw a rectangle around the video → see Chrome's "Choose what to share" dialog pop up → pick the current tab → see the red dashed border + REC badge + countdown appear → click play on the Amazon video player → wait 5-10 seconds → click Stop on the floating toolbar → see the form open with the recording attached + preview playing inline → fill in metadata (project, platform, category, composition) → click Save → see the row land in Supabase with `sourceType='SCREEN_RECORDING'` → open the URL detail page on vklf.com → see the recording render inline via `<video controls>` exactly like a `DIRECT_BYTES` row does. If anything fails at any of these steps, we triage and fix-forward before deploy.

**Phase 2 — `/scoreboard` GREEN check before deploy.** All checks should be at exact baselines: root tsc clean / extension tsc clean / 57 routes / 590 src/lib / 558 ext / Playwright 94 (unchanged — the new wiring exercises a `getDisplayMedia` permission prompt that Playwright headless Chromium can't satisfy at full fidelity; cross-platform Playwright deferred to Build #3 if useful).

**Phase 3 — `/deploy` orchestration.** Rule 9 director-Yes gate fires once for `git push origin main`. Then `/deploy` orchestrates: ff-merge `workflow-2-competition-scraping` → `main` (the merge will carry Build #1a + Build #1b + this session's doc-batch + Build #2's doc-batch all as a single fast-forward of 4-5 commits) → push origin/main → Vercel auto-redeploy fires → ping-pong sync brings `workflow-2-competition-scraping` back even with `main` → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8) → schema-change-in-flight flag flips to NO at this moment (SCREEN_RECORDING is now live on vklf.com).

**Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (not dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on **Amazon** (the bug class that motivated P-45 — should now save successfully via the recording path) + **Ebay** (also blob: URLs from Media Source Extensions — should also save via the recording path) + **Walmart** (already works via DIRECT_BYTES; recording path should also work as a fallback) + **Etsy** (already works via DIRECT_BYTES; recording path should also work as a fallback). If anything fails on any platform, we triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

**Possible Build #3 (CONDITIONAL).** If Phase 4 surfaces verification failures requiring code fixes, Build #3 ships those as a fix-forward + redeploy + re-verify session (mirrors the Build #7 → Build #8 fix-forward pattern). If Phase 4 passes clean across all 4 platforms, P-45 graduates with no Build #3 needed.

**End-of-session doc-batch** closes (a.65); opens (a.66) which will be either Build #3 fix-forward (if Phase 4 surfaces failures) OR the very next non-P-45 polish item — likely **P-43 scoreboard absolute-paths polish** (sub-1-hour polish; the recurring CWD-leak class keeps biting) OR **P-42 backup-memory-dir hook fix** (HIGH severity; strongly recommended before any future big session).

## What's still left on the total roadmap (in plain terms)

- **P-45 screen recording (in flight — Build #1b complete this session):** Build #2 next session (dev-time verify + deploy + cross-platform real-Chrome walkthrough). Possible Build #3 if Build #2's Phase 4 surfaces verification failures. Estimated 1-2 more sessions to full graduation. The schema-change-in-flight flag stays YES until Build #2 deploys.
- **P-46 W#2 Phase 2 — Competition Data page redesign + Comprehensive Competitor Analysis page + new Reviews capture + URL detail page restructure + vklf.com-side upload/edit/delete:** ~15-25 sessions across 5 workstreams. Deep design + 10 clarification questions DEFERRED to a dedicated W#2 Phase 2 design session AFTER P-45 ships. New `docs/COMPETITION_DATA_V2_DESIGN.md` to be created at that design session.
- **P-27 captured videos polish backlog:** Bugs #11 input dead + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk all DEFERRED + PARTIALLY OBSOLETED by P-45 (screen recording bypasses all 3 root cause classes). Will reassess closure status after P-45 Build #2's Phase 4 walkthrough — if P-45 covers the user-visible surface for these scenarios, the bugs may be closed without explicit fixes; if P-45 doesn't fully cover them, they ship as low-priority polish after P-45.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — still OPEN; sub-1-hour polish; should ship as the very next non-P-45 session (recurring CWD-leak class keeps biting).
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reliable-now-not-intermittent (reproduced twice in Build #8). ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-45 Build #2 — screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

---

**For:** the next Claude Code session — P-45 Build #2 DEPLOY session (estimated ~2-3 hours: Phase 1 dev-time verify ~30-60 min cooperative + Phase 2 scoreboard ~5 min + Phase 3 deploy orchestration ~10-15 min + Phase 4 director cross-platform real-Chrome verify ~60-90 min cooperative). Per Rule 23 Change Impact Audit: **DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code + the already-shipped 1a schema delta** (SCREEN_RECORDING enum value live on Supabase since 2026-05-22-d 14:09 UTC). No new dependencies. No data risk (no existing rows touched; the deploy makes the SCREEN_RECORDING enum value reachable from vklf.com routes that already accept it server-side). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag flips NO** at the moment Build #2's `git push origin main` completes + Vercel auto-redeploy finishes (the production routes on vklf.com begin reading the new enum value). **Rule 9 triggers planned: ONE** — `git push origin main` for the deploy. Director-Yes gate fires via AskUserQuestion picker per the canonical `/deploy` orchestration. NO `git reset --hard` / `git push --force` / `git branch -D` planned.

---

## Status of today's session

**P-45 Build #1b SHIPPED at code level on `workflow-2-competition-scraping` — screen-recording WIRING slice.** One-hundred-and-thirty-first Claude Code session — `session_2026-05-22-e_p45-build-1b-screen-recording-wiring-slice`. TENTH substantive session of the current P-27 + P-45 Build arc (Builds #2 + #3 + #4 + #5 + #6 + #7 + #8 + #9 + P-45 #1a + P-45 #1b all chained sequentially since 2026-05-21; #1b is the WIRING half of P-45's 1a/1b split per the 2026-05-22-d scope-pacing forced-picker).

**Session shape (no deploy mechanics this session):**

- Build commit `80713ff` landed on `workflow-2-competition-scraping` (wiring slice — 16 files changed, +2418/-15).
- NO main push — deploy is Build #2's scope.
- NO ping-pong sync — main didn't move (stays at `a47a95f` from Build #8 deploy).
- NO Vercel redeploy — no code shipped to vklf.com.
- NO fresh extension zip — director directive late-session deferred dev-time verify to Build #2, so the natural Build #2 deploy zip will be the next zip artifact.
- NO Rule 9 destructive-op gate fired (schema delta already done in 1a; no main push; no destructive operations).
- ONE end-of-session push planned (doc-batch + the build commit together to `origin/workflow-2-competition-scraping`).

**Pre-end-of-session scoreboard (all GREEN — only ext delta + strict-mode normalization within scoreboard pass):** root tsc clean / extension tsc clean (after fixing TS18048 errors on indexed-array accesses in 3 new test files + `recording-bytes-upload.ts` line 72 via non-null assertions `!` + `?? ''` fallback — caught at first scoreboard pass, fixed within 5 min) / `npm run build` **57 routes** (unchanged — no new API route; the existing finalize + requestUpload routes accept SCREEN_RECORDING via 1a's enum broadening) / src/lib node:test **590/590** (unchanged — no new src/lib tests; validator broadening covered by existing `isVideoSourceType` test from 1a) / extension `npm test` **558/558 (+34 over Build #1a's 524 — 8 thumbnail-extraction + 8 video-region-record-overlay + 12 recording-indicator-overlay + 5 canvas-crop on record-controller + 1 normalizeBlobMime helper)** / **Playwright SKIPPED** as deliberate efficiency choice — non-deploy session per §C.18; extension-context Playwright deferred to Build #3.

**Schema-change-in-flight flag stays YES** the entire session — SCREEN_RECORDING enum live on Supabase since 2026-05-22-d 14:09 UTC; flips to NO when Build #2 deploys the new enum value live on vklf.com.

**§4 Step 1c forced-picker DID NOT FIRE** — Build #2 is the obvious deploy continuation already implied by the §C.20 ship checklist + the verify-deferral handling per the 1a precedent.

**ZERO new DEFERRED items at session end (Rule 26)** — Task #13 (dev-time happy-path verify on Amazon) marked deleted per director directive late-session and reframed as Build #2's Phase 1 binding input (captured in this NEXT_SESSION.md, not as orphan TaskList DEFERRED per Rule 26's intent + the 1a precedent for clearly-named cross-session binding inputs).

**ZERO new CORRECTIONS_LOG §Entries this session** — all Phase 2 wiring work followed protocol cleanly. THREE inline informational observations only (NOT corrections-tier slips): (1) strict-mode TS18048 errors on indexed access caught + fixed within the scoreboard pass via non-null assertions + `?? ''` fallback; (2) director directive late-session deferred dev-time verify to Build #2, reframed as Build #2's Phase 1 binding input per the 1a precedent; (3) `validateCapturedVideoDraft` bytes-required gate broadened symmetrically to DIRECT_BYTES + SCREEN_RECORDING — additive coverage, no test regression.

**NINTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9; eighth was 2026-05-22-d Build #1a). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-45 Build #2's dev-time verify + deploy lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`. `main` stays at `a47a95f` from Build #8 deploy (unchanged from this session since no Rule 9 main-push fired). After this session's end-of-session doc-batch + Build #1b code commit `80713ff` push lands, workflow-2 will be 4 commits ahead of main (Build #1a code + Build #1a doc-batch + Build #1b code + this doc-batch). Build #2's ff-merge to main will carry all 4 commits + Build #2's own doc-batch as a single fast-forward.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-45 Build #2 — screen-recording DEPLOY session, on `workflow-2-competition-scraping`.** Closes **(a.65) RECOMMENDED-NEXT**. This is the third Build session of the P-45 sub-feature (Build #1a foundation shipped 2026-05-22-d via `7e2eb2c`; Build #1b wiring shipped 2026-05-22-e via `80713ff`; Build #2 deploys both to vklf.com).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-45 polish-backlog entry (with the 1b-complete annotation noting commit `80713ff` + the 1a/1b split outcome + the schema-change-in-flight flag flipped to YES + the dev-time verify deferral to Build #2's Phase 1).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the BINDING implementation spec — 10 implementation-ready subsections; do NOT re-litigate per Rule 18 interview-cluster pattern; this is the spec Build #1b implemented) + new §B 2026-05-22-e entry (the Build #1b mid-build decisions: validator broadening symmetric / canvas-crop optional DI dep / preview via `<video controls>` from Blob createObjectURL / verify deferral handling per the 1a precedent / strict-mode TS18048 normalization).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (the destructive-op gate that fires once for `git push origin main`) + Rule 14f (forced-picker pattern — the deploy gate is a Rule 9 picker per the canonical `/deploy` orchestration) + Rule 18 (append-only design doc — §C is BINDING; §A frozen) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code) + Rule 27 (Playwright forced-picker before manual walkthroughs — Phase 4 director real-Chrome walkthrough is per Rule 27 + §C.18's "manual walkthrough is the integration test" decision) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `.claude/commands/deploy.md` (the canonical `/deploy` orchestration — pre-deploy scoreboard → Rule 9 gate → ff-merge → push → Vercel redeploy → ping-pong sync → fresh extension zip).
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (read the full state machine + the canvas-crop DI dep extension shipped in 1b — confirm understanding before dev-time verify).
- `extensions/competition-scraping/src/lib/screen-recording/recording-bytes-upload.ts` (the smart-client Phase 1+2+3 orchestrator — read fully for the Phase 4 cross-platform verify diagnostic path if anything fails).
- `extensions/competition-scraping/src/lib/screen-recording/thumbnail-extraction.ts` (the first-frame canvas grab that NEVER throws — diagnostic path for Phase 4 cases where thumbnail isn't visible in the URL detail page gallery).
- `extensions/competition-scraping/src/lib/content-script/video-region-record-overlay.ts` (the rectangle-draw overlay — diagnostic path for Phase 4 cases where the overlay doesn't appear or behaves oddly on a platform).
- `extensions/competition-scraping/src/lib/content-script/recording-indicator-overlay.ts` (the red dashed border + REC badge + Stop toolbar — diagnostic path for Phase 4 cases where the indicator doesn't appear or the Stop button is unresponsive).
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (the `enter-video-region-record-mode` handler — diagnostic path for Phase 4 cases where the right-click menu doesn't trigger the record flow).
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the new `kind:'screen-recording'` branch — diagnostic path for Phase 4 cases where the form doesn't open with the recording attached or Save fails).
- `extensions/competition-scraping/src/entrypoints/background.ts` (the `CONTEXT_MENU_RECORD_VIDEO` registration with locked label **"Record video for PLOS"** + the `handleSubmitVideoScreenRecordingRequestUpload` + `handleSubmitVideoScreenRecordingFinalize` handlers — diagnostic path for Phase 4 cases where the save flow fails at the Phase 1 requestUpload or Phase 3 finalize step).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize/route.ts` (the bytes-required gate now requires `videoStoragePath` for both DIRECT_BYTES + SCREEN_RECORDING — Build #1a; confirm the route's SCREEN_RECORDING branch).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` (the list route signed-URL minting gate now mints `videoUrl` for SCREEN_RECORDING rows the same as DIRECT_BYTES — Build #1a; confirm the route's SCREEN_RECORDING branch + the URL detail page's `<video controls>` inline render).

**Task shape (Deploy session #2 of P-45):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in each of the 4 phases (Phase 1 dev-time verify on Amazon ~30-60 min; Phase 2 `/scoreboard` GREEN check ~5 min; Phase 3 `/deploy` orchestration ~10-15 min with the Rule 9 director-Yes gate; Phase 4 director real-Chrome cross-platform verify across Amazon + Ebay + Walmart + Etsy ~60-90 min), the Rule-9-once shape (one gate at `git push origin main`), the schema-change-in-flight flag flipping NO at the moment Build #2's deploy completes.

2. **Phase 1 — dev-time happy-path verify on Amazon (~30-60 min cooperative).** Sideload the dev-mode extension (`npm run dev` in `extensions/competition-scraping/` — hot-reload sideload; NO fresh packaged zip needed for the verify, the zip comes during deploy in Phase 3). Walk: open Amazon product page with hero video → right-click → "Record video for PLOS" → draw rectangle → Chrome "Choose what to share" dialog → pick tab → red dashed border + REC badge + countdown appear → click play on Amazon player → wait 5-10 sec → Stop → form opens with recording + preview → fill metadata → Save → row lands in Supabase with `sourceType='SCREEN_RECORDING'` → open URL detail page on vklf.com → recording renders inline via `<video controls>`. If anything fails, triage + fix-forward BEFORE Phase 2.

3. **Phase 2 — `/scoreboard` GREEN check before deploy** (all checks should be at exact baselines): root tsc clean / extension tsc clean / `npm run build` **57 routes** / src/lib node:test **590/590** / extension `npm test` **558/558** / Playwright **94/94** (unchanged from Build #6's baseline).

4. **Phase 3 — `/deploy` orchestration** per `.claude/commands/deploy.md`: Rule 9 director-Yes gate fires once for `git push origin main` → ff-merge `workflow-2-competition-scraping` → `main` (carries 4-5 commits: Build #1a code + Build #1a doc-batch + Build #1b code + this Build #1b doc-batch + Build #2's own doc-batch landing later in session) → push origin/main → Vercel auto-redeploy fires (monitor at vklf.com or Vercel dashboard) → ping-pong sync (`git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping`) → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8). **Schema-change-in-flight flag flips NO** at this moment.

5. **Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (NOT dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on Amazon (the bug class motivating P-45 — should save successfully via recording path) + Ebay (also blob: URLs from MSE — should save via recording path) + Walmart (DIRECT_BYTES works; recording should also work as fallback) + Etsy (DIRECT_BYTES works; recording should also work as fallback). If failures surface, triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

6. **End-of-session doc-batch** covers ROADMAP (P-45 polish-backlog entry annotated with "✅ Build #2 deploy complete YYYY-MM-DD" + (a.65) flipped to closed + new (a.66) opened — likely P-45 Build #3 fix-forward OR the very next non-P-45 polish item like P-43 / P-42) + CHAT_REGISTRY (header bump — 132nd Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for the next session) + CAPTURED_VIDEOS_DESIGN.md §B YYYY-MM-DD entry (Build #2 mid-deploy judgment calls per Rule 18 append-only + §C.20 ship checklist Phase 4 outcomes per platform) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (new "Deploy session #N — P-45 screen recording DEPLOYED + cross-platform verification" section appended before the END OF DOCUMENT marker — the canonical verification artifact for Build #2 covering deploy mechanics + 4-platform verification grid + any captured failures for Build #3).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-deploy forced-pickers (e.g., Phase 4 verification failure triage — fix-forward Build #3 vs. revert vs. accept-as-known-issue), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (intent vs. permission distinction).

**Schema-change-in-flight flag:** **flips NO** at the moment Build #2's deploy completes + Vercel auto-redeploy finishes — SCREEN_RECORDING enum value now reachable from production routes on vklf.com.

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for P-45 Build #2** — the session runs entirely from Claude + the existing Supabase project + the workflow-2 branch + production Vercel + production vklf.com.

**Standing optional offline step (NOT blocking P-45 Build #2 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-45 Build #2 — can happen any time. Note: screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the implementation-ready deepening — the binding spec Build #1b implemented; informational for understanding the implementation scope) + new §B 2026-05-22-e entry (the Build #1b mid-build decisions). ~10-minute skim before the next session if director wants the full context.

**Pre-Phase-1 setup (informational — Claude will handle in-session):** the dev-mode extension sideload needs an Amazon product page with a hero video. Suggested URLs that have historically had working hero video players: search Amazon for popular electronics or beauty products. The dev mode runs hot-reload so any code change Claude makes mid-session reflects immediately on the page after a Chrome refresh.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ONE** — `git push origin main` for the deploy (Rule 9 picker fires here; director-Yes gate enforced via AskUserQuestion).

**Rule 9 triggers planned this session: ONE** — same as Rule 8, the `git push origin main` deploy. NO `prisma db push` planned (schema delta already shipped in 1a). NO `git reset --hard` / `git push --force` / `git branch -D` / `rm -rf` / SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-45 Build #1b as the WIRING half of what was split out of the original "single Build #1" framing on 2026-05-22-d (the foundation half of which shipped that session via `7e2eb2c`). The 1a/1b split was Rule 14f scope-pacing forced-picker outcome — splitting kept each session within Rule 13's 90-minute window + cleanly separated the destructive-op session (1a) from the wiring session (1b).

Late-session, director directive *"please defer all testing for later and continue with whatever is next on the roadmap"* deferred the dev-time happy-path verify on Amazon to the next session. Per the 1a precedent for cross-session binding inputs (the 2026-05-22-d session's Phase 2 wiring tasks were closed as binding inputs to 1b rather than orphan TaskList DEFERRED entries since 1b was clearly-named + the wiring was its natural opening step), the verify is captured in this NEXT_SESSION.md as Build #2's Phase 1 step + Task #13 was marked deleted rather than DEFERRED. Build #2 needs to verify before deploy anyway under Rule 9 + §C.20 step 20, so combining verify + deploy is more natural than splitting verify into its own session.

The shape of P-45 Build #2's launch prompt reflects (a) the §C.11-§C.20 BINDING spec implemented in 1a + 1b — do NOT re-litigate at deploy time per Rule 18 interview-cluster pattern; (b) the 4-phase deploy session shape (verify → scoreboard → deploy → cross-platform verify) which mirrors the canonical W#2 build-then-deploy pattern from Build #7 / Build #8; (c) the locked menu label **"Record video for PLOS"** which director must confirm reads correctly in real Chrome's right-click menu; (d) the one-Rule-9-this-session shape (the `git push origin main` deploy gate); (e) the schema-change-in-flight flag flipping NO at deploy completion.

The §C.11-§C.20 deepening is BINDING per Rule 18 — do NOT re-litigate at deploy time. Any Phase 4 verification failures get surfaced via Rule 14f forced-picker between (A) fix-forward in a new Build #3 session vs. (B) accept-as-known-issue + defer to a future polish session vs. (C) revert this deploy. Per the 2026-05-22 Build #8 precedent, fix-forward is the recommended option unless the failure class is fundamentally unfixable at the deploy level.

**Alternate next-session candidates if director shifts priorities at session start (after Build #1b + before Build #2):**

- **P-43 scoreboard absolute-paths polish (LOW-MEDIUM elevated by ongoing reproduction history).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if a quick win on operational tooling is preferred before the larger P-45 Build #2 deploy session. Estimated <1 hour.
- **P-42 backup-memory-dir hook fix (HIGH severity).** Multi-reproduction history; STRONGLY RECOMMENDED before any future big session. Estimated ~1 session; LOW LOC; HIGH operational importance. Director may pick this to harden the operational substrate before P-45 ships further code.
- **P-44 wxt-zip + wxt-build parent-process hang fix.** Reproduced twice in Build #8 — reliable-now-not-intermittent. Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session.
- **Defer P-45 Build #2 + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 / non-P-45 W#2 pre-graduation polish item. Estimated 1-2 sessions. Not recommended — P-45 Build #2 is the natural continuation of today's wiring; the deploy + cross-platform verify closes the P-45 implementation arc and shouldn't be left in flight.
- **Defer P-45 Build #2 + start P-46 W#2 Phase 2 design session.** ~15-25 sessions across 5 workstreams. Not recommended — the sequencing picker on 2026-05-22-c locked P-46 to start AFTER P-45 ships; jumping to P-46 now would leave the screen-recording wiring undeployed + force future P-45 work to be picked up cold.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
