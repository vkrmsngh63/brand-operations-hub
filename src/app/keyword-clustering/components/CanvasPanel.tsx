'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { type CanvasNode, type useCanvas } from '@/hooks/useCanvas';
import CanvasEditPanel from './CanvasEditPanel';
import CanvasTableMode from './CanvasTableMode';
import type { Keyword } from '@/hooks/useKeywords';
import './canvas-panel.css';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const NODE_W = 220;
const NODE_H = 160;
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
  canvas: ReturnType<typeof useCanvas>;
}

export default function CanvasPanel({ projectId, allKeywords = [], canvas }: CanvasPanelProps) {
  const {
    nodes, canvasState, pathways, sisterLinks, fetchCanvas,
    addNode, updateNodes, deleteNode, updateCanvasState,
  } = canvas;

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  const [viewX, setViewX] = useState(0);
  const [viewY, setViewY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const viewXRef = useRef(0);
  const viewYRef = useRef(0);
  const zoomRef = useRef(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  const [dragNodeId, setDragNodeId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  /* ── Multi-select state ──────────────────────────────────────── */
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId: number } | null>(null);

  /* ── Selection box state (shift+drag on background) ──────────── */
  const [selBox, setSelBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const selBoxRef = useRef<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const selBoxActive = useRef(false);
  const selBoxAnimFrame = useRef<number | null>(null);

  /* ── Multi-drag: offsets for all selected nodes ──────────────── */
  const multiDragOffsets = useRef<Map<number, { dx: number; dy: number }>>(new Map());

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const [editPanelNodeId, setEditPanelNodeId] = useState<number | null>(null);
  const [canvasMode, setCanvasMode] = useState<"mindmap" | "table">("mindmap");

  /* ── Hover popover state ─────────────────────────────────────── */
  const [hoverNodeId, setHoverNodeId] = useState<number | null>(null);
  const [kwPopoverNodeId, setKwPopoverNodeId] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* ── Node resize state ──────────────────────────────────────── */
  const [resizeNodeId, setResizeNodeId] = useState<number | null>(null);
  const resizeStart = useRef<{ w: number; h: number; mx: number; my: number }>({ w: 0, h: 0, mx: 0, my: 0 });
  /* ── Collapse/expand state ──────────────────────────────────── */
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

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

  // Keep refs in sync with state for use in event handlers
  useEffect(() => { viewXRef.current = viewX; }, [viewX]);
  useEffect(() => { viewYRef.current = viewY; }, [viewY]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

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

  /* ── Background mouse down: pan or selection box ──────────────── */
  function handleBgMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if ((e.target as Element).closest('.cvs-node-group')) return;
    if (linkMode) { setLinkMode(null); setLinkSource(null); showToast('Link cancelled'); return; }

    // Shift+drag on background = selection box
    if (e.shiftKey) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      const box = { x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
      setSelBox(box);
      selBoxRef.current = box;
      selBoxActive.current = true;
      e.preventDefault();
      return;
    }

    // Normal drag on background = pan
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewX, vy: viewY };
    setCtxMenu(null); setSelectedIds(new Set()); setEditPanelNodeId(null);
    e.preventDefault();
  }

  /* ── Selection box drag with auto-pan at edges ────────────────── */
  useEffect(() => {
    if (!selBoxActive.current) return;

    const EDGE_ZONE = 40; // px from viewport edge to start panning
    const PAN_SPEED = 8;  // canvas units per frame

    function onMove(e: MouseEvent) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Auto-pan when near edges
      let panDx = 0, panDy = 0;
      if (e.clientX < rect.left + EDGE_ZONE) panDx = -PAN_SPEED / zoomRef.current;
      else if (e.clientX > rect.right - EDGE_ZONE) panDx = PAN_SPEED / zoomRef.current;
      if (e.clientY < rect.top + EDGE_ZONE) panDy = -PAN_SPEED / zoomRef.current;
      else if (e.clientY > rect.bottom - EDGE_ZONE) panDy = PAN_SPEED / zoomRef.current;

      if (panDx !== 0 || panDy !== 0) {
        viewXRef.current += panDx;
        viewYRef.current += panDy;
        setViewX(viewXRef.current);
        setViewY(viewYRef.current);
      }

      // Compute canvas position using refs (always current)
      const cx = (e.clientX - rect.left) / zoomRef.current + viewXRef.current;
      const cy = (e.clientY - rect.top) / zoomRef.current + viewYRef.current;
      const prev = selBoxRef.current;
      if (prev) {
        const updated = { ...prev, x2: cx, y2: cy };
        selBoxRef.current = updated;
        setSelBox(updated);
      }
    }

    function onUp() {
      selBoxActive.current = false;
      if (selBoxAnimFrame.current) { cancelAnimationFrame(selBoxAnimFrame.current); selBoxAnimFrame.current = null; }

      const box = selBoxRef.current;
      if (box) {
        const minX = Math.min(box.x1, box.x2);
        const maxX = Math.max(box.x1, box.x2);
        const minY = Math.min(box.y1, box.y2);
        const maxY = Math.max(box.y1, box.y2);

        // Only select if box has some size (avoid accidental micro-drags)
        if (maxX - minX > 5 || maxY - minY > 5) {
          const hits = new Set<number>();
          nodes.forEach(n => {
            if (n.x + n.w > minX && n.x < maxX && n.y + n.h > minY && n.y < maxY) {
              if (!isHiddenByCollapse(n.id)) hits.add(n.id);
            }
          });
          if (hits.size > 0) {
            setSelectedIds(prev => {
              const next = new Set(prev);
              hits.forEach(id => next.add(id));
              return next;
            });
            showToast(`Selected ${hits.size} node${hits.size > 1 ? 's' : ''}`);
          }
        }
      }

      setSelBox(null);
      selBoxRef.current = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selBox ? 'active' : 'inactive']);

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
      setLinkSource(nodeId); setSelectedIds(new Set([nodeId]));
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
    if (selectedIds.size === 0) { showToast('Select a node first'); return; }
    const id = [...selectedIds][0];
    const node = nodes.find(n => n.id === id);
    if (!node || node.parentId === null) { showToast('Node has no parent to detach from'); return; }
    updateNodes([{ id, parentId: null, relationshipType: '' } as Partial<CanvasNode>]);
    showToast('\u2713 Node detached from parent');
  }

  function handleNodeMouseDown(e: React.MouseEvent, nodeId: number) {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (linkMode) { handleLinkClick(nodeId); return; }
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pos = screenToCanvas(e.clientX, e.clientY);

    // Shift+click = toggle in multi-select
    if (e.shiftKey) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return next;
      });
      setCtxMenu(null);
      return;
    }

    // If clicking a node that's already in the selection, drag the whole group
    const isInSelection = selectedIds.has(nodeId);
    if (!isInSelection) {
      // Normal click = select only this node
      setSelectedIds(new Set([nodeId]));
    }

    // Start drag — compute offsets for all selected nodes
    const dragSet = isInSelection ? selectedIds : new Set([nodeId]);
    const offsets = new Map<number, { dx: number; dy: number }>();
    dragSet.forEach(id => {
      const n = nodes.find(n => n.id === id);
      if (n) offsets.set(id, { dx: pos.x - n.x, dy: pos.y - n.y });
    });
    multiDragOffsets.current = offsets;

    setDragNodeId(nodeId);
    setDragOffset({ x: pos.x - node.x, y: pos.y - node.y });
    dragMoved.current = false;
    setCtxMenu(null);
  }

  useEffect(() => {
    if (dragNodeId === null) return;
    const offsets = multiDragOffsets.current;
    const EDGE_ZONE = 40;
    const PAN_SPEED = 8;

    function onMove(e: MouseEvent) {
      dragMoved.current = true;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Auto-pan when dragging near viewport edges
      let panDx = 0, panDy = 0;
      if (e.clientX < rect.left + EDGE_ZONE) panDx = -PAN_SPEED / zoomRef.current;
      else if (e.clientX > rect.right - EDGE_ZONE) panDx = PAN_SPEED / zoomRef.current;
      if (e.clientY < rect.top + EDGE_ZONE) panDy = -PAN_SPEED / zoomRef.current;
      else if (e.clientY > rect.bottom - EDGE_ZONE) panDy = PAN_SPEED / zoomRef.current;

      if (panDx !== 0 || panDy !== 0) {
        viewXRef.current += panDx;
        viewYRef.current += panDy;
        setViewX(viewXRef.current);
        setViewY(viewYRef.current);
      }

      // Compute canvas position using refs (always current)
      const cx = (e.clientX - rect.left) / zoomRef.current + viewXRef.current;
      const cy = (e.clientY - rect.top) / zoomRef.current + viewYRef.current;

      // Move all nodes in the drag set
      offsets.forEach(({ dx, dy }, id) => {
        const idx = nodes.findIndex(n => n.id === id);
        if (idx >= 0) {
          nodes[idx] = { ...nodes[idx], x: cx - dx, y: cy - dy };
        }
      });
      forceUpdate();
    }
    function onUp() {
      if (dragMoved.current && offsets.size > 0) {
        offsets.forEach((_, id) => resolveOverlap(id));
        const updates: Partial<CanvasNode>[] = [];
        offsets.forEach((_, id) => {
          const node = nodes.find(n => n.id === id);
          if (node) updates.push({ id, x: node.x, y: node.y } as Partial<CanvasNode>);
        });
        if (updates.length > 0) updateNodes(updates);
      }
      setDragNodeId(null);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragNodeId]);

  /* ── Overlap resolution ─────────────────────────────────────── */
  function resolveOverlap(nodeId: number) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const GAP = 20;
    let attempts = 0;
    while (attempts < 100) {
      let foundBlocker = false;
      for (const n of nodes) {
        if (n.id === nodeId) continue;
        const overlapX = node.x < n.x + n.w + GAP && node.x + node.w + GAP > n.x;
        const overlapY = node.y < n.y + n.h + GAP && node.y + node.h + GAP > n.y;
        if (overlapX && overlapY) {
          const nudgeRight = (n.x + n.w + GAP) - node.x;
          const nudgeDown = (n.y + n.h + GAP) - node.y;
          if (nudgeRight <= nudgeDown) {
            node.x = n.x + n.w + GAP;
          } else {
            node.y = n.y + n.h + GAP;
          }
          foundBlocker = true;
          break;
        }
      }
      if (!foundBlocker) break;
      attempts++;
    }
    const idx = nodes.findIndex(n => n.id === nodeId);
    if (idx >= 0) nodes[idx] = { ...nodes[idx], x: node.x, y: node.y };
    forceUpdate();
  }

  const [, setTick] = useState(0);
  function forceUpdate() { setTick(t => t + 1); }

  function handleNodeContextMenu(e: React.MouseEvent, nodeId: number) {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
    // Add to selection if not already selected
    if (!selectedIds.has(nodeId)) setSelectedIds(new Set([nodeId]));
    setEditPanelNodeId(nodeId);
  }

  function handleDeleteNode() {
    if (ctxMenu) {
      const ch = nodes.filter(n => n.parentId === ctxMenu.nodeId).map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
      if (ch.length > 0) updateNodes(ch as Partial<CanvasNode>[]);
      deleteNode(ctxMenu.nodeId);
      if (editPanelNodeId === ctxMenu.nodeId) setEditPanelNodeId(null);
      setCtxMenu(null);
      setSelectedIds(prev => { const next = new Set(prev); next.delete(ctxMenu.nodeId); return next; });
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
    let cy = rect ? (rect.height / 2) / zoom + viewY - NODE_H / 2 : viewY;
    for (const n of nodes) {
      const bottom = n.y + n.h + 30;
      if (bottom > cy) cy = bottom;
    }
    const newNode = await addNode({ x: cx, y: cy, w: NODE_W, h: NODE_H, title: 'New Topic' });
    if (newNode) { setSelectedIds(new Set([newNode.id])); }
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
        else if (editPanelNodeId !== null) { setEditPanelNodeId(null); setSelectedIds(new Set()); }
        else { setSelectedIds(new Set()); }
      }
      if (e.key === 'Delete' && selectedIds.size > 0 && editingId === null && !linkMode) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
        // Delete all selected nodes
        selectedIds.forEach(id => {
          const ch = nodes.filter(n => n.parentId === id).map(n => ({ id: n.id, parentId: null, relationshipType: '' }));
          if (ch.length > 0) updateNodes(ch as Partial<CanvasNode>[]);
          deleteNode(id);
        });
        if (editPanelNodeId !== null && selectedIds.has(editPanelNodeId)) setEditPanelNodeId(null);
        setSelectedIds(new Set());
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedIds, editingId, nodes, updateNodes, deleteNode, linkMode, editPanelNodeId]);

  /* ── Canvas drop handler (keywords from tables) ───────────── */
  function handleCanvasDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes("text/kst-kwids")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }

  function handleCanvasDrop(e: React.DragEvent) {
    const raw = e.dataTransfer.getData("text/kst-kwids");
    if (!raw) return;
    e.preventDefault();
    let kwIds: string[] = [];
    try { kwIds = JSON.parse(raw); } catch { return; }
    if (kwIds.length === 0) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const wx = (e.clientX - rect.left) / zoom + viewX;
    const wy = (e.clientY - rect.top) / zoom + viewY;
    const hit = nodes.find(n => wx >= n.x && wx <= n.x + n.w && wy >= n.y && wy <= n.y + n.h);
    if (hit) {
      const existing = new Set((hit.linkedKwIds || []) as string[]);
      const newIds = kwIds.filter(id => !existing.has(id));
      if (newIds.length === 0) { showToast("Keywords already linked"); return; }
      const merged = [...(hit.linkedKwIds || []) as string[], ...newIds];
      updateNodes([{ id: hit.id, linkedKwIds: merged } as Partial<CanvasNode>]);
      showToast(`\u2713 Linked ${newIds.length} keyword${newIds.length > 1 ? "s" : ""} to "${hit.title}"`);
      setSelectedIds(new Set([hit.id])); setEditPanelNodeId(hit.id);
    } else {
      showToast("Drop on a node to link keywords");
    }
  }

  /* ── Node resize handlers ──────────────────────────────────── */
  function handleResizeStart(e: React.MouseEvent, nodeId: number) {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setResizeNodeId(nodeId);
    resizeStart.current = { w: node.w, h: node.h, mx: e.clientX, my: e.clientY };
  }

  useEffect(() => {
    if (resizeNodeId === null) return;
    function onMove(e: MouseEvent) {
      const dx = (e.clientX - resizeStart.current.mx) / zoom;
      const dy = (e.clientY - resizeStart.current.my) / zoom;
      const nw = Math.max(140, resizeStart.current.w + dx);
      const nh = Math.max(60, resizeStart.current.h + dy);
      const idx = nodes.findIndex(n => n.id === resizeNodeId);
      if (idx >= 0) { nodes[idx] = { ...nodes[idx], w: nw, h: nh }; forceUpdate(); }
    }
    function onUp() {
      if (resizeNodeId !== null) resolveOverlap(resizeNodeId);
      const node = nodes.find(n => n.id === resizeNodeId);
      if (node) {
        updateNodes([{ id: resizeNodeId, w: node.w, h: node.h, x: node.x, y: node.y } as Partial<CanvasNode>]);
      }
      setResizeNodeId(null);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeNodeId]);

  /* ── Collapse/expand helpers ────────────────────────────────── */
  function toggleCollapse(nodeId: number) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId);
      return next;
    });
  }

  function isHiddenByCollapse(nodeId: number): boolean {
    let current = nodes.find(n => n.id === nodeId);
    while (current && current.parentId !== null) {
      if (collapsed.has(current.parentId)) return true;
      current = nodes.find(n => n.id === current!.parentId);
    }
    return false;
  }

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

  /* Helper: first selected ID for edit panel etc. */
  const firstSelectedId = selectedIds.size > 0 ? [...selectedIds][0] : null;

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
        <span className="cvs-sep" />
        <button className={`cvs-btn ${canvasMode === "mindmap" ? "cvs-btn-active" : ""}`} onClick={() => setCanvasMode("mindmap")}>Mindmap</button>
        <button className={`cvs-btn ${canvasMode === "table" ? "cvs-btn-active" : ""}`} onClick={() => setCanvasMode("table")}>Table</button>
        {selectedIds.size > 1 && (
          <>
            <span className="cvs-sep" />
            <span className="cvs-multi-label">{selectedIds.size} selected</span>
          </>
        )}
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
        {canvasMode === "table" ? (
          <CanvasTableMode nodes={nodes} pathways={pathways} sisterLinks={sisterLinks} allKeywords={allKeywords} onSelectNode={id => { setSelectedIds(new Set([id])); }} onUpdateNodes={updateNodes} onAddNode={addNode} onDeleteNode={deleteNode} />
        ) : (<>
        <div className="cvs-canvas-area" ref={canvasAreaRef} onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}>
          <svg ref={svgRef}
            className={`cvs-svg ${isPanning ? 'cvs-panning' : ''} ${linkMode ? 'cvs-linking' : ''}`}
            viewBox={viewBox}
            onMouseDown={handleBgMouseDown} onDragOver={handleCanvasDragOver} onDrop={handleCanvasDrop}
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
              if (isHiddenByCollapse(child.id)) return null;
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
              if (isHiddenByCollapse(sl.nodeA) || isHiddenByCollapse(sl.nodeB)) return null;
              return (
                <line key={`sl-${sl.id}`}
                  x1={a.x + a.w / 2} y1={a.y + a.h / 2}
                  x2={b.x + b.w / 2} y2={b.y + b.h / 2}
                  stroke="#7c3aed" strokeWidth={1.5 / zoom}
                  strokeDasharray={`${6 / zoom} ${4 / zoom}`} opacity={0.6} />
              );
            })}

            {nodes.map(node => {
              if (isHiddenByCollapse(node.id)) return null;
              const isSelected = selectedIds.has(node.id);
              const isLinkSource = node.id === linkSource;
              const isDragging = node.id === dragNodeId;
              const renderH = Math.max(node.h, NODE_H);
              const accentColor = getPathwayColor(node.pathwayId);
              const kwCount = (node.linkedKwIds || []).length;
              const childCount = nodes.filter(n => n.parentId === node.id).length;
              const hasAlts = (node.altTitles || []).length > 0;
              const KW_PREVIEW_H = 36;
              const BADGE_H = 18;
              const descY = hasAlts ? 42 : 32;
              const descH = Math.max(0, renderH - descY - KW_PREVIEW_H - BADGE_H);
              const kwPreviewY = descY + descH;
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
                    <rect x={-4 / zoom} y={-4 / zoom} width={node.w + 8 / zoom} height={renderH + 8 / zoom}
                      rx={(CORNER_R + 3) / zoom} ry={(CORNER_R + 3) / zoom}
                      fill="none" stroke={linkMode === 'nested' ? '#e07020' : '#1f6feb'}
                      strokeWidth={3 / zoom} opacity={0.8} />
                  )}
                  {isSelected && !isLinkSource && (
                    <rect x={-3 / zoom} y={-3 / zoom} width={node.w + 6 / zoom} height={renderH + 6 / zoom}
                      rx={(CORNER_R + 2) / zoom} ry={(CORNER_R + 2) / zoom}
                      fill="none" stroke="#3b82f6" strokeWidth={2 / zoom}
                      strokeDasharray={`${4 / zoom} ${3 / zoom}`} />
                  )}
                  <rect x={0} y={0} width={node.w} height={renderH} rx={CORNER_R} ry={CORNER_R}
                    fill="#ffffff"
                    stroke={isLinkSource ? (linkMode === 'nested' ? '#e07020' : '#1f6feb') : isSelected ? '#3b82f6' : '#cbd5e1'}
                    strokeWidth={isSelected || isLinkSource ? 1.5 / zoom : 1 / zoom} />
                  <rect x={0} y={0} width={ACCENT_W} height={renderH} rx={CORNER_R} ry={CORNER_R} fill={accentColor} />
                  <rect x={ACCENT_W} y={0} width={ACCENT_W} height={renderH} fill="#ffffff" />
                  {childCount > 0 && (
                    <g onClick={e => { e.stopPropagation(); toggleCollapse(node.id); }}
                      style={{ cursor: "pointer" }}>
                      <rect x={node.w - 20} y={2} width={16} height={14} rx={3} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5} />
                      <text x={node.w - 12} y={12} textAnchor="middle" fill="#1e293b" fontSize={9} fontWeight={700} style={{ pointerEvents: "none" }}>
                        {collapsed.has(node.id) ? "▶" : "▼"}
                      </text>
                    </g>
                  )}

                  {editingId === node.id ? (
                    <foreignObject x={ACCENT_W + 8} y={6} width={node.w - ACCENT_W - 16} height={28}>
                      <input className="cvs-title-input" value={editVal}
                        onChange={e => setEditVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                        autoFocus />
                    </foreignObject>
                  ) : (
                    <foreignObject x={ACCENT_W + 8} y={4} width={node.w - ACCENT_W - 16} height={22}>
                      <div className="cvs-node-title-wrap">{node.title || '(untitled)'}</div>
                    </foreignObject>
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

                  {kwCount > 0 && (() => {
                    const kwIds = (node.linkedKwIds || []) as string[];
                    const placements = (node.kwPlacements || {}) as Record<string, string>;
                    const primaryKws = kwIds.filter(id => (placements[id] || 'p') === 'p').map(id => allKeywords.find(k => k.id === id)).filter(Boolean);
                    const secondaryKws = kwIds.filter(id => placements[id] === 's').map(id => allKeywords.find(k => k.id === id)).filter(Boolean);
                    return (
                      <foreignObject x={ACCENT_W + 8} y={kwPreviewY} width={node.w - ACCENT_W - 16} height={KW_PREVIEW_H}>
                        <div className="cvs-node-kw-preview">
                          <div className="cvs-kw-list">
                            {primaryKws.slice(0, 3).map((k, i) => (
                              <span key={i} className="cvs-kw-primary">{k!.keyword}</span>
                            ))}
                            {secondaryKws.slice(0, 2).map((k, i) => (
                              <span key={'s' + i} className="cvs-kw-secondary">{k!.keyword}</span>
                            ))}
                            {kwIds.length > 5 && <span className="cvs-kw-more">+{kwIds.length - 5} more</span>}
                          </div>
                          <button className="cvs-kw-expand-btn" onClick={e => { e.stopPropagation(); setKwPopoverNodeId(kwPopoverNodeId === node.id ? null : node.id); }}>
                            {kwPopoverNodeId === node.id ? '▲' : '▼'} {kwIds.length}
                          </button>
                        </div>
                      </foreignObject>
                    );
                  })()}
                  <text x={node.w - 8} y={renderH - 8} className="cvs-node-badge" textAnchor="end">
                    {kwCount > 0 ? `${kwCount}kw` : ''}{kwCount > 0 && childCount > 0 ? ' \u00b7 ' : ''}{childCount > 0 ? `${childCount}ch` : ''}
                  </text>

                  <rect x={node.w - 14} y={renderH - 14} width={12} height={12} fill="transparent" style={{ cursor: "nwse-resize" }} onMouseDown={e => handleResizeStart(e, node.id)} /><circle cx={node.w - 6} cy={renderH - 6} r={2.5} fill="#475569" opacity={0.6} style={{ pointerEvents: "none" }} />
                </g>
              );
            })}

            {/* ── Selection box rectangle ──────────────────────── */}
            {selBox && (
              <rect
                x={Math.min(selBox.x1, selBox.x2)}
                y={Math.min(selBox.y1, selBox.y2)}
                width={Math.abs(selBox.x2 - selBox.x1)}
                height={Math.abs(selBox.y2 - selBox.y1)}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={1.5 / zoom}
                strokeDasharray={`${5 / zoom} ${3 / zoom}`}
                rx={2 / zoom}
              />
            )}
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
          {kwPopoverNodeId !== null && (() => {
            const popNode = nodes.find(n => n.id === kwPopoverNodeId);
            if (!popNode) return null;
            const kwIds = (popNode.linkedKwIds || []) as string[];
            const placements = (popNode.kwPlacements || {}) as Record<string, string>;
            const canvasArea = canvasAreaRef.current;
            if (!canvasArea || kwIds.length === 0) return null;
            const rect = canvasArea.getBoundingClientRect();
            const popLeft = (popNode.x + popNode.w - viewX) * zoom + rect.left + 8;
            const popTop = (popNode.y - viewY) * zoom + rect.top;
            return (
              <div className="cvs-kw-popover" style={{ left: popLeft, top: popTop }} onClick={e => e.stopPropagation()}>
                <div className="cvs-kw-popover-header">
                  <span>{popNode.title} — {kwIds.length} keywords</span>
                  <button className="cvs-kw-popover-close" onClick={() => setKwPopoverNodeId(null)}>✕</button>
                </div>
                <div className="cvs-kw-popover-list">
                  {kwIds.map(id => {
                    const kw = allKeywords.find(k => k.id === id);
                    if (!kw) return null;
                    const pl = placements[id] || 'p';
                    return (
                      <div key={id} className={`cvs-kw-popover-item ${pl === 's' ? 'secondary' : 'primary'}`}>
                        <span className="cvs-kw-popover-kw">{kw.keyword}</span>
                        <span className="cvs-kw-popover-vol">{Number(kw.volume).toLocaleString()}</span>
                        <span className="cvs-kw-popover-pl">[{pl}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
        </>)}

        {editPanelNode && (
          <CanvasEditPanel
            node={editPanelNode}
            allKeywords={allKeywords}
            onSave={handleEditPanelSave}
            onClose={() => { setEditPanelNodeId(null); setSelectedIds(new Set()); }}
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
