'use client';

// W#2 P-49 W5 Fix Session C (2026-05-29) — Per-Competitor NON-bulleted
// modal + single-call run. Mirrors PerCompetitorSummarizeModal but the
// INPUT is the competitor's already-generated BULLETED summary (Column 9)
// rather than the raw review corpus: this flow rewrites the bullets into
// flowing prose (§1 verbatim "presented in a paragraphs manner"). One
// Anthropic call per click; output is ONE prose block.
//
// Design locked at session start (Rule 14f, 4/4 Yes-to-Recommended):
// theme-labeled short paragraphs, moderate length, volume cues kept, no
// formal citations. Reads the bullet summary; competitors without one are
// not runnable here (Start is disabled with a hint to run the bulleted
// flow first).

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
import { getModelsForMenu } from '@/lib/ai-models/registry';
import { PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT } from '@/lib/competition-scraping/review-analysis/prompts';

type ModelVersion = SupportedModelVersion;

export interface PerCompetitorNonBulletedModalProps {
  projectId: string;
  urlId: string;
  productName: string;
  // The bulleted summary already shown in Column 9 for this URL. Empty
  // string when this competitor has no bulleted summary yet — Start is
  // then disabled with a hint to run the bulleted flow first.
  bulletedSummary: string;
  onClose: () => void;
  onSummary: (
    urlId: string,
    analysisId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) => void;
}

interface CallUsage {
  inputTokens: number;
  outputTokens: number;
  actualCostUsd: number;
}

type RunState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'completed'; summary: string; source: 'cache' | 'fresh' }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

export function PerCompetitorNonBulletedModal({
  projectId,
  urlId,
  productName,
  bulletedSummary,
  onClose,
  onSummary,
}: PerCompetitorNonBulletedModalProps): JSX.Element {
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  const [showPrompts, setShowPrompts] = useState<boolean>(false);
  const [tally, setTally] = useState<CallUsage>({
    inputTokens: 0,
    outputTokens: 0,
    actualCostUsd: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const hasBulleted = bulletedSummary.trim().length > 0;
  const isRunning = runState.kind === 'running';
  const isDone = runState.kind !== 'idle' && runState.kind !== 'running';

  async function handleStart() {
    if (!hasBulleted) return;
    if (executionMode === EXECUTION_MODE_DIRECT) {
      setRunState({
        kind: 'error',
        message:
          'Direct (browser → Anthropic) is not yet wired. Pick Server proxy for the live run.',
      });
      return;
    }

    cancelledRef.current = false;
    setRunState({ kind: 'running' });
    setTally({ inputTokens: 0, outputTokens: 0, actualCostUsd: 0 });

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
            urlId,
            bulletedSummary,
            modelVersion,
          }),
          signal: controller.signal,
        }
      );
    } catch (err) {
      if (cancelledRef.current) {
        setRunState({ kind: 'cancelled' });
        return;
      }
      setRunState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error during call',
      });
      return;
    }

    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const body = (await response.json()) as { error?: string };
        if (body && typeof body.error === 'string') detail = body.error;
      } catch {
        // ignore
      }
      setRunState({ kind: 'error', message: `AI call failed: ${detail}` });
      return;
    }

    let body: {
      flow: 'per-competitor-nonbulleted';
      analysisId: string;
      summary: string;
      source: 'cache' | 'fresh';
      usage: { inputTokens: number; outputTokens: number; actualCostUsd: number };
    };
    try {
      body = await response.json();
    } catch (err) {
      setRunState({
        kind: 'error',
        message:
          'Failed to parse response: ' +
          (err instanceof Error ? err.message : 'unknown'),
      });
      return;
    }

    setTally({
      inputTokens: body.usage.inputTokens,
      outputTokens: body.usage.outputTokens,
      actualCostUsd: body.usage.actualCostUsd,
    });
    onSummary(urlId, body.analysisId, body.summary, body.source);
    setRunState({ kind: 'completed', summary: body.summary, source: body.source });
  }

  function handleCancel() {
    cancelledRef.current = true;
    abortRef.current?.abort();
  }

  const status =
    runState.kind === 'running'
      ? 'Calling Claude to rewrite the bullet summary as prose…'
      : runState.kind === 'completed'
        ? runState.source === 'cache'
          ? 'Complete — served from cache (no AI cost)'
          : 'Complete — fresh AI prose summary'
        : runState.kind === 'cancelled'
          ? 'Cancelled before the call returned'
          : runState.kind === 'error'
            ? `Error: ${runState.message}`
            : hasBulleted
              ? 'Ready — one AI call rewrites the bulleted summary into prose'
              : 'No bulleted summary yet for this competitor';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="per-competitor-nonbulleted-modal-title"
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
          width: '620px',
          maxWidth: '92vw',
          padding: '20px 24px 18px',
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: '#e6edf3',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2
          id="per-competitor-nonbulleted-modal-title"
          style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 4px', color: '#e6edf3' }}
        >
          Per-Competitor Comprehensive Analysis (non-bulleted)
        </h2>
        <div
          style={{ fontSize: '12px', color: '#8b949e', marginBottom: '16px', lineHeight: 1.5 }}
        >
          Rewrites the bulleted critique summary for{' '}
          <strong>{productName}</strong> into a flowing prose critique you can
          lift onto a product-comparison page. ONE AI call per competitor; the
          result also merges to the bottom of this competitor’s “Overall
          Analysis — Captured Reviews” box.
        </div>

        {!hasBulleted && (
          <div
            style={{
              background: '#3d2b16',
              border: '1px solid #f0883e',
              borderRadius: '6px',
              padding: '10px 12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#f0c674',
              lineHeight: 1.5,
            }}
          >
            This competitor has no bulleted summary yet. Run{' '}
            <strong>Summarize all reviews within this product</strong> (the
            bulleted flow) first, then come back to generate the prose version.
          </div>
        )}

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
              {runState.source === 'cache'
                ? `Served from cache (no AI cost) for ${productName}.`
                : `Fresh AI prose critique for ${productName}.`}
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
          <label htmlFor="pcnb-model">Model</label>
          <select
            id="pcnb-model"
            value={modelVersion}
            onChange={(e) => setModelVersion(e.target.value as ModelVersion)}
            disabled={isRunning || isDone}
            style={selectStyle}
          >
            {getModelsForMenu('review-analysis').map((m) => (
              <option key={m.id} value={m.modelId}>
                {m.modelId}
              </option>
            ))}
          </select>

          <label htmlFor="pcnb-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="pcnb-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="pcnb-execmode"
          />
        </div>

        {/* ── View prompts (transparency panel) ── */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setShowPrompts((v) => !v)}
            style={{
              background: 'transparent',
              color: '#58a6ff',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {showPrompts ? '▾ Hide prompts' : '▸ View prompts (system + bulleted-summary input)'}
          </button>
          {showPrompts && (
            <div
              style={{
                marginTop: '10px',
                background: '#0a0d12',
                border: '1px solid #21262d',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '11px',
                lineHeight: 1.55,
                color: '#c9d1d9',
              }}
            >
              <div style={promptSectionHeaderStyle}>System prompt (cached prefix)</div>
              <pre style={promptCodeBlockStyle}>{PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT}</pre>
              <div style={promptSectionHeaderStyle}>Input — the bulleted summary for this competitor</div>
              <pre style={promptCodeBlockStyle}>
                {bulletedSummary || '(no bulleted summary available)'}
              </pre>
            </div>
          )}
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
            <strong>Status:</strong> {status}
          </div>
          {(isDone || isRunning) && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#8b949e' }}>
              <span>Input tokens: {tally.inputTokens.toLocaleString()}</span>
              <span>Output tokens: {tally.outputTokens.toLocaleString()}</span>
              <span>Cost: ${tally.actualCostUsd.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* ── Result preview when completed ── */}
        {runState.kind === 'completed' && (
          <div
            style={{
              background: '#0a0d12',
              border: '1px solid #21262d',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '12px',
              lineHeight: 1.6,
              maxHeight: '300px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: "'IBM Plex Sans', sans-serif",
              color: '#e6edf3',
            }}
          >
            {runState.summary}
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
                disabled={!hasBulleted}
                style={{
                  ...primaryButtonStyle,
                  opacity: hasBulleted ? 1 : 0.5,
                  cursor: hasBulleted ? 'pointer' : 'not-allowed',
                }}
              >
                Start
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

const promptSectionHeaderStyle: React.CSSProperties = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#8b949e',
  fontWeight: 700,
  marginBottom: '6px',
};

const promptCodeBlockStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  background: '#161b22',
  padding: '8px 10px',
  borderRadius: '4px',
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: '10px',
  margin: '0 0 12px',
  maxHeight: '220px',
  overflow: 'auto',
};
