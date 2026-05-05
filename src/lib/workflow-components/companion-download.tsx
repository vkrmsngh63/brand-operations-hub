'use client';

// CompanionDownload — UI block that surfaces a downloadable companion
// artifact (browser extension, mobile app, desktop tool) the user installs
// and runs separately from the PLOS website. PLATFORM_REQUIREMENTS.md
// §12.6 pattern #3 — external-client companion. W#2's Chrome extension is
// the FIRST exerciser; future workflows may follow.
//
// Posture: chrome around the companion, not the companion itself. The
// component says nothing about how the companion is built, what framework
// it uses, how it authenticates to PLOS, or how it talks to the API —
// those are the workflow's own concerns.
//
// Placement: rendered as one item INSIDE <DeliverablesArea>'s Resources
// sub-section, alongside user guides and templates. Not a standalone region
// in Phase 1.
//
// STRUCTURAL DECISION (frozen) per design doc §3.5 Decision 4B — the
// 3-prop signature (label, url, description). Richer features (version
// display, connection-status indicator, type-specific UI) are PROVISIONAL
// and added additively when a workflow concretely needs them, per
// feedback_avoid_over_prescribing.md.

export interface CompanionDownloadProps {
  // Button text — e.g., "Download Extension" or "Install Mobile App".
  label: string;

  // Where the companion lives — ZIP, installer, Chrome Web Store listing,
  // App Store URL, etc. The component opens this in a new tab.
  url: string;

  // One-liner under the button explaining what it is and why the user
  // wants it. Plain language; no jargon.
  description: string;
}

export function CompanionDownload({
  label,
  url,
  description,
}: CompanionDownloadProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '14px 16px',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: '13px',
            color: '#e6edf3',
            fontWeight: 500,
            marginBottom: '2px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#8b949e',
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '8px 14px',
          background: '#1f6feb',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        ↓ Download
      </a>
    </div>
  );
}
