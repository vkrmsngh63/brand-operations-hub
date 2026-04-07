'use client';

import React, {
  useState, useCallback, useRef, useMemo, useEffect,
} from 'react';
import type { Keyword } from '@/hooks/useKeywords';
import './tif-table.css';

interface TIFTableProps {
  astKeywords: Keyword[];
  tifKeywords: string[];
  onSetTifKeywords: (kws: string[]) => void;
  onUpdateKeyword: (id: string, patch: Partial<Keyword>) => Promise<void>;
  tifActive: boolean;
  onSetTifActive: (active: boolean) => void;
}

function fmtV(v: string | number): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n) || n === 0) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function parseTags(str: string): string[] {
  return (str || '').split(',').map(t => t.trim()).filter(Boolean);
}

function getKwRec(kwStr: string, astKeywords: Keyword[]): Keyword | undefined {
  return astKeywords.find(k => k.keyword === kwStr);
}

export default function TIFTable({ astKeywords, tifKeywords, onSetTifKeywords, onUpdateKeyword, tifActive, onSetTifActive }: TIFTableProps) {
  const [searchQ, setSearchQ] = useState('');
  const [showVol, setShowVol] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [showSorted, setShowSorted] = useState(true);
  const [showPartial, setShowPartial] = useState(true);
  const [showUnsorted, setShowUnsorted] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagQ, setTagQ] = useState('');
  const [topicQ, setTopicQ] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [colWidths, setColWidths] = useState([22, 18, 180, 70, 90, 100, 100]);
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  // ── Filtering ──────────────────────────────────────────────
  const visible = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return tifKeywords.filter(kw => {
      const rec = getKwRec(kw, astKeywords);
      const st = rec ? rec.sortingStatus : 'Unsorted';
      if ((st === 'Completely Sorted' || st === 'AI-Sorted') && !showSorted) return false;
      if (st === 'Partially Sorted' && !showPartial) return false;
      if (st === 'Unsorted' && !showUnsorted) return false;
      if (q) {
        const words = q.split(/\s+/).filter(Boolean);
        const kwLc = kw.toLowerCase();
        if (!words.every(w => {
          const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp('\\b' + esc + '\\b', 'i').test(kwLc);
        })) return false;
      }
      if (tagQ) {
        const tagsStr = (rec ? rec.tags : '').toLowerCase();
        const words = tagQ.trim().split(/\s+/).filter(Boolean);
        if (!words.every(w => {
          const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp('\\b' + esc + '\\b', 'i').test(tagsStr);
        })) return false;
      }
      if (topicQ) {
        const pills = (rec?.topic || '').split('|').map(t => t.trim()).filter(Boolean);
        if (!pills.some(p => p.toLowerCase() === topicQ.toLowerCase())) return false;
      }
      if (topicFilter) {
        const pills = (rec?.topic || '').split('|').map(t => t.trim()).filter(Boolean);
        if (!pills.some(p => p.toLowerCase() === topicFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [tifKeywords, searchQ, showSorted, showPartial, showUnsorted, astKeywords, tagQ, topicQ, topicFilter]);

  // ── Select all ─────────────────────────────────────────────
  const selCount = useMemo(() => visible.filter(kw => selected.has(kw)).length, [visible, selected]);
  const selectAllState: 'none' | 'some' | 'all' = selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectAllState === 'some'; }, [selectAllState]);

  // ── Handlers ───────────────────────────────────────────────
  function handleToggleAll(checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      visible.forEach(kw => checked ? next.add(kw) : next.delete(kw));
      return next;
    });
  }

  function handleToggleRow(kw: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(kw) ? next.delete(kw) : next.add(kw);
      return next;
    });
  }

  function handleShowAll() {
    setSearchQ(''); setTagQ(''); setTopicQ(''); setTopicFilter('');
    setShowVol(true); setShowTags(true); setShowTopics(true);
    setShowSorted(true); setShowPartial(true); setShowUnsorted(true);
  }

  function handleSortByVol() {
    const sorted = [...tifKeywords].sort((a, b) => {
      const ra = getKwRec(a, astKeywords);
      const rb = getKwRec(b, astKeywords);
      return (parseFloat(String(rb?.volume || 0)) || 0) - (parseFloat(String(ra?.volume || 0)) || 0);
    });
    onSetTifKeywords(sorted);
    showToast('Sorted by volume ↓ (highest first)');
  }

  function handleRemoveSelected() {
    const toRm = visible.filter(kw => selected.has(kw));
    if (toRm.length === 0) { showToast('⚠ No keywords selected.'); return; }
    const rmSet = new Set(toRm);
    onSetTifKeywords(tifKeywords.filter(kw => !rmSet.has(kw)));
    setSelected(prev => { const next = new Set(prev); toRm.forEach(kw => next.delete(kw)); return next; });
    showToast(`✓ Removed ${toRm.length} keyword${toRm.length !== 1 ? 's' : ''} from Terms In Focus.`);
  }

  function handleClear() {
    if (tifKeywords.length === 0) return;
    onSetTifKeywords([]);
    setSelected(new Set());
    showToast('Terms In Focus cleared.');
  }

  function handleMarkStatus(status: 'Unsorted' | 'Partially Sorted' | 'Completely Sorted' | 'AI-Sorted') {
    const targets = visible.filter(kw => selected.has(kw));
    const list = targets.length > 0 ? targets : visible;
    if (list.length === 0) { showToast('⚠ No keywords to mark.'); return; }
    const promises: Promise<void>[] = [];
    list.forEach(kw => {
      const rec = getKwRec(kw, astKeywords);
      if (rec) promises.push(onUpdateKeyword(rec.id, { sortingStatus: status }));
    });
    Promise.all(promises).then(() => {
      showToast(`✓ Marked ${list.length} keyword${list.length !== 1 ? 's' : ''} as ${status}.`);
    });
  }

  function handleCopyTableData() {
    if (visible.length === 0) { showToast('⚠ No visible rows to copy.'); return; }
    const header = ['Focus Term'];
    if (showVol) header.push('Volume');
    header.push('Status');
    if (showTags) header.push('Tags');
    if (showTopics) header.push('Topics');
    const rows = [header.join('\t')];
    visible.forEach(kw => {
      const rec = getKwRec(kw, astKeywords);
      const row = [kw];
      if (showVol) row.push(rec ? fmtV(rec.volume) : '');
      row.push(rec ? rec.sortingStatus : 'Unsorted');
      if (showTags) row.push(rec ? rec.tags : '');
      if (showTopics) row.push(rec ? rec.topic : '');
      rows.push(row.join('\t'));
    });
    navigator.clipboard.writeText(rows.join('\n')).then(
      () => showToast(`✓ Copied ${visible.length} row${visible.length !== 1 ? 's' : ''} to clipboard.`),
      () => showToast('⚠ Clipboard write failed.')
    );
  }

  function handleColResize(e: React.MouseEvent, colIdx: number) {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = colWidths[colIdx];
    resizeRef.current = { col: colIdx, startX, startW };
    function onMove(ev: MouseEvent) {
      if (!resizeRef.current) return;
      const delta = ev.clientX - resizeRef.current.startX;
      const newW = Math.max(30, resizeRef.current.startW + delta);
      setColWidths(prev => { const next = [...prev]; next[resizeRef.current!.col] = newW; return next; });
    }
    function onUp() {
      resizeRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = ''; document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  }

  function handleDragStart(e: React.DragEvent, kw: string) {
    setDragId(kw); e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropIdx(idx);
  }
  function handleDragEnd() {
    if (dragId != null && dropIdx != null) {
      const arr = [...tifKeywords];
      const fromIdx = arr.indexOf(dragId);
      if (fromIdx !== -1 && fromIdx !== dropIdx) {
        const [item] = arr.splice(fromIdx, 1);
        const toIdx = dropIdx > fromIdx ? dropIdx - 1 : dropIdx;
        arr.splice(toIdx, 0, item);
        onSetTifKeywords(arr);
      }
    }
    setDragId(null); setDropIdx(null);
  }

  function googleSearch(kw: string) {
    window.open('https://www.google.com/search?q=' + kw.trim().split(/\s+/).join('+'), '_blank');
  }

  function statusPillClass(st: string): string {
    if (st === 'Completely Sorted') return 'tif-st-c';
    if (st === 'AI-Sorted') return 'tif-st-ai';
    if (st === 'Partially Sorted') return 'tif-st-p';
    return 'tif-st-u';
  }
  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="tif-panel" style={{ fontSize: `${fontSize}px` }}>
      <div className="tif-ph">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Terms In Focus</span>
          <span className="tif-chip">{tifKeywords.length}</span>
          <label className="tif-toggle">
            <input type="checkbox" checked={tifActive} onChange={e => onSetTifActive(e.target.checked)} />
            <span className="tif-slider"></span>
          </label>
          <span className="tif-toggle-label">{tifActive ? 'Active' : 'Paused'}</span>
        </div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {selCount > 0 && (
            <>
              <span style={{ fontSize: 9, color: '#64748b' }}>{selCount} sel →</span>
              <button className="tif-btn" style={{ color: '#6b7280' }} onClick={() => handleMarkStatus('Unsorted')}>Unsorted</button>
              <button className="tif-btn" style={{ color: '#f59e0b' }} onClick={() => handleMarkStatus('Partially Sorted')}>Partial</button>
              <button className="tif-btn" style={{ color: '#22c55e' }} onClick={() => handleMarkStatus('Completely Sorted')}>Sorted</button>
              <span style={{ width: 1, height: 12, background: '#d1d5db' }} />
            </>
          )}
          <button className="tif-btn" style={selCount > 0 ? { color: '#e74c3c', borderColor: '#fca5a5' } : {}} onClick={handleRemoveSelected}>− Remove ({selCount})</button>
          <button className="tif-btn" onClick={handleClear}>Clear All</button>
        </div>
      </div>
      <div className="tif-ctrl">
        <input className="tif-search-inp" type="text" placeholder="Search focus terms…"
          value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        <div className="tif-ctrl-div" />
        <label className="tif-cb-label"><input type="checkbox" checked={showVol} onChange={e => setShowVol(e.target.checked)} /> Vol</label>
        <label className="tif-cb-label"><input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} /> Tags</label>
        <label className="tif-cb-label"><input type="checkbox" checked={showTopics} onChange={e => setShowTopics(e.target.checked)} /> Topics</label>
        <div className="tif-ctrl-div" />
        <label className="tif-cb-label"><input type="checkbox" checked={showSorted} onChange={e => setShowSorted(e.target.checked)} /> Sorted</label>
        <label className="tif-cb-label"><input type="checkbox" checked={showPartial} onChange={e => setShowPartial(e.target.checked)} /> Partial</label>
        <label className="tif-cb-label"><input type="checkbox" checked={showUnsorted} onChange={e => setShowUnsorted(e.target.checked)} /> Unsorted</label>
        <div className="tif-ctrl-div" />
        <button className="tif-btn" onClick={handleShowAll}>↺ Show All</button>
        <button className="tif-btn" onClick={handleSortByVol}>▼ Sort by Vol.</button>
        <button className="tif-btn" onClick={handleCopyTableData}>Copy Table Data</button>
        <div style={{ flex: 1 }} />
        <button className="tif-zoom-btn" onClick={() => setFontSize(f => Math.max(7, f - 1))}>－</button>
        <span style={{ fontSize: '9px', color: '#64748b', minWidth: 30, textAlign: 'center' }}>{Math.round((fontSize / 10) * 100)}%</span>
        <button className="tif-zoom-btn" onClick={() => setFontSize(f => Math.min(18, f + 1))}>＋</button>
      </div>
{topicFilter && (
        <div style={{ background: '#fef9c3', padding: '3px 8px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #fde68a' }}>
          <span>🏷 Filtering by topic:</span><strong>{topicFilter}</strong>
          <button onClick={() => setTopicFilter('')} style={{ background: 'none', border: '1px solid #d97706', borderRadius: 3, padding: '1px 6px', fontSize: 9, cursor: 'pointer', color: '#92400e' }}>✕ Clear</button>
        </div>
      )}

      <div className="tif-frame">
        <table className="tif-tbl" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: colWidths[0] }} />
            <col style={{ width: colWidths[1] }} />
            <col style={{ width: colWidths[2] }} />
            <col style={{ width: colWidths[3] }} className={showVol ? '' : 'tif-col-hidden'} />
            <col style={{ width: colWidths[4] }} />
            <col style={{ width: colWidths[5] }} className={showTags ? '' : 'tif-col-hidden'} />
            <col style={{ width: colWidths[6] }} className={showTopics ? '' : 'tif-col-hidden'} />
          </colgroup>
          <thead><tr>
            <th style={{ width: colWidths[0], textAlign: 'center', padding: '3px 2px' }}>
              <input ref={selectAllRef} type="checkbox" checked={selectAllState === 'all'}
                onChange={e => handleToggleAll(e.target.checked)}
                style={{ width: 11, height: 11, accentColor: '#3b82f6', cursor: 'pointer' }} />
            </th>
            <th style={{ width: 18, padding: '3px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.8em' }}>⁞</th>
            <th style={{ position: 'relative' }}>
              <div className="th-inner">Focus Terms <span className="tif-chip">{visible.length}</span></div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 2)} />
            </th>
            <th className={showVol ? '' : 'tif-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Volume</div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 3)} />
            </th>
            <th style={{ position: 'relative' }}>
              <div className="th-inner">Status</div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 4)} />
            </th>
            <th className={showTags ? '' : 'tif-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Tags<input type="text" className="tif-search-inp" placeholder="search tags…" value={tagQ} onChange={e => setTagQ(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 72, fontSize: 8, marginLeft: 3 }} /></div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 5)} />
            </th>
            <th className={showTopics ? '' : 'tif-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Topics<input type="text" className="tif-search-inp" placeholder="search topics…" value={topicQ} onChange={e => setTopicQ(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 72, fontSize: 8, marginLeft: 3 }} /></div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 6)} />
            </th>
          </tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="tif-empty">
                  <div className="tif-empty-icon">{tifKeywords.length === 0 ? '🎯' : '🔍'}</div>
                  <div>{tifKeywords.length === 0
                    ? 'Check keywords in All Search Terms or Main Terms to add them here.'
                    : 'No keywords match the current filters.'
                  }</div>
                </div>
              </td></tr>
            ) : visible.map((kw, idx) => {
              const rec = getKwRec(kw, astKeywords);
              const st = rec ? rec.sortingStatus : 'Unsorted';
              const tags = parseTags(rec ? rec.tags : '');
              const topics = (rec?.topic || '').split('|').map(t => t.trim()).filter(Boolean);
              const isSelected = selected.has(kw);
              return (
                <tr key={kw} className={isSelected ? 'tif-sel' : ''}
                  onDragOver={e => handleDragOver(e, idx)}
                  style={dropIdx === idx && dragId !== kw ? { borderTop: '3px solid #3b82f6', boxShadow: '0 -2px 4px rgba(59,130,246,0.5)' } : undefined}
                >
                  <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: 4 }}>
                    <input type="checkbox" checked={isSelected} onChange={() => handleToggleRow(kw)}
                      style={{ width: 11, height: 11, accentColor: '#3b82f6', cursor: 'pointer' }} />
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: 4, cursor: 'grab', color: '#94a3b8', fontSize: '1.1em', userSelect: 'none' }}
                    draggable onDragStart={e => handleDragStart(e, kw)} onDragEnd={handleDragEnd}
                  >⁞</td>
                  <td>
                    <div className="tif-kw-cell">
                      <span className="tif-kw-txt" title={kw} onClick={() => handleToggleRow(kw)}>{kw}</span>
                      <button className="tif-gs-btn" title="Google" onClick={() => googleSearch(kw)}>?</button>
                    </div>
                  </td>
                  <td className={showVol ? '' : 'tif-col-hidden'} style={{ textAlign: 'right', paddingRight: 6 }}>
                    {rec ? fmtV(rec.volume) : ''}
                  </td>
                  <td>
                    <span className={`tif-status ${statusPillClass(st)}`}>{st}</span>
                  </td>
                  <td className={showTags ? '' : 'tif-col-hidden'}>
                    {tags.map((t, i) => <span key={i} className="tif-tag-pill">{t}</span>)}
                  </td>
                  <td className={showTopics ? '' : 'tif-col-hidden'}>
                    {topics.map((t, i) => <span key={i} className="tif-topic-pill" style={{ cursor: 'pointer' }} onClick={() => setTopicFilter(prev => prev === t ? '' : t)} title={`Click to filter by "${t}"`}>{t}</span>)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={`tif-toast${toast ? ' on' : ''}`}>{toast}</div>
    </div>
  );
}
