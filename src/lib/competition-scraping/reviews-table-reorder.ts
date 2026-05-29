// W#2 P-49 Workstream 5 Reviews Phase 2 Fix Session C "Deploy 2"
// (2026-05-29-c) — pure helpers for drag-to-reorder on the Competitor
// Reviews Analysis Table page.
//
// Two reorder surfaces share this module:
//   - URL (competitor) rows — order persisted in the shared per-user
//     `UserTablePreferences.rowOrder` array (SAME field the Competitor
//     Content Table uses, so order tracks across both pages per the
//     director's Q5 → A "reflects everywhere" decision; mechanism
//     corrected at Deploy 2 planning after the spec's named
//     `CompetitorUrl.sortRank` column turned out never to have existed).
//   - Review rows within a URL — order persisted in the per-page
//     `CapturedReview.sortRankInReviewsTable` column shipped in Deploy 1.
//
// Spec: docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md
// §3 "Drag-to-reorder" + "Fix Session C" items 9 + 10.
//
// Kept side-effect-free so the rank assignment / re-normalization logic is
// unit-testable under `node --test` without React or the DOM.

export interface IdentifiedRow {
  id: string;
}

export interface RankedReview {
  id: string;
  // null = never reordered on this page → falls back to server order
  // (addedAt asc) after the explicitly-ranked rows.
  sortRankInReviewsTable: number | null;
  addedAt: string;
}

/**
 * Order rows by a saved `rowOrder` id list. Ids present in `rowOrder` come
 * first, in `rowOrder` sequence; ids absent from it keep their original
 * relative order and are appended after (so newly-added competitors never
 * disappear just because they predate the last drag). Stable.
 *
 * Mirrors UrlTable.tsx's `sortKey === 'manual'` branch.
 */
export function orderByRowOrder<T extends IdentifiedRow>(
  rows: T[],
  rowOrder: readonly string[]
): T[] {
  if (rowOrder.length === 0) return [...rows];
  const orderIndex = new Map<string, number>();
  rowOrder.forEach((id, i) => orderIndex.set(id, i));
  // Decorate with the original index so the fallback sort is stable.
  return rows
    .map((row, originalIndex) => ({ row, originalIndex }))
    .sort((a, b) => {
      const ai = orderIndex.get(a.row.id);
      const bi = orderIndex.get(b.row.id);
      if (ai !== undefined && bi !== undefined) return ai - bi;
      if (ai !== undefined) return -1; // a is ordered, b is not — a first
      if (bi !== undefined) return 1; // b is ordered, a is not — b first
      return a.originalIndex - b.originalIndex; // neither ranked — keep order
    })
    .map((d) => d.row);
}

/**
 * Sort captured reviews by `sortRankInReviewsTable` ascending. Null ranks
 * (never reordered) sort last, keeping their incoming relative order
 * (the server returns addedAt asc). Stable.
 */
export function sortReviewsByTableRank<T extends RankedReview>(reviews: T[]): T[] {
  return reviews
    .map((review, originalIndex) => ({ review, originalIndex }))
    .sort((a, b) => {
      const ar = a.review.sortRankInReviewsTable;
      const br = b.review.sortRankInReviewsTable;
      if (ar != null && br != null) {
        if (ar !== br) return ar - br;
        return a.originalIndex - b.originalIndex;
      }
      if (ar != null) return -1; // ranked rows before unranked
      if (br != null) return 1;
      return a.originalIndex - b.originalIndex; // both unranked — keep order
    })
    .map((d) => d.review);
}

/**
 * Move the item at `fromIndex` to `toIndex`, returning a new array. Mirrors
 * @dnd-kit's `arrayMove` so the page can compute the next id order without
 * importing the library into testable code. Out-of-range indices return a
 * shallow copy unchanged.
 */
export function arrayMoveIds(
  ids: readonly string[],
  fromIndex: number,
  toIndex: number
): string[] {
  const next = [...ids];
  if (
    fromIndex < 0 ||
    fromIndex >= next.length ||
    toIndex < 0 ||
    toIndex >= next.length
  ) {
    return next;
  }
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

/**
 * Merge the newly-dragged DISPLAYED id order back into the full saved
 * `rowOrder`. The displayed set may be a platform-filtered subset, so any
 * prior-`rowOrder` id that is NOT currently displayed is preserved at the
 * tail in its prior relative order — exactly mirroring UrlTable.tsx so the
 * two pages stay consistent when they share the field.
 */
export function mergeRowOrder(
  displayedOrder: readonly string[],
  priorRowOrder: readonly string[]
): string[] {
  const displayedSet = new Set(displayedOrder);
  const tail = priorRowOrder.filter((id) => !displayedSet.has(id));
  return [...displayedOrder, ...tail];
}

/**
 * Build the reorder PUT `orderings` payload from an ordered review-id list.
 * Each id's array position becomes its rank, so persisted order matches the
 * on-screen order after a drag. The wire field is named `sortRank` on each
 * entry regardless of target column; the top-level `field` discriminator
 * (set by the caller) selects `sortRankInReviewsTable`.
 */
export function buildReviewOrderings(
  orderedReviewIds: readonly string[]
): Array<{ reviewId: string; sortRank: number }> {
  return orderedReviewIds.map((reviewId, index) => ({ reviewId, sortRank: index }));
}
