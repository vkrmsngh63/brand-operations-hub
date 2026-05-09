'use client';

// W#2 PLOS-side viewer — slice (a.4) per-column filter dropdowns.
//
// Houses the three filter UI primitives used by UrlTable's column-header
// filter popovers — multi-select for vocabulary columns (Product Name /
// Brand Name / Category), min/max numeric range for the two numeric columns
// (Product Stars / # Reviews), and from/to date range for Added On — plus
// the popover shell, the canonical filter-state shape, the URL-query
// serialization helpers, and the row-filtering function the parent uses to
// apply filters before sort.
//
// Filter state is owned by the parent CompetitionScrapingViewer (so the
// active filter set survives a refresh via the URL query). UrlTable receives
// the state + a setter and just renders the per-column trigger + popover.
//
// Columns covered (see slice (a.4) read-back):
//   - Product Name / Brand Name / Category — vocabulary multi-select
//     with a "(blank)" pseudo-row for null-filtering and a
//     search-within-list input.
//   - Product Stars / # Reviews — min/max numeric inputs.
//   - Added On — from/to date inputs (YYYY-MM-DD).
//
// URL column is covered by the free-text search box; Platform column is
// covered by the sidebar; both are out of slice (a.4) scope.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CompetitorUrl } from '@/lib/shared-types/competition-scraping';

// ─── Filter state shape ─────────────────────────────────────────────────

export interface ColumnFiltersState {
  // For multi-select arrays: empty array = no filter; the literal empty
  // string '' as an element means "match rows where this field is null/
  // blank." Non-empty strings match the field's value (case-sensitive,
  // since the values originate from the canonical VocabularyEntry rows).
  productName: string[];
  brandName: string[];
  category: string[];
  // For numeric ranges: null on either side = unbounded on that side.
  // Rows where the field itself is null FAIL whenever any bound is set
  // (a numeric filter implies "I want rows that have a number").
  productStarsMin: number | null;
  productStarsMax: number | null;
  reviewsMin: number | null;
  reviewsMax: number | null;
  // For date range: ISO YYYY-MM-DD strings. Same null-side-unbounded
  // semantics. addedAt is non-nullable on the model so the null-row
  // exclusion concern doesn't apply here.
  addedFrom: string | null;
  addedTo: string | null;
  // P-6 — boolean tri-state filter for the Sponsored Ad column.
  // 'all'   = no filter (every row passes regardless of the flag)
  // 'true'  = only rows where isSponsoredAd === true
  // 'false' = only rows where isSponsoredAd === false
  isSponsoredAd: BooleanTriState;
}

// P-6 — tri-state union shared between the filter state, the URL-query
// serializer, and the BooleanFilter primitive. String type rather than
// `boolean | 'all'` so the URL-query round-trip stays straightforward.
export type BooleanTriState = 'all' | 'true' | 'false';

export const EMPTY_COLUMN_FILTERS: ColumnFiltersState = {
  productName: [],
  brandName: [],
  category: [],
  productStarsMin: null,
  productStarsMax: null,
  reviewsMin: null,
  reviewsMax: null,
  addedFrom: null,
  addedTo: null,
  isSponsoredAd: 'all',
};

export type ColumnFilterKey =
  | 'productName'
  | 'brandName'
  | 'competitionCategory'
  | 'productStarRating'
  | 'numProductReviews'
  | 'addedAt'
  | 'isSponsoredAd';

// Token used in the URL query when the empty-string "(blank)" pseudo-value
// is part of a multi-select. Empty strings can't round-trip through
// URLSearchParams cleanly (`?key=` is an empty value), so we use a sentinel
// chosen to be unlikely to collide with any real vocabulary entry.
const BLANK_TOKEN = '__blank__';

// Whether each filter is currently "active" (applies any narrowing). Used
// for the column-header dot indicator + the toolbar's clear-all visibility.
export function isColumnFilterActive(
  filters: ColumnFiltersState,
  key: ColumnFilterKey
): boolean {
  switch (key) {
    case 'productName':
      return filters.productName.length > 0;
    case 'brandName':
      return filters.brandName.length > 0;
    case 'competitionCategory':
      return filters.category.length > 0;
    case 'productStarRating':
      return filters.productStarsMin !== null || filters.productStarsMax !== null;
    case 'numProductReviews':
      return filters.reviewsMin !== null || filters.reviewsMax !== null;
    case 'addedAt':
      return filters.addedFrom !== null || filters.addedTo !== null;
    case 'isSponsoredAd':
      return filters.isSponsoredAd !== 'all';
  }
}

export function countActiveColumnFilters(filters: ColumnFiltersState): number {
  const keys: ColumnFilterKey[] = [
    'productName',
    'brandName',
    'competitionCategory',
    'productStarRating',
    'numProductReviews',
    'addedAt',
    'isSponsoredAd',
  ];
  return keys.filter((k) => isColumnFilterActive(filters, k)).length;
}

// ─── URL-query serialization ────────────────────────────────────────────

// Read the current filter state from URLSearchParams. Missing or malformed
// entries fall back to EMPTY_COLUMN_FILTERS for that field, so a corrupt
// URL never throws — it just renders an empty filter set.
export function readFiltersFromQuery(
  params: URLSearchParams
): ColumnFiltersState {
  const decodeMulti = (key: string): string[] =>
    params.getAll(key).map((v) => (v === BLANK_TOKEN ? '' : v));

  const decodeNum = (key: string): number | null => {
    const v = params.get(key);
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const decodeDate = (key: string): string | null => {
    const v = params.get(key);
    // Validate shape YYYY-MM-DD; reject anything else so a malformed URL
    // doesn't propagate into the filter UI.
    if (v === null) return null;
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  };

  // P-6 — `?sponsored=true|false`. Anything else (missing / unrecognized)
  // falls back to 'all' so a corrupt URL doesn't trip the filter.
  const decodeTriState = (key: string): BooleanTriState => {
    const v = params.get(key);
    return v === 'true' || v === 'false' ? v : 'all';
  };

  return {
    productName: decodeMulti('productName'),
    brandName: decodeMulti('brandName'),
    category: decodeMulti('category'),
    productStarsMin: decodeNum('starsMin'),
    productStarsMax: decodeNum('starsMax'),
    reviewsMin: decodeNum('reviewsMin'),
    reviewsMax: decodeNum('reviewsMax'),
    addedFrom: decodeDate('addedFrom'),
    addedTo: decodeDate('addedTo'),
    isSponsoredAd: decodeTriState('sponsored'),
  };
}

// Mutate `params` to reflect the given filter state. Called by the parent
// alongside its existing `?platform=` and `?q=` writes. Removes keys whose
// filter is inactive so the URL stays as short as possible.
export function writeFiltersToQuery(
  params: URLSearchParams,
  filters: ColumnFiltersState
): void {
  const writeMulti = (key: string, values: string[]): void => {
    params.delete(key);
    for (const v of values) {
      params.append(key, v === '' ? BLANK_TOKEN : v);
    }
  };
  const writeScalar = (key: string, value: string | number | null): void => {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  };

  writeMulti('productName', filters.productName);
  writeMulti('brandName', filters.brandName);
  writeMulti('category', filters.category);
  writeScalar('starsMin', filters.productStarsMin);
  writeScalar('starsMax', filters.productStarsMax);
  writeScalar('reviewsMin', filters.reviewsMin);
  writeScalar('reviewsMax', filters.reviewsMax);
  writeScalar('addedFrom', filters.addedFrom);
  writeScalar('addedTo', filters.addedTo);
  // P-6 — write only when narrowing; 'all' is the default and stays out of
  // the URL.
  if (filters.isSponsoredAd === 'all') {
    params.delete('sponsored');
  } else {
    params.set('sponsored', filters.isSponsoredAd);
  }
}

// ─── Row-filtering logic ────────────────────────────────────────────────

export function applyColumnFilters(
  rows: CompetitorUrl[],
  filters: ColumnFiltersState
): CompetitorUrl[] {
  return rows.filter((row) => {
    if (!matchMulti(filters.productName, row.productName)) return false;
    if (!matchMulti(filters.brandName, row.brandName)) return false;
    if (!matchMulti(filters.category, row.competitionCategory)) return false;
    if (
      !matchNumber(
        filters.productStarsMin,
        filters.productStarsMax,
        row.productStarRating
      )
    ) {
      return false;
    }
    if (
      !matchNumber(
        filters.reviewsMin,
        filters.reviewsMax,
        row.numProductReviews
      )
    ) {
      return false;
    }
    if (!matchDate(filters.addedFrom, filters.addedTo, row.addedAt)) {
      return false;
    }
    if (!matchBoolean(filters.isSponsoredAd, row.isSponsoredAd)) {
      return false;
    }
    return true;
  });
}

function matchBoolean(
  filter: BooleanTriState,
  rowValue: boolean
): boolean {
  if (filter === 'all') return true;
  return filter === 'true' ? rowValue === true : rowValue === false;
}

function matchMulti(selected: string[], rowValue: string | null): boolean {
  if (selected.length === 0) return true;
  if (rowValue === null || rowValue === '') {
    return selected.includes('');
  }
  return selected.includes(rowValue);
}

function matchNumber(
  min: number | null,
  max: number | null,
  rowValue: number | null
): boolean {
  if (min === null && max === null) return true;
  if (rowValue === null) return false;
  if (min !== null && rowValue < min) return false;
  if (max !== null && rowValue > max) return false;
  return true;
}

function matchDate(
  from: string | null,
  to: string | null,
  rowAddedAt: string
): boolean {
  if (from === null && to === null) return true;
  // CompetitorUrl.addedAt is an ISO timestamp; compare its date part as a
  // YYYY-MM-DD prefix string. localeCompare-equivalent string compare works
  // because YYYY-MM-DD strings sort identically to dates.
  const datePart = rowAddedAt.slice(0, 10);
  if (from !== null && datePart < from) return false;
  if (to !== null && datePart > to) return false;
  return true;
}

// ─── Distinct-values helper (for the multi-select dropdowns) ────────────

export interface DistinctValueSets {
  productName: string[];
  brandName: string[];
  category: string[];
}

// Computes the distinct non-null values for each multi-select column. The
// caller passes the platform-scoped row set (NOT the column-filter-applied
// set) so the dropdown options stay stable regardless of which other
// filters are active. Sort order: case-insensitive locale order.
export function computeDistinctValues(
  rows: CompetitorUrl[]
): DistinctValueSets {
  const productNameSet = new Set<string>();
  const brandNameSet = new Set<string>();
  const categorySet = new Set<string>();
  for (const r of rows) {
    if (r.productName) productNameSet.add(r.productName);
    if (r.brandName) brandNameSet.add(r.brandName);
    if (r.competitionCategory) categorySet.add(r.competitionCategory);
  }
  const sortIt = (s: Set<string>): string[] =>
    [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return {
    productName: sortIt(productNameSet),
    brandName: sortIt(brandNameSet),
    category: sortIt(categorySet),
  };
}

// ─── Popover shell ──────────────────────────────────────────────────────

interface FilterPopoverProps {
  isActive: boolean;
  ariaLabel: string;
  // Render-prop receives a `closePopover` callback so the inner filter UI
  // can dismiss the popover after Apply / Clear.
  renderBody: (closePopover: () => void) => React.ReactNode;
}

// Single column-header filter trigger + popover. Owns its own open state
// + outside-click dismissal; the parent only sees the trigger as a
// per-column atom.
export function FilterPopover({
  isActive,
  ariaLabel,
  renderBody,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  // Viewport-anchored position for the popover. The outer table wrapper
  // uses overflow-x: auto for horizontal scroll, which forces the browser
  // to clip on the y-axis too — so position: absolute popovers get cut off
  // when the table has few rows. Switching to position: fixed with a
  // viewport-anchored top/left (computed at open-time from the trigger
  // button's bounding rect) escapes the parent's clipping context.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const closePopover = (): void => {
    setOpen(false);
    setPos(null);
  };

  // Compute the popover position from the trigger's bounding rect at the
  // moment the user clicks the funnel — anchor below the trigger
  // (top = rect.bottom + 4) and align to the trigger's left edge, clamped
  // so the popover never spills off the right side of the viewport.
  // Done at click-time (not in a useEffect) to avoid the
  // react-hooks/set-state-in-effect lint rule.
  const POPOVER_MIN_WIDTH = 240; // matches popoverStyle.minWidth
  const VIEWPORT_MARGIN = 8;
  const handleTriggerClick = (e: React.MouseEvent): void => {
    // Stop propagation so clicking the filter icon doesn't ALSO toggle
    // the column's sort (the surrounding header label is separately
    // clickable for sort).
    e.stopPropagation();
    if (open) {
      setOpen(false);
      setPos(null);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const maxLeft = window.innerWidth - POPOVER_MIN_WIDTH - VIEWPORT_MARGIN;
      const left = Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft));
      setPos({ top: rect.bottom + 4, left });
    }
    setOpen(true);
  };

  return (
    <span ref={containerRef} style={{ position: 'relative', marginLeft: '6px' }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        title={isActive ? 'Filter active — click to edit' : 'Filter this column'}
        onClick={handleTriggerClick}
        style={triggerStyle(isActive, open)}
      >
        <FunnelIcon />
        {isActive ? <span style={dotStyle} aria-hidden /> : null}
      </button>
      {open && pos !== null ? (
        <div style={{ ...popoverStyle, top: pos.top, left: pos.left }}>
          {renderBody(closePopover)}
        </div>
      ) : null}
    </span>
  );
}

function FunnelIcon() {
  // Simple inline SVG so we don't pull in an icon library for one glyph.
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M1 2h10l-4 4.5v3.5l-2 1V6.5L1 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Multi-select filter (vocabulary columns) ───────────────────────────

interface MultiSelectFilterProps {
  // The full distinct-value set for this column (precomputed by parent;
  // does NOT vary as other filters are applied).
  options: string[];
  selected: string[];
  onCommit: (next: string[]) => void;
  onClose: () => void;
  // True if there are rows in the current platform scope whose value is
  // null/empty — controls whether the "(blank)" pseudo-row is shown.
  hasBlankRows: boolean;
  emptyOptionsLabel: string;
}

export function MultiSelectFilter({
  options,
  selected,
  onCommit,
  onClose,
  hasBlankRows,
  emptyOptionsLabel,
}: MultiSelectFilterProps) {
  const [draft, setDraft] = useState<string[]>(selected);
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const filteredOptions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => o.toLowerCase().includes(needle));
  }, [options, search]);

  const toggle = (value: string): void => {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleApply = (): void => {
    onCommit(draft);
    onClose();
  };

  const handleClear = (): void => {
    setDraft([]);
    onCommit([]);
    onClose();
  };

  const showSearch = options.length > 6;

  return (
    <div style={popoverInnerStyle}>
      {showSearch ? (
        <input
          ref={searchRef}
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search filter options"
          style={searchInputStyle}
        />
      ) : null}

      <div style={optionsListStyle}>
        {hasBlankRows ? (
          <CheckboxRow
            label="(blank)"
            italic
            checked={draft.includes('')}
            onChange={() => toggle('')}
          />
        ) : null}
        {filteredOptions.length === 0 && !hasBlankRows ? (
          <div style={emptyHintStyle}>{emptyOptionsLabel}</div>
        ) : null}
        {filteredOptions.map((opt) => (
          <CheckboxRow
            key={opt}
            label={opt}
            checked={draft.includes(opt)}
            onChange={() => toggle(opt)}
          />
        ))}
      </div>

      <FilterFooter onApply={handleApply} onClear={handleClear} />
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  onChange,
  italic,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  italic?: boolean;
}) {
  return (
    <label style={checkboxRowStyle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginRight: '8px' }}
      />
      <span
        style={{
          fontStyle: italic ? 'italic' : 'normal',
          color: italic ? '#8b949e' : '#c9d1d9',
        }}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Numeric range filter ───────────────────────────────────────────────

interface NumericRangeFilterProps {
  min: number | null;
  max: number | null;
  step?: number;
  inputMin?: number;
  inputMax?: number;
  onCommit: (min: number | null, max: number | null) => void;
  onClose: () => void;
}

export function NumericRangeFilter({
  min,
  max,
  step,
  inputMin,
  inputMax,
  onCommit,
  onClose,
}: NumericRangeFilterProps) {
  const [draftMin, setDraftMin] = useState<string>(min === null ? '' : String(min));
  const [draftMax, setDraftMax] = useState<string>(max === null ? '' : String(max));
  const [error, setError] = useState<string | null>(null);
  const minRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    minRef.current?.focus();
  }, []);

  const parse = (s: string): number | null => {
    const trimmed = s.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : NaN;
  };

  const handleApply = (): void => {
    const parsedMin = parse(draftMin);
    const parsedMax = parse(draftMax);
    if (Number.isNaN(parsedMin) || Number.isNaN(parsedMax)) {
      setError('Enter a valid number, or leave empty.');
      return;
    }
    if (
      parsedMin !== null &&
      parsedMax !== null &&
      parsedMin > parsedMax
    ) {
      setError('Min must be ≤ Max.');
      return;
    }
    setError(null);
    onCommit(parsedMin, parsedMax);
    onClose();
  };

  const handleClear = (): void => {
    setDraftMin('');
    setDraftMax('');
    setError(null);
    onCommit(null, null);
    onClose();
  };

  return (
    <div style={popoverInnerStyle}>
      <div style={rangeRowStyle}>
        <label style={rangeLabelStyle}>
          Min
          <input
            ref={minRef}
            type="number"
            inputMode="decimal"
            value={draftMin}
            step={step}
            min={inputMin}
            max={inputMax}
            onChange={(e) => setDraftMin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            style={rangeInputStyle}
          />
        </label>
        <label style={rangeLabelStyle}>
          Max
          <input
            type="number"
            inputMode="decimal"
            value={draftMax}
            step={step}
            min={inputMin}
            max={inputMax}
            onChange={(e) => setDraftMax(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            style={rangeInputStyle}
          />
        </label>
      </div>
      {error ? <div style={errorHintStyle}>{error}</div> : null}
      <FilterFooter onApply={handleApply} onClear={handleClear} />
    </div>
  );
}

// ─── Date range filter ──────────────────────────────────────────────────

interface DateRangeFilterProps {
  from: string | null;
  to: string | null;
  onCommit: (from: string | null, to: string | null) => void;
  onClose: () => void;
}

export function DateRangeFilter({
  from,
  to,
  onCommit,
  onClose,
}: DateRangeFilterProps) {
  const [draftFrom, setDraftFrom] = useState<string>(from ?? '');
  const [draftTo, setDraftTo] = useState<string>(to ?? '');
  const [error, setError] = useState<string | null>(null);
  const fromRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fromRef.current?.focus();
  }, []);

  const handleApply = (): void => {
    const f = draftFrom.trim() === '' ? null : draftFrom.trim();
    const t = draftTo.trim() === '' ? null : draftTo.trim();
    if (f !== null && !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
      setError('From date must be in YYYY-MM-DD format.');
      return;
    }
    if (t !== null && !/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      setError('To date must be in YYYY-MM-DD format.');
      return;
    }
    if (f !== null && t !== null && f > t) {
      setError('From must be ≤ To.');
      return;
    }
    setError(null);
    onCommit(f, t);
    onClose();
  };

  const handleClear = (): void => {
    setDraftFrom('');
    setDraftTo('');
    setError(null);
    onCommit(null, null);
    onClose();
  };

  return (
    <div style={popoverInnerStyle}>
      <div style={rangeRowStyle}>
        <label style={rangeLabelStyle}>
          From
          <input
            ref={fromRef}
            type="date"
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            style={rangeInputStyle}
          />
        </label>
        <label style={rangeLabelStyle}>
          To
          <input
            type="date"
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            style={rangeInputStyle}
          />
        </label>
      </div>
      {error ? <div style={errorHintStyle}>{error}</div> : null}
      <FilterFooter onApply={handleApply} onClear={handleClear} />
    </div>
  );
}

// ─── Boolean tri-state filter (P-6 — Sponsored Ad column) ───────────────

interface BooleanFilterProps {
  value: BooleanTriState;
  // Labels for the two non-'all' options. Caller passes them so the same
  // primitive can serve future boolean columns without hard-coding
  // "Sponsored only" / "Non-sponsored only" wording.
  trueLabel: string;
  falseLabel: string;
  onCommit: (next: BooleanTriState) => void;
  onClose: () => void;
}

export function BooleanFilter({
  value,
  trueLabel,
  falseLabel,
  onCommit,
  onClose,
}: BooleanFilterProps) {
  const [draft, setDraft] = useState<BooleanTriState>(value);

  const handleApply = (): void => {
    onCommit(draft);
    onClose();
  };

  const handleClear = (): void => {
    setDraft('all');
    onCommit('all');
    onClose();
  };

  return (
    <div style={popoverInnerStyle}>
      <div role="radiogroup" aria-label="Filter mode" style={radioGroupStyle}>
        <RadioRow
          label="All"
          checked={draft === 'all'}
          onChange={() => setDraft('all')}
        />
        <RadioRow
          label={trueLabel}
          checked={draft === 'true'}
          onChange={() => setDraft('true')}
        />
        <RadioRow
          label={falseLabel}
          checked={draft === 'false'}
          onChange={() => setDraft('false')}
        />
      </div>
      <FilterFooter onApply={handleApply} onClear={handleClear} />
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label style={checkboxRowStyle}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        style={{ marginRight: '8px' }}
      />
      <span style={{ color: '#c9d1d9' }}>{label}</span>
    </label>
  );
}

// ─── Footer shared by all filter types ──────────────────────────────────

function FilterFooter({
  onApply,
  onClear,
}: {
  onApply: () => void;
  onClear: () => void;
}) {
  return (
    <div style={footerStyle}>
      <button type="button" onClick={onClear} style={footerLinkStyle}>
        Clear
      </button>
      <button type="button" onClick={onApply} style={applyButtonStyle}>
        Apply
      </button>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

function triggerStyle(active: boolean, open: boolean): React.CSSProperties {
  return {
    position: 'relative',
    background: open ? '#1f3a5f' : 'transparent',
    border: '1px solid',
    borderColor: open ? '#1f6feb' : 'transparent',
    borderRadius: '4px',
    padding: '2px 4px',
    color: active ? '#58a6ff' : '#8b949e',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
    lineHeight: 0,
  };
}

const dotStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0px',
  right: '0px',
  width: '6px',
  height: '6px',
  borderRadius: '3px',
  background: '#58a6ff',
};

// Viewport-anchored (position: fixed) so the popover escapes any
// overflow-clipping context the table wrapper introduces. The actual
// top/left values are computed dynamically in FilterPopover from the
// trigger button's bounding rect at open-time.
const popoverStyle: React.CSSProperties = {
  position: 'fixed',
  background: '#161b22',
  border: '1px solid #30363d',
  borderRadius: '6px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  minWidth: '240px',
  zIndex: 20,
};

const popoverInnerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  gap: '8px',
};

const searchInputStyle: React.CSSProperties = {
  padding: '4px 8px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '12px',
  fontFamily: 'inherit',
};

const optionsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '220px',
  overflowY: 'auto',
};

const checkboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '4px 4px',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  userSelect: 'none',
};

const radioGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const emptyHintStyle: React.CSSProperties = {
  padding: '8px 4px',
  fontSize: '12px',
  color: '#8b949e',
  fontStyle: 'italic',
};

const rangeRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const rangeLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  fontSize: '11px',
  color: '#8b949e',
  gap: '2px',
};

const rangeInputStyle: React.CSSProperties = {
  padding: '4px 8px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '4px',
  color: '#c9d1d9',
  fontSize: '13px',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
};

const errorHintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#f85149',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '4px',
  borderTop: '1px solid #21262d',
};

const footerLinkStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#8b949e',
  fontSize: '12px',
  cursor: 'pointer',
  padding: '4px 6px',
  fontFamily: 'inherit',
};

const applyButtonStyle: React.CSSProperties = {
  background: '#1f6feb',
  border: '1px solid #1f6feb',
  color: 'white',
  fontSize: '12px',
  fontWeight: 600,
  padding: '4px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};
