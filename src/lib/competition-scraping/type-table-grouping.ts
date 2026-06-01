// W#2 P-49 W5 Type page Sessions 4-5 (2026-05-31) — pure grouping logic for
// the "Reviews Analysis By Competitor Type Table". Mirror of the sibling
// `category-table-grouping.ts` with the grouping key swapped from
// `competitionCategory` to `type` and the fallback bucket from
// "(Uncategorized)" to "(Untyped)".
//
// The verbatim director rule (§1 of
// docs/polish-item-specs/P-49-W5-S5-type-page.md): one display row per
// CompetitorUrl, clustered by Type, with the Type label carried ONLY on the
// first row of each group and blank on the rest. URLs with null/empty `type`
// bucket into an "(Untyped)" group that always sorts LAST.
//
// Type groups sort alphabetically (case-insensitive); competitor rows within
// a group preserve input order unless an explicit drag order is supplied.

export const UNTYPED_LABEL = '(Untyped)';

// Internal sentinel group key for the untyped bucket. The empty string is a
// safe choice: real type keys are always trimmed-non-empty (see
// normalizeTypeKey), so the empty string can never collide with one.
const UNTYPED_KEY = '';

export interface TypeGroupRowInput {
  id: string;
  type: string | null | undefined;
}

export interface TypeDisplayRow<T extends TypeGroupRowInput> {
  /** The underlying CompetitorUrl row. */
  url: T;
  /** Normalized group key (real trimmed type, or the empty-string untyped
   *  sentinel). Stable join key for per-group state (e.g. type-level AI
   *  cells). */
  typeKey: string;
  /** Human label for Column 1 — the type name on the first row of the group,
   *  the "(Untyped)" label on the untyped group's first row, and '' (empty)
   *  on every subsequent row in a group. */
  typeLabel: string;
  /** True on the first row of each type group (the "main type row"): carries
   *  the Column 1 label + the Column 12/13 type-level AI cells. */
  isFirstInGroup: boolean;
  /** True for every row in the "(Untyped)" bucket. */
  isUntyped: boolean;
  /** Number of rows in this row's type group (handy for rowspans). */
  groupSize: number;
  /** 0-based index of this row within its group. */
  indexInGroup: number;
}

export interface BuildTypeGroupedRowsOptions {
  /** Explicit type-group ordering by group key (drag persistence). Keys
   *  absent from the list fall back to the alphabetical tail after the listed
   *  ones. The untyped group is ALWAYS forced last regardless of this list. */
  typeOrder?: ReadonlyArray<string>;
  /** Explicit within-group competitor ordering by url id (drag persistence).
   *  Ids absent from the list fall back to input order after the listed
   *  ones. */
  rowOrderByUrlId?: ReadonlyArray<string>;
}

// Normalize a raw type value to its group key. null / undefined /
// whitespace-only → the empty-string untyped sentinel.
export function normalizeTypeKey(raw: string | null | undefined): string {
  return (raw ?? '').trim();
}

export function isUntypedKey(key: string): boolean {
  return key === UNTYPED_KEY;
}

// Display label for a group key (the untyped sentinel maps to the human
// "(Untyped)" label; real keys are themselves).
export function typeKeyToLabel(key: string): string {
  return isUntypedKey(key) ? UNTYPED_LABEL : key;
}

/**
 * Re-list a flat array of CompetitorUrl rows into the type-grouped display
 * order: clustered by Type, first row of each group carrying the label,
 * "(Untyped)" last. No rows are dropped — every input row appears exactly once.
 */
export function buildTypeGroupedRows<T extends TypeGroupRowInput>(
  urls: ReadonlyArray<T>,
  options: BuildTypeGroupedRowsOptions = {}
): TypeDisplayRow<T>[] {
  const { typeOrder, rowOrderByUrlId } = options;

  // 1. Bucket rows by normalized type key, preserving input order.
  const buckets = new Map<string, T[]>();
  for (const url of urls) {
    const key = normalizeTypeKey(url.type);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(url);
    else buckets.set(key, [url]);
  }

  // 2. Order the within-group rows (optional explicit order, else input order
  //    which the bucket already preserves).
  if (rowOrderByUrlId && rowOrderByUrlId.length > 0) {
    const rank = new Map<string, number>();
    rowOrderByUrlId.forEach((id, i) => rank.set(id, i));
    for (const bucket of buckets.values()) {
      bucket.sort((a, b) => {
        const ra = rank.has(a.id) ? rank.get(a.id)! : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.id) ? rank.get(b.id)! : Number.MAX_SAFE_INTEGER;
        return ra - rb; // stable: equal ranks keep input order
      });
    }
  }

  // 3. Order the groups: explicit order first (excluding untyped), then
  //    alphabetical (case-insensitive) for the rest, then the untyped group
  //    forced last.
  const allKeys = [...buckets.keys()];
  const realKeys = allKeys.filter((k) => !isUntypedKey(k));

  const orderRank = new Map<string, number>();
  if (typeOrder) {
    typeOrder.forEach((k, i) => {
      if (!isUntypedKey(k)) orderRank.set(k, i);
    });
  }
  realKeys.sort((a, b) => {
    const ra = orderRank.has(a) ? orderRank.get(a)! : Number.MAX_SAFE_INTEGER;
    const rb = orderRank.has(b) ? orderRank.get(b)! : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
  });

  const orderedKeys = realKeys;
  if (buckets.has(UNTYPED_KEY)) orderedKeys.push(UNTYPED_KEY);

  // 4. Flatten into display rows, stamping first-in-group + label.
  const out: TypeDisplayRow<T>[] = [];
  for (const key of orderedKeys) {
    const bucket = buckets.get(key)!;
    const label = typeKeyToLabel(key);
    const isUntyped = isUntypedKey(key);
    bucket.forEach((url, indexInGroup) => {
      const isFirstInGroup = indexInGroup === 0;
      out.push({
        url,
        typeKey: key,
        typeLabel: isFirstInGroup ? label : '',
        isFirstInGroup,
        isUntyped,
        groupSize: bucket.length,
        indexInGroup,
      });
    });
  }
  return out;
}

// ─── nested grouping (mirrors the Category interactive batch) ─────────────
// The interactive page moves the type label onto its OWN banner row, with all
// competitor rows beneath it (so the first competitor is draggable). The page
// renders one banner + a block of competitor rows per type, so it needs the
// rows folded back into per-type blocks. This re-uses the flat ordering
// produced by buildTypeGroupedRows (single source of truth for the order) and
// groups consecutive same-type rows.

export interface TypeGroup<T extends TypeGroupRowInput> {
  /** Normalized group key (real trimmed type, or the untyped sentinel).
   *  Stable id for type-level drag + hidden state. */
  key: string;
  /** Human label for the banner row ("(Untyped)" for the bucket). */
  label: string;
  /** True for the "(Untyped)" group. */
  isUntyped: boolean;
  /** The type's competitor display rows, in their within-group order. */
  rows: TypeDisplayRow<T>[];
}

/** Fold a flat, already-ordered display-row list into per-type blocks,
 *  preserving the flat order. Adjacent rows sharing a typeKey join one block;
 *  the flat builder guarantees a type's rows are contiguous. */
export function foldIntoTypeGroups<T extends TypeGroupRowInput>(
  displayRows: ReadonlyArray<TypeDisplayRow<T>>
): TypeGroup<T>[] {
  const groups: TypeGroup<T>[] = [];
  let current: TypeGroup<T> | null = null;
  for (const row of displayRows) {
    if (!current || current.key !== row.typeKey) {
      current = {
        key: row.typeKey,
        label: typeKeyToLabel(row.typeKey),
        isUntyped: row.isUntyped,
        rows: [],
      };
      groups.push(current);
    }
    current.rows.push(row);
  }
  return groups;
}

/** Build the per-type blocks for the interactive Type page in one step:
 *  order (via typeOrder + rowOrderByUrlId) then fold into blocks. Hidden-row
 *  filtering is the caller's job (it happens before this so the page can also
 *  surface a "restore hidden" panel). */
export function buildTypeGroups<T extends TypeGroupRowInput>(
  urls: ReadonlyArray<T>,
  options: BuildTypeGroupedRowsOptions = {}
): TypeGroup<T>[] {
  return foldIntoTypeGroups(buildTypeGroupedRows(urls, options));
}
