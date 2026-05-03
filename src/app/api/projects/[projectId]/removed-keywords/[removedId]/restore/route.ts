import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';

const WORKFLOW = 'keyword-clustering';

// POST /api/projects/[projectId]/removed-keywords/[removedId]/restore
// Reverses a soft-archive: re-creates a Keyword from the RemovedKeyword row
// and deletes the RemovedKeyword row. The new Keyword gets a fresh id (the
// original id is gone). Topic / canvas placement are NOT auto-restored —
// the keyword comes back as Unsorted-by-default-but-preserves-old-status,
// matching prior UX expectations from the legacy local-state restore flow.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; removedId: string }> }
) {
  const { projectId, removedId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    const removed = await withRetry(() =>
      prisma.removedKeyword.findFirst({
        where: { id: removedId, projectWorkflowId },
      })
    );
    if (!removed) {
      return NextResponse.json({ error: 'Removed keyword not found' }, { status: 404 });
    }

    const collision = await withRetry(() =>
      prisma.keyword.findFirst({
        where: { projectWorkflowId, keyword: removed.keyword },
        select: { id: true },
      })
    );
    if (collision) {
      return NextResponse.json(
        { error: 'A keyword with this text already exists in the workspace' },
        { status: 409 }
      );
    }

    const maxSort = await withRetry(() =>
      prisma.keyword.aggregate({
        where: { projectWorkflowId },
        _max: { sortOrder: true },
      })
    );
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    // Atomic transaction; the create/delete pair is idempotent under retry
    // (the create reuses no unique field beyond Keyword's own id; the delete
    // is by removedId which is stable).
    const restored = await withRetry(() =>
      prisma.$transaction(async tx => {
        const created = await tx.keyword.create({
          data: {
            projectWorkflowId,
            keyword: removed.keyword,
            volume: removed.volume,
            sortingStatus: removed.sortingStatus,
            tags: removed.tags,
            topic: '',
            canvasLoc: {},
            sortOrder: nextSort,
          },
        });
        await tx.removedKeyword.delete({ where: { id: removed.id } });
        return created;
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ restored }, { status: 201 });
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/removed-keywords/[removedId]/restore',
      error,
      { retried: true, projectWorkflowId },
    );
    console.error('POST removed-keywords/restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore keyword' },
      { status: 500 }
    );
  }
}
