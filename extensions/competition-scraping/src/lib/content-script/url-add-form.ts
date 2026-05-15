// URL-add overlay form. Opens when the user clicks the floating "+ Add"
// button on a competitor product link OR via the right-click context menu
// fallback per §5 guardrail #6.
//
// Per COMPETITION_SCRAPING_DESIGN.md §A.7 Module 1 the form pre-fills:
//   - URL (auto, editable) — canonical form for the link, user can edit.
//   - Project (auto from popup-state) — read-only here; shown for context.
//   - Platform (auto from popup-state) — read-only; shown for context.
//   - Optional fields: Competition Category, Product Name, Brand Name —
//     free-text in this session. PLOS-side vocabulary picker integration
//     (typeahead with create-new) is deferred to a future polish session;
//     today's free-text values are accepted server-side identically and
//     can be later normalized via the inline-edit picker on the PLOS-side
//     URL detail page (slice (a.3) shipped 2026-05-07-c).
//
// Save calls POST /api/projects/[projectId]/competition-scraping/urls. On
// 200/201 the form closes; the orchestrator updates the recognition cache
// + flips the link's "+ Add" button to the green "already saved" icon.
// On 4xx/5xx the form stays open with an inline error.
//
// Backdrop click + Esc + Cancel button all close the form without saving.

import {
  PlosApiError,
  createCompetitorUrl,
  createVocabularyEntry,
  listVocabularyEntries,
} from './api-bridge.ts';
import type {
  CompetitorUrl,
  VocabularyEntry,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../platforms.ts';

// 2026-05-15-d Slice #2.5 — sentinel value the Competition Category select
// uses to mean "add a new category." Mirrors the popup CapturedTextPasteForm's
// content-category sentinel pattern but lives in a different namespace so
// the two don't clash if the DOMs ever overlap.
const ADD_NEW_CATEGORY_VALUE = '__plos_add_new_competition_category__';

export interface UrlAddFormProps {
  /** Pre-filled URL — usually the canonical form per the platform module. */
  initialUrl: string;
  projectId: string;
  projectName: string | null;
  platform: string;
  /**
   * Bounding rect of the link/element that triggered this form. When
   * provided, the form positions itself away from the trigger so the user
   * can still see the product listing while filling in the optional fields.
   * When omitted (e.g., right-click context-menu fallback path), the form
   * falls back to its centered layout. P-7 fix 2026-05-08-d.
   */
  triggerRect?: DOMRect | null;
  /**
   * Initial value for the Sponsored Ad checkbox. P-6 + P-4 synergy: the
   * orchestrator passes `true` when the URL was detected via Amazon SSPA
   * decode (so the box is pre-checked); otherwise omitted (defaults to
   * false). Manual toggle by the user always overrides the default.
   */
  defaultIsSponsoredAd?: boolean;
  /** Callback invoked after a successful save. The orchestrator uses the
   * returned row's url field to update the recognition cache. */
  onSaved(row: CompetitorUrl): void;
  /** Callback invoked when the user closes the form without saving
   * (Cancel, Esc, backdrop). */
  onClose(): void;
}

const FORM_WIDTH_PX = 480;
const FORM_MARGIN_PX = 16;

/**
 * Returns inline-style left/top values that position the form on the side
 * of the viewport opposite the trigger's horizontal center, so the form
 * doesn't fully occlude the product listing being captured. Returns null
 * when no trigger rect is provided — caller falls back to the existing
 * flex-centered layout. P-7 fix 2026-05-08-d.
 */
function computeFormPosition(
  triggerRect: DOMRect | null,
): { left: number; top: number } | null {
  if (!triggerRect) return null;
  const viewportW = window.innerWidth;
  const triggerCenterX = triggerRect.left + triggerRect.width / 2;
  // Trigger in left half of viewport → form goes right; vice versa.
  const placeOnRight = triggerCenterX < viewportW / 2;
  let left: number;
  if (placeOnRight) {
    left = viewportW - FORM_WIDTH_PX - FORM_MARGIN_PX;
  } else {
    left = FORM_MARGIN_PX;
  }
  // Clamp for narrow viewports — keep form at least margin-far from each edge.
  if (left < FORM_MARGIN_PX) left = FORM_MARGIN_PX;
  if (left + FORM_WIDTH_PX > viewportW - FORM_MARGIN_PX) {
    left = Math.max(FORM_MARGIN_PX, viewportW - FORM_WIDTH_PX - FORM_MARGIN_PX);
  }
  // Vertical: anchor near the top of the viewport. Form's max-height honors
  // the existing CSS rule (calc(100vh - 32px)) so it scrolls if too tall.
  const top = FORM_MARGIN_PX;
  return { left, top };
}

export interface UrlAddForm {
  /** Removes the form from the DOM. Idempotent. */
  destroy(): void;
}

let activeForm: UrlAddForm | null = null;

export function openUrlAddForm(props: UrlAddFormProps): UrlAddForm {
  // Replace any existing form so we never have two backdrops stacked.
  if (activeForm !== null) {
    activeForm.destroy();
    activeForm = null;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'plos-cs-form-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Add competitor URL');

  const form = document.createElement('form');
  form.className = 'plos-cs-form';
  form.noValidate = true;

  // Title
  const title = document.createElement('h2');
  title.className = 'plos-cs-form-title';
  title.textContent = 'Add competitor URL';
  form.appendChild(title);

  // Context block (Project + Platform — read-only)
  const context = document.createElement('div');
  context.className = 'plos-cs-form-context';
  const projectLine = document.createElement('div');
  projectLine.innerHTML = '';
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

  // Field factory — keeps the field markup short + consistent.
  function makeField(
    label: string,
    name: string,
    initialValue: string,
    placeholder: string,
    isUrl = false,
  ): { wrap: HTMLElement; input: HTMLInputElement } {
    const wrap = document.createElement('div');
    wrap.className = 'plos-cs-form-field';
    const lab = document.createElement('label');
    lab.className = 'plos-cs-form-label';
    lab.textContent = label;
    lab.htmlFor = `plos-cs-${name}`;
    const input = document.createElement('input');
    input.id = `plos-cs-${name}`;
    input.name = name;
    input.type = isUrl ? 'url' : 'text';
    input.className = 'plos-cs-form-input';
    input.value = initialValue;
    input.placeholder = placeholder;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    return { wrap, input };
  }

  // 2026-05-15-d Slice #2.5 — Competition Category field with the same
  // sentinel-based dropdown pattern the popup's CapturedTextPasteForm uses
  // for content-category. The DOM lives in plain TS here (content-script
  // context, no React framework) so we build it imperatively.
  function makeCategoryField(): {
    wrap: HTMLElement;
    getValue: () => string;
    isAddingNew: () => boolean;
    setDisabled: (disabled: boolean) => void;
    populateEntries: (entries: VocabularyEntry[]) => void;
    setLoadError: (message: string | null) => void;
    absorbNewEntry: (entry: VocabularyEntry) => void;
  } {
    const wrap = document.createElement('div');
    wrap.className = 'plos-cs-form-field';

    const lab = document.createElement('label');
    lab.className = 'plos-cs-form-label';
    lab.textContent = 'Competition Category (optional)';
    lab.htmlFor = 'plos-cs-category';
    wrap.appendChild(lab);

    const select = document.createElement('select');
    select.id = 'plos-cs-category';
    select.name = 'category';
    select.className = 'plos-cs-form-input';

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = 'Pick or add a category…';
    select.appendChild(placeholderOpt);

    const addNewOpt = document.createElement('option');
    addNewOpt.value = ADD_NEW_CATEGORY_VALUE;
    addNewOpt.textContent = '+ Add new…';
    select.appendChild(addNewOpt);

    wrap.appendChild(select);

    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'plos-cs-form-input';
    newInput.placeholder = 'Type the new category name';
    newInput.style.marginTop = '6px';
    newInput.hidden = true;
    wrap.appendChild(newInput);

    const loadNote = document.createElement('div');
    loadNote.className = 'plos-cs-form-help';
    loadNote.style.marginTop = '4px';
    loadNote.style.fontSize = '12px';
    loadNote.style.color = '#f0883e';
    loadNote.hidden = true;
    wrap.appendChild(loadNote);

    select.addEventListener('change', () => {
      if (select.value === ADD_NEW_CATEGORY_VALUE) {
        newInput.hidden = false;
        // Defer focus so the layout has settled.
        setTimeout(() => newInput.focus(), 0);
      } else {
        newInput.hidden = true;
        newInput.value = '';
      }
    });

    return {
      wrap,
      getValue() {
        if (select.value === ADD_NEW_CATEGORY_VALUE) {
          return newInput.value.trim();
        }
        return select.value;
      },
      isAddingNew() {
        return select.value === ADD_NEW_CATEGORY_VALUE;
      },
      setDisabled(disabled: boolean) {
        select.disabled = disabled;
        newInput.disabled = disabled;
      },
      populateEntries(entries: VocabularyEntry[]) {
        // Sort by value for a stable, scannable dropdown order.
        const sorted = [...entries].sort((a, b) =>
          a.value.localeCompare(b.value, undefined, { sensitivity: 'base' }),
        );
        // Insert each entry's option just before the "+ Add new…" sentinel
        // so existing entries appear above the create row.
        for (const entry of sorted) {
          const opt = document.createElement('option');
          opt.value = entry.value;
          opt.textContent = entry.value;
          select.insertBefore(opt, addNewOpt);
        }
      },
      setLoadError(message: string | null) {
        if (message === null) {
          loadNote.hidden = true;
          loadNote.textContent = '';
        } else {
          loadNote.hidden = false;
          loadNote.textContent = message;
        }
      },
      absorbNewEntry(entry: VocabularyEntry) {
        // After a successful create-or-return-existing POST: ensure the
        // entry is an option in the select, then select it (so the same
        // form on next open shows the new value already in the dropdown
        // — but the form re-mounts on each open, so this is mainly for
        // the rare case where the user picks "+ Add new…" twice with the
        // same value).
        const existing = Array.from(select.options).find(
          (o) => o.value === entry.value,
        );
        if (!existing) {
          const opt = document.createElement('option');
          opt.value = entry.value;
          opt.textContent = entry.value;
          select.insertBefore(opt, addNewOpt);
        }
        select.value = entry.value;
        newInput.hidden = true;
        newInput.value = '';
      },
    };
  }

  const urlField = makeField(
    'URL',
    'url',
    props.initialUrl,
    'https://...',
    true,
  );
  const categoryField = makeCategoryField();
  const productField = makeField(
    'Product Name (optional)',
    'product-name',
    '',
    'e.g., Brand X red light therapy device',
  );
  const brandField = makeField(
    'Brand Name (optional)',
    'brand-name',
    '',
    'e.g., Brand X',
  );

  form.appendChild(urlField.wrap);
  form.appendChild(categoryField.wrap);
  form.appendChild(productField.wrap);
  form.appendChild(brandField.wrap);

  // P-6 — Sponsored Ad checkbox. Below the 3 free-text fields. Pre-checked
  // when defaultIsSponsoredAd is true (orchestrator passes this for Amazon
  // SSPA-detected URLs per the P-4 synergy); always manually toggleable.
  const sponsoredWrap = document.createElement('div');
  sponsoredWrap.className = 'plos-cs-form-field plos-cs-form-field-checkbox';
  const sponsoredLabel = document.createElement('label');
  sponsoredLabel.className = 'plos-cs-form-checkbox-label';
  sponsoredLabel.htmlFor = 'plos-cs-is-sponsored-ad';
  const sponsoredInput = document.createElement('input');
  sponsoredInput.id = 'plos-cs-is-sponsored-ad';
  sponsoredInput.name = 'is-sponsored-ad';
  sponsoredInput.type = 'checkbox';
  sponsoredInput.className = 'plos-cs-form-checkbox';
  sponsoredInput.checked = props.defaultIsSponsoredAd === true;
  const sponsoredText = document.createElement('span');
  sponsoredText.textContent = 'Sponsored Ad';
  sponsoredLabel.appendChild(sponsoredInput);
  sponsoredLabel.appendChild(sponsoredText);
  sponsoredWrap.appendChild(sponsoredLabel);
  form.appendChild(sponsoredWrap);

  // Error display (initially hidden; populated on save failure)
  const error = document.createElement('div');
  error.className = 'plos-cs-form-error';
  error.style.display = 'none';
  form.appendChild(error);

  // Buttons
  const actions = document.createElement('div');
  actions.className = 'plos-cs-form-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className =
    'plos-cs-form-button plos-cs-form-button-secondary';
  cancelBtn.textContent = 'Cancel';
  actions.appendChild(cancelBtn);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'plos-cs-form-button plos-cs-form-button-primary';
  saveBtn.textContent = 'Save';
  actions.appendChild(saveBtn);

  form.appendChild(actions);

  backdrop.appendChild(form);

  // ─── behavior ─────────────────────────────────────────────────────────
  function close(): void {
    handle.destroy();
    props.onClose();
  }

  function setError(message: string | null): void {
    if (message === null) {
      error.style.display = 'none';
      error.textContent = '';
    } else {
      error.style.display = 'block';
      error.textContent = message;
    }
  }

  function setSaving(saving: boolean): void {
    saveBtn.disabled = saving;
    cancelBtn.disabled = saving;
    urlField.input.disabled = saving;
    categoryField.setDisabled(saving);
    productField.input.disabled = saving;
    brandField.input.disabled = saving;
    sponsoredInput.disabled = saving;
    saveBtn.textContent = saving ? 'Saving…' : 'Save';
  }

  async function handleSave(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    const url = urlField.input.value.trim();
    if (url.length === 0) {
      setError('URL is required.');
      return;
    }

    // 2026-05-15-d Slice #2.5 — resolve Competition Category from the select +
    // optional "Add new" free-text. If the user picked "+ Add new…" with a
    // non-empty typed value, upsert it as a vocabulary entry FIRST so future
    // form opens see it in the dropdown; on POST failure, abort the save.
    const categoryDraft = categoryField.getValue();
    if (
      categoryField.isAddingNew() &&
      categoryDraft.length === 0
    ) {
      setError(
        'You picked "+ Add new…" — please type the new category name, or pick a different option.',
      );
      return;
    }

    setSaving(true);

    try {
      if (categoryField.isAddingNew() && categoryDraft.length > 0) {
        const created = await createVocabularyEntry(props.projectId, {
          vocabularyType: 'competition-category',
          value: categoryDraft,
          addedByWorkflow: 'competition-scraping',
        });
        categoryField.absorbNewEntry(created);
      }

      const row = await createCompetitorUrl(props.projectId, {
        platform: props.platform as never, // cast — runtime-validated by server
        url,
        ...(categoryDraft
          ? { competitionCategory: categoryDraft }
          : {}),
        ...(productField.input.value.trim()
          ? { productName: productField.input.value.trim() }
          : {}),
        ...(brandField.input.value.trim()
          ? { brandName: brandField.input.value.trim() }
          : {}),
        // P-6 — only send when checked; the schema-level default false
        // applies when omitted (mirrors the existing "send only when set"
        // pattern for the optional metadata fields).
        ...(sponsoredInput.checked ? { isSponsoredAd: true } : {}),
      });
      setSaving(false);
      handle.destroy();
      props.onSaved(row);
    } catch (err) {
      setSaving(false);
      if (err instanceof PlosApiError) {
        setError(`Save failed (HTTP ${err.status}): ${err.message}`);
      } else {
        const msg =
          err instanceof Error ? err.message : 'Unknown error';
        setError(`Save failed: ${msg}`);
      }
    }
  }

  form.addEventListener('submit', handleSave);
  cancelBtn.addEventListener('click', close);

  // Backdrop click closes — but ignore clicks INSIDE the form box itself.
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) close();
  });

  // Esc anywhere closes.
  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  document.addEventListener('keydown', onKeydown);

  document.body.appendChild(backdrop);

  // P-7 fix 2026-05-08-d: position form away from the triggering listing
  // when a triggerRect is provided. Form's `position: fixed` removes it
  // from the backdrop's flex flow, so the explicit left/top take over.
  const pos = computeFormPosition(props.triggerRect ?? null);
  if (pos) {
    form.style.position = 'fixed';
    form.style.left = `${pos.left}px`;
    form.style.top = `${pos.top}px`;
  }

  // Focus the URL input on open so the user can immediately edit if they want.
  setTimeout(() => urlField.input.focus(), 0);

  // 2026-05-15-d Slice #2.5 — async-load existing Competition Category
  // entries so the dropdown is populated by the time the user reaches that
  // field. The form is usable before this load completes (the select still
  // shows the placeholder + "+ Add new…" so the user can type a new
  // category immediately). On load failure, the field stays usable —
  // we just show a small inline note that the dropdown is unavailable.
  listVocabularyEntries(props.projectId, 'competition-category')
    .then((entries) => {
      categoryField.populateEntries(entries);
    })
    .catch((err) => {
      const message =
        err instanceof PlosApiError
          ? `${err.message} (HTTP ${err.status})`
          : err instanceof Error
            ? err.message
            : "Couldn't load existing categories";
      categoryField.setLoadError(
        `Could not load existing categories (${message}). You can still type a new one via "+ Add new…".`,
      );
    });

  const handle: UrlAddForm = {
    destroy() {
      document.removeEventListener('keydown', onKeydown);
      backdrop.remove();
      if (activeForm === handle) activeForm = null;
    },
  };

  activeForm = handle;
  return handle;
}

/** Closes any currently-open URL-add form. No-op if none is open. */
export function closeUrlAddForm(): void {
  if (activeForm !== null) {
    activeForm.destroy();
    activeForm = null;
  }
}
