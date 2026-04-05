import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, auth check happens client-side in the dashboard page.
  // This middleware is a placeholder for server-side auth checking
  // which we'll add when we set up Supabase SSR in a later phase.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};