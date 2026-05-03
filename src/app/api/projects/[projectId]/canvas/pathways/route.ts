import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';

const WORKFLOW = 'keyword-clustering';

// POST /api/projects/[projectId]/canvas/pathways — create a pathway.
// Database assigns the UUID id.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const pathway = await prisma.pathway.create({
      data: { projectWorkflowId },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json(pathway, { status: 201 });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/canvas/pathways', error, {
      projectWorkflowId,
    });
    console.error('POST pathway error:', error);
    return NextResponse.json(
      { error: 'Failed to create pathway' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/canvas/pathways — delete one pathway.
// Body: { id: "uuid" }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const body = await req.json();
    await prisma.pathway.deleteMany({
      where: { id: body.id, projectWorkflowId },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ success: true });
  } catch (error) {
    recordFlake('DELETE /api/projects/[projectId]/canvas/pathways', error, {
      projectWorkflowId,
    });
    console.error('DELETE pathway error:', error);
    return NextResponse.json(
      { error: 'Failed to delete pathway' },
      { status: 500 }
    );
  }
}
