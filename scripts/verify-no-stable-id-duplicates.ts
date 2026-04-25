/**
 * Read-only verification: confirm no two CanvasNode rows in the same
 * ProjectWorkflow share a stableId. If this passes, Step 3's unique
 * index can be added with --accept-data-loss safely.
 *
 * Run with:  node scripts/verify-no-stable-id-duplicates.ts
 */

import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const groups = await prisma.canvasNode.groupBy({
      by: ['projectWorkflowId', 'stableId'],
      _count: { _all: true },
      having: { stableId: { _count: { gt: 1 } } },
    });
    if (groups.length > 0) {
      console.error('DUPLICATES FOUND:', groups);
      process.exit(1);
    }
    const total = await prisma.canvasNode.count();
    const malformed = await prisma.canvasNode.count({
      where: { NOT: { stableId: { startsWith: 't-' } } },
    });
    console.log(`Verification: ${total} CanvasNode rows total; ${malformed} with non-t- stableId; 0 duplicate (projectWorkflowId, stableId) pairs.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
