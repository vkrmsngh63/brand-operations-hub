'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import './scroll-arrows.css';

interface ScrollArrowsProps {
  children: React.ReactNode;
}

export default function ScrollArrows({ children }: ScrollArrowsProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollElRef = useRef<HTMLElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const check = useCallback(() => {
    const el = scrollElRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 2);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Find the first horizontally scrollable descendant (the frame div)
    function findScrollable(): HTMLElement | null {
      const candidates = wrap!.querySelectorAll('[class*="-frame"]');
      for (const c of Array.from(candidates)) {
        const el = c as HTMLElement;
        const style = getComputedStyle(el);
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
          return el;
        }
      }
      return null;
    }

    const el = findScrollable();
    scrollElRef.current = el;
    if (!el) return;

    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
      mo.disconnect();
    };
  }, [check]);

  function scrollBy(delta: number) {
    scrollElRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }

  return (
    <div ref={wrapRef} className="sa-wrap">
      {showLeft && (
        <button className="sa-btn sa-btn-left" onClick={() => scrollBy(-150)} title="Scroll left">◀</button>
      )}
      <div className="sa-inner">
        {children}
      </div>
      {showRight && (
        <button className="sa-btn sa-btn-right" onClick={() => scrollBy(150)} title="Scroll right">▶</button>
      )}
    </div>
  );
}
