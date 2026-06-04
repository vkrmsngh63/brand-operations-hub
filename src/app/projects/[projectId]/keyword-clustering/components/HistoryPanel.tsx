'use client';

// HistoryPanel.tsx — the Keyword Clustering (W#1) Action-History UI tab
// (H-1 slice 3). A READ-ONLY, chronological, filterable list of every change
// — the AI's Auto-Analyze runs AND the director's hand edits — recorded by
// slices 1 + 2. It reads them back from the existing GET endpoint
// /api/projects/[projectId]/audit-events (newest-first) and renders them with
// plain labels. It does NOT record, mutate, or undo anything (per-action undo
// is a later slice).
//
// SHAPE (decided WITH the director 2026-06-04-c): each row shows
// When · Who (AI vs You) · What changed (plain label) · Which item, and clicks
// open the full before/after detail. Filters by who + change-type; each AI run
// (one shared batchId) collapses into one expandable bundle. All the pure
// label/filter/group logic lives in src/lib/audit-labels.ts (node:tested).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import {
  type AuditEventRow,
  type AuditGroup,
  type SourceFilter,
  affectedItem,
  changeTypeOptions,
  eventTypeLabel,
  filterAuditEvents,
  groupAuditEvents,
  sourceLabel,
} from '@/lib/audit-labels';

interface HistoryPanelProps {
  projectId: string;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** A readable one-liner for a value that may be a string, number, or object. */
function valueText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

const SOURCE_BADGE: Record<string, React.CSSProperties> = {
  AI: { background: '#1e3a8a', color: '#bfdbfe' },
  You: { background: '#14532d', color: '#bbf7d0' },
  '—': { background: '#374151', color: '#d1d5db' },
};

function Badge({ source }: { source: string | undefined }) {
  const label = sourceLabel(source);
  return (
    <span
      style={{
        ...(SOURCE_BADGE[label] ?? SOURCE_BADGE['—']),
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 4,
        padding: '1px 6px',
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}

/** The expanded before/after/detail block for one event. */
function EventDetail({ row }: { row: AuditEventRow }) {
  const p = row.payload;
  if (!p) return <div style={{ color: '#9ca3af', fontSize: 12 }}>No detail.</div>;
  const lines: { k: string; v: string }[] = [];
  if (p.before !== undefined) lines.push({ k: 'Before', v: valueText(p.before) });
  if (p.after !== undefined) lines.push({ k: 'After', v: valueText(p.after) });
  if (p.detail) {
    for (const [k, v] of Object.entries(p.detail)) {
      lines.push({ k, v: valueText(v) });
    }
  }
  if (p.op) lines.push({ k: 'Operation', v: valueText(p.op) });
  if (lines.length === 0) {
    return <div style={{ color: '#9ca3af', fontSize: 12 }}>No further detail.</div>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 10px', fontSize: 12 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'contents' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>{l.k}</span>
          <span style={{ color: '#d1d5db', wordBreak: 'break-word', fontFamily: 'monospace', fontSize: 11 }}>
            {l.v || '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

const ROW_GRID = '120px 48px 1fr 1.2fr';

/** One leaf change row (a manual edit OR one op inside an AI run). */
function LeafRow({
  row,
  showWhen,
  indent,
}: {
  row: AuditEventRow;
  showWhen: boolean;
  indent: boolean;
}) {
  const [open, setOpen] = useState(false);
  const item = affectedItem(row.payload);
  return (
    <div style={{ borderTop: '1px solid #1f2937' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'grid',
          gridTemplateColumns: ROW_GRID,
          alignItems: 'center',
          gap: 8,
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          color: '#e5e7eb',
          padding: indent ? '5px 8px 5px 26px' : '5px 8px',
          fontSize: 12,
          cursor: 'pointer',
        }}
        title="Click to see the full before/after detail"
      >
        <span style={{ color: '#9ca3af' }}>{showWhen ? formatWhen(row.timestamp) : ''}</span>
        <Badge source={row.payload?.source} />
        <span style={{ fontWeight: 600 }}>
          <span style={{ color: '#6b7280', marginRight: 4 }}>{open ? '▾' : '▸'}</span>
          {eventTypeLabel(row.eventType)}
        </span>
        <span style={{ color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item || '—'}
        </span>
      </button>
      {open && (
        <div style={{ padding: indent ? '4px 8px 8px 26px' : '4px 8px 8px 8px', background: '#0b0f17' }}>
          <EventDetail row={row} />
        </div>
      )}
    </div>
  );
}

/** One AI-run bundle: a summary header that expands to its child changes. */
function BatchRow({ group }: { group: AuditGroup }) {
  const [open, setOpen] = useState(false);
  const n = group.events.length;
  return (
    <div style={{ borderTop: '1px solid #1f2937' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'grid',
          gridTemplateColumns: ROW_GRID,
          alignItems: 'center',
          gap: 8,
          width: '100%',
          textAlign: 'left',
          background: '#0d1320',
          border: 'none',
          color: '#e5e7eb',
          padding: '6px 8px',
          fontSize: 12,
          cursor: 'pointer',
        }}
        title="An Auto-Analyze run — click to see each change it made"
      >
        <span style={{ color: '#9ca3af' }}>{formatWhen(group.timestamp)}</span>
        <Badge source="ai" />
        <span style={{ fontWeight: 700 }}>
          <span style={{ color: '#6b7280', marginRight: 4 }}>{open ? '▾' : '▸'}</span>
          Auto-Analyze run
        </span>
        <span style={{ color: '#9ca3af' }}>
          {n} change{n === 1 ? '' : 's'}
        </span>
      </button>
      {open &&
        group.events.map((e) => (
          <LeafRow key={e.id} row={e} showWhen={false} indent />
        ))}
    </div>
  );
}

export default function HistoryPanel({ projectId }: HistoryPanelProps) {
  const [events, setEvents] = useState<AuditEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<SourceFilter>('all');
  const [eventType, setEventType] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/projects/${projectId}/audit-events?limit=1000`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AuditEventRow[] = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load the history. Click Refresh to try again.');
      console.warn('history panel: load failed (non-fatal):', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(
    () => groupAuditEvents(filterAuditEvents(events, { source, eventType })),
    [events, source, eventType]
  );

  const selectStyle: React.CSSProperties = {
    background: '#111827',
    color: '#e5e7eb',
    border: '1px solid #374151',
    borderRadius: 4,
    fontSize: 12,
    padding: '3px 6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#0b0f17' }}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          padding: '6px 8px',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Who:</span>
        <select value={source} onChange={(e) => setSource(e.target.value as SourceFilter)} style={selectStyle}>
          <option value="all">Everyone</option>
          <option value="ai">AI</option>
          <option value="manual">You</option>
        </select>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Change:</span>
        <select value={eventType} onChange={(e) => setEventType(e.target.value)} style={selectStyle}>
          <option value="all">All changes</option>
          {changeTypeOptions().map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            background: '#1f2937',
            color: '#e5e7eb',
            border: '1px solid #374151',
            borderRadius: 4,
            fontSize: 12,
            padding: '3px 10px',
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {/* ── Column header ────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: ROW_GRID,
          gap: 8,
          padding: '4px 8px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.4,
          color: '#6b7280',
          textTransform: 'uppercase',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <span>When</span>
        <span>Who</span>
        <span>What changed</span>
        <span>Which item</span>
      </div>

      {/* ── List ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {error && <div style={{ padding: 12, color: '#fca5a5', fontSize: 12 }}>{error}</div>}
        {!error && !loading && groups.length === 0 && (
          <div style={{ padding: 16, color: '#9ca3af', fontSize: 12 }}>
            No changes recorded yet. Run an Auto-Analyze or edit a topic/keyword and they'll appear here.
          </div>
        )}
        {groups.map((g) =>
          g.isBatch ? (
            <BatchRow key={g.key} group={g} />
          ) : (
            <LeafRow key={g.key} row={g.events[0]} showWhen indent={false} />
          )
        )}
      </div>
    </div>
  );
}
