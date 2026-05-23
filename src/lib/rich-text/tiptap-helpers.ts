// Pure helpers for the TipTap rich-text editor shared wrapper introduced by
// P-46 Workstream 2 (2026-05-25). Kept free of @tiptap/* imports so the
// helpers stay testable via `node:test` without pulling in the editor's
// browser-only ProseMirror dependencies.
//
// The persisted shape for every per-item Analysis / per-category Overall
// Analysis / per-URL Overall Competitor Analysis / Comprehensive Competitor
// Analysis surface is a TipTap ProseMirror document JSON object — `{ type:
// 'doc', content: [...] }`. The schema default is `'{}'` (empty object) on
// every column carrying this kind of doc (see prisma/schema.prisma
// CapturedText.analysis et al.). Normalization at the editor boundary
// converts the empty-object placeholder to a canonical empty document.

// Canonical empty TipTap document — a single empty paragraph. Matches what
// ProseMirror's default schema produces when an editor is initialized with
// no content.
export const EMPTY_TIPTAP_DOC: Readonly<Record<string, unknown>> = Object.freeze({
  type: 'doc',
  content: [{ type: 'paragraph' }],
});

/**
 * Returns true when `value` represents an "empty" Analysis — either the
 * schema-default `{}` placeholder, or a fully-formed doc whose content
 * array has zero entries or one empty paragraph.
 *
 * Used by the editor wrapper to decide whether to render the placeholder
 * label and by the route handler if it ever needs to short-circuit empty
 * persists (current PATCH writes whatever the client sends).
 */
export function isEmptyTipTapDoc(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) return true;
  if (obj.type !== 'doc') return false;
  const content = obj.content;
  if (!Array.isArray(content)) return false;
  if (content.length === 0) return true;
  if (content.length !== 1) return false;
  const first = content[0] as Record<string, unknown> | null;
  if (!first || typeof first !== 'object') return false;
  if (first.type !== 'paragraph') return false;
  const innerContent = first.content;
  if (innerContent === undefined) return true;
  if (Array.isArray(innerContent) && innerContent.length === 0) return true;
  return false;
}

/**
 * Normalizes anything the schema or wire layer can hand us into a value
 * the TipTap editor accepts as `content`. The schema default `{}` (and any
 * other shape the empty-state predicate recognizes) maps to
 * `EMPTY_TIPTAP_DOC`; valid doc shapes pass through unchanged; obviously
 * invalid inputs fall back to the empty doc so the editor never explodes.
 */
export function normalizeTipTapInput(
  value: unknown
): Readonly<Record<string, unknown>> {
  if (isEmptyTipTapDoc(value)) return EMPTY_TIPTAP_DOC;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    if (obj.type === 'doc' && Array.isArray(obj.content)) {
      return obj;
    }
  }
  return EMPTY_TIPTAP_DOC;
}

/**
 * Trust-boundary type guard used by the per-row PATCH route handlers to
 * accept an `analysis` payload. The wire shape is `Record<string, unknown>`
 * (a JSON object); this rejects `null`, arrays, primitives, and missing
 * values. Returns true when the value is a plain object the route handler
 * can safely persist into the Prisma `Json` column.
 *
 * Note: this guard does NOT validate that the object is a well-formed
 * TipTap doc — that level of validation would require the full ProseMirror
 * schema and is enforced at render time by the editor itself. The route's
 * concern is "is this something we can store in a Json column without
 * later breaking the renderer?" which a generic object shape satisfies.
 */
export function isValidAnalysisPayload(
  value: unknown
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}
