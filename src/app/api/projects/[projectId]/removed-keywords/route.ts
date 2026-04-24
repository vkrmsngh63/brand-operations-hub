import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/removed-keywords — list soft-archived keywords
// for this project's keyword-clustering workspace, newest first.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;

  try {
    const removed = await prisma.removedKeyword.findMany({
      where: { projectWorkflowId: auth.projectWorkflowId },
      orderBy: { removedAt: 'desc' },
    });
    return NextResponse.json(removed);
  } catch (error) {
    console.error('GET removed-keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch removed keywords' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/removed-keywords — soft-archive keywords.
// Body: {
//   keywordIds: string[],          // Keyword.id values to archive
//   removedSource?: string,        // "manual" (default) | "auto-ai-detected-irrelevant"
//   aiReasoning?: string,          // model rationale when source is auto-*
// }
// Transactionally: copies each Keyword to RemovedKeyword + deletes the
// original Keyword row. Returns the created RemovedKeyword rows.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body.keywordIds) ? body.keywordIds : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Provide keywordIds array' }, { status: 400 });
    }

    const removedSource: string = body.removedSource ?? 'manual';
    if (removedSource !== 'manual' && removedSource !== 'auto-ai-detected-irrelevant') {
      return NextResponse.json({ error: 'Invalid removedSource' }, { status: 400 });
    }
    const aiReasoning: string | null = body.aiReasoning ?? null;

    const sourceKeywords = await prisma.keyword.findMany({
      where: { projectWorkflowId, id: { in: ids } },
    });
    if (sourceKeywords.length === 0) {
      return NextResponse.json({ archived: 0, removed: [] });
    }

    const createInputs = sourceKeywords.map(k => ({
      projectWorkflowId,
      originalKeywordId: k.id,
      keyword: k.keyword,
      volume: k.volume,
      sortingStatus: k.sortingStatus,
      tags: k.tags,
      topic: k.topic,
      canvasLoc: k.canvasLoc as object,
      removedBy: userId,
      removedSource,
      aiReasoning,
    }));

    const created = await prisma.$transaction(async tx => {
      const rows = await Promise.all(
        createInputs.map(input => tx.removedKeyword.create({ data: input }))
      );
      await tx.keyword.deleteMany({
        where: { projectWorkflowId, id: { in: sourceKeywords.map(k => k.id) } },
      });
      return rows;
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ archived: created.length, removed: created }, { status: 201 });
  } catch (error) {
    console.error('POST removed-keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to archive keywords' },
      { status: 500 }
    );
  }
}
