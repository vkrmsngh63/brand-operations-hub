// Image-capture overlay form. Opens when the user invokes the right-click
// context-menu item "Add to PLOS — Image" on an image inside a recognized
// platform page.
//
// Per COMPETITION_SCRAPING_DESIGN.md §A.7 Module 2 regular-image gesture:
//   - Image preview — <img src={srcUrl}> at thumbnail size, with a small
//     caption underneath showing dimensions + filename hint when the image
//     finishes loading. Failed-to-load image still allows the user to type
//     metadata + submit; the background's fetchImageBytes will surface its
//     own error path during Save (CDN-not-authorized, oversize, etc.).
//   - Saved URL — picker over the project's already-captured URLs for the
//     current platform; pre-selects the row matching the page URL when one
//     is recognized (reuses pickInitialUrl from captured-text-validation
//     so the canonicalize step matches the text-capture form's behavior).
//   - Image category — dropdown over the project's existing image-category
//     vocabulary entries; "+ Add new…" reveals an inline input so the user
//     can create a new category on the spot (POST /vocabulary upsert).
//   - Composition — optional textarea per §A.15 brief (describes what's IN
//     the image; future AI vision model can auto-fill).
//   - Embedded text — optional textarea per §A.15 brief (text appearing
//     INSIDE the image; future OCR / vision model can auto-fill).
//   - Tags — chip-list with Enter/comma to add; X-on-chip to remove
//     (identical to text-capture's tags chip).
//
// Save calls the api-bridge's submitImageCapture, which routes the
// end-to-end two-phase upload through the background service worker (see
// STACK_DECISIONS.md §3 for the per-phase rationale). On success the form
// closes; on failure the form stays open with an inline error banner.
//
// Director-picked Option A (regular-image-first scope) at session 5 start
// 2026-05-12-i; region-screenshot gesture deferred to session 6.

import {
  PlosApiError,
  createVocabularyEntry,
  listCompetitorUrls,
  listVocabularyEntries,
  submitImageCapture,
} from './api-bridge.ts';
import type { Platform } from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { ACCEPTED_IMAGE_MIME_TYPES } from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { getPlatformLabel } from '../platforms.ts';
import { getModuleByPlatform } from '../platform-modules/registry.ts';
import { pickInitialUrl } from '../captured-text-validation.ts';
import {
  normalizeTagsForImage,
  validateCapturedImageDraft,
  type CapturedImageValidationReason,
} from '../captured-image-validation.ts';

export interface ImageCaptureFormProps {
  /** Image URL the user right-clicked. Used both for the preview <img>
   * and routed back to the background's fetchImageBytes() during Save. */
  srcUrl: string;
  /** Page URL where the right-click happened. Used to pre-select the
   * saved-URL picker via pickInitialUrl (same shape as text-capture). */
  pageUrl: string;
  /** Currently selected Project from popup-state. */
  projectId: string;
  /** Best-effort project display name. Shown in the context block. */
  projectName: string | null;
  /** Currently selected Platform from popup-state. Filters the saved-URL
   * picker — image capture without a target URL for the page's platform
   * doesn't make sense. */
  platform: Platform;
  /** Callback invoked after a successful save. The orchestrator currently
   * has no special post-save behavior; this is informational. */
  onSaved(): void;
  /** Callback invoked when the user closes the form without saving. */
  onClose(): void;
}

export interface ImageCaptureForm {
  /** Removes the form from the DOM. Idempotent. */
  destroy(): void;
}

let activeForm: ImageCaptureForm | null = null;

// Sentinel option value for the image-category picker; picking it reveals
// the inline "new category" input. Same shape as text-capture's content-
// category sentinel — distinct constant so a future refactor that combines
// the two paths doesn't accidentally collide.
const ADD_NEW_IMAGE_CATEGORY_VALUE = '__plos_add_new_image_category__';

export function openImageCaptureForm(
  props: ImageCaptureFormProps,
): ImageCaptureForm {
  // Replace any existing image-capture form so we never stack backdrops.
  // Coexistence with the URL-add and text-capture forms is allowed
  // (independent singletons); the user can dismiss either with Esc.
  if (activeForm !== null) {
    activeForm.destroy();
    activeForm = null;
  }

  const backdrop = document.createElement('div');
  backdrop.className = 'plos-cs-form-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Add captured image');

  const form = document.createElement('form');
  form.className = 'plos-cs-form';
  form.noValidate = true;

  const title = document.createElement('h2');
  title.className = 'plos-cs-form-title';
  title.textContent = 'Add captured image to PLOS';
  form.appendChild(title);

  // Context block — Project + Platform, read-only. Same shape as the
  // text-capture form so workers see consistent chrome.
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

  // Loading status banner — visible while saved URLs + vocab fetch.
  const statusBanner = document.createElement('div');
  statusBanner.className = 'plos-cs-form-status';
  statusBanner.textContent = 'Loading your saved URLs and image categories…';
  form.appendChild(statusBanner);

  // ── Image preview ────────────────────────────────────────────────────
  // The <img> uses the host page's resolved srcUrl. The browser already
  // loaded this image for the page, so display from cache is instant.
  // Cross-origin display works without CORS (display is unrestricted; only
  // canvas readback would need CORS — which we don't need here since the
  // bytes are fetched separately by the background during Save).
  const previewWrap = document.createElement('div');
  previewWrap.className = 'plos-cs-form-image-preview-wrap';
  const previewImg = document.createElement('img');
  previewImg.className = 'plos-cs-form-image-preview';
  previewImg.alt = 'Preview of the image you right-clicked';
  previewImg.src = props.srcUrl;
  previewWrap.appendChild(previewImg);

  const previewMeta = document.createElement('div');
  previewMeta.className = 'plos-cs-form-image-meta';
  previewMeta.textContent = 'Loading preview…';
  previewWrap.appendChild(previewMeta);

  previewImg.addEventListener('load', () => {
    const naturalW = previewImg.naturalWidth;
    const naturalH = previewImg.naturalHeight;
    if (naturalW > 0 && naturalH > 0) {
      previewMeta.textContent = `${naturalW} × ${naturalH} pixels`;
    } else {
      previewMeta.textContent = '';
    }
  });
  previewImg.addEventListener('error', () => {
    previewMeta.className = 'plos-cs-form-image-meta-failed';
    previewMeta.textContent =
      "Couldn't preview the image — Save will still try the upload.";
  });
  form.appendChild(previewWrap);

  // ── Saved URL picker ─────────────────────────────────────────────────
  const urlFieldWrap = document.createElement('div');
  urlFieldWrap.className = 'plos-cs-form-field';
  const urlFieldLabel = document.createElement('label');
  urlFieldLabel.className = 'plos-cs-form-label';
  urlFieldLabel.htmlFor = 'plos-cs-image-url';
  urlFieldLabel.textContent = 'Attach to which saved URL?';
  const urlSelect = document.createElement('select');
  urlSelect.id = 'plos-cs-image-url';
  urlSelect.name = 'url';
  urlSelect.className = 'plos-cs-form-select';
  urlSelect.disabled = true;
  const placeholderUrlOpt = document.createElement('option');
  placeholderUrlOpt.value = '';
  placeholderUrlOpt.textContent = 'Loading…';
  urlSelect.appendChild(placeholderUrlOpt);
  urlFieldWrap.appendChild(urlFieldLabel);
  urlFieldWrap.appendChild(urlSelect);
  form.appendChild(urlFieldWrap);

  // ── Image-category picker with inline "+ Add new" ────────────────────
  const categoryFieldWrap = document.createElement('div');
  categoryFieldWrap.className = 'plos-cs-form-field';
  const categoryFieldLabel = document.createElement('label');
  categoryFieldLabel.className = 'plos-cs-form-label';
  categoryFieldLabel.htmlFor = 'plos-cs-image-category';
  categoryFieldLabel.textContent = 'Image category';
  const categorySelect = document.createElement('select');
  categorySelect.id = 'plos-cs-image-category';
  categorySelect.name = 'category';
  categorySelect.className = 'plos-cs-form-select';
  categorySelect.disabled = true;
  const placeholderCatOpt = document.createElement('option');
  placeholderCatOpt.value = '';
  placeholderCatOpt.textContent = 'Loading…';
  categorySelect.appendChild(placeholderCatOpt);
  categoryFieldWrap.appendChild(categoryFieldLabel);
  categoryFieldWrap.appendChild(categorySelect);
  const newCategoryWrap = document.createElement('div');
  newCategoryWrap.className = 'plos-cs-form-inline-add';
  newCategoryWrap.style.display = 'none';
  const newCategoryInput = document.createElement('input');
  newCategoryInput.type = 'text';
  newCategoryInput.className = 'plos-cs-form-input';
  newCategoryInput.placeholder = 'Type new image-category name';
  newCategoryWrap.appendChild(newCategoryInput);
  categoryFieldWrap.appendChild(newCategoryWrap);
  form.appendChild(categoryFieldWrap);

  // ── Composition textarea (optional) ──────────────────────────────────
  const compositionWrap = document.createElement('div');
  compositionWrap.className = 'plos-cs-form-field';
  const compositionLabel = document.createElement('label');
  compositionLabel.className = 'plos-cs-form-label';
  compositionLabel.htmlFor = 'plos-cs-image-composition';
  compositionLabel.textContent = 'Composition (optional)';
  const compositionArea = document.createElement('textarea');
  compositionArea.id = 'plos-cs-image-composition';
  compositionArea.name = 'composition';
  compositionArea.className = 'plos-cs-form-textarea';
  compositionArea.rows = 2;
  compositionArea.placeholder =
    "Describe what's in the image (e.g., 'wireless headphones on a white background').";
  compositionWrap.appendChild(compositionLabel);
  compositionWrap.appendChild(compositionArea);
  form.appendChild(compositionWrap);

  // ── Embedded text textarea (optional) ────────────────────────────────
  const embeddedWrap = document.createElement('div');
  embeddedWrap.className = 'plos-cs-form-field';
  const embeddedLabel = document.createElement('label');
  embeddedLabel.className = 'plos-cs-form-label';
  embeddedLabel.htmlFor = 'plos-cs-image-embedded-text';
  embeddedLabel.textContent = 'Embedded text (optional)';
  const embeddedArea = document.createElement('textarea');
  embeddedArea.id = 'plos-cs-image-embedded-text';
  embeddedArea.name = 'embeddedText';
  embeddedArea.className = 'plos-cs-form-textarea';
  embeddedArea.rows = 2;
  embeddedArea.placeholder =
    'Text that appears INSIDE the image (e.g., overlay headline, watermark).';
  embeddedWrap.appendChild(embeddedLabel);
  embeddedWrap.appendChild(embeddedArea);
  form.appendChild(embeddedWrap);

  // ── Tags chip-list ───────────────────────────────────────────────────
  const tagsFieldWrap = document.createElement('div');
  tagsFieldWrap.className = 'plos-cs-form-field';
  const tagsFieldLabel = document.createElement('label');
  tagsFieldLabel.className = 'plos-cs-form-label';
  tagsFieldLabel.htmlFor = 'plos-cs-image-tags-input';
  tagsFieldLabel.textContent = 'Tags (optional)';
  const tagsChipRow = document.createElement('div');
  tagsChipRow.className = 'plos-cs-chip-row';
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.id = 'plos-cs-image-tags-input';
  tagsInput.className = 'plos-cs-form-input';
  tagsInput.placeholder = 'Type a tag and press Enter';
  tagsFieldWrap.appendChild(tagsFieldLabel);
  tagsFieldWrap.appendChild(tagsChipRow);
  tagsFieldWrap.appendChild(tagsInput);
  form.appendChild(tagsFieldWrap);

  // ── Error banner ─────────────────────────────────────────────────────
  const errorBanner = document.createElement('div');
  errorBanner.className = 'plos-cs-form-error';
  errorBanner.style.display = 'none';
  form.appendChild(errorBanner);

  // ── Buttons ──────────────────────────────────────────────────────────
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
  saveBtn.disabled = true; // re-enabled when URL + category lists load
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  backdrop.appendChild(form);

  // ── Behavior wiring ──────────────────────────────────────────────────
  let tags: string[] = [];

  function renderChips(): void {
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
    const candidates = value.split(',');
    tags = normalizeTagsForImage([...tags, ...candidates]);
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
    if (tagsInput.value.trim().length > 0) {
      tryAddTagFromInput();
    }
  });

  // Category picker — toggle inline "add new" input.
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === ADD_NEW_IMAGE_CATEGORY_VALUE) {
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
    categorySelect.disabled = submitting;
    newCategoryInput.disabled = submitting;
    compositionArea.disabled = submitting;
    embeddedArea.disabled = submitting;
    tagsInput.disabled = submitting;
    saveBtn.textContent = submitting ? 'Saving…' : 'Save';
  }

  async function handleSave(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    let category = categorySelect.value;
    if (category === ADD_NEW_IMAGE_CATEGORY_VALUE) {
      category = newCategoryInput.value;
    }

    // We pass a placeholder mimeType + size into the validator that
    // doesn't gate on "image-required" (the bytes are fetched in the
    // background during Save — the form doesn't have them). The validator
    // gates on URL + category here; the background's fetchImageBytes()
    // enforces MIME + size cap with its own error path that surfaces here
    // via the PlosApiError catch below.
    const validation = validateCapturedImageDraft({
      competitorUrlId: urlSelect.value,
      // Placeholder values — the background re-derives mimeType + size
      // from the actual fetched bytes; the validator's MIME + size checks
      // are defensive only.
      mimeType: 'image/jpeg',
      fileSize: 1,
      sourceType: 'regular',
      imageCategory: category,
      composition: compositionArea.value,
      embeddedText: embeddedArea.value,
      tags,
    });
    if (!validation.ok) {
      setError(messageForReason(validation.reason));
      return;
    }

    setSubmitting(true);

    try {
      // Upsert the vocabulary entry first if the user picked "+ Add new"
      // so subsequent captures see it in the picker. Server upsert
      // semantics: duplicate name returns the existing row.
      if (categorySelect.value === ADD_NEW_IMAGE_CATEGORY_VALUE) {
        await createVocabularyEntry(props.projectId, {
          vocabularyType: 'image-category',
          value: validation.payload.imageCategory,
        });
      }

      await submitImageCapture({
        projectId: props.projectId,
        urlId: urlSelect.value,
        srcUrl: props.srcUrl,
        request: {
          clientId: validation.payload.clientId,
          // mimeType + sourceType echo the validator's defaults; the
          // background overrides mimeType with the response's
          // Content-Type before sending Phase 1 to the server, so the
          // values we pass here are not authoritative.
          mimeType: validation.payload.mimeType,
          sourceType: validation.payload.sourceType,
          imageCategory: validation.payload.imageCategory,
        },
        finalize: {
          imageCategory: validation.payload.imageCategory,
          composition: validation.payload.composition ?? undefined,
          embeddedText: validation.payload.embeddedText ?? undefined,
          tags: validation.payload.tags,
        },
      });
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
  setTimeout(() => {
    // Focus the URL picker first — it's the only required field the user
    // touches before Save (image bytes are auto-fetched; category is
    // picked from the dropdown).
    urlSelect.focus();
  }, 0);

  // ── Fetch saved URLs + image-category vocab in parallel ──────────────
  void (async () => {
    try {
      const [rows, vocab] = await Promise.all([
        listCompetitorUrls(props.projectId, props.platform),
        listVocabularyEntries(props.projectId, 'image-category'),
      ]);

      // URL picker
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
          opt.textContent =
            row.productName?.trim() ||
            (row.url.length > 80 ? row.url.slice(0, 77) + '…' : row.url);
          urlSelect.appendChild(opt);
        }
        // Reuse the P-15-fixed canonicalize-before-normalize path so a
        // slug-variant page URL matches its saved `/dp/{ASIN}` row.
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

      // Image-category picker
      categorySelect.innerHTML = '';
      const placeholderCat = document.createElement('option');
      placeholderCat.value = '';
      placeholderCat.textContent = 'Pick an image category…';
      categorySelect.appendChild(placeholderCat);
      for (const entry of vocab) {
        const opt = document.createElement('option');
        opt.value = entry.value;
        opt.textContent = entry.value;
        categorySelect.appendChild(opt);
      }
      const addNewOpt = document.createElement('option');
      addNewOpt.value = ADD_NEW_IMAGE_CATEGORY_VALUE;
      addNewOpt.textContent = '+ Add new…';
      categorySelect.appendChild(addNewOpt);
      categorySelect.disabled = false;

      statusBanner.style.display = 'none';
      if (rows.length > 0) saveBtn.disabled = false;
    } catch (err) {
      const message =
        err instanceof PlosApiError
          ? `Couldn’t load your saved URLs or image categories (${err.status || 'network'}): ${err.message}`
          : 'Couldn’t load your saved URLs or image categories.';
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

  const handle: ImageCaptureForm = {
    destroy() {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      document.removeEventListener('keydown', onKeyDown);
      if (activeForm === handle) activeForm = null;
    },
  };
  activeForm = handle;
  return handle;
}

/**
 * Maps a validation reason to plain-language form-error copy. The MIME +
 * size + image-required reasons are surfaced by the background's
 * fetchImageBytes() error path in practice (the validator passes
 * placeholders during Save); the strings still need to exist for
 * defensive callers + future region-screenshot path where the form
 * supplies real bytes.
 */
function messageForReason(reason: CapturedImageValidationReason): string {
  switch (reason) {
    case 'url-required':
      return 'Pick the saved URL this image belongs to.';
    case 'image-required':
      return 'No image to upload — close this form and right-click an image again.';
    case 'image-mime-rejected':
      return `Unsupported image type. PLOS accepts ${ACCEPTED_IMAGE_MIME_TYPES.join(', ')}.`;
    case 'image-too-large':
      return 'Image exceeds the 5 MB cap. Try a smaller version of the same image.';
    case 'source-type-invalid':
      return 'Internal error — unrecognized image source.';
    case 'category-required':
      return 'Pick an image category, or add a new one via "+ Add new…".';
  }
}
