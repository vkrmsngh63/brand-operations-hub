// Canvas layout engine — React port of the HTML tool's four-job layout
// engine (cvsNodeH, cvsPushDownOverlaps, cvsAutoLayoutChild,
// cvsSeparatePathways) from keyword_sorting_tool_v18.html lines 11965,
// 14152, 14321, 14251.
//
// Why these are pure functions (not hooks): both AutoAnalyze (after
// every batch apply) and CanvasPanel (drag/resize/link-form) need to
// run them, on different node arrays at different times. Pure functions
// avoid duplicating logic and make testing trivial.
//
// Conventions:
// - All four functions mutate the passed `nodes` array IN PLACE for
//   speed; callers persist via their existing update path.
// - `collapsedSet` is the runtime set of currently-collapsed node ids
//   (CanvasPanel keeps this in React state). Pass an empty Set to
//   ignore collapse (e.g. AutoAnalyze rebuild — collapse state isn't
//   meaningful mid-rebuild).
// - Constants are mirrored from the HTML tool. NODE_W stays 220
//   (React's existing default) instead of HTML's 240 to avoid
//   regressing existing node widths.

export interface LayoutNode {
  id: number;
  title: string;
  description: string;
  altTitles: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  baseY?: number;
  parentId: number | null;
  pathwayId: number | null;
  relationshipType: string;
  linkedKwIds: string[];
  userMinH: number | null;
  // CanvasPanel uses `linkedKwIds.length` for the kw section. Other fields
  // (kwPlacements, sisterLinks, etc.) don't affect height.
}

// ── Layout constants ─────────────────────────────────────────────
export const NODE_W = 220;          // matches React CanvasPanel.tsx default
export const NODE_MIN_H = 46;        // HTML CVS_NODE_MIN_H
export const NODE_PAD = 9;           // HTML CVS_NODE_PAD
export const TITLE_FS = 12;
export const TITLE_LH = 16;
export const DESC_FS = 10;
export const DESC_LH = 14;
export const ALT_FS = 10;
export const ALT_LH = 13;
export const PATHWAY_PAD = 48;
export const LINEAR_GAP_Y = 50;
export const NESTED_GAP_Y = 50;
export const NESTED_INDENT = 30;     // matches React CanvasPanel.tsx (HTML uses 15)
export const PATHWAY_GAP = 30;
export const OVERLAP_GAP = 8;

// Offscreen canvas for text-width measurement. Lazy-init; SSR-safe.
let _measCtx: CanvasRenderingContext2D | null = null;
function getMeasCtx(): CanvasRenderingContext2D | null {
  if (_measCtx) return _measCtx;
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  _measCtx = c.getContext('2d');
  return _measCtx;
}

// ── Text wrapping ────────────────────────────────────────────────
// Word-aware line wrapping using canvas measureText. Returns the array
// of wrapped lines for the given text at the given pixel width.
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  if (!text) return [];
  const words = String(text).split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// ── 1. calcNodeHeight ────────────────────────────────────────────
// Content-driven node-height calculation. Replaces React's hardcoded
// NODE_H = 160. Recompute on: content edit, resize end, canvas
// rebuild apply. SSR returns the constant fallback so server renders
// don't break.
export function calcNodeHeight(node: LayoutNode): number {
  const ctx = getMeasCtx();
  if (!ctx) return Math.max(node.userMinH || NODE_MIN_H, 160);

  const iW = (node.w || NODE_W) - NODE_PAD * 2;
  let h = NODE_PAD + 3;

  if (node.title) {
    ctx.font = 'bold ' + TITLE_FS + 'px IBM Plex Sans, sans-serif';
    h += wrapText(ctx, node.title, iW).length * TITLE_LH;
  }

  if (node.altTitles && node.altTitles.length) {
    h += 2;
    ctx.font = ALT_FS + 'px IBM Plex Sans, sans-serif';
    for (const at of node.altTitles) {
      if (at) h += wrapText(ctx, at, iW).length * ALT_LH;
    }
  }

  if (node.description) {
    h += (node.title || (node.altTitles && node.altTitles.length)) ? 5 : 0;
    ctx.font = DESC_FS + 'px IBM Plex Sans, sans-serif';
    h += wrapText(ctx, node.description, iW).length * DESC_LH;
  }

  h += NODE_PAD;

  // Keyword count badge (matches React's kw preview row)
  if (node.linkedKwIds && node.linkedKwIds.length) h += 16;

  return Math.max(h, node.userMinH || NODE_MIN_H);
}

// ── Helpers for layout pass ──────────────────────────────────────
function ancestorCollapsed(nodes: LayoutNode[], nodeId: number, collapsed: Set<number>): boolean {
  if (collapsed.size === 0) return false;
  let cur = nodes.find(n => n.id === nodeId);
  while (cur && cur.parentId !== null) {
    if (collapsed.has(cur.parentId)) return true;
    cur = nodes.find(n => n.id === cur!.parentId);
  }
  return false;
}

function subtreeBottom(
  nodes: LayoutNode[],
  childMap: Map<number, LayoutNode[]>,
  nodeId: number,
  collapsed: Set<number>
): number {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return -Infinity;
  let bottom = node.y + node.h;
  const children = childMap.get(node.id) || [];
  if (children.length === 0) return bottom;
  for (const c of children) {
    if (collapsed.has(c.id) || ancestorCollapsed(nodes, c.id, collapsed)) continue;
    bottom = Math.max(bottom, subtreeBottom(nodes, childMap, c.id, collapsed));
  }
  return bottom;
}

function moveSubtree(
  childMap: Map<number, LayoutNode[]>,
  nodeId: number,
  dx: number,
  dy: number
): void {
  // Iterative to avoid stack overflow on deep trees.
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop()!;
    const children = childMap.get(id);
    if (!children) continue;
    for (const c of children) {
      c.x += dx;
      c.y += dy;
      c.baseY = c.y;
      stack.push(c.id);
    }
  }
}

function buildChildMap(nodes: LayoutNode[]): Map<number, LayoutNode[]> {
  const map = new Map<number, LayoutNode[]>();
  for (const n of nodes) {
    if (n.parentId === null) continue;
    if (!map.has(n.parentId)) map.set(n.parentId, []);
    map.get(n.parentId)!.push(n);
  }
  return map;
}

// ── 2. runLayoutPass ─────────────────────────────────────────────
// Holistic 4-step push-down pass. Called after every Auto-Analyze
// batch apply (Q1 answer) plus every structural change in the
// CanvasPanel (parent-child link form, etc.). Mutates nodes in place.
export function runLayoutPass(
  nodes: LayoutNode[],
  pathways: { id: number }[],
  collapsed: Set<number> = new Set()
): void {
  const childMap = buildChildMap(nodes);

  // Step 1: Reset root nodes (no parent) to baseY.
  for (const n of nodes) {
    if (n.baseY == null) n.baseY = n.y;
    if (n.parentId === null) n.y = n.baseY;
  }

  // Step 2: Tree-walk from roots; position each connected child
  // type-aware (linear vs nested).
  const positioned = new Set<number>();

  function layoutChildren(parent: LayoutNode): void {
    const children = childMap.get(parent.id);
    if (!children || children.length === 0) return;

    // Bucket children by relationship type. Skip collapsed + already-positioned.
    const nested: LayoutNode[] = [];
    const linear: LayoutNode[] = [];
    for (const c of children) {
      if (ancestorCollapsed(nodes, c.id, collapsed)) continue;
      if (positioned.has(c.id)) continue;
      if (c.relationshipType === 'nested') nested.push(c);
      else linear.push(c);
    }

    // Sort each bucket by baseY to preserve user-chosen ordering.
    nested.sort((a, b) => (a.baseY ?? a.y) - (b.baseY ?? b.y));
    linear.sort((a, b) => (a.baseY ?? a.y) - (b.baseY ?? b.y));

    // Place nested children first (below parent + indented).
    let nextY = parent.y + parent.h + NESTED_GAP_Y;
    for (const child of nested) {
      positioned.add(child.id);
      child.x = parent.x + parent.w / 2 + NESTED_INDENT;
      child.y = nextY;
      child.baseY = child.y;
      layoutChildren(child);
      nextY = subtreeBottom(nodes, childMap, child.id, collapsed) + NESTED_GAP_Y;
    }

    // Place linear children below parent + all nested content.
    let linY = parent.y + parent.h;
    if (nested.length > 0) {
      for (const nc of nested) {
        linY = Math.max(linY, subtreeBottom(nodes, childMap, nc.id, collapsed));
      }
    }
    linY += LINEAR_GAP_Y;

    for (const child of linear) {
      positioned.add(child.id);
      child.x = parent.x;
      child.y = linY;
      child.baseY = child.y;
      layoutChildren(child);
      linY = subtreeBottom(nodes, childMap, child.id, collapsed) + LINEAR_GAP_Y;
    }
  }

  const roots = nodes
    .filter(n => n.parentId === null && !ancestorCollapsed(nodes, n.id, collapsed))
    .sort((a, b) => a.y - b.y);
  for (const root of roots) {
    if (!positioned.has(root.id)) {
      positioned.add(root.id);
      layoutChildren(root);
    }
  }

  // Step 3: Resolve overlap between separate trees / floating nodes.
  // Up to 60 passes; bail early when a sweep makes no moves.
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    const sorted = nodes
      .filter(n => !ancestorCollapsed(nodes, n.id, collapsed))
      .sort((a, b) => a.y - b.y);
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i];
      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j];
        // Skip if both are positioned by the tree-walk AND share a pathway —
        // they're already correctly arranged relative to each other.
        if (positioned.has(a.id) && positioned.has(b.id) && a.pathwayId === b.pathwayId) continue;
        const hOverlap = a.x < b.x + b.w && a.x + a.w > b.x;
        if (!hOverlap) continue;
        const needed = a.y + a.h + OVERLAP_GAP;
        if (b.y < needed) {
          b.y = needed;
          b.baseY = b.y;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  // Step 4: Separate overlapping pathway borders horizontally.
  separatePathways(nodes, pathways, collapsed);
}

// ── 3. autoLayoutChild ───────────────────────────────────────────
// Type-aware auto-positioning when a parent-child link is formed.
// Linear: child's left aligns with parent's left, placed below all
// peer descendant subtrees.
// Nested: child's left aligns with parent-center + indent, placed
// below nested siblings only.
export function autoLayoutChild(
  childNode: LayoutNode,
  parentNode: LayoutNode,
  relType: 'linear' | 'nested',
  allNodes: LayoutNode[],
  collapsed: Set<number> = new Set()
): void {
  const childMap = buildChildMap(allNodes);
  let targetX: number;
  let targetY: number;
  const parentChildren = childMap.get(parentNode.id) || [];

  if (relType === 'linear') {
    targetX = parentNode.x;
    let lowestY = parentNode.y + parentNode.h;
    for (const sibling of parentChildren) {
      if (sibling.id === childNode.id) continue;
      const sb = subtreeBottom(allNodes, childMap, sibling.id, collapsed);
      if (sb > lowestY) lowestY = sb;
    }
    targetY = lowestY + LINEAR_GAP_Y;
  } else {
    targetX = parentNode.x + parentNode.w / 2 + NESTED_INDENT;
    let lowestY = parentNode.y + parentNode.h;
    for (const sibling of parentChildren) {
      if (sibling.id === childNode.id) continue;
      if (sibling.relationshipType !== 'nested') continue;
      const sb = subtreeBottom(allNodes, childMap, sibling.id, collapsed);
      if (sb > lowestY) lowestY = sb;
    }
    targetY = lowestY + NESTED_GAP_Y;
  }

  const dx = targetX - childNode.x;
  const dy = targetY - childNode.y;
  childNode.x = targetX;
  childNode.y = targetY;
  childNode.baseY = childNode.y;
  // Move the child's whole subtree by the same delta.
  moveSubtree(childMap, childNode.id, dx, dy);
}

// ── 4. separatePathways ──────────────────────────────────────────
// Push apart pathways whose bounding boxes overlap horizontally.
// Each pathway's bounds are min-rect of its visible nodes + padding.
export function separatePathways(
  nodes: LayoutNode[],
  pathways: { id: number }[],
  collapsed: Set<number> = new Set()
): void {
  if (!pathways || pathways.length < 2) return;

  // Compute bounds for each pathway with at least one visible node.
  const bounds: { id: number; x: number; y: number; w: number; h: number }[] = [];
  for (const p of pathways) {
    const pnodes = nodes.filter(n => n.pathwayId === p.id && !ancestorCollapsed(nodes, n.id, collapsed));
    if (!pnodes.length) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of pnodes) {
      x0 = Math.min(x0, n.x);
      y0 = Math.min(y0, n.y);
      x1 = Math.max(x1, n.x + n.w);
      y1 = Math.max(y1, n.y + n.h);
    }
    bounds.push({
      id: p.id,
      x: x0 - PATHWAY_PAD,
      y: y0 - PATHWAY_PAD,
      w: (x1 - x0) + PATHWAY_PAD * 2,
      h: (y1 - y0) + PATHWAY_PAD * 2,
    });
  }
  if (bounds.length < 2) return;
  bounds.sort((a, b) => a.x - b.x);

  // Push each later pathway right if it overlaps an earlier one.
  for (let i = 0; i < bounds.length; i++) {
    for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i];
      const b = bounds[j];
      const hOverlap = a.x < b.x + b.w && a.x + a.w > b.x;
      const vOverlap = a.y < b.y + b.h && a.y + a.h > b.y;
      if (!hOverlap || !vOverlap) continue;
      const dx = (a.x + a.w + PATHWAY_GAP) - b.x;
      if (dx > 0) {
        for (const n of nodes) {
          if (n.pathwayId === b.id) n.x += dx;
        }
        b.x += dx;
      }
    }
  }
}
