// W#2 P-49 W5 Fix Session C (2026-05-29) — pure helpers for the Reviews
// Analysis Table "Export Table" (D-7). Kept at src/lib (not src/app) so
// the node:test runner can pin the column→cell mapping + filename
// derivation without JSDOM. The page builds an xlsx workbook from
// buildReviewsExportMatrix's output and triggers the browser download;
// only the mapping + filename logic live here (and are tested).
//
// Q7 → A: export the currently-VISIBLE columns (respecting the show/hide
// checkboxes), word-wrap on the AI cells, file name
// competitor-reviews-analysis-{project-slug}-{YYYY-MM-DD}.xlsx.

import type { ReviewsTableColumnDef } from './reviews-analysis-table-columns.ts';

// One table row's exportable data, keyed by the same column ids used by
// REVIEWS_TABLE_COLUMNS. Computed cells (reviewsSummaryText) + AI cells
// (compBulleted / compNonBulleted) arrive already resolved to strings.
export interface ReviewsExportRowInput {
  platform: string;
  competitionCategory: string;
  type: string;
  productName: string;
  resultsPageRank: number | null;
  competitionScore: number | null;
  url: string;
  reviewsSummaryText: string;
  compBulleted: string;
  compNonBulleted: string;
}

// Resolve one cell's string value for a given column id. Unknown ids
// return '' rather than throwing — keeps the exporter resilient if the
// column registry grows without this map being updated (the cell is just
// blank rather than crashing the whole export).
export function reviewsExportCellValue(
  columnId: string,
  row: ReviewsExportRowInput
): string {
  switch (columnId) {
    case 'platform':
      return row.platform ?? '';
    case 'competitionCategory':
      return row.competitionCategory ?? '';
    case 'type':
      return row.type ?? '';
    case 'productName':
      return row.productName ?? '';
    case 'resultsPageRank':
      return row.resultsPageRank == null ? '' : String(row.resultsPageRank);
    case 'competitionScore':
      return row.competitionScore == null ? '' : String(row.competitionScore);
    case 'url':
      return row.url ?? '';
    case 'reviewsSummaryCount':
      return row.reviewsSummaryText ?? '';
    case 'compBulleted':
      return row.compBulleted ?? '';
    case 'compNonBulleted':
      return row.compNonBulleted ?? '';
    default:
      return '';
  }
}

// Build the export matrix (header row + one row per competitor URL) for
// the given VISIBLE columns in their current left-to-right order. The
// header uses each column's human label; data rows use
// reviewsExportCellValue. Order of `visibleColumns` is preserved exactly
// so the spreadsheet mirrors the on-screen column order.
export function buildReviewsExportMatrix(
  visibleColumns: ReadonlyArray<ReviewsTableColumnDef>,
  rows: ReadonlyArray<ReviewsExportRowInput>
): string[][] {
  const header = visibleColumns.map((c) => c.label);
  const body = rows.map((row) =>
    visibleColumns.map((c) => reviewsExportCellValue(c.id, row))
  );
  return [header, ...body];
}

// Column ids whose cells hold long AI prose/bullets and should export
// with word-wrap enabled (Q7 → A). The page applies a cell style with
// wrapText:true to these columns.
export const WRAPPED_EXPORT_COLUMN_IDS: ReadonlySet<string> = new Set([
  'reviewsSummaryCount',
  'compBulleted',
  'compNonBulleted',
]);

// Slugify a project name (or id) for use in a download filename: lower-
// case, non-alphanumerics → single hyphens, trimmed of leading/trailing
// hyphens. Empty/whitespace-only input falls back to 'project'.
export function slugifyForFilename(value: string): string {
  const slug = (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'project';
}

// competitor-reviews-analysis-{project-slug}-{YYYY-MM-DD}.xlsx (Q7 → A).
// `dateStr` is passed in (YYYY-MM-DD) so this stays pure + testable; the
// page supplies new Date().toISOString().slice(0,10).
export function buildReviewsExportFilename(
  projectNameOrId: string,
  dateStr: string
): string {
  return `competitor-reviews-analysis-${slugifyForFilename(projectNameOrId)}-${dateStr}.xlsx`;
}
