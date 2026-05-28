// W#2 P-49 Workstream 5 — DI seam for the per-batch endpoint per
// REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27 (browser-first architecture).
//
// Route: POST /api/projects/[projectId]/competition-scraping/review-analysis/run-batch
// Body:  { flow: 'per-review-summarize', urlId, reviewIds: string[], modelVersion }
//
// One Anthropic call per request, well under Vercel's per-request time
// limit. The browser orchestrates the queue + pause/resume/cancel +
// localStorage checkpoint (mirror of W#1's AutoAnalyze BatchObj pattern).
//
// Flow:
//   1. verifyAuth → projectWorkflowId + userId
//   2. Validate body (flow, urlId, reviewIds non-empty, modelVersion)
//   3. Resolve CompetitorUrl (urlId + projectWorkflowId)
//   4. Load CapturedReview rows by IDs (scope-guarded to the URL)
//   5. Cache lookup per reviewId via SHA-256(reviewId|modelVersion)
//   6. For uncached reviews, ONE messages.create call (system prompt
//      cached via ephemeral cache_control header)
//   7. Validate JSON + reviewId alignment (defends against drops /
//      reorders / merges / hallucinated ids)
//   8. Persist N PER_REVIEW rows for the uncached reviews
//   9. Return merged cached + fresh summaries + usage
//
// Replaces the W5 Session 1 per-product two-sweep handler. Of the 7
// flows locked yesterday in §B 2026-05-27, today's session ships ONLY
// 'per-review-summarize'; the other 6 flow values are reserved in
// SUPPORTED_FLOWS and reject with 400 until their builders land.

import type { Prisma } from '@prisma/client';
import type Anthropic from '@anthropic-ai/sdk';

import { isValidAnalysisPayload as _unused1 } from '../../rich-text/tiptap-helpers.ts';
void _unused1; // silence unused import once we wire bullets in Session 3+

import {
  DEFAULT_MODEL_VERSION,
  isSupportedModelVersion,
  type AnthropicClientLike,
} from '../review-analysis/client.ts';
import { computeReviewsHash } from '../review-analysis/cache.ts';
import {
  calculateCostUsd,
  estimateCostUsd,
  toCostUsdMicros,
} from '../review-analysis/pricing.ts';
import {
  PER_REVIEW_SUMMARIZE_PROMPT_VERSION,
  PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
  buildPerReviewBatchUserMessage,
  validatePerReviewBatchOutput,
  findReviewIdMismatch,
  type PerReviewSummaryEntry,
  PER_COMPETITOR_BULLETED_PROMPT_VERSION,
  PER_COMPETITOR_BULLETED_SYSTEM_PROMPT,
  buildPerCompetitorBulletedUserMessage,
  validatePerCompetitorBulletedOutput,
  PER_CATEGORY_BULLETED_PROMPT_VERSION,
  PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
  buildPerCategoryBulletedUserMessage,
  validatePerCategoryBulletedOutput,
} from '../review-analysis/prompts.ts';
import { countMessageTokens } from '../review-analysis/token-counter.ts';

import type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
} from './shared.ts';

export type {
  HandlerResult,
  RequestLike,
  VerifyAuthFn,
  VerifyAuthResult,
} from './shared.ts';

const WORKFLOW = 'competition-scraping';

// Flow registry — all 7 flows from §B 2026-05-27.
// Session 2 (2026-05-27) shipped 'per-review-summarize'.
// Session 3 (this session) ships 'per-competitor-bulleted'.
// The remaining 5 reject with 400 + a "not yet shipped" message until
// their prompt builders land in later sessions.
export const SUPPORTED_FLOWS = [
  'per-review-summarize',
  'per-competitor-bulleted',
  'per-competitor-nonbulleted',
  'per-category-bulleted',
  'per-category-nonbulleted',
  'per-type-bulleted',
  'per-type-nonbulleted',
] as const;
export type ReviewAnalysisFlow = (typeof SUPPORTED_FLOWS)[number];

export const SHIPPED_FLOWS = new Set<ReviewAnalysisFlow>([
  'per-review-summarize',
  'per-competitor-bulleted',
  'per-category-bulleted',
]);

export function isReviewAnalysisFlow(v: unknown): v is ReviewAnalysisFlow {
  return (
    typeof v === 'string' &&
    (SUPPORTED_FLOWS as readonly string[]).includes(v)
  );
}

// Per-batch output cap. ~50-100 output tokens per summary × up to ~100
// reviews per batch = ~10k tokens. Set to 16k for headroom + safety
// margin against truncation; well under model max (8k–64k depending on
// model). If a real-world batch overruns we'll see 'stop_reason: length'.
const PER_BATCH_MAX_OUTPUT_TOKENS = 16_000;

export type Ctx = { params: Promise<{ projectId: string }> };

export type CompetitorUrlForBatchRow = {
  id: string;
  projectWorkflowId: string;
  platform: string;
  productName: string | null;
};

export type CapturedReviewForBatchRow = {
  id: string;
  competitorUrlId: string;
  starRating: number;
  body: string;
  reviewerName: string | null;
  reviewDate: Date | null;
};

export type ReviewAnalysisCachedRow = {
  id: string;
  reviewsHash: string;
  analysisJson: Prisma.JsonValue;
  modelVersion: string;
};

export type ReviewAnalysisCreatedRow = {
  id: string;
};

export type ReviewAnalysisRunBatchPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: { id: string; projectWorkflowId: string };
      select: { id: true; projectWorkflowId: true; platform: true; productName: true };
    }): Promise<CompetitorUrlForBatchRow | null>;
    // Per-Category dispatch needs to resolve N URLs by id within the
    // project scope (multi-id IN-clause + projectWorkflowId guard).
    // Selects competitionCategory too so the handler can verify every
    // requested URL actually belongs to the supplied categoryName.
    findMany(args: {
      where: {
        id: { in: string[] };
        projectWorkflowId: string;
      };
      select: {
        id: true;
        projectWorkflowId: true;
        platform: true;
        productName: true;
        competitionCategory: true;
      };
    }): Promise<CompetitorUrlForCategoryRow[]>;
  };
  capturedReview: {
    findMany(args: {
      where:
        | { id: { in: string[] }; competitorUrlId: string }
        // Per-Category dispatch fetches all reviews for N URLs in one
        // call. Returns ALL reviews per URL (no per-review id list since
        // the client doesn't enumerate them — the server pools everything
        // under the supplied URLs).
        | { competitorUrlId: { in: string[] } };
      select: {
        id: true;
        competitorUrlId: true;
        starRating: true;
        body: true;
        reviewerName: true;
        reviewDate: true;
      };
    }): Promise<CapturedReviewForBatchRow[]>;
  };
  reviewAnalysis: {
    // Per-review + per-competitor queries pass urlId; per-category
    // queries pass projectId + typeFilter (no urlId since the row spans
    // multiple URLs). The `level` field is the discriminator.
    findMany(args: {
      where:
        | {
            urlId: string;
            level: 'PER_REVIEW' | 'PER_PRODUCT';
            reviewsHash: { in: string[] };
          }
        | {
            projectId: string;
            level: 'PER_CATEGORY';
            typeFilter: string;
            reviewsHash: { in: string[] };
          };
      select: {
        id: true;
        reviewsHash: true;
        analysisJson: true;
        modelVersion: true;
      };
    }): Promise<ReviewAnalysisCachedRow[]>;
    create(args: {
      data: Prisma.ReviewAnalysisUncheckedCreateInput;
      select: { id: true };
    }): Promise<ReviewAnalysisCreatedRow>;
  };
};

// Per-Category needs the competitionCategory field too so the handler
// can verify every supplied urlId belongs to the supplied categoryName
// (defense against a stale browser tab posting URLs from a different
// category after a Category edit).
export type CompetitorUrlForCategoryRow = {
  id: string;
  projectWorkflowId: string;
  platform: string;
  productName: string | null;
  competitionCategory: string | null;
};

export type ReviewAnalysisRunBatchHandlerDeps = {
  prisma: ReviewAnalysisRunBatchPrismaLike;
  verifyAuth: VerifyAuthFn;
  anthropicClient: AnthropicClientLike;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

// Wire-shape entry returned to the browser. `source` lets the client
// distinguish cache hits (zero AI cost) from fresh AI summaries.
export interface PerReviewBatchResponseEntry {
  reviewId: string;
  summary: string;
  source: 'cache' | 'fresh';
}

export interface PerReviewBatchUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  actualCostUsd: number;
  estimatedCostUsd: number;
}

export interface PerReviewBatchResponseBody {
  flow: 'per-review-summarize';
  summaries: PerReviewBatchResponseEntry[];
  freshCount: number;
  cachedCount: number;
  usage: PerReviewBatchUsage;
}

// Per-Competitor wire shape — ONE summary per call (output is a single
// aggregated theme-grouped bulleted summary for the entire URL's review
// corpus). source = 'cache' when the (urlId, reviewIds-set, model,
// prompt-version) tuple already has a stored ReviewAnalysis PER_PRODUCT
// row. analysisId is the row's id — the client uses it to PATCH the
// stored summary when director edits it via the in-page Edit affordance.
export interface PerCompetitorBulletedResponseBody {
  flow: 'per-competitor-bulleted';
  analysisId: string;
  summary: string;
  source: 'cache' | 'fresh';
  usage: PerReviewBatchUsage;
}

// Per-Category wire shape — same shape as Per-Competitor (one summary
// per call + analysisId for the Edit affordance + cache/fresh source).
// Differs only in the persistence level (PER_CATEGORY vs PER_PRODUCT)
// and the request body shape (categoryName + urlIds vs urlId + reviewIds).
export interface PerCategoryBulletedResponseBody {
  flow: 'per-category-bulleted';
  analysisId: string;
  summary: string;
  source: 'cache' | 'fresh';
  usage: PerReviewBatchUsage;
}

export type RunBatchResponseBody =
  | PerReviewBatchResponseBody
  | PerCompetitorBulletedResponseBody
  | PerCategoryBulletedResponseBody;

// Pull the concatenated text content out of a messages.create response.
function extractTextFromContent(
  content: Anthropic.ContentBlock[] | unknown
): string {
  if (!Array.isArray(content)) return '';
  return content
    .map((block) => {
      if (
        block &&
        typeof block === 'object' &&
        (block as { type?: string }).type === 'text'
      ) {
        return (block as { text?: string }).text ?? '';
      }
      return '';
    })
    .join('');
}

// Strip ```json fences + slice the outer { ... } if the model wraps.
export function extractJsonFromModelText(text: string): unknown {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) cleaned = fenceMatch[1].trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('Model response did not contain a JSON object');
  }
  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
}

function buildSystemBlocks(): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function buildPerCompetitorSystemBlocks(): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: PER_COMPETITOR_BULLETED_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

function buildPerCategorySystemBlocks(): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

// Pull a summary string out of a stored analysisJson. Used by both
// PER_REVIEW and PER_PRODUCT cache reads since both store the summary
// as { summary: string, ... } in the JSON column.
// Returns null when the JSON column doesn't match the expected shape
// (defensive — shouldn't happen since we control the persistence path,
// but JSON columns can drift across schema migrations).
function summaryFromCachedJson(value: Prisma.JsonValue): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const obj = value as { summary?: unknown };
  return typeof obj.summary === 'string' ? obj.summary : null;
}

// Per-Category dispatch context bundle. Captures everything the helper
// needs from the outer handler closure so it can live as a free
// function (easier to read + maintain than a deeply-nested branch
// inside makeReviewAnalysisRunBatchHandlers).
type PerCategoryHandlerCtx = {
  projectId: string;
  projectWorkflowId: string;
  userId: string;
  body: {
    categoryName?: unknown;
    urlIds?: unknown;
  };
  modelVersion: string;
  prisma: ReviewAnalysisRunBatchPrismaLike;
  anthropicClient: AnthropicClientLike;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

async function handlePerCategoryBulleted(
  ctx: PerCategoryHandlerCtx
): Promise<HandlerResult> {
  const {
    projectId,
    projectWorkflowId,
    userId,
    body,
    modelVersion,
    prisma,
    anthropicClient,
    recordFlake,
    withRetry,
  } = ctx;

  // ── Validate categoryName ──
  const categoryName =
    typeof body.categoryName === 'string' ? body.categoryName.trim() : '';
  if (!categoryName) {
    return {
      status: 400,
      body: { error: 'categoryName is required for per-category-bulleted' },
    };
  }

  // ── Validate urlIds ──
  if (!Array.isArray(body.urlIds) || body.urlIds.length === 0) {
    return {
      status: 400,
      body: { error: 'urlIds must be a non-empty array of strings' },
    };
  }
  const urlIds: string[] = [];
  const seenUrlIds = new Set<string>();
  for (const id of body.urlIds) {
    if (typeof id !== 'string' || !id.trim()) {
      return {
        status: 400,
        body: { error: 'urlIds must contain only non-empty strings' },
      };
    }
    const trimmed = id.trim();
    if (seenUrlIds.has(trimmed)) {
      return {
        status: 400,
        body: { error: `urlIds contains a duplicate: ${trimmed}` },
      };
    }
    seenUrlIds.add(trimmed);
    urlIds.push(trimmed);
  }

  // ── Resolve URLs ──
  let urls: CompetitorUrlForCategoryRow[];
  try {
    urls = await withRetry(() =>
      prisma.competitorUrl.findMany({
        where: { id: { in: urlIds }, projectWorkflowId },
        select: {
          id: true,
          projectWorkflowId: true,
          platform: true,
          productName: true,
          competitionCategory: true,
        },
      })
    );
  } catch (error) {
    recordFlake('POST per-category-bulleted urls.findMany', error, {
      projectId,
      urlCount: urlIds.length,
    });
    return {
      status: 500,
      body: { error: 'Failed to load competitor URLs for category' },
    };
  }

  // Verify every supplied urlId resolved (scope check).
  if (urls.length !== urlIds.length) {
    const foundIds = new Set(urls.map((u) => u.id));
    const missing = urlIds.filter((id) => !foundIds.has(id));
    return {
      status: 404,
      body: {
        error: `Some urlIds not found in this project: ${missing.join(', ')}`,
        missing,
      },
    };
  }

  // Defense in depth — every URL must actually have competitionCategory
  // === categoryName. Catches stale browser tabs that hold URLs whose
  // Category was edited between page load + Summarize click.
  const wrongCategory = urls.filter(
    (u) => (u.competitionCategory ?? '') !== categoryName
  );
  if (wrongCategory.length > 0) {
    return {
      status: 409,
      body: {
        error:
          `Some urlIds no longer belong to category "${categoryName}". ` +
          `Refresh the page and try again.`,
        mismatched: wrongCategory.map((u) => u.id),
      },
    };
  }

  // ── Resolve reviews ──
  let reviews: CapturedReviewForBatchRow[];
  try {
    reviews = await withRetry(() =>
      prisma.capturedReview.findMany({
        where: { competitorUrlId: { in: urlIds } },
        select: {
          id: true,
          competitorUrlId: true,
          starRating: true,
          body: true,
          reviewerName: true,
          reviewDate: true,
        },
      })
    );
  } catch (error) {
    recordFlake('POST per-category-bulleted reviews.findMany', error, {
      projectId,
      urlCount: urlIds.length,
    });
    return {
      status: 500,
      body: { error: 'Failed to load reviews for category' },
    };
  }
  if (reviews.length === 0) {
    return {
      status: 400,
      body: {
        error:
          'No reviews captured for any URL in this category. ' +
          'Capture reviews first, then re-run the summary.',
      },
    };
  }

  // ── Cache lookup ──
  //
  // Corpus hash combines sorted reviewIds + modelVersion + prompt-version
  // + categoryName so the cache key isolates per-category runs from
  // other levels and surfaces a miss when the URL set in the Category
  // changes (adding/removing a URL shifts the resolved reviewIds set).
  const corpusCacheKeyVersion = `${modelVersion}|${PER_CATEGORY_BULLETED_PROMPT_VERSION}|category=${categoryName}`;
  const corpusHash = computeReviewsHash(
    reviews.map((r) => ({ id: r.id })),
    corpusCacheKeyVersion
  );

  let cachedRows: ReviewAnalysisCachedRow[];
  try {
    cachedRows = await withRetry(() =>
      prisma.reviewAnalysis.findMany({
        where: {
          projectId,
          level: 'PER_CATEGORY',
          typeFilter: categoryName,
          reviewsHash: { in: [corpusHash] },
        },
        select: {
          id: true,
          reviewsHash: true,
          analysisJson: true,
          modelVersion: true,
        },
      })
    );
  } catch (error) {
    recordFlake('POST per-category-bulleted cache lookup', error, {
      projectId,
      categoryName,
    });
    cachedRows = [];
  }

  const cachedHit = cachedRows
    .map((r) => ({ id: r.id, summary: summaryFromCachedJson(r.analysisJson) }))
    .find((entry): entry is { id: string; summary: string } => !!entry.summary);

  if (cachedHit) {
    const cachedResponse: PerCategoryBulletedResponseBody = {
      flow: 'per-category-bulleted',
      analysisId: cachedHit.id,
      summary: cachedHit.summary,
      source: 'cache',
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        actualCostUsd: 0,
        estimatedCostUsd: 0,
      },
    };
    return { status: 200, body: cachedResponse };
  }

  // ── Build user message ──
  //
  // Each review gets tagged with its product label so the model can
  // detect cross-product convergence. Product label uses productName
  // when available + platform; falls back to platform-only when name
  // is missing.
  const urlById = new Map(urls.map((u) => [u.id, u]));
  const productLabelByUrlId = new Map<string, string>();
  const reviewCountByUrlId = new Map<string, number>();
  for (const u of urls) {
    const label = u.productName?.trim()
      ? `${u.productName.trim()} (${u.platform})`
      : `Unnamed product (${u.platform})`;
    productLabelByUrlId.set(u.id, label);
    reviewCountByUrlId.set(u.id, 0);
  }
  for (const r of reviews) {
    reviewCountByUrlId.set(
      r.competitorUrlId,
      (reviewCountByUrlId.get(r.competitorUrlId) ?? 0) + 1
    );
  }

  const productsHeader = urls.map((u) => ({
    productLabel: productLabelByUrlId.get(u.id) ?? '(unknown product)',
    platform: u.platform,
    reviewCount: reviewCountByUrlId.get(u.id) ?? 0,
  }));

  const userText = buildPerCategoryBulletedUserMessage({
    categoryName,
    products: productsHeader,
    reviews: reviews.map((r) => ({
      id: r.id,
      body: r.body,
      reviewerName: r.reviewerName,
      starRating: r.starRating,
      reviewDate: r.reviewDate,
      productLabel:
        productLabelByUrlId.get(r.competitorUrlId) ?? '(unknown product)',
    })),
  });

  let estimatedInputTokensPC = 0;
  try {
    estimatedInputTokensPC = await countMessageTokens({
      client: anthropicClient,
      model: modelVersion,
      system: PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userText }],
    });
  } catch (error) {
    recordFlake('POST per-category-bulleted countTokens', error, {
      projectId,
      categoryName,
    });
  }
  // Per-category output is a single aggregated summary; expect slightly
  // higher output volume than per-competitor because cross-product
  // convergence + per-product callouts mean more bullets. Reuse the
  // same 4_000-token estimate ceiling; final cost is measured from the
  // actual usage block returned by Anthropic.
  const estimatedOutputTokensPC = 4_000;
  const estimatedCostUsdPC = estimateCostUsd(
    modelVersion,
    estimatedInputTokensPC,
    estimatedOutputTokensPC
  );

  // ── AI call ──
  let response: Anthropic.Message;
  try {
    response = await anthropicClient.messages.create({
      model: modelVersion,
      max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
      system: buildPerCategorySystemBlocks(),
      messages: [{ role: 'user', content: userText }],
    });
  } catch (error) {
    recordFlake('POST per-category-bulleted messages.create', error, {
      projectId,
      categoryName,
      corpusSize: reviews.length,
    });
    return {
      status: 502,
      body: {
        error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      },
    };
  }

  const text = extractTextFromContent(response.content);
  let parsed: unknown;
  try {
    parsed = extractJsonFromModelText(text);
  } catch (error) {
    recordFlake('POST per-category-bulleted parse JSON', error, {
      projectId,
      categoryName,
    });
    return { status: 502, body: { error: 'AI returned malformed JSON' } };
  }
  const validated = validatePerCategoryBulletedOutput(parsed);
  if (!validated) {
    return {
      status: 502,
      body: { error: 'AI output did not match the per-category schema' },
    };
  }

  // ── Persist ──
  let persistedId: string | null = null;
  try {
    const created = await withRetry(() =>
      prisma.reviewAnalysis.create({
        data: {
          level: 'PER_CATEGORY',
          urlId: null,
          projectId,
          typeFilter: categoryName,
          analysisJson: {
            summary: validated.summary,
          } as Prisma.InputJsonValue,
          reviewsHash: corpusHash,
          modelVersion,
          runByUserId: userId,
          costUsdMicros: null,
        },
        select: { id: true },
      })
    );
    persistedId = created.id;
  } catch (error) {
    recordFlake('POST per-category-bulleted persist', error, {
      projectId,
      categoryName,
    });
    // Soft-fail — return the fresh summary to the browser since the AI
    // call already cost money. Re-run will either hit cache (if a
    // parallel call persisted) or re-pay. Empty analysisId disables
    // the Edit affordance for this run.
  }

  const actualCostUsd = calculateCostUsd(modelVersion, {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
    cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
  });
  void toCostUsdMicros;
  // urlById intentionally unused outside cache pop; suppress the lint.
  void urlById;

  const freshResponse: PerCategoryBulletedResponseBody = {
    flow: 'per-category-bulleted',
    analysisId: persistedId ?? '',
    summary: validated.summary,
    source: 'fresh',
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
      actualCostUsd,
      estimatedCostUsd: estimatedCostUsdPC,
    },
  };
  return { status: 200, body: freshResponse };
}

export function makeReviewAnalysisRunBatchHandlers(
  deps: ReviewAnalysisRunBatchHandlerDeps
) {
  const { prisma, verifyAuth, anthropicClient, recordFlake, withRetry } = deps;

  async function POST(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyAuth(req, projectId, WORKFLOW);
    if (auth.error) return auth.error;
    const { projectWorkflowId, userId } = auth;

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    if (!rawBody || typeof rawBody !== 'object') {
      return { status: 400, body: { error: 'Body must be a JSON object' } };
    }
    const body = rawBody as {
      flow?: unknown;
      urlId?: unknown;
      urlIds?: unknown;
      categoryName?: unknown;
      reviewIds?: unknown;
      modelVersion?: unknown;
    };

    if (!isReviewAnalysisFlow(body.flow)) {
      return {
        status: 400,
        body: {
          error: `flow must be one of: ${SUPPORTED_FLOWS.join(', ')}`,
        },
      };
    }
    const flow = body.flow;
    if (!SHIPPED_FLOWS.has(flow)) {
      return {
        status: 400,
        body: {
          error: `flow '${flow}' is not yet shipped; supported flows: ${[...SHIPPED_FLOWS].join(', ')}.`,
        },
      };
    }

    const modelVersionFromBody =
      typeof body.modelVersion === 'string' && body.modelVersion.trim()
        ? body.modelVersion.trim()
        : DEFAULT_MODEL_VERSION;
    if (!isSupportedModelVersion(modelVersionFromBody)) {
      return {
        status: 400,
        body: {
          error: `modelVersion must be one of: claude-opus-4-7, claude-opus-4-6`,
        },
      };
    }

    // ─── Per-Category Comprehensive (bulleted) dispatch ─────────────
    //
    // Per-Category has a different request shape than the other two
    // shipped flows: { flow, categoryName, urlIds[], modelVersion }.
    // The server resolves all reviews under those URLs and pools them.
    // Persisted as ONE ReviewAnalysis row with level=PER_CATEGORY +
    // typeFilter=<categoryName> + urlId=null + projectId=<projectId>
    // (per schema comment line 539-541 "Stores category name in typeFilter
    // column"). Cache key is a SINGLE corpus hash over the sorted
    // resolved reviewIds + modelVersion + prompt-version + categoryName.
    if (flow === 'per-category-bulleted') {
      return await handlePerCategoryBulleted({
        projectId,
        projectWorkflowId,
        userId,
        body,
        modelVersion: modelVersionFromBody,
        prisma,
        anthropicClient,
        recordFlake,
        withRetry,
      });
    }

    const urlId = typeof body.urlId === 'string' ? body.urlId.trim() : '';
    if (!urlId) {
      return { status: 400, body: { error: 'urlId is required' } };
    }

    if (!Array.isArray(body.reviewIds) || body.reviewIds.length === 0) {
      return {
        status: 400,
        body: { error: 'reviewIds must be a non-empty array of strings' },
      };
    }
    const reviewIds: string[] = [];
    const seenIds = new Set<string>();
    for (const id of body.reviewIds) {
      if (typeof id !== 'string' || !id.trim()) {
        return {
          status: 400,
          body: { error: 'reviewIds must contain only non-empty strings' },
        };
      }
      const trimmed = id.trim();
      if (seenIds.has(trimmed)) {
        return {
          status: 400,
          body: { error: `reviewIds contains a duplicate: ${trimmed}` },
        };
      }
      seenIds.add(trimmed);
      reviewIds.push(trimmed);
    }

    // modelVersion is validated above (before the per-category early-
    // return) so it's safe to reuse here without re-checking.
    const modelVersion = modelVersionFromBody;

    let url: CompetitorUrlForBatchRow | null;
    let reviews: CapturedReviewForBatchRow[];
    try {
      url = await withRetry(() =>
        prisma.competitorUrl.findFirst({
          where: { id: urlId, projectWorkflowId },
          select: {
            id: true,
            projectWorkflowId: true,
            platform: true,
            productName: true,
          },
        })
      );
      if (!url) {
        return { status: 404, body: { error: 'Competitor URL not found' } };
      }
      reviews = await withRetry(() =>
        prisma.capturedReview.findMany({
          where: { id: { in: reviewIds }, competitorUrlId: urlId },
          select: {
            id: true,
            competitorUrlId: true,
            starRating: true,
            body: true,
            reviewerName: true,
            reviewDate: true,
          },
        })
      );
    } catch (error) {
      recordFlake('POST review-analysis-run-batch load', error, {
        projectId,
        urlId,
      });
      return {
        status: 500,
        body: { error: 'Failed to load reviews for batch' },
      };
    }

    // Verify every requested reviewId resolved to a real row scoped to
    // this URL. Surfacing a 404 here protects against the browser
    // sending stale IDs after a delete or against an attacker probing
    // for cross-URL reviews.
    if (reviews.length !== reviewIds.length) {
      const foundIds = new Set(reviews.map((r) => r.id));
      const missing = reviewIds.filter((id) => !foundIds.has(id));
      return {
        status: 404,
        body: {
          error: `Some reviewIds not found under this URL: ${missing.join(', ')}`,
          missing,
        },
      };
    }

    // ─── Per-Competitor Comprehensive (bulleted) dispatch ───────────
    //
    // Output is ONE aggregated summary across the full review corpus
    // for this CompetitorUrl. Persisted as ONE ReviewAnalysis row with
    // level='PER_PRODUCT' (per schema.prisma:537 — "one analysis per
    // CompetitorUrl"). Cache key is a SINGLE corpus hash over the
    // sorted reviewIds + modelVersion + prompt-version.
    if (flow === 'per-competitor-bulleted') {
      // Reorder loaded reviews to match the input reviewIds order so
      // the user message presents reviews in the same order the
      // browser supplied them. This is mostly cosmetic since the
      // model aggregates across all reviews anyway, but it keeps
      // prompt-text deterministic for cache + replay purposes.
      const reviewById = new Map(reviews.map((r) => [r.id, r]));
      const orderedReviews = reviewIds
        .map((id) => reviewById.get(id))
        .filter((r): r is CapturedReviewForBatchRow => r != null);

      const corpusCacheKeyVersion = `${modelVersion}|${PER_COMPETITOR_BULLETED_PROMPT_VERSION}`;
      const corpusHash = computeReviewsHash(
        reviewIds.map((id) => ({ id })),
        corpusCacheKeyVersion
      );

      let cachedRows: ReviewAnalysisCachedRow[];
      try {
        cachedRows = await withRetry(() =>
          prisma.reviewAnalysis.findMany({
            where: {
              urlId,
              level: 'PER_PRODUCT',
              reviewsHash: { in: [corpusHash] },
            },
            select: {
              id: true,
              reviewsHash: true,
              analysisJson: true,
              modelVersion: true,
            },
          })
        );
      } catch (error) {
        recordFlake('POST per-competitor-bulleted cache lookup', error, {
          projectId,
          urlId,
        });
        cachedRows = [];
      }

      // Pair each cached row with its summary so we can return the row
      // id alongside the summary text (the client needs both for the
      // Edit affordance).
      const cachedHit = cachedRows
        .map((r) => ({
          id: r.id,
          summary: summaryFromCachedJson(r.analysisJson),
        }))
        .find((entry): entry is { id: string; summary: string } => !!entry.summary);

      if (cachedHit) {
        const cachedResponse: PerCompetitorBulletedResponseBody = {
          flow: 'per-competitor-bulleted',
          analysisId: cachedHit.id,
          summary: cachedHit.summary,
          source: 'cache',
          usage: {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationInputTokens: 0,
            cacheReadInputTokens: 0,
            actualCostUsd: 0,
            estimatedCostUsd: 0,
          },
        };
        return { status: 200, body: cachedResponse };
      }

      const productName = url.productName ?? 'Unknown product';
      const userText = buildPerCompetitorBulletedUserMessage({
        productName,
        platform: url.platform,
        reviews: orderedReviews.map((r) => ({
          id: r.id,
          body: r.body,
          reviewerName: r.reviewerName,
          starRating: r.starRating,
          reviewDate: r.reviewDate,
        })),
      });

      let estimatedInputTokensPC = 0;
      try {
        estimatedInputTokensPC = await countMessageTokens({
          client: anthropicClient,
          model: modelVersion,
          system: PER_COMPETITOR_BULLETED_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userText }],
        });
      } catch (error) {
        recordFlake('POST per-competitor-bulleted countTokens', error, {
          projectId,
          urlId,
        });
      }
      // Per-competitor output is a single aggregated summary (~8-15
      // bullets × ~20 tokens/bullet ≈ ~200-400 output tokens). Headroom
      // factor of ~10× covers theme-heading overhead + outlier corpora.
      const estimatedOutputTokensPC = 4_000;
      const estimatedCostUsdPC = estimateCostUsd(
        modelVersion,
        estimatedInputTokensPC,
        estimatedOutputTokensPC
      );

      let responsePC: Anthropic.Message;
      try {
        responsePC = await anthropicClient.messages.create({
          model: modelVersion,
          max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
          system: buildPerCompetitorSystemBlocks(),
          messages: [{ role: 'user', content: userText }],
        });
      } catch (error) {
        recordFlake('POST per-competitor-bulleted messages.create', error, {
          projectId,
          urlId,
          corpusSize: orderedReviews.length,
        });
        return {
          status: 502,
          body: {
            error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
          },
        };
      }

      const textPC = extractTextFromContent(responsePC.content);
      let parsedPC: unknown;
      try {
        parsedPC = extractJsonFromModelText(textPC);
      } catch (error) {
        recordFlake('POST per-competitor-bulleted parse JSON', error, {
          projectId,
          urlId,
        });
        return {
          status: 502,
          body: { error: 'AI returned malformed JSON' },
        };
      }
      const validatedPC = validatePerCompetitorBulletedOutput(parsedPC);
      if (!validatedPC) {
        return {
          status: 502,
          body: { error: 'AI output did not match the per-competitor schema' },
        };
      }

      let persistedId: string | null = null;
      try {
        const created = await withRetry(() =>
          prisma.reviewAnalysis.create({
            data: {
              level: 'PER_PRODUCT',
              urlId,
              projectId,
              typeFilter: null,
              analysisJson: {
                summary: validatedPC.summary,
              } as Prisma.InputJsonValue,
              reviewsHash: corpusHash,
              modelVersion,
              runByUserId: userId,
              costUsdMicros: null,
            },
            select: { id: true },
          })
        );
        persistedId = created.id;
      } catch (error) {
        recordFlake('POST per-competitor-bulleted persist', error, {
          projectId,
          urlId,
        });
        // Soft-fail — return the fresh summary to the browser since the
        // AI call already cost money. Re-run will either hit cache (if
        // a parallel call persisted) or re-pay. The client gets an
        // empty analysisId, which disables the Edit affordance for
        // this run (best effort vs. lying about a non-existent id).
      }

      const actualCostUsdPC = calculateCostUsd(modelVersion, {
        inputTokens: responsePC.usage.input_tokens,
        outputTokens: responsePC.usage.output_tokens,
        cacheCreationInputTokens: responsePC.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: responsePC.usage.cache_read_input_tokens ?? 0,
      });
      void toCostUsdMicros;

      const freshResponse: PerCompetitorBulletedResponseBody = {
        flow: 'per-competitor-bulleted',
        analysisId: persistedId ?? '',
        summary: validatedPC.summary,
        source: 'fresh',
        usage: {
          inputTokens: responsePC.usage.input_tokens,
          outputTokens: responsePC.usage.output_tokens,
          cacheCreationInputTokens: responsePC.usage.cache_creation_input_tokens ?? 0,
          cacheReadInputTokens: responsePC.usage.cache_read_input_tokens ?? 0,
          actualCostUsd: actualCostUsdPC,
          estimatedCostUsd: estimatedCostUsdPC,
        },
      };
      return { status: 200, body: freshResponse };
    }

    // Compute the per-review cache hash for each reviewId. The hash
    // includes modelVersion AND the prompt version so re-running with
    // a different model OR a different prompt version produces a fresh
    // cache entry (and re-running with the same model + prompt hits
    // cache). The prompt version lives next to modelVersion in the
    // hash input — the DB still persists just modelVersion (no schema
    // change); prompt-version drift is implicit in the hash itself.
    const cacheKeyVersion = `${modelVersion}|${PER_REVIEW_SUMMARIZE_PROMPT_VERSION}`;
    const hashByReviewId = new Map<string, string>();
    const reviewIdByHash = new Map<string, string>();
    for (const id of reviewIds) {
      const hash = computeReviewsHash([{ id }], cacheKeyVersion);
      hashByReviewId.set(id, hash);
      reviewIdByHash.set(hash, id);
    }
    const allHashes = [...hashByReviewId.values()];

    let cachedRows: ReviewAnalysisCachedRow[];
    try {
      cachedRows = await withRetry(() =>
        prisma.reviewAnalysis.findMany({
          where: {
            urlId,
            level: 'PER_REVIEW',
            reviewsHash: { in: allHashes },
          },
          select: {
            id: true,
            reviewsHash: true,
            analysisJson: true,
            modelVersion: true,
          },
        })
      );
    } catch (error) {
      recordFlake('POST review-analysis-run-batch cache lookup', error, {
        projectId,
        urlId,
      });
      // Non-fatal — proceed with the assumption nothing is cached.
      cachedRows = [];
    }

    const cachedByReviewId = new Map<string, string>(); // reviewId → summary
    for (const row of cachedRows) {
      const summary = summaryFromCachedJson(row.analysisJson);
      const reviewId = reviewIdByHash.get(row.reviewsHash);
      if (summary && reviewId) {
        cachedByReviewId.set(reviewId, summary);
      }
    }

    const uncachedReviewIds = reviewIds.filter(
      (id) => !cachedByReviewId.has(id)
    );
    const uncachedReviews = reviews.filter((r) =>
      uncachedReviewIds.includes(r.id)
    );

    // No fresh work to do — return entirely from cache.
    if (uncachedReviewIds.length === 0) {
      const summaries: PerReviewBatchResponseEntry[] = reviewIds.map((id) => ({
        reviewId: id,
        summary: cachedByReviewId.get(id) ?? '',
        source: 'cache',
      }));
      const responseBody: PerReviewBatchResponseBody = {
        flow: flow as 'per-review-summarize',
        summaries,
        freshCount: 0,
        cachedCount: summaries.length,
        usage: {
          inputTokens: 0,
          outputTokens: 0,
          cacheCreationInputTokens: 0,
          cacheReadInputTokens: 0,
          actualCostUsd: 0,
          estimatedCostUsd: 0,
        },
      };
      return { status: 200, body: responseBody };
    }

    const productName = url.productName ?? 'Unknown product';
    const userText = buildPerReviewBatchUserMessage({
      productName,
      platform: url.platform,
      batchNumber: 1,
      totalBatches: 1,
      reviews: uncachedReviews.map((r) => ({
        id: r.id,
        body: r.body,
        reviewerName: r.reviewerName,
        starRating: r.starRating,
        reviewDate: r.reviewDate,
      })),
    });

    // Pre-flight count for the cost estimate (transparency-only per
    // §B 2026-05-27 Round 3 redirect — caps are no longer enforced).
    let estimatedInputTokens = 0;
    try {
      estimatedInputTokens = await countMessageTokens({
        client: anthropicClient,
        model: modelVersion,
        system: PER_REVIEW_SUMMARIZE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userText }],
      });
    } catch (error) {
      recordFlake('POST review-analysis-run-batch countTokens', error, {
        projectId,
        urlId,
      });
      // Non-fatal — leave estimate at 0; final cost still measured via
      // response.usage after the call returns.
    }
    const estimatedOutputTokens = Math.min(
      // Rough sizing: ~100 output tokens per uncached review on average.
      uncachedReviews.length * 100,
      PER_BATCH_MAX_OUTPUT_TOKENS
    );
    const estimatedCostUsd = estimateCostUsd(
      modelVersion,
      estimatedInputTokens,
      estimatedOutputTokens
    );

    let response: Anthropic.Message;
    try {
      response = await anthropicClient.messages.create({
        model: modelVersion,
        max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
        system: buildSystemBlocks(),
        messages: [{ role: 'user', content: userText }],
      });
    } catch (error) {
      recordFlake('POST review-analysis-run-batch messages.create', error, {
        projectId,
        urlId,
        uncachedCount: uncachedReviews.length,
      });
      return {
        status: 502,
        body: {
          error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        },
      };
    }

    const text = extractTextFromContent(response.content);
    let parsed: unknown;
    try {
      parsed = extractJsonFromModelText(text);
    } catch (error) {
      recordFlake('POST review-analysis-run-batch parse JSON', error, {
        projectId,
        urlId,
      });
      return {
        status: 502,
        body: { error: 'AI returned malformed JSON' },
      };
    }
    const validated = validatePerReviewBatchOutput(parsed);
    if (!validated) {
      return {
        status: 502,
        body: { error: 'AI output did not match the per-review batch schema' },
      };
    }

    const mismatch = findReviewIdMismatch(uncachedReviewIds, validated);
    if (mismatch) {
      // Hard fail — alignment matters. We persist NOTHING when the
      // model drops / invents / dupes ids, to avoid silently saving
      // the wrong summary against the wrong review.
      return {
        status: 502,
        body: {
          error: 'AI output reviewId alignment failed',
          missing: mismatch.missing,
          extra: mismatch.extra,
          duplicated: mismatch.duplicated,
        },
      };
    }

    // Persist N rows + collect fresh summaries indexed by reviewId.
    const freshByReviewId = new Map<string, string>();
    for (const entry of validated.summaries) {
      freshByReviewId.set(entry.reviewId, entry.summary);
    }

    const persistErrors: Array<{ reviewId: string; error: unknown }> = [];
    for (const entry of validated.summaries) {
      const hash = hashByReviewId.get(entry.reviewId);
      if (!hash) continue; // alignment check above guarantees this; defensive
      try {
        await withRetry(() =>
          prisma.reviewAnalysis.create({
            data: {
              level: 'PER_REVIEW',
              urlId,
              projectId,
              typeFilter: null,
              analysisJson: {
                reviewId: entry.reviewId,
                summary: entry.summary,
              } as Prisma.InputJsonValue,
              reviewsHash: hash,
              modelVersion,
              runByUserId: userId,
              // Per-row cost = total batch cost / N uncached reviews.
              // We persist this only after computing actualCostUsd
              // below; fall back to null until then.
              costUsdMicros: null,
            },
            select: { id: true },
          })
        );
      } catch (error) {
        persistErrors.push({ reviewId: entry.reviewId, error });
      }
    }
    if (persistErrors.length > 0) {
      recordFlake('POST review-analysis-run-batch persist', persistErrors[0]?.error, {
        projectId,
        urlId,
        failedReviewIds: persistErrors.map((e) => e.reviewId),
      });
      // Soft-fail — we still return the fresh summaries to the browser
      // since the AI call already cost money. The browser will rerun
      // and either hit cache (if some persisted) or re-pay.
    }

    const actualCostUsd = calculateCostUsd(modelVersion, {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
      cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
    });
    // Microdollars are persisted nullable for now; future enhancement
    // could update each row with its prorated cost after the call.
    void toCostUsdMicros;

    // Merge cached + fresh into a single response indexed by input order.
    const summaries: PerReviewBatchResponseEntry[] = reviewIds.map((id) => {
      const cached = cachedByReviewId.get(id);
      if (cached !== undefined) {
        return { reviewId: id, summary: cached, source: 'cache' as const };
      }
      const fresh = freshByReviewId.get(id) ?? '';
      return { reviewId: id, summary: fresh, source: 'fresh' as const };
    });

    const responseBody: PerReviewBatchResponseBody = {
      flow: flow as 'per-review-summarize',
      summaries,
      freshCount: validated.summaries.length,
      cachedCount: reviewIds.length - validated.summaries.length,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationInputTokens: response.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: response.usage.cache_read_input_tokens ?? 0,
        actualCostUsd,
        estimatedCostUsd,
      },
    };

    return { status: 200, body: responseBody };
  }

  return { POST };
}

// Helper used by the wire-type module + tests: takes a list of summary
// entries (validated) and returns just the strings indexed by reviewId.
export function indexSummariesByReviewId(
  summaries: ReadonlyArray<PerReviewSummaryEntry>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of summaries) {
    out[s.reviewId] = s.summary;
  }
  return out;
}
