// W#2 Competition Scraping & Deep Analysis — shared API types.
//
// This file is the single source of truth for the request and response
// shapes of the §11 API routes in
// docs/COMPETITION_SCRAPING_STACK_DECISIONS.md. Both the PLOS web app
// (src/app/api/...) AND the Chrome extension (extensions/competition-scraping/,
// added in a later session) import from this file. When an API contract
// changes on the server, the extension build fails at compile time on
// any caller it broke. See §12.3 of the stack-decisions doc.
//
// Wire-format note: every field that maps to a Prisma `DateTime` is typed
// as `string` here because `NextResponse.json(...)` serializes Date to ISO
// string and the receiver parses it as string. Decimal fields (none in the
// session-1 surface area) would similarly serialize to string.

// ─── Platform vocabulary ────────────────────────────────────────────────
// Source: prisma/schema.prisma CompetitorUrl.platform comment + W#2 design
// doc §A.7. Fixed at the platform layer; new platforms are an additive
// change here.
export const PLATFORMS = [
  'amazon',
  'ebay',
  'etsy',
  'walmart',
  'google-shopping',
  'google-ads',
  'independent-website',
] as const;
export type Platform = (typeof PLATFORMS)[number];

export function isPlatform(value: unknown): value is Platform {
  return (
    typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value)
  );
}

// ─── Vocabulary types ───────────────────────────────────────────────────
// Source: prisma/schema.prisma VocabularyEntry.vocabularyType comment + the
// stack-decisions doc §9.1. Project-scoped per PLATFORM_REQUIREMENTS.md
// §8.4 (any workflow on the same Project can READ + ADD).
export const VOCABULARY_TYPES = [
  'competition-category',
  'product-name',
  'brand-name',
  'content-category',
  'image-category',
  'custom-field-name-product',
  'custom-field-name-size',
] as const;
export type VocabularyType = (typeof VOCABULARY_TYPES)[number];

export function isVocabularyType(value: unknown): value is VocabularyType {
  return (
    typeof value === 'string' &&
    (VOCABULARY_TYPES as readonly string[]).includes(value)
  );
}

// ─── CompetitorUrl ──────────────────────────────────────────────────────
// Wire shape returned by GET / POST / PATCH on the urls endpoints.
// Mirrors prisma CompetitorUrl with Date → ISO string and customFields
// typed as Record<string, unknown> (Prisma JsonValue is too loose for
// callers).
export interface CompetitorUrl {
  id: string;
  projectWorkflowId: string;
  platform: Platform;
  url: string;
  competitionCategory: string | null;
  productName: string | null;
  brandName: string | null;
  resultsPageRank: number | null;
  productStarRating: number | null;
  sellerStarRating: number | null;
  numProductReviews: number | null;
  numSellerReviews: number | null;
  customFields: Record<string, unknown>;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

// POST /api/projects/[projectId]/competition-scraping/urls — request body.
// `platform` and `url` are required; the rest are optional and may be
// filled later via PATCH.
export interface CreateCompetitorUrlRequest {
  platform: Platform;
  url: string;
  competitionCategory?: string;
  productName?: string;
  brandName?: string;
  resultsPageRank?: number;
  productStarRating?: number;
  sellerStarRating?: number;
  numProductReviews?: number;
  numSellerReviews?: number;
  customFields?: Record<string, unknown>;
}

// PATCH /api/projects/[projectId]/competition-scraping/urls/[urlId] —
// every CreateCompetitorUrlRequest field is optional; unspecified fields
// are left unchanged.
export type UpdateCompetitorUrlRequest = Partial<CreateCompetitorUrlRequest>;

// POST /api/projects/[projectId]/competition-scraping/urls — response.
// 201 on first create; 200 on idempotent re-create (existing row returned
// unchanged when (projectWorkflowId, platform, url) already matches).
export type CreateCompetitorUrlResponse = CompetitorUrl;

// GET /api/projects/[projectId]/competition-scraping/urls?platform=... —
// response is the array of rows for the Project's W#2 workflow, optionally
// filtered by platform.
export type ListCompetitorUrlsResponse = CompetitorUrl[];

// PATCH .../urls/[urlId] response.
export type UpdateCompetitorUrlResponse = CompetitorUrl;

// DELETE .../urls/[urlId] response.
export interface DeleteCompetitorUrlResponse {
  success: true;
}

// ─── VocabularyEntry ────────────────────────────────────────────────────
export interface VocabularyEntry {
  id: string;
  projectId: string;
  vocabularyType: VocabularyType;
  value: string;
  addedByWorkflow: string;
  addedBy: string;
  addedAt: string;
}

// GET /api/projects/[projectId]/vocabulary?type=...
export type ListVocabularyEntriesResponse = VocabularyEntry[];

// POST /api/projects/[projectId]/vocabulary — upsert per §11.1. No error
// on duplicate; existing row returned. `addedByWorkflow` is the slug of
// the workflow making the entry (e.g., "competition-scraping"); defaults
// to "competition-scraping" if omitted on the wire.
export interface CreateVocabularyEntryRequest {
  vocabularyType: VocabularyType;
  value: string;
  addedByWorkflow?: string;
}

export type CreateVocabularyEntryResponse = VocabularyEntry;

// ─── CompetitorSize ─────────────────────────────────────────────────────
// Wire shape returned by sizes endpoints. price/shippingCost are Prisma
// Decimal columns; NextResponse.json serializes Decimal via toJSON →
// decimal string, so the wire type is `string | null`. Requests accept
// either number or string and Prisma normalizes.
export interface CompetitorSize {
  id: string;
  competitorUrlId: string;
  sizeOption: string;
  price: string | null;
  shippingCost: string | null;
  customFields: Record<string, unknown>;
  sortOrder: number;
  addedAt: string;
  updatedAt: string;
}

// POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/sizes
// — required: sizeOption. Other fields optional and may be filled later
// via PATCH. No idempotency per §9.2 — sizes are explicit user actions.
export interface CreateCompetitorSizeRequest {
  sizeOption: string;
  price?: number | string;
  shippingCost?: number | string;
  customFields?: Record<string, unknown>;
  sortOrder?: number;
}

export type UpdateCompetitorSizeRequest = Partial<CreateCompetitorSizeRequest>;
export type CreateCompetitorSizeResponse = CompetitorSize;
export type UpdateCompetitorSizeResponse = CompetitorSize;
export interface DeleteCompetitorSizeResponse {
  success: true;
}

// ─── CapturedText ───────────────────────────────────────────────────────
// Wire shape for text captures. Idempotent on clientId per §9.2 — the
// extension's WAL uses clientId as the dedup key across retries.
export interface CapturedText {
  id: string;
  clientId: string;
  competitorUrlId: string;
  contentCategory: string | null;
  text: string;
  tags: string[];
  sortOrder: number;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

// POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text
// — required: clientId (UUIDv4 from extension), text. Idempotent: a
// duplicate clientId returns the existing row with 200 instead of erroring.
export interface CreateCapturedTextRequest {
  clientId: string;
  contentCategory?: string;
  text: string;
  tags?: string[];
  sortOrder?: number;
}

// PATCH .../text/[textId] — clientId is immutable; cannot be re-targeted.
export type UpdateCapturedTextRequest = Omit<
  Partial<CreateCapturedTextRequest>,
  'clientId'
>;

export type CreateCapturedTextResponse = CapturedText;
export type UpdateCapturedTextResponse = CapturedText;
export interface DeleteCapturedTextResponse {
  success: true;
}

// ─── Image MIME + size constants ─────────────────────────────────────────
// Per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §3:
//   - Accept JPEG, PNG, WebP. Reject SVG (XSS) + HEIC/HEIF (browser
//     compatibility). Enforced server-side at requestUpload.
//   - 5 MB cap per upload — A+ Content screenshots at 1080p webp average
//     ~1-2 MB; product shots ~200 KB; cap covers heavy tail without
//     permitting accidental video uploads.
export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export type AcceptedImageMimeType = (typeof ACCEPTED_IMAGE_MIME_TYPES)[number];

export function isAcceptedImageMimeType(
  value: unknown
): value is AcceptedImageMimeType {
  return (
    typeof value === 'string' &&
    (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(value)
  );
}

// 5 MB per §3 — enforced at requestUpload before issuing the signed URL.
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export const IMAGE_SOURCE_TYPES = ['regular', 'region-screenshot'] as const;
export type ImageSourceType = (typeof IMAGE_SOURCE_TYPES)[number];

export function isImageSourceType(value: unknown): value is ImageSourceType {
  return (
    typeof value === 'string' &&
    (IMAGE_SOURCE_TYPES as readonly string[]).includes(value)
  );
}

// ─── CapturedImage ──────────────────────────────────────────────────────
export interface CapturedImage {
  id: string;
  clientId: string;
  competitorUrlId: string;
  imageCategory: string | null;
  storagePath: string;
  storageBucket: string;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
  sourceType: ImageSourceType;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

// Two-phase image upload per §3 + §11.1. Note the slash-based RPC paths
// (images/requestUpload, images/finalize) used in the actual route file
// system — the §11.1 colon-suffix shape was replaced with slashes during
// the W#2 API-routes session-2 build for Next.js convention alignment.
//
// Phase 1: POST .../urls/[urlId]/images/requestUpload — server validates
// MIME + size, pre-creates a CapturedImage row with state-incomplete
// metadata, and returns a 5-minute signed Supabase Storage URL the
// extension PUTs the bytes to directly.
export interface RequestImageUploadRequest {
  clientId: string;
  mimeType: AcceptedImageMimeType;
  fileSize: number;
  sourceType: ImageSourceType;
  imageCategory?: string;
}

export interface RequestImageUploadResponse {
  uploadUrl: string;
  capturedImageId: string;
  storagePath: string;
  expiresAt: string;
}

// Phase 2: POST .../urls/[urlId]/images/finalize — extension finished
// uploading the bytes; server creates the CapturedImage row pointing at
// the uploaded file. mimeType + fileSize are echoed back from the
// requestUpload call so the server can re-derive the storagePath without
// keeping intermediate state. composition / embeddedText / tags /
// dimensions are user-provided metadata that lands on the row.
//
// Idempotency: a duplicate clientId returns the existing row with 200
// instead of erroring (extension WAL retry path per §8.3.1).
export interface FinalizeImageUploadRequest {
  clientId: string;
  capturedImageId: string;
  mimeType: AcceptedImageMimeType;
  sourceType: ImageSourceType;
  fileSize?: number;
  imageCategory?: string;
  composition?: string;
  embeddedText?: string;
  tags?: string[];
  width?: number;
  height?: number;
  sortOrder?: number;
}

export type FinalizeImageUploadResponse = CapturedImage;

// PATCH .../images/[imageId] — fields the user can edit after the upload
// is finalized. clientId, sourceType, storagePath, fileSize, mimeType,
// width, height are immutable after capture.
export interface UpdateCapturedImageRequest {
  imageCategory?: string;
  composition?: string;
  embeddedText?: string;
  tags?: string[];
  sortOrder?: number;
}

export type UpdateCapturedImageResponse = CapturedImage;
export interface DeleteCapturedImageResponse {
  success: true;
}

// ─── Reconcile ──────────────────────────────────────────────────────────
// GET /api/projects/[projectId]/competition-scraping/reconcile?platform=...
// per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §8.3.2. Extension calls
// every 5 minutes; compares against its local cache; full re-fetch if
// divergent. lastModified is the most recent updatedAt across the three
// child tables for the (project, platform) scope, or epoch (1970-01-01)
// when no rows exist for the scope.
export interface ReconcileResponse {
  platform: Platform;
  urlCount: number;
  textCount: number;
  imageCount: number;
  lastModified: string;
}

// ─── Generic error shape ────────────────────────────────────────────────
// Returned with non-2xx status codes (consistent with the W#1 routes).
export interface ApiErrorResponse {
  error: string;
}
