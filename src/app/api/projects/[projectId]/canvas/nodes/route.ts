import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';

// GET /api/projects/[projectId]/canvas/nodes — list all canvas nodes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
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
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
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

    // Increment nextNodeId (upsert in case canvasState didn't exist yet)
    await prisma.canvasState.upsert({
      where: { projectId },
      update: { nextNodeId: nodeId + 1 },
      create: { projectId, nextNodeId: nodeId + 1 },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('POST canvas node error:', error);
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId]/canvas/nodes — bulk update nodes
// Send { nodes: [{ id, ...fields }] }
// All updates run in a single Prisma transaction — all succeed or all fail.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    if (!Array.isArray(body.nodes)) {
      return NextResponse.json({ error: 'Provide nodes array' }, { status: 400 });
    }

    const ops = body.nodes.map((n: Record<string, unknown>) =>
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
          ...(n.relationshipType !== undefined && { relationshipType: n.relationshipType as string }),
          ...(n.linkedKwIds !== undefined && { linkedKwIds: n.linkedKwIds as unknown as import('@prisma/client').Prisma.InputJsonValue }),
          ...(n.kwPlacements !== undefined && { kwPlacements: n.kwPlacements as unknown as import('@prisma/client').Prisma.InputJsonValue }),
          ...(n.altTitles !== undefined && { altTitles: n.altTitles as unknown as import('@prisma/client').Prisma.InputJsonValue }),
          ...(n.sortOrder !== undefined && { sortOrder: n.sortOrder as number }),
        },
      })
    );

    const results = await prisma.$transaction(ops);

    return NextResponse.json(results);
  } catch (error) {
    console.error('PATCH canvas nodes error:', error);
    return NextResponse.json({ error: 'Failed to update nodes' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/canvas/nodes — delete node(s)
// Send { ids: [1, 2, 3] } or { id: 1 }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    const ids: number[] = body.ids || (body.id !== undefined ? [body.id] : []);
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Provide id or ids' }, { status: 400 });
    }

    await prisma.canvasNode.deleteMany({
      where: { id: { in: ids }, projectId },
    });

    return NextResponse.json({ success: true, deleted: ids });
  } catch (error) {
    console.error('DELETE canvas nodes error:', error);
    return NextResponse.json({ error: 'Failed to delete nodes' }, { status: 500 });
  }
}
