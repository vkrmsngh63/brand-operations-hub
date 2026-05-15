// W#2 P-31 — node:test cases for the SSRF-guarded fetch-by-URL handler.
//
// Covers route-level wiring (status mapping, content-type validation, dep
// invocation order). The underlying SSRF classification is exercised
// separately by 37 cases in src/lib/ssrf-guard.test.ts.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  makeImagesFetchByUrlHandlers,
  type Ctx,
  type ImagesFetchByUrlHandlerDeps,
  type RequestLike,
  type SafeFetchFn,
  type VerifyAuthFn,
} from './images-fetch-by-url.ts';

const authOk: VerifyAuthFn = async () => ({
  projectWorkflowId: 'pw-1',
  userId: 'u-1',
  error: null,
});

const auth401: VerifyAuthFn = async () => ({
  projectWorkflowId: null,
  userId: null,
  error: { status: 401, body: { error: 'Unauthorized' } },
});

function makeReq(opts: { body?: unknown; jsonThrows?: boolean } = {}): RequestLike {
  return {
    json: async () => {
      if (opts.jsonThrows) throw new SyntaxError('bad json');
      return opts.body ?? {};
    },
    nextUrl: { searchParams: new URLSearchParams() },
  };
}

const ctx: Ctx = {
  params: Promise.resolve({ projectId: 'proj-1', urlId: 'url-1' }),
};

const validBody = { imageUrl: 'https://example.com/cat.jpg' };

const jpegBytes = new Uint8Array(2048);
jpegBytes[0] = 0xff;
jpegBytes[1] = 0xd8;
jpegBytes[2] = 0xff;

function makeDeps(
  overrides: Partial<ImagesFetchByUrlHandlerDeps> = {}
): ImagesFetchByUrlHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
  uploadCalls: Array<{ storagePath: string; bytes: Uint8Array; contentType: string }>;
  previewUrlCalls: string[];
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const uploadCalls: Array<{
    storagePath: string;
    bytes: Uint8Array;
    contentType: string;
  }> = [];
  const previewUrlCalls: string[] = [];
  const defaultSafeFetch: SafeFetchFn = async () => ({
    ok: true,
    bytes: jpegBytes,
    contentType: 'image/jpeg',
  });
  const deps: ImagesFetchByUrlHandlerDeps = {
    prisma: {
      competitorUrl: {
        findFirst: async () => ({ id: 'url-1' }),
      },
    },
    verifyAuth: authOk,
    recordFlake: (op, err, c) => {
      recordFlakeCalls.push({ op, err, ctx: c });
    },
    withRetry: (fn) => fn(),
    safeFetch: defaultSafeFetch,
    uploadBytesAsServer: async (args) => {
      uploadCalls.push(args);
    },
    getFullSizeUrl: async (storagePath) => {
      previewUrlCalls.push(storagePath);
      return `https://signed.example.com/${storagePath}?token=abc`;
    },
    composeStoragePath: (args) =>
      `${args.projectId}/${args.competitorUrlId}/${args.capturedImageId}.jpg`,
    generateCapturedImageId: () => 'fixed-uuid',
    ...overrides,
  };
  return Object.assign(deps, {
    recordFlakeCalls,
    uploadCalls,
    previewUrlCalls,
  });
}

test('POST 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 401);
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
});

test('POST 400 when imageUrl is missing', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: {} }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /imageUrl/);
});

test('POST 404 when parent URL is not found', async () => {
  const deps = makeDeps({
    prisma: { competitorUrl: { findFirst: async () => null } },
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 404);
});

test('POST 403 when SSRF guard blocks private-v4', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'private-v4',
      message: 'blocked',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 403);
  assert.match(
    (r.body as { error: string }).error,
    /private network address/i
  );
  assert.equal((r.body as { reason: string }).reason, 'private-v4');
});

test('POST 403 when SSRF guard blocks metadata-hostname', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'metadata-hostname',
      message: 'blocked',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 403);
  assert.match(
    (r.body as { error: string }).error,
    /cloud-metadata endpoint/i
  );
});

test('POST 400 when SSRF guard blocks invalid-scheme', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'invalid-scheme',
      message: 'blocked',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /http:\/\/ or https:\/\//);
});

test('POST 504 on safeFetch timeout', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'timeout',
      message: 'aborted',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 504);
  assert.match((r.body as { error: string }).error, /too long to respond/i);
});

test('POST 413 on safeFetch body-too-large', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'body-too-large',
      message: 'exceeds maxBytes',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 413);
  assert.match((r.body as { error: string }).error, /larger than 5 MB/i);
});

test('POST 502 on redirect-blocked', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: false,
      reason: 'redirect-blocked',
      message: 'redirect',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 502);
});

test('POST 415 when upstream Content-Type is not an accepted image MIME', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: true,
      bytes: jpegBytes,
      contentType: 'application/octet-stream',
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 415);
  assert.match(
    (r.body as { error: string }).error,
    /Content-Type "application\/octet-stream"/
  );
});

test('POST 415 when upstream Content-Type is missing entirely', async () => {
  const deps = makeDeps({
    safeFetch: async () => ({
      ok: true,
      bytes: jpegBytes,
      contentType: null,
    }),
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 415);
  assert.match((r.body as { error: string }).error, /unknown/);
});

test('POST 502 when uploadBytesAsServer throws → recordFlake fires', async () => {
  const deps = makeDeps({
    uploadBytesAsServer: async () => {
      throw new Error('S3 down');
    },
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 502);
  assert.equal(deps.recordFlakeCalls.length, 1);
  assert.match(deps.recordFlakeCalls[0].op, /upload/);
});

test('POST 502 when getFullSizeUrl throws → recordFlake fires', async () => {
  const deps = makeDeps({
    getFullSizeUrl: async () => {
      throw new Error('signing service down');
    },
  });
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 502);
  assert.equal(deps.recordFlakeCalls.length, 1);
  assert.match(deps.recordFlakeCalls[0].op, /preview-url/);
});

test('POST 200 happy path — returns capturedImageId + storagePath + mimeType + fileSize + previewUrl', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFetchByUrlHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 200);
  const body = r.body as {
    capturedImageId: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    previewUrl: string;
  };
  assert.equal(body.capturedImageId, 'fixed-uuid');
  assert.equal(body.storagePath, 'proj-1/url-1/fixed-uuid.jpg');
  assert.equal(body.mimeType, 'image/jpeg');
  assert.equal(body.fileSize, jpegBytes.byteLength);
  assert.match(body.previewUrl, /signed\.example\.com/);
  // Dep invocation order — upload before preview-URL.
  assert.equal(deps.uploadCalls.length, 1);
  assert.equal(deps.previewUrlCalls.length, 1);
  assert.equal(deps.uploadCalls[0].contentType, 'image/jpeg');
});
