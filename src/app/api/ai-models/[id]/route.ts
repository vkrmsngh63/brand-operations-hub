import { NextRequest, NextResponse } from 'next/server';
import { aiModelHandlers } from '../_handlers';
import type {
  Ctx,
  RequestLike,
} from '@/lib/ai-models/handlers/ai-model-registry';

// P-63 Phase 2a (2026-06-03) — platform-level AI-model registry API (single item).
// PUT = edit a model's presentation/pricing/menus/status. DELETE = remove it.
// provider + modelId are immutable identity (delete + recreate to change them).

export async function PUT(req: NextRequest, ctx: Ctx) {
  const result = await aiModelHandlers.PUT(req as RequestLike, ctx);
  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const result = await aiModelHandlers.DELETE(req as RequestLike, ctx);
  return NextResponse.json(result.body, { status: result.status });
}
