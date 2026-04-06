import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/projects/[projectId]/canvas/sister-links — create a sister link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    if (body.nodeA === undefined || body.nodeB === undefined) {
      return NextResponse.json({ error: 'Provide nodeA and nodeB' }, { status: 400 });
    }

    const link = await prisma.sisterLink.create({
      data: { projectId, nodeA: body.nodeA, nodeB: body.nodeB },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('POST sister link error:', error);
    return NextResponse.json({ error: 'Failed to create sister link' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/canvas/sister-links — delete a sister link
// Send { id: "uuid" }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await req.json();

    await prisma.sisterLink.delete({
      where: { id: body.id, projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE sister link error:', error);
    return NextResponse.json({ error: 'Failed to delete sister link' }, { status: 500 });
  }
}
