// Bundles the two test-only entrypoints served by tests/playwright/test-server.mjs:
//
//   1. authFetch.bundle.js — the P-17 real-Chromium regression test for
//      src/lib/authFetch.ts. Aliases @supabase/supabase-js to the local
//      fake-supabase.ts and replaces NEXT_PUBLIC_SUPABASE_* env vars so
//      the production-export wiring runs end-to-end without real Supabase.
//
//   2. p29-*.bundle.js (P-30 React-bundle stub-page rig, 2026-05-15) —
//      three React mount entrypoints under tests/playwright/mounts/ that
//      render the production P-29 modal components (UrlAddModal /
//      CapturedTextAddModal / CapturedImageAddModal) inside a thin
//      wrapper exposing window.__test hooks. esbuild handles JSX via the
//      automatic runtime, resolves @/ to src/, and aliases
//      @supabase/supabase-js to fake-supabase.ts so authFetch's real
//      production wiring runs without a real Supabase client. Each test
//      installs page.route() handlers to intercept the modal's fetch()
//      calls and capture POST bodies / shape responses.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');

const sharedDefine = {
  'process.env.NEXT_PUBLIC_SUPABASE_URL': '"http://stub.invalid"',
  'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': '"stub-anon-key"',
  'process.env.NODE_ENV': '"production"',
};

const sharedAlias = {
  '@supabase/supabase-js': resolve(__dirname, 'fake-supabase.ts'),
  '@': resolve(repoRoot, 'src'),
};

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
    define: sharedDefine,
    write: true,
    logLevel: 'silent',
  });
}

export async function buildP29ModalBundles() {
  const entries = [
    { name: 'p29-url-modal', file: 'p29-url-modal.mount.tsx' },
    { name: 'p29-text-modal', file: 'p29-text-modal.mount.tsx' },
    { name: 'p29-image-modal', file: 'p29-image-modal.mount.tsx' },
  ];

  for (const entry of entries) {
    await build({
      entryPoints: [resolve(__dirname, 'mounts', entry.file)],
      bundle: true,
      format: 'esm',
      target: 'es2020',
      outfile: resolve(__dirname, 'dist', `${entry.name}.bundle.js`),
      alias: sharedAlias,
      define: sharedDefine,
      jsx: 'automatic',
      loader: { '.ts': 'ts', '.tsx': 'tsx' },
      write: true,
      logLevel: 'silent',
    });
  }
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  Promise.all([buildAuthFetchBundle(), buildP29ModalBundles()])
    .then(() => {
      console.log('Bundles built at tests/playwright/dist/');
    })
    .catch((err) => {
      console.error('Bundle build failed:', err);
      process.exit(1);
    });
}
