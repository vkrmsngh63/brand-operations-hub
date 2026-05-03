import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';

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
  const { projectWorkflowId } = auth;

  try {
    const body = await req.json();
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
  const { projectWorkflowId } = auth;

  try {
    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // .delete is idempotent under retry — P2025 (already deleted) is
    // non-transient and won't trigger a retry.
    await withRetry(() =>
      prisma.keyword.delete({
        where: { id: keywordId, projectWorkflowId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
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