// W#2 P-49 Workstream 5 Session 1 — first end-to-end run of the AI review
// analysis foundation against a small production product corpus.
//
// What this script does:
//   1. Connects to the production DB (read-only for reviews, writes one
//      ReviewAnalysis row at the end).
//   2. Finds the CompetitorUrl with the FEWEST captured reviews
//      (smallest corpus = cheapest first end-to-end probe).
//   3. Runs the full foundation pipeline:
//        - load reviews
//        - compute reviewsHash
//        - check for an existing cached analysis (early exit if found)
//        - adaptive batching
//        - pre-flight token-count → cost estimate
//        - cost-cap check
//        - first sweep (per-batch summaries via Claude)
//        - second sweep (merge — skipped when 1 batch)
//        - persist ReviewAnalysis row
//   4. Prints token usage, actual cost, and the resulting TipTap doc.
//
// Modes:
//   --dry-run     stop after pre-flight cost estimate (no Anthropic calls,
//                 no DB writes). Validates plumbing for free.
//   --live        actually call Claude + persist. SPENDS REAL MONEY (~$0.01-$0.10
//                 expected for a small product).
//   --url-id <id> override product selection — analyze a specific URL.
//
// Run from repo root:
//   npx tsx scripts/test-w5-end-to-end.mjs --dry-run
//   npx tsx scripts/test-w5-end-to-end.mjs --live
//
// Requires .env.local with DATABASE_URL + (for --live) ANTHROPIC_API_KEY.

import { PrismaClient } from '@prisma/client';
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
loadEnv({ path: resolve(__dirname, '..', '.env.local') });
loadEnv({ path: resolve(__dirname, '..', '.env') });

const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const isLive = args.has('--live');
const urlIdOverride = (() => {
  const idx = process.argv.indexOf('--url-id');
  return idx >= 0 ? process.argv[idx + 1] : null;
})();

if (!isDryRun && !isLive) {
  console.error(
    'ERROR: pass --dry-run (free, no AI calls) or --live (spends Anthropic tokens).'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

// Pulled in dynamically since this script uses TS .ts modules.
const cacheModule = await import(
  '../src/lib/competition-scraping/review-analysis/cache.ts'
);
const batchSizerModule = await import(
  '../src/lib/competition-scraping/review-analysis/batch-sizer.ts'
);
const pricingModule = await import(
  '../src/lib/competition-scraping/review-analysis/pricing.ts'
);
const costCapModule = await import(
  '../src/lib/competition-scraping/review-analysis/cost-cap.ts'
);
const promptsModule = await import(
  '../src/lib/competition-scraping/review-analysis/prompts.ts'
);
const tokenCounterModule = await import(
  '../src/lib/competition-scraping/review-analysis/token-counter.ts'
);
const clientModule = await import(
  '../src/lib/competition-scraping/review-analysis/client.ts'
);

async function main() {
  console.log('=== W5 end-to-end test ===');
  console.log(`Mode: ${isLive ? 'LIVE (will spend $$)' : 'DRY RUN (free)'}`);
  console.log();

  // 1. Pick a product
  let url;
  if (urlIdOverride) {
    url = await prisma.competitorUrl.findUnique({
      where: { id: urlIdOverride },
      include: {
        projectWorkflow: { select: { projectId: true } },
        _count: { select: { capturedReviews: true } },
      },
    });
    if (!url) {
      console.error(`ERROR: --url-id ${urlIdOverride} not found.`);
      process.exit(1);
    }
  } else {
    const candidates = await prisma.competitorUrl.findMany({
      where: { capturedReviews: { some: {} } },
      include: {
        projectWorkflow: { select: { projectId: true } },
        _count: { select: { capturedReviews: true } },
      },
    });
    if (candidates.length === 0) {
      console.error('ERROR: no CompetitorUrl has any captured reviews.');
      process.exit(1);
    }
    candidates.sort((a, b) => a._count.capturedReviews - b._count.capturedReviews);
    url = candidates[0];
  }

  console.log(`Selected URL: ${url.id}`);
  console.log(`  Platform: ${url.platform}`);
  console.log(`  Product:  ${url.productName ?? '(no productName)'}`);
  console.log(`  Project:  ${url.projectWorkflow.projectId}`);
  console.log(`  Reviews:  ${url._count.capturedReviews}`);
  console.log();

  const projectId = url.projectWorkflow.projectId;

  // 2. Load reviews
  const reviews = await prisma.capturedReview.findMany({
    where: { competitorUrlId: url.id },
    orderBy: [{ addedAt: 'asc' }],
    select: {
      id: true,
      starRating: true,
      body: true,
      reviewerName: true,
      reviewDate: true,
    },
  });
  console.log(`Loaded ${reviews.length} reviews.`);

  const modelVersion = clientModule.DEFAULT_MODEL_VERSION;
  console.log(`Model: ${modelVersion}`);

  // 3. Compute hash + check cache
  const reviewsHash = cacheModule.computeReviewsHash(reviews, modelVersion);
  console.log(`reviewsHash: ${reviewsHash.slice(0, 16)}...`);
  const cached = await prisma.reviewAnalysis.findFirst({
    where: {
      urlId: url.id,
      level: 'PER_PRODUCT',
      reviewsHash,
    },
    orderBy: [{ runAt: 'desc' }],
  });
  if (cached) {
    console.log(
      `CACHE HIT: existing analysis ${cached.id} from ${cached.runAt.toISOString()} ` +
        `($${((cached.costUsdMicros ?? 0) / 1_000_000).toFixed(4)})`
    );
    console.log('No new run needed. Exiting.');
    return;
  }
  console.log('No cached analysis for this corpus + model.');

  // 4. Batch
  const batchable = reviews.map((r) => ({
    id: r.id,
    body: r.body,
    reviewerName: r.reviewerName,
    starRating: r.starRating,
    reviewDate: r.reviewDate,
  }));
  const { batches, oversizedReviewIds } = batchSizerModule.adaptiveBatch({
    reviews: batchable,
  });
  console.log(`Batched into ${batches.length} batch(es).`);
  if (oversizedReviewIds.length > 0) {
    console.warn(
      `WARNING: ${oversizedReviewIds.length} oversized review(s): ${oversizedReviewIds.join(', ')}`
    );
  }

  // 5. Pre-flight cost
  const productName = url.productName ?? 'Unknown product';
  const platform = url.platform;
  let anthropicClient = null;
  if (isLive) {
    anthropicClient = await clientModule.getAnthropicClient();
  }
  let batch1InputTokens;
  if (isLive) {
    batch1InputTokens = await tokenCounterModule.countMessageTokens({
      client: anthropicClient,
      model: modelVersion,
      system: promptsModule.PER_PRODUCT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: promptsModule.buildPerProductBatchUserMessage({
            productName,
            platform,
            batchNumber: 1,
            totalBatches: batches.length,
            reviews: batches[0],
          }),
        },
      ],
    });
  } else {
    // Dry-run heuristic: estimate from char count.
    const sample = promptsModule.buildPerProductBatchUserMessage({
      productName,
      platform,
      batchNumber: 1,
      totalBatches: batches.length,
      reviews: batches[0],
    });
    batch1InputTokens = tokenCounterModule.approximateTokensFromString(
      promptsModule.PER_PRODUCT_SYSTEM_PROMPT + sample
    );
    console.log(`(Dry run — using ~3.6 char/token heuristic for estimate.)`);
  }

  const estInputTokens =
    batch1InputTokens * batches.length +
    (batches.length > 1 ? 1500 * batches.length : 0);
  const estOutputTokens =
    8000 * batches.length + (batches.length > 1 ? 16_000 : 0);
  const estCostUsd = pricingModule.estimateCostUsd(
    modelVersion,
    estInputTokens,
    estOutputTokens
  );
  console.log(
    `Estimated input tokens:  ${estInputTokens.toLocaleString()}`
  );
  console.log(
    `Estimated output tokens: ${estOutputTokens.toLocaleString()}`
  );
  console.log(`Estimated cost:          $${estCostUsd.toFixed(4)}`);

  // 6. Cost-cap check
  const capResult = await costCapModule.checkCostCap({
    prisma,
    projectId,
    estimatedCostUsd: estCostUsd,
  });
  if (!capResult.ok) {
    console.error(`COST CAP REJECTED: ${capResult.message}`);
    process.exit(1);
  }
  console.log(
    `Cost cap OK (month spent so far: $${capResult.monthSpentUsd.toFixed(4)})`
  );

  if (isDryRun) {
    console.log();
    console.log(
      'DRY RUN COMPLETE. To actually run the analysis, re-invoke with --live.'
    );
    return;
  }

  // 7. First sweep
  console.log();
  console.log('=== FIRST SWEEP ===');
  const batchSummaries = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheCreationTokens = 0;
  let totalCacheReadTokens = 0;
  for (let i = 0; i < batches.length; i++) {
    console.log(
      `Batch ${i + 1} of ${batches.length} (${batches[i].length} reviews)...`
    );
    const t0 = Date.now();
    const response = await anthropicClient.messages.create({
      model: modelVersion,
      max_tokens: 8_000,
      system: [
        {
          type: 'text',
          text: promptsModule.PER_PRODUCT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: promptsModule.buildPerProductBatchUserMessage({
            productName,
            platform,
            batchNumber: i + 1,
            totalBatches: batches.length,
            reviews: batches[i],
          }),
        },
      ],
    });
    const elapsedMs = Date.now() - t0;
    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;
    totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;
    totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0;
    console.log(
      `  ${elapsedMs}ms; in=${response.usage.input_tokens} out=${response.usage.output_tokens} ` +
        `cache_write=${response.usage.cache_creation_input_tokens ?? 0} cache_read=${response.usage.cache_read_input_tokens ?? 0}`
    );

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    // Reuse the handler's robust extractor.
    const handlerModule = await import(
      '../src/lib/competition-scraping/handlers/review-analysis-run.ts'
    );
    const parsed = handlerModule.extractJsonFromModelText(text);
    batchSummaries.push(parsed);
  }

  // 8. Second sweep (if >1 batch)
  let finalAnalysis;
  if (batches.length === 1) {
    finalAnalysis = batchSummaries[0];
    console.log('(Single batch; skipping second sweep.)');
  } else {
    console.log();
    console.log('=== SECOND SWEEP ===');
    const t0 = Date.now();
    const response = await anthropicClient.messages.create({
      model: modelVersion,
      max_tokens: 16_000,
      system: [
        {
          type: 'text',
          text: promptsModule.PER_PRODUCT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: promptsModule.buildSecondSweepUserMessage({
            productName,
            platform,
            totalReviewsAnalyzed: reviews.length,
            batchSummariesJson: batchSummaries,
          }),
        },
      ],
    });
    const elapsedMs = Date.now() - t0;
    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;
    totalCacheCreationTokens += response.usage.cache_creation_input_tokens ?? 0;
    totalCacheReadTokens += response.usage.cache_read_input_tokens ?? 0;
    console.log(
      `  ${elapsedMs}ms; in=${response.usage.input_tokens} out=${response.usage.output_tokens} ` +
        `cache_write=${response.usage.cache_creation_input_tokens ?? 0} cache_read=${response.usage.cache_read_input_tokens ?? 0}`
    );

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const handlerModule = await import(
      '../src/lib/competition-scraping/handlers/review-analysis-run.ts'
    );
    finalAnalysis = handlerModule.extractJsonFromModelText(text);
  }

  // 9. Persist
  const actualCostUsd = pricingModule.calculateCostUsd(modelVersion, {
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    cacheCreationInputTokens: totalCacheCreationTokens,
    cacheReadInputTokens: totalCacheReadTokens,
  });
  console.log();
  console.log('=== TOTALS ===');
  console.log(`Input tokens:  ${totalInputTokens.toLocaleString()}`);
  console.log(`Output tokens: ${totalOutputTokens.toLocaleString()}`);
  console.log(`Cache write:   ${totalCacheCreationTokens.toLocaleString()}`);
  console.log(`Cache read:    ${totalCacheReadTokens.toLocaleString()}`);
  console.log(`Actual cost:   $${actualCostUsd.toFixed(4)}`);
  console.log(`Estimated:     $${estCostUsd.toFixed(4)}`);

  const saved = await prisma.reviewAnalysis.create({
    data: {
      level: 'PER_PRODUCT',
      urlId: url.id,
      projectId,
      typeFilter: null,
      analysisJson: finalAnalysis,
      reviewsHash,
      modelVersion,
      runByUserId: null,
      costUsdMicros: pricingModule.toCostUsdMicros(actualCostUsd),
    },
  });
  console.log(`Persisted ReviewAnalysis row: ${saved.id}`);
  console.log();
  console.log('=== FINAL ANALYSIS (TipTap JSON) ===');
  console.log(JSON.stringify(finalAnalysis, null, 2));
}

main()
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
