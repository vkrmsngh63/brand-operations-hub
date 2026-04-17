import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/keywords — list all keywords for this
// project's keyword-clustering workspace.
// Pure read — no status transition, no timestamp update.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;

  try {
    const keywords = await prisma.keyword.findMany({
      where: { projectWorkflowId: auth.projectWorkflowId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    console.error('GET keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/keywords — create keyword(s).
// Body: { keyword, volume } for single, or { keywords: [...] } for bulk import.
// Meaningful activity — bumps workspace status from Inactive → Active on first call.
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

    // Bulk import path
    if (Array.isArray(body.keywords)) {
      const maxSort = await prisma.keyword.aggregate({
        where: { projectWorkflowId },
        _max: { sortOrder: true },
      });
      let nextSort = (maxSort._max.sortOrder ?? -1) + 1;

      const data = body.keywords.map(
        (kw: { keyword: string; volume?: number }) => ({
          projectWorkflowId,
          keyword: kw.keyword.trim(),
          volume: parseInt(String(kw.volume ?? '0')) || 0,
          sortOrder: nextSort++,
        })
      );

      const result = await prisma.keyword.createMany({ data });
      await markWorkflowActive(projectId, WORKFLOW);
      return NextResponse.json({ created: result.count }, { status: 201 });
    }

    // Single-keyword path
    const maxSort = await prisma.keyword.aggregate({
      where: { projectWorkflowId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const keyword = await prisma.keyword.create({
      data: {
        projectWorkflowId,
        keyword: (body.keyword || '').trim(),
        volume: parseInt(String(body.volume ?? '0')) || 0,
        sortOrder: nextSort,
      },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json(keyword, { status: 201 });
  } catch (error) {
    console.error('POST keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword(s)' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/keywords — bulk update.
// Body: { keywords: [{ id, ...fields }, ...] }
// All updates run in a single Prisma transaction — all succeed or all fail.
// Meaningful activity — bumps workspace status.
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

    if (!Array.isArray(body.keywords) || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Provide keywords array with id and fields' },
        { status: 400 }
      );
    }

    // One update op per keyword. The composite where clause
    // (id + projectWorkflowId) ensures we can't accidentally update
    // a keyword belonging to a different workspace.
    const ops = body.keywords.map((kw: Record<string, unknown>) => {
      const id = kw.id as string;
      return prisma.keyword.update({
        where: { id, projectWorkflowId },
        data: {
          ...(kw.keyword !== undefined && { keyword: kw.keyword as string }),
          ...(kw.volume !== undefined && { volume: kw.volume as number }),
          ...(kw.sortingStatus !== undefined && {
            sortingStatus: kw.sortingStatus as string,
          }),
          ...(kw.tags !== undefined && { tags: kw.tags as string }),
          ...(kw.topic !== undefined && { topic: kw.topic as string }),
          ...(kw.sortOrder !== undefined && {
            sortOrder: kw.sortOrder as number,
          }),
          ...(kw.canvasLoc !== undefined && {
            canvasLoc: kw.canvasLoc as object,
          }),
          ...(kw.topicApproved !== undefined && {
            topicApproved: kw.topicApproved as object,
          }),
        },
      });
    });

    const results = await prisma.$transaction(ops);
    await markWorkflowActive(projectId, WORKFLOW);

    return NextResponse.json({ updated: results.length });
  } catch (error) {
    console.error('PATCH keywords bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update keywords' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/keywords — bulk delete by IDs.
// Body: { ids: ["id1", "id2"] }
// Meaningful activity — bumps workspace status.
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
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'Provide ids array' },
        { status: 400 }
      );
    }

    const result = await prisma.keyword.deleteMany({
      where: { projectWorkflowId, id: { in: body.ids } },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('DELETE keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to delete keywords' },
      { status: 500 }
    );
  }
}