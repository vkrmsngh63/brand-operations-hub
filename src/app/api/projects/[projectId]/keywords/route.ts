import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { recordServerAuditEvents } from '@/lib/audit-recorder-server';
import { manualEvent, keywordUpdateEvents } from '@/lib/audit-payload';
import { resolveKcWorkflow } from '@/lib/kc-workflow';

// GET /api/projects/[projectId]/keywords — list all keywords for this
// project's keyword-clustering workspace.
// Pure read — no status transition, no timestamp update.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const workflow = resolveKcWorkflow(req);
  const auth = await verifyProjectWorkflowAuth(req, projectId, workflow);
  if (auth.error) return auth.error;

  try {
    const keywords = await prisma.keyword.findMany({
      where: { projectWorkflowId: auth.projectWorkflowId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(keywords);
  } catch (error) {
    recordFlake('GET /api/projects/[projectId]/keywords', error, {
      projectWorkflowId: auth.projectWorkflowId,
    });
    console.error('GET keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/keywords — create keyword(s).
// Body: { keyword, volume } for single, or { keywords: [...] } for bulk import.
// Meaningful activity — bumps workspace status from Inactive → Active on first call.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const workflow = resolveKcWorkflow(req);
  const auth = await verifyProjectWorkflowAuth(req, projectId, workflow);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // Bulk import: createMany has no unique constraint on (workflowId,
    // keyword), so a rare retry-after-partial-commit could duplicate the
    // import. Same accepted tradeoff as sisterLink/pathway creates.
    if (Array.isArray(body.keywords)) {
      const maxSort = await withRetry(() =>
        prisma.keyword.aggregate({
          where: { projectWorkflowId },
          _max: { sortOrder: true },
        })
      );
      let nextSort = (maxSort._max.sortOrder ?? -1) + 1;

      const data = body.keywords.map(
        (kw: { keyword: string; volume?: number }) => ({
          projectWorkflowId,
          keyword: kw.keyword.trim(),
          volume: parseInt(String(kw.volume ?? '0')) || 0,
          sortOrder: nextSort++,
        })
      );

      const result = await withRetry(() =>
        prisma.keyword.createMany({ data })
      );
      await markWorkflowActive(projectId, workflow);
      // H-1 slice 2: record each manually-imported keyword (best-effort).
      // createMany returns no ids, so the snapshot keys on keyword text.
      await recordServerAuditEvents(
        { projectId, userId },
        data.map((d: { keyword: string }) =>
          manualEvent({
            eventType: 'CREATE_KEYWORD',
            after: { keyword: d.keyword },
            detail: { keyword: d.keyword, bulk: true },
          })
        )
      );
      return NextResponse.json({ created: result.count }, { status: 201 });
    }

    // Single-keyword path
    const maxSort = await withRetry(() =>
      prisma.keyword.aggregate({
        where: { projectWorkflowId },
        _max: { sortOrder: true },
      })
    );
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    const keyword = await withRetry(() =>
      prisma.keyword.create({
        data: {
          projectWorkflowId,
          keyword: (body.keyword || '').trim(),
          volume: parseInt(String(body.volume ?? '0')) || 0,
          sortOrder: nextSort,
        },
      })
    );

    await markWorkflowActive(projectId, workflow);
    // H-1 slice 2: record the manual single-keyword creation (best-effort).
    await recordServerAuditEvents({ projectId, userId }, [
      manualEvent({
        eventType: 'CREATE_KEYWORD',
        after: { id: keyword.id, keyword: keyword.keyword },
        detail: { keywordId: keyword.id, keyword: keyword.keyword },
      }),
    ]);
    return NextResponse.json(keyword, { status: 201 });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/keywords', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('POST keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to create keyword(s)' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[projectId]/keywords — bulk update.
// Body: { keywords: [{ id, ...fields }, ...] }
// All updates run in a single Prisma transaction — all succeed or all fail.
// Meaningful activity — bumps workspace status.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const workflow = resolveKcWorkflow(req);
  const auth = await verifyProjectWorkflowAuth(req, projectId, workflow);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();

    if (!Array.isArray(body.keywords) || body.keywords.length === 0) {
      return NextResponse.json(
        { error: 'Provide keywords array with id and fields' },
        { status: 400 }
      );
    }

    // One update op per keyword. The composite where clause
    // (id + projectWorkflowId) ensures we can't accidentally update
    // a keyword belonging to a different workspace.
    const ops = body.keywords.map((kw: Record<string, unknown>) => {
      const id = kw.id as string;
      return prisma.keyword.update({
        where: { id, projectWorkflowId },
        data: {
          ...(kw.keyword !== undefined && { keyword: kw.keyword as string }),
          ...(kw.volume !== undefined && { volume: kw.volume as number }),
          ...(kw.sortingStatus !== undefined && {
            sortingStatus: kw.sortingStatus as string,
          }),
          ...(kw.tags !== undefined && { tags: kw.tags as string }),
          ...(kw.topic !== undefined && { topic: kw.topic as string }),
          ...(kw.sortOrder !== undefined && {
            sortOrder: kw.sortOrder as number,
          }),
          ...(kw.canvasLoc !== undefined && {
            canvasLoc: kw.canvasLoc as object,
          }),
          ...(kw.topicApproved !== undefined && {
            topicApproved: kw.topicApproved as object,
          }),
        },
      });
    });

    // H-1 slice 3: snapshot each keyword's PRE-edit state so the history can
    // show "from → to". Best-effort + guarded; must run before the transaction.
    let beforeKwMap = new Map<string, Record<string, unknown>>();
    try {
      const ids = (body.keywords as Record<string, unknown>[])
        .map(k => k.id)
        .filter((x): x is string => typeof x === 'string');
      if (ids.length > 0) {
        const rows = await prisma.keyword.findMany({
          where: { id: { in: ids }, projectWorkflowId },
        });
        beforeKwMap = new Map(
          rows.map(r => [r.id, r as unknown as Record<string, unknown>])
        );
      }
    } catch {
      /* best-effort: lose before-state, keep the edit */
    }

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    // Atomic transaction; .update calls inside are idempotent under retry.
    const results = await withRetry(() => prisma.$transaction(ops));
    await markWorkflowActive(projectId, workflow);

    // H-1 slice 2/3: record manual keyword edits/reorders with before → after
    // (best-effort). A patch touching only layout (canvasLoc) / metadata
    // (topicApproved) diffs to [].
    await recordServerAuditEvents(
      { projectId, userId },
      (body.keywords as Record<string, unknown>[]).flatMap(k =>
        keywordUpdateEvents(k, beforeKwMap.get(k.id as string))
      )
    );

    return NextResponse.json({ updated: results.length });
  } catch (error) {
    recordFlake('PATCH /api/projects/[projectId]/keywords', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('PATCH keywords bulk error:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update keywords' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[projectId]/keywords — bulk delete by IDs.
// Body: { ids: ["id1", "id2"] }
// Meaningful activity — bumps workspace status.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const workflow = resolveKcWorkflow(req);
  const auth = await verifyProjectWorkflowAuth(req, projectId, workflow);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'Provide ids array' },
        { status: 400 }
      );
    }

    // H-1 slice 3: snapshot each keyword's text BEFORE deleting so the history
    // can name what was removed ("Deleted keyword 'X'"). Best-effort + guarded.
    let kwTextById = new Map<string, string>();
    try {
      const rows = await prisma.keyword.findMany({
        where: { projectWorkflowId, id: { in: body.ids } },
        select: { id: true, keyword: true },
      });
      kwTextById = new Map(rows.map(r => [r.id, r.keyword]));
    } catch {
      /* best-effort: lose the text, keep the delete */
    }

    // Wrapped in withRetry per the 2026-05-05 apply-pipeline rate-fix.
    const result = await withRetry(() =>
      prisma.keyword.deleteMany({
        where: { projectWorkflowId, id: { in: body.ids } },
      })
    );

    await markWorkflowActive(projectId, workflow);
    // H-1 slice 2/3: record the manual keyword deletion(s) with the removed
    // text (best-effort).
    await recordServerAuditEvents(
      { projectId, userId },
      (body.ids as string[]).map(id => {
        const keyword = kwTextById.get(id);
        return manualEvent({
          eventType: 'DELETE_KEYWORD',
          ...(keyword ? { before: { keyword } } : {}),
          detail: { keywordId: id, ...(keyword ? { keyword } : {}) },
        });
      })
    );
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    recordFlake('DELETE /api/projects/[projectId]/keywords', error, {
      retried: true,
      projectWorkflowId,
    });
    console.error('DELETE keywords error:', error);
    return NextResponse.json(
      { error: 'Failed to delete keywords' },
      { status: 500 }
    );
  }
}