# Next session

**Written:** 2026-06-01-b (`session_2026-06-01-b_p54-competition-scraping-main-table-enhancements` — W#2 NEW polish item P-54 — `/competition-scraping` MAIN-PAGE (Competitor URLs table) enhancements — a requirements-gathering opener that became a 3-phase BUILD + DEPLOY session; FIVE deploys ALL ✅ DEPLOYED-AND-VERIFIED 2026-06-01-b end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director Phase 4 PASS on all five; `main` went `69da40c → b134b5d → e0661ba → b27841f → 1f18308 → 7a10ba4`). The session was scheduled to open (a.119) but **the DIRECTOR DEFERRED (a.119)** at session start and directed a NEW batch of main-page table enhancements — **9 requirements (R1–R9)** captured VERBATIM in a NEW spec doc `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md`. **Phases 1–3 (R1–R5) shipped + verified.** **(a.119) remains DEFERRED/queued — NOT closed.** **Opens (a.120) RECOMMENDED-NEXT = P-54 Phase 4 — the "Sort By" grouping box** on `workflow-2-competition-scraping`.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the SECOND session of 2026-06-01, stamped `2026-06-01-b`. The prior REAL session is `2026-06-01` (the P-49 W5 Type page, build `f23df1b`). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-54 (and the still-queued (a.119) `/comprehensive-analysis`) are W#2-only work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NORMAL.** Nothing held back this session: all five P-54 builds (`b134b5d` → `7a10ba4`) AND this session's end-of-session doc-batch land on main (the parent ff-merges the doc-batch per the standard 3-push pattern). `main` and `workflow-2-competition-scraping` are BOTH at `7a10ba4` plus the end-of-session doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show only the doc-batch commit (or 0 after the parent's ff-merge) at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session FLIPPED NO → YES (Phase 3) → NO at the Phase 3 deploy push (the additive `ProjectTablePreferences` table shipped to prod via `prisma db push`). **Phase 4 (the "Sort By" grouping box) is expected NO** — grouping is a render-layer reorder over already-loaded rows; the shared layout store already exists. Confirm WITH the director only if a new persisted field is needed (e.g. saving the chosen grouping mode into `ProjectTablePreferences`).

---

## What we did this session (in plain terms)

You asked us to set aside the "Comprehensive Analysis" planning for today and instead make a batch of improvements to your **main Competitor URLs table** (the big table on the `/competition-scraping` page). We wrote down your 9 requests word-for-word first, then built and shipped the first three batches — all live and verified on vklf.com:

- **You can now widen the LAST column** by dragging its right edge (it had no handle before).
- **We removed the duplicate blue "Comprehensive Competitor Analysis" button** — it did the same thing as the "Comprehensive Analysis" tab at the top.
- **The whole page now scrolls in both directions** using your browser's normal scrollbars (we removed the cramped inner scroll box), and **the column headers stay pinned to the top of the window** as you scroll down a long table.
- **You can drag the column headers** to put the columns in any order you like.
- **The whole table layout is now shared across everyone on the Project** — the column order, which columns are shown/hidden, the column widths, the competitor row order, and the font size all travel with the Project (not just your own account). Your existing personal layout was carried over automatically, so nothing reset.

We did this in three deploy batches (with two quick follow-up tweaks on the scrolling one so the last column could be dragged as wide as you want). Two bigger pieces are still to come (next session): a **"Sort By" box** to group your rows by Platform / Category / Type, and the **dynamic content/image/video category columns**.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the NEW P-54 entry — Phases 1–3 shipped, Phases 4–5 queued) + `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 decisions + 5-phase plan + §4 open questions).

- **(a.120) P-54 Phase 4 — the "Sort By" grouping box** — NEXT SESSION (see below).
- **(a.119) `/comprehensive-analysis` AI-summarizing functionality** — DEFERRED by the director to "the session after P-54's features are finished"; still queued; ASK-DIRECTOR-FIRST when it comes up.
- **(P-53) Excel "Export Table" button for the Category + Type pages** — never built on either grouped page; LOW; deferred.
- **(optional refinement) editable banner category/type name** on the grouped pages.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session builds the **"Sort By" grouping box** for the main Competitor URLs table. In plain terms:

1. **First we settle one open question with you (Q-H):** the "Sort By" box should have a "None"/flat default (the normal ungrouped table you have today), and we need to confirm how grouping should behave alongside the things you can already do — reordering columns, clicking a column to sort, and dragging rows. We will ask you about this BEFORE building.
2. **Then we build the grouping box.** When you pick Platform / Category / Type, the rows get gathered into banner-row groups (the same look-and-feel as your "By Category" and "By Type" pages), reusing that proven pattern.
3. **Then we ship + verify it with you** on vklf.com, the same way we shipped Phases 1–3.

After Phase 4, the last big piece is Phase 5 (the dynamic content/image/video category columns), and then the deferred "Comprehensive Analysis" planning comes back around.

## What's still left in the total roadmap (in plain terms)

- **P-54 (NEW this session) main Competitor URLs table enhancements** — Phases 1–3 ✅ shipped + verified 2026-06-01-b. **Phase 4 (Sort By grouping) = next.** Phase 5 (dynamic category columns) after that.
- **(a.119 / queued) `/comprehensive-analysis` AI-summary** — deferred by the director to the session after P-54's features are finished.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages shipped + verified. Only the LOW-priority Excel export (P-53) + the optional editable-banner-name refinement remain.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 per-Project competitive landscape AI summary on `/comprehensive-analysis`** — reconcile with the deferred (a.119) directive when it comes back.
- **P-53 Excel "Export Table" for the Category + Type pages** — LOW; never built on Category either.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — schedulable once P-54 + (a.119) settle (director's discretion).
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-54 `/competition-scraping` MAIN-PAGE (Competitor URLs table) enhancements — Phases 1–3 (R1–R5) ✅ DEPLOYED-AND-VERIFIED 2026-06-01-b** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director Phase 4 PASS on all five deploys; `main` went `69da40c → b134b5d → e0661ba → b27841f → 1f18308 → 7a10ba4` (five clean ff-merges). **A requirements-gathering opener that became a 3-phase BUILD + DEPLOY session.**

**Session shape (a session-start reprioritization + requirements-gathering + 3 build phases / 5 deploys + end-of-session doc-batch):**

- **The (a.119) director-defer + P-54 creation.** The session was scheduled to open (a.119) = the `/comprehensive-analysis` AI-summary requirements-gathering, but at session start the director said, verbatim: *"I want to work on something different today and defer this step for the session after the requirements of the features mentioned today are finished."* The director directed a NEW batch of 9 `/competition-scraping` main-page enhancements (R1–R9), captured VERBATIM in a NEW spec doc `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§1 verbatim directive + §2 code-truth findings + §3 resolved decisions D1–D9 + 5-phase plan + §4 open questions) per `feedback_no_fabricated_instructions` + `feedback_plan_output_shape_before_building`. Requirements-gathering ran via multiple AskUserQuestion rounds (all director-answered). **(a.119) remains DEFERRED/queued — NOT closed.**
- **Phase 1 (`b134b5d`)** = R1 last-column right-edge resize (a `ColumnResizeHandle` on the trailing row-actions `th` targeting the last visible data column) + R3 removed the redundant blue "Comprehensive Competitor Analysis" button in `CompetitionScrapingViewer` (duplicate of the top "Comprehensive Analysis" nav tab). No schema change. Director PASS.
- **Phase 2 (`e0661ba` + FF1 `b27841f` + FF2 `1f18308`)** = R2 + R4 — removed the table's inner `overflow:auto`/`maxHeight` scroll box so the WHOLE PAGE scrolls both axes via the browser's own scrollbars; `<thead>` stays `position:sticky;top:0` so the header pins to the WINDOW (D1 REVISED — director picked whole-page window-scrollbars over the earlier floating-bar idea). FF1 = shrink-wrap the table wrapper (`width:max-content`) + a 48px trailing gap so the page scrolls to the full table width + the last-column resize edge is grabbable. FF2 = grey panel shrink-wraps to full table width (grey bg/border extends right) + `MAX_COLUMN_WIDTH` raised 600→4000 + auto-scroll-during-resize in `ColumnResizeHandle` (document-space width `[clientX+scrollX]` + `requestAnimationFrame` `window.scrollBy` near the right edge) so the last column drags as far right as needed with the page following. No schema change. Director PASS.
- **Phase 3 (`7a10ba4`)** = R5 drag-reorder columns by the header (each header gets a ⠿ grip; a horizontal `SortableContext` sharing the ONE `DndContext` with the vertical row-reorder list, id-discriminated in `handleDragEnd`) + the WHOLE main-table layout (column order + show/hide + widths + competitor row order + font size) is now SHARED across the Project: NEW additive Prisma model `ProjectTablePreferences` (`projectId @unique`, incl. NEW `columnOrder Json`) + NEW handler `project-table-preferences.ts` (project-keyed GET/PUT with SEED-ON-READ from the user's `UserTablePreferences` so the pre-existing layout is preserved) + NEW route `/competition-scraping/project-table-preferences` + NEW pure helper `src/lib/competition-scraping/column-order.ts` (`applyColumnOrder` + `moveColumnKey`, +11 node:test) + shared-types `ProjectTablePreferences`; the per-user `UserTablePreferences` is untouched. `prisma db push` applied the additive table to prod (1.27s, zero data loss). Director PASS.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 1 NEW Group B polish-item-spec (P-54). **This doc-batch commit ff-merges to main per the standard 3-push pattern (all five builds are already on main; nothing held back).**

**FIVE Rule 9 deploy gates — all director Yes; many Rule 14f non-deploy requirements/design pickers, all director-answered.** Notable OVERRIDES of the Recommended option: (a) "editable in the table too" for the Phase-5 category cells (over read-only); (b) "shared across the Project" for ALL table settings (over per-user); (c) whole-page window scrollbars over the earlier floating bar (D1 revised). The Phase 3 gate also named + authorized the `prisma db push`.

**Schema-change-in-flight flag NO at entry → YES (Phase 3) → FLIPPED YES→NO at the Phase 3 deploy push (`7a10ba4`)** — the additive `ProjectTablePreferences` table shipped to production via director-approved `npx prisma db push` (Rule 8; zero data loss). **NEXT session = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26)** — Tasks #1–#5 all completed (R3, R1, Phase-1 deploy, Phase-2, Phase-3). The (a.119) `/comprehensive-analysis` defer is a SESSION-LEVEL reprioritization captured in ROADMAP + the existing P-51 spec — NOT a TaskList DEFERRED item.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** (zero extension change all session) + src/lib `node:test` = **1249/1249** (+11 from 1238 — `column-order.test.ts`: `applyColumnOrder` + `moveColumnKey`) + `npm run build` = **71 routes** (+1 from 70 — the new `project-table-preferences` endpoint); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only change, zero extension change, all 5 deploys).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-01-b** (no top-tier slip — director PASSED all 5 deploys) capturing: (1) the (a.119) director-defer + the clean P-54 creation (requirements captured verbatim); (2) the Phase-2 scroll model took 2 fix-forwards from director feedback and the resulting FOUR NEW reusable PATTERNS — "Shrink-wrap a horizontally-overflowing table wrapper (`width:max-content`) + a trailing `paddingRight` gap so the PAGE owns the horizontal scroll AND the last-column resize edge is reachable" + "Auto-scroll the window during a resize drag (RAF + document-space width = `clientX+scrollX`)" + "Two sortable axes (vertical rows + horizontal column headers) in ONE dnd-kit DndContext, discriminated by id in `onDragEnd`" + "Seed-on-read migration from a per-user store to a shared per-Project store preserves the user's existing layout". **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** NO new memory file.

**1 NEW Group B polish-item-spec CREATED** — `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§1–§4; Phases 1–3 marked DEPLOYED-AND-VERIFIED; D1 revised; D6 resolved share-everything). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED (not Reviews work this session).

**NEW ROADMAP polish-backlog entry P-54** (🟢 IN-FLIGHT — Phases 1–3 shipped; Phases 4–5 queued) + (a.120) opens for P-54 Phase 4.

**SIXTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-54 (and the still-queued (a.119) `/comprehensive-analysis`) are W#2-only work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `7a10ba4` + the end-of-session doc-batch SHA. **Normal state — nothing held back.** Verify with `git log origin/main..HEAD --oneline` showing 0 (or only brand-new work); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54, read §2 + §3 of each at session start — ESPECIALLY P-54):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — only if a schema shape emerges) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md`** — THE canonical spec: §1 verbatim director directive, §2 code-truth findings, §3 resolved decisions D1–D9 (Phase 4 = D2/R6; resolve open question Q-H FIRST), the 5-phase plan (Phases 1–3 marked DEPLOYED-AND-VERIFIED), §4 open questions (Q-H before Phase 4; Q-F + Q-I before Phase 5).
- **The grouped-page precedent (the pattern Phase 4 mirrors):** `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` + `reviews-analysis-by-type/page.tsx` + `src/lib/competition-scraping/category-table-grouping.ts` + `type-table-grouping.ts` (banner-row layout + two-level @dnd-kit drag — the precedent for grouping the main table by Platform / Category / Type).
- **The main-table surface (Phase 1–3 as-built):** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` + `url-table-columns.ts` + `ColumnResizeHandle.tsx` + `ColumnVisibilityBar.tsx` + parent `CompetitionScrapingViewer.tsx`; the NEW shared-layout seam `src/lib/competition-scraping/handlers/project-table-preferences.ts` + `column-order.ts` + the shared-types `ProjectTablePreferences` (Phase 4 grouping must coexist with the column reorder + shared layout shipped in Phase 3).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-b (this session's informational entry — the 4 NEW Patterns + the (a.119) defer) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling; confirm branch + task against the roadmap).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — the governing memories: resolve Q-H WITH the director before building; act only on captured-verbatim directives.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` (any new persisted grouping field is a Rule 23 / Rule 8/9 trigger — audit before `prisma db push`) + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 decisions + the 5-phase plan + §4 open question Q-H).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.120) P-54 Phase 4 — the "Sort By" grouping box):** add a "Sort By" control to the main Competitor URLs table that groups rows by Platform / Category / Type as banner-row groups (mirroring the By-Category/By-Type page pattern — `category-table-grouping.ts` / `type-table-grouping.ts` + banner-row + two-level @dnd-kit drag), per D2 in the P-54 spec. **Resolve open question Q-H WITH me BEFORE coding** (per `feedback_plan_output_shape_before_building`): confirm the "Sort By" box has a "None"/flat default = the current ungrouped table, and confirm how grouping coexists with the Phase-3 column reorder + the existing per-column click-sort + the row drag-reorder. Then, on my go-ahead, build it, scoreboard-verify, deploy, and Phase-4 real-Chrome verify on vklf.com.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 (or only brand-new work) — main and workflow-2 are both at 7a10ba4 + the 2026-06-01-b doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (resolve Q-H + plan the grouping UX BEFORE coding — Rule 14f + `feedback_plan_output_shape_before_building`):**

- **Resolve Q-H with the director:** confirm the "None"/flat default; confirm how grouping coexists with (1) the Phase-3 drag-to-reorder columns + shared layout, (2) the existing per-column click-sort, and (3) the row drag-reorder. Decide whether the chosen grouping mode persists (and if so, into `ProjectTablePreferences` — a possible additive field, Rule 23/Rule 8 if so) or is per-view only.
- **Plan the grouping UX shape with the director** (where the "Sort By" control sits, the banner-row appearance, whether row-drag is scoped within a group like the grouped pages, how the column reorder interacts with grouped rows).

**Phase 1+ (the build — only after Q-H settles):**

- Build the grouping box, REUSING the grouped-page pattern (a new pure grouping helper mirroring `category-table-grouping.ts`/`type-table-grouping.ts`, banner rows, two-level @dnd-kit drag in the existing ONE `DndContext`). Prefer reuse-and-generalize over duplication.
- Test coverage: positive tests on any new pure grouping helper; negative tests asserting the Phase-1–3 behaviors (last-column resize, page scroll, sticky header, column reorder, shared layout) are unchanged.

**Phase 2+ (deploy decision Rule 14f, once the work lands + scoreboard-verifies):** fire the deploy-now picker. On Yes, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com. If a grouping-mode column ships, flip Schema-change-in-flight NO→YES→NO at the deploy push (`prisma db push`; additive; zero data loss per Rule 23).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1249 (entry 1249; +N if a new grouping pure helper ships)
- `npm run build` = 71 routes (UNCHANGED unless a new endpoint is added — grouping is render-layer, likely no new route; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (likely a DEPLOY session with director real-Chrome Phase 4; @dnd-kit drag is impractical to Playwright reliably)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned IF the session reaches a build. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO at entry**; flips to YES→NO at a deploy push only if a grouping-mode persisted field ships (confirm WITH the director first).

**Group A docs to update at session end:** ROADMAP header bump + P-54 entry status update (Phase 4 ✅) + (a.120) close / (a.121) open + CHAT_REGISTRY header bump (186th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` — mark Phase 4 DEPLOYED-AND-VERIFIED in §3 + record the Q-H resolution. `docs/COMPETITION_SCRAPING_DESIGN.md` — OPTIONAL: a §B note about the main-table grouping if it materially changes the page's design intent (your discretion).

**Standing carry-overs into this session:**

- **P-54 Phase 5** (the dynamic text/image/video category columns; R7/R8/R9; D3–D9; likely a schema change; Q-F + Q-I open) — after Phase 4.
- **(a.119) `/comprehensive-analysis` AI-summary** — DEFERRED by the director to "the session after P-54's features are finished"; ASK-DIRECTOR-FIRST when it comes up (verbatim directive in ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01-b + the P-54/P-51 specs).
- **P-53 Excel "Export Table"** for the Category + Type pages — LOW; never built on Category either.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable once P-54 + (a.119) settle (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.120) P-54 Phase 4 is the PICK because it is the obvious next P-54 unit** — Phases 1–3 (R1–R5) shipped this session; Phase 4 (R6, the "Sort By" grouping box, D2 in the spec) is the next phase in the locked 5-phase plan. The §4 Step 1c forced-picker outcome is P-54 Phase 4.
- **(a.119) `/comprehensive-analysis` is queued BEHIND P-54, not closed** — the director explicitly DEFERRED it at session start ("defer this step for the session after the requirements of the features mentioned today are finished"). It stays a live recommended item; do NOT treat it as closed. The directive is captured verbatim (ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01-b + the P-51/P-54 specs) per `feedback_no_fabricated_instructions`.
- **Q-H must be resolved with the director BEFORE coding** — per `feedback_plan_output_shape_before_building`; grouping has to coexist with the Phase-3 column reorder + the per-column sort + the row drag, and the default must be confirmed as "None"/flat.
- **Schema-change-in-flight = NO at entry** because the `ProjectTablePreferences` table already shipped to prod this session; Phase 4 grouping is render-layer unless the director wants the grouping mode persisted (then a small additive field, confirmed first).
- **Branch state is normal** (nothing held off main this session — all five builds + the doc-batch land on main).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.120.alt1) P-54 Phase 4 — the "Sort By" grouping box** (current PICK — pre-loaded above). Resolve Q-H first; mirror the grouped-page pattern; on `workflow-2-competition-scraping`.
- **(a.120.alt2) P-54 Phase 5 — the dynamic text/image/video category columns** (R7/R8/R9; D3–D9; stacked aligned sub-rows, editable-in-table, refetch-on-return, shown-by-default, locked column pairs; likely a schema change; resolve Q-F + Q-I first; the larger feature — director may want it before Phase 4, though Phase 4 is the planned order).
- **(a.120.alt3) (a.119) `/comprehensive-analysis` AI-summary requirements-gathering** (the deferred item; ASK-DIRECTOR-FIRST; reconcile with the P-51 skeleton; the director said it returns "after P-54's features are finished," so this is only if the director re-prioritizes).
- **(a.120.alt4) P-53 Excel "Export Table" for the Category + Type pages** (the deferred convenience export; mirror `reviews-table-export.ts`; on `workflow-2-competition-scraping`).
- **(a.120.alt5) Category/Type/main-table editable banner name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.120.alt6) W#2 graduation** (schedulable now that P-49 W5 is closed; director's discretion).
- **(a.120.alt7) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.120.alt8) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+; quick palate-cleanser).
- **(a.120.alt9) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
