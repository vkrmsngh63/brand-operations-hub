import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import { isPlatform } from '@/lib/shared-types/competition-scraping';
import type {
  GetExtensionStateResponse,
  ReplaceExtensionStateRequest,
  ReplaceExtensionStateResponse,
} from '@/lib/shared-types/competition-scraping';

// W#2 P-3 (broader scope) — per-user W#2 Chrome extension state moved
// from chrome.storage.local-only to PLOS DB. Closes the broader-P-3
// scope left open after Highlight Terms shipped 2026-05-10.
//
// Spec: docs/COMPETITION_SCRAPING_DESIGN.md §B 2026-05-10-e entry +
// docs/ROADMAP.md W#2 polish backlog P-3 entry "REMAINING P-3 scope".
//
// Auth: verifyAuth (NOT verifyProjectAuth) — this is user-scoped state,
// not project-scoped. selectedProjectId is itself the projectId; there's
// no parent project for it. When the request body's selectedProjectId
// is non-null, we additionally verify the user owns that project — this
// prevents a malicious or buggy client from saving someone else's id.
//
// PUT semantics: replace-the-whole-state. Body is the new state; both
// fields explicit (null = clear). The "switching project clears
// platform" invariant from chrome.storage.local (popup-state.ts:73) is
// enforced server-side too: if the request's selectedProjectId differs
// from the current row's, selectedPlatform is auto-cleared on the same
// upsert regardless of what the request body said. Defense in depth —
// the extension client also clears locally for instant UI response, but
// the server is the authority.
//
// Stale-pointer policy on GET: if the saved selectedProjectId no longer
// points to a project the user owns (project deleted), we silently
// return null for it — the popup falls back to "no project selected"
// gracefully. We do NOT auto-write a cleared row from a GET; the
// extension client clears its cache when it sees the null.

const PROJECT_ID_MAX_LENGTH = 100; // uuid-shaped strings are 36 chars; allow margin for safety
const PLATFORM_MAX_LENGTH = 50;

// OPTIONS — CORS preflight. Extension hits this before PUT.
export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// GET /api/extension-state
// Returns the user's saved extension state. Both fields nullable.
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return withCors(req, auth.error);
  const { userId } = auth;

  try {
    const row = await withRetry(() =>
      prisma.userExtensionState.findUnique({
        where: { userId },
        select: { selectedProjectId: true, selectedPlatform: true },
      })
    );

    let selectedProjectId: string | null = row?.selectedProjectId ?? null;
    const selectedPlatform: string | null = row?.selectedPlatform ?? null;

    // Stale-pointer cleanup: if the saved projectId no longer points to a
    // project the user owns, silently return null. The popup's first save
    // will overwrite the row.
    if (selectedProjectId !== null) {
      const project = await withRetry(() =>
        prisma.project.findUnique({
          where: { id: selectedProjectId as string },
          select: { userId: true },
        })
      );
      if (!project || project.userId !== userId) {
        selectedProjectId = null;
      }
    }

    const body: GetExtensionStateResponse = {
      selectedProjectId,
      selectedPlatform,
    };
    return withCors(req, NextResponse.json(body));
  } catch (error) {
    recordFlake('GET /api/extension-state', error);
    console.error('GET extension-state error:', error, { userId });
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to fetch extension state' },
        { status: 500 }
      )
    );
  }
}

// PUT /api/extension-state
// Body: ReplaceExtensionStateRequest. Replaces the whole state atomically.
export async function PUT(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return withCors(req, auth.error);
  const { userId } = auth;

  let body: Partial<ReplaceExtensionStateRequest>;
  try {
    body = (await req.json()) as Partial<ReplaceExtensionStateRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  // Both fields are required in the body and must be string-or-null.
  // The popup always sends both — partial-update isn't supported (mirrors
  // PUT-replace semantics from the Highlight Terms route).
  if (!('selectedProjectId' in body) || !('selectedPlatform' in body)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'Body must include both selectedProjectId and selectedPlatform (use null to clear)',
        },
        { status: 400 }
      )
    );
  }

  const rawProjectId = body.selectedProjectId;
  const rawPlatform = body.selectedPlatform;

  if (rawProjectId !== null && typeof rawProjectId !== 'string') {
    return withCors(
      req,
      NextResponse.json(
        { error: 'selectedProjectId must be a string or null' },
        { status: 400 }
      )
    );
  }
  if (rawPlatform !== null && typeof rawPlatform !== 'string') {
    return withCors(
      req,
      NextResponse.json(
        { error: 'selectedPlatform must be a string or null' },
        { status: 400 }
      )
    );
  }
  if (rawProjectId !== null && rawProjectId.length > PROJECT_ID_MAX_LENGTH) {
    return withCors(
      req,
      NextResponse.json(
        { error: `selectedProjectId exceeds ${PROJECT_ID_MAX_LENGTH} chars` },
        { status: 400 }
      )
    );
  }
  if (rawPlatform !== null && rawPlatform.length > PLATFORM_MAX_LENGTH) {
    return withCors(
      req,
      NextResponse.json(
        { error: `selectedPlatform exceeds ${PLATFORM_MAX_LENGTH} chars` },
        { status: 400 }
      )
    );
  }
  if (rawPlatform !== null && !isPlatform(rawPlatform)) {
    return withCors(
      req,
      NextResponse.json(
        { error: `selectedPlatform must be one of the known platforms` },
        { status: 400 }
      )
    );
  }

  // If a non-null projectId is being set, verify the user owns it. Prevents
  // a malicious / buggy client from saving someone else's id.
  if (rawProjectId !== null) {
    const project = await withRetry(() =>
      prisma.project.findUnique({
        where: { id: rawProjectId },
        select: { userId: true },
      })
    );
    if (!project) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'selectedProjectId does not refer to an existing project' },
          { status: 404 }
        )
      );
    }
    if (project.userId !== userId) {
      return withCors(
        req,
        NextResponse.json(
          { error: 'selectedProjectId refers to a project you do not own' },
          { status: 403 }
        )
      );
    }
  }

  // Server-side enforcement of the "switching project clears platform"
  // invariant. Mirrors today's chrome.storage.local rule (popup-state.ts):
  //   - if incoming.projectId is null → force platform null (no project = no platform)
  //   - else if prior.projectId is non-null AND differs from incoming → force platform null
  //   - else → trust the request body
  // The migration case (server empty, cache has {project, platform}) goes
  // through the third branch — prior is null, so there's no "switch" to
  // trigger a clear; the cached pair is preserved.
  const projectIdToSave: string | null = rawProjectId;
  let platformToSave: string | null = rawPlatform;

  try {
    const existing = await withRetry(() =>
      prisma.userExtensionState.findUnique({
        where: { userId },
        select: { selectedProjectId: true },
      })
    );
    const priorProjectId = existing?.selectedProjectId ?? null;
    if (projectIdToSave === null) {
      platformToSave = null;
    } else if (
      priorProjectId !== null &&
      priorProjectId !== projectIdToSave
    ) {
      platformToSave = null;
    }

    await withRetry(() =>
      prisma.userExtensionState.upsert({
        where: { userId },
        create: {
          userId,
          selectedProjectId: projectIdToSave,
          selectedPlatform: platformToSave,
        },
        update: {
          selectedProjectId: projectIdToSave,
          selectedPlatform: platformToSave,
        },
      })
    );

    const responseBody: ReplaceExtensionStateResponse = {
      selectedProjectId: projectIdToSave,
      selectedPlatform: platformToSave,
    };
    return withCors(req, NextResponse.json(responseBody));
  } catch (error) {
    recordFlake('PUT /api/extension-state', error, { retried: true });
    console.error('PUT extension-state error:', error, { userId });
    return withCors(
      req,
      NextResponse.json(
        { error: 'Failed to replace extension state' },
        { status: 500 }
      )
    );
  }
}

