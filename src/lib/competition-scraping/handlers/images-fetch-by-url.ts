// W#2 P-31 — DI seam for the SSRF-guarded fetch-by-URL route
// (urls/[urlId]/images/fetch-by-url). Powers the "or paste an image URL"
// modality in the captured-image add modal.

import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  type AcceptedImageMimeType,
  type FetchImageByUrlRequest,
  type FetchImageByUrlResponse,
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

// Hard timeout for the upstream fetch — matches the route's prior
// behavior (10s hard cap).
export const UPSTREAM_FETCH_TIMEOUT_MS = 10_000;

export type Ctx = { params: Promise<{ projectId: string; urlId: string }> };

export type ImagesFetchByUrlPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: object;
      select?: object;
    }): Promise<{ id: string } | null>;
  };
};

// Result shape returned by the injectable safeFetch dep. Mirrors
// `src/lib/ssrf-guard.ts`'s public shape but local to this factory so
// the test doesn't need to import the real ssrf-guard.
export type SafeFetchOk = {
  ok: true;
  bytes: Uint8Array;
  contentType: string | null;
};
export type SafeFetchBlockReason =
  | 'invalid-scheme'
  | 'invalid-address'
  | 'metadata-hostname'
  | 'private-v4'
  | 'loopback-v4'
  | 'link-local-v4'
  | 'unspecified-v4'
  | 'broadcast-v4'
  | 'multicast-v4'
  | 'reserved-v4'
  | 'cgnat-v4'
  | 'private-v6'
  | 'loopback-v6'
  | 'link-local-v6'
  | 'unique-local-v6'
  | 'unspecified-v6'
  | 'multicast-v6'
  | 'reserved-v6'
  | 'timeout'
  | 'body-too-large'
  | 'http-error'
  | 'network-error'
  | 'redirect-blocked';
export type SafeFetchErr = {
  ok: false;
  reason: SafeFetchBlockReason;
  message: string;
};
export type SafeFetchResult = SafeFetchOk | SafeFetchErr;

export type SafeFetchFn = (
  url: string,
  opts: { timeoutMs: number; maxBytes: number }
) => Promise<SafeFetchResult>;

export type ImagesFetchByUrlHandlerDeps = {
  prisma: ImagesFetchByUrlPrismaLike;
  verifyAuth: VerifyAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
  safeFetch: SafeFetchFn;
  uploadBytesAsServer: (args: {
    storagePath: string;
    bytes: Uint8Array;
    contentType: string;
  }) => Promise<unknown>;
  getFullSizeUrl: (storagePath: string) => Promise<string>;
  composeStoragePath: (args: {
    projectId: string;
    competitorUrlId: string;
    capturedImageId: string;
    mimeType: AcceptedImageMimeType;
  }) => string;
  // Injectable UUID generator so tests can assert exact storagePath.
  generateCapturedImageId: () => string;
};

export function makeImagesFetchByUrlHandlers(
  deps: ImagesFetchByUrlHandlerDeps
) {
  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId, urlId } = await ctx.params;
    const auth = await deps.verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId } = auth;

    let body: Partial<FetchImageByUrlRequest>;
    try {
      body = (await req.json()) as Partial<FetchImageByUrlRequest>;
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    const imageUrl =
      typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
    if (!imageUrl) {
      return {
        status: 400,
        body: { error: 'imageUrl is required and must be a non-empty string' },
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

    const fetched = await deps.safeFetch(imageUrl, {
      timeoutMs: UPSTREAM_FETCH_TIMEOUT_MS,
      maxBytes: IMAGE_UPLOAD_MAX_BYTES,
    });

    if (!fetched.ok) {
      const status = httpStatusForReason(fetched.reason);
      return {
        status,
        body: {
          error: userFacingMessage(fetched.reason, fetched.message),
          reason: fetched.reason,
        },
      };
    }

    const rawContentType = (fetched.contentType ?? '')
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (
      !(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(rawContentType)
    ) {
      return {
        status: 415,
        body: {
          error: `Upstream Content-Type "${rawContentType || 'unknown'}" is not one of image/jpeg, image/png, image/webp`,
        },
      };
    }
    const mimeType = rawContentType as AcceptedImageMimeType;

    if (fetched.bytes.byteLength > IMAGE_UPLOAD_MAX_BYTES) {
      return {
        status: 413,
        body: {
          error: `Fetched image is ${fetched.bytes.byteLength} bytes — exceeds the ${IMAGE_UPLOAD_MAX_BYTES} byte (5 MB) cap`,
        },
      };
    }

    const capturedImageId = deps.generateCapturedImageId();
    const storagePath = deps.composeStoragePath({
      projectId,
      competitorUrlId: urlId,
      capturedImageId,
      mimeType,
    });

    try {
      await deps.uploadBytesAsServer({
        storagePath,
        bytes: fetched.bytes,
        contentType: mimeType,
      });
    } catch (error) {
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url (upload)',
        error,
        { projectWorkflowId }
      );
      console.error('fetch-by-url server-side upload error:', error);
      return {
        status: 502,
        body: {
          error:
            'Failed to upload the fetched image to storage. Please try again.',
        },
      };
    }

    let previewUrl: string;
    try {
      previewUrl = await deps.getFullSizeUrl(storagePath);
    } catch (error) {
      deps.recordFlake(
        'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url (preview-url)',
        error,
        { projectWorkflowId }
      );
      console.error('fetch-by-url preview URL error:', error);
      return {
        status: 502,
        body: {
          error:
            'Image uploaded but could not generate a preview URL. Please try again.',
        },
      };
    }

    const response: FetchImageByUrlResponse = {
      capturedImageId,
      storagePath,
      mimeType,
      fileSize: fetched.bytes.byteLength,
      previewUrl,
    };
    return { status: 200, body: response };
  }

  return { POST };
}

export function httpStatusForReason(reason: SafeFetchBlockReason): number {
  switch (reason) {
    case 'timeout':
      return 504;
    case 'body-too-large':
      return 413;
    case 'redirect-blocked':
    case 'http-error':
    case 'network-error':
      return 502;
    case 'invalid-scheme':
      return 400;
    case 'metadata-hostname':
    case 'private-v4':
    case 'loopback-v4':
    case 'link-local-v4':
    case 'unspecified-v4':
    case 'broadcast-v4':
    case 'multicast-v4':
    case 'reserved-v4':
    case 'cgnat-v4':
    case 'private-v6':
    case 'loopback-v6':
    case 'link-local-v6':
    case 'unique-local-v6':
    case 'unspecified-v6':
    case 'multicast-v6':
    case 'reserved-v6':
      return 403;
    case 'invalid-address':
      return 400;
    default:
      return 400;
  }
}

export function userFacingMessage(
  reason: SafeFetchBlockReason,
  fallback: string
): string {
  switch (reason) {
    case 'invalid-scheme':
      return 'imageUrl must use http:// or https:// scheme.';
    case 'metadata-hostname':
      return 'imageUrl points at a cloud-metadata endpoint, which is not allowed.';
    case 'private-v4':
    case 'private-v6':
    case 'unique-local-v6':
      return 'imageUrl resolves to a private network address, which is not allowed.';
    case 'loopback-v4':
    case 'loopback-v6':
      return 'imageUrl resolves to a loopback address, which is not allowed.';
    case 'link-local-v4':
    case 'link-local-v6':
      return 'imageUrl resolves to a link-local address (often cloud-metadata), which is not allowed.';
    case 'cgnat-v4':
      return 'imageUrl resolves to a carrier-grade NAT address, which is not allowed.';
    case 'unspecified-v4':
    case 'unspecified-v6':
    case 'broadcast-v4':
    case 'multicast-v4':
    case 'multicast-v6':
    case 'reserved-v4':
    case 'reserved-v6':
      return 'imageUrl resolves to a reserved address range, which is not allowed.';
    case 'redirect-blocked':
      return 'The image URL redirected. Please provide the final image URL directly (no redirects).';
    case 'timeout':
      return 'The upstream server took too long to respond. Please try a different URL.';
    case 'body-too-large':
      return 'The image is larger than 5 MB. Please use a smaller image.';
    case 'http-error':
      return fallback;
    case 'network-error':
      return 'Could not fetch the image. The URL may be wrong or the server is unreachable.';
    case 'invalid-address':
      return 'imageUrl could not be resolved.';
    default:
      return fallback;
  }
}
