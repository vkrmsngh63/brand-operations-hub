import { NextRequest, NextResponse } from 'next/server';
import { aiModelHandlers } from './_handlers';
import type { RequestLike } from '@/lib/ai-models/handlers/ai-model-registry';

// P-63 Phase 2a (2026-06-03) — platform-level AI-model registry API (collection).
// GET = the full registry in display order (seed-on-read from the in-code
// SEED_REGISTRY on first read). POST = add a model (the /ai-models admin wizard).
// Same-origin web-app only (the extension has no model selection), so no CORS.

export async function GET(req: NextRequest) {
  const result = await aiModelHandlers.GET(req as RequestLike);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  const result = await aiModelHandlers.POST(req as RequestLike);
  return NextResponse.json(result.body, { status: result.status });
}
