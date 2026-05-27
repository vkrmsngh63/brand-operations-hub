// W#2 P-49 Workstream 5 — DI seam for POST per-product review analysis.
//
// Route: POST /api/projects/[projectId]/competition-scraping/review-analysis/run
// Body:  { urlId: string, modelVersion?: 'claude-opus-4-7' | 'claude-opus-4-6' }
//
// Flow:
//   1. Auth (verifyAuth) — gets projectWorkflowId + userId
//   2. Resolve CompetitorUrl by (urlId, projectWorkflowId) → productName, platform
//   3. Load CapturedReview rows for the URL
//   4. Compute reviewsHash; if a cached ReviewAnalysis row matches → return it
//   5. Batch reviews via adaptive-batch
//   6. Pre-flight: countTokens on one representative batch → estimate cost
//   7. Cost-cap gate (per-run + per-Project monthly)
//   8. First sweep — one messages.create per batch (system prompt cached)
//   9. Second sweep — one merge call (skipped when only one batch)
//  10. Persist ReviewAnalysis row; return wire shape
//
// Spec: docs/REVIEWS_PHASE_2_DESIGN.md §A.7-A.12 + §C.5.

import type { Prisma } from '@prisma/client';
import type Anthropic from '@anthropic-ai/sdk';

import type { ReviewAnalysis } from '../../shared-types/competition-scraping.ts';
import { isValidAnalysisPayload } from '../../rich-text/tiptap-helpers.ts';

import {
  DEFAULT_MODEL_VERSION,
  isSupportedModelVersion,
  type AnthropicClientLike,
} from '../review-analysis/client.ts';
import {
  adaptiveBatch,
  type BatchableReview,
} from '../review-analysis/batch-sizer.ts';
import { computeReviewsHash } from '../review-analysis/cache.ts';
import {
  checkCostCap,
  type CostCapPrismaLike,
} from '../review-analysis/cost-cap.ts';
import {
  calculateCostUsd,
  estimateCostUsd,
  toCostUsdMicros,
} from '../review-analysis/pricing.ts';
import {
  PER_PRODUCT_SYSTEM_PROMPT,
  buildPerProductBatchUserMessage,
  buildSecondSweepUserMessage,
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

// Per-call output budget. Sized so per-batch summaries fit a level-2-heading
// TipTap doc with 4-8 bullets per section + 2-4 short quotes — well under
// 8K tokens in practice. Second sweep gets more headroom since it merges
// across batches.
const PER_BATCH_MAX_TOKENS = 8_000;
const SECOND_SWEEP_MAX_TOKENS = 16_000;

export type Ctx = { params: Promise<{ projectId: string }> };

export type CompetitorUrlForAnalysisRow = {
  id: string;
  projectWorkflowId: string;
  platform: string;
  productName: string | null;
};

export type CapturedReviewForAnalysisRow = {
  id: string;
  starRating: number;
  body: string;
  reviewerName: string | null;
  reviewDate: Date | null;
};

export type ReviewAnalysisRow = {
  id: string;
  level: 'PER_REVIEW' | 'PER_PRODUCT' | 'PER_CATEGORY' | 'PER_TYPE' | 'PER_PROJECT';
  urlId: string | null;
  projectId: string | null;
  typeFilter: string | null;
  analysisJson: Prisma.JsonValue;
  reviewsHash: string;
  modelVersion: string;
  runAt: Date;
  runByUserId: string | null;
  costUsdMicros: number | null;
};

export type ReviewAnalysisRunPrismaLike = CostCapPrismaLike & {
  competitorUrl: {
    findFirst(args: {
      where: { id: string; projectWorkflowId: string };
      select: { id: true; projectWorkflowId: true; platform: true; productName: true };
    }): Promise<CompetitorUrlForAnalysisRow | null>;
  };
  capturedReview: {
    findMany(args: {
      where: { competitorUrlId: string };
      orderBy: Array<{ addedAt: 'asc' }>;
      select: {
        id: true;
        starRating: true;
        body: true;
        reviewerName: true;
        reviewDate: true;
      };
    }): Promise<CapturedReviewForAnalysisRow[]>;
  };
  reviewAnalysis: {
    aggregate: CostCapPrismaLike['reviewAnalysis']['aggregate'];
    findFirst(args: {
      where: {
        urlId: string;
        level: 'PER_PRODUCT';
        reviewsHash: string;
      };
      orderBy: Array<{ runAt: 'desc' }>;
    }): Promise<ReviewAnalysisRow | null>;
    create(args: {
      data: Prisma.ReviewAnalysisUncheckedCreateInput;
    }): Promise<ReviewAnalysisRow>;
  };
};

export type ReviewAnalysisRunHandlerDeps = {
  prisma: ReviewAnalysisRunPrismaLike;
  verifyAuth: VerifyAuthFn;
  anthropicClient: AnthropicClientLike;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

function toWireShape(row: ReviewAnalysisRow): ReviewAnalysis {
  return {
    id: row.id,
    level: row.level,
    urlId: row.urlId,
    projectId: row.projectId,
    typeFilter: row.typeFilter,
    analysisJson: toAnalysisJson(row.analysisJson),
    reviewsHash: row.reviewsHash,
    modelVersion: row.modelVersion,
    runAt: row.runAt.toISOString(),
    runByUserId: row.runByUserId,
    costUsdMicros: row.costUsdMicros,
  };
}

function toAnalysisJson(value: Prisma.JsonValue): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toBatchableReviews(
  rows: CapturedReviewForAnalysisRow[]
): BatchableReview[] {
  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    reviewerName: r.reviewerName,
    starRating: r.starRating,
    reviewDate: r.reviewDate,
  }));
}

// Pull the first JSON object out of the model's response. Per the system
// prompt, the model is instructed to emit ONLY the JSON — but real-world
// models sometimes wrap in fences or add a "Here's the analysis:" preamble.
// We strip ```json fences and trim to the outermost { ... } before parsing.
export function extractJsonFromModelText(text: string): unknown {
  let cleaned = text.trim();
  // Strip ```json ... ``` and ``` ... ``` fences if present.
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  // Find outermost JSON object boundaries.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('Model response did not contain a JSON object');
  }
  const jsonText = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonText);
}

// Pull the concatenated text content out of a messages.create response.
// Tool-use blocks aren't expected for v1; we skip them defensively.
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

function buildSystemBlocks(): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: PER_PRODUCT_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ];
}

export function makeReviewAnalysisRunHandlers(
  deps: ReviewAnalysisRunHandlerDeps
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
    const body = rawBody as { urlId?: unknown; modelVersion?: unknown };
    const urlId =
      typeof body.urlId === 'string' ? body.urlId.trim() : '';
    if (!urlId) {
      return { status: 400, body: { error: 'urlId is required' } };
    }
    const modelVersion =
      typeof body.modelVersion === 'string' && body.modelVersion.trim()
        ? body.modelVersion.trim()
        : DEFAULT_MODEL_VERSION;
    if (!isSupportedModelVersion(modelVersion)) {
      return {
        status: 400,
        body: {
          error: `modelVersion must be one of: claude-opus-4-7, claude-opus-4-6`,
        },
      };
    }

    let url: CompetitorUrlForAnalysisRow | null;
    let reviews: CapturedReviewForAnalysisRow[];
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
          where: { competitorUrlId: urlId },
          orderBy: [{ addedAt: 'asc' }],
          select: {
            id: true,
            starRating: true,
            body: true,
            reviewerName: true,
            reviewDate: true,
          },
        })
      );
    } catch (error) {
      recordFlake('POST review-analysis-run load', error, {
        projectId,
        urlId,
      });
      return {
        status: 500,
        body: { error: 'Failed to load reviews for analysis' },
      };
    }

    if (reviews.length === 0) {
      return {
        status: 400,
        body: { error: 'No reviews found for this URL; nothing to analyze' },
      };
    }

    const reviewsHash = computeReviewsHash(reviews, modelVersion);

    // Cache check — return existing analysis if the hash matches.
    try {
      const cached = await withRetry(() =>
        prisma.reviewAnalysis.findFirst({
          where: { urlId, level: 'PER_PRODUCT', reviewsHash },
          orderBy: [{ runAt: 'desc' }],
        })
      );
      if (cached) {
        return {
          status: 200,
          body: { cached: true, analysis: toWireShape(cached) },
        };
      }
    } catch (error) {
      recordFlake('POST review-analysis-run cache lookup', error, {
        projectId,
        urlId,
      });
      // Non-fatal — proceed to full run.
    }

    const batchable = toBatchableReviews(reviews);
    const { batches, oversizedReviewIds } = adaptiveBatch({
      reviews: batchable,
    });
    if (oversizedReviewIds.length > 0) {
      console.warn(
        `[review-analysis] ${oversizedReviewIds.length} oversized review(s) in URL ${urlId}: ${oversizedReviewIds.join(', ')}`
      );
    }

    // Pre-flight cost estimate — count tokens for batch 1 (representative),
    // then multiply by N batches + add second-sweep estimate.
    const productName = url.productName ?? 'Unknown product';
    let batch1InputTokens: number;
    try {
      batch1InputTokens = await countMessageTokens({
        client: anthropicClient,
        model: modelVersion,
        system: PER_PRODUCT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildPerProductBatchUserMessage({
              productName,
              platform: url.platform,
              batchNumber: 1,
              totalBatches: batches.length,
              reviews: batches[0],
            }),
          },
        ],
      });
    } catch (error) {
      recordFlake('POST review-analysis-run countTokens', error, {
        projectId,
        urlId,
      });
      return {
        status: 502,
        body: { error: 'Failed to estimate token count for analysis' },
      };
    }
    // Rough estimate; will under-count if later batches are larger and
    // over-count when cache reads kick in. Conservative for cost-cap intent.
    const estimatedInputTokens =
      batch1InputTokens * batches.length +
      // Second sweep input ≈ summary-doc-size × N batches ≈ ~1k tokens each
      (batches.length > 1 ? 1_500 * batches.length : 0);
    const estimatedOutputTokens =
      PER_BATCH_MAX_TOKENS * batches.length +
      (batches.length > 1 ? SECOND_SWEEP_MAX_TOKENS : 0);
    const estimatedCostUsd = estimateCostUsd(
      modelVersion,
      estimatedInputTokens,
      estimatedOutputTokens
    );

    const capResult = await checkCostCap({
      prisma,
      projectId,
      estimatedCostUsd,
    });
    if (!capResult.ok) {
      return {
        status: 402,
        body: {
          error: capResult.message,
          reason: capResult.reason,
          perRunCapUsd: capResult.perRunCapUsd,
          perMonthCapUsd: capResult.perMonthCapUsd,
          monthSpentUsd: capResult.monthSpentUsd,
          estimatedCostUsd: capResult.estimatedCostUsd,
        },
      };
    }

    // First sweep — per-batch summaries.
    const batchSummaries: unknown[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCacheCreationTokens = 0;
    let totalCacheReadTokens = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const userText = buildPerProductBatchUserMessage({
        productName,
        platform: url.platform,
        batchNumber: i + 1,
        totalBatches: batches.length,
        reviews: batch,
      });
      let response: Anthropic.Message;
      try {
        response = await anthropicClient.messages.create({
          model: modelVersion,
          max_tokens: PER_BATCH_MAX_TOKENS,
          system: buildSystemBlocks(),
          messages: [{ role: 'user', content: userText }],
        });
      } catch (error) {
        recordFlake('POST review-analysis-run first-sweep', error, {
          projectId,
          urlId,
          batchIndex: i,
        });
        return {
          status: 502,
          body: { error: `AI call failed on batch ${i + 1} of ${batches.length}` },
        };
      }

      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
      totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;
      totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0;

      const text = extractTextFromContent(response.content);
      let parsed: unknown;
      try {
        parsed = extractJsonFromModelText(text);
      } catch (error) {
        recordFlake('POST review-analysis-run parse batch JSON', error, {
          projectId,
          urlId,
          batchIndex: i,
        });
        return {
          status: 502,
          body: { error: `AI returned invalid JSON on batch ${i + 1}` },
        };
      }
      if (!isValidAnalysisPayload(parsed)) {
        return {
          status: 502,
          body: { error: `AI batch summary was not a valid TipTap doc on batch ${i + 1}` },
        };
      }
      batchSummaries.push(parsed);
    }

    // Second sweep — merge (only when >1 batch).
    let finalAnalysis: Record<string, unknown>;
    if (batches.length === 1) {
      finalAnalysis = batchSummaries[0] as Record<string, unknown>;
    } else {
      const userText = buildSecondSweepUserMessage({
        productName,
        platform: url.platform,
        totalReviewsAnalyzed: reviews.length,
        batchSummariesJson: batchSummaries,
      });
      let response: Anthropic.Message;
      try {
        response = await anthropicClient.messages.create({
          model: modelVersion,
          max_tokens: SECOND_SWEEP_MAX_TOKENS,
          system: buildSystemBlocks(),
          messages: [{ role: 'user', content: userText }],
        });
      } catch (error) {
        recordFlake('POST review-analysis-run second-sweep', error, {
          projectId,
          urlId,
        });
        return {
          status: 502,
          body: { error: 'AI call failed on second-sweep merge' },
        };
      }
      totalInputTokens += response.usage.input_tokens;
      totalOutputTokens += response.usage.output_tokens;
      totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;
      totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0;

      const text = extractTextFromContent(response.content);
      let parsed: unknown;
      try {
        parsed = extractJsonFromModelText(text);
      } catch (error) {
        recordFlake('POST review-analysis-run parse second-sweep', error, {
          projectId,
          urlId,
        });
        return {
          status: 502,
          body: { error: 'AI returned invalid JSON on second-sweep' },
        };
      }
      if (!isValidAnalysisPayload(parsed)) {
        return {
          status: 502,
          body: { error: 'AI second-sweep was not a valid TipTap doc' },
        };
      }
      finalAnalysis = parsed as Record<string, unknown>;
    }

    const actualCostUsd = calculateCostUsd(modelVersion, {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      cacheCreationInputTokens: totalCacheCreationTokens,
      cacheReadInputTokens: totalCacheReadTokens,
    });
    const costUsdMicros = toCostUsdMicros(actualCostUsd);

    let saved: ReviewAnalysisRow;
    try {
      saved = await withRetry(() =>
        prisma.reviewAnalysis.create({
          data: {
            level: 'PER_PRODUCT',
            urlId,
            projectId,
            typeFilter: null,
            analysisJson: finalAnalysis as Prisma.InputJsonValue,
            reviewsHash,
            modelVersion,
            runByUserId: userId,
            costUsdMicros,
          },
        })
      );
    } catch (error) {
      recordFlake('POST review-analysis-run persist', error, {
        projectId,
        urlId,
      });
      return {
        status: 500,
        body: { error: 'Failed to persist review analysis' },
      };
    }

    return {
      status: 201,
      body: {
        cached: false,
        analysis: toWireShape(saved),
        usage: {
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          cacheCreationInputTokens: totalCacheCreationTokens,
          cacheReadInputTokens: totalCacheReadTokens,
          actualCostUsd,
          estimatedCostUsd,
          batchCount: batches.length,
          oversizedReviewIds,
        },
      },
    };
  }

  return { POST };
}
