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

import { createHash } from 'node:crypto';

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
  summaryStringToTipTapDoc,
  appendSummaryToTipTapDoc,
  tipTapDocContainsSummary,
  isValidOverallAnalysesBag,
} from '../../rich-text/tiptap-helpers.ts';
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
  validatePerCompetitorStructuredOutput,
  resolveReviewRefs,
  flattenCategoriesToSummaryString,
  type PerCompetitorStructuredAnalysis,
  PER_COMPETITOR_NONBULLETED_PROMPT_VERSION,
  PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT,
  buildPerCompetitorNonBulletedUserMessage,
  normalizeNonBulletedProse,
  type PerCompetitorStructuredCategory,
  // Per-CATEGORY flows (Session 2)
  PER_CATEGORY_BULLETED_PROMPT_VERSION,
  PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
  buildPerCategoryBulletedUserMessage,
  validatePerCategoryStructuredOutput,
  PER_CATEGORY_NONBULLETED_PROMPT_VERSION,
  PER_CATEGORY_NONBULLETED_SYSTEM_PROMPT,
  buildPerCategoryNonBulletedUserMessage,
} from '../review-analysis/prompts.ts';
import {
  collectCategoryInputBullets,
  buildCategoryStructuredAnalysis,
  canonicalizeCategoryInputBullets,
} from '../category-analysis-aggregation.ts';
import {
  selectBulletedAnalysisRow,
  parseTraceabilityAnalysis,
} from '../reviews-traceability.ts';
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
  'per-competitor-nonbulleted',
  // P-49 W5 Category page Session 2 (2026-05-30-b).
  'per-category-bulleted',
  'per-category-nonbulleted',
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

// P-49 W5 Category page Session 2 — rows read by the per-category flows.
export type CompetitorUrlNameRow = { id: string; productName: string | null };
export type ReviewAnalysisScanRow = {
  id: string;
  level: string;
  urlId: string | null;
  analysisJson: Prisma.JsonValue;
};
export type ReviewAnalysisCategoryCacheRow = {
  id: string;
  analysisJson: Prisma.JsonValue;
};

// The category flows need a few queries the rigid per-url deps type doesn't
// declare. Rather than widen that shared type (which the real PrismaClient +
// the per-competitor mock both satisfy precisely), the category branch casts
// `prisma` to this narrow local view — the real client + a category-aware
// mock both satisfy it structurally.
export type CategoryQueryPrisma = {
  competitorUrl: {
    findMany(args: {
      where: { id: { in: string[] }; projectWorkflowId: string };
      select: { id: true; productName: true };
    }): Promise<CompetitorUrlNameRow[]>;
    findUnique(args: {
      where: { id: string };
      select: { overallAnalyses: true };
    }): Promise<{ overallAnalyses: Prisma.JsonValue } | null>;
    update(args: {
      where: { id: string };
      data: { overallAnalyses: Prisma.InputJsonValue };
    }): Promise<{ id: string }>;
  };
  reviewAnalysis: {
    findMany(args: {
      where: { urlId: { in: string[] }; level: 'PER_PRODUCT' };
      select: { id: true; level: true; urlId: true; analysisJson: true };
      orderBy: { runAt: 'asc' };
    }): Promise<ReviewAnalysisScanRow[]>;
    findMany(args: {
      where: {
        projectId: string;
        level: 'PER_CATEGORY';
        typeFilter: string;
        reviewsHash: { in: string[] };
      };
      select: { id: true; analysisJson: true };
    }): Promise<ReviewAnalysisCategoryCacheRow[]>;
    create(args: {
      data: Prisma.ReviewAnalysisUncheckedCreateInput;
      select: { id: true };
    }): Promise<ReviewAnalysisCreatedRow>;
  };
};

export type ReviewAnalysisRunBatchPrismaLike = {
  competitorUrl: {
    findFirst(args: {
      where: { id: string; projectWorkflowId: string };
      select: { id: true; projectWorkflowId: true; platform: true; productName: true };
    }): Promise<CompetitorUrlForBatchRow | null>;
    // P-49 W5 Fix Session B (2026-05-30) — read-modify-write of the
    // overallAnalyses bag for the per-competitor bulleted write-back into
    // the "Overall Analysis — Captured Reviews" box (append-merge at bottom).
    findUnique(args: {
      where: { id: string };
      select: { overallAnalyses: true };
    }): Promise<{ overallAnalyses: Prisma.JsonValue } | null>;
    update(args: {
      where: { id: string };
      data: { overallAnalyses: Prisma.InputJsonValue };
    }): Promise<{ id: string }>;
  };
  capturedReview: {
    findMany(args: {
      where: { id: { in: string[] }; competitorUrlId: string };
      select: {
        id: true;
        competitorUrlId: true;
        starRating: true;
        body: true;
        reviewerName: true;
        reviewDate: true;
      };
    }): Promise<CapturedReviewForBatchRow[]>;
    // P-49 W5 Fix Session B (2026-05-30) — per-review summary write-back into
    // the review's "Your Analysis" box (CapturedReview.analysis TipTap doc).
    update(args: {
      where: { id: string };
      data: { analysis: Prisma.InputJsonValue };
    }): Promise<{ id: string }>;
  };
  reviewAnalysis: {
    // Per-review flow queries by reviewsHash[] (one hash per reviewId);
    // per-competitor flow queries by a single corpus hash. Both pass a
    // `reviewsHash: { in: [...] }` filter — singular case just sends a
    // one-element array. The `level` field is the discriminator.
    findMany(args: {
      where: {
        urlId: string;
        level: 'PER_REVIEW' | 'PER_PRODUCT';
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
  // P-49 W5 Fix Session B (2026-05-30; D-11) — the PER_REVIEW ReviewAnalysis
  // row id, so the client can PATCH the summary via the Edit affordance
  // (same as the per-competitor banner's analysisId). Empty string when the
  // row failed to persist (soft-fail) — disables Edit for that entry.
  analysisId: string;
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

// Per-Competitor NON-bulleted wire shape — P-49 W5 Fix Session C. ONE
// prose summary per call. `summary` carries the flowing prose paragraphs
// (stored under analysisJson.summary alongside an analysisJson.flow
// discriminator so the GET hydration + Edit affordance can tell it apart
// from the bulleted PER_PRODUCT row at the same urlId). analysisId is the
// stored row id for the in-page Edit affordance.
export interface PerCompetitorNonBulletedResponseBody {
  flow: 'per-competitor-nonbulleted';
  analysisId: string;
  summary: string;
  source: 'cache' | 'fresh';
  usage: PerReviewBatchUsage;
}

// Per-CATEGORY bulleted wire shape — P-49 W5 Category page Session 2. ONE
// deduplicated category summary per call. `categoryKey` is echoed back so the
// browser can verify the response matches the category cell it dispatched for
// before painting (director's "redundancies … no cell mistakenly skipped"
// directive). `categories` carries the structured bullets + each bullet's
// UNIONED source reviewIds — the browser renders the bullets into Column 12
// AND resolves the reviewIds into the NEW "Source Reviews" column. `summary`
// is the flattened text for the Column-12 cell + Edit affordance.
export interface PerCategoryBulletedResponseBody {
  flow: 'per-category-bulleted';
  categoryKey: string;
  analysisId: string;
  summary: string;
  categories: PerCompetitorStructuredCategory[];
  source: 'cache' | 'fresh';
  usage: PerReviewBatchUsage;
}

// Per-CATEGORY NON-bulleted wire shape — ONE prose summary per call,
// discriminated in analysisJson.flow like the per-competitor non-bulleted
// row. The prose paints Column 13 + appends to each in-category competitor's
// "Overall Analysis — Captured Reviews" box (handler write-back).
export interface PerCategoryNonBulletedResponseBody {
  flow: 'per-category-nonbulleted';
  categoryKey: string;
  analysisId: string;
  summary: string;
  source: 'cache' | 'fresh';
  usage: PerReviewBatchUsage;
}

export type RunBatchResponseBody =
  | PerReviewBatchResponseBody
  | PerCompetitorBulletedResponseBody
  | PerCompetitorNonBulletedResponseBody
  | PerCategoryBulletedResponseBody
  | PerCategoryNonBulletedResponseBody;

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

function buildPerCompetitorNonBulletedSystemBlocks(): Anthropic.TextBlockParam[] {
  return [
    {
      type: 'text',
      text: PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT,
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
      reviewIds?: unknown;
      modelVersion?: unknown;
      // P-49 W5 Fix Session C — the non-bulleted flow's INPUT is the
      // bulleted summary already shown in Column 9 for this URL (the
      // browser supplies it from competitorSummaryByUrlId), not the raw
      // review corpus. Required for flow='per-competitor-nonbulleted'.
      bulletedSummary?: unknown;
      // P-49 W5 Category page Session 2 — the per-category flows operate on a
      // whole category (a set of competitor urls), not a single urlId.
      categoryKey?: unknown; // the category label (typeFilter); '(Uncategorized)' etc.
      urlIds?: unknown; // the competitor urls in this category (input + write-back targets)
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

    // ─── Per-CATEGORY flows (Session 2) ──────────────────────────────────
    // These aggregate across a whole category (a set of competitor urls), so
    // they branch BEFORE the single-urlId contract below. The bulleted flow
    // dedups the per-competitor bulleted summaries + traces each category
    // bullet to its source reviews; the non-bulleted flow rewrites the
    // category bulleted summary as prose + appends it to each in-category
    // competitor's "Overall Analysis — Captured Reviews" box.
    if (flow === 'per-category-bulleted' || flow === 'per-category-nonbulleted') {
      const categoryKey =
        typeof body.categoryKey === 'string' ? body.categoryKey.trim() : '';
      if (!categoryKey) {
        return {
          status: 400,
          body: { error: 'categoryKey is required for per-category flows' },
        };
      }
      const catModelVersion =
        typeof body.modelVersion === 'string' && body.modelVersion.trim()
          ? body.modelVersion.trim()
          : DEFAULT_MODEL_VERSION;
      if (!isSupportedModelVersion(catModelVersion)) {
        return {
          status: 400,
          body: {
            error: `modelVersion must be one of: claude-opus-4-7, claude-opus-4-6`,
          },
        };
      }

      // Narrow view of `prisma` carrying the category-specific queries the
      // rigid per-url deps type doesn't declare (see CategoryQueryPrisma).
      const catPrisma = prisma as unknown as CategoryQueryPrisma;

      // urlIds = the competitors in this category. Required for the bulleted
      // flow (the input source) AND the non-bulleted flow (write-back targets).
      const catUrlIds: string[] = [];
      if (!Array.isArray(body.urlIds) || body.urlIds.length === 0) {
        return {
          status: 400,
          body: {
            error: 'urlIds must be a non-empty array of strings for per-category flows',
          },
        };
      }
      {
        const seen = new Set<string>();
        for (const id of body.urlIds) {
          if (typeof id !== 'string' || !id.trim()) {
            return {
              status: 400,
              body: { error: 'urlIds must contain only non-empty strings' },
            };
          }
          const t = id.trim();
          if (!seen.has(t)) {
            seen.add(t);
            catUrlIds.push(t);
          }
        }
      }

      // Confirm every url belongs to this project's workflow + grab product
      // names (shown in the Source Reviews cell to disambiguate products).
      let catUrls: Array<{ id: string; productName: string | null }>;
      try {
        catUrls = await withRetry(() =>
          catPrisma.competitorUrl.findMany({
            where: { id: { in: catUrlIds }, projectWorkflowId },
            select: { id: true, productName: true },
          })
        );
      } catch (error) {
        recordFlake('POST per-category load urls', error, { projectId });
        return { status: 502, body: { error: 'Failed to load category competitors' } };
      }
      if (catUrls.length !== catUrlIds.length) {
        return {
          status: 404,
          body: { error: 'One or more competitor URLs not found in this project' },
        };
      }
      const productNameById = new Map(
        catUrls.map((u) => [u.id, u.productName ?? 'Unknown product'])
      );

      const ZERO_USAGE = {
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationInputTokens: 0,
        cacheReadInputTokens: 0,
        actualCostUsd: 0,
        estimatedCostUsd: 0,
      };

      // ── Category Comprehensive (bulleted) — dedup + provenance ──────────
      if (flow === 'per-category-bulleted') {
        // Load the per-competitor PER_PRODUCT rows for these urls; pick each
        // url's latest BULLETED (structured) row, excluding the non-bulleted
        // prose row, via the shared selector.
        let perProductRows: ReviewAnalysisScanRow[];
        try {
          perProductRows = await withRetry(() =>
            catPrisma.reviewAnalysis.findMany({
              where: { urlId: { in: catUrlIds }, level: 'PER_PRODUCT' },
              select: { id: true, level: true, urlId: true, analysisJson: true },
              orderBy: { runAt: 'asc' },
            })
          );
        } catch (error) {
          recordFlake('POST per-category-bulleted load per-product', error, {
            projectId,
          });
          return {
            status: 502,
            body: { error: 'Failed to load competitor summaries' },
          };
        }

        const competitors = catUrlIds.map((uid) => ({
          urlId: uid,
          productName: productNameById.get(uid) ?? 'Unknown product',
          analysisJson:
            selectBulletedAnalysisRow(perProductRows, uid)?.analysisJson ?? null,
        }));
        const { inputBullets, bulletsByLabel } =
          collectCategoryInputBullets(competitors);

        if (inputBullets.length === 0) {
          return {
            status: 400,
            body: {
              error:
                'No competitor bulleted summaries found for this category — generate the per-competitor bulleted summaries first',
            },
          };
        }

        const catCacheKeyVersion = `${catModelVersion}|${PER_CATEGORY_BULLETED_PROMPT_VERSION}`;
        const catHash = createHash('sha256')
          .update(
            `${categoryKey}\n${canonicalizeCategoryInputBullets(inputBullets)}\n|${catCacheKeyVersion}`
          )
          .digest('hex');

        let catCachedRows: ReviewAnalysisCategoryCacheRow[];
        try {
          catCachedRows = await withRetry(() =>
            catPrisma.reviewAnalysis.findMany({
              where: {
                projectId,
                level: 'PER_CATEGORY',
                typeFilter: categoryKey,
                reviewsHash: { in: [catHash] },
              },
              select: { id: true, analysisJson: true },
            })
          );
        } catch (error) {
          recordFlake('POST per-category-bulleted cache lookup', error, {
            projectId,
          });
          catCachedRows = [];
        }
        const catCachedHit = catCachedRows
          .map((r) => ({
            id: r.id,
            summary: summaryFromCachedJson(r.analysisJson),
            categories:
              parseTraceabilityAnalysis(r.analysisJson)?.categories ?? [],
          }))
          .find((e): e is { id: string; summary: string; categories: PerCompetitorStructuredCategory[] } => !!e.summary);
        if (catCachedHit) {
          const cachedResponse: PerCategoryBulletedResponseBody = {
            flow: 'per-category-bulleted',
            categoryKey,
            analysisId: catCachedHit.id,
            summary: catCachedHit.summary,
            categories: catCachedHit.categories,
            source: 'cache',
            usage: ZERO_USAGE,
          };
          return { status: 200, body: cachedResponse };
        }

        const userText = buildPerCategoryBulletedUserMessage({
          categoryName: categoryKey,
          inputBullets,
        });
        let estInputTokens = 0;
        try {
          estInputTokens = await countMessageTokens({
            client: anthropicClient,
            model: catModelVersion,
            system: PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userText }],
          });
        } catch (error) {
          recordFlake('POST per-category-bulleted countTokens', error, {
            projectId,
          });
        }
        const estCost = estimateCostUsd(catModelVersion, estInputTokens, 4_000);

        let resp: Anthropic.Message;
        try {
          resp = await anthropicClient.messages.create({
            model: catModelVersion,
            max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
            system: PER_CATEGORY_BULLETED_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userText }],
          });
        } catch (error) {
          recordFlake('POST per-category-bulleted messages.create', error, {
            projectId,
          });
          return {
            status: 502,
            body: {
              error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
            },
          };
        }
        const text = extractTextFromContent(resp.content);
        let parsed: unknown;
        try {
          parsed = extractJsonFromModelText(text);
        } catch (error) {
          recordFlake('POST per-category-bulleted parse JSON', error, {
            projectId,
          });
          return { status: 502, body: { error: 'AI returned malformed JSON' } };
        }
        const modelOut = validatePerCategoryStructuredOutput(parsed);
        if (!modelOut) {
          return {
            status: 502,
            body: { error: 'AI output did not match the per-category schema' },
          };
        }
        const structured = buildCategoryStructuredAnalysis(
          modelOut,
          bulletsByLabel
        );
        const summary = flattenCategoriesToSummaryString(structured);

        let persistedId: string | null = null;
        try {
          const created = await withRetry(() =>
            prisma.reviewAnalysis.create({
              data: {
                level: 'PER_CATEGORY',
                urlId: null,
                projectId,
                typeFilter: categoryKey,
                analysisJson: {
                  summary,
                  categories: structured.categories,
                } as unknown as Prisma.InputJsonValue,
                reviewsHash: catHash,
                modelVersion: catModelVersion,
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
          });
        }

        const actualCost = calculateCostUsd(catModelVersion, {
          inputTokens: resp.usage.input_tokens,
          outputTokens: resp.usage.output_tokens,
          cacheCreationInputTokens: resp.usage.cache_creation_input_tokens ?? 0,
          cacheReadInputTokens: resp.usage.cache_read_input_tokens ?? 0,
        });
        const freshResponse: PerCategoryBulletedResponseBody = {
          flow: 'per-category-bulleted',
          categoryKey,
          analysisId: persistedId ?? '',
          summary,
          categories: structured.categories,
          source: 'fresh',
          usage: {
            inputTokens: resp.usage.input_tokens,
            outputTokens: resp.usage.output_tokens,
            cacheCreationInputTokens: resp.usage.cache_creation_input_tokens ?? 0,
            cacheReadInputTokens: resp.usage.cache_read_input_tokens ?? 0,
            actualCostUsd: actualCost,
            estimatedCostUsd: estCost,
          },
        };
        return { status: 200, body: freshResponse };
      }

      // ── Category Comprehensive (NON-bulleted) — prose + write-back ──────
      const catBulletedSummary =
        typeof body.bulletedSummary === 'string'
          ? body.bulletedSummary.trim()
          : '';
      if (!catBulletedSummary) {
        return {
          status: 400,
          body: {
            error:
              'bulletedSummary is required for the per-category non-bulleted flow — generate the category bulleted summary first',
          },
        };
      }
      const nbCacheKeyVersion = `${catModelVersion}|${PER_CATEGORY_NONBULLETED_PROMPT_VERSION}`;
      const nbHash = createHash('sha256')
        .update(`${categoryKey}\n${catBulletedSummary}\n|${nbCacheKeyVersion}`)
        .digest('hex');

      let nbCachedRows: ReviewAnalysisCategoryCacheRow[];
      try {
        nbCachedRows = await withRetry(() =>
          catPrisma.reviewAnalysis.findMany({
            where: {
              projectId,
              level: 'PER_CATEGORY',
              typeFilter: categoryKey,
              reviewsHash: { in: [nbHash] },
            },
            select: { id: true, analysisJson: true },
          })
        );
      } catch (error) {
        recordFlake('POST per-category-nonbulleted cache lookup', error, {
          projectId,
        });
        nbCachedRows = [];
      }
      const nbCachedHit = nbCachedRows
        .map((r) => ({ id: r.id, summary: summaryFromCachedJson(r.analysisJson) }))
        .find((e): e is { id: string; summary: string } => !!e.summary);
      if (nbCachedHit) {
        const cachedResponse: PerCategoryNonBulletedResponseBody = {
          flow: 'per-category-nonbulleted',
          categoryKey,
          analysisId: nbCachedHit.id,
          summary: nbCachedHit.summary,
          source: 'cache',
          usage: ZERO_USAGE,
        };
        return { status: 200, body: cachedResponse };
      }

      const nbUserText = buildPerCategoryNonBulletedUserMessage({
        categoryName: categoryKey,
        bulletedSummary: catBulletedSummary,
      });
      let nbEstInputTokens = 0;
      try {
        nbEstInputTokens = await countMessageTokens({
          client: anthropicClient,
          model: catModelVersion,
          system: PER_CATEGORY_NONBULLETED_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: nbUserText }],
        });
      } catch (error) {
        recordFlake('POST per-category-nonbulleted countTokens', error, {
          projectId,
        });
      }
      const nbEstCost = estimateCostUsd(catModelVersion, nbEstInputTokens, 4_000);

      let nbResp: Anthropic.Message;
      try {
        nbResp = await anthropicClient.messages.create({
          model: catModelVersion,
          max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
          system: PER_CATEGORY_NONBULLETED_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: nbUserText }],
        });
      } catch (error) {
        recordFlake('POST per-category-nonbulleted messages.create', error, {
          projectId,
        });
        return {
          status: 502,
          body: {
            error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
          },
        };
      }
      const nbProse = normalizeNonBulletedProse(
        extractTextFromContent(nbResp.content)
      );
      if (!nbProse) {
        return {
          status: 502,
          body: { error: 'AI returned empty prose' },
        };
      }

      let nbPersistedId: string | null = null;
      try {
        const created = await withRetry(() =>
          prisma.reviewAnalysis.create({
            data: {
              level: 'PER_CATEGORY',
              urlId: null,
              projectId,
              typeFilter: categoryKey,
              analysisJson: {
                summary: nbProse,
                flow: 'per-category-nonbulleted',
              } as unknown as Prisma.InputJsonValue,
              reviewsHash: nbHash,
              modelVersion: catModelVersion,
              runByUserId: userId,
              costUsdMicros: null,
            },
            select: { id: true },
          })
        );
        nbPersistedId = created.id;
      } catch (error) {
        recordFlake('POST per-category-nonbulleted persist', error, {
          projectId,
        });
      }

      // Write-back: append the category prose to the BOTTOM of EACH in-category
      // competitor's "Overall Analysis — Captured Reviews" box per §1 verbatim
      // "merge, never overwrite". Idempotent via tipTapDocContainsSummary.
      for (const uid of catUrlIds) {
        try {
          const cu = await withRetry(() =>
            prisma.competitorUrl.findUnique({
              where: { id: uid },
              select: { overallAnalyses: true },
            })
          );
          const bag = isValidOverallAnalysesBag(cu?.overallAnalyses)
            ? (cu!.overallAnalyses as Record<string, Record<string, unknown>>)
            : {};
          const existingReviews = bag.reviews ?? {};
          if (!tipTapDocContainsSummary(existingReviews, nbProse)) {
            const merged = appendSummaryToTipTapDoc(existingReviews, nbProse);
            await withRetry(() =>
              prisma.competitorUrl.update({
                where: { id: uid },
                data: {
                  overallAnalyses: { ...bag, reviews: merged } as Prisma.InputJsonValue,
                },
              })
            );
          }
        } catch (error) {
          recordFlake('POST per-category-nonbulleted writeback', error, {
            projectId,
          });
        }
      }

      const nbActualCost = calculateCostUsd(catModelVersion, {
        inputTokens: nbResp.usage.input_tokens,
        outputTokens: nbResp.usage.output_tokens,
        cacheCreationInputTokens: nbResp.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: nbResp.usage.cache_read_input_tokens ?? 0,
      });
      const nbFreshResponse: PerCategoryNonBulletedResponseBody = {
        flow: 'per-category-nonbulleted',
        categoryKey,
        analysisId: nbPersistedId ?? '',
        summary: nbProse,
        source: 'fresh',
        usage: {
          inputTokens: nbResp.usage.input_tokens,
          outputTokens: nbResp.usage.output_tokens,
          cacheCreationInputTokens: nbResp.usage.cache_creation_input_tokens ?? 0,
          cacheReadInputTokens: nbResp.usage.cache_read_input_tokens ?? 0,
          actualCostUsd: nbActualCost,
          estimatedCostUsd: nbEstCost,
        },
      };
      return { status: 200, body: nbFreshResponse };
    }

    const urlId = typeof body.urlId === 'string' ? body.urlId.trim() : '';
    if (!urlId) {
      return { status: 400, body: { error: 'urlId is required' } };
    }

    // P-49 W5 Fix Session C — the non-bulleted flow does NOT read the raw
    // review corpus (its input is the bulleted summary supplied in the
    // body), so it does not require reviewIds. Every other flow does.
    const requiresReviews = flow !== 'per-competitor-nonbulleted';
    const reviewIds: string[] = [];
    if (requiresReviews) {
      if (!Array.isArray(body.reviewIds) || body.reviewIds.length === 0) {
        return {
          status: 400,
          body: { error: 'reviewIds must be a non-empty array of strings' },
        };
      }
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

    let url: CompetitorUrlForBatchRow | null;
    let reviews: CapturedReviewForBatchRow[] = [];
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
      if (requiresReviews) {
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
      }
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
    // for cross-URL reviews. Skipped for the non-bulleted flow (no corpus).
    if (requiresReviews && reviews.length !== reviewIds.length) {
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

    // ─── Per-Competitor Comprehensive (NON-bulleted) dispatch ───────
    //
    // P-49 W5 Fix Session C. INPUT is the bulleted summary already shown
    // in Column 9 for this URL (the browser supplies it; it only fires
    // this flow for URLs that HAVE a bulleted summary — others are
    // skipped + flagged client-side). Output is ONE prose paragraph block
    // persisted as a SECOND PER_PRODUCT ReviewAnalysis row, discriminated
    // from the bulleted row by analysisJson.flow. Cache key is over the
    // bulleted source text + model + prompt-version, so editing or
    // re-running the bulleted summary invalidates the non-bulleted cache.
    if (flow === 'per-competitor-nonbulleted') {
      const bulletedSummary =
        typeof body.bulletedSummary === 'string' ? body.bulletedSummary.trim() : '';
      if (!bulletedSummary) {
        return {
          status: 400,
          body: {
            error:
              'bulletedSummary is required for the non-bulleted flow — generate the bulleted summary for this competitor first',
          },
        };
      }

      const nbHash = createHash('sha256')
        .update(
          `${bulletedSummary}\n|${modelVersion}|${PER_COMPETITOR_NONBULLETED_PROMPT_VERSION}`
        )
        .digest('hex');

      let nbCachedRows: ReviewAnalysisCachedRow[];
      try {
        nbCachedRows = await withRetry(() =>
          prisma.reviewAnalysis.findMany({
            where: {
              urlId,
              level: 'PER_PRODUCT',
              reviewsHash: { in: [nbHash] },
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
        recordFlake('POST per-competitor-nonbulleted cache lookup', error, {
          projectId,
          urlId,
        });
        nbCachedRows = [];
      }

      const nbCachedHit = nbCachedRows
        .map((r) => ({ id: r.id, summary: summaryFromCachedJson(r.analysisJson) }))
        .find((entry): entry is { id: string; summary: string } => !!entry.summary);

      if (nbCachedHit) {
        const cachedResponse: PerCompetitorNonBulletedResponseBody = {
          flow: 'per-competitor-nonbulleted',
          analysisId: nbCachedHit.id,
          summary: nbCachedHit.summary,
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

      const productNameNB = url.productName ?? 'Unknown product';
      const userTextNB = buildPerCompetitorNonBulletedUserMessage({
        productName: productNameNB,
        platform: url.platform,
        bulletedSummary,
      });

      let estimatedInputTokensNB = 0;
      try {
        estimatedInputTokensNB = await countMessageTokens({
          client: anthropicClient,
          model: modelVersion,
          system: PER_COMPETITOR_NONBULLETED_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userTextNB }],
        });
      } catch (error) {
        recordFlake('POST per-competitor-nonbulleted countTokens', error, {
          projectId,
          urlId,
        });
      }
      // ~2-4 paragraphs ≈ ~150-300 words ≈ ~400 output tokens. 2k cap
      // for headroom on dense sources.
      const estimatedOutputTokensNB = 2_000;
      const estimatedCostUsdNB = estimateCostUsd(
        modelVersion,
        estimatedInputTokensNB,
        estimatedOutputTokensNB
      );

      let responseNB: Anthropic.Message;
      try {
        responseNB = await anthropicClient.messages.create({
          model: modelVersion,
          max_tokens: PER_BATCH_MAX_OUTPUT_TOKENS,
          system: buildPerCompetitorNonBulletedSystemBlocks(),
          messages: [{ role: 'user', content: userTextNB }],
        });
      } catch (error) {
        recordFlake('POST per-competitor-nonbulleted messages.create', error, {
          projectId,
          urlId,
        });
        return {
          status: 502,
          body: {
            error: `AI call failed: ${error instanceof Error ? error.message : 'unknown error'}`,
          },
        };
      }

      const proseRaw = extractTextFromContent(responseNB.content);
      const prose = normalizeNonBulletedProse(proseRaw);
      if (!prose) {
        return {
          status: 502,
          body: { error: 'AI returned empty prose for the non-bulleted flow' },
        };
      }

      let persistedIdNB: string | null = null;
      try {
        const created = await withRetry(() =>
          prisma.reviewAnalysis.create({
            data: {
              level: 'PER_PRODUCT',
              urlId,
              projectId,
              typeFilter: null,
              analysisJson: {
                summary: prose,
                flow: 'per-competitor-nonbulleted',
              } as unknown as Prisma.InputJsonValue,
              reviewsHash: nbHash,
              modelVersion,
              runByUserId: userId,
              costUsdMicros: null,
            },
            select: { id: true },
          })
        );
        persistedIdNB = created.id;
      } catch (error) {
        recordFlake('POST per-competitor-nonbulleted persist', error, {
          projectId,
          urlId,
        });
      }

      // Write-back: append the prose at the BOTTOM of the URL's "Overall
      // Analysis — Captured Reviews" box (overallAnalyses["reviews"]) per
      // §1 verbatim "merge, never overwrite". Idempotent via
      // tipTapDocContainsSummary so re-runs don't duplicate the block.
      try {
        const cu = await withRetry(() =>
          prisma.competitorUrl.findUnique({
            where: { id: urlId },
            select: { overallAnalyses: true },
          })
        );
        const bag = isValidOverallAnalysesBag(cu?.overallAnalyses)
          ? (cu!.overallAnalyses as Record<string, Record<string, unknown>>)
          : {};
        const existingReviews = bag.reviews ?? {};
        if (!tipTapDocContainsSummary(existingReviews, prose)) {
          const merged = appendSummaryToTipTapDoc(existingReviews, prose);
          const newBag = { ...bag, reviews: merged };
          await withRetry(() =>
            prisma.competitorUrl.update({
              where: { id: urlId },
              data: { overallAnalyses: newBag as Prisma.InputJsonValue },
            })
          );
        }
      } catch (error) {
        recordFlake('POST per-competitor-nonbulleted writeback', error, {
          projectId,
          urlId,
        });
      }

      const actualCostUsdNB = calculateCostUsd(modelVersion, {
        inputTokens: responseNB.usage.input_tokens,
        outputTokens: responseNB.usage.output_tokens,
        cacheCreationInputTokens: responseNB.usage.cache_creation_input_tokens ?? 0,
        cacheReadInputTokens: responseNB.usage.cache_read_input_tokens ?? 0,
      });

      const freshResponseNB: PerCompetitorNonBulletedResponseBody = {
        flow: 'per-competitor-nonbulleted',
        analysisId: persistedIdNB ?? '',
        summary: prose,
        source: 'fresh',
        usage: {
          inputTokens: responseNB.usage.input_tokens,
          outputTokens: responseNB.usage.output_tokens,
          cacheCreationInputTokens: responseNB.usage.cache_creation_input_tokens ?? 0,
          cacheReadInputTokens: responseNB.usage.cache_read_input_tokens ?? 0,
          actualCostUsd: actualCostUsdNB,
          estimatedCostUsd: estimatedCostUsdNB,
        },
      };
      return { status: 200, body: freshResponseNB };
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

      // P-49 W5 Fix Session D (2026-05-31) — the per-competitor bulleted
      // output NO LONGER appends free text into the "Overall Analysis —
      // Captured Reviews" box. Per director's 2026-05-30 §1 addendum, that
      // box now renders a 3-column traceability table read directly from
      // this PER_PRODUCT ReviewAnalysis row's structured analysisJson
      // (categories → bullets → reviewIds). Any legacy free text already
      // appended into overallAnalyses["reviews"] is left untouched (it
      // stays in the box's editable notes area below the table). The Fix
      // Session B FF1 box write-back is intentionally removed here.

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
      const modelOutputPC = validatePerCompetitorStructuredOutput(parsedPC);
      if (!modelOutputPC) {
        return {
          status: 502,
          body: { error: 'AI output did not match the per-competitor schema' },
        };
      }

      // P-49 W5 Fix Session D (2026-05-31) — resolve the model's R-labels
      // back to real CapturedReview ids (by prompt position) so each
      // bullet records its supporting reviews. We persist BOTH the
      // structured `categories` (powers the 3-column traceability table on
      // the URL detail page) AND a flattened `summary` string (keeps the
      // main Reviews Analysis Table's Column 9 + Edit affordance + cache
      // reads working unchanged — they only ever read analysisJson.summary).
      const orderedReviewIds = orderedReviews.map((r) => r.id);
      const structuredPC: PerCompetitorStructuredAnalysis = {
        categories: modelOutputPC.categories.map((cat) => ({
          name: cat.name,
          bullets: cat.bullets.map((b) => ({
            text: b.text,
            reviewIds: resolveReviewRefs(b.reviewRefs, orderedReviewIds),
          })),
        })),
      };
      const summaryPC = flattenCategoriesToSummaryString(structuredPC);

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
                summary: summaryPC,
                categories: structuredPC.categories,
              } as unknown as Prisma.InputJsonValue,
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
        summary: summaryPC,
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
    const cachedAnalysisIdByReviewId = new Map<string, string>(); // reviewId → row id
    for (const row of cachedRows) {
      const summary = summaryFromCachedJson(row.analysisJson);
      const reviewId = reviewIdByHash.get(row.reviewsHash);
      if (summary && reviewId) {
        cachedByReviewId.set(reviewId, summary);
        cachedAnalysisIdByReviewId.set(reviewId, row.id);
      }
    }

    // FF1 2026-05-30 — write-back on cache hit too (D-9). The original Fix
    // Session B build only wrote back to CapturedReview.analysis on fresh
    // persists, so per-review summaries generated before this deploy (now
    // always cache hits) never landed in the review's "Your Analysis" box.
    // The write-back is a REPLACE (analysis = summary doc) so re-applying it
    // on every cache hit is idempotent. Soft-fail — never blocks the response.
    for (const [reviewId, summaryText] of cachedByReviewId) {
      try {
        await withRetry(() =>
          prisma.capturedReview.update({
            where: { id: reviewId },
            data: {
              analysis: summaryStringToTipTapDoc(
                summaryText
              ) as Prisma.InputJsonValue,
            },
          })
        );
      } catch (error) {
        recordFlake('POST review-analysis-run-batch cached writeback', error, {
          projectId,
          urlId,
          reviewId,
        });
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
        analysisId: cachedAnalysisIdByReviewId.get(id) ?? '',
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
    const freshAnalysisIdByReviewId = new Map<string, string>();
    for (const entry of validated.summaries) {
      const hash = hashByReviewId.get(entry.reviewId);
      if (!hash) continue; // alignment check above guarantees this; defensive
      try {
        const createdReview = await withRetry(() =>
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
        freshAnalysisIdByReviewId.set(entry.reviewId, createdReview.id);
        // P-49 W5 Fix Session B (2026-05-30; D-9) — write the per-review
        // summary BACK into the review's "Your Analysis" box
        // (CapturedReview.analysis TipTap doc). Only fresh (uncached) reviews
        // reach this loop, so re-runs don't re-write unchanged summaries.
        await withRetry(() =>
          prisma.capturedReview.update({
            where: { id: entry.reviewId },
            data: {
              analysis: summaryStringToTipTapDoc(
                entry.summary
              ) as Prisma.InputJsonValue,
            },
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
        return {
          reviewId: id,
          summary: cached,
          source: 'cache' as const,
          analysisId: cachedAnalysisIdByReviewId.get(id) ?? '',
        };
      }
      const fresh = freshByReviewId.get(id) ?? '';
      return {
        reviewId: id,
        summary: fresh,
        source: 'fresh' as const,
        analysisId: freshAnalysisIdByReviewId.get(id) ?? '',
      };
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
