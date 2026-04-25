/**
 * Pivot Session B Step 2 — Backfill `stableId` on every CanvasNode row.
 *
 * Per `docs/PIVOT_DESIGN.md` §2.3 + §3.3:
 *   stableId = "t-" + id   (for every existing row)
 *
 * Idempotent: skips rows whose stableId already starts with "t-".
 * Re-runnable safely. Logs every update.
 *
 * Run with:
 *   node scripts/backfill-stable-ids.ts
 *
 * Optional flag for the design-doc "test on a fresh project first" gate:
 *   node scripts/backfill-stable-ids.ts --project-workflow-id=<uuid>
 * When the flag is supplied, only rows belonging to that ProjectWorkflow
 * are touched.
 *
 * Historical note: this script ran live on 2026-04-25 and populated the
 * 104 Bursitis rows. After Step 3's NOT NULL constraint shipped, every
 * new CanvasNode is created with a stableId at insert time (see
 * src/app/api/projects/[projectId]/canvas/nodes/route.ts and
 * .../canvas/rebuild/route.ts), so a re-run finds nothing to do.
 *
 * Node 22+ strips TypeScript types automatically.
 */

import { PrismaClient } from '@prisma/client';

function parseProjectWorkflowFlag(): string | undefined {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--project-workflow-id=')) {
      return arg.slice('--project-workflow-id='.length);
    }
  }
  return undefined;
}

async function main() {
  const prisma = new PrismaClient();
  const projectWorkflowId = parseProjectWorkflowFlag();

  try {
    const baseFilter = projectWorkflowId ? { projectWorkflowId } : {};
    const scopeLabel = projectWorkflowId
      ? `(scope: projectWorkflowId=${projectWorkflowId})`
      : '(scope: all rows)';
    const needsBackfill = { NOT: { stableId: { startsWith: 't-' } } } as const;

    const totalRows = await prisma.canvasNode.count({ where: baseFilter });
    const todo = await prisma.canvasNode.count({
      where: { ...baseFilter, ...needsBackfill },
    });
    const alreadyDone = totalRows - todo;

    console.log(
      `Backfill ${scopeLabel}: ${totalRows} CanvasNode row(s); ${alreadyDone} already populated; ${todo} need stableId.`,
    );

    if (todo === 0) {
      console.log('Backfill: nothing to do.');
      return;
    }

    const rows = await prisma.canvasNode.findMany({
      where: { ...baseFilter, ...needsBackfill },
      select: { id: true, projectWorkflowId: true },
      orderBy: { id: 'asc' },
    });

    let updated = 0;
    for (const row of rows) {
      const newStableId = `t-${row.id}`;
      await prisma.canvasNode.update({
        where: { id: row.id },
        data: { stableId: newStableId },
      });
      console.log(
        `  CanvasNode id=${row.id} (project ${row.projectWorkflowId}) → stableId="${newStableId}"`,
      );
      updated++;
    }

    console.log(`Backfill: updated ${updated} row(s).`);

    const remaining = await prisma.canvasNode.count({
      where: { ...baseFilter, ...needsBackfill },
    });
    if (remaining > 0) {
      console.error(
        `Backfill VERIFICATION FAILED: ${remaining} row(s) still need stableId in scope.`,
      );
      process.exit(1);
    }
    console.log('Backfill: verification passed — every row in scope has a t-N stableId.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Backfill: unexpected error.', err);
  process.exit(1);
});
