'use client';

import React, {
  useState, useCallback, useRef, useMemo, useEffect,
} from 'react';
import type { Keyword } from '@/hooks/useKeywords';
import './tif-table.css';

// ── Split selection helpers ────────────────────────────────────
type SplitSelMap = Map<string, Set<string>>;

function splitIsChecked(map: SplitSelMap, kwId: string, topic: string): boolean {
  const s = map.get(kwId);
  return s ? s.has(topic) : false;
}

function splitSetChecked(map: SplitSelMap, kwId: string, topic: string, val: boolean): SplitSelMap {
  const next = new Map(map);
  if (!next.has(kwId)) next.set(kwId, new Set());
  const s = new Set(next.get(kwId)!);
  if (val) s.add(topic); else s.delete(topic);
  if (s.size === 0) next.delete(kwId); else next.set(kwId, s);
  return next;
}

function splitAllChecked(map: SplitSelMap): { kwId: string; topic: string }[] {
  const res: { kwId: string; topic: string }[] = [];
  map.forEach((topics, kwId) => topics.forEach(tp => res.push({ kwId, topic: tp })));
  return res;
}

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

function parseTopics(str: string): string[] {
  return (str || '').split('|').map(t => t.trim()).filter(Boolean);
}

function getKwRec(kwStr: string, astKeywords: Keyword[]): Keyword | undefined {
  return astKeywords.find(k => k.keyword === kwStr);
}

// ── Inline Topic Pills (Combined view) for TIF ────────────────
function TifTopicPills({ kwStr, astKeywords, onTopicEdit, onFilterTopic }: {
  kwStr: string; astKeywords: Keyword[];
  onTopicEdit: (oldTopics: string, newTopics: string) => void;
  onFilterTopic: (topic: string) => void;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [addVal, setAddVal] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  const rec = getKwRec(kwStr, astKeywords);
  const topicStr = rec?.topic || '';
  const topicList = parseTopics(topicStr);

  useEffect(() => { if (editIdx !== null && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editIdx]);
  useEffect(() => { if (addMode && addRef.current) addRef.current.focus(); }, [addMode]);

  function commitEdit() {
    if (editIdx === null) return;
    const newList = [...topicList];
    if (editVal.trim() === '') newList.splice(editIdx, 1); else newList[editIdx] = editVal.trim();
    const newStr = newList.join(' | ');
    if (newStr !== topicStr) onTopicEdit(topicStr, newStr);
    setEditIdx(null); setEditVal('');
  }
  function commitAdd() {
    const v = addVal.trim();
    if (v && !topicList.includes(v)) onTopicEdit(topicStr, [...topicList, v].join(' | '));
    setAddMode(false); setAddVal('');
  }

  return (
    <>
      {topicList.map((t, i) =>
        editIdx === i ? (
          <input key={i} ref={editRef} className="tif-topic-inp" type="text" value={editVal}
            onChange={e => setEditVal(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitEdit}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') { setEditIdx(null); setEditVal(''); } }}
            style={{ width: 70, height: 16, fontSize: '0.85em', padding: '0 3px', border: '1px solid #c4b5fd', borderRadius: 3, display: 'inline-block', margin: '0 1px' }} />
        ) : (
          <span key={i} className="tif-topic-pill" style={{ cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setEditIdx(i); setEditVal(t); setAddMode(false); }}
            onContextMenu={e => { e.preventDefault(); onFilterTopic(t); }}
            title={`Click to edit · Right-click to filter by "${t}"`}>{t}</span>
        )
      )}
      {addMode ? (
        <input ref={addRef} className="tif-topic-inp" type="text" placeholder="topic…" value={addVal}
          onChange={e => setAddVal(e.target.value)} onClick={e => e.stopPropagation()} onBlur={commitAdd}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') { setAddMode(false); setAddVal(''); } }}
          style={{ width: 60, height: 16, fontSize: '0.85em', padding: '0 3px', border: '1px solid #c4b5fd', borderRadius: 3, display: 'inline-block', margin: '0 1px' }} />
      ) : (
        <span className="tif-topic-add" onClick={e => { e.stopPropagation(); setAddMode(true); setAddVal(''); }}
          style={{ cursor: 'pointer', color: '#8b5cf6', fontSize: '0.85em', fontWeight: 600, marginLeft: 2 }} title="Add topic">+</span>
      )}
    </>
  );
}

// ── Split Topic Cell for TIF ───────────────────────────────────
function TifSplitTopicCell({ kw, splitTopicSel, setSplitTopicSel, onSplitTopicEdit, onSplitTopicAdd, onSplitApprovalToggle, hidden }: {
  kw: Keyword;
  splitTopicSel: SplitSelMap;
  setSplitTopicSel: React.Dispatch<React.SetStateAction<SplitSelMap>>;
  onSplitTopicEdit: (kwId: string, oldTopic: string, newTopic: string) => void;
  onSplitTopicAdd: (kwId: string, newTopic: string) => void;
  onSplitApprovalToggle: (kwId: string, topic: string) => void;
  hidden: boolean;
}) {
  const [editTopic, setEditTopic] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addMode, setAddMode] = useState(false);
  const [addValue, setAddValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editTopic !== null && editRef.current) { editRef.current.focus(); editRef.current.select(); } }, [editTopic]);
  useEffect(() => { if (addMode && addRef.current) addRef.current.focus(); }, [addMode]);

  if (hidden) return <td className="tif-col-hidden" />;

  const topics = parseTopics(kw.topic);

  return (
    <td style={{ verticalAlign: 'top', padding: 0, overflow: 'visible', whiteSpace: 'nowrap' }}>
      <div className="tif-split-list">
        {topics.length === 0 ? (
          <div className="tif-split-item" />
        ) : (
          topics.map(topic => {
            const isChecked = splitIsChecked(splitTopicSel, kw.id, topic);
            const approved = kw.topicApproved && kw.topicApproved[topic];
            return (
              <div key={topic} className="tif-split-item" data-kw-id={kw.id} data-topic={topic}
                onMouseEnter={e => {
                  const tr = (e.currentTarget as HTMLElement).closest('tr');
                  if (!tr) return;
                  const idx = Array.from(e.currentTarget.parentElement!.children).indexOf(e.currentTarget);
                  const partner = tr.querySelectorAll('.tif-split-list')[1]?.children[idx] as HTMLElement | undefined;
                  if (partner) partner.classList.add('tif-split-hl');
                  e.currentTarget.classList.add('tif-split-hl');
                }}
                onMouseLeave={e => {
                  const tr = (e.currentTarget as HTMLElement).closest('tr');
                  if (!tr) return;
                  const idx = Array.from(e.currentTarget.parentElement!.children).indexOf(e.currentTarget);
                  const partner = tr.querySelectorAll('.tif-split-list')[1]?.children[idx] as HTMLElement | undefined;
                  if (partner) partner.classList.remove('tif-split-hl');
                  e.currentTarget.classList.remove('tif-split-hl');
                }}
              >
                <span className="tif-split-drag" title="Drag this topic to canvas">⁞</span>
                <input type="checkbox" checked={isChecked}
                  onChange={e => setSplitTopicSel(prev => splitSetChecked(prev, kw.id, topic, e.target.checked))}
                  onClick={e => e.stopPropagation()}
                  style={{ width: 11, height: 11, accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0 }}
                  title={topic} />
                {editTopic === topic ? (
                  <input ref={editRef} className="tif-topic-inp" type="text" value={editValue}
                    onChange={e => setEditValue(e.target.value)} onClick={e => e.stopPropagation()}
                    onBlur={() => {
                      const v = editValue.trim();
                      if (v !== editTopic) onSplitTopicEdit(kw.id, editTopic, v);
                      setEditTopic(null); setEditValue('');
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') { setEditTopic(null); setEditValue(''); } }}
                    style={{ width: 100, flexShrink: 0, fontSize: '0.85em', padding: '0 3px', border: '1px solid #c4b5fd', borderRadius: 3 }} />
                ) : (
                  <span className="tif-topic-pill" style={{ flexShrink: 0, cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); setEditTopic(topic); setEditValue(topic); setAddMode(false); }}
                    title={`Click to edit topic "${topic}"`}>{topic}</span>
                )}
                <button className={`tif-split-status ${approved ? 'tif-split-ok' : 'tif-split-x'}`}
                  onClick={e => { e.stopPropagation(); onSplitApprovalToggle(kw.id, topic); }}
                  title={approved ? 'Approved — click to unapprove' : 'Unapproved — click to approve'}>
                  {approved ? '✓' : '✕'}
                </button>
              </div>
            );
          })
        )}
        <div className="tif-split-item tif-split-add"
          onClick={e => { e.stopPropagation(); setAddMode(true); setAddValue(''); }}>
          {addMode ? (
            <input ref={addRef} className="tif-topic-inp" type="text" placeholder="New topic…" value={addValue}
              onChange={e => setAddValue(e.target.value)} onClick={e => e.stopPropagation()}
              onBlur={() => {
                const v = addValue.trim();
                if (v) onSplitTopicAdd(kw.id, v);
                setAddMode(false); setAddValue('');
              }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') { setAddMode(false); setAddValue(''); } }}
              style={{ width: 120, flexShrink: 0, fontSize: '0.85em', padding: '0 3px', border: '1px solid #c4b5fd', borderRadius: 3 }} />
          ) : (
            <span style={{ cursor: 'pointer', color: '#8b5cf6', fontSize: '0.8em', opacity: 0.55, userSelect: 'none' }}>⊕ add topic</span>
          )}
        </div>
      </div>
    </td>
  );
}

// ── Split Description Cell for TIF ─────────────────────────────
function TifSplitDescCell({ kw, splitDescSel, setSplitDescSel, onSplitDescEdit, hidden }: {
  kw: Keyword;
  splitDescSel: SplitSelMap;
  setSplitDescSel: React.Dispatch<React.SetStateAction<SplitSelMap>>;
  onSplitDescEdit: (kwId: string, topic: string, newDesc: string) => void;
  hidden: boolean;
}) {
  const [editTopic, setEditTopic] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editTopic !== null && taRef.current) {
      taRef.current.focus();
      taRef.current.setSelectionRange(taRef.current.value.length, taRef.current.value.length);
    }
  }, [editTopic]);

  if (hidden) return <td className="tif-col-hidden" />;

  const topics = parseTopics(kw.topic);

  return (
    <td style={{ verticalAlign: 'top', padding: 0, overflow: 'visible', whiteSpace: 'normal' }}>
      <div className="tif-split-list tif-split-desc-wrap">
        {topics.length === 0 ? (
          <div className="tif-split-item" style={{ display: 'block', padding: 2 }} />
        ) : (
          topics.map(topic => {
            const isChecked = splitIsChecked(splitDescSel, kw.id, topic);
            const desc = (kw.canvasLoc && kw.canvasLoc[topic]) || '';
            return (
              <div key={topic} className="tif-split-item"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 3, padding: '2px', overflow: 'visible', whiteSpace: 'normal' }}
                onMouseEnter={e => {
                  const tr = (e.currentTarget as HTMLElement).closest('tr');
                  if (!tr) return;
                  const idx = Array.from(e.currentTarget.parentElement!.children).indexOf(e.currentTarget);
                  const partner = tr.querySelectorAll('.tif-split-list')[0]?.children[idx] as HTMLElement | undefined;
                  if (partner) partner.classList.add('tif-split-hl');
                  e.currentTarget.classList.add('tif-split-hl');
                }}
                onMouseLeave={e => {
                  const tr = (e.currentTarget as HTMLElement).closest('tr');
                  if (!tr) return;
                  const idx = Array.from(e.currentTarget.parentElement!.children).indexOf(e.currentTarget);
                  const partner = tr.querySelectorAll('.tif-split-list')[0]?.children[idx] as HTMLElement | undefined;
                  if (partner) partner.classList.remove('tif-split-hl');
                  e.currentTarget.classList.remove('tif-split-hl');
                }}
              >
                <input type="checkbox" checked={isChecked}
                  onChange={e => setSplitDescSel(prev => splitSetChecked(prev, kw.id, topic, e.target.checked))}
                  onClick={e => e.stopPropagation()}
                  className="tif-split-desc-cb" title="Check to bulk-edit descriptions" />
                {editTopic === topic ? (
                  <textarea ref={taRef} className="tif-split-desc-ta" value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    placeholder={`Enter description for "${topic}"…`}
                    onBlur={() => { onSplitDescEdit(kw.id, editTopic, editValue.trim()); setEditTopic(null); setEditValue(''); }}
                    onKeyDown={e => {
                      if (e.key === 'Escape') { e.preventDefault(); setEditTopic(null); setEditValue(''); }
                      if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); onSplitDescEdit(kw.id, editTopic, editValue.trim()); setEditTopic(null); setEditValue(''); }
                    }} />
                ) : (
                  <span className={`tif-split-desc-text${desc ? '' : ' empty'}`}
                    onClick={() => { setEditTopic(topic); setEditValue(desc); }}
                    title={`Click to edit description for "${topic}"`}
                    style={{ flex: 1 }}>
                    {desc || '+ add description…'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </td>
  );
}

export default function TIFTable({ astKeywords, tifKeywords, onSetTifKeywords, onUpdateKeyword, tifActive, onSetTifActive }: TIFTableProps) {
  const [searchQ, setSearchQ] = useState('');
  const [showVol, setShowVol] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [showTopicDesc, setShowTopicDesc] = useState(true);
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
  const [colWidths, setColWidths] = useState([22, 18, 180, 70, 90, 100, 100, 110]);
  const resizeRef = useRef<{ col: number; startX: number; startW: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  // ── Split Topics View state ──────────────────────────────────
  const [splitTopics, setSplitTopics] = useState(false);
  const [splitTopicSel, setSplitTopicSel] = useState<SplitSelMap>(new Map());
  const [splitDescSel, setSplitDescSel] = useState<SplitSelMap>(new Map());
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  const visible = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    return tifKeywords.filter(kw => {
      const rec = getKwRec(kw, astKeywords);
      const st = rec ? rec.sortingStatus : 'Unsorted';
      if ((st === 'Completely Sorted' || st === 'AI-Sorted') && !showSorted) return false;
      if (st === 'Partially Sorted' && !showPartial) return false;
      if ((st === 'Unsorted' || st === 'Reshuffled') && !showUnsorted) return false;
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
        const pills = parseTopics(rec?.topic || '');
        if (!pills.some(p => p.toLowerCase() === topicQ.toLowerCase())) return false;
      }
      if (topicFilter) {
        const pills = parseTopics(rec?.topic || '');
        if (!pills.some(p => p.toLowerCase() === topicFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [tifKeywords, searchQ, showSorted, showPartial, showUnsorted, astKeywords, tagQ, topicQ, topicFilter]);

  // ── Height sync for split view sub-rows ──────────────────────
  useEffect(() => {
    if (!splitTopics || !tbodyRef.current) return;
    const tbody = tbodyRef.current;
    requestAnimationFrame(() => {
      tbody.querySelectorAll('tr[data-tif-kw]').forEach(tr => {
        const lists = Array.from(tr.querySelectorAll('.tif-split-list'));
        if (lists.length < 2) return;
        const maxLen = Math.max(...lists.map(l => l.children.length));
        lists.forEach(l => {
          Array.from(l.children).forEach(el => {
            (el as HTMLElement).style.height = '';
            (el as HTMLElement).style.minHeight = '';
          });
        });
        for (let i = 0; i < maxLen; i++) {
          const items = lists.map(l => l.children[i]).filter(Boolean) as HTMLElement[];
          const maxH = Math.max(...items.map(el => el.getBoundingClientRect().height));
          if (maxH > 0) items.forEach(el => { el.style.minHeight = maxH + 'px'; });
        }
      });
    });
  }, [splitTopics, astKeywords, showTopics, showTopicDesc]);

  const selCount = useMemo(() => visible.filter(kw => selected.has(kw)).length, [visible, selected]);
  const selectAllState: 'none' | 'some' | 'all' = selCount === 0 ? 'none' : selCount === visible.length ? 'all' : 'some';
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = selectAllState === 'some'; }, [selectAllState]);

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

  function handleTifTopicEdit(kwStr: string, oldTopicStr: string, newTopicStr: string) {
    const oldTopics = parseTopics(oldTopicStr);
    const newTopics = parseTopics(newTopicStr);
    const addedTopics = newTopics.filter(t => !oldTopics.includes(t));
    const removedTopics = oldTopics.filter(t => !newTopics.includes(t));
    if (selected.has(kwStr) && selected.size > 1 && (addedTopics.length > 0 || removedTopics.length > 0)) {
      const promises: Promise<void>[] = [];
      selected.forEach(kw => {
        const rec = getKwRec(kw, astKeywords);
        if (!rec) return;
        let existing = parseTopics(rec.topic);
        addedTopics.forEach(t => { if (!existing.includes(t)) existing.push(t); });
        removedTopics.forEach(t => { existing = existing.filter(x => x !== t); });
        promises.push(onUpdateKeyword(rec.id, { topic: existing.join(' | ') }));
      });
      Promise.all(promises);
    } else {
      const rec = getKwRec(kwStr, astKeywords);
      if (rec) onUpdateKeyword(rec.id, { topic: newTopicStr });
    }
  }

  // ── Split view handlers ──────────────────────────────────────
  async function handleSplitTopicEdit(kwId: string, oldTopic: string, newTopic: string) {
    const kw = astKeywords.find(k => k.id === kwId);
    if (!kw) return;
    const isChecked = splitIsChecked(splitTopicSel, kwId, oldTopic);
    if (isChecked) {
      const allChecked = splitAllChecked(splitTopicSel);
      const sameText = allChecked.every(d => d.topic === oldTopic);
      if (sameText) {
        const promises: Promise<void>[] = [];
        for (const d of allChecked) {
          const rec = astKeywords.find(k => k.id === d.kwId);
          if (!rec) continue;
          const arr = parseTopics(rec.topic);
          const idx = arr.indexOf(d.topic);
          if (idx === -1) continue;
          if (newTopic === '') arr.splice(idx, 1); else arr[idx] = newTopic;
          const cl = { ...(rec.canvasLoc || {}) };
          const ta = { ...(rec.topicApproved || {}) };
          if (newTopic === '') { delete cl[d.topic]; delete ta[d.topic]; }
          else if (newTopic !== d.topic) {
            if (cl[d.topic] !== undefined) { cl[newTopic] = cl[d.topic]; delete cl[d.topic]; }
            if (ta[d.topic] !== undefined) { ta[newTopic] = ta[d.topic]; delete ta[d.topic]; }
          }
          promises.push(onUpdateKeyword(rec.id, { topic: arr.join(' | '), canvasLoc: cl, topicApproved: ta }));
        }
        await Promise.all(promises);
        setSplitTopicSel(new Map());
        return;
      }
    }
    const arr = parseTopics(kw.topic);
    const idx = arr.indexOf(oldTopic);
    if (idx === -1) return;
    if (newTopic === '') arr.splice(idx, 1); else arr[idx] = newTopic;
    const cl = { ...(kw.canvasLoc || {}) };
    const ta = { ...(kw.topicApproved || {}) };
    if (newTopic === '') { delete cl[oldTopic]; delete ta[oldTopic]; }
    else if (newTopic !== oldTopic) {
      if (cl[oldTopic] !== undefined) { cl[newTopic] = cl[oldTopic]; delete cl[oldTopic]; }
      if (ta[oldTopic] !== undefined) { ta[newTopic] = ta[oldTopic]; delete ta[oldTopic]; }
    }
    await onUpdateKeyword(kw.id, { topic: arr.join(' | '), canvasLoc: cl, topicApproved: ta });
  }

  async function handleSplitTopicAdd(kwId: string, newTopic: string) {
    const kw = astKeywords.find(k => k.id === kwId);
    if (!kw) return;
    const arr = parseTopics(kw.topic);
    if (!arr.includes(newTopic)) {
      arr.push(newTopic);
      await onUpdateKeyword(kw.id, { topic: arr.join(' | ') });
    }
  }

  async function handleSplitApprovalToggle(kwId: string, topic: string) {
    const kw = astKeywords.find(k => k.id === kwId);
    if (!kw) return;
    const ta = { ...(kw.topicApproved || {}) };
    const newState = !ta[topic];
    if (newState) ta[topic] = true; else delete ta[topic];
    if (splitIsChecked(splitTopicSel, kwId, topic)) {
      const allChecked = splitAllChecked(splitTopicSel);
      const promises: Promise<void>[] = [];
      for (const d of allChecked) {
        if (d.kwId === kwId && d.topic === topic) continue;
        const rec = astKeywords.find(k => k.id === d.kwId);
        if (!rec) continue;
        const rta = { ...(rec.topicApproved || {}) };
        if (newState) rta[d.topic] = true; else delete rta[d.topic];
        promises.push(onUpdateKeyword(rec.id, { topicApproved: rta }));
      }
      await Promise.all([onUpdateKeyword(kw.id, { topicApproved: ta }), ...promises]);
    } else {
      await onUpdateKeyword(kw.id, { topicApproved: ta });
    }
  }

  async function handleSplitDescEdit(kwId: string, topic: string, newDesc: string) {
    const kw = astKeywords.find(k => k.id === kwId);
    if (!kw) return;
    const cl = { ...(kw.canvasLoc || {}) };
    const origVal = cl[topic] || '';
    if (newDesc === '') delete cl[topic]; else cl[topic] = newDesc;
    const promises: Promise<void>[] = [];
    if (splitIsChecked(splitTopicSel, kwId, topic)) {
      for (const d of splitAllChecked(splitTopicSel)) {
        if (d.kwId === kwId && d.topic === topic) continue;
        const rec = astKeywords.find(k => k.id === d.kwId);
        if (!rec) continue;
        const rcl = { ...(rec.canvasLoc || {}) };
        if (newDesc === '') delete rcl[d.topic]; else rcl[d.topic] = newDesc;
        promises.push(onUpdateKeyword(rec.id, { canvasLoc: rcl }));
      }
    }
    if (splitIsChecked(splitDescSel, kwId, topic)) {
      for (const d of splitAllChecked(splitDescSel)) {
        if (d.kwId === kwId && d.topic === topic) continue;
        const rec = astKeywords.find(k => k.id === d.kwId);
        if (!rec) continue;
        const rOrigVal = (rec.canvasLoc || {})[d.topic] || '';
        if (rOrigVal === origVal) {
          const rcl = { ...(rec.canvasLoc || {}) };
          if (newDesc === '') delete rcl[d.topic]; else rcl[d.topic] = newDesc;
          promises.push(onUpdateKeyword(rec.id, { canvasLoc: rcl }));
        }
      }
    }
    await Promise.all([onUpdateKeyword(kw.id, { canvasLoc: cl }), ...promises]);
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
    setDragId(kw); e.dataTransfer.effectAllowed = 'copyMove'; const dragKws = selected.has(kw) && selected.size > 1 ? [...selected] : [kw]; const kwIds = dragKws.map(k => astKeywords.find(ak => ak.keyword === k)?.id).filter(Boolean); e.dataTransfer.setData('text/kst-kwids', JSON.stringify(kwIds));
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
    if (st === 'Reshuffled') return 'tif-st-r';
    return 'tif-st-u';
  }

  const colSpanCount = 8;

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
        <label className="tif-cb-label"><input type="checkbox" checked={showTopicDesc} onChange={e => setShowTopicDesc(e.target.checked)} /> Topic Desc.</label>
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
            <col style={{ width: colWidths[7] }} className={showTopicDesc ? '' : 'tif-col-hidden'} />
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
            <th className={showTopics ? '' : 'tif-col-hidden'} style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setSplitTopics(s => !s)}
              title="Click to toggle Split / Combined Topics view"
            >
              <div className="th-inner">Topics{splitTopics && <span className="tif-split-badge">Split</span>}<input type="text" className="tif-search-inp" placeholder="search topics…" value={topicQ} onChange={e => setTopicQ(e.target.value)} onClick={e => e.stopPropagation()} style={{ width: 72, fontSize: 8, marginLeft: 3 }} /></div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 6)} />
            </th>
            <th className={showTopicDesc ? '' : 'tif-col-hidden'} style={{ position: 'relative' }}>
              <div className="th-inner">Topic Descriptions</div>
              <div className="tif-col-resize" onMouseDown={e => handleColResize(e, 7)} />
            </th>
          </tr></thead>
          <tbody ref={tbodyRef}>
            {visible.length === 0 ? (
              <tr><td colSpan={colSpanCount}>
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
              const isSelected = selected.has(kw);
              return (
                <tr key={kw} className={isSelected ? 'tif-sel' : ''} data-tif-kw={kw}
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
                  {splitTopics && showTopics && rec ? (
                    <TifSplitTopicCell kw={rec} splitTopicSel={splitTopicSel} setSplitTopicSel={setSplitTopicSel}
                      onSplitTopicEdit={handleSplitTopicEdit} onSplitTopicAdd={handleSplitTopicAdd}
                      onSplitApprovalToggle={handleSplitApprovalToggle} hidden={!showTopics} />
                  ) : (
                    <td className={showTopics ? '' : 'tif-col-hidden'}>
                      {rec && <TifTopicPills kwStr={kw} astKeywords={astKeywords}
                        onTopicEdit={(o, n) => handleTifTopicEdit(kw, o, n)}
                        onFilterTopic={t => setTopicFilter(prev => prev === t ? '' : t)} />}
                    </td>
                  )}
                  {splitTopics && showTopicDesc && rec ? (
                    <TifSplitDescCell kw={rec} splitDescSel={splitDescSel} setSplitDescSel={setSplitDescSel}
                      onSplitDescEdit={handleSplitDescEdit} hidden={!showTopicDesc} />
                  ) : (
                    <td className={showTopicDesc ? '' : 'tif-col-hidden'}></td>
                  )}
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
