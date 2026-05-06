import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  isVocabularyType,
  type CreateVocabularyEntryRequest,
  type VocabularyEntry as VocabularyEntryWire,
} from '@/lib/shared-types/competition-scraping';

// Project-scoped vocabulary entries — the cross-workflow shared vocabulary
// surface declared in PLATFORM_REQUIREMENTS.md §8.4 and detailed in
// docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1 + §9.1.
//
// Project-scoped, NOT workflow-scoped: any workflow on the same Project
// can READ and ADD entries. The route therefore uses verifyProjectAuth,
// not verifyProjectWorkflowAuth — there's no single workflow context the
// route can stamp as "active." The calling workflow's own routes
// (e.g. competition-scraping/urls POST) handle their own activity stamps.

const DEFAULT_ADDED_BY_WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.vocabularyEntry.findUnique>>
): VocabularyEntryWire | null {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.projectId,
    vocabularyType: row.vocabularyType as VocabularyEntryWire['vocabularyType'],
    value: row.value,
    addedByWorkflow: row.addedByWorkflow,
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
  };
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/vocabulary?type=...
// Required: ?type=<VocabularyType>. Returns rows for that type ordered by
// when they were added (oldest first — matches the user-visible "history of
// what's been used" reading).
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return withCors(req, auth.error);

  const typeParam = req.nextUrl.searchParams.get('type');
  if (!isVocabularyType(typeParam)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'type query parameter is required and must be a known vocabulary type' },
        { status: 400 }
      )
    );
  }

  try {
    const rows = await withRetry(() =>
      prisma.vocabularyEntry.findMany({
        where: { projectId, vocabularyType: typeParam },
        orderBy: { addedAt: 'asc' },
      })
    );
    const wire = rows.map((r) => toWireShape(r)!);
    return withCors(req, NextResponse.json(wire));
  } catch (error) {
    recordFlake('GET /api/projects/[projectId]/vocabulary', error, {});
    console.error('GET vocabulary error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch vocabulary entries' },
        { status: 500 }
      )
    );
  }
}

// POST /api/projects/[projectId]/vocabulary
// Body: CreateVocabularyEntryRequest. Upsert per §11.1 — no error on
// duplicate; existing row returned. addedByWorkflow defaults to
// "competition-scraping" since W#2 is the first declarer (other workflows
// adopting the vocabulary later pass their own slug).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return withCors(req, auth.error);
  const { userId } = auth;

  let body: Partial<CreateVocabularyEntryRequest>;
  try {
    body = (await req.json()) as Partial<CreateVocabularyEntryRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  if (!isVocabularyType(body.vocabularyType)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'vocabularyType is required and must be a known vocabulary type' },
        { status: 400 }
      )
    );
  }
  const value = typeof body.value === 'string' ? body.value.trim() : '';
  if (!value) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'value is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }
  const addedByWorkflow =
    typeof body.addedByWorkflow === 'string' && body.addedByWorkflow.trim()
      ? body.addedByWorkflow.trim()
      : DEFAULT_ADDED_BY_WORKFLOW;
  const vocabularyType = body.vocabularyType;

  // Try create; on unique-constraint collision return the existing row.
  // We avoid prisma.vocabularyEntry.upsert because upsert would let an
  // empty `update: {}` block allow blanks but we still want the existing
  // addedBy / addedByWorkflow / addedAt preserved verbatim, which is what
  // a no-op update gives. The two patterns are equivalent in this case;
  // create-then-catch is one fewer round-trip in the common-success path.
  try {
    const created = await withRetry(() =>
      prisma.vocabularyEntry.create({
        data: {
          projectId,
          vocabularyType,
          value,
          addedByWorkflow,
          addedBy: userId,
        },
      })
    );
    return withCors(
      req,
      NextResponse.json(toWireShape(created), { status: 201 })
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      try {
        const existing = await withRetry(() =>
          prisma.vocabularyEntry.findUnique({
            where: {
              projectId_vocabularyType_value: {
                projectId,
                vocabularyType,
                value,
              },
            },
          })
        );
        if (existing) {
          return withCors(
            req,
            NextResponse.json(toWireShape(existing), { status: 200 })
          );
        }
      } catch (lookupError) {
        recordFlake(
          'POST /api/projects/[projectId]/vocabulary (idempotent-lookup)',
          lookupError,
          { retried: true }
        );
      }
    }
    recordFlake('POST /api/projects/[projectId]/vocabulary', error, {
      retried: true,
    });
    console.error('POST vocabulary error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create vocabulary entry' },
        { status: 500 }
      )
    );
  }
}
