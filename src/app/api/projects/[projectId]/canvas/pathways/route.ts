import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/projects/[projectId]/canvas/pathways — create a pathway
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Get and increment nextPathwayId
    const canvasState = await prisma.canvasState.findUnique({
      where: { projectId },
    });

    const pathwayId = canvasState?.nextPathwayId ?? 1;

    const pathway = await prisma.pathway.create({
      data: { id: pathwayId, projectId },
    });

    if (canvasState) {
      await prisma.canvasState.update({
        where: { projectId },
        data: { nextPathwayId: pathwayId + 1 },
      });
    }

    return NextResponse.json(pathway, { status: 201 });
  } catch (error) {
    console.error('POST pathway error:', error);
    return NextResponse.json({ error: 'Failed to create pathway' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/canvas/pathways — delete pathway
// Send { id: 1 }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    await prisma.pathway.delete({
      where: { id: body.id, projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE pathway error:', error);
    return NextResponse.json({ error: 'Failed to delete pathway' }, { status: 500 });
  }
}
