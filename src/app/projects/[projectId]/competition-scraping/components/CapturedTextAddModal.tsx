'use client';

// W#2 P-29 Slice #2 — manual-add captured-text modal mounted on the
// URL-detail page's Captured Text section.
//
// Opens from the "+ Manually add captured text" button at the right end
// of the Captured Text section's h2 row (director's session-start pick).
// POSTs to /api/projects/[projectId]/competition-scraping/urls/[urlId]/text
// with `source: 'manual'` so the new row is distinguishable from
// extension-captured rows (Slice #1 schema migration shipped the column).
//
// Form mirrors the Chrome extension's right-click text-capture flow:
//   - Text (required, multi-line textarea — typical paste target)
//   - Content Category (optional; plain text input for Slice #2.
//     Vocabulary autocomplete deferred to a polish item — design hint
//     captured in the launch prompt.)
//   - Tags (optional; comma-separated input parsed to string[])
//
// Idempotency: every submit generates a fresh clientId via
// crypto.randomUUID() so retries (network blips → director re-clicks
// Save) hit the route's clientId-dedup path and return the existing row
// instead of creating duplicates. Matches the extension's WAL semantics.
//
// Close UX: X icon top-right, Cancel button bottom-left, backdrop click,
// Escape key. Submit disables while POST is in flight to prevent double-
// create races. Mirrors UrlAddModal exactly.

import { useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type {
  CapturedText,
  CreateCapturedTextRequest,
} from '@/lib/shared-types/competition-scraping';

interface Props {
  projectId: string;
  urlId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (row: CapturedText) => void;
}

export function CapturedTextAddModal({
  projectId,
  urlId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [text, setText] = useState('');
  const [contentCategory, setContentCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setText('');
      setContentCategory('');
      setTagsInput('');
      setSubmitting(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Autofocus the Text textarea on open — the typical use is paste-then-
  // save, so the user expects the cursor in the largest field.
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => textInputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedText = text.trim();
    if (!trimmedText) {
      setErrorMessage('Text is required.');
      return;
    }

    const body: CreateCapturedTextRequest = {
      clientId: crypto.randomUUID(),
      text: trimmedText,
      source: 'manual',
    };
    const category = contentCategory.trim();
    if (category) body.contentCategory = category;
    const tags = parseTags(tagsInput);
    if (tags.length > 0) body.tags = tags;

    setSubmitting(true);
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/text`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const detail = await readErrorMessage(res);
        setErrorMessage(detail);
        setSubmitting(false);
        return;
      }
      const row = (await res.json()) as CapturedText;
      onSuccess(row);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save the captured text.'
      );
      setSubmitting(false);
    }
  };

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitting) return;
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      style={backdropStyle}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="captured-text-add-modal-title"
        style={dialogStyle}
      >
        <header style={headerStyle}>
          <h2 id="captured-text-add-modal-title" style={titleStyle}>
            Manually add captured text
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            style={closeButtonStyle}
          >
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={bodyStyle}>
            <Field label="Text" required>
              <textarea
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type the text you captured…"
                required
                disabled={submitting}
                aria-label="Text"
                rows={6}
                style={textareaStyle}
              />
            </Field>

            <Field label="Content Category">
              <input
                type="text"
                value={contentCategory}
                onChange={(e) => setContentCategory(e.target.value)}
                disabled={submitting}
                aria-label="Content Category"
                style={textInputStyle}
              />
            </Field>

            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={submitting}
                placeholder="e.g. headline, bullet, review-quote"
                aria-label="Tags"
                style={textInputStyle}
              />
            </Field>

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
              disabled={submitting}
              style={secondaryButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || text.trim() === ''}
              style={primaryButtonStyle}
            >
              {submitting ? 'Saving…' : 'Save captured text'}
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

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `Could not save the captured text (HTTP ${res.status}).`;
}

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
  maxWidth: '560px',
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
  minHeight: '120px',
  lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  background: 'rgba(248, 81, 73, 0.12)',
  border: '1px solid rgba(248, 81, 73, 0.40)',
  color: '#ffa198',
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
