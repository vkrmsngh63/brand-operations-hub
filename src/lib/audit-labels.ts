// audit-labels.ts — pure presentation helpers for the Keyword Clustering (W#1)
// Action-History UI tab (H-1 slice 3).
//
// SCOPE: this module turns the raw `AuditEvent` rows (recorded by slices 1 + 2,
// read back via GET /api/projects/[projectId]/audit-events) into the plain,
// human-readable shape the History panel renders. It is PURE (no I/O, no React,
// no DOM) so it can be node:tested. The fetch + rendering live in
// the keyword-clustering HistoryPanel.tsx component; the recording lives in
// audit-recorder.ts / audit-recorder-server.ts; the event vocabulary +
// payload shape live in audit-payload.ts (the single source of truth).
//
// DESIGN (decided WITH the director, 2026-06-04-c, per
// feedback_plan_output_shape_before_building):
//  - WHO: AI runs show as "AI"; the director's own hand edits show as "You".
//  - WHAT: each eventType maps to a plain label ("Renamed topic", "Moved
//    topic", …) — never the raw token.
//  - WHICH: a best-effort short descriptor of the affected topic/keyword.
//  - FILTER: by source (AI vs You) + by change type.
//  - GROUP: every AI Auto-Analyze pass (one shared batchId) collapses into one
//    bundle so a single run reads as one entry, not a flood of rows.

import type {
  AuditEventType,
  AuditPayload,
  AuditSource,
} from './audit-payload.ts';
import { AUDIT_EVENT_TYPES } from './audit-payload.ts';

/* ── The row shape the GET endpoint returns (the subset we render) ── */

/** One `AuditEvent` row as read back from the history endpoint. */
export interface AuditEventRow {
  id: string;
  eventType: string;
  payload: AuditPayload | null | undefined;
  /** ISO timestamp string (Prisma serialises DateTime → string over JSON). */
  timestamp: string;
}

/* ── WHAT: eventType → plain human label ───────────────────────── */

const EVENT_LABELS: Record<AuditEventType, string> = {
  ADD_TOPIC: 'Added topic',
  UPDATE_TOPIC_TITLE: 'Renamed topic',
  UPDATE_TOPIC_DESCRIPTION: 'Edited topic description',
  MOVE_TOPIC: 'Moved topic',
  MERGE_TOPICS: 'Merged topics',
  SPLIT_TOPIC: 'Split topic',
  DELETE_TOPIC: 'Deleted topic',
  ADD_KEYWORD: 'Added keyword',
  MOVE_KEYWORD: 'Moved keyword',
  REMOVE_KEYWORD: 'Removed keyword',
  ARCHIVE_KEYWORD: 'Archived keyword',
  ADD_SISTER_LINK: 'Linked related topics',
  REMOVE_SISTER_LINK: 'Unlinked related topics',
  CREATE_KEYWORD: 'Created keyword',
  DELETE_KEYWORD: 'Deleted keyword',
  RESTORE_KEYWORD: 'Restored keyword',
  UPDATE_KEYWORD: 'Edited keyword',
  ADD_PATHWAY: 'Added pathway',
  REMOVE_PATHWAY: 'Removed pathway',
};

/** Title-case fallback for an unrecognised eventType (e.g. "FOO_BAR" → "Foo bar"). */
function humanizeFallback(eventType: string): string {
  const words = eventType.toLowerCase().split('_').filter(Boolean);
  if (words.length === 0) return eventType;
  const [first, ...rest] = words;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ');
}

/** Plain human label for a change type (never the raw token). */
export function eventTypeLabel(eventType: string): string {
  return (
    EVENT_LABELS[eventType as AuditEventType] ?? humanizeFallback(eventType)
  );
}

/** The set of {value,label} pairs for the change-type filter dropdown. */
export function changeTypeOptions(): { value: string; label: string }[] {
  return AUDIT_EVENT_TYPES.map((t) => ({ value: t, label: EVENT_LABELS[t] }));
}

/* ── WHO: source → plain label ─────────────────────────────────── */

/** "AI" for AI runs, "You" for the director's hand edits, "—" if unknown. */
export function sourceLabel(source: string | undefined | null): string {
  if (source === 'ai') return 'AI';
  if (source === 'manual') return 'You';
  return '—';
}

/* ── WHICH: best-effort affected-item descriptor ───────────────── */

function firstString(
  obj: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * A short, human-readable descriptor of the topic/keyword a change touched.
 * Best-effort across the slice-1/2 payload shapes: a manual rename carries the
 * new title in `after`; an AI op carries a self-describing Operation in `op`;
 * otherwise we fall back to the affected entity id from `detail`. Returns ''
 * when nothing identifying is available (the UI then shows a dash).
 */
export function affectedItem(payload: AuditPayload | null | undefined): string {
  if (!payload || typeof payload !== 'object') return '';

  // A manual rename / edit stores the new value directly in `after`.
  if (typeof payload.after === 'string' && payload.after.trim()) {
    return payload.after.trim();
  }

  // An AI op is a self-describing forward Operation; probe its common names.
  const op = (payload.op ?? undefined) as Record<string, unknown> | undefined;
  const opName = firstString(op, ['title', 'newTitle', 'name', 'keyword']);
  if (opName) return opName;

  // Fall back to the affected entity id captured in `detail`.
  const detail = payload.detail as Record<string, unknown> | undefined;
  const detailId = firstString(detail, [
    'topicId',
    'keywordId',
    'removedId',
    'id',
  ]);
  if (detailId) return detailId;

  const opId = firstString(op, ['id']);
  return opId ?? '';
}

/* ── DESCRIBE: one full-context sentence per change ────────────── */

/** Trim + stringify a value to plain text; '' when nothing meaningful. */
function asText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return '';
}

/** Shorten long text (e.g. a topic description) for a one-line sentence. */
function shorten(s: string, max = 60): string {
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s;
}

/** Wrap a value in curly quotes, e.g. “Trail shoes”. '' when empty. */
function q(v: unknown): string {
  const t = asText(v);
  return t ? `“${t}”` : '';
}

function pick(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== 'object') return '';
  return firstString(obj as Record<string, unknown>, keys) ?? '';
}

/** Friendly field labels for a keyword edit. */
const KEYWORD_FIELD_LABEL: Record<string, string> = {
  keyword: 'text',
  volume: 'search volume',
  tags: 'tags',
  sortingStatus: 'status',
  topic: 'topic',
  sortOrder: 'order',
};

function describeKeywordUpdate(before: unknown, after: unknown): string {
  const a = (after && typeof after === 'object' ? after : {}) as Record<string, unknown>;
  const b = (before && typeof before === 'object' ? before : {}) as Record<string, unknown>;
  const fields = Object.keys(a);
  if (fields.length === 0) return 'Edited a keyword';

  // A text rename is the clearest single case.
  if ('keyword' in a) {
    const to = q(a.keyword);
    const from = q(b.keyword);
    if (from && to) return `Renamed keyword from ${from} to ${to}`;
    if (to) return `Renamed keyword to ${to}`;
  }

  // A single non-text field change reads as a clean from → to.
  const nonText = fields.filter((f) => f !== 'keyword');
  if (nonText.length === 1) {
    const f = nonText[0];
    const label = KEYWORD_FIELD_LABEL[f] ?? f;
    const to = q(a[f]);
    const from = q(b[f]);
    if (from && to) return `Changed keyword ${label} from ${from} to ${to}`;
    if (to) return `Changed keyword ${label} to ${to}`;
  }

  // Several fields at once — name them.
  const labels = fields.map((f) => KEYWORD_FIELD_LABEL[f] ?? f).join(', ');
  return `Edited keyword (${labels})`;
}

/**
 * A single, plain-English sentence describing exactly what one change did, in
 * full context — including the prior value as "from → to" where it was recorded
 * (renames, edits), and the affected item's name where available (adds,
 * deletes). The "who" (AI vs You) is shown by the separate badge column, so the
 * sentence stays actor-free. Falls back to the plain label for anything unmapped.
 */
export function describeEvent(row: AuditEventRow): string {
  const p = row.payload;
  const type = row.eventType;
  if (!p || typeof p !== 'object') return eventTypeLabel(type);

  const { before, after, op } = p;
  const detail = (p.detail ?? undefined) as Record<string, unknown> | undefined;

  // Best-effort affected-item name across the recorded shapes.
  const name =
    pick(after, ['title', 'keyword', 'name']) ||
    pick(op as unknown, ['title', 'newTitle', 'name', 'keyword']) ||
    pick(detail, ['title', 'keyword']) ||
    pick(before, ['title', 'keyword', 'name']);

  switch (type) {
    case 'ADD_TOPIC':
      return name ? `Added topic ${q(name)}` : 'Added a topic';
    case 'UPDATE_TOPIC_TITLE': {
      const to = q(after);
      const from = q(before);
      if (from && to) return `Renamed topic from ${from} to ${to}`;
      if (to) return `Renamed topic to ${to}`;
      return 'Renamed a topic';
    }
    case 'UPDATE_TOPIC_DESCRIPTION': {
      const to = asText(after) ? q(shorten(asText(after))) : '';
      const from = asText(before) ? q(shorten(asText(before))) : '';
      if (from && to) return `Changed topic description from ${from} to ${to}`;
      if (to) return `Changed topic description to ${to}`;
      return 'Changed a topic description';
    }
    case 'MOVE_TOPIC':
      return detail?.kind === 'reorder'
        ? 'Reordered a topic'
        : 'Moved a topic to a different group';
    case 'MERGE_TOPICS':
      return 'Merged topics together';
    case 'SPLIT_TOPIC':
      return 'Split a topic into multiple';
    case 'DELETE_TOPIC':
      return name ? `Deleted topic ${q(name)}` : 'Deleted a topic';
    case 'ADD_KEYWORD':
      return name ? `Added keyword ${q(name)}` : 'Added a keyword';
    case 'MOVE_KEYWORD':
      return 'Moved keyword(s) to a different topic';
    case 'REMOVE_KEYWORD':
      return name ? `Removed keyword ${q(name)}` : 'Removed a keyword';
    case 'ARCHIVE_KEYWORD':
      return name ? `Archived keyword ${q(name)}` : 'Archived a keyword';
    case 'ADD_SISTER_LINK':
      return 'Linked two related topics';
    case 'REMOVE_SISTER_LINK':
      return 'Unlinked two related topics';
    case 'CREATE_KEYWORD':
      return name ? `Created keyword ${q(name)}` : 'Created a keyword';
    case 'DELETE_KEYWORD':
      return name ? `Deleted keyword ${q(name)}` : 'Deleted a keyword';
    case 'RESTORE_KEYWORD':
      return name ? `Restored keyword ${q(name)}` : 'Restored a keyword';
    case 'UPDATE_KEYWORD':
      return describeKeywordUpdate(before, after);
    case 'ADD_PATHWAY':
      return 'Added a pathway';
    case 'REMOVE_PATHWAY':
      return 'Removed a pathway';
    default:
      return eventTypeLabel(type);
  }
}

/* ── FILTER: by source + change type ───────────────────────────── */

export type SourceFilter = 'all' | AuditSource;

export interface AuditFilter {
  /** 'all' | 'ai' | 'manual'. Defaults to 'all'. */
  source?: SourceFilter;
  /** A specific eventType, or 'all'/undefined for no change-type filter. */
  eventType?: string;
}

/** Filter rows by who made the change and/or the kind of change. */
export function filterAuditEvents(
  events: AuditEventRow[],
  filter: AuditFilter = {}
): AuditEventRow[] {
  const source = filter.source ?? 'all';
  const eventType = filter.eventType ?? 'all';
  return events.filter((e) => {
    if (source !== 'all' && e.payload?.source !== source) return false;
    if (eventType !== 'all' && e.eventType !== eventType) return false;
    return true;
  });
}

/* ── GROUP: collapse each AI run (shared batchId) into one bundle ── */

/** One row OR one collapsed AI-run bundle in the rendered history list. */
export interface AuditGroup {
  /** Stable React key. */
  key: string;
  /** 'ai' | 'manual' | undefined. */
  source: AuditSource | undefined;
  /** Present only for AI-run bundles. */
  batchId?: string;
  /** The events in this group (1 for a manual edit; N for an AI run). */
  events: AuditEventRow[];
  /** Representative timestamp (the newest event in the group). */
  timestamp: string;
  /** True when this is a multi-or-single-op AI run bundle. */
  isBatch: boolean;
}

/**
 * Group an already-filtered, newest-first list of events. AI events that share
 * a batchId collapse into ONE bundle (placed at the position of the run's
 * newest event); every other event becomes its own single-row group. Input
 * order (newest-first) is preserved for groups and within each group.
 */
export function groupAuditEvents(events: AuditEventRow[]): AuditGroup[] {
  const groups: AuditGroup[] = [];
  const byBatch = new Map<string, AuditGroup>();

  for (const e of events) {
    const source = e.payload?.source;
    const batchId = e.payload?.batchId;

    if (source === 'ai' && typeof batchId === 'string' && batchId) {
      let g = byBatch.get(batchId);
      if (!g) {
        // First (= newest, since input is newest-first) event of this run.
        g = {
          key: `batch:${batchId}`,
          source: 'ai',
          batchId,
          events: [],
          timestamp: e.timestamp,
          isBatch: true,
        };
        byBatch.set(batchId, g);
        groups.push(g);
      }
      g.events.push(e);
    } else {
      groups.push({
        key: `evt:${e.id}`,
        source: source ?? undefined,
        events: [e],
        timestamp: e.timestamp,
        isBatch: false,
      });
    }
  }

  return groups;
}
