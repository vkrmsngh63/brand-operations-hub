'use client';

// W#2 per-URL detail page — editable-field primitives (slice a.3).
//
// Five variants share a single read-mode/edit-mode wrapper:
//
//   <EditableTextField>        — string | null (plain text; multiline opt-in)
//   <EditableNumberField>      — number | null (with min/max/step/integer)
//   <EditableVocabularyField>  — string | null (typeahead from /vocabulary)
//   <EditableBooleanField>     — boolean (single-click optimistic toggle)
//   <EditableEnumField>        — string from a fixed option set (segmented
//                                control; single-click optimistic write)
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
  // Optional style overrides for the read-mode display block (e.g.,
  // multiline EditableTextField uses pre-wrap whiteSpace so saved newlines
  // render correctly in read mode).
  readValueStyle?: React.CSSProperties;
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
  readValueStyle,
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
            ...readValueStyle,
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
  multiline,
  rows,
}: {
  label: string;
  value: string | null;
  onSave: (next: string | null) => Promise<void>;
  editable?: boolean;
  // Optional read-mode formatter (e.g., title-case the platform name).
  formatRead?: (raw: string | null) => string | null;
  // P-46 Workstream 2 Session 5 (2026-05-23-b): when true, renders a
  // <textarea> instead of <input> for db.Text columns like description1 /
  // description2. Enter inserts a newline (the shell's Enter-to-save is
  // suppressed via stopPropagation); save by clicking ✓ or pressing Tab off
  // the field.
  multiline?: boolean;
  rows?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value ?? '');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) return;
    if (multiline) textareaRef.current?.focus();
    else inputRef.current?.focus();
  }, [isEditing, multiline]);

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

  const readDisplay = formatRead ? formatRead(value) : value;

  return (
    <FieldShell
      label={label}
      isEditing={isEditing}
      onEditClick={enterEdit}
      onSave={save}
      onCancel={cancel}
      saving={saving}
      errorMessage={errorMessage}
      readValue={readDisplay}
      readValueStyle={multiline ? multilineReadValueStyle : undefined}
      editable={editable}
    >
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Multiline mode: Enter inserts a newline. Stop propagation so
            // the shell's Enter-to-save handler doesn't fire. Esc still
            // bubbles to the shell to cancel.
            if (e.key === 'Enter') e.stopPropagation();
          }}
          disabled={saving}
          rows={rows ?? 3}
          style={textareaStyle}
          placeholder={`Set ${label.toLowerCase()}`}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
          style={inputStyle}
          placeholder={`Set ${label.toLowerCase()}`}
        />
      )}
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

// ─── Boolean variant ────────────────────────────────────────────────────
//
// One-click toggle. Unlike the text/number/vocabulary fields above, a
// boolean flip doesn't benefit from a separate edit / save / cancel
// dance — it's a single bit. Clicking the checkbox optimistically flips
// the local view, fires `onSave(next)`, and reverts to the prior value if
// the save throws. Surfaces an inline error on failure.

export function EditableBooleanField({
  label,
  value,
  onSave,
  editable = true,
}: {
  label: string;
  value: boolean;
  onSave: (next: boolean) => Promise<void>;
  editable?: boolean;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Display the optimistic value while a save is in flight; otherwise the
  // canonical prop value (which the parent updates from the server's
  // authoritative response on success).
  const displayed = optimistic ?? value;

  const onToggle = async () => {
    if (!editable || saving) return;
    const next = !displayed;
    setOptimistic(next);
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      // Parent updated `value` to the server's response — clear the
      // optimistic override on the next render.
      setOptimistic(null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed.');
      // Revert the optimistic flip — fall back to the prior prop value.
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '2px',
        }}
      >
        {label}
      </div>
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#c9d1d9',
          cursor: editable && !saving ? 'pointer' : 'not-allowed',
          userSelect: 'none',
          opacity: saving ? 0.7 : 1,
        }}
      >
        <input
          type="checkbox"
          checked={displayed}
          onChange={() => void onToggle()}
          disabled={!editable || saving}
          style={{ width: '14px', height: '14px', accentColor: '#1f6feb' }}
        />
        <span>{displayed ? 'Yes' : 'No'}</span>
        {saving ? (
          <span style={{ fontSize: '11px', color: '#6e7681' }}>Saving…</span>
        ) : null}
      </label>
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

// ─── Enum variant ───────────────────────────────────────────────────────
//
// Segmented-control over a fixed option set. Like EditableBooleanField, a
// click on an inactive option optimistically writes the new value and falls
// back to the prior value if the save throws. No separate edit/save/cancel
// dance — for a tiny option set, the single-click commit is the cleanest
// affordance. Use cases: Scraping Status (INCOMPLETE / COMPLETE) per §A.8;
// future click-to-edit enum cells in the Competition Data table (Workstream
// 3) consume the same component via inline rendering.
//
// Generic over the option string-union so the consumer's onSave callback is
// typed against the specific enum, not the looser `string`.

export function EditableEnumField<T extends string>({
  label,
  value,
  options,
  onSave,
  editable = true,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onSave: (next: T) => Promise<void>;
  editable?: boolean;
}) {
  const [optimistic, setOptimistic] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayed = optimistic ?? value;

  const onPick = async (next: T) => {
    if (!editable || saving || next === displayed) return;
    setOptimistic(next);
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setOptimistic(null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed.');
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span>{label}</span>
        {saving ? (
          <span style={{ fontSize: '11px', color: '#6e7681' }}>Saving…</span>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: 'inline-flex',
          border: '1px solid #30363d',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {options.map((opt, idx) => {
          const active = opt.value === displayed;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => void onPick(opt.value)}
              disabled={!editable || saving}
              style={{
                padding: '4px 12px',
                background: active ? '#1f6feb' : 'transparent',
                color: active ? '#fff' : '#8b949e',
                border: 'none',
                borderRight:
                  idx < options.length - 1 ? '1px solid #30363d' : 'none',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                cursor: !editable || saving ? 'not-allowed' : 'pointer',
                opacity: saving && !active ? 0.6 : 1,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
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

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  minHeight: '60px',
  lineHeight: 1.5,
};

const multilineReadValueStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  lineHeight: 1.5,
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
