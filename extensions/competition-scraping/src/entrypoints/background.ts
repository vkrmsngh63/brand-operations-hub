// Background service worker for the Competition Scraping extension.
//
// Phase 1 scope: nothing happens here yet. Importing the supabase module
// keeps the auto-refresh-token loop alive while Chrome considers the
// service worker "active." Future build sessions add: WAL replay on
// startup, periodic reconciliation poller, navigator.onLine handlers.

import { supabase } from '../lib/supabase';

void supabase;

export default defineBackground(() => {
  // Intentionally empty for the Phase 1 auth-shell session.
});
