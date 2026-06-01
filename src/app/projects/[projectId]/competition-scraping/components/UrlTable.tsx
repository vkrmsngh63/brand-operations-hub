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
//   - Drag the right edge of any column header → resize that column.
//     Width is clamped to MIN_COLUMN_WIDTH..MAX_COLUMN_WIDTH and saves to
//     UserTablePreferences.columnWidths via the parent's debounced PUT.
//
// Row interaction (P-46 Workstream 3 Session 3 — today):
//   - Grab the ⋮⋮ handle on the left edge of any row → drag it up or
//     down to reorder. Drag-end switches sort mode to 'manual' so the
//     new order sticks visually; row order saves to
//     UserTablePreferences.rowOrder via the parent's debounced PUT.
//     Clicking any column header sort button switches back out of
//     'manual' mode (rowOrder still persists server-side; just not
//     applied visually until the user picks 'manual' again by dragging).

import {
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  DndContext,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  applyColumnOrder,
  moveColumnKey,
  withMissingKeysBefore,
} from '@/lib/competition-scraping/column-order';
import {
  CAPTURED_KINDS,
  KIND_GROUP_VIS_KEY,
  buildDynamicColumnPairs,
  collectCategories,
  itemsForCategory,
  subRowSpan,
  withDynamicKeysInOrder,
  type CapturedKind,
  type DynCapturedItem,
  type DynColumnPair,
} from '@/lib/competition-scraping/dynamic-columns';
import {
  buildMainGroupedRows,
  reorderableGroupKeys,
  type GroupByMode,
  type ActiveGroupMode,
  type MainGroup,
} from '@/lib/competition-scraping/main-table-grouping';
// P-54 Phase 4 — reuse the proven two-level-drag re-rank helpers from the
// By-Category page (pure string-array operations; the "Category"/"Competitor"
// names are historical — they apply equally to any banner/row reorder).
import {
  applyCategoryDrag,
  applyCompetitorDrag,
} from '@/lib/competition-scraping/category-table-layout';
import { authFetch } from '@/lib/authFetch';
import type {
  CompetitorUrl,
  Platform,
  ScrapingStatus,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { PerItemAnalysisBox } from './PerItemAnalysisBox';
import { OverallAnalysisBox } from './OverallAnalysisBox';
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
  InlineNumberCell,
  InlineTextCell,
  InlineUrlCell,
} from './InlineCells';
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  MAX_COLUMN_WIDTH,
  MIN_COLUMN_WIDTH,
  PLATFORM_LABELS,
  resolveColumnWidth,
  TABLE_COLUMN_DEFS,
} from './url-table-columns';
import { ColumnResizeHandle } from './ColumnResizeHandle';

// Per-column SortKey is the column id from url-table-columns.ts. Plus the
// special 'manual' state (Session 3) which means "respect rowOrder from
// UserTablePreferences instead of any column-based comparator." Dragging a
// row flips into 'manual'; clicking a column header flips out.
type ColumnSortKey =
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
  | 'numSellerReviews'
  // 2026-05-24 fix-forward #4 — Platform column added at very left.
  | 'platform'
  // P-55 Phase 1 (2026-06-01) — URL-level Overall Competitor Analysis surfaced
  // as a main-table column (rich text; sorts by its plain-text content).
  | 'overallCompetitorAnalysis';

type SortKey = ColumnSortKey | 'manual';

// P-54 Phase 4 — banner drag ids are prefixed so the single DndContext can tell
// a group-banner drag apart from a row drag (uuid) or a column drag (column key).
const GROUP_DRAG_PREFIX = 'grp:';
const groupDragId = (key: string): string => `${GROUP_DRAG_PREFIX}${key}`;

interface Props {
  // P-46 Workstream 3 Session 1 — per-column visibility map sourced from
  // UserTablePreferences. Missing keys default to visible; this prop is
  // optional so callers that don't yet thread preferences through still
  // see every column.
  columnVisibility?: Record<string, boolean>;
  // P-46 Workstream 3 Session 3 — per-column width override map. Missing
  // keys fall back to the column's defaultWidth from url-table-columns.
  // Pixel values clamped to MIN/MAX_COLUMN_WIDTH at the drag-handle site.
  columnWidths?: Record<string, number>;
  // P-46 Workstream 3 Session 3 — table-wide font size in px. Defaults to
  // FONT_SIZE_DEFAULT (14) when not provided.
  fontSize?: number;
  // 2026-05-24 fix-forward (Issue 4) — font-size stepper now lives in this
  // table's toolbar row (was in ColumnVisibilityBar). UrlTable owns the
  // +/- buttons; the parent still owns the value + debounced PUT.
  onFontSizeChange?: (size: number) => void;
  // P-46 Workstream 3 Session 3 — preferred row order from
  // UserTablePreferences. Applied only when sortKey === 'manual';
  // otherwise the comparator-based sort wins.
  rowOrder?: string[];
  // P-54 Phase 3 (2026-06-01) — shared per-Project column order ([columnId] in
  // arranged left-to-right order). Applied via applyColumnOrder over the column
  // registry; columns absent from the array fall back to registry order.
  // Optional so callers that don't thread it still see the default order.
  columnOrder?: string[];
  // P-54 Phase 3 — called with the full new column-id order after a header
  // drag-to-reorder drop. Parent persists it to the shared project layout.
  onColumnReorder?: (nextOrder: string[]) => void;
  // P-46 Workstream 3 Session 3 — resize-drag end + drop callbacks. The
  // parent persists the value via the same debounced PUT lifecycle that
  // carries columnVisibility.
  onColumnResize?: (columnId: string, width: number) => void;
  onRowReorder?: (nextOrder: string[]) => void;
  // P-54 Phase 4 (2026-06-01) — "Sort By" row grouping. groupBy = the active
  // grouping mode ('none' = the flat table). groupOrder = the saved banner
  // order per mode (keyed 'platform'|'category'|'type'). onGroupReorder fires
  // after a banner drag with the new ordered banner-key list for the mode.
  groupBy?: GroupByMode;
  groupOrder?: Record<string, string[]>;
  onGroupReorder?: (mode: ActiveGroupMode, nextKeys: string[]) => void;
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
  // P-54 Phase 5 (2026-06-01) — in-table edit of a captured item's value (the
  // captured/embedded text) or its analysis, writing back through the per-item
  // PATCH routes. Parent updates the owning URL's `captures` from the result.
  onCapturedSave?: (
    kind: CapturedKind,
    itemId: string,
    patch: { body?: string | null; analysis?: Record<string, unknown> }
  ) => Promise<void>;
  // 2026-05-15-d Slice #2.5 — current platform filter from the URL query
  // (?platform=<value>). Passed through to UrlAddModal as `defaultPlatform`
  // when not 'all' so a click on "+ Manually add URL" from a filtered view
  // pre-selects the matching platform.
  selectedPlatform: Platform | 'all';
}

interface ColumnDef {
  key: ColumnSortKey;
  label: string;
  align?: 'left' | 'right';
  // Numeric/date columns default to descending on first click — the
  // common scan dimension is "highest rating," "most reviews," "newest."
  defaultDir: 'asc' | 'desc';
  filterKey: ColumnFilterKey | null;
}

// 2026-05-24 fix-forward #3 — Column order matches director's specified
// left-to-right order (also reflected in TABLE_COLUMN_DEFS in
// url-table-columns.ts). The two arrays must stay in lockstep: this one
// drives the table's thead/tbody render; the other drives the
// ColumnVisibilityBar's checkbox order. Prior "additive append" order
// was an implementation default that hadn't been written into the
// binding docs; corrected in fix-forward #3.
const COLUMNS: ColumnDef[] = [
  // 2026-05-24 fix-forward #4 — Platform column at position 0 (very
  // leftmost data column). Sort by platform name alphabetically; no
  // in-column filter (the top-bar's platform-chip group already filters
  // by platform).
  { key: 'platform', label: 'Platform', defaultDir: 'asc', filterKey: null },
  {
    key: 'competitionCategory',
    label: 'Category',
    defaultDir: 'asc',
    filterKey: 'competitionCategory',
  },
  { key: 'type', label: 'Type', defaultDir: 'asc', filterKey: null },
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
  { key: 'description1', label: 'Description 1', defaultDir: 'asc', filterKey: null },
  { key: 'description2', label: 'Description 2', defaultDir: 'asc', filterKey: null },
  {
    key: 'resultsPageRank',
    label: 'Results Rank',
    align: 'right',
    defaultDir: 'asc',
    filterKey: null,
  },
  { key: 'price', label: 'Price', defaultDir: 'asc', filterKey: null },
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
  {
    key: 'competitionScore',
    label: 'Competition Score',
    align: 'right',
    defaultDir: 'desc',
    filterKey: null,
  },
  { key: 'url', label: 'URL', defaultDir: 'asc', filterKey: null },
  // P-46 Workstream 2 Session 5 (2026-05-23-b) — bidirectional mirror with
  // the URL detail page's Scraping Status toggle per §A.8. Sort by status
  // works (INCOMPLETE < COMPLETE lexically); per-column filtering is
  // deferred to Workstream 3.
  { key: 'scrapingStatus', label: 'Status', defaultDir: 'asc', filterKey: null },
  // P-55 Phase 1 (2026-06-01) — Overall Competitor Analysis, just left of
  // 'Added On' per director directive. Sortable (by plain-text content, see
  // the comparator special-case); no in-column filter. Must stay in lockstep
  // with TABLE_COLUMN_DEFS in url-table-columns.ts.
  {
    key: 'overallCompetitorAnalysis',
    label: 'Overall Competitor Analysis',
    defaultDir: 'asc',
    filterKey: null,
  },
  {
    key: 'addedAt',
    label: 'Added On',
    align: 'right',
    defaultDir: 'desc',
    filterKey: 'addedAt',
  },
];

// P-54 Phase 5 — a physical render column: either a fixed registry column, or
// one half of a dynamic category column-PAIR (the value column or its glued-on
// analysis column). The pair's `orderKey` is the value key for BOTH halves, so
// the analysis column rides immediately to the right of its value column and
// the pair moves as a locked unit under reorder (only the value key is ever
// orderable / persisted).
interface FixedPhysicalColumn {
  kind: 'fixed';
  physKey: string;
  col: ColumnDef;
}
interface DynPhysicalColumn {
  kind: 'dyn';
  physKey: string; // the DOM / width key (value key OR analysis key)
  orderKey: string; // the value key — the orderable / pair id
  role: 'value' | 'analysis';
  capturedKind: CapturedKind;
  category: string;
  label: string;
}
type PhysicalColumn = FixedPhysicalColumn | DynPhysicalColumn;

const DYN_VALUE_DEFAULT_WIDTH = 280;
const DYN_ANALYSIS_DEFAULT_WIDTH = 280;

// Default placement of the dynamic value keys: spliced in immediately before the
// 'Overall Competitor Analysis' column (which itself sits just left of 'Added
// On'), so the default left-to-right tail is: …, [dynamic category columns],
// Overall Competitor Analysis, Added On. Falls back to splicing before 'Added
// On' (then to an append) if those anchor columns are ever removed. Used only
// when no shared column order is saved yet.
function defaultUnitOrder(dynValueKeys: readonly string[]): string[] {
  const fixedKeys = COLUMNS.map((c) => c.key as string);
  const anchor = fixedKeys.indexOf('overallCompetitorAnalysis');
  const idx = anchor >= 0 ? anchor : fixedKeys.indexOf('addedAt');
  if (idx < 0) return [...fixedKeys, ...dynValueKeys];
  return [
    ...fixedKeys.slice(0, idx),
    ...dynValueKeys,
    ...fixedKeys.slice(idx),
  ];
}

function resolveDynWidth(
  columnWidths: Record<string, number>,
  physKey: string,
  role: 'value' | 'analysis'
): number {
  const override = columnWidths[physKey];
  if (typeof override === 'number' && override > 0) return override;
  return role === 'value' ? DYN_VALUE_DEFAULT_WIDTH : DYN_ANALYSIS_DEFAULT_WIDTH;
}

function physicalColumnWidth(
  columnWidths: Record<string, number>,
  pc: PhysicalColumn
): number {
  if (pc.kind === 'fixed') {
    return resolveColumnWidth(columnWidths, tableColumnDefByKey(pc.col.key));
  }
  return resolveDynWidth(columnWidths, pc.physKey, pc.role);
}

export function UrlTable({
  columnVisibility,
  columnWidths,
  fontSize,
  onFontSizeChange,
  rowOrder,
  columnOrder,
  onColumnReorder,
  onColumnResize,
  onRowReorder,
  groupBy,
  groupOrder,
  onGroupReorder,
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
  onCapturedSave,
  selectedPlatform,
}: Props) {
  // Effective values for the optional Session 3 props.
  const effectiveColumnWidths = columnWidths ?? {};
  const effectiveFontSize = fontSize ?? 14;
  const effectiveRowOrder = rowOrder ?? [];

  // 2026-05-24 fix-forward (Issue 1) — measured table height so the
  // ColumnResizeHandle can extend its drag zone past the header all the
  // way down through every row. ResizeObserver picks up height changes
  // from font-size adjustments, row inserts/deletes, and column-width
  // changes that reflow row heights.
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  useLayoutEffect(() => {
    const el = tableRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTableHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    setTableHeight(el.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, []);

  // Pointer sensor with a small activation distance prevents the per-cell
  // click-to-edit affordance (Session 2) from being hijacked by a drag
  // gesture on the row's drag handle. Without this, a quick click on the
  // handle would start a 0px drag instead of just being ignored.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  // P-46 Workstream 3 Session 1 — filter the column registry by the
  // visibility map. Missing keys default to visible (matches
  // ColumnVisibilityBar's isColumnVisible).
  // P-54 Phase 3 — apply the shared arranged column order to the registry
  // FIRST, then filter by visibility. Columns absent from columnOrder fall back
  // to registry order (appended), so newly added columns never disappear.
  // P-54 Phase 5 — build the physical render columns: the fixed registry
  // columns PLUS the dynamic content/image/video category column-pairs derived
  // from the captured items on the (platform-scoped) rows. Dynamic VALUE keys
  // are the orderable units (the analysis column is glued to the right of its
  // value column); only value keys ride in the saved columnOrder. The whole
  // model collapses to exactly the Phase 1-4 fixed columns when there is no
  // captured content, so the flat table is byte-for-byte unchanged then.
  const {
    physicalColumns,
    orderedUnitKeys,
    headerSortableItems,
    columnKeySet,
    hasDynColumns,
  } = useMemo(() => {
    // 1. Distinct categories present per kind, across the platform-scoped set
    //    (so a search-box narrow doesn't make columns appear/disappear).
    const catsByKind: Record<CapturedKind, string[]> = {
      text: [],
      image: [],
      video: [],
    };
    for (const kind of CAPTURED_KINDS) {
      const items: DynCapturedItem[] = [];
      for (const r of scopeRows) {
        const bucket = r.captures?.[kind];
        if (bucket) items.push(...bucket);
      }
      catsByKind[kind] = collectCategories(items);
    }
    const pairs = buildDynamicColumnPairs(catsByKind);
    const dynValueKeys = pairs.map((p) => p.valueKey);

    // 2. Orderable units = fixed columns + dynamic value keys.
    type Unit = { key: string; fixed?: ColumnDef; pair?: DynColumnPair };
    const units: Unit[] = [
      ...COLUMNS.map((c) => ({ key: c.key as string, fixed: c })),
      ...pairs.map((p) => ({ key: p.valueKey, pair: p })),
    ];
    const effectiveOrder =
      columnOrder && columnOrder.length > 0
        ? // P-55 Phase 1 — splice the dynamic value keys in first, THEN splice any
          // newly-introduced fixed column (the Overall Competitor Analysis column)
          // before 'Added On', so it lands just left of Added On for users whose
          // saved order predates it (instead of being appended at the far right).
          withMissingKeysBefore(
            withDynamicKeysInOrder(columnOrder, dynValueKeys),
            COLUMNS.map((c) => c.key as string),
            'addedAt'
          )
        : defaultUnitOrder(dynValueKeys);
    const orderedUnits = applyColumnOrder(units, effectiveOrder, (u) => u.key);

    // 3. Visibility filter — fixed columns by their own key (missing ⇒ shown);
    //    dynamic columns by the per-kind group checkbox (missing ⇒ shown).
    const visibleUnits = orderedUnits.filter((u) => {
      if (u.fixed) {
        if (!columnVisibility) return true;
        return u.key in columnVisibility ? columnVisibility[u.key] : true;
      }
      const visKey = KIND_GROUP_VIS_KEY[u.pair!.kind];
      return columnVisibility && visKey in columnVisibility
        ? columnVisibility[visKey]
        : true;
    });

    // 4. Expand visible units into physical columns (dyn unit ⇒ value + analysis).
    const phys: PhysicalColumn[] = [];
    for (const u of visibleUnits) {
      if (u.fixed) {
        phys.push({ kind: 'fixed', physKey: u.key, col: u.fixed });
      } else {
        const p = u.pair!;
        phys.push({
          kind: 'dyn',
          physKey: p.valueKey,
          orderKey: p.valueKey,
          role: 'value',
          capturedKind: p.kind,
          category: p.category,
          label: p.valueLabel,
        });
        phys.push({
          kind: 'dyn',
          physKey: p.analysisKey,
          orderKey: p.valueKey,
          role: 'analysis',
          capturedKind: p.kind,
          category: p.category,
          label: p.analysisLabel,
        });
      }
    }

    return {
      physicalColumns: phys,
      // Full arranged order (incl. hidden) for moveColumnKey persistence.
      orderedUnitKeys: orderedUnits.map((u) => u.key),
      // Draggable header ids = the VISIBLE units (fixed keys + dyn value keys).
      headerSortableItems: visibleUnits.map((u) => u.key),
      // Discriminator for handleDragEnd: every orderable column id.
      columnKeySet: new Set<string>(units.map((u) => u.key)),
      hasDynColumns: phys.some((p) => p.kind === 'dyn'),
    };
  }, [scopeRows, columnOrder, columnVisibility]);

  // P-54 Phase 1 (R1) — the rightmost VISIBLE physical column. The table's
  // far-right edge (the trailing row-actions column) carries a resize grip that
  // resizes THIS column. Recomputed from physicalColumns so it tracks the last
  // column after show/hide + reorder + dynamic-column changes.
  const lastPhysicalColumn =
    physicalColumns.length > 0
      ? physicalColumns[physicalColumns.length - 1]
      : null;

  // P-46 Workstream 3 Session 2 — per-column inline-editor cell renderers.
  // Each renderer returns a <td> containing the appropriate InlineCells
  // component wired to onCellSave with the right field key. SortableUrlRow
  // renders these for the FIXED physical columns (P-54 Phase 5 wraps them with
  // rowSpan when a row stacks dynamic-column sub-rows); visibility decisions
  // happen during physical-column construction, not per-cell.
  const cellRenderers = useMemo<
    Record<ColumnSortKey, (row: CompetitorUrl) => React.ReactNode>
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
      // 2026-05-24 fix-forward #4 — Platform column at the very left.
      // Read-only display of the friendly label (matches addedAt's
      // read-only precedent — the platform value is set at capture time
      // by the extension or by the manual-add modal's platform selector;
      // changing it on an existing URL is rare enough to leave as a
      // future enhancement rather than an inline-edit affordance).
      platform: (row) => (
        <td key="platform" style={cellStyle('left')}>
          <span style={{ color: '#c9d1d9' }}>
            {PLATFORM_LABELS[row.platform as keyof typeof PLATFORM_LABELS] ??
              row.platform ??
              '—'}
          </span>
        </td>
      ),
      // 2026-05-24 fix-forward #5 — Status cell uses click-to-cycle
      // (toggle INCOMPLETE ↔ COMPLETE on a single click) instead of the
      // dropdown picker InlineEnumCell would render. Two-value enum →
      // cycle is the cheapest motion. The PATCH itself is unchanged so
      // the bidirectional mirror with the URL detail page's Scraping
      // Status toggle (per §A.8) still works for free.
      scrapingStatus: (row) => (
        <td key="scrapingStatus" style={cellStyle('left')}>
          <StatusCycleCell row={row} onCellSave={onCellSave} />
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
          {/* 2026-05-24 fix-forward #3 — ↗ Open button embedded on the
              right side of the Product Name cell per director's
              directive. The cell remains click-to-edit (InlineTextCell
              still fills the cell); only the ↗ button navigates. The
              button's onClick stops propagation so it doesn't trigger
              the cell's edit-mode click. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <InlineTextCell
                value={row.productName}
                onSave={(next) => onCellSave(row.id, { productName: next })}
                placeholder="Set product name"
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRowOpen(row.id);
              }}
              aria-label={`Open detail page for ${row.url}`}
              title="Open detail page"
              data-testid="url-row-open-button"
              style={inlineProductNameOpenButtonStyle}
            >
              ↗
            </button>
          </div>
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
      // P-55 Phase 1 (2026-06-01) — Overall Competitor Analysis. A click-to-open
      // pop-out rich-text editor (same surface as the detail page's box) that
      // saves the URL row's overallCompetitorAnalysis through the urls/[urlId]
      // PATCH route. Mirrors the dynamic "Your Analysis" pop-out (DynAnalysisCell)
      // for visual + interaction consistency on the same table.
      overallCompetitorAnalysis: (row) => (
        <td key="overallCompetitorAnalysis" style={overallAnalysisCellTdStyle}>
          <OverallAnalysisCell projectId={projectId} row={row} />
        </td>
      ),
    }),
    [onCellSave, onRowOpen, projectId]
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
    // P-46 Workstream 3 Session 3 — manual sort mode: respect the user's
    // drag-to-reorder result. IDs not yet in rowOrder (newly-added rows
    // since the last drag) get appended in addedAt-desc order so they
    // don't disappear.
    if (sortKey === 'manual') {
      const orderIndex = new Map<string, number>();
      effectiveRowOrder.forEach((id, i) => orderIndex.set(id, i));
      const copy = [...filtered];
      copy.sort((a, b) => {
        const ai = orderIndex.get(a.id);
        const bi = orderIndex.get(b.id);
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1; // a is ordered, b is not — a first
        if (bi !== undefined) return 1; // b is ordered, a is not — b first
        // Neither is in rowOrder — fall back to addedAt-desc.
        return b.addedAt.localeCompare(a.addedAt);
      });
      return copy;
    }
    const copy = [...filtered];
    copy.sort((a, b) => {
      // P-55 Phase 1 — Overall Competitor Analysis is a TipTap doc object;
      // compare by its flattened plain text so the sort is meaningful (the
      // generic branch below would stringify every doc to "[object Object]").
      if (sortKey === 'overallCompetitorAnalysis') {
        const cmp = tiptapToPlainText(a.overallCompetitorAnalysis).localeCompare(
          tiptapToPlainText(b.overallCompetitorAnalysis)
        );
        return sortDir === 'asc' ? cmp : -cmp;
      }
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
  }, [filtered, sortKey, sortDir, effectiveRowOrder]);

  const handleSortClick = (col: ColumnDef): void => {
    if (col.key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir(col.defaultDir);
    }
  };

  // P-54 Phase 4 (2026-06-01) — "Sort By" grouping. When a grouping mode is
  // active, re-bucket the ALREADY-SORTED rows into banner groups (so the active
  // column-sort / manual row order flows through as the within-group order).
  // groupBy === 'none'/undefined → flat table (groups === null), rendered
  // exactly as before so Phases 1-3 are untouched.
  const activeGroupMode: ActiveGroupMode | null =
    groupBy && groupBy !== 'none' ? groupBy : null;
  const groups = useMemo<MainGroup<CompetitorUrl>[] | null>(() => {
    if (!activeGroupMode) return null;
    return buildMainGroupedRows(sorted, activeGroupMode, {
      groupOrder: groupOrder?.[activeGroupMode],
      platformLabels: PLATFORM_LABELS,
    });
  }, [activeGroupMode, sorted, groupOrder]);
  // url id → its banner group key (for cross-group drop rejection + retargeting
  // a banner drop onto a row).
  const urlIdToGroupKey = useMemo(() => {
    const map = new Map<string, string>();
    if (groups) {
      for (const g of groups) for (const r of g.rows) map.set(r.id, g.key);
    }
    return map;
  }, [groups]);

  // P-46 Workstream 3 Session 3 — drop handler for dnd-kit's DndContext.
  // Computes the new id order from the current sorted display, persists it
  // via the parent's debounced PUT, and flips sortKey into 'manual' so the
  // user-imposed order sticks visually instead of being immediately re-
  // overwritten by the active column sort.
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // P-54 Phase 3 — the ONE DndContext serves two sortable axes: row reorder
    // (vertical, ids = competitorUrlIds) and column reorder (horizontal, ids =
    // column keys). Discriminate by whether the dragged id is a known column
    // key, and only act when BOTH ends are the same kind (so a stray
    // cross-axis collision is a no-op).
    const activeIsColumn = columnKeySet.has(activeId);
    const overIsColumn = columnKeySet.has(overId);
    if (activeIsColumn || overIsColumn) {
      if (!activeIsColumn || !overIsColumn) return;
      // Move within the FULL arranged unit order (incl. hidden columns + the
      // dynamic value keys) so the persisted order is complete and hidden
      // columns keep their slots. Only value keys are orderable units, so a
      // category column drags its glued analysis column with it (locked pair).
      const nextColumnOrder = moveColumnKey(orderedUnitKeys, activeId, overId);
      onColumnReorder?.(nextColumnOrder);
      return;
    }

    // P-54 Phase 4 — when grouped, the SAME DndContext also serves two more
    // axes: banner reorder (ids prefixed `grp:`) and within-group row reorder.
    if (activeGroupMode && groups) {
      if (activeId.startsWith(GROUP_DRAG_PREFIX)) {
        // Banner drag — drop onto another banner OR any row (whose group we map
        // to). Reuses applyCategoryDrag over the saved per-mode banner order;
        // the pinned-last empty bucket is excluded from the displayed keys so
        // it can never be reordered.
        const activeKey = activeId.slice(GROUP_DRAG_PREFIX.length);
        const targetKey = overId.startsWith(GROUP_DRAG_PREFIX)
          ? overId.slice(GROUP_DRAG_PREFIX.length)
          : urlIdToGroupKey.get(overId);
        if (!targetKey) return;
        const next = applyCategoryDrag(
          groupOrder?.[activeGroupMode] ?? [],
          reorderableGroupKeys(groups),
          activeKey,
          targetKey
        );
        onGroupReorder?.(activeGroupMode, next);
        return;
      }
      // Row drag while grouped — only reorder when both ends are rows in the
      // SAME group (dropping onto a banner or across groups is a no-op).
      if (overId.startsWith(GROUP_DRAG_PREFIX)) return;
      if (urlIdToGroupKey.get(activeId) !== urlIdToGroupKey.get(overId)) return;
      const displayedUrlIds = groups.flatMap((g) => g.rows.map((r) => r.id));
      const nextOrder = applyCompetitorDrag(
        effectiveRowOrder,
        displayedUrlIds,
        activeId,
        overId
      );
      onRowReorder?.(nextOrder);
      // Flip to manual so the new within-group order sticks even if a column
      // sort was active (matches the flat-table drag behavior).
      setSortKey('manual');
      return;
    }

    const oldIndex = sorted.findIndex((r) => r.id === activeId);
    const newIndex = sorted.findIndex((r) => r.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const newDisplayedOrder = arrayMove(sorted, oldIndex, newIndex).map(
      (r) => r.id
    );
    // Preserve any ids that exist in the prior rowOrder but aren't in the
    // current sorted set (e.g., rows filtered out by the search box) by
    // tucking them at the end of the new order in their prior order.
    const displayedSet = new Set(newDisplayedOrder);
    const tail = effectiveRowOrder.filter((id) => !displayedSet.has(id));
    const nextOrder = [...newDisplayedOrder, ...tail];
    onRowReorder?.(nextOrder);
    setSortKey('manual');
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
        {/* 2026-05-24 fix-forward (Issue 4) — text-size stepper relocated
            from ColumnVisibilityBar to the data table's toolbar. Director's
            directive: "Just put the +/- symbols at the top right of the
            data table because only that data needs to be adjusted in font
            size." No numeric value, no label — just two buttons. */}
        {onFontSizeChange ? (
          <div
            style={fontSizeStepperStyle}
            data-testid="font-size-stepper"
            aria-label="Adjust table text size"
          >
            <button
              type="button"
              onClick={() =>
                onFontSizeChange(Math.max(FONT_SIZE_MIN, effectiveFontSize - 1))
              }
              disabled={effectiveFontSize <= FONT_SIZE_MIN}
              style={fontSizeStepperButtonStyle(
                effectiveFontSize <= FONT_SIZE_MIN
              )}
              aria-label="Decrease text size"
              title="Smaller text"
            >
              −
            </button>
            <button
              type="button"
              onClick={() =>
                onFontSizeChange(Math.min(FONT_SIZE_MAX, effectiveFontSize + 1))
              }
              disabled={effectiveFontSize >= FONT_SIZE_MAX}
              style={fontSizeStepperButtonStyle(
                effectiveFontSize >= FONT_SIZE_MAX
              )}
              aria-label="Increase text size"
              title="Larger text"
            >
              +
            </button>
          </div>
        ) : null}
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
        <div
          style={{
            /* P-54 Phase 2 (R2+R4, 2026-06-01) — the table is NO LONGER in a
               separate inner scroll box. Per director's directive "the page
               scrolls themselves should suffice … this way the table can be
               expanded into the page," the WHOLE PAGE now scrolls for BOTH
               axes via the browser's own scrollbars: vertical = window
               scroll; horizontal = the window's own bottom scrollbar (fixed
               at the window bottom, reachable at any scroll position). The
               prior 2026-05-24 inner `overflow:auto` + `maxHeight` container
               trapped the table and is removed — which also lets dragging the
               last column's right edge (P-54 Phase 1 R1) expand the table into
               the page. The <thead> below stays `position:sticky; top:0`; with
               no overflow ancestor it now sticks to the TOP OF THE WINDOW, so
               the column titles stay visible as the user scrolls down (header
               pinned per director's 2026-06-01 pick).

               P-54 Phase 2 FF1 (2026-06-01) — director report: the wide table
               wasn't extending the page's scrollable width past its own right
               edge, and the last column's right edge sat flush against the
               page edge with no room to grab/drag it. Fix: this wrapper now
               SHRINK-WRAPS to the table's true content width (`width:
               max-content`) — so it overflows the viewport and the window
               horizontal scrollbar reliably reaches the full table — PLUS a
               `paddingRight` trailing gap so there is clear empty space to the
               right of the last column's resize grip (separated from the page
               edge / right scrollbar), making the draggable edge obvious and
               giving room to drag it wider. `minWidth:100%` keeps the table at
               least viewport-wide when there are few columns. `position:
               relative` is retained as a harmless containing-block anchor;
               `width:max-content` does NOT establish a scroll container, so
               viewport-sticky on the header still works. */
            position: 'relative',
            width: 'max-content',
            minWidth: '100%',
            paddingRight: '48px',
            boxSizing: 'content-box',
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            // P-54 Phase 4 — when grouped, a banner can be many rows tall so its
            // sibling banners often sit below the fold. Re-measure droppables
            // every frame so rows the window auto-scroll reveals register as
            // valid drop targets (the proven By-Category two-level-drag config).
            // Flat mode keeps dnd-kit's defaults so Phases 1-3 are untouched.
            measuring={
              activeGroupMode
                ? { droppable: { strategy: MeasuringStrategy.Always } }
                : undefined
            }
            autoScroll={
              activeGroupMode
                ? { threshold: { x: 0, y: 0.25 }, acceleration: 15 }
                : undefined
            }
          >
            <table
                ref={tableRef}
                style={{
                  /* 2026-05-24 fix-forward (Issue 3); P-54 Phase 2 update
                     (2026-06-01) — table sizes to the sum of column widths
                     (NOT 100% of container). With the inner scroll box now
                     removed (Phase 2), when the column-width sum exceeds the
                     viewport the table overflows into the PAGE, so the
                     browser's own horizontal (window) scrollbar handles
                     left-right scrolling. The minWidth keeps the table from
                     collapsing narrower than its container when there are
                     few columns. */
                  width: 'max-content',
                  minWidth: '100%',
                  borderCollapse: 'collapse',
                  fontSize: `${effectiveFontSize}px`,
                  tableLayout: 'fixed',
                }}
              >
                <colgroup>
                  {/* Drag-handle column (Session 3) */}
                  <col style={{ width: '32px' }} />
                  {physicalColumns.map((pc) => (
                    <col
                      key={pc.physKey}
                      style={{
                        width: `${physicalColumnWidth(
                          effectiveColumnWidths,
                          pc
                        )}px`,
                      }}
                    />
                  ))}
                  {/* Actions column — trash only since fix-forward #3
                      moved the ↗ Open button into the Product Name cell. */}
                  <col style={{ width: '52px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      style={{ ...dragHandleHeaderStyle, ...stickyHeaderStyle }}
                      aria-label="Reorder rows"
                    />
                    {/* P-54 Phase 3 — column headers are a horizontal sortable
                        list (drag a header's grip to reorder columns). Shares
                        the one DndContext with the vertical row-reorder list;
                        handleDragEnd discriminates by id. */}
                    <SortableContext
                      items={headerSortableItems}
                      strategy={horizontalListSortingStrategy}
                    >
                      {physicalColumns.map((pc) => {
                        // P-54 Phase 5 — the glued analysis column is a plain,
                        // NON-draggable header that rides to the right of its
                        // value column (locked pair); the value column + the
                        // fixed columns are the draggable, orderable headers.
                        if (pc.kind === 'dyn' && pc.role === 'analysis') {
                          return (
                            <DynAnalysisHeaderCell
                              key={pc.physKey}
                              label={pc.label}
                              resizeNode={
                                <ColumnResizeHandle
                                  columnId={pc.physKey}
                                  currentWidth={resolveDynWidth(
                                    effectiveColumnWidths,
                                    pc.physKey,
                                    'analysis'
                                  )}
                                  minWidth={MIN_COLUMN_WIDTH}
                                  maxWidth={MAX_COLUMN_WIDTH}
                                  tableHeight={tableHeight}
                                  onCommit={(width) =>
                                    onColumnResize?.(pc.physKey, width)
                                  }
                                />
                              }
                            />
                          );
                        }
                        if (pc.kind === 'dyn') {
                          return (
                            <DynValueHeaderCell
                              key={pc.physKey}
                              id={pc.orderKey}
                              label={pc.label}
                              resizeNode={
                                <ColumnResizeHandle
                                  columnId={pc.physKey}
                                  currentWidth={resolveDynWidth(
                                    effectiveColumnWidths,
                                    pc.physKey,
                                    'value'
                                  )}
                                  minWidth={MIN_COLUMN_WIDTH}
                                  maxWidth={MAX_COLUMN_WIDTH}
                                  tableHeight={tableHeight}
                                  onCommit={(width) =>
                                    onColumnResize?.(pc.physKey, width)
                                  }
                                />
                              }
                            />
                          );
                        }
                        const col = pc.col;
                        const active = sortKey === col.key;
                        const filterActive =
                          col.filterKey !== null &&
                          isColumnFilterActive(filters, col.filterKey);
                        return (
                          <SortableHeaderCell
                            key={col.key}
                            col={col}
                            active={active}
                            sortDir={sortDir}
                            filterActive={filterActive}
                            onSortClick={() => handleSortClick(col)}
                            filterNode={
                              col.filterKey !== null ? (
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
                              ) : null
                            }
                            resizeNode={
                              <ColumnResizeHandle
                                columnId={col.key}
                                currentWidth={resolveColumnWidth(
                                  effectiveColumnWidths,
                                  tableColumnDefByKey(col.key)
                                )}
                                minWidth={MIN_COLUMN_WIDTH}
                                maxWidth={MAX_COLUMN_WIDTH}
                                tableHeight={tableHeight}
                                onCommit={(width) =>
                                  onColumnResize?.(col.key, width)
                                }
                              />
                            }
                          />
                        );
                      })}
                    </SortableContext>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '8px 10px',
                        borderBottom: '1px solid #30363d',
                        color: '#8b949e',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        ...stickyHeaderStyle,
                      }}
                      aria-label="Row actions"
                    >
                      {/* Actions column — trash only since fix-forward #3
                          moved the ↗ Open button into the Product Name cell. */}
                      {/* P-54 Phase 1 (R1, 2026-06-01) — resize grip on the
                          table's far-right edge (right:0 of this sticky
                          trailing th = the table's right border). It resizes
                          the LAST VISIBLE DATA column. Previously the table's
                          outer right edge had no grip — the last data column
                          could only be resized via its inter-column grip to
                          the LEFT of this narrow actions column, so dragging
                          the table's right edge did nothing (director report
                          2026-06-01). Grip tracks the last column dynamically
                          so it stays correct after column show/hide + (future)
                          reorder. */}
                      {lastPhysicalColumn ? (
                        <ColumnResizeHandle
                          columnId={lastPhysicalColumn.physKey}
                          currentWidth={physicalColumnWidth(
                            effectiveColumnWidths,
                            lastPhysicalColumn
                          )}
                          minWidth={MIN_COLUMN_WIDTH}
                          maxWidth={MAX_COLUMN_WIDTH}
                          tableHeight={tableHeight}
                          onCommit={(width) =>
                            onColumnResize?.(lastPhysicalColumn.physKey, width)
                          }
                        />
                      ) : null}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups === null ? (
                    /* Flat (ungrouped) — UNCHANGED from Phase 3: one vertical
                       sortable list over all rows. */
                    <SortableContext
                      items={sorted.map((r) => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {sorted.map((row) => (
                        <SortableUrlRow
                          key={row.id}
                          row={row}
                          physicalColumns={physicalColumns}
                          hasDynColumns={hasDynColumns}
                          cellRenderers={cellRenderers}
                          onTrashClick={handleTrashClick}
                          projectId={projectId}
                          onCapturedSave={onCapturedSave}
                        />
                      ))}
                    </SortableContext>
                  ) : (
                    /* Grouped (P-54 Phase 4) — two-level drag: an outer vertical
                       sortable list of banner rows + a per-group inner vertical
                       sortable list of competitor rows. Mirrors the By-Category
                       / By-Type pages. The empty bucket's banner is not
                       draggable (pinned last). */
                    <SortableContext
                      items={reorderableGroupKeys(groups).map(groupDragId)}
                      strategy={verticalListSortingStrategy}
                    >
                      {groups.map((group) => (
                        <Fragment key={group.key || '__bucket__'}>
                          <GroupBannerRow
                            group={group}
                            labelColSpan={physicalColumns.length + 1}
                          />
                          <SortableContext
                            items={group.rows.map((r) => r.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {group.rows.map((row) => (
                              <SortableUrlRow
                                key={row.id}
                                row={row}
                                physicalColumns={physicalColumns}
                                hasDynColumns={hasDynColumns}
                                cellRenderers={cellRenderers}
                                onTrashClick={handleTrashClick}
                                projectId={projectId}
                                onCapturedSave={onCapturedSave}
                              />
                            ))}
                          </SortableContext>
                        </Fragment>
                      ))}
                    </SortableContext>
                  )}
                </tbody>
              </table>
          </DndContext>
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

// 2026-05-24 fix-forward #3 — small ↗ Open button that lives inside the
// Product Name cell (right side). Compact width so it doesn't crowd the
// text; same blue accent as the prior row-actions ↗ for visual continuity.
// Flex-shrink: 0 keeps the icon visible even when product names are long.
const inlineProductNameOpenButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#58a6ff',
  fontSize: '13px',
  lineHeight: '13px',
  cursor: 'pointer',
  padding: '2px 6px',
  flexShrink: 0,
  fontFamily: 'inherit',
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

// P-54 Phase 3 (2026-06-01) — a draggable column-header cell. Only the small
// grip (⠿) carries the dnd-kit listeners, so click-to-sort, the filter
// popover, and the resize grip all stay conflict-free. The cell stays
// position:sticky so the header pins to the window on vertical scroll (Phase 2);
// the dnd transform offsets it horizontally only while actively dragging.
const columnDragGripStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#484f58',
  cursor: 'grab',
  padding: '0 2px',
  fontSize: '11px',
  lineHeight: 1,
  touchAction: 'none',
  userSelect: 'none',
};

function SortableHeaderCell({
  col,
  active,
  sortDir,
  filterActive,
  onSortClick,
  filterNode,
  resizeNode,
}: {
  col: ColumnDef;
  active: boolean;
  sortDir: 'asc' | 'desc';
  filterActive: boolean;
  onSortClick: () => void;
  filterNode: React.ReactNode;
  resizeNode: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: col.key });
  const arrow = !active ? '' : sortDir === 'asc' ? ' ▲' : ' ▼';
  return (
    <th
      ref={setNodeRef}
      aria-sort={
        active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
      }
      style={{
        textAlign: col.align ?? 'left',
        padding: '8px 10px',
        borderBottom: '1px solid #30363d',
        color: active || filterActive ? '#e6edf3' : '#8b949e',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: isDragging ? 6 : 3,
        background: '#0d1117',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <span
        style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}
      >
        <button
          type="button"
          aria-label={`Drag to reorder ${col.label} column`}
          {...attributes}
          {...listeners}
          style={columnDragGripStyle}
        >
          ⠿
        </button>
        <button
          type="button"
          onClick={onSortClick}
          style={sortLabelStyle}
          aria-label={`Sort by ${col.label}`}
        >
          {col.label}
          <span style={{ color: '#1f6feb' }}>{arrow}</span>
        </button>
        {filterNode}
      </span>
      {resizeNode}
    </th>
  );
}

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

// 2026-05-24 fix-forward (Issue 4) — compact +/- font-size stepper at the
// far right of the toolbar. No numeric value, no label per director's
// directive. Buttons match the search box's GitHub-dark palette so the
// toolbar reads as one row.
const fontSizeStepperStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '2px',
  marginLeft: 'auto',
};

function fontSizeStepperButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    color: disabled ? '#484f58' : '#c9d1d9',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '14px',
    width: '24px',
    height: '24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    borderRadius: '4px',
    fontFamily: 'inherit',
  };
}

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

// P-46 Workstream 3 Session 3 — resolve a column id to its registry entry
// for resolveColumnWidth. The local COLUMNS array is a richer
// (sort + filter aware) wrapper around the same ids; the width resolver
// only needs the id + defaultWidth.
function tableColumnDefByKey(key: ColumnSortKey) {
  const def = TABLE_COLUMN_DEFS.find((c) => c.id === key);
  if (!def) {
    // Defensive — the COLUMNS array and TABLE_COLUMN_DEFS are kept in
    // lockstep; this would only fire if someone added a column to the
    // local sort registry without registering it in the canonical one.
    return { id: key, label: key, dataType: 'text' as const, defaultWidth: 140 };
  }
  return def;
}

// 2026-05-24 fix-forward #5 — click-to-cycle Status cell. Two-value
// enum (INCOMPLETE / COMPLETE) → one click flips to the other value
// via the same PATCH lifecycle the dropdown previously used. Optimistic
// update means the pill flips colors instantly while the network
// round-trip resolves; failures roll back the optimistic value + show
// an inline error message. The PATCH itself targets the same
// CompetitorUrl.scrapingStatus field the URL detail page's
// EditableEnumField toggle writes to, so the bidirectional mirror
// established in Workstream 2 Session 5 (§A.8) still works.
function StatusCycleCell({
  row,
  onCellSave,
}: {
  row: CompetitorUrl;
  onCellSave: (
    urlId: string,
    patch: UpdateCompetitorUrlRequest
  ) => Promise<void>;
}) {
  const [optimistic, setOptimistic] = useState<ScrapingStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayed: ScrapingStatus = optimistic ?? row.scrapingStatus;
  const next: ScrapingStatus =
    displayed === 'COMPLETE' ? 'INCOMPLETE' : 'COMPLETE';
  const label = displayed === 'COMPLETE' ? 'Complete' : 'Incomplete';

  const handleClick = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (saving) return;
    setOptimistic(next);
    setSaving(true);
    setErrorMessage(null);
    try {
      await onCellSave(row.id, { scrapingStatus: next });
      setOptimistic(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Save failed');
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <button
        type="button"
        onClick={handleClick}
        title={`Click to mark ${next === 'COMPLETE' ? 'Complete' : 'Incomplete'}`}
        disabled={saving}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: saving ? 'wait' : 'pointer',
          opacity: saving ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
        data-testid="status-cycle-button"
      >
        <span style={scrapingStatusBadgeStyle(displayed)}>{label}</span>
      </button>
      {errorMessage ? (
        <span style={{ fontSize: '11px', color: '#f85149' }}>
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}

// P-46 Workstream 3 Session 3 — sortable row wrapper. Each row gets a
// dnd-kit useSortable hook + a leading drag-handle cell. The drag handle
// receives the listeners; the rest of the row is normal click-to-edit
// surface so cell-clicks aren't hijacked by drag activation.
function SortableUrlRow({
  row,
  physicalColumns,
  hasDynColumns,
  cellRenderers,
  onTrashClick,
  projectId,
  onCapturedSave,
}: {
  row: CompetitorUrl;
  physicalColumns: PhysicalColumn[];
  hasDynColumns: boolean;
  cellRenderers: Record<ColumnSortKey, (row: CompetitorUrl) => React.ReactNode>;
  onTrashClick: (row: CompetitorUrl, e: React.MouseEvent) => void;
  projectId: string;
  onCapturedSave?: (
    kind: CapturedKind,
    itemId: string,
    patch: { body?: string | null; analysis?: Record<string, unknown> }
  ) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  // P-54 Phase 5 — per dynamic VALUE column, the captured items of this row in
  // that column's category. The analysis column reuses its pair's value items
  // (keyed by orderKey). span = the longest stacked list (min 1). When no
  // dynamic columns are present the span is 1 and the row renders exactly the
  // Phase 1-4 single <tr> (the fast path below).
  const itemsByOrderKey = new Map<string, DynCapturedItem[]>();
  if (hasDynColumns) {
    for (const pc of physicalColumns) {
      if (pc.kind === 'dyn' && pc.role === 'value') {
        const bucket = row.captures?.[pc.capturedKind] ?? [];
        itemsByOrderKey.set(
          pc.orderKey,
          itemsForCategory(bucket, pc.capturedKind, pc.category)
        );
      }
    }
  }
  const span = hasDynColumns
    ? subRowSpan(Array.from(itemsByOrderKey.values()))
    : 1;

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#21262d' : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const dragHandleCell = (
    <td rowSpan={span} style={{ ...dragHandleCellStyle, verticalAlign: 'top' }}>
      <button
        type="button"
        {...listeners}
        style={dragHandleButtonStyle}
        aria-label={`Drag to reorder ${row.url}`}
        title="Drag to reorder"
        data-testid="url-row-drag-handle"
      >
        ⋮⋮
      </button>
    </td>
  );

  const trashCell = (
    <td
      rowSpan={span}
      style={{
        textAlign: 'right',
        padding: '4px 6px',
        whiteSpace: 'nowrap',
        verticalAlign: 'top',
      }}
    >
      <button
        type="button"
        onClick={(e) => onTrashClick(row, e)}
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
  );

  return (
    <>
      {Array.from({ length: span }).map((_, i) => {
        const isFirst = i === 0;
        const isLast = i === span - 1;
        return (
          <tr
            key={isFirst ? row.id : `${row.id}-sub-${i}`}
            ref={isFirst ? setNodeRef : undefined}
            style={{
              ...dragStyle,
              borderBottom: isLast ? '1px solid #21262d' : undefined,
            }}
            {...(isFirst ? attributes : {})}
          >
            {isFirst ? dragHandleCell : null}
            {physicalColumns.map((pc) => {
              if (pc.kind === 'fixed') {
                // Fixed columns span the whole stacked block — rendered once on
                // the first sub-row with rowSpan. When span === 1 the existing
                // cell is returned verbatim (Phases 1-4 byte-for-byte unchanged).
                if (!isFirst) return null;
                const cell = cellRenderers[pc.col.key](row);
                if (span === 1 || !isValidElement(cell)) return cell;
                const el = cell as ReactElement<{ style?: React.CSSProperties }>;
                return cloneElement(el, {
                  rowSpan: span,
                  style: { ...(el.props.style ?? {}), verticalAlign: 'top' },
                } as Partial<{ style?: React.CSSProperties }> & { rowSpan: number });
              }
              // Dynamic column — one cell PER sub-row (rowSpan 1); sub-row i
              // shows item i (or a blank placeholder past the end of the list).
              const items = itemsByOrderKey.get(pc.orderKey) ?? [];
              const item = items[i] ?? null;
              return (
                <DynCell
                  key={pc.physKey}
                  pc={pc}
                  item={item}
                  projectId={projectId}
                  onCapturedSave={onCapturedSave}
                  isLastSub={isLast}
                />
              );
            })}
            {isFirst ? trashCell : null}
          </tr>
        );
      })}
    </>
  );
}

// P-54 Phase 5 — base style for a dynamic category / analysis cell. Top-aligned
// + wrapping (these cells hold multi-line captured text / analysis, unlike the
// nowrap fixed cells), with a thin separator between stacked sub-rows.
function dynCellStyle(isLastSub: boolean): React.CSSProperties {
  return {
    padding: '6px 10px',
    color: '#c9d1d9',
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    borderBottom: isLastSub ? undefined : '1px solid #161b22',
  };
}

const dynEmptyStyle: React.CSSProperties = {
  color: '#484f58',
  fontStyle: 'italic',
  fontSize: '0.9em',
};

function DynCell({
  pc,
  item,
  projectId,
  onCapturedSave,
  isLastSub,
}: {
  pc: DynPhysicalColumn;
  item: DynCapturedItem | null;
  projectId: string;
  onCapturedSave?: (
    kind: CapturedKind,
    itemId: string,
    patch: { body?: string | null; analysis?: Record<string, unknown> }
  ) => Promise<void>;
  isLastSub: boolean;
}) {
  return (
    <td style={dynCellStyle(isLastSub)}>
      {item === null ? (
        <span style={dynEmptyStyle} aria-hidden>
          —
        </span>
      ) : pc.role === 'analysis' ? (
        <DynAnalysisCell
          kind={pc.capturedKind}
          item={item}
          projectId={projectId}
        />
      ) : (
        <DynValueCell
          kind={pc.capturedKind}
          item={item}
          onCapturedSave={onCapturedSave}
        />
      )}
    </td>
  );
}

// The captured/embedded-text VALUE cell — plain text, edited inline (reusing
// InlineTextCell, multiline). Saves back through onCapturedSave → the per-item
// PATCH route. Read-only when no save handler is wired.
function DynValueCell({
  kind,
  item,
  onCapturedSave,
}: {
  kind: CapturedKind;
  item: DynCapturedItem;
  onCapturedSave?: (
    kind: CapturedKind,
    itemId: string,
    patch: { body?: string | null; analysis?: Record<string, unknown> }
  ) => Promise<void>;
}) {
  if (!onCapturedSave) {
    return <span>{item.body ?? <span style={dynEmptyStyle}>—</span>}</span>;
  }
  return (
    <InlineTextCell
      value={item.body}
      onSave={(next) => onCapturedSave(kind, item.id, { body: next })}
      placeholder="Set text"
      multiline
    />
  );
}

const CAPTURED_ROUTE_SEGMENT: Record<CapturedKind, string> = {
  text: 'text',
  image: 'images',
  video: 'videos',
};

// The "Your Analysis" cell — a tidy plain-text preview that opens the SAME
// rich-text editor surface as the detail page in a pop-out (Q-I = pop-out
// editor). PerItemAnalysisBox owns the debounced PATCH + retry; the in-table
// preview refreshes via the page's refetch-on-return (D4).
function DynAnalysisCell({
  kind,
  item,
  projectId,
}: {
  kind: CapturedKind;
  item: DynCapturedItem;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const preview = tiptapToPlainText(item.analysis);
  const apiUrl = `/api/projects/${projectId}/competition-scraping/${CAPTURED_ROUTE_SEGMENT[kind]}/${item.id}`;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={analysisPreviewButtonStyle}
        title="Edit your analysis"
        data-testid="dyn-analysis-open"
      >
        {preview ? (
          <span style={analysisPreviewTextStyle}>{preview}</span>
        ) : (
          <span style={dynEmptyStyle}>+ Add analysis</span>
        )}
      </button>
      {open ? (
        <div
          style={analysisOverlayStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Edit your analysis"
          onClick={() => setOpen(false)}
        >
          <div
            style={analysisModalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={analysisModalHeaderStyle}>
              <span style={{ fontWeight: 600, color: '#e6edf3' }}>
                Your Analysis
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={analysisModalCloseStyle}
                aria-label="Close analysis editor"
              >
                Done
              </button>
            </div>
            <PerItemAnalysisBox
              apiUrl={apiUrl}
              initialAnalysis={item.analysis}
              label=""
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

// P-55 Phase 1 — the Overall Competitor Analysis cell. A tidy plain-text
// preview that opens the SAME rich-text editor surface as the detail page's
// "Overall Competitor Analysis" box in a pop-out. OverallAnalysisBox owns the
// debounced PATCH (to the urls/[urlId] route, field overallCompetitorAnalysis)
// + retry; the in-table preview refreshes via the page's refetch-on-return
// (matching the dynamic "Your Analysis" pop-out's behavior on this same table).
function OverallAnalysisCell({
  projectId,
  row,
}: {
  projectId: string;
  row: CompetitorUrl;
}) {
  const [open, setOpen] = useState(false);
  const preview = tiptapToPlainText(row.overallCompetitorAnalysis);
  const apiUrl = `/api/projects/${projectId}/competition-scraping/urls/${row.id}`;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={analysisPreviewButtonStyle}
        title="Edit overall competitor analysis"
        data-testid="overall-analysis-open"
      >
        {preview ? (
          <span style={analysisPreviewTextStyle}>{preview}</span>
        ) : (
          <span style={dynEmptyStyle}>+ Add analysis</span>
        )}
      </button>
      {open ? (
        <div
          style={analysisOverlayStyle}
          role="dialog"
          aria-modal="true"
          aria-label="Edit overall competitor analysis"
          onClick={() => setOpen(false)}
        >
          <div style={analysisModalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={analysisModalHeaderStyle}>
              <span style={{ fontWeight: 600, color: '#e6edf3' }}>
                Overall Competitor Analysis
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={analysisModalCloseStyle}
                aria-label="Close overall competitor analysis editor"
              >
                Done
              </button>
            </div>
            <OverallAnalysisBox
              apiUrl={apiUrl}
              initialContent={row.overallCompetitorAnalysis ?? {}}
              field={{ kind: 'overallCompetitorAnalysis' }}
              label=""
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

// P-55 Phase 1 — the Overall Competitor Analysis cell wraps multi-line preview
// text (3-line clamp), so unlike the nowrap fixed cells it allows wrapping and
// top-aligns. Width is still driven by the column's resolved width.
const overallAnalysisCellTdStyle: React.CSSProperties = {
  padding: '6px 10px',
  color: '#c9d1d9',
  verticalAlign: 'top',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  maxWidth: '420px',
};

// Walk a TipTap document JSON, concatenating its text nodes into a short plain-
// text preview for the analysis cell. Cheap (no editor mount per cell).
function tiptapToPlainText(doc: Record<string, unknown> | null | undefined): string {
  if (!doc || typeof doc !== 'object') return '';
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const n = node as { text?: unknown; content?: unknown };
    if (typeof n.text === 'string') out.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(doc);
  return out.join(' ').trim();
}

const analysisPreviewButtonStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#c9d1d9',
  font: 'inherit',
  cursor: 'pointer',
  padding: '2px 4px',
};

const analysisPreviewTextStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const analysisOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(1, 4, 9, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  padding: '24px',
};

const analysisModalStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '10px',
  padding: '16px',
  width: 'min(720px, 92vw)',
  maxHeight: '85vh',
  overflowY: 'auto',
  boxShadow: '0 16px 48px rgba(1, 4, 9, 0.6)',
};

const analysisModalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const analysisModalCloseStyle: React.CSSProperties = {
  background: '#238636',
  border: '1px solid rgba(240, 246, 252, 0.10)',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 12px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

// P-54 Phase 5 — draggable header for a dynamic VALUE column (the locked-pair
// anchor). Mirrors SortableHeaderCell's grip + sticky behavior but carries no
// sort/filter (the dynamic columns aren't sortable/filterable). The id is the
// value key, so dragging it moves the glued analysis column with it.
function DynValueHeaderCell({
  id,
  label,
  resizeNode,
}: {
  id: string;
  label: string;
  resizeNode: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <th
      ref={setNodeRef}
      style={{
        textAlign: 'left',
        padding: '8px 10px',
        borderBottom: '1px solid #30363d',
        color: '#e6edf3',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: isDragging ? 6 : 3,
        background: '#0d1117',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        <button
          type="button"
          aria-label={`Drag to reorder ${label} column`}
          {...attributes}
          {...listeners}
          style={columnDragGripStyle}
        >
          ⠿
        </button>
        <span>{label}</span>
      </span>
      {resizeNode}
    </th>
  );
}

// P-54 Phase 5 — the glued analysis column header. Not draggable (it rides with
// its value column); still sticky + resizable.
function DynAnalysisHeaderCell({
  label,
  resizeNode,
}: {
  label: string;
  resizeNode: React.ReactNode;
}) {
  return (
    <th
      style={{
        textAlign: 'left',
        padding: '8px 10px',
        borderBottom: '1px solid #30363d',
        color: '#8b949e',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        zIndex: 3,
        background: '#0d1117',
      }}
    >
      <span>{label}</span>
      {resizeNode}
    </th>
  );
}

// P-54 Phase 4 (2026-06-01) — banner row for a "Sort By" group. The group
// label sits on its own shaded row spanning the table; a grip on the left
// drags the whole group to reorder (two-level drag, mirroring the By-Category /
// By-Type pages). The pinned-last empty bucket renders without a grip.
function GroupBannerRow({
  group,
  labelColSpan,
}: {
  group: MainGroup<CompetitorUrl>;
  labelColSpan: number;
}) {
  const draggable = !group.isEmptyBucket;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: groupDragId(group.key), disabled: !draggable });
  const bg = isDragging ? '#1f6feb22' : '#161b22';
  const cellBg: React.CSSProperties = { background: bg };
  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
      }}
      data-testid="url-group-banner-row"
      {...attributes}
    >
      <td style={{ ...dragHandleCellStyle, ...cellBg }}>
        {draggable ? (
          <button
            type="button"
            {...listeners}
            style={dragHandleButtonStyle}
            aria-label={`Drag to reorder the ${group.label} group`}
            title="Drag to reorder group"
            data-testid="url-group-banner-drag-handle"
          >
            ⠿
          </button>
        ) : null}
      </td>
      <td colSpan={labelColSpan} style={{ ...groupBannerLabelStyle, ...cellBg }}>
        <span style={{ fontWeight: 700, color: '#e6edf3' }}>{group.label}</span>
        <span
          style={{
            marginLeft: '8px',
            color: '#8b949e',
            fontWeight: 400,
            fontSize: '0.85em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {group.rows.length}
        </span>
      </td>
    </tr>
  );
}

const groupBannerLabelStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderTop: '1px solid #30363d',
  borderBottom: '1px solid #30363d',
  whiteSpace: 'nowrap',
};

const dragHandleHeaderStyle: React.CSSProperties = {
  borderBottom: '1px solid #30363d',
  padding: 0,
};

// 2026-05-24 fix-forward (Issue 6) — shared sticky-header positioning
// applied to every <th> in the table. Sticks to the top of the scroll
// container; opaque dark background so rows don't show through during
// vertical scroll; z-index above the resize handle (which sits inside
// the th) so the handle doesn't poke above the header during scroll.
const stickyHeaderStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 3,
  background: '#0d1117',
};

const dragHandleCellStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '0 4px',
  color: '#484f58',
  fontSize: '12px',
  lineHeight: '12px',
  cursor: 'grab',
  userSelect: 'none',
};

const dragHandleButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#484f58',
  cursor: 'grab',
  padding: '4px 2px',
  fontSize: '13px',
  fontFamily: 'inherit',
  lineHeight: '13px',
  letterSpacing: '-1px',
  touchAction: 'none',
};

