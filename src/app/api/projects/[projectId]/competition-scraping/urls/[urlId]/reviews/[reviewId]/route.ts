import { NextRequest, NextResponse } from 'next/server';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';

// W#2 API — captured reviews (per-row routes).
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.1b + §C.1.
//
// P-46 Workstream 1 (2026-05-24) — 501 stub. Workstream 2 fills this in.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// PATCH /api/.../urls/[urlId]/reviews/[reviewId]
// Future contract: UpdateCapturedReviewRequest → CapturedReview. clientId is
// immutable per the captured-* convention.
export async function PATCH(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 2)' },
      { status: 501 }
    )
  );
}

// DELETE /api/.../urls/[urlId]/reviews/[reviewId]
// Future contract: DeleteCapturedReviewResponse — `{ success: true }`.
// Idempotent on already-deleted rows (mirrors text/image/video DELETE).
export async function DELETE(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 2)' },
      { status: 501 }
    )
  );
}
