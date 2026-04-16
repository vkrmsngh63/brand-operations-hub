import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// DELETE /api/admin-notes/[noteId]/attachments/[attachmentId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; attachmentId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { noteId, attachmentId } = await params;

  try {
    const note = await prisma.adminNote.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== auth.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const attachment = await prisma.noteAttachment.findUnique({
      where: { id: attachmentId },
      select: { storagePath: true, noteId: true },
    });

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }
    if (attachment.noteId !== noteId) {
      return NextResponse.json({ error: 'Attachment does not belong to this note' }, { status: 400 });
    }

    await prisma.noteAttachment.delete({ where: { id: attachmentId } });

    try {
      const supabase = getSupabaseAdmin();
      await supabase.storage.from('admin-notes').remove([attachment.storagePath]);
    } catch (err) {
      console.error('Failed to delete storage file:', err);
    }

    await prisma.adminNote.update({
      where: { id: noteId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('DELETE attachment error:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
