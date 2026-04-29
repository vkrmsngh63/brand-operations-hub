/**
 * Unit tests for the run-start pre-flight self-test.
 *
 * Run with:
 *   node --test --experimental-strip-types src/lib/preflight.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  runPreflight,
  checkP1ApiKey,
  checkP2SeedWords,
  checkP3InitialPrompt,
  checkP4PrimerPrompt,
  checkP5NodesRefMatchesServer,
  checkP6KeywordsRefMatchesServer,
  checkP7PathwayConsistency,
  checkP8KeywordScope,
  checkP9TestApiCall,
  checkP10LocalStorage,
  type PreflightContext,
} from './preflight.ts';

/* ── Helpers ──────────────────────────────────────────────────────── */

function makeStorage(opts: { fail?: 'set' | 'get' | 'remove'; lossy?: boolean } = {}) {
  const data = new Map<string, string>();
  return {
    setItem: (k: string, v: string) => {
      if (opts.fail === 'set') throw new Error('quota exceeded');
      data.set(k, v);
    },
    getItem: (k: string) => {
      if (opts.fail === 'get') throw new Error('localStorage disabled');
      if (opts.lossy) return 'wrong-value';
      return data.get(k) ?? null;
    },
    removeItem: (k: string) => {
      if (opts.fail === 'remove') throw new Error('cannot remove');
      data.delete(k);
    },
  };
}

function makeFetcherFromMap(routes: Record<string, () => Promise<Response> | Response>) {
  return async (url: string): Promise<Response> => {
    for (const [pattern, handler] of Object.entries(routes)) {
      if (url.includes(pattern)) return handler();
    }
    throw new Error('makeFetcherFromMap: no route matched ' + url);
  };
}

function makeContext(over: Partial<PreflightContext> = {}): PreflightContext {
  return {
    apiMode: 'direct',
    apiKey: 'sk-ant-1234567890',
    model: 'claude-sonnet-4-6',
    seedWords: 'bursitis joint pain',
    initialPrompt: 'a'.repeat(200),
    primerPrompt: '',
    projectId: 'proj-test',
    nodes: [],
    keywords: [],
    pathways: [],
    unsortedKeywordCount: 10,
    fetcher: async () => new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } }),
    rawFetcher: async () => new Response('{"ok":true}', { status: 200 }),
    storage: makeStorage(),
    ...over,
  };
}

/* ── P1: API key ──────────────────────────────────────────────────── */

test('P1: direct mode + non-empty key → pass', () => {
  const r = checkP1ApiKey(makeContext({ apiMode: 'direct', apiKey: 'sk-abc' }));
  assert.equal(r.status, 'pass');
  assert.equal(r.id, 'P1');
});

test('P1: direct mode + empty key → fail', () => {
  const r = checkP1ApiKey(makeContext({ apiMode: 'direct', apiKey: '' }));
  assert.equal(r.status, 'fail');
});

test('P1: direct mode + whitespace-only key → fail', () => {
  const r = checkP1ApiKey(makeContext({ apiMode: 'direct', apiKey: '   ' }));
  assert.equal(r.status, 'fail');
});

test('P1: server proxy mode → pass even with empty user key (server uses env var)', () => {
  const r = checkP1ApiKey(makeContext({ apiMode: 'server', apiKey: '' }));
  assert.equal(r.status, 'pass');
});

/* ── P2: Seed words ───────────────────────────────────────────────── */

test('P2: empty seed words → fail', () => {
  assert.equal(checkP2SeedWords(makeContext({ seedWords: '' })).status, 'fail');
  assert.equal(checkP2SeedWords(makeContext({ seedWords: '   ' })).status, 'fail');
});

test('P2: one word → pass with count 1', () => {
  const r = checkP2SeedWords(makeContext({ seedWords: 'bursitis' }));
  assert.equal(r.status, 'pass');
  assert.match(r.message, /1 word/);
});

test('P2: comma + space split correctly', () => {
  const r = checkP2SeedWords(makeContext({ seedWords: 'bursitis, joint pain, hip' }));
  assert.equal(r.status, 'pass');
  assert.match(r.message, /4 word/);
});

/* ── P3: Initial prompt ───────────────────────────────────────────── */

test('P3: prompt < 100 chars → fail', () => {
  assert.equal(checkP3InitialPrompt(makeContext({ initialPrompt: 'short' })).status, 'fail');
  assert.equal(checkP3InitialPrompt(makeContext({ initialPrompt: 'a'.repeat(99) })).status, 'fail');
});

test('P3: prompt ≥ 100 chars → pass', () => {
  assert.equal(checkP3InitialPrompt(makeContext({ initialPrompt: 'a'.repeat(100) })).status, 'pass');
  assert.equal(checkP3InitialPrompt(makeContext({ initialPrompt: 'a'.repeat(8000) })).status, 'pass');
});

/* ── P4: Primer prompt (optional with anti-half-paste guard) ──────── */

test('P4: empty primer → pass with "not used" message', () => {
  const r = checkP4PrimerPrompt(makeContext({ primerPrompt: '' }));
  assert.equal(r.status, 'pass');
  assert.match(r.message, /not used/);
});

test('P4: whitespace-only primer treated as empty → pass', () => {
  const r = checkP4PrimerPrompt(makeContext({ primerPrompt: '   \n  ' }));
  assert.equal(r.status, 'pass');
});

test('P4: very short non-empty primer (< 30 chars) → fail (catches half-paste)', () => {
  const r = checkP4PrimerPrompt(makeContext({ primerPrompt: 'just a few chars' }));
  assert.equal(r.status, 'fail');
});

test('P4: substantial primer (≥ 30 chars) → pass', () => {
  const r = checkP4PrimerPrompt(makeContext({ primerPrompt: 'a'.repeat(500) }));
  assert.equal(r.status, 'pass');
});

/* ── P5: nodesRef vs server ───────────────────────────────────────── */

test('P5: counts + sample IDs match → pass', async () => {
  const localNodes = [
    { stableId: 't-1' },
    { stableId: 't-2' },
    { stableId: 't-3' },
  ];
  const ctx = makeContext({
    nodes: localNodes,
    fetcher: makeFetcherFromMap({
      '/canvas/nodes': () =>
        new Response(JSON.stringify(localNodes), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'pass');
});

test('P5: server returns HTTP 500 → fail', async () => {
  const ctx = makeContext({
    fetcher: makeFetcherFromMap({
      '/canvas/nodes': () => new Response('{"error":"boom"}', { status: 500 }),
    }),
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /HTTP 500/);
});

test('P5: counts differ → fail with both counts in message', async () => {
  const ctx = makeContext({
    nodes: [{ stableId: 't-1' }],
    fetcher: makeFetcherFromMap({
      '/canvas/nodes': () =>
        new Response(JSON.stringify([{ stableId: 't-1' }, { stableId: 't-2' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /1.*2/);
});

test('P5: counts match but stableIds differ → fail', async () => {
  const ctx = makeContext({
    nodes: [{ stableId: 't-1' }, { stableId: 't-2' }],
    fetcher: makeFetcherFromMap({
      '/canvas/nodes': () =>
        new Response(JSON.stringify([{ stableId: 't-1' }, { stableId: 't-99' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /stableIds differ|sample mismatch/);
});

test('P5: server returns non-array body → fail', async () => {
  const ctx = makeContext({
    fetcher: makeFetcherFromMap({
      '/canvas/nodes': () =>
        new Response(JSON.stringify({ error: 'not an array' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /non-array/);
});

test('P5: network throws → fail with error message', async () => {
  const ctx = makeContext({
    fetcher: async () => {
      throw new Error('connection refused');
    },
  });
  const r = await checkP5NodesRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /connection refused/);
});

/* ── P6: keywordsRef vs server (mirrors P5 structure) ─────────────── */

test('P6: counts + sample IDs match → pass', async () => {
  const local = [{ id: 'k-1' }, { id: 'k-2' }];
  const ctx = makeContext({
    keywords: local,
    fetcher: makeFetcherFromMap({
      '/keywords': () =>
        new Response(JSON.stringify(local), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP6KeywordsRefMatchesServer(ctx);
  assert.equal(r.status, 'pass');
});

test('P6: counts differ → fail', async () => {
  const ctx = makeContext({
    keywords: [{ id: 'k-1' }],
    fetcher: makeFetcherFromMap({
      '/keywords': () =>
        new Response(JSON.stringify([{ id: 'k-1' }, { id: 'k-2' }, { id: 'k-3' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    }),
  });
  const r = await checkP6KeywordsRefMatchesServer(ctx);
  assert.equal(r.status, 'fail');
});

/* ── P7: Pathway consistency ──────────────────────────────────────── */

test('P7: no canvas pathway references → pass even if pathways empty', () => {
  const r = checkP7PathwayConsistency(
    makeContext({
      nodes: [{ stableId: 't-1', pathwayId: null }],
      pathways: [],
    }),
  );
  assert.equal(r.status, 'pass');
});

test('P7: canvas references pathways AND pathways loaded → pass', () => {
  const r = checkP7PathwayConsistency(
    makeContext({
      nodes: [{ stableId: 't-1', pathwayId: 'pw-1' }, { stableId: 't-2', pathwayId: 'pw-1' }],
      pathways: [{ id: 'pw-1' }],
    }),
  );
  assert.equal(r.status, 'pass');
  assert.match(r.message, /1 referenced.*1 loaded/);
});

test('P7: canvas references pathway BUT pathways empty → fail', () => {
  const r = checkP7PathwayConsistency(
    makeContext({
      nodes: [{ stableId: 't-1', pathwayId: 'pw-1' }],
      pathways: [],
    }),
  );
  assert.equal(r.status, 'fail');
});

/* ── P8: Keyword scope ────────────────────────────────────────────── */

test('P8: 0 keywords in scope → fail', () => {
  assert.equal(checkP8KeywordScope(makeContext({ unsortedKeywordCount: 0 })).status, 'fail');
});

test('P8: ≥1 keywords in scope → pass', () => {
  assert.equal(checkP8KeywordScope(makeContext({ unsortedKeywordCount: 1 })).status, 'pass');
  assert.equal(checkP8KeywordScope(makeContext({ unsortedKeywordCount: 1208 })).status, 'pass');
});

/* ── P9: Test API call ────────────────────────────────────────────── */

test('P9: direct mode + 200 OK → pass', async () => {
  const ctx = makeContext({
    apiMode: 'direct',
    rawFetcher: async () =>
      new Response(JSON.stringify({ id: 'msg_1', content: [{ type: 'text', text: 'OK' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  });
  const r = await checkP9TestApiCall(ctx);
  assert.equal(r.status, 'pass');
});

test('P9: direct mode + 401 unauthorized → fail with detail', async () => {
  const ctx = makeContext({
    apiMode: 'direct',
    rawFetcher: async () =>
      new Response(JSON.stringify({ error: { message: 'invalid x-api-key' } }), {
        status: 401,
      }),
  });
  const r = await checkP9TestApiCall(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /401/);
  assert.match(r.message, /invalid x-api-key/);
});

test('P9: server proxy mode + 200 OK uses authenticated fetcher → pass', async () => {
  let usedFetcher = '';
  const ctx = makeContext({
    apiMode: 'server',
    apiKey: '',
    fetcher: async () => {
      usedFetcher = 'auth';
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    rawFetcher: async () => {
      usedFetcher = 'raw';
      return new Response('{}', { status: 200 });
    },
  });
  const r = await checkP9TestApiCall(ctx);
  assert.equal(r.status, 'pass');
  assert.equal(usedFetcher, 'auth', 'server-proxy mode must go through authFetch, not raw fetch');
});

test('P9: network throws → fail', async () => {
  const ctx = makeContext({
    apiMode: 'direct',
    rawFetcher: async () => {
      throw new Error('DNS lookup failed');
    },
  });
  const r = await checkP9TestApiCall(ctx);
  assert.equal(r.status, 'fail');
  assert.match(r.message, /DNS lookup failed/);
});

/* ── P10: localStorage ────────────────────────────────────────────── */

test('P10: working storage → pass', () => {
  const r = checkP10LocalStorage(makeContext());
  assert.equal(r.status, 'pass');
});

test('P10: setItem throws → fail', () => {
  const r = checkP10LocalStorage(makeContext({ storage: makeStorage({ fail: 'set' }) }));
  assert.equal(r.status, 'fail');
  assert.match(r.message, /quota exceeded|unavailable/);
});

test('P10: getItem throws → fail', () => {
  const r = checkP10LocalStorage(makeContext({ storage: makeStorage({ fail: 'get' }) }));
  assert.equal(r.status, 'fail');
});

test('P10: read returns wrong value → fail', () => {
  const r = checkP10LocalStorage(makeContext({ storage: makeStorage({ lossy: true }) }));
  assert.equal(r.status, 'fail');
  assert.match(r.message, /different value/);
});

/* ── runPreflight: full chain ─────────────────────────────────────── */

test('runPreflight: all checks pass → passed=true, 10 checks, firstFailIndex=-1', async () => {
  const localNodes = [{ stableId: 't-1' }];
  const localKws = [{ id: 'k-1' }, { id: 'k-2' }];
  const ctx = makeContext({
    nodes: localNodes,
    keywords: localKws,
    fetcher: async (url) => {
      if (url.includes('/canvas/nodes')) {
        return new Response(JSON.stringify(localNodes), { status: 200 });
      }
      if (url.includes('/keywords')) {
        return new Response(JSON.stringify(localKws), { status: 200 });
      }
      if (url.includes('/api/ai/analyze')) {
        return new Response('{}', { status: 200 });
      }
      throw new Error('unexpected fetch ' + url);
    },
    rawFetcher: async () => new Response('{}', { status: 200 }),
  });
  const result = await runPreflight(ctx);
  assert.equal(result.passed, true);
  assert.equal(result.checks.length, 10);
  assert.equal(result.firstFailIndex, -1);
  for (const c of result.checks) {
    assert.equal(c.status, 'pass', `check ${c.id} should pass: ${c.message}`);
  }
});

test('runPreflight: P3 fails → chain stops; P4..P10 not executed', async () => {
  const ctx = makeContext({ initialPrompt: 'too short' });
  const result = await runPreflight(ctx);
  assert.equal(result.passed, false);
  assert.equal(result.checks.length, 3, 'should stop at P3, having run P1+P2+P3');
  assert.equal(result.checks[2].id, 'P3');
  assert.equal(result.checks[2].status, 'fail');
  assert.equal(result.firstFailIndex, 2);
});

test('runPreflight: P1 fails → chain stops immediately', async () => {
  const ctx = makeContext({ apiMode: 'direct', apiKey: '' });
  const result = await runPreflight(ctx);
  assert.equal(result.passed, false);
  assert.equal(result.checks.length, 1);
  assert.equal(result.firstFailIndex, 0);
});

test('runPreflight: P9 fails → exposes the error message in checks', async () => {
  const localNodes: Array<{ stableId: string }> = [];
  const localKws: Array<{ id: string }> = [];
  const ctx = makeContext({
    nodes: localNodes,
    keywords: localKws,
    fetcher: async (url) => {
      if (url.includes('/canvas/nodes')) return new Response(JSON.stringify(localNodes), { status: 200 });
      if (url.includes('/keywords')) return new Response(JSON.stringify(localKws), { status: 200 });
      throw new Error('unexpected fetch');
    },
    rawFetcher: async () =>
      new Response(JSON.stringify({ error: { message: 'model not found' } }), { status: 404 }),
  });
  const result = await runPreflight(ctx);
  assert.equal(result.passed, false);
  // P1..P8 should pass; P9 should fail.
  assert.equal(result.checks.length, 9);
  assert.equal(result.checks[8].id, 'P9');
  assert.equal(result.checks[8].status, 'fail');
  assert.match(result.checks[8].message, /model not found/);
});
