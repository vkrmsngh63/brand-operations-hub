'use client';

// W#2 P-46 Workstream 3 Sessions 1+3 — horizontal bar at the top of the
// Competition Data table combining platform filters + per-column show/hide.
// Replaces the left-side PlatformSidebar per §C.3.
//
// 2026-05-24 fix-forward — Issue 5: Platform chips become a true MULTI-SELECT.
// Earlier shape was "All Platforms XOR a single platform" (mutually exclusive
// chips). Director's directive: "fix this so that if the user wants to see any
// combination of platforms together, they should be able to." New semantics:
//   - 7 individual platform checkboxes — independently togglable.
//   - "All Platforms" checkbox = select-all / deselect-all toggle that mirrors
//     the state of the 7 individuals (Gmail inbox-header pattern). When all 7
//     are checked → All Platforms shows checked. When 1-6 are checked →
//     indeterminate (visual dash). When 0 are checked → unchecked + the
//     consumer renders the empty-state hint.
//   - Toggling "All Platforms" sets every individual to true or false in one
//     shot.
//
// 2026-05-24 fix-forward — Issue 4: Text-size stepper REMOVED from this bar.
// Director's directive: "Just put the +/- symbols at the top right of the
// data table because only that data needs to be adjusted in font size."
// The stepper now lives inside UrlTable's toolbar row instead.

import { useEffect, useRef } from 'react';
import { PLATFORMS, type Platform } from '@/lib/shared-types/competition-scraping';
import { PLATFORM_LABELS, TABLE_COLUMN_DEFS } from './url-table-columns';

interface Props {
  // Set of platforms currently visible in the table. Empty array → none
  // selected (consumer renders empty state). Length === PLATFORMS.length
  // → All Platforms shows checked.
  selectedPlatforms: Platform[];
  // Per-platform row counts for the chips' count badges. Null while the
  // initial URL list is still loading.
  countsByPlatform: Record<Platform, number> | null;
  totalCount: number | null;
  loading: boolean;
  onTogglePlatform: (platform: Platform, next: boolean) => void;
  onSelectAllPlatforms: (next: boolean) => void;

  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

export function ColumnVisibilityBar({
  selectedPlatforms,
  countsByPlatform,
  totalCount,
  loading,
  onTogglePlatform,
  onSelectAllPlatforms,
  columnVisibility,
  onToggleColumn,
}: Props) {
  const allChecked = selectedPlatforms.length === PLATFORMS.length;
  const someChecked = selectedPlatforms.length > 0 && !allChecked;

  // Native checkbox indeterminate is a JS-only property; reflect the
  // "some but not all" state through the DOM after each render.
  const allRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <div
      aria-label="Platform and column controls"
      style={barStyle}
      data-testid="column-visibility-bar"
    >
      <div style={groupStyle}>
        <span style={groupLabelStyle}>Platforms</span>
        <div style={chipRowStyle}>
          <label style={chipStyle(allChecked)} title="Select or clear all platforms">
            <input
              ref={allRef}
              type="checkbox"
              checked={allChecked}
              onChange={() => onSelectAllPlatforms(!allChecked)}
              style={checkboxStyle}
              aria-label="Select all platforms"
              data-testid="platform-chip-all"
            />
            <span>All Platforms</span>
            <span style={countBadgeStyle}>
              {loading || totalCount === null ? '…' : totalCount}
            </span>
          </label>
          {PLATFORMS.map((platform) => {
            const label = PLATFORM_LABELS[platform];
            const checked = selectedPlatforms.includes(platform);
            const count =
              loading || !countsByPlatform ? null : countsByPlatform[platform];
            return (
              <label
                key={platform}
                style={chipStyle(checked)}
                title={`Show or hide ${label} rows`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTogglePlatform(platform, !checked)}
                  style={checkboxStyle}
                  aria-label={`Show ${label} rows`}
                  data-testid={`platform-chip-${platform}`}
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
