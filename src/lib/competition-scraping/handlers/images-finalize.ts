// W#2 P-31 — DI seam for the captured-image finalize route
// (urls/[urlId]/images/finalize). Mirrors the urls.ts / url-text.ts
// factory pattern.

import { Prisma } from '@prisma/client';

import {
  isAcceptedImageMimeType,
  isImageSourceType,
  isSource,
  type AcceptedImageMimeType,
  type CapturedImage,
  type FinalizeImageUploadRequest,
} from '../../shared-types/competition-scraping.ts';

import type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
} from './shared.ts';

export type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
  VerifyAuthResult,
} from './shared.ts';

const WORKFLOW = 'competition-scraping';

export type Ctx = { params: Promise<{ projectId: string; urlId: string }> };

export type CapturedImageRow = {
  id: string;
  clientId: string;
  competitorUrlId: string;
  imageCategory: string | null;
  storagePath: string;
  storageBucket: string;
  composition: string | null;
  embeddedText: string | null;
  tags: Prisma.JsonValue;
  sourceType: string;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  source: string;
  addedBy: string;
  addedAt: Date;
  updatedAt: Date;
};

export type ImagesFinalizePrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
  capturedImage: {
    create(args: {
      data: Prisma.CapturedImageUncheckedCreateInput;
    }): Promise<CapturedImageRow>;
    findUnique(args: { where: object }): Promise<CapturedImageRow | null>;
  };
};

export type ImagesFinalizeHandlerDeps = {
  prisma: ImagesFinalizePrismaLike;
  verifyAuth: VerifyAuthFn;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
  // Server-side storage check — true if the bytes exist at storagePath.
  verifyUploadedFile: (storagePath: string) => Promise<boolean>;
  // Bucket name + path composer — passed in so the factory doesn't pull
  // in `competition-storage.ts` (which requires Supabase admin client).
  bucket: string;
  composeStoragePath: (args: {
    projectId: string;
    competitorUrlId: string;
    capturedImageId: string;
    mimeType: AcceptedImageMimeType;
  }) => string;
};

export function toWireShape(row: CapturedImageRow | null): CapturedImage | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.clientId,
    competitorUrlId: row.competitorUrlId,
    imageCategory: row.imageCategory,
    storagePath: row.storagePath,
    storageBucket: row.storageBucket,
    composition: row.composition,
    embeddedText: row.embeddedText,
    tags: (row.tags ?? []) as string[],
    sourceType: row.sourceType as CapturedImage['sourceType'],
    fileSize: row.fileSize,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    sortOrder: row.sortOrder,
    source: row.source as CapturedImage['source'],
    addedBy: row.addedBy,
    addedAt: row.addedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export function makeImagesFinalizeHandlers(deps: ImagesFinalizeHandlerDeps) {
  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId, userId } = auth;

    let body: Partial<FinalizeImageUploadRequest>;
    try {
      body = (await req.json()) as Partial<FinalizeImageUploadRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    const clientId =
      typeof body.clientId === 'string' ? body.clientId.trim() : '';
    const capturedImageId =
      typeof body.capturedImageId === 'string'
        ? body.capturedImageId.trim()
        : '';
    if (!clientId) {
      return {
        status: 400,
        body: {
          error: 'clientId is required and must be a non-empty string',
        },
      };
    }
    if (!capturedImageId) {
      return {
        status: 400,
        body: {
          error:
            'capturedImageId is required and must be a non-empty string',
        },
      };
    }
    if (!isAcceptedImageMimeType(body.mimeType)) {
      return {
        status: 400,
        body: {
          error:
            'mimeType is required and must be one of image/jpeg, image/png, image/webp',
        },
      };
    }
    if (!isImageSourceType(body.sourceType)) {
      return {
        status: 400,
        body: {
          error:
            'sourceType is required and must be either "regular" or "region-screenshot"',
        },
      };
    }
    if (
      body.fileSize !== undefined &&
      (typeof body.fileSize !== 'number' || !Number.isFinite(body.fileSize))
    ) {
      return {
        status: 400,
        body: { error: 'fileSize must be a number when provided' },
      };
    }
    if (body.tags !== undefined && !isStringArray(body.tags)) {
      return {
        status: 400,
        body: { error: 'tags must be an array of strings' },
      };
    }
    if (
      body.width !== undefined &&
      (typeof body.width !== 'number' || !Number.isFinite(body.width))
    ) {
      return {
        status: 400,
        body: { error: 'width must be a number when provided' },
      };
    }
    if (
      body.height !== undefined &&
      (typeof body.height !== 'number' || !Number.isFinite(body.height))
    ) {
      return {
        status: 400,
        body: { error: 'height must be a number when provided' },
      };
    }
    if (
      body.sortOrder !== undefined &&
      (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder))
    ) {
      return {
        status: 400,
        body: { error: 'sortOrder must be a number when provided' },
      };
    }
    if (body.source !== undefined && !isSource(body.source)) {
      return {
        status: 400,
        body: {
          error:
            'source must be either "extension" or "manual" when provided',
        },
      };
    }

    const parent = await deps.withRetry(() =>
      deps.prisma.competitorUrl.findFirst({
        where: { id: urlId, projectWorkflowId },
        select: { id: true },
      })
    );
    if (!parent) {
      return { status: 404, body: { error: 'Competitor URL not found' } };
    }

    const storagePath = deps.composeStoragePath({
      projectId,
      competitorUrlId: urlId,
      capturedImageId,
      mimeType: body.mimeType,
    });

    let fileExists = false;
    try {
      fileExists = await deps.verifyUploadedFile(storagePath);
    } catch (error) {
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize (verify)',
        error,
        { projectWorkflowId }
      );
      console.error('Storage verification error:', error);
    }
    if (!fileExists) {
      return {
        status: 400,
        body: {
          error:
            'No uploaded file found at the expected storagePath. Re-request the upload URL and retry the upload before finalizing.',
        },
      };
    }

    const createData: Prisma.CapturedImageUncheckedCreateInput = {
      clientId,
      competitorUrlId: urlId,
      imageCategory:
        typeof body.imageCategory === 'string' && body.imageCategory.trim()
          ? body.imageCategory.trim()
          : null,
      storagePath,
      storageBucket: deps.bucket,
      composition:
        typeof body.composition === 'string' && body.composition.trim()
          ? body.composition.trim()
          : null,
      embeddedText:
        typeof body.embeddedText === 'string' && body.embeddedText.trim()
          ? body.embeddedText.trim()
          : null,
      tags: body.tags ?? [],
      sourceType: body.sourceType,
      fileSize: typeof body.fileSize === 'number' ? body.fileSize : null,
      mimeType: body.mimeType,
      width: typeof body.width === 'number' ? body.width : null,
      height: typeof body.height === 'number' ? body.height : null,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      source: body.source ?? 'extension',
      addedBy: userId,
    };

    try {
      const created = await deps.withRetry(() =>
        deps.prisma.capturedImage.create({ data: createData })
      );
      await deps.markWorkflowActive(projectId, WORKFLOW);
      return { status: 201, body: toWireShape(created) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        try {
          const existing = await deps.withRetry(() =>
            deps.prisma.capturedImage.findUnique({ where: { clientId } })
          );
          if (existing) {
            return { status: 200, body: toWireShape(existing) };
          }
        } catch (lookupError) {
          deps.recordFlake(
            'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize (idempotent-lookup)',
            lookupError,
            { retried: true, projectWorkflowId }
          );
        }
      }
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize',
        error,
        { retried: true, projectWorkflowId }
      );
      console.error(
        'POST competition-scraping image finalize error:',
        error
      );
      return {
        status: 500,
        body: { error: 'Failed to finalize captured image' },
      };
    }
  }

  return { POST };
}
