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

**2026-05-30 (`session_2026-05-30_p49-w5-category-page-session-1-scaffold-and-polish`) — Type page MUST inherit everything shipped + decided on the Category page (director directive 2026-05-30: "make these adjustments and the adjustments requested in the previous round to the Type page when we work on it next"). When the Type page is built (Sessions 4-5), it must be born with ALL of the following — substitute `type` / `(Untyped)` for `category` / `(Uncategorized)` throughout. Full detail in `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (2026-05-30 entry).**

- **Block-1 column decisions (mirror Category):** per-review STACKED Stars + Reviews Summary (Q-A/Q-B), each review's star beside its summary, read-only; reuse the shipped `per-competitor-nonbulleted` prose for Column 11 (Q-C); mirror the sibling `xlsx` export helper for the Export Table button (Q-D).
- **5 look-and-feel items:** (1) Platforms filter box; (2) full-length drag-to-resize column borders incl. the right edge (per-column MAX 1000px); (3) floating horizontal scrollbar pinned to the viewport bottom; (4) AI content boxes fill the full cell height; (5) visible borders between the Stars/Reviews Summary sub-rows.
- **3 follow-up fixes:** (1) explicit table width = Σ visible column widths so the table can be dragged past the screen edge; (2) per-review row alignment via real sub-rows (`<tr>`) with `rowSpan` on the non-per-review columns; (3) column widths persist server-side with a load-before-save gate; (4) `scrollbar-gutter: stable` + trailing scroll space so the vertical scrollbar never overlays the right edge.
- **Interactive batch (the bigger features):** drag whole types + drag competitors within a type; the **header-row layout** (type name on its own row, all competitors beneath it); **hide-with-restore** of a competitor and of an entire type, **scoped to this Type table only** (never deleting data elsewhere); backed by the same per-user, per-Project "memory" area (additive schema).

**2026-05-30-b (`session_2026-05-30-b_p49-w5-category-page-interactive-batch`) — the Category page's interactive batch has now SHIPPED, so ALL the inheritable Category behaviors are concrete and verified. The Type page (Sessions 4-5) must mirror them. The as-shipped Category patterns to copy (substitute `type` / `(Untyped)` for `category` / `(Uncategorized)` throughout):**

- **Scaffold + polish + 3 fixes (Category Session 1, 2026-05-30)** — ✅ SHIPPED; mirror per the 2026-05-30 entry above.
- **Banner-row layout (Category interactive batch, 2026-05-30-b)** — ✅ SHIPPED. Each type gets its OWN shaded banner row (drag-grip + type name + hide-type ✕ on the left; the two type-level AI cells at the right), all competitor rows beneath it so the first competitor is draggable. The banner type name is a READ-ONLY label (the editable-name refinement is deferred on the Category page too).
- **Two-level @dnd-kit drag in ONE DndContext (Category interactive batch, 2026-05-30-b)** — ✅ SHIPPED. Mirror the pattern: an outer SortableContext keyed by prefixed `type:<key>` sortable ids (mirror Category's `cat:<key>`) + per-type nested SortableContexts of competitor url ids; one `onDragEnd` disambiguates by the `type:` prefix + guards competitor drags to same-type targets; each per-competitor multi-`<tr>` sub-row block travels via one shared transform; `(Untyped)` pinned last, not draggable. **Note the FF1 lesson:** the container is `overflowX:hidden` + floating-scrollbar, so pass `measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}` + an explicit vertical `autoScroll` on the DndContext FROM THE START so off-screen drops work (CORRECTIONS_LOG §Entry 2026-05-30-b Obs. 2).
- **Hide-with-restore (Category interactive batch, 2026-05-30-b)** — ✅ SHIPPED. Mirror: hide a competitor or a whole type from THIS page only, with a "Hidden on this page" restore panel; never deletes data elsewhere.
- **Per-page layout "memory" area (Category interactive batch, 2026-05-30-b)** — ✅ SHIPPED as ONE additive nullable `UserTablePreferences.categoryTableLayout` Json column. **The Type page gets its OWN parallel column `typeTableLayout Json?`** `{ typeOrder, rowOrderByUrlId, hiddenUrlIds, hiddenTypeKeys }`, threaded through the shared-types wire shape + the existing `/table-preferences` GET/PUT handler — REUSE the existing endpoint, NO new route (mirror `category-table-layout.ts` → a `type-table-layout.ts` helper). Schema-change-in-flight = YES at the Type page build session's entry (the additive `typeTableLayout` column) → flips NO at that deploy push.
- **Two AI flows (Category Session 2 — PENDING as of 2026-05-30-b)** — to be shipped on the Category page in Session 2; the Type page mirrors them in Session 5 (substitute `type`). The Q-E prompt content is drafted with the director at the Category Session 2 start; the Type page reuses the validated shape.

**2026-05-30-c (`session_2026-05-30-c`) — the Category page's two AI flows are now BUILT (committed `d1659d7` + `fb772ad`, undeployed) and the NEW "Source Reviews" column has been DESIGNED + APPROVED on the Category page. NEW DIRECTOR DIRECTIVE for the Type page: the SAME "Source Reviews" feature must be built for the Type page (for Type, not Category) when Sessions 4-5 build it.**

- **NEW inheritable feature — the "Source Reviews" column (DIRECTOR DIRECTIVE 2026-05-30-c):** on the Category page, each "Category Comprehensive (bulleted)" bullet shows, in a NEW adjacent "Source Reviews" column, every individual review (across all competitors in that category) that traced up to that bullet — product name + star rating + review text + a jump-to-detail link icon. The Category-page design decisions (locked 2026-05-30-c, both Recommended): layout = bullet-by-bullet always visible (mirroring the detail-page traceability table) + scope = category bullets only. **The Type page MUST mirror this** — the same Source Reviews column for the "Type Comprehensive (bulleted)" flow, bullet-by-bullet always visible, scope = type bullets only, substitute `type` for `category` throughout. The backend pattern to mirror: the per-type bulleted flow should UNION the cited per-competitor bullets' reviewIds onto each type bullet (mirror `category-analysis-aggregation.ts` → a `type-analysis-aggregation.ts` helper).
- **Two AI flows pattern now concrete (Category Session 2, 2026-05-30-c):** `per-category-bulleted` + `per-category-nonbulleted` added to `review-analysis-run-batch.ts` SHIPPED_FLOWS + dispatch; NEW prompts `PER_CATEGORY_BULLETED/NONBULLETED v1`; NEW `CategoryAiRunModal.tsx` (one parameterized modal for both flows). The Type page mirrors these in Session 5 as `per-type-bulleted` + `per-type-nonbulleted` + `PER_TYPE_BULLETED/NONBULLETED` prompts + a `TypeAiRunModal.tsx` (or reuse `CategoryAiRunModal.tsx` parameterized by level). NO schema change expected (PER_TYPE storage / `typeFilter` reuse, like PER_CATEGORY).
- **Write-back nuance to carry forward:** the category non-bulleted prose appends to each in-category competitor's "Overall Analysis — Captured Reviews" box (relabeled "Your notes — Captured Reviews" by Fix Session D); the director will confirm that placement at the Category Session 2 FINISH Phase 4 — apply the confirmed placement to the Type page's non-bulleted write-back.

**2026-05-30-d (`session_2026-05-30-d`) — the Category page Session 2 FINISHED + the "Source Reviews" column SHIPPED + 4 director Phase-4 adjustments SHIPPED + verified. THE TYPE PAGE (Sessions 4-5) MUST INHERIT ALL FOUR 2026-05-30-d ADJUSTMENTS IN ADDITION TO the Source Reviews feature itself + all the other Category behaviors. (This is the destination for the in-session Task #10 — "mirror the 4 category adjustments onto the Type page" — substitute `type` / `(Untyped)` for `category` / `(Uncategorized)` throughout.)**

- **The Source Reviews column = now SHIPPED on the Category page (mirror it).** As-built on Category: NEW read-only `catSourceReviews` 14th column (inserted after the "…(bulleted)" column); NEW client-safe pure helper `buildCategorySourceReviewRows(categories, reviewsById)` in `reviews-traceability.ts` resolves each bullet's cross-competitor union of reviewIds → product + stars + merged title/body + urlId; the page builds a global reviewId→meta map from the eager-loaded reviews + each URL's product name; the URL-detail page got a per-review anchor `id={`review-${row.id}`}` + scrollMarginTop + a scroll-on-hash effect so the jump link `/…/url/<urlId>#review-<id>` lands on the exact review. **Type page mirror:** a `typeSourceReviews` column + a `buildTypeSourceReviewRows` helper (or generalize the existing one), same data chain off the per-type bulleted flow's reviewId-union.
- **The 4 adjustments the Type page MUST inherit (director directive 2026-05-30-d):**
  - **(#1) Top-align the Type-grouping label** on the banner (the Category page top-aligns the category name; the Type page top-aligns the type name).
  - **(#2) The per-type NON-bulleted prose must NOT write back into each in-type competitor's "Your notes — Captured Reviews" box.** On the Category page the append-merge loop in `review-analysis-run-batch.ts` was DELETED — the category-level prose lives ONLY in the non-bulleted COLUMN. The Type page must be born WITHOUT that per-type write-back loop. (Note: the non-bulleted COLUMN keeps its paragraph prose; only the duplication into competitor notes boxes is removed; the Source Reviews column is reviews-only; the per-COMPETITOR non-bulleted write-back is a different flow, unaffected.) **This SUPERSEDES the 2026-05-30-c "write-back nuance to carry forward" note above — the confirmed placement is: NO per-type prose write-back into competitor boxes.**
  - **(#3) Auto-fading HoverTooltips on the AI buttons** — reuse the shared `components/HoverTooltip.tsx` shipped this session (portal+fade tooltip with `autoHideMs` so the tooltip fades after a few seconds even while hovered). Wire it onto the two "Auto-create Type …" buttons.
  - **(#4) Source Reviews = per-bullet sub-row layout** extending across the "(bulleted)" + "Source Reviews" columns. The Type banner must be a multi-`<tr>` block: grip / type-name label / non-bulleted prose rowSpan the whole type; each bulleted complaint + its source reviews render on their own `<tr>` so they align row-for-row (the "Per-row alignment across two adjacent table columns via a multi-`<tr>` banner block with rowSpan'd flanking cells" Pattern — CORRECTIONS_LOG §Entry 2026-05-30-d; REVIEWS_PHASE_2_DESIGN §B 2026-05-30-d).
- **Category page status = essentially CLOSED.** With Session 2 FINISH + the Source Reviews column + the 4 adjustments all shipped + verified, only the optional editable-banner-name refinement remains on the Category page; the Type page (Sessions 4-5) is the remaining P-49 W5 work. Schema-change-in-flight likely YES at the Type page build entry (the additive `typeTableLayout` column).

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

- **Master spec doc (NEW 2026-05-28-b):** `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — the verbatim FULL re-paste covering all 3 Reviews Phase 2 pages + cross-cutting joint-discussion decisions. This Type page spec inherits its §1 verbatim from the master.
- **Sibling specs:**
  - `docs/polish-item-specs/P-49-W5-S4-category-page.md` — Category page (the canonical implementation; Type page mirrors it).
  - `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Reviews Analysis Table page (the upstream Per-Competitor Comprehensive cells feed Column 10 of this Type page).
- **ROADMAP entry:** `docs/ROADMAP.md` P-49 polish-backlog entry (same parent polish item as Category page).
- **Related polish-item spec:** `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`.
- **Design doc §B entries:** same as Category spec (`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 + §B 2026-05-27-c).
- **Reverted commits:** same (`5fa1f53` build + `958ccf8` revert) — Type page was NEVER built in the reverted impl; the reverted commit only built the wrong-shape combined "By Category-Type" surface for Category-only, not Type at all.
- **Canonical code references:** same as Category spec — W#1 AutoAnalyze + per-batch endpoint + ColumnVisibilityBar + InlineCells + review-analysis-update PATCH + CompetitorUrl.overallAnalyses.
