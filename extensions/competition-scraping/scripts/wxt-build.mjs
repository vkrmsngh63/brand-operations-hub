#!/usr/bin/env node
// Wrapper around wxt's programmatic build() API that force-exits after the
// promise resolves. Closes the P-44 wxt-build-parent-process-hang class:
// wxt 0.20.x + Vite 8 + Rolldown 1.0.0-rc.18 leave native worker-thread
// handles attached after build completes, so the event loop never drains
// and the CLI process hangs forever. The build artifacts ARE valid by the
// time build() resolves — process.exit(0) is safe.
//
// Browser flag passthrough: `node scripts/wxt-build.mjs -b firefox`.

import { build } from 'wxt';

const args = process.argv.slice(2);
const config = {};

const browserIdx = args.findIndex((a) => a === '-b' || a === '--browser');
if (browserIdx >= 0 && args[browserIdx + 1]) {
  config.browser = args[browserIdx + 1];
}

try {
  await build(config);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
