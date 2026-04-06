'use client';

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import type { Keyword } from '@/hooks/useKeywords';
import './ast-table.css';

// ── Constants ──────────────────────────────────────────────────
const ROW_HEIGHT = 28;          // estimated row height in px
const VS_BUFFER = 10;           // extra rows above/below viewport
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

// ── Removed keyword record ─────────────────────────────────────
interface RemovedKeyword {
  id: string;
  keyword: string;
  volume: string;
  sortingStatus: SortingStatus;
  tags: string;
  removedAt: number;
}

// ── Props ──────────────────────────────────────────────────────
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
}

export default function ASTTable({
  keywords,
  onAddKeyword,
  onBulkImport,
  onUpdateKeyword,
  onBatchUpdate,
  onDeleteKeyword,
  onBulkDelete,
  onReorder,
  loading,
}: ASTTableProps) {
  // ── Filters ────────────────────────────────────────────────
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

  // ── Selection ──────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Virtual scroll ─────────────────────────────────────────
  const frameRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [frameH, setFrameH] = useState(400);

  // ── Zoom ───────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState(11);

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  // ── Add-row refs ───────────────────────────────────────────
  const kwInputRef = useRef<HTMLInputElement>(null);
  const volInputRef = useRef<HTMLInputElement>(null);

  // ── Drag-to-reorder state ──────────────────────────────────
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; pos: 'above' | 'below' } | null>(null);

  // ── Removed Terms state ────────────────────────────────────
  const [removedTerms, setRemovedTerms] = useState<RemovedKeyword[]>([]);
  const [showRemovedOverlay, setShowRemovedOverlay] = useState(false);

  // ── Filtered / visible keywords ────────────────────────────
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

      return true;
    });
  }, [keywords, searchQ, showSorted, showPartial, showUnsorted, tagFilter, tagQ, topicQ]);

  // ── Summary stats ──────────────────────────────────────────
  const volSum = useMemo(() =>
    visible.reduce((s, k) => s + (parseFloat(k.volume) || 0), 0),
    [visible]
  );

  // ── Virtual scroll math ────────────────────────────────────
  const total = visible.length;
  const totalHeight = total * ROW_HEIGHT;
  const viewH = frameH || 400;
  const minVisible = Math.ceil(viewH / ROW_HEIGHT) + VS_BUFFER * 2 + 4;
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - VS_BUFFER);
  const endIdx = Math.min(total, Math.max(startIdx + minVisible,
    Math.ceil((scrollTop + viewH) / ROW_HEIGHT) + VS_BUFFER + 1));
  const topPad = startIdx * ROW_HEIGHT;
  const bottomPad = Math.max(0, (total - endIdx) * ROW_HEIGHT);
  const slicedRows = visible.slice(startIdx, endIdx);

  // ── Scroll handler ─────────────────────────────────────────
  const rafRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (frameRef.current) {
        setScrollTop(frameRef.current.scrollTop);
      }
      rafRef.current = null;
    });
  }, []);

  // Measure frame height
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setFrameH(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Select-all state ───────────────────────────────────────
  const selCount = useMemo(() =>
    visible.filter(k => selected.has(k.id)).length,
    [visible, selected]
  );
  const selectAllState: 'none' | 'some' | 'all' =
    selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';

  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectAllState === 'some';
    }
  }, [selectAllState]);

  // ── Close overlay on Escape ────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && showRemovedOverlay) {
        setShowRemovedOverlay(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showRemovedOverlay]);

  // ── Handlers ───────────────────────────────────────────────

  function handleToggleAll(checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      visible.forEach(k => checked ? next.add(k.id) : next.delete(k.id));
      return next;
    });
  }

  function handleToggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCycleStatus(k: Keyword) {
    const next = cycleStatus(k.sortingStatus);
    if (selected.has(k.id) && selected.size > 1) {
      const ids = [...selected];
      await onBatchUpdate(ids, { sortingStatus: next });
    } else {
      await onUpdateKeyword(k.id, { sortingStatus: next });
    }
  }

  // ── Remove: archives to Removed Terms, then deletes ────────
  async function handleRemove(k: Keyword) {
    if (selected.has(k.id) && selected.size > 0) {
      const ids = [...selected];
      const toArchive = keywords.filter(kw => ids.includes(kw.id));
      setRemovedTerms(prev => [
        ...toArchive.map(kw => ({
          id: kw.id,
          keyword: kw.keyword,
          volume: kw.volume,
          sortingStatus: 'Unsorted' as SortingStatus,
          tags: '',
          removedAt: Date.now(),
        })),
        ...prev,
      ]);
      await onBulkDelete(ids);
      setSelected(new Set());
      showToast(`✓ Removed ${ids.length} keyword${ids.length !== 1 ? 's' : ''} → Removed Terms.`);
    } else {
      setRemovedTerms(prev => [{
        id: k.id,
        keyword: k.keyword,
        volume: k.volume,
        sortingStatus: 'Unsorted',
        tags: '',
        removedAt: Date.now(),
      }, ...prev]);
      await onDeleteKeyword(k.id);
      setSelected(prev => { const n = new Set(prev); n.delete(k.id); return n; });
      showToast(`Keyword removed → Removed Terms.`);
    }
  }

  // ── Restore keyword from Removed Terms ─────────────────────
  async function handleRestore(rm: RemovedKeyword) {
    if (keywords.some(k => k.keyword === rm.keyword)) {
      showToast(`⚠ "${rm.keyword}" already exists in All Search Terms.`);
      return;
    }
    const ok = await onAddKeyword(rm.keyword, String(rm.volume || ''));
    if (ok) {
      setRemovedTerms(prev => prev.filter(r => r !== rm));
      showToast(`✓ "${rm.keyword}" restored to All Search Terms.`);
    }
  }

  async function handleAddKeyword(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const kw = kwInputRef.current?.value || '';
    const vol = volInputRef.current?.value || '';
    const ok = await onAddKeyword(kw, vol);
    if (!ok && kw.trim()) {
      showToast('⚠ Duplicate keyword — not added.');
    }
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
    const sorted = [...visible].sort((a, b) =>
      (parseFloat(b.volume) || 0) - (parseFloat(a.volume) || 0)
    );
    let i = 0;
    const reordered = keywords.map(k => visIds.has(k.id) ? sorted[i++] : k);
    onReorder(reordered);
    showToast('Sorted by volume ↓ (highest first)');
  }

  function handleShowAll() {
    setSearchQ('');
    setTagFilter('');
    setTagQ('');
    setTopicQ('');
    setShowVol(true);
    setShowSorted(true);
    setShowPartial(true);
    setShowUnsorted(true);
    setShowTags(true);
    setShowTopics(true);
  }

  function handleSearch() {
    if (frameRef.current) frameRef.current.scrollTop = 0;
    setScrollTop(0);
  }

  function googleSearch(kw: string) {
    window.open('https://www.google.com/search?q=' + kw.trim().split(/\s+/).join('+'), '_blank');
  }

  // ── Drag-to-reorder handlers ───────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    const tr = (e.target as HTMLElement).closest('tr');
    if (tr) {
      requestAnimationFrame(() => tr.classList.add('ast-dragging'));
    }
  }

  function handleDragEnd() {
    setDragId(null);
    setDropTarget(null);
    document.querySelectorAll('.ast-dragging, .ast-drop-above, .ast-drop-below').forEach(el => {
      el.classList.remove('ast-dragging', 'ast-drop-above', 'ast-drop-below');
    });
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragId || id === dragId) {
      setDropTarget(null);
      return;
    }
    const tr = (e.target as HTMLElement).closest('tr');
    if (!tr) return;
    const rect = tr.getBoundingClientRect();
    const pos = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below';
    setDropTarget({ id, pos });

    document.querySelectorAll('.ast-drop-above, .ast-drop-below').forEach(el => {
      el.classList.remove('ast-drop-above', 'ast-drop-below');
    });
    tr.classList.add(pos === 'above' ? 'ast-drop-above' : 'ast-drop-below');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragId || !dropTarget || dragId === dropTarget.id) {
      handleDragEnd();
      return;
    }

    const srcIdx = keywords.findIndex(k => k.id === dragId);
    const destIdx = keywords.findIndex(k => k.id === dropTarget.id);
    if (srcIdx === -1 || destIdx === -1) {
      handleDragEnd();
      return;
    }

    const reordered = [...keywords];
    const [moved] = reordered.splice(srcIdx, 1);
    const newDestIdx = reordered.findIndex(k => k.id === dropTarget.id);
    const insertAt = dropTarget.pos === 'below' ? newDestIdx + 1 : newDestIdx;
    reordered.splice(insertAt, 0, moved);

    onReorder(reordered);
    handleDragEnd();
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="ast-panel" style={{ fontSize: `${fontSize}px` }}>
      {/* Panel header */}
      <div className="ast-ph">
        <span>All Search Terms</span>
        {/* Removed Terms button */}
        <button
          className="ast-btn-rm"
          onClick={() => { setShowRemovedOverlay(true); }}
          title="Show removed keywords"
        >
          🗑 Removed Terms
          {removedTerms.length > 0 && (
            <span className="ast-rm-badge">{removedTerms.length}</span>
          )}
        </button>
      </div>

      {/* Control bar */}
      <div className="ast-ctrl">
        {/* Search */}
        <div className="ast-search-wrap">
          <input
            className="ast-search-inp"
            type="text"
            placeholder="Search keywords…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button className="ast-search-btn" onClick={handleSearch} title="Search">⌕</button>
        </div>

        <div className="ast-ctrl-div" />

        {/* Visibility checkboxes */}
        <label className="ast-cb-label" title="Show/hide Volume column">
          <input type="checkbox" checked={showVol} onChange={e => setShowVol(e.target.checked)} /> Vol.
        </label>
        <label className="ast-cb-label" title="Show rows with Completely Sorted status">
          <input type="checkbox" checked={showSorted} onChange={e => setShowSorted(e.target.checked)} /> Sorted
        </label>
        <label className="ast-cb-label" title="Show rows with Partially Sorted status">
          <input type="checkbox" checked={showPartial} onChange={e => setShowPartial(e.target.checked)} /> Partial
        </label>
        <label className="ast-cb-label" title="Show rows with Unsorted status">
          <input type="checkbox" checked={showUnsorted} onChange={e => setShowUnsorted(e.target.checked)} /> Unsorted
        </label>
        <label className="ast-cb-label" title="Show/hide Tags column">
          <input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} /> Tags
        </label>
        <label className="ast-cb-label" title="Show/hide Topics column">
          <input type="checkbox" checked={showTopics} onChange={e => setShowTopics(e.target.checked)} /> Topics
        </label>
        <label className="ast-cb-label" title="Show/hide Topic Descriptions column">
          <input type="checkbox" checked={showTopicDesc} onChange={e => setShowTopicDesc(e.target.checked)} /> Topic Desc.
        </label>

        <div className="ast-ctrl-div" />

        {/* Actions */}
        <button className="ast-btn" onClick={handleSortByVol} title="Sort visible rows by volume (high→low)">
          ▼ Sort by Vol.
        </button>
        <button className="ast-btn" onClick={handleShowAll} title="Reset all filters and show all keywords">
          ↺ Show All
        </button>

        <div style={{ flex: 1 }} />

        {/* Zoom */}
        <button
          className="ast-zoom-btn"
          onClick={() => setFontSize(f => Math.max(7, f - 1))}
          title="Zoom out"
        >－</button>
        <span style={{ fontSize: '9px', color: 'var(--text-m)', minWidth: 30, textAlign: 'center' }}>
          {Math.round((fontSize / 11) * 100)}%
        </span>
        <button
          className="ast-zoom-btn"
          onClick={() => setFontSize(f => Math.min(18, f + 1))}
          title="Zoom in"
        >＋</button>
      </div>

      {/* Tag filter bar */}
      <div className={`ast-tag-filter-bar${tagFilter ? ' on' : ''}`}>
        <span>🏷 Filtering by tag:</span>
        <strong>{tagFilter}</strong>
        <button className="ast-tag-filter-clear" onClick={() => setTagFilter('')}>✕ Clear filter</button>
      </div>

      {/* Scrollable table frame */}
      <div className="ast-frame" ref={frameRef} onScroll={handleScroll}>
        {loading ? (
          <div className="ast-empty">
            <div className="ast-empty-icon">⏳</div>
            <div>Loading keywords…</div>
          </div>
        ) : (
          <table className="ast-tbl">
            <colgroup>
              <col style={{ width: 22 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 80 }}
                className={showVol ? '' : 'ast-col-hidden'} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }}
                className={showTags ? '' : 'ast-col-hidden'} />
              <col style={{ width: 100 }}
                className={showTopics ? '' : 'ast-col-hidden'} />
              <col style={{ width: 110 }}
                className={showTopicDesc ? '' : 'ast-col-hidden'} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ width: 22, textAlign: 'center', padding: '3px 2px' }}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={selectAllState === 'all'}
                    onChange={e => handleToggleAll(e.target.checked)}
                    title="Select / deselect all visible"
                    style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </th>
                <th>
                  <div className="th-inner">
                    Keyword <span className="ast-chip">{visible.length}</span>
                  </div>
                </th>
                <th className={showVol ? '' : 'ast-col-hidden'}>
                  <div className="th-inner">
                    Volume <span className="ast-chip">{showVol ? fmtV(volSum) : '—'}</span>
                  </div>
                </th>
                <th>
                  <div className="th-inner">Sorting Status</div>
                </th>
                <th className={showTags ? '' : 'ast-col-hidden'}>
                  <div className="th-inner">
                    Tags
                    <input
                      type="text"
                      className="ast-search-inp"
                      placeholder="search tags…"
                      value={tagQ}
                      onChange={e => setTagQ(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 72, fontSize: 8, marginLeft: 3 }}
                    />
                  </div>
                </th>
                <th className={showTopics ? '' : 'ast-col-hidden'}>
                  <div className="th-inner">
                    Topics
                    <input
                      type="text"
                      className="ast-search-inp"
                      placeholder="search topics…"
                      value={topicQ}
                      onChange={e => setTopicQ(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 72, fontSize: 8, marginLeft: 3 }}
                    />
                  </div>
                </th>
                <th className={showTopicDesc ? '' : 'ast-col-hidden'}>
                  <div className="th-inner">Topic Descriptions</div>
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Top spacer for virtual scroll */}
              <tr style={{ height: topPad }} aria-hidden="true"><td colSpan={7} style={{ padding: 0, border: 'none' }} /></tr>

              {total === 0 && !loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="ast-empty">
                      <div className="ast-empty-icon">📋</div>
                      <div>No keywords yet. Add keywords below or paste from Excel.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                slicedRows.map(k => (
                  <ASTRow
                    key={k.id}
                    kw={k}
                    isSelected={selected.has(k.id)}
                    isDragging={dragId === k.id}
                    onToggle={() => handleToggleRow(k.id)}
                    onCycleStatus={() => handleCycleStatus(k)}
                    onRemove={() => handleRemove(k)}
                    onGoogleSearch={() => googleSearch(k.keyword)}
                    onTagClick={(tag: string) => setTagFilter(tag)}
                    onDragStart={(e) => handleDragStart(e, k.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, k.id)}
                    onDrop={handleDrop}
                    showVol={showVol}
                    showTags={showTags}
                    showTopics={showTopics}
                    showTopicDesc={showTopicDesc}
                  />
                ))
              )}

              {/* Bottom spacer for virtual scroll */}
              <tr style={{ height: bottomPad }} aria-hidden="true"><td colSpan={7} style={{ padding: 0, border: 'none' }} /></tr>
            </tbody>

            <tfoot>
              <tr>
                <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent)', fontWeight: 700, padding: '2px' }}>＋</td>
                <td>
                  <input
                    ref={kwInputRef}
                    className="ast-add-inp"
                    type="text"
                    placeholder="Paste Excel data here, or type keyword + Enter"
                    onPaste={handlePaste}
                    onKeyDown={handleAddKeyword}
                  />
                </td>
                <td className={showVol ? '' : 'ast-col-hidden'}>
                  <input
                    ref={volInputRef}
                    className="ast-add-inp"
                    type="text"
                    placeholder="Volume"
                    onKeyDown={handleAddKeyword}
                  />
                </td>
                <td colSpan={4} style={{ fontSize: 9, color: 'var(--accent)', paddingLeft: 4, fontStyle: 'italic' }}>
                  ← Add new keyword row
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Toast */}
      <div className={`ast-toast${toast ? ' on' : ''}`}>{toast}</div>

      {/* ── Removed Terms Overlay ─────────────────────────────── */}
      {showRemovedOverlay && (
        <div className="ast-rm-overlay" onClick={() => setShowRemovedOverlay(false)}>
          <div className="ast-rm-card" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="ast-rm-hdr">
              <span className="ast-rm-title">
                🗑 All Removed Search Terms&nbsp;
                <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-l)', textTransform: 'none', letterSpacing: 0 }}>
                  ({removedTerms.length} term{removedTerms.length !== 1 ? 's' : ''})
                </span>
              </span>
              <button className="ast-rm-close" onClick={() => setShowRemovedOverlay(false)} title="Close">✕</button>
            </div>
            {/* Table */}
            <div className="ast-rm-frame">
              <table className="ast-tbl" style={{ width: '100%' }}>
                <colgroup>
                  <col style={{ minWidth: 180 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 70 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th><div className="th-inner">Keyword</div></th>
                    <th><div className="th-inner">Volume</div></th>
                    <th><div className="th-inner">Sorting Status</div></th>
                    <th><div className="th-inner">Tags</div></th>
                    <th style={{ textAlign: 'center' }}><div className="th-inner">Actions</div></th>
                  </tr>
                </thead>
                <tbody>
                  {removedTerms.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-l)', fontSize: 11 }}>
                        No removed search terms yet.
                      </td>
                    </tr>
                  ) : (
                    removedTerms.map((rm, idx) => {
                      const pillCls =
                        rm.sortingStatus === 'Completely Sorted' ? 'ast-pill ast-pill-c' :
                        rm.sortingStatus === 'AI-Sorted'         ? 'ast-pill ast-pill-ai' :
                        rm.sortingStatus === 'Partially Sorted'  ? 'ast-pill ast-pill-p' :
                                                                    'ast-pill ast-pill-u';
                      return (
                        <tr key={`${rm.keyword}-${idx}`}>
                          <td>
                            <div className="ast-kw-cell">
                              <span className="ast-kw-txt" title={rm.keyword}>{rm.keyword}</span>
                              <button
                                className="ast-gs-btn"
                                style={{ opacity: 1 }}
                                title="Google this keyword"
                                onClick={() => googleSearch(rm.keyword)}
                              >?</button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: 6 }}>
                            {rm.volume ? fmtV(rm.volume) : ''}
                          </td>
                          <td>
                            <span className={pillCls}>{rm.sortingStatus}</span>
                          </td>
                          <td style={{ fontSize: 9, color: 'var(--text-m)' }}>
                            {rm.tags || ''}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="ast-restore-btn"
                              title="Restore this keyword back to All Search Terms"
                              onClick={() => handleRestore(rm)}
                            >↩</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Row component (memoized for virtual scroll perf) ─────────
interface ASTRowProps {
  kw: Keyword;
  isSelected: boolean;
  isDragging: boolean;
  onToggle: () => void;
  onCycleStatus: () => void;
  onRemove: () => void;
  onGoogleSearch: () => void;
  onTagClick: (tag: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  showVol: boolean;
  showTags: boolean;
  showTopics: boolean;
  showTopicDesc: boolean;
}

const ASTRow = React.memo(function ASTRow({
  kw, isSelected, isDragging, onToggle, onCycleStatus, onRemove, onGoogleSearch, onTagClick,
  onDragStart, onDragEnd, onDragOver, onDrop,
  showVol, showTags, showTopics, showTopicDesc,
}: ASTRowProps) {
  const pillClass =
    kw.sortingStatus === 'Completely Sorted' ? 'ast-pill ast-pill-c' :
    kw.sortingStatus === 'AI-Sorted'         ? 'ast-pill ast-pill-ai' :
    kw.sortingStatus === 'Partially Sorted'  ? 'ast-pill ast-pill-p' :
                                                'ast-pill ast-pill-u';

  const tags = (kw.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const topics = (kw.topic || '').split('|').map(t => t.trim()).filter(Boolean);

  const trRef = useRef<HTMLTableRowElement>(null);

  function onHandleMouseDown() {
    if (trRef.current) trRef.current.draggable = true;
  }
  function onHandleMouseUp() {
    if (trRef.current) trRef.current.draggable = false;
  }

  return (
    <tr
      ref={trRef}
      className={`${isSelected ? 'ast-sel' : ''} ${isDragging ? 'ast-dragging' : ''}`}
      draggable={false}
      onDragStart={onDragStart}
      onDragEnd={(e) => { if (trRef.current) trRef.current.draggable = false; onDragEnd(); }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Checkbox */}
      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          title="Select row"
          style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
      </td>

      {/* Keyword */}
      <td>
        <div className="ast-kw-cell">
          <span
            className="ast-drag-handle"
            title="Drag to reorder"
            onMouseDown={onHandleMouseDown}
            onMouseUp={onHandleMouseUp}
          >⁞</span>
          <span
            className="ast-kw-txt"
            title={kw.keyword}
            onClick={onToggle}
          >
            {kw.keyword}
          </span>
          <button className="ast-gs-btn" title="Google this keyword" onClick={onGoogleSearch}>?</button>
          <button className="ast-rm-btn" title="Remove keyword" onClick={onRemove}>−</button>
        </div>
      </td>

      {/* Volume */}
      <td className={showVol ? '' : 'ast-col-hidden'} style={{ textAlign: 'right', paddingRight: 6 }}>
        {kw.volume ? fmtV(kw.volume) : ''}
      </td>

      {/* Status */}
      <td style={{ cursor: 'pointer' }} title="Click to cycle status" onClick={onCycleStatus}>
        <span className={pillClass}>{kw.sortingStatus}</span>
      </td>

      {/* Tags */}
      <td className={showTags ? '' : 'ast-col-hidden'}>
        <div className="ast-tag-cell-inner">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="ast-tag-pill"
              onClick={() => onTagClick(tag)}
              title={`Filter by tag: ${tag}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </td>

      {/* Topics */}
      <td className={showTopics ? '' : 'ast-col-hidden'}>
        {topics.map((t, i) => (
          <span key={i} className="ast-topic-pill">{t}</span>
        ))}
      </td>

      {/* Topic Descriptions (placeholder for now) */}
      <td className={showTopicDesc ? '' : 'ast-col-hidden'}>
        {/* Will be populated when canvas is built */}
      </td>
    </tr>
  );
});