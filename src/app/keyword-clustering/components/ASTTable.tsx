'use client';

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import type { Keyword } from '@/hooks/useKeywords';
import './ast-table.css';

const ROW_HEIGHT = 28;
const VS_BUFFER = 10;
const STATUS_ORDER = ['Unsorted', 'Partially Sorted', 'Completely Sorted'] as const;
type SortingStatus = Keyword['sortingStatus'];

function cycleStatus(current: SortingStatus): SortingStatus {
  const idx = STATUS_ORDER.indexOf(current as typeof STATUS_ORDER[number]);
  if (idx === -1) return 'Unsorted';
  return STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
}

function fmtV(v: string | number): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n) || n === 0) return String(v || '');
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function parseTags(str: string): string[] {
  return (str || '').split(',').map(t => t.trim()).filter(Boolean);
}

function parseTopics(str: string): string[] {
  return (str || '').split('|').map(t => t.trim()).filter(Boolean);
}

interface RemovedKeyword {
  id: string;
  keyword: string;
  volume: string;
  sortingStatus: SortingStatus;
  tags: string;
  removedAt: number;
}

interface ASTTableProps {
  keywords: Keyword[];
  onAddKeyword: (kw: string, vol: string) => Promise<boolean>;
  onBulkImport: (rows: { keyword: string; volume?: string }[]) => Promise<{ added: number; dupes: number }>;
  onUpdateKeyword: (id: string, patch: Partial<Keyword>) => Promise<void>;
  onBatchUpdate: (ids: string[], patch: Partial<Keyword>) => Promise<void>;
  onDeleteKeyword: (id: string) => Promise<void>;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onReorder: (reordered: Keyword[]) => void;
  loading?: boolean;
  onAddToTif?: (kws: string[]) => void;
}

export default function ASTTable({
  keywords, onAddKeyword, onBulkImport, onUpdateKeyword, onBatchUpdate,
  onDeleteKeyword, onBulkDelete, onReorder, loading, onAddToTif,
}: ASTTableProps) {
  const [searchQ, setSearchQ] = useState('');
  const [showVol, setShowVol] = useState(true);
  const [showSorted, setShowSorted] = useState(true);
  const [showPartial, setShowPartial] = useState(true);
  const [showUnsorted, setShowUnsorted] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [showTopicDesc, setShowTopicDesc] = useState(true);
  const [tagFilter, setTagFilter] = useState('');
  const [tagQ, setTagQ] = useState('');
  const [topicQ, setTopicQ] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const frameRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [frameH, setFrameH] = useState(400);
  const [fontSize, setFontSize] = useState(11);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);
  const kwInputRef = useRef<HTMLInputElement>(null);
  const volInputRef = useRef<HTMLInputElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'above' | 'below' } | null>(null);
  const [removedTerms, setRemovedTerms] = useState<RemovedKeyword[]>([]);
  const [showRemovedOverlay, setShowRemovedOverlay] = useState(false);
  const [colWidths, setColWidths] = useState([22, 160, 80, 110, 90, 100, 110]);
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);

  const visible = useMemo(() => {
    return keywords.filter(k => {
      if ((k.sortingStatus === 'Completely Sorted' || k.sortingStatus === 'AI-Sorted') && !showSorted) return false;
      if (k.sortingStatus === 'Partially Sorted' && !showPartial) return false;
      if (k.sortingStatus === 'Unsorted' && !showUnsorted) return false;
      if (searchQ) {
        const words = searchQ.trim().split(/\s+/).filter(Boolean);
        const kl = k.keyword.toLowerCase();
        if (!words.every(w => {
          const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp('\\b' + esc + '\\b', 'i').test(kl);
        })) return false;
      }
      if (tagFilter) {
        const tags = (k.tags || '').split(',').map(t => t.trim().toLowerCase());
        if (!tags.includes(tagFilter.toLowerCase())) return false;
      }
      if (tagQ) {
        const words = tagQ.trim().split(/\s+/).filter(Boolean);
        const tagsStr = (k.tags || '').toLowerCase();
        if (!words.every(w => {
          const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return new RegExp('\\b' + esc + '\\b', 'i').test(tagsStr);
        })) return false;
      }
      if (topicQ) {
        const pills = (k.topic || '').split('|').map(t => t.trim()).filter(Boolean);
        if (!pills.some(p => p.toLowerCase() === topicQ.toLowerCase())) return false;
      }
      if (topicFilter) {
        const pills = (k.topic || '').split('|').map(t => t.trim()).filter(Boolean);
        if (!pills.some(p => p.toLowerCase() === topicFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [keywords, searchQ, showSorted, showPartial, showUnsorted, tagFilter, tagQ, topicQ, topicFilter]);

  const volSum = useMemo(() => visible.reduce((s, k) => s + (parseFloat(k.volume) || 0), 0), [visible]);
  const total = visible.length;
  const viewH = frameH || 400;
  const minVisible = Math.ceil(viewH / ROW_HEIGHT) + VS_BUFFER * 2 + 4;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - VS_BUFFER);
  const endIdx = Math.min(total, Math.max(startIdx + minVisible, Math.ceil((scrollTop + viewH) / ROW_HEIGHT) + VS_BUFFER + 1));
  const topPad = startIdx * ROW_HEIGHT;
  const bottomPad = Math.max(0, (total - endIdx) * ROW_HEIGHT);
  const slicedRows = visible.slice(startIdx, endIdx);

  const rafRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (frameRef.current) setScrollTop(frameRef.current.scrollTop);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => { for (const e of entries) setFrameH(e.contentRect.height); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selCount = useMemo(() => visible.filter(k => selected.has(k.id)).length, [visible, selected]);
  const selectAllState: 'none' | 'some' | 'all' = selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectAllState === 'some'; }, [selectAllState]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && showRemovedOverlay) setShowRemovedOverlay(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showRemovedOverlay]);

  function handleToggleAll(checked: boolean) {
    setSelected(prev => { const next = new Set(prev); visible.forEach(k => checked ? next.add(k.id) : next.delete(k.id)); return next; });
    // Auto-add to TIF when checking all
    if (checked && onAddToTif) {
      const kws = visible.map(k => k.keyword);
      if (kws.length > 0) onAddToTif(kws);
    }
  }
  function handleToggleRow(id: string) {
    const wasSelected = selected.has(id);
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
    // Auto-add to TIF when checking (not unchecking)
    if (!wasSelected && onAddToTif) {
      const kw = keywords.find(k => k.id === id);
      if (kw) onAddToTif([kw.keyword]);
    }
  }
  async function handleCycleStatus(k: Keyword) {
    const next = cycleStatus(k.sortingStatus);
    if (selected.has(k.id) && selected.size > 1) await onBatchUpdate([...selected], { sortingStatus: next });
    else await onUpdateKeyword(k.id, { sortingStatus: next });
  }

  async function handleRemove(k: Keyword) {
    if (selected.has(k.id) && selected.size > 0) {
      const ids = [...selected];
      const toArchive = keywords.filter(kw => ids.includes(kw.id));
      setRemovedTerms(prev => [...toArchive.map(kw => ({ id: kw.id, keyword: kw.keyword, volume: kw.volume, sortingStatus: 'Unsorted' as SortingStatus, tags: '', removedAt: Date.now() })), ...prev]);
      await onBulkDelete(ids); setSelected(new Set());
      showToast(`✓ Removed ${ids.length} keyword${ids.length !== 1 ? 's' : ''} → Removed Terms.`);
    } else {
      setRemovedTerms(prev => [{ id: k.id, keyword: k.keyword, volume: k.volume, sortingStatus: 'Unsorted', tags: '', removedAt: Date.now() }, ...prev]);
      await onDeleteKeyword(k.id);
      setSelected(prev => { const n = new Set(prev); n.delete(k.id); return n; });
      showToast(`Keyword removed → Removed Terms.`);
    }
  }

  async function handleRestore(rm: RemovedKeyword) {
    if (keywords.some(k => k.keyword === rm.keyword)) { showToast(`⚠ "${rm.keyword}" already exists.`); return; }
    const ok = await onAddKeyword(rm.keyword, String(rm.volume || ''));
    if (ok) { setRemovedTerms(prev => prev.filter(r => r !== rm)); showToast(`✓ "${rm.keyword}" restored.`); }
  }

  async function handleTagEdit(kwId: string, oldTagsStr: string, newTagsStr: string) {
    const oldTags = parseTags(oldTagsStr);
    const newTags = parseTags(newTagsStr);
    const addedTags = newTags.filter(t => !oldTags.includes(t));
    const removedTgz = oldTags.filter(t => !newTags.includes(t));
    if (selected.has(kwId) && selected.size > 1 && (addedTags.length > 0 || removedTgz.length > 0)) {
      const ids = [...selected];
      const updates = ids.map(id => {
        const kw = keywords.find(k => k.id === id);
        if (!kw) return null;
        let existing = parseTags(kw.tags);
        addedTags.forEach(t => { if (!existing.includes(t)) existing.push(t); });
        removedTgz.forEach(t => { existing = existing.filter(x => x !== t); });
        return { id, tags: existing.join(', ') };
      }).filter(Boolean) as { id: string; tags: string }[];
      await Promise.all(updates.map(u => onUpdateKeyword(u.id, { tags: u.tags })));
      showToast(`✓ Tags updated on ${ids.length} selected rows.`);
    } else {
      await onUpdateKeyword(kwId, { tags: newTagsStr });
    }
  }

  async function handleTopicEdit(kwId: string, oldTopicStr: string, newTopicStr: string) {
    const oldTopics = parseTopics(oldTopicStr);
    const newTopics = parseTopics(newTopicStr);
    const addedTopics = newTopics.filter(t => !oldTopics.includes(t));
    const removedTopics = oldTopics.filter(t => !newTopics.includes(t));
    if (selected.has(kwId) && selected.size > 1 && (addedTopics.length > 0 || removedTopics.length > 0)) {
      const ids = [...selected];
      const updates = ids.map(id => {
        const kw = keywords.find(k => k.id === id);
        if (!kw) return null;
        let existing = parseTopics(kw.topic);
        addedTopics.forEach(t => { if (!existing.includes(t)) existing.push(t); });
        removedTopics.forEach(t => { existing = existing.filter(x => x !== t); });
        return { id, topic: existing.join(' | ') };
      }).filter(Boolean) as { id: string; topic: string }[];
      await Promise.all(updates.map(u => onUpdateKeyword(u.id, { topic: u.topic })));
      showToast(`✓ Topics updated on ${ids.length} selected rows.`);
    } else {
      await onUpdateKeyword(kwId, { topic: newTopicStr });
    }
  }

  async function handleAddKeyword(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const kw = kwInputRef.current?.value || '';
    const vol = volInputRef.current?.value || '';
    const ok = await onAddKeyword(kw, vol);
    if (!ok && kw.trim()) showToast('⚠ Duplicate keyword — not added.');
    if (kwInputRef.current) kwInputRef.current.value = '';
    if (volInputRef.current) volInputRef.current.value = '';
    kwInputRef.current?.focus();
  }

  async function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const raw = e.clipboardData.getData('text');
    if (!raw) return;
    const lines = raw.replace(/\r/g, '').split('\n');
    const rows: { keyword: string; volume?: string }[] = [];
    let skipped = 0;
    for (const line of lines) {
      if (!line.replace(/\t/g, '').trim()) { skipped++; continue; }
      const parts = line.split('\t');
      const kw = (parts[0] || '').trim();
      const vol = (parts[1] || '').trim();
      if (kw.toLowerCase() === 'keyword' && vol.toLowerCase() === 'volume') { skipped++; continue; }
      if (!kw) { skipped++; continue; }
      rows.push({ keyword: kw, volume: vol });
    }
    const result = await onBulkImport(rows);
    let msg = `✓ Added ${result.added} keyword${result.added !== 1 ? 's' : ''}`;
    if (result.dupes > 0) msg += `  ·  ${result.dupes} duplicate${result.dupes !== 1 ? 's' : ''} skipped`;
    if (skipped > 0) msg += `  ·  ${skipped} empty/header row${skipped !== 1 ? 's' : ''} ignored`;
    showToast(msg);
    if (kwInputRef.current) kwInputRef.current.value = '';
    if (volInputRef.current) volInputRef.current.value = '';
  }

  function handleSortByVol() {
    const visIds = new Set(visible.map(k => k.id));
    const sorted = [...visible].sort((a, b) => (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0));
    let i = 0;
    onReorder(keywords.map(k => visIds.has(k.id) ? sorted[i++] : k));
    showToast('Sorted by volume ↓ (highest first)');
  }

  function handleShowAll() {
    setSearchQ(''); setTagFilter(''); setTagQ(''); setTopicQ(''); setTopicFilter('');
    setShowVol(true); setShowSorted(true); setShowPartial(true); setShowUnsorted(true); setShowTags(true); setShowTopics(true);
  }

  function handleSearch() { if (frameRef.current) frameRef.current.scrollTop = 0; setScrollTop(0); }
  
  function handleCopyTableData() {
    if (visible.length === 0) { showToast('⚠ No visible rows to copy.'); return; }
    const header = ['Keyword'];
    if (showVol) header.push('Volume');
    header.push('Sorting Status');
    if (showTags) header.push('Tags');
    const rows = [header.join('\t')];
    visible.forEach(k => {
      const row = [k.keyword];
      if (showVol) row.push(k.volume ? fmtV(k.volume) : '');
      row.push(k.sortingStatus);
      if (showTags) row.push(k.tags || '');
      rows.push(row.join('\t'));
    });
    navigator.clipboard.writeText(rows.join('\n')).then(
      () => showToast(`✓ Copied ${visible.length} row${visible.length !== 1 ? 's' : ''} to clipboard. Paste into Excel.`),
      () => showToast('⚠ Clipboard write failed. Please try again.')
    );
  }

  function handleDownloadCSV() {
    if (keywords.length === 0) { showToast('⚠ No keywords to download.'); return; }
    const hdr = 'Keyword,Volume,Sorting Status,Tags\n';
    const rows = keywords.map(k =>
      [k.keyword, k.volume, k.sortingStatus, k.tags]
        .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');
    const blob = new Blob([hdr + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword_sorting_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('✓ Downloaded keyword_sorting_data.csv');
  }
  function googleSearch(kw: string) { window.open('https://www.google.com/search?q=' + kw.trim().split(/\s+/).join('+'), '_blank'); }

  function handleColResize(e: React.MouseEvent, colIdx: number) {
    e.preventDefault();
    e.stopPropagation();
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
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id);
    const tr = (e.target as HTMLElement).closest('tr');
    if (tr) requestAnimationFrame(() => tr.classList.add('ast-dragging'));
  }
  function handleDragEnd() {
    setDragId(null); setDropTarget(null);
    document.querySelectorAll('.ast-dragging, .ast-drop-above, .ast-drop-below').forEach(el => el.classList.remove('ast-dragging', 'ast-drop-above', 'ast-drop-below'));
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    if (!dragId || id === dragId) { setDropTarget(null); return; }
    const tr = (e.target as HTMLElement).closest('tr'); if (!tr) return;
    const rect = tr.getBoundingClientRect();
    const pos = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
    setDropTarget({ id, pos });
    document.querySelectorAll('.ast-drop-above, .ast-drop-below').forEach(el => el.classList.remove('ast-drop-above', 'ast-drop-below'));
    tr.classList.add(pos === 'above' ? 'ast-drop-above' : 'ast-drop-below');
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragId || !dropTarget || dragId === dropTarget.id) { handleDragEnd(); return; }
    const srcIdx = keywords.findIndex(k => k.id === dragId);
    if (srcIdx === -1 || keywords.findIndex(k => k.id === dropTarget.id) === -1) { handleDragEnd(); return; }
    const reordered = [...keywords]; const [moved] = reordered.splice(srcIdx, 1);
    const newDestIdx = reordered.findIndex(k => k.id === dropTarget.id);
    reordered.splice(dropTarget.pos === 'below' ? newDestIdx + 1 : newDestIdx, 0, moved);
    onReorder(reordered); handleDragEnd();
  }

  return (
    <div className="ast-panel" style={{ fontSize: `${fontSize}px` }}>
      <div className="ast-ph">
        <span>All Search Terms</span>
        <button className="ast-btn-rm" onClick={() => setShowRemovedOverlay(true)} title="Show removed keywords">
          🗑 Removed Terms{removedTerms.length > 0 && <span className="ast-rm-badge">{removedTerms.length}</span>}
        </button>
      </div>
      <div className="ast-ctrl">
        <div className="ast-search-wrap">
          <input className="ast-search-inp" type="text" placeholder="Search keywords…" value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
          <button className="ast-search-btn" onClick={handleSearch} title="Search">⌕</button>
        </div>
        <div className="ast-ctrl-div" />
        <label className="ast-cb-label"><input type="checkbox" checked={showVol} onChange={e => setShowVol(e.target.checked)} /> Vol.</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showSorted} onChange={e => setShowSorted(e.target.checked)} /> Sorted</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showPartial} onChange={e => setShowPartial(e.target.checked)} /> Partial</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showUnsorted} onChange={e => setShowUnsorted(e.target.checked)} /> Unsorted</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} /> Tags</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showTopics} onChange={e => setShowTopics(e.target.checked)} /> Topics</label>
        <label className="ast-cb-label"><input type="checkbox" checked={showTopicDesc} onChange={e => setShowTopicDesc(e.target.checked)} /> Topic Desc.</label>
        <div className="ast-ctrl-div" />
        <button className="ast-btn" onClick={handleSortByVol}>▼ Sort by Vol.</button>
        <button className="ast-btn" onClick={handleShowAll}>↺ Show All</button>
        <button className="ast-btn" onClick={handleCopyTableData} title="Copy visible table data as tab-separated text for Excel">Copy Table Data</button>
        <button className="ast-btn" onClick={handleDownloadCSV} title="Download all keywords as CSV file">⬇ CSV</button>
        <div style={{ flex: 1 }} />
        <button className="ast-zoom-btn" onClick={() => setFontSize(f => Math.max(7, f - 1))}>－</button>
        <span style={{ fontSize: '9px', color: 'var(--text-m)', minWidth: 30, textAlign: 'center' }}>{Math.round((fontSize / 11) * 100)}%</span>
        <button className="ast-zoom-btn" onClick={() => setFontSize(f => Math.min(18, f + 1))}>＋</button>
      </div>
      <div className={`ast-tag-filter-bar${tagFilter ? ' on' : ''}`}>
        <span>🏷 Filtering by tag:</span><strong>{tagFilter}</strong>
        <button className="ast-tag-filter-clear" onClick={() => setTagFilter('')}>✕ Clear filter</button>
      </div>
      <div className={`ast-tag-filter-bar${topicFilter ? ' on' : ''}`}>
        <span>📌 Filtering by topic:</span><strong>{topicFilter}</strong>
        <button className="ast-tag-filter-clear" onClick={() => setTopicFilter('')}>✕ Clear filter</button>
      </div>
      <div className="ast-frame" ref={frameRef} onScroll={handleScroll}>
        {loading ? (<div className="ast-empty"><div className="ast-empty-icon">⏳</div><div>Loading keywords…</div></div>) : (
          <table className="ast-tbl" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: colWidths[0] }} /><col style={{ width: colWidths[1] }} />
              <col style={{ width: colWidths[2] }} className={showVol ? '' : 'ast-col-hidden'} />
              <col style={{ width: colWidths[3] }} />
              <col style={{ width: colWidths[4] }} className={showTags ? '' : 'ast-col-hidden'} />
              <col style={{ width: colWidths[5] }} className={showTopics ? '' : 'ast-col-hidden'} />
              <col style={{ width: colWidths[6] }} className={showTopicDesc ? '' : 'ast-col-hidden'} />
            </colgroup>
            <thead><tr>
              <th style={{ width: colWidths[0], textAlign: 'center', padding: '3px 2px' }}><input ref={selectAllRef} type="checkbox" checked={selectAllState === 'all'} onChange={e => handleToggleAll(e.target.checked)} style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }} /></th>
              <th style={{ position: 'relative' }}><div className="th-inner">Keyword <span className="ast-chip">{visible.length}</span></div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 1)} /></th>
              <th className={showVol ? '' : 'ast-col-hidden'} style={{ position: 'relative' }}><div className="th-inner">Volume <span className="ast-chip">{showVol ? fmtV(volSum) : '—'}</span></div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 2)} /></th>
              <th style={{ position: 'relative' }}><div className="th-inner">Sorting Status</div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 3)} /></th>
              <th className={showTags ? '' : 'ast-col-hidden'} style={{ position: 'relative' }}><div className="th-inner">Tags<input type="text" className="ast-search-inp" placeholder="search tags…" value={tagQ} onChange={e => setTagQ(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 72, fontSize: 8, marginLeft: 3 }} /></div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 4)} /></th>
              <th className={showTopics ? '' : 'ast-col-hidden'} style={{ position: 'relative' }}><div className="th-inner">Topics<input type="text" className="ast-search-inp" placeholder="search topics…" value={topicQ} onChange={e => setTopicQ(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 72, fontSize: 8, marginLeft: 3 }} /></div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 5)} /></th>
              <th className={showTopicDesc ? '' : 'ast-col-hidden'} style={{ position: 'relative' }}><div className="th-inner">Topic Descriptions</div><div className="ast-col-resize" onMouseDown={e => handleColResize(e, 6)} /></th>
            </tr></thead>
            <tbody>
              <tr style={{ height: topPad }} aria-hidden="true"><td colSpan={7} style={{ padding: 0, border: 'none' }} /></tr>
              {total === 0 && !loading ? (<tr><td colSpan={7}><div className="ast-empty"><div className="ast-empty-icon">📋</div><div>No keywords yet. Add keywords below or paste from Excel.</div></div></td></tr>) : (
                slicedRows.map(k => (
                  <ASTRow key={k.id} kw={k} isSelected={selected.has(k.id)} isDragging={dragId === k.id}
                    onToggle={() => handleToggleRow(k.id)} onCycleStatus={() => handleCycleStatus(k)}
                    onRemove={() => handleRemove(k)} onGoogleSearch={() => googleSearch(k.keyword)}
                    onTagClick={(tag: string) => setTagFilter(tag)} onTagEdit={(o, n) => handleTagEdit(k.id, o, n)}
                    onTopicEdit={(o, n) => handleTopicEdit(k.id, o, n)}
                    onTopicClick={(topic: string) => setTopicFilter(prev => prev === topic ? '' : topic)}
                    onDragStart={e => handleDragStart(e, k.id)} onDragEnd={handleDragEnd}
                    onDragOver={e => handleDragOver(e, k.id)} onDrop={handleDrop}
                    showVol={showVol} showTags={showTags} showTopics={showTopics} showTopicDesc={showTopicDesc} />
                ))
              )}
              <tr style={{ height: bottomPad }} aria-hidden="true"><td colSpan={7} style={{ padding: 0, border: 'none' }} /></tr>
            </tbody>
            <tfoot><tr>
              <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent)', fontWeight: 700, padding: '2px' }}>＋</td>
              <td><input ref={kwInputRef} className="ast-add-inp" type="text" placeholder="Paste Excel data here, or type keyword + Enter" onPaste={handlePaste} onKeyDown={handleAddKeyword} /></td>
              <td className={showVol ? '' : 'ast-col-hidden'}><input ref={volInputRef} className="ast-add-inp" type="text" placeholder="Volume" onKeyDown={handleAddKeyword} /></td>
              <td colSpan={4} style={{ fontSize: 9, color: 'var(--accent)', paddingLeft: 4, fontStyle: 'italic' }}>← Add new keyword row</td>
            </tr></tfoot>
          </table>
        )}
      </div>
      <div className={`ast-toast${toast ? ' on' : ''}`}>{toast}</div>
      {showRemovedOverlay && (
        <div className="ast-rm-overlay" onClick={() => setShowRemovedOverlay(false)}>
          <div className="ast-rm-card" onClick={e => e.stopPropagation()}>
            <div className="ast-rm-hdr">
              <span className="ast-rm-title">🗑 All Removed Search Terms&nbsp;<span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-l)', textTransform: 'none', letterSpacing: 0 }}>({removedTerms.length} term{removedTerms.length !== 1 ? 's' : ''})</span></span>
              <button className="ast-rm-close" onClick={() => setShowRemovedOverlay(false)} title="Close">✕</button>
            </div>
            <div className="ast-rm-frame">
              <table className="ast-tbl" style={{ width: '100%' }}>
                <colgroup><col style={{ minWidth: 180 }} /><col style={{ width: 96 }} /><col style={{ width: 110 }} /><col style={{ width: 90 }} /><col style={{ width: 70 }} /></colgroup>
                <thead><tr><th><div className="th-inner">Keyword</div></th><th><div className="th-inner">Volume</div></th><th><div className="th-inner">Sorting Status</div></th><th><div className="th-inner">Tags</div></th><th style={{ textAlign: 'center' }}><div className="th-inner">Actions</div></th></tr></thead>
                <tbody>
                  {removedTerms.length === 0 ? (<tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-l)', fontSize: 11 }}>No removed search terms yet.</td></tr>) : removedTerms.map((rm, idx) => {
                    const pillCls = rm.sortingStatus === 'Completely Sorted' ? 'ast-pill ast-pill-c' : rm.sortingStatus === 'AI-Sorted' ? 'ast-pill ast-pill-ai' : rm.sortingStatus === 'Partially Sorted' ? 'ast-pill ast-pill-p' : 'ast-pill ast-pill-u';
                    return (<tr key={`${rm.keyword}-${idx}`}>
                      <td><div className="ast-kw-cell"><span className="ast-kw-txt" title={rm.keyword}>{rm.keyword}</span><button className="ast-gs-btn" style={{ opacity: 1 }} onClick={() => googleSearch(rm.keyword)}>?</button></div></td>
                      <td style={{ textAlign: 'right', paddingRight: 6 }}>{rm.volume ? fmtV(rm.volume) : ''}</td>
                      <td><span className={pillCls}>{rm.sortingStatus}</span></td>
                      <td style={{ fontSize: 9, color: 'var(--text-m)' }}>{rm.tags || ''}</td>
                      <td style={{ textAlign: 'center' }}><button className="ast-restore-btn" title="Restore keyword" onClick={() => handleRestore(rm)}>↩</button></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tag Cell Component ─────────────────────────────────────────
interface TagCellProps { tags: string; onTagClick: (tag: string) => void; onTagEdit: (oldTags: string, newTags: string) => void; hidden: boolean; }

function TagCell({ tags, onTagClick, onTagEdit, hidden }: TagCellProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [addValue, setAddValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const tagList = parseTags(tags);

  useEffect(() => { if (editIdx !== null && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editIdx]);
  useEffect(() => { if (addMode && addRef.current) addRef.current.focus(); }, [addMode]);

  function startEdit(idx: number, value: string, e: React.MouseEvent) { e.stopPropagation(); setEditIdx(idx); setEditValue(value); setAddMode(false); }
  function commitEdit() {
    if (editIdx === null) return;
    const newList = [...tagList];
    if (editValue.trim() === '') newList.splice(editIdx, 1); else newList[editIdx] = editValue.trim();
    const newTagsStr = newList.join(', ');
    if (newTagsStr !== tags) onTagEdit(tags, newTagsStr);
    setEditIdx(null); setEditValue('');
  }
  function cancelEdit() { setEditIdx(null); setEditValue(''); }
  function startAdd(e: React.MouseEvent) { e.stopPropagation(); setAddMode(true); setAddValue(''); setEditIdx(null); }
  function commitAdd() {
    const v = addValue.trim();
    if (v && !tagList.includes(v)) onTagEdit(tags, [...tagList, v].join(', '));
    setAddMode(false); setAddValue('');
  }
  function cancelAdd() { setAddMode(false); setAddValue(''); }

  if (hidden) return <td className="ast-col-hidden" />;
  return (
    <td>
      <div className="ast-tag-cell-inner">
        {tagList.map((tag, i) =>
          editIdx === i ? (
            <input key={i} ref={editRef} className="ast-tag-inp" type="text" value={editValue}
              onChange={e => setEditValue(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitEdit}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') cancelEdit(); }} />
          ) : (
            <span key={i} className="ast-tag-pill" onClick={e => startEdit(i, tag, e)}
              onContextMenu={e => { e.preventDefault(); onTagClick(tag); }}
              title={`Click to edit · Right-click to filter by "${tag}"`}>{tag}</span>
          )
        )}
        {addMode ? (
          <input ref={addRef} className="ast-tag-inp" type="text" placeholder="New tag…" value={addValue}
            onChange={e => setAddValue(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitAdd}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') cancelAdd(); }} />
        ) : (
          <span className="ast-tag-add-trigger" onClick={startAdd} title="Click to add a new tag">+</span>
        )}
      </div>
    </td>
  );
}

// ── Topic Cell Component ────────────────────────────────────────
interface TopicCellProps { topics: string; onTopicEdit: (oldTopics: string, newTopics: string) => void; onTopicClick: (topic: string) => void; hidden: boolean; }

function TopicCell({ topics, onTopicEdit, onTopicClick, hidden }: TopicCellProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [addValue, setAddValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const topicList = parseTopics(topics);

  useEffect(() => { if (editIdx !== null && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editIdx]);
  useEffect(() => { if (addMode && addRef.current) addRef.current.focus(); }, [addMode]);

  function startEdit(idx: number, value: string, e: React.MouseEvent) { e.stopPropagation(); setEditIdx(idx); setEditValue(value); setAddMode(false); }
  function commitEdit() {
    if (editIdx === null) return;
    const newList = [...topicList];
    if (editValue.trim() === '') newList.splice(editIdx, 1); else newList[editIdx] = editValue.trim();
    const newStr = newList.join(' | ');
    if (newStr !== topics) onTopicEdit(topics, newStr);
    setEditIdx(null); setEditValue('');
  }
  function cancelEdit() { setEditIdx(null); setEditValue(''); }
  function startAdd(e: React.MouseEvent) { e.stopPropagation(); setAddMode(true); setAddValue(''); setEditIdx(null); }
  function commitAdd() {
    const v = addValue.trim();
    if (v && !topicList.includes(v)) onTopicEdit(topics, [...topicList, v].join(' | '));
    setAddMode(false); setAddValue('');
  }
  function cancelAdd() { setAddMode(false); setAddValue(''); }

  if (hidden) return <td className="ast-col-hidden" />;
  return (
    <td>
      <div className="ast-tag-cell-inner">
        {topicList.map((topic, i) =>
          editIdx === i ? (
            <input key={i} ref={editRef} className="ast-tag-inp" type="text" value={editValue}
              onChange={e => setEditValue(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitEdit}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') cancelEdit(); }} />
          ) : (
            <span key={i} className="ast-topic-pill" onClick={e => startEdit(i, topic, e)}
              onContextMenu={e => { e.preventDefault(); onTopicClick(topic); }}
              title={`Click to edit · Right-click to filter by "${topic}"`}>{topic}</span>
          )
        )}
        {addMode ? (
          <input ref={addRef} className="ast-tag-inp" type="text" placeholder="New topic…" value={addValue}
            onChange={e => setAddValue(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitAdd}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') cancelAdd(); }} />
        ) : (
          <span className="ast-tag-add-trigger" onClick={startAdd} title="Click to add a new topic">+</span>
        )}
      </div>
    </td>
  );
}

// ── Row component (memoized for virtual scroll perf) ─────────
interface ASTRowProps {
  kw: Keyword; isSelected: boolean; isDragging: boolean;
  onToggle: () => void; onCycleStatus: () => void; onRemove: () => void; onGoogleSearch: () => void;
  onTagClick: (tag: string) => void; onTagEdit: (oldTags: string, newTags: string) => void;
  onTopicEdit: (oldTopics: string, newTopics: string) => void;
  onTopicClick: (topic: string) => void;
  onDragStart: (e: React.DragEvent) => void; onDragEnd: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void;
  showVol: boolean; showTags: boolean; showTopics: boolean; showTopicDesc: boolean;
}

const ASTRow = React.memo(function ASTRow({
  kw, isSelected, isDragging, onToggle, onCycleStatus, onRemove, onGoogleSearch, onTagClick,
  onTagEdit, onTopicEdit, onTopicClick, onDragStart, onDragEnd, onDragOver, onDrop, showVol, showTags, showTopics, showTopicDesc,
}: ASTRowProps) {
  const pillClass = kw.sortingStatus === 'Completely Sorted' ? 'ast-pill ast-pill-c' : kw.sortingStatus === 'AI-Sorted' ? 'ast-pill ast-pill-ai' : kw.sortingStatus === 'Partially Sorted' ? 'ast-pill ast-pill-p' : 'ast-pill ast-pill-u';
  const trRef = useRef<HTMLTableRowElement>(null);

  return (
    <tr ref={trRef} className={`${isSelected ? 'ast-sel' : ''} ${isDragging ? 'ast-dragging' : ''}`}
      draggable={false} onDragStart={onDragStart}
      onDragEnd={() => { if (trRef.current) trRef.current.draggable = false; onDragEnd(); }}
      onDragOver={onDragOver} onDrop={onDrop}>
      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={isSelected} onChange={onToggle} style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }} /></td>
      <td><div className="ast-kw-cell">
        <span className="ast-drag-handle" title="Drag to reorder"
          onMouseDown={() => { if (trRef.current) trRef.current.draggable = true; }}
          onMouseUp={() => { if (trRef.current) trRef.current.draggable = false; }}>⁞</span>
        <span className="ast-kw-txt" title={kw.keyword} onClick={onToggle}>{kw.keyword}</span>
        <button className="ast-gs-btn" title="Google this keyword" onClick={onGoogleSearch}>?</button>
        <button className="ast-rm-btn" title="Remove keyword" onClick={onRemove}>−</button>
      </div></td>
      <td className={showVol ? '' : 'ast-col-hidden'} style={{ textAlign: 'right', paddingRight: 6 }}>{kw.volume ? fmtV(kw.volume) : ''}</td>
      <td style={{ cursor: 'pointer' }} title="Click to cycle status" onClick={onCycleStatus}><span className={pillClass}>{kw.sortingStatus}</span></td>
      <TagCell tags={kw.tags} onTagClick={onTagClick} onTagEdit={onTagEdit} hidden={!showTags} />
      <TopicCell topics={kw.topic || ''} onTopicEdit={onTopicEdit} onTopicClick={onTopicClick} hidden={!showTopics} />
      <td className={showTopicDesc ? '' : 'ast-col-hidden'}></td>
    </tr>
  );
});
