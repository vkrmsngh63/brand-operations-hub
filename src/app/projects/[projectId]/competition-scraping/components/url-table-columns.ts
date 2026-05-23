import type { Platform } from '@/lib/shared-types/competition-scraping';

// W#2 P-46 Workstream 3 Session 1 — canonical column registry for the
// Competition Data table. Lifts the column-id ↔ label mapping out of
// UrlTable so the new ColumnVisibilityBar + the per-user
// UserTablePreferences.columnVisibility map can reference the same source
// of truth. Also houses the ScopeFilter type after PlatformSidebar's
// deletion.

// Platform scope selector. 'all' = no platform filter; otherwise a single
// platform value. Moved here from PlatformSidebar when the sidebar was
// removed in P-46 Workstream 3 Session 1.
export type ScopeFilter = 'all' | Platform;
//
// Workstream 3 Sessions 2-3 will extend this registry with width defaults
// + per-cell editor renderers; for now it's just id + label so the show/
// hide bar has something to render.
//
// Column id strings double as the keys in UserTablePreferences.columnVisibility
// JSON — keep them stable. Renaming an id silently flips that column to
// visible in everyone's prefs (the missing-key default).

export interface TableColumnDef {
  id: string;
  label: string;
}

export const TABLE_COLUMN_DEFS: readonly TableColumnDef[] = [
  { id: 'url', label: 'URL' },
  { id: 'scrapingStatus', label: 'Status' },
  { id: 'isSponsoredAd', label: 'Sponsored' },
  { id: 'productName', label: 'Product Name' },
  { id: 'brandName', label: 'Brand Name' },
  { id: 'competitionCategory', label: 'Category' },
  { id: 'productStarRating', label: 'Product Stars' },
  { id: 'numProductReviews', label: '# Reviews' },
  { id: 'addedAt', label: 'Added On' },
];

// Set form for fast in-table visibility lookups.
export const TABLE_COLUMN_IDS = new Set<string>(
  TABLE_COLUMN_DEFS.map((c) => c.id)
);
