# Reviews Analysis By Competitor Type Table — full spec

**Polish-item ID:** P-49 W5 Session 5 (Sessions 4-5 of the corrective rebuild — Type page builds AFTER the Category page is shipped + verified)
**Created:** 2026-05-28
**Session that captured §1:** `session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning`
**Status:** SPEC LOCKED at §1 level (verbatim); §2/§3 in active discussion. Type page is structurally identical to Category page (`docs/polish-item-specs/P-49-W5-S4-category-page.md`) with the grouping key swapped — most of the §3 content here cross-references the Category spec.

---

## §1 — Original director instructions (VERBATIM, append-only)

**2026-05-28 — director's original verbatim instructions for the Type page (captured in same session as Category page above, after the rollback of the wrong-spec build commit `5fa1f53`):**

> REVIEWS ANALYSIS BY COMPETITOR TYPE TABLE:
>
> - When the toggle is on 'Reviews Analysis By Competitor Type Table', then the user should be taken to the 'Reviews Analysis By Competitor Type Table' page where the header is the same as the competition scraping page, however below that should be a table that has the following columns mentioned in order of leftmost going right:
>
>   -- Type, Platform, Category, Product Name, Results Rank, Competition Score, URL, Stars (which shows the star count of the review to its right), Reviews Summary, Competitor Comprehensive Reviews Analysis (bulleted), Competitor Comprehensive Reviews Analysis (non-bulleted), Type Comprehensive Reviews Analysis (bulleted), Type Comprehensive Reviews Analysis (non-bulleted).
>
>   The way the data should be posted into this table is that essentially the data from the 'Competitor Reviews Analysis Table' should be reorganized by common Type in the Type table in the following manner... The table should first list a 'Type' in a row and a competitor data that is associated with that 'Type' (data taken from the 'Competitor Reviews Analysis Table') should be added to that row. Then the next competitor's data that is associated with the same 'Type' should be added to the next row but the cell in the 'Type' column in that row should be empty to signal that the competitor is associated with that same 'Type' as the first row above it that has data in the 'Type' column. This pattern should repeat until all the competitor's associated with that specific 'Type' are listed in individual rows. Then the next 'Type' should be listed in the 'Type' column and the competitors associated with that 'Type' should be listed in individual rows in the same manner. In this way all the data from the 'Competitor Reviews Analysis Table' should be re-listed into the 'Reviews Analysis By Competitor Type Table' such that no 'Type' and no competitors are skipped.
>
>
> There should be check boxes to show/hide each of the columns in the table just the way there are checkboxes to do the same in the 'Competitor Content Table'. The user should also be able to grab and move a main 'Type' row within the table relative to other main 'Type' rows and the competitor details rows associated with the main 'Type' row should move accordingly to maintain its association in the table. Also, the user should be able to move competitor details rows associated with a 'Type' relative to each other to modify the order in which they are listed. All cells should be editable by clicking them.
>
>
> There should also be an 'Auto-create Type Comprehensive Reviews Analysis (bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Reviews Analysis By Competitor Type Table' and then the AI model should analyze the review summaries in 'Competitor Comprehensive Reviews Analysis (bulleted)' column. The way this should happen is that each chat should be assigned a single 'Type' so that it can analyze all the 'Competitor Comprehensive Reviews Analysis (bulleted)' column cells associated with it. Then the AI model should come up with a single comprehensive bulleted list that encompasses all the critical reviews while removing redundancies between the review summaries so that the new bulleted list of critical reviews contains all the critical review components without the same components mentioned more than once. This comprehensive bullet list is not just a merging of all the individual review summary bullets, it is essentially the act of removing redundant complaints while still keeping the individual unique complaints intact. Then this comprehensive bullet list should be pasted into the cell in the 'Type Comprehensive Reviews Analysis (bulleted)' column in the cell in the same row as the main 'Type' row where the 'Type' being analyzed is listed in the 'Reviews Analysis By Competitor Type Table'. The way the AI tool should be designed is that it should know which cells to analyze next without losing track and which cells to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Everything should be done server-side. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency.
>
>
> Next to the 'Auto-create Type Comprehensive Reviews Analysis (bulleted)' button, should be the 'Auto-create Type Comprehensive Reviews Analysis (non-bulleted)' button with that text. When this button is clicked, an overlay should open that should allow the user to select the AI model (Sonnet 4.6, Opus 4.7), the main prompt (which we should come up with together) and any other prompt input boxes for additional instructions the model might need (which we should discuss). The way the AI analysis should happen is that the model should be given the structure of the 'Reviews Analysis By Competitor Type Table' and then the AI model should analyze the review summaries in 'Type Comprehensive Reviews Analysis (bulleted)' column. The way this should happen is that each chat should be assigned a single 'Type' so that it can analyze the data in the cell in the 'Type Comprehensive Reviews Analysis (bulleted)' column associated with that 'Type'. Then the AI model should come up with a detailed analysis of the bullet list and presented in a paragraphs manner that paints a clear picture of the competitor's shortcomings in that 'Type' in a way that can be used to effectively critique the competitors in that 'Type' on a product comparison website. The idea is to challenge entire Types of products by targeting their common issues. Then this comprehensive analysis should be pasted into the cell in the 'Type Comprehensive Reviews Analysis (non-bulleted)' column in the same row as the main 'Type' row for which the AI model performed the comprehensive review analysis.
>
> The way the AI tool should be designed is that it should know which cell to analyze next without losing track and which cell to paste the data into without making a mistake. There should be redundancies to ensure the data is always pasted into the correct cell and that no cell is mistakenly skipped. There should be a progress bar to show where we are in the process and a running tally of the cost and the total cost of the AI run. User should also be able to pause, resume or cancel the run. Everything should be done server-side. Note that we did something very similar in Workflow #1 so you may want to check those documents to maintain consistency. Note that this bullet list should also be added to the 'Overall Analysis — Captured Reviews' box under the review in the url's details page. Since there may already be data in that box, make sure the new data is merged into that box by adding it to the very bottom so that no data that was previously in the box is overwritten.
>
> At the top, there should also be a 'Export Table' button that allows the user to export the table data of the 'Reviews Analysis By Competitor Type Table' in an excel file format.
>
> Note that during all AI runs for all the functionalities mentioned above, the tables in user's view should be updated in real-time as the AI updates the data in those tables.

---

## §2 — Joint-discussion adjustments (append-only, chronological)

**2026-05-28 (session_2026-05-28_p49-w5-session-4-scope-misread-rollback-and-corrective-planning) — Block 0 foundational architecture decisions (apply to BOTH Category + Type pages identically):**

- **Q1 — "server-side" interpretation:** Per-batch endpoint architecture; browser orchestrates the queue + pause/resume/cancel; reuses `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts`. See `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 for full discussion.
- **Q2 — model options:** Opus 4.6 + Opus 4.7 (NOT Sonnet 4.6). Same correction as Category spec.
- **Q3 — Type column data source:** Type values come from `CompetitorUrl.type` field (P-46 W1 2026-05-24). URLs with null/empty `type` bucket into `(Untyped)`.
- **Q4 — session decomposition:** Type page is Sessions 4 + 5 of the 5-session plan:
  - **Session 4** = Type page scaffold + drag + Excel together (compressed since pattern is proven by then from Category Sessions 1+3).
  - **Session 5** = Type page two AI flows (mirror Category Session 2 with `type` substituted for `category` throughout).

---

## §3 — Current consolidated spec (rolled-up source-of-truth)

**Read this section at the start of every Type-page session. This is the source-of-truth for what to build.**

### High-level statement

**The Type page is structurally identical to the Category page** (`docs/polish-item-specs/P-49-W5-S4-category-page.md` §3) with these specific substitutions:

| Category page concept | Type page equivalent |
|---|---|
| `CompetitorUrl.competitionCategory` grouping key | `CompetitorUrl.type` grouping key |
| `(Uncategorized)` fallback bucket | `(Untyped)` fallback bucket |
| Column 1 = "Category" | Column 1 = "Type" |
| Column 3 = "Type" | Column 3 = "Category" (positions of Type and Category SWAP between the two pages — confirmed in §1) |
| Column 12 = "Category Comprehensive Reviews Analysis (bulleted)" | Column 12 = "Type Comprehensive Reviews Analysis (bulleted)" |
| Column 13 = "Category Comprehensive Reviews Analysis (non-bulleted)" | Column 13 = "Type Comprehensive Reviews Analysis (non-bulleted)" |
| Button: "Auto-create Category …" | Button: "Auto-create Type …" |
| Schema persistence: `ReviewAnalysis` level=PER_CATEGORY + `typeFilter=<categoryName>` | Schema persistence: `ReviewAnalysis` level=PER_TYPE + `typeFilter=<typeName>` |
| Per-batch flow value: `per-category-bulleted-from-per-competitor-summaries` | Per-batch flow value: `per-type-bulleted-from-per-competitor-summaries` |
| (and similar for non-bulleted: `per-category-nonbulleted` vs `per-type-nonbulleted`) | |

### Column list — left-to-right (13 total)

1. **Type** — `CompetitorUrl.type` (populated on FIRST row of each Type group; empty on subsequent rows).
2. **Platform** — `CompetitorUrl.platform`.
3. **Category** — `CompetitorUrl.competitionCategory` (CATEGORY is at position 3 on the Type page; this is the SWAP of Type ↔ Category positions vs the Category page where Category is at position 1 and Type is at position 3).
4. **Product Name** — `CompetitorUrl.productName`.
5. **Results Rank** — `CompetitorUrl.resultsPageRank`.
6. **Competition Score** — `CompetitorUrl.competitionScore`.
7. **URL** — `CompetitorUrl.url`.
8. **Stars** — same semantics as Category page Column 8 (open question Q-A there applies here too).
9. **Reviews Summary** — same as Category page Column 9.
10. **Competitor Comprehensive Reviews Analysis (bulleted)** — same as Category page Column 10.
11. **Competitor Comprehensive Reviews Analysis (non-bulleted)** — same as Category page Column 11 (open question Q-C there applies).
12. **Type Comprehensive Reviews Analysis (bulleted)** — only on FIRST row of each Type group. Populated by Session 5's bulleted AI flow.
13. **Type Comprehensive Reviews Analysis (non-bulleted)** — only on FIRST row of each Type group. Populated by Session 5's non-bulleted AI flow.

### Everything else

For row grouping rule, column show/hide, click-to-edit, button placement, AI overlay UI, real-time painting, write-back to URL detail, redundancies, drag persistence — refer to `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 with `Type` substituted for `Category`. No semantic differences.

### Route + nav

- **Route:** `/projects/[projectId]/competition-scraping/reviews-analysis-by-type`.
- **Nav toggle:** the 5th option on `CompetitionScrapingSurfaceNav`: `Reviews Analysis By Competitor Type Table`.

---

## §4 — Open questions (still under discussion)

All Category-page open questions (Q-A through Q-F per `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4) apply equally here.

Additionally — Type-page-specific:

- **Q-T1:** Position of Type ↔ Category swap between the two pages — confirmed from §1 verbatim that Type is Column 1 on the Type page and Category is Column 3. This SWAP is intentional per §1. Already captured in §3 above; flagged here as a tripwire so future-me doesn't accidentally mirror the Category page's column order verbatim.
- **Q-T2:** AI prompt content for the Type-level dedup + prose flows — likely identical to the Category-level prompts (Q-E in Category spec) with `category` substituted for `type` throughout. Confirm at start of Session 5 — the prompt is grouping-key-agnostic in shape.

---

## §5 — Cross-references

- **Sibling spec:** `docs/polish-item-specs/P-49-W5-S4-category-page.md` — Category page (the canonical implementation; Type page mirrors it).
- **ROADMAP entry:** `docs/ROADMAP.md` P-49 polish-backlog entry (same parent polish item as Category page).
- **Related polish-item spec:** `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`.
- **Design doc §B entries:** same as Category spec (`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 + §B 2026-05-27-c).
- **Reverted commits:** same (`5fa1f53` build + `958ccf8` revert) — Type page was NEVER built in the reverted impl; the reverted commit only built the wrong-shape combined "By Category-Type" surface for Category-only, not Type at all.
- **Canonical code references:** same as Category spec — W#1 AutoAnalyze + per-batch endpoint + ColumnVisibilityBar + InlineCells + review-analysis-update PATCH + CompetitorUrl.overallAnalyses.
