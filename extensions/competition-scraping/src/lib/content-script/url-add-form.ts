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
} from './api-bridge.ts';
import type { CompetitorUrl } from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../platforms.ts';

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

  const urlField = makeField(
    'URL',
    'url',
    props.initialUrl,
    'https://...',
    true,
  );
  const categoryField = makeField(
    'Competition Category (optional)',
    'category',
    '',
    'e.g., device, topical product, supplement',
  );
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
    categoryField.input.disabled = saving;
    productField.input.disabled = saving;
    brandField.input.disabled = saving;
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

    setSaving(true);

    try {
      const row = await createCompetitorUrl(props.projectId, {
        platform: props.platform as never, // cast — runtime-validated by server
        url,
        ...(categoryField.input.value.trim()
          ? { competitionCategory: categoryField.input.value.trim() }
          : {}),
        ...(productField.input.value.trim()
          ? { productName: productField.input.value.trim() }
          : {}),
        ...(brandField.input.value.trim()
          ? { brandName: brandField.input.value.trim() }
          : {}),
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
