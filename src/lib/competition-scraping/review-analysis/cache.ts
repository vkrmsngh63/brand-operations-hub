// W#2 P-49 Workstream 5 — review-set fingerprint cache per §A.12.
//
// Each ReviewAnalysis row stores a reviewsHash. On page load the UI
// computes the current reviews-set hash for the analysis scope and
// compares to the cached value; mismatch → render existing analysis +
// stale badge + offer Re-run. This module owns the hash computation
// shared between the persistence path (server) and the staleness check.
//
// Hash inputs (canonical order):
//   sorted(reviewIds).join(',') + '|' + modelVersion
//
// Why include modelVersion: Q12 cascade impact — re-running with a
// different model produces a fresh cache entry. Two analyses of the
// same review set with different models should not collide.

import { createHash } from 'node:crypto';

export type ReviewIdInput = ReadonlyArray<{ id: string }>;

// Sorted-comma-joined IDs are stable across any ordering the caller
// passes (DB query order, drag-reordered display order, etc.). We hash
// the canonical form so the cache survives review-row reordering.
export function buildHashCanonical(
  reviews: ReviewIdInput,
  modelVersion: string
): string {
  if (!modelVersion) {
    throw new Error('modelVersion is required for reviewsHash');
  }
  const ids = reviews.map((r) => r.id);
  // Defensive: detect dupes early so accidental double-insertion in a
  // caller doesn't quietly invalidate the cache via a different hash.
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      throw new Error(`Duplicate review id in reviewsHash input: ${id}`);
    }
    seen.add(id);
  }
  ids.sort();
  return ids.join(',') + '|' + modelVersion;
}

export function computeReviewsHash(
  reviews: ReviewIdInput,
  modelVersion: string
): string {
  const canonical = buildHashCanonical(reviews, modelVersion);
  return createHash('sha256').update(canonical).digest('hex');
}

// Staleness check — true when the cached analysis can be served as-is;
// false when the UI should render the stale badge + offer Re-run.
export function isFresh(
  cachedHash: string | null | undefined,
  currentHash: string
): boolean {
  return !!cachedHash && cachedHash === currentHash;
}
