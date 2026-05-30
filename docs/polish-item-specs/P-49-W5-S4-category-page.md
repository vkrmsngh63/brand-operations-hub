# Reviews Analysis By Competitor Category Table — full spec

**Polish-item ID:** P-49 W5 Session 4 (part of the multi-session corrective rebuild after the 2026-05-28 scope-misread rollback)
**Created:** 2026-05-28
**Session that captured §1:** `session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning`
**Status:** SPEC LOCKED at §1 level (verbatim); §2/§3 in active discussion with director per Block-1-onwards planning conversation.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-05-28 — director's original verbatim instructions for the Category page (captured after the rollback of the wrong-spec build commit `5fa1f53` via revert commit `958ccf8`):**

> REVIEWS ANALYSIS BY COMPETITOR CATEGORY TABLE:
>
> - When the toggle is on 'Reviews Analysis By Competitor Category Table', then the user should be taken to the 'Reviews Analysis By Competitor Category Table' page where the header is the same as the competition scraping page, however below that should be a table that has the following columns mentioned in order of leftmost going right:
>
>   -- Category, Platform, Type, Product Name, Results Rank, Competition Score, URL, Stars (which shows the star count of the review to its right), Reviews Summary, Competitor Comprehensive Reviews Analysis (bulleted), Competitor Comprehensive Reviews Analysis (non-bulleted), Category Comprehensive Reviews Analysis (bulleted), Category Comprehensive Reviews Analysis (non-bulleted).
>
>   The way the data should be posted into this table is that essentially the data from the 'Competitor Reviews Analysis Table' should be reorganized by common Categories in the category table in the following manner... The table should first list a category in a row and a competitor data that is associated with that category (data taken from the 'Competitor Reviews Analysis Table') should be added to that row. Then the next competitor's data that is associated with the same category should be added to the next row but the cell in the 'Category' column in that row should be empty to signal that the competitor is associated with that same category as the first row above it that has data in the 'Category' column. This pattern should repeat until all the competitor's associated with that specific category are listed in individual rows. Then the next category should be listed in the category column and the competitors associated with that category should be listed in individual rows in the same manner. In this way all the data from the 'Competitor Reviews Analysis Table' should be re-listed into the 'Reviews Analysis By Competitor Category Table' such that no categories and no competitors are skipped.
>
>
> There should be check boxes to show/hide each of the columns in the table just the way there are checkboxes to do the same in the 'Competitor Content Table'. The user should also be able to grab and move a main category row within the table relative to other main category rows and the competitor details rows associated with the main category row should move accordingly to maintain its association in the table. Also, the user should be able to move competitor details rows associated with a category relative to each other to modify the order in which they are listed. All cells should be editable by clicking them.
>
>
> There should also be an 'Auto-create Category Comprehensive Reviews Analysis (bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Reviews Analysis By Competitor Category Table' and then the AI model should analyze the review summaries in 'Competitor Comprehensive Reviews Analysis (bulleted)' column. The way this should happen is that each chat should be assigned a single category so that it can analyze all the 'Competitor Comprehensive Reviews Analysis (bulleted)' column cells associated with it. Then the AI model should come up with a single comprehensive bulleted list that encompasses all the critical reviews while removing redundancies between the review summaries so that the new bulleted list of critical reviews contains all the critical review components without the same components mentioned more than once. This comprehensive bullet list is not just a merging of all the individual review summary bullets, it is essentially the act of removing redundant complaints while still keeping the individual unique complaints intact. Then this comprehensive bullet list should be pasted into the cell in the 'Category Comprehensive Reviews Analysis (bulleted)' column in the cell in the same row as the main category row where the category being analyzed is listed in the 'Reviews Analysis By Competitor Category Table'. The way the AI tool should be designed is that it should know which cells to analyze next without losing track and which cells to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Everything should be done server-side. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency.
>
>
> Next to the 'Auto-create Category Comprehensive Reviews Analysis (bulleted)' button, should be the 'Auto-create Category Comprehensive Reviews Analysis (non-bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Reviews Analysis By Competitor Category Table' and then the AI model should analyze the review summaries in 'Category Comprehensive Reviews Analysis (bulleted)' column. The way this should happen is that each chat should be assigned a single category so that it can analyze the data in the cell in the 'Category Comprehensive Reviews Analysis (bulleted)' column associated with that category. Then the AI model should come up with a detailed analysis of the bullet list and presented in a paragraphs manner that paints a clear picture of the competitor's shortcomings in that category in a way that can be used to effectively critique the competitors in that category on a product comparison website. The idea is to challenge entire categories of products by targeting their common issues. Then this comprehensive analysis should be pasted into the cell in the 'Category Comprehensive Reviews Analysis (non-bulleted)' column in the same row as the main category row for which the AI model performed the comprehensive review analysis.
>
> The way the AI tool should be designed is that it should know which cell to analyze next without losing track and which cell to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Everything should be done server-side. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency. Note that this bullet list should also be added to the 'Overall Analysis — Captured Reviews' box under the review in the url's details page. Since there may already be data in that box, make sure the new data is merged into that box by adding it to the very bottom so that no data that was previously in the box is overwritten.
>
> At the top, there should also be a 'Export Table' button that allows the user to export the table data of the 'Reviews Analysis By Competitor Category Table' in an excel file format.
>
> Note that during all AI runs for all the functionalities mentioned above, the tables in user's view should be updated in real-time as the AI updates the data in those tables.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

**2026-05-28 (session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning) — Block 0 foundational architecture decisions:**

- **Q1 — "server-side" interpretation:** Director clarified — NOT a long-running background-job pattern. Use the per-batch endpoint architecture (browser orchestrates the queue + pause/resume/cancel, server fires ONE Anthropic call per batch with the API key staying server-side). Same architecture as the existing `/competitor-reviews-analysis` page (W5 Sessions 2-3 shipped this for Per-Review + Per-Competitor flows). REUSES `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` — add new flow values to its SHIPPED_FLOWS dispatch.
- **Q2 — model options:** Opus 4.6 + Opus 4.7 (NOT Sonnet 4.6 as the original §1 spec stated). The original spec's mention of "Sonnet 4.6" was an oversight; director's locked answer is Opus 4.6 + Opus 4.7 across all four AI flows in this and the Type page, matching every other AI flow already shipped on this workflow.
- **Q3 — Type column data source:** Type values come from `CompetitorUrl.type` field (added in P-46 W1 2026-05-24 per `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11). Category values come from `CompetitorUrl.competitionCategory`. URLs with null/empty `competitionCategory` bucket into `(Uncategorized)`; same convention for Type → `(Untyped)` on the Type page.
- **Q4 — session decomposition:** 5-session plan approved (per "play the expert, safe + thorough" directive):
  - **Session 1** = Category page scaffold (route + flat 13-column table + first-row-carries-label grouping + column show/hide checkboxes + click-to-edit cells; NO drag, NO AI, NO Excel).
  - **Session 2** = Category page two AI flows (bulleted dedup + non-bulleted prose) + real-time per-cell painting + write-back to URL detail "Overall Analysis — Captured Reviews" box for non-bulleted.
  - **Session 3** = Category page two-level drag-to-reorder + persistence + Excel export.
  - **Session 4** = Type page scaffold + drag + Excel together (compressed since pattern is proven by then).
  - **Session 5** = Type page two AI flows (mirror Session 2 with type/Type substituted).

**2026-05-28 (same session) — additional discussion notes:**

- Block 1 (column-by-column spec confirmation) + Block 2 (drag persistence) + Block 3-4 (AI prompt drafting) + Block 5 (Type page spec mirror) all in active discussion after the spec docs land. Each block's resolution appends below as a new dated entry.

**2026-05-30 (`session_2026-05-30_p49-w5-category-page-session-1-scaffold-and-polish`) — Block 1 planning RESOLVED + Session 1 scaffold + 5-item polish SHIPPED + 3 follow-up fixes SHIPPED. Four deploys this day (`f08a41f` scaffold → `ee56398` polish → `90bfdf5` fixes → `9b1d023` scrollbar-gutter). Director Phase 4 verdicts all PASS.**

- **Block 1 open questions resolved (3/3 director Yes-to-Recommended):**
  - **Q-A + Q-B (folded into one decision) → "per-review stacked".** Each competitor is one logical block, but the **Stars** column and the **Reviews Summary** column each render a per-review list — one entry per captured review, the review's star rating beside its one-line summary. (Most faithful to §1's "Stars (which shows the star count of the review to its right)".) Stars + Reviews Summary are READ-ONLY.
  - **Q-C → reuse the shipped per-competitor non-bulleted prose flow.** Column 11 displays the `per-competitor-nonbulleted` PER_PRODUCT summary already generated on the sibling Competitor Reviews Analysis page (the flow shipped Fix Session C Deploy 1, 2026-05-29-c). No new per-category-specific non-bulleted flow needed for Column 11. (Supersedes Q-C's option (a) placeholder.)
  - **Q-D → mirror the sibling's `xlsx` export.** Use the same Excel toolkit + export helper the sibling page already ships (`src/lib/competition-scraping/reviews-table-export.ts`, library `xlsx ^0.18.5`). NOTE the helper lives at that path, NOT the `…/review-analysis/…` path the older handoff note guessed.
  - **Q-E (AI prompt content)** still deferred to start of Session 2. **Q-F (drag-persistence schema)** now folded into the deferred interactive batch below.

- **Session 1 scaffold SHIPPED (`f08a41f`):** route `reviews-analysis-by-category` + flat 13-column grouped table (first row of each category carries the label; `(Uncategorized)` last) + column show/hide checkboxes persisted via `UserTablePreferences` under the `categoryTable:` key prefix + click-to-edit on the URL-backed columns (1-7) + per-review stacked Stars/Reviews Summary + Columns 10/11 reuse the cached per-competitor bulleted/non-bulleted summaries + Columns 12/13 show `(not yet generated)`. NEW pure helpers `category-table-columns.ts` + `category-table-grouping.ts` (+29 node:test). Nav tab enabled. NO drag, NO AI-run buttons, NO Excel yet.

- **5-item polish SHIPPED (`ee56398`):** (1) Platforms filter box alongside Show columns; (2) full-length drag-to-resize column borders (incl. right edge) via the shared `ColumnResizeHandle`; (3) floating horizontal scrollbar pinned to the viewport bottom; (4) per-competitor AI content boxes fill the full cell height; (5) visible borders between the Stars/Reviews Summary sub-rows.

- **3 follow-up fixes SHIPPED (`90bfdf5` + `9b1d023`):** (1) table can now be dragged PAST the screen edge — explicit table width = Σ visible column widths so a fixed-layout table in an overflow-hidden container no longer collapses to container width; per-column MAX raised 600→1000; (2) **per-review row alignment** — each review is now a real sub-row (`<tr>`); the non-per-review columns become a single `rowSpan` cell on the first sub-row, while Stars + Reviews Summary render one cell per sub-row in the SAME `<tr>`, so a review's star sits beside its summary and the sub-row borders align across both columns (and the AI cells `rowSpan` the full competitor height → taller boxes); (3) column widths persist server-side reliably (added a `hasLoadedPrefs` gate so the debounced save can't fire with empty state before the initial load and wipe saved prefs); (4) `scrollbar-gutter: stable` + a 48px trailing scroll space so the vertical scrollbar never overlays the table's right edge / rightmost resize handle.

- **DEFERRED to the NEXT session (the "interactive batch") — director decisions locked 2026-05-30 (3/3 Yes-to-Recommended):**
  - **Drag whole categories** up/down (their competitor rows ride along) + **drag competitor rows within a category** relative to each other.
  - **Layout restructure required for the above (director-directed, supersedes §1's "first competitor on the category row"):** the category name moves to its OWN header row, and ALL competitor rows (including the first) sit BELOW it — so the first competitor row can be dragged relative to the others. The category-level AI columns (12/13) live on that header row.
  - **Hide a competitor** + **hide an entire category (with its competitor rows)** FROM THIS TABLE ONLY — never deleting data anywhere else. **Removal behavior = HIDE-WITH-RESTORE** (a "show hidden" control brings rows back; accidental removals are undoable).
  - **Scope = specific to this Category page** — the category order, the within-category competitor order, and the hidden-rows set apply ONLY to this table; the Competitor Content Table + Reviews Analysis Table are untouched. (This resolves Q-F: a per-user, per-Project "memory" area scoped to this page, NOT the shared `rowOrder`.)
  - **New behind-the-scenes "memory" area required (schema-change-in-flight = YES at the start of that session):** an additive, safe store for category order + within-category competitor order + hidden-competitor ids + hidden-category names. Likely new additive nullable JSON columns on `UserTablePreferences` (or a sibling per-user-per-Project preferences row); confirm the exact shape at the start of the build session.

- **Type page inheritance (director directive 2026-05-30):** ALL of the above — the 5 polish items, the 3 follow-up fixes, AND the deferred interactive batch — must be built into the **Reviews Analysis By Competitor Type** page (`P-49-W5-S5-type-page.md`) FROM THE START when it's built (Sessions 4-5). Captured in that spec's §2.

**2026-05-30-b (`session_2026-05-30-b_p49-w5-category-page-interactive-batch`) — the DEFERRED interactive batch SHIPPED. TWO deploys (`5f07f24` interactive batch + `469e5c6` FF1: fix category drag below the fold). Director Phase 4 verdict: "All passed." ✅ DONE.**

- **Banner-row layout restructure SHIPPED.** The category name moved onto its OWN shaded banner row — drag-grip + name + hide-category ✕ on the left; the two category-level AI cells (Columns 12/13) at the right — with every competitor row beneath it, so the FIRST competitor is now draggable. (Implements the director-directed layout restructure locked 2026-05-30. The banner category name is a READ-ONLY label this session — see the optional refinement below.)
- **Two-level @dnd-kit drag-to-reorder SHIPPED** in a SINGLE DndContext: drag whole categories (uncategorized pinned last, not draggable) via prefixed `cat:<key>` sortable ids in an outer SortableContext + drag competitors within a category via per-category nested SortableContexts; each per-competitor multi-`<tr>` sub-row block travels together via one shared transform. One `onDragEnd` disambiguates by the `cat:` prefix and guards competitor drags to same-category targets. (Resolves Q-F's drag behaviour.)
- **Hide-with-restore SHIPPED** — hide a competitor or a whole category from THIS page only, with a "Hidden on this page" restore panel that brings them back; never deletes data elsewhere.
- **The per-user/per-Project "memory" area SHIPPED** as one additive nullable `UserTablePreferences.categoryTableLayout` Json column `{ categoryOrder, rowOrderByUrlId, hiddenUrlIds, hiddenCategoryKeys }` (Rule 14f storage-shape picker: one additive nullable column, Recommended + chosen), threaded through the shared-types wire shape (`CategoryTableLayout`) + the existing `/table-preferences` GET/PUT handler (strict validation; `Prisma.DbNull` clears) — REUSING the existing endpoint, NO new route. `prisma db push` 1.29s, additive nullable, zero data loss. Schema-change-in-flight YES at entry → FLIPPED YES → NO at the deploy push `5f07f24`. NEW pure helper `category-table-layout.ts` + `category-table-grouping.ts` gained `foldIntoCategoryGroups`/`buildCategoryGroups` (src/lib node:test 1130 → **1156**, +26).
- **FF1 (`469e5c6`):** category drag failed for targets below the fold (the `overflowX:hidden` + floating-scrollbar container didn't auto-scroll); fixed with `MeasuringStrategy.Always` + explicit vertical `autoScroll` on the DndContext. NEW reusable Pattern memorialized (CORRECTIONS_LOG §Entry 2026-05-30-b Obs. 2).
- **(optional refinement — director may request):** the banner category name is a READ-ONLY label this session; making it editable to rename the WHOLE category group was deliberately deferred (not part of the drag / hide / remember scope; flagged to director at Phase 4). Captured as a sub-note on the P-49 ROADMAP entry.
- **Remaining Category-page work = Session 2 (the two Category AI flows):** the bulleted dedup flow + the non-bulleted prose flow, painting into Columns 12/13 on the banner rows, with the non-bulleted prose writing back to the URL detail "Overall Analysis — Captured Reviews" box. Q-E AI prompt content drafted with the director at Session 2's start; reuses `review-analysis-run-batch.ts` SHIPPED_FLOWS dispatch + the existing `ReviewAnalysis` PER_CATEGORY storage (Schema-change-in-flight NO at entry).

**2026-05-30-c (`session_2026-05-30-c`) — Session 2 BUILT (not yet deployed) + an FU-3 detail-page bug fix DEPLOYED + the NEW "Source Reviews" column DESIGNED + APPROVED. MIXED session: 1 deploy (`bdec02e`) + 2 undeployed build commits on `workflow-2-competition-scraping` (`d1659d7` backend + `fb772ad` frontend). Director chose to deploy the WHOLE Category Session 2 feature — the two summaries + the Source Reviews column — together next session.**

- **Q-E (AI prompt content) RESOLVED** — the prompt wording for the two category flows was settled with the director before code (per `feedback_plan_output_shape_before_building.md`). NEW prompts `PER_CATEGORY_BULLETED/NONBULLETED v1`.
- **The two Category AI flows BUILT (committed `d1659d7` + `fb772ad`, undeployed):**
  - **`per-category-bulleted`** — reads each in-category url's latest bulleted STRUCTURED per-competitor summary, labels the input bullets B1..Bn, the model cites which bullets it merged into each category bullet, and the handler UNIONS the cited bullets' reviewIds → each category bullet carries its source-review ids. Persists PER_CATEGORY `{ summary, categories }` reusing the per-competitor structured shape.
  - **`per-category-nonbulleted`** — rewrites the category bulleted summary as prose + appends it (merge-never-overwrite) to each in-category competitor's "Overall Analysis — Captured Reviews" box (the box Fix Session D relabeled "Your notes — Captured Reviews"). **Write-back placement nuance flagged to director:** built per the literal §1 spec; director to confirm placement at next session's Phase 4.
  - Both added to `review-analysis-run-batch.ts` SHIPPED_FLOWS + dispatch (branch BEFORE the single-urlId contract); NEW pure helpers `src/lib/competition-scraping/category-analysis-aggregation.ts` (`collectCategoryInputBullets` / `buildCategoryStructuredAnalysis` / `canonicalizeCategoryInputBullets`) + `.test.ts`; NO schema change (PER_CATEGORY + nullable urlId + typeFilter already exist); NO new route. Frontend: NEW `CategoryAiRunModal.tsx` (one parameterized modal for both flows: model select / progress / per-category status / cost tally / cancel; categoryKey echo-guard) + two Auto-create buttons + live painting into Columns 12/13 on each category banner + re-hydrate on refresh + extended `review-analysis-list` GET (PER_CATEGORY rows + `typeFilter`).
- **NEW "Source Reviews" column DESIGNED + APPROVED (the director's headline ask this session — a §1 ADDENDUM, NOT in the original §1 spec):** each bullet in the "Category Comprehensive (bulleted)" column should also show, in a NEW adjacent "Source Reviews" column, all the individual reviews (across all competitors in that category) that traced up to that category bullet — product name + star rating + review text + a jump-to-detail link icon per source review. Rule 24 pre-capture: genuinely NEW at the category level (the per-competitor bullet→reviews traceability already exists on the detail page). The data chain already exists (the per-category bulleted flow unions the cited bullets' reviewIds). **TWO Rule 14f decisions LOCKED (both Recommended chosen):** (a) layout = bullet-by-bullet, always visible (the category bullet cell aligned with its Source Reviews cell, mirroring the detail-page traceability table); (b) scope = category bullets ONLY (not also the per-competitor column). **The BACKEND for this is already built** (each category bullet carries its source-review ids); **only the column RENDERING remains** — Session 2 FINISH next session.
- **FU-3 detail-page bug fix DEPLOYED (`bdec02e`, director Phase 4 "PASS, table is back"):** the URL-detail "Overall Analysis — Captured Reviews" traceability table had stopped rendering after the per-competitor non-bulleted prose summary ran (the page fed the table "the latest PER_PRODUCT row of EITHER flow"; the prose row carries no `categories`, so a more-recent prose row shadowed the structured bulleted row → null). Fix = NEW pure helper `selectBulletedAnalysisRow(rows, urlId)` in `reviews-traceability.ts` selects by `analysisJson.flow`, not recency. +7 node:test. NEW reusable PATTERN — "select by flow, not recency" (CORRECTIONS_LOG §Entry 2026-05-30-c).
- **Remaining Category-page work = Session 2 FINISH ((a.117)):** build the Source Reviews column RENDERING against the already-produced backend data, THEN deploy the WHOLE Category Session 2 feature (the two summaries + the Source Reviews column) together + director Phase 4 verification. The category code is already committed on `workflow-2` ahead of main (`d1659d7` + `fb772ad`) — next session continues on top, does NOT re-do it. Schema-change-in-flight NO at entry.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Read this section at the start of EVERY session that touches this polish item. This is the source-of-truth for what to build, rolled-up from §1 + §2.**

> **✅ SHIPPED-STATE UPDATE 2026-05-30-b — read FIRST.** The Session 1 scaffold + polish + fixes (2026-05-30) AND the interactive batch (2026-05-30-b) have SHIPPED. As built, this page DIFFERS from some "TBD"/proposal notes below — the §2 2026-05-30-b entry is authoritative for the as-shipped behaviour:
> - **Row grouping = the BANNER-ROW layout (NOT "label on the first competitor row").** Each category now has its OWN shaded banner row (drag-grip + name + hide-category ✕ on the left; the two category-level AI cells — Columns 12/13 — at the right), with ALL competitor rows beneath it (including the first). The "FIRST row carries the category name in Column 1" / "subsequent rows leave Column 1 EMPTY" notes below are SUPERSEDED for this page.
> - **Drag-to-reorder = SHIPPED** as a two-level @dnd-kit drag in ONE DndContext (drag whole categories; uncategorized pinned last + drag competitors within a category). The "category groups sorted by an explicit `sortOrder` schema column (TBD Session 3)" / "competitor rows sort by `sortOrderInCategory` (TBD Session 3)" notes below are SUPERSEDED — order is persisted in the `categoryTableLayout` memory column, NOT new `sortOrder*` columns.
> - **Drag-persistence schema (Q-F) = RESOLVED.** ONE additive nullable `UserTablePreferences.categoryTableLayout` Json column `{ categoryOrder, rowOrderByUrlId, hiddenUrlIds, hiddenCategoryKeys }` (per-user, per-Project, scoped to THIS page) — NOT new `CompetitorUrl.sortOrder*` columns and NOT a separate `CompetitionScrapingRowOrder` table. Threaded through the existing `/table-preferences` GET/PUT endpoint — NO new route.
> - **Hide-with-restore = SHIPPED** (hide a competitor or a whole category from this page only; a "Hidden on this page" restore panel brings them back; never deletes data elsewhere).
> - **Remaining work = Session 2 (the two Category AI flows).** Columns 12/13 still render `(not yet generated)` placeholders until Session 2 wires the bulleted dedup + non-bulleted prose flows (the AI-flow sub-sections below remain the source-of-truth for that work; Q-E prompt content drafted with the director at Session 2's start).
> - **(optional refinement)** the banner category name is a READ-ONLY label; making it editable to rename the whole category group is deferred (director may request).

### Page placement

- **Route:** `/projects/[projectId]/competition-scraping/reviews-analysis-by-category` (final slug TBD — current proposal `reviews-analysis-by-category`; the previously-shipped-then-reverted `by-category-type` slug is RETIRED).
- **Nav toggle:** the existing `CompetitionScrapingSurfaceNav` 4-option toggle EXPANDS to a 5-option toggle: `Competitor URLs` / `Comprehensive Analysis` / `Competitor Reviews Analysis` / **`Reviews Analysis By Competitor Category Table`** / **`Reviews Analysis By Competitor Type Table`** (the latter is built in Sessions 4-5 per the decomposition).
- **Header:** same as the rest of the competition-scraping pages (project + nav toggle on top).

### Table — columns, left-to-right (13 total)

1. **Category** — `CompetitorUrl.competitionCategory` (only populated on the FIRST row of each category group; empty on subsequent rows in the group).
2. **Platform** — `CompetitorUrl.platform`.
3. **Type** — `CompetitorUrl.type`.
4. **Product Name** — `CompetitorUrl.productName`.
5. **Results Rank** — `CompetitorUrl.resultsPageRank`.
6. **Competition Score** — `CompetitorUrl.competitionScore`.
7. **URL** — `CompetitorUrl.url`.
8. **Stars** — for the per-review breakdown row → the star rating of the individual review. For aggregate/competitor-level rows → the URL's `productStarRating`. (Exact interpretation may need clarification during Session 1 — see Open question Q-A below.)
9. **Reviews Summary** — surfaces the per-review summarization output (cached `ReviewAnalysis` rows with `level=PER_REVIEW`). Likely a stacked list of summaries per row, OR a count + click-to-expand pattern. (Exact rendering TBD — Open question Q-B.)
10. **Competitor Comprehensive Reviews Analysis (bulleted)** — cached `ReviewAnalysis` row with `level=PER_PRODUCT` for the URL (the v3 critique-only theme-emergent summary from W5 Session 3). Click-to-edit.
11. **Competitor Comprehensive Reviews Analysis (non-bulleted)** — currently NOT a shipped flow. Needs a NEW per-competitor non-bulleted flow if column is to render data; alternatively column shows "(not yet generated)" placeholder. Open question Q-C.
12. **Category Comprehensive Reviews Analysis (bulleted)** — only on the FIRST row of each category group (the "main category row"). Populated by Session 2's bulleted AI flow.
13. **Category Comprehensive Reviews Analysis (non-bulleted)** — only on the FIRST row of each category group. Populated by Session 2's non-bulleted AI flow.

### Row grouping rule

- All rows for a single category cluster together.
- The FIRST row of each category group carries the category name in Column 1; all subsequent rows in the same group leave Column 1 EMPTY (visual signal of grouping).
- Within a category group, one row per `CompetitorUrl` whose `competitionCategory` matches that category.
- Category groups are sorted by their explicit `sortOrder` field (NEW schema column — TBD Session 3); falls back to alphabetical if `sortOrder` null.
- Within a category group, competitor rows sort by their explicit `sortOrderInCategory` field (NEW schema column — TBD Session 3); falls back to creation order if null.
- `(Uncategorized)` group always sorts last.
- Columns 12 + 13 (Category-level AI cells) ONLY render content on the main category row; they're blank/empty on subsequent rows in the group.

### Column show/hide

- Checkbox bar above the table mirroring the existing `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` pattern from the Competitor Content Table.
- Per-user persistence via existing `UserTablePreferences` model (extend the `key` enum or add a new key).
- Default: all 13 columns visible.

### Click-to-edit cells

- Mirror existing `src/app/projects/[projectId]/competition-scraping/components/InlineCells.tsx` pattern.
- Editable columns: 1, 2, 3, 4, 5, 6, 7, 10, 11, 12, 13. (Column 8 "Stars" + Column 9 "Reviews Summary" likely read-only since they reflect captured data + AI output respectively — confirm during Session 1.)
- Click → cell becomes input → blur or Enter saves → PATCH against existing endpoints. For Category-AI cells (12, 13) the save targets the `ReviewAnalysis` PATCH endpoint already shipped in W5 Session 3.

### Buttons at top of page (three)

1. **"Auto-create Category Comprehensive Reviews Analysis (bulleted)"** — opens overlay; fires Session-2 bulleted flow across all categories.
2. **"Auto-create Category Comprehensive Reviews Analysis (non-bulleted)"** — opens overlay; fires Session-2 non-bulleted flow across all categories.
3. **"Export Table"** — exports the visible table data as Excel (.xlsx). Library TBD (probably `xlsx` or `exceljs`); confirm during Session 3 — Open question Q-D.

### AI flow — "Auto-create Category Comprehensive Reviews Analysis (bulleted)"

- **Input:** for each category, the set of "Competitor Comprehensive Reviews Analysis (bulleted)" column cells associated with that category (i.e., the `ReviewAnalysis` rows at `level=PER_PRODUCT` for the URLs in the category).
- **Per-category processing:** ONE Anthropic call per category. Model receives the per-competitor bulleted summaries for that category as input. Model returns a SINGLE deduplicated comprehensive bullet list.
- **Output:** the deduplicated bullet list saved to a `ReviewAnalysis` row at `level=PER_CATEGORY` + `typeFilter=<categoryName>` + `analysisJson={summary}`. Painted into the cell at Column 12 on the main category row in real-time as each per-category call returns.
- **Dedup semantics (load-bearing):** NOT a flat merge. The model must REMOVE redundant complaints while KEEPING individual unique complaints intact. If 3 of 5 competitors have a "strap breaks within 3 months" complaint, that surfaces ONCE in the deduplicated list (not 3 times). If only ONE competitor has a "ships with no manual" complaint, that surfaces as its own bullet.
- **Overlay UI** (mirror W#1 AutoAnalyze pattern but at this page):
  - Model selector dropdown (Opus 4.6 / Opus 4.7 — defaults to 4.7).
  - Main prompt textarea — pre-filled with the v1 prompt we'll draft jointly in Session 2; director can edit before clicking Start.
  - Additional-instructions textarea — director can paste extra context per run.
  - Progress bar — N of M categories complete.
  - Cost tally — per-category cost + running total.
  - Per-category status list — `queued | in_progress | complete | failed | skipped`.
  - **Pause / Resume / Cancel buttons** — pause halts after current category finishes; resume continues from next queued category; cancel aborts the run.
- **Architecture:** Per-batch endpoint (Q1 locked). Browser orchestrates the per-category loop firing one HTTP POST per category against `/api/projects/[projectId]/competition-scraping/review-analysis/run-batch` with `flow='per-category-bulleted-from-per-competitor-summaries'` (or similar new flow value distinct from the reverted impl's `per-category-bulleted` which had different semantics). Server fires ONE Anthropic call per request and persists the dedup'd bullet list.
- **Real-time painting:** as each per-category call returns, the Column 12 cell on the corresponding main category row updates without page refresh.
- **Redundancies (per §1 directive "there should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped"):** TBD — likely a `targetRowId + targetColumn` echo in the wire shape so the client can verify the response matches the expected target cell before painting. Concrete design lands in Session 2 planning.

### AI flow — "Auto-create Category Comprehensive Reviews Analysis (non-bulleted)"

- **Input:** for each category, the (just-written or pre-existing) Column 12 cell content (the dedup'd bullet list).
- **Per-category processing:** ONE Anthropic call per category. Model receives the bullet list and returns DETAILED prose paragraphs critiquing the category's competitors as a group.
- **Output:** the prose saved to a separate `ReviewAnalysis` row at `level=PER_CATEGORY` + `typeFilter=<categoryName>` with a discriminator marking it as the non-bulleted version (e.g., `analysisJson={summaryNonBulleted}` or `flow=per-category-nonbulleted`). Painted into Column 13 on the main category row.
- **Tone + intent:** "paint a clear picture of the competitor's shortcomings in that category in a way that can be used to effectively critique the competitors in that category on a product comparison website. The idea is to challenge entire categories of products by targeting their common issues."
- **Overlay UI:** structurally identical to the bulleted overlay above.
- **Architecture + redundancies:** same as bulleted flow above.
- **Real-time painting:** Column 13 cells update as each per-category call returns.
- **Write-back to URL detail (NEW directive from §1):** the prose ALSO appends to the `CompetitorUrl.overallAnalyses` JSON column's `"reviews"` key — for EACH `CompetitorUrl` in the category. Append at the BOTTOM of the existing TipTap document; do NOT overwrite. Schema model TBD during Session 2 planning (likely concat as a new TipTap heading + paragraph block at the end of the existing document).

### Real-time table painting (during any AI run)

- As each per-category Anthropic call returns, the corresponding cell updates in the table without page refresh.
- Mirror the W#1 AutoAnalyze pattern of refs + state to keep React re-renders minimal.

---

## §4 — Open questions (still under discussion)

- **Q-A:** Column 8 "Stars" semantics — does each row show the URL-level `productStarRating`, or do we surface per-review star breakdowns? Director comment: "Stars (which shows the star count of the review to its right)" suggests per-review breakdown stacked next to the Reviews Summary column. If so, the table may need to be multi-line per competitor (one line per review under each competitor) OR Column 8 may itself render a stacked list. Clarify during Session 1 planning.
- **Q-B:** Column 9 "Reviews Summary" rendering — stacked list of per-review summaries within each competitor row? Or a count + expand-row? Affects table layout fundamentally. Clarify during Session 1 planning.
- **Q-C:** Column 11 "Competitor Comprehensive Reviews Analysis (non-bulleted)" — there is no shipped per-competitor non-bulleted flow today. Two options: (a) leave the column rendering "(not generated)" placeholder and add a per-competitor non-bulleted flow as a NEW polish item (P-XX-NEW), OR (b) leave the column out of the table for now and add it later. Decide during Session 1 planning.
- **Q-D:** Excel export library — `xlsx` (popular, MIT) vs `exceljs` (richer features, more deps) vs CSV-only fallback. Confirm during Session 3 planning.
- **Q-E:** Prompt content for both AI flows (bulleted dedup + non-bulleted prose) — drafted jointly with director at start of Session 2 per `feedback_plan_output_shape_before_building.md`.
- **Q-F:** Drag persistence schema for two-level drag — new columns on `CompetitorUrl` for `sortOrderInCategory + sortOrderInType` OR a separate `CompetitionScrapingRowOrder` table? Confirm during Session 3 planning.

---

## §5 — Cross-references

- **Master spec doc (NEW 2026-05-28-b):** `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — the verbatim FULL re-paste covering all 3 Reviews Phase 2 pages + cross-cutting joint-discussion decisions. This Category page spec inherits its §1 verbatim from the master.
- **ROADMAP entry:** `docs/ROADMAP.md` P-49 polish-backlog entry (with cross-reference to master + per-page specs).
- **Related polish-item specs:**
  - `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — sibling Reviews Analysis Table page (the upstream Per-Competitor Comprehensive cells feed Column 10 of this Category page).
  - `docs/polish-item-specs/P-49-W5-S5-type-page.md` — sibling Type page, mostly parameterized off this spec.
  - `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` — separate but related (cross-everything PER_PROJECT level vs this PER_CATEGORY level).
- **Design doc §B entries:**
  - `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 (W5 Session 1.5 design lock — original 7-flow design that this corrective rebuild SUPERSEDES on the table-shape + execution-model dimensions while preserving the cache-key + persistence patterns).
  - `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27-c (W5 Session 3 — Per-Competitor bulleted flow that the Category bulleted flow consumes as input).
  - NEW §B 2026-05-28 entry pending (will be appended at end of next deploy session capturing the scope-misread rollback + corrective rebuild architecture).
- **CORRECTIONS_LOG entry:** pending `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 (HIGH-importance scope-misread + plan-output-shape-before-building re-violation; this spec doc IS the prevention mechanism per Rule 31).
- **Reverted commits (for forensic audit):**
  - `5fa1f53` — wrong-spec build commit (8 files +2705/-54).
  - `958ccf8` — revert of `5fa1f53` on `main` + `workflow-2-competition-scraping`.
- **Canonical code references:**
  - W#1 AutoAnalyze pattern: `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` + `src/lib/auto-analyze-v3.ts` — overlay structure + pause/resume/cancel + cost tally + minimized-bar UX to mirror.
  - Per-batch endpoint: `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` — extend SHIPPED_FLOWS for the two new flow values.
  - Column visibility pattern: `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx`.
  - Click-to-edit pattern: `src/app/projects/[projectId]/competition-scraping/components/InlineCells.tsx`.
  - PATCH endpoint for AI-cell edits: `src/lib/competition-scraping/handlers/review-analysis-update.ts` (already shipped W5 Session 3).
  - URL detail write-back target: `CompetitorUrl.overallAnalyses` JSON column (key `"reviews"`).
