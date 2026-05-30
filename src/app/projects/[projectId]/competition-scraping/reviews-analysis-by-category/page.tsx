'use client';

// W#2 P-49 W5 Category page — "Reviews Analysis By Competitor Category Table".
//
// Route: /projects/[projectId]/competition-scraping/reviews-analysis-by-category
//
// The page re-lists every CompetitorUrl's review data grouped by
// competitionCategory: the first row of each category group carries the
// category name in Column 1; subsequent rows in the group leave Column 1
// blank (the grouping signal). URLs with no category bucket into
// "(Uncategorized)", which always sorts last.
//
// Session 1 (2026-05-30, shipped): route + flat 13-column grouped table +
// column show/hide + click-to-edit on URL-backed columns + per-review
// stacked Stars/Reviews Summary (Q-A/Q-B) + reuse of the sibling page's
// per-competitor bulleted/non-bulleted summaries (Q-C). Category-level AI
// columns show "(not yet generated)" until Session 2.
//
// Session 1 polish pass (2026-05-30, this deploy): (1) Platforms filter box
// alongside Show columns; (2) full-length drag-to-resize column borders
// (incl. the right edge) via the shared ColumnResizeHandle measured to the
// table height; (3) floating horizontal scrollbar pinned to the bottom of
// the viewport; (4) the per-competitor AI content boxes fill the full cell
// height (less scrolling); (5) visible borders between the Stars / Reviews
// Summary sub-rows. The heavier interactive features (drag-to-reorder
// categories + competitors with the header-row layout change, and
// hide/restore of competitors + categories) land next session per the
// 2026-05-30 director decisions (hide-with-restore + scoped to this page).

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type {
  CapturedReview,
  CompetitorUrl,
  Platform,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { PLATFORMS } from '@/lib/shared-types/competition-scraping';
import { CompetitionScrapingSurfaceNav } from '../components/CompetitionScrapingSurfaceNav';
import {
  InlineEnumCell,
  InlineNumberCell,
  InlineTextCell,
} from '../components/InlineCells';
import { PLATFORM_LABELS } from '../components/url-table-columns';
import { ColumnResizeHandle } from '../components/ColumnResizeHandle';
import {
  CATEGORY_TABLE_COLUMNS,
  CATEGORY_TABLE_PREF_PREFIX,
  MAX_CATEGORY_COLUMN_WIDTH,
  MIN_CATEGORY_COLUMN_WIDTH,
  isCategoryColumnVisible,
  resolveCategoryColumnWidth,
  type CategoryTableColumnDef,
} from '@/lib/competition-scraping/category-table-columns';
import {
  buildCategoryGroupedRows,
  type CategoryDisplayRow,
} from '@/lib/competition-scraping/category-table-grouping';

const WORKFLOW_SLUG = 'competition-scraping';

const PLATFORM_OPTIONS: ReadonlyArray<{ value: Platform; label: string }> =
  PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }));

// AI-summary columns whose content box fills the full cell height + scrolls
// internally (polish item 4).
const AI_COLUMN_IDS = new Set([
  'compBulleted',
  'compNonBulleted',
  'catBulleted',
  'catNonBulleted',
]);

type UrlsLoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: CompetitorUrl[] }
  | { kind: 'error'; message: string };

type ReviewsLoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; reviews: CapturedReview[] }
  | { kind: 'error'; message: string };

type ReviewSummaryEntry = { summary: string; source: 'cache' };
type CompetitorSummaryEntry = { summary: string; source: 'cache' };

export default function ReviewsAnalysisByCategoryPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({ projectId, workflowSlug: WORKFLOW_SLUG });

  const [urlsState, setUrlsState] = useState<UrlsLoadState>({ kind: 'loading' });
  const [reviewsByUrl, setReviewsByUrl] = useState<
    Record<string, ReviewsLoadState>
  >({});
  const [summaryByReviewId, setSummaryByReviewId] = useState<
    Record<string, ReviewSummaryEntry>
  >({});
  const [competitorBulletedByUrlId, setCompetitorBulletedByUrlId] = useState<
    Record<string, CompetitorSummaryEntry>
  >({});
  const [competitorNonBulletedByUrlId, setCompetitorNonBulletedByUrlId] =
    useState<Record<string, CompetitorSummaryEntry>>({});

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  // Per-user column widths for drag-to-resize (polish item 2). Empty → each
  // column uses its defaultWidth. Persisted alongside visibility under the
  // categoryTable: prefix.
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  // Platform filter (polish item 1). Default = all platforms shown.
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => [
    ...PLATFORMS,
  ]);

  // ─── click-to-edit save handler (URL-backed columns) ───────────────
  const handleUrlCellSave = useCallback(
    async (urlId: string, patch: UpdateCompetitorUrlRequest): Promise<void> => {
      if (!projectId) throw new Error('Project id missing.');
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body && typeof body.error === 'string') detail = body.error;
        } catch {
          // ignore
        }
        throw new Error(detail);
      }
      const updated = (await res.json()) as CompetitorUrl;
      setUrlsState((prev) => {
        if (prev.kind !== 'loaded') return prev;
        const idx = prev.urls.findIndex((u) => u.id === updated.id);
        if (idx < 0) return prev;
        const next = [...prev.urls];
        next[idx] = updated;
        return { kind: 'loaded', urls: next };
      });
    },
    [projectId]
  );

  const handleToggleColumn = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
  }, []);

  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [columnId]: width }));
  }, []);

  const handleTogglePlatform = useCallback((platform: Platform, next: boolean) => {
    setSelectedPlatforms((prev) => {
      const set = new Set(prev);
      if (next) set.add(platform);
      else set.delete(platform);
      return PLATFORMS.filter((p) => set.has(p));
    });
  }, []);

  const handleSelectAllPlatforms = useCallback((next: boolean) => {
    setSelectedPlatforms(next ? [...PLATFORMS] : []);
  }, []);

  // ─── load column-visibility + width prefs (categoryTable: prefix) ──
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/table-preferences`
        );
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as {
          columnVisibility?: Record<string, boolean>;
          columnWidths?: Record<string, number>;
        };
        const localVis: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(body.columnVisibility ?? {})) {
          if (key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) {
            localVis[key.slice(CATEGORY_TABLE_PREF_PREFIX.length)] = value;
          }
        }
        const localWidths: Record<string, number> = {};
        for (const [key, value] of Object.entries(body.columnWidths ?? {})) {
          if (key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) {
            localWidths[key.slice(CATEGORY_TABLE_PREF_PREFIX.length)] = value;
          }
        }
        if (!cancelled) {
          setColumnVisibility(localVis);
          setColumnWidths(localWidths);
        }
      } catch {
        // defaults render
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ─── persist column visibility + widths (debounced, merge-safe) ────
  useEffect(() => {
    if (!projectId) return;
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const getRes = await authFetch(
            `/api/projects/${projectId}/competition-scraping/table-preferences`
          );
          let existingVis: Record<string, boolean> = {};
          let existingWidths: Record<string, number> = {};
          if (getRes.ok) {
            const body = (await getRes.json()) as {
              columnVisibility?: Record<string, boolean>;
              columnWidths?: Record<string, number>;
            };
            existingVis = body.columnVisibility ?? {};
            existingWidths = body.columnWidths ?? {};
          }
          const mergedVis: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(existingVis)) {
            if (!key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) mergedVis[key] = value;
          }
          for (const [key, value] of Object.entries(columnVisibility)) {
            mergedVis[`${CATEGORY_TABLE_PREF_PREFIX}${key}`] = value;
          }
          const mergedWidths: Record<string, number> = {};
          for (const [key, value] of Object.entries(existingWidths)) {
            if (!key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) mergedWidths[key] = value;
          }
          for (const [key, value] of Object.entries(columnWidths)) {
            mergedWidths[`${CATEGORY_TABLE_PREF_PREFIX}${key}`] = value;
          }
          await authFetch(
            `/api/projects/${projectId}/competition-scraping/table-preferences`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                columnVisibility: mergedVis,
                columnWidths: mergedWidths,
              }),
            }
          );
        } catch {
          // best-effort; next change re-sends
        }
      })();
    }, 500);
    return () => clearTimeout(handle);
  }, [projectId, columnVisibility, columnWidths]);

  // ─── hydrate per-review + per-competitor summaries ─────────────────
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/review-analysis`
        );
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as {
          items: Array<{
            id: string;
            level: string;
            urlId: string | null;
            analysisJson: unknown;
          }>;
        };
        if (!Array.isArray(body.items)) return;
        const nextReview: Record<string, ReviewSummaryEntry> = {};
        const nextBulleted: Record<string, CompetitorSummaryEntry> = {};
        const nextNonBulleted: Record<string, CompetitorSummaryEntry> = {};
        for (const item of body.items) {
          const aj =
            item.analysisJson && typeof item.analysisJson === 'object'
              ? (item.analysisJson as Record<string, unknown>)
              : {};
          const summary = typeof aj.summary === 'string' ? aj.summary : '';
          if (!summary) continue;
          if (item.level === 'PER_REVIEW') {
            const reviewId = typeof aj.reviewId === 'string' ? aj.reviewId : null;
            if (reviewId) nextReview[reviewId] = { summary, source: 'cache' };
          } else if (item.level === 'PER_PRODUCT' && item.urlId) {
            if (aj.flow === 'per-competitor-nonbulleted') {
              nextNonBulleted[item.urlId] = { summary, source: 'cache' };
            } else {
              nextBulleted[item.urlId] = { summary, source: 'cache' };
            }
          }
        }
        if (cancelled) return;
        setSummaryByReviewId(nextReview);
        setCompetitorBulletedByUrlId(nextBulleted);
        setCompetitorNonBulletedByUrlId(nextNonBulleted);
      } catch {
        // page still renders; summaries just show "—"
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ─── load all URLs on mount ────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls`
        );
        if (cancelled) return;
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) detail = body.error;
          } catch {
            // ignore
          }
          setUrlsState({ kind: 'error', message: detail });
          return;
        }
        const body = (await res.json()) as CompetitorUrl[];
        const items = Array.isArray(body) ? body : [];
        setUrlsState({ kind: 'loaded', urls: items });
      } catch (err) {
        if (cancelled) return;
        setUrlsState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ─── eager-load reviews for every URL (for the per-review columns) ──
  useEffect(() => {
    if (!projectId || urlsState.kind !== 'loaded') return;
    let cancelled = false;
    const urls = urlsState.urls;
    setReviewsByUrl((prev) => {
      const next = { ...prev };
      for (const u of urls) if (!next[u.id]) next[u.id] = { kind: 'loading' };
      return next;
    });
    (async () => {
      await Promise.all(
        urls.map(async (u) => {
          try {
            const res = await authFetch(
              `/api/projects/${projectId}/competition-scraping/urls/${u.id}/reviews`
            );
            if (cancelled) return;
            if (!res.ok) {
              setReviewsByUrl((prev) => ({
                ...prev,
                [u.id]: { kind: 'error', message: `HTTP ${res.status}` },
              }));
              return;
            }
            const body = (await res.json()) as CapturedReview[];
            const reviews = Array.isArray(body) ? body : [];
            setReviewsByUrl((prev) => ({
              ...prev,
              [u.id]: { kind: 'loaded', reviews },
            }));
          } catch (err) {
            if (cancelled) return;
            setReviewsByUrl((prev) => ({
              ...prev,
              [u.id]: {
                kind: 'error',
                message: err instanceof Error ? err.message : 'Network error',
              },
            }));
          }
        })
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, urlsState]);

  // ─── render gates ──────────────────────────────────────────────────
  if (ctx.loading || !ctx.project) {
    return <FullPageState message={ctx.error ?? 'Loading…'} isError={!!ctx.error} />;
  }
  if (!projectId) {
    return (
      <FullPageState
        message="Missing project identifier in the page address."
        isError
      />
    );
  }

  const backHref = `/projects/${projectId}/competition-scraping`;
  const visibleColumns = CATEGORY_TABLE_COLUMNS.filter((c) =>
    isCategoryColumnVisible(columnVisibility, c.id)
  );

  // Platform filter applied BEFORE grouping (polish item 1) — a category
  // with no competitors left after the filter simply drops out.
  const platformSet = new Set(selectedPlatforms);
  const filteredUrls =
    urlsState.kind === 'loaded'
      ? urlsState.urls.filter((u) => platformSet.has(u.platform))
      : [];
  const groupedRows: CategoryDisplayRow<CompetitorUrl>[] =
    buildCategoryGroupedRows(filteredUrls);

  return (
    <div
      style={{
        height: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top chrome — fixed height. */}
      <div style={{ flex: '0 0 auto', padding: '24px 24px 0' }}>
        <CompetitionScrapingSurfaceNav
          projectId={projectId}
          active="reviews-analysis-by-category"
        />

        <button
          type="button"
          onClick={() => router.push(backHref)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'transparent',
            color: '#58a6ff',
            border: '1px solid #30363d',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Competition Data
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#e6edf3' }}>
          Reviews Analysis By Competitor Category
        </h1>
        <p style={{ fontSize: '13px', color: '#8b949e', margin: '0 0 16px', lineHeight: 1.6 }}>
          Every competitor&apos;s review data re-listed by category. The first row of each
          category carries the category name; the rows beneath it belong to that same
          category. Category-level AI write-ups arrive in a later update.
        </p>

        <PlatformFilterBar
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
          onSelectAllPlatforms={handleSelectAllPlatforms}
        />

        <ColumnVisibilityControls
          columns={CATEGORY_TABLE_COLUMNS}
          columnVisibility={columnVisibility}
          onToggleColumn={handleToggleColumn}
        />
      </div>

      {/* Table region — fills remaining height; CategoryTable owns the
          horizontal scroll + the floating bottom scrollbar. */}
      <div
        style={{
          flex: '1 1 auto',
          overflow: 'hidden',
          padding: '0 24px 24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {urlsState.kind === 'loading' && (
          <div style={{ padding: '24px', color: '#8b949e', fontSize: '13px' }}>
            Loading competitors…
          </div>
        )}
        {urlsState.kind === 'error' && (
          <div style={{ padding: '24px' }}>
            <span style={errorBoxStyle}>Failed to load competitors: {urlsState.message}</span>
          </div>
        )}
        {urlsState.kind === 'loaded' && groupedRows.length === 0 && (
          <div style={{ padding: '24px', color: '#8b949e', fontSize: '13px' }}>
            {urlsState.urls.length === 0
              ? 'No competitors captured yet for this project.'
              : 'No competitors match the selected platforms.'}
          </div>
        )}
        {urlsState.kind === 'loaded' && groupedRows.length > 0 && (
          <CategoryTable
            rows={groupedRows}
            visibleColumns={visibleColumns}
            columnWidths={columnWidths}
            reviewsByUrl={reviewsByUrl}
            summaryByReviewId={summaryByReviewId}
            competitorBulletedByUrlId={competitorBulletedByUrlId}
            competitorNonBulletedByUrlId={competitorNonBulletedByUrlId}
            onUrlCellSave={handleUrlCellSave}
            onColumnResize={handleColumnResize}
          />
        )}
      </div>
    </div>
  );
}

// ─── Platform filter chips (polish item 1) ─────────────────────────────

interface PlatformFilterBarProps {
  selectedPlatforms: Platform[];
  onTogglePlatform: (platform: Platform, next: boolean) => void;
  onSelectAllPlatforms: (next: boolean) => void;
}

function PlatformFilterBar({
  selectedPlatforms,
  onTogglePlatform,
  onSelectAllPlatforms,
}: PlatformFilterBarProps): JSX.Element {
  const selected = new Set(selectedPlatforms);
  const allSelected = PLATFORMS.every((p) => selected.has(p));
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 14px',
        padding: '10px 12px',
        marginBottom: '12px',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        fontSize: '12px',
      }}
    >
      <span style={{ color: '#6e7681', fontWeight: 600, alignSelf: 'center' }}>
        Platforms:
      </span>
      <label
        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#c9d1d9' }}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAllPlatforms(e.target.checked)}
        />
        All
      </label>
      {PLATFORMS.map((p) => (
        <label
          key={p}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#c9d1d9' }}
        >
          <input
            type="checkbox"
            checked={selected.has(p)}
            onChange={(e) => onTogglePlatform(p, e.target.checked)}
          />
          {PLATFORM_LABELS[p]}
        </label>
      ))}
    </div>
  );
}

// ─── Column visibility checkbox bar ────────────────────────────────────

interface ColumnVisibilityControlsProps {
  columns: ReadonlyArray<CategoryTableColumnDef>;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

function ColumnVisibilityControls({
  columns,
  columnVisibility,
  onToggleColumn,
}: ColumnVisibilityControlsProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 14px',
        padding: '10px 12px',
        marginBottom: '16px',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        fontSize: '12px',
      }}
    >
      <span style={{ color: '#6e7681', fontWeight: 600, alignSelf: 'center' }}>
        Show columns:
      </span>
      {columns.map((c) => {
        const visible = isCategoryColumnVisible(columnVisibility, c.id);
        return (
          <label
            key={c.id}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#c9d1d9' }}
          >
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => onToggleColumn(c.id, e.target.checked)}
            />
            {c.label}
          </label>
        );
      })}
    </div>
  );
}

// ─── The grouped table ─────────────────────────────────────────────────

interface CategoryTableProps {
  rows: CategoryDisplayRow<CompetitorUrl>[];
  visibleColumns: ReadonlyArray<CategoryTableColumnDef>;
  columnWidths: Record<string, number>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  competitorBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  competitorNonBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  onColumnResize: (columnId: string, width: number) => void;
}

function CategoryTable({
  rows,
  visibleColumns,
  columnWidths,
  reviewsByUrl,
  summaryByReviewId,
  competitorBulletedByUrlId,
  competitorNonBulletedByUrlId,
  onUrlCellSave,
  onColumnResize,
}: CategoryTableProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);
  // scrollWidth/clientWidth of the scroll container — drives the floating
  // horizontal scrollbar (polish item 3) + the full-height resize handles
  // (polish item 2).
  const [metrics, setMetrics] = useState({ scrollWidth: 0, clientWidth: 0 });

  useLayoutEffect(() => {
    const tableEl = tableRef.current;
    const scrollEl = scrollRef.current;
    if (!tableEl || !scrollEl) return;
    const measure = () => {
      setTableHeight(tableEl.offsetHeight);
      setMetrics({
        scrollWidth: scrollEl.scrollWidth,
        clientWidth: scrollEl.clientWidth,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tableEl);
    ro.observe(scrollEl);
    return () => ro.disconnect();
  }, []);

  // Keep the floating scrollbar's thumb in sync if the table is scrolled by
  // other means (e.g. a future drag autoscroll). The container has its own
  // horizontal scrollbar hidden, so the floating bar is the primary control.
  const syncFromContainer = useCallback(() => {
    if (floatingRef.current && scrollRef.current) {
      floatingRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }, []);
  const syncFromFloating = useCallback(() => {
    if (floatingRef.current && scrollRef.current) {
      scrollRef.current.scrollLeft = floatingRef.current.scrollLeft;
    }
  }, []);

  const needsHScroll = metrics.scrollWidth > metrics.clientWidth + 1;

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={syncFromContainer}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          // Vertical scroll inside the region; horizontal handled by the
          // floating bar so it stays pinned to the viewport bottom.
          overflowX: 'hidden',
          overflowY: 'auto',
          // Leave room so the floating bar never covers the last rows.
          paddingBottom: needsHScroll ? '18px' : 0,
        }}
      >
        <table
          ref={tableRef}
          style={{
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '13px',
            background: '#0d1117',
          }}
        >
          <colgroup>
            {visibleColumns.map((c) => (
              <col key={c.id} style={{ width: `${resolveCategoryColumnWidth(columnWidths, c)}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {visibleColumns.map((c) => (
                <th
                  key={c.id}
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    textAlign: 'left',
                    padding: '8px 10px',
                    background: '#161b22',
                    borderBottom: '1px solid #30363d',
                    borderRight: '1px solid #21262d',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    color: '#8b949e',
                    whiteSpace: 'normal',
                  }}
                >
                  {c.label}
                  <ColumnResizeHandle
                    columnId={c.id}
                    currentWidth={resolveCategoryColumnWidth(columnWidths, c)}
                    minWidth={MIN_CATEGORY_COLUMN_WIDTH}
                    maxWidth={MAX_CATEGORY_COLUMN_WIDTH}
                    tableHeight={tableHeight}
                    onCommit={(width) => onColumnResize(c.id, width)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <CategoryRow
                key={row.url.id}
                row={row}
                visibleColumns={visibleColumns}
                reviewsState={reviewsByUrl[row.url.id]}
                summaryByReviewId={summaryByReviewId}
                bulleted={competitorBulletedByUrlId[row.url.id]?.summary ?? ''}
                nonBulleted={competitorNonBulletedByUrlId[row.url.id]?.summary ?? ''}
                onUrlCellSave={onUrlCellSave}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating horizontal scrollbar pinned to the bottom of the viewport
          (polish item 3). Only shown when the table is wider than the view. */}
      {needsHScroll && (
        <div
          ref={floatingRef}
          onScroll={syncFromFloating}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 24,
            right: 24,
            height: '16px',
            overflowX: 'auto',
            overflowY: 'hidden',
            background: '#161b22',
            borderTop: '1px solid #30363d',
            zIndex: 50,
          }}
        >
          <div style={{ width: `${metrics.scrollWidth}px`, height: '1px' }} />
        </div>
      )}
    </>
  );
}

// ─── A single competitor row ───────────────────────────────────────────

interface CategoryRowProps {
  row: CategoryDisplayRow<CompetitorUrl>;
  visibleColumns: ReadonlyArray<CategoryTableColumnDef>;
  reviewsState: ReviewsLoadState | undefined;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  bulleted: string;
  nonBulleted: string;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
}

function CategoryRow({
  row,
  visibleColumns,
  reviewsState,
  summaryByReviewId,
  bulleted,
  nonBulleted,
  onUrlCellSave,
}: CategoryRowProps): JSX.Element {
  const u = row.url;
  const rowTopBorder = row.isFirstInGroup ? '2px solid #30363d' : '1px solid #161b22';

  return (
    <tr style={{ borderTop: rowTopBorder }}>
      {visibleColumns.map((c) => {
        const isAi = AI_COLUMN_IDS.has(c.id);
        return (
          <td
            key={c.id}
            style={{
              padding: isAi ? 0 : '6px 10px',
              borderRight: '1px solid #161b22',
              verticalAlign: 'top',
              color: '#e6edf3',
              // AI cells host an absolutely-positioned box that fills the
              // cell height (polish item 4) — needs a positioning context.
              position: isAi ? 'relative' : undefined,
            }}
          >
            {renderCell(c, row, u, reviewsState, summaryByReviewId, bulleted, nonBulleted, onUrlCellSave)}
          </td>
        );
      })}
    </tr>
  );
}

function renderCell(
  c: CategoryTableColumnDef,
  row: CategoryDisplayRow<CompetitorUrl>,
  u: CompetitorUrl,
  reviewsState: ReviewsLoadState | undefined,
  summaryByReviewId: Record<string, ReviewSummaryEntry>,
  bulleted: string,
  nonBulleted: string,
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>
): JSX.Element {
  const save = (patch: UpdateCompetitorUrlRequest) => onUrlCellSave(u.id, patch);

  switch (c.id) {
    case 'competitionCategory':
      return (
        <InlineTextCell
          value={u.competitionCategory}
          onSave={(next) => save({ competitionCategory: next })}
          placeholder={row.isFirstInGroup ? '(set category)' : ''}
          formatRead={(raw) => (row.isFirstInGroup ? raw : <span />)}
        />
      );
    case 'platform':
      return (
        <InlineEnumCell<Platform>
          value={u.platform}
          options={PLATFORM_OPTIONS}
          onSave={(next) => save({ platform: next })}
        />
      );
    case 'type':
      return (
        <InlineTextCell value={u.type} onSave={(next) => save({ type: next })} placeholder="(type)" />
      );
    case 'productName':
      return (
        <InlineTextCell
          value={u.productName}
          onSave={(next) => save({ productName: next })}
          placeholder="(name)"
          multiline
        />
      );
    case 'resultsPageRank':
      return (
        <InlineNumberCell
          value={u.resultsPageRank}
          onSave={(next) => save({ resultsPageRank: next })}
          integer
          min={1}
        />
      );
    case 'competitionScore':
      return (
        <InlineNumberCell
          value={u.competitionScore}
          onSave={(next) => save({ competitionScore: next })}
        />
      );
    case 'url':
      return (
        <InlineTextCell
          value={u.url}
          onSave={(next) =>
            next == null || next.trim() === ''
              ? Promise.reject(new Error('URL required'))
              : save({ url: next })
          }
          multiline
        />
      );
    case 'stars':
      return <PerReviewStarsCell reviewsState={reviewsState} />;
    case 'reviewsSummary':
      return (
        <PerReviewSummaryCell reviewsState={reviewsState} summaryByReviewId={summaryByReviewId} />
      );
    case 'compBulleted':
      return <SummaryTextCell text={bulleted} />;
    case 'compNonBulleted':
      return <SummaryTextCell text={nonBulleted} />;
    case 'catBulleted':
    case 'catNonBulleted':
      return row.isFirstInGroup ? (
        <span
          style={{
            display: 'block',
            padding: '6px 10px',
            color: '#6e7681',
            fontStyle: 'italic',
            fontSize: '12px',
          }}
        >
          (not yet generated)
        </span>
      ) : (
        <span />
      );
    default:
      return <span />;
  }
}

// ─── per-review stacked cells (read-only, bordered sub-rows) ───────────

function sortedReviewsOf(state: ReviewsLoadState | undefined): CapturedReview[] | null {
  if (!state || state.kind !== 'loaded') return null;
  return [...state.reviews].sort((a, b) => {
    const ra = a.sortRankInReviewsTable ?? Number.MAX_SAFE_INTEGER;
    const rb = b.sortRankInReviewsTable ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
}

// Shared sub-row style — a visible bottom border between per-review entries
// (polish item 5). The last entry drops the border.
function subRowStyle(isLast: boolean): React.CSSProperties {
  return {
    padding: '5px 0',
    borderBottom: isLast ? 'none' : '1px solid #21262d',
    fontSize: '12px',
    lineHeight: 1.5,
  };
}

function PerReviewStarsCell({ reviewsState }: { reviewsState: ReviewsLoadState | undefined }): JSX.Element {
  if (reviewsState?.kind === 'loading' || reviewsState === undefined) {
    return <span style={{ color: '#6e7681', fontSize: '12px' }}>…</span>;
  }
  if (reviewsState.kind === 'error') {
    return <span style={{ color: '#f85149', fontSize: '12px' }}>!</span>;
  }
  const reviews = sortedReviewsOf(reviewsState);
  if (!reviews || reviews.length === 0) {
    return <span style={{ color: '#6e7681', fontSize: '12px' }}>—</span>;
  }
  return (
    <div>
      {reviews.map((r, i) => (
        <div key={r.id} style={subRowStyle(i === reviews.length - 1)}>
          <span style={{ color: '#f0b341', whiteSpace: 'nowrap' }}>
            {'★'.repeat(Math.max(0, Math.min(5, Math.round(r.starRating))))}
          </span>
        </div>
      ))}
    </div>
  );
}

function PerReviewSummaryCell({
  reviewsState,
  summaryByReviewId,
}: {
  reviewsState: ReviewsLoadState | undefined;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
}): JSX.Element {
  if (reviewsState?.kind === 'loading' || reviewsState === undefined) {
    return <span style={{ color: '#6e7681', fontSize: '12px' }}>loading…</span>;
  }
  if (reviewsState.kind === 'error') {
    return <span style={{ color: '#f85149', fontSize: '12px' }}>failed to load</span>;
  }
  const reviews = sortedReviewsOf(reviewsState);
  if (!reviews || reviews.length === 0) {
    return <span style={{ color: '#6e7681', fontSize: '12px' }}>no reviews</span>;
  }
  return (
    <div>
      {reviews.map((r, i) => {
        const summary = summaryByReviewId[r.id]?.summary ?? '';
        return (
          <div
            key={r.id}
            style={{
              ...subRowStyle(i === reviews.length - 1),
              color: summary ? '#e6edf3' : '#6e7681',
              fontStyle: summary ? 'normal' : 'italic',
              whiteSpace: 'pre-wrap',
            }}
          >
            {summary || '(not summarized)'}
          </div>
        );
      })}
    </div>
  );
}

// AI-summary content box that fills the full cell height + scrolls internally
// (polish item 4). Rendered inside a position:relative <td>.
function SummaryTextCell({ text }: { text: string }): JSX.Element {
  if (!text) {
    return (
      <span style={{ display: 'block', padding: '6px 10px', color: '#6e7681', fontSize: '12px' }}>
        —
      </span>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: '6px 10px',
        overflow: 'auto',
        fontSize: '12px',
        lineHeight: 1.5,
        color: '#e6edf3',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  );
}

// ─── full-page status screen (loading / error gate) ────────────────────

const errorBoxStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  background: '#3d1418',
  border: '1px solid #f85149',
  borderRadius: '6px',
  color: '#ff7b72',
  fontSize: '13px',
};

interface FullPageStateProps {
  message: string;
  isError: boolean;
}

function FullPageState({ message, isError }: FullPageStateProps): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <span style={{ color: isError ? '#f85149' : '#8b949e' }}>{message}</span>
    </div>
  );
}
