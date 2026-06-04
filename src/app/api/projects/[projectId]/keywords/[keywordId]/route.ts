import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { recordServerAuditEvents } from '@/lib/audit-recorder-server';
import { manualEvent, keywordUpdateEvents } from '@/lib/audit-payload';

const WORKFLOW = 'keyword-clustering';

// PATCH /api/projects/[projectId]/keywords/[keywordId] — update one keyword.
// Meaningful activity — bumps workspace status.
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; keywordId: string }>;
  }
) {
  const { projectId, keywordId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();

    // H-1 slice 3: snapshot the keyword's PRE-edit state so the history can show
    // "from → to". Best-effort + guarded; must run before the update.
    let beforeKw: Record<string, unknown> | undefined;
    try {
      const row = await prisma.keyword.findFirst({
        where: { id: keywordId, projectWorkflowId },
      });
      if (row) beforeKw = row as unknown as Record<string, unknown>;
    } catch {
      /* best-effort: lose before-state, keep the edit */
    }

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // .update is idempotent (same data → same result); P2025 record-not-found
    // is non-transient and won't trigger a retry.
    const keyword = await withRetry(() =>
      prisma.keyword.update({
        where: { id: keywordId, projectWorkflowId },
        data: {
          ...(body.keyword !== undefined && { keyword: body.keyword }),
          ...(body.volume !== undefined && { volume: body.volume }),
          ...(body.sortingStatus !== undefined && {
            sortingStatus: body.sortingStatus,
          }),
          ...(body.tags !== undefined && { tags: body.tags }),
          ...(body.topic !== undefined && { topic: body.topic }),
          ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
          ...(body.canvasLoc !== undefined && { canvasLoc: body.canvasLoc }),
          ...(body.topicApproved !== undefined && {
            topicApproved: body.topicApproved,
          }),
        },
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    // H-1 slice 2/3: record the manual keyword edit with before → after
    // (best-effort, post-commit).
    await recordServerAuditEvents(
      { projectId, userId },
      keywordUpdateEvents({ id: keywordId, ...body }, beforeKw)
    );
    return NextResponse.json(keyword);
  } catch (error) {
    recordFlake('PATCH /api/projects/[projectId]/keywords/[keywordId]', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('PATCH keyword error:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/keywords/[keywordId] — delete one keyword.
// Meaningful activity — bumps workspace status.
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; keywordId: string }>;
  }
) {
  const { projectId, keywordId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    // H-1 slice 3: snapshot the keyword's text BEFORE deleting so the history
    // can name what was removed. Best-effort + guarded.
    let deletedText: string | undefined;
    try {
      const row = await prisma.keyword.findFirst({
        where: { id: keywordId, projectWorkflowId },
        select: { keyword: true },
      });
      deletedText = row?.keyword;
    } catch {
      /* best-effort: lose the text, keep the delete */
    }

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // .delete is idempotent under retry — P2025 (already deleted) is
    // non-transient and won't trigger a retry.
    await withRetry(() =>
      prisma.keyword.delete({
        where: { id: keywordId, projectWorkflowId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    // H-1 slice 2/3: record the manual keyword deletion with the removed text
    // (best-effort, post-commit).
    await recordServerAuditEvents({ projectId, userId }, [
      manualEvent({
        eventType: 'DELETE_KEYWORD',
        ...(deletedText ? { before: { keyword: deletedText } } : {}),
        detail: { keywordId, ...(deletedText ? { keyword: deletedText } : {}) },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    recordFlake('DELETE /api/projects/[projectId]/keywords/[keywordId]', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('DELETE keyword error:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}