import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { prisma } from '@/lib/db';

// ── Result types ───────────────────────────────────────────────
interface AuthSuccess {
  userId: string;
  error: null;
}

interface AuthError {
  userId: null;
  error: NextResponse;
}

type AuthResult = AuthSuccess | AuthError;

interface ProjectAuthSuccess {
  userId: string;
  projectId: string;
  error: null;
}

interface ProjectAuthError {
  userId: null;
  projectId: null;
  error: NextResponse;
}

type ProjectAuthResult = ProjectAuthSuccess | ProjectAuthError;

// ── Verify JWT token from Authorization header ─────────────────
// Call this at the top of every API route.
// Returns { userId } on success, or { error: NextResponse } on failure.
export async function verifyAuth(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      userId: null,
      error: NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);

    if (error || !data.user) {
      return {
        userId: null,
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    return { userId: data.user.id, error: null };
  } catch {
    return {
      userId: null,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}

// ── Verify JWT + project ownership ─────────────────────────────
// Call this in any route that has [projectId] in the path.
// Verifies the token AND checks the user owns the project.
export async function verifyProjectAuth(
  req: NextRequest,
  projectId: string
): Promise<ProjectAuthResult> {
  const auth = await verifyAuth(req);

  if (auth.error) {
    return { userId: null, projectId: null, error: auth.error };
  }

  // Check that this user owns this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project) {
    return {
      userId: null,
      projectId: null,
      error: NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      ),
    };
  }

  if (project.userId !== auth.userId) {
    return {
      userId: null,
      projectId: null,
      error: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ),
    };
  }

  return { userId: auth.userId, projectId, error: null };
}
