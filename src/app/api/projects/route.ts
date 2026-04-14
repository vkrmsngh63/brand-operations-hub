import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/projects — list all projects for the authenticated user
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const projects = await prisma.project.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { keywords: true, canvasNodes: true } },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const name = body.name || 'Untitled Project';
    const workflow = body.workflow || 'keyword-clustering';

    const project = await prisma.project.create({
      data: {
        userId: auth.userId,
        name,
        workflow,
        canvasState: {
          create: {
            nextNodeId: 1,
            nextPathwayId: 1,
            viewX: 0,
            viewY: 0,
            zoom: 1,
          },
        },
      },
      include: { canvasState: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
