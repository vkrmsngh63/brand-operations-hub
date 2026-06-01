'use client';

// W#2 Competition Scraping & Deep Analysis — content-area viewer.
//
// Implements the platforms-→-URLs navigation + URL list with sort + free-text
// search per docs/COMPETITION_SCRAPING_DESIGN.md §A.7 + §A.14 and the
// PLATFORM_REQUIREMENTS.md §12.6 shared component pattern #2 ("the content
// area is the workflow's own concern, not imposed by the library"). W#2 is
// the first workflow to author such a custom content component.
//
// Reads from GET /api/projects/[projectId]/competition-scraping/urls (shipped
// in API-routes session-1; spec at COMPETITION_SCRAPING_STACK_DECISIONS.md
// §11.1). Pulls every URL for the Project in one request — counts per
// platform (header bar) and the active platform's table are derived
// client-side. At Phase 3 throughput (~30 URLs/platform/Project) client-side
// sort + filter stays snappy without pagination; revisit if a future scale
// pass shows otherwise.
//
// As of slice (a.4), the platform selection AND the per-column filter set
// AND the free-text search query all serialize into the URL query — so a
// refresh, browser back/forward, or a deep-link copy/paste all preserve
// the user's exact view. Filter state lives in URL; the search box uses a
// debounced URL write so each keystroke doesn't trigger a routing flush.
//
// P-46 Workstream 3 Session 1 (2026-05-23-d) — replaces the left-side
// PlatformSidebar with a horizontal ColumnVisibilityBar at the top of the
// table that combines platform filters + per-column show/hide. Column
// visibility persists per-user-per-project via UserTablePreferences (auth-
// derived path /api/projects/[projectId]/competition-scraping/table-preferences).
// The fetch happens once at mount; mutations fire a debounced PUT ~500ms
// after the last change so column-toggle bursts don't hammer the server.
//
// P-46 Workstream 3 Session 3 (today) extends the same UserTablePreferences
// row + the same debounced-PUT lifecycle to carry three more controls —
// per-column widths (drag the right edge of any header), row order
// (drag-to-reorder via dnd-kit), and an adjustable text-size stepper. All
// three coexist on the same 500ms debounce; a burst of drag events from
// any control coalesces into one network write.
//
// Slice (a.1) wires click-row to navigate to /url/[urlId]; the prior
// open-in-new-tab behavior is preserved via an explicit "Open original
// URL ↗" button on the detail page itself.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import {
  isPlatform,
  PLATFORMS,
  type CompetitorUrl,
  type ListCompetitorUrlsResponse,
  type Platform,
  type ReadProjectTablePreferencesResponse,
  type UpdateCompetitorUrlRequest,
  type UpdateCompetitorUrlResponse,
  type WriteProjectTablePreferencesRequest,
} from '@/lib/shared-types/competition-scraping';
import type {
  GroupByMode,
  ActiveGroupMode,
} from '@/lib/competition-scraping/main-table-grouping';
import {
  CAPTURED_KINDS,
  normalizeCategory,
  type CapturedKind,
} from '@/lib/competition-scraping/dynamic-columns';
import { ColumnVisibilityBar } from './ColumnVisibilityBar';
import {
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
} from './url-table-columns';
import { UrlTable } from './UrlTable';
import {
  EMPTY_COLUMN_FILTERS,
  readFiltersFromQuery,
  writeFiltersToQuery,
  type ColumnFiltersState,
} from './ColumnFilters';

interface Props {
  projectId: string;
}

const SEARCH_DEBOUNCE_MS = 250;
const PREFS_DEBOUNCE_MS = 500;

export function CompetitionScrapingViewer({ projectId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 2026-05-24 fix-forward (Issue 5) — Multi-select platform state in the
  // URL query. Source-of-truth shape:
  //   - `?platforms=amazon,ebay` → exactly those two platforms selected
  //   - `?platforms=`            → ZERO selected (empty-state)
  //   - param missing entirely   → ALL selected (default)
  //   - legacy `?platform=X`     → treated as `?platforms=X` for bookmarks
  //     written before today's fix-forward
  const selectedPlatforms = useMemo<Platform[]>(() => {
    const multi = searchParams?.get('platforms');
    if (multi !== null && multi !== undefined) {
      if (multi === '') return [];
      const parsed = multi
        .split(',')
        .map((s) => s.trim())
        .filter((s): s is Platform => isPlatform(s));
      return parsed;
    }
    // Legacy single-platform query string from the pre-fix-forward deploy.
    const legacy = searchParams?.get('platform') ?? null;
    if (legacy && isPlatform(legacy)) return [legacy];
    // Default — all platforms selected.
    return [...PLATFORMS];
  }, [searchParams]);

  // Filter state lives in the URL. Re-derive on every render so the back/
  // forward buttons and deep links work without extra wiring.
  const filters: ColumnFiltersState = useMemo(
    () =>
      searchParams
        ? readFiltersFromQuery(new URLSearchParams(searchParams.toString()))
        : EMPTY_COLUMN_FILTERS,
    [searchParams]
  );

  // Free-text search query lives in `?q=` in the URL (writable with a 250ms
  // debounce so each keystroke doesn't trigger a routing flush). The
  // `draftSearch` mirror lets the input update instantly while the URL
  // catches up asynchronously.
  const urlSearch = searchParams?.get('q') ?? '';
  const [draftSearch, setDraftSearch] = useState<string>(urlSearch);

  // When the URL changes from an external source (back/forward, deep link),
  // re-sync the draft so the input box reflects the URL.
  useEffect(() => {
    setDraftSearch(urlSearch);
  }, [urlSearch]);

  // After the user pauses typing, write the draft to the URL.
  useEffect(() => {
    if (draftSearch === urlSearch) return;
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (draftSearch === '') {
        params.delete('q');
      } else {
        params.set('q', draftSearch);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?');
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [draftSearch, urlSearch, router, searchParams]);

  const [urls, setUrls] = useState<CompetitorUrl[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // P-54 Phase 5 (2026-06-01) — fetch with `?withCaptures=1` so each URL row
  // carries its captured content/image/video items (the dynamic category
  // columns render from `row.captures`). `silent` re-fetches in place (used by
  // the refetch-on-return listener) without flashing the loading state.
  const loadUrls = useCallback(
    async (silent: boolean): Promise<void> => {
      if (!silent) {
        setError(null);
        setUrls(null);
      }
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
        );
        if (!res.ok) {
          throw new Error(`Could not load URLs (HTTP ${res.status}).`);
        }
        const data = (await res.json()) as ListCompetitorUrlsResponse;
        setUrls(data);
        if (silent) setError(null);
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : 'Could not load URLs.');
        }
        // A silent refresh that fails leaves the last-good data on screen.
      }
    },
    [projectId]
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // The cancelled guard prevents a stale project's fetch from landing after
      // a fast project switch.
      setError(null);
      setUrls(null);
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls?withCaptures=1`
        );
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(`Could not load URLs (HTTP ${res.status}).`);
        }
        const data = (await res.json()) as ListCompetitorUrlsResponse;
        if (!cancelled) setUrls(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load URLs.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // P-54 Phase 5 (2026-06-01) — D4 "refetch-on-return": pull the latest captured
  // items (and URL fields) when the user comes back to this tab/window after
  // editing a competitor's detail page, mirroring the review pages' pattern.
  // `loadedRef` gates the refresh so it doesn't fire before the first load.
  const loadedRef = useRef(false);
  useEffect(() => {
    loadedRef.current = urls !== null;
  }, [urls]);
  useEffect(() => {
    function onRefocus(): void {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      if (!loadedRef.current) return;
      void loadUrls(true);
    }
    window.addEventListener('focus', onRefocus);
    document.addEventListener('visibilitychange', onRefocus);
    return () => {
      window.removeEventListener('focus', onRefocus);
      document.removeEventListener('visibilitychange', onRefocus);
    };
  }, [loadUrls]);

  // P-46 Workstream 3 Sessions 1+3 — UserTablePreferences state.
  // Session 1 wired columnVisibility (map of columnId → visible).
  // Session 3 (today) adds columnWidths (map of columnId → pixels),
  // fontSize (10-24), and rowOrder (array of competitorUrlIds in the
  // user's preferred display order).
  //
  // All four default to empty/default values; the seed effect below fills
  // them from a single GET. 404 from the GET is expected on first visit —
  // the row is created lazily on first mutation via the debounced PUT.
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [fontSize, setFontSize] = useState<number>(FONT_SIZE_DEFAULT);
  const [rowOrder, setRowOrder] = useState<string[]>([]);
  // P-54 Phase 3 (2026-06-01) — shared per-Project column order ([columnId] in
  // arranged left-to-right order). Loaded from + saved to the shared
  // project-table-preferences endpoint along with the other layout fields.
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  // P-54 Phase 4 (2026-06-01) — "Sort By" row grouping, shared per-Project.
  // groupBy = the active grouping mode ('none' = flat). groupOrder = the saved
  // banner order per mode (drag the group banners to reorder).
  const [groupBy, setGroupBy] = useState<GroupByMode>('none');
  const [groupOrder, setGroupOrder] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/project-table-preferences`
        );
        if (cancelled) return;
        if (res.status === 404) {
          // First-visit; no row exists yet. Leave the defaults.
          return;
        }
        if (!res.ok) return; // Silent fallback; defaults render fine.
        const data = (await res.json()) as ReadProjectTablePreferencesResponse;
        if (cancelled) return;
        setColumnVisibility(data.columnVisibility ?? {});
        setColumnWidths(data.columnWidths ?? {});
        setFontSize(
          typeof data.fontSize === 'number' ? data.fontSize : FONT_SIZE_DEFAULT
        );
        setRowOrder(Array.isArray(data.rowOrder) ? data.rowOrder : []);
        setColumnOrder(Array.isArray(data.columnOrder) ? data.columnOrder : []);
        setGroupBy(data.groupBy ?? 'none');
        setGroupOrder(
          data.groupOrder && typeof data.groupOrder === 'object'
            ? data.groupOrder
            : {}
        );
      } catch {
        // Network error — silently fall back to defaults. Failed prefs
        // shouldn't prevent the table from rendering.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Debounced PUT — coalesces a burst of column toggles into one network
  // write. The latest body wins; a new pendingBody resets the timer.
  const prefsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Cleanup on unmount; we don't fire on every body change explicitly
    // since handleToggleColumn drives the timer below.
    return () => {
      if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
    };
  }, []);

  const flushPrefsPut = useCallback(
    async (body: WriteProjectTablePreferencesRequest) => {
      try {
        await authFetch(
          `/api/projects/${projectId}/competition-scraping/project-table-preferences`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
        );
      } catch {
        // Silent failure; the next mutation will retry. Local state stays
        // consistent so the user sees their choice; cross-device sync just
        // pauses.
      }
    },
    [projectId]
  );

  const handleToggleColumn = useCallback(
    (columnId: string, visible: boolean) => {
      setColumnVisibility((prev) => {
        const next = { ...prev, [columnId]: visible };
        if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
        prefsTimerRef.current = setTimeout(() => {
          void flushPrefsPut({ columnVisibility: next });
        }, PREFS_DEBOUNCE_MS);
        return next;
      });
    },
    [flushPrefsPut]
  );

  // P-46 Workstream 3 Session 3 — per-column-width handler. UrlTable's
  // drag-resize handle calls this with the new pixel width on pointerup;
  // values are clamped to MIN_COLUMN_WIDTH / MAX_COLUMN_WIDTH at the
  // call site so a malformed value never reaches state.
  const handleColumnResize = useCallback(
    (columnId: string, width: number) => {
      setColumnWidths((prev) => {
        const next = { ...prev, [columnId]: width };
        if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
        prefsTimerRef.current = setTimeout(() => {
          void flushPrefsPut({ columnWidths: next });
        }, PREFS_DEBOUNCE_MS);
        return next;
      });
    },
    [flushPrefsPut]
  );

  // Font-size stepper hands a clamped value in (FONT_SIZE_MIN, FONT_SIZE_MAX);
  // we re-clamp defensively in case a future caller skips the bar's UI.
  const handleFontSizeChange = useCallback(
    (size: number) => {
      const clamped = Math.max(
        FONT_SIZE_MIN,
        Math.min(FONT_SIZE_MAX, Math.round(size))
      );
      setFontSize(clamped);
      if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
      prefsTimerRef.current = setTimeout(() => {
        void flushPrefsPut({ fontSize: clamped });
      }, PREFS_DEBOUNCE_MS);
    },
    [flushPrefsPut]
  );

  // Drag-to-reorder hands a fresh ordered ID array on every drop. We
  // mirror it to local state immediately (optimistic) so the table re-
  // renders in the new order before the network round-trip resolves.
  const handleRowReorder = useCallback(
    (nextOrder: string[]) => {
      setRowOrder(nextOrder);
      if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
      prefsTimerRef.current = setTimeout(() => {
        void flushPrefsPut({ rowOrder: nextOrder });
      }, PREFS_DEBOUNCE_MS);
    },
    [flushPrefsPut]
  );

  // P-54 Phase 3 (2026-06-01) — column drag-to-reorder hands a fresh ordered
  // column-id array on every header drop. Optimistic local update + debounced
  // PUT to the shared project layout (so everyone on the Project sees the same
  // column order).
  const handleColumnReorder = useCallback(
    (nextOrder: string[]) => {
      setColumnOrder(nextOrder);
      if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
      prefsTimerRef.current = setTimeout(() => {
        void flushPrefsPut({ columnOrder: nextOrder });
      }, PREFS_DEBOUNCE_MS);
    },
    [flushPrefsPut]
  );

  // P-54 Phase 4 (2026-06-01) — "Sort By" grouping mode change. Mutually
  // exclusive; optimistic local update + debounced PUT (shared per-Project).
  const handleGroupByChange = useCallback(
    (mode: GroupByMode) => {
      setGroupBy(mode);
      if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
      prefsTimerRef.current = setTimeout(() => {
        void flushPrefsPut({ groupBy: mode });
      }, PREFS_DEBOUNCE_MS);
    },
    [flushPrefsPut]
  );

  // P-54 Phase 4 — group-banner drag hands the new ordered banner-key array for
  // the active mode. We merge it into the per-mode groupOrder map and persist
  // (so everyone on the Project sees the same banner order for that grouping).
  const handleGroupReorder = useCallback(
    (mode: ActiveGroupMode, nextKeys: string[]) => {
      setGroupOrder((prev) => {
        const next = { ...prev, [mode]: nextKeys };
        if (prefsTimerRef.current) clearTimeout(prefsTimerRef.current);
        prefsTimerRef.current = setTimeout(() => {
          void flushPrefsPut({ groupOrder: next });
        }, PREFS_DEBOUNCE_MS);
        return next;
      });
    },
    [flushPrefsPut]
  );

  // Per-platform counts for the horizontal bar. Memoized so a sort or
  // filter change doesn't recompute them.
  const countsByPlatform = useMemo<Record<Platform, number> | null>(() => {
    if (!urls) return null;
    const c: Record<Platform, number> = {
      amazon: 0,
      ebay: 0,
      etsy: 0,
      walmart: 0,
      'google-shopping': 0,
      'google-ads': 0,
      'independent-website': 0,
    };
    for (const u of urls) {
      c[u.platform as Platform]++;
    }
    return c;
  }, [urls]);
  const totalCount = urls === null ? null : urls.length;

  // P-54 Phase 5 — which captured-content kinds have at least one categorized
  // item across the Project. Drives whether the matching "Content / Image /
  // Video Categories" group checkbox is offered in the Columns box (D7: the
  // group appears only once such content exists).
  const captureGroupsPresent = useMemo<Record<CapturedKind, boolean>>(() => {
    const present: Record<CapturedKind, boolean> = {
      text: false,
      image: false,
      video: false,
    };
    if (!urls) return present;
    for (const u of urls) {
      const c = u.captures;
      if (!c) continue;
      for (const kind of CAPTURED_KINDS) {
        if (
          !present[kind] &&
          c[kind].some((it) => normalizeCategory(it.category) !== null)
        ) {
          present[kind] = true;
        }
      }
    }
    return present;
  }, [urls]);

  // Platform-scoped rows — fed to UrlTable as `scopeRows` so its multi-
  // select dropdowns can derive their option lists from the platform-scoped
  // set instead of the search-and-column-filter-narrowed set.
  //
  // 2026-05-24 fix-forward (Issue 5) — filter switches from single equality
  // to set membership. Empty selectedPlatforms → zero rows (empty state).
  const selectedPlatformSet = useMemo(
    () => new Set<Platform>(selectedPlatforms),
    [selectedPlatforms]
  );
  const scopeRows = useMemo(() => {
    if (!urls) return [];
    if (selectedPlatformSet.size === 0) return [];
    return urls.filter((u) =>
      selectedPlatformSet.has(u.platform as Platform)
    );
  }, [urls, selectedPlatformSet]);

  // Apply the free-text search on top of the platform scope. Column filters
  // are applied inside UrlTable so the table can reason about them
  // alongside its sort.
  const visibleUrls = useMemo(() => {
    const search = draftSearch.trim().toLowerCase();
    if (!search) return scopeRows;
    return scopeRows.filter((u) => {
      const blob = `${u.url} ${u.productName ?? ''} ${u.brandName ?? ''}`.toLowerCase();
      return blob.includes(search);
    });
  }, [scopeRows, draftSearch]);

  // 2026-05-24 fix-forward (Issue 5) — Multi-select handlers. Both
  // serialize the final set of selected platforms to `?platforms=` per
  // the URL convention:
  //   - all selected (default) → drop the param entirely
  //   - subset selected        → `?platforms=amazon,ebay`
  //   - zero selected          → `?platforms=` (empty value)
  // Also clears the legacy `?platform=X` param from the URL so it doesn't
  // shadow the new state.
  const writePlatformsToQuery = useCallback(
    (next: Platform[]): void => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('platform'); // legacy
      if (next.length === PLATFORMS.length) {
        params.delete('platforms');
      } else if (next.length === 0) {
        params.set('platforms', '');
      } else {
        // Preserve canonical PLATFORMS order in the URL for stability.
        const ordered = PLATFORMS.filter((p) => next.includes(p));
        params.set('platforms', ordered.join(','));
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?');
    },
    [router, searchParams]
  );

  const handleTogglePlatform = useCallback(
    (platform: Platform, nextChecked: boolean): void => {
      const current = new Set(selectedPlatforms);
      if (nextChecked) current.add(platform);
      else current.delete(platform);
      writePlatformsToQuery(
        PLATFORMS.filter((p) => current.has(p))
      );
    },
    [selectedPlatforms, writePlatformsToQuery]
  );

  const handleSelectAllPlatforms = useCallback(
    (nextAll: boolean): void => {
      writePlatformsToQuery(nextAll ? [...PLATFORMS] : []);
    },
    [writePlatformsToQuery]
  );

  const handleFiltersChange = (next: ColumnFiltersState): void => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    writeFiltersToQuery(params, next);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?');
  };

  // Click-row → navigate to per-URL detail page. router.push preserves the
  // history stack so the browser Back button returns to this list view
  // (with platform + search + filter state survived via the URL bar).
  const handleRowOpen = (urlId: string): void => {
    router.push(`/projects/${projectId}/competition-scraping/url/${urlId}`);
  };

  // P-29 Slice #1 — manual-add modal calls this with the newly-created row
  // so the table updates without a refetch round-trip. POST is idempotent
  // on (workflow, platform, url) so a duplicate-create returns the existing
  // row; we dedup here to avoid double-listing.
  const handleUrlAdded = (row: CompetitorUrl): void => {
    setUrls((prev) => {
      if (!prev) return [row];
      const existing = prev.findIndex((u) => u.id === row.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = row;
        return next;
      }
      return [row, ...prev];
    });
  };

  // P-28 — optimistic remove for the trash button on each URL row. UrlTable
  // calls this BEFORE the DELETE network call and re-adds via handleUrlAdded
  // if the network call fails (idempotent re-add via id-dedup above).
  const handleUrlDeleted = (urlId: string): void => {
    setUrls((prev) => (prev ? prev.filter((u) => u.id !== urlId) : prev));
  };

  // P-46 Workstream 3 Session 2 — per-cell save handler. UrlTable's inline
  // cell editors call this with the single field they're editing; we PATCH
  // /api/projects/[projectId]/competition-scraping/urls/[urlId] and replace
  // the local row with the server's response. Throws on PATCH failure so
  // the inline cell can render its error.
  const handleCellSave = useCallback(
    async (
      urlId: string,
      patch: UpdateCompetitorUrlRequest
    ): Promise<void> => {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body && typeof body.error === 'string') detail = body.error;
        } catch {
          // fall through with HTTP status as the message
        }
        throw new Error(detail);
      }
      const updated = (await res.json()) as UpdateCompetitorUrlResponse;
      setUrls((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((u) => u.id === updated.id);
        if (idx < 0) return prev;
        const next = [...prev];
        // P-54 Phase 5 — the /urls PATCH response does NOT include `captures`
        // (that rides only on the `?withCaptures=1` list read); carry the
        // existing captures forward so a normal cell edit never blanks the
        // dynamic category columns.
        next[idx] = { ...updated, captures: prev[idx].captures };
        return next;
      });
    },
    [projectId]
  );

  // P-54 Phase 5 (2026-06-01) — in-table edit of a captured item's value (the
  // captured/embedded text) or its analysis. Writes back through the SAME
  // per-item PATCH route the detail page uses, then patches the matching item
  // inside the owning URL's `captures` so the cell reflects the edit without a
  // refetch. `kind` selects the route + which captures bucket to update.
  const handleCapturedSave = useCallback(
    async (
      kind: 'text' | 'image' | 'video',
      itemId: string,
      patch: { body?: string | null; analysis?: Record<string, unknown> }
    ): Promise<void> => {
      const routeSegment =
        kind === 'text' ? 'text' : kind === 'image' ? 'images' : 'videos';
      // The value column maps to `text` (content) or `embeddedText` (image/video).
      const wireBody: Record<string, unknown> = {};
      if ('body' in patch) {
        if (kind === 'text') wireBody.text = patch.body ?? '';
        else wireBody.embeddedText = patch.body ?? '';
      }
      if ('analysis' in patch && patch.analysis !== undefined) {
        wireBody.analysis = patch.analysis;
      }
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/${routeSegment}/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wireBody),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const b = (await res.json()) as { error?: string };
          if (b && typeof b.error === 'string') detail = b.error;
        } catch {
          // fall through with HTTP status
        }
        throw new Error(detail);
      }
      setUrls((prev) => {
        if (!prev) return prev;
        return prev.map((u) => {
          const bucket = u.captures?.[kind];
          if (!bucket || !bucket.some((it) => it.id === itemId)) return u;
          const nextBucket = bucket.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  ...('body' in patch ? { body: patch.body ?? null } : {}),
                  ...('analysis' in patch && patch.analysis !== undefined
                    ? { analysis: patch.analysis }
                    : {}),
                }
              : it
          );
          return { ...u, captures: { ...u.captures!, [kind]: nextBucket } };
        });
      });
    },
    [projectId]
  );

  const scopedTotal = scopeRows.length;
  // UrlTable still wants a single "default platform" hint for the +Manually
  // add URL modal. When the multi-select has exactly one platform → that's
  // the default. Otherwise → 'all' (modal makes user pick).
  const modalDefaultPlatform: Platform | 'all' =
    selectedPlatforms.length === 1 ? selectedPlatforms[0] : 'all';

  return (
    <section style={{ marginTop: '32px' }}>
      {/* P-54 Phase 1 (R3, 2026-06-01) — removed the blue "→ Comprehensive
          Competitor Analysis" button that lived here. It was a redundant
          duplicate of the "Comprehensive Analysis" tab in the
          CompetitionScrapingSurfaceNav at the top of the page, which links to
          the same /comprehensive-analysis route. */}
      <ColumnVisibilityBar
        selectedPlatforms={selectedPlatforms}
        countsByPlatform={countsByPlatform}
        totalCount={totalCount}
        loading={urls === null && !error}
        onTogglePlatform={handleTogglePlatform}
        onSelectAllPlatforms={handleSelectAllPlatforms}
        columnVisibility={columnVisibility}
        onToggleColumn={handleToggleColumn}
        captureGroupsPresent={captureGroupsPresent}
        groupBy={groupBy}
        onGroupByChange={handleGroupByChange}
      />

      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '320px',
          /* P-54 Phase 2 FF2 (2026-06-01) — director report: the grey panel
             background/border stopped at the viewport edge while the wide
             table overflowed past it. Shrink-wrap this panel to the table's
             true content width so its grey background + border extend all the
             way to the right of the table. minWidth:100% keeps it at least
             viewport-wide when the table is narrow / on the empty states. */
          width: 'max-content',
          minWidth: '100%',
        }}
      >
        {error ? (
          <EmptyState title="Couldn’t load URLs" body={error} tone="error" />
        ) : urls === null ? (
          <EmptyState title="Loading competitor URLs…" />
        ) : urls.length === 0 ? (
          <EmptyState
            title="No competitor URLs captured yet"
            body="Install the Chrome extension above to start capturing competitor URLs from Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, and independent product websites. Captured URLs appear here in real time."
          />
        ) : selectedPlatforms.length === 0 ? (
          <EmptyState
            title="No platforms selected"
            body="Pick at least one platform above to see captured URLs. Click ‘All Platforms’ to show every platform’s URLs at once."
          />
        ) : (
          <UrlTable
            columnVisibility={columnVisibility}
            columnWidths={columnWidths}
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            rowOrder={rowOrder}
            columnOrder={columnOrder}
            onColumnReorder={handleColumnReorder}
            onColumnResize={handleColumnResize}
            onRowReorder={handleRowReorder}
            groupBy={groupBy}
            groupOrder={groupOrder}
            onGroupReorder={handleGroupReorder}
            rows={visibleUrls}
            scopeRows={scopeRows}
            searchText={draftSearch}
            onSearchChange={setDraftSearch}
            scopedTotal={scopedTotal}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRowOpen={handleRowOpen}
            projectId={projectId}
            onUrlAdded={handleUrlAdded}
            onUrlDeleted={handleUrlDeleted}
            onCellSave={handleCellSave}
            onCapturedSave={handleCapturedSave}
            selectedPlatform={modalDefaultPlatform}
          />
        )}
      </div>
    </section>
  );
}

function EmptyState({
  title,
  body,
  tone,
}: {
  title: string;
  body?: string;
  tone?: 'error';
}) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 16px',
        color: '#8b949e',
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: body ? '8px' : 0,
          color: tone === 'error' ? '#f85149' : '#e6edf3',
        }}
      >
        {title}
      </div>
      {body ? (
        <div
          style={{
            fontSize: '13px',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          {body}
        </div>
      ) : null}
    </div>
  );
}
