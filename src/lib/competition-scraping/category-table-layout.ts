// W#2 P-49 W5 Category page "interactive batch" (2026-05-30) — pure helpers
// for the per-user, per-Project "memory" backing the Reviews Analysis By
// Competitor Category page: the two-level drag order (categories +
// competitors-within-a-category) and the hide-with-restore sets.
//
// Scope: this memory is SPECIFIC to the Category page. It is stored in the
// additive nullable `UserTablePreferences.categoryTableLayout` Json column
// and never touches the shared `rowOrder` the Content Table + Reviews
// Analysis Table use. The sibling Type page (Sessions 4-5) gets its own
// `typeTableLayout` column and can reuse every function here.
//
// Kept side-effect-free (no React, no DOM, no Prisma) so the parse /
// validation / re-rank logic is unit-testable under `node --test`.

import type { CategoryTableLayout } from '../shared-types/competition-scraping.ts';
import { arrayMoveIds, mergeRowOrder } from './reviews-table-reorder.ts';

export type { CategoryTableLayout } from '../shared-types/competition-scraping.ts';

export const EMPTY_CATEGORY_TABLE_LAYOUT: CategoryTableLayout = {
  categoryOrder: [],
  rowOrderByUrlId: [],
  hiddenUrlIds: [],
  hiddenCategoryKeys: [],
};

// ─── parsing / coercion (defensive — never throws) ─────────────────────

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Keep only the string entries of an array-ish value; anything else → [].
// De-dupes while preserving first-seen order so a malformed blob can never
// produce duplicate ranks.
function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of value) {
    if (typeof v === 'string' && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/**
 * Coerce an unknown DB/wire value into a CategoryTableLayout, or null when no
 * layout is stored. Best-effort: unexpected shapes degrade to empty lists
 * rather than throwing, so a hand-edited or legacy row never 500s a read.
 * null / undefined / non-object input → null (means "never customized").
 */
export function coerceCategoryTableLayout(
  raw: unknown
): CategoryTableLayout | null {
  if (raw == null) return null;
  if (!isPlainObject(raw)) return null;
  return {
    categoryOrder: toStringList(raw.categoryOrder),
    rowOrderByUrlId: toStringList(raw.rowOrderByUrlId),
    hiddenUrlIds: toStringList(raw.hiddenUrlIds),
    hiddenCategoryKeys: toStringList(raw.hiddenCategoryKeys),
  };
}

/**
 * Like coerceCategoryTableLayout but returns the EMPTY layout instead of null
 * — handy on the client where the page always wants a concrete object to read.
 */
export function readCategoryTableLayout(raw: unknown): CategoryTableLayout {
  return coerceCategoryTableLayout(raw) ?? EMPTY_CATEGORY_TABLE_LAYOUT;
}

// ─── strict validation (PUT trust boundary) ────────────────────────────

export type CategoryTableLayoutValidation =
  | { ok: true; value: CategoryTableLayout | null }
  | { ok: false; error: string };

/**
 * Strictly validate a `categoryTableLayout` value supplied to the write
 * endpoint. Accepts null (clears the memory) OR an object whose four fields,
 * when present, are arrays of strings. Missing fields default to []. Unknown
 * keys are ignored (additive-future-safe). Returns the normalized value.
 */
export function validateCategoryTableLayout(
  raw: unknown
): CategoryTableLayoutValidation {
  if (raw === null) return { ok: true, value: null };
  if (!isPlainObject(raw)) {
    return {
      ok: false,
      error: 'categoryTableLayout must be an object or null',
    };
  }
  const fields = [
    'categoryOrder',
    'rowOrderByUrlId',
    'hiddenUrlIds',
    'hiddenCategoryKeys',
  ] as const;
  const value: CategoryTableLayout = {
    categoryOrder: [],
    rowOrderByUrlId: [],
    hiddenUrlIds: [],
    hiddenCategoryKeys: [],
  };
  for (const field of fields) {
    if (!(field in raw) || raw[field] === undefined) continue;
    const v = raw[field];
    if (!Array.isArray(v)) {
      return { ok: false, error: `categoryTableLayout.${field} must be an array` };
    }
    for (const item of v) {
      if (typeof item !== 'string') {
        return {
          ok: false,
          error: `categoryTableLayout.${field} must be an array of strings`,
        };
      }
    }
    value[field] = v as string[];
  }
  return { ok: true, value };
}

// ─── two-level drag re-rank ─────────────────────────────────────────────

/**
 * Apply a category drag. `displayedKeys` is the on-screen category-key order
 * (already hide-filtered + uncategorized-last); `activeKey` was dragged onto
 * `overKey`. Returns the next FULL `categoryOrder` to persist — the new
 * displayed order with any prior-order keys that aren't currently displayed
 * (hidden categories) preserved at the tail in their prior relative order.
 * No-op (returns prior order unchanged) when the indices can't be resolved.
 */
export function applyCategoryDrag(
  priorCategoryOrder: readonly string[],
  displayedKeys: readonly string[],
  activeKey: string,
  overKey: string
): string[] {
  if (activeKey === overKey) return [...priorCategoryOrder];
  const oldIndex = displayedKeys.indexOf(activeKey);
  const newIndex = displayedKeys.indexOf(overKey);
  if (oldIndex < 0 || newIndex < 0) return [...priorCategoryOrder];
  const nextDisplayed = arrayMoveIds([...displayedKeys], oldIndex, newIndex);
  return mergeRowOrder(nextDisplayed, priorCategoryOrder);
}

/**
 * Apply a within-category competitor drag. `displayedIds` is the on-screen
 * competitor-url-id order for the WHOLE table (flat, hide-filtered). Returns
 * the next FULL `rowOrderByUrlId` to persist, preserving any hidden /
 * filtered-out ids at the tail. Because a competitor only reorders within its
 * own category, the active + over ids always belong to the same category;
 * reordering them inside the flat list is sufficient (the grouping helper
 * re-buckets per category, so cross-category positions never matter).
 */
export function applyCompetitorDrag(
  priorRowOrder: readonly string[],
  displayedIds: readonly string[],
  activeId: string,
  overId: string
): string[] {
  if (activeId === overId) return [...priorRowOrder];
  const oldIndex = displayedIds.indexOf(activeId);
  const newIndex = displayedIds.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0) return [...priorRowOrder];
  const nextDisplayed = arrayMoveIds([...displayedIds], oldIndex, newIndex);
  return mergeRowOrder(nextDisplayed, priorRowOrder);
}

// ─── hide-with-restore ──────────────────────────────────────────────────

/** Add or remove an id from a "hidden" set, preserving order + de-duping. */
export function toggleHidden(
  hidden: readonly string[],
  id: string,
  hide: boolean
): string[] {
  if (hide) {
    return hidden.includes(id) ? [...hidden] : [...hidden, id];
  }
  return hidden.filter((h) => h !== id);
}

export interface HiddenSets {
  hiddenUrlIds: ReadonlySet<string>;
  hiddenCategoryKeys: ReadonlySet<string>;
}

/** Build fast-lookup Sets from the layout's hidden lists. */
export function toHiddenSets(layout: CategoryTableLayout): HiddenSets {
  return {
    hiddenUrlIds: new Set(layout.hiddenUrlIds),
    hiddenCategoryKeys: new Set(layout.hiddenCategoryKeys),
  };
}
