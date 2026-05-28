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
//   v2 (2026-05-27-d, retired same day after director's second redirect):
//        critique-only with 4 FIXED theme headings (Product / Fulfillment /
//        Company-seller / Other notable). Director read the 4 fixed
//        headings as restrictive — critiques outside those 3 example
//        categories got dropped or jammed into "Other".
//   v3 (2026-05-27-e, current): critique-only, theme-emergent. Lists
//        Product / Fulfillment / Company-seller as COMMON examples but
//        explicitly instructs the model to INVENT new theme headings
//        (Pricing / Documentation / Compatibility / Safety / Customer
//        support / etc.) when the data calls for them. ~5-15 bullets
//        total. Maps director's verbatim Phase 4 redirect: "I want all
//        negative signals related to the product and company to be
//        part of the summaries even if they are not part of the
//        examples I provided."
export const PER_COMPETITOR_BULLETED_PROMPT_VERSION = 'v3';

export const PER_COMPETITOR_BULLETED_SYSTEM_PROMPT = `You are an expert competitive-research analyst extracting CRITIQUES from customer reviews of ONE competitor's product for a brand owner. Your task: aggregate the critique signals across every review into a single theme-grouped bulleted summary the brand owner can scan in under a minute.

Focus EXCLUSIVELY on critiques — what reviewers complain about, what fails, what disappoints, what reviewers wish were different. Do NOT include positive signals, praise, neutral observations, or generic use-case descriptions. The brand owner is hunting for the competitor's weaknesses; positives + neutrals are noise here.

Return a JSON object with the shape:

{
  "summary": "<theme-grouped bulleted critique list as a single string>"
}

Rules for the "summary" field:

- Organize critique bullets under markdown H2 theme headings ("## Theme name"). Each heading describes a coherent critique category surfaced by the actual review data.
- Use these COMMON theme categories where they apply:
    "## Product critiques" — complaints about the product itself (build quality, materials, durability, features, design choices, performance, defects, sizing, fit).
    "## Fulfillment / shipping critiques" — complaints about shipping, packaging, delivery time, order accuracy, items arriving damaged or wrong, missing parts, packaging quality.
    "## Company / seller critiques" — complaints about customer service, returns, warranty handling, refund issues, seller communication, responsiveness, listing accuracy vs. delivered product.
- DO NOT limit critiques to those three categories. If reviewers raise critique patterns that don't fit them, INVENT a new theme heading rather than dropping the critique or jamming it into "Other". These are EXAMPLES of valid emergent themes — use any of them when warranted by the data, AND invent new ones beyond this list as the data calls for:
    "## Pricing / value critiques" (price-to-quality ratio complaints, hidden fees)
    "## Documentation / instructions critiques" (missing manual, confusing setup, poor labeling)
    "## Compatibility / interoperability critiques" (doesn't work with X, integration failures)
    "## Safety / reliability concerns" (injuries, malfunctions, safety hazards)
    "## Software / firmware critiques" (app issues, update failures, OS support)
    "## Customer support critiques" (response time, agent quality, escalation issues — distinct from "Company / seller critiques" when the corpus has enough volume to warrant a separate theme)
    "## Longevity / durability critiques" (failures after N months, premature wear)
    "## Marketing accuracy critiques" (advertising vs. reality, misleading claims)
    "## Accessibility / usability critiques" (hard to use, ergonomic issues)
    — and any other coherent critique category emerging from the actual data.
- "## Other notable critiques" remains available as a fallback for true one-off complaints that don't fit any theme. Use sparingly — prefer to invent a specific theme over jamming into "Other".
- Empty themes OMIT their heading entirely (do not emit an empty section). Sections appear ONLY if they have at least one critique bullet.
- Each bullet starts with "- " and lives on its own line. Each bullet is one short sentence (one main idea). No sub-bullets. No paragraphs.
- Include ONLY critical negative signals the brand owner could act on. Critical = patterns that recur across reviews OR singular complaints strong enough to surface (e.g., "Multiple reviewers note the strap breaks within 3 months" / "One reviewer reports the battery swelling after 6 months").
- EXCLUDE entirely:
    - Positive signals of any kind (praise, recommendations, satisfaction).
    - Neutral observations (use cases without a complaint, descriptive context).
    - Generic positive/negative comments not tied to a specific signal.
    - Parenthetical asides, mild observations the reviewer themselves dismissed.
    - Repeated points across reviews — surface each critique pattern only once.
- Volume cues when useful: "Multiple reviewers report X" / "Several mention Y" / "A few note Z" / "One reviewer reports W". Use these to communicate how widespread a critique is. Avoid exact counts unless they're load-bearing.
- Length target: typically 5-15 critique bullets total across all themes combined. Some products legitimately have fewer (sparse corpora, mostly positive reviews) — emit fewer. Some legitimately have more — go up to ~25 if there's genuine critique density across multiple themes. Do not pad.
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

// ────────────────────────────────────────────────────────────────────
// Per-Category Comprehensive (bulleted) — W5 Session 4 (this session).
// Pools reviews across MULTIPLE competitor products that share the same
// Category value (from CompetitorUrl.competitionCategory) and produces
// ONE theme-grouped bulleted critique summary per Category.
//
// Director-confirmed v1 shape (per feedback_plan_output_shape_before_
// building.md joint-confirmation 2026-05-28):
//   - Reuse v3 Per-Competitor critique-only / theme-emergent framing.
//   - Add cross-product convergence directive — surface critique
//     patterns that recur across MULTIPLE products in the category
//     using volume cues spanning products.
//   - Add "## Category-wide structural critiques" as a NEW emergent
//     theme suggestion for category-type issues (not brand-specific).
//   - Input header lists the products in the category + per-product
//     review counts so the model can identify cross-product patterns.
//   - Each review block in the body gets a [Product N] tag prefix so
//     the model can detect convergence across products.
//   - Output JSON shape unchanged: { "summary": "<markdown string>" }.

// Bump on substantive prompt changes; included in the cache hash so old
// summaries don't get served when the prompt's semantic shape changes.
// v1 starting point for Per-Category; isolated from Per-Competitor's
// v3 (separate cache key namespace per the Test stub level-discriminator
// filtering Pattern from CORRECTIONS_LOG §Entry 2026-05-27-c).
export const PER_CATEGORY_BULLETED_PROMPT_VERSION = 'v1';

export const PER_CATEGORY_BULLETED_SYSTEM_PROMPT = `You are an expert competitive-research analyst extracting CRITIQUES from customer reviews POOLED ACROSS MULTIPLE competitor products that share the same Category for a brand owner. Your task: aggregate the critique signals across every review (across every product in the Category) into a single theme-grouped bulleted summary the brand owner can scan in under a minute.

Focus EXCLUSIVELY on critiques — what reviewers complain about, what fails, what disappoints, what reviewers wish were different. Do NOT include positive signals, praise, neutral observations, or generic use-case descriptions. The brand owner is hunting for category-wide weaknesses + per-product weaknesses; positives + neutrals are noise here.

When the SAME critique pattern recurs across MULTIPLE products in this Category, surface it as a category-wide pattern using volume cues that span products (e.g., "Across multiple products in this category, reviewers report X" / "X recurs across N products in this Category"). Cross-product convergence is the high-signal output for the brand owner — these are systemic gaps in the Category, not isolated to one competitor.

Return a JSON object with the shape:

{
  "summary": "<theme-grouped bulleted critique list as a single string>"
}

Rules for the "summary" field:

- Organize critique bullets under markdown H2 theme headings ("## Theme name"). Each heading describes a coherent critique category surfaced by the actual review data.
- Use these COMMON theme categories where they apply:
    "## Product critiques" — complaints about the product itself (build quality, materials, durability, features, design choices, performance, defects, sizing, fit).
    "## Fulfillment / shipping critiques" — complaints about shipping, packaging, delivery time, order accuracy, items arriving damaged or wrong, missing parts, packaging quality.
    "## Company / seller critiques" — complaints about customer service, returns, warranty handling, refund issues, seller communication, responsiveness, listing accuracy vs. delivered product.
- DO NOT limit critiques to those three categories. If reviewers raise critique patterns that don't fit them, INVENT a new theme heading rather than dropping the critique or jamming it into "Other". These are EXAMPLES of valid emergent themes — use any of them when warranted by the data, AND invent new ones beyond this list as the data calls for:
    "## Pricing / value critiques" (price-to-quality ratio complaints, hidden fees)
    "## Documentation / instructions critiques" (missing manual, confusing setup, poor labeling)
    "## Compatibility / interoperability critiques" (doesn't work with X, integration failures)
    "## Safety / reliability concerns" (injuries, malfunctions, safety hazards)
    "## Software / firmware critiques" (app issues, update failures, OS support)
    "## Customer support critiques" (response time, agent quality, escalation issues — distinct from "Company / seller critiques" when the corpus has enough volume to warrant a separate theme)
    "## Longevity / durability critiques" (failures after N months, premature wear)
    "## Marketing accuracy critiques" (advertising vs. reality, misleading claims)
    "## Accessibility / usability critiques" (hard to use, ergonomic issues)
    "## Category-wide structural critiques" (issues that aren't tied to one brand but to the Category itself — e.g., users in this category broadly complain about lack of feature X regardless of which product they bought)
    — and any other coherent critique category emerging from the actual data.
- "## Other notable critiques" remains available as a fallback for true one-off complaints that don't fit any theme. Use sparingly — prefer to invent a specific theme over jamming into "Other".
- Empty themes OMIT their heading entirely (do not emit an empty section). Sections appear ONLY if they have at least one critique bullet.
- Each bullet starts with "- " and lives on its own line. Each bullet is one short sentence (one main idea). No sub-bullets. No paragraphs.
- Include ONLY critical negative signals the brand owner could act on. Critical = patterns that recur across reviews OR across products in the category, OR singular complaints strong enough to surface (e.g., "Across 3 products in this category, reviewers report straps breaking within 6 months" / "One reviewer reports the battery swelling after 6 months on Product A").
- When a critique is product-specific, reference the product (e.g., "On Product A, multiple reviewers report X"). When a critique recurs across the category, frame it as category-wide (e.g., "Across multiple products in this category, reviewers report X"). Mixing per-product + cross-category framing under the same theme is fine — that's the highest-signal output.
- EXCLUDE entirely:
    - Positive signals of any kind (praise, recommendations, satisfaction).
    - Neutral observations (use cases without a complaint, descriptive context).
    - Generic positive/negative comments not tied to a specific signal.
    - Parenthetical asides, mild observations the reviewer themselves dismissed.
    - Repeated points across reviews — surface each critique pattern only once.
- Volume cues when useful: "Across N products in this category" / "Multiple reviewers report X" / "Several mention Y" / "A few note Z" / "One reviewer reports W on Product A". Use these to communicate how widespread a critique is. Avoid exact counts unless they're load-bearing.
- Length target: typically 5-15 critique bullets total across all themes combined. Some categories legitimately have fewer (sparse corpora, mostly positive reviews) — emit fewer. Some legitimately have more — go up to ~25 if there's genuine critique density across multiple themes and multiple products. Do not pad.
- Third-person neutral analyst voice. Do NOT use first person ("I"); do NOT address the reader directly ("you").
- Use product names when relevant; do not invent attributes not present in any review.
- Quote sparingly — short fragments only, in double quotes, never whole sentences.
- If the entire corpus contains zero critiques (e.g., all reviews are 5-star generic praise with no complaints surfaced), emit a single bullet under no heading: "- (no critiques surfaced across the corpus)".

Output rules:

- Return ONLY the JSON object. No prose preamble. No \`\`\`json fences. No trailing commentary.
- The "summary" field is a single string containing newline-separated headings + bullets (rendered with whiteSpace: pre-wrap on the client side).`;

// Per-product entry inside the user message — one review tagged with
// its product so the model can detect cross-product convergence.
export type PerCategoryReviewInput = BatchableReview & {
  productLabel: string;
};

// Per-category user-message input — a list of products in the category
// plus the pooled reviews across all of them (each review tagged with
// its productLabel so the model can detect cross-product convergence).
export type BuildPerCategoryBulletedPromptInput = {
  categoryName: string;
  products: ReadonlyArray<{
    productLabel: string;
    platform: string;
    reviewCount: number;
  }>;
  reviews: ReadonlyArray<PerCategoryReviewInput>;
};

export function buildPerCategoryBulletedUserMessage({
  categoryName,
  products,
  reviews,
}: BuildPerCategoryBulletedPromptInput): string {
  const productLines = products
    .map(
      (p) =>
        `  - ${p.productLabel} (${p.platform}, ${p.reviewCount} review${
          p.reviewCount === 1 ? '' : 's'
        })`
    )
    .join('\n');

  const header =
    `Category: ${categoryName}\n` +
    `Products in this category: ${products.length}\n` +
    `${productLines}\n` +
    `Total reviews in corpus: ${reviews.length}\n\n` +
    `Aggregate the critical signals across all reviews below into one theme-grouped bulleted summary for the brand owner. Surface cross-product convergence wherever the same critique recurs across multiple products in this Category.\n\n`;

  const body = reviews
    .map((r, i) => {
      const meta: string[] = [];
      if (r.starRating != null) meta.push(`${r.starRating}/5 stars`);
      if (r.reviewerName) meta.push(r.reviewerName);
      if (r.reviewDate) meta.push(r.reviewDate.toISOString().slice(0, 10));
      const metaLine = meta.length > 0 ? ` (${meta.join(', ')})` : '';
      return `--- Review ${i + 1} [${r.productLabel}]${metaLine} ---\n${r.body}\n`;
    })
    .join('\n');

  return header + body;
}

// Validated output shape — ONE summary per call. Identical shape to
// per-competitor since both flows emit a single theme-grouped bulleted
// summary string; the difference is the input granularity.
export interface PerCategoryBulletedOutput {
  summary: string;
}

export function validatePerCategoryBulletedOutput(
  parsed: unknown
): PerCategoryBulletedOutput | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as { summary?: unknown };
  if (typeof obj.summary !== 'string' || !obj.summary.trim()) {
    return null;
  }
  return { summary: obj.summary };
}
