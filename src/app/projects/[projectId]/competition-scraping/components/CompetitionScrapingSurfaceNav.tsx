'use client';

// W#2 P-49 Workstream 5 Session 2 — shared 4-option toggle for the
// Competition Scraping page per docs/REVIEWS_PHASE_2_DESIGN.md §B
// 2026-05-27 (Reviews Phase 3 design lock).
//
// Per §B 2026-05-27 the design lock surfaced a 4-option toggle giving
// access to four surface views:
//   1. Competitor URLs            (existing /competition-scraping)
//   2. Comprehensive Analysis     (existing /competition-scraping/comprehensive-analysis)
//   3. Competitor Reviews Analysis (NEW Table 2 per-review nested rows)
//   4. By Category / By Type      (DEFERRED to Session 3+ — disabled here)
//
// This component renders nav links via Next.js Link so each surface is
// its own page route. The fourth option is intentionally disabled in
// Session 2 because Tables 3 + 4 (By Category / By Type) ship in
// Session 3+; the option exists in the toggle today to surface the
// final shape of the navigation to the user.

import Link from 'next/link';
import type { JSX } from 'react';

export type Surface =
  | 'competitor-urls'
  | 'comprehensive-analysis'
  | 'competitor-reviews-analysis'
  | 'by-group';

interface SurfaceEntry {
  key: Surface;
  label: string;
  href: (projectId: string) => string;
  disabled?: boolean;
  disabledNote?: string;
}

const SURFACES: ReadonlyArray<SurfaceEntry> = [
  {
    key: 'competitor-urls',
    label: 'Competitor URLs',
    href: (projectId) => `/projects/${projectId}/competition-scraping`,
  },
  {
    key: 'comprehensive-analysis',
    label: 'Comprehensive Analysis',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/comprehensive-analysis`,
  },
  {
    key: 'competitor-reviews-analysis',
    label: 'Competitor Reviews Analysis',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/competitor-reviews-analysis`,
  },
  {
    key: 'by-group',
    label: 'By Category / By Type',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/by-group`,
    disabled: true,
    disabledNote: 'Coming in Session 3+ (Tables 3 + 4 per §B 2026-05-27)',
  },
];

export interface CompetitionScrapingSurfaceNavProps {
  projectId: string;
  active: Surface;
}

export function CompetitionScrapingSurfaceNav({
  projectId,
  active,
}: CompetitionScrapingSurfaceNavProps): JSX.Element {
  return (
    <nav
      aria-label="Competition scraping surfaces"
      style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        marginBottom: '20px',
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        flexWrap: 'wrap',
      }}
    >
      {SURFACES.map((s) => {
        const isActive = s.key === active;
        const baseStyle: React.CSSProperties = {
          padding: '8px 14px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: isActive ? 600 : 500,
          textDecoration: 'none',
          transition: 'background 0.1s',
        };
        if (s.disabled) {
          return (
            <span
              key={s.key}
              title={s.disabledNote}
              style={{
                ...baseStyle,
                color: '#6e7681',
                background: 'transparent',
                cursor: 'not-allowed',
              }}
            >
              {s.label} <span style={{ fontSize: '10px', opacity: 0.7 }}>(soon)</span>
            </span>
          );
        }
        return (
          <Link
            key={s.key}
            href={s.href(projectId)}
            style={{
              ...baseStyle,
              color: isActive ? '#0d1117' : '#e6edf3',
              background: isActive ? '#58a6ff' : 'transparent',
            }}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}
