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
  onAddToTif?: (kws: string[]) => void;
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

function fmtV(v: string | number): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (isNaN(n) || n === 0) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function getKwRec(kwStr: string, astKeywords: Keyword[]): Keyword | undefined {
  return astKeywords.find(k => k.keyword === kwStr);
}

function parseTags(str: string): string[] {
  return (str || '').split(',').map(t => t.trim()).filter(Boolean);
}

// ── Component ──────────────────────────────────────────────────
export default function MTTable({ astKeywords, onUpdateKeyword, onAddToTif }: MTTableProps) { {
  const [entries, setEntries] = useState<MTEntry[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [kwSearchQ, setKwSearchQ] = useState('');
  const [kwTagQ, setKwTagQ] = useState('');
  const [kwTopicQ, setKwTopicQ] = useState('');
  const [showMtSv, setShowMtSv] = useState(true);
  const [showKwSv, setShowKwSv] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [showTopicDesc, setShowTopicDesc] = useState(true);
  const [showSorted, setShowSorted] = useState(true);
  const [showPartial, setShowPartial] = useState(true);
  const [showUnsorted, setShowUnsorted] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<Map<string, number>>(new Map());
  const [kwSel, setKwSel] = useState<Map<string, Set<string>>>(new Map());
  const [fontSize, setFontSize] = useState(10);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const [colWidths, setColWidths] = useState([22, 180, 80, 160, 70, 100, 100, 110]);
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // ── Inline tag input state (replaces prompt() dialogs) ─────
  const [tagInputMode, setTagInputMode] = useState<'add' | 'remove' | null>(null);
  const [tagInputVal, setTagInputVal] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Focus input when tag input mode activates
  useEffect(() => {
    if (tagInputMode && tagInputRef.current) tagInputRef.current.focus();
  }, [tagInputMode]);

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
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!m.mainTerm.toLowerCase().includes(q)) return false;
      }
      if (!showSorted || !showPartial || !showUnsorted) {
        const hasMatch = m.keywords.some(kwStr => {
          const rec = getKwRec(kwStr, astKeywords);
          const status = rec ? rec.sortingStatus : 'Unsorted';
          if ((status === 'Completely Sorted' || status === 'AI-Sorted') && !showSorted) return false;
          if (status === 'Partially Sorted' && !showPartial) return false;
          if (status === 'Unsorted' && !showUnsorted) return false;
          return true;
        });
        if (m.keywords.length > 0 && !hasMatch) return false;
      }
      return true;
    });
  }, [entries, searchQ, showSorted, showPartial, showUnsorted, astKeywords]);

  // ── Helper: filter keyword sub-rows by kw search + tag search + topic search ──
  const filterKwList = useCallback((kwList: string[]): string[] => {
    let result = kwList;
    if (kwSearchQ) {
      const q = kwSearchQ.toLowerCase();
      result = result.filter(kw => kw.toLowerCase().includes(q));
    }
    if (kwTagQ) {
      const q = kwTagQ.toLowerCase();
      result = result.filter(kw => {
        const rec = getKwRec(kw, astKeywords);
        const tags = parseTags(rec ? rec.tags : '');
        return tags.some(t => t.toLowerCase().includes(q));
      });
    }
    if (kwTopicQ) {
      const q = kwTopicQ.toLowerCase();
      result = result.filter(kw => {
        const rec = getKwRec(kw, astKeywords);
        const topics = (rec?.topic || '').split('|').map(t => t.trim()).filter(Boolean);
        return topics.some(t => t.toLowerCase().includes(q));
      });
    }
    return result;
  }, [kwSearchQ, kwTagQ, kwTopicQ, astKeywords]);

  // ── Select all logic ───────────────────────────────────────
  const selCount = useMemo(() => visible.filter(m => selected.has(m.id)).length, [visible, selected]);
  const totalKwSel = useMemo(() => {
    let count = 0;
    kwSel.forEach(s => { count += s.size; });
    return count;
  }, [kwSel]);
  const selectAllState: 'none' | 'some' | 'all' = selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectAllState === 'some'; }, [selectAllState]);

  // ── View mode helpers ──────────────────────────────────────
  function getViewMode(id: string): number { return viewMode.get(id) || 0; }
  function cycleAllViews() {
    setViewMode(prev => {
      const next = new Map(prev);
      const current = prev.values().next().value || 0;
      const nextMode = ((current as number) + 1) % 3;
      visible.forEach(m => next.set(m.id, nextMode));
      return next;
    });
  }
  function cycleView(id: string) {
    setViewMode(prev => {
      const next = new Map(prev);
      next.set(id, ((next.get(id) || 0) + 1) % 3);
      return next;
    });
  }

  // ── Keyword selection helpers ──────────────────────────────
  function isKwSelected(mtId: string, kwStr: string): boolean {
    const s = kwSel.get(mtId);
    return s ? s.has(kwStr) : false;
  }
  function toggleKwSel(mtId: string, kwStr: string) {
    const wasChecked = kwSel.get(mtId)?.has(kwStr) || false;
    setKwSel(prev => {
      const next = new Map(prev);
      const s = new Set(next.get(mtId) || []);
      s.has(kwStr) ? s.delete(kwStr) : s.add(kwStr);
      next.set(mtId, s);
      return next;
    });
    // Auto-add to TIF when checking (not unchecking)
    if (!wasChecked && onAddToTif) onAddToTif([kwStr]);
  }
  function toggleAllKw(mtId: string, kwList: string[]) {
    setKwSel(prev => {
      const next = new Map(prev);
      const s = next.get(mtId) || new Set();
      const allChecked = kwList.every(k => s.has(k));
      if (allChecked) {
        next.set(mtId, new Set());
      } else {
        next.set(mtId, new Set(kwList));
        // Auto-add to TIF when checking all
        if (onAddToTif && kwList.length > 0) onAddToTif(kwList);
      }
      return next;
    });
  }

  // ── Handlers ───────────────────────────────────────────────
  function handleToggleAll(checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev);
      visible.forEach(m => checked ? next.add(m.id) : next.delete(m.id));
      return next;
    });
  }

  function handleToggleRow(m: MTEntry) {
    const willSelect = !selected.has(m.id);
    setSelected(prev => {
      const next = new Set(prev);
      willSelect ? next.add(m.id) : next.delete(m.id);
      return next;
    });
    if (willSelect) {
      setViewMode(prev => { const next = new Map(prev); next.set(m.id, 1); return next; });
      setKwSel(prev => { const next = new Map(prev); next.set(m.id, new Set(m.keywords)); return next; });
      // Auto-add all keywords to TIF when selecting row
      if (onAddToTif && m.keywords.length > 0) onAddToTif(m.keywords);
    } else {
      setKwSel(prev => { const next = new Map(prev); next.set(m.id, new Set()); return next; });
    }
  }

  function handleAddTerm(e: React.KeyboardEvent) {
    if (e.key !== 'Enter') return;
    const val = addInputRef.current?.value?.trim() || '';
    if (!val) return;
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
    setViewMode(prev => { const n = new Map(prev); n.delete(m.id); return n; });
    setKwSel(prev => { const n = new Map(prev); n.delete(m.id); return n; });
    showToast(`"${m.mainTerm}" removed from Main Terms.`);
  }

  // ── Tag operations (inline input replaces prompt()) ────────
  function handleTagApply() {
    const tagVal = tagInputVal.trim();
    if (!tagVal) { setTagInputMode(null); setTagInputVal(''); return; }
    if (totalKwSel === 0) { showToast('⚠ No keywords checked.'); setTagInputMode(null); setTagInputVal(''); return; }

    if (tagInputMode === 'add') {
      let count = 0;
      const promises: Promise<void>[] = [];
      kwSel.forEach((kwSet) => {
        kwSet.forEach(kwStr => {
          const rec = getKwRec(kwStr, astKeywords);
          if (rec) {
            const existing = parseTags(rec.tags);
            if (!existing.some(t => t.toLowerCase() === tagVal.toLowerCase())) {
              promises.push(onUpdateKeyword(rec.id, { tags: [...existing, tagVal].join(', ') }));
              count++;
            }
          }
        });
      });
      Promise.all(promises).then(() => {
        showToast(`✓ Added tag "${tagVal}" to ${count} keyword${count !== 1 ? 's' : ''}.`);
      });
    } else if (tagInputMode === 'remove') {
      const tagLower = tagVal.toLowerCase();
      let count = 0;
      const promises: Promise<void>[] = [];
      kwSel.forEach((kwSet) => {
        kwSet.forEach(kwStr => {
          const rec = getKwRec(kwStr, astKeywords);
          if (rec) {
            const existing = parseTags(rec.tags);
            const filtered = existing.filter(t => t.toLowerCase() !== tagLower);
            if (filtered.length !== existing.length) {
              promises.push(onUpdateKeyword(rec.id, { tags: filtered.join(', ') }));
              count++;
            }
          }
        });
      });
      Promise.all(promises).then(() => {
        showToast(`✓ Removed tag "${tagVal}" from ${count} keyword${count !== 1 ? 's' : ''}.`);
      });
    }
    setTagInputMode(null);
    setTagInputVal('');
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { handleTagApply(); }
    else if (e.key === 'Escape') { setTagInputMode(null); setTagInputVal(''); }
  }

  // ── Apply Main Term As Tag ─────────────────────────────────
  function handleApplyMtAsTag() {
    if (totalKwSel === 0) { showToast('⚠ No keywords checked.'); return; }
    let count = 0;
    const promises: Promise<void>[] = [];
    // For each MT row that has checked keywords, use that row's mainTerm as the tag
    entries.forEach(m => {
      const kwSet = kwSel.get(m.id);
      if (!kwSet || kwSet.size === 0) return;
      const tagVal = m.mainTerm.trim();
      if (!tagVal) return;
      kwSet.forEach(kwStr => {
        const rec = getKwRec(kwStr, astKeywords);
        if (rec) {
          const existing = parseTags(rec.tags);
          if (!existing.some(t => t.toLowerCase() === tagVal.toLowerCase())) {
            promises.push(onUpdateKeyword(rec.id, { tags: [...existing, tagVal].join(', ') }));
            count++;
          }
        }
      });
    });
    Promise.all(promises).then(() => {
      showToast(`✓ Applied main term as tag to ${count} keyword${count !== 1 ? 's' : ''}.`);
    });
  }

  function handleMarkStatus(status: 'Unsorted' | 'Partially Sorted' | 'Completely Sorted' | 'AI-Sorted') {
    if (totalKwSel === 0) { showToast('⚠ No keywords checked.'); return; }
    let count = 0;
    const promises: Promise<void>[] = [];
    kwSel.forEach((kwSet) => {
      kwSet.forEach(kwStr => {
        const rec = getKwRec(kwStr, astKeywords);
        if (rec) {
          promises.push(onUpdateKeyword(rec.id, { sortingStatus: status }));
          count++;
        }
      });
    });
    Promise.all(promises).then(() => {
      showToast(`✓ Marked ${count} keyword${count !== 1 ? 's' : ''} as ${status}.`);
    });
  }
  function handleRemoveSelected() {
    const count = selected.size;
    if (count === 0) { showToast('⚠ No rows selected.'); return; }
    setEntries(prev => prev.filter(m => !selected.has(m.id)));
    selected.forEach(id => {
      setViewMode(prev => { const n = new Map(prev); n.delete(id); return n; });
      setKwSel(prev => { const n = new Map(prev); n.delete(id); return n; });
    });
    setSelected(new Set());
    showToast(`✓ Removed ${count} selected main term${count !== 1 ? 's' : ''}.`);
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
    setKwSearchQ('');
    setKwTagQ('');
    setKwTopicQ('');
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

  
  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIdx(idx);
  }
  function handleDragEnd() {
    if (dragId != null && dropIdx != null) {
      setEntries(prev => {
        const arr = [...prev];
        const fromIdx = arr.findIndex(m => m.id === dragId);
        if (fromIdx === -1 || fromIdx === dropIdx) return prev;
        const [item] = arr.splice(fromIdx, 1);
        const toIdx = dropIdx > fromIdx ? dropIdx - 1 : dropIdx;
        arr.splice(toIdx, 0, item);
        return arr;
      });
    }
    setDragId(null);
    setDropIdx(null);
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

  // ── Render a single MT row ─────────────────────────────────
  function renderRow(m: MTEntry) {
    const mode = getViewMode(m.id);
    const totalVol = calcMtVolume(m.keywords, astKeywords);
    const isSelected = selected.has(m.id);
    const viewLabel = mode === 0 ? 'comma → vertical → single-line' : mode === 1 ? 'vertical → single-line → comma' : 'single-line → comma → vertical';

    return (
      <tr key={m.id} className={`${isSelected ? 'mt-sel' : ''} ${mode === 1 ? 'mt-row-vertical' : ''}`}
        onDragOver={e => handleDragOver(e, visible.indexOf(m))}
        style={dropIdx === visible.indexOf(m) && dragId !== m.id ? { borderTop: '3px solid #3b82f6', boxShadow: '0 -2px 4px rgba(59,130,246,0.5)' } : undefined}
      >
        {/* Drag handle */}
        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: 4, cursor: 'grab', color: '#94a3b8', fontSize: '1.1em', userSelect: 'none' }}
          draggable
          onDragStart={e => handleDragStart(e, m.id)}
          onDragOver={e => handleDragOver(e, visible.indexOf(m))}
          onDragEnd={handleDragEnd}
        >⁞</td>
        <td style={{ textAlign: 'center', verticalAlign: 'top', paddingTop: 4 }}>
          <input type="checkbox" checked={isSelected} onChange={() => handleToggleRow(m)}
            title="Select row (also switches to vertical view and checks all keywords)"
            style={{ width: 11, height: 11, accentColor: '#3b82f6', cursor: 'pointer' }} />
        </td>
        <td style={{ verticalAlign: 'top' }}>
          <div className="mt-term-cell">
            <span className="mt-term-txt" title={m.mainTerm}>{m.mainTerm}</span>
            <button className="mt-gs-btn" title="Google this term" onClick={() => googleSearch(m.mainTerm)}>?</button>
            <button className="mt-rm-btn" title="Remove this main term row" onClick={() => handleRemoveRow(m)}>−</button>
          </div>
        </td>
        <td className={showMtSv ? '' : 'mt-col-hidden'} style={{ textAlign: 'right', paddingRight: 6, verticalAlign: 'top' }}>
          {fmtMtV(totalVol)}
        </td>
        {mode === 0 ? renderCommaView(m, viewLabel) : mode === 1 ? renderVerticalView(m, viewLabel) : renderAppendedView(m, viewLabel)}
      </tr>
    );
  }

  // ── Comma view (mode 0) ────────────────────────────────────
  function renderCommaView(m: MTEntry, viewLabel: string) {
    const kwList = filterKwList(m.keywords);
    return (
      <>
        <td style={{ wordBreak: 'break-word' }}>
          {kwList.length > 0 ? (
            <div style={{ lineHeight: '1.6' }}>{kwList.join(', ')}</div>
          ) : (
            <span className="mt-empty-kw">{m.keywords.length === 0 ? '(no matching keywords)' : '(no keywords match filters)'}</span>
          )}
        </td>
        <td className={showKwSv ? '' : 'mt-col-hidden'}></td>
        <td className={showTags ? '' : 'mt-col-hidden'}></td>
        <td className={showTopics ? '' : 'mt-col-hidden'}></td>
        <td className={showTopicDesc ? '' : 'mt-col-hidden'}></td>
      </>
    );
  }

  // ── Appended / single-line view (mode 2) ───────────────────
  function renderAppendedView(m: MTEntry, viewLabel: string) {
    const kwList = filterKwList(m.keywords);
    return (
      <>
        <td style={{ overflow: 'hidden' }}>
          <span className="mt-ak-appended">
            {kwList.length > 0 ? kwList.join(', ') : '(no keywords)'}
          </span>
        </td>
        <td className={showKwSv ? '' : 'mt-col-hidden'}></td>
        <td className={showTags ? '' : 'mt-col-hidden'}></td>
        <td className={showTopics ? '' : 'mt-col-hidden'}></td>
        <td className={showTopicDesc ? '' : 'mt-col-hidden'}></td>
      </>
    );
  }

  // ── Vertical view (mode 1) ─────────────────────────────────
  function renderVerticalView(m: MTEntry, viewLabel: string) {
    const kwList = filterKwList(m.keywords);
    const mtKwSelSet = kwSel.get(m.id) || new Set();
    const allChecked = kwList.length > 0 && kwList.every(k => mtKwSelSet.has(k));

    return (
      <>
        <td className="mt-kw-td">
          <div className="mt-kw-master">
            <input type="checkbox" checked={allChecked}
              onChange={() => toggleAllKw(m.id, kwList)}
              title="Check/uncheck all keywords"
              style={{ width: 10, height: 10, accentColor: '#3b82f6', cursor: 'pointer' }} />
            <span className="mt-kw-master-label">
              {kwList.length} keyword{kwList.length !== 1 ? 's' : ''}
              {kwList.length !== m.keywords.length && <span style={{ color: '#f59e0b', marginLeft: 4 }}>(filtered from {m.keywords.length})</span>}
            </span>
          </div>
          <div className="mt-kw-list">
            {kwList.map(kwStr => (
              <div key={kwStr} className={`mt-kw-item ${isKwSelected(m.id, kwStr) ? 'mt-kw-checked' : ''}`}>
                <input type="checkbox" checked={isKwSelected(m.id, kwStr)}
                  onChange={() => toggleKwSel(m.id, kwStr)}
                  style={{ width: 10, height: 10, accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0 }} />
                <span className="mt-kw-text" title={kwStr}>{kwStr}</span>
                <button className="mt-kw-gs" title="Google" onClick={() => googleSearch(kwStr)}>?</button>
              </div>
            ))}
          </div>
        </td>
        <td className={showKwSv ? 'mt-sv-td' : 'mt-col-hidden'}>
          <div className="mt-kw-spacer">&nbsp;</div>
          <div className="mt-kw-list">
            {kwList.map(kwStr => {
              const rec = getKwRec(kwStr, astKeywords);
              return (
                <div key={kwStr} className="mt-kw-item mt-kw-sv-item">
                  {rec ? fmtV(rec.volume) : ''}
                </div>
              );
            })}
          </div>
        </td>
        <td className={showTags ? 'mt-tags-td' : 'mt-col-hidden'}>
          <div className="mt-kw-spacer">&nbsp;</div>
          <div className="mt-kw-list">
            {kwList.map(kwStr => {
              const rec = getKwRec(kwStr, astKeywords);
              const tags = parseTags(rec ? rec.tags : '');
              return (
                <div key={kwStr} className="mt-kw-item">
                  <div className="mt-tag-pills">
                    {tags.map((t, i) => <span key={i} className="mt-tag-pill">{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </td>
        <td className={showTopics ? 'mt-topics-td' : 'mt-col-hidden'}>
          <div className="mt-kw-spacer">&nbsp;</div>
          <div className="mt-kw-list">
            {kwList.map(kwStr => {
              const rec = getKwRec(kwStr, astKeywords);
              const topics = (rec?.topic || '').split('|').map(t => t.trim()).filter(Boolean);
              return (
                <div key={kwStr} className="mt-kw-item">
                  <div className="mt-topic-pills">
                    {topics.map((t, i) => <span key={i} className="mt-topic-pill">{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </td>
        <td className={showTopicDesc ? '' : 'mt-col-hidden'}></td>
      </>
    );
  }

  // ── Main render ────────────────────────────────────────────
  return (
    <div className="mt-panel" style={{ fontSize: `${fontSize}px` }}>
      <div className="mt-ph">
        <span>Main Terms</span>
        {totalKwSel > 0 && (
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginLeft: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9, color: '#64748b', marginRight: 2 }}>{totalKwSel} kw checked →</span>
            <button className="mt-btn" style={{ color: '#6b7280', borderColor: '#d1d5db' }} onClick={() => handleMarkStatus('Unsorted')}>Unsorted</button>
            <button className="mt-btn" style={{ color: '#f59e0b', borderColor: '#fbbf24' }} onClick={() => handleMarkStatus('Partially Sorted')}>Partial</button>
            <button className="mt-btn" style={{ color: '#22c55e', borderColor: '#86efac' }} onClick={() => handleMarkStatus('Completely Sorted')}>Sorted</button>
            <span style={{ width: 1, height: 12, background: '#d1d5db', margin: '0 3px' }} />
            {/* Inline tag input or buttons */}
            {tagInputMode ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 9, color: tagInputMode === 'add' ? '#3b82f6' : '#ef4444' }}>
                  {tagInputMode === 'add' ? '+ Tag:' : '− Tag:'}
                </span>
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInputVal}
                  onChange={e => setTagInputVal(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="tag name…"
                  style={{
                    width: 90, height: 18, fontSize: 9, padding: '0 4px',
                    border: '1px solid ' + (tagInputMode === 'add' ? '#93c5fd' : '#fca5a5'),
                    borderRadius: 3, outline: 'none', background: '#fff',
                  }}
                />
                <button className="mt-btn" style={{ color: '#22c55e', borderColor: '#86efac', fontWeight: 600 }} onClick={handleTagApply}>Apply</button>
                <button className="mt-btn" style={{ color: '#94a3b8', borderColor: '#d1d5db' }} onClick={() => { setTagInputMode(null); setTagInputVal(''); }}>✕</button>
              </div>
            ) : (
              <>
                <button className="mt-btn" style={{ color: '#3b82f6', borderColor: '#93c5fd' }}
                  onClick={() => { if (totalKwSel === 0) { showToast('⚠ No keywords checked.'); return; } setTagInputMode('add'); setTagInputVal(''); }}
                >+ Tag</button>
                <button className="mt-btn" style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                  onClick={() => { if (totalKwSel === 0) { showToast('⚠ No keywords checked.'); return; } setTagInputMode('remove'); setTagInputVal(''); }}
                >− Tag</button>
                <button className="mt-btn" style={{ color: '#0ea5e9', borderColor: '#7dd3fc' }}
                  onClick={handleApplyMtAsTag}
                  title="Add each row's main term as a tag to its checked keywords"
                >MT → Tag</button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="mt-ctrl">
        <div className="mt-search-wrap">
          <input className="mt-search-inp" type="text" placeholder="Search main terms…"
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { /* scroll to top */ } }} />
        </div>
        <div className="mt-ctrl-div" />
        <div className="mt-search-wrap">
          <input className="mt-search-inp" type="text" placeholder="Search keywords…"
            value={kwSearchQ} onChange={e => setKwSearchQ(e.target.value)}
            style={{ width: 105 }} />
        </div>
        <div className="mt-ctrl-div" />
        <div className="mt-search-wrap">
          <input className="mt-search-inp" type="text" placeholder="Search kw tags…"
            value={kwTagQ} onChange={e => setKwTagQ(e.target.value)}
            style={{ width: 95 }} />
        </div>
        <div className="mt-search-wrap">
          <input className="mt-search-inp" type="text" placeholder="Search kw topics…"
            value={kwTopicQ} onChange={e => setKwTopicQ(e.target.value)}
            style={{ width: 100 }} />
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
        <button className="mt-btn" onClick={handleRemoveSelected} title="Remove all selected main term rows" style={selected.size > 0 ? { color: '#e74c3c', borderColor: '#fca5a5' } : {}}>− Remove ({selected.size})</button>
        <button className="mt-btn" onClick={handleCopyTableData} title="Copy visible rows as tab-separated text">Copy Table Data</button>
        <div style={{ flex: 1 }} />
        <button className="mt-zoom-btn" onClick={() => setFontSize(f => Math.max(7, f - 1))}>－</button>
        <span style={{ fontSize: '9px', color: '#64748b', minWidth: 30, textAlign: 'center' }}>{Math.round((fontSize / 10) * 100)}%</span>
        <button className="mt-zoom-btn" onClick={() => setFontSize(f => Math.min(18, f + 1))}>＋</button>
      </div>

      <div className="mt-frame">
        <table className="mt-tbl" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 18 }} />
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
            <th style={{ width: 18, padding: '3px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.8em' }}>⁞</th>
            <th style={{ width: colWidths[0], textAlign: 'center', padding: '3px 2px' }}>
              <input ref={selectAllRef} type="checkbox" checked={selectAllState === 'all'}
                onChange={e => handleToggleAll(e.target.checked)}
                style={{ width: 11, height: 11, accentColor: '#3b82f6', cursor: 'pointer' }} />
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
              <div className="th-inner" style={{ cursor: 'pointer' }} onClick={cycleAllViews} title="Click to cycle all rows: comma → vertical → single-line">Associated Keywords</div>
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
              <tr><td colSpan={9}>
                <div className="mt-empty">
                  <div className="mt-empty-icon">{entries.length === 0 ? '📋' : '🔍'}</div>
                  <div>{entries.length === 0
                    ? 'No main terms yet. Type a term below or paste from Excel.'
                    : 'No main terms match the current filters.'
                  }</div>
                </div>
              </td></tr>
            ) : visible.map(m => renderRow(m))}
          </tbody>
          <tfoot><tr>
            <td style={{ textAlign: 'center', fontSize: 11, color: '#3b82f6', fontWeight: 700, padding: '2px' }}>＋</td>
            <td colSpan={8}>
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
}
