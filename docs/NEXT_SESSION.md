# Next session

**Written:** 2026-05-24-d (`session_2026-05-24-d_p47-shadow-dom-refactor-session-1` — end-of-session handoff after **W#2 polish P-47 Shadow DOM refactor Session 1 (content-script video-capture-form mount strategy refactor from `document.body` + 80-event-listener band-aid to open Shadow DOM root with `FORM_CHROME_CSS` injected inside the shadow + band-aid deletion) ✅ DONE-AT-CODE-LEVEL 2026-05-24-d on `workflow-2-competition-scraping` via build commit `d08f673` (2 files +203/-220, net -17 LOC)**). Pure CODE session on `workflow-2-competition-scraping`; NOT pushed to main this session (next session is the bundled W5 + P-47 deploy session per the end-of-session §4 Step 1c picker outcome); build commit sits on workflow branch alongside the 2 prior W5 build commits (`3c981be` + `41172f1`) all awaiting the next deploy session. **W#4 Phase-4 director real-Chrome verification deferred a THIRD consecutive session at director directive** — full 10-step verification walkthrough preserved verbatim AGAIN below in ## Standing carry-overs section so the next session can copy + execute it without re-deriving. **ONE §4 Step 1c forced-picker fired** — end-of-session next-session scope (director picked **Bundled W5 + P-47 deploy session — Recommended** over P-26 below-fold scroll capture + P-43 mechanical prevention + question-first). **Schema-change-in-flight flag STAYS NO** — pure content-script DOM mount refactor; no schema, no API, no shared-types. Pre-build + post-refactor /scoreboard both 5/5 GREEN at unchanged baselines (root tsc clean / extension tsc clean / **558 ext UNCHANGED** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per non-deploy-session convention. **Closes (a.86) RECOMMENDED-NEXT = P-47 Shadow DOM refactor Session 1**; **opens (a.87) RECOMMENDED-NEXT = Bundled W5 + P-47 deploy session** on `workflow-2-competition-scraping` → `main` per director's end-of-session picker. Three prior standing carry-overs (P-46 W5 deploy + P-46 W5 Phase-4 verify + P-47 Session 1 Phase-4 verify) RESOLVE at next session's bundled deploy; ONE standing carry-over remains — P-46 W4 Phase-4 verify (third consecutive defer).

---

## What we did this session (in plain terms)

Today was a **pure-code refactor session** — replaced the 80-event-listener band-aid shipped 2026-05-22-i in the content-script video-capture form with a structurally cleaner Shadow DOM mount. The form opens inside a "private" DOM root attached to the page rather than directly mounting onto the page; events fired inside that private root don't surface to page-level handlers, which is exactly what the band-aid was protecting against. So the band-aid got deleted.

What happened, in plain terms:

- **Director directive at session start was the same as the last two sessions** — "defer any real world testing that needs to be done by me and work on the next item on the roadmap for workflow#2". Per the standing feedback memory `feedback_default_to_recommendation.md`, no re-confirmation picker fired because the launch-prompt task (P-47 Shadow DOM refactor Session 1, pure code) was already the recommended default and matched the directive exactly.
- **The refactor landed cleanly via build commit `d08f673`** (2 files +203/-220, net -17 LOC). The content-script video-capture form now mounts inside an open Shadow DOM root attached to a fixed-positioned host `<div>` in `document.body`, rather than appending the backdrop directly into `document.body`. Events fired inside the shadow root do not surface to page-level handlers by default, so the per-input event-isolation band-aid (P-45 Build #2 2026-05-22-i, 20 events × 4 inputs = 80 listeners on each form open) is no longer needed and has been deleted (62 LOC removed including the function + its 4 call sites + its 20-line context comment).
- **CSS extracted to a shared exported constant.** `styles.ts` now exports `FORM_CHROME_CSS` containing the `.plos-cs-form-*` + `.plos-cs-chip-*` rules; `CONTENT_SCRIPT_CSS` interpolates `${FORM_CHROME_CSS}` so the other forms (image / text / url-add) that still mount to `document.body` continue to receive these rules via the host-page `<head>` stylesheet without drift; `video-capture-form.ts` imports `FORM_CHROME_CSS` and injects it inside the shadow root via a `<style>` tag. Single source of truth across both consumption sites.
- **Director mid-session directive** — "please skip anything that requires me to do real world testing in this session" — directly skipped P-47 Step 8 (empirical Chrome verification on Amazon); captured as DEFERRED task #6 + resolved by routing the verify to next session's bundled deploy Phase-4 step (which covers BOTH W5 URL-form additions AND P-47 Shadow DOM mount since both ship via the same extension form surface).
- **NEW reusable Pattern memorialized** — "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid". Pairs with P-45 Build #2 §Entry 2026-05-22-i Pattern B (the band-aid memorialized) as the long-term-fix pairing. The band-aid + Shadow DOM mount form a complete pattern lifecycle: ship the band-aid first to unblock the immediate ship; capture the structural replacement as a polish-backlog entry; ship the structural replacement in a later session when scope permits. P-45 Build #2 → P-47 Session 1 is the canonical exemplar.
- **End-of-session picker chose next-session scope.** Picker offered (A) Bundled W5 + P-47 deploy to main (Recommended) / (B) P-26 below-fold scroll capture Session 1 / (C) P-43 mechanical prevention small fix / (D) question first. Director picked A — most-thorough/reliable per `feedback_recommendation_style.md` since the unshipped-to-main queue is now 3 build commits (W5 build `3c981be` + Reviews polish `41172f1` + today's P-47 `d08f673`) and one deploy session ff-merges all 3 + Vercel auto-redeploy + fresh extension zip + Phase-4 covers BOTH the W5 URL-form additions AND the Shadow DOM mount on Amazon.
- **W#4 Phase-4 verification deferred a THIRD consecutive session** at director directive — 10-step walkthrough preserved verbatim AGAIN below in ## Standing carry-overs section.
- **Schema-change-in-flight flag STAYS NO** the entire session. Pure content-script DOM mount refactor; no schema, no API, no shared-types.

**The session landed cleanly through scope-defer + structural-refactor + verbatim-preservation of carry-overs.** No top-tier slips; no fix-forwards; no Rule 9 gates fired; ONE end-of-session push planned to `origin/workflow-2-competition-scraping` carrying 2 commits (build `d08f673` + this doc-batch).

## What we'll do next session (in plain terms)

Next session is the **bundled W5 + P-47 deploy session** — ships the 3 unshipped build commits (W5 build + Reviews polish + P-47 Shadow DOM) from `workflow-2-competition-scraping` to `main` in ONE ff-merge, then Vercel auto-deploys vklf.com, then optionally builds a fresh extension `.crx` zip + Phase-4 real-Chrome verification on Amazon covering BOTH the W5 URL-form additions AND the Shadow DOM mount (since both ship via the same extension form surface).

What the bundled W5 + P-47 deploy session covers:

- **Pre-deploy /scoreboard verify** on `workflow-2-competition-scraping` — expected 5/5 GREEN at current baselines (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes). Check 6 Playwright — per Rule 27 picker, RUN if the ff-merge bundle contains extension Playwright spec changes (today's P-47 refactor + W5 URL-form additions both touch extension source files; director picks at deploy time whether to RUN Playwright).
- **Rule 9 deploy gate** — ONE Rule 9 picker fires for the deploy push to main. Per `feedback_recommendation_style.md` recommended path is "Deploy now — push to origin/main (recommended)".
- **`git push origin main` executes** — main fast-forwards from `096a2ac` to the latest doc-batch SHA on `workflow-2-competition-scraping`, carrying 3 build commits + the interleaved doc-batch commits.
- **Vercel auto-redeploy fires** (~2-3 minute build + cache invalidation).
- **Optionally:** build a fresh extension `.crx` zip via `npm run build` in `extensions/competition-scraping/` + zip the dist/ output (matches the existing `plos-extension-*.zip` filename pattern at repo root).
- **Post-merge /scoreboard verify** on `main` — expected 5/5 GREEN at same baselines.
- **Phase-4 director real-Chrome verification** — covers BOTH W5 URL-form additions (4 new textarea fields Type / Description-1 / Description-2 / Price; save round-trip) AND P-47 Shadow DOM mount (form opens cleanly + accepts input + saves cleanly + no page-level focus interference on Amazon). Either runs in-session (per the W3 deploy 2026-05-24 Pattern) OR deferred to next session (per the W4 deploy 2026-05-26 Pattern). Director picks at deploy time.
- **End-of-session doc-batch** + ping-pong sync + end-of-session ff-merge push to `origin/main` for the doc-batch.

**Schema-change-in-flight flag** STAYS **NO** at the bundled deploy session start AND end (no schema work in W5 / Reviews polish / P-47).

**After the bundled deploy lands,** P-46 W5 + P-47 both flip to ✅ DEPLOYED-PHASE-4-PENDING (or ✅ DONE-AND-VERIFIED if Phase-4 runs in-session and passes); the ONLY remaining standing carry-over is W4 Phase-4 verify (now in its fourth-consecutive-defer territory unless director picks it up at the bundled deploy session).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24-d (P-47 Session 1 ✅ DONE-AT-CODE-LEVEL; W4 Phase-4 verify + bundled W5 + P-47 deploy all queued):

- **Bundled W5 + P-47 deploy session** (NEXT). ~1 session. ff-merges 3 build commits to main + Vercel auto-redeploy + fresh extension zip + Phase-4 real-Chrome verification on Amazon covering BOTH W5 URL-form additions AND P-47 Shadow DOM mount.
- **Standing carry-over: P-46 W4 Phase-4 verification session.** Deferred a THIRD consecutive session at director's request. 1 session when director is ready for real-world testing. The 10-step walkthrough is preserved verbatim in ## Standing carry-overs section (a) below.
- **P-46 Workstream 5 Session 2 (optional polish — TBD).** §C.5 estimate was 1-2 sessions; W5 Session 1 (2026-05-24-c) covered the user-visible scope after the popup-form file simplification. Session 2 may be redundant; director picks at the bundled deploy session whether to scope additional W5 work before deploy.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. Was option B at today's end-of-session picker; not picked.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May be obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **P-43 mechanical prevention candidate (LOW informational).** Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 5's `npm run build` + route-count grep), not just the extension-rooted Checks 2-3. Not blocking any workstream. Was option C at today's end-of-session picker; not picked.
- **W#2 graduation** after P-46 + P-47 ship + W4 Phase-4 verify lands. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **Bundled W5 + P-47 deploy session** (estimated ~45-90 min: pre-build doc reads ~5-10 min + branch state verify ~2 min + pre-deploy /scoreboard ~3-5 min + Rule 9 gate ~1 min + ff-merge `git push origin main` ~5 min including Vercel deploy ~2-3 min + post-merge /scoreboard ~3-5 min + optional fresh extension zip build ~5 min + Phase-4 verification or deferral ~10-30 min + end-of-session doc-batch ~15-20 min + ping-pong sync ~3 min). Per Rule 23 Change Impact Audit: **DEPLOY SESSION + EXTENSION + UI** (3 unshipped build commits + interleaved doc-batches ff-merged to main; no new schema; no new dependencies; no new routes — all the substantive change happened in the prior code sessions). **Schema-change-in-flight flag stays NO** (no transition; no schema work in any of the 3 unshipped build commits). **Rule 9 triggers planned this session: ONE** (the deploy push to `origin/main` — Rule 9 picker fires once + director-Yes per `feedback_recommendation_style.md` most-thorough/reliable). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 3 minimum (push to workflow branch if anything new lands pre-deploy + push to main for the ff-merge + push to workflow branch for the end-of-session doc-batch + ping-pong sync).

---

## Status of today's session

**W#2 polish P-47 Shadow DOM refactor Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-d on `workflow-2-competition-scraping` via build commit `d08f673` (2 files +203/-220, net -17 LOC)**. Pure CODE session; NOT pushed to main this session.

**Session shape (CODE SESSION — single-branch; ZERO Rule 9 gates; ONE §4 Step 1c forced-picker; ONE push planned):**

- Pre-build reads at session start (read `docs/ROADMAP.md` P-47 polish-backlog entry + `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` + `extensions/competition-scraping/src/lib/content-script/styles.ts`).
- Rule 14f session-start confirmation — NO picker fired because launch-prompt task was the recommended default + director's session-start directive matched the default.
- Refactor landed via build commit `d08f673` (2 files +203/-220, net -17 LOC).
- /scoreboard pre-build + post-refactor — both 5/5 GREEN at unchanged baselines.
- End-of-session §4 Step 1c picker FIRED — director picked Bundled W5 + P-47 deploy session (Recommended) over P-26 / P-43 / question-first.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24-d + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-24-d entry on `docs/COMPETITION_SCRAPING_DESIGN.md`).
- ONE push this session: end-of-session push of build commit `d08f673` + today's doc-batch together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fired — no destructive operations this session, no main push).

**§4 Step 1c forced-picker FIRED ONCE** — end-of-session next-session scope picker resolved per `feedback_recommendation_style.md` to most-thorough/reliable Recommended option A (Bundled W5 + P-47 deploy).

**ONE DEFERRED item carries to next session as standing carry-over (Rule 26):**

- **Task #1 (carry-over)** `DEFERRED: P-46 W4 Phase-4 real-Chrome verification` — deferred a THIRD consecutive session at director directive *"please defer any real world testing"* (originally deferred 2026-05-26 W4 deploy session + re-deferred 2026-05-24-c + re-deferred 2026-05-24-d today)

THREE prior standing carry-overs RESOLVE at next session's bundled deploy:

- **(prior carry-over from 2026-05-24-c) P-46 W5 deploy session** — bundled into next session's deploy
- **(prior carry-over from 2026-05-24-c) P-46 W5 Phase-4 real-Chrome verification** — bundled into next session's deploy Phase-4 step
- **(new today + immediately bundled) P-47 Session 1 Phase-4 real-Chrome verification** — bundled into next session's deploy Phase-4 step (pairs with W5 Phase-4 since both ship via the same extension form surface)

Tasks #1-#6 all completed in-session.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-24-d** — the P-47 Shadow DOM refactor Session 1 closing §Entry capturing P-47 outcome + NEW Pattern "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid" pairing with P-45 Build #2 §Entry 2026-05-22-i Pattern B as the long-term-fix pairing + LOW informational sub-observation on CSS extraction + template-literal interpolation pattern.

**THIRTIETH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → 2026-05-24-b → 2026-05-25 → 2026-05-26 → 2026-05-24-c → today 2026-05-24-d). The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the bundled W5 + P-47 deploy session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` is BEHIND by 5 commits (today's build commit `d08f673` + today's doc-batch + the 2 prior W5 build commits `3c981be` + `41172f1` + the prior 2026-05-24-c doc-batch `4d0f771`). Verify with `git log main..HEAD --oneline` showing 5 commits ahead. The bundled W5 + P-47 deploy session DOES deploy to main this session — director picks Rule 9 gate at the deploy moment.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish bundled P-46 W5 + P-47 DEPLOY session, on `workflow-2-competition-scraping` → `main`.** Closes **(a.87) RECOMMENDED-NEXT**. Deploy session — ff-merges 3 build commits (`3c981be` W5 URL-form additions + `41172f1` Reviews modal idempotency polish + `d08f673` P-47 Shadow DOM refactor) + the interleaved doc-batch commits from `workflow-2-competition-scraping` to `main`; Vercel auto-redeploys vklf.com; optionally builds a fresh extension `.crx` zip; Phase-4 director real-Chrome verification on Amazon covers BOTH W5 URL-form additions AND P-47 Shadow DOM mount (both ship via the same extension form surface).

DEPLOY session — ONE Rule 9 gate planned. No new code work (all 3 build commits are pre-existing on `workflow-2-competition-scraping`; the deploy session is purely procedural ff-merge + verify). No new npm dependencies. No new schema (W5 consumes already-deployed W1 schema; P-47 is content-script-only).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 5 commits ahead (today's build commit `d08f673` + today's doc-batch + the 2 prior W5 build commits `3c981be` + `41172f1` + the prior 2026-05-24-c doc-batch `4d0f771`).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or deploy mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **P-46 polish-backlog entry** (W5 status section — currently ✅ DONE-AT-CODE-LEVEL 2026-05-24-c — DEPLOY-PENDING; will flip to ✅ DEPLOYED-PHASE-4-PENDING after the bundled deploy) + the **P-47 polish-backlog entry** (currently ✅ DONE-AT-CODE-LEVEL 2026-05-24-d — DEPLOY-PENDING; same flip).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (the W2 deploy session pattern — same mechanics this session) + §B 2026-05-24 (the W3 deploy session pattern with Phase-4 fix-forward cascade) + §B 2026-05-26 (the W4 deploy session pattern with Phase-4 deferred-to-next-session branch) + §B 2026-05-24-c (the W5 build session + the standing carry-overs context).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d (today's P-47 closing entry — context for the Shadow DOM refactor that's part of this deploy bundle).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (the deploy gate that fires once for `git push origin main`) + Rule 14f (will fire at most ONCE at session-start to confirm deploy scope; may also fire at the Rule 9 moment for director-Yes) + Rule 18 (Group B design docs append-only) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — DEPLOY + EXTENSION + UI) + Rule 25 (Multi-Workflow — workflow-2 → main; ff-merge + ping-pong sync) + Rule 26 (DEFERRED items registry — one standing carry-over remains for W4 Phase-4 verify) + Rule 27 (Playwright — TBD per ff-merge bundle content; both build commits touch extension source files so Playwright likely RUN) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (push count + ping-pong pattern; will apply to main this session — deploy push + doc-batch push to main + workflow branch + ping-pong sync per the standard 3-push deploy pattern).
- The CORRECTIONS_LOG §Entry 2026-05-26 (the W4 deploy session pattern — established the deferred-Phase-4-to-next-session branch + Truncated picker response Pattern; director may pick same branch for today's Phase-4 OR run in-session).
- The CORRECTIONS_LOG §Entry 2026-05-24-d (today's P-47 closing entry — the Shadow DOM mount mechanics; for context if any deploy-time verification surfaces issues).

**Task shape (Bundled W5 + P-47 deploy session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or deploy mechanics. Cover: what we'll do in the session (pre-deploy /scoreboard + Rule 9 gate + ff-merge to main + Vercel auto-redeploy + post-merge /scoreboard + optional fresh extension zip + Phase-4 verification or deferral + end-of-session doc-batch + ping-pong sync), schema-change-in-flight flag stays NO, ONE Rule 9 gate planned.

2. **Pre-build reads** — execute the pre-build read list above. ~5-10 minutes.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 5 commits — today's build commit `d08f673` + today's doc-batch + the 2 prior W5 build commits `3c981be` + `41172f1` + the prior 2026-05-24-c doc-batch `4d0f771`).

4. **Rule 14f session-start confirmation** — confirm bundled W5 + P-47 deploy scope is the right scope this session. Per `feedback_recommendation_style.md` recommended path is proceed-to-deploy with full ff-merge + Vercel auto-redeploy + Phase-4. Director picks; if director shifts scope (e.g., wants to add another build commit before deploy, or wants to split into separate W5 deploy + P-47 deploy sessions), fire clarifying picker.

5. **Pre-deploy /scoreboard verify** on `workflow-2-competition-scraping`. Expected 5/5 GREEN at unchanged baselines (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes). Check 6 Playwright — per Rule 27 picker, RUN OR SKIP based on whether Playwright spec coverage exists for the W5 URL-form additions + the P-47 Shadow DOM mount. Most-thorough/reliable per `feedback_recommendation_style.md` is RUN if any spec assertions cover the extension form surface; otherwise SKIP per non-Playwright-coverage convention.

6. **Rule 9 deploy gate** fires for the deploy push to main. Picker offered (A) Deploy now — push to origin/main (recommended) / (B) Hold + investigate first / (C) other. Per `feedback_recommendation_style.md` recommended path is A.

7. **`git push origin main`** executes. Main fast-forwards from `096a2ac` to the latest `workflow-2-competition-scraping` SHA, carrying 3 build commits + the interleaved doc-batch commits.

8. **Vercel auto-redeploy fires** (~2-3 minute build + cache invalidation). Optionally: build a fresh extension `.crx` zip via `npm run build` in `extensions/competition-scraping/` + zip the dist/ output (matches the existing `plos-extension-*.zip` filename pattern at repo root). Name the zip per the canonical pattern: `plos-extension-2026-05-XX-w2-deploy-NN.zip` where XX is today's date letter and NN is the next deploy number (last deploy was #33 on 2026-05-22; today's would be #34).

9. **Post-merge /scoreboard verify** on `main`. Expected 5/5 GREEN at same baselines (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes).

10. **Phase-4 director real-Chrome verification** — covers BOTH W5 URL-form additions AND P-47 Shadow DOM mount on Amazon. Either runs in-session (per the W3 deploy 2026-05-24 Pattern) OR deferred to next session (per the W4 deploy 2026-05-26 Pattern). Director picks at deploy time. **Recommended:** run in-session per `feedback_recommendation_style.md` most-thorough/reliable so the deploy session closes with a ✅ DONE-AND-VERIFIED status (not ✅ DEPLOYED-PHASE-4-PENDING). The 4-step W5 verification walkthrough + a parallel 2-step P-47 verification walkthrough are drafted below in ## Standing carry-overs sections (b) + (c) for copy + execute.

11. **/scoreboard re-verify** if any Phase-4 fix-forwards land in-session (per the W3 deploy 2026-05-24 fix-forward-cascade Pattern). Expected 5/5 GREEN at new baselines after each fix-forward.

12. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 W5 status flip to ✅ DEPLOYED-PHASE-4-PENDING OR ✅ DONE-AND-VERIFIED based on Phase-4 outcome + P-47 status flip same) + CHAT_REGISTRY (header bump — 153rd Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry capturing the deploy outcome + any new reusable Patterns surfaced + any Phase-4 fix-forward cascade narrative) + NEXT_SESSION.md (rewritten for next-session task per session-end forced-picker outcome) + HANDOFF_PROTOCOL (header bump only — likely no new rules) + CLAUDE_CODE_STARTER (header bump only) + Group B doc per session scope (likely `docs/COMPETITION_DATA_V2_DESIGN.md` for the bundled deploy narrative since W5 ships AND `docs/COMPETITION_SCRAPING_DESIGN.md` for the P-47 deploy outcome — TWO Group B docs likely this session). The standing carry-over (W4 Phase-4 verify) must carry forward unchanged into the next NEXT_SESSION.md if not picked up in-session.

13. **Ping-pong sync** — after doc-batch commit lands on `workflow-2-competition-scraping`, ff-merge to `main` + push to `origin/main` so both branches stay in sync. End-of-session 3-push pattern per `feedback_approval_scope_per_decision_unit.md`.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** if any aspect of the deploy bundle feels under-specified (e.g., interleaved doc-batches between the 3 build commits), surface to director via Rule 14f picker BEFORE the `git push origin main` lands.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (no schema work in any of the 3 unshipped build commits).

---

## Standing carry-overs (deferred real-world testing)

The following one real-world-testing item is deferred at director's request. It carries forward across sessions until director picks it up. Preserved verbatim below so any future session can copy + execute without re-deriving the verification mechanics.

The three additional Phase-4 items that previously sat in this section (W5 deploy + W5 Phase-4 verify + P-47 Phase-4 verify) all RESOLVE at next session's bundled deploy — the W5 deploy + P-47 deploy bundle into ONE deploy session; the W5 + P-47 Phase-4 verifies bundle into ONE Phase-4 step (since both ship via the same extension form surface). The W5 4-step + P-47 2-step verification walkthroughs are preserved below in sections (b) + (c) for execute-at-deploy-time.

### (a) P-46 Workstream 4 Phase-4 director real-Chrome verification

**Status:** DEFERRED a THIRD consecutive session (originally deferred 2026-05-26 W4 deploy session; re-deferred 2026-05-24-c; re-deferred 2026-05-24-d today at director directive *"please defer any real world testing that needs to be done by me"*).

**Pre-flight setup:**

- Open Chrome on Mac.
- Open vklf.com.
- Sign in if needed.
- Pick any one Project in your Project list — the W4 page is per-Project not per-platform, so cross-platform exception applies (pick any single Project rather than walking all 7 platforms).

**Step 1 — Navigate from Competition Data to the new Comprehensive Competitor Analysis page.**

Click into the chosen Project. Navigate to Competition Data (`/projects/<projectId>/competition-scraping`). Confirm you see the redesigned Competition Data page from the W3 deploy 2026-05-24 — horizontal `ColumnVisibilityBar` at the top combining platform filters + per-column show/hide toggles + click-to-edit cells + 17 columns + sticky table header + per-row "↗" Open button + drag-to-reorder rows + font-size stepper in the table toolbar. **Above the ColumnVisibilityBar at the top of the page**, look for a standalone "→ Comprehensive Competitor Analysis" navigation button row. **Click that button.** Expected: navigation to `/projects/<projectId>/competition-scraping/comprehensive-analysis/`. **Verify:** the URL bar shows the new path + the page loads without 404 or 501 error.

**Step 2 — Confirm initial page state (empty or existing content).**

The new Comprehensive Competitor Analysis page should load. If you've never written anything for this Project, you'll see an empty-state placeholder (something like "No analysis yet — click Edit to begin"). If you have written content before (which is unlikely for a fresh deploy but possible if any earlier session test-saved content), the existing rich-text content will render in read mode. **Verify:** the page renders cleanly, with a "← Competition Data" back-button visible at the top + an "Edit" toggle button somewhere on the page (likely top-right or top of the editor surface) + a last-edited timestamp footer at the bottom (the timestamp will be blank or show "Never" if the page is empty; otherwise it shows the last write time).

**Step 3 — Toggle into edit mode.**

Click the "Edit" button. Expected: the page transitions from read-mode to edit-mode. The static rendered content is replaced by an editable TipTap rich-text editor with a toolbar at the top. The toolbar should show (per §A.5 + W4 S1's variant='full' toolbar): H1 / H2 / H3 heading buttons + Bold + Italic + Underline + bullet-list + numbered-list + Link + Code block + the new **"Link to URL"** dropdown picker (added in W4 S2). The "Edit" button should now be a "Done" button. **Verify:** the editor mounts without errors + the toolbar shows all expected affordances + cursor lands in the editor surface ready for typing.

**Step 4 — Type body content.**

Click into the editor body. Type a short test paragraph: e.g., **"This is a test comprehensive analysis. Key competitors include the following:"** + press Enter. Now apply some formatting: select the word "Key" + click the Bold button + select "competitors" + click the Italic button. Make a heading: press Enter to start a new line + click the H2 button + type **"Key competitor URLs"** + press Enter. **Verify:** the typed text appears in real-time + Bold + Italic styling applies as expected + H2 heading renders larger than body text.

**Step 5 — Insert an internal hyperlink via the "Link to URL" toolbar dropdown.**

On a fresh line, click the **"Link to URL"** dropdown button in the toolbar. Expected: a dropdown panel opens showing a list of URLs from the current Project's competitor URL list (the same URLs that appear as rows in the Competition Data table). A search box at the top of the dropdown lets you filter case-insensitively. **Type a few characters** of a URL's product name OR seller name OR raw URL — the list filters live as you type. **Click any URL row** in the filtered list. Expected: the dropdown closes + a hyperlink is inserted at your cursor position. The hyperlink's visible text is a sensible default (product name OR seller name OR raw URL, depending on what's available). The hyperlink is styled in **blue underlined text** + has a small **🔗 emoji prefix** in front of it. **Verify:** all of the above + the cursor lands just after the inserted hyperlink ready for more typing.

**Step 6 — Toggle Done (transition to read mode).**

Click the "Done" button (the same button that was "Edit" before). Expected: the page transitions back from edit-mode to read-mode. The editor is replaced by a static rich-text rendering of the same content + the last-edited timestamp at the bottom of the page updates to the current time. **Verify:** the content you just typed renders cleanly in read mode (Bold + Italic + H2 all visually distinct + the 🔗 emoji prefix is still in front of the hyperlink + the hyperlink is still blue underlined).

**Step 7 — Click the rendered hyperlink.**

In read mode, click the rendered hyperlink (the one with the 🔗 emoji prefix). Expected: navigation to the matching URL detail page at `/projects/<projectId>/competition-scraping/url/<urlId>/`. The URL detail page shows the per-URL detail surface from the W2 deploy 2026-05-23-c (with the W2 Session 5 structural fields + Scraping Status toggle + bidirectional mirror with the Competition Data table's Status column). **Verify:** navigation works + the URL detail page loads + the URL detail surface shows the correct URL (the one you clicked).

**Step 8 — Navigate back via the back-button.**

On the URL detail page, click the "← Competition Data" back-button at the top of the page (this is the existing W2 affordance). Expected: navigation back to the Competition Data page (`/projects/<projectId>/competition-scraping`). Now click the standalone "→ Comprehensive Competitor Analysis" button again. Expected: you land back on the new W4 page (`/projects/<projectId>/competition-scraping/comprehensive-analysis/`) + your test content from Steps 4-5 is still there in read mode (because it was saved automatically when you clicked Done in Step 6).

**Step 9 — Toggle into edit mode one more time + verify the editor mounts.**

Click "Edit" again. Expected: editor mounts cleanly + your existing test content is loaded into the editor as editable rich-text + the hyperlink with the 🔗 emoji prefix is still styled correctly + clicking inside the hyperlink shows the standard TipTap Link mark interaction (edit/remove the link). Now click "Done" again without making any changes. Expected: page returns to read mode + the last-edited timestamp at the bottom of the page should update to the current time (since clicking Done triggers a save lifecycle even if no content changed — confirm this updates on every Done click OR document if it doesn't).

**Step 10 — Test the in-line `#url/<urlId>` shorthand syntax (advanced; optional).**

This step tests the "manual shorthand entry" path (the alternative to using the toolbar Link-to-URL picker). Click "Edit" one more time. On a fresh line in the editor, type literally: **the hash character followed by the word url followed by a slash followed by any valid urlId from the URL list, then press space**. Expected: the editor should recognize the shorthand pattern + the typed text should auto-convert to a hyperlink (via the same UrlReferenceExtension that handles the click interception). The result should look identical to the hyperlink you inserted via the picker in Step 5 (blue underlined + 🔗 emoji prefix). **Verify:** this auto-conversion works AND clicking the auto-created hyperlink (after toggling Done) navigates correctly per Step 7. If auto-conversion does NOT happen, that's a known limitation per §C.4's specification — the click interception works on `#url/<urlId>` hrefs regardless of HOW the href was inserted; the toolbar picker is the primary insertion affordance. Document the outcome either way.

**How to report back:**

For each step (1-10), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W4 as ✅ DONE-AND-VERIFIED (if all 10 PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the new Comprehensive Competitor Analysis page is per-Project, not per-platform. Pick any single platform (Amazon OR Ebay OR Walmart OR Etsy OR Aliexpress OR Macys OR Bestbuy) for the verification — there's no need to walk all 7 platforms since the page does not vary by platform.

### (b) P-46 Workstream 5 Phase-4 director real-Chrome verification — bundled into next session's deploy Phase-4 step

**Status:** Bundles with the deploy in next session. The W5 4-step verification walkthrough below + the P-47 2-step walkthrough in section (c) below should run TOGETHER as a single Phase-4 step (both ship via the same extension form surface).

**Pre-flight setup:**

- Open Chrome on Mac.
- Confirm the fresh extension `.crx` is loaded (manually unpack the latest `plos-extension-2026-05-XX-*.zip` from the repo root into `chrome://extensions/` → "Load unpacked" → pick the dist/ directory).
- Open any one competitor platform (Amazon / Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy) — pick the platform with the most-frequent existing URL captures for highest-signal verification.
- Sign in to vklf.com if needed.

**Step 1 — Open the extension URL save form on a competitor page.**

Navigate to a product page on the chosen platform (e.g., an Amazon product page). Trigger the extension's URL save flow — likely via the extension popup OR a content-script affordance per the existing URL save form interaction. **Verify:** the URL save form opens cleanly + shows the existing fields (URL / Platform / Brand Name / Sponsored Ad / etc.) **AND** shows the FOUR new fields between Brand Name + Sponsored Ad: **Type** / **Description-1** / **Description-2** / **Price**. The new fields render as textareas (per `makeTextareaField()` helper from W5 Session 1) with appropriate labels + placeholder hints.

**Step 2 — Fill in the four new fields + save.**

Type sensible test values into each new field: e.g., **Type:** "Product" / **Description-1:** "Test description 1" / **Description-2:** "Test description 2" / **Price:** "$29.99". Fill in the other required fields as usual. **Click Save.** **Verify:** the form submits without error + the URL save flow completes successfully (existing UX — likely a toast notification or form-closes-on-success).

**Step 3 — Confirm the row lands on vklf.com with all 4 new fields populated.**

Open vklf.com → navigate to the Project's Competition Data page (`/projects/<projectId>/competition-scraping`). Find the row for the URL you just saved. **Verify:** the row shows the 4 new fields populated with the values you typed in Step 2. The Type / Description-1 / Description-2 / Price columns should all render the test values. If the Type / Description columns are hidden by default, use the ColumnVisibilityBar to show them.

**Step 4 — Optional: test Reviews modal duplicate-Save behavior to confirm idempotency fix works end-to-end.**

Navigate to a URL detail page (`/projects/<projectId>/competition-scraping/url/<urlId>`). Click "Add Review" to open the `CapturedReviewAddModal`. Fill in a test review (1-5 stars + body + optional reviewer name + date). **Click Save TWICE in rapid succession** (or click Save → wait for error → click Save again). **Verify:** ONLY ONE review row lands in the URL's reviews list (the server-side P2002 dedup now correctly recognizes the duplicate clientId since the modal hoisted clientId to a `useState` instead of regenerating on every Save click).

**How to report back:**

For each step (1-4), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W5 as ✅ DONE-AND-VERIFIED (if all PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the URL save form additions are per-extension not per-platform, so cross-platform exception applies (pick any single platform). Optionally walk the other platforms at director's discretion.

### (c) P-47 Session 1 Phase-4 director real-Chrome verification — bundled into next session's deploy Phase-4 step

**Status:** Bundles with the deploy in next session. Pair with section (b)'s W5 verification — same form surface, same platform pick.

**Pre-flight setup:** same as section (b) above (the form is the same content-script video-capture form; both W5's textarea fields + P-47's Shadow DOM mount ship in the same form).

**Step 1 — Open the extension URL save form on a competitor page + confirm the form opens cleanly.**

Navigate to a product page on the chosen platform (the same page from section (b) Step 1 is fine). Trigger the extension's URL save flow. **Verify:** the URL save form opens cleanly + the form is visible above the page content (the Shadow DOM mount uses `position:fixed` so the form should appear over the page regardless of scroll position) + all form fields are visible + the form chrome (backdrop overlay + form border + buttons) looks the same as before the refactor (the CSS extraction into `FORM_CHROME_CSS` is a single source of truth — if it looks different, that's a regression).

**Step 2 — Confirm form interaction works cleanly with the Shadow DOM mount + no page-level focus interference.**

Click into each text input + textarea in turn (URL / Platform / Brand Name / Type / Description-1 / Description-2 / Price / Sponsored Ad / etc.). For each: **Type some characters.** **Verify:** the text appears in the input + the input retains focus while typing + clicking outside the input + back into it returns focus cleanly + the page-level scroll position does NOT shift when you click into an input + the page background does NOT steal focus from the form. Specifically test on Amazon (the platform where the original Issue 2 focus-stealing problem surfaced — if Amazon works cleanly with the band-aid removed + Shadow DOM in place, that's the strongest signal the refactor preserved the band-aid's behaviour). **Press Escape:** **Verify:** the form closes cleanly (the Escape-to-close `keydown` listener stays on `document` and keydown events from inside the shadow root compose up through the host into the document tree, so the listener catches them).

**How to report back:**

For each step (1-2), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close P-47 as ✅ DONE-AND-VERIFIED (if both PASS) or initiate a fix-forward cascade (if either FAIL or PARTIAL).

**Cross-platform note:** the original Issue 2 focus-stealing was Amazon-specific; Amazon is the canonical verification target. Optionally walk Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy at director's discretion for breadth.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next bundled W5 + P-47 deploy session:** none. The deploy session's mechanics are all in-Claude (ff-merge + Vercel auto-redeploy + fresh extension zip build). Director's involvement is the standard go-ahead after the Step 7b plain-terms summary + the Phase-4 real-Chrome verification on Amazon after the deploy lands (if Phase-4 runs in-session per director's pick at deploy time).

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the bundled deploy session at all — can happen any time. Director-independent.

**Optional offline reading for director:** the P-46 polish-backlog entry in ROADMAP.md (the W5 section + the workstream-status overview) + the P-47 polish-backlog entry in ROADMAP.md (~line 237 — the canonical scope-and-where description with cross-references to P-45 Build #2's Issue 2 fix narrative). ~3-5 minute skim.

**Pre-session setup (informational — Claude will handle in-session):** the bundled W5 + P-47 deploy session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the Rule 9 deploy gate pick at the deploy moment + the Phase-4 real-Chrome verification on Amazon after the deploy lands (if Phase-4 runs in-session).

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). The bundled deploy is additive ff-merge from `workflow-2-competition-scraping` to `main`.

**Rule 9 triggers planned this session: ONE** — `git push origin main` for the bundled deploy. Rule 9 picker fires once + director-Yes per `feedback_recommendation_style.md` most-thorough/reliable recommended path.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any deploy mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session was the **P-47 Shadow DOM refactor Session 1** — pure-code structural refactor of the content-script video-capture-form mount strategy from the 80-event-listener band-aid (shipped in P-45 Build #2 commit `ee8c79d` 2026-05-22-i) to proper Shadow DOM isolation. The refactor landed cleanly via build commit `d08f673` (2 files +203/-220, net -17 LOC). 5/5 GREEN at unchanged baselines.

At end-of-session, director picked the **bundled W5 + P-47 deploy** option from the §4 Step 1c picker over P-26 below-fold scroll capture + P-43 mechanical prevention + question-first. Recommended per `feedback_recommendation_style.md` since the unshipped-to-main queue is now 3 build commits (W5 build + Reviews polish + P-47 Shadow DOM) and one deploy session ff-merges all 3 + Vercel auto-redeploy + fresh extension zip + Phase-4 covers BOTH the W5 URL-form additions AND the Shadow DOM mount on Amazon (same extension form surface).

The natural next-session task per (a.87) RECOMMENDED-NEXT is the **bundled W5 + P-47 deploy session** — ff-merges 3 build commits to main + Vercel auto-redeploy + fresh extension zip + Phase-4 real-Chrome verification.

- **(Recommended)** Bundled W5 + P-47 deploy session — ff-merge + Vercel auto-redeploy + Phase-4. Recommended because (a) director explicitly picked this at the end-of-session picker; (b) one deploy session ships everything in the unshipped queue under ONE Rule 9 gate + ONE Phase-4 step; (c) low-risk since all 3 build commits already passed 5/5 GREEN at their respective build sessions; (d) closes 3 prior standing carry-overs in ONE session.

The shape of the bundled deploy session is **pre-deploy /scoreboard + Rule 14f session-start confirmation + Rule 9 deploy gate + ff-merge to main + Vercel auto-redeploy + post-merge /scoreboard + optional fresh extension zip + Phase-4 verification or deferral + end-of-session doc-batch + ping-pong sync + 3 pushes total**.

**After the bundled deploy ships,** the ONLY remaining standing carry-over is W4 Phase-4 verify (fourth-consecutive-defer territory unless director picks it up at the bundled deploy session).

**Alternate next-session candidates if director shifts priorities at session start:**

- **Pick up W4 Phase-4 verification** from ## Standing carry-overs section (a). NOT recommended unless director is ready for real-world testing — director explicitly deferred this at session-start AND mid-session AND end-of-session. The 10-step walkthrough is preserved verbatim above for copy + execute when director is ready.
- **Split the bundled deploy into separate W5 deploy + P-47 deploy sessions.** NOT recommended — the bundled deploy was explicitly picked by director at end-of-session; splitting adds 1-2 extra sessions for the same Phase-4 outcome. Bundling is cheaper.
- **P-46 Workstream 5 Session 2 (optional polish — TBD).** NOT recommended this session — W5 Session 1 (2026-05-24-c) covered the user-visible scope; Session 2 may be redundant. Director picks at the bundled deploy session whether to scope additional W5 work before the deploy.
- **P-26 below-fold scroll capture (LOW).** NOT recommended — was option B at today's end-of-session picker; not picked. Can happen any time after the bundled deploy.
- **P-43 mechanical prevention candidate.** NOT recommended — was option C at today's end-of-session picker; not picked. LOW informational; not blocking any workstream; can happen any time.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the P-46 + P-47 polish-backlog entries for the binding scope-and-where descriptions. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (W2 deploy pattern) + §B 2026-05-24 (W3 deploy pattern) + §B 2026-05-26 (W4 deploy pattern) for the canonical deploy session shapes — today's bundled W5 + P-47 deploy follows the same shape with the addition that 3 build commits ship together instead of just 1 workstream's worth.
