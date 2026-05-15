'use client';

// W#2 P-29 Slice #1 — manual-add URL modal mounted on UrlTable.
//
// Opens from the "+ Manually add URL" button in the UrlTable toolbar. POSTs
// to /api/projects/[projectId]/competition-scraping/urls with
// `source: 'manual'` so the new row is distinguishable from extension-
// captured rows. Form mirrors the extension's URL-add overlay: URL +
// Platform (7-value dropdown labeled identically to the extension) +
// optional Brand / Product / Category / Stars / # Reviews / Page Rank /
// Sponsored toggle.
//
// Out of Slice #1 scope (captured as DEFERRED for future polish):
//   - seller star rating + # seller reviews (Etsy-primarily; rare)
//   - customFields editor (JSON-shaped; needs its own UI)
//   - vocabulary autocomplete on Brand/Product/Category (extension's
//     pickers — wire to /api/projects/[projectId]/vocabulary in a slice
//     follow-up)
//   - rendering this modal even when the URL list is empty (today the
//     EmptyState in CompetitionScrapingViewer renders before UrlTable so
//     the button is hidden when no URLs exist yet)
//
// Close UX: X icon top-right, Cancel button bottom-left, backdrop click,
// Escape key. Submit disables while POST is in flight to prevent double-
// create races.

import { useEffect, useRef, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import {
  PLATFORMS,
  type CompetitorUrl,
  type CreateCompetitorUrlRequest,
  type Platform,
} from '@/lib/shared-types/competition-scraping';

// Mirror the extension's user-facing labels (extensions/competition-scraping/
// src/lib/platforms.ts) so users see identical naming on web + extension.
const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: 'Amazon.com',
  ebay: 'Ebay.com',
  etsy: 'Etsy.com',
  walmart: 'Walmart.com',
  'google-shopping': 'Google Shopping',
  'google-ads': 'Google Ads',
  'independent-website': 'Independent Website',
};

interface Props {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (row: CompetitorUrl) => void;
}

export function UrlAddModal({ projectId, isOpen, onClose, onSuccess }: Props) {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<Platform>('amazon');
  const [brandName, setBrandName] = useState('');
  const [productName, setProductName] = useState('');
  const [competitionCategory, setCompetitionCategory] = useState('');
  const [productStarRating, setProductStarRating] = useState('');
  const [numProductReviews, setNumProductReviews] = useState('');
  const [resultsPageRank, setResultsPageRank] = useState('');
  const [isSponsoredAd, setIsSponsoredAd] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  // Reset form whenever the modal closes so re-opens start clean.
  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setPlatform('amazon');
      setBrandName('');
      setProductName('');
      setCompetitionCategory('');
      setProductStarRating('');
      setNumProductReviews('');
      setResultsPageRank('');
      setIsSponsoredAd(false);
      setSubmitting(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Autofocus the URL field whenever the modal opens — same convention as
  // the extension's URL-add overlay.
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => urlInputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  // Escape key dismisses, matching the extension overlay's keyboard shape.
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
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setErrorMessage('URL is required.');
      return;
    }
    const body: CreateCompetitorUrlRequest = {
      platform,
      url: trimmedUrl,
      source: 'manual',
    };
    const brand = brandName.trim();
    if (brand) body.brandName = brand;
    const product = productName.trim();
    if (product) body.productName = product;
    const category = competitionCategory.trim();
    if (category) body.competitionCategory = category;
    const stars = parseOptionalNumber(productStarRating);
    if (stars !== undefined) {
      if (stars < 0 || stars > 5 || Number.isNaN(stars)) {
        setErrorMessage('Product stars must be a number between 0 and 5.');
        return;
      }
      body.productStarRating = stars;
    }
    const reviews = parseOptionalInteger(numProductReviews);
    if (reviews !== undefined) {
      if (reviews < 0 || Number.isNaN(reviews)) {
        setErrorMessage('# Reviews must be a non-negative whole number.');
        return;
      }
      body.numProductReviews = reviews;
    }
    const rank = parseOptionalInteger(resultsPageRank);
    if (rank !== undefined) {
      if (rank < 1 || Number.isNaN(rank)) {
        setErrorMessage('Results page rank must be 1 or larger.');
        return;
      }
      body.resultsPageRank = rank;
    }
    if (isSponsoredAd) body.isSponsoredAd = true;

    setSubmitting(true);
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls`,
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
      const row = (await res.json()) as CompetitorUrl;
      onSuccess(row);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not save the URL.'
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
        aria-labelledby="url-add-modal-title"
        style={dialogStyle}
      >
        <header style={headerStyle}>
          <h2 id="url-add-modal-title" style={titleStyle}>
            Manually add competitor URL
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
            <Field label="URL" required>
              <input
                ref={urlInputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/..."
                required
                disabled={submitting}
                aria-label="URL"
                style={textInputStyle}
              />
            </Field>

            <Field label="Platform" required>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                disabled={submitting}
                aria-label="Platform"
                style={selectStyle}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Brand Name">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={submitting}
                aria-label="Brand Name"
                style={textInputStyle}
              />
            </Field>

            <Field label="Product Name">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={submitting}
                aria-label="Product Name"
                style={textInputStyle}
              />
            </Field>

            <Field label="Competition Category">
              <input
                type="text"
                value={competitionCategory}
                onChange={(e) => setCompetitionCategory(e.target.value)}
                disabled={submitting}
                aria-label="Competition Category"
                style={textInputStyle}
              />
            </Field>

            <div style={twoColumnRowStyle}>
              <Field label="Product Stars (0–5)">
                <input
                  type="number"
                  value={productStarRating}
                  onChange={(e) => setProductStarRating(e.target.value)}
                  min={0}
                  max={5}
                  step={0.1}
                  disabled={submitting}
                  aria-label="Product Stars"
                  style={textInputStyle}
                />
              </Field>
              <Field label="# Reviews">
                <input
                  type="number"
                  value={numProductReviews}
                  onChange={(e) => setNumProductReviews(e.target.value)}
                  min={0}
                  step={1}
                  disabled={submitting}
                  aria-label="Number of Reviews"
                  style={textInputStyle}
                />
              </Field>
            </div>

            <Field label="Results Page Rank">
              <input
                type="number"
                value={resultsPageRank}
                onChange={(e) => setResultsPageRank(e.target.value)}
                min={1}
                step={1}
                disabled={submitting}
                aria-label="Results Page Rank"
                style={textInputStyle}
              />
            </Field>

            <label style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={isSponsoredAd}
                onChange={(e) => setIsSponsoredAd(e.target.checked)}
                disabled={submitting}
              />
              <span>Sponsored Ad</span>
            </label>

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
              disabled={submitting || url.trim() === ''}
              style={primaryButtonStyle}
            >
              {submitting ? 'Saving…' : 'Save URL'}
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

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  return Number(trimmed);
}

function parseOptionalInteger(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return NaN;
  return Math.trunc(n);
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `Could not save the URL (HTTP ${res.status}).`;
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

const selectStyle: React.CSSProperties = {
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '6px',
  color: '#e6edf3',
  fontFamily: 'inherit',
  fontSize: '13px',
  padding: '6px 10px',
};

const twoColumnRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#c9d1d9',
  cursor: 'pointer',
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
