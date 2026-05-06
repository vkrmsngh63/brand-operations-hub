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

// ─── Generic error shape ────────────────────────────────────────────────
// Returned with non-2xx status codes (consistent with the W#1 routes).
export interface ApiErrorResponse {
  error: string;
}
