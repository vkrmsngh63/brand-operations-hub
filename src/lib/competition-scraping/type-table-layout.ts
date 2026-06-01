// W#2 P-49 W5 Type page Sessions 4-5 (2026-05-31) — pure helpers for the
// per-user, per-Project "memory" backing the Reviews Analysis By Competitor
// Type page: the two-level drag order (types + competitors-within-a-type) and
// the hide-with-restore sets. Mirror of the sibling `category-table-layout.ts`
// with the grouping key swapped (category → type).
//
// Scope: this memory is SPECIFIC to the Type page. It is stored in the additive
// nullable `UserTablePreferences.typeTableLayout` Json column and never touches
// the shared `rowOrder` or the Category page's `categoryTableLayout`.
//
// Kept side-effect-free (no React, no DOM, no Prisma) so the parse /
// validation / re-rank logic is unit-testable under `node --test`.

import type { TypeTableLayout } from '../shared-types/competition-scraping.ts';
import { arrayMoveIds, mergeRowOrder } from './reviews-table-reorder.ts';

export type { TypeTableLayout } from '../shared-types/competition-scraping.ts';

export const EMPTY_TYPE_TABLE_LAYOUT: TypeTableLayout = {
  typeOrder: [],
  rowOrderByUrlId: [],
  hiddenUrlIds: [],
  hiddenTypeKeys: [],
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
 * Coerce an unknown DB/wire value into a TypeTableLayout, or null when no
 * layout is stored. Best-effort: unexpected shapes degrade to empty lists
 * rather than throwing, so a hand-edited or legacy row never 500s a read.
 * null / undefined / non-object input → null (means "never customized").
 */
export function coerceTypeTableLayout(raw: unknown): TypeTableLayout | null {
  if (raw == null) return null;
  if (!isPlainObject(raw)) return null;
  return {
    typeOrder: toStringList(raw.typeOrder),
    rowOrderByUrlId: toStringList(raw.rowOrderByUrlId),
    hiddenUrlIds: toStringList(raw.hiddenUrlIds),
    hiddenTypeKeys: toStringList(raw.hiddenTypeKeys),
  };
}

/**
 * Like coerceTypeTableLayout but returns the EMPTY layout instead of null —
 * handy on the client where the page always wants a concrete object to read.
 */
export function readTypeTableLayout(raw: unknown): TypeTableLayout {
  return coerceTypeTableLayout(raw) ?? EMPTY_TYPE_TABLE_LAYOUT;
}

// ─── strict validation (PUT trust boundary) ────────────────────────────

export type TypeTableLayoutValidation =
  | { ok: true; value: TypeTableLayout | null }
  | { ok: false; error: string };

/**
 * Strictly validate a `typeTableLayout` value supplied to the write endpoint.
 * Accepts null (clears the memory) OR an object whose four fields, when
 * present, are arrays of strings. Missing fields default to []. Unknown keys
 * are ignored (additive-future-safe). Returns the normalized value.
 */
export function validateTypeTableLayout(raw: unknown): TypeTableLayoutValidation {
  if (raw === null) return { ok: true, value: null };
  if (!isPlainObject(raw)) {
    return {
      ok: false,
      error: 'typeTableLayout must be an object or null',
    };
  }
  const fields = [
    'typeOrder',
    'rowOrderByUrlId',
    'hiddenUrlIds',
    'hiddenTypeKeys',
  ] as const;
  const value: TypeTableLayout = {
    typeOrder: [],
    rowOrderByUrlId: [],
    hiddenUrlIds: [],
    hiddenTypeKeys: [],
  };
  for (const field of fields) {
    if (!(field in raw) || raw[field] === undefined) continue;
    const v = raw[field];
    if (!Array.isArray(v)) {
      return { ok: false, error: `typeTableLayout.${field} must be an array` };
    }
    for (const item of v) {
      if (typeof item !== 'string') {
        return {
          ok: false,
          error: `typeTableLayout.${field} must be an array of strings`,
        };
      }
    }
    value[field] = v as string[];
  }
  return { ok: true, value };
}

// ─── two-level drag re-rank ─────────────────────────────────────────────

/**
 * Apply a type drag. `displayedKeys` is the on-screen type-key order (already
 * hide-filtered + untyped-last); `activeKey` was dragged onto `overKey`.
 * Returns the next FULL `typeOrder` to persist — the new displayed order with
 * any prior-order keys that aren't currently displayed (hidden types)
 * preserved at the tail in their prior relative order. No-op (returns prior
 * order unchanged) when the indices can't be resolved.
 */
export function applyTypeDrag(
  priorTypeOrder: readonly string[],
  displayedKeys: readonly string[],
  activeKey: string,
  overKey: string
): string[] {
  if (activeKey === overKey) return [...priorTypeOrder];
  const oldIndex = displayedKeys.indexOf(activeKey);
  const newIndex = displayedKeys.indexOf(overKey);
  if (oldIndex < 0 || newIndex < 0) return [...priorTypeOrder];
  const nextDisplayed = arrayMoveIds([...displayedKeys], oldIndex, newIndex);
  return mergeRowOrder(nextDisplayed, priorTypeOrder);
}

/**
 * Apply a within-type competitor drag. `displayedIds` is the on-screen
 * competitor-url-id order for the WHOLE table (flat, hide-filtered). Returns
 * the next FULL `rowOrderByUrlId` to persist, preserving any hidden /
 * filtered-out ids at the tail. Because a competitor only reorders within its
 * own type, the active + over ids always belong to the same type; reordering
 * them inside the flat list is sufficient (the grouping helper re-buckets per
 * type, so cross-type positions never matter).
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
  hiddenTypeKeys: ReadonlySet<string>;
}

/** Build fast-lookup Sets from the layout's hidden lists. */
export function toHiddenSets(layout: TypeTableLayout): HiddenSets {
  return {
    hiddenUrlIds: new Set(layout.hiddenUrlIds),
    hiddenTypeKeys: new Set(layout.hiddenTypeKeys),
  };
}
