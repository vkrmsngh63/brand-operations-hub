'use client';
import { useState, useCallback } from 'react';
import { authFetch } from '@/lib/authFetch';
import { parseCanvasFetchResponses, type RawResponse } from '@/lib/canvas-fetch-parser';

/* ── Types ─────────────────────────────────────────────────────── */
export interface CanvasNode {
  id: string;
  projectId: string;
  title: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
  baseY: number;
  pathwayId: string | null;
  parentId: string | null;
  relationshipType: string;
  linkedKwIds: string[];
  kwPlacements: Record<string, string>;
  collapsedLinear: boolean;
  collapsedNested: boolean;
  narrativeBridge: string;
  altTitles: string[];
  userMinH: number | null;
  connCP: unknown;
  connOutOff: unknown;
  connInOff: unknown;
  sortOrder: number;
  stableId: string;
  stabilityScore: number;
}

export interface CanvasState {
  id: string;
  projectId: string;
  nextStableIdN: number;
  viewX: number;
  viewY: number;
  zoom: number;
}

export interface Pathway {
  id: string;
  projectId: string;
}

export interface SisterLink {
  id: string;
  projectId: string;
  nodeA: string;
  nodeB: string;
}

/* ── Hook ──────────────────────────────────────────────────────── */
/**
 * Canvas state + mutation API for the keyword-clustering tool.
 *
 * Error contract (NEW 2026-04-28 — replaces the prior silent-swallow contract
 * that produced the canvas-blanking bug; see `ROADMAP.md` §"🚨 Canvas-Blanking
 * Intermittent Bug"):
 *
 *   Every method either succeeds AND applies state, or throws AND preserves
 *   prior state. No method silently zeroes / mutates state on a failed
 *   server response. Callers are expected to await + catch; the hook also
 *   exposes a top-level `error` value so the UI can surface "canvas
 *   unavailable" instead of pretending nothing happened.
 *
 *   The runLoop in AutoAnalyze.tsx awaits these methods inside its outer
 *   try/catch, so a thrown error from any of them now routes correctly to
 *   the `API_ERROR` aaState (pause + retry) instead of silently rolling
 *   forward into the next batch.
 */
export function useCanvas(projectId: string) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [sisterLinks, setSisterLinks] = useState<SisterLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const base = `/api/projects/${projectId}/canvas`;

  /* ── Helpers ──────────────────────────────────────────────── */
  /**
   * Read JSON body if `response.ok`; on any failure (HTTP error, parse
   * exception, network exception) returns `null` body and lets the caller
   * decide. Never throws — the caller checks `ok`.
   */
  const readBody = async (res: Response): Promise<RawResponse> => {
    if (!res.ok) {
      return { ok: false, status: res.status, body: null };
    }
    try {
      const body = await res.json();
      return { ok: true, status: res.status, body };
    } catch {
      return { ok: false, status: res.status, body: null };
    }
  };

  /* ── Fetch everything ──────────────────────────────────────── */
  const fetchCanvas = useCallback(async () => {
    setLoading(true);
    try {
      const [nodesRes, stateRes] = await Promise.all([
        authFetch(`${base}/nodes`),
        authFetch(base),
      ]);
      const [nodesRaw, stateRaw] = await Promise.all([
        readBody(nodesRes),
        readBody(stateRes),
      ]);
      const result = parseCanvasFetchResponses(nodesRaw, stateRaw);
      if (!result.ok) {
        // Preserve prior state. Surface error so callers can pause / show UI.
        setError(`fetchCanvas failed: ${result.reason}`);
        throw new Error(`fetchCanvas failed: ${result.reason}`);
      }
      setError(null);
      setNodes(result.nodes as unknown as CanvasNode[]);
      setCanvasState(result.canvasState as unknown as CanvasState | null);
      setPathways(result.pathways as unknown as Pathway[]);
      setSisterLinks(result.sisterLinks as unknown as SisterLink[]);
    } finally {
      setLoading(false);
    }
  }, [base]);

  /* ── Add node ──────────────────────────────────────────────── */
  const addNode = useCallback(async (data: Partial<CanvasNode>) => {
    const res = await authFetch(`${base}/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = `addNode failed: HTTP ${res.status}`;
      setError(msg);
      throw new Error(msg);
    }
    const node = await res.json();
    setError(null);
    setNodes(prev => [...prev, node]);
    return node as CanvasNode;
  }, [base]);

  /* ── Update nodes (bulk) ───────────────────────────────────── */
  const updateNodes = useCallback(async (updates: Partial<CanvasNode>[]) => {
    const res = await authFetch(`${base}/nodes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes: updates }),
    });
    if (!res.ok) {
      const msg = `updateNodes failed: HTTP ${res.status}`;
      setError(msg);
      throw new Error(msg);
    }
    setError(null);
    setNodes(prev =>
      prev.map(n => {
        const u = updates.find(u => u.id === n.id);
        return u ? { ...n, ...u } : n;
      })
    );
  }, [base]);

  /* ── Delete node ───────────────────────────────────────────── */
  const deleteNode = useCallback(async (nodeId: string) => {
    // Optimistic remove, but ROLL BACK on failure so client state stays
    // consistent with the server.
    let snapshot: CanvasNode[] = [];
    setNodes(prev => {
      snapshot = prev;
      return prev.filter(n => n.id !== nodeId);
    });
    const res = await authFetch(`${base}/nodes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: nodeId }),
    });
    if (!res.ok) {
      // Roll back to the snapshot so we don't show a "deleted" node that
      // still exists on the server.
      setNodes(snapshot);
      const msg = `deleteNode failed: HTTP ${res.status}`;
      setError(msg);
      throw new Error(msg);
    }
    setError(null);
  }, [base]);

  /* ── Update canvas state (viewport, zoom) ──────────────────── */
  const updateCanvasState = useCallback(async (data: Partial<CanvasState>) => {
    const res = await authFetch(base, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const msg = `updateCanvasState failed: HTTP ${res.status}`;
      setError(msg);
      throw new Error(msg);
    }
    setError(null);
    setCanvasState(prev => prev ? { ...prev, ...data } : prev);
  }, [base]);

  return {
    nodes, setNodes, canvasState, pathways, sisterLinks, loading, error,
    fetchCanvas, addNode, updateNodes, deleteNode, updateCanvasState,
  };
}
