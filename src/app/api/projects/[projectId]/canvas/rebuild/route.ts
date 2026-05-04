import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { evaluateRebuildPayload } from '@/lib/canvas-rebuild-guard';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';

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
//   // 2026-05-05 parallel-PATCH-burst reduction (atomic-batch fold-in):
//   keywordUpdates?: [{ id, topic?, canvasLoc?, sortingStatus?, ... }],
//   archiveKeywords?: [{ keywordId, reason }],
// }
//
// `keywordUpdates` and `archiveKeywords` fold what was previously a 55-60+
// parallel PATCH /keywords/[id] burst (per-batch fan-out from
// AutoAnalyze.tsx) plus a sequential POST /removed-keywords loop into the
// SAME $transaction as the canvas rebuild. Eliminates the burst that was
// exhausting Supabase Postgres max_connections=60 at Nano compute, and
// eliminates the P2025 race between archive deletes and parallel PATCHes
// (both now commit or roll back together). Per
// KEYWORD_CLUSTERING_ACTIVE.md POST-2026-05-04-D STATE block item (a)
// approach (iii); director-approved 2026-05-05.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

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
      const currentNodeCount = await withRetry(() =>
        prisma.canvasNode.count({
          where: { projectWorkflowId },
        })
      );
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

    // ── Atomic-batch fold-in (2026-05-05 parallel-PATCH-burst reduction) ──
    // Pre-fetch source keyword rows for archive intents BEFORE the transaction
    // so we can build the create-then-delete ops alongside the canvas ops in
    // the existing array-form $transaction. The findMany is a single read
    // outside the transaction; any in-flight writer between this read and
    // the transaction's commit is a non-issue in practice (Auto-Analyze runs
    // pause manual UI editing, and the AI-archive payload doesn't depend on
    // the keyword's current row data — it only needs id+projectWorkflowId
    // for the deleteMany scope).
    let archiveValidationError: string | null = null;
    let archiveSourceCount = 0;
    if (Array.isArray(body.archiveKeywords) && body.archiveKeywords.length > 0) {
      // Up-front shape validation — fail before any commit attempt.
      for (const a of body.archiveKeywords) {
        if (!a || typeof a.keywordId !== 'string' || a.keywordId.length === 0) {
          archiveValidationError = 'archiveKeywords[].keywordId must be a non-empty string';
          break;
        }
        if (typeof a.reason !== 'string' || a.reason.trim().length === 0) {
          archiveValidationError = 'archiveKeywords[].reason must be a non-empty string';
          break;
        }
      }
      if (archiveValidationError) {
        return NextResponse.json({ error: archiveValidationError }, { status: 400 });
      }

      const archiveIds: string[] = body.archiveKeywords.map(
        (a: { keywordId: string }) => a.keywordId,
      );
      const reasonByKeywordId = new Map<string, string>();
      for (const a of body.archiveKeywords) {
        reasonByKeywordId.set(a.keywordId, a.reason);
      }

      const sourceKeywords = await withRetry(() =>
        prisma.keyword.findMany({
          where: { projectWorkflowId, id: { in: archiveIds } },
        })
      );
      archiveSourceCount = sourceKeywords.length;

      // RemovedKeyword copies — one per source keyword that actually exists.
      // Mirrors the existing /removed-keywords POST createInputs shape.
      // Keywords that no longer exist (e.g., already archived in a prior
      // batch) are silently skipped — same behavior as the standalone route.
      for (const src of sourceKeywords) {
        ops.push(
          prisma.removedKeyword.create({
            data: {
              projectWorkflowId,
              originalKeywordId: src.id,
              keyword: src.keyword,
              volume: src.volume,
              sortingStatus: src.sortingStatus,
              tags: src.tags,
              topic: src.topic,
              canvasLoc: src.canvasLoc as object,
              removedBy: userId,
              removedSource: 'auto-ai-detected-irrelevant',
              aiReasoning: reasonByKeywordId.get(src.id) ?? null,
            },
          })
        );
      }

      // Single deleteMany scoped to all archive ids — Postgres handles the
      // empty-overlap case safely if some ids didn't exist.
      ops.push(
        prisma.keyword.deleteMany({
          where: { projectWorkflowId, id: { in: archiveIds } },
        })
      );
    }

    // ── Keyword updates (folded fan-out replacement) ──────────
    // Replaces the prior fire-and-forget per-keyword PATCH burst from
    // AutoAnalyze.tsx. Same fields the prior PATCH /keywords/[id] endpoint
    // accepted; the composite where clause (id + projectWorkflowId) still
    // protects against cross-workspace updates.
    //
    // Uses `updateMany` rather than `update` deliberately: if the client
    // sends an update for an id that no longer exists (rare race — keyword
    // archived in a prior batch but still referenced by stale client state),
    // updateMany silently no-ops (count=0) instead of throwing P2025 and
    // rolling back the entire transaction. This preserves the
    // batch-continues-despite-stale-id tolerance the prior fire-and-forget
    // PATCHes had, without losing atomicity for the rest of the rebuild.
    let keywordUpdateCount = 0;
    if (Array.isArray(body.keywordUpdates) && body.keywordUpdates.length > 0) {
      // Up-front shape validation — every entry must have a string id.
      for (const ku of body.keywordUpdates) {
        if (!ku || typeof ku.id !== 'string' || ku.id.length === 0) {
          return NextResponse.json(
            { error: 'keywordUpdates[].id must be a non-empty string' },
            { status: 400 }
          );
        }
      }
      for (const ku of body.keywordUpdates) {
        ops.push(
          prisma.keyword.updateMany({
            where: { id: ku.id as string, projectWorkflowId },
            data: {
              ...(ku.keyword !== undefined && { keyword: ku.keyword as string }),
              ...(ku.volume !== undefined && { volume: ku.volume as number }),
              ...(ku.sortingStatus !== undefined && {
                sortingStatus: ku.sortingStatus as string,
              }),
              ...(ku.tags !== undefined && { tags: ku.tags as string }),
              ...(ku.topic !== undefined && { topic: ku.topic as string }),
              ...(ku.sortOrder !== undefined && {
                sortOrder: ku.sortOrder as number,
              }),
              ...(ku.canvasLoc !== undefined && {
                canvasLoc: ku.canvasLoc as object,
              }),
              ...(ku.topicApproved !== undefined && {
                topicApproved: ku.topicApproved as object,
              }),
            },
          })
        );
      }
      keywordUpdateCount = body.keywordUpdates.length;
    }

    // The atomic rebuild transaction is the multi-second connection-holder
    // (~5s at canvas 120 per the aa.rebuildHTTP MEDIUM ROADMAP entry). Wrapped
    // in withRetry per the 2026-05-05 apply-pipeline rate-fix — a transient
    // pgbouncer flake during transaction commit produces P1001/P1002/P2034.
    // The transaction is atomic by definition: a failed commit rolls back
    // entirely, so retry re-runs the whole transaction with no partial-state
    // risk. All ops in the transaction (upserts, deleteMany, sisterLink.create
    // bracketed by deletes-then-creates, removedKeyword.create + keyword
    // .deleteMany for archives, keyword.update for placements) are idempotent
    // under retry.
    //
    // Explicit { timeout: 30000, maxWait: 5000 } per the 2026-05-05
    // atomic-batch fold-in. Default Prisma $transaction timeout is 5s; the
    // canvas rebuild alone runs ~5s at canvas 120, and the fold-in adds
    // ~hundreds of keyword.update ops + a handful of archive ops on top.
    // 30s gives Phase 1 headroom; Phase 3 scaling (canvas 700+) will need
    // a different model — captured for future work, not blocking today.
    await withRetry(() =>
      prisma.$transaction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ops as any,
        {
          timeout: 30000,
          maxWait: 5000,
        }
      )
    );

    await markWorkflowActive(projectId, WORKFLOW);

    return NextResponse.json({
      success: true,
      operations: ops.length,
      keywordUpdates: keywordUpdateCount,
      archived: archiveSourceCount,
    });
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
