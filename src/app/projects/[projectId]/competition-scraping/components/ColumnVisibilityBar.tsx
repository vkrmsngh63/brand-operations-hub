'use client';

// W#2 P-46 Workstream 3 Sessions 1+3 — horizontal bar at the top of the
// Competition Data table combining platform filters + per-column show/hide
// + a text-size stepper. Replaces the left-side PlatformSidebar per §C.3.
//
// Three control groups in one bar:
//   - Platforms — "All Platforms" + the seven supported platforms. Single-
//     select semantics (mirrors the prior sidebar). Selecting one platform
//     scopes the table to that platform; "All" clears the scope.
//   - Columns  — per-column show/hide checkboxes. Multi-select; toggles a
//     column's visibility in the table. Defaults to visible when missing
//     from the prefs map.
//   - Text size (Session 3) — a − / size / + stepper that adjusts the
//     table-wide font size, clamped to FONT_SIZE_MIN..FONT_SIZE_MAX
//     (10..24 per §A.3 + the handler's validator constants).
//
// Owns no state of its own. Parent (CompetitionScrapingViewer) drives
// `selectedPlatform` from the URL query + `columnVisibility` / `fontSize`
// from the fetched UserTablePreferences row + persists changes via the
// shared debounced PUT.

import { PLATFORMS, type Platform } from '@/lib/shared-types/competition-scraping';
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  TABLE_COLUMN_DEFS,
  type ScopeFilter,
} from './url-table-columns';

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

  // P-46 Workstream 3 Session 3 — text-size stepper props.
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function ColumnVisibilityBar({
  selectedPlatform,
  counts,
  loading,
  onSelectPlatform,
  columnVisibility,
  onToggleColumn,
  fontSize,
  onFontSizeChange,
}: Props) {
  const decreaseDisabled = fontSize <= FONT_SIZE_MIN;
  const increaseDisabled = fontSize >= FONT_SIZE_MAX;
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

      <div style={dividerStyle} aria-hidden />

      <div style={fontSizeGroupStyle}>
        <span style={groupLabelStyle}>Text size</span>
        <div
          style={stepperStyle}
          data-testid="font-size-stepper"
          aria-label="Adjust table text size"
        >
          <button
            type="button"
            onClick={() => onFontSizeChange(fontSize - 1)}
            disabled={decreaseDisabled}
            style={stepperButtonStyle(decreaseDisabled)}
            aria-label="Decrease text size"
            title="Smaller"
          >
            −
          </button>
          <span style={stepperValueStyle} aria-live="polite">
            {fontSize}pt
          </span>
          <button
            type="button"
            onClick={() => onFontSizeChange(fontSize + 1)}
            disabled={increaseDisabled}
            style={stepperButtonStyle(increaseDisabled)}
            aria-label="Increase text size"
            title="Larger"
          >
            +
          </button>
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

// Font-size group sits in a narrow column at the far right; it doesn't
// `flex: 1` like Platforms + Columns so the stepper doesn't stretch.
const fontSizeGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: '140px',
};

const stepperStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '2px',
};

function stepperButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: 'transparent',
    border: 'none',
    color: disabled ? '#484f58' : '#c9d1d9',
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '14px',
    width: '24px',
    height: '24px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    borderRadius: '4px',
  };
}

const stepperValueStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#e6edf3',
  fontVariantNumeric: 'tabular-nums',
  minWidth: '36px',
  textAlign: 'center',
};
