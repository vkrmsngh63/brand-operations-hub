# P-60 — The open-detail ↗ icon in the Product Name column on the three analysis tables

**Status:** ✅ **DEPLOYED-AND-VERIFIED 2026-06-02-h — P-60 CLOSED.** (Spec created 2026-06-02-h as the session's first artifact per Rule 31 — it did not exist before; captured 2026-06-02-d as ROADMAP entry P-60.) W#2 Competition Scraping; the three reviews-analysis table pages. NO schema change; NO new route (a client-side navigation anchor). ONE build commit `e08684a`; `main` went `2e9c0c5 → e08684a` (clean ff-merge of the exact verified commit); ONE Rule 9 deploy gate (director "Deploy to main"). **Director real-Chrome verdict on vklf.com: "PASS"** (the ↗ appears at the right of each Product Name cell on all three analysis pages and lands on the correct competitor detail page). Scoreboard UNCHANGED (915 ext / 1363 src/lib / 73 routes); Check 6 Playwright SKIPPED per Rule 27.

**Severity:** LOW-MEDIUM — navigation parity. The main Competitor URLs table lets a user jump from a row's Product Name straight to that competitor's detail page via a ↗ icon; the three analysis tables do not, so the user has to navigate back to the main table to open a competitor's detail page.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-02-d:** "In the table on the competition-scraping page, we have the ↗ icon at the right side of the 'Product Name' column which when clicked by the user takes them to the details page of that competitor. Add the same icon in the same column for all other tables ('competitor-reviews-analysis' page, 'reviews-analysis-by-category' page and the 'reviews-analysis-by-type' page)."

### Plain restatement (for traceability — NOT a substitute for §1)

Mirror the main table's Product-Name ↗ "open this competitor's detail page" icon onto the three analysis tables, in the same Product Name column, with the same click-to-open-detail behavior.

---

## §2 — Rule 3 code-truth audit (done before any design, 2026-06-02-h)

Via an Explore agent over the four table surfaces:

- **Main table (the pattern to mirror):** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` L692–729. The `productName` cell renders a flex container (`display:flex; align-items:center; gap:6px`) with the editable `InlineTextCell` at `flex:1` and a trailing `<button>` showing `↗`, styled via `inlineProductNameOpenButtonStyle` (transparent bg, `color:#58a6ff`, `fontSize:13px`, `borderRadius:4px`, `padding:2px 6px`, `flexShrink:0`), `data-testid="url-row-open-button"`, `title="Open detail page"`, `aria-label`. Its `onClick` does `e.stopPropagation()` then `onRowOpen(row.id)` → the parent `CompetitionScrapingViewer.tsx` (L575) `router.push(\`/projects/${projectId}/competition-scraping/url/${urlId}\`)`. **The detail route is `/projects/[projectId]/competition-scraping/url/[urlId]`, keyed by `CompetitorUrl.id`.**
- **competitor-reviews-analysis** (`competitor-reviews-analysis/page.tsx`): the `productName` case in `renderUrlRowCell` (L2411–2419) renders `InlineTextCell` ONLY — **NO ↗ open-detail icon.** Each row has `url.id` available. The cell renderer runs inside `UrlsTable`, which already receives `projectId` as a prop.
- **reviews-analysis-by-category** (`reviews-analysis-by-category/page.tsx`): the `productName` case in `renderDataCell` (L1932–1940) renders `InlineTextCell` ONLY — **NO ↗ open-detail icon on the Product Name cell.** (The page DOES have a ↗ elsewhere — a `data-testid="category-source-review-jump"` anchor at L1709–1722 — but that lives in the AI comprehensive-summary banner cell `CategorySourceReviewsCell`, jumps to a specific review (`…/url/${urlId}#review-${reviewId}`), and is NOT on the Product Name cell. So the open-detail ↗ is genuinely absent from the Product Name column.) Each row has `u.id` (`row.url.id`). `renderDataCell` does NOT currently receive `projectId`; the containing `SortableCategoryRow` does NOT currently receive it either — both must be threaded (the page component has `projectId` at L161).
- **reviews-analysis-by-type** (`reviews-analysis-by-type/page.tsx`): structurally identical to by-category — `productName` case in `renderDataCell` (L1933–1940) is `InlineTextCell` only; the source-review-jump `data-testid="type-source-review-jump"` (L1706–1719) is the banner cell, not the Product Name cell. `SortableTypeRow` + `renderDataCell` must be threaded `projectId`.
- **No shared Product-Name cell component** across the three analysis pages — each renders its own, so three independent edits.

**Drift vs ROADMAP capture:** the ROADMAP said by-category/by-type "DO have a ↗ but it is a DIFFERENT link." Clarified by the audit: that different ↗ is in the comprehensive-summary banner, NOT the Product Name cell — so all three Product Name cells lack the open-detail ↗. Scope is unchanged (add it to all three).

---

## §3 — As-built (2026-06-02-h)

Mirror the main table's ↗ onto the Product Name cell of all three analysis tables. Because these pages already navigate to the detail page with a plain `<a href={\`/projects/${projectId}/competition-scraping/url/${id}\`}>` anchor (the source-review-jump), the open-detail ↗ is rendered the same way — an `<a>` anchor (not a button + router) — for local consistency and zero new imports:

- The Product Name cell wraps its `InlineTextCell` in a `display:flex; align-items:center; gap:6px; minWidth:0` container with the editable cell at `flex:1; minWidth:0` and a trailing `<a>` ↗ at `flexShrink:0`.
- The ↗ anchor: `href={\`/projects/${projectId}/competition-scraping/url/${id}\`}`, `color:#58a6ff`, `textDecoration:none`, `fontSize:13px`, `flexShrink:0`, `title="Open detail page"`, `aria-label`, and a page-scoped `data-testid` (`reviews-analysis-open-detail` / `category-open-detail` / `type-open-detail`).
- `projectId` threaded into `renderUrlRowCell` (competitor-reviews-analysis), and into `SortableCategoryRow`/`SortableTypeRow` → `renderDataCell` (by-category/by-type).

**No schema change. No AI-model code. No new route** (client-side anchor to an existing route). Build route count UNCHANGED.

**Test coverage (Rule 27):** no extractable pure logic (the href is a template string and the local convention inlines it). No new helper/test file. Check 6 Playwright SKIPPED (table-render + navigation = director real-Chrome verification, consistent with P-57/P-58). Guard = tsc clean + unchanged route count + director live verification on vklf.com.

---

## §4 — Open design questions

None substantive. The directive is verbatim and unambiguous ("the same icon in the same column"); the mirror pattern is fully determined by the main table. Same-tab navigation (matching the main table's `router.push`) via a standard left-click anchor. No Rule 14f design picker was warranted (default-to-recommendation exception).

---

## §5 — Verification

**✅ VERIFIED PASS 2026-06-02-h.** The director opened each of the three analysis pages on vklf.com, confirmed a ↗ now sits at the right of each Product Name cell, clicked it, and landed on that competitor's detail page (`url/[urlId]`). Director verbatim verdict: **"PASS."** Recorded in `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Deploy session #41. Build `e08684a`; `main` `2e9c0c5 → e08684a`.
