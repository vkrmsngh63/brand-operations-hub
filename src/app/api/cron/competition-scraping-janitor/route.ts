import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import {
  deleteStorageImages,
  listAllStorageImages,
} from '@/lib/competition-storage';
import {
  findOrphans,
  ORPHAN_GRACE_MS,
} from '@/lib/competition-storage-helpers';

// W#2 daily janitor — storage-orphan cleanup.
//
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3 + the
// PLATFORM_REQUIREMENTS.md §10.1.1 platform-wide sync-reliability
// requirements (this is component #9 — daily server-side janitor).
//
// Schedule: 03:00 UTC daily (configured in vercel.json crons entry).
//
// What it does:
//   1. Read every CapturedImage.storagePath into a Set of known paths.
//   2. List every file in the `competition-scraping` Storage bucket.
//   3. For each storage file, classify via `findOrphans`:
//      - File path matches a known DB row → keep.
//      - File created less than ORPHAN_GRACE_MS (24h) ago → keep
//        (in-flight upload; the :finalize call may still be on its way).
//      - Otherwise → orphan; delete.
//   4. Bulk-delete the orphan paths via deleteStorageImages.
//
// Auth:
//   Vercel cron hits this endpoint with `Authorization: Bearer
//   ${CRON_SECRET}` when CRON_SECRET is set in the project's env vars.
//   We compare against process.env.CRON_SECRET. If the env var is unset
//   we deny ALL requests so the path can't be hit publicly. The director
//   sets CRON_SECRET in Vercel's project settings before this cron does
//   anything useful — until then the cron returns 401 and silently
//   no-ops, which is the safe failure mode.
//
// Idempotency:
//   The janitor is fully idempotent — running it twice in a row deletes
//   nothing the second time (orphans were already removed on the first
//   run; new orphans haven't aged past the grace window yet). Vercel
//   may occasionally double-fire a cron; that's fine.
//
// Failure mode:
//   If the storage list call fails partway, we surface a 500 and abort.
//   No partial deletion happens. The cron retries the next day. If
//   listAllStorageImages succeeds but the DB query fails, we abort
//   without deleting anything (refusing to delete with an incomplete
//   set of "known good" paths is the safe choice — better to leak
//   orphans for a day than wrongly delete a real image).

export async function GET(req: NextRequest) {
  // ─── Auth gate ──────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (!cronSecret) {
    // Env var not configured — refuse all requests so this path can't be
    // hit publicly. Director sets CRON_SECRET in Vercel project env.
    return NextResponse.json(
      { error: 'Janitor not configured (CRON_SECRET env var not set)' },
      { status: 401 }
    );
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();

  // ─── Step 1: Collect known DB paths ─────────────────────────────────
  let knownDbPaths: Set<string>;
  try {
    const rows = await withRetry(() =>
      prisma.capturedImage.findMany({ select: { storagePath: true } })
    );
    knownDbPaths = new Set(rows.map((r) => r.storagePath));
  } catch (error) {
    recordFlake(
      'GET /api/cron/competition-scraping-janitor (db scan)',
      error,
      { retried: true }
    );
    console.error('Janitor DB-scan error:', error);
    return NextResponse.json(
      { error: 'Janitor failed during DB scan; no files were deleted' },
      { status: 500 }
    );
  }

  // ─── Step 2: List the bucket ────────────────────────────────────────
  let entries;
  try {
    entries = await listAllStorageImages();
  } catch (error) {
    recordFlake(
      'GET /api/cron/competition-scraping-janitor (storage list)',
      error
    );
    console.error('Janitor storage-list error:', error);
    return NextResponse.json(
      { error: 'Janitor failed during storage list; no files were deleted' },
      { status: 500 }
    );
  }

  // ─── Step 3: Classify orphans ───────────────────────────────────────
  const orphanPaths = findOrphans(
    entries,
    knownDbPaths,
    Date.now(),
    ORPHAN_GRACE_MS
  );

  // ─── Step 4: Delete orphans ─────────────────────────────────────────
  let deletedCount = 0;
  if (orphanPaths.length > 0) {
    try {
      const result = await deleteStorageImages(orphanPaths);
      deletedCount = result.deletedCount;
    } catch (error) {
      recordFlake(
        'GET /api/cron/competition-scraping-janitor (storage delete)',
        error
      );
      console.error('Janitor storage-delete error:', error);
      return NextResponse.json(
        {
          error:
            'Janitor partially failed during deletion; remaining orphans will be retried tomorrow',
          knownDbPaths: knownDbPaths.size,
          totalStorageFiles: entries.length,
          orphansFound: orphanPaths.length,
          deletedSoFar: deletedCount,
        },
        { status: 500 }
      );
    }
  }

  const elapsedMs = Date.now() - startedAt;
  return NextResponse.json({
    success: true,
    knownDbPaths: knownDbPaths.size,
    totalStorageFiles: entries.length,
    orphansFound: orphanPaths.length,
    deletedCount,
    elapsedMs,
  });
}
