// W#2 P-54 Phase 4 (2026-06-01) — pure grouping logic for the "Sort By" box on
// the MAIN /competition-scraping Competitor URLs table (UrlTable). The box
// groups the rows by Platform / Category / Type into banner-row groups, mirroring
// the proven By-Category / By-Type pages (category-table-grouping.ts).
//
// Two deliberate design choices (D2 / Q-H, resolved with the director 2026-06-01-b):
//   1. WITHIN-GROUP ORDER = the input order. The caller passes rows already in
//      their on-screen order (the active per-column click-sort OR the manual
//      drag-reorder result), so grouping is a pure re-bucketing LAYER on top of
//      the existing sort — it never re-sorts within a group. This is why this
//      helper takes already-ordered rows and does NOT accept a rowOrder (the
//      sibling category helper does, because that page sorts inside the helper).
//   2. GROUP BANNER ORDER = the saved `groupOrder` for the active mode (drag the
//      banners to reorder; persisted shared-per-Project). The empty bucket
//      ("(Uncategorized)" / "(Untyped)") is ALWAYS forced last and is never
//      reorderable, matching the category page's pinned uncategorized bucket.
//
// Kept side-effect-free (no React, no DOM, no Prisma) so it is unit-testable
// under `node --test`. Platform-label resolution is injected as a plain map so
// the helper never imports the client-only url-table-columns module.

// Persisted grouping mode. 'none' = the flat, ungrouped table (the default).
export type GroupByMode = 'none' | 'platform' | 'category' | 'type';

// The three active groupings (everything except the flat default).
export type ActiveGroupMode = Exclude<GroupByMode, 'none'>;

export const GROUP_BY_MODES: readonly GroupByMode[] = [
  'none',
  'platform',
  'category',
  'type',
];

export function isGroupByMode(value: unknown): value is GroupByMode {
  return (
    value === 'none' ||
    value === 'platform' ||
    value === 'category' ||
    value === 'type'
  );
}

export const UNCATEGORIZED_LABEL = '(Uncategorized)';
export const UNTYPED_LABEL = '(Untyped)';

// Internal sentinel for the empty (uncategorized / untyped / no-platform)
// bucket. The empty string is safe: real group keys are always trimmed-
// non-empty (see groupKeyOf), so it can never collide with one.
const EMPTY_KEY = '';

// Minimal row shape the grouping needs — one display row = one CompetitorUrl.
export interface MainGroupRowInput {
  id: string;
  platform: string;
  competitionCategory: string | null | undefined;
  type: string | null | undefined;
}

export interface MainGroup<T extends MainGroupRowInput> {
  /** Normalized group key (platform value, trimmed category/type, or the
   *  empty-string sentinel for the bucket). Stable id for banner drag. */
  key: string;
  /** Human banner label. */
  label: string;
  /** True for the trailing empty (uncategorized / untyped) bucket. */
  isEmptyBucket: boolean;
  /** The group's competitor rows, in their input (already-sorted) order. */
  rows: T[];
}

export interface BuildMainGroupedRowsOptions {
  /** Saved banner order (group keys) for the active mode. Keys absent from the
   *  list fall back to the alphabetical tail after the listed ones. The empty
   *  bucket is ALWAYS forced last regardless of this list. */
  groupOrder?: ReadonlyArray<string>;
  /** Optional platform enum → friendly label map (injected so this pure module
   *  never imports the client-only PLATFORM_LABELS). Only used when mode ===
   *  'platform'; absent keys fall back to the raw platform value. */
  platformLabels?: Record<string, string>;
}

// Raw group value for a row under the given mode (before normalization).
function rawGroupValue(
  row: MainGroupRowInput,
  mode: ActiveGroupMode
): string | null | undefined {
  switch (mode) {
    case 'platform':
      return row.platform;
    case 'category':
      return row.competitionCategory;
    case 'type':
      return row.type;
  }
}

/** Normalize a raw group value to its key: null / undefined / whitespace-only
 *  → the empty-string bucket sentinel; otherwise the trimmed value. */
export function groupKeyOf(
  row: MainGroupRowInput,
  mode: ActiveGroupMode
): string {
  return (rawGroupValue(row, mode) ?? '').trim();
}

export function isEmptyBucketKey(key: string): boolean {
  return key === EMPTY_KEY;
}

/** Human banner label for a group key under a mode. The empty bucket reads
 *  "(Untyped)" for the Type grouping and "(Uncategorized)" otherwise; platform
 *  keys map through the injected friendly-label map; category/type keys are
 *  themselves. */
export function groupLabelOf(
  key: string,
  mode: ActiveGroupMode,
  platformLabels?: Record<string, string>
): string {
  if (isEmptyBucketKey(key)) {
    return mode === 'type' ? UNTYPED_LABEL : UNCATEGORIZED_LABEL;
  }
  if (mode === 'platform') {
    return platformLabels?.[key] ?? key;
  }
  return key;
}

/**
 * Re-bucket an already-ordered flat list of CompetitorUrl rows into banner
 * groups for the active grouping mode. No rows are dropped — every input row
 * appears in exactly one group, and the within-group order is the input order.
 * Groups are ordered by the saved `groupOrder` first, then alphabetically
 * (case-insensitive) for the rest, with the empty bucket forced last.
 */
export function buildMainGroupedRows<T extends MainGroupRowInput>(
  orderedRows: ReadonlyArray<T>,
  mode: ActiveGroupMode,
  options: BuildMainGroupedRowsOptions = {}
): MainGroup<T>[] {
  const { groupOrder, platformLabels } = options;

  // 1. Bucket rows by normalized key, preserving the input (already-sorted)
  //    order both within and across first-appearance.
  const buckets = new Map<string, T[]>();
  for (const row of orderedRows) {
    const key = groupKeyOf(row, mode);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  }

  // 2. Order the groups: explicit saved order first (excluding the empty
  //    bucket), then alphabetical for the rest, then the empty bucket last.
  const realKeys = [...buckets.keys()].filter((k) => !isEmptyBucketKey(k));
  const orderRank = new Map<string, number>();
  if (groupOrder) {
    groupOrder.forEach((k, i) => {
      if (!isEmptyBucketKey(k)) orderRank.set(k, i);
    });
  }
  realKeys.sort((a, b) => {
    const ra = orderRank.has(a) ? orderRank.get(a)! : Number.MAX_SAFE_INTEGER;
    const rb = orderRank.has(b) ? orderRank.get(b)! : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
  });

  const orderedKeys = realKeys;
  if (buckets.has(EMPTY_KEY)) orderedKeys.push(EMPTY_KEY);

  // 3. Materialize the groups.
  return orderedKeys.map((key) => ({
    key,
    label: groupLabelOf(key, mode, platformLabels),
    isEmptyBucket: isEmptyBucketKey(key),
    rows: buckets.get(key)!,
  }));
}

/** The on-screen REORDERABLE banner keys (real groups only, empty bucket
 *  excluded). Feeds applyCategoryDrag's `displayedKeys` so a banner drag never
 *  tries to move the pinned-last empty bucket. */
export function reorderableGroupKeys<T extends MainGroupRowInput>(
  groups: ReadonlyArray<MainGroup<T>>
): string[] {
  return groups.filter((g) => !g.isEmptyBucket).map((g) => g.key);
}

// ─── groupOrder map (per-mode saved banner orders) ─────────────────────────
// The shared layout persists ONE banner order per active mode, since the key
// sets differ (platforms vs. categories vs. types). Stored as a plain map
// { platform?: string[]; category?: string[]; type?: string[] }.

export type GroupOrderMap = Partial<Record<ActiveGroupMode, string[]>>;

export const EMPTY_GROUP_ORDER_MAP: GroupOrderMap = {};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

/** Coerce an unknown DB/wire value into a GroupOrderMap. Best-effort: unknown
 *  modes are dropped and non-array values degrade to omitted, so a malformed or
 *  legacy blob never throws on read. */
export function coerceGroupOrderMap(raw: unknown): GroupOrderMap {
  if (!isPlainObject(raw)) return {};
  const out: GroupOrderMap = {};
  for (const mode of ['platform', 'category', 'type'] as const) {
    if (mode in raw && Array.isArray(raw[mode])) {
      out[mode] = toStringList(raw[mode]);
    }
  }
  return out;
}
