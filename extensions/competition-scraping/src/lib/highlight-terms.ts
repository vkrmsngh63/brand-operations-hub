// Pure logic for the Highlight Terms manager. Storage is in popup-state.ts;
// this module is the parsing/dedup/merge math, kept pure so it's testable
// without chrome.storage.local mocks.

import { getDefaultColorForIndex } from './color-palette.ts';

export interface HighlightTerm {
  term: string;
  color: string; // hex like '#FFEB3B'
}

/**
 * Parses a free-form textarea input into trimmed term strings.
 *
 * Splits on commas AND newlines so the user can paste either format. Trims
 * each piece, drops empties, then dedupes case-insensitively while preserving
 * the first-seen casing.
 *
 * Per the director's brief in COMPETITION_SCRAPING_DESIGN.md §A.15:
 * "the user should be able to enter multiple terms into the text box and when
 * the user then clicks outside the text box, the system should show the
 * individual terms listed."
 */
export function parseTermInput(raw: string): string[] {
  if (typeof raw !== 'string') return [];
  // Split on newlines OR commas, treating runs of either as a single delimiter.
  const pieces = raw.split(/[,\n\r]+/);
  const seen = new Map<string, string>(); // lowercase -> original casing
  for (const piece of pieces) {
    const trimmed = piece.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return Array.from(seen.values());
}

/**
 * Merges newly-parsed terms into an existing term list. New terms get default
 * colors continuing the rotation from where the existing list left off
 * (so the 6th term added across two on-blur events still gets a sensible
 * default). Existing terms are preserved unchanged.
 *
 * Case-insensitive dedup against the existing list.
 */
export function mergeWithExisting(
  existing: readonly HighlightTerm[],
  incoming: readonly string[],
): HighlightTerm[] {
  const existingKeys = new Set(existing.map((t) => t.term.toLowerCase()));
  const out: HighlightTerm[] = [...existing];
  let nextIndex = existing.length;
  for (const t of incoming) {
    const key = t.toLowerCase();
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    out.push({ term: t, color: getDefaultColorForIndex(nextIndex) });
    nextIndex += 1;
  }
  return out;
}

/**
 * Removes the term at `index` (0-based). Returns the original list when
 * `index` is out of bounds.
 */
export function removeTermAt(
  list: readonly HighlightTerm[],
  index: number,
): HighlightTerm[] {
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    return [...list];
  }
  return list.filter((_, i) => i !== index);
}

/**
 * Updates the color of the term at `index`. Returns the original list when
 * `index` is out of bounds. Hex is stored as-is (caller should pass the
 * canonical uppercase hex from COLOR_PALETTE).
 */
export function setColorAt(
  list: readonly HighlightTerm[],
  index: number,
  color: string,
): HighlightTerm[] {
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    return [...list];
  }
  return list.map((t, i) => (i === index ? { ...t, color } : t));
}
