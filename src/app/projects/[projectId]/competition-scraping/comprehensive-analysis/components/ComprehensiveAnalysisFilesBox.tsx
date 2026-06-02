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
  buildExportFilename,
  buildExportZipFilename,
  MAIN_TABLE_SHEET_NAME,
  type ExportMatrixResult,
  type MainExportUrl,
} from '@/lib/competition-scraping/comprehensive-analysis-exports';

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
    sheetName: 'Competition Reviews Analysis',
    status: 'pending',
  },
  {
    key: 'category',
    name: 'Reviews Analysis By Competitor Category',
    filenameBase: 'reviews-analysis-by-category',
    sheetName: 'Reviews Analysis By Category',
    status: 'pending',
  },
  {
    key: 'type',
    name: 'Reviews Analysis By Competitor Type',
    filenameBase: 'reviews-analysis-by-type',
    sheetName: 'Reviews Analysis By Type',
    status: 'pending',
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
  const worksheet = XLSX.utils.aoa_to_sheet(result.matrix);
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

  // Build the "Competition Content Overview" workbook ArrayBuffer from the
  // currently-loaded rows. Returns null if the data isn't loaded yet.
  const buildMainWorkbook = useCallback((): ArrayBuffer | null => {
    if (!urls) return null;
    const result = buildMainTableExportMatrix(
      FIXED_EXPORT_COLUMNS,
      urls,
      PLATFORM_LABELS
    );
    return matrixToXlsxArrayBuffer(result, MAIN_TABLE_SHEET_NAME);
  }, [urls]);

  const todayStr = (): string => new Date().toISOString().slice(0, 10);

  const handleDownloadMain = useCallback(() => {
    setActionError(null);
    setBusy('main');
    try {
      const buf = buildMainWorkbook();
      if (!buf) {
        setActionError('The competitor data is still loading — try again in a moment.');
        return;
      }
      triggerDownload(
        new Blob([buf], { type: XLSX_MIME }),
        buildExportFilename('competition-content-overview', projectNameOrId, todayStr())
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the file.');
    } finally {
      setBusy(null);
    }
  }, [buildMainWorkbook, projectNameOrId]);

  const handleDownloadAllZip = useCallback(async () => {
    setActionError(null);
    setBusy('zip');
    try {
      const date = todayStr();
      const zip = new JSZip();
      let added = 0;
      // Phase 2a: only the main table is ready; Phase 2b adds the rest here.
      const mainBuf = buildMainWorkbook();
      if (mainBuf) {
        zip.file(
          buildExportFilename('competition-content-overview', projectNameOrId, date),
          mainBuf
        );
        added++;
      }
      if (added === 0) {
        setActionError('The competitor data is still loading — try again in a moment.');
        return;
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, buildExportZipFilename(projectNameOrId, date));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not build the zip.');
    } finally {
      setBusy(null);
    }
  }, [buildMainWorkbook, projectNameOrId]);

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
                  onClick={f.key === 'main' ? handleDownloadMain : undefined}
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
