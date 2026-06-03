'use client';

// W#2 P-49 W5 Category page Session 2 (2026-05-30-b) — the two "Auto-create
// Category Comprehensive Reviews Analysis" run modals + browser loop. ONE
// parameterized component drives BOTH category flows (bulleted dedup +
// non-bulleted prose) since they share the same UX (model select / progress /
// per-category status / cost tally / cancel). The browser orchestrates one
// POST per category against the shared /review-analysis/run-batch endpoint;
// the server fires one Anthropic call per category.
//
// Mirrors GlobalCompetitorNonBulletedModal on the sibling page, but the unit
// of work is a CATEGORY (a set of competitor urls) rather than a single url.
//   - bulleted: input is the category's competitor urls (the server reads
//     their per-competitor bulleted summaries); always runnable.
//   - non-bulleted: input is the category's already-generated bulleted
//     summary (supplied by the parent); categories without one are skipped +
//     flagged, exactly like the sibling's "run the bulleted flow first".

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
import type { PerCompetitorStructuredCategory } from '@/lib/competition-scraping/review-analysis/prompts';

type ModelVersion = SupportedModelVersion;
export type CategoryFlow = 'per-category-bulleted' | 'per-category-nonbulleted';

// One category the run iterates over.
export interface CategoryRunTarget {
  categoryKey: string;
  label: string;
  urlIds: string[];
}

export interface CategoryAiRunModalProps {
  projectId: string;
  flow: CategoryFlow;
  categories: ReadonlyArray<CategoryRunTarget>;
  // For the non-bulleted flow only: categoryKey → that category's bulleted
  // summary text. A category missing here (or empty) is skipped + flagged.
  bulletedSummaryByCategoryKey?: Record<string, string>;
  onClose: () => void;
  // Called as each category completes so the parent paints Columns 12/13 live.
  // `categories` is populated only for the bulleted flow (powers Source Reviews).
  onResult: (result: {
    categoryKey: string;
    analysisId: string;
    summary: string;
    categories: PerCompetitorStructuredCategory[] | null;
    source: 'cache' | 'fresh';
  }) => void;
}

interface PerCategoryResult {
  categoryKey: string;
  label: string;
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

const TITLES: Record<CategoryFlow, string> = {
  'per-category-bulleted':
    'Auto-create Category Comprehensive Reviews Analysis (bulleted)',
  'per-category-nonbulleted':
    'Auto-create Category Comprehensive Reviews Analysis (non-bulleted)',
};

const BLURBS: Record<CategoryFlow, string> = {
  'per-category-bulleted':
    'For each category, merges its competitors’ bulleted critiques into one deduplicated category critique list — and traces each category bullet back to its source reviews. One category at a time; the Category (bulleted) cell + Source Reviews fill in live.',
  'per-category-nonbulleted':
    'Rewrites each category’s bulleted critique summary into flowing prose, one category at a time. Categories without a bulleted summary yet are skipped and listed below — run the bulleted flow on them first. The prose also appends to each competitor’s notes box.',
};

export function CategoryAiRunModal({
  projectId,
  flow,
  categories,
  bulletedSummaryByCategoryKey,
  onClose,
  onResult,
}: CategoryAiRunModalProps): JSX.Element {
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const models = useModelsForMenu('review-analysis');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  const [results, setResults] = useState<PerCategoryResult[]>(() =>
    categories.map((c) => ({
      categoryKey: c.categoryKey,
      label: c.label,
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

  const isNonBulleted = flow === 'per-category-nonbulleted';
  const hasBulleted = (key: string) =>
    ((bulletedSummaryByCategoryKey ?? {})[key] ?? '').trim().length > 0;
  const runnableCount = isNonBulleted
    ? categories.filter((c) => hasBulleted(c.categoryKey)).length
    : categories.length;
  const missingCount = categories.length - runnableCount;

  const isRunning = runState.kind === 'running';
  const isDone = runState.kind !== 'idle' && runState.kind !== 'running';

  function updateOneResult(index: number, partial: Partial<PerCategoryResult>) {
    setResults((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...partial } : r))
    );
  }

  async function handleStart() {
    if (executionMode === EXECUTION_MODE_DIRECT) {
      setRunState({
        kind: 'error',
        message:
          'Direct (browser → Anthropic) is not yet wired. Pick Server proxy for the run.',
      });
      return;
    }
    if (categories.length === 0) {
      setRunState({ kind: 'completed' });
      return;
    }
    cancelledRef.current = false;
    setTally({ cacheHits: 0, freshCalls: 0, skipped: 0, errored: 0, actualCostUsd: 0 });
    setResults((prev) =>
      prev.map((r) => ({ ...r, status: 'pending', source: undefined, errorMessage: undefined }))
    );

    for (let i = 0; i < categories.length; i++) {
      if (cancelledRef.current) {
        setRunState({ kind: 'cancelled', cancelledAtIndex: i });
        return;
      }
      setRunState({ kind: 'running', currentIndex: i });

      const cat = categories[i];

      // Non-bulleted: skip categories without a bulleted summary to feed in.
      const bulletedSummary = (
        (bulletedSummaryByCategoryKey ?? {})[cat.categoryKey] ?? ''
      ).trim();
      if (isNonBulleted && !bulletedSummary) {
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
              flow,
              categoryKey: cat.categoryKey,
              urlIds: cat.urlIds,
              modelVersion,
              ...(isNonBulleted ? { bulletedSummary } : {}),
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
          const eb = (await response.json()) as { error?: string };
          if (eb?.error) detail = eb.error;
        } catch {
          // ignore
        }
        updateOneResult(i, { status: 'error', errorMessage: detail });
        setTally((t) => ({ ...t, errored: t.errored + 1 }));
        continue;
      }

      let body: {
        flow: CategoryFlow;
        categoryKey: string;
        analysisId: string;
        summary: string;
        categories?: PerCompetitorStructuredCategory[];
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

      // Redundancy guard (director directive): only paint when the response's
      // categoryKey matches the category we dispatched — never paint into the
      // wrong cell.
      if (body.categoryKey === cat.categoryKey) {
        onResult({
          categoryKey: cat.categoryKey,
          analysisId: body.analysisId,
          summary: body.summary,
          categories: body.categories ?? null,
          source: body.source,
        });
      }
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

  const total = categories.length;
  const progressLabel =
    runState.kind === 'running'
      ? `Processing ${runState.currentIndex + 1} of ${total}: ${
          results[runState.currentIndex]?.label ?? '…'
        }`
      : runState.kind === 'completed'
        ? `Complete — ${tally.cacheHits + tally.freshCalls} done, ${tally.skipped} skipped, ${tally.errored} errored`
        : runState.kind === 'cancelled'
          ? `Cancelled after ${runState.cancelledAtIndex} of ${total}`
          : runState.kind === 'error'
            ? `Error: ${runState.message}`
            : `${runnableCount} categor${runnableCount === 1 ? 'y' : 'ies'} will run${
                missingCount > 0 ? `; ${missingCount} without a bulleted summary will be skipped` : ''
              }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-ai-modal-title"
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
          id="category-ai-modal-title"
          style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#e6edf3' }}
        >
          {TITLES[flow]}
        </h2>
        <div
          style={{ fontSize: '12px', color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}
        >
          {BLURBS[flow]}
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
              ✅ Category analysis job complete
            </div>
            <div style={{ fontSize: '12px', color: '#c9d1d9' }}>
              {tally.cacheHits + tally.freshCalls} of {total} categories done
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
          <label htmlFor="cat-ai-model">Model</label>
          <select
            id="cat-ai-model"
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

          <label htmlFor="cat-ai-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="cat-ai-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="cat-ai-execmode"
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
              <span>Fresh AI runs: {tally.freshCalls}</span>
              {isNonBulleted && <span>Skipped (no bulleted): {tally.skipped}</span>}
              <span>Errored: {tally.errored}</span>
              <span>Total cost: ${tally.actualCostUsd.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* ── Per-category progress ── */}
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
            {results.map((r, i) => (
              <div
                key={r.categoryKey || '__uncategorized__'}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 170px',
                  padding: '8px 12px',
                  borderBottom: i === results.length - 1 ? 'none' : '1px solid #161b22',
                  fontSize: '11px',
                  alignItems: 'center',
                  background:
                    runState.kind === 'running' && runState.currentIndex === i
                      ? '#0a1320'
                      : 'transparent',
                }}
              >
                <span style={{ color: '#e6edf3' }}>{r.label}</span>
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
                Start ({runnableCount} categor{runnableCount === 1 ? 'y' : 'ies'})
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
  status: PerCategoryResult['status'],
  source: PerCategoryResult['source'],
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

function statusLabelStyle(status: PerCategoryResult['status']): React.CSSProperties {
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
