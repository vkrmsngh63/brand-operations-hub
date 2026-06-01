// W#2 P-49 W5 Type page Sessions 4-5 (2026-05-31) — pure helpers for the
// "Reviews Analysis By Competitor Type Table" column registry. Mirror of the
// sibling `category-table-columns.ts` with the Type ↔ Category column SWAP
// from `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3:
//   Type / Platform / Category / Product Name / Results Rank /
//   Competition Score / URL / Stars / Reviews Summary /
//   Competitor Comprehensive (bulleted) / Competitor Comprehensive
//   (non-bulleted) / Type Comprehensive (bulleted) / Type Comprehensive
//   (non-bulleted)
// — PLUS the 14th "Source Reviews" column (inherited from the Category page
// 2026-05-30-d), inserted directly after Type Comprehensive (bulleted): each
// bulleted type complaint's source reviews across all in-type competitors.
//
// NOTE the SWAP vs the Category page (§3 Q-T1 tripwire): on the Type page the
// grouping column "Type" is at position 1 and "Category" is a plain display
// column at position 3 — the reverse of the Category page. Do NOT mirror the
// Category column order verbatim.
//
// Lives at src/lib/ (not src/app/) so the src/lib node:test runner can import
// it without JSDOM or tsconfig path-alias resolution. Per-user column
// visibility is persisted via the EXISTING `UserTablePreferences` model under
// the `typeTable:` key prefix (distinct from the sibling pages' `categoryTable:`
// + `reviewsTable:` prefixes so the three surfaces keep independent state).

export interface TypeTableColumnDef {
  id: string;
  label: string;
  defaultWidth: number; // pixels
  /** Spec §3: which columns are click-to-edit. Columns 8 (Stars) + 9
   *  (Reviews Summary) are read-only (they reflect captured data + AI
   *  output). All others are editable. */
  editable: boolean;
  /** Columns 12 + 13 (type-level AI cells) + the Source Reviews column render
   *  content ONLY on the first row of each type group ("main type row");
   *  blank on subsequent rows in the group. */
  typeLevel?: boolean;
}

export const TYPE_TABLE_COLUMNS: ReadonlyArray<TypeTableColumnDef> = [
  { id: 'type', label: 'Type', defaultWidth: 150, editable: true },
  { id: 'platform', label: 'Platform', defaultWidth: 130, editable: true },
  { id: 'competitionCategory', label: 'Category', defaultWidth: 130, editable: true },
  { id: 'productName', label: 'Product Name', defaultWidth: 220, editable: true },
  { id: 'resultsPageRank', label: 'Results Rank', defaultWidth: 110, editable: true },
  { id: 'competitionScore', label: 'Comp. Score', defaultWidth: 110, editable: true },
  { id: 'url', label: 'URL', defaultWidth: 260, editable: true },
  { id: 'stars', label: 'Stars', defaultWidth: 90, editable: false },
  { id: 'reviewsSummary', label: 'Reviews Summary', defaultWidth: 280, editable: false },
  { id: 'compBulleted', label: 'Competitor Comprehensive (bulleted)', defaultWidth: 280, editable: true },
  { id: 'compNonBulleted', label: 'Competitor Comprehensive (non-bulleted)', defaultWidth: 280, editable: true },
  { id: 'typeBulleted', label: 'Type Comprehensive (bulleted)', defaultWidth: 280, editable: true, typeLevel: true },
  // Source Reviews (inherited from the Category page 2026-05-30-d) — for each
  // bulleted type complaint, the individual reviews across all in-type
  // competitors that traced up to it (product · stars · text · jump link).
  // Read-only (resolved evidence, not editable text) + type-level (renders on
  // the banner row only, alongside typeBulleted).
  { id: 'typeSourceReviews', label: 'Source Reviews', defaultWidth: 340, editable: false, typeLevel: true },
  { id: 'typeNonBulleted', label: 'Type Comprehensive (non-bulleted)', defaultWidth: 280, editable: true, typeLevel: true },
];

// Width bounds for the drag-to-resize handles. MAX is generous (1000px) so
// the wide AI-summary columns can be dragged out far enough to push the table
// well past the screen edge (mirrors the Category page directive 2026-05-30).
export const MIN_TYPE_COLUMN_WIDTH = 60;
export const MAX_TYPE_COLUMN_WIDTH = 1000;

// Per-user persistence key prefix on the shared UserTablePreferences record.
// Distinct from the sibling pages' `categoryTable:` + `reviewsTable:` prefixes.
export const TYPE_TABLE_PREF_PREFIX = 'typeTable:';

// Missing keys default to visible (matches the sibling `isCategoryColumnVisible`
// + `isReviewsColumnVisible` semantics).
export function isTypeColumnVisible(
  map: Record<string, boolean>,
  columnId: string
): boolean {
  if (columnId in map) return map[columnId];
  return true;
}

// Resolve the rendered width: per-user override first, then the column's
// defaultWidth seed. Mirrors `resolveCategoryColumnWidth`.
export function resolveTypeColumnWidth(
  columnWidths: Record<string, number>,
  column: TypeTableColumnDef
): number {
  const override = columnWidths[column.id];
  if (typeof override === 'number' && override > 0) {
    return override;
  }
  return column.defaultWidth;
}

// Look up a column def by id (used by the renderer's cell dispatcher).
export function getTypeColumnDef(
  columnId: string
): TypeTableColumnDef | undefined {
  return TYPE_TABLE_COLUMNS.find((c) => c.id === columnId);
}
