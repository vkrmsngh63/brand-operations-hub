'use client';
import { useState, useCallback } from 'react';
import { authFetch } from '@/lib/authFetch';

/* ── Types ─────────────────────────────────────────────────────── */
export interface CanvasNode {
  id: number;
  projectId: string;
  title: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
  baseY: number;
  pathwayId: number | null;
  parentId: number | null;
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
  // Pivot Session B columns. The /canvas/nodes GET route returns these from
  // Prisma findMany (all fields by default). Used by the V3 operation-based
  // Auto-Analyze flow (Pivot Session D) to address topics across batches.
  stableId: string;
  stabilityScore: number;
}

export interface CanvasState {
  id: string;
  projectId: string;
  nextNodeId: number;
  nextPathwayId: number;
  viewX: number;
  viewY: number;
  zoom: number;
}

export interface Pathway {
  id: number;
  projectId: string;
}

export interface SisterLink {
  id: string;
  projectId: string;
  nodeA: number;
  nodeB: number;
}

/* ── Hook ──────────────────────────────────────────────────────── */
export function useCanvas(projectId: string) {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState | null>(null);
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [sisterLinks, setSisterLinks] = useState<SisterLink[]>([]);
  const [loading, setLoading] = useState(false);

  const base = `/api/projects/${projectId}/canvas`;

  /* ── Fetch everything ──────────────────────────────────────── */
  const fetchCanvas = useCallback(async () => {
    setLoading(true);
    try {
      const [nodesRes, stateRes] = await Promise.all([
        authFetch(`${base}/nodes`),
        authFetch(base),
      ]);
      const nodesData = await nodesRes.json();
      const stateData = await stateRes.json();
      setNodes(Array.isArray(nodesData) ? nodesData : []);
      setCanvasState(stateData.canvasState || null);
      setPathways(stateData.pathways || []);
      setSisterLinks(stateData.sisterLinks || []);
    } catch (err) {
      console.error('fetchCanvas error:', err);
    } finally {
      setLoading(false);
    }
  }, [base]);

  /* ── Add node ──────────────────────────────────────────────── */
  const addNode = useCallback(async (data: Partial<CanvasNode>) => {
    try {
      const res = await authFetch(`${base}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const node = await res.json();
      setNodes(prev => [...prev, node]);
      // Update local nextNodeId
      setCanvasState(prev => prev ? { ...prev, nextNodeId: node.id + 1 } : prev);
      return node as CanvasNode;
    } catch (err) {
      console.error('addNode error:', err);
      return null;
    }
  }, [base]);

  /* ── Update nodes (bulk) ───────────────────────────────────── */
  const updateNodes = useCallback(async (updates: Partial<CanvasNode>[]) => {
    try {
      await authFetch(`${base}/nodes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: updates }),
      });
      setNodes(prev =>
        prev.map(n => {
          const u = updates.find(u => u.id === n.id);
          return u ? { ...n, ...u } : n;
        })
      );
    } catch (err) {
      console.error('updateNodes error:', err);
    }
  }, [base]);

  /* ── Delete node ───────────────────────────────────────────── */
  const deleteNode = useCallback(async (nodeId: number) => {
    try {
      setNodes(prev => prev.filter(n => n.id !== nodeId));
      await authFetch(`${base}/nodes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nodeId }),
      });
    } catch (err) {
      console.error('deleteNode error:', err);
    }
  }, [base]);

  /* ── Update canvas state (viewport, zoom) ──────────────────── */
  const updateCanvasState = useCallback(async (data: Partial<CanvasState>) => {
    try {
      await authFetch(base, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setCanvasState(prev => prev ? { ...prev, ...data } : prev);
    } catch (err) {
      console.error('updateCanvasState error:', err);
    }
  }, [base]);

  return {
    nodes, setNodes, canvasState, pathways, sisterLinks, loading,
    fetchCanvas, addNode, updateNodes, deleteNode, updateCanvasState,
  };
}
