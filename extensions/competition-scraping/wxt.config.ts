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
    // `activeTab`   — session 6 (2026-05-13) required by chrome.tabs.captureVisibleTab
    //   for the Module 2 region-screenshot path per STACK_DECISIONS.md §4.
    //   Chrome grants `activeTab` to the active tab when the user invokes the
    //   extension (clicks the toolbar icon → opens popup → activeTab granted
    //   for that tab). The popup-side "Region-screenshot mode" button then
    //   sends a message to the content script which routes captureVisibleTab
    //   through the background — the permission was granted at popup-open.
    //   Without this entry, captureVisibleTab rejects with
    //   "Either the '<all_urls>' or 'activeTab' permission is required."
    permissions: ['storage', 'contextMenus', 'activeTab'],
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
      // Session 5 (2026-05-12-i) — image-CDN hostnames so the background
      // service worker's fetch() can read image bytes for the Module 2
      // regular-image upload path. Without these, fetchImageBytes() rejects
      // with PlosApiError on cross-origin CDN fetches. The four sites
      // above only cover the product-listing page origins, not the image
      // hosts Amazon / Ebay / Etsy / Walmart serve their product photos
      // from. If a platform adds a new CDN later, append additively.
      'https://*.media-amazon.com/*',
      'https://*.ssl-images-amazon.com/*',
      'https://*.ebayimg.com/*',
      'https://*.etsystatic.com/*',
      'https://*.walmartimages.com/*',
    ],
  },
});
