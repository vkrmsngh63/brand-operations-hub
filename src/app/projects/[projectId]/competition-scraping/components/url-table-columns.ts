import type { Platform } from '@/lib/shared-types/competition-scraping';

// W#2 P-46 Workstream 3 Session 1-2 — canonical column registry for the
// Competition Data table.
//
// Session 1 (2026-05-23-d) lifted the column-id ↔ label mapping out of
// UrlTable so the new ColumnVisibilityBar + the per-user
// UserTablePreferences.columnVisibility map can reference the same source
// of truth, AND houses the ScopeFilter type after PlatformSidebar's
// deletion.
//
// Session 2 (2026-05-23-e) extends the registry with the 6 new W1-additive
// data columns per §C.3 + adds a `dataType` discriminator that drives the
// per-cell inline-editor selection in UrlTable (text / number / decimal /
// boolean / enum / date / url). Sessions 3+ will add per-column width
// defaults + drag-to-reorder anchors.

// Platform scope selector. 'all' = no platform filter; otherwise a single
// platform value. Moved here from PlatformSidebar when the sidebar was
// removed in P-46 Workstream 3 Session 1.
export type ScopeFilter = 'all' | Platform;

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
}

export const TABLE_COLUMN_DEFS: readonly TableColumnDef[] = [
  // Existing columns from Session 1's registry (carried forward).
  { id: 'url', label: 'URL', dataType: 'url' },
  { id: 'scrapingStatus', label: 'Status', dataType: 'enum' },
  { id: 'isSponsoredAd', label: 'Sponsored', dataType: 'boolean' },
  { id: 'productName', label: 'Product Name', dataType: 'text' },
  { id: 'brandName', label: 'Brand Name', dataType: 'text' },
  { id: 'competitionCategory', label: 'Category', dataType: 'text' },
  { id: 'productStarRating', label: 'Product Stars', dataType: 'number-decimal' },
  { id: 'numProductReviews', label: '# Reviews', dataType: 'number-integer' },
  { id: 'addedAt', label: 'Added On', dataType: 'date-readonly' },
  // P-46 Workstream 3 Session 2 — new data columns per §C.3 + §A.11.
  // Foundation-workstream additive columns (already in CompetitorUrl since W1
  // shipped the schema on 2026-05-24); this session adds them to the table
  // surface + makes them click-to-edit.
  { id: 'type', label: 'Type', dataType: 'text' },
  { id: 'description1', label: 'Description 1', dataType: 'text-multiline' },
  { id: 'description2', label: 'Description 2', dataType: 'text-multiline' },
  { id: 'price', label: 'Price', dataType: 'text' },
  { id: 'competitionScore', label: 'Competition Score', dataType: 'number-integer' },
  // Pre-existing schema columns that were never rendered in the table; now
  // surfaced as part of the Workstream 3 redesign.
  { id: 'resultsPageRank', label: 'Results Rank', dataType: 'number-integer' },
  { id: 'sellerStarRating', label: 'Seller Stars', dataType: 'number-decimal' },
  { id: 'numSellerReviews', label: 'Seller Reviews', dataType: 'number-integer' },
];

// Set form for fast in-table visibility lookups.
export const TABLE_COLUMN_IDS = new Set<string>(
  TABLE_COLUMN_DEFS.map((c) => c.id)
);
