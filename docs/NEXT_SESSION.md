# Next session

**Written:** 2026-05-24-f (`session_2026-05-24-f_p46-w4-phase4-fix-forward-1-then-w5-p47-phase4-pass-plus-p48-capture` — end-of-session handoff after **W#2 polish bundled Phase-4 real-Chrome verification session ✅ DONE 2026-05-24-f — P-46 Workstream 4 + Workstream 5 + P-47 Shadow DOM refactor ALL ✅ DONE-AND-VERIFIED 2026-05-24-f end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` fix-forward #1 ff-merge `5ed754e..d38b036` carrying 1 commit (W4 fix-forward `d38b036` — 5 files +292/-94 UI-only resolving 7 director-observed Phase-4 issues)**). Bundled Phase-4 verification session walking 3 deferred verification scripts in one sitting; Walkthrough (a) W4 surfaced 7 director-observed issues — fix-forward #1 bundled all 7 fixes under ONE Rule 9 deploy gate; director re-walked all 10 W4 Phase-4 steps post-Vercel-redeploy → ALL PASS; Walkthroughs (b) W5 + (c) P-47 paired on Amazon both PASS first-walk (zero fix-forwards needed for either). **P-46 entire 5-workstream polish arc closes ✅ DONE-AND-VERIFIED end-to-end 2026-05-24-f.** **P-47 closes ✅ DONE-AND-VERIFIED 2026-05-24-f.** NEW P-48 polish item captured per Rule 24 search (no prior treatment found — director-observed video playback stutters on vklf.com specific to P-45 screen-recording captures; LOW–MEDIUM severity; 1-2 sessions diagnostic + implementation). **Closes (a.88) RECOMMENDED-NEXT = Bundled Phase-4 verification session ✅ DONE 2026-05-24-f**; **opens (a.89) RECOMMENDED-NEXT = P-48 Session 1 (Diagnostic) on `workflow-2-competition-scraping`** — first item in director's 2026-05-24-f directive to "fix all things remaining for competition scraping" before W#2 graduation + then explicitly ASK for next round of additions.

---

## What we did this session (in plain terms)

Today was a **Phase-4 verification session** — we walked the 3 verification scripts that had been deferred over recent sessions, all in one sitting. Here's what happened:

- **Walkthrough (a) — W4 Comprehensive Competitor Analysis page (per-Project rich-text editor):** Director walked 10 steps on vklf.com + surfaced **7 small UX issues**:
  1. No blinking cursor visible when entering edit mode.
  2. H1 / H2 / H3 headings don't visibly render larger than body text.
  3. Inserted hyperlinks don't render underlined.
  4. Bullets in bullet list don't show.
  5. Done button doesn't save the typed content (text disappears on toggle back to read mode).
  6. No font-size option in the toolbar.
  7. Dark background for the editor surface (director directive — sitewide, not W4-only).
- **Fix-forward #1 landed in-session:** I bundled all 7 fixes into ONE UI-only build commit (`d38b036`, 5 files +292/-94), got your Yes on the Rule 9 deploy gate, ff-merged to main, Vercel auto-redeployed in ~2-3 minutes, and you re-walked all 10 W4 Phase-4 steps → **ALL PASS.**
- **Walkthrough (b) — W5 URL save form additions (Type / Description-1 / Description-2 / Price):** You walked the 4 steps on Amazon → **PASS first-walk** (no fix-forwards needed). The 4 new fields appeared in the extension URL save form, accepted typed values, and the values landed cleanly on vklf.com's Competition Data row. The optional Step 4 (Reviews modal idempotency end-to-end test) also passed.
- **Walkthrough (c) — P-47 Shadow DOM mount on video-capture form:** You walked the 2 steps on Amazon → **PASS first-walk** (no fix-forwards needed). The form opens cleanly, interactions work with zero page-level focus interference, and Escape closes cleanly. The Shadow DOM mount structurally replaces the 80-event-listener band-aid we shipped earlier.
- **New small issue you flagged → captured as NEW P-48 polish item:** Video playback stutters on vklf.com (specifically the screen-recording captures from P-45). I searched all docs per Rule 24 to make sure this isn't already tracked — no prior treatment found — and captured it as P-48 with a 2-session scope estimate (Session 1 diagnostic looks at 2-3 of your recent screen recordings + measures bitrate / file size / Network panel behaviour; Session 2 lands the fix, most likely capping the MediaRecorder bitrate at ~2.5 Mbps + frame rate at 30fps + resolution at 1080p in `screen-recorder.ts`).
- **Two `Rule 14f` forced-pickers fired during the fix-forward shaping** — Light-theme scope (you picked sitewide editor light-theme over W4-only scoping, so today's fix retroactively updates the URL detail page per-item Analysis + Overall Analysis editors too) + Font-size feature (you picked add a font-size stepper to the W4 editor toolbar).
- **Schema-change-in-flight flag STAYS NO** entire session — fix-forward #1 was UI-only (no schema, no API, no shared-types changes).
- **/scoreboard:** pre-deploy 5/5 GREEN at unchanged baselines (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes); post-merge partial GREEN at the same baselines (the merged commit was byte-identical to the pre-deploy commit via a clean ff-merge, so I trusted Check 5 + Check 3 at unchanged baselines and re-ran tsc + node:test for sanity). Check 6 Playwright SKIPPED per Rule 27 — no Playwright spec coverage for the RichTextEditor / AnalysisEditor / LinkToUrlPicker editor changes.
- **Director directive at session end:** *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."* So next sessions step through P-48 → P-43 mechanical prevention → P-26 below-fold scroll evaluation → P-27 re-evaluation → W#2 graduation step → STOP AND ASK.

**The session landed cleanly: P-46 + P-47 both close end-to-end on vklf.com; P-48 captured for a future session.** ONE Rule 9 gate fired (fix-forward #1 deploy); 4 pushes planned (deploy push DONE under your Yes; ping-pong push DONE post-deploy; doc-batch push pending; doc-batch ff-merge push pending).

## What we'll do next session (in plain terms)

Next session is **P-48 Session 1 (Diagnostic) on `workflow-2-competition-scraping`** — the first item in your 2026-05-24-f directive to "fix all things remaining for competition scraping" before W#2 graduation.

Session 1 is **diagnostic only** — no code lands. Here's what I'll do:

- **Inspect 2-3 of your most recent screen-recording video files in Supabase Storage** — for each: file size, bitrate (via `ffprobe`), codec, container, duration. The goal is to confirm the working hypothesis that the bitrate is uncapped (~6-8 Mbps+ at 1080p screen content), producing files that exceed real-time decode budget on your playback device.
- **Open one of those recordings on vklf.com in Chrome DevTools Network panel during playback** — confirm range requests work (Supabase Storage default), check Cache-Control headers, measure transfer time vs. decode time so we know whether the bottleneck is delivery-side (network bandwidth / range request gaps) or capture-side (file size + bitrate exceeding decode budget).
- **Output: a one-paragraph diagnosis** pinpointing capture-side vs. delivery-side as the dominant contributor + recommended fix path for Session 2.

**If the diagnosis confirms capture-side as dominant (likely):** Session 2 = capture-side bitrate cap. Set `videoBitsPerSecond: 2_500_000` (2.5 Mbps) on MediaRecorder + cap `getDisplayMedia` to `frameRate: { max: 30 }` + `width: { max: 1920 }, height: { max: 1080 }`. ~30 LOC in `extensions/competition-scraping/src/lib/content-script/screen-recorder.ts`. Only helps NEW captures; existing recordings keep their original bitrate (we can re-record any that you really want to keep at lower bitrate, but that's manual).

**If the diagnosis surprises us and points to delivery-side as dominant:** alternate Session 2 = delivery-side fix (typically Supabase Storage configuration or a CDN-fronting strategy).

**Schema-change-in-flight flag** STAYS **NO** at Session 1 start AND end (diagnostic-only; no code; no schema). **Rule 9 gates** planned this session: **ZERO** (no main push; pure diagnostic).

Estimated 30-60 min for Session 1 in-session work (most of the time is the actual `ffprobe` + Network panel observations).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24-f (P-46 + P-47 both ✅ DONE-AND-VERIFIED end-to-end on vklf.com; W#2 polish queue now has 4 small items left before graduation):

- **P-48 (NEXT — Session 1 Diagnostic + Session 2 Implementation).** ~1-2 sessions. NEW today. Captures the "video playback stutters on vklf.com" issue you flagged during today's verification.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 3's `npm test` + Check 5's `npm run build` — the prior P-43 template-hardening pass missed both). Not blocking any workstream; 7+ reproductions across sessions now.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Current two-captures workaround works fine. Has been the alternate candidate in recent end-of-session pickers; consistently not picked. Re-evaluate after P-48 + P-43 close — if still LOW + not blocking anything, you may just want to drop it.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete now that P-46 redesigned the surfaces. Re-evaluate after P-46 closes (which it now has — so this re-evaluation happens at the next P-27 touch).
- **W#2 graduation step.** ~1 session. Formal transition that closes W#2 and makes W#3 available. Requires all polish items DONE-AND-VERIFIED first.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for the next round of competition-scraping additions** per your verbatim 2026-05-24-f directive: *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."*
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **P-48 Session 1 (Diagnostic) on `workflow-2-competition-scraping`** (estimated ~30-60 min in-Claude: pre-build doc reads ~5 min + branch state verify ~2 min + Supabase Storage inspection of 2-3 recent screen recordings via `ffprobe` ~10 min + Chrome DevTools Network panel observation during playback ~5-10 min + diagnosis paragraph drafting ~5 min + end-of-session doc-batch ~15 min + ping-pong sync ~3 min). Per Rule 23 Change Impact Audit: **DIAGNOSTIC SESSION** (no new code; no new schema; no new dependencies; output is a paragraph diagnosis recommending the Session 2 fix path). **Schema-change-in-flight flag stays NO** (no transition expected). **Rule 9 triggers planned this session: ZERO.** **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 1 minimum (end-of-session doc-batch push to workflow branch + ff-merge to main).

---

## Status of today's session

**W#2 polish bundled Phase-4 real-Chrome verification session ✅ DONE 2026-05-24-f** — P-46 W4 + W5 + P-47 ALL ✅ DONE-AND-VERIFIED 2026-05-24-f end-to-end on vklf.com via fix-forward #1 ff-merge `5ed754e..d38b036` carrying 1 commit (W4 fix-forward `d38b036` — 5 files +292/-94 UI-only resolving 7 director-observed Phase-4 issues). Verification + fix-forward session; deployed fix-forward to main this session.

**Session shape (VERIFICATION + FIX-FORWARD SESSION — ff-merge to main; ONE Rule 9 gate; TWO Rule 14f forced-pickers; FOUR pushes planned):**

- Pre-build reads at session start.
- Branch state verify — `workflow-2-competition-scraping` at `5ed754e`; `main` at `5ed754e` (both even from prior session's 3-push pattern ping-pong).
- Rule 14f session-start confirmation — NO picker fired because launch-prompt task (bundled Phase-4 verification) was the recommended default + director's directive matched.
- Walkthrough (a) W4 — 7 issues surfaced; fix-forward #1 bundled.
- TWO Rule 14f forced-pickers fired during fix-forward shaping — light-theme scope (sitewide) + font-size feature (add to W4 toolbar).
- Build commit `d38b036` lands on workflow branch.
- Pre-deploy /scoreboard 5/5 GREEN at unchanged baselines.
- Rule 9 deploy gate FIRED — director picked Deploy now — Recommended.
- ff-merge + push to `origin/main` executed cleanly at `d38b036`.
- Vercel auto-redeploy fired (~2-3 min).
- Post-merge /scoreboard partial GREEN at same baselines (clean ff-merge means merged commit byte-identical to pre-deploy commit).
- Director re-walks all 10 W4 Phase-4 steps → ALL PASS.
- Walkthroughs (b) W5 + (c) P-47 paired on Amazon → both PASS first-walk.
- P-46 + P-47 + W4 + W5 + P-47 status flips to ✅ DONE-AND-VERIFIED.
- NEW P-48 captured per Rule 24 search.
- End-of-session §4 Step 1c next-session-scope picker — director's directive locked the sequence (P-48 → P-43 → P-26 → P-27 → W#2 graduation → ASK).
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24-f + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + COMPETITION_DATA_V2_DESIGN.md §B 2026-05-24-f + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-24-f).
- FOUR pushes this session: fix-forward #1 deploy push to `origin/main` (DONE under Rule 9 Yes at `d38b036`); ping-pong push to `origin/workflow-2-competition-scraping` (DONE post-deploy); end-of-session doc-batch push to `origin/workflow-2-competition-scraping`; end-of-session ff-merge push to `origin/main` for doc-batch (operationally adjacent; does NOT re-invoke Rule 9).

**Rule 14f forced-pickers FIRED TWICE during fix-forward shaping** — Light-theme scope picker resolved to sitewide Recommended; Font-size feature picker resolved to add Recommended.

**ZERO DEFERRED items at session end (Rule 26)** — all 3 prior standing carry-overs (W4 + W5 + P-47 Phase-4 verifies) RESOLVED today via PASS verdicts. P-48 captured as ROADMAP polish-backlog item, not a carry-over.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-24-f** — the bundled Phase-4 verification + fix-forward #1 + Phase-4 PASS closing §Entry capturing 6 sub-observations including 2 NEW reusable Patterns ("Bundled Phase-4 verification surfaces issues concentrated in newest surface" + "Editor save-on-Done race condition — debounced save + unmount cleanup") + NEW P-48 capture + calibration data point validating fix-forward-in-session criterion + LOW informational on UX directive surfacing 3+ months after styling shipped.

**THIRTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-48 Session 1 (Diagnostic) begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` is exactly even with `origin/main` at today's end-of-session doc-batch commit (both branches end the session at the same SHA after the canonical 3-push pattern's ping-pong sync — note today is 4-push since the fix-forward #1 deploy push counted separately). Verify with `git log main..HEAD --oneline` showing 0 commits ahead. The P-48 Session 1 diagnostic session does NOT involve any new ff-merge to main (no code lands in Session 1).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-48 Session 1 (Diagnostic) on `workflow-2-competition-scraping`.** Closes the diagnostic half of **(a.89) RECOMMENDED-NEXT**. Diagnostic session — no code lands. Inspect 2-3 of director's most recent screen-recording video files in Supabase Storage via `ffprobe` (file size / bitrate / codec / container / duration). Open one of those recordings on vklf.com in Chrome DevTools Network panel during playback (range requests / Cache-Control / transfer time vs decode time). Output: a one-paragraph diagnosis pinpointing capture-side vs delivery-side as the dominant slowdown contributor + recommended Session 2 fix path.

DIAGNOSTIC session — ZERO Rule 9 gates planned. No new code. No new npm dependencies. No new schema.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 0 commits ahead.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or diagnostic mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **NEW P-48 polish-backlog entry** (just below P-39 on the polish list — full diagnostic + implementation scope description; cross-references P-45 + P-23).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-22-i (P-45 build session — the screen-recording feature P-48 is about) + the P-45 polish-backlog entry in ROADMAP (the canonical scope description for screen recording).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-f (today's Phase-4 PASS lifecycle entry — context for the W4 + W5 sub-status flips).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (Rule 14f session-start picker — fires AT MOST ONCE to confirm Session 1 diagnostic scope OR shift to another task if director prefers) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DIAGNOSTIC SESSION; no code, no schema, no dependencies) + Rule 24 (search before capturing new items; today's session continues that pattern — verify the P-48 capture from today's session is still the canonical reference) + Rule 25 (Multi-Workflow — workflow-2 only this session; no ff-merge unless director shifts scope) + Rule 26 (DEFERRED items registry — ZERO standing carry-overs at session entry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (push count + ping-pong pattern; 1 push minimum end-of-session for diagnostic session).
- The CORRECTIONS_LOG §Entry 2026-05-24-f (today's bundled Phase-4 PASS closing entry — the NEW P-48 capture sub-observation provides the canonical capture context).
- The P-43 polish-backlog entry in ROADMAP + recent §Entry 2026-05-26 sub-observation (the mechanical prevention candidate that comes next after P-48 — useful context for understanding the upcoming polish queue sequencing per director's directive).

**Task shape (P-48 Session 1 — Diagnostic):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or diagnostic mechanics. Cover: what we'll do in the session (pre-build reads + branch state verify + Supabase Storage inspection + Chrome DevTools Network panel observation + diagnosis paragraph + end-of-session doc-batch + ping-pong sync), schema-change-in-flight flag stays NO, ZERO Rule 9 gates planned.

2. **Pre-build reads** — execute the pre-build read list above. ~5 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits — both branches at same SHA from prior session's ping-pong).

4. **Rule 14f session-start confirmation** — confirm P-48 Session 1 diagnostic scope. Per `feedback_default_to_recommendation.md` no picker fires if launch-prompt task is the recommended default + director directive matches. If director shifts scope (e.g., wants to skip Session 1 + go directly to Session 2 implementation; OR wants to scope a different polish item; OR wants to re-evaluate the P-48 priority), fire clarifying picker.

5. **Inspect 2-3 recent screen-recording video files in Supabase Storage.** Director will need to share access OR provide file URLs (likely Supabase Storage public URLs from the Competition Data video card display). For each video: run `ffprobe` (or equivalent) to extract file size + bitrate + codec + container + duration + dimensions. Output: a small table with one row per video.

6. **Open ONE of those videos on vklf.com in Chrome DevTools Network panel during playback.** Director may need to be involved (Chrome session on Mac vs. Claude's Codespace). Capture: range request behavior (Supabase Storage range support), Cache-Control headers, transfer time vs decode time, any 206 Partial Content responses or chunking patterns.

7. **Draft the diagnosis paragraph.** Summarize: (a) dominant contributor (capture-side bitrate vs delivery-side range/cache vs container/codec); (b) recommended Session 2 fix path with LOC estimate + file path; (c) any secondary contributors that may need follow-up work in Session 3+ if Session 2 doesn't fully resolve.

8. **End-of-session doc-batch** covers ROADMAP (header bump + P-48 status update to ✅ DIAGNOSED 2026-05-XX with diagnosis paragraph appended + (a.89) sub-status update — Diagnostic half complete; Implementation half opens as next-session task) + CHAT_REGISTRY (header bump — 155th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry capturing the diagnosis + any informational observations from the inspection) + NEXT_SESSION (rewritten for P-48 Session 2 — Implementation task) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + Group B doc updates if any cross-cuts surface (likely none — P-48 is capture-side mechanics, not Competition Data design layer).

9. **Ping-pong sync** — after doc-batch commit lands on `workflow-2-competition-scraping`, ff-merge to `main` + push to `origin/main` so both branches stay in sync. End-of-session 1-push pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** if any aspect of the diagnosis feels under-specified (e.g., findings point to multiple roughly-equal contributors + no clear dominant), surface to director via Rule 14f picker BEFORE drafting the final diagnosis paragraph.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (diagnostic-only; no code; no schema).

---

## Pre-session notes (offline steps for director between sessions)

**Optional offline step BEFORE the next P-48 Session 1 (Diagnostic) session:** Identify 2-3 recent screen-recording videos in your Competition Data table that exhibit the stutters. Either: (a) note down their URL detail page URLs so I can fetch them via the API, OR (b) share their Supabase Storage public URLs directly, OR (c) accept that I'll just pick the 2-3 most recent ones in any Project from Storage. Any of these works.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-48 Session 1 diagnostic session at all — can happen any time. Director-independent.

**Optional offline reading for director:** the NEW P-48 polish-backlog entry in ROADMAP.md (the diagnostic + implementation scope description with cross-references to P-45 + P-23) + the P-45 polish-backlog entry (the screen-recording feature this polish item degrades — DONE 2026-05-22-i). ~3-5 minute skim.

**Pre-session setup (informational — Claude will handle in-session):** P-48 Session 1 begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + sharing the 2-3 video files OR confirming Claude can pick recent ones.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Pure diagnostic session.

**Rule 9 triggers planned this session: ZERO** — no main push planned (no code lands in Session 1).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any diagnostic mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session was the **bundled Phase-4 real-Chrome verification session** — director walked 3 verification scripts on Amazon + the per-Project Comprehensive Competitor Analysis page on vklf.com in one sitting. Walkthrough (a) W4 surfaced 7 director-observed issues all addressed via single fix-forward build commit `d38b036` under ONE Rule 9 deploy gate; director re-walked all 10 steps → ALL PASS. Walkthroughs (b) W5 + (c) P-47 both PASS first-walk on Amazon. P-46 entire 5-workstream polish arc closes ✅ DONE-AND-VERIFIED end-to-end on vklf.com 2026-05-24-f. P-47 closes ✅ DONE-AND-VERIFIED 2026-05-24-f. NEW P-48 captured per Rule 24 search.

At end-of-session, director's verbatim directive locked the next-sessions sequence: P-48 → P-43 mechanical prevention → P-26 below-fold scroll evaluation → P-27 re-evaluation → W#2 graduation step → THEN STOP AND EXPLICITLY ASK director for next round of competition-scraping additions.

The natural next-session task per (a.89) RECOMMENDED-NEXT is **P-48 Session 1 (Diagnostic) on `workflow-2-competition-scraping`** — first item in director's directive. Session 1 is diagnostic-only (no code, no schema, no dependencies); Session 2 will implement the fix based on Session 1's diagnosis.

- **(Recommended)** P-48 Session 1 (Diagnostic) — `ffprobe` inspection of 2-3 recent screen recordings + Chrome DevTools Network panel observation during playback + one-paragraph diagnosis recommending Session 2 fix path. Recommended because (a) follows director's verbatim 2026-05-24-f directive locking the sequence; (b) Session 1 diagnostic is the most-thorough/reliable path per `feedback_recommendation_style.md` — locks Session 2's fix path empirically rather than guessing at the dominant contributor; (c) preserves option to redirect Session 2 if findings surprise (e.g., delivery-side dominant rather than capture-side).

The shape of the P-48 Session 1 diagnostic session is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation + Supabase Storage inspection + Chrome DevTools Network panel observation + diagnosis paragraph + end-of-session doc-batch + ping-pong sync + 1 push minimum**.

**After P-48 Session 1 ships,** Session 2 (Implementation) follows next-next session — likely a ~30 LOC change in `extensions/competition-scraping/src/lib/content-script/screen-recorder.ts` capping MediaRecorder bitrate + getDisplayMedia frame rate + dimensions, IF Session 1 confirms capture-side as dominant. If delivery-side surprises us, Session 2 is a different shape (Supabase Storage config OR CDN-fronting).

**Alternate next-session candidates if director shifts priorities at session start:**

- **Skip Session 1 diagnostic + go directly to Session 2 implementation.** NOT recommended — without Session 1's empirical findings, we'd be guessing at the dominant contributor (capture-side vs delivery-side vs container/codec). The diagnostic is ~30-60 min vs. potentially landing the wrong fix.
- **P-43 mechanical prevention small fix.** NOT recommended this session — P-43 is the small-fix item that comes AFTER P-48 per director's directive sequencing. Can happen any time after P-48 closes.
- **P-26 below-fold scroll capture evaluation.** NOT recommended this session — P-26 is the LOW alternate that comes AFTER P-43. May get dropped after re-evaluation since current two-captures workaround works fine.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended this session — likely obsolete after P-46 redesigns. Re-evaluate after P-26.
- **W#2 graduation step.** NOT recommended UNTIL all polish items DONE-AND-VERIFIED. Currently 4 items left (P-48 + P-43 + P-26 + P-27) per director's directive sequencing.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the P-48 polish-backlog entry for the binding scope-and-where description. Check `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-22-i (P-45 build) + the P-45 polish-backlog entry for the canonical context on the screen-recording feature that P-48 polishes.
