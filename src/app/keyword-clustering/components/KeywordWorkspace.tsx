'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import ASTTable from './ASTTable';
import MTTable from './MTTable';
import TIFTable from './TIFTable';
import { useKeywords } from '@/hooks/useKeywords';
import './workspace.css';

interface KeywordWorkspaceProps {
  projectId: string;
  userId: string;
}

// ── Draggable divider (horizontal or vertical) ─────────────────
function Divider({ direction, onDrag }: {
  direction: 'horizontal' | 'vertical';
  onDrag: (delta: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const startPos = direction === 'horizontal' ? e.clientY : e.clientX;
    function onMove(ev: MouseEvent) {
      const current = direction === 'horizontal' ? ev.clientY : ev.clientX;
      onDrag(current - startPos);
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = direction === 'horizontal' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  }

  return (
    <div
      ref={ref}
      className={`ws-divider ws-divider-${direction}`}
      onMouseDown={handleMouseDown}
    />
  );
}

export default function KeywordWorkspace({ projectId, userId }: KeywordWorkspaceProps) {
  const {
    keywords, loading, fetchKeywords, addKeyword, bulkImport,
    updateKeyword, batchUpdate, deleteKeyword, bulkDelete, reorder,
  } = useKeywords(projectId, userId);

  const [tifKeywords, setTifKeywords] = useState<string[]>([]);
  const [tifActive, setTifActive] = useState(true);

  // ── Panel visibility ─────────────────────────────────────────
  const [showAST, setShowAST] = useState(true);
  const [showMT, setShowMT] = useState(true);
  const [showTIF, setShowTIF] = useState(true);
  const [showCanvas, setShowCanvas] = useState(true);

  // ── Panel sizes (flex basis in px; null = auto/equal) ────────
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  // Horizontal panel heights (AST, MT, TIF) as fractions of left panel
  const [panelFlex, setPanelFlex] = useState<[number, number, number]>([1, 1, 1]);
  // Vertical split: left panel width fraction (0-1)
  const [leftFrac, setLeftFrac] = useState(0.58);

  // ── Divider drag refs (track start sizes) ────────────────────
  const hDragRef = useRef<{ idx: number; startFlex: [number, number, number]; startY: number; totalH: number } | null>(null);
  const vDragRef = useRef<{ startFrac: number; startX: number; totalW: number } | null>(null);

  const addToTif = useCallback((kws: string[]) => {
    if (!tifActive) return;
    setTifKeywords(prev => {
      const existing = new Set(prev);
      const toAdd = kws.filter(kw => !existing.has(kw));
      if (toAdd.length === 0) return prev;
      return [...toAdd.reverse(), ...prev];
    });
  }, [tifActive]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

  // ── Horizontal divider drag (between AST↔MT or MT↔TIF) ──────
  function handleHDividerDrag(dividerIdx: number, delta: number) {
    const leftPanel = leftPanelRef.current;
    if (!leftPanel) return;
    const totalH = leftPanel.getBoundingClientRect().height;
    if (totalH <= 0) return;

    setPanelFlex(prev => {
      const next: [number, number, number] = [...prev];
      const totalFlex = next.reduce((a, b) => a + b, 0);
      const deltaFrac = delta / totalH * totalFlex;

      // dividerIdx 0 = between AST(0) and MT(1)
      // dividerIdx 1 = between MT(1) and TIF(2)
      const upper = dividerIdx;
      const lower = dividerIdx + 1;

      // Account for hidden panels
      const visiblePanels = [showAST, showMT, showTIF];
      if (!visiblePanels[upper] || !visiblePanels[lower]) return prev;

      next[upper] = Math.max(0.15, next[upper] + deltaFrac);
      next[lower] = Math.max(0.15, next[lower] - deltaFrac);

      return next;
    });
  }

  // Refs for continuous drag
  const hDragDeltaRef = useRef(0);
  function makeHDragHandler(dividerIdx: number) {
    return (delta: number) => {
      const actual = delta - hDragDeltaRef.current;
      hDragDeltaRef.current = delta;
      handleHDividerDrag(dividerIdx, actual);
    };
  }

  // ── Vertical divider drag (left panel ↔ canvas) ─────────────
  function handleVDividerDrag(delta: number) {
    const container = containerRef.current;
    if (!container) return;
    const totalW = container.getBoundingClientRect().width;
    if (totalW <= 0) return;

    setLeftFrac(prev => {
      const next = prev + delta / totalW;
      return Math.max(0.2, Math.min(0.85, next));
    });
  }

  const vDragDeltaRef = useRef(0);
  function makeVDragHandler() {
    return (delta: number) => {
      const actual = delta - vDragDeltaRef.current;
      vDragDeltaRef.current = delta;
      handleVDividerDrag(actual);
    };
  }

  // Reset drag delta refs on mousedown (handled inside Divider onMouseDown)
  // We wrap Divider's onDrag to reset on first call
  function wrapHDrag(dividerIdx: number) {
    let first = true;
    return (delta: number) => {
      if (first) { hDragDeltaRef.current = 0; first = false; }
      const actual = delta - hDragDeltaRef.current;
      hDragDeltaRef.current = delta;
      handleHDividerDrag(dividerIdx, actual);
    };
  }

  function wrapVDrag() {
    let first = true;
    return (delta: number) => {
      if (first) { vDragDeltaRef.current = 0; first = false; }
      const actual = delta - vDragDeltaRef.current;
      vDragDeltaRef.current = delta;
      handleVDividerDrag(actual);
    };
  }

  // ── Compute visible panels ───────────────────────────────────
  const visibleLeft = [showAST, showMT, showTIF];
  const leftPanelCount = visibleLeft.filter(Boolean).length;
  const showLeftPanel = leftPanelCount > 0;

  // Build flex values for visible panels only
  const panelMap: { key: string; flex: number; idx: number }[] = [];
  if (showAST) panelMap.push({ key: 'ast', flex: panelFlex[0], idx: 0 });
  if (showMT) panelMap.push({ key: 'mt', flex: panelFlex[1], idx: 1 });
  if (showTIF) panelMap.push({ key: 'tif', flex: panelFlex[2], idx: 2 });

  return (
    <div className="ws-root">
      {/* ── Topbar with panel visibility checkboxes ───────────── */}
      <div className="ws-topbar">
        <span className="ws-topbar-label">Panels:</span>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showAST} onChange={e => setShowAST(e.target.checked)} />
          <span>AST</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showMT} onChange={e => setShowMT(e.target.checked)} />
          <span>MT</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showTIF} onChange={e => setShowTIF(e.target.checked)} />
          <span>TIF</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showCanvas} onChange={e => setShowCanvas(e.target.checked)} />
          <span>Canvas</span>
        </label>
      </div>

      {/* ── Main workspace area ───────────────────────────────── */}
      <div className="ws-main" ref={containerRef}>
        {/* Left panel: AST + MT + TIF stacked */}
        {showLeftPanel && (
          <div
            className="ws-left"
            ref={leftPanelRef}
            style={{ flex: showCanvas ? `0 0 ${leftFrac * 100}%` : '1' }}
          >
            {panelMap.map((p, i) => (
              <div key={p.key} style={{ display: 'contents' }}>
                {/* Divider between panels (not before the first one) */}
                {i > 0 && (
                  <Divider
                    direction="horizontal"
                    onDrag={wrapHDrag(
                      // Find which original indices are adjacent
                      panelMap[i - 1].idx < p.idx
                        ? panelMap[i - 1].idx
                        : p.idx
                    )}
                  />
                )}
                <div
                  className="ws-panel"
                  style={{ flex: p.flex, minHeight: 0 }}
                >
                  {p.key === 'ast' && (
                    <ASTTable
                      keywords={keywords}
                      onAddKeyword={addKeyword}
                      onBulkImport={bulkImport}
                      onUpdateKeyword={updateKeyword}
                      onBatchUpdate={batchUpdate}
                      onDeleteKeyword={deleteKeyword}
                      onBulkDelete={bulkDelete}
                      onReorder={reorder}
                      loading={loading}
                      onAddToTif={addToTif}
                    />
                  )}
                  {p.key === 'mt' && (
                    <MTTable
                      astKeywords={keywords}
                      onUpdateKeyword={updateKeyword}
                      onAddToTif={addToTif}
                    />
                  )}
                  {p.key === 'tif' && (
                    <TIFTable
                      astKeywords={keywords}
                      tifKeywords={tifKeywords}
                      onSetTifKeywords={setTifKeywords}
                      onUpdateKeyword={updateKeyword}
                      tifActive={tifActive}
                      onSetTifActive={setTifActive}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vertical divider between left panel and canvas */}
        {showLeftPanel && showCanvas && (
          <Divider direction="vertical" onDrag={wrapVDrag()} />
        )}

        {/* Right panel: Canvas placeholder */}
        {showCanvas && (
          <div className="ws-right" style={{ flex: showLeftPanel ? undefined : 1 }}>
            <div className="ws-canvas-placeholder">
              Topics Layout Canvas — coming in Phase 1d
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
