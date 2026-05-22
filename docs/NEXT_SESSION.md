# Next session

**Written:** 2026-05-22-c (`session_2026-05-22-c_p27-build-9-devtools-diagnosis-and-p45-screen-recording-pivot` — end-of-session handoff after P-27 Captured-videos Build #9 **DevTools-cooperative debugging + P-45 screen-recording design-pivot session on `workflow-2-competition-scraping`**. Bug #12 Save-fails-Network-unreachable was diagnosed in ONE DevTools-cooperative step — the failing fetch URL is `blob:https://www.amazon.com/...` with `net::ERR_FILE_NOT_FOUND`. Amazon + Ebay use Media Source Extensions (MSE) for their video players; the resulting `blob:` URLs are scoped to the page that created them and cannot be fetched from the background service worker. Build #8's `retryOnTransportError` helper could NEVER have cleared this — the failure is at the URL-fetchability layer, not the transport layer. Director's escape-hatch question at the fix-direction picker — *"is there a way to capture videos that bypasses ALL of these failure classes?"* — surfaced **screen recording as a 4th universal solution** that goes through the user's screen as the source-of-truth, bypassing blob: URLs (records the MediaStream of the screen) + cross-origin walker limits (visual capture needs no DOM traversal) + native-controls quirks (right-click triggers a separate menu item). Director chose "skip the short-term fix — design screen recording properly NOW" at the sequencing picker, pivoting Build #9 from a fix-shipping session into a pure design-capture session. 12 P-45 design decisions locked through structured Rule 14f pickers (7 core + 5 default-locks). Rule 24 prior-treatment search ran with zero direct prior treatment found; P-17 region-screenshot infrastructure surfaced as ~50% reusable for the rectangle-drag overlay. **NO code commits this session — pure design + diagnostic work.** No deploy. No schema changes. No Rule 9 trigger. Closes **(a.62) RECOMMENDED-NEXT (partial — Bug #12 diagnosed + design pivoted; Bug #11 + Bug #9 deeper-walk + Bug #15 deferred + partially obsoleted by P-45).** Opens **(a.63) RECOMMENDED-NEXT = P-45 Build #1 (Rule 18 interview-cluster deepening of `docs/CAPTURED_VIDEOS_DESIGN.md` §C from current C.0-C.10 outline → full §C.0-§C.N implementation-ready structure + ship `record-controller.ts` ~150 LOC + fork `region-screenshot-overlay.ts` → `video-region-record-overlay.ts` + add "Record video" right-click menu item + ship in-progress visual indicator (red dashed border + REC badge) + schema migration adding `SCREEN_RECORDING` enum value via `prisma db push` (Rule 9 gate fires) + dev-time happy-path verification on Amazon) on `workflow-2-competition-scraping`** per §4 Step 1c forced-picker outcome.

---

## What we did this session (in plain terms)

We diagnosed Bug #12 — the "Network unreachable" Save failure — in literally ONE DevTools step. You opened Chrome DevTools on Amazon, reproduced the failing Save, switched to the Network tab, and I asked you to read out the URL of the request that failed. The URL started with `blob:https://www.amazon.com/...` and the status was `net::ERR_FILE_NOT_FOUND`. That ended the diagnostic right there.

Here's what the URL told us: Amazon (and Ebay) use a browser feature called **Media Source Extensions (MSE)** for their video players. Instead of pointing the `<video>` tag at a regular `.mp4` URL on a CDN, MSE feeds video bytes into the player through a JavaScript pipe, and the browser hands the page a special `blob:` URL that points to that in-page pipe. **Those blob: URLs are not real network resources** — they exist only inside the page that created them, and they're invisible to the extension's background service worker. When our code tried to `fetch()` that blob URL from the SW to download the video bytes, the browser said "file not found" because the blob doesn't exist outside the original page's context. Build #8's retry helper couldn't have ever fixed this; we were retrying an unfetchable URL.

Then we hit a fix-direction picker. The narrow options were "fix the bug" (per-platform DOM-walker improvements + per-platform proxy fetch attempts — but the blob isn't reachable from anywhere outside the page). Then you asked the open-ended escape-hatch question — *"is there a universal way to capture videos that doesn't depend on the blob: URL pattern?"* — and that surfaced **screen recording** as option 4. Screen recording captures the user's screen as a MediaStream, encodes it locally with the browser's MediaRecorder API, and saves the resulting file. It bypasses the blob: URL class of bugs entirely (because we record the pixels, not the underlying URL). It also bypasses the cross-origin iframe walker bug (#9 Amazon hover-preview) and the Ebay native-controls quirk (#15) because both of those failures share the same root cause class — they're "can't access the video from the DOM" failures, and screen recording doesn't need DOM access at all.

We then hit the sequencing picker — (A) ship a short-term Bug #12 fix first + design P-45 separately, vs. (B) skip the short-term fix + design P-45 properly NOW. You picked (B). The rationale: a short-term fix would buy us back maybe one platform (and only partially), would burn another build session of trial-and-error work, AND would still need to be replaced by P-45 anyway. Designing P-45 NOW lets us ship the universal solution faster + cleaner.

We then ran 12 structured Rule 14f pickers to lock the P-45 design — 7 core decisions and 5 default-locks. The 7 core: (1) region selection mode = draw a rectangle (reusing the P-17 region-screenshot overlay infrastructure); (2) audio = always-on (the recording always includes system audio); (3) duration cap = 2-3 minutes hard limit (auto-stop at 3 min); (4) Web API = `getDisplayMedia` + `MediaRecorder` (browser-native; no extra deps); (5) trigger = right-click "Record video" menu item (sits next to the existing "Capture Video" entry); (6) coexistence with fast-fetch path = keep both (fast-fetch wins when blob: doesn't apply; record falls back universally); (7) save flow = record first, then open the form (not the other way around — preserves the "happy path = automatic" feel). The 5 default-locks: storage in the same Supabase bucket as captured-videos with a new `videoMode='SCREEN_RECORDING'` discriminator; webm container with vp9 video + opus audio codec; file-size warning at 50 MB; cancel UX = Esc key + on-screen Cancel button + revoke MediaStream; preview = inline `<video controls>` exactly like DIRECT_BYTES rows.

We also ran the Rule 24 prior-treatment search — looked through the design doc history for any prior screen-recording treatment. There's none. The closest adjacent infrastructure is P-17 (region-screenshot tool from before W#2 graduated as a feature) which ships a rectangle-drag overlay component. That overlay is **about 50% reusable** for P-45 — same UX pattern (click-and-drag to draw a rectangle on the page), different downstream sink (P-17 sends to canvas screenshot capture; P-45 will send to getDisplayMedia's region constraint).

We landed the two design-doc surfaces (new §B 2026-05-22 entry + new §C section with C.0-C.10 subsections capturing all 12 decisions) and the new P-45 ROADMAP polish-backlog entry. NO code shipped this session. Pure design.

## What we'll do next session (in plain terms)

Next session is **P-45 Build #1 — design deepening + first implementation pass.**

The shape: this is back to a regular build session pattern, not a debugging session. Two main phases:

**Phase 1 — design deepening (Rule 18 interview-cluster pattern).** §C of the design doc currently has the C.0-C.10 outline with the 12 decisions locked. Build #1 deepens §C into implementation-ready prose — each subsection grows from 1-3 sentences to ~10-30 sentences with concrete file paths, function names, code-level interfaces, error paths, and edge cases. This is the same pattern Build #1 of P-27 itself used (deepen the §A design before any code lands). We've already locked the binding decisions, so this phase is mostly turning the locked decisions into specifications a code-writing session can implement directly.

**Phase 2 — first implementation pass.** Ship the following code:

1. **`extensions/competition-scraping/src/lib/screen-recording/record-controller.ts`** (~150 LOC NEW FILE) — the recording state machine. Has start / stop / cancel / events. Talks to `getDisplayMedia` for the MediaStream + MediaRecorder for the encoded webm file + the schema-migration enum value for the storage discriminator.

2. **`extensions/competition-scraping/src/lib/screen-recording/video-region-record-overlay.ts`** (~120 LOC NEW FILE — forked from `region-screenshot-overlay.ts`) — the rectangle-drag overlay UX. Reuses the click-and-drag drawing logic; replaces the canvas-screenshot sink with a getDisplayMedia region-constraint dispatch.

3. **Right-click menu addition** in `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — new "Record video" entry that fires when the user right-clicks anywhere on the page (not just on a `<video>` element — since the recording targets the screen, not the DOM). Sits next to the existing "Capture Video" entry per the UI decision.

4. **In-progress visual indicator** — red dashed border around the recording region + a small "REC" badge in the top-right of the recording area. Renders during the recording; disappears when recording stops or cancels.

5. **Schema migration** — add `SCREEN_RECORDING` value to the `videoMode` enum in `prisma/schema.prisma`. Run `npx prisma db push` to apply to Supabase. **This triggers Rule 9** — the director-Yes gate fires before the push. After the push, **schema-change-in-flight flag flips to "YES"** for the rest of Build #1 until the deploy lands the new enum value live on vklf.com.

6. **Dev-time happy-path verification on Amazon** — sideload the extension in dev mode, navigate to an Amazon product page, right-click → "Record video" → draw rectangle around the video → wait 5-10 sec → click stop → verify the form opens with the recording attached + Save fires → verify the record lands in Supabase + renders in the URL detail page.

The build session likely splits across 1 session (if all 6 land cleanly) or 2 sessions (if Phase 1 design deepening grows larger than expected, or if the dev-time verification surfaces issues that need a Build #2 follow-up).

After Build #1, the deploy moves to a separate Build #2 (per the P-27 build arc pattern — separate code-level + deploy-level builds).

## What's still left on the total roadmap (in plain terms)

- **P-45 screen recording (new this session — the universal video-capture solution):** Build #1 next session (design deepening + record-controller + overlay fork + menu addition + visual indicator + schema migration + dev-time verify). Build #2 deploys to vklf.com + director real-Chrome walkthrough. Build #3 polish if needed. Estimated 2-3 sessions to full graduation.
- **P-46 W#2 Phase 2 — Competition Data page redesign + Comprehensive Competitor Analysis page + new Reviews capture + URL detail page restructure + vklf.com-side upload/edit/delete (NEW this session — captured after Build #9 doc-batch as a scope-drop directive from director):** ~15-25 sessions across 5 workstreams (schema + Competition Data table rewrite + URL detail page restructure + new rich-text Comprehensive Analysis page + extension form additions + new Reviews capture workflow). **Deep design + 10 clarification questions DEFERRED to a dedicated W#2 Phase 2 design session AFTER P-45 ships** per the sequencing forced-picker. New `docs/COMPETITION_DATA_V2_DESIGN.md` to be created at that design session.
- **P-27 captured videos polish backlog:** Bugs #11 input dead + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk all DEFERRED + PARTIALLY OBSOLETED by P-45 (screen recording bypasses all 3 root cause classes). Will reassess closure status after P-45 ships — if P-45 covers the user-visible surface for these scenarios, the bugs may be closed without explicit fixes; if P-45 doesn't fully cover them, they ship as low-priority polish after P-45.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — still OPEN; sub-1-hour polish; should ship as the very next non-P-45 session.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reliable-now-not-intermittent (reproduced twice in Build #8). ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-45 Build #1.

---

**For:** the next Claude Code session — first P-45 Build session (estimated 2-3 sessions total to graduation). **Design-deepening + first-implementation-pass session.** Per Rule 23 Change Impact Audit: **ADDITIVE for code (new files + new menu item + new overlay; no breaking changes to existing files)** + **MIXED for schema (new enum value via `prisma db push` — Rule 9 trigger fires)**. **Schema-change-in-flight flag flips to "YES"** at the moment the `npx prisma db push` runs in Build #1 + stays YES until the next deploy lands the new enum live on vklf.com. **Rule 9 trigger expectation: YES** — `prisma db push` is a Rule 9 trigger; director-Yes gate fires before the push. NO `git push origin main` planned in Build #1 (deploy ships in a separate Build #2 session). NO `git reset --hard` / `git push --force` / `git branch -D` planned.

---

## Status of today's session

**P-27 Captured-videos feature Build #9 DEVTOOLS-COOPERATIVE DEBUGGING + P-45 SCREEN-RECORDING DESIGN-PIVOT SESSION on `workflow-2-competition-scraping`.** One-hundred-and-twenty-ninth Claude Code session — `session_2026-05-22-c_p27-build-9-devtools-diagnosis-and-p45-screen-recording-pivot`. EIGHTH substantive session of the current P-27 Build arc (Builds #2 + #3 + #4 + #5 + #6 + #7 + #8 + #9 all chained sequentially since 2026-05-21; #9 is the first non-code session in the arc).

**Session shape (no deploy mechanics this session):**

- NO code commits — pure design + diagnostic work.
- NO main push — no Rule 9 trigger this session.
- NO ping-pong sync — main didn't move (stays at `a47a95f` from Build #8 deploy).
- NO Vercel redeploy — no code shipped to vklf.com.
- NO fresh extension zip — no extension source change.
- NO P-44 reproduction this session — `npm run build` + `npm run zip` were NOT invoked this session (no code change to build / zip).

**Pre-end-of-session scoreboard NOT RUN** as deliberate efficiency choice — no code changed this session, so a scoreboard run would be performative (would report exact-same numbers as Build #8's pre-deploy baseline: 57 routes / 589 src/lib / 495 ext / 94 Playwright). Documented as a process-justified skip, not a slip.

**Bug #12 DevTools-cooperative diagnosis outcome (the diagnostic moment that triggered the design pivot):**

| Step | Director action | Claude diagnostic narration | Outcome |
|---|---|---|---|
| 1 | Open Chrome DevTools on Amazon product page → Network tab | "Reproduce the failing Save → read out the URL of the failing fetch + the error string" | URL = `blob:https://www.amazon.com/...`; error = `net::ERR_FILE_NOT_FOUND`. **Root cause identified in one step.** |

The blob: URL pattern + `net::ERR_FILE_NOT_FOUND` together pin down the root cause as Media Source Extensions (MSE) — Amazon's video player feeds bytes through a JavaScript pipe rather than a regular CDN URL, and the resulting `blob:` URL exists only inside the originating page. The background service worker cannot fetch it. Build #8's `retryOnTransportError` couldn't have ever cleared it because the failure is at the URL-fetchability layer, not the transport layer.

**P-45 design decisions (12 total — locked through structured Rule 14f pickers + recorded in §C C.0-C.10):**

7 core decisions:
1. **Region selection** = draw a rectangle (reusing P-17 region-screenshot overlay infrastructure as ~50% reusable starting point).
2. **Audio** = always-on (system audio captured alongside video).
3. **Duration cap** = 2-3 minutes hard limit (auto-stop at 3 min).
4. **Web API** = `getDisplayMedia` + `MediaRecorder` (browser-native; no extra deps).
5. **Trigger** = right-click "Record video" menu item (sits next to existing "Capture Video" entry).
6. **Coexistence with fast-fetch path** = keep both (fast-fetch wins when blob: doesn't apply; record falls back universally).
7. **Save flow** = record first, then open the form (not the other way around).

5 default-locks:
- Storage = same Supabase bucket as captured-videos with new `videoMode='SCREEN_RECORDING'` discriminator.
- Format = webm container with vp9 video + opus audio codec.
- File-size warning at 50 MB.
- Cancel UX = Esc key + on-screen Cancel button + revoke MediaStream.
- Preview = inline `<video controls>` exactly like DIRECT_BYTES rows.

**Rule 24 prior-treatment search outcome:** zero direct prior treatment of screen recording in the design doc history. Closest adjacent infrastructure is P-17 region-screenshot tool — its rectangle-drag overlay component (`region-screenshot-overlay.ts`) is ~50% reusable for P-45's region-selection UX. Same click-and-drag drawing logic; different downstream sink (P-17 sends to canvas screenshot; P-45 will send to getDisplayMedia region constraint).

**Schema-change-in-flight flag stayed "No"** the entire session (the SCREEN_RECORDING enum value will be added in P-45 Build #1, NOT this session; no `prisma db push` ran this session).

**§4 Step 1c forced-picker FIRED EXPLICITLY** — sequencing picker between (A) ship short-term Bug #12 fix first + design P-45 separately vs. (B) skip short-term fix + design P-45 properly NOW. Director chose (B) per `feedback_default_to_recommendation.md`. **(a.63) RECOMMENDED-NEXT = P-45 Build #1 (design deepening + first-implementation-pass) on `workflow-2-competition-scraping`.**

**ZERO new DEFERRED items at session end (Rule 26).** Prior Build #8 DEFERRED items #10-#13 (Bug #11 input dead + Bug #12 fetch + Bug #9 hover-preview walker + Bug #15 Ebay native-controls quirk) all remain on the polish backlog as low-priority recovery work. Three of those four (#11 + #9 + #15) are **partially obsoleted by P-45** — screen recording bypasses all three root cause classes (blob: URL + cross-origin iframe + native-controls quirk). The fourth (#12 fetch) is fully obsoleted by P-45 since the diagnostic showed the underlying URL is unfetchable by design. Closure of the partial-obsoletion items will be reassessed after P-45 Build #2's verification walkthrough.

**ZERO new CORRECTIONS_LOG §Entries this session** — design-pivot is per-protocol (Rule 18 interview-cluster + Rule 14f forced-picker + Rule 24 prior-treatment search all worked exactly as designed); NOT a corrections-log-tier slip.

**SEVENTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-45 Build #1's design deepening + first implementation pass lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`. `main` stays at `a47a95f` from Build #8 deploy (unchanged this session since no Rule 9 trigger fired). After this session's end-of-session doc-batch lands + pushes, workflow-2 will be 1 commit ahead of main (the doc-batch); P-45 Build #1's code commit + its end-of-session doc-batch will land on workflow-2 only; the next deploy session (P-45 Build #2 or later) ff-merges everything to main together.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-45 Build #1 — screen-recording video capture design deepening + first implementation pass on `workflow-2-competition-scraping`.** Closes **(a.63) RECOMMENDED-NEXT**. This is the first Build session of the new P-45 sub-feature (screen recording as a universal video-capture solution that bypasses the blob: URL + cross-origin walker + native-controls quirk classes of bugs diagnosed in Build #9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the new P-45 polish-backlog entry between P-44 and P-26 (landed this session — captures the universal-solution rationale + the link between the 4 deferred bugs and P-45's coverage).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-22 entry (Build #9 DevTools-cooperative diagnosis + the design-pivot decision narrative + Rule 24 prior-treatment search results) + the new §C section "P-45 Screen-Recording Sub-Feature Design (NEW 2026-05-22)" with C.0-C.10 subsections (the binding design surface — 12 decisions locked through Rule 14f pickers; do NOT re-litigate per Rule 18 interview-cluster pattern).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (`prisma db push` trigger — fires once this session) + Rule 14f (forced-picker pattern — fires inside the Phase-1 design deepening for any sub-decisions §C didn't cover at the lock-in resolution) + Rule 18 (append-only design doc + interview-cluster — Phase-1 deepening is the canonical Rule 18 second-pass) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit) + Rule 24 (prior-treatment search — already ran this session for P-45 overall; re-run for any specific sub-component as needed) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `extensions/competition-scraping/src/lib/region-screenshot-overlay.ts` (the P-17 rectangle-drag overlay component — the source for the fork to `video-region-record-overlay.ts`; ~50% reusable per Rule 24 search outcome).
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (right-click menu registration site — new "Record video" entry adds here next to existing "Capture Video"; coexistence design from §C.5).
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (post-record save flow lands here — record completes → form opens with the recorded file pre-attached → user fills metadata → Save fires).
- `prisma/schema.prisma` (the `videoMode` enum gets new `SCREEN_RECORDING` value via Build #1's schema migration).
- `src/lib/shared-types/competition-scraping.ts` (the `CapturedVideo` shared type may grow new fields for recording metadata — duration / region dimensions / audio-on flag; verify against §C.6 storage decision before adding fields).
- `src/lib/supabase/competition-scraping-videos-bucket.ts` (the bucket helpers — verify the same bucket holds SCREEN_RECORDING rows per §C.6 default-lock; same signed-URL minting works since the path scheme is unchanged).

**Task shape (Build session #1 of P-45):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll ship in Phase 1 (design deepening — §C subsections grow from outline to implementation-ready prose) + what we'll ship in Phase 2 (code: record-controller + region-record overlay fork + right-click menu addition + visual indicator + schema migration + dev-time verify), the Rule 9 trigger that fires this session (`prisma db push`), the schema-change-in-flight flag flip to YES, the no-deploy-this-session shape (Build #2 is the future deploy).

2. **Phase 1 — design deepening (Rule 18 interview-cluster pattern).** Read the new §C section + run Rule 14f forced-pickers for any sub-decisions §C didn't cover at full resolution (likely candidates: exact MediaRecorder constructor options for vp9+opus + the visual-indicator z-index choice + the Esc-key cancel listener registration site + the file-size warning toast copy). Write the deepened §C.0-§C.N prose into `docs/CAPTURED_VIDEOS_DESIGN.md` (append-only per Rule 18; do NOT modify the existing C.0-C.10 outline, append the deepened content as sub-bullets or as a new §C.X-§C.Y range; choose the structure that fits — likely either expanding each existing C.0-C.10 in-place with implementation-ready prose, OR appending a §C.11-§C.20 "implementation-ready details" mirror block).

3. **Phase 2 — code.** Ship the 5 code changes (record-controller + overlay fork + menu addition + visual indicator + schema migration). Each gets its own test file with node:test cases. Run `npm test` in `extensions/competition-scraping/` to verify all tests green + run `npx tsc --noEmit` in both root + extension dir to verify type clean.

4. **Rule 9 director-Yes gate** before `npx prisma db push`. Director-Yes is non-negotiable. After the push, the SCREEN_RECORDING enum is live in Supabase + the schema-change-in-flight flag flips to "YES" until the next deploy.

5. **Dev-time happy-path verification on Amazon.** Sideload the extension in dev mode (no fresh zip needed — `npm run dev` mode in the extension dir builds a hot-reload sideload). Open an Amazon product page → right-click → "Record video" → draw rectangle around the video → click play in the video player → wait 5-10 sec → click stop → verify the form opens with the recording attached + Save fires → verify the row lands in Supabase with `videoMode='SCREEN_RECORDING'` + verify the URL detail page renders the recording inline via `<video controls>`.

6. **Pre-end-of-session scoreboard** (all GREEN expected): root tsc clean / extension tsc clean / `npm run build` 57 routes (unchanged — no new API route this session; the new `/api/.../videos/finalize` already accepts SCREEN_RECORDING via the enum) / src/lib node:test 589/589 (unchanged unless new helpers extract pure logic worth testing) / extension `npm test` 495 + N new (the record-controller test file + the overlay fork test file + any helper extracts) / Playwright 94/94 (unchanged — no new Playwright spec this session; that ships in Build #2 or #3).

7. **End-of-session doc-batch** covers ROADMAP (P-45 polish-backlog entry annotated with "✅ Build #1 complete YYYY-MM-DD" + (a.63) flipped to closed + new (a.64) opened for P-45 Build #2 deploy) + CHAT_REGISTRY (header bump — 130th Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-45 Build #2 deploy) + CAPTURED_VIDEOS_DESIGN.md §C deepening + §B YYYY-MM-DD entry (the Build #1 mid-build judgment calls per Rule 18 append-only) + HANDOFF_PROTOCOL (header bump only — no new rules expected).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (Phase 1 sub-decisions §C didn't lock; Phase 2 implementation-detail choices), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** flips to **YES** at the moment of `prisma db push` + stays YES until the next deploy lands the new enum value live on vklf.com. The §C.6 storage default-lock is the binding contract — `videoMode='SCREEN_RECORDING'` discriminator in the same bucket as the existing captured-videos rows.

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for P-45 Build #1** — the session runs entirely from Claude + the existing Supabase project + the workflow-2 branch.

**STILL-OPEN optional offline step (NOT blocking P-45 Build #1 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-45 Build #1 — can happen any time. Note: screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (vp9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §C section (the new P-45 design — 12 decisions locked through Rule 14f pickers; informational for understanding the implementation scope). ~5-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session:** `npx prisma db push` (Rule 9 trigger — director-Yes gate fires). NO `git push origin main` planned in Build #1 (deploy ships in a separate Build #2 session). NO `git reset --hard` / `git push --force` / `git branch -D` planned.

**Rule 9 triggers planned this session: YES** — `npx prisma db push` is a Rule 9 trigger; the director-Yes gate is non-negotiable when it fires. After the push, schema-change-in-flight flag flips to YES + stays YES until the next deploy lands the new enum live on vklf.com.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #9 DevTools-cooperative debugging + pivoted mid-session into a P-45 screen-recording design-capture session after Bug #12's root cause (blob: URLs from Media Source Extensions; unreachable from background SW) made it clear that 3 of the 4 deferred Build #8 bugs share a "can't access the video from the DOM" root cause class that screen recording bypasses entirely.

The §4 Step 1c forced-picker FIRED at the sequencing question — (A) short-term-fix-first + design-later vs. (B) skip-short-term + design-now. Director chose (B). The shape of P-45 Build #1's launch prompt reflects (a) the Rule 18 interview-cluster pattern (design deepening before code lands — same approach P-27 itself used at its Build #1), (b) the Rule 9 trigger that fires inside the session (`prisma db push` for the SCREEN_RECORDING enum), (c) the schema-change-in-flight flag flip to YES that follows the push, (d) the no-deploy-this-session shape (Build #2 is the future deploy — separates code-level + deploy-level builds per the P-27 build arc pattern), (e) the dev-time happy-path verification step (sideload the extension in dev mode + walk through the record → form → save → verify cycle on Amazon).

The 12 P-45 design decisions captured in §C are BINDING per Rule 18 — do NOT re-litigate at implementation time. Any sub-decisions §C didn't cover at full resolution get their own Rule 14f forced-picker during Phase 1 design deepening; locked decisions stay locked.

**Alternate next-session candidates if director shifts priorities at session start (after Build #9 design-pivot + before P-45 Build #1):**

- **P-43 scoreboard absolute-paths polish (LOW-MEDIUM elevated by ongoing reproduction history).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if a quick win on operational tooling is preferred before the larger P-45 Build #1 session. Estimated <1 hour.
- **P-42 backup-memory-dir hook fix (HIGH severity).** Multi-reproduction history; STRONGLY RECOMMENDED before any future big session. Estimated ~1 session; LOW LOC; HIGH operational importance. Director may pick this to harden the operational substrate before P-45 ships.
- **P-44 wxt-zip + wxt-build parent-process hang fix.** Reproduced twice in Build #8 — reliable-now-not-intermittent. Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session.
- **Defer P-45 Build #1 + ship the deferred Build #8 bugs (#11 + #15) as low-priority polish anyway.** Director may pick this if they want to clear the polish backlog tail before P-45 lands. Note: this is the lower-leverage option vs. P-45 since 3 of the 4 deferred bugs are partially obsoleted by P-45.
- **Defer P-45 Build #1 + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 / non-P-45 W#2 pre-graduation polish item. Estimated 1-2 sessions.
- **Defer P-45 Build #1 + start W#2 graduation prep.** P-27 has shipped 80%+ of its design surface + P-45 is the universal solution for the remaining edge cases; director may want to declare W#2 graduated and let P-45 ship as a post-graduation polish item. The graduation moment is director's call.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
