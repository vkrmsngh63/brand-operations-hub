import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'PLOS Competition Scraping',
    description:
      'Capture competitor URLs, text, and images for the PLOS Competition Scraping & Deep Analysis workflow.',
    permissions: ['storage'],
    host_permissions: [
      'https://vklf.com/*',
      'https://*.supabase.co/*',
    ],
  },
});
