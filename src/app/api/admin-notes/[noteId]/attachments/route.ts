import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB per file

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg',
];

// POST /api/admin-notes/[noteId]/attachments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { noteId } = await params;

  try {
    const note = await prisma.adminNote.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });
    if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    if (note.userId !== auth.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const results: Array<{ id: string; fileName: string; publicUrl: string; fileType: string; fileSize: number }> = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push({ fileName: file.name, error: `Unsupported file type: ${file.type}` });
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push({ fileName: file.name, error: 'File too large (max 25 MB)' });
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${auth.userId}/${noteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('admin-notes')
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        errors.push({ fileName: file.name, error: uploadError.message });
        continue;
      }

      const { data: urlData } = supabase.storage.from('admin-notes').getPublicUrl(storagePath);

      const attachment = await prisma.noteAttachment.create({
        data: {
          noteId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storagePath,
          publicUrl: urlData.publicUrl,
        },
      });

      results.push({
        id: attachment.id,
        fileName: attachment.fileName,
        publicUrl: attachment.publicUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
      });
    }

    if (results.length > 0) {
      await prisma.adminNote.update({
        where: { id: noteId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ uploaded: results, errors }, { status: 201 });
  } catch (error) {
    console.error('POST attachments error:', error);
    return NextResponse.json({ error: 'Failed to upload attachments' }, { status: 500 });
  }
}
