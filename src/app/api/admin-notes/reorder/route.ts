import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// POST /api/admin-notes/reorder
// Body: { noteIds: string[] }  // ordered array of note IDs; their new sortOrder = array index
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const noteIds: string[] = body.noteIds;
    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return NextResponse.json({ error: 'noteIds array required' }, { status: 400 });
    }

    // Verify every note belongs to the authenticated user
    const notes = await prisma.adminNote.findMany({
      where: { id: { in: noteIds } },
      select: { id: true, userId: true },
    });
    if (notes.length !== noteIds.length) {
      return NextResponse.json({ error: 'Some notes not found' }, { status: 404 });
    }
    if (notes.some((n) => n.userId !== auth.userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Atomically update sortOrder for each
    await prisma.$transaction(
      noteIds.map((id, i) =>
        prisma.adminNote.update({
          where: { id },
          data: { sortOrder: i },
        })
      )
    );

    return NextResponse.json({ reordered: noteIds.length });
  } catch (error) {
    console.error('POST /api/admin-notes/reorder error:', error);
    return NextResponse.json({ error: 'Failed to reorder notes' }, { status: 500 });
  }
}
