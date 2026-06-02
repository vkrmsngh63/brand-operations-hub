# Next session

**Written:** 2026-06-02-b (`session_2026-06-02-b_p55-phase-2b-ii-grouped-spreadsheets-audit-and-primer-content` — W#2 polish P-55 CONTINUED — Phase 2b-ii (the two grouped "Reviews Analysis By Competitor Category" + "By Competitor Type" spreadsheets for the `/comprehensive-analysis` Files box) ✅ DEPLOYED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`, PLUS a full four-file export audit (all four Comprehensive Analysis Files exports now mirror their on-screen tables exactly), PLUS the Phase 3 primer CONTENT generator built + director-approved (HELD BACK on workflow-2 at `dfa4af1`, inert/unwired). `main` went `b34a8b8 → e705f10 → fd63d45 → 0718711 → 1be0f62 → 41481f0`. **Closes (a.123) PARTIALLY — Phase 2b-ii DEPLOYED; director verification of the four exports DEFERRED. Opens (a.124) RECOMMENDED-NEXT = P-55 Phase 3 part 2 (the primer .docx + "Insert primer" editor button + Files-box entry)** on `workflow-2-competition-scraping`. **FIRST action next session = VERIFY the deferred four-file exports on vklf.com BEFORE building Phase 3 part 2.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the SECOND session of 2026-06-02 (suffix `-b`); the prior REAL session today is `session_2026-06-02` (no suffix — the P-55 comprehensive-analysis-files-and-main-table-additions session). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — ONE COMMIT HELD BACK ON workflow-2 (`dfa4af1`).** All five Phase 2b-ii / FF1–FF4 builds (`e705f10` → `41481f0`) are on main. The Phase 3 part 1 primer content generator (`dfa4af1`) is committed on `workflow-2-competition-scraping` but is **NOT yet on main at brief time** — it rides this session's end-of-session doc-batch ff-merge onto main INERT/unwired (no UI imports it, so the build stays 71 routes). After the parent's standard 3-push doc-batch pattern, `main` and `workflow-2-competition-scraping` are both at `41481f0` + `dfa4af1` (inert) + the doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry (everything is on main after the doc-batch ff-merge).

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session STAYED NO the whole way (zero `prisma db push`) — everything was client-side download generation or reused existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews`). Phase 3 part 2 (the primer `.docx` + "Insert primer" button + Files-box entry) is generated on the fly + inserts into the existing editor — NO schema change anticipated. If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization BEFORE any `prisma db push`.

> ⚠️ **FIRST ACTION NEXT SESSION = VERIFY THE FOUR COMPREHENSIVE ANALYSIS FILES EXPORTS.** These are DEPLOYED (main at `41481f0`) but the director DEFERRED verifying — verbatim "defer this test and move on." Before building Phase 3 part 2, ask the director to verify on vklf.com: from the "Comprehensive Competitive Analysis Files" box on `/comprehensive-analysis`, download all four spreadsheets (Competition Content Overview · Competition Reviews Analysis · Reviews Analysis By Competitor Category · Reviews Analysis By Competitor Type) and the .zip, and confirm each one (a) matches its on-screen table's columns + their order with no arbitrary columns, (b) splits every sub-row into its own row across all columns, and (c) downloads fresh from live data on every click.

---

## What we did this session (in plain terms)

This session continued building the downloadable materials for your "Comprehensive Analysis" page, and then we did a careful audit to make sure every spreadsheet is a true copy of what you see on screen. Here is what is now live on vklf.com:

- **Two more spreadsheets in the Files box** — "Reviews Analysis By Competitor Category" and "Reviews Analysis By Competitor Type." These group your reviews under their category or type and under each competitor, exactly like the on-screen By-Category and By-Type tables.
- **We then audited all four spreadsheets against their on-screen tables** and fixed them so that every one of them now: shows the SAME columns in the SAME order as the table (no made-up columns), includes EVERYTHING — even the details that only appear when you click to expand a row (like the reviewer's name, the date, and the per-row summary), turns every stacked sub-row into its own proper Excel row, and regenerates fresh from your live data every time you click download.
- **Along the way we fixed a download error** — one cell could exceed Excel's maximum length, so we now safely trim any oversized cell.

You gave us a clear standing rule for this — "all possible data that is included in the table should be exported, including anything only shown when you click on it" — and we wrote it into our permanent notes so every future export follows it.

We also **wrote the teaching "primer"** — the document that explains each table and column so an AI knows how to read your data — and you approved its wording. We have NOT yet wired up its download button; that is the first build next session. (We kept the primer text in the project, ready to go, but not yet shown anywhere.)

Before building, we asked you a set of quick questions (whether to include source reviews, whether the spreadsheets should match the on-screen tables exactly, the primer's plan, and the primer's wording) and built to your answers.

Still to come (next session): verify the four spreadsheets look right to you, then wire up the primer — its Word-document download AND an "Insert primer" button in your editor.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-55 entry — 🟢 IN PROGRESS — + the TWO deferred carry-forwards as ROADMAP entries) + `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth spec).

- **(carry-forward 1) Director verification of the four Comprehensive Analysis Files exports on vklf.com** — DEPLOYED (main at `41481f0`); the director deferred verifying. **FIRST item next session.**
- **(a.124) = P-55 Phase 3 part 2** — the primer `.docx` + "Insert primer" editor button + Files-box entry. The content generator + approved wording are already committed (workflow-2 at `dfa4af1`); only the wiring remains. **NEXT SESSION (see below); verify the four exports FIRST.**
- **(P-53) Excel "Export Table" button for the Category + Type pages** — effectively ABSORBED by P-55 Phase 2b-ii (the same export data, delivered as downloadable .xlsx). Only a separate on-page button would remain, LOW priority.
- **(optional refinement) editable banner category/type/group name** on the grouped pages + the main table.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable now that P-54 is closed + once P-55 finishes (director's discretion).

## What we'll do next session (in plain terms)

1. **FIRST, we ask you to check the four spreadsheets** in the Files box on your Comprehensive Analysis page — download each one (and the .zip) and confirm each looks right: same columns + order as the table on screen, all the click-to-expand details included, every stacked row split out, and always up to date.
2. **Then we wire up the teaching "primer"** you approved this session — so you can download it as a Word document from the Files box, AND insert it into your editor with an "Insert primer" button (re-clickable to refresh; not a fixed header, not auto-inserted).
3. **As always:** we agree the plan with you first, scoreboard-verify, deploy, and verify with you on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — 🟢 IN PROGRESS.** Phases 1 + 2a + 2b-i + 2b-ii shipped (the "Overall Competitor Analysis" column, the Files box, all FOUR competition spreadsheets — Content Overview · Reviews Analysis · By-Category · By-Type — always-fresh + table-matching). Phase 3 part 1 (the primer content + approved wording) is committed but unwired. REMAINING: Phase 3 part 2 (the primer .docx + "Insert primer" button + Files-box entry).
- **P-54 (main Competitor URLs table enhancements) — ✅ CLOSED 2026-06-01-d.** All 5 phases shipped + verified.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary on `/comprehensive-analysis`** — SUPERSEDED for its UI dimension by P-55 (prepare-materials-+-primer instead of an in-app AI-summarize button); the `ReviewAnalysis.PER_PROJECT` slot stays unused.
- **P-53 Excel "Export Table" for the Category + Type pages** — effectively ABSORBED by P-55 Phase 2b-ii; LOW priority residue (an on-page button) only.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — schedulable once P-55 finishes (director's discretion).
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 polish P-55 CONTINUED — Phase 2b-ii (the two grouped By-Category + By-Type spreadsheets) + a full four-file export audit + the Phase 3 primer content generator — FIVE deploys ALL ✅ DEPLOYED 2026-06-02-b** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; **director verification of the four exports DEFERRED ("defer this test and move on").** `main` went `b34a8b8 → e705f10 → fd63d45 → 0718711 → 1be0f62 → 41481f0` (five clean ff-merges). **A BUILD + DEPLOY session: FIVE builds, FIVE deploys, FIVE Rule 9 deploy gates (all Yes), plus pre-coding + mid-build AskUserQuestion design pickers.**

**Session shape (5 builds + 5 deploys + 1 held-back commit + end-of-session doc-batch):**

- **Phase 2b-ii (`e705f10`)** = the "Reviews Analysis By Competitor Category" + "Reviews Analysis By Competitor Type" grouped spreadsheets for the Files box (one generic grouped-export engine + two thin wrappers; reuses `buildCategoryGroups` / `buildTypeGroups` + `buildCategorySourceReviewRows`). Director PASS in build.
- **FF1 (`fd63d45`)** = clamp every cell to Excel's 32,767-char limit (`clampToExcelCellLimit`) — fixed a "Text length must not exceed 32767 characters" download error from an oversized Source Reviews cell.
- **FF2 (`0718711`)** = Source Reviews rebuilt as their OWN Excel rows (not one repeated cell) — director: sub-rows must be separate rows.
- **FF3 (`1be0f62`)** = grouped sheets rebuilt to MATCH the on-screen By-Category/By-Type tables EXACTLY — same columns in the SAME ORDER (header read from `CATEGORY_TABLE_COLUMNS` / `TYPE_TABLE_COLUMNS` registries), dropped the invented "Review" + "Source for AI complaint" columns; category/type SUMMARY (banner) rows first then competitor REVIEW rows.
- **FF4 (`41481f0`)** = the flat "Competition Reviews Analysis" export rebuilt to include ALL table data incl. click-to-reveal — added the "Reviews Summary" count column + Reviewer + Date (the `/competitor-reviews-analysis` expand panel shows Stars · Review · Reviewer · Date · Summary); added `reviewerName` + `reviewDate` to the live `/reviews` fetch. **DEPLOYED but director verification of the four exports DEFERRED — verify FIRST next session.**
- **HELD BACK (`dfa4af1`)** = Phase 3 part 1 — the pure node:tested primer content generator (`comprehensive-analysis-primer.ts` — `buildPrimer()` reflects the project's actual columns + `renderPrimerToPlainText`; +5 node:test) + director-APPROVED wording. NOT wired to any UI; rides this session's doc-batch ff-merge onto main INERT (build stays 71 routes). Phase 3 part 2 (next session) wires the `.docx` + "Insert primer" button + Files-box entry.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 1 Group B polish-item-spec (P-55) + a NEW §B 2026-06-02-b note in `docs/COMPETITION_SCRAPING_DESIGN.md` + the NEW memory file `feedback_exports_include_all_table_data.md` (+ MEMORY.md index). **This doc-batch commit ff-merges to main per the standard 3-push pattern (all five builds plus the inert `dfa4af1` land on main).**

**THE FOUR-FILE AUDIT (key deliverable):** audited all four Comprehensive Analysis Files exports vs their source on-screen tables. After FF1–FF4, ALL FOUR now (a) match their table's columns + order with no arbitrary columns, (b) split every sub-row across all columns into its own row, (c) generate fresh from live data on every download click. The fix needed was FF4 (the flat Reviews Analysis file). NEW reusable PATTERN: derive export columns from the page's column registry (not a hardcoded list) so they can't drift, and include ALL click-to-reveal/expand-only data — not just the header columns.

**FIVE Rule 9 deploy gates — all director "Yes." Plus pre-coding + mid-build AskUserQuestion design pickers** (Source Reviews inclusion; the table-match decision; the primer plan; the primer wording sign-off). The held-back primer commit (`dfa4af1`) had NO deploy gate (not deployed).

**Schema-change-in-flight flag NO at entry → STAYED NO → NO at exit** — zero `prisma db push` this session; everything client-side download generation or reused existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews`). **NEXT session = NO at entry.**

**TWO open DEFERRED carry-forwards at exit (Rule 26):** (1) director verification of the four Comprehensive Analysis Files exports on vklf.com (deployed at `41481f0`; verification deferred); (2) P-55 Phase 3 part 2 (the primer .docx + "Insert primer" button + Files-box entry — content generator + approved wording already committed at `dfa4af1`). Both captured in this NEXT_SESSION + as ROADMAP entries per `feedback_handoff_carryovers_to_roadmap`. Tasks #1–#5 completed in-session (build + tests + 5 deploys + audit); the parent marks tasks #6 (verification defer) + #7 (Phase 3 part 2) after this doc-batch is written.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **910/910 UNCHANGED** (zero extension change all session) + src/lib `node:test` = **1330/1330** (+13 from 1317 — Phase 2b-ii +8, FF1 +1, FF2 net −1 [removed a dead `formatSourceReviewsCell` test], primer +5) + `npm run build` = **71 routes UNCHANGED** (downloads client-side; the primer lib is not yet imported); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only; file-download = browser/visual judgment; director real-Chrome verification — consistent with prior P-55 sessions).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02-b** (no top-tier slip — the design iterations were resolved via director feedback + AskUserQuestion pickers; all five deploys passed/clean) capturing: (1) the export-must-match-the-on-screen-table-exactly principle + the include-all-click-to-reveal-data rule (→ NEW memory `feedback_exports_include_all_table_data`); (2) the reusable PATTERN "derive export columns from the page's column registry, not a hardcoded list, so they can't drift" (the hardcoded `REVIEWS_ANALYSIS_HEADER` was the one that drifted); (3) the Excel 32,767-char per-cell limit + the `clampToExcelCellLimit` backstop; (4) the held-back inert-lib-on-main note. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NEW memory file this session:** `feedback_exports_include_all_table_data.md` (+ MEMORY.md index line).

**1 MODIFIED Group B polish-item-spec** — `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (Phase 2b-ii marked ✅ DEPLOYED with the FF1–FF4 history + the FINAL design; Phase 3 part 1 done + part 2 remaining; §3.B standing export rules updated to the final 4-point rule; §4 grouped-row-shape open question RESOLVED — "match the on-screen table exactly") + a NEW §B 2026-06-02-b note in `docs/COMPETITION_SCRAPING_DESIGN.md`. `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED.

**ROADMAP P-55 polish-backlog entry updated** (🟢 IN PROGRESS — Phase 2b-ii ✅ DEPLOYED; Phase 3 part 1 done + part 2 remaining) + (a.123) PARTIAL close / (a.124) opens + the two DEFERRED carry-forwards as ROADMAP entries.

**SIXTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — NO `prisma db push` (everything client-side download generation or reused existing routes), no `migrate reset`, no drop, no deletes outside normal build output. ONE NEW memory file CREATED (`feedback_exports_include_all_table_data.md`) + its MEMORY.md index line — additive only, no memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact.
- **NEXT session (verify exports → Phase 3 part 2):** no schema change anticipated — Phase 3 part 2 wires the primer `.docx` (generated on the fly from the already-committed content generator) + the "Insert primer" editor button (inserts into the existing editor) + a Files-box entry. If `.docx` generation needs a new library (e.g. `docx`), add it as an additive client dependency (no schema change). If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-55 spec + the memory directory (incl. the new `feedback_exports_include_all_table_data.md`).

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `41481f0` + the inert `dfa4af1` (the primer content generator, carried to main unwired) + the end-of-session doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (everything is on main after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55, read §2 + §3 of each at session start — ESPECIALLY P-55):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md`** — the SOURCE-OF-TRUTH for P-55. Read §1 (verbatim director instructions, incl. the primer + zip + per-table requirements) + §2 (joint decisions, incl. .docx primer format + "Insert primer" button + always-fresh downloads) + §3 (consolidated spec — incl. §3.B the FINAL 4-point standing export rules + the Phase 3 primer shape) + §4 (resolved + remaining open questions).
- **The already-committed primer content generator (`dfa4af1`):** `src/lib/competition-scraping/comprehensive-analysis-primer.ts` — `buildPrimer()` (reflects the project's actual columns) + `renderPrimerToPlainText` + the director-APPROVED wording. Phase 3 part 2 only needs to (a) render `buildPrimer()` to a `.docx`, (b) wire an "Insert primer" editor button, (c) add a Files-box entry.
- **The export + Files-box precedent:** `src/lib/competition-scraping/comprehensive-analysis-exports.ts` (the four-sheet assembly + the registry-driven columns + the sub-row-expansion rule + `clampToExcelCellLimit`) + `ComprehensiveAnalysisFilesBox.tsx` (the Files box + the re-fetch-on-every-download pattern + jszip).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-b (this session — the export-must-match-the-table + registry-driven-columns + 32767-char-clamp + held-back-inert-lib observations) + §Entry 2026-06-02 (the stated-behavior-must-match-implementation observation + the 4 prior Patterns) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_exports_include_all_table_data.md`** (NEW this session) — table exports must mirror the on-screen table's columns + order, include ALL click-to-reveal/expand-only data, split every sub-row into its own row, and generate fresh on click. Apply when auditing/building the primer's Files-box entry + re-confirming the four exports.
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — the primer wording is already director-approved; if Phase 3 part 2 surfaces NEW shape/wording questions (e.g. the .docx layout), plan them WITH the director BEFORE finalizing.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.124) = P-55 Phase 3 part 2 — verify the four exports FIRST):** P-55 Phases 1 + 2a + 2b-i + 2b-ii are deployed; the four Comprehensive Analysis Files exports were deployed (main at `41481f0`) but my verification was DEFERRED. **FIRST: ask me to verify the four exports on vklf.com** — from the Files box on `/comprehensive-analysis`, download all four spreadsheets (Competition Content Overview · Competition Reviews Analysis · Reviews Analysis By Competitor Category · Reviews Analysis By Competitor Type) and the .zip, and confirm each (a) matches its on-screen table's columns + order with no arbitrary columns, (b) splits every sub-row across all columns into its own row, and (c) downloads fresh from live data on every click. **Only after I PASS the four exports**, build **Phase 3 part 2** — wire the already-committed primer content into a `.docx` download in the Files box AND an "Insert primer" editor button.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 41481f0 + the inert dfa4af1 (primer content generator) + the 2026-06-02-b doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (verify the four exports — FIRST):** ask the director to verify the four Comprehensive Analysis Files exports on vklf.com before any new build (download each + the .zip; confirm columns + order match the on-screen tables, every sub-row is its own row, and downloads are fresh). If the director finds an issue, fix-forward under a Rule 9 deploy gate before moving on. (The relevant standing rule is `feedback_exports_include_all_table_data` — exports must mirror the on-screen table incl. all click-to-reveal data.)

**Phase 3 part 2 (the primer wiring — only after the four exports PASS, on director go-ahead):** the primer CONTENT generator + approved wording already exist (workflow-2 at `dfa4af1` — `src/lib/competition-scraping/comprehensive-analysis-primer.ts`: `buildPrimer()` reflects the project's actual columns + `renderPrimerToPlainText`). This phase only wires it: (a) render `buildPrimer()` to a Word `.docx` and add it as a downloadable file in the "Comprehensive Competitive Analysis Files" box (reuse `ComprehensiveAnalysisFilesBox.tsx` + the re-fetch-on-every-download pattern + jszip for the .zip bundle), and (b) add an "Insert primer" button in the `/comprehensive-analysis` editor that inserts the rendered primer (re-clickable to refresh; NOT a fixed header, NOT auto-insert). **Confirm whether `.docx` generation needs a new library (e.g. `docx`) — flag + confirm at that build; if so, add it as an additive client dependency (no schema change).** The wording is already approved — do NOT re-design it unless I raise a change; if a NEW shape/wording question arises, plan it WITH me first per `feedback_plan_output_shape_before_building`.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1330 (entry 1330; +N for any new `.docx`-render / Files-box wiring helpers)
- `npm run build` = 71 routes (likely UNCHANGED — the primer download is client-side; confirm — wiring the primer lib into the Files box is still client-side, so 71 should hold)
- Check 6 Playwright SKIPPED per Rule 27 (file-download + rich-text editor insert + .docx are browser/visual judgment; director real-Chrome verification)

**Deploy mechanics:** 1+ Rule 9 deploy gates for Phase 3 part 2. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`. A fix-forward for the four exports (if verification surfaces an issue) follows the same pattern. Note `dfa4af1` is already on main (inert) after this session's doc-batch ff-merge — Phase 3 part 2 builds on top of it.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for Phase 3 part 2 (the primer .docx is generated on the fly; the "Insert primer" button inserts into the existing editor). If a field is unexpectedly needed, audit + authorize WITH me first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-55 entry update (Phase 3 shipped → P-55 likely CLOSED) + (a.124) status + CHAT_REGISTRY header bump (190th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-55 spec (mark Phase 3 part 2 shipped → likely CLOSE P-55 + record any resolved §4 open questions). `docs/COMPETITION_SCRAPING_DESIGN.md` — a §B note if the page's design intent materially changes (your discretion).

**Standing carry-overs into this session:**

- **(carry-forward 1) Verify the four Comprehensive Analysis Files exports** — DEPLOYED at `41481f0`; verification deferred; FIRST item.
- **(a.124) = P-55 Phase 3 part 2** — the primer .docx + "Insert primer" button + Files-box entry; content generator + approved wording already committed at `dfa4af1`.
- **P-53 Excel "Export Table"** — effectively absorbed by P-55 Phase 2b-ii; only an on-page button would remain (LOW).
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable once P-55 finishes (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.124) = P-55 Phase 3 part 2 is the PICK because Phase 2b-ii + the four-file audit are done and the primer CONTENT is already approved + committed.** The only remaining P-55 unit is wiring the primer (its .docx + the "Insert primer" button + the Files-box entry). The §4 Step 1c forced-picker outcome is Phase 3 part 2 — no separate picker was needed; it is the well-defined next unit. **But verify the four exports FIRST** — they were deployed but I deferred verifying ("defer this test and move on"), so that verification is owed before building on top.
- **The primer wording is already approved — do NOT re-design it.** Phase 3 part 2 is wiring, not content authoring. The content generator (`dfa4af1`) is on main inert after this session's doc-batch ff-merge; importing it into a UI is what makes it live.
- **`dfa4af1` is on main but INERT** — it is committed + tree-shaken out of any build that doesn't import it; that is why `npm run build` stays 71 routes until Phase 3 part 2 wires it in.
- **P-55 SUPERSEDES P-51's UI dimension** — prepare-downloadable-materials-+-primer over an in-app AI-summarize button; the `ReviewAnalysis.PER_PROJECT` slot from P-51 stays unused. Build P-55, not P-51.
- **P-53 is absorbed by P-55 Phase 2b-ii** — the By-Category + By-Type export data is delivered by P-55; only a separate on-page "Export Table" button would remain as a LOW residue.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (no `prisma db push`); Phase 3 part 2's .docx is generated on the fly + inserts into the existing editor.
- **Plan output shape WITH the director only if NEW shape/wording questions arise** — the primer wording is already approved; per `feedback_plan_output_shape_before_building`, only re-plan if a genuinely new product decision surfaces.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.124.alt1) P-55 Phase 3 part 2** (current PICK — pre-loaded above). Verify the four exports FIRST; wire the already-committed + approved primer into a .docx download + an "Insert primer" button; on `workflow-2-competition-scraping`.
- **(a.124.alt2) Category/Type/main-table editable banner/group name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.124.alt3) W#2 graduation** (schedulable once P-55 finishes; director's discretion).
- **(a.124.alt4) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.124.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+; quick palate-cleanser).
- **(a.124.alt6) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
