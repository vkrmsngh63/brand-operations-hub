import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// GET /api/admin-notes?system=think-tank
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const system = searchParams.get('system');

    if (!system || !['think-tank', 'pms'].includes(system)) {
      return NextResponse.json({ error: 'Invalid or missing system parameter' }, { status: 400 });
    }

    const notes = await prisma.adminNote.findMany({
      where: { userId: auth.userId, system },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET /api/admin-notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST /api/admin-notes
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const system = body.system;
    const title = (body.title || 'Untitled Note').trim() || 'Untitled Note';

    if (!system || !['think-tank', 'pms'].includes(system)) {
      return NextResponse.json({ error: 'Invalid or missing system' }, { status: 400 });
    }

    const count = await prisma.adminNote.count({
      where: { userId: auth.userId, system },
    });

    const note = await prisma.adminNote.create({
      data: {
        userId: auth.userId,
        system,
        title,
        sortOrder: count,
      },
      include: { attachments: true },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin-notes error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
