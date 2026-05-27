// W#2 P-49 Workstream 5 — node:test cases for cost-cap enforcement.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PER_PROJECT_MONTHLY_USD_CAP,
  DEFAULT_PER_RUN_USD_CAP,
  TRAILING_WINDOW_DAYS,
  checkCostCap,
  type CostCapPrismaLike,
} from './cost-cap.ts';

function makeFakePrisma(monthSpentMicros: number | null = 0): {
  prisma: CostCapPrismaLike;
  calls: Array<{ where: { projectId: string; runAt: { gte: Date } } }>;
} {
  const calls: Array<{
    where: { projectId: string; runAt: { gte: Date } };
  }> = [];
  const prisma: CostCapPrismaLike = {
    reviewAnalysis: {
      aggregate: async (args) => {
        calls.push({ where: args.where });
        return { _sum: { costUsdMicros: monthSpentMicros } };
      },
    },
  };
  return { prisma, calls };
}

test('checkCostCap returns ok when both caps are satisfied', async () => {
  const { prisma } = makeFakePrisma(5 * 1_000_000); // $5 already spent
  const result = await checkCostCap({
    prisma,
    projectId: 'proj-1',
    estimatedCostUsd: 1.5,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.monthSpentUsd, 5);
    assert.equal(result.estimatedCostUsd, 1.5);
    assert.equal(result.perRunCapUsd, DEFAULT_PER_RUN_USD_CAP);
    assert.equal(result.perMonthCapUsd, DEFAULT_PER_PROJECT_MONTHLY_USD_CAP);
  }
});

test('checkCostCap rejects when estimate exceeds per-run cap', async () => {
  const { prisma } = makeFakePrisma(0);
  const result = await checkCostCap({
    prisma,
    projectId: 'proj-1',
    estimatedCostUsd: 15, // > $10 default
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, 'per_run_exceeded');
    assert.match(result.message, /per-run cap/);
  }
});

test('checkCostCap rejects when month-spent + estimate exceeds monthly cap', async () => {
  const { prisma } = makeFakePrisma(48 * 1_000_000); // $48 already spent
  const result = await checkCostCap({
    prisma,
    projectId: 'proj-1',
    estimatedCostUsd: 5, // 48 + 5 = 53 > $50 default
  });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, 'per_month_exceeded');
    assert.match(result.message, /monthly Project cap/);
  }
});

test('checkCostCap honors override caps from input', async () => {
  const { prisma } = makeFakePrisma(0);
  const result = await checkCostCap({
    prisma,
    projectId: 'proj-1',
    estimatedCostUsd: 25, // would exceed default per-run $10
    perRunCapUsd: 50,
    perMonthCapUsd: 200,
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.perRunCapUsd, 50);
    assert.equal(result.perMonthCapUsd, 200);
  }
});

test('checkCostCap aggregates over a 30-day trailing window', async () => {
  const { prisma, calls } = makeFakePrisma(0);
  const now = new Date('2026-06-15T00:00:00Z');
  await checkCostCap({
    prisma,
    projectId: 'proj-1',
    estimatedCostUsd: 1,
    now,
  });
  assert.equal(calls.length, 1);
  const expectedWindowStart = new Date(now);
  expectedWindowStart.setUTCDate(
    expectedWindowStart.getUTCDate() - TRAILING_WINDOW_DAYS
  );
  assert.equal(
    calls[0].where.runAt.gte.toISOString(),
    expectedWindowStart.toISOString()
  );
  assert.equal(calls[0].where.projectId, 'proj-1');
});

test('checkCostCap treats null aggregate sum as zero', async () => {
  // No ReviewAnalysis rows yet for this Project — Prisma returns null.
  const { prisma } = makeFakePrisma(null);
  const result = await checkCostCap({
    prisma,
    projectId: 'fresh-proj',
    estimatedCostUsd: 1.5,
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.monthSpentUsd, 0);
});

test('checkCostCap throws on invalid estimatedCostUsd', async () => {
  const { prisma } = makeFakePrisma(0);
  await assert.rejects(
    () =>
      checkCostCap({
        prisma,
        projectId: 'p',
        estimatedCostUsd: -1,
      }),
    /Invalid estimatedCostUsd/
  );
  await assert.rejects(
    () =>
      checkCostCap({
        prisma,
        projectId: 'p',
        estimatedCostUsd: Number.NaN,
      }),
    /Invalid estimatedCostUsd/
  );
});
