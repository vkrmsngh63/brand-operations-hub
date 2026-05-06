import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { markWorkflowActive } from '@/lib/workflow-status';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import type {
  CompetitorSize,
  UpdateCompetitorSizeRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — competitor sizes (per-row PATCH + DELETE).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.

const WORKFLOW = 'competition-scraping';

function toWireShape(
  row: Awaited<ReturnType<typeof prisma.competitorSize.findUnique>>
): CompetitorSize | null {
  if (!row) return null;
  return {
    id: row.id,
    competitorUrlId: row.competitorUrlId,
    sizeOption: row.sizeOption,
    price: row.price === null ? null : row.price.toString(),
    shippingCost: row.shippingCost === null ? null : row.shippingCost.toString(),
    customFields: (row.customFields ?? {}) as Record<string, unknown>,
    sortOrder: row.sortOrder,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

class InvalidPriceError extends Error {
  constructor(public field: string) {
    super(`${field} must be a number, numeric string, or null`);
  }
}

function normalizePrice(
  value: unknown,
  field: 'price' | 'shippingCost'
): Prisma.Decimal | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new InvalidPriceError(field);
    return new Prisma.Decimal(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return new Prisma.Decimal(trimmed);
    } catch {
      throw new InvalidPriceError(field);
    }
  }
  throw new InvalidPriceError(field);
}

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// PATCH /api/projects/[projectId]/competition-scraping/sizes/[sizeId]
// Partial update — any subset of CreateCompetitorSizeRequest's fields.
// The two-step ownership check (findFirst then update) ensures the
// sizeId belongs to a CompetitorUrl in this Project's W#2 workflow before
// any mutation runs.
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; sizeId: string }>;
  }
) {
  const { projectId, sizeId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: UpdateCompetitorSizeRequest;
  try {
    body = (await req.json()) as UpdateCompetitorSizeRequest;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  // Ownership check via the parent relation. findFirst with the relation
  // filter returns null if the sizeId doesn't exist OR belongs to another
  // Project's W#2 workflow — both cases surface as 404, matching the
  // intentional security posture of not leaking resource existence.
  const owned = await withRetry(() =>
    prisma.competitorSize.findFirst({
      where: {
        id: sizeId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Competitor size not found' },
        { status: 404 }
      )
    );
  }

  const data: Prisma.CompetitorSizeUncheckedUpdateInput = {};

  if (body.sizeOption !== undefined) {
    const trimmed = typeof body.sizeOption === 'string' ? body.sizeOption.trim() : '';
    if (!trimmed) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'sizeOption must be a non-empty string' },
          { status: 400 }
        )
      );
    }
    data.sizeOption = trimmed;
  }
  if (body.price !== undefined) {
    try {
      data.price = normalizePrice(body.price, 'price');
    } catch (error) {
      if (error instanceof InvalidPriceError) {
        return withCors(
          req,
          NextResponse.json({ error: error.message }, { status: 400 })
        );
      }
      throw error;
    }
  }
  if (body.shippingCost !== undefined) {
    try {
      data.shippingCost = normalizePrice(body.shippingCost, 'shippingCost');
    } catch (error) {
      if (error instanceof InvalidPriceError) {
        return withCors(
          req,
          NextResponse.json({ error: error.message }, { status: 400 })
        );
      }
      throw error;
    }
  }
  if (body.customFields !== undefined) {
    data.customFields =
      body.customFields && typeof body.customFields === 'object'
        ? (body.customFields as Prisma.InputJsonValue)
        : Prisma.JsonNull;
  }
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder)) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'sortOrder must be a number' },
          { status: 400 }
        )
      );
    }
    data.sortOrder = body.sortOrder;
  }

  try {
    const updated = await withRetry(() =>
      prisma.competitorSize.update({
        where: { id: sizeId },
        data,
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json(toWireShape(updated)));
  } catch (error) {
    // P2025 — record was deleted between the ownership-check findFirst and
    // the update (rare race). Treat as 404 for caller simplicity.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'Competitor size not found' },
          { status: 404 }
        )
      );
    }
    recordFlake(
      'PATCH /api/projects/[projectId]/competition-scraping/sizes/[sizeId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('PATCH competition-scraping size error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to update competitor size' },
        { status: 500 }
      )
    );
  }
}

// DELETE /api/projects/[projectId]/competition-scraping/sizes/[sizeId]
// Idempotent — already-deleted returns success.
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; sizeId: string }>;
  }
) {
  const { projectId, sizeId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  // Ownership check before delete — same pattern as PATCH.
  const owned = await withRetry(() =>
    prisma.competitorSize.findFirst({
      where: {
        id: sizeId,
        competitorUrl: { projectWorkflowId },
      },
      select: { id: true },
    })
  );
  if (!owned) {
    // Idempotent semantics: caller can't tell whether the row never
    // existed, was already deleted, or belongs to someone else. Same
    // 200 success regardless — matches urls/[urlId]/route.ts DELETE.
    return withCors(req, NextResponse.json({ success: true }));
  }

  try {
    await withRetry(() =>
      prisma.competitorSize.delete({
        where: { id: sizeId },
      })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(req, NextResponse.json({ success: true }));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return withCors(req, NextResponse.json({ success: true }));
    }
    recordFlake(
      'DELETE /api/projects/[projectId]/competition-scraping/sizes/[sizeId]',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('DELETE competition-scraping size error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to delete competitor size' },
        { status: 500 }
      )
    );
  }
}
