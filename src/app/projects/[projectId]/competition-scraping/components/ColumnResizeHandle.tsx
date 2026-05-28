'use client';

// W#2 P-46 Workstream 3 Session 3 — drag handle on the right edge of every
// column header. Owns its own in-drag width state so the table re-renders
// the new width on every pointermove tick; commits the final width to the
// parent on pointerup. Caller clamps to its own MIN/MAX bounds via
// passing the clamped value through `onCommit`.
//
// 2026-05-24 fix-forward (Issue 1) — drag-zone height now spans the full
// measured table height (passed in by parent via ResizeObserver) instead
// of being clipped to the header cell. Visual column line (faint vertical
// stroke) is rendered full-height too so users see where the columns are
// before reaching for the handle.
//
// 2026-05-29 Fix Session A FF — extracted from UrlTable.tsx so both the
// Competitor URLs table AND the Reviews Analysis Table share the
// implementation. Behavior unchanged from the original UrlTable-local
// copy.

import { useState } from 'react';

export interface ColumnResizeHandleProps {
  columnId: string;
  currentWidth: number;
  minWidth: number;
  maxWidth: number;
  tableHeight: number;
  onCommit: (width: number) => void;
  // 2026-05-29 FF3 (Reviews Analysis Table) — toggle the faint vertical
  // line the handle draws when NOT actively dragging. The Competitor
  // URLs sibling table keeps the line (default `true`) since each row
  // is single-line and the line aligns perfectly with the URL row's
  // column edges. The Reviews Analysis Table sets this `false` because
  // its expanded sub-rows (per-competitor banner + per-review list)
  // don't share the URL row's column structure — a full-height line
  // would visually bleed across those sub-rows into the summary area
  // (director report round-3 verification). Drag affordance is still
  // there via cursor:col-resize on hover; the line itself just isn't
  // painted at rest.
  showRestingLine?: boolean;
}

export function ColumnResizeHandle({
  columnId,
  currentWidth,
  minWidth,
  maxWidth,
  tableHeight,
  onCommit,
  showRestingLine = true,
}: ColumnResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = currentWidth;
    setIsDragging(true);

    let latestWidth = startWidth;
    const onMove = (ev: PointerEvent): void => {
      const delta = ev.clientX - startX;
      const next = Math.max(
        minWidth,
        Math.min(maxWidth, Math.round(startWidth + delta))
      );
      latestWidth = next;
      // Optimistic: commit on every move so the colgroup width updates
      // live as the user drags. The parent's debounced PUT coalesces the
      // burst into one network write on idle.
      onCommit(next);
    };
    const onUp = (): void => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      // Final commit — guarantees the last value lands even if the
      // browser drops the last pointermove.
      onCommit(latestWidth);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // height: tableHeight on the handle = full table height. Without this,
  // height:100% would only span the th. tableHeight 0 (before the
  // ResizeObserver has fired) falls back to a safe default so the handle
  // still works on the first paint.
  const effectiveHeight = tableHeight > 0 ? tableHeight : 200;

  return (
    <div
      role="separator"
      aria-label={`Resize ${columnId} column`}
      aria-orientation="vertical"
      data-testid="column-resize-handle"
      onPointerDown={onPointerDown}
      style={resizeHandleStyle(isDragging, effectiveHeight, showRestingLine)}
    />
  );
}

function resizeHandleStyle(
  isDragging: boolean,
  fullHeight: number,
  showRestingLine: boolean
): React.CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '6px',
    /* 2026-05-24 fix-forward (Issue 1) — extend the drag zone past the
       header all the way down. The handle is rendered inside the <th>
       which has position:relative, so an explicit pixel height drawn
       from the parent's ResizeObserver bleeds beyond the th's box. */
    height: `${fullHeight}px`,
    cursor: 'col-resize',
    /* Faint full-height column line visible by default; suppressed via
       showRestingLine={false} on consumers (Reviews Analysis Table)
       whose expanded sub-rows would visually conflict with a full-
       height line. Turns solid blue while actively dragging in either
       case so the user gets clear in-drag feedback. */
    borderRight: isDragging
      ? '2px solid #1f6feb'
      : showRestingLine
        ? '1px solid #21262d'
        : 'none',
    background: isDragging ? 'rgba(31, 111, 235, 0.15)' : 'transparent',
    touchAction: 'none',
    transition: 'background 80ms ease-in-out',
    /* Render above the sticky <thead> (zIndex 3) so the handle is grabbable
       within the header strip too — not just from below it. Still below
       modals + popovers. */
    zIndex: 4,
  };
}
