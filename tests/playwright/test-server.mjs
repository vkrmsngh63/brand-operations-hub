// Tiny HTTP server for the Playwright regression test for authFetch.ts.
// Boots on 127.0.0.1:7891. Serves the test page + bundled authFetch +
// stub API endpoints. Playwright config points its webServer.url at
// /__health to wait for readiness.

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildAuthFetchBundle } from './build-bundle.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 7891;

// In-memory call log so tests can assert which stub paths were hit
// and what Authorization header each request carried.
const callLog = [];

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

    if (path === '/' || path === '/test-page.html') {
      const html = await readFile(resolve(__dirname, 'test-page.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

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

await buildAuthFetchBundle();

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Test server listening on http://127.0.0.1:${PORT}`);
});
