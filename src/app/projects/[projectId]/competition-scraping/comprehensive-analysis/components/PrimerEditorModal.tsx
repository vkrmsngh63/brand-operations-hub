'use client';

// W#2 P-55 Phase 3 part 3 (2026-06-02-d) — the "Edit primer" modal. Lets the
// director customize the teaching primer and SAVE it. Once saved, the saved
// version is what the Files-box .docx download + the editor's "Insert primer"
// button use (see primer-render.ts resolveCurrentPrimer). "Reset to default"
// clears the override so the auto-generated primer (reflecting current columns)
// is used again.
//
// Storage: PUT { primerJson } to .../comprehensive-analysis/primer (null = reset).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { authFetch } from '@/lib/authFetch';
import { RichTextEditor } from '../../components/RichTextEditor';
import {
  resolveCurrentPrimer,
  resolvedPrimerToTipTapDoc,
  buildPrimerFromUrls,
} from './primer-render';
import { renderPrimerToTipTapDoc } from '@/lib/competition-scraping/comprehensive-analysis-primer';
import type { MainExportUrl } from '@/lib/competition-scraping/comprehensive-analysis-exports';

interface Props {
  projectId: string;
  onClose: () => void;
  // Called after a successful save/reset so the parent can note the change.
  onSaved?: () => void;
}

type Load =
  | { kind: 'loading' }
  | { kind: 'ready'; initialContent: Record<string, unknown>; hasOverride: boolean }
  | { kind: 'error'; message: string };

export function PrimerEditorModal({ projectId, onClose, onSaved }: Props) {
  const [load, setLoad] = useState<Load>({ kind: 'loading' });
  const [busy, setBusy] = useState<null | 'save' | 'reset'>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const contentRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resolved = await resolveCurrentPrimer(projectId);
        if (cancelled) return;
        const doc = resolvedPrimerToTipTapDoc(resolved);
        contentRef.current = doc;
        setLoad({ kind: 'ready', initialContent: doc, hasOverride: resolved.kind === 'saved' });
      } catch (err) {
        if (!cancelled) {
          setLoad({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Could not load the primer.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const putPrimer = useCallback(
    async (primerJson: Record<string, unknown> | null) => {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/comprehensive-analysis/primer`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ primerJson }),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          /* keep generic */
        }
        throw new Error(detail);
      }
    },
    [projectId]
  );

  const handleSave = useCallback(async () => {
    setError(null);
    setBusy('save');
    try {
      const content = contentRef.current ?? { type: 'doc', content: [] };
      await putPrimer(content);
      setSavedNote('Saved. Your edited primer is now used for the download and the “Insert primer” button.');
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(null);
    }
  }, [putPrimer, onSaved]);

  const handleReset = useCallback(async () => {
    const ok = window.confirm(
      'Reset the primer to the automatically-written version? This discards your saved edits and goes back to the primer that reflects your current columns.'
    );
    if (!ok) return;
    setError(null);
    setBusy('reset');
    try {
      // Clear the saved override…
      await putPrimer(null);
      // …then load the freshly-generated default into the editor.
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
      );
      if (!res.ok) throw new Error(`Couldn’t load the competitor data (HTTP ${res.status}).`);
      const rows = ((await res.json()) as MainExportUrl[]) ?? [];
      const doc = renderPrimerToTipTapDoc(
        buildPrimerFromUrls(Array.isArray(rows) ? rows : [])
      );
      contentRef.current = doc;
      editorRef.current?.commands.setContent(doc as never);
      setSavedNote('Reset to the automatically-written primer. The download and “Insert primer” now use that version.');
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset.');
    } finally {
      setBusy(null);
    }
  }, [putPrimer, projectId, onSaved]);

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" data-testid="primer-editor-modal">
      <div style={panelStyle}>
        <div style={panelHeaderStyle}>
          <span style={panelTitleStyle}>Edit the Competitive Analysis Primer</span>
          <button type="button" onClick={onClose} style={closeBtnStyle} title="Close">
            ✕
          </button>
        </div>
        <p style={panelBlurbStyle}>
          Edit the teaching primer below. Click <strong>Save</strong> to use your
          version for the Word download and the “Insert primer” button.
          <strong> Reset to default</strong> goes back to the automatically-written
          primer that reflects your current columns. Your saved version will not
          auto-update when columns change — reset to refresh it.
        </p>

        {error ? <div style={errStyle}>{error}</div> : null}
        {savedNote ? <div style={okStyle}>{savedNote}</div> : null}

        {load.kind === 'loading' && <div style={dimStyle}>Loading the primer…</div>}
        {load.kind === 'error' && <div style={errStyle}>{load.message}</div>}
        {load.kind === 'ready' && (
          <RichTextEditor
            initialContent={load.initialContent}
            onChange={(c) => {
              contentRef.current = c;
            }}
            variant="full"
            projectId={projectId}
            testId="primer-editor"
            onEditorReady={(e) => {
              editorRef.current = e;
            }}
          />
        )}

        <div style={footerStyle}>
          <button
            type="button"
            onClick={handleReset}
            disabled={busy !== null || load.kind !== 'ready'}
            style={secondaryBtnStyle(busy !== null || load.kind !== 'ready')}
            data-testid="primer-reset-default"
          >
            {busy === 'reset' ? 'Resetting…' : 'Reset to default'}
          </button>
          <span style={{ flex: 1 }} aria-hidden />
          <button type="button" onClick={onClose} style={ghostBtnStyle} disabled={busy !== null}>
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy !== null || load.kind !== 'ready'}
            style={primaryBtnStyle(busy !== null || load.kind !== 'ready')}
            data-testid="primer-save"
          >
            {busy === 'save' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(1,4,9,0.7)',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '40px 16px',
  zIndex: 1000,
  overflowY: 'auto',
};
const panelStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '820px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '10px',
  padding: '18px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
};
const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '6px',
};
const panelTitleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 700, color: '#e6edf3' };
const panelBlurbStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b949e',
  lineHeight: 1.5,
  marginTop: 0,
  marginBottom: '12px',
};
const closeBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#8b949e',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
};
const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '14px',
};
const dimStyle: React.CSSProperties = { color: '#8b949e', fontSize: '13px', padding: '12px 0' };
const errStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: '#1a0d0d',
  border: '1px solid #f85149',
  borderRadius: '6px',
  color: '#f85149',
  fontSize: '12px',
  marginBottom: '10px',
};
const okStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: '#0d1a0d',
  border: '1px solid #238636',
  borderRadius: '6px',
  color: '#3fb950',
  fontSize: '12px',
  marginBottom: '10px',
};
function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '7px 16px',
    background: disabled ? '#21262d' : '#238636',
    color: disabled ? '#6e7681' : '#fff',
    border: '1px solid #30363d',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  };
}
function secondaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '7px 14px',
    background: 'transparent',
    color: disabled ? '#6e7681' : '#d29922',
    border: '1px solid #30363d',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  };
}
const ghostBtnStyle: React.CSSProperties = {
  padding: '7px 14px',
  background: 'transparent',
  color: '#c9d1d9',
  border: '1px solid #30363d',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
