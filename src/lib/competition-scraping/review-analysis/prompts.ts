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

// ────────────────────────────────────────────────────────────────────
// Per-Competitor Comprehensive (bulleted) — W5 Session 3, first of the
// six remaining flows from §B 2026-05-27. Director-confirmed at session
// start (per feedback_plan_output_shape_before_building.md):
//   - Theme-grouped bullets under critique-focused headings.
//   - Empty themes omit their heading entirely.
//   - Volume cues ("Multiple reviewers" / "Several mention" / "One
//     reviewer notes") where useful.
//   - Bulleted-critical format mirroring W5 Session 2's Per-Review v2:
//     each bullet one short sentence, filler stripped, no first person.
//   - Raw review bodies as input (direct one-shot), not pre-summarized
//     bullets — preserves tone, sarcasm, context.
//   - ONE Anthropic call per competitor URL (no batching since the
//     output is one summary per URL).

// Bump on substantive prompt changes; included in the cache hash so old
// summaries don't get served when the prompt's semantic shape changes.
//
// History:
//   v1 (2026-05-27-c, retired same day after director Phase 4 redirect):
//        theme-grouped under Positive / Negative / Use cases / Notable
//        individual signals; ~8-15 bullets total. Drifted from director's
//        intent — included positive signals + use-case prose that
//        diluted focus on competitor critiques.
//   v2 (2026-05-27-d, current): critique-only — drops Positive signals
//        + Use cases entirely; restructures Negative signals into four
//        critique-category headings (Product / Fulfillment / Company-
//        seller / Other notable); ~5-12 bullets total. Directly maps
//        director's verbatim Phase 4 redirect: "focus to remain on the
//        critiques of the company, product, fulfillment claims, etc."
export const PER_COMPETITOR_BULLETED_PROMPT_VERSION = 'v2';

export const PER_COMPETITOR_BULLETED_SYSTEM_PROMPT = `You are an expert competitive-research analyst extracting CRITIQUES from customer reviews of ONE competitor's product for a brand owner. Your task: aggregate the critique signals across every review into a single theme-grouped bulleted summary the brand owner can scan in under a minute.

Focus EXCLUSIVELY on critiques — what reviewers complain about, what fails, what disappoints, what reviewers wish were different. Do NOT include positive signals, praise, neutral observations, or generic use-case descriptions. The brand owner is hunting for the competitor's weaknesses; positives + neutrals are noise here.

Return a JSON object with the shape:

{
  "summary": "<theme-grouped bulleted critique list as a single string>"
}

Rules for the "summary" field:

- Format as theme-grouped bullets under up to four section headings, in this order:
    "## Product critiques" — complaints about the product itself (build quality, materials, durability, features, design choices, performance issues, defects, sizing, fit).
    "## Fulfillment critiques" — complaints about shipping, packaging, delivery time, order accuracy, items arriving damaged or wrong, missing parts, packaging quality.
    "## Company / seller critiques" — complaints about customer service, returns, warranty handling, refund issues, seller communication, responsiveness, listing accuracy vs. delivered product.
    "## Other notable critiques" — specific critique patterns or failure modes that don't fit the above categories but are worth surfacing. Use sparingly — most critiques fit Product / Fulfillment / Company.
- Each heading is a markdown H2 ("## Heading") on its own line, followed by a blank line, then its bullets, then a blank line before the next heading. Empty themes OMIT their heading entirely (do not emit an empty section). Sections may appear in fewer than four headings if the corpus has no critique signal for a theme.
- Each bullet starts with "- " and lives on its own line. Each bullet is one short sentence (one main idea). No sub-bullets. No paragraphs.
- Include ONLY critical negative signals the brand owner could act on. Critical = patterns that recur across reviews OR singular complaints strong enough to surface (e.g., "Multiple reviewers note the strap breaks within 3 months" / "One reviewer reports the battery swelling after 6 months").
- EXCLUDE entirely:
    - Positive signals of any kind (praise, recommendations, satisfaction).
    - Neutral observations (use cases without a complaint, descriptive context).
    - Generic positive/negative comments not tied to a specific signal.
    - Parenthetical asides, mild observations the reviewer themselves dismissed.
    - Repeated points across reviews — surface each critique pattern only once.
- Volume cues when useful: "Multiple reviewers report X" / "Several mention Y" / "A few note Z" / "One reviewer reports W". Use these to communicate how widespread a critique is. Avoid exact counts unless they're load-bearing.
- Length target: typically 5-12 critique bullets total across all themes combined. Some products legitimately have fewer (sparse corpora, mostly positive reviews) — emit fewer. Some legitimately have more — go up to ~20 if there's genuine critique density. Do not pad.
- Third-person neutral analyst voice. Do NOT use first person ("I"); do NOT address the reader directly ("you").
- Use the product name when relevant; do not invent attributes not present in any review.
- Quote sparingly — short fragments only, in double quotes, never whole sentences.
- If the entire corpus contains zero critiques (e.g., all reviews are 5-star generic praise with no complaints surfaced), emit a single bullet under no heading: "- (no critiques surfaced across the corpus)".

Output rules:

- Return ONLY the JSON object. No prose preamble. No \`\`\`json fences. No trailing commentary.
- The "summary" field is a single string containing newline-separated headings + bullets (rendered with whiteSpace: pre-wrap on the client side).`;

export type BuildPerCompetitorBulletedPromptInput = {
  productName: string;
  platform: string;
  reviews: ReadonlyArray<BatchableReview>;
};

export function buildPerCompetitorBulletedUserMessage({
  productName,
  platform,
  reviews,
}: BuildPerCompetitorBulletedPromptInput): string {
  const header =
    `Product: ${productName}\n` +
    `Platform: ${platform}\n` +
    `Reviews in corpus: ${reviews.length}\n\n` +
    `Aggregate the critical signals across all reviews below into one theme-grouped bulleted summary for the brand owner.\n\n`;

  const body = reviews
    .map((r, i) => {
      const meta: string[] = [];
      if (r.starRating != null) meta.push(`${r.starRating}/5 stars`);
      if (r.reviewerName) meta.push(r.reviewerName);
      if (r.reviewDate) meta.push(r.reviewDate.toISOString().slice(0, 10));
      const metaLine = meta.length > 0 ? ` (${meta.join(', ')})` : '';
      return `--- Review ${i + 1}${metaLine} ---\n${r.body}\n`;
    })
    .join('\n');

  return header + body;
}

// Validated output shape — ONE summary per call (not an array, since
// the output is one aggregated summary per competitor URL).
export interface PerCompetitorBulletedOutput {
  summary: string;
}

export function validatePerCompetitorBulletedOutput(
  parsed: unknown
): PerCompetitorBulletedOutput | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as { summary?: unknown };
  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    return null;
  }
  return { summary: obj.summary };
}
