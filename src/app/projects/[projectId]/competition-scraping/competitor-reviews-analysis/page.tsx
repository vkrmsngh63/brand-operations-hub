'use client';

// W#2 P-49 Workstream 5 Session 2 — Table 2 Competitor Reviews Analysis
// page per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27 (Reviews Phase
// 3 design lock).
//
// Route: /projects/[projectId]/competition-scraping/competitor-reviews-analysis
//
// First version ships the per-review nested-rows table + the Per-Review
// Summarize button + modal (browser batch loop firing the new per-batch
// server endpoint). The 6 other AI flows (per-competitor / per-category
// / per-type comprehensive bulleted/non-bulleted) land in Session 3+.
//
// Data model:
//   - Page loads all CompetitorUrls for the Project on mount.
//   - When a URL row expands, fetches that URL's CapturedReviews.
//   - Summary cells populate live as Per-Review Summarize batches return.
//   - Summaries are persisted server-side (via the per-batch endpoint's
//     ReviewAnalysis PER_REVIEW rows) but are NOT re-loaded on page
//     refresh in this v1 — that bulk-load endpoint ships in Session 3+.
//     For the first live run, summaries are visible during the session
//     they're generated in; future sessions add the read-back path.

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type {
  CapturedReview,
  CompetitorUrl,
} from '@/lib/shared-types/competition-scraping';
import { CompetitionScrapingSurfaceNav } from '../components/CompetitionScrapingSurfaceNav';
import { PerReviewSummarizeModal } from './components/PerReviewSummarizeModal';

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

  // Modal state — when set, opens the Per-Review Summarize modal for
  // the URL whose reviews are queued.
  const [modalUrl, setModalUrl] = useState<CompetitorUrl | null>(null);

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
        const body = (await res.json()) as { items: CompetitorUrl[] };
        const items = Array.isArray(body?.items) ? body.items : [];
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
      const body = (await res.json()) as { items: CapturedReview[] };
      const items = Array.isArray(body?.items) ? body.items : [];
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
            margin: '0 0 20px',
            lineHeight: 1.6,
          }}
        >
          Per-review summaries powered by Claude. Expand a competitor to view
          its reviews, then click <strong>Summarize reviews</strong> to
          generate one-sentence summaries via the browser batch loop. Session
          2 ships the Per-Review Summarize flow only; per-competitor /
          per-category / per-type comprehensive flows land in Session 3+.
        </p>

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
          <UrlsTable
            urls={urlsState.urls}
            expanded={expanded}
            reviewsByUrl={reviewsByUrl}
            summaryByReviewId={summaryByReviewId}
            onToggle={toggleExpand}
            onOpenSummarizeModal={(u) => setModalUrl(u)}
          />
        )}
      </div>

      {modalUrl && (
        <PerReviewSummarizeModal
          projectId={projectId}
          urlId={modalUrl.id}
          productName={modalUrl.productName || modalUrl.url}
          reviewIds={getLoadedReviewIds(reviewsByUrl[modalUrl.id])}
          onClose={() => setModalUrl(null)}
          onSummary={handleSummary}
        />
      )}
    </div>
  );
}

function getLoadedReviewIds(state: ReviewsLoadState | undefined): string[] {
  if (!state || state.kind !== 'loaded') return [];
  return state.reviews.map((r) => r.id);
}

// ─── UrlsTable ──────────────────────────────────────────────────────

interface UrlsTableProps {
  urls: CompetitorUrl[];
  expanded: Record<string, boolean>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<string, { summary: string; source: 'cache' | 'fresh' }>;
  onToggle: (urlId: string) => void;
  onOpenSummarizeModal: (url: CompetitorUrl) => void;
}

function UrlsTable({
  urls,
  expanded,
  reviewsByUrl,
  summaryByReviewId,
  onToggle,
  onOpenSummarizeModal,
}: UrlsTableProps): JSX.Element {
  return (
    <div
      style={{
        border: '1px solid #30363d',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#0d1117',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 120px 140px 160px',
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
        <span>Competitor / Product</span>
        <span>Platform</span>
        <span>Reviews</span>
        <span></span>
      </div>

      {urls.map((u) => {
        const isExpanded = !!expanded[u.id];
        const reviewsState = reviewsByUrl[u.id];
        const reviewsCount =
          reviewsState?.kind === 'loaded' ? reviewsState.reviews.length : null;
        return (
          <div key={u.id}>
            {/* URL row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 120px 140px 160px',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid #21262d',
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
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#e6edf3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.productName || '(unnamed product)'}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#8b949e',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.url}
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#e6edf3' }}>
                {u.platform || '—'}
              </span>
              <span style={{ fontSize: '12px', color: '#e6edf3' }}>
                {reviewsCount != null
                  ? `${reviewsCount} loaded`
                  : 'expand to load'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isExpanded) onToggle(u.id);
                  onOpenSummarizeModal(u);
                }}
                disabled={reviewsState?.kind === 'loading'}
                style={summarizeButtonStyle(reviewsState?.kind)}
              >
                Summarize reviews
              </button>
            </div>

            {/* Expanded review rows */}
            {isExpanded && (
              <ReviewsList
                state={reviewsState}
                summaryByReviewId={summaryByReviewId}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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

// ─── ReviewsList ────────────────────────────────────────────────────

interface ReviewsListProps {
  state: ReviewsLoadState | undefined;
  summaryByReviewId: Record<string, { summary: string; source: 'cache' | 'fresh' }>;
}

function ReviewsList({
  state,
  summaryByReviewId,
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
          gridTemplateColumns: '50px 60px 1fr 140px 100px 1fr',
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
        return (
          <div
            key={r.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '50px 60px 1fr 140px 100px 1fr',
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
              {r.starRating != null ? '★'.repeat(r.starRating) : '—'}
            </span>
            <span
              style={{
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {r.body}
            </span>
            <span style={{ color: '#8b949e' }}>{r.reviewerName ?? '—'}</span>
            <span style={{ color: '#8b949e' }}>
              {r.reviewDate ? r.reviewDate.slice(0, 10) : '—'}
            </span>
            <span style={{ color: summary ? '#e6edf3' : '#6e7681' }}>
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
