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
  id: string;
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
  // Nullable through Scale Session B Step 1; tightens to string in Step 3
  // once the backfill completes. The wiring layer treats null/undefined as
  // an empty string downstream.
  intentFingerprint?: string | null;
}

export interface KeywordLite {
  id: string;
  keyword: string;
  /**
   * Search volume. Optional for backward compat with Session-B-and-earlier callers
   * that omit it. Accepts `number` or `string` — the canvas-side `Keyword` shape
   * (`src/hooks/useKeywords.ts`) carries volume as a string from the import path
   * and the Prisma schema stores it as Int; the Tier-1 row formatter coerces.
   * Missing or non-numeric volumes sort as 0 (Cluster 1 Q3 lock tiebreaker).
   */
  volume?: number | string;
}

export interface SisterLinkRow {
  id: string;
  nodeA: string;
  nodeB: string;
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
 * Serialization-mode dispatch for `buildOperationsInputTsv`. Default is `'full'`,
 * which is byte-identical to the V3 production output. `'tiered'` emits the
 * Scale-Session-C three-tier serialization (per
 * docs/INPUT_CONTEXT_SCALING_DESIGN.md §1.1) and requires `tierContext`.
 *
 * Until Session D wires the AutoAnalyze.tsx caller to pass `'tiered'`, the
 * production code path stays on `'full'` and the new code is exercised only
 * by unit tests.
 */
export type SerializationMode = 'full' | 'tiered';

export interface BuildOperationsInputTsvOptions {
  /** Default `'full'` keeps V3 production output byte-unchanged. */
  serializationMode?: SerializationMode;
  /** Required (and only consulted) when `serializationMode === 'tiered'`. */
  tierContext?: TierContext;
}

/**
 * 9-column TSV per AUTO_ANALYZE_PROMPT_V3.md "INPUT TABLE COLUMNS".
 * Header row first, then rows sorted by stableId integer suffix (deterministic,
 * roughly creation-order). Empty canvas → header row only.
 *
 * Optional 4th `options` arg (Scale Session C, default-OFF feature flag): pass
 * `{ serializationMode: 'tiered', tierContext }` to switch to the three-tier
 * serialization. The default `'full'` mode is byte-identical to the
 * pre-Session-C output — verified by an integration test in
 * `auto-analyze-v3.test.ts`.
 */
export function buildOperationsInputTsv(
  nodes: CanvasNodeRow[],
  sisterLinks: SisterLinkRow[],
  keywords: KeywordLite[],
  options?: BuildOperationsInputTsvOptions,
): string {
  const mode = options?.serializationMode ?? 'full';
  if (mode === 'tiered') {
    if (!options?.tierContext) {
      throw new Error(
        'buildOperationsInputTsv: serializationMode="tiered" requires tierContext',
      );
    }
    return buildTieredTsv(nodes, sisterLinks, keywords, options.tierContext);
  }
  return buildFullTsv(nodes, sisterLinks, keywords);
}

function buildFullTsv(
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

  const idToStable = new Map<string, string>();
  for (const n of nodes) idToStable.set(n.id, n.stableId);

  const keywordById = new Map<string, KeywordLite>();
  for (const k of keywords) keywordById.set(k.id, k);

  const sisterByNodeId = new Map<string, string[]>();
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
  // Optional string: returns undefined if the key is absent / null. Validation
  // (non-empty when present) lives in the applier per Scale Session B.
  const optStr = (k: string): string | undefined => {
    const v = obj[k];
    if (v === undefined || v === null) return undefined;
    return v as string;
  };

  switch (opType) {
    case 'ADD_TOPIC': {
      // For root topics (parent === null), relationship is ignored by the
      // applier — pass through whatever was emitted (or null if absent).
      const rawRel = obj.relationship;
      const relationship: Relationship | null =
        rawRel === 'linear' || rawRel === 'nested' ? rawRel : null;
      return {
        type: 'ADD_TOPIC',
        id: s('id'),
        title: s('title'),
        description: (obj.description as string) ?? '',
        parent: sn('parent'),
        relationship,
        intentFingerprint: optStr('intent_fingerprint'),
      };
    }
    case 'UPDATE_TOPIC_TITLE':
      return {
        type: 'UPDATE_TOPIC_TITLE',
        id: s('id'),
        to: s('to'),
        justifyRestructure,
        intentFingerprint: optStr('intent_fingerprint'),
      };
    case 'UPDATE_TOPIC_DESCRIPTION':
      return {
        type: 'UPDATE_TOPIC_DESCRIPTION',
        id: s('id'),
        to: s('to'),
        intentFingerprint: optStr('intent_fingerprint'),
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
        mergedIntentFingerprint: optStr('merged_intent_fingerprint'),
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
          intentFingerprint:
            e.intent_fingerprint === undefined || e.intent_fingerprint === null
              ? undefined
              : (e.intent_fingerprint as string),
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
 * nextStableIdCounter is the per-project counter that the applier uses to
 * issue "t-N" stable ids for newly-created topics.
 */
export function buildCanvasStateForApplier(
  nodes: CanvasNodeRow[],
  sisterLinks: SisterLinkRow[],
  nextStableIdN: number,
): ApplierCanvasState {
  const idToStable = new Map<string, string>();
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
      intentFingerprint: n.intentFingerprint ?? '',
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
    nextStableIdCounter: nextStableIdN,
  };
}

// ============================================================
// 4. Rebuild-payload materializer
// ============================================================

export interface RebuildPayload {
  nodes: Array<Record<string, unknown>>;
  pathways: Array<{ id: string }>;
  sisterLinks: Array<{ nodeA: string; nodeB: string }>;
  canvasState: { nextStableIdN: number };
  deleteNodeIds: string[];
  deletePathwayIds: string[];
  deleteSisterLinkIds: string[];
}

/**
 * Translate applier output back to a /canvas/rebuild POST body.
 *
 * Existing nodes keep their UUID; new nodes get a fresh UUID generated here
 * so we can wire parent/sister/pathway references in a single payload.
 *
 * Pathways: existing nodes keep their pathway UUID; new root-level topics get
 * a fresh pathway UUID; nested topics inherit their root's pathway.
 *
 * Note on x/y/h: new nodes get default-positioned (0,0); the caller is
 * expected to runLayoutPass over the result before posting.
 */
export function materializeRebuildPayload(args: {
  originalNodes: CanvasNodeRow[];
  originalSisterLinks: SisterLinkRow[];
  originalPathwayIds: string[];
  applierNewState: ApplierCanvasState;
  /** Optional UUID generator override (tests inject a deterministic one). */
  uuid?: () => string;
}): RebuildPayload {
  const {
    originalNodes,
    originalSisterLinks,
    originalPathwayIds,
    applierNewState,
  } = args;
  const uuid = args.uuid ?? defaultUuid;

  const stableToOldId = new Map<string, string>();
  const oldNodeByStable = new Map<string, CanvasNodeRow>();
  for (const n of originalNodes) {
    stableToOldId.set(n.stableId, n.id);
    oldNodeByStable.set(n.stableId, n);
  }

  const stableToNewId = new Map<string, string>();
  for (const n of applierNewState.nodes) {
    const existingId = stableToOldId.get(n.stableId);
    stableToNewId.set(n.stableId, existingId ?? uuid());
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

  const newPathwaysByRootStable = new Map<string, string>();
  const newPathwayIds: string[] = [];

  function pathwayForNode(stable: string): string | null {
    const root = findRootStable(stable);
    const oldRoot = oldNodeByStable.get(root);
    if (oldRoot && oldRoot.pathwayId) return oldRoot.pathwayId;
    if (newPathwaysByRootStable.has(root)) {
      return newPathwaysByRootStable.get(root)!;
    }
    const pwId = uuid();
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
      stableId: n.stableId,
      stabilityScore: n.stabilityScore,
      // Only include intentFingerprint in the rebuild payload when non-empty.
      // The /canvas/rebuild route's G3 guard (per DEFENSE_IN_DEPTH §5.4 + Scale
      // Session B) rejects '' as a degenerate fingerprint write. New topics get
      // '' from the route's create-branch default; existing topics' real
      // fingerprints (post-backfill) still get carried; transient empty values
      // are dropped here so they never trigger G3 mid-batch.
      ...(n.intentFingerprint && n.intentFingerprint.length > 0
        ? { intentFingerprint: n.intentFingerprint }
        : {}),
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
  const survivingIds = new Set(rebuildNodes.map(n => n.id as string));

  const pairKey = (a: string, b: string) =>
    [a, b].sort().join('|');
  const oldSisterPairKeys = new Set(
    originalSisterLinks.map(sl => pairKey(sl.nodeA, sl.nodeB)),
  );

  const newSisterLinks: Array<{ nodeA: string; nodeB: string }> = [];
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

  const deleteNodeIds: string[] = [];
  for (const n of originalNodes) {
    if (!survivingIds.has(n.id)) deleteNodeIds.push(n.id);
  }

  const keptPathwayIds = new Set<string>();
  for (const n of rebuildNodes) {
    const pw = n.pathwayId as string | null | undefined;
    if (pw !== null && pw !== undefined) keptPathwayIds.add(pw);
  }
  const deletePathwayIds: string[] = [];
  for (const pwId of originalPathwayIds) {
    if (!keptPathwayIds.has(pwId)) deletePathwayIds.push(pwId);
  }

  return {
    nodes: rebuildNodes,
    pathways: newPathwayIds.map(id => ({ id })),
    sisterLinks: newSisterLinks,
    canvasState: { nextStableIdN: applierNewState.nextStableIdCounter },
    deleteNodeIds,
    deletePathwayIds,
    deleteSisterLinkIds,
  };
}

// ============================================================
// 5. Scale Session C — Tiered Canvas Serialization
//    (per docs/INPUT_CONTEXT_SCALING_DESIGN.md §1–§3)
//
// Pure-data helpers. No DB, no I/O, no React. Behind a feature flag — until
// Session D flips AutoAnalyze.tsx to pass `serializationMode: 'tiered'`,
// production V3 stays on `'full'` and these exports are exercised only by
// unit tests.
// ============================================================

/**
 * Three levels of detail at which a topic is serialized into the prompt input.
 * Tier 0 = full row (today's columns). Tier 1 = summary (id + title + parent +
 * stability + intent fingerprint + keyword summary). Tier 2 = skeleton
 * (id + title + parent only). See INPUT_CONTEXT_SCALING_DESIGN.md §1.1.
 */
export type Tier = 0 | 1 | 2;

/**
 * Stability ≥ this value qualifies a topic for compression to Tier 1 (or Tier
 * 2 if also deeply stale + not in batch subtree). Mirrors the
 * JUSTIFY_RESTRUCTURE gate from MODEL_QUALITY_SCORING.md so a single threshold
 * spans both mechanisms (Cluster 2 Q7 lock).
 */
export const STABILITY_TIER_THRESHOLD = 7.0;

/** Default recency window N (Cluster 2 Q6 lock). Configurable via TierContext. */
export const DEFAULT_RECENCY_WINDOW = 5;

/** Tier 2 deep-stale threshold (Cluster 2 Q8 lock — twice the regular window). */
export const TIER_2_DEEP_STALE_THRESHOLD = 10;

// ---- Stemmer / tokenizer -----------------------------------------------------

const STOPWORDS = new Set<string>([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'have', 'how', 'i', 'in', 'is', 'it', 'its', 'me', 'my',
  'of', 'on', 'or', 'our', 'so', 'that', 'the', 'their', 'them',
  'they', 'this', 'to', 'too', 'us', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'who', 'why', 'will', 'with', 'you', 'your',
]);

const MIN_TOKEN_LENGTH = 3;

/**
 * Lowercase → split on non-alphanumeric → drop stopwords + short tokens →
 * apply a small suffix-stripper. Returns a Set of stems for set-intersection
 * scoring. Pure; safe for hot paths.
 *
 * The suffix stripper handles the most-common English inflections (-ing /
 * -ed / -ly / -es / -s) with length guards and a few preservation rules
 * (-ss / -is / -us survive; "bursitis" → "bursitis", not "bursiti"). It is
 * intentionally simpler than full Porter — the heuristic threshold of "≥2
 * stems shared" is forgiving enough that perfect stemming isn't required.
 * Swap-in for a richer stemmer is a one-function change if validation later
 * shows poor recall (autonomous detail per Rule 14d).
 */
export function stemTokens(text: string): Set<string> {
  const out = new Set<string>();
  if (!text) return out;
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const t of tokens) {
    if (t.length < MIN_TOKEN_LENGTH) continue;
    if (STOPWORDS.has(t)) continue;
    out.add(stemSuffix(t));
  }
  return out;
}

function stemSuffix(t: string): string {
  // -ing → drop 3, then collapse a doubled trailing consonant ("running" → "runn"
  // → "run"). Length guard prevents hollowing out short words.
  if (t.length > 5 && t.endsWith('ing')) {
    let s = t.slice(0, -3);
    if (s.length >= 3) {
      const a = s.charAt(s.length - 1);
      const b = s.charAt(s.length - 2);
      if (a === b && !'aeiou'.includes(a)) s = s.slice(0, -1);
    }
    return s;
  }
  // -ed → drop 2 (length > 4 keeps "bed", "led" intact).
  if (t.length > 4 && t.endsWith('ed')) return t.slice(0, -2);
  // -ly → drop 2.
  if (t.length > 4 && t.endsWith('ly')) return t.slice(0, -2);
  // -es → drop 2 (length > 4 keeps "yes" intact).
  if (t.length > 4 && t.endsWith('es')) return t.slice(0, -2);
  // -s → drop 1, but preserve -ss / -is / -us / -as (false plurals: "bursitis",
  // "bus", "kiss", "atlas").
  if (
    t.length > 3 &&
    t.endsWith('s') &&
    !t.endsWith('ss') &&
    !t.endsWith('is') &&
    !t.endsWith('us') &&
    !t.endsWith('as')
  ) {
    return t.slice(0, -1);
  }
  return t;
}

// ---- Batch-relevance heuristic (Cluster 3 locks) -----------------------------

/**
 * For a topic to qualify as batch-relevant, the stem-overlap score against the
 * batch's keywords must reach this threshold. Aggregated across all batch
 * keywords (Cluster 3 Q12 lock). Tunable later if validation reveals poor
 * recall (autonomous detail per Rule 14d).
 */
export const BATCH_RELEVANCE_MIN_STEMS = 2;

export interface BatchRelevanceContext {
  /** New keywords being placed in this batch. */
  batchKeywords: KeywordLite[];
  /** All canvas nodes (full set). */
  nodes: CanvasNodeRow[];
  /** All canvas keywords (used to look up keyword text per topic). */
  keywords: KeywordLite[];
}

/**
 * Per Cluster 3 Q11 lock: for each candidate topic identified by stem-overlap,
 * the one-hop neighborhood (self + immediate parent + immediate siblings +
 * immediate children) gets promoted to Tier 0. Returns the union of all
 * promoted stableIds.
 *
 * Cost: bounded local string work. On a 1,000-topic canvas, ~3M token-ops per
 * batch — sub-millisecond on modern hardware.
 *
 * Returns an empty set when there are no batch keywords or no canvas. Empty
 * set is a valid "no batch-relevance signal this batch" result; the recency
 * + stability signals still run.
 */
export function computeBatchRelevantSubtree(
  ctx: BatchRelevanceContext,
): Set<string> {
  const result = new Set<string>();
  if (ctx.batchKeywords.length === 0 || ctx.nodes.length === 0) return result;

  const keywordById = new Map<string, KeywordLite>();
  for (const k of ctx.keywords) keywordById.set(k.id, k);

  // Pre-stem each batch keyword once.
  const batchKeywordStems: Set<string>[] = ctx.batchKeywords.map(k =>
    stemTokens(k.keyword),
  );

  // Per-topic stem set: title + intent fingerprint + linked keyword text.
  const topicStems = new Map<string, Set<string>>();
  for (const n of ctx.nodes) {
    const stems = new Set<string>();
    for (const s of stemTokens(n.title)) stems.add(s);
    if (n.intentFingerprint) {
      for (const s of stemTokens(n.intentFingerprint)) stems.add(s);
    }
    for (const kwId of n.linkedKwIds ?? []) {
      const kw = keywordById.get(kwId);
      if (!kw) continue;
      for (const s of stemTokens(kw.keyword)) stems.add(s);
    }
    topicStems.set(n.stableId, stems);
  }

  // Aggregate score across all batch keywords. The design's pseudocode
  // (§3.3) places the candidate-selection step inside the per-keyword loop,
  // but the natural reading of the threshold ("≥2 stems shared") is the
  // sum across the batch — that's what's implemented here.
  const score = new Map<string, number>();
  for (const stems of batchKeywordStems) {
    if (stems.size === 0) continue;
    for (const [stableId, tStems] of topicStems.entries()) {
      let count = 0;
      for (const s of stems) if (tStems.has(s)) count++;
      if (count > 0) {
        score.set(stableId, (score.get(stableId) ?? 0) + count);
      }
    }
  }

  const candidates: string[] = [];
  for (const [stableId, c] of score.entries()) {
    if (c >= BATCH_RELEVANCE_MIN_STEMS) candidates.push(stableId);
  }
  if (candidates.length === 0) return result;

  // One-hop neighborhood: self + parent + siblings + children. Walked via
  // stableId-keyed indexes built from the node list.
  const nodeByStable = new Map<string, CanvasNodeRow>();
  const idToStable = new Map<string, string>();
  for (const n of ctx.nodes) {
    nodeByStable.set(n.stableId, n);
    idToStable.set(n.id, n.stableId);
  }

  // Build child-index keyed by parent stableId.
  const childrenByParentStable = new Map<string, string[]>();
  for (const n of ctx.nodes) {
    const parentStable =
      n.parentId !== null ? (idToStable.get(n.parentId) ?? null) : null;
    if (parentStable) {
      if (!childrenByParentStable.has(parentStable)) {
        childrenByParentStable.set(parentStable, []);
      }
      childrenByParentStable.get(parentStable)!.push(n.stableId);
    }
  }

  for (const stableId of candidates) {
    result.add(stableId);
    const node = nodeByStable.get(stableId);
    if (!node) continue;

    // Parent (one hop up).
    const parentStable =
      node.parentId !== null ? (idToStable.get(node.parentId) ?? null) : null;
    if (parentStable) result.add(parentStable);

    // Siblings (other nodes sharing the same parent).
    if (parentStable) {
      const siblings = childrenByParentStable.get(parentStable) ?? [];
      for (const sib of siblings) result.add(sib);
    }

    // Children (one hop down).
    const children = childrenByParentStable.get(stableId) ?? [];
    for (const ch of children) result.add(ch);
  }

  return result;
}

// ---- Tier decider (Cluster 2 locks) ------------------------------------------

export interface TierDeciderInput {
  /** Topic's stability score. Defaults to 0 today (algorithm dormant). */
  stabilityScore: number;
  /** null when never touched; else (currentBatchNum − lastTouchedBatchNum). */
  batchesSinceTouch: number | null;
  /** True if the topic is in the batch-relevant subtree this batch. */
  isInBatchRelevantSubtree: boolean;
  /** Recency window N (Cluster 2 Q6 lock; default 5). */
  recencyWindow: number;
}

/**
 * Cluster 2 truth table:
 *
 *   Tier 0 (Full) — IF ANY of:
 *     - in batch-relevant subtree
 *     - touched within last `recencyWindow` batches
 *     - stability < 7.0
 *
 *   Tier 2 (Skeleton) — IF ALL of:
 *     - stability ≥ 7.0
 *     - not touched in last `TIER_2_DEEP_STALE_THRESHOLD` batches (deep-stale)
 *     - not in batch-relevant subtree
 *
 *   Tier 1 (Summary) — default (stable + settled + off-batch but not deep-stale)
 *
 * Pure signal-based — does NOT consider intent-fingerprint presence (the
 * serializer pins fingerprint-less topics to Tier 0 separately, per
 * INPUT_CONTEXT_SCALING_DESIGN.md §4.2 last paragraph). Q9 lock: no ancestor
 * force-promotion — Tier 1's fingerprint and Tier 2's title + parent_id are
 * sufficient for hierarchy navigation.
 */
export function decideTier(input: TierDeciderInput): Tier {
  const { stabilityScore, batchesSinceTouch, isInBatchRelevantSubtree, recencyWindow } = input;

  if (isInBatchRelevantSubtree) return 0;
  if (batchesSinceTouch !== null && batchesSinceTouch <= recencyWindow) return 0;
  if (stabilityScore < STABILITY_TIER_THRESHOLD) return 0;

  // High stability, off-batch, not recent. Eligible for Tier 1 or Tier 2.
  const deeplyStale =
    batchesSinceTouch === null || batchesSinceTouch > TIER_2_DEEP_STALE_THRESHOLD;
  if (deeplyStale) return 2;
  return 1;
}

// ---- Touch tracker -----------------------------------------------------------

/**
 * In-memory map: topic stableId → batch number of its most recent touch. Used
 * to compute `batchesSinceTouch` for the tier decider's recency signal.
 *
 * Persistence: the AutoAnalyze.tsx caller (Session D wire-up) is expected to
 * serialize this to the existing `aa_checkpoint_{projectId}` localStorage
 * blob between batches and rehydrate at run start, then clear on cancel.
 * Helpers for that round-trip are exported below.
 */
export type TouchTracker = Map<string, number>;

export function createTouchTracker(): TouchTracker {
  return new Map();
}

/**
 * Stamp `currentBatchNum` on every topic referenced by the supplied operations.
 * Walks aliases ($newN) through the `aliasResolutions` map produced by the
 * applier; bare stableIds (t-N) pass through unchanged. Refs that don't
 * resolve (e.g., aliases for ops that the applier rejected) are silently
 * skipped — a missing resolution means the op didn't apply.
 *
 * Per Cluster 2 Q5 lock the rule is "any operation that references the topic
 * touches it." Applied conservatively here: every ref in every op body that
 * resolves to a stableId is stamped, including reassign targets on
 * DELETE_TOPIC and parent refs on ADD_TOPIC / MOVE_TOPIC. Touches against
 * topics that ceased to exist this batch (e.g., MERGE source, SPLIT source,
 * DELETE id) are harmless — those stableIds simply never appear in the
 * post-apply canvas, so the tracker entry stays as garbage but never matches
 * a node. Q5 → C: no propagation to ancestors.
 */
export function recordTouchesFromOps(
  tracker: TouchTracker,
  ops: Operation[],
  currentBatchNum: number,
  aliasResolutions: Record<string, string>,
): void {
  const resolve = (ref: string | null | undefined): string | null => {
    if (ref === null || ref === undefined) return null;
    if (ref.startsWith('$')) return aliasResolutions[ref] ?? null;
    return ref;
  };
  const stamp = (sid: string | null) => {
    if (sid !== null) tracker.set(sid, currentBatchNum);
  };

  for (const op of ops) {
    switch (op.type) {
      case 'ADD_TOPIC':
        stamp(resolve(op.id));
        stamp(resolve(op.parent));
        break;
      case 'UPDATE_TOPIC_TITLE':
      case 'UPDATE_TOPIC_DESCRIPTION':
        stamp(resolve(op.id));
        break;
      case 'MOVE_TOPIC':
        stamp(resolve(op.id));
        stamp(resolve(op.newParent));
        break;
      case 'MERGE_TOPICS':
        stamp(resolve(op.sourceId));
        stamp(resolve(op.targetId));
        break;
      case 'SPLIT_TOPIC':
        stamp(resolve(op.sourceId));
        for (const e of op.into) stamp(resolve(e.id));
        break;
      case 'DELETE_TOPIC':
        stamp(resolve(op.id));
        if (op.reassignKeywordsTo !== 'ARCHIVE') {
          stamp(resolve(op.reassignKeywordsTo));
        }
        break;
      case 'ADD_KEYWORD':
        stamp(resolve(op.topic));
        break;
      case 'MOVE_KEYWORD':
        stamp(resolve(op.from));
        stamp(resolve(op.to));
        break;
      case 'REMOVE_KEYWORD':
        stamp(resolve(op.from));
        break;
      case 'ARCHIVE_KEYWORD':
        // No topic ref — keyword archived globally.
        break;
      case 'ADD_SISTER_LINK':
      case 'REMOVE_SISTER_LINK':
        stamp(resolve(op.topicA));
        stamp(resolve(op.topicB));
        break;
    }
  }
}

/**
 * Returns null when the topic was never touched. Otherwise:
 * `currentBatchNum − lastTouchedBatchNum`. A topic touched in the current
 * batch yields 0; touched in the previous batch yields 1; etc.
 */
export function batchesSinceTouch(
  tracker: TouchTracker,
  stableId: string,
  currentBatchNum: number,
): number | null {
  const last = tracker.get(stableId);
  if (last === undefined) return null;
  return currentBatchNum - last;
}

/** JSON-safe object for persistence into the existing `aa_checkpoint_{projectId}`. */
export function serializeTouchTracker(
  tracker: TouchTracker,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of tracker.entries()) out[k] = v;
  return out;
}

/** Inverse of `serializeTouchTracker`. Empty/missing → fresh empty tracker. */
export function deserializeTouchTracker(
  data: Record<string, number> | null | undefined,
): TouchTracker {
  const t: TouchTracker = new Map();
  if (!data) return t;
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'number' && Number.isFinite(v)) t.set(k, v);
  }
  return t;
}

// ---- Tier 1 / Tier 2 row formatters + tiered TSV builder ---------------------

/**
 * Cluster 1 Q3 lock: "{N} keywords ({P}p + {S}s), top volume kw: '{text}' ({V})".
 * Empty topic emits "0 keywords" (no top-volume suffix). Top-volume picked by
 * volume desc, ties broken alphabetically by keyword text. Missing volumes
 * sort as 0 — the lowest tie.
 */
export function formatTier1KeywordSummary(
  node: CanvasNodeRow,
  keywords: KeywordLite[],
): string {
  const keywordById = new Map<string, KeywordLite>();
  for (const k of keywords) keywordById.set(k.id, k);

  const linked: KeywordLite[] = [];
  let primary = 0;
  let secondary = 0;
  for (const kwId of node.linkedKwIds ?? []) {
    const kw = keywordById.get(kwId);
    if (!kw) continue;
    linked.push(kw);
    if ((node.kwPlacements ?? {})[kwId] === 's') secondary++;
    else primary++;
  }

  const total = linked.length;
  if (total === 0) return '0 keywords';

  // Sort by volume desc, alphabetical asc tiebreaker. Coerce number-or-string
  // volumes to a numeric value; non-numeric / missing values sort as 0.
  const sorted = [...linked].sort((a, b) => {
    const va = volumeAsNumber(a.volume);
    const vb = volumeAsNumber(b.volume);
    if (va !== vb) return vb - va;
    return a.keyword.localeCompare(b.keyword);
  });
  const top = sorted[0];
  const topVol = volumeAsNumber(top.volume);

  return `${total} keywords (${primary}p + ${secondary}s), top volume kw: "${sanitize(top.keyword)}" (${topVol})`;
}

function volumeAsNumber(v: number | string | undefined | null): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

const TIER_1_HEADER = [
  'Stable ID',
  'Title',
  'Parent Stable ID',
  'Stability Score',
  'Intent Fingerprint',
  'Keyword Summary',
].join('\t');

const TIER_2_HEADER = [
  'Stable ID',
  'Title',
  'Parent Stable ID',
].join('\t');

/** Header strings exposed for V4 prompt-spec parity in unit tests. */
export const TIER_HEADERS = {
  /** Tier 0 reuses the existing 9-column TSV header; reused via buildFullTsv. */
  tier0Width: 9,
  tier1: TIER_1_HEADER,
  tier2: TIER_2_HEADER,
} as const;

function formatTier1Row(
  node: CanvasNodeRow,
  parentStable: string,
  keywords: KeywordLite[],
): string {
  const stability = (node.stabilityScore ?? 0).toFixed(1);
  const summary = formatTier1KeywordSummary(node, keywords);
  return [
    node.stableId,
    sanitize(node.title),
    parentStable,
    stability,
    sanitize(node.intentFingerprint ?? ''),
    summary,
  ].join('\t');
}

function formatTier2Row(node: CanvasNodeRow, parentStable: string): string {
  return [node.stableId, sanitize(node.title), parentStable].join('\t');
}

// ---- Tier-context shape + tiered TSV builder ---------------------------------

export interface TierContext {
  /** New keywords being placed in this batch (drives batch-relevance). */
  batchKeywords: KeywordLite[];
  /** Touch tracker — usually rehydrated from localStorage between batches. */
  touchTracker: TouchTracker;
  /** 1-indexed batch number; batchesSinceTouch = current − last. */
  currentBatchNum: number;
  /**
   * Cluster 2 Q6 lock — default DEFAULT_RECENCY_WINDOW (5). Tunable per
   * project via the AutoAnalyze settings panel (Session D wire-up).
   */
  recencyWindow?: number;
}

/**
 * Three-section TSV: each tier gets its own header + rows. Empty tiers are
 * omitted entirely so the prompt never sees a header without rows. Tier 0
 * reuses the 9-column V3 layout; Tier 1 and Tier 2 use their own column
 * shapes (per Cluster 1 Q3 lock + INPUT_CONTEXT_SCALING_DESIGN.md §1.1).
 *
 * Empty canvas → no sections; returns the empty string. The caller is
 * expected to detect and handle that case (the existing V3 path returns just
 * the Tier 0 header on empty canvas, which is upstream of this function).
 */
function buildTieredTsv(
  nodes: CanvasNodeRow[],
  sisterLinks: SisterLinkRow[],
  keywords: KeywordLite[],
  ctx: TierContext,
): string {
  if (nodes.length === 0) {
    // Same convention as buildFullTsv on empty canvas — emit just the Tier 0
    // header so the model still sees the canonical schema. (Tier 1 / Tier 2
    // sections are dropped because they have no rows.)
    return [
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
  }

  const recencyWindow = ctx.recencyWindow ?? DEFAULT_RECENCY_WINDOW;

  // Compute the batch-relevant subtree once.
  const batchSubtree = computeBatchRelevantSubtree({
    batchKeywords: ctx.batchKeywords,
    nodes,
    keywords,
  });

  // Decide each node's tier.
  const tierByStable = new Map<string, Tier>();
  for (const n of nodes) {
    // Empty-fingerprint pin: nodes without an intentFingerprint cannot be
    // safely demoted (per INPUT_CONTEXT_SCALING_DESIGN.md §4.2 — the load-
    // bearing intent-equivalence signal at Tier 1 would be missing).
    const fingerprintEmpty =
      !n.intentFingerprint || n.intentFingerprint.length === 0;
    if (fingerprintEmpty) {
      tierByStable.set(n.stableId, 0);
      continue;
    }
    const since = batchesSinceTouch(
      ctx.touchTracker,
      n.stableId,
      ctx.currentBatchNum,
    );
    const tier = decideTier({
      stabilityScore: n.stabilityScore ?? 0,
      batchesSinceTouch: since,
      isInBatchRelevantSubtree: batchSubtree.has(n.stableId),
      recencyWindow,
    });
    tierByStable.set(n.stableId, tier);
  }

  // Bucket the nodes (preserving the original sort: by stableId integer suffix).
  const sortedNodes = [...nodes].sort(
    (a, b) => stableIdSuffix(a.stableId) - stableIdSuffix(b.stableId),
  );
  const tier0: CanvasNodeRow[] = [];
  const tier1: CanvasNodeRow[] = [];
  const tier2: CanvasNodeRow[] = [];
  for (const n of sortedNodes) {
    const t = tierByStable.get(n.stableId)!;
    if (t === 0) tier0.push(n);
    else if (t === 1) tier1.push(n);
    else tier2.push(n);
  }

  const idToStable = new Map<string, string>();
  for (const n of nodes) idToStable.set(n.id, n.stableId);

  const sections: string[] = [];

  // -- Tier 0 (full row, reusing the 9-column TSV format).
  if (tier0.length > 0) {
    const sub = buildFullTsv(tier0, sisterLinks, keywords);
    sections.push(`=== TIER 0 ===\n${sub}`);
  }

  // -- Tier 1 (summary).
  if (tier1.length > 0) {
    const rows: string[] = [TIER_1_HEADER];
    for (const n of tier1) {
      const parentStable =
        n.parentId !== null ? (idToStable.get(n.parentId) ?? '') : '';
      rows.push(formatTier1Row(n, parentStable, keywords));
    }
    sections.push(`=== TIER 1 ===\n${rows.join('\n')}`);
  }

  // -- Tier 2 (skeleton).
  if (tier2.length > 0) {
    const rows: string[] = [TIER_2_HEADER];
    for (const n of tier2) {
      const parentStable =
        n.parentId !== null ? (idToStable.get(n.parentId) ?? '') : '';
      rows.push(formatTier2Row(n, parentStable));
    }
    sections.push(`=== TIER 2 ===\n${rows.join('\n')}`);
  }

  return sections.join('\n\n');
}

// ============================================================
// 6. Misc
// ============================================================

function defaultUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Last-resort fallback for very old runtimes; uuid v4-shaped.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
