import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';

// GET /api/projects — list all Projects for the authenticated user.
// Sort order: most recently worked-on first.
//   - "worked on" = MAX(lastActivityAt) across a Project's workspaces
//   - If a Project has no workspace activity yet (just created, never opened),
//     fall back to the Project's own updatedAt so brand-new Projects still
//     appear at the top.
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const projects = await prisma.project.findMany({
      where: { userId: auth.userId },
      include: {
        workflows: {
          select: {
            workflow: true,
            status: true,
            lastActivityAt: true,
            firstActivityAt: true,
            completedAt: true,
          },
        },
      },
    });

    // Compute per-Project "last activity" (MAX across workspaces, or fall back
    // to Project.updatedAt) and per-Project aggregate counts across all of
    // that Project's workspaces.
    const shaped = await Promise.all(
      projects.map(async (p) => {
        const workflowIds = p.workflows.map((w) => w.workflow);
        const projectWorkflowIds = (
          await prisma.projectWorkflow.findMany({
            where: { projectId: p.id },
            select: { id: true },
          })
        ).map((pw) => pw.id);

        const [keywordCount, canvasNodeCount] = await Promise.all([
          projectWorkflowIds.length === 0
            ? Promise.resolve(0)
            : prisma.keyword.count({
                where: { projectWorkflowId: { in: projectWorkflowIds } },
              }),
          projectWorkflowIds.length === 0
            ? Promise.resolve(0)
            : prisma.canvasNode.count({
                where: { projectWorkflowId: { in: projectWorkflowIds } },
              }),
        ]);

        const activityTimestamps = p.workflows
          .map((w) => w.lastActivityAt)
          .filter((t): t is Date => t !== null);

        const lastActivityAt =
          activityTimestamps.length > 0
            ? new Date(
                Math.max(...activityTimestamps.map((t) => t.getTime()))
              )
            : p.updatedAt;

        return {
          id: p.id,
          userId: p.userId,
          name: p.name,
          description: p.description,
          sortOrder: p.sortOrder,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          lastActivityAt,
          workflows: p.workflows,
          _count: {
            keywords: keywordCount,
            canvasNodes: canvasNodeCount,
            workflows: workflowIds.length,
          },
        };
      })
    );

    // Sort: most recent activity first.
    shaped.sort(
      (a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime()
    );

    return NextResponse.json(shaped);
  } catch (error) {
    recordFlake('GET /api/projects', error);
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects — create a new Project.
// Creates a clean Project record only. Workspaces (ProjectWorkflow rows)
// are created lazily when the user first enters a specific workflow.
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json().catch(() => ({}));
    const name =
      typeof body.name === 'string' && body.name.trim()
        ? body.name.trim()
        : 'Untitled Project';
    const description =
      typeof body.description === 'string' ? body.description : '';

    const project = await prisma.project.create({
      data: {
        userId: auth.userId,
        name,
        description,
      },
    });

    // Match the GET response shape so clients can use the POST result
    // directly without refetching.
    return NextResponse.json(
      {
        id: project.id,
        userId: project.userId,
        name: project.name,
        description: project.description,
        sortOrder: project.sortOrder,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        lastActivityAt: project.updatedAt,
        workflows: [],
        _count: { keywords: 0, canvasNodes: 0, workflows: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    recordFlake('POST /api/projects', error);
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}