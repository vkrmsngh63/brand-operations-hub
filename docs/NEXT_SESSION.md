# Next session

**Written:** 2026-06-01-c (`session_2026-06-01-c_p54-competition-scraping-main-table-phase-4-sort-by-grouping` — W#2 polish P-54 Phase 4 — the "Sort By" grouping box on the MAIN `/competition-scraping` Competitor URLs table (R6 / D2) ✅ DEPLOYED-AND-VERIFIED 2026-06-01-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director Phase 4 verbatim verdict: "pass"; `main` went `95f8fd9 → 87d8efa`). A NEW "Sort By" box groups the main table's rows by Platform / Category / Type into banner-row groups; "None" (flat) stays the default. **Q-H was resolved WITH the director via a 3-question design picker BEFORE coding** (all 3 Recommended chosen). **Opens (a.121) RECOMMENDED-NEXT = P-54 Phase 5 — the dynamic text/image/video category columns** on `workflow-2-competition-scraping`.)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This was the THIRD session of 2026-06-01, stamped `2026-06-01-c`. The prior REAL sessions today are `2026-06-01` (P-49 W5 Type page, build `f23df1b`) + `2026-06-01-b` (P-54 Phases 1–3, build `7a10ba4`). The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session. Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** P-54 (and the still-queued (a.119) `/comprehensive-analysis`) are W#2-only work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NORMAL.** Nothing held back this session: the Phase 4 build (`87d8efa`) AND this session's end-of-session doc-batch land on main (the parent ff-merges the doc-batch per the standard 3-push pattern). `main` and `workflow-2-competition-scraping` are BOTH at `87d8efa` plus the end-of-session doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show only the doc-batch commit (or 0 after the parent's ff-merge) at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session — but Phase 5 LIKELY introduces schema.** This session FLIPPED NO → YES (Phase 4) → NO at the deploy push (the additive `ProjectTablePreferences.groupBy` + `groupOrder` fields shipped to prod via `prisma db push`). **Phase 5 (the dynamic text/image/video category columns) is EXPECTED to need a schema change** — the spec notes it "may need schema for storing the shared column order of dynamic pairs keyed by category name" (D8 locked pairs). Confirm WITH the director and run the Rule 23 Change Impact Audit BEFORE any `prisma db push`. Treat the flag as NO at entry, flip NO→YES→NO at the Phase 5 deploy push if/when a field ships.

---

## What we did this session (in plain terms)

You asked us to add a **"Sort By" box** to your main Competitor URLs table (the big table on the `/competition-scraping` page). It is now live and verified on vklf.com:

- **There is a new "Sort By" box** sitting next to your Platforms and Columns boxes. Pick **Platform**, **Category**, or **Type**, and the rows gather into labelled groups with a banner heading for each group — the same look-and-feel as your "By Category" and "By Type" pages.
- **"None" stays the default** — leave it there and you get the normal flat table exactly as before.
- **Inside each group you can still do everything** — click a column to sort the rows within the group, and drag rows up and down within the group.
- **The group banners themselves are draggable** — drag a whole group above or below another to reorder the groups.
- **Your column order is untouched by grouping** — the columns stay in whatever order you dragged them; grouping only changes how the rows are gathered.
- **Anything without a Category or Type goes into a "(Uncategorized)" / "(Untyped)" group pinned at the bottom**, so nothing gets lost.
- **Your grouping choice is shared across everyone on the Project** (the same way the rest of the table layout is shared), so the whole team sees the same grouping.

Before we built any of this, we asked you three quick questions about how grouping should behave (the "Q-H" questions), and you picked all three of our recommended answers — so the build matched exactly what you wanted on the first try.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the P-54 entry — Phases 1–4 shipped, Phase 5 queued) + `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 decisions + 5-phase plan + §4 open questions Q-F + Q-I).

- **(a.121) P-54 Phase 5 — the dynamic text/image/video category columns** — NEXT SESSION (see below); the LAST P-54 piece.
- **(a.119) `/comprehensive-analysis` AI-summarizing functionality** — DEFERRED by the director to "the session after P-54's features are finished"; still queued; ASK-DIRECTOR-FIRST when it comes up.
- **(P-53) Excel "Export Table" button for the Category + Type pages** — never built on either grouped page; LOW; deferred.
- **(optional refinement) editable banner category/type/group name** on the grouped pages + the main table.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session builds the **dynamic content/image/video category columns** for the main Competitor URLs table — the LAST and BIGGEST piece of P-54. In plain terms:

1. **First we settle two open questions with you (Q-F and Q-I) BEFORE building.** Q-F is about how the new category columns are named and what happens when a new category appears or an old one is removed. Q-I is about how you'll edit the "Your Analysis" text right inside the table cell (a pop-out editor vs. typing directly in the cell), since that text can be richly formatted. We will ask you about both BEFORE writing any code.
2. **Then we build the dynamic columns.** Each captured text/image/video item stacks in its category column with its "Your Analysis" sitting exactly beside it; the columns show up automatically when their content exists; you can edit the cells right in the table; the data refreshes when you come back to the page; and each category column + its analysis column move together as a locked pair when you reorder columns.
3. **This one likely needs a small database change** to remember the order of the new column pairs — we'll confirm that with you and check it's safe (additive, no data loss) before applying it.
4. **Then we ship + verify it with you** on vklf.com, the same way we shipped Phases 1–4.

After Phase 5, P-54 is finished, and the deferred "Comprehensive Analysis" planning ((a.119)) comes back around.

## What's still left in the total roadmap (in plain terms)

- **P-54 (main Competitor URLs table enhancements)** — Phases 1–4 ✅ shipped + verified (Phases 1–3 on 2026-06-01-b, Phase 4 on 2026-06-01-c). **Phase 5 (dynamic content/image/video category columns) = the last piece, next.**
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

**P-54 Phase 4 — the "Sort By" grouping box on the MAIN `/competition-scraping` Competitor URLs table (R6 / D2) ✅ DEPLOYED-AND-VERIFIED 2026-06-01-c** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director Phase 4 verbatim verdict: "pass"; `main` went `95f8fd9 → 87d8efa` (clean ff-merge). **A BUILD + DEPLOY session: ONE build, ONE deploy, ONE Rule 9 deploy gate + ONE Q-H 3-question design picker BEFORE coding.**

**Session shape (Q-H design picker BEFORE coding + 1 build + 1 deploy + end-of-session doc-batch):**

- **Q-H resolved WITH the director BEFORE coding** (per `feedback_plan_output_shape_before_building`) via a 3-question design picker — the director chose ALL THREE Recommended options: (1) persist the grouping mode + the per-mode banner order, SHARED across the Project (consistent with the Phase-3 share-everything model); (2) per-column click-sort AND row-drag both work WITHIN each group (mirror the grouped pages); (3) the group banners are themselves draggable (two-level drag). The Phase-3 column reorder stays INDEPENDENT of grouping. "None"/flat confirmed as the default.
- **Build (`87d8efa`)** = R6 per D2 — a NEW "Sort By" box (beside Platforms / Columns in `ColumnVisibilityBar`) that groups the main table's rows by Platform / Category / Type into banner-row groups (mirroring the By-Category / By-Type pages); "None" (flat) is the default; within a group both per-column click-sort and row-drag work; group banners are draggable (two-level drag); the empty bucket renders "(Uncategorized)" / "(Untyped)" pinned last. NEW pure helper `src/lib/competition-scraping/main-table-grouping.ts` (`buildMainGroupedRows` re-buckets ALREADY-SORTED rows — grouping is a re-bucketing LAYER, not a re-sort — + `groupKeyOf` / `groupLabelOf` / `reorderableGroupKeys` / `coerceGroupOrderMap` + `GroupByMode` / `ActiveGroupMode` types; +21 node:test). Additive `ProjectTablePreferences.groupBy String @default("none")` + `groupOrder Json @default("{}")` (`prisma db push` 1.28s, zero data loss). Shared-types + `handlers/project-table-preferences.ts` threaded (validate via `isGroupByMode` + `coerceGroupOrderMap`). `CompetitionScrapingViewer.tsx` got groupBy/groupOrder state + load + debounced PUT (`handleGroupByChange` + `handleGroupReorder`). `UrlTable.tsx` grouped render = banner rows + per-group `SortableContext` inside the existing ONE `DndContext` (id-discriminated as column-key / `grp:` banner / row-id; `MeasuringStrategy.Always` + autoScroll only when grouped) + NEW `GroupBannerRow` component; REUSES `applyCategoryDrag` / `applyCompetitorDrag` from `category-table-layout` (generic pure string-array ops); the flat path is UNCHANGED (Phases 1–3 untouched). Director PASS.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 1 MODIFIED Group B polish-item-spec (P-54) + a NEW §B 2026-06-01-c note in `docs/COMPETITION_SCRAPING_DESIGN.md`. **This doc-batch commit ff-merges to main per the standard 3-push pattern (the Phase 4 build is already on main; nothing held back).**

**ONE Rule 9 deploy gate — director "Yes — deploy + db push" (the gate explicitly named + authorized the `prisma db push`). Plus ONE Q-H 3-question design picker (all 3 Recommended chosen) BEFORE coding.** No override this session — all three Q-H choices were Recommended.

**Schema-change-in-flight flag NO at entry → YES (Phase 4) → FLIPPED YES→NO at the deploy push (`87d8efa`)** — the additive `ProjectTablePreferences.groupBy` + `groupOrder` fields shipped to production via director-approved `npx prisma db push` (Rule 8; zero data loss). **NEXT session (Phase 5) = NO at entry**, but Phase 5 LIKELY introduces schema (the locked-pair column-order store) — confirm at that session's start.

**ZERO open DEFERRED items at exit (Rule 26)** — Tasks #1–#5 all completed. The (a.119) `/comprehensive-analysis` defer is a SESSION-LEVEL reprioritization from 2026-06-01-b captured in ROADMAP + the P-51/P-54 specs — NOT a TaskList DEFERRED item.

**Baselines locked from this session:** root tsc clean (UNCHANGED) + extension tsc clean (UNCHANGED) + extension `npm test` = **910/910 UNCHANGED** (zero extension change all session) + src/lib `node:test` = **1270/1270** (+21 from 1249 — `main-table-grouping.test.ts`) + `npm run build` = **71 routes UNCHANGED** (grouping reuses the existing `project-table-preferences` endpoint — no new route); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only change, zero extension change, @dnd-kit drag impractical to Playwright reliably, deploy session w/ director real-Chrome Phase 4).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-01-c** (no top-tier slip — director PASSED the deploy) capturing: (1) the Q-H clean resolution (a 3-question picker BEFORE coding; all 3 Recommended chosen); (2) the NEW reusable PATTERN — "Grouping as a re-bucketing LAYER over already-sorted rows: pass the display-ordered rows into the grouping helper and preserve within-bucket input order, so the active column-sort / manual row order flows through for free — no re-sort inside the grouping, and the existing two-level-drag re-rank helpers (`applyCategoryDrag` / `applyCompetitorDrag`) generalize across pages because they are pure string-array ops." **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** NO new memory file.

**1 MODIFIED Group B polish-item-spec** — `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (Phase 4 marked DEPLOYED-AND-VERIFIED 2026-06-01-c in §3 + the §5 status header + the Q-H resolution recorded in §4) + a NEW §B 2026-06-01-c note in `docs/COMPETITION_SCRAPING_DESIGN.md`. `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED (not Reviews work this session).

**P-54 ROADMAP polish-backlog entry** updated → Phases 1–4 shipped, Phase 5 queued + (a.120) closes / (a.121) opens.

**SIXTY-FOURTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ONE `npx prisma db push` ran against PROD (additive `ProjectTablePreferences.groupBy String @default("none")` + `groupOrder Json @default("{}")`; 1.28s; zero data loss) — director-authorized via the Rule 9 deploy gate that explicitly named + approved the db push. No `migrate reset`, no drop, no destructive op. No memory-file edits. No file deletions outside normal build output. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact.
- **NEXT session (Phase 5):** LIKELY a `prisma db push` for the dynamic-column-pair order store — **additive only**; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE the push; never `migrate reset` against prod. Confirm Schema-change-in-flight NO→YES→NO around the push. No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the P-54 spec + the memory directory.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. P-54 (and the still-queued (a.119) `/comprehensive-analysis`) are W#2-only work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `87d8efa` + the end-of-session doc-batch SHA. **Normal state — nothing held back.** Verify with `git log origin/main..HEAD --oneline` showing 0 (or only brand-new work); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53 + P-54, read §2 + §3 of each at session start — ESPECIALLY P-54):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — Phase 5 LIKELY introduces schema) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md`** — THE canonical spec: §1 verbatim director directive, §2 code-truth findings, §3 resolved decisions D1–D9 (Phase 5 = D3/D4/D5/D7/D8/D9; the locked-pair interplay with Phase 3 reorder + Phase 4 grouping), the 5-phase plan (Phases 1–4 marked DEPLOYED-AND-VERIFIED), §4 open questions (resolve **Q-F** + **Q-I** BEFORE Phase 5).
- **The Phase-4 as-built (the grouping seam Phase 5 must coexist with):** `src/lib/competition-scraping/main-table-grouping.ts` (the re-bucketing grouping helper) + `handlers/project-table-preferences.ts` (the shared store, now carrying `groupBy` + `groupOrder`) + `components/UrlTable.tsx` (the grouped render — banner rows + per-group `SortableContext` in the ONE `DndContext`; the dynamic category columns must align inside both the flat AND grouped render paths) + `ColumnVisibilityBar.tsx` (the "Sort By" + Columns boxes — Phase 5 adds the "Content / Image / Video Categories" group checkboxes per D7).
- **The captured-item models + detail-page edit precedent (Phase 5's data source + edit pattern):** `CapturedText` / `CapturedImage` / `CapturedVideo` (+ `analysis`, `embeddedText`, `*Category`) in `prisma/schema.prisma`; detail render/edit in `url/[urlId]/components/UrlDetailContent.tsx` + `PerItemAnalysisBox.tsx`; PATCH routes `/text/[textId]`, `/images/[imageId]`, `/videos/[videoId]`; the per-Project category names in `VocabularyEntry` (`vocabularyType` = content-/image-/video-category); the reviews-table `rowSpan` sub-row alignment pattern (D3 stacked aligned sub-rows).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-c (this session's informational entry — the Q-H resolution + the re-bucketing-layer Pattern) + §Entry 2026-06-01-b (the 4 NEW Patterns + the (a.119) defer) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling; confirm branch + task against the roadmap).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** + **`feedback_no_fabricated_instructions.md`** — the governing memories: resolve Q-F + Q-I WITH the director before building; plan the in-cell rich-text editing UX (Q-I) WITH the director; act only on captured-verbatim directives.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` (the Phase 5 column-order store is a Rule 23 / Rule 8/9 trigger — audit + authorize BEFORE `prisma db push`) + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 decisions D3/D4/D5/D7/D8/D9 + the 5-phase plan + §4 open questions Q-F + Q-I).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.121) P-54 Phase 5 — the dynamic text/image/video category columns):** add dynamic category columns to the main Competitor URLs table — for each captured-content category (content / image / video), a column that stacks the captured items as aligned sub-rows with each item's "Your Analysis" beside it (D3 stacked aligned sub-rows, REUSE the reviews-table `rowSpan` pattern), shown by default when content exists with "Content / Image / Video Categories" group checkboxes in the Columns box (D7), editable in-table writing back to the same CapturedText/Image/Video records via the existing PATCH routes (D5/D9), refreshed when the page regains focus (D4 refetch-on-return), with each category column + its analysis column moving together as a locked pair under column reorder (D8) and aligning correctly inside BOTH the flat AND the Phase-4 grouped render paths. **Resolve open questions Q-F + Q-I WITH me BEFORE coding** (per `feedback_plan_output_shape_before_building`): Q-F = the dynamic column-pair identity keyed by category-name + the append/drop behavior when a category appears or is deleted; Q-I = the in-cell rich-text editing UX for the "Your Analysis" column (expand/popover editor vs inline) — TipTap rich text in a narrow cell needs a clean approach, plan the output shape WITH me. Then, on my go-ahead, build it (likely in sub-phases — text column first, then image, then video, per the spec's R7→R8→R9 order), scoreboard-verify, deploy, and real-Chrome verify on vklf.com.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 (or only brand-new work) — main and workflow-2 are both at 87d8efa + the 2026-06-01-c doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (resolve Q-F + Q-I + plan the dynamic-column UX BEFORE coding — Rule 14f + `feedback_plan_output_shape_before_building`):**

- **Resolve Q-F with the director:** the dynamic column-pair identity in the shared store keyed by category-name string; the behavior when a NEW category first appears (append at default position — left of `addedAt`, natural order) vs. when a category is DELETED (drop from the saved order). Confirm the default.
- **Resolve Q-I with the director (plan the output shape):** the in-cell rich-text editing UX for the "Your Analysis" column (D5) — expand-on-click / popover editor vs. raw inline contenteditable. "Your Analysis" is TipTap rich text — a narrow cell needs a clean editor surface. Plan the audience/placement/interaction WITH the director.
- **Plan the column-pair + locked-pair + grouped-alignment shape with the director** (where the new columns sit by default, how the locked pairs move under Phase-3 reorder, how the stacked sub-rows align inside the Phase-4 grouped render).

**Phase 1+ (the build — only after Q-F + Q-I settle):**

- Build the dynamic columns, REUSING the reviews-table `rowSpan` sub-row alignment + the detail-page per-item edit + PATCH routes + the `visibilitychange`/`focus` refetch pattern. Prefer reuse-and-generalize over duplication. Make the new columns align inside BOTH the flat AND the grouped render paths (the Phase-4 `buildMainGroupedRows` re-bucketing layer must be respected).
- Test coverage: positive tests on any new pure helper (column-pair identity / locked-pair reorder / append-drop on category change); negative tests asserting the Phase-1–4 behaviors (last-column resize, page scroll, sticky header, column reorder, shared layout, the "Sort By" grouping) are unchanged.

**Phase 2+ (deploy decision Rule 14f, once the work lands + scoreboard-verifies):** fire the deploy-now picker. On Yes, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com. **If a locked-pair column-order field ships, flip Schema-change-in-flight NO→YES→NO at the deploy push (`prisma db push`; additive only; Rule 23 Change Impact Audit + explicit director authorization FIRST; zero data loss).**

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1270 (entry 1270; +N for any new dynamic-column pure helpers)
- `npm run build` = 71 routes (likely UNCHANGED unless a new endpoint is added — the cell edits reuse the existing PATCH routes; confirm)
- Check 6 Playwright SKIPPED per Rule 27 (likely a DEPLOY session with director real-Chrome Phase 4; in-cell rich-text editing + @dnd-kit drag are impractical to Playwright reliably)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned IF the session reaches a build (Phase 5 may sub-phase across multiple deploys — text, image, video). On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO at entry**; flips to YES→NO at a deploy push if/when the locked-pair column-order store ships (LIKELY — confirm + audit + authorize WITH the director first).

**Group A docs to update at session end:** ROADMAP header bump + P-54 entry status update (Phase 5 ✅ — and if Phase 5 is the last, mark P-54 CLOSED) + (a.121) close / (a.122) open + CHAT_REGISTRY header bump (187th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` — mark Phase 5 DEPLOYED-AND-VERIFIED in §3 + record the Q-F + Q-I resolutions in §4 + (if Phase 5 closes P-54) the §5 status header. `docs/COMPETITION_SCRAPING_DESIGN.md` — a §B note about the dynamic category columns if it materially changes the page's design intent (your discretion).

**Standing carry-overs into this session:**

- **(a.119) `/comprehensive-analysis` AI-summary** — DEFERRED by the director to "the session after P-54's features are finished"; once Phase 5 closes P-54, this is the NEXT logical item — ASK-DIRECTOR-FIRST when it comes up (verbatim directive in ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01-b + the P-54/P-51 specs).
- **P-53 Excel "Export Table"** for the Category + Type pages — LOW; never built on Category either.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable once P-54 + (a.119) settle (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.121) P-54 Phase 5 is the PICK because it is the LAST P-54 unit** — Phases 1–4 (R1–R6) shipped; Phase 5 (R7/R8/R9, the dynamic category columns, D3–D9) is the final phase in the locked 5-phase plan. The §4 Step 1c forced-picker outcome is P-54 Phase 5.
- **(a.119) `/comprehensive-analysis` is queued BEHIND P-54, not closed** — the director explicitly DEFERRED it at 2026-06-01-b's session start ("defer this step for the session after the requirements of the features mentioned today are finished"). Once Phase 5 closes P-54, (a.119) becomes the next logical item — but it stays a live recommended item; do NOT treat it as closed. The directive is captured verbatim (ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01-b + the P-51/P-54 specs) per `feedback_no_fabricated_instructions`.
- **Q-F + Q-I must be resolved with the director BEFORE coding** — per `feedback_plan_output_shape_before_building`; Q-I (the in-cell rich-text editing UX) is an output-shape/UI-surface decision that must be planned WITH the director, not shipped unilaterally; Q-F (column-pair identity + append/drop) sets the persisted shape.
- **Schema-change-in-flight = NO at entry but Phase 5 LIKELY introduces schema** — the locked-pair column-order store ("may need schema for storing the shared column order of dynamic pairs keyed by category name"). Treat as NO at entry; audit + authorize + flip NO→YES→NO at the deploy push if a field ships.
- **The dynamic columns must align inside BOTH the flat AND the Phase-4 grouped render paths** — the Phase-4 grouping is a re-bucketing layer over already-ordered rows; the stacked sub-rows + locked pairs have to render correctly under grouping too. Read `main-table-grouping.ts` + the grouped branch in `UrlTable.tsx` first.
- **Branch state is normal** (nothing held off main this session — the Phase 4 build + the doc-batch land on main).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.121.alt1) P-54 Phase 5 — the dynamic text/image/video category columns** (current PICK — pre-loaded above). Resolve Q-F + Q-I first; REUSE the reviews-table `rowSpan` + detail-page edit + PATCH routes + refetch-on-return; align inside both the flat AND grouped paths; on `workflow-2-competition-scraping`.
- **(a.121.alt2) (a.119) `/comprehensive-analysis` AI-summary requirements-gathering** (the deferred item; ASK-DIRECTOR-FIRST; reconcile with the P-51 skeleton; the director said it returns "after P-54's features are finished" — so this is the natural successor once Phase 5 closes P-54, or if the director re-prioritizes now).
- **(a.121.alt3) P-53 Excel "Export Table" for the Category + Type pages** (the deferred convenience export; mirror `reviews-table-export.ts`; on `workflow-2-competition-scraping`).
- **(a.121.alt4) Category/Type/main-table editable banner/group name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.121.alt5) W#2 graduation** (schedulable once P-54 + (a.119) settle; director's discretion).
- **(a.121.alt6) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.121.alt7) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+; quick palate-cleanser).
- **(a.121.alt8) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
