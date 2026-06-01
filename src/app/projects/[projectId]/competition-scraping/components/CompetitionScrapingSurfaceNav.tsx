'use client';

// W#2 P-49 Workstream 5 — shared 5-option nav toggle for the Competition
// Scraping page surfaces per docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md
// §3 (Fix Session A item 1) — replaces the previously-shipped 4-option
// toggle whose labels diverged from director's verbatim spec (D-1 in the
// divergence audit). Q1 → A (2026-05-28-b): 5 options total — 4 spec
// verbatim names + Comprehensive Analysis preserved as the 5th option.
//
// Order per Q1 → A (left-to-right):
//   1. Competitor Content Table              (existing /competition-scraping)
//   2. Competitor Reviews Analysis Table     (existing /competition-scraping/competitor-reviews-analysis)
//   3. Reviews Analysis By Competitor Category Table (NEW route — Fix Session C+ — disabled for now)
//   4. Reviews Analysis By Competitor Type Table     (NEW route — Fix Session C+ — disabled for now)
//   5. Comprehensive Analysis                (existing /competition-scraping/comprehensive-analysis)

import Link from 'next/link';
import type { JSX } from 'react';

export type Surface =
  | 'competitor-urls'
  | 'competitor-reviews-analysis'
  | 'reviews-analysis-by-category'
  | 'reviews-analysis-by-type'
  | 'comprehensive-analysis';

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
    label: 'Competitor Content Table',
    href: (projectId) => `/projects/${projectId}/competition-scraping`,
  },
  {
    key: 'competitor-reviews-analysis',
    label: 'Competitor Reviews Analysis Table',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/competitor-reviews-analysis`,
  },
  {
    key: 'reviews-analysis-by-category',
    label: 'Reviews Analysis By Competitor Category Table',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/reviews-analysis-by-category`,
    // Enabled 2026-05-30 — P-49 W5 Category page Session 1 scaffold shipped
    // (route + grouped 13-column table + column show/hide + click-to-edit).
    // AI flows + drag + Excel land in Sessions 2-3.
  },
  {
    key: 'reviews-analysis-by-type',
    label: 'Reviews Analysis By Competitor Type Table',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/reviews-analysis-by-type`,
    // Enabled 2026-06-01 — P-49 W5 Type page Sessions 4-5 shipped (route +
    // grouped 13-column table grouped by Type + drag + Excel + the two
    // per-type AI flows + the Source Reviews column + the 4 adjustments).
  },
  {
    key: 'comprehensive-analysis',
    label: 'Comprehensive Analysis',
    href: (projectId) =>
      `/projects/${projectId}/competition-scraping/comprehensive-analysis`,
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
