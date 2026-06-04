import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { recordServerAuditEvents } from '@/lib/audit-recorder-server';
import { manualEvent } from '@/lib/audit-payload';

const WORKFLOW = 'keyword-clustering';

// POST /api/projects/[projectId]/canvas/pathways — create a pathway.
// Database assigns the UUID id.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // Pathway has no unique constraint, so rare retry-after-partial-commit
    // could create a duplicate empty pathway — accepted tradeoff (admin can
    // delete; far cheaper than the 500 alternative).
    const pathway = await withRetry(() =>
      prisma.pathway.create({
        data: { projectWorkflowId },
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    // H-1 slice 2 (future-proof): no manual UI calls this route today —
    // pathways are recomputed wholesale by the AI rebuild. Wired now so a
    // future manual pathway editor records automatically. Best-effort.
    await recordServerAuditEvents({ projectId, userId }, [
      manualEvent({
        eventType: 'ADD_PATHWAY',
        after: { id: pathway.id },
        detail: { pathwayId: pathway.id },
      }),
    ]);
    return NextResponse.json(pathway, { status: 201 });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/canvas/pathways', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('POST pathway error:', error);
    return NextResponse.json(
      { error: 'Failed to create pathway' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/canvas/pathways — delete one pathway.
// Body: { id: "uuid" }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();
    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    await withRetry(() =>
      prisma.pathway.deleteMany({
        where: { id: body.id, projectWorkflowId },
      })
    );

    await markWorkflowActive(projectId, WORKFLOW);
    // H-1 slice 2 (future-proof): see the POST note above.
    await recordServerAuditEvents({ projectId, userId }, [
      manualEvent({ eventType: 'REMOVE_PATHWAY', detail: { pathwayId: body.id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    recordFlake('DELETE /api/projects/[projectId]/canvas/pathways', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('DELETE pathway error:', error);
    return NextResponse.json(
      { error: 'Failed to delete pathway' },
      { status: 500 }
    );
  }
}
