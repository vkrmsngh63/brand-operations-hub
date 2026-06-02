# Next session

**Written:** 2026-06-02-e (`session_2026-06-02-e_p56-amazon-highlight-flicker-pause-while-selecting` — W#2 polish P-56 — the Amazon "Highlight Terms" flicker that was BLOCKING text selection for capture is FIXED ✅ DEPLOYED-AND-VERIFIED end-to-end on real Amazon (real-Chrome) via `workflow-2-competition-scraping` → `main` (director verbatim "pass") — **P-56 is now CLOSED.** EXTENSION-ONLY change; NO vklf.com user-facing change; NO schema change; NO new PLOS route. `main` went `71645bc → 802224f`. **Closes (a.126) = P-56 ✅ DEPLOYED-AND-VERIFIED → P-56 CLOSED. Opens (a.127) RECOMMENDED-NEXT = P-58** (Download-Extension-zip serves the LATEST build; MEDIUM — makes the in-app extension download carry the P-56 fix + every future build without a hand-built sideload zip) on `workflow-2-competition-scraping` — this was the director's §4 Step 1c forced-picker choice. **FIRST action next session = read `docs/polish-item-specs/P-58-*.md` if it exists; CREATE the spec per Rule 31 if it does not exist yet (it may not); design WITH the director if the scope is non-trivial.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the FIFTH session of 2026-06-02 (suffix `-e`); the prior REAL sessions today are `session_2026-06-02` (no suffix) + `session_2026-06-02-b` (P-55 Phase 2b-ii) + `session_2026-06-02-c` (the three trimmed export variants) + `session_2026-06-02-d` (P-55 Phase 3 primer wiring + editable primer + graduation methodology). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-58 (the in-app Download-Extension-zip serving the latest build) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session's build deploy (`802224f`) is on main. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `802224f` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session stayed NO the entire time (extension-side DOM-timing fix; no `prisma db push`). **P-58 is a build-pipeline / download change — NO schema change anticipated.** If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** P-56 was director-verified on real Amazon this session ("pass"). There is NO owed verification carried into next session. P-58 is a NEW unit.

> ⚠️ **P-58 SPEC MAY NOT EXIST YET — FLAG.** The P-58 spec doc (`docs/polish-item-specs/P-58-*.md`) may NOT have been created yet — P-58 was captured as a ROADMAP entry in the 2026-06-02-d capture batch, but a per-item spec doc was confirmed-created only for P-56 / P-61 / P-62 that batch. **First action: check for the P-58 spec; if missing, CREATE it per Rule 31 (capture the verbatim director directive + the joint design decisions BEFORE coding).**

---

## What we did this session (in plain terms)

This session fixed the Amazon "Highlight Terms" flicker that was getting in the way of capturing text.

**First we ran a small diagnostic on a real Amazon product page** (you ran it for me in your browser) to see exactly what was happening with the flickering highlights. The trace showed something important: the fix we made earlier (a "skip the re-draw if nothing changed" shortcut) is actually working correctly — but Amazon's page is genuinely adding new text to itself roughly every 2 seconds, so the highlighter correctly re-draws itself, and that re-draw was cancelling your text selection right while you were dragging across the words. So the real problem wasn't a broken shortcut — it was a correct re-draw landing at the wrong moment.

**Then, with your go-ahead on the approach, we made the highlighter politely wait.** Now, whenever you're actively selecting text, the highlighter pauses its re-draw and resumes the instant you finish selecting. So you can now select a sentence that contains a highlighted word and save it as captured text without the selection getting wiped. **You verified it on real Amazon: "pass."**

**One small trade-off you chose:** there's still a faint flicker when you're just reading (not selecting) — we deliberately left that for now. If it bothers you, there's a more-thorough follow-up option ("only re-draw the bits that changed") we can do later.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-56 entry now ✅ CLOSED + the P-57..P-62 entries) + `docs/polish-item-specs/` (the per-item specs).

- **(a.127) = P-58** — Download-Extension-zip serves the LATEST build (MEDIUM). **NEXT SESSION (see below).**
- **(P-57)** fill the delete-coverage gaps (reviews / videos / category-labels) — MEDIUM.
- **(P-59)** update the existing `DetailedUserGuide.tsx` — LOW/MEDIUM.
- **(P-60)** add the open-detail ↗ icon to the 3 analysis tables' Product Name column — LOW.
- **(P-61)** extension server-side default categories per platform per content-type (spec doc) — MEDIUM.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page with the verbatim 5-question checklist (spec doc) — future-workflow.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55's grouped spreadsheets; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 closed + P-55 essentially closed + P-56 closed); director's discretion.

## What we'll do next session (in plain terms)

1. **We make the "Download Extension" button inside the app serve the newest version of the extension automatically** — so you (and anyone else) can download the latest build, including today's Amazon flicker fix, straight from the app, without me hand-building a file each time.
2. **We agree the approach with you BEFORE writing code if it's non-trivial** — there may be a small design decision about where the latest build lives and how the download stays current (build step, storage location, etc.).
3. **As always:** once it's wired, we scoreboard-verify, and (if there's any live-site piece) verify together on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-56 (Amazon Highlight Terms flicker blocks text selection) — ✅ CLOSED 2026-06-02-e.** Fixed + verified on real Amazon; the only residue is the optional "kill the idle flash too" Option-2 follow-up.
- **P-58 (Download-Extension-zip serves the latest build) — NEXT, MEDIUM.** The next pick.
- **P-57 / P-59 / P-60 / P-61 / P-62 (NEW captures)** — delete-coverage gaps / DetailedUserGuide update / open-detail ↗ icon on the 3 analysis tables / extension default categories / the Workflow-11 surveillance card+page. Mostly MEDIUM/LOW or future-workflow.
- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — ✅ ESSENTIALLY COMPLETE 2026-06-02-d.** Only the absorbed P-53 on-page button could remain.
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary** — SUPERSEDED for its UI dimension by P-55; the `ReviewAnalysis.PER_PROJECT` slot stays unused.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 done); director's discretion. The NEW continuity primer + `./catch-up-workflow 2` mechanism support it.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11).
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-56 — the Amazon "Highlight Terms" flicker blocking text selection for capture is FIXED — ✅ DEPLOYED-AND-VERIFIED 2026-06-02-e** on real Amazon (real-Chrome) via `workflow-2-competition-scraping` → `main`; director verbatim verdict "pass". `main` went `71645bc → 802224f` (one clean ff-merge of the exact verified commit). **A DIAGNOSE-then-BUILD-then-DEPLOY session: ONE build (`802224f`), ONE deploy, ONE Rule 9 deploy gate (director "Deploy to main"), THREE Rule 14f pickers (fix-shape design + the deploy gate + the §4 Step 1c next-pick), all Recommended/Yes. EXTENSION-ONLY; NO schema change; NO new route.**

**Session shape (diagnostic trace → fix design → build → deploy → real-Amazon verify → end-of-session doc-batch):**

- **The diagnostic trace (FIRST action):** the director ran `docs/p-20-trace-script.js` on a real Amazon PDP (product B07V57NDNC). Results over 30.0s: ~145 MutationRecord batches; 134 nodes added (4.5/sec); 100 removed (3.3/sec); **~137,358 chars of new text added (~4,576 chars/sec)**; **~14 would-be `refresh()` rescans at the 250ms throttle (~0.47/sec — one every ~2s)**; top added tags LI:43, DIV:34. **The trace DISPROVED the assumed root cause:** the P-20 fingerprint short-circuit is NOT broken — it works as designed; Amazon legitimately adds matchable text ~every 2s, so a *correct* full-page strip-and-reapply of the `<mark>` overlay fires mid-drag and collapses the in-progress selection. Strengthening the fingerprint can't help because the re-applies are legitimate — so the fix redirected to "protect the active selection."
- **The fix (`802224f`, director-picked "Pause while selecting"):** in `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts`, `refresh()` now defers the strip-and-reapply whenever `window.getSelection()` is a non-collapsed, non-empty text selection; a document `'selectionchange'` listener re-runs the deferred refresh the moment the selection clears; `lastFingerprint` is left untouched while deferred so the pending highlight work is preserved. NEW exported pure helper `isActiveTextSelection` (DOM-free; takes a Selection-shaped snapshot) — +5 extension unit tests. **Trade-off:** residual faint flicker when merely READING is deliberately left alone per the chosen Option 1; the "redraw only changed text" Option-2 is the available follow-up.
- **The deploy:** ONE Rule 9 deploy gate (director "Deploy to main"); `main` went `71645bc → 802224f` (clean ff-merge of the exact verified commit). Fresh sideload zip `plos-extension-2026-06-02-w2-p56-amazon-flicker-1.zip` (218 KB) at repo root — the director sideloaded + real-Amazon verified this exact artifact.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + 1 Group B polish-item-spec (P-56) + a NEW §B 2026-06-02-e note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the VERIFICATION_BACKLOG + PRIMER updates. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-58) = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY; all in-session work completed. P-57..P-62 are the documented roadmap continuation (P-58 = the (a.127) pick), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **915/915** (+5 from 910 — the new `isActiveTextSelection` tests) + src/lib `node:test` = **1353/1353 UNCHANGED** (extension-side work) + `npm run build` = **72 routes UNCHANGED** (no new route); Check 6 Playwright SKIPPED per Rule 27 (real-Amazon DOM-timing = director real-Chrome verification).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-e** (no top-tier slip — the deploy passed; the director verified on real Amazon) capturing: (a) **the diagnostic-trace-first methodology disproved the assumed root cause** — the trace showed the P-20 short-circuit works as designed and the flicker/selection-break comes from *legitimate* re-applies, redirecting the fix from "strengthen the fingerprint" to "defer-while-selecting"; (b) NEW reusable PATTERN — "protect an active text selection by deferring DOM-mutating overlay refreshes until `selectionchange` reports the selection cleared"; (c) a minor real-site console-trace handoff-clarity note. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**1 MODIFIED Group B polish-item-spec** — `docs/polish-item-specs/P-56-amazon-highlight-flicker-blocks-selection.md` (Status → ✅ DEPLOYED-AND-VERIFIED 2026-06-02-e; §2 joint-discussion entry with the real trace numbers; §3 diagnosis recorded; §4 open questions RESOLVED) + a NEW §B 2026-06-02-e note in `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (the P-20 deferred real-Amazon verification now RESOLVED via P-56) + `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 open-items — P-56 now CLOSED). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED.

**ROADMAP P-56 polish-backlog entry flipped** to ✅ SHIPPED-AT-DEPLOY-LEVEL + DEPLOYED-AND-VERIFIED + CLOSED (with the trace narrative + the original capture preserved) + (a.126) CLOSED / (a.127) opens.

**SEVENTIETH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive-class ops — no `prisma db push`, no `migrate reset`, no drop, no deletes outside normal build output. The only artifact produced was a fresh extension sideload zip (a normal build artifact). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-58):** **NO schema change anticipated** — P-58 is a build-pipeline / in-app-download change. If a build unexpectedly needs a field or a storage migration, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-56 + P-58 specs (P-58 may need creating) + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-58 (the in-app Download-Extension-zip serving the latest build) is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `802224f` (the P-56 deploy) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root (now including `plos-extension-2026-06-02-w2-p56-amazon-flicker-1.zip`).

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55 + P-56 + P-58, read §2 + §3 of each at session start — ESPECIALLY P-58):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate; **also the "CREATE the spec if missing" guarantee — applies to P-58**) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 33 (workflow graduation continuity) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-58-*.md`** — the SOURCE-OF-TRUTH for P-58 IF IT EXISTS. **If it does NOT exist, CREATE it per Rule 31** (capture the verbatim director directive from the ROADMAP P-58 entry + the joint design decisions BEFORE coding). The ROADMAP P-58 entry (search "P-58" in `docs/ROADMAP.md`) is the captured directive to start from.
- **The in-app extension-download surface** — read the current "Download Extension" download path/component + how the zip is built (`extensions/competition-scraping` build + zip step) so you understand where "the latest build" must come from and how the in-app download currently serves it.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-e (this session — the trace-first methodology disproved the assumed root cause; the defer-while-selecting PATTERN) + §Entry 2026-06-02-c (the P-43 cwd-leak recurrence) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — if P-58's scope is non-trivial, design it WITH the director BEFORE coding; act only on verbatim directives.
  - **`feedback_default_to_recommendation.md`** + **`feedback_recommendation_style.md`** — recommend the most-reliable option; skip the forced-picker when only re-confirming a default-approved recommendation.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-58-*.md` (the source-of-truth, IF it exists — CREATE it per Rule 31 if missing).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.127) = P-58 — make the in-app "Download Extension" serve the LATEST build):** the in-app extension download should always carry the newest extension build (including today's P-56 Amazon flicker fix) without a hand-built sideload zip. This is MEDIUM priority and was your §4 Step 1c forced-picker choice. **P-56 is CLOSED — do NOT reopen it unless you raise the optional "kill the idle flash too" Option-2 follow-up.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root, incl. plos-extension-2026-06-02-w2-p56-amazon-flicker-1.zip)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 802224f + the 2026-06-02-e doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST step (the P-58 spec — BEFORE any build):** check for `docs/polish-item-specs/P-58-*.md`. **If it exists,** read §2 + §3 fully. **If it does NOT exist,** CREATE it per Rule 31 — capture the verbatim director directive (from the ROADMAP P-58 entry) in §1, the joint design decisions in §2, the consolidated spec in §3, the open questions in §4, and the cross-refs in §5 — BEFORE writing any code.

**Fix/feature shape (design WITH the director BEFORE coding if non-trivial):** P-58 likely has a small design decision — where the latest build lives (built-on-deploy artifact vs. checked-in zip vs. on-demand build) + how the in-app "Download Extension" link stays current. Plan the shape WITH me per `feedback_plan_output_shape_before_building`; if it is a trivial wiring change of an existing download to point at the freshest artifact, `feedback_default_to_recommendation` applies (skip the forced-picker; describe the shape + go-ahead).

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion ONLY if there is a real design fork (e.g. build-on-deploy vs. commit-the-zip vs. generate-on-download). If the recommendation is obvious and already default-approved, describe it plainly and proceed.

**Test coverage decision:** add unit coverage for any new pure helper (e.g. a "resolve latest build artifact" helper); the live download behavior is verified via the director (download the zip from the app → confirm it is the newest build). Check 6 Playwright per Rule 27 (likely SKIPPED — file-download + visual judgment).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED unless P-58 touches extension build config — re-run after edits)
- Extension `npm test` ≥ 915 (entry 915; +N for any new helper tests)
- src/lib `node:test` = 1353 (likely UNCHANGED — confirm)
- `npm run build` = 72 routes (UNCHANGED unless P-58 adds a download/serving route — confirm; +1 if a new route is added)
- Check 6 Playwright SKIPPED per Rule 27 (file-download = visual judgment)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale; especially important if you `cd` into the extension directory for a build/zip.

**Deploy mechanics:** if P-58 has a PLOS-side serving piece (the in-app download endpoint/link), it ships via the standard Rule 9 gate + 3-push pattern to vklf.com, director-verified. If P-58 also re-builds the extension zip artifact, produce a fresh `plos-extension-2026-06-0X-w2-...zip` at repo root. Expect 1+ Rule 9 deploy gates.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for P-58. If a field/migration is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-58 entry status update + (a.127) status + CHAT_REGISTRY header bump (193rd session) + DOCUMENT_MANIFEST header + flags + the schema-change-in-flight transition + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-58 spec (create if missing; mark the feature shipped/verified) + `docs/COMPETITION_SCRAPING_DESIGN.md` (a §B note if the extension-download/build design materially changes) + `docs/REVIEWS_PHASE_2_DESIGN.md` (likely UNCHANGED).

**Standing carry-overs into this session:**

- **(a.127) = P-58** — Download-Extension-zip serves the LATEST build. Read/CREATE the P-58 spec FIRST; design WITH me if non-trivial; the in-app download must always carry the newest build.
- **P-57 / P-59 / P-60 / P-61 / P-62** — the other NEW captures (delete-coverage gaps / DetailedUserGuide update / open-detail ↗ icon / extension default categories / the Workflow-11 surveillance card+page). Behind P-58.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" (redraw only changed text) for the residual reading-time flicker; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — now schedulable (P-54 + P-55 + P-56 done); the NEW continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion.

---

## Why this pointer was written this way (debug aid)

- **(a.127) = P-58 is the PICK because it was the director's §4 Step 1c forced-picker choice this session.** With P-56 closed, the director picked P-58 (the in-app download serving the latest build) over the other MEDIUM/LOW captures — it directly capitalizes on the P-56 fix by making the newest extension reachable in-app.
- **The FIRST action is the P-58 spec, not code.** P-58 was captured as a ROADMAP entry but a per-item spec was confirmed-created only for P-56 / P-61 / P-62 in the 2026-06-02-d batch — so the P-58 spec may not exist yet. Rule 31 requires the spec as the source-of-truth before building; create it if missing.
- **Design the shape WITH the director if non-trivial.** "Latest build" can mean build-on-deploy vs. checked-in zip vs. generate-on-download — a real fork worth a Rule 14f picker. If the recommended path is obvious + default-approved, skip the picker per `feedback_default_to_recommendation`.
- **This MAY be extension + PLOS work** — if it touches the extension build/zip, re-run extension tsc + extension `npm test` and watch the P-43 cwd-leak when switching builds; if it touches the in-app download surface, it deploys to vklf.com under the standard Rule 9 gate.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (extension-side fix, no `prisma db push`); P-58 is a build/download change with no anticipated schema change.
- **Nothing is held back** — the P-56 deploy is on main, and the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.127.alt1) P-58** (current PICK — pre-loaded above). Download-Extension-zip serves the latest build; read/CREATE the P-58 spec first; design WITH the director if non-trivial; on `workflow-2-competition-scraping`.
- **(a.127.alt2) P-57 fill the delete-coverage gaps** (reviews / videos / category-labels; MEDIUM; on `workflow-2-competition-scraping`).
- **(a.127.alt3) P-61 extension server-side default categories per platform per content-type** (MEDIUM; spec exists; design schema + overlay UX WITH the director; on `workflow-2-competition-scraping`).
- **(a.127.alt4) P-60 add the open-detail ↗ icon to the 3 analysis tables' Product Name column** (LOW; quick UI follow-up; on `workflow-2-competition-scraping`).
- **(a.127.alt5) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual reading-time flicker; on `workflow-2-competition-scraping`).
- **(a.127.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.127.alt7) W#2 graduation** (now schedulable — P-54 + P-55 + P-56 done; the continuity primer + `./catch-up-workflow 2` mechanism support it; director's discretion).
