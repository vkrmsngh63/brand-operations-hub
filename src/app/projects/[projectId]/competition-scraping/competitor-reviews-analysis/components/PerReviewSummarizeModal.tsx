'use client';

// W#2 P-49 Workstream 5 Session 2 — Per-Review Summarize modal +
// browser batch loop per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27
// (browser-first execution mirroring W#1's AutoAnalyze pattern).
//
// The browser owns the queue + cost tally + pause/cancel controls;
// the server only proxies one batch per request via
// /api/projects/[projectId]/competition-scraping/review-analysis/run-batch.
// Each batch holds ~20 reviews; one Anthropic call per batch, well
// under Vercel's per-request time limit.

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
  PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
  buildPerReviewBatchUserMessage,
} from '@/lib/competition-scraping/review-analysis/prompts';
import type { CapturedReview } from '@/lib/shared-types/competition-scraping';

// Default batch size for v1. Conservative — each review averages ~150
// input tokens + ~100 output tokens, so 20 reviews per batch yields
// ~3K input + ~2K output, well within model limits + Vercel timeout.
// Future tuning: bump up once the first live runs confirm headroom.
const DEFAULT_BATCH_SIZE = 20;

const SUPPORTED_MODEL_VERSIONS = [
  'claude-opus-4-7',
  'claude-opus-4-6',
] as const;
type ModelVersion = (typeof SUPPORTED_MODEL_VERSIONS)[number];

export interface PerReviewSummarizeModalProps {
  projectId: string;
  urlId: string;
  productName: string;
  // platform comes from the parent CompetitorUrl (e.g., 'amazon', 'ebay');
  // shown verbatim in the user message so the model can disambiguate
  // platform-specific signals (Prime shipping vs Etsy handmade lead time).
  platform: string;
  // Full review rows for the URL — modal uses them to render the prompt
  // preview AND to derive the reviewIds it sends per batch. The batch
  // loop only ships reviewIds across the wire; the server fetches review
  // bodies from the DB again per-batch.
  reviews: ReadonlyArray<CapturedReview>;
  onClose: () => void;
  // Called once for each fresh-from-AI summary; the parent uses this to
  // update the Table 2 row state in real time as batches complete.
  onSummary: (reviewId: string, summary: string, source: 'cache' | 'fresh') => void;
}

interface BatchUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  actualCostUsd: number;
}

type RunState =
  | { kind: 'idle' }
  | {
      kind: 'running';
      batchIndex: number;
      totalBatches: number;
      doneCount: number;
      totalCount: number;
    }
  | {
      kind: 'completed';
      doneCount: number;
      totalCount: number;
    }
  | {
      kind: 'cancelled';
      doneCount: number;
      totalCount: number;
    }
  | {
      kind: 'error';
      message: string;
      doneCount: number;
      totalCount: number;
    };

function splitIntoBatches<T>(items: ReadonlyArray<T>, size: number): T[][] {
  if (size <= 0) throw new Error('batch size must be > 0');
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export function PerReviewSummarizeModal({
  projectId,
  urlId,
  productName,
  platform,
  reviews,
  onClose,
  onSummary,
}: PerReviewSummarizeModalProps): JSX.Element {
  const reviewIds = useMemo(() => reviews.map((r) => r.id), [reviews]);
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const [batchSize, setBatchSize] = useState<number>(DEFAULT_BATCH_SIZE);
  // Server mode = browser → Vercel → Anthropic (server's API key, per-
  // batch endpoint). Direct mode reserved for the future migration off
  // Vercel per feedback_browser_first_ai_with_server_migration.md; not
  // shipped today.
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
  const [tally, setTally] = useState<BatchUsage>({
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
    actualCostUsd: 0,
  });
  const [cacheHits, setCacheHits] = useState<number>(0);
  const [freshCount, setFreshCount] = useState<number>(0);

  const [showPrompts, setShowPrompts] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef(false);

  // Build a preview of the FIRST batch's user message using actual
  // review data. Shown verbatim in the View-prompts panel so director
  // sees exactly what's going to the model.
  const previewBatch = useMemo(
    () => reviews.slice(0, Math.max(1, batchSize)),
    [reviews, batchSize]
  );
  const totalBatchesPreview = Math.max(1, Math.ceil(reviews.length / Math.max(1, batchSize)));
  const previewUserMessage = useMemo(() => {
    if (previewBatch.length === 0) return '';
    return buildPerReviewBatchUserMessage({
      productName,
      platform,
      batchNumber: 1,
      totalBatches: totalBatchesPreview,
      reviews: previewBatch.map((r) => ({
        id: r.id,
        body: r.body,
        reviewerName: r.reviewerName,
        starRating: r.starRating,
        reviewDate: r.reviewDate ? new Date(r.reviewDate) : null,
      })),
    });
  }, [previewBatch, productName, platform, totalBatchesPreview]);

  useEffect(() => {
    return () => {
      // If unmounted mid-run, abort the in-flight fetch.
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
          'Direct (browser → Anthropic) is not yet wired in Session 2. Pick Server proxy for the v1 run.',
        doneCount: 0,
        totalCount: reviewIds.length,
      });
      return;
    }

    cancelledRef.current = false;
    const batches = splitIntoBatches(reviewIds, batchSize);
    setRunState({
      kind: 'running',
      batchIndex: 0,
      totalBatches: batches.length,
      doneCount: 0,
      totalCount: reviewIds.length,
    });
    setTally({
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
      actualCostUsd: 0,
    });
    setCacheHits(0);
    setFreshCount(0);

    let doneCount = 0;
    for (let i = 0; i < batches.length; i++) {
      if (cancelledRef.current) {
        setRunState({
          kind: 'cancelled',
          doneCount,
          totalCount: reviewIds.length,
        });
        return;
      }

      const batch = batches[i];
      setRunState({
        kind: 'running',
        batchIndex: i,
        totalBatches: batches.length,
        doneCount,
        totalCount: reviewIds.length,
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
              flow: 'per-review-summarize',
              urlId,
              reviewIds: batch,
              modelVersion,
            }),
            signal: controller.signal,
          }
        );
      } catch (err) {
        if (cancelledRef.current) {
          setRunState({
            kind: 'cancelled',
            doneCount,
            totalCount: reviewIds.length,
          });
          return;
        }
        setRunState({
          kind: 'error',
          message:
            err instanceof Error ? err.message : 'Network error during batch',
          doneCount,
          totalCount: reviewIds.length,
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
          message: `Batch ${i + 1} failed: ${detail}`,
          doneCount,
          totalCount: reviewIds.length,
        });
        return;
      }

      let body: {
        summaries: Array<{
          reviewId: string;
          summary: string;
          source: 'cache' | 'fresh';
        }>;
        freshCount: number;
        cachedCount: number;
        usage: BatchUsage;
      };
      try {
        body = await response.json();
      } catch (err) {
        setRunState({
          kind: 'error',
          message:
            'Failed to parse batch response: ' +
            (err instanceof Error ? err.message : 'unknown'),
          doneCount,
          totalCount: reviewIds.length,
        });
        return;
      }

      // Push summaries to the parent immediately so cells populate.
      for (const s of body.summaries) {
        onSummary(s.reviewId, s.summary, s.source);
      }

      doneCount += body.summaries.length;
      setCacheHits((prev) => prev + body.cachedCount);
      setFreshCount((prev) => prev + body.freshCount);
      setTally((prev) => ({
        inputTokens: prev.inputTokens + body.usage.inputTokens,
        outputTokens: prev.outputTokens + body.usage.outputTokens,
        cacheCreationInputTokens:
          prev.cacheCreationInputTokens + body.usage.cacheCreationInputTokens,
        cacheReadInputTokens:
          prev.cacheReadInputTokens + body.usage.cacheReadInputTokens,
        actualCostUsd: prev.actualCostUsd + body.usage.actualCostUsd,
      }));
    }

    setRunState({
      kind: 'completed',
      doneCount,
      totalCount: reviewIds.length,
    });
  }

  function handleCancel() {
    cancelledRef.current = true;
    abortRef.current?.abort();
  }

  const progress =
    runState.kind === 'running'
      ? `Batch ${runState.batchIndex + 1} of ${runState.totalBatches} — ${runState.doneCount}/${runState.totalCount} reviews done`
      : runState.kind === 'completed'
        ? `Complete — ${runState.doneCount}/${runState.totalCount} reviews summarized`
        : runState.kind === 'cancelled'
          ? `Cancelled — ${runState.doneCount}/${runState.totalCount} reviews done before stop`
          : runState.kind === 'error'
            ? `Error after ${runState.doneCount}/${runState.totalCount} reviews: ${runState.message}`
            : `${reviewIds.length} reviews queued`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="per-review-summarize-modal-title"
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
          width: '560px',
          maxWidth: '92vw',
          padding: '20px 24px 18px',
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: '#e6edf3',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          id="per-review-summarize-modal-title"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            margin: '0 0 4px',
            color: '#e6edf3',
          }}
        >
          Per-Review Summarize
        </h2>
        <div
          style={{
            fontSize: '12px',
            color: '#8b949e',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          Summarize <strong>{reviewIds.length} reviews</strong> for{' '}
          <strong>{productName}</strong>. One AI call per batch; the browser
          orchestrates the queue.
        </div>

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
          <label htmlFor="prs-model">Model</label>
          <select
            id="prs-model"
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

          <label htmlFor="prs-batchsize">Batch size</label>
          <input
            id="prs-batchsize"
            type="number"
            min={1}
            max={100}
            value={batchSize}
            onChange={(e) =>
              setBatchSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
            }
            disabled={isRunning || isDone}
            style={inputStyle}
          />

          <label htmlFor="prs-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="prs-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="prs-execmode"
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
            {showPrompts ? '▾ Hide prompts' : '▸ View prompts (system + first-batch preview)'}
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
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#8b949e',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}
              >
                System prompt (cached across batches)
              </div>
              <pre
                style={{
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
                }}
              >
                {PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT}
              </pre>
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#8b949e',
                  fontWeight: 700,
                  marginBottom: '6px',
                }}
              >
                User message — Batch 1 preview (first {previewBatch.length} of {reviews.length} reviews)
              </div>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  background: '#161b22',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '10px',
                  margin: 0,
                  maxHeight: '240px',
                  overflow: 'auto',
                }}
              >
                {previewUserMessage || '(no reviews available to preview)'}
              </pre>
              <div style={{ fontSize: '10px', color: '#6e7681', marginTop: '8px' }}>
                Subsequent batches use the SAME system prompt + the same user-message
                shape with different reviews (Batch 2 of {totalBatchesPreview}, etc.).
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
            <strong>Status:</strong> {progress}
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', color: '#8b949e' }}>
            <span>Cache hits: {cacheHits}</span>
            <span>Fresh AI summaries: {freshCount}</span>
            <span>
              Input tokens: {tally.inputTokens.toLocaleString()}
            </span>
            <span>
              Output tokens: {tally.outputTokens.toLocaleString()}
            </span>
            <span>
              Running cost: ${tally.actualCostUsd.toFixed(4)}
            </span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {!isRunning && !isDone && (
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
                onClick={handleStart}
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

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: '12px',
  background: '#0d1117',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '6px',
  width: '80px',
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
