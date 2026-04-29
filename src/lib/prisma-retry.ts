/**
 * G2 retry-on-transient-error helper for Prisma queries — pure module.
 *
 * Why this exists as a separate module:
 *   1. Lets the retry + transient-detection logic be unit-tested with
 *      `node:test` without importing Prisma. The dependency on Prisma's
 *      error shape is a string-typed `code` field, which the helper
 *      reads opportunistically.
 *   2. Single source of truth for "which Prisma errors are worth
 *      retrying" — adding a new transient code is a one-line change here
 *      rather than scattered across every route handler that uses retry.
 *
 * Why retries matter:
 *   The 2026-04-28 canvas-blanking bug was triggered by a transient 5xx
 *   on `/canvas/nodes` GET — most likely a Supabase pgbouncer
 *   connection-pool flake under sustained run load (twice in 151
 *   batches ≈ 1.3% base rate). The client now defends against the
 *   resulting empty-state response (Bug 1 Layer 1 in `useCanvas.ts`),
 *   but a paused run is still a user-visible disruption. If the 500
 *   was just a flaky pool connection that a 100ms retry would have
 *   succeeded on, the run shouldn't have been paused at all. G2
 *   suppresses the transient blip server-side so the client never
 *   sees it.
 *
 * Transient error codes (match Prisma error.code):
 *   P1001 — Can't reach database server
 *   P1002 — Database server timeout
 *   P1008 — Operations timed out
 *   P2034 — Transaction failed (write conflict / deadlock / serialization)
 *
 * Hard errors (auth, validation, NOT_FOUND, etc.) pass through
 * immediately with no retry.
 *
 * Backoff (locked per DEFENSE_IN_DEPTH_AUDIT_DESIGN §5.3):
 *   - Attempt 1: immediate
 *   - Wait 100ms, attempt 2
 *   - Wait 500ms, attempt 3
 *   - Total worst-case extra latency before surfacing a persistent
 *     transient: ~600ms.
 */

const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P2034']);

export function isTransientPrismaError(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const code = (e as { code?: unknown }).code;
  return typeof code === 'string' && TRANSIENT_PRISMA_CODES.has(code);
}

export interface RetryOptions {
  maxAttempts?: number;
  isTransient?: (e: unknown) => boolean;
  /** Override for tests — milliseconds-to-promise. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const transient = options.isTransient ?? isTransientPrismaError;
  const sleep = options.sleep ?? defaultSleep;

  let lastError: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!transient(e)) throw e;
      if (i < maxAttempts - 1) {
        // 100 * 5^i → 100ms, 500ms, 2500ms… we only iterate up to
        // maxAttempts-1 sleeps; for the default 3 attempts that's 100 + 500.
        await sleep(100 * 5 ** i);
      }
    }
  }
  throw lastError;
}
