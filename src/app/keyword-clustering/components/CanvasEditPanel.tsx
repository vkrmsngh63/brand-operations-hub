'use client';
import { useState, useEffect, useRef } from 'react';
import type { CanvasNode } from '@/hooks/useCanvas';
import type { Keyword } from '@/hooks/useKeywords';
import './canvas-edit-panel.css';

interface EditPanelProps {
  node: CanvasNode;
  allKeywords: Keyword[];
  onSave: (updates: Partial<CanvasNode>) => void;
  onClose: () => void;
}

export default function CanvasEditPanel({ node, allKeywords, onSave, onClose }: EditPanelProps) {
  const [title, setTitle] = useState(node.title || '');
  const [description, setDescription] = useState(node.description || '');
  const [altTitles, setAltTitles] = useState<string[]>([...(node.altTitles || [])]);
  const [newAlt, setNewAlt] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  // Reset when node changes
  useEffect(() => {
    setTitle(node.title || '');
    setDescription(node.description || '');
    setAltTitles([...(node.altTitles || [])]);
    setNewAlt('');
  }, [node.id, node.title, node.description, node.altTitles]);

  // Focus title on open
  useEffect(() => {
    requestAnimationFrame(() => titleRef.current?.focus());
  }, [node.id]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSave() {
    onSave({
      id: node.id,
      title: title.trim(),
      description: description.trim(),
      altTitles: altTitles.filter(t => t.trim()),
    });
  }

  // Auto-save on blur from title/description
  function handleTitleBlur() {
    if (title.trim() !== (node.title || '')) {
      onSave({ id: node.id, title: title.trim() });
    }
  }
  function handleDescBlur() {
    if (description.trim() !== (node.description || '')) {
      onSave({ id: node.id, description: description.trim() });
    }
  }

  // Alt title management
  function handleAltEdit(idx: number, val: string) {
    const next = [...altTitles];
    next[idx] = val;
    setAltTitles(next);
  }
  function handleAltBlur(idx: number) {
    const cleaned = altTitles.filter(t => t.trim());
    setAltTitles(cleaned);
    onSave({ id: node.id, altTitles: cleaned });
  }
  function handleAltRemove(idx: number) {
    const next = altTitles.filter((_, i) => i !== idx);
    setAltTitles(next);
    onSave({ id: node.id, altTitles: next });
  }
  function handleNewAltBlur() {
    const val = newAlt.trim();
    if (val) {
      const next = [...altTitles, val];
      setAltTitles(next);
      setNewAlt('');
      onSave({ id: node.id, altTitles: next });
    }
  }
  function handleNewAltKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  }

  // Keyword helpers
  const linkedKwIds: string[] = Array.isArray(node.linkedKwIds) ? node.linkedKwIds : [];
  const placements: Record<string, string> = (node.kwPlacements && typeof node.kwPlacements === 'object') ? node.kwPlacements as Record<string, string> : {};
  const linkedKws = linkedKwIds
    .map(id => allKeywords.find(k => k.id === id))
    .filter(Boolean) as Keyword[];
  // Sort by volume desc
  linkedKws.sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0));

  function handleRemoveKw(kwId: string) {
    const newIds = linkedKwIds.filter(id => id !== kwId);
    const newPl = { ...placements };
    delete newPl[kwId];
    onSave({ id: node.id, linkedKwIds: newIds, kwPlacements: newPl });
  }

  function togglePlacement(kwId: string) {
    const newPl = { ...placements };
    if (newPl[kwId] === 's') {
      newPl[kwId] = 'p';
    } else {
      newPl[kwId] = 's';
    }
    onSave({ id: node.id, kwPlacements: newPl });
  }

  // Node metadata
  const childCount = 0; // Could be passed in as prop if needed
  const parentNode = node.parentId !== null;

  return (
    <div className="ep-root">
      {/* Header */}
      <div className="ep-header">
        <span className="ep-header-title">
          {node.title ? `"${node.title}"` : 'Edit Node'}
        </span>
        <button className="ep-close" onClick={onClose} title="Close panel (Escape)">✕</button>
      </div>

      {/* Fields */}
      <div className="ep-body">
        <label className="ep-label">Topic Title</label>
        <input
          ref={titleRef}
          className="ep-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') onClose(); }}
          placeholder="e.g. Awareness Stage"
        />

        <label className="ep-label">Alternate Titles</label>
        <div className="ep-alt-wrap">
          {altTitles.map((t, idx) => (
            <div key={idx} className="ep-alt-row">
              <input
                className="ep-alt-input"
                value={t}
                onChange={e => handleAltEdit(idx, e.target.value)}
                onBlur={() => handleAltBlur(idx)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                placeholder="Alternate title…"
              />
              <button className="ep-alt-rm" onClick={() => handleAltRemove(idx)} title="Remove">×</button>
            </div>
          ))}
          <input
            className="ep-alt-input ep-alt-new"
            value={newAlt}
            onChange={e => setNewAlt(e.target.value)}
            onBlur={handleNewAltBlur}
            onKeyDown={handleNewAltKey}
            placeholder="＋ Add alternate title…"
          />
        </div>

        <label className="ep-label">Topic Description</label>
        <textarea
          className="ep-textarea"
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          onKeyDown={e => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleSave(); }
          }}
          rows={4}
          placeholder="Describe this topic — its role in the funnel, what it covers, etc."
        />

        {/* Keywords section */}
        <div className="ep-kw-header">
          <span>Linked Keywords ({linkedKws.length})</span>
        </div>

        <div className="ep-kw-list">
          {linkedKws.length === 0 ? (
            <div className="ep-kw-empty">
              No keywords linked yet.
              <br />
              <span style={{ fontSize: 9, opacity: 0.7 }}>Drag keywords from AST/MT/TIF onto this node to link them.</span>
            </div>
          ) : (
            linkedKws.map(kw => {
              const isSec = placements[kw.id] === 's';
              return (
                <div key={kw.id} className="ep-kw-row">
                  <button
                    className={`ep-kw-placement ${isSec ? 'sec' : 'pri'}`}
                    onClick={() => togglePlacement(kw.id)}
                    title={isSec ? 'Secondary — click for Primary' : 'Primary — click for Secondary'}
                  >
                    {isSec ? 's' : 'p'}
                  </button>
                  <span className={`ep-kw-name ${isSec ? 'ep-kw-sec' : ''}`} title={kw.keyword}>
                    {kw.keyword}
                  </span>
                  <span className="ep-kw-vol">
                    {kw.volume ? kw.volume.toLocaleString() : ''}
                  </span>
                  <button
                    className="ep-kw-rm"
                    onClick={() => handleRemoveKw(kw.id)}
                    title="Remove keyword from this node"
                  >×</button>
                </div>
              );
            })
          )}
        </div>

        {/* Node info */}
        <div className="ep-info">
          <span>Node #{node.id}</span>
          {parentNode && <span> · Has parent</span>}
          {node.pathwayId && <span> · Path {node.pathwayId}</span>}
        </div>
      </div>
    </div>
  );
}
