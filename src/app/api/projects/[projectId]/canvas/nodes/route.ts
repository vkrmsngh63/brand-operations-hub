import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/canvas/nodes — list all canvas nodes.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const nodes = await prisma.canvasNode.findMany({
      where: { projectWorkflowId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.error('GET canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/canvas/nodes — create a node.
// Meaningful activity — bumps workspace status.
//
// Increments the per-project stableId counter atomically so concurrent POSTs
// can't collide on stableId. Database assigns the row's UUID id.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const body = await req.json();

    const node = await prisma.$transaction(async tx => {
      const state = await tx.canvasState.upsert({
        where: { projectWorkflowId },
        update: { nextStableIdN: { increment: 1 } },
        create: { projectWorkflowId, nextStableIdN: 2 },
      });
      // After increment, nextStableIdN is the value to use for the NEXT node;
      // this node takes nextStableIdN - 1.
      const stableN = state.nextStableIdN - 1;
      return tx.canvasNode.create({
        data: {
          stableId: `t-${stableN}`,
          projectWorkflowId,
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
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('POST canvas node error:', error);
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/canvas/nodes — bulk update nodes.
// Body: { nodes: [{ id, ...fields }] }
// All updates run in a single Prisma transaction.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId: _projectWorkflowId } = auth;

  try {
    const body = await req.json();

    if (!Array.isArray(body.nodes)) {
      return NextResponse.json(
        { error: 'Provide nodes array' },
        { status: 400 }
      );
    }

    const ops = body.nodes.map((n: Record<string, unknown>) =>
      prisma.canvasNode.update({
        where: { id: n.id as string },
        data: {
          ...(n.title !== undefined && { title: n.title as string }),
          ...(n.description !== undefined && {
            description: n.description as string,
          }),
          ...(n.x !== undefined && { x: n.x as number }),
          ...(n.y !== undefined && { y: n.y as number }),
          ...(n.w !== undefined && { w: n.w as number }),
          ...(n.h !== undefined && { h: n.h as number }),
          ...(n.parentId !== undefined && {
            parentId: n.parentId as string | null,
          }),
          ...(n.pathwayId !== undefined && {
            pathwayId: n.pathwayId as string | null,
          }),
          ...(n.relationshipType !== undefined && {
            relationshipType: n.relationshipType as string,
          }),
          ...(n.linkedKwIds !== undefined && {
            linkedKwIds:
              n.linkedKwIds as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.kwPlacements !== undefined && {
            kwPlacements:
              n.kwPlacements as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.altTitles !== undefined && {
            altTitles:
              n.altTitles as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.sortOrder !== undefined && {
            sortOrder: n.sortOrder as number,
          }),
        },
      })
    );

    const results = await prisma.$transaction(ops);
    await markWorkflowActive(projectId, WORKFLOW);

    return NextResponse.json(results);
  } catch (error) {
    console.error('PATCH canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to update nodes' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/canvas/nodes — delete node(s).
// Body: { ids: ["uuid", ...] } or { id: "uuid" }
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

    const ids: string[] =
      body.ids || (body.id !== undefined ? [body.id] : []);
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Provide id or ids' },
        { status: 400 }
      );
    }

    await prisma.canvasNode.deleteMany({
      where: { id: { in: ids }, projectWorkflowId },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ success: true, deleted: ids });
  } catch (error) {
    console.error('DELETE canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to delete nodes' },
      { status: 500 }
    );
  }
}
