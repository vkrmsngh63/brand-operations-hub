import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { isPlatform } from '@/lib/shared-types/competition-scraping';
import type {
  CategoryDefault,
  CreateCategoryDefaultRequest,
} from '@/lib/shared-types/competition-scraping';
import { isCategoryVocabularyType } from '@/lib/competition-scraping/category-vocabulary';

// P-61 (2026-06-02-j) — server-side DEFAULT categories per (platform,
// content-type), project-scoped + shared. A row's presence = that
// (platform, vocabularyType, value) category is pinned as a default; the
// extension capture overlay surfaces defaults as a "★ Defaults" group.
//
//   GET    ?platform=<p>&type=<category-type>            → CategoryDefault[]
//   POST   { platform, vocabularyType, value }           → CategoryDefault (upsert)
//   DELETE ?platform=<p>&type=<category-type>&value=<v>  → { removed: boolean }
//
// W#2-scoped (verifyProjectWorkflowAuth) — mirrors the sibling categories
// route; defaults are a Competition Scraping concept keyed by platform.

const WORKFLOW = 'competition-scraping';

function toWire(row: {
  id: string;
  projectId: string;
  platform: string;
  vocabularyType: string;
  value: string;
  addedBy: string;
  addedAt: Date;
}): CategoryDefault {
  return {
    id: row.id,
    projectId: row.projectId,
    platform: row.platform as CategoryDefault['platform'],
    vocabularyType: row.vocabularyType as CategoryDefault['vocabularyType'],
    value: row.value,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
  };
}

function badRequest(req: NextRequest, message: string): NextResponse {
  return withCors(req, NextResponse.json({ error: message }, { status: 400 }));
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET — list the defaults for one (platform, content-type).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const platform = req.nextUrl.searchParams.get('platform');
  const type = req.nextUrl.searchParams.get('type');
  if (!isPlatform(platform)) {
    return badRequest(req, 'platform query parameter is required and must be a known platform');
  }
  if (!isCategoryVocabularyType(type)) {
    return badRequest(
      req,
      'type query parameter is required and must be a category vocabulary type (content-category | image-category | video-category)'
    );
  }

  try {
    const rows = await withRetry(() =>
      prisma.categoryDefault.findMany({
        where: { projectId, platform, vocabularyType: type },
        orderBy: { addedAt: 'asc' },
      })
    );
    return withCors(req, NextResponse.json(rows.map(toWire)));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/competition-scraping/category-defaults',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('GET competition-scraping category-defaults error:', error);
    return withCors(
      req,
      NextResponse.json({ error: 'Failed to load default categories' }, { status: 500 })
    );
  }
}

// POST — pin a category as a default (upsert; existing row returned on dup).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId, userId } = auth;

  let body: CreateCategoryDefaultRequest;
  try {
    body = (await req.json()) as CreateCategoryDefaultRequest;
  } catch {
    return badRequest(req, 'Request body must be valid JSON');
  }

  const { platform, vocabularyType, value } = body;
  if (!isPlatform(platform)) {
    return badRequest(req, 'platform is required and must be a known platform');
  }
  if (!isCategoryVocabularyType(vocabularyType)) {
    return badRequest(
      req,
      'vocabularyType is required and must be a category vocabulary type (content-category | image-category | video-category)'
    );
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return badRequest(req, 'value is required and must be non-empty');
  }
  const trimmed = value.trim();

  try {
    const created = await withRetry(() =>
      prisma.categoryDefault.create({
        data: { projectId, platform, vocabularyType, value: trimmed, addedBy: userId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json(toWire(created), { status: 201 }));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // Already a default — return the existing row (idempotent pin).
      try {
        const existing = await withRetry(() =>
          prisma.categoryDefault.findUnique({
            where: {
              projectId_platform_vocabularyType_value: {
                projectId,
                platform,
                vocabularyType,
                value: trimmed,
              },
            },
          })
        );
        if (existing) {
          return withCors(req, NextResponse.json(toWire(existing), { status: 200 }));
        }
      } catch {
        // fall through to 500
      }
    }
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/category-defaults',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('POST competition-scraping category-defaults error:', error);
    return withCors(
      req,
      NextResponse.json({ error: 'Failed to pin default category' }, { status: 500 })
    );
  }
}

// DELETE — un-pin a default (deleteMany so a missing row is a no-op).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  const platform = req.nextUrl.searchParams.get('platform');
  const type = req.nextUrl.searchParams.get('type');
  const value = req.nextUrl.searchParams.get('value');
  if (!isPlatform(platform)) {
    return badRequest(req, 'platform query parameter is required and must be a known platform');
  }
  if (!isCategoryVocabularyType(type)) {
    return badRequest(
      req,
      'type query parameter is required and must be a category vocabulary type'
    );
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return badRequest(req, 'value query parameter is required and must be non-empty');
  }

  try {
    const res = await withRetry(() =>
      prisma.categoryDefault.deleteMany({
        where: { projectId, platform, vocabularyType: type, value: value.trim() },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json({ removed: res.count > 0 }));
  } catch (error) {
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/category-defaults',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('DELETE competition-scraping category-defaults error:', error);
    return withCors(
      req,
      NextResponse.json({ error: 'Failed to remove default category' }, { status: 500 })
    );
  }
}
