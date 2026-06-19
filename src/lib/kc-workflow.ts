import type { NextRequest } from 'next/server';

// The two keyword-clustering workspaces that share the keyword + canvas routes.
// AI 1 ("keyword-clustering") is the original engine; AI 2 / Variant B
// ("keyword-clustering-vb") keeps its own isolated keyword set + canvas.
export const KC_WORKFLOW = 'keyword-clustering';
export const KC_WORKFLOW_VB = 'keyword-clustering-vb';

const ALLOWED = new Set<string>([KC_WORKFLOW, KC_WORKFLOW_VB]);

/**
 * Pure core: validate a raw `?workflow=` value against the allowlist.
 * Returns AI 1 (`keyword-clustering`) when the value is absent or unknown,
 * so every existing caller is byte-for-byte unchanged. Exported for tests.
 */
export function pickKcWorkflow(raw: string | null | undefined): string {
  return raw && ALLOWED.has(raw) ? raw : KC_WORKFLOW;
}

/**
 * Resolve which keyword-clustering workspace a request targets, from its
 * optional `?workflow=` query param.
 */
export function resolveKcWorkflow(req: NextRequest): string {
  return pickKcWorkflow(req.nextUrl.searchParams.get('workflow'));
}
