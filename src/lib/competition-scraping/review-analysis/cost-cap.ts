// W#2 P-49 Workstream 5 — preventive cost-cap enforcement per §A.7.
//
// Two caps:
//   - Per-run: refuse to start if the estimated cost exceeds the cap.
//   - Per-Project monthly: refuse to start if (already-spent + estimated)
//     exceeds the cap.
//
// The per-Project monthly figure is aggregated by SUM(ReviewAnalysis.costUsdMicros)
// over the trailing 30 days for the Project. We use the runAt timestamp
// to define the window (not calendar month) so director's first-of-month
// runs aren't disproportionately constrained by the prior month.
//
// Spec defaults match §A.7: $10/run, $50/Project/month. These are
// constants for v1; a per-Project settings surface is TBD in a later W5
// session.
//
// The check is application-layer only. Two runs racing each other on
// the same Project could both pass this check and both spend, but Q11's
// manual-trigger UX makes that nearly impossible (director clicks
// one button at a time + cost preview shown before confirm).

export const DEFAULT_PER_RUN_USD_CAP = 10;
export const DEFAULT_PER_PROJECT_MONTHLY_USD_CAP = 50;
export const TRAILING_WINDOW_DAYS = 30;

export type CostCapPrismaLike = {
  reviewAnalysis: {
    aggregate(args: {
      where: { projectId: string; runAt: { gte: Date } };
      _sum: { costUsdMicros: true };
    }): Promise<{ _sum: { costUsdMicros: number | null } }>;
  };
};

export type CostCapInput = {
  prisma: CostCapPrismaLike;
  projectId: string;
  estimatedCostUsd: number;
  perRunCapUsd?: number;
  perMonthCapUsd?: number;
  now?: Date;
};

export type CostCapCheckResult =
  | {
      ok: true;
      perRunCapUsd: number;
      perMonthCapUsd: number;
      monthSpentUsd: number;
      estimatedCostUsd: number;
    }
  | {
      ok: false;
      reason: 'per_run_exceeded' | 'per_month_exceeded';
      perRunCapUsd: number;
      perMonthCapUsd: number;
      monthSpentUsd: number;
      estimatedCostUsd: number;
      message: string;
    };

// Pre-flight gate — call BEFORE any Anthropic API call. Returns ok:true
// only if BOTH caps are satisfied. The caller passes a fresh aggregate
// query (no in-memory cache); the trade-off is one DB round-trip per
// run, which is cheap relative to a Claude call.
export async function checkCostCap({
  prisma,
  projectId,
  estimatedCostUsd,
  perRunCapUsd = DEFAULT_PER_RUN_USD_CAP,
  perMonthCapUsd = DEFAULT_PER_PROJECT_MONTHLY_USD_CAP,
  now = new Date(),
}: CostCapInput): Promise<CostCapCheckResult> {
  if (estimatedCostUsd < 0 || !Number.isFinite(estimatedCostUsd)) {
    throw new Error(`Invalid estimatedCostUsd: ${estimatedCostUsd}`);
  }

  const windowStart = new Date(now);
  windowStart.setUTCDate(windowStart.getUTCDate() - TRAILING_WINDOW_DAYS);

  const agg = await prisma.reviewAnalysis.aggregate({
    where: { projectId, runAt: { gte: windowStart } },
    _sum: { costUsdMicros: true },
  });
  const monthSpentUsd = (agg._sum.costUsdMicros ?? 0) / 1_000_000;

  if (estimatedCostUsd > perRunCapUsd) {
    return {
      ok: false,
      reason: 'per_run_exceeded',
      perRunCapUsd,
      perMonthCapUsd,
      monthSpentUsd,
      estimatedCostUsd,
      message: `Estimated cost $${estimatedCostUsd.toFixed(2)} exceeds per-run cap $${perRunCapUsd.toFixed(2)}`,
    };
  }

  if (monthSpentUsd + estimatedCostUsd > perMonthCapUsd) {
    return {
      ok: false,
      reason: 'per_month_exceeded',
      perRunCapUsd,
      perMonthCapUsd,
      monthSpentUsd,
      estimatedCostUsd,
      message:
        `Estimated cost $${estimatedCostUsd.toFixed(2)} + already-spent ` +
        `$${monthSpentUsd.toFixed(2)} would exceed monthly Project cap $${perMonthCapUsd.toFixed(2)}`,
    };
  }

  return {
    ok: true,
    perRunCapUsd,
    perMonthCapUsd,
    monthSpentUsd,
    estimatedCostUsd,
  };
}
