import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';

// GET /api/user-preferences/[key] - returns { value } or { value: null }
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { key } = await params;

  try {
    const pref = await prisma.userPreference.findUnique({
      where: { userId_key: { userId: auth.userId, key } },
    });
    return NextResponse.json({ value: pref?.value ?? null });
  } catch (error) {
    recordFlake('GET /api/user-preferences/[key]', error);
    console.error('GET /api/user-preferences/[key] error:', error);
    return NextResponse.json({ error: 'Failed to fetch preference' }, { status: 500 });
  }
}

// PUT /api/user-preferences/[key]
// Body: { value: string }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const auth = await verifyAuth(req);
  if (auth.error) return auth.error;
  const { key } = await params;

  try {
    const body = await req.json();
    const value = String(body.value ?? '');

    const pref = await prisma.userPreference.upsert({
      where: { userId_key: { userId: auth.userId, key } },
      create: { userId: auth.userId, key, value },
      update: { value },
    });

    return NextResponse.json({ value: pref.value });
  } catch (error) {
    recordFlake('PUT /api/user-preferences/[key]', error);
    console.error('PUT /api/user-preferences/[key] error:', error);
    return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 });
  }
}
