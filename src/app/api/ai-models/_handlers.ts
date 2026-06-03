// P-63 Phase 2a (2026-06-03) — shared production wiring for the AI-model registry
// API. Not a route (Next only treats `route.ts` as a route), so both the
// collection route (./route.ts) and the item route (./[id]/route.ts) import this
// single configured handler instance — no adapter drift between them.

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { recordFlake } from '@/lib/flake-counter';
import { withRetry } from '@/lib/prisma-retry';
import {
  makeAiModelRegistryHandlers,
  type AiModelRegistryPrismaLike,
  type VerifyAuthFn,
} from '@/lib/ai-models/handlers/ai-model-registry';

const verifyAuthAdapter: VerifyAuthFn = async (req) => {
  const auth = await verifyAuth(req as NextRequest);
  if (auth.error) {
    try {
      const body = await auth.error.json();
      return { userId: null, error: { status: auth.error.status, body } };
    } catch {
      return {
        userId: null,
        error: { status: auth.error.status, body: { error: 'Auth failed' } },
      };
    }
  }
  return { userId: auth.userId, error: null };
};

// Adapt the real prisma delegate to the handler's minimal, JSON-as-unknown Like.
// JSON column writes are cast through Prisma's input type at this single seam.
const prismaAdapter: AiModelRegistryPrismaLike = {
  aiModelRegistryEntry: {
    count: () => prisma.aiModelRegistryEntry.count(),
    findMany: (args) => prisma.aiModelRegistryEntry.findMany(args),
    findUnique: (args) => prisma.aiModelRegistryEntry.findUnique(args),
    createMany: (args) =>
      prisma.aiModelRegistryEntry.createMany({
        data: args.data as unknown as Prisma.AiModelRegistryEntryCreateManyInput[],
        skipDuplicates: args.skipDuplicates,
      }),
    create: (args) =>
      prisma.aiModelRegistryEntry.create({
        data: args.data as unknown as Prisma.AiModelRegistryEntryCreateInput,
      }),
    update: (args) =>
      prisma.aiModelRegistryEntry.update({
        where: args.where,
        data: args.data as unknown as Prisma.AiModelRegistryEntryUpdateInput,
      }),
    delete: (args) => prisma.aiModelRegistryEntry.delete(args),
  },
};

export const aiModelHandlers = makeAiModelRegistryHandlers({
  prisma: prismaAdapter,
  verifyAuth: verifyAuthAdapter,
  recordFlake,
  withRetry,
});
