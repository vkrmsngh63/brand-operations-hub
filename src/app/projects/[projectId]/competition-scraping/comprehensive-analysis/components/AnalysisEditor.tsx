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
  apiUrl: string;
  initialContent: Record<string, unknown>;
  projectId: string;
  placeholder?: string;
  testId?: string;

  // Called after a successful PUT so the parent page can refresh its
  // read-mode view with the freshly persisted contentJson + lastEditedAt.
  // Without this, switching from Edit → Done shows the stale loadState
  // captured at page mount instead of what the director just typed.
  onSaved?: (saved: {
    contentJson: Record<string, unknown>;
    lastEditedAt: string;
  }) => void;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVED_INDICATOR_MS = 1500;
const DEFAULT_EDITOR_FONT_SIZE_PX = 14;
const MIN_EDITOR_FONT_SIZE_PX = 10;
const MAX_EDITOR_FONT_SIZE_PX = 24;
const FONT_SIZE_STORAGE_PREFIX = 'plos:analysis-editor:fontSize:';

function clampFontSize(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_EDITOR_FONT_SIZE_PX;
  return Math.max(MIN_EDITOR_FONT_SIZE_PX, Math.min(MAX_EDITOR_FONT_SIZE_PX, Math.round(n)));
}

function readStoredFontSize(projectId: string): number {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_FONT_SIZE_PX;
  try {
    const raw = window.localStorage.getItem(FONT_SIZE_STORAGE_PREFIX + projectId);
    if (raw === null) return DEFAULT_EDITOR_FONT_SIZE_PX;
    const n = Number.parseInt(raw, 10);
    return clampFontSize(n);
  } catch {
    return DEFAULT_EDITOR_FONT_SIZE_PX;
  }
}

function writeStoredFontSize(projectId: string, next: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      FONT_SIZE_STORAGE_PREFIX + projectId,
      String(clampFontSize(next))
    );
  } catch {
    // localStorage may be disabled; non-fatal
  }
}

export function AnalysisEditor({
  apiUrl,
  initialContent,
  projectId,
  placeholder = 'Write your comprehensive competitor analysis here…',
  testId,
  onSaved,
}: AnalysisEditorProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_EDITOR_FONT_SIZE_PX);
  const inFlightGen = useRef(0);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate font size from localStorage on mount (client-only to keep SSR
  // hydration stable — default is used during SSR + initial render).
  useEffect(() => {
    setFontSize(readStoredFontSize(projectId));
  }, [projectId]);

  const handleFontSizeChange = useCallback(
    (next: number) => {
      const clamped = clampFontSize(next);
      setFontSize(clamped);
      writeStoredFontSize(projectId, clamped);
    },
    [projectId]
  );

  // Keep onSaved in a ref so handleChange doesn't tear down on parent
  // re-renders that pass a fresh callback reference.
  const onSavedRef = useRef(onSaved);
  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

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
        // Lift saved state back up so the parent's read view + last-edited
        // timestamp reflect the fresh write immediately (no GET refetch).
        let savedLastEditedAt: string | null = null;
        try {
          const body = (await res.json()) as {
            contentJson?: Record<string, unknown>;
            lastEditedAt?: string;
          };
          if (body && typeof body.lastEditedAt === 'string') {
            savedLastEditedAt = body.lastEditedAt;
          }
        } catch {
          // response wasn't JSON — fall back to client clock
        }
        if (onSavedRef.current) {
          onSavedRef.current({
            contentJson: content,
            lastEditedAt: savedLastEditedAt ?? new Date().toISOString(),
          });
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
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
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
