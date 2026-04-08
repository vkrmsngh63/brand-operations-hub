'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import ASTTable from './ASTTable';
import MTTable from './MTTable';
import type { MTEntry } from './MTTable';
import TIFTable from './TIFTable';
import CanvasPanel from './CanvasPanel';
import ScrollArrows from './ScrollArrows';
import FloatingPanel from './FloatingPanel';
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
  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    let lastPos = direction === 'horizontal' ? e.clientY : e.clientX;
    function onMove(ev: MouseEvent) {
      const current = direction === 'horizontal' ? ev.clientY : ev.clientX;
      const d = current - lastPos;
      lastPos = current;
      onDrag(d);
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
  const [mtEntries, setMtEntries] = useState<MTEntry[]>([]);
  const [tifActive, setTifActive] = useState(true);

  // ── Panel visibility ─────────────────────────────────────────
  const [showAST, setShowAST] = useState(true);
  const [showMT, setShowMT] = useState(true);
  const [showTIF, setShowTIF] = useState(true);
  const [showCanvas, setShowCanvas] = useState(true);

  // ── Detached panels ──────────────────────────────────────────
  const [detachedAST, setDetachedAST] = useState(false);
  const [detachedMT, setDetachedMT] = useState(false);
  const [detachedTIF, setDetachedTIF] = useState(false);
  const [detachedCanvas, setDetachedCanvas] = useState(false);

  // ── Panel sizes ──────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [panelFlex, setPanelFlex] = useState<[number, number, number]>([1, 1, 1]);
  const [leftFrac, setLeftFrac] = useState(0.58);

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

  // ── Horizontal divider drag ──────────────────────────────────
  function handleHDividerDrag(dividerIdx: number, delta: number) {
    const leftPanel = leftPanelRef.current;
    if (!leftPanel) return;
    const totalH = leftPanel.getBoundingClientRect().height;
    if (totalH <= 0) return;

    setPanelFlex(prev => {
      const next: [number, number, number] = [...prev];
      const totalFlex = next.reduce((a, b) => a + b, 0);
      const deltaFrac = delta / totalH * totalFlex;
      const visiblePanels = [showAST && !detachedAST, showMT && !detachedMT, showTIF && !detachedTIF];
      const upper = dividerIdx;
      const lower = dividerIdx + 1;
      if (!visiblePanels[upper] || !visiblePanels[lower]) return prev;
      next[upper] = Math.max(0.15, next[upper] + deltaFrac);
      next[lower] = Math.max(0.15, next[lower] - deltaFrac);
      return next;
    });
  }

  // ── Vertical divider drag ────────────────────────────────────
  function handleVDividerDrag(delta: number) {
    const container = containerRef.current;
    if (!container) return;
    const totalW = container.getBoundingClientRect().width;
    if (totalW <= 0) return;
    setLeftFrac(prev => Math.max(0.2, Math.min(0.85, prev + delta / totalW)));
  }

  // ── Panel content renderers ──────────────────────────────────
  function renderAST() {
    return (
      <ScrollArrows>
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
      </ScrollArrows>
    );
  }

  function renderMT() {
    return (
      <ScrollArrows>
        <MTTable
          astKeywords={keywords}
          onUpdateKeyword={updateKeyword}
          onAddToTif={addToTif}
        />
      </ScrollArrows>
    );
  }

  function renderTIFContent() {
    return (
      <ScrollArrows>
        <TIFTable
          astKeywords={keywords}
          tifKeywords={tifKeywords}
          onSetTifKeywords={setTifKeywords}
          onUpdateKeyword={updateKeyword}
          tifActive={tifActive}
          onSetTifActive={setTifActive}
        />
      </ScrollArrows>
    );
  }

  function renderCanvasContent() {
    return <CanvasPanel projectId={projectId} />;
  }

  // ── Compute visible inline panels ────────────────────────────
  const inlineAST = showAST && !detachedAST;
  const inlineMT = showMT && !detachedMT;
  const inlineTIF = showTIF && !detachedTIF;
  const inlineCanvas = showCanvas && !detachedCanvas;

  const panelMap: { key: string; flex: number; idx: number }[] = [];
  if (inlineAST) panelMap.push({ key: 'ast', flex: panelFlex[0], idx: 0 });
  if (inlineMT) panelMap.push({ key: 'mt', flex: panelFlex[1], idx: 1 });
  if (inlineTIF) panelMap.push({ key: 'tif', flex: panelFlex[2], idx: 2 });

  const showLeftPanel = panelMap.length > 0;

  return (
    <div className="ws-root">
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div className="ws-topbar">
        <span className="ws-topbar-label">Panels:</span>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showAST} onChange={e => { setShowAST(e.target.checked); if (!e.target.checked) setDetachedAST(false); }} />
          <span>AST</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showMT} onChange={e => { setShowMT(e.target.checked); if (!e.target.checked) setDetachedMT(false); }} />
          <span>MT</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showTIF} onChange={e => { setShowTIF(e.target.checked); if (!e.target.checked) setDetachedTIF(false); }} />
          <span>TIF</span>
        </label>
        <label className="ws-topbar-cb">
          <input type="checkbox" checked={showCanvas} onChange={e => { setShowCanvas(e.target.checked); if (!e.target.checked) setDetachedCanvas(false); }} />
          <span>Canvas</span>
        </label>
      </div>

      {/* ── Main workspace area ───────────────────────────────── */}
      <div className="ws-main" ref={containerRef}>
        {showLeftPanel && (
          <div
            className="ws-left"
            ref={leftPanelRef}
            style={{ flex: inlineCanvas ? `0 0 ${leftFrac * 100}%` : '1' }}
          >
            {panelMap.map((p, i) => (
              <div key={p.key} style={{ display: 'contents' }}>
                {i > 0 && (
                  <Divider
                    direction="horizontal"
                    onDrag={(d) => handleHDividerDrag(panelMap[i - 1].idx, d)}
                  />
                )}
                <div className="ws-panel" style={{ flex: p.flex, minHeight: 0 }}>
                  {/* Detach button */}
                  <button
                    className="ws-detach-btn"
                    onClick={() => {
                      if (p.key === 'ast') setDetachedAST(true);
                      if (p.key === 'mt') setDetachedMT(true);
                      if (p.key === 'tif') setDetachedTIF(true);
                    }}
                    title="Detach to floating window"
                  >⊞</button>
                  {p.key === 'ast' && renderAST()}
                  {p.key === 'mt' && renderMT()}
                  {p.key === 'tif' && renderTIFContent()}
                </div>
              </div>
            ))}
          </div>
        )}

        {showLeftPanel && inlineCanvas && (
          <Divider direction="vertical" onDrag={handleVDividerDrag} />
        )}

        {inlineCanvas && (
          <div className="ws-right" style={{ flex: showLeftPanel ? undefined : 1 }}>
            <div className="ws-panel" style={{ flex: 1 }}>
              <button
                className="ws-detach-btn"
                onClick={() => setDetachedCanvas(true)}
                title="Detach to floating window"
              >⊞</button>
              {renderCanvasContent()}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating overlays for detached panels ─────────────── */}
      {detachedAST && showAST && (
        <FloatingPanel title="All Search Terms" onClose={() => setDetachedAST(false)}>
          {renderAST()}
        </FloatingPanel>
      )}
      {detachedMT && showMT && (
        <FloatingPanel title="Main Terms" onClose={() => setDetachedMT(false)}>
          {renderMT()}
        </FloatingPanel>
      )}
      {detachedTIF && showTIF && (
        <FloatingPanel title="Terms In Focus" onClose={() => setDetachedTIF(false)}>
          {renderTIFContent()}
        </FloatingPanel>
      )}
      {detachedCanvas && showCanvas && (
        <FloatingPanel title="Topics Layout Canvas" onClose={() => setDetachedCanvas(false)}>
          {renderCanvasContent()}
        </FloatingPanel>
      )}
    </div>
  );
}
