// W#2 P-49 W5 Category page Session 1 scaffold (2026-05-30) — pure helpers
// for the "Reviews Analysis By Competitor Category Table" column registry.
// Mirrors the sibling `reviews-analysis-table-columns.ts` registry (same
// shape + same MIN/MAX/resolve helpers) but carries all 13 spec columns in
// the verbatim left-to-right order from
// `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3:
//   Category / Platform / Type / Product Name / Results Rank /
//   Competition Score / URL / Stars / Reviews Summary /
//   Competitor Comprehensive (bulleted) / Competitor Comprehensive
//   (non-bulleted) / Category Comprehensive (bulleted) / Category
//   Comprehensive (non-bulleted).
//
// Lives at src/lib/ (not src/app/) so the src/lib node:test runner can
// import it without JSDOM or tsconfig path-alias resolution. The page .tsx
// imports the const + helpers and renders them inside React components.
//
// Per-user column visibility is persisted via the EXISTING
// `UserTablePreferences` model under the `categoryTable:` key prefix
// (distinct from the sibling page's `reviewsTable:` prefix so the two
// surfaces keep independent show/hide state on the same shared
// preferences record).

export interface CategoryTableColumnDef {
  id: string;
  label: string;
  defaultWidth: number; // pixels
  /** Spec §3: which columns are click-to-edit. Columns 8 (Stars) + 9
   *  (Reviews Summary) are read-only (they reflect captured data + AI
   *  output). All others are editable. */
  editable: boolean;
  /** Columns 12 + 13 (category-level AI cells) render content ONLY on the
   *  first row of each category group ("main category row"); blank on
   *  subsequent rows in the group. */
  categoryLevel?: boolean;
}

export const CATEGORY_TABLE_COLUMNS: ReadonlyArray<CategoryTableColumnDef> = [
  { id: 'competitionCategory', label: 'Category', defaultWidth: 150, editable: true },
  { id: 'platform', label: 'Platform', defaultWidth: 130, editable: true },
  { id: 'type', label: 'Type', defaultWidth: 130, editable: true },
  { id: 'productName', label: 'Product Name', defaultWidth: 220, editable: true },
  { id: 'resultsPageRank', label: 'Results Rank', defaultWidth: 110, editable: true },
  { id: 'competitionScore', label: 'Comp. Score', defaultWidth: 110, editable: true },
  { id: 'url', label: 'URL', defaultWidth: 260, editable: true },
  { id: 'stars', label: 'Stars', defaultWidth: 90, editable: false },
  { id: 'reviewsSummary', label: 'Reviews Summary', defaultWidth: 280, editable: false },
  { id: 'compBulleted', label: 'Competitor Comprehensive (bulleted)', defaultWidth: 280, editable: true },
  { id: 'compNonBulleted', label: 'Competitor Comprehensive (non-bulleted)', defaultWidth: 280, editable: true },
  { id: 'catBulleted', label: 'Category Comprehensive (bulleted)', defaultWidth: 280, editable: true, categoryLevel: true },
  { id: 'catNonBulleted', label: 'Category Comprehensive (non-bulleted)', defaultWidth: 280, editable: true, categoryLevel: true },
];

// Width bounds for the drag-to-resize handles. MAX is generous (1000px) so
// the wide AI-summary columns can be dragged out far enough to push the
// table well past the screen edge (director directive 2026-05-30 — the
// right edge must be extendable beyond the viewport, surfacing the floating
// horizontal scrollbar).
export const MIN_CATEGORY_COLUMN_WIDTH = 60;
export const MAX_CATEGORY_COLUMN_WIDTH = 1000;

// Per-user persistence key prefix on the shared UserTablePreferences
// record. Distinct from the sibling page's `reviewsTable:` prefix.
export const CATEGORY_TABLE_PREF_PREFIX = 'categoryTable:';

// Missing keys default to visible (matches sibling `isReviewsColumnVisible`
// + `isColumnVisible` semantics).
export function isCategoryColumnVisible(
  map: Record<string, boolean>,
  columnId: string
): boolean {
  if (columnId in map) return map[columnId];
  return true;
}

// Resolve the rendered width: per-user override first, then the column's
// defaultWidth seed. Mirrors `resolveReviewsColumnWidth`.
export function resolveCategoryColumnWidth(
  columnWidths: Record<string, number>,
  column: CategoryTableColumnDef
): number {
  const override = columnWidths[column.id];
  if (typeof override === 'number' && override > 0) {
    return override;
  }
  return column.defaultWidth;
}

// Look up a column def by id (used by the renderer's cell dispatcher).
export function getCategoryColumnDef(
  columnId: string
): CategoryTableColumnDef | undefined {
  return CATEGORY_TABLE_COLUMNS.find((c) => c.id === columnId);
}
