// Execution mode for AI batch flows shared across PLOS workflows.
//
// Two values, mirroring W#1 keyword-clustering's AutoAnalyze.tsx `apiMode` field
// shipped with the original W#1 release:
//
//   'direct' — browser sends Anthropic API calls directly. No Vercel timeout.
//              Requires the user to paste their Anthropic API key into the modal.
//   'server' — browser sends a request to a Vercel route handler, which proxies
//              to Anthropic with the server-stored API key. Subject to Vercel's
//              per-request time limit (~60s on Pro / ~5min on legacy plans).
//
// When the eventual server-side migration off Vercel ships (per `feedback_browser_first_ai_with_server_migration.md`),
// 'server' mode loses the timeout constraint and becomes the recommended default for both workflows.
// Until then, 'direct' is the recommended mode for long-running AI batch work.
//
// Consumer convention: components import EXECUTION_MODES + EXECUTION_MODE_LABELS
// for selects, and the ExecutionMode type for state typing. Server-side validators
// import isExecutionMode for narrowing untrusted input.

export type ExecutionMode = 'direct' | 'server';

export const EXECUTION_MODE_DIRECT: ExecutionMode = 'direct';
export const EXECUTION_MODE_SERVER: ExecutionMode = 'server';

export const EXECUTION_MODES: readonly ExecutionMode[] = [
  EXECUTION_MODE_DIRECT,
  EXECUTION_MODE_SERVER,
] as const;

// Labels match W#1's AutoAnalyze.tsx verbatim — keep in sync if either changes.
export const EXECUTION_MODE_LABELS: Readonly<Record<ExecutionMode, string>> = {
  direct: 'Direct (browser → Anthropic)',
  server: 'Server proxy (browser → Vercel → Anthropic)',
} as const;

// Help-tooltip text — matches W#1's AutoAnalyze.tsx tooltip verbatim.
export const EXECUTION_MODE_HELP =
  'Direct sends requests from your browser straight to Anthropic (no timeout). ' +
  'Server proxy routes through Vercel (~60s timeout on Pro / ~5min on legacy plans).';

export function isExecutionMode(value: unknown): value is ExecutionMode {
  return value === EXECUTION_MODE_DIRECT || value === EXECUTION_MODE_SERVER;
}
