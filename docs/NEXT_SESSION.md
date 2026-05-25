# Next session

**Written:** 2026-05-25 (`session_2026-05-25_p48-session-2-implementation-and-ff1-busted` — end-of-session handoff after **W#2 polish P-48 Session 2 (Implementation + Fix-Forward #1 BUSTED) ✅ DEPLOYED-PARTIAL 2026-05-25 on vklf.com via `workflow-2-competition-scraping` → `main`** — `fix-webm-duration` patch shipped end-to-end via build commit `279da34` ff-merged `a486af8..279da34` to main (4 files +211/-9; DI-seam wiring in `record-controller.ts` + 4 new node:test cases) under Rule 9 gate #1; director-verified the SEEK BAR fix end-to-end on vklf.com (recordings made post-deploy now show real total duration like "0:22" instead of "∞" / "Live" / "-:--"); Phase-4 surfaced that playback STUTTER PERSISTS even with duration metadata now correct; empirical ffprobe revealed every SCREEN_RECORDING webm file (since P-45 shipped 2026-05-22-i) is captured at ~6-7 fps actual rate (not the intended 30 fps); speculative FF-1 build commit `d8b9507` (1 file +25/-2; attach hidden video element to DOM) ff-merged `279da34..d8b9507` to main under Rule 9 gate #2 but empirically BUSTED via post-FF-1 ffprobe (155 frames / 18.19s = 8.52 fps — within noise of pre-fix 6.21-6.79 fps baseline); per director Rule 14f forced-picker outcome, remaining stutter work deferred to P-48 Session 3 (Diagnostic #2) with proper "ffprobe-first" discipline before any more structural fixes ship; FF-1 commit `d8b9507` STAYS in production (no rollback) as calibration data point. **Closes (a.90) RECOMMENDED-NEXT = P-48 Session 2 (Implementation) ✅ DEPLOYED-PARTIAL 2026-05-25**; **opens (a.91) RECOMMENDED-NEXT = P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`** — empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck BEFORE shipping any more structural fixes.

---

## What we did this session (in plain terms)

Today was a **build + deploy + fix-forward session** for the screen-recording stutter issue you flagged during the 2026-05-24-f verifications.

The good news first: I shipped the `fix-webm-duration` patch that Session 1 (yesterday-same-day) had locked as the fix path. It's live on vklf.com. You sideloaded the new extension, recorded a fresh screen recording, loaded it on vklf.com, and the SEEK BAR is now fixed end-to-end — recordings show real total durations like "0:22" instead of "∞" / "Live" / "-:--". That part of the original symptom is resolved.

The bad news: the stutter is still there. You watched the post-fix recording and the playback was just as choppy as before. That confused me — Session 1's diagnosis said missing-duration was THE root cause of the stutter, but here we have correct duration AND continued stutter. So I ran `ffprobe` on the post-fix file and three earlier files to characterize what's actually being captured. The numbers were eye-opening: every single screen recording in your database — the three pre-fix files AND the new post-fix file — was captured at roughly 6-7 frames per second, not 30 fps. (Specifically: 6.79 / 6.79 / 6.21 fps across four samples.) That's the actual root cause of the stutter you've been seeing — playback can't be smoother than the source, and the source is genuinely a low-fps recording. Session 1's missing-duration fix was correct for the seek bar but didn't touch this separate problem.

I attempted a quick speculative fix-forward to address the framerate — the theory was that Chrome throttles `<video>` elements that aren't attached to the DOM as a battery-saving optimization, and our screen-recording pipeline creates a hidden video element that never gets attached. I shipped a small change (25 lines) attaching the video to the page with 1×1-pixel opacity-0 styling, deployed it, you sideloaded the new build and recorded another recording. I ran ffprobe again: 8.52 fps. Within noise of the 6.21-6.79 fps baseline. The theory was empirically wrong. I asked you whether you wanted to (A) defer the stutter work to a fresh diagnostic session next time, (B) try one more empirical guess, or (C) roll back the failed-theory commit. You picked (A) — defer + leave the failed-theory commit in production as a calibration breadcrumb for the design-doc lesson.

Mid-session I had **one false-alarm.** I told you the Platform column was missing from the Competition Data table (looked like a regression to me); you immediately pointed out it was right there — I'd just missed it scanning the screenshot. No real regression. Recorded as a deleted task in the session log; not a real bug.

Lesson captured for future fix-forward shaping: **I shouldn't recommend a quick speculative fix-forward when there's a cheap empirical test that would tell us whether the theory is right BEFORE we ship it.** Today's FF-1 cycle (~30-45 min including your sideload + ffprobe + verification) would have cost about 10-15 minutes if I'd written a standalone browser-context HTML page first, attached + detached a video, counted frames over time, and confirmed the throttling hypothesis. I'll have that "have I empirically verified the theory?" gate baked into recommendation logic going forward. This pairs with Session 1's "ffprobe-first" lesson at the fix-forward level.

## What we'll do next session (in plain terms)

Next session is **P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`** — empirical instrumentation pass before any more structural fixes ship. Estimated 30-60 min in-Claude.

The goal: identify exactly which layer of the screen-recording pipeline drops the rate from your intended 30 fps to the observed 6-7 fps. There are four candidate layers:

1. **The browser's getDisplayMedia source** — when we ask Chrome for a screen-share stream at 30 fps, does it actually give us 30 fps, or does it silently downgrade to 6-7? `track.getSettings().frameRate` will tell us.
2. **The hidden `<video>` element** — even with today's FF-1 attaching it to the DOM, Chrome may still throttle hidden videos to save battery. We need to count actual VideoFrames coming OUT of the video element.
3. **The canvas-crop pipeline** — we call `canvas.captureStream(30)` to tell the canvas to broadcast at 30 fps, but if the requestAnimationFrame loop driving the canvas is slower than 30 Hz, the output won't be 30 fps regardless of what we asked for.
4. **The MediaRecorder encoder** — even if its input is 30 fps, the encoder may drop frames if it can't sustain real-time encoding.

I'll add lightweight per-frame instrumentation to the extension content-script (probably feature-flagged or as a dev-only branch — you'll pick), you'll record a couple of new screen recordings with the instrumented build, and I'll read the logs to identify exactly which layer drops the rate. Then Session 4 will be a small targeted fix at the identified bottleneck layer.

Session 3 is diagnostic-only — same shape as Session 1. No `main` push planned; just an instrumentation branch + your recordings + log analysis + locking the Session 4 implementation scope.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-25 (P-48 Session 2 ✅ DEPLOYED-PARTIAL; W#2 polish queue grew by one mini-session today since Session 2 didn't fully close P-48):

- **P-48 Session 3 (Diagnostic #2) — NEXT.** ~30-60 min in-Claude. Empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck. No main push expected (pure diagnostic).
- **P-48 Session 4 (Implementation #2).** Conditional follow-up to Session 3. Scope depends on which layer Session 3 identifies as the bottleneck. Estimated 30-90 min in-Claude + Rule 9 deploy gate + director Phase-4 real-Chrome verification on a fresh recording.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 3's `npm test` + Check 5's `npm run build` — the prior P-43 template-hardening pass missed both). Not blocking any workstream; 7+ reproductions across sessions now.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Current two-captures workaround works fine. Has been the alternate candidate in recent end-of-session pickers; consistently not picked. Re-evaluate after P-48 + P-43 close — if still LOW + not blocking anything, you may just want to drop it.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete now that P-46 redesigned the surfaces. Re-evaluate after P-26.
- **W#2 graduation step.** ~1 session. Formal transition that closes W#2 and makes W#3 available. Requires all polish items DONE-AND-VERIFIED first.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for the next round of competition-scraping additions** per your verbatim 2026-05-24-f directive: *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."*
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`** (estimated ~30-60 min in-Claude: pre-build doc reads + branch state verify + read Session 2 outcome + design empirical instrumentation pass + Rule 14f picker on feature-flag vs dev-only branch + ship instrumentation + director records 1-2 NEW recordings with instrumented build + read logs + identify empirical bottleneck + lock Session 4 implementation scope + end-of-session doc-batch). Per Rule 23 Change Impact Audit: **DIAGNOSTIC SESSION** (per-frame instrumentation only; no production fixes). **Schema-change-in-flight flag stays NO**. **Rule 9 triggers planned this session: ZERO** (diagnostic-only; no main push expected, but if director picks "ship instrumentation feature-flagged to production for easier real-Chrome data collection" the Rule 9 picker would fire). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 2 (end-of-session doc-batch push + ff-merge to main for doc-batch — same as Session 1 pattern).

---

## Status of last session

**W#2 polish P-48 Session 2 (Implementation + Fix-Forward #1 BUSTED) ✅ DEPLOYED-PARTIAL 2026-05-25 on vklf.com via `workflow-2-competition-scraping` → `main`** — BUILD + DEPLOY + FIX-FORWARD session executing the (a.90) RECOMMENDED-NEXT protocol drafted at end of Session 1.

**Session shape (BUILD + DEPLOY + FIX-FORWARD — TWO Rule 9 gates fired; TWO build commits landed; ONE Rule 14f forced-picker fired):**

- Pre-build reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-48 revised + COMPETITION_SCRAPING_DESIGN §B 2026-05-25 Session 1 + CORRECTIONS_LOG §Entry 2026-05-25 Session 1 + `record-controller.ts` + `record-controller.test.ts`).
- Branch state verify — `workflow-2-competition-scraping` even at prior session's doc-batch SHA.
- Rule 14f session-start confirmation — NO picker fired (launch-prompt task was the recommended default + director directive matched).
- Step 1 — `cd extensions/competition-scraping && npm install fix-webm-duration` → new dep landed in extension `package.json` + `package-lock.json`.
- Step 2 — edit `record-controller.ts` to wire `RecordControllerDeps.fixWebmDuration` optional dep + `createProductionDeps` wiring + `emitStoppedOnce` async + try/catch fallback (~40 LOC changed).
- Step 3 — extend `record-controller.test.ts` with 4 new node:test cases covering DI-seam happy/error/missing-dep paths (test count 558 → 562).
- Step 4 — pre-deploy /scoreboard 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / 562 ext +4 / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27.
- Step 5 — Rule 9 gate #1 fired; director picked "Deploy now — Recommended"; ff-merge `a486af8..279da34` to main + push; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-25-w2-deploy-35.zip` (207.03 KB) at repo root; ping-pong #1 to workflow-2 branch.
- Step 6 — Phase-4 director real-Chrome verification: sideload new zip + record NEW recording + load on vklf.com → seek bar PASS (real "0:22" duration) + stutter FAIL (visible stutters persist).
- Step 7 — post-deploy diagnostic: ffprobe on pre-fix + post-fix samples → empirical 6.21-6.79 fps across all files → root cause for stutter sub-symptom locked as low-fps source files, NOT missing duration metadata.
- Step 8 — fix-forward #1 attempt: edit `productionCropStreamToRegion` to attach hidden video element to DOM with hidden-positioning styling (theory: Chrome throttles detached videos to ~6-7 fps); 1 file +25/-2; /scoreboard 5/5 GREEN at unchanged baselines; Rule 9 gate #2 fired; director picked "Deploy now — Recommended"; ff-merge `279da34..d8b9507` to main + push; Vercel auto-redeploy; fresh zip `plos-extension-2026-05-25-w2-deploy-36-ff1.zip` (207.09 KB); ping-pong #2.
- Step 9 — director re-recorded post-FF-1 + ffprobe: 8.52 fps; within noise; FF-1 theory empirically BUSTED.
- Step 10 — Rule 14f forced-picker fired (deferred-vs-iterate): picker offered (A) Defer to P-48 Session 3 (Recommended) / (B) one more empirical fix attempt / (C) roll back FF-1 + defer; director picked (A); FF-1 commit STAYS in production as calibration data point.
- Step 11 — Platform column false-alarm: Claude reported missing Platform column as regression; director clarified it was actually present; task deleted (not a real bug).
- Step 12 — delete throwaway `scripts/p48-s2-probe-new.mjs` (Session 1 housekeeping convention).
- End-of-session §4 Step 1c next-session-scope picker — NOT FIRED (next-session task unambiguous per (a.91) = P-48 Session 3 Diagnostic #2; locked by today's Rule 14f deferred-vs-iterate outcome).
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-25 Session 2 + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-25 Session 2 append).
- SIX pushes total per `feedback_approval_scope_per_decision_unit.md`: Deploy push #1 (Rule 9 gate #1) DONE + ping-pong #1 DONE + Deploy push #2 (Rule 9 gate #2) DONE + ping-pong #2 DONE + end-of-session doc-batch push + end-of-session ff-merge + push for doc-batch (the last two operationally adjacent; do NOT re-invoke Rule 9).

**ONE Rule 14f forced-picker FIRED** at the deferred-vs-iterate decision point — picker offered (A) Defer to P-48 Session 3 (Recommended) / (B) one more empirical fix attempt / (C) roll back FF-1 + defer; director picked (A).

**TWO Rule 9 deploy gates fired** — Gate #1 (build commit `279da34`) + Gate #2 (FF-1 `d8b9507`); both director-Yes per `feedback_recommendation_style.md` recommended path.

**ZERO DEFERRED items at session end (Rule 26)** — 13 tasks created this session; all 12 active tasks COMPLETED at session end + 1 task (#11 Platform column diagnosis) DELETED after director clarified there was no regression; Session 3 task IS the next-session task per (a.91), not a Claude-defer.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-25 (Session 2)** — the P-48 Session 2 Implementation + FF-1 Busted closing §Entry capturing 5 sub-observations: (a) calibration data point — symptom-level polish items can produce PARTIAL Phase-4 PASSES when symptom has multiple causes; (b) NEW reusable Pattern "Speculative fix-forward without empirical pre-verification = antipattern (reinforcement of Session 1's ffprobe-first Pattern at the fix-forward level)"; (c) MEDIUM informational — empirical 6-7 fps source-file finding; (d) calibration data point — session budget overrun (~2-3 hours actual vs 30-45 min budgeted); (e) operational housekeeping — one throwaway diagnostic script deleted at session end.

**New baseline locked from this session:** extension `npm test` = **562/562** (+4 from baseline 558).

**THIRTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-48 Session 3 (Diagnostic #2) begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` exactly even with `origin/main` at today's end-of-session doc-batch commit (both branches end the session at the same SHA after the ping-pong pattern — both deploy pushes have already done their main + ping-pong cycles; the doc-batch ff-merge to main lands the docs equally on both branches). Verify with `git log main..HEAD --oneline` showing 0 commits ahead. Session 2 landed TWO build commits on main today (`279da34` build + `d8b9507` FF-1); Session 3 starts from `d8b9507` as the baseline.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`.** Closes **(a.91) RECOMMENDED-NEXT**. Pure diagnostic session — empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck across the 4 candidate layers (getDisplayMedia source / hidden video element throttling / canvas.captureStream / MediaRecorder encoder). NO production fixes this session; output is empirical diagnosis + locked Session 4 implementation scope.

DIAGNOSTIC session — ZERO Rule 9 gates planned. NO main push for code expected. ONE end-of-session doc-batch push + ONE doc-batch ff-merge push to main (operationally adjacent; does NOT invoke Rule 9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 0 commits ahead.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or build mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **REVISED P-48 polish-backlog entry** (status ✅ DEPLOYED-PARTIAL 2026-05-25 (Sessions 1 + 2 done; seek bar fixed; stutter NOT resolved); WHY paragraph with the empirical 6-7 fps source-file finding + FF-1 BUSTED narrative; Fix scope with Session 3 OPEN scope locked = empirical instrumentation pass).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Session 2) — today's Session 2 implementation + Phase-4 PARTIAL + FF-1 BUSTED entry + NEW reusable Pattern memorialization + empirical 6-7 fps finding + locked Session 3 path.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Session 1) — yesterday's Session 1 Diagnostic entry; "ffprobe-first" Pattern (today's Session 2 Pattern is its fix-forward-level pairing).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Session 2) — today's Session 2 closing entry with 5 sub-observations including the NEW reusable Pattern "Speculative fix-forward without empirical pre-verification = antipattern".
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Session 1) — yesterday's Session 1 Diagnostic closing entry; the "ffprobe-first" Pattern reference.
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (the file Session 3 will instrument — note Session 2's `fix-webm-duration` patch + FF-1's `productionCropStreamToRegion` DOM-attachment both live here now).
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.test.ts` (current test count baseline **562**; if Session 3 adds new instrumentation that's unit-testable, extend with new node:test cases).
- The relevant test infrastructure for adding instrumentation tests — `extensions/competition-scraping/src/lib/screen-recording/` directory for the broader context.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy push gate — likely NOT fired this session) + Rule 14f (forced-picker mechanics — likely 1-2 will fire on instrumentation scope + ship strategy) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — DIAGNOSTIC) + Rule 24 (search before capturing new items) + Rule 25 (Multi-Workflow — workflow-2 only) + Rule 26 (DEFERRED items registry — ZERO standing carry-overs at session entry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable — Session 3 IS the most-thorough path because the FF-1 BUSTED outcome demonstrated empirically that speculative fix-forwards without pre-verification are antipatterns).
- `feedback_approval_scope_per_decision_unit.md` (2-push diagnostic-session pattern: doc-batch push + doc-batch ff-merge push).
- `feedback_default_to_recommendation.md` (most picker choices today should default to recommended unless director shifts).

**Task shape (P-48 Session 3 — Diagnostic #2):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or build mechanics. Cover: what we'll do (pre-build reads + branch state verify + design empirical instrumentation pass + Rule 14f picker on feature-flag vs dev-only branch + ship instrumentation + director records 1-2 NEW recordings with instrumented build + read logs + identify empirical bottleneck + lock Session 4 implementation scope + end-of-session doc-batch); schema-change-in-flight flag stays NO; ZERO Rule 9 gates planned; 2 pushes planned total.

2. **Pre-build reads** — execute the pre-build read list above. ~5 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits ahead — both branches at same SHA from prior session's ping-pong + doc-batch ff-merge).

4. **Rule 14f session-start confirmation** — likely no picker fires (diagnostic task is the recommended default per (a.91); director directive matches). If director has additional context on the stutter symptoms surfaced between sessions (e.g., they ran the post-Session-2 walkthrough and noticed something new), fire clarifying picker on whether Session 3 still focuses on framerate diagnosis OR pivots to a new contributor.

5. **Design the empirical instrumentation pass.** Likely scope: a small content-script logging helper that records (a) `track.getSettings()` from the getDisplayMedia source — captures actual frameRate the OS gave us; (b) per-VideoFrame count over time at source vs after canvas-crop using `MediaStreamTrackProcessor` if available (Chromium has this; Firefox doesn't but PLOS only targets Chrome); (c) MediaRecorder `ondataavailable` chunk timing — how often chunks arrive + how big each chunk is. Likely ~50-100 LOC added to `record-controller.ts` behind a runtime flag (e.g., `process.env.PLOS_DEBUG_RECORD_FRAMES === '1'` or a global window variable settable from the extension popup). Log destination: console.log (simplest; director can copy from DevTools console) OR to a Blob the extension can dump to disk. Director picks scope + log destination.

6. **Fire Rule 14f picker on ship strategy.** Offer (A) Feature-flag in production behind a hidden toggle (default OFF; director enables in DevTools console; instrumentation lives in production code but inert unless flagged); (B) Dev-only branch (instrumentation lives only on `workflow-2-competition-scraping`; never ships to `main`); (C) Local-only via dev sideload (build a one-off debug zip that bypasses the publish step). Each has tradeoffs; (B) is the most-thorough/reliable default since it doesn't pollute production at all but requires director to sideload a separate dev build.

7. **Ship the instrumentation** per the picker outcome. Build commit on workflow-2 (if A or B); no main push (since diagnostic-only). /scoreboard pre-build to confirm baselines; /scoreboard post-instrument to confirm tests still 562/562 GREEN.

8. **Director records 1-2 NEW recordings with the instrumented build** — sideload the new zip + start a screen recording on any platform + let it run ~10-15 seconds + stop the recording. Open Chrome DevTools console + copy the instrumentation logs.

9. **Read logs + identify empirical bottleneck.** Tabulate the per-layer frame counts. Look for the layer where the rate drops from the requested 30 to the observed 6-7. Hypothesis test order: (i) getDisplayMedia source — is `track.getSettings().frameRate` actually 30, or is it 6-7 already at source? (ii) hidden video element — what's the VideoFrame count from the video.captureStream over a 10s window? (iii) canvas captureStream — how often does the requestAnimationFrame loop fire + how many of those frames make it to the canvas captureStream? (iv) MediaRecorder encoder — how often does ondataavailable fire + is each chunk a full ~33ms of frames or less?

10. **Lock Session 4 implementation scope.** Once the empirical bottleneck is identified, write up the locked Session 4 fix path in the ROADMAP P-48 entry + COMPETITION_SCRAPING_DESIGN.md §B entry. Likely fix shapes by layer: (i) source — pass explicit `frameRate: { ideal: 30, min: 24 }` constraint to getDisplayMedia OR query/log to user that their OS isn't allowing 30 fps; (ii) hidden video — try Firefox-style polyfill OR more aggressive DOM attachment; (iii) canvas — switch from requestAnimationFrame-driven canvas drawing to MediaStreamTrackProcessor-based pull (more efficient); (iv) MediaRecorder — tune `videoBitsPerSecond` + `videoKeyFrameIntervalCount` to give the encoder more headroom.

11. **End-of-session doc-batch** covers ROADMAP (header bump + P-48 status flip if Session 3 locks Session 4 scope OR stays at ✅ DEPLOYED-PARTIAL if Session 3 didn't reach a conclusion; (a.91) closes + new (a.92) opens for whichever next-task — likely P-48 Session 4 Implementation #2) + CHAT_REGISTRY (header bump — 157th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry capturing the diagnostic + locked Session 4 scope) + NEXT_SESSION (rewritten for whichever next-next task per Session 3's outcome) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-25 → §B 2026-05-26 (next session-letter) for the Session 3 diagnostic findings entry.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (no `prisma db push`; pure extension instrumentation).

---

## Pre-session notes (offline steps for director between sessions)

**Optional (NOT required for Session 3):** if you want to re-confirm the seek-bar fix from Session 2 is still working end-to-end, open Chrome → vklf.com → any Project with a Competition Data URL with a saved screen recording made AFTER today's Session 2 deploy (the one made post-build commit `279da34` and before FF-1 commit `d8b9507`, or the one made after FF-1) → load the URL detail page → check that the seek bar shows a real total duration like "0:22" and NOT "∞" / "Live" / "-:--". This is a quick 30-second check; not required for Session 3.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-48 Session 3 diagnostic session at all — can happen any time. Director-independent.

The Network Panel walkthrough from Session 1's NEXT_SESSION.md is no longer required since Session 2 confirmed the seek-bar fix end-to-end + Session 3's diagnosis path is empirical instrumentation in code, not browser-DevTools observation. Available for reference if director wants to run it but NOT REQUIRED.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Pure diagnostic + instrumentation session.

**Rule 9 triggers planned this session: ZERO** — no main push expected. If Session 3 picker outcome is (A) Feature-flag in production, a Rule 9 picker WOULD fire to push the instrumentation behind the flag to main; but that's diagnostic-only code (inert unless flagged ON), and would be a single deploy push.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build mechanics.

---

## Why this pointer was written this way (debug aid)

Today's Session 2 shipped what Session 1 had locked as the fix path (`fix-webm-duration` patch) end-to-end and director-verified the seek-bar layer. BUT Phase-4 surfaced that the stutter persists, and empirical post-deploy ffprobe revealed the actual root cause of the stutter is a SEPARATE problem: every SCREEN_RECORDING webm file is captured at ~6-7 fps actual rate, not 30 fps. A speculative fix-forward (DOM-attachment theory) shipped under Rule 9 gate #2 but was empirically BUSTED — refining Session 1's "ffprobe-first" Pattern lesson at the fix-forward level into a NEW Pattern memorialization: **"Speculative fix-forward without empirical pre-verification = antipattern."**

The natural next-session task per (a.91) RECOMMENDED-NEXT is **P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`** — empirical instrumentation pass BEFORE any more structural fixes ship, applying the new Pattern. The shape mirrors Session 1 (diagnostic-only; no main push; ~30-60 min in-Claude; output is empirical diagnosis + locked Session 4 implementation scope).

- **(Recommended)** P-48 Session 3 (Diagnostic #2) — empirical instrumentation across 4 candidate bottleneck layers (getDisplayMedia source / hidden video element throttling / canvas.captureStream / MediaRecorder encoder); identify exactly which layer drops the rate from requested 30 to observed 6-7; lock Session 4 implementation scope. Recommended because (a) today's FF-1 BUSTED outcome empirically demonstrated that speculative fix-forwards without empirical pre-verification are antipatterns; (b) Session 1's "ffprobe-first" Pattern naturally extends to "instrumentation-first" for in-pipeline diagnostics; (c) small + scoped + reversible + same workstream as Sessions 1-2; (d) director-Phase-4 cost is minimal (1-2 short recordings + log copy-paste, not the full sideload + record + load + visual-verify cycle).

The shape of the P-48 Session 3 diagnostic session is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation + design empirical instrumentation pass + Rule 14f picker on ship strategy (feature-flag vs dev-only branch vs local-only) + ship instrumentation + director records 1-2 NEW recordings with instrumented build + read logs + identify empirical bottleneck + lock Session 4 implementation scope + end-of-session doc-batch + 2 pushes**.

**After P-48 Session 3 locks Session 4 scope,** the next-next sessions step through P-48 Session 4 (Implementation #2) → P-43 mechanical prevention small fix → P-26 below-fold scroll evaluation → P-27 re-evaluation → W#2 graduation step → THEN STOP AND EXPLICITLY ASK director for next round of competition-scraping additions per director's verbatim 2026-05-24-f directive.

**Alternate next-session candidates if director shifts priorities at session start:**

- **Skip Session 3 diagnostic + go directly to P-48 Session 4 implementation with another speculative theory.** NOT recommended — today's FF-1 BUSTED outcome empirically demonstrated that speculative fix-forwards without pre-verification are antipatterns. Session 3's instrumentation pass is the most-thorough/reliable path.
- **Skip P-48 entirely + go directly to P-43 mechanical prevention.** NOT recommended — P-48 is the first item in director's locked 2026-05-24-f sequence; P-43 comes after P-48 closes (which it hasn't — only Sessions 1-2 done with PARTIAL outcome).
- **P-26 below-fold scroll capture evaluation.** NOT recommended this session — P-26 is the LOW alternate that comes AFTER P-43. May get dropped after re-evaluation.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended this session — likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step.** NOT recommended UNTIL all polish items DONE-AND-VERIFIED. Currently P-48 stutter sub-symptom + P-43 + P-26 + P-27 left.
- **Roll back FF-1 commit `d8b9507`.** NOT recommended — director explicitly picked Option (A) "leave FF-1 in production as calibration data point" at today's Rule 14f deferred-vs-iterate picker. Re-litigating that choice would be against `feedback_default_to_recommendation.md`.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the REVISED P-48 polish-backlog entry for the binding Session 3 scope-and-where description. Check `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Session 2) — today's Session 2 entry — for the canonical record of the Session 2 implementation + Phase-4 PARTIAL + FF-1 BUSTED lifecycle and the locked Session 3 fix path. Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Session 2) — today's closing §Entry — for the NEW reusable Pattern memorialization + 5 sub-observations.
