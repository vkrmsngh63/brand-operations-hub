import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ── authFetch ──────────────────────────────────────────────────
// Drop-in replacement for fetch() that automatically adds the
// Supabase JWT token to the Authorization header.
//
// Usage:  const res = await authFetch('/api/projects', { method: 'GET' });
//
// On a 401 response, the wrapper attempts a single silent refresh of
// the Supabase session via refreshSession() and retries the request
// once with the new access token. If the refresh ALSO fails (refresh
// token expired ~1 week away, network offline, server-side revocation)
// the original 401 is returned to the caller — keeping existing error
// handling at the 76 call sites unchanged.
//
// The 401-retry covers the common case where the access token has
// expired (1-hour TTL) but the refresh token is still valid (~1-week
// TTL). Without this, returning to vklf.com after >1 hour surfaces
// "Could not load Projects (401): Invalid or expired token" in the UI
// and the user must manually sign out + back in to recover.

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

interface AuthFetchDeps {
  supabase: Pick<SupabaseClient, 'auth'>;
  fetchFn: FetchFn;
}

let productionSupabaseSingleton: SupabaseClient | null = null;
function getProductionSupabase(): SupabaseClient {
  if (!productionSupabaseSingleton) {
    productionSupabaseSingleton = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return productionSupabaseSingleton;
}

export function makeAuthFetch(deps: AuthFetchDeps) {
  return async function authFetchImpl(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const { data: { session } } = await deps.supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Not authenticated — no active session');
    }

    const buildHeaders = (token: string) => {
      const h = new Headers(options.headers);
      h.set('Authorization', `Bearer ${token}`);
      return h;
    };

    const firstResponse = await deps.fetchFn(url, {
      ...options,
      headers: buildHeaders(session.access_token),
    });

    if (firstResponse.status !== 401) {
      return firstResponse;
    }

    // Access token rejected — try a silent refresh + one retry.
    const refreshResult = await deps.supabase.auth.refreshSession();
    const newToken = refreshResult?.data?.session?.access_token;

    if (refreshResult?.error || !newToken) {
      return firstResponse;
    }

    return deps.fetchFn(url, {
      ...options,
      headers: buildHeaders(newToken),
    });
  };
}

export const authFetch: ReturnType<typeof makeAuthFetch> = (url, options) =>
  makeAuthFetch({ supabase: getProductionSupabase(), fetchFn: fetch })(url, options);
