import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { deleteImage } from '@/lib/competition-storage';
import { deleteVideo } from '@/lib/competition-video-storage';
import {
  categoryFieldMapping,
  isCategoryVocabularyType,
} from '@/lib/competition-scraping/category-vocabulary';

// P-57 (2026-06-02-g) — category-label deletion for the W#2 competitor detail
// page. Categories are a project-level VocabularyEntry pool (content/image/
// video-category) whose string value tags capture rows. Director-chosen
// behavior (Rule 14f): "delete items too" — deleting a category deletes the
// VocabularyEntry AND every CapturedText/Image/Video in the project tagged
// with it (best-effort storage cleanup for images/videos), project-wide.
//
//   GET    ?type=<category-type>&value=<value>  → { count }  (for the confirm)
//   DELETE ?type=<category-type>&value=<value>  → { deletedItems }
//
// This lives under competition-scraping (not the generic /vocabulary route)
// because the cascade touches W#2 capture models — it needs the W#2
// projectWorkflow scope (verifyProjectWorkflowAuth), and the generic
// vocabulary route is cross-workflow + project-scoped by design.

const WORKFLOW = 'competition-scraping';

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

function readParams(
  req: NextRequest
): { type: string; value: string } | { error: NextResponse } {
  const type = req.nextUrl.searchParams.get('type');
  const value = req.nextUrl.searchParams.get('value');
  if (!isCategoryVocabularyType(type)) {
    return {
      error: NextResponse.json(
        {
          error:
            'type query parameter is required and must be a category vocabulary type (content-category | image-category | video-category)',
        },
        { status: 400 }
      ),
    };
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return {
      error: NextResponse.json(
        { error: 'value query parameter is required and must be non-empty' },
        { status: 400 }
      ),
    };
  }
  return { type, value };
}

// Count capture rows in this project's W#2 workflow tagged with the category
// value, by type. Explicit per-model branches (not dynamic access) keep this
// type-safe against the Prisma client.
async function countTagged(
  type: string,
  projectWorkflowId: string,
  value: string
): Promise<number> {
  const scope = { competitorUrl: { projectWorkflowId } };
  if (type === 'content-category') {
    return prisma.capturedText.count({
      where: { ...scope, contentCategory: value },
    });
  }
  if (type === 'image-category') {
    return prisma.capturedImage.count({
      where: { ...scope, imageCategory: value },
    });
  }
  return prisma.capturedVideo.count({
    where: { ...scope, videoCategory: value },
  });
}

// GET — usage count for the confirm dialog.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const parsed = readParams(req);
  if ('error' in parsed) return withCors(req, parsed.error);

  try {
    const count = await withRetry(() =>
      countTagged(parsed.type, projectWorkflowId, parsed.value)
    );
    return withCors(req, NextResponse.json({ count }));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/categories',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('GET competition-scraping categories (count) error:', error);
    return withCors(
      req,
      NextResponse.json({ error: 'Failed to count tagged items' }, { status: 500 })
    );
  }
}

// DELETE — cascade-delete the category label + every tagged capture row in
// the project (best-effort storage cleanup for images/videos), then delete
// the VocabularyEntry. Returns the number of capture rows deleted.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const parsed = readParams(req);
  if ('error' in parsed) return withCors(req, parsed.error);
  const { type, value } = parsed;
  const mapping = categoryFieldMapping(type)!; // type is a category type here

  const scope = { competitorUrl: { projectWorkflowId } };
  let deletedItems = 0;

  try {
    if (type === 'content-category') {
      const res = await withRetry(() =>
        prisma.capturedText.deleteMany({
          where: { ...scope, contentCategory: value },
        })
      );
      deletedItems = res.count;
    } else if (type === 'image-category') {
      // Fetch storage paths first so the rows' files can be swept after the
      // DB delete. The DB delete is authoritative; storage cleanup is
      // best-effort (orphans get swept by the daily janitor on failure).
      const rows = await withRetry(() =>
        prisma.capturedImage.findMany({
          where: { ...scope, imageCategory: value },
          select: { id: true, storagePath: true },
        })
      );
      const res = await withRetry(() =>
        prisma.capturedImage.deleteMany({
          where: { ...scope, imageCategory: value },
        })
      );
      deletedItems = res.count;
      for (const row of rows) {
        try {
          await deleteImage(row.storagePath);
        } catch (storageErr) {
          recordFlake(
            'DELETE /api/projects/[projectId]/competition-scraping/categories (image storage)',
            storageErr,
            { projectWorkflowId }
          );
          console.error(
            'Category cascade image storage cleanup failed (janitor will sweep; storagePath=' +
              (row.storagePath ?? '<null>') +
              '):',
            storageErr
          );
        }
      }
    } else {
      // video-category
      const rows = await withRetry(() =>
        prisma.capturedVideo.findMany({
          where: { ...scope, videoCategory: value },
          select: { id: true, storagePath: true, thumbnailStoragePath: true },
        })
      );
      const res = await withRetry(() =>
        prisma.capturedVideo.deleteMany({
          where: { ...scope, videoCategory: value },
        })
      );
      deletedItems = res.count;
      for (const row of rows) {
        try {
          await deleteVideo({
            videoStoragePath: row.storagePath,
            thumbnailStoragePath: row.thumbnailStoragePath,
          });
        } catch (storageErr) {
          recordFlake(
            'DELETE /api/projects/[projectId]/competition-scraping/categories (video storage)',
            storageErr,
            { projectWorkflowId }
          );
          console.error(
            'Category cascade video storage cleanup failed (janitor will sweep; storagePath=' +
              (row.storagePath ?? '<null>') +
              '):',
            storageErr
          );
        }
      }
    }

    // Delete the project-level vocabulary entry last. deleteMany (not delete)
    // so a missing/already-removed row is a no-op rather than a P2025 throw.
    await withRetry(() =>
      prisma.vocabularyEntry.deleteMany({
        where: { projectId, vocabularyType: type, value },
      })
    );
  } catch (error) {
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/categories',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('DELETE competition-scraping categories error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: `Failed to delete ${mapping.noun} category` },
        { status: 500 }
      )
    );
  }

  await markWorkflowActive(projectId, WORKFLOW);
  return withCors(req, NextResponse.json({ deletedItems }));
}
