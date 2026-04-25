import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/canvas — fetch canvas state, pathways, sister links.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const [canvasState, pathways, sisterLinks] = await Promise.all([
      prisma.canvasState.findUnique({ where: { projectWorkflowId } }),
      prisma.pathway.findMany({ where: { projectWorkflowId } }),
      prisma.sisterLink.findMany({ where: { projectWorkflowId } }),
    ]);

    const healedCanvasState = canvasState ?? {
      id: '',
      projectWorkflowId,
      nextStableIdN: 1,
      viewX: 0,
      viewY: 0,
      zoom: 1,
    };

    return NextResponse.json({ canvasState: healedCanvasState, pathways, sisterLinks });
  } catch (error) {
    console.error('GET canvas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch canvas' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/canvas — update canvas state (viewport,
// zoom, or the per-project stableId counter).
//
// Deliberately does NOT call markWorkflowActive. Pan/zoom is pure
// "looking around" — not a meaningful user action.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const body = await req.json();
    const canvasState = await prisma.canvasState.upsert({
      where: { projectWorkflowId },
      update: {
        ...(body.viewX !== undefined && { viewX: body.viewX }),
        ...(body.viewY !== undefined && { viewY: body.viewY }),
        ...(body.zoom !== undefined && { zoom: body.zoom }),
        ...(body.nextStableIdN !== undefined && { nextStableIdN: body.nextStableIdN }),
      },
      create: {
        projectWorkflowId,
        viewX: body.viewX ?? 0,
        viewY: body.viewY ?? 0,
        zoom: body.zoom ?? 1,
        nextStableIdN: body.nextStableIdN ?? 1,
      },
    });
    return NextResponse.json(canvasState);
  } catch (error) {
    console.error('PATCH canvas error:', error);
    return NextResponse.json(
      { error: 'Failed to update canvas state' },
      { status: 500 }
    );
  }
}
