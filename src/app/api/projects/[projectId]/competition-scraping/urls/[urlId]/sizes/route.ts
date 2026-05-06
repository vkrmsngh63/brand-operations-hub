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
  CreateCompetitorSizeRequest,
} from '@/lib/shared-types/competition-scraping';

// W#2 API — competitor sizes (collection routes).
// Spec: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1.
// Sibling file ../../sizes/[sizeId]/route.ts handles per-row PATCH + DELETE.
//
// Cross-cutting items per §11.2 — same shape as urls/route.ts. No
// idempotency layer per §9.2 — sizes are explicit user actions; rare to
// retry without realizing.

const WORKFLOW = 'competition-scraping';

// Helper: serialize Prisma's CompetitorSize row to the wire shape declared
// in shared-types. price/shippingCost are Decimal columns; Decimal serializes
// to string via toJSON; we coerce explicitly here so the wire type is
// consistent regardless of NextResponse.json behavior.
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

// Helper: validate + normalize a price-shaped input. Accepts number or
// string from the wire, returns a Prisma.Decimal. Returns undefined for
// undefined input (pass-through) and null for explicit null clearing.
// Throws a typed Error on invalid shapes so the caller can surface 400.
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

// POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/sizes
// Body: CreateCompetitorSizeRequest. Required: sizeOption. Other fields
// optional. The route enforces that the urlId belongs to the Project's
// W#2 workflow before creating — defense against forged URL paths.
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; urlId: string }>;
  }
) {
  const { projectId, urlId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: Partial<CreateCompetitorSizeRequest>;
  try {
    body = (await req.json()) as Partial<CreateCompetitorSizeRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const sizeOption =
    typeof body.sizeOption === 'string' ? body.sizeOption.trim() : '';
  if (!sizeOption) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'sizeOption is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2 workflow
  // before creating the size. Without this check, a forged urlId in the
  // path would let a caller insert sizes under another project's URL.
  const parent = await withRetry(() =>
    prisma.competitorUrl.findFirst({
      where: { id: urlId, projectWorkflowId },
      select: { id: true },
    })
  );
  if (!parent) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'Competitor URL not found' },
        { status: 404 }
      )
    );
  }

  let price: Prisma.Decimal | null | undefined;
  let shippingCost: Prisma.Decimal | null | undefined;
  try {
    price = normalizePrice(body.price, 'price');
    shippingCost = normalizePrice(body.shippingCost, 'shippingCost');
  } catch (error) {
    if (error instanceof InvalidPriceError) {
      return withCors(
        req,
        NextResponse.json({ error: error.message }, { status: 400 })
      );
    }
    throw error;
  }

  const createData: Prisma.CompetitorSizeUncheckedCreateInput = {
    competitorUrlId: urlId,
    sizeOption,
    price: price ?? null,
    shippingCost: shippingCost ?? null,
    customFields:
      body.customFields && typeof body.customFields === 'object'
        ? (body.customFields as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
  };

  try {
    const created = await withRetry(() =>
      prisma.competitorSize.create({ data: createData })
    );
    await markWorkflowActive(projectId, WORKFLOW);
    return withCors(
      req,
      NextResponse.json(toWireShape(created), { status: 201 })
    );
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/sizes',
      error,
      { retried: true, projectWorkflowId }
    );
    console.error('POST competition-scraping size error:', error);
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to create competitor size' },
        { status: 500 }
      )
    );
  }
}
