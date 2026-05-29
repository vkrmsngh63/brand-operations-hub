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
//
// P-49 W5 Fix Session D (2026-05-31) — STRUCTURED-OUTPUT REDESIGN per
// director's 2026-05-30 §1 addendum: the "Overall Analysis — Captured
// Reviews" box becomes a 3-column traceability table (Category /
// Complaint / source reviews + star counts) instead of free text. To
// power Column 3, the model must now return, per bullet, WHICH reviews
// support it. Two reliability moves over the prior free-text shape:
//   - Input reviews are labeled "R1".."Rn" (short, stable) instead of
//     asking the model to echo long UUIDs — the handler maps R-labels
//     back to CapturedReview ids by position (see resolveReviewRefs).
//   - Output is structured { categories: [{ name, bullets: [{ text,
//     reviewRefs }] }] }. The handler flattens it back into the legacy
//     "## heading / - bullet" string (flattenCategoriesToSummaryString)
//     so the main Reviews Analysis Table's Column 9 + the Edit
//     affordance + any downstream reader keep working unchanged.

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
//   v3 (2026-05-27-e): critique-only, theme-emergent. Lists Product /
//        Fulfillment / Company-seller as COMMON examples but explicitly
//        instructs the model to INVENT new theme headings when the data
//        calls for them. Free-text "## heading / - bullet" string output.
//   v4 (2026-05-31, current): SAME critique-only, theme-emergent rules as
//        v3, but STRUCTURED output (categories → bullets → reviewRefs) so
//        each bullet traces back to its supporting reviews. Powers the
//        Fix Session D 3-column traceability table.
export const PER_COMPETITOR_BULLETED_PROMPT_VERSION = 'v4';

export const PER_COMPETITOR_BULLETED_SYSTEM_PROMPT = `You are an expert competitive-research analyst extracting CRITIQUES from customer reviews of ONE competitor's product for a brand owner. Your task: aggregate the critique signals across every review into a theme-grouped list of complaints, AND for each complaint record exactly which reviews support it.

Focus EXCLUSIVELY on critiques — what reviewers complain about, what fails, what disappoints, what reviewers wish were different. Do NOT include positive signals, praise, neutral observations, or generic use-case descriptions. The brand owner is hunting for the competitor's weaknesses; positives + neutrals are noise here.

Each review in the input is labeled with a short reference like "R1", "R2", "R3". Use these labels — and ONLY these labels — when recording which reviews a complaint traces back to.

Return a JSON object with the shape:

{
  "categories": [
    {
      "name": "<theme heading, e.g. Product critiques>",
      "bullets": [
        { "text": "<one short critique sentence>", "reviewRefs": ["R1", "R4", "R7"] }
      ]
    }
  ]
}

Rules for "categories":

- Each category's "name" is a coherent critique theme surfaced by the actual review data. Do NOT prefix it with "##" or any markdown — just the plain theme name.
- Use these COMMON theme categories where they apply:
    "Product critiques" — complaints about the product itself (build quality, materials, durability, features, design choices, performance, defects, sizing, fit).
    "Fulfillment / shipping critiques" — complaints about shipping, packaging, delivery time, order accuracy, items arriving damaged or wrong, missing parts, packaging quality.
    "Company / seller critiques" — complaints about customer service, returns, warranty handling, refund issues, seller communication, responsiveness, listing accuracy vs. delivered product.
- DO NOT limit critiques to those three categories. If reviewers raise critique patterns that don't fit them, INVENT a new theme name rather than dropping the critique or jamming it into "Other". These are EXAMPLES of valid emergent themes — use any when warranted, AND invent new ones beyond this list as the data calls for:
    "Pricing / value critiques", "Documentation / instructions critiques", "Compatibility / interoperability critiques", "Safety / reliability concerns", "Software / firmware critiques", "Customer support critiques", "Longevity / durability critiques", "Marketing accuracy critiques", "Accessibility / usability critiques" — and any other coherent critique category emerging from the actual data.
- "Other notable critiques" remains available as a fallback for true one-off complaints that don't fit any theme. Use sparingly — prefer to invent a specific theme over jamming into "Other".
- Omit empty categories entirely (do not emit a category with no bullets).

Rules for each bullet's "text":

- One short sentence (one main idea). No sub-bullets, no paragraphs, no leading "- ".
- Include ONLY critical negative signals the brand owner could act on. Critical = patterns that recur across reviews OR singular complaints strong enough to surface (e.g., "Multiple reviewers note the strap breaks within 3 months" / "One reviewer reports the battery swelling after 6 months").
- EXCLUDE entirely: positive signals of any kind; neutral observations (use cases without a complaint, descriptive context); generic comments not tied to a specific signal; parenthetical asides; mild observations the reviewer themselves dismissed; repeated points (surface each critique pattern only once).
- Volume cues when useful: "Multiple reviewers report X" / "Several mention Y" / "A few note Z" / "One reviewer reports W". Avoid exact counts unless load-bearing.
- Third-person neutral analyst voice. Do NOT use first person ("I"); do NOT address the reader directly ("you").
- Use the product name when relevant; do not invent attributes not present in any review.
- Quote sparingly — short fragments only, in double quotes, never whole sentences.

Rules for each bullet's "reviewRefs" — THIS IS CRITICAL:

- List the labels of ALL reviews that support this complaint — not just one example, EVERY review that expresses or evidences it. The brand owner needs the complete set of source reviews behind each complaint.
- Use ONLY labels that appear in the input ("R1", "R2", …). Never invent a label. Never reference a review that does not exist.
- A single review may legitimately support multiple complaints — it is fine for the same label to appear under more than one bullet.
- If, after careful reading, a complaint genuinely traces to one review only, list just that one label. But err toward completeness: if a review plausibly evidences the complaint, include it.
- reviewRefs must never be empty — every bullet must cite at least one supporting review.

Length target: typically 5-15 critique bullets total across all categories combined. Some products legitimately have fewer; some more (go up to ~25 if there's genuine critique density). Do not pad.

Empty corpus: if the entire corpus contains zero critiques (e.g., all reviews are generic praise with no complaints), return { "categories": [] }.

Output rules:

- Return ONLY the JSON object. No prose preamble. No \`\`\`json fences. No trailing commentary.`;

export type BuildPerCompetitorBulletedPromptInput = {
  productName: string;
  platform: string;
  reviews: ReadonlyArray<BatchableReview>;
};

// The short, stable label assigned to the i-th review (0-based) in the
// prompt. Kept as a single source of truth so the prompt builder and the
// ref-resolver agree on the labeling scheme.
export function reviewRefLabel(index: number): string {
  return `R${index + 1}`;
}

export function buildPerCompetitorBulletedUserMessage({
  productName,
  platform,
  reviews,
}: BuildPerCompetitorBulletedPromptInput): string {
  const header =
    `Product: ${productName}\n` +
    `Platform: ${platform}\n` +
    `Reviews in corpus: ${reviews.length}\n\n` +
    `Aggregate the critical signals across all reviews below into theme-grouped complaints. For each complaint, record in "reviewRefs" the labels (R1, R2, …) of ALL reviews that support it.\n\n`;

  const body = reviews
    .map((r, i) => {
      const meta: string[] = [];
      if (r.starRating != null) meta.push(`${r.starRating}/5 stars`);
      if (r.reviewerName) meta.push(r.reviewerName);
      if (r.reviewDate) meta.push(r.reviewDate.toISOString().slice(0, 10));
      const metaLine = meta.length > 0 ? ` (${meta.join(', ')})` : '';
      return `--- ${reviewRefLabel(i)}${metaLine} ---\n${r.body}\n`;
    })
    .join('\n');

  return header + body;
}

// ── Structured output shapes ────────────────────────────────────────
// What the MODEL returns: categories → bullets → reviewRefs (R-labels).
export interface PerCompetitorModelBullet {
  text: string;
  reviewRefs: string[];
}
export interface PerCompetitorModelCategory {
  name: string;
  bullets: PerCompetitorModelBullet[];
}
export interface PerCompetitorModelOutput {
  categories: PerCompetitorModelCategory[];
}

// What we STORE in analysisJson.categories after resolving R-labels back
// to real CapturedReview ids (see resolveReviewRefs in the handler).
export interface PerCompetitorStructuredBullet {
  text: string;
  reviewIds: string[];
}
export interface PerCompetitorStructuredCategory {
  name: string;
  bullets: PerCompetitorStructuredBullet[];
}
export interface PerCompetitorStructuredAnalysis {
  categories: PerCompetitorStructuredCategory[];
}

// Validate + normalize the model's structured output. Lenient where it
// can be (trims, drops blank bullets / empty categories) but rejects
// anything structurally wrong so the handler can surface a 502 rather
// than persist garbage. An empty { categories: [] } is VALID (zero
// critiques surfaced) and returned as-is.
export function validatePerCompetitorStructuredOutput(
  parsed: unknown
): PerCompetitorModelOutput | null {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  const obj = parsed as { categories?: unknown };
  if (!Array.isArray(obj.categories)) return null;

  const categories: PerCompetitorModelCategory[] = [];
  for (const rawCat of obj.categories) {
    if (!rawCat || typeof rawCat !== 'object') return null;
    const cat = rawCat as { name?: unknown; bullets?: unknown };
    if (typeof cat.name !== 'string') return null;
    const name = cat.name.trim();
    if (!name) return null;
    if (!Array.isArray(cat.bullets)) return null;

    const bullets: PerCompetitorModelBullet[] = [];
    for (const rawBullet of cat.bullets) {
      if (!rawBullet || typeof rawBullet !== 'object') return null;
      const b = rawBullet as { text?: unknown; reviewRefs?: unknown };
      if (typeof b.text !== 'string') return null;
      const text = b.text.trim();
      if (!text) continue; // drop blank bullets defensively
      const refs: string[] = [];
      if (Array.isArray(b.reviewRefs)) {
        for (const ref of b.reviewRefs) {
          if (typeof ref === 'string' && ref.trim()) refs.push(ref.trim());
        }
      }
      bullets.push({ text, reviewRefs: refs });
    }
    if (bullets.length === 0) continue; // drop empty categories
    categories.push({ name, bullets });
  }
  return { categories };
}

// Map the model's R-labels back to real CapturedReview ids by position.
// `orderedReviewIds` is the reviewId at each prompt label (index 0 → R1).
// Parses "R<n>" case-insensitively, dedups while preserving order, and
// silently drops any label that is malformed or out of range — the model
// occasionally hallucinates a label, and one bad ref must not poison the
// whole bullet.
export function resolveReviewRefs(
  refs: ReadonlyArray<string>,
  orderedReviewIds: ReadonlyArray<string>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ref of refs) {
    const m = /^r\s*(\d+)$/i.exec(ref.trim());
    if (!m) continue;
    const idx = Number(m[1]) - 1;
    if (idx < 0 || idx >= orderedReviewIds.length) continue;
    const id = orderedReviewIds[idx];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

// Flatten the structured analysis back into the legacy free-text summary
// string ("## Heading\n- bullet\n…") so the main Reviews Analysis Table's
// Column 9 + the Edit affordance + the cache-hit response keep rendering
// exactly as before the structured redesign. An empty analysis flattens
// to the canonical "no critiques" sentinel.
export function flattenCategoriesToSummaryString(
  analysis: PerCompetitorStructuredAnalysis
): string {
  if (analysis.categories.length === 0) {
    return '- (no critiques surfaced across the corpus)';
  }
  return analysis.categories
    .map((cat) => {
      const lines = [`## ${cat.name}`];
      for (const bullet of cat.bullets) lines.push(`- ${bullet.text}`);
      return lines.join('\n');
    })
    .join('\n\n');
}
