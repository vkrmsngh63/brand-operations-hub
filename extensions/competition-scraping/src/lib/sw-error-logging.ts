// Global error logging helpers for the MV3 service worker (background.ts).
//
// P-16 (W#2 polish, 2026-05-19): the SW crashed on laptop 2 during the
// P3B-9 cross-device sign-in walkthrough with a degenerate stack trace
// ("Service worker went to a bad state unexpectedly. Context is unknown.
// Stack Trace: :0 (anonymous function)") — Chrome had no meaningful source
// info because the crash came from an async path the SW didn't catch.
// Suspected source: Supabase's auto-refresh-token loop firing during the
// WiFi-off period and throwing an unhandled promise rejection, which MV3
// SWs treat more strictly than persistent backgrounds.
//
// `buildGlobalErrorPayload` builds a structured log record from any input
// (Error, string, null, plain object) so SW DevTools surfaces something
// useful next time the crash recurs instead of `:0 (anonymous function)`.
// `logGlobalError` is the production caller — invokes the builder and
// emits via the injected logger (defaults to console.error). Both are
// pure-with-injected-logger so node:test can assert on the payload shape.

export interface GlobalErrorPayload {
  timestamp: string;
  context: string;
  name: string;
  message: string;
  stack: string | null;
}

export function buildGlobalErrorPayload(
  err: unknown,
  context: string,
): GlobalErrorPayload {
  const timestamp = new Date().toISOString();
  if (err instanceof Error) {
    return {
      timestamp,
      context,
      name: err.name,
      message: err.message,
      stack: typeof err.stack === 'string' ? err.stack : null,
    };
  }
  if (typeof err === 'string') {
    return { timestamp, context, name: 'NonErrorString', message: err, stack: null };
  }
  if (err === null || err === undefined) {
    return {
      timestamp,
      context,
      name: 'NonErrorNullish',
      message: String(err),
      stack: null,
    };
  }
  if (typeof err === 'object') {
    const maybeName = (err as { name?: unknown }).name;
    const maybeMessage = (err as { message?: unknown }).message;
    const maybeStack = (err as { stack?: unknown }).stack;
    let message: string;
    if (typeof maybeMessage === 'string') {
      message = maybeMessage;
    } else {
      try {
        message = JSON.stringify(err);
      } catch {
        message = '[unserializable object]';
      }
    }
    return {
      timestamp,
      context,
      name: typeof maybeName === 'string' ? maybeName : 'NonErrorObject',
      message,
      stack: typeof maybeStack === 'string' ? maybeStack : null,
    };
  }
  return { timestamp, context, name: 'NonErrorPrimitive', message: String(err), stack: null };
}

export type GlobalErrorLogger = (payload: GlobalErrorPayload) => void;

export function logGlobalError(
  err: unknown,
  context: string,
  logger: GlobalErrorLogger = defaultLogger,
): void {
  const payload = buildGlobalErrorPayload(err, context);
  logger(payload);
}

function defaultLogger(payload: GlobalErrorPayload): void {
  console.error('[plos-cs-sw]', payload);
}
