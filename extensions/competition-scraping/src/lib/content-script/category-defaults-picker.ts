// P-61 (2026-06-02-j) — shared DOM behavior for the capture-overlay category
// picker with a pinned "★ Defaults" group + a contextual "★ Make default"
// checkbox. Used identically by the text / image / video capture forms.
//
// Design (director-chosen, Rule 14f):
//   - The native <select> shows a "★ Defaults" optgroup (the defaults for the
//     current platform + content-type) pinned above an "All categories"
//     optgroup, then the existing "+ Add new…" sentinel.
//   - A single checkbox below the select — "★ Make default for <Platform> ·
//     <type>" — reflects the currently-selected (or newly-typed) category:
//       • existing category selected → checked = it is a default; toggling
//         pins/un-pins it live (server call).
//       • "+ Add new…" selected → the checkbox is a pending intent; the form
//         calls commitNewCategoryDefault(newValue) after it creates the
//         vocabulary entry on save.
//       • placeholder selected → the checkbox row is hidden.
//
// The pure grouping logic lives in src/lib/competition-scraping/
// category-defaults.ts (unit-tested); this module is the DOM + I/O glue.

import {
  buildCategoryPickerOptions,
  isDefaultCategory,
} from '../../../../../src/lib/competition-scraping/category-defaults.ts';
import type {
  Platform,
  VocabularyType,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import {
  addCategoryDefault,
  removeCategoryDefault,
} from './api-bridge.ts';

export interface CategoryDefaultsPickerOptions {
  projectId: string;
  platform: Platform;
  vocabularyType: VocabularyType;
  /** "text" | "image" | "video" — for the checkbox label. */
  contentTypeLabel: string;
  categorySelect: HTMLSelectElement;
  /** The sentinel <option> value that opens the "+ Add new…" input. */
  addNewSentinel: string;
  /** Placeholder option label (e.g. "Pick a content category…"). */
  placeholderText: string;
  /** Element the "★ Make default" checkbox row is appended to. */
  container: HTMLElement;
  /** Initial vocabulary values (VocabularyEntry.value list). */
  vocabValues: string[];
  /** Initial default values for this (platform, content-type). */
  defaultValues: string[];
}

export interface CategoryDefaultsPickerHandle {
  /** On save of a NEW category: if "make default" is checked, pin it. */
  commitNewCategoryDefault(value: string): Promise<void>;
}

/** Title-case a platform slug for display: "google-shopping" → "Google Shopping". */
function platformLabel(platform: string): string {
  return platform
    .split('-')
    .map((w) => (w.length === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

export function attachCategoryDefaultsPicker(
  opts: CategoryDefaultsPickerOptions
): CategoryDefaultsPickerHandle {
  const {
    projectId,
    platform,
    vocabularyType,
    contentTypeLabel,
    categorySelect,
    addNewSentinel,
    placeholderText,
    container,
    vocabValues,
  } = opts;

  // Local mutable copy of the defaults so live pins/un-pins reflect instantly.
  let defaults = [...opts.defaultValues];

  // ── "★ Make default" checkbox row ─────────────────────────────────────
  const makeDefaultRow = document.createElement('label');
  makeDefaultRow.className = 'plos-cs-form-make-default';
  makeDefaultRow.style.display = 'none';
  makeDefaultRow.style.alignItems = 'center';
  makeDefaultRow.style.gap = '6px';
  makeDefaultRow.style.marginTop = '6px';
  makeDefaultRow.style.fontSize = '12px';
  makeDefaultRow.style.cursor = 'pointer';

  const makeDefaultCheckbox = document.createElement('input');
  makeDefaultCheckbox.type = 'checkbox';
  makeDefaultCheckbox.className = 'plos-cs-form-make-default-checkbox';

  const makeDefaultText = document.createElement('span');
  makeDefaultText.textContent = `★ Make default for ${platformLabel(platform)} · ${contentTypeLabel}`;

  makeDefaultRow.appendChild(makeDefaultCheckbox);
  makeDefaultRow.appendChild(makeDefaultText);
  container.appendChild(makeDefaultRow);

  // ── Render the select options (placeholder + ★ Defaults + others + add) ──
  function renderOptions(): void {
    const { defaults: defGroup, others } = buildCategoryPickerOptions(
      vocabValues,
      defaults
    );

    categorySelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = placeholderText;
    categorySelect.appendChild(placeholder);

    if (defGroup.length > 0) {
      const grp = document.createElement('optgroup');
      grp.label = '★ Defaults';
      for (const value of defGroup) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        grp.appendChild(opt);
      }
      categorySelect.appendChild(grp);
    }

    if (others.length > 0) {
      const grp = document.createElement('optgroup');
      grp.label = defGroup.length > 0 ? 'All categories' : '';
      for (const value of others) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        grp.appendChild(opt);
      }
      categorySelect.appendChild(grp);
    }

    const addNew = document.createElement('option');
    addNew.value = addNewSentinel;
    addNew.textContent = '+ Add new…';
    categorySelect.appendChild(addNew);
  }

  // Reflect the checkbox row to the current selection.
  function syncCheckboxRow(): void {
    const value = categorySelect.value;
    if (value === addNewSentinel) {
      makeDefaultRow.style.display = 'flex';
      makeDefaultCheckbox.checked = false; // pending intent for the new name
      makeDefaultCheckbox.disabled = false;
    } else if (value === '') {
      makeDefaultRow.style.display = 'none';
    } else {
      makeDefaultRow.style.display = 'flex';
      makeDefaultCheckbox.checked = isDefaultCategory(defaults, value);
      makeDefaultCheckbox.disabled = false;
    }
  }

  categorySelect.addEventListener('change', syncCheckboxRow);

  // Live pin/un-pin when toggling an EXISTING selected category.
  makeDefaultCheckbox.addEventListener('change', () => {
    const value = categorySelect.value;
    if (value === addNewSentinel || value === '') return; // add-new: handled on save
    const wantDefault = makeDefaultCheckbox.checked;
    // Optimistic local update + re-render so it hops between the groups; keep
    // the same value selected.
    if (wantDefault && !defaults.includes(value)) defaults.push(value);
    if (!wantDefault) defaults = defaults.filter((v) => v !== value);
    renderOptions();
    categorySelect.value = value;
    syncCheckboxRow();
    // Fire-and-forget the server write; on failure, log only (the daily
    // reconcile + next form-open re-fetch are authoritative).
    makeDefaultCheckbox.disabled = true;
    const done = () => {
      makeDefaultCheckbox.disabled = false;
    };
    if (wantDefault) {
      void addCategoryDefault(projectId, { platform, vocabularyType, value })
        .catch((err) => console.error('P-61 addCategoryDefault failed:', err))
        .finally(done);
    } else {
      void removeCategoryDefault(projectId, platform, vocabularyType, value)
        .catch((err) => console.error('P-61 removeCategoryDefault failed:', err))
        .finally(done);
    }
  });

  // Initial paint.
  renderOptions();
  syncCheckboxRow();

  return {
    async commitNewCategoryDefault(value: string): Promise<void> {
      if (!makeDefaultCheckbox.checked) return;
      const trimmed = value.trim();
      if (trimmed === '') return;
      try {
        await addCategoryDefault(projectId, {
          platform,
          vocabularyType,
          value: trimmed,
        });
        if (!defaults.includes(trimmed)) defaults.push(trimmed);
      } catch (err) {
        console.error('P-61 commitNewCategoryDefault failed:', err);
      }
    },
  };
}
