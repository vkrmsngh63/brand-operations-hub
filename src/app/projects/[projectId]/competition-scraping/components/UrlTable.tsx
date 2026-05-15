'use client';

// URL table for the W#2 multi-table viewer.
//
// Renders the rows the parent already filtered by selected platform; owns
// its own sort state because sort is a table-local UI concern. As of slice
// (a.4) the table also surfaces per-column filters via dropdowns attached
// to the column headers — multi-select for vocabulary columns, min/max for
// numeric columns, from/to for the date column. Filter STATE is owned by
// the parent (so it survives a refresh via the URL query); the table just
// renders the popovers and hands changes back via onFiltersChange.
//
// Columns:
//   URL · Product Name · Brand Name · Category · Product Stars
//   · # Reviews · Added On
//
// Header interaction:
//   - Click the column LABEL → toggle sort.
//   - Click the funnel icon next to the label → open that column's filter
//     popover. The icon turns blue + shows a small dot when a filter is
//     active on that column.
//
// Click a row → navigate to that URL's per-URL detail page (in-app).

import { useMemo, useState } from 'react';
import type { CompetitorUrl, Platform } from '@/lib/shared-types/competition-scraping';
import { UrlAddModal } from './UrlAddModal';
import {
  applyColumnFilters,
  BooleanFilter,
  computeDistinctValues,
  countActiveColumnFilters,
  DateRangeFilter,
  EMPTY_COLUMN_FILTERS,
  FilterPopover,
  isColumnFilterActive,
  MultiSelectFilter,
  NumericRangeFilter,
  type ColumnFilterKey,
  type ColumnFiltersState,
} from './ColumnFilters';

type SortKey =
  | 'url'
  | 'isSponsoredAd'
  | 'productName'
  | 'brandName'
  | 'competitionCategory'
  | 'productStarRating'
  | 'numProductReviews'
  | 'addedAt';

interface Props {
  // Rows already filtered by the platform sidebar AND the free-text search
  // box (handled by the parent). Column filters are applied INSIDE this
  // component, after filterless rendering, so the multi-select option lists
  // can be derived from the platform-scoped set instead.
  rows: CompetitorUrl[];
  // Same set the parent passes as `rows`, BEFORE the search box narrows it.
  // The multi-select dropdown options + the "(blank) row visibility" both
  // derive from this set so other filters' state doesn't shrink the options
  // available in another filter's popover.
  scopeRows: CompetitorUrl[];
  searchText: string;
  onSearchChange: (next: string) => void;
  scopedTotal: number;
  filters: ColumnFiltersState;
  onFiltersChange: (next: ColumnFiltersState) => void;
  // Click-row handler. The parent owns router + projectId knowledge so
  // this component stays decoupled from Next.js routing concerns.
  onRowOpen: (urlId: string) => void;
  // P-29 Slice #1 — passed through to UrlAddModal which is mounted inside
  // this component but POSTs back to the parent's URL list state.
  projectId: string;
  onUrlAdded: (row: CompetitorUrl) => void;
  // 2026-05-15-d Slice #2.5 — current platform filter from the URL query
  // (?platform=<value>). Passed through to UrlAddModal as `defaultPlatform`
  // when not 'all' so a click on "+ Manually add URL" from a filtered view
  // pre-selects the matching platform.
  selectedPlatform: Platform | 'all';
}

interface ColumnDef {
  key: SortKey;
  label: string;
  align?: 'left' | 'right';
  // Numeric/date columns default to descending on first click — the
  // common scan dimension is "highest rating," "most reviews," "newest."
  defaultDir: 'asc' | 'desc';
  filterKey: ColumnFilterKey | null;
}

const COLUMNS: ColumnDef[] = [
  { key: 'url', label: 'URL', defaultDir: 'asc', filterKey: null },
  {
    key: 'isSponsoredAd',
    label: 'Sponsored',
    defaultDir: 'desc',
    filterKey: 'isSponsoredAd',
  },
  {
    key: 'productName',
    label: 'Product Name',
    defaultDir: 'asc',
    filterKey: 'productName',
  },
  {
    key: 'brandName',
    label: 'Brand Name',
    defaultDir: 'asc',
    filterKey: 'brandName',
  },
  {
    key: 'competitionCategory',
    label: 'Category',
    defaultDir: 'asc',
    filterKey: 'competitionCategory',
  },
  {
    key: 'productStarRating',
    label: 'Product Stars',
    align: 'right',
    defaultDir: 'desc',
    filterKey: 'productStarRating',
  },
  {
    key: 'numProductReviews',
    label: '# Reviews',
    align: 'right',
    defaultDir: 'desc',
    filterKey: 'numProductReviews',
  },
  {
    key: 'addedAt',
    label: 'Added On',
    align: 'right',
    defaultDir: 'desc',
    filterKey: 'addedAt',
  },
];

export function UrlTable({
  rows,
  scopeRows,
  searchText,
  onSearchChange,
  scopedTotal,
  filters,
  onFiltersChange,
  onRowOpen,
  projectId,
  onUrlAdded,
  selectedPlatform,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  // P-29 Slice #1 — modal-open state for the "+ Manually add URL" button.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Distinct values for the multi-select dropdowns are derived from the
  // platform-scoped set — NOT from `rows` (which has already been narrowed
  // by the search box and would shrink the options as the user types).
  const distinct = useMemo(() => computeDistinctValues(scopeRows), [scopeRows]);
  const blanks = useMemo(
    () => ({
      productName: scopeRows.some(
        (r) => r.productName === null || r.productName === ''
      ),
      brandName: scopeRows.some(
        (r) => r.brandName === null || r.brandName === ''
      ),
      category: scopeRows.some(
        (r) =>
          r.competitionCategory === null || r.competitionCategory === ''
      ),
    }),
    [scopeRows]
  );

  // Apply column filters BEFORE sort so the visible row set is the right
  // one to compute "Showing N of M" against.
  const filtered = useMemo(
    () => applyColumnFilters(rows, filters),
    [rows, filters]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      // Null/undefined always sorts last regardless of direction so the
      // "interesting" rows stay at the top.
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp: number;
      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        // false < true. Default direction for the Sponsored column is
        // 'desc' so first click puts sponsored=true rows at the top.
        cmp = (av === bv ? 0 : av ? 1 : -1);
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const handleSortClick = (col: ColumnDef): void => {
    if (col.key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir(col.defaultDir);
    }
  };

  const handleRowOpen = (urlId: string): void => {
    onRowOpen(urlId);
  };

  const activeFilterCount = countActiveColumnFilters(filters);
  const handleClearAll = (): void => {
    onFiltersChange(EMPTY_COLUMN_FILTERS);
  };

  // Filter-only empty state: data exists, but search box / column filters
  // rule everything out. Keep the search box visible so the user can clear.
  const showFilterEmpty = scopedTotal > 0 && sorted.length === 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          flexWrap: 'wrap',
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
            minWidth: '200px',
            padding: '6px 10px',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            color: '#e6edf3',
            fontFamily: 'inherit',
            fontSize: '13px',
          }}
        />
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleClearAll}
            style={clearAllButtonStyle}
            aria-label="Clear all column filters"
          >
            Clear all filters ({activeFilterCount} active)
          </button>
        ) : null}
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
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          style={addUrlButtonStyle}
          aria-label="Manually add URL"
          data-testid="manual-add-url-button"
        >
          + Manually add URL
        </button>
      </div>

      <UrlAddModal
        projectId={projectId}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onUrlAdded}
        defaultPlatform={
          selectedPlatform === 'all' ? undefined : selectedPlatform
        }
      />

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
                  const filterActive =
                    col.filterKey !== null &&
                    isColumnFilterActive(filters, col.filterKey);
                  return (
                    <th
                      key={col.key}
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
                        color: active || filterActive ? '#e6edf3' : '#8b949e',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSortClick(col)}
                          style={sortLabelStyle}
                          aria-label={`Sort by ${col.label}`}
                        >
                          {col.label}
                          <span style={{ color: '#1f6feb' }}>{arrow}</span>
                        </button>
                        {col.filterKey !== null ? (
                          <FilterPopover
                            isActive={filterActive}
                            ariaLabel={`Filter ${col.label}`}
                            renderBody={(close) =>
                              renderFilterBody(
                                col.filterKey as ColumnFilterKey,
                                filters,
                                onFiltersChange,
                                close,
                                distinct,
                                blanks
                              )
                            }
                          />
                        ) : null}
                      </span>
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
                  <td style={cellStyle('left')}>
                    {row.isSponsoredAd ? (
                      <span style={sponsoredBadgeStyle}>Sponsored</span>
                    ) : (
                      '—'
                    )}
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

function renderFilterBody(
  key: ColumnFilterKey,
  filters: ColumnFiltersState,
  onFiltersChange: (next: ColumnFiltersState) => void,
  close: () => void,
  distinct: ReturnType<typeof computeDistinctValues>,
  blanks: { productName: boolean; brandName: boolean; category: boolean }
): React.ReactNode {
  switch (key) {
    case 'productName':
      return (
        <MultiSelectFilter
          options={distinct.productName}
          selected={filters.productName}
          hasBlankRows={blanks.productName}
          emptyOptionsLabel="No product names captured yet."
          onCommit={(next) =>
            onFiltersChange({ ...filters, productName: next })
          }
          onClose={close}
        />
      );
    case 'brandName':
      return (
        <MultiSelectFilter
          options={distinct.brandName}
          selected={filters.brandName}
          hasBlankRows={blanks.brandName}
          emptyOptionsLabel="No brand names captured yet."
          onCommit={(next) =>
            onFiltersChange({ ...filters, brandName: next })
          }
          onClose={close}
        />
      );
    case 'competitionCategory':
      return (
        <MultiSelectFilter
          options={distinct.category}
          selected={filters.category}
          hasBlankRows={blanks.category}
          emptyOptionsLabel="No categories captured yet."
          onCommit={(next) => onFiltersChange({ ...filters, category: next })}
          onClose={close}
        />
      );
    case 'productStarRating':
      return (
        <NumericRangeFilter
          min={filters.productStarsMin}
          max={filters.productStarsMax}
          step={0.1}
          inputMin={0}
          inputMax={5}
          onCommit={(min, max) =>
            onFiltersChange({
              ...filters,
              productStarsMin: min,
              productStarsMax: max,
            })
          }
          onClose={close}
        />
      );
    case 'numProductReviews':
      return (
        <NumericRangeFilter
          min={filters.reviewsMin}
          max={filters.reviewsMax}
          step={1}
          inputMin={0}
          onCommit={(min, max) =>
            onFiltersChange({
              ...filters,
              reviewsMin: min,
              reviewsMax: max,
            })
          }
          onClose={close}
        />
      );
    case 'addedAt':
      return (
        <DateRangeFilter
          from={filters.addedFrom}
          to={filters.addedTo}
          onCommit={(from, to) =>
            onFiltersChange({ ...filters, addedFrom: from, addedTo: to })
          }
          onClose={close}
        />
      );
    case 'isSponsoredAd':
      return (
        <BooleanFilter
          value={filters.isSponsoredAd}
          trueLabel="Sponsored only"
          falseLabel="Non-sponsored only"
          onCommit={(next) =>
            onFiltersChange({ ...filters, isSponsoredAd: next })
          }
          onClose={close}
        />
      );
  }
}

const sortLabelStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  userSelect: 'none',
};

const clearAllButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#58a6ff',
  fontSize: '12px',
  fontFamily: 'inherit',
  padding: '4px 10px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

// P-29 Slice #1 — primary action button in the table toolbar. GitHub-green
// fill matches the modal's Save button so the entry+confirm color story
// stays consistent.
const addUrlButtonStyle: React.CSSProperties = {
  background: '#238636',
  border: '1px solid rgba(240, 246, 252, 0.10)',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '12px',
  fontFamily: 'inherit',
  fontWeight: 600,
  padding: '5px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

// P-6 — small "Sponsored" pill in the cell when isSponsoredAd === true.
// Amber tone is consistent with the GitHub-dark palette used elsewhere in
// the table; subtle enough not to compete with the URL link color.
const sponsoredBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '999px',
  background: 'rgba(187, 128, 9, 0.15)',
  color: '#d29922',
  border: '1px solid rgba(187, 128, 9, 0.40)',
  fontSize: '11px',
  fontWeight: 600,
  lineHeight: '14px',
  whiteSpace: 'nowrap',
};

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
