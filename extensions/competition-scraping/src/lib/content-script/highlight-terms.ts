// Live-page Highlight Terms application. P-5 fix 2026-05-08-d.
//
// Reads the current Project's highlight-terms list from chrome.storage.local
// (per popup-state.ts) and wraps every matching token on the host page in a
// <mark class="plos-cs-highlight"> with the user's chosen color. Re-applies
// on storage changes (so editing terms in the popup updates the page live)
// and on DOM mutations (so SPA navigation + infinite-scroll keep highlights
// in sync). Cleans up on orchestrator teardown.
//
// Match rules (per P-5 design Read-It-Back 2026-05-08-d):
//   - Case-insensitive
//   - Word-boundary anchored (\b) — "cat" does NOT match "category"
//   - Multi-word terms broaden literal spaces to \s+ so they match across
//     non-breaking-space / multi-space / line-break variations
//   - Longest-first ordering so "red light therapy" beats "red" on the
//     same span
//
// Skipped subtrees (never highlight inside): script/style/noscript/textarea/
// input/iframe/svg/math/code/pre, contenteditable elements, and our own
// .plos-cs-* UI surface.
//
// Performance guards: soft cap of 50 terms (warn beyond); skip pages with
// document.body.textContent length > 500KB (typical Amazon search-results
// is ~50KB).

import type { HighlightTerm } from '../highlight-terms.ts';
import { getHighlightTerms } from '../popup-state.ts';
import { getContrastTextColor } from '../color-palette.ts';

const HIGHLIGHT_CLASS = 'plos-cs-highlight';
const ATTR_HIGHLIGHT_TERM = 'data-plos-cs-highlight-term';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEXTAREA',
  'INPUT',
  'IFRAME',
  'SVG',
  'MATH',
  'CODE',
  'PRE',
]);
const SKIP_PLOS_CS_PREFIX = 'plos-cs-';

// Soft cap on number of terms before we warn + truncate. Real users have <10.
const MAX_TERMS = 50;
// Page text length cap. Pathological pages (~MB-scale) skip highlighting.
const MAX_BODY_TEXT_LEN_BYTES = 500_000;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a combined regex for all non-blank terms, sorted longest-first so
 * alternation prefers multi-word terms over their substrings. Returns null
 * for empty / all-blank input — caller should bail without DOM walking.
 *
 * Exported for unit testing.
 */
export function buildHighlightRegex(
  terms: readonly HighlightTerm[],
): RegExp | null {
  if (!terms || terms.length === 0) return null;
  const trimmed = terms
    .map((t) => t?.term?.trim())
    .filter((t): t is string => typeof t === 'string' && t.length > 0);
  if (trimmed.length === 0) return null;
  trimmed.sort((a, b) => b.length - a.length);
  const alternatives = trimmed
    .map((t) => escapeRegex(t).replace(/ /g, '\\s+'));
  return new RegExp(`\\b(?:${alternatives.join('|')})\\b`, 'gi');
}

/**
 * Lower-cased term → color hex. Later entries win on case-collision (matches
 * the popup's case-insensitive dedup behavior in mergeWithExisting).
 */
export function buildColorMap(
  terms: readonly HighlightTerm[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const t of terms) {
    if (!t?.term?.trim()) continue;
    map.set(t.term.trim().toLowerCase(), t.color);
  }
  return map;
}

function isPlosOwnElement(el: Element): boolean {
  for (const cls of el.classList) {
    if (cls.startsWith(SKIP_PLOS_CS_PREFIX)) return true;
  }
  return false;
}

function shouldSkipSubtree(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (isPlosOwnElement(el)) return true;
  if (el.classList.contains(HIGHLIGHT_CLASS)) return true;
  const ce = el.getAttribute('contenteditable');
  if (ce !== null && ce !== 'false') return true;
  return false;
}

/**
 * Walks `root`, wrapping every matching token in a <mark>. Skips text nodes
 * whose ancestor chain hits any skip-condition (per shouldSkipSubtree).
 */
export function applyHighlightsTo(
  root: Node,
  regex: RegExp,
  colorMap: Map<string, string>,
): void {
  if (!root) return;
  const source = regex.source;
  const flags = regex.flags;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = (node as Text).parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      let cur: Element | null = parent;
      while (cur) {
        if (shouldSkipSubtree(cur)) return NodeFilter.FILTER_REJECT;
        if (cur === root) break;
        cur = cur.parentElement;
      }
      if (!node.nodeValue || node.nodeValue.trim().length === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: Text[] = [];
  let node: Node | null = walker.nextNode();
  while (node) {
    targets.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of targets) {
    wrapMatchesInTextNode(textNode, source, flags, colorMap);
  }
}

function wrapMatchesInTextNode(
  textNode: Text,
  source: string,
  flags: string,
  colorMap: Map<string, string>,
): void {
  const text = textNode.nodeValue;
  if (!text) return;
  const re = new RegExp(source, flags);
  const matches: { start: number; end: number; matched: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      matched: m[0],
    });
    if (m[0].length === 0) re.lastIndex++;
  }
  if (matches.length === 0) return;

  const frag = document.createDocumentFragment();
  let cursor = 0;
  for (const mm of matches) {
    if (mm.start > cursor) {
      frag.appendChild(document.createTextNode(text.slice(cursor, mm.start)));
    }
    const mark = document.createElement('mark');
    mark.className = HIGHLIGHT_CLASS;
    mark.setAttribute(ATTR_HIGHLIGHT_TERM, mm.matched);
    const colorHex = colorMap.get(mm.matched.trim().toLowerCase());
    if (colorHex) {
      mark.style.backgroundColor = colorHex;
      mark.style.color = getContrastTextColor(colorHex);
    }
    mark.textContent = mm.matched;
    frag.appendChild(mark);
    cursor = mm.end;
  }
  if (cursor < text.length) {
    frag.appendChild(document.createTextNode(text.slice(cursor)));
  }
  textNode.replaceWith(frag);
}

/**
 * Strips every .plos-cs-highlight span from `root`, restoring original text.
 * .normalize() merges the freshly-adjacent text nodes so subsequent walks
 * see clean text.
 */
export function removeAllHighlights(root: Element = document.body): void {
  if (!root) return;
  const marks = root.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  const parentsToNormalize = new Set<Element>();
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    const text = mark.textContent ?? '';
    parent.replaceChild(document.createTextNode(text), mark);
    if (parent instanceof Element) parentsToNormalize.add(parent);
  });
  parentsToNormalize.forEach((p) => p.normalize());
}

export interface LiveHighlightController {
  /** Re-runs the highlight pass — strips existing highlights then re-applies
   * with the current term list. Idempotent and safe to call repeatedly. */
  refresh(): Promise<void>;
  /** Stops live updates + clears all current highlights. */
  destroy(): void;
}

/**
 * Starts live highlight-terms application for `projectId`. Returns a
 * controller; orchestrator calls .refresh() on its MutationObserver tick
 * and on SPA navigation, and .destroy() on teardown.
 *
 * Boot sequence:
 *   1. Load terms from chrome.storage.local (one read).
 *   2. Schedule the initial DOM walk via requestIdleCallback (graceful on
 *      pages still painting).
 *   3. Attach chrome.storage.onChanged listener so popup edits push live.
 */
export async function startLiveHighlighting(
  projectId: string,
): Promise<LiveHighlightController> {
  let currentTerms: HighlightTerm[] = [];
  let currentRegex: RegExp | null = null;
  let currentColorMap: Map<string, string> = new Map();
  let destroyed = false;

  async function reload(): Promise<void> {
    if (destroyed) return;
    let loaded = await getHighlightTerms(projectId);
    if (loaded.length > MAX_TERMS) {
      // Soft cap with a console warning — stays out of the user's way but
      // surfaces the unusual term count for debugging.
      console.warn(
        `[PLOS] highlightTerms count (${loaded.length}) exceeds soft cap (${MAX_TERMS}); only the first ${MAX_TERMS} will highlight.`,
      );
      loaded = loaded.slice(0, MAX_TERMS);
    }
    currentTerms = loaded;
    currentRegex = buildHighlightRegex(currentTerms);
    currentColorMap = buildColorMap(currentTerms);
  }

  function pageTooLarge(): boolean {
    const text = document.body?.textContent ?? '';
    if (text.length > MAX_BODY_TEXT_LEN_BYTES) {
      console.warn(
        `[PLOS] page text length (${text.length}) exceeds highlight cap (${MAX_BODY_TEXT_LEN_BYTES}); skipping highlight pass.`,
      );
      return true;
    }
    return false;
  }

  async function refresh(): Promise<void> {
    if (destroyed) return;
    if (!currentRegex) {
      // Term list went empty (e.g., user cleared all). Strip any leftover
      // highlights from a previous pass.
      removeAllHighlights();
      return;
    }
    if (pageTooLarge()) return;
    removeAllHighlights();
    applyHighlightsTo(document.body, currentRegex, currentColorMap);
  }

  await reload();

  const win = window as Window & {
    requestIdleCallback?: (cb: () => void) => void;
  };
  if (typeof win.requestIdleCallback === 'function') {
    win.requestIdleCallback(() => {
      void refresh();
    });
  } else {
    setTimeout(() => {
      void refresh();
    }, 0);
  }

  const STORAGE_KEY = `highlightTerms:${projectId}`;
  const onStorageChanged = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: chrome.storage.AreaName,
  ): void => {
    if (areaName !== 'local') return;
    if (!(STORAGE_KEY in changes)) return;
    void (async () => {
      await reload();
      void refresh();
    })();
  };
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener(onStorageChanged);
  }

  return {
    refresh,
    destroy(): void {
      destroyed = true;
      if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(onStorageChanged);
      }
      removeAllHighlights();
    },
  };
}
