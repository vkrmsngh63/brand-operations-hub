import { prisma } from '@/lib/db';
import { withRetry } from '@/lib/prisma-retry';

// ── Workflow status management ─────────────────────────────────
// Central place for ProjectWorkflow status transitions and activity timestamps.
// Called from API routes on meaningful mutations (keyword create, canvas edit, etc.).
//
// Status lifecycle:
//   "inactive" → "active"    (auto, on first meaningful activity)
//   "active"   → "completed" (manual, via user toggle on Projects View)
//   "completed" → "active"   (manual, if user unchecks)
//
// Activity timestamps:
//   firstActivityAt — set once, when status first transitions to "active"
//   lastActivityAt  — refreshed on every call, regardless of status
//                     (so completed workflows that get touched still bubble
//                      to the top of the Projects View sort order)

interface MarkActiveResult {
  ok: true;
  projectWorkflowId: string;
  status: string;
}

// Marks a workflow as having been touched. Idempotent — safe to call on
// every mutation. Returns the current status after any transition.
//
// If no ProjectWorkflow exists for (projectId, workflow), one is created
// with status "active" and firstActivityAt = now (since this call itself
// represents a meaningful action).
export async function markWorkflowActive(
  projectId: string,
  workflow: string
): Promise<MarkActiveResult> {
  const now = new Date();

  // Fetch current row (if it exists) to decide whether this is a
  // first-time activation or just a lastActivityAt refresh. Wrapped in
  // withRetry per the 2026-05-05 silent-helper rate-fix — markWorkflowActive
  // runs on every meaningful authenticated mutation (keyword create, canvas
  // edit, etc.), so a transient flake here turns a successful user action
  // into a 500 even on routes that wrap their own body in withRetry.
  const existing = await withRetry(() =>
    prisma.projectWorkflow.findUnique({
      where: {
        projectId_workflow: { projectId, workflow },
      },
      select: { id: true, status: true, firstActivityAt: true },
    })
  );

  if (!existing) {
    // No row yet — create one, jumping straight to "active" since this call
    // is itself the first activity. (verifyProjectWorkflowAuth also
    // auto-creates rows but sets status="inactive" on GETs; this path
    // handles the rare case where a mutation hits without going through
    // the auth helper's upsert first.)
    const created = await withRetry(() =>
      prisma.projectWorkflow.create({
        data: {
          projectId,
          workflow,
          status: 'active',
          firstActivityAt: now,
          lastActivityAt: now,
        },
        select: { id: true, status: true },
      })
    );
    return {
      ok: true,
      projectWorkflowId: created.id,
      status: created.status,
    };
  }

  // Row exists — decide what to update.
  if (existing.status === 'inactive') {
    // First meaningful activity — transition to active, set both timestamps.
    const updated = await withRetry(() =>
      prisma.projectWorkflow.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          firstActivityAt: existing.firstActivityAt ?? now,
          lastActivityAt: now,
        },
        select: { id: true, status: true },
      })
    );
    return {
      ok: true,
      projectWorkflowId: updated.id,
      status: updated.status,
    };
  }

  // Already active or completed — just refresh lastActivityAt.
  // Completed workflows keep their status; touching them doesn't un-complete them.
  const updated = await withRetry(() =>
    prisma.projectWorkflow.update({
      where: { id: existing.id },
      data: { lastActivityAt: now },
      select: { id: true, status: true },
    })
  );
  return {
    ok: true,
    projectWorkflowId: updated.id,
    status: updated.status,
  };
}

// Finds-or-creates a ProjectWorkflow row without any status side effects.
// Used by routes that need the projectWorkflowId but don't themselves
// represent a meaningful user action (e.g., status read endpoints).
//
// New rows are created with status="inactive" — they become "active" only
// when a real mutation happens (which will call markWorkflowActive).
export async function ensureProjectWorkflow(
  projectId: string,
  workflow: string
): Promise<{ id: string; status: string }> {
  // Wrapped in withRetry per the 2026-05-05 silent-helper rate-fix — same
  // reasoning as markWorkflowActive above.
  const row = await withRetry(() =>
    prisma.projectWorkflow.upsert({
      where: {
        projectId_workflow: { projectId, workflow },
      },
      update: {},
      create: {
        projectId,
        workflow,
        status: 'inactive',
      },
      select: { id: true, status: true },
    })
  );
  return row;
}
