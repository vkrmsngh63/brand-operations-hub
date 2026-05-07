'use client';

// W#2 per-URL detail page — content component (slice a.1).
//
// Owns four parallel reads (URL row + sizes + captured-text rows +
// captured-image rows) and renders the metadata card, sizes sub-section,
// captured-text table, and image-count placeholder. Image rendering itself
// is slice (a.2)'s job; this slice fetches the image list only to display
// the count.
//
// All four read paths are scoped server-side to the (projectId, urlId)
// pair via verifyProjectWorkflowAuth + projectWorkflowId so a forged urlId
// from another project returns 404, not the row's data.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '@/lib/authFetch';
import { WorkflowTopbar } from '@/lib/workflow-components';
import type {
  CapturedImage,
  CapturedText,
  CompetitorSize,
  CompetitorUrl,
  ListCapturedImagesResponse,
  ListCapturedTextsResponse,
  ListCompetitorSizesResponse,
  Platform,
  ReadCompetitorUrlResponse,
} from '@/lib/shared-types/competition-scraping';

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
  const [imagesSlot, setImagesSlot] = useState<FetchSlot<CapturedImage[]>>({
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
            <UrlMetadataCard row={urlSlot.data} />
            <SizesSubsection slot={sizesSlot} />
            <CapturedTextSubsection slot={textSlot} />
            <ImageCountPlaceholder slot={imagesSlot} />
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

function UrlMetadataCard({ row }: { row: CompetitorUrl }) {
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
        <Field label="Platform" value={PLATFORM_LABELS[row.platform]} />
        <Field label="Product Name" value={row.productName} />
        <Field label="Brand Name" value={row.brandName} />
        <Field label="Category" value={row.competitionCategory} />
        <Field label="Product Stars" value={formatRating(row.productStarRating)} />
        <Field label="Seller Stars" value={formatRating(row.sellerStarRating)} />
        <Field
          label="# Product Reviews"
          value={formatCount(row.numProductReviews)}
        />
        <Field
          label="# Seller Reviews"
          value={formatCount(row.numSellerReviews)}
        />
        <Field
          label="Results Page Rank"
          value={row.resultsPageRank == null ? null : String(row.resultsPageRank)}
        />
        <Field label="Added On" value={formatDate(row.addedAt)} />
        <Field label="Last Updated" value={formatDate(row.updatedAt)} />
      </div>

      {Object.keys(row.customFields).length > 0 ? (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px' }}>
            Custom fields
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '6px 24px',
            }}
          >
            {Object.entries(row.customFields).map(([k, v]) => (
              <div key={k} style={{ fontSize: '13px', color: '#c9d1d9' }}>
                <span style={{ color: '#8b949e' }}>{k}:</span>{' '}
                {typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
                  ? String(v)
                  : JSON.stringify(v)}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field({
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

function CapturedTextSubsection({ slot }: { slot: FetchSlot<CapturedText[]> }) {
  const [sortKey, setSortKey] = useState<TextSortKey>('addedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

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
    </section>
  );
}

function ImageCountPlaceholder({
  slot,
}: {
  slot: FetchSlot<CapturedImage[]>;
}) {
  let body: string;
  let tone: 'normal' | 'error' = 'normal';
  if (slot.error) {
    body = slot.error;
    tone = 'error';
  } else if (slot.data === null) {
    body = 'Loading captured images…';
  } else if (slot.data.length === 0) {
    body =
      'No images captured for this URL yet. The Chrome extension’s right-click "Save to PLOS" or region-screenshot gesture saves image rows here.';
  } else {
    body = `${slot.data.length} image${slot.data.length === 1 ? '' : 's'} captured for this URL — full-size viewer ships in slice (a.2).`;
  }
  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h2 style={sectionHeading}>Captured Images</h2>
      <InlineMessage tone={tone === 'error' ? 'error' : undefined} body={body} />
    </section>
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
