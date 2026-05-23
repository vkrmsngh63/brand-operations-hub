// P-46 Workstream 3 Session 2 (2026-05-23-d → next session) — trust-boundary
// helper for the `competitionScore` field added to the `urls/[urlId]` PATCH
// route per docs/COMPETITION_DATA_V2_DESIGN.md §A.7 + §A.11.
//
// Field shape per §A.7: integer 1-100, nullable. The locked decision is a
// plain `<input type="number" min={1} max={100}>` cell editor in the table;
// the server-side validation is in this helper.
//
// Why extract: follows the W2 S5 "Field-allowlist subset extraction" Pattern
// (`url-structural-fields-validation.ts`) — keeps the per-field validation
// as a pure helper here so node:test can exercise the trust-boundary shape
// exhaustively without spinning up Next.js / Prisma. The route still owns
// the field allowlist; this helper owns the range check.

export interface CompetitionScorePatch {
  competitionScore?: number | null;
}

export type ExtractResult =
  | { ok: true; patch: CompetitionScorePatch }
  | { ok: false; error: string };

const MIN = 1;
const MAX = 100;

// Reads `competitionScore` from the body if explicitly present
// (`'competitionScore' in body`); validates it's an integer in [1, 100] or
// null; returns the patch object the route can spread onto its Prisma
// update payload. Out-of-range / non-integer / non-numeric short-circuits
// with an error result the route forwards as a 400.
//
// `null` explicitly clears the column. `undefined` (key absent) returns an
// empty patch — no column write.
export function extractCompetitionScorePatch(body: unknown): ExtractResult {
  if (body === null || typeof body !== 'object') {
    return { ok: true, patch: {} };
  }

  const b = body as Record<string, unknown>;
  if (!('competitionScore' in b)) {
    return { ok: true, patch: {} };
  }

  const value = b.competitionScore;
  if (value === null) {
    return { ok: true, patch: { competitionScore: null } };
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return {
      ok: false,
      error: `competitionScore must be an integer between ${MIN} and ${MAX}, or null`,
    };
  }
  if (!Number.isInteger(value)) {
    return {
      ok: false,
      error: `competitionScore must be a whole number (no fractions)`,
    };
  }
  if (value < MIN || value > MAX) {
    return {
      ok: false,
      error: `competitionScore must be between ${MIN} and ${MAX}`,
    };
  }
  return { ok: true, patch: { competitionScore: value } };
}
