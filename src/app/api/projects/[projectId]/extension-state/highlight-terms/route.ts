import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import type {
  HighlightTermDto,
  ListHighlightTermsResponse,
  ReplaceHighlightTermsRequest,
  ReplaceHighlightTermsResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 P-3 (narrowed) — per-user-per-project Highlight Terms server-side.
//
// Spec: docs/COMPETITION_SCRAPING_DESIGN.md §B 2026-05-10 entry +
// docs/ROADMAP.md W#2 polish backlog P-3.
//
// Auth: verifyProjectAuth (NOT verifyProjectWorkflowAuth) — Highlight Terms
// are user+Project scoped, not workflow scoped. The (userId, projectId,
// term) unique constraint is enforced at the schema layer.
//
// PUT semantics: replace-the-whole-list. The body's `terms` array is the
// new state; prior rows for (userId, projectId) are deleted and the
// request's terms are inserted in array order (sortOrder = index).
// Idempotent — same body produces same end state. Wrapped in a single
// $transaction so a partial-write cannot happen; the request either
// fully succeeds or the prior state is preserved.

const MAX_TERM_LENGTH = 200;
const MAX_TERMS_PER_LIST = 100;
const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

function isHighlightTermDto(value: unknown): value is HighlightTermDto {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as { term?: unknown; color?: unknown };
  if (typeof v.term !== 'string') return false;
  if (typeof v.color !== 'string') return false;
  const trimmed = v.term.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_TERM_LENGTH) return false;
  if (!HEX_COLOR_RE.test(v.color)) return false;
  return true;
}

// OPTIONS — CORS preflight. Extension hits this before PUT.
export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/extension-state/highlight-terms
// Returns the user's Highlight Terms for this Project, ordered by sortOrder.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return withCors(req, auth.error);
  const { userId } = auth;

  try {
    const rows = await withRetry(() =>
      prisma.userProjectHighlightTerm.findMany({
        where: { userId, projectId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { term: true, color: true },
      })
    );
    const body: ListHighlightTermsResponse = {
      terms: rows.map((r) => ({ term: r.term, color: r.color })),
    };
    return withCors(req, NextResponse.json(body));
  } catch (error) {
    recordFlake(
      'GET /api/projects/[projectId]/extension-state/highlight-terms',
      error
    );
    console.error('GET highlight-terms error:', error, { userId, projectId });
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch highlight terms' },
        { status: 500 }
      )
    );
  }
}

// PUT /api/projects/[projectId]/extension-state/highlight-terms
// Body: ReplaceHighlightTermsRequest. Replaces the whole list atomically.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = await verifyProjectAuth(req, projectId);
  if (auth.error) return withCors(req, auth.error);
  const { userId } = auth;

  let body: Partial<ReplaceHighlightTermsRequest>;
  try {
    body = (await req.json()) as Partial<ReplaceHighlightTermsRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  if (!Array.isArray(body.terms)) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'terms must be an array' },
        { status: 400 }
      )
    );
  }
  if (body.terms.length > MAX_TERMS_PER_LIST) {
    return withCors(
      req,
      NextResponse.json(
        { error: `terms array exceeds maximum of ${MAX_TERMS_PER_LIST}` },
        { status: 400 }
      )
    );
  }

  // Validate every entry; reject the whole request if any is malformed.
  // Trim term strings — case-sensitive uniqueness is enforced by the schema
  // unique constraint, but we trim whitespace before that check.
  const dtos: HighlightTermDto[] = [];
  const seenTerms = new Set<string>();
  for (const item of body.terms) {
    if (!isHighlightTermDto(item)) {
      return withCors(
        req,
        NextResponse.json(
          {
            error:
              'Each term must be { term: non-empty string ≤200 chars, color: 7-char hex like #aabbcc }',
          },
          { status: 400 }
        )
      );
    }
    const trimmed = item.term.trim();
    // Reject duplicate terms (case-sensitive) within the same request body
    // to surface the conflict before the unique-constraint trips.
    if (seenTerms.has(trimmed)) {
      return withCors(
        req,
        NextResponse.json(
          { error: `Duplicate term in request: "${trimmed}"` },
          { status: 400 }
        )
      );
    }
    seenTerms.add(trimmed);
    dtos.push({ term: trimmed, color: item.color });
  }

  try {
    await withRetry(() =>
      prisma.$transaction(async (tx) => {
        await tx.userProjectHighlightTerm.deleteMany({
          where: { userId, projectId },
        });
        if (dtos.length > 0) {
          await tx.userProjectHighlightTerm.createMany({
            data: dtos.map((dto, index) => ({
              userId,
              projectId,
              term: dto.term,
              color: dto.color,
              sortOrder: index,
            })),
          });
        }
      })
    );

    // Return the canonical post-write state (re-read so the client
    // receives the server's view rather than echoing back the request).
    const rows = await withRetry(() =>
      prisma.userProjectHighlightTerm.findMany({
        where: { userId, projectId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { term: true, color: true },
      })
    );
    const responseBody: ReplaceHighlightTermsResponse = {
      terms: rows.map((r) => ({ term: r.term, color: r.color })),
    };
    return withCors(req, NextResponse.json(responseBody));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Duplicate term constraint hit unexpectedly' },
          { status: 409 }
        )
      );
    }
    recordFlake(
      'PUT /api/projects/[projectId]/extension-state/highlight-terms',
      error,
      { retried: true }
    );
    console.error('PUT highlight-terms error:', error, { userId, projectId });
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to replace highlight terms' },
        { status: 500 }
      )
    );
  }
}
