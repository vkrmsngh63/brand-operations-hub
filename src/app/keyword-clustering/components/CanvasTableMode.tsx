'use client';
import { useMemo, useState, useCallback, useRef } from 'react';
import type { CanvasNode, Pathway, SisterLink } from '@/hooks/useCanvas';
import type { Keyword } from '@/hooks/useKeywords';
import './canvas-table-mode.css';

interface CanvasTableModeProps {
  nodes: CanvasNode[];
  pathways: Pathway[];
  sisterLinks: SisterLink[];
  allKeywords: Keyword[];
  onSelectNode?: (nodeId: number) => void;
  onUpdateNodes?: (updates: Partial<CanvasNode>[]) => void;
  onAddNode?: (data: Partial<CanvasNode>) => Promise<CanvasNode | null>;
  onDeleteNode?: (nodeId: number) => void;
}

interface TableRow {
  depth: number;
  title: string;
  altTitles: string[];
  relationship: string;
  parentTitle: string;
  conversionPath: string;
  sisterNodes: string[];
  keywords: { keyword: string; placement: string }[];
  description: string;
  nodeId: number;
}

/* ── Editable cell types ─────────────────────────────────────── */
type EditCell = { nodeId: number; col: 'title' | 'altTitles' | 'relationship' | 'description' } | null;

export default function CanvasTableMode({
  nodes, pathways, sisterLinks, allKeywords,
  onSelectNode, onUpdateNodes, onAddNode, onDeleteNode,
}: CanvasTableModeProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Edit state ─────────────────────────────────────────────── */
  const [editCell, setEditCell] = useState<EditCell>(null);
  const [editVal, setEditVal] = useState('');
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }

  /* ── Tree walk (depth-first) ────────────────────────────────── */
  const rows: TableRow[] = useMemo(() => {
    const result: TableRow[] = [];

    function getChildren(parentId: number) {
      return nodes
        .filter(n => n.parentId === parentId)
        .sort((a, b) => a.y - b.y);
    }

    function walk(node: CanvasNode, depth: number, parentNode: CanvasNode | null) {
      const kwList = ((node.linkedKwIds || []) as string[])
        .map(id => {
          const k = allKeywords.find(r => r.id === id);
          if (!k) return null;
          const pl = (node.kwPlacements && typeof node.kwPlacements === 'object')
            ? (node.kwPlacements as Record<string, string>)[id] || 'p'
            : 'p';
          return { keyword: k.keyword, placement: pl };
        })
        .filter(Boolean) as { keyword: string; placement: string }[];

      let convPath = '';
      if (node.pathwayId !== null) {
        const pathNodes = nodes.filter(n => n.pathwayId === node.pathwayId);
        const root = pathNodes.find(n => !n.parentId);
        if (root) convPath = root.title || ('Path ' + node.pathwayId);
      }

      const sisterTitles = sisterLinks
        .filter(sl => sl.nodeA === node.id || sl.nodeB === node.id)
        .map(sl => {
          const otherId = sl.nodeA === node.id ? sl.nodeB : sl.nodeA;
          const other = nodes.find(n => n.id === otherId);
          return other ? (other.title || '') : '';
        })
        .filter(Boolean);

      result.push({
        depth,
        title: node.title || '',
        altTitles: (node.altTitles || []).filter((t: string) => t) as string[],
        relationship: node.relationshipType || '',
        parentTitle: parentNode ? (parentNode.title || '') : '',
        conversionPath: convPath,
        sisterNodes: sisterTitles,
        keywords: kwList,
        description: node.description || '',
        nodeId: node.id,
      });

      const children = getChildren(node.id);
      const linears = children.filter(c => c.relationshipType === 'linear');
      const nesteds = children.filter(c => c.relationshipType === 'nested');
      linears.forEach(c => walk(c, depth + 1, node));
      nesteds.forEach(c => walk(c, depth + 1, node));
    }

    const roots = nodes
      .filter(n => !n.parentId)
      .sort((a, b) => (a.pathwayId || 0) - (b.pathwayId || 0) || a.y - b.y);
    roots.forEach(r => walk(r, 0, null));

    return result;
  }, [nodes, allKeywords, sisterLinks]);

  /* ── Copy as TSV ────────────────────────────────────────────── */
  const handleCopyTsv = useCallback(() => {
    const header = ['Depth', 'Topic', 'Alternate Titles', 'Relationship', 'Parent Topic', 'Conversion Path', 'Sister Nodes', 'Keywords', 'Topic Description'];
    const lines = rows.map(r => [
      r.depth,
      '\u00A0'.repeat(r.depth * 4) + r.title,
      r.altTitles.join(', '),
      r.relationship,
      r.parentTitle,
      r.conversionPath,
      r.sisterNodes.join(', '),
      r.keywords.map(k => k.keyword + ' [' + k.placement + ']').join(', '),
      r.description,
    ].join('\t'));
    const tsv = header.join('\t') + '\n' + lines.join('\n');
    navigator.clipboard.writeText(tsv).then(
      () => showToast(`\u2713 Copied ${rows.length} row${rows.length !== 1 ? 's' : ''} as TSV`),
      () => showToast('\u26A0 Failed to copy')
    );
  }, [rows]);

  /* ── Depth colors ───────────────────────────────────────────── */
  function depthColor(d: number): string {
    const colors = ['#1e40af', '#1d4ed8', '#7c3aed', '#0f766e', '#b45309', '#be185d', '#64748b'];
    return colors[Math.min(d, colors.length - 1)];
  }

  /* ── Row click ──────────────────────────────────────────────── */
  function handleRowClick(nodeId: number) {
    setSelectedRow(nodeId);
    if (onSelectNode) onSelectNode(nodeId);
  }

  /* ── Start editing a cell ──────────────────────────────────── */
  function startEdit(nodeId: number, col: EditCell extends null ? never : NonNullable<EditCell>['col'], currentVal: string) {
    if (!editMode) return;
    setEditCell({ nodeId, col });
    setEditVal(currentVal);
    // Focus will happen via useEffect or autoFocus
  }

  /* ── Commit an edit ────────────────────────────────────────── */
  function commitEdit() {
    if (!editCell || !onUpdateNodes) { setEditCell(null); return; }
    const { nodeId, col } = editCell;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) { setEditCell(null); return; }

    const trimmed = editVal.trim();

    if (col === 'title') {
      if (trimmed !== (node.title || '')) {
        onUpdateNodes([{ id: nodeId, title: trimmed } as Partial<CanvasNode>]);
      }
    } else if (col === 'altTitles') {
      const newAlts = trimmed ? trimmed.split(',').map(s => s.trim()).filter(Boolean) : [];
      const oldAlts = (node.altTitles || []).filter((t: string) => t);
      if (JSON.stringify(newAlts) !== JSON.stringify(oldAlts)) {
        onUpdateNodes([{ id: nodeId, altTitles: newAlts } as Partial<CanvasNode>]);
      }
    } else if (col === 'relationship') {
      const val = trimmed.toLowerCase();
      const allowed = val === 'linear' || val === 'nested' ? val : '';
      if (allowed !== (node.relationshipType || '')) {
        onUpdateNodes([{ id: nodeId, relationshipType: allowed } as Partial<CanvasNode>]);
      }
    } else if (col === 'description') {
      if (trimmed !== (node.description || '')) {
        onUpdateNodes([{ id: nodeId, description: trimmed } as Partial<CanvasNode>]);
      }
    }
    setEditCell(null);
  }

  /* ── Cancel edit ───────────────────────────────────────────── */
  function cancelEdit() {
    setEditCell(null);
  }

  /* ── Key handler for edit inputs ───────────────────────────── */
  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { cancelEdit(); }
    if (e.key === 'Tab') { e.preventDefault(); commitEdit(); }
  }

  /* ── Add new row ───────────────────────────────────────────── */
  async function handleAddRow() {
    if (!onAddNode) return;
    const newNode = await onAddNode({ title: 'New Topic', x: 0, y: (nodes.length + 1) * 150, w: 220, h: 120 });
    if (newNode) {
      showToast('\u2713 Row added');
      setSelectedRow(newNode.id);
    }
  }

  /* ── Delete row ────────────────────────────────────────────── */
  function handleDeleteRow(nodeId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDeleteNode) return;
    // Detach children first (reparent to null)
    const children = nodes.filter(n => n.parentId === nodeId);
    if (children.length > 0 && onUpdateNodes) {
      onUpdateNodes(children.map(c => ({ id: c.id, parentId: null, relationshipType: '' } as Partial<CanvasNode>)));
    }
    onDeleteNode(nodeId);
    if (selectedRow === nodeId) setSelectedRow(null);
    showToast('\u2713 Row deleted');
  }

  /* ── Render editable cell or static ────────────────────────── */
  function renderCell(nodeId: number, col: NonNullable<EditCell>['col'], display: React.ReactNode, rawVal: string, className?: string) {
    const isEditing = editCell?.nodeId === nodeId && editCell?.col === col;

    if (isEditing) {
      if (col === 'description') {
        return (
          <td className={`${className || ''} ctm-editing`}>
            <textarea
              ref={textareaRef}
              className="ctm-edit-textarea"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleEditKey}
              autoFocus
              rows={3}
            />
          </td>
        );
      }
      if (col === 'relationship') {
        return (
          <td className={`${className || ''} ctm-editing`}>
            <select
              className="ctm-edit-select"
              value={editVal}
              onChange={e => { setEditVal(e.target.value); }}
              onBlur={commitEdit}
              onKeyDown={handleEditKey}
              autoFocus
            >
              <option value="">(none)</option>
              <option value="linear">linear</option>
              <option value="nested">nested</option>
            </select>
          </td>
        );
      }
      return (
        <td className={`${className || ''} ctm-editing`}>
          <input
            ref={inputRef}
            className="ctm-edit-input"
            type="text"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleEditKey}
            autoFocus
          />
        </td>
      );
    }

    // Static cell — double-click or single-click in edit mode to start editing
    return (
      <td
        className={`${className || ''} ${editMode ? 'ctm-editable' : ''}`}
        onClick={() => { if (editMode) startEdit(nodeId, col, rawVal); }}
      >
        {display}
      </td>
    );
  }

  return (
    <div className="ctm-root">
      {/* Toolbar */}
      <div className="ctm-toolbar">
        <button className="ctm-btn" onClick={handleCopyTsv} title="Copy table as TSV for Excel">
          📋 Copy as TSV
        </button>
        <span className="ctm-sep" />
        <button
          className={`ctm-btn ${editMode ? 'ctm-btn-active' : ''}`}
          onClick={() => { setEditMode(m => !m); setEditCell(null); }}
          title={editMode ? 'Exit edit mode' : 'Enable editing cells'}
        >
          {editMode ? '✏️ Editing ON' : '✏️ Edit Mode'}
        </button>
        {editMode && onAddNode && (
          <button className="ctm-btn ctm-btn-add" onClick={handleAddRow} title="Add a new topic row">
            + Add Row
          </button>
        )}
        <span className="ctm-count">{rows.length} topic{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="ctm-table-wrap">
        <table className="ctm-table">
          <thead>
            <tr>
              {editMode && <th className="ctm-th-actions">✕</th>}
              <th className="ctm-th-depth">Depth</th>
              <th className="ctm-th-topic">Topic</th>
              <th className="ctm-th-alt">Alt Titles</th>
              <th className="ctm-th-rel">Rel</th>
              <th className="ctm-th-parent">Parent Topic</th>
              <th className="ctm-th-path">Conversion Path</th>
              <th className="ctm-th-sister">Sister Nodes</th>
              <th className="ctm-th-kw">Keywords</th>
              <th className="ctm-th-desc">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={editMode ? 10 : 9} className="ctm-empty">
                  No topics yet. {editMode ? 'Click "+ Add Row" to create one, or add nodes in Mindmap Mode.' : 'Add nodes in Mindmap Mode first.'}
                </td>
              </tr>
            ) : (
              rows.map(r => (
                <tr
                  key={r.nodeId}
                  className={selectedRow === r.nodeId ? 'ctm-row-sel' : ''}
                  onClick={() => handleRowClick(r.nodeId)}
                >
                  {/* Delete button (edit mode only) */}
                  {editMode && (
                    <td className="ctm-td-actions">
                      <button
                        className="ctm-del-btn"
                        onClick={e => handleDeleteRow(r.nodeId, e)}
                        title="Delete this row"
                      >✕</button>
                    </td>
                  )}

                  {/* Depth (not editable — derived) */}
                  <td className="ctm-td-depth" style={{ color: depthColor(r.depth) }}>
                    {r.depth}
                  </td>

                  {/* Topic (editable) */}
                  {renderCell(r.nodeId, 'title', (
                    <>
                      <span className="ctm-indent" style={{ width: r.depth * 16 }} />
                      <span className="ctm-depth-dot" style={{ background: depthColor(r.depth) }} />
                      <strong>{r.title || '(untitled)'}</strong>
                    </>
                  ), r.title, 'ctm-td-topic')}

                  {/* Alt Titles (editable — comma-separated) */}
                  {renderCell(r.nodeId, 'altTitles', r.altTitles.join(', '), r.altTitles.join(', '), 'ctm-td-alt')}

                  {/* Relationship (editable — dropdown) */}
                  {renderCell(r.nodeId, 'relationship', (
                    r.relationship ? (
                      <span className={`ctm-rel-badge ctm-rel-${r.relationship}`}>
                        {r.relationship}
                      </span>
                    ) : null
                  ), r.relationship, 'ctm-td-rel')}

                  {/* Parent Topic (not editable — derived from tree structure) */}
                  <td className="ctm-td-parent">{r.parentTitle}</td>

                  {/* Conversion Path (not editable — derived) */}
                  <td className="ctm-td-path">{r.conversionPath}</td>

                  {/* Sister Nodes (not editable — managed via canvas links) */}
                  <td className="ctm-td-sister">{r.sisterNodes.join(', ')}</td>

                  {/* Keywords (not editable — managed via drag-drop) */}
                  <td className="ctm-td-kw">
                    {r.keywords.map((k, i) => (
                      <span key={i} className={`ctm-kw-pill ${k.placement === 's' ? 'ctm-kw-sec' : ''}`}>
                        {k.keyword}
                        <span className="ctm-kw-pl">[{k.placement}]</span>
                      </span>
                    ))}
                  </td>

                  {/* Description (editable) */}
                  {renderCell(r.nodeId, 'description', r.description, r.description, 'ctm-td-desc')}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      <div className={`ctm-toast ${toast ? 'on' : ''}`}>{toast}</div>
    </div>
  );
}
