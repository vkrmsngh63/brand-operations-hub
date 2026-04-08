'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import './floating-panel.css';

interface FloatingPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function FloatingPanel({ title, onClose, children }: FloatingPanelProps) {
  const [pos, setPos] = useState({ x: 60, y: 40 });
  const [size, setSize] = useState({ w: Math.min(window.innerWidth - 120, 1100), h: Math.min(window.innerHeight - 80, 700) });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number; origX: number; origY: number; edge: string } | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Drag by header ────────────────────────────────────────────
  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      setPos({
        x: Math.max(0, dragRef.current.origX + ev.clientX - dragRef.current.startX),
        y: Math.max(0, dragRef.current.origY + ev.clientY - dragRef.current.startY),
      });
    }
    function onUp() {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  }

  // ── Resize from edges ─────────────────────────────────────────
  function handleResizeStart(e: React.MouseEvent, edge: string) {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      startX: e.clientX, startY: e.clientY,
      origW: size.w, origH: size.h,
      origX: pos.x, origY: pos.y,
      edge,
    };
    function onMove(ev: MouseEvent) {
      if (!resizeRef.current) return;
      const r = resizeRef.current;
      const dx = ev.clientX - r.startX;
      const dy = ev.clientY - r.startY;
      let newW = r.origW, newH = r.origH, newX = r.origX, newY = r.origY;
      if (r.edge.includes('e')) newW = Math.max(320, r.origW + dx);
      if (r.edge.includes('w')) { newW = Math.max(320, r.origW - dx); newX = r.origX + dx; }
      if (r.edge.includes('s')) newH = Math.max(200, r.origH + dy);
      if (r.edge.includes('n')) { newH = Math.max(200, r.origH - dy); newY = r.origY + dy; }
      setSize({ w: newW, h: newH });
      setPos({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
    function onUp() {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.userSelect = 'none';
  }

  return (
    <div className="fp-backdrop">
      <div
        ref={panelRef}
        className="fp-panel"
        style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
      >
        {/* Header (draggable) */}
        <div className="fp-header" onMouseDown={handleDragStart}>
          <span className="fp-title">⊞ {title}</span>
          <button className="fp-close" onClick={onClose} title="Close overlay (Escape)">✕</button>
        </div>

        {/* Content */}
        <div className="fp-content">
          {children}
        </div>

        {/* Resize handles */}
        <div className="fp-resize fp-resize-n" onMouseDown={e => handleResizeStart(e, 'n')} />
        <div className="fp-resize fp-resize-s" onMouseDown={e => handleResizeStart(e, 's')} />
        <div className="fp-resize fp-resize-e" onMouseDown={e => handleResizeStart(e, 'e')} />
        <div className="fp-resize fp-resize-w" onMouseDown={e => handleResizeStart(e, 'w')} />
        <div className="fp-resize fp-resize-ne" onMouseDown={e => handleResizeStart(e, 'ne')} />
        <div className="fp-resize fp-resize-nw" onMouseDown={e => handleResizeStart(e, 'nw')} />
        <div className="fp-resize fp-resize-se" onMouseDown={e => handleResizeStart(e, 'se')} />
        <div className="fp-resize fp-resize-sw" onMouseDown={e => handleResizeStart(e, 'sw')} />
      </div>
    </div>
  );
}
