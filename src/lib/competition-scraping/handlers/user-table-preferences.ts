// W#2 P-46 Workstream 3 — DI seam for the per-user-per-project Competition
// Data table preferences route. Mirrors url-text.ts / url-reviews.ts
// factory pattern; the inner handlers return `{ status, body }` and never
// touch `next/server` types.
//
// Spec: docs/COMPETITION_DATA_V2_DESIGN.md §A.3 + §C.3.
//
// Path-convention refactor (2026-05-23-d session): Workstream 1 originally
// scaffolded this at `/api/users/[userId]/table-preferences/[projectId]`.
// That diverged from the rest of W#2's auth-derived-userId convention
// (extension-state route at `/api/extension-state`; W#2 project-scoped routes
// at `/api/projects/[projectId]/competition-scraping/...`). Workstream 3
// moves it to `/api/projects/[projectId]/competition-scraping/table-preferences`
// with the userId resolved from auth context. The Prisma row is still keyed
// by the @@unique([userId, projectId]) compound; only the URL surface changed.

import { Prisma } from '@prisma/client';

import type {
  CategoryTableLayout,
  UserTablePreferences,
  WriteUserTablePreferencesRequest,
} from '../../shared-types/competition-scraping.ts';
import { isTablePreferencesSortDirection } from '../../shared-types/competition-scraping.ts';
import {
  coerceCategoryTableLayout,
  validateCategoryTableLayout,
} from '../category-table-layout.ts';

import type { HandlerResult, RequestLike } from './shared.ts';

export type { HandlerResult, RequestLike } from './shared.ts';

export type Ctx = { params: Promise<{ projectId: string }> };

export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 24;

// Shape of the row Prisma returns from the userTablePreferences delegate.
export type UserTablePreferencesRow = {
  id: string;
  userId: string;
  projectId: string;
  columnVisibility: Prisma.JsonValue;
  columnWidths: Prisma.JsonValue;
  fontSize: number;
  rowOrder: Prisma.JsonValue;
  lastUsedSortColumn: string | null;
  lastUsedSortDirection: string | null;
  categoryTableLayout: Prisma.JsonValue | null;
  updatedAt: Date;
};

// Minimal Prisma surface the handler exercises. The `_unused` field on
// upsert.create is a TypeScript-friendly way to allow the create input
// to carry the same writable fields as update without duplicating types.
export type UserTablePreferencesPrismaLike = {
  userTablePreferences: {
    findUnique(args: {
      where: { userId_projectId: { userId: string; projectId: string } };
    }): Promise<UserTablePreferencesRow | null>;
    upsert(args: {
      where: { userId_projectId: { userId: string; projectId: string } };
      create: Prisma.UserTablePreferencesUncheckedCreateInput;
      update: Prisma.UserTablePreferencesUpdateInput;
    }): Promise<UserTablePreferencesRow>;
  };
};

// Authn/authz seam. Mirrors verifyProjectAuth's contract — { userId } on
// success, { error: HandlerResult } on failure. Tests pass a stub that
// returns either shape without importing next/server.
export type VerifyProjectAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: HandlerResult };

export type VerifyProjectAuthFn = (
  req: RequestLike,
  projectId: string
) => Promise<VerifyProjectAuthResult>;

export type UserTablePreferencesHandlerDeps = {
  prisma: UserTablePreferencesPrismaLike;
  verifyProjectAuth: VerifyProjectAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

// Convert a Prisma row to the wire shape. JSON columns are typed as
// JsonValue at the Prisma layer; this coerces them to the typed
// Record<string, boolean | number> + string[] shapes the wire contract
// promises. Bad shapes in the DB (shouldn't happen since PUT validates
// strictly) fall back to empty defaults so the client never sees a 500
// just because someone hand-edited the DB.
export function toWireShape(row: UserTablePreferencesRow): UserTablePreferences {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    columnVisibility: toBoolMap(row.columnVisibility),
    columnWidths: toNumMap(row.columnWidths),
    fontSize: row.fontSize,
    rowOrder: toStringArray(row.rowOrder),
    lastUsedSortColumn: row.lastUsedSortColumn,
    lastUsedSortDirection: isTablePreferencesSortDirection(
      row.lastUsedSortDirection
    )
      ? row.lastUsedSortDirection
      : null,
    categoryTableLayout: coerceCategoryTableLayout(row.categoryTableLayout),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toBoolMap(value: Prisma.JsonValue): Record<string, boolean> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'boolean') out[k] = v;
  }
  return out;
}

function toNumMap(value: Prisma.JsonValue): Record<string, number> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
  }
  return out;
}

function toStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function isPlainObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

// Strict trust-boundary validation. Returns { ok, patch } where patch is
// the subset of fields the caller actually supplied (so the upsert update
// only touches what changed) — or { ok: false, error } on invalid shape.
// Unknown keys at the top level are silently ignored (additive-future-safe).
export type ValidatedPatch = {
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  fontSize?: number;
  rowOrder?: string[];
  lastUsedSortColumn?: string | null;
  lastUsedSortDirection?: 'asc' | 'desc' | null;
  categoryTableLayout?: CategoryTableLayout | null;
};

export type ValidationResult =
  | { ok: true; patch: ValidatedPatch }
  | { ok: false; error: string };

export function extractTablePreferencesPatch(body: unknown): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const b = body as Record<string, unknown>;
  const patch: ValidatedPatch = {};

  if ('columnVisibility' in b) {
    const v = b.columnVisibility;
    if (!isPlainObject(v)) {
      return { ok: false, error: 'columnVisibility must be an object' };
    }
    const map: Record<string, boolean> = {};
    for (const [k, val] of Object.entries(v)) {
      if (typeof val !== 'boolean') {
        return {
          ok: false,
          error: `columnVisibility.${k} must be a boolean`,
        };
      }
      map[k] = val;
    }
    patch.columnVisibility = map;
  }

  if ('columnWidths' in b) {
    const v = b.columnWidths;
    if (!isPlainObject(v)) {
      return { ok: false, error: 'columnWidths must be an object' };
    }
    const map: Record<string, number> = {};
    for (const [k, val] of Object.entries(v)) {
      if (
        typeof val !== 'number' ||
        !Number.isFinite(val) ||
        val < 0 ||
        !Number.isInteger(val)
      ) {
        return {
          ok: false,
          error: `columnWidths.${k} must be a non-negative integer`,
        };
      }
      map[k] = val;
    }
    patch.columnWidths = map;
  }

  if ('fontSize' in b) {
    const v = b.fontSize;
    if (
      typeof v !== 'number' ||
      !Number.isInteger(v) ||
      v < FONT_SIZE_MIN ||
      v > FONT_SIZE_MAX
    ) {
      return {
        ok: false,
        error: `fontSize must be an integer between ${FONT_SIZE_MIN} and ${FONT_SIZE_MAX}`,
      };
    }
    patch.fontSize = v;
  }

  if ('rowOrder' in b) {
    const v = b.rowOrder;
    if (!Array.isArray(v)) {
      return { ok: false, error: 'rowOrder must be an array' };
    }
    for (const item of v) {
      if (typeof item !== 'string') {
        return { ok: false, error: 'rowOrder must be an array of strings' };
      }
    }
    patch.rowOrder = v as string[];
  }

  if ('lastUsedSortColumn' in b) {
    const v = b.lastUsedSortColumn;
    if (v !== null && typeof v !== 'string') {
      return {
        ok: false,
        error: 'lastUsedSortColumn must be a string or null',
      };
    }
    patch.lastUsedSortColumn = v as string | null;
  }

  if ('lastUsedSortDirection' in b) {
    const v = b.lastUsedSortDirection;
    if (v !== null && !isTablePreferencesSortDirection(v)) {
      return {
        ok: false,
        error: 'lastUsedSortDirection must be "asc", "desc", or null',
      };
    }
    patch.lastUsedSortDirection = v as 'asc' | 'desc' | null;
  }

  if ('categoryTableLayout' in b) {
    const result = validateCategoryTableLayout(b.categoryTableLayout);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    patch.categoryTableLayout = result.value;
  }

  return { ok: true, patch };
}

// Factory returning the GET + PUT inner handlers. Production wires
// `verifyProjectAuth = (req, projectId) => verifyProjectAuth(req, projectId)`
// from src/lib/auth.ts; tests inject stubs.
export function makeUserTablePreferencesHandlers(
  deps: UserTablePreferencesHandlerDeps
) {
  const { prisma, verifyProjectAuth, recordFlake, withRetry } = deps;

  // GET /api/projects/[projectId]/competition-scraping/table-preferences
  // 200 { row } when present; 404 when no prefs saved yet (client falls
  // back to defaults). 401/403 from auth as usual.
  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    try {
      const row = await withRetry(() =>
        prisma.userTablePreferences.findUnique({
          where: { userId_projectId: { userId, projectId } },
        })
      );
      if (!row) {
        return { status: 404, body: { error: 'No preferences saved yet' } };
      }
      return { status: 200, body: toWireShape(row) };
    } catch (error) {
      recordFlake('GET table-preferences', error, { userId, projectId });
      return {
        status: 500,
        body: { error: 'Failed to load table preferences' },
      };
    }
  }

  // PUT /api/projects/[projectId]/competition-scraping/table-preferences
  // Upsert semantics. Body is a partial WriteUserTablePreferencesRequest;
  // only supplied fields update. 200 { row } on success.
  async function PUT(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    const result = extractTablePreferencesPatch(raw);
    if (!result.ok) {
      return { status: 400, body: { error: result.error } };
    }
    const { patch } = result;

    // Upsert input. `create` needs every required column populated with the
    // defaults the schema declares; `update` carries only the patched
    // fields so untouched columns keep their prior values. Prisma's
    // UpdateInput type accepts undefined keys (skipped) but not missing
    // ones with strict typing; we splat conditionally.
    const update: Prisma.UserTablePreferencesUpdateInput = {};
    if (patch.columnVisibility !== undefined) {
      update.columnVisibility = patch.columnVisibility;
    }
    if (patch.columnWidths !== undefined) {
      update.columnWidths = patch.columnWidths;
    }
    if (patch.fontSize !== undefined) update.fontSize = patch.fontSize;
    if (patch.rowOrder !== undefined) update.rowOrder = patch.rowOrder;
    if (patch.lastUsedSortColumn !== undefined) {
      update.lastUsedSortColumn = patch.lastUsedSortColumn;
    }
    if (patch.lastUsedSortDirection !== undefined) {
      update.lastUsedSortDirection = patch.lastUsedSortDirection;
    }
    if (patch.categoryTableLayout !== undefined) {
      // Nullable Json column: a null patch clears the memory back to SQL NULL
      // (Prisma.DbNull); an object replaces it wholesale.
      update.categoryTableLayout =
        patch.categoryTableLayout === null
          ? Prisma.DbNull
          : (patch.categoryTableLayout as unknown as Prisma.InputJsonValue);
    }

    const create: Prisma.UserTablePreferencesUncheckedCreateInput = {
      userId,
      projectId,
      columnVisibility: patch.columnVisibility ?? {},
      columnWidths: patch.columnWidths ?? {},
      fontSize: patch.fontSize ?? 14,
      rowOrder: patch.rowOrder ?? [],
      lastUsedSortColumn: patch.lastUsedSortColumn ?? null,
      lastUsedSortDirection: patch.lastUsedSortDirection ?? null,
      categoryTableLayout:
        patch.categoryTableLayout == null
          ? Prisma.DbNull
          : (patch.categoryTableLayout as unknown as Prisma.InputJsonValue),
    };

    try {
      const row = await withRetry(() =>
        prisma.userTablePreferences.upsert({
          where: { userId_projectId: { userId, projectId } },
          create,
          update,
        })
      );
      return { status: 200, body: toWireShape(row) };
    } catch (error) {
      recordFlake('PUT table-preferences', error, { userId, projectId });
      return {
        status: 500,
        body: { error: 'Failed to save table preferences' },
      };
    }
  }

  return { GET, PUT };
}
