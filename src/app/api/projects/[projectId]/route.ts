import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';

// GET /api/projects/[projectId] — fetch one Project's details.
// Returns Project fields + its workspaces (status badges) only.
// Workflow data (keywords, canvas nodes, etc.) has separate endpoints.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workflows: {
          select: {
            id: true,
            workflow: true,
            status: true,
            firstActivityAt: true,
            lastActivityAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!project) {
      // verifyProjectAuth already returns 404 if the project is missing,
      // so reaching this branch is unusual (e.g., deleted between auth and fetch).
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('GET /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId] — update name or description.
// Accepts any subset of { name, description }. Unknown fields are ignored.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => ({}));

    const data: { name?: string; description?: string } = {};
    if (typeof body.name === 'string') {
      const trimmed = body.name.trim();
      if (trimmed) data.name = trimmed;
    }
    if (typeof body.description === 'string') {
      data.description = body.description;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('PATCH /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId] — delete the Project and everything inside it.
// The database is set up with cascading deletes, so removing a Project
// automatically removes all its ProjectWorkflow rows, which in turn removes
// their Keywords, CanvasNodes, Pathways, SisterLinks, and CanvasState.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/projects/[projectId] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}