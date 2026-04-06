'use client';

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react';
import type { Keyword } from '@/hooks/useKeywords';
import './mt-table.css';

// ── Types ──────────────────────────────────────────────────────
interface MTEntry {
  id: string;
  mainTerm: string;
  keywords: string[]; // matched keyword strings from AST
}

interface MTTableProps {
  astKeywords: Keyword[]; // full AST keywords list for matching & volume lookups
  onUpdateKeyword: (id: string, patch: Partial<Keyword>) => Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────
let _mtNextId = 1;
function genId(): string { return 'mt-' + (_mtNextId++); }

function findMatchingKw(mainTerm: string, astKeywords: Keyword[]): string[] {
  const words = mainTerm.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return astKeywords
    .filter(k => words.every(w => {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp('\\b' + esc + '\\b', 'i').test(k.keyword);
    }))
    .map(k => k.keyword);
}

function calcMtVolume(kwStrings: string[], astKeywords: Keyword[]): number {
  return kwStrings.reduce((sum, kwStr) => {
    const rec = astKeywords.find(k => k.keyword === kwStr);
    return sum + (parseFloat(rec ? rec.volume : '0') || 0);
  }, 0);
}

function fmtMtV(n: number): string {
  const num = Math.round(n);
  if (num === 0) return '';
  if (num < 10000) return String(num);
  const k = num / 1000;
  const r = Math.round(k * 10) / 10;
  return (r % 1 === 0 ? r.toFixed(0) : r.toFixed(1)) + 'K';
}

function getKwStatus(kwStr: string, astKeywords: Keyword[]): string {
  const rec = astKeywords.find(k => k.keyword === kwStr);
  return rec ? rec.sortingStatus : 'Unsorted';
}

function getKwTags(kwStr: string, astKeywords: Keyword[]): string {
  const rec = astKeywords.find(k => k.keyword === kwStr);
  return rec ? (rec.tags || '') : '';
}

// ── Component ──────────────────────────────────────────────────
export default function MTTable({ astKeywords, onUpdateKeyword }: MTTableProps) {
  const [entries, setEntries] = useState<MTEntry[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [showMtSv, setShowMtSv] = useState(true);
  const [showKwSv, setShowKwSv] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [showTopicDesc, setShowTopicDesc] = useState(true);
  const [showSorted, setShowSorted] = useState(true);
  const [showPartial, setShowPartial] = useState(true);
  const [showUnsorted, setShowUnsorted] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(10);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [colWidths, setColWidths] = useState([22, 180, 80, 160, 70, 100, 100, 110]);
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  // Re-sync associated keywords whenever AST keywords change
  useEffect(() => {
    setEntries(prev => prev.map(m => ({
      ...m,
      keywords: findMatchingKw(m.mainTerm, astKeywords),
    })));
  }, [astKeywords]);

  // ── Filtering ──────────────────────────────────────────────
  const visible = useMemo(() => {
    return entries.filter(m => {
      // Search filter on main term
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!m.mainTerm.toLowerCase().includes(q)) return false;
      }
      // Status filter: check if any associated keyword matches the enabled statuses
      if (!showSorted || !showPartial || !showUnsorted) {
        const hasMatch = m.keywords.some(kwStr => {
          const status = getKwStatus(kwStr, astKeywords);
          if ((status === 'Completely Sorted' || status === 'AI-Sorted') && !showSorted) return false;
          if (status === 'Partially Sorted' && !showPartial) return false;
          if (status === 'Unsorted' && !showUnsorted) return false;
          return true;
        });
        // If entry has keywords but none pass the filter, hide the row
        // If entry has no keywords, always show it
        if (m.keywords.length > 0 && !hasMatch) return false;
      }
      return true;
    });
  }, [entries, searchQ, showSorted, showPartial, showUnsorted, astKeywords]);

  // ── Select all logic ───────────────────────────────────────
  const selCount = useMemo(() => visible.filter(m => selected.has(m.id)).length, [visible, selected]);
  const selectAllState: 'none' | 'some' | 'all' = selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectAllState === 'some'; }, [selectAllState]);

  // ── Handlers ───────────────────────────────────────────────
  function handleToggleAll(checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      visible.forEach(m => checked ? next.add(m.id) : next.delete(m.id));
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

  function handleAddTerm(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const val = addInputRef.current?.value?.trim() || '';
    if (!val) return;
    // Check for duplicate
    if (entries.some(m => m.mainTerm.toLowerCase() === val.toLowerCase())) {
      showToast(`⚠ "${val}" already exists in Main Terms.`);
      if (addInputRef.current) addInputRef.current.value = '';
      return;
    }
    const matched = findMatchingKw(val, astKeywords);
    setEntries(prev => [...prev, { id: genId(), mainTerm: val, keywords: matched }]);
    showToast(`✓ Added "${val}" with ${matched.length} associated keyword${matched.length !== 1 ? 's' : ''}.`);
    if (addInputRef.current) addInputRef.current.value = '';
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const raw = e.clipboardData.getData('text');
    if (!raw) return;

    // If no tabs, treat as plain text (one term per line)
    if (!raw.includes('\t')) {
      const lines = raw.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
      let added = 0, dupes = 0;
      const newEntries = [...entries];
      lines.forEach(term => {
        const lc = term.toLowerCase();
        if (['main term', 'main terms', 'keyword', 'keywords'].includes(lc)) return;
        if (newEntries.some(m => m.mainTerm.toLowerCase() === lc)) { dupes++; return; }
        newEntries.push({ id: genId(), mainTerm: term, keywords: findMatchingKw(term, astKeywords) });
        added++;
      });
      setEntries(newEntries);
      let msg = `✓ Added ${added} main term${added !== 1 ? 's' : ''}`;
      if (dupes > 0) msg += `  ·  ${dupes} duplicate${dupes !== 1 ? 's' : ''} skipped`;
      showToast(msg);
      if (addInputRef.current) addInputRef.current.value = '';
      return;
    }

    // Tab-delimited paste (Excel)
    const lines = raw.replace(/\r/g, '').split('\n');
    let added = 0, dupes = 0, skipped = 0;
    const newEntries = [...entries];
    lines.forEach(line => {
      if (!line.replace(/\t/g, '').trim()) { skipped++; return; }
      const parts = line.split('\t');
      const mainTerm = (parts[0] || '').trim();
      if (!mainTerm) { skipped++; return; }
      const lc = mainTerm.toLowerCase();
      if (['main term', 'main terms', 'keyword', 'keywords'].includes(lc)) { skipped++; return; }
      if (newEntries.some(m => m.mainTerm.toLowerCase() === lc)) { dupes++; return; }
      newEntries.push({ id: genId(), mainTerm, keywords: findMatchingKw(mainTerm, astKeywords) });
      added++;
    });
    setEntries(newEntries);
    let msg = `✓ Added ${added} main term${added !== 1 ? 's' : ''}`;
    if (dupes > 0) msg += `  ·  ${dupes} duplicate${dupes !== 1 ? 's' : ''} skipped`;
    if (skipped > 0) msg += `  ·  ${skipped} empty/header row${skipped !== 1 ? 's' : ''} ignored`;
    showToast(msg);
    if (addInputRef.current) addInputRef.current.value = '';
  }

  function handleRemoveRow(m: MTEntry) {
    setEntries(prev => prev.filter(x => x.id !== m.id));
    setSelected(prev => { const n = new Set(prev); n.delete(m.id); return n; });
    showToast(`"${m.mainTerm}" removed from Main Terms.`);
  }

  function handleSortByVol() {
    setEntries(prev => [...prev].sort((a, b) =>
      calcMtVolume(b.keywords, astKeywords) - calcMtVolume(a.keywords, astKeywords)
    ));
    showToast('Sorted by volume ↓ (highest first)');
  }

  function handleRemoveEmpty() {
    const empties = entries.filter(m => m.keywords.length === 0).length;
    setEntries(prev => prev.filter(m => m.keywords.length > 0));
    showToast(`✓ Removed ${empties} empty row${empties !== 1 ? 's' : ''}.`);
  }

  function handleShowAll() {
    setSearchQ('');
    setShowMtSv(true); setShowKwSv(true); setShowTags(true); setShowTopics(true);
    setShowSorted(true); setShowPartial(true); setShowUnsorted(true);
  }

  function handleCopyTableData() {
    if (visible.length === 0) { showToast('⚠ No visible rows to copy.'); return; }
    const header = ['Main Term'];
    if (showMtSv) header.push('MT SV');
    header.push('Associated Keywords');
    const rows = [header.join('\t')];
    visible.forEach(m => {
      const row = [m.mainTerm];
      if (showMtSv) row.push(fmtMtV(calcMtVolume(m.keywords, astKeywords)));
      row.push(m.keywords.join(', '));
      rows.push(row.join('\t'));
    });
    navigator.clipboard.writeText(rows.join('\n')).then(
      () => showToast(`✓ Copied ${visible.length} row${visible.length !== 1 ? 's' : ''} to clipboard.`),
      () => showToast('⚠ Clipboard write failed.')
    );
  }

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

  function googleSearch(kw: string) {
    window.open('https://www.google.com/search?q=' + kw.trim().split(/\s+/).join('+'), '_blank');
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="mt-panel" style={{ fontSize: `${fontSize}px` }}>
      <div className="mt-ph">
        <span>Main Terms</span>
      </div>
      <div className="mt-ctrl">
        <div className="mt-search-wrap">
          <input className="mt-search-inp" type="text" placeholder="Search main terms…"
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { /* scroll to top */ } }} />
          <button className="mt-search-btn" title="Search">⌕</button>
        </div>
        <div className="mt-ctrl-div" />
        <label className="mt-cb-label"><input type="checkbox" checked={showMtSv} onChange={e => setShowMtSv(e.target.checked)} /> MT SV</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showKwSv} onChange={e => setShowKwSv(e.target.checked)} /> KW SV</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} /> Tags</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showTopics} onChange={e => setShowTopics(e.target.checked)} /> Topics</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showTopicDesc} onChange={e => setShowTopicDesc(e.target.checked)} /> Topic Desc.</label>
        <div className="mt-ctrl-div" />
        <label className="mt-cb-label"><input type="checkbox" checked={showSorted} onChange={e => setShowSorted(e.target.checked)} /> Sorted</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showPartial} onChange={e => setShowPartial(e.target.checked)} /> Partial</label>
        <label className="mt-cb-label"><input type="checkbox" checked={showUnsorted} onChange={e => setShowUnsorted(e.target.checked)} /> Unsorted</label>
        <div className="mt-ctrl-div" />
        <button className="mt-btn" onClick={handleShowAll}>↺ Show All</button>
        <button className="mt-btn" onClick={handleSortByVol}>▼ Sort by Vol.</button>
        <button className="mt-btn" onClick={handleRemoveEmpty} title="Remove all rows with no associated keywords">Remove Empty</button>
        <button className="mt-btn" onClick={handleCopyTableData} title="Copy visible rows as tab-separated text">Copy Table Data</button>
        <div style={{ flex: 1 }} />
        <button className="mt-zoom-btn" onClick={() => setFontSize(f => Math.max(7, f - 1))}>－</button>
        <span style={{ fontSize: '9px', color: 'var(--text-m)', minWidth: 30, textAlign: 'center' }}>{Math.round((fontSize / 10) * 100)}%</span>
        <button className="mt-zoom-btn" onClick={() => setFontSize(f => Math.min(18, f + 1))}>＋</button>
      </div>

      <div className="mt-frame">
        <table className="mt-tbl" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: colWidths[0] }} />
            <col style={{ width: colWidths[1] }} />
            <col style={{ width: colWidths[2] }} className={showMtSv ? '' : 'mt-col-hidden'} />
            <col style={{ width: colWidths[3] }} />
            <col style={{ width: colWidths[4] }} className={showKwSv ? '' : 'mt-col-hidden'} />
            <col style={{ width: colWidths[5] }} className={showTags ? '' : 'mt-col-hidden'} />
            <col style={{ width: colWidths[6] }} className={showTopics ? '' : 'mt-col-hidden'} />
            <col style={{ width: colWidths[7] }} className={showTopicDesc ? '' : 'mt-col-hidden'} />
          </colgroup>
          <thead><tr>
            <th style={{ width: colWidths[0], textAlign: 'center', padding: '3px 2px' }}>
              <input ref={selectAllRef} type="checkbox" checked={selectAllState === 'all'}
                onChange={e => handleToggleAll(e.target.checked)}
                style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }} />
            </th>
            <th style={{ position: 'relative' }}>
              <div className="th-inner">Main Terms <span className="mt-chip">{visible.length}</span></div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 1)} />
            </th>
            <th className={showMtSv ? '' : 'mt-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">MT SV</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 2)} />
            </th>
            <th style={{ position: 'relative' }}>
              <div className="th-inner">Associated Keywords</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 3)} />
            </th>
            <th className={showKwSv ? '' : 'mt-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Assoc KW SV</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 4)} />
            </th>
            <th className={showTags ? '' : 'mt-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Tags</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 5)} />
            </th>
            <th className={showTopics ? '' : 'mt-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Topics</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 6)} />
            </th>
            <th className={showTopicDesc ? '' : 'mt-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Topic Descriptions</div>
              <div className="mt-col-resize" onMouseDown={e => handleColResize(e, 7)} />
            </th>
          </tr></thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="mt-empty">
                  <div className="mt-empty-icon">{entries.length === 0 ? '📋' : '🔍'}</div>
                  <div>{entries.length === 0
                    ? 'No main terms yet. Type a term below or paste from Excel.'
                    : 'No main terms match the current filters.'
                  }</div>
                </div>
              </td></tr>
            ) : visible.map(m => {
              const totalVol = calcMtVolume(m.keywords, astKeywords);
              const isSelected = selected.has(m.id);
              return (
                <tr key={m.id} className={isSelected ? 'mt-sel' : ''}>
                  {/* Checkbox */}
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => handleToggleRow(m.id)}
                      style={{ width: 11, height: 11, accentColor: 'var(--accent)', cursor: 'pointer' }} />
                  </td>
                  {/* Main Term */}
                  <td>
                    <div className="mt-term-cell">
                      <span className="mt-term-txt" title={m.mainTerm}>{m.mainTerm}</span>
                      <button className="mt-gs-btn" title="Google this term" onClick={() => googleSearch(m.mainTerm)}>?</button>
                      <button className="mt-rm-btn" title="Remove this main term row" onClick={() => handleRemoveRow(m)}>−</button>
                    </div>
                  </td>
                  {/* MT SV */}
                  <td className={showMtSv ? '' : 'mt-col-hidden'} style={{ textAlign: 'right', paddingRight: 6 }}>
                    {fmtMtV(totalVol)}
                  </td>
                  {/* Associated Keywords (comma view) */}
                  <td style={{ wordBreak: 'break-word' }}>
                    {m.keywords.length > 0 ? (
                      <div style={{ lineHeight: '1.6' }}>{m.keywords.join(', ')}</div>
                    ) : (
                      <span style={{ color: 'var(--text-l)', fontStyle: 'italic', fontSize: '0.9em' }}>(no matching keywords)</span>
                    )}
                  </td>
                  {/* Assoc KW SV (placeholder for comma view) */}
                  <td className={showKwSv ? '' : 'mt-col-hidden'}></td>
                  {/* Tags (placeholder for comma view) */}
                  <td className={showTags ? '' : 'mt-col-hidden'}></td>
                  {/* Topics (placeholder for comma view) */}
                  <td className={showTopics ? '' : 'mt-col-hidden'}></td>
                  {/* Topic Descriptions (placeholder for comma view) */}
                  <td className={showTopicDesc ? '' : 'mt-col-hidden'}></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr>
            <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--accent)', fontWeight: 700, padding: '2px' }}>＋</td>
            <td colSpan={7}>
              <input ref={addInputRef} className="mt-add-inp" type="text"
                placeholder="Paste terms here, or type a main term + Enter"
                onPaste={handlePaste} onKeyDown={handleAddTerm} />
            </td>
          </tr></tfoot>
        </table>
      </div>
      <div className={`mt-toast${toast ? ' on' : ''}`}>{toast}</div>
    </div>
  );
}