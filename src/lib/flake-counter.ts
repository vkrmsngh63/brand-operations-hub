/**
 * Flake-rate telemetry helper — pure module.
 *
 * Emits a single grep-able structured line on every Prisma (or other) error
 * caught at an API route boundary. Lines are written via `console.error`
 * with a stable `[FLAKE]` prefix so they can be counted from Vercel's log
 * dashboard with a simple text filter.
 *
 * Why grep-able log lines instead of a DB table:
 *   The whole point of the instrumentation is to measure database flake
 *   rate; writing the measurement to the database itself would be subject
 *   to the same flake we're trying to measure. Stable text lines plus
 *   Vercel's log retention (7 days on Hobby / 30 days on Pro) is plenty for
 *   a measurement window. Future iterations can route the same call into a
 *   different sink (e.g., a dedicated telemetry service) by changing this
 *   one module — every call site already goes through `recordFlake`.
 *
 * Line shape:
 *   [FLAKE] endpoint=<METHOD /path> code=<P1001|...|unknown> retried=<true|false> [canvasSize=<N>] [projectWorkflowId=<id>] msg="<first-line of error message, truncated>"
 *
 * Field definitions:
 *   endpoint  — METHOD + route (e.g., `POST /api/projects/[projectId]/canvas/rebuild`).
 *               Stable across requests so flake counts can be aggregated by
 *               endpoint.
 *   code      — Prisma error.code if present; otherwise "unknown".
 *   retried   — `true` if the catch fired AFTER a withRetry layer exhausted
 *               (the flake surfaced despite client-side retry); `false` if
 *               the catch fired on first error (the route was unwrapped).
 *               Lets later analysis distinguish "wrapped-and-still-failed"
 *               vs "raw flake" rates.
 *   canvasSize        — optional; current canvas-node count when known.
 *                       Helps test the "transaction-duration grows with
 *                       canvas size → pgbouncer pressure" hypothesis from
 *                       `ROADMAP.md` "NEW HIGH — Underlying ~25% per-endpoint
 *                       pgbouncer/Prisma flake rate" entry.
 *   projectWorkflowId — optional; helps cross-reference flakes across
 *                       endpoints for a single workspace's session.
 *   msg       — first 200 chars of error message, whitespace-collapsed.
 *               Helps distinguish flake shapes inside the same code class
 *               without dumping full stack traces into log volume.
 *
 * Cross-references:
 *   - `src/lib/prisma-retry.ts` — the G2 helper that retries transient
 *     codes; only 2 routes currently use it (see audit in
 *     `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-05-04 STATE block).
 *   - `BROWSER_FREEZE_FIX_DESIGN.md §3` — same-shape lightweight
 *     instrumentation pattern used for layout-pass timing.
 */

export interface FlakeContext {
  /**
   * Was this caught after a withRetry layer exhausted? Default false.
   * Set `true` from the catch block of routes wrapped in `withRetry` so
   * later analysis can separate "still failed despite retry" vs "raw flake".
   */
  retried?: boolean;
  /** Current canvas node count, when known. */
  canvasSize?: number;
  /** Workspace id, when available. */
  projectWorkflowId?: string;
}

const TRANSIENT_PRISMA_CODES = new Set([
  'P1001',
  'P1002',
  'P1008',
  'P2034',
]);

/** Extract Prisma's `error.code` if present; return `"unknown"` otherwise. */
export function extractPrismaCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return 'unknown';
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' && code.length > 0 ? code : 'unknown';
}

/** True for the four codes the G2 `withRetry` helper would retry. */
export function isTransientCode(code: string): boolean {
  return TRANSIENT_PRISMA_CODES.has(code);
}

/**
 * Build the structured log line. Pure — useful in tests without mocking
 * `console`. Production code calls `recordFlake` (which delegates to this
 * + emits via `console.error`).
 */
export function formatFlakeLine(
  endpoint: string,
  error: unknown,
  ctx: FlakeContext = {},
): string {
  const code = extractPrismaCode(error);
  const retried = ctx.retried === true;

  const rawMessage =
    error instanceof Error
      ? error.message
      : error === null || error === undefined
        ? ''
        : String(error);
  const message = rawMessage.replace(/\s+/g, ' ').trim().slice(0, 200);

  let line = `[FLAKE] endpoint=${endpoint} code=${code} retried=${retried}`;
  if (typeof ctx.canvasSize === 'number') {
    line += ` canvasSize=${ctx.canvasSize}`;
  }
  if (typeof ctx.projectWorkflowId === 'string') {
    line += ` projectWorkflowId=${ctx.projectWorkflowId}`;
  }
  line += ` msg="${message}"`;
  return line;
}

/**
 * Record one flake event. Emits via `console.error` so the line lands in
 * Vercel's error-tier log stream (more visible than `console.log` in the
 * dashboard). Safe to call from inside any route's catch block — purely
 * additive; does NOT swallow the error or change downstream control flow.
 */
export function recordFlake(
  endpoint: string,
  error: unknown,
  ctx: FlakeContext = {},
): void {
  const line = formatFlakeLine(endpoint, error, ctx);
  console.error(line);
}
