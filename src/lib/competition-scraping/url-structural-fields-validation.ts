// P-46 Workstream 2 Session 5 (2026-05-23-b) — trust-boundary helper for
// the 5 new URL-level structural fields added to the `urls/[urlId]` PATCH
// route per docs/COMPETITION_DATA_V2_DESIGN.md §C.2 + §A.11.
//
// Fields: type / description1 / description2 / price (all free-text per
// §A.11) + scrapingStatus (enum per §A.8). The helper takes an arbitrary
// request body (any shape — typed as `unknown` so callers can pass the
// parsed JSON before validating its shape), reads each known structural
// field, normalizes per-field (trim-or-null for the four text fields;
// strict enum-acceptance for scrapingStatus), and returns either an `ok`
// patch object the route can spread onto its Prisma update payload, or an
// `error` discriminator with a 400-message the route forwards verbatim.
//
// Why extract: keeping the per-field validation as a pure helper here
// (instead of inline in the route) lets node:test cover the trust-boundary
// shape exhaustively without spinning up Next.js / Prisma. The route still
// owns the field allowlist (it decides WHICH body keys to forward to this
// helper); this helper owns the per-field NORMALIZATION + ENUM VALIDATION.
//
// Pattern: parallels the Workstream 2 Session 4 "Per-record handler DI-seam
// precedent extension" memorialized in COMPETITION_DATA_V2_DESIGN.md §B
// 2026-05-28 — when per-field validation deserves unit coverage at the
// trust boundary, extract it from the route file into a pure helper rather
// than DI-seaming the whole route.

import {
  isScrapingStatus,
  type ScrapingStatus,
} from '../shared-types/competition-scraping.ts';

// The 5 new structural fields the helper handles. All optional on the wire
// — the route only forwards keys that are explicitly present on the body
// (the `body.X !== undefined` allowlist pattern shared with the route's
// other per-field handlers).
export interface UrlStructuralFieldsPatch {
  type?: string | null;
  description1?: string | null;
  description2?: string | null;
  price?: string | null;
  scrapingStatus?: ScrapingStatus;
}

export type ExtractResult =
  | { ok: true; patch: UrlStructuralFieldsPatch }
  | { ok: false; error: string };

// Trim-or-null normalization for the four free-text fields. Mirrors the
// shape used by the existing per-field handlers for productName / brandName
// / competitionCategory in the route. Empty-after-trim maps to NULL so the
// EditableTextField's empty-input path clears the column.
function normalizeStringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

// Reads each structural field from the body if explicitly present
// (`!== undefined`); normalizes per-field; returns the patch object the
// route can spread onto its Prisma update payload. Invalid scrapingStatus
// short-circuits with an error result the route forwards as a 400.
//
// Unknown body keys are IGNORED (the route's allowlist filters out
// unrecognized PATCH keys at a higher layer — this helper only handles
// the 5 fields it knows about). Garbage shape on a recognized text field
// (e.g., `type: 42`) coerces to `null` per the trim-or-null semantics so
// the column gets cleared rather than 400-rejected; this matches the
// existing per-field precedent for productName/brandName/etc.
export function extractUrlStructuralFieldsPatch(body: unknown): ExtractResult {
  if (body === null || typeof body !== 'object') {
    // Defensive — the route already json-parses + null-checks, so this is
    // belt-and-suspenders. An empty patch with no structural keys is still
    // a valid input (the route may be patching other fields only).
    return { ok: true, patch: {} };
  }

  const b = body as Record<string, unknown>;
  const patch: UrlStructuralFieldsPatch = {};

  if ('type' in b) {
    patch.type = normalizeStringOrNull(b.type);
  }
  if ('description1' in b) {
    patch.description1 = normalizeStringOrNull(b.description1);
  }
  if ('description2' in b) {
    patch.description2 = normalizeStringOrNull(b.description2);
  }
  if ('price' in b) {
    patch.price = normalizeStringOrNull(b.price);
  }
  if ('scrapingStatus' in b) {
    if (!isScrapingStatus(b.scrapingStatus)) {
      return {
        ok: false,
        error: 'scrapingStatus must be one of: INCOMPLETE | COMPLETE',
      };
    }
    patch.scrapingStatus = b.scrapingStatus;
  }

  return { ok: true, patch };
}
