'use client';

// W#2 P-46 Workstream 3 Session 2 — inline cell editors for the Competition
// Data table. Parallel to the URL detail page's EditableField.tsx primitives
// but with a tighter visual treatment that fits inside a table cell — no
// label, no pencil icon, no surrounding shell. Click the value → input
// appears + auto-focuses; Enter saves; Esc cancels; blur saves.
//
// Per §A.2 (binding decision Q2): "Every editable cell in the Competition
// Data table is read-only-looking until clicked. Clicking turns the cell
// into its appropriate inline editor." Each component below renders inside
// a <td> (the parent provides the <td> wrapper + alignment styles).
//
// Save lifecycle (all variants):
//   - onSave(next) is called when commit fires (Enter / Tab / blur for text
//     and number; click for boolean; pick for enum).
//   - The component flips to an optimistic "showing the new value" state
//     immediately, then awaits the promise.
//   - On resolve: optimistic state clears; the canonical prop value (which
//     the parent has updated from the server response) drives display.
//   - On reject: the optimistic state clears + the old value is restored;
//     an inline error pill appears next to the cell until the next edit.
//
// Click semantics: every cell's outer wrapper calls e.stopPropagation() so
// the table row's row-click handler does NOT fire when the user is editing
// a cell. The row-click handler has been replaced by a per-row "↗" Open
// button in UrlTable.tsx since every cell is now click-to-edit per §A.2.

import { useEffect, useRef, useState } from 'react';

// ─── Shared error pill ─────────────────────────────────────────────────

function ErrorPill({ message }: { message: string }) {
  return (
    <span
      role="alert"
      style={{
        marginLeft: '6px',
        padding: '1px 6px',
        borderRadius: '4px',
        background: 'rgba(248, 81, 73, 0.15)',
        color: '#f85149',
        border: '1px solid rgba(248, 81, 73, 0.40)',
        fontSize: '11px',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </span>
  );
}

// ─── Read-mode placeholder helper ──────────────────────────────────────

function emDash(): React.ReactNode {
  return <span style={{ color: '#6e7681', fontStyle: 'italic' }}>—</span>;
}

// ─── InlineTextCell ────────────────────────────────────────────────────

export function InlineTextCell({
  value,
  onSave,
  align = 'left',
  placeholder,
  multiline,
  formatRead,
}: {
  value: string | null;
  onSave: (next: string | null) => Promise<void>;
  align?: 'left' | 'right';
  placeholder?: string;
  // When true the editor renders a <textarea> for db.Text columns. Save on
  // Enter remains the convention (Shift+Enter inserts newline).
  multiline?: boolean;
  // Optional read-mode display formatter (e.g., URL-shortening).
  formatRead?: (raw: string | null) => React.ReactNode;
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
    else inputRef.current?.select();
  }, [isEditing, multiline]);

  const startEdit = () => {
    setDraft(value ?? '');
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value ?? '');
  };

  const commit = async () => {
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
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <span onClick={(e) => e.stopPropagation()}>
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!saving) void commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={() => {
              if (!saving) void commit();
            }}
            disabled={saving}
            rows={3}
            style={textareaInputStyle}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!saving) void commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={() => {
              if (!saving) void commit();
            }}
            disabled={saving}
            style={textInputStyle}
            placeholder={placeholder}
          />
        )}
        {errorMessage ? <ErrorPill message={errorMessage} /> : null}
      </span>
    );
  }

  const display = formatRead ? formatRead(value) : value;
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          startEdit();
        }
      }}
      title="Click to edit"
      style={readSpanStyle(align)}
    >
      {value == null || value === '' ? emDash() : display}
      {errorMessage ? <ErrorPill message={errorMessage} /> : null}
    </span>
  );
}

// ─── InlineNumberCell ──────────────────────────────────────────────────

export function InlineNumberCell({
  value,
  onSave,
  min,
  max,
  step,
  integer,
  align = 'right',
  formatRead,
}: {
  value: number | null;
  onSave: (next: number | null) => Promise<void>;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
  align?: 'left' | 'right';
  formatRead?: (raw: number | null) => React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value == null ? '' : String(value));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const startEdit = () => {
    setDraft(value == null ? '' : String(value));
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value == null ? '' : String(value));
  };

  const commit = async () => {
    const trimmed = draft.trim();
    let next: number | null;
    if (trimmed.length === 0) {
      next = null;
    } else {
      const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed);
      if (!Number.isFinite(parsed)) {
        setErrorMessage(`Not a ${integer ? 'whole ' : ''}number`);
        return;
      }
      if (integer && !Number.isInteger(parsed)) {
        setErrorMessage('Whole numbers only');
        return;
      }
      if (min !== undefined && parsed < min) {
        setErrorMessage(`Min ${min}`);
        return;
      }
      if (max !== undefined && parsed > max) {
        setErrorMessage(`Max ${max}`);
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
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <span onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="number"
          inputMode={integer ? 'numeric' : 'decimal'}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!saving) void commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          onBlur={() => {
            if (!saving) void commit();
          }}
          min={min}
          max={max}
          step={step ?? (integer ? 1 : 'any')}
          disabled={saving}
          style={numberInputStyle}
        />
        {errorMessage ? <ErrorPill message={errorMessage} /> : null}
      </span>
    );
  }

  const display = formatRead
    ? formatRead(value)
    : value == null
      ? null
      : integer
        ? value.toLocaleString()
        : String(value);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          startEdit();
        }
      }}
      title="Click to edit"
      style={readSpanStyle(align)}
    >
      {value == null ? emDash() : display}
      {errorMessage ? <ErrorPill message={errorMessage} /> : null}
    </span>
  );
}

// ─── InlineBooleanCell ─────────────────────────────────────────────────
//
// Single-click toggle — no edit-mode flip. The label is rendered as a
// clickable pill that flips its color on save. Used for `isSponsoredAd`.

export function InlineBooleanCell({
  value,
  onSave,
  trueLabel = 'Yes',
  falseLabel = 'No',
  trueStyle,
  falseStyle,
}: {
  value: boolean;
  onSave: (next: boolean) => Promise<void>;
  trueLabel?: string;
  falseLabel?: string;
  trueStyle?: React.CSSProperties;
  falseStyle?: React.CSSProperties;
}) {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayed = optimistic ?? value;
  const toggle = async () => {
    if (saving) return;
    const next = !displayed;
    setOptimistic(next);
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setOptimistic(null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  const baseStyle = displayed ? trueStyle : falseStyle;
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        void toggle();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          void toggle();
        }
      }}
      title="Click to toggle"
      style={{
        cursor: saving ? 'wait' : 'pointer',
        opacity: saving ? 0.6 : 1,
        ...baseStyle,
      }}
    >
      {displayed ? trueLabel : falseLabel}
      {errorMessage ? <ErrorPill message={errorMessage} /> : null}
    </span>
  );
}

// ─── InlineEnumCell ────────────────────────────────────────────────────
//
// Click → small dropdown popover with the options. Pick one → optimistic
// save + popover closes. Different from the URL detail page's segmented-
// control EditableEnumField because table cells have less horizontal room.

export function InlineEnumCell<T extends string>({
  value,
  options,
  onSave,
  renderRead,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string; style?: React.CSSProperties }>;
  onSave: (next: T) => Promise<void>;
  // Optional read-mode renderer (e.g., colored pill); receives the active
  // option object so the caller can decide styling.
  renderRead?: (active: {
    value: T;
    label: string;
    style?: React.CSSProperties;
  }) => React.ReactNode;
}) {
  const [optimistic, setOptimistic] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayed = optimistic ?? value;
  const activeOption =
    options.find((o) => o.value === displayed) ??
    ({ value: displayed, label: String(displayed) } as {
      value: T;
      label: string;
      style?: React.CSSProperties;
    });

  const pick = async (next: T) => {
    setOpen(false);
    if (next === displayed) return;
    setOptimistic(next);
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setOptimistic(null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        onClick={(e) => {
          e.stopPropagation();
          if (saving) return;
          setOpen((v) => !v);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            if (!saving) setOpen((v) => !v);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        title="Click to change"
        style={{
          cursor: saving ? 'wait' : 'pointer',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {renderRead ? renderRead(activeOption) : activeOption.label}
      </span>
      {open ? (
        <span
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            zIndex: 10,
            padding: '4px 0',
            minWidth: '120px',
          }}
        >
          {options.map((opt) => {
            const active = opt.value === displayed;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={(e) => {
                  e.stopPropagation();
                  void pick(opt.value);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '6px 12px',
                  background: active ? '#1f6feb' : 'transparent',
                  color: active ? '#fff' : '#c9d1d9',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </span>
      ) : null}
      {errorMessage ? <ErrorPill message={errorMessage} /> : null}
    </span>
  );
}

// ─── InlineDateCell ────────────────────────────────────────────────────
//
// Native HTML date input. Read mode shows the locale-formatted date.

export function InlineDateCell({
  value,
  onSave,
  align = 'right',
  readOnly,
}: {
  // ISO string (UTC); empty / null renders an em-dash.
  value: string | null;
  onSave: (next: string | null) => Promise<void>;
  align?: 'left' | 'right';
  // When true the cell renders the formatted date but does not enter edit
  // mode on click. Used for `addedAt` which is a server-stamped timestamp
  // and should not be editable.
  readOnly?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  // Draft is in `YYYY-MM-DD` form for the native date input.
  const [draft, setDraft] = useState<string>(isoToDateInput(value));
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEdit = () => {
    if (readOnly) return;
    setDraft(isoToDateInput(value));
    setErrorMessage(null);
    setIsEditing(true);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(isoToDateInput(value));
  };

  const commit = async () => {
    const trimmed = draft.trim();
    const next = trimmed.length === 0 ? null : new Date(trimmed).toISOString();
    if (next === (value ?? null)) {
      setIsEditing(false);
      return;
    }
    if (trimmed.length > 0 && Number.isNaN(new Date(trimmed).getTime())) {
      setErrorMessage('Invalid date');
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onSave(next);
      setIsEditing(false);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <span onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!saving) void commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          onBlur={() => {
            if (!saving) void commit();
          }}
          disabled={saving}
          style={dateInputStyle}
        />
        {errorMessage ? <ErrorPill message={errorMessage} /> : null}
      </span>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (!readOnly) startEdit();
      }}
      role={readOnly ? undefined : 'button'}
      tabIndex={readOnly ? undefined : 0}
      onKeyDown={(e) => {
        if (readOnly) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          startEdit();
        }
      }}
      title={readOnly ? undefined : 'Click to edit'}
      style={readOnly ? readSpanReadOnlyStyle(align) : readSpanStyle(align)}
    >
      {value == null ? emDash() : formatDate(value)}
      {errorMessage ? <ErrorPill message={errorMessage} /> : null}
    </span>
  );
}

function isoToDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  // YYYY-MM-DD in local time for the native date input.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── InlineUrlCell ─────────────────────────────────────────────────────
//
// Read mode renders a blue link visual; click enters edit mode. The click
// does NOT navigate (the per-row "↗" Open button handles detail-page
// navigation). Editing a URL is rare but supported for completeness.

export function InlineUrlCell({
  value,
  onSave,
}: {
  value: string;
  onSave: (next: string) => Promise<void>;
}) {
  return (
    <InlineTextCell
      value={value}
      align="left"
      onSave={async (next) => {
        if (next === null || next.trim() === '') {
          throw new Error('URL cannot be empty');
        }
        await onSave(next);
      }}
      formatRead={(raw) => (
        <span style={{ color: '#58a6ff' }}>{raw == null ? '' : shortenUrl(raw)}</span>
      )}
    />
  );
}

function shortenUrl(url: string): string {
  const trimmed = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return trimmed.length > 80 ? `${trimmed.slice(0, 77)}…` : trimmed;
}

// ─── Style helpers ─────────────────────────────────────────────────────

function readSpanStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    display: 'inline-block',
    cursor: 'pointer',
    padding: '2px 4px',
    margin: '-2px -4px',
    borderRadius: '3px',
    minWidth: '40px',
    textAlign: align,
  };
}

function readSpanReadOnlyStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '2px 4px',
    margin: '-2px -4px',
    minWidth: '40px',
    textAlign: align,
  };
}

const textInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '2px 6px',
  background: '#0d1117',
  border: '1px solid #1f6feb',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};

const textareaInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 6px',
  background: '#0d1117',
  border: '1px solid #1f6feb',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'vertical',
  minHeight: '48px',
  lineHeight: 1.4,
};

const numberInputStyle: React.CSSProperties = {
  width: '80px',
  padding: '2px 6px',
  background: '#0d1117',
  border: '1px solid #1f6feb',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  textAlign: 'right',
};

const dateInputStyle: React.CSSProperties = {
  padding: '2px 6px',
  background: '#0d1117',
  border: '1px solid #1f6feb',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
};
