/**
 * Scale Session B Step 2 — Backfill `intentFingerprint` on every CanvasNode
 * that doesn't yet have one.
 *
 * Per `docs/INPUT_CONTEXT_SCALING_DESIGN.md` §1.2 + §6 Scale Session B + §4.2:
 *   The intent fingerprint is a 5–15 word, searcher-centric phrase capturing
 *   the topic's compound intent. Anthropic generates one per topic from
 *   (title + description + keyword text list). Cost: ~$0.30–$1.00 per project.
 *
 * Idempotent: skips rows whose intentFingerprint is already a non-empty
 * trimmed string. Re-runnable safely. Logs every update.
 *
 * Run with:
 *   ANTHROPIC_API_KEY=... node scripts/backfill-intent-fingerprints.ts
 *
 * Optional flags:
 *   --project-workflow-id=<uuid>   scope to one ProjectWorkflow only (test gate)
 *   --batch-size=<n>               topics per Anthropic call (default 25)
 *   --model=<id>                   Anthropic model id (default claude-sonnet-4-6)
 *   --dry-run                      print what would be written; do not update DB
 *
 * The keyword list per topic uses the keyword TEXT (not UUID) for the
 * highest-volume keywords linked to that topic — the AI needs human-readable
 * context to produce a meaningful fingerprint.
 *
 * Mirrors the `scripts/backfill-stable-ids.ts` pattern from Pivot Session B.
 *
 * Node 22+ strips TypeScript types automatically.
 */

import { PrismaClient } from '@prisma/client';

interface Flags {
  projectWorkflowId?: string;
  batchSize: number;
  model: string;
  dryRun: boolean;
}

interface KeywordRow {
  id: string;
  keyword: string;
  volume: number;
  canvasLoc: unknown;
}

interface TopicForBackfill {
  id: string;
  stableId: string;
  title: string;
  description: string;
  topKeywords: string[]; // top-volume keyword TEXTS, primary placements first
}

const FINGERPRINT_PROMPT = [
  'You will receive a JSON array of topics from a keyword-clustering tool.',
  'Each topic has a title, an optional description, and a list of search-query',
  'keywords that have been placed at that topic. Your job: write a short',
  'searcher-centric "intent fingerprint" for each topic — a single canonical',
  'phrase, 5–15 words, in the voice the searcher would use, that captures the',
  'compound intent the topic represents.',
  '',
  'Examples of good fingerprints:',
  '  • "Older bursitis sufferers seeking gentle, low-cost home relief"',
  '  • "First-time buyers comparing inflatable cushion brands by price"',
  '  • "Caregivers researching post-surgery recovery routines for hip patients"',
  '',
  'Rules:',
  '  • 5–15 words. No marketing fluff. No generic phrases like "people who want X."',
  '  • Searcher-centric voice. What is the SEARCHER actually looking for?',
  '  • Capture the compound intent — the audience, the goal, and the qualifier.',
  '  • One phrase per topic. No bullet points. No quotation marks in the output.',
  '',
  'Output format: a JSON array of the same length as the input, where each',
  'element is `{"stable_id": "<the topic\'s stable_id>", "intent_fingerprint":',
  '"<the phrase>"}`. NO surrounding prose, just the JSON array.',
].join('\n');

function parseFlags(): Flags {
  const flags: Flags = { batchSize: 25, model: 'claude-sonnet-4-6', dryRun: false };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--project-workflow-id=')) {
      flags.projectWorkflowId = arg.slice('--project-workflow-id='.length);
    } else if (arg.startsWith('--batch-size=')) {
      const n = Number(arg.slice('--batch-size='.length));
      if (!Number.isFinite(n) || n < 1) {
        throw new Error(`--batch-size must be a positive integer, got "${arg}"`);
      }
      flags.batchSize = n;
    } else if (arg.startsWith('--model=')) {
      flags.model = arg.slice('--model='.length);
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }
  return flags;
}

function pickTopKeywords(rows: KeywordRow[], topicStableId: string, max = 12): string[] {
  // canvasLoc is JSON like { "<topicStableId>": "primary" | "secondary" } in
  // the post-Pivot-B world, OR { primaryTopicId, secondaryTopicIds[] } in the
  // older shape. Accept both.
  const matches: Array<{ kw: string; volume: number; primary: boolean }> = [];
  for (const r of rows) {
    const loc = r.canvasLoc as Record<string, unknown> | null | undefined;
    if (!loc || typeof loc !== 'object') continue;
    let placement: 'primary' | 'secondary' | null = null;
    const direct = (loc as Record<string, unknown>)[topicStableId];
    if (direct === 'primary' || direct === 'secondary') {
      placement = direct;
    } else if (
      'primaryTopicId' in loc &&
      (loc as { primaryTopicId?: unknown }).primaryTopicId === topicStableId
    ) {
      placement = 'primary';
    } else if (
      'secondaryTopicIds' in loc &&
      Array.isArray((loc as { secondaryTopicIds?: unknown }).secondaryTopicIds) &&
      (loc as { secondaryTopicIds: unknown[] }).secondaryTopicIds.includes(topicStableId)
    ) {
      placement = 'secondary';
    }
    if (!placement) continue;
    matches.push({ kw: r.keyword, volume: r.volume, primary: placement === 'primary' });
  }
  matches.sort((a, b) => {
    // Primaries first, then by volume desc, then alphabetical for stability.
    if (a.primary !== b.primary) return a.primary ? -1 : 1;
    if (a.volume !== b.volume) return b.volume - a.volume;
    return a.kw.localeCompare(b.kw);
  });
  return matches.slice(0, max).map((m) => m.kw);
}

interface AnthropicFingerprintReply {
  stable_id: string;
  intent_fingerprint: string;
}

interface AnthropicTextBlock { type: 'text'; text: string }
interface AnthropicMessageResponse { content: AnthropicTextBlock[] }

async function generateFingerprintsForBatch(
  apiKey: string,
  model: string,
  topics: TopicForBackfill[],
): Promise<Map<string, string>> {
  const inputJson = JSON.stringify(
    topics.map((t) => ({
      stable_id: t.stableId,
      title: t.title,
      description: t.description,
      keywords: t.topKeywords,
    })),
    null,
    2,
  );

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: FINGERPRINT_PROMPT,
      messages: [{ role: 'user', content: inputJson }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `Anthropic returned HTTP ${res.status}: ${errText.substring(0, 400)}`,
    );
  }
  const response = (await res.json()) as AnthropicMessageResponse;

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Anthropic response had no text block');
  }
  const raw = textBlock.text.trim();
  // The prompt asks for a bare JSON array; trim possible code-fence wrappers.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Anthropic response was not valid JSON: ${(e as Error).message}; raw="${raw.substring(0, 200)}"`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Anthropic response was not a JSON array; got: ${typeof parsed}`);
  }

  const out = new Map<string, string>();
  for (const item of parsed as AnthropicFingerprintReply[]) {
    if (!item || typeof item !== 'object') continue;
    if (typeof item.stable_id !== 'string') continue;
    if (typeof item.intent_fingerprint !== 'string') continue;
    const fp = item.intent_fingerprint.trim();
    if (fp.length === 0) continue;
    out.set(item.stable_id, fp);
  }
  return out;
}

async function main() {
  const flags = parseFlags();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const prisma = new PrismaClient();

  try {
    const baseFilter = flags.projectWorkflowId
      ? { projectWorkflowId: flags.projectWorkflowId }
      : {};
    const scopeLabel = flags.projectWorkflowId
      ? `(scope: projectWorkflowId=${flags.projectWorkflowId})`
      : '(scope: all rows)';
    // Idempotent predicate: empty-string only (post-Step-3 the column is
    // NOT NULL, so '' is the only "needs backfill" state). The Prisma client
    // type system rejects `intentFingerprint: null` here — by construction.
    const needsBackfill = { intentFingerprint: '' };

    const totalRows = await prisma.canvasNode.count({ where: baseFilter });
    const todoRows = await prisma.canvasNode.findMany({
      where: { ...baseFilter, ...needsBackfill },
      select: {
        id: true,
        stableId: true,
        title: true,
        description: true,
        projectWorkflowId: true,
      },
      orderBy: [{ projectWorkflowId: 'asc' }, { stableId: 'asc' }],
    });
    const alreadyDone = totalRows - todoRows.length;

    console.log(
      `Backfill ${scopeLabel}: ${totalRows} CanvasNode row(s); ${alreadyDone} already populated; ${todoRows.length} need intentFingerprint.`,
    );
    console.log(
      `  model=${flags.model} batchSize=${flags.batchSize} dryRun=${flags.dryRun}`,
    );

    if (todoRows.length === 0) {
      console.log('Backfill: nothing to do.');
      return;
    }

    // Fetch keywords per ProjectWorkflow once (cheap; each PW typically <3000).
    const workflowIds = Array.from(new Set(todoRows.map((r) => r.projectWorkflowId)));
    const keywordsByWorkflow = new Map<string, KeywordRow[]>();
    for (const pwId of workflowIds) {
      const rows = await prisma.keyword.findMany({
        where: { projectWorkflowId: pwId },
        select: { id: true, keyword: true, volume: true, canvasLoc: true },
      });
      keywordsByWorkflow.set(pwId, rows as KeywordRow[]);
    }

    // Build per-topic input.
    const enriched: Array<TopicForBackfill & { rowId: string; pwId: string }> =
      todoRows.map((r) => ({
        rowId: r.id,
        pwId: r.projectWorkflowId,
        id: r.id,
        stableId: r.stableId,
        title: r.title,
        description: r.description,
        topKeywords: pickTopKeywords(
          keywordsByWorkflow.get(r.projectWorkflowId) ?? [],
          r.stableId,
        ),
      }));

    // Group by ProjectWorkflow then chunk by batch size.
    let updated = 0;
    let apiCalls = 0;
    const aggregatedFingerprints = new Map<string, string>();

    for (const pwId of workflowIds) {
      const inWorkflow = enriched.filter((e) => e.pwId === pwId);
      for (let i = 0; i < inWorkflow.length; i += flags.batchSize) {
        const chunk = inWorkflow.slice(i, i + flags.batchSize);
        console.log(
          `  → call #${apiCalls + 1}: PW ${pwId.substring(0, 8)} chunk ${i / flags.batchSize + 1} (${chunk.length} topics)`,
        );
        const fingerprintsByStableId = await generateFingerprintsForBatch(
          apiKey,
          flags.model,
          chunk,
        );
        apiCalls += 1;
        for (const t of chunk) {
          const fp = fingerprintsByStableId.get(t.stableId);
          if (!fp) {
            console.warn(
              `    ! topic ${t.stableId} ("${t.title}") got no fingerprint from this call; will retry on next run`,
            );
            continue;
          }
          aggregatedFingerprints.set(t.rowId, fp);
        }
      }
    }

    if (flags.dryRun) {
      console.log(
        `Backfill DRY RUN: ${aggregatedFingerprints.size} fingerprint(s) generated across ${apiCalls} API call(s). No DB writes.`,
      );
      for (const [rowId, fp] of aggregatedFingerprints) {
        const t = enriched.find((e) => e.rowId === rowId);
        console.log(`  ${t?.stableId ?? rowId} → "${fp}"`);
      }
      return;
    }

    for (const [rowId, fp] of aggregatedFingerprints) {
      await prisma.canvasNode.update({
        where: { id: rowId },
        data: { intentFingerprint: fp },
      });
      const t = enriched.find((e) => e.rowId === rowId);
      console.log(`  CanvasNode ${t?.stableId ?? rowId} → "${fp}"`);
      updated += 1;
    }

    console.log(
      `Backfill: updated ${updated} row(s) across ${apiCalls} API call(s).`,
    );

    const remaining = await prisma.canvasNode.count({
      where: { ...baseFilter, ...needsBackfill },
    });
    if (remaining > 0) {
      console.error(
        `Backfill VERIFICATION: ${remaining} row(s) still need intentFingerprint in scope. Re-run safely to retry.`,
      );
      process.exit(2);
    }
    console.log(
      'Backfill: verification passed — every row in scope has a non-empty intentFingerprint.',
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Backfill: unexpected error.', err);
  process.exit(1);
});
