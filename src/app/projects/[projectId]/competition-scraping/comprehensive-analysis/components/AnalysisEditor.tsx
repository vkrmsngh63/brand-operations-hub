'use client';

// W#2 P-46 Workstream 4 (2026-05-24) — per-Project Comprehensive
// Competitor Analysis editor wrapper. Owns the per-Project save lifecycle.
// Wraps RichTextEditor with variant='full' (headings + lists +
// bold/italic/underline + hyperlinks + code blocks per §A.5).
//
// PUTs `{ contentJson }` against
// /api/projects/[projectId]/competition-scraping/comprehensive-analysis
// whenever the editor settles after a typing pause. Save status surfaced
// inline next to the editor heading.
//
// Parallel-component to PerItemAnalysisBox (W2 S1) — different wire body
// shape ({ contentJson } vs { analysis }), different method (PUT vs PATCH),
// different toolbar variant, but same save-lifecycle Pattern memorialized
// in CORRECTIONS_LOG 2026-05-25 (PerItemAnalysisBox extraction).

import { useCallback, useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { RichTextEditor } from '../../components/RichTextEditor';

export interface AnalysisEditorProps {
  // The per-Project PUT endpoint.
  apiUrl: string;

  // The persisted comprehensive analysis doc on this Project, read from
  // the wire shape's `contentJson: Record<string, unknown>` field.
  // Empty object `{}` for a Project that has never been edited.
  initialContent: Record<string, unknown>;

  // P-46 W4 S2 — Project id threaded through to the RichTextEditor so the
  // internal-hyperlink `#url/<urlId>` extension can navigate same-tab and
  // the "Link to URL" toolbar picker can load this Project's URL list.
  projectId: string;

  placeholder?: string;
  testId?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVED_INDICATOR_MS = 1500;

export function AnalysisEditor({
  apiUrl,
  initialContent,
  projectId,
  placeholder = 'Write your comprehensive competitor analysis here…',
  testId,
}: AnalysisEditorProps) {
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
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentJson: content }),
        });
        if (myGen !== inFlightGen.current) return; // stale; newer save in flight
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
    [apiUrl]
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
          fontSize: '12px',
          color: '#8b949e',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <span>Edit Mode</span>
        <SaveStateIndicator state={saveState} error={saveError} />
      </div>
      <RichTextEditor
        initialContent={initialContent}
        onChange={handleChange}
        placeholder={placeholder}
        variant="full"
        testId={testId}
        projectId={projectId}
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
  const base: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: 500,
  };
  if (state === 'saving') {
    return <span style={{ ...base, color: '#8b949e' }}>Saving…</span>;
  }
  if (state === 'saved') {
    return <span style={{ ...base, color: '#3fb950' }}>✓ Saved</span>;
  }
  return (
    <span style={{ ...base, color: '#f85149' }} title={error ?? undefined}>
      Save failed{error ? ` — ${error}` : ''}. Type more to retry.
    </span>
  );
}
