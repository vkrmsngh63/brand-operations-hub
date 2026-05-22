# Next session

**Written:** 2026-05-22-g (`session_2026-05-22-g_p43-absolute-paths-scoreboard-deploy-ship-polish-item` — end-of-session handoff after **W#2 polish P-43 ✅ DONE-AND-VERIFIED 2026-05-22-g on `workflow-2-competition-scraping`** via build commit `4afea35` (3 files changed +20/-20). This session was a **polish-detour ahead of P-45 Build #2's deploy session** — director directive at session start ("please defer any testing in this session and work on the next item that does not require you to walk me through any real world testing steps") forced a pivot from the previously-planned P-45 Build #2 DEPLOY session to a smaller polish item that didn't require any director walkthrough. The detour closed the FOUR-reproduction `.claude/commands/scoreboard.md` parallel-Bash CWD-leak class by rewriting every relative `cd extensions/competition-scraping && ...` invocation across `.claude/commands/scoreboard.md` + `.claude/commands/deploy.md` + `.claude/commands/ship-polish-item.md` as absolute `cd /workspaces/brand-operations-hub/extensions/competition-scraping && ...`; every `$(find src/lib -name '*.test.ts')` rewritten as `$(find /workspaces/brand-operations-hub/src/lib -name '*.test.ts')`; baselines refreshed across all three templates from stale 2026-05-19-g values to current 2026-05-22-g values. Scope expansion beyond the ROADMAP entry's narrow scoreboard.md-only fix shape per the entry's same-session commentary recommending extension to ALL `.claude/commands/` templates — three files + baseline refresh is the most-thorough fix per Rule 14f Default-to-recommendation. Most-thorough verification ran fixed Checks 1, 3, 4 from `/tmp` (an arbitrary non-repo-root cwd — the precise scenario all four prior P-43 reproductions hit) — ALL GREEN at exact baselines proving the absolute-path discipline survives cwd drift. **Does NOT close (a.66) RECOMMENDED-NEXT** — (a.66) was P-45 Build #2, which remains deferred + unchanged in scope; this session was a polish-detour. **Opens (a.67) RECOMMENDED-NEXT = P-45 Build #2 (DEPLOY session — same 4-phase shape as (a.66))** on `workflow-2-competition-scraping`. Schema-change-in-flight flag **stays YES** independently of this session's scope — P-45 Build #1a's SCREEN_RECORDING enum is live on Supabase since 2026-05-22-d 14:09 UTC and undeployed on vklf.com until P-45 Build #2 ships. **PURE LOCAL INFRASTRUCTURE session paralleling yesterday's P-42 detour — no production code touched; no main push; no ff-merge; no Vercel redeploy; no fresh extension zip; no Rule 9 destructive-op gate fired.**

---

## What we did this session (in plain terms)

We fixed Claude's `/scoreboard`, `/deploy`, and `/ship-polish-item` slash-command templates so they stop tripping on a recurring "wrong-directory" bug. The bug had bitten four times across the last two weeks — sometimes it gave a wrong test count that looked plausible (so it was easy to miss), sometimes it loudly errored out, but every time the root cause was the same: the templates told Claude to type relative directory changes like `cd extensions/competition-scraping && ...`, and when Claude fires several of those in parallel from different starting directories, some end up in the wrong place. Today we rewrote every one of those to use the full absolute path `/workspaces/brand-operations-hub/extensions/competition-scraping`, did the same for the `find src/lib` line, and refreshed the expected baseline counts in each template (the old numbers — 53 routes, 536 src/lib tests, 428 extension tests, 79 Playwright — were three days stale; the current ones — 57, 590, 558, 94 — are now in the templates so future scoreboard runs catch real drift instead of pretending stale baselines are healthy). The next big session — the screen-recording deploy session that was paused today, same as yesterday — is now safer because the deploy template itself uses absolute paths so it can't accidentally produce a wrong-shell-cwd bug class during the deploy mechanics.

Three short observations worth flagging:

1. The fix scope expanded beyond what the ROADMAP entry literally said. The entry mentioned only `scoreboard.md`, but every prior reproduction's narrative recommended extending the fix to ALL `.claude/commands/` templates because the same parallel-Bash pattern lives in deploy.md and ship-polish-item.md too. The most-thorough fix took three files + a baseline refresh instead of one file — still under one hour, no new tests needed (the scoreboard run itself IS the verification).

2. The verification ran from `/tmp` to prove the fix is robust. Running the fixed slash-commands from a non-repo-root directory is the precise scenario all four prior bug reproductions hit — and the fixed templates all produced exact-baseline counts regardless of starting directory. That's the canonical verification pattern for this bug class: re-run from an arbitrary cwd and confirm the absolute-path discipline survives cwd drift.

3. I caught my own demonstration of the pre-fix bug class while writing the verification. When typing the verification command, I momentarily dropped the absolute `cd` prefix from one of the checks and was briefly surprised by an ENOENT error — which is itself a perfect demonstration of why slash-command templates need absolute paths: Claude (me, today) shortens or drops cd prefixes when typing commands inline, so the template needs to be defensively absolute so even verbatim reads produce the right result.

What we did NOT do: we did NOT deploy anything to vklf.com (deploy is the next session's job — same as it was supposed to be today and yesterday before each detour). We did NOT touch any production code. We did NOT push to main. We did NOT do the dev-time happy-path verification on Amazon (that's Phase 1 of next session). We hit ZERO procedural slips this session — the polish-detour ran cleanly per protocol from start to finish.

## What we'll do next session (in plain terms)

Next session is **P-45 Build #2 — the screen-recording deploy session** that was paused for two sessions now (yesterday for P-42, today for P-43). Four phases:

**Phase 1 — dev-time happy-path verify on Amazon (~30-60 min cooperative).** Sideload the dev-mode extension (`npm run dev` in `extensions/competition-scraping/` builds a hot-reload sideload — no fresh packaged zip needed for the verify; the zip comes during deploy in Phase 3). Open an Amazon product page with a hero video. Right-click on the page → see the new menu entry "Record video for PLOS" → click it → see the rectangle-draw overlay → draw a rectangle around the video → see Chrome's "Choose what to share" dialog pop up → pick the current tab → see the red dashed border + REC badge + countdown appear → click play on the Amazon video player → wait 5-10 seconds → click Stop on the floating toolbar → see the form open with the recording attached + preview playing inline → fill in metadata (project, platform, category, composition) → click Save → see the row land in Supabase with `sourceType='SCREEN_RECORDING'` → open the URL detail page on vklf.com → see the recording render inline via `<video controls>` exactly like a `DIRECT_BYTES` row does. If anything fails at any of these steps, we triage and fix-forward before deploy.

**Phase 2 — `/scoreboard` GREEN check before deploy.** All checks should be at exact baselines: root tsc clean / extension tsc clean / 57 routes / 590 src/lib / 558 ext / Playwright 94 (unchanged — the new wiring exercises a `getDisplayMedia` permission prompt that Playwright headless Chromium can't satisfy at full fidelity; cross-platform Playwright deferred to Build #3 if useful). **Bonus this session:** the scoreboard template itself is now hardened against the CWD-leak class per P-43, so this run should be smoother than prior scoreboard runs in the same Build arc.

**Phase 3 — `/deploy` orchestration.** Rule 9 director-Yes gate fires once for `git push origin main`. Then `/deploy` orchestrates: ff-merge `workflow-2-competition-scraping` → `main` (the merge will carry Build #1a + Build #1b + Build #1b's doc-batch + P-42 fix + P-42 doc-batch + this session's P-43 fix + this doc-batch + Build #2's doc-batch all as a single fast-forward of 8-9 commits) → push origin/main → Vercel auto-redeploy fires → ping-pong sync brings `workflow-2-competition-scraping` back even with `main` → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8) → schema-change-in-flight flag flips to NO at this moment (SCREEN_RECORDING is now live on vklf.com).

**Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (not dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on **Amazon** (the bug class that motivated P-45 — should now save successfully via the recording path) + **Ebay** (also blob: URLs from Media Source Extensions — should also save via the recording path) + **Walmart** (already works via DIRECT_BYTES; recording path should also work as a fallback) + **Etsy** (already works via DIRECT_BYTES; recording path should also work as a fallback). If anything fails on any platform, we triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

**Possible Build #3 (CONDITIONAL).** If Phase 4 surfaces verification failures requiring code fixes, Build #3 ships those as a fix-forward + redeploy + re-verify session (mirrors the Build #7 → Build #8 fix-forward pattern). If Phase 4 passes clean across all 4 platforms, P-45 graduates with no Build #3 needed.

~2-3 hours total for Build #2. After Build #2, the screen-recording feature graduates (or, if Phase 4 surfaces failures, a small Build #3 fix-forward follows the pattern of Build #7 → Build #8).

## What's still left on the total roadmap (in plain terms)

Same list as the 2026-05-22-f NEXT_SESSION.md MINUS P-43 (now ✅ DONE):

- **P-45 screen recording (in flight — Build #1a + Build #1b complete; Build #2 next session — deploy + cross-platform real-Chrome walkthrough).** Possible Build #3 if Build #2's Phase 4 surfaces verification failures. Estimated 1-2 more sessions to full graduation. The schema-change-in-flight flag stays YES until Build #2 deploys.
- **P-46 W#2 Phase 2 — Competition Data page redesign + Comprehensive Competitor Analysis page + new Reviews capture + URL detail page restructure + vklf.com-side upload/edit/delete:** ~15-25 sessions across 5 workstreams. Deep design + 10 clarification questions DEFERRED to a dedicated W#2 Phase 2 design session AFTER P-45 ships. New `docs/COMPETITION_DATA_V2_DESIGN.md` to be created at that design session.
- **P-27 captured-videos polish leftovers** (Bug #11 input dead + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk) — DEFERRED + PARTIALLY OBSOLETED by P-45. Will reassess closure status after P-45 Build #2's Phase 4 walkthrough — if P-45 covers the user-visible surface for these scenarios, the bugs may be closed without explicit fixes; if P-45 doesn't fully cover them, they ship as low-priority polish after P-45.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reliable-now-not-intermittent (reproduced twice in Build #8). ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-45 Build #2 — screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

---

**For:** the next Claude Code session — P-45 Build #2 DEPLOY session (estimated ~2-3 hours: Phase 1 dev-time verify ~30-60 min cooperative + Phase 2 scoreboard ~5 min + Phase 3 deploy orchestration ~10-15 min + Phase 4 director cross-platform real-Chrome verify ~60-90 min cooperative). Per Rule 23 Change Impact Audit: **DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code + P-42 hook fix + P-43 slash-command template polish + the already-shipped 1a schema delta** (SCREEN_RECORDING enum value live on Supabase since 2026-05-22-d 14:09 UTC). No new dependencies. No data risk (no existing rows touched; the deploy makes the SCREEN_RECORDING enum value reachable from vklf.com routes that already accept it server-side). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag flips NO** at the moment Build #2's `git push origin main` completes + Vercel auto-redeploy finishes (the production routes on vklf.com begin reading the new enum value). **Rule 9 triggers planned: ONE** — `git push origin main` for the deploy. Director-Yes gate fires via AskUserQuestion picker per the canonical `/deploy` orchestration. NO `git reset --hard` / `git push --force` / `git branch -D` planned.

---

## Status of today's session

**P-43 ✅ DONE-AND-VERIFIED 2026-05-22-g on `workflow-2-competition-scraping` — `.claude/commands/scoreboard.md` + `.claude/commands/deploy.md` + `.claude/commands/ship-polish-item.md` parallel-Bash CWD-leak fix + baseline refresh across all three templates.** One-hundred-and-thirty-third Claude Code session — `session_2026-05-22-g_p43-absolute-paths-scoreboard-deploy-ship-polish-item`. Polish-detour ahead of P-45 Build #2's deploy session per director directive at session start.

**Session shape (no deploy mechanics this session — pure local infrastructure, mirrors yesterday's P-42 detour):**

- Build commit `4afea35` landed on `workflow-2-competition-scraping` (3 files changed +20/-20 — all `.claude/commands/` slash-command template polish).
- NO main push — this is not a deploy session.
- NO ping-pong sync — main didn't move (stays at `a47a95f` from Build #8 deploy).
- NO Vercel redeploy — no code shipped to vklf.com.
- NO fresh extension zip — no extension source change this session.
- NO Rule 9 destructive-op gate fired (no destructive operations; only file edits to existing `.claude/commands/` templates).
- ONE end-of-session push planned (doc-batch + the build commit together to `origin/workflow-2-competition-scraping`).

**/scoreboard ran post-fix as verification of the fix itself** — Checks 1-5 all GREEN at exact baselines (root tsc clean / extension tsc clean / `npm run build` 57 routes / src/lib node:test 590/590 / extension `npm test` 558/558); Check 6 Playwright SKIPPED per non-deploy-session convention. Most-thorough verification: re-ran fixed Checks 1, 3, 4 from `/tmp` (the precise non-repo-root scenario all four prior P-43 reproductions hit) — ALL GREEN at exact baselines proving the absolute-path discipline survives cwd drift.

**Schema-change-in-flight flag stays YES** the entire session independently of this session's scope — SCREEN_RECORDING enum live on Supabase since 2026-05-22-d 14:09 UTC; flips to NO when Build #2 deploys the new enum live on vklf.com.

**§4 Step 1c forced-picker DID FIRE** — director directive at session start ("please defer any testing in this session and work on the next item that does not require you to walk me through any real world testing steps") forced a pivot from the previously-planned P-45 Build #2 DEPLOY session; AskUserQuestion picker between P-43 (recommended — sub-1-hour, recurring problem with 4 reproductions, internal `.claude/` tooling so verification IS the scoreboard run itself with no real-world walkthrough needed) vs. P-44 vs. "I have a question first." — director picked P-43 per `feedback_default_to_recommendation.md`.

**ZERO new DEFERRED items at session end (Rule 26)** — Tasks #1-#5 (the 4 P-45 Build #2 phases + verify) all marked DELETED with deferral notes pointing at the next session's binding task captured in this NEXT_SESSION.md (not orphan TaskList DEFERRED per Rule 26's intent + the 1a/1b/1f precedent for clearly-named cross-session binding inputs); Tasks #6-#10 (P-43 read + diagnose + code + verify + this end-of-session) all completed.

**ONE new CORRECTIONS_LOG §Entry this session — the P-43 CLOSING §Entry** (informational, not a slip-of-this-session; closes the four prior P-43 §Entries across 2026-05-20-c + 2026-05-21 + 2026-05-21-d + 2026-05-22 with empirical fix narrative + reusable Pattern for "how to harden a parallel-Bash slash-command template against CWD-leak"). TWO informational sub-observations captured within the §Entry's narrative (the backgrounded-`npm run build` 0-byte-output reproduction reinforcing the 2026-05-21 sub-observation, and Claude's own test-slip when writing the verification — momentarily dropping the absolute cd prefix from Check 3 — itself a perfect demonstration of the pre-fix bug class). No procedural slips this session.

**ELEVENTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9; eighth was 2026-05-22-d Build #1a; ninth was 2026-05-22-e Build #1b; tenth was 2026-05-22-f P-42). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-45 Build #2's dev-time verify + deploy lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`. `main` stays at `a47a95f` from Build #8 deploy (unchanged from this session since no Rule 9 main-push fired). After this session's end-of-session doc-batch + P-43 fix commit `4afea35` push lands, workflow-2 will be 8 commits ahead of main (Build #1a code + Build #1a doc-batch + Build #1b code + Build #1b doc-batch + P-42 fix code + P-42 doc-batch + this session's P-43 fix code + this doc-batch). Build #2's ff-merge to main will carry all 8 commits + Build #2's own doc-batch as a single fast-forward.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-45 Build #2 — screen-recording DEPLOY session, on `workflow-2-competition-scraping`.** Closes **(a.67) RECOMMENDED-NEXT**. This is the third Build session of the P-45 sub-feature (Build #1a foundation shipped 2026-05-22-d via `7e2eb2c`; Build #1b wiring shipped 2026-05-22-e via `80713ff`; P-42 pre-flight detour shipped 2026-05-22-f via `2e3270d`; P-43 polish-detour shipped 2026-05-22-g via `4afea35`; Build #2 deploys all to vklf.com).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-45 polish-backlog entry (with the 1a + 1b complete annotations + the schema-change-in-flight flag flipped to YES + the dev-time verify deferral to Build #2's Phase 1) + the P-42 + P-43 polish-backlog entries (now both ✅ DONE-AND-VERIFIED — the operational substrate hardened across two pre-flight sessions).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the BINDING implementation spec — 10 implementation-ready subsections; do NOT re-litigate per Rule 18 interview-cluster pattern; this is the spec Build #1a + 1b implemented) + new §B 2026-05-22-d + §B 2026-05-22-e entries (the Build #1a + Build #1b mid-build decisions).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (the destructive-op gate that fires once for `git push origin main`) + Rule 14f (forced-picker pattern — the deploy gate is a Rule 9 picker per the canonical `/deploy` orchestration) + Rule 18 (append-only design doc — §C is BINDING; §A frozen) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code + P-42 hook fix + P-43 slash-command template polish) + Rule 27 (Playwright forced-picker before manual walkthroughs — Phase 4 director real-Chrome walkthrough is per Rule 27 + §C.18's "manual walkthrough is the integration test" decision) + Rule 29 (Pre-destructive-container-operation audit — no container ops this session, but the 5-layer protective architecture from P-41 + P-42 is documented here) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `.claude/commands/deploy.md` (the canonical `/deploy` orchestration — pre-deploy scoreboard → Rule 9 gate → ff-merge → push → Vercel redeploy → ping-pong sync → fresh extension zip; **now hardened against CWD-leak per P-43** — every cd is absolute, baselines refreshed).
- `.claude/commands/scoreboard.md` (the `/scoreboard` slash command — also hardened against CWD-leak per P-43; you can run it from any cwd and the absolute-path discipline guarantees correct counts).
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

3. **Phase 2 — `/scoreboard` GREEN check before deploy** (all checks should be at exact baselines): root tsc clean / extension tsc clean / `npm run build` **57 routes** / src/lib node:test **590/590** / extension `npm test` **558/558** / Playwright **94/94**. Note: scoreboard template now hardened against CWD-leak per P-43; should run smoother than the in-flight Build arc's prior scoreboard runs.

4. **Phase 3 — `/deploy` orchestration** per `.claude/commands/deploy.md`: Rule 9 director-Yes gate fires once for `git push origin main` → ff-merge `workflow-2-competition-scraping` → `main` (carries 8-9 commits: Build #1a code + Build #1a doc-batch + Build #1b code + Build #1b doc-batch + P-42 fix code + P-42 doc-batch + P-43 fix code + this doc-batch + Build #2's own doc-batch landing later in session) → push origin/main → Vercel auto-redeploy fires (monitor at vklf.com or Vercel dashboard) → ping-pong sync (`git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping`) → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8). **Schema-change-in-flight flag flips NO** at this moment.

5. **Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (NOT dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on Amazon (the bug class motivating P-45 — should save successfully via recording path) + Ebay (also blob: URLs from MSE — should save via recording path) + Walmart (DIRECT_BYTES works; recording should also work as fallback) + Etsy (DIRECT_BYTES works; recording should also work as fallback). If failures surface, triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

6. **End-of-session doc-batch** covers ROADMAP (P-45 polish-backlog entry annotated with "✅ Build #2 deploy complete YYYY-MM-DD" + (a.67) flipped to closed + new (a.68) opened — likely P-45 Build #3 fix-forward OR the very next non-P-45 polish item like P-44 / P-26) + CHAT_REGISTRY (header bump — 134th Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for the next session) + CAPTURED_VIDEOS_DESIGN.md §B YYYY-MM-DD entry (Build #2 mid-deploy judgment calls per Rule 18 append-only + §C.20 ship checklist Phase 4 outcomes per platform) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (new "Deploy session #N — P-45 screen recording DEPLOYED + cross-platform verification" section appended before the END OF DOCUMENT marker — the canonical verification artifact for Build #2 covering deploy mechanics + 4-platform verification grid + any captured failures for Build #3).

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

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the implementation-ready deepening — the binding spec Build #1a + 1b implemented; informational for understanding the implementation scope) + new §B 2026-05-22-d + §B 2026-05-22-e entries (the Build #1a + Build #1b mid-build decisions). ~10-minute skim before the next session if director wants the full context.

**Pre-Phase-1 setup (informational — Claude will handle in-session):** the dev-mode extension sideload needs an Amazon product page with a hero video. Suggested URLs that have historically had working hero video players: search Amazon for popular electronics or beauty products. The dev mode runs hot-reload so any code change Claude makes mid-session reflects immediately on the page after a Chrome refresh.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ONE** — `git push origin main` for the deploy (Rule 9 picker fires here; director-Yes gate enforced via AskUserQuestion).

**Rule 9 triggers planned this session: ONE** — same as Rule 8, the `git push origin main` deploy. NO `prisma db push` planned (schema delta already shipped in 1a). NO `git reset --hard` / `git push --force` / `git branch -D` / `rm -rf` / SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary now active since yesterday's P-42 ship.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code work — the mirror should be healthy entering Build #2 because P-42 shipped 2026-05-22-f.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-43 as a polish-detour ahead of P-45 Build #2's deploy session. The detour was forced by director directive at session start ("please defer any testing in this session and work on the next item that does not require you to walk me through any real world testing steps"). P-45 Build #2 was the previously-planned task per the 2026-05-22-f pointer, but Build #2's Phase 1 + Phase 4 both require director cooperation (dev-time verify on Amazon ~30-60 min + cross-platform real-Chrome walkthrough ~60-90 min), so director's "defer testing" directive made Build #2 unworkable for today. The §4 Step 1c picker between P-43 vs. P-44 vs. "I have a question first." landed on P-43 because P-43 is a sub-1-hour polish, has 4 reproductions across ~2 weeks (each strengthening the case to ship soon), and is internal `.claude/` tooling so verification IS the scoreboard run itself with no real-world walkthrough needed. The detour cost ~1 session of detour but de-risks every subsequent scoreboard + deploy run by making the slash-command templates robust against the CWD-leak class.

The shape of P-45 Build #2's launch prompt is **identical to the 2026-05-22-f pointer's launch prompt** for the same task — the 4-phase shape (verify → scoreboard → deploy → cross-platform verify), the §C.11-§C.20 BINDING spec, the locked menu label **"Record video for PLOS"**, the one-Rule-9-this-session shape, and the schema-change-in-flight flag flipping NO at deploy completion are all unchanged. The only differences are: (a) this pointer is dated 2026-05-22-g and notes both P-42 + P-43 are now ✅ DONE so both the mechanical-backup substrate AND the slash-command-template substrate are hardened; (b) the ff-merge will carry 8-9 commits instead of 6-7.

The §C.11-§C.20 deepening is BINDING per Rule 18 — do NOT re-litigate at deploy time. Any Phase 4 verification failures get surfaced via Rule 14f forced-picker between (A) fix-forward in a new Build #3 session vs. (B) accept-as-known-issue + defer to a future polish session vs. (C) revert this deploy. Per the 2026-05-22 Build #8 precedent, fix-forward is the recommended option unless the failure class is fundamentally unfixable at the deploy level.

**Alternate next-session candidates if director shifts priorities at session start (after P-42 + P-43 + before Build #2):**

- **P-44 wxt-zip + wxt-build parent-process hang fix.** Reproduced twice in Build #8 — reliable-now-not-intermittent. Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session. Per-session overhead lowers if shipped before Build #2's Phase 3 fresh-zip step.
- **Defer P-45 Build #2 + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 / non-P-45 W#2 pre-graduation polish item. Estimated 1-2 sessions. Not recommended — P-45 Build #2 is the natural continuation of Build #1b's wiring; the deploy + cross-platform verify closes the P-45 implementation arc and shouldn't be left in flight.
- **Defer P-45 Build #2 + start P-46 W#2 Phase 2 design session.** ~15-25 sessions across 5 workstreams. Not recommended — the sequencing picker on 2026-05-22-c locked P-46 to start AFTER P-45 ships; jumping to P-46 now would leave the screen-recording wiring undeployed + force future P-45 work to be picked up cold.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
