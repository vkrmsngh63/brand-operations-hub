import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyProjectWorkflowAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import { corsPreflightResponse, withCors } from '@/lib/cors-response';
import {
  composeStoragePath,
  getFullSizeUrl,
  uploadBytesAsServer,
} from '@/lib/competition-storage';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  type AcceptedImageMimeType,
  type FetchImageByUrlRequest,
  type FetchImageByUrlResponse,
} from '@/lib/shared-types/competition-scraping';
import { safeFetch, type BlockReason } from '@/lib/ssrf-guard';

// W#2 P-29 Slice #3 — server-side fetch-by-URL image-upload endpoint.
//
// Powers the "or paste an image URL" modality in the manual-add captured-
// image modal. The browser CANNOT fetch a cross-origin image and turn it
// into bytes without the remote server's CORS cooperation, and the
// browser is also the wrong side of the SSRF guardrail (a malicious or
// careless user can paste any URL — internal LANs, cloud-metadata
// endpoints — and the server's privileged network position is what makes
// it dangerous). So we fetch + validate server-side.
//
// Flow (security-class — see src/lib/ssrf-guard.ts for the guardrail):
//
//   1. Validate request body shape.
//   2. Verify the parent CompetitorUrl belongs to this Project (so a
//      forged urlId can't land bytes in another project's bucket).
//   3. safeFetch the URL — SSRF allowlist (private/loopback/link-local
//      rejection, metadata-hostname rejection, scheme rejection); strict
//      size cap (5 MB per IMAGE_UPLOAD_MAX_BYTES); 10s timeout;
//      explicit 3xx-redirect refusal.
//   4. Validate Content-Type matches ACCEPTED_IMAGE_MIME_TYPES.
//   5. Generate a fresh capturedImageId; compose storage path.
//   6. Upload bytes to Supabase Storage server-side via the admin client.
//   7. Return RequestImageUploadResponse-shape (minus uploadUrl since
//      we already uploaded) so the client converges with the drag-drop
//      / paste paths at the finalize call.
//
// No DB row is created in this route — the CapturedImage row is created
// when the client calls .../images/finalize with `source: 'manual'`.

const WORKFLOW = 'competition-scraping';

// Hard timeout for the upstream fetch — matches the launch prompt's
// "10s hard cap on the fetch" requirement.
const UPSTREAM_FETCH_TIMEOUT_MS = 10_000;

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; urlId: string }>;
  }
) {
  const { projectId, urlId } = await params;
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const { projectWorkflowId } = auth;

  let body: Partial<FetchImageByUrlRequest>;
  try {
    body = (await req.json()) as Partial<FetchImageByUrlRequest>;
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    );
  }

  const imageUrl =
    typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  if (!imageUrl) {
    return withCors(
      req,
      NextResponse.json(
        { error: 'imageUrl is required and must be a non-empty string' },
        { status: 400 }
      )
    );
  }

  // Verify the parent CompetitorUrl belongs to this Project's W#2
  // workflow BEFORE doing any outbound fetch. Without this, a forged
  // urlId in the path could lead the server to fetch + upload bytes
  // tagged with another Project's scope. Same defense the requestUpload
  // route applies.
  const parent = await withRetry(() =>
    prisma.competitorUrl.findFirst({
      where: { id: urlId, projectWorkflowId },
      select: { id: true },
    })
  );
  if (!parent) {
    return withCors(
      req,
      NextResponse.json({ error: 'Competitor URL not found' }, { status: 404 })
    );
  }

  // SSRF-guarded fetch.
  const fetched = await safeFetch(imageUrl, {
    timeoutMs: UPSTREAM_FETCH_TIMEOUT_MS,
    maxBytes: IMAGE_UPLOAD_MAX_BYTES,
  });

  if (!fetched.ok) {
    // Map the structured reason to a sensible HTTP status + user-facing
    // message. 400 for client-side fixable issues (bad URL, wrong scheme,
    // blocked hostname), 413 for size-cap, 408 for timeout, 502 for
    // upstream errors.
    const { reason, message } = fetched;
    const status = httpStatusForReason(reason);
    return withCors(
      req,
      NextResponse.json(
        {
          error: userFacingMessage(reason, message),
          reason,
        },
        { status }
      )
    );
  }

  // Content-Type validation. We require an explicit recognized image MIME
  // type — refusing application/octet-stream or unknown types means a
  // server that lies about content-type doesn't get its bytes through.
  const rawContentType = (fetched.contentType ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(rawContentType)) {
    return withCors(
      req,
      NextResponse.json(
        {
          error: `Upstream Content-Type "${rawContentType || 'unknown'}" is not one of image/jpeg, image/png, image/webp`,
        },
        { status: 415 }
      )
    );
  }
  const mimeType = rawContentType as AcceptedImageMimeType;

  // Defense-in-depth — re-check the byte count against the cap. safeFetch
  // already enforced this via maxBytes, but the explicit assertion makes
  // the security boundary obvious in code review.
  if (fetched.bytes.byteLength > IMAGE_UPLOAD_MAX_BYTES) {
    return withCors(
      req,
      NextResponse.json(
        {
          error: `Fetched image is ${fetched.bytes.byteLength} bytes — exceeds the ${IMAGE_UPLOAD_MAX_BYTES} byte (5 MB) cap`,
        },
        { status: 413 }
      )
    );
  }

  const capturedImageId = randomUUID();
  const storagePath = composeStoragePath({
    projectId,
    competitorUrlId: urlId,
    capturedImageId,
    mimeType,
  });

  try {
    await uploadBytesAsServer({
      storagePath,
      bytes: fetched.bytes,
      contentType: mimeType,
    });
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url (upload)',
      error,
      { projectWorkflowId }
    );
    console.error('fetch-by-url server-side upload error:', error);
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'Failed to upload the fetched image to storage. Please try again.',
        },
        { status: 502 }
      )
    );
  }

  // Mint a short-lived preview URL so the modal can render a thumbnail
  // before the user finalizes the upload. The same TTL applies as for
  // the gallery's read URLs (1 hour per VIEW_URL_TTL_SECONDS).
  let previewUrl: string;
  try {
    previewUrl = await getFullSizeUrl(storagePath);
  } catch (error) {
    recordFlake(
      'POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url (preview-url)',
      error,
      { projectWorkflowId }
    );
    console.error('fetch-by-url preview URL error:', error);
    return withCors(
      req,
      NextResponse.json(
        {
          error:
            'Image uploaded but could not generate a preview URL. Please try again.',
        },
        { status: 502 }
      )
    );
  }

  const response: FetchImageByUrlResponse = {
    capturedImageId,
    storagePath,
    mimeType,
    fileSize: fetched.bytes.byteLength,
    previewUrl,
  };
  return withCors(req, NextResponse.json(response, { status: 200 }));
}

function httpStatusForReason(reason: BlockReason | 'timeout' | 'body-too-large' | 'http-error' | 'network-error' | 'redirect-blocked'): number {
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
    case 'loopback-v6':
    case 'link-local-v6':
    case 'unique-local-v6':
    case 'unspecified-v6':
    case 'multicast-v6':
    case 'reserved-v6':
      // 403 — semantically "we won't let you reach that address" rather
      // than "your input is malformed." Differentiates from invalid-scheme.
      return 403;
    case 'invalid-address':
      return 400;
    default:
      return 400;
  }
}

function userFacingMessage(reason: string, fallback: string): string {
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
