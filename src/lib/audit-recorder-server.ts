// audit-recorder-server.ts — the in-route, server-side sender for W#1
// action-history events. The server counterpart to the client
// `audit-recorder.ts`: a route handler that has already committed a user's
// mutation calls this to file the corresponding {eventType, payload} rows
// onto the shared `AuditEvent` table directly (no self-HTTP round-trip).
//
// CONTRACT (slice 2 — manual-edit recording): recording is BEST-EFFORT and
// must NEVER break or roll back the user's actual edit. The real mutation has
// already committed via its own transaction before this is called; this
// function therefore:
//   - runs OUTSIDE that transaction (its own createMany);
//   - NEVER throws — every error is caught, flake-counted, and logged;
//   - validates each eventType against the W#1 vocabulary and silently drops
//     anything unknown (same rule as the audit-events POST route);
//   - no-ops on an empty event list (so a layout-only PATCH costs nothing).
//
// Callers `await` it (a single fast createMany) so the rows are committed
// before the route responds — more reliable than fire-and-forget under the
// serverless freeze-after-response model. Because it never throws, awaiting it
// cannot fail the request.

import { prisma } from './db';
import { withRetry } from './prisma-retry';
import { recordFlake } from './flake-counter';
import { isKnownAuditEventType, type AuditEventInput } from './audit-payload';

const WORKFLOW = 'keyword-clustering';

export interface ServerAuditContext {
  projectId: string;
  userId: string;
}

/** Best-effort: insert a batch of action-history events. Never throws. */
export async function recordServerAuditEvents(
  ctx: ServerAuditContext,
  events: AuditEventInput[]
): Promise<void> {
  try {
    if (!events || events.length === 0) return;

    const rows = events
      .filter(
        e =>
          e &&
          typeof e.eventType === 'string' &&
          isKnownAuditEventType(e.eventType) &&
          e.payload &&
          typeof e.payload === 'object'
      )
      .map(e => ({
        workflowType: WORKFLOW,
        projectId: ctx.projectId,
        userId: ctx.userId,
        eventType: e.eventType,
        payload: e.payload as object,
      }));

    if (rows.length === 0) return;
    await withRetry(() => prisma.auditEvent.createMany({ data: rows }));
  } catch (err) {
    recordFlake('recordServerAuditEvents', err);
    console.warn(
      `server audit recorder: failed to record for project ${ctx.projectId} (non-fatal):`,
      err
    );
  }
}
