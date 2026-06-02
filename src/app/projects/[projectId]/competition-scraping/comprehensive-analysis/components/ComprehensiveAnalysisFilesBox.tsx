'use client';

// W#2 P-55 Phase 2 (2026-06-02) — the "Comprehensive Competitive Analysis Files"
// box above the editor on /comprehensive-analysis. Holds the downloadable
// spreadsheets for the four competition tables; each is downloadable on its own
// or all together as a zip. The primer .docx (Phase 3) joins this box later.
//
// Phase 2a ships the self-contained "Competition Content Overview" spreadsheet
// (the main Competitor URLs table — URLs + captures only). The three reviews-
// analysis spreadsheets are listed but marked "Added in the next update" until
// Phase 2b wires their data assembly.
//
// Each spreadsheet is built fresh from live data at download time: the box
// fetches the table's rows, the pure helpers in
// src/lib/competition-scraping/comprehensive-analysis-exports.ts turn them into
// a matrix, and XLSX/JSZip turn that into the file(s) the browser downloads.

import { useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { authFetch } from '@/lib/authFetch';
import {
  PLATFORM_LABELS,
  TABLE_COLUMN_DEFS,
} from '../../components/url-table-columns';
import {
  buildMainTableExportMatrix,
  buildReviewsAnalysisExportMatrix,
  buildCategoryReviewsAnalysisExportMatrix,
  buildTypeReviewsAnalysisExportMatrix,
  buildExportFilename,
  buildExportZipFilename,
  clampToExcelCellLimit,
  MAIN_TABLE_SHEET_NAME,
  REVIEWS_ANALYSIS_SHEET_NAME,
  CATEGORY_REVIEWS_SHEET_NAME,
  TYPE_REVIEWS_SHEET_NAME,
  type ExportMatrixResult,
  type MainExportUrl,
  type ReviewsAnalysisExportData,
  type ReviewsAnalysisReview,
  type ReviewsAnalysisUrl,
  type GroupedReviewsAnalysisExportData,
  type GroupBulletedEntry,
} from '@/lib/competition-scraping/comprehensive-analysis-exports';
import {
  validateCategoriesInput,
  type CategorySourceReviewMeta,
} from '@/lib/competition-scraping/reviews-traceability';

interface Props {
  projectId: string;
  // The project's display name (or id) used in the download filenames.
  projectNameOrId: string;
}

// The four files in the box. `status: 'ready'` ships in Phase 2a; the reviews-
// analysis trio flips to ready in Phase 2b.
type FileStatus = 'ready' | 'pending';
interface FileDescriptor {
  key: string;
  name: string;
  filenameBase: string;
  sheetName: string;
  status: FileStatus;
}
const FILES: ReadonlyArray<FileDescriptor> = [
  {
    key: 'main',
    name: 'Competition Content Overview',
    filenameBase: 'competition-content-overview',
    sheetName: MAIN_TABLE_SHEET_NAME,
    status: 'ready',
  },
  {
    key: 'reviews',
    name: 'Competition Reviews Analysis',
    filenameBase: 'competition-reviews-analysis',
    sheetName: REVIEWS_ANALYSIS_SHEET_NAME,
    status: 'ready',
  },
  {
    key: 'category',
    name: 'Reviews Analysis By Competitor Category',
    filenameBase: 'reviews-analysis-by-category',
    sheetName: CATEGORY_REVIEWS_SHEET_NAME,
    status: 'ready',
  },
  {
    key: 'type',
    name: 'Reviews Analysis By Competitor Type',
    filenameBase: 'reviews-analysis-by-type',
    sheetName: TYPE_REVIEWS_SHEET_NAME,
    status: 'ready',
  },
];

const FIXED_EXPORT_COLUMNS = TABLE_COLUMN_DEFS.map((c) => ({
  id: c.id,
  label: c.label,
}));

// Turn an export matrix into an .xlsx ArrayBuffer, applying wrapText (+ top
// align) to the long-text columns and giving wrapped columns a wider column so
// the file opens readable. Mirrors the competitor-reviews-analysis export.
function matrixToXlsxArrayBuffer(
  result: ExportMatrixResult,
  sheetName: string
): ArrayBuffer {
  // Clamp every cell to Excel's 32,767-char per-cell limit before writing
  // (the Source Reviews / AI-summary cells can exceed it) — xlsx throws
  // otherwise.
  const safeMatrix = result.matrix.map((row) =>
    row.map((cell) => clampToExcelCellLimit(cell))
  );
  const worksheet = XLSX.utils.aoa_to_sheet(safeMatrix);
  const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');
  const wrapped = new Set(result.wrappedColumnIndexes);
  for (let c = range.s.c; c <= range.e.c; c++) {
    if (!wrapped.has(c)) continue;
    for (let r = range.s.r; r <= range.e.r; r++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[addr];
      if (cell) cell.s = { alignment: { wrapText: true, vertical: 'top' } };
    }
  }
  // Column widths: wrapped (long-text) columns wider; the rest a sane default.
  const colCount = range.e.c - range.s.c + 1;
  worksheet['!cols'] = Array.from({ length: colCount }, (_, c) => ({
    wch: wrapped.has(c) ? 48 : 20,
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

// Reviews display order (mirrors the reviews-analysis table): the page-specific
// drag rank first, then the shared rank, then server/insertion order.
function reviewRank(r: {
  sortRank: number | null;
  sortRankInReviewsTable: number | null;
}): number {
  return r.sortRankInReviewsTable ?? r.sortRank ?? Number.MAX_SAFE_INTEGER;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has fired.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function buildMainArrayBuffer(rows: ReadonlyArray<MainExportUrl>): ArrayBuffer {
  const result = buildMainTableExportMatrix(FIXED_EXPORT_COLUMNS, rows, PLATFORM_LABELS);
  return matrixToXlsxArrayBuffer(result, MAIN_TABLE_SHEET_NAME);
}

function buildReviewsArrayBuffer(data: ReviewsAnalysisExportData): ArrayBuffer {
  const result = buildReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  return matrixToXlsxArrayBuffer(result, REVIEWS_ANALYSIS_SHEET_NAME);
}

function buildCategoryArrayBuffer(data: GroupedReviewsAnalysisExportData): ArrayBuffer {
  const result = buildCategoryReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  return matrixToXlsxArrayBuffer(result, CATEGORY_REVIEWS_SHEET_NAME);
}

function buildTypeArrayBuffer(data: GroupedReviewsAnalysisExportData): ArrayBuffer {
  const result = buildTypeReviewsAnalysisExportMatrix(data, PLATFORM_LABELS);
  return matrixToXlsxArrayBuffer(result, TYPE_REVIEWS_SHEET_NAME);
}

export function ComprehensiveAnalysisFilesBox({ projectId, projectNameOrId }: Props) {
  const [urls, setUrls] = useState<MainExportUrl[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // file key or 'zip'
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch the main table's rows (with captures) once on mount. The reviews-
  // analysis files (Phase 2b) will add their own fetches.
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
        );
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(`Couldn’t load the competitor data (HTTP ${res.status}).`);
          return;
        }
        const body = (await res.json()) as MainExportUrl[];
        setUrls(Array.isArray(body) ? body : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Network error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const todayStr = (): string => new Date().toISOString().slice(0, 10);

  // Always pull the LATEST competitor URLs (with captures) at download time, so
  // a download is current even if the tables changed while this page stayed
  // open (director: "always current on every download").
  const fetchUrlsFresh = useCallback(async (): Promise<MainExportUrl[]> => {
    const res = await authFetch(
      `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
    );
    if (!res.ok) {
      throw new Error(`Couldn’t load the competitor data (HTTP ${res.status}).`);
    }
    const body = (await res.json()) as MainExportUrl[];
    return Array.isArray(body) ? body : [];
  }, [projectId]);

  // Assemble ALL THREE reviews spreadsheets from ONE set of fresh reads: the
  // stored review analyses (PER_REVIEW summaries + PER_PRODUCT bulleted/non-
  // bulleted + the per-category/per-type summaries, derived exactly as the
  // /competitor-reviews-analysis + by-category + by-type pages hydrate) and each
  // URL's captured reviews (ordered like the tables). One bundle keeps the zip
  // to a single review-analysis read; each individual download re-fetches it so
  // every file is current at click time. Takes the freshly-fetched URL list so
  // the /urls read is shared too.
  const fetchReviewsBundle = useCallback(
    async (
      rows: ReadonlyArray<MainExportUrl>
    ): Promise<{
      reviews: ReviewsAnalysisExportData;
      category: GroupedReviewsAnalysisExportData;
      type: GroupedReviewsAnalysisExportData;
    }> => {
      const perReviewSummaryByReviewId: Record<string, string> = {};
      const compBulletedByUrlId: Record<string, string> = {};
      const compNonBulletedByUrlId: Record<string, string> = {};
      // Group-level summaries, keyed by the normalized category/type key (the
      // analysis row's typeFilter — the same key the grouping helpers emit).
      const categoryBulletedByKey: Record<string, GroupBulletedEntry> = {};
      const categoryNonBulletedByKey: Record<string, string> = {};
      const typeBulletedByKey: Record<string, GroupBulletedEntry> = {};
      const typeNonBulletedByKey: Record<string, string> = {};
      const aRes = await authFetch(
        `/api/projects/${projectId}/competition-scraping/review-analysis`
      );
      if (!aRes.ok) {
        throw new Error(`Couldn’t load the review analyses (HTTP ${aRes.status}).`);
      }
      const aBody = (await aRes.json()) as {
        items?: Array<{
          id: string;
          level: string;
          urlId: string | null;
          typeFilter: string | null;
          analysisJson: unknown;
        }>;
      };
      for (const item of aBody.items ?? []) {
        const aj =
          item.analysisJson && typeof item.analysisJson === 'object'
            ? (item.analysisJson as Record<string, unknown>)
            : {};
        const summary = typeof aj.summary === 'string' ? aj.summary : '';
        if (!summary) continue;
        if (item.level === 'PER_REVIEW') {
          const reviewId = typeof aj.reviewId === 'string' ? aj.reviewId : null;
          if (reviewId) perReviewSummaryByReviewId[reviewId] = summary;
        } else if (item.level === 'PER_PRODUCT' && item.urlId) {
          if (aj.flow === 'per-competitor-nonbulleted') {
            compNonBulletedByUrlId[item.urlId] = summary;
          } else {
            compBulletedByUrlId[item.urlId] = summary;
          }
        } else if (item.level === 'PER_CATEGORY' && item.typeFilter != null) {
          if (aj.flow === 'per-category-nonbulleted') {
            categoryNonBulletedByKey[item.typeFilter] = summary;
          } else {
            categoryBulletedByKey[item.typeFilter] = {
              summary,
              categories: validateCategoriesInput(aj.categories) ?? [],
            };
          }
        } else if (item.level === 'PER_TYPE' && item.typeFilter != null) {
          if (aj.flow === 'per-type-nonbulleted') {
            typeNonBulletedByKey[item.typeFilter] = summary;
          } else {
            typeBulletedByKey[item.typeFilter] = {
              summary,
              categories: validateCategoriesInput(aj.categories) ?? [],
            };
          }
        }
      }

      const reviewsByUrlId: Record<string, ReviewsAnalysisReview[]> = {};
      // reviewId → meta for the Source Reviews cell (cross-competitor: a group
      // bullet's cited reviews can come from any competitor in the group).
      const reviewMetaById = new Map<string, CategorySourceReviewMeta>();
      const productNameByUrlId = new Map<string, string>();
      for (const u of rows) {
        productNameByUrlId.set(u.id, u.productName?.trim() || u.url);
      }
      await Promise.all(
        rows.map(async (u) => {
          try {
            const rRes = await authFetch(
              `/api/projects/${projectId}/competition-scraping/urls/${u.id}/reviews`
            );
            if (!rRes.ok) {
              reviewsByUrlId[u.id] = [];
              return;
            }
            const list = (await rRes.json()) as Array<{
              id: string;
              starRating: number;
              title: string | null;
              body: string;
              sortRank: number | null;
              sortRankInReviewsTable: number | null;
            }>;
            const ordered = (Array.isArray(list) ? list : [])
              .map((r, idx) => ({ r, idx }))
              .sort((a, b) => reviewRank(a.r) - reviewRank(b.r) || a.idx - b.idx)
              .map(({ r }) => ({
                id: r.id,
                starRating: r.starRating,
                title: r.title,
                body: r.body,
              }));
            reviewsByUrlId[u.id] = ordered;
            const productName = productNameByUrlId.get(u.id) ?? '(unknown product)';
            for (const r of ordered) {
              reviewMetaById.set(r.id, {
                starRating: r.starRating,
                title: r.title,
                body: r.body,
                productName,
                urlId: u.id,
              });
            }
          } catch {
            reviewsByUrlId[u.id] = [];
          }
        })
      );

      const urls: ReviewsAnalysisUrl[] = rows.map((u) => ({
        id: u.id,
        platform: u.platform,
        competitionCategory: u.competitionCategory,
        type: u.type,
        productName: u.productName,
        resultsPageRank: u.resultsPageRank,
        competitionScore: u.competitionScore,
        url: u.url,
      }));

      const reviews: ReviewsAnalysisExportData = {
        urls,
        reviewsByUrlId,
        perReviewSummaryByReviewId,
        compBulletedByUrlId,
        compNonBulletedByUrlId,
      };
      const category: GroupedReviewsAnalysisExportData = {
        urls,
        reviewsByUrlId,
        perReviewSummaryByReviewId,
        compBulletedByUrlId,
        compNonBulletedByUrlId,
        groupBulletedByKey: categoryBulletedByKey,
        groupNonBulletedByKey: categoryNonBulletedByKey,
        reviewMetaById,
      };
      const type: GroupedReviewsAnalysisExportData = {
        urls,
        reviewsByUrlId,
        perReviewSummaryByReviewId,
        compBulletedByUrlId,
        compNonBulletedByUrlId,
        groupBulletedByKey: typeBulletedByKey,
        groupNonBulletedByKey: typeNonBulletedByKey,
        reviewMetaById,
      };
      return { reviews, category, type };
    },
    [projectId]
  );

  const handleDownloadMain = useCallback(async () => {
    setActionError(null);
    setBusy('main');
    try {
      const rows = await fetchUrlsFresh();
      triggerDownload(
        new Blob([buildMainArrayBuffer(rows)], { type: XLSX_MIME }),
        buildExportFilename('competition-content-overview', projectNameOrId, todayStr())
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the file.');
    } finally {
      setBusy(null);
    }
  }, [fetchUrlsFresh, projectNameOrId]);

  const handleDownloadReviews = useCallback(async () => {
    setActionError(null);
    setBusy('reviews');
    try {
      const rows = await fetchUrlsFresh();
      const { reviews } = await fetchReviewsBundle(rows);
      triggerDownload(
        new Blob([buildReviewsArrayBuffer(reviews)], { type: XLSX_MIME }),
        buildExportFilename('competition-reviews-analysis', projectNameOrId, todayStr())
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the file.');
    } finally {
      setBusy(null);
    }
  }, [fetchUrlsFresh, fetchReviewsBundle, projectNameOrId]);

  const handleDownloadCategory = useCallback(async () => {
    setActionError(null);
    setBusy('category');
    try {
      const rows = await fetchUrlsFresh();
      const { category } = await fetchReviewsBundle(rows);
      triggerDownload(
        new Blob([buildCategoryArrayBuffer(category)], { type: XLSX_MIME }),
        buildExportFilename('reviews-analysis-by-category', projectNameOrId, todayStr())
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the file.');
    } finally {
      setBusy(null);
    }
  }, [fetchUrlsFresh, fetchReviewsBundle, projectNameOrId]);

  const handleDownloadType = useCallback(async () => {
    setActionError(null);
    setBusy('type');
    try {
      const rows = await fetchUrlsFresh();
      const { type } = await fetchReviewsBundle(rows);
      triggerDownload(
        new Blob([buildTypeArrayBuffer(type)], { type: XLSX_MIME }),
        buildExportFilename('reviews-analysis-by-type', projectNameOrId, todayStr())
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the file.');
    } finally {
      setBusy(null);
    }
  }, [fetchUrlsFresh, fetchReviewsBundle, projectNameOrId]);

  const handleDownloadAllZip = useCallback(async () => {
    setActionError(null);
    setBusy('zip');
    try {
      const date = todayStr();
      const rows = await fetchUrlsFresh();
      const zip = new JSZip();
      const failures: string[] = [];
      // Competition Content Overview (Phase 2a).
      zip.file(
        buildExportFilename('competition-content-overview', projectNameOrId, date),
        buildMainArrayBuffer(rows)
      );
      // The three reviews spreadsheets share ONE bundle read. Best-effort: a
      // reviews failure still lets the rest of the zip download.
      try {
        const { reviews, category, type } = await fetchReviewsBundle(rows);
        zip.file(
          buildExportFilename('competition-reviews-analysis', projectNameOrId, date),
          buildReviewsArrayBuffer(reviews)
        );
        zip.file(
          buildExportFilename('reviews-analysis-by-category', projectNameOrId, date),
          buildCategoryArrayBuffer(category)
        );
        zip.file(
          buildExportFilename('reviews-analysis-by-type', projectNameOrId, date),
          buildTypeArrayBuffer(type)
        );
      } catch (err) {
        failures.push(
          `the reviews-analysis spreadsheets (${err instanceof Error ? err.message : 'error'})`
        );
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, buildExportZipFilename(projectNameOrId, date));
      if (failures.length > 0) {
        setActionError(`Some files couldn’t be added: ${failures.join('; ')}.`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the zip.');
    } finally {
      setBusy(null);
    }
  }, [fetchUrlsFresh, fetchReviewsBundle, projectNameOrId]);

  const dataReady = urls !== null && !loadError;

  return (
    <div style={boxStyle} data-testid="comprehensive-analysis-files-box">
      <div style={headerRowStyle}>
        <span style={titleStyle}>Comprehensive Competitive Analysis Files</span>
        <button
          type="button"
          onClick={handleDownloadAllZip}
          disabled={!dataReady || busy !== null}
          style={zipButtonStyle(!dataReady || busy !== null)}
          data-testid="download-all-zip"
          title="Download all available files together as a .zip"
        >
          {busy === 'zip' ? 'Preparing…' : '↓ Download all (.zip)'}
        </button>
      </div>

      <p style={blurbStyle}>
        Spreadsheets of your competition tables, built fresh from your live data.
        Download them to feed into an AI for a comprehensive competitive-landscape
        analysis. The teaching “primer” document joins this box in the next update.
      </p>

      {loadError ? (
        <div style={errorStyle}>{loadError}</div>
      ) : null}
      {actionError ? <div style={errorStyle}>{actionError}</div> : null}

      <div style={listStyle}>
        {FILES.map((f) => {
          const isReady = f.status === 'ready';
          const isBusy = busy === f.key;
          return (
            <div key={f.key} style={rowStyle} data-testid={`file-row-${f.key}`}>
              <span style={fileIconStyle} aria-hidden>
                📊
              </span>
              <span style={fileNameStyle}>{f.name}</span>
              {isReady ? (
                <button
                  type="button"
                  onClick={
                    f.key === 'main'
                      ? handleDownloadMain
                      : f.key === 'reviews'
                        ? handleDownloadReviews
                        : f.key === 'category'
                          ? handleDownloadCategory
                          : f.key === 'type'
                            ? handleDownloadType
                            : undefined
                  }
                  disabled={!dataReady || busy !== null}
                  style={fileButtonStyle(!dataReady || busy !== null)}
                  data-testid={`download-${f.key}`}
                >
                  {isBusy ? 'Preparing…' : '↓ Excel (.xlsx)'}
                </button>
              ) : (
                <span style={pendingTagStyle} title="Coming in the next update">
                  Added in the next update
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const boxStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '20px',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '6px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#e6edf3',
};

const blurbStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b949e',
  marginTop: 0,
  marginBottom: '14px',
  lineHeight: 1.5,
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 10px',
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: '6px',
};

const fileIconStyle: React.CSSProperties = { fontSize: '15px' };

const fileNameStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: '13px',
  color: '#c9d1d9',
};

function fileButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '5px 12px',
    background: disabled ? '#21262d' : '#238636',
    color: disabled ? '#6e7681' : '#fff',
    border: '1px solid #30363d',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  };
}

function zipButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    background: disabled ? '#21262d' : '#1f6feb',
    color: disabled ? '#6e7681' : '#fff',
    border: '1px solid #30363d',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  };
}

const pendingTagStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#8b949e',
  fontStyle: 'italic',
  whiteSpace: 'nowrap',
};

const errorStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: '#1a0d0d',
  border: '1px solid #f85149',
  borderRadius: '6px',
  color: '#f85149',
  fontSize: '12px',
  marginBottom: '10px',
};
