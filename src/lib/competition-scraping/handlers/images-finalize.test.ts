// W#2 P-31 — node:test cases for the captured-image finalize handler.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';

import {
  makeImagesFinalizeHandlers,
  type CapturedImageRow,
  type Ctx,
  type ImagesFinalizeHandlerDeps,
  type RequestLike,
  type VerifyAuthFn,
} from './images-finalize.ts';

const FROZEN_DATE = new Date('2026-05-15T12:00:00Z');

function makeRow(overrides: Partial<CapturedImageRow> = {}): CapturedImageRow {
  return {
    id: 'img-1',
    clientId: 'client-1',
    competitorUrlId: 'url-1',
    imageCategory: null,
    storagePath: 'proj-1/url-1/img-uuid.jpg',
    storageBucket: 'competition-scraping',
    composition: null,
    embeddedText: null,
    tags: [],
    sourceType: 'regular',
    fileSize: 1024,
    mimeType: 'image/jpeg',
    width: null,
    height: null,
    sortOrder: 0,
    source: 'extension',
    addedBy: 'u-1',
    addedAt: FROZEN_DATE,
    updatedAt: FROZEN_DATE,
    ...overrides,
  };
}

function makeFakePrisma(opts: {
  parent?: { id: string } | null;
  createImpl?: (
    args: { data: Prisma.CapturedImageUncheckedCreateInput }
  ) => Promise<CapturedImageRow>;
  findUniqueResult?: CapturedImageRow | null;
} = {}): {
  prisma: ImagesFinalizeHandlerDeps['prisma'];
  createCalls: Array<{ data: Prisma.CapturedImageUncheckedCreateInput }>;
} {
  const createCalls: Array<{ data: Prisma.CapturedImageUncheckedCreateInput }> = [];
  const createImpl =
    opts.createImpl ??
    (async ({ data }: { data: Prisma.CapturedImageUncheckedCreateInput }) =>
      makeRow({
        id: 'img-' + (createCalls.length + 1),
        clientId: data.clientId,
        competitorUrlId: data.competitorUrlId,
        storagePath: data.storagePath,
        storageBucket: data.storageBucket,
        mimeType: data.mimeType,
        sourceType: data.sourceType as string,
        fileSize: typeof data.fileSize === 'number' ? data.fileSize : null,
        source: (data.source as string) ?? 'extension',
        addedBy: data.addedBy,
        imageCategory:
          typeof data.imageCategory === 'string' ? data.imageCategory : null,
        composition:
          typeof data.composition === 'string' ? data.composition : null,
        embeddedText:
          typeof data.embeddedText === 'string' ? data.embeddedText : null,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      }));
  const prisma: ImagesFinalizeHandlerDeps['prisma'] = {
    competitorUrl: {
      findFirst: async () =>
        opts.parent === undefined ? { id: 'url-1' } : opts.parent,
    },
    capturedImage: {
      create: async (args) => {
        createCalls.push(args);
        return createImpl(args);
      },
      findUnique: async () => opts.findUniqueResult ?? null,
    },
  };
  return { prisma, createCalls };
}

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

const validBody = {
  clientId: 'client-uuid-1',
  capturedImageId: 'img-uuid-1',
  mimeType: 'image/jpeg',
  sourceType: 'regular',
  fileSize: 1024,
};

function makeDeps(
  overrides: Partial<ImagesFinalizeHandlerDeps> = {}
): ImagesFinalizeHandlerDeps & {
  recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }>;
  markActiveCalls: string[];
  composeStoragePathCalls: Array<{
    projectId: string;
    competitorUrlId: string;
    capturedImageId: string;
    mimeType: string;
  }>;
} {
  const recordFlakeCalls: Array<{ op: string; err: unknown; ctx: object }> = [];
  const markActiveCalls: string[] = [];
  const composeStoragePathCalls: Array<{
    projectId: string;
    competitorUrlId: string;
    capturedImageId: string;
    mimeType: string;
  }> = [];
  const { prisma } = makeFakePrisma();
  const deps: ImagesFinalizeHandlerDeps = {
    prisma,
    verifyAuth: authOk,
    markWorkflowActive: async (projectId, workflow) => {
      markActiveCalls.push(`${projectId}|${workflow}`);
    },
    recordFlake: (op, err, c) => {
      recordFlakeCalls.push({ op, err, ctx: c });
    },
    withRetry: (fn) => fn(),
    verifyUploadedFile: async () => true,
    bucket: 'competition-scraping',
    composeStoragePath: (args) => {
      composeStoragePathCalls.push(args);
      return `${args.projectId}/${args.competitorUrlId}/${args.capturedImageId}.jpg`;
    },
    ...overrides,
  };
  return Object.assign(deps, {
    recordFlakeCalls,
    markActiveCalls,
    composeStoragePathCalls,
  });
}

test('POST 401 when verifyAuth rejects', async () => {
  const deps = makeDeps({ verifyAuth: auth401 });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 401);
});

test('POST 400 on invalid JSON body', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ jsonThrows: true }), ctx);
  assert.equal(r.status, 400);
});

test('POST 400 missing clientId', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: { ...validBody, clientId: '' } }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /clientId/);
});

test('POST 400 missing capturedImageId', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, capturedImageId: '' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /capturedImageId/);
});

test('POST 400 invalid mimeType', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, mimeType: 'image/gif' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /mimeType/);
});

test('POST 400 invalid sourceType', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, sourceType: 'thumbnail' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /sourceType/);
});

test('POST 400 invalid fileSize type', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, fileSize: 'big' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /fileSize/);
});

test('POST 400 invalid tags (non-string array)', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, tags: [1, 2] } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /tags/);
});

test('POST 400 invalid source value', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, source: 'bogus' } }),
    ctx
  );
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /source/);
});

test('POST 404 when parent URL is not found', async () => {
  const { prisma } = makeFakePrisma({ parent: null });
  const deps = makeDeps({ prisma });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 404);
});

test('POST 400 when uploaded file is missing in storage', async () => {
  const deps = makeDeps({ verifyUploadedFile: async () => false });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 400);
  assert.match((r.body as { error: string }).error, /No uploaded file/);
});

test('POST 400 when verifyUploadedFile throws → recordFlake fires + still 400', async () => {
  const deps = makeDeps({
    verifyUploadedFile: async () => {
      throw new Error('storage down');
    },
  });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 400);
  assert.equal(deps.recordFlakeCalls.length, 1);
  assert.match(deps.recordFlakeCalls[0].op, /verify/);
});

test('POST 201 happy path — default source extension', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 201);
  const body = r.body as { source: string; storagePath: string };
  assert.equal(body.source, 'extension');
  assert.equal(deps.composeStoragePathCalls.length, 1);
  assert.equal(deps.markActiveCalls.length, 1);
});

test('POST 201 with source: manual is persisted', async () => {
  const deps = makeDeps();
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(
    makeReq({ body: { ...validBody, source: 'manual' } }),
    ctx
  );
  assert.equal(r.status, 201);
  assert.equal((r.body as { source: string }).source, 'manual');
});

test('POST 200 idempotent on P2002 — returns existing row by clientId', async () => {
  const existing = makeRow({
    id: 'img-existing',
    clientId: 'client-uuid-1',
  });
  const { prisma } = makeFakePrisma({ findUniqueResult: existing });
  prisma.capturedImage.create = async () => {
    throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 200);
  assert.equal((r.body as { id: string }).id, 'img-existing');
});

test('POST 500 on unhandled Prisma error', async () => {
  const { prisma } = makeFakePrisma();
  prisma.capturedImage.create = async () => {
    throw new Error('database fell over');
  };
  const deps = makeDeps({ prisma });
  const { POST } = makeImagesFinalizeHandlers(deps);
  const r = await POST(makeReq({ body: validBody }), ctx);
  assert.equal(r.status, 500);
  assert.equal(deps.recordFlakeCalls.length, 1);
});
