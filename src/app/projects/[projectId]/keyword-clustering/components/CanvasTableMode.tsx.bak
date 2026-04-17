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

export default function CanvasTableMode({ nodes, pathways, sisterLinks, allKeywords, onSelectNode }: CanvasTableModeProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Keywords with placement markers
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

      // Conversion Path = title of root node in this pathway
      let convPath = '';
      if (node.pathwayId !== null) {
        const pathNodes = nodes.filter(n => n.pathwayId === node.pathwayId);
        const root = pathNodes.find(n => !n.parentId);
        if (root) convPath = root.title || ('Path ' + node.pathwayId);
      }

      // Sister nodes
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

      // Walk linear children first (peer sequence), then nested (sub-topics)
      const children = getChildren(node.id);
      const linears = children.filter(c => c.relationshipType === 'linear');
      const nesteds = children.filter(c => c.relationshipType === 'nested');
      linears.forEach(c => walk(c, depth + 1, node));
      nesteds.forEach(c => walk(c, depth + 1, node));
    }

    // Find roots (no parent), sorted by pathway then Y
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

  return (
    <div className="ctm-root">
      {/* Toolbar */}
      <div className="ctm-toolbar">
        <button className="ctm-btn" onClick={handleCopyTsv} title="Copy table as TSV for Excel">
          📋 Copy as TSV
        </button>
        <span className="ctm-count">{rows.length} topic{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="ctm-table-wrap">
        <table className="ctm-table">
          <thead>
            <tr>
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
                <td colSpan={9} className="ctm-empty">
                  No topics yet. Add nodes in Mindmap Mode first.
                </td>
              </tr>
            ) : (
              rows.map(r => (
                <tr
                  key={r.nodeId}
                  className={selectedRow === r.nodeId ? 'ctm-row-sel' : ''}
                  onClick={() => handleRowClick(r.nodeId)}
                >
                  {/* Depth */}
                  <td className="ctm-td-depth" style={{ color: depthColor(r.depth) }}>
                    {r.depth}
                  </td>

                  {/* Topic (indented) */}
                  <td className="ctm-td-topic">
                    <span className="ctm-indent" style={{ width: r.depth * 16 }} />
                    <span className="ctm-depth-dot" style={{ background: depthColor(r.depth) }} />
                    <strong>{r.title || '(untitled)'}</strong>
                  </td>

                  {/* Alt Titles */}
                  <td className="ctm-td-alt">
                    {r.altTitles.join(', ')}
                  </td>

                  {/* Relationship */}
                  <td className="ctm-td-rel">
                    {r.relationship && (
                      <span className={`ctm-rel-badge ctm-rel-${r.relationship}`}>
                        {r.relationship}
                      </span>
                    )}
                  </td>

                  {/* Parent Topic */}
                  <td className="ctm-td-parent">{r.parentTitle}</td>

                  {/* Conversion Path */}
                  <td className="ctm-td-path">{r.conversionPath}</td>

                  {/* Sister Nodes */}
                  <td className="ctm-td-sister">{r.sisterNodes.join(', ')}</td>

                  {/* Keywords */}
                  <td className="ctm-td-kw">
                    {r.keywords.map((k, i) => (
                      <span key={i} className={`ctm-kw-pill ${k.placement === 's' ? 'ctm-kw-sec' : ''}`}>
                        {k.keyword}
                        <span className="ctm-kw-pl">[{k.placement}]</span>
                      </span>
                    ))}
                  </td>

                  {/* Description */}
                  <td className="ctm-td-desc">{r.description}</td>
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
