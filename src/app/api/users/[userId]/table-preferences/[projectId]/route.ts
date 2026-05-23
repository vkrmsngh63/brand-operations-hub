import { NextRequest, NextResponse } from 'next/server';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';

// W#2 API — Per-user-per-project Competition Data table UI preferences.
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.3 + §C.1.
//
// One row per (userId, projectId) keyed by UserTablePreferences's
// @@unique([userId, projectId]). Stores column visibility / column widths /
// font size / row order / last-used sort to enable cross-device sync.
//
// P-46 Workstream 1 (2026-05-24) — 501 stub. Workstream 3 fills this in
// alongside the Competition Data table redesign.
//
// CONVENTION NOTE: The path `/api/users/[userId]/...` follows §A.3 literally.
// PLOS's convention elsewhere derives userId from auth context rather than
// the URL (see /api/extension-state — UserExtensionState row keyed by auth
// userId only). When Workstream 3 implements this route, enforce
// "auth.userId === params.userId" at the auth check OR refactor to
// /api/projects/[projectId]/competition-scraping/table-preferences (auth-
// derived userId). Surface this as a §B refinement candidate before the
// implementation lands.

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/users/[userId]/table-preferences/[projectId]
// Future contract: ReadUserTablePreferencesResponse. Returns the single
// preference row for this (userId, projectId); 404 if the user hasn't
// customized the table yet (client falls back to defaults).
export async function GET(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 3)' },
      { status: 501 }
    )
  );
}

// PUT /api/users/[userId]/table-preferences/[projectId]
// Future contract: WriteUserTablePreferencesRequest → row. Upsert semantics —
// creates the row on first save, updates fields on subsequent writes.
// Debounced ~500 ms client-side per §A.3 to avoid hammering on column
// resize-drag.
export async function PUT(req: NextRequest) {
  return withCors(
    req,
    NextResponse.json(
      { error: 'Not implemented (P-46 Workstream 3)' },
      { status: 501 }
    )
  );
}
