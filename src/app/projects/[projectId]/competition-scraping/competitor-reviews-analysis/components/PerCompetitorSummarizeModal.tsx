'use client';

// W#2 P-49 Workstream 5 Session 3 — Per-Competitor Summarize modal +
// single-call run per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27-b
// + §B 2026-05-27-c (this session). Mirrors the PerReviewSummarizeModal
// shape but operates at the URL-corpus level: ONE Anthropic call per
// click (not a batch loop), output is ONE theme-grouped bulleted
// summary string for the entire URL.
//
// Browser-first per feedback_browser_first_ai_with_server_migration.md
// — server proxies the single Anthropic call via the existing per-batch
// endpoint with flow='per-competitor-bulleted'.

import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  PER_COMPETITOR_BULLETED_SYSTEM_PROMPT,
  buildPerCompetitorBulletedUserMessage,
} from '@/lib/competition-scraping/review-analysis/prompts';
import type { CapturedReview } from '@/lib/shared-types/competition-scraping';

// SUPPORTED_MODEL_VERSIONS imported from the central registry (models.ts)
// per HANDOFF_PROTOCOL Rule 32 — no local copy to drift.
type ModelVersion = SupportedModelVersion;

export interface PerCompetitorSummarizeModalProps {
  projectId: string;
  urlId: string;
  productName: string;
  platform: string;
  reviews: ReadonlyArray<CapturedReview>;
  // FU-1 (a.110): true when this competitor's traceability table was
  // hand-edited on the URL detail page. Re-running replaces those edits, so
  // we warn + require an explicit confirm before starting (director pick).
  manuallyEdited?: boolean;
  onClose: () => void;
  // Called once when the call returns successfully so the parent can
  // paint the new summary into the Table 2 URL row immediately.
  // analysisId is the ReviewAnalysis row id — needed for the in-banner
  // Edit affordance's PATCH call.
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
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  actualCostUsd: number;
}

type RunState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'completed'; summary: string; source: 'cache' | 'fresh' }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string };

export function PerCompetitorSummarizeModal({
  projectId,
  urlId,
  productName,
  platform,
  reviews,
  manuallyEdited = false,
  onClose,
  onSummary,
}: PerCompetitorSummarizeModalProps): JSX.Element {
  const reviewIds = useMemo(() => reviews.map((r) => r.id), [reviews]);
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  // FU-1 (a.110): interstitial confirm shown when manuallyEdited is true.
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [tally, setTally] = useState<CallUsage>({
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
    actualCostUsd: 0,
  });

  const [showPrompts, setShowPrompts] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  // Preview a TRIMMED version of the user message — for corpora of
  // 100+ reviews the full preview is overwhelming. Show first ~5
  // reviews + a footer noting how many more are in the actual call.
  const PREVIEW_REVIEW_COUNT = 5;
  const previewReviews = useMemo(
    () => reviews.slice(0, PREVIEW_REVIEW_COUNT),
    [reviews]
  );
  const previewUserMessage = useMemo(() => {
    if (previewReviews.length === 0) return '';
    return buildPerCompetitorBulletedUserMessage({
      productName,
      platform,
      reviews: previewReviews.map((r) => ({
        id: r.id,
        body: r.body,
        reviewerName: r.reviewerName,
        starRating: r.starRating,
        reviewDate: r.reviewDate ? new Date(r.reviewDate) : null,
      })),
    });
  }, [previewReviews, productName, platform]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const isRunning = runState.kind === 'running';
  const isDone = runState.kind !== 'idle' && runState.kind !== 'running';

  async function handleStart() {
    if (reviewIds.length === 0) return;
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
    setTally({
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
      actualCostUsd: 0,
    });

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
            flow: 'per-competitor-bulleted',
            urlId,
            reviewIds,
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
        message:
          err instanceof Error ? err.message : 'Network error during call',
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
      setRunState({
        kind: 'error',
        message: `AI call failed: ${detail}`,
      });
      return;
    }

    let body: {
      flow: 'per-competitor-bulleted';
      analysisId: string;
      summary: string;
      source: 'cache' | 'fresh';
      usage: CallUsage & {
        estimatedCostUsd: number;
      };
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
      cacheCreationInputTokens: body.usage.cacheCreationInputTokens,
      cacheReadInputTokens: body.usage.cacheReadInputTokens,
      actualCostUsd: body.usage.actualCostUsd,
    });
    onSummary(urlId, body.analysisId, body.summary, body.source);
    setRunState({
      kind: 'completed',
      summary: body.summary,
      source: body.source,
    });
  }

  function handleCancel() {
    cancelledRef.current = true;
    abortRef.current?.abort();
  }

  const status =
    runState.kind === 'running'
      ? `Calling Claude with ${reviewIds.length} reviews…`
      : runState.kind === 'completed'
        ? runState.source === 'cache'
          ? 'Complete — served from cache (no AI cost)'
          : 'Complete — fresh AI summary'
        : runState.kind === 'cancelled'
          ? 'Cancelled before the call returned'
          : runState.kind === 'error'
            ? `Error: ${runState.message}`
            : `${reviewIds.length} reviews queued — one AI call`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="per-competitor-summarize-modal-title"
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
          id="per-competitor-summarize-modal-title"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            margin: '0 0 4px',
            color: '#e6edf3',
          }}
        >
          Per-Competitor Summarize
        </h2>
        <div
          style={{
            fontSize: '12px',
            color: '#8b949e',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          Aggregate <strong>{reviewIds.length} reviews</strong> across{' '}
          <strong>{productName}</strong> into one theme-grouped bulleted
          critique summary. ONE AI call per competitor; the browser fires it
          via the per-batch endpoint.
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
              {runState.source === 'cache'
                ? `Served from cache (no AI cost) for ${productName}.`
                : `Fresh AI critique summary for ${productName} (${reviewIds.length} reviews aggregated).`}
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
          <label htmlFor="pcs-model">Model</label>
          <select
            id="pcs-model"
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

          <label htmlFor="pcs-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="pcs-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="pcs-execmode"
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
            {showPrompts ? '▾ Hide prompts' : '▸ View prompts (system + user-message preview)'}
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
              <div style={promptSectionHeaderStyle}>
                System prompt (cached prefix)
              </div>
              <pre style={promptCodeBlockStyle}>
                {PER_COMPETITOR_BULLETED_SYSTEM_PROMPT}
              </pre>
              <div style={promptSectionHeaderStyle}>
                User message — preview (first {previewReviews.length} of {reviews.length} reviews)
              </div>
              <pre style={promptCodeBlockStyle}>
                {previewUserMessage || '(no reviews available to preview)'}
              </pre>
              <div style={{ fontSize: '10px', color: '#6e7681', marginTop: '8px' }}>
                The actual call includes all {reviews.length} reviews in
                the corpus (one Anthropic call, well under the model
                context window for typical corpora).
              </div>
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

        {/* FU-1 (a.110) — warn before a re-run replaces hand-edits. */}
        {showOverwriteWarning && !isRunning && !isDone && (
          <div
            style={overwriteWarnStyle}
            data-testid="per-competitor-overwrite-warning"
          >
            This competitor’s analysis table has manual edits. Re-running the AI
            will replace them with a fresh version. Continue?
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                style={dangerButtonStyle}
                onClick={() => {
                  setShowOverwriteWarning(false);
                  void handleStart();
                }}
              >
                Replace my edits &amp; continue
              </button>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => setShowOverwriteWarning(false)}
              >
                Keep my edits
              </button>
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {!isRunning && !isDone && !showOverwriteWarning && (
            <>
              <button
                type="button"
                onClick={onClose}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (manuallyEdited) setShowOverwriteWarning(true);
                  else void handleStart();
                }}
                disabled={reviewIds.length === 0}
                style={{
                  ...primaryButtonStyle,
                  opacity: reviewIds.length === 0 ? 0.5 : 1,
                  cursor: reviewIds.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Start ({reviewIds.length} reviews)
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

// ─── Inline style constants ─────────────────────────────────────────

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
