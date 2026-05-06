// CORS Next.js response factories — small wrapper around the pure helpers
// in cors.ts that produces NextResponse objects. Kept separate from cors.ts
// so the pure logic stays unit-testable without loading next/server.

import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, isAllowedOrigin } from './cors';

// Response factory for an OPTIONS preflight request. Extension callers
// hit this before their POST/PATCH/DELETE; same-origin web callers
// never trigger it.
export function corsPreflightResponse(req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

// Wraps an existing NextResponse with CORS headers when the request
// origin is an allowed extension. Idempotent — no-op for same-origin.
export function withCors(req: NextRequest, response: NextResponse): NextResponse {
  const origin = req.headers.get('origin');
  if (!isAllowedOrigin(origin)) return response;
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    response.headers.set(key, value);
  }
  return response;
}
