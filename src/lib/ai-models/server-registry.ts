// P-63 Phase 2d (2026-06-03) — server-only reads of the DB-backed AI-model
// registry. Used by server run paths (e.g. the W#2 review-analysis run-batch
// validator) to honor self-serve additions: a model added on the /ai-models
// screen becomes runnable everywhere, including the server-side allow-check.
//
// NOT "use client" — this reads Prisma. The pure shaping (toWireShape +
// selectMenuModels) is reused from the unit-tested modules, so this file is a
// thin DB-read seam testable with a fake prisma.

import {
  toWireShape,
  type AiModelRegistryRow,
} from './handlers/ai-model-registry.ts';
import { selectMenuModels } from './registry.ts';
import type { AiPickerMenuId } from './types.ts';
import type { ModelPricing } from './pricing.ts';

export type RegistryReadPrismaLike = {
  aiModelRegistryEntry: {
    findMany(args: {
      orderBy: { sortOrder: 'asc' };
    }): Promise<AiModelRegistryRow[]>;
  };
};

// The raw provider model ids (e.g. "claude-opus-4-8") that are enabled + runnable
// and tagged for the given picker menu, in registry order. Empty if the table is
// not seeded yet — callers union with their static fallback so a fresh table
// never blocks the built-in models.
export async function getRunnableModelIdsForMenu(
  prisma: RegistryReadPrismaLike,
  menu: AiPickerMenuId
): Promise<string[]> {
  const rows = await prisma.aiModelRegistryEntry.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return selectMenuModels(rows.map(toWireShape), menu).map((m) => m.modelId);
}

// The pricing the director entered for a given raw model id, or null if no
// registry row matches. Used by server run paths to compute a self-serve-added
// model's cost from its registry pricing rather than the static MODEL_PRICING
// table. (P-63 Phase 2d.)
export async function getModelPricingFromDb(
  prisma: RegistryReadPrismaLike,
  modelId: string
): Promise<ModelPricing | null> {
  const rows = await prisma.aiModelRegistryEntry.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  const match = rows.map(toWireShape).find((m) => m.modelId === modelId);
  return match ? match.pricing : null;
}
