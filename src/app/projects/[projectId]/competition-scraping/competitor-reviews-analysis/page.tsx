'use client';

// W#2 P-49 Workstream 5 Sessions 2-3 — Table 2 Competitor Reviews
// Analysis page per docs/REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27
// (Reviews Phase 3 design lock) + §B 2026-05-27-b (Session 2) +
// §B 2026-05-27-c (Session 3 Per-Competitor flow).
//
// Route: /projects/[projectId]/competition-scraping/competitor-reviews-analysis
//
// Session 2 (shipped 2026-05-27) — per-review nested-rows table +
// Per-Review Summarize button + modal (browser batch loop firing the
// per-batch server endpoint).
// Session 3 (this session) — Per-Competitor Summarize button + modal
// + summary banner row showing the theme-grouped bulleted aggregate
// output per URL. ONE Anthropic call per click; output is a single
// summary string for the URL's full review corpus.
// Later sessions will add per-category + per-type comprehensive flows
// (Tables 3 + 4 under the "By Category-Type" toggle option).
//
// Data model:
//   - Page loads all CompetitorUrls for the Project on mount.
//   - When a URL row expands, fetches that URL's CapturedReviews.
//   - Per-review summary cells populate live as Per-Review Summarize
//     batches return.
//   - Per-Competitor summary banners populate live as the single AI
//     call returns; visible at the URL row level without expanding.
//   - Summaries are persisted server-side (PER_REVIEW + PER_PRODUCT
//     rows in ReviewAnalysis) but are NOT re-loaded on page refresh
//     in this version — bulk-load read-back ships in a later session.

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { useWorkflowContext } from '@/lib/workflow-components';
import type {
  CapturedReview,
  CompetitorUrl,
  Platform,
  UpdateCapturedReviewRequest,
  UpdateCapturedReviewResponse,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { PLATFORMS } from '@/lib/shared-types/competition-scraping';
import { CompetitionScrapingSurfaceNav } from '../components/CompetitionScrapingSurfaceNav';
import {
  InlineEnumCell,
  InlineNumberCell,
  InlineTextCell,
} from '../components/InlineCells';
import { PLATFORM_LABELS } from '../components/url-table-columns';
import { ColumnResizeHandle } from '../components/ColumnResizeHandle';
import {
  EXPAND_TOGGLE_WIDTH,
  MAX_REVIEWS_COLUMN_WIDTH,
  MIN_REVIEWS_COLUMN_WIDTH,
  REVIEWS_TABLE_COLUMNS,
  computeBannerCellAffordance,
  computeReviewsSummaryCellAffordance,
  isReviewsColumnVisible,
  mergeTitleAndBody,
  resolveActionsColumnWidth,
  resolveReviewsColumnWidth,
  type ReviewsTableColumnDef,
} from '@/lib/competition-scraping/reviews-analysis-table-columns';
import { PerReviewSummarizeModal } from './components/PerReviewSummarizeModal';
import { PerCompetitorSummarizeModal } from './components/PerCompetitorSummarizeModal';
import { GlobalCompetitorSummarizeModal } from './components/GlobalCompetitorSummarizeModal';

const WORKFLOW_SLUG = 'competition-scraping';

type UrlsLoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; urls: CompetitorUrl[] }
  | { kind: 'error'; message: string };

type ReviewsLoadState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; reviews: CapturedReview[] }
  | { kind: 'error'; message: string };

export default function CompetitorReviewsAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.projectId as string) ?? null;

  const ctx = useWorkflowContext({
    projectId,
    workflowSlug: WORKFLOW_SLUG,
  });

  const [urlsState, setUrlsState] = useState<UrlsLoadState>({ kind: 'loading' });
  // FF4 2026-05-29 — per-urlId expansion split into TWO independent
  // surfaces, each cycled by clicking its associated cell on the URL
  // row (director directive round-4 verification):
  //   - reviewsExpanded : controls the ReviewsList sub-rows render
  //                       (per-review summaries). Toggled by clicking
  //                       Column 8 Reviews Summary cell or the leftmost
  //                       ▸/▾ master cell.
  //   - bannerExpanded  : controls the per-competitor comprehensive
  //                       summary banner row render. Toggled by
  //                       clicking Column 9 Comprehensive (bulleted)
  //                       cell or the leftmost ▸/▾ master cell.
  const [reviewsExpanded, setReviewsExpanded] = useState<Record<string, boolean>>({});
  const [bannerExpanded, setBannerExpanded] = useState<Record<string, boolean>>({});
  // per-urlId reviews cache
  const [reviewsByUrl, setReviewsByUrl] = useState<
    Record<string, ReviewsLoadState>
  >({});
  // per-reviewId summary cache (populated by AI runs in-session + hydration).
  // analysisId is the PER_REVIEW ReviewAnalysis row id — required for the
  // per-review Edit affordance's PATCH call (D-11; Fix Session B 2026-05-30).
  // null when the row id is unknown (legacy / failed persist) → Edit hidden.
  const [summaryByReviewId, setSummaryByReviewId] = useState<
    Record<
      string,
      { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
    >
  >({});
  // per-urlId Per-Competitor summary cache (populated by Session 3+
  // Per-Competitor Summarize runs). One aggregated summary per URL.
  // analysisId is the ReviewAnalysis row id — required for the Edit
  // affordance's PATCH call.
  const [competitorSummaryByUrlId, setCompetitorSummaryByUrlId] = useState<
    Record<
      string,
      { analysisId: string; summary: string; source: 'cache' | 'fresh' }
    >
  >({});
  // FU-1 (a.110) — urlIds whose per-competitor traceability table was
  // hand-edited on the URL detail page (analysisJson.manuallyEdited). Used to
  // warn before a re-run replaces those edits (director pick: warn-then-
  // replace). A fresh AI run clears the url from this set.
  const [manuallyEditedUrlIds, setManuallyEditedUrlIds] = useState<Set<string>>(
    new Set()
  );

  // Modal state — Table 2 hosts three AI flow surfaces so we track
  // which is open. Only one modal open at a time; the other slots are
  // null when the first is shown.
  const [modalUrl, setModalUrl] = useState<CompetitorUrl | null>(null);
  const [competitorModalUrl, setCompetitorModalUrl] = useState<CompetitorUrl | null>(null);
  const [globalModalOpen, setGlobalModalOpen] = useState<boolean>(false);

  // P-49 W5 Fix Session A (2026-05-29) — per-user column visibility for
  // the 10 spec columns. Default empty map → all visible (the
  // isReviewsColumnVisible helper treats missing keys as visible).
  // Persistence to UserTablePreferences ships in Fix Session B alongside
  // the other PATCH-endpoint extensions — until then the visibility
  // resets on refresh (acceptable for Fix Session A's "smallest
  // verifiable unit" scope per spec §3).
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  // P-49 W5 Fix Session A FF1 (2026-05-29) — per-user column widths for
  // drag-to-resize. Empty map means every column uses its defaultWidth
  // from REVIEWS_TABLE_COLUMNS. Persistence to UserTablePreferences also
  // ships in Fix Session B.
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // P-49 W5 Fix Session A FF1 (2026-05-29) — platform filter chips
  // mirroring the sibling Competitor URLs page's pattern. Default = all
  // platforms selected (table shows everything). Empty array → empty
  // state. Filter is applied BEFORE the URLs are passed to UrlsTable.
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => [
    ...PLATFORMS,
  ]);

  // P-49 W5 Fix Session A (2026-05-29) — click-to-edit save handlers
  // wired to the existing PATCH endpoints (Q6 → A single source of
  // truth). URL-row cell edits target /urls/[urlId]; review-row cell
  // edits target /reviews/[reviewId]. Both throw on PATCH failure so
  // the inline cell can render its error pill.
  const handleUrlCellSave = useCallback(
    async (urlId: string, patch: UpdateCompetitorUrlRequest): Promise<void> => {
      if (!projectId) throw new Error('Project id missing.');
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
          // ignore
        }
        throw new Error(detail);
      }
      const updated = (await res.json()) as CompetitorUrl;
      setUrlsState((prev) => {
        if (prev.kind !== 'loaded') return prev;
        const idx = prev.urls.findIndex((u) => u.id === updated.id);
        if (idx < 0) return prev;
        const next = [...prev.urls];
        next[idx] = updated;
        return { kind: 'loaded', urls: next };
      });
    },
    [projectId]
  );

  const handleReviewCellSave = useCallback(
    async (
      urlId: string,
      reviewId: string,
      patch: UpdateCapturedReviewRequest
    ): Promise<void> => {
      if (!projectId) throw new Error('Project id missing.');
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/reviews/${reviewId}`,
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
          // ignore
        }
        throw new Error(detail);
      }
      const updated = (await res.json()) as UpdateCapturedReviewResponse;
      setReviewsByUrl((prev) => {
        const state = prev[urlId];
        if (!state || state.kind !== 'loaded') return prev;
        const idx = state.reviews.findIndex((r) => r.id === updated.id);
        if (idx < 0) return prev;
        const nextReviews = [...state.reviews];
        nextReviews[idx] = updated;
        return {
          ...prev,
          [urlId]: { kind: 'loaded', reviews: nextReviews },
        };
      });
    },
    [projectId]
  );

  const handleToggleColumn = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({ ...prev, [columnId]: visible }));
  }, []);

  const handleColumnResize = useCallback(
    (columnId: string, width: number) => {
      setColumnWidths((prev) => ({ ...prev, [columnId]: width }));
    },
    []
  );

  const handleTogglePlatform = useCallback(
    (platform: Platform, next: boolean) => {
      setSelectedPlatforms((prev) => {
        const set = new Set(prev);
        if (next) set.add(platform);
        else set.delete(platform);
        // Preserve canonical order so chip-state is stable across toggles.
        return PLATFORMS.filter((p) => set.has(p));
      });
    },
    []
  );

  const handleSelectAllPlatforms = useCallback((next: boolean) => {
    setSelectedPlatforms(next ? [...PLATFORMS] : []);
  }, []);

  // FF2 2026-05-29 — Fix C: persistence for column widths + visibility.
  // The existing /table-preferences endpoint stores a single
  // (userId, projectId) row with `columnVisibility` + `columnWidths` JSON
  // maps shared across all tables on this Project. To avoid colliding
  // with the sibling Competitor URLs page's keys (which use unprefixed
  // column ids), the Reviews Analysis Table prefixes its keys with
  // `reviewsTable:` before persisting. Read path strips the prefix.
  //
  // Server keeps full-replace semantics on PUT (no merge mode yet), so
  // each write sends a merged map: cached non-reviewsTable keys
  // (preserving the URLs page's state) + the page's current
  // reviewsTable: keys re-prefixed. Race window: both tabs editing
  // their prefs row simultaneously — acceptable for v1 since toggles +
  // resize commits are infrequent.
  //
  // serverPrefsRef caches the latest seen unprefixed (URLs-page) keys
  // so writes don't clobber them. The page's local state is the source
  // of truth for `reviewsTable:` keys.
  const serverPrefsRef = useRef<{
    columnVisibility: Record<string, boolean>;
    columnWidths: Record<string, number>;
  }>({ columnVisibility: {}, columnWidths: {} });
  const writePrefsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/table-preferences`
        );
        if (cancelled) return;
        if (res.status === 404) {
          // First-time user — no row exists yet. Local state stays at
          // its initial empty maps; defaults render.
          return;
        }
        if (!res.ok) return; // silent on auth/error — defaults render
        const body = (await res.json()) as {
          columnVisibility?: Record<string, boolean>;
          columnWidths?: Record<string, number>;
        };
        const incomingVisibility = body.columnVisibility ?? {};
        const incomingWidths = body.columnWidths ?? {};

        // Split prefs into reviewsTable: prefixed (this page's keys) +
        // the rest (URLs page's keys — must survive our writes).
        const prefix = 'reviewsTable:';
        const localVisibility: Record<string, boolean> = {};
        const localWidths: Record<string, number> = {};
        const otherVisibility: Record<string, boolean> = {};
        const otherWidths: Record<string, number> = {};
        for (const [k, v] of Object.entries(incomingVisibility)) {
          if (k.startsWith(prefix)) {
            localVisibility[k.slice(prefix.length)] = v;
          } else {
            otherVisibility[k] = v;
          }
        }
        for (const [k, v] of Object.entries(incomingWidths)) {
          if (k.startsWith(prefix)) {
            localWidths[k.slice(prefix.length)] = v;
          } else {
            otherWidths[k] = v;
          }
        }
        if (cancelled) return;
        serverPrefsRef.current = {
          columnVisibility: otherVisibility,
          columnWidths: otherWidths,
        };
        setColumnVisibility(localVisibility);
        setColumnWidths(localWidths);
      } catch {
        // Network errors don't block the page; defaults render.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Debounced write whenever local visibility OR widths change. The
  // 500 ms delay coalesces drag-resize bursts into a single PUT.
  useEffect(() => {
    if (!projectId) return;
    if (writePrefsTimerRef.current) {
      clearTimeout(writePrefsTimerRef.current);
    }
    writePrefsTimerRef.current = setTimeout(() => {
      const prefix = 'reviewsTable:';
      const visibilityToSend: Record<string, boolean> = {
        ...serverPrefsRef.current.columnVisibility,
      };
      for (const [k, v] of Object.entries(columnVisibility)) {
        visibilityToSend[prefix + k] = v;
      }
      const widthsToSend: Record<string, number> = {
        ...serverPrefsRef.current.columnWidths,
      };
      for (const [k, v] of Object.entries(columnWidths)) {
        widthsToSend[prefix + k] = v;
      }
      authFetch(
        `/api/projects/${projectId}/competition-scraping/table-preferences`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            columnVisibility: visibilityToSend,
            columnWidths: widthsToSend,
          }),
        }
      ).catch(() => {
        // Best-effort write; local state already updated. Next
        // toggle/resize will re-send.
      });
    }, 500);
    return () => {
      if (writePrefsTimerRef.current) {
        clearTimeout(writePrefsTimerRef.current);
      }
    };
  }, [projectId, columnVisibility, columnWidths]);

  // FF2 2026-05-29 — Fix E: hydrate per-review + per-competitor summary
  // state from stored ReviewAnalysis rows on page mount. Closes D-8
  // (refreshing the page no longer wipes the table; the data was
  // server-side all along — the page just wasn't reading it back).
  //
  // PER_REVIEW rows carry analysisJson.reviewId + analysisJson.summary
  // → seed summaryByReviewId.
  // PER_PRODUCT rows carry urlId + id + analysisJson.summary → seed
  // competitorSummaryByUrlId (id becomes analysisId for the Edit affordance).
  const hydrateSummaries = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/review-analysis`
      );
      if (!res.ok) return;
      const body = (await res.json()) as {
        items: Array<{
          id: string;
          level: 'PER_REVIEW' | 'PER_PRODUCT';
          urlId: string | null;
          analysisJson: unknown;
        }>;
      };
      if (!Array.isArray(body.items)) return;
      const nextSummaryByReviewId: Record<
        string,
        { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
      > = {};
      const nextCompetitorSummaryByUrlId: Record<
        string,
        { analysisId: string; summary: string; source: 'cache' | 'fresh' }
      > = {};
      const nextManuallyEdited = new Set<string>();
      for (const item of body.items) {
        const aj =
          item.analysisJson && typeof item.analysisJson === 'object'
            ? (item.analysisJson as Record<string, unknown>)
            : {};
        const summary = typeof aj.summary === 'string' ? aj.summary : '';
        if (!summary) continue;
        if (item.level === 'PER_REVIEW') {
          const reviewId = typeof aj.reviewId === 'string' ? aj.reviewId : null;
          if (reviewId) {
            nextSummaryByReviewId[reviewId] = {
              analysisId: item.id,
              summary,
              source: 'cache',
            };
          }
        } else if (item.level === 'PER_PRODUCT' && item.urlId) {
          nextCompetitorSummaryByUrlId[item.urlId] = {
            analysisId: item.id,
            summary,
            source: 'cache',
          };
          if (aj.manuallyEdited === true) nextManuallyEdited.add(item.urlId);
        }
      }
      // Merge over any state already populated by in-session AI runs
      // (those win on conflict since they're the freshest).
      setSummaryByReviewId((prev) => ({ ...nextSummaryByReviewId, ...prev }));
      setCompetitorSummaryByUrlId((prev) => ({
        ...nextCompetitorSummaryByUrlId,
        ...prev,
      }));
      // manuallyEdited reflects server truth (a fresh in-session run already
      // cleared its url via handleCompetitorSummary), so a straight replace.
      setManuallyEditedUrlIds(nextManuallyEdited);
    } catch {
      // Network errors don't block the page; user can still re-run AI.
    }
  }, [projectId]);

  useEffect(() => {
    void hydrateSummaries();
  }, [hydrateSummaries]);

  // FU-2 (a.110): keep this page in sync with cross-page deletions. When a
  // review is deleted on a URL detail page (a different route the App Router
  // keeps this page mounted behind), this page's reviewsByUrl cache goes
  // stale. On tab refocus we re-hydrate the summaries + force-refetch every
  // already-loaded URL's reviews so the deleted review + its "N of M
  // summarized" count disappear here without a manual reload.
  const reviewsByUrlRef = useRef(reviewsByUrl);
  useEffect(() => {
    reviewsByUrlRef.current = reviewsByUrl;
  }, [reviewsByUrl]);
  useEffect(() => {
    if (!projectId) return;
    function onRefocus() {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }
      void hydrateSummaries();
      const loaded = reviewsByUrlRef.current;
      for (const urlId of Object.keys(loaded)) {
        if (loaded[urlId]?.kind === 'loaded') void ensureReviewsLoaded(urlId, true);
      }
    }
    window.addEventListener('focus', onRefocus);
    document.addEventListener('visibilitychange', onRefocus);
    return () => {
      window.removeEventListener('focus', onRefocus);
      document.removeEventListener('visibilitychange', onRefocus);
    };
    // ensureReviewsLoaded is a stable component-scope fn (force path ignores
    // the closed-over cache); only projectId + hydrateSummaries matter here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, hydrateSummaries]);

  // Load all URLs for the Project on mount.
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls`
        );
        if (cancelled) return;
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = (await res.json()) as { error?: string };
            if (body?.error) detail = body.error;
          } catch {
            // ignore
          }
          setUrlsState({ kind: 'error', message: detail });
          return;
        }
        // GET /urls returns the bare CompetitorUrl[] array (not
        // wrapped in { items }). Mirror the existing CompetitionScrapingViewer
        // shape so this stays consistent if the wrap convention ever changes.
        const body = (await res.json()) as CompetitorUrl[];
        const items = Array.isArray(body) ? body : [];
        setUrlsState({ kind: 'loaded', urls: items });
      } catch (err) {
        if (cancelled) return;
        setUrlsState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Network error',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Lazy-load reviews for a URL when it expands for the first time.
  async function ensureReviewsLoaded(urlId: string, force = false) {
    if (!projectId) return;
    const existing = reviewsByUrl[urlId];
    if (
      !force &&
      existing &&
      existing.kind !== 'idle' &&
      existing.kind !== 'error'
    ) {
      return;
    }
    setReviewsByUrl((prev) => ({ ...prev, [urlId]: { kind: 'loading' } }));
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/urls/${urlId}/reviews`
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        setReviewsByUrl((prev) => ({
          ...prev,
          [urlId]: { kind: 'error', message: detail },
        }));
        return;
      }
      // GET /urls/[urlId]/reviews also returns the bare array.
      const body = (await res.json()) as CapturedReview[];
      const items = Array.isArray(body) ? body : [];
      setReviewsByUrl((prev) => ({
        ...prev,
        [urlId]: { kind: 'loaded', reviews: items },
      }));
    } catch (err) {
      setReviewsByUrl((prev) => ({
        ...prev,
        [urlId]: {
          kind: 'error',
          message: err instanceof Error ? err.message : 'Network error',
        },
      }));
    }
  }

  // FF4 2026-05-29 — Column 8 cell toggle. Lazy-loads reviews on first
  // expand.
  function toggleReviewsExpanded(urlId: string) {
    const willExpand = !reviewsExpanded[urlId];
    setReviewsExpanded((prev) => ({ ...prev, [urlId]: willExpand }));
    if (willExpand) void ensureReviewsLoaded(urlId);
  }

  // FF4 2026-05-29 — Column 9 cell toggle. No lazy-load needed; banner
  // state comes from competitorSummaryByUrlId which is hydrated on
  // mount (FF2) + populated by in-session AI runs.
  function toggleBannerExpanded(urlId: string) {
    setBannerExpanded((prev) => ({ ...prev, [urlId]: !prev[urlId] }));
  }

  // FF4 2026-05-29 — leftmost ▸/▾ master cell. One click expands BOTH
  // surfaces (or collapses both if either is open). Lazy-loads reviews
  // if expanding for the first time.
  function toggleBothExpanded(urlId: string) {
    const reviewsOpen = !!reviewsExpanded[urlId];
    const bannerOpen = !!bannerExpanded[urlId];
    const willExpand = !(reviewsOpen || bannerOpen);
    setReviewsExpanded((prev) => ({ ...prev, [urlId]: willExpand }));
    setBannerExpanded((prev) => ({ ...prev, [urlId]: willExpand }));
    if (willExpand && !reviewsOpen) void ensureReviewsLoaded(urlId);
  }

  function handleSummary(
    reviewId: string,
    summary: string,
    source: 'cache' | 'fresh',
    analysisId: string
  ) {
    setSummaryByReviewId((prev) => ({
      ...prev,
      [reviewId]: { analysisId: analysisId || null, summary, source },
    }));
  }

  // Called by the per-review summary cell after a successful PATCH so the
  // local Table 2 state reflects the edit immediately (D-11; Q9 → same
  // Edit-button pattern as the per-competitor banner row).
  function handleReviewSummaryEdited(reviewId: string, summary: string) {
    setSummaryByReviewId((prev) => {
      const existing = prev[reviewId];
      if (!existing) return prev;
      // Edited summaries are treated as 'cache' source going forward (matches
      // the banner's handleCompetitorSummaryEdited semantics).
      return {
        ...prev,
        [reviewId]: { ...existing, summary, source: 'cache' },
      };
    });
  }

  function handleCompetitorSummary(
    urlId: string,
    analysisId: string,
    summary: string,
    source: 'cache' | 'fresh'
  ) {
    setCompetitorSummaryByUrlId((prev) => ({
      ...prev,
      [urlId]: { analysisId, summary, source },
    }));
    // FF4 2026-05-29 — auto-expand the banner when a fresh AI summary
    // lands so the user sees the result immediately. Cache hits don't
    // auto-expand (the user clicks Column 9 to view).
    if (source === 'fresh') {
      setBannerExpanded((prev) => ({ ...prev, [urlId]: true }));
      // FU-1 (a.110): a fresh run regenerated this competitor's table, so any
      // prior hand-edits are gone — clear the manually-edited flag.
      setManuallyEditedUrlIds((prev) => {
        if (!prev.has(urlId)) return prev;
        const next = new Set(prev);
        next.delete(urlId);
        return next;
      });
    }
  }

  // Called by CompetitorSummaryBanner after a successful PATCH so the
  // local Table 2 state reflects the edit immediately.
  function handleCompetitorSummaryEdited(urlId: string, summary: string) {
    setCompetitorSummaryByUrlId((prev) => {
      const existing = prev[urlId];
      if (!existing) return prev;
      // Edited summaries are treated as 'cache' source going forward —
      // they're persisted to the DB row, so subsequent reloads see them
      // from cache.
      return {
        ...prev,
        [urlId]: { ...existing, summary, source: 'cache' },
      };
    });
  }

  // Helper for the Per-Competitor button — we need the FULL review
  // corpus loaded before we can fire the AI call (the browser-side
  // prompt preview needs review bodies; the wire call needs reviewIds).
  // If reviews aren't loaded yet, kick off the load + open the modal
  // once they arrive; the modal will start in idle state and director
  // can hit Start.
  async function openCompetitorModal(u: CompetitorUrl) {
    if (!projectId) return;
    const existing = reviewsByUrl[u.id];
    if (!existing || existing.kind !== 'loaded') {
      await ensureReviewsLoaded(u.id);
    }
    setCompetitorModalUrl(u);
  }

  if (ctx.loading || !ctx.project) {
    return (
      <FullPageState
        message={ctx.error ?? 'Loading…'}
        isError={!!ctx.error}
      />
    );
  }
  if (!projectId) {
    return (
      <FullPageState
        message="Missing project identifier in the page address."
        isError
      />
    );
  }

  const backHref = `/projects/${projectId}/competition-scraping`;

  return (
    // FF3 2026-05-29 — full-viewport flex-column layout so the table's
    // horizontal scrollbar stays at the BOTTOM of the viewport regardless
    // of how tall the table is (director report round-3 verification:
    // "the window needs to be scrolled down to see the horizontal scroll
    // of the table at the bottom"). Page itself never scrolls; the table
    // region takes the remaining viewport height + scrolls internally.
    <div
      style={{
        height: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top chrome — fixed height; never shrinks. */}
      <div style={{ flex: '0 0 auto', padding: '24px 24px 0' }}>
        <CompetitionScrapingSurfaceNav
          projectId={projectId}
          active="competitor-reviews-analysis"
        />

        <button
          type="button"
          onClick={() => router.push(backHref)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'transparent',
            color: '#58a6ff',
            border: '1px solid #30363d',
            borderRadius: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Competition Data
        </button>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            margin: '0 0 6px',
            color: '#e6edf3',
          }}
        >
          Competitor Reviews Analysis
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#8b949e',
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}
        >
          AI summaries powered by Claude. Click{' '}
          <strong>Summarize Reviews for All Competitors</strong> to run the
          critique extractor across every URL with at least 2 reviews
          sequentially.{' '}
          <strong>Summarize Competitor Reviews</strong> aggregates ALL
          reviews under one URL into a theme-grouped bulleted critique
          summary (one Anthropic call per click). Expand a competitor and
          click <strong>Summarize reviews</strong> to also generate
          per-review bullet summaries via the browser batch loop. Per-
          category and per-type comprehensive flows land in later sessions.
        </p>

        {/* Global Summarize-All button */}
        {urlsState.kind === 'loaded' && urlsState.urls.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setGlobalModalOpen(true)}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                background: '#238636',
                color: '#fff',
                border: '1px solid #2ea043',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Summarize All Reviews From All Competitors
            </button>
          </div>
        )}

        {urlsState.kind === 'loading' && (
          <div style={{ fontSize: '13px', color: '#8b949e' }}>Loading competitors…</div>
        )}
        {urlsState.kind === 'error' && (
          <div style={errorBoxStyle}>{urlsState.message}</div>
        )}
        {urlsState.kind === 'loaded' && urlsState.urls.length === 0 && (
          <div style={{ fontSize: '13px', color: '#8b949e' }}>
            No competitor URLs in this Project yet. Capture some via the
            Chrome extension first, then come back here.
          </div>
        )}

      </div>

      {/* Table region — fills remaining viewport (flex: 1) and bounds
          the table's internal scrolling. The horizontal scrollbar
          inside lives at the BOTTOM of this region, which is the
          BOTTOM of the viewport (minus the 24px bottom padding). */}
      {urlsState.kind === 'loaded' && urlsState.urls.length > 0 && (
        <div
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            padding: '0 24px 24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ReviewsAnalysisTableSection
            projectId={projectId}
            urls={urlsState.urls}
            selectedPlatforms={selectedPlatforms}
            columnVisibility={columnVisibility}
            columnWidths={columnWidths}
            reviewsExpanded={reviewsExpanded}
            bannerExpanded={bannerExpanded}
            reviewsByUrl={reviewsByUrl}
            summaryByReviewId={summaryByReviewId}
            competitorSummaryByUrlId={competitorSummaryByUrlId}
            onToggleColumn={handleToggleColumn}
            onColumnResize={handleColumnResize}
            onTogglePlatform={handleTogglePlatform}
            onSelectAllPlatforms={handleSelectAllPlatforms}
            onToggleReviewsExpanded={toggleReviewsExpanded}
            onToggleBannerExpanded={toggleBannerExpanded}
            onToggleBothExpanded={toggleBothExpanded}
            onOpenSummarizeModal={(u) => {
              // FF4 2026-05-29 — auto-expand reviews when the user kicks
              // off a per-URL per-review run so the summaries land
              // visibly as they stream back.
              setReviewsExpanded((prev) => ({ ...prev, [u.id]: true }));
              setModalUrl(u);
            }}
            onOpenCompetitorModal={(u) => {
              // FF4 2026-05-29 — auto-expand banner when kicking off a
              // per-URL per-competitor run.
              setBannerExpanded((prev) => ({ ...prev, [u.id]: true }));
              void openCompetitorModal(u);
            }}
            onCompetitorSummaryEdited={handleCompetitorSummaryEdited}
            onReviewSummaryEdited={handleReviewSummaryEdited}
            onUrlCellSave={handleUrlCellSave}
            onReviewCellSave={handleReviewCellSave}
          />
        </div>
      )}

      {modalUrl && (
        <PerReviewSummarizeModal
          projectId={projectId}
          urlId={modalUrl.id}
          productName={modalUrl.productName || modalUrl.url}
          platform={modalUrl.platform}
          reviews={getLoadedReviews(reviewsByUrl[modalUrl.id])}
          onClose={() => setModalUrl(null)}
          onSummary={handleSummary}
        />
      )}
      {competitorModalUrl && (
        <PerCompetitorSummarizeModal
          projectId={projectId}
          urlId={competitorModalUrl.id}
          productName={competitorModalUrl.productName || competitorModalUrl.url}
          platform={competitorModalUrl.platform}
          reviews={getLoadedReviews(reviewsByUrl[competitorModalUrl.id])}
          manuallyEdited={manuallyEditedUrlIds.has(competitorModalUrl.id)}
          onClose={() => setCompetitorModalUrl(null)}
          onSummary={handleCompetitorSummary}
        />
      )}
      {globalModalOpen && urlsState.kind === 'loaded' && (
        <GlobalCompetitorSummarizeModal
          projectId={projectId}
          urls={urlsState.urls}
          manuallyEditedCount={
            urlsState.urls.filter((u) => manuallyEditedUrlIds.has(u.id)).length
          }
          onClose={() => setGlobalModalOpen(false)}
          onSummary={handleCompetitorSummary}
        />
      )}
    </div>
  );
}

function getLoadedReviews(state: ReviewsLoadState | undefined): CapturedReview[] {
  if (!state || state.kind !== 'loaded') return [];
  return state.reviews;
}

// ─── ReviewsAnalysisTableSection ────────────────────────────────────
//
// W#2 P-49 W5 Fix Session A FF1 (2026-05-29) — top-level wrapper for
// the controls + the HTML <table>. Hosts: (a) the platforms + columns
// control bar mirroring the Competitor URLs sibling page's
// ColumnVisibilityBar layout (8 redirects bundled in this FF), (b) the
// HTML <table> + <colgroup> + per-column-resize handles + visible cell
// borders, replacing the prior CSS-grid approach whose `1fr` minmax
// columns squished cells together at the post-deploy 2026-05-29
// verification (director report: "many columns are overlapping").
//
// Platform filtering applied INSIDE this component (filter the URLs
// prop by selectedPlatforms before rendering rows). counts come from
// the unfiltered URLs prop so the chip badges always show the full
// per-platform population.

interface ReviewsAnalysisTableSectionProps {
  projectId: string;
  urls: CompetitorUrl[];
  selectedPlatforms: Platform[];
  columnVisibility: Record<string, boolean>;
  columnWidths: Record<string, number>;
  // FF4 2026-05-29 — split expansion state into two independent
  // surfaces (per-review summaries via reviewsExpanded; per-competitor
  // comprehensive banner via bannerExpanded).
  reviewsExpanded: Record<string, boolean>;
  bannerExpanded: Record<string, boolean>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<
    string,
    { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
  >;
  competitorSummaryByUrlId: Record<
    string,
    { analysisId: string; summary: string; source: 'cache' | 'fresh' }
  >;
  onToggleColumn: (columnId: string, visible: boolean) => void;
  onColumnResize: (columnId: string, width: number) => void;
  onTogglePlatform: (platform: Platform, next: boolean) => void;
  onSelectAllPlatforms: (next: boolean) => void;
  onToggleReviewsExpanded: (urlId: string) => void;
  onToggleBannerExpanded: (urlId: string) => void;
  onToggleBothExpanded: (urlId: string) => void;
  onOpenSummarizeModal: (url: CompetitorUrl) => void;
  onOpenCompetitorModal: (url: CompetitorUrl) => void;
  onCompetitorSummaryEdited: (urlId: string, summary: string) => void;
  onReviewSummaryEdited: (reviewId: string, summary: string) => void;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  onReviewCellSave: (
    urlId: string,
    reviewId: string,
    patch: UpdateCapturedReviewRequest
  ) => Promise<void>;
}

function ReviewsAnalysisTableSection(
  props: ReviewsAnalysisTableSectionProps
): JSX.Element {
  const {
    urls,
    selectedPlatforms,
    columnVisibility,
    columnWidths,
    onToggleColumn,
    onColumnResize,
    onTogglePlatform,
    onSelectAllPlatforms,
  } = props;

  // Per-platform row counts derived from the unfiltered URL set so chip
  // badges stay consistent regardless of which chips are checked.
  const countsByPlatform = useMemo<Record<Platform, number>>(() => {
    const counts: Record<string, number> = {};
    for (const p of PLATFORMS) counts[p] = 0;
    for (const u of urls) {
      if (u.platform in counts) counts[u.platform] += 1;
    }
    return counts as Record<Platform, number>;
  }, [urls]);

  const platformSet = useMemo(
    () => new Set<Platform>(selectedPlatforms),
    [selectedPlatforms]
  );

  // Filter rows by selected platforms BEFORE rendering. Empty selection
  // → empty rows; the table still renders so the user sees the empty
  // state alongside the controls.
  const filteredUrls = useMemo(
    () => urls.filter((u) => platformSet.has(u.platform)),
    [urls, platformSet]
  );

  return (
    <>
      <ReviewsTableControls
        countsByPlatform={countsByPlatform}
        totalCount={urls.length}
        selectedPlatforms={selectedPlatforms}
        onTogglePlatform={onTogglePlatform}
        onSelectAllPlatforms={onSelectAllPlatforms}
        columnVisibility={columnVisibility}
        onToggleColumn={onToggleColumn}
      />
      {selectedPlatforms.length === 0 ? (
        <div
          data-testid="reviews-table-empty-platforms"
          style={{
            padding: '24px 14px',
            fontSize: '13px',
            color: '#8b949e',
            border: '1px solid #30363d',
            borderRadius: '8px',
            background: '#0d1117',
          }}
        >
          No platforms selected — pick one above to see competitor rows.
        </div>
      ) : (
        <UrlsTable
          projectId={props.projectId}
          urls={filteredUrls}
          reviewsExpanded={props.reviewsExpanded}
          bannerExpanded={props.bannerExpanded}
          reviewsByUrl={props.reviewsByUrl}
          summaryByReviewId={props.summaryByReviewId}
          competitorSummaryByUrlId={props.competitorSummaryByUrlId}
          columnVisibility={columnVisibility}
          columnWidths={columnWidths}
          onColumnResize={onColumnResize}
          onToggleReviewsExpanded={props.onToggleReviewsExpanded}
          onToggleBannerExpanded={props.onToggleBannerExpanded}
          onToggleBothExpanded={props.onToggleBothExpanded}
          onOpenSummarizeModal={props.onOpenSummarizeModal}
          onOpenCompetitorModal={props.onOpenCompetitorModal}
          onCompetitorSummaryEdited={props.onCompetitorSummaryEdited}
          onReviewSummaryEdited={props.onReviewSummaryEdited}
          onUrlCellSave={props.onUrlCellSave}
          onReviewCellSave={props.onReviewCellSave}
        />
      )}
    </>
  );
}

// ─── ReviewsTableControls ────────────────────────────────────────────
//
// Platforms filter chips + columns show/hide checkboxes. Mirrors the
// existing ColumnVisibilityBar layout for the Competitor URLs sibling
// page (platforms group on the left; divider; columns group on the
// right) but bound to the Reviews Analysis Table's local state.

interface ReviewsTableControlsProps {
  countsByPlatform: Record<Platform, number>;
  totalCount: number;
  selectedPlatforms: Platform[];
  onTogglePlatform: (platform: Platform, next: boolean) => void;
  onSelectAllPlatforms: (next: boolean) => void;
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (columnId: string, visible: boolean) => void;
}

function ReviewsTableControls({
  countsByPlatform,
  totalCount,
  selectedPlatforms,
  onTogglePlatform,
  onSelectAllPlatforms,
  columnVisibility,
  onToggleColumn,
}: ReviewsTableControlsProps): JSX.Element {
  const allChecked = selectedPlatforms.length === PLATFORMS.length;
  const someChecked = selectedPlatforms.length > 0 && !allChecked;
  const allRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someChecked;
  }, [someChecked]);

  return (
    <div
      aria-label="Platform and column controls"
      data-testid="reviews-table-controls"
      style={controlsBarStyle}
    >
      <div style={controlsGroupStyle}>
        <span style={controlsGroupLabelStyle}>Platforms</span>
        <div style={controlsChipRowStyle}>
          <label
            style={controlsChipStyle(allChecked)}
            title="Select or clear all platforms"
          >
            <input
              ref={allRef}
              type="checkbox"
              checked={allChecked}
              onChange={() => onSelectAllPlatforms(!allChecked)}
              style={{ margin: 0, cursor: 'pointer' }}
              aria-label="Select all platforms"
              data-testid="reviews-table-platform-chip-all"
            />
            <span>All Platforms</span>
            <span style={controlsCountBadgeStyle}>{totalCount}</span>
          </label>
          {PLATFORMS.map((platform) => {
            const label = PLATFORM_LABELS[platform];
            const checked = selectedPlatforms.includes(platform);
            return (
              <label
                key={platform}
                style={controlsChipStyle(checked)}
                title={`Show or hide ${label} rows`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onTogglePlatform(platform, !checked)}
                  style={{ margin: 0, cursor: 'pointer' }}
                  aria-label={`Show ${label} rows`}
                  data-testid={`reviews-table-platform-chip-${platform}`}
                />
                <span>{label}</span>
                <span style={controlsCountBadgeStyle}>
                  {countsByPlatform[platform] ?? 0}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={controlsDividerStyle} aria-hidden />

      <div style={controlsGroupStyle}>
        <span style={controlsGroupLabelStyle}>Columns</span>
        <div style={controlsChipRowStyle}>
          {REVIEWS_TABLE_COLUMNS.map((col) => {
            const visible = isReviewsColumnVisible(columnVisibility, col.id);
            return (
              <label
                key={col.id}
                style={controlsChipStyle(visible)}
                title={`Show or hide the ${col.label} column`}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={() => onToggleColumn(col.id, !visible)}
                  style={{ margin: 0, cursor: 'pointer' }}
                  aria-label={`Show ${col.label} column`}
                  data-testid={`reviews-table-column-toggle-${col.id}`}
                />
                <span>{col.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const controlsBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '12px 14px',
  background: '#0d1117',
  border: '1px solid #30363d',
  borderRadius: '8px',
  marginBottom: '12px',
  flexWrap: 'wrap',
};

const controlsGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
  minWidth: '280px',
};

const controlsGroupLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#8b949e',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const controlsChipRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
};

function controlsChipStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: active ? '#1f6feb22' : '#161b22',
    border: '1px solid',
    borderColor: active ? '#1f6feb55' : '#30363d',
    borderRadius: '999px',
    color: active ? '#e6edf3' : '#c9d1d9',
    fontSize: '12px',
    cursor: 'pointer',
    userSelect: 'none',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  };
}

const controlsCountBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#8b949e',
  fontVariantNumeric: 'tabular-nums',
  minWidth: '12px',
  textAlign: 'right',
};

const controlsDividerStyle: React.CSSProperties = {
  width: '1px',
  alignSelf: 'stretch',
  background: '#30363d',
};

// ─── UrlsTable (HTML <table> + <colgroup> + ColumnResizeHandle) ─────
//
// W#2 P-49 W5 Fix Session A FF1 (2026-05-29) — replaces the prior CSS
// `display: grid` table with an HTML <table> + <colgroup>. The colgroup
// widths are authoritative under `table-layout: fixed`, which:
//   - fixes the "many columns are overlapping" issue reported at
//     post-deploy verification (CSS grid `1fr` minmax columns squished
//     cells together when many were visible)
//   - lets each header cell host a ColumnResizeHandle on its right edge
//     for drag-to-resize (mirroring the sibling URLs table)
//   - lets each <td> get a visible right-border (per director directive
//     "the columns in the table should have visible borders")
// Per-cell `overflow: hidden` + `textOverflow: 'ellipsis'` clips content
// that's wider than the resolved column width — no more bleed-over.

interface UrlsTableProps {
  projectId: string;
  urls: CompetitorUrl[];
  reviewsExpanded: Record<string, boolean>;
  bannerExpanded: Record<string, boolean>;
  reviewsByUrl: Record<string, ReviewsLoadState>;
  summaryByReviewId: Record<
    string,
    { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
  >;
  competitorSummaryByUrlId: Record<
    string,
    { analysisId: string; summary: string; source: 'cache' | 'fresh' }
  >;
  columnVisibility: Record<string, boolean>;
  columnWidths: Record<string, number>;
  onColumnResize: (columnId: string, width: number) => void;
  onToggleReviewsExpanded: (urlId: string) => void;
  onToggleBannerExpanded: (urlId: string) => void;
  onToggleBothExpanded: (urlId: string) => void;
  onOpenSummarizeModal: (url: CompetitorUrl) => void;
  onOpenCompetitorModal: (url: CompetitorUrl) => void;
  onCompetitorSummaryEdited: (urlId: string, summary: string) => void;
  onReviewSummaryEdited: (reviewId: string, summary: string) => void;
  onUrlCellSave: (
    urlId: string,
    patch: UpdateCompetitorUrlRequest
  ) => Promise<void>;
  onReviewCellSave: (
    urlId: string,
    reviewId: string,
    patch: UpdateCapturedReviewRequest
  ) => Promise<void>;
}

const PLATFORM_OPTIONS: ReadonlyArray<{ value: Platform; label: string }> =
  PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }));

function UrlsTable({
  projectId,
  urls,
  reviewsExpanded,
  bannerExpanded,
  reviewsByUrl,
  summaryByReviewId,
  competitorSummaryByUrlId,
  columnVisibility,
  columnWidths,
  onColumnResize,
  onToggleReviewsExpanded,
  onToggleBannerExpanded,
  onToggleBothExpanded,
  onOpenSummarizeModal,
  onOpenCompetitorModal,
  onCompetitorSummaryEdited,
  onReviewSummaryEdited,
  onUrlCellSave,
  onReviewCellSave,
}: UrlsTableProps): JSX.Element {
  const visibleColumns = REVIEWS_TABLE_COLUMNS.filter((c) =>
    isReviewsColumnVisible(columnVisibility, c.id)
  );

  // ResizeObserver-driven full-table height so the column-resize
  // handles can extend their drag zone past the header all the way
  // down. Mirrors the sibling URLs table (UrlTable.tsx). Falls back to
  // 0 before the observer fires; ColumnResizeHandle has a safe default.
  const tableRef = useRef<HTMLTableElement | null>(null);
  const [tableHeight, setTableHeight] = useState<number>(0);
  useLayoutEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setTableHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Total table width: expand + sum of visible column widths + actions.
  // Used as `min-width` on the table so horizontal scroll kicks in when
  // the viewport is narrower than the columns.
  const totalWidth =
    EXPAND_TOGGLE_WIDTH +
    visibleColumns.reduce(
      (acc, c) => acc + resolveReviewsColumnWidth(columnWidths, c),
      0
    ) +
    resolveActionsColumnWidth(columnWidths);

  // FF3 2026-05-29 — total table column count for banner + ReviewsList
  // colSpan. Off-by-one in FF1/FF2 (+1 too many) caused a phantom extra
  // column slot at the table's right edge where the URL-row borders
  // showed through onto the banner area (director report round-3
  // verification: "the existing column borders of the table are visible
  // over the area where the review summaries are pasted").
  // Total = 1 (expand toggle) + visibleColumns + 1 (Actions).
  const tableColspan = 2 + visibleColumns.length;

  return (
    <div
      style={{
        border: '1px solid #30363d',
        borderRadius: '8px',
        overflow: 'auto',
        background: '#0d1117',
        // FF3 2026-05-29 — the page is now a 100vh flex-column. This
        // outer table div takes flex: 1 1 auto + minHeight: 0 so it
        // fills the remaining viewport between the page chrome above
        // and the bottom of the screen. Horizontal scrollbar lives at
        // the bottom of THIS div, which is always at the bottom of the
        // viewport (closing the round-3 redirect "the window needs to
        // be scrolled down to see the horizontal scroll").
        flex: '1 1 auto',
        minHeight: 0,
      }}
    >
      <table
        ref={tableRef}
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          minWidth: `${totalWidth}px`,
          tableLayout: 'fixed',
          color: '#e6edf3',
          fontSize: '12px',
        }}
      >
        <colgroup>
          <col style={{ width: `${EXPAND_TOGGLE_WIDTH}px` }} />
          {visibleColumns.map((col) => (
            <col
              key={col.id}
              style={{
                width: `${resolveReviewsColumnWidth(columnWidths, col)}px`,
              }}
            />
          ))}
          <col style={{ width: `${resolveActionsColumnWidth(columnWidths)}px` }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thStyle} aria-label="Expand" />
            {visibleColumns.map((col) => (
              <th key={col.id} style={thStyle}>
                <span style={thLabelStyle}>{col.label}</span>
                <ColumnResizeHandle
                  columnId={col.id}
                  currentWidth={resolveReviewsColumnWidth(columnWidths, col)}
                  minWidth={MIN_REVIEWS_COLUMN_WIDTH}
                  maxWidth={MAX_REVIEWS_COLUMN_WIDTH}
                  tableHeight={tableHeight}
                  showRestingLine={false}
                  onCommit={(w) => onColumnResize(col.id, w)}
                />
              </th>
            ))}
            <th style={thStyle}>
              <span style={thLabelStyle}>Actions</span>
              {/* FF2 2026-05-29 — resize handle on the right edge of the
                  Actions column, which is the right edge of the entire
                  table. Width persisted under the key '__actions__' in
                  the column-widths JSON column on UserTablePreferences. */}
              <ColumnResizeHandle
                columnId="__actions__"
                currentWidth={resolveActionsColumnWidth(columnWidths)}
                minWidth={MIN_REVIEWS_COLUMN_WIDTH}
                maxWidth={MAX_REVIEWS_COLUMN_WIDTH}
                tableHeight={tableHeight}
                showRestingLine={false}
                onCommit={(w) => onColumnResize('__actions__', w)}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {urls.map((u) => {
            // FF4 2026-05-29 — two independent expand states.
            const reviewsOpen = !!reviewsExpanded[u.id];
            const bannerOpen = !!bannerExpanded[u.id];
            const reviewsState = reviewsByUrl[u.id];
            const reviewsLoaded =
              reviewsState?.kind === 'loaded' ? reviewsState.reviews : null;
            const totalReviews = reviewsLoaded ? reviewsLoaded.length : null;
            const summarizedReviews = reviewsLoaded
              ? reviewsLoaded.reduce(
                  (acc, r) => acc + (summaryByReviewId[r.id] ? 1 : 0),
                  0
                )
              : null;
            const competitorSummary = competitorSummaryByUrlId[u.id];
            const isAnyOpen = reviewsOpen || bannerOpen;
            return (
              <Fragment key={u.id}>
                <tr
                  style={{
                    borderBottom: competitorSummary
                      ? '1px solid #161b22'
                      : '1px solid #21262d',
                  }}
                >
                  {/* FF4 2026-05-29 — leftmost master cell: click here to
                      expand/collapse BOTH the per-review summaries AND
                      the per-competitor banner in one action. */}
                  <td
                    style={{ ...tdExpandStyle, cursor: 'pointer' }}
                    onClick={() => onToggleBothExpanded(u.id)}
                    title={isAnyOpen ? 'Collapse all summaries for this URL' : 'Expand all summaries for this URL'}
                  >
                    <span
                      style={{ fontSize: '12px', color: '#8b949e' }}
                      aria-label={isAnyOpen ? 'Collapse' : 'Expand'}
                    >
                      {isAnyOpen ? '▾' : '▸'}
                    </span>
                  </td>
                  {visibleColumns.map((col) =>
                    renderUrlRowCell({
                      col,
                      url: u,
                      onUrlCellSave,
                      summarizedReviews,
                      totalReviews,
                      competitorSummary,
                      reviewsOpen,
                      bannerOpen,
                      onToggleReviewsExpanded,
                      onToggleBannerExpanded,
                    })
                  )}
                  <td style={tdActionsStyle}>
                    {/* FF3 2026-05-29 — director directive (round-3): blue
                        per-review button on TOP; green per-competitor
                        button below. Per-review is the more granular /
                        more-frequently-clicked surface so it lives
                        first in the read order. */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        alignItems: 'stretch',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onOpenSummarizeModal(u)}
                        disabled={reviewsState?.kind === 'loading'}
                        style={summarizeButtonStyle(reviewsState?.kind)}
                      >
                        Summarize each individual review under this product
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCompetitorModal(u)}
                        disabled={reviewsState?.kind === 'loading'}
                        style={competitorButtonStyle(reviewsState?.kind)}
                      >
                        Summarize all reviews within this product
                      </button>
                    </div>
                  </td>
                </tr>
                {/* FF4 2026-05-29 — banner now renders only when both
                    a summary exists AND bannerExpanded is true. User
                    toggles via Column 9 click or the master ▸/▾ cell. */}
                {competitorSummary && bannerOpen && (
                  <tr>
                    <td colSpan={tableColspan} style={{ padding: 0, border: 'none' }}>
                      <CompetitorSummaryBanner
                        projectId={projectId}
                        urlId={u.id}
                        summary={competitorSummary}
                        onEdited={onCompetitorSummaryEdited}
                      />
                    </td>
                  </tr>
                )}
                {/* FF4 2026-05-29 — review rows now render only when
                    reviewsExpanded is true. User toggles via Column 8
                    click or the master ▸/▾ cell. */}
                {reviewsOpen && (
                  <tr>
                    <td colSpan={tableColspan} style={{ padding: 0, border: 'none' }}>
                      <ReviewsList
                        projectId={projectId}
                        urlId={u.id}
                        state={reviewsState}
                        summaryByReviewId={summaryByReviewId}
                        onReviewCellSave={onReviewCellSave}
                        onReviewSummaryEdited={onReviewSummaryEdited}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Style shared across every <th> in the URL table — sticky-header at
// the top so the header stays visible when the user scrolls rows; the
// position:sticky anchor for the absolute-positioned ColumnResizeHandle
// child (sticky + relative don't conflict — sticky IS a positioned mode
// for purposes of establishing a containing block).
//
// FF2 2026-05-29 — `overflow: hidden` REMOVED from the th itself. The
// prior copy clipped the absolute-positioned ColumnResizeHandle's full-
// height drag zone to the header's box, so users could only drag from
// the header strip — not anywhere along the table length. Ellipsis
// truncation moves onto the inner <span> wrapper (thLabelStyle below)
// which DOES carry overflow:hidden so the column label still truncates
// neatly when the column is narrow.
const thStyle: React.CSSProperties = {
  padding: '10px 10px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: '#8b949e',
  textAlign: 'left',
  background: '#161b22',
  borderBottom: '1px solid #30363d',
  borderRight: '1px solid #21262d',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 3,
};

const thLabelStyle: React.CSSProperties = {
  display: 'inline-block',
  maxWidth: 'calc(100% - 10px)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

const tdBaseStyle: React.CSSProperties = {
  padding: '10px 10px',
  borderRight: '1px solid #21262d',
  verticalAlign: 'middle',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const tdExpandStyle: React.CSSProperties = {
  ...tdBaseStyle,
  textAlign: 'center',
};

const tdActionsStyle: React.CSSProperties = {
  ...tdBaseStyle,
  whiteSpace: 'normal',
  padding: '8px',
};

// ─── URL row cell rendering ─────────────────────────────────────────
//
// Each visible column on the URL row maps to one of:
//   - InlineEnumCell for `platform` (single source of truth — PATCH
//     propagates to CompetitorUrl.platform; same edit reflects on the
//     Competitor URLs sibling page).
//   - InlineTextCell for `competitionCategory`, `type`, `productName`,
//     `url` (PATCH targets the same field on CompetitorUrl).
//   - InlineNumberCell for `resultsPageRank`, `competitionScore`.
//   - Plain-text non-editable display for `reviewsSummaryCount` (Q10
//     → A — "N of M summarized" computed from current state; not
//     editable since it's a computed cell, not a stored field).
//   - Plain-text non-editable display for `compBulleted` (the per-
//     competitor bulleted summary already lives in the existing
//     CompetitorSummaryBanner row below the URL row — this URL-row
//     Column 9 cell shows a compact preview / empty state. The
//     editable surface stays the banner row's Edit button per Q9
//     deferred to Fix Session B).
//   - Empty placeholder for `compNonBulleted` (column ships in Fix
//     Session C when the per-competitor non-bulleted flow lands).

interface UrlRowCellArgs {
  col: ReviewsTableColumnDef;
  url: CompetitorUrl;
  onUrlCellSave: (urlId: string, patch: UpdateCompetitorUrlRequest) => Promise<void>;
  summarizedReviews: number | null;
  totalReviews: number | null;
  competitorSummary:
    | { analysisId: string; summary: string; source: 'cache' | 'fresh' }
    | undefined;
  // FF4 2026-05-29 — expand-state per surface + cell-level click handlers.
  reviewsOpen: boolean;
  bannerOpen: boolean;
  onToggleReviewsExpanded: (urlId: string) => void;
  onToggleBannerExpanded: (urlId: string) => void;
}

function renderUrlRowCell({
  col,
  url,
  onUrlCellSave,
  summarizedReviews,
  totalReviews,
  competitorSummary,
  reviewsOpen,
  bannerOpen,
  onToggleReviewsExpanded,
  onToggleBannerExpanded,
}: UrlRowCellArgs): JSX.Element {
  // FF3 2026-05-29 — td no longer stops propagation. The previous copy
  // ate the row-toggle click — clicking anywhere on a data cell
  // (including the "expand to load" hint on Column 8) failed to expand
  // the row (director report round-3 verification). InlineCell
  // components carry their own internal stopPropagation on click
  // handlers + edit-mode inputs, so click-to-edit still works without
  // bubbling. Non-editable cells (count display + banner placeholder +
  // Fix-Session-C placeholder) bubble naturally so clicking them now
  // toggles row expand/collapse.
  const tdProps = {
    key: col.id,
    style: tdBaseStyle,
  };

  switch (col.id) {
    case 'platform':
      return (
        <td {...tdProps}>
          <InlineEnumCell<Platform>
            value={url.platform}
            options={PLATFORM_OPTIONS}
            onSave={(next) => onUrlCellSave(url.id, { platform: next })}
          />
        </td>
      );
    case 'competitionCategory':
      return (
        <td {...tdProps}>
          <InlineTextCell
            value={url.competitionCategory}
            onSave={(next) => onUrlCellSave(url.id, { competitionCategory: next })}
          />
        </td>
      );
    case 'type':
      return (
        <td {...tdProps}>
          <InlineTextCell
            value={url.type}
            onSave={(next) => onUrlCellSave(url.id, { type: next })}
          />
        </td>
      );
    case 'productName':
      return (
        <td {...tdProps}>
          <InlineTextCell
            value={url.productName}
            onSave={(next) => onUrlCellSave(url.id, { productName: next })}
          />
        </td>
      );
    case 'resultsPageRank':
      return (
        <td {...tdProps}>
          <InlineNumberCell
            value={url.resultsPageRank}
            onSave={(next) => onUrlCellSave(url.id, { resultsPageRank: next })}
            integer
            min={1}
            align="right"
          />
        </td>
      );
    case 'competitionScore':
      return (
        <td {...tdProps}>
          <InlineNumberCell
            value={url.competitionScore}
            onSave={(next) => onUrlCellSave(url.id, { competitionScore: next })}
            integer
            align="right"
          />
        </td>
      );
    case 'url':
      return (
        <td {...tdProps}>
          <InlineTextCell
            value={url.url}
            onSave={(next) =>
              onUrlCellSave(url.id, { url: next ?? undefined })
            }
            formatRead={(raw) =>
              raw ? (
                <span
                  style={{
                    color: '#58a6ff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: '100%',
                  }}
                >
                  {raw}
                </span>
              ) : null
            }
          />
        </td>
      );
    case 'reviewsSummaryCount': {
      // FF4 2026-05-29 — Column 8 is now a click target whose text
      // updates with state ("click to expand" / "click to collapse").
      // Handler lives in the parent (lazy-loads on first expand).
      const cell = computeReviewsSummaryCellAffordance(
        summarizedReviews,
        totalReviews,
        reviewsOpen
      );
      const tdStyle: React.CSSProperties = cell.clickable
        ? { ...tdBaseStyle, cursor: 'pointer' }
        : tdBaseStyle;
      const tdOnClick = cell.clickable
        ? () => onToggleReviewsExpanded(url.id)
        : undefined;
      const textColor =
        cell.kind === 'not-loaded' || cell.kind === 'no-reviews'
          ? '#6e7681'
          : '#e6edf3';
      const fontStyle = cell.kind === 'not-loaded' ? 'italic' : 'normal';
      return (
        <td
          key={col.id}
          style={tdStyle}
          onClick={tdOnClick}
          title={cell.clickable ? cell.text : undefined}
        >
          <span style={{ color: textColor, fontStyle }}>{cell.text}</span>
        </td>
      );
    }
    case 'compBulleted': {
      // FF4 2026-05-29 — Column 9 toggles the per-competitor banner
      // row's visibility. Cell text reflects state.
      const cell = computeBannerCellAffordance(!!competitorSummary, bannerOpen);
      const tdStyle: React.CSSProperties = cell.clickable
        ? { ...tdBaseStyle, cursor: 'pointer' }
        : tdBaseStyle;
      const tdOnClick = cell.clickable
        ? () => onToggleBannerExpanded(url.id)
        : undefined;
      const textColor = cell.kind === 'no-summary' ? '#6e7681' : '#e6edf3';
      return (
        <td
          key={col.id}
          style={tdStyle}
          onClick={tdOnClick}
          title={cell.clickable ? cell.text : undefined}
        >
          <span style={{ color: textColor }}>{cell.text}</span>
        </td>
      );
    }
    case 'compNonBulleted':
      return (
        <td {...tdProps}>
          <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
            (Fix Session C)
          </span>
        </td>
      );
    default:
      return (
        <td {...tdProps}>
          <span style={{ color: '#6e7681' }}>—</span>
        </td>
      );
  }
}

// ─── CompetitorSummaryBanner ────────────────────────────────────────

interface CompetitorSummaryBannerProps {
  projectId: string;
  urlId: string;
  summary: { analysisId: string; summary: string; source: 'cache' | 'fresh' };
  onEdited: (urlId: string, summary: string) => void;
}

function CompetitorSummaryBanner({
  projectId,
  urlId,
  summary,
  onEdited,
}: CompetitorSummaryBannerProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(summary.summary);
  const [saveState, setSaveState] = useState<
    | { kind: 'idle' }
    | { kind: 'saving' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  function startEdit() {
    setDraft(summary.summary);
    setSaveState({ kind: 'idle' });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveState({ kind: 'idle' });
  }

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setSaveState({
        kind: 'error',
        message: 'Summary cannot be empty.',
      });
      return;
    }
    if (!summary.analysisId) {
      setSaveState({
        kind: 'error',
        message:
          'This summary cannot be edited (no row id — re-run Summarize Competitor Reviews to persist it).',
      });
      return;
    }
    setSaveState({ kind: 'saving' });
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/review-analysis/${summary.analysisId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: trimmed }),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        setSaveState({ kind: 'error', message: detail });
        return;
      }
      const body = (await res.json()) as { id: string; summary: string };
      onEdited(urlId, body.summary);
      setEditing(false);
      setSaveState({ kind: 'idle' });
    } catch (err) {
      setSaveState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    }
  }

  return (
    <div
      style={{
        background: '#0a1320',
        borderBottom: '1px solid #21262d',
        padding: '12px 14px 14px 50px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#8b949e',
            fontWeight: 700,
          }}
        >
          Per-Competitor Summary
          {summary.source === 'cache' && (
            <span
              style={{
                marginLeft: '6px',
                fontSize: '9px',
                color: '#6e7681',
              }}
            >
              (cached)
            </span>
          )}
        </div>
        {!editing && summary.analysisId && (
          <button
            type="button"
            onClick={startEdit}
            style={editButtonStyle}
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={saveState.kind === 'saving'}
            style={{
              width: '100%',
              minHeight: '160px',
              fontSize: '12px',
              color: '#e6edf3',
              background: '#0d1117',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '10px 12px',
              lineHeight: 1.6,
              fontFamily: "'IBM Plex Sans', sans-serif",
              resize: 'vertical',
              whiteSpace: 'pre-wrap',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '8px',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={saveEdit}
              disabled={saveState.kind === 'saving'}
              style={{
                ...savePrimaryStyle,
                opacity: saveState.kind === 'saving' ? 0.7 : 1,
                cursor: saveState.kind === 'saving' ? 'wait' : 'pointer',
              }}
            >
              {saveState.kind === 'saving' ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saveState.kind === 'saving'}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            {saveState.kind === 'error' && (
              <span style={{ fontSize: '11px', color: '#f85149' }}>
                {saveState.message}
              </span>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            fontSize: '12px',
            color: '#e6edf3',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
        >
          {summary.summary}
        </div>
      )}
    </div>
  );
}

const editButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#58a6ff',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '11px',
  cursor: 'pointer',
  fontWeight: 600,
};

const savePrimaryStyle: React.CSSProperties = {
  background: '#238636',
  color: '#fff',
  border: '1px solid #2ea043',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 600,
};

// ─── PerReviewSummaryCell (P-49 W5 Fix Session B, 2026-05-30; D-11) ────────
//
// The review-row "Summary" cell. Read-only display of the per-review AI
// summary + an Edit affordance mirroring the per-competitor banner (Q9 → A:
// same Edit-button pattern). Editable only when an analysisId is known
// (live run / page hydration); a missing id hides Edit (re-run to persist).
// Save PATCHes the PER_REVIEW ReviewAnalysis row via the same endpoint the
// banner uses; the handler also syncs CapturedReview.analysis so the URL
// detail "Your Analysis" box stays consistent (single source of truth).
interface PerReviewSummaryCellProps {
  projectId: string;
  reviewId: string;
  summary:
    | { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
    | undefined;
  onEdited: (reviewId: string, summary: string) => void;
}

function PerReviewSummaryCell({
  projectId,
  reviewId,
  summary,
  onEdited,
}: PerReviewSummaryCellProps): JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(summary?.summary ?? '');
  const [saveState, setSaveState] = useState<
    | { kind: 'idle' }
    | { kind: 'saving' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  function startEdit() {
    setDraft(summary?.summary ?? '');
    setSaveState({ kind: 'idle' });
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setSaveState({ kind: 'idle' });
  }

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setSaveState({ kind: 'error', message: 'Summary cannot be empty.' });
      return;
    }
    const analysisId = summary?.analysisId;
    if (!analysisId) {
      setSaveState({
        kind: 'error',
        message:
          'This summary cannot be edited yet (no row id — re-run Summarize to persist it).',
      });
      return;
    }
    setSaveState({ kind: 'saving' });
    try {
      const res = await authFetch(
        `/api/projects/${projectId}/competition-scraping/review-analysis/${analysisId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary: trimmed }),
        }
      );
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          if (body?.error) detail = body.error;
        } catch {
          // ignore
        }
        setSaveState({ kind: 'error', message: detail });
        return;
      }
      const body = (await res.json()) as { id: string; summary: string };
      onEdited(reviewId, body.summary);
      setEditing(false);
      setSaveState({ kind: 'idle' });
    } catch (err) {
      setSaveState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Network error',
      });
    }
  }

  if (editing) {
    return (
      <span style={{ display: 'block' }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saveState.kind === 'saving'}
          style={{
            width: '100%',
            minHeight: '90px',
            fontSize: '12px',
            color: '#e6edf3',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '8px 10px',
            lineHeight: 1.5,
            fontFamily: "'IBM Plex Sans', sans-serif",
            resize: 'vertical',
            whiteSpace: 'pre-wrap',
          }}
        />
        <span
          style={{
            display: 'flex',
            gap: '6px',
            marginTop: '6px',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={saveEdit}
            disabled={saveState.kind === 'saving'}
            style={{
              ...savePrimaryStyle,
              opacity: saveState.kind === 'saving' ? 0.7 : 1,
              cursor: saveState.kind === 'saving' ? 'wait' : 'pointer',
            }}
          >
            {saveState.kind === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saveState.kind === 'saving'}
            style={cancelButtonStyle}
          >
            Cancel
          </button>
          {saveState.kind === 'error' && (
            <span style={{ fontSize: '10px', color: '#f85149' }}>
              {saveState.message}
            </span>
          )}
        </span>
      </span>
    );
  }

  if (!summary) {
    return (
      <span style={{ color: '#6e7681', fontStyle: 'italic' }}>
        not summarized
      </span>
    );
  }

  return (
    <span
      style={{
        color: '#e6edf3',
        // v2 prompt emits "- bullet\n- bullet" newline-separated strings;
        // pre-wrap preserves the line breaks so each bullet shows on its
        // own line.
        whiteSpace: 'pre-wrap',
        display: 'block',
      }}
    >
      {summary.summary}
      {summary.source === 'cache' && (
        <span
          style={{
            marginLeft: '6px',
            fontSize: '9px',
            color: '#6e7681',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          (cached)
        </span>
      )}
      {summary.analysisId && (
        <button
          type="button"
          onClick={startEdit}
          style={{ ...editButtonStyle, marginLeft: '8px', padding: '2px 8px' }}
        >
          Edit
        </button>
      )}
    </span>
  );
}

const cancelButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '6px',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
};

function summarizeButtonStyle(
  state: ReviewsLoadState['kind'] | undefined
): React.CSSProperties {
  const loading = state === 'loading';
  return {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    background: loading ? '#21262d' : '#1f6feb',
    color: '#fff',
    border: '1px solid #388bfd',
    borderRadius: '6px',
    cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };
}

function competitorButtonStyle(
  state: ReviewsLoadState['kind'] | undefined
): React.CSSProperties {
  const loading = state === 'loading';
  return {
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 600,
    // Distinct color from "Summarize reviews" (blue) so director can
    // tell the two actions apart at a glance: green = competitor-level
    // aggregation, blue = per-review batch loop.
    background: loading ? '#21262d' : '#238636',
    color: '#fff',
    border: '1px solid #2ea043',
    borderRadius: '6px',
    cursor: loading ? 'wait' : 'pointer',
    opacity: loading ? 0.7 : 1,
  };
}

// ─── ReviewsList ────────────────────────────────────────────────────
//
// W#2 P-49 W5 Fix Session A (2026-05-29) — review-row click-to-edit on
// star / reviewer / date / body cells per spec §3 item 7 + Q6 → A
// (single source of truth — PATCH propagates to CapturedReview columns
// reflected on the URL detail page's reviews surface).
//
// Per-review summary cell (the "Summary" column) is click-to-edit as of
// Fix Session B (2026-05-30; D-11) — same Edit-button pattern as the per-
// competitor banner (Q9 → A). The PATCH endpoint now accepts PER_REVIEW
// edits (review-analysis-update.ts) and syncs the review's "Your Analysis"
// box. Editable only when an analysisId is known (live run / hydration).

const REVIEW_ROW_GRID = '50px 80px 1fr 140px 110px 1fr';

interface ReviewsListProps {
  projectId: string;
  urlId: string;
  state: ReviewsLoadState | undefined;
  summaryByReviewId: Record<
    string,
    { analysisId: string | null; summary: string; source: 'cache' | 'fresh' }
  >;
  onReviewCellSave: (
    urlId: string,
    reviewId: string,
    patch: UpdateCapturedReviewRequest
  ) => Promise<void>;
  onReviewSummaryEdited: (reviewId: string, summary: string) => void;
}

function ReviewsList({
  projectId,
  urlId,
  state,
  summaryByReviewId,
  onReviewCellSave,
  onReviewSummaryEdited,
}: ReviewsListProps): JSX.Element {
  if (!state || state.kind === 'idle' || state.kind === 'loading') {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          fontSize: '12px',
          color: '#8b949e',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        Loading reviews…
      </div>
    );
  }
  if (state.kind === 'error') {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        <span style={errorBoxStyle}>Failed to load: {state.message}</span>
      </div>
    );
  }
  if (state.reviews.length === 0) {
    return (
      <div
        style={{
          padding: '12px 14px 16px 50px',
          fontSize: '12px',
          color: '#8b949e',
          background: '#0a0d12',
          borderBottom: '1px solid #21262d',
        }}
      >
        No reviews captured yet for this URL.
      </div>
    );
  }
  return (
    <div style={{ background: '#0a0d12', borderBottom: '1px solid #21262d' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: REVIEW_ROW_GRID,
          fontSize: '10px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: '#6e7681',
          padding: '8px 14px 8px 50px',
          borderBottom: '1px solid #21262d',
        }}
      >
        <span></span>
        <span>Star</span>
        <span>Body</span>
        <span>Reviewer</span>
        <span>Date</span>
        <span>Summary</span>
      </div>
      {state.reviews.map((r) => {
        const summary = summaryByReviewId[r.id];
        // Per-review save bound to this row's id so each cell only needs
        // to pass its single-field patch.
        const saveCell = (patch: UpdateCapturedReviewRequest) =>
          onReviewCellSave(urlId, r.id, patch);
        return (
          <div
            key={r.id}
            style={{
              display: 'grid',
              gridTemplateColumns: REVIEW_ROW_GRID,
              padding: '10px 14px 10px 50px',
              borderBottom: '1px solid #161b22',
              alignItems: 'flex-start',
              fontSize: '12px',
              color: '#e6edf3',
              lineHeight: 1.5,
            }}
          >
            <span></span>
            <span style={{ color: '#f0b341' }}>
              <InlineNumberCell
                value={r.starRating}
                onSave={(next) =>
                  next == null
                    ? Promise.reject(new Error('Star required'))
                    : saveCell({ starRating: next })
                }
                integer
                min={1}
                max={5}
                align="left"
                formatRead={(raw) =>
                  raw == null ? null : (
                    <span style={{ color: '#f0b341' }}>{'★'.repeat(raw)}</span>
                  )
                }
              />
            </span>
            <span
              style={{
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: '#e6edf3',
              }}
            >
              <InlineTextCell
                value={r.body}
                onSave={(next) =>
                  next == null
                    ? Promise.reject(new Error('Body required'))
                    : saveCell({ body: next })
                }
                multiline
                // P-49 W5 Fix Session B (2026-05-30; Q3 → A) — read-mode
                // shows the captured headline merged with the body
                // ('title' + period-if-missing + ' ' + 'body'). Editing
                // still targets `body` only (draft seeds from value=r.body),
                // so the merge is display-time and never corrupts the
                // separate title column. Null/empty title → body alone.
                formatRead={() => mergeTitleAndBody(r.title, r.body)}
              />
            </span>
            <span style={{ color: '#8b949e' }}>
              <InlineTextCell
                value={r.reviewerName}
                onSave={(next) =>
                  saveCell({
                    reviewerName: next ?? undefined,
                  })
                }
              />
            </span>
            <span style={{ color: '#8b949e' }}>
              <InlineTextCell
                value={r.reviewDate ? r.reviewDate.slice(0, 10) : null}
                onSave={(next) =>
                  saveCell({
                    reviewDate: next ?? undefined,
                  })
                }
                placeholder="YYYY-MM-DD"
              />
            </span>
            <PerReviewSummaryCell
              projectId={projectId}
              reviewId={r.id}
              summary={summary}
              onEdited={onReviewSummaryEdited}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Page-state placeholders ────────────────────────────────────────

const errorBoxStyle: React.CSSProperties = {
  display: 'inline-block',
  background: '#3b1f1f',
  color: '#ffa198',
  padding: '6px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  border: '1px solid #5c2828',
};

interface FullPageStateProps {
  message: string;
  isError: boolean;
}

function FullPageState({ message, isError }: FullPageStateProps): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
      }}
    >
      <span style={{ color: isError ? '#f85149' : '#8b949e' }}>{message}</span>
    </div>
  );
}
