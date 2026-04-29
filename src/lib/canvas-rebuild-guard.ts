/**
 * G1 payload-sanity guard for `/canvas/rebuild` — pure helper.
 *
 * Why this exists as a separate module:
 *   1. Lets the threshold logic be unit-tested with `node:test` without
 *      importing Prisma or Next. Same path-alias rationale as
 *      `canvas-fetch-parser.ts` and `reconciliation.ts`.
 *   2. Keeps the API route handler narrowly focused — the route reads
 *      the request body, counts existing rows, and forwards the decision
 *      to this helper. The threshold + reason-message live here.
 *
 * What it guards against:
 *   The 2026-04-28 canvas-blanking bug produced rebuild payloads whose
 *   `body.nodes` was a small fresh skeleton (12 nodes when the canvas
 *   had 284). Triggered by a transient `/canvas/nodes` 5xx that the
 *   client mishandled — the AI saw an empty TSV, emitted ops to build
 *   a brand-new canvas, and the wiring layer obediently sent that as a
 *   rebuild request. The client wiring is now hardened (see Bug 1
 *   Layer 1+2 in `useCanvas.ts` + `AutoAnalyze.tsx`); G1 is the
 *   independent server-side defense — it's the last line regardless of
 *   which client connects.
 *
 * Threshold: 50% drop. Locked 2026-04-29 (director's choice — option A
 * from `DEFENSE_IN_DEPTH_AUDIT_DESIGN §8 Q1`). The 2026-04-28 events
 * were 95% and 98% drops, far above this bar. Legitimate batch ops
 * typically modify <5% of nodes and never come close. A legitimate mass
 * cleanup that exceeds the threshold is still possible; the rejection
 * message tells the caller exactly how to express the intent — pass
 * `deleteNodeIds` for the topics being removed.
 */

export const G1_SHRINK_THRESHOLD = 0.5;

export interface G1Decision {
  blocked: boolean;
  reason?: string;
}

export interface G1Args {
  /** Length of `body.nodes` in the rebuild payload. */
  newNodeCount: number;
  /** Count of CanvasNode rows in the project's workflow at evaluation time. */
  currentNodeCount: number;
  /** Whether `body.deleteNodeIds` is a non-empty array. */
  hasExplicitDeletes: boolean;
  /** Whether `body.nodes` was provided as an array (false for delete-only ops). */
  nodesProvided: boolean;
}

export function evaluateRebuildPayload(args: G1Args): G1Decision {
  // Delete-only or pathway-only payloads aren't subject to G1 — the bug
  // signature requires a `body.nodes` shape.
  if (!args.nodesProvided) return { blocked: false };
  // Explicit deletes signal admin intent. Pass through.
  if (args.hasExplicitDeletes) return { blocked: false };
  // Nothing to shrink — every empty-canvas rebuild is fine.
  if (args.currentNodeCount === 0) return { blocked: false };

  const drop = args.currentNodeCount - args.newNodeCount;
  if (drop / args.currentNodeCount > G1_SHRINK_THRESHOLD) {
    return {
      blocked: true,
      reason:
        'Rebuild rejected: payload would shrink canvas from ' +
        args.currentNodeCount +
        ' to ' +
        args.newNodeCount +
        ' nodes (>50% drop) without any explicit deleteNodeIds. ' +
        "This is the canvas-blanking signature (see DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.2). " +
        'If the shrink is intentional, pass deleteNodeIds for the topics being removed.',
    };
  }

  return { blocked: false };
}
