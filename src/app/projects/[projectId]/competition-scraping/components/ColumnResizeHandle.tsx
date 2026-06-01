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
    setIsDragging(true);

    const clamp = (w: number): number =>
      Math.max(minWidth, Math.min(maxWidth, Math.round(w)));

    // P-54 Phase 2 FF2 (2026-06-01) — width is tracked incrementally in
    // DOCUMENT space (clientX + window.scrollX) rather than pure viewport
    // space, so that when the page auto-scrolls horizontally during the drag
    // (the RAF edge-scroll below), the new scroll offset keeps feeding into
    // the width. Director directive: dragging a column's right edge should be
    // able to go "as far to the right as needed" with the horizontal page
    // scroll following along, instead of stalling at the viewport's right edge
    // (the prior pure-clientX delta capped the drag at the visible edge).
    let targetWidth = currentWidth;
    let lastDocX = e.clientX + window.scrollX;
    let lastClientX = e.clientX;
    let rafId = 0;

    const applyPointer = (clientX: number): void => {
      const docX = clientX + window.scrollX;
      targetWidth = clamp(targetWidth + (docX - lastDocX));
      lastDocX = docX;
      lastClientX = clientX;
      // Optimistic: commit on every move so the colgroup width updates live
      // as the user drags. The parent's debounced PUT coalesces the burst
      // into one network write on idle.
      onCommit(targetWidth);
    };

    // Distance from the viewport's right edge (px) that triggers auto-scroll,
    // and the per-frame grow/scroll step.
    const EDGE_ZONE = 80;
    const STEP = 18;

    const tick = (): void => {
      if (
        window.innerWidth - lastClientX < EDGE_ZONE &&
        targetWidth < maxWidth
      ) {
        // Grow the column by one step FIRST — widening the table extends the
        // document's scrollable width, creating room to scroll into (without
        // this, scrollBy is a no-op when already at the current max scroll, so
        // the drag would deadlock). Then scroll to follow and resync the
        // baseline to the ACTUAL post-scroll position so subsequent pointer
        // deltas aren't double-counted.
        targetWidth = clamp(targetWidth + STEP);
        onCommit(targetWidth);
        window.scrollBy({ left: STEP });
        lastDocX = lastClientX + window.scrollX;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const onMove = (ev: PointerEvent): void => {
      applyPointer(ev.clientX);
    };
    const onUp = (): void => {
      setIsDragging(false);
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      // Final commit — guarantees the last value lands even if the browser
      // drops the last pointermove.
      onCommit(targetWidth);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    rafId = window.requestAnimationFrame(tick);
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
