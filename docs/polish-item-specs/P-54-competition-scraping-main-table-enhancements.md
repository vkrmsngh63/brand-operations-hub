# `/competition-scraping` main-table enhancements — full spec

**Polish-item ID:** P-54 (next free ID after P-53; main `/competition-scraping` page / `UrlTable` enhancements)
**Created:** 2026-06-01 (`session_2026-06-01-b` — requirements-gathering opener)
**Status:** 🟢 IN-FLIGHT — §1 captured VERBATIM; §2/§3 requirements-gathering DONE (Q&A + output-shape planning BEFORE code, per `feedback_plan_output_shape_before_building`). **Phases 1–3 (R1–R5) ✅ DEPLOYED-AND-VERIFIED 2026-06-01-b on vklf.com** (director Phase 4 PASS on all five deploys; builds `b134b5d` / `e0661ba` / FF1 `b27841f` / FF2 `1f18308` / `7a10ba4`). **Phases 4 (Sort By grouping, R6/D2) + 5 (dynamic category columns, R7/R8/R9/D3–D9) remain** — see §3 + §4 (resolve Q-H before Phase 4; Q-F + Q-I before Phase 5).

**Context note:** Opened when the director DEFERRED (a.119) `/comprehensive-analysis` AI-summary (P-51) to "the session after the requirements of the features mentioned today are finished," and instead directed this batch of `/competition-scraping` main-page changes.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-06-01 — director's directive (verbatim):**

> I want to add the following things to Workflow #2:
>
> '/competition-scraping' page changes:
>
> - In the '/competition-scraping' page, the right edge of the table (which is also the right border of the last column) is not draggable. That means the user cannot adjust the width of the last column. Please fix this so that the user can adjust the width of the last column.
>
> - The horizontal scroll at the bottom of the table should be floating at the bottom of the user's screen so that no matter where the user is along the vertical length of the table, they can scroll horizontally.
>
> - Currently, on the '/competition-scraping' page, between the 'Resouces' box and the 'Platforms' box, there is a blue button with the text 'Comprehensive Competitor Analysis'. Please remove this button because we already have a link at the top (Comprehensive Analysis) that goes to the same page.
>
> - Please don't make the table scrolls separate from the page scrolls. If the user wants to scroll vertically or horizontally to see the table, they should be able to use the page scrolls.
>
> - The user should be able to move columns relative to each other and position them in different relative orders. Once a user does that, the system should remember this server side.
>
> - Besides the 'Platforms' and 'Columns' boxes that have options of sorting views in the table, there should be another box called 'Sort By' and there should be 3 options:
>   -- 'Platform': Which should group all rows by common platforms.
>   -- 'Category': Which should group all rows by common categories.
>   -- 'Type': Which should group all rows by common types.
>
> - When the user adds any text using the Workflow #2 extension to a competitor url, the system should create a new column to the left of the 'Added On' column on the table with the header text that has the format 'Content Category: [Acme]' where '[Acme]' is replaced with the content category name chosen by the user and then in the cell in that column and the row of that competitor url, the system should add the text that the user added under that url. When a new column is added in such a way, the system should also add a sorting checkbox in the 'Columns' box with the text 'Content Categories' so that when this checkbox is checked, all the individual content categories columns will be shown and when the checkbox is unchecked all the content category columns will be hidden. Note that to the immediate right of each content category column, the system should create another column that has the text format '[Content Category Name] Analysis' where '[Content Category Name]' is replaced with the content category name of the column to the immediate left and in this column that system should add the data from the 'Your Analysis' box under that specific text from the competitor's details page which was added to the cell to its immediate left. Make sure the data from the 'Your Analysis' box is always added to the correct column and row in the table - which means, the your analysis should always be in the cell to the immediate right of the text associated with it, in the row of that specific competitor. Also, note that the 'Content Category: [Acme]' column and its associated '[Content Category Name] Analysis' column should be "locked together" in the table. In other words, if the user decides to move either the 'Content Category: [Acme]' column or its associated '[Content Category Name] Analysis' column within the table to a different location relative to other columns, both the columns should move together.
>
> - When the user adds any image using the Workflow #2 extension to a competitor url, the system should create a new column to the left of the 'Added On' column on the table with the header text that has the format 'Image Category Embedded Text: [Acme]' where '[Acme]' is replaced with the image category name chosen by the user and then in the cell in that column and the row of that competitor url, the system should add the embedded text that the user added under that url. Note that if the user updates the embedded text in the competitor's details page, this data should get updated in the table in real-time as well. When a new column is added in such a way, the system should also add a sorting checkbox in the 'Columns' box with the text 'Image Categories' so that when this checkbox is checked, all the individual image categories columns will be shown and when the checkbox is unchecked all the image category columns will be hidden. Note that to the immediate right of each image category column, the system should create another column that has the text format '[Image Category Name] Analysis' where '[Image Category Name]' is replaced with the image category name of the column to the immediate left and in this column that system should add the data from the 'Your Analysis' box under that specific image embedded text from the competitor's details page which was added to the cell to its immediate left. Make sure the data from the 'Your Analysis' box is always added to the correct column and row in the table - which means, the your analysis should always be in the cell to the immediate right of the embedded text associated with it, in the row of that specific competitor. Also, note that the 'Image Category Embedded Text: [Acme]' column and its associated '[Image Category Name] Analysis' column should be "locked together" in the table. In other words, if the user decides to move either the 'Image Category Embedded Text: [Acme]' column or its associated '[Image Category Name] Analysis' column within the table to a different location relative to other columns, both the columns should move together.
>
> - When the user adds any video using the Workflow #2 extension to a competitor url, the system should create a new column to the left of the 'Added On' column on the table with the header text that has the format 'Vieo Category Embedded Text: [Acme]' where '[Acme]' is replaced with the video category name chosen by the user and then in the cell in that column and the row of that competitor url, the system should add the embedded text that the user added under that url. Note that if the user updates the embedded text in the competitor's details page, this data should get updated in the table in real-time as well. When a new column is added in such a way, the system should also add a sorting checkbox in the 'Columns' box with the text 'Video Categories' so that when this checkbox is checked, all the individual video categories columns will be shown and when the checkbox is unchecked all the video category columns will be hidden. Note that to the immediate right of each video category column, the system should create another column that has the text format '[Video Category Name] Analysis' where '[Video Category Name]' is replaced with the video category name of the column to the immediate left and in this column that system should add the data from the 'Your Analysis' box under that specific video embedded text from the competitor's details page which was added to the cell to its immediate left. Make sure the data from the 'Your Analysis' box is always added to the correct column and row in the table - which means, the your analysis should always be in the cell to the immediate right of the embedded text associated with it, in the row of that specific competitor. Also, note that the 'Video Category Embedded Text: [Acme]' column and its associated '[Video Category Name] Analysis' column should be "locked together" in the table. In other words, if the user decides to move either the 'Video Category Embedded Text: [Acme]' column or its associated '[Video Category Name] Analysis' column within the table to a different location relative to other columns, both the columns should move together.

---

## §1a — Requirement index (for tracking; not director words)

| # | Short name | Type | Complexity |
|---|------------|------|------------|
| R1 | Last-column right-edge resize | bug fix | small |
| R2 | Floating (viewport-fixed) horizontal scrollbar | UX | medium |
| R3 | Remove blue "Comprehensive Competitor Analysis" button | removal | trivial |
| R4 | Table uses PAGE scroll, not a separate inner scroll | UX | medium (tension w/ R2) |
| R5 | Drag-to-reorder COLUMNS, persisted server-side | feature | medium-large (new persistence) |
| R6 | New "Sort By" box → group rows by Platform / Category / Type | feature | medium-large |
| R7 | Per-content-category dynamic column + paired "[…] Analysis" column (locked pair) + "Content Categories" show/hide checkbox | feature | LARGE |
| R8 | Per-image-category dynamic "Embedded Text" column + paired Analysis column (locked pair) + "Image Categories" checkbox + real-time embedded-text sync | feature | LARGE |
| R9 | Per-video-category dynamic "Embedded Text" column + paired Analysis column (locked pair) + "Video Categories" checkbox + real-time embedded-text sync | feature | LARGE |

---

## §2 — Code-truth findings (Rule 3 audit, 2026-06-01)

Captured at session start to ground the joint-discussion. File:line citations from the two Explore passes.

**Main table component:** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx`. Current 18 columns in order: `platform`(Platform), `competitionCategory`(Category), `type`(Type), `isSponsoredAd`(Sponsored), `productName`(Product Name), `brandName`(Brand Name), `description1`, `description2`, `resultsPageRank`, `price`, `productStarRating`, `numProductReviews`, `sellerStarRating`, `numSellerReviews`, `competitionScore`, `url`(URL), `scrapingStatus`(Status), **`addedAt`(Added On) = LAST column**. Column defs live in `components/url-table-columns.ts` (`TABLE_COLUMN_DEFS`).

- **R1:** A `ColumnResizeHandle` is rendered at `right:0` of EVERY `<th>`, *including* the last (`addedAt`) per the agent. Yet director reports the last column's right edge is not draggable → REAL BUG to diagnose (likely the handle at the table's far right edge is clipped/occluded by the `overflow:auto` container boundary, or the table `width:max-content` leaves the handle outside the scroll viewport). Do NOT assume already-fixed; diagnose live.
- **R2 + R4 TENSION:** Table is currently wrapped in a single `<div style={{ overflow:'auto', maxHeight:'calc(100vh - 200px)', minHeight:'400px', position:'relative' }}>` — BOTH horizontal and vertical scroll happen INSIDE this inner container (separate from the page/window scroll). `<thead>` is `position:sticky`. R4 wants the page/window to own the scroll (drop the inner vertical container); R2 wants a horizontal scrollbar pinned (floating) to the viewport bottom. These must be reconciled — see §4 Q-A.
- **R3:** Blue button = `CompetitionScrapingViewer.tsx` ~lines 505-529, `data-testid="open-comprehensive-analysis-button"`, positioned above the `ColumnVisibilityBar`. Duplicate of the `CompetitionScrapingSurfaceNav` "Comprehensive Analysis" tab (`CompetitionScrapingSurfaceNav.tsx` ~lines 65-70). (Director's "Resouces"/"Resources box" reference — confirm exact layout neighbor; the agent located it above the Platforms/Columns bar.)
- **R5:** Column REORDER does NOT exist today (order fixed by `TABLE_COLUMN_DEFS`). Only column RESIZE + column SHOW/HIDE + ROW reorder exist. Persistence model = `UserTablePreferences` (per user × per project) with `columnVisibility`, `columnWidths`, `fontSize`, `rowOrder` Json fields + `lastUsedSortColumn/Direction`. A NEW `columnOrder` Json field (additive nullable) would be the natural home → schema-change-in-flight.
- **R6:** No row-GROUPING on the main page today (only per-column click-sort). The sibling pages `/reviews-analysis-by-category` + `/reviews-analysis-by-type` already implement banner-row grouping by category/type (helpers `category-table-grouping.ts` / `type-table-grouping.ts`); "Platform" grouping would be net-new.
- **Control boxes:** `components/ColumnVisibilityBar.tsx` renders the Platforms group (multi-select platform checkboxes) + the Columns group (data-driven from `TABLE_COLUMN_DEFS`). A new "Sort By" box would slot here.
- **R7/R8/R9 data model:** One main-table row = one `CompetitorUrl`. A URL can have MANY `CapturedText` / `CapturedImage` / `CapturedVideo` items, and MULTIPLE in the SAME category. Category names are free-text strings on the items (`CapturedText.contentCategory`, `CapturedImage.imageCategory`, `CapturedVideo.videoCategory`), each referencing a per-Project `VocabularyEntry` (`vocabularyType` = content-/image-/video-category). "Your Analysis" per item = `analysis` (TipTap JSON) on each captured row. Image/Video "embedded text" = `embeddedText` (nullable Text, editable on detail page via PATCH `/images/[imageId]` + `/videos/[videoId]`). **Crux:** mapping "the text/embedded-text the user added" + "its Your Analysis" into ONE table cell when a URL has multiple items per category needs a defined rule (stack-as-sub-rows like the reviews rowSpan pattern? newest only? concatenate?) — see §4 Q-D.

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**APPROVED via two AskUserQuestion rounds with director, 2026-06-01-b.** Phase plan APPROVED ("plan all now, build & deploy phase-by-phase across multiple sessions, real-Chrome check after each deploy").

### Resolved design decisions

- **D1 (scroll model — R2+R4) — REVISED 2026-06-01-b after Phase 1 director feedback:** The director clarified ("the page scrolls themselves should suffice… this way the table can be expanded into the page") and, via a fresh 2-question picker, chose the SIMPLER model over the originally-picked floating bar:
  - **Whole page scrolls BOTH axes via the browser's OWN scrollbars.** REMOVE the inner `overflow:auto` + `maxHeight:calc(100vh-200px)` + `minHeight` scroll container entirely so the table is in normal page flow. Vertical = window scrollbar; horizontal = window's bottom scrollbar (fixed at the window bottom, reachable at any scroll position). One set of scrolls = the page's. Dragging the last column's right edge (R1) now expands the table into the page. Accepted tradeoff: the page chrome above the table (back button, surface-nav tabs, Platforms/Columns boxes) slides sideways on horizontal scroll.
  - **Header row stays PINNED** to the top of the window via `position:sticky; top:0` on the `<thead>` — which now sticks to the VIEWPORT (works cleanly because removing the inner `overflow` container means no scroll-container ancestor breaks viewport-sticky). Confirm no fixed/sticky page topbar overlaps `top:0` — set `top` to the topbar height if one exists.
  - **SUPERSEDES** the earlier floating-synthetic-bar approach (no longer building it). The window's native horizontal scrollbar IS the "floating at the bottom of the screen" affordance.
  - **Page-container check required:** ensure no ancestor (`maxWidth` + `overflow-x:hidden`, layout wrapper) clips the wide table or blocks horizontal window scroll.
- **D2 (Sort By grouping — R6):** Banner-row grouping, REUSING the `/reviews-analysis-by-category` + `/reviews-analysis-by-type` pattern (group header row + nested competitor rows + an `(Untyped)`/`(Uncategorized)` bucket). Three groupings: Platform / Category (`competitionCategory`) / Type (`type`). Mutually exclusive selection; a "None"/flat default must remain (confirm flat = current ungrouped view). Note: Sort-By "Category"/"Type" = the COMPETITOR's `competitionCategory`/`type` columns — distinct from the captured-content categories of R7/R8/R9.
- **D3 (multi-item cells — R7/R8/R9):** Stacked, aligned sub-rows — each captured item stacks vertically in the category cell; its "Your Analysis" sits exactly beside it in the immediate-right column. REUSE the reviews-table `rowSpan` sub-row alignment pattern.
- **D4 (freshness — R7/R8/R9 "real-time"):** Refetch-on-return (re-fetch latest data when the table is opened or its tab/window regains focus — the `visibilitychange`/`focus` pattern already shipped on the review pages). NOT true websocket live-sync (director confirmed live infra not needed).
- **D5 (cell editing — R7/R8/R9):** **DIRECTOR OVERRODE the read-only recommendation → cells are EDITABLE in the table too.** The dynamic category cells (captured text body / image+video `embeddedText` / per-item `analysis` "Your Analysis") edit IN the table and write back to the SAME CapturedText/Image/Video records via the existing PATCH routes (`/text/[textId]`, `/images/[imageId]`, `/videos/[videoId]`). DESIGN CHALLENGE (Phase 5): "Your Analysis" is TipTap rich text — needs a clean in-cell rich-text editing approach (e.g. expand-on-click / popover editor) rather than a raw inline contenteditable in a narrow cell.
- **D6 (persistence scope — R5) — RESOLVED 2026-06-01-b:** **DIRECTOR chose to SHARE EVERYTHING across the Project** — column order + show/hide + column widths + competitor row order + font size are ALL shared (Q-E2 multi-select: director picked all three of widths/row-order/font-size on top of order+visibility). So the WHOLE main-table layout is one shared Project layout. Implemented via a NEW additive `ProjectTablePreferences` model (projectId @unique) + a new `project-table-preferences` endpoint; the per-user `UserTablePreferences` is left intact (still backs the per-user By-Category/By-Type page layouts). **Seed-on-read:** first GET with no project row copies the requesting user's existing `UserTablePreferences` into the new project row, so a pre-existing layout is preserved (no reset). **Reorder UX (picker):** director chose **drag the column headers directly** (not the Columns-box list) — each header has a small drag grip; the column-header sortable list shares the one DndContext with the row-reorder list, discriminated by id.
- **D7 (default visibility — R7/R8/R9):** Category columns SHOWN by default when their content exists; the new group checkboxes ("Content Categories" / "Image Categories" / "Video Categories") in the Columns box hide/show them.
- **D8 (locked pairs — R7/R8/R9):** Each `… Category …` column + its immediate-right `… Analysis` column move together as a locked pair under column reorder (R5).
- **D9 (cells editable, R7 text column content):** the text-category column cell mirrors+edits the captured text body; image/video category column cells mirror+edit `embeddedText`.

### Approved phase split (build phase-by-phase, deploy + real-Chrome verify each)

- **Phase 1 (quick wins) — ✅ DEPLOYED-AND-VERIFIED 2026-06-01 (build `b134b5d`):** R3 (remove the blue button) + R1 (last-column right-edge resize grip on the trailing actions th). No schema change. Director PASS (button gone; right edge draggable — full usefulness gated on Phase 2 as the director correctly noted).
- **Phase 2 (scroll model) — ✅ DEPLOYED-AND-VERIFIED 2026-06-01 (build `e0661ba` + FF1 `b27841f` + FF2 `1f18308`):** R2 + R4 per D1 (whole-page scroll both axes via browser scrollbars; header sticky to window). FF1 = shrink-wrap the table wrapper + 48px trailing gap so the page scrolls to the full table width and the last-column resize edge is grabbable. FF2 = grey panel shrink-wraps to full table width (grey bg/border extends right) + MAX_COLUMN_WIDTH 600→4000 + auto-scroll-during-resize (document-space width + RAF window scroll near the right edge) so the last column can be dragged as far right as needed with the page following. Director verbatim PASS. No schema change.
- **Phase 3 (column reorder + shared persistence) — ✅ DEPLOYED-AND-VERIFIED 2026-06-01-b (build `7a10ba4`; director PASS):** R5 per D6. `prisma db push` applied the additive `ProjectTablePreferences` table to prod (1.27s, zero data loss); schema-change-in-flight flipped YES→NO at the push. NEW `ProjectTablePreferences` model (additive; SCHEMA-CHANGE-IN-FLIGHT YES → flips NO at the deploy `prisma db push`) + new handler `project-table-preferences.ts` (seed-on-read from UserTablePreferences) + new route + new pure helper `column-order.ts` (`applyColumnOrder` + `moveColumnKey`, +11 node:test) + viewer repointed to the shared endpoint + `columnOrder` state/handler + UrlTable applies the order and adds header drag-to-reorder (`SortableHeaderCell` w/ grip, horizontal SortableContext sharing the one DndContext, id-discriminated drop). Scoreboard: src/lib 1249/1249 (+11), build 71 routes (+1 endpoint), root+ext tsc clean, ext 910/910.
- **Phase 4 (Sort By grouping):** R6 per D2.
- **Phase 5 (dynamic category columns):** R7 → R8 → R9 per D3/D4/D5/D7/D8/D9 (the large feature; locked pairs interplay with Phase 3 reorder + Phase 4 grouping). May need schema for storing the shared column order of dynamic pairs keyed by category name.

---

## §4 — Open questions

**RESOLVED 2026-06-01-b:** Q-A → D1. Q-C → D2. Q-D → D3. Q-E persistence → D6 (shared). Q-G → approved phase split. (Q-B last-column = `addedAt` confirmed implicitly; diagnose-and-fix in Phase 1.)

**STILL OPEN (do not block Phase 1/2; resolve before the named phase):**
- **Q-E2 (before Phase 3):** D6 boundary — do column WIDTHS + ROW order + fontSize also become Project-shared, or stay per-user? (Default pending: column order + visibility shared; widths + row order + fontSize per-user.)
- **Q-F (before Phase 5):** dynamic column-pair identity in the shared store — keyed by category-name string. Behavior when a new category first appears (append at default position left of `addedAt`, natural order) vs when a category is deleted (drop from saved order). Confirm default.
- **Q-H (before Phase 4):** confirm the "Sort By" box has a "None"/flat default = the current ungrouped table; and how grouping coexists with column reorder + the existing per-column click-sort + row drag-reorder.
- **Q-I (before Phase 5):** in-cell rich-text editing UX for the "Your Analysis" column (D5) — expand/popover editor vs inline.

---

## §5 — Cross-references

- **Main table:** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` + `url-table-columns.ts` + `ColumnResizeHandle.tsx` + `ColumnVisibilityBar.tsx` + parent `CompetitionScrapingViewer.tsx`.
- **Persistence:** `prisma/schema.prisma` `UserTablePreferences` + `/api/projects/[projectId]/competition-scraping/table-preferences` route.
- **Grouping precedent:** `/reviews-analysis-by-category` + `/reviews-analysis-by-type` pages (`category-table-grouping.ts` / `type-table-grouping.ts`, banner-row + two-level dnd-kit drag).
- **Captured-item models + detail page:** `CapturedText` / `CapturedImage` / `CapturedVideo` (+ `analysis`, `embeddedText`, `*Category`) in `prisma/schema.prisma`; detail render/edit in `url/[urlId]/components/UrlDetailContent.tsx` + `PerItemAnalysisBox.tsx`; PATCH routes `/text/[textId]`, `/images/[imageId]`, `/videos/[videoId]`.
- **Vocabulary (category names):** `VocabularyEntry` (per-Project, `vocabularyType` = content-/image-/video-category).
- **Related deferred item:** P-51 `/comprehensive-analysis` AI-summary (deferred by director to the session after P-54's requirements settle).
</content>
</invoke>
