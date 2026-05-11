// Bundles src/lib/authFetch.ts for browser consumption by the Playwright
// regression test. esbuild aliases @supabase/supabase-js to the local
// fake-supabase.ts, and replaces the NEXT_PUBLIC_SUPABASE_* env vars
// with stub values at build time so the production-export wiring runs
// end-to-end without touching real Supabase.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');

export async function buildAuthFetchBundle() {
  await build({
    entryPoints: [resolve(repoRoot, 'src/lib/authFetch.ts')],
    bundle: true,
    format: 'esm',
    target: 'es2020',
    outfile: resolve(__dirname, 'dist/authFetch.bundle.js'),
    alias: {
      '@supabase/supabase-js': resolve(__dirname, 'fake-supabase.ts'),
    },
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': '"http://stub.invalid"',
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': '"stub-anon-key"',
    },
    write: true,
    logLevel: 'silent',
  });
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  buildAuthFetchBundle().then(() => {
    console.log('authFetch bundle built at tests/playwright/dist/authFetch.bundle.js');
  }).catch((err) => {
    console.error('Bundle build failed:', err);
    process.exit(1);
  });
}
