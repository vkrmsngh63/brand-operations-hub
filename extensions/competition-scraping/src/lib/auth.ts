// Auth helpers wrapping the Supabase client.
// signInWithPassword / signOut / getAccessToken — used by the popup UI and
// the API client.

import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase.ts';

export interface SignInResult {
  ok: boolean;
  error?: string;
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}
