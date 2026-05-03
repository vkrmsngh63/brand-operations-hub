import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { ensureProjectWorkflow } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';

// GET /api/project-workflows/[projectId]/[workflow]
// Returns the current state of a single workspace.
//
// If no ProjectWorkflow row exists yet (user has never visited this
// workflow for this Project), one is silently created with status="inactive".
// This keeps callers from having to handle 404s for never-visited workspaces.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; workflow: string }> }
) {
  const { projectId, workflow } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const row = await ensureProjectWorkflow(projectId, workflow);

    // Re-fetch with all fields the client needs (ensureProjectWorkflow
    // only selects id + status for performance).
    const full = await prisma.projectWorkflow.findUnique({
      where: { id: row.id },
      select: {
        id: true,
        projectId: true,
        workflow: true,
        status: true,
        firstActivityAt: true,
        lastActivityAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(full);
  } catch (error) {
    recordFlake('GET /api/project-workflows/[projectId]/[workflow]', error);
    console.error(
      'GET /api/project-workflows/[projectId]/[workflow] error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to fetch workflow state' },
      { status: 500 }
    );
  }
}

// PATCH /api/project-workflows/[projectId]/[workflow]
// Updates a workspace's status. Used by the Projects page Complete/Uncomplete
// toggle.
//
// Accepted status values: "active" or "completed".
//   - "active" from "completed" = user unchecked the Completed box.
//     Clears completedAt.
//   - "completed" from "active" = user checked the Completed box.
//     Sets completedAt to now.
//
// Rejecting "inactive" — there's no user-facing reason to un-start a
// workflow, and allowing it would create ambiguity in the activity timeline.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; workflow: string }> }
) {
  const { projectId, workflow } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => ({}));
    const requestedStatus = body.status;

    if (requestedStatus !== 'active' && requestedStatus !== 'completed') {
      return NextResponse.json(
        {
          error:
            'Invalid status. Accepted values: "active", "completed".',
        },
        { status: 400 }
      );
    }

    // Ensure the row exists before updating (same reasoning as GET).
    const existing = await ensureProjectWorkflow(projectId, workflow);

    const now = new Date();
    const updateData: {
      status: string;
      completedAt: Date | null;
    } = {
      status: requestedStatus,
      completedAt: requestedStatus === 'completed' ? now : null,
    };

    const updated = await prisma.projectWorkflow.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        projectId: true,
        workflow: true,
        status: true,
        firstActivityAt: true,
        lastActivityAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    recordFlake('PATCH /api/project-workflows/[projectId]/[workflow]', error);
    console.error(
      'PATCH /api/project-workflows/[projectId]/[workflow] error:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to update workflow state' },
      { status: 500 }
    );
  }
}