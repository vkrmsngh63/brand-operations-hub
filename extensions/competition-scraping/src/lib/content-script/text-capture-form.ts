// Text-capture overlay form. Opens when the user invokes the right-click
// context-menu item "Add to PLOS — Captured Text" on a text selection
// inside a recognized platform page.
//
// Per COMPETITION_SCRAPING_DESIGN.md §A.7 Module 2 highlight-and-add flow:
//   - Captured text — editable textarea, pre-filled with the selection.
//   - Saved URL — picker over the project's already-captured URLs for the
//     current platform; pre-selects the row matching the current page URL
//     (via pickInitialUrl) when one is recognized.
//   - Content category — dropdown over the project's existing
//     content-category vocabulary entries; "+ Add new…" reveals an inline
//     input so the user can create a new category on the spot. New
//     categories are upserted via POST /api/projects/[projectId]/vocabulary.
//   - Tags — chip-list with Enter/comma to add; X-on-chip to remove.
//
// Save calls POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text.
// On 200/201 the form closes. On 4xx/5xx the form stays open with inline
// error. Backdrop click + Esc + Cancel all close without saving.
//
// Director-picked Option A (right-click context-menu only) at session 4
// start 2026-05-11. Keyboard shortcut is NOT shipped this session per the
// recommendation marker.

import {
  PlosApiError,
  createCapturedText,
  createVocabularyEntry,
  listCompetitorUrls,
  listVocabularyEntries,
} from './api-bridge.ts';
import type { Platform } from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../platforms.ts';
import { getModuleByPlatform } from '../platform-modules/registry.ts';
import {
  normalizeTags,
  pickInitialUrl,
  validateCapturedTextDraft,
} from '../captured-text-validation.ts';

export interface TextCaptureFormProps {
  /** The text the user selected when invoking the context menu. May be
   * empty (Chrome routes the click even on a degenerate selection). */
  initialText: string;
  /** Page URL where the right-click happened. Used to pre-select the
   * saved-URL picker via pickInitialUrl. */
  pageUrl: string;
  /** Currently selected Project from popup-state. */
  projectId: string;
  /** Best-effort project display name. Shown in the context block. */
  projectName: string | null;
  /** Currently selected Platform from popup-state. The form filters the
   * saved-URL picker to this platform — text capture without a target URL
   * for the page's platform doesn't make sense. */
  platform: Platform;
  /** Callback invoked after a successful save. The orchestrator currently
   * has no special post-save behavior (the next page-load's
   * listCompetitorUrls call would pick up the new text row indirectly via
   * the detail page), so this callback is informational. */
  onSaved(): void;
  /** Callback invoked when the user closes the form without saving. */
  onClose(): void;
}

export interface TextCaptureForm {
  /** Removes the form from the DOM. Idempotent. */
  destroy(): void;
}

let activeForm: TextCaptureForm | null = null;

// Sentinel option value for the content-category picker. Picking it
// reveals the inline "new category" input.
const ADD_NEW_CATEGORY_VALUE = '__plos_add_new_category__';

export function openTextCaptureForm(
  props: TextCaptureFormProps,
): TextCaptureForm {
  // Replace any existing text-capture form so we never have two backdrops
  // stacked. Coexistence with the URL-add form is allowed (they're
  // independent singletons); the user can dismiss either with Esc.
  if (activeForm !== null) {
    activeForm.destroy();
    activeForm = null;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'plos-cs-form-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Add captured text');

  const form = document.createElement('form');
  form.className = 'plos-cs-form';
  form.noValidate = true;

  const title = document.createElement('h2');
  title.className = 'plos-cs-form-title';
  title.textContent = 'Add captured text to PLOS';
  form.appendChild(title);

  // Context block (Project + Platform — read-only; matches url-add-form's
  // shape so workers see the same chrome whether capturing URL or text).
  const context = document.createElement('div');
  context.className = 'plos-cs-form-context';
  const projectLine = document.createElement('div');
  const projectLabel = document.createElement('span');
  projectLabel.textContent = 'Project: ';
  const projectStrong = document.createElement('strong');
  projectStrong.textContent = props.projectName ?? '(unnamed project)';
  projectLine.appendChild(projectLabel);
  projectLine.appendChild(projectStrong);
  context.appendChild(projectLine);

  const platformLine = document.createElement('div');
  const platformLabel = document.createElement('span');
  platformLabel.textContent = 'Platform: ';
  const platformStrong = document.createElement('strong');
  platformStrong.textContent =
    getPlatformLabel(props.platform) ?? props.platform;
  platformLine.appendChild(platformLabel);
  platformLine.appendChild(platformStrong);
  context.appendChild(platformLine);
  form.appendChild(context);

  // Loading / status banner — used during initial fetch of saved URLs +
  // vocabulary, hidden once both arrive. Distinct from the inline error
  // (which is for save failures); the form's chrome stays put under both.
  const statusBanner = document.createElement('div');
  statusBanner.className = 'plos-cs-form-status';
  statusBanner.textContent = 'Loading your saved URLs and categories…';
  form.appendChild(statusBanner);

  // ── Saved URL picker ─────────────────────────────────────────────────
  const urlFieldWrap = document.createElement('div');
  urlFieldWrap.className = 'plos-cs-form-field';
  const urlFieldLabel = document.createElement('label');
  urlFieldLabel.className = 'plos-cs-form-label';
  urlFieldLabel.htmlFor = 'plos-cs-text-url';
  urlFieldLabel.textContent = 'Attach to which saved URL?';
  const urlSelect = document.createElement('select');
  urlSelect.id = 'plos-cs-text-url';
  urlSelect.name = 'url';
  urlSelect.className = 'plos-cs-form-select';
  urlSelect.disabled = true;
  // Placeholder option appears until URLs load.
  const placeholderUrlOpt = document.createElement('option');
  placeholderUrlOpt.value = '';
  placeholderUrlOpt.textContent = 'Loading…';
  urlSelect.appendChild(placeholderUrlOpt);
  urlFieldWrap.appendChild(urlFieldLabel);
  urlFieldWrap.appendChild(urlSelect);
  form.appendChild(urlFieldWrap);

  // ── Captured text textarea ───────────────────────────────────────────
  const textFieldWrap = document.createElement('div');
  textFieldWrap.className = 'plos-cs-form-field';
  const textFieldLabel = document.createElement('label');
  textFieldLabel.className = 'plos-cs-form-label';
  textFieldLabel.htmlFor = 'plos-cs-text-body';
  textFieldLabel.textContent = 'Captured text';
  const textArea = document.createElement('textarea');
  textArea.id = 'plos-cs-text-body';
  textArea.name = 'text';
  textArea.className = 'plos-cs-form-textarea';
  textArea.rows = 5;
  textArea.value = props.initialText;
  textArea.placeholder =
    'Paste or edit the text you want to save against this URL.';
  textFieldWrap.appendChild(textFieldLabel);
  textFieldWrap.appendChild(textArea);
  form.appendChild(textFieldWrap);

  // ── Content category picker (with inline "+ Add new") ────────────────
  const categoryFieldWrap = document.createElement('div');
  categoryFieldWrap.className = 'plos-cs-form-field';
  const categoryFieldLabel = document.createElement('label');
  categoryFieldLabel.className = 'plos-cs-form-label';
  categoryFieldLabel.htmlFor = 'plos-cs-text-category';
  categoryFieldLabel.textContent = 'Content category';
  const categorySelect = document.createElement('select');
  categorySelect.id = 'plos-cs-text-category';
  categorySelect.name = 'category';
  categorySelect.className = 'plos-cs-form-select';
  categorySelect.disabled = true;
  const placeholderCatOpt = document.createElement('option');
  placeholderCatOpt.value = '';
  placeholderCatOpt.textContent = 'Loading…';
  categorySelect.appendChild(placeholderCatOpt);
  categoryFieldWrap.appendChild(categoryFieldLabel);
  categoryFieldWrap.appendChild(categorySelect);
  // Inline "+ Add new" input — hidden until user picks the sentinel.
  const newCategoryWrap = document.createElement('div');
  newCategoryWrap.className = 'plos-cs-form-inline-add';
  newCategoryWrap.style.display = 'none';
  const newCategoryInput = document.createElement('input');
  newCategoryInput.type = 'text';
  newCategoryInput.className = 'plos-cs-form-input';
  newCategoryInput.placeholder = 'Type new category name';
  newCategoryWrap.appendChild(newCategoryInput);
  categoryFieldWrap.appendChild(newCategoryWrap);
  form.appendChild(categoryFieldWrap);

  // ── Tags chip-list ───────────────────────────────────────────────────
  const tagsFieldWrap = document.createElement('div');
  tagsFieldWrap.className = 'plos-cs-form-field';
  const tagsFieldLabel = document.createElement('label');
  tagsFieldLabel.className = 'plos-cs-form-label';
  tagsFieldLabel.htmlFor = 'plos-cs-text-tags-input';
  tagsFieldLabel.textContent = 'Tags (optional)';
  const tagsChipRow = document.createElement('div');
  tagsChipRow.className = 'plos-cs-chip-row';
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.id = 'plos-cs-text-tags-input';
  tagsInput.className = 'plos-cs-form-input';
  tagsInput.placeholder = 'Type a tag and press Enter';
  tagsFieldWrap.appendChild(tagsFieldLabel);
  tagsFieldWrap.appendChild(tagsChipRow);
  tagsFieldWrap.appendChild(tagsInput);
  form.appendChild(tagsFieldWrap);

  // Error display — populated on save failure.
  const errorBanner = document.createElement('div');
  errorBanner.className = 'plos-cs-form-error';
  errorBanner.style.display = 'none';
  form.appendChild(errorBanner);

  // Buttons
  const actions = document.createElement('div');
  actions.className = 'plos-cs-form-actions';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'plos-cs-form-button plos-cs-form-button-secondary';
  cancelBtn.textContent = 'Cancel';
  actions.appendChild(cancelBtn);
  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'plos-cs-form-button plos-cs-form-button-primary';
  saveBtn.textContent = 'Save';
  saveBtn.disabled = true; // re-enabled when URL + category lists load.
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  backdrop.appendChild(form);

  // ── Behavior wiring ──────────────────────────────────────────────────
  let tags: string[] = [];

  function renderChips(): void {
    // Idempotent re-render of the chip row from `tags`.
    tagsChipRow.innerHTML = '';
    for (const tag of tags) {
      const chip = document.createElement('span');
      chip.className = 'plos-cs-chip';
      const text = document.createElement('span');
      text.textContent = tag;
      chip.appendChild(text);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'plos-cs-chip-remove';
      remove.setAttribute('aria-label', `Remove tag ${tag}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        tags = tags.filter((t) => t !== tag);
        renderChips();
      });
      chip.appendChild(remove);
      tagsChipRow.appendChild(chip);
    }
  }

  function tryAddTagFromInput(): void {
    const value = tagsInput.value;
    // Allow either Enter (single tag) or comma-split (paste).
    const candidates = value.split(',');
    const next = normalizeTags([...tags, ...candidates]);
    tags = next;
    tagsInput.value = '';
    renderChips();
  }

  tagsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAddTagFromInput();
      return;
    }
    if (e.key === ',') {
      e.preventDefault();
      tryAddTagFromInput();
    }
  });
  tagsInput.addEventListener('blur', () => {
    // On blur, commit any in-progress tag — workers may forget to press
    // Enter before clicking Save.
    if (tagsInput.value.trim().length > 0) {
      tryAddTagFromInput();
    }
  });

  // Category picker — show inline "add new" input when sentinel picked.
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === ADD_NEW_CATEGORY_VALUE) {
      newCategoryWrap.style.display = 'block';
      newCategoryInput.focus();
    } else {
      newCategoryWrap.style.display = 'none';
      newCategoryInput.value = '';
    }
  });

  function setError(message: string | null): void {
    if (message === null) {
      errorBanner.style.display = 'none';
      errorBanner.textContent = '';
    } else {
      errorBanner.style.display = 'block';
      errorBanner.textContent = message;
    }
  }

  function setSubmitting(submitting: boolean): void {
    saveBtn.disabled = submitting;
    cancelBtn.disabled = submitting;
    urlSelect.disabled = submitting;
    textArea.disabled = submitting;
    categorySelect.disabled = submitting;
    newCategoryInput.disabled = submitting;
    tagsInput.disabled = submitting;
    saveBtn.textContent = submitting ? 'Saving…' : 'Save';
  }

  async function handleSave(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    // If the user picked "+ Add new" but didn't type a name, treat as an
    // empty category — surfaced as the standard category-required error.
    let category = categorySelect.value;
    if (category === ADD_NEW_CATEGORY_VALUE) {
      category = newCategoryInput.value;
    }

    const validation = validateCapturedTextDraft({
      competitorUrlId: urlSelect.value,
      text: textArea.value,
      contentCategory: category,
      tags,
    });
    if (!validation.ok) {
      const message: Record<typeof validation.reason, string> = {
        'url-required': 'Pick the saved URL this text belongs to.',
        'text-required': 'The captured text can’t be empty.',
        'category-required':
          'Pick a content category, or add a new one via "+ Add new…".',
      };
      setError(message[validation.reason]);
      return;
    }

    setSubmitting(true);

    try {
      // If the user picked "+ Add new", upsert the vocabulary entry first
      // so subsequent text captures see it in the picker. The server's
      // upsert semantics mean a duplicate name returns the existing row.
      if (categorySelect.value === ADD_NEW_CATEGORY_VALUE) {
        await createVocabularyEntry(props.projectId, {
          vocabularyType: 'content-category',
          value: validation.payload.contentCategory ?? '',
        });
      }

      await createCapturedText(
        props.projectId,
        urlSelect.value,
        validation.payload,
      );
      props.onSaved();
      close();
    } catch (err) {
      const message =
        err instanceof PlosApiError
          ? `Couldn’t save (${err.status || 'network'}): ${err.message}`
          : 'Couldn’t save: unknown error.';
      setError(message);
      setSubmitting(false);
    }
  }

  form.addEventListener('submit', (e) => {
    void handleSave(e as SubmitEvent);
  });
  cancelBtn.addEventListener('click', () => {
    close();
  });
  backdrop.addEventListener('mousedown', (e) => {
    // Close on backdrop click, but only when the click started on the
    // backdrop (clicks inside the form shouldn't trigger close).
    if (e.target === backdrop) {
      close();
    }
  });

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  // ── Mount + initial focus ────────────────────────────────────────────
  document.body.appendChild(backdrop);
  // Defer focus to next tick so the browser finishes the right-click
  // menu cleanup before pulling focus into the form.
  setTimeout(() => {
    textArea.focus();
    // Move cursor to end so the user can append rather than overwrite.
    const len = textArea.value.length;
    textArea.setSelectionRange(len, len);
  }, 0);

  // ── Fetch saved URLs + content-category vocab in parallel ────────────
  // We rely on api-bridge → background → vklf.com per the CORS reasoning
  // in api-bridge.ts. The form stays disabled until both responses arrive
  // (or one fails — surfacing the failure via the inline error banner).
  let loadFailed = false;
  void (async () => {
    try {
      const [rows, vocab] = await Promise.all([
        listCompetitorUrls(props.projectId, props.platform),
        listVocabularyEntries(props.projectId, 'content-category'),
      ]);

      // URL picker —
      urlSelect.innerHTML = '';
      if (rows.length === 0) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = `No saved ${getPlatformLabel(props.platform) ?? props.platform} URLs yet — capture one via "+ Add" first`;
        urlSelect.appendChild(empty);
        urlSelect.disabled = true;
        saveBtn.disabled = true;
      } else {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Pick a saved URL…';
        urlSelect.appendChild(placeholder);
        for (const row of rows) {
          const opt = document.createElement('option');
          opt.value = row.id;
          // Label: prefer product name; fall back to truncated URL so the
          // dropdown stays readable even when the URL is long.
          opt.textContent =
            row.productName?.trim() ||
            (row.url.length > 80 ? row.url.slice(0, 77) + '…' : row.url);
          urlSelect.appendChild(opt);
        }
        // P-15 fix 2026-05-12: canonicalize the page URL through the platform
        // module BEFORE the pickInitialUrl normalization step. Without this,
        // slug-variant pageUrls (e.g. Amazon's `/Product-Name-Slug/dp/{ASIN}/ref=…`)
        // fail to pre-select their saved-as-`/dp/{ASIN}` rows because
        // `normalizeUrlForRecognition` only strips `?…`, not path-level noise.
        // Mirrors orchestrator.ts:280-282 (the "already saved" overlay path).
        const platformModule = getModuleByPlatform(props.platform);
        const initial = pickInitialUrl(
          props.pageUrl,
          rows,
          platformModule
            ? (href) => platformModule.canonicalProductUrl(href)
            : undefined,
        );
        if (initial) urlSelect.value = initial.id;
        urlSelect.disabled = false;
      }

      // Category picker —
      categorySelect.innerHTML = '';
      const placeholderCat = document.createElement('option');
      placeholderCat.value = '';
      placeholderCat.textContent = 'Pick a content category…';
      categorySelect.appendChild(placeholderCat);
      for (const entry of vocab) {
        const opt = document.createElement('option');
        opt.value = entry.value;
        opt.textContent = entry.value;
        categorySelect.appendChild(opt);
      }
      const addNewOpt = document.createElement('option');
      addNewOpt.value = ADD_NEW_CATEGORY_VALUE;
      addNewOpt.textContent = '+ Add new…';
      categorySelect.appendChild(addNewOpt);
      categorySelect.disabled = false;

      statusBanner.style.display = 'none';
      if (rows.length > 0) saveBtn.disabled = false;
    } catch (err) {
      loadFailed = true;
      const message =
        err instanceof PlosApiError
          ? `Couldn’t load your saved URLs or categories (${err.status || 'network'}): ${err.message}`
          : 'Couldn’t load your saved URLs or categories.';
      statusBanner.style.display = 'none';
      setError(message);
      saveBtn.disabled = true;
    }
  })();

  // ── Lifecycle ────────────────────────────────────────────────────────
  function close(): void {
    handle.destroy();
    props.onClose();
  }

  const handle: TextCaptureForm = {
    destroy() {
      // Idempotent — multiple Esc + Cancel paths can race.
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      document.removeEventListener('keydown', onKeyDown);
      if (activeForm === handle) activeForm = null;
      // loadFailed flag retained for potential future telemetry; unused today.
      void loadFailed;
    },
  };
  activeForm = handle;
  return handle;
}
