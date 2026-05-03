import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { recordFlake } from '@/lib/flake-counter';

async function verifyNoteOwnership(userId: string, noteId: string) {
  const note = await prisma.adminNote.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });
  if (!note) return { ok: false as const, status: 404, message: 'Note not found' };
  if (note.userId !== userId) return { ok: false as const, status: 403, message: 'Access denied' };
  return { ok: true as const };
}

// GET /api/admin-notes/[noteId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { noteId } = await params;

  try {
    const own = await verifyNoteOwnership(auth.userId, noteId);
    if (!own.ok) return NextResponse.json({ error: own.message }, { status: own.status });

    const note = await prisma.adminNote.findUnique({
      where: { id: noteId },
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(note);
  } catch (error) {
    recordFlake('GET /api/admin-notes/[noteId]', error);
    console.error('GET /api/admin-notes/[noteId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

// PATCH /api/admin-notes/[noteId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { noteId } = await params;

  try {
    const own = await verifyNoteOwnership(auth.userId, noteId);
    if (!own.ok) return NextResponse.json({ error: own.message }, { status: own.status });

    const body = await req.json();
    const data: { title?: string; description?: string; content?: string; sortOrder?: number } = {};

    if (typeof body.title === 'string') data.title = body.title.trim() || 'Untitled Note';
    if (typeof body.description === 'string') data.description = body.description;
    if (typeof body.content === 'string') data.content = body.content;
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;

    const note = await prisma.adminNote.update({
      where: { id: noteId },
      data,
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(note);
  } catch (error) {
    recordFlake('PATCH /api/admin-notes/[noteId]', error);
    console.error('PATCH /api/admin-notes/[noteId] error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

// DELETE /api/admin-notes/[noteId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { noteId } = await params;

  try {
    const own = await verifyNoteOwnership(auth.userId, noteId);
    if (!own.ok) return NextResponse.json({ error: own.message }, { status: own.status });

    const attachments = await prisma.noteAttachment.findMany({
      where: { noteId },
      select: { storagePath: true },
    });

    await prisma.adminNote.delete({ where: { id: noteId } });

    if (attachments.length > 0) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase.storage
          .from('admin-notes')
          .remove(attachments.map((a) => a.storagePath));
      } catch (err) {
        console.error('Failed to clean up storage files on note delete:', err);
      }
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    recordFlake('DELETE /api/admin-notes/[noteId]', error);
    console.error('DELETE /api/admin-notes/[noteId] error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
