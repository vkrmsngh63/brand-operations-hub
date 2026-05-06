'use client';

// Sidebar nav for the W#2 multi-table viewer. Lists the seven supported
// platforms plus an "All Platforms" row at the top, each with the count of
// URLs captured for that scope on the current Project. Click a row to
// switch the scope.
//
// Spec: docs/COMPETITION_SCRAPING_DESIGN.md §A.7 ("browseable by clicking
// platform name → list of URLs"). Selection is owned by the parent
// (CompetitionScrapingViewer) so a refresh-restored ?platform=… query can
// drive the initial state.

import { PLATFORMS, type Platform } from '@/lib/shared-types/competition-scraping';

export type ScopeFilter = 'all' | Platform;

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: 'Amazon',
  ebay: 'Ebay',
  etsy: 'Etsy',
  walmart: 'Walmart',
  'google-shopping': 'Google Shopping',
  'google-ads': 'Google Ads',
  'independent-website': 'Independent Websites',
};

interface Props {
  selected: ScopeFilter;
  counts: Record<ScopeFilter, number> | null;
  loading: boolean;
  onSelect: (next: ScopeFilter) => void;
}

export function PlatformSidebar({ selected, counts, loading, onSelect }: Props) {
  const items: ScopeFilter[] = ['all', ...PLATFORMS];

  return (
    <nav
      aria-label="Platforms"
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '8px',
        height: 'fit-content',
        position: 'sticky',
        top: '24px',
      }}
    >
      <h3
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#8b949e',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '8px 8px 12px',
        }}
      >
        Platforms
      </h3>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => {
          const label = item === 'all' ? 'All Platforms' : PLATFORM_LABELS[item];
          const active = selected === item;
          const count = loading || !counts ? null : counts[item];
          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                aria-current={active ? 'true' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 10px',
                  margin: '2px 0',
                  background: active ? '#1f6feb22' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? '#1f6feb55' : 'transparent',
                  borderRadius: '6px',
                  color: active ? '#e6edf3' : '#c9d1d9',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#8b949e',
                    minWidth: '24px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {count === null ? '…' : count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
