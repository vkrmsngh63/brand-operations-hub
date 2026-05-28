'use client';

// W#2 P-49 Workstream 5 Session 4 — Per-Category Summarize modal +
// single-call run per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27-d
// (this session). Mirrors PerCompetitorSummarizeModal but operates at
// the category level: ONE Anthropic call per click pools all reviews
// across N CompetitorUrls sharing the same Category value into ONE
// theme-grouped bulleted summary string.
//
// Browser-first per feedback_browser_first_ai_with_server_migration.md
// — server proxies the single Anthropic call via the existing per-batch
// endpoint with flow='per-category-bulleted'.

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
  PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
  buildPerCategoryBulletedUserMessage,
} from '@/lib/competition-scraping/review-analysis/prompts';

const SUPPORTED_MODEL_VERSIONS = [
  'claude-opus-4-7',
  'claude-opus-4-6',
] as const;
type ModelVersion = (typeof SUPPORTED_MODEL_VERSIONS)[number];

// Per-product summary entry passed in by the parent — used for the
// View prompts preview header. The actual review bodies are NOT passed
// in (the server resolves them server-side); the preview shows only a
// product-list header for transparency.
export interface PerCategoryProductInput {
  urlId: string;
  productLabel: string;
  platform: string;
  reviewCount: number;
}

export interface PerCategorySummarizeModalProps {
  projectId: string;
  categoryName: string;
  products: ReadonlyArray<PerCategoryProductInput>;
  // Total review count across the category — surfaced in the modal
  // header + the Start button label.
  totalReviewCount: number;
  onClose: () => void;
  // Called once when the call returns successfully so the parent can
  // paint the new summary into the page row immediately.
  onSummary: (
    categoryName: string,
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

export function PerCategorySummarizeModal({
  projectId,
  categoryName,
  products,
  totalReviewCount,
  onClose,
  onSummary,
}: PerCategorySummarizeModalProps): JSX.Element {
  const urlIds = useMemo(() => products.map((p) => p.urlId), [products]);
  const [modelVersion, setModelVersion] = useState<ModelVersion>('claude-opus-4-7');
  const [executionMode, setExecutionMode] =
    useState<ExecutionMode>(EXECUTION_MODE_SERVER);
  const [runState, setRunState] = useState<RunState>({ kind: 'idle' });
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

  // User-message preview shows just the category header + per-product
  // breakdown (no review bodies, since the modal doesn't have them —
  // the server resolves them from the URLs).
  const previewUserMessage = useMemo(() => {
    return buildPerCategoryBulletedUserMessage({
      categoryName,
      products: products.map((p) => ({
        productLabel: p.productLabel,
        platform: p.platform,
        reviewCount: p.reviewCount,
      })),
      // Empty reviews array — preview shows only the header + product
      // list. The "(server resolves N reviews at run time)" footer
      // below tells the user the live call will include them.
      reviews: [],
    });
  }, [categoryName, products]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const isRunning = runState.kind === 'running';
  const isDone = runState.kind !== 'idle' && runState.kind !== 'running';

  async function handleStart() {
    if (urlIds.length === 0) return;
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
            flow: 'per-category-bulleted',
            categoryName,
            urlIds,
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
      flow: 'per-category-bulleted';
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
    onSummary(categoryName, body.analysisId, body.summary, body.source);
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
      ? `Calling Claude with ${totalReviewCount} reviews across ${products.length} product${products.length === 1 ? '' : 's'}…`
      : runState.kind === 'completed'
        ? runState.source === 'cache'
          ? 'Complete — served from cache (no AI cost)'
          : 'Complete — fresh AI summary'
        : runState.kind === 'cancelled'
          ? 'Cancelled before the call returned'
          : runState.kind === 'error'
            ? `Error: ${runState.message}`
            : `${totalReviewCount} reviews across ${products.length} product${products.length === 1 ? '' : 's'} queued — one AI call`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="per-category-summarize-modal-title"
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
          width: '640px',
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
          id="per-category-summarize-modal-title"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            margin: '0 0 4px',
            color: '#e6edf3',
          }}
        >
          Per-Category Summarize
        </h2>
        <div
          style={{
            fontSize: '12px',
            color: '#8b949e',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          Aggregate <strong>{totalReviewCount} reviews</strong> across{' '}
          <strong>{products.length} product{products.length === 1 ? '' : 's'}</strong>{' '}
          in category <strong>{categoryName}</strong> into one theme-grouped
          bulleted critique summary. ONE AI call across the full category
          corpus; cross-product convergence is surfaced where critique
          patterns recur across products.
        </div>

        {/* ── Completion banner — proactively shipped from Session 1 of
            this flow per the W5 Session 3 Pattern (Per-Competitor had to
            ship it via FF#2; Per-Category ships it from the start). */}
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
                ? `Served from cache (no AI cost) for category "${categoryName}".`
                : `Fresh AI critique summary for category "${categoryName}" (${totalReviewCount} reviews across ${products.length} product${products.length === 1 ? '' : 's'} aggregated).`}
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
          <label htmlFor="pcat-model">Model</label>
          <select
            id="pcat-model"
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

          <label htmlFor="pcat-execmode">Execution mode</label>
          <ExecutionModeSelect
            id="pcat-execmode"
            value={executionMode}
            onChange={setExecutionMode}
            disabled={isRunning || isDone}
            className="pcat-execmode"
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
                {PER_CATEGORY_BULLETED_SYSTEM_PROMPT}
              </pre>
              <div style={promptSectionHeaderStyle}>
                User message — header preview (server resolves and
                appends all {totalReviewCount} review bodies at run time)
              </div>
              <pre style={promptCodeBlockStyle}>
                {previewUserMessage || '(no products in this category)'}
              </pre>
              <div style={{ fontSize: '10px', color: '#6e7681', marginTop: '8px' }}>
                The actual call appends all {totalReviewCount} review
                bodies (tagged with product labels) below this header.
                Server-side resolution avoids transmitting thousands of
                review bodies through the browser.
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
                disabled={urlIds.length === 0 || totalReviewCount === 0}
                style={{
                  ...primaryButtonStyle,
                  opacity: urlIds.length === 0 || totalReviewCount === 0 ? 0.5 : 1,
                  cursor:
                    urlIds.length === 0 || totalReviewCount === 0
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Start ({totalReviewCount} reviews · {products.length} product{products.length === 1 ? '' : 's'})
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
