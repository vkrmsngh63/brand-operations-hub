import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { withRetry } from '@/lib/prisma-retry';

const WORKFLOW = 'keyword-clustering';

// GET /api/projects/[projectId]/canvas/nodes — list all canvas nodes.
//
// G2 (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.3): the findMany call is
// wrapped in `withRetry` so a transient pgbouncer connection-pool flake
// (P1001/P1002/P1008/P2034) is retried 100ms then 500ms before
// surfacing as a 500. The 2026-04-28 canvas-blanking bug was triggered
// by exactly this flake; the client now defends against an empty
// response (Bug 1 Layer 1), but suppressing the transient blip
// server-side prevents the run from pausing in the first place.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  try {
    const nodes = await withRetry(() =>
      prisma.canvasNode.findMany({
        where: { projectWorkflowId },
        orderBy: { sortOrder: 'asc' },
      }),
    );
    return NextResponse.json(nodes);
  } catch (error) {
    console.error('GET canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/canvas/nodes — create a node.
// Meaningful activity — bumps workspace status.
//
// Increments the per-project stableId counter atomically so concurrent POSTs
// can't collide on stableId. Database assigns the row's UUID id.
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

    const node = await prisma.$transaction(async tx => {
      const state = await tx.canvasState.upsert({
        where: { projectWorkflowId },
        update: { nextStableIdN: { increment: 1 } },
        create: { projectWorkflowId, nextStableIdN: 2 },
      });
      // After increment, nextStableIdN is the value to use for the NEXT node;
      // this node takes nextStableIdN - 1.
      const stableN = state.nextStableIdN - 1;
      return tx.canvasNode.create({
        data: {
          stableId: `t-${stableN}`,
          projectWorkflowId,
          title: body.title || '',
          description: body.description || '',
          x: body.x ?? 0,
          y: body.y ?? 0,
          w: body.w ?? 220,
          h: body.h ?? 120,
          pathwayId: body.pathwayId ?? null,
          parentId: body.parentId ?? null,
          relationshipType: body.relationshipType || '',
          linkedKwIds: body.linkedKwIds ?? [],
          kwPlacements: body.kwPlacements ?? {},
          altTitles: body.altTitles ?? [],
          sortOrder: body.sortOrder ?? 0,
          // Scale Session B: non-AI flows ship "" placeholder; the AI later
          // refreshes via UPDATE_TOPIC_TITLE once V4 prompts emit fingerprints.
          // G3 (PATCH guard, this same route) blocks empty-string PATCH
          // updates so a degenerate fingerprint can never be written by an
          // AI flow.
          intentFingerprint: typeof body.intentFingerprint === 'string'
            ? body.intentFingerprint
            : '',
        },
      });
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error('POST canvas node error:', error);
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/canvas/nodes — bulk update nodes.
// Body: { nodes: [{ id, ...fields }] }
// All updates run in a single Prisma transaction.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId: _projectWorkflowId } = auth;

  try {
    const body = await req.json();

    if (!Array.isArray(body.nodes)) {
      return NextResponse.json(
        { error: 'Provide nodes array' },
        { status: 400 }
      );
    }

    // ── G3 guard (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.4) ──
    // Reject any PATCH that includes `intentFingerprint` set to an empty /
    // whitespace-only / non-string value. A degenerate fingerprint persisted
    // to DB causes Tier 1 misclassification for the rest of the topic's life
    // (Scale Session B failure mode (a)). Force the AI to retry rather than
    // persist a degenerate value.
    for (const n of body.nodes as Array<Record<string, unknown>>) {
      if (Object.prototype.hasOwnProperty.call(n, 'intentFingerprint')) {
        const v = n.intentFingerprint;
        if (typeof v !== 'string' || v.trim().length === 0) {
          return NextResponse.json(
            {
              error:
                'intentFingerprint, when included in a PATCH update, must be a non-empty trimmed string',
            },
            { status: 400 }
          );
        }
      }
    }

    const ops = body.nodes.map((n: Record<string, unknown>) =>
      prisma.canvasNode.update({
        where: { id: n.id as string },
        data: {
          ...(n.title !== undefined && { title: n.title as string }),
          ...(n.description !== undefined && {
            description: n.description as string,
          }),
          ...(n.x !== undefined && { x: n.x as number }),
          ...(n.y !== undefined && { y: n.y as number }),
          ...(n.w !== undefined && { w: n.w as number }),
          ...(n.h !== undefined && { h: n.h as number }),
          ...(n.parentId !== undefined && {
            parentId: n.parentId as string | null,
          }),
          ...(n.pathwayId !== undefined && {
            pathwayId: n.pathwayId as string | null,
          }),
          ...(n.relationshipType !== undefined && {
            relationshipType: n.relationshipType as string,
          }),
          ...(n.linkedKwIds !== undefined && {
            linkedKwIds:
              n.linkedKwIds as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.kwPlacements !== undefined && {
            kwPlacements:
              n.kwPlacements as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.altTitles !== undefined && {
            altTitles:
              n.altTitles as unknown as import('@prisma/client').Prisma.InputJsonValue,
          }),
          ...(n.sortOrder !== undefined && {
            sortOrder: n.sortOrder as number,
          }),
          // intentFingerprint: pre-validated above by the G3 guard; only a
          // non-empty trimmed string can reach this point.
          ...(n.intentFingerprint !== undefined && {
            intentFingerprint: n.intentFingerprint as string,
          }),
        },
      })
    );

    const results = await prisma.$transaction(ops);
    await markWorkflowActive(projectId, WORKFLOW);

    return NextResponse.json(results);
  } catch (error) {
    console.error('PATCH canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to update nodes' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/canvas/nodes — delete node(s).
// Body: { ids: ["uuid", ...] } or { id: "uuid" }
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

    const ids: string[] =
      body.ids || (body.id !== undefined ? [body.id] : []);
    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'Provide id or ids' },
        { status: 400 }
      );
    }

    await prisma.canvasNode.deleteMany({
      where: { id: { in: ids }, projectWorkflowId },
    });

    await markWorkflowActive(projectId, WORKFLOW);
    return NextResponse.json({ success: true, deleted: ids });
  } catch (error) {
    console.error('DELETE canvas nodes error:', error);
    return NextResponse.json(
      { error: 'Failed to delete nodes' },
      { status: 500 }
    );
  }
}
