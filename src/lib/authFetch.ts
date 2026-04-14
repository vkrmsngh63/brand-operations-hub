import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── authFetch ──────────────────────────────────────────────────
// Drop-in replacement for fetch() that automatically adds the
// Supabase JWT token to the Authorization header.
//
// Usage:  const res = await authFetch('/api/projects', { method: 'GET' });
//
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated — no active session');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  return fetch(url, { ...options, headers });
}
