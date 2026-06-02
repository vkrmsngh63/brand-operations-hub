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
//   - Excel has no "sub-rows", so the on-screen stacked sub-rows EXPAND into real
//     Excel rows (director: "sub-rows should be handled like rows"): a competitor
//     with N items in a category becomes N rows. Each category column shows its
//     own item per row (item 1, item 2, … — blank past the end of its list),
//     exactly mirroring the table's stacked sub-rows. The competitor's shared
//     (fixed) columns REPEAT on every one of its rows so each row is
//     self-contained for Excel sorting/filtering + AI row-by-row reading.
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
  subRowSpan,
  type CapturedKind,
  type DynCapturedItem,
  type DynColumnPair,
} from './dynamic-columns.ts';
import { slugifyForFilename } from './reviews-table-export.ts';
import { mergeTitleAndBody } from './reviews-analysis-table-columns.ts';
import { buildCategoryGroups } from './category-table-grouping.ts';
import { buildTypeGroups } from './type-table-grouping.ts';
import {
  buildCategorySourceReviewRows,
  type CategorySourceReviewMeta,
  type CategorySourceTheme,
  type TraceabilityCategory,
} from './reviews-traceability.ts';

// The sheet name shown on the single worksheet inside each workbook.
export const MAIN_TABLE_SHEET_NAME = 'Competition Content Overview';
export const REVIEWS_ANALYSIS_SHEET_NAME = 'Competition Reviews Analysis';
export const CATEGORY_REVIEWS_SHEET_NAME = 'Reviews Analysis By Category';
export const TYPE_REVIEWS_SHEET_NAME = 'Reviews Analysis By Type';

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
  id: string;
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

  // Pre-resolve, per URL, each dynamic VALUE column's item list (the analysis
  // half reuses it). The row span = the longest list (min 1) — exactly the
  // table's subRowSpan. Each sub-row expands to a real Excel row; fixed cells
  // repeat on every row of the competitor.
  const dynValuePairs = columns.filter(
    (c): c is Extract<ExportColumn, { kind: 'dynValue' }> => c.kind === 'dynValue'
  );
  const body: string[][] = [];
  for (const u of urls) {
    const itemsByPair = new Map<DynColumnPair, DynCapturedItem[]>();
    for (const col of dynValuePairs) {
      const bucket = u.captures?.[col.pair.kind] ?? [];
      itemsByPair.set(col.pair, itemsForCategory(bucket, col.pair.kind, col.pair.category));
    }
    const span = subRowSpan(Array.from(itemsByPair.values()));
    for (let i = 0; i < span; i++) {
      body.push(
        columns.map((col) => {
          if (col.kind === 'fixed') return fixedCellValue(col.id, u, platformLabels);
          const item = itemsByPair.get(col.pair)?.[i];
          if (!item) return '';
          return col.kind === 'dynValue'
            ? item.body ?? ''
            : tipTapDocToPlainText(item.analysis);
        })
      );
    }
  }

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

// ─── Competition Reviews Analysis (Phase 2b-i) ─────────────────────────────

// One competitor URL row for the reviews-analysis export (the per-URL fields
// shown on the /competitor-reviews-analysis table).
export interface ReviewsAnalysisUrl {
  id: string;
  platform: string;
  competitionCategory: string | null;
  type: string | null;
  productName: string | null;
  resultsPageRank: number | null;
  competitionScore: number | null;
  url: string;
}

// One captured review (the per-review sub-row data). Already in the table's
// display order when passed in.
export interface ReviewsAnalysisReview {
  id: string;
  starRating: number;
  title: string | null;
  body: string;
}

// The assembled inputs for the Competition Reviews Analysis spreadsheet. The
// page fetches /urls + /review-analysis + each URL's /reviews, then derives
// these maps (PER_REVIEW summaries by reviewId; PER_PRODUCT bulleted +
// non-bulleted competitor summaries by urlId) exactly as the
// /competitor-reviews-analysis page hydrates them.
export interface ReviewsAnalysisExportData {
  urls: ReadonlyArray<ReviewsAnalysisUrl>;
  reviewsByUrlId: Record<string, ReadonlyArray<ReviewsAnalysisReview>>;
  perReviewSummaryByReviewId: Record<string, string>;
  compBulletedByUrlId: Record<string, string>;
  compNonBulletedByUrlId: Record<string, string>;
}

const REVIEWS_ANALYSIS_HEADER: ReadonlyArray<string> = [
  'Platform',
  'Category',
  'Type',
  'Product Name',
  'Results Rank',
  'Comp. Score',
  'URL',
  'Stars',
  'Review',
  'Review Summary',
  'Comprehensive (bulleted)',
  'Comprehensive (non-bulleted)',
];
// Long-text columns: Review (8), Review Summary (9), Comprehensive bulleted (10),
// Comprehensive non-bulleted (11).
const REVIEWS_ANALYSIS_WRAPPED = [8, 9, 10, 11];

/**
 * Build the "Competition Reviews Analysis" export matrix. Reviews EXPAND into
 * real rows (director: everything, reviews as rows): a competitor with N
 * captured reviews becomes N rows, each carrying that review's Stars / Review
 * text / per-review Summary; the per-competitor fields + the comprehensive AI
 * summaries REPEAT on every one of the competitor's rows. A competitor with no
 * captured reviews still gets one row (blank review columns).
 */
export function buildReviewsAnalysisExportMatrix(
  data: ReviewsAnalysisExportData,
  platformLabels: Record<string, string>
): ExportMatrixResult {
  const body: string[][] = [];
  for (const u of data.urls) {
    const reviews = data.reviewsByUrlId[u.id] ?? [];
    const span = Math.max(reviews.length, 1);
    const base = [
      platformLabels[u.platform] ?? u.platform ?? '',
      u.competitionCategory ?? '',
      u.type ?? '',
      u.productName ?? '',
      u.resultsPageRank == null ? '' : String(u.resultsPageRank),
      u.competitionScore == null ? '' : String(u.competitionScore),
      u.url ?? '',
    ];
    const compBulleted = data.compBulletedByUrlId[u.id] ?? '';
    const compNonBulleted = data.compNonBulletedByUrlId[u.id] ?? '';
    for (let i = 0; i < span; i++) {
      const r = reviews[i];
      body.push([
        ...base,
        r ? String(r.starRating) : '',
        r ? mergeTitleAndBody(r.title, r.body) : '',
        r ? data.perReviewSummaryByReviewId[r.id] ?? '' : '',
        compBulleted,
        compNonBulleted,
      ]);
    }
  }
  return {
    matrix: [[...REVIEWS_ANALYSIS_HEADER], ...body],
    wrappedColumnIndexes: [...REVIEWS_ANALYSIS_WRAPPED],
  };
}

// ─── Reviews Analysis By Competitor Category / Type (Phase 2b-ii) ──────────
//
// The grouped spreadsheets are the Excel forms of the /reviews-analysis-by-
// category + /reviews-analysis-by-type pages. Those pages bunch competitors
// under a category/type banner, with each competitor's captured reviews stacked
// beneath it, and add per-category/per-type AI summaries + a "Source Reviews"
// cell (the individual reviews behind each bulleted complaint, across every
// competitor in the group).
//
// Excel has no banners or sub-rows, so the two-level grouping FLATTENS (the
// standing export rule, director-locked): every captured review becomes its own
// row; the competitor-level fields (the product columns + the two Competitor
// Comprehensive summaries) REPEAT on each of that competitor's review rows; and
// the group-level fields (the Category/Type Comprehensive summaries + the
// Source Reviews cell) REPEAT on EVERY row in the group. A competitor with no
// captured reviews still gets one row (blank review columns).
//
// Per the director's "reviews as rows" rule the export carries the raw Review
// text too (a "Review" column after Stars), even though the on-screen grouped
// page shows only Stars + Reviews Summary — the spreadsheet is the full picture.
//
// Ordering: the rows follow the page's DEFAULT grouped order (alphabetical
// groups, uncategorized/untyped last, input order within a group) over ALL rows
// — on-screen hide/reorder choices never narrow the export.

// One competitor URL row for the grouped exports. Carries id +
// competitionCategory + type, so the same rows feed buildCategoryGroups OR
// buildTypeGroups (same per-URL shape as the flat Reviews Analysis export).
export type GroupedReviewsAnalysisUrl = ReviewsAnalysisUrl;

// A group-level (per-category / per-type) bulleted AI summary plus its
// structured categories (the bullet→reviewId shape that resolves Source
// Reviews). Mirrors the page's CategoryBulletedEntry / TypeBulletedEntry.
export interface GroupBulletedEntry {
  summary: string;
  categories: TraceabilityCategory[];
}

// The assembled inputs for a grouped reviews spreadsheet. Shares the per-review
// + per-competitor maps with the flat Reviews Analysis export, and adds the
// group-level summaries (keyed by the normalized category/type key — the same
// key buildCategoryGroups/buildTypeGroups emit + the page looks up) and the
// reviewId→meta map the Source Reviews cell resolves against.
export interface GroupedReviewsAnalysisExportData {
  urls: ReadonlyArray<GroupedReviewsAnalysisUrl>;
  reviewsByUrlId: Record<string, ReadonlyArray<ReviewsAnalysisReview>>;
  perReviewSummaryByReviewId: Record<string, string>;
  compBulletedByUrlId: Record<string, string>;
  compNonBulletedByUrlId: Record<string, string>;
  groupBulletedByKey: Record<string, GroupBulletedEntry>;
  groupNonBulletedByKey: Record<string, string>;
  reviewMetaById: ReadonlyMap<string, CategorySourceReviewMeta>;
}

// The grouped export columns, in the page's left-to-right order, with the raw
// "Review" column spliced after "Stars" (the standing reviews-as-rows rule).
// The By-Type sheet swaps the grouping column to position 1 + the plain
// category column to position 3, and re-words the group-level labels.
type GroupedColId =
  | 'category'
  | 'type'
  | 'platform'
  | 'productName'
  | 'resultsPageRank'
  | 'competitionScore'
  | 'url'
  | 'stars'
  | 'review'
  | 'reviewsSummary'
  | 'compBulleted'
  | 'compNonBulleted'
  | 'groupBulleted'
  | 'sourceReviews'
  | 'groupNonBulleted';

const CATEGORY_COL_IDS: ReadonlyArray<GroupedColId> = [
  'category', 'platform', 'type', 'productName', 'resultsPageRank',
  'competitionScore', 'url', 'stars', 'review', 'reviewsSummary',
  'compBulleted', 'compNonBulleted', 'groupBulleted', 'sourceReviews',
  'groupNonBulleted',
];
const TYPE_COL_IDS: ReadonlyArray<GroupedColId> = [
  'type', 'platform', 'category', 'productName', 'resultsPageRank',
  'competitionScore', 'url', 'stars', 'review', 'reviewsSummary',
  'compBulleted', 'compNonBulleted', 'groupBulleted', 'sourceReviews',
  'groupNonBulleted',
];
// Long free-text columns the page wraps.
const GROUPED_WRAPPED_IDS: ReadonlySet<GroupedColId> = new Set<GroupedColId>([
  'review', 'reviewsSummary', 'compBulleted', 'compNonBulleted',
  'groupBulleted', 'sourceReviews', 'groupNonBulleted',
]);

function groupedColLabel(id: GroupedColId, grouping: 'category' | 'type'): string {
  switch (id) {
    case 'category':
      return 'Category';
    case 'type':
      return 'Type';
    case 'platform':
      return 'Platform';
    case 'productName':
      return 'Product Name';
    case 'resultsPageRank':
      return 'Results Rank';
    case 'competitionScore':
      return 'Comp. Score';
    case 'url':
      return 'URL';
    case 'stars':
      return 'Stars';
    case 'review':
      return 'Review';
    case 'reviewsSummary':
      return 'Reviews Summary';
    case 'compBulleted':
      return 'Competitor Comprehensive (bulleted)';
    case 'compNonBulleted':
      return 'Competitor Comprehensive (non-bulleted)';
    case 'groupBulleted':
      return grouping === 'category'
        ? 'Category Comprehensive (bulleted)'
        : 'Type Comprehensive (bulleted)';
    case 'sourceReviews':
      return 'Source Reviews';
    case 'groupNonBulleted':
      return grouping === 'category'
        ? 'Category Comprehensive (non-bulleted)'
        : 'Type Comprehensive (non-bulleted)';
    default:
      return '';
  }
}

interface GroupedCellCtx {
  url: GroupedReviewsAnalysisUrl;
  review: ReviewsAnalysisReview | null;
  platformLabels: Record<string, string>;
  perReviewSummary: Record<string, string>;
  compBulleted: string;
  compNonBulleted: string;
  groupBulleted: string;
  groupNonBulleted: string;
  sourceReviewsText: string;
}

function groupedCellValue(id: GroupedColId, c: GroupedCellCtx): string {
  const u = c.url;
  switch (id) {
    case 'category':
      return u.competitionCategory ?? '';
    case 'type':
      return u.type ?? '';
    case 'platform':
      return c.platformLabels[u.platform] ?? u.platform ?? '';
    case 'productName':
      return u.productName ?? '';
    case 'resultsPageRank':
      return u.resultsPageRank == null ? '' : String(u.resultsPageRank);
    case 'competitionScore':
      return u.competitionScore == null ? '' : String(u.competitionScore);
    case 'url':
      return u.url ?? '';
    case 'stars':
      return c.review ? String(c.review.starRating) : '';
    case 'review':
      return c.review ? mergeTitleAndBody(c.review.title, c.review.body) : '';
    case 'reviewsSummary':
      return c.review ? c.perReviewSummary[c.review.id] ?? '' : '';
    case 'compBulleted':
      return c.compBulleted;
    case 'compNonBulleted':
      return c.compNonBulleted;
    case 'groupBulleted':
      return c.groupBulleted;
    case 'sourceReviews':
      return c.sourceReviewsText;
    case 'groupNonBulleted':
      return c.groupNonBulleted;
    default:
      return '';
  }
}

/**
 * Flatten a group's resolved Source Reviews (theme → bulleted complaint →
 * the individual reviews behind it, across all in-group competitors) into one
 * readable, word-wrapped Excel cell. Empty when the group has no bulleted
 * category/type summary. Pure + testable.
 */
export function formatSourceReviewsCell(
  themes: ReadonlyArray<CategorySourceTheme>
): string {
  const blocks: string[] = [];
  for (const theme of themes) {
    const lines: string[] = [theme.name];
    for (const bullet of theme.bullets) {
      lines.push(`• ${bullet.text}`);
      for (const s of bullet.sources) {
        const stars = s.starRating == null ? '' : `${s.starRating}★ `;
        lines.push(`    – ${s.productName} · ${stars}${s.text}`);
      }
    }
    blocks.push(lines.join('\n'));
  }
  return blocks.join('\n\n');
}

// The shared grouped-export engine. `grouping` selects the column order + the
// group-level wording; the page-level grouping helper (buildCategoryGroups /
// buildTypeGroups) supplies the two-level order over ALL rows.
function buildGroupedReviewsAnalysisExportMatrix(
  grouping: 'category' | 'type',
  data: GroupedReviewsAnalysisExportData,
  platformLabels: Record<string, string>
): ExportMatrixResult {
  const colIds = grouping === 'category' ? CATEGORY_COL_IDS : TYPE_COL_IDS;
  const header = colIds.map((id) => groupedColLabel(id, grouping));
  const wrappedColumnIndexes: number[] = [];
  colIds.forEach((id, i) => {
    if (GROUPED_WRAPPED_IDS.has(id)) wrappedColumnIndexes.push(i);
  });

  // Order + bucket ALL rows into the page's grouped order. Both group shapes
  // expose { key, rows: [{ url }] }, so the engine reads them uniformly.
  const groups: ReadonlyArray<{
    key: string;
    rows: ReadonlyArray<{ url: GroupedReviewsAnalysisUrl }>;
  }> =
    grouping === 'category'
      ? buildCategoryGroups(data.urls)
      : buildTypeGroups(data.urls);

  const body: string[][] = [];
  for (const group of groups) {
    const groupBulleted = data.groupBulletedByKey[group.key]?.summary ?? '';
    const groupNonBulleted = data.groupNonBulletedByKey[group.key] ?? '';
    const sourceReviewsText = formatSourceReviewsCell(
      buildCategorySourceReviewRows(
        data.groupBulletedByKey[group.key]?.categories ?? [],
        data.reviewMetaById
      )
    );
    for (const { url } of group.rows) {
      const reviews = data.reviewsByUrlId[url.id] ?? [];
      const span = Math.max(reviews.length, 1);
      const compBulleted = data.compBulletedByUrlId[url.id] ?? '';
      const compNonBulleted = data.compNonBulletedByUrlId[url.id] ?? '';
      for (let i = 0; i < span; i++) {
        const ctx: GroupedCellCtx = {
          url,
          review: reviews[i] ?? null,
          platformLabels,
          perReviewSummary: data.perReviewSummaryByReviewId,
          compBulleted,
          compNonBulleted,
          groupBulleted,
          groupNonBulleted,
          sourceReviewsText,
        };
        body.push(colIds.map((id) => groupedCellValue(id, ctx)));
      }
    }
  }
  return { matrix: [header, ...body], wrappedColumnIndexes };
}

/** Build the "Reviews Analysis By Competitor Category" export matrix. */
export function buildCategoryReviewsAnalysisExportMatrix(
  data: GroupedReviewsAnalysisExportData,
  platformLabels: Record<string, string>
): ExportMatrixResult {
  return buildGroupedReviewsAnalysisExportMatrix('category', data, platformLabels);
}

/** Build the "Reviews Analysis By Competitor Type" export matrix. */
export function buildTypeReviewsAnalysisExportMatrix(
  data: GroupedReviewsAnalysisExportData,
  platformLabels: Record<string, string>
): ExportMatrixResult {
  return buildGroupedReviewsAnalysisExportMatrix('type', data, platformLabels);
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
