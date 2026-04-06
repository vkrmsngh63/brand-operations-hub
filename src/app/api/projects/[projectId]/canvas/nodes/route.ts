import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/projects/[projectId]/canvas/nodes — list all canvas nodes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const nodes = await prisma.canvasNode.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('GET canvas nodes error:', error);
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/canvas/nodes — create a node
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    // Get and increment nextNodeId from canvas state
    const canvasState = await prisma.canvasState.findUnique({
      where: { projectId },
    });

    const nodeId = canvasState?.nextNodeId ?? 1;

    const node = await prisma.canvasNode.create({
      data: {
        id: nodeId,
        projectId,
        title: body.title || '',
        description: body.description || '',
        x: body.x ?? 0,
        y: body.y ?? 0,
        w: body.w ?? 220,
        h: body.h ?? 120,
        pathwayId: body.pathwayId ?? null,
        parentId: body.parentId ?? null,
        relationshipType: body.relationshipType || '',
        linkedKwIds: body.linkedKwIds ?? [],
        kwPlacements: body.kwPlacements ?? {},
        altTitles: body.altTitles ?? [],
        sortOrder: body.sortOrder ?? 0,
      },
    });

    // Increment nextNodeId
    if (canvasState) {
      await prisma.canvasState.update({
        where: { projectId },
        data: { nextNodeId: nodeId + 1 },
      });
    }

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('POST canvas node error:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId]/canvas/nodes — bulk update nodes
// Send { nodes: [{ id, ...fields }] }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    if (!Array.isArray(body.nodes)) {
      return NextResponse.json({ error: 'Provide nodes array' }, { status: 400 });
    }

    const updates = await Promise.all(
      body.nodes.map((n: Record<string, unknown>) =>
        prisma.canvasNode.update({
          where: { id: n.id as number, projectId },
          data: {
            ...(n.title !== undefined && { title: n.title as string }),
            ...(n.description !== undefined && { description: n.description as string }),
            ...(n.x !== undefined && { x: n.x as number }),
            ...(n.y !== undefined && { y: n.y as number }),
            ...(n.w !== undefined && { w: n.w as number }),
            ...(n.h !== undefined && { h: n.h as number }),
            ...(n.parentId !== undefined && { parentId: n.parentId as number | null }),
            ...(n.pathwayId !== undefined && { pathwayId: n.pathwayId as number | null }),
            ...(n.linkedKwIds !== undefined && { linkedKwIds: n.linkedKwIds as unknown as import('@prisma/client').Prisma.InputJsonValue }),
            ...(n.kwPlacements !== undefined && { kwPlacements: n.kwPlacements as unknown as import('@prisma/client').Prisma.InputJsonValue }),
            ...(n.altTitles !== undefined && { altTitles: n.altTitles as unknown as import('@prisma/client').Prisma.InputJsonValue }),
            ...(n.sortOrder !== undefined && { sortOrder: n.sortOrder as number }),
          },
        })
      )
    );

    return NextResponse.json(updates);
  } catch (error) {
    console.error('PATCH canvas nodes error:', error);
    return NextResponse.json({ error: 'Failed to update nodes' }, { status: 500 });
  }
}
