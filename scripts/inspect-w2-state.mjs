// READ-ONLY inspection script for W#2 verification — written 2026-05-14
// Confirms yesterday's Walmart CapturedImage row + lists CompetitorUrl + recent CapturedImage state per platform.
// Safe to re-run any time. No mutations.

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1) Count CompetitorUrl rows per (Project, platform) — tells us which platforms
  //    already have saved URLs we could use for image-capture smoke.
  const urls = await prisma.competitorUrl.findMany({
    select: {
      id: true,
      platform: true,
      url: true,
      productName: true,
      addedAt: true,
      projectWorkflow: {
        select: {
          projectId: true,
          project: { select: { name: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });

  // group by (projectName, platform)
  const groups = new Map();
  for (const u of urls) {
    const projectName = u.projectWorkflow.project.name;
    const key = `${projectName} | ${u.platform}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(u);
  }

  console.log('=== CompetitorUrl rows per (Project, platform) ===');
  for (const [key, list] of [...groups.entries()].sort()) {
    console.log(`  ${key}: ${list.length} URL${list.length === 1 ? '' : 's'}`);
    // Show the most recent 2 URLs per group as samples
    for (const u of list.slice(0, 2)) {
      const display = u.url.length > 80 ? u.url.slice(0, 77) + '...' : u.url;
      console.log(`    - "${u.productName || '(no productName)'}" — ${display}`);
    }
    if (list.length > 2) console.log(`    ...and ${list.length - 2} more`);
  }
  console.log();

  // 2) Most recent CapturedImage rows (last 7 days), with all metadata + URL context.
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentImages = await prisma.capturedImage.findMany({
    where: { addedAt: { gte: sevenDaysAgo } },
    orderBy: { addedAt: 'desc' },
    take: 50,
    include: {
      competitorUrl: {
        select: {
          platform: true,
          url: true,
          productName: true,
          projectWorkflow: { select: { project: { select: { name: true } } } },
        },
      },
    },
  });

  console.log(`=== CapturedImage rows in the last 7 days (showing up to 50, newest first) ===`);
  console.log(`Total found: ${recentImages.length}`);
  console.log();

  if (recentImages.length === 0) {
    console.log('  (none in window — no recent image captures recorded in DB)');
  } else {
    for (const img of recentImages) {
      const project = img.competitorUrl.projectWorkflow.project.name;
      const platform = img.competitorUrl.platform;
      const url = img.competitorUrl.url;
      const urlDisp = url.length > 70 ? url.slice(0, 67) + '...' : url;
      console.log(`  [${img.addedAt.toISOString()}] ${platform} | Project "${project}"`);
      console.log(`    URL: ${urlDisp}`);
      console.log(`    imageCategory: ${img.imageCategory ?? '(null)'}`);
      console.log(`    sourceType: ${img.sourceType}   mimeType: ${img.mimeType ?? '(null)'}   fileSize: ${img.fileSize ?? '(null)'}`);
      console.log(`    storagePath: ${img.storagePath}`);
      console.log(`    composition: ${img.composition ? img.composition.slice(0, 100) : '(null)'}`);
      console.log(`    embeddedText: ${img.embeddedText ? img.embeddedText.slice(0, 100) : '(null)'}`);
      console.log(`    tags: ${JSON.stringify(img.tags)}`);
      console.log();
    }
  }

  // 3) Aggregate counts of CapturedImage rows per (Project, platform) across all time.
  //    Tells us how much capture history exists in total per platform.
  const allImages = await prisma.capturedImage.findMany({
    select: {
      competitorUrl: {
        select: {
          platform: true,
          projectWorkflow: { select: { project: { select: { name: true } } } },
        },
      },
    },
  });
  const imageGroups = new Map();
  for (const img of allImages) {
    const projectName = img.competitorUrl.projectWorkflow.project.name;
    const platform = img.competitorUrl.platform;
    const key = `${projectName} | ${platform}`;
    imageGroups.set(key, (imageGroups.get(key) || 0) + 1);
  }
  console.log('=== Total CapturedImage rows per (Project, platform) — all time ===');
  if (imageGroups.size === 0) {
    console.log('  (none in DB at all)');
  } else {
    for (const [key, count] of [...imageGroups.entries()].sort()) {
      console.log(`  ${key}: ${count} image${count === 1 ? '' : 's'}`);
    }
  }
}

main()
  .catch((err) => {
    console.error('Inspection script failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
