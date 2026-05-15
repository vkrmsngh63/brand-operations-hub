// Tiny HTTP server for the Playwright regression test rigs.
// Boots on 127.0.0.1:7891. Serves:
//
//   - The P-17 authFetch regression page + bundle + stub API endpoints.
//   - The P-30 P-29 modal stub pages + React-bundle dist files.
//
// Playwright config points its webServer.url at /__health to wait for readiness.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildAuthFetchBundle, buildP29ModalBundles } from './build-bundle.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 7891;

// In-memory call log so the P-17 authFetch tests can assert which stub
// paths were hit and what Authorization header each request carried.
const callLog = [];

const HTML_PAGES = {
  '/': 'test-page.html',
  '/test-page.html': 'test-page.html',
  '/p29-url-modal': 'pages/p29-url-modal.html',
  '/p29-url-modal.html': 'pages/p29-url-modal.html',
  '/p29-text-modal': 'pages/p29-text-modal.html',
  '/p29-text-modal.html': 'pages/p29-text-modal.html',
  '/p29-image-modal': 'pages/p29-image-modal.html',
  '/p29-image-modal.html': 'pages/p29-image-modal.html',
};

const BUNDLE_PREFIX = '/dist/';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const auth = req.headers.authorization || '';

  try {
    if (path === '/__health') {
      res.writeHead(200);
      res.end('ok');
      return;
    }

    if (HTML_PAGES[path]) {
      const html = await readFile(resolve(__dirname, HTML_PAGES[path]), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // Legacy P-17 path: /authFetch.bundle.js (no /dist/ prefix).
    if (path === '/authFetch.bundle.js') {
      const js = await readFile(
        resolve(__dirname, 'dist/authFetch.bundle.js'),
        'utf8',
      );
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
      });
      res.end(js);
      return;
    }

    // P-30 bundles are loaded from /dist/<name>.bundle.js.
    if (path.startsWith(BUNDLE_PREFIX) && path.endsWith('.bundle.js')) {
      const name = path.slice(BUNDLE_PREFIX.length);
      // Reject paths with traversal segments — only allow plain bundle names.
      if (name.includes('/') || name.includes('..')) {
        res.writeHead(400);
        res.end('bad bundle name');
        return;
      }
      const js = await readFile(resolve(__dirname, 'dist', name), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
      });
      res.end(js);
      return;
    }

    if (path === '/__calls') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(callLog));
      return;
    }

    if (path === '/__calls/reset') {
      callLog.length = 0;
      res.writeHead(200);
      res.end('ok');
      return;
    }

    if (path === '/stub-api/ok') {
      callLog.push({ path, auth, ts: Date.now() });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (path === '/stub-api/needs-refresh') {
      callLog.push({ path, auth, ts: Date.now() });
      const callsSoFar = callLog.filter((c) => c.path === path).length;
      if (callsSoFar === 1) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'expired' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok-after-refresh' }));
      }
      return;
    }

    res.writeHead(404);
    res.end('not found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`server error: ${err && err.message ? err.message : String(err)}`);
  }
});

await Promise.all([buildAuthFetchBundle(), buildP29ModalBundles()]);

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Test server listening on http://127.0.0.1:${PORT}`);
});
