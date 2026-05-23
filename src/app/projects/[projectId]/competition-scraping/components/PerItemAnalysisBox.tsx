'use client';

// W#2 P-46 Workstream 2 (2026-05-25) — per-item Analysis text box.
//
// Used under every Captured Text / Image / Video / Review row on the URL
// detail page (per docs/COMPETITION_DATA_V2_DESIGN.md §C.2). Session 1
// wires it on Captured Text only as the first slice; subsequent
// Workstream 2 sessions add it to Image / Video / Review by passing a
// different `apiUrl`.
//
// Owns: the per-row save lifecycle for ONE captured item's analysis JSON.
// Delegates the editor surface to RichTextEditor.
//
// The wrapper does NOT lift its post-save analysis content back into the
// parent's list state — the editor is the source of truth while mounted;
// the next time the URL detail page re-mounts (or re-fetches), the row's
// analysis comes from the server's persisted value. So saving is fire-
// and-forget from the parent's perspective; the wrapper surfaces "saving
// …" / "saved" / "save failed" inline.

import { useCallback, useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { RichTextEditor } from './RichTextEditor';

export interface PerItemAnalysisBoxProps {
  // The per-row PATCH endpoint. The wrapper PATCHes
  //   { analysis: <TipTap JSON> }
  // against this URL whenever the editor settles after a typing pause.
  apiUrl: string;

  // The persisted analysis on this row, read from the wire shape's
  // `analysis: Record<string, unknown>` field (schema default `{}`).
  initialAnalysis: Record<string, unknown>;

  // Label displayed above the editor. Defaults to "Your Analysis."
  label?: string;

  // Placeholder rendered inside the empty editor.
  placeholder?: string;

  // Optional Playwright hook on the editor's outer DOM node.
  testId?: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVED_INDICATOR_MS = 1500;

export function PerItemAnalysisBox({
  apiUrl,
  initialAnalysis,
  label = 'Your Analysis',
  placeholder = 'Write your analysis for this captured item…',
  testId,
}: PerItemAnalysisBoxProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  // Generation counter — bumped on each new PATCH so a stale response
  // (e.g., user typed again before the prior PATCH returned) doesn't
  // overwrite the in-flight state. Only the latest generation flips state.
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
          body: JSON.stringify({ analysis: content }),
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
    <div style={{ marginTop: '10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px',
          fontSize: '12px',
          color: '#8b949e',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <span>{label}</span>
        <SaveStateIndicator state={saveState} error={saveError} />
      </div>
      <RichTextEditor
        initialContent={initialAnalysis}
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
