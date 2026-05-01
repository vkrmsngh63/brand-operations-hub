import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const projectId = '9e0ffc58-9ea2-4ea3-b840-144f760fb960';

async function main() {
  // Find the ProjectWorkflow.id for KC on this project
  const pw = await prisma.projectWorkflow.findFirst({
    where: { projectId, workflow: 'keyword-clustering' },
    select: { id: true, projectId: true },
  });
  if (!pw) { console.log('No KC workflow for project'); return; }

  const nodes = await prisma.canvasNode.findMany({
    where: { projectWorkflowId: pw.id },
    orderBy: [{ stableId: 'asc' }],
    select: {
      stableId: true,
      title: true,
      intentFingerprint: true,
      stabilityScore: true,
    },
  });

  console.log(`Total topics: ${nodes.length}`);
  console.log(`---`);
  // sort by numeric suffix of stableId
  const sortByN = (s) => parseInt(s.replace('t-',''),10);
  nodes.sort((a,b) => sortByN(a.stableId) - sortByN(b.stableId));

  // Last 12 topics (newest)
  const tail = nodes.slice(-12);
  for (const n of tail) {
    const fp = n.intentFingerprint || '(empty)';
    const fpDisplay = fp.length > 90 ? fp.slice(0,87) + '...' : fp;
    console.log(`${n.stableId.padEnd(6)} | "${n.title.slice(0,40).padEnd(40)}" | ${fpDisplay}`);
  }
  console.log(`---`);

  // Stats
  const empty = nodes.filter(n => !n.intentFingerprint || n.intentFingerprint.length === 0).length;
  const present = nodes.length - empty;
  console.log(`With fingerprint: ${present}/${nodes.length}`);
  console.log(`Empty:            ${empty}/${nodes.length}`);

  if (present > 0) {
    const lens = nodes.filter(n => n.intentFingerprint).map(n => n.intentFingerprint.split(/\s+/).length);
    const min = Math.min(...lens);
    const max = Math.max(...lens);
    const avg = (lens.reduce((a,b)=>a+b,0)/lens.length).toFixed(1);
    console.log(`Fingerprint word counts: min=${min} max=${max} avg=${avg}  (V4 spec target: 5-15 words)`);
  }
}
main().finally(() => prisma.$disconnect());
