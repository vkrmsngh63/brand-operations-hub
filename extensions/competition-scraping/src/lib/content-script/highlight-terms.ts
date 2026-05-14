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
 * P-20 fix 2026-05-15. Hashes a list of regex matches (matched string +
 * within-node index) into a fingerprint string for === comparison. Pure
 * function so unit tests can verify the hash algorithm without needing a
 * DOM; the DOM-walking caller `computeMatchableFingerprint` is verified
 * end-to-end via the Playwright extension regression suite.
 *
 * djb2-style: init 5381, multiplier 33 (`(h << 5) + h`). 32-bit truncation
 * via `| 0` keeps the hash bounded. Returns `${count}:${hash}` so two states
 * that hash-collide but have different match counts still produce different
 * fingerprint strings.
 */
export function hashFingerprintMatches(
  matches: readonly { readonly matched: string; readonly index: number }[],
): string {
  let hash = 5381;
  for (const m of matches) {
    const s = m.matched;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
    }
    hash = ((hash << 5) + hash + m.index) | 0;
  }
  return `${matches.length}:${hash}`;
}

/**
 * P-20 fix 2026-05-15. Computes a deterministic fingerprint of every regex
 * match in the visible-and-not-already-highlighted text under `root`. The
 * live-highlight controller's refresh() compares this fingerprint to the
 * one from the previous refresh; if unchanged, the refresh short-circuits
 * (no strip, no reapply) — the common case on heavily-mutating pages like
 * real amazon.com where most external DOM mutations don't add new matchable
 * text. See the P-20 polish-backlog entry in ROADMAP.md for the bug class
 * and the 2026-05-15 real-amazon DevTools trace that informed this fix.
 *
 * Important property — by design the walk reuses `shouldSkipSubtree` so it
 * skips existing <mark class="plos-cs-highlight"> elements. That means the
 * fingerprint reflects only PENDING highlight work, not all matches on
 * page: in steady state (everything that should be highlighted already is)
 * the fingerprint is "0:5381" (zero matches, init hash) and stays stable
 * until new matchable text appears or existing marks are destroyed by
 * external mutation. Both transitions correctly change the fingerprint and
 * trigger a reapply.
 */
export function computeMatchableFingerprint(
  root: Node,
  regex: RegExp,
): string {
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

  const matches: { matched: string; index: number }[] = [];
  const source = regex.source;
  const flags = regex.flags;
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = (node as Text).nodeValue || '';
    const re = new RegExp(source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push({ matched: m[0], index: m.index });
      if (m[0].length === 0) re.lastIndex++;
    }
    node = walker.nextNode();
  }
  return hashFingerprintMatches(matches);
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
  // P-20 fix 2026-05-15: fingerprint of the page's pending-highlight work
  // at the end of the previous refresh. The next refresh computes a fresh
  // fingerprint and short-circuits when unchanged — eliminates the flash +
  // selection-collapse loop on heavy-DOM-churn pages like real amazon.com
  // (where most external mutations don't add new matchable text). Set to
  // null whenever a forcing event happens (term-list change, no-terms
  // state), so the very next refresh always runs.
  let lastFingerprint: string | null = null;

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

    // P-20 fix 2026-05-15: short-circuit on unchanged matchable-text
    // fingerprint. The walk is sync + lightweight (one TreeWalker pass
    // honoring the same skip rules as applyHighlightsTo) and skips
    // existing <mark> elements, so the fingerprint reflects PENDING
    // highlight work — in steady state it's "0:5381" (zero matches)
    // and stays stable until external mutation actually adds new
    // matchable text or destroys an existing mark. Computed outside
    // the mute window because it doesn't touch the DOM. See the
    // P-20 polish-backlog entry + the 2026-05-15 real-amazon trace
    // (`docs/p-20-trace-script.js`) for evidence motivating this fix.
    //
    // Note: the pre-check intentionally DOES NOT update lastFingerprint.
    // The post-apply recompute inside the mute window does (only on
    // uncancelled completion), so a cancelled apply leaves the stored
    // fingerprint at its prior value and the next refresh re-evaluates
    // from scratch.
    if (currentRegex !== null) {
      const fingerprint = computeMatchableFingerprint(
        document.body,
        currentRegex,
      );
      if (fingerprint === lastFingerprint) return;
    } else if (lastFingerprint === null) {
      // No terms AND already in stripped state. Nothing to do.
      return;
    }

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
        // P-20: mark cleared state so the next no-terms refresh
        // short-circuits at the top.
        lastFingerprint = null;
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
        // P-20 fix 2026-05-15: capture the post-apply fingerprint
        // INSIDE the mute window so the read is consistent with the
        // DOM state we just produced (no external mutation can race
        // here because the orchestrator's MO is disconnected). Skip
        // on cancellation — partial state shouldn't be stored as
        // "steady state"; the next refresh's pre-check will see the
        // partial fingerprint and proceed to a fresh apply.
        if (!signal.cancelled && !destroyed) {
          lastFingerprint = computeMatchableFingerprint(
            document.body,
            currentRegex,
          );
        }
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
      // P-20 fix 2026-05-15: term-list change invalidates the cached
      // fingerprint. Without this, a term edit that produces the same
      // match-set on the page (e.g., user changes a term's color, or
      // adds a term that doesn't match the current page content) would
      // hash to the same fingerprint and the next refresh would
      // short-circuit — missing the color update or the new term's
      // future-matching potential. Invalidating forces one full pass.
      lastFingerprint = null;
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
