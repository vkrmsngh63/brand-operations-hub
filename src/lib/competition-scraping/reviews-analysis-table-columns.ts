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

// Stable column-id strings double as keys in the per-user visibility
// map. Missing keys default to visible per the existing
// `isColumnVisible` helper on ColumnVisibilityBar.tsx — renaming an id
// silently flips that column to visible in everyone's prefs (the
// missing-key default). The order here = the spec's verbatim
// left-to-right order from
// `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md`
// §1 — Platform / Category / Type / Product Name / Results Rank /
// Competition Score / URL / Reviews Summary / Comprehensive bulleted /
// Comprehensive non-bulleted.
export interface ReviewsTableColumnDef {
  id: string;
  label: string;
  width: string;
}

export const REVIEWS_TABLE_COLUMNS: ReadonlyArray<ReviewsTableColumnDef> = [
  { id: 'platform', label: 'Platform', width: '120px' },
  { id: 'competitionCategory', label: 'Category', width: '140px' },
  { id: 'type', label: 'Type', width: '120px' },
  { id: 'productName', label: 'Product Name', width: 'minmax(160px, 1fr)' },
  { id: 'resultsPageRank', label: 'Results Rank', width: '100px' },
  { id: 'competitionScore', label: 'Comp. Score', width: '100px' },
  { id: 'url', label: 'URL', width: 'minmax(180px, 1fr)' },
  { id: 'reviewsSummaryCount', label: 'Reviews Summary', width: '160px' },
  { id: 'compBulleted', label: 'Comprehensive (bulleted)', width: '260px' },
  { id: 'compNonBulleted', label: 'Comprehensive (non-bulleted)', width: '260px' },
];

export const EXPAND_TOGGLE_WIDTH = '36px';
export const ACTIONS_COL_WIDTH = '110px';

// Missing keys default to visible (matches `isColumnVisible` semantics
// on ColumnVisibilityBar.tsx). Duplicated here so this module stays
// self-contained for the node:test runner without pulling in the
// 'use client' page component.
export function isReviewsColumnVisible(
  map: Record<string, boolean>,
  columnId: string
): boolean {
  if (columnId in map) return map[columnId];
  return true;
}

// Compute the CSS grid `gridTemplateColumns` value given the current
// column-visibility map. Hidden columns are dropped from the template
// entirely so the table doesn't carry empty placeholder widths. The
// fixed expand-toggle column lives at the start; the fixed Actions
// column (auxiliary UI; not in the spec's 10-column set, holds the
// per-URL inline AI-flow buttons) lives at the end.
export function buildUrlRowGrid(visibility: Record<string, boolean>): string {
  const parts: string[] = [EXPAND_TOGGLE_WIDTH];
  for (const col of REVIEWS_TABLE_COLUMNS) {
    if (isReviewsColumnVisible(visibility, col.id)) parts.push(col.width);
  }
  parts.push(ACTIONS_COL_WIDTH);
  return parts.join(' ');
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
