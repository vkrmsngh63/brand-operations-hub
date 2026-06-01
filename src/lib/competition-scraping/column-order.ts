// W#2 P-54 Phase 3 (2026-06-01) — pure column-ordering helper for the main
// /competition-scraping table (UrlTable). The saved column order lives in the
// shared ProjectTablePreferences.columnOrder Json array ([columnId,...] in the
// user-arranged left-to-right order). This helper applies that saved order to
// the canonical column registry so the thead/colgroup/tbody all render in the
// arranged order.
//
// Robustness rules (so the table never loses a column):
//   - Columns present in `order` render first, in the order's sequence.
//   - Columns NOT in `order` (e.g. brand-new columns added after the order was
//     saved, like the Phase-5 dynamic category columns) are APPENDED after the
//     known ones, preserving their original registry order.
//   - Ids in `order` that don't match any current column are ignored.
//   - An empty/missing order returns the registry order unchanged.

export function applyColumnOrder<T>(
  columns: readonly T[],
  order: readonly string[] | null | undefined,
  getKey: (column: T) => string
): T[] {
  if (!order || order.length === 0) {
    return [...columns];
  }
  const rank = new Map<string, number>();
  order.forEach((key, index) => {
    // First occurrence wins if the saved order somehow contains duplicates.
    if (!rank.has(key)) rank.set(key, index);
  });

  const known: T[] = [];
  const unknown: T[] = [];
  for (const column of columns) {
    if (rank.has(getKey(column))) known.push(column);
    else unknown.push(column);
  }
  known.sort((a, b) => rank.get(getKey(a))! - rank.get(getKey(b))!);
  return [...known, ...unknown];
}

// Compute the next saved column order after a drag that moves `movingKey` to
// the slot currently occupied by `targetKey`. Operates over the FULL set of
// column keys (in their current arranged order) so the persisted order is
// complete and stable. Returns a new array; returns the input unchanged when
// the move is a no-op or either key is missing.
export function moveColumnKey(
  currentOrderedKeys: readonly string[],
  movingKey: string,
  targetKey: string
): string[] {
  if (movingKey === targetKey) return [...currentOrderedKeys];
  const from = currentOrderedKeys.indexOf(movingKey);
  const to = currentOrderedKeys.indexOf(targetKey);
  if (from < 0 || to < 0) return [...currentOrderedKeys];
  const next = [...currentOrderedKeys];
  next.splice(from, 1);
  next.splice(to, 0, movingKey);
  return next;
}
