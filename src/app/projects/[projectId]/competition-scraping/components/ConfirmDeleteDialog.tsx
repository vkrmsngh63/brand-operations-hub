'use client';

// W#2 P-27 + P-28 — shared confirm-delete dialog.
//
// Used on four surfaces:
//   - UrlTable.tsx          : trash button per URL row     → cascade variant
//   - UrlDetailContent.tsx  : Delete button on URL header  → cascade variant
//   - UrlDetailContent.tsx  : trash button per text row    → plain variant
//   - UrlDetailContent.tsx  : trash button per image row   → plain variant
//
// Mirrors UrlAddModal's UX shape (backdrop + dialog + X + Cancel/Confirm,
// Escape dismiss, submit-in-flight lock, inline error surface) but pared
// down to a confirm-only flow.
//
// The dialog stays dumb on data — the parent owns the count-fetch + the
// optimistic-update state. When variant === 'cascade':
//   - counts === null + countsError === null  → "Loading…"
//   - counts === null + countsError !== null  → render the error string
//   - counts !== null                          → "This will also delete
//                                                 N captured texts and M
//                                                 captured images."
// On confirm the dialog awaits onConfirm(); a thrown error surfaces inline
// (Cancel re-enables) and the dialog stays open. A resolved confirm signals
// the parent to close the dialog via onClose() — the dialog does NOT close
// itself, because the parent's optimistic-update needs to control the
// "row is gone vs. row is back due to error" timing.

import { useEffect, useState } from 'react';

export type CascadeCounts = { texts: number; images: number };

interface CommonProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

type Variant =
  | { kind: 'plain' }
  | {
      kind: 'cascade';
      // null + null   → loading
      // null + string → error
      // !null         → ready (render disclosure line)
      counts: CascadeCounts | null;
      countsError: string | null;
    };

export type ConfirmDeleteDialogProps = CommonProps & {
  variant: Variant;
};

export function ConfirmDeleteDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onClose,
  onConfirm,
  variant,
}: ConfirmDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset internal state whenever the dialog closes so re-opens start clean.
  useEffect(() => {
    if (!isOpen) {
      setSubmitting(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Escape key dismisses (unless mid-submit).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await onConfirm();
      // Parent calls onClose() on success — dialog state will reset via
      // the useEffect above.
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not delete.'
      );
      setSubmitting(false);
    }
  };

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitting) return;
    if (e.target === e.currentTarget) onClose();
  };

  const disclosure =
    variant.kind === 'cascade' ? renderDisclosure(variant) : null;

  return (
    <div
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      style={backdropStyle}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        data-testid="confirm-delete-dialog"
        style={dialogStyle}
      >
        <header style={headerStyle}>
          <h2 id="confirm-delete-title" style={titleStyle}>
            {title}
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

        <div style={bodyStyle}>
          <p style={messageStyle}>{message}</p>
          {disclosure}
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
            data-testid="confirm-delete-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            style={destructiveButtonStyle}
            data-testid="confirm-delete-confirm"
          >
            {submitting ? 'Deleting…' : confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

function renderDisclosure(
  variant: Extract<Variant, { kind: 'cascade' }>
): React.ReactNode {
  if (variant.countsError !== null) {
    return (
      <div role="alert" style={errorStyle} data-testid="cascade-counts-error">
        Could not load cascade counts: {variant.countsError}
      </div>
    );
  }
  if (variant.counts === null) {
    return (
      <div style={disclosureLoadingStyle} data-testid="cascade-counts-loading">
        Loading cascade counts…
      </div>
    );
  }
  const { texts, images } = variant.counts;
  // Treat 0/0 explicitly — "this will also delete 0 captured texts and 0
  // captured images" is misleading; show a softer phrasing instead.
  if (texts === 0 && images === 0) {
    return (
      <div style={disclosureReadyStyle} data-testid="cascade-counts-ready">
        This URL has no captured texts or captured images attached.
      </div>
    );
  }
  return (
    <div style={disclosureReadyStyle} data-testid="cascade-counts-ready">
      This will also delete {pluralize(texts, 'captured text', 'captured texts')}{' '}
      and {pluralize(images, 'captured image', 'captured images')}.
    </div>
  );
}

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// ─── Styles ─────────────────────────────────────────────────────────────

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
  maxWidth: '460px',
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

const messageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: '#c9d1d9',
  lineHeight: 1.5,
};

const disclosureLoadingStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8b949e',
  fontStyle: 'italic',
};

const disclosureReadyStyle: React.CSSProperties = {
  background: 'rgba(187, 128, 9, 0.08)',
  border: '1px solid rgba(187, 128, 9, 0.30)',
  color: '#e3b341',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '12px',
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

const destructiveButtonStyle: React.CSSProperties = {
  background: '#da3633',
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
