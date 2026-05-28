# Competitor Reviews Analysis Table — full spec (BACKFILL for already-shipped page)

**Polish-item ID:** P-49 W5 Sessions 2 + 3 (page already shipped with multiple divergences from spec; corrective-fix Sessions TBD)
**Created:** 2026-05-28-b
**Session that captured §1 (re-paste):** `session_2026-05-28-b_p49-w5-reviews-phase-2-master-spec-backfill-and-page-2-divergence-fix-plan`
**Status:** SPEC LOCKED at §1 level (verbatim); **Fix Session A SHIPPED-AND-VERIFIED 2026-05-29** (D-1 through D-7) + **Fix Session B SHIPPED-AND-VERIFIED 2026-05-30** (D-8 + D-9 + D-10 bulleted half + D-11 + Q3 schema gap; build `351342a` + FF1 `add00ad`; director PASS "Both worked now, everything passed"). **Fix Session C remaining** — D-6 drag-to-reorder + D-7 Excel + D-10 non-bulleted half + the NEW per-competitor non-bulleted AI flow + `CapturedReview.sortRankInReviewsTable` schema column + Q8. Q3 + Q9 + Q10 RESOLVED; §4 reduced to Q8 (Fix Session C).

> **Background:** This spec doc is a BACKFILL. The Competitor Reviews Analysis Table page (`/projects/[projectId]/competition-scraping/competitor-reviews-analysis`) was shipped in W5 Session 2 (2026-05-27) and W5 Session 3 (2026-05-27-c) BEFORE Rule 31 was established (2026-05-28). The verbatim director instructions for this page were never captured into a stable doc at that time. Today's session (2026-05-28-b) backfills the verbatim spec + a divergence list documenting where the shipped page falls short of the verbatim text. The fix-scope is decomposed into a multi-session plan in §3 below.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-05-28-b — director's verbatim instructions for the Competitor Reviews Analysis Table page (this is the Competitor Reviews Analysis Table-specific portion of the FULL master spec re-paste — see `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §1 for the complete master re-paste covering all 3 pages):**

> COMPETITOR REVIEWS ANALYSIS TABLE:
>
> - When the toggle is on 'Competitor Reviews Analysis Table', then the user should be taken to the 'Competitor Reviews Analysis Table' page where the header is the same as the competition scraping page, however below that should be a table that has the following columns mentioned in order of leftmost going right:
>
>   -- Platform, Category, Type, Product Name, Results Rank, Competition Score, URL, Competitor Reviews Summary, Competitor Comprehensive Reviews Analysis (bulleted), Competitor Comprehensive Reviews Analysis (non-bulleted).
>
>   The way the data should be posted into this table is that the each competitor url and its associated data should be in posted into a single row and then each individual captured review and the captured review's star count should be posted started from that row going down in such a way that each review is in its own row. If a review for a platform has a title and a review description, simply merge the two such that the title comes first followed by a period (if there isn't one at the end of the title), followed by the review itself. So, if there is any more than one review associated with a competitor url, it will be in the rows below the row in which the competitor details such as platform, category, etc are listed.
>
> There should be check boxes to show/hide each of the columns in the table just the way there are checkboxes to do the same in the 'Competitor Content Table'. The user should also be able to grab and move a main competitor row within the table relative to other main competitor rows and the reviews associated with the main competitor row should move accordingly to maintain its association in the table. Also, the user should be able to move reviews associated with a competitor relative to each other to modify the order in which they are listed. All cells should be editable by clicking them.
>
> There should also be a 'Auto-Summarize Reviews' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), select the batch count of how many reviews to analyze per chat session, the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Competitor Reviews Analysis Table' and then the AI model should analyze the review in the 'Review' column and then come up with a bullet point list that captures the essence of the entire review. The review analysis should isolate the critiques about the product, company, the product claims, fulfillment process, etc. Essentially, this list is meant to serve as precise targets that we can use to better our competitive approach by addressing each of these issues head on. Once a review is analyzed, its bullet list summary should be posted in the cell in the 'Competitor Reviews Summary' column in the same row. The way the AI tool should be designed is that it should know which cells to analyze next without losing track and which cells to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency. Note that this bullet list should also be added to the 'Your Analysis' box under the review in the url's details page.
>
>
> Next to the 'Auto-Summarize Reviews' button, should be the 'Auto-create Competitor Comprehensive Reviews Analysis (bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Competitor Reviews Analysis Table' and then the AI model should analyze the review summaries in 'Competitor Reviews Summary'. The way this should happen is that each chat should be assigned a single competitor url so that it can analyze all the review summary cells associated with it. Then the AI model should come up with a single comprehensive bulleted list that encompasses all the critical reviews while removing redundancies between the review summaries so that the new bulleted list of critical reviews contains all the critical review components without the same components mentioned more than once. This comprehensive bullet list is not just a merging of all the individual review summary bullets, it is essentially the act of removing redundant complaints while still keeping the individual unique complaints intact. Then this comprehensive bullet list should be pasted into the cell in the 'Competitor Comprehensive Reviews Analysis (bulleted)' column in the same row as the main competitor url row for which the AI model performed the comprehensive review analysis. The way the AI tool should be designed is that it should know which competitor reviews to analyze next without losing track and which cells to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency. Note that this bullet list should also be added to the 'Overall Analysis — Captured Reviews' box under the review in the url's details page.
>
>
> Next to the 'Auto-create Competitor Comprehensive Reviews Analysis (bulleted)' button, should be the 'Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Competitor Reviews Analysis Table' and then the AI model should analyze the review summaries in 'Comprehensive Review (bulleted) column. The way this should happen is that each chat should be assigned a single competitor url so that it can analyze the data in the cell in the 'Competitor Comprehensive Reviews Analysis (bulleted)' column associated with that competitor url. Then the AI model should come up with a detailed analysis of the bullet list and presented in a paragraphs manner that paints a clear picture of the competitor's shortcomings in a way that can be used to effectively critique the competitor on a product comparison website. Then this comprehensive analysis should be pasted into the cell in the 'Competitor Comprehensive Reviews Analysis (non-bulleted) column in the same row as the main competitor url row for which the AI model performed the comprehensive review analysis. The way the AI tool should be designed is that it should know which competitor reviews to analyze next without losing track and which cells to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency. Note that this bullet list should also be added to the 'Overall Analysis — Captured Reviews' box under the review in the url's details page. Since there may already be data in that box, make sure the new data is merged into that box by adding it to the very bottom so that no data that was previously in the box is overwritten.
>
> At the top, there should also be a 'Export Table' button that allows the user to export the table data of the 'Competitor Reviews Analysis Table' in an excel file format.
>
> Note that during all AI runs for all the functionalities mentioned above, the tables in user's view should be updated in real-time as the AI updates the data in those tables.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

**2026-05-30 (Fix Session B ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`):**

- **Q9 → A RESOLVED:** per-review summary cells use the SAME Edit-button pattern as the per-competitor banner row (one consistent edit UX; §1 "all cells should be editable").
- **Q3 → A RESOLVED + shipped:** added additive nullable `CapturedReview.title String?` (zero data loss). Extension orchestrator `saveReview` adapters stopped dropping the captured title; PLOS POST/PATCH + wire shape + shared-types carry it; review-row body cell renders 'title. body' display-merge.
- **Build `351342a` (19 files +1115/-63):** Q3 title plumbing end-to-end + per-review write-back to `CapturedReview.analysis` (D-9) + per-competitor bulleted write-back appended to `overallAnalyses["reviews"]` (D-10 bulleted half) + PATCH accepts PER_REVIEW edits + syncs analysis (D-11) + NEW `PerReviewSummaryCell` + analysisId threaded through batch response + hydration + persistence-on-refresh confirmed (D-8). NEW pure helpers: `mergeTitleAndBody`, `summaryStringToContentNodes`/`summaryStringToTipTapDoc`/`appendSummaryToTipTapDoc`.
- **FF1 `add00ad` (4 files +257/-55) — Phase 4 redirect:** per-review + per-competitor summaries generated BEFORE the deploy never appeared on the URL detail page because the initial build only wrote back on FRESH AI persists (cache hits returned early + skipped the write-back). FF1 fires both write-backs on cache hits too — per-review REPLACE is idempotent; per-competitor APPEND guarded by NEW `tipTapDocContainsSummary` content-dedup so re-runs don't duplicate. Director Phase 4 PASS: "Both worked now, everything passed".
- **AUDIT FINDING (Rule 31 audit-shipped-state):** the "Overall Analysis — Captured Reviews" box already rendered on the URL detail page (shipped P-46 W2 Session 4 2026-05-28) — D-10's "box missing" sub-claim was stale; only the write-back was the real gap.
- **Schema-change-in-flight:** YES entry → FLIPPED NO at the initial deploy push (`351342a` → main). `db push` applied `CapturedReview.title` in 1.50s.

**2026-05-27 (W5 Session 1.5 design lock; pre-Rule-31; retroactively recorded here):**

- **Execution model:** per-batch server endpoint (browser orchestrates queue + pause/resume/cancel; server fires ONE Anthropic call per batch).
- **Model options:** Opus 4.6 + Opus 4.7 (NOT Sonnet 4.6).
- **Cache key:** SHA-256(input + modelVersion + PROMPT_VERSION).
- **Persistence:** `ReviewAnalysis` table. `PER_REVIEW` for per-review summaries; `PER_PRODUCT` for per-competitor summaries.

**2026-05-27-b (W5 Session 2 ship + 3 FFs; pre-Rule-31; retroactively recorded here):**

- **Per-review (PER_REVIEW) flow shipped.** Auto-Summarize Reviews button at top of page; per-URL "Summarize reviews" inline button. Output stored as `ReviewAnalysis` rows at `level=PER_REVIEW`.
- **Bullet shape:** v2 prompt = bulleted critical-only (FF#3 prompt iteration).
- **"View prompts" panel** in modal added FF#2 for AI transparency.

**2026-05-27-c (W5 Session 3 ship + 2 FFs; pre-Rule-31; retroactively recorded here):**

- **Per-competitor bulleted (PER_PRODUCT) flow shipped.** "Summarize Reviews for All Competitors" button at top of page; per-URL "Summarize Competitor Reviews" inline button. Output stored as `ReviewAnalysis` rows at `level=PER_PRODUCT`.
- **Edit affordance** shipped via NEW PATCH endpoint `review-analysis-update.ts`. Scope: PER_PRODUCT level ONLY. PER_REVIEW edits explicitly rejected.
- **v3 prompt:** critique-only theme-emergent shape (FF#2 prompt iteration).

**2026-05-28-b (THIS session — divergence-discovery + master-spec-backfill + multi-session corrective-fix plan):**

DIVERGENCE FINDINGS (the gap between §1 verbatim spec and shipped code; each item anchored to verbatim §1 text + shipped-code file:lines):

- **D-1 — Toggle nav (`CompetitionScrapingSurfaceNav.tsx:37-63`).** §1 verbatim names FOUR options exactly: "Competitor Content Table", "Competitor Reviews Analysis Table", "Reviews Analysis By Competitor Category Table", "Reviews Analysis By Competitor Type Table". Shipped: "Competitor URLs", "Comprehensive Analysis", "Competitor Reviews Analysis", "By Category / By Type" (disabled). Three labels mismatch; the merged "By Category / By Type" needs to become two separate options; "Comprehensive Analysis" presence vs absence pending CQ-1.
- **D-2 — Column shape on URL row (page.tsx:468-472).** §1 verbatim names 10 columns left-to-right (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL / Competitor Reviews Summary / Competitor Comprehensive (bulleted) / Competitor Comprehensive (non-bulleted)). Shipped URL-row columns: expand-toggle / "Competitor / Product" merged / Platform / Reviews count / Actions. **6 of 10 spec columns are missing or merged** (Category, Type, Product Name as own column, Results Rank, Competition Score, URL as own column, Competitor Reviews Summary, Competitor Comprehensive bulleted, Competitor Comprehensive non-bulleted are not own columns; the "Reviews count" and "Actions" are extra columns not in spec).
- **D-3 — Buttons at top of page (page.tsx:337).** §1 verbatim names THREE AI buttons + ONE Export button. Shipped: ONE button ("Summarize Reviews for All Competitors"). Missing at top: Auto-create Competitor Comprehensive (non-bulleted); Export Table. Per-URL inline buttons exist; CQ-4 decides whether to keep them once top-of-page versions land.
- **D-4 — Click-to-edit on all cells (page.tsx:715-722).** §1 verbatim: "All cells should be editable by clicking them." Shipped: only Per-Competitor Summary banner row text is editable. URL-row cells (Category, Type, Product Name, Results Rank, Competition Score, URL) and review-row cells (Star, Body, Reviewer, Date, Summary) are read-only.
- **D-5 — Show/hide column checkboxes (NOT PRESENT on this page).** §1 verbatim required. Pattern reference for implementation: `ColumnVisibilityBar.tsx` already used on Competitor Content Table.
- **D-6 — Drag-to-reorder URL rows AND review rows (NOT PRESENT).** §1 verbatim required (two-level). Pattern reference: @dnd-kit Shared debounced-mutation lifecycle Pattern from P-46 W3 S3 2026-05-23-f; reused by W4 Captured Reviews UI per-review reorder 2026-05-29.
- **D-7 — Export Table button (NOT PRESENT).** §1 verbatim required. Library + format details pending CQ-7.
- **D-8 — Persistence on refresh.** Director report: "individual review summaries output and competitor reviews summary output show in the table when the AI run finishes, upon refresh this data is lost." Code-truth audit: BOTH PER_REVIEW and PER_PRODUCT summaries ARE saved to the `ReviewAnalysis` table. The bug is on the PAGE-LOAD side: the loader does not appear to fetch existing `PER_REVIEW` rows and hydrate them into the table state. **Note:** the per-competitor bulleted (PER_PRODUCT) summary DOES appear to load on refresh per the audit (the Edit button is shown when `summary.analysisId` exists). So the refresh bug is specifically on the per-review summaries surface, possibly also the not-yet-shipped per-competitor non-bulleted surface. To re-confirm against vklf.com once Session 1 of the fix lands.
- **D-9 — Write-back to "Your Analysis" box under each review on URL detail page.** §1 verbatim: per-review summary "should also be added to the 'Your Analysis' box under the review in the url's details page." Shipped: per-review summary stored only in `ReviewAnalysis` rows; NOT written to `CapturedReview.analysis` (which backs the "Your Analysis" box). Box-render exists; write-back missing.
- **D-10 — "Overall Analysis — Captured Reviews" box on URL detail page (UI NOT RENDERED).** §1 verbatim: per-competitor bulleted + non-bulleted "should also be added to the 'Overall Analysis — Captured Reviews' box under the review in the url's details page." The audit found that `CompetitorUrl.overallAnalyses["reviews"]` schema slot EXISTS but is NOT RENDERED on the URL detail page (UrlDetailContent.tsx renders boxes for Text / Image / Video but not Reviews). Fix requires BOTH adding the UI box AND wiring the write-back from both per-competitor flows; non-bulleted MUST append at bottom (merge, never overwrite) per §1 verbatim.
- **D-11 — Per-review summary edit affordance (review-analysis-update.ts:181-193).** §1 verbatim "All cells should be editable" includes per-review summary cells. Shipped: PATCH endpoint explicitly rejects PER_REVIEW edits.
- **D-12 — Model options.** §1 verbatim says "Sonnet 4.6, Opus 4.7" — but joint-discussion lock (2026-05-27) corrected to Opus 4.6 + Opus 4.7. Re-verify the shipped per-review + per-competitor modal selectors offer Opus 4.6 + 4.7 (not Sonnet 4.6) once Session 1 fix lands.

KEEP-AS-IS (per director's explicit 2026-05-28-b directive):

- **AI function mechanics work perfectly + keep them.** Director: "The AI function that was developed works perfectly and we don't want to change that." Specifically:
  - The per-batch endpoint architecture (browser orchestrates; server fires one Anthropic call per batch).
  - The pause/resume/cancel + progress bar + cost tally overlay UX.
  - The v3 critique-only theme-emergent prompt for per-competitor bulleted.
  - The v2 bulleted critical-only prompt for per-review.
  - The cache-key + persistence shapes (SHA-256(input+modelVersion+PROMPT_VERSION) → `ReviewAnalysis` rows).
- **Reviews under URL row layout** (rows expand below a URL row). Director: "Right now the reviews are revealed under the url row, which is fine and we can keep it that way." The fix is to add the missing columns to the URL row + populate them, NOT to restructure the row-stacking.

CLARIFYING-QUESTION ANSWERS (2026-05-28-b — director answered all 7 today; 7/7 = 100% Yes-to-Recommended):

- **Q1 → A:** Toggle nav keeps "Comprehensive Analysis" as a 5th option. The toggle becomes 5 options: Competitor Content Table / Competitor Reviews Analysis Table / Reviews Analysis By Competitor Category Table / Reviews Analysis By Competitor Type Table / Comprehensive Analysis. Director's reasoning by accepting Recommended: preserve existing access to the Comprehensive Analysis page; reversible later. (Also resolves CQ-1 in master spec.)
- **Q2 → B:** URL-row Column 8 "Competitor Reviews Summary" displays the count format "N of M summarized" — where N = number of per-review summaries that exist for this URL, M = total captured reviews for this URL. (REVIEW rows still hold the per-review bullet summary as before per §1 verbatim.)
- **Q3 → A:** Title + description display-time merge. `CapturedReview.title` + `CapturedReview.description` stay separate columns in the database. The table joins them on the fly when rendering ('title' + period-if-missing + ' ' + 'description'). Reversible if rule changes later.
- **Q4 → A:** Keep BOTH top-of-page global buttons AND per-URL inline buttons for both Auto-Summarize Reviews + Auto-create Comprehensive (bulleted). Global runs across all URLs; inline runs for one URL. Both granular and bulk control retained.
- **Q5 → A:** Drag-to-reorder URL rows uses single source of truth — reuse `CompetitorUrl.sortRank` so order on this page tracks order on Competitor Content Table. Drag-to-reorder review rows within a URL: NEW per-page `CapturedReview.sortRankInReviewsTable` column (NOT propagated elsewhere since reviews are not ordered on URL detail page; if review ordering on URL detail page becomes a feature later, consolidate then). Schema-change-in-flight = YES when this column lands; minimal additive migration.
- **Q6 → A:** Single source of truth for click-to-edit. URL-row cell edits (Category, Type, Product Name, Results Rank, Competition Score, URL) write through to `CompetitorUrl` columns — same edits reflect on Competitor Content Table + URL detail page. Review-row cell edits (review body title + description, star, reviewer, date) write through to `CapturedReview` columns — reflected on URL detail page. AI output column edits (Columns 8, 9, 10 on URL row + per-review summary on review rows) write through to `ReviewAnalysis.analysisJson` via PATCH endpoint.
- **Q7 → A:** Excel export uses `xlsx` library (smaller bundle, MIT). AI columns export with word-wrap ON. Standard column widths. File naming: `competitor-reviews-analysis-{project-slug}-{YYYY-MM-DD}.xlsx`. (Also resolves CQ-7 in master spec.)

NEW OPEN QUESTIONS EMERGED FROM THIS DISCUSSION:

- **Q8 (new) — per-batch endpoint flow-value naming convention for the NEW per-competitor non-bulleted flow.** Two options: (a) `flow=per-competitor-nonbulleted`; (b) `flow=per-product-nonbulleted` (since the existing PER_PRODUCT bulleted flow uses `flow=per-competitor-bulleted` — both flows live at the same enum level so consistency matters). Decide at start of Fix-Session C.
- **Q9 (new) — does the per-review summary edit affordance need the same Edit-button UI pattern as the per-competitor banner row?** Likely yes per Rule 14a Read-It-Back (the spec line "All cells should be editable by clicking them" implies the same UX). Confirm at start of Fix-Session B.
- **Q10 (new) — display format for the "N of M summarized" count on URL-row Column 8.** Plain text? Small badge / pill style? Clickable to expand the URL row? Pick at Fix-Session A planning.

**2026-05-29 (Fix Session A ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`):**

Initial build commit `8708343` (5 files +973/-183) shipped the smallest verifiable unit (toggle rename to 5 verbatim options + URL row expanded to 10 spec columns + ColumnVisibilityBar with show/hide + Column 8 "N of M summarized" plain-text count [Q10 → A] + click-to-edit on URL-row cells 1-7 + click-to-edit on review-row body/star/reviewer/date). After deploy, director surfaced FOUR rounds of Phase 4 verification with 18 redirects bundled into 4 FF commits (FF1 `0b21c09` 8 redirects + FF2 `31c54a0` 5 redirects + FF3 `12c042c` 4 redirects + FF4 `3fbe12e` 1 redirect = 18 total redirects across 4 FFs in one Phase 4 verification day — NEW RECORD beating the prior 3-FF max for the Same-day Phase 4 multi-redirect bundling Pattern). Director Phase 4 verbatim PASS verdict on FF4: "everything passed". 7/7 = 100% Yes-to-Recommended pickers this session.

KEY DECISIONS THIS SESSION:

- **Q10 → A RESOLVED:** Plain text "N of M summarized" format on URL-row Column 8. No badge/pill, no click-to-expand. Matches the existing count-cell style on the Competitor URLs sibling page. Reversible later.
- **D-8 PARTIALLY closed in FF2** (lifted forward from Fix Session B per director directive): per-review + per-competitor summary persistence-on-refresh via NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route + NEW handler `src/lib/competition-scraping/handlers/review-analysis-list.ts`. Re-confirmation post-Q3-schema-change at Fix Session B start.
- **Q3 schema-gap discovery during build + DEFERRED to Fix Session B** (NEW positive pattern): mid-build code-truth audit at the orchestrator's `saveReview` adapter (`orchestrator.ts:1254-1275`) revealed `CapturedReview` prisma model has only a single `body` column; extractors (`amazon-review-extractor.ts:283`, `walmart-review-extractor.ts:305`) DO capture `title` separately but the adapter silently DROPS the title before persisting via `createCapturedReview`. The Q3 → A title+description display-time merge CAN'T ship without a schema migration. Director-approved Rule 14f mid-build picker (4-option) — director picked Recommended (Defer to Fix Session B + preserve Fix Session A's NO-schema-change scope intact). Q3 carry-over fully captured into §3 Fix Session B item 6 below.
- **Drag-to-resize column widths via NEW shared `ColumnResizeHandle`** (FF1): EXTRACTED from `UrlTable.tsx` into `src/app/projects/[projectId]/competition-scraping/components/ColumnResizeHandle.tsx`. Now used by BOTH sibling tables.
- **CSS grid → HTML `<table>` + `<colgroup>`** (FF1) to fix overlapping columns.
- **NEW Platforms filter chips** above the table (FF1).
- **Edge-to-edge table + sticky header + viewport-locked horizontal scrollbar via full-viewport flex-column page restructure** (FF1 + FF2 + FF3).
- **Column widths + visibility persist server-side via existing `/table-preferences` endpoint with `reviewsTable:` key prefix namespace** (FF2; NO schema change — extends existing JSON value shape).
- **Column 8 + Column 9 cells become expand/collapse triggers with state-aware text** (FF4): split single `expanded` state into `reviewsExpanded` + `bannerExpanded`; leftmost ▸/▾ cell becomes "expand both" master toggle; auto-expand on per-URL AI run kickoff + on fresh in-session per-competitor summary land. NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` in the helper module with +9 new node:test cases. **NEW reusable PATTERN memorialized in CORRECTIONS_LOG §Entry 2026-05-29 + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29: "Cell-level click handlers + state-aware text affordance Pattern".**
- **3 button text renames** (FF1): per-URL "Summarize all reviews within this product" + per-URL "Summarize each individual review under this product" + top-of-page "Summarize All Reviews From All Competitors".
- **Blue "Summarize each individual review" button moved ABOVE green "Summarize all reviews within this product" button** (FF3).
- **Scoreboard deltas post-FF4**: src/lib `node:test` 950 → **984** (+34 net; +18 initial + +2 FF1 + +5 FF2 + +9 FF4; FF3 was layout-only); `npm run build` 67 → **68** (+1 NEW GET /review-analysis route in FF2); extension `npm test` = **910/910 UNCHANGED** (PLOS-side only session).

---

## §3 — Current consolidated fix-spec (rolled-up source-of-truth — POPULATED after 2026-05-28-b clarifying-question answers)

**Read this section at the start of every session that touches the Competitor Reviews Analysis Table page. This is the source-of-truth for the corrective-fix scope.**

### Page placement (NO CHANGE)

- **Route:** `/projects/[projectId]/competition-scraping/competitor-reviews-analysis` (UNCHANGED — already shipped).
- **Header:** same as the existing competition-scraping page header (project name + 4-option nav toggle per §1).

### 5-option toggle (rename current; preserve Comprehensive Analysis as 5th per Q1)

The nav-toggle currently shipped must be replaced with these FIVE options (the 4 verbatim spec options + Comprehensive Analysis preserved per Q1 → A):

1. **Competitor Content Table** (DEFAULT — route is the current Competitor URLs route `/competition-scraping`).
2. **Competitor Reviews Analysis Table** (current route `/competition-scraping/competitor-reviews-analysis` stays).
3. **Reviews Analysis By Competitor Category Table** (new route — final slug per Category page spec doc; current proposal `/competition-scraping/reviews-analysis-by-category`).
4. **Reviews Analysis By Competitor Type Table** (new route — final slug per Type page spec doc; current proposal `/competition-scraping/reviews-analysis-by-type`).
5. **Comprehensive Analysis** (existing route `/competition-scraping/comprehensive-analysis` stays).

### Table — columns, left-to-right (10 total per §1; verbatim)

1. **Platform** — `CompetitorUrl.platform`. Click-to-edit propagates to CompetitorUrl (Q6 → A; single source of truth).
2. **Category** — `CompetitorUrl.competitionCategory`. Click-to-edit propagates (single source of truth).
3. **Type** — `CompetitorUrl.type`. Click-to-edit propagates.
4. **Product Name** — `CompetitorUrl.productName`. Click-to-edit propagates.
5. **Results Rank** — `CompetitorUrl.resultsPageRank`. Click-to-edit propagates.
6. **Competition Score** — `CompetitorUrl.competitionScore`. Click-to-edit propagates.
7. **URL** — `CompetitorUrl.url`. Click-to-edit propagates.
8. **Competitor Reviews Summary** — URL row shows count format "N of M summarized" (Q2 → B; N = per-review summaries existing for this URL, M = total captured reviews). REVIEW rows hold the per-review bullet summary (the AI output cell) per §1 verbatim. Editable per Q6 → A: edit writes to corresponding `ReviewAnalysis.analysisJson` via PATCH endpoint.
9. **Competitor Comprehensive Reviews Analysis (bulleted)** — URL row holds the per-competitor dedup bullet list (already shipped); REVIEW rows blank. Editable per Q6 → A.
10. **Competitor Comprehensive Reviews Analysis (non-bulleted)** — URL row holds the per-competitor dedup prose paragraphs (NEW — Fix Session C builds the flow). REVIEW rows blank. Editable per Q6 → A.

### Row structure

- ONE URL row per `CompetitorUrl` showing all 10 columns populated (per §1 verbatim).
- Below each URL row: ONE row per `CapturedReview` for that URL. Review rows show: review body (title + period-if-missing + space + description; display-time merge per Q3 → A; `CapturedReview.title` + `.description` stay separate columns in DB), star count, reviewer, date, per-review summary cell (Column 8 carries the AI output for review rows).
- Review rows are sub-rows of their parent URL row — they move when the parent URL row is dragged (per §1 verbatim).

### Show/hide column checkboxes (per §1)

- Checkbox bar above the table mirroring `ColumnVisibilityBar.tsx` from the Competitor Content Table.
- Per-user persistence via `UserTablePreferences` model (extend the existing key set).
- Default: all 10 columns visible.

### Click-to-edit (per §1 verbatim — "All cells should be editable")

Per Q6 → A (single source of truth across pages):

- **URL-row cells 1–7** (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL): edits write through to `CompetitorUrl` columns. SAME edit reflects on Competitor Content Table + URL detail page. PATCH endpoint: existing `urls/[urlId]` PUT/PATCH (already used by Competitor Content Table click-to-edit cells).
- **URL-row cells 9, 10** (AI output Columns 9 + 10): edits write through to corresponding `ReviewAnalysis` row's `analysisJson.summary` via `review-analysis-update.ts` PATCH. EXTEND PATCH endpoint to accept PER_PRODUCT non-bulleted as well as the existing PER_PRODUCT bulleted.
- **URL-row cell 8** (Reviews Summary count "N of M"): NOT directly editable — it's a computed display, not a stored field.
- **Review-row cells** for review body title / description (kept separate per Q3), star, reviewer, date: edits write through to `CapturedReview` columns. SAME edit reflects on URL detail page. PATCH endpoint: existing `urls/[urlId]/captured-reviews/[reviewId]` PATCH (already used by URL detail page Captured Reviews section).
- **Review-row cell 8** (per-review summary AI output): edits write through to `ReviewAnalysis.analysisJson.summary` via EXTENDED PATCH endpoint (open PER_REVIEW edits in `review-analysis-update.ts` — currently rejected at line 181-193).

### Drag-to-reorder (per §1 verbatim)

Per Q5 → A (single source of truth across pages):

- **Main URL rows draggable** relative to each other; child review rows move with the parent URL row. Persistence: `CompetitorUrl.sortRank` column (existing — SAME column used by Competitor Content Table drag-to-reorder; order on this page TRACKS order on Competitor Content Table; reordering anywhere reflects everywhere).
- **Review rows draggable** relative to each other WITHIN their parent URL row. Persistence: NEW `CapturedReview.sortRankInReviewsTable Int?` column (per-page-specific; not propagated to URL detail page since reviews on URL detail page aren't ordered explicitly today; if URL detail page review ordering becomes a feature later, consolidate then). Schema-change-in-flight = YES at deploy time for this column.
- **Implementation pattern:** @dnd-kit Shared debounced-mutation lifecycle (the P-46 W3 S3 2026-05-23-f Pattern; reused by W4 2026-05-29 Captured Reviews UI per-review reorder).

### Buttons at top of page — 4 buttons per §1 verbatim

1. **Auto-Summarize Reviews** — opens overlay; fires the existing per-review (PER_REVIEW) flow across all not-yet-summarized reviews. KEEP MECHANICS — mostly rename per §1 if the shipped label "Summarize Reviews for All Competitors" diverges.
2. **Auto-create Competitor Comprehensive Reviews Analysis (bulleted)** — opens overlay; fires the existing per-competitor bulleted (PER_PRODUCT) flow across all URLs. KEEP MECHANICS — likely re-label per §1 to match button text.
3. **Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)** — opens overlay; fires a NEW per-competitor non-bulleted (PER_PRODUCT non-bulleted) flow across all URLs. NEW BUILD — mirrors bulleted flow with non-bulleted prose output. Schema: new `flow=per-competitor-nonbulleted` value; new `ReviewAnalysis` rows at `level=PER_PRODUCT` with discriminator (e.g., `analysisJson.flow="per-competitor-nonbulleted"` or new column).
4. **Export Table** — exports visible table data (respecting current show/hide) as Excel `.xlsx`. Library + format details pending CQ-7.

Per-URL inline buttons KEEP per Q4 → A. Existing per-URL "Summarize reviews" + "Summarize Competitor Reviews" buttons stay alongside the new global top-of-page buttons (granular + bulk control both available). When the new per-competitor non-bulleted flow ships (Fix Session C), add a corresponding per-URL inline button for granular non-bulleted runs.

### AI flow — KEEP MECHANICS (per director's explicit 2026-05-28-b directive)

- Per-batch server endpoint architecture (`review-analysis-run-batch.ts`).
- Browser orchestrates queue + pause/resume/cancel.
- Cache key SHA-256(input + modelVersion + PROMPT_VERSION).
- Persistence: `ReviewAnalysis` rows with `level` + `urlId` + `projectId`.
- Cost tally + progress bar in overlay UI.
- Real-time table painting as each batch returns.

### NEW BEHAVIOR — persistence on refresh

- Page loader must fetch existing `ReviewAnalysis` rows for ALL flows (PER_REVIEW + PER_PRODUCT bulleted + PER_PRODUCT non-bulleted once shipped) and hydrate them into the initial table state.
- Specifically the bug fix for D-8: the per-review summaries surface on review rows must persist across refresh.

### NEW BEHAVIOR — write-back to URL detail page

- **Per-review summary write-back to "Your Analysis" box (per §1):**
  - When the per-review (PER_REVIEW) flow saves a `ReviewAnalysis` row, ALSO update the corresponding `CapturedReview.analysis` field with the bullet-list TipTap doc.
  - The "Your Analysis" box on the URL detail page reads from `CapturedReview.analysis` (already shipped). No UI change needed there; just the write-back.
- **Per-competitor bulleted + non-bulleted write-back to "Overall Analysis — Captured Reviews" box (per §1):**
  - The "Overall Analysis — Captured Reviews" box does NOT currently render on the URL detail page (audit finding D-10). Add the box (using existing `OverallAnalysisBox` component pattern). Backed by `CompetitorUrl.overallAnalyses["reviews"]` (TipTap JSON; slot already exists in schema).
  - When the per-competitor BULLETED (PER_PRODUCT bulleted) flow saves a `ReviewAnalysis` row for a URL, ALSO write the bullet-list TipTap doc to that URL's `CompetitorUrl.overallAnalyses["reviews"]` field. Strategy: replace OR append-merge? **Director's verbatim §1 says only "added to" for bulleted (no explicit overwrite rule); but the non-bulleted spec explicitly says "merged into that box by adding it to the very bottom so that no data that was previously in the box is overwritten." Safest interpretation: BOTH bulleted + non-bulleted append-merge at the bottom.**
  - When the per-competitor NON-BULLETED (NEW PER_PRODUCT non-bulleted) flow saves a `ReviewAnalysis` row for a URL, ALSO append the prose paragraphs to the bottom of `CompetitorUrl.overallAnalyses["reviews"]`.

### Schema notes

- **NO new tables needed.** All flows persist via existing `ReviewAnalysis` model.
- **NO new enum values needed on `ReviewAnalysisLevel`.** Per-competitor bulleted and non-bulleted both use `PER_PRODUCT`; discriminator goes in `analysisJson.flow` field OR a new `flow` column (Q8 — confirm at start of Fix Session C).
- **NEW column** on `CapturedReview`: `sortRankInReviewsTable Int?` (drag-to-reorder review rows within a URL on this page; per-page-specific per Q5). Schema-change-in-flight = YES at deploy time for Fix Session C.
- **EXISTING** `CompetitorUrl.sortRank Int?` — single source of truth for URL-row drag order (Q5).
- **EXISTING** `CapturedReview.analysis` (TipTap JSON) — write target for per-review summary write-back (D-9 fix).
- **EXISTING** `CompetitorUrl.overallAnalyses["reviews"]` (TipTap JSON) — write target for per-competitor bulleted + non-bulleted write-backs (D-10 fix). UI box must be added to URL detail page first.
- **CORRECTED 2026-05-30 (Fix Session B build — supersedes the prior stale line that assumed two existing columns):** `CapturedReview` has only a single `body String @db.Text` column — there is **NO** existing `title` and **NO** existing `description` column. The "description" in the §1 verbatim spec maps to the existing `body` column. Q3 adds the missing **`CapturedReview.title String?`** column this session (additive, nullable, zero data loss). The extension extractors (`amazon-review-extractor.ts`, `walmart-review-extractor.ts`) already capture `title`, but the extension orchestrator `saveReview` adapters (`extensions/competition-scraping/src/lib/content-script/orchestrator.ts` lines 1254/1418/1515/1611) drop it before calling `createCapturedReview`, and the PLOS POST handler (`url-reviews.ts`) never read it. Fix Session B closes this end-to-end. Table renders the merge ('title' + period-if-missing + ' ' + 'body') at display time on the review-row body cell.

---

### MULTI-SESSION CORRECTIVE-FIX PLAN — 3 SESSIONS LOCKED 2026-05-28-b

**Fix Session A — ✅ SHIPPED-AND-VERIFIED 2026-05-29 — Toggle rename + URL-row column population + UI fixes (NO write-back work, NO new AI flow, NO Excel export, NO drag — preserved as scoped; Q3 schema gap DEFERRED to Fix Session B per director-approved Rule 14f mid-build picker).**

Initial build commit `8708343` + 4 fix-forward commits (`0b21c09` + `31c54a0` + `12c042c` + `3fbe12e`) bundling 18 Phase-4 redirects within one verification day — NEW RECORD for the Same-day Phase 4 multi-redirect bundling Pattern. Director Phase 4 verbatim PASS verdict on FF4: "everything passed".

Scope:
1. ✅ DONE — Rename `CompetitionScrapingSurfaceNav.tsx` labels to spec verbatim (5 options per Q1 — preserving Comprehensive Analysis as 5th).
2. ✅ DONE — Expand the URL-row of the Reviews Analysis Table to all 10 spec columns left-to-right. Show Category, Type, Product Name, Results Rank, Competition Score, URL as own columns (currently merged into "Competitor / Product" or missing entirely).
3. ~~Implement title+description display-time merge on review-row body (Q3).~~ **DEFERRED to Fix Session B 2026-05-29** — discovery during Fix Session A build: `CapturedReview` prisma model has only a single `body` column; no separate `title` + `description` columns exist. Extractors (`amazon-review-extractor.ts:283`, `walmart-review-extractor.ts:305`) DO capture `title` separately but orchestrator's `saveReview` adapter at `orchestrator.ts:1254-1275` silently DROPS the title before persisting via `createCapturedReview`. Schema work belongs in Fix Session B alongside the other write-back schema work (additive nullable `title` column + orchestrator wire-up + PATCH endpoint extension + display-time merge implementation).
4. ✅ DONE — Implement Column 8 "N of M summarized" count display on URL row (Q2 → B; Q10 → A RESOLVED 2026-05-29 at Fix Session A planning — plain text format, no badge/pill, no click-to-expand; matches existing count-cell style on the Competitor URLs sibling page).
5. ✅ DONE — Add `ColumnVisibilityBar` checkbox bar above the table for show/hide of the 10 columns (mirroring Competitor Content Table pattern). Per-user persistence shipped server-side in FF2 via existing `/table-preferences` endpoint with `reviewsTable:` key prefix namespace.
6. ✅ DONE — Add click-to-edit on URL-row cells 1–7 (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL) propagating to `CompetitorUrl` columns via existing PATCH endpoint (Q6 → A).
7. ✅ DONE — Add click-to-edit on review-row body / star / reviewer / date cells propagating to `CapturedReview` columns via existing PATCH endpoint (Q6 → A).
8. ✅ DONE — /scoreboard + deploy decision Rule 14f (5 Rule 9 deploy gates fired across initial + 4 FFs; all director-Yes; NEW baselines locked: src/lib `node:test` = **984/984** + `npm run build` = **68 routes** + extension = **910/910 UNCHANGED**).

**BONUS lifted forward from Fix Session B per director directive (FF2):** ✅ DONE — D-8 PARTIALLY closed via NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route + NEW handler `src/lib/competition-scraping/handlers/review-analysis-list.ts` providing per-review + per-competitor summary persistence-on-refresh.

**ALSO shipped (beyond the spec doc §3 Fix Session A scope, added during Phase 4 cascade):**
- ✅ Drag-to-resize column widths via NEW shared `ColumnResizeHandle` (FF1) — EXTRACTED from `UrlTable.tsx`; both sibling tables now share.
- ✅ CSS grid → HTML `<table>` + `<colgroup>` with `tableLayout:fixed` (FF1) to fix overlapping columns.
- ✅ NEW Platforms filter chips above the table (FF1).
- ✅ Edge-to-edge table + sticky header + viewport-locked horizontal scrollbar via full-viewport flex-column page restructure (FF1 + FF2 + FF3).
- ✅ 3 button text renames (FF1) + button reorder (FF3).
- ✅ Column 8 + Column 9 cells become expand/collapse triggers with state-aware text (FF4) — split single `expanded` state into `reviewsExpanded` + `bannerExpanded`; NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` + 9 new node:test cases. **NEW reusable PATTERN memorialized.**

NO drag-to-reorder rows in Fix Session A. NO new AI flows. NO write-backs. NO Excel. Smallest verifiable unit to lock the table primitive against spec.

Schema-change-in-flight = NO this session (preserved per director-approved Rule 14f mid-build deferral of the Q3 schema-gap discovery to Fix Session B).

**Fix Session B — ✅ DEPLOYED-AND-VERIFIED 2026-05-30 — Write-back to URL detail page + per-review edit + persistence-on-refresh bug + title schema column (Q3 carry-over from Fix Session A).**

Initial build commit `351342a` (19 files +1115/-63) + FF1 `add00ad` (4 files +257/-55) deployed end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. Director Phase 4 verbatim PASS verdict: "Both worked now, everything passed". 2 Rule 9 deploy gates (initial + FF1). Closes D-8 + D-9 + D-10 (bulleted half) + D-11 + Q3 schema gap.

Scope:
1. ✅ DONE (audit finding — no work needed) — ~~Render the NEW "Overall Analysis — Captured Reviews" box on URL detail page.~~ **AUDIT FINDING 2026-05-30 (Rule 31 audit-shipped-state mandate): the box ALREADY RENDERS** at `UrlDetailContent.tsx` (CapturedReviewsSection, ~line 2109) — shipped P-46 Workstream 2 Session 4 (2026-05-28) with `field={{ kind: 'overallAnalyses', category: 'reviews' }}`, label "Overall Analysis — Captured Reviews", testId `overall-analysis-reviews`. D-10's "box does NOT currently render" claim was **stale**. The real D-10 gap was only the per-competitor WRITE-BACK into that box's slot (item 3).
2. ✅ DONE (D-9) — Per-review summary WRITE-BACK to `CapturedReview.analysis` in `review-analysis-run-batch.ts`. Each review's "Your Analysis" box (PerItemAnalysisBox at `UrlDetailContent.tsx:2519`) reads this. Stored as a TipTap doc via NEW `summaryStringToTipTapDoc` helper.
3. ✅ DONE (D-10 bulleted half) — Per-competitor bulleted WRITE-BACK to `CompetitorUrl.overallAnalyses["reviews"]`, append-merged at bottom via NEW `appendSummaryToTipTapDoc` helper. **FF1: write-backs now fire on cache hits too** (the initial build only wrote back on fresh AI persists, so summaries generated before the deploy — always cache hits — never landed in the boxes; FF1's content-dedup guard `tipTapDocContainsSummary` keeps the per-competitor append idempotent across re-runs).
4. ✅ DONE (D-11; Q9 → A same Edit-button as banner) — `review-analysis-update.ts` PATCH now accepts PER_REVIEW edits + syncs `CapturedReview.analysis` on edit (single source of truth, Q6). NEW `PerReviewSummaryCell` component + `analysisId` threaded through the per-review batch response + page hydration so cells are editable live + post-refresh.
5. ✅ DONE (D-8) — persistence-on-refresh confirmed (hydration loader reads PER_REVIEW + PER_PRODUCT rows via GET /review-analysis incl. `id` for the Edit affordance).
6. ✅ DONE (Q3 schema gap) — added `CapturedReview.title String?` (additive, nullable, `db push` 1.50s, zero data loss) + extension orchestrator `saveReview` adapters (amazon/ebay/etsy/walmart) now pass title through to `createCapturedReview` (previously dropped) + PLOS POST/PATCH accept + persist + wire shape + shared-types carry it + display-time merge ('title' + period-if-missing + ' ' + 'body') via NEW pure `mergeTitleAndBody` helper on the review-row body cell (`formatRead`; editing still targets `body` only).
7. ✅ DONE — /scoreboard 5/5 GREEN (root+ext tsc clean / ext `npm test` 910/910 UNCHANGED / src/lib `node:test` **1018/1018** +34 from 984 entry / `npm run build` **68 routes** UNCHANGED) + 2 Rule 9 deploy gates.

NO new AI flows. NO Excel. NO drag.

Schema-change-in-flight = **YES → NO** (Q3 `CapturedReview.title` migration; FLIPPED YES → NO at the initial deploy push `351342a` to main).

**Fix Session C — NEW per-competitor non-bulleted flow + Auto-create non-bulleted button + Excel Export + Drag-to-reorder.**

Scope:
1. NEW per-competitor non-bulleted flow in `run-batch.ts` (Q8 — flow value name decided at start of session).
2. Author v1 non-bulleted prompt jointly with director at start of session per `feedback_plan_output_shape_before_building.md`. Captures into spec doc §3 "AI flow" sub-section.
3. NEW top-of-page "Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)" button + modal (mirror existing bulleted modal).
4. NEW per-URL inline non-bulleted button (per Q4 → A).
5. Wire per-competitor non-bulleted WRITE-BACK to `CompetitorUrl.overallAnalyses["reviews"]` — APPEND at the BOTTOM per §1 verbatim "merge, never overwrite" (D-10 fix; non-bulleted half).
6. Extend `review-analysis-update.ts` PATCH endpoint to accept PER_PRODUCT non-bulleted edits.
7. NEW "Export Table" button at top of page → `xlsx` library + word-wrap on AI cells + file naming `competitor-reviews-analysis-{project-slug}-{YYYY-MM-DD}.xlsx` (Q7 → A).
8. NEW `CapturedReview.sortRankInReviewsTable Int?` column (Q5 → A; per-page-specific). Schema migration via `prisma db push` (additive; zero data loss).
9. Drag-to-reorder URL rows using existing `CompetitorUrl.sortRank` (Q5 → A; single source of truth across pages).
10. Drag-to-reorder review rows within a URL using new `CapturedReview.sortRankInReviewsTable`.
11. /scoreboard + deploy decision Rule 14f.

Schema-change-in-flight = YES this session (new column).

**After Fix Sessions A+B+C complete**, the Reviews Analysis Table page is fully compliant with §1 verbatim. Then Category page corrective rebuild Sessions 1-3 + Type page Sessions 4-5 (per `docs/polish-item-specs/P-49-W5-S4-category-page.md` and `P-49-W5-S5-type-page.md`).

**Full P-49 W5 corrective work ahead = 8 sessions:** Fix A + Fix B + Fix C (Reviews Analysis Table) + Category 1 + Category 2 + Category 3 + Type 4 + Type 5.

---

## §4 — Open questions (still under discussion)

**Q1 through Q7 RESOLVED 2026-05-28-b + Q10 RESOLVED 2026-05-29 at Fix Session A planning + Q3 & Q9 RESOLVED 2026-05-30 at Fix Session B planning** (answers folded into §2 + §3 above). One remaining open question:

- **Q8 — per-batch endpoint flow-value naming convention for the NEW per-competitor non-bulleted flow.** Options: (a) `flow=per-competitor-nonbulleted` (mirrors existing `per-competitor-bulleted` shipped W5 Session 3); (b) `flow=per-product-nonbulleted` (matches enum level `PER_PRODUCT` for clarity). Decide at start of Fix Session C.
- **Q9 RESOLVED 2026-05-30 → A (same Edit-button pattern as banner row):** per-review summary cells reuse the existing Edit-button affordance shipped for the per-competitor banner / summary cell. One consistent edit UX across the table per §1 "all cells should be editable by clicking them."
- **Q3 RESOLVED 2026-05-30 → A (add the title column this session):** add additive nullable `CapturedReview.title String?` column (zero data loss; old rows get NULL title → body-only render unchanged) + wire the extension orchestrator `saveReview` adapters + `createCapturedReview` api-client to stop dropping title + extend PLOS POST/PATCH handlers + wire shape + display-time merge ('title' + period-if-missing + ' ' + 'body') on the review-row body cell. Schema-change-in-flight = YES this session → NO at deploy.
- **Q10 RESOLVED 2026-05-29 → A:** Plain text "N of M summarized" format on URL-row Column 8. No badge/pill, no click-to-expand. Matches the existing count-cell style on the Competitor URLs sibling page. (Reversible later if richer affordance preferred.)

---

## §5 — Cross-references

- **Master spec doc:** `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — verbatim full re-paste covering ALL 3 Reviews Phase 2 pages + cross-cutting joint decisions.
- **Sibling per-page spec docs:**
  - `docs/polish-item-specs/P-49-W5-S4-category-page.md` — Category Table page.
  - `docs/polish-item-specs/P-49-W5-S5-type-page.md` — Type Table page.
- **Related polish-item spec:** `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`.
- **ROADMAP entry:** `docs/ROADMAP.md` P-49 polish-backlog entry.
- **Design doc:** `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 (W5 Session 1.5 design lock — partially superseded for these surfaces by the verbatim §1) + §B 2026-05-27-b (W5 Session 2 — per-review summarize shipped) + §B 2026-05-27-c (W5 Session 3 — per-competitor bulleted shipped + Edit affordance shipped).
- **HANDOFF_PROTOCOL Rule 31** — Polish-item spec capture.
- **CORRECTIONS_LOG:**
  - §Entry 2026-05-28 (HIGH) — Category page wrong-spec rollback + Rule 31 establishment.
  - §Entry 2026-05-28-b (HIGH, pending) — Competitor Reviews Analysis Table divergence discovery + master spec backfill + Rule 31 mechanical read-guarantee additions.
- **Canonical code references:**
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` — the page to fix.
  - `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingSurfaceNav.tsx` — the toggle to rename.
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` — KEEP MECHANICS; ADD write-back hooks for `CapturedReview.analysis` (per-review) + `CompetitorUrl.overallAnalyses["reviews"]` (per-competitor).
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` — EXTEND to accept PER_REVIEW edits + cell-level edits on URL-row data fields.
  - `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` + `UrlDetailContent.tsx` — ADD "Overall Analysis — Captured Reviews" box rendering.
  - `prisma/schema.prisma` — `ReviewAnalysis` model (no schema changes expected); `CompetitorUrl.overallAnalyses["reviews"]` slot exists; needs UI rendering + handler write-backs.
- **Shipped commits for this page (pre-fix):**
  - `60609f6` (2026-05-27-b) — W5 Session 2 per-review summarize end-to-end.
  - `ecf292d` + `d713712` + `cd6478b` — W5 Session 2 fix-forwards.
  - `b9d232e` (2026-05-27-c) — W5 Session 3 per-competitor bulleted end-to-end.
  - `1cd6e3b` + `7f19aca` — W5 Session 3 fix-forwards (4 + 2 Phase-4 redirects).
- **Shipped commits for Fix Session A (2026-05-29 — this fix):**
  - `8708343` — Initial build (5 files +973/-183) — toggle rename to 5 verbatim options + URL row expanded to 10 spec columns + ColumnVisibilityBar + Column 8 "N of M summarized" plain-text count + click-to-edit on URL-row cells 1-7 + click-to-edit on review-row body/star/reviewer/date + NEW `src/lib/competition-scraping/reviews-analysis-table-columns.ts` helper module.
  - `0b21c09` — FF1 (5 files +936/-517) — 8 redirects bundled: NEW Platforms filter chips + visible cell borders + CSS grid → HTML `<table>` + drag-to-resize via NEW shared `ColumnResizeHandle` extracted from `UrlTable.tsx` + 3 button text renames.
  - `31c54a0` — FF2 (5 files +466/-6) — 5 redirects bundled: full-length drag handles + sticky header + viewport-locked scrollbar + column widths + visibility persist server-side via existing /table-preferences (NO schema change) + per-review + per-competitor summary persistence-on-refresh via NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route + NEW `src/lib/competition-scraping/handlers/review-analysis-list.ts` (closes D-8 — lifted forward from Fix Session B per director directive).
  - `12c042c` — FF3 (2 files +97/-33) — 4 redirects bundled: colspan off-by-one + click-to-expand Column 8 + viewport-floating scrollbar via full-viewport flex-column page restructure + button reorder.
  - `3fbe12e` — FF4 (3 files +308/-55) — Column 8 + Column 9 cells become expand/collapse triggers with state-aware text via NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` + 9 new node:test cases. NEW reusable PATTERN memorialized: Cell-level click handlers + state-aware text affordance Pattern.
