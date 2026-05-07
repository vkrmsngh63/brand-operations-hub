// Supabase client for the PLOS Competition Scraping Chrome extension.
//
// Tokens persist in chrome.storage.local (per-Chrome-profile, per-extension,
// NOT chrome.storage.sync — sync would cross devices via the Google account,
// which is a wider trust boundary than we want for auth tokens).
// See COMPETITION_SCRAPING_STACK_DECISIONS.md §2 token-storage decision.
//
// The URL + anon key below are PUBLIC values. The Supabase anon key is
// designed to be embedded in browser-side code; row-level security policies
// in the database protect actual data, NOT the anon key. Same values are
// already exposed in the PLOS web bundle at vklf.com.

import {
  createClient,
  type SupportedStorage,
} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vyehbgkvdnvsjjfqhqgo.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZWhiZ2t2ZG52c2pqZnFocWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0Mjk3OTQsImV4cCI6MjA5MTAwNTc5NH0.FSEpAPOnUSMGCh7Eh_AMCC6ykmpxaW3A1VdtKGBkFhs';

// `chrome` is undefined when the module is imported outside the extension
// runtime (e.g., during `wxt prepare`'s type-generation pass). The adapter
// no-ops in that case; runtime use inside the popup or service worker
// always has `chrome.storage` available.
function getChromeStorage(): chrome.storage.LocalStorageArea | null {
  return typeof chrome !== 'undefined' && chrome.storage?.local
    ? chrome.storage.local
    : null;
}

const chromeStorageAdapter: SupportedStorage = {
  getItem: async (key) => {
    const storage = getChromeStorage();
    if (!storage) return null;
    const result = await storage.get(key);
    const value = result[key];
    return typeof value === 'string' ? value : null;
  },
  setItem: async (key, value) => {
    const storage = getChromeStorage();
    if (!storage) return;
    await storage.set({ [key]: value });
  },
  removeItem: async (key) => {
    const storage = getChromeStorage();
    if (!storage) return;
    await storage.remove(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
