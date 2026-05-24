'use client';

// W#2 P-46 Workstream 2 Session 4 (2026-05-28) — manual-add captured-review
// modal mounted on the URL-detail page's Captured Reviews section.
//
// Opens from the "+ Add review" button at the right end of the Captured
// Reviews section's h2 row. POSTs to
//   /api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews
// with `source: 'manual'` per §A.1b — v1 Reviews capture is manual-only on
// vklf.com (no extension Reviews gesture in v1; per-platform extension
// capture is deferred to post-P-46 polish sessions).
//
// Form fields (parallels CapturedTextAddModal but with star-rating picker):
//   - Star Rating (required, 1-5 picker)
//   - Body (required, multi-line textarea — the review text)
//   - Reviewer Name (optional)
//   - Review Date (optional, native date input)
//   - Tags (optional, comma-separated → string[])
//
// Idempotency + close UX mirror CapturedTextAddModal exactly.

import { useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import type {
  CapturedReview,
  CreateCapturedReviewRequest,
} from '@/lib/shared-types/competition-scraping';

interface Props {
  projectId: string;
  urlId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (row: CapturedReview) => void;
}

export function CapturedReviewAddModal({
  projectId,
  urlId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [starRating, setStarRating] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  // P-46 Workstream 5 polish (2026-05-24) — clientId must stay STABLE across
  // retry clicks within one modal-open session so the server-side P2002
  // dedup in url-reviews.ts can collapse a partial-failure retry to the
  // existing row (HTTP 200 instead of a duplicate 201). Regenerate only on
  // modal close (in the effect below). Do NOT inline crypto.randomUUID()
  // into handleSubmit — that defeats the server-side idempotency contract.
  const [clientId, setClientId] = useState<string>(() => crypto.randomUUID());

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStarRating(null);
      setBody('');
      setReviewerName('');
      setReviewDate('');
      setTagsInput('');
      setSubmitting(false);
      setErrorMessage(null);
      setClientId(crypto.randomUUID());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => bodyInputRef.current?.focus(), 0);
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
    if (starRating === null) {
      setErrorMessage('Star rating is required.');
      return;
    }
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setErrorMessage('Review body is required.');
      return;
    }

    const payload: CreateCapturedReviewRequest = {
      clientId,
      starRating,
      body: trimmedBody,
      source: 'manual',
    };
    const reviewer = reviewerName.trim();
    if (reviewer) payload.reviewerName = reviewer;
    const date = reviewDate.trim();
    if (date) payload.reviewDate = new Date(date).toISOString();
    const tags = parseTags(tagsInput);
    if (tags.length > 0) payload.tags = tags;

    setSubmitting(true);
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const detail = await readErrorMessage(res);
        setErrorMessage(detail);
        setSubmitting(false);
        return;
      }
      const row = (await res.json()) as CapturedReview;
      onSuccess(row);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save the review.'
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
        aria-labelledby="captured-review-add-modal-title"
        style={dialogStyle}
      >
        <header style={headerStyle}>
          <h2 id="captured-review-add-modal-title" style={titleStyle}>
            Add a review
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
          <div style={bodyContainerStyle}>
            <Field label="Star rating" required>
              <StarRatingPicker
                value={starRating}
                onChange={setStarRating}
                disabled={submitting}
              />
            </Field>

            <Field label="Review body" required>
              <textarea
                ref={bodyInputRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Paste or type the review text…"
                required
                disabled={submitting}
                aria-label="Review body"
                rows={6}
                style={textareaStyle}
              />
            </Field>

            <Field label="Reviewer name">
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                disabled={submitting}
                placeholder="(optional)"
                aria-label="Reviewer name"
                style={textInputStyle}
              />
            </Field>

            <Field label="Review date">
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                disabled={submitting}
                aria-label="Review date"
                style={textInputStyle}
              />
            </Field>

            <Field label="Tags (comma-separated)">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={submitting}
                placeholder="e.g. shipping, quality, sizing"
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
              disabled={
                submitting || starRating === null || body.trim() === ''
              }
              style={primaryButtonStyle}
            >
              {submitting ? 'Saving…' : 'Save review'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function StarRatingPicker({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (next: number) => void;
  disabled: boolean;
}) {
  return (
    <div
      style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
      data-testid="captured-review-star-rating"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            aria-pressed={filled}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0 2px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: filled ? '#f9c74f' : '#30363d',
              fontSize: '24px',
              lineHeight: 1,
            }}
          >
            {filled ? '★' : '☆'}
          </button>
        );
      })}
      <span
        style={{
          marginLeft: '8px',
          fontSize: '12px',
          color: value === null ? '#6e7681' : '#8b949e',
          fontStyle: value === null ? 'italic' : 'normal',
        }}
      >
        {value === null ? 'Pick 1–5' : `${value} of 5`}
      </span>
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
  return `Could not save the review (HTTP ${res.status}).`;
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

const bodyContainerStyle: React.CSSProperties = {
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
