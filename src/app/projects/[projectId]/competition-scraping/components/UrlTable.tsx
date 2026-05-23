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
// Columns (P-46 Workstream 3 Session 2 — 2026-05-23-e):
//   URL · Status · Sponsored · Product Name · Brand Name · Category ·
//   Product Stars · # Reviews · Added On · Type · Description 1 ·
//   Description 2 · Price · Competition Score · Results Rank ·
//   Seller Stars · Seller Reviews
//
// Per §A.2 (click-to-edit on every cell — binding decision Q2): every
// editable cell is read-only-looking until clicked; clicking turns the cell
// into its appropriate inline editor (text input / number input / dropdown
// / toggle). Tab/Enter saves; Escape cancels; blur saves. The per-row
// click-to-open-detail behavior the table used to have moved to an
// explicit "↗" Open button in the row-actions column so the cell-click
// edit affordance doesn't fight with row-navigation.
//
// Header interaction:
//   - Click the column LABEL → toggle sort.
//   - Click the funnel icon next to the label → open that column's filter
//     popover. The icon turns blue + shows a small dot when a filter is
//     active on that column.

import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type {
  CompetitorUrl,
  Platform,
  ScrapingStatus,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { UrlAddModal } from './UrlAddModal';
import {
  ConfirmDeleteDialog,
  type CascadeCounts,
} from './ConfirmDeleteDialog';
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
import {
  InlineBooleanCell,
  InlineDateCell,
  InlineEnumCell,
  InlineNumberCell,
  InlineTextCell,
  InlineUrlCell,
} from './InlineCells';

type SortKey =
  | 'url'
  | 'scrapingStatus'
  | 'isSponsoredAd'
  | 'productName'
  | 'brandName'
  | 'competitionCategory'
  | 'productStarRating'
  | 'numProductReviews'
  | 'addedAt'
  // P-46 Workstream 3 Session 2 — new column keys per §C.3 + §A.11.
  | 'type'
  | 'description1'
  | 'description2'
  | 'price'
  | 'competitionScore'
  | 'resultsPageRank'
  | 'sellerStarRating'
  | 'numSellerReviews';

interface Props {
  // P-46 Workstream 3 Session 1 — per-column visibility map sourced from
  // UserTablePreferences. Missing keys default to visible; this prop is
  // optional so callers that don't yet thread preferences through still
  // see every column.
  columnVisibility?: Record<string, boolean>;
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
  // this component stays decoupled from Next.js routing concerns. As of
  // P-46 Workstream 3 Session 2 the row no longer triggers this on a
  // whole-row click — only the per-row "↗" Open button does.
  onRowOpen: (urlId: string) => void;
  // P-29 Slice #1 — passed through to UrlAddModal which is mounted inside
  // this component but POSTs back to the parent's URL list state.
  projectId: string;
  onUrlAdded: (row: CompetitorUrl) => void;
  // P-28 — trash button per row. Parent removes the URL from list state
  // when the DELETE succeeds; UrlTable handles optimistic-remove + rollback
  // on error by calling onUrlDeleted (optimistic) and onUrlAdded (rollback).
  onUrlDeleted: (urlId: string) => void;
  // P-46 Workstream 3 Session 2 — per-cell save handler. Parent PATCHes the
  // /api/projects/[projectId]/competition-scraping/urls/[urlId] endpoint
  // with a partial body and updates local row state from the server's
  // response. Throws on failure so the inline cell can render its error.
  onCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
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
  // P-46 Workstream 2 Session 5 (2026-05-23-b) — bidirectional mirror with
  // the URL detail page's Scraping Status toggle per §A.8. Sort by status
  // works (INCOMPLETE < COMPLETE lexically); per-column filtering is
  // deferred to Workstream 3.
  { key: 'scrapingStatus', label: 'Status', defaultDir: 'asc', filterKey: null },
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
  // P-46 Workstream 3 Session 2 — new data columns per §C.3 + §A.11. No
  // per-column filtering this session (header funnel icons land Session 3
  // along with column resize + drag-to-reorder).
  { key: 'type', label: 'Type', defaultDir: 'asc', filterKey: null },
  { key: 'description1', label: 'Description 1', defaultDir: 'asc', filterKey: null },
  { key: 'description2', label: 'Description 2', defaultDir: 'asc', filterKey: null },
  { key: 'price', label: 'Price', defaultDir: 'asc', filterKey: null },
  {
    key: 'competitionScore',
    label: 'Competition Score',
    align: 'right',
    defaultDir: 'desc',
    filterKey: null,
  },
  {
    key: 'resultsPageRank',
    label: 'Results Rank',
    align: 'right',
    defaultDir: 'asc',
    filterKey: null,
  },
  {
    key: 'sellerStarRating',
    label: 'Seller Stars',
    align: 'right',
    defaultDir: 'desc',
    filterKey: null,
  },
  {
    key: 'numSellerReviews',
    label: 'Seller Reviews',
    align: 'right',
    defaultDir: 'desc',
    filterKey: null,
  },
];

const SCRAPING_STATUS_OPTIONS: ReadonlyArray<{
  value: ScrapingStatus;
  label: string;
}> = [
  { value: 'INCOMPLETE', label: 'Incomplete' },
  { value: 'COMPLETE', label: 'Complete' },
];

export function UrlTable({
  columnVisibility,
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
  onUrlDeleted,
  onCellSave,
  selectedPlatform,
}: Props) {
  // P-46 Workstream 3 Session 1 — filter the column registry by the
  // visibility map. Missing keys default to visible (matches
  // ColumnVisibilityBar's isColumnVisible).
  const visibleColumns = useMemo(() => {
    if (!columnVisibility) return COLUMNS;
    return COLUMNS.filter((c) => {
      if (c.key in columnVisibility) return columnVisibility[c.key];
      return true;
    });
  }, [columnVisibility]);

  // P-46 Workstream 3 Session 2 — per-column inline-editor cell renderers.
  // Each renderer returns a <td> containing the appropriate InlineCells
  // component wired to onCellSave with the right field key. The tbody
  // iterates visibleColumns.map((col) => cellRenderers[col.key](row)) so
  // visibility decisions happen at column filtering, not per-cell.
  const cellRenderers = useMemo<
    Record<SortKey, (row: CompetitorUrl) => React.ReactNode>
  >(
    () => ({
      url: (row) => (
        <td key="url" style={cellStyle('left')}>
          <InlineUrlCell
            value={row.url}
            onSave={(next) => onCellSave(row.id, { url: next as string })}
          />
        </td>
      ),
      scrapingStatus: (row) => (
        <td key="scrapingStatus" style={cellStyle('left')}>
          <InlineEnumCell<ScrapingStatus>
            value={row.scrapingStatus}
            options={SCRAPING_STATUS_OPTIONS}
            onSave={(next) => onCellSave(row.id, { scrapingStatus: next })}
            renderRead={(active) => (
              <span style={scrapingStatusBadgeStyle(active.value)}>
                {active.label}
              </span>
            )}
          />
        </td>
      ),
      isSponsoredAd: (row) => (
        <td key="isSponsoredAd" style={cellStyle('left')}>
          <InlineBooleanCell
            value={row.isSponsoredAd}
            onSave={(next) => onCellSave(row.id, { isSponsoredAd: next })}
            trueLabel="Sponsored"
            falseLabel="—"
            trueStyle={sponsoredBadgeStyle}
            falseStyle={{ color: '#6e7681', fontStyle: 'italic' }}
          />
        </td>
      ),
      productName: (row) => (
        <td key="productName" style={cellStyle('left')}>
          <InlineTextCell
            value={row.productName}
            onSave={(next) => onCellSave(row.id, { productName: next })}
            placeholder="Set product name"
          />
        </td>
      ),
      brandName: (row) => (
        <td key="brandName" style={cellStyle('left')}>
          <InlineTextCell
            value={row.brandName}
            onSave={(next) => onCellSave(row.id, { brandName: next })}
            placeholder="Set brand name"
          />
        </td>
      ),
      competitionCategory: (row) => (
        <td key="competitionCategory" style={cellStyle('left')}>
          <InlineTextCell
            value={row.competitionCategory}
            onSave={(next) =>
              onCellSave(row.id, { competitionCategory: next })
            }
            placeholder="Set category"
          />
        </td>
      ),
      productStarRating: (row) => (
        <td key="productStarRating" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.productStarRating}
            onSave={(next) => onCellSave(row.id, { productStarRating: next })}
            min={0}
            max={5}
            step={0.1}
            formatRead={(v) => (v == null ? null : v.toFixed(1))}
          />
        </td>
      ),
      numProductReviews: (row) => (
        <td key="numProductReviews" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.numProductReviews}
            onSave={(next) => onCellSave(row.id, { numProductReviews: next })}
            min={0}
            integer
          />
        </td>
      ),
      addedAt: (row) => (
        <td key="addedAt" style={cellStyle('right')}>
          <InlineDateCell value={row.addedAt} onSave={async () => {}} readOnly />
        </td>
      ),
      // New W3 S2 columns:
      type: (row) => (
        <td key="type" style={cellStyle('left')}>
          <InlineTextCell
            value={row.type}
            onSave={(next) => onCellSave(row.id, { type: next })}
            placeholder="Set type"
          />
        </td>
      ),
      description1: (row) => (
        <td key="description1" style={cellStyle('left')}>
          <InlineTextCell
            value={row.description1}
            onSave={(next) => onCellSave(row.id, { description1: next })}
            placeholder="Set description"
            multiline
          />
        </td>
      ),
      description2: (row) => (
        <td key="description2" style={cellStyle('left')}>
          <InlineTextCell
            value={row.description2}
            onSave={(next) => onCellSave(row.id, { description2: next })}
            placeholder="Set description"
            multiline
          />
        </td>
      ),
      price: (row) => (
        <td key="price" style={cellStyle('left')}>
          <InlineTextCell
            value={row.price}
            onSave={(next) => onCellSave(row.id, { price: next })}
            placeholder="Set price"
          />
        </td>
      ),
      competitionScore: (row) => (
        <td key="competitionScore" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.competitionScore}
            onSave={(next) => onCellSave(row.id, { competitionScore: next })}
            min={1}
            max={100}
            integer
          />
        </td>
      ),
      resultsPageRank: (row) => (
        <td key="resultsPageRank" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.resultsPageRank}
            onSave={(next) => onCellSave(row.id, { resultsPageRank: next })}
            min={1}
            integer
          />
        </td>
      ),
      sellerStarRating: (row) => (
        <td key="sellerStarRating" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.sellerStarRating}
            onSave={(next) => onCellSave(row.id, { sellerStarRating: next })}
            min={0}
            max={5}
            step={0.1}
            formatRead={(v) => (v == null ? null : v.toFixed(1))}
          />
        </td>
      ),
      numSellerReviews: (row) => (
        <td key="numSellerReviews" style={cellStyle('right')}>
          <InlineNumberCell
            value={row.numSellerReviews}
            onSave={(next) => onCellSave(row.id, { numSellerReviews: next })}
            min={0}
            integer
          />
        </td>
      ),
    }),
    [onCellSave]
  );

  const [sortKey, setSortKey] = useState<SortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  // P-29 Slice #1 — modal-open state for the "+ Manually add URL" button.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // P-28 — trash-button confirm-delete dialog state. pendingDeleteRow !== null
  // means the dialog is open for that row; cascadeCounts + cascadeError
  // populate as the lazy GET cascade-counts fetch resolves.
  const [pendingDeleteRow, setPendingDeleteRow] = useState<CompetitorUrl | null>(
    null
  );
  const [cascadeCounts, setCascadeCounts] = useState<CascadeCounts | null>(null);
  const [cascadeError, setCascadeError] = useState<string | null>(null);

  // Lazy-fetch the cascade counts when the dialog opens. A new pendingDeleteRow
  // resets counts to null/null (loading state) and kicks off the GET. The
  // cancelled flag guards against a row-switch race (rare — user closes one
  // dialog and opens another before the first fetch resolves).
  useEffect(() => {
    if (pendingDeleteRow === null) return;
    let cancelled = false;
    setCascadeCounts(null);
    setCascadeError(null);
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls/${pendingDeleteRow.id}/cascade-counts`
        );
        if (cancelled) return;
        if (!res.ok) {
          setCascadeError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as CascadeCounts;
        if (cancelled) return;
        setCascadeCounts(data);
      } catch (err) {
        if (cancelled) return;
        setCascadeError(err instanceof Error ? err.message : 'Network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingDeleteRow, projectId]);

  const handleTrashClick = (row: CompetitorUrl, e: React.MouseEvent): void => {
    e.stopPropagation();
    setPendingDeleteRow(row);
  };

  const handleOpenClick = (row: CompetitorUrl, e: React.MouseEvent): void => {
    e.stopPropagation();
    onRowOpen(row.id);
  };

  const handleDialogClose = (): void => {
    setPendingDeleteRow(null);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!pendingDeleteRow) return;
    const row = pendingDeleteRow;
    // Optimistic remove — parent drops the row from list state immediately.
    onUrlDeleted(row.id);
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${row.id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        // Rollback — re-add the row via onUrlAdded which dedups by id.
        onUrlAdded(row);
        const detail = await readErrorMessage(res);
        throw new Error(detail);
      }
      // Success path — close the dialog. The parent's optimistic-remove
      // already updated the visible row set.
      setPendingDeleteRow(null);
    } catch (err) {
      // Network error or non-ok response above. Make sure the row is back
      // (idempotent re-add if it's already there) and re-throw so the
      // dialog renders the error message inline.
      onUrlAdded(row);
      throw err instanceof Error ? err : new Error('Network error');
    }
  };

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
                {visibleColumns.map((col) => {
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
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px 10px',
                    borderBottom: '1px solid #30363d',
                    color: '#8b949e',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    width: '88px',
                  }}
                  aria-label="Row actions"
                >
                  {/* P-46 Workstream 3 Session 2 — actions column header.
                      Holds the per-row "↗" Open detail button + the P-28
                      trash button. */}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  // Row no longer has its own onClick → handleRowOpen as of
                  // P-46 Workstream 3 Session 2. Every cell is click-to-edit
                  // per §A.2; detail-page navigation is the explicit "↗"
                  // button in the row-actions column.
                  onMouseEnter={(e) => {
                    const cells = e.currentTarget.querySelectorAll<HTMLTableCellElement>('td');
                    cells.forEach((cell) => {
                      cell.style.background = '#21262d';
                    });
                  }}
                  onMouseLeave={(e) => {
                    const cells = e.currentTarget.querySelectorAll<HTMLTableCellElement>('td');
                    cells.forEach((cell) => {
                      cell.style.background = '';
                    });
                  }}
                  style={{
                    borderBottom: '1px solid #21262d',
                  }}
                >
                  {visibleColumns.map((col) => cellRenderers[col.key](row))}
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '4px 6px',
                      width: '88px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleOpenClick(row, e)}
                      aria-label={`Open detail page for ${row.url}`}
                      title="Open detail page"
                      data-testid="url-row-open-button"
                      style={rowOpenButtonStyle}
                    >
                      ↗
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleTrashClick(row, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                        }
                      }}
                      aria-label={`Delete URL ${row.url}`}
                      title="Delete URL"
                      data-testid="url-row-delete-button"
                      style={rowTrashButtonStyle}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteDialog
        isOpen={pendingDeleteRow !== null}
        title="Delete this URL?"
        message={
          pendingDeleteRow
            ? `${shortenUrl(pendingDeleteRow.url)} — this cannot be undone.`
            : ''
        }
        confirmLabel="Delete URL"
        onClose={handleDialogClose}
        onConfirm={handleConfirmDelete}
        variant={{
          kind: 'cascade',
          counts: cascadeCounts,
          countsError: cascadeError,
        }}
      />
    </div>
  );
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `Could not delete URL (HTTP ${res.status}).`;
}

const rowTrashButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#8b949e',
  fontSize: '14px',
  lineHeight: '14px',
  cursor: 'pointer',
  padding: '4px 8px',
  marginLeft: '4px',
};

const rowOpenButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#58a6ff',
  fontSize: '14px',
  lineHeight: '14px',
  cursor: 'pointer',
  padding: '4px 8px',
};

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

// P-46 Workstream 2 Session 5 (2026-05-23-b) — color-coded Status pill.
// COMPLETE = green (workflow done); INCOMPLETE = gray (still in progress).
// Per §A.8 the value is sourced from CompetitorUrl.scrapingStatus enum.
function scrapingStatusBadgeStyle(
  status: CompetitorUrl['scrapingStatus']
): React.CSSProperties {
  const complete = status === 'COMPLETE';
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '999px',
    background: complete
      ? 'rgba(63, 185, 80, 0.15)'
      : 'rgba(139, 148, 158, 0.15)',
    color: complete ? '#3fb950' : '#8b949e',
    border: complete
      ? '1px solid rgba(63, 185, 80, 0.40)'
      : '1px solid rgba(139, 148, 158, 0.40)',
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: '14px',
    whiteSpace: 'nowrap',
  };
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
