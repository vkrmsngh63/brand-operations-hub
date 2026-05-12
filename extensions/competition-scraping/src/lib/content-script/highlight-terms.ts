// Live-page Highlight Terms application. P-5 fix 2026-05-08-d.
// P-9 fix 2026-05-10: chunked/incremental application via requestIdleCallback
// removed the prior 500KB body-text cap that was blocking Highlight Terms on
// Ebay (~1.5MB) + Walmart (~636KB) pages and firing repeated console.warn
// entries on Walmart's heavy-SPA pages.
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
// Performance model (P-9 fix 2026-05-10):
//   - Chunked text-node processing with yields between chunks via
//     requestIdleCallback. Each chunk is sized to fit comfortably within
//     a single frame budget (~16ms) on typical pages.
//   - Last-wins refresh cancellation: a new refresh() cancels any in-flight
//     pass before starting. Prevents stale highlights from a previous pass
//     racing against newly-rendered SPA content.
//   - Soft cap of 50 terms (warn beyond) — real users have <10. No body-
//     text-length cap; chunking handles arbitrary-size pages gracefully.

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

// P-9 fix 2026-05-10: chunk size for the wrap-matches phase. Sized so each
// chunk takes ~10-15ms of main-thread time on typical pages (text-node wrap
// is ~25μs each), then yields to the event loop. Tunable via processInChunks
// `options.chunkSize` for tests + future tuning.
const APPLY_CHUNK_SIZE_DEFAULT = 500;

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
 * P-9 fix 2026-05-10: cancellation signal passed to chunked operations.
 * Setting `.cancelled = true` causes `processInChunks` to return early at
 * the next chunk boundary. Prevents partial-state races when a new
 * refresh() supersedes an in-flight pass.
 */
export interface CancellationSignal {
  cancelled: boolean;
}

export interface ProcessInChunksOptions {
  /** Number of items processed before yielding to the event loop. */
  chunkSize?: number;
  /** Cancellation signal — checked between chunks. */
  signal?: CancellationSignal;
  /**
   * Yield function to call between chunks. Default: requestIdleCallback
   * with setTimeout(0) fallback. Pluggable for unit testing without
   * requiring the browser idle-callback API.
   */
  yieldFn?: () => Promise<void>;
}

/**
 * P-9 fix 2026-05-10: process `items` synchronously in batches of
 * `chunkSize`, awaiting `yieldFn()` between batches so the main thread
 * stays responsive on large lists. Honors a cancellation signal — if
 * `signal.cancelled` becomes true mid-pass, returns at the next chunk
 * boundary without processing remaining items.
 *
 * Exported for unit testing of the chunk-and-yield logic in isolation.
 */
export async function processInChunks<T>(
  items: readonly T[],
  processItem: (item: T) => void,
  options: ProcessInChunksOptions = {},
): Promise<void> {
  const chunkSize = options.chunkSize ?? APPLY_CHUNK_SIZE_DEFAULT;
  const signal = options.signal;
  const yieldFn = options.yieldFn ?? scheduleYield;
  let processed = 0;
  for (const item of items) {
    if (signal?.cancelled) return;
    processItem(item);
    processed++;
    // Yield AFTER processing the chunk-size-th item, but only if more
    // items remain — avoids a wasted yield at the very end.
    if (processed % chunkSize === 0 && processed < items.length) {
      await yieldFn();
    }
  }
}

/**
 * Yields to the event loop via requestIdleCallback if available, else
 * setTimeout(0). Both give the browser a chance to paint + handle other
 * work before the next chunk runs.
 */
function scheduleYield(): Promise<void> {
  return new Promise((resolve) => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      win.requestIdleCallback(() => resolve());
    } else {
      setTimeout(() => resolve(), 0);
    }
  });
}

/**
 * Walks `root`, wrapping every matching token in a <mark>. Skips text nodes
 * whose ancestor chain hits any skip-condition (per shouldSkipSubtree).
 *
 * P-9 fix 2026-05-10: now async + chunked. Collects text nodes upfront
 * (cheap synchronous DOM walk via TreeWalker), then wraps matches in
 * chunks of 500 nodes with yields between chunks. Honors a cancellation
 * signal so a new refresh() can supersede an in-flight pass cleanly.
 */
export async function applyHighlightsTo(
  root: Node,
  regex: RegExp,
  colorMap: Map<string, string>,
  options: ProcessInChunksOptions = {},
): Promise<void> {
  if (!root) return;
  const signal = options.signal;
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
    if (signal?.cancelled) return;
    targets.push(node as Text);
    node = walker.nextNode();
  }

  await processInChunks(
    targets,
    (textNode) =>
      wrapMatchesInTextNode(textNode, source, flags, colorMap),
    options,
  );
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

export interface StartLiveHighlightingOptions {
  /**
   * P-14 fix 2026-05-12-e: optional wrapper invoked around every refresh
   * pass (initial requestIdleCallback boot, chrome.storage.onChanged update,
   * and external .refresh() calls). The orchestrator passes a wrapper that
   * disconnects + reconnects its own MutationObserver around the work, so
   * the applicator's strip-and-reapply of <mark> elements doesn't feed back
   * into that MO and trigger another refresh — the self-feedback loop that
   * produced the highlight flashing + text-selection collapse described in
   * the P-14 polish entry. No-op default keeps standalone use (tests,
   * future non-orchestrator callers) working unchanged.
   */
  muteMutationObserver?: <T>(work: () => Promise<T>) => Promise<T>;
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
 *
 * P-9 fix 2026-05-10: refresh() uses last-wins cancellation so rapid
 * MutationObserver-driven re-fires on heavy-SPA pages (Walmart) don't
 * accumulate stale in-flight passes — each new refresh cancels the prior
 * one before starting.
 *
 * P-14 fix 2026-05-12-e: refresh() now runs inside an
 * options.muteMutationObserver wrapper when provided, which gives the
 * caller (orchestrator) a hook to silence its own MutationObserver around
 * the DOM mutations the applicator makes.
 */
export async function startLiveHighlighting(
  projectId: string,
  options: StartLiveHighlightingOptions = {},
): Promise<LiveHighlightController> {
  const muteMutationObserver =
    options.muteMutationObserver ?? (async (work) => work());
  let currentTerms: HighlightTerm[] = [];
  let currentRegex: RegExp | null = null;
  let currentColorMap: Map<string, string> = new Map();
  let destroyed = false;
  // P-9 fix 2026-05-10: tracks the in-flight applyHighlightsTo pass so a
  // new refresh() can cancel it before starting fresh. Last-wins: the
  // most-recent DOM/term state always becomes the eventual visible state.
  let activeApplySignal: CancellationSignal | null = null;

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

  async function refresh(): Promise<void> {
    if (destroyed) return;
    // P-14 fix 2026-05-12-e: run the strip-and-reapply work inside the
    // caller's mute wrapper so the resulting DOM mutations don't feed
    // back into the orchestrator's MutationObserver and trigger another
    // immediate refresh. The default wrapper is a no-op pass-through.
    await muteMutationObserver(async () => {
      // Cancel any in-flight pass before starting fresh. The cancelled
      // pass returns at its next chunk boundary; the partial highlights
      // it placed are wiped by removeAllHighlights below.
      if (activeApplySignal !== null) {
        activeApplySignal.cancelled = true;
        activeApplySignal = null;
      }
      if (!currentRegex) {
        // Term list went empty (e.g., user cleared all). Strip any
        // leftover highlights from a previous pass.
        removeAllHighlights();
        return;
      }
      removeAllHighlights();
      const signal: CancellationSignal = { cancelled: false };
      activeApplySignal = signal;
      try {
        await applyHighlightsTo(
          document.body,
          currentRegex,
          currentColorMap,
          { signal },
        );
      } finally {
        // Only clear the slot if THIS pass still owns it — otherwise a
        // newer refresh has already replaced it and is in flight.
        if (activeApplySignal === signal) activeApplySignal = null;
      }
    });
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
      // Cancel any in-flight pass so it returns at its next chunk
      // boundary and stops touching the DOM.
      if (activeApplySignal !== null) {
        activeApplySignal.cancelled = true;
        activeApplySignal = null;
      }
      if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
        chrome.storage.onChanged.removeListener(onStorageChanged);
      }
      removeAllHighlights();
    },
  };
}
