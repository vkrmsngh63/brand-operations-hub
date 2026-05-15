'use client';

// W#2 P-29 Slice #3 — manual-add captured-image modal mounted on the
// URL-detail page's Captured Images section.
//
// Opens from the "+ Manually add captured image" button at the right end
// of the Captured Images section's h2 row (mirrors Slice #2's pattern).
// POSTs to the standard finalize route with `source: 'manual'` so the
// new row is distinguishable from extension-captured rows (Slice #1
// schema migration shipped the column).
//
// Three input modalities (per the 2026-05-15 design pass Q1 outcome —
// `COMPETITION_SCRAPING_DESIGN.md §B 2026-05-15`):
//
//   (a) Drag-and-drop area — drop a single image file onto the modal.
//   (b) Paste-from-clipboard listener — Ctrl+V / Cmd+V while modal open.
//   (c) "Or paste an image URL" text field — POSTs to the new server-
//       side `fetch-by-url` endpoint which SSRF-validates + downloads
//       + uploads to storage; then client converges with the drag-drop
//       path at the finalize call.
//
// Validation (drag-drop + paste paths):
//   - MIME must match ACCEPTED_IMAGE_MIME_TYPES (jpeg/png/webp)
//   - Size ≤ IMAGE_UPLOAD_MAX_BYTES (5 MB per STACK_DECISIONS §3)
// URL path defers to server-side validation (same caps + Content-Type).
//
// Idempotency: every submit generates a fresh clientId via
// crypto.randomUUID() so retries hit the finalize route's clientId-dedup
// path and return the existing row instead of creating duplicates.
// Matches the extension's WAL semantics + Slices #1+#2 idempotent shape.
//
// Close UX: X icon top-right, Cancel button bottom-left, backdrop click,
// Escape key. Submit disables while POST is in flight to prevent double-
// create races. Mirrors CapturedTextAddModal + UrlAddModal exactly.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import {
  ACCEPTED_IMAGE_MIME_TYPES,
  IMAGE_UPLOAD_MAX_BYTES,
  type AcceptedImageMimeType,
  type CapturedImage,
  type FetchImageByUrlResponse,
  type FinalizeImageUploadRequest,
  type RequestImageUploadRequest,
  type RequestImageUploadResponse,
} from '@/lib/shared-types/competition-scraping';
import { VocabularyPicker } from '../url/[urlId]/components/VocabularyPicker';

interface Props {
  projectId: string;
  urlId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (row: CapturedImage) => void;
}

// Internal: the "loaded image" state after a successful drop / paste /
// URL-fetch. The two paths (local bytes vs. server-uploaded) converge
// at finalize but need to take different routes through the upload
// pipeline; we encode that with a discriminated union.
type LoadedImage =
  | {
      kind: 'local';
      // The user-supplied Blob — still need Phase 1 (requestUpload) +
      // Phase 2 (signed-URL PUT) before finalize. We keep the Blob (not
      // bytes) so the fetch body type stays trivially BodyInit-compatible.
      blob: Blob;
      mimeType: AcceptedImageMimeType;
      fileSize: number;
      objectUrl: string; // for preview, revoked on cleanup
      filename?: string; // display only
    }
  | {
      kind: 'fetched';
      // Server-side fetch + upload already happened — we have the
      // capturedImageId + storagePath ready for finalize directly.
      capturedImageId: string;
      storagePath: string;
      mimeType: AcceptedImageMimeType;
      fileSize: number;
      previewUrl: string; // signed URL minted server-side
    };

export function CapturedImageAddModal({
  projectId,
  urlId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [imageCategory, setImageCategory] = useState('');
  const [composition, setComposition] = useState('');
  const [embeddedText, setEmbeddedText] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [fetchingByUrl, setFetchingByUrl] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Reset all state when the modal closes. Important: revoke any
  // object URL we created from drag-drop / paste to avoid memory leaks.
  useEffect(() => {
    if (!isOpen) {
      setImage((prev) => {
        if (prev?.kind === 'local') URL.revokeObjectURL(prev.objectUrl);
        return null;
      });
      setUrlInput('');
      setImageCategory('');
      setComposition('');
      setEmbeddedText('');
      setTagsInput('');
      setSubmitting(false);
      setFetchingByUrl(false);
      setDragActive(false);
      setErrorMessage(null);
      setWarningMessage(null);
    }
  }, [isOpen]);

  // Escape closes the modal (unless mid-submit / mid-fetch).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !fetchingByUrl) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, fetchingByUrl, onClose]);

  // Convert a File / Blob into our `local` LoadedImage state after
  // running MIME + size validation. Used by both drop + paste paths.
  const tryLoadFile = useCallback(async (file: File | Blob, filename?: string) => {
    setErrorMessage(null);
    setWarningMessage(null);
    const mimeType = file.type.toLowerCase();
    if (!(ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType)) {
      setErrorMessage(
        `That file type (${mimeType || 'unknown'}) isn't supported. Please use a JPEG, PNG, or WebP image.`
      );
      return;
    }
    if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
      setErrorMessage(
        `Image is ${Math.round(file.size / 1024 / 1024)} MB — exceeds the 5 MB cap. Please use a smaller image.`
      );
      return;
    }
    if (file.size === 0) {
      setErrorMessage('That file is empty.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    // Replace any previously-loaded image and revoke its URL.
    setImage((prev) => {
      if (prev?.kind === 'local') URL.revokeObjectURL(prev.objectUrl);
      return {
        kind: 'local',
        blob: file,
        mimeType: mimeType as AcceptedImageMimeType,
        fileSize: file.size,
        objectUrl,
        filename,
      };
    });
  }, []);

  // Drop handler. Multiple-file drops keep the first; warn that the
  // rest are dropped.
  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (submitting || fetchingByUrl) return;
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length === 0) return;
      if (files.length > 1) {
        setWarningMessage(
          `${files.length} files dropped — only the first will be used.`
        );
      }
      await tryLoadFile(files[0], files[0].name);
    },
    [submitting, fetchingByUrl, tryLoadFile]
  );

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (submitting || fetchingByUrl) return;
      setDragActive(true);
    },
    [submitting, fetchingByUrl]
  );

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Clipboard-paste listener. Only active while the modal is open AND no
  // image is already loaded — once an image is loaded, paste would clobber
  // the user's drag-drop or URL-fetch unintentionally. Reads
  // clipboardData.items for image MIME types.
  useEffect(() => {
    if (!isOpen) return;
    if (submitting || fetchingByUrl) return;
    if (image) return; // don't clobber loaded image
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind !== 'file') continue;
        const file = item.getAsFile();
        if (file && (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type.toLowerCase())) {
          e.preventDefault();
          void tryLoadFile(file);
          return;
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [isOpen, submitting, fetchingByUrl, image, tryLoadFile]);

  // File-input fallback for users who prefer browsing instead of dropping.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Reset the input value so re-picking the same file fires onChange.
      e.target.value = '';
      if (!file) return;
      await tryLoadFile(file, file.name);
    },
    [tryLoadFile]
  );

  // URL-fetch handler — POSTs the URL to the server-side fetch endpoint.
  const onFetchByUrl = useCallback(async () => {
    setErrorMessage(null);
    setWarningMessage(null);
    const url = urlInput.trim();
    if (!url) {
      setErrorMessage('Enter an image URL first.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setErrorMessage('URL must start with http:// or https://');
      return;
    }
    setFetchingByUrl(true);
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/images/fetch-by-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url }),
        }
      );
      if (!res.ok) {
        const detail = await readErrorMessage(res, 'Could not fetch that image');
        setErrorMessage(detail);
        setFetchingByUrl(false);
        return;
      }
      const data = (await res.json()) as FetchImageByUrlResponse;
      // Replace any previously-loaded image and revoke its URL.
      setImage((prev) => {
        if (prev?.kind === 'local') URL.revokeObjectURL(prev.objectUrl);
        return {
          kind: 'fetched',
          capturedImageId: data.capturedImageId,
          storagePath: data.storagePath,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          previewUrl: data.previewUrl,
        };
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not fetch that image.'
      );
    } finally {
      setFetchingByUrl(false);
    }
  }, [projectId, urlId, urlInput]);

  // Clear loaded image (lets user re-drop or paste a different one).
  const onClearImage = useCallback(() => {
    setImage((prev) => {
      if (prev?.kind === 'local') URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setErrorMessage(null);
    setWarningMessage(null);
  }, []);

  // Submit — converges the two paths at finalize. For 'local' images we
  // run Phase 1 (requestUpload) + Phase 2 (signed-URL PUT) + Phase 3
  // (finalize). For 'fetched' images we skip directly to Phase 3 since
  // the server-side fetch-by-url already uploaded the bytes.
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMessage(null);
      if (!image) {
        setErrorMessage('Add an image first (drag, paste, or paste a URL).');
        return;
      }
      const clientId = crypto.randomUUID();
      setSubmitting(true);
      try {
        let capturedImageId: string;
        let mimeType: AcceptedImageMimeType;
        let fileSize: number;

        if (image.kind === 'local') {
          // Phase 1 — requestUpload.
          const phase1Body: RequestImageUploadRequest = {
            clientId,
            mimeType: image.mimeType,
            fileSize: image.fileSize,
            sourceType: 'regular',
          };
          const phase1 = await authFetch(
            `/api/projects/${projectId}/competition-scraping/urls/${urlId}/images/requestUpload`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(phase1Body),
            }
          );
          if (!phase1.ok) {
            const detail = await readErrorMessage(phase1, 'Could not start the upload');
            setErrorMessage(detail);
            setSubmitting(false);
            return;
          }
          const phase1Data = (await phase1.json()) as RequestImageUploadResponse;
          // Phase 2 — direct PUT to signed Supabase URL. Pass the Blob
          // directly — Blob is a first-class BodyInit and avoids the
          // ArrayBufferLike narrowing issue Uint8Array hits in strict TS.
          const putRes = await fetch(phase1Data.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': image.mimeType },
            body: image.blob,
          });
          if (!putRes.ok) {
            setErrorMessage(
              `Could not upload bytes to storage (HTTP ${putRes.status}). Please try again.`
            );
            setSubmitting(false);
            return;
          }
          capturedImageId = phase1Data.capturedImageId;
          mimeType = image.mimeType;
          fileSize = image.fileSize;
        } else {
          // Server-side fetch already uploaded bytes; just need finalize.
          capturedImageId = image.capturedImageId;
          mimeType = image.mimeType;
          fileSize = image.fileSize;
        }

        // Phase 3 — finalize (single shape for both paths).
        const finalizeBody: FinalizeImageUploadRequest = {
          clientId,
          capturedImageId,
          mimeType,
          sourceType: 'regular',
          fileSize,
          source: 'manual',
        };
        const cat = imageCategory.trim();
        if (cat) finalizeBody.imageCategory = cat;
        const comp = composition.trim();
        if (comp) finalizeBody.composition = comp;
        const emb = embeddedText.trim();
        if (emb) finalizeBody.embeddedText = emb;
        const tags = parseTags(tagsInput);
        if (tags.length > 0) finalizeBody.tags = tags;

        const finalize = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls/${urlId}/images/finalize`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalizeBody),
          }
        );
        if (!finalize.ok) {
          const detail = await readErrorMessage(finalize, 'Could not save the image');
          setErrorMessage(detail);
          setSubmitting(false);
          return;
        }
        const row = (await finalize.json()) as CapturedImage;
        onSuccess(row);
        onClose();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Could not save the captured image.'
        );
        setSubmitting(false);
      }
    },
    [projectId, urlId, image, imageCategory, composition, embeddedText, tagsInput, onSuccess, onClose]
  );

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitting || fetchingByUrl) return;
    if (e.target === e.currentTarget) onClose();
  };

  const previewSrc = useMemo(() => {
    if (!image) return null;
    return image.kind === 'local' ? image.objectUrl : image.previewUrl;
  }, [image]);

  const isBusy = submitting || fetchingByUrl;
  const canSubmit = image !== null && !isBusy;

  if (!isOpen) return null;

  return (
    <div role="presentation" onMouseDown={handleBackdropMouseDown} style={backdropStyle}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="captured-image-add-modal-title"
        style={dialogStyle}
      >
        <header style={headerStyle}>
          <h2 id="captured-image-add-modal-title" style={titleStyle}>
            Manually add captured image
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close"
            style={closeButtonStyle}
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={bodyStyle}>
            {/* Drop zone + file-picker fallback */}
            {!image ? (
              <>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  style={{
                    ...dropZoneStyle,
                    borderColor: dragActive ? '#58a6ff' : '#30363d',
                    background: dragActive ? 'rgba(88, 166, 255, 0.08)' : '#0d1117',
                  }}
                  data-testid="image-drop-zone"
                >
                  <div style={dropCopyStyle}>
                    {dragActive ? 'Drop the image here' : 'Drag an image here'}
                  </div>
                  <div style={dropHintStyle}>
                    or paste from clipboard (Ctrl/Cmd+V) — JPEG, PNG, or WebP — up to 5 MB
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    style={secondaryButtonStyle}
                  >
                    Browse for a file…
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
                    onChange={onFileInputChange}
                    style={{ display: 'none' }}
                    aria-hidden="true"
                  />
                </div>

                <div style={orSeparatorStyle}>
                  <span style={orLineStyle} />
                  <span style={orLabelStyle}>or paste an image URL</span>
                  <span style={orLineStyle} />
                </div>

                <div style={urlRowStyle}>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/path/to/image.png"
                    disabled={isBusy}
                    aria-label="Image URL"
                    style={{ ...textInputStyle, flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isBusy && urlInput.trim()) {
                        e.preventDefault();
                        void onFetchByUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={onFetchByUrl}
                    disabled={isBusy || urlInput.trim() === ''}
                    style={secondaryButtonStyle}
                    data-testid="fetch-by-url-button"
                  >
                    {fetchingByUrl ? 'Fetching…' : 'Fetch image'}
                  </button>
                </div>
              </>
            ) : (
              <div style={previewWrapStyle}>
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={
                      image.kind === 'local' && image.filename
                        ? image.filename
                        : 'Captured image preview'
                    }
                    style={previewImgStyle}
                  />
                ) : null}
                <div style={previewMetaRowStyle}>
                  <div style={previewMetaStyle}>
                    <div>
                      <strong>{image.mimeType}</strong>
                      {' · '}
                      {formatFileSize(image.fileSize)}
                      {image.kind === 'local' && image.filename ? (
                        <>
                          {' · '}
                          <span style={{ color: '#8b949e' }}>{image.filename}</span>
                        </>
                      ) : null}
                      {image.kind === 'fetched' ? (
                        <>
                          {' · '}
                          <span style={{ color: '#8b949e' }}>fetched from URL</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClearImage}
                    disabled={isBusy}
                    style={secondaryButtonStyle}
                  >
                    Replace…
                  </button>
                </div>
              </div>
            )}

            <Field label="Image Category">
              <VocabularyPicker
                projectId={projectId}
                vocabularyType="image-category"
                value={imageCategory}
                onChange={setImageCategory}
                disabled={isBusy}
                autoFocus={false}
                inputStyleOverride={textInputStyle}
              />
            </Field>

            <Field label="Composition">
              <textarea
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="What's in the image (high-level)…"
                disabled={isBusy}
                rows={2}
                aria-label="Composition"
                style={textareaStyle}
              />
            </Field>

            <Field label="Embedded Text">
              <textarea
                value={embeddedText}
                onChange={(e) => setEmbeddedText(e.target.value)}
                placeholder="Text that appears inside the image…"
                disabled={isBusy}
                rows={2}
                aria-label="Embedded Text"
                style={textareaStyle}
              />
            </Field>

            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isBusy}
                placeholder="e.g. hero-shot, infographic, review-screenshot"
                aria-label="Tags"
                style={textInputStyle}
              />
            </Field>

            {warningMessage ? (
              <div role="status" style={warningStyle}>
                {warningMessage}
              </div>
            ) : null}
            {errorMessage ? (
              <div role="alert" style={errorStyle}>
                {errorMessage}
              </div>
            ) : null}
          </div>

          <footer style={footerStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={primaryButtonStyle}
              data-testid="captured-image-add-modal-submit"
            >
              {submitting ? 'Saving…' : 'Save captured image'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={fieldLabelStyle}>
      <span style={fieldLabelTextStyle}>
        {label}
        {required ? <span style={{ color: '#f85149' }}> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function readErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `${fallback} (HTTP ${res.status}).`;
}

// ─── Styles — mirror CapturedTextAddModal + UrlAddModal ────────────────

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '640px',
  maxHeight: 'calc(100vh - 48px)',
  overflowY: 'auto',
  color: '#e6edf3',
  fontFamily: 'inherit',
  fontSize: '13px',
  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.40)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderBottom: '1px solid #30363d',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '15px',
  fontWeight: 600,
  color: '#e6edf3',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#8b949e',
  fontSize: '22px',
  lineHeight: '22px',
  cursor: 'pointer',
  padding: '0 8px',
};

const bodyStyle: React.CSSProperties = {
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const fieldLabelTextStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#c9d1d9',
};

const textInputStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '6px',
  color: '#e6edf3',
  fontFamily: 'inherit',
  fontSize: '13px',
  padding: '6px 10px',
};

const textareaStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '6px',
  color: '#e6edf3',
  fontFamily: 'inherit',
  fontSize: '13px',
  padding: '8px 10px',
  resize: 'vertical',
  minHeight: '50px',
  lineHeight: 1.5,
};

const dropZoneStyle: React.CSSProperties = {
  border: '2px dashed #30363d',
  borderRadius: '8px',
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textAlign: 'center',
  transition: 'border-color 120ms, background 120ms',
};

const dropCopyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#e6edf3',
  fontWeight: 500,
};

const dropHintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b949e',
  marginBottom: '8px',
};

const orSeparatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  margin: '4px 0',
};

const orLineStyle: React.CSSProperties = {
  flex: 1,
  height: '1px',
  background: '#30363d',
};

const orLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#6e7681',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const urlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const previewWrapStyle: React.CSSProperties = {
  border: '1px solid #30363d',
  borderRadius: '8px',
  padding: '8px',
  background: '#0d1117',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const previewImgStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '280px',
  objectFit: 'contain',
  borderRadius: '6px',
  display: 'block',
  margin: '0 auto',
};

const previewMetaRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '0 4px',
};

const previewMetaStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#c9d1d9',
  minWidth: 0,
  flex: 1,
};

const errorStyle: React.CSSProperties = {
  background: 'rgba(248, 81, 73, 0.12)',
  border: '1px solid rgba(248, 81, 73, 0.40)',
  color: '#ffa198',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '12px',
};

const warningStyle: React.CSSProperties = {
  background: 'rgba(210, 153, 34, 0.12)',
  border: '1px solid rgba(210, 153, 34, 0.40)',
  color: '#e3b341',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '12px',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  padding: '12px 16px',
  borderTop: '1px solid #30363d',
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#238636',
  border: '1px solid rgba(240, 246, 252, 0.10)',
  color: '#ffffff',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: 600,
  padding: '6px 14px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #30363d',
  color: '#c9d1d9',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '13px',
  padding: '6px 14px',
  cursor: 'pointer',
};
