'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvas, CanvasNode } from '@/hooks/useCanvas';
import CanvasEditPanel from './CanvasEditPanel';
import type { Keyword } from '@/hooks/useKeywords';
import './canvas-panel.css';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const NODE_W = 220;
const NODE_H = 120;
const ELBOW_GAP = 40;
const NESTED_INDENT = 30;
const ACCENT_W = 5;
const CORNER_R = 6;
const PATHWAY_COLORS = [
  '#3b82f6', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
];

interface CanvasPanelProps {
  projectId: string;
  allKeywords?: Keyword[];
}

export default function CanvasPanel({ projectId, allKeywords = [] }: CanvasPanelProps) {
  const {
    nodes, canvasState, sisterLinks, fetchCanvas,
    addNode, updateNodes, deleteNode, updateCanvasState,
  } = useCanvas(projectId);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const [dragNodeId, setDragNodeId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId: number } | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const [editPanelNodeId, setEditPanelNodeId] = useState<number | null>(null);

  /* ── Hover popover state ─────────────────────────────────────── */
  const [hoverNodeId, setHoverNodeId] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [linkMode, setLinkMode] = useState<'linear' | 'nested' | null>(null);
  const [linkSource, setLinkSource] = useState<number | null>(null);

  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }

  useEffect(() => { fetchCanvas(); }, [fetchCanvas]);

  useEffect(() => {
    if (canvasState) {
      setViewX(canvasState.viewX);
      setViewY(canvasState.viewY);
      setZoom(canvasState.zoom);
    }
  }, [canvasState]);

  const viewSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveViewport = useCallback((vx: number, vy: number, z: number) => {
    if (viewSaveTimer.current) clearTimeout(viewSaveTimer.current);
    viewSaveTimer.current = setTimeout(() => {
      updateCanvasState({ viewX: vx, viewY: vy, zoom: z });
    }, 500);
  }, [updateCanvasState]);

  function screenToCanvas(sx: number, sy: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (sx - rect.left) / zoom + viewX,
      y: (sy - rect.top) / zoom + viewY,
    };
  }

  function handleBgMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('.cvs-node-group')) return;
    if (linkMode) { setLinkMode(null); setLinkSource(null); showToast('Link cancelled'); return; }
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewX, vy: viewY };
    setCtxMenu(null); setSelectedId(null); setEditPanelNodeId(null);
    e.preventDefault();
  }

  useEffect(() => {
    if (!isPanning) return;
    function onMove(e: MouseEvent) {
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      setViewX(panStart.current.vx - dx);
      setViewY(panStart.current.vy - dy);
    }
    function onUp(e: MouseEvent) {
      setIsPanning(false);
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      const nvx = panStart.current.vx - dx;
      const nvy = panStart.current.vy - dy;
      saveViewport(nvx, nvy, zoom);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isPanning, zoom, saveViewport]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = (e.clientX - rect.left) / zoom + viewX;
      const my = (e.clientY - rect.top) / zoom + viewY;
      const nvx = mx - (e.clientX - rect.left) / newZoom;
      const nvy = my - (e.clientY - rect.top) / newZoom;
      setViewX(nvx); setViewY(nvy); setZoom(newZoom); saveViewport(nvx, nvy, newZoom);
    } else { setZoom(newZoom); saveViewport(viewX, viewY, newZoom); }
  }

  function isDescendant(nodeId: number, ancestorId: number): boolean {
    let current = nodes.find(n => n.id === nodeId);
    while (current && current.parentId !== null) {
      if (current.parentId === ancestorId) return true;
      current = nodes.find(n => n.id === current!.parentId);
    }
    return false;
  }

  function handleLinkClick(nodeId: number) {
    if (!linkMode) return;
    if (linkSource === null) {
      setLinkSource(nodeId); setSelectedId(nodeId);
      showToast(`Now click the ${linkMode === 'nested' ? 'child' : 'second'} node`);
      return;
    }
    if (nodeId === linkSource) { showToast('Cannot link a node to itself'); return; }
    if (isDescendant(linkSource, nodeId)) {
      showToast('Cannot create circular link'); setLinkMode(null); setLinkSource(null); return;
    }
    if (linkMode === 'nested') {
      updateNodes([{ id: nodeId, parentId: linkSource, relationshipType: 'nested' } as Partial<CanvasNode>]);
      showToast('\u2713 Parent\u2192Child link created');
    } else {
      updateNodes([{ id: nodeId, parentId: linkSource, relationshipType: 'linear' } as Partial<CanvasNode>]);
      showToast('\u2713 Parent\u2192Parent link created');
    }
    setLinkMode(null); setLinkSource(null);
  }

  function handleDetachNode() {
    if (selectedId === null) { showToast('Select a node first'); return; }
    const node = nodes.find(n => n.id === selectedId);
    if (!node || node.parentId === null) { showToast('Node has no parent to detach from'); return; }
    updateNodes([{ id: selectedId, parentId: null, relationshipType: '' } as Partial<CanvasNode>]);
    showToast('\u2713 Node detached from parent');
  }

  function handleNodeMouseDown(e: React.MouseEvent, nodeId: number) {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (linkMode) { handleLinkClick(nodeId); return; }
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragNodeId(nodeId);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
    dragMoved.current = false;
    setSelectedId(nodeId); setEditPanelNodeId(nodeId); setCtxMenu(null);
  }

  useEffect(() => {
    if (dragNodeId === null) return;
    function onMove(e: MouseEvent) {
      dragMoved.current = true;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const idx = nodes.findIndex(n => n.id === dragNodeId);
      if (idx >= 0) {
        nodes[idx] = { ...nodes[idx], x: pos.x - dragOffset.x, y: pos.y - dragOffset.y };
        forceUpdate();
      }
    }
    function onUp() {
      if (dragMoved.current && dragNodeId !== null) {
        const node = nodes.find(n => n.id === dragNodeId);
        if (node) updateNodes([{ id: dragNodeId, x: node.x, y: node.y } as Partial<CanvasNode>]);
      }
      setDragNodeId(null);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragNodeId]);

  const [, setTick] = useState(0);
  function forceUpdate() { setTick(t => t + 1); }

  function handleNodeContextMenu(e: React.MouseEvent, nodeId: number) {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId }); setSelectedId(nodeId);
  }

  function handleDeleteNode() {
    if (ctxMenu) {
      const ch = nodes.filter(n => n.parentId === ctxMenu.nodeId).map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
      if (ch.length > 0) updateNodes(ch as Partial<CanvasNode>[]);
      deleteNode(ctxMenu.nodeId);
      if (editPanelNodeId === ctxMenu.nodeId) setEditPanelNodeId(null);
      setCtxMenu(null); setSelectedId(null);
    }
  }

  function handleCtxDetach() {
    if (ctxMenu) {
      const node = nodes.find(n => n.id === ctxMenu.nodeId);
      if (node && node.parentId !== null) {
        updateNodes([{ id: ctxMenu.nodeId, parentId: null, relationshipType: '' } as Partial<CanvasNode>]);
        showToast('\u2713 Node detached from parent');
      } else { showToast('Node has no parent'); }
      setCtxMenu(null);
    }
  }

  function handleNodeDblClick(nodeId: number) {
    if (linkMode) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditingId(nodeId); setEditVal(node.title);
  }

  function commitEdit() {
    if (editingId !== null) {
      updateNodes([{ id: editingId, title: editVal } as Partial<CanvasNode>]);
      setEditingId(null);
    }
  }

  function handleEditPanelSave(updates: Partial<CanvasNode>) { updateNodes([updates]); }

  async function handleAddNode() {
    const rect = svgRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2) / zoom + viewX - NODE_W / 2 : viewX;
    const cy = rect ? (rect.height / 2) / zoom + viewY - NODE_H / 2 : viewY;
    const newNode = await addNode({ x: cx, y: cy, w: NODE_W, h: NODE_H, title: 'New Topic' });
    if (newNode) { setSelectedId(newNode.id); setEditPanelNodeId(newNode.id); }
  }

  function zoomIn() { const nz = Math.min(MAX_ZOOM, zoom * 1.2); setZoom(nz); saveViewport(viewX, viewY, nz); }
  function zoomOut() { const nz = Math.max(MIN_ZOOM, zoom / 1.2); setZoom(nz); saveViewport(viewX, viewY, nz); }
  function resetView() { setViewX(0); setViewY(0); setZoom(1); saveViewport(0, 0, 1); }
  function fitToScreen() {
    if (nodes.length === 0) { resetView(); return; }
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h); });
    const pad = 60; const bw = maxX - minX + pad * 2; const bh = maxY - minY + pad * 2;
    const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(rect.width / bw, rect.height / bh)));
    const nvx = minX - pad - (rect.width / nz - bw) / 2; const nvy = minY - pad - (rect.height / nz - bh) / 2;
    setViewX(nvx); setViewY(nvy); setZoom(nz); saveViewport(nvx, nvy, nz);
  }

  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [ctxMenu]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (linkMode) { setLinkMode(null); setLinkSource(null); showToast('Link cancelled'); return; }
        setCtxMenu(null);
        if (editingId !== null) { setEditingId(null); }
        else if (editPanelNodeId !== null) { setEditPanelNodeId(null); setSelectedId(null); }
        else { setSelectedId(null); }
      }
      if (e.key === 'Delete' && selectedId !== null && editingId === null && !linkMode) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        const ch = nodes.filter(n => n.parentId === selectedId).map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
        if (ch.length > 0) updateNodes(ch as Partial<CanvasNode>[]);
        deleteNode(selectedId);
        if (editPanelNodeId === selectedId) setEditPanelNodeId(null);
        setSelectedId(null);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, nodes, updateNodes, deleteNode, linkMode, editPanelNodeId]);

  function buildConnectorPath(parent: CanvasNode, child: CanvasNode): { d: string; color: string } {
    const rel = child.relationshipType || 'linear';
    if (rel === 'nested') {
      const x1 = parent.x + parent.w / 2, y1 = parent.y + parent.h;
      const x2 = child.x, y2 = child.y + child.h / 2;
      const elbowX = Math.min(x1, x2 - NESTED_INDENT);
      return { d: `M${x1},${y1} L${elbowX},${y1} L${elbowX},${y2} L${x2},${y2}`, color: '#e07020' };
    } else {
      const x1 = parent.x, y1 = parent.y + parent.h;
      const x2 = child.x, y2 = child.y;
      const gutterX = Math.min(parent.x, child.x) - ELBOW_GAP;
      return { d: `M${x1},${y1} L${gutterX},${y1} L${gutterX},${y2} L${x2},${y2}`, color: '#1f6feb' };
    }
  }

  function getPathwayColor(pathwayId: number | null): string {
    if (pathwayId === null) return '#475569';
    return PATHWAY_COLORS[(pathwayId - 1) % PATHWAY_COLORS.length];
  }

  const viewBox = `${viewX} ${viewY} ${(canvasAreaRef.current?.clientWidth || containerRef.current?.clientWidth || 800) / zoom} ${(canvasAreaRef.current?.clientHeight || containerRef.current?.clientHeight || 600) / zoom}`;
  const editPanelNode = editPanelNodeId !== null ? nodes.find(n => n.id === editPanelNodeId) ?? null : null;
  const hoverNode = hoverNodeId !== null ? nodes.find(n => n.id === hoverNodeId) ?? null : null;

  return (
    <div className="cvs-root" ref={containerRef}>
      <div className="cvs-actions">
        <button className="cvs-btn" onClick={handleAddNode} title="Add a new topic node">+ Add Node</button>
        <button className="cvs-btn" onClick={handleDetachNode} title="Detach selected node from its parent">Detach</button>
        <span className="cvs-sep" />
        <button className={`cvs-btn ${linkMode === 'linear' ? 'cvs-btn-active' : ''}`}
          onClick={() => { if (linkMode === 'linear') { setLinkMode(null); setLinkSource(null); } else { setLinkMode('linear'); setLinkSource(null); showToast('Click the first (parent) node'); } }}
          title="Parent-Parent link">P-P Link</button>
        <button className={`cvs-btn ${linkMode === 'nested' ? 'cvs-btn-active' : ''}`}
          onClick={() => { if (linkMode === 'nested') { setLinkMode(null); setLinkSource(null); } else { setLinkMode('nested'); setLinkSource(null); showToast('Click the parent node first'); } }}
          title="Parent-Child link">P-C Link</button>
        <span className="cvs-sep" />
        <button className="cvs-btn" onClick={zoomIn} title="Zoom in">+ Zoom</button>
        <button className="cvs-btn" onClick={zoomOut} title="Zoom out">- Zoom</button>
        <button className="cvs-btn" onClick={resetView} title="Reset view">Reset</button>
        <button className="cvs-btn" onClick={fitToScreen} title="Fit all nodes">Fit</button>
        <span className="cvs-zoom-label">{Math.round(zoom * 100)}%</span>
      </div>

      {linkMode && (
        <div className="cvs-link-bar">
          <span>Link Mode: {linkMode === 'nested' ? 'P->C' : 'P->P'}
            {linkSource !== null ? ` | Source: "${nodes.find(n => n.id === linkSource)?.title || '?'}" -> click target` : ' | Click the first node'}
          </span>
          <button onClick={() => { setLinkMode(null); setLinkSource(null); }}>Cancel</button>
        </div>
      )}

      <div className="cvs-body">
        <div className="cvs-canvas-area" ref={canvasAreaRef}>
          <svg ref={svgRef}
            className={`cvs-svg ${isPanning ? 'cvs-panning' : ''} ${linkMode ? 'cvs-linking' : ''}`}
            viewBox={viewBox}
            onMouseDown={handleBgMouseDown}
            onWheel={handleWheel}
            onContextMenu={e => e.preventDefault()}>
            <defs>
              <pattern id="cvs-grid" x={0} y={0} width={40} height={40} patternUnits="userSpaceOnUse">
                <circle cx={20} cy={20} r={0.8} fill="#94a3b8" opacity={0.5} />
              </pattern>
            </defs>
            <rect x={viewX - 5000} y={viewY - 5000} width={10000} height={10000} fill="url(#cvs-grid)" />

            {nodes.map(child => {
              if (!child.parentId) return null;
              const parent = nodes.find(n => n.id === child.parentId);
              if (!parent) return null;
              const { d, color } = buildConnectorPath(parent, child);
              return (
                <g key={`conn-${child.id}`}>
                  <path d={d} fill="none" stroke={color} strokeWidth={2 / zoom} strokeLinejoin="round" strokeLinecap="round" />
                  <circle cx={child.relationshipType === 'nested' ? child.x : child.x}
                    cy={child.relationshipType === 'nested' ? child.y + child.h / 2 : child.y}
                    r={3 / zoom} fill={color} />
                </g>
              );
            })}

            {sisterLinks.map(sl => {
              const a = nodes.find(n => n.id === sl.nodeA);
              const b = nodes.find(n => n.id === sl.nodeB);
              if (!a || !b) return null;
              return (
                <line key={`sl-${sl.id}`}
                  x1={a.x + a.w / 2} y1={a.y + a.h / 2}
                  x2={b.x + b.w / 2} y2={b.y + b.h / 2}
                  stroke="#7c3aed" strokeWidth={1.5 / zoom}
                  strokeDasharray={`${6 / zoom} ${4 / zoom}`} opacity={0.6} />
              );
            })}

            {nodes.map(node => {
              const isSelected = node.id === selectedId;
              const isLinkSource = node.id === linkSource;
              const isDragging = node.id === dragNodeId;
              const accentColor = getPathwayColor(node.pathwayId);
              const kwCount = (node.linkedKwIds || []).length;
              const childCount = nodes.filter(n => n.parentId === node.id).length;
              const hasAlts = (node.altTitles || []).length > 0;
              const descY = hasAlts ? 42 : 32;
              const descH = node.h - descY - 20;
              return (
                <g key={node.id} className="cvs-node-group"
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={e => handleNodeMouseDown(e, node.id)}
                  onContextMenu={e => handleNodeContextMenu(e, node.id)}
                  onDoubleClick={() => handleNodeDblClick(node.id)}
                  onMouseEnter={e => {
                    if (node.description) {
                      const r = (e.currentTarget as SVGGElement).getBoundingClientRect();
                      if (hoverTimer.current) clearTimeout(hoverTimer.current);
                      hoverTimer.current = setTimeout(() => {
                        setHoverNodeId(node.id);
                        setHoverPos({ x: r.left + r.width / 2, y: r.top - 8 });
                      }, 350);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hoverTimer.current) clearTimeout(hoverTimer.current);
                    setHoverNodeId(null);
                  }}
                  style={{ cursor: linkMode ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}>
                  {isLinkSource && (
                    <rect x={-4 / zoom} y={-4 / zoom} width={node.w + 8 / zoom} height={node.h + 8 / zoom}
                      rx={(CORNER_R + 3) / zoom} ry={(CORNER_R + 3) / zoom}
                      fill="none" stroke={linkMode === 'nested' ? '#e07020' : '#1f6feb'}
                      strokeWidth={3 / zoom} opacity={0.8} />
                  )}
                  {isSelected && !isLinkSource && (
                    <rect x={-3 / zoom} y={-3 / zoom} width={node.w + 6 / zoom} height={node.h + 6 / zoom}
                      rx={(CORNER_R + 2) / zoom} ry={(CORNER_R + 2) / zoom}
                      fill="none" stroke="#3b82f6" strokeWidth={2 / zoom}
                      strokeDasharray={`${4 / zoom} ${3 / zoom}`} />
                  )}
                  <rect x={0} y={0} width={node.w} height={node.h} rx={CORNER_R} ry={CORNER_R}
                    fill="#ffffff"
                    stroke={isLinkSource ? (linkMode === 'nested' ? '#e07020' : '#1f6feb') : isSelected ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={isSelected || isLinkSource ? 1.5 / zoom : 1 / zoom} />
                  <rect x={0} y={0} width={ACCENT_W} height={node.h} rx={CORNER_R} ry={CORNER_R} fill={accentColor} />
                  <rect x={ACCENT_W} y={0} width={ACCENT_W} height={node.h} fill="#ffffff" />

                  {editingId === node.id ? (
                    <foreignObject x={ACCENT_W + 8} y={6} width={node.w - ACCENT_W - 16} height={28}>
                      <input className="cvs-title-input" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus />
                    </foreignObject>
                  ) : (
                    <text x={ACCENT_W + 10} y={20} className="cvs-node-title">
                      {node.title || '(untitled)'}
                    </text>
                  )}

                  {hasAlts && (
                    <text x={ACCENT_W + 10} y={33} className="cvs-node-alt">
                      {(node.altTitles as string[]).slice(0, 2).join(', ')}{(node.altTitles as string[]).length > 2 ? ', ...' : ''}
                    </text>
                  )}

                  {node.description && descH > 10 && (
                    <foreignObject x={ACCENT_W + 8} y={descY} width={node.w - ACCENT_W - 16} height={descH}>
                      <div className="cvs-node-desc-wrap">
                        {node.description}
                      </div>
                    </foreignObject>
                  )}

                  <text x={node.w - 8} y={node.h - 8} className="cvs-node-badge" textAnchor="end">
                    {kwCount > 0 ? `${kwCount}kw` : ''}{kwCount > 0 && childCount > 0 ? ' \u00b7 ' : ''}{childCount > 0 ? `${childCount}ch` : ''}
                  </text>

                  <circle cx={node.w - 6} cy={node.h - 6} r={2.5} fill="#475569" opacity={0.5} />
                </g>
              );
            })}
          </svg>

          {nodes.length === 0 && !isPanning && (
            <div className="cvs-empty">Click <strong>+ Add Node</strong> to create your first topic node</div>
          )}
          <div className={`cvs-toast ${toast ? 'on' : ''}`}>{toast}</div>

          {hoverNode && hoverNode.description && (
            <div className="cvs-popover" style={{ left: hoverPos.x, top: hoverPos.y }}>
              <div className="cvs-popover-title">{hoverNode.title}</div>
              <div className="cvs-popover-desc">{hoverNode.description}</div>
            </div>
          )}
        </div>

        {editPanelNode && (
          <CanvasEditPanel
            node={editPanelNode}
            allKeywords={allKeywords}
            onSave={handleEditPanelSave}
            onClose={() => { setEditPanelNodeId(null); setSelectedId(null); }}
          />
        )}
      </div>

      {ctxMenu && (
        <div className="cvs-ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
          <button onClick={() => { handleNodeDblClick(ctxMenu.nodeId); setCtxMenu(null); }}>Rename</button>
          <button onClick={handleCtxDetach}>Detach from Parent</button>
          <button onClick={() => { setLinkMode('nested'); setLinkSource(ctxMenu.nodeId); setCtxMenu(null); showToast('Now click the child node'); }}>Make Parent of...</button>
          <button onClick={() => { setLinkMode('linear'); setLinkSource(ctxMenu.nodeId); setCtxMenu(null); showToast('Now click the sibling node'); }}>Link as Sibling to...</button>
          <div className="cvs-ctx-divider" />
          <button className="cvs-ctx-danger" onClick={handleDeleteNode}>Delete Node</button>
          <button onClick={() => setCtxMenu(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
