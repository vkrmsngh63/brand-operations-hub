'use client';

// W#2 P-46 Workstream 2 Session 3 (2026-05-27) — URL-level + per-category
// Overall Analysis text box. Parallels `PerItemAnalysisBox` (which owns
// the per-row save lifecycle for the `analysis` column on captured items)
// but PATCHes the URL row instead — either the URL-level
// `overallCompetitorAnalysis` doc OR one slot in the `overallAnalyses`
// per-category bag.
//
// Why a separate component (not reuse PerItemAnalysisBox): the per-row
// component hard-codes `{ analysis: content }` as the PATCH body and is
// shared across 3 capture types via the apiUrl prop. The URL-level box
// PATCHes the urls/[urlId] route with one of two distinct body shapes
// (`{ overallCompetitorAnalysis: <doc> }` OR `{ overallAnalyses: { <category>:
// <doc> } }`). A `field` discriminator on this component captures the
// body shape; the two components share the save-lifecycle shape but not
// the wire shape, so keeping them parallel keeps each component's
// contract obvious at the callsite.

import { useCallback, useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type { OverallAnalysesCategory } from '@/lib/rich-text/tiptap-helpers';
import { RichTextEditor } from './RichTextEditor';

export type OverallAnalysisField =
  | { kind: 'overallCompetitorAnalysis' }
  | { kind: 'overallAnalyses'; category: OverallAnalysesCategory };

export interface OverallAnalysisBoxProps {
  // The URL-level PATCH endpoint
  // (/api/projects/[projectId]/competition-scraping/urls/[urlId]).
  apiUrl: string;

  // The persisted doc this box edits. For 'overallCompetitorAnalysis' that's
  // the URL row's column value; for 'overallAnalyses.<category>' that's the
  // bag's slot at that key (or `{}` when the category hasn't been edited
  // yet — the route merges so this slot can be empty on first save).
  initialContent: Record<string, unknown>;

  // Which URL-level field this box edits. Drives the PATCH body shape.
  field: OverallAnalysisField;

  // Label displayed above the editor.
  label: string;

  // Placeholder rendered inside the empty editor.
  placeholder?: string;

  // Optional Playwright hook on the editor's outer DOM node.
  testId?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVED_INDICATOR_MS = 1500;

function buildBody(
  field: OverallAnalysisField,
  content: Record<string, unknown>
): Record<string, unknown> {
  if (field.kind === 'overallCompetitorAnalysis') {
    return { overallCompetitorAnalysis: content };
  }
  return { overallAnalyses: { [field.category]: content } };
}

export function OverallAnalysisBox({
  apiUrl,
  initialContent,
  field,
  label,
  placeholder = 'Write your overall analysis here…',
  testId,
}: OverallAnalysisBoxProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const inFlightGen = useRef(0);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (savedTimer.current !== null) {
        clearTimeout(savedTimer.current);
        savedTimer.current = null;
      }
    };
  }, []);

  const handleChange = useCallback(
    async (content: Record<string, unknown>): Promise<void> => {
      const myGen = ++inFlightGen.current;
      setSaveState('saving');
      setSaveError(null);
      try {
        const res = await authFetch(apiUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildBody(field, content)),
        });
        if (myGen !== inFlightGen.current) return;
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body && typeof body.error === 'string') detail = body.error;
          } catch {
            // ignore — keep generic HTTP detail
          }
          setSaveState('error');
          setSaveError(detail);
          return;
        }
        setSaveState('saved');
        if (savedTimer.current !== null) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => {
          if (myGen === inFlightGen.current) setSaveState('idle');
        }, SAVED_INDICATOR_MS);
      } catch (err) {
        if (myGen !== inFlightGen.current) return;
        setSaveState('error');
        setSaveError(err instanceof Error ? err.message : 'Network error');
      }
    },
    [apiUrl, field]
  );

  return (
    <div style={overallAnalysisBoxStyle}>
      <div style={overallAnalysisHeaderStyle}>
        <span>{label}</span>
        <SaveStateIndicator state={saveState} error={saveError} />
      </div>
      <RichTextEditor
        initialContent={initialContent}
        onChange={handleChange}
        placeholder={placeholder}
        variant="minimal"
        testId={testId}
      />
    </div>
  );
}

function SaveStateIndicator({
  state,
  error,
}: {
  state: SaveState;
  error: string | null;
}) {
  if (state === 'idle') return null;
  if (state === 'saving') {
    return (
      <span
        style={{ fontSize: '11px', color: '#8b949e', textTransform: 'none', letterSpacing: 0 }}
      >
        Saving…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span
        style={{ fontSize: '11px', color: '#3fb950', textTransform: 'none', letterSpacing: 0 }}
      >
        ✓ Saved
      </span>
    );
  }
  return (
    <span
      style={{ fontSize: '11px', color: '#f85149', textTransform: 'none', letterSpacing: 0 }}
      title={error ?? undefined}
    >
      Save failed{error ? ` — ${error}` : ''}. Type more to retry.
    </span>
  );
}

const overallAnalysisBoxStyle: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px 14px',
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: '8px',
};

const overallAnalysisHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '6px',
  fontSize: '12px',
  color: '#8b949e',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
