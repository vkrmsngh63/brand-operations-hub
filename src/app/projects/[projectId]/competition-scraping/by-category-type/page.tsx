'use client';

// W#2 P-49 Workstream 5 Session 4 — Table 3 By Category-Type page per
// docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27-d (this session). New
// 4th-toggle surface that groups competitors by their Category value
// (CompetitorUrl.competitionCategory) and runs Per-Category Comprehensive
// (bulleted) AI summaries pooling reviews across all competitors in
// each Category.
//
// Route: /projects/[projectId]/competition-scraping/by-category-type
//
// Page shape:
//   - Top nav: shared 4-option toggle (CompetitionScrapingSurfaceNav).
//   - Body: one row per unique Category value found across the
//     project's CompetitorUrl rows. Each row shows:
//       - Category name + product count + total review count.
//       - Expand toggle revealing per-product breakdown.
//       - "Summarize Reviews for All Competitors in this Category"
//         button → opens PerCategorySummarizeModal.
//       - Persisted summary banner inline with Edit affordance.
//
// Per-Type surface (Tables 4) ships in Session 5 — will either become
// an in-page sub-toggle here or a sibling page; defer to Session 5
// Rule 14f picker.

import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type { CompetitorUrl } from '@/lib/shared-types/competition-scraping';
import { CompetitionScrapingSurfaceNav } from '../components/CompetitionScrapingSurfaceNav';
import {
  PerCategorySummarizeModal,
  type PerCategoryProductInput,
} from './components/PerCategorySummarizeModal';

const WORKFLOW_SLUG = 'competition-scraping';
const UNCATEGORIZED_LABEL = '(Uncategorized)';

type UrlsLoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: CompetitorUrl[] }
  | { kind: 'error'; message: string };

// Per-URL review-count state — populated in parallel on mount so each
// Category row knows its review density before the user clicks
// Summarize. Stored separately from the URL list to avoid re-rendering
// the URL list on every count update.
type UrlReviewCountState =
  | { kind: 'loading' }
  | { kind: 'loaded'; count: number }
  | { kind: 'error'; message: string };

interface CategoryGroup {
  categoryName: string;
  urls: CompetitorUrl[];
}

// Bucket URLs by competitionCategory. Null / empty / whitespace-only
// categories collapse into a single "(Uncategorized)" bucket so they
// remain visible (director may want to surface them as missing data).
function groupUrlsByCategory(urls: ReadonlyArray<CompetitorUrl>): CategoryGroup[] {
  const byCategory = new Map<string, CompetitorUrl[]>();
  for (const u of urls) {
    const raw = u.competitionCategory?.trim();
    const key = raw ? raw : UNCATEGORIZED_LABEL;
    const existing = byCategory.get(key);
    if (existing) {
      existing.push(u);
    } else {
      byCategory.set(key, [u]);
    }
  }
  // Sort categories alphabetically; (Uncategorized) sorts at the bottom.
  const groups: CategoryGroup[] = [];
  for (const [categoryName, list] of byCategory) {
    groups.push({ categoryName, urls: list });
  }
  groups.sort((a, b) => {
    if (a.categoryName === UNCATEGORIZED_LABEL) return 1;
    if (b.categoryName === UNCATEGORIZED_LABEL) return -1;
    return a.categoryName.localeCompare(b.categoryName);
  });
  return groups;
}

function productLabelFor(url: CompetitorUrl): string {
  const name = url.productName?.trim();
  return name ? `${name} (${url.platform})` : `Unnamed product (${url.platform})`;
}

export default function ByCategoryTypePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
  });

  const [urlsState, setUrlsState] = useState<UrlsLoadState>({ kind: 'loading' });
  const [reviewCounts, setReviewCounts] = useState<Record<string, UrlReviewCountState>>({});

  // Per-categoryName summary cache populated by Per-Category runs.
  const [summaryByCategory, setSummaryByCategory] = useState<
    Record<
      string,
      { analysisId: string; summary: string; source: 'cache' | 'fresh' }
    >
  >({});

  // Modal state — only one Per-Category modal open at a time.
  const [modalCategory, setModalCategory] = useState<CategoryGroup | null>(null);

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

  // Once URLs load, fan out parallel review-count fetches per URL so
  // each Category row can show density before the user clicks
  // Summarize. Each URL caches independently so partial failures don't
  // block the whole page.
  useEffect(() => {
    if (urlsState.kind !== 'loaded' || !projectId) return;
    const cancelled = { current: false };

    setReviewCounts((prev) => {
      const next = { ...prev };
      for (const u of urlsState.urls) {
        if (!next[u.id]) next[u.id] = { kind: 'loading' };
      }
      return next;
    });

    for (const url of urlsState.urls) {
      (async () => {
        try {
          const res = await authFetch(
            `/api/projects/${projectId}/competition-scraping/urls/${url.id}/reviews`
          );
          if (cancelled.current) return;
          if (!res.ok) {
            setReviewCounts((prev) => ({
              ...prev,
              [url.id]: { kind: 'error', message: `HTTP ${res.status}` },
            }));
            return;
          }
          const body = (await res.json()) as ReadonlyArray<unknown>;
          const count = Array.isArray(body) ? body.length : 0;
          setReviewCounts((prev) => ({
            ...prev,
            [url.id]: { kind: 'loaded', count },
          }));
        } catch (err) {
          if (cancelled.current) return;
          setReviewCounts((prev) => ({
            ...prev,
            [url.id]: {
              kind: 'error',
              message: err instanceof Error ? err.message : 'Network error',
            },
          }));
        }
      })();
    }

    return () => {
      cancelled.current = true;
    };
  }, [urlsState, projectId]);

  const groups = useMemo(() => {
    if (urlsState.kind !== 'loaded') return [];
    return groupUrlsByCategory(urlsState.urls);
  }, [urlsState]);

  function handleCategorySummary(
    categoryName: string,
    analysisId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) {
    setSummaryByCategory((prev) => ({
      ...prev,
      [categoryName]: { analysisId, summary, source },
    }));
  }

  function handleCategorySummaryEdited(categoryName: string, summary: string) {
    setSummaryByCategory((prev) => {
      const existing = prev[categoryName];
      if (!existing) return prev;
      return {
        ...prev,
        [categoryName]: { ...existing, summary, source: 'cache' },
      };
    });
  }

  if (ctx.loading) {
    return (
      <main style={pageStyle}>
        <div style={{ padding: '24px', color: '#8b949e' }}>Loading…</div>
      </main>
    );
  }
  if (ctx.error) {
    return (
      <main style={pageStyle}>
        <div style={{ padding: '24px', color: '#f85149' }}>
          {ctx.error}
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            style={{
              background: 'transparent',
              color: '#58a6ff',
              border: 'none',
              padding: 0,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ← Back to project
          </button>
        </div>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 6px',
            color: '#e6edf3',
          }}
        >
          By Category-Type
        </h1>
        <p
          style={{
            color: '#8b949e',
            fontSize: '13px',
            marginBottom: '20px',
            lineHeight: 1.6,
          }}
        >
          One row per Category. Click <strong>Summarize Reviews for All
          Competitors in this Category</strong> to pool reviews across every
          product in the Category and generate ONE theme-grouped bulleted
          critique summary surfacing cross-product convergence.
        </p>
        <CompetitionScrapingSurfaceNav
          projectId={projectId ?? ''}
          active="by-category-type"
        />

        {urlsState.kind === 'loading' && (
          <div style={{ color: '#8b949e', fontSize: '13px' }}>Loading URLs…</div>
        )}
        {urlsState.kind === 'error' && (
          <div style={{ color: '#f85149', fontSize: '13px' }}>
            Failed to load URLs: {urlsState.message}
          </div>
        )}
        {urlsState.kind === 'loaded' && groups.length === 0 && (
          <div
            style={{
              color: '#8b949e',
              fontSize: '13px',
              padding: '24px',
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            No competitor URLs in this project yet. Capture some via the
            Competitor URLs tab to populate this page.
          </div>
        )}
        {urlsState.kind === 'loaded' &&
          groups.map((g) => {
            const summary = summaryByCategory[g.categoryName];
            return (
              <CategoryRow
                key={g.categoryName}
                projectId={projectId ?? ''}
                group={g}
                reviewCounts={reviewCounts}
                summary={summary}
                onOpenModal={() => setModalCategory(g)}
                onSummaryEdited={handleCategorySummaryEdited}
              />
            );
          })}

        {modalCategory && (
          <PerCategorySummarizeModal
            projectId={projectId ?? ''}
            categoryName={modalCategory.categoryName}
            products={buildProductInputs(modalCategory, reviewCounts)}
            totalReviewCount={sumReviews(modalCategory, reviewCounts)}
            onClose={() => setModalCategory(null)}
            onSummary={handleCategorySummary}
          />
        )}
      </div>
    </main>
  );
}

// ─── CategoryRow ────────────────────────────────────────────────────

interface CategoryRowProps {
  projectId: string;
  group: CategoryGroup;
  reviewCounts: Record<string, UrlReviewCountState>;
  summary?: { analysisId: string; summary: string; source: 'cache' | 'fresh' };
  onOpenModal: () => void;
  onSummaryEdited: (categoryName: string, summary: string) => void;
}

function CategoryRow({
  projectId,
  group,
  reviewCounts,
  summary,
  onOpenModal,
  onSummaryEdited,
}: CategoryRowProps): JSX.Element {
  const [expanded, setExpanded] = useState<boolean>(false);

  const totalReviews = sumReviews(group, reviewCounts);
  const anyCountLoading = group.urls.some(
    (u) => reviewCounts[u.id]?.kind === 'loading' || !reviewCounts[u.id]
  );
  const disabledReason =
    group.categoryName === UNCATEGORIZED_LABEL
      ? 'Set a Category value on these URLs first (Competitor URLs tab → click the Category cell to edit).'
      : anyCountLoading
        ? 'Still loading review counts…'
        : totalReviews === 0
          ? 'No reviews captured for any URL in this category yet.'
          : null;
  const buttonDisabled = !!disabledReason;

  return (
    <section
      style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        marginBottom: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          background: '#161b22',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            style={{
              background: 'transparent',
              color: '#e6edf3',
              border: 'none',
              padding: 0,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: '#8b949e', fontSize: '11px' }}>
              {expanded ? '▼' : '▶'}
            </span>
            {group.categoryName}
            <span
              style={{ fontSize: '11px', color: '#8b949e', fontWeight: 500 }}
            >
              {group.urls.length} product{group.urls.length === 1 ? '' : 's'} · {totalReviews} review{totalReviews === 1 ? '' : 's'}
            </span>
          </button>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          disabled={buttonDisabled}
          title={disabledReason ?? undefined}
          style={{
            ...categoryActionButtonStyle,
            opacity: buttonDisabled ? 0.5 : 1,
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Summarize Reviews for All Competitors in this Category
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '14px 18px', fontSize: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#8b949e', textAlign: 'left' }}>
                <th style={cellHeaderStyle}>Product</th>
                <th style={cellHeaderStyle}>Platform</th>
                <th style={{ ...cellHeaderStyle, textAlign: 'right' }}>
                  Captured reviews
                </th>
              </tr>
            </thead>
            <tbody>
              {group.urls.map((u) => {
                const rc = reviewCounts[u.id];
                const countLabel =
                  !rc || rc.kind === 'loading'
                    ? '…'
                    : rc.kind === 'error'
                      ? 'error'
                      : rc.count;
                return (
                  <tr
                    key={u.id}
                    style={{ borderTop: '1px solid #21262d' }}
                  >
                    <td style={cellStyle}>
                      {u.productName?.trim() || (
                        <span style={{ color: '#6e7681' }}>
                          (unnamed product)
                        </span>
                      )}
                    </td>
                    <td style={cellStyle}>{u.platform}</td>
                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      {countLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {summary && (
        <CategorySummaryBanner
          projectId={projectId}
          categoryName={group.categoryName}
          summary={summary}
          onEdited={onSummaryEdited}
        />
      )}
    </section>
  );
}

// ─── CategorySummaryBanner ──────────────────────────────────────────

interface CategorySummaryBannerProps {
  projectId: string;
  categoryName: string;
  summary: { analysisId: string; summary: string; source: 'cache' | 'fresh' };
  onEdited: (categoryName: string, summary: string) => void;
}

function CategorySummaryBanner({
  projectId,
  categoryName,
  summary,
  onEdited,
}: CategorySummaryBannerProps): JSX.Element {
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
      setSaveState({ kind: 'error', message: 'Summary cannot be empty.' });
      return;
    }
    if (!summary.analysisId) {
      setSaveState({
        kind: 'error',
        message:
          'This summary cannot be edited (no row id — re-run Summarize to persist it).',
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
      onEdited(categoryName, body.summary);
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
        borderTop: '1px solid #21262d',
        padding: '14px 18px',
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
          Per-Category Summary
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
          <button type="button" onClick={startEdit} style={editButtonStyle}>
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
              minHeight: '180px',
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

// ─── Helpers ────────────────────────────────────────────────────────

function sumReviews(
  group: CategoryGroup,
  reviewCounts: Record<string, UrlReviewCountState>
): number {
  let total = 0;
  for (const u of group.urls) {
    const rc = reviewCounts[u.id];
    if (rc?.kind === 'loaded') total += rc.count;
  }
  return total;
}

function buildProductInputs(
  group: CategoryGroup,
  reviewCounts: Record<string, UrlReviewCountState>
): PerCategoryProductInput[] {
  return group.urls.map((u) => {
    const rc = reviewCounts[u.id];
    return {
      urlId: u.id,
      productLabel: productLabelFor(u),
      platform: u.platform,
      reviewCount: rc?.kind === 'loaded' ? rc.count : 0,
    };
  });
}

// ─── Style constants ────────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#010409',
  color: '#e6edf3',
  fontFamily: "'IBM Plex Sans', sans-serif",
};

const cellHeaderStyle: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 600,
  padding: '6px 8px',
  textAlign: 'left',
};

const cellStyle: React.CSSProperties = {
  padding: '8px',
  color: '#e6edf3',
};

const categoryActionButtonStyle: React.CSSProperties = {
  background: '#1f6feb',
  color: '#fff',
  border: '1px solid #388bfd',
  borderRadius: '6px',
  padding: '8px 14px',
  fontSize: '12px',
  fontWeight: 600,
};

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
