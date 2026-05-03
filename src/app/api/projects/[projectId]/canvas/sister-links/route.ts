import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';

const WORKFLOW = 'keyword-clustering';

// POST /api/projects/[projectId]/canvas/sister-links — create a sister link.
// Body: { nodeA, nodeB }
// Meaningful activity — bumps workspace status.
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
    if (body.nodeA === undefined || body.nodeB === undefined) {
      return NextResponse.json(
        { error: 'Provide nodeA and nodeB' },
        { status: 400 }
      );
    }

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // Note: sisterLink has no unique constraint on (nodeA, nodeB), so a
    // rare retry-after-partial-commit on P1002/P1008 could theoretically
    // create a duplicate. Accepted tradeoff — the cost of a rare visible
    // duplicate (user can delete) is much lower than the cost of a 500.
    const link = await withRetry(() =>
      prisma.sisterLink.create({
        data: { projectWorkflowId, nodeA: body.nodeA, nodeB: body.nodeB },
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/canvas/sister-links', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('POST sister link error:', error);
    return NextResponse.json(
      { error: 'Failed to create sister link' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/canvas/sister-links — delete one link.
// Body: { id: "uuid" }
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
    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // deleteMany is idempotent under retry.
    await withRetry(() =>
      prisma.sisterLink.deleteMany({
        where: { id: body.id, projectWorkflowId },
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ success: true });
  } catch (error) {
    recordFlake('DELETE /api/projects/[projectId]/canvas/sister-links', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('DELETE sister link error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sister link' },
      { status: 500 }
    );
  }
}