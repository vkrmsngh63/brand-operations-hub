'use client';

// audit-recorder.ts — the thin client-side sender for W#1 action-history
// events. Pairs with the pure builders in `audit-payload.ts` and the server
// inbox at /api/projects/[projectId]/audit-events.
//
// CONTRACT: recording is BEST-EFFORT and must NEVER block or break a user's
// actual edit. Callers fire-and-forget (`void recordAuditEvents(...)`) AFTER
// their real mutation has persisted. This function therefore:
//  - never throws (all errors are caught + logged);
//  - chunks large batches (an Auto-Analyze pass can be hundreds of ops);
//  - no-ops on empty input or missing projectId.

import { authFetch } from '@/lib/authFetch';
import type { AuditEventInput } from './audit-payload';

const CHUNK = 200;

/** A stable id grouping all operations of one Auto-Analyze apply pass. */
export function newAuditBatchId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for environments without crypto.randomUUID.
    return `batch-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  }
}

/**
 * Best-effort: POST a batch of action-history events to the server inbox.
 * Resolves even on failure; callers should not await it on the critical path.
 */
export async function recordAuditEvents(
  projectId: string | null | undefined,
  events: AuditEventInput[]
): Promise<void> {
  if (!projectId || events.length === 0) return;
  try {
    for (let i = 0; i < events.length; i += CHUNK) {
      const slice = events.slice(i, i + CHUNK);
      const res = await authFetch(`/api/projects/${projectId}/audit-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: slice }),
      });
      if (!res.ok) {
        console.warn(
          `audit recorder: HTTP ${res.status} — ${slice.length} event(s) not recorded`
        );
      }
    }
  } catch (err) {
    console.warn('audit recorder: failed to record events (non-fatal):', err);
  }
}
