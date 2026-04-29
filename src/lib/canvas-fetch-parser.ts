/**
 * Pure helper for classifying the responses of the two canvas-state fetches
 * (`/api/projects/[projectId]/canvas/nodes` GET and `/api/projects/[projectId]/canvas` GET)
 * that `useCanvas.fetchCanvas` makes in parallel.
 *
 * Why this exists as a separate module:
 *   1. Lets the parsing logic be unit-tested with `node:test` without importing
 *      React. The auto-analyze-v3 module follows the same pattern (see its
 *      header comment) — local type duplication so `node --test
 *      --experimental-strip-types` can resolve without webpack/path-alias
 *      machinery.
 *   2. Forces a single, uniform contract for "what counts as a successful
 *      fetch" so the canvas hook can never again silently treat an error
 *      response as "no nodes exist" (the 2026-04-28 canvas-blanking bug — see
 *      ROADMAP.md §"🚨 Canvas-Blanking Intermittent Bug").
 *
 * The contract:
 *   - Both responses' `ok` flag must be true.
 *   - The nodes body must be an array.
 *   - The state body must be a plain object that can carry `canvasState`,
 *     `pathways`, `sisterLinks` (each may be missing/null/empty; the helper
 *     normalises them).
 *   - Anything else is a failure with a structured reason. The caller is
 *     expected to throw and preserve previous client state — never apply a
 *     partial / blank state.
 */

export interface RawResponse {
  ok: boolean;
  status: number;
  /**
   * The parsed JSON body, or `null` if the body could not be parsed (network
   * error, invalid JSON, or response.ok was false and the caller chose not to
   * read it). `unknown` because we make no assumptions about shape until the
   * helper runs.
   */
  body: unknown;
}

/**
 * Minimal local mirrors of the React-hook types. Kept in sync with
 * `src/hooks/useCanvas.ts` deliberately — see the module-header rationale.
 * Only the fields the helper relies on are typed; everything else flows
 * through as `unknown` and is cast at the use-site.
 */
export interface CanvasNodeLike {
  id: string;
  [key: string]: unknown;
}

export interface CanvasStateLike {
  id: string;
  [key: string]: unknown;
}

export interface PathwayLike {
  id: string;
  [key: string]: unknown;
}

export interface SisterLinkLike {
  id: string;
  [key: string]: unknown;
}

export type CanvasFetchResult =
  | {
      ok: true;
      nodes: CanvasNodeLike[];
      canvasState: CanvasStateLike | null;
      pathways: PathwayLike[];
      sisterLinks: SisterLinkLike[];
    }
  | { ok: false; reason: string };

interface RawState {
  canvasState?: unknown;
  pathways?: unknown;
  sisterLinks?: unknown;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function parseCanvasFetchResponses(
  nodesRes: RawResponse,
  stateRes: RawResponse,
): CanvasFetchResult {
  if (!nodesRes.ok) {
    return { ok: false, reason: `nodes fetch HTTP ${nodesRes.status}` };
  }
  if (!stateRes.ok) {
    return { ok: false, reason: `state fetch HTTP ${stateRes.status}` };
  }
  if (!Array.isArray(nodesRes.body)) {
    return { ok: false, reason: 'nodes body is not an array' };
  }
  if (!isPlainObject(stateRes.body)) {
    return { ok: false, reason: 'state body is not an object' };
  }

  const state = stateRes.body as RawState;
  const pathways = Array.isArray(state.pathways) ? (state.pathways as PathwayLike[]) : [];
  const sisterLinks = Array.isArray(state.sisterLinks) ? (state.sisterLinks as SisterLinkLike[]) : [];
  const canvasState = isPlainObject(state.canvasState) ? (state.canvasState as CanvasStateLike) : null;

  return {
    ok: true,
    nodes: nodesRes.body as CanvasNodeLike[],
    canvasState,
    pathways,
    sisterLinks,
  };
}
