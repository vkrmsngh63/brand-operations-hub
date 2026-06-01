// W#2 P-54 Phase 3 (2026-06-01) — DI seam for the SHARED per-Project main
// /competition-scraping table layout. Mirrors user-table-preferences.ts but
// the row is keyed by projectId @unique (no userId): column order, show/hide,
// widths, competitor row order, and font size are shared across everyone on
// the Project (director directive). The per-user UserTablePreferences handler
// is untouched and still backs the per-user Reviews Analysis page layouts.
//
// Seed-on-read: on GET, if no ProjectTablePreferences row exists yet, the
// requesting user's existing UserTablePreferences row (if any) is copied into a
// new project row so a pre-existing per-user layout is preserved as the shared
// starting point (no surprise reset to defaults). If neither exists → 404 and
// the client falls back to defaults.

import { Prisma } from '@prisma/client';

import type {
  ProjectTablePreferences,
} from '../../shared-types/competition-scraping.ts';
import { isTablePreferencesSortDirection } from '../../shared-types/competition-scraping.ts';

import type { HandlerResult, RequestLike } from './shared.ts';

export type { HandlerResult, RequestLike } from './shared.ts';

export type Ctx = { params: Promise<{ projectId: string }> };

export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 24;

// Shape of the row Prisma returns from the projectTablePreferences delegate.
export type ProjectTablePreferencesRow = {
  id: string;
  projectId: string;
  columnOrder: Prisma.JsonValue;
  columnVisibility: Prisma.JsonValue;
  columnWidths: Prisma.JsonValue;
  fontSize: number;
  rowOrder: Prisma.JsonValue;
  lastUsedSortColumn: string | null;
  lastUsedSortDirection: string | null;
  updatedAt: Date;
};

// The per-user row we may seed from (subset of UserTablePreferences fields).
export type SeedUserPrefsRow = {
  columnVisibility: Prisma.JsonValue;
  columnWidths: Prisma.JsonValue;
  fontSize: number;
  rowOrder: Prisma.JsonValue;
  lastUsedSortColumn: string | null;
  lastUsedSortDirection: string | null;
} | null;

// Minimal Prisma surface the handler exercises.
export type ProjectTablePreferencesPrismaLike = {
  projectTablePreferences: {
    findUnique(args: {
      where: { projectId: string };
    }): Promise<ProjectTablePreferencesRow | null>;
    upsert(args: {
      where: { projectId: string };
      create: Prisma.ProjectTablePreferencesUncheckedCreateInput;
      update: Prisma.ProjectTablePreferencesUpdateInput;
    }): Promise<ProjectTablePreferencesRow>;
  };
  userTablePreferences: {
    findUnique(args: {
      where: { userId_projectId: { userId: string; projectId: string } };
    }): Promise<SeedUserPrefsRow>;
  };
};

export type VerifyProjectAuthResult =
  | { userId: string; error: null }
  | { userId: null; error: HandlerResult };

export type VerifyProjectAuthFn = (
  req: RequestLike,
  projectId: string
) => Promise<VerifyProjectAuthResult>;

export type ProjectTablePreferencesHandlerDeps = {
  prisma: ProjectTablePreferencesPrismaLike;
  verifyProjectAuth: VerifyProjectAuthFn;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
};

export function toWireShape(
  row: ProjectTablePreferencesRow
): ProjectTablePreferences {
  return {
    id: row.id,
    projectId: row.projectId,
    columnOrder: toStringArray(row.columnOrder),
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export type ValidatedPatch = {
  columnOrder?: string[];
  columnVisibility?: Record<string, boolean>;
  columnWidths?: Record<string, number>;
  fontSize?: number;
  rowOrder?: string[];
  lastUsedSortColumn?: string | null;
  lastUsedSortDirection?: 'asc' | 'desc' | null;
};

export type ValidationResult =
  | { ok: true; patch: ValidatedPatch }
  | { ok: false; error: string };

export function extractProjectTablePreferencesPatch(
  body: unknown
): ValidationResult {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const b = body as Record<string, unknown>;
  const patch: ValidatedPatch = {};

  if ('columnOrder' in b) {
    const v = b.columnOrder;
    if (!Array.isArray(v)) {
      return { ok: false, error: 'columnOrder must be an array' };
    }
    for (const item of v) {
      if (typeof item !== 'string') {
        return { ok: false, error: 'columnOrder must be an array of strings' };
      }
    }
    patch.columnOrder = v as string[];
  }

  if ('columnVisibility' in b) {
    const v = b.columnVisibility;
    if (!isPlainObject(v)) {
      return { ok: false, error: 'columnVisibility must be an object' };
    }
    const map: Record<string, boolean> = {};
    for (const [k, val] of Object.entries(v)) {
      if (typeof val !== 'boolean') {
        return { ok: false, error: `columnVisibility.${k} must be a boolean` };
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
      return { ok: false, error: 'lastUsedSortColumn must be a string or null' };
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

  return { ok: true, patch };
}

export function makeProjectTablePreferencesHandlers(
  deps: ProjectTablePreferencesHandlerDeps
) {
  const { prisma, verifyProjectAuth, recordFlake, withRetry } = deps;

  // GET — returns the shared row. Seed-on-read: if no project row exists yet,
  // copy the requesting user's UserTablePreferences (if any) into a new project
  // row so a pre-existing layout is preserved as the shared starting point.
  // 404 only when there is nothing to seed from either.
  async function GET(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;
    const { userId } = auth;

    try {
      const existing = await withRetry(() =>
        prisma.projectTablePreferences.findUnique({ where: { projectId } })
      );
      if (existing) {
        return { status: 200, body: toWireShape(existing) };
      }

      // Seed from the requesting user's per-user prefs, if present.
      const seed = await withRetry(() =>
        prisma.userTablePreferences.findUnique({
          where: { userId_projectId: { userId, projectId } },
        })
      );
      if (!seed) {
        return { status: 404, body: { error: 'No preferences saved yet' } };
      }
      const seededRow = await withRetry(() =>
        prisma.projectTablePreferences.upsert({
          where: { projectId },
          create: {
            projectId,
            columnOrder: [],
            columnVisibility:
              seed.columnVisibility as Prisma.InputJsonValue,
            columnWidths: seed.columnWidths as Prisma.InputJsonValue,
            fontSize: seed.fontSize,
            rowOrder: seed.rowOrder as Prisma.InputJsonValue,
            lastUsedSortColumn: seed.lastUsedSortColumn,
            lastUsedSortDirection: seed.lastUsedSortDirection,
          },
          // If a concurrent request already created the row, keep it as-is.
          update: {},
        })
      );
      return { status: 200, body: toWireShape(seededRow) };
    } catch (error) {
      recordFlake('GET project-table-preferences', error, { projectId });
      return {
        status: 500,
        body: { error: 'Failed to load table preferences' },
      };
    }
  }

  // PUT — upsert by projectId. Partial payload; only supplied fields update.
  async function PUT(req: RequestLike, ctx: Ctx): Promise<HandlerResult> {
    const { projectId } = await ctx.params;
    const auth = await verifyProjectAuth(req, projectId);
    if (auth.error) return auth.error;

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return { status: 400, body: { error: 'Invalid JSON body' } };
    }
    const result = extractProjectTablePreferencesPatch(raw);
    if (!result.ok) {
      return { status: 400, body: { error: result.error } };
    }
    const { patch } = result;

    const update: Prisma.ProjectTablePreferencesUpdateInput = {};
    if (patch.columnOrder !== undefined) update.columnOrder = patch.columnOrder;
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

    const create: Prisma.ProjectTablePreferencesUncheckedCreateInput = {
      projectId,
      columnOrder: patch.columnOrder ?? [],
      columnVisibility: patch.columnVisibility ?? {},
      columnWidths: patch.columnWidths ?? {},
      fontSize: patch.fontSize ?? 14,
      rowOrder: patch.rowOrder ?? [],
      lastUsedSortColumn: patch.lastUsedSortColumn ?? null,
      lastUsedSortDirection: patch.lastUsedSortDirection ?? null,
    };

    try {
      const row = await withRetry(() =>
        prisma.projectTablePreferences.upsert({
          where: { projectId },
          create,
          update,
        })
      );
      return { status: 200, body: toWireShape(row) };
    } catch (error) {
      recordFlake('PUT project-table-preferences', error, { projectId });
      return {
        status: 500,
        body: { error: 'Failed to save table preferences' },
      };
    }
  }

  return { GET, PUT };
}
