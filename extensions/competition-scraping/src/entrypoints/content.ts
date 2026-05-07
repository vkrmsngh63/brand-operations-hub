// Content-script entry point per WXT's defineContentScript convention.
//
// Runs on the 4 platforms covered by COMPETITION_SCRAPING_STACK_DECISIONS.md
// §5 implementation guardrail #2 that the extension's session-3 build
// targets: Amazon, Ebay, Etsy, Walmart. Subsequent build sessions extend
// the matches array as Google Shopping / Google Ads / Independent Websites
// modules ship.
//
// All real work happens in the orchestrator; this entry exists only to
// register the script with WXT and wire its lifecycle to ContentScriptContext.

import { runOrchestrator } from '../lib/content-script/orchestrator.ts';

export default defineContentScript({
  matches: [
    'https://*.amazon.com/*',
    'https://*.ebay.com/*',
    'https://*.etsy.com/*',
    'https://*.walmart.com/*',
  ],
  runAt: 'document_idle',
  async main(ctx) {
    const cleanup = await runOrchestrator();
    ctx.onInvalidated(cleanup);
  },
});
