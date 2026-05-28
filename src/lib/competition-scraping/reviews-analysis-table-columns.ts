// W#2 P-49 W5 Fix Session A (2026-05-29) — pure helpers for the Reviews
// Analysis Table page column registry. Extracted out of the page .tsx
// file per the established "Pure helpers extracted from .tsx component
// file for node:test coverage" Pattern (CORRECTIONS_LOG §Entry
// 2026-05-29; W#2 P-49 W4 Captured Reviews UI 2026-05-29 set the
// precedent).
//
// Lives at src/lib/ (not src/app/) so it's reachable from the src/lib
// node:test runner without needing JSDOM (no `@/app/...` imports — the
// node:test runner doesn't resolve tsconfig path aliases that cross
// into src/app). The page .tsx imports the const + helpers from this
// module and renders them inside React components.
//
// 2026-05-29 Fix Session A FF — column widths converted from CSS-grid
// string syntax to numeric pixel `defaultWidth`s. The table is now an
// HTML `<table>` + `<colgroup>` (mirroring the sibling Competitor URLs
// table's Pattern) which lets us add visible cell borders + drag-to-
// resize via the shared ColumnResizeHandle component, plus eliminates
// the CSS-grid `1fr` overlap behavior that was squishing cells together
// at the post-deploy 2026-05-29 verification.

// Stable column-id strings double as keys in the per-user visibility
// map. Missing keys default to visible per the existing
// `isReviewsColumnVisible` helper. The order here = the spec's verbatim
// left-to-right order from
// `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md`
// §1 — Platform / Category / Type / Product Name / Results Rank /
// Competition Score / URL / Reviews Summary / Comprehensive bulleted /
// Comprehensive non-bulleted.
export interface ReviewsTableColumnDef {
  id: string;
  label: string;
  defaultWidth: number; // pixels
}

export const REVIEWS_TABLE_COLUMNS: ReadonlyArray<ReviewsTableColumnDef> = [
  { id: 'platform', label: 'Platform', defaultWidth: 130 },
  { id: 'competitionCategory', label: 'Category', defaultWidth: 150 },
  { id: 'type', label: 'Type', defaultWidth: 130 },
  { id: 'productName', label: 'Product Name', defaultWidth: 220 },
  { id: 'resultsPageRank', label: 'Results Rank', defaultWidth: 110 },
  { id: 'competitionScore', label: 'Comp. Score', defaultWidth: 110 },
  { id: 'url', label: 'URL', defaultWidth: 260 },
  { id: 'reviewsSummaryCount', label: 'Reviews Summary', defaultWidth: 170 },
  { id: 'compBulleted', label: 'Comprehensive (bulleted)', defaultWidth: 280 },
  { id: 'compNonBulleted', label: 'Comprehensive (non-bulleted)', defaultWidth: 280 },
];

// Width bounds for the drag-to-resize handles. Match the sibling
// Competitor URLs table's MIN/MAX so behavior feels identical across
// the two surfaces.
export const MIN_REVIEWS_COLUMN_WIDTH = 60;
export const MAX_REVIEWS_COLUMN_WIDTH = 600;

// Fixed widths for the auxiliary columns (NOT user-resizable — they
// hold structural UI, not data). Expand toggle on the left; Actions
// (per-URL inline AI-flow buttons) on the right.
export const EXPAND_TOGGLE_WIDTH = 36;
export const ACTIONS_COL_WIDTH = 280;

// Missing keys default to visible (matches sibling `isColumnVisible`
// semantics on ColumnVisibilityBar.tsx). Duplicated here so this module
// stays self-contained for the node:test runner without pulling in the
// 'use client' page component.
export function isReviewsColumnVisible(
  map: Record<string, boolean>,
  columnId: string
): boolean {
  if (columnId in map) return map[columnId];
  return true;
}

// Resolve the rendered width for a column: per-user override first,
// then the column's defaultWidth seed. Mirrors `resolveColumnWidth`
// on `url-table-columns.ts` (different column registry — same shape).
export function resolveReviewsColumnWidth(
  columnWidths: Record<string, number>,
  column: ReviewsTableColumnDef
): number {
  const override = columnWidths[column.id];
  if (typeof override === 'number' && override > 0) {
    return override;
  }
  return column.defaultWidth;
}

// FF2 2026-05-29 — the auxiliary Actions column (per-URL inline AI-flow
// buttons; NOT in the 10 spec columns) is also drag-to-resize. Its
// width is stored under a distinct key so it doesn't collide with any
// of the 10 column ids. Director directive: "the right edge of the
// table is not draggable either, which it should be" — the Actions
// column owns the right edge.
export const ACTIONS_COL_KEY = '__actions__';

export function resolveActionsColumnWidth(
  columnWidths: Record<string, number>
): number {
  const override = columnWidths[ACTIONS_COL_KEY];
  if (typeof override === 'number' && override > 0) {
    return override;
  }
  return ACTIONS_COL_WIDTH;
}

// Compute the "N of M summarized" display string for a given URL row's
// Reviews Summary count cell (spec §3 Column 8; Q10 → A — plain text).
//
//   - totalReviews === null  → reviews haven't been loaded yet for
//     this URL (the row hasn't been expanded; reviews lazy-load on
//     expand). Surface a passive hint instead of "0 of 0 summarized"
//     since 0/0 would be misleading.
//   - totalReviews === 0     → URL has no captured reviews yet. The
//     summarized count is irrelevant.
//   - totalReviews > 0       → render plain text "N of M summarized".
//
// Returns one of three discriminator-keyed shapes so the React
// renderer can apply different styles (italic gray for not-loaded /
// no-reviews, plain dark text for the populated case).
export type ReviewsSummaryCountDisplay =
  | { kind: 'not-loaded' }
  | { kind: 'no-reviews' }
  | { kind: 'populated'; text: string };

export function computeReviewsSummaryCount(
  summarizedReviews: number | null,
  totalReviews: number | null
): ReviewsSummaryCountDisplay {
  if (totalReviews === null) return { kind: 'not-loaded' };
  if (totalReviews === 0) return { kind: 'no-reviews' };
  return {
    kind: 'populated',
    text: `${summarizedReviews ?? 0} of ${totalReviews} summarized`,
  };
}
