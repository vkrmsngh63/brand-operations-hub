// W#2 P-49 Workstream 5 — v1 Per-Review Summarize prompt per
// REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27 (Reviews Phase 3 design lock).
//
// Of the 7 flows locked yesterday (per-review summarize + per-competitor
// per-product comprehensive bulleted/non-bulleted + per-category bulleted/
// non-bulleted + per-type bulleted/non-bulleted), Session 2 ships ONLY
// the Per-Review Summarize builder. The other 6 flow builders land in
// Sessions 3+ following the same single-call-per-batch shape so the
// per-batch endpoint scaffolded today carries forward unchanged.
//
// Locked meta-style across all 7 flows (per §B 2026-05-27):
//   - flat-bullet structured
//   - third-person neutral analyst tone
//   - soft length targets
//   - echoed IDs for redundancy
//
// Per-Review Summarize specific shape (director-confirmed at the start
// of Session 2):
//   - 1-2 sentence plain prose per review (no bullets at per-review
//     level; bullets are for the comprehensive flows in Sessions 3+).
//   - Returns one JSON object per batch with summaries[] indexed by
//     reviewId. One Anthropic call per batch, NOT per review.
//   - Echoed reviewId defends against reorderings / drops / merges.

import type { BatchableReview } from './batch-sizer.ts';

// Prompt version — incorporated into the per-review cache key so prompt
// iterations don't serve stale v1 summaries. Bump whenever the system
// prompt changes substantively (whitespace-only edits should NOT bump
// since the prefix cache survives them; content edits MUST bump).
//
// History:
//   v1 (2026-05-27, retired same day after director's Phase 4 redirect):
//        plain prose 1-2 sentences. Drifted from the locked "flat-bullet
//        structured" meta-style.
//   v2 (2026-05-27 current): bulleted critical-only, filler-stripped per
//        director's verbatim example during Phase 4 verification.
export const PER_REVIEW_SUMMARIZE_PROMPT_VERSION = 'v2';

// Frozen system prompt — the cache_control: ephemeral header lets the
// SDK keep this string in the 5-minute prefix cache across batches in
// a sweep. ANY edit invalidates the prefix cache for in-flight runs;
// content edits also MUST bump PER_REVIEW_SUMMARIZE_PROMPT_VERSION so
// the per-review DB cache key changes and old summaries don't get
// served stale.
export const PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT = `You are an expert competitive-research analyst summarizing customer reviews for a brand owner researching a competitor's product. Your task: extract the CRITICAL signals from each review and present them as a concise bulleted list for the brand owner's later analysis.

Return a JSON object with the shape:

{
  "summaries": [
    { "reviewId": "<the input reviewId>",
      "summary": "<bulleted list as a string, bullets separated by newlines>" },
    ...
  ]
}

Rules for each summary's "summary" field:

- Format as a bulleted list. Each bullet starts with "- " and lives on its own line, separated from the next by a newline ("\\n"). No headings, no paragraphs, no sub-bullets.
- Include ONLY critical information that the brand owner could act on. Critical = the reviewer's main stance + their strongest specific claim, complaint, praise, use case, or experience pattern.
- LEAVE OUT non-critical filler: parenthetical asides, mild observations the reviewer themselves dismissed, generic positive/negative comments not tied to a specific signal, repeated points. If a fact is non-load-bearing for the brand owner's decision-making, omit it.
- Concise. Each bullet is one short sentence (one main idea).
- Range: typically 1-4 bullets. Some reviews legitimately have 0 critical signals — in that case emit a single bullet "- (no critical signal)".
- Third-person neutral analyst voice. Do NOT use first person ("I"); do NOT address the reviewer directly ("you").
- Use the product name when relevant; do not invent attributes not present in the review body.
- Quote sparingly — short fragments only, in double quotes, never whole sentences.
- Echo each review's reviewId VERBATIM in the output entry so the caller can match summaries back to reviews. Do not invent reviewIds. Do not drop or merge reviews.

Output rules:

- Return ONLY the JSON object. No prose preamble. No \`\`\`json fences. No trailing commentary.
- Include exactly one entry per input review, in the same order they were provided.`;

// Per-batch user message. Identical product+platform context across all
// per-review batches for a given CompetitorUrl so the model can
// distinguish "shipping = Amazon Prime" from "shipping = Etsy handmade".
export type BuildPerReviewBatchPromptInput = {
  productName: string;
  platform: string;
  batchNumber: number;
  totalBatches: number;
  reviews: ReadonlyArray<BatchableReview>;
};

export function buildPerReviewBatchUserMessage({
  productName,
  platform,
  batchNumber,
  totalBatches,
  reviews,
}: BuildPerReviewBatchPromptInput): string {
  const header =
    `Product: ${productName}\n` +
    `Platform: ${platform}\n` +
    `Batch ${batchNumber} of ${totalBatches}, ${reviews.length} reviews.\n\n` +
    `Summarize each review below. Echo each reviewId verbatim in the output.\n\n`;

  const body = reviews
    .map((r, i) => {
      const meta: string[] = [];
      if (r.starRating != null) meta.push(`${r.starRating}/5 stars`);
      if (r.reviewerName) meta.push(r.reviewerName);
      if (r.reviewDate) meta.push(r.reviewDate.toISOString().slice(0, 10));
      const metaLine = meta.length > 0 ? ` (${meta.join(', ')})` : '';
      return `--- Review ${i + 1}${metaLine} ---\nreviewId: ${r.id}\n${r.body}\n`;
    })
    .join('\n');

  return header + body;
}

// Validated output shape returned by the per-batch endpoint after JSON
// parsing + structural validation. The handler maps malformed responses
// to a 502; the browser never sees an unvalidated payload.
export interface PerReviewSummaryEntry {
  reviewId: string;
  summary: string;
}

export interface PerReviewBatchOutput {
  summaries: PerReviewSummaryEntry[];
}

// Structural validator — accepts any JSON value, returns the typed
// shape on success or null on rejection. Caller surfaces a 502 with a
// "model returned malformed JSON" message on null.
export function validatePerReviewBatchOutput(
  parsed: unknown
): PerReviewBatchOutput | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as { summaries?: unknown };
  if (!Array.isArray(obj.summaries)) return null;
  const summaries: PerReviewSummaryEntry[] = [];
  for (const entry of obj.summaries) {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as { reviewId?: unknown; summary?: unknown };
    if (typeof e.reviewId !== 'string' || !e.reviewId) return null;
    if (typeof e.summary !== 'string') return null;
    summaries.push({ reviewId: e.reviewId, summary: e.summary });
  }
  return { summaries };
}

// Defensive cross-check: every input reviewId must have exactly one
// matching output summary, and there must be no extra summaries with
// reviewIds the model invented. Returns the missing + extra ids when
// the model misbehaved; null when alignment is clean.
export function findReviewIdMismatch(
  inputReviewIds: ReadonlyArray<string>,
  output: PerReviewBatchOutput
): { missing: string[]; extra: string[]; duplicated: string[] } | null {
  const inputSet = new Set(inputReviewIds);
  const seen = new Set<string>();
  const duplicated: string[] = [];
  const extra: string[] = [];
  for (const s of output.summaries) {
    if (!inputSet.has(s.reviewId)) {
      extra.push(s.reviewId);
      continue;
    }
    if (seen.has(s.reviewId)) {
      duplicated.push(s.reviewId);
      continue;
    }
    seen.add(s.reviewId);
  }
  const missing = inputReviewIds.filter((id) => !seen.has(id));
  if (missing.length === 0 && extra.length === 0 && duplicated.length === 0) {
    return null;
  }
  return { missing, extra, duplicated };
}
