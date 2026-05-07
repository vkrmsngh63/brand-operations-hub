'use client';

// W#2 per-URL detail page — full-size image viewer modal (slice a.2).
//
// Renders a dark overlay with the full-size image on the left and a
// metadata sidebar on the right (image category, composition, embedded
// text, tags, source type, added-on). Closes on Esc, on backdrop click,
// or on the ✕ button. Arrow keys flip to the previous/next image without
// closing the modal — the parent component owns the index and the modal
// just calls `onPrev` / `onNext`.
//
// Image bytes are loaded from the 1-hour-TTL signed URL minted server-side
// in `GET .../urls/[urlId]/images` (slice a.2's route extension). The
// modal does not refresh URLs; a stale URL is a 1-hour-old page and a
// soft refresh is the correct user response.

import { useEffect, useRef, useState } from 'react';
import type { CapturedImageWithUrls } from '@/lib/shared-types/competition-scraping';

interface Props {
  image: CapturedImageWithUrls;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

// The parent passes `key={image.id}` so React remounts this component on
// every prev/next navigation — that resets `imageErrored` without a
// synchronous setState-in-effect (which the react-hooks/purity rule flags
// as a cascading-render risk; see UrlDetailContent.tsx's slice-(a.1)
// comment for the same lesson). Body-scroll-lock and close-button auto-
// focus also re-fire cleanly on remount with no observable effect.
export function ImageViewerModal({
  image,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageErrored, setImageErrored] = useState(false);

  // Keyboard handlers: Esc closes; ArrowLeft/ArrowRight navigate. The
  // listener is attached to window so it works no matter where focus
  // lands (the close button is auto-focused on mount, but a click on
  // backdrop or sidebar may shift focus).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  // Auto-focus the close button on mount so screen-reader + keyboard
  // users land in the modal's interactive area, and lock background
  // scroll so the page doesn't drift while the modal is open.
  useEffect(() => {
    closeButtonRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const sourceTypeLabel =
    image.sourceType === 'region-screenshot'
      ? 'Region screenshot'
      : 'Regular image';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-size captured image"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(1, 4, 9, 0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        onClick={stop}
        style={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '100%',
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: '10px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close image viewer"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1,
            width: '32px',
            height: '32px',
            background: 'rgba(13,17,23,0.85)',
            color: '#e6edf3',
            border: '1px solid #30363d',
            borderRadius: '6px',
            fontSize: '16px',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <div
          style={{
            background: '#010409',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: '320px',
            maxHeight: '85vh',
            padding: '16px',
          }}
        >
          {imageErrored ? (
            <div
              style={{
                color: '#f85149',
                fontSize: '13px',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              Image failed to load. The signed link may have expired —
              refresh this page to mint a new one.
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.fullSizeUrl}
              alt={image.imageCategory ?? sourceTypeLabel}
              onError={() => setImageErrored(true)}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous image"
                style={navButtonStyle('left')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next image"
                style={navButtonStyle('right')}
              >
                ›
              </button>
              <span
                aria-live="polite"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  color: '#8b949e',
                  background: 'rgba(13,17,23,0.85)',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '2px 8px',
                }}
              >
                {index + 1} / {total}
              </span>
            </>
          ) : null}
        </div>

        <aside
          style={{
            background: '#0d1117',
            borderLeft: '1px solid #21262d',
            padding: '20px',
            overflowY: 'auto',
            maxHeight: '85vh',
            color: '#c9d1d9',
            fontSize: '13px',
          }}
        >
          <SidebarRow label="Category" value={image.imageCategory} />
          <SidebarRow
            label="Source"
            value={sourceTypeLabel}
          />
          <SidebarRow
            label="Dimensions"
            value={
              image.width != null && image.height != null
                ? `${image.width} × ${image.height}`
                : null
            }
          />
          <SidebarRow
            label="Added on"
            value={formatDate(image.addedAt)}
          />
          <SidebarBlock label="Composition" value={image.composition} />
          <SidebarBlock label="Embedded text" value={image.embeddedText} />
          <SidebarRow
            label="Tags"
            value={image.tags.length > 0 ? image.tags.join(', ') : null}
          />
        </aside>
      </div>
    </div>
  );
}

function SidebarRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '2px' }}>
        {label}
      </div>
      <div
        style={{
          color: value == null ? '#6e7681' : '#c9d1d9',
          fontStyle: value == null ? 'italic' : 'normal',
          wordBreak: 'break-word',
        }}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}

function SidebarBlock({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>
        {label}
      </div>
      <div
        style={{
          color: value == null ? '#6e7681' : '#c9d1d9',
          fontStyle: value == null ? 'italic' : 'normal',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.5,
        }}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}

function navButtonStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: '16px',
    width: '40px',
    height: '40px',
    background: 'rgba(13,17,23,0.85)',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: '6px',
    fontSize: '24px',
    lineHeight: 1,
    cursor: 'pointer',
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
