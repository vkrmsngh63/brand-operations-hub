# P-55 — `/comprehensive-analysis` Files box + primer, and `/competition-scraping` main-table additions

**Polish-item ID:** P-55
**Created:** 2026-06-02 (`session_2026-06-02_p55-comprehensive-analysis-files-and-main-table-additions`)
**Status:** IN PROGRESS — Phase 1 + Phase 2a + Phase 2b-i + Phase 2b-ii ✅ DEPLOYED-AND-VERIFIED (the four Files-box exports director-VERIFIED on vklf.com 2026-06-02-c: ALL FOUR PASS — the verification deferred at 2026-06-02-b is CLOSED). THREE "without individual reviews" trimmed-export variants ✅ DEPLOYED-AND-VERIFIED 2026-06-02-c (`8420739`; director real-Chrome "pass") — the Files box now lists SEVEN files. Phase 3 part 1 (the primer CONTENT generator + director-APPROVED wording) ✅ BUILT + committed (now on main inert at `dfa4af1`). Phase 3 part 2 (the primer .docx + "Insert primer" editor button + Files-box entry) REMAINS — the ONLY open P-55 unit.

**Update 2026-06-02-c (`session_2026-06-02-c_p55-without-individual-reviews-export-variants`):** the director verified all four Comprehensive Analysis Files exports on vklf.com — ALL FOUR PASS (Phase 2b-ii four-export verification CLOSED; carry-forward 1 from 2026-06-02-b cleared) — THEN directed THREE NEW "without individual reviews" download buttons (the three reviews spreadsheets, trimmed of every per-individual-review column), built + shipped + director real-Chrome verified ("pass") in ONE build `8420739` (`main` went `d7c8894 → 8420739`). The "Comprehensive Competitive Analysis Files" box now lists SEVEN files (the original four UNCHANGED + three trimmed variants); "Download all (.zip)" bundles all seven; every new file still rebuilds fresh from live data on each click. Implementation: a `withoutIndividualReviews` opt added to `buildReviewsAnalysisExportMatrix` (new trimmed header + one-row-per-competitor path) and to `buildGroupedReviewsAnalysisExportMatrix` / its two wrappers `buildCategoryReviewsAnalysisExportMatrix` / `buildTypeReviewsAnalysisExportMatrix` (filters the registry columns to drop `stars` / `reviewsSummary` / `catSourceReviews`|`typeSourceReviews`; skips the per-source-review banner rows so the group's two AI summaries appear on one banner row; collapses per-review row expansion to one row per competitor) in `comprehensive-analysis-exports.ts`; 3 new FileDescriptors + 3 download handlers + 3 trimmed array-buffer builders + the 3 files added to the zip in `ComprehensiveAnalysisFilesBox.tsx` (the inline button-onClick ternary refactored into a `downloadHandlers` record); +5 node:test. Baselines: src/lib `node:test` = **1335/1335** (+5); `npm run build` = **71 routes UNCHANGED**; extension = **910/910 UNCHANGED**. Schema-change-in-flight NO entry → NO exit. ONE pre-coding AskUserQuestion design picker (how far to trim the FLAT file → "Drop ALL review detail (recommended)"; see §2). §3.B updated to the SEVEN-file shape + the trimmed-variant column rules; §4 "without individual reviews" scope question RESOLVED.

**Update 2026-06-02-b (`session_2026-06-02-b_p55-phase-2b-ii-grouped-spreadsheets-audit-and-primer-content`):** Phase 2b-ii (the two grouped "Reviews Analysis By Competitor Category" + "By Competitor Type" spreadsheets) ✅ DEPLOYED on vklf.com after FOUR fix-forwards, plus a full four-file export audit, plus the Phase 3 part 1 primer content generator built + approved (held back inert). FIVE deploys: `e705f10` (Phase 2b-ii grouped spreadsheets — one generic grouped-export engine + two wrappers; reuses `buildCategoryGroups`/`buildTypeGroups` + `buildCategorySourceReviewRows`) → `fd63d45` (FF1: clamp every cell to Excel's 32,767-char limit via `clampToExcelCellLimit` — fixed a "Text length must not exceed 32767 characters" error) → `0718711` (FF2: Source Reviews rebuilt as their OWN Excel rows, not one repeated cell) → `1be0f62` (FF3: grouped sheets rebuilt to MATCH the on-screen By-Category/By-Type tables EXACTLY — columns + order read from `CATEGORY_TABLE_COLUMNS`/`TYPE_TABLE_COLUMNS`, dropped the invented "Review" + "Source for AI complaint" columns; category/type SUMMARY/banner rows first then competitor REVIEW rows) → `41481f0` (FF4: the flat "Competition Reviews Analysis" export rebuilt to include ALL table data incl. click-to-reveal — added the "Reviews Summary" count column + Reviewer + Date; added `reviewerName`+`reviewDate` to the live `/reviews` fetch). `main` went `b34a8b8 → e705f10 → fd63d45 → 0718711 → 1be0f62 → 41481f0`. Held back: `dfa4af1` (Phase 3 part 1 primer content generator `comprehensive-analysis-primer.ts` — `buildPrimer()` reflects the project's actual columns + `renderPrimerToPlainText`; +5 node:test; director-APPROVED wording; NOT wired to any UI). **THE FOUR-FILE AUDIT:** all four Files-box exports now (a) match their on-screen table's columns + order with no arbitrary columns, (b) split every sub-row across all columns into its own row, (c) generate fresh from live data on every download click. Baselines: src/lib `node:test` = **1330/1330** (+13); `npm run build` = **71 routes UNCHANGED** (the primer lib is not yet imported); extension = **910/910 UNCHANGED**. Schema-change-in-flight NO entry → NO exit. The §3.B standing export rules were rewritten to the FINAL 4-point rule (below); the §4 grouped-row-shape open question is RESOLVED ("match the on-screen table exactly").

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

**2026-06-02-c — director directive (after verifying the four exports, VERBATIM):**

> All 4 pass. Also, I want you to also create download buttons for 'Competition Reviews Analysis', 'Reviews Analysis By Competitor Category' and 'Reviews Analysis By Competitor Type' that don't include the 'Stars', 'Reviews Summary' and 'Source Reviews' columns. Just add 'without individual reviews' after the file names to distinguish these files.

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

**2026-06-02-c — "without individual reviews" trim depth (ONE AskUserQuestion picker BEFORE coding, per `feedback_plan_output_shape_before_building`):**

The director named three columns to drop — "Stars", "Reviews Summary", and "Source Reviews". For the FLAT "Competition Reviews Analysis without individual reviews" file this was ambiguous because that file has per-individual-review columns BEYOND the three the director named (Review / Reviewer / Date / Review Summary), so I asked how far to trim. **Director chose "Drop ALL review detail (recommended)"** — remove EVERY per-individual-review column, leaving one row per competitor with the identity columns (Platform / Category / Type / Product Name / Results Rank / Comp. Score / URL) + the two Comprehensive (bulleted + non-bulleted) summaries. (The two grouped files — By Competitor Category + By Competitor Type — were unambiguous: the three named columns ARE their only individual-review columns, so the trim there is exactly Stars + Reviews Summary + Source Reviews, leaving one short banner row per group + one row per competitor.)

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

### A. `/competition-scraping` main Competitor URLs table (Phase 1 — ✅ DEPLOYED-AND-VERIFIED 2026-06-02)

1. **New "Overall Competitor Analysis" fixed column**, default-placed just left of "Added On" (and left-of-OCA for the dynamic category columns). Cell shows `CompetitorUrl.overallCompetitorAnalysis` (plain-text preview); click → pop-out `OverallAnalysisBox` editor; saves via the existing `urls/[urlId]` PATCH. Hideable, sortable (by flattened plain text), drag-reorderable. Added to `TABLE_COLUMN_DEFS` + `COLUMNS` (lockstep) + `cellRenderers`.
2. **Columns-box checkbox order mirrors the table** (per-column + the 3 category-GROUP checkboxes interleaved at their kind's column position; FF1). NEW helpers: `withMissingKeysBefore` (`column-order.ts`) + `orderedColumnBoxEntries` (`dynamic-columns.ts`).

### B. `/comprehensive-analysis` Files box (Phase 2)

> **STANDING EXPORT RULES — MANDATORY for ALL four spreadsheets AND any future export file (FINAL 4-point rule, 2026-06-02-b; → memory `feedback_exports_include_all_table_data`):**
> 1. **Match the on-screen table's columns + their order EXACTLY** — no invented/arbitrary columns, no reordering. Source the columns from the page's column registry (e.g. `CATEGORY_TABLE_COLUMNS` / `TYPE_TABLE_COLUMNS` for the grouped sheets; `TABLE_COLUMN_DEFS` for the main table), NOT a parallel hardcoded list, so the export can't drift. (The one export that had drifted was the flat Reviews Analysis sheet using the hardcoded `REVIEWS_ANALYSIS_HEADER`; fixed FF4.)
> 2. **Include ALL data the table can show, including click-to-reveal / expand-only data** — anything only shown when a row is clicked/expanded (e.g. the `/competitor-reviews-analysis` expand panel's Reviewer · Date · per-row Summary) must be in the export too. Director verbatim (2026-06-02): *"Any column or data that is only shown when clicked on should be automatically included in the table that is exported. In other words, all possible data that is included in the table should be exported."*
> 3. **Sub-rows are listed as SEPARATE Excel rows across ALL columns** (Excel has no sub-rows). Every on-screen stacked sub-row expands into a real row; the row's shared/fixed columns REPEAT on each expanded row. For the grouped By Category / By Type tables BOTH levels expand — competitors within a category/type banner, and reviews within a competitor — each its own row; category/type SUMMARY (banner) rows first then competitor REVIEW rows.
> 4. **Every download takes the MOST CURRENT data at click time.** All builders run inside `ComprehensiveAnalysisFilesBox`'s download handlers, which re-fetch the live sources (`/urls?withCaptures=1`, `/review-analysis`, each URL's `/reviews`) on every click — so new export files inherit "fresh on click" automatically; do NOT introduce a cached/mount-fetched data path.
> 5. **Backstop:** clamp every cell value to Excel's **32,767-character per-cell limit** (`clampToExcelCellLimit`) before assembling the workbook — long free-text (reviews, AI prose) can otherwise trigger a "Text length must not exceed 32767 characters" download error (caught FF1).

- **"Comprehensive Competitive Analysis Files" box above the editor** (`ComprehensiveAnalysisFilesBox.tsx`), listing SEVEN spreadsheets (2026-06-02-c — the four below + three "without individual reviews" trimmed variants of the three reviews files) + a "Download all (.zip)" (JSZip, bundles all seven). Each download re-fetches live data at click time. The button-onClick dispatch is a `downloadHandlers` record keyed by file key (refactored from an inline ternary, 2026-06-02-c).
- **Spreadsheet builders** (`comprehensive-analysis-exports.ts`, pure + node:tested): all columns/all rows; sub-rows expanded to real rows; shared fields repeated.
  - **Competition Content Overview** (main table — Phase 2a ✅ verified): fixed columns + dynamic category pairs + Overall Competitor Analysis; reuses `dynamic-columns` helpers + `tipTapDocToPlainText`.
  - **Competition Reviews Analysis** (Phase 2b-i ✅ DEPLOYED; rebuilt FF4 `41481f0` to mirror the `/competitor-reviews-analysis` table EXACTLY — one row per captured review with Stars · Review · Reviewer · Date · Review Summary + the "Reviews Summary" count column + per-competitor fields + comprehensive bulleted/non-bulleted AI summaries repeated; reads columns from the page registry, no hardcoded header; the live `/reviews` fetch now also returns `reviewerName` + `reviewDate`; **director-VERIFIED 2026-06-02-c: PASS**). Derives PER_REVIEW + PER_PRODUCT maps from `/review-analysis`; reuses `mergeTitleAndBody`.
  - **Reviews Analysis By Competitor Category** + **Reviews Analysis By Competitor Type** (Phase 2b-ii ✅ DEPLOYED `e705f10` + FF1–FF4; **director-VERIFIED 2026-06-02-c: PASS**): one generic grouped-export engine + two thin wrappers; grouped TWO-LEVEL (competitors within a category/type banner, reviews within a competitor) — category/type SUMMARY (banner) rows first then competitor REVIEW rows, columns + order read from `CATEGORY_TABLE_COLUMNS` / `TYPE_TABLE_COLUMNS` to MATCH the on-screen By-Category / By-Type tables exactly (no invented columns); Source Reviews as their own rows. Reuses `category-analysis-aggregation`, `buildCategoryGroups` / `buildTypeGroups`, `buildCategorySourceReviewRows`, `category-table-columns` / `type-table-columns`.

- **The three "without individual reviews" trimmed variants (2026-06-02-c, ✅ DEPLOYED-AND-VERIFIED `8420739`; director real-Chrome "pass"):** summary-only versions of the three reviews spreadsheets, distinguished by appending "without individual reviews" to the file name. Built via a `withoutIndividualReviews` opt on the SAME builders (no parallel code path), so they stay registry-pinned to their source tables and cannot drift:
  - **Competition Reviews Analysis without individual reviews** — one row per competitor; drops EVERY per-individual-review column (Stars, the Reviews Summary count, AND the flat file's per-review Review / Reviewer / Date / Review Summary); keeps Platform / Category / Type / Product Name / Results Rank / Comp. Score / URL + the two Comprehensive (bulleted + non-bulleted) summaries. (Trim depth = "Drop ALL review detail" per the §2 2026-06-02-c picker.)
  - **Reviews Analysis By Competitor Category without individual reviews** + **Reviews Analysis By Competitor Type without individual reviews** — drop Stars / Reviews Summary / Source Reviews (`stars` / `reviewsSummary` / `catSourceReviews`|`typeSourceReviews`); skip the per-source-review banner rows so the group's two Comprehensive summaries appear on ONE short banner row per category/type, above one row per competitor (per-review row expansion collapsed to one row per competitor).

### C. Primer (Phase 3)

- A primer DESCRIBING each table + its columns + what each column contains, generated to reflect the project's ACTUAL columns. Lives as (a) a Word .docx in the Files box, AND (b) insertable into the editor via an "Insert primer" button. No schema change anticipated.
- **Phase 3 part 1 (✅ BUILT 2026-06-02-b, committed workflow-2 `dfa4af1`, INERT/unwired):** the pure node:tested CONTENT generator `comprehensive-analysis-primer.ts` — `buildPrimer()` (reflects the project's actual columns) + `renderPrimerToPlainText` (+5 node:test) + the director-APPROVED wording. NOT imported by any UI, so the build stays 71 routes; rides onto main inert via the doc-batch ff-merge.
- **Phase 3 part 2 (REMAINS — next session):** render `buildPrimer()` to a Word `.docx` + add it to the Files box (reuse `ComprehensiveAnalysisFilesBox.tsx` + the re-fetch-on-every-download pattern + jszip for the .zip) AND add an "Insert primer" editor button (re-clickable to refresh; NOT a fixed header, NOT auto-insert). Confirm whether `.docx` generation needs a new library (e.g. `docx`) — flag + confirm at that build; if so, add it as an additive client dependency.

---

## §4 — Open questions

- **Phase 2b-ii row shape — ✅ RESOLVED 2026-06-02-b:** the grouped sheets must **match the on-screen By-Category / By-Type tables EXACTLY** — same columns in the same order (read from `CATEGORY_TABLE_COLUMNS` / `TYPE_TABLE_COLUMNS`), no invented columns; category/type SUMMARY (banner) rows first then competitor REVIEW rows; both levels expand into real rows; Source Reviews as their own rows (FF1–FF4). (Director verification of the final four exports on vklf.com is DEFERRED — owed FIRST next session.)
- **Phase 3 primer wording/structure — ✅ RESOLVED 2026-06-02-b:** the per-table/per-column description wording was planned WITH the director (per `feedback_plan_output_shape_before_building`) and director-APPROVED; it lives in the committed content generator `comprehensive-analysis-primer.ts` (`dfa4af1`). REMAINING question for Phase 3 part 2: confirm whether `.docx` generation needs a new library (e.g. `docx`) — flag + confirm at that build (additive client dependency; no schema change).
- **"Without individual reviews" trim scope (the FLAT file) — ✅ RESOLVED 2026-06-02-c:** the flat "Competition Reviews Analysis without individual reviews" file DROPS ALL per-individual-review detail (not only the three named columns) — one row per competitor with identity columns + the two Comprehensive summaries (director picker "Drop ALL review detail (recommended)"). The two grouped trimmed variants drop exactly Stars / Reviews Summary / Source Reviews. Shipped + director-verified at `8420739`.

---

## §5 — Cross-references

- **Supersedes the UI dimension of P-51** (`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`): P-51 assumed an in-app AI-summarize button writing into the editor; P-55 is the director's actual direction (prepare downloadable materials + a primer; AI run by the director). The `ReviewAnalysis.PER_PROJECT` enum slot noted in P-51 remains unused.
- **Builds on P-54** (closed) — the main Competitor URLs table (dynamic category columns + shared `ProjectTablePreferences` column order). P-55's new column + checkbox-order mirroring extend it.
- **Excel export precedent:** `reviews-table-export.ts` (the `/competitor-reviews-analysis` "Export Table"); P-55 reuses `slugifyForFilename`. P-53 (deferred Excel export for Category/Type pages) is effectively absorbed by Phase 2b-ii.
- **New dependency:** `jszip ^3.10.1` (the "Download all" zip).
