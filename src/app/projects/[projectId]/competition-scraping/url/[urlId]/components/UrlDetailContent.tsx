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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { WorkflowTopbar } from '@/lib/workflow-components';
import type {
  CapturedImageWithUrls,
  CapturedText,
  CompetitorSize,
  CompetitorUrl,
  ListCapturedImagesResponse,
  ListCapturedTextsResponse,
  ListCompetitorSizesResponse,
  Platform,
  ReadCompetitorUrlResponse,
  UpdateCompetitorUrlRequest,
} from '@/lib/shared-types/competition-scraping';
import { ImageViewerModal } from './ImageViewerModal';
import {
  EditableBooleanField,
  EditableNumberField,
  EditableVocabularyField,
} from './EditableField';
import { CustomFieldsEditor } from './CustomFieldsEditor';
import { CapturedTextAddModal } from '../../../components/CapturedTextAddModal';
import { CapturedImageAddModal } from '../../../components/CapturedImageAddModal';

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
  const [urlSlot, setUrlSlot] = useState<FetchSlot<CompetitorUrl>>({
    data: null,
    error: null,
  });
  const [sizesSlot, setSizesSlot] = useState<FetchSlot<CompetitorSize[]>>({
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

    (async () => {
      const [urlRes, sizesRes, textRes, imagesRes] = await Promise.all([
        fetchOne<ReadCompetitorUrlResponse>(base, 'this URL'),
        fetchOne<ListCompetitorSizesResponse>(`${base}/sizes`, 'sizes'),
        fetchOne<ListCapturedTextsResponse>(`${base}/text`, 'captured text'),
        fetchOne<ListCapturedImagesResponse>(`${base}/images`, 'captured images'),
      ]);
      if (cancelled) return;
      setUrlSlot(urlRes);
      setSizesSlot(sizesRes);
      setTextSlot(textRes);
      setImagesSlot(imagesRes);
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

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 32px 64px' }}>
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
            />
            <SizesSubsection slot={sizesSlot} />
            <CapturedTextSubsection
              slot={textSlot}
              projectId={project.id}
              urlId={urlId}
              onTextAdded={handleTextAdded}
            />
            <CapturedImagesGallery
              slot={imagesSlot}
              projectId={project.id}
              urlId={urlId}
              onImageAdded={refreshImages}
            />
          </>
        )}
      </main>
    </div>
  );
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
}: {
  row: CompetitorUrl;
  projectId: string;
  onPatch: (patch: UpdateCompetitorUrlRequest) => Promise<void>;
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
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 'none',
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

      <CustomFieldsEditor
        record={row.customFields}
        onSaveAll={(next) => onPatch({ customFields: next })}
      />
    </section>
  );
}

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

function SizesSubsection({ slot }: { slot: FetchSlot<CompetitorSize[]> }) {
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
      <h2 style={sectionHeading}>Sizes / Options</h2>
      {slot.error ? (
        <InlineMessage tone="error" body={slot.error} />
      ) : slot.data === null ? (
        <InlineMessage body="Loading sizes…" />
      ) : slot.data.length === 0 ? (
        <InlineMessage body="No sizes captured for this URL yet." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle('left')}>Size / Option</th>
                <th style={thStyle('right')}>Price</th>
                <th style={thStyle('right')}>Shipping Cost</th>
                <th style={thStyle('right')}>Added On</th>
              </tr>
            </thead>
            <tbody>
              {slot.data.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={cellStyle('left')}>{s.sizeOption}</td>
                  <td style={cellStyle('right')}>{formatMoney(s.price)}</td>
                  <td style={cellStyle('right')}>{formatMoney(s.shippingCost)}</td>
                  <td style={cellStyle('right')}>{formatDate(s.addedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

type TextSortKey = 'contentCategory' | 'text' | 'addedAt';

function CapturedTextSubsection({
  slot,
  projectId,
  urlId,
  onTextAdded,
}: {
  slot: FetchSlot<CapturedText[]>;
  projectId: string;
  urlId: string;
  onTextAdded: (row: CapturedText) => void;
}) {
  const [sortKey, setSortKey] = useState<TextSortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);

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

  const onHeader = (key: TextSortKey, defaultDir: 'asc' | 'desc') => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(defaultDir);
    }
  };

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
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <SortableHeader
                  label="Content Category"
                  active={sortKey === 'contentCategory'}
                  dir={sortDir}
                  onClick={() => onHeader('contentCategory', 'asc')}
                />
                <SortableHeader
                  label="Text"
                  active={sortKey === 'text'}
                  dir={sortDir}
                  onClick={() => onHeader('text', 'asc')}
                />
                <th style={thStyle('left')}>Tags</th>
                <SortableHeader
                  label="Added On"
                  align="right"
                  active={sortKey === 'addedAt'}
                  dir={sortDir}
                  onClick={() => onHeader('addedAt', 'desc')}
                />
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={cellStyle('left')}>{t.contentCategory ?? '—'}</td>
                  <td style={textCellStyle}>{t.text}</td>
                  <td style={cellStyle('left')}>
                    {t.tags.length === 0 ? '—' : t.tags.join(', ')}
                  </td>
                  <td style={cellStyle('right')}>{formatDate(t.addedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CapturedTextAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onTextAdded}
      />
    </section>
  );
}

function CapturedImagesGallery({
  slot,
  projectId,
  urlId,
  onImageAdded,
}: {
  slot: FetchSlot<CapturedImageWithUrls[]>;
  projectId: string;
  urlId: string;
  onImageAdded: () => Promise<void> | void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {images.map((img, idx) => (
            <ThumbnailButton
              key={img.id}
              image={img}
              onOpen={() => setOpenIndex(idx)}
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
      <CapturedImageAddModal
        projectId={projectId}
        urlId={urlId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          void onImageAdded();
        }}
      />
    </section>
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

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  align,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
  align?: 'left' | 'right';
}) {
  const arrow = !active ? '' : dir === 'asc' ? ' ▲' : ' ▼';
  return (
    <th
      onClick={onClick}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={{
        ...thStyle(align ?? 'left'),
        cursor: 'pointer',
        userSelect: 'none',
        color: active ? '#e6edf3' : '#8b949e',
      }}
    >
      {label}
      <span style={{ color: '#1f6feb' }}>{arrow}</span>
    </th>
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

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

function thStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '8px 10px',
    borderBottom: '1px solid #30363d',
    color: '#8b949e',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
}

function cellStyle(align: 'left' | 'right'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '8px 10px',
    color: '#c9d1d9',
    fontVariantNumeric: align === 'right' ? 'tabular-nums' : 'normal',
    maxWidth: '320px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
}

const textCellStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  color: '#c9d1d9',
  // Captured text rows can be long sentences/paragraphs — wrap them rather
  // than truncating, so the user can read the snippet without expanding.
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxWidth: '480px',
  lineHeight: 1.5,
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

function formatMoney(decimalString: string | null): string {
  if (decimalString == null) return '—';
  // Decimal columns serialize as a string from the wire. We render as-is to
  // preserve precision; locale-formatted display can come at a future
  // slice once currency is captured per-Project.
  return decimalString;
}

function shortenUrl(url: string, max = 80): string {
  const trimmed = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  return trimmed.length > max ? `${trimmed.slice(0, max - 3)}…` : trimmed;
}
