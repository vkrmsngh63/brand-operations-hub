// P-61 (2026-06-02-j) — pure helpers for the extension capture-overlay
// category picker with a pinned "★ Defaults" group.
//
// The capture overlay shows ONE native <select> with two groups: the
// default categories for the current (platform, content-type) pinned at the
// top, then every other category. These helpers turn the two server lists
// (the full vocabulary values + the default values) into the grouped option
// model, and answer "is this value currently a default?" for the contextual
// "★ Make default" checkbox. No DOM, no I/O — unit-testable.

/**
 * Split the category values into the pinned "defaults" group and the
 * "others" group for the picker.
 *
 * - `defaults` = the default values, de-duplicated, in the order the server
 *   returned them. A default value is included even if it is NOT in
 *   `vocabValues` (e.g. its VocabularyEntry was deleted but the default row
 *   remained) so the pinned quick-pick never silently disappears.
 * - `others` = the vocabulary values NOT in the defaults set, de-duplicated,
 *   in vocabulary order.
 *
 * Every selectable value therefore appears exactly once across the two
 * groups.
 */
export function buildCategoryPickerOptions(
  vocabValues: readonly string[],
  defaultValues: readonly string[]
): { defaults: string[]; others: string[] } {
  const defaultSet = new Set(defaultValues);

  const seenDefault = new Set<string>();
  const defaults: string[] = [];
  for (const v of defaultValues) {
    if (seenDefault.has(v)) continue;
    seenDefault.add(v);
    defaults.push(v);
  }

  const seenOther = new Set<string>();
  const others: string[] = [];
  for (const v of vocabValues) {
    if (defaultSet.has(v)) continue;
    if (seenOther.has(v)) continue;
    seenOther.add(v);
    others.push(v);
  }

  return { defaults, others };
}

/** True when `value` is currently a default for the (platform, type) in scope. */
export function isDefaultCategory(
  defaultValues: readonly string[],
  value: string
): boolean {
  if (value === '') return false;
  return defaultValues.includes(value);
}
