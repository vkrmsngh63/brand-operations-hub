# Next session

**Written:** 2026-05-22-f (`session_2026-05-22-f_p42-backup-memory-dir-hook-fix` — end-of-session handoff after **W#2 polish P-42 ✅ DONE-AND-VERIFIED 2026-05-22-f on `workflow-2-competition-scraping`** via build commit `2e3270d` (4 files changed +178/-4). This session was a **strongly-recommended pre-flight detour** named explicitly in the 2026-05-22-e NEXT_SESSION.md alternates list ("HIGH severity; STRONGLY RECOMMENDED before any future big session"). The detour closed the THREE-reproduction `backup-memory-dir.sh` PostToolUse hook Layer-1 gap empirically by capturing the actual PostToolUse stdin JSON shape via temporary `/tmp/plos-hook-debug.log` instrumentation on a disposable memory-file Write — confirming Claude Code's PostToolUse hook stdin uses the field name `.tool_name` (NOT `.tool`); both `backup-memory-dir.sh` + the sibling `track-edited-docs.sh` were using `jq -r '.tool // empty'` and always exited without doing work; three P-42 reproductions across 2026-05-20-b, 2026-05-20-c, 2026-05-21 all stemmed from this single field-name mismatch. Fixes shipped: jq selector field-name fix in BOTH hooks (the sibling fix is scope-adjacent per Rule 24 — same bug class surfaced during diagnosis); NEW `.claude/hooks/check-memory-mirror-staleness.sh` SessionStart canary (~175 LOC) for **Layer-3b defense-in-depth** — compares source memory dir against `.codespace-backup/memory/` mirror at every session start + emits a staleness alert via `additionalContext` if file count / presence / per-file size diverges; `.claude/settings.json` wires the new canary into the SessionStart hooks array. Integration test post-fix confirmed both layers work end-to-end. **Does NOT close (a.65) RECOMMENDED-NEXT** — (a.65) was P-45 Build #2, which remains deferred + unchanged in scope; this session was a pre-flight detour. **Opens (a.66) RECOMMENDED-NEXT = P-45 Build #2 (DEPLOY session — same 4-phase shape as (a.65))** on `workflow-2-competition-scraping`. Schema-change-in-flight flag **stays YES** independently of this session's scope — P-45 Build #1a's SCREEN_RECORDING enum is live on Supabase since 2026-05-22-d 14:09 UTC and undeployed on vklf.com until P-45 Build #2 ships. **PURE LOCAL INFRASTRUCTURE session — no production code touched; no main push; no ff-merge; no Vercel redeploy; no fresh extension zip; no Rule 9 destructive-op gate fired.**

---

## What we did this session (in plain terms)

We fixed the auto-backup of Claude's persistent memory. For the past three sessions, the auto-backup had been silently broken — it was looking at the wrong field name in Claude Code's hook input, which made it exit early every time without doing any work. Today we ran a small diagnostic test that captured the actual input format, confirmed the bug was a one-word field-name mismatch, fixed it in two places (the auto-backup hook and the sister hook that tracks which documentation files get edited), and added a second safety check that compares the live memory directory against the disk-resident backup at every session start and raises an alarm if they diverge. The next big session — the screen-recording deploy session that was paused today — is now safer because Claude's memory will be reliably mirrored to disk on every memory write, and if drift ever happens again the new safety check will catch it immediately.

Three short observations worth flagging:

1. The diagnostic method we used is reusable. If any future Claude Code hook ever appears wired-but-silent, the one-step fix is: capture raw hook input to a known file path, trigger the hook once, inspect the actual JSON shape, and diff that against what the hook script is reading. That took us about 60 seconds today and saved us from guessing at root causes for hours.

2. The sister hook (`track-edited-docs.sh`) had the same bug. Its log file had been empty since May 20. The doc-batch agent at session-end has been working from manual reasoning about which docs got touched rather than reading that log — that worked, but post-fix the log is now load-bearing again.

3. The new Layer-3b safety check is pure defense-in-depth. It runs once per session start, takes about 100 ms, and emits no alert when source and mirror are in sync. If Layer 1 (the auto-backup hook) ever silently breaks again — for whatever reason — Layer 3b will catch the drift at the next session start and alert us BEFORE any reliance on the backup matters.

What we did NOT do: we did NOT deploy anything to vklf.com (deploy is the next session's job — same as it was supposed to be today before the detour). We did NOT touch any production code. We did NOT run a /scoreboard (no production code changed, so the scoreboard would have been performative). We did NOT push to main. We did NOT do the dev-time happy-path verification on Amazon (that's Phase 1 of next session). We hit ZERO protocol slips this session — the pre-flight detour ran cleanly per protocol from start to finish.

## What we'll do next session (in plain terms)

Next session is **P-45 Build #2 — the screen-recording deploy session** that was paused today for the pre-flight detour. Four phases:

**Phase 1 — dev-time happy-path verify on Amazon (~30-60 min cooperative).** Sideload the dev-mode extension (`npm run dev` in `extensions/competition-scraping/` builds a hot-reload sideload — no fresh packaged zip needed for the verify; the zip comes during deploy in Phase 3). Open an Amazon product page with a hero video. Right-click on the page → see the new menu entry "Record video for PLOS" → click it → see the rectangle-draw overlay → draw a rectangle around the video → see Chrome's "Choose what to share" dialog pop up → pick the current tab → see the red dashed border + REC badge + countdown appear → click play on the Amazon video player → wait 5-10 seconds → click Stop on the floating toolbar → see the form open with the recording attached + preview playing inline → fill in metadata (project, platform, category, composition) → click Save → see the row land in Supabase with `sourceType='SCREEN_RECORDING'` → open the URL detail page on vklf.com → see the recording render inline via `<video controls>` exactly like a `DIRECT_BYTES` row does. If anything fails at any of these steps, we triage and fix-forward before deploy.

**Phase 2 — `/scoreboard` GREEN check before deploy.** All checks should be at exact baselines: root tsc clean / extension tsc clean / 57 routes / 590 src/lib / 558 ext / Playwright 94 (unchanged — the new wiring exercises a `getDisplayMedia` permission prompt that Playwright headless Chromium can't satisfy at full fidelity; cross-platform Playwright deferred to Build #3 if useful).

**Phase 3 — `/deploy` orchestration.** Rule 9 director-Yes gate fires once for `git push origin main`. Then `/deploy` orchestrates: ff-merge `workflow-2-competition-scraping` → `main` (the merge will carry Build #1a + Build #1b + Build #1b's doc-batch + this session's P-42 fix + this doc-batch + Build #2's doc-batch all as a single fast-forward of 6-7 commits) → push origin/main → Vercel auto-redeploy fires → ping-pong sync brings `workflow-2-competition-scraping` back even with `main` → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8) → schema-change-in-flight flag flips to NO at this moment (SCREEN_RECORDING is now live on vklf.com).

**Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (not dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on **Amazon** (the bug class that motivated P-45 — should now save successfully via the recording path) + **Ebay** (also blob: URLs from Media Source Extensions — should also save via the recording path) + **Walmart** (already works via DIRECT_BYTES; recording path should also work as a fallback) + **Etsy** (already works via DIRECT_BYTES; recording path should also work as a fallback). If anything fails on any platform, we triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

**Possible Build #3 (CONDITIONAL).** If Phase 4 surfaces verification failures requiring code fixes, Build #3 ships those as a fix-forward + redeploy + re-verify session (mirrors the Build #7 → Build #8 fix-forward pattern). If Phase 4 passes clean across all 4 platforms, P-45 graduates with no Build #3 needed.

~2-3 hours total for Build #2. After Build #2, the screen-recording feature graduates (or, if Phase 4 surfaces failures, a small Build #3 fix-forward follows the pattern of Build #7 → Build #8).

## What's still left on the total roadmap (in plain terms)

Same list as the 2026-05-22-e NEXT_SESSION.md MINUS P-42 (now ✅ DONE):

- **P-45 screen recording (in flight — Build #1a + Build #1b complete; Build #2 next session — deploy + cross-platform real-Chrome walkthrough).** Possible Build #3 if Build #2's Phase 4 surfaces verification failures. Estimated 1-2 more sessions to full graduation. The schema-change-in-flight flag stays YES until Build #2 deploys.
- **P-46 W#2 Phase 2 — Competition Data page redesign + Comprehensive Competitor Analysis page + new Reviews capture + URL detail page restructure + vklf.com-side upload/edit/delete:** ~15-25 sessions across 5 workstreams. Deep design + 10 clarification questions DEFERRED to a dedicated W#2 Phase 2 design session AFTER P-45 ships. New `docs/COMPETITION_DATA_V2_DESIGN.md` to be created at that design session.
- **P-27 captured-videos polish leftovers** (Bug #11 input dead + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk) — DEFERRED + PARTIALLY OBSOLETED by P-45. Will reassess closure status after P-45 Build #2's Phase 4 walkthrough — if P-45 covers the user-visible surface for these scenarios, the bugs may be closed without explicit fixes; if P-45 doesn't fully cover them, they ship as low-priority polish after P-45.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-43 scoreboard absolute-paths polish** — still OPEN; sub-1-hour polish; recurring CWD-leak class keeps biting.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reliable-now-not-intermittent (reproduced twice in Build #8). ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-45 Build #2 — screen-recorded webm files are typically smaller than directly-captured mp4 files at the same resolution + duration (VP9 is more efficient than h.264), so the 100 MB cap is even less likely to bite for P-45 than it was for DIRECT_BYTES rows.

---

**For:** the next Claude Code session — P-45 Build #2 DEPLOY session (estimated ~2-3 hours: Phase 1 dev-time verify ~30-60 min cooperative + Phase 2 scoreboard ~5 min + Phase 3 deploy orchestration ~10-15 min + Phase 4 director cross-platform real-Chrome verify ~60-90 min cooperative). Per Rule 23 Change Impact Audit: **DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code + P-42 hook fix + the already-shipped 1a schema delta** (SCREEN_RECORDING enum value live on Supabase since 2026-05-22-d 14:09 UTC). No new dependencies. No data risk (no existing rows touched; the deploy makes the SCREEN_RECORDING enum value reachable from vklf.com routes that already accept it server-side). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag flips NO** at the moment Build #2's `git push origin main` completes + Vercel auto-redeploy finishes (the production routes on vklf.com begin reading the new enum value). **Rule 9 triggers planned: ONE** — `git push origin main` for the deploy. Director-Yes gate fires via AskUserQuestion picker per the canonical `/deploy` orchestration. NO `git reset --hard` / `git push --force` / `git branch -D` planned.

---

## Status of today's session

**P-42 ✅ DONE-AND-VERIFIED 2026-05-22-f on `workflow-2-competition-scraping` — `backup-memory-dir.sh` PostToolUse hook field-name fix + sibling `track-edited-docs.sh` fix + NEW Layer-3b mirror-staleness SessionStart canary.** One-hundred-and-thirty-second Claude Code session — `session_2026-05-22-f_p42-backup-memory-dir-hook-fix`. Strongly-recommended pre-flight detour ahead of P-45 Build #2's deploy session.

**Session shape (no deploy mechanics this session — pure local infrastructure):**

- Build commit `2e3270d` landed on `workflow-2-competition-scraping` (4 files changed +178/-4 — all `.claude/` infrastructure).
- NO main push — this is not a deploy session.
- NO ping-pong sync — main didn't move (stays at `a47a95f` from Build #8 deploy).
- NO Vercel redeploy — no code shipped to vklf.com.
- NO fresh extension zip — no extension source change this session.
- NO Rule 9 destructive-op gate fired (no destructive operations; only hook + settings edits + a NEW hook file + cleaned-up disposable test files).
- ONE end-of-session push planned (doc-batch + the build commit together to `origin/workflow-2-competition-scraping`).

**No /scoreboard run this session** — pure local infrastructure session; no production code touched; no scoreboard required (documented as a process-justified skip, not a slip). The /scoreboard would have reported exact-same numbers as Build #1b's end-of-session baseline: 57 routes / 590 src/lib / 558 ext / Playwright skipped.

**Schema-change-in-flight flag stays YES** the entire session independently of this session's scope — SCREEN_RECORDING enum live on Supabase since 2026-05-22-d 14:09 UTC; flips to NO when Build #2 deploys the new enum live on vklf.com.

**§4 Step 1c forced-picker DID NOT FIRE** — the (a.66) re-open of P-45 Build #2 is the natural continuation already established by the 2026-05-22-e pointer; this session merely satisfies the "STRONGLY RECOMMENDED" prerequisite from that pointer's alternates list.

**ZERO new DEFERRED items at session end (Rule 26)** — Tasks #1-#4 (the 4 P-45 Build #2 phases) all marked DELETED with deferral notes pointing at the next session's binding task captured in this NEXT_SESSION.md (not orphan TaskList DEFERRED per Rule 26's intent + the 1a precedent for clearly-named cross-session binding inputs); Tasks #5-#7 (P-42 diagnose + fix + canary) all completed; Task #8 (this end-of-session) in_progress.

**ONE new CORRECTIONS_LOG §Entry this session — the closing §Entry for P-42** (informational, not a slip-of-this-session; closes the three prior P-42 §Entries with empirical root-cause confirmation + the reusable Pattern for "how to debug a silent PostToolUse hook"). THREE inline informational observations captured within the §Entry's narrative (empirical-instrumentation Pattern / sibling-hook shared-bug per Rule 24 / Layer-3b canary as defense-in-depth). No procedural slips this session.

**TENTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9; eighth was 2026-05-22-d Build #1a; ninth was 2026-05-22-e Build #1b). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-45 Build #2's dev-time verify + deploy lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping`. `main` stays at `a47a95f` from Build #8 deploy (unchanged from this session since no Rule 9 main-push fired). After this session's end-of-session doc-batch + P-42 fix commit `2e3270d` push lands, workflow-2 will be 6 commits ahead of main (Build #1a code + Build #1a doc-batch + Build #1b code + Build #1b doc-batch + this session's P-42 fix code + this doc-batch). Build #2's ff-merge to main will carry all 6 commits + Build #2's own doc-batch as a single fast-forward.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-45 Build #2 — screen-recording DEPLOY session, on `workflow-2-competition-scraping`.** Closes **(a.66) RECOMMENDED-NEXT**. This is the third Build session of the P-45 sub-feature (Build #1a foundation shipped 2026-05-22-d via `7e2eb2c`; Build #1b wiring shipped 2026-05-22-e via `80713ff`; P-42 pre-flight detour shipped 2026-05-22-f via `2e3270d`; Build #2 deploys all to vklf.com).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-45 polish-backlog entry (with the 1a + 1b complete annotations + the schema-change-in-flight flag flipped to YES + the dev-time verify deferral to Build #2's Phase 1) + the P-42 polish-backlog entry (now ✅ DONE-AND-VERIFIED — Layer-1 hook now actually fires + Layer-3b canary in place).
- `docs/CAPTURED_VIDEOS_DESIGN.md` §C.11-§C.20 (the BINDING implementation spec — 10 implementation-ready subsections; do NOT re-litigate per Rule 18 interview-cluster pattern; this is the spec Build #1a + 1b implemented) + new §B 2026-05-22-d + §B 2026-05-22-e entries (the Build #1a + Build #1b mid-build decisions).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (the destructive-op gate that fires once for `git push origin main`) + Rule 14f (forced-picker pattern — the deploy gate is a Rule 9 picker per the canonical `/deploy` orchestration) + Rule 18 (append-only design doc — §C is BINDING; §A frozen) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DEPLOY of pre-classified ADDITIVE Build #1a + Build #1b code + P-42 hook fix) + Rule 27 (Playwright forced-picker before manual walkthroughs — Phase 4 director real-Chrome walkthrough is per Rule 27 + §C.18's "manual walkthrough is the integration test" decision) + Rule 29 (Pre-destructive-container-operation audit — no container ops this session, but the 5-layer protective architecture this session extended is documented here) + Rule 30 (Session bookends) + §4 Step 4b extended template.
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

4. **Phase 3 — `/deploy` orchestration** per `.claude/commands/deploy.md`: Rule 9 director-Yes gate fires once for `git push origin main` → ff-merge `workflow-2-competition-scraping` → `main` (carries 6-7 commits: Build #1a code + Build #1a doc-batch + Build #1b code + Build #1b doc-batch + P-42 fix code + this doc-batch + Build #2's own doc-batch landing later in session) → push origin/main → Vercel auto-redeploy fires (monitor at vklf.com or Vercel dashboard) → ping-pong sync (`git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping`) → fresh extension zip `plos-extension-2026-05-23-w2-deploy-N.zip` (next N value in the running sequence; current sequence ends at deploy-32 from Build #8). **Schema-change-in-flight flag flips NO** at this moment.

5. **Phase 4 — director real-Chrome cross-platform verify (~60-90 min cooperative).** Load the fresh zip in real Chrome (NOT dev mode this time — production-build behavior). Walk the full record → form → save → URL-detail-page playback cycle on Amazon (the bug class motivating P-45 — should save successfully via recording path) + Ebay (also blob: URLs from MSE — should save via recording path) + Walmart (DIRECT_BYTES works; recording should also work as fallback) + Etsy (DIRECT_BYTES works; recording should also work as fallback). If failures surface, triage in-session or defer to a fix-forward Build #3 per the 2026-05-22 Build #8 precedent.

6. **End-of-session doc-batch** covers ROADMAP (P-45 polish-backlog entry annotated with "✅ Build #2 deploy complete YYYY-MM-DD" + (a.66) flipped to closed + new (a.67) opened — likely P-45 Build #3 fix-forward OR the very next non-P-45 polish item like P-43 / P-44) + CHAT_REGISTRY (header bump — 133rd Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for the next session) + CAPTURED_VIDEOS_DESIGN.md §B YYYY-MM-DD entry (Build #2 mid-deploy judgment calls per Rule 18 append-only + §C.20 ship checklist Phase 4 outcomes per platform) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md (new "Deploy session #N — P-45 screen recording DEPLOYED + cross-platform verification" section appended before the END OF DOCUMENT marker — the canonical verification artifact for Build #2 covering deploy mechanics + 4-platform verification grid + any captured failures for Build #3).

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

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **NEW this session: Layer-3b mirror-staleness canary now active.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code work — the mirror should be healthy entering Build #2 because P-42 shipped this session.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-42 as a strongly-recommended pre-flight detour ahead of P-45 Build #2's deploy session. The detour was explicitly named in the 2026-05-22-e NEXT_SESSION.md alternates list ("HIGH severity; STRONGLY RECOMMENDED before any future big session"). Director picked the detour rather than going straight to P-45 Build #2 because the three prior P-42 reproductions across 2026-05-20-b, 2026-05-20-c, and 2026-05-21 had been climbing in priority — every reproduction confirmed director's memory was unsafe across any future Codespaces rebuild until P-42 shipped. The detour cost ~1 session of detour but de-risks every subsequent big session (P-45 Build #2 + P-46 W#2 Phase 2 + all downstream W#3-W#14 sessions).

The shape of P-45 Build #2's launch prompt is **identical to the 2026-05-22-e pointer's launch prompt** for the same task — the 4-phase shape (verify → scoreboard → deploy → cross-platform verify), the §C.11-§C.20 BINDING spec, the locked menu label **"Record video for PLOS"**, the one-Rule-9-this-session shape, and the schema-change-in-flight flag flipping NO at deploy completion are all unchanged. The only difference is that this pointer is dated 2026-05-22-f and notes P-42 is now ✅ DONE so the mechanical-backup substrate is hardened, and the ff-merge will carry 6-7 commits instead of 4-5.

The §C.11-§C.20 deepening is BINDING per Rule 18 — do NOT re-litigate at deploy time. Any Phase 4 verification failures get surfaced via Rule 14f forced-picker between (A) fix-forward in a new Build #3 session vs. (B) accept-as-known-issue + defer to a future polish session vs. (C) revert this deploy. Per the 2026-05-22 Build #8 precedent, fix-forward is the recommended option unless the failure class is fundamentally unfixable at the deploy level.

**Alternate next-session candidates if director shifts priorities at session start (after P-42 + before Build #2):**

- **P-43 scoreboard absolute-paths polish (LOW-MEDIUM elevated by ongoing reproduction history).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if a quick win on operational tooling is preferred before the larger P-45 Build #2 deploy session. Estimated <1 hour.
- **P-44 wxt-zip + wxt-build parent-process hang fix.** Reproduced twice in Build #8 — reliable-now-not-intermittent. Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session.
- **Defer P-45 Build #2 + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 / non-P-45 W#2 pre-graduation polish item. Estimated 1-2 sessions. Not recommended — P-45 Build #2 is the natural continuation of Build #1b's wiring; the deploy + cross-platform verify closes the P-45 implementation arc and shouldn't be left in flight.
- **Defer P-45 Build #2 + start P-46 W#2 Phase 2 design session.** ~15-25 sessions across 5 workstreams. Not recommended — the sequencing picker on 2026-05-22-c locked P-46 to start AFTER P-45 ships; jumping to P-46 now would leave the screen-recording wiring undeployed + force future P-45 work to be picked up cold.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
