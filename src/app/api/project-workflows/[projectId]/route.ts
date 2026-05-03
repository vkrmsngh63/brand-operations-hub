import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';

// GET /api/project-workflows/[projectId]
// Returns all ProjectWorkflow rows that exist for this Project.
//
// This endpoint is consumed by the Projects page (Phase M Checkpoint 6) to
// render status badges (Inactive/Active/Completed) next to each of the 14
// workflow cards for a given Project.
//
// Workspaces that have never been visited won't appear in the result. The
// Projects page treats any missing workflow as Inactive by default.
//
// Pure read — no status transitions, no timestamp updates, no auto-creation.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const workflows = await prisma.projectWorkflow.findMany({
      where: { projectId },
      select: {
        id: true,
        workflow: true,
        status: true,
        firstActivityAt: true,
        lastActivityAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    recordFlake('GET /api/project-workflows/[projectId]', error);
    console.error('GET /api/project-workflows/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow statuses' },
      { status: 500 }
    );
  }
}