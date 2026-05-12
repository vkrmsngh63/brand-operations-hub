// Pure-logic helpers for the Module 2 text-capture path (session 4
// 2026-05-11). Kept dependency-free so they can be exercised by node:test
// without pulling in DOM or chrome.* surfaces.
//
// Three concerns:
//   1. Form-level validation — given a draft text-capture payload, return
//      a typed result that the form uses to gate the Save button.
//   2. Tags chip-list normalization — dedupe + trim + drop empties, with
//      stable insertion order so the chip list doesn't visually reshuffle.
//   3. URL-match scoring — given a list of saved CompetitorUrl rows for
//      the current platform + the page URL where the right-click happened,
//      return the row whose normalized URL most plausibly matches (so the
//      form can pre-select). Falls back to null when nothing matches.

import { normalizeUrlForRecognition } from './url-normalization.ts';
import type {
  CompetitorUrl,
  CreateCapturedTextRequest,
} from '../../../../src/lib/shared-types/competition-scraping.ts';

/** Validation outcome for the text-capture form draft. */
export type CapturedTextDraftValidation =
  | { ok: true; payload: CreateCapturedTextRequest }
  | { ok: false; reason: CapturedTextValidationReason };

export type CapturedTextValidationReason =
  | 'url-required'
  | 'text-required'
  | 'category-required';

export interface CapturedTextDraft {
  /** The CompetitorUrl row id the captured text will attach to. Required. */
  competitorUrlId: string;
  /** The text body. Required (non-empty after trim). The §A.7 spec allows
   * an empty text for "marker rows"; this form's UX requires non-empty so
   * an accidental Enter press doesn't write a blank row. The server's
   * loose acceptance is preserved for other clients. */
  text: string;
  /** Content-category vocab value. Required (non-empty after trim) — the
   * §A.7 framing says every captured row is categorized; we enforce that
   * at the capture moment so the PLOS-side filtering stays clean. */
  contentCategory: string;
  /** Optional tags (chip-list). Empty array OK. */
  tags: readonly string[];
}

/**
 * Validates a draft captured-text payload and returns a server-ready
 * request object on success. The clientId is generated here via
 * `crypto.randomUUID()` so the caller doesn't have to remember to mint one.
 * Generation timing matters: per §9.2 the clientId must be stable across
 * retries, so the form should call `validateCapturedTextDraft` ONCE per
 * Save click and reuse the resulting payload across any retry. The
 * `mintClientId` optional parameter exists for tests + future WAL replay.
 */
export function validateCapturedTextDraft(
  draft: CapturedTextDraft,
  mintClientId: () => string = defaultMintClientId,
): CapturedTextDraftValidation {
  if (!draft.competitorUrlId.trim()) {
    return { ok: false, reason: 'url-required' };
  }
  if (!draft.text.trim()) {
    return { ok: false, reason: 'text-required' };
  }
  if (!draft.contentCategory.trim()) {
    return { ok: false, reason: 'category-required' };
  }
  const payload: CreateCapturedTextRequest = {
    clientId: mintClientId(),
    contentCategory: draft.contentCategory.trim(),
    text: draft.text,
    tags: normalizeTags(draft.tags),
  };
  return { ok: true, payload };
}

/**
 * Dedupes + trims tags, drops empties, preserves first-seen order. Used
 * for chip-list state management on both the content-script form and the
 * popup paste flow.
 */
export function normalizeTags(input: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    // Case-insensitive dedup — "Wellness" and "wellness" collapse, keeping
    // the first-seen casing. Matches the project-vocabulary feeling.
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/**
 * Given the saved CompetitorUrl rows for the current Project + platform,
 * pick the row whose normalized URL most plausibly matches `pageUrl`. The
 * content-script form uses this for the URL picker's initial selection:
 *   - Exact normalized match → that row wins.
 *   - No match → returns null; form forces a manual pick.
 *
 * Why "normalized" — URLs as captured by the user and the URL where the
 * right-click happens may differ on query-string noise (tracking params,
 * `?ref=...`, etc.). The url-normalization helper strips those uniformly.
 *
 * Optional `canonicalize` (P-15 fix 2026-05-12): when a platform's
 * `canonicalProductUrl` extractor is available, the caller may pass it so
 * that slug-variant URLs (e.g. Amazon's `/Product-Name-Slug/dp/{ASIN}/ref=sr_1_3`)
 * collapse to their canonical form BEFORE normalization. Without this step,
 * a saved row stored as `/dp/{ASIN}` would fail to pre-select when the user
 * right-clicks on a slug-variant page URL, because `normalizeUrlForRecognition`
 * only strips `?…` (query) — not path-level noise like `/Product-Name-Slug/`
 * or `/ref=sr_1_3`. Mirrors the working "already saved" overlay path at
 * `orchestrator.ts:280-282`. When omitted or when `canonicalize` returns null
 * for a given URL, the function falls back to the pre-canonicalization URL
 * (preserves backward-compatible behavior for callers that don't have access
 * to a platform module + for non-product pages like search/listing pages).
 *
 * Returns null when the rows list is empty OR no row matches. The caller
 * decides how to render that state (the form shows a "Pick a URL"
 * placeholder; the popup paste flow shows the same).
 */
export function pickInitialUrl(
  pageUrl: string,
  rows: readonly CompetitorUrl[],
  canonicalize?: (href: string) => string | null,
): CompetitorUrl | null {
  if (rows.length === 0) return null;
  const canonicalPageUrl =
    typeof pageUrl === 'string' && canonicalize
      ? canonicalize(pageUrl) ?? pageUrl
      : pageUrl;
  const targetNormalized = normalizeUrlForRecognition(canonicalPageUrl);
  if (!targetNormalized) return null;
  for (const row of rows) {
    const rowNormalized = normalizeUrlForRecognition(row.url);
    if (rowNormalized && rowNormalized === targetNormalized) {
      return row;
    }
  }
  return null;
}

/**
 * Default clientId minter. `crypto.randomUUID()` is available in:
 *   - Content scripts (host page's global Web Crypto)
 *   - Extension service workers
 *   - Popup React tree
 *   - Modern Node ≥ 18 (test runner)
 * so this helper works uniformly across all our runtime targets.
 */
export function defaultMintClientId(): string {
  return crypto.randomUUID();
}
