import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

// Server-side Supabase client — uses service role key
// ONLY use this on the server (API routes). Never expose to the browser.
// Created lazily to avoid build-time errors when env vars aren't available.
export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
    }
    _client = createClient(url, key);
  }
  return _client;
}
