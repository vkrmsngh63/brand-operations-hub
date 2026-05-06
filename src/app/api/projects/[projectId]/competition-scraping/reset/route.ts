import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { wipeProjectImages } from '@/lib/competition-storage';

// W#2 admin reset endpoint.
//
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1 + §9.3 + the
// design doc §A.11. Behind a "type the project name" guard.
//
// Effect (in this exact order):
//   1. DB transaction:
//      a. Delete the W#2 ProjectWorkflow row — cascades CompetitorUrl,
//         CompetitorSize, CapturedText, CapturedImage.
//      b. Delete VocabularyEntry rows where addedByWorkflow="competition-
//         scraping". Vocabularies that other workflows added entries to
//         on the same Project are preserved per §A.11 + PLATFORM_
//         REQUIREMENTS.md §8.4.
//   2. After DB success: storage wipe via wipeProjectImages — removes all
//      files in `competition-scraping/{projectId}/`.
//
// Order rationale: DB first (transactional, atomic) then storage. If the
// storage wipe fails after DB success, the daily janitor cron at /api/
// cron/competition-scraping-janitor cleans up the leftover storage files
// (no DB rows reference them, so they classify as orphans on the next
// run). Going the other direction would briefly leave DB rows pointing at
// deleted files = broken thumbnails until cleanup. The retry path is
// safe either way: re-running reset against an already-empty DB is a
// no-op (the ProjectWorkflow delete catches P2025), and the storage wipe
// re-attempts cleanly.
//
// Auth: verifyProjectAuth — Project ownership is the admin gate in Phase 1
// (project.userId === auth.userId; only the director owns Projects). Phase
// 2 will introduce WorkerAssignment + role checks; this endpoint stays
// admin-only via the same ownership predicate (workers don't own Projects;
// admin does).
//
// CORS: not needed — this endpoint is called only by the PLOS web app
// (per §11.1 "PLOS web only"). Same-origin requests don't require a
// preflight handler.

const WORKFLOW = 'competition-scraping';

interface ResetRequest {
  confirmProjectName: string;
}

interface ResetResponse {
  success: true;
  projectWorkflowDeleted: boolean;
  vocabularyEntriesRemoved: number;
  storageFilesDeleted: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return auth.error;

  let body: Partial<ResetRequest>;
  try {
    body = (await req.json()) as Partial<ResetRequest>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supplied =
    typeof body.confirmProjectName === 'string'
      ? body.confirmProjectName
      : null;
  if (supplied === null) {
    return NextResponse.json(
      { error: 'confirmProjectName is required' },
      { status: 400 }
    );
  }

  // Look up the actual Project name. verifyProjectAuth already confirmed
  // ownership, but the Project row was projected (only userId selected),
  // so we re-fetch the name for the guard comparison. Wrapped in
  // withRetry per the silent-helper rate-fix pattern.
  let project: { name: string } | null;
  try {
    project = await withRetry(() =>
      prisma.project.findUnique({
        where: { id: projectId },
        select: { name: true },
      })
    );
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/reset (project lookup)',
      error,
      { retried: true }
    );
    console.error('POST competition-scraping reset project-lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to load Project for reset confirmation' },
      { status: 500 }
    );
  }
  if (!project) {
    // Race: Project was deleted between verifyProjectAuth and this
    // findUnique. Treat as 404 — there's nothing left to reset.
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Strict equality after trimming both sides — defends against leading/
  // trailing whitespace from the typed input but doesn't accept partial
  // or near-match. The dialog component already does the same client-side
  // check; re-checking on the server is defense-in-depth.
  if (supplied.trim() !== project.name.trim()) {
    return NextResponse.json(
      {
        error:
          'confirmProjectName does not match the Project name. Reset aborted; no data was changed.',
      },
      { status: 400 }
    );
  }

  // ─── Step 1: DB wipe ────────────────────────────────────────────────
  let projectWorkflowDeleted = false;
  let vocabularyEntriesRemoved = 0;
  try {
    const result = await withRetry(() =>
      prisma.$transaction(async (tx) => {
        let pwDeleted = false;
        try {
          await tx.projectWorkflow.delete({
            where: { projectId_workflow: { projectId, workflow: WORKFLOW } },
          });
          pwDeleted = true;
        } catch (err) {
          // P2025 = "An operation failed because it depends on one or more
          // records that were required but not found." Means there's no
          // W#2 ProjectWorkflow row for this Project — fine; the user may
          // be re-running reset on already-empty data. Treat as success
          // with deleted=false. Any other error propagates.
          if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2025'
          ) {
            pwDeleted = false;
          } else {
            throw err;
          }
        }

        // Delete W#2-originated vocabulary entries. Other workflows'
        // entries on the same Project are preserved per §A.11.
        const vocabResult = await tx.vocabularyEntry.deleteMany({
          where: { projectId, addedByWorkflow: WORKFLOW },
        });

        return {
          projectWorkflowDeleted: pwDeleted,
          vocabularyEntriesRemoved: vocabResult.count,
        };
      })
    );
    projectWorkflowDeleted = result.projectWorkflowDeleted;
    vocabularyEntriesRemoved = result.vocabularyEntriesRemoved;
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/reset (db wipe)',
      error,
      { retried: true }
    );
    console.error('POST competition-scraping reset db-wipe error:', error);
    return NextResponse.json(
      { error: 'Failed to wipe W#2 database rows. No data was changed.' },
      { status: 500 }
    );
  }

  // ─── Step 2: Storage wipe ───────────────────────────────────────────
  // Outside the transaction. If this fails after the DB wipe succeeded,
  // the daily janitor will catch the orphans on the next run. We surface
  // the failure as a 500 with an explicit message so the UI shows it; a
  // retry triggers a no-op DB wipe + a fresh storage attempt.
  let storageFilesDeleted: number;
  try {
    const result = await wipeProjectImages(projectId);
    storageFilesDeleted = result.deletedCount;
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/reset (storage wipe)',
      error
    );
    console.error('POST competition-scraping reset storage-wipe error:', error);
    return NextResponse.json(
      {
        error:
          'Database wiped successfully, but some storage files could not be removed. The daily janitor will clean them up automatically — or click Reset again to retry.',
      },
      { status: 500 }
    );
  }

  const response: ResetResponse = {
    success: true,
    projectWorkflowDeleted,
    vocabularyEntriesRemoved,
    storageFilesDeleted,
  };
  return NextResponse.json(response);
}
