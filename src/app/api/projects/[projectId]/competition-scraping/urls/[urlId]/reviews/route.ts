import { NextRequest, NextResponse } from 'next/server';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';

// W#2 API — captured reviews (collection routes).
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.1b + §C.1.
//
// P-46 Workstream 1 (2026-05-24) — 501 stub. Workstream 2 fills this in
// alongside the URL detail page's Captured Reviews box implementation.
// Schema landed via prisma db push under Rule 9 gate this session;
// Prisma client knows about prisma.capturedReview as of the migration.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
// Future contract: ListCapturedReviewsResponse — array of CapturedReview rows
// for one CompetitorUrl, ordered by (sortOrder ASC, addedAt ASC). Stubbed
// pending Workstream 2's review list UI.
export async function GET(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 2)' },
      { status: 501 }
    )
  );
}

// POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
// Future contract: CreateCapturedReviewRequest → CapturedReview. Idempotent
// on clientId per the captured-* convention. v1 source defaults to 'manual'
// (vklf.com-side manual entry); future per-platform extension capture adds
// other source values per §A.1.
export async function POST(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 2)' },
      { status: 501 }
    )
  );
}
