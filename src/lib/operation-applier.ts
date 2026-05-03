/**
 * Operation applier for the Auto-Analyze pivot.
 *
 * Per `docs/PIVOT_DESIGN.md` §1, §3, §4 (Pivot Session B). Pure function.
 * Takes (existing canvas state, list of operations) → (new canvas state,
 * archived-keyword intents, alias-to-stableId resolutions) OR an error
 * report. Atomic: a single bad operation returns errors; the input state
 * is never mutated.
 *
 * No AI, no I/O, no Prisma. The wiring layer that translates
 * Prisma rows ↔ this module's data shape and persists the result is the
 * scope of Pivot Session D.
 */

// ============================================================
// Types
// ============================================================

export type StableId = string; // "t-N"
export type Alias = string; // "$newN"
export type TopicRef = StableId | Alias;
export type KeywordId = string; // database UUID
export type Placement = 'primary' | 'secondary';
export type Relationship = 'linear' | 'nested';

export interface CanvasNode {
  stableId: StableId;
  title: string;
  description: string;
  parentStableId: StableId | null;
  relationship: Relationship | null; // null iff root
  keywordPlacements: Record<KeywordId, Placement>;
  stabilityScore: number;
  /**
   * Intent fingerprint — short canonical phrase (5–15 words, searcher-centric)
   * capturing the topic's compound intent. Load-bearing for Tiered Canvas
   * Serialization (Scale Sessions B–E in INPUT_CONTEXT_SCALING_DESIGN.md).
   *
   * Scale Session B (this version): the applier accepts an optional
   * `intentFingerprint` on AddTopic / UpdateTitle / UpdateDescription / Split-into,
   * and `mergedIntentFingerprint` on Merge — when present, must be non-empty.
   * Default for new topics that don't supply one is the empty string. Scale
   * Session D tightens the AI-emitted ops to require fingerprints once V4
   * prompts ship.
   */
  intentFingerprint: string;
}

export interface SisterLink {
  topicAStableId: StableId;
  topicBStableId: StableId;
}

export interface CanvasState {
  nodes: CanvasNode[];
  sisterLinks: SisterLink[];
  /** The integer N to assign to the next freshly-created topic ("t-N"). */
  nextStableIdCounter: number;
}

/** Required when an op targets a topic with stabilityScore ≥ 7.0. */
export interface JustifyRestructure {
  topicAffected: string;
  priorState: string;
  newState: string;
  score: string;
  reason: string;
  expectedQualityImprovement: string;
}

// --- Operation shapes ----------------------------------------

export interface AddTopicOp {
  type: 'ADD_TOPIC';
  id: Alias;
  title: string;
  description: string;
  parent: TopicRef | null;
  /** "linear" | "nested" for non-root topics; ignored (any value) for roots. */
  relationship: Relationship | null;
  /**
   * Optional in Scale Session B; tightens to required in Scale Session D once
   * V4 prompts ship. When present, must be a non-empty trimmed string.
   */
  intentFingerprint?: string;
}

export interface UpdateTopicTitleOp {
  type: 'UPDATE_TOPIC_TITLE';
  id: TopicRef;
  to: string;
  justifyRestructure?: JustifyRestructure;
  /**
   * Optional in Scale Session B; tightens to required in Scale Session D.
   * Refreshes the topic's fingerprint to track the new title's intent.
   * When present, must be a non-empty trimmed string.
   */
  intentFingerprint?: string;
}

export interface UpdateTopicDescriptionOp {
  type: 'UPDATE_TOPIC_DESCRIPTION';
  id: TopicRef;
  to: string;
  /**
   * Optional always — most description edits are pure refinement and the AI
   * may opt to keep the existing fingerprint. When present, must be a
   * non-empty trimmed string.
   */
  intentFingerprint?: string;
}

export interface MoveTopicOp {
  type: 'MOVE_TOPIC';
  id: TopicRef;
  newParent: TopicRef | null;
  newRelationship: Relationship;
  reason: string;
  justifyRestructure?: JustifyRestructure;
}

export interface MergeTopicsOp {
  type: 'MERGE_TOPICS';
  sourceId: TopicRef;
  targetId: TopicRef;
  mergedTitle: string;
  mergedDescription: string;
  reason: string;
  justifyRestructure?: JustifyRestructure;
  /**
   * Optional in Scale Session B; tightens to required in Scale Session D.
   * Replaces the merged target's fingerprint. When present, must be a
   * non-empty trimmed string.
   */
  mergedIntentFingerprint?: string;
}

export interface SplitTopicOp {
  type: 'SPLIT_TOPIC';
  sourceId: TopicRef;
  into: Array<{
    id: Alias;
    title: string;
    description: string;
    keywordIds: KeywordId[];
    /**
     * Optional in Scale Session B; tightens to required in Scale Session D.
     * When present, must be a non-empty trimmed string.
     */
    intentFingerprint?: string;
  }>;
  reason: string;
  justifyRestructure?: JustifyRestructure;
}

export interface DeleteTopicOp {
  type: 'DELETE_TOPIC';
  id: TopicRef;
  reason: string;
  /** Either a topic ref OR the literal string "ARCHIVE". */
  reassignKeywordsTo: TopicRef | 'ARCHIVE';
  justifyRestructure?: JustifyRestructure;
}

export interface AddKeywordOp {
  type: 'ADD_KEYWORD';
  topic: TopicRef;
  keywordId: KeywordId;
  placement: Placement;
}

export interface MoveKeywordOp {
  type: 'MOVE_KEYWORD';
  keywordId: KeywordId;
  from: TopicRef;
  to: TopicRef;
  placement: Placement;
}

export interface RemoveKeywordOp {
  type: 'REMOVE_KEYWORD';
  keywordId: KeywordId;
  from: TopicRef;
}

export interface ArchiveKeywordOp {
  type: 'ARCHIVE_KEYWORD';
  keywordId: KeywordId;
  reason: string;
}

export interface AddSisterLinkOp {
  type: 'ADD_SISTER_LINK';
  topicA: TopicRef;
  topicB: TopicRef;
}

export interface RemoveSisterLinkOp {
  type: 'REMOVE_SISTER_LINK';
  topicA: TopicRef;
  topicB: TopicRef;
}

export type Operation =
  | AddTopicOp
  | UpdateTopicTitleOp
  | UpdateTopicDescriptionOp
  | MoveTopicOp
  | MergeTopicsOp
  | SplitTopicOp
  | DeleteTopicOp
  | AddKeywordOp
  | MoveKeywordOp
  | RemoveKeywordOp
  | ArchiveKeywordOp
  | AddSisterLinkOp
  | RemoveSisterLinkOp;

// --- Result shapes -------------------------------------------

export interface ArchivedKeywordIntent {
  keywordId: KeywordId;
  reason: string;
}

export interface ApplyError {
  opIndex: number; // 0-based; -1 if invariant check / batch-level
  opType: string;
  message: string;
}

export interface ApplyOk {
  ok: true;
  newState: CanvasState;
  archivedKeywords: ArchivedKeywordIntent[];
  aliasResolutions: Record<Alias, StableId>;
}

export interface ApplyErr {
  ok: false;
  errors: ApplyError[];
}

export type ApplyResult = ApplyOk | ApplyErr;

// ============================================================
// Constants & helpers
// ============================================================

export const ARCHIVE_LITERAL = 'ARCHIVE' as const;
const STABILITY_RESTRUCTURE_THRESHOLD = 7.0;
const ALIAS_PREFIX = '$';
const STABLE_ID_PREFIX = 't-';

const isAlias = (s: string): s is Alias => s.startsWith(ALIAS_PREFIX);
const isStableId = (s: string): s is StableId => s.startsWith(STABLE_ID_PREFIX);

class ApplyAbort extends Error {
  detail: ApplyError;
  constructor(detail: ApplyError) {
    super(detail.message);
    this.detail = detail;
  }
}

function fail(opIndex: number, opType: string, message: string): never {
  throw new ApplyAbort({ opIndex, opType, message });
}

function deepClone<T>(x: T): T {
  return structuredClone(x);
}

const REQUIRED_JUSTIFY_FIELDS: (keyof JustifyRestructure)[] = [
  'topicAffected',
  'priorState',
  'newState',
  'score',
  'reason',
  'expectedQualityImprovement',
];

function checkJustifyShape(
  j: JustifyRestructure | undefined,
): string | null {
  if (!j) return 'JUSTIFY_RESTRUCTURE payload missing';
  for (const k of REQUIRED_JUSTIFY_FIELDS) {
    const v = j[k];
    if (typeof v !== 'string' || v.trim().length === 0) {
      return `JUSTIFY_RESTRUCTURE.${k} must be a non-empty string`;
    }
  }
  return null;
}

/**
 * Validate an optional intent-fingerprint field on an operation. Per Scale
 * Session B (INPUT_CONTEXT_SCALING_DESIGN.md §6): when present the field
 * must be a non-empty trimmed string; when absent the operation is accepted
 * unchanged. Scale Session D will tighten to required for AddTopic /
 * UpdateTitle / Merge / Split-into once V4 prompts ship.
 */
function validateOptionalFingerprint(
  value: unknown,
  i: number,
  opType: string,
  field: string,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    fail(i, opType, `${field} must be a string when present`);
  }
  if (value.trim().length === 0) {
    fail(i, opType, `${field} must be a non-empty string when present`);
  }
  return value;
}

// ============================================================
// Scratch model — internal mutable representation during apply
// ============================================================

interface Scratch {
  nodesByStableId: Map<StableId, CanvasNode>;
  sisterLinks: SisterLink[];
  nextStableIdCounter: number;
  aliasResolutions: Map<Alias, StableId>;
  archivedKeywords: ArchivedKeywordIntent[];
}

function buildScratch(state: CanvasState): Scratch {
  const cloned = deepClone(state);
  const nodesByStableId = new Map<StableId, CanvasNode>();
  for (const n of cloned.nodes) {
    if (nodesByStableId.has(n.stableId)) {
      // Pre-existing duplicate stable IDs in the input state — caller bug.
      throw new ApplyAbort({
        opIndex: -1,
        opType: 'INPUT',
        message: `input canvas state contains duplicate stableId "${n.stableId}"`,
      });
    }
    nodesByStableId.set(n.stableId, n);
  }
  return {
    nodesByStableId,
    sisterLinks: cloned.sisterLinks,
    nextStableIdCounter: cloned.nextStableIdCounter,
    aliasResolutions: new Map(),
    archivedKeywords: [],
  };
}

function resolveTopicRef(
  s: Scratch,
  ref: TopicRef,
  opIndex: number,
  opType: string,
  field: string,
): StableId {
  if (isAlias(ref)) {
    const resolved = s.aliasResolutions.get(ref);
    if (!resolved) {
      fail(opIndex, opType, `${field}: alias "${ref}" was not defined earlier in this batch`);
    }
    return resolved;
  }
  if (!isStableId(ref)) {
    fail(opIndex, opType, `${field}: "${ref}" is not a valid stable ID or alias (must start with "t-" or "$")`);
  }
  if (!s.nodesByStableId.has(ref)) {
    fail(opIndex, opType, `${field}: stable ID "${ref}" does not exist on the canvas`);
  }
  return ref;
}

function issueStableId(s: Scratch): StableId {
  const id = `${STABLE_ID_PREFIX}${s.nextStableIdCounter}`;
  s.nextStableIdCounter += 1;
  return id;
}

/** Walk parent chain; throw if a cycle exists or a parent dangles. */
function checkParentChainAcyclic(s: Scratch): void {
  for (const start of s.nodesByStableId.keys()) {
    let cur: StableId | null = start;
    const seen = new Set<StableId>();
    while (cur !== null) {
      if (seen.has(cur)) {
        throw new ApplyAbort({
          opIndex: -1,
          opType: 'INVARIANT',
          message: `parent chain contains a cycle that includes "${cur}"`,
        });
      }
      seen.add(cur);
      const node = s.nodesByStableId.get(cur);
      if (!node) {
        throw new ApplyAbort({
          opIndex: -1,
          opType: 'INVARIANT',
          message: `parent chain references missing topic "${cur}" (orphan)`,
        });
      }
      cur = node.parentStableId;
    }
  }
}

/** Every keyword appearing in any node's placements OR archived list,
 *  plus the input ones. Returns map keywordId → list of stableIds it's at. */
function indexKeywordPlacements(s: Scratch): Map<KeywordId, StableId[]> {
  const out = new Map<KeywordId, StableId[]>();
  for (const n of s.nodesByStableId.values()) {
    for (const kw of Object.keys(n.keywordPlacements)) {
      const list = out.get(kw) ?? [];
      list.push(n.stableId);
      out.set(kw, list);
    }
  }
  return out;
}

// ============================================================
// Per-operation appliers (each validates AND applies in place)
// ============================================================

function applyAddTopic(s: Scratch, op: AddTopicOp, i: number): void {
  if (!isAlias(op.id)) fail(i, op.type, `id "${op.id}" must be an alias starting with "$"`);
  if (s.aliasResolutions.has(op.id)) fail(i, op.type, `alias "${op.id}" is already defined in this batch`);
  if (typeof op.title !== 'string' || op.title.trim().length === 0) {
    fail(i, op.type, `title must be a non-empty string`);
  }
  let parentStableId: StableId | null = null;
  if (op.parent !== null) {
    parentStableId = resolveTopicRef(s, op.parent, i, op.type, 'parent');
  }
  // Relationship is only meaningful for non-root topics. Per PIVOT_DESIGN §1.1
  // and AUTO_ANALYZE_PROMPT_V3.md ("relationship: ... required for non-root
  // topics; ignored for root"), root topics (parent === null) ignore whatever
  // the AI emitted — it gets nulled out below either way.
  if (parentStableId !== null && op.relationship !== 'linear' && op.relationship !== 'nested') {
    fail(i, op.type, `relationship must be "linear" or "nested" for non-root topics`);
  }
  const intentFingerprint = validateOptionalFingerprint(
    op.intentFingerprint, i, op.type, 'intentFingerprint',
  );
  const stableId = issueStableId(s);
  s.aliasResolutions.set(op.id, stableId);
  s.nodesByStableId.set(stableId, {
    stableId,
    title: op.title,
    description: op.description ?? '',
    parentStableId,
    relationship: parentStableId === null ? null : op.relationship,
    keywordPlacements: {},
    stabilityScore: 0.0,
    intentFingerprint: intentFingerprint ?? '',
  });
}

function applyUpdateTopicTitle(s: Scratch, op: UpdateTopicTitleOp, i: number): void {
  const stableId = resolveTopicRef(s, op.id, i, op.type, 'id');
  const node = s.nodesByStableId.get(stableId)!;
  if (typeof op.to !== 'string' || op.to.trim().length === 0) {
    fail(i, op.type, `to must be a non-empty string`);
  }
  if (node.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD) {
    const err = checkJustifyShape(op.justifyRestructure);
    if (err) fail(i, op.type, `topic ${stableId} has stabilityScore=${node.stabilityScore} (≥${STABILITY_RESTRUCTURE_THRESHOLD}); ${err}`);
  }
  const fp = validateOptionalFingerprint(
    op.intentFingerprint, i, op.type, 'intentFingerprint',
  );
  node.title = op.to;
  if (fp !== undefined) node.intentFingerprint = fp;
}

function applyUpdateTopicDescription(s: Scratch, op: UpdateTopicDescriptionOp, i: number): void {
  const stableId = resolveTopicRef(s, op.id, i, op.type, 'id');
  const node = s.nodesByStableId.get(stableId)!;
  // No JUSTIFY required: description-only edits are safe even on stable topics
  // (per PIVOT_DESIGN.md §1.4 rule 6).
  const fp = validateOptionalFingerprint(
    op.intentFingerprint, i, op.type, 'intentFingerprint',
  );
  node.description = typeof op.to === 'string' ? op.to : '';
  if (fp !== undefined) node.intentFingerprint = fp;
}

function applyMoveTopic(s: Scratch, op: MoveTopicOp, i: number): void {
  const stableId = resolveTopicRef(s, op.id, i, op.type, 'id');
  const node = s.nodesByStableId.get(stableId)!;
  if (typeof op.reason !== 'string' || op.reason.trim().length === 0) {
    fail(i, op.type, `reason must be a non-empty string`);
  }
  if (op.newRelationship !== 'linear' && op.newRelationship !== 'nested') {
    fail(i, op.type, `newRelationship must be "linear" or "nested"`);
  }
  let newParentStableId: StableId | null = null;
  if (op.newParent !== null) {
    newParentStableId = resolveTopicRef(s, op.newParent, i, op.type, 'newParent');
    if (newParentStableId === stableId) fail(i, op.type, `topic cannot be its own parent`);
    // Cycle pre-check: walk newParent's parent chain; if it reaches stableId, cycle.
    let cur: StableId | null = newParentStableId;
    while (cur !== null) {
      if (cur === stableId) fail(i, op.type, `move would create a parent-cycle (new parent is a descendant of the moved topic)`);
      cur = s.nodesByStableId.get(cur)!.parentStableId;
    }
  }
  if (node.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD) {
    const err = checkJustifyShape(op.justifyRestructure);
    if (err) fail(i, op.type, `topic ${stableId} has stabilityScore=${node.stabilityScore} (≥${STABILITY_RESTRUCTURE_THRESHOLD}); ${err}`);
  }
  node.parentStableId = newParentStableId;
  node.relationship = newParentStableId === null ? null : op.newRelationship;
}

function applyMergeTopics(s: Scratch, op: MergeTopicsOp, i: number): void {
  const sourceStableId = resolveTopicRef(s, op.sourceId, i, op.type, 'sourceId');
  const targetStableId = resolveTopicRef(s, op.targetId, i, op.type, 'targetId');
  if (sourceStableId === targetStableId) fail(i, op.type, `sourceId and targetId must differ`);
  if (typeof op.reason !== 'string' || op.reason.trim().length === 0) {
    fail(i, op.type, `reason must be a non-empty string`);
  }
  if (typeof op.mergedTitle !== 'string' || op.mergedTitle.trim().length === 0) {
    fail(i, op.type, `mergedTitle must be a non-empty string`);
  }
  const source = s.nodesByStableId.get(sourceStableId)!;
  const target = s.nodesByStableId.get(targetStableId)!;
  // Justify gate: applies if EITHER source or target is at or above threshold.
  if (
    source.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD ||
    target.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD
  ) {
    const err = checkJustifyShape(op.justifyRestructure);
    if (err) fail(i, op.type, `merge involves a topic with stabilityScore≥${STABILITY_RESTRUCTURE_THRESHOLD}; ${err}`);
  }
  const mergedFp = validateOptionalFingerprint(
    op.mergedIntentFingerprint, i, op.type, 'mergedIntentFingerprint',
  );
  // 1. Re-parent source's children to target.
  for (const child of s.nodesByStableId.values()) {
    if (child.parentStableId === sourceStableId) {
      child.parentStableId = targetStableId;
    }
  }
  // 2. Migrate sister links: rewrite endpoints; dedupe; drop self-links.
  s.sisterLinks = dedupeAndRewriteSisterLinks(s.sisterLinks, sourceStableId, targetStableId);
  // 3. Merge keyword placements: target wins on collision (existing placement preserved).
  for (const [kwId, placement] of Object.entries(source.keywordPlacements)) {
    if (!(kwId in target.keywordPlacements)) {
      target.keywordPlacements[kwId] = placement;
    }
  }
  // 4. Apply merged title/description (and merged fingerprint if provided).
  target.title = op.mergedTitle;
  target.description = op.mergedDescription ?? '';
  if (mergedFp !== undefined) target.intentFingerprint = mergedFp;
  // (else target keeps its existing fingerprint — Session B safety since V3
  //  prompts don't yet emit merged_intent_fingerprint.)
  // 5. Remove source.
  s.nodesByStableId.delete(sourceStableId);
}

function dedupeAndRewriteSisterLinks(
  links: SisterLink[],
  fromId: StableId,
  toId: StableId,
): SisterLink[] {
  const seen = new Set<string>();
  const out: SisterLink[] = [];
  for (const link of links) {
    let a = link.topicAStableId === fromId ? toId : link.topicAStableId;
    let b = link.topicBStableId === fromId ? toId : link.topicBStableId;
    if (a === b) continue; // self-link after rewrite
    // Canonicalize ordering for dedupe.
    if (a > b) [a, b] = [b, a];
    const key = `${a}|${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ topicAStableId: a, topicBStableId: b });
  }
  return out;
}

function applySplitTopic(s: Scratch, op: SplitTopicOp, i: number): void {
  const sourceStableId = resolveTopicRef(s, op.sourceId, i, op.type, 'sourceId');
  const source = s.nodesByStableId.get(sourceStableId)!;
  if (typeof op.reason !== 'string' || op.reason.trim().length === 0) {
    fail(i, op.type, `reason must be a non-empty string`);
  }
  if (!Array.isArray(op.into) || op.into.length < 2) {
    fail(i, op.type, `into must contain at least two new topics`);
  }
  // Source must have no children (model handles re-parenting separately).
  for (const n of s.nodesByStableId.values()) {
    if (n.parentStableId === sourceStableId) {
      fail(i, op.type, `source topic "${sourceStableId}" has child "${n.stableId}"; MOVE_TOPIC its children before splitting`);
    }
  }
  // Validate aliases unique and not yet used. Also validate optional
  // intentFingerprint per entry up-front so we don't half-apply.
  const aliasesInOp = new Set<string>();
  const fingerprintByAlias = new Map<string, string | undefined>();
  for (const entry of op.into) {
    if (!isAlias(entry.id)) fail(i, op.type, `into[].id "${entry.id}" must be an alias starting with "$"`);
    if (aliasesInOp.has(entry.id)) fail(i, op.type, `alias "${entry.id}" is duplicated within this SPLIT`);
    aliasesInOp.add(entry.id);
    if (s.aliasResolutions.has(entry.id)) fail(i, op.type, `alias "${entry.id}" is already defined in this batch`);
    if (typeof entry.title !== 'string' || entry.title.trim().length === 0) {
      fail(i, op.type, `into[].title must be a non-empty string`);
    }
    if (!Array.isArray(entry.keywordIds)) fail(i, op.type, `into[].keywordIds must be an array`);
    fingerprintByAlias.set(
      entry.id,
      validateOptionalFingerprint(
        entry.intentFingerprint, i, op.type, `into["${entry.id}"].intentFingerprint`,
      ),
    );
  }
  // Keyword partitioning: every source keyword appears in exactly one into entry.
  const sourceKeywords = new Set(Object.keys(source.keywordPlacements));
  const seen = new Set<KeywordId>();
  for (const entry of op.into) {
    for (const kw of entry.keywordIds) {
      if (!sourceKeywords.has(kw)) fail(i, op.type, `keyword "${kw}" listed in split is not at source topic`);
      if (seen.has(kw)) fail(i, op.type, `keyword "${kw}" listed in multiple split entries`);
      seen.add(kw);
    }
  }
  for (const kw of sourceKeywords) {
    if (!seen.has(kw)) fail(i, op.type, `keyword "${kw}" at source topic was not assigned in any split entry`);
  }
  if (source.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD) {
    const err = checkJustifyShape(op.justifyRestructure);
    if (err) fail(i, op.type, `source topic ${sourceStableId} has stabilityScore=${source.stabilityScore} (≥${STABILITY_RESTRUCTURE_THRESHOLD}); ${err}`);
  }
  // Apply: create new topics inheriting source's parent + relationship.
  const parentStableId = source.parentStableId;
  const relationship = source.relationship;
  for (const entry of op.into) {
    const newStableId = issueStableId(s);
    s.aliasResolutions.set(entry.id, newStableId);
    const placements: Record<KeywordId, Placement> = {};
    for (const kw of entry.keywordIds) {
      placements[kw] = source.keywordPlacements[kw];
    }
    s.nodesByStableId.set(newStableId, {
      stableId: newStableId,
      title: entry.title,
      description: entry.description ?? '',
      parentStableId,
      relationship,
      keywordPlacements: placements,
      stabilityScore: 0.0,
      intentFingerprint: fingerprintByAlias.get(entry.id) ?? '',
    });
  }
  // Remove source's sister links (model can re-add against the new topics).
  s.sisterLinks = s.sisterLinks.filter(
    (l) => l.topicAStableId !== sourceStableId && l.topicBStableId !== sourceStableId,
  );
  // Remove source.
  s.nodesByStableId.delete(sourceStableId);
}

function applyDeleteTopic(s: Scratch, op: DeleteTopicOp, i: number): void {
  const stableId = resolveTopicRef(s, op.id, i, op.type, 'id');
  const node = s.nodesByStableId.get(stableId)!;
  if (typeof op.reason !== 'string' || op.reason.trim().length === 0) {
    fail(i, op.type, `reason must be a non-empty string`);
  }
  // Children must already be re-parented.
  for (const n of s.nodesByStableId.values()) {
    if (n.parentStableId === stableId) {
      fail(i, op.type, `topic "${stableId}" has child "${n.stableId}"; MOVE_TOPIC its children before deleting`);
    }
  }
  if (node.stabilityScore >= STABILITY_RESTRUCTURE_THRESHOLD) {
    const err = checkJustifyShape(op.justifyRestructure);
    if (err) fail(i, op.type, `topic ${stableId} has stabilityScore=${node.stabilityScore} (≥${STABILITY_RESTRUCTURE_THRESHOLD}); ${err}`);
  }
  // Reassign keywords.
  const sourceKeywords = Object.entries(node.keywordPlacements);
  if (op.reassignKeywordsTo === ARCHIVE_LITERAL) {
    for (const [kwId] of sourceKeywords) {
      // Only archive if no OTHER node holds this keyword. Otherwise leave existing placements alone.
      let elsewhere = false;
      for (const other of s.nodesByStableId.values()) {
        if (other.stableId === stableId) continue;
        if (kwId in other.keywordPlacements) { elsewhere = true; break; }
      }
      if (!elsewhere) {
        s.archivedKeywords.push({ keywordId: kwId, reason: op.reason });
      }
    }
  } else {
    const targetStableId = resolveTopicRef(s, op.reassignKeywordsTo, i, op.type, 'reassignKeywordsTo');
    if (targetStableId === stableId) fail(i, op.type, `reassignKeywordsTo cannot be the topic being deleted`);
    const target = s.nodesByStableId.get(targetStableId)!;
    for (const [kwId, placement] of sourceKeywords) {
      if (!(kwId in target.keywordPlacements)) {
        target.keywordPlacements[kwId] = placement;
      }
    }
  }
  // Remove sister links touching the deleted topic.
  s.sisterLinks = s.sisterLinks.filter(
    (l) => l.topicAStableId !== stableId && l.topicBStableId !== stableId,
  );
  // Finally remove the node.
  s.nodesByStableId.delete(stableId);
}

function applyAddKeyword(s: Scratch, op: AddKeywordOp, i: number): void {
  const topicStableId = resolveTopicRef(s, op.topic, i, op.type, 'topic');
  const node = s.nodesByStableId.get(topicStableId)!;
  if (op.placement !== 'primary' && op.placement !== 'secondary') {
    fail(i, op.type, `placement must be "primary" or "secondary"`);
  }
  if (typeof op.keywordId !== 'string' || op.keywordId.length === 0) {
    fail(i, op.type, `keywordId must be a non-empty string`);
  }
  if (op.keywordId in node.keywordPlacements) {
    fail(i, op.type, `keyword "${op.keywordId}" is already placed at topic ${topicStableId}`);
  }
  node.keywordPlacements[op.keywordId] = op.placement;
}

function applyMoveKeyword(s: Scratch, op: MoveKeywordOp, i: number): void {
  const fromStableId = resolveTopicRef(s, op.from, i, op.type, 'from');
  const toStableId = resolveTopicRef(s, op.to, i, op.type, 'to');
  if (fromStableId === toStableId) fail(i, op.type, `from and to must differ`);
  if (op.placement !== 'primary' && op.placement !== 'secondary') {
    fail(i, op.type, `placement must be "primary" or "secondary"`);
  }
  const fromNode = s.nodesByStableId.get(fromStableId)!;
  const toNode = s.nodesByStableId.get(toStableId)!;
  if (!(op.keywordId in fromNode.keywordPlacements)) {
    fail(i, op.type, `keyword "${op.keywordId}" is not placed at topic ${fromStableId}`);
  }
  if (op.keywordId in toNode.keywordPlacements) {
    fail(i, op.type, `keyword "${op.keywordId}" is already placed at topic ${toStableId}`);
  }
  delete fromNode.keywordPlacements[op.keywordId];
  toNode.keywordPlacements[op.keywordId] = op.placement;
}

function applyRemoveKeyword(s: Scratch, op: RemoveKeywordOp, i: number): void {
  const fromStableId = resolveTopicRef(s, op.from, i, op.type, 'from');
  const fromNode = s.nodesByStableId.get(fromStableId)!;
  if (!(op.keywordId in fromNode.keywordPlacements)) {
    fail(i, op.type, `keyword "${op.keywordId}" is not placed at topic ${fromStableId}`);
  }
  // Must have at least one OTHER placement somewhere on the canvas.
  let elsewhere = false;
  for (const other of s.nodesByStableId.values()) {
    if (other.stableId === fromStableId) continue;
    if (op.keywordId in other.keywordPlacements) { elsewhere = true; break; }
  }
  if (!elsewhere) {
    fail(i, op.type, `keyword "${op.keywordId}" has only this placement; use ARCHIVE_KEYWORD instead`);
  }
  delete fromNode.keywordPlacements[op.keywordId];
}

function applyArchiveKeyword(s: Scratch, op: ArchiveKeywordOp, i: number): void {
  if (typeof op.keywordId !== 'string' || op.keywordId.length === 0) {
    fail(i, op.type, `keywordId must be a non-empty string`);
  }
  if (typeof op.reason !== 'string' || op.reason.trim().length === 0) {
    fail(i, op.type, `reason must be a non-empty string`);
  }
  // Remove every placement of this keyword across the canvas.
  for (const node of s.nodesByStableId.values()) {
    if (op.keywordId in node.keywordPlacements) {
      delete node.keywordPlacements[op.keywordId];
    }
  }
  s.archivedKeywords.push({ keywordId: op.keywordId, reason: op.reason });
}

function applyAddSisterLink(s: Scratch, op: AddSisterLinkOp, i: number): void {
  const aId = resolveTopicRef(s, op.topicA, i, op.type, 'topicA');
  const bId = resolveTopicRef(s, op.topicB, i, op.type, 'topicB');
  if (aId === bId) fail(i, op.type, `topicA and topicB must differ`);
  // Canonicalize for storage and dedupe.
  const [first, second] = aId < bId ? [aId, bId] : [bId, aId];
  for (const link of s.sisterLinks) {
    if (link.topicAStableId === first && link.topicBStableId === second) {
      fail(i, op.type, `sister link between ${first} and ${second} already exists`);
    }
  }
  s.sisterLinks.push({ topicAStableId: first, topicBStableId: second });
}

function applyRemoveSisterLink(s: Scratch, op: RemoveSisterLinkOp, i: number): void {
  const aId = resolveTopicRef(s, op.topicA, i, op.type, 'topicA');
  const bId = resolveTopicRef(s, op.topicB, i, op.type, 'topicB');
  const [first, second] = aId < bId ? [aId, bId] : [bId, aId];
  const idx = s.sisterLinks.findIndex(
    (l) => l.topicAStableId === first && l.topicBStableId === second,
  );
  if (idx === -1) fail(i, op.type, `sister link between ${first} and ${second} does not exist`);
  s.sisterLinks.splice(idx, 1);
}

// ============================================================
// Post-application invariants
// ============================================================

function runInvariants(s: Scratch, originalKeywordIds: Set<KeywordId>): void {
  // 1. Stable IDs unique by construction (Map enforces). Skip explicit check.

  // 2. Every non-root has a parent that exists; no cycles.
  for (const n of s.nodesByStableId.values()) {
    if (n.parentStableId !== null && !s.nodesByStableId.has(n.parentStableId)) {
      throw new ApplyAbort({
        opIndex: -1,
        opType: 'INVARIANT',
        message: `topic "${n.stableId}" has parent "${n.parentStableId}" that does not exist`,
      });
    }
  }
  checkParentChainAcyclic(s);

  // 3. Sister links reference real nodes; no self-links.
  for (const link of s.sisterLinks) {
    if (!s.nodesByStableId.has(link.topicAStableId)) {
      throw new ApplyAbort({
        opIndex: -1,
        opType: 'INVARIANT',
        message: `sister link references missing topic "${link.topicAStableId}"`,
      });
    }
    if (!s.nodesByStableId.has(link.topicBStableId)) {
      throw new ApplyAbort({
        opIndex: -1,
        opType: 'INVARIANT',
        message: `sister link references missing topic "${link.topicBStableId}"`,
      });
    }
    if (link.topicAStableId === link.topicBStableId) {
      throw new ApplyAbort({
        opIndex: -1,
        opType: 'INVARIANT',
        message: `sister link is a self-link on "${link.topicAStableId}"`,
      });
    }
  }

  // 4. No keyword from the original state has been silently lost.
  //    Every original keyword must be either placed somewhere OR archived in this batch.
  const archivedSet = new Set(s.archivedKeywords.map((a) => a.keywordId));
  const placed = indexKeywordPlacements(s);
  for (const kw of originalKeywordIds) {
    if (placed.has(kw)) continue;
    if (archivedSet.has(kw)) continue;
    throw new ApplyAbort({
      opIndex: -1,
      opType: 'INVARIANT',
      message: `keyword "${kw}" from the original state is no longer placed and was not archived`,
    });
  }
}

// ============================================================
// Entry point
// ============================================================

/**
 * Optional second-arg for {@link applyOperations}.
 *
 * `consolidationMode` — Scale Session E, INPUT_CONTEXT_SCALING_DESIGN.md §4.1
 * Cluster 4 Q14 lock. When `true`, ADD_TOPIC and ADD_KEYWORD are rejected
 * with an explicit error. The consolidation pass restructures existing
 * topics; it does not introduce new topics or new keywords. Defense in
 * depth — the consolidation prompt also instructs the AI not to emit these,
 * but the applier-side rejection means a stray emission fails atomically
 * rather than silently changing the canvas in a way the consolidation
 * contract forbids.
 *
 * `regularBatchMode` — Recency-stickiness fix, INPUT_CONTEXT_SCALING_DESIGN.md
 * §6 Scale Session E D3 partial validation outcome (sister-link op deferral
 * to consolidation-only). When `true`, ADD_SISTER_LINK and REMOVE_SISTER_LINK
 * are rejected with an explicit error. Sister links are inherently
 * full-canvas decisions; emitting them in 8-keyword regular batches inflated
 * per-batch touch counts and force-pinned every endpoint to Tier 0 for the
 * recency window, defeating tiered serialization's compression goal. They now
 * live exclusively in the consolidation pass. Defense in depth — the regular
 * V4 prompt's operation vocabulary drops these two ops, and the applier-side
 * rejection means a stray emission fails atomically rather than silently
 * over-touching topics in a way that compounds across batches.
 *
 * `consolidationMode` and `regularBatchMode` are mutually exclusive. Setting
 * both `true` is a programming error and is rejected immediately. Setting
 * neither is allowed for callers that don't need either restriction (the
 * preview/validation call site, tests, and any non-AutoAnalyze caller).
 */
export interface ApplyOptions {
  consolidationMode?: boolean;
  regularBatchMode?: boolean;
}

const CONSOLIDATION_FORBIDDEN_OPS = new Set<Operation['type']>([
  'ADD_TOPIC',
  'ADD_KEYWORD',
]);

const REGULAR_BATCH_FORBIDDEN_OPS = new Set<Operation['type']>([
  'ADD_SISTER_LINK',
  'REMOVE_SISTER_LINK',
]);

export function applyOperations(
  state: CanvasState,
  operations: Operation[],
  options?: ApplyOptions,
): ApplyResult {
  // Capture original keyword set BEFORE any mutation so the invariant
  // check has a baseline to compare against.
  const originalKeywordIds = new Set<KeywordId>();
  for (const n of state.nodes) {
    for (const kw of Object.keys(n.keywordPlacements)) {
      originalKeywordIds.add(kw);
    }
  }

  let scratch: Scratch;
  try {
    scratch = buildScratch(state);
  } catch (err) {
    if (err instanceof ApplyAbort) return { ok: false, errors: [err.detail] };
    throw err;
  }

  const consolidationMode = options?.consolidationMode === true;
  const regularBatchMode = options?.regularBatchMode === true;

  if (consolidationMode && regularBatchMode) {
    return {
      ok: false,
      errors: [{
        opIndex: -1,
        opType: 'INVARIANT',
        message: 'consolidationMode and regularBatchMode are mutually exclusive — set at most one',
      }],
    };
  }

  try {
    operations.forEach((op, i) => {
      if (consolidationMode && CONSOLIDATION_FORBIDDEN_OPS.has(op.type)) {
        fail(
          i,
          op.type,
          `${op.type} is not allowed in consolidation mode (consolidation only restructures existing topics; it does not introduce new ones)`,
        );
      }
      if (regularBatchMode && REGULAR_BATCH_FORBIDDEN_OPS.has(op.type)) {
        fail(
          i,
          op.type,
          `${op.type} is not allowed in regular batch mode (sister links are full-canvas decisions; emit them in the consolidation pass instead)`,
        );
      }
      switch (op.type) {
        case 'ADD_TOPIC': return applyAddTopic(scratch, op, i);
        case 'UPDATE_TOPIC_TITLE': return applyUpdateTopicTitle(scratch, op, i);
        case 'UPDATE_TOPIC_DESCRIPTION': return applyUpdateTopicDescription(scratch, op, i);
        case 'MOVE_TOPIC': return applyMoveTopic(scratch, op, i);
        case 'MERGE_TOPICS': return applyMergeTopics(scratch, op, i);
        case 'SPLIT_TOPIC': return applySplitTopic(scratch, op, i);
        case 'DELETE_TOPIC': return applyDeleteTopic(scratch, op, i);
        case 'ADD_KEYWORD': return applyAddKeyword(scratch, op, i);
        case 'MOVE_KEYWORD': return applyMoveKeyword(scratch, op, i);
        case 'REMOVE_KEYWORD': return applyRemoveKeyword(scratch, op, i);
        case 'ARCHIVE_KEYWORD': return applyArchiveKeyword(scratch, op, i);
        case 'ADD_SISTER_LINK': return applyAddSisterLink(scratch, op, i);
        case 'REMOVE_SISTER_LINK': return applyRemoveSisterLink(scratch, op, i);
        default: {
          const _exhaustive: never = op;
          fail(i, (_exhaustive as { type: string }).type ?? 'UNKNOWN', `unknown operation type`);
        }
      }
    });
    runInvariants(scratch, originalKeywordIds);
  } catch (err) {
    if (err instanceof ApplyAbort) return { ok: false, errors: [err.detail] };
    throw err;
  }

  const newState: CanvasState = {
    nodes: Array.from(scratch.nodesByStableId.values()),
    sisterLinks: scratch.sisterLinks,
    nextStableIdCounter: scratch.nextStableIdCounter,
  };
  const aliasResolutions: Record<Alias, StableId> = {};
  for (const [alias, stableId] of scratch.aliasResolutions) {
    aliasResolutions[alias] = stableId;
  }

  return {
    ok: true,
    newState,
    archivedKeywords: scratch.archivedKeywords,
    aliasResolutions,
  };
}
