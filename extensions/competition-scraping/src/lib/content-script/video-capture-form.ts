// Video-capture overlay form (P-27 Build #3, 2026-05-22). Mirrors the
// image-capture-form.ts shape, with two branches that mirror the on-wire
// CapturedVideo sourceType discriminator per CAPTURED_VIDEOS_DESIGN.md
// §A.7:
//
//   - direct  — the user right-clicked an inline <video> element (or its
//     overlay-wrapper). The form runs a canvas frame-grab on Save to
//     produce a thumbnail JPEG; the background uploads both the bytes
//     and the thumbnail via the §A.9 two-signed-URL Phase 1.
//
//   - embed   — the user right-clicked a recognized embed iframe
//     (YouTube / Vimeo / Wistia / etc.). The form only carries the URL +
//     platform name; the background skips Phase 1 + 2 and finalizes with
//     sourceType='EMBED'.
//
// Single form for both branches per design doc §A.7 single-table-per-
// media-type principle + Build #3's drift-check approval: form UX is
// symmetric (same saved-URL picker + category + composition + embedded
// text + tags + Save button); the branch only changes what runs on Save.
//
// Thumbnail-extraction notes (direct branch only — §A.9 + §A.12):
//   - Uses canvas.drawImage(<video>) at the video's current frame +
//     canvas.toDataURL('image/jpeg', 0.85). Requires the video's
//     readyState >= 2 (HAVE_CURRENT_DATA); if the video is mid-load, the
//     form retries up to 3× at 200 ms intervals before giving up.
//   - Cross-origin canvas-taint failure (SecurityError on toDataURL) is
//     treated as the §A.12 NULL-thumbnail fallback — save proceeds; the
//     row stores NULL thumbnailStoragePath; the renderer falls back to a
//     generic ▶️ icon.
//   - Frame-grab failure NEVER blocks save — per §A.12 "save never fails
//     because of thumbnail issues."

import {
  PlosApiError,
  createVocabularyEntry,
  listCompetitorUrls,
  listVocabularyEntries,
  submitVideoCapture,
} from './api-bridge.ts';
import type {
  AcceptedVideoMimeType,
  Platform,
} from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { isAcceptedVideoMimeType } from '../../../../../src/lib/shared-types/competition-scraping.ts';
import { extractFirstFrameThumbnail } from '../screen-recording/thumbnail-extraction.ts';
import {
  normalizeBlobMime,
  uploadScreenRecording,
} from '../screen-recording/recording-bytes-upload.ts';
import { getPlatformLabel } from '../platforms.ts';
import { getModuleByPlatform } from '../platform-modules/registry.ts';
import { pickInitialUrl } from '../captured-text-validation.ts';
import { buildSavedUrlOptionLabel } from '../saved-url-option-label.ts';
import {
  validateCapturedVideoDraft,
  type CapturedVideoValidationReason,
} from '../captured-video-validation.ts';
import { FORM_CHROME_CSS } from './styles.ts';

/** Direct-branch props — user right-clicked a <video> (or its wrapper). */
export interface VideoCaptureFormDirectProps {
  kind: 'direct';
  /** The <video>.currentSrc (or src fallback). Used both as the preview
   * source AND as the page-host URL the background fetches video bytes
   * from at Save time. */
  src: string;
  /** Pre-flight MIME hint from a <source type="..."> attribute, when the
   * page provided one. Null when the page didn't. The background's
   * fetchVideoBytes() resolves authoritatively from Content-Type. */
  mimeTypeHint: string | null;
  /** The live <video> DOM node on the host page. Used for the canvas
   * frame-grab (canvas.drawImage requires the live element, not just a
   * URL). Also read for dimensions + duration. */
  element: HTMLVideoElement;
  pageUrl: string;
  projectId: string;
  projectName: string | null;
  platform: Platform;
  onSaved(): void;
  onClose(): void;
}

/** Screen-recording branch props — user invoked "Record video for PLOS"
 *  via right-click, drew a region, recorded for ≤ 3 min, clicked Stop. The
 *  RecordController's onStopped result fills these props. */
export interface VideoCaptureFormScreenRecordingProps {
  kind: 'screen-recording';
  /** The MediaRecorder webm Blob — bytes go directly to Supabase via the
   *  smart-client orchestrator (no Chrome IPC for the critical path). */
  blob: Blob;
  /** Full MIME from MediaRecorder (e.g. 'video/webm;codecs=vp9,opus'). The
   *  smart-client orchestrator normalizes this to the base 'video/webm'
   *  for the server-side validator. */
  mimeType: string;
  /** Wall-clock duration from start() to stop(). */
  durationSeconds: number;
  /** Validated + normalized recording region in viewport coords. */
  width: number;
  height: number;
  /** Page URL where the user invoked recording — lands on the row's
   *  originalSrcUrl per §C.16 (recordings have no fetchable URL). */
  pageUrl: string;
  projectId: string;
  projectName: string | null;
  platform: Platform;
  onSaved(): void;
  onClose(): void;
}

/** Embed-branch props — user right-clicked a recognized iframe. */
export interface VideoCaptureFormEmbedProps {
  kind: 'embed';
  /** The iframe.src — YouTube/Vimeo/etc. URL. Goes onto the row's
   * originalSrcUrl + is also used to render the embed-URL preview. */
  src: string;
  /** Short embed-platform name from detectEmbedPlatform (e.g. 'youtube',
   * 'vimeo', 'wistia'). Surfaced in the form's source-kind banner so the
   * user sees a confirmation of what they're saving. Distinct from the
   * W#2 `platform` field below — `embedPlatform` describes the video host
   * (YouTube/Vimeo/etc.), `platform` describes the competitor-site
   * platform (amazon/ebay/etc.). */
  embedPlatform: string;
  pageUrl: string;
  projectId: string;
  projectName: string | null;
  /** The W#2 platform (amazon / ebay / etc.) — same field name + meaning
   * as the direct branch's `platform`. */
  platform: Platform;
  onSaved(): void;
  onClose(): void;
}

// Single tagged-union props type the orchestrator passes in. Branches on
// the helper's result kind. Both branches share `platform: Platform` (W#2
// site platform) at the top level; the embed branch additionally carries
// `embedPlatform: string` (video-host platform name) which is form-display
// only.
export type VideoCaptureFormProps =
  | VideoCaptureFormDirectProps
  | VideoCaptureFormScreenRecordingProps
  | VideoCaptureFormEmbedProps;

export interface VideoCaptureForm {
  /** Removes the form from the DOM. Idempotent. */
  destroy(): void;
}

let activeForm: VideoCaptureForm | null = null;

// Sentinel option value for the video-category picker — same pattern as
// the image-category sentinel in image-capture-form.ts.
const ADD_NEW_VIDEO_CATEGORY_VALUE = '__plos_add_new_video_category__';

// Canvas frame-grab timing constants.
const FRAME_GRAB_RETRY_INTERVAL_MS = 200;
const FRAME_GRAB_MAX_RETRIES = 3;
const THUMBNAIL_JPEG_QUALITY = 0.85;

export function openVideoCaptureForm(
  props: VideoCaptureFormProps,
): VideoCaptureForm {
  if (activeForm !== null) {
    activeForm.destroy();
    activeForm = null;
  }

  const w2Platform: Platform = props.platform;

  // P-47 (2026-05-24-d) — Shadow DOM mount. The form lives inside an open
  // shadow root attached to a fixed-positioned host <div> in document.body
  // rather than mounting the backdrop directly into document.body. Events
  // fired inside the shadow root do not bubble to page-level handlers by
  // default, so the per-input event-isolation band-aid that previously lived
  // mid-file (P-45 Build #2 2026-05-22-i) is no longer needed — the page
  // can't reach the form's inputs to steal focus or swallow keystrokes.
  // The host's z-index (999998) keeps it above page content; the backdrop's
  // and form's internal z-indexes (999998 / 999999) still apply within the
  // shadow root and remain consistent with the other content-script forms
  // (image / text / url-add) that still mount to document.body and consume
  // these rules from CONTENT_SCRIPT_CSS in styles.ts.
  const host = document.createElement('div');
  host.setAttribute('data-plos-cs-host', 'video-capture-form');
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.zIndex = '999998';
  const shadow = host.attachShadow({ mode: 'open' });
  const shadowStyle = document.createElement('style');
  shadowStyle.textContent = FORM_CHROME_CSS;
  shadow.appendChild(shadowStyle);

  const backdrop = document.createElement('div');
  backdrop.className = 'plos-cs-form-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Add captured video');

  const form = document.createElement('form');
  form.className = 'plos-cs-form';
  form.noValidate = true;

  const title = document.createElement('h2');
  title.className = 'plos-cs-form-title';
  title.textContent = 'Add captured video to PLOS';
  form.appendChild(title);

  // Context block — Project + Platform (read-only).
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
  platformStrong.textContent = getPlatformLabel(w2Platform) ?? w2Platform;
  platformLine.appendChild(platformLabel);
  platformLine.appendChild(platformStrong);
  context.appendChild(platformLine);
  form.appendChild(context);

  // ── Source-kind banner ───────────────────────────────────────────────
  // Direct: "Direct video — will upload bytes + thumbnail."
  // Embed:  "Recognized as YouTube — will store the share URL only."
  const sourceBanner = document.createElement('div');
  sourceBanner.className = 'plos-cs-form-status';
  if (props.kind === 'direct') {
    sourceBanner.textContent =
      'Direct video — will upload the video file plus a thumbnail frame.';
  } else if (props.kind === 'screen-recording') {
    const sizeMb = (props.blob.size / (1024 * 1024)).toFixed(1);
    const durSec = Math.round(props.durationSeconds);
    sourceBanner.textContent = `Screen recording (${String(durSec)}s, ${sizeMb} MB) — will upload the recording plus a first-frame thumbnail.`;
  } else {
    const human =
      props.embedPlatform.charAt(0).toUpperCase() +
      props.embedPlatform.slice(1);
    sourceBanner.textContent = `Recognized as ${human} — will save the embed link only.`;
  }
  form.appendChild(sourceBanner);

  // ── Loading status banner — visible while saved URLs + vocab fetch ──
  const statusBanner = document.createElement('div');
  statusBanner.className = 'plos-cs-form-status';
  statusBanner.textContent = 'Loading your saved URLs and video categories…';
  form.appendChild(statusBanner);

  // ── Preview area ─────────────────────────────────────────────────────
  // Direct: a small <video> clone (no controls; just a poster-frame
  //   preview so the user sees what they're saving without re-streaming
  //   the whole video). For thumbnail extraction we use the LIVE element
  //   passed in via props (not this clone — the clone may not load fast
  //   enough on Save).
  // Embed:  show the URL + platform name as text; no iframe (heavy +
  //   slow + a YouTube embed in a form backdrop is jarring).
  const previewWrap = document.createElement('div');
  previewWrap.className = 'plos-cs-form-image-preview-wrap';

  if (props.kind === 'direct') {
    const previewVideo = document.createElement('video');
    previewVideo.className = 'plos-cs-form-image-preview';
    previewVideo.src = props.src;
    previewVideo.muted = true;
    previewVideo.preload = 'metadata';
    previewVideo.style.maxHeight = '160px';
    // Build #8 (2026-05-23): crossOrigin='anonymous' lets the canvas frame-
    // grab on Save run un-tainted whenever the CDN sends CORS-friendly
    // headers (most do for videos served at user-visible product pages).
    // Without this attribute the canvas read on Save throws SecurityError
    // even when the CDN COULD have permitted it, so Build #7's Bug #10 +
    // #14b "thumbnail does NOT render" symptom is partially driven by the
    // form preview path silently picking the no-CORS load mode.
    previewVideo.crossOrigin = 'anonymous';
    previewWrap.appendChild(previewVideo);

    const previewMeta = document.createElement('div');
    previewMeta.className = 'plos-cs-form-image-meta';
    previewMeta.textContent = 'Loading preview…';
    previewWrap.appendChild(previewMeta);

    // Build #8 (2026-05-23): visible-state tracking so we can swap in a
    // bold placeholder when the load fails (or stalls indefinitely on
    // CORS-locked CDNs that swallow the `error` event). Bug #10 + #14b
    // surfaced as "form opens but the in-form video preview thumbnail
    // does NOT render" — the prior code only changed a small text line
    // beneath the empty <video>, which the director didn't register as
    // an acknowledgment of the preview failure.
    let resolved = false;

    function showPreviewUnavailable(): void {
      if (resolved) return;
      resolved = true;
      previewVideo.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'plos-cs-form-video-preview-fallback';
      Object.assign(placeholder.style, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '120px',
        background: '#f3f4f6',
        border: '1px dashed #9ca3af',
        borderRadius: '6px',
        color: '#374151',
        fontSize: '13px',
        fontWeight: '500',
        textAlign: 'center',
        padding: '0 16px',
      } as Partial<CSSStyleDeclaration>);
      placeholder.textContent =
        '▶ Video preview unavailable — Save will still try to capture the file.';
      previewWrap.insertBefore(placeholder, previewVideo);
      previewMeta.className = 'plos-cs-form-image-meta-failed';
      previewMeta.textContent =
        "Couldn't preview the video — Save will still try the upload.";
    }

    previewVideo.addEventListener('loadedmetadata', () => {
      resolved = true;
      const w = previewVideo.videoWidth;
      const h = previewVideo.videoHeight;
      const dur = previewVideo.duration;
      const parts: string[] = [];
      if (w > 0 && h > 0) parts.push(`${w} × ${h} pixels`);
      if (Number.isFinite(dur) && dur > 0) {
        const mins = Math.floor(dur / 60);
        const secs = Math.floor(dur % 60);
        parts.push(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
      previewMeta.textContent =
        parts.length > 0 ? parts.join(' · ') : '(no metadata)';
    });
    previewVideo.addEventListener('error', () => {
      showPreviewUnavailable();
    });
    // Build #8 timeout safety net: some CORS-locked CDNs neither fire
    // `loadedmetadata` nor `error` for cross-origin <video> loads — the
    // request just hangs. A 5s timeout switches to the placeholder so the
    // form's preview area never looks indefinitely empty.
    setTimeout(() => {
      if (!resolved && previewVideo.readyState < 1) {
        showPreviewUnavailable();
      }
    }, 5000);
  } else if (props.kind === 'screen-recording') {
    // Preview the recording inline with native controls so the user can
    // confirm what they're saving + scrub through if needed. Blob is
    // already in-memory; createObjectURL is instant. URL is revoked on
    // form destroy.
    const previewVideo = document.createElement('video');
    previewVideo.className = 'plos-cs-form-image-preview';
    previewVideo.controls = true;
    previewVideo.muted = true;
    previewVideo.style.maxHeight = '200px';
    previewVideo.style.maxWidth = '100%';
    const blobUrl = URL.createObjectURL(props.blob);
    previewVideo.src = blobUrl;
    // Stash the URL on the element so the form destroy handler can revoke
    // it (avoids a small leak — Chrome eventually GCs but we shouldn't
    // rely on that).
    (previewVideo as unknown as { _plosBlobUrl: string })._plosBlobUrl =
      blobUrl;
    previewWrap.appendChild(previewVideo);

    const previewMeta = document.createElement('div');
    previewMeta.className = 'plos-cs-form-image-meta';
    const durSec = Math.round(props.durationSeconds);
    previewMeta.textContent = `${String(props.width)} × ${String(props.height)} pixels · ${String(durSec)}s`;
    previewWrap.appendChild(previewMeta);
  } else {
    const embedInfo = document.createElement('div');
    embedInfo.className = 'plos-cs-form-image-meta';
    embedInfo.textContent = props.src;
    previewWrap.appendChild(embedInfo);
  }
  form.appendChild(previewWrap);

  // ── Saved URL picker ─────────────────────────────────────────────────
  const urlFieldWrap = document.createElement('div');
  urlFieldWrap.className = 'plos-cs-form-field';
  const urlFieldLabel = document.createElement('label');
  urlFieldLabel.className = 'plos-cs-form-label';
  urlFieldLabel.htmlFor = 'plos-cs-video-url';
  urlFieldLabel.textContent = 'Attach to which saved URL?';
  const urlSelect = document.createElement('select');
  urlSelect.id = 'plos-cs-video-url';
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

  // ── Video-category picker with inline "+ Add new" ────────────────────
  const categoryFieldWrap = document.createElement('div');
  categoryFieldWrap.className = 'plos-cs-form-field';
  const categoryFieldLabel = document.createElement('label');
  categoryFieldLabel.className = 'plos-cs-form-label';
  categoryFieldLabel.htmlFor = 'plos-cs-video-category';
  categoryFieldLabel.textContent = 'Video category';
  const categorySelect = document.createElement('select');
  categorySelect.id = 'plos-cs-video-category';
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
  newCategoryInput.placeholder = 'Type new video-category name';
  newCategoryWrap.appendChild(newCategoryInput);
  categoryFieldWrap.appendChild(newCategoryWrap);
  form.appendChild(categoryFieldWrap);

  // ── Composition textarea (optional) ──────────────────────────────────
  const compositionWrap = document.createElement('div');
  compositionWrap.className = 'plos-cs-form-field';
  const compositionLabel = document.createElement('label');
  compositionLabel.className = 'plos-cs-form-label';
  compositionLabel.htmlFor = 'plos-cs-video-composition';
  compositionLabel.textContent = 'Composition (optional)';
  const compositionArea = document.createElement('textarea');
  compositionArea.id = 'plos-cs-video-composition';
  compositionArea.name = 'composition';
  compositionArea.className = 'plos-cs-form-textarea';
  compositionArea.rows = 2;
  compositionArea.placeholder =
    "Describe what's in the video (e.g., '30-second product demo showing wireless setup').";
  compositionWrap.appendChild(compositionLabel);
  compositionWrap.appendChild(compositionArea);
  form.appendChild(compositionWrap);

  // ── Embedded text textarea (optional) ────────────────────────────────
  const embeddedWrap = document.createElement('div');
  embeddedWrap.className = 'plos-cs-form-field';
  const embeddedLabel = document.createElement('label');
  embeddedLabel.className = 'plos-cs-form-label';
  embeddedLabel.htmlFor = 'plos-cs-video-embedded-text';
  embeddedLabel.textContent = 'Embedded text (optional)';
  const embeddedArea = document.createElement('textarea');
  embeddedArea.id = 'plos-cs-video-embedded-text';
  embeddedArea.name = 'embeddedText';
  embeddedArea.className = 'plos-cs-form-textarea';
  embeddedArea.rows = 2;
  embeddedArea.placeholder =
    'Text that appears IN the video (overlay headlines, captions).';
  embeddedWrap.appendChild(embeddedLabel);
  embeddedWrap.appendChild(embeddedArea);
  form.appendChild(embeddedWrap);

  // ── Tags chip-list ───────────────────────────────────────────────────
  const tagsFieldWrap = document.createElement('div');
  tagsFieldWrap.className = 'plos-cs-form-field';
  const tagsFieldLabel = document.createElement('label');
  tagsFieldLabel.className = 'plos-cs-form-label';
  tagsFieldLabel.htmlFor = 'plos-cs-video-tags-input';
  tagsFieldLabel.textContent = 'Tags (optional)';
  const tagsChipRow = document.createElement('div');
  tagsChipRow.className = 'plos-cs-chip-row';
  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.id = 'plos-cs-video-tags-input';
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
  saveBtn.disabled = true;
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
    const merged: string[] = [];
    const seen = new Set<string>();
    for (const raw of [...tags, ...candidates]) {
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(trimmed);
    }
    tags = merged;
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

  // P-47 (2026-05-24-d) — the per-input event-isolation band-aid that
  // previously lived here (P-45 Build #2 2026-05-22-i, 20 events × 4 inputs =
  // 80 listeners on each form open) is no longer needed: the form now mounts
  // inside an open Shadow DOM root (see the host+shadow setup at the bottom
  // of openVideoCaptureForm). Events fired inside the shadow root don't
  // surface to page-level handlers by default, so page-side mousedown→blur,
  // focusin→someOtherEl.focus(), and keystroke-stealing patterns can no
  // longer reach the form's inputs.
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === ADD_NEW_VIDEO_CATEGORY_VALUE) {
      newCategoryWrap.style.display = 'block';
      focusNewCategoryInput();
    } else {
      newCategoryWrap.style.display = 'none';
      newCategoryInput.value = '';
    }
  });
  function focusNewCategoryInput(): void {
    // Two-frame defer: first frame lets the browser apply the display:block
    // reflow; second frame is when focus reliably lands. P-47 (2026-05-24-d):
    // activeElement reads must go through `shadow.activeElement` rather than
    // `document.activeElement` since the form's inputs live inside the shadow
    // root — document.activeElement returns the host element regardless of
    // which descendant inside the shadow is actually focused.
    const tryFocus = (): void => {
      try {
        const active = shadow.activeElement;
        if (active && active !== newCategoryInput) {
          (active as HTMLElement).blur?.();
        }
      } catch {
        // Defensive — some hosts disallow blur(); ignore.
      }
      newCategoryInput.focus({ preventScroll: true });
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(tryFocus);
    });
    setTimeout(() => {
      if (
        newCategoryWrap.style.display !== 'none' &&
        shadow.activeElement !== newCategoryInput
      ) {
        tryFocus();
      }
    }, 50);
  }

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
    if (category === ADD_NEW_VIDEO_CATEGORY_VALUE) {
      category = newCategoryInput.value;
    }

    // Direct branch sees an estimated fileSize via the <video> resource;
    // we DON'T actually read the bytes here (the background does that
    // after the user confirms). The validator accepts a placeholder size
    // when the form passes 1 (signals "we'll resolve at fetch time"); the
    // background's fetchVideoBytes enforces the real 100 MB cap.
    //
    // Screen-recording branch has the bytes in-hand (Blob from
    // MediaRecorder); the validator sees the real size + the normalized
    // MIME so it can short-circuit oversize recordings before any upload.
    //
    // Embed branch passes 0 (no bytes; validator only checks URL pattern).
    let draftFileSize: number;
    let draftMimeType: string;
    let draftOriginalSrcUrl: string;
    let draftSourceType: 'DIRECT_BYTES' | 'SCREEN_RECORDING' | 'EMBED';
    if (props.kind === 'direct') {
      draftFileSize = 1;
      draftMimeType = props.mimeTypeHint ?? '';
      draftOriginalSrcUrl = props.src;
      draftSourceType = 'DIRECT_BYTES';
    } else if (props.kind === 'screen-recording') {
      draftFileSize = props.blob.size;
      draftMimeType = normalizeBlobMime(props.blob.type || props.mimeType);
      draftOriginalSrcUrl = props.pageUrl;
      draftSourceType = 'SCREEN_RECORDING';
    } else {
      draftFileSize = 0;
      draftMimeType = '';
      draftOriginalSrcUrl = props.src;
      draftSourceType = 'EMBED';
    }

    const validation = validateCapturedVideoDraft({
      competitorUrlId: urlSelect.value,
      sourceType: draftSourceType,
      originalSrcUrl: draftOriginalSrcUrl,
      mimeType: draftMimeType,
      fileSize: draftFileSize,
      videoCategory: category,
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
      if (categorySelect.value === ADD_NEW_VIDEO_CATEGORY_VALUE) {
        await createVocabularyEntry(props.projectId, {
          vocabularyType: 'video-category',
          value: validation.payload.videoCategory,
        });
      }

      if (props.kind === 'direct') {
        // Best-effort thumbnail capture + metadata read from the live
        // <video> element. Both are degradable per §A.12 — save proceeds
        // with NULL thumbnail / NULL metadata if the live element doesn't
        // cooperate.
        const thumb = await captureThumbnailJpegBestEffort(props.element);
        const meta = readVideoMetadataBestEffort(props.element);
        const mimeHint: AcceptedVideoMimeType | null = isAcceptedVideoMimeType(
          props.mimeTypeHint,
        )
          ? props.mimeTypeHint
          : null;

        await submitVideoCapture({
          projectId: props.projectId,
          urlId: urlSelect.value,
          sourceType: 'DIRECT_BYTES',
          srcUrl: props.src,
          thumbnailDataUrl: thumb,
          mimeTypeHint: mimeHint,
          clientId: validation.payload.clientId,
          videoCategory: validation.payload.videoCategory,
          composition: validation.payload.composition,
          embeddedText: validation.payload.embeddedText,
          tags: validation.payload.tags,
          durationSeconds: meta.duration,
          width: meta.width,
          height: meta.height,
        });
      } else if (props.kind === 'screen-recording') {
        // Best-effort thumbnail extraction from the webm Blob. NULL is
        // acceptable per §A.12 — the renderer falls back to the browser's
        // native <video> play icon when thumbnailStoragePath is NULL.
        const thumbnailBlob = await extractFirstFrameThumbnail({
          blob: props.blob,
          width: props.width,
          height: props.height,
        });

        await uploadScreenRecording({
          projectId: props.projectId,
          urlId: urlSelect.value,
          blob: props.blob,
          thumbnailBlob,
          pageUrl: props.pageUrl,
          durationSeconds: props.durationSeconds,
          width: props.width,
          height: props.height,
          videoCategory: validation.payload.videoCategory,
          composition: validation.payload.composition,
          embeddedText: validation.payload.embeddedText,
          tags: validation.payload.tags,
        });
      } else {
        await submitVideoCapture({
          projectId: props.projectId,
          urlId: urlSelect.value,
          sourceType: 'EMBED',
          originalSrcUrl: props.src,
          clientId: validation.payload.clientId,
          videoCategory: validation.payload.videoCategory,
          composition: validation.payload.composition,
          embeddedText: validation.payload.embeddedText,
          tags: validation.payload.tags,
        });
      }
      showSavedToast();
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
  // Escape-to-close stays on the document so it fires regardless of where
  // focus is (page or shadow); keydown events from inside the shadow root
  // still compose up through the host into the document tree, so the
  // listener catches them in both cases.
  document.addEventListener('keydown', onKeyDown);

  shadow.appendChild(backdrop);
  document.body.appendChild(host);
  setTimeout(() => {
    urlSelect.focus();
  }, 0);

  // ── Fetch saved URLs + video-category vocab in parallel ──────────────
  void (async () => {
    try {
      const [rows, vocab] = await Promise.all([
        listCompetitorUrls(props.projectId, w2Platform),
        listVocabularyEntries(props.projectId, 'video-category'),
      ]);

      urlSelect.innerHTML = '';
      if (rows.length === 0) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = `No saved ${getPlatformLabel(w2Platform) ?? w2Platform} URLs yet — capture one via "+ Add" first`;
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
          opt.textContent = buildSavedUrlOptionLabel(row);
          urlSelect.appendChild(opt);
        }
        const platformModule = getModuleByPlatform(w2Platform);
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

      categorySelect.innerHTML = '';
      const placeholderCat = document.createElement('option');
      placeholderCat.value = '';
      placeholderCat.textContent = 'Pick a video category…';
      categorySelect.appendChild(placeholderCat);
      for (const entry of vocab) {
        const opt = document.createElement('option');
        opt.value = entry.value;
        opt.textContent = entry.value;
        categorySelect.appendChild(opt);
      }
      const addNewOpt = document.createElement('option');
      addNewOpt.value = ADD_NEW_VIDEO_CATEGORY_VALUE;
      addNewOpt.textContent = '+ Add new…';
      categorySelect.appendChild(addNewOpt);
      categorySelect.disabled = false;

      statusBanner.style.display = 'none';
      if (rows.length > 0) saveBtn.disabled = false;
    } catch (err) {
      const message =
        err instanceof PlosApiError
          ? `Couldn’t load your saved URLs or video categories (${err.status || 'network'}): ${err.message}`
          : 'Couldn’t load your saved URLs or video categories.';
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

  const handle: VideoCaptureForm = {
    destroy() {
      // Revoke any blob: URLs we minted for the screen-recording preview
      // so they're not held by the browser after the form closes.
      const previewVideos = previewWrap.querySelectorAll('video');
      previewVideos.forEach((v) => {
        const blobUrl = (v as unknown as { _plosBlobUrl?: string })._plosBlobUrl;
        if (typeof blobUrl === 'string' && blobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrl);
        }
      });
      if (host.parentNode) host.parentNode.removeChild(host);
      document.removeEventListener('keydown', onKeyDown);
      if (activeForm === handle) activeForm = null;
    },
  };
  activeForm = handle;
  return handle;
}

/**
 * Best-effort canvas frame-grab. Tries up to FRAME_GRAB_MAX_RETRIES times
 * (200 ms apart) for the video's readyState to reach HAVE_CURRENT_DATA (2)
 * before giving up. Returns a JPEG data URL on success, OR null on:
 *   - readyState never reaches 2 within the retry budget
 *   - canvas-taint SecurityError on toDataURL (cross-origin video without
 *     `crossorigin` attribute)
 *   - any unexpected exception during drawImage
 *
 * Null is treated as the §A.12 fallback: save proceeds; the row stores
 * NULL thumbnailStoragePath; the renderer shows a generic ▶️ icon.
 */
async function captureThumbnailJpegBestEffort(
  video: HTMLVideoElement,
): Promise<string | null> {
  for (let attempt = 0; attempt < FRAME_GRAB_MAX_RETRIES; attempt++) {
    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // toDataURL throws SecurityError when the canvas is tainted by a
        // cross-origin video without the `crossorigin` attribute.
        return canvas.toDataURL('image/jpeg', THUMBNAIL_JPEG_QUALITY);
      } catch {
        return null;
      }
    }
    await sleep(FRAME_GRAB_RETRY_INTERVAL_MS);
  }
  return null;
}

interface VideoMetadata {
  duration: number | null;
  width: number | null;
  height: number | null;
}

function readVideoMetadataBestEffort(video: HTMLVideoElement): VideoMetadata {
  const duration =
    Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : null;
  const width = video.videoWidth > 0 ? video.videoWidth : null;
  const height = video.videoHeight > 0 ? video.videoHeight : null;
  return { duration, width, height };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Minimal "Saved!" toast. Appended to document.body (not the form's
 * backdrop — the backdrop tears down on save success). Auto-dismisses
 * after 1.6 s. A polished saved-video on-page indicator overlay arrives
 * at a later Build session per design doc §A.2 row #6.
 */
function showSavedToast(): void {
  const toast = document.createElement('div');
  toast.textContent = 'Saved!';
  toast.setAttribute('role', 'status');
  toast.style.position = 'fixed';
  toast.style.right = '16px';
  toast.style.bottom = '16px';
  toast.style.zIndex = '2147483647';
  toast.style.padding = '10px 14px';
  toast.style.background = '#16a34a';
  toast.style.color = '#fff';
  toast.style.borderRadius = '6px';
  toast.style.font = '500 13px/1.4 system-ui, sans-serif';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,.25)';
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 1600);
}

function messageForReason(reason: CapturedVideoValidationReason): string {
  switch (reason) {
    case 'url-required':
      return 'Pick the saved URL this video belongs to.';
    case 'source-type-invalid':
      return 'Internal error — unrecognized video source type.';
    case 'embed-url-required':
      return 'No embed URL detected — close this form and right-click a YouTube/Vimeo/etc. video.';
    case 'embed-url-unrecognized':
      return "That URL doesn't look like a supported video embed (YouTube, Vimeo, Wistia, Brightcove, Dailymotion, or Loom).";
    case 'bytes-required':
      return 'No video bytes to upload — close this form and right-click a <video> again.';
    case 'video-mime-rejected':
      return 'Unsupported video type. PLOS accepts MP4, WebM, and QuickTime (MOV).';
    case 'video-too-large':
      return 'Video exceeds the 100 MB cap. Try the YouTube/Vimeo embed path instead, or upload the video to YouTube/Vimeo and paste the share URL.';
    case 'category-required':
      return 'Pick a video category, or add a new one via "+ Add new…".';
  }
}
