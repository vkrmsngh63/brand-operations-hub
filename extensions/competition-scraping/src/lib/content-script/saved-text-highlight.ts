// P-25 "Already saved" haze for captured text. Symmetric pair to
// already-saved-image-icon.ts: when on a saved-URL page, every saved
// CapturedText row with a non-null selector gets a light-yellow haze
// rendered over the matched Range in the host page DOM.
//
// Rendering uses the CSS Custom Highlight API (`CSS.highlights`) — a
// non-DOM-modifying highlight mechanism added to Chrome 105+. The
// manifest already requires Chrome 105+, so the API is available.
// Non-DOM-modifying matters because:
//   1. The host page's MutationObserver wouldn't see the haze, so
//      there's no feedback-loop risk with our own orchestrator MO
//      (the P-14 muteMutationObserver concern that drove the
//      highlight-terms.ts fix is sidestepped entirely).
//   2. The host page's own React / SPA state doesn't fight with the
//      indicator — we don't wrap their text in extra <span> elements.
//   3. Removal is O(1) — drop the Range from the Highlight registry,
//      no DOM mutation needed.
//
// CSS for the haze lives in styles.ts under the `::highlight(plos-cs-
// saved-text)` selector. Distinct from highlight-terms.ts's `<mark>`-
// based highlighting (different feature: user-defined keyword colors).
//
// Lifecycle:
//   - One `CSS.Highlight` instance is created lazily on first attach.
//   - Each saved CapturedText id contributes ONE Range to the instance.
//   - attachSavedTextHaze(range, id) is idempotent — calling twice with
//     the same id replaces the prior Range (used when MutationObserver
//     re-runs and the matched Range moved).
//   - detachSavedTextHaze(id) drops the Range; detachAllSavedTextHazes()
//     wipes the registry (used on URL change / teardown).
//
// If `CSS.highlights` is not available (older Chrome, test environments
// without DOM), every function is a no-op that returns null/false. The
// orchestrator treats this as "haze can't render here" — same v1
// limitation pattern as P-24 saved-image-indicator on null-originalSrcUrl
// rows.

/** Registry name under CSS.highlights. Distinct from highlight-terms. */
const HIGHLIGHT_NAME = 'plos-cs-saved-text';

interface HighlightRegistry {
  set(name: string, highlight: HighlightLike): void;
  delete(name: string): boolean;
  has(name: string): boolean;
  get(name: string): HighlightLike | undefined;
}

interface HighlightLike {
  add(range: AbstractRange): void;
  delete(range: AbstractRange): boolean;
  clear(): void;
  has(range: AbstractRange): boolean;
  size: number;
  // Iterable over ranges — used internally for the per-id removal path.
  [Symbol.iterator](): IterableIterator<AbstractRange>;
}

// Per-id Range registry kept in module scope. We need it because the
// CSS.Highlight API takes Ranges as opaque values — there's no built-in
// way to look up "which Range was registered for id X?" The map gives us
// O(1) removal/replacement keyed by savedTextId.
const rangesById = new Map<string, Range>();

function getHighlightRegistry(): HighlightRegistry | null {
  const css = (globalThis as { CSS?: unknown }).CSS as
    | { highlights?: HighlightRegistry }
    | undefined;
  if (css === undefined || css.highlights === undefined) return null;
  return css.highlights;
}

function getOrCreateHighlight(
  registry: HighlightRegistry,
): HighlightLike | null {
  const existing = registry.get(HIGHLIGHT_NAME);
  if (existing !== undefined) return existing;
  // The Highlight constructor takes a variadic list of initial Ranges.
  // We start empty and add via .add() later.
  const HighlightCtor = (
    globalThis as { Highlight?: { new (...ranges: AbstractRange[]): HighlightLike } }
  ).Highlight;
  if (HighlightCtor === undefined) return null;
  const fresh = new HighlightCtor();
  registry.set(HIGHLIGHT_NAME, fresh);
  return fresh;
}

/**
 * Adds the given Range to the saved-text Highlight registry under
 * `savedTextId`. If `savedTextId` already has a Range registered, the
 * prior Range is removed first (idempotent re-attach).
 *
 * Returns true on success, false when the host environment doesn't
 * support CSS.highlights (in which case no haze appears; not an error
 * — the orchestrator continues).
 */
export function attachSavedTextHaze(
  range: Range,
  savedTextId: string,
): boolean {
  const registry = getHighlightRegistry();
  if (registry === null) return false;
  const highlight = getOrCreateHighlight(registry);
  if (highlight === null) return false;

  const prior = rangesById.get(savedTextId);
  if (prior !== undefined) {
    highlight.delete(prior);
  }
  highlight.add(range);
  rangesById.set(savedTextId, range);
  return true;
}

/**
 * Removes the haze for one saved row id, if any. Used when a CapturedText
 * row is no longer in the active recognition set (e.g., user deleted it
 * via the PLOS-side UI in another tab and the orchestrator's next rescan
 * fetched a fresh list without it).
 */
export function detachSavedTextHaze(savedTextId: string): void {
  const prior = rangesById.get(savedTextId);
  if (prior === undefined) return;
  rangesById.delete(savedTextId);
  const registry = getHighlightRegistry();
  if (registry === null) return;
  const highlight = registry.get(HIGHLIGHT_NAME);
  if (highlight === undefined) return;
  highlight.delete(prior);
}

/**
 * Drops ALL saved-text hazes. Called when the orchestrator tears down
 * (sign-out, project switch, page navigation off a saved URL).
 */
export function detachAllSavedTextHazes(): void {
  rangesById.clear();
  const registry = getHighlightRegistry();
  if (registry === null) return;
  const highlight = registry.get(HIGHLIGHT_NAME);
  if (highlight === undefined) return;
  highlight.clear();
}

/**
 * Returns the number of currently-attached hazes. Exposed for tests +
 * future telemetry; the orchestrator does not use this.
 */
export function getSavedTextHazeCount(): number {
  return rangesById.size;
}

/**
 * Whether the haze mechanism is available in this runtime. False in
 * older Chrome versions, in test environments without CSS.highlights,
 * and when the Highlight constructor is missing. Orchestrator can
 * call this to skip the listCapturedTexts fetch entirely when haze
 * can't render — saves an API call.
 */
export function isSavedTextHazeAvailable(): boolean {
  return getHighlightRegistry() !== null;
}

// ─── Test-only helpers ──────────────────────────────────────────────────
//
// These let the unit tests inject a fake CSS.highlights registry without
// relying on a real DOM. NOT used at production runtime.

interface TestRegistryInjection {
  highlights: HighlightRegistry;
  HighlightCtor: { new (...ranges: AbstractRange[]): HighlightLike };
}

let injectedRegistry: TestRegistryInjection | null = null;

/**
 * Installs a test registry override for `CSS.highlights` lookups + the
 * `Highlight` constructor. Returns a tear-down function that restores
 * the previous state.
 *
 * Public so the unit tests can use it. Production code never calls this.
 */
export function __setTestRegistry(
  registry: HighlightRegistry,
  HighlightCtor: { new (...ranges: AbstractRange[]): HighlightLike },
): () => void {
  const priorGlobal = (globalThis as { CSS?: unknown }).CSS;
  const priorHighlight = (globalThis as { Highlight?: unknown }).Highlight;
  injectedRegistry = { highlights: registry, HighlightCtor };
  (globalThis as { CSS?: { highlights?: HighlightRegistry } }).CSS = {
    highlights: registry,
  };
  (globalThis as { Highlight?: unknown }).Highlight = HighlightCtor;
  return () => {
    if (priorGlobal === undefined) {
      delete (globalThis as { CSS?: unknown }).CSS;
    } else {
      (globalThis as { CSS?: unknown }).CSS = priorGlobal;
    }
    if (priorHighlight === undefined) {
      delete (globalThis as { Highlight?: unknown }).Highlight;
    } else {
      (globalThis as { Highlight?: unknown }).Highlight = priorHighlight;
    }
    injectedRegistry = null;
    rangesById.clear();
  };
}

/** Test-only: clears the module-scope rangesById without touching CSS. */
export function __resetForTest(): void {
  rangesById.clear();
  void injectedRegistry;
}
