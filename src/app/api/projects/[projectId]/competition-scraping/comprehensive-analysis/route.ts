import { NextRequest, NextResponse } from 'next/server';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';

// W#2 API — Comprehensive Competitor Analysis (per-Project rich-text doc).
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.4 + §C.1.
//
// One row per Project (ComprehensiveCompetitorAnalysis.projectId is @unique).
// Holds the TipTap document JSON for the per-Project Comprehensive Analysis
// page (Workstream 4 builds the page that edits this row).
//
// P-46 Workstream 1 (2026-05-24) — 501 stub. Workstream 4 fills this in.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/projects/[projectId]/competition-scraping/comprehensive-analysis
// Future contract: ReadComprehensiveCompetitorAnalysisResponse. Returns the
// single row for the Project; 404 if the user hasn't started editing yet
// (no row exists; client should render the empty-state editor).
export async function GET(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 4)' },
      { status: 501 }
    )
  );
}

// PUT /api/projects/[projectId]/competition-scraping/comprehensive-analysis
// Future contract: WriteComprehensiveCompetitorAnalysisRequest → row. Upsert
// semantics — creates the row on first write, updates contentJson +
// lastEditedBy + lastEditedAt on subsequent writes.
export async function PUT(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 4)' },
      { status: 501 }
    )
  );
}
