'use client';

// W#2 P-49 Workstream 5 Sessions 2-3 — Table 2 Competitor Reviews
// Analysis page per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27
// (Reviews Phase 3 design lock) + §B 2026-05-27-b (Session 2) +
// §B 2026-05-27-c (Session 3 Per-Competitor flow).
//
// Route: /projects/[projectId]/competition-scraping/competitor-reviews-analysis
//
// Session 2 (shipped 2026-05-27) — per-review nested-rows table +
// Per-Review Summarize button + modal (browser batch loop firing the
// per-batch server endpoint).
// Session 3 (this session) — Per-Competitor Summarize button + modal
// + summary banner row showing the theme-grouped bulleted aggregate
// output per URL. ONE Anthropic call per click; output is a single
// summary string for the URL's full review corpus.
// Later sessions will add per-category + per-type comprehensive flows
// (Tables 3 + 4 under the "By Category-Type" toggle option).
//
// Data model:
//   - Page loads all CompetitorUrls for the Project on mount.
//   - When a URL row expands, fetches that URL's CapturedReviews.
//   - Per-review summary cells populate live as Per-Review Summarize
//     batches return.
//   - Per-Competitor summary banners populate live as the single AI
//     call returns; visible at the URL row level without expanding.
//   - Summaries are persisted server-side (PER_REVIEW + PER_PRODUCT
//     rows in ReviewAnalysis) but are NOT re-loaded on page refresh
//     in this version — bulk-load read-back ships in a later session.

import { useCallback, useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type {
  CapturedReview,
  CompetitorUrl,
  Platform,
  UpdateCapturedReviewRequest,
  UpdateCapturedReviewResponse,
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
  REVIEWS_TABLE_COLUMNS,
  buildUrlRowGrid,
  computeReviewsSummaryCount,
  isReviewsColumnVisible,
  type ReviewsTableColumnDef,
} from '@/lib/competition-scraping/reviews-analysis-table-columns';
import { PerReviewSummarizeModal } from './components/PerReviewSummarizeModal';
import { PerCompetitorSummarizeModal } from './components/PerCompetitorSummarizeModal';
import { GlobalCompetitorSummarizeModal } from './components/GlobalCompetitorSummarizeModal';

const WORKFLOW_SLUG = 'competition-scraping';

type UrlsLoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: CompetitorUrl[] }
  | { kind: 'error'; message: string };

type ReviewsLoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; reviews: CapturedReview[] }
  | { kind: 'error'; message: string };

export default function CompetitorReviewsAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
  });

  const [urlsState, setUrlsState] = useState<UrlsLoadState>({ kind: 'loading' });
  // per-urlId expansion state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // per-urlId reviews cache
  const [reviewsByUrl, setReviewsByUrl] = useState<
    Record<string, ReviewsLoadState>
  >({});
  // per-reviewId summary cache (populated by AI runs in-session)
  const [summaryByReviewId, setSummaryByReviewId] = useState<
    Record<string, { summary: string; source: 'cache' | 'fresh' }>
  >({});
  // per-urlId Per-Competitor summary cache (populated by Session 3+
  // Per-Competitor Summarize runs). One aggregated summary per URL.
  // analysisId is the ReviewAnalysis row id — required for the Edit
  // affordance's PATCH call.
  const [competitorSummaryByUrlId, setCompetitorSummaryByUrlId] = useState<
    Record<
      string,
      { analysisId: string; summary: string; source: 'cache' | 'fresh' }
    >
  >({});

  // Modal state — Table 2 hosts three AI flow surfaces so we track
  // which is open. Only one modal open at a time; the other slots are
  // null when the first is shown.
  const [modalUrl, setModalUrl] = useState<CompetitorUrl | null>(null);
  const [competitorModalUrl, setCompetitorModalUrl] = useState<CompetitorUrl | null>(null);
  const [globalModalOpen, setGlobalModalOpen] = useState<boolean>(false);

  // P-49 W5 Fix Session A (2026-05-29) — per-user column visibility for
  // the 10 spec columns. Default empty map → all visible (the
  // isColumnVisible helper treats missing keys as visible). Persistence
  // to UserTablePreferences ships in Fix Session B alongside the other
  // PATCH-endpoint extensions — until then the visibility resets on
  // refresh (acceptable for Fix Session A's "smallest verifiable unit"
  // scope per spec §3).
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // P-49 W5 Fix Session A (2026-05-29) — click-to-edit save handlers
  // wired to the existing PATCH endpoints (Q6 → A single source of
  // truth). URL-row cell edits target /urls/[urlId]; review-row cell
  // edits target /reviews/[reviewId]. Both throw on PATCH failure so
  // the inline cell can render its error pill.
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

  const handleReviewCellSave = useCallback(
    async (
      urlId: string,
      reviewId: string,
      patch: UpdateCapturedReviewRequest
    ): Promise<void> => {
      if (!projectId) throw new Error('Project id missing.');
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/reviews/${reviewId}`,
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
      const updated = (await res.json()) as UpdateCapturedReviewResponse;
      setReviewsByUrl((prev) => {
        const state = prev[urlId];
        if (!state || state.kind !== 'loaded') return prev;
        const idx = state.reviews.findIndex((r) => r.id === updated.id);
        if (idx < 0) return prev;
        const nextReviews = [...state.reviews];
        nextReviews[idx] = updated;
        return {
          ...prev,
          [urlId]: { kind: 'loaded', reviews: nextReviews },
        };
      });
    },
    [projectId]
  );

  const handleToggleColumn = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
  }, []);

  // Load all URLs for the Project on mount.
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
        // GET /urls returns the bare CompetitorUrl[] array (not
        // wrapped in { items }). Mirror the existing CompetitionScrapingViewer
        // shape so this stays consistent if the wrap convention ever changes.
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

  // Lazy-load reviews for a URL when it expands for the first time.
  async function ensureReviewsLoaded(urlId: string) {
    if (!projectId) return;
    const existing = reviewsByUrl[urlId];
    if (existing && existing.kind !== 'idle' && existing.kind !== 'error') return;
    setReviewsByUrl((prev) => ({ ...prev, [urlId]: { kind: 'loading' } }));
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/reviews`
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        setReviewsByUrl((prev) => ({
          ...prev,
          [urlId]: { kind: 'error', message: detail },
        }));
        return;
      }
      // GET /urls/[urlId]/reviews also returns the bare array.
      const body = (await res.json()) as CapturedReview[];
      const items = Array.isArray(body) ? body : [];
      setReviewsByUrl((prev) => ({
        ...prev,
        [urlId]: { kind: 'loaded', reviews: items },
      }));
    } catch (err) {
      setReviewsByUrl((prev) => ({
        ...prev,
        [urlId]: {
          kind: 'error',
          message: err instanceof Error ? err.message : 'Network error',
        },
      }));
    }
  }

  function toggleExpand(urlId: string) {
    const willExpand = !expanded[urlId];
    setExpanded((prev) => ({ ...prev, [urlId]: willExpand }));
    if (willExpand) void ensureReviewsLoaded(urlId);
  }

  function handleSummary(
    reviewId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) {
    setSummaryByReviewId((prev) => ({ ...prev, [reviewId]: { summary, source } }));
  }

  function handleCompetitorSummary(
    urlId: string,
    analysisId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) {
    setCompetitorSummaryByUrlId((prev) => ({
      ...prev,
      [urlId]: { analysisId, summary, source },
    }));
  }

  // Called by CompetitorSummaryBanner after a successful PATCH so the
  // local Table 2 state reflects the edit immediately.
  function handleCompetitorSummaryEdited(urlId: string, summary: string) {
    setCompetitorSummaryByUrlId((prev) => {
      const existing = prev[urlId];
      if (!existing) return prev;
      // Edited summaries are treated as 'cache' source going forward —
      // they're persisted to the DB row, so subsequent reloads see them
      // from cache.
      return {
        ...prev,
        [urlId]: { ...existing, summary, source: 'cache' },
      };
    });
  }

  // Helper for the Per-Competitor button — we need the FULL review
  // corpus loaded before we can fire the AI call (the browser-side
  // prompt preview needs review bodies; the wire call needs reviewIds).
  // If reviews aren't loaded yet, kick off the load + open the modal
  // once they arrive; the modal will start in idle state and director
  // can hit Start.
  async function openCompetitorModal(u: CompetitorUrl) {
    if (!projectId) return;
    const existing = reviewsByUrl[u.id];
    if (!existing || existing.kind !== 'loaded') {
      await ensureReviewsLoaded(u.id);
    }
    setCompetitorModalUrl(u);
  }

  if (ctx.loading || !ctx.project) {
    return (
      <FullPageState
        message={ctx.error ?? 'Loading…'}
        isError={!!ctx.error}
      />
    );
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <CompetitionScrapingSurfaceNav
          projectId={projectId}
          active="competitor-reviews-analysis"
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

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 6px',
            color: '#e6edf3',
          }}
        >
          Competitor Reviews Analysis
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#8b949e',
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}
        >
          AI summaries powered by Claude. Click{' '}
          <strong>Summarize Reviews for All Competitors</strong> to run the
          critique extractor across every URL with at least 2 reviews
          sequentially.{' '}
          <strong>Summarize Competitor Reviews</strong> aggregates ALL
          reviews under one URL into a theme-grouped bulleted critique
          summary (one Anthropic call per click). Expand a competitor and
          click <strong>Summarize reviews</strong> to also generate
          per-review bullet summaries via the browser batch loop. Per-
          category and per-type comprehensive flows land in later sessions.
        </p>

        {/* Global Summarize-All button */}
        {urlsState.kind === 'loaded' && urlsState.urls.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setGlobalModalOpen(true)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#238636',
                color: '#fff',
                border: '1px solid #2ea043',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Summarize Reviews for All Competitors
            </button>
          </div>
        )}

        {urlsState.kind === 'loading' && (
          <div style={{ fontSize: '13px', color: '#8b949e' }}>Loading competitors…</div>
        )}
        {urlsState.kind === 'error' && (
          <div style={errorBoxStyle}>{urlsState.message}</div>
        )}
        {urlsState.kind === 'loaded' && urlsState.urls.length === 0 && (
          <div style={{ fontSize: '13px', color: '#8b949e' }}>
            No competitor URLs in this Project yet. Capture some via the
            Chrome extension first, then come back here.
          </div>
        )}

        {urlsState.kind === 'loaded' && urlsState.urls.length > 0 && (
          <>
            <ReviewsTableColumnControls
              visibility={columnVisibility}
              onToggle={handleToggleColumn}
            />
            <UrlsTable
              projectId={projectId}
              urls={urlsState.urls}
              expanded={expanded}
              reviewsByUrl={reviewsByUrl}
              summaryByReviewId={summaryByReviewId}
              competitorSummaryByUrlId={competitorSummaryByUrlId}
              columnVisibility={columnVisibility}
              onToggle={toggleExpand}
              onOpenSummarizeModal={(u) => setModalUrl(u)}
              onOpenCompetitorModal={openCompetitorModal}
              onCompetitorSummaryEdited={handleCompetitorSummaryEdited}
              onUrlCellSave={handleUrlCellSave}
              onReviewCellSave={handleReviewCellSave}
            />
          </>
        )}
      </div>

      {modalUrl && (
        <PerReviewSummarizeModal
          projectId={projectId}
          urlId={modalUrl.id}
          productName={modalUrl.productName || modalUrl.url}
          platform={modalUrl.platform}
          reviews={getLoadedReviews(reviewsByUrl[modalUrl.id])}
          onClose={() => setModalUrl(null)}
          onSummary={handleSummary}
        />
      )}
      {competitorModalUrl && (
        <PerCompetitorSummarizeModal
          projectId={projectId}
          urlId={competitorModalUrl.id}
          productName={competitorModalUrl.productName || competitorModalUrl.url}
          platform={competitorModalUrl.platform}
          reviews={getLoadedReviews(reviewsByUrl[competitorModalUrl.id])}
          onClose={() => setCompetitorModalUrl(null)}
          onSummary={handleCompetitorSummary}
        />
      )}
      {globalModalOpen && urlsState.kind === 'loaded' && (
        <GlobalCompetitorSummarizeModal
          projectId={projectId}
          urls={urlsState.urls}
          onClose={() => setGlobalModalOpen(false)}
          onSummary={handleCompetitorSummary}
        />
      )}
    </div>
  );
}

function getLoadedReviews(state: ReviewsLoadState | undefined): CapturedReview[] {
  if (!state || state.kind !== 'loaded') return [];
  return state.reviews;
}

// ─── ReviewsTableColumnControls ─────────────────────────────────────
//
// W#2 P-49 W5 Fix Session A (2026-05-29) — per-spec show/hide bar for
// the 10 Reviews Analysis Table columns (§3 item 5). Mirrors the
// Competitor URLs sibling page's ColumnVisibilityBar pattern but
// drops the platform-filter chip group (this page doesn't filter by
// platform). Per-user persistence to UserTablePreferences ships in
// Fix Session B alongside the other PATCH-endpoint extensions.

interface ReviewsTableColumnControlsProps {
  visibility: Record<string, boolean>;
  onToggle: (columnId: string, visible: boolean) => void;
}

function ReviewsTableColumnControls({
  visibility,
  onToggle,
}: ReviewsTableColumnControlsProps): JSX.Element {
  return (
    <div
      aria-label="Column visibility controls"
      data-testid="reviews-table-column-controls"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#8b949e',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingTop: '4px',
        }}
      >
        Columns
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {REVIEWS_TABLE_COLUMNS.map((col) => {
          const visible = isReviewsColumnVisible(visibility, col.id);
          return (
            <label
              key={col.id}
              title={`Show or hide the ${col.label} column`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: visible ? '#1f6feb22' : '#161b22',
                border: '1px solid',
                borderColor: visible ? '#1f6feb55' : '#30363d',
                borderRadius: '999px',
                color: visible ? '#e6edf3' : '#c9d1d9',
                fontSize: '12px',
                cursor: 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={() => onToggle(col.id, !visible)}
                style={{ margin: 0, cursor: 'pointer' }}
                aria-label={`Show ${col.label} column`}
                data-testid={`reviews-table-column-toggle-${col.id}`}
              />
              <span>{col.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── UrlsTable ──────────────────────────────────────────────────────

interface UrlsTableProps {
  projectId: string;
  urls: CompetitorUrl[];
  expanded: Record<string, boolean>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<string, { summary: string; source: 'cache' | 'fresh' }>;
  competitorSummaryByUrlId: Record<
    string,
    { analysisId: string; summary: string; source: 'cache' | 'fresh' }
  >;
  columnVisibility: Record<string, boolean>;
  onToggle: (urlId: string) => void;
  onOpenSummarizeModal: (url: CompetitorUrl) => void;
  onOpenCompetitorModal: (url: CompetitorUrl) => void;
  onCompetitorSummaryEdited: (urlId: string, summary: string) => void;
  onUrlCellSave: (
    urlId: string,
    patch: UpdateCompetitorUrlRequest
  ) => Promise<void>;
  onReviewCellSave: (
    urlId: string,
    reviewId: string,
    patch: UpdateCapturedReviewRequest
  ) => Promise<void>;
}

const PLATFORM_OPTIONS: ReadonlyArray<{ value: Platform; label: string }> =
  PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }));

function UrlsTable({
  projectId,
  urls,
  expanded,
  reviewsByUrl,
  summaryByReviewId,
  competitorSummaryByUrlId,
  columnVisibility,
  onToggle,
  onOpenSummarizeModal,
  onOpenCompetitorModal,
  onCompetitorSummaryEdited,
  onUrlCellSave,
  onReviewCellSave,
}: UrlsTableProps): JSX.Element {
  const gridTemplate = buildUrlRowGrid(columnVisibility);
  const visibleColumns = REVIEWS_TABLE_COLUMNS.filter((c) =>
    isReviewsColumnVisible(columnVisibility, c.id)
  );
  return (
    <div
      style={{
        border: '1px solid #30363d',
        borderRadius: '8px',
        overflow: 'auto',
        background: '#0d1117',
      }}
    >
      <div style={{ minWidth: 'fit-content' }}>
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#8b949e',
            background: '#161b22',
            padding: '10px 14px',
            borderBottom: '1px solid #30363d',
          }}
        >
          <span></span>
          {visibleColumns.map((col) => (
            <span key={col.id}>{col.label}</span>
          ))}
          <span style={{ textAlign: 'left' }}>Actions</span>
        </div>

        {urls.map((u) => {
          const isExpanded = !!expanded[u.id];
          const reviewsState = reviewsByUrl[u.id];
          const reviewsLoaded =
            reviewsState?.kind === 'loaded' ? reviewsState.reviews : null;
          const totalReviews = reviewsLoaded ? reviewsLoaded.length : null;
          const summarizedReviews = reviewsLoaded
            ? reviewsLoaded.reduce(
                (acc, r) => acc + (summaryByReviewId[r.id] ? 1 : 0),
                0
              )
            : null;
          const competitorSummary = competitorSummaryByUrlId[u.id];
          return (
            <div key={u.id}>
              {/* URL row — 10 spec cells + auxiliary Actions */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: gridTemplate,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: competitorSummary
                    ? '1px solid #161b22'
                    : '1px solid #21262d',
                  cursor: 'pointer',
                }}
                onClick={() => onToggle(u.id)}
              >
                <span
                  style={{ fontSize: '12px', color: '#8b949e' }}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? '▾' : '▸'}
                </span>

                {/* Render each visible spec column in order */}
                {visibleColumns.map((col) =>
                  renderUrlRowCell({
                    col,
                    url: u,
                    onUrlCellSave,
                    summarizedReviews,
                    totalReviews,
                    competitorSummary,
                  })
                )}

                {/* Actions column — per-URL inline AI-flow buttons.
                    Auxiliary (NOT in the 10 spec columns; not in the
                    column-visibility checkbox set). Per Q4 → A: both
                    top-of-page global buttons AND per-URL inline
                    buttons remain. */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignItems: 'flex-start',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onOpenCompetitorModal(u)}
                    disabled={reviewsState?.kind === 'loading'}
                    style={competitorButtonStyle(reviewsState?.kind)}
                    title="Summarize Competitor Reviews"
                  >
                    Competitor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isExpanded) onToggle(u.id);
                      onOpenSummarizeModal(u);
                    }}
                    disabled={reviewsState?.kind === 'loading'}
                    style={summarizeButtonStyle(reviewsState?.kind)}
                    title="Summarize reviews"
                  >
                    Reviews
                  </button>
                </div>
              </div>

              {/* Per-Competitor summary banner row (visible without
                  expanding) — shows the theme-grouped bulleted output
                  for the URL + Edit affordance to override the AI text
                  inline. */}
              {competitorSummary && (
                <CompetitorSummaryBanner
                  projectId={projectId}
                  urlId={u.id}
                  summary={competitorSummary}
                  onEdited={onCompetitorSummaryEdited}
                />
              )}

              {/* Expanded review rows */}
              {isExpanded && (
                <ReviewsList
                  urlId={u.id}
                  state={reviewsState}
                  summaryByReviewId={summaryByReviewId}
                  onReviewCellSave={onReviewCellSave}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── URL row cell rendering ─────────────────────────────────────────
//
// Each visible column on the URL row maps to one of:
//   - InlineEnumCell for `platform` (single source of truth — PATCH
//     propagates to CompetitorUrl.platform; same edit reflects on the
//     Competitor URLs sibling page).
//   - InlineTextCell for `competitionCategory`, `type`, `productName`,
//     `url` (PATCH targets the same field on CompetitorUrl).
//   - InlineNumberCell for `resultsPageRank`, `competitionScore`.
//   - Plain-text non-editable display for `reviewsSummaryCount` (Q10
//     → A — "N of M summarized" computed from current state; not
//     editable since it's a computed cell, not a stored field).
//   - Plain-text non-editable display for `compBulleted` (the per-
//     competitor bulleted summary already lives in the existing
//     CompetitorSummaryBanner row below the URL row — this URL-row
//     Column 9 cell shows a compact preview / empty state. The
//     editable surface stays the banner row's Edit button per Q9
//     deferred to Fix Session B).
//   - Empty placeholder for `compNonBulleted` (column ships in Fix
//     Session C when the per-competitor non-bulleted flow lands).

interface UrlRowCellArgs {
  col: ReviewsTableColumnDef;
  url: CompetitorUrl;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  summarizedReviews: number | null;
  totalReviews: number | null;
  competitorSummary:
    | { analysisId: string; summary: string; source: 'cache' | 'fresh' }
    | undefined;
}

function renderUrlRowCell({
  col,
  url,
  onUrlCellSave,
  summarizedReviews,
  totalReviews,
  competitorSummary,
}: UrlRowCellArgs): JSX.Element {
  const cellWrapper = (children: React.ReactNode) => (
    <span
      key={col.id}
      style={{ fontSize: '12px', color: '#e6edf3', minWidth: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </span>
  );

  switch (col.id) {
    case 'platform':
      return cellWrapper(
        <InlineEnumCell<Platform>
          value={url.platform}
          options={PLATFORM_OPTIONS}
          onSave={(next) => onUrlCellSave(url.id, { platform: next })}
        />
      );
    case 'competitionCategory':
      return cellWrapper(
        <InlineTextCell
          value={url.competitionCategory}
          onSave={(next) => onUrlCellSave(url.id, { competitionCategory: next })}
        />
      );
    case 'type':
      return cellWrapper(
        <InlineTextCell
          value={url.type}
          onSave={(next) => onUrlCellSave(url.id, { type: next })}
        />
      );
    case 'productName':
      return cellWrapper(
        <InlineTextCell
          value={url.productName}
          onSave={(next) => onUrlCellSave(url.id, { productName: next })}
        />
      );
    case 'resultsPageRank':
      return cellWrapper(
        <InlineNumberCell
          value={url.resultsPageRank}
          onSave={(next) => onUrlCellSave(url.id, { resultsPageRank: next })}
          integer
          min={1}
          align="right"
        />
      );
    case 'competitionScore':
      return cellWrapper(
        <InlineNumberCell
          value={url.competitionScore}
          onSave={(next) => onUrlCellSave(url.id, { competitionScore: next })}
          integer
          align="right"
        />
      );
    case 'url':
      return cellWrapper(
        <InlineTextCell
          value={url.url}
          onSave={(next) =>
            onUrlCellSave(url.id, { url: next ?? undefined })
          }
          formatRead={(raw) =>
            raw ? (
              <span
                style={{
                  color: '#58a6ff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
              >
                {raw}
              </span>
            ) : null
          }
        />
      );
    case 'reviewsSummaryCount': {
      // Q10 → A — plain text "N of M summarized". When reviews haven't
      // been loaded yet for this URL, surface a passive hint instead of
      // 0/? since the actual numbers materialize once the row expands.
      // Branch logic lives in the pure helper for node:test coverage.
      const cell = computeReviewsSummaryCount(summarizedReviews, totalReviews);
      let display: React.ReactNode;
      if (cell.kind === 'not-loaded') {
        display = (
          <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
            expand to load
          </span>
        );
      } else if (cell.kind === 'no-reviews') {
        display = <span style={{ color: '#6e7681' }}>no reviews</span>;
      } else {
        display = cell.text;
      }
      return cellWrapper(display);
    }
    case 'compBulleted': {
      // The full Per-Competitor Summary text lives in the banner row
      // below the URL row (with the Edit button). The URL-row Column 9
      // cell shows whether a summary exists for the URL — once Fix
      // Session B opens click-to-edit on this cell, the affordance
      // surfaces here.
      if (competitorSummary) {
        return cellWrapper(
          <span style={{ color: '#8b949e' }}>summary below</span>
        );
      }
      return cellWrapper(<span style={{ color: '#6e7681' }}>—</span>);
    }
    case 'compNonBulleted':
      // Ships in Fix Session C alongside the NEW per-competitor non-
      // bulleted AI flow + Auto-create non-bulleted button.
      return cellWrapper(
        <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
          (Fix Session C)
        </span>
      );
    default:
      return cellWrapper(<span style={{ color: '#6e7681' }}>—</span>);
  }
}

// ─── CompetitorSummaryBanner ────────────────────────────────────────

interface CompetitorSummaryBannerProps {
  projectId: string;
  urlId: string;
  summary: { analysisId: string; summary: string; source: 'cache' | 'fresh' };
  onEdited: (urlId: string, summary: string) => void;
}

function CompetitorSummaryBanner({
  projectId,
  urlId,
  summary,
  onEdited,
}: CompetitorSummaryBannerProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(summary.summary);
  const [saveState, setSaveState] = useState<
    | { kind: 'idle' }
    | { kind: 'saving' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  function startEdit() {
    setDraft(summary.summary);
    setSaveState({ kind: 'idle' });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveState({ kind: 'idle' });
  }

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setSaveState({
        kind: 'error',
        message: 'Summary cannot be empty.',
      });
      return;
    }
    if (!summary.analysisId) {
      setSaveState({
        kind: 'error',
        message:
          'This summary cannot be edited (no row id — re-run Summarize Competitor Reviews to persist it).',
      });
      return;
    }
    setSaveState({ kind: 'saving' });
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/review-analysis/${summary.analysisId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: trimmed }),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        setSaveState({ kind: 'error', message: detail });
        return;
      }
      const body = (await res.json()) as { id: string; summary: string };
      onEdited(urlId, body.summary);
      setEditing(false);
      setSaveState({ kind: 'idle' });
    } catch (err) {
      setSaveState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    }
  }

  return (
    <div
      style={{
        background: '#0a1320',
        borderBottom: '1px solid #21262d',
        padding: '12px 14px 14px 50px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#8b949e',
            fontWeight: 700,
          }}
        >
          Per-Competitor Summary
          {summary.source === 'cache' && (
            <span
              style={{
                marginLeft: '6px',
                fontSize: '9px',
                color: '#6e7681',
              }}
            >
              (cached)
            </span>
          )}
        </div>
        {!editing && summary.analysisId && (
          <button
            type="button"
            onClick={startEdit}
            style={editButtonStyle}
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={saveState.kind === 'saving'}
            style={{
              width: '100%',
              minHeight: '160px',
              fontSize: '12px',
              color: '#e6edf3',
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '10px 12px',
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Sans', sans-serif",
              resize: 'vertical',
              whiteSpace: 'pre-wrap',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '8px',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={saveEdit}
              disabled={saveState.kind === 'saving'}
              style={{
                ...savePrimaryStyle,
                opacity: saveState.kind === 'saving' ? 0.7 : 1,
                cursor: saveState.kind === 'saving' ? 'wait' : 'pointer',
              }}
            >
              {saveState.kind === 'saving' ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saveState.kind === 'saving'}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            {saveState.kind === 'error' && (
              <span style={{ fontSize: '11px', color: '#f85149' }}>
                {saveState.message}
              </span>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            fontSize: '12px',
            color: '#e6edf3',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {summary.summary}
        </div>
      )}
    </div>
  );
}

const editButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#58a6ff',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '11px',
  cursor: 'pointer',
  fontWeight: 600,
};

const savePrimaryStyle: React.CSSProperties = {
  background: '#238636',
  color: '#fff',
  border: '1px solid #2ea043',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 600,
};

const cancelButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
};

function summarizeButtonStyle(
  state: ReviewsLoadState['kind'] | undefined
): React.CSSProperties {
  const loading = state === 'loading';
  return {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    background: loading ? '#21262d' : '#1f6feb',
    color: '#fff',
    border: '1px solid #388bfd',
    borderRadius: '6px',
    cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };
}

function competitorButtonStyle(
  state: ReviewsLoadState['kind'] | undefined
): React.CSSProperties {
  const loading = state === 'loading';
  return {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    // Distinct color from "Summarize reviews" (blue) so director can
    // tell the two actions apart at a glance: green = competitor-level
    // aggregation, blue = per-review batch loop.
    background: loading ? '#21262d' : '#238636',
    color: '#fff',
    border: '1px solid #2ea043',
    borderRadius: '6px',
    cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };
}

// ─── ReviewsList ────────────────────────────────────────────────────
//
// W#2 P-49 W5 Fix Session A (2026-05-29) — review-row click-to-edit on
// star / reviewer / date / body cells per spec §3 item 7 + Q6 → A
// (single source of truth — PATCH propagates to CapturedReview columns
// reflected on the URL detail page's reviews surface).
//
// Per-review summary cell (the "Summary" column) STAYS read-only in
// Fix Session A. Click-to-edit on per-review summary cells lands in
// Fix Session B alongside the PATCH endpoint extension to accept
// PER_REVIEW edits (D-11 fix; currently rejected at
// review-analysis-update.ts:181-193) and the Q9 Edit-button UI
// pattern decision.

const REVIEW_ROW_GRID = '50px 80px 1fr 140px 110px 1fr';

interface ReviewsListProps {
  urlId: string;
  state: ReviewsLoadState | undefined;
  summaryByReviewId: Record<string, { summary: string; source: 'cache' | 'fresh' }>;
  onReviewCellSave: (
    urlId: string,
    reviewId: string,
    patch: UpdateCapturedReviewRequest
  ) => Promise<void>;
}

function ReviewsList({
  urlId,
  state,
  summaryByReviewId,
  onReviewCellSave,
}: ReviewsListProps): JSX.Element {
  if (!state || state.kind === 'idle' || state.kind === 'loading') {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          fontSize: '12px',
          color: '#8b949e',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        Loading reviews…
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        <span style={errorBoxStyle}>Failed to load: {state.message}</span>
      </div>
    );
  }
  if (state.reviews.length === 0) {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          fontSize: '12px',
          color: '#8b949e',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        No reviews captured yet for this URL.
      </div>
    );
  }
  return (
    <div style={{ background: '#0a0d12', borderBottom: '1px solid #21262d' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: REVIEW_ROW_GRID,
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#6e7681',
          padding: '8px 14px 8px 50px',
          borderBottom: '1px solid #21262d',
        }}
      >
        <span></span>
        <span>Star</span>
        <span>Body</span>
        <span>Reviewer</span>
        <span>Date</span>
        <span>Summary</span>
      </div>
      {state.reviews.map((r) => {
        const summary = summaryByReviewId[r.id];
        // Per-review save bound to this row's id so each cell only needs
        // to pass its single-field patch.
        const saveCell = (patch: UpdateCapturedReviewRequest) =>
          onReviewCellSave(urlId, r.id, patch);
        return (
          <div
            key={r.id}
            style={{
              display: 'grid',
              gridTemplateColumns: REVIEW_ROW_GRID,
              padding: '10px 14px 10px 50px',
              borderBottom: '1px solid #161b22',
              alignItems: 'flex-start',
              fontSize: '12px',
              color: '#e6edf3',
              lineHeight: 1.5,
            }}
          >
            <span></span>
            <span style={{ color: '#f0b341' }}>
              <InlineNumberCell
                value={r.starRating}
                onSave={(next) =>
                  next == null
                    ? Promise.reject(new Error('Star required'))
                    : saveCell({ starRating: next })
                }
                integer
                min={1}
                max={5}
                align="left"
                formatRead={(raw) =>
                  raw == null ? null : (
                    <span style={{ color: '#f0b341' }}>{'★'.repeat(raw)}</span>
                  )
                }
              />
            </span>
            <span
              style={{
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#e6edf3',
              }}
            >
              <InlineTextCell
                value={r.body}
                onSave={(next) =>
                  next == null
                    ? Promise.reject(new Error('Body required'))
                    : saveCell({ body: next })
                }
                multiline
              />
            </span>
            <span style={{ color: '#8b949e' }}>
              <InlineTextCell
                value={r.reviewerName}
                onSave={(next) =>
                  saveCell({
                    reviewerName: next ?? undefined,
                  })
                }
              />
            </span>
            <span style={{ color: '#8b949e' }}>
              <InlineTextCell
                value={r.reviewDate ? r.reviewDate.slice(0, 10) : null}
                onSave={(next) =>
                  saveCell({
                    reviewDate: next ?? undefined,
                  })
                }
                placeholder="YYYY-MM-DD"
              />
            </span>
            <span
              style={{
                color: summary ? '#e6edf3' : '#6e7681',
                // v2 prompt emits "- bullet\n- bullet" newline-separated
                // strings; pre-wrap preserves the line breaks so each
                // bullet shows on its own line.
                whiteSpace: 'pre-wrap',
              }}
            >
              {summary ? (
                <>
                  {summary.summary}
                  {summary.source === 'cache' && (
                    <span
                      style={{
                        marginLeft: '6px',
                        fontSize: '9px',
                        color: '#6e7681',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      (cached)
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontStyle: 'italic' }}>not summarized</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page-state placeholders ────────────────────────────────────────

const errorBoxStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#3b1f1f',
  color: '#ffa198',
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  border: '1px solid #5c2828',
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
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
      }}
    >
      <span style={{ color: isError ? '#f85149' : '#8b949e' }}>{message}</span>
    </div>
  );
}
