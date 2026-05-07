'use client';

// W#2 per-URL detail page — custom-fields editor (slice a.3).
//
// CompetitorUrl.customFields is a Json column (Phase 1: { name: stringValue }
// per COMPETITION_SCRAPING_STACK_DECISIONS.md §9.4). The editor renders the
// existing entries as one row per key, each with edit/delete controls, and
// an "+ Add custom field" button at the bottom. Each commit calls
// `onSaveAll(nextRecord) => Promise<void>` with the full new object — the
// PATCH route replaces customFields wholesale (no merge), so we always send
// the complete next state.
//
// Optimistic update + rollback semantics are owned by the parent: it spreads
// `record` from the URL row and threads `onSaveAll` to a one-shot PATCH.

import { useState } from 'react';

interface Props {
  record: Record<string, unknown>;
  // Phase 1 stores values as strings; the wire shape allows unknown so a
  // future migration to typed values doesn't break the prop contract.
  onSaveAll: (next: Record<string, unknown>) => Promise<void>;
  editable?: boolean;
}

type RowState =
  | { mode: 'read' }
  | { mode: 'edit'; nameDraft: string; valueDraft: string };

interface AddState {
  open: boolean;
  nameDraft: string;
  valueDraft: string;
  errorMessage: string | null;
  saving: boolean;
}

const INITIAL_ADD: AddState = {
  open: false,
  nameDraft: '',
  valueDraft: '',
  errorMessage: null,
  saving: false,
};

export function CustomFieldsEditor({ record, onSaveAll, editable = true }: Props) {
  const entries = Object.entries(record);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, string | null>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [add, setAdd] = useState<AddState>(INITIAL_ADD);

  const setRowMode = (key: string, mode: RowState) => {
    setRowStates((s) => ({ ...s, [key]: mode }));
  };
  const setRowError = (key: string, msg: string | null) => {
    setRowErrors((s) => ({ ...s, [key]: msg }));
  };

  const startEdit = (key: string, rawValue: unknown) => {
    setRowError(key, null);
    setRowMode(key, {
      mode: 'edit',
      nameDraft: key,
      valueDraft: stringify(rawValue),
    });
  };

  const cancelEdit = (key: string) => {
    setRowMode(key, { mode: 'read' });
  };

  const commitEdit = async (originalKey: string) => {
    const state = rowStates[originalKey];
    if (!state || state.mode !== 'edit') return;
    const nextName = state.nameDraft.trim();
    const nextValue = state.valueDraft;
    if (!nextName) {
      setRowError(originalKey, 'Field name cannot be empty.');
      return;
    }
    if (nextName !== originalKey && Object.prototype.hasOwnProperty.call(record, nextName)) {
      setRowError(originalKey, `A field named "${nextName}" already exists.`);
      return;
    }
    const nextRecord = renameKey(record, originalKey, nextName, nextValue);
    setSavingKey(originalKey);
    setRowError(originalKey, null);
    try {
      await onSaveAll(nextRecord);
      setRowMode(originalKey, { mode: 'read' });
    } catch (e) {
      setRowError(originalKey, e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSavingKey(null);
    }
  };

  const removeKey = async (key: string) => {
    const nextRecord = { ...record };
    delete nextRecord[key];
    setSavingKey(key);
    setRowError(key, null);
    try {
      await onSaveAll(nextRecord);
      setRowMode(key, { mode: 'read' });
    } catch (e) {
      setRowError(key, e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSavingKey(null);
    }
  };

  const startAdd = () => setAdd({ ...INITIAL_ADD, open: true });
  const cancelAdd = () => setAdd(INITIAL_ADD);
  const commitAdd = async () => {
    const name = add.nameDraft.trim();
    const value = add.valueDraft;
    if (!name) {
      setAdd((s) => ({ ...s, errorMessage: 'Field name cannot be empty.' }));
      return;
    }
    if (Object.prototype.hasOwnProperty.call(record, name)) {
      setAdd((s) => ({
        ...s,
        errorMessage: `A field named "${name}" already exists.`,
      }));
      return;
    }
    const nextRecord = { ...record, [name]: value };
    setAdd((s) => ({ ...s, saving: true, errorMessage: null }));
    try {
      await onSaveAll(nextRecord);
      setAdd(INITIAL_ADD);
    } catch (e) {
      setAdd((s) => ({
        ...s,
        saving: false,
        errorMessage: e instanceof Error ? e.message : 'Save failed.',
      }));
    }
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>Custom fields</span>
        {entries.length === 0 ? (
          <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
            (none yet)
          </span>
        ) : null}
      </div>

      {entries.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '6px 16px',
          }}
        >
          {entries.map(([key, value]) => {
            const state = rowStates[key] ?? { mode: 'read' };
            const error = rowErrors[key];
            const saving = savingKey === key;
            return (
              <div
                key={key}
                style={{ fontSize: '13px', color: '#c9d1d9', minWidth: 0 }}
                onKeyDown={(e) => {
                  if (state.mode !== 'edit') return;
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!saving) void commitEdit(key);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEdit(key);
                  }
                }}
              >
                {state.mode === 'read' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#8b949e' }}>{key}:</span>{' '}
                      <span title={stringify(value)}>{stringify(value)}</span>
                    </div>
                    {editable ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(key, value)}
                          aria-label={`Edit custom field ${key}`}
                          title="Edit"
                          style={iconButtonStyle}
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeKey(key)}
                          disabled={saving}
                          aria-label={`Delete custom field ${key}`}
                          title="Delete"
                          style={{ ...iconButtonStyle, color: '#f85149' }}
                        >
                          {saving ? '…' : '✕'}
                        </button>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto auto',
                      gap: '4px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      value={state.nameDraft}
                      onChange={(e) =>
                        setRowMode(key, { ...state, nameDraft: e.target.value })
                      }
                      placeholder="name"
                      disabled={saving}
                      style={smallInputStyle}
                    />
                    <input
                      type="text"
                      value={state.valueDraft}
                      onChange={(e) =>
                        setRowMode(key, { ...state, valueDraft: e.target.value })
                      }
                      placeholder="value"
                      disabled={saving}
                      style={smallInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => void commitEdit(key)}
                      disabled={saving}
                      aria-label="Save"
                      style={miniSaveStyle(saving)}
                    >
                      {saving ? '…' : '✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelEdit(key)}
                      disabled={saving}
                      aria-label="Cancel"
                      style={miniCancelStyle(saving)}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {error ? (
                  <div role="alert" style={{ marginTop: '2px', fontSize: '11px', color: '#f85149' }}>
                    {error}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {editable ? (
        <div style={{ marginTop: entries.length > 0 ? '10px' : '4px' }}>
          {add.open ? (
            <div
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!add.saving) void commitAdd();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancelAdd();
                }
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto auto',
                gap: '4px',
                alignItems: 'center',
                maxWidth: '480px',
              }}
            >
              <input
                type="text"
                autoFocus
                value={add.nameDraft}
                onChange={(e) => setAdd((s) => ({ ...s, nameDraft: e.target.value }))}
                placeholder="field name"
                disabled={add.saving}
                style={smallInputStyle}
              />
              <input
                type="text"
                value={add.valueDraft}
                onChange={(e) => setAdd((s) => ({ ...s, valueDraft: e.target.value }))}
                placeholder="value"
                disabled={add.saving}
                style={smallInputStyle}
              />
              <button
                type="button"
                onClick={() => void commitAdd()}
                disabled={add.saving}
                aria-label="Save"
                style={miniSaveStyle(add.saving)}
              >
                {add.saving ? '…' : '✓'}
              </button>
              <button
                type="button"
                onClick={cancelAdd}
                disabled={add.saving}
                aria-label="Cancel"
                style={miniCancelStyle(add.saving)}
              >
                ✕
              </button>
              {add.errorMessage ? (
                <div
                  role="alert"
                  style={{
                    gridColumn: '1 / -1',
                    marginTop: '2px',
                    fontSize: '11px',
                    color: '#f85149',
                  }}
                >
                  {add.errorMessage}
                </div>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              onClick={startAdd}
              style={addButtonStyle}
            >
              + Add custom field
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────

function stringify(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}

function renameKey(
  record: Record<string, unknown>,
  oldKey: string,
  newKey: string,
  newValue: string
): Record<string, unknown> {
  // Preserve key order by walking the original record and substituting at the
  // matching position (rather than `delete+spread`, which would move the key
  // to the end and visibly reorder the grid on every rename).
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (k === oldKey) {
      out[newKey] = newValue;
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ─── Style helpers ──────────────────────────────────────────────────────

const iconButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#6e7681',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '0 2px',
  lineHeight: 1,
};

const smallInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '3px 6px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '12px',
  fontFamily: 'inherit',
  outline: 'none',
  minWidth: 0,
};

function miniSaveStyle(disabled: boolean): React.CSSProperties {
  return {
    flex: 'none',
    padding: '2px 6px',
    background: disabled ? '#1f3a5f' : '#1f6feb',
    border: '1px solid ' + (disabled ? '#1f3a5f' : '#1f6feb'),
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 500,
    cursor: disabled ? 'wait' : 'pointer',
  };
}

function miniCancelStyle(disabled: boolean): React.CSSProperties {
  return {
    flex: 'none',
    padding: '2px 6px',
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: '4px',
    color: '#8b949e',
    fontSize: '11px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

const addButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px dashed #30363d',
  borderRadius: '4px',
  color: '#58a6ff',
  fontSize: '12px',
  padding: '4px 10px',
  cursor: 'pointer',
};
