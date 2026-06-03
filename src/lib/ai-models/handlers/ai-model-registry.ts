// P-63 Phase 2a (2026-06-03) — DI-seam handler for the DB-backed platform AI-model
// registry. This is the write/read backend the self-serve /ai-models admin screen
// (Phase 2b) drives and the client pickers will read live from (Phase 2c).
//
// Loaded directly by `node --test --experimental-strip-types`, so this module must
// stay Next-free (no next/server). The production route shims under
// src/app/api/ai-models/ adapt these handlers to NextRequest/NextResponse + auth.
//
// Storage seam: GET seeds the table on first read from the in-code SEED_REGISTRY
// (getAiModelRegistry()) so the DB starts byte-identical to what Phase 1 shipped —
// zero visible change. After seeding, the DB is the source of truth the admin
// screen edits. The provider-adapter gate (isProviderIntegrated) is enforced on
// every write: a model may only be stored "runnable" if its provider has a shipped
// adapter; otherwise it is clamped to "integration-pending" (the issue-free gate,
// design decision D2).
//
// REGISTERED in docs/AI_MODEL_REGISTRY.md per HANDOFF_PROTOCOL Rule 32.

import type {
  AiModelRecord,
  AiPickerMenuId,
  AiProviderId,
  RunnableStatus,
  ThinkingOptionId,
} from '../types.ts';
import type { ModelPricing } from '../pricing.ts';
import { isProviderIntegrated } from '../provider-adapter.ts';
import { getAiModelRegistry } from '../registry.ts';

// --- Minimal Next-free request/response shapes -------------------------------

export type RequestLike = { json(): Promise<unknown> };
export type HandlerResult = { status: number; body: unknown };

export type VerifyAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: HandlerResult };

export type VerifyAuthFn = (req: RequestLike) => Promise<VerifyAuthResult>;

export type Ctx = { params: Promise<{ id: string }> };

// --- DB row + write-data shapes ----------------------------------------------

// What the aiModelRegistryEntry delegate returns. JSON columns are unknown until
// coerced by toWireShape.
export type AiModelRegistryRow = {
  id: string;
  provider: string;
  providerLabel: string;
  modelId: string;
  displayLabel: string;
  thinkingOptions: unknown;
  menus: unknown;
  pricing: unknown;
  enabled: boolean;
  runnableStatus: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// The fields a create writes. (id/sortOrder are computed by the handler, not the
// client.) Kept as a plain shape so tests can fake the delegate trivially.
export type AiModelEntryCreateData = {
  id: string;
  provider: AiProviderId;
  providerLabel: string;
  modelId: string;
  displayLabel: string;
  thinkingOptions: ThinkingOptionId[];
  menus: AiPickerMenuId[];
  pricing: ModelPricing;
  enabled: boolean;
  runnableStatus: RunnableStatus;
  sortOrder: number;
};

// Editable fields on PUT. provider/modelId define identity and are NOT editable
// (delete + recreate to change them).
export type AiModelEntryUpdateData = {
  providerLabel?: string;
  displayLabel?: string;
  thinkingOptions?: ThinkingOptionId[];
  menus?: AiPickerMenuId[];
  pricing?: ModelPricing;
  enabled?: boolean;
  runnableStatus?: RunnableStatus;
  // P-64 — set by the reorder handler only (not the PUT validator).
  sortOrder?: number;
};

// Minimal Prisma surface the handler exercises. The route passes an adapter over
// the real prisma.aiModelRegistryEntry delegate; tests pass a fake literal.
export type AiModelRegistryPrismaLike = {
  aiModelRegistryEntry: {
    count(): Promise<number>;
    findMany(args: {
      orderBy: { sortOrder: 'asc' };
    }): Promise<AiModelRegistryRow[]>;
    findUnique(args: {
      where: { id: string };
    }): Promise<AiModelRegistryRow | null>;
    createMany(args: {
      data: AiModelEntryCreateData[];
      skipDuplicates?: boolean;
    }): Promise<{ count: number }>;
    create(args: { data: AiModelEntryCreateData }): Promise<AiModelRegistryRow>;
    update(args: {
      where: { id: string };
      data: AiModelEntryUpdateData;
    }): Promise<AiModelRegistryRow>;
    delete(args: { where: { id: string } }): Promise<AiModelRegistryRow>;
  };
};

export type AiModelRegistryHandlerDeps = {
  prisma: AiModelRegistryPrismaLike;
  verifyAuth: VerifyAuthFn;
  recordFlake: (op: string, err: unknown, ctx?: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

// --- Type guards + coercion --------------------------------------------------

const PROVIDERS: readonly AiProviderId[] = ['anthropic', 'openai', 'google'];
const THINKING_OPTIONS: readonly ThinkingOptionId[] = [
  'none',
  'fast',
  'auto',
  'extended',
];
const MENUS: readonly AiPickerMenuId[] = ['review-analysis', 'keyword-clustering'];
const RUNNABLE_STATUSES: readonly RunnableStatus[] = [
  'runnable',
  'integration-pending',
];

export function isAiProviderId(v: unknown): v is AiProviderId {
  return typeof v === 'string' && (PROVIDERS as readonly string[]).includes(v);
}
function isThinkingOptionId(v: unknown): v is ThinkingOptionId {
  return (
    typeof v === 'string' && (THINKING_OPTIONS as readonly string[]).includes(v)
  );
}
function isMenuId(v: unknown): v is AiPickerMenuId {
  return typeof v === 'string' && (MENUS as readonly string[]).includes(v);
}
function isRunnableStatus(v: unknown): v is RunnableStatus {
  return (
    typeof v === 'string' && (RUNNABLE_STATUSES as readonly string[]).includes(v)
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceStringArray<T>(value: unknown, guard: (v: unknown) => v is T): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is T => guard(v));
}

function coercePricing(value: unknown): ModelPricing {
  const o = isPlainObject(value) ? value : {};
  const num = (v: unknown): number =>
    typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0;
  return {
    inputPerMillion: num(o.inputPerMillion),
    outputPerMillion: num(o.outputPerMillion),
    cacheWrite5mPerMillion: num(o.cacheWrite5mPerMillion),
    cacheReadPerMillion: num(o.cacheReadPerMillion),
  };
}

// DB row → the AiModelRecord shape every picker already consumes. runnableStatus
// is re-clamped on read too, so a record can never present as runnable if its
// provider lost its adapter (defense in depth alongside the write-time gate).
export function toWireShape(row: AiModelRegistryRow): AiModelRecord {
  const provider: AiProviderId = isAiProviderId(row.provider)
    ? row.provider
    : 'anthropic';
  const runnableStatus: RunnableStatus =
    isRunnableStatus(row.runnableStatus) &&
    !(row.runnableStatus === 'runnable' && !isProviderIntegrated(provider))
      ? row.runnableStatus
      : 'integration-pending';
  return {
    id: row.id,
    provider,
    providerLabel: row.providerLabel,
    modelId: row.modelId,
    displayLabel: row.displayLabel,
    thinkingOptions: coerceStringArray(row.thinkingOptions, isThinkingOptionId),
    menus: coerceStringArray(row.menus, isMenuId),
    pricing: coercePricing(row.pricing),
    enabled: row.enabled,
    runnableStatus,
  };
}

// The in-code seed rendered as create rows, in registry order. Used by GET's
// seed-on-read so a fresh DB starts identical to the Phase-1 in-code registry.
export function buildSeedCreateData(): AiModelEntryCreateData[] {
  return getAiModelRegistry().map((rec, i) => ({
    id: rec.id,
    provider: rec.provider,
    providerLabel: rec.providerLabel,
    modelId: rec.modelId,
    displayLabel: rec.displayLabel,
    thinkingOptions: [...rec.thinkingOptions],
    menus: [...rec.menus],
    pricing: { ...rec.pricing },
    enabled: rec.enabled,
    runnableStatus: clampRunnable(rec.provider, rec.runnableStatus),
    sortOrder: i,
  }));
}

// The issue-free gate: a model can only be "runnable" if its provider has a
// shipped adapter. Anything else is clamped to "integration-pending".
function clampRunnable(
  provider: AiProviderId,
  requested: RunnableStatus
): RunnableStatus {
  if (requested === 'runnable' && isProviderIntegrated(provider)) {
    return 'runnable';
  }
  return 'integration-pending';
}

// --- Validation --------------------------------------------------------------

export type CreateValidation =
  | { ok: true; data: Omit<AiModelEntryCreateData, 'sortOrder'> }
  | { ok: false; error: string };

// Validate a "create a model" body (the admin add-a-model wizard payload:
// company → model → thinking options → pricing). id is derived as
// `${provider}:${modelId}` so the client never sets identity.
export function validateCreateBody(body: unknown): CreateValidation {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const b = body;

  if (!isAiProviderId(b.provider)) {
    return {
      ok: false,
      error: `provider must be one of: ${PROVIDERS.join(', ')}`,
    };
  }
  const provider = b.provider;

  const providerLabel = nonEmptyString(b.providerLabel);
  if (providerLabel === null) {
    return { ok: false, error: 'providerLabel must be a non-empty string' };
  }

  const modelId = nonEmptyString(b.modelId);
  if (modelId === null) {
    return { ok: false, error: 'modelId must be a non-empty string' };
  }

  const displayLabel = nonEmptyString(b.displayLabel);
  if (displayLabel === null) {
    return { ok: false, error: 'displayLabel must be a non-empty string' };
  }

  const thinking = validateThinkingOptions(b.thinkingOptions);
  if (!thinking.ok) return { ok: false, error: thinking.error };

  const menus = validateMenus(b.menus);
  if (!menus.ok) return { ok: false, error: menus.error };

  const pricing = validatePricing(b.pricing);
  if (!pricing.ok) return { ok: false, error: pricing.error };

  const enabled = b.enabled === undefined ? true : b.enabled;
  if (typeof enabled !== 'boolean') {
    return { ok: false, error: 'enabled must be a boolean' };
  }

  const requestedStatus =
    b.runnableStatus === undefined ? 'runnable' : b.runnableStatus;
  if (!isRunnableStatus(requestedStatus)) {
    return {
      ok: false,
      error: `runnableStatus must be one of: ${RUNNABLE_STATUSES.join(', ')}`,
    };
  }

  return {
    ok: true,
    data: {
      id: `${provider}:${modelId}`,
      provider,
      providerLabel,
      modelId,
      displayLabel,
      thinkingOptions: thinking.value,
      menus: menus.value,
      pricing: pricing.value,
      enabled,
      // Clamp by the adapter gate — a new OpenAI/Google model is saved
      // integration-pending even if "runnable" was requested.
      runnableStatus: clampRunnable(provider, requestedStatus),
    },
  };
}

export type UpdateValidation =
  | { ok: true; data: AiModelEntryUpdateData }
  | { ok: false; error: string };

// Validate a PUT patch. provider/modelId are identity and rejected if present.
// runnableStatus is clamped against the existing row's provider.
export function validateUpdateBody(
  body: unknown,
  existingProvider: AiProviderId
): UpdateValidation {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const b = body;
  if ('provider' in b || 'modelId' in b || 'id' in b) {
    return {
      ok: false,
      error:
        'provider, modelId, and id are immutable; delete and recreate to change them',
    };
  }
  const data: AiModelEntryUpdateData = {};

  if ('providerLabel' in b) {
    const v = nonEmptyString(b.providerLabel);
    if (v === null) {
      return { ok: false, error: 'providerLabel must be a non-empty string' };
    }
    data.providerLabel = v;
  }
  if ('displayLabel' in b) {
    const v = nonEmptyString(b.displayLabel);
    if (v === null) {
      return { ok: false, error: 'displayLabel must be a non-empty string' };
    }
    data.displayLabel = v;
  }
  if ('thinkingOptions' in b) {
    const t = validateThinkingOptions(b.thinkingOptions);
    if (!t.ok) return { ok: false, error: t.error };
    data.thinkingOptions = t.value;
  }
  if ('menus' in b) {
    const m = validateMenus(b.menus);
    if (!m.ok) return { ok: false, error: m.error };
    data.menus = m.value;
  }
  if ('pricing' in b) {
    const p = validatePricing(b.pricing);
    if (!p.ok) return { ok: false, error: p.error };
    data.pricing = p.value;
  }
  if ('enabled' in b) {
    if (typeof b.enabled !== 'boolean') {
      return { ok: false, error: 'enabled must be a boolean' };
    }
    data.enabled = b.enabled;
  }
  if ('runnableStatus' in b) {
    if (!isRunnableStatus(b.runnableStatus)) {
      return {
        ok: false,
        error: `runnableStatus must be one of: ${RUNNABLE_STATUSES.join(', ')}`,
      };
    }
    data.runnableStatus = clampRunnable(existingProvider, b.runnableStatus);
  }

  return { ok: true, data };
}

function nonEmptyString(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function validateThinkingOptions(
  v: unknown
): { ok: true; value: ThinkingOptionId[] } | { ok: false; error: string } {
  if (!Array.isArray(v) || v.length === 0) {
    return {
      ok: false,
      error: 'thinkingOptions must be a non-empty array',
    };
  }
  for (const item of v) {
    if (!isThinkingOptionId(item)) {
      return {
        ok: false,
        error: `thinkingOptions entries must be one of: ${THINKING_OPTIONS.join(', ')}`,
      };
    }
  }
  // De-dupe while preserving order.
  return { ok: true, value: [...new Set(v as ThinkingOptionId[])] };
}

function validateMenus(
  v: unknown
): { ok: true; value: AiPickerMenuId[] } | { ok: false; error: string } {
  if (!Array.isArray(v) || v.length === 0) {
    return { ok: false, error: 'menus must be a non-empty array' };
  }
  for (const item of v) {
    if (!isMenuId(item)) {
      return {
        ok: false,
        error: `menus entries must be one of: ${MENUS.join(', ')}`,
      };
    }
  }
  return { ok: true, value: [...new Set(v as AiPickerMenuId[])] };
}

function validatePricing(
  v: unknown
): { ok: true; value: ModelPricing } | { ok: false; error: string } {
  if (!isPlainObject(v)) {
    return { ok: false, error: 'pricing must be an object' };
  }
  const fields = [
    'inputPerMillion',
    'outputPerMillion',
    'cacheWrite5mPerMillion',
    'cacheReadPerMillion',
  ] as const;
  const out: Record<string, number> = {};
  for (const f of fields) {
    const n = v[f];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) {
      return {
        ok: false,
        error: `pricing.${f} must be a non-negative finite number`,
      };
    }
    out[f] = n;
  }
  return { ok: true, value: out as unknown as ModelPricing };
}

// P-64 — validate a reorder body: { orderedIds: string[] } (the registry ids in
// the new top-to-bottom order). Duplicates rejected; unknown ids are tolerated
// (filtered against the live table by the handler).
export type ReorderValidation =
  | { ok: true; orderedIds: string[] }
  | { ok: false; error: string };

export function validateReorderBody(body: unknown): ReorderValidation {
  if (!isPlainObject(body) || !Array.isArray(body.orderedIds)) {
    return { ok: false, error: 'orderedIds must be an array of registry ids' };
  }
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const v of body.orderedIds) {
    if (typeof v !== 'string' || v.trim() === '') {
      return { ok: false, error: 'orderedIds entries must be non-empty strings' };
    }
    if (seen.has(v)) {
      return { ok: false, error: `orderedIds contains a duplicate: ${v}` };
    }
    seen.add(v);
    ids.push(v);
  }
  if (ids.length === 0) {
    return { ok: false, error: 'orderedIds must not be empty' };
  }
  return { ok: true, orderedIds: ids };
}

// Resolve the final write order: the requested ids that actually exist, in
// requested order, followed by any existing ids the request omitted (keeping
// their current relative order) so no model ever loses its sortOrder. Pure +
// unit-tested. (P-64.)
export function resolveReorder(
  requestedIds: string[],
  existingIdsInOrder: string[]
): string[] {
  const existing = new Set(existingIdsInOrder);
  const taken = new Set<string>();
  const head: string[] = [];
  for (const id of requestedIds) {
    if (existing.has(id) && !taken.has(id)) {
      head.push(id);
      taken.add(id);
    }
  }
  const tail = existingIdsInOrder.filter((id) => !taken.has(id));
  return [...head, ...tail];
}

// --- Handlers ----------------------------------------------------------------

export function makeAiModelRegistryHandlers(deps: AiModelRegistryHandlerDeps) {
  const { prisma, verifyAuth, recordFlake, withRetry } = deps;

  // GET — the full registry, in display order. Seed-on-read: if the table is
  // empty (fresh deploy), bulk-insert the in-code SEED_REGISTRY first so the DB
  // starts identical to what Phase 1 shipped. Then return every row.
  async function GET(req: RequestLike): Promise<HandlerResult> {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    try {
      const count = await withRetry(() => prisma.aiModelRegistryEntry.count());
      if (count === 0) {
        const seed = buildSeedCreateData();
        if (seed.length > 0) {
          await withRetry(() =>
            prisma.aiModelRegistryEntry.createMany({
              data: seed,
              skipDuplicates: true,
            })
          );
        }
      }
      const rows = await withRetry(() =>
        prisma.aiModelRegistryEntry.findMany({ orderBy: { sortOrder: 'asc' } })
      );
      return { status: 200, body: { models: rows.map(toWireShape) } };
    } catch (error) {
      recordFlake('GET ai-models', error);
      return { status: 500, body: { error: 'Failed to load AI model registry' } };
    }
  }

  // POST — add a model (the admin wizard). id is derived; sortOrder appends.
  // Duplicate id → 409.
  async function POST(req: RequestLike): Promise<HandlerResult> {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    const result = validateCreateBody(raw);
    if (!result.ok) return { status: 400, body: { error: result.error } };

    try {
      const existing = await withRetry(() =>
        prisma.aiModelRegistryEntry.findUnique({ where: { id: result.data.id } })
      );
      if (existing) {
        return {
          status: 409,
          body: { error: `A model with id "${result.data.id}" already exists` },
        };
      }
      const count = await withRetry(() => prisma.aiModelRegistryEntry.count());
      const row = await withRetry(() =>
        prisma.aiModelRegistryEntry.create({
          data: { ...result.data, sortOrder: count },
        })
      );
      return { status: 201, body: { model: toWireShape(row) } };
    } catch (error) {
      recordFlake('POST ai-models', error, { id: result.data.id });
      return { status: 500, body: { error: 'Failed to create AI model' } };
    }
  }

  // PUT /ai-models/[id] — edit an existing model's presentation/pricing/status.
  async function PUT(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }

    try {
      const existing = await withRetry(() =>
        prisma.aiModelRegistryEntry.findUnique({ where: { id } })
      );
      if (!existing) {
        return { status: 404, body: { error: `No model with id "${id}"` } };
      }
      const provider: AiProviderId = isAiProviderId(existing.provider)
        ? existing.provider
        : 'anthropic';
      const result = validateUpdateBody(raw, provider);
      if (!result.ok) return { status: 400, body: { error: result.error } };

      const row = await withRetry(() =>
        prisma.aiModelRegistryEntry.update({
          where: { id },
          data: result.data,
        })
      );
      return { status: 200, body: { model: toWireShape(row) } };
    } catch (error) {
      recordFlake('PUT ai-models', error, { id });
      return { status: 500, body: { error: 'Failed to update AI model' } };
    }
  }

  // DELETE /ai-models/[id] — remove a model from the registry entirely.
  async function DELETE(_req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const auth = await verifyAuth(_req);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;

    try {
      const existing = await withRetry(() =>
        prisma.aiModelRegistryEntry.findUnique({ where: { id } })
      );
      if (!existing) {
        return { status: 404, body: { error: `No model with id "${id}"` } };
      }
      await withRetry(() =>
        prisma.aiModelRegistryEntry.delete({ where: { id } })
      );
      return { status: 200, body: { ok: true, id } };
    } catch (error) {
      recordFlake('DELETE ai-models', error, { id });
      return { status: 500, body: { error: 'Failed to delete AI model' } };
    }
  }

  // PATCH /api/ai-models — reorder. Body { orderedIds }. Writes each model's
  // sortOrder to its position in the resolved order; the dropdowns then render in
  // that order via the live hook (no picker changes). Does NOT touch any model's
  // enabled/runnable/default — order only. (P-64.)
  async function REORDER(req: RequestLike): Promise<HandlerResult> {
    const auth = await verifyAuth(req);
    if (auth.error) return auth.error;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    const result = validateReorderBody(raw);
    if (!result.ok) return { status: 400, body: { error: result.error } };

    try {
      const current = await withRetry(() =>
        prisma.aiModelRegistryEntry.findMany({ orderBy: { sortOrder: 'asc' } })
      );
      const finalOrder = resolveReorder(
        result.orderedIds,
        current.map((r) => r.id)
      );
      for (let i = 0; i < finalOrder.length; i++) {
        await withRetry(() =>
          prisma.aiModelRegistryEntry.update({
            where: { id: finalOrder[i] },
            data: { sortOrder: i },
          })
        );
      }
      const rows = await withRetry(() =>
        prisma.aiModelRegistryEntry.findMany({ orderBy: { sortOrder: 'asc' } })
      );
      return { status: 200, body: { models: rows.map(toWireShape) } };
    } catch (error) {
      recordFlake('PATCH ai-models reorder', error);
      return { status: 500, body: { error: 'Failed to reorder AI models' } };
    }
  }

  return { GET, POST, PUT, DELETE, REORDER };
}
