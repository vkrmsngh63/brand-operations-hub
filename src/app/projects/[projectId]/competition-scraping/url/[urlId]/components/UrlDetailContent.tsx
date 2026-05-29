'use client';

// W#2 per-URL detail page — content component (slices a.1 + a.2 + a.3).
//
// Owns four parallel reads (URL row + sizes + captured-text rows +
// captured-image rows) and renders the metadata card, sizes sub-section,
// captured-text table, and captured-images gallery. Slice (a.2) replaced
// the slice-(a.1) image-count placeholder with a thumbnail grid that
// opens the full-size viewer modal on click. Slice (a.3) replaced the
// slice-(a.1) read-only metadata grid with per-field inline editing
// (vocabulary picker for the three category/product/brand fields; numeric
// inputs for ratings + counts; key/value editor for customFields). Each
// save fires one PATCH with just the changed field; the URL row state
// here owns optimistic update + rollback on error.
//
// All four read paths are scoped server-side to the (projectId, urlId)
// pair via verifyProjectWorkflowAuth + projectWorkflowId so a forged urlId
// from another project returns 404, not the row's data.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { authFetch } from '@/lib/authFetch';
import { WorkflowTopbar } from '@/lib/workflow-components';
import type {
  CapturedImageWithUrls,
  CapturedReview,
  CapturedText,
  CapturedVideoWithUrls,
  CompetitorUrl,
  ListCapturedImagesResponse,
  ListCapturedReviewsResponse,
  ListCapturedTextsResponse,
  ListCapturedVideosResponse,
  Platform,
  ReadCompetitorUrlResponse,
  ScrapingStatus,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { ImageViewerModal } from './ImageViewerModal';
import {
  EditableBooleanField,
  EditableEnumField,
  EditableNumberField,
  EditableTextField,
  EditableVocabularyField,
} from './EditableField';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import {
  CUSTOMERS_SAY_SOURCE,
  type ReviewSortKey,
  compareReviews,
  computeStarCounts,
  filterByStarSelection,
  spliceVisibleReorderIntoFull,
  splitCustomersSay,
} from '@/lib/competition-scraping/captured-reviews-helpers';
import { CapturedTextAddModal } from '../../../components/CapturedTextAddModal';
import { CapturedImageAddModal } from '../../../components/CapturedImageAddModal';
import { CapturedReviewAddModal } from '../../../components/CapturedReviewAddModal';
import { PerItemAnalysisBox } from '../../../components/PerItemAnalysisBox';
import { OverallAnalysisBox } from '../../../components/OverallAnalysisBox';
import { ReviewsTraceabilityTable } from '../../../components/ReviewsTraceabilityTable';
import {
  ConfirmDeleteDialog,
  type CascadeCounts,
} from '../../../components/ConfirmDeleteDialog';

interface Props {
  project: { id: string; name: string };
  // userRole reserved for the future admin reset button slot on the
  // detail page; not used in slice (a.1).
  userRole: 'admin' | 'worker';
  urlId: string;
}

interface FetchSlot<T> {
  data: T | null;
  error: string | null;
}

const WORKFLOW_NAME = 'Competition Scraping & Deep Analysis';
const WORKFLOW_ICON = '🔍';

const PLATFORM_LABELS: Record<Platform, string> = {
  amazon: 'Amazon',
  ebay: 'Ebay',
  etsy: 'Etsy',
  walmart: 'Walmart',
  'google-shopping': 'Google Shopping',
  'google-ads': 'Google Ads',
  'independent-website': 'Independent Website',
};

export function UrlDetailContent({ project, urlId }: Props) {
  const router = useRouter();
  const [urlSlot, setUrlSlot] = useState<FetchSlot<CompetitorUrl>>({
    data: null,
    error: null,
  });
  const [textSlot, setTextSlot] = useState<FetchSlot<CapturedText[]>>({
    data: null,
    error: null,
  });
  const [imagesSlot, setImagesSlot] = useState<FetchSlot<CapturedImageWithUrls[]>>({
    data: null,
    error: null,
  });
  // P-27 Build #5 — captured-videos slot. The list endpoint mints per-row
  // signed URLs (videoUrl + thumbnailUrl) for DIRECT_BYTES rows; EMBED rows
  // carry null URLs and the renderer reads `originalSrcUrl` directly for
  // the inline <iframe>.
  const [videosSlot, setVideosSlot] = useState<FetchSlot<CapturedVideoWithUrls[]>>({
    data: null,
    error: null,
  });
  // P-46 Workstream 2 Session 4 (2026-05-28) — captured-reviews slot. v1
  // Reviews enter via the manual-add modal only; per-platform extension
  // capture deferred to post-P-46 polish per §A.1b.
  const [reviewsSlot, setReviewsSlot] = useState<FetchSlot<CapturedReview[]>>({
    data: null,
    error: null,
  });
  // P-49 W5 Fix Session D (2026-05-31) — latest PER_PRODUCT per-competitor
  // analysis (analysisJson) for THIS url, used to render the 3-column
  // traceability table in the "Overall Analysis — Captured Reviews" box.
  // null until the GET resolves OR when no per-competitor run has happened.
  const [reviewsAnalysisJson, setReviewsAnalysisJson] = useState<unknown>(null);
  // P-28 — URL-delete dialog state lives at the top-level component because
  // the trash button is in UrlMetadataCard but on success the whole page
  // navigates away. Cascade counts lazy-fetch on dialog open.
  const [urlDeleteOpen, setUrlDeleteOpen] = useState(false);
  const [cascadeCounts, setCascadeCounts] = useState<CascadeCounts | null>(null);
  const [cascadeError, setCascadeError] = useState<string | null>(null);

  useEffect(() => {
    if (!urlDeleteOpen) return;
    let cancelled = false;
    setCascadeCounts(null);
    setCascadeError(null);
    (async () => {
      try {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/urls/${urlId}/cascade-counts`
        );
        if (cancelled) return;
        if (!res.ok) {
          setCascadeError(`HTTP ${res.status}`);
          return;
        }
        const data = (await res.json()) as CascadeCounts;
        if (cancelled) return;
        setCascadeCounts(data);
      } catch (err) {
        if (cancelled) return;
        setCascadeError(err instanceof Error ? err.message : 'Network error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [urlDeleteOpen, project.id, urlId]);

  const handleUrlDeleteConfirm = useCallback(async (): Promise<void> => {
    const res = await authFetch(
      `/api/projects/${project.id}/competition-scraping/urls/${urlId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const detail = await readErrorMessage(res, 'Could not delete URL');
      throw new Error(detail);
    }
    // Navigate back to the workflow main page after the row is gone.
    setUrlDeleteOpen(false);
    router.push(`/projects/${project.id}/competition-scraping`);
  }, [project.id, urlId, router]);

  // P-27 — captured-text delete. The captured text subsection owns its own
  // dialog state; the parent owns the text-list state because the optimistic
  // remove + rollback both run against it.
  const handleTextDeleted = useCallback(
    async (textId: string): Promise<void> => {
      // Snapshot for rollback.
      const prevList = textSlot.data;
      if (!prevList) {
        // Nothing to remove from — let the DELETE through anyway so the
        // server-side row (if any) is cleaned up; on success we don't need
        // to update state.
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/text/${textId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const detail = await readErrorMessage(res, 'Could not delete captured text');
          throw new Error(detail);
        }
        return;
      }
      // Optimistic remove from list.
      setTextSlot({
        data: prevList.filter((t) => t.id !== textId),
        error: textSlot.error,
      });
      try {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/text/${textId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          // Rollback.
          setTextSlot({ data: prevList, error: textSlot.error });
          const detail = await readErrorMessage(res, 'Could not delete captured text');
          throw new Error(detail);
        }
      } catch (err) {
        setTextSlot({ data: prevList, error: textSlot.error });
        throw err instanceof Error ? err : new Error('Network error');
      }
    },
    [project.id, textSlot.data, textSlot.error]
  );

  // P-27 — captured-image delete. Same optimistic-remove + rollback shape.
  const handleImageDeleted = useCallback(
    async (imageId: string): Promise<void> => {
      const prevList = imagesSlot.data;
      if (!prevList) {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/images/${imageId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const detail = await readErrorMessage(res, 'Could not delete captured image');
          throw new Error(detail);
        }
        return;
      }
      setImagesSlot({
        data: prevList.filter((img) => img.id !== imageId),
        error: imagesSlot.error,
      });
      try {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/images/${imageId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          setImagesSlot({ data: prevList, error: imagesSlot.error });
          const detail = await readErrorMessage(res, 'Could not delete captured image');
          throw new Error(detail);
        }
      } catch (err) {
        setImagesSlot({ data: prevList, error: imagesSlot.error });
        throw err instanceof Error ? err : new Error('Network error');
      }
    },
    [project.id, imagesSlot.data, imagesSlot.error]
  );

  // P-46 Workstream 2 Session 4 (2026-05-28) — captured-review delete.
  // Same optimistic-remove + rollback shape as text + image; DELETE hits the
  // shallow per-record path competition-scraping/reviews/[reviewId] matching
  // text/[textId] and images/[imageId] precedent.
  const handleReviewDeleted = useCallback(
    async (reviewId: string): Promise<void> => {
      const prevList = reviewsSlot.data;
      if (!prevList) {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/reviews/${reviewId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const detail = await readErrorMessage(res, 'Could not delete review');
          throw new Error(detail);
        }
        return;
      }
      setReviewsSlot({
        data: prevList.filter((r) => r.id !== reviewId),
        error: reviewsSlot.error,
      });
      try {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/reviews/${reviewId}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          setReviewsSlot({ data: prevList, error: reviewsSlot.error });
          const detail = await readErrorMessage(res, 'Could not delete review');
          throw new Error(detail);
        }
      } catch (err) {
        setReviewsSlot({ data: prevList, error: reviewsSlot.error });
        throw err instanceof Error ? err : new Error('Network error');
      }
    },
    [project.id, reviewsSlot.data, reviewsSlot.error]
  );

  useEffect(() => {
    // No synchronous setState resets here — the lint rule
    // (react-hooks/purity) flags synchronous setState in an effect body as
    // a cascading-render risk, and there's no need: each navigation to a
    // new urlId remounts this component (Next.js App Router replaces the
    // dynamic segment, but the parent page already remounts on route
    // change). The cancelled-flag guard below still prevents a late
    // response from a stale fetch from clobbering newer state on the
    // (rare) path where the urlId prop changes without a remount.
    let cancelled = false;
    const base = `/api/projects/${project.id}/competition-scraping/urls/${urlId}`;

    const fetchOne = async <T,>(
      path: string,
      label: string
    ): Promise<{ data: T | null; error: string | null }> => {
      try {
        const res = await authFetch(path);
        if (res.status === 404) {
          return { data: null, error: `${label} not found.` };
        }
        if (!res.ok) {
          return { data: null, error: `Could not load ${label} (HTTP ${res.status}).` };
        }
        const json = (await res.json()) as T;
        return { data: json, error: null };
      } catch (e) {
        return {
          data: null,
          error: e instanceof Error ? e.message : `Could not load ${label}.`,
        };
      }
    };

    // P-46 Workstream 2 Session 5 (2026-05-23-b) — Sizes/Options fetch
    // dropped per §A.6 (hide-UI-keep-data). Schema + API endpoint remain
    // for reversibility; the client just stops paying the network cost +
    // doesn't render the section.
    // P-49 W5 Fix Session D — the per-competitor analysis list is keyed at
    // the PROJECT level (GET .../competition-scraping/review-analysis), so it
    // uses the project base rather than the per-URL `base`. We filter to the
    // latest PER_PRODUCT row for THIS url client-side.
    const projectBase = `/api/projects/${project.id}/competition-scraping`;

    (async () => {
      const [urlRes, textRes, imagesRes, videosRes, reviewsRes, analysisRes] =
        await Promise.all([
          fetchOne<ReadCompetitorUrlResponse>(base, 'this URL'),
          fetchOne<ListCapturedTextsResponse>(`${base}/text`, 'captured text'),
          fetchOne<ListCapturedImagesResponse>(`${base}/images`, 'captured images'),
          fetchOne<ListCapturedVideosResponse>(`${base}/videos`, 'captured videos'),
          fetchOne<ListCapturedReviewsResponse>(`${base}/reviews`, 'captured reviews'),
          fetchOne<{
            items: Array<{
              id: string;
              level: string;
              urlId: string | null;
              analysisJson: unknown;
            }>;
          }>(`${projectBase}/review-analysis`, 'review analysis'),
        ]);
      if (cancelled) return;
      setUrlSlot(urlRes);
      setTextSlot(textRes);
      setImagesSlot(imagesRes);
      setVideosSlot(videosRes);
      setReviewsSlot(reviewsRes);
      // Latest PER_PRODUCT row for this URL — the GET returns rows in
      // ascending runAt order, so the last match is the most recent run.
      const items = analysisRes.data?.items ?? [];
      let latest: unknown = null;
      for (const item of items) {
        if (item.level === 'PER_PRODUCT' && item.urlId === urlId) {
          latest = item.analysisJson;
        }
      }
      setReviewsAnalysisJson(latest);
    })();

    return () => {
      cancelled = true;
    };
  }, [project.id, urlId]);

  // P-29 Slice #3 — manual-add captured-image modal calls this after the
  // finalize POST succeeds. Unlike captured-text where the POST response
  // IS the wire shape the list uses, the image-finalize response is just
  // the bare CapturedImage row (no signed URLs). The list endpoint
  // mints fresh thumbnailUrl + fullSizeUrl per row, so the cleanest
  // shape is to refetch the images endpoint after a successful save.
  // One extra round-trip in exchange for not threading signed-URL minting
  // through the finalize path (which the extension also uses, and
  // shouldn't pay the cost of minting URLs it never reads).
  const refreshImages = useCallback(async (): Promise<void> => {
    const base = `/api/projects/${project.id}/competition-scraping/urls/${urlId}/images`;
    try {
      const res = await authFetch(base);
      if (res.status === 404) {
        setImagesSlot({ data: null, error: 'captured images not found.' });
        return;
      }
      if (!res.ok) {
        setImagesSlot({
          data: null,
          error: `Could not load captured images (HTTP ${res.status}).`,
        });
        return;
      }
      const data = (await res.json()) as ListCapturedImagesResponse;
      setImagesSlot({ data, error: null });
    } catch (e) {
      setImagesSlot({
        data: null,
        error: e instanceof Error ? e.message : 'Could not load captured images.',
      });
    }
  }, [project.id, urlId]);

  // P-29 Slice #2 — manual-add captured-text modal calls this with the
  // newly-created row so the table updates without a refetch round-trip.
  // POST is idempotent on clientId (extension WAL convention reused for
  // the manual-add path via crypto.randomUUID()), so a duplicate-create
  // returns the existing row with 200; we dedup here on clientId to avoid
  // double-listing. Mirrors handleUrlAdded in CompetitionScrapingViewer.
  const handleTextAdded = useCallback((row: CapturedText): void => {
    setTextSlot((prev) => {
      const list = prev.data ?? [];
      const existing = list.findIndex((r) => r.clientId === row.clientId);
      if (existing >= 0) {
        const next = [...list];
        next[existing] = row;
        return { data: next, error: prev.error };
      }
      return { data: [row, ...list], error: prev.error };
    });
  }, []);

  // P-49 Workstream 4 Session 1 — bulk-delete via the new batch-delete
  // POST. Same optimistic-remove + rollback shape as the per-row delete
  // above; one round-trip for the whole selected set per §A.6.
  const handleReviewsBulkDeleted = useCallback(
    async (reviewIds: string[]): Promise<void> => {
      if (reviewIds.length === 0) return;
      const prevList = reviewsSlot.data;
      if (prevList) {
        const idSet = new Set(reviewIds);
        setReviewsSlot({
          data: prevList.filter((r) => !idSet.has(r.id)),
          error: reviewsSlot.error,
        });
      }
      try {
        const res = await authFetch(
          `/api/projects/${project.id}/competition-scraping/reviews/batch-delete`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewIds }),
          }
        );
        if (!res.ok) {
          if (prevList) {
            setReviewsSlot({ data: prevList, error: reviewsSlot.error });
          }
          const detail = await readErrorMessage(
            res,
            'Could not delete selected reviews'
          );
          throw new Error(detail);
        }
      } catch (err) {
        if (prevList) {
          setReviewsSlot({ data: prevList, error: reviewsSlot.error });
        }
        throw err instanceof Error ? err : new Error('Network error');
      }
    },
    [project.id, reviewsSlot]
  );

  // P-49 Workstream 4 Session 1 — drag-reorder optimistic update. Assigns
  // sortRanks based on the new full order; the PUT fires from the section's
  // own debounced flush so a burst of drags collapses to one round-trip.
  const handleReviewsReordered = useCallback(
    (orderedIds: string[]): void => {
      setReviewsSlot((prev) => {
        if (!prev.data) return prev;
        const byId = new Map(prev.data.map((r) => [r.id, r]));
        const next: CapturedReview[] = [];
        orderedIds.forEach((id, idx) => {
          const row = byId.get(id);
          if (row) {
            next.push({ ...row, sortRank: idx });
            byId.delete(id);
          }
        });
        for (const row of byId.values()) next.push(row);
        return { data: next, error: prev.error };
      });
    },
    []
  );

  // P-46 Workstream 2 Session 4 (2026-05-28) — manual-add captured-review
  // modal calls this with the newly-created row. POST is idempotent on
  // clientId; we dedup here to avoid double-listing on a retry.
  const handleReviewAdded = useCallback((row: CapturedReview): void => {
    setReviewsSlot((prev) => {
      const list = prev.data ?? [];
      const existing = list.findIndex((r) => r.clientId === row.clientId);
      if (existing >= 0) {
        const next = [...list];
        next[existing] = row;
        return { data: next, error: prev.error };
      }
      return { data: [row, ...list], error: prev.error };
    });
  }, []);

  // PATCH callback used by the inline-edit fields in UrlMetadataCard.
  // Each save sends exactly one changed field. Optimistic-update model:
  // the caller has already pre-mutated `urlSlot.data` if it wants to
  // (we don't here — we wait for the server's authoritative response so
  // the displayed `updatedAt` and any normalization the server applies
  // both land in one tick). On error the caller's promise rejects with
  // an Error message that the EditableField surfaces inline; the local
  // `urlSlot.data` is unchanged so read-mode falls back to the prior
  // value automatically.
  const patchUrl = useCallback(
    async (patch: UpdateCompetitorUrlRequest) => {
      const res = await authFetch(
        `/api/projects/${project.id}/competition-scraping/urls/${urlId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      if (res.status === 404) {
        throw new Error('This URL no longer exists.');
      }
      if (res.status === 409) {
        throw new Error(
          'A URL row with that platform + address already exists for this Project.'
        );
      }
      if (!res.ok) {
        throw new Error(`Save failed (HTTP ${res.status}).`);
      }
      const updated = (await res.json()) as CompetitorUrl;
      setUrlSlot({ data: updated, error: null });
    },
    [project.id, urlId]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <WorkflowTopbar
        title={WORKFLOW_NAME}
        projectName={project.name}
        projectId={project.id}
        icon={WORKFLOW_ICON}
      />

      <main style={{ maxWidth: '100%', padding: '24px 24px 64px' }}>
        <Breadcrumb
          projectId={project.id}
          platform={urlSlot.data?.platform ?? null}
          urlText={urlSlot.data?.url ?? null}
        />

        {urlSlot.error ? (
          <ErrorPanel title="Couldn’t load this URL" body={urlSlot.error} />
        ) : urlSlot.data === null ? (
          <LoadingPanel />
        ) : (
          <>
            <UrlMetadataCard
              row={urlSlot.data}
              projectId={project.id}
              onPatch={patchUrl}
              onDeleteClick={() => setUrlDeleteOpen(true)}
            />
            <CapturedTextSubsection
              slot={textSlot}
              projectId={project.id}
              urlId={urlId}
              overallAnalysisInitial={urlSlot.data.overallAnalyses?.text ?? {}}
              onTextAdded={handleTextAdded}
              onTextDeleted={handleTextDeleted}
            />
            <CapturedImagesGallery
              slot={imagesSlot}
              projectId={project.id}
              urlId={urlId}
              overallAnalysisInitial={urlSlot.data.overallAnalyses?.image ?? {}}
              onImageAdded={refreshImages}
              onImageDeleted={handleImageDeleted}
            />
            <CapturedVideosGallery
              slot={videosSlot}
              projectId={project.id}
              urlId={urlId}
              overallAnalysisInitial={urlSlot.data.overallAnalyses?.video ?? {}}
            />
            <CapturedReviewsSection
              slot={reviewsSlot}
              projectId={project.id}
              urlId={urlId}
              overallAnalysisInitial={urlSlot.data.overallAnalyses?.reviews ?? {}}
              reviewsAnalysisJson={reviewsAnalysisJson}
              onReviewAdded={handleReviewAdded}
              onReviewDeleted={handleReviewDeleted}
              onReviewsBulkDeleted={handleReviewsBulkDeleted}
              onReviewsReordered={handleReviewsReordered}
            />
            {/* P-46 Workstream 2 Session 3 (2026-05-27) — URL-level Overall
                Competitor Analysis box at the bottom of the URL detail page.
                Persists to CompetitorUrl.overallCompetitorAnalysis via the
                urls/[urlId] PATCH route. Consumes the same RichTextEditor
                wrapper as the per-item Analysis + per-category Overall
                Analysis boxes. */}
            <OverallAnalysisBox
              apiUrl={`/api/projects/${project.id}/competition-scraping/urls/${urlId}`}
              initialContent={urlSlot.data.overallCompetitorAnalysis ?? {}}
              field={{ kind: 'overallCompetitorAnalysis' }}
              label="Overall Competitor Analysis"
              placeholder="Synthesize your overall analysis of this competitor URL across all captured items…"
              testId="url-overall-competitor-analysis"
            />
          </>
        )}
      </main>

      <ConfirmDeleteDialog
        isOpen={urlDeleteOpen}
        title="Delete this URL?"
        message={
          urlSlot.data
            ? `${shortenUrl(urlSlot.data.url, 60)} — this cannot be undone.`
            : 'This cannot be undone.'
        }
        confirmLabel="Delete URL"
        onClose={() => setUrlDeleteOpen(false)}
        onConfirm={handleUrlDeleteConfirm}
        variant={{
          kind: 'cascade',
          counts: cascadeCounts,
          countsError: cascadeError,
        }}
      />
    </div>
  );
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // fall through
  }
  return `${fallback} (HTTP ${res.status}).`;
}

// ─── Sub-components ─────────────────────────────────────────────────────

function Breadcrumb({
  projectId,
  platform,
  urlText,
}: {
  projectId: string;
  platform: Platform | null;
  urlText: string | null;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: '#8b949e',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}
    >
      <Link
        href={`/projects/${projectId}/competition-scraping`}
        style={{ color: '#58a6ff', textDecoration: 'none' }}
      >
        Competition Scraping
      </Link>
      <span>›</span>
      {platform ? (
        <Link
          href={`/projects/${projectId}/competition-scraping?platform=${platform}`}
          style={{ color: '#58a6ff', textDecoration: 'none' }}
        >
          {PLATFORM_LABELS[platform]}
        </Link>
      ) : (
        <span style={{ color: '#6e7681' }}>…</span>
      )}
      <span>›</span>
      <span
        style={{
          color: '#c9d1d9',
          maxWidth: '480px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={urlText ?? undefined}
      >
        {urlText ? shortenUrl(urlText, 60) : '…'}
      </span>
    </nav>
  );
}

function UrlMetadataCard({
  row,
  projectId,
  onPatch,
  onDeleteClick,
}: {
  row: CompetitorUrl;
  projectId: string;
  onPatch: (patch: UpdateCompetitorUrlRequest) => Promise<void>;
  onDeleteClick: () => void;
}) {
  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>
            URL
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#58a6ff',
              wordBreak: 'break-all',
              lineHeight: 1.5,
            }}
            title={row.url}
          >
            {row.url}
          </div>
        </div>
        <div
          style={{ flex: 'none', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '6px 12px',
              background: '#1f6feb',
              border: '1px solid #1f6feb',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Open original URL ↗
          </a>
          <button
            type="button"
            onClick={onDeleteClick}
            data-testid="url-detail-delete-button"
            aria-label="Delete URL"
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #da3633',
              borderRadius: '6px',
              color: '#f85149',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Delete URL
          </button>
        </div>
      </div>

      {/* P-46 Workstream 2 Session 5 (2026-05-23-b): Scraping Status toggle
          per §A.8. Bidirectional mirror with the Competition Data table's
          Status column — both surfaces read + write CompetitorUrl.scrapingStatus. */}
      <div style={{ marginBottom: '16px' }}>
        <EditableEnumField<ScrapingStatus>
          label="Scraping Status"
          value={row.scrapingStatus}
          options={SCRAPING_STATUS_OPTIONS}
          onSave={(next) => onPatch({ scrapingStatus: next })}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '12px 24px',
        }}
      >
        {/* Platform stays read-only in slice (a.3) — re-targeting a row to a
            different platform is rare + needs a confirm dialog (deferred). */}
        <ReadOnlyField label="Platform" value={PLATFORM_LABELS[row.platform]} />
        {/* P-46 Workstream 2 Session 5 (2026-05-23-b): Type field per §A.11.
            Free-text (no vocabulary autocomplete in v1); single-line input. */}
        <EditableTextField
          label="Type"
          value={row.type}
          onSave={(next) => onPatch({ type: next })}
        />
        {/* P-46 Workstream 2 Session 5 (2026-05-23-b): Price field per §A.11.
            Stored as free-text per §A.11 to accommodate "$24.99" / "From $24"
            / "Free w/ Prime"; no Decimal coercion in v1. */}
        <EditableTextField
          label="Price"
          value={row.price}
          onSave={(next) => onPatch({ price: next })}
        />
        <EditableVocabularyField
          label="Product Name"
          value={row.productName}
          onSave={(next) => onPatch({ productName: next })}
          projectId={projectId}
          vocabularyType="product-name"
        />
        <EditableVocabularyField
          label="Brand Name"
          value={row.brandName}
          onSave={(next) => onPatch({ brandName: next })}
          projectId={projectId}
          vocabularyType="brand-name"
        />
        <EditableVocabularyField
          label="Category"
          value={row.competitionCategory}
          onSave={(next) => onPatch({ competitionCategory: next })}
          projectId={projectId}
          vocabularyType="competition-category"
        />
        <EditableBooleanField
          label="Sponsored Ad"
          value={row.isSponsoredAd}
          onSave={(next) => onPatch({ isSponsoredAd: next })}
        />
        <EditableNumberField
          label="Product Stars"
          value={row.productStarRating}
          onSave={(next) => onPatch({ productStarRating: next })}
          min={0}
          max={5}
          step={0.1}
          formatRead={formatRating}
        />
        <EditableNumberField
          label="Seller Stars"
          value={row.sellerStarRating}
          onSave={(next) => onPatch({ sellerStarRating: next })}
          min={0}
          max={5}
          step={0.1}
          formatRead={formatRating}
        />
        <EditableNumberField
          label="# Product Reviews"
          value={row.numProductReviews}
          onSave={(next) => onPatch({ numProductReviews: next })}
          min={0}
          integer
          formatRead={formatCount}
        />
        <EditableNumberField
          label="# Seller Reviews"
          value={row.numSellerReviews}
          onSave={(next) => onPatch({ numSellerReviews: next })}
          min={0}
          integer
          formatRead={formatCount}
        />
        <EditableNumberField
          label="Results Page Rank"
          value={row.resultsPageRank}
          onSave={(next) => onPatch({ resultsPageRank: next })}
          min={1}
          integer
        />
        <ReadOnlyField label="Added On" value={formatDate(row.addedAt)} />
        <ReadOnlyField label="Last Updated" value={formatDate(row.updatedAt)} />
      </div>

      {/* P-46 Workstream 2 Session 5 (2026-05-23-b): Description-1 +
          Description-2 per §A.11. Both are db.Text columns — render full-
          width below the grid as multiline EditableTextField so the longer
          content has room to breathe. */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <EditableTextField
          label="Description-1"
          value={row.description1}
          onSave={(next) => onPatch({ description1: next })}
          multiline
          rows={3}
        />
        <EditableTextField
          label="Description-2"
          value={row.description2}
          onSave={(next) => onPatch({ description2: next })}
          multiline
          rows={3}
        />
      </div>

      <CustomFieldsEditor
        record={row.customFields}
        onSaveAll={(next) => onPatch({ customFields: next })}
      />
    </section>
  );
}

// P-46 Workstream 2 Session 5 (2026-05-23-b): segmented-control options for
// the Scraping Status toggle per §A.8. Two-value enum mirroring the Prisma
// `ScrapingStatus` enum at prisma/schema.prisma.
const SCRAPING_STATUS_OPTIONS: ReadonlyArray<{
  value: ScrapingStatus;
  label: string;
}> = [
  { value: 'INCOMPLETE', label: 'Incomplete' },
  { value: 'COMPLETE', label: 'Complete' },
];

// Read-only field used for Platform / Added On / Last Updated. Mirrors the
// EditableField shell visually so the card stays consistent.
function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '2px' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: '13px',
          color: value == null ? '#6e7681' : '#c9d1d9',
          fontStyle: value == null ? 'italic' : 'normal',
        }}
      >
        {value ?? '—'}
      </div>
    </div>
  );
}

type TextSortKey = 'contentCategory' | 'text' | 'addedAt';

function CapturedTextSubsection({
  slot,
  projectId,
  urlId,
  overallAnalysisInitial,
  onTextAdded,
  onTextDeleted,
}: {
  slot: FetchSlot<CapturedText[]>;
  projectId: string;
  urlId: string;
  overallAnalysisInitial: Record<string, unknown>;
  onTextAdded: (row: CapturedText) => void;
  onTextDeleted: (textId: string) => Promise<void>;
}) {
  const [sortKey, setSortKey] = useState<TextSortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  // P-27 — per-row delete dialog. pendingDelete !== null means the dialog
  // is open for that row.
  const [pendingDelete, setPendingDelete] = useState<CapturedText | null>(null);

  const handleConfirmTextDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    const row = pendingDelete;
    await onTextDeleted(row.id);
    setPendingDelete(null);
  };

  const sorted = useMemo(() => {
    if (!slot.data) return [];
    const copy = [...slot.data];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [slot.data, sortKey, sortDir]);

  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={sectionHeaderRowStyle}>
        <h2 style={sectionHeading}>
          Captured Text
          {slot.data ? (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#8b949e',
                fontWeight: 400,
              }}
            >
              ({slot.data.length})
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid="manual-add-captured-text-button"
          style={manualAddButtonStyle}
        >
          + Manually add captured text
        </button>
      </div>
      {slot.error ? (
        <InlineMessage tone="error" body={slot.error} />
      ) : slot.data === null ? (
        <InlineMessage body="Loading captured text…" />
      ) : slot.data.length === 0 ? (
        <InlineMessage body="No text captured for this URL yet. The Chrome extension's highlight-and-add gesture saves text rows here." />
      ) : (
        <div>
          {/* P-46 Workstream 2 (2026-05-25) — card layout replaces the prior
              tight table render. Each card carries the captured text +
              metadata + a per-item Analysis box (PerItemAnalysisBox). Sort
              control moves above the card list since the prior sortable
              column headers no longer exist. Shape will repeat for Captured
              Image / Video / Review in subsequent Workstream 2 sessions per
              docs/COMPETITION_DATA_V2_DESIGN.md §C.2. */}
          <CapturedTextSortControl
            sortKey={sortKey}
            sortDir={sortDir}
            onSortKeyChange={setSortKey}
            onSortDirChange={setSortDir}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sorted.map((t) => (
              <CapturedTextCard
                key={t.id}
                row={t}
                projectId={projectId}
                onDeleteClick={() => setPendingDelete(t)}
              />
            ))}
          </div>
        </div>
      )}
      {/* P-46 Workstream 2 Session 3 (2026-05-27) — per-category Overall
          Analysis box at the bottom of the Captured Text section. Persists
          to CompetitorUrl.overallAnalyses.text via the urls/[urlId] PATCH
          route. The route merges so this slot doesn't wipe sibling
          categories. */}
      <OverallAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/urls/${urlId}`}
        initialContent={overallAnalysisInitial}
        field={{ kind: 'overallAnalyses', category: 'text' }}
        label="Overall Analysis — Captured Text"
        placeholder="Synthesize your overall analysis across the captured text items above…"
        testId="overall-analysis-text"
      />
      <CapturedTextAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onTextAdded}
      />
      <ConfirmDeleteDialog
        isOpen={pendingDelete !== null}
        title="Delete this captured text row?"
        message={
          pendingDelete
            ? truncate(pendingDelete.text, 120) + ' — this cannot be undone.'
            : 'This cannot be undone.'
        }
        confirmLabel="Delete text"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmTextDelete}
        variant={{ kind: 'plain' }}
      />
    </section>
  );
}

// P-46 Workstream 2 (2026-05-25) — per-card render for one captured text row.
// Holds: content-category pill (top-right) / text body / tags row / added-at /
// trash button / PerItemAnalysisBox. Mirrors the layout pattern that
// subsequent Workstream 2 sessions will apply to Captured Image / Video /
// Review cards.
function CapturedTextCard({
  row,
  projectId,
  onDeleteClick,
}: {
  row: CapturedText;
  projectId: string;
  onDeleteClick: () => void;
}) {
  return (
    <article
      style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: '8px',
        padding: '14px 16px',
      }}
      data-testid="captured-text-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>
          {row.contentCategory ? (
            <span
              style={{
                background: '#21262d',
                padding: '2px 8px',
                borderRadius: '999px',
                color: '#e6edf3',
              }}
            >
              {row.contentCategory}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#6e7681' }}>
              (no category)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onDeleteClick}
          aria-label="Delete captured text"
          title="Delete captured text"
          data-testid="captured-text-delete-button"
          style={rowTrashButtonStyle}
        >
          🗑
        </button>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#e6edf3',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          marginBottom: '10px',
        }}
      >
        {row.text}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#8b949e',
        }}
      >
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Tags:</strong>{' '}
          {row.tags.length === 0 ? '—' : row.tags.join(', ')}
        </span>
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Added:</strong>{' '}
          {formatDate(row.addedAt)}
        </span>
      </div>
      <PerItemAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/text/${row.id}`}
        initialAnalysis={row.analysis}
        testId={`captured-text-analysis-${row.id}`}
      />
    </article>
  );
}

// Replaces the previous sortable column headers with a single dropdown
// sort control above the card list (Session 1 minimum; subsequent
// Workstream 2 sessions may refine if director wants different UX).
function CapturedTextSortControl({
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
}: {
  sortKey: TextSortKey;
  sortDir: 'asc' | 'desc';
  onSortKeyChange: (k: TextSortKey) => void;
  onSortDirChange: (d: 'asc' | 'desc') => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '12px',
        color: '#8b949e',
      }}
    >
      <span>Sort by:</span>
      <select
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as TextSortKey)}
        style={sortSelectStyle}
        data-testid="captured-text-sort-key"
      >
        <option value="contentCategory">Category</option>
        <option value="text">Text</option>
        <option value="addedAt">Added on</option>
      </select>
      <select
        value={sortDir}
        onChange={(e) => onSortDirChange(e.target.value as 'asc' | 'desc')}
        style={sortSelectStyle}
        data-testid="captured-text-sort-dir"
      >
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>
    </div>
  );
}

const sortSelectStyle: React.CSSProperties = {
  background: '#0d1117',
  color: '#e6edf3',
  border: '1px solid #30363d',
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer',
};

function CapturedImagesGallery({
  slot,
  projectId,
  urlId,
  overallAnalysisInitial,
  onImageAdded,
  onImageDeleted,
}: {
  slot: FetchSlot<CapturedImageWithUrls[]>;
  projectId: string;
  urlId: string;
  overallAnalysisInitial: Record<string, unknown>;
  onImageAdded: () => Promise<void> | void;
  onImageDeleted: (imageId: string) => Promise<void>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // P-27 — per-image delete dialog.
  const [pendingDelete, setPendingDelete] = useState<CapturedImageWithUrls | null>(
    null
  );

  const handleConfirmImageDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    await onImageDeleted(pendingDelete.id);
    setPendingDelete(null);
  };

  const images = slot.data;

  const onPrev = () => {
    if (openIndex == null || images == null || images.length === 0) return;
    setOpenIndex((openIndex - 1 + images.length) % images.length);
  };
  const onNext = () => {
    if (openIndex == null || images == null || images.length === 0) return;
    setOpenIndex((openIndex + 1) % images.length);
  };

  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div style={sectionHeaderRowStyle}>
        <h2 style={sectionHeading}>
          Captured Images
          {images ? (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#8b949e',
                fontWeight: 400,
              }}
            >
              ({images.length})
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid="manual-add-captured-image-button"
          style={manualAddButtonStyle}
        >
          + Manually add captured image
        </button>
      </div>
      {slot.error ? (
        <InlineMessage tone="error" body={slot.error} />
      ) : images === null ? (
        <InlineMessage body="Loading captured images…" />
      ) : images.length === 0 ? (
        <InlineMessage body="No images captured for this URL yet. The Chrome extension’s right-click “Save to PLOS” or region-screenshot gesture saves image rows here." />
      ) : (
        // P-46 Workstream 2 (2026-05-25 Session 2) — card list replaces the
        // prior thumbnail grid per the §C.2 card-layout precedent locked in
        // Session 1 for Captured Text. Each card carries the image + metadata
        // + a per-item Analysis box. Click on the thumbnail still opens the
        // existing full-size ImageViewerModal (prev/next nav across the list).
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {images.map((img, idx) => (
            <CapturedImageCard
              key={img.id}
              image={img}
              projectId={projectId}
              onOpen={() => setOpenIndex(idx)}
              onDeleteClick={() => setPendingDelete(img)}
            />
          ))}
        </div>
      )}
      {openIndex != null && images && images[openIndex] ? (
        <ImageViewerModal
          key={images[openIndex].id}
          image={images[openIndex]}
          index={openIndex}
          total={images.length}
          onClose={() => setOpenIndex(null)}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : null}
      {/* P-46 Workstream 2 Session 3 (2026-05-27) — per-category Overall
          Analysis box at the bottom of the Captured Images section. */}
      <OverallAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/urls/${urlId}`}
        initialContent={overallAnalysisInitial}
        field={{ kind: 'overallAnalyses', category: 'image' }}
        label="Overall Analysis — Captured Images"
        placeholder="Synthesize your overall analysis across the captured images above…"
        testId="overall-analysis-image"
      />
      <CapturedImageAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          void onImageAdded();
        }}
      />
      <ConfirmDeleteDialog
        isOpen={pendingDelete !== null}
        title="Delete this captured image?"
        message={
          pendingDelete
            ? (pendingDelete.imageCategory ?? 'This image') +
              ' — this cannot be undone.'
            : 'This cannot be undone.'
        }
        confirmLabel="Delete image"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmImageDelete}
        variant={{ kind: 'plain' }}
      />
    </section>
  );
}

// P-46 Workstream 2 (2026-05-25 Session 2) — per-card render for one captured
// image row. Mirrors CapturedTextCard from Session 1: pill (imageCategory)
// top-left + trash top-right + image hero (click opens existing full-size
// modal) + metadata rows + PerItemAnalysisBox at the bottom.
function CapturedImageCard({
  image,
  projectId,
  onOpen,
  onDeleteClick,
}: {
  image: CapturedImageWithUrls;
  projectId: string;
  onOpen: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <article
      style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: '8px',
        padding: '14px 16px',
      }}
      data-testid="captured-image-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '10px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>
          {image.imageCategory ? (
            <span
              style={{
                background: '#21262d',
                padding: '2px 8px',
                borderRadius: '999px',
                color: '#e6edf3',
              }}
            >
              {image.imageCategory}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#6e7681' }}>
              (no category)
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onDeleteClick}
          aria-label="Delete captured image"
          title="Delete captured image"
          data-testid="captured-image-delete-button"
          style={rowTrashButtonStyle}
        >
          🗑
        </button>
      </div>
      <div style={{ maxWidth: '320px', marginBottom: '10px' }}>
        <ThumbnailButton image={image} onOpen={onOpen} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '4px',
        }}
      >
        {image.composition ? (
          <span>
            <strong style={{ color: '#6e7681', fontWeight: 600 }}>
              Composition:
            </strong>{' '}
            {image.composition}
          </span>
        ) : null}
        {image.embeddedText ? (
          <span>
            <strong style={{ color: '#6e7681', fontWeight: 600 }}>
              Embedded text:
            </strong>{' '}
            {image.embeddedText}
          </span>
        ) : null}
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Tags:</strong>{' '}
          {image.tags.length === 0 ? '—' : image.tags.join(', ')}
        </span>
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Added:</strong>{' '}
          {formatDate(image.addedAt)}
        </span>
      </div>
      <PerItemAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/images/${image.id}`}
        initialAnalysis={image.analysis}
        testId={`captured-image-analysis-${image.id}`}
      />
    </article>
  );
}

// P-27 Build #5 — captured-videos gallery section on the URL detail page.
// Mirrors the image gallery's shape (section header + count + loading/error/
// empty + card list).
//
// P-46 Workstream 2 (2026-05-25 Session 2) — converted to the same vertical
// card-list layout as Captured Text + Captured Image per the §C.2 precedent.
// Each card now carries the inline player + metadata + a per-item Analysis
// box (PerItemAnalysisBox). Per-row delete dialog still deferred (matches
// Build #5's scope — no per-video delete in v1).
function CapturedVideosGallery({
  slot,
  projectId,
  urlId,
  overallAnalysisInitial,
}: {
  slot: FetchSlot<CapturedVideoWithUrls[]>;
  projectId: string;
  urlId: string;
  overallAnalysisInitial: Record<string, unknown>;
}) {
  const videos = slot.data;
  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div style={sectionHeaderRowStyle}>
        <h2 style={sectionHeading}>
          Captured Videos
          {videos ? (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#8b949e',
                fontWeight: 400,
              }}
            >
              ({videos.length})
            </span>
          ) : null}
        </h2>
      </div>
      {slot.error ? (
        <InlineMessage tone="error" body={slot.error} />
      ) : videos === null ? (
        <InlineMessage body="Loading captured videos…" />
      ) : videos.length === 0 ? (
        <InlineMessage body="No videos captured for this URL yet. The Chrome extension’s right-click “Save to PLOS” gesture on a video or YouTube/Vimeo embed, or the popup’s “Paste captured video” form, saves video rows here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {videos.map((v) => (
            <CapturedVideoCard key={v.id} video={v} projectId={projectId} />
          ))}
        </div>
      )}
      {/* P-46 Workstream 2 Session 3 (2026-05-27) — per-category Overall
          Analysis box at the bottom of the Captured Videos section. */}
      <OverallAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/urls/${urlId}`}
        initialContent={overallAnalysisInitial}
        field={{ kind: 'overallAnalyses', category: 'video' }}
        label="Overall Analysis — Captured Videos"
        placeholder="Synthesize your overall analysis across the captured videos above…"
        testId="overall-analysis-video"
      />
    </section>
  );
}

// P-46 Workstream 2 (2026-05-25 Session 2) — per-card render for one captured
// video row. Mirrors CapturedTextCard + CapturedImageCard: pill (videoCategory)
// top-left + inline player + metadata rows + PerItemAnalysisBox at the bottom.
//
// Renders an inline <iframe> for EMBED rows (YouTube / Vimeo / etc. — the
// platform's own player serves the thumbnail + play button) and an inline
// <video controls> for DIRECT_BYTES / SCREEN_RECORDING rows (browser's native
// player serves the click-to-play affordance; the thumbnail signed URL feeds
// the poster attribute, with a generic ▶️ fallback when thumbnailUrl is null
// per §A.12).
function CapturedVideoCard({
  video,
  projectId,
}: {
  video: CapturedVideoWithUrls;
  projectId: string;
}) {
  return (
    <article
      style={{
        background: '#0d1117',
        border: '1px solid #21262d',
        borderRadius: '8px',
        padding: '14px 16px',
      }}
      data-testid="captured-video-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '10px',
        }}
      >
        <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>
          {video.videoCategory ? (
            <span
              style={{
                background: '#21262d',
                padding: '2px 8px',
                borderRadius: '999px',
                color: '#e6edf3',
              }}
            >
              {video.videoCategory}
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#6e7681' }}>
              (no category)
            </span>
          )}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          aspectRatio: '16 / 9',
          background: '#000',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '10px',
        }}
      >
        {video.sourceType === 'EMBED' ? (
          <iframe
            src={video.originalSrcUrl}
            title={video.videoCategory ?? 'Captured video'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        ) : video.videoUrl ? (
          <video
            controls
            preload="metadata"
            poster={video.thumbnailUrl ?? undefined}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#000',
            }}
          >
            <source
              src={video.videoUrl}
              type={video.mimeType ?? undefined}
            />
            Your browser doesn’t support inline video playback.
          </video>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f85149',
              fontSize: '12px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            Video unavailable — storage path missing.
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '12px',
          color: '#8b949e',
          marginBottom: '4px',
        }}
      >
        {video.composition ? (
          <span>
            <strong style={{ color: '#6e7681', fontWeight: 600 }}>
              Composition:
            </strong>{' '}
            {video.composition}
          </span>
        ) : null}
        {video.embeddedText ? (
          <span>
            <strong style={{ color: '#6e7681', fontWeight: 600 }}>
              Embedded text:
            </strong>{' '}
            {video.embeddedText}
          </span>
        ) : null}
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Tags:</strong>{' '}
          {video.tags.length === 0 ? '—' : video.tags.join(', ')}
        </span>
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Added:</strong>{' '}
          {formatDate(video.addedAt)}
        </span>
      </div>
      <PerItemAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/videos/${video.id}`}
        initialAnalysis={video.analysis}
        testId={`captured-video-analysis-${video.id}`}
      />
    </article>
  );
}

// P-46 Workstream 2 Session 4 (2026-05-28) — Captured Reviews section.
// Greenfield UI for the fourth and final capture type. Slots into the same
// card-list precedent Sessions 1-3 set for Text / Image / Video; v1 Reviews
// enter through the manual-add modal only (no extension Reviews capture in
// v1 per §A.1b). The Overall Reviews Analysis box at the bottom of the
// section reuses Session 3's OverallAnalysisBox with category='reviews'.
// P-49 Workstream 4 Session 1 — pure helpers + the `CUSTOMERS_SAY_SOURCE`
// discriminator + the `ReviewSortKey` type live in
// `@/lib/competition-scraping/captured-reviews-helpers` (loadable by
// node:test without the React component tree). Imported at top of file.

// Debounce window for the reorder PUT — collapses a burst of drag events
// (e.g., dragging a card three slots before releasing) into one network
// round-trip. Mirrors PREFS_DEBOUNCE_MS from CompetitionScrapingViewer.
const REORDER_DEBOUNCE_MS = 500;

function CapturedReviewsSection({
  slot,
  projectId,
  urlId,
  overallAnalysisInitial,
  reviewsAnalysisJson,
  onReviewAdded,
  onReviewDeleted,
  onReviewsBulkDeleted,
  onReviewsReordered,
}: {
  slot: FetchSlot<CapturedReview[]>;
  projectId: string;
  urlId: string;
  overallAnalysisInitial: Record<string, unknown>;
  reviewsAnalysisJson: unknown;
  onReviewAdded: (row: CapturedReview) => void;
  onReviewDeleted: (reviewId: string) => Promise<void>;
  onReviewsBulkDeleted: (reviewIds: string[]) => Promise<void>;
  onReviewsReordered: (orderedIds: string[]) => void;
}) {
  const [sortKey, setSortKey] = useState<ReviewSortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CapturedReview | null>(null);
  // P-49 W4 S1 — star-count counter-bar filter state per §A.14. An empty set
  // means "show all stars"; non-empty means OR semantics across selected.
  const [selectedStars, setSelectedStars] = useState<Set<number>>(new Set());
  // P-49 W4 S1 — bulk-select state per §A.6. Selection survives sort changes
  // but is pruned to currently-visible reviews when filter shrinks the set.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  // P-49 W4 S1 — split Customers-say AI-summary rows out of the main list.
  // These render as a separate banner above the counter-bar; they are not
  // selectable, not reorderable, and not counted in the per-star bar.
  const { customersSay: customersSayRows, main: mainReviews } = useMemo(() => {
    return splitCustomersSay(slot.data ?? []);
  }, [slot.data]);

  // P-49 W4 S1 — per-star counts for the counter-bar. Counts come from the
  // FULL mainReviews list (not the filtered set) so the bar always shows the
  // product's full distribution regardless of what's currently filtered.
  const starCounts = useMemo(
    () => computeStarCounts(mainReviews),
    [mainReviews]
  );

  const filtered = useMemo<CapturedReview[]>(
    () => filterByStarSelection(mainReviews, selectedStars),
    [mainReviews, selectedStars]
  );

  const sorted = useMemo<CapturedReview[]>(() => {
    const copy = [...filtered];
    copy.sort((a, b) => compareReviews(a, b, sortKey, sortDir));
    return copy;
  }, [filtered, sortKey, sortDir]);

  // Prune any selectedIds that fall out of the visible set when the filter
  // tightens. Without this, the "Delete N selected" toolbar would still
  // report N counting rows the user can't see — confusing UX.
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const visibleIds = new Set(sorted.map((r) => r.id));
      const pruned = new Set(
        Array.from(prev).filter((id) => visibleIds.has(id))
      );
      if (pruned.size === prev.size) return prev;
      return pruned;
    });
  }, [sorted]);

  const handleConfirmReviewDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    const row = pendingDelete;
    await onReviewDeleted(row.id);
    setPendingDelete(null);
  };

  const toggleStar = useCallback((star: number) => {
    setSelectedStars((prev) => {
      const next = new Set(prev);
      if (next.has(star)) next.delete(star);
      else next.add(star);
      return next;
    });
  }, []);
  const clearStarFilter = useCallback(() => {
    setSelectedStars(new Set());
  }, []);

  const toggleReviewSelected = useCallback((reviewId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });
  }, []);
  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(sorted.map((r) => r.id)));
  }, [sorted]);
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedIds.size === 0) {
      setBulkConfirmOpen(false);
      return;
    }
    setBulkPending(true);
    setBulkError(null);
    try {
      await onReviewsBulkDeleted(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkConfirmOpen(false);
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setBulkPending(false);
    }
  }, [selectedIds, onReviewsBulkDeleted]);

  // P-49 W4 S1 — debounced reorder PUT per §A.5. Reusing the
  // P-46 W3 S3 (2026-05-23-f) shared debounced-mutation Pattern so a burst
  // of drags collapses to one round-trip.
  const reorderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushReorder = useCallback(
    async (orderedIds: string[]) => {
      const orderings = orderedIds.map((reviewId, idx) => ({
        reviewId,
        sortRank: idx,
      }));
      try {
        await authFetch(
          `/api/projects/${projectId}/competition-scraping/urls/${urlId}/reviews/reorder`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderings }),
          }
        );
      } catch {
        // Silent failure; local state stays consistent with the optimistic
        // update so the user sees their order. The next mutation retries.
      }
    },
    [projectId, urlId]
  );
  useEffect(() => {
    return () => {
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
    };
  }, []);

  // P-49 W4 S1 — pointer sensor with a 4px activation distance prevents the
  // drag handle from swallowing a tap (matches UrlTable's drag handle).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = sorted.findIndex((r) => r.id === active.id);
      const newIndex = sorted.findIndex((r) => r.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const newVisibleIds = arrayMove(sorted, oldIndex, newIndex).map(
        (r) => r.id
      );
      const fullOrderedIds = spliceVisibleReorderIntoFull(
        newVisibleIds,
        mainReviews
      );
      onReviewsReordered(fullOrderedIds);
      setSortKey('manual');
      if (reorderTimerRef.current) clearTimeout(reorderTimerRef.current);
      reorderTimerRef.current = setTimeout(() => {
        void flushReorder(fullOrderedIds);
      }, REORDER_DEBOUNCE_MS);
    },
    [sorted, mainReviews, onReviewsReordered, flushReorder]
  );

  const totalDisplayed = customersSayRows.length + mainReviews.length;
  const showFilterEmpty = mainReviews.length > 0 && sorted.length === 0;

  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={sectionHeaderRowStyle}>
        <h2 style={sectionHeading}>
          Captured Reviews
          {slot.data ? (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '12px',
                color: '#8b949e',
                fontWeight: 400,
              }}
            >
              ({totalDisplayed})
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid="manual-add-captured-review-button"
          style={manualAddButtonStyle}
        >
          + Add review
        </button>
      </div>
      {slot.error ? (
        <InlineMessage tone="error" body={slot.error} />
      ) : slot.data === null ? (
        <InlineMessage body="Loading captured reviews…" />
      ) : totalDisplayed === 0 ? (
        <InlineMessage body="No reviews captured for this URL yet. Click + Add review above to enter one manually." />
      ) : (
        <div>
          {customersSayRows.length > 0 ? (
            <CustomersSayBanner rows={customersSayRows} />
          ) : null}
          {mainReviews.length > 0 ? (
            <StarCountCounterBar
              counts={starCounts}
              selected={selectedStars}
              onToggle={toggleStar}
              onClearAll={clearStarFilter}
            />
          ) : null}
          {mainReviews.length > 0 ? (
            <BulkSelectionToolbar
              visibleCount={sorted.length}
              selectedCount={selectedIds.size}
              onSelectAll={selectAllVisible}
              onClearSelection={clearSelection}
              onBulkDeleteClick={() => {
                setBulkError(null);
                setBulkConfirmOpen(true);
              }}
            />
          ) : null}
          {mainReviews.length > 0 ? (
            <CapturedReviewSortControl
              sortKey={sortKey}
              sortDir={sortDir}
              onSortKeyChange={setSortKey}
              onSortDirChange={setSortDir}
            />
          ) : null}
          {showFilterEmpty ? (
            <InlineMessage
              body="No reviews match the current star filter. Click a highlighted star above (or Clear all) to widen the filter."
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sorted.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  {sorted.map((r) => (
                    <CapturedReviewCard
                      key={r.id}
                      row={r}
                      projectId={projectId}
                      selected={selectedIds.has(r.id)}
                      onToggleSelected={() => toggleReviewSelected(r.id)}
                      onDeleteClick={() => setPendingDelete(r)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
      {/* P-49 W5 Fix Session D (2026-05-31) — the per-competitor bulleted
          AI output renders as a READ-ONLY 3-column traceability table
          (Category / Complaint / source reviews + star counts) on TOP of
          the box, per director's 2026-05-30 §1 addendum. Renders nothing
          until a per-competitor run exists; falls back to the legacy
          free-text summary for pre-v4 rows. */}
      <ReviewsTraceabilityTable
        analysisJson={reviewsAnalysisJson}
        reviews={slot.data ?? []}
        testId="reviews-traceability-table"
      />
      {/* P-46 Workstream 2 Session 4 (2026-05-28) — the free-text notes area
          BELOW the table. Persists to CompetitorUrl.overallAnalyses.reviews
          via the urls/[urlId] PATCH route (the route merges so this slot
          doesn't wipe sibling categories). Relabeled "Your notes" in Fix
          Session D since the AI critique now lives in the table above; any
          legacy free-text the prior write-back appended here is preserved. */}
      <OverallAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/urls/${urlId}`}
        initialContent={overallAnalysisInitial}
        field={{ kind: 'overallAnalyses', category: 'reviews' }}
        label="Your notes — Captured Reviews"
        placeholder="Add your own notes across the captured reviews here…"
        testId="overall-analysis-reviews"
      />
      <CapturedReviewAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onReviewAdded}
      />
      <ConfirmDeleteDialog
        isOpen={pendingDelete !== null}
        title="Delete this review?"
        message={
          pendingDelete
            ? truncate(pendingDelete.body, 120) + ' — this cannot be undone.'
            : 'This cannot be undone.'
        }
        confirmLabel="Delete review"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmReviewDelete}
        variant={{ kind: 'plain' }}
      />
      <ConfirmDeleteDialog
        isOpen={bulkConfirmOpen}
        title={`Delete ${selectedIds.size} selected review${selectedIds.size === 1 ? '' : 's'}?`}
        message={
          bulkError
            ? `${bulkError} — try again or close this dialog.`
            : bulkPending
              ? 'Deleting…'
              : 'This cannot be undone.'
        }
        confirmLabel={
          bulkPending
            ? 'Deleting…'
            : `Delete ${selectedIds.size} review${selectedIds.size === 1 ? '' : 's'}`
        }
        onClose={() => {
          if (bulkPending) return;
          setBulkConfirmOpen(false);
          setBulkError(null);
        }}
        onConfirm={handleBulkDeleteConfirm}
        variant={{ kind: 'plain' }}
      />
    </section>
  );
}

// P-49 W4 S1 — per §A.14 counter-bar replacing the prior multi-select
// dropdown shape. Each button shows the star count + the number of reviews
// at that rating; clicking toggles a filter on the list. Active buttons are
// visually highlighted. "Clear all" appears only when any star is active.
function StarCountCounterBar({
  counts,
  selected,
  onToggle,
  onClearAll,
}: {
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  selected: Set<number>;
  onToggle: (star: number) => void;
  onClearAll: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
      }}
      data-testid="captured-review-star-counter-bar"
    >
      {([1, 2, 3, 4, 5] as const).map((star) => {
        const active = selected.has(star);
        return (
          <button
            type="button"
            key={star}
            onClick={() => onToggle(star)}
            data-testid={`captured-review-star-bucket-${star}`}
            aria-pressed={active}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '14px',
              border: `1px solid ${active ? '#388bfd' : '#30363d'}`,
              background: active ? '#1f6feb' : '#0d1117',
              color: active ? '#ffffff' : '#c9d1d9',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span style={{ color: '#f9c74f' }}>★{star}</span>
            <span style={{ color: active ? '#ffffff' : '#8b949e' }}>
              ({counts[star]})
            </span>
          </button>
        );
      })}
      {selected.size > 0 ? (
        <button
          type="button"
          onClick={onClearAll}
          data-testid="captured-review-star-clear"
          style={{
            padding: '4px 10px',
            background: 'transparent',
            border: '1px solid #30363d',
            color: '#8b949e',
            borderRadius: '14px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}

// P-49 W4 S1 — per §A.6 multi-select toolbar. Renders the select-all-visible
// affordance + the bulk-delete trigger + a "clear selection" escape hatch.
// Always visible whenever main reviews exist (mirrors the pattern in Captured
// Text / Image sections where action affordances stay visible at zero so the
// user discovers them).
function BulkSelectionToolbar({
  visibleCount,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkDeleteClick,
}: {
  visibleCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDeleteClick: () => void;
}) {
  const allSelected = selectedCount > 0 && selectedCount === visibleCount;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
        fontSize: '12px',
        color: '#8b949e',
      }}
      data-testid="captured-review-bulk-toolbar"
    >
      <button
        type="button"
        onClick={allSelected ? onClearSelection : onSelectAll}
        disabled={visibleCount === 0}
        data-testid="captured-review-bulk-select-all"
        style={{
          padding: '4px 10px',
          background: 'transparent',
          border: '1px solid #30363d',
          color: '#c9d1d9',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: visibleCount === 0 ? 'not-allowed' : 'pointer',
          opacity: visibleCount === 0 ? 0.5 : 1,
        }}
      >
        {allSelected ? 'Clear selection' : `Select all visible (${visibleCount})`}
      </button>
      {selectedCount > 0 ? (
        <>
          <span data-testid="captured-review-bulk-count">
            {selectedCount} selected
          </span>
          <button
            type="button"
            onClick={onBulkDeleteClick}
            data-testid="captured-review-bulk-delete-button"
            style={{
              padding: '4px 12px',
              background: '#da3633',
              border: '1px solid #f85149',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete {selectedCount} selected
          </button>
        </>
      ) : null}
    </div>
  );
}

// P-49 W4 S1 — Customers-say banner rendered above the counter-bar per §A.14
// trade-off resolution: AI-summary rows (source="extension-scrape:customers-say"
// from W2 Session 2's `customersSay` capture, with starRating=5 sentinel) are
// rendered separately so they neither inflate the 5-star bucket count nor
// participate in drag-reorder / bulk-select.
function CustomersSayBanner({ rows }: { rows: CapturedReview[] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '12px',
      }}
      data-testid="captured-review-customers-say-banner"
    >
      {rows.map((row) => (
        <article
          key={row.id}
          style={{
            background: '#161b22',
            border: '1px solid #1f6feb',
            borderLeft: '4px solid #1f6feb',
            borderRadius: '6px',
            padding: '10px 12px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#58a6ff',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '6px',
            }}
          >
            Customers say (Amazon AI summary)
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#e6edf3',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {row.body}
          </div>
        </article>
      ))}
    </div>
  );
}

function CapturedReviewCard({
  row,
  projectId,
  selected,
  onToggleSelected,
  onDeleteClick,
}: {
  row: CapturedReview;
  projectId: string;
  selected: boolean;
  onToggleSelected: () => void;
  onDeleteClick: () => void;
}) {
  // P-49 W4 S1 — useSortable for drag-to-reorder. The transform style mirrors
  // the @dnd-kit recipe + the UrlTable.tsx precedent from P-46 W3 S3
  // (2026-05-23-f). The drag handle is the small ⋮⋮ glyph below; the rest of
  // the card stays unaffected by drags.
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    zIndex: isDragging ? 2 : 'auto',
  };
  return (
    <article
      ref={setNodeRef}
      style={{
        background: '#0d1117',
        border: `1px solid ${selected ? '#1f6feb' : '#21262d'}`,
        borderRadius: '8px',
        padding: '14px 16px',
        ...dragStyle,
      }}
      data-testid="captured-review-card"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelected}
            aria-label={selected ? 'Deselect review' : 'Select review'}
            data-testid="captured-review-bulk-checkbox"
            style={{ cursor: 'pointer' }}
          />
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            data-testid="captured-review-drag-handle"
            style={{
              padding: '0 4px',
              background: 'transparent',
              border: 'none',
              color: '#6e7681',
              cursor: 'grab',
              fontSize: '16px',
              lineHeight: 1,
              touchAction: 'none',
            }}
          >
            ⋮⋮
          </button>
          <StarRatingDisplay value={row.starRating} />
          {row.reviewerName ? (
            <span style={{ fontSize: '13px', color: '#c9d1d9', fontWeight: 600 }}>
              {row.reviewerName}
            </span>
          ) : (
            <span style={{ fontSize: '12px', color: '#6e7681', fontStyle: 'italic' }}>
              (anonymous)
            </span>
          )}
          {row.reviewDate ? (
            <span style={{ fontSize: '12px', color: '#8b949e' }}>
              {formatDate(row.reviewDate)}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDeleteClick}
          aria-label="Delete review"
          title="Delete review"
          data-testid="captured-review-delete-button"
          style={rowTrashButtonStyle}
        >
          🗑
        </button>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#e6edf3',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          marginBottom: '10px',
        }}
      >
        {row.body}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#8b949e',
        }}
      >
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Tags:</strong>{' '}
          {row.tags.length === 0 ? '—' : row.tags.join(', ')}
        </span>
        <span>
          <strong style={{ color: '#6e7681', fontWeight: 600 }}>Added:</strong>{' '}
          {formatDate(row.addedAt)}
        </span>
      </div>
      <PerItemAnalysisBox
        apiUrl={`/api/projects/${projectId}/competition-scraping/reviews/${row.id}`}
        initialAnalysis={row.analysis}
        testId={`captured-review-analysis-${row.id}`}
      />
    </article>
  );
}

function StarRatingDisplay({ value }: { value: number }) {
  return (
    <span
      style={{ display: 'inline-flex', gap: '2px', color: '#f9c74f', fontSize: '15px' }}
      aria-label={`${value} of 5 stars`}
      title={`${value} of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= value ? '#f9c74f' : '#30363d' }}>
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

function CapturedReviewSortControl({
  sortKey,
  sortDir,
  onSortKeyChange,
  onSortDirChange,
}: {
  sortKey: ReviewSortKey;
  sortDir: 'asc' | 'desc';
  onSortKeyChange: (k: ReviewSortKey) => void;
  onSortDirChange: (d: 'asc' | 'desc') => void;
}) {
  const isManual = sortKey === 'manual';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        fontSize: '12px',
        color: '#8b949e',
      }}
    >
      <span>Sort by:</span>
      <select
        value={sortKey}
        onChange={(e) => onSortKeyChange(e.target.value as ReviewSortKey)}
        style={sortSelectStyle}
        data-testid="captured-review-sort-key"
      >
        <option value="addedAt">Added on</option>
        <option value="starRating">Star rating</option>
        {/* P-49 W4 S1 — only render the manual option when the section is
            already in manual mode (drag-reorder already happened). Keeps
            the picker uncluttered for users who haven't dragged yet. */}
        {isManual ? <option value="manual">Manual (drag order)</option> : null}
      </select>
      {/* The asc/desc selector is meaningless in manual mode — the persisted
          sortRank already encodes the user's chosen order. Hide it instead
          of showing a no-op control. */}
      {isManual ? null : (
        <select
          value={sortDir}
          onChange={(e) => onSortDirChange(e.target.value as 'asc' | 'desc')}
          style={sortSelectStyle}
          data-testid="captured-review-sort-dir"
        >
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      )}
    </div>
  );
}

function ThumbnailButton({
  image,
  onOpen,
}: {
  image: CapturedImageWithUrls;
  onOpen: () => void;
}) {
  const [errored, setErrored] = useState(false);
  const altLabel =
    image.imageCategory ??
    (image.sourceType === 'region-screenshot' ? 'Region screenshot' : 'Captured image');
  return (
    <button
      type="button"
      onClick={onOpen}
      title={altLabel}
      aria-label={`Open full-size view of ${altLabel}`}
      style={{
        position: 'relative',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '6px',
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '1 / 1',
        display: 'block',
      }}
    >
      {errored ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f85149',
            fontSize: '11px',
            textAlign: 'center',
            padding: '8px',
          }}
        >
          Image failed to load
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.thumbnailUrl}
          alt={altLabel}
          loading="lazy"
          onError={() => setErrored(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      )}
      {image.sourceType === 'region-screenshot' ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: 'rgba(13,17,23,0.85)',
            color: '#8b949e',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #30363d',
          }}
        >
          screenshot
        </span>
      ) : null}
    </button>
  );
}

function LoadingPanel() {
  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '48px 16px',
        textAlign: 'center',
        color: '#8b949e',
        fontSize: '13px',
      }}
    >
      Loading URL…
    </div>
  );
}

function ErrorPanel({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '14px', color: '#f85149', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ fontSize: '13px', color: '#8b949e' }}>{body}</div>
    </div>
  );
}

function InlineMessage({
  body,
  tone,
}: {
  body: string;
  tone?: 'error';
}) {
  return (
    <div
      style={{
        padding: '12px 0',
        fontSize: '13px',
        color: tone === 'error' ? '#f85149' : '#8b949e',
      }}
    >
      {body}
    </div>
  );
}

// ─── Style helpers ──────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#e6edf3',
  margin: '0 0 12px 0',
};

const sectionHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '4px',
};

const manualAddButtonStyle: React.CSSProperties = {
  background: '#238636',
  border: '1px solid rgba(240, 246, 252, 0.10)',
  color: '#ffffff',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '12px',
  fontWeight: 500,
  padding: '5px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

// P-27 — per-row trash button in the captured-text table.
const rowTrashButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '4px',
  color: '#8b949e',
  fontSize: '14px',
  lineHeight: '14px',
  cursor: 'pointer',
  padding: '4px 8px',
};

// ─── Formatters ─────────────────────────────────────────────────────────

function formatRating(value: number | null): string | null {
  return value == null ? null : value.toFixed(1);
}

function formatCount(value: number | null): string | null {
  return value == null ? null : value.toLocaleString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function shortenUrl(url: string, max = 80): string {
  const trimmed = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return trimmed.length > max ? `${trimmed.slice(0, max - 3)}…` : trimmed;
}

// P-27 — short-form preview of a captured text row for the confirm dialog.
function truncate(text: string, max: number): string {
  const single = text.replace(/\s+/g, ' ').trim();
  return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}
