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

// ─── Source vocabulary (P-29 Slice #1) ──────────────────────────────────
// Audit-trail of which client created a CompetitorUrl / CapturedText /
// CapturedImage row. `extension` = Chrome extension capture; `manual` =
// vklf.com modal entry. Default for unset rows is `extension` (preserves
// pre-P-29 extension-only world). Backward-compatible additive change —
// existing readers ignore the field; new readers opt in.
export const SOURCES = ['extension', 'manual'] as const;
export type Source = (typeof SOURCES)[number];

export function isSource(value: unknown): value is Source {
  return (
    typeof value === 'string' && (SOURCES as readonly string[]).includes(value)
  );
}

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
  'video-category',
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
  // P-6 — Sponsored Ad flag. NOT NULL with default false at the schema layer
  // (prisma/schema.prisma CompetitorUrl.isSponsoredAd), so always present on
  // the wire. Manual checkbox in the extension's URL-add overlay; auto-pre-
  // checks for Amazon SSPA-detected URLs (P-4 synergy).
  isSponsoredAd: boolean;
  customFields: Record<string, unknown>;
  // P-29 Slice #1 — `extension` = Chrome extension capture; `manual` =
  // vklf.com modal entry. Defaults to `extension` server-side when the
  // wire omits it, so the extension's existing POST traffic stays
  // unchanged. Always present on the wire (schema-level @default).
  source: Source;
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
  // P-6 — optional on the wire; defaults to false server-side via the
  // schema-level @default(false) when omitted.
  isSponsoredAd?: boolean;
  customFields?: Record<string, unknown>;
  // P-29 Slice #1 — optional; defaults to `extension` server-side when
  // omitted so the Chrome extension's existing POST traffic stays
  // unchanged. vklf.com's manual-add modal sends `manual` explicitly.
  source?: Source;
}

// PATCH /api/projects/[projectId]/competition-scraping/urls/[urlId] —
// every CreateCompetitorUrlRequest field is optional; unspecified fields
// are left unchanged. Nullable fields additionally accept `null` to clear
// the column back to "—" (the route's per-key handler maps non-string /
// non-number to `null` already; this type makes the wire shape explicit so
// the inline-edit UI can clear a field without a cast).
export interface UpdateCompetitorUrlRequest {
  platform?: Platform;
  url?: string;
  competitionCategory?: string | null;
  productName?: string | null;
  brandName?: string | null;
  resultsPageRank?: number | null;
  productStarRating?: number | null;
  sellerStarRating?: number | null;
  numProductReviews?: number | null;
  numSellerReviews?: number | null;
  // P-6 — non-nullable boolean toggle; PATCH accepts true/false to flip the
  // flag (no `null` since the column is NOT NULL).
  isSponsoredAd?: boolean;
  customFields?: Record<string, unknown>;
}

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

// GET .../urls/[urlId] response — single row read for the per-URL detail
// page. Same shape as the create/update responses; the read path exists to
// support deep-linkable detail pages and admin reconciliation flows.
export type ReadCompetitorUrlResponse = CompetitorUrl;

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

// GET .../urls/[urlId]/sizes — list every size attached to one URL,
// ordered by sortOrder (stable across reloads).
export type ListCompetitorSizesResponse = CompetitorSize[];

// ─── CapturedText ───────────────────────────────────────────────────────
// Wire shape for text captures. Idempotent on clientId per §9.2 — the
// extension's WAL uses clientId as the dedup key across retries.
export interface CapturedText {
  id: string;
  clientId: string;
  competitorUrlId: string;
  contentCategory: string | null;
  text: string;
  // P-25: serialized selector describing where the captured text lived in
  // the source page DOM, so the content-script can re-locate the Range and
  // render a light-yellow haze on later visits. Shape:
  // JSON-encoded `{xpath, startOffset, endOffset}` resolved against
  // document.body. Null for rows captured pre-P-25 (no recoverable
  // selector) and for manual-add rows (no source DOM at capture time).
  selector: string | null;
  tags: string[];
  sortOrder: number;
  // P-29 Slice #1 — see CompetitorUrl.source.
  source: Source;
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
  // P-29 Slice #1 — see CreateCompetitorUrlRequest.source. Slice #2 wires
  // this to vklf.com's manual-add text modal; Slice #1 only adds the
  // field shape so the extension's existing POSTs continue to default to
  // `extension` server-side.
  source?: Source;
  // P-25: optional serialized selector for the on-page text haze on later
  // visits. Persisted as-is to CapturedText.selector. Absent on manual-add
  // captures and pre-P-25 extension captures.
  selector?: string;
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

// GET .../urls/[urlId]/text — list every captured-text row for one URL,
// ordered by (sortOrder ASC, addedAt ASC) so the detail-page table is
// stable across reloads.
export type ListCapturedTextsResponse = CapturedText[];

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
  // P-24: host-page <img>.src this row was captured from. Null for rows
  // captured before P-24 (no backfill path); set for new captures so the
  // content-script saved-image indicator can match.
  originalSrcUrl: string | null;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];
  sourceType: ImageSourceType;
  fileSize: number | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  sortOrder: number;
  // P-29 Slice #1 — see CompetitorUrl.source. Distinct from sourceType
  // (which describes the image's content shape — regular vs. region-
  // screenshot); source describes which CLIENT created the row.
  source: Source;
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
  // P-29 Slice #1 — see CreateCompetitorUrlRequest.source. Slice #3 wires
  // this to vklf.com's manual-add image modal.
  source?: Source;
  // P-24: optional host-page <img>.src that produced this capture. Persisted
  // so the content-script can later match host-page images against saved
  // rows. Absent on manual-add captures (P-29 Slice #3) and region-screenshot
  // captures where no source <img> exists.
  originalSrcUrl?: string;
}

export type FinalizeImageUploadResponse = CapturedImage;

// W#2 P-29 Slice #3 — server-side fetch-by-URL endpoint that powers the
// "or paste an image URL" modality in the manual-add captured-image modal.
//
// POST .../urls/[urlId]/images/fetch-by-url
//
// Body: { imageUrl: string } — a user-supplied public image URL.
//
// Server-side flow (security-class — see src/lib/ssrf-guard.ts):
//   1. Pre-resolve URL safety check (scheme + cloud-metadata hostname).
//   2. DNS-resolve hostname + reject if any returned IP is in a blocked
//      private/loopback/link-local range.
//   3. Connect to the validated IP directly (closes DNS-rebind window).
//   4. Stream bytes with 5 MB cap + 10s timeout + 3xx-redirect refusal.
//   5. Validate Content-Type is in ACCEPTED_IMAGE_MIME_TYPES.
//   6. Upload bytes to Supabase Storage server-side (admin client; no
//      signed URL needed since the upload happens in-process).
//   7. Return RequestImageUploadResponse-shape so the client can call
//      finalize on the standard route. The two-phase + this Phase-0
//      shape converge at finalize.
//
// On any guardrail failure, returns 4xx with an `error` message.
export interface FetchImageByUrlRequest {
  imageUrl: string;
}

// Response shape mirrors RequestImageUploadResponse except `uploadUrl`
// is omitted — the bytes are already uploaded server-side, so the client
// goes straight to finalize. mimeType + fileSize are derived from the
// fetched bytes; the client echoes both into the finalize call (mimeType
// is required by the finalize route, fileSize is optional metadata).
// previewUrl is a short-lived (1-hour TTL) signed URL pointing at the
// uploaded storage path so the modal can render a preview thumbnail
// before the user finalizes the upload.
export interface FetchImageByUrlResponse {
  capturedImageId: string;
  storagePath: string;
  mimeType: AcceptedImageMimeType;
  fileSize: number;
  previewUrl: string;
}

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

// CapturedImageWithUrls — list-response row shape: a CapturedImage plus the
// two short-lived signed URLs the PLOS-side viewer needs to render the
// image bytes. Slice (a.2) added the URL fields; the bare CapturedImage
// type is preserved as the DB-shaped row used by PATCH / finalize / etc.
// where the URLs are not minted (PATCH only changes metadata, so the
// caller spreads the response into the existing list row, preserving the
// URLs that the list mint already produced).
//
// thumbnailUrl: 200×200 contain-fit signed URL (Supabase on-the-fly
// transform per `src/lib/competition-storage.ts` getThumbnailUrl). 1-hour
// TTL.
//
// fullSizeUrl: original-resolution signed URL (no transform, served
// straight from storage per getFullSizeUrl). 1-hour TTL — long enough for
// any single page session including modal browsing.
export interface CapturedImageWithUrls extends CapturedImage {
  thumbnailUrl: string;
  fullSizeUrl: string;
}

// GET .../urls/[urlId]/images — list every captured-image row for one URL,
// ordered by (sortOrder ASC, addedAt ASC). Slice (a.2) extended the wire
// shape from `CapturedImage[]` to `CapturedImageWithUrls[]` so the gallery
// + modal can render in a single round-trip. The URLs are minted server-
// side via the competition-storage helper; clients never see Supabase SDK
// directly.
export type ListCapturedImagesResponse = CapturedImageWithUrls[];

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

// ─── Highlight Terms (W#2 P-3 narrowed, 2026-05-10) ────────────────────
// Per-user-per-project Highlight Terms moved from chrome.storage.local-only
// to PLOS DB so signing in from any device / Chrome profile preserves
// state. Wire shape mirrors the extension's HighlightTerm interface
// (`{term, color}`) so the storage swap is structurally invisible to the
// popup's term-management code. Color is a 7-char hex from the §6
// 20-color palette; term is a non-empty trimmed string.
export interface HighlightTermDto {
  term: string;
  color: string;
}

// GET /api/projects/[projectId]/extension-state/highlight-terms response.
// Terms returned in user-facing display order (sortOrder ASC).
export interface ListHighlightTermsResponse {
  terms: HighlightTermDto[];
}

// PUT /api/projects/[projectId]/extension-state/highlight-terms body.
// Replaces the entire list atomically — server deletes prior rows for
// (userId, projectId) and inserts the request body's terms in array
// order (each term's sortOrder = array index).
export interface ReplaceHighlightTermsRequest {
  terms: HighlightTermDto[];
}

// PUT response: the canonical post-write list (mirrors GET response).
export type ReplaceHighlightTermsResponse = ListHighlightTermsResponse;

// ─── Extension State (W#2 P-3 broader scope, 2026-05-10-e) ─────────────
// Per-user W#2 Chrome extension state — last-picked Project + last-picked
// Platform — moved from chrome.storage.local-only to PLOS DB so signing
// in from any device / Chrome profile preserves the user's setup picks.
// Server enforces today's "switching project clears platform" invariant
// on PUT (see route.ts).
export interface ExtensionStateDto {
  selectedProjectId: string | null;
  selectedPlatform: string | null;
}

// GET /api/extension-state response.
export type GetExtensionStateResponse = ExtensionStateDto;

// PUT /api/extension-state body. Both fields explicit (null = clear).
export type ReplaceExtensionStateRequest = ExtensionStateDto;

// PUT response: the canonical post-write state (mirrors GET response —
// reflects the server's view, including any platform-clear that the
// "switching project clears platform" invariant triggered).
export type ReplaceExtensionStateResponse = ExtensionStateDto;

// ─── Video MIME + size constants (P-27 Build #1) ────────────────────────
// Per docs/CAPTURED_VIDEOS_DESIGN.md §A.9:
//   - Accept video/mp4, video/webm, video/quicktime. Three formats commonly
//     served by <video> elements across the supported platforms. Extensible
//     later if a platform serves something unusual.
//   - 100 MB per-file cap per §A.10 — comfortably covers product demos
//     (~10-50 MB at 720p MP4), customer-review videos, A+ content videos.
//     Larger videos go through the YouTube/Vimeo embed path instead.
//   - Two-layer enforcement per §A.11: client-side pre-upload check +
//     server-side requestVideoUploadUrl 413. Bucket-level cap deferred per
//     scripts/create-competition-scraping-videos-bucket.mjs note.
export const ACCEPTED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;
export type AcceptedVideoMimeType = (typeof ACCEPTED_VIDEO_MIME_TYPES)[number];

export function isAcceptedVideoMimeType(
  value: unknown
): value is AcceptedVideoMimeType {
  return (
    typeof value === 'string' &&
    (ACCEPTED_VIDEO_MIME_TYPES as readonly string[]).includes(value)
  );
}

// 100 MB per §A.10 — enforced at requestVideoUploadUrl before issuing the
// signed URL.
export const VIDEO_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

// Video source-type discriminator matching the Prisma `VideoSourceType` enum
// at prisma/schema.prisma. EMBED rows have a YouTube/Vimeo URL only (no
// bytes); DIRECT_BYTES rows have uploaded video bytes in Supabase Storage.
export const VIDEO_SOURCE_TYPES = ['EMBED', 'DIRECT_BYTES'] as const;
export type VideoSourceType = (typeof VIDEO_SOURCE_TYPES)[number];

export function isVideoSourceType(value: unknown): value is VideoSourceType {
  return (
    typeof value === 'string' &&
    (VIDEO_SOURCE_TYPES as readonly string[]).includes(value)
  );
}

// ─── CapturedVideo wire shape ───────────────────────────────────────────
// Mirrors prisma CapturedVideo with Date → ISO string and tags as string[]
// (Prisma stores Json; the wire-format is the array shape). Nullable storage
// + bytes fields when sourceType=EMBED (no Supabase upload for embeds).
export interface CapturedVideo {
  id: string;
  clientId: string;
  competitorUrlId: string;
  projectId: string;

  sourceType: VideoSourceType;
  originalSrcUrl: string;

  storagePath: string | null;
  storageBucket: string | null;
  fileSize: number | null;
  mimeType: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;

  thumbnailStoragePath: string | null;

  videoCategory: string | null;
  composition: string | null;
  embeddedText: string | null;
  tags: string[];

  sortOrder: number;
  source: Source;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
}

// ─── Video upload route shapes (P-27 Build #2) ──────────────────────────
// Two-phase upload for DIRECT_BYTES rows (parallel to image two-phase per §3,
// but the Phase-1 response carries TWO signed URLs per §A.9: one for the
// video bytes, one for the thumbnail JPEG produced by the extension's canvas
// frame-grab). EMBED rows SKIP Phase 1 — there are no bytes to upload — and
// call finalize directly with `sourceType='EMBED'` + `originalSrcUrl` only.
//
// Phase 1: POST .../urls/[urlId]/videos/requestUpload — DIRECT_BYTES only.
// Server validates MIME + size + parent URL ownership, generates a fresh
// capturedVideoId, returns the two signed URLs the extension PUTs the video
// bytes + thumbnail JPEG to. No DB write happens here; the CapturedVideo
// row is created at :finalize. Mirrors the image requestUpload contract.
export interface RequestVideoUploadRequest {
  clientId: string;
  mimeType: AcceptedVideoMimeType;
  fileSize: number;
}

export interface RequestVideoUploadResponse {
  capturedVideoId: string;
  videoUploadUrl: string;
  videoStoragePath: string;
  videoToken: string;
  thumbnailUploadUrl: string;
  thumbnailStoragePath: string;
  thumbnailToken: string;
  expiresAt: string;
}

// Phase 2: POST .../urls/[urlId]/videos/finalize — handles BOTH EMBED and
// DIRECT_BYTES branches.
//
//   - EMBED: client passes sourceType='EMBED' + originalSrcUrl (the YouTube /
//     Vimeo / etc. URL); storage fields omitted; server creates the row with
//     NULL storage paths. Skips storage-existence verification (no bytes
//     uploaded). User-provided metadata (videoCategory / composition / tags
//     / etc.) optional.
//
//   - DIRECT_BYTES: client passes sourceType='DIRECT_BYTES' + capturedVideoId
//     (from Phase 1) + originalSrcUrl (page-host URL the bytes came from) +
//     videoStoragePath (from Phase 1) + thumbnailStoragePath (from Phase 1
//     when canvas frame-grab succeeded; OMITTED when frame-grab failed per
//     §A.12 — the row stores NULL thumbnailStoragePath and the renderer
//     falls back to the generic ▶️ icon) + bytes metadata (mimeType /
//     fileSize / durationSeconds / width / height). Server verifies both
//     storage objects exist via finalizeVideoUpload helper before creating
//     the row.
//
// Idempotency: duplicate clientId returns the existing row with 200 instead
// of erroring (mirrors image finalize behavior; supports extension WAL
// retry path).
export interface FinalizeVideoUploadRequest {
  clientId: string;
  sourceType: VideoSourceType;
  originalSrcUrl: string;

  // DIRECT_BYTES path — required when sourceType='DIRECT_BYTES':
  capturedVideoId?: string;
  videoStoragePath?: string;

  // DIRECT_BYTES path — optional bytes metadata:
  thumbnailStoragePath?: string;
  mimeType?: AcceptedVideoMimeType;
  fileSize?: number;
  durationSeconds?: number;
  width?: number;
  height?: number;

  // Both paths — user-provided metadata:
  videoCategory?: string;
  composition?: string;
  embeddedText?: string;
  tags?: string[];
  sortOrder?: number;
  source?: Source;
}

export type FinalizeVideoUploadResponse = CapturedVideo;

// GET .../urls/[urlId]/videos — list every CapturedVideo for one URL,
// ordered by (sortOrder ASC, addedAt ASC). Bare CapturedVideo[] for Build #2;
// signed-URL minting (for inline playback + thumbnail rendering) lands in a
// later Build session when the URL detail page renderer needs it.
export type ListCapturedVideosResponse = CapturedVideo[];

// PATCH .../videos/[videoId] — fields editable after capture. clientId,
// sourceType, originalSrcUrl, storage paths, and bytes-derived metadata are
// immutable; re-capture is the path to change them.
export interface UpdateCapturedVideoRequest {
  videoCategory?: string;
  composition?: string;
  embeddedText?: string;
  tags?: string[];
  sortOrder?: number;
}

export type UpdateCapturedVideoResponse = CapturedVideo;

export interface DeleteCapturedVideoResponse {
  success: true;
}

// Type guards used at the trust boundary inside the route handlers to reject
// misshapen payloads BEFORE issuing signed URLs or writing to the DB.

export function isRequestVideoUploadRequest(
  value: unknown
): value is RequestVideoUploadRequest {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.clientId === 'string' &&
    v.clientId.trim().length > 0 &&
    isAcceptedVideoMimeType(v.mimeType) &&
    typeof v.fileSize === 'number' &&
    Number.isFinite(v.fileSize) &&
    v.fileSize > 0
  );
}

export function isFinalizeVideoUploadRequest(
  value: unknown
): value is FinalizeVideoUploadRequest {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.clientId !== 'string' || v.clientId.trim().length === 0) {
    return false;
  }
  if (!isVideoSourceType(v.sourceType)) return false;
  if (
    typeof v.originalSrcUrl !== 'string' ||
    v.originalSrcUrl.trim().length === 0
  ) {
    return false;
  }
  if (v.sourceType === 'DIRECT_BYTES') {
    if (
      typeof v.capturedVideoId !== 'string' ||
      v.capturedVideoId.trim().length === 0
    ) {
      return false;
    }
    if (
      typeof v.videoStoragePath !== 'string' ||
      v.videoStoragePath.trim().length === 0
    ) {
      return false;
    }
    // thumbnailStoragePath OPTIONAL — absent when canvas frame-grab failed
    // per §A.12; the row stores NULL and the renderer falls back to the
    // generic icon. mimeType / fileSize / durationSeconds / width / height
    // are all optional metadata (server tolerates missing).
  }
  return true;
}

// ─── Generic error shape ────────────────────────────────────────────────
// Returned with non-2xx status codes (consistent with the W#1 routes).
export interface ApiErrorResponse {
  error: string;
}
