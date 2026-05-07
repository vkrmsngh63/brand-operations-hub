'use client';

// W#2 per-URL detail page — editable-field primitives (slice a.3).
//
// Three variants share a single read-mode/edit-mode wrapper:
//
//   <EditableTextField>        — string | null (plain text)
//   <EditableNumberField>      — number | null (with min/max/step/integer)
//   <EditableVocabularyField>  — string | null (typeahead from /vocabulary)
//
// Each variant accepts `onSave(newValue) => Promise<void>`. Save is called
// when the user hits ✓ or presses Enter; cancel via ✕ or Esc reverts to
// the prop value. Errors thrown by `onSave` render an inline red message
// inside the field; the message auto-clears the next time the user enters
// edit mode. The parent (UrlMetadataCard) owns the optimistic-update +
// rollback semantics — these components only commit a save when `onSave`
// resolves and surface failure via the thrown error.

import { useEffect, useRef, useState } from 'react';
import { VocabularyPicker } from './VocabularyPicker';
import type { VocabularyType } from '@/lib/shared-types/competition-scraping';

// ─── Shared shell ───────────────────────────────────────────────────────

interface FieldShellProps {
  label: string;
  isEditing: boolean;
  onEditClick: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  saving: boolean;
  errorMessage: string | null;
  // Read-mode display value. Null renders as italic gray "—".
  readValue: string | null;
  // Whether the field can enter edit mode. False to disable (not used in
  // slice a.3 but plumbed for future Phase-2 admin-vs-worker permissions).
  editable?: boolean;
  children: React.ReactNode;
}

function FieldShell({
  label,
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  saving,
  errorMessage,
  readValue,
  editable = true,
  children,
}: FieldShellProps) {
  return (
    <div
      style={{ position: 'relative' }}
      onKeyDown={(e) => {
        if (!isEditing) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          if (!saving) void onSave();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>{label}</span>
        {!isEditing && editable ? (
          <button
            type="button"
            onClick={onEditClick}
            aria-label={`Edit ${label}`}
            title={`Edit ${label}`}
            style={pencilButtonStyle}
          >
            ✎
          </button>
        ) : null}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            aria-label="Save"
            title="Save (Enter)"
            style={saveButtonStyle(saving)}
          >
            {saving ? '…' : '✓'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Cancel"
            title="Cancel (Esc)"
            style={cancelButtonStyle(saving)}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          style={{
            fontSize: '13px',
            color: readValue == null ? '#6e7681' : '#c9d1d9',
            fontStyle: readValue == null ? 'italic' : 'normal',
          }}
        >
          {readValue ?? '—'}
        </div>
      )}

      {errorMessage ? (
        <div
          role="alert"
          style={{
            marginTop: '4px',
            fontSize: '11px',
            color: '#f85149',
          }}
        >
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

// ─── Text variant ───────────────────────────────────────────────────────

export function EditableTextField({
  label,
  value,
  onSave,
  editable,
  formatRead,
}: {
  label: string;
  value: string | null;
  onSave: (next: string | null) => Promise<void>;
  editable?: boolean;
  // Optional read-mode formatter (e.g., title-case the platform name).
  formatRead?: (raw: string | null) => string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value ?? '');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const enterEdit = () => {
    setDraft(value ?? '');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value ?? '');
  };

  const save = async () => {
    const trimmed = draft.trim();
    const next = trimmed.length === 0 ? null : trimmed;
    if (next === (value ?? null)) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setIsEditing(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FieldShell
      label={label}
      isEditing={isEditing}
      onEditClick={enterEdit}
      onSave={save}
      onCancel={cancel}
      saving={saving}
      errorMessage={errorMessage}
      readValue={formatRead ? formatRead(value) : value}
      editable={editable}
    >
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={saving}
        style={inputStyle}
        placeholder={`Set ${label.toLowerCase()}`}
      />
    </FieldShell>
  );
}

// ─── Number variant ─────────────────────────────────────────────────────

export function EditableNumberField({
  label,
  value,
  onSave,
  min,
  max,
  step,
  integer,
  editable,
  formatRead,
}: {
  label: string;
  value: number | null;
  onSave: (next: number | null) => Promise<void>;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  editable?: boolean;
  formatRead?: (raw: number | null) => string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value == null ? '' : String(value));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const enterEdit = () => {
    setDraft(value == null ? '' : String(value));
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value == null ? '' : String(value));
  };

  const save = async () => {
    const trimmed = draft.trim();
    let next: number | null;
    if (trimmed.length === 0) {
      next = null;
    } else {
      const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed);
      if (!Number.isFinite(parsed)) {
        setErrorMessage(`Enter a${integer ? ' whole' : ''} number${
          min !== undefined && max !== undefined ? ` between ${min} and ${max}` : ''
        }, or leave empty.`);
        return;
      }
      if (min !== undefined && parsed < min) {
        setErrorMessage(`Must be ≥ ${min}.`);
        return;
      }
      if (max !== undefined && parsed > max) {
        setErrorMessage(`Must be ≤ ${max}.`);
        return;
      }
      next = parsed;
    }
    if (next === (value ?? null)) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setIsEditing(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const display = formatRead
    ? formatRead(value)
    : value == null
    ? null
    : String(value);

  return (
    <FieldShell
      label={label}
      isEditing={isEditing}
      onEditClick={enterEdit}
      onSave={save}
      onCancel={cancel}
      saving={saving}
      errorMessage={errorMessage}
      readValue={display}
      editable={editable}
    >
      <input
        ref={inputRef}
        type="number"
        inputMode={integer ? 'numeric' : 'decimal'}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        min={min}
        max={max}
        step={step ?? (integer ? 1 : 'any')}
        disabled={saving}
        style={inputStyle}
        placeholder={`Set ${label.toLowerCase()}`}
      />
    </FieldShell>
  );
}

// ─── Vocabulary variant ─────────────────────────────────────────────────

export function EditableVocabularyField({
  label,
  value,
  onSave,
  projectId,
  vocabularyType,
  editable,
}: {
  label: string;
  value: string | null;
  onSave: (next: string | null) => Promise<void>;
  projectId: string;
  vocabularyType: VocabularyType;
  editable?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>(value ?? '');

  const enterEdit = () => {
    setDraft(value ?? '');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value ?? '');
  };

  const save = async () => {
    const trimmed = draft.trim();
    const next = trimmed.length === 0 ? null : trimmed;
    if (next === (value ?? null)) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setIsEditing(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FieldShell
      label={label}
      isEditing={isEditing}
      onEditClick={enterEdit}
      onSave={save}
      onCancel={cancel}
      saving={saving}
      errorMessage={errorMessage}
      readValue={value}
      editable={editable}
    >
      <VocabularyPicker
        projectId={projectId}
        vocabularyType={vocabularyType}
        value={draft}
        onChange={setDraft}
        disabled={saving}
        placeholder={`Set ${label.toLowerCase()}`}
      />
    </FieldShell>
  );
}

// ─── Style helpers (kept local to match the rest of the detail page) ────

const pencilButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#6e7681',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '0 2px',
  lineHeight: 1,
};

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

function saveButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    flex: 'none',
    padding: '2px 6px',
    background: disabled ? '#1f3a5f' : '#1f6feb',
    border: '1px solid ' + (disabled ? '#1f3a5f' : '#1f6feb'),
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 500,
    cursor: disabled ? 'wait' : 'pointer',
    minWidth: '24px',
  };
}

function cancelButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    flex: 'none',
    padding: '2px 6px',
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: '4px',
    color: '#8b949e',
    fontSize: '12px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minWidth: '24px',
  };
}
