// W#2 P-46 Workstream 3 Sessions 1-3 — canonical column registry for the
// Competition Data table.
//
// Session 1 (2026-05-23-d) lifted the column-id ↔ label mapping out of
// UrlTable so the new ColumnVisibilityBar + the per-user
// UserTablePreferences.columnVisibility map can reference the same source
// of truth.
//
// Session 2 (2026-05-23-e) extends the registry with the 6 new W1-additive
// data columns per §C.3 + adds a `dataType` discriminator that drives the
// per-cell inline-editor selection in UrlTable (text / number / decimal /
// boolean / enum / date / url).
//
// Session 3 (today) adds per-column `defaultWidth` (px) used as the seed
// width when no per-user entry exists in UserTablePreferences.columnWidths
// + the MIN/MAX width bounds the resize-drag handle clamps to + the
// FONT_SIZE_* bounds the font-size stepper clamps to (mirroring the
// handler's validator constants).
//
// 2026-05-24 fix-forward — the legacy single-platform ScopeFilter export
// ('all' | Platform) was removed after Issue 5 (multi-select platforms)
// shifted CompetitionScrapingViewer to a Platform[] state shape. Bookmarks
// that include the legacy `?platform=X` query are handled in the viewer's
// URL-parsing branch + serialize forward to `?platforms=X`.

// Column id strings double as the keys in UserTablePreferences.columnVisibility
// JSON — keep them stable. Renaming an id silently flips that column to
// visible in everyone's prefs (the missing-key default).
//
// The `dataType` discriminator drives the per-cell inline-editor selection
// in UrlTable (Session 2). 'url' is special-cased — it's a text field that
// renders as a blue link in read mode and is editable like any other text
// cell. 'date-readonly' is `addedAt` which is a server-stamped timestamp
// the user doesn't edit.

export type TableColumnDataType =
  | 'url'
  | 'text'
  | 'text-multiline'
  | 'number-integer'
  | 'number-decimal'
  | 'boolean'
  | 'enum'
  | 'date-readonly';

export interface TableColumnDef {
  id: string;
  label: string;
  dataType: TableColumnDataType;
  defaultWidth: number;
}

// 2026-05-24 fix-forward #3 — Director's specified left-to-right column
// order. The prior "additive append" order (the 9 pre-P-46 columns first
// then 8 new ones appended at end) was an implementation default that
// hadn't been written into the binding docs; director re-specified after
// Phase-4 verification surfaced the mismatch. Captured to CORRECTIONS_LOG
// as a Rule 18 spec-capture gap (the spec was given but never echoed into
// §C.3 or §B refinement before implementation).
export const TABLE_COLUMN_DEFS: readonly TableColumnDef[] = [
  { id: 'competitionCategory', label: 'Category', dataType: 'text', defaultWidth: 160 },
  { id: 'type', label: 'Type', dataType: 'text', defaultWidth: 140 },
  { id: 'isSponsoredAd', label: 'Sponsored', dataType: 'boolean', defaultWidth: 110 },
  { id: 'productName', label: 'Product Name', dataType: 'text', defaultWidth: 220 },
  { id: 'brandName', label: 'Brand Name', dataType: 'text', defaultWidth: 160 },
  { id: 'description1', label: 'Description 1', dataType: 'text-multiline', defaultWidth: 240 },
  { id: 'description2', label: 'Description 2', dataType: 'text-multiline', defaultWidth: 240 },
  { id: 'resultsPageRank', label: 'Results Rank', dataType: 'number-integer', defaultWidth: 120 },
  { id: 'price', label: 'Price', dataType: 'text', defaultWidth: 100 },
  { id: 'productStarRating', label: 'Product Stars', dataType: 'number-decimal', defaultWidth: 110 },
  { id: 'numProductReviews', label: '# Reviews', dataType: 'number-integer', defaultWidth: 100 },
  { id: 'sellerStarRating', label: 'Seller Stars', dataType: 'number-decimal', defaultWidth: 110 },
  { id: 'numSellerReviews', label: 'Seller Reviews', dataType: 'number-integer', defaultWidth: 120 },
  { id: 'competitionScore', label: 'Competition Score', dataType: 'number-integer', defaultWidth: 140 },
  { id: 'url', label: 'URL', dataType: 'url', defaultWidth: 280 },
  { id: 'scrapingStatus', label: 'Status', dataType: 'enum', defaultWidth: 120 },
  { id: 'addedAt', label: 'Added On', dataType: 'date-readonly', defaultWidth: 130 },
];

// Set form for fast in-table visibility lookups.
export const TABLE_COLUMN_IDS = new Set<string>(
  TABLE_COLUMN_DEFS.map((c) => c.id)
);

// P-46 Workstream 3 Session 3 — bounds for column-width drag + font-size
// stepper. The MIN/MAX width pair clamps the resize-drag handle in
// UrlTable; the FONT_SIZE_* trio mirrors the handler's validator constants
// (see src/lib/competition-scraping/handlers/user-table-preferences.ts) so
// the stepper UI can't push a value the server would reject.
export const MIN_COLUMN_WIDTH = 60;
export const MAX_COLUMN_WIDTH = 600;
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 24;
export const FONT_SIZE_DEFAULT = 14;

// Resolve the rendered width for a column: per-user override first, then
// the column's defaultWidth seed.
export function resolveColumnWidth(
  columnWidths: Record<string, number>,
  column: TableColumnDef
): number {
  const override = columnWidths[column.id];
  if (typeof override === 'number' && override > 0) {
    return override;
  }
  return column.defaultWidth;
}
