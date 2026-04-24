import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/canvas — fetch the canvas as a whole:
// canvas state (viewport + counters), pathways, and sister links.
// Pure read.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const [canvasState, pathways, sisterLinks, maxNode, maxPathway] = await Promise.all([
      prisma.canvasState.findUnique({ where: { projectWorkflowId } }),
      prisma.pathway.findMany({ where: { projectWorkflowId } }),
      prisma.sisterLink.findMany({ where: { projectWorkflowId } }),
      prisma.canvasNode.aggregate({ where: { projectWorkflowId }, _max: { id: true } }),
      prisma.pathway.aggregate({ where: { projectWorkflowId }, _max: { id: true } }),
    ]);

    // Self-heal nextNodeId / nextPathwayId on read. The stored counter can
    // drift below the actual max id (observed: Bursitis canvas had nextNodeId=5
    // vs max(CanvasNode.id)=104). Returning max(stored, observed_max+1) means
    // every consumer (AutoAnalyze, manual node create, useCanvas) gets a
    // collision-free next id without needing a one-off migration.
    const healedCanvasState = canvasState
      ? {
          ...canvasState,
          nextNodeId: Math.max(canvasState.nextNodeId, (maxNode._max.id ?? 0) + 1),
          nextPathwayId: Math.max(canvasState.nextPathwayId, (maxPathway._max.id ?? 0) + 1),
        }
      : null;

    return NextResponse.json({ canvasState: healedCanvasState, pathways, sisterLinks });
  } catch (error) {
    console.error('GET canvas error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch canvas' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/canvas — update canvas state.
// Handles both viewport (viewX/viewY/zoom) and id counters
// (nextNodeId/nextPathwayId).
//
// Deliberately does NOT call markWorkflowActive. Rationale:
//   - Pan/zoom is pure "looking around" — not a meaningful user action.
//   - Counter updates happen because a node or pathway was created, which
//     is handled by the dedicated /nodes and /pathways routes — those
//     routes call markWorkflowActive themselves. Calling it here again
//     would be redundant.
//
// Net effect: canvas pan/zoom never flips a workspace from Inactive to
// Active, which matches the user's definition of meaningful activity.
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
        ...(body.nextNodeId !== undefined && { nextNodeId: body.nextNodeId }),
        ...(body.nextPathwayId !== undefined && {
          nextPathwayId: body.nextPathwayId,
        }),
      },
      create: {
        projectWorkflowId,
        viewX: body.viewX ?? 0,
        viewY: body.viewY ?? 0,
        zoom: body.zoom ?? 1,
        nextNodeId: body.nextNodeId ?? 1,
        nextPathwayId: body.nextPathwayId ?? 1,
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