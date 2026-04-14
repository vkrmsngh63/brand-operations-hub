import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';

// GET /api/projects/[projectId]/canvas — get full canvas (state + pathways + sister links)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const [canvasState, pathways, sisterLinks] = await Promise.all([
      prisma.canvasState.findUnique({ where: { projectId } }),
      prisma.pathway.findMany({ where: { projectId } }),
      prisma.sisterLink.findMany({ where: { projectId } }),
    ]);

    return NextResponse.json({ canvasState, pathways, sisterLinks });
  } catch (error) {
    console.error('GET canvas error:', error);
    return NextResponse.json({ error: 'Failed to fetch canvas' }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId]/canvas — update canvas state (viewport, zoom, counters)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    const canvasState = await prisma.canvasState.upsert({
      where: { projectId },
      update: {
        ...(body.viewX !== undefined && { viewX: body.viewX }),
        ...(body.viewY !== undefined && { viewY: body.viewY }),
        ...(body.zoom !== undefined && { zoom: body.zoom }),
        ...(body.nextNodeId !== undefined && { nextNodeId: body.nextNodeId }),
        ...(body.nextPathwayId !== undefined && { nextPathwayId: body.nextPathwayId }),
      },
      create: {
        projectId,
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
    return NextResponse.json({ error: 'Failed to update canvas state' }, { status: 500 });
  }
}
