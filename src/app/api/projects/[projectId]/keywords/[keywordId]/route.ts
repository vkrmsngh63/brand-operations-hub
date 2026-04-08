import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH /api/projects/[projectId]/keywords/[keywordId] — update a keyword
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; keywordId: string }> }
) {
  try {
    const { projectId, keywordId } = await params;
    const body = await req.json();

    const keyword = await prisma.keyword.update({
      where: { id: keywordId, projectId },
      data: {
        ...(body.keyword !== undefined && { keyword: body.keyword }),
        ...(body.volume !== undefined && { volume: body.volume }),
        ...(body.sortingStatus !== undefined && { sortingStatus: body.sortingStatus }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.topic !== undefined && { topic: body.topic }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
          ...(body.canvasLoc !== undefined && { canvasLoc: body.canvasLoc }),
          ...(body.topicApproved !== undefined && { topicApproved: body.topicApproved }),
      },
    });

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('PATCH keyword error:', error);
    return NextResponse.json({ error: 'Failed to update keyword' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/keywords/[keywordId] — delete one keyword
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; keywordId: string }> }
) {
  try {
    const { projectId, keywordId } = await params;

    await prisma.keyword.delete({
      where: { id: keywordId, projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE keyword error:', error);
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 });
  }
}
