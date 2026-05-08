import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'PLOS Competition Scraping',
    description:
      'Capture competitor URLs, text, and images for the PLOS Competition Scraping & Deep Analysis workflow.',
    // `storage`     — chrome.storage.local for popup state + auth tokens
    // `contextMenus` — right-click "Add to PLOS" fallback per §5 guardrail #6
    permissions: ['storage', 'contextMenus'],
    // Chrome will require the user to re-approve permissions after this
    // host_permissions expansion when they reload the unpacked extension —
    // standard MV3 install path. Adding more platforms (Google Shopping,
    // Google Ads, Independent Websites) in future build sessions appends
    // new entries here additively.
    host_permissions: [
      // Use canonical hostname — vklf.com (apex) edge-redirects to www and
      // breaks CORS preflight chain. See api-client.ts comment.
      'https://www.vklf.com/*',
      'https://*.supabase.co/*',
      // §5 guardrail #2 per-platform DOM-pattern modules — 4 sites today.
      'https://*.amazon.com/*',
      'https://*.ebay.com/*',
      'https://*.etsy.com/*',
      'https://*.walmart.com/*',
    ],
  },
});
