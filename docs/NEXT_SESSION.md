# Next session

**Written:** 2026-06-02-c (`session_2026-06-02-c_p55-without-individual-reviews-export-variants` — W#2 polish P-55 CONTINUED — THREE NEW "without individual reviews" download buttons added to the "Comprehensive Competitive Analysis Files" box on `/comprehensive-analysis` (the three reviews spreadsheets, trimmed of every per-individual-review column) ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director real-Chrome verdict: "pass"), PLUS the four-file Comprehensive Analysis Files export verification that was DEFERRED at 2026-06-02-b is now CLOSED — director verified all four on vklf.com: ALL FOUR PASS. `main` went `d7c8894 → 8420739`. **Closes (a.124) carry-forward 1 — director verification of the four exports: all four PASS. Opens (a.125) RECOMMENDED-NEXT = P-55 Phase 3 part 2 (the primer .docx + "Insert primer" editor button + Files-box entry)** on `workflow-2-competition-scraping`. **FIRST action next session = confirm whether `.docx` generation needs a new library (e.g. `docx`) + flag it at that build.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the THIRD session of 2026-06-02 (suffix `-c`); the prior REAL sessions today are `session_2026-06-02` (no suffix — the P-55 comprehensive-analysis-files-and-main-table-additions session) + `session_2026-06-02-b` (P-55 Phase 2b-ii). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** The single build this session (`8420739`) is on main; the previously-held-back Phase 3 part 1 primer content generator (`dfa4af1`) landed on main inert via the 2026-06-02-b doc-batch ff-merge and is already there. After this session's end-of-session doc-batch ff-merge, `main` and `workflow-2-competition-scraping` are both at `8420739` + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session STAYED NO the whole way (zero `prisma db push`) — the trimmed-export variants were client-side download generation reusing existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + each URL's `/reviews`). Phase 3 part 2 (the primer `.docx` + "Insert primer" button + Files-box entry) is generated on the fly + inserts into the existing editor — NO schema change anticipated. If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization BEFORE any `prisma db push`.

> ⚠️ **THE FOUR-FILE VERIFICATION IS DONE — DO NOT RE-ASK IT.** The director verified all four original Comprehensive Analysis Files exports on vklf.com this session (all four PASS), AND verified the three new "without individual reviews" variants ("pass"). There is NO owed verification carried into next session. The first action next session is the Phase 3 part 2 build (after the standard plan-with-director step), beginning with the `.docx`-library question below.

---

## What we did this session (in plain terms)

This session did two things on your "Comprehensive Analysis" page.

**First, you signed off on the four spreadsheets we deployed last session.** You downloaded all four files (and the .zip) from the "Comprehensive Competitive Analysis Files" box and confirmed every one looks right — same columns and order as the on-screen tables, all the click-to-expand details included, every stacked row split out, and always up to date. **All four passed.** (That sign-off was the one thing owed from last session.)

**Then you asked for three more files** — summary-only versions of the three reviews spreadsheets that LEAVE OUT the individual-customer-review detail. We built them and they are now live on vklf.com (you verified: "pass"). So the box now offers SEVEN files:

- the four full spreadsheets you already had (unchanged), PLUS
- **Competition Reviews Analysis without individual reviews** — one row per competitor, with the individual reviews and their stars/summary stripped out, keeping the competitor's identity columns and the two overall AI summaries.
- **Reviews Analysis By Competitor Category without individual reviews** — grouped by category, with the per-review detail removed: one short summary row per category, then one row per competitor.
- **Reviews Analysis By Competitor Type without individual reviews** — the same, grouped by type.

"Download all (.zip)" now bundles all seven, and every file still rebuilds fresh from your live data each time you click.

Before building, we asked you one quick question — for the flat "Competition Reviews Analysis" file, whether to drop just the three columns you named or ALL the per-review detail; you chose to drop ALL of it (a clean one-row-per-competitor view).

We have STILL not wired up the teaching "primer" — that is the next (and last) piece of this feature. We wrote and you approved its text two sessions ago; we just need to make it downloadable as a Word document and add an "Insert primer" button to your editor.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-55 entry — 🟢 IN PROGRESS) + `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth spec).

- **(a.125) = P-55 Phase 3 part 2** — the primer `.docx` + "Insert primer" editor button + Files-box entry. The content generator + approved wording are already committed (on main inert at `dfa4af1`); only the wiring remains. **NEXT SESSION (see below).**
- **(P-53) Excel "Export Table" for the Category + Type pages** — effectively ABSORBED by P-55's grouped spreadsheets. Only a separate on-page button would remain, LOW priority.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; the cwd-leak recurred AGAIN in this session's scoreboard (caught + corrected); running tally ~32-35+. Single-session fix; a good palate-cleanser.
- **(optional refinement) editable banner category/type/group name** on the grouped pages + the main table.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable now that P-54 is closed + once P-55 finishes (director's discretion).

## What we'll do next session (in plain terms)

1. **We wire up the teaching "primer"** you approved two sessions ago — so you can download it as a Word document from the Files box, AND insert it into your editor with an "Insert primer" button (re-clickable to refresh; not a fixed header, not auto-inserted).
2. **First we confirm one technical thing** — whether making a Word (.docx) file needs us to add a small software library; if so we will flag it and add it (no database change).
3. **As always:** we agree the plan with you first, scoreboard-verify, deploy, and verify with you on vklf.com. When the primer ships, P-55 is essentially DONE.

## What's still left in the total roadmap (in plain terms)

- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — 🟢 IN PROGRESS.** Phases 1 + 2a + 2b-i + 2b-ii shipped + VERIFIED (the "Overall Competitor Analysis" column, the Files box, all FOUR full competition spreadsheets, AND the three "without individual reviews" summary-only variants — SEVEN files total, all always-fresh + table-matching). Phase 3 part 1 (the primer content + approved wording) is committed but unwired. REMAINING: Phase 3 part 2 (the primer .docx + "Insert primer" button + Files-box entry) — the ONLY open P-55 unit.
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary on `/comprehensive-analysis`** — SUPERSEDED for its UI dimension by P-55 (prepare-materials-+-primer instead of an in-app AI-summarize button); the `ReviewAnalysis.PER_PROJECT` slot stays unused.
- **P-53 Excel "Export Table" for the Category + Type pages** — effectively ABSORBED by P-55; LOW priority residue (an on-page button) only.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~32-35+ (it recurred AGAIN this session). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — schedulable once P-55 finishes (director's discretion).
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-55 CONTINUED — three NEW "without individual reviews" trimmed-export variants + the four-file export verification CLOSED — ONE deploy ✅ DEPLOYED-AND-VERIFIED 2026-06-02-c** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director real-Chrome verdict "pass" on the three new files AND all four original exports. `main` went `d7c8894 → 8420739` (one clean ff-merge). **A BUILD + DEPLOY session: ONE build, ONE deploy, ONE Rule 9 deploy gate (director Yes), plus ONE pre-coding AskUserQuestion design picker.**

**Session shape (verify-the-four → 1 build + 1 deploy + end-of-session doc-batch):**

- **FIRST — the four-file verification (owed from 2026-06-02-b):** the director downloaded all four Comprehensive Analysis Files exports (and the .zip) on vklf.com and confirmed each mirrors its on-screen table — columns + order, click-to-reveal data, sub-rows split out, fresh on click. **All four PASS.** (carry-forward 1 CLOSED.)
- **THEN — the NEW directive (`8420739`):** three "without individual reviews" download buttons added to the Files box (the three reviews spreadsheets, trimmed of every per-individual-review column). The box now lists SEVEN files (the original four UNCHANGED + the three trimmed variants); "Download all (.zip)" bundles all seven; every file rebuilds fresh from live data on each click. Director real-Chrome verdict: "pass."
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 1 Group B polish-item-spec (P-55) + a NEW §B 2026-06-02-c note in `docs/COMPETITION_SCRAPING_DESIGN.md`. **This doc-batch commit ff-merges to main per the standard 3-push pattern.**

**The trimmed variants (what shipped):**
- **Competition Reviews Analysis without individual reviews** — one row per competitor; drops EVERY per-review column (Stars, the Reviews Summary count, AND the flat file's per-review Review / Reviewer / Date / Review Summary); keeps Platform / Category / Type / Product Name / Results Rank / Comp. Score / URL + the two Comprehensive summaries.
- **Reviews Analysis By Competitor Category without individual reviews** — drops Stars / Reviews Summary / Source Reviews; one short banner row per category (its two Category Comprehensive summaries) above one row per competitor.
- **Reviews Analysis By Competitor Type without individual reviews** — same, Type-grouped.

**Implementation:** a `withoutIndividualReviews` opt added to `buildReviewsAnalysisExportMatrix` + `buildGroupedReviewsAnalysisExportMatrix` / its two wrappers `buildCategoryReviewsAnalysisExportMatrix` / `buildTypeReviewsAnalysisExportMatrix` in `comprehensive-analysis-exports.ts` (registry-driven column filtering drops `stars` / `reviewsSummary` / `catSourceReviews`|`typeSourceReviews`, skips the per-source-review banner rows, collapses per-review row expansion to one row per competitor) + 3 new FileDescriptors + 3 download handlers + 3 trimmed array-buffer builders + the 3 files added to the zip in `ComprehensiveAnalysisFilesBox.tsx` (the inline button-onClick ternary refactored into a `downloadHandlers` record). Registry-driven filtering keeps the trimmed files pinned to their source tables (memory `feedback_exports_include_all_table_data`).

**ONE Rule 9 deploy gate — director "Yes — deploy to main." Plus ONE pre-coding AskUserQuestion design picker** (how far to trim the FLAT file → "Drop ALL review detail (recommended)").

**Schema-change-in-flight flag NO at entry → STAYED NO → NO at exit** — zero `prisma db push` this session; client-side export variant + reused existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + each URL's `/reviews`). **NEXT session = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26):** 4 tasks created in-session (trimmed builders / wire buttons / tests / scoreboard+deploy) — ALL completed. The four-file verification carry-forward from 2026-06-02-b is CLOSED (all four PASS). Phase 3 part 2 is the documented roadmap continuation (the (a.125) pick), NOT a TaskList DEFERRED item.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **910/910 UNCHANGED** (zero extension change all session) + src/lib `node:test` = **1335/1335** (+5 from 1330 — flat trimmed header + one-row collapse; category trimmed header + wrapped indexes; type trimmed Type↔Category swap preserved; grouped one-banner-row + one-row-per-competitor) + `npm run build` = **71 routes UNCHANGED** (downloads client-side; no new route); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only; file-download + visual judgment = director real-Chrome verification — consistent with all prior P-55 sessions).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-c** (no top-tier slip — the one design fork was resolved cleanly via an AskUserQuestion picker; the deploy passed; the director verified) capturing a RECURRENCE of the **P-43 working-directory-leak** during the pre-deploy scoreboard: a Check-2 `cd …/extensions/competition-scraping` leaked the Bash cwd, so the subsequent Check-5 `npm run build` ran in the extension directory → route count 0; caught immediately (route count 0 = tell-tale) and re-run from an absolute `cd /workspaces/brand-operations-hub` → 71 routes confirmed; this is exactly the open P-43 mechanical-prevention item; P-43 tally bumped ~32-35+. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session** — covered by the existing `feedback_exports_include_all_table_data`.

**1 MODIFIED Group B polish-item-spec** — `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the verbatim directive appended to §1; the joint-discussion trim-depth adjustment added to §2; §3.B updated to SEVEN files + the trimmed-variant column rules; §4 "without individual reviews" scope RESOLVED; Phase 2b-ii four-export director verification marked ✅ PASSED 2026-06-02-c; Phase 3 part 2 still REMAINS) + a NEW §B 2026-06-02-c note in `docs/COMPETITION_SCRAPING_DESIGN.md`. `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED.

**ROADMAP P-55 polish-backlog entry updated** (🟢 IN PROGRESS — the trimmed variants ✅ DEPLOYED-AND-VERIFIED; the four-export verification CLOSED; Phase 3 part 2 remaining) + (a.124) carry-forward 1 CLOSED / (a.125) opens + the carry-forward list trimmed to the single Phase-3-part-2 item.

**SIXTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — NO `prisma db push` (everything client-side download generation or reused existing routes), no `migrate reset`, no drop, no deletes outside normal build output. NO new memory file created (the standing export rule already lives in `feedback_exports_include_all_table_data`); zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (Phase 3 part 2):** no schema change anticipated — Phase 3 part 2 wires the primer `.docx` (generated on the fly from the already-committed content generator `dfa4af1`) + the "Insert primer" editor button (inserts into the existing editor) + a Files-box entry. If `.docx` generation needs a new library (e.g. `docx`), add it as an additive client dependency (no schema change). If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-55 spec + the memory directory (incl. `feedback_exports_include_all_table_data.md`).

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `8420739` (this session's build) + the inert `dfa4af1` (the primer content generator, already on main) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55, read §2 + §3 of each at session start — ESPECIALLY P-55):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md`** — the SOURCE-OF-TRUTH for P-55. Read §1 (verbatim director instructions, incl. the primer + zip + per-table requirements + the 2026-06-02-c "without individual reviews" directive) + §2 (joint decisions, incl. .docx primer format + "Insert primer" button + always-fresh downloads + the 2026-06-02-c trim-depth picker) + §3 (consolidated spec — incl. §3.B the FINAL standing export rules + the SEVEN-file Files-box shape + the Phase 3 primer shape) + §4 (resolved + remaining open questions).
- **The already-committed primer content generator (`dfa4af1`, now on main inert):** `src/lib/competition-scraping/comprehensive-analysis-primer.ts` — `buildPrimer()` (reflects the project's actual columns) + `renderPrimerToPlainText` + the director-APPROVED wording. Phase 3 part 2 only needs to (a) render `buildPrimer()` to a `.docx`, (b) wire an "Insert primer" editor button, (c) add a Files-box entry.
- **The export + Files-box precedent:** `src/lib/competition-scraping/comprehensive-analysis-exports.ts` (the four-sheet assembly + the `withoutIndividualReviews` opt + the registry-driven columns + the sub-row-expansion rule + `clampToExcelCellLimit`) + `ComprehensiveAnalysisFilesBox.tsx` (the SEVEN-file box + the `downloadHandlers` record + the re-fetch-on-every-download pattern + jszip).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-c (this session — the P-43 cwd-leak recurrence) + §Entry 2026-06-02-b (the export-must-match-the-table + registry-driven-columns + 32767-char-clamp + held-back-inert-lib observations) + §Entry 2026-06-02 (the stated-behavior-must-match-implementation observation + the 4 prior Patterns) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_exports_include_all_table_data.md`** — table exports must mirror the on-screen table's columns + order, include ALL click-to-reveal/expand-only data, split every sub-row into its own row, and generate fresh on click. (The "without individual reviews" variants are an explicit director-requested SUBSET under this rule, delivered via registry-driven column filtering so they can't drift.)
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — the primer wording is already director-approved; if Phase 3 part 2 surfaces NEW shape/wording questions (e.g. the .docx layout), plan them WITH the director BEFORE finalizing.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.125) = P-55 Phase 3 part 2 — wire the primer):** P-55 Phases 1 + 2a + 2b-i + 2b-ii are deployed AND director-verified (all four full exports PASS), and the three "without individual reviews" trimmed variants are deployed + verified — the Files box now lists SEVEN files. The ONLY open P-55 unit is **Phase 3 part 2** — wire the already-committed + approved primer content into (a) a Word `.docx` download in the Files box, AND (b) an "Insert primer" button in the `/comprehensive-analysis` editor. **There is NO owed verification from last session — start the Phase 3 part 2 build (after planning with me).**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 8420739 + the inert dfa4af1 (primer content generator) + the 2026-06-02-c doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**FIRST technical step (the `.docx`-library question):** before coding, **confirm whether `.docx` generation needs a new library (e.g. `docx`)** — flag it + confirm with me. If so, add it as an ADDITIVE client dependency (no schema change). This is the one known unknown for Phase 3 part 2; resolve it before committing to a build shape.

**Phase 3 part 2 (the primer wiring — on director go-ahead):** the primer CONTENT generator + approved wording already exist (on main inert at `dfa4af1` — `src/lib/competition-scraping/comprehensive-analysis-primer.ts`: `buildPrimer()` reflects the project's actual columns + `renderPrimerToPlainText`). This phase only WIRES it: (a) render `buildPrimer()` to a Word `.docx` and add it as a downloadable file in the "Comprehensive Competitive Analysis Files" box (reuse `ComprehensiveAnalysisFilesBox.tsx` + the `downloadHandlers` record + the re-fetch-on-every-download pattern + jszip for the .zip bundle — the .zip should now bundle the primer too), and (b) add an "Insert primer" button in the `/comprehensive-analysis` editor that inserts the rendered primer (re-clickable to refresh; NOT a fixed header, NOT auto-insert). **The wording is already approved — do NOT re-design it unless I raise a change; if a NEW shape/wording question arises (e.g. the .docx layout), plan it WITH me first per `feedback_plan_output_shape_before_building`.**

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1335 (entry 1335; +N for any new `.docx`-render / Files-box wiring helpers)
- `npm run build` = 71 routes (likely UNCHANGED — the primer download is client-side; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (file-download + rich-text editor insert + .docx are browser/visual judgment; director real-Chrome verification)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred this session; treat a route count of 0 as the cwd-leak tell-tale.

**Deploy mechanics:** 1+ Rule 9 deploy gates for Phase 3 part 2. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`. Note `dfa4af1` (the primer content generator) is already on main inert — Phase 3 part 2 imports it to make it live.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for Phase 3 part 2 (the primer .docx is generated on the fly; the "Insert primer" button inserts into the existing editor). If a field is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-55 entry update (Phase 3 part 2 shipped → P-55 likely CLOSED) + (a.125) status + CHAT_REGISTRY header bump (191st session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-55 spec (mark Phase 3 part 2 shipped → likely CLOSE P-55 + record any resolved §4 open questions). `docs/COMPETITION_SCRAPING_DESIGN.md` — a §B note if the page's design intent materially changes (your discretion).

**Standing carry-overs into this session:**

- **(a.125) = P-55 Phase 3 part 2** — the primer .docx + "Insert primer" button + Files-box entry; content generator + approved wording already committed on main inert at `dfa4af1`. **Confirm the `.docx`-library question FIRST.**
- **P-53 Excel "Export Table"** — effectively absorbed by P-55; only an on-page button would remain (LOW).
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; it recurred this session; running tally ~32-35+; single-session fix / palate-cleanser.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable once P-55 finishes (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.125) = P-55 Phase 3 part 2 is the PICK because everything else in P-55 is done + verified.** Phases 1 + 2a + 2b-i + 2b-ii are deployed AND director-verified (all four full exports PASS), the three trimmed variants are deployed + verified, and the primer CONTENT is already approved + committed (`dfa4af1`). The only remaining P-55 unit is wiring the primer (its .docx + the "Insert primer" button + the Files-box entry). The §4 Step 1c forced-picker outcome is Phase 3 part 2 — no separate picker was needed; it is the well-defined next unit. **There is NO owed verification this time** — the four-file sign-off owed from 2026-06-02-b was completed this session (all four PASS).
- **The primer wording is already approved — do NOT re-design it.** Phase 3 part 2 is wiring, not content authoring. The content generator (`dfa4af1`) is on main inert; importing it into a UI is what makes it live.
- **`dfa4af1` is on main but INERT** — it is committed + tree-shaken out of any build that doesn't import it; that is why `npm run build` stays 71 routes until Phase 3 part 2 wires it in.
- **The trimmed variants reuse the SAME builders via a `withoutIndividualReviews` opt** — registry-driven column filtering keeps them pinned to their source tables, so they can't drift (the standing `feedback_exports_include_all_table_data` rule). This is the precedent for any future export variant.
- **Run `npm run build` with an absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred in this session's scoreboard (a sibling `cd extensions/...` leaked the Bash cwd into the build check, yielding a route count of 0). Treat a route count of 0 as the tell-tale and re-run from the repo root.
- **P-55 SUPERSEDES P-51's UI dimension** — prepare-downloadable-materials-+-primer over an in-app AI-summarize button; the `ReviewAnalysis.PER_PROJECT` slot from P-51 stays unused. Build P-55, not P-51.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (no `prisma db push`); Phase 3 part 2's .docx is generated on the fly + inserts into the existing editor.
- **Plan output shape WITH the director only if NEW shape/wording questions arise** — the primer wording is already approved; per `feedback_plan_output_shape_before_building`, only re-plan if a genuinely new product decision surfaces (e.g. the .docx layout).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.125.alt1) P-55 Phase 3 part 2** (current PICK — pre-loaded above). Wire the already-committed + approved primer into a .docx download + an "Insert primer" button; confirm the `.docx`-library question first; on `workflow-2-competition-scraping`.
- **(a.125.alt2) Category/Type/main-table editable banner/group name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.125.alt3) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~32-35+; it recurred this session, so this is increasingly worth doing; quick palate-cleanser).
- **(a.125.alt4) W#2 graduation** (schedulable once P-55 finishes; director's discretion).
- **(a.125.alt5) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.125.alt6) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
