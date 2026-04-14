import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';

// POST /api/projects/[projectId]/canvas/rebuild — atomic canvas rebuild
// Accepts full canvas state and applies it in a single transaction.
// Used by Auto-Analyze to replace canvas without partial failures.
//
// Body: {
//   nodes: [{ id, title, description, x, y, w, h, ... }],
//   pathways: [{ id }],
//   sisterLinks: [{ nodeA, nodeB }],
//   canvasState: { nextNodeId, nextPathwayId, viewX, viewY, zoom },
//   deleteNodeIds?: number[],     // nodes to remove
//   deletePathwayIds?: number[],  // pathways to remove
//   deleteSisterLinkIds?: string[], // sister links to remove
// }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const ops: unknown[] = [];

    // ── Deletions ────────────────────────────────────────────
    if (Array.isArray(body.deleteNodeIds) && body.deleteNodeIds.length > 0) {
      ops.push(
        prisma.canvasNode.deleteMany({
          where: { projectId, id: { in: body.deleteNodeIds } },
        })
      );
    }

    if (Array.isArray(body.deletePathwayIds) && body.deletePathwayIds.length > 0) {
      ops.push(
        prisma.pathway.deleteMany({
          where: { projectId, id: { in: body.deletePathwayIds } },
        })
      );
    }

    if (Array.isArray(body.deleteSisterLinkIds) && body.deleteSisterLinkIds.length > 0) {
      ops.push(
        prisma.sisterLink.deleteMany({
          where: { projectId, id: { in: body.deleteSisterLinkIds } },
        })
      );
    }

    // ── Node upserts (create or update) ──────────────────────
    if (Array.isArray(body.nodes)) {
      for (const n of body.nodes) {
        ops.push(
          prisma.canvasNode.upsert({
            where: { id: n.id, projectId },
            update: {
              ...(n.title !== undefined && { title: n.title }),
              ...(n.description !== undefined && { description: n.description }),
              ...(n.x !== undefined && { x: n.x }),
              ...(n.y !== undefined && { y: n.y }),
              ...(n.w !== undefined && { w: n.w }),
              ...(n.h !== undefined && { h: n.h }),
              ...(n.baseY !== undefined && { baseY: n.baseY }),
              ...(n.parentId !== undefined && { parentId: n.parentId }),
              ...(n.pathwayId !== undefined && { pathwayId: n.pathwayId }),
              ...(n.relationshipType !== undefined && { relationshipType: n.relationshipType }),
              ...(n.linkedKwIds !== undefined && { linkedKwIds: n.linkedKwIds }),
              ...(n.kwPlacements !== undefined && { kwPlacements: n.kwPlacements }),
              ...(n.altTitles !== undefined && { altTitles: n.altTitles }),
              ...(n.collapsedLinear !== undefined && { collapsedLinear: n.collapsedLinear }),
              ...(n.collapsedNested !== undefined && { collapsedNested: n.collapsedNested }),
              ...(n.narrativeBridge !== undefined && { narrativeBridge: n.narrativeBridge }),
              ...(n.userMinH !== undefined && { userMinH: n.userMinH }),
              ...(n.connCP !== undefined && { connCP: n.connCP }),
              ...(n.connOutOff !== undefined && { connOutOff: n.connOutOff }),
              ...(n.connInOff !== undefined && { connInOff: n.connInOff }),
              ...(n.sortOrder !== undefined && { sortOrder: n.sortOrder }),
            },
            create: {
              id: n.id,
              projectId,
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
            },
          })
        );
      }
    }

    // ── Pathway creates ──────────────────────────────────────
    if (Array.isArray(body.pathways)) {
      for (const pw of body.pathways) {
        ops.push(
          prisma.pathway.upsert({
            where: { id: pw.id, projectId },
            update: {},
            create: { id: pw.id, projectId },
          })
        );
      }
    }

    // ── Sister link creates ──────────────────────────────────
    if (Array.isArray(body.sisterLinks)) {
      for (const sl of body.sisterLinks) {
        ops.push(
          prisma.sisterLink.create({
            data: { projectId, nodeA: sl.nodeA, nodeB: sl.nodeB },
          })
        );
      }
    }

    // ── Canvas state update ──────────────────────────────────
    if (body.canvasState) {
      const cs = body.canvasState;
      ops.push(
        prisma.canvasState.upsert({
          where: { projectId },
          update: {
            ...(cs.nextNodeId !== undefined && { nextNodeId: cs.nextNodeId }),
            ...(cs.nextPathwayId !== undefined && { nextPathwayId: cs.nextPathwayId }),
            ...(cs.viewX !== undefined && { viewX: cs.viewX }),
            ...(cs.viewY !== undefined && { viewY: cs.viewY }),
            ...(cs.zoom !== undefined && { zoom: cs.zoom }),
          },
          create: {
            projectId,
            nextNodeId: cs.nextNodeId ?? 1,
            nextPathwayId: cs.nextPathwayId ?? 1,
            viewX: cs.viewX ?? 0,
            viewY: cs.viewY ?? 0,
            zoom: cs.zoom ?? 1,
          },
        })
      );
    }

    // ── Execute all operations atomically ────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(ops as any);

    return NextResponse.json({ success: true, operations: ops.length });
  } catch (error) {
    console.error('POST canvas rebuild error:', error);
    return NextResponse.json({ error: 'Canvas rebuild failed — all changes rolled back' }, { status: 500 });
  }
}
