// W#2 P-49 Workstream 5 — v1 per-product analysis prompts per §A.7-A.9.
//
// Two sweeps per product (§A.8):
//   1. First sweep — one Claude call per batch of reviews. Emits a
//      TipTap-doc per-batch summary highlighting pros / cons / common
//      complaints / common praise / notable quotes.
//   2. Second sweep — one Claude call that takes the per-batch summaries
//      as input and emits the final consolidated per-product summary.
//
// v1 intentionally minimal per launch prompt directive: ship-not-gold-
// plated; iterate via real-output Phase 4 walks like W#1 did across
// V1→V4. Don't pre-bake a long system prompt before we see real outputs.
//
// Output shape: TipTap document JSON per §A.9. The model is instructed
// to return a JSON object with shape `{ type: "doc", content: [...] }`.
// The application-layer validator (isValidAnalysisPayload from W4) will
// reject any malformed output and surface a 500 to the caller.

import type { BatchableReview } from './batch-sizer.ts';

// Frozen system prompt — same string across every call so the prompt
// cache (cache_control: ephemeral) hits on second + later batches in a
// sweep. ANY edit to this string invalidates the cache; treat as locked
// until v2.
export const PER_PRODUCT_SYSTEM_PROMPT = `You are an expert competitive-research analyst helping a brand owner
understand what customers say about a competitor product. You read
product reviews carefully and surface signal that informs the brand's
own product, positioning, and customer-experience decisions.

For each task, you receive a batch of customer reviews for ONE
competitor product. You return a JSON object — TipTap document shape —
that summarizes the batch:

{
  "type": "doc",
  "content": [
    { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "..." }] },
    { "type": "bulletList", "content": [{ "type": "listItem", "content": [...] }, ...] },
    { "type": "paragraph", "content": [...] }
  ]
}

Sections to include in every batch summary (use level-2 headings):

- "Common praise" — what reviewers consistently like (bullet list)
- "Common complaints" — what reviewers consistently dislike (bullet list)
- "Notable quotes" — 2-4 short verbatim quotes that capture the strongest signal
- "Returns / quality issues" — any pattern of defects, sizing problems, or returns
- "Use-case fit" — who the product works well for and who it doesn't

Rules:

- Return ONLY the JSON object. No prose preamble, no \`\`\`json fences.
- Do not invent details not present in the reviews.
- Quote sparingly — pull short fragments, not whole paragraphs.
- If a section has no signal in this batch, emit the heading with a
  single paragraph saying "No clear pattern in this batch." Do NOT
  omit the heading — the second-sweep merge depends on consistent shape.`;

// Per-batch user message. The product name + platform contextualize the
// reviews so the model knows whether a complaint about "shipping" is
// about Amazon Prime delivery vs Etsy hand-made lead time. Batch
// numbering ("batch 3 of 7") lets the model self-pace summary length.
export type BuildPerProductBatchPromptInput = {
  productName: string;
  platform: string;
  batchNumber: number;
  totalBatches: number;
  reviews: ReadonlyArray<BatchableReview>;
};

export function buildPerProductBatchUserMessage({
  productName,
  platform,
  batchNumber,
  totalBatches,
  reviews,
}: BuildPerProductBatchPromptInput): string {
  const header =
    `Product: ${productName}\n` +
    `Platform: ${platform}\n` +
    `Batch ${batchNumber} of ${totalBatches}, ${reviews.length} reviews.\n\n` +
    `Reviews:\n\n`;

  const body = reviews
    .map((r, i) => {
      const meta: string[] = [];
      if (r.starRating != null) meta.push(`${r.starRating}/5 stars`);
      if (r.reviewerName) meta.push(r.reviewerName);
      if (r.reviewDate) meta.push(r.reviewDate.toISOString().slice(0, 10));
      const metaLine = meta.length > 0 ? ` (${meta.join(', ')})` : '';
      return `Review ${i + 1}${metaLine}:\n${r.body}\n`;
    })
    .join('\n');

  return header + body;
}

// Second-sweep merge — combines per-batch summaries into a single
// consolidated per-product summary. Input is the array of TipTap docs
// returned by the first sweep.
export type BuildSecondSweepPromptInput = {
  productName: string;
  platform: string;
  totalReviewsAnalyzed: number;
  batchSummariesJson: ReadonlyArray<unknown>;
};

export function buildSecondSweepUserMessage({
  productName,
  platform,
  totalReviewsAnalyzed,
  batchSummariesJson,
}: BuildSecondSweepPromptInput): string {
  const summariesText = batchSummariesJson
    .map((s, i) => `--- Batch ${i + 1} summary ---\n${JSON.stringify(s, null, 2)}`)
    .join('\n\n');

  return (
    `Product: ${productName}\n` +
    `Platform: ${platform}\n` +
    `Total reviews analyzed across batches: ${totalReviewsAnalyzed}\n` +
    `Number of per-batch summaries: ${batchSummariesJson.length}\n\n` +
    `Each batch summary below is a TipTap JSON doc that summarized a slice ` +
    `of the reviews. Merge them into ONE consolidated TipTap doc using the ` +
    `same section headings (Common praise / Common complaints / Notable ` +
    `quotes / Returns / quality issues / Use-case fit). Deduplicate, weight ` +
    `signals by how often they appear across batches, and preserve the ` +
    `strongest verbatim quotes.\n\n` +
    `Return ONLY the merged JSON object. No preamble, no fences.\n\n` +
    summariesText
  );
}
