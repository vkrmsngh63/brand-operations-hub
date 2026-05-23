'use client';

// W#2 P-46 Workstream 3 Session 1 — horizontal bar at the top of the
// Competition Data table combining platform filters + per-column show/hide
// controls. Replaces the left-side PlatformSidebar per §C.3.
//
// Two checkbox groups in one bar:
//   - Platforms — "All Platforms" + the seven supported platforms. Single-
//     select semantics (mirrors the prior sidebar). Selecting one platform
//     scopes the table to that platform; "All" clears the scope.
//   - Columns  — per-column show/hide checkboxes. Multi-select; toggles a
//     column's visibility in the table. Defaults to visible when missing
//     from the prefs map.
//
// Owns no state of its own. Parent (CompetitionScrapingViewer) drives
// `selectedPlatform` from the URL query + `columnVisibility` from the
// fetched UserTablePreferences row + persists changes via debounced PUT.

import { PLATFORMS, type Platform } from '@/lib/shared-types/competition-scraping';
import { TABLE_COLUMN_DEFS, type ScopeFilter } from './url-table-columns';

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
  selectedPlatform: ScopeFilter;
  counts: Record<ScopeFilter, number> | null;
  loading: boolean;
  onSelectPlatform: (next: ScopeFilter) => void;

  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

export function ColumnVisibilityBar({
  selectedPlatform,
  counts,
  loading,
  onSelectPlatform,
  columnVisibility,
  onToggleColumn,
}: Props) {
  const platformItems: ScopeFilter[] = ['all', ...PLATFORMS];

  return (
    <div
      aria-label="Platform and column controls"
      style={barStyle}
      data-testid="column-visibility-bar"
    >
      <div style={groupStyle}>
        <span style={groupLabelStyle}>Platforms</span>
        <div style={chipRowStyle}>
          {platformItems.map((item) => {
            const label =
              item === 'all' ? 'All Platforms' : PLATFORM_LABELS[item];
            const active = selectedPlatform === item;
            const count = loading || !counts ? null : counts[item];
            return (
              <label
                key={item}
                style={chipStyle(active)}
                title={`Filter to ${label}`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() =>
                    onSelectPlatform(active ? 'all' : (item as ScopeFilter))
                  }
                  style={checkboxStyle}
                  aria-label={`Show ${label}`}
                />
                <span>{label}</span>
                <span style={countBadgeStyle}>
                  {count === null ? '…' : count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={dividerStyle} aria-hidden />

      <div style={groupStyle}>
        <span style={groupLabelStyle}>Columns</span>
        <div style={chipRowStyle}>
          {TABLE_COLUMN_DEFS.map((col) => {
            const visible = isColumnVisible(columnVisibility, col.id);
            return (
              <label
                key={col.id}
                style={chipStyle(visible)}
                title={`Show or hide the ${col.label} column`}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggleColumn(col.id, !visible)}
                  style={checkboxStyle}
                  aria-label={`Show ${col.label} column`}
                />
                <span>{col.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Missing keys default to visible — matches the design doc §A.3 semantics
// ("Missing keys default to visible"). The PUT body only ever carries keys
// the user has explicitly toggled, so most rows stay tiny.
export function isColumnVisible(
  map: Record<string, boolean>,
  columnId: string
): boolean {
  if (columnId in map) return map[columnId];
  return true;
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '12px 14px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '8px',
  marginBottom: '12px',
  flexWrap: 'wrap',
};

const groupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
  minWidth: '280px',
};

const groupLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const chipRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: active ? '#1f6feb22' : '#161b22',
    border: '1px solid',
    borderColor: active ? '#1f6feb55' : '#30363d',
    borderRadius: '999px',
    color: active ? '#e6edf3' : '#c9d1d9',
    fontSize: '12px',
    cursor: 'pointer',
    userSelect: 'none',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };
}

const checkboxStyle: React.CSSProperties = {
  margin: 0,
  cursor: 'pointer',
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#8b949e',
  fontVariantNumeric: 'tabular-nums',
  minWidth: '12px',
  textAlign: 'right',
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  alignSelf: 'stretch',
  background: '#30363d',
};
