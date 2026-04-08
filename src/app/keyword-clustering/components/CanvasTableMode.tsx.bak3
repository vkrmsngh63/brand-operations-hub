'use client';
import { useMemo, useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
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
  x: number;
  y: number;
}

/* ── Editable cell types ─────────────────────────────────────── */
type EditCell = { nodeId: number; col: 'title' | 'altTitles' | 'relationship' | 'description' } | null;

/* ── Parsed TSV row ──────────────────────────────────────────── */
interface ParsedTsvRow {
  title: string;
  altTitles: string[];
  relationship: string;
  description: string;
  parentTitle: string;
  keywordsRaw: string;
  x: number | null;
  y: number | null;
}

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

  /* ── TSV import state ───────────────────────────────────────── */
  const [showTsvOverlay, setShowTsvOverlay] = useState(false);
  const [tsvText, setTsvText] = useState('');
  const [tsvProcessing, setTsvProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showImportChoice, setShowImportChoice] = useState(false);
  const [pendingTsvData, setPendingTsvData] = useState<ParsedTsvRow[]>([]);

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
        x: node.x,
        y: node.y,
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
    const header = ['Depth', 'Topic', 'Alternate Titles', 'Relationship', 'Parent Topic', 'Conversion Path', 'Sister Nodes', 'Keywords', 'Topic Description', 'X', 'Y'];
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
      Math.round(r.x),
      Math.round(r.y),
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
  function startEdit(nodeId: number, col: NonNullable<EditCell>['col'], currentVal: string) {
    if (!editMode) return;
    setEditCell({ nodeId, col });
    setEditVal(currentVal);
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

  function cancelEdit() { setEditCell(null); }

  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { cancelEdit(); }
    if (e.key === 'Tab') { e.preventDefault(); commitEdit(); }
  }

  /* ── Add new row ───────────────────────────────────────────── */
  async function handleAddRow() {
    if (!onAddNode) return;
    // Find a non-overlapping position
    const w = 220, h = 120, gap = 30;
    let ny = 0;
    for (const n of nodes) {
      const bottom = n.y + n.h + gap;
      if (bottom > ny) ny = bottom;
    }
    const newNode = await onAddNode({ title: 'New Topic', x: 0, y: ny, w, h });
    if (newNode) {
      showToast('\u2713 Row added');
      setSelectedRow(newNode.id);
    }
  }

  /* ── Delete row ────────────────────────────────────────────── */
  function handleDeleteRow(nodeId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!onDeleteNode) return;
    const children = nodes.filter(n => n.parentId === nodeId);
    if (children.length > 0 && onUpdateNodes) {
      onUpdateNodes(children.map(c => ({ id: c.id, parentId: null, relationshipType: '' } as Partial<CanvasNode>)));
    }
    onDeleteNode(nodeId);
    if (selectedRow === nodeId) setSelectedRow(null);
    showToast('\u2713 Row deleted');
  }

  /* ══════════════════════════════════════════════════════════════
     TSV IMPORT — Parse, match by title, update/create
     ══════════════════════════════════════════════════════════════ */

  function parseTsv(raw: string): ParsedTsvRow[] {
    const lines = raw.split('\n').map(l => l.replace(/\r$/, ''));
    if (lines.length === 0) return [];

    // Detect and skip header row
    const firstLower = lines[0].toLowerCase();
    const hasHeader = firstLower.includes('topic') || firstLower.includes('depth');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Column index map — defaults match our export order:
    // Depth(0) Topic(1) AltTitles(2) Relationship(3) ParentTopic(4) ConversionPath(5) SisterNodes(6) Keywords(7) Description(8) X(9) Y(10)
    const colMap = { title: 1, altTitles: 2, relationship: 3, parentTitle: 4, keywords: 7, description: 8, x: 9, y: 10 };

    if (hasHeader) {
      const hCols = lines[0].split('\t').map(h => h.trim().toLowerCase());
      hCols.forEach((h, i) => {
        if (h.includes('topic') && !h.includes('parent') && !h.includes('description') && !h.includes('sister')) colMap.title = i;
        else if (h.includes('alternate') || h.includes('alt title')) colMap.altTitles = i;
        else if (h.includes('relationship') || h === 'rel') colMap.relationship = i;
        else if (h.includes('parent')) colMap.parentTitle = i;
        else if (h.includes('keyword')) colMap.keywords = i;
        else if (h.includes('description')) colMap.description = i;
        else if (h === 'x') colMap.x = i;
        else if (h === 'y') colMap.y = i;
      });
    }

    const result: ParsedTsvRow[] = [];
    for (const line of dataLines) {
      if (!line.trim()) continue;
      const cols = line.split('\t');
      const rawTitle = (cols[colMap.title] || '').replace(/^[\s\u00A0]+/, '').trim();
      if (!rawTitle) continue;

      result.push({
        title: rawTitle,
        altTitles: (cols[colMap.altTitles] || '').trim()
          ? (cols[colMap.altTitles] || '').split(',').map(s => s.trim()).filter(Boolean)
          : [],
        relationship: (cols[colMap.relationship] || '').trim().toLowerCase(),
        description: (cols[colMap.description] || '').trim(),
        parentTitle: (cols[colMap.parentTitle] || '').replace(/^[\s\u00A0]+/, '').trim(),
        keywordsRaw: (cols[colMap.keywords] || '').trim(),
        x: cols[colMap.x] ? parseFloat(cols[colMap.x]) || null : null,
        y: cols[colMap.y] ? parseFloat(cols[colMap.y]) || null : null,
      });
    }
    return result;
  }

  async function applyTsvData(parsed: ParsedTsvRow[], mode: 'merge' | 'overwrite' = 'merge') {
    if (parsed.length === 0) { showToast('\u26A0 No valid rows found in TSV'); return; }
    if (!onUpdateNodes || !onAddNode) { showToast('\u26A0 Edit callbacks not available'); return; }

    setTsvProcessing(true);

    // Overwrite mode: delete all existing nodes first
    if (mode === 'overwrite' && onDeleteNode) {
      const allIds = nodes.map(n => n.id);
      for (const id of allIds) {
        onDeleteNode(id);
      }
      // Small delay to let state settle
      await new Promise(r => setTimeout(r, 100));
    }

    let updated = 0;
    let created = 0;

    // Build title→node lookup (case-insensitive) — will be empty after overwrite
    const currentNodes = mode === 'overwrite' ? [] : nodes;
    const titleMap = new Map<string, CanvasNode>();
    for (const n of currentNodes) {
      if (n.title) titleMap.set(n.title.toLowerCase(), n);
    }

    const updates: Partial<CanvasNode>[] = [];
    const toCreate: ParsedTsvRow[] = [];

    for (const row of parsed) {
      const existing = titleMap.get(row.title.toLowerCase());
      if (existing) {
        const upd: Partial<CanvasNode> = { id: existing.id };
        let changed = false;

        // Only update title if it differs in casing
        if (row.title !== (existing.title || '') && row.title.toLowerCase() === (existing.title || '').toLowerCase()) {
          upd.title = row.title; changed = true;
        }

        // Only update alt titles if TSV has non-empty alt titles
        if (row.altTitles.length > 0) {
          const oldAlts = (existing.altTitles || []).filter((t: string) => t);
          if (JSON.stringify(row.altTitles) !== JSON.stringify(oldAlts)) {
            upd.altTitles = row.altTitles; changed = true;
          }
        }

        // Only update relationship if TSV has a valid non-empty value
        if (row.relationship === 'linear' || row.relationship === 'nested') {
          if (row.relationship !== (existing.relationshipType || '')) {
            upd.relationshipType = row.relationship; changed = true;
          }
        }
        // If TSV relationship is empty, leave existing relationship untouched

        // Only update description if TSV has non-empty description
        if (row.description && row.description !== (existing.description || '')) {
          upd.description = row.description; changed = true;
        }

        // Update position if TSV has coordinates
        if (row.x !== null && row.x !== existing.x) {
          upd.x = row.x; changed = true;
        }
        if (row.y !== null && row.y !== existing.y) {
          upd.y = row.y; changed = true;
        }

        // Only update parent if TSV has a non-empty parent title
        if (row.parentTitle) {
          const parent = titleMap.get(row.parentTitle.toLowerCase());
          if (parent && parent.id !== existing.parentId) {
            upd.parentId = parent.id;
            // Set relationship if provided, otherwise default to nested
            if (!upd.relationshipType && !existing.relationshipType) {
              upd.relationshipType = 'nested';
            }
            changed = true;
          }
        }

        // Handle keyword placements from TSV (e.g. "keyword [p], other [s]")
        if (row.keywordsRaw) {
          const kwEntries = row.keywordsRaw.split(',').map(s => s.trim()).filter(Boolean);
          const newPlacements: Record<string, string> = { ...(existing.kwPlacements || {}) };
          let linkedIds = [...(existing.linkedKwIds || []) as string[]];
          let kwChanged = false;
          for (const entry of kwEntries) {
            const match = entry.match(/^(.+?)\s*\[([ps])\]\s*$/);
            const kwText = match ? match[1].trim() : entry.replace(/\s*\[[ps]\]\s*$/, '').trim();
            const placement = match ? match[2] : 'p';
            const kwObj = allKeywords.find(k => k.keyword.toLowerCase() === kwText.toLowerCase());
            if (kwObj) {
              if (newPlacements[kwObj.id] !== placement) {
                newPlacements[kwObj.id] = placement;
                kwChanged = true;
              }
              if (!linkedIds.includes(kwObj.id)) {
                linkedIds.push(kwObj.id);
                kwChanged = true;
              }
            }
          }
          if (kwChanged) {
            upd.linkedKwIds = linkedIds;
            upd.kwPlacements = newPlacements;
            changed = true;
          }
        }

        if (changed) { updates.push(upd); updated++; }
      } else {
        toCreate.push(row);
      }
    }

    // Batch update existing nodes
    if (updates.length > 0) {
      onUpdateNodes(updates);
    }

    // Create new nodes — first pass: create all without parent links
    // Collect all occupied positions for overlap avoidance
    const occupied: { x: number; y: number; w: number; h: number }[] = nodes.map(n => ({ x: n.x, y: n.y, w: n.w, h: n.h }));

    function findNonOverlappingY(startX: number, startY: number, w: number, h: number): { x: number; y: number } {
      let cx = startX, cy = startY;
      let attempts = 0;
      while (attempts < 100) {
        const overlaps = occupied.some(o =>
          cx < o.x + o.w && cx + w > o.x && cy < o.y + o.h && cy + h > o.y
        );
        if (!overlaps) break;
        cy += h + 30; // shift down
        attempts++;
      }
      return { x: cx, y: cy };
    }

    const newNodesByTitle = new Map<string, CanvasNode>();
    for (const row of toCreate) {
      let nx = row.x ?? 0;
      let ny = row.y ?? (nodes.length + created + 1) * 150;
      // If no position from TSV, find a non-overlapping spot
      if (row.x === null || row.y === null) {
        const pos = findNonOverlappingY(nx, ny, 220, 120);
        nx = pos.x; ny = pos.y;
      }
      const newNode = await onAddNode({
        title: row.title,
        description: row.description || '',
        altTitles: row.altTitles.length > 0 ? row.altTitles : [],
        x: nx,
        y: ny,
        w: 220,
        h: 120,
      });
      if (newNode) {
        occupied.push({ x: nx, y: ny, w: 220, h: 120 });
        newNodesByTitle.set(row.title.toLowerCase(), newNode);
        created++;
      }
    }

    // Second pass: set parent relationships and relationship types for new nodes
    const parentUpdates: Partial<CanvasNode>[] = [];
    for (const row of toCreate) {
      const childNode = newNodesByTitle.get(row.title.toLowerCase());
      if (!childNode) continue;

      const rel = row.relationship === 'linear' || row.relationship === 'nested' ? row.relationship : '';

      if (row.parentTitle) {
        const parent = titleMap.get(row.parentTitle.toLowerCase()) || newNodesByTitle.get(row.parentTitle.toLowerCase());
        if (parent) {
          parentUpdates.push({
            id: childNode.id,
            parentId: parent.id,
            relationshipType: rel || 'nested',
          } as Partial<CanvasNode>);
          continue; // relationship set with parent
        }
      }

      // No parent but has relationship type — still set it
      if (rel) {
        parentUpdates.push({
          id: childNode.id,
          relationshipType: rel,
        } as Partial<CanvasNode>);
      }
    }
    if (parentUpdates.length > 0) {
      onUpdateNodes(parentUpdates);
    }

    setTsvProcessing(false);
    showToast(`\u2713 TSV imported: ${updated} updated, ${created} created`);
  }

  async function handleTsvPaste() {
    const parsed = parseTsv(tsvText);
    if (parsed.length === 0) { showToast('\u26A0 No valid rows found'); return; }
    // If there are existing nodes, ask merge or overwrite
    if (nodes.length > 0) {
      setPendingTsvData(parsed);
      setShowTsvOverlay(false);
      setShowImportChoice(true);
      return;
    }
    await applyTsvData(parsed, 'overwrite');
    setShowTsvOverlay(false);
    setTsvText('');
  }

  async function handleImportChoice(mode: 'merge' | 'overwrite') {
    setShowImportChoice(false);
    await applyTsvData(pendingTsvData, mode);
    setPendingTsvData([]);
    setTsvText('');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    async function processData(parsed: ParsedTsvRow[]) {
      if (parsed.length === 0) { showToast('\u26A0 No valid rows found'); return; }
      if (nodes.length > 0) {
        setPendingTsvData(parsed);
        setShowImportChoice(true);
      } else {
        await applyTsvData(parsed, 'overwrite');
      }
    }

    if (ext === 'xlsx' || ext === 'xls' || ext === 'xlsm') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const data = ev.target?.result;
        if (!data) return;
        try {
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const tsv = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
          const parsed = parseTsv(tsv);
          await processData(parsed);
        } catch (err) {
          console.error('Excel parse error:', err);
          showToast('\u26A0 Failed to read Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const text = ev.target?.result;
        if (typeof text === 'string') {
          const parsed = parseTsv(text);
          await processData(parsed);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  /* ── Reset table (delete all nodes) ────────────────────────── */
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  async function handleResetTable() {
    if (!onDeleteNode) return;
    const allIds = nodes.map(n => n.id);
    for (const id of allIds) {
      onDeleteNode(id);
    }
    setShowResetConfirm(false);
    setSelectedRow(null);
    showToast(`\u2713 Table reset — ${allIds.length} node${allIds.length !== 1 ? 's' : ''} removed`);
  }

  /* ── TSV preview rows (parsed on the fly) ──────────────────── */
  const tsvPreviewRows = useMemo(() => {
    if (!tsvText.trim()) return [];
    return parseTsv(tsvText);
  }, [tsvText]);

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
        <span className="ctm-sep" />
        <button className="ctm-btn" onClick={() => { setShowTsvOverlay(true); setTsvText(''); }} title="Paste TSV data to update canvas">
          📋 Paste TSV
        </button>
        <button className="ctm-btn" onClick={() => fileInputRef.current?.click()} title="Upload a TSV file to update canvas">
          📁 Upload TSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".tsv,.txt,.csv,.xlsx,.xls,.xlsm"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <span className="ctm-sep" />
        <button className="ctm-btn ctm-btn-danger" onClick={() => setShowResetConfirm(true)} title="Delete all nodes and reset table">
          🗑 Reset Table
        </button>
        <span className="ctm-count">{rows.length} topic{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* TSV Paste Overlay */}
      {showTsvOverlay && (
        <div className="ctm-tsv-overlay">
          <div className="ctm-tsv-panel">
            <div className="ctm-tsv-header">
              <strong>Paste TSV Data</strong>
              <button className="ctm-tsv-close" onClick={() => setShowTsvOverlay(false)}>✕</button>
            </div>
            <p className="ctm-tsv-hint">
              Paste from Excel or any tab-separated source below. Rows are matched to existing topics by title.
              New titles create new nodes.
            </p>
            <textarea
              className="ctm-tsv-textarea"
              value={tsvText}
              onChange={e => setTsvText(e.target.value)}
              placeholder="Paste from Excel or TSV here..."
              rows={4}
              autoFocus
            />
            {/* Live table preview */}
            {tsvPreviewRows.length > 0 && (
              <div className="ctm-tsv-preview-wrap">
                <div className="ctm-tsv-preview-label">{tsvPreviewRows.length} row{tsvPreviewRows.length !== 1 ? 's' : ''} detected:</div>
                <div className="ctm-tsv-preview-scroll">
                  <table className="ctm-tsv-preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Topic</th>
                        <th>Alt Titles</th>
                        <th>Rel</th>
                        <th>Parent</th>
                        <th>Keywords</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tsvPreviewRows.map((pr, i) => {
                        const isExisting = nodes.some(n => n.title && n.title.toLowerCase() === pr.title.toLowerCase());
                        return (
                          <tr key={i} className={isExisting ? 'ctm-tsv-row-update' : 'ctm-tsv-row-new'}>
                            <td>{i + 1}</td>
                            <td><strong>{pr.title}</strong></td>
                            <td>{pr.altTitles.join(', ')}</td>
                            <td>{pr.relationship}</td>
                            <td>{pr.parentTitle}</td>
                            <td>{pr.keywordsRaw}</td>
                            <td>{pr.description.length > 60 ? pr.description.slice(0, 60) + '...' : pr.description}</td>
                            <td>
                              <span className={`ctm-tsv-status ${isExisting ? 'ctm-tsv-status-update' : 'ctm-tsv-status-new'}`}>
                                {isExisting ? 'Update' : 'New'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="ctm-tsv-actions">
              <button className="ctm-btn" onClick={() => setShowTsvOverlay(false)}>Cancel</button>
              <button
                className="ctm-btn ctm-btn-add"
                onClick={handleTsvPaste}
                disabled={!tsvText.trim() || tsvProcessing || tsvPreviewRows.length === 0}
              >
                {tsvProcessing ? 'Processing...' : `\u2713 Apply ${tsvPreviewRows.length} Row${tsvPreviewRows.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirm Dialog */}
      {showResetConfirm && (
        <div className="ctm-tsv-overlay">
          <div className="ctm-tsv-panel ctm-reset-panel">
            <div className="ctm-tsv-header">
              <strong>🗑 Reset Table</strong>
              <button className="ctm-tsv-close" onClick={() => setShowResetConfirm(false)}>✕</button>
            </div>
            <p className="ctm-reset-msg">
              This will permanently delete all <strong>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</strong> from the canvas. This cannot be undone.
            </p>
            <div className="ctm-tsv-actions">
              <button className="ctm-btn" onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button className="ctm-btn ctm-btn-danger" onClick={handleResetTable}>
                🗑 Delete All Nodes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Mode Choice Dialog */}
      {showImportChoice && (
        <div className="ctm-tsv-overlay">
          <div className="ctm-tsv-panel ctm-reset-panel">
            <div className="ctm-tsv-header">
              <strong>📥 Import {pendingTsvData.length} Row{pendingTsvData.length !== 1 ? 's' : ''}</strong>
              <button className="ctm-tsv-close" onClick={() => { setShowImportChoice(false); setPendingTsvData([]); }}>✕</button>
            </div>
            <p className="ctm-reset-msg">
              You have <strong>{nodes.length} existing node{nodes.length !== 1 ? 's' : ''}</strong> on the canvas. How would you like to import?
            </p>
            <div className="ctm-import-options">
              <button className="ctm-btn ctm-import-btn ctm-import-merge" onClick={() => handleImportChoice('merge')}>
                <strong>📥 Merge</strong>
                <span>Update existing topics by name, add new ones. Keep current positions.</span>
              </button>
              <button className="ctm-btn ctm-import-btn ctm-import-overwrite" onClick={() => handleImportChoice('overwrite')}>
                <strong>🔄 Overwrite All</strong>
                <span>Delete all existing nodes and replace with imported data.</span>
              </button>
            </div>
            <div className="ctm-tsv-actions">
              <button className="ctm-btn" onClick={() => { setShowImportChoice(false); setPendingTsvData([]); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                  {editMode && (
                    <td className="ctm-td-actions">
                      <button
                        className="ctm-del-btn"
                        onClick={e => handleDeleteRow(r.nodeId, e)}
                        title="Delete this row"
                      >✕</button>
                    </td>
                  )}

                  <td className="ctm-td-depth" style={{ color: depthColor(r.depth) }}>
                    {r.depth}
                  </td>

                  {renderCell(r.nodeId, 'title', (
                    <>
                      <span className="ctm-indent" style={{ width: r.depth * 16 }} />
                      <span className="ctm-depth-dot" style={{ background: depthColor(r.depth) }} />
                      <strong>{r.title || '(untitled)'}</strong>
                    </>
                  ), r.title, 'ctm-td-topic')}

                  {renderCell(r.nodeId, 'altTitles', r.altTitles.join(', '), r.altTitles.join(', '), 'ctm-td-alt')}

                  {renderCell(r.nodeId, 'relationship', (
                    r.relationship ? (
                      <span className={`ctm-rel-badge ctm-rel-${r.relationship}`}>
                        {r.relationship}
                      </span>
                    ) : null
                  ), r.relationship, 'ctm-td-rel')}

                  <td className="ctm-td-parent">{r.parentTitle}</td>
                  <td className="ctm-td-path">{r.conversionPath}</td>
                  <td className="ctm-td-sister">{r.sisterNodes.join(', ')}</td>

                  <td className="ctm-td-kw">
                    {r.keywords.map((k, i) => (
                      <span key={i} className={`ctm-kw-pill ${k.placement === 's' ? 'ctm-kw-sec' : ''}`}>
                        {k.keyword}
                        <span className="ctm-kw-pl">[{k.placement}]</span>
                      </span>
                    ))}
                  </td>

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
