import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';

// GET /api/projects/[projectId]/keywords — list all keywords for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const keywords = await prisma.keyword.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    console.error('GET keywords error:', error);
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/keywords — create keyword(s)
// Send { keyword, volume } for single, or { keywords: [...] } for bulk import
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    // Bulk import: array of keywords
    if (Array.isArray(body.keywords)) {
      const maxSort = await prisma.keyword.aggregate({
        where: { projectId },
        _max: { sortOrder: true },
      });
      let nextSort = (maxSort._max.sortOrder ?? -1) + 1;

      const data = body.keywords.map((kw: { keyword: string; volume?: number }) => ({
        projectId,
        keyword: kw.keyword.trim(),
        volume: parseInt(String(kw.volume ?? '0')) || 0,
        sortOrder: nextSort++,
      }));

      const result = await prisma.keyword.createMany({ data });
      return NextResponse.json({ created: result.count }, { status: 201 });
    }

    // Single keyword
    const maxSort = await prisma.keyword.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const keyword = await prisma.keyword.create({
      data: {
        projectId,
        keyword: (body.keyword || '').trim(),
        volume: parseInt(String(body.volume ?? '0')) || 0,
        sortOrder: nextSort,
      },
    });

    return NextResponse.json(keyword, { status: 201 });
  } catch (error) {
    console.error('POST keywords error:', error);
    return NextResponse.json({ error: 'Failed to create keyword(s)' }, { status: 500 });
  }
}

// PATCH /api/projects/[projectId]/keywords — bulk update keywords
// Send { keywords: [{ id, ...fields }, ...] }
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

    if (!Array.isArray(body.keywords) || body.keywords.length === 0) {
      return NextResponse.json({ error: 'Provide keywords array with id and fields' }, { status: 400 });
    }

    // Build one update operation per keyword, all inside a transaction
    const ops = body.keywords.map((kw: Record<string, unknown>) => {
      const id = kw.id as string;
      return prisma.keyword.update({
        where: { id, projectId },
        data: {
          ...(kw.keyword !== undefined && { keyword: kw.keyword as string }),
          ...(kw.volume !== undefined && { volume: kw.volume as number }),
          ...(kw.sortingStatus !== undefined && { sortingStatus: kw.sortingStatus as string }),
          ...(kw.tags !== undefined && { tags: kw.tags as string }),
          ...(kw.topic !== undefined && { topic: kw.topic as string }),
          ...(kw.sortOrder !== undefined && { sortOrder: kw.sortOrder as number }),
          ...(kw.canvasLoc !== undefined && { canvasLoc: kw.canvasLoc as object }),
          ...(kw.topicApproved !== undefined && { topicApproved: kw.topicApproved as object }),
        },
      });
    });

    const results = await prisma.$transaction(ops);

    return NextResponse.json({ updated: results.length });
  } catch (error) {
    console.error('PATCH keywords bulk error:', error);
    return NextResponse.json({ error: 'Failed to bulk update keywords' }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/keywords — bulk delete
// Send { ids: ["id1", "id2"] }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: 'Provide ids array' }, { status: 400 });
    }

    const result = await prisma.keyword.deleteMany({
      where: { projectId, id: { in: body.ids } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('DELETE keywords error:', error);
    return NextResponse.json({ error: 'Failed to delete keywords' }, { status: 500 });
  }
}
