import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/projects/[projectId]/keywords — list all keywords for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

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
  try {
    const { projectId } = await params;
    const body = await req.json();

    // Bulk import: array of keywords
    if (Array.isArray(body.keywords)) {
      // Find the current max sortOrder so new ones go at the end
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

// DELETE /api/projects/[projectId]/keywords — bulk delete
// Send { ids: ["id1", "id2"] }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
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
