'use client';

// W#2 per-URL detail page — vocabulary typeahead picker (slice a.3).
//
// Used by EditableVocabularyField to let the user pick from existing
// VocabularyEntry values for a type — Competition Category / Product Name
// / Brand Name in slice (a.3). The picker:
//
//   - Loads `/api/projects/[projectId]/vocabulary?type=...` on first focus
//     and keeps the entries in component state.
//   - Renders a text input. Typing filters the suggestion list.
//   - Suggestions render a "+ Create '<typed value>'" row at the bottom
//     when the typed value is non-empty AND not already in the list.
//   - Picking an existing suggestion sets `value` to it.
//   - Picking the "Create" row hits `POST /vocabulary`, then sets `value`.
//     The existing endpoint is idempotent on the unique constraint, so a
//     race against another tab adding the same value is safe (200 with the
//     existing row instead of 409).
//
// The picker is uncontrolled-but-driven: `value` and `onChange` come from
// the parent EditableVocabularyField, which owns the draft string and only
// commits it via PATCH when the user hits ✓. The picker's job is just to
// help them type the right string.

import { useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type {
  ListVocabularyEntriesResponse,
  VocabularyEntry,
  VocabularyType,
} from '@/lib/shared-types/competition-scraping';

interface Props {
  projectId: string;
  vocabularyType: VocabularyType;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
  // 2026-05-15-d Slice #2.5: optional opt-outs/overrides so the picker can
  // be reused inside a modal where (a) some OTHER field owns autofocus
  // (e.g., URL input in UrlAddModal) and (b) the modal's input styling
  // differs from EditableVocabularyField's inline-edit look. Defaults
  // preserve the original inline-edit caller's behavior.
  autoFocus?: boolean;
  inputStyleOverride?: React.CSSProperties;
}

export function VocabularyPicker({
  projectId,
  vocabularyType,
  value,
  onChange,
  disabled,
  placeholder,
  autoFocus = true,
  inputStyleOverride,
}: Props) {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creatingValue, setCreatingValue] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Lazy-load on first focus / open.
  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/vocabulary?type=${vocabularyType}`
        );
        if (!res.ok) {
          if (!cancelled) {
            setLoadError(`Couldn't load suggestions (HTTP ${res.status}).`);
            setLoaded(true);
          }
          return;
        }
        const json = (await res.json()) as ListVocabularyEntriesResponse;
        if (!cancelled) {
          setEntries(json);
          setLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Couldn't load suggestions.");
          setLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, loaded, projectId, vocabularyType]);

  // Close the popover on outside click. Keyboard Esc is handled by the
  // parent EditableVocabularyField which cancels the whole edit.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const trimmed = value.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return entries;
    const needle = trimmed.toLowerCase();
    return entries.filter((e) => e.value.toLowerCase().includes(needle));
  }, [entries, trimmed]);

  const exactMatch = useMemo(
    () => entries.some((e) => e.value.toLowerCase() === trimmed.toLowerCase()),
    [entries, trimmed]
  );

  const showCreateRow = trimmed.length > 0 && !exactMatch && !loadError;

  const handleCreate = async () => {
    if (!trimmed) return;
    setCreatingValue(trimmed);
    setCreateError(null);
    try {
      const res = await authFetch(`/api/projects/${projectId}/vocabulary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabularyType,
          value: trimmed,
          addedByWorkflow: 'competition-scraping',
        }),
      });
      if (!res.ok) {
        setCreateError(`Couldn't add to suggestions (HTTP ${res.status}).`);
        return;
      }
      const created = (await res.json()) as VocabularyEntry;
      // Idempotent endpoint — duplicates return 200 with the existing row.
      // Either way, ensure the entry is in the local list.
      setEntries((prev) =>
        prev.some((e) => e.id === created.id) ? prev : [...prev, created]
      );
      onChange(created.value);
      setOpen(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Couldn't add to suggestions.");
    } finally {
      setCreatingValue(null);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
        // Prevent the parent FieldShell's Enter/Esc handlers from firing
        // when the popover is showing AND a "Create" row is being clicked
        // — the click already saves through handleCreate.
        style={inputStyleOverride ?? inputStyle}
      />

      {open ? (
        <div role="listbox" style={popoverStyle}>
          {!loaded ? (
            <div style={popoverInfoStyle}>Loading suggestions…</div>
          ) : loadError ? (
            <div style={{ ...popoverInfoStyle, color: '#f85149' }}>{loadError}</div>
          ) : filtered.length === 0 && !showCreateRow ? (
            <div style={popoverInfoStyle}>
              No suggestions yet — start typing to add one.
            </div>
          ) : null}

          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="option"
              aria-selected={entry.value === value}
              onMouseDown={(e) => {
                // mousedown (not click) so the input doesn't lose focus
                // before we set the value — without this, blur runs first
                // and the parent FieldShell can collapse the picker.
                e.preventDefault();
                onChange(entry.value);
                setOpen(false);
              }}
              style={popoverRowStyle(entry.value === value)}
            >
              {entry.value}
            </button>
          ))}

          {showCreateRow ? (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                void handleCreate();
              }}
              disabled={creatingValue !== null}
              style={createRowStyle(creatingValue !== null)}
            >
              {creatingValue === trimmed ? (
                <>Adding “{trimmed}”…</>
              ) : (
                <>+ Create “{trimmed}”</>
              )}
            </button>
          ) : null}

          {createError ? (
            <div style={{ ...popoverInfoStyle, color: '#f85149' }}>{createError}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ─── Style helpers ──────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

// 2026-05-15-d Slice #2.5 — popover background, border, and shadow lifted
// for contrast against both the page background (#0d1117) AND the modal
// dialog background (#161b22). Previously popover was #161b22 which made
// it invisible against the modal background when rendered inside
// UrlAddModal / CapturedTextAddModal.
const popoverStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: '#21262d',
  border: '1px solid #484f58',
  borderRadius: '6px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
  maxHeight: '240px',
  overflowY: 'auto',
  zIndex: 10,
};

const popoverInfoStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: '12px',
  color: '#8b949e',
  fontStyle: 'italic',
};

function popoverRowStyle(selected: boolean): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '6px 10px',
    background: selected ? '#1f3a5f' : 'transparent',
    border: 'none',
    // Row divider visible on the new #21262d popover bg.
    borderBottom: '1px solid #373d44',
    color: '#e6edf3',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };
}

function createRowStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '6px 10px',
    background: 'transparent',
    border: 'none',
    color: disabled ? '#6e7681' : '#58a6ff',
    fontSize: '12px',
    cursor: disabled ? 'wait' : 'pointer',
    fontFamily: 'inherit',
  };
}
