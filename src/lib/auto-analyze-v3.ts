/**
 * Auto-Analyze V3 wiring layer per docs/PIVOT_DESIGN.md §4 Pivot Session D.
 *
 * Bridges the deterministic operation-applier (src/lib/operation-applier.ts)
 * to the live canvas via /api/projects/:id/canvas/rebuild. Three concerns:
 *
 *   1. buildOperationsInputTsv — serialize current canvas to the 9-column
 *      TSV that the V3 prompts (docs/AUTO_ANALYZE_PROMPT_V3.md) expect.
 *   2. parseOperationsJsonl — extract and parse the model's
 *      "=== OPERATIONS === ... === END OPERATIONS ===" block into the
 *      camelCase Operation discriminated union the applier consumes.
 *   3. buildCanvasStateForApplier + materializeRebuildPayload — translate
 *      between live Prisma rows and the applier's pure-data shape, including
 *      integer-id assignment for newly created topics, parent and sister-link
 *      remapping, and pathway propagation.
 *
 * No I/O. AutoAnalyze.tsx owns the fetch/state side.
 */

import {
  applyOperations as _applyOperations,
  type CanvasState as ApplierCanvasState,
  type CanvasNode as ApplierCanvasNode,
  type SisterLink as ApplierSisterLink,
  type Operation,
  type Placement,
  type Relationship,
  type ApplyResult,
  type JustifyRestructure,
} from './operation-applier.ts';

export const applyOperations = _applyOperations;
export type { ApplyResult, Operation };

/**
 * Subset of the live CanvasNode row this module needs. Defined locally
 * (rather than imported from '@/hooks/useCanvas') so node --test can resolve
 * this module without a path-alias loader. Structural typing makes the shape
 * interchangeable with the full CanvasNode type at the call site.
 */
export interface CanvasNodeRow {
  id: number;
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
  stableId: string;
  stabilityScore: number;
}

export interface KeywordLite {
  id: string;
  keyword: string;
}

export interface SisterLinkRow {
  id: string;
  nodeA: number;
  nodeB: number;
}

// ============================================================
// 1. V3 input-TSV serializer
// ============================================================

/** TSV-safe: replace tab/newline with single spaces. */
function sanitize(s: string | null | undefined): string {
  return (s ?? '').replace(/[\t\r\n]+/g, ' ');
}

function stableIdSuffix(s: string): number {
  const m = /^t-(\d+)/.exec(s);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * 9-column TSV per AUTO_ANALYZE_PROMPT_V3.md "INPUT TABLE COLUMNS".
 * Header row first, then rows sorted by stableId integer suffix (deterministic,
 * roughly creation-order). Empty canvas → header row only.
 */
export function buildOperationsInputTsv(
  nodes: CanvasNodeRow[],
  sisterLinks: SisterLinkRow[],
  keywords: KeywordLite[],
): string {
  const header = [
    'Stable ID',
    'Title',
    'Description',
    'Parent Stable ID',
    'Relationship',
    'Conversion Path',
    'Stability Score',
    'Sister Nodes',
    'Keywords',
  ].join('\t');

  if (nodes.length === 0) return header;

  const idToStable = new Map<number, string>();
  for (const n of nodes) idToStable.set(n.id, n.stableId);

  const keywordById = new Map<string, KeywordLite>();
  for (const k of keywords) keywordById.set(k.id, k);

  const sisterByNodeId = new Map<number, string[]>();
  for (const sl of sisterLinks) {
    const a = idToStable.get(sl.nodeA);
    const b = idToStable.get(sl.nodeB);
    if (!a || !b) continue;
    if (!sisterByNodeId.has(sl.nodeA)) sisterByNodeId.set(sl.nodeA, []);
    if (!sisterByNodeId.has(sl.nodeB)) sisterByNodeId.set(sl.nodeB, []);
    sisterByNodeId.get(sl.nodeA)!.push(b);
    sisterByNodeId.get(sl.nodeB)!.push(a);
  }

  const sortedNodes = [...nodes].sort(
    (a, b) => stableIdSuffix(a.stableId) - stableIdSuffix(b.stableId),
  );

  const rows: string[] = [header];
  for (const n of sortedNodes) {
    const parentStable =
      n.parentId !== null ? (idToStable.get(n.parentId) ?? '') : '';
    const relationship = parentStable ? n.relationshipType : '';
    const stability = (n.stabilityScore ?? 0).toFixed(1);
    const sisters = (sisterByNodeId.get(n.id) ?? []).sort().join(', ');

    const kwParts: string[] = [];
    for (const kwId of n.linkedKwIds ?? []) {
      const kw = keywordById.get(kwId);
      if (!kw) continue;
      const placement = (n.kwPlacements ?? {})[kwId] === 's' ? 's' : 'p';
      kwParts.push(`${kwId}|${sanitize(kw.keyword)} [${placement}]`);
    }

    rows.push([
      n.stableId,
      sanitize(n.title),
      sanitize(n.description),
      parentStable,
      relationship,
      '', // Conversion Path — not stored separately in current schema
      stability,
      sisters,
      kwParts.join(', '),
    ].join('\t'));
  }

  return rows.join('\n');
}

// ============================================================
// 2. JSONL operation-list parser
// ============================================================

const OP_BLOCK_START = '=== OPERATIONS ===';
const OP_BLOCK_END = '=== END OPERATIONS ===';

export interface ParseResult {
  operations: Operation[];
  errors: string[];
}

/**
 * Extract the operations block, parse each non-blank line as JSON, translate
 * snake_case keys to the camelCase shapes the applier expects.
 *
 * Returns whatever it could parse plus a list of human-readable errors. The
 * caller decides whether to abort or proceed. An empty operations list with
 * no errors is a valid response (rare but legal — see V3 prompt).
 */
export function parseOperationsJsonl(rawResponse: string): ParseResult {
  const errors: string[] = [];
  const operations: Operation[] = [];

  const start = rawResponse.indexOf(OP_BLOCK_START);
  if (start === -1) {
    errors.push(`Missing "${OP_BLOCK_START}" delimiter`);
    return { operations, errors };
  }
  const after = start + OP_BLOCK_START.length;
  const end = rawResponse.indexOf(OP_BLOCK_END, after);
  if (end === -1) {
    errors.push(`Missing "${OP_BLOCK_END}" delimiter`);
    return { operations, errors };
  }
  const block = rawResponse.substring(after, end);

  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line);
    } catch (_e) {
      errors.push(
        `Line ${i + 1}: not valid JSON — ${line.substring(0, 80)}`,
      );
      continue;
    }
    if (!obj || typeof obj !== 'object') {
      errors.push(`Line ${i + 1}: not a JSON object`);
      continue;
    }
    const opType = obj.op as string | undefined;
    if (!opType) {
      errors.push(`Line ${i + 1}: missing "op" field`);
      continue;
    }
    const translated = translateOperation(obj, opType, i + 1, errors);
    if (translated) operations.push(translated);
  }

  return { operations, errors };
}

function translateOperation(
  obj: Record<string, unknown>,
  opType: string,
  lineNo: number,
  errors: string[],
): Operation | null {
  const justifyRestructure = obj.justify_restructure
    ? translateJustify(obj.justify_restructure as Record<string, unknown>)
    : undefined;

  const s = (k: string): string => obj[k] as string;
  const sn = (k: string): string | null =>
    obj[k] === null || obj[k] === undefined ? null : (obj[k] as string);

  switch (opType) {
    case 'ADD_TOPIC':
      return {
        type: 'ADD_TOPIC',
        id: s('id'),
        title: s('title'),
        description: (obj.description as string) ?? '',
        parent: sn('parent'),
        relationship: s('relationship') as Relationship,
      };
    case 'UPDATE_TOPIC_TITLE':
      return {
        type: 'UPDATE_TOPIC_TITLE',
        id: s('id'),
        to: s('to'),
        justifyRestructure,
      };
    case 'UPDATE_TOPIC_DESCRIPTION':
      return {
        type: 'UPDATE_TOPIC_DESCRIPTION',
        id: s('id'),
        to: s('to'),
      };
    case 'MOVE_TOPIC':
      return {
        type: 'MOVE_TOPIC',
        id: s('id'),
        newParent: sn('new_parent'),
        newRelationship: s('new_relationship') as Relationship,
        reason: s('reason'),
        justifyRestructure,
      };
    case 'MERGE_TOPICS':
      return {
        type: 'MERGE_TOPICS',
        sourceId: s('source_id'),
        targetId: s('target_id'),
        mergedTitle: s('merged_title'),
        mergedDescription: (obj.merged_description as string) ?? '',
        reason: s('reason'),
        justifyRestructure,
      };
    case 'SPLIT_TOPIC': {
      const into = (obj.into as Array<Record<string, unknown>>) ?? [];
      return {
        type: 'SPLIT_TOPIC',
        sourceId: s('source_id'),
        into: into.map(e => ({
          id: e.id as string,
          title: e.title as string,
          description: (e.description as string) ?? '',
          keywordIds: (e.keyword_ids as string[]) ?? [],
        })),
        reason: s('reason'),
        justifyRestructure,
      };
    }
    case 'DELETE_TOPIC': {
      const reassign = obj.reassign_keywords_to;
      if (typeof reassign !== 'string') {
        errors.push(
          `Line ${lineNo}: DELETE_TOPIC missing reassign_keywords_to (must be a topic ref or "ARCHIVE")`,
        );
        return null;
      }
      return {
        type: 'DELETE_TOPIC',
        id: s('id'),
        reason: s('reason'),
        reassignKeywordsTo: reassign as 'ARCHIVE' | string,
        justifyRestructure,
      };
    }
    case 'ADD_KEYWORD':
      return {
        type: 'ADD_KEYWORD',
        topic: s('topic'),
        keywordId: s('keyword_id'),
        placement: s('placement') as Placement,
      };
    case 'MOVE_KEYWORD':
      return {
        type: 'MOVE_KEYWORD',
        keywordId: s('keyword_id'),
        from: s('from'),
        to: s('to'),
        placement: s('placement') as Placement,
      };
    case 'REMOVE_KEYWORD':
      return {
        type: 'REMOVE_KEYWORD',
        keywordId: s('keyword_id'),
        from: s('from'),
      };
    case 'ARCHIVE_KEYWORD':
      return {
        type: 'ARCHIVE_KEYWORD',
        keywordId: s('keyword_id'),
        reason: s('reason'),
      };
    case 'ADD_SISTER_LINK':
      return {
        type: 'ADD_SISTER_LINK',
        topicA: s('topic_a'),
        topicB: s('topic_b'),
      };
    case 'REMOVE_SISTER_LINK':
      return {
        type: 'REMOVE_SISTER_LINK',
        topicA: s('topic_a'),
        topicB: s('topic_b'),
      };
    default:
      errors.push(`Line ${lineNo}: unknown op "${opType}"`);
      return null;
  }
}

function translateJustify(obj: Record<string, unknown>): JustifyRestructure {
  return {
    topicAffected: (obj.topic_affected as string) ?? '',
    priorState: (obj.prior_state as string) ?? '',
    newState: (obj.new_state as string) ?? '',
    score: typeof obj.score === 'number' ? String(obj.score) : ((obj.score as string) ?? ''),
    reason: (obj.reason as string) ?? '',
    expectedQualityImprovement:
      (obj.expected_quality_improvement as string) ?? '',
  };
}

// ============================================================
// 3. CanvasState builder
// ============================================================

/**
 * Pre-batch: build the applier's CanvasState from live canvas rows.
 * nextStableIdCounter = canvasState.nextNodeId so the applier issues
 * "t-N" with N matching the integer id we will persist.
 */
export function buildCanvasStateForApplier(
  nodes: CanvasNodeRow[],
  sisterLinks: SisterLinkRow[],
  nextNodeId: number,
): ApplierCanvasState {
  const idToStable = new Map<number, string>();
  for (const n of nodes) idToStable.set(n.id, n.stableId);

  const applierNodes: ApplierCanvasNode[] = nodes.map(n => {
    const placements: Record<string, Placement> = {};
    for (const kwId of n.linkedKwIds ?? []) {
      const raw = (n.kwPlacements ?? {})[kwId];
      placements[kwId] = raw === 's' ? 'secondary' : 'primary';
    }
    return {
      stableId: n.stableId,
      title: n.title,
      description: n.description,
      parentStableId:
        n.parentId !== null ? (idToStable.get(n.parentId) ?? null) : null,
      relationship:
        n.parentId === null
          ? null
          : n.relationshipType === 'linear' || n.relationshipType === 'nested'
          ? (n.relationshipType as Relationship)
          : 'nested',
      keywordPlacements: placements,
      stabilityScore: n.stabilityScore ?? 0,
    };
  });

  const applierLinks: ApplierSisterLink[] = sisterLinks
    .map(sl => {
      const a = idToStable.get(sl.nodeA);
      const b = idToStable.get(sl.nodeB);
      if (!a || !b || a === b) return null;
      const [first, second] = a < b ? [a, b] : [b, a];
      return { topicAStableId: first, topicBStableId: second };
    })
    .filter((x): x is ApplierSisterLink => x !== null);

  return {
    nodes: applierNodes,
    sisterLinks: applierLinks,
    nextStableIdCounter: nextNodeId,
  };
}

// ============================================================
// 4. Rebuild-payload materializer
// ============================================================

export interface RebuildPayload {
  nodes: Array<Record<string, unknown>>;
  pathways: Array<{ id: number }>;
  sisterLinks: Array<{ nodeA: number; nodeB: number }>;
  canvasState: { nextNodeId: number; nextPathwayId: number };
  deleteNodeIds: number[];
  deletePathwayIds: number[];
  deleteSisterLinkIds: string[];
}

/**
 * Translate applier output back to a /canvas/rebuild POST body.
 *
 * Integer ids: existing nodes keep their id; new nodes get id = the integer
 * suffix of their applier-issued "t-N" stableId. Because we seeded
 * nextStableIdCounter from canvasState.nextNodeId, those new integer ids
 * cannot collide with any existing CanvasNode.id.
 *
 * Pathways: existing nodes keep their pathway. New root-level topics get
 * a fresh pathway. Nested topics inherit their root's pathway.
 *
 * Note on x/y/h: new nodes get default-positioned (0,0); the caller is
 * expected to runLayoutPass over the result before posting, so the rebuild
 * route receives final positions.
 */
export function materializeRebuildPayload(args: {
  originalNodes: CanvasNodeRow[];
  originalSisterLinks: SisterLinkRow[];
  originalPathwayIds: number[];
  applierNewState: ApplierCanvasState;
  nextPathwayId: number;
}): RebuildPayload {
  const {
    originalNodes,
    originalSisterLinks,
    originalPathwayIds,
    applierNewState,
    nextPathwayId,
  } = args;

  const stableToOldId = new Map<string, number>();
  const oldNodeByStable = new Map<string, CanvasNodeRow>();
  for (const n of originalNodes) {
    stableToOldId.set(n.stableId, n.id);
    oldNodeByStable.set(n.stableId, n);
  }

  let highestId = 0;
  for (const n of originalNodes) if (n.id > highestId) highestId = n.id;

  const stableToNewId = new Map<string, number>();
  for (const n of applierNewState.nodes) {
    const existingId = stableToOldId.get(n.stableId);
    if (existingId !== undefined) {
      stableToNewId.set(n.stableId, existingId);
      continue;
    }
    const m = /^t-(\d+)$/.exec(n.stableId);
    const id = m ? parseInt(m[1], 10) : ++highestId;
    stableToNewId.set(n.stableId, id);
    if (id > highestId) highestId = id;
  }

  const stableById = new Map<string, ApplierCanvasNode>();
  for (const n of applierNewState.nodes) stableById.set(n.stableId, n);

  function findRootStable(start: string): string {
    let cur = start;
    let safety = 0;
    while (safety++ < 1000) {
      const node = stableById.get(cur);
      if (!node || node.parentStableId === null) return cur;
      cur = node.parentStableId;
    }
    return start;
  }

  const newPathwaysByRootStable = new Map<string, number>();
  const newPathwayIds: number[] = [];
  let nextPw = nextPathwayId;

  function pathwayForNode(stable: string): number | null {
    const root = findRootStable(stable);
    const oldRoot = oldNodeByStable.get(root);
    if (oldRoot && oldRoot.pathwayId) return oldRoot.pathwayId;
    if (newPathwaysByRootStable.has(root)) {
      return newPathwaysByRootStable.get(root)!;
    }
    const pwId = nextPw++;
    newPathwaysByRootStable.set(root, pwId);
    newPathwayIds.push(pwId);
    return pwId;
  }

  const rebuildNodes: Array<Record<string, unknown>> = [];
  for (const n of applierNewState.nodes) {
    const id = stableToNewId.get(n.stableId)!;
    const parentId =
      n.parentStableId !== null
        ? (stableToNewId.get(n.parentStableId) ?? null)
        : null;
    const old = oldNodeByStable.get(n.stableId);

    const linkedKwIds = Object.keys(n.keywordPlacements);
    const kwPlacements: Record<string, string> = {};
    for (const [kwId, placement] of Object.entries(n.keywordPlacements)) {
      kwPlacements[kwId] = placement === 'secondary' ? 's' : 'p';
    }

    rebuildNodes.push({
      id,
      title: n.title,
      description: n.description,
      x: old?.x ?? 0,
      y: old?.y ?? 0,
      w: old?.w ?? 220,
      h: old?.h ?? 160,
      baseY: old?.baseY ?? old?.y ?? 0,
      parentId,
      pathwayId: pathwayForNode(n.stableId),
      relationshipType: n.relationship ?? '',
      linkedKwIds,
      kwPlacements,
      altTitles: old?.altTitles ?? [],
      collapsedLinear: old?.collapsedLinear ?? false,
      collapsedNested: old?.collapsedNested ?? false,
      narrativeBridge: old?.narrativeBridge ?? '',
      userMinH: old?.userMinH ?? null,
      connCP: old?.connCP ?? null,
      connOutOff: old?.connOutOff ?? null,
      connInOff: old?.connInOff ?? null,
      sortOrder: rebuildNodes.length,
    });
  }

  const survivingStableSet = new Set(
    applierNewState.nodes.map(n => n.stableId),
  );
  const survivingIds = new Set(rebuildNodes.map(n => n.id as number));

  const pairKey = (a: number, b: number) =>
    [a, b].sort((x, y) => x - y).join('-');
  const oldSisterPairKeys = new Set(
    originalSisterLinks.map(sl => pairKey(sl.nodeA, sl.nodeB)),
  );

  const newSisterLinks: Array<{ nodeA: number; nodeB: number }> = [];
  const newSisterPairKeys = new Set<string>();
  for (const link of applierNewState.sisterLinks) {
    if (
      !survivingStableSet.has(link.topicAStableId) ||
      !survivingStableSet.has(link.topicBStableId)
    ) {
      continue;
    }
    const aId = stableToNewId.get(link.topicAStableId);
    const bId = stableToNewId.get(link.topicBStableId);
    if (aId === undefined || bId === undefined) continue;
    const k = pairKey(aId, bId);
    newSisterPairKeys.add(k);
    if (oldSisterPairKeys.has(k)) continue;
    newSisterLinks.push({ nodeA: aId, nodeB: bId });
  }

  const deleteSisterLinkIds: string[] = [];
  for (const sl of originalSisterLinks) {
    if (!survivingIds.has(sl.nodeA) || !survivingIds.has(sl.nodeB)) {
      deleteSisterLinkIds.push(sl.id);
      continue;
    }
    if (!newSisterPairKeys.has(pairKey(sl.nodeA, sl.nodeB))) {
      deleteSisterLinkIds.push(sl.id);
    }
  }

  const deleteNodeIds: number[] = [];
  for (const n of originalNodes) {
    if (!survivingIds.has(n.id)) deleteNodeIds.push(n.id);
  }

  const keptPathwayIds = new Set<number>();
  for (const n of rebuildNodes) {
    const pw = n.pathwayId as number | null | undefined;
    if (pw !== null && pw !== undefined) keptPathwayIds.add(pw);
  }
  const deletePathwayIds: number[] = [];
  for (const pwId of originalPathwayIds) {
    if (!keptPathwayIds.has(pwId)) deletePathwayIds.push(pwId);
  }

  return {
    nodes: rebuildNodes,
    pathways: newPathwayIds.map(id => ({ id })),
    sisterLinks: newSisterLinks,
    canvasState: { nextNodeId: highestId + 1, nextPathwayId: nextPw },
    deleteNodeIds,
    deletePathwayIds,
    deleteSisterLinkIds,
  };
}
