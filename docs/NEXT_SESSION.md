# Next session

**Written:** 2026-06-02 (`session_2026-06-02_p55-comprehensive-analysis-files-and-main-table-additions` — W#2 NEW polish item P-55 — `/comprehensive-analysis` downloadable materials (Excel exports of the four competition tables + a teaching "primer") + main-table "Overall Competitor Analysis" column + Columns-box ordering fixes — a requirements-gathering opener that became a multi-phase BUILD + DEPLOY session, SIX deploys ALL ✅ DEPLOYED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (Phases 1 + 2a director-VERIFIED "pass"; **Phase 2b-i + its FF1 DEPLOYED but NOT YET director-verified**). `main` went `396a9ed → 4ed4b63 → 8f7db25 → 6952817 → 05a33b6 → 19c21d8 → e263be5`. **The director gave a CONCRETE new direction (P-55) that SUPERSEDES the old P-51 skeleton** — P-55 PREPARES downloadable materials so the director runs the AI themselves, instead of an in-app "AI summarize" button. **Closes (a.122) PARTIALLY; opens (a.123) RECOMMENDED-NEXT = P-55 Phase 2b-ii (the By-Category + By-Type spreadsheets) then Phase 3 (the primer .docx + "Insert primer" button)** on `workflow-2-competition-scraping`. **FIRST action next session = VERIFY Phase 2b-i on vklf.com BEFORE building 2b-ii.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session OPENED on 2026-06-01 (continuing the `2026-06-01-d` pointer) and the harness `currentDate` rolled to 2026-06-02 mid-session, so it is stamped `2026-06-02` (FIRST session of that date → no suffix). This is the same kind of boundary crossing logged for the 2026-06-01 P-49 session. The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NORMAL.** Nothing held back this session: all six Phase builds (`4ed4b63` → `e263be5`) AND this session's end-of-session doc-batch land on main (the parent ff-merges the doc-batch per the standard 3-push pattern). `main` and `workflow-2-competition-scraping` are BOTH at `e263be5` plus the end-of-session doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show only the doc-batch commit (or 0 after the parent's ff-merge) at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session STAYED NO the whole way (zero `prisma db push`) — everything was additive client-side (download generation) or reused existing routes. Phase 2b-ii (the By-Category + By-Type spreadsheets) reuses already-persisted PER_CATEGORY / PER_TYPE analysis + the grouping helpers — NO schema change anticipated. Phase 3 (the primer .docx) is generated on the fly — NO schema change anticipated. If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization BEFORE any `prisma db push`.

> ⚠️ **FIRST ACTION NEXT SESSION = VERIFY PHASE 2b-i.** Phase 2b-i (the "Competition Reviews Analysis" spreadsheet) + its FF1 (every download re-fetches LIVE data at click time) are DEPLOYED but the director PAUSED to close out + ask 2 questions instead of verifying. Before building Phase 2b-ii, ask the director to verify on vklf.com: download the "Competition Reviews Analysis" .xlsx (and the .zip) from the Files box on `/comprehensive-analysis`, confirm each captured review is its own row (Stars · Review · Review Summary) with the per-competitor fields + the comprehensive bulleted/non-bulleted AI summaries repeated, and confirm a fresh download reflects live data changes.

---

## What we did this session (in plain terms)

This started as a planning session for your "Comprehensive Analysis" page, and you gave us a clear, concrete new direction. Instead of a button that makes the AI write a summary inside the app, you want the app to PREPARE the materials — neat Excel spreadsheets of your competition tables plus a teaching "primer" — so you can feed them to an AI of your choice and get exactly the analysis you want. We wrote that down word-for-word, agreed every design choice with you up front, then built and shipped it in phases. Here is what is now live on vklf.com:

- **Your "Comprehensive Analysis" page has a new "Comprehensive Competitive Analysis Files" box.** From there you can download ready-to-use Excel spreadsheets of your competition data — individually, or all together as a single .zip.
- **The "Competition Content Overview" spreadsheet** is your whole main Competitor URLs table — every column, every row. Where the table stacks several items in one cell (sub-rows), the spreadsheet expands them into proper separate rows, because Excel can't do stacked sub-rows.
- **The "Competition Reviews Analysis" spreadsheet** lists every captured review as its own row (its stars, the review text, and its short summary) alongside each competitor's details and the bulleted + plain AI summaries. *(This one is shipped and waiting for your sign-off next session.)*
- **Every download is always regenerated fresh from your live data** the moment you click — so if you change your data and download again, you get the up-to-date version. (We caught and fixed a spot where it was reusing older data — your question is what surfaced it.)
- **Your main table gained a new "Overall Competitor Analysis" column** (just to the left of "Added On"), with its own clean pop-out editor for writing your overall take on each competitor.
- **The Columns box now lists every checkbox in the same order the columns appear in the table** — including the "Content / Image / Video Categories" group checkboxes, which used to be tacked on at the end.

Before building anything, we asked you a set of quick questions (twice) and you picked our recommended answers; we also checked a few details with you mid-build (how to handle stacked rows in Excel, how much review detail to include, whether downloads should always be fresh, and the build/ship pace).

Still to come (next session): the two grouped spreadsheets (By Competitor Category and By Competitor Type), and then the teaching "primer" — a Word document describing each table and column, downloadable AND insertable into the editor with a button.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the NEW P-55 entry — 🟢 IN PROGRESS) + `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth spec) + `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` (now superseded for its UI dimension).

- **(a.123) = P-55 Phase 2b-ii then Phase 3** — NEXT SESSION (see below); verify Phase 2b-i FIRST.
- **(P-53) Excel "Export Table" button for the Category + Type pages** — effectively ABSORBED by P-55 Phase 2b-ii (the same export data, delivered as downloadable .xlsx). Only a separate on-page button would remain, LOW priority.
- **(optional refinement) editable banner category/type/group name** on the grouped pages + the main table.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable now that P-54 is closed + once P-55 finishes (director's discretion).

## What we'll do next session (in plain terms)

1. **FIRST, we ask you to check the "Competition Reviews Analysis" spreadsheet** that we shipped this session (download it from the Files box on your Comprehensive Analysis page) and confirm it looks right — each review as its own row, with its summaries, and always up to date.
2. **Then we build the two grouped spreadsheets** — "Reviews Analysis By Competitor Category" and "Reviews Analysis By Competitor Type" — so the Files box has all four competition tables ready to download. These group the reviews under their category/type and competitor and include the per-group AI summaries and source reviews.
3. **Then we build the teaching "primer"** — a Word document that explains each table, each column, and what each column contains, so the AI you feed it knows exactly how to read your data. It will be downloadable from the Files box AND insertable into your editor with an "Insert primer" button. We will plan the wording and structure WITH you before writing it.
4. **As always:** we agree the plan with you first, scoreboard-verify, deploy, and verify with you on vklf.com.

## What's still left in the total roadmap (in plain terms)

- **P-55 (Comprehensive Analysis downloadable materials + primer + main-table additions) — 🟢 IN PROGRESS.** Phases 1 + 2a + 2b-i shipped (the "Overall Competitor Analysis" column, the Files box, the Content Overview + Reviews Analysis spreadsheets, always-fresh downloads). REMAINING: Phase 2b-ii (the By-Category + By-Type spreadsheets) + Phase 3 (the primer .docx + "Insert primer" button).
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

**W#2 NEW polish item P-55 — `/comprehensive-analysis` downloadable materials + main-table "Overall Competitor Analysis" column + Columns-box ordering fixes — SIX deploys ALL ✅ DEPLOYED 2026-06-02** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; **Phases 1 + 2a director-VERIFIED (verbatim "pass"); Phase 2b-i + its FF1 DEPLOYED but NOT YET director-verified.** `main` went `396a9ed → 4ed4b63 → 8f7db25 → 6952817 → 05a33b6 → 19c21d8 → e263be5` (six clean ff-merges). **A requirements-gathering opener that became a multi-phase BUILD + DEPLOY session: SIX builds, SIX deploys, SIX Rule 9 deploy gates (all Yes), plus pre-coding + mid-build AskUserQuestion design pickers.**

**The director's CONCRETE new direction (NEW polish item P-55 SUPERSEDES the old P-51 skeleton):** rather than an in-app "AI summarize" button (P-51's assumption), P-55 PREPARES downloadable materials — Excel spreadsheets of the four competition tables + a teaching "primer" — so the director runs the AI themselves, with the primer also inserted into the editor. Requirements + all design decisions captured VERBATIM + resolved WITH the director via AskUserQuestion BEFORE coding (per `feedback_plan_output_shape_before_building` + `feedback_no_fabricated_instructions`). NEW spec doc `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (§1 verbatim instructions + §2 joint decisions + §3 consolidated spec + §4 open questions + §5 cross-refs).

**Session shape (design pickers BEFORE/DURING coding + 6 builds + 6 deploys + end-of-session doc-batch):**

- **Phase 1 (`4ed4b63`)** = a NEW "Overall Competitor Analysis" main-table column (left of "Added On"; a pop-out `OverallAnalysisBox` editor; save via the existing urls/[urlId] PATCH; sortable by plain text; hideable; drag-reorderable) + NEW pure helper `withMissingKeysBefore` (column-order.ts, +7 node:test). Director PASS.
- **Phase 1 FF1 (`8f7db25`)** = the Columns-box category-GROUP checkboxes (Content / Image / Video Categories) interleave at their real column position (were appended after Added On) + NEW pure helper `orderedColumnBoxEntries` (dynamic-columns.ts, +7 node:test).
- **Phase 2a (`6952817`)** = a NEW "Comprehensive Competitive Analysis Files" box above the editor on `/comprehensive-analysis` + the "Competition Content Overview" spreadsheet (the main table, all columns / all rows) + per-file + "Download all (.zip)"; NEW pure lib `comprehensive-analysis-exports.ts` (+8 node:test) + NEW client component `ComprehensiveAnalysisFilesBox.tsx` + NEW dependency **jszip ^3.10.1**. Director PASS.
- **Phase 2a FF1 (`05a33b6`)** = spreadsheet sub-rows EXPAND into real Excel rows (director: "Excel can't do sub-rows") — a competitor with N category-items → N rows; fixed columns repeat per row (+1 node:test → 9).
- **Phase 2b-i (`19c21d8`)** = the "Competition Reviews Analysis" spreadsheet — each captured review as its own row (Stars · Review · Review Summary) + per-competitor fields + comprehensive bulleted/non-bulleted AI summaries repeated; derives PER_REVIEW + PER_PRODUCT maps from `/review-analysis`; reuses `mergeTitleAndBody` (+3 node:test → 12). **DEPLOYED but NOT YET director-verified — verify FIRST next session.**
- **Phase 2b-i FF1 (`e263be5`)** = every download (each file + the .zip) re-fetches LIVE data at click time ("always current on every download") — fixed a gap vs the promised "fresh every download" behavior (was fetch-on-mount + cache; caught by the director's question). **DEPLOYED but NOT YET director-verified.**
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 2 Group B polish-item-specs (P-55 NEW + the P-51 supersession note) + a NEW §B 2026-06-02 note in `docs/COMPETITION_SCRAPING_DESIGN.md`. **This doc-batch commit ff-merges to main per the standard 3-push pattern (all six builds are already on main; nothing held back).**

**SIX Rule 9 deploy gates — all director "Yes." Plus pre-coding design pickers (two rounds of 4-question AskUserQuestion, all "recommended") + mid-build pickers** (sub-row expansion = "repeat on every row"; reviews detail = "everything, reviews as rows"; download freshness = "always current"; cadence = "phase it / pause-and-close-out").

**Schema-change-in-flight flag NO at entry → STAYED NO → NO at exit** — zero `prisma db push` this session; everything additive client-side (download generation) or reused existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews` + the existing urls/[urlId] PATCH). **NEXT session = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26)** — all 7 session tasks completed; no DEFERRED:-prefixed tasks created. The remaining Phase 2b-ii + Phase 3 are the documented roadmap continuation (captured in this NEXT_SESSION + the P-55 spec + the ROADMAP P-55 entry), NOT TaskList DEFERRED items.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **910/910 UNCHANGED** (zero extension change all session) + src/lib `node:test` = **1317/1317** (+26 from 1291 — column-order +7, dynamic-columns +7, comprehensive-analysis-exports +12) + `npm run build` = **71 routes UNCHANGED** (no new route — the downloads are client-side; reused GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews`); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only; file-download + rich-text pop-out + drag are browser/visual judgment; deploy session w/ director real-Chrome verification — consistent with P-54 Phases 4/5).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-02** (no top-tier slip — every deploy passed/clean; director PASSED Phases 1 + 2a) capturing: (0) the **stated-behavior-must-match-implementation** observation — the Files-box downloads were initially fetch-on-mount + cache, but the director had been promised "regenerate fresh from your live data every time you download"; the director's question surfaced the gap, fixed in `e263be5`; lesson: re-read promised behaviors before marking a phase done; (1-4) FOUR NEW reusable PATTERNS — fixed-column slotting via `withMissingKeysBefore`; Columns-box ordering via `orderedColumnBoxEntries`; expand-sub-rows-into-real-Excel-rows; client-side multi-table export re-fetching fresh at click time + reusing pure assembly helpers; (5) the date-boundary crossing (opened 2026-06-01, harness rolled to 2026-06-02 mid-session). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** NO new memory file.

**2 MODIFIED/CREATED Group B polish-item-specs** — NEW `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (created this session — the source-of-truth) + `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` (a top note that P-55 supersedes P-51's UI dimension) + a NEW §B 2026-06-02 note in `docs/COMPETITION_SCRAPING_DESIGN.md`. `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED (not Reviews-extension work).

**NEW ROADMAP polish-backlog entry P-55** (🟢 IN PROGRESS — Phases 1 + 2a + 2b-i shipped; Phase 2b-ii + Phase 3 remain) + (a.122) PARTIAL close / (a.123) opens + the P-55-supersedes-P-51 + P-53-absorbed-by-P-55 notes.

**SIXTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — NO `prisma db push` (everything additive client-side or reused existing routes), no `migrate reset`, no drop, no deletes outside normal build output. No memory-file edits. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact.
- **NEXT session (Phase 2b-ii / Phase 3):** no schema change anticipated — Phase 2b-ii reuses already-persisted PER_CATEGORY / PER_TYPE analysis + the grouping helpers; Phase 3's primer .docx is generated on the fly. If a build unexpectedly needs a field, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-55 spec + the P-51 spec + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The P-55 `/comprehensive-analysis` work is W#2-only. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `e263be5` + the end-of-session doc-batch SHA. **Normal state — nothing held back.** Verify with `git log origin/main..HEAD --oneline` showing 0 (or only brand-new work); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54 + P-55, read §2 + §3 of each at session start — ESPECIALLY P-55 + P-51):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md`** — the SOURCE-OF-TRUTH for P-55. Read §1 (verbatim director instructions, incl. the primer + zip + per-table requirements) + §2 (joint decisions, incl. .docx primer format + "Insert primer" button + always-fresh downloads) + §3 (consolidated spec — the Phase 2b-ii two-level grouping + Phase 3 primer shape) + §4 (open questions for 2b-ii + 3).
- **`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`** — now superseded for its UI dimension by P-55; read for context (the `ReviewAnalysis.PER_PROJECT` slot stays unused).
- **The grouped-page assembly helpers Phase 2b-ii will reuse:** `category-analysis-aggregation`, `buildCategoryGroups`, `buildCategorySourceReviewRows`, `category-table-columns` + `type-table-columns` (and the existing `reviews-analysis-by-category` / `reviews-analysis-by-type` page logic).
- **The export precedent:** `src/lib/competition-scraping/.../reviews-table-export.ts` (the `/competitor-reviews-analysis` "Export Table"; P-55 reuses `slugifyForFilename`) + this session's NEW `comprehensive-analysis-exports.ts` (the Content Overview + Reviews Analysis assembly + the sub-row-expansion rule) + `ComprehensiveAnalysisFilesBox.tsx` (the Files box + the re-fetch-on-every-download pattern + jszip).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02 (this session — the stated-behavior-must-match-implementation observation + the 4 NEW Patterns) + §Entry 2026-06-01-d (the locked-column-pairs Pattern) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — for Phase 3 especially: plan the primer's output shape (per-table / per-column descriptions, audience, depth, tone) WITH the director BEFORE writing it; capture any new requirements verbatim.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (the source-of-truth).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.123) = P-55 Phase 2b-ii then Phase 3 — verify Phase 2b-i FIRST):** P-55 Phases 1 + 2a + 2b-i are deployed (Phases 1 + 2a director-verified; Phase 2b-i + its FF1 deployed but NOT YET verified). **FIRST: ask me to verify Phase 2b-i on vklf.com** — download the "Competition Reviews Analysis" .xlsx (and the .zip) from the Files box on `/comprehensive-analysis`, confirm each captured review is its own row (Stars · Review · Review Summary) with the per-competitor fields + the bulleted/non-bulleted AI summaries repeated, and confirm a fresh download reflects live data. **Only after I PASS Phase 2b-i**, build **Phase 2b-ii** — the "Reviews Analysis By Competitor Category" + "Reviews Analysis By Competitor Type" spreadsheets — then **Phase 3** — the primer .docx + the "Insert primer" button.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 (or only brand-new work) — main and workflow-2 are both at e263be5 + the 2026-06-02 doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (verify Phase 2b-i — FIRST):** ask the director to verify the "Competition Reviews Analysis" spreadsheet + the always-fresh download behavior on vklf.com before any new build. If the director finds an issue, fix-forward Phase 2b-i under a Rule 9 deploy gate before moving on.

**Phase 2b-ii (the most complex remaining build — only after Phase 2b-i PASSES, on director go-ahead):** build the "Reviews Analysis By Competitor Category" + "Reviews Analysis By Competitor Type" spreadsheets for the Files box. Two-level grouping (competitors within a category/type banner, reviews within a competitor) + per-category/per-type bulleted/non-bulleted AI summaries + Source Reviews. **Reuse, do NOT duplicate:** `category-analysis-aggregation`, `buildCategoryGroups`, `buildCategorySourceReviewRows`, `category-table-columns` + `type-table-columns`, and extend this session's `comprehensive-analysis-exports.ts` + `ComprehensiveAnalysisFilesBox.tsx` (mirror the sub-row-expansion rule into the grouped two-level shape; keep the re-fetch-on-every-download behavior). Confirm the two-level row shape with the director at verification. **Confirm whether the grouped row expansion reads well WITH the director before finalizing the layout.**

**Phase 3 (the primer — only after Phase 2b-ii ships, on director go-ahead; PLAN OUTPUT SHAPE FIRST):** a primer DESCRIBING each table + its columns + what each column contains, generated to reflect the project's ACTUAL columns. Lives as (a) a Word .docx in the Files box AND (b) insertable into the editor via an "Insert primer" button (re-clickable to refresh; NOT a fixed header / NOT auto-insert). **Per `feedback_plan_output_shape_before_building`, plan the exact wording + structure of the per-table/per-column descriptions WITH me BEFORE writing it.** Confirm whether .docx generation needs a new library (e.g. `docx`) — flag + confirm at that build; if so, add it as an additive client dependency (no schema change).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1317 (entry 1317; +N for the new export-assembly helpers in Phase 2b-ii / Phase 3)
- `npm run build` = 71 routes (likely UNCHANGED — downloads are client-side; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (file-download + rich-text + .docx are browser/visual judgment; director real-Chrome verification)

**Deploy mechanics:** 1+ Rule 9 deploy gates per phase. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`. A fix-forward for Phase 2b-i (if verification surfaces an issue) follows the same pattern.

**Schema-change-in-flight flag:** **NO at entry**; no schema change anticipated for Phase 2b-ii or Phase 3 (Phase 2b-ii reuses persisted analysis; Phase 3's .docx is generated on the fly). If a field is unexpectedly needed, audit + authorize WITH the director first before any `prisma db push`.

**Group A docs to update at session end:** ROADMAP header bump + the P-55 entry update (Phases shipped) + (a.123) status + CHAT_REGISTRY header bump (189th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the P-55 spec (mark Phase 2b-ii / Phase 3 shipped + record any resolved §4 open questions). `docs/COMPETITION_SCRAPING_DESIGN.md` — a §B note if the page's design intent materially changes (your discretion).

**Standing carry-overs into this session:**

- **(a.123) = P-55 Phase 2b-ii then Phase 3** — the directive is captured verbatim in the P-55 spec §1 per `feedback_no_fabricated_instructions`; verify Phase 2b-i FIRST.
- **P-53 Excel "Export Table"** — effectively absorbed by P-55 Phase 2b-ii; only an on-page button would remain (LOW).
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable once P-55 finishes (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.123) = P-55 Phase 2b-ii then Phase 3 is the PICK because Phases 1 + 2a + 2b-i are shipped** — the director's concrete P-55 direction is being realized phase-by-phase; Phase 2b-ii (the By-Category + By-Type spreadsheets) is the next documented unit, then Phase 3 (the primer). The §4 Step 1c forced-picker outcome is Phase 2b-ii — no separate picker was needed; it is the well-defined next unit. **But verify Phase 2b-i FIRST** — it was deployed but the director paused to close out + ask 2 questions instead of verifying, so the verification is owed before building on top of it.
- **P-55 SUPERSEDES P-51's UI dimension** — the director chose prepare-downloadable-materials-+-primer over an in-app AI-summarize button; the `ReviewAnalysis.PER_PROJECT` slot from P-51 stays unused. Build P-55, not P-51.
- **P-53 is absorbed by P-55 Phase 2b-ii** — the By-Category + By-Type export data is delivered by P-55; only a separate on-page "Export Table" button would remain as a LOW residue.
- **Schema-change-in-flight = NO at entry** — this session stayed NO throughout (no `prisma db push`); Phase 2b-ii reuses persisted analysis and Phase 3's .docx is generated on the fly.
- **Branch state is normal** (nothing held off main this session — all six builds + the doc-batch land on main).
- **Plan output shape WITH the director BEFORE Phase 3 (the primer)** — per `feedback_plan_output_shape_before_building`; the primer's per-table/per-column wording is a director-owned product decision.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.123.alt1) P-55 Phase 2b-ii then Phase 3** (current PICK — pre-loaded above). Verify Phase 2b-i FIRST; reuse the grouping + aggregation helpers; plan the primer shape WITH the director; on `workflow-2-competition-scraping`.
- **(a.123.alt2) Category/Type/main-table editable banner/group name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.123.alt3) W#2 graduation** (schedulable once P-55 finishes; director's discretion).
- **(a.123.alt4) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.123.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+; quick palate-cleanser).
- **(a.123.alt6) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
