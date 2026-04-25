'use client';
import { useState, useMemo, useCallback } from 'react';
import type { CanvasNode } from '@/hooks/useCanvas';
import type { Keyword } from '@/hooks/useKeywords';
import './kas-table.css';

/* ── Types ───────────────────────────────────────────────────── */
interface KASTableProps {
  nodes: CanvasNode[];
  allKeywords: Keyword[];
}

interface UpstreamEntry {
  title: string;
  description: string;
  location: string;
}

interface MainTopicEntry {
  title: string;
  description: string;
  location: string;
  upstreamChain: UpstreamEntry[];
  subRowCount: number;
}

interface KASGroup {
  keyword: string;
  volume: number;
  mainTopics: MainTopicEntry[];
  totalSubRows: number;
}

/* ── Component ───────────────────────────────────────────────── */
export default function KASTable({ nodes, allKeywords }: KASTableProps) {

  // ── Build keyword lookup ───────────────────────────────────
  const kwMap = useMemo(() => {
    const m = new Map<string, Keyword>();
    allKeywords.forEach(kw => m.set(kw.id, kw));
    return m;
  }, [allKeywords]);

  // ── Build KAS data (derived from canvas nodes + keywords) ──
  const data: KASGroup[] = useMemo(() => {
    // Step 1: Build tree walk + topic index
    const childMap = new Map<string | null, CanvasNode[]>();
    nodes.forEach(n => {
      const pid = n.parentId;
      if (!childMap.has(pid)) childMap.set(pid, []);
      childMap.get(pid)!.push(n);
    });
    childMap.forEach(children => children.sort((a, b) => a.y - b.y));

    interface TopicInfo {
      node: CanvasNode;
      depth: number;
      parentNode: CanvasNode | null;
    }

    const topicIndex = new Map<string, TopicInfo>();
    function walk(parentId: string | null, depth: number, parentNode: CanvasNode | null) {
      const children = childMap.get(parentId) || [];
      for (const node of children) {
        const title = (node.title || '').trim();
        if (title) {
          topicIndex.set(title, { node, depth, parentNode });
        }
        walk(node.id, depth + 1, node);
      }
    }
    walk(null, 0, null);

    // Step 2: Build location string
    function buildLocation(info: TopicInfo): string {
      if (info.depth === 0) return 'Root topic (Depth 0)';
      const label = info.node.relationshipType === 'nested' ? 'Nested under' : 'Linear child of';
      const parentTitle = info.parentNode ? (info.parentNode.title || '') : '';
      return `${label} '${parentTitle}' (Depth ${info.depth})`;
    }

    // Step 3: Reverse map keywords → topics
    const kwToTopics = new Map<string, { kwId: string; topics: { topicTitle: string; info: TopicInfo }[] }>();
    nodes.forEach(node => {
      const kwIds = node.linkedKwIds || [];
      const title = (node.title || '').trim();
      if (!title) return;
      const info = topicIndex.get(title);
      if (!info) return;

      kwIds.forEach(kwId => {
        const kwRec = kwMap.get(kwId);
        if (!kwRec) return;
        const kwStr = (kwRec.keyword || '').trim();
        if (!kwStr) return;

        if (!kwToTopics.has(kwStr)) {
          kwToTopics.set(kwStr, { kwId, topics: [] });
        }
        const entry = kwToTopics.get(kwStr)!;
        if (!entry.topics.some(t => t.topicTitle === title)) {
          entry.topics.push({ topicTitle: title, info });
        }
      });
    });

    // Step 4: Walk up hierarchy for each topic
    function walkUpHierarchy(topicTitle: string): UpstreamEntry[] {
      const chain: UpstreamEntry[] = [];
      let info = topicIndex.get(topicTitle);
      if (!info) return chain;
      const visited = new Set<string>();
      let parentNode = info.parentNode;
      while (parentNode) {
        const parentTitle = (parentNode.title || '').trim();
        if (!parentTitle || visited.has(parentTitle)) break;
        visited.add(parentTitle);
        const parentInfo = topicIndex.get(parentTitle);
        if (!parentInfo) break;
        chain.push({
          title: parentTitle,
          description: parentNode.description || '',
          location: buildLocation(parentInfo),
        });
        parentNode = parentInfo.parentNode;
      }
      return chain;
    }

    // Step 5: Assemble output
    const result: KASGroup[] = [];
    kwToTopics.forEach(({ kwId, topics }, kwStr) => {
      const kwRec = kwMap.get(kwId);
      const volume = kwRec ? Number(kwRec.volume) || 0 : 0;
      const mainTopics: MainTopicEntry[] = [];
      topics.forEach(({ topicTitle, info }) => {
        const upstream = walkUpHierarchy(topicTitle);
        mainTopics.push({
          title: topicTitle,
          description: info.node.description || '',
          location: buildLocation(info),
          upstreamChain: upstream,
          subRowCount: Math.max(1, upstream.length),
        });
      });
      const totalSubRows = mainTopics.reduce((s, mt) => s + mt.subRowCount, 0);
      result.push({ keyword: kwStr, volume, mainTopics, totalSubRows });
    });

    return result;
  }, [nodes, kwMap]);

  // ── Copy as TSV ────────────────────────────────────────────
  const copyTableData = useCallback(() => {
    if (!data.length) return;
    const headers = ['Keyword', 'Main Topic', 'Main Topic Title', 'Main Topic Description',
      'Main Topic Location', 'Upstream Topic', 'UT Title', 'UT Description', 'UT Location'];
    const lines = [headers.join('\t')];

    data.forEach(group => {
      let isFirstKwRow = true;
      group.mainTopics.forEach(mt => {
        let isFirstMtRow = true;
        if (mt.upstreamChain.length === 0) {
          lines.push([
            isFirstKwRow ? group.keyword : '', mt.title, mt.title, mt.description, mt.location,
            '', '', '', ''
          ].join('\t'));
          isFirstKwRow = false;
        } else {
          mt.upstreamChain.forEach(ancestor => {
            lines.push([
              isFirstKwRow ? group.keyword : '',
              isFirstMtRow ? mt.title : '', isFirstMtRow ? mt.title : '',
              isFirstMtRow ? mt.description : '', isFirstMtRow ? mt.location : '',
              ancestor.title, ancestor.title, ancestor.description, ancestor.location
            ].join('\t'));
            isFirstKwRow = false;
            isFirstMtRow = false;
          });
        }
      });
    });

    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => alert(`Copied ${data.length} keywords`))
      .catch(() => alert('Copy failed — check clipboard permissions'));
  }, [data]);

  return (
    <div className="kas-panel">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="kas-header">
        <span className="kas-title">Keywords Analysis Table</span>
        <span className="kas-chip">{data.length}</span>
        <span className="kas-chip-label">keywords</span>
        <button className="kas-copy-btn" onClick={copyTableData}>📋 Copy Table Data</button>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="kas-scroll">
        <table className="kas-table">
          <thead>
            <tr>
              <th className="kas-th">Keyword</th>
              <th className="kas-th">Main Topic</th>
              <th className="kas-th">Main Topic Title</th>
              <th className="kas-th">Main Topic Description</th>
              <th className="kas-th">Main Topic Location</th>
              <th className="kas-th">Upstream Topic</th>
              <th className="kas-th">UT Title</th>
              <th className="kas-th">UT Description</th>
              <th className="kas-th">UT Location</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td className="kas-empty" colSpan={9}>
                  No keywords linked to canvas topics yet
                </td>
              </tr>
            )}
            {data.map((group, grpIdx) => {
              const grpParity = grpIdx % 2 === 0 ? 'kas-grp-odd' : 'kas-grp-even';
              const rows: React.ReactNode[] = [];
              let isFirstKwRow = true;

              group.mainTopics.forEach((mt, mtIdx) => {
                let isFirstMtRow = true;

                if (mt.upstreamChain.length === 0) {
                  rows.push(
                    <tr
                      key={`${grpIdx}-${mtIdx}-root`}
                      className={`kas-row ${grpParity}${isFirstKwRow ? ' kas-kw-first' : ''} kas-mt-first`}
                    >
                      <td className={isFirstKwRow ? 'kas-kw-primary' : 'kas-kw-cont'}>{group.keyword}</td>
                      <td className="kas-mt-primary">{mt.title}</td>
                      <td className="kas-mt-primary">{mt.title}</td>
                      <td className="kas-mt-primary">{mt.description}</td>
                      <td className="kas-mt-primary">{mt.location}</td>
                      <td className="kas-ut-empty"></td>
                      <td className="kas-ut-empty"></td>
                      <td className="kas-ut-empty"></td>
                      <td className="kas-ut-empty"></td>
                    </tr>
                  );
                  isFirstKwRow = false;
                } else {
                  mt.upstreamChain.forEach((ancestor, uIdx) => {
                    rows.push(
                      <tr
                        key={`${grpIdx}-${mtIdx}-${uIdx}`}
                        className={`kas-row ${grpParity}${isFirstKwRow ? ' kas-kw-first' : ''}${isFirstMtRow ? ' kas-mt-first' : ''}`}
                      >
                        <td className={isFirstKwRow ? 'kas-kw-primary' : 'kas-kw-cont'}>{group.keyword}</td>
                        <td className={isFirstMtRow ? 'kas-mt-primary' : 'kas-mt-cont'}>{mt.title}</td>
                        <td className={isFirstMtRow ? 'kas-mt-primary' : 'kas-mt-cont'}>{mt.title}</td>
                        <td className={isFirstMtRow ? 'kas-mt-primary' : 'kas-mt-cont'}>{mt.description}</td>
                        <td className={isFirstMtRow ? 'kas-mt-primary' : 'kas-mt-cont'}>{mt.location}</td>
                        <td className="kas-ut-cell">{ancestor.title}</td>
                        <td className="kas-ut-cell">{ancestor.title}</td>
                        <td className="kas-ut-cell">{ancestor.description}</td>
                        <td className="kas-ut-cell">{ancestor.location}</td>
                      </tr>
                    );
                    isFirstKwRow = false;
                    isFirstMtRow = false;
                  });
                }
              });

              return rows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
