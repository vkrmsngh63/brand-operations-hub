'use client';

// W#2 P-46 Workstream 4 (2026-05-24) — Comprehensive Competitor Analysis
// page route.
//
// Route: /projects/[projectId]/competition-scraping/comprehensive-analysis
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §C.4.
//
// Per §A.4 + §C.4 this page renders the single per-Project rich-text doc:
//   - Back-button to /projects/[projectId]/competition-scraping at top.
//   - Edit / Done toggle controls the swap between AnalysisReadView and
//     AnalysisEditor. Reads as the default state per §A.4.
//   - GET the existing doc on mount; 404 → empty content; client falls
//     into empty-state read view, ready for Edit click.
//   - AnalysisEditor (variant='full') owns the per-Project save lifecycle.
//
// Hyperlink-back-to-URL-detail-pages (the #url/<urlId> shorthand) lands
// in Session 2 per §C.4.

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type { ComprehensiveCompetitorAnalysis } from '@/lib/shared-types/competition-scraping';
import { AnalysisEditor } from './components/AnalysisEditor';
import { AnalysisReadView } from './components/AnalysisReadView';

const WORKFLOW_SLUG = 'competition-scraping';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; contentJson: Record<string, unknown>; lastEditedBy: string | null; lastEditedAt: string | null }
  | { kind: 'error'; message: string };

export default function ComprehensiveAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
  });

  const [loadState, setLoadState] = useState<LoadState>({ kind: 'loading' });
  const [mode, setMode] = useState<'read' | 'edit'>('read');

  useEffect(() => {
    if (!projectId) return;
    const url = `/api/projects/${projectId}/competition-scraping/comprehensive-analysis`;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(url);
        if (cancelled) return;
        if (res.status === 404) {
          setLoadState({
            kind: 'loaded',
            contentJson: {},
            lastEditedBy: null,
            lastEditedAt: null,
          });
          return;
        }
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body && typeof body.error === 'string') detail = body.error;
          } catch {
            // ignore
          }
          setLoadState({ kind: 'error', message: detail });
          return;
        }
        const body = (await res.json()) as ComprehensiveCompetitorAnalysis;
        setLoadState({
          kind: 'loaded',
          contentJson: body.contentJson,
          lastEditedBy: body.lastEditedBy,
          lastEditedAt: body.lastEditedAt,
        });
      } catch (err) {
        if (cancelled) return;
        setLoadState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

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

  const apiUrl = `/api/projects/${projectId}/competition-scraping/comprehensive-analysis`;
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
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
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

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: 0,
              color: '#e6edf3',
            }}
          >
            Comprehensive Competitor Analysis
          </h1>
          {loadState.kind === 'loaded' && (
            <button
              type="button"
              onClick={() => setMode(mode === 'read' ? 'edit' : 'read')}
              style={{
                padding: '6px 16px',
                background: mode === 'edit' ? '#238636' : '#21262d',
                color: '#e6edf3',
                border: '1px solid #30363d',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {mode === 'read' ? 'Edit' : 'Done'}
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: '13px',
            color: '#8b949e',
            marginTop: 0,
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          A single rich-text document per Project. Synthesize across all
          competitors and platforms; hyperlinks back to URL detail pages
          let you cite specific captured items as evidence.
        </p>

        {loadState.kind === 'loading' && (
          <div style={{ color: '#8b949e', fontSize: '13px' }}>Loading…</div>
        )}
        {loadState.kind === 'error' && (
          <div
            style={{
              padding: '16px',
              background: '#1a0d0d',
              border: '1px solid #f85149',
              borderRadius: '6px',
              color: '#f85149',
              fontSize: '13px',
            }}
          >
            Couldn’t load this analysis: {loadState.message}
          </div>
        )}
        {loadState.kind === 'loaded' &&
          (mode === 'edit' ? (
            <AnalysisEditor
              apiUrl={apiUrl}
              initialContent={loadState.contentJson}
              projectId={projectId}
              testId="comprehensive-analysis-editor"
              onSaved={({ contentJson, lastEditedAt }) =>
                setLoadState((prev) =>
                  prev.kind === 'loaded'
                    ? { ...prev, contentJson, lastEditedAt }
                    : prev
                )
              }
            />
          ) : (
            <AnalysisReadView
              contentJson={loadState.contentJson}
              projectId={projectId}
              testId="comprehensive-analysis-read-view"
            />
          ))}

        {loadState.kind === 'loaded' && loadState.lastEditedAt && (
          <div
            style={{
              fontSize: '11px',
              color: '#8b949e',
              marginTop: '16px',
            }}
          >
            Last edited{' '}
            {new Date(loadState.lastEditedAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FullPageState({
  message,
  isError,
}: {
  message: string;
  isError?: boolean;
}) {
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
      }}
    >
      <div style={{ fontSize: '13px', color: isError ? '#f85149' : '#8b949e' }}>
        {message}
      </div>
    </div>
  );
}
