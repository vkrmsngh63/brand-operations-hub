'use client';

// W#2 P-49 W5 Fix Session C (2026-05-29) — Global "Auto-create
// Competitor Comprehensive Reviews Analysis (non-bulleted)" modal +
// browser loop. Mirrors GlobalCompetitorSummarizeModal but the per-URL
// INPUT is that competitor's already-generated BULLETED summary (not the
// raw reviews). Competitors WITHOUT a bulleted summary are skipped and
// flagged so the user knows to run the bulleted flow on them first
// (design pick at session start: "skip & flag if missing", 4/4
// Yes-to-Recommended).
//
// No reviews fetch per URL — the bulleted summary is supplied by the
// parent from competitorSummaryByUrlId. One Anthropic call per runnable
// competitor; cost tally + cancel live in the browser.

import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { authFetch } from '@/lib/authFetch';
import {
  EXECUTION_MODE_DIRECT,
  EXECUTION_MODE_SERVER,
  type ExecutionMode,
} from '@/lib/workflow-components/execution-mode';
import { ExecutionModeSelect } from '@/lib/workflow-components/execution-mode-select';
import { type SupportedModelVersion } from '@/lib/competition-scraping/review-analysis/models';
import { useModelsForMenu } from '@/lib/ai-models/useModelsForMenu';
import type { CompetitorUrl } from '@/lib/shared-types/competition-scraping';

type ModelVersion = SupportedModelVersion;

export interface GlobalCompetitorNonBulletedModalProps {
  projectId: string;
  urls: ReadonlyArray<CompetitorUrl>;
  // urlId → that competitor's bulleted summary text (from Column 9). A URL
  // missing from this map (or with empty text) has no bulleted summary and
  // is skipped + flagged.
  bulletedSummaryByUrlId: Record<string, string>;
  onClose: () => void;
  onSummary: (
    urlId: string,
    analysisId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) => void;
}

interface PerUrlResult {
  urlId: string;
  productName: string;
  status: 'pending' | 'skipped' | 'running' | 'done' | 'error';
  source?: 'cache' | 'fresh';
  errorMessage?: string;
}

interface TallyState {
  cacheHits: number;
  freshCalls: number;
  skipped: number;
  errored: number;
  actualCostUsd: number;
}

type RunState =
  | { kind: 'idle' }
  | { kind: 'running'; currentIndex: number }
  | { kind: 'completed' }
  | { kind: 'cancelled'; cancelledAtIndex: number }
  | { kind: 'error'; message: string };

export function GlobalCompetitorNonBulletedModal({
  projectId,
  urls,
  bulletedSummaryByUrlId,
  onClose,
  onSummary,
}: GlobalCompetitorNonBulletedModalProps): JSX.Element {
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const models = useModelsForMenu('review-analysis');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  const [perUrlResults, setPerUrlResults] = useState<PerUrlResult[]>(() =>
    urls.map((u) => ({
      urlId: u.id,
      productName: u.productName || u.url,
      status: 'pending',
    }))
  );
  const [tally, setTally] = useState<TallyState>({
    cacheHits: 0,
    freshCalls: 0,
    skipped: 0,
    errored: 0,
    actualCostUsd: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // How many competitors are runnable (have a bulleted summary).
  const runnableCount = urls.filter(
    (u) => (bulletedSummaryByUrlId[u.id] ?? '').trim().length > 0
  ).length;
  const missingCount = urls.length - runnableCount;

  const isRunning = runState.kind === 'running';
  const isDone = runState.kind !== 'idle' && runState.kind !== 'running';

  function updateOneResult(index: number, partial: Partial<PerUrlResult>) {
    setPerUrlResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...partial } : r))
    );
  }

  async function handleStart() {
    if (executionMode === EXECUTION_MODE_DIRECT) {
      setRunState({
        kind: 'error',
        message:
          'Direct (browser → Anthropic) is not yet wired. Pick Server proxy for the global run.',
      });
      return;
    }
    if (urls.length === 0) {
      setRunState({ kind: 'completed' });
      return;
    }
    cancelledRef.current = false;
    setTally({ cacheHits: 0, freshCalls: 0, skipped: 0, errored: 0, actualCostUsd: 0 });
    setPerUrlResults((prev) =>
      prev.map((r) => ({ urlId: r.urlId, productName: r.productName, status: 'pending' }))
    );

    for (let i = 0; i < urls.length; i++) {
      if (cancelledRef.current) {
        setRunState({ kind: 'cancelled', cancelledAtIndex: i });
        return;
      }
      setRunState({ kind: 'running', currentIndex: i });

      const u = urls[i];
      const bulletedSummary = (bulletedSummaryByUrlId[u.id] ?? '').trim();

      // Skip competitors with no bulleted summary — flag them.
      if (!bulletedSummary) {
        updateOneResult(i, { status: 'skipped' });
        setTally((t) => ({ ...t, skipped: t.skipped + 1 }));
        continue;
      }

      updateOneResult(i, { status: 'running' });
      const controller = new AbortController();
      abortRef.current = controller;

      let response: Response;
      try {
        response = await authFetch(
          `/api/projects/${projectId}/competition-scraping/review-analysis/run-batch`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flow: 'per-competitor-nonbulleted',
              urlId: u.id,
              bulletedSummary,
              modelVersion,
            }),
            signal: controller.signal,
          }
        );
      } catch (err) {
        if (cancelledRef.current) {
          setRunState({ kind: 'cancelled', cancelledAtIndex: i });
          return;
        }
        updateOneResult(i, {
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Network error',
        });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      if (!response.ok) {
        let detail = `HTTP ${response.status}`;
        try {
          const body = (await response.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        updateOneResult(i, { status: 'error', errorMessage: detail });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      let body: {
        flow: 'per-competitor-nonbulleted';
        analysisId: string;
        summary: string;
        source: 'cache' | 'fresh';
        usage: { actualCostUsd: number };
      };
      try {
        body = await response.json();
      } catch (err) {
        updateOneResult(i, {
          status: 'error',
          errorMessage: 'Parse error: ' + (err instanceof Error ? err.message : 'unknown'),
        });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      onSummary(u.id, body.analysisId, body.summary, body.source);
      updateOneResult(i, { status: 'done', source: body.source });
      setTally((t) => ({
        ...t,
        cacheHits: t.cacheHits + (body.source === 'cache' ? 1 : 0),
        freshCalls: t.freshCalls + (body.source === 'fresh' ? 1 : 0),
        actualCostUsd: t.actualCostUsd + (body.usage?.actualCostUsd ?? 0),
      }));
    }

    setRunState({ kind: 'completed' });
  }

  function handleCancel() {
    cancelledRef.current = true;
    abortRef.current?.abort();
  }

  const totalUrls = urls.length;
  const progressLabel =
    runState.kind === 'running'
      ? `Processing ${runState.currentIndex + 1} of ${totalUrls}: ${
          perUrlResults[runState.currentIndex]?.productName ?? '…'
        }`
      : runState.kind === 'completed'
        ? `Complete — ${tally.cacheHits + tally.freshCalls} summarized, ${tally.skipped} skipped, ${tally.errored} errored`
        : runState.kind === 'cancelled'
          ? `Cancelled after ${runState.cancelledAtIndex} of ${totalUrls}`
          : runState.kind === 'error'
            ? `Error: ${runState.message}`
            : `${runnableCount} competitor${runnableCount === 1 ? '' : 's'} with a bulleted summary will run${
                missingCount > 0 ? `; ${missingCount} without one will be skipped` : ''
              }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-nonbulleted-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRunning) onClose();
      }}
    >
      <div
        style={{
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '10px',
          width: '720px',
          maxWidth: '94vw',
          padding: '20px 24px 18px',
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: '#e6edf3',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2
          id="global-nonbulleted-modal-title"
          style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#e6edf3' }}
        >
          Auto-create Competitor Comprehensive Reviews Analysis (non-bulleted)
        </h2>
        <div
          style={{ fontSize: '12px', color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}
        >
          Rewrites each competitor’s bulleted critique summary into flowing
          prose, one competitor at a time. Competitors without a bulleted
          summary yet are skipped and listed below — run the bulleted flow on
          them first. The non-bulleted column populates live as each completes.
        </div>

        {runState.kind === 'completed' && (
          <div
            style={{
              background: '#0d2818',
              border: '1px solid #2ea043',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#3fb950',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>
              ✅ AI Review Summarizing job complete
            </div>
            <div style={{ fontSize: '12px', color: '#c9d1d9' }}>
              {tally.cacheHits + tally.freshCalls} of {totalUrls} competitors
              summarized
              {tally.freshCalls > 0 && ` (${tally.freshCalls} fresh, ${tally.cacheHits} cached)`}.
              {tally.skipped > 0 && ` ${tally.skipped} skipped (no bulleted summary yet).`}
              {tally.errored > 0 && ` ${tally.errored} errored.`}
            </div>
          </div>
        )}

        {/* ── Configuration ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr',
            gap: '10px 12px',
            alignItems: 'center',
            fontSize: '12px',
            marginBottom: '16px',
          }}
        >
          <label htmlFor="gnb-model">Model</label>
          <select
            id="gnb-model"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value as ModelVersion)}
            disabled={isRunning || isDone}
            style={selectStyle}
          >
            {models.map((m) => (
              <option key={m.id} value={m.modelId}>
                {m.modelId}
              </option>
            ))}
          </select>

          <label htmlFor="gnb-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="gnb-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="gnb-execmode"
          />
        </div>

        {/* ── Progress / cost tally ── */}
        <div
          style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '12px',
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <strong>Status:</strong> {progressLabel}
          </div>
          {(isDone || isRunning) && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#8b949e' }}>
              <span>Cache hits: {tally.cacheHits}</span>
              <span>Fresh AI summaries: {tally.freshCalls}</span>
              <span>Skipped (no bulleted): {tally.skipped}</span>
              <span>Errored: {tally.errored}</span>
              <span>Total cost: ${tally.actualCostUsd.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* ── Per-URL progress table ── */}
        {(isRunning || isDone) && (
          <div
            style={{
              border: '1px solid #21262d',
              borderRadius: '6px',
              marginBottom: '16px',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {perUrlResults.map((r, i) => (
              <div
                key={r.urlId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px',
                  padding: '8px 12px',
                  borderBottom:
                    i === perUrlResults.length - 1 ? 'none' : '1px solid #161b22',
                  fontSize: '11px',
                  alignItems: 'center',
                  background:
                    runState.kind === 'running' && runState.currentIndex === i
                      ? '#0a1320'
                      : 'transparent',
                }}
              >
                <span style={{ color: '#e6edf3' }}>{r.productName}</span>
                <span style={statusLabelStyle(r.status)}>
                  {statusLabel(r.status, r.source, r.errorMessage)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {!isRunning && !isDone && (
            <>
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={runnableCount === 0}
                style={{
                  ...primaryButtonStyle,
                  opacity: runnableCount === 0 ? 0.5 : 1,
                  cursor: runnableCount === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Start ({runnableCount} competitor{runnableCount === 1 ? '' : 's'})
              </button>
            </>
          )}
          {isRunning && (
            <button type="button" onClick={handleCancel} style={dangerButtonStyle}>
              Cancel run
            </button>
          )}
          {isDone && (
            <button type="button" onClick={onClose} style={primaryButtonStyle}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function statusLabel(
  status: PerUrlResult['status'],
  source: PerUrlResult['source'],
  errorMessage: string | undefined
): string {
  switch (status) {
    case 'pending':
      return 'queued';
    case 'running':
      return 'calling Claude…';
    case 'done':
      return source === 'cache' ? 'done (cached)' : 'done (fresh)';
    case 'skipped':
      return 'skipped — no bulleted summary';
    case 'error':
      return errorMessage ? `error: ${errorMessage.slice(0, 40)}` : 'error';
  }
}

function statusLabelStyle(status: PerUrlResult['status']): React.CSSProperties {
  const baseColor =
    status === 'done'
      ? '#3fb950'
      : status === 'error'
        ? '#f85149'
        : status === 'skipped'
          ? '#d29922'
          : status === 'running'
            ? '#58a6ff'
            : '#6e7681';
  return {
    color: baseColor,
    fontWeight: 600,
    textAlign: 'right',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '12px',
  background: '#0d1117',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '6px',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#238636',
  color: '#fff',
  border: '1px solid #2ea043',
  borderRadius: '6px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 500,
  background: 'transparent',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '6px',
  cursor: 'pointer',
};

const dangerButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 600,
  background: '#da3633',
  color: '#fff',
  border: '1px solid #f85149',
  borderRadius: '6px',
  cursor: 'pointer',
};
