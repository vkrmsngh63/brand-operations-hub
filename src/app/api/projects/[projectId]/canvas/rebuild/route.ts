import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { evaluateRebuildPayload } from '@/lib/canvas-rebuild-guard';
import { recordFlake } from '@/lib/flake-counter';

const WORKFLOW = 'keyword-clustering';

// POST /api/projects/[projectId]/canvas/rebuild — atomic canvas rebuild.
// Accepts full canvas state and applies it in a single transaction.
//
// Body: {
//   nodes: [{ id, stableId, title, description, x, y, w, h, parentId, pathwayId, ... }],
//   pathways: [{ id }],
//   sisterLinks: [{ nodeA, nodeB }],
//   canvasState: { nextStableIdN, viewX, viewY, zoom },
//   deleteNodeIds?: string[],
//   deletePathwayIds?: string[],
//   deleteSisterLinkIds?: string[],
// }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId } = auth;

  // Captured for flake telemetry (Task: underlying flake-rate investigation).
  // The atomic rebuild's transaction duration scales with payload size; the
  // pgbouncer pressure analysis needs to correlate flake rate with this.
  let payloadNodeCount: number | undefined;

  try {
    const body = await req.json();
    if (Array.isArray(body.nodes)) {
      payloadNodeCount = body.nodes.length;
    }

    // ── G1 payload-sanity guard (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.2) ──
    // Reject the canvas-blanking bug signature: a body.nodes payload that
    // would shrink the canvas by >50% with no explicit deleteNodeIds. The
    // threshold + reason live in `src/lib/canvas-rebuild-guard.ts`.
    if (Array.isArray(body.nodes)) {
      const currentNodeCount = await prisma.canvasNode.count({
        where: { projectWorkflowId },
      });
      const decision = evaluateRebuildPayload({
        newNodeCount: body.nodes.length,
        currentNodeCount,
        hasExplicitDeletes:
          Array.isArray(body.deleteNodeIds) && body.deleteNodeIds.length > 0,
        nodesProvided: true,
      });
      if (decision.blocked) {
        return NextResponse.json({ error: decision.reason }, { status: 400 });
      }
    }

    const ops: unknown[] = [];

    // ── Deletions ────────────────────────────────────────────
    if (Array.isArray(body.deleteNodeIds) && body.deleteNodeIds.length > 0) {
      ops.push(
        prisma.canvasNode.deleteMany({
          where: { projectWorkflowId, id: { in: body.deleteNodeIds } },
        })
      );
    }

    if (
      Array.isArray(body.deletePathwayIds) &&
      body.deletePathwayIds.length > 0
    ) {
      ops.push(
        prisma.pathway.deleteMany({
          where: { projectWorkflowId, id: { in: body.deletePathwayIds } },
        })
      );
    }

    if (
      Array.isArray(body.deleteSisterLinkIds) &&
      body.deleteSisterLinkIds.length > 0
    ) {
      ops.push(
        prisma.sisterLink.deleteMany({
          where: { projectWorkflowId, id: { in: body.deleteSisterLinkIds } },
        })
      );
    }

    // ── Pathway creates (must run before nodes — pathway FK targets) ─
    if (Array.isArray(body.pathways)) {
      for (const pw of body.pathways) {
        ops.push(
          prisma.pathway.upsert({
            where: { id: pw.id },
            update: {},
            create: { id: pw.id, projectWorkflowId },
          })
        );
      }
    }

    // ── Node upserts ─────────────────────────────────────────
    // Keyed by per-project (projectWorkflowId, stableId) composite unique.
    // Caller supplies UUID `id` for both create and update; existing nodes
    // keep their UUID, new nodes get one from the materializer.
    //
    // G3 guard echo (per DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.4): if a per-node
    // entry includes `intentFingerprint`, it must be a non-empty trimmed
    // string. Pre-validated up-front so the transaction is never partially
    // applied with a degenerate fingerprint.
    if (Array.isArray(body.nodes)) {
      for (const n of body.nodes) {
        if (Object.prototype.hasOwnProperty.call(n, 'intentFingerprint')) {
          const v = n.intentFingerprint;
          if (typeof v !== 'string' || v.trim().length === 0) {
            return NextResponse.json(
              {
                error:
                  'intentFingerprint, when included in a rebuild node entry, must be a non-empty trimmed string',
              },
              { status: 400 }
            );
          }
        }
      }
      for (const n of body.nodes) {
        const stableId = n.stableId;
        if (!stableId) {
          throw new Error(`rebuild: node missing stableId`);
        }
        ops.push(
          prisma.canvasNode.upsert({
            where: {
              projectWorkflowId_stableId: { projectWorkflowId, stableId },
            },
            update: {
              ...(n.title !== undefined && { title: n.title }),
              ...(n.description !== undefined && {
                description: n.description,
              }),
              ...(n.x !== undefined && { x: n.x }),
              ...(n.y !== undefined && { y: n.y }),
              ...(n.w !== undefined && { w: n.w }),
              ...(n.h !== undefined && { h: n.h }),
              ...(n.baseY !== undefined && { baseY: n.baseY }),
              ...(n.parentId !== undefined && { parentId: n.parentId }),
              ...(n.pathwayId !== undefined && { pathwayId: n.pathwayId }),
              ...(n.relationshipType !== undefined && {
                relationshipType: n.relationshipType,
              }),
              ...(n.linkedKwIds !== undefined && {
                linkedKwIds: n.linkedKwIds,
              }),
              ...(n.kwPlacements !== undefined && {
                kwPlacements: n.kwPlacements,
              }),
              ...(n.altTitles !== undefined && { altTitles: n.altTitles }),
              ...(n.collapsedLinear !== undefined && {
                collapsedLinear: n.collapsedLinear,
              }),
              ...(n.collapsedNested !== undefined && {
                collapsedNested: n.collapsedNested,
              }),
              ...(n.narrativeBridge !== undefined && {
                narrativeBridge: n.narrativeBridge,
              }),
              ...(n.userMinH !== undefined && { userMinH: n.userMinH }),
              ...(n.connCP !== undefined && { connCP: n.connCP }),
              ...(n.connOutOff !== undefined && {
                connOutOff: n.connOutOff,
              }),
              ...(n.connInOff !== undefined && { connInOff: n.connInOff }),
              ...(n.sortOrder !== undefined && { sortOrder: n.sortOrder }),
              ...(n.stabilityScore !== undefined && {
                stabilityScore: n.stabilityScore,
              }),
              ...(n.intentFingerprint !== undefined && {
                intentFingerprint: n.intentFingerprint,
              }),
            },
            create: {
              ...(n.id !== undefined && { id: n.id }),
              stableId,
              projectWorkflowId,
              title: n.title || '',
              description: n.description || '',
              x: n.x ?? 0,
              y: n.y ?? 0,
              w: n.w ?? 220,
              h: n.h ?? 120,
              baseY: n.baseY ?? 0,
              parentId: n.parentId ?? null,
              pathwayId: n.pathwayId ?? null,
              relationshipType: n.relationshipType || '',
              linkedKwIds: n.linkedKwIds ?? [],
              kwPlacements: n.kwPlacements ?? {},
              altTitles: n.altTitles ?? [],
              collapsedLinear: n.collapsedLinear ?? false,
              collapsedNested: n.collapsedNested ?? false,
              narrativeBridge: n.narrativeBridge ?? '',
              userMinH: n.userMinH ?? null,
              connCP: n.connCP ?? null,
              connOutOff: n.connOutOff ?? null,
              connInOff: n.connInOff ?? null,
              sortOrder: n.sortOrder ?? 0,
              stabilityScore: n.stabilityScore ?? 0,
              // Scale Session B: non-AI rebuild flows ship "" placeholder; the
              // backfill script + AI-driven UPDATE_TOPIC_TITLE keep canvas
              // fingerprints fresh. G3 above blocks empty/whitespace from
              // overwriting a real fingerprint via an explicit per-node entry.
              intentFingerprint:
                typeof n.intentFingerprint === 'string'
                  ? n.intentFingerprint
                  : '',
            },
          })
        );
      }
    }

    // ── Sister link creates ──────────────────────────────────
    if (Array.isArray(body.sisterLinks)) {
      for (const sl of body.sisterLinks) {
        ops.push(
          prisma.sisterLink.create({
            data: {
              projectWorkflowId,
              nodeA: sl.nodeA,
              nodeB: sl.nodeB,
            },
          })
        );
      }
    }

    // ── Canvas state update ──────────────────────────────────
    if (body.canvasState) {
      const cs = body.canvasState;
      ops.push(
        prisma.canvasState.upsert({
          where: { projectWorkflowId },
          update: {
            ...(cs.nextStableIdN !== undefined && {
              nextStableIdN: cs.nextStableIdN,
            }),
            ...(cs.viewX !== undefined && { viewX: cs.viewX }),
            ...(cs.viewY !== undefined && { viewY: cs.viewY }),
            ...(cs.zoom !== undefined && { zoom: cs.zoom }),
          },
          create: {
            projectWorkflowId,
            nextStableIdN: cs.nextStableIdN ?? 1,
            viewX: cs.viewX ?? 0,
            viewY: cs.viewY ?? 0,
            zoom: cs.zoom ?? 1,
          },
        })
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(ops as any);

    await markWorkflowActive(projectId, WORKFLOW);

    return NextResponse.json({ success: true, operations: ops.length });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/canvas/rebuild', error, {
      projectWorkflowId,
      ...(payloadNodeCount !== undefined && { canvasSize: payloadNodeCount }),
    });
    console.error('POST canvas rebuild error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Canvas rebuild failed — all changes rolled back',
        detail: message.substring(0, 1000),
      },
      { status: 500 }
    );
  }
}
