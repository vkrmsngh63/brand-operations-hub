// audit-payload.ts — pure builders for Keyword Clustering (W#1) audit events.
//
// W#1 is the FIRST workflow to declare audit-trail requirements (H-1 in
// docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md). Per
// docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.10, the FIRST audit consumer
// finalizes the per-workflow event vocabulary + payload shape. This module is
// that finalization for W#1.
//
// SCOPE (slice 1): this module ONLY shapes the {eventType, payload} that gets
// stored in the shared `AuditEvent` table (prisma/schema.prisma). It is pure
// (no I/O) so it can be node:tested. The actual POST to the server inbox lives
// in `audit-recorder.ts`; the server insert lives in the
// /api/projects/[projectId]/audit-events route.
//
// DESIGN NOTES (read before extending):
//  - eventType column = the semantic action (one of AUDIT_EVENT_TYPES below).
//  - payload.source = 'ai' (an Auto-Analyze batch operation) | 'manual'
//    (a director hand-edit). Both share the same eventType vocabulary where
//    they map to the same semantic change; manual-only actions (CREATE_KEYWORD,
//    DELETE_KEYWORD, RESTORE_KEYWORD) extend it.
//  - before/after: we capture the affected-entity snapshot where it is cheaply
//    available at the emission site (rename → old/new title; delete → the
//    removed entity). This is the raw material the LATER per-action-undo
//    session reads. We deliberately do NOT compute exact per-operation
//    before-snapshots for AI batches in slice 1 (the pure applier does not
//    expose per-op diffs); an AI op records the self-describing forward
//    Operation + its batch grouping, and the undo session enriches this.
//  - Pure LAYOUT changes (node x/y drag, canvas pan/zoom, node resize) are
//    intentionally NOT audited — they carry no content meaning and would drown
//    the action history. Only content/structure changes are recorded.

import type { Operation } from './operation-applier.ts';

/** The W#1 audit-event vocabulary. Stored verbatim in AuditEvent.eventType. */
export const AUDIT_EVENT_TYPES = [
  // Shared with the AI operation vocabulary (operation-applier.ts):
  'ADD_TOPIC',
  'UPDATE_TOPIC_TITLE',
  'UPDATE_TOPIC_DESCRIPTION',
  'MOVE_TOPIC',
  'MERGE_TOPICS',
  'SPLIT_TOPIC',
  'DELETE_TOPIC',
  'ADD_KEYWORD',
  'MOVE_KEYWORD',
  'REMOVE_KEYWORD',
  'ARCHIVE_KEYWORD',
  'ADD_SISTER_LINK',
  'REMOVE_SISTER_LINK',
  // Manual-only additions (no AI equivalent):
  'CREATE_KEYWORD', // director imports/types a brand-new keyword row
  'DELETE_KEYWORD', // director hard-deletes a keyword (distinct from ARCHIVE)
  'RESTORE_KEYWORD', // director restores an archived keyword
  'UPDATE_KEYWORD', // director edits a keyword's own fields (volume/tags/status/text/order)
  // Pathway grouping (slice 2). Today only the AI rebuild recomputes pathways
  // wholesale, so the manual canvas/pathways route is instrumented future-proof
  // — no manual UI calls it yet (see KEYWORD_CLUSTERING_POLISH_BACKLOG H-1).
  'ADD_PATHWAY',
  'REMOVE_PATHWAY',
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];

const KNOWN = new Set<string>(AUDIT_EVENT_TYPES);

/** True if `s` is a recognised W#1 audit-event type. */
export function isKnownAuditEventType(s: string): s is AuditEventType {
  return KNOWN.has(s);
}

export type AuditSource = 'ai' | 'manual';

/** The shape the client POSTs to the audit-events inbox (one per change). */
export interface AuditEventInput {
  eventType: AuditEventType;
  payload: AuditPayload;
}

/** The JSON stored in AuditEvent.payload. Self-contained per event. */
export interface AuditPayload {
  source: AuditSource;
  action: AuditEventType;
  /** For AI events: the full self-describing forward Operation. */
  op?: Operation;
  /** Affected-entity snapshot before the change, where cheaply available. */
  before?: unknown;
  /** Affected-entity snapshot after the change, where cheaply available. */
  after?: unknown;
  /** Groups all operations of one Auto-Analyze apply pass. */
  batchId?: string;
  /** 0-based position of this event within its batch. */
  seq?: number;
  /** Free-form extra detail (entity ids, counts, reason strings). */
  detail?: Record<string, unknown>;
}

/* ── AI batch events ───────────────────────────────────────────── */

export interface AiBatchContext {
  /** Stable id for the whole apply pass; groups its operations together. */
  batchId: string;
  /** Maps "$newN" aliases → assigned "t-N" stable ids (from ApplyOk). */
  aliasResolutions?: Record<string, string>;
}

/** Build one AI audit event from one applied Operation. */
export function aiOperationEvent(
  op: Operation,
  ctx: AiBatchContext,
  seq: number
): AuditEventInput {
  const detail: Record<string, unknown> = {};
  if (ctx.aliasResolutions && Object.keys(ctx.aliasResolutions).length > 0) {
    detail.aliasResolutions = ctx.aliasResolutions;
  }
  return {
    eventType: op.type,
    payload: {
      source: 'ai',
      action: op.type,
      op,
      batchId: ctx.batchId,
      seq,
      ...(Object.keys(detail).length > 0 ? { detail } : {}),
    },
  };
}

/** Build one event per operation in an applied Auto-Analyze batch. */
export function aiBatchEvents(
  ops: Operation[],
  ctx: AiBatchContext
): AuditEventInput[] {
  return ops.map((op, i) => aiOperationEvent(op, ctx, i));
}

/* ── Manual edit events ────────────────────────────────────────── */

export interface ManualEventArgs {
  eventType: AuditEventType;
  /** Affected-entity snapshot before the change (omit if not applicable). */
  before?: unknown;
  /** Affected-entity snapshot after the change (omit if not applicable). */
  after?: unknown;
  /** Entity ids, counts, reason strings, etc. */
  detail?: Record<string, unknown>;
}

/**
 * Build one manual-edit audit event. Throws on an unknown eventType so a
 * typo at a wiring site fails loudly in tests rather than silently storing a
 * garbage action.
 */
export function manualEvent(args: ManualEventArgs): AuditEventInput {
  if (!isKnownAuditEventType(args.eventType)) {
    throw new Error(`manualEvent: unknown eventType "${args.eventType}"`);
  }
  const payload: AuditPayload = {
    source: 'manual',
    action: args.eventType,
  };
  if (args.before !== undefined) payload.before = args.before;
  if (args.after !== undefined) payload.after = args.after;
  if (args.detail && Object.keys(args.detail).length > 0) {
    payload.detail = args.detail;
  }
  return { eventType: args.eventType, payload };
}

/* ── Manual canvas-node (topic) update diff ─────────────────────── */

/**
 * Build manual audit events from ONE canvas-node PATCH entry
 * (`{ id, ...changedFields }`). Records only content/structure edits; a pure
 * layout change (x/y/w/h, resize) and AI-managed metadata (relationshipType
 * on its own, kwPlacements, altTitles, intentFingerprint) produce NO events,
 * so `topicUpdateEvents({ id, x, y })` from a drag returns [].
 *
 * Snapshots are AFTER-only (the new value), matching slice 1's "before/after
 * where cheaply available" — the per-action-undo slice enriches before-state
 * later. Relies on the client sending PARTIAL patches (verified in
 * CanvasPanel/CanvasTableMode: a drag sends { id, x, y }; a rename sends
 * { id, title }; a reparent sends { id, parentId, relationshipType }).
 */
export function topicUpdateEvents(
  update: Record<string, unknown>
): AuditEventInput[] {
  const topicId = update.id;
  const events: AuditEventInput[] = [];

  if (typeof update.title === 'string') {
    events.push(
      manualEvent({
        eventType: 'UPDATE_TOPIC_TITLE',
        after: update.title,
        detail: { topicId },
      })
    );
  }
  if (typeof update.description === 'string') {
    events.push(
      manualEvent({
        eventType: 'UPDATE_TOPIC_DESCRIPTION',
        after: update.description,
        detail: { topicId },
      })
    );
  }
  // A reparent (parentId present) takes precedence over a same-patch reorder
  // so a single drag-into-group records ONE MOVE_TOPIC, not two.
  if ('parentId' in update) {
    const detail: Record<string, unknown> = { topicId, kind: 'reparent' };
    if (typeof update.relationshipType === 'string') {
      detail.relationshipType = update.relationshipType;
    }
    if ('sortOrder' in update) detail.sortOrder = update.sortOrder;
    events.push(
      manualEvent({ eventType: 'MOVE_TOPIC', after: update.parentId, detail })
    );
  } else if ('sortOrder' in update) {
    events.push(
      manualEvent({
        eventType: 'MOVE_TOPIC',
        after: update.sortOrder,
        detail: { topicId, kind: 'reorder' },
      })
    );
  }
  // A change to a node's linked-keyword membership IS a keyword move
  // (dragging a keyword onto a topic re-writes linkedKwIds on that node).
  if ('linkedKwIds' in update) {
    events.push(
      manualEvent({
        eventType: 'MOVE_KEYWORD',
        after: update.linkedKwIds,
        detail: { topicId, via: 'topic-link' },
      })
    );
  }
  return events;
}

/* ── Manual keyword update diff ─────────────────────────────────── */

/** Keyword fields worth recording (content); excludes layout + metadata. */
const AUDITABLE_KEYWORD_FIELDS = [
  'keyword',
  'volume',
  'sortingStatus',
  'tags',
  'topic',
  'sortOrder',
] as const;

/**
 * Build a manual audit event from ONE keyword-PATCH entry
 * (`{ id, ...changedFields }`). Emits a single UPDATE_KEYWORD carrying the
 * changed content fields; pure-layout (`canvasLoc`) and metadata
 * (`topicApproved`) are ignored. Returns [] when nothing auditable changed.
 */
export function keywordUpdateEvents(
  update: Record<string, unknown>
): AuditEventInput[] {
  const after: Record<string, unknown> = {};
  for (const f of AUDITABLE_KEYWORD_FIELDS) {
    if (f in update) after[f] = update[f];
  }
  if (Object.keys(after).length === 0) return [];
  return [
    manualEvent({
      eventType: 'UPDATE_KEYWORD',
      after,
      detail: { keywordId: update.id },
    }),
  ];
}
