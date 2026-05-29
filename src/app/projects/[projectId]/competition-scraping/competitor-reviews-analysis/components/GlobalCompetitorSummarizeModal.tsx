'use client';

// W#2 P-49 Workstream 5 Session 3 FF#1c — Global "Summarize Reviews
// for all competitors" modal + browser loop per director Phase 4
// redirect: "there should be a global 'Summary Reviews for all
// competitors' button that should create a competitor-by-competitor
// analysis session one after another so that all competitors with at
// least 2 reviews will have a Reviews Summary."
//
// Iterates the project's URLs sequentially (not parallel — the per-
// batch endpoint already caches per-URL, so parallel adds complexity
// without speed gains for first-runs and is irrelevant for cache-
// hits). For each URL with >= 2 reviews:
//   1. Fetch the URL's reviews list (GET /urls/[urlId]/reviews).
//   2. POST /run-batch with flow='per-competitor-bulleted', urlId,
//      reviewIds=[all], modelVersion.
//   3. On success, fire onSummary callback so the parent's Table 2
//      row paints the banner live as each URL completes.
//
// Browser-first per feedback_browser_first_ai_with_server_migration.md
// — the server only proxies one URL's AI call per request; the loop
// + cost tally + cancel + skip logic all live in the browser.

import { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import { authFetch } from '@/lib/authFetch';
import {
  EXECUTION_MODE_DIRECT,
  EXECUTION_MODE_SERVER,
  type ExecutionMode,
} from '@/lib/workflow-components/execution-mode';
import { ExecutionModeSelect } from '@/lib/workflow-components/execution-mode-select';
import {
  SUPPORTED_MODEL_VERSIONS,
  type SupportedModelVersion,
} from '@/lib/competition-scraping/review-analysis/models';
import type {
  CapturedReview,
  CompetitorUrl,
} from '@/lib/shared-types/competition-scraping';

// SUPPORTED_MODEL_VERSIONS imported from the central registry (models.ts)
// per HANDOFF_PROTOCOL Rule 32 — no local copy to drift.
type ModelVersion = SupportedModelVersion;

// Minimum review count for inclusion in the global loop. Director's
// verbatim: "all competitors with at least 2 reviews". Under 2 reviews
// = trivially summarizable + waste of an AI call.
const MIN_REVIEWS_FOR_GLOBAL_RUN = 2;

export interface GlobalCompetitorSummarizeModalProps {
  projectId: string;
  urls: ReadonlyArray<CompetitorUrl>;
  // FU-1 (a.110): how many of the target competitors have a hand-edited
  // traceability table. >0 → warn + require confirm before the bulk re-run
  // replaces those edits (director pick).
  manuallyEditedCount?: number;
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
  status: 'pending' | 'loading-reviews' | 'skipped' | 'running' | 'done' | 'error';
  reviewCount?: number;
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

export function GlobalCompetitorSummarizeModal({
  projectId,
  urls,
  manuallyEditedCount = 0,
  onClose,
  onSummary,
}: GlobalCompetitorSummarizeModalProps): JSX.Element {
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  // FU-1 (a.110): interstitial confirm shown when any target is hand-edited.
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
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
    setTally({
      cacheHits: 0,
      freshCalls: 0,
      skipped: 0,
      errored: 0,
      actualCostUsd: 0,
    });
    // Reset per-url statuses on (re-)start.
    setPerUrlResults((prev) =>
      prev.map((r) => ({
        urlId: r.urlId,
        productName: r.productName,
        status: 'pending',
      }))
    );

    for (let i = 0; i < urls.length; i++) {
      if (cancelledRef.current) {
        setRunState({ kind: 'cancelled', cancelledAtIndex: i });
        return;
      }
      setRunState({ kind: 'running', currentIndex: i });

      const u = urls[i];

      // Step 1 — load this URL's review IDs.
      updateOneResult(i, { status: 'loading-reviews' });
      const controller = new AbortController();
      abortRef.current = controller;

      let reviews: CapturedReview[];
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls/${u.id}/reviews`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) detail = body.error;
          } catch {
            // ignore
          }
          updateOneResult(i, { status: 'error', errorMessage: detail });
          setTally((t) => ({ ...t, errored: t.errored + 1 }));
          continue;
        }
        const body = (await res.json()) as CapturedReview[];
        reviews = Array.isArray(body) ? body : [];
      } catch (err) {
        if (cancelledRef.current) {
          setRunState({ kind: 'cancelled', cancelledAtIndex: i });
          return;
        }
        updateOneResult(i, {
          status: 'error',
          errorMessage:
            err instanceof Error ? err.message : 'Failed to load reviews',
        });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      // Step 2 — skip URLs below the minimum review threshold.
      if (reviews.length < MIN_REVIEWS_FOR_GLOBAL_RUN) {
        updateOneResult(i, {
          status: 'skipped',
          reviewCount: reviews.length,
        });
        setTally((t) => ({ ...t, skipped: t.skipped + 1 }));
        continue;
      }

      // Step 3 — fire the per-batch endpoint for this URL.
      updateOneResult(i, {
        status: 'running',
        reviewCount: reviews.length,
      });
      const reviewIds = reviews.map((r) => r.id);
      const callController = new AbortController();
      abortRef.current = callController;

      let response: Response;
      try {
        response = await authFetch(
          `/api/projects/${projectId}/competition-scraping/review-analysis/run-batch`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flow: 'per-competitor-bulleted',
              urlId: u.id,
              reviewIds,
              modelVersion,
            }),
            signal: callController.signal,
          }
        );
      } catch (err) {
        if (cancelledRef.current) {
          setRunState({ kind: 'cancelled', cancelledAtIndex: i });
          return;
        }
        updateOneResult(i, {
          status: 'error',
          errorMessage:
            err instanceof Error ? err.message : 'Network error',
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
        flow: 'per-competitor-bulleted';
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
          errorMessage:
            'Parse error: ' +
            (err instanceof Error ? err.message : 'unknown'),
        });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      // Step 4 — push the summary up to the page so Table 2 paints it.
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
            : `${totalUrls} competitor URLs queued — runs sequentially (skips URLs with fewer than ${MIN_REVIEWS_FOR_GLOBAL_RUN} reviews)`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-summarize-modal-title"
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
          id="global-summarize-modal-title"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            margin: '0 0 4px',
            color: '#e6edf3',
          }}
        >
          Summarize Reviews for All Competitors
        </h2>
        <div
          style={{
            fontSize: '12px',
            color: '#8b949e',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          Runs the Per-Competitor Summarize flow on every URL in this
          project sequentially. URLs with fewer than{' '}
          {MIN_REVIEWS_FOR_GLOBAL_RUN} reviews are skipped. Cached
          summaries are served without a fresh AI call. The Table 2
          banners populate live as each URL completes.
        </div>

        {/* ── Completion banner — prominent + explicit per director's
            Phase 4 redirect: "The overlay should show a message that
            explicitly states that the AI Review Summarizing job has
            completed." */}
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
              {tally.cacheHits + tally.freshCalls} of {totalUrls} competitor
              URLs summarized
              {tally.freshCalls > 0 && ` (${tally.freshCalls} fresh AI calls`}
              {tally.freshCalls > 0 && tally.cacheHits > 0 && `, `}
              {tally.cacheHits > 0 && (tally.freshCalls > 0 ? '' : '(')}
              {tally.cacheHits > 0 && `${tally.cacheHits} served from cache`}
              {(tally.freshCalls > 0 || tally.cacheHits > 0) && `)`}.
              {tally.skipped > 0 && ` ${tally.skipped} URLs skipped (fewer than ${MIN_REVIEWS_FOR_GLOBAL_RUN} reviews).`}
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
          <label htmlFor="gcs-model">Model</label>
          <select
            id="gcs-model"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value as ModelVersion)}
            disabled={isRunning || isDone}
            style={selectStyle}
          >
            {SUPPORTED_MODEL_VERSIONS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <label htmlFor="gcs-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="gcs-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="gcs-execmode"
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
              <span>Skipped (&lt;{MIN_REVIEWS_FOR_GLOBAL_RUN} reviews): {tally.skipped}</span>
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
                  gridTemplateColumns: '1fr 110px 110px',
                  padding: '8px 12px',
                  borderBottom:
                    i === perUrlResults.length - 1
                      ? 'none'
                      : '1px solid #161b22',
                  fontSize: '11px',
                  alignItems: 'center',
                  background:
                    runState.kind === 'running' && runState.currentIndex === i
                      ? '#0a1320'
                      : 'transparent',
                }}
              >
                <span style={{ color: '#e6edf3' }}>{r.productName}</span>
                <span style={{ color: '#8b949e' }}>
                  {r.reviewCount != null ? `${r.reviewCount} reviews` : '—'}
                </span>
                <span style={statusLabelStyle(r.status)}>
                  {statusLabel(r.status, r.source, r.errorMessage)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* FU-1 (a.110) — warn before a bulk re-run replaces hand-edits. */}
        {showOverwriteWarning && !isRunning && !isDone && (
          <div
            style={overwriteWarnStyle}
            data-testid="global-competitor-overwrite-warning"
          >
            {manuallyEditedCount} competitor
            {manuallyEditedCount === 1 ? ' has' : 's have'} a hand-edited
            analysis table. Re-running for all competitors will replace those
            edits with fresh versions. Continue?
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                style={dangerButtonStyle}
                onClick={() => {
                  setShowOverwriteWarning(false);
                  void handleStart();
                }}
              >
                Replace edits &amp; continue
              </button>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => setShowOverwriteWarning(false)}
              >
                Keep edits
              </button>
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {!isRunning && !isDone && !showOverwriteWarning && (
            <>
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (manuallyEditedCount > 0) setShowOverwriteWarning(true);
                  else void handleStart();
                }}
                disabled={totalUrls === 0}
                style={{
                  ...primaryButtonStyle,
                  opacity: totalUrls === 0 ? 0.5 : 1,
                  cursor: totalUrls === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Start ({totalUrls} competitors)
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
    case 'loading-reviews':
      return 'loading reviews…';
    case 'running':
      return 'calling Claude…';
    case 'done':
      return source === 'cache' ? 'done (cached)' : 'done (fresh)';
    case 'skipped':
      return 'skipped';
    case 'error':
      return errorMessage ? `error: ${errorMessage.slice(0, 40)}` : 'error';
  }
}

function statusLabelStyle(
  status: PerUrlResult['status']
): React.CSSProperties {
  const baseColor =
    status === 'done'
      ? '#3fb950'
      : status === 'error'
        ? '#f85149'
        : status === 'skipped'
          ? '#8b949e'
          : status === 'running' || status === 'loading-reviews'
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

const overwriteWarnStyle: React.CSSProperties = {
  marginTop: '10px',
  marginBottom: '4px',
  padding: '10px 12px',
  background: '#3d2b16',
  border: '1px solid #f0883e',
  borderRadius: '6px',
  color: '#f0c674',
  fontSize: '13px',
};
