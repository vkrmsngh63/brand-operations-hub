'use client';

// URL table for the W#2 multi-table viewer (first slice). Renders the rows
// the parent already filtered by selected platform + free-text search;
// owns its own sort state because sort is a table-local UI concern.
//
// Columns (per the read-it-back the director approved at session start):
//   URL · Product Name · Brand Name · Category · Product Stars
//   · # Reviews · Added On
//
// Click a column header to sort asc/desc; click a row to navigate to
// that URL's per-URL detail page (in-app). The detail page itself
// preserves an explicit "Open original URL ↗" button so the prior
// open-in-new-tab behavior is one click away. Per-column filter
// dropdowns are deferred to slice (a.4).

import { useMemo, useState } from 'react';
import type { CompetitorUrl } from '@/lib/shared-types/competition-scraping';

type SortKey =
  | 'url'
  | 'productName'
  | 'brandName'
  | 'competitionCategory'
  | 'productStarRating'
  | 'numProductReviews'
  | 'addedAt';

interface Props {
  rows: CompetitorUrl[];
  searchText: string;
  onSearchChange: (next: string) => void;
  scopedTotal: number;
  // Click-row handler. The parent owns router + projectId knowledge so
  // this component stays decoupled from Next.js routing concerns.
  onRowOpen: (urlId: string) => void;
}

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  // Numeric/date columns default to descending on first click — the
  // common scan dimension is "highest rating," "most reviews," "newest."
  defaultDir: 'asc' | 'desc';
}

const COLUMNS: ColumnDef[] = [
  { key: 'url', label: 'URL', defaultDir: 'asc' },
  { key: 'productName', label: 'Product Name', defaultDir: 'asc' },
  { key: 'brandName', label: 'Brand Name', defaultDir: 'asc' },
  { key: 'competitionCategory', label: 'Category', defaultDir: 'asc' },
  { key: 'productStarRating', label: 'Product Stars', align: 'right', defaultDir: 'desc' },
  { key: 'numProductReviews', label: '# Reviews', align: 'right', defaultDir: 'desc' },
  { key: 'addedAt', label: 'Added On', align: 'right', defaultDir: 'desc' },
];

export function UrlTable({
  rows,
  searchText,
  onSearchChange,
  scopedTotal,
  onRowOpen,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      // Null/undefined always sorts last regardless of direction so the
      // "interesting" rows stay at the top.
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp: number;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const handleHeaderClick = (col: ColumnDef) => {
    if (col.key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir(col.defaultDir);
    }
  };

  const handleRowOpen = (urlId: string) => {
    onRowOpen(urlId);
  };

  // Filter-only empty state: data exists, but search box rules everything
  // out. Keep the search box visible so the user can clear it.
  const showFilterEmpty = scopedTotal > 0 && rows.length === 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search URL, Product Name, Brand…"
          aria-label="Search competitor URLs"
          style={{
            flex: 1,
            padding: '6px 10px',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#e6edf3',
            fontFamily: 'inherit',
            fontSize: '13px',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            color: '#8b949e',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          Showing {sorted.length} of {scopedTotal}
        </span>
      </div>

      {showFilterEmpty ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#8b949e',
            fontSize: '13px',
          }}
        >
          No URLs match this filter.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr>
                {COLUMNS.map((col) => {
                  const active = sortKey === col.key;
                  const arrow = !active ? '' : sortDir === 'asc' ? ' ▲' : ' ▼';
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleHeaderClick(col)}
                      aria-sort={
                        active
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                      style={{
                        textAlign: col.align ?? 'left',
                        padding: '8px 10px',
                        borderBottom: '1px solid #30363d',
                        color: active ? '#e6edf3' : '#8b949e',
                        fontWeight: 600,
                        cursor: 'pointer',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col.label}
                      <span style={{ color: '#1f6feb' }}>{arrow}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowOpen(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowOpen(row.id);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                  title="Open URL detail page"
                  style={{
                    cursor: 'pointer',
                    borderBottom: '1px solid #21262d',
                  }}
                >
                  <td style={cellStyle('left')}>
                    <span style={{ color: '#58a6ff' }}>{shortenUrl(row.url)}</span>
                  </td>
                  <td style={cellStyle('left')}>{row.productName ?? '—'}</td>
                  <td style={cellStyle('left')}>{row.brandName ?? '—'}</td>
                  <td style={cellStyle('left')}>{row.competitionCategory ?? '—'}</td>
                  <td style={cellStyle('right')}>
                    {row.productStarRating == null
                      ? '—'
                      : row.productStarRating.toFixed(1)}
                  </td>
                  <td style={cellStyle('right')}>
                    {row.numProductReviews == null
                      ? '—'
                      : row.numProductReviews.toLocaleString()}
                  </td>
                  <td style={cellStyle('right')}>{formatDate(row.addedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function cellStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '8px 10px',
    color: '#c9d1d9',
    fontVariantNumeric: align === 'right' ? 'tabular-nums' : 'normal',
    maxWidth: '320px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

// Shorten a URL for display: drop the protocol + www, cap at ~80 chars.
// The full URL is always the click target, so this is purely visual.
function shortenUrl(url: string): string {
  const trimmed = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

// Format an ISO timestamp like "May 6, 2026". Locale-default formatting is
// fine for an admin-solo Phase 1 audience; revisit at Phase 3 if workers
// in different locales surface a need.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
