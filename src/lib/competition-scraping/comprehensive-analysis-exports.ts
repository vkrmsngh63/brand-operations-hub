// W#2 P-55 Phase 2 (2026-06-01) — pure helpers that build the downloadable
// spreadsheet matrices for the "Comprehensive Competitive Analysis Files" box on
// the /comprehensive-analysis page. Kept at src/lib (not src/app) so node:test
// can pin the column→cell mapping without JSDOM/xlsx; the page turns each
// matrix into an xlsx workbook (XLSX.utils.aoa_to_sheet) + triggers the
// download / zips them (JSZip).
//
// Design (director-locked this session):
//   - EVERYTHING in the table: all columns + all rows, regardless of the user's
//     on-screen hide/reorder choices (the export is the full picture for an AI).
//   - ONE row per competitor; a category with several captured items combines
//     them into a single, clearly-numbered cell (kept index-aligned between the
//     captured-text column and its Analysis column).
//   - Regenerated fresh from live data on each download (the page fetches, then
//     calls these builders).
//
// Phase 2a ships the "Competition Content Overview" matrix (the main
// Competitor URLs table — self-contained: URLs + captures only, no reviews).
// The three reviews-analysis spreadsheets land in Phase 2b.

import { tipTapDocToPlainText } from '../rich-text/tiptap-helpers.ts';
import {
  CAPTURED_KINDS,
  buildDynamicColumnPairs,
  collectCategories,
  itemsForCategory,
  type CapturedKind,
  type DynCapturedItem,
  type DynColumnPair,
} from './dynamic-columns.ts';
import { slugifyForFilename } from './reviews-table-export.ts';

// The sheet name shown on the single worksheet inside each workbook.
export const MAIN_TABLE_SHEET_NAME = 'Competition Content Overview';

// One fixed (registry) column passed in from the page's TABLE_COLUMN_DEFS so the
// export header + order track the single column registry (no duplicate list to
// drift). The per-id value extraction lives here.
export interface ExportFixedColumn {
  id: string;
  label: string;
}

// The minimal per-URL shape the main-table export reads. A structural subset of
// the wire CompetitorUrl (so the page can pass its rows straight through).
export interface MainExportUrl {
  platform: string;
  competitionCategory: string | null;
  type: string | null;
  productName: string | null;
  brandName: string | null;
  description1: string | null;
  description2: string | null;
  price: string | null;
  resultsPageRank: number | null;
  productStarRating: number | null;
  numProductReviews: number | null;
  sellerStarRating: number | null;
  numSellerReviews: number | null;
  competitionScore: number | null;
  isSponsoredAd: boolean;
  url: string;
  scrapingStatus: string;
  overallCompetitorAnalysis: Record<string, unknown>;
  addedAt: string;
  captures?: {
    text: DynCapturedItem[];
    image: DynCapturedItem[];
    video: DynCapturedItem[];
  };
}

export interface ExportMatrixResult {
  // Header row + one row per competitor (all string cells).
  matrix: string[][];
  // Column indexes whose cells hold long prose/bullets — the page applies
  // wrapText:true (+ top vertical align) to these so the spreadsheet stays
  // readable.
  wrappedColumnIndexes: number[];
}

// Fixed columns whose cells hold long free-text and should export word-wrapped.
const WRAPPED_FIXED_IDS: ReadonlySet<string> = new Set([
  'description1',
  'description2',
  'overallCompetitorAnalysis',
]);

// Combine several captured items' cell strings into one cell. A single item is
// returned bare; multiple items are numbered "(1) …" / "(2) …" and blank-line
// separated, kept index-aligned with the paired Analysis column so item N's
// text always lines up with item N's analysis.
function combineItemCells(values: ReadonlyArray<string>): string {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  return values.map((v, i) => `(${i + 1}) ${v}`).join('\n\n');
}

// Resolve one FIXED column's cell string for a URL row. Unknown ids return ''
// (graceful, mirrors reviewsExportCellValue) so the registry can grow without
// breaking the export.
function fixedCellValue(
  id: string,
  url: MainExportUrl,
  platformLabels: Record<string, string>
): string {
  switch (id) {
    case 'platform':
      return platformLabels[url.platform] ?? url.platform ?? '';
    case 'competitionCategory':
      return url.competitionCategory ?? '';
    case 'type':
      return url.type ?? '';
    case 'isSponsoredAd':
      return url.isSponsoredAd ? 'Yes' : 'No';
    case 'productName':
      return url.productName ?? '';
    case 'brandName':
      return url.brandName ?? '';
    case 'description1':
      return url.description1 ?? '';
    case 'description2':
      return url.description2 ?? '';
    case 'resultsPageRank':
      return url.resultsPageRank == null ? '' : String(url.resultsPageRank);
    case 'price':
      return url.price ?? '';
    case 'productStarRating':
      return url.productStarRating == null ? '' : String(url.productStarRating);
    case 'numProductReviews':
      return url.numProductReviews == null ? '' : String(url.numProductReviews);
    case 'sellerStarRating':
      return url.sellerStarRating == null ? '' : String(url.sellerStarRating);
    case 'numSellerReviews':
      return url.numSellerReviews == null ? '' : String(url.numSellerReviews);
    case 'competitionScore':
      return url.competitionScore == null ? '' : String(url.competitionScore);
    case 'url':
      return url.url ?? '';
    case 'scrapingStatus':
      return url.scrapingStatus ?? '';
    case 'overallCompetitorAnalysis':
      return tipTapDocToPlainText(url.overallCompetitorAnalysis);
    case 'addedAt':
      // Stable, locale-independent date (YYYY-MM-DD) so the helper is testable.
      return typeof url.addedAt === 'string' ? url.addedAt.slice(0, 10) : '';
    default:
      return '';
  }
}

// An export column is either a fixed registry column or one half of a dynamic
// category pair (the captured/embedded text, or its Analysis).
type ExportColumn =
  | { kind: 'fixed'; id: string; label: string }
  | { kind: 'dynValue'; pair: DynColumnPair }
  | { kind: 'dynAnalysis'; pair: DynColumnPair };

// Build the ordered export column list: the fixed columns, with the dynamic
// category pairs spliced in just before 'overallCompetitorAnalysis' (mirroring
// the table's default placement: …, [category pairs], Overall Competitor
// Analysis, Added On). Falls back to before 'addedAt', else appended.
function buildExportColumns(
  fixedColumns: ReadonlyArray<ExportFixedColumn>,
  pairs: ReadonlyArray<DynColumnPair>
): ExportColumn[] {
  const dynCols: ExportColumn[] = pairs.flatMap((pair) => [
    { kind: 'dynValue' as const, pair },
    { kind: 'dynAnalysis' as const, pair },
  ]);
  const fixedCols: ExportColumn[] = fixedColumns.map((c) => ({
    kind: 'fixed' as const,
    id: c.id,
    label: c.label,
  }));
  if (dynCols.length === 0) return fixedCols;
  let anchor = fixedColumns.findIndex((c) => c.id === 'overallCompetitorAnalysis');
  if (anchor < 0) anchor = fixedColumns.findIndex((c) => c.id === 'addedAt');
  if (anchor < 0) return [...fixedCols, ...dynCols];
  return [...fixedCols.slice(0, anchor), ...dynCols, ...fixedCols.slice(anchor)];
}

/**
 * Build the "Competition Content Overview" export matrix from the live
 * Competitor URLs (with captures). `fixedColumns` is the page's
 * TABLE_COLUMN_DEFS (id+label); `platformLabels` is the page's PLATFORM_LABELS.
 */
export function buildMainTableExportMatrix(
  fixedColumns: ReadonlyArray<ExportFixedColumn>,
  urls: ReadonlyArray<MainExportUrl>,
  platformLabels: Record<string, string>
): ExportMatrixResult {
  // Distinct categories present per kind, across all rows (mirrors the table's
  // dynamic-column derivation).
  const catsByKind: Record<CapturedKind, string[]> = { text: [], image: [], video: [] };
  for (const kind of CAPTURED_KINDS) {
    const items: DynCapturedItem[] = [];
    for (const u of urls) {
      const bucket = u.captures?.[kind];
      if (bucket) items.push(...bucket);
    }
    catsByKind[kind] = collectCategories(items);
  }
  const pairs = buildDynamicColumnPairs(catsByKind);
  const columns = buildExportColumns(fixedColumns, pairs);

  const header = columns.map((col) => {
    if (col.kind === 'fixed') return col.label;
    return col.kind === 'dynValue' ? col.pair.valueLabel : col.pair.analysisLabel;
  });

  const body = urls.map((u) =>
    columns.map((col) => {
      if (col.kind === 'fixed') return fixedCellValue(col.id, u, platformLabels);
      const bucket = u.captures?.[col.pair.kind] ?? [];
      const items = itemsForCategory(bucket, col.pair.kind, col.pair.category);
      if (col.kind === 'dynValue') {
        return combineItemCells(items.map((it) => it.body ?? ''));
      }
      return combineItemCells(items.map((it) => tipTapDocToPlainText(it.analysis)));
    })
  );

  const wrappedColumnIndexes: number[] = [];
  columns.forEach((col, i) => {
    if (col.kind === 'fixed') {
      if (WRAPPED_FIXED_IDS.has(col.id)) wrappedColumnIndexes.push(i);
    } else {
      // Both halves of every dynamic pair hold long text.
      wrappedColumnIndexes.push(i);
    }
  });

  return { matrix: [header, ...body], wrappedColumnIndexes };
}

// Spreadsheet filename: {base}-{project-slug}-{YYYY-MM-DD}.xlsx. `dateStr` is
// passed in (YYYY-MM-DD) so this stays pure + testable.
export function buildExportFilename(
  base: string,
  projectNameOrId: string,
  dateStr: string
): string {
  return `${base}-${slugifyForFilename(projectNameOrId)}-${dateStr}.xlsx`;
}

// The zip filename bundling all available spreadsheets.
export function buildExportZipFilename(
  projectNameOrId: string,
  dateStr: string
): string {
  return `comprehensive-competitive-analysis-files-${slugifyForFilename(
    projectNameOrId
  )}-${dateStr}.zip`;
}
