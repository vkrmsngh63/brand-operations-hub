'use client';

// Shared competition-scraping hover tooltip — a styled message that fades in
// on mouseover/focus to explain what a control does, then (director request
// 2026-05-30-d) AUTO-FADES OUT after a few seconds even while the pointer
// stays on the control, so it never lingers over the table.
//
// Ported from the per-page copy first shipped on the Competitor Reviews
// Analysis page (P-49 W5 Fix Session C FF1/FF3, 2026-05-29). Kept here as a
// single shared component so the Category page + the upcoming Type page reuse
// the exact same behaviour.
//
// Rendered in a PORTAL to document.body with viewport-FIXED positioning
// computed from the trigger's bounding rect on hover — an absolutely-
// positioned version got painted behind adjacent table rows + clipped by the
// table's overflow:auto scroll container. A body portal escapes every ancestor
// stacking context + overflow clip, so the tooltip always shows in full.

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DEFAULT_AUTO_HIDE_MS = 4000;
const FADE_OUT_MS = 200;

export function HoverTooltip({
  text,
  block = false,
  autoHideMs = DEFAULT_AUTO_HIDE_MS,
  children,
}: {
  text: string;
  block?: boolean;
  /** Fade the tooltip out this many ms after it appears, even if the pointer
   *  is still over the trigger. */
  autoHideMs?: number;
  children: React.ReactNode;
}): React.ReactElement {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (unmountTimer.current) {
      clearTimeout(unmountTimer.current);
      unmountTimer.current = null;
    }
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }
  }

  // Start the fade-out (keeps the portal mounted through the opacity
  // transition, then unmounts it). Used by both mouse-leave and the
  // auto-hide timer.
  function beginHide() {
    setVisible(false);
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }
    unmountTimer.current = setTimeout(() => setMounted(false), FADE_OUT_MS);
  }

  function open() {
    const el = triggerRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setPos({ top: r.top, left: r.left + r.width / 2 });
    }
    clearTimers();
    setMounted(true);
    requestAnimationFrame(() => setVisible(true));
    // Auto-dismiss after a few seconds even if the pointer stays put.
    if (autoHideMs > 0) {
      autoHideTimer.current = setTimeout(beginHide, autoHideMs);
    }
  }

  function close() {
    beginHide();
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      style={{
        position: 'relative',
        display: block ? 'block' : 'inline-flex',
        width: block ? '100%' : undefined,
      }}
    >
      {children}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              // Center horizontally on the trigger; sit above it with an
              // 8px gap (the -100% lifts the box fully above the anchor).
              transform: 'translate(-50%, calc(-100% - 8px))',
              width: 'max-content',
              maxWidth: '300px',
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '11px',
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: 'left',
              whiteSpace: 'normal',
              opacity: visible ? 1 : 0,
              transition: 'opacity 160ms ease',
              pointerEvents: 'none',
              zIndex: 2000,
              boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            }}
          >
            {text}
          </span>,
          document.body
        )}
    </span>
  );
}
