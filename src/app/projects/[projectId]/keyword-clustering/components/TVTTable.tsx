'use client';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { CanvasNode } from '@/hooks/useCanvas';
import type { Keyword } from '@/hooks/useKeywords';
import './tvt-table.css';

/* ── Types ───────────────────────────────────────────────────── */
interface TVTRow {
  node: CanvasNode;
  depth: number;
  hasChildren: boolean;
}

interface TVTTableProps {
  nodes: CanvasNode[];
  updateNodes: (updates: Partial<CanvasNode>[]) => Promise<void>;
  allKeywords: Keyword[];
}

/* ── Depth colors (7 levels) ─────────────────────────────────── */
const DEPTH_COLORS = [
  '#1e40af', // 0 — dark blue
  '#1d4ed8', // 1 — blue
  '#7c3aed', // 2 — purple
  '#0f766e', // 3 — teal
  '#b45309', // 4 — amber
  '#be185d', // 5 — pink
  '#64748b', // 6+ — slate
];

function depthColor(d: number) {
  return DEPTH_COLORS[Math.min(d, 6)];
}

/* ── Component ───────────────────────────────────────────────── */
export default function TVTTable({ nodes, updateNodes, allKeywords }: TVTTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showDesc, setShowDesc] = useState(true);
  const [fontSize, setFontSize] = useState(10);
  const [depthFilter, setDepthFilter] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [showDepthDropdown, setShowDepthDropdown] = useState(false);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const popoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // ── Drag state ─────────────────────────────────────────────
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ nodeId: string; mode: 'before' | 'after' | 'child' } | null>(null);

  // ── Build keyword lookup ───────────────────────────────────
  const kwMap = useMemo(() => {
    const m = new Map<string, Keyword>();
    allKeywords.forEach(kw => m.set(kw.id, kw));
    return m;
  }, [allKeywords]);

  // ── Depth-first tree walk ──────────────────────────────────
  const rows: TVTRow[] = useMemo(() => {
    const childMap = new Map<string | null, CanvasNode[]>();
    nodes.forEach(n => {
      const pid = n.parentId;
      if (!childMap.has(pid)) childMap.set(pid, []);
      childMap.get(pid)!.push(n);
    });
    // Sort children by y position (funnel order)
    childMap.forEach(children => children.sort((a, b) => a.y - b.y));

    const result: TVTRow[] = [];
    function walk(parentId: string | null, depth: number) {
      const children = childMap.get(parentId) || [];
      for (const node of children) {
        const hasKids = (childMap.get(node.id) || []).length > 0;
        result.push({ node, depth, hasChildren: hasKids });
        if (!collapsed.has(node.id)) {
          walk(node.id, depth + 1);
        }
      }
    }
    walk(null, 0);
    return result;
  }, [nodes, collapsed]);

  // ── Filtered rows by depth ─────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows.filter(r => depthFilter.has(Math.min(r.depth, 6)));
  }, [rows, depthFilter]);

  // ── Ancestry lookup (for highlight chain) ──────────────────
  const ancestorIds = useMemo(() => {
    if (hoveredRowId === null) return new Set<string>();
    const nodeMap = new Map<string, CanvasNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));
    const ids = new Set<string>();
    let cur = nodeMap.get(hoveredRowId);
    while (cur && cur.parentId !== null) {
      ids.add(cur.parentId);
      cur = nodeMap.get(cur.parentId);
    }
    return ids;
  }, [hoveredRowId, nodes]);

  // ── Volume for a node (sum of primary keyword volumes) ─────
  function nodeVolume(node: CanvasNode): number {
    let sum = 0;
    for (const kwId of (node.linkedKwIds || [])) {
      const placement = (node.kwPlacements || {})[kwId];
      if (placement !== 's') {
        const kw = kwMap.get(kwId);
        if (kw) sum += Number(kw.volume) || 0;
      }
    }
    return sum;
  }

  // ── Deduplicated total keyword count ───────────────────────
  const totalKwCount = useMemo(() => {
    const seen = new Set<string>();
    nodes.forEach(n => {
      (n.linkedKwIds || []).forEach(id => seen.add(id));
    });
    return seen.size;
  }, [nodes]);

  // ── Toggle expand/collapse ─────────────────────────────────
  function toggleCollapse(nodeId: string) {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  // ── Select/deselect ────────────────────────────────────────
  function toggleSelect(nodeId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }

  // ── Batch select operations ────────────────────────────────
  function selectAll() {
    setSelected(new Set(filteredRows.map(r => r.node.id)));
  }
  function deselectAll() {
    setSelected(new Set());
  }
  function expandAll() {
    setCollapsed(new Set());
  }
  function collapseAll() {
    const parents = new Set<string>();
    nodes.forEach(n => {
      if (n.parentId !== null) parents.add(n.parentId);
    });
    setCollapsed(parents);
  }

  // ── Zoom ───────────────────────────────────────────────────
  function zoomIn() { setFontSize(prev => Math.min(18, prev + 1)); }
  function zoomOut() { setFontSize(prev => Math.max(7, prev - 1)); }

  // ── Depth filter ───────────────────────────────────────────
  function toggleDepth(d: number) {
    setDepthFilter(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }
  function showAllDepths() {
    setDepthFilter(new Set([0, 1, 2, 3, 4, 5, 6]));
  }

  // ── Popover (description on hover) ─────────────────────────
  function handleTopicMouseEnter(e: React.MouseEvent, nodeId: string) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node?.description) return;
    if (popoverTimer.current) clearTimeout(popoverTimer.current);
    popoverTimer.current = setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setPopover({ nodeId, x: rect.left, y: rect.bottom + 4 });
    }, 250);
  }
  function handleTopicMouseLeave() {
    if (popoverTimer.current) clearTimeout(popoverTimer.current);
    setPopover(null);
  }

  // ── Drag and drop ─────────────────────────────────────────
  function handleDragStart(nodeId: string) {
    setDragNodeId(nodeId);
  }

  function handleDragOver(e: React.DragEvent, nodeId: string) {
    e.preventDefault();
    if (dragNodeId === null || dragNodeId === nodeId) return;

    // Check: don't drop onto own descendants
    const nodeMap = new Map<string, CanvasNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));
    function isDescendant(checkId: string, ancestorId: string): boolean {
      let cur = nodeMap.get(checkId);
      while (cur) {
        if (cur.parentId === ancestorId) return true;
        cur = cur.parentId !== null ? nodeMap.get(cur.parentId) : undefined;
      }
      return false;
    }
    if (isDescendant(nodeId, dragNodeId)) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const third = rect.height / 3;

    let mode: 'before' | 'after' | 'child';
    if (y < third) {
      mode = 'before';
    } else if (y > third * 2) {
      const x = e.clientX - rect.left;
      mode = x > rect.width * 0.4 ? 'child' : 'after';
    } else {
      mode = 'child';
    }

    setDropTarget({ nodeId, mode });
  }

  function handleDragEnd() {
    setDragNodeId(null);
    setDropTarget(null);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragNodeId || !dropTarget) { handleDragEnd(); return; }

    const targetNode = nodes.find(n => n.id === dropTarget.nodeId);
    const dragNode = nodes.find(n => n.id === dragNodeId);
    if (!targetNode || !dragNode) { handleDragEnd(); return; }

    const updates: Partial<CanvasNode>[] = [];

    if (dropTarget.mode === 'child') {
      // Make dragged node a child of target
      updates.push({ id: dragNodeId, parentId: targetNode.id, y: targetNode.y + targetNode.h + 20 });
    } else if (dropTarget.mode === 'before') {
      // Insert before target (same parent)
      updates.push({ id: dragNodeId, parentId: targetNode.parentId, y: targetNode.y - 10 });
    } else {
      // Insert after target (same parent)
      updates.push({ id: dragNodeId, parentId: targetNode.parentId, y: targetNode.y + 10 });
    }

    await updateNodes(updates);
    handleDragEnd();
  }

  // ── Render keywords for a node ─────────────────────────────
  function renderKeywords(node: CanvasNode) {
    const kwIds = node.linkedKwIds || [];
    if (kwIds.length === 0) return <span className="tvt-no-kw">—</span>;

    return kwIds.map((kwId, i) => {
      const kw = kwMap.get(kwId);
      if (!kw) return null;
      const placement = (node.kwPlacements || {})[kwId];
      const isSecondary = placement === 's';
      return (
        <span key={kwId}>
          {i > 0 && ', '}
          <span className={isSecondary ? 'tvt-kw-secondary' : 'tvt-kw-primary'}>
            {kw.keyword}{isSecondary && ' [s]'}
          </span>
        </span>
      );
    });
  }

  // ── Row class computation ──────────────────────────────────
  function rowClasses(nodeId: string) {
    const cls = ['tvt-row'];
    if (hoveredRowId === nodeId) cls.push('tvt-row-hovered');
    if (ancestorIds.has(nodeId)) cls.push('tvt-row-ancestor');
    if (dragNodeId === nodeId) cls.push('tvt-row-dragging');
    return cls.join(' ');
  }

  // ── Drop indicator class ───────────────────────────────────
  function dropIndicatorClass(nodeId: string) {
    if (!dropTarget || dropTarget.nodeId !== nodeId) return '';
    return `tvt-drop-${dropTarget.mode}`;
  }

  return (
    <div className="tvt-panel" style={{ fontSize: `${fontSize}px` }}>
      {/* ── Action Bar ─────────────────────────────────────── */}
      <div className="tvt-action-bar">
        <button className="tvt-act-btn" onClick={() => { collapsed.size === 0 ? collapseAll() : expandAll(); }}>
          {collapsed.size === 0 ? '▶ Collapse All' : '▼ Expand All'}
        </button>
        <button className="tvt-act-btn" onClick={selectAll}>☑ Check All</button>
        <button className="tvt-act-btn" onClick={deselectAll}>☐ Uncheck All</button>

        <div className="tvt-depth-filter-wrap">
          <button
            className="tvt-act-btn"
            onClick={() => setShowDepthDropdown(p => !p)}
          >
            Filter Depths ▾
          </button>
          {showDepthDropdown && (
            <div className="tvt-depth-dropdown">
              <label className="tvt-depth-opt">
                <input
                  type="checkbox"
                  checked={depthFilter.size === 7}
                  onChange={showAllDepths}
                />
                Show All Main Topics
              </label>
              {[0, 1, 2, 3, 4, 5, 6].map(d => (
                <label key={d} className="tvt-depth-opt">
                  <input
                    type="checkbox"
                    checked={depthFilter.has(d)}
                    onChange={() => toggleDepth(d)}
                  />
                  <span className="tvt-depth-dot" style={{ background: depthColor(d) }} />
                  Depth {d}{d === 6 ? '+' : ''}
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="tvt-desc-toggle">
          <input type="checkbox" checked={showDesc} onChange={e => setShowDesc(e.target.checked)} />
          Main Topic Description
        </label>

        <div className="tvt-zoom">
          <button className="tvt-act-btn" onClick={zoomOut}>−</button>
          <span className="tvt-zoom-label">{Math.round((fontSize / 10) * 100)}%</span>
          <button className="tvt-act-btn" onClick={zoomIn}>+</button>
        </div>

        <span className="tvt-kw-count">{totalKwCount} keywords</span>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="tvt-scroll" ref={tableRef}>
        <table className="tvt-table">
          <thead>
            <tr>
              <th className="tvt-th tvt-th-cb" style={{ width: '28px' }}></th>
              <th className="tvt-th tvt-th-drag" style={{ width: '24px' }}></th>
              <th className="tvt-th tvt-th-topic">Main Topic</th>
              <th className="tvt-th tvt-th-kw">Keywords</th>
              {showDesc && <th className="tvt-th tvt-th-desc">Main Topic Description</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr
                key={row.node.id}
                className={`${rowClasses(row.node.id)} ${dropIndicatorClass(row.node.id)}`}
                onMouseEnter={() => setHoveredRowId(row.node.id)}
                onMouseLeave={() => { setHoveredRowId(null); handleTopicMouseLeave(); }}
                onDragOver={e => handleDragOver(e, row.node.id)}
                onDrop={handleDrop}
              >
                {/* Checkbox */}
                <td className="tvt-td tvt-td-cb">
                  <input
                    type="checkbox"
                    checked={selected.has(row.node.id)}
                    onChange={() => toggleSelect(row.node.id)}
                  />
                </td>

                {/* Drag handle */}
                <td
                  className="tvt-td tvt-td-drag"
                  draggable
                  onDragStart={() => handleDragStart(row.node.id)}
                  onDragEnd={handleDragEnd}
                >
                  ⋮⋮
                </td>

                {/* Main Topic */}
                <td className="tvt-td tvt-td-topic">
                  <div
                    className="tvt-topic-content"
                    style={{ paddingLeft: `${row.depth * 20}px` }}
                  >
                    {row.hasChildren && (
                      <button
                        className="tvt-collapse-btn"
                        onClick={() => toggleCollapse(row.node.id)}
                      >
                        {collapsed.has(row.node.id) ? '▶' : '▼'}
                      </button>
                    )}
                    {!row.hasChildren && <span className="tvt-collapse-spacer" />}
                    <span
                      className="tvt-depth-dot"
                      style={{ background: depthColor(row.depth) }}
                    />
                    <span
                      className="tvt-topic-title"
                      style={{ color: depthColor(row.depth) }}
                      onMouseEnter={e => handleTopicMouseEnter(e, row.node.id)}
                      onMouseLeave={handleTopicMouseLeave}
                    >
                      {row.node.title || '(untitled)'}
                    </span>
                    {nodeVolume(row.node) > 0 && (
                      <span className="tvt-volume-badge">
                        ({nodeVolume(row.node).toLocaleString()})
                      </span>
                    )}
                  </div>
                </td>

                {/* Keywords */}
                <td className="tvt-td tvt-td-kw">
                  {renderKeywords(row.node)}
                </td>

                {/* Description */}
                {showDesc && (
                  <td className="tvt-td tvt-td-desc">
                    {row.node.description || ''}
                  </td>
                )}
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td className="tvt-td tvt-empty" colSpan={showDesc ? 5 : 4}>
                  {nodes.length === 0
                    ? 'No topics yet — add nodes on the canvas first'
                    : 'No topics match the current depth filter'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Description popover ────────────────────────────── */}
      {popover && (() => {
        const node = nodes.find(n => n.id === popover.nodeId);
        if (!node?.description) return null;
        return (
          <div
            className="tvt-popover"
            style={{ left: popover.x, top: popover.y }}
          >
            {node.description}
          </div>
        );
      })()}
    </div>
  );
}
