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

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Read this section at the start of EVERY session that touches this polish item. This is the source-of-truth for what to build, rolled-up from §1 + §2.**

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
