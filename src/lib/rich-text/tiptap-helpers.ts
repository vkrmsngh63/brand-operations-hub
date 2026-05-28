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

// ─── Plain-summary → TipTap doc conversion (P-49 W5 Fix Session B, 2026-05-30) ───
//
// The per-review + per-competitor AI flows persist their summaries as plain
// strings on ReviewAnalysis.analysisJson.summary. Fix Session B also writes
// those summaries BACK into the TipTap-doc surfaces the director edits:
//   • per-review summary  → CapturedReview.analysis        ("Your Analysis" box)
//   • per-competitor bulleted → CompetitorUrl.overallAnalyses["reviews"]
//     ("Overall Analysis — Captured Reviews" box) — append-merged at the bottom.
//
// These helpers convert a plain summary string into the ProseMirror doc JSON
// the editor + read-only renderer expect, WITHOUT pulling in @tiptap/* (kept
// node:test-friendly per this file's top-of-file constraint).

const BULLET_LINE = /^\s*[-*•]\s+(.*)$/;

function textNode(text: string): Record<string, unknown> {
  return { type: 'text', text };
}

function paragraphNode(text: string): Record<string, unknown> {
  return { type: 'paragraph', content: [textNode(text)] };
}

function listItemNode(text: string): Record<string, unknown> {
  return { type: 'listItem', content: [paragraphNode(text)] };
}

/**
 * Converts a plain summary string into TipTap doc content nodes. Lines that
 * begin with a bullet marker (-, *, •) are grouped into consecutive
 * `bulletList` nodes; other non-blank lines become `paragraph` nodes; blank
 * lines are skipped (they only act as group separators). Returns the content
 * array (not the wrapping doc) so callers can append-merge.
 */
export function summaryStringToContentNodes(
  summary: string
): Array<Record<string, unknown>> {
  const lines = (summary ?? '').split(/\r?\n/);
  const nodes: Array<Record<string, unknown>> = [];
  let pendingBullets: Array<Record<string, unknown>> | null = null;

  const flushBullets = () => {
    if (pendingBullets && pendingBullets.length > 0) {
      nodes.push({ type: 'bulletList', content: pendingBullets });
    }
    pendingBullets = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length === 0) {
      flushBullets();
      continue;
    }
    const bulletMatch = BULLET_LINE.exec(rawLine);
    if (bulletMatch) {
      const itemText = bulletMatch[1].trim();
      if (itemText.length === 0) continue;
      if (!pendingBullets) pendingBullets = [];
      pendingBullets.push(listItemNode(itemText));
    } else {
      flushBullets();
      nodes.push(paragraphNode(line));
    }
  }
  flushBullets();
  return nodes;
}

/**
 * Wraps a plain summary string into a full TipTap doc. Empty/whitespace-only
 * input yields the canonical empty doc so the editor never explodes.
 */
export function summaryStringToTipTapDoc(
  summary: string
): Record<string, unknown> {
  const content = summaryStringToContentNodes(summary);
  if (content.length === 0) return { ...EMPTY_TIPTAP_DOC };
  return { type: 'doc', content };
}

/**
 * Append-merges a plain summary onto an existing TipTap doc, adding the new
 * content at the very bottom so nothing previously in the box is overwritten
 * (per the director's verbatim "added to the very bottom" directive for the
 * "Overall Analysis — Captured Reviews" box). When the existing doc is empty
 * (schema-default `{}` / canonical empty paragraph) the result is just the
 * summary doc — we don't preserve a leading empty paragraph.
 */
export function appendSummaryToTipTapDoc(
  existing: unknown,
  summary: string
): Record<string, unknown> {
  const additions = summaryStringToContentNodes(summary);
  if (additions.length === 0) {
    // Nothing to add — return the existing doc normalized (or empty).
    const normalized = normalizeTipTapInput(existing);
    return { ...normalized };
  }
  if (isEmptyTipTapDoc(existing)) {
    return { type: 'doc', content: additions };
  }
  const base = existing as Record<string, unknown>;
  const baseContent = Array.isArray(base.content)
    ? (base.content as Array<Record<string, unknown>>)
    : [];
  return { type: 'doc', content: [...baseContent, ...additions] };
}

// Known categories for CompetitorUrl.overallAnalyses (P-46 Workstream 1's
// schema-additions list per §A.11). Mirrors the `OverallAnalyses`
// interface in src/lib/shared-types/competition-scraping.ts. Kept in this
// file so the trust-boundary helper can validate strict bag keys without
// pulling in the wire-types module (which has Prisma transitive deps).
const OVERALL_ANALYSES_CATEGORIES = ['text', 'image', 'video', 'reviews'] as const;
export type OverallAnalysesCategory = (typeof OVERALL_ANALYSES_CATEGORIES)[number];

/**
 * Trust-boundary type guard for the `overallAnalyses` PATCH field on
 * `urls/[urlId]`. The wire shape is `Partial<OverallAnalyses>` — a bag
 * where each known category key (text / image / video / reviews) maps to
 * a TipTap doc JSON object.
 *
 * Strict shape: rejects non-objects / null / arrays, rejects unknown keys
 * (catches typos like `txet` at the boundary), and rejects per-category
 * values that fail `isValidAnalysisPayload`. Empty bag (`{}`) is legal —
 * the wire shape says every category is optional.
 */
export function isValidOverallAnalysesBag(
  value: unknown
): value is Partial<Record<OverallAnalysesCategory, Record<string, unknown>>> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const bag = value as Record<string, unknown>;
  for (const key of Object.keys(bag)) {
    if (!(OVERALL_ANALYSES_CATEGORIES as readonly string[]).includes(key)) {
      return false;
    }
    if (!isValidAnalysisPayload(bag[key])) {
      return false;
    }
  }
  return true;
}
