// P-25 captured-text selector encode/decode.
//
// Each saved CapturedText row carries an opaque `selector` string the
// server persists verbatim. The string is a JSON-encoded triple:
//
//   {
//     xpath:        relative path from `root` (typically document.body) to
//                   the deepest common ELEMENT ancestor of the user's
//                   selection range,
//     startOffset:  character offset of range.start within the textContent
//                   of that anchor element (flattened across all text-node
//                   descendants in document order),
//     endOffset:    character offset of range.end within the same.
//   }
//
// On serialize, the range's start/end (possibly text nodes) get their
// position in the anchor's flattened text computed.
//
// On deserialize, the xpath is walked element-by-element from `root`; the
// anchor's text-node descendants are scanned in order accumulating
// character counts; the start/end text nodes + intra-node offsets are
// recovered.
//
// DOM mismatch (page restructured, anchor missing, offsets past end of
// flattened text) returns `null` — the caller treats this as "haze can't
// be rendered for this saved row; show nothing." Same v1 limitation
// pattern as P-24 saved-image-indicator on rows without a stored
// originalSrcUrl.
//
// The xpath grammar is intentionally tiny — element tag + 1-based index
// within parent (`/DIV[1]/P[3]/SPAN[1]`) — so the helper can be tested
// without jsdom by hand-building Element-shaped objects. We do NOT use
// `document.evaluate` so the helper works identically in node:test stubs
// and real Chrome content-script context.

/** Shape parsed out of the serialized selector string. */
export interface ParsedSelector {
  xpath: string;
  startOffset: number;
  endOffset: number;
}

/**
 * Stringifies the selector triple. Always emits a compact JSON string with
 * stable field order so unit tests can compare exact strings.
 */
export function encodeSelector(selector: ParsedSelector): string {
  return JSON.stringify({
    xpath: selector.xpath,
    startOffset: selector.startOffset,
    endOffset: selector.endOffset,
  });
}

/**
 * Parses a serialized selector string. Returns null on any malformed
 * input (non-JSON, missing keys, wrong types, negative offsets,
 * end-before-start) so callers can silently skip bad rows rather than
 * propagating errors that would break the entire scan.
 */
export function decodeSelector(json: string): ParsedSelector | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  if (
    typeof obj.xpath !== 'string' ||
    typeof obj.startOffset !== 'number' ||
    typeof obj.endOffset !== 'number'
  ) {
    return null;
  }
  if (
    !Number.isFinite(obj.startOffset) ||
    !Number.isFinite(obj.endOffset) ||
    obj.startOffset < 0 ||
    obj.endOffset < obj.startOffset
  ) {
    return null;
  }
  return {
    xpath: obj.xpath,
    startOffset: obj.startOffset,
    endOffset: obj.endOffset,
  };
}

// ─── XPath grammar (element-only, 1-based positional) ────────────────────
//
// We accept `/TAG[N]/TAG[N]/...` strings where each segment is an uppercase
// HTML tag name + an optional `[N]` 1-based index. Missing `[N]` defaults
// to 1. Leading slash is required; empty path means "root itself."

/** One step in an xpath: tag name + 1-based child index. */
export interface XPathStep {
  tagName: string;
  index: number;
}

/**
 * Parses the `/TAG[N]/TAG[N]/...` grammar into steps. Returns null on
 * malformed input.
 */
export function parseXPath(xpath: string): XPathStep[] | null {
  if (xpath === '' || xpath === '/') return [];
  if (!xpath.startsWith('/')) return null;
  const segments = xpath.slice(1).split('/');
  const steps: XPathStep[] = [];
  for (const seg of segments) {
    if (seg.length === 0) return null;
    const match = /^([A-Z][A-Z0-9_-]*)(?:\[(\d+)\])?$/.exec(seg);
    if (!match) return null;
    const tagName = match[1];
    if (typeof tagName !== 'string') return null;
    const indexRaw = match[2];
    const index = indexRaw === undefined ? 1 : parseInt(indexRaw, 10);
    if (!Number.isFinite(index) || index < 1) return null;
    steps.push({ tagName, index });
  }
  return steps;
}

/**
 * Inverse of parseXPath — joins steps back into the `/TAG[N]/...` form.
 */
export function formatXPath(steps: XPathStep[]): string {
  if (steps.length === 0) return '';
  return (
    '/' + steps.map((s) => `${s.tagName}[${s.index}]`).join('/')
  );
}

// ─── Element-only abstraction used by the helper ─────────────────────────
//
// The helper operates on this minimal interface so unit tests can supply
// hand-built stubs (mirroring find-underlying-image.test.ts's approach).
// At Chrome runtime these are real DOM Elements + Text nodes.

/** Minimum surface for both Element and Text the helper needs. */
export interface SelectorNode {
  /** 1 = ELEMENT_NODE, 3 = TEXT_NODE (matches DOM Node.nodeType). */
  nodeType: number;
}

export interface SelectorElement extends SelectorNode {
  nodeType: 1;
  /** Uppercased HTML tag name (e.g., "DIV"). */
  tagName: string;
  /** Child nodes in document order. Subset includes both elements and text nodes. */
  childNodes: SelectorNode[];
  parentNode: SelectorElement | null;
}

export interface SelectorText extends SelectorNode {
  nodeType: 3;
  /** Text content (matches Text.data / Text.nodeValue). */
  data: string;
  parentNode: SelectorElement | null;
}

export function isElement(n: SelectorNode | null): n is SelectorElement {
  return n !== null && n.nodeType === 1;
}

export function isText(n: SelectorNode | null): n is SelectorText {
  return n !== null && n.nodeType === 3;
}

/**
 * Walks an xpath against a root element, returning the resolved element or
 * null if any step doesn't match (wrong tag, index past end of matching
 * siblings).
 *
 * Empty step list returns `root` itself.
 */
export function resolveXPath(
  root: SelectorElement,
  steps: XPathStep[]
): SelectorElement | null {
  let current: SelectorElement = root;
  for (const step of steps) {
    let countOfTag = 0;
    let next: SelectorElement | null = null;
    for (const child of current.childNodes) {
      if (!isElement(child)) continue;
      if (child.tagName === step.tagName) {
        countOfTag += 1;
        if (countOfTag === step.index) {
          next = child;
          break;
        }
      }
    }
    if (next === null) return null;
    current = next;
  }
  return current;
}

/**
 * Computes the xpath FROM `root` TO `target`. Returns null if target is
 * not a descendant of root.
 */
export function computeXPath(
  root: SelectorElement,
  target: SelectorElement
): string | null {
  if (target === root) return '';
  const steps: XPathStep[] = [];
  let cursor: SelectorElement | null = target;
  while (cursor !== null && cursor !== root) {
    const parent: SelectorElement | null = cursor.parentNode;
    if (parent === null) return null;
    let index = 0;
    let found = false;
    for (const child of parent.childNodes) {
      if (!isElement(child)) continue;
      if (child.tagName === cursor.tagName) {
        index += 1;
        if (child === cursor) {
          found = true;
          break;
        }
      }
    }
    if (!found) return null;
    steps.unshift({ tagName: cursor.tagName, index });
    cursor = parent;
  }
  if (cursor !== root) return null;
  return formatXPath(steps);
}

/**
 * Walks all descendant text nodes of `anchor` in document order and
 * returns them as an array. Used to convert (textNode, offset-in-node)
 * coordinates to (flattened-character-offset) coordinates and back.
 */
export function collectTextNodes(anchor: SelectorElement): SelectorText[] {
  const out: SelectorText[] = [];
  function walk(node: SelectorNode): void {
    if (isText(node)) {
      out.push(node);
      return;
    }
    if (isElement(node)) {
      for (const child of node.childNodes) walk(child);
    }
  }
  walk(anchor);
  return out;
}

/**
 * Returns the character offset of (`node`, `offsetInNode`) within
 * `anchor`'s flattened text content. `node` may be the anchor element
 * itself (in which case `offsetInNode` is the child-node index within
 * anchor.childNodes) OR a Text descendant (in which case `offsetInNode`
 * is the character offset within that text node's data).
 *
 * Returns null when the node isn't `anchor` or a descendant text node.
 */
export function flattenedOffsetWithin(
  anchor: SelectorElement,
  node: SelectorNode,
  offsetInNode: number
): number | null {
  if (node === anchor && isElement(node)) {
    // For element-anchored ranges, offsetInNode is a child-index. We sum
    // text lengths of the first `offsetInNode` children.
    let chars = 0;
    for (let i = 0; i < node.childNodes.length && i < offsetInNode; i += 1) {
      const child = node.childNodes[i];
      if (child === undefined) break;
      chars += textLengthOf(child);
    }
    return chars;
  }
  if (!isText(node)) return null;
  const allTexts = collectTextNodes(anchor);
  let accum = 0;
  for (const t of allTexts) {
    if (t === node) return accum + offsetInNode;
    accum += t.data.length;
  }
  return null;
}

/**
 * Recovers (textNode, offset-in-node) from a flattened character offset
 * within `anchor`. Returns null when the offset is past the end of
 * anchor's flattened text (DOM shrunk since selector was saved).
 *
 * When the offset lands exactly at the end of the last text node, returns
 * (lastTextNode, lastTextNode.data.length) — this is the canonical
 * "end-of-text" placement Range accepts.
 */
export function nodeAtFlattenedOffset(
  anchor: SelectorElement,
  flattenedOffset: number
): { node: SelectorText; offsetInNode: number } | null {
  if (flattenedOffset < 0) return null;
  const allTexts = collectTextNodes(anchor);
  if (allTexts.length === 0) return null;
  let accum = 0;
  for (const t of allTexts) {
    if (flattenedOffset <= accum + t.data.length) {
      return { node: t, offsetInNode: flattenedOffset - accum };
    }
    accum += t.data.length;
  }
  return null;
}

function textLengthOf(node: SelectorNode): number {
  if (isText(node)) return node.data.length;
  if (isElement(node)) {
    let total = 0;
    for (const child of node.childNodes) total += textLengthOf(child);
    return total;
  }
  return 0;
}

/**
 * Finds the deepest common element ancestor of two nodes. Returns null
 * if they aren't both descendants of a single shared root.
 */
export function deepestCommonElementAncestor(
  a: SelectorNode,
  b: SelectorNode
): SelectorElement | null {
  const ancestorsA = new Set<SelectorElement>();
  let cursor: SelectorElement | null = elementSelfOrParent(a);
  while (cursor !== null) {
    ancestorsA.add(cursor);
    cursor = cursor.parentNode;
  }
  cursor = elementSelfOrParent(b);
  while (cursor !== null) {
    if (ancestorsA.has(cursor)) return cursor;
    cursor = cursor.parentNode;
  }
  return null;
}

/**
 * If the node IS an element, return it. Otherwise (text node) return its
 * parent element. Used by deepestCommonElementAncestor so that a range
 * anchored on an element (e.g., range.startContainer is the DIV itself)
 * resolves to that DIV instead of the DIV's parent.
 */
function elementSelfOrParent(node: SelectorNode): SelectorElement | null {
  if (isElement(node)) return node;
  if (isText(node)) return node.parentNode ?? null;
  return null;
}

// ─── High-level serialize/deserialize against real DOM Range ─────────────
//
// These wrappers convert real DOM Range objects to/from our SelectorNode
// abstraction. They're written so node:test environments without a global
// Range can still exercise the serialization logic via the lower-level
// functions above.

/**
 * High-level serializer: takes a real DOM Range and a root element
 * (default document.body), produces a ParsedSelector or null.
 *
 * Returns null when the range spans nodes that aren't both inside root.
 */
export function serializeRangeToSelector(
  range: Range,
  root: Element
): ParsedSelector | null {
  // Real DOM nodes already match the SelectorNode shape closely enough at
  // runtime — childNodes is iterable, nodeType/tagName/parentNode/data
  // all line up. Cast through unknown to satisfy strict TS without
  // importing dom-types from lib.dom into our pure-logic module.
  const startContainer = range.startContainer as unknown as SelectorNode;
  const endContainer = range.endContainer as unknown as SelectorNode;
  const rootNode = root as unknown as SelectorElement;

  const anchor = deepestCommonElementAncestor(startContainer, endContainer);
  if (anchor === null) return null;
  // Anchor must be inside (or equal to) root for the xpath to be
  // resolvable later.
  if (!isAncestorOrSelf(rootNode, anchor)) return null;

  const xpath = computeXPath(rootNode, anchor);
  if (xpath === null) return null;

  const startOffset = flattenedOffsetWithin(
    anchor,
    startContainer,
    range.startOffset
  );
  const endOffset = flattenedOffsetWithin(
    anchor,
    endContainer,
    range.endOffset
  );
  if (startOffset === null || endOffset === null) return null;
  if (endOffset < startOffset) return null;

  return { xpath, startOffset, endOffset };
}

/**
 * High-level deserializer: takes a ParsedSelector and a root element,
 * returns a real DOM Range or null on any mismatch.
 *
 * The Range constructor is referenced indirectly so node:test environments
 * without a global Range can be exercised via the lower-level functions
 * (collectTextNodes / nodeAtFlattenedOffset) without crashing this module
 * at import time.
 */
export function deserializeSelectorToRange(
  selector: ParsedSelector,
  root: Element,
  // Optional Range constructor injection for testability.
  RangeCtor: { new (): Range } | undefined = typeof Range !== 'undefined'
    ? Range
    : undefined
): Range | null {
  if (RangeCtor === undefined) return null;
  const steps = parseXPath(selector.xpath);
  if (steps === null) return null;
  const rootNode = root as unknown as SelectorElement;
  const anchor = resolveXPath(rootNode, steps);
  if (anchor === null) return null;

  const start = nodeAtFlattenedOffset(anchor, selector.startOffset);
  const end = nodeAtFlattenedOffset(anchor, selector.endOffset);
  if (start === null || end === null) return null;

  const range = new RangeCtor();
  range.setStart(
    start.node as unknown as Node,
    start.offsetInNode
  );
  range.setEnd(end.node as unknown as Node, end.offsetInNode);
  return range;
}

function isAncestorOrSelf(
  root: SelectorElement,
  candidate: SelectorElement
): boolean {
  let cursor: SelectorElement | null = candidate;
  while (cursor !== null) {
    if (cursor === root) return true;
    cursor = cursor.parentNode;
  }
  return false;
}
