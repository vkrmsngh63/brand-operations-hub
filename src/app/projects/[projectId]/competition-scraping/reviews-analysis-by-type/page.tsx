'use client';

// W#2 P-49 W5 Type page Sessions 4-5 (2026-06-01) — "Reviews Analysis By
// Competitor Type Table". Mirror of the now-closed Category page with the
// grouping key swapped from competitionCategory to type (and the Type/Category
// columns swapped: Type is Column 1, Category is Column 3).
//
// Route: /projects/[projectId]/competition-scraping/reviews-analysis-by-type
//
// The page re-lists every CompetitorUrl's review data grouped by `type`
// ((Untyped) bucket last). Born with EVERYTHING the Category page shipped:
// the flat 13-column grouped table + column show/hide + click-to-edit +
// per-review stacked Stars/Reviews Summary + reuse of the sibling page's
// per-competitor summaries; the interactive batch (type name on its OWN shaded
// banner row with competitor rows beneath, two-level drag-to-reorder, and
// hide-with-restore scoped to THIS page); the per-user, per-Project memory in
// UserTablePreferences.typeTableLayout; the two per-type AI flows (bulleted
// dedup + non-bulleted prose) with live painting into Columns 12/13; the
// Source Reviews column (each type bullet's cross-competitor source reviews);
// and the 4 director adjustments from 2026-05-30-d (top-aligned banner label;
// NO per-type prose write-back into competitor notes boxes; auto-fading
// HoverTooltips on the AI buttons; per-bullet sub-row alignment across the
// "(bulleted)" + Source Reviews columns).

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  MeasuringStrategy,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type {
  CapturedReview,
  TypeTableLayout,
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
import { HoverTooltip } from '../components/HoverTooltip';
import {
  TYPE_TABLE_COLUMNS,
  TYPE_TABLE_PREF_PREFIX,
  MAX_TYPE_COLUMN_WIDTH,
  MIN_TYPE_COLUMN_WIDTH,
  isTypeColumnVisible,
  resolveTypeColumnWidth,
  type TypeTableColumnDef,
} from '@/lib/competition-scraping/type-table-columns';
import {
  TypeAiRunModal,
  type TypeFlow,
  type TypeRunTarget,
} from './components/TypeAiRunModal';
import type { PerCompetitorStructuredCategory } from '@/lib/competition-scraping/review-analysis/prompts';
import {
  buildCategorySourceReviewRows,
  type CategorySourceReview,
  type CategorySourceReviewMeta,
  type CategorySourceTheme,
} from '@/lib/competition-scraping/reviews-traceability';
import {
  buildTypeGroups,
  normalizeTypeKey,
  type TypeDisplayRow,
  type TypeGroup,
} from '@/lib/competition-scraping/type-table-grouping';
import {
  EMPTY_TYPE_TABLE_LAYOUT,
  applyTypeDrag,
  applyCompetitorDrag,
  readTypeTableLayout,
  toHiddenSets,
  toggleHidden,
} from '@/lib/competition-scraping/type-table-layout';

const WORKFLOW_SLUG = 'competition-scraping';

const PLATFORM_OPTIONS: ReadonlyArray<{ value: Platform; label: string }> =
  PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }));

// AI-summary columns whose content box fills the full cell height + scrolls
// internally (polish item 4).
const AI_COLUMN_IDS = new Set([
  'compBulleted',
  'compNonBulleted',
  'typeBulleted',
  'typeNonBulleted',
]);

// Blank scrollable space to the right of the table so the user can scroll a
// little PAST the table's right edge — keeping the rightmost column's resize
// handle clear of the vertical scrollbar (director report 2026-05-30).
const TABLE_TRAILING_SPACE = 48;

// Width of the leftmost drag-grip / hide column (interactive batch). Hosts the
// per-competitor + per-type reorder grip + the hide affordance.
const GRIP_COL_WIDTH = 34;

// The drag id of a type banner is prefixed so the single DndContext can
// tell a type drag from a competitor drag without ambiguity.
const TYPE_DRAG_PREFIX = 'type:';
const typeDragId = (key: string): string => `${TYPE_DRAG_PREFIX}${key}`;

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
// Category bulleted summary + its structured categories (each bullet's source
// reviewIds) for the Source Reviews column + the analysisId for editing.
type TypeBulletedEntry = {
  summary: string;
  analysisId: string;
  categories: PerCompetitorStructuredCategory[];
};

export default function ReviewsAnalysisByTypePage(): JSX.Element {
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
  // Category-level AI summaries, keyed by type key (typeFilter). Bulleted
  // carries the structured categories (bullets + source reviewIds) for the
  // Source Reviews column; non-bulleted is prose for Column 13.
  const [typeBulletedByKey, setTypeBulletedByKey] = useState<
    Record<string, TypeBulletedEntry>
  >({});
  const [typeNonBulletedByKey, setTypeNonBulletedByKey] = useState<
    Record<string, CompetitorSummaryEntry>
  >({});

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
  // Interactive-batch "memory": type order + within-type competitor
  // order + hidden competitors + hidden types. Scoped to THIS page.
  const [layout, setLayout] = useState<TypeTableLayout>(
    EMPTY_TYPE_TABLE_LAYOUT
  );
  // Gate: don't persist visibility/widths until the initial server load has
  // completed — otherwise the debounced save can fire with empty local state
  // and WIPE the user's previously-saved categoryTable: prefs before the
  // load populates them (the cause of widths not sticking, 2026-05-30).
  const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false);

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

  // ─── persist the interactive-batch layout memory ───────────────────
  // Fired only on explicit user action (drag / hide / restore), so it can
  // never race the initial load with an empty layout.
  const persistLayout = useCallback(
    (next: TypeTableLayout) => {
      setLayout(next);
      if (!projectId) return;
      void authFetch(
        `/api/projects/${projectId}/competition-scraping/table-preferences`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ typeTableLayout: next }),
        }
      ).catch(() => {
        // best-effort; the next layout change re-sends the whole object
      });
    },
    [projectId]
  );

  // ─── load column-visibility + width prefs + layout (categoryTable:) ──
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
          typeTableLayout?: unknown;
        };
        const localVis: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(body.columnVisibility ?? {})) {
          if (key.startsWith(TYPE_TABLE_PREF_PREFIX)) {
            localVis[key.slice(TYPE_TABLE_PREF_PREFIX.length)] = value;
          }
        }
        const localWidths: Record<string, number> = {};
        for (const [key, value] of Object.entries(body.columnWidths ?? {})) {
          if (key.startsWith(TYPE_TABLE_PREF_PREFIX)) {
            localWidths[key.slice(TYPE_TABLE_PREF_PREFIX.length)] = value;
          }
        }
        if (!cancelled) {
          setColumnVisibility(localVis);
          setColumnWidths(localWidths);
          setLayout(readTypeTableLayout(body.typeTableLayout));
        }
      } catch {
        // defaults render
      } finally {
        // Open the save gate even on error/404 so future edits persist —
        // but only AFTER this initial read so we never overwrite saved
        // prefs with the empty initial state.
        if (!cancelled) setHasLoadedPrefs(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ─── persist column visibility + widths (debounced, merge-safe) ────
  useEffect(() => {
    if (!projectId || !hasLoadedPrefs) return;
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
            if (!key.startsWith(TYPE_TABLE_PREF_PREFIX)) mergedVis[key] = value;
          }
          for (const [key, value] of Object.entries(columnVisibility)) {
            mergedVis[`${TYPE_TABLE_PREF_PREFIX}${key}`] = value;
          }
          const mergedWidths: Record<string, number> = {};
          for (const [key, value] of Object.entries(existingWidths)) {
            if (!key.startsWith(TYPE_TABLE_PREF_PREFIX)) mergedWidths[key] = value;
          }
          for (const [key, value] of Object.entries(columnWidths)) {
            mergedWidths[`${TYPE_TABLE_PREF_PREFIX}${key}`] = value;
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
  }, [projectId, columnVisibility, columnWidths, hasLoadedPrefs]);

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
            typeFilter: string | null;
            analysisJson: unknown;
          }>;
        };
        if (!Array.isArray(body.items)) return;
        const nextReview: Record<string, ReviewSummaryEntry> = {};
        const nextBulleted: Record<string, CompetitorSummaryEntry> = {};
        const nextNonBulleted: Record<string, CompetitorSummaryEntry> = {};
        const nextCatBulleted: Record<string, TypeBulletedEntry> = {};
        const nextCatNonBulleted: Record<string, CompetitorSummaryEntry> = {};
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
          } else if (item.level === 'PER_TYPE' && item.typeFilter != null) {
            if (aj.flow === 'per-type-nonbulleted') {
              nextCatNonBulleted[item.typeFilter] = { summary, source: 'cache' };
            } else {
              const cats = Array.isArray(aj.categories)
                ? (aj.categories as PerCompetitorStructuredCategory[])
                : [];
              nextCatBulleted[item.typeFilter] = {
                summary,
                analysisId: item.id,
                categories: cats,
              };
            }
          }
        }
        if (cancelled) return;
        setSummaryByReviewId(nextReview);
        setCompetitorBulletedByUrlId(nextBulleted);
        setCompetitorNonBulletedByUrlId(nextNonBulleted);
        setTypeBulletedByKey(nextCatBulleted);
        setTypeNonBulletedByKey(nextCatNonBulleted);
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

  // ─── hide / restore handlers ───────────────────────────────────────
  const handleHideUrl = useCallback(
    (urlId: string, hide: boolean) => {
      persistLayout({
        ...layout,
        hiddenUrlIds: toggleHidden(layout.hiddenUrlIds, urlId, hide),
      });
    },
    [layout, persistLayout]
  );

  const handleHideType = useCallback(
    (typeKey: string, hide: boolean) => {
      persistLayout({
        ...layout,
        hiddenTypeKeys: toggleHidden(layout.hiddenTypeKeys, typeKey, hide),
      });
    },
    [layout, persistLayout]
  );

  // Paint a completed type AI run into Columns 12/13 (live + on refresh).
  const handleTypeResult = useCallback(
    (result: {
      typeKey: string;
      analysisId: string;
      summary: string;
      categories: PerCompetitorStructuredCategory[] | null;
      source: 'cache' | 'fresh';
    }) => {
      if (result.categories) {
        const cats = result.categories;
        setTypeBulletedByKey((prev) => ({
          ...prev,
          [result.typeKey]: {
            summary: result.summary,
            analysisId: result.analysisId,
            categories: cats,
          },
        }));
      } else {
        setTypeNonBulletedByKey((prev) => ({
          ...prev,
          [result.typeKey]: { summary: result.summary, source: 'cache' },
        }));
      }
    },
    []
  );

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
  const visibleColumns = TYPE_TABLE_COLUMNS.filter((c) =>
    isTypeColumnVisible(columnVisibility, c.id)
  );

  const allUrls = urlsState.kind === 'loaded' ? urlsState.urls : [];

  // Resolve the hidden competitors (for the restore panel) from the FULL url
  // list so a hidden-and-platform-filtered competitor is still restorable.
  const hiddenUrlSet = new Set(layout.hiddenUrlIds);
  const hiddenUrls = allUrls.filter((u) => hiddenUrlSet.has(u.id));

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
          active="reviews-analysis-by-type"
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
          Reviews Analysis By Competitor Type
        </h1>
        <p style={{ fontSize: '13px', color: '#8b949e', margin: '0 0 16px', lineHeight: 1.6 }}>
          Every competitor&apos;s review data re-listed by type. Each type sits on its
          own banner row; drag the grip on a banner to reorder whole types, or the grip on a
          competitor to reorder competitors within a type. Use the ✕ to hide a competitor or a
          type from this page — your order and hidden rows are remembered just for you, just
          here. Category-level AI write-ups arrive in a later update.
        </p>

        <PlatformFilterBar
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
          onSelectAllPlatforms={handleSelectAllPlatforms}
        />

        <ColumnVisibilityControls
          columns={TYPE_TABLE_COLUMNS}
          columnVisibility={columnVisibility}
          onToggleColumn={handleToggleColumn}
        />

        <HiddenRowsPanel
          hiddenUrls={hiddenUrls}
          hiddenTypeKeys={layout.hiddenTypeKeys}
          onRestoreUrl={(id) => handleHideUrl(id, false)}
          onRestoreType={(key) => handleHideType(key, false)}
        />
      </div>

      {/* Table region — fills remaining height; TypeTable owns the
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
        {urlsState.kind === 'loaded' && (
          <TypeTable
            projectId={projectId}
            urls={urlsState.urls}
            selectedPlatforms={selectedPlatforms}
            layout={layout}
            onLayoutChange={persistLayout}
            visibleColumns={visibleColumns}
            columnWidths={columnWidths}
            reviewsByUrl={reviewsByUrl}
            summaryByReviewId={summaryByReviewId}
            competitorBulletedByUrlId={competitorBulletedByUrlId}
            competitorNonBulletedByUrlId={competitorNonBulletedByUrlId}
            typeBulletedByKey={typeBulletedByKey}
            typeNonBulletedByKey={typeNonBulletedByKey}
            onTypeResult={handleTypeResult}
            onUrlCellSave={handleUrlCellSave}
            onColumnResize={handleColumnResize}
            onHideUrl={(id) => handleHideUrl(id, true)}
            onHideType={(key) => handleHideType(key, true)}
            totalUrlCount={urlsState.urls.length}
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
  columns: ReadonlyArray<TypeTableColumnDef>;
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
        const visible = isTypeColumnVisible(columnVisibility, c.id);
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

// ─── Hidden-rows restore panel (interactive batch) ─────────────────────

interface HiddenRowsPanelProps {
  hiddenUrls: CompetitorUrl[];
  hiddenTypeKeys: string[];
  onRestoreUrl: (urlId: string) => void;
  onRestoreType: (typeKey: string) => void;
}

function HiddenRowsPanel({
  hiddenUrls,
  hiddenTypeKeys,
  onRestoreUrl,
  onRestoreType,
}: HiddenRowsPanelProps): JSX.Element | null {
  if (hiddenUrls.length === 0 && hiddenTypeKeys.length === 0) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 10px',
        padding: '10px 12px',
        marginBottom: '16px',
        background: '#1c1207',
        border: '1px solid #5a3a12',
        borderRadius: '8px',
        fontSize: '12px',
      }}
    >
      <span style={{ color: '#d8a657', fontWeight: 600 }}>Hidden on this page:</span>
      {hiddenTypeKeys.map((key) => (
        <RestoreChip
          key={`type:${key}`}
          label={`📁 ${key === '' ? '(Untyped)' : key}`}
          onRestore={() => onRestoreType(key)}
        />
      ))}
      {hiddenUrls.map((u) => (
        <RestoreChip
          key={u.id}
          label={u.productName?.trim() || u.url}
          onRestore={() => onRestoreUrl(u.id)}
        />
      ))}
    </div>
  );
}

function RestoreChip({
  label,
  onRestore,
}: {
  label: string;
  onRestore: () => void;
}): JSX.Element {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        maxWidth: '260px',
        padding: '3px 8px',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '12px',
        color: '#c9d1d9',
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={label}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onRestore}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#58a6ff',
          cursor: 'pointer',
          fontSize: '12px',
          padding: 0,
          fontFamily: 'inherit',
        }}
        title="Show this row again"
      >
        Show
      </button>
    </span>
  );
}

// ─── The grouped table ─────────────────────────────────────────────────

interface TypeTableProps {
  projectId: string;
  urls: CompetitorUrl[];
  selectedPlatforms: Platform[];
  layout: TypeTableLayout;
  onLayoutChange: (next: TypeTableLayout) => void;
  visibleColumns: ReadonlyArray<TypeTableColumnDef>;
  columnWidths: Record<string, number>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  competitorBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  competitorNonBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  typeBulletedByKey: Record<string, TypeBulletedEntry>;
  typeNonBulletedByKey: Record<string, CompetitorSummaryEntry>;
  onTypeResult: (result: {
    typeKey: string;
    analysisId: string;
    summary: string;
    categories: PerCompetitorStructuredCategory[] | null;
    source: 'cache' | 'fresh';
  }) => void;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  onColumnResize: (columnId: string, width: number) => void;
  onHideUrl: (urlId: string) => void;
  onHideType: (typeKey: string) => void;
  totalUrlCount: number;
}

function TypeTable({
  projectId,
  urls,
  selectedPlatforms,
  layout,
  onLayoutChange,
  visibleColumns,
  columnWidths,
  reviewsByUrl,
  summaryByReviewId,
  competitorBulletedByUrlId,
  competitorNonBulletedByUrlId,
  typeBulletedByKey,
  typeNonBulletedByKey,
  onTypeResult,
  onUrlCellSave,
  onColumnResize,
  onHideUrl,
  onHideType,
  totalUrlCount,
}: TypeTableProps): JSX.Element {
  const [aiModalFlow, setAiModalFlow] = useState<TypeFlow | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);
  const [metrics, setMetrics] = useState({ scrollWidth: 0, clientWidth: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Platform filter, then hide filter, then group with the saved order.
  const platformSet = useMemo(() => new Set(selectedPlatforms), [selectedPlatforms]);
  const hidden = useMemo(() => toHiddenSets(layout), [layout]);

  const groups: TypeGroup<CompetitorUrl>[] = useMemo(() => {
    const visible = urls.filter(
      (u) =>
        platformSet.has(u.platform) &&
        !hidden.hiddenUrlIds.has(u.id) &&
        !hidden.hiddenTypeKeys.has(normalizeTypeKey(u.type))
    );
    return buildTypeGroups(visible, {
      typeOrder: layout.typeOrder,
      rowOrderByUrlId: layout.rowOrderByUrlId,
    });
  }, [urls, platformSet, hidden, layout.typeOrder, layout.rowOrderByUrlId]);

  // The AI run targets — real types only (the uncategorized bucket has no
  // type label to summarize). Each carries its competitor urlIds.
  const typeRunTargets: TypeRunTarget[] = useMemo(
    () =>
      groups
        .filter((g) => !g.isUntyped && g.key)
        .map((g) => ({
          typeKey: g.key,
          label: g.label,
          urlIds: g.rows.map((r) => r.url.id),
        })),
    [groups]
  );
  // Source Reviews column: a global reviewId → { product, stars, text, urlId }
  // map resolving every type bullet's cited reviewIds (which span all the
  // competitors in a type) to the captured review's display fields + the
  // urlId for the jump-to-detail link. Built from the eager-loaded reviews +
  // each URL's product name; rebuilt as reviews stream in.
  const reviewMetaById = useMemo(() => {
    const map = new Map<string, CategorySourceReviewMeta>();
    const productNameByUrlId = new Map<string, string>();
    for (const u of urls) {
      productNameByUrlId.set(u.id, u.productName?.trim() || u.url);
    }
    for (const [urlId, state] of Object.entries(reviewsByUrl)) {
      if (state.kind !== 'loaded') continue;
      const productName = productNameByUrlId.get(urlId) ?? '(unknown product)';
      for (const r of state.reviews) {
        map.set(r.id, {
          starRating: r.starRating,
          title: r.title,
          body: r.body,
          productName,
          urlId,
        });
      }
    }
    return map;
  }, [urls, reviewsByUrl]);

  // For the non-bulleted modal: the bulleted summary text per type (the
  // input; categories without one are skipped + flagged in the modal).
  const bulletedSummaryByTypeKey = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, entry] of Object.entries(typeBulletedByKey)) {
      out[key] = entry.summary;
    }
    return out;
  }, [typeBulletedByKey]);

  // Drag bookkeeping: the displayed type-key order (real types are
  // draggable; the uncategorized bucket is always pinned last), the flat
  // displayed competitor-id order, and a url-id → type-key map so a
  // competitor drag only reorders within its own type.
  const displayedTypeKeys = useMemo(
    () => groups.filter((g) => !g.isUntyped).map((g) => g.key),
    [groups]
  );
  const displayedUrlIds = useMemo(
    () => groups.flatMap((g) => g.rows.map((r) => r.url.id)),
    [groups]
  );
  const urlIdToTypeKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of groups) for (const r of g.rows) map.set(r.url.id, g.key);
    return map;
  }, [groups]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);
      if (activeId === overId) return;
      const activeIsCat = activeId.startsWith(TYPE_DRAG_PREFIX);
      if (activeIsCat) {
        // Dragging a type: the drop target is another banner OR any
        // competitor row (whose type we map to) — so dropping anywhere
        // inside a type lands the dragged type there. Dropping onto
        // the pinned-last uncategorized bucket no-ops (it's never reorderable).
        const activeKey = activeId.slice(TYPE_DRAG_PREFIX.length);
        const targetKey = overId.startsWith(TYPE_DRAG_PREFIX)
          ? overId.slice(TYPE_DRAG_PREFIX.length)
          : urlIdToTypeKey.get(overId);
        if (!targetKey) return;
        const next = applyTypeDrag(
          layout.typeOrder,
          displayedTypeKeys,
          activeKey,
          targetKey
        );
        onLayoutChange({ ...layout, typeOrder: next });
        return;
      }
      // Dragging a competitor: only reorder when the drop target is another
      // competitor in the SAME type (dropping onto a banner is ignored).
      if (overId.startsWith(TYPE_DRAG_PREFIX)) return;
      if (urlIdToTypeKey.get(activeId) !== urlIdToTypeKey.get(overId)) {
        return;
      }
      const next = applyCompetitorDrag(
        layout.rowOrderByUrlId,
        displayedUrlIds,
        activeId,
        overId
      );
      onLayoutChange({ ...layout, rowOrderByUrlId: next });
    },
    [
      layout,
      displayedTypeKeys,
      displayedUrlIds,
      urlIdToTypeKey,
      onLayoutChange,
    ]
  );

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
  }, [groups.length]);

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

  // Explicit table width = grip column + sum of the visible column widths.
  const totalWidth =
    GRIP_COL_WIDTH +
    visibleColumns.reduce(
      (sum, c) => sum + resolveTypeColumnWidth(columnWidths, c),
      0
    );

  // Banner layout: the label cell spans the non-type-level visible
  // columns; the type-level AI columns (rightmost) keep their own cells.
  const bannerLabelSpan = visibleColumns.filter((c) => !c.typeLevel).length;
  const typeLevelColumns = visibleColumns.filter((c) => c.typeLevel);

  if (groups.length === 0) {
    const anyHidden =
      layout.hiddenUrlIds.length > 0 || layout.hiddenTypeKeys.length > 0;
    return (
      <div style={{ padding: '24px', color: '#8b949e', fontSize: '13px' }}>
        {totalUrlCount === 0
          ? 'No competitors captured yet for this project.'
          : anyHidden
            ? 'Every competitor is hidden or filtered out. Use "Show" above to bring rows back, or adjust the platform filter.'
            : 'No competitors match the selected platforms.'}
      </div>
    );
  }

  return (
    <>
      {/* Category AI run buttons (Session 2). The bulleted run dedups each
          type's competitor bullets + traces source reviews; the
          non-bulleted run rewrites the bulleted summary as prose. */}
      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          gap: '10px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        <HoverTooltip text="For each type, reads every competitor's bulleted review summary and merges them into ONE de-duplicated bullet list of the type's common complaints — the same complaint raised by several competitors is listed once. The result fills the 'Type Comprehensive (bulleted)' cell, and the new 'Source Reviews' column shows the individual reviews behind each bullet.">
          <button
            type="button"
            onClick={() => setAiModalFlow('per-type-bulleted')}
            disabled={typeRunTargets.length === 0}
            style={typeAiButtonStyle(typeRunTargets.length === 0)}
            data-testid="type-auto-bulleted-button"
          >
            Auto-create Type Comprehensive Reviews Analysis (bulleted)
          </button>
        </HoverTooltip>
        <HoverTooltip text="Turns each type's de-duplicated bullet list into a flowing, plain-paragraph critique of that whole type of products — the kind of write-up you can use to challenge a type on a product-comparison page. Fills the 'Type Comprehensive (non-bulleted)' cell. Run the bulleted analysis first.">
          <button
            type="button"
            onClick={() => setAiModalFlow('per-type-nonbulleted')}
            disabled={typeRunTargets.length === 0}
            style={typeAiButtonStyle(typeRunTargets.length === 0)}
            data-testid="type-auto-nonbulleted-button"
          >
            Auto-create Type Comprehensive Reviews Analysis (non-bulleted)
          </button>
        </HoverTooltip>
      </div>
      {aiModalFlow && (
        <TypeAiRunModal
          projectId={projectId}
          flow={aiModalFlow}
          categories={typeRunTargets}
          bulletedSummaryByTypeKey={bulletedSummaryByTypeKey}
          onClose={() => setAiModalFlow(null)}
          onResult={onTypeResult}
        />
      )}
      <div
        ref={scrollRef}
        onScroll={syncFromContainer}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarGutter: 'stable',
          paddingBottom: needsHScroll ? '18px' : 0,
        }}
      >
        <div style={{ width: `${totalWidth + TABLE_TRAILING_SPACE}px` }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            // A type can be many rows tall, so its sibling types often
            // sit below the fold. Re-measure droppables every frame (Always) so
            // rows the auto-scroll reveals register as valid drop targets, and
            // tune vertical auto-scroll explicitly. The horizontal axis is
            // disabled (threshold.x: 0) — the table scrolls horizontally via
            // the floating bar (overflowX is hidden on the container), so
            // auto-scrolling X can't work and only confused detection.
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            autoScroll={{ threshold: { x: 0, y: 0.25 }, acceleration: 15 }}
          >
            <table
              ref={tableRef}
              style={{
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                width: `${totalWidth}px`,
                minWidth: `${totalWidth}px`,
                fontSize: '13px',
                background: '#0d1117',
              }}
            >
              <colgroup>
                <col style={{ width: `${GRIP_COL_WIDTH}px` }} />
                {visibleColumns.map((c) => (
                  <col key={c.id} style={{ width: `${resolveTypeColumnWidth(columnWidths, c)}px` }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...thBaseStyle, position: 'sticky', top: 0, zIndex: 2 }} aria-label="Reorder" />
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
                        currentWidth={resolveTypeColumnWidth(columnWidths, c)}
                        minWidth={MIN_TYPE_COLUMN_WIDTH}
                        maxWidth={MAX_TYPE_COLUMN_WIDTH}
                        tableHeight={tableHeight}
                        onCommit={(width) => onColumnResize(c.id, width)}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={displayedTypeKeys.map(typeDragId)}
                  strategy={verticalListSortingStrategy}
                >
                  {groups.map((group) => (
                    <Fragment key={group.key || '__uncategorized__'}>
                      <TypeBannerRow
                        group={group}
                        labelSpan={bannerLabelSpan}
                        typeLevelColumns={typeLevelColumns}
                        onHideType={onHideType}
                        projectId={projectId}
                        bulletedSummary={typeBulletedByKey[group.key]?.summary ?? ''}
                        sourceReviewThemes={buildCategorySourceReviewRows(
                          typeBulletedByKey[group.key]?.categories ?? [],
                          reviewMetaById
                        )}
                        nonBulletedSummary={typeNonBulletedByKey[group.key]?.summary ?? ''}
                      />
                      <SortableContext
                        items={group.rows.map((r) => r.url.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {group.rows.map((row) => (
                          <SortableTypeRow
                            key={row.url.id}
                            row={row}
                            visibleColumns={visibleColumns}
                            reviewsState={reviewsByUrl[row.url.id]}
                            summaryByReviewId={summaryByReviewId}
                            bulleted={competitorBulletedByUrlId[row.url.id]?.summary ?? ''}
                            nonBulleted={competitorNonBulletedByUrlId[row.url.id]?.summary ?? ''}
                            onUrlCellSave={onUrlCellSave}
                            onHideUrl={onHideUrl}
                          />
                        ))}
                      </SortableContext>
                    </Fragment>
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>

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

const thBaseStyle: React.CSSProperties = {
  background: '#161b22',
  borderBottom: '1px solid #30363d',
  borderRight: '1px solid #21262d',
};

// ─── Category banner row (interactive batch) ───────────────────────────
// The type name lives on its own shaded banner: grip (drag the whole
// type) + name + hide-type control on the left, the type-level
// AI cells at the right (bulleted summary · Source Reviews · non-bulleted
// summary). Competitor rows render beneath it.

interface TypeBannerRowProps {
  group: TypeGroup<CompetitorUrl>;
  labelSpan: number;
  typeLevelColumns: ReadonlyArray<TypeTableColumnDef>;
  onHideType: (typeKey: string) => void;
  projectId: string;
  bulletedSummary: string;
  sourceReviewThemes: CategorySourceTheme[];
  nonBulletedSummary: string;
}

function TypeBannerRow({
  group,
  labelSpan,
  typeLevelColumns,
  onHideType,
  projectId,
  bulletedSummary,
  sourceReviewThemes,
  nonBulletedSummary,
}: TypeBannerRowProps): JSX.Element {
  // The uncategorized bucket is pinned last and is NOT draggable.
  const draggable = !group.isUntyped;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: typeDragId(group.key), disabled: !draggable });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#1f2937' : '#15203a',
    opacity: isDragging ? 0.7 : 1,
  };

  // Director adjustment 2026-05-30-d (#4): each bulleted complaint becomes its
  // OWN sub-row whose row extends across the "Type Comprehensive (bulleted)"
  // + "Source Reviews" columns, so a bullet sits on the same line as the
  // individual reviews behind it (mirrors the URL-detail traceability table).
  // Flatten the resolved themes → one sub-row per bullet (the first bullet of
  // each theme carries the theme label).
  const bulletRows: BannerBulletRow[] = [];
  for (const theme of sourceReviewThemes) {
    theme.bullets.forEach((b, bi) => {
      bulletRows.push({
        themeName: bi === 0 ? theme.name : null,
        bulletText: b.text,
        sources: b.sources,
      });
    });
  }
  // The per-bullet sub-row layout only applies when at least one per-bullet
  // column (bulleted / Source Reviews) is showing AND a bulleted run exists;
  // otherwise the banner is a single row (placeholder, or non-bulleted only).
  const anyPerBulletVisible = typeLevelColumns.some(
    (c) => c.id === 'typeBulleted' || c.id === 'typeSourceReviews'
  );
  const useBulletSubRows = anyPerBulletVisible && bulletRows.length > 0;
  const subRows: Array<BannerBulletRow | null> = useBulletSubRows
    ? bulletRows
    : [null];
  const span = subRows.length;

  return (
    <>
      {subRows.map((br, i) => {
        const isFirstSub = i === 0;
        const topBorder = isFirstSub
          ? '2px solid #30363d'
          : '1px solid #21262d';
        return (
          <tr
            key={br ? `${group.key}-b${i}` : `${group.key}-only`}
            ref={isFirstSub ? setNodeRef : undefined}
            style={style}
            {...(isFirstSub ? attributes : {})}
          >
            {isFirstSub && (
              <td
                rowSpan={span}
                style={{
                  ...gripCellStyle,
                  borderTop: '2px solid #30363d',
                  background: 'transparent',
                }}
              >
                {draggable ? (
                  <button
                    type="button"
                    {...listeners}
                    style={gripButtonStyle}
                    aria-label="Drag to reorder this type"
                    title="Drag to reorder this type"
                    data-testid="type-banner-drag-handle"
                  >
                    ⋮⋮
                  </button>
                ) : null}
              </td>
            )}
            {isFirstSub && (
              <td
                rowSpan={span}
                colSpan={labelSpan}
                style={{
                  padding: '8px 10px',
                  borderTop: '2px solid #30363d',
                  borderRight: '1px solid #161b22',
                  color: '#e6edf3',
                  fontWeight: 700,
                  fontSize: '13px',
                  // Director adjustment 2026-05-30-d (#1): top-align the
                  // type name, not vertical-center, now that the banner can
                  // be several bullet sub-rows tall.
                  verticalAlign: 'top',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>{group.label}</span>
                  <button
                    type="button"
                    onClick={() => onHideType(group.key)}
                    style={hideButtonStyle}
                    aria-label={`Hide the ${group.label} type from this page`}
                    title="Hide this type from this page (restore it from the panel above)"
                    data-testid="type-hide-button"
                  >
                    ✕
                  </button>
                </span>
              </td>
            )}
            {typeLevelColumns.map((c) => {
              const isPerBullet =
                c.id === 'typeBulleted' || c.id === 'typeSourceReviews';
              // Non-bulleted prose spans the whole type height (rowSpan).
              if (!isPerBullet) {
                if (!isFirstSub) return null;
                const content = c.id === 'typeNonBulleted' ? nonBulletedSummary : '';
                return (
                  <td
                    key={c.id}
                    rowSpan={span}
                    style={{
                      padding: '6px 10px',
                      borderTop: '2px solid #30363d',
                      borderRight: '1px solid #161b22',
                      color: content ? '#e6edf3' : '#6e7681',
                      fontStyle: content ? 'normal' : 'italic',
                      fontSize: '12px',
                      verticalAlign: 'top',
                      whiteSpace: 'pre-wrap',
                    }}
                    data-testid={`type-ai-cell-${c.id}`}
                  >
                    {content || '(not yet generated)'}
                  </td>
                );
              }
              const cellStyle: React.CSSProperties = {
                padding: '6px 10px',
                borderTop: topBorder,
                borderRight: '1px solid #161b22',
                fontSize: '12px',
                verticalAlign: 'top',
              };
              if (c.id === 'typeBulleted') {
                return (
                  <td
                    key={c.id}
                    style={cellStyle}
                    data-testid="type-ai-cell-typeBulleted"
                  >
                    {br ? (
                      <div>
                        {br.themeName ? (
                          <div
                            style={{
                              color: '#8b949e',
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              marginBottom: '3px',
                            }}
                          >
                            {br.themeName}
                          </div>
                        ) : null}
                        <div style={{ color: '#e6edf3' }}>• {br.bulletText}</div>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: bulletedSummary ? '#e6edf3' : '#6e7681',
                          fontStyle: bulletedSummary ? 'normal' : 'italic',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {bulletedSummary || '(not yet generated)'}
                      </span>
                    )}
                  </td>
                );
              }
              // typeSourceReviews — the reviews behind THIS sub-row's bullet.
              return (
                <td
                  key={c.id}
                  style={cellStyle}
                  data-testid="type-ai-cell-typeSourceReviews"
                >
                  {br ? (
                    <TypeBulletSources
                      sources={br.sources}
                      projectId={projectId}
                    />
                  ) : (
                    <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
                      (run the bulleted analysis to see source reviews)
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

// One flattened bullet sub-row of a type banner: the bullet text, the
// theme label (only on the theme's first bullet), and the cross-competitor
// source reviews behind that bullet.
interface BannerBulletRow {
  themeName: string | null;
  bulletText: string;
  sources: CategorySourceReview[];
}

// ─── Source Reviews for ONE type bullet (a.117 / 2026-05-30-d) ─────────
// The individual reviews across all in-type competitors that traced up to
// a single type bullet: product · stars · review text · jump-to-detail
// link. Rendered inside that bullet's Source Reviews sub-row cell, aligned
// with the bullet in the "Type Comprehensive (bulleted)" column.
function TypeBulletSources({
  sources,
  projectId,
}: {
  sources: CategorySourceReview[];
  projectId: string;
}): JSX.Element {
  if (sources.length === 0) {
    return (
      <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
        (no individual reviews traced to this point)
      </span>
    );
  }
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {sources.map((s, si) => (
        <li
          key={si}
          style={{ borderLeft: '2px solid #21262d', paddingLeft: '8px' }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#c9d1d9', fontWeight: 600 }}>
              {s.productName}
            </span>
            <TypeStarCount value={s.starRating} />
            {s.missing || !s.urlId ? null : (
              <a
                href={`/projects/${projectId}/competition-scraping/url/${s.urlId}#review-${s.reviewId}`}
                title="Jump to this review's detail page"
                data-testid="type-source-review-jump"
                style={{
                  color: '#58a6ff',
                  textDecoration: 'none',
                  fontSize: '12px',
                }}
              >
                ↗
              </a>
            )}
          </span>
          <span
            style={{
              color: s.missing ? '#6e7681' : '#8b949e',
              fontStyle: s.missing ? 'italic' : 'normal',
              display: 'block',
            }}
          >
            {s.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

function TypeStarCount({ value }: { value: number | null }): JSX.Element {
  if (value == null) {
    return <span style={{ color: '#6e7681', fontSize: '11px' }}>☆☆☆☆☆</span>;
  }
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span style={{ color: '#e3b341', fontSize: '11px' }} title={`${value} stars`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  );
}

// ─── A single competitor (one or more review sub-rows), draggable ──────

interface SortableTypeRowProps {
  row: TypeDisplayRow<CompetitorUrl>;
  visibleColumns: ReadonlyArray<TypeTableColumnDef>;
  reviewsState: ReviewsLoadState | undefined;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  bulleted: string;
  nonBulleted: string;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  onHideUrl: (urlId: string) => void;
}

function SortableTypeRow({
  row,
  visibleColumns,
  reviewsState,
  summaryByReviewId,
  bulleted,
  nonBulleted,
  onUrlCellSave,
  onHideUrl,
}: SortableTypeRowProps): JSX.Element {
  const u = row.url;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: u.id });

  // The transform moves the whole competitor block: applied to every sub-row
  // so the stacked Stars/Reviews rows travel together during a drag.
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isDragging ? '#161b22' : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const perReviewVisible = visibleColumns.some(
    (c) => c.id === 'stars' || c.id === 'reviewsSummary'
  );
  const reviews = sortedReviewsOf(reviewsState);

  let starsPlaceholder = '—';
  let summaryPlaceholder = 'no reviews';
  if (reviewsState === undefined || reviewsState.kind === 'loading') {
    starsPlaceholder = '…';
    summaryPlaceholder = 'loading…';
  } else if (reviewsState.kind === 'error') {
    starsPlaceholder = '!';
    summaryPlaceholder = 'failed to load';
  }

  const hasList = perReviewVisible && !!reviews && reviews.length > 0;
  const subRows: Array<CapturedReview | null> = hasList ? reviews! : [null];
  const span = subRows.length;

  return (
    <>
      {subRows.map((review, i) => {
        const isFirstSub = i === 0;
        const isLastSub = i === subRows.length - 1;
        return (
          <tr
            key={review ? review.id : `${u.id}-only`}
            ref={isFirstSub ? setNodeRef : undefined}
            style={dragStyle}
            {...(isFirstSub ? attributes : {})}
          >
            {/* Leftmost grip / hide cell — one per competitor (rowSpan). */}
            {isFirstSub && (
              <td rowSpan={span} style={gripCellStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    {...listeners}
                    style={gripButtonStyle}
                    aria-label="Drag to reorder this competitor"
                    title="Drag to reorder this competitor within its type"
                    data-testid="type-competitor-drag-handle"
                  >
                    ⋮⋮
                  </button>
                  <button
                    type="button"
                    onClick={() => onHideUrl(u.id)}
                    style={hideButtonStyle}
                    aria-label="Hide this competitor from this page"
                    title="Hide this competitor from this page (restore it from the panel above)"
                    data-testid="type-competitor-hide-button"
                  >
                    ✕
                  </button>
                </div>
              </td>
            )}
            {visibleColumns.map((c) => {
              const isPerReview = c.id === 'stars' || c.id === 'reviewsSummary';
              if (!isPerReview) {
                if (!isFirstSub) return null;
                const isAi = AI_COLUMN_IDS.has(c.id);
                return (
                  <td
                    key={c.id}
                    rowSpan={span}
                    style={{
                      padding: isAi ? 0 : '6px 10px',
                      borderRight: '1px solid #161b22',
                      borderTop: '1px solid #21262d',
                      verticalAlign: 'top',
                      color: '#e6edf3',
                      position: isAi ? 'relative' : undefined,
                    }}
                  >
                    {renderDataCell(c, row, u, bulleted, nonBulleted, onUrlCellSave)}
                  </td>
                );
              }
              return (
                <td
                  key={c.id}
                  style={{
                    padding: '5px 10px',
                    borderRight: '1px solid #161b22',
                    borderTop: isFirstSub ? '1px solid #21262d' : undefined,
                    borderBottom: isLastSub ? undefined : '1px solid #21262d',
                    verticalAlign: 'top',
                    color: '#e6edf3',
                  }}
                >
                  {c.id === 'stars' ? (
                    <StarCell review={review} placeholder={starsPlaceholder} />
                  ) : (
                    <SummaryCell
                      review={review}
                      summaryByReviewId={summaryByReviewId}
                      placeholder={summaryPlaceholder}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

function renderDataCell(
  c: TypeTableColumnDef,
  row: TypeDisplayRow<CompetitorUrl>,
  u: CompetitorUrl,
  bulleted: string,
  nonBulleted: string,
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>
): JSX.Element {
  const save = (patch: UpdateCompetitorUrlRequest) => onUrlCellSave(u.id, patch);

  switch (c.id) {
    case 'type':
      // The type name now lives on the banner row; competitor rows leave
      // Column 1 blank (the grouping signal).
      return <span />;
    case 'platform':
      return (
        <InlineEnumCell<Platform>
          value={u.platform}
          options={PLATFORM_OPTIONS}
          onSave={(next) => save({ platform: next })}
        />
      );
    case 'competitionCategory':
      return (
        <InlineTextCell
          value={u.competitionCategory}
          onSave={(next) => save({ competitionCategory: next })}
          placeholder="(category)"
        />
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
    case 'compBulleted':
      return <SummaryTextCell text={bulleted} />;
    case 'compNonBulleted':
      return <SummaryTextCell text={nonBulleted} />;
    case 'typeBulleted':
    case 'typeNonBulleted':
      // Category-level AI content lives on the banner row; blank here.
      return <span />;
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

function StarCell({
  review,
  placeholder,
}: {
  review: CapturedReview | null;
  placeholder: string;
}): JSX.Element {
  if (!review) {
    return <span style={{ color: '#6e7681', fontSize: '12px' }}>{placeholder}</span>;
  }
  return (
    <span style={{ color: '#f0b341', fontSize: '12px', whiteSpace: 'nowrap' }}>
      {'★'.repeat(Math.max(0, Math.min(5, Math.round(review.starRating))))}
    </span>
  );
}

function SummaryCell({
  review,
  summaryByReviewId,
  placeholder,
}: {
  review: CapturedReview | null;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  placeholder: string;
}): JSX.Element {
  if (!review) {
    return (
      <span style={{ color: '#6e7681', fontSize: '12px', fontStyle: 'italic' }}>
        {placeholder}
      </span>
    );
  }
  const summary = summaryByReviewId[review.id]?.summary ?? '';
  return (
    <span
      style={{
        display: 'block',
        fontSize: '12px',
        lineHeight: 1.5,
        color: summary ? '#e6edf3' : '#6e7681',
        fontStyle: summary ? 'normal' : 'italic',
        whiteSpace: 'pre-wrap',
      }}
    >
      {summary || '(not summarized)'}
    </span>
  );
}

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

// ─── shared grip / hide control styles ─────────────────────────────────

const gripCellStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '4px 2px',
  borderRight: '1px solid #161b22',
  borderTop: '1px solid #21262d',
  color: '#484f58',
  verticalAlign: 'top',
  userSelect: 'none',
};

const gripButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#6e7681',
  cursor: 'grab',
  padding: '2px',
  fontSize: '13px',
  fontFamily: 'inherit',
  lineHeight: '13px',
  letterSpacing: '-1px',
  touchAction: 'none',
};

const hideButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#8b949e',
  cursor: 'pointer',
  padding: '0 4px',
  fontSize: '11px',
  lineHeight: '16px',
  fontFamily: 'inherit',
};

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

function typeAiButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: 600,
    background: disabled ? '#21262d' : '#1f6feb',
    color: disabled ? '#6e7681' : '#fff',
    border: '1px solid ' + (disabled ? '#30363d' : '#388bfd'),
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

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
