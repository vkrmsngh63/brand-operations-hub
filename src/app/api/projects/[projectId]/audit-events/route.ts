import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { isKnownAuditEventType } from '@/lib/audit-payload';

const WORKFLOW = 'keyword-clustering';

// The server "inbox" for the Keyword Clustering (W#1) action-history recorder
// (H-1 slice 1). The browser POSTs a batch of {eventType, payload} changes —
// from an Auto-Analyze run or a manual edit — and we file them onto the shared
// `AuditEvent` table (prisma/schema.prisma). See docs/KEYWORD_CLUSTERING_-
// POLISH_BACKLOG.md H-1 + WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.10.
//
// Recording is BEST-EFFORT and must NEVER break the user's actual edit:
//  - the real mutation already committed via its own route before we are called;
//  - unknown/garbage eventTypes are skipped (reported in `skipped`), not 4xx'd;
//  - on a DB error we 500 but the caller (audit-recorder.ts) swallows it.

interface IncomingEvent {
  eventType?: unknown;
  payload?: unknown;
}

// POST /api/projects/[projectId]/audit-events — record a batch of changes.
// Body: { events: [{ eventType, payload }, ...] }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;
  const { projectWorkflowId, userId } = auth;

  try {
    const body = await req.json();
    const incoming: IncomingEvent[] = Array.isArray(body?.events)
      ? body.events
      : [];

    const rows: {
      workflowType: string;
      projectId: string;
      userId: string;
      eventType: string;
      payload: object;
    }[] = [];
    let skipped = 0;

    for (const e of incoming) {
      const eventType = e?.eventType;
      const payload = e?.payload;
      if (
        typeof eventType !== 'string' ||
        !isKnownAuditEventType(eventType) ||
        typeof payload !== 'object' ||
        payload === null
      ) {
        skipped++;
        continue;
      }
      rows.push({
        workflowType: WORKFLOW,
        projectId,
        userId,
        eventType,
        payload: payload as object,
      });
    }

    if (rows.length === 0) {
      return NextResponse.json({ recorded: 0, skipped });
    }

    const result = await withRetry(() =>
      prisma.auditEvent.createMany({ data: rows })
    );
    return NextResponse.json({ recorded: result.count, skipped });
  } catch (error) {
    recordFlake('POST /api/projects/[projectId]/audit-events', error, {
      projectWorkflowId,
    });
    console.error('POST audit-events error:', error);
    return NextResponse.json(
      { error: 'Failed to record audit events' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[projectId]/audit-events — recent action history, newest
// first. Powers slice-1 verification today and seeds the future Action-History
// UI tab (H-1 (c)). Pure read; no status transition.
// Query: ?limit=N (default 200, max 1000)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return auth.error;

  const limitParam = parseInt(
    req.nextUrl.searchParams.get('limit') ?? '200',
    10
  );
  const take = Math.min(Math.max(Number.isNaN(limitParam) ? 200 : limitParam, 1), 1000);

  try {
    const events = await prisma.auditEvent.findMany({
      where: { projectId, workflowType: WORKFLOW },
      orderBy: { timestamp: 'desc' },
      take,
    });
    return NextResponse.json(events);
  } catch (error) {
    recordFlake('GET /api/projects/[projectId]/audit-events', error, {
      projectWorkflowId: auth.projectWorkflowId,
    });
    console.error('GET audit-events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit events' },
      { status: 500 }
    );
  }
}
