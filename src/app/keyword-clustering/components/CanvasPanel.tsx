'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvas, CanvasNode } from '@/hooks/useCanvas';
import './canvas-panel.css';

/* ── Constants ─────────────────────────────────────────────────── */
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
}

export default function CanvasPanel({ projectId }: CanvasPanelProps) {
  const {
    nodes, canvasState, sisterLinks, fetchCanvas,
    addNode, updateNodes, deleteNode, updateCanvasState,
  } = useCanvas(projectId);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Viewport state ──────────────────────────────────────────── */
  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  /* ── Drag node state ─────────────────────────────────────────── */
  const [dragNodeId, setDragNodeId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  /* ── Selection & context menu ────────────────────────────────── */
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId: number } | null>(null);

  /* ── Edit-in-place state ─────────────────────────────────────── */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  /* ── Load canvas data ────────────────────────────────────────── */
  useEffect(() => { fetchCanvas(); }, [fetchCanvas]);

  /* ── Sync viewport from DB on first load ─────────────────────── */
  useEffect(() => {
    if (canvasState) {
      setViewX(canvasState.viewX);
      setViewY(canvasState.viewY);
      setZoom(canvasState.zoom);
    }
  }, [canvasState]);

  /* ── Save viewport to DB (debounced) ─────────────────────────── */
  const viewSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveViewport = useCallback((vx: number, vy: number, z: number) => {
    if (viewSaveTimer.current) clearTimeout(viewSaveTimer.current);
    viewSaveTimer.current = setTimeout(() => {
      updateCanvasState({ viewX: vx, viewY: vy, zoom: z });
    }, 500);
  }, [updateCanvasState]);

  /* ── Screen coords → canvas coords ──────────────────────────── */
  function screenToCanvas(sx: number, sy: number) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (sx - rect.left) / zoom + viewX,
      y: (sy - rect.top) / zoom + viewY,
    };
  }

  /* ── PAN handlers ────────────────────────────────────────────── */
  function handleBgMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    // Only pan if clicking the SVG background (not a node)
    if ((e.target as Element).closest('.cvs-node-group')) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewX, vy: viewY };
    setCtxMenu(null);
    setSelectedId(null);
    e.preventDefault();
  }

  useEffect(() => {
    if (!isPanning) return;
    function onMove(e: MouseEvent) {
      const dx = (e.clientX - panStart.current.x) / zoom;
      const dy = (e.clientY - panStart.current.y) / zoom;
      const nvx = panStart.current.vx - dx;
      const nvy = panStart.current.vy - dy;
      setViewX(nvx);
      setViewY(nvy);
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
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isPanning, zoom, saveViewport]);

  /* ── ZOOM handler ────────────────────────────────────────────── */
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    // Zoom toward cursor
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = (e.clientX - rect.left) / zoom + viewX;
      const my = (e.clientY - rect.top) / zoom + viewY;
      const nvx = mx - (e.clientX - rect.left) / newZoom;
      const nvy = my - (e.clientY - rect.top) / newZoom;
      setViewX(nvx);
      setViewY(nvy);
      setZoom(newZoom);
      saveViewport(nvx, nvy, newZoom);
    } else {
      setZoom(newZoom);
      saveViewport(viewX, viewY, newZoom);
    }
  }

  /* ── NODE DRAG handlers ──────────────────────────────────────── */
  function handleNodeMouseDown(e: React.MouseEvent, nodeId: number) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragNodeId(nodeId);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
    dragMoved.current = false;
    setSelectedId(nodeId);
    setCtxMenu(null);
  }

  useEffect(() => {
    if (dragNodeId === null) return;
    function onMove(e: MouseEvent) {
      dragMoved.current = true;
      const pos = screenToCanvas(e.clientX, e.clientY);
      const nx = pos.x - dragOffset.x;
      const ny = pos.y - dragOffset.y;
      // Update locally for instant feedback
      const idx = nodes.findIndex(n => n.id === dragNodeId);
      if (idx >= 0) {
        nodes[idx] = { ...nodes[idx], x: nx, y: ny };
        // Force re-render by triggering state update
        // We directly mutate and then trigger via a dummy state
        forceUpdate();
      }
    }
    function onUp() {
      if (dragMoved.current && dragNodeId !== null) {
        const node = nodes.find(n => n.id === dragNodeId);
        if (node) {
          updateNodes([{ id: dragNodeId, x: node.x, y: node.y } as Partial<CanvasNode>]);
        }
      }
      setDragNodeId(null);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragNodeId]);

  // Force-update trick for smooth drag
  const [, setTick] = useState(0);
  function forceUpdate() { setTick(t => t + 1); }

  /* ── Context menu ────────────────────────────────────────────── */
  function handleNodeContextMenu(e: React.MouseEvent, nodeId: number) {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
    setSelectedId(nodeId);
  }

  function handleDeleteNode() {
    if (ctxMenu) {
      // Also un-parent any children
      const childUpdates = nodes
        .filter(n => n.parentId === ctxMenu.nodeId)
        .map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
      if (childUpdates.length > 0) {
        updateNodes(childUpdates as Partial<CanvasNode>[]);
      }
      deleteNode(ctxMenu.nodeId);
      setCtxMenu(null);
      setSelectedId(null);
    }
  }

  /* ── Double-click to edit title ──────────────────────────────── */
  function handleNodeDblClick(nodeId: number) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditingId(nodeId);
    setEditVal(node.title);
  }

  function commitEdit() {
    if (editingId !== null) {
      updateNodes([{ id: editingId, title: editVal } as Partial<CanvasNode>]);
      setEditingId(null);
    }
  }

  /* ── Add node at viewport center ─────────────────────────────── */
  async function handleAddNode() {
    const rect = svgRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2) / zoom + viewX - NODE_W / 2 : viewX;
    const cy = rect ? (rect.height / 2) / zoom + viewY - NODE_H / 2 : viewY;
    await addNode({ x: cx, y: cy, w: NODE_W, h: NODE_H, title: 'New Topic' });
  }

  /* ── Zoom buttons ────────────────────────────────────────────── */
  function zoomIn() {
    const nz = Math.min(MAX_ZOOM, zoom * 1.2);
    setZoom(nz);
    saveViewport(viewX, viewY, nz);
  }
  function zoomOut() {
    const nz = Math.max(MIN_ZOOM, zoom / 1.2);
    setZoom(nz);
    saveViewport(viewX, viewY, nz);
  }
  function resetView() {
    setViewX(0); setViewY(0); setZoom(1);
    saveViewport(0, 0, 1);
  }
  function fitToScreen() {
    if (nodes.length === 0) { resetView(); return; }
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    });
    const pad = 60;
    const bw = maxX - minX + pad * 2;
    const bh = maxY - minY + pad * 2;
    const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(rect.width / bw, rect.height / bh)));
    const nvx = minX - pad - (rect.width / nz - bw) / 2;
    const nvy = minY - pad - (rect.height / nz - bh) / 2;
    setViewX(nvx); setViewY(nvy); setZoom(nz);
    saveViewport(nvx, nvy, nz);
  }

  /* ── Close ctx menu on click outside ─────────────────────────── */
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [ctxMenu]);

  /* ── Keyboard: Delete, Escape ────────────────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Delete' && selectedId !== null && editingId === null) {
        const childUpdates = nodes
          .filter(n => n.parentId === selectedId)
          .map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
        if (childUpdates.length > 0) {
          updateNodes(childUpdates as Partial<CanvasNode>[]);
        }
        deleteNode(selectedId);
        setSelectedId(null);
      }
      if (e.key === 'Escape') {
        setCtxMenu(null);
        if (editingId !== null) { setEditingId(null); }
        else { setSelectedId(null); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedId, editingId, nodes, updateNodes, deleteNode]);

  /* ── Connector path builder ──────────────────────────────────── */
  function buildConnectorPath(parent: CanvasNode, child: CanvasNode): { d: string; color: string } {
    const rel = child.relationshipType || 'linear';
    if (rel === 'nested') {
      // Nested: parent bottom-center → elbow → child left-center
      const x1 = parent.x + parent.w / 2;
      const y1 = parent.y + parent.h;
      const x2 = child.x;
      const y2 = child.y + child.h / 2;
      const elbowX = Math.min(x1, x2 - NESTED_INDENT);
      return {
        d: `M${x1},${y1} L${elbowX},${y1} L${elbowX},${y2} L${x2},${y2}`,
        color: '#e07020',
      };
    } else {
      // Linear: parent bottom-left → elbow → child top-left
      const x1 = parent.x;
      const y1 = parent.y + parent.h;
      const x2 = child.x;
      const y2 = child.y;
      const gutterX = Math.min(parent.x, child.x) - ELBOW_GAP;
      return {
        d: `M${x1},${y1} L${gutterX},${y1} L${gutterX},${y2} L${x2},${y2}`,
        color: '#1f6feb',
      };
    }
  }

  /* ── Pathway color helper ────────────────────────────────────── */
  function getPathwayColor(pathwayId: number | null): string {
    if (pathwayId === null) return '#475569';
    return PATHWAY_COLORS[(pathwayId - 1) % PATHWAY_COLORS.length];
  }

  /* ── Render ──────────────────────────────────────────────────── */
  const viewBox = `${viewX} ${viewY} ${(containerRef.current?.clientWidth || 800) / zoom} ${(containerRef.current?.clientHeight || 600) / zoom}`;

  return (
    <div className="cvs-root" ref={containerRef}>
      {/* ── Action bar ───────────────────────────────────────── */}
      <div className="cvs-actions">
        <button className="cvs-btn" onClick={handleAddNode} title="Add a new topic node">＋ Add Node</button>
        <span className="cvs-sep" />
        <button className="cvs-btn" onClick={zoomIn} title="Zoom in">＋ Zoom</button>
        <button className="cvs-btn" onClick={zoomOut} title="Zoom out">− Zoom</button>
        <button className="cvs-btn" onClick={resetView} title="Reset view">⊙ Reset</button>
        <button className="cvs-btn" onClick={fitToScreen} title="Fit all nodes">⛶ Fit</button>
        <span className="cvs-zoom-label">{Math.round(zoom * 100)}%</span>
      </div>

      {/* ── SVG Canvas ───────────────────────────────────────── */}
      <svg
        ref={svgRef}
        className={`cvs-svg ${isPanning ? 'cvs-panning' : ''}`}
        viewBox={viewBox}
        onMouseDown={handleBgMouseDown}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Grid dots */}
        <defs>
          <pattern id="cvs-grid" x={0} y={0} width={40} height={40} patternUnits="userSpaceOnUse">
            <circle cx={20} cy={20} r={0.8} fill="#334155" opacity={0.5} />
          </pattern>
        </defs>
        <rect x={viewX - 5000} y={viewY - 5000} width={10000} height={10000} fill="url(#cvs-grid)" />

        {/* Connectors */}
        {nodes.map(child => {
          if (!child.parentId) return null;
          const parent = nodes.find(n => n.id === child.parentId);
          if (!parent) return null;
          const { d, color } = buildConnectorPath(parent, child);
          return (
            <g key={`conn-${child.id}`}>
              <path d={d} fill="none" stroke={color} strokeWidth={2 / zoom} strokeLinejoin="round" strokeLinecap="round" />
              {/* Arrow at end */}
              <circle cx={child.relationshipType === 'nested' ? child.x : child.x} cy={child.relationshipType === 'nested' ? child.y + child.h / 2 : child.y} r={3 / zoom} fill={color} />
            </g>
          );
        })}

        {/* Sister link dashed lines */}
        {sisterLinks.map(sl => {
          const a = nodes.find(n => n.id === sl.nodeA);
          const b = nodes.find(n => n.id === sl.nodeB);
          if (!a || !b) return null;
          return (
            <line
              key={`sl-${sl.id}`}
              x1={a.x + a.w / 2} y1={a.y + a.h / 2}
              x2={b.x + b.w / 2} y2={b.y + b.h / 2}
              stroke="#7c3aed" strokeWidth={1.5 / zoom}
              strokeDasharray={`${6 / zoom} ${4 / zoom}`}
              opacity={0.6}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const isSelected = node.id === selectedId;
          const isDragging = node.id === dragNodeId;
          const accentColor = getPathwayColor(node.pathwayId);
          const kwCount = (node.linkedKwIds || []).length;
          const childCount = nodes.filter(n => n.parentId === node.id).length;

          return (
            <g
              key={node.id}
              className="cvs-node-group"
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={e => handleNodeMouseDown(e, node.id)}
              onContextMenu={e => handleNodeContextMenu(e, node.id)}
              onDoubleClick={() => handleNodeDblClick(node.id)}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* Selection outline */}
              {isSelected && (
                <rect
                  x={-3 / zoom} y={-3 / zoom}
                  width={node.w + 6 / zoom} height={node.h + 6 / zoom}
                  rx={(CORNER_R + 2) / zoom} ry={(CORNER_R + 2) / zoom}
                  fill="none" stroke="#3b82f6" strokeWidth={2 / zoom}
                  strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                />
              )}

              {/* Node body */}
              <rect
                x={0} y={0} width={node.w} height={node.h}
                rx={CORNER_R} ry={CORNER_R}
                fill="#1e293b" stroke={isSelected ? '#3b82f6' : '#334155'}
                strokeWidth={isSelected ? 1.5 / zoom : 1 / zoom}
              />

              {/* Accent stripe */}
              <rect
                x={0} y={0} width={ACCENT_W} height={node.h}
                rx={CORNER_R} ry={CORNER_R}
                fill={accentColor}
              />
              {/* Clip accent stripe to left side only */}
              <rect x={ACCENT_W} y={0} width={ACCENT_W} height={node.h} fill="#1e293b" />

              {/* Title */}
              {editingId === node.id ? (
                <foreignObject x={ACCENT_W + 8} y={8} width={node.w - ACCENT_W - 16} height={28}>
                  <input
                    className="cvs-title-input"
                    value={editVal}
                    onChange={e => setEditVal(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                  />
                </foreignObject>
              ) : (
                <text
                  x={ACCENT_W + 10} y={24}
                  className="cvs-node-title"
                  fontSize={13 / zoom > 13 ? 13 : undefined}
                >
                  {node.title || '(untitled)'}
                </text>
              )}

              {/* Description preview */}
              <text
                x={ACCENT_W + 10} y={44}
                className="cvs-node-desc"
                fontSize={10 / zoom > 10 ? 10 : undefined}
              >
                {(node.description || '').slice(0, 50)}{node.description && node.description.length > 50 ? '…' : ''}
              </text>

              {/* Badge: keywords + children */}
              <text
                x={node.w - 8} y={node.h - 8}
                className="cvs-node-badge"
                textAnchor="end"
                fontSize={9 / zoom > 9 ? 9 : undefined}
              >
                {kwCount > 0 ? `${kwCount}kw` : ''}{kwCount > 0 && childCount > 0 ? ' · ' : ''}{childCount > 0 ? `${childCount}ch` : ''}
              </text>

              {/* Resize grip dot */}
              <circle cx={node.w - 6} cy={node.h - 6} r={2.5} fill="#475569" opacity={0.5} />
            </g>
          );
        })}
      </svg>

      {/* ── Context menu ─────────────────────────────────────── */}
      {ctxMenu && (
        <div className="cvs-ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
          <button onClick={handleDeleteNode}>🗑 Delete Node</button>
          <button onClick={() => {
            handleNodeDblClick(ctxMenu.nodeId);
            setCtxMenu(null);
          }}>✏️ Rename</button>
          <button onClick={() => setCtxMenu(null)}>✕ Cancel</button>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {nodes.length === 0 && !isPanning && (
        <div className="cvs-empty">
          Click <strong>＋ Add Node</strong> to create your first topic node
        </div>
      )}
    </div>
  );
}
