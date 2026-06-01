// W#2 P-54 Phase 5 (2026-06-01) — pure logic for the dynamic content/image/video
// "category columns" on the MAIN /competition-scraping Competitor URLs table.
//
// Per the director's directive (P-54 §1): for each captured-content category the
// table grows a column-PAIR — a "category" column (the captured text / embedded
// text) and, immediately to its right, a "[category] Analysis" column (the per-
// item "Your Analysis"). The two move together as a LOCKED PAIR under column
// reorder (D8). This module owns the side-effect-free bits so they unit-test
// under `node --test`: the column-key encoding, the present-category collection,
// the default-placement + saved-order merge (Q-F: auto-append new, keep custom
// order), and the per-row stacked-sub-row bucketing (D3).
//
// Design choices grounded in the Phase 1-4 as-built:
//   - Only the VALUE column key ever rides in the shared ProjectTablePreferences
//     .columnOrder array. The Analysis column is GLUED to the immediate right of
//     its value column at render time, so the pair can never be separated and
//     `moveColumnKey` (Phase 3) moves the pair as one unit for free. No schema
//     change is needed — the dynamic keys live in the existing columnOrder /
//     columnVisibility / columnWidths Json maps.
//   - Visibility is per-KIND-group (one "Content / Image / Video Categories"
//     checkbox per the director's spec), not per-column.

// The three captured-content kinds, in the director's stated R7→R8→R9 order.
export type CapturedKind = 'text' | 'image' | 'video';

export const CAPTURED_KINDS: readonly CapturedKind[] = ['text', 'image', 'video'];

// The Columns-box group-checkbox id for each kind (rides in columnVisibility).
export const KIND_GROUP_VIS_KEY: Record<CapturedKind, string> = {
  text: 'contentCategories',
  image: 'imageCategories',
  video: 'videoCategories',
};

// Director's wording for the three group checkboxes.
export const KIND_GROUP_LABEL: Record<CapturedKind, string> = {
  text: 'Content Categories',
  image: 'Image Categories',
  video: 'Video Categories',
};

// Column-key prefix per kind. No ':' so it never collides with the ':'-joined
// encoded-category segment below. Stable strings — renaming silently orphans a
// saved column order, same caveat as the static column ids.
const KIND_KEY_PREFIX: Record<CapturedKind, string> = {
  text: 'content-cat',
  image: 'image-cat',
  video: 'video-cat',
};

const PREFIX_TO_KIND: Record<string, CapturedKind> = {
  'content-cat': 'text',
  'image-cat': 'image',
  'video-cat': 'video',
};

// The suffix that marks the paired Analysis column. ':analysis' is collision-
// safe because the encoded category between the prefix and the suffix can never
// contain a literal ':' (encodeURIComponent escapes it to %3A).
const ANALYSIS_SUFFIX = 'analysis';

// ─── Column-key encoding ───────────────────────────────────────────────────

/** The VALUE column key for a kind + category, e.g. `content-cat:Acme`.
 *  The category is URI-encoded so free-text names (spaces, ':', '/') round-trip
 *  and never break the ':'-split parse. */
export function dynValueKey(kind: CapturedKind, category: string): string {
  return `${KIND_KEY_PREFIX[kind]}:${encodeURIComponent(category)}`;
}

/** The paired ANALYSIS column key, e.g. `content-cat:Acme:analysis`. */
export function dynAnalysisKey(kind: CapturedKind, category: string): string {
  return `${dynValueKey(kind, category)}:${ANALYSIS_SUFFIX}`;
}

export interface ParsedDynKey {
  kind: CapturedKind;
  category: string;
  role: 'value' | 'analysis';
}

/** Parse a dynamic column key back to its kind / category / role. Returns null
 *  for any non-dynamic key (a static column id like `addedAt`), so callers can
 *  cheaply discriminate. */
export function parseDynKey(key: string): ParsedDynKey | null {
  const parts = key.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const kind = PREFIX_TO_KIND[parts[0]];
  if (!kind) return null;
  if (parts.length === 3 && parts[2] !== ANALYSIS_SUFFIX) return null;
  let category: string;
  try {
    category = decodeURIComponent(parts[1]);
  } catch {
    return null;
  }
  return { kind, category, role: parts.length === 3 ? 'analysis' : 'value' };
}

/** True iff the key is a dynamic VALUE column key (not its analysis pair, not a
 *  static column). */
export function isDynValueKey(key: string): boolean {
  const parsed = parseDynKey(key);
  return parsed !== null && parsed.role === 'value';
}

// ─── Column labels (director's exact header formats) ───────────────────────

export function dynValueLabel(kind: CapturedKind, category: string): string {
  switch (kind) {
    case 'text':
      return `Content Category: ${category}`;
    case 'image':
      return `Image Category Embedded Text: ${category}`;
    case 'video':
      return `Video Category Embedded Text: ${category}`;
  }
}

export function dynAnalysisLabel(_kind: CapturedKind, category: string): string {
  return `${category} Analysis`;
}

// ─── Captured-item shape + category collection ─────────────────────────────

// The minimal projection one captured text/image/video item exposes to the main
// table. `body` = the captured text (text kind) or the embedded text (image /
// video). `category` is the per-item free-text category name (null/blank ⇒ the
// item has no category column and is omitted from the dynamic columns).
export interface DynCapturedItem {
  id: string;
  competitorUrlId: string;
  category: string | null;
  body: string | null;
  analysis: Record<string, unknown>;
  sortOrder: number;
}

/** Normalize a raw category to its canonical name, or null when blank. */
export function normalizeCategory(
  category: string | null | undefined
): string | null {
  if (typeof category !== 'string') return null;
  const trimmed = category.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** The distinct non-blank category names present across the given items, in
 *  first-appearance order (the "natural order" the director's Q-F default
 *  refers to — new categories slot in at the end of this list / left of the
 *  Added On column, before any custom drag-reorder). */
export function collectCategories(
  items: ReadonlyArray<DynCapturedItem>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const cat = normalizeCategory(item.category);
    if (cat !== null && !seen.has(cat)) {
      seen.add(cat);
      out.push(cat);
    }
  }
  return out;
}

// ─── Dynamic column-pair descriptors ───────────────────────────────────────

export interface DynColumnPair {
  kind: CapturedKind;
  category: string;
  valueKey: string;
  analysisKey: string;
  valueLabel: string;
  analysisLabel: string;
}

/** Build the ordered list of dynamic column-pairs from the present categories
 *  per kind. Ordered text-pairs first, then image, then video (R7→R8→R9), and
 *  within a kind by the supplied category order. This is the DEFAULT placement
 *  order; a saved columnOrder reorders the value keys on top (see
 *  `withDynamicKeysInOrder`). */
export function buildDynamicColumnPairs(
  categoriesByKind: Record<CapturedKind, ReadonlyArray<string>>
): DynColumnPair[] {
  const pairs: DynColumnPair[] = [];
  for (const kind of CAPTURED_KINDS) {
    for (const category of categoriesByKind[kind]) {
      pairs.push({
        kind,
        category,
        valueKey: dynValueKey(kind, category),
        analysisKey: dynAnalysisKey(kind, category),
        valueLabel: dynValueLabel(kind, category),
        analysisLabel: dynAnalysisLabel(kind, category),
      });
    }
  }
  return pairs;
}

/**
 * Merge the dynamic VALUE keys into a saved column order, implementing the
 * director's Q-F choice ("auto-append new, keep custom order"):
 *   - Keys already present in `savedOrder` keep their saved position untouched.
 *   - A dynamic value key NOT yet in `savedOrder` (a brand-new category) is
 *     inserted at the DEFAULT spot — immediately before `beforeKey`
 *     ('addedAt'), so new category columns appear "to the left of the Added On
 *     column" per the directive. If `beforeKey` is absent the new keys append
 *     at the end.
 *   - When `savedOrder` is empty the table is using the registry default order;
 *     we return [] so the caller's `applyColumnOrder` no-ops and the default
 *     column list (with the pairs already spliced before Added On) renders.
 *
 * Returns the full effective key order to feed `applyColumnOrder`. Stable: a
 * value key only moves when the user has explicitly dragged it.
 */
export function withDynamicKeysInOrder(
  savedOrder: ReadonlyArray<string>,
  dynValueKeys: ReadonlyArray<string>,
  beforeKey = 'addedAt'
): string[] {
  if (savedOrder.length === 0) return [];
  const saved = [...savedOrder];
  const present = new Set(saved);
  const newKeys = dynValueKeys.filter((k) => !present.has(k));
  if (newKeys.length === 0) return saved;
  const insertAt = saved.indexOf(beforeKey);
  if (insertAt < 0) {
    saved.push(...newKeys);
    return saved;
  }
  saved.splice(insertAt, 0, ...newKeys);
  return saved;
}

// ─── Per-row stacked sub-rows (D3) ─────────────────────────────────────────

/** The captured items of one kind+category for one URL row, preserving the
 *  input order (the server already orders by sortOrder, addedAt). */
export function itemsForCategory(
  items: ReadonlyArray<DynCapturedItem>,
  kind: CapturedKind,
  category: string
): DynCapturedItem[] {
  void kind; // items are pre-split per kind by the caller; kept for call-site clarity
  const target = normalizeCategory(category);
  return items.filter((it) => normalizeCategory(it.category) === target);
}

/** The number of stacked sub-rows a URL row needs = the longest visible
 *  dynamic-category item list (min 1, so a row with no dynamic content still
 *  renders its single flat row). */
export function subRowSpan(perColumnItemLists: ReadonlyArray<ReadonlyArray<unknown>>): number {
  let max = 1;
  for (const list of perColumnItemLists) {
    if (list.length > max) max = list.length;
  }
  return max;
}
