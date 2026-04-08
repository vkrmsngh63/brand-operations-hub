'use client';

import { useState, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────
export interface Keyword {
  id: string;
  keyword: string;
  volume: string;
  sortingStatus: 'Unsorted' | 'Partially Sorted' | 'Completely Sorted' | 'AI-Sorted';
  tags: string;
  topic: string;
  sortOrder: number;
    canvasLoc: Record<string, string>;
    topicApproved: Record<string, boolean>;
  projectId: string;
}

interface BulkImportRow {
  keyword: string;
  volume?: string;
  sortingStatus?: string;
  tags?: string;
}

// ── Hook ───────────────────────────────────────────────────────
export function useKeywords(projectId: string | null, userId: string | null) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextSortRef = useRef(0);

  const base = projectId ? `/api/projects/${projectId}/keywords` : null;

  function authHeaders(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = {};
    if (userId) h['x-user-id'] = userId;
    if (extra) Object.assign(h, extra);
    return h;
  }

  // ── Fetch all ────────────────────────────────────────────────
  const fetchKeywords = useCallback(async () => {
    if (!base || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(base, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data: Keyword[] = await res.json();
      data.sort((a, b) => a.sortOrder - b.sortOrder);
      setKeywords(data);
      nextSortRef.current = data.length > 0
        ? Math.max(...data.map(k => k.sortOrder)) + 1
        : 0;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [base, userId]);

  // ── Add single keyword ───────────────────────────────────────
  const addKeyword = useCallback(async (kw: string, vol: string): Promise<boolean> => {
    if (!base || !userId) return false;
    kw = kw.trim();
    if (!kw) return false;
    if (keywords.some(k => k.keyword === kw)) return false;

    let v = vol.trim();
    if (/^\d+(\.\d+)?[Kk]$/.test(v)) v = String(parseFloat(v) * 1000);
    if (/^\d+(\.\d+)?[Mm]$/.test(v)) v = String(parseFloat(v) * 1_000_000);

    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ keyword: kw, volume: v, sortOrder: nextSortRef.current }),
      });
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      const created: Keyword = await res.json();
      nextSortRef.current++;
      setKeywords(prev => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  }, [base, userId, keywords]);

  // ── Bulk import (paste from Excel) ───────────────────────────
  const bulkImport = useCallback(async (rows: BulkImportRow[]): Promise<{ added: number; dupes: number }> => {
    if (!base || !userId) return { added: 0, dupes: 0 };
    const existingSet = new Set(keywords.map(k => k.keyword));
    const deduped: BulkImportRow[] = [];
    let dupes = 0;
    for (const r of rows) {
      if (existingSet.has(r.keyword) || deduped.some(d => d.keyword === r.keyword)) {
        dupes++;
      } else {
        deduped.push(r);
      }
    }
    if (deduped.length === 0) return { added: 0, dupes };

    const payload = deduped.map((r, i) => {
      let v = (r.volume || '').trim();
      if (/^\d+(\.\d+)?[Kk]$/.test(v)) v = String(parseFloat(v) * 1000);
      if (/^\d+(\.\d+)?[Mm]$/.test(v)) v = String(parseFloat(v) * 1_000_000);
      return {
        keyword: r.keyword,
        volume: v,
        sortingStatus: r.sortingStatus || 'Unsorted',
        tags: r.tags || '',
        sortOrder: nextSortRef.current + i,
      };
    });

    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ keywords: payload }),
      });
      if (!res.ok) throw new Error(`Bulk import failed: ${res.status}`);
      const result = await res.json();
      const addedCount = result.created || result.count || deduped.length;
      nextSortRef.current += addedCount;
      await fetchKeywords();
      return { added: addedCount, dupes };
    } catch {
      return { added: 0, dupes };
    }
  }, [base, userId, keywords]);

  // ── Update single keyword ────────────────────────────────────
  const updateKeyword = useCallback(async (id: string, patch: Partial<Keyword>) => {
    if (!base || !userId) return;
    try {
      const res = await fetch(`${base}/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const updated: Keyword = await res.json();
      setKeywords(prev => prev.map(k => k.id === id ? updated : k));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update error');
    }
  }, [base, userId]);

  // ── Batch update ─────────────────────────────────────────────
  const batchUpdate = useCallback(async (ids: string[], patch: Partial<Keyword>) => {
    if (!base || !userId) return;
    setKeywords(prev =>
      prev.map(k => ids.includes(k.id) ? { ...k, ...patch } : k)
    );
    await Promise.all(ids.map(id =>
      fetch(`${base}/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(patch),
      })
    ));
  }, [base, userId]);

  // ── Delete single ────────────────────────────────────────────
  const deleteKeyword = useCallback(async (id: string) => {
    if (!base || !userId) return;
    setKeywords(prev => prev.filter(k => k.id !== id));
    await fetch(`${base}/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  }, [base, userId]);

  // ── Bulk delete ──────────────────────────────────────────────
  const bulkDelete = useCallback(async (ids: string[]) => {
    if (!base || !userId) return;
    setKeywords(prev => prev.filter(k => !ids.includes(k.id)));
    await fetch(base, {
      method: 'DELETE',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ids }),
    });
  }, [base, userId]);

  // ── Reorder (update sortOrders and persist) ──────────────────
  const reorder = useCallback(async (reorderedKeywords: Keyword[]) => {
    const updated = reorderedKeywords.map((k, i) => ({ ...k, sortOrder: i }));
    setKeywords(updated);
    nextSortRef.current = updated.length;

    if (!base || !userId) return;
    try {
      const toUpdate = updated.filter(k => {
        const orig = reorderedKeywords.find(o => o.id === k.id);
        return orig && orig.sortOrder !== k.sortOrder;
      });
      if (toUpdate.length > 0) {
        await Promise.all(toUpdate.map(k =>
          fetch(`${base}/${k.id}`, {
            method: 'PATCH',
            headers: authHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ sortOrder: k.sortOrder }),
          })
        ));
      }
    } catch {
      // Reorder saved locally — server sync will retry on next page load
    }
  }, [base, userId]);

  return {
    keywords,
    setKeywords,
    loading,
    error,
    fetchKeywords,
    addKeyword,
    bulkImport,
    updateKeyword,
    batchUpdate,
    deleteKeyword,
    bulkDelete,
    reorder,
  };
}