// W#2 P-49 Workstream 4 Session 1 — pure helpers for the Captured Reviews
// section UI. Extracted from UrlDetailContent.tsx so node:test can load
// them without the React component tree.
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.5 (sortRank-based manual sort) +
// §A.6 (bulk-select) + §A.14 (star-count counter-bar + Customers-say split).

import type { CapturedReview } from '../shared-types/competition-scraping.ts';

// P-49 W2 Session 2 (2026-05-27) Rule 14f outcome — Customers-say AI-summary
// rows are persisted with this `source` discriminator + a starRating=5
// sentinel. W4 Session 1 splits these out of the main list so they don't
// inflate the 5-star bucket count + don't participate in drag-reorder or
// bulk-select.
export const CUSTOMERS_SAY_SOURCE = 'extension-scrape:customers-say';

// Sort-mode for the Captured Reviews list. 'manual' uses `sortRank` (the
// column shipped in P-49 W2 Session 1 + reached production via the
// 2026-05-28 Amazon DEPLOY); the other two reuse the existing sort.
export type ReviewSortKey = 'addedAt' | 'starRating' | 'manual';

export type ReviewSortDir = 'asc' | 'desc';

// Comparator for the section's sorted display. Manual mode sorts by
// sortRank ascending, ties broken by addedAt ascending; nulls come last
// (mirrors the §A.5 "null = insertion order; explicit ranks lead" rule).
// The non-manual modes preserve the existing pre-W4 sort behavior with the
// sortDir multiplier applied.
export function compareReviews(
  a: CapturedReview,
  b: CapturedReview,
  sortKey: ReviewSortKey,
  sortDir: ReviewSortDir
): number {
  if (sortKey === 'manual') {
    const ra = a.sortRank;
    const rb = b.sortRank;
    if (ra === null && rb === null) {
      return a.addedAt.localeCompare(b.addedAt);
    }
    if (ra === null) return 1;
    if (rb === null) return -1;
    const diff = ra - rb;
    if (diff !== 0) return diff;
    return a.addedAt.localeCompare(b.addedAt);
  }
  let cmp = 0;
  if (sortKey === 'starRating') {
    cmp = a.starRating - b.starRating;
  } else {
    cmp = a.addedAt.localeCompare(b.addedAt);
  }
  return sortDir === 'asc' ? cmp : -cmp;
}

// Split a captured-reviews list into the Customers-say AI-summary rows
// (source discriminator match) and the main list (everything else). Order
// inside each bucket is preserved from the input.
export function splitCustomersSay(
  reviews: CapturedReview[]
): { customersSay: CapturedReview[]; main: CapturedReview[] } {
  const customersSay: CapturedReview[] = [];
  const main: CapturedReview[] = [];
  for (const r of reviews) {
    if (r.source === CUSTOMERS_SAY_SOURCE) customersSay.push(r);
    else main.push(r);
  }
  return { customersSay, main };
}

// Per-star count for the counter-bar. Rows with starRating outside [1, 5]
// are silently dropped (defensive against any historical out-of-range
// values; the schema constraint enforces the range at write time).
export function computeStarCounts(
  reviews: CapturedReview[]
): Record<1 | 2 | 3 | 4 | 5, number> {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of reviews) {
    if (r.starRating >= 1 && r.starRating <= 5) {
      counts[r.starRating as 1 | 2 | 3 | 4 | 5] += 1;
    }
  }
  return counts;
}

// Apply the star-bucket filter from the counter-bar. An empty selection
// shows all reviews; non-empty applies OR semantics across the selected
// star ratings.
export function filterByStarSelection(
  reviews: CapturedReview[],
  selected: Set<number>
): CapturedReview[] {
  if (selected.size === 0) return reviews;
  return reviews.filter((r) => selected.has(r.starRating));
}

// Splice the visible list's new order back into the full main-reviews
// order, preserving non-visible rows at their existing relative position.
// Used after a drag-reorder fires inside a star-filtered subset — the
// filtered-out rows tail the rebuilt full list (mirrors UrlTable.tsx's
// row-tail strategy from P-46 W3 S3 2026-05-23-f).
export function spliceVisibleReorderIntoFull(
  newVisibleIds: string[],
  fullList: CapturedReview[]
): string[] {
  const visibleSet = new Set(newVisibleIds);
  const tail = fullList.map((r) => r.id).filter((id) => !visibleSet.has(id));
  return [...newVisibleIds, ...tail];
}
