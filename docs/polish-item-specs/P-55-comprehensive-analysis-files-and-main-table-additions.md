# P-55 — `/comprehensive-analysis` Files box + primer, and `/competition-scraping` main-table additions

**Polish-item ID:** P-55
**Created:** 2026-06-02 (`session_2026-06-02_p55-comprehensive-analysis-files-and-main-table-additions`)
**Status:** IN PROGRESS — Phase 1 + Phase 2a + Phase 2b-i ✅ DEPLOYED (Phase 1 + 2a director-verified; 2b-i awaiting director verification). Phase 2b-ii (By Category + By Type spreadsheets) + Phase 3 (primer) REMAIN.

This item is the concrete, director-driven realization of the deferred (a.119)
`/comprehensive-analysis` work. The director's actual direction (captured §1)
**supersedes** the old P-51 skeleton idea (a single in-app "AI summarize"
button writing into the editor): P-55 instead PREPARES the materials (Excel
spreadsheets of the four competition tables + a teaching "primer") so the
director feeds them to an AI of their choice, with the primer also pasted into
the editor. See P-51 cross-reference at the bottom.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-06-02 — director's opening directive (session start):**

> I want to add the following changes to the '/competition-scraping' page:
>
> - Add a new column just to the left of the 'Added On' column at the very right and this new column should have the header 'Overall Competitor Analysis' and the data in each cell in this column should be the data from the 'Overall Competitor Analysis' box from the details page for each competitor such that the row for each competitor should have this data in the cell in that row and the 'Overall Competitor Analysis' column.
> - The order of the checkboxes in the 'Columns' box should be the same order as the columns in the table on the page. When the order of the columns changes, the order of the checkboxes should change as well.
>
> I want to add the following changes to the '/comprehensive-analysis' page:
>
> - There should be a new box above the editor box with the title 'Comprehensive Competitive Analysis Files'. In this box, there should be the excel files for the tables in each of the following pages:
>   - '/competition-scraping' page: Name this table 'Competition Content Overview'
>   - '/competitor-reviews-analysis' page: Name this table 'Competition Reviews Analysis'
>   - '/reviews-analysis-by-category' page: Name this table 'Reviews Analysis By Competitor Category'
>   - '/reviews-analysis-by-type' page: Name this table 'Reviews Analysis By Competitor Type'
> - Then in the editor box in the '/comprehensive-analysis' page, add a primer that tells the AI model what data each table has and what columns are present and what data each column contains. This primer is meant to help the AI model analyze the competition in a thorough and organized manner. It is also meant to help the AI customize its analysis by deciding what data to include in its analysis and what data to ignore (for example if the goal of the analysis is to develop a competitive strategy targeting a specific 'Type' of product within the overall niche, the model can focus on a specific 'Type' of the product'. This primer should also be available as a doc file inside the 'Comprehensive Competitive Analysis Files' box. The files in the 'Comprehensive Competitive Analysis Files' box should be either downloadable individually or together as a zip folder.

**2026-06-02 — director sub-row correction (during Phase 2a verification, VERBATIM):**

> Subrows should be handled like rows in excel because excel cannot do subrows. Right now, sub-rows are inserted into the same row.

**2026-06-02 — director freshness question (during Phase 2b-i, paraphrased Q + verbatim decision):**

> Q: "Do the file download links get updated each time any of the tables get updated with data?"
> Decision (picker): downloads should pull the very latest data at click time ("always current on every download").

---

## §2 — Joint-discussion adjustments (append-only, chronological)

**2026-06-02 — design decisions resolved WITH the director via AskUserQuestion (all "recommended" unless noted):**

Round 1 (before any code):
- **AI analysis location:** the app PREPARES the materials (spreadsheets + primer); the DIRECTOR runs the AI themselves (download → feed to an AI → paste/refine in the editor). An in-app "do it for me" button is a possible LATER step, not in P-55.
- **Primer content:** reflects the ACTUAL tables/columns the project has (incl. custom category columns + the new Overall Competitor Analysis column), not a fixed template.
- **Spreadsheet scope:** EVERYTHING in each table — all columns + all rows — regardless of on-screen hide/reorder.
- **New main-table column:** the Overall Competitor Analysis cell is EDITABLE in-table via a pop-out editor (reuses `OverallAnalysisBox`), saving to the same `CompetitorUrl.overallCompetitorAnalysis` the detail page uses.

Round 2:
- **Primer doc-file format:** Word document (.docx).
- **Primer into editor:** an "Insert primer" button (re-clickable to refresh), not a fixed header / not auto-insert.
- **Multi-item handling (INITIAL):** "one row per competitor, items combined" — **SUPERSEDED** by the 2026-06-02 sub-row correction below.
- **Build cadence:** phase it, ship + verify each piece.

Mid-build refinements:
- **Sub-rows → real Excel rows (supersedes the "combine" choice):** the on-screen stacked sub-rows EXPAND into genuine Excel rows; the competitor's shared/fixed columns REPEAT on every one of its rows ("repeat on every row", chosen over "first row only, blanks below").
- **Reviews-analysis detail level:** the three reviews spreadsheets include EVERYTHING — each individual customer review as its own row (Stars + Review text + Review Summary) AND all the AI summaries (per competitor / per category / per type).
- **Download freshness:** every download (each file + the zip) re-fetches live data at click time.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

### A. `/competition-scraping` main Competitor URLs table (Phase 1 — ✅ DEPLOYED-AND-VERIFIED 2026-06-02)

1. **New "Overall Competitor Analysis" fixed column**, default-placed just left of "Added On" (and left-of-OCA for the dynamic category columns). Cell shows `CompetitorUrl.overallCompetitorAnalysis` (plain-text preview); click → pop-out `OverallAnalysisBox` editor; saves via the existing `urls/[urlId]` PATCH. Hideable, sortable (by flattened plain text), drag-reorderable. Added to `TABLE_COLUMN_DEFS` + `COLUMNS` (lockstep) + `cellRenderers`.
2. **Columns-box checkbox order mirrors the table** (per-column + the 3 category-GROUP checkboxes interleaved at their kind's column position; FF1). NEW helpers: `withMissingKeysBefore` (`column-order.ts`) + `orderedColumnBoxEntries` (`dynamic-columns.ts`).

### B. `/comprehensive-analysis` Files box (Phase 2)

- **"Comprehensive Competitive Analysis Files" box above the editor** (`ComprehensiveAnalysisFilesBox.tsx`), listing the four spreadsheets + a "Download all (.zip)" (JSZip). Each download re-fetches live data at click time.
- **Spreadsheet builders** (`comprehensive-analysis-exports.ts`, pure + node:tested): all columns/all rows; sub-rows expanded to real rows; shared fields repeated.
  - **Competition Content Overview** (main table — Phase 2a ✅ verified): fixed columns + dynamic category pairs + Overall Competitor Analysis; reuses `dynamic-columns` helpers + `tipTapDocToPlainText`.
  - **Competition Reviews Analysis** (Phase 2b-i ✅ DEPLOYED, ⏳ awaiting director verification): one row per captured review (Stars · Review · Review Summary) + per-competitor fields + comprehensive bulleted/non-bulleted AI summaries repeated. Derives PER_REVIEW + PER_PRODUCT maps from `/review-analysis`; reuses `mergeTitleAndBody`.
  - **Reviews Analysis By Competitor Category** + **Reviews Analysis By Competitor Type** (Phase 2b-ii — NOT BUILT; currently shown "Added in the next update"): grouped (two-level: competitors within category/type banner, reviews within competitor) + per-category/per-type bulleted/non-bulleted summaries + Source Reviews. Reuse `category-analysis-aggregation`, `buildCategoryGroups`, `buildCategorySourceReviewRows`, `category-table-columns` / `type-table-columns`.

### C. Primer (Phase 3 — NOT BUILT)

- A primer DESCRIBING each table + its columns + what each column contains, generated to reflect the project's ACTUAL columns. Lives as (a) a Word .docx in the Files box, AND (b) insertable into the editor via an "Insert primer" button. No schema change anticipated.

---

## §4 — Open questions (still under discussion)

- **Phase 2b-ii row shape:** confirm with the director at verification whether the two-level (category/type → competitor → review) expansion + the category/type-level summary columns read well; mirror the main-table/reviews row-expansion rule.
- **Phase 3 primer:** exact wording/structure of the per-table/per-column descriptions (plan the output shape WITH the director before coding, per `feedback_plan_output_shape_before_building`); confirm whether .docx generation needs a new library (e.g. `docx`) — flag + confirm at that build.

---

## §5 — Cross-references

- **Supersedes the UI dimension of P-51** (`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`): P-51 assumed an in-app AI-summarize button writing into the editor; P-55 is the director's actual direction (prepare downloadable materials + a primer; AI run by the director). The `ReviewAnalysis.PER_PROJECT` enum slot noted in P-51 remains unused.
- **Builds on P-54** (closed) — the main Competitor URLs table (dynamic category columns + shared `ProjectTablePreferences` column order). P-55's new column + checkbox-order mirroring extend it.
- **Excel export precedent:** `reviews-table-export.ts` (the `/competitor-reviews-analysis` "Export Table"); P-55 reuses `slugifyForFilename`. P-53 (deferred Excel export for Category/Type pages) is effectively absorbed by Phase 2b-ii.
- **New dependency:** `jszip ^3.10.1` (the "Download all" zip).
