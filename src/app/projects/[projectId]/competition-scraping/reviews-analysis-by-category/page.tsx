'use client';

// W#2 P-49 W5 Category page — Session 1 scaffold (2026-05-30).
//
// Route: /projects/[projectId]/competition-scraping/reviews-analysis-by-category
//
// The "Reviews Analysis By Competitor Category Table" re-lists every
// CompetitorUrl's review data grouped by `competitionCategory`: the first row
// of each category group carries the category name in Column 1; subsequent
// rows in the group leave Column 1 blank (the grouping signal). URLs with no
// category bucket into `(Uncategorized)`, which always sorts last.
//
// SESSION-1 SCOPE (per docs/polish-item-specs/P-49-W5-S4-category-page.md §2
// Q4 decomposition): the page route + the flat 13-column grouped table +
// column show/hide checkboxes (persisted) + click-to-edit cells on the
// URL-backed columns. Per-review Stars + Reviews Summary render as stacked
// per-review lists (Q-A/Q-B → "per-review stacked", 2026-05-30). The two
// per-competitor AI columns (10 + 11) display the summaries already generated
// on the sibling Competitor Reviews Analysis page (Q-C → "reuse the shipped
// prose flow"). The two category-level AI columns (12 + 13) show a
// "(not yet generated)" placeholder — their AI generation + write-back land
// in Session 2. NO drag, NO AI-run buttons, NO Excel export this session
// (Sessions 2 + 3).

import { useCallback, useEffect, useState } from 'react';
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
import {
  CATEGORY_TABLE_COLUMNS,
  CATEGORY_TABLE_PREF_PREFIX,
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

type UrlsLoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: CompetitorUrl[] }
  | { kind: 'error'; message: string };

type ReviewsLoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; reviews: CapturedReview[] }
  | { kind: 'error'; message: string };

// Per-competitor / per-review summary cache shapes (mirror the sibling page).
type ReviewSummaryEntry = { summary: string; source: 'cache' };
type CompetitorSummaryEntry = { summary: string; source: 'cache' };

export default function ReviewsAnalysisByCategoryPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({ projectId, workflowSlug: WORKFLOW_SLUG });

  const [urlsState, setUrlsState] = useState<UrlsLoadState>({ kind: 'loading' });
  // Per-urlId captured-reviews cache. Eager-loaded for every URL on mount so
  // the always-visible per-review stacked Stars + Reviews Summary columns
  // (Q-A/Q-B) render without a per-row expand click.
  const [reviewsByUrl, setReviewsByUrl] = useState<
    Record<string, ReviewsLoadState>
  >({});
  // Per-reviewId summary cache (PER_REVIEW ReviewAnalysis rows) → Column 9.
  const [summaryByReviewId, setSummaryByReviewId] = useState<
    Record<string, ReviewSummaryEntry>
  >({});
  // Per-urlId per-competitor bulleted summary (PER_PRODUCT) → Column 10.
  const [competitorBulletedByUrlId, setCompetitorBulletedByUrlId] = useState<
    Record<string, CompetitorSummaryEntry>
  >({});
  // Per-urlId per-competitor non-bulleted prose (PER_PRODUCT, flow
  // discriminator) → Column 11.
  const [competitorNonBulletedByUrlId, setCompetitorNonBulletedByUrlId] =
    useState<Record<string, CompetitorSummaryEntry>>({});

  // Per-user column visibility for the 13 spec columns. Empty map → all
  // visible (isCategoryColumnVisible treats missing keys as visible).
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // ─── click-to-edit save handler (URL-backed columns) ───────────────
  // Mirrors the sibling page: edits target the existing PATCH /urls/[urlId]
  // endpoint (single source of truth — reflects on the Competitor Content
  // Table too). Throws on failure so the inline cell renders its error pill.
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

  // ─── load column-visibility prefs (categoryTable: prefix) ──────────
  // Reuses the shared /table-preferences record. Keys are prefixed so this
  // page's show/hide state is independent of the sibling pages' (which use
  // the `reviewsTable:` prefix + unprefixed url-table keys).
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
        };
        const incoming = body.columnVisibility ?? {};
        const local: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(incoming)) {
          if (key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) {
            local[key.slice(CATEGORY_TABLE_PREF_PREFIX.length)] = value;
          }
        }
        if (!cancelled) setColumnVisibility(local);
      } catch {
        // defaults render
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ─── persist column visibility (debounced, merge-safe) ─────────────
  // The shared /table-preferences PUT is full-replace, so we re-read the
  // current record, swap in our re-prefixed keys, and write the merged map —
  // never clobbering the sibling pages' keys.
  useEffect(() => {
    if (!projectId) return;
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const getRes = await authFetch(
            `/api/projects/${projectId}/competition-scraping/table-preferences`
          );
          let existing: Record<string, boolean> = {};
          if (getRes.ok) {
            const body = (await getRes.json()) as {
              columnVisibility?: Record<string, boolean>;
            };
            existing = body.columnVisibility ?? {};
          }
          // Drop our old prefixed keys, then re-add the current local state.
          const merged: Record<string, boolean> = {};
          for (const [key, value] of Object.entries(existing)) {
            if (!key.startsWith(CATEGORY_TABLE_PREF_PREFIX)) merged[key] = value;
          }
          for (const [key, value] of Object.entries(columnVisibility)) {
            merged[`${CATEGORY_TABLE_PREF_PREFIX}${key}`] = value;
          }
          await authFetch(
            `/api/projects/${projectId}/competition-scraping/table-preferences`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ columnVisibility: merged }),
            }
          );
        } catch {
          // best-effort; next toggle re-sends
        }
      })();
    }, 500);
    return () => clearTimeout(handle);
  }, [projectId, columnVisibility]);

  // ─── hydrate per-review + per-competitor summaries ─────────────────
  // PER_REVIEW rows → Column 9; PER_PRODUCT rows split by analysisJson.flow
  // into bulleted (Column 10) vs non-bulleted prose (Column 11).
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
  // Fired once the URL list is in. Parallel fetches; each URL's reviews land
  // in reviewsByUrl independently. Per-review summaries (Column 9) pair to
  // these by reviewId. For very large review corpora this could be heavy —
  // a lazy/expand optimization is a candidate follow-up, but Q-B chose the
  // always-visible stacked layout so the scaffold loads them up front.
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

  const groupedRows: CategoryDisplayRow<CompetitorUrl>[] =
    urlsState.kind === 'loaded' ? buildCategoryGroupedRows(urlsState.urls) : [];

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

        <ColumnVisibilityControls
          columns={CATEGORY_TABLE_COLUMNS}
          columnVisibility={columnVisibility}
          onToggleColumn={handleToggleColumn}
        />
      </div>

      {/* Table region — takes remaining height + scrolls internally. */}
      <div style={{ flex: '1 1 auto', overflow: 'auto', padding: '0 24px 24px' }}>
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
            No competitors captured yet for this project.
          </div>
        )}
        {urlsState.kind === 'loaded' && groupedRows.length > 0 && (
          <CategoryTable
            rows={groupedRows}
            visibleColumns={visibleColumns}
            reviewsByUrl={reviewsByUrl}
            summaryByReviewId={summaryByReviewId}
            competitorBulletedByUrlId={competitorBulletedByUrlId}
            competitorNonBulletedByUrlId={competitorNonBulletedByUrlId}
            onUrlCellSave={handleUrlCellSave}
          />
        )}
      </div>
    </div>
  );
}

// ─── Column visibility checkbox bar ───────────────────────────────────

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
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<string, ReviewSummaryEntry>;
  competitorBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  competitorNonBulletedByUrlId: Record<string, CompetitorSummaryEntry>;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
}

function CategoryTable({
  rows,
  visibleColumns,
  reviewsByUrl,
  summaryByReviewId,
  competitorBulletedByUrlId,
  competitorNonBulletedByUrlId,
  onUrlCellSave,
}: CategoryTableProps): JSX.Element {
  return (
    <table
      style={{
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        fontSize: '13px',
        background: '#0d1117',
      }}
    >
      <colgroup>
        {visibleColumns.map((c) => (
          <col key={c.id} style={{ width: `${resolveCategoryColumnWidth({}, c)}px` }} />
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
                zIndex: 1,
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
  // First row of a group gets a heavier top border to visually separate
  // groups. The (Uncategorized) group's rows get a muted tint.
  const rowTopBorder = row.isFirstInGroup ? '2px solid #30363d' : '1px solid #161b22';

  return (
    <tr style={{ borderTop: rowTopBorder }}>
      {visibleColumns.map((c) => (
        <td
          key={c.id}
          style={{
            padding: '6px 10px',
            borderRight: '1px solid #161b22',
            verticalAlign: 'top',
            color: '#e6edf3',
          }}
        >
          {renderCell(c, row, u, reviewsState, summaryByReviewId, bulleted, nonBulleted, onUrlCellSave)}
        </td>
      ))}
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
      // Editable on every row (changing a row re-categorizes that competitor),
      // but the displayed value is blanked on non-first rows so the grouping
      // signal (first row carries the label) stays intact.
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
      // Category-level cells render ONLY on the first (main) row of a group;
      // their data is generated in Session 2's AI flows.
      return row.isFirstInGroup ? (
        <span style={{ color: '#6e7681', fontStyle: 'italic', fontSize: '12px' }}>
          (not yet generated)
        </span>
      ) : (
        <span />
      );
    default:
      return <span />;
  }
}

// ─── per-review stacked cells (read-only) ──────────────────────────────

function sortedReviewsOf(state: ReviewsLoadState | undefined): CapturedReview[] | null {
  if (!state || state.kind !== 'loaded') return null;
  // Stable display order: by the page-specific rank when present, else
  // insertion order (the scaffold doesn't drag-reorder yet).
  return [...state.reviews].sort((a, b) => {
    const ra = a.sortRankInReviewsTable ?? Number.MAX_SAFE_INTEGER;
    const rb = b.sortRankInReviewsTable ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {reviews.map((r) => (
        <span key={r.id} style={{ color: '#f0b341', fontSize: '12px', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
          {'★'.repeat(Math.max(0, Math.min(5, Math.round(r.starRating))))}
        </span>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {reviews.map((r) => {
        const summary = summaryByReviewId[r.id]?.summary ?? '';
        return (
          <span
            key={r.id}
            style={{
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
      })}
    </div>
  );
}

function SummaryTextCell({ text }: { text: string }): JSX.Element {
  if (!text) return <span style={{ color: '#6e7681', fontSize: '12px' }}>—</span>;
  return (
    <div
      style={{
        fontSize: '12px',
        lineHeight: 1.5,
        color: '#e6edf3',
        whiteSpace: 'pre-wrap',
        maxHeight: '160px',
        overflow: 'auto',
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