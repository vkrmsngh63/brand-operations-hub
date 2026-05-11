// Bundle-time replacement for @supabase/supabase-js used ONLY by the
// Playwright regression test that exercises src/lib/authFetch.ts's
// production export in a real Chromium browser context.
//
// build-bundle.mjs aliases the package import to this file so the
// bundled authFetch hits a controllable fake instead of a real
// Supabase client. Each test sets window.__fakeSupabaseState before
// invoking authFetch; this module reads from that state at runtime
// so individual tests can configure auth behavior independently.

export type FakeSupabaseState = {
  initialToken: string | null;
  refreshResult: 'success' | 'fail';
  refreshedToken?: string;
  refreshCalls: number;
};

declare global {
  interface Window {
    __fakeSupabaseState?: FakeSupabaseState;
  }
}

export function createClient(_url: string, _anonKey: string) {
  return {
    auth: {
      getSession: async () => {
        const s = window.__fakeSupabaseState;
        if (!s) {
          return { data: { session: null }, error: null };
        }
        return {
          data: {
            session: s.initialToken
              ? { access_token: s.initialToken }
              : null,
          },
          error: null,
        };
      },
      refreshSession: async () => {
        const s = window.__fakeSupabaseState;
        if (!s) {
          return {
            data: { session: null },
            error: { message: 'no fake state' },
          };
        }
        s.refreshCalls++;
        if (s.refreshResult === 'success') {
          return {
            data: {
              session: {
                access_token: s.refreshedToken ?? 'refreshed-token',
              },
            },
            error: null,
          };
        }
        return {
          data: { session: null },
          error: { message: 'refresh failed' },
        };
      },
    },
  };
}

export type SupabaseClient = ReturnType<typeof createClient>;
